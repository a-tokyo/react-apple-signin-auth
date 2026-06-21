# 01 — Stack eras and agent-aware patterns

The agent classifies a codebase by what it **shows**, not by who owns it. Five eras + a small catalogue of agent-aware-infra patterns.

When the local repo has its own `AGENTS.md`, that file wins. This file is the fallback.

## Contents

How to read a codebase fast · Era A (target-state agentic) · Era B (modern) · Era C (hybrid) · Era D (legacy) · Era E (mobile / RN) · Agent-aware infra patterns · Order of precedence

---

## How to read a codebase in under a minute

1. `cat package.json` (or `pyproject.toml` / `Cargo.toml` / `go.mod`) → era signal from deps.
2. `ls .github/workflows/` (or `.gitlab-ci.yml` / `circle.yml`) → CI shape.
3. `cat .eslintrc* .prettierrc* tsconfig.json` → code-quality posture.
4. `cat AGENTS.md README.md` → workspace persona, doc shape, voice cues.
5. `git log --oneline -20` → commit convention (Gitmoji vs plain Conventional vs free-form).
6. `ls .agents/ .claude/ .cursor/` → agent-runtime presence.
7. **Confirm the framework from the manifest / lockfile / config before classifying** — a stated "Next.js" app may actually be React Router / Vite; the repo is ground truth, not the request.

---

## Era A — Target-state agentic

**Signature:** Modern web framework (SSR / edge / server-actions capable) · server-state management (TanStack Query / SWR / framework server actions) · managed auth (Clerk-shape / Auth.js-shape) · AI SDK abstraction · GitHub Actions with **SHA-pinned third-party actions** · Husky + lint-staged with `prettier → eslint → tsc` order · Vitest · Testing Library · Playwright · TypeScript strict · component library (Tailwind + Radix/Base UI-shape) · agent-attribution trailers in PR bodies (`Made-with: Cursor`).

**Posture:** lean in. Greenfield default. Use every modern affordance — server actions, edge handlers, streaming UI, partial pre-rendering, AI SDK structured output, index-with-schema co-location, webhook relay patterns. **Backend shape is a fit decision** (framework-integrated routes, a modular server framework like NestJS-shape, or a minimal server like Fastify/Express-shape; FastAPI-shape in Python) based on needs (latency, long-lived connections, background jobs, team topology, deploy constraints), not fashion.

**Bundle posture:** treat bundle size and dependency surface as architecture. Prefer fewer deps, audit transitive weight, keep server-only code server-only, and call out bundle delta when a change could impact it.

**First instinct:** the right answer is usually existing primitives composed cleanly. Reach for the new only when primitives genuinely don't cover the concern.

## Era B — Modern, maturing

**Signature:** TypeScript strict · Vitest or Jest · Testing Library · ESLint + Prettier (modern shared config) · Tailwind · React 18+ · Next.js (Pages or App Router) · GitHub Actions · server-state library. Auth and DB choices vary.

**Posture:** ship features at the operator's standard, defer big-bang migrations. *"Rewrite this in App Router"* is almost always wrong. Work inside existing primitives; flag genuine pain points (missing typed-RPC layer, untested critical path, missing audit log) as separate PRs with their own RCAs.

**Common improvements proposed:** TS strict if off · co-location of DB index with schema migration · `prettier → eslint → tsc` pre-commit order · PR template extended with *Scope boundary* / *Performance impact* / *Rollback*.

## Era C — Hybrid, mid-migration

**Signature:** two eras simultaneously. Pages Router *and* App Router. Redux *and* TanStack. Jest+Enzyme *and* Vitest+Testing-Library. Hand-rolled HMAC *and* Svix.

**Posture:** flag the era mismatch and **ask for the migration plan before writing code**. Do not silently "improve" by porting old to new in the same PR as a feature change.

**Typical opening:** *"Found this is mid-migration from Redux to TanStack — confirming the migration policy. Feature plan stays in the new pattern; flagging three Redux files I'd touch incidentally so we can decide migrate-then-feature or feature-then-migrate."*

