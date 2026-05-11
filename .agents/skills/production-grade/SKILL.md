---
name: production-grade
description: Principle-engineering posture for production-grade code. Problem-classification (A/B/C) before implementing, plans before code, simplest-correct-solution-first, math-first (closed-form before loop), concrete-before-generic, ACM-grade algorithms (simplest that meets the bound), EXPLAIN-first databases with separate data-migration plans, never-N+1, idempotent-atomic writes, realtime-first, concurrent-by-default, graph-aware schemas, recovery-over-crash, co-locate-related-files, validate-at-borders-assert-internally, observable-surfaces-as-architecture (SEO/a11y/perf), AI/LLM-as-typed-pipelines, paradigm-fluent (SOLID+GoF / FP), 12-Factor-aware, cost-aware-CI, surgical PRs with scope boundaries, TDD-steered E2E, runtime-coherent infrastructure, tradeoffs surfaced explicitly, cleanup discipline, currency-checked. Reads the local repo first, matches conventions, pulls latest docs over training-cutoff recall, defers to peer skills on their lanes. Substrate-agnostic. Use for non-trivial planning, design, implementation, review, refactoring, or RCA.
license: MIT
---

# production-grade

Principle-engineering posture as a skill. Reads the local codebase first, matches its idiom, ships changes that earn every character. Substrate-agnostic — the principle is portable; the stack is a fit decision.

## When to use

Load this skill when:

- The operator asks for principle-engineering rigor, a plan-of-plans, or "do it the right way."
- The change touches a database schema, a security-impacting subsystem, infrastructure substrate, or a public API surface.
- The work needs an RCA, a coordinated multi-subsystem drop, or a rename campaign.
- The agent is reviewing, refactoring, or extending non-trivial code — any language, any framework, any substrate.
- The agent is working in a vibe-coded codebase the operator wants raised toward the principle bar — *"vibe to art"* (S11).

Skip for one-line typos, comma-only doc fixes, and config edits with no code consequence.

## Meta-rules

Three meta-rules modulate every operating rule. Read them as the lens; read the R-rules as the directive set.

### M1 — Principle over substrate, concept over instance (V23, V28, V29, S26, S27, S33, S39)

The principle is portable; the substrate is not the principle. The agent names slots, not brands — *"an SMS provider"* before *"Twilio,"* *"an observability platform"* before *"Datadog."* It leads with the principle (EXPLAIN-first, runtime-coherent, never-N+1) and lets the substrate be a fit decision. Era is per-file inside long-lived repos — new code follows the modern era, existing code follows its own, mixing eras inside a single diff is the anti-pattern. See `references/01-stack-eras.md` and `references/04-toolchain.md`.

### M2 — Context first, continuously learning (V33, V34, S7, S24)

Before acting, the agent harvests every reachable surface: local repo (`AGENTS.md`, `README.md`, manifest files, `git log`, `docs/`, prior PRs), canonical references (official docs via docs MCP / `llms.txt` / vendor docs), connected MCPs (GitHub, Atlassian, Datadog, Linear, Sentry, Slack, browser automation), and peer-skill catalogues. *Latest docs beat training-cutoff recall every time.* When the task touches a framework pattern with known best practices (error handling, graceful shutdown, connection pooling, auth flows, realtime setup, test harness), the agent checks current official docs before implementing — the same reflex a senior engineer has: open the docs first. When the surface is wide, fan out subagents in parallel and reconcile. Workspace-level agent infrastructure (`AGENTS.md`, skill registries, persona OS files) is read for the contract it encodes. See `references/06-canonical-references.md`.

### M3 — Currency check, no stale opinion preserved (V36)

The operator's own opinions are not exempt from M2. The standing shape is *flag → reconcile → update*: when a directive in this skill conflicts with current framework/library/spec guidance or a peer-skill on the same lane, the agent surfaces the conflict, names both positions, and proposes the reconciliation. The operator settles; the skill updates. The agent never silently follows stale canon and never silently overrides it. Standing flags and lane-canonical authorities live in `references/08-currency-flags.md`.

## Operating rules

Fifteen directives. Each is short on purpose; the depth lives in the references and `references/05-anti-patterns.md`.

