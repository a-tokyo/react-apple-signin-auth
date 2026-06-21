---
name: tribunal
version: 0.0.2
license: MIT
description: >-
  Runs a doer -> verifier-panel -> consensus loop to verify a deliverable before it ships.
  An orchestrator freezes acceptance criteria before implementation, dispatches a doer, then
  convenes a context-walled panel of independent verifiers - including an adversary with an
  explicit must-oppose mandate - for evidence-anchored review adjudicated to a SHIP /
  SHIP_WITH_CAVEATS / ITERATE / BLOCK / ESCALATE verdict logged to a ledger. Use for
  multi-agent verification of any artifact - code slices, plans, documents, audits -
  whenever asked to verify a deliverable, vet a plan, run a consensus review or independent
  review, set up a doer-verifier loop, or gate a ship decision. Works on any platform with
  parallel subagents; degrades to sequential fresh-context sessions without them. Not for
  trivial single-file edits or ordinary code review.
---

# Tribunal

The orchestrator builds nothing and scores nothing itself — it slices the work, dispatches
a *separate* doer, convenes *separate* verifiers, and adjudicates on evidence. Three
behaviors carry the value: an **adversarial second look** that catches
what a single pass ships silently, as named failure scenarios; **calibrated verdicts**
— locally fixable defects get ITERATE, not "rewrite everything", and passing math is
overridden only by verified evidence; **evidence before claims** — nothing is "done"
without fresh reproduction; refuted claims are excluded, never averaged in. Announce
at start: "Running this through the tribunal pattern: doer -> verifier panel -> consensus."

## When to use

Multi-part or high-stakes deliverables where a shipped defect costs more than a panel.
Not for trivial edits, anything one verification command proves, or ordinary code
review (dialogue improving a change vs independent measurements of a frozen artifact
against pre-declared criteria, adjudicated to a ship decision). Never nest tribunals
— no role runs the protocol on its own output.

## The loop

1. Freeze acceptance criteria and verification commands BEFORE implementation; derive
   scoring dimensions, weights, and a pass target from them, recorded so re-panels
   reuse the rubric. Identify the operative skills in play — those bearing on how the
   artifact is built or judged (e.g. production-grade); never the tribunal skill itself
   nor pure orchestration skills — and fold their standards into the criteria. Verify-only
   entry (artifact already exists): write criteria from the original request — never
   reverse-engineered from it — freeze, start at step 3.
2. Spawn a SEPARATE doer agent (never the orchestrator itself) with the full slice spec
   pasted in (never "read the plan file") and the operative skills named with an
   instruction to load them (load production-grade, etc.) — if it cannot load a named
   skill it says so rather than proceeding. If the orchestrator writes or edits the
   deliverable, there is no independent artifact to verify and the run collapses to one
   context. The doer implements, runs the verification commands, and reports a diff
   summary, verbatim output, and exactly one status (table below).
3. Check the report against the actual diff yourself; dispatch the panel in parallel, context-walled.
4. Adjudicate per [consensus-mechanics.md](references/consensus-mechanics.md); record
   verdict, dissents, caveats, and round count in the ledger.
5. SHIP -> next slice. ITERATE -> findings become a fix list for a fresh doer;
   re-panel with fresh verifiers re-scoring every dimension, prior findings as risks.

## Invariants (low freedom — these are the skill)

1. **Context wall.** Four roles, four separate sessions: the orchestrator (slices,
   dispatches, adjudicates, owns the ledger — produces NO deliverable content and assigns
   NO scores itself), the doer, and each verifier. One agent never plays two roles (shared
   context = shared blind spots = no triangulation, the entire point). The doer finishes
   first; then the
   verifiers run in parallel, each RECEIVING exactly: frozen criteria; the artifact
   (diff + new-file paths, or the document + its predecessor); reference materials;
   permission to run the verification commands; known risks; the operative skills
   (named, to load). Verifiers NEVER receive:
   the doer's reasoning or self-assessment, design rationale, each other's first-round
   views or identities, expected or prior scores. Naming shared standards is not a wall
   breach — the wall withholds the doer's reasoning and scores, not the bar everyone is
   measured against.
2. **Evidence anchoring.** High scores require a verbatim quote from the artifact;
   failure claims require file:line or command output; evidence-free findings are
   discarded. Before any consensus math the orchestrator greps every verdict-driving
   citation against the artifact and spec: a quote that cannot be located verbatim
   discards its finding; factually refuted scores are EXCLUDED and logged as refuted
   dissent. Adjudicate on evidence — never average disagreement away.
3. **Explicit opposition.** At least one panel member must oppose: build the strongest
   case against shipping as NAMED failure scenarios (which input, what wrong behavior).
   Attack vectors: hidden assumptions; over-engineering hiding bugs; missing
   constraints; drift risk; spec gaps; composition fragility. Generic skepticism is
   worthless — discard it. Confirm every accusation against the spec text first; never
   flag behavior the spec mandates. An unrebutted correctness or safety scenario from
   any member is never silently overruled: surface it (ESCALATE).
4. **Criteria precede the artifact** — frozen before implementation, or from the original request in verify-only mode.
5. **No completion claims without fresh verification output.** "Should pass" is not
   evidence; agent-reported success is checked against the actual artifact and diff.
