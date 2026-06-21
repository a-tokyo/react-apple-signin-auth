# 05 — Anti-patterns the agent will not produce

Each item is a hard "do not produce." When the agent is about to produce one, it stops, surfaces the conflict, and asks.

**Priority tiers for self-verification (R1 gate):**
- **Hard stop** (verify every diff): SQL injection, secrets in code, timing-unsafe secret comparison, `any` types, N+1 queries, non-idempotent writes, missing tests, check-then-act races, naive datetime, floating-point money.
- **Strong signal** (verify when in domain): schema without indexes, missing down-migration, happy-path-only, untyped env vars, wrong data structure, polling over push, missing timeouts, premature abstraction, public endpoint without rate limit, locking without concurrent test, logs-only observability (no metrics).
- **Code quality** (verify when relevant): naming, over-commenting, verbose variables, try-catch overuse, async contagion, variant conditionals, dead code, monkey-patching test doubles.

## Contents

Type safety · Database · Performance · Code structure · AI / LLM integration · Testing · Documentation · Tooling · Refactoring · PRs and commits · Security · Runtime coherence (R15) · Currency (M3) · Maintenance and remediation (R16) · Agent's own behaviour · Handling pre-existing anti-patterns

---

## Type safety

- **`any` · `as any` · `as unknown as` · `any` imported from a `.d.ts`.** Use `unknown` + a narrowing function. Broken third-party type → small ambient declaration.
- **`as` casts that lose type safety.** `as` is for narrowing already proved by a guard, not "TS is wrong, trust me."
- **Type duplication.** If `User` is in `@/types/user`, import — don't redeclare inline.
- **Return-type omission on exported functions.** Every exported function has an explicit return type. Inference fine for internal closures.
- **Mutable types where the contract is read-only.** `readonly`, `Readonly<>`, `as const`, `satisfies` — mutability is opt-in, not the default.
- **Untyped environment variables.** Type the boundary once — `env.d.ts`, validated config module, or the framework's env API. One source of truth, typed everywhere downstream.

## Database

- **N+1 queries.** Every loop touching the DB → batched fetch · joined query · dataloader · explicit bounded `N ≤ k`.
- **Schema without indexes in the same migration.** Three migrations for one feature is the wrong shape.
- **Index without a documented access pattern.** Comment naming the query: `// supports: getUserFeed (user_id, created_at DESC)`.
- **Sequential scan on a hot path.** `EXPLAIN ANALYZE` showing `Seq Scan` on a frequent query → blocker.
- **ORDER BY without a deterministic tie-breaker.** Add a unique column (usually the primary key) as the final sort key. Without it, rows with equal sort values return in arbitrary order across runs, pages, and DB engines.
- **Naive datetime handling.** Store points-in-time as UTC (or epoch); store calendar dates as date-only without time component. Never compare or sort datetimes from different timezone sources without normalizing to UTC first. `new Date()` is local time — make the UTC conversion explicit.
- **Floating-point arithmetic for money/currency.** Use integer-minor-units (cents), a decimal type (`NUMERIC` / `Decimal` / `BigDecimal`), or a money library. `0.1 + 0.2 !== 0.3` — rounding errors compound across invoices, line items, and tax calculations.
- **Migration without a down-migration.** Irreversible → say so explicitly + get confirmation.
- **Deletion without a retention strategy.** Soft delete (timestamped nullable column, active-by-default filter) vs hard delete with cascade — the choice is a design decision, not an afterthought. No table ships without a documented deletion path.
- **Schema migration without a data migration plan.** Adding a non-nullable column, changing a column type, splitting/merging tables, or renaming a field with existing data requires: the backfill strategy (bounded batches, not one giant UPDATE), the deploy sequence (expand → migrate → contract), the dual-write window (if any), and the rollback path. Schema migrations and data migrations are separate artifacts.
- **Entities designed in isolation.** Model relationships as a graph — who connects to whom, what traversals will queries need. Ghost/placeholder entities (e.g., a stub user pre-registration to hold a social-graph edge) and adjacency patterns are legitimate first-class schema tools. Ask "how will I traverse this?" before finalising a schema.

## Performance

