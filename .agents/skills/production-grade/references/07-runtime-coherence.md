# 07 — Runtime-coherent infrastructure

The catalogue R15 reaches for. The body of `SKILL.md` holds the *principle* (no scaffolding the runtime can't sustain); this file holds the *runtime classes* and the runtime-coherent equivalents to reach for instead of the in-process default.

Every infra primitive — cache, KV, rate-limiter, in-memory store, dataloader, websocket, file-system write, long-lived connection, background timer, in-process queue, cron — must be coherent with the runtime model it executes in. **Before adding any primitive, ask: *does this runtime sustain shared state across invocations?***

## Contents

§0 · choosing the runtime class · §A · the four runtime classes · §B · the smell test · §C · named anti-patterns · §D · routing in the R1 plan

---

## §0 · Choosing the runtime class

Before applying §A–§D, select the runtime class that fits the workload. Name the workload shape in the R1 plan before choosing the substrate.

| Workload shape | Reach for | Why |
|---|---|---|
| Stateless request→response, variable/spiky volume | Fresh-isolate (A.1) | Pay-per-invocation; scales to zero; no idle cost |
| Long-lived connections (WebSockets, SSE), shared in-process state, predictable sustained load | Long-lived process (A.2) | Connection reuse; in-process state is real; per-request latency is lower |
| Latency-sensitive, globally distributed, read-heavy, no Node-API dependency | Edge (A.3) | Close to the user; millisecond cold-start; limited API surface |
| Scheduled, queued, or fire-and-forget work with no request context | Background (A.4) | Separate scaling, separate health check, separate lifecycle |

When cost dominates at low/spiky volume → fresh-isolate wins. When per-request latency or connection reuse dominates at steady volume → long-lived wins. When global distribution matters and the API surface is small → edge wins. When the work outlives the request → background.

---

## §A · The four runtime classes

### A.1 · Fresh-isolate-per-request (the no-shared-state runtimes)

**Examples:** Vercel Functions · AWS Lambda · Cloudflare Workers · most serverless · Netlify Functions · Google Cloud Run (with `min-instances: 0`).

**What evaporates:** in-process caches, in-process counters, in-process rate-limiters, module-scoped state, in-process dataloader caches across requests, in-process queues, in-memory dedup sets, in-memory websocket maps, in-process cron, in-process background timers.

**Why:** the runtime spins up a fresh isolate per request (or pools them so loosely the cache hit rate is statistically zero). Anything shared across invocations needs an out-of-process store.

**Reach for instead:**

| Want | Use (ranked) |
|---|---|
| Cache | Upstash Redis · Vercel KV · Cloudflare KV · Cloudflare Cache API · the DB itself with TTL · CDN caching headers |
| Counter / dedup / rate-limit | Upstash Ratelimit · Cloudflare Durable Objects · Vercel KV with atomic ops · the DB with `SELECT … FOR UPDATE` or `INSERT … ON CONFLICT` |
| Pub-sub / fan-out | Upstash QStash · AWS SNS/SQS · Cloudflare Queues · Inngest · Trigger.dev |
| Background work | Vercel Cron · Cloudflare Cron Triggers · Inngest · Trigger.dev · Upstash QStash · AWS EventBridge |
| Websockets | Cloudflare Durable Objects · Pusher · Ably · Pubnub · a separate long-lived service (see A.2) |
| Long-lived state machine | Cloudflare Durable Objects · Inngest · Temporal · AWS Step Functions |
| Sessions | the DB · Redis · NextAuth's database adapter (not the in-memory one) |

**Or skip the layer entirely.** A "cache" with a 0% hit rate is worse than no cache: it pays the lookup cost without the saving. If the runtime can't sustain it and the alternative is overkill for the use case, ship without the layer and document why.

### A.2 · Long-lived process (the shared-state-is-real runtimes)

**Examples:** Node server (`node server.js` · `pm2`) · ECS task · Kubernetes pod · Fly.io machine · `bun --hot` dev · Deno Deploy regions with sticky routing · Render web service · Railway service.

**What is real:** in-process caches, in-process counters, in-process rate-limiters, module-scoped state, in-process dataloader caches.

**What still bites:** **multi-replica drift** (replica A's cache disagrees with replica B's), **process restart** (the cache cold-starts on every deploy), **memory pressure** (an unbounded cache eats the process RAM and the OOM-killer wins).

**Discipline:**

- Bound every cache: **LRU + TTL + max-size**. The size is a function of the process's actual memory budget *and* the replica count.
- Treat every restart as cold-start. If cold-start hurts, layer a shared cache (Redis) underneath the in-process one — read-through.
- For per-user / per-tenant state that must be globally consistent across replicas, route to an external store *anyway*. The in-process layer is an L1; the truth lives in L2.
- Never assume the same replica gets the same client. Affinity ≠ guarantee.

### A.3 · Edge runtimes (the no-Node-API runtimes)

**Examples:** Cloudflare Workers · Deno Deploy · Vercel Edge Runtime · Bun on edge · Fastly Compute@Edge.

**What's missing:** Node-only APIs (`fs` · `child_process` · `net` · most of `crypto`'s Node-specific surface) · native modules · long-lived background work · process-level globals across regions.