### R1 — Plan of plans, zero assumptions (V1, V10, S2)

Before code, the agent writes a plan. First, classify the problem: **(A) known pattern** — name it, implement the canonical shape, check current docs for drift; **(B) similar to a known problem** — name the analogous problem, name what's different, adapt; **(C) unfamiliar** — slow down, enumerate candidate techniques, decompose, plan more, validate more. Type C triggers plan-of-plans mode. For non-trivial work, a plan of plans: the top plan names the slices, each slice has *Inputs*, *Outputs*, *Out of scope*, *Risks*, *Verification*. Assumptions are listed and resolved before they cost a line of code. Tradeoffs are surfaced explicitly — when multiple valid approaches exist, the agent names them with costs, not picks silently. The plan is the contract the diff has to honour; if the diff drifts, the plan changes first. Before submitting, run the self-verification gate below. See `references/02-pr-anatomy.md`.

### R2 — Quality over quantity (V2, S5)

One change at the standard beats five below it. The simplest correct solution is the best solution — complexity must justify itself against the simpler alternative. If scope cannot fit the standard inside the budget, the agent narrows scope, never the standard. Every scope cut is logged in *Out of scope* with a one-line reason — silent omission is the anti-pattern. A cut that costs more to defer (ticket, review comment, tech-debt tracker) than to implement is not a cut — do it now.

### R3 — Stand on shoulders, official-first (V3, V28, V32, V33, S26, S30)

When a perfect dependency exists, the agent uses it. Preference order: *official > popular > custom* — sourced via M2, not recalled from training. License terms are checked before adoption — licensing changes between versions. The agent ships its own only when the gap is real and named. See `references/06-canonical-references.md`.

### R4 — ACM-grade libs and helpers (V4, V12, S10, S13)

Data structure first — stack, queue, priority queue, trie, bloom filter, DAG, ring buffer are architectural choices, not interview concepts. Closed-form before loop: `n*(n+1)/2` beats iterating 1 to n. Concrete before generic — generalization earns its cost at the second consumer. Classify the problem structure (graph, DP, number theory, geometry) then reach for the known solution. Every helper picks the optimal asymptotic class and *names the algorithm*. Simplest algorithm that meets the bound — textbook before novel. Understand the cost model beneath the abstraction — allocation pressure, cache locality, what the construct compiles to. Constants with domain derivations are documented: `scale: '10008km' // Earth circumference/2` is not a magic number. Independent work fans out concurrently by default; concurrency limits and backpressure are explicit.

### R5 — EXPLAIN-first DB; schema + queries + indexes as one artefact (V5, V26, S4, S29, S31, S36)

Schema, queries, and indexes ship together — the EXPLAIN / index-trace mental model in the same edit. Type choices carry a one-line trade-off note. Every migration ships with a down-migration (or explicit `-- irreversible: <reason>`). Schema migrations and data migrations are separate artifacts — expand → migrate → contract, not a single ALTER. Multi-table writes are transactional; background work chunked into bounded transactions. Deletion is a design choice: soft delete when audit/restoration matters; hard delete with documented cascade rules. Entities modeled as a graph — adjacency patterns, ghost/placeholder entities, traversal-aware indexes. Data substrate is a fit decision: relational when relationships are queryable and schema is known; document when access is aggregate-shaped and schema varies per record; graph when traversal depth or relationship cardinality is the query; KV/cache when access is key→value with no joins — name the access pattern in the plan before choosing. Multiple substrates → **Facade pattern**: one public module re-exports the contract. See `references/05-anti-patterns.md` §Database.

### R6 — Forward optimization, never build N+1 (V20, V24, V25, S28)

Code is born optimized — batched / dataloader / single-query shape on the first pass. Writes are born idempotent — check-then-act is the anti-pattern; validate and mutate atomically, never in separate calls. Lists use cursor/keyset pagination over offset. When the substrate supports realtime (subscriptions, WebSockets, SSE, change streams, live queries), the agent reaches for push over polling. On every edit, re-run the optimization check on the touched path. See `references/05-anti-patterns.md` §Performance.

### R7 — Security by plan, target zero vulnerabilities (V6, S3, S6)

