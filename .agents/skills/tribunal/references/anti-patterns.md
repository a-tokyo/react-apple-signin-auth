# Anti-Patterns — symptom, then fix

Seventeen ways tribunal runs go wrong, each with the observable symptom.

## Slop output (files left in the tree)
- SYMPTOM: the run leaves ledger / scorecard / scratch files (e.g. `.tribunal-gates.md`,
  per-verifier dumps, temp dirs) scattered in the repo; the deliverable is buried in clutter.
- FIX: the deliverable is the only durable file; verdicts/dissents/caveats go in the closing
  summary (and the PR/commit). Any working files go inside one gitignored `.tribunal/` dir,
  never committed.

## Orchestrator self-executing (role collapse)
- SYMPTOM: the orchestrator writes or edits the deliverable itself, or scores the artifact
  directly, instead of dispatching separate doer/verifier agents; the run has no independent
  artifact or panel and degrades to a single context (the failure mode that drops a model to
  its solo floor).
- FIX: the orchestrator only slices, dispatches, and adjudicates — it produces no deliverable
  content and assigns no scores. If it has touched the deliverable or scored anything, stop
  and re-dispatch that work to a fresh separate agent.

## Generic skepticism
- SYMPTOM: the adversary writes "could be more robust" / "consider edge cases" with no
  named scenario; its catch rate equals its false-positive rate.
- FIX: every concern names input -> wrong behavior. Discard unanchored concerns.

## Over-blocking
- SYMPTOM: BLOCK or "needs a rewrite" on an artifact whose defects are all localized
  one-line fixes; iteration stalls on a verdict the evidence does not support.
- FIX: verdict severity tracks repairability — local fixes are ITERATE with a fix
  list; BLOCK requires a majority-blocked dimension or a structural defect.

## Rubber-stamp panel
- SYMPTOM: unanimous quick SHIPs, no quoted evidence, no findings, on a non-trivial slice.
- FIX: a high score without a verbatim quote is invalid; reject and re-dispatch.

## Evidence-free findings
- SYMPTOM: findings phrased as opinions ("feels fragile") with no file:line, quote, or output.
- FIX: discard before consensus — an unanchored finding does not exist.

## Averaging away disagreement
- SYMPTOM: a 3-vs-8 split becomes "5.5, ship it" — or a confused outlier sinks a
  passing artifact — without anyone checking whose evidence is true.
- FIX: adjudicate first. Refuted -> excluded, logged; surviving -> drives the verdict.

## Trusting agent success reports
- SYMPTOM: "the doer said tests pass" goes straight to the panel; the diff was never
  opened; the change turns out partial or absent.
- FIX: on DONE, first inspect the actual diff and demand fresh command output.

## Context-wall leaks
- SYMPTOM: a verifier mentions the doer's intent or reasoning ("the implementer chose
  X because...").
- FIX: verifiers get only their RECEIVES list; a leaked scorecard is void — respawn.

## Consensus pressure
- SYMPTOM: round-1 scores cluster suspiciously; a verifier references "the other reviews."
- FIX: no peer scores or identities before synthesis; respawn any verifier that has seen them.

## Score anchoring
- SYMPTOM: scores hover around a number that appeared in the dispatch ("last round was 0.78").
- FIX: never reveal expected scores, prior-round scores, or target history to the panel.

## Halo inflation
- SYMPTOM: one excellent dimension and every other score within a point of it; a
  single paragraph justifies all scores.
- FIX: atomic per-dimension passes, each with its own evidence.

## Unbounded debate
- SYMPTOM: a second synthesis round "to fully converge"; positions converge to the
  most verbose member.
- FIX: exactly one synthesis round, then resolution math or escalation.

## Adversary drift to agreement
- SYMPTOM: the adversary opens with concessions, mirrors the majority, or scores a
  perfect 10 without exhausting its attack surface.
- FIX: "no flaw found" must be earned, stated, and rare; replace a drifting adversary
  with a fresh spawn.

## Verifying without pre-declared criteria
- SYMPTOM: the panel is asked "is this good?"; each verifier invents its own bar;
  scores are incomparable.
- FIX: criteria frozen before implementation are the rubric. No criteria, no panel.

## Wrong review order
- SYMPTOM: detailed craft feedback on code that builds the wrong thing.
- FIX: spec compliance (missing / extra / misunderstood) first; a spec failure caps
  the verdict at ITERATE regardless of craft scores.

## Counter conflation
- SYMPTOM: doer re-dispatches logged as panel rounds (or vice versa); a slice
  escalates with budget unspent, or burns unbounded retries.
- FIX: two counters, both capped — doer dispatches (default 5) and max 3 panel
  rounds; whichever exhausts first escalates.
