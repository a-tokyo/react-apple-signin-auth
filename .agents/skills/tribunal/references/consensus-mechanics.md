# Consensus Mechanics

The exact-number parts of the protocol. Everything not pinned here is derived per
artifact from the frozen criteria and recorded in the ledger.

## Contents

- [Scoring and confidence](#scoring-and-confidence)
- [Disagreement triggers](#disagreement-triggers)
- [Synthesis round](#synthesis-round)
- [Resolution math](#resolution-math)
- [Verdict thresholds](#verdict-thresholds)
- [Evidence-based adjudication](#evidence-based-adjudication)
- [Escalation package](#escalation-package)
- [Orchestrator checklist](#orchestrator-checklist)

## Scoring and confidence

Scale 1-10 per dimension, each dimension scored in its own evaluation pass — a single
holistic score invites halo inflation. Each score carries a confidence 0.0-1.0
(reported signal only, never a score multiplier — consensus math is the plain mean of
converging scores). Evidence rises with extremity: 8+ needs a verbatim quote from the
artifact; 3 or lower needs the failing file:line, section, or command output;
unanchored findings are discarded before consensus.

## Disagreement triggers

A synthesis round fires when ANY of these holds. Evaluate all four every round; the
disputed set is the union of flagged dimensions.

1. **Spread** — spread of 2+ points on any dimension across members.
2. **Pass/fail split** — one member's weighted overall meets the target while another's falls more than 0.15 below it.
3. **Opposition veto** — the adversary scores any dimension at 1. Automatic.
4. **Confidence divergence** — confidence below 0.5 against above 0.8 on one dimension.

No trigger and nothing refuted in adjudication: consensus reached, compute the score.

## Synthesis round

Exactly one — more rounds converge to the most verbose member, not the most correct.

1. Harvest each member's rationale from its scorecard, disputed dimensions only, max
   500 words (no separate dispatch). Anonymize (strip role labels, relabel
   Rationale-1/2/3) and shuffle order — members weigh arguments, not sources.
2. Share all rationales with all members simultaneously. Per disputed dimension each
   member must REVISE with justification or MAINTAIN with a one-sentence rebuttal to
   the strongest opposing argument. Undisputed dimensions are frozen.
3. A member whose score was excluded as refuted sits out that dimension. If exclusions
   resolve every flagged dimension (re-run the triggers on survivors), skip synthesis.

## Resolution math

- **Converged** — every dimension within a 1-point spread: consensus = mean of all 3.
- **Majority** — a pair within 1 point on each disputed dimension: consensus = mean
  of the agreeing pair; the dissent is excluded from math, preserved verbatim in the
  ledger. More than one qualifying pair: median; furthest member is the logged dissenter.
- **Deadlock** — no pair within 1 point on some dimension: ESCALATE with all scorecards and rationales.

Weighted overall: `overall = sum(dimension_consensus / 10 * weight)`.

## Verdict thresholds

Target supplied by the criteria (default 0.80 normalized).

| Condition | Verdict |
|---|---|
| overall >= target AND no dimension blocked | SHIP |
| caveat band [target - 0.10, target), only non-blocking caveats | SHIP_WITH_CAVEATS |
| overall < target - 0.10; a surviving blocking caveat; or a blocked dimension whose causes are all localized, enumerable fixes (regardless of overall) — with a mandatory fix list | ITERATE |
| a blocked dimension whose causes are structural (redesign, not enumerable localized fixes) or unsafe to proceed past | BLOCK, regardless of overall |
| deadlock, unrebutted opposition scenario, or max 3 panel rounds exhausted | ESCALATE |

A **blocked dimension** needs a MAJORITY at 3 or below — a lone low score is a logged
dissent, not a block. A blocked dimension forces BLOCK only when its causes are
structural; if every cause is a localized, enumerable fix, the verdict is ITERATE with
a mandatory fix list (low scores set fix priority, never the verdict class).
A **non-blocking caveat** asserts no correctness or safety defect
and carries a concrete fix or a logged deferral; a **blocking caveat** is its
complement — it asserts a correctness or safety defect, or lacks a concrete fix or
logged deferral. The math decides unless a verified
(unrefuted) failure scenario overrides it; never let an unverified outlier sink a
passing artifact — adjudicate first. The ITERATE feedback packet to the fresh doer:
top concern per member, named failure scenarios, per-dimension scores, the fix list.

## Evidence-based adjudication

Run BEFORE consensus math whenever a trigger fires or a score is an outlier (2+ from
both peers).

1. Verify the outlier's cited evidence claim by claim against the artifact: does the
   quote exist? does it behave as claimed? Re-run commands in a clean workspace if needed.
2. REFUTED means failed factual verification — the quote does not exist, the file:line
   does not show the failure, or the claim contradicts what the artifact demonstrably
   does. "I disagree with the judgment" is not refutation.
3. All load-bearing claims refuted: exclude the score from the math; log it verbatim
   as refuted dissent. Any claim survives: the score stands; surviving observations
   become iterate items even when the verdict passes.
4. After exclusions, re-run the triggers on surviving scores; majority/BLOCK rules
   count survivors. Two survivors within 1 point: treat as the majority pair. Further
   apart: deadlock. A single survivor never decides a dimension — dispatch one fresh
   replacement verifier for it, or ESCALATE.

Never exclude a score for an inconvenient number — exclusion requires the rationale to
fail verification. A naive mean over a confused judge and a rubber stamp over an ignored judge both mean nobody checked.

## Escalation package

When escalating to the human, deliver: the scenario verbatim, all scorecards on the
disputed dimensions, the synthesis rebuttals, the adjudication findings (claims
verified vs refuted), the artifact location, and a suggested next step — never a bare
"the panel disagrees."

## Orchestrator checklist

1. Freeze criteria; derive dimensions, weights, target; record them.
2. Verify the doer's report against the actual diff and fresh command output.
3. Dispatch verifiers in parallel with their RECEIVES list only.
4. Collect scorecards; discard evidence-free findings (malformed scorecard: one fresh
   re-dispatch, same lens, else exclude that member).
5. Adjudicate outliers; exclude refuted scores; log refuted dissent.
6. Run all four triggers; if any fires, run the one synthesis round.
7. Resolve: converged / majority / deadlock; a lone survivor on a dimension never
   decides it — dispatch one fresh replacement verifier or ESCALATE; map to verdict;
   honor any `ESCALATE:`.
8. Record round verdicts, dissents (incl. refuted), caveats, and panel-rounds-used in the
   closing summary (and the PR/commit if one exists) — not as committed files; a gitignored
   `.tribunal/` scratch file only if the run is too large to hold in context.
9. SHIP: next slice. ITERATE: feedback packet -> fresh doer -> fresh panel. BLOCK or
   ESCALATE: stop and surface.
