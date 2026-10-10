# Gap lifecycle

Knowledge gaps are first-class FPEV artifacts. They are identified in Frame, tracked through Plan and Execute, and checked for closure in Verify.

## What a gap is

A gap is **something the current state of the cycle does not know**, with enough specificity that closure is verifiable.

Good gaps:
- "Whether the YAML library handles nested mappings under FASTRIC's `constraints:` block" — testable
- "Where artifact author IDs are read from in the daemon's hook path" — answerable by code reading

Bad gaps (too vague):
- "Whether the architecture is right" — not testable
- "Whether users will like it" — not closeable
- "Performance" — not specific

## Lifecycle states

```
            work_started               evidence_found
   Open  ─────────────────►  Resolving  ─────────────►  Closed
    ▲                            │                       │
    │                            │ blocker_hit           │ evidence_failed
    └────────────────────────────┘                       │
                                                         ▼
                                                      Reopened
                                                         │
                                                         │ rework_started
                                                         ▼
                                                      Resolving
```

| State | Meaning |
|---|---|
| **Open** | Gap is identified; no work yet |
| **Resolving** | Someone is actively gathering evidence |
| **Closed** | Evidence has landed; gap is resolved |
| **Reopened** | A closed gap's evidence has been invalidated (e.g., the assumption it rested on changed) — re-enters Resolving |

## Closure criterion

Every Open gap must declare its **closure criterion** at the time of identification:

```
G7 — Hook coverage adequacy
- Status: Open
- What we don't know: whether three built-in hooks cover every prescriptive constraint
- Closure criterion: after v1 Execute, count constraints actually used vs constraints that were "needed but not expressible"
- Owns: v1 Verify
```

The closure criterion answers: "How will we know this gap is closed?" Vague closure criteria are a sign the gap itself is vague.

## Evidence

A gap closes when **evidence** lands. Evidence is concrete:

- A test run with specific output
- A diff comparing two implementations
- A measurement (LoC count, memory profile, timing)
- A reference to a canonical decision recorded elsewhere
- An explicit human verdict

Evidence is **logged in the handoff that closes the gap**:

```markdown
### G7 — Hook coverage adequacy — CLOSED

**Closure date:** 2026-06-15
**Evidence:** v1 Execute used three named hooks (handoff-exists, evidence-present,
non-author-acted) across 24 transitions. No "needed-but-not-expressible" constraints
encountered. See `handoffs/stage-3-phase-7-*.md` §Hook usage.
**Closer:** {author-id}
```

If a gap closes without evidence, that's a constraint violation — flag as R2.

## Gap ownership (`assigned`)

Every Open gap has an `assigned` field naming **which future phase or person closes it**:

| Pattern | Example |
|---|---|
| Future phase in this cycle | `v1-execute-P1`, `v1-verify` |
| Future cycle | `v2-frame`, `future-cycle` |
| Out-of-scope but tracked | `wontfix-not-now` |
| Specific person | `wenlong-this-session` (rare — usually a phase owns it) |

Gaps without `assigned` are unowned and likely to rot. Lint warns on these.

## Gap dependencies

Gaps often depend on other gaps. Record this in the gaps doc as a small DAG:

```
G2 (transition-keyed ownership)
  ↓
G1 (FASTRIC envelope at runtime) ← G3 (non-author-acted source)
  ↓
G6 (schema unification) ← G5 (daemon inline divergence) ← G4 (yaml dedup)
```

Closure order should respect dependencies. If G6 needs G2, don't try to close G6 first.

## Hard constraints can't be gaps

If something is a **hard constraint** (C1 through Cn — see your project's Frame doc), it can't be Open. Constraints are inviolable; gaps are unknowns. If you find a deliverable would violate a hard constraint, the constraint wins — the deliverable changes, or the constraint changes (propagate-back).

## Lint expectations

A healthy gaps file:

- Every Open gap has: `Status`, `What we don't know`, `Closure criterion`, `Owns/Assigned`
- No two gaps with the same ID
- No closed gap without `Closure date`, `Evidence`, `Closer`
- Every Reopened gap has `Reopened reason` and `Reopened date`

## What gaps are NOT

- **Bugs.** "The daemon crashes on empty input" is a bug, not a gap. File it as an issue, fix it.
- **Tasks.** "Write the GitHub bridge tests" is a task in the Phase DAG, not a gap.
- **Anti-scope items.** "FORUM mode" is out-of-scope, not a gap. Note it in the Frame doc's anti-scope section.
- **Decisions.** "Pick TypeScript or Go" is a decision belonging in the Plan doc's decisions table, not a gap. Gaps are about *unknowns*, not *choices*.

## See also

- `workflows/stages/1-frame.md` — gap identification during Frame
- `workflows/stages/4-verify.md` — closure checking during Verify