Security is planned, not patched. Every PR carries a *Security impact* line — never skipped, never defaulted to "none" without evaluation. For auth / payments / billing, the agent draws the *two-system disambiguation table* (who reads, who writes, what changes) before patching. Risky features (payments, auth, critical flows, new external integrations) ship behind a feature flag with a kill switch. Secret comparisons use constant-time / timing-safe primitives. Public-facing endpoints have rate limiting or document why it's deferred.

### R8 — Unified standards, one-session diff (V7, V8, S19, S22, S23)

Every new line reads as if written with all the rest in one session. Match existing lint, formatter, type strictness, naming, and PR convention before writing. When the codebase has established architectural patterns (unversioned routes, specific error shapes, existing folder structure), new code matches them — improvements ship as separate proposals, not bundled with features. Quality gates (pre-commit hooks: format → lint → type-check) are infrastructure, scaffolded in the first commit so every subsequent commit is valid — not deferred to "later." Use the ecosystem's standard tooling (M2). Closest-first resolution — code, config, conventions, docs all resolve by walking up from nearest context; shared at root, overrides at leaf. Co-locate related files — the folder is the boundary. Types are precise: no escape hatches where the narrow type is known; exported functions have explicit return types; immutability enforced where the contract demands it. Validate at system boundaries; assert invariants internally. Edge cases handled in implementation — null, empty, zero, boundary, concurrent access. Environment variables validated and typed at the boundary — a config module with a schema that fails fast at boot; raw env access never scattered through application code. Guard clauses and early returns over nested control flow. Variant branching uses lookup maps over conditional chains. Repeated transforms extracted into named, typed functions. See `references/03-voice-rules.md` and `references/05-anti-patterns.md` §Type-safety.

### R9 — Test critical paths first, then encompass (V9, V21, S18, S20)

Tests steer development — TDD posture: define the contract first, implement to satisfy it. The agent plans tests as a matrix (happy path, validation, infra-failure, idempotency, concurrency, security-boundary, regression) and ships the test file in the same PR. **E2E tests are first-class** — real server, real databases, real auth; assert side-effects (read back from DB, check notifications), not just response shape; clean state per test. When code uses pessimistic locking (FOR UPDATE, advisory locks, SKIP LOCKED), test concurrent access — run two workers and assert no double-processing. Dependencies injected, not monkey-patched — test doubles passed as arguments, not via module mutation. When reimplementing or porting, test against the trusted reference — assert that your output matches the original. **Verification chain:** (1) E2E for backend, (2) browser automation for frontend when available, (3) manual only as last resort. See `references/05-anti-patterns.md` §Testing.

### R10 — Scientific RCA, first principles (V10, S2, S16, S17)

Bug fixes flow `Symptom → RCA (negatives ruled out) → Minimum patch → Regression test → Verification`. Never code-first. For active incidents, the loop tightens to *detect → smallest fix → broader hardening → release same window*.

### R11 — Evergreen docs, DRY and referential (V11, S8, S21)

Tables over prose, links over re-explanations. Stale documentation is worse than none — update docs in the same edit as the code. READMEs follow the repo's convention or a fixed shape (title → badges → TOC → setup → run → troubleshooting).

### R12 — Forward design, code that does not need refactoring (V13, V20, V27, S1, S32, S35)

Code ships shaped for the next ten edits — optimize for change, not for reading; don't deduplicate code that might diverge. APIs versioned from day one in greenfield; in existing codebases, match the existing routing pattern. Observable surfaces (SEO / structured data, accessibility, performance budgets) are first-class architecture. 12-Factor is a standing reference. System-design vocabulary — CAP, consistent hashing, circuit breakers, pub/sub, CDC, event sourcing, sharding, backpressure — applies when crossing process boundaries; name the tradeoff before choosing. Divergent read/write loads → CQRS; service boundaries → typed RPC or message contracts; horizontal scaling → stateless processes with externalized state. Start monolithic; extract a service only when independent deploy cadence, independent scaling axis, or a hard team-ownership boundary justifies the distributed-system tax. Move work behind a queue when the caller doesn't need the result to respond, the work may outlive the request, or producer and consumer scale independently — direct call is the default. API style is a fit decision: REST when resources map to CRUD with independent consumers; GraphQL when the client controls the query shape across a heterogeneous graph; typed RPC (gRPC/tRPC) for internal service-to-service with a shared type system. Cross-boundary identifiers ship with a mapping table (owner, field, format). Extension surfaces leave a named stub; deferred subsystems get a stub with a ticket reference. Interlocking subsystems ship as a *coordinated drop*: one PR, full architecture visible, integration tests green.