- **Wrong data structure for the access pattern.** Array scan where a `Set`/`Map` gives O(1), unsorted iteration where a priority queue gives O(log n) priority access, linear search where a trie gives prefix matching. The data structure is the first design decision — pick it before writing the algorithm.
- **"We'll optimize later."** Never build an N+1 because never build an N+1.
- **Editing a hot path without re-checking complexity.** Re-run the perf check on that path *as part of the edit*.
- **Premature *micro*-optimization.** Forward-optimization is algorithmic and architectural. Hand-tuning a function the profiler hasn't pointed at is still anti-pattern.
- **Offset pagination on unbounded lists.** Use cursor/keyset pagination — O(1) seek regardless of depth.
- **Write endpoint without idempotency.** Idempotency keys for client-initiated creates, `INSERT … ON CONFLICT` for server-side upserts.
- **External call without an explicit timeout.** Every outgoing HTTP/RPC/DB call has a timeout. A missing timeout on a slow downstream turns one service's latency spike into a cascading failure across the call chain.
- **Connection pool without bounded size and error-path release.** Every pool (`pg.Pool`, HTTP agent, Redis client) has a max-size matching the runtime's capacity. Every checkout has a `finally` release — a leaked connection on an error path silently exhausts the pool under load.
- **Bare retry loop for external calls.** Exponential backoff with jitter, capped retries, typed terminal-failure error. Check if the ecosystem provides a retry primitive first.
- **Unbounded transaction.** Chunk background work into bounded transactions. One giant transaction blocks writers and risks lock-timeout cascades.
- **Cache without an invalidation strategy.** Every `cache.set` must have a documented invalidation path: TTL (with a justified duration), event-driven invalidation (on write, publish cache-bust), or versioned keys. Name the cache pattern — cache-aside, read-through, write-through — so reviewers know the consistency guarantee.
- **Polling when the substrate supports push.** Subscriptions, WebSockets, SSE, change streams, live queries — if the substrate has a push primitive, polling is the wrong shape.
- **Check-then-act / TOCTOU.** Validate uniqueness in one call, create in another = race condition. Atomic operations only — `INSERT … ON CONFLICT`, conditional updates, compare-and-swap. If two calls are needed, wrap in a transaction with appropriate isolation.
- **Sequential where concurrent is safe.** Independent I/O (parallel fetches, fan-out to microservices, concurrent DB queries on separate tables) defaults to concurrent dispatch. Sequential only when a data dependency demands ordering. Concurrency limits and backpressure are explicit. `Promise.all` vs `Promise.allSettled` (or language equivalent) is a conscious choice based on error semantics — fail-fast vs partial-success.

## Code structure

