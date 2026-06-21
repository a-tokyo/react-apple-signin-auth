# 04 — Toolchain (kit, not canon)

> **The instance is the noun; the concept is the verb.** Vocabulary, not prescription.

Loaded **only when the agent needs vocabulary for a concept slot.** Never as a default reach.

---

## How to use

1. **Identify the concept slot.** Verb. (An SMS provider. A database. A linter.)
2. **Read the local repo first.** Whatever the repo uses in that slot is the default for that repo.
3. **Slot empty (greenfield, or operator asks "what would you reach for?")** → propose by concept; name an instance as example.
4. **Never silently swap** instances inside one slot. Migration needs structured RCA + ask first (R10).

---

## §1 · Concept → example instance

The table below is vocabulary, not prescription. Read `package.json` first — the repo's existing choice wins. Greenfield: propose by concept, name an instance as example.

| Category | Concept slots → example instances |
|----------|----------------------------------|
| **Data** | Relational (Postgres + `pg` · Prisma · Knex · Supabase) · Document (Mongo · Firestore · Convex) · Graph (Neo4j) · Vector/search (Elasticsearch · Pinecone · pgvector) · Cache (Redis / `ioredis`) · Object storage (R2 · S3) |
| **Auth & identity** | Auth provider (Clerk) · Apple Sign-In (focused verifier package) |
| **Messaging** | Email (Resend + React Email) · SMS (Twilio) · Webhooks (Svix) · Push (platform-native) |
| **Payments** | Stripe (`stripe`, `@stripe/stripe-js`) |
| **Observability** | Error monitoring (Sentry) · Analytics (Mixpanel · Segment) · Full-stack APM (Datadog) |
| **AI** | AI SDK abstraction (Vercel AI SDK) · Zero-shot classifier (OSS LLM-backed) |
| **Code quality** | Linter (ESLint + org config) · Style linter (Stylelint) · Formatter (Prettier) · Pre-commit (Husky + lint-staged; **order: format → lint → type-check**) |
| **Testing** | Unit/integration (Vitest · Jest for legacy/RN) · Component (Testing Library) · E2E (Playwright · Cypress for legacy) |
| **Frontend** | Framework (Next.js App Router) · UI primitives (Radix · Base UI) · Styling (Tailwind + `cva` + `clsx`) · Forms (react-hook-form + Zod) · State (server-driven; Zustand / Jotai when genuinely needed) · Animation (`framer-motion` web · `react-native-reanimated` mobile) · Icons (Lucide) |
| **Mobile** | Runtime (Expo + EAS) · Storybook (`@storybook/*`) |
| **Infra & CI** | CI (GitHub Actions, SHA-pinned · CircleCI legacy) · IaC (Terraform) · Containers (Docker + compose) · Lib bundler (Vite · Rollup) |
| **Agent infra** | Workspace orchestrator (org-shared package) · Runtime (containerised base image) · Workspace persona (see [`01-stack-eras.md`](01-stack-eras.md) §"Workspace persona") |

> Used correctly: *"I'd add an SMS provider — Twilio's the example."* Not: *"I'll add Twilio."*

---

## §2 · Stand on your own shoulders before reaching outside (V3)

Before pulling a third-party for a concept slot, check whether the operator (or the org) already publishes a package that covers it. Authored OSS the operator extends — sign-in flows, classifiers, RN primitives, lint rules, payment integrations, lint/style configs — is a first-class candidate before any new dependency. About to build something the operator has already shipped → stop, reference, extend if extension is genuinely needed. The principle is portable; the specific catalogue lives in the operator's package registry, not in this file.

---

## §3 · Migrations the operator has lived through

| Old → Current | Agent's behaviour |
|---------------|-------------------|
| TSLint → ESLint | Default ESLint. TSLint config = migrate with ask. |
| Flow → TypeScript strict | Default TS. Touch Flow only in legacy files. |
| Enzyme → Testing Library | Default Testing Library. Enzyme only in legacy. |
| Buddybuild → Fastlane → EAS | Default EAS. Fastlane only when bare RN demands it. |
| CRA + Webpack → Next.js App Router + Vite | Default Next for apps, Vite for libs. Never propose CRA. |
| Redux + thunks → server-driven + Zustand/Jotai | Default server-driven. Redux only in explicitly-Redux codebases. |
| REST/GraphQL Relay → Server Actions / typed RPC | Default server-driven. Use framework's data layer; typed Route Handlers or RPC otherwise. |
| Babel → TS / SWC / esbuild | Babel only for legacy `@babel/preset-flow` repos. |
| SendGrid → Resend · Bugsnag/Instabug → Sentry · HMAC → Svix · hand-rolled OAuth → Clerk | Default current. Legacy stays until asked. |

**Era recognition.** Flow + Enzyme + CRA + Redux + CircleCI → *legacy that works*: extend in place, don't migrate without ask. Next App Router + server-state DB + edge auth + AI SDK + GitHub Actions → *target state*: lean in. Mixed → ask for the migration plan. Full era catalogue: [`01-stack-eras.md`](01-stack-eras.md).

---

## §4 · Removed from canon — do not propose

- **TSLint** — dead, ESLint won.
- **Buddybuild** — dead since 2018.
- **CRA (Create React App)** — unmaintained; use Next.js or Vite.
- **Enzyme** — incompatible with React 18+; use Testing Library.
- **Bower / Grunt** — superseded.
- **Moment.js** — bloated; use `date-fns` or `Intl.DateTimeFormat`.
- **Lodash full-package import** (`import _ from 'lodash'`) — only via `babel-plugin-lodash` or per-method imports.
- **`var`** — `const` by default, `let` only when reassignment is genuine.
- **`any`** — hard rule. `unknown` + narrowing function.

Not exhaustive. Rule: if a tool has a clearly-better successor the operator has adopted, never propose the predecessor for new work.

---

## §5 · Always-evolving clause

This file is dated dossier material. If a year brings a better instance for a slot:

1. **Recognise** the canon has shifted.
2. **Propose** the swap with structured RCA (R10) — slot, current, proposed, reason.
3. **Never silently apply.** Kit changes by ask, not by reflex.

When the kit genuinely shifts → update this file + log the swap in whatever decision-ledger the workspace keeps (an autoresearch-style ledger alongside the local `AGENTS.md` is the recommended shape).

---

*Search keywords: toolchain, concept-slot, migration, OSS, eslint, prettier, husky, lint-staged, typescript, removed from canon, kit not canon, lived migrations, Twilio, Mixpanel, Datadog, Sentry, Resend, Postgres, Supabase, Vercel, EAS, Expo, Fastlane.*
