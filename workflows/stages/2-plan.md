# Stage 2 — Plan

Plan converts Frame's intent into a concrete sequence of work. **The output is one plan document** (or a few siblings, for very large cycles) with a Phase DAG, a decisions table, and a deliverable enumeration.

## What Plan produces

```
handoffs/
└── stage-2-plan-{author}.md
```

Plus a decision surface (cards format usually):

```
references/surfaces/
└── stage-2-plan-cards.html
```

Optional sibling for very large plans:

```
handoffs/stage-2-plan-decisions-{author}.md     ← if decisions table is huge
handoffs/stage-2-plan-deliverables-{author}.md  ← if deliverable enum is huge
```

## Pace and posture

**Fast.** Plan converges. By the time Plan starts, Frame has settled the principles. Plan's job is mechanical: which deliverables, in what order, with what decisions, to satisfy Frame.

Plan should feel like **commitment**. Each decision in the decisions table is a fork the cycle will not revisit unless Verify propagates-back. Make them deliberately.

## Required sections

### 1. TL;DR

One paragraph for the executor: "this cycle ships X by doing Y through Z, with N decisions committed and P phases sequenced."

### 2. Decisions table

The load-bearing artifact of Plan. Each row commits a choice that the rest of the cycle assumes.

```markdown
| ID | Decision | Choice | Why | If wrong |
|----|----------|--------|-----|----------|
| D1 | Layer-3 engine | Extended Pi-FASTRIC via shim | Lightest, lowest LoC | R9 tripwire at 800 LoC |
| D2 | v0 channel set | HTML cockpit + GitHub bridge | Two channels exercise multi-venue | Defer email/TUI to v1 |
| D3 | Implementation language | TypeScript | Pi-FASTRIC is TS | Switch costs all of v0 |
| ... | ... | ... | ... | ... |
```

Conventions:
- IDs `D1`, `D2`, `D3`, … (sequential, never reused)
- "If wrong" names the propagate-back cost — what gets thrown out if the decision turns out wrong
- Every decision links back to a Frame principle or constraint that motivates it

### 3. Phase DAG

The execution shape. Phases are nodes; dependencies are edges. Run-time-ordered.

```markdown
| Phase | Deliverable | Depends on | Branch | α (autonomy) |
|-------|-------------|------------|--------|--------------|
| P0 | Engine evaluation | — | engine | 0.4 |
| P1 | Shim implementation | P0 | engine | 0.7 |
| P2 | FSM definitions | P1 | engine | 0.7 |
| P3 | State daemon | P2 | engine | 0.5 |
| P4 | Cockpit | P3 | UX | 0.6 |
| P5 | Surface generator | P3 | UX | 0.6 |
| P6 | GitHub bridge | P3 | UX | 0.5 |
| P7 | First-cycle dogfood | P4, P5, P6 | integration | 0.2 |
```

Conventions:
- IDs `P0`, `P1`, `P2`, … (sequential by topological order; not reordered if dependency graph changes)
- `branch` is for parallel coordination — phases in different branches can run concurrently
- `α` (alpha) is the autonomy level Execute should use for that phase (0 = human controls, 1 = full agent autonomy)
- Plan can also serialize as a `phase.dag.md` file with mermaid `flowchart LR`

### 4. Deliverable enumeration

For each phase, what artifacts ship:

```markdown
## P1 — Shim implementation

Deliverables:
- `src/state/multi-fsm-store.ts` — wraps Pi-FASTRIC's InterAgentFSM
- `src/state/fsm-mutator.ts` — applyDelta with audit trail
- `src/state/state-file-io.ts` — atomic write to state.json
- `src/state/index.ts` — barrel export
- `src/state/tests.ts` — 4 unit tests

Verification recipe: `npx tsx src/state/tests.ts` exits 0; all 4 tests pass.
LoC budget: ~500 (R9 tripwire at 800)
```

### 5. Verification recipes per phase

Each phase declares **how to verify** its deliverable. This is what Stage-4 Verify reads to check conformance.

| Phase | Verification |
|-------|--------------|
| P1 | `npm run test:shim` exits 0; 4 tests pass; LoC < 800 |
| P3 | `npm run test:daemon` exits 0; 100× parallel-approve has 0 torn writes |
| P6 | One Stage-2→Stage-3 PR opens and merges through the bridge |
| P7 | First end-to-end cycle complete; state.json shows cycle.complete |

### 6. Tripwires and budgets

Numerical limits that, if exceeded, trigger reconsideration:

```markdown
- **R9 tripwire:** shim ≤ 800 LoC. If exceeded, reconsider D1 (engine choice).
- **R10 tripwire:** daemon test suite must include a 100× concurrent-write test.
- **Performance budget:** state.json < 100 KB after one full cycle.
```

### 7. Parallel branch coordination

If multiple phases run in parallel, declare how branches converge:

```markdown
- Branches `engine` and `UX` run sequentially: UX starts after engine completes.
- Branch `UX` itself has three concurrent phases (P4, P5, P6) that converge at P7.
- P7 cannot start until all three of {P4, P5, P6} are complete.
```

### 8. Uncertainty markers

Where Plan is committing under known incomplete information. These are *not* gaps (gaps are Frame's job); these are Plan's awareness that some decisions are best-guess.

## How to start a Plan

1. Read the Frame triptych — all three siblings
2. List every principle and constraint that pressures Plan's structure
3. For each principle/constraint, identify what phase satisfies it
4. Identify the natural deliverable boundaries — usually file-level (`multi-fsm-store.ts`, `daemon.ts`)
5. Sequence the deliverables by dependency
6. For each branch point, decide: parallel or serial?
7. For each fork in the road, commit a decision and record it in the decisions table
8. Set α per phase using the U-shape (low at Frame/Verify-adjacent phases, higher in middle)

## Sniff tests for Plan

| Test | Pass criterion |
|---|---|
| Can Execute follow this without re-deriving choices? | Yes — every fork is committed in decisions table |
| Is every gap from Frame assigned a phase that closes it? | Yes — Plan declares the phase where each gap closes |
| Is the verification recipe specific enough to enforce? | Yes — concrete commands and pass criteria, not vague "tests pass" |
| Are tripwires numerical? | Yes — "≤ 800 LoC" not "small" |
| Are parallel branches genuinely independent? | Yes — no hidden cross-branch dependencies |

## When Plan should propagate-back to Frame

- If converting Frame's principles into deliverables reveals a missing principle → propagate-back
- If a hard constraint can't be satisfied by any feasible Plan → either propagate-back to relax the constraint or document why the constraint must hold (kill the work)
- If the gap list doesn't cover what Plan would need to verify → propagate-back to add gaps

Don't quietly route around Frame. Propagate-back is cheap; quiet drift is expensive.

## What Plan is NOT

- **Not Frame.** Don't restate problem, principles, audience; reference them.
- **Not Execute.** Don't write code; commit decisions and sequence the work.
- **Not Verify.** Don't predict outcomes; declare verification recipes.
- **Not exhaustive of branches.** Pick the branch you'll execute. Document explored alternatives in decisions only if they matter for "if wrong" rollback.

## Exit criterion — when is Plan done?

When you can hand the plan to an executor (agent or yourself) and they can produce P0 without asking clarifying questions.

If clarifying questions arise during Execute, that's a Plan deficiency — record it and propagate-back to the Plan doc rather than improvising.

## See also

- `~/.fpev/cadence.md`
- `~/.fpev/stages/1-frame.md` — what Plan reads
- `~/.fpev/stages/3-execute.md` — what Plan enables
- `~/.fpev/decision-surfaces.md` — generating Plan cards
