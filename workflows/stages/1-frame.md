# Stage 1 — Frame

Frame is the slow opening. It establishes what we're solving, what we're building, and what we don't yet know. **The output is a triptych of three sibling handoffs.**

## What Frame produces

```
handoffs/
├── stage-1-frame-problem-{author}.md       ← problem statement
├── stage-1-frame-architecture-{author}.md  ← what we're building (sketch)
└── stage-1-frame-gaps-{author}.md          ← knowledge unknowns
```

Plus a decision surface per sibling (cards format usually):

```
references/surfaces/
├── stage-1-frame-problem-cards.html
├── stage-1-frame-architecture-cards.html
└── stage-1-frame-gaps-cards.html
```

## Pace and posture

**Slow.** Frame is the diverge-then-narrow stage. Take long enough to:

- Articulate the problem in plain English before reaching for a solution
- List principles before listing deliverables
- Identify gaps deliberately, not as an afterthought
- Make decisions you can defend if asked "why this and not that"

A rushed Frame produces a wobbly Plan and a flailing Execute. Take the time.

## The triptych — what each sibling contains

### `stage-1-frame-problem-{author}.md`

Required sections:

1. **TL;DR** — one paragraph for a reader on a phone screen
2. **Problem (in plain English)** — what's going wrong; what triggers this cycle
3. **Why this matters now** — what's changed; why not later
4. **Audience** — who this serves; what they get; what lift is required of them
5. **Principles** — guide every decision; numbered P1, P2, … or carried forward from prior cycle
6. **Hard constraints** — non-negotiable boundaries; numbered C1, C2, …
7. **What this is NOT** — anti-scope; prevents creep
8. **Success criteria** — how we'll know we shipped
9. **Uncertainty markers** — where we're confident; where we're not

### `stage-1-frame-architecture-{author}.md`

Required sections:

1. **What stays from previous version** (if iterating) — explicit no-touch list
2. **What changes** — the deliverables, numbered
3. **File-layout snapshot** — what the working tree looks like at end
4. **Backward compatibility** — how prior cycles' artifacts are read
5. **Dependencies** — external libraries, services, agents
6. **Uncertainty markers**

### `stage-1-frame-gaps-{author}.md`

Required sections:

1. **Carried forward** (if any) — gaps inherited from prior cycles
2. **New gaps** — numbered `G1`, `G2`, … with status / what-we-don't-know / closure-criterion / owns
3. **Gap dependencies** — DAG showing which gaps must close before others
4. **Open questions for the human** — decisions only the human can make
5. **How gaps interact with constraints** — what closes-as-blocker
6. **Uncertainty markers**

See `~/.fpev/gap-lifecycle.md` for full gap structure.

## Frame principles to apply

Carry forward across cycles:

- **Protocol simple, platform absorbs complexity** (don't bloat Frame with implementation detail; that's Plan's job)
- **U-shape attention** (Frame is the slow side — afford it)
- **Decision surfaces** (Frame produces surfaces for human review)
- **Gaps are first-class** (don't bury them in prose; enumerate)
- **Recovery, not termination** (R-class divergence is a tool, not a failure)
- **Author-id discipline** (C8 — explicit in frontmatter)
- **Cultivate, don't pre-plan** (only seed what later stages provably need)

## How to start a Frame

If this is the project's **first cycle**:

1. Read `~/.fpev/fpev-cadence.md` for protocol detail
2. Identify the audience and write the problem statement for them specifically
3. Iterate the principles (P1, P2, …) until they cover what you'd defend in code review
4. Iterate hard constraints (C1, C2, …) until they cover what would make you reject a PR
5. Enumerate gaps as discrete questions with closure criteria
6. Generate surfaces

If this is an **iteration** (v1 of an existing project):

1. Read the prior version's Frame triptych (`v0-PiFPEV/handoffs/stage-1-frame-*.md`)
2. Identify what carries forward verbatim (most principles, most constraints)
3. Identify what changes (new principles emerging from Verify; new constraints; revised audience)
4. Run propagate-back: did the prior version's Verify discover anything Frame should have known? Fold it in
5. Add new gaps that emerged from the prior version's Verify
6. Generate surfaces

## Sniff tests — is your Frame strong enough?

Ask of each sibling:

| Test | Pass criterion |
|---|---|
| Could a CS student reproduce the system from these three docs alone? | Yes — they don't need to read the code to understand the intent |
| Are the principles distinct from generic software-engineering advice? | Yes — each one is specific to *this* problem |
| Would the constraints reject a PR? | Yes — they're specific enough to enforce |
| Would the gaps surface real unknowns? | Yes — not vague "we don't know if it'll work" but specific "we don't know if Y handles X" |
| Do siblings reference each other? | Yes — frontmatter `siblings:` list |

If any test fails, the Frame is underdeveloped. Either iterate, or be honest in `Uncertainty markers` about what's tentative.

## What Frame is NOT

- **Not the Plan.** Don't enumerate phases, deliverables, or implementation steps. Frame says *what* and *why*; Plan says *when* and *how*.
- **Not the Verify.** Don't predict outcomes. Just articulate questions and unknowns.
- **Not exhaustive.** Frame is a slice of reality; gaps acknowledge what's left out.
- **Not immutable.** Propagate-back from Verify can update Frame. Preserve prior versions when revising.

## Exit criterion — when is Frame done?

When you can:

- Hand the triptych to a non-author and they understand the problem in one read
- Point at each principle and say which sections of Plan and Verify it'll touch
- Point at each constraint and say what would violate it
- Point at each gap and name its closure criterion

If you can't, iterate. Frame is the cheap stage to iterate in — fixing Frame later is propagate-back, which is more expensive.

## Common Frame anti-patterns

- **Solution-first.** Wrote architecture before problem; problem rationalizes architecture
- **Principle-fatigue.** Twenty principles; effectively zero
- **Generic gaps.** "We don't know if it scales" without scaling-specific closure criterion
- **Constraint-vagueness.** "Code should be clean" — not enforceable
- **Anti-scope drift.** No explicit "this is NOT in scope" section, so scope creeps during Plan

## See also

- `~/.fpev/cadence.md` — protocol overview
- `~/.fpev/handoff-conventions.md` — naming, frontmatter
- `~/.fpev/gap-lifecycle.md` — gap structure
- `~/.fpev/decision-surfaces.md` — generating cards for Frame review
- `~/.fpev/stages/2-plan.md` — what Frame's output enables