6. **Bounded iteration.** Max 3 panel rounds per slice (fresh verifiers each round)
   plus a separate doer-dispatch budget (default 5, complexity-weighted); whichever
   exhausts first -> ESCALATE to the human with the full evidence package.

| Doer status | Orchestrator handling |
|---|---|
| DONE | Verify diff exists and commands ran; proceed to panel. |
| DONE_WITH_CONCERNS | Correctness/scope concerns: address before panel. Observations: log, proceed. |
| NEEDS_CONTEXT | Supply the missing context; re-dispatch the same model. |
| BLOCKED | Triage in order: more context, a more capable model, decompose the slice, escalate. Never retry the same model unchanged — change at least one of context, model, task size. |

| Verdict | Trigger |
|---|---|
| SHIP | Overall at or above target; no dimension blocked. |
| SHIP_WITH_CAVEATS | In the caveat band [target − 0.10, target), only non-blocking caveats. During a build this is an ITERATE trigger: each caveat fixed and re-verified, or deferred with a logged reason — final only if the human accepts. |
| ITERATE | Below the caveat band; a surviving blocking caveat (one asserting a correctness/safety defect, or lacking a concrete fix or logged deferral); or a blocked dimension whose causes are all localized, enumerable fixes (regardless of overall) — with a mandatory fix list. Math decides unless a verified (unrefuted) failure scenario overrides. |
| BLOCK | The defect set is structural: remediation needs redesign, not an enumerable list of localized fixes — or proceeding is unsafe. Low scores alone never force BLOCK: a majority-blocked dimension whose causes are all localized fixes is ITERATE with a mandatory fix list. |
| ESCALATE | Deadlock, an unrebutted opposition scenario, or budgets exhausted. Orchestrator-only — never a panel recommendation. |

Calibration: BLOCK is structural. Many severe defects that are each a localized fix in
a sound architecture make ITERATE, not BLOCK — severity sets fix priority, never the
verdict class. A blocked dimension (majority at 3 or below) never lets a passing overall
slip through as SHIP: with localized causes it is ITERATE plus a mandatory fix list, even
when overall ≥ target; only structural causes reach BLOCK. Consistency check before
issuing BLOCK: if the report itself describes every defect as locally fixable, BLOCK
contradicts the evidence — issue ITERATE. One member's low score is a logged dissent, not
a block.

## Panel composition (derive per artifact)

Independent vantage points triangulate ground truth; the rest is sizing. Default three
lenses: quality (spec compliance first — missing / extra / misunderstood — then
correctness), fitness-for-purpose (real consumer, edge cases, integration), and the
adversary (must oppose). Scale to stakes — two reviewers for a small low-risk slice,
five lenses for a high-stakes irreversible one — picking lenses from the artifact's
actual risk surface. Example: a data-migration script risks data loss and partial
failure -> transform-correctness, a rollback/idempotency adversary, operator
experience; an API doc -> consistency, consumer ergonomics, a breaking-change adversary.
Never give the adversary a weaker model than the rest of the panel; when available, a
different model family on the panel buys uncorrelated blind spots.

## Verifier prompt skeleton (write each prompt from this)

```
Role: <lens> verifier. You have NOT seen the builder's reasoning or any other
reviewer's views. The report you judge may be wrong — verify everything against
the artifact itself, as-is.
[Adversary only: You MUST oppose — build the strongest case against shipping;
name the exact failure scenario per concern. Write "ESCALATE: <reason>" for a
correctness/safety concern you believe cannot be rebutted.]
Inputs: frozen criteria; dimensions/weights/target; artifact; references; verification commands (you may run them); known risks; operative skills (named — load them; if you cannot, say so).
Rules: score each dimension separately, 1-10, with confidence 0.0-1.0; every
claim cites a verbatim quote, file:line, or command output. Citations WILL be
grepped against the artifact and spec — one that does not exist verbatim
discards the finding.
Output: per-dimension score + confidence + evidence; top concern;
recommendation SHIP|SHIP_WITH_CAVEATS|ITERATE|BLOCK; escalation if any.
```

## Records

The deliverable is the ONLY durable artifact a tribunal run produces. Report the
verdict, dissents (incl. refuted, verbatim), caveats (fixed | deferred + reason), and
panel-round counts in your closing summary — and fold them into the PR description or
commit message when one exists. Never leave loose files in the tree. If a run genuinely
needs working files (a running ledger across many slices, temp fixtures), put them ALL
inside a single gitignored `.tribunal/` directory and never commit it; nothing else is
written. Never silently drop a caveat.

## Plan vetting (same machinery, earlier)

Before executing a non-trivial plan, run it past three independent lenses: will it work
(are the checks specific?), can the doer follow it, is it the cheapest sufficient path.
2-of-3 approval proceeds; otherwise merge the critiques into exactly ONE refinement
pass, re-vet once, then escalate. Vetting freezes the criteria the panel later audits.

## Platforms

With parallel subagents, dispatch the panel as parallel calls in one message — separate
agents, real independence. Without parallel dispatch, run each role as its own sequential
fresh-context session (still distinct agents), enforcing the wall by what each session
receives. One agent playing every role forfeits the triangulation benefit — measured
equal to no panel at all (a weak model self-simulating a panel scores at its solo floor);
use only when no separate-session option exists, and label the verdict "single-context
(no independence)".

End-to-end example: [worked-example.md](references/worked-example.md).
Failure catalogue: [anti-patterns.md](references/anti-patterns.md).