- **Ad-hoc error casts** (`Error & { statusCode }`, `throw new Error("not found")` without a typed hierarchy). Domain errors are discriminated unions with string-literal codes; infra errors are separate. The caller must be able to `switch` on the error. Error messages are actionable: name the entity, the operation, and what went wrong — never `"Error occurred"` or `"Something went wrong"`. Never leak internal state, stack traces, or DB details to external consumers.
- **Unnecessary backwards compatibility in greenfield / pre-MVP / version upgrade.** Backwards compatibility is a production concern for existing consumers, not a default. Pre-MVP, internal tools, version bumps, and breaking-change releases (semver major) don't need compatibility shims. The agent evaluates: are there existing consumers on the old contract? If no, break cleanly. If yes, version the API or migrate.
- **Try-catch at every function boundary.** Catch at the boundary that can handle or translate the error — not at every call site in between. `try { ... } catch (e) { throw e }` is a no-op. Let errors propagate to the layer that owns the response.
- **`async` on a function with no `await`.** The keyword earns its place at the first await. A synchronous function marked `async` adds a microtask tick, returns a wrapped Promise, and misleads readers about I/O.
- **Over-verbose variable names.** `userDataResponseFromApiEndpoint` when `user` suffices. Names should be as long as their scope demands and as short as clarity allows — match the codebase's naming density.
- **Deeply nested control flow.** Guard clause, early return, extract function. Two levels of nesting is the ceiling.
- **`temp` · `data` · `result` · `value` · `obj` · `item`** unless a more specific noun is genuinely unavailable. Verb vocabulary is intentional: match the codebase first; when no convention exists, `get` = synchronous/cached, `find` = may return null, `load` = async I/O, `fetch` = network, `create` vs `build`, `remove` vs `delete` vs `destroy` each convey different lifecycle semantics.
- **Magic numbers and strings.** `100`, `'active'`, `30000`, `3` scattered through code. Extract to a named constant at the top of the file or a dedicated config/constants module with a one-line comment explaining the value. When a constant has a domain derivation (physics, geometry, protocol spec), document the derivation — `const HALF_EARTH_KM = 10008; // circumference/2 adjusted for decay` is self-verifying; `10008` alone is not.
- **Comments narrating what the code does.** Comments only explain intent, trade-offs, constraints.
- **Commented-out code.** Git remembers.
- **Unstructured logging.** `console.log` scattered through handlers. Structured log format with level and correlation ID — one logger, configured once, imported everywhere. `console.log` in committed code → removed before commit.
- **`TODO` without an issue link.** `TODO(JIRA-123): ...` or resolve before commit.
- **Dead code.** Unreferenced exports, unreachable branches, orphaned files → removed in the same PR.
- **Paradigm mixing in a single module.** Class with no methods, functional code inside a DI-decorated module, OOP patterns in a functional codebase. Match the paradigm — class-based (SOLID, GoF) or functional (pure functions, pipelines), not both in one file.
- **Reinventing a named design pattern.** When the shape is Strategy, Observer, Factory, Builder, Decorator, Singleton-via-DI — name it, use the canonical shape. Ad-hoc unnamed versions are harder to recognise and maintain.
- **Premature abstraction.** Interface + abstract class + factory when a plain function or single class would do. Abstraction earns its cost at the second consumer, not the first.
- **Deduplicating code that will diverge.** Two handlers look identical today but serve different use cases — don't extract a shared helper. The wrong abstraction is worse than duplication; each case should be free to evolve independently.
- **Variant selection via conditional chains.** `if (size === 'xs') return 't13'; else if (size === 'sm') ...` — use a lookup map: `const MAP = { xs: 't13', sm: 't12' }; return MAP[size]`. More readable, more extensible, less error-prone.
- **Happy-path-only implementation.** Code that works for non-null, non-empty, positive values but crashes on edge cases. Handle null, empty, zero, boundary, and concurrent access in the implementation — not just the tests.
- **Missing resource cleanup.** Subscriptions, event listeners, intervals, file handles, DB connections without a matching release in the lifecycle hook (`useEffect` cleanup, `OnModuleDestroy`, `defer`, `finally`). Every acquire has a release.
- **API routes without a version prefix in greenfield.** `/users` → `/v1/users`. Version from day one in new projects; in existing codebases, match the existing routing pattern.
- **Inconsistent HTTP semantics.** POST creates (201 + Location), PUT replaces (200/204), PATCH updates, DELETE removes (204). Don't default everything to 200/400/500 — use the status vocabulary (201, 204, 404, 409, 422). Error responses carry a consistent envelope (`{ error: { code, message, details? } }`). Pagination responses carry `{ data, cursor, hasMore }` — never a bare array.
- **Risky feature without a kill switch.** When the change touches payments, auth, a critical user flow, or a new external integration — ship behind a feature flag with a kill switch. Experiment flags have an expiry and a cleanup ticket; ops flags are permanent. Test both flag states.
- **Logs-only observability.** Structured logging is necessary but insufficient for production. Request rate (counter), processing latency (histogram), error rate (counter by code), and queue depth (gauge) are separate from logs — they power dashboards and alerts. At minimum, expose a `/metrics` endpoint or document the deferral.
- **Service without health and readiness endpoints.** Liveness probe (process alive, no dependency check) and readiness probe (can serve traffic — DB connected, migrations applied). A health check that tests downstream dependencies belongs in readiness, not liveness — a failing dependency shouldn't trigger a restart loop.
- **No graceful shutdown handler.** Check the framework's current best practices for graceful shutdown — drain, release, exit.
- **Observable surfaces treated as afterthoughts.** SEO (JSON-LD structured data, meta tags, sitemaps, canonical URLs), accessibility (ARIA, keyboard navigation, semantic HTML), and performance budgets are first-class architecture — designed alongside the feature, not bolted on after. Structured data should be typed and generated from a single source of truth, not scattered as hardcoded strings.
- **Loop where a closed-form exists.** Iterating 1 to n when `n*(n+1)/2` gives O(1). Summing a geometric series in a loop when the formula is `a*(1-r^n)/(1-r)`. Before writing the loop, ask: is there a mathematical identity? Classify the problem structure (graph, DP/induction, number theory, combinatorics) before implementing.
- **Cargo-culting a fancier algorithm.** Dijkstra when BFS works, segment tree when a sparse table suffices, custom data structure when the stdlib has one. Reach for the simplest algorithm that meets the complexity bound — the textbook solution before the novel one.
- **Distributed system without naming the tradeoff.** Crossing a process boundary without stating CAP position, consistency model, failure mode, or retry strategy. Name the tradeoff before choosing the architecture.
- **Cross-system identifiers without a documented mapping.** When an ID crosses a service or language boundary, a mapping table (which system owns the ID, which field, which format, who writes, who reads) ships with the integration code. Undocumented cross-stack identifiers drift silently.
- **Crash without re-queue on transient failure.** When background work fails on a transient error (network timeout, lock contention, rate limit), re-queue with backoff. User-initiated work is never silently dropped — the failure path either retries or surfaces a clear status to the user.

