# 08 — Currency flags and lane-canonical authorities

The catalogue M3 reaches for. The body of `SKILL.md` holds the *operating shape* (flag → reconcile → update); this file holds (a) the standing currency flags and (b) the named peer skills that win on their lanes when an operator pattern conflicts with current substrate guidance.

M3 turns V33 (always latest docs) reflexively onto the operator's own canon. **No directive is canon just because it lives in this skill.** Every directive that names a substrate (a framework version, a library, a deployment platform, a language feature, a pattern with date-stamped guidance) gets currency-checked before being quoted.

## Contents

§A · lane-canonical authorities · §B · standing currency flags · §C · how a new flag lands · §D · currency-checking in practice

---

## §A · Lane-canonical authorities

When a peer skill is the canonical authority for a lane and an operator pattern in this skill conflicts with it, the peer skill wins. The operator's pattern is preserved as evidence-of-its-era in the dossier; new code follows the lane authority.

| Lane | Canonical authority | Why it wins |
|---|---|---|
| **React Native** | [`callstackincubator/agent-skills/react-native-best-practices`](https://skills.sh/callstackincubator/agent-skills/react-native-best-practices) | Callstack maintains the substrate (Reanimated, Re.Pack, FlashList integrations). They ship the canon they document. |
| **Iteration loop** | [`github/awesome-copilot/autoresearch`](https://skills.sh/github/awesome-copilot/autoresearch) | The M-loop is byte-identical to the operator's local install. No rewriting it here. |
| **Frontend UI critique** (user-facing surfaces) | [`pbakaus/impeccable/critique`](https://skills.sh/pbakaus/impeccable/critique) | A specialised UI-craft critique skill from a designer-engineer. Pair `production-grade` for engineering posture; defer to `critique` for UI judgement. |

When a lane has no canonical peer skill, `production-grade` covers the basics in that lane. When a lane has one, `production-grade` defers and stays in its own lane (engineering posture).

---

## §B · Standing currency flags

These are the worked examples M3 ships with. Each one names: the operator's pattern, the current state of the art, and the reconciliation. New flags land here as the agent finds them.

### B.1 · React `forwardRef`

| | |
|---|---|
| **Operator pattern** | Leaf components wrap in `React.forwardRef` so refs forward through the wrapper to the underlying DOM/native element. |
| **Authored under** | React 16 / 17 / 18. |
| **Current state (React 19+)** | `forwardRef` is no longer needed; function components accept `ref` as a regular prop. React's own deprecation note: *"In React 19, `forwardRef` is no longer necessary."* |
| **Reconciliation** | Existing `forwardRef` callsites under React ≤18 are not defects in their context — they were correct when authored. **New components on React 19+** should destructure `ref` from props: `const Foo = ({ ref, ...rest }) => …`. Don't perpetuate the wrapper in greenfield. |
| **In the diff** | `+import { forwardRef } from 'react'` on a React 19+ project → flag. |

### B.2 · Barrel files (`index.ts` re-exports)

| | |
|---|---|
| **Operator pattern** | A shared utility package whose `index.js` re-exports 60+ helpers; the published-package surface is one import. |
| **Authored under** | Babel / Webpack era — bundle-size mitigated via per-helper modular imports, deep-import patterns, and tree-shake-friendly transforms. |
| **Current state** | Contested. Vercel's *"Avoid barrel files"* guidance, Next.js / Vite tree-shaking studies show barrel files can hurt cold-start performance and bundle size when the tooling can't statically prove tree-shakeability. |
| **Reconciliation** | **Keep barrels as the package's published surface** — that's the contract with consumers (DX wins). **In application code**, prefer deep imports from the package (`import { fn } from '@org/utils/dist/fn/fn'`) when bundle size or cold-start matter, *and* never re-export an already-barreled package through a second-level barrel (`export * from '@org/utils'` in your app's own `utils/index.ts`). |
| **In the diff** | `export * from '@some/already-barreled'` → flag. New `index.ts` aggregator re-exporting >5 modules in app-internal code → flag. |

### B.3 · Date library

| | |
|---|---|
| **Operator pattern** | Apps carry `moment.js` as legacy. |
| **Current state** | `moment.js` is in maintenance mode (per moment.js's own homepage: *"Moment.js is a legacy project, now in maintenance mode."*). Bundle size, mutability, and Temporal-API competition all weigh against it. **`date-fns`** is the operator's canon for new projects. |
| **Reconciliation** | **Do not introduce moment in new code.** Existing moment usage in legacy modules — leave unless touching for other reasons; if touching, propose the migration as a sister-PR (R13). |
| **In the diff** | `+import moment from 'moment'` in a new file → flag. |
| **Also valid** | `date-fns` (operator's default) · native `Intl.DateTimeFormat` for formatting · `Temporal` polyfill (`@js-temporal/polyfill`) for new arithmetic · Day.js for moment-API-shaped migrations where rewriting callsites isn't worth it. |

### B.4 · React Native, when in conflict with callstack

| | |
|---|---|
| **Operator pattern** | `FlatList`, no `react-native-fast-image`, no FlashList adopted, manual memoisation with `React.memo` and `useMemo`. |
| **Authored under** | RN 0.6x → 0.7x, before FlashList was production-stable and before React Compiler. |
| **Current state (per callstack RN best-practices skill)** | `FlashList` for lists >20 rows; React Compiler for memoisation (no manual `React.memo`); Reanimated v3 for animations; Re.Pack for bundling. |
| **Reconciliation** | **Defer to callstack** on contradiction — they ship the substrate. The operator's RN pattern is anchored to *what worked in their prior commercial RN apps*; callstack's pattern is *what's current across the RN ecosystem*. Cite both in the plan; ship the callstack version unless the operator says otherwise. |
| **In the diff** | New RN project, `+import { FlatList } from 'react-native'` for a list with ≥20 expected rows → flag, propose FlashList. |

---

## §C · How a new flag lands here

When the agent (or the operator) finds a new conflict between operator-canon-as-cited-in-this-skill and current substrate guidance, it goes through M3's three steps and the result lands as a row here.

```
New currency-flag template:
- Operator pattern (one line + dossier anchor: research/<n>:<line>)
- Authored under (era / framework version / year — what was current then)
- Current state (one line + source: docs URL / peer skill / deprecation note)
- Reconciliation (legacy-leave / greenfield-adopt / sister-PR-migrate)
- In the diff (the lint-shape: what the agent flags when it sees this in a diff)
- Also valid (other accepted alternatives in the same concept slot, ranked)
```

Append. Do not delete past flags — the historical context is the audit trail.

---

## §D · How currency-checking happens in practice (M3 + V33 link)

The agent doesn't currency-check every directive on every invocation. The trigger shapes:

1. **A directive in `SKILL.md` or its dossier names a date-stamped substrate** (a framework version, a specific library, a deployment platform feature). The agent checks the lane authority + the latest docs (V33) before quoting it as canon.
2. **The diff or plan touches a substrate the agent has cached as "operator pattern, era X"**. The agent surfaces the era, names the current state, proposes the reconciliation.
3. **The user mentions a substrate the agent's training cutoff predates**. The agent reaches for current docs first (M3 / V33) before applying any pattern.

When in doubt, ask. *"My pattern for X is anchored to <era>; the current authority on <lane> says <Y>. Reconcile?"* — that question is in the plan, not silently elided.

---

*Anchors: M3, V33, V36. Cross-ref: `05-anti-patterns.md` §Currency for the inverse, `06-canonical-references.md` §E for the skill-catalogues hierarchy that decides which lane authorities exist.*

*Search keywords: currency, lane authority, callstack, autoresearch, impeccable, forwardRef, barrel files, moment, date-fns, React 19, deprecated, peer skills.*
