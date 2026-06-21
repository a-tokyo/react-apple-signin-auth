# Worked Example — one slice, two rounds, both adjudication directions

A tribunal cycle on a fictional `rate-limiter` module. Round 1: an adversary claim
SURVIVES verification (genuine bug, ITERATE). Round 2: a claim is REFUTED and excluded.

## Contents

- Slice spec (frozen before implementation)
- Round 1 — independent scorecards
- Round 1 — adjudication, synthesis, resolution
- Round 2 — fix, re-panel, refuted dissent

## Slice spec (frozen before implementation)

```
Slice 3 — rate-limiter (src/limiter.ts). Fixed-window limiter keyed by
client id; allow(clientId): boolean; window and limit from config.
AC1 at most `limit` requests per client per window; AC2 beyond the limit,
false until the window resets; AC3 client ids tracked independently;
AC4 tests cover the limit boundary and the window reset.
Verification: `npm test -- limiter` and `npm run lint` (both green).
Dimensions (equal weight): correctness, robustness, clarity. Target 0.80.
```

Doer reports DONE with fresh output (6 passing, lint clean). The orchestrator inspects
the diff itself, then dispatches three verifiers in parallel, context-walled.

## Round 1 — independent scorecards

| Dimension | Quality | Fitness | Adversary |
|---|---|---|---|
| correctness | 8 (conf 0.9) | 8 (conf 0.8) | 7 (conf 0.7) |
| robustness | 8 (conf 0.8) | 7 (conf 0.7) | 3 (conf 0.9) |
| clarity | 8 (conf 0.9) | 8 (conf 0.8) | 7 (conf 0.8) |
| Recommendation | SHIP_WITH_CAVEATS | SHIP_WITH_CAVEATS | ITERATE |

Adversary's robustness evidence (a 3 needs file:line + scenario): "src/limiter.ts:41 —
`if (now - state.windowStart >= windowMs) state.count = 0` resets the count but not
`windowStart`. Scenario: `limit` requests at t=999ms of a 1000ms window, `limit` more
at t=1001ms; both bursts pass — 2x the limit crosses the boundary. AC1 violated; no
straddling-burst test."

## Round 1 — adjudication, synthesis, resolution

Triggers: spread >= 2 on robustness (8 vs 3) fires; no score of 1; no confidence
divergence. Disputed set: robustness. The orchestrator spot-verifies the outlier
BEFORE any math: line 41 reads exactly as quoted, `windowStart` never advances, and the
straddling burst reproduces with a 3-line test. **The claim SURVIVES — the score
stands.** Synthesis (rationales anonymized as Rationale-1/2/3, shuffled):

| Member | robustness | Action |
|---|---|---|
| Quality | 8 -> 5 | REVISED: "the boundary scenario is real; my quote showed per-client tracking, not boundary safety." |
| Fitness | 7 -> 5 | REVISED: "confirmed by re-running the straddle case." |
| Adversary | 3 | MAINTAINED: "no opposing rationale addresses the straddling burst." |

Resolution: robustness 5, 5, 3 — majority pair (5, 5), consensus 5.0; adversary dissent
logged (3 vs 5, status: logged). Correctness (8,8,7) -> 7.67; clarity (8,8,7) -> 7.67.
Overall = (0.767 + 0.50 + 0.767) / 3 = **0.68** — below target - 0.10. **ITERATE.**
Ledger:

```
## Slice 3 - rate-limiter
- Round 1: Q=SHIP_WITH_CAVEATS F=SHIP_WITH_CAVEATS ADV=ITERATE -> ITERATE
- Dissents: ADV: robustness 3 vs consensus 5 - straddling burst passes 2x
  limit at window edge, src/limiter.ts:41 (status: logged; verified genuine)
- Caveats: window-boundary fix + straddle test required
- Panel rounds: 1 of 3
```

## Round 2 — fix, re-panel, refuted dissent

A fresh doer fixes the reset (`state.windowStart = now`), adds the straddle test,
reports DONE with fresh green output. Fresh verifiers re-score every dimension with the
round-1 finding attached as a flagged risk.

| Dimension | Quality | Fitness | Adversary |
|---|---|---|---|
| correctness | 9 (conf 0.9) | 8 (conf 0.9) | 8 (conf 0.7) |
| robustness | 8 (conf 0.9) | 8 (conf 0.8) | 4 (conf 0.6) |
| clarity | 8 (conf 0.9) | 8 (conf 0.8) | 8 (conf 0.8) |

Adversary robustness evidence: "src/limiter.ts:58 — the `resetWindow()` helper discards
in-flight requests when the window rolls over." Spread >= 2 fires again; the
orchestrator greps the artifact: **no `resetWindow()` exists anywhere in the diff** —
the reset is inline at line 41-42 and the module has no concurrency window. The quote
does not exist and the claim contradicts the artifact. **REFUTED — excluded from the
math**, preserved verbatim with status: refuted.

Resolution on survivors: robustness (8, 8) -> 8.0; correctness (9,8,8) -> 8.33; clarity
(8,8,8) -> 8.0. Overall = (0.833 + 0.80 + 0.80) / 3 = **0.81** >= target, no blocked
dimension, no surviving caveats. **SHIP.** No `ESCALATE:` was written, and a refuted
scenario leaves nothing unrebutted to surface. Ledger appends:

```
- Round 2: Q=SHIP F=SHIP ADV=ITERATE -> SHIP (overall 0.81; ADV robustness
  excluded as refuted)
- Dissents: ADV: robustness 4 vs consensus 8 - cited `resetWindow()` at
  src/limiter.ts:58; no such function exists (status: refuted)
- Caveats: none open; round-1 caveats fixed and re-verified (straddle test green)
- Panel rounds: 2 of 3
```

Both directions, one rule: real evidence forced an iteration a friendly panel would
have shipped; fabricated evidence could not sink a passing artifact. Check the
evidence; never average the disagreement. Non-code artifacts run identically —
verifiers quote section/paragraph instead of file:line; only the evidence type changes.