## AI / LLM integration

- **Inline prompt strings.** Prompts are code — version-tracked, named, in dedicated modules with typed input/output schemas. Never concatenated inside a controller or service method.
- **No output validation on LLM responses.** Use structured output (JSON schema mode, tool-use, typed response format) with runtime validation. Never trust the shape — validate and retry on malformed output with a capped retry count.
- **Hardcoded model identifier at call sites.** Model name is a config choice (feature flag, env var, config module), not a string literal scattered through the codebase. Abstract behind a provider layer so switching models is a config change.
- **Monolithic LLM call module.** Separate the LLM call (prompt + schema + parse — pure function) from the orchestration (iteration, file I/O, progress, concurrency). This makes LLM calls testable, swappable, and reusable.
- **Trusting LLM output as ground truth.** Verify LLM-generated references against the actual database or source of truth. Hallucinated entities get caught and reclassified, not passed to consumers.
- **No cost/token awareness.** Token budget is architecture — input truncation strategy, max-output-tokens, cost tracking per request. Unbounded prompts with no token ceiling are a cost and latency risk.
- **Unbounded tool-call loop.** Agent tool-calling loops have a max-iterations cap and a graceful fallback (inject "finalize without tools" instruction). Infinite loops are the failure mode.
- **Mixing deterministic and probabilistic operations.** Apply fast, rule-based cleanup (regex, dedup, normalization) before expensive LLM calls. The LLM handles judgment; deterministic code handles mechanics.

## Testing

- **"Tests to follow."** Tests ship in the same PR. TDD posture: define the contract first, implement to satisfy it.
- **Missing E2E for a new endpoint or flow.** E2E tests verify the full request→response→side-effect path. They are the primary delivery verification — unit tests alone are not sufficient for backend flows.
- **Shallow E2E that only checks response shape.** Deep E2E asserts side-effects: read back from DB, verify notifications, check audit records. `expect(res.status).toBe(200)` alone is a health check.
- **Test auth shortcuts** (`req.user = fakeUser`, skipping middleware). Tests use the same auth path as production.
- **Test-order dependency.** Every test starts from a clean state. Leaking state between tests is a flaky-test factory.
- **`it("works")` · `it("test 1")`.** Test names read as sentences: `it("returns an empty array when the user has no posts")`.
- **`expect(true).toBe(true)`.** Every `expect` proves a behaviour.
- **"Render without crashing" as the only test.** Fine in addition to behaviour assertions; alone, it doesn't earn its keep.
- **Mirror tests with no edge cases.** Tests cover the failure modes a careful reviewer would imagine.
- **Snapshot tests without intentional review.** Accepted only when every byte of the diff is read.
- **Invalid test data.** `'Golden'` as an enum value, `'test@test'` as an email, `999` as a foreign key. Test data must pass the same runtime validation as production — use real enum values, real entity shapes, real-ish data that the system would actually accept.
- **Non-deterministic test fixtures.** Every field that affects ordering, filtering, or deduplication must be explicitly set — never rely on `null` defaults or DB-generated values for assertion targets.
- **Reimplementation without reference testing.** When porting or reimplementing an algorithm/system, test against the trusted original's output. If the reference exists and is runnable, "does my output match?" is the strongest possible assertion.
- **Mocking the system under test.** Mock dependencies, not the unit.
- **Monkey-patching module exports for test doubles.** Inject dependencies as constructor/function arguments. Module-level mutation couples the test to internal file structure and breaks under ESM or bundler changes.
- **Locking logic without a concurrent test.** When code uses `FOR UPDATE`, `SKIP LOCKED`, advisory locks, or distributed locks, test with two concurrent workers and assert no double-processing. The locking pattern is correct only if proved under contention.