**Reach for instead:**

| Want | Use |
|---|---|
| KV / blob storage | Cloudflare KV / R2 · Vercel Blob · Deno KV |
| Database | Cloudflare D1 · Neon (HTTP driver) · PlanetScale (HTTP) · Supabase (edge functions) · Turso · Upstash |
| Queues | Cloudflare Queues · Upstash QStash · Inngest |
| Crypto | Web Crypto API (`crypto.subtle`) — never `crypto.createHash` (Node) on edge |
| File ops | R2 / Blob · never `fs.writeFile` |
| HTTP client | `fetch` — never `axios`, never `node-fetch` (often uses Node primitives) |
| Time | The platform's clock; assume regions diverge by <1s but plan for clock skew |

The canonical libraries are the platform's own (KV / D1 / R2 / queues), not the Node ecosystem's defaults.

### A.4 · Background work (the no-request-context primitives)

**Cron, schedules, queue consumers, batch jobs, webhooks-with-retries.**

If the runtime hosts long-lived workers (A.2), spawn them properly: separate process, separate health check, separate scaling rules.

If the runtime does *not* host long-lived workers (A.1, A.3), **route to the platform's scheduler or an external one** — never spawn timers inside request handlers (`setTimeout` inside a Lambda is a no-op the moment the response returns).

| Concern | Use (ranked) |
|---|---|
| Scheduled jobs | Vercel Cron · Cloudflare Cron Triggers · GitHub Actions schedules · AWS EventBridge · k8s CronJob |
| Async work after a response | Inngest · Trigger.dev · Upstash QStash · AWS SQS + Lambda · BullMQ on a real queue |
| Webhook receivers with retries | Svix-style relay · QStash · the platform's own (e.g. Stripe's hosted retries — don't re-implement) |
| Long-running stateful workflows | Temporal · Inngest · Trigger.dev · AWS Step Functions · Cloudflare Durable Objects + Workflows |

---

## §B · The smell test, before any infra primitive

Three questions, every time:

1. **Does this runtime sustain the shared state this primitive needs?** If no → reach for an out-of-process equivalent or skip.
2. **What's the failure mode on cold-start / scale-out / restart?** If "the cache cold-starts and the next request takes 10s" is unacceptable → layer in an L2.
3. **Is there a runtime-coherent platform primitive I should use instead?** Cloudflare's KV is not a Redis replacement; it's a Cloudflare-native alternative that knows about the runtime. Reach platform-first.

If any answer is *"I don't know"* → the answer is not "ship and find out." It's "find out before ship." (M3 — context first, every channel.)

---

## §C · The named anti-patterns (cross-ref `05-anti-patterns.md`)

- **In-process cache on a fresh-isolate runtime.** It looks like rigour and ships as a no-op. The cache hit rate is ~0%; the latency is ~lookup-overhead.
- **In-process rate-limiter on a fresh-isolate runtime.** Same shape. The "rate limit" only applies to requests that happen to land on the same isolate within its lifetime.
- **In-process counter** for analytics / billing / quota on a fresh-isolate runtime. Loses count on every cold-start.
- **`setTimeout` / `setInterval` inside a request handler on a fresh-isolate runtime.** Cancelled the moment the response returns.
- **Module-scoped maps** holding per-user state on a fresh-isolate runtime. Inconsistent across invocations; data leak risk if the isolate *is* re-used and a different user lands on it.
- **Node-API library on edge.** `axios`, `node-fetch`, `crypto.createHash`, `fs.*`, `Buffer` (on some edge runtimes), most ORMs that ship native bindings.
- **Unbounded in-process cache on a long-lived runtime.** Real until OOM.
- **In-process websocket map on multi-replica long-lived runtime.** Replica A doesn't know about replica B's clients.
- **Cron via `setInterval(…, 24*60*60*1000)`** inside a web service. Dies on every restart; misfires by hours after a few days. Use a real scheduler.

---

## §D · How the routing decision shows up in the plan (R1 link)

The R1 plan checklist already covers *Approach* and *Risks*. When the plan touches infra:

```
Plan additions for R15:
- [ ] Runtime class identified (A.1 / A.2 / A.3 / A.4)
- [ ] Each shared-state primitive named: { what, where, why coherent with runtime }
- [ ] Cold-start / scale-out / restart failure mode covered
- [ ] Platform-native alternative checked first; if rejected, one-line reason
```

When the plan answers all four, R15 is satisfied. When it can't, the gap is *named* in the plan, not silently shipped.

---

*Anchors: R15, V35, S25, S41. Cross-ref: `05-anti-patterns.md` §Performance + §Code-structure for the inverse, `06-canonical-references.md` §A for routing.*

*Search keywords: runtime, coherence, cache, KV, rate-limiter, isolate, long-lived, edge, background, fake cache, Vercel, Lambda, Cloud Functions, Workers, Upstash, Redis, durable object, cron, websocket, in-memory, dataloader, fresh isolate.*
