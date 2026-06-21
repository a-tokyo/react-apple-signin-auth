# production-grade

A principle-engineering posture as an agent skill. Add it to any coding model and it engineers like a
senior: it plans before it codes, reaches for the proper algorithm and data structure, makes writes
idempotent, types its errors, validates at boundaries, parameterizes its queries, and keeps money and
time correct — the judgment a model skips when left to its defaults. The skill is [`SKILL.md`](SKILL.md).

## Benchmark — same model, with the skill vs without

A skill's job is to improve the model running it, so the benchmark measures exactly that: the **same
model, with `production-grade` vs with no skill**, on identical tasks. Two arms (the bare model; the
model with `SKILL.md` as its system prompt), three models, **n=5** per cell, medians. Scoring **runs
the generated code** in a capable environment (Python 3.13 + the libraries best-practice code reaches
for) and checks engineering choices with structural probes — it does not reward the shortest snippet.
Everything is reproducible in [`benchmarks/production-grade/`](../../benchmarks/production-grade/) (self-tested).

### What the bare model gets wrong, and the skill gets right

Share of runs that ship the correct engineering choice — **bare model → with `production-grade`**:

| engineering choice (rule) | Haiku | Sonnet | Opus |
|---------------------------|:-----:|:------:|:----:|
| **idempotent writes** — no double-charge on retry (R6) | 0% → **90%** | 0% → **70%** | 0% → **70%** |
| **money as Decimal**, never binary float (R5, R8) | 0% → **80%** | 0% → **100%** | 100% → 100% |
| **timezone-aware datetime**, not naive `utcnow()` | 0% → **60%** | 100% → 100% | 0% → **100%** |
| **optimal complexity** — O(n) hash set, not an O(n²) loop (R4) | 20% → **100%** | 80% → **100%** | 100% → 100% |
| **no N+1 query** — one batched fetch, not a query per row (R6) | 80% → **100%** | 20% → **80%** | 60% → **100%** |
| **typed / domain errors**, not bare exceptions (R14) | 50% → **80%** | 50% → **65%** | 50% → **75%** |

Read the zeros: left to its defaults a model **never** makes a money transfer idempotent, stores money
in floating-point, and compares naive timestamps. `production-grade` is the review layer that turns each
of those into the correct choice — and it never moves a column backwards. (Tasks both already handle —
Fibonacci memoization, top-k, parameterized SQL, password-hashing and locking primitives — sit at ~100%
with or without the skill; they aren't differentiators, so they aren't listed.)

### It also writes less, and stays correct

On five everyday tasks the skill cuts the model's code **2–4×** while holding correctness:

| model | median LOC | correctness |
|-------|:----------:|:-----------:|
| Haiku  | 109 → **40** (−63%) | 100% → 100% |
| Sonnet | 87 → **23** (−74%) | 90% → **100%** |
| Opus   | 42 → **29** (−31%) | 100% → 100% |

(Correctness is on the four self-contained everyday tasks; on the fifth — a vague "rate-limit so users
can't spam" ask — the skill asks about the runtime instead of shipping an in-memory limiter that is
useless on serverless. That is the senior question, not a wrong answer.)

## Scope

`production-grade` is calibrated for non-trivial work — planning, schemas, security-sensitive paths,
reviews, refactors, hardening. On a one-line task it adds rigor a one-liner doesn't need; on a real
feature it adds the rigor the feature does. On complex tasks it ships *more* code than the bare model,
not less — the test, the idempotency, the typed errors the bare model omits.

## Install

```bash
npx skills add a-tokyo/agent-skills --skill production-grade
```

Reproduce every number above with [`benchmarks/production-grade/`](../../benchmarks/production-grade/).