## Documentation

- **Stale docs after a code change.** Update in the same commit. *Stale docs are worse than no docs.*
- **README without a TOC on a non-trivial repo.**
- **Documentation that repeats the code.** Link or summarise.
- **Hand-edited generator output.** Generated files are read-only. Edits go to the source.
- **Time-sensitive language in evergreen docs.** No "as of November 2024," no "currently supported."

## Tooling

- **Silent tool swap inside a concept slot.** Never without structured RCA + explicit ask + operator's go-ahead.
- **Generic recommendations decoupled from the repo's actual stack.** Read the repo first.
- **Dependency without a justification.** Every new package: which concept slot, what alternatives, why this one.
- **Dependency adoption without a license check.** Licensing changes between versions (MIT→commercial, open→source-available). Check current license terms before adopting or upgrading.
- **Proposing a removed-from-canon tool.** See [`04-toolchain.md`](04-toolchain.md) §"Removed from canon."
- **Flat structure when hierarchy exists.** Duplicating shared config/conventions/docs per service instead of inheriting from root with local overrides. Closest-first resolution applies to everything — config, code placement, conventions, documentation, skill routing. Shared at root, overrides at leaf, nearest wins.
- **Imposing greenfield patterns onto an existing codebase inside a feature PR.** Adding `/v1/` to routes in a codebase with no versioning, restructuring folders to match a new convention, introducing a new error shape — these are improvements, not prerequisites. Ship as separate proposals. Match what exists; propose what's better.
- **Repository without pre-commit quality gates.** Format → lint → type-check should run on every commit from the first day. A codebase that only validates in CI discovers errors 10 minutes late and trains contributors to ignore failures. Set up hooks using the ecosystem's standard tooling at project creation, not as a follow-up. The hooks run the linter with language-specific rules and the formatter — not just formatting.
- **Greenfield project without validated config and secrets hygiene.** Every greenfield project ships with: (1) a config module that validates environment variables at boot and fails fast with a clear error, (2) an example config file (`.env.example`, `config.example.yaml`, etc.) with placeholder values checked into git — never the real secrets file, (3) a `.gitignore` (or equivalent) that excludes secrets, dependencies, build output, and OS files. These are first-commit infrastructure, not follow-ups.
- **Over-engineered structure when flat suffices.** `src/core/domain/models/base/` when three files in root would do. Directories, abstraction layers, config frameworks, and wrapper classes earn their cost at the second consumer. The simplest correct structure is the best structure.
- **CI cost unawareness.** GitHub-hosted runners at full price when drop-in alternatives (Ubicloud, self-hosted ARM) cut 80-90% of compute cost. Long artifact retention (`retention-days: 90`) for ephemeral data. No path filters in monorepo — running all checks on every file change. No concurrency controls — stale runs consuming minutes. Save on commodity compute; invest the savings in quality (test sharding, security scanning, automated docs gates).
- **Mixing eras silently.** See [`01-stack-eras.md`](01-stack-eras.md) §"Era C — Hybrid".

## Refactoring

- **Refactor that hides a behaviour change.** Refactor PRs are behaviour-preserving.
- **Refactor without a tracker link.** Explained somewhere — issue, doc, design note.
- **Refactor that erases blame.** Preserve git history; link the original PR/issue.

## PRs and commits

