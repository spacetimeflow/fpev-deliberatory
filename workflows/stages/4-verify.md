# Stage 4 — Verify

Verify is the human's stage. The human reads what Execute produced, questions it and corrects it. The agent answers, revises and records.

Mechanical verification — tests, checks, conformance to the Plan — belongs to Execute and is finished before Verify opens (`workflows/stages/3-execute.md`). In Verify the agent runs further checks when the human asks for them.

## What Verify produces

```
handoffs/
└── stage-4-phase-{M}-{author}.md   ← one per phase the human opens
```

A phase starts from something the human says: a question, a doubt, a correction, a request to check. The agent numbers the phases in order. The stage has as many phases as the human needs.

## Pace and posture

**Slow.** Verify is the U's other bookend. The human sets the pace and the agenda. Wait for them; answer what they ask; do not offer a verdict and do not close the stage.

## What the agent brings

Before the human starts, Execute's closing handoff gives them:

- The result of every check the Plan named
- Every divergence, with its class
- Every gap: closed, open, or deferred with a reason
- **For the human**: the decisions that are theirs
- What is weak: what was not read, not tested, or assumed

## In each phase

1. **Record** the human's words, unchanged.
2. **State back** what they ask before answering, where it is not plain.
3. **Look first.** Read the files; run a check if they ask for one. Say what you did not check.
4. **Answer** what was asked.
5. **Revise now.** Where the human corrects the deliverable, the Frame or the Plan, change them in this cycle. Note the rest for the next.
6. **Write the phase handoff**: the human's point, what you found, what changed, what stays open for them.

## The test of understanding

The protocol asks whether the human can explain the result in their own words. Help with questions they can answer without looking. Do not answer for them.

## Closing

The human states the verdict and closes the stage:

- ✅ Pass
- ✅ Pass with caveats — gaps dispositioned
- ⛔ Block until a fix lands
- ↻ Re-cycle — back to Plan or Frame

Record it in the last phase handoff. Then write the **propagate-back consolidation**: what the next version's Frame should change, the gaps closed and deferred, the divergences recorded.

On request, generate an interactive HTML surface for the verdict (`workflows/decision-surfaces.md`).

## Propagate-back triggers

| Trigger | Updates |
|---|---|
| R4 divergence during Execute | Plan doc gets a `correction.md` sibling; or amended in place with `revised-at` |
| Missing class of deliverable | Frame doc adds a new constraint (C{N+1}) |
| Missing class of gap | Frame doc's gaps sibling gains a new gap |
| Architecture turned out wrong | Frame doc's architecture sibling gets a correction sibling |
| Audience misnamed | Frame doc's audience section gets refined |

Propagate-back is the protocol's mechanism for honest learning. The cost of doing it is small; the cost of *not* doing it is a Frame that lies about what the project is.

## Common Verify anti-patterns

- **Mechanical Verify.** Running tests in Stage 4 and calling it verification. Tests belong to Execute.
- **The agent's verdict.** Declaring pass. The verdict is the human's.
- **Deferring a correction.** Noting it for the next cycle when the human asked for it now.
- **Hiding divergences.** Quiet drift instead of recorded R-class.

## Exit criterion — when is the stage done?

When:

- The human has stated a verdict and the last phase handoff records it
- Every correction the human made is in the deliverable, the Frame or the Plan
- Every gap is closed or has an `assigned` for the next cycle
- Every divergence is classified and recorded
- The propagate-back consolidation is written

## See also

- `workflows/stages/3-execute.md` — the closing phase and its checks
- `workflows/divergence-classes.md` — R-class taxonomy + propagate-back
- `workflows/gap-lifecycle.md` — gap closure
