# Remediation and audit — hardening inherited or generated code

The companion to R16. Greenfield rules assume the agent authors from zero; this file is for the opposite — raising legacy, inherited, or LLM-generated code to the bar. The mode is *audit → remediate → prove*, not rewrite.

The mechanics below use JS/TS examples; the principle is substrate-agnostic — substitute the ecosystem's advisory database (GHSA / OSV / RustSec / PyPA / Go vuln DB), audit tool (`pnpm audit`, `pip-audit`, `cargo audit`, `govulncheck`, …), and fail-on-warning lint setting (`--max-warnings=0`, `ruff`/`clippy -D warnings`, …).

## Remediation workflow

1. **Map the real stack.** Read the manifest, lockfile, and build config — the repo is ground truth, not the stated framework (a "Next.js" app may be React Router / Vite). Classify the era (`01-stack-eras.md`) before planning.
2. **Inventory the alerts.** Pull the advisory list (Dependabot / `pnpm audit` / equivalent). For each, open the advisory — the patched version is its fixed-version range, not the `latest` dist-tag. (npm → GHSA + `pnpm audit`; Python → OSV/PyPA + `pip-audit`; Rust → RustSec + `cargo audit`; Go → `govulncheck`.)
3. **Rate by deployed exposure** (table below) before assigning urgency.
4. **Upgrade in lockstep.** Bump coupled families together; regenerate generated types; run typecheck, build, and tests.
5. **Triage residuals to zero.** Every remaining alert is fixed or dismissed with a recorded reason — no silent backlog.
6. **Prove it.** Each security claim links to a file and a test. Known defects that cannot ship-block get a backlog id and owner, never a bare "later."
7. **Sweep.** Run the migration grep-gates (below) to zero before handover.

## Coupled package families — pin in lockstep

| Family | Move together |
|---|---|
| Router runtime + dev + typegen | the framework's core package and its dev / codegen siblings to one exact version; regenerate types after |
| Linter core + plugins + config | linter engine, language plugin, shared config |
| Test runner + coverage provider | runner and its coverage adapter |
| Compiler + framework type packages | the language compiler and the framework's generated / ambient types |

A caret range that lets one sibling float produces type-generation and module-resolution breakage that looks like a code bug but is a version-skew bug.

## Exploitability by deployed runtime

The same advisory has different urgency by where the code runs. Map before rating; upgrade regardless to clear the alert, but report exposure honestly.

| Advisory targets | Static / SPA build (no server runtime) | Server / SSR deployment |
|---|---|---|
| Server runtime (loader / render, request handling) | not in the deployed path — low real exposure | real — prioritize |
| Client / SPA path (hydration, client routing, header handling) | real — prioritize | may not apply — verify |

The question is always: *is the vulnerable path actually deployed here?*

## When remediation isn't a clean bump

- **No fixed version** (abandoned / unmaintained package): replace the dependency, vendor a minimal patch, or accept-and-dismiss with a documented reason and a tracking issue — never leave it silently open.
- **The fix is a breaking major.** Clearing the alert is now a scoped migration, not a bump — surface it, size it, and ship it under R13 (its own PR with a scope boundary), not smuggled inside a security patch.
- **Inherited code with no tests.** Stand up the test runner and a characterization-test floor on the touched paths first; set the coverage gate at the current measured level and ratchet it up — a threshold is meaningless with no harness beneath it.

## Evidence-linked audit claim

Every line in a security or audit document is shaped **claim → file:symbol → proving test**.

> ✗ "Entity reads are access-scoped." (posture from intent)
> ✓ "Entity reads are access-scoped — `services/entity.ts:list()` filters by `accessScope`; proven by `entity.list.test.ts › rejects cross-tenant read`."

A claim without the file and test is not a finding, it is a hope. (For a dependency-vulnerability fix, the proof is the clean advisory/audit report at the pinned version, not a unit test.)

## CSRF for cookie / credential auth

When auth rides a cookie, CSRF defense is a *signed* (session-bound / HMAC) double-submit token or a synchronizer token — not the naive unsigned double-submit (bypassable via cookie injection), and not "deleted because a phase comment said so." Token-bearer (Authorization header) auth carries no ambient credential and does not need it. Evaluate against the auth model, not a blanket rule.

## Migration grep-gates (sweep to zero before handover)

Patterns are repo- and language-specific — adapt the markers (and their language) to the codebase.

- Stale phase / legacy markers: `rg -n 'Phase [0-9]|legacy parity|like legacy|ported from' src/` returns empty.
- Debug / scratch scripts: no `debug-*`, `tmp-*`, `scratch-*` committed.
- Orphaned config: deleting a tree deletes its references — grep configs for the removed path.
- Lint: no new warnings (`--max-warnings=0` or the ecosystem equivalent); pre-existing warnings are burned down on a tracked plan, not used to block the gate retroactively; no new disable directive without a one-line reason and a ticket.
- Coverage: thresholds count every in-scope file (untested counts as zero); critical modules gated per-file.

## Dependency cadence

Cadence is tempo-matched to the surface, not blanket: stable infrastructure updates on a slow cadence, fast-moving application deps on a quicker one. A lockfile-integrity install (`ci` / `--frozen-lockfile`) is the standing CI gate regardless of cadence.
