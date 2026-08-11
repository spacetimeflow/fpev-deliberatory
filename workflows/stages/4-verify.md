# Stage 4 — Verify

Verify is the slow close. It confirms that Execute shipped what Plan said, records divergences honestly, closes (or honestly defers) every Open gap, and triggers propagate-back into the next cycle's Frame.

## What Verify produces

```
handoffs/
├── stage-4-phase-1-{author}.md     ← Layer 1 (component checks)
├── stage-4-phase-2-{author}.md     ← Layer 2 (integration) + dogfood
├── stage-4-phase-3-{author}.md     ← propagate-back consolidation + final verdict
└── stage-4-verify-{author}.html    ← interactive verification surface (the verdict-input doc)
```

Plus updates to `wiki/topics/recovery-vs-termination-{author}.md` (R-class log).

## Pace and posture

**Slow.** Verify is the U's other bookend. After fast Execute, the cycle needs time to:

- Run every verification recipe Plan declared
- Confirm every gap closed (or document why deferred)
- Surface productive divergences from Execute
- Decide propagate-back into next-cycle Frame
- Sign off

Rushed Verify produces false-confident verdicts. Take the time.

## The three layers

Verify is structured as three layers, each with its own phase handoff:

### Layer 1 — Component checks (Phase 1)

For each component Plan declared, run its verification recipe in isolation. Pass/fail per component. Record what was tested, with what output, against what spec.

This is mechanical. The component either passes its own harness or it doesn't.

```markdown
| Component | Verification recipe | Result |
|---|---|---|
| Shim | `npm run test:shim` | ✅ 42/42 pass |
| Daemon | `npm run test:daemon` | ✅ 35/35 pass (after state reset) |
| Bridge | `node --test src/bridges/...` | ✅ 23/23 pass, 1 SKIP (E2E manual) |
| ... | ... | ... |
```

If a component fails: classify the failure (R1/R2/R3/R4), record, and decide disposition (hotfix, defer, accept).

### Layer 2 — Integration (Phase 2)

End-to-end scenarios. Components individually pass; do they work together?

- Cockpit-driven approve flow: agent → daemon → state.json → cockpit
- Bridge-driven PR merge: gh → bridge → daemon
- Full Phase DAG sweep: P0 → P1 → ... → final
- Dogfood: use the cycle's own output to host another cycle (if applicable)

This is where most surprises emerge. Two pieces that work individually may have subtle handoff mismatches.

### Layer 3 — Plan conformance (Phase 3) + propagate-back

For each Plan deliverable, confirm what shipped. Each deliverable gets a verdict:

- ✅ pass — matches Plan exactly
- ✅ pass-with-caveats — matches Plan; documented gap with disposition
- ✗ fail — diverges from Plan; not dispositioned
- ⏳ deferred — required Plan recipe not exercised this cycle

Then write the **propagate-back consolidation doc** — what should change in the next cycle's Frame given what Verify found.

## The interactive verify surface

Beyond the markdown handoffs, Verify produces an **interactive HTML surface** (`stage-4-verify-{author}.html`) with:

- Layer-1 per-component cards with status radios (pass/caveat/fail/skip)
- Known-issue disposition radios (hotfix-v0.1 / defer-v1 / accept)
- Open questions with textareas for the verifier's answers
- A final verdict radio (pass / pass-with-caveats / block-on-hotfix / re-cycle)
- localStorage autosave; export to JSON

The HTML surface is the **decision-input artifact** — what the human verifier interacts with. The phase handoffs are the **decision-record artifact** — what the verifier signs.

See `~/.fpev/decision-surfaces.md` for surface generation patterns.

## Required sections per phase handoff

### Phase 1 (Layer 1)

```markdown
# Stage 4 Phase 1 — Layer 1 component verification

## Headline

One paragraph: how many components, what passed, what failed.

## Layer-1 findings

Per-component verification table (component | recipe | result | notes).

Then any findings worth elevating (e.g., "no build infrastructure shipped — recovery applied; v1 absorbs as C12").

## Plan-conformance per phase

| Phase | Plan deliverable | Observed | Verdict |
|-------|------------------|----------|---------|
| P0 | ... | ... | ✅ |
| ... | ... | ... | ... |

## Issues dispositioned

For each known issue: classify and disposition (hotfix / defer / accept).

## R4 productive-divergence log

What divergences during Layer 1 warrant entries in `wiki/topics/recovery-vs-termination-*.md`.

## What unblocks Phase 2

The preconditions Layer 2 needs.
```

### Phase 2 (Layer 2 + dogfood)

