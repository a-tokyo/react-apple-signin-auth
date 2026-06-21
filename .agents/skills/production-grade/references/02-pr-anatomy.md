# 02 — PR anatomy, commits, branches

The shape below is the **target**. Local PR template wins where it exists — the agent **extends** it, never replaces it. Append missing sections under their canonical headers.

## Contents

PR body fixed order (Intent · Scope boundary · Approach · Alternatives · RCA · Security impact · Performance impact · Tests · Rollback · Open questions · Made-with) · Commits · Branches · Review behaviour

---

## PR body — fixed order

```markdown
## Intent
One sentence. Reader decides whether to keep reading from this line alone.

## Scope boundary
- Touches: `<files / modules / surfaces>`.
- Deliberately does **not** touch: `<considered-and-deferred>`.
- Why the boundary is here.

## Approach
3–6 bullets or a short paragraph.

**Alternatives considered**
- `<rejected A>` — why not.
- `<rejected B>` — why not.

## Root cause analysis  *(bug-fix PRs only)*
- **Symptom** — what the user / monitoring / test saw.
- **Reproduction** — exact steps or seed.
- **First-principles trace** — what the code did vs. what it should have done.
- **Root cause** — the precise line / contract / assumption that broke.
- **Fix** — minimal change that resolves the root cause.
- **Blast radius** — what else this code touches; what was checked.
- **Regression test** — the test that would have caught this.

> Two systems is two RCAs. Never one merged hand-wave.

## Security impact
- Who can call this surface? What can they do? What can they **not** do?
- How does it fail closed? What is the audit trail?
- Any new secrets / scopes / permissions / CSP / HMAC / signed URLs.

If "no security impact," say so explicitly with a one-line justification. Don't omit.

## Performance impact
- Big-O for any non-trivial loop.
- DB changes: paste `EXPLAIN ANALYZE` (Postgres) / `.explain("executionStats")` (Mongo) / platform-specific index trace.
- Frontend: bundle delta if non-trivial; render-path notes if hot.
- Background work: queue depth, retry semantics, idempotency.

If "no performance impact," say so explicitly with a one-line justification.

## Tests
- **Critical path** — `<test names>`.
- **Edges** — `<test names>`.
- **Regressions** — `<test names>` (link the original issue / PR).
- **Deliberately not covered** — what and why.

## Rollback
Exact revert command. Down-migration. Off-state for a flag. Kill-switch location.

## Open questions
Each one *answerable* — "should the timeout be 5s or 10s, given downstream X has SLA Y?", not "should we do this differently?".

## Made-with
*(Only when the local convention uses agent-attribution trailers.)*
`Made-with: Cursor` / `Made-with: Claude Code` / `Made-with: Codex`.
```

Order is fixed. Reviewers learn it once.

---

## Commits — match local convention

Detect from `git log -50`. Two shapes:

**Gitmoji + Conventional** (only where the local log already uses Gitmoji — see <https://gitmoji.dev>):
`✨ feat(scope): …` · `🐛 fix(scope): …` · `♻️ refactor(scope): …` · `📝 docs(scope): …` · `✅ test(scope): …` · `🔒 security(scope): …` · `⚡ perf(scope): …` · `🚀 deploy: …`

**Plain Conventional** (everywhere else):
`feat(scope): …` · `fix(scope): …` · `docs(scope): …` · `test(scope): …` · `chore(scope): …` · `refactor(scope): …` · `perf(scope): …` · `build(scope): …`

**Body.** Most commits don't need one. When they do (perf / security / refactor / RCA-driven), the body is the PR body in miniature: intent, approach, alternatives, rollback. One commit, one decision.

---

## Branches

`feat/` · `fix/` · `chore/` · `refactor/` · `perf/` · `security/` · `docs/` · `release/` · `hotfix/` · `autoresearch/` — each followed by `<scope>-<slug>` (kebab-case, ≤4 words; scope = package / module / app). `release/<version>` for release branches.

---

## Review behaviour

As **reviewer**:

- Read **scope boundary** first; then read the diff *outside* it to verify the boundary holds.
- Missing sections (no scope boundary / no rollback / no "deliberately not covered") → comment, not blocker.
- Same RCA model on bug fixes — symptom → repro → trace → root cause → fix.
- Distinguish 🔴 critical · 🟡 suggestion · 🟢 nice-to-have — using *words* in the actual review (no emoji unless the local repo uses them).

As **author**: self-review with the same lens before requesting human review.

---

*Search keywords: PR template, commit, branch, gitmoji, conventional commits, scope boundary, RCA, security impact, performance impact, rollback, sister-PR, rename PR, tests, open questions, made-with, reviewer.*