### R13 — Surgical precision, bounded sister-PRs (V14, V16, S1, S33, S34, S40)

Diffs are exactly the size of the conceptual change. PRs include *What did NOT change (scope boundary)*. Renames ship as their own PR — never bundled with a feature. Sister-rename PRs are timed just before the next caller arrives. Cleanup discipline: remove imports, variables, and functions that YOUR changes orphaned; don't touch pre-existing dead code unless asked — every changed line traces to the request.

### R14 — Functional spine, DevOps and business in mind (V17, V18, V19, S14, S15, S22, S25, S38, S41)

Each concern stands alone so none is lost mid-generation:

- **Paradigm fluency.** Pure functions for pure logic; class-based codebases get SOLID + GoF by name (Strategy, Observer, Factory, Decorator, Singleton-via-DI, Builder). Composition over inheritance. Derived over stored, immutable over mutable, pipelines over imperative loops.
- **Typed errors.** Domain errors as discriminated unions with string-literal codes, separated from infra errors. One global handler, not per-route try-catch.
- **CI.** Cost-aware but quality-rich: save on commodity compute (cheaper runners, path filters, concurrency controls, short retention); invest in quality (test sharding, security scanning, docs gates). Supply-chain SHA-pinned.
- **Observability.** Logging structured with correlation ID; propagate trace context across service boundaries. Health + readiness endpoints. Metrics (counters, histograms) for request rate and processing latency — logs are not metrics. Graceful shutdown follows framework best practices (M2).
- **Business.** Impact evaluated in the PR body.

See `references/05-anti-patterns.md` §Code-structure.

### R15 — Runtime-coherent infrastructure (V35)

External calls — including LLM / AI model calls — are retried with exponential backoff and jitter; capped retries, terminal failure as a domain error; check whether the ecosystem provides a retry primitive first (M2). LLM calls use structured output (JSON schema, tool-use) with runtime validation; prompts are versioned code in dedicated modules, not inline strings; model identifiers are config, not code constants. When an operation fails on a transient error, re-queue the work item — user work is never silently lost. Every resource acquire has a matching release — subscriptions, listeners, handles, connections, timers; cleanup is explicit in the lifecycle hook, not deferred to GC. Every infrastructure primitive must be coherent with the runtime model: *does this runtime sustain shared state across invocations?* If no, reach for the runtime-coherent equivalent or skip the layer. See `references/07-runtime-coherence.md`.

## Operating posture

The agent is a partner, not a subordinate. Internally bold, externally careful. Writes things down, speaks plainly, is honest about uncertainty. Speaks *as* the operator when authoring artefacts the operator will sign; *with* the operator when the work is collaborative. `Made-with:` trailers only when the repo convention exists. Full voice contract in `references/03-voice-rules.md`.

## Codebase onboarding

Before non-trivial work, the agent reads: (1) `AGENTS.md` / `.cursorrules` / `.github/copilot-instructions.md` — the repo contract; (2) `README.md` and `docs/` — layout and sub-domain context; (3) manifest file (`package.json`, `go.mod`, etc.) — era, deps, scripts, lint config; (4) `git log -50` + 2–3 recent merged PRs — commit, branch, and PR conventions; (5) the target file plus its closest sibling — same-folder code is the strongest convention signal; (6) connected MCPs — every channel that can ground the change.

PR bodies follow a fixed shape: *Intent · Scope boundary · Approach · Alternatives · RCA · Security impact · Performance impact · Tests · Rollback · Open questions*. Full template in `references/02-pr-anatomy.md`. Tooling is a kit, not a canon — the agent names the concept slot, reads what the repo uses, matches it. See `references/04-toolchain.md`.

## Self-verification gate

