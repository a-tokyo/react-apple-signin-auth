# Minimalism and over-engineering — the laziest-correct lane

The companion to R2 (the minimalism ladder) and R13 (surgical diffs). Where `10-remediation-audit.md`
hunts security and dependency debt, this file hunts *complexity* debt — code that needn't exist, a
hand-rolled stdlib, a dependency a platform feature replaces, a layer with one caller. The mode is
*review → delete-list → ledger*, never a rewrite. The best code is the code never written; the second
best is the code about to be deleted.

The lane is the inverse of bloat, not a licence for it. *Lazy means writing less code, not picking the
flimsier algorithm* — between two same-size options, the edge-case-correct one wins.

## Contents

- The ladder, restated
- The neutral ceiling-comment convention
- Over-engineering review (diff-scoped)
- Over-engineering audit (repo-wide)
- Deferred-shortcut debt (the ledger)
- What is never bloat (the guard)

## The ladder, restated

Before writing, walk the rungs and stop at the first that holds (R2):

1. **Does this need to exist at all?** Speculative need is skipped and named — YAGNI. Scaffolding "for
   later" is later's job.
2. **Stdlib does it?** Use it.
3. **Native platform feature covers it?** `<input type="date">` over a picker lib, CSS over JS, a DB
   constraint over app code (R3).
4. **Already-installed dependency solves it?** Use it. Never add a new one for what a few lines cover.
5. **One line?** One line (R4 — closed-form before loop, concrete before generic).
6. **Only then:** the minimum code that works.

Two rungs hold → take the higher one and move on. The ladder is a reflex, not a research project.

## The neutral ceiling-comment convention

A deliberate shortcut with a known ceiling is marked in-code with that ceiling **and** its upgrade
trigger — so the simplicity reads as intent, not ignorance, and the deferral can't quietly become
permanent. Use a brand-neutral marker (this skill's name never appears in shipped output):

```
# simplification: global lock; upgrade to per-account locks if throughput matters
// simplification: O(n^2) scan; upgrade to an index when n outgrows a few thousand
```

Convention: `simplification: <ceiling>, <upgrade trigger>`. A marker that names a ceiling but **no
upgrade trigger** is the rot risk — flag it.

## Over-engineering review (diff-scoped)

Review a diff for complexity only. One line per finding; the diff's best outcome is getting shorter.

Format: `L<line>: <tag> <what>. <replacement>.` (or `<file>:L<line>: …` across files.)

| Tag | Finds | Replacement |
|---|---|---|
| `delete:` | dead code, unused flexibility, speculative feature | nothing |
| `stdlib:` | a hand-rolled thing the standard library ships | name the function |
| `native:` | a dependency or code doing what the platform already does | name the feature |
| `yagni:` | an abstraction with one implementation, config nobody sets, a layer with one caller | inline it until a second consumer exists |
| `shrink:` | same logic, fewer lines | show the shorter form |

Examples:

- `L4: native: moment.js imported for one format call. Intl.DateTimeFormat, 0 deps.`
- `repo.py:L88: yagni: AbstractRepository with one implementation. Inline it until a second one exists.`
- `L30-44: shrink: manual loop builds dict. dict(zip(keys, values)), 1 line.`

End with the only metric that matters: `net: -<N> lines possible.` Nothing to cut → `Lean already. Ship.`
The lane lists findings; it does not apply them.

## Over-engineering audit (repo-wide)

The review, run over the whole tree instead of a diff. Same tags, ranked **biggest cut first**. Hunt:
dependencies the stdlib or platform already ships, single-implementation interfaces, factories with one
product, wrappers that only delegate, files exporting one thing, dead flags and config, hand-rolled
stdlib.

Output, one line per finding, ranked: `<tag> <what to cut>. <replacement>. [path]`. End with
`net: -<N> lines, -<M> deps possible.` Nothing to cut → `Lean already. Ship.` One-shot report; applies
nothing.

## Deferred-shortcut debt (the ledger)

Harvest the ceiling-comments into one ledger so a deferral can't rot into "never". Grep the repo,
skipping `node_modules`, `.git`, and build output:

```
grep -rnE '(#|//) ?simplification:' .
```

One row per marker, grouped by file:
`<file>:<line> — <what was simplified>. ceiling: <the limit>. upgrade: <the trigger>.` Pull the ceiling
and trigger straight from the comment. Any marker with no upgrade trigger gets a `no-trigger` tag —
those are the ones that silently rot. Owner per row: add `git blame -L<line>,<line>`.

End with `<N> markers, <M> with no trigger.` Nothing found → `No deferred-shortcut debt. Clean ledger.`
Reads and reports only; to persist it, write `MINIMALISM-DEBT.md` on request.

## What is never bloat (the guard)

Minimalism never simplifies away correctness. The following are *not* findings, and the review/audit
must never flag them for deletion:

- The one runnable check R9 leaves behind — an assert-based self-check or a single `test_*` is the
  minimum, not bloat.
- Trust-boundary validation, data-loss handling, security primitives (R7), and accessibility basics
  (R12) — never on the chopping block.
- A correct-but-larger algorithm chosen over a flimsier same-size one (R2/R4).
- A DB index, a down-migration, an idempotency key, or a resource-cleanup hook (R5/R6/R15) — these are
  the load-bearing lines an unconstrained agent omits, not the bloat a lazy agent adds.
- Anything the operator explicitly asked for. They insist on the full version → build it, no re-arguing.