**Pitfall avoided:** mixing eras silently inside a single feature. Hybrid codebase deserves a *consistent* approach within each module.

## Era D — Legacy that works

**Signature:** Flow (or no types) · Enzyme · CRA + Webpack · Redux + thunks · CircleCI · Babel-everything · Mocha or older Jest · `var`/`let` mixed · class components · `componentDidMount`. Often Bower/Grunt artefacts in git history.

**Posture:** **extend in place.** The system ships value; migration is a strategic decision, not the agent's reflex. Write Flow when the file is Flow. Enzyme tests when the file is Enzyme. CRA's build pipeline when the build is CRA. Do **not** introduce a TS file in a Flow project, a Vitest test in an Enzyme suite, or a new data-fetching paradigm in an existing Redux feed without explicit operator approval.

**Typical opening:** *"Extending the existing Flow + Enzyme shape; fix scoped to the resolver. Tests added in Enzyme to match the suite. Migration to TS out of scope; happy to scope a separate effort if wanted."*

**Two improvements allowed without ask:** (a) add a missing test for a legacy module the agent is touching, in the legacy framework; (b) fix a documented anti-pattern (legacy `var` → `const`) inside one function the agent edits, surrounding file untouched.

## Era E — Mobile / React Native / Expo

**Signature:** Expo SDK with EAS (modern) **or** bare RN with Fastlane (legacy) **or** older bare RN with Buddybuild artefacts (dead). React Native libs (`react-native-*`), `@expo/vector-icons` or `lucide-react-native`, `metro.config.js`. Sometimes a parallel web build in the same monorepo.

**Posture:** mobile is its own era. Crash reporting matters more (every crash → one-star review). Cold-start matters more (every 100ms → measurable churn). Release cadence matters more (App Store review = days). PR bodies in mobile codebases include an explicit *Mobile impact* note when relevant: cold-start delta, bundle delta, crash-rate delta, Hermes vs JSC, OTA-update eligibility.

**EAS over Fastlane** for new mobile work; extend Fastlane in repos that already use it (per Era D).

---

## Agent-aware infrastructure patterns

Independent of era, some codebases ship explicit agent infrastructure. Treat as canonical for that repo.

### Workspace persona

Workspace-level persona file (typically `AGENTS.md` at repo root, sometimes `PERSONA.md`) defines the agent's voice in that repo.

- **Persona** governs voice, naming, attribution, tone.
- **`production-grade`** governs craft: planning, schema-with-indexes, RCA, anti-patterns.

When both exist → satisfy both simultaneously. If conflict (rare): persona wins for voice, `production-grade` wins for craft.

### Agent runtime as infrastructure

Some repos package their agent runtime (container, entrypoint, lifecycle) as deployable infra. When running *inside* such a runtime:

- Treat runtime constraints as real infra: working directory boundaries, process lifetime, tool allowlists.
- Don't assume background processes survive past the run phase.
- Don't install dependencies at runtime — request they be added to the image / base environment.

### Code-quality as installable infrastructure

Some orgs ship lint / format / test / TS / pre-commit configs as **installable packages** (`@org/eslint-config`, `@org/tsconfig-base`). When the codebase extends one:

- Extend the package, never duplicate its content.
- Propose upstream changes when the same change benefits other repos in the org.
- Don't override package rules locally without ask.

### Deployment gradient (when present)

If the repo has an explicit `dev`→`staging`→`prod` promotion flow, treat it as canonical: migrations and config changes follow the same gradient.

---

## Order of precedence when guidance disagrees

1. **Local repo's `AGENTS.md`** (or persona OS) wins for that repo.
2. **Era posture** above is the next fallback.
3. **Universal mindset** in `SKILL.md` is the final fallback.

Higher precedence never silently overridden by lower. Conflict surfaces and asks.

---

*Search keywords: era, stack, posture, AGENTS.md, package.json, legacy, modern, target-state, hybrid, agent infrastructure, persona OS, mid-migration, mobile, React Native, Expo, monorepo, target-state-agentic.*