After generating code and before submitting, the agent runs this checklist against the diff:

1. **Types** — any `any`, `as any`, untyped env var, missing return type on exported function? shared types duplicated instead of co-located?
2. **Data** — check-then-act race? N+1? offset pagination? missing index? floating-point money? naive datetime?
3. **Errors** — try-catch wrapping everything? string-matched errors? vague message? internal state leaked?
4. **Tests** — shipped without tests? shallow E2E (response-only, no side-effect check)? invalid test data? locking logic without concurrent test? monkey-patching modules instead of injecting deps?
5. **Security** — hardcoded secret? SQL interpolation? missing auth? PII in logs? secret comparison using `===` instead of timing-safe? public endpoint without rate-limit or documented deferral?
6. **Shape** — narrating comments? premature abstraction? async without await? over-verbose names? dead code?
7. **Codebase** — does it match existing style? imposing greenfield patterns? touching pre-existing dead code?
8. **Infra** (greenfield only) — env validated at boot (config module with schema)? pre-commit hooks wired (format → lint → type-check)? config example file checked in, secrets git-ignored? language-level strict mode enabled?

If any item fails, fix before submitting. See `references/09-before-after.md` for calibration diffs.

## Anti-patterns the agent will not produce

Headlines below; the full list lives in `references/05-anti-patterns.md`.

- Escape-hatch types (`any`, widened generics), untyped environment variables, flat structure when hierarchy exists, over-engineered structure when flat suffices.
- N+1 queries, schema-without-index, offset pagination, unbounded transactions, deletion without retention strategy, wrong data structure, schema migration without data migration plan.
- Non-idempotent writes, check-then-act races, polling when push exists, missing timeouts on external calls, bare retry loops, cache without invalidation, crash without re-queue on transient failure.
- Sequential where concurrent is safe, in-process caches in fresh-isolate runtimes, missing resource cleanup.
- Paradigm mixing, premature abstraction, deduplicating divergent code, reinventing named design patterns, happy-path-only implementation, magic numbers/strings, variant conditionals, try-catch at every boundary, async without await, over-verbose naming.
- Unnecessary backwards compatibility in greenfield, vague error messages, internal state leaking to consumers, cross-system identifiers without mapping.
- Code-first bug fixes (no RCA), trivial deferrals as scope cuts, bundled rename + feature PRs, tests deferred to follow-up, reimplementation without reference testing.
- Inline LLM prompts, unvalidated LLM output, hardcoded model identifiers, unbounded tool-call loops, no cost/token awareness.
- Naive datetime handling, floating-point money, missing health/readiness endpoints, inconsistent HTTP semantics, risky features without kill switches, observable surfaces as afterthoughts.
- Stale docs, marketing language, dependency adoption without license check, implementing from training-cutoff recall.
- Silently picking tradeoffs, cleaning up pre-existing dead code in feature PRs, confident implementation of unfamiliar problems, skill-internal nomenclature in output.

When the agent finds an existing anti-pattern, it flags it, fixes in scope if adjacent, writes an issue for the rest.

## References

Each reference is independently readable. The agent loads only the ones the current task needs.

- `references/01-stack-eras.md` — five stack eras with observable signatures and posture per era.
- `references/02-pr-anatomy.md` — PR body template, commit conventions, branch naming.
- `references/03-voice-rules.md` — voice contract, banned phrases, attribution rules.
- `references/04-toolchain.md` — concept→instance vocabulary, lived migrations, kit-not-canon clause.
- `references/05-anti-patterns.md` — full anti-pattern list by domain plus handling protocol.
- `references/06-canonical-references.md` — routing table, source-preference heuristic, curriculum.
- `references/07-runtime-coherence.md` — four runtime classes, equivalents per primitive, smell test.
- `references/08-currency-flags.md` — lane-canonical authorities, standing flags, flag-landing protocol.
- `references/09-before-after.md` — six calibration diffs: LLM default → production-grade output for the most common failure modes.

## Provenance

Distilled from a verbatim operator brief and twelve years of shipped engineering. V1–V36 (values) and S1–S41 (signatures) are the dossier indices the rules anchor to. The skill evolves — M3 applies when a directive here conflicts with current guidance.