```markdown
# Stage 4 Phase 2 — Layer 2 integration + dogfood

## Headline

What integrated end-to-end. What's still open.

## Layer 2 results

| Scenario | Result | Notes |
|---|---|---|
| Cockpit-driven approve | ✅ pass | ... |
| Bridge-driven PR merge | ⏳ deferred | needs real repo |
| Dogfood | ✅ pass | hosted next cycle's Frame |

## The dogfood — what happened

Detailed narrative: how the cycle's own machinery handled real work.

## What the dogfood revealed

Findings that wouldn't surface from component tests. Often the most valuable Verify output.

## What's still open (human-owned)

The decisions only the human verifier can make.
```

### Phase 3 (Propagate-back + verdict)

```markdown
# Stage 4 Phase 3 — Propagate-back + final verdict

## Headline

Final verdict for the cycle. Propagate-back summary.

## Cycle verdict

One of:
- ✅ Pass — ready as-is
- ✅ Pass-with-caveats — gaps dispositioned, ship to next cycle
- ⛔ Block until vN.1 hotfix lands
- ↻ Re-cycle — back to Plan / Frame

With reasoning.

## Propagate-back to next cycle's Frame

What changes in the next cycle's Frame triptych given what Verify discovered:

- New principles to add (P{N})
- New constraints to add (C{N})
- New gaps to track (G{N})
- Anti-scope items to surface
- R-class entries to log

## Cycle close

Final state of:
- Gaps (count open / closed / deferred)
- Artifacts (count produced)
- LoC budget (vs tripwires)
- Divergences (R-class summary)

## What v{N+1} starts from

The handoff to the next cycle's Frame. Often produced in parallel — `v{N+1}-PiFPEV/handoffs/stage-1-frame-*-{author}.md` exist as drafts by the time this phase finishes.
```

## How to start a Verify

1. **Read Plan** — every verification recipe
2. **Read all Phase handoffs from Execute** — every divergence, every gap touched
3. **Read the Frame triptych** — every principle, constraint, gap
4. **Run Layer 1** mechanically; one component at a time
5. **Run Layer 2** with integration scenarios
6. **Dogfood if applicable** — use the cycle's machinery
7. **Consolidate findings** into Phase 3 handoff
8. **Decide verdict** — the human signs off in the interactive surface
9. **Write propagate-back** — what the next cycle's Frame absorbs

## Verdict philosophy

The honest Verify isn't "everything green." It's:

- Every red has a path forward (hotfix / defer / recover-update-Plan)
- Every gap is closed-with-evidence or deferred-with-reason
- Every divergence is recorded with class
- The verdict matches reality, not aspiration

"Pass-with-caveats" is the legitimate Stage-4 outcome when the gap is dispositioned. It's not a euphemism for failure.

## Propagate-back triggers

When something in Verify warrants propagate-back to upstream stages:

| Trigger | Updates |
|---|---|
| R4 divergence during Execute | Plan doc gets a `correction.md` sibling; or amended in place with `revised-at` |
| Missing class of deliverable | Frame doc adds a new constraint (C{N+1}) |
| Missing class of gap | Frame doc's gaps sibling gains a new gap |
| Architecture turned out wrong | Frame doc's architecture sibling gets a correction sibling |
| Audience misnamed | Frame doc's audience section gets refined |

Propagate-back is the protocol's mechanism for honest learning. The cost of doing it is small; the cost of *not* doing it is having a Frame doc that lies about what the project is.

## Common Verify anti-patterns

- **Skipping Layer 2.** Components pass; integration is left untested.
- **Verdict-without-evidence.** Declaring pass without running the recipes.
- **Hiding divergences.** Quiet drift instead of recorded R-class.
- **Propagate-back as afterthought.** Verify ends, next-cycle Frame starts cold — losing the insights.
- **Surface-vs-handoff mismatch.** The interactive HTML says one thing; the markdown handoff says another.

## Exit criterion — when is the stage done?

When:

- All Layer-1 components have a verdict
- All Layer-2 scenarios have a verdict (or honest "deferred" with reason)
- Every gap is closed or has an `assigned` for the next cycle
- Every divergence is classified and recorded
- The interactive surface has a final verdict radio selected
- The propagate-back doc is written
- The next cycle's Frame has at least a stub (or full triptych draft if dogfooding ahead)

## See also

- `~/.fpev/cadence.md` — protocol overview
- `~/.fpev/stages/3-execute.md` — what Verify reads
- `~/.fpev/divergence-classes.md` — R-class taxonomy + propagate-back
- `~/.fpev/decision-surfaces.md` — the interactive verify HTML
- `~/.fpev/gap-lifecycle.md` — gap closure