- **Trivial deferral as a scope cut.** A two-line permission fix, a missing guard, a known-wrong default — if the overhead to defer (ticket, review comment, tech-debt tracker, follow-up PR) exceeds the cost to implement, it's procrastination, not scope management. Do it now.
- **Silently picking one side of a tradeoff.** When multiple valid approaches exist (in-memory vs Redis, REST vs GraphQL, eager vs lazy), the agent names the alternatives with costs in the plan — silent picks hide risk from reviewers.
- **Cleaning up pre-existing dead code in a feature PR.** Remove only what YOUR changes orphaned. Pre-existing dead code is a separate cleanup PR or a comment to the reviewer. Bundling unrelated cleanup with features makes diffs unreviable.
- **PR body without scope boundary.** Reviewers can't validate without it.
- **Bug-fix PR without RCA.** Symptom → reproduction → trace → root cause, or it's a patch, not a fix.
- **PR without rollback.** Every PR answers in one line.
- **Commit messages that don't match local convention.** Match the git log. Don't introduce a third style.
- **`git push --force`** without explicit operator approval.
- **`git commit --amend` after a push to a shared branch.**

## Security

- **SQL injection via string interpolation.** Parameterised queries only. No exceptions.
- **`eval` · `Function()` · `dangerouslySetInnerHTML` without a documented sanitiser.**
- **Secrets in committed files.** Hard no — including unsanitised `.env` examples.
- **CORS / CSP relaxations without a documented threat model.**
- **Secret comparison with `===` / `!==`.** API keys, webhook secrets, HMAC digests compared via equality operator leak timing information. Use `crypto.timingSafeEqual` or the platform's constant-time comparison.
- **Public endpoint without rate limiting.** Webhooks, login, signup, password reset — any endpoint reachable without prior authentication needs rate limiting or a documented deferral with a ticket.
- **Logging PII.** Emails, IPs, names, payment info — never in logs.

## Runtime coherence (R15)

Full catalogue with runtime-coherent equivalents per primitive: [`07-runtime-coherence.md`](07-runtime-coherence.md).

Key shapes: in-process cache / rate-limiter / counter on a fresh-isolate runtime → no-op, reach for out-of-process equivalent. Unbounded in-process cache on long-lived runtime → LRU + TTL + max-size. In-process websocket map on multi-replica → external pub-sub. `setInterval` cron inside a web service → platform scheduler. Node-API library on edge → Web APIs.

## Currency (M3)

- **Coding from training-cutoff recall** when current docs are one fetch away.
- **Perpetuating a date-stamped pattern in greenfield** without checking current state. Standing flags in [`08-currency-flags.md`](08-currency-flags.md).
- **Disregarding a lane-canonical peer skill** when one exists. The peer wins on its lane.

## Maintenance and remediation (R16)

When hardening inherited, legacy, or LLM-generated code:

- **Trusting the `latest` tag as the patched version.** The fix range lives in the advisory; the `latest` tag may itself be vulnerable and an audit tool's summary can mislead. Read the advisory (GHSA / OSV / equivalent), pin the fixed version.
- **Version skew across a coupled package family.** A framework's runtime / dev / typegen, a linter's core / plugins, or a runner / coverage package drifting apart reads like a code bug but is a version bug. Pin in lockstep, regenerate generated types.
- **Rating a CVE without the deployed-runtime check.** A server-runtime advisory is moot on a static-exported SPA; an SPA-only advisory is moot on a server deployment. Map the advisory to the deployed path; upgrade regardless to clear it.
- **Closing a security pass with alerts un-triaged.** Done is zero open: each fixed, or dismissed with a recorded reason.
- **Security or audit claims asserted from intent.** Every claim carries a file and the test that proves it; a posture table without evidence is theatre.
- **Deferring a known vulnerability or race without a backlog id and owner.** Known security defects are P0, not "a later phase will fix it."
- **Porting legacy security theatre.** Stub MFA, default-password constants, `setTimeout` "auth" are re-implemented to the standard or removed, never carried forward.
- **Coverage thresholds that pass because files went unmeasured.** Count every in-scope file (untested counts as zero); exclude only generated / barrel / config / story; gate critical modules per-file.
- **Declaring a migration done with lint at warn or new warnings introduced.** Promote warn to error, hold no new warnings.
- **Leaving migration residue.** Stale phase / legacy comments, `debug-` / `tmp-` / `scratch-` scripts, and config entries pointing at deleted trees all sweep to zero before handover.

