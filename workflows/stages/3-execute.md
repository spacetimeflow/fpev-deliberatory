# Stage 3 — Execute

Execute produces the actual deliverables. **The output is one handoff per phase** plus the code/artifacts the Plan named.

## What Execute produces

```
handoffs/
├── stage-3-phase-0-{author}.md     ← phase 0 handoff
├── stage-3-phase-1-{author}.md
├── stage-3-phase-2-{author}.md
├── ...
└── stage-3-phase-N-{author}.md     ← final phase
```

Plus whatever Plan declared as each phase's deliverables (code, configs, schemas, tests).

Decision surfaces in Execute are unusual — Execute is fast, no judgment points. If you find yourself wanting a surface during Execute, ask whether you've leaked into Plan territory.

## Pace and posture

**Fast.** Execute is the bottom of the U. Frame has decided what, Plan has decided how; Execute does. The human is supposed to withdraw — that's the protocol's design. If you're calling for human judgment during Execute, something has gone wrong:

- A Plan decision is missing or insufficient → propagate-back to Plan
- A Frame principle is being violated → propagate-back to Frame
- The phase has hit a real unknown not anticipated by Plan → it's a gap; surface it, don't decide unilaterally

Execute trusts the upstream stages. When they're wrong, return; otherwise proceed.

## Required sections in each phase handoff

```markdown
---
stage: 3-execute
artifact: phase-N-handoff
project: {name}
phase: P{N} — {phase title from Plan}
status: complete
created-at: {YYYY-MM-DD}
authors: [{author-id}]
reads:
  - stage-2-plan-{author}.md (P{N} specification)
  - {prior phase's handoff if dependency}
  - {wiki topics consulted}
siblings:
  - stage-3-phase-{N-1}-...  (if depends on prior)
next-stage: ...
---

# Stage 3 Phase {N} — {title}

## Headline

One paragraph: what shipped, what it does, how to verify.

## Deliverables

Bulleted list with file paths and one-line descriptions, matching Plan's enumeration.

## Verification ran

The Plan-declared recipe, executed, with actual output:

```
$ npm run test:shim
=== Test 1: ... ✓
=== Test 2: ... ✓
...
=== Results: 42 passed, 0 failed ===
```

## Divergences

Any R-class divergence from Plan or Frame. Use the format in `workflows/divergence-classes.md`.

If no divergences: "No divergences from Plan. Phase {N} matches its specification."

## Gaps touched

Which gaps moved status during this phase:

- G7 → Resolving (started gathering evidence on hook coverage)
- G3 → Closed (evidence: artifact's `lastAuthor` field is the canonical source)

## What unblocks the next phase

If P{N+1} depends on P{N}:

- The deliverable contract P{N+1} expects is in place: ...
- Integration test passed: ...

## Uncertainty markers

Where the executor isn't fully confident:

- U-P{N}-1: ... (with mitigation)
```

## How to execute a phase

1. **Read Plan** — find your phase's spec in `stage-2-plan-{author}.md`
2. **Read Frame** — refresh the principles and constraints
3. **Read prior phase's handoff** if you depend on it
4. **Read relevant wiki topics** — the conceptual context
5. **Do the work** — write code, configs, schemas, tests
6. **Run the verification recipe Plan declared** — paste actual output into handoff
7. **Note divergences** if any
8. **Update gaps** that moved
9. **Write the phase handoff** matching the template above

## When to escalate during Execute

The protocol says "withdraw" — but there are exceptions. Escalate to human judgment when:

- **Irreversible** — about to delete code, force-push, send a message
- **Hard-constraint violation imminent** — would violate a C-rule
- **Gap not in Plan** — encountered an unknown the Plan didn't anticipate
- **Stage-boundary** — phase complete and triggering next phase needs human approval

Don't escalate for:
- Style preferences (Plan didn't say, just decide and document)
- Local refactors (your judgment; record R3 if it deviates from spec)
- "Should we write more tests" (yes; write them)

## α (autonomy) per phase

Plan declares α per phase. Translate to action:

| α range | Behavior |
|---|---|
| 0.0–0.3 | Ask human before each non-trivial step; small reversible actions only |
| 0.3–0.6 | Decide-and-document; ask for cross-phase decisions |
| 0.6–0.8 | Default — proceed; escalate only on hard-constraint risk |
| 0.8–1.0 | Full autonomy except irreversible / hard-constraint cases |

If you find yourself wanting to act outside the declared α, that's a signal — ask before acting.

## Parallel branches

If Plan declared parallel branches (e.g., `P4`, `P5`, `P6` all depend on P3 and converge at P7), they can be executed concurrently:

- Each branch can have its own agent / session
- Each writes its own phase handoff
- The converging phase (P7) reads all branch handoffs

State conflicts during parallel execution:
- Without a daemon (skill-native): branches write to different files; merge via git
- With a daemon (system-native): daemon arbitrates concurrent writes to state.json

## Divergence is normal

Execute *will* discover small surprises. The protocol expects this — that's why divergence-classes exist. **The mistake is to hide divergences, not to have them.**

| Surprise size | Action |
|---|---|
| Tiny (single-line refactor not in spec) | Just do it; mention in handoff |
| Small (filename slightly different from Plan) | Do it; record R3 |
| Medium (architecture detail differs from Plan) | Stop; record R4; propagate-back to Plan or continue with R4 logged |
| Large (Frame principle seems wrong) | Stop; escalate to human; propagate-back to Frame |

## Phase handoff anti-patterns

- **Verification recipe not run.** If you didn't actually run it, say so explicitly; don't fabricate output.
- **Divergences omitted.** "No divergences" is fine when true; hiding one when there was one is C8-violation-class.
- **Forward-looking promises.** "Will close G7 next phase" — Plan handles that, not you. Just record what happened.
- **Vague verification.** "Tests pass" without count or output is unverifiable.

## Exit criterion — when is the phase done?

When you can:

- Show the deliverables Plan declared, on disk
- Show the verification recipe output, in the handoff
- Hand off to the next phase (or stage) without it needing to read your code to know what changed

## The closing phase — mechanical verification

Execute ends by verifying its own work. Stage 4 is the human's; do not leave checks for it.

- **Components.** Run every verification recipe the Plan named. Record the command and its output.
- **Integration.** Run the pieces together, end to end. Dogfood where the deliverable can host real work.
- **Conformance to the Plan.** Give each deliverable a verdict: ✅ pass · ✅ pass-with-caveats · ✗ fail · ⏳ deferred.

Classify each failure (R1 to R4) and fix it or record its disposition. The closing handoff carries the results, the divergences, the state of every gap, the decisions that are the human's (**For the human**), and what is weak.

## Exit criterion — when is the stage done?

When all phases are complete and the closing phase has run every check. Stage 3 finishes; Stage 4 (Verify) starts on the human's word.

## See also

- `workflows/stages/2-plan.md` — Plan's structure (what Execute reads)
- `workflows/stages/4-verify.md` — what Execute's output enables
- `workflows/divergence-classes.md` — R-class taxonomy
- `workflows/gap-lifecycle.md` — updating gaps during Execute