## Agent's own behaviour

- **Asking "should I continue?" mid-autonomous-loop.** Run to the budget or the user interrupt.
- **Implementing a framework pattern from training-cutoff recall without checking current docs.** The agent checks the framework's current official docs before implementing. Open the docs first.
- **Confident implementation of an unfamiliar problem.** When the agent cannot name the pattern or the analogous problem (problem type C), generating code at full speed is the anti-pattern. Decompose, try small cases (n=0, n=1, n=2 before n), check edge cases at design time not just test time, and validate each step. Don't trust intuition during execution.
- **Defensive validation for conditions your own code makes impossible.** Validate at system boundaries (user input, API calls); assert invariants internally. If your algorithm requires `n >= 1` and your own caller guarantees it, an `assert` is correct — a full validation path with error handling is wasted code.
- **Hallucinating package versions or API methods.** When adding a dependency, check the current registry for the latest version — never fabricate a version number. When calling an API method, verify it exists in the current version of the library. `response.json()` vs `res.send()` vs `c.json()` varies by framework — get it from the docs, not from recall.
- **Leaking skill-internal nomenclature into output artifacts.** `(R8)`, `(per R5)`, `(S31)` — code comments reference the *pattern*, not the rule number. The output reads as if no skill exists.
- **Claiming authorship the operator didn't grant.** Consistency with the repo wins.
- **Marketing language.** Reader awards labels.
- **Filler phrases.** Delete and start over.

---

## When the agent finds an existing anti-pattern in the codebase

1. **Adjacent to in-scope edit + clear blocker** → flag in plan + propose separate PR.
2. **Inside the in-scope edit** → fix as part of edit + note in *Scope boundary*.
3. **Distant from in-scope edit** → leave + write an issue, referencing this list.

Surgical, not territorial.

---

*Search keywords: anti-pattern, do not, any, N+1, fake cache, marketing language, code-first, bundled rename, stale docs, console.log, todo, currency, hard no, do not produce, idempotency, pagination, polling, realtime, retry, graceful shutdown, SQL injection, TOCTOU, check-then-act, soft delete, graph, ghost entity, concurrency, parallelization, backpressure, license, trivial deferral, SOLID, GoF, design pattern, singleton, factory, strategy, observer, decorator, builder, paradigm, cleanup, resource lifecycle, 12-factor, CQRS, edge case, premature abstraction, data structure, stack, queue, priority queue, trie, bloom filter, DAG, ring buffer, CAP, sharding, circuit breaker, pub/sub, CDC, event sourcing, config hierarchy, closest-first, cost model, naming, verb vocabulary, magic number, backwards compatibility, error message, prod leakage, simplicity, over-engineering, cross-stack contract, re-queue, recovery, reference testing, reimplementation, optimize for change, deduplication, diverge, variant lookup map, SEO, JSON-LD, structured data, accessibility, a11y, observable surface, cargo-cult, assert, validate, boundary, co-locate, folder-per-component, LLM, AI, prompt, structured output, model config, tool-calling, hallucination, embedding, token budget, data migration, backfill, expand-migrate-contract, cache invalidation, TTL, cache-aside, HTTP status, API design, feature flag, kill switch, rollout, closed-form, loop, Gauss, mathematical identity, classify problem, CI cost, Ubicloud, path filter, artifact retention, concurrency control, constant derivation, domain knowledge, problem classification, type A, type B, type C, concrete before general, small cases, unfamiliar problem, Houston, Polya, timezone, UTC, datetime, money, currency, floating point, decimal, integer cents, timeout, downstream, cascading failure, health check, liveness, readiness, probe, tracing, trace context, W3C traceparent, pre-commit, husky, lint-staged, quality gate, greenfield patterns, match existing codebase, try-catch, over-catching, async contagion, verbose naming, self-verification, priority tier, hard stop, connection pool, pool exhaustion, finally, hallucinate, package version, API method, fabricate, timing-safe, timingSafeEqual, constant-time, rate limit, rate limiting, monkey-patch, module mutation, dependency injection, concurrent test, contention, FOR UPDATE, SKIP LOCKED, advisory lock, metrics, counter, histogram, gauge, Prometheus, observability.*
