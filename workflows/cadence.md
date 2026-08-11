# FPEV cadence — practitioner's working summary

This is the **practitioner's working summary** of the FPEV (Frame–Plan–Execute–Verify) cadence protocol — a compact, ~5-minute orientation for anyone (human or agent) starting a session.

The **canonical protocol document** is at `~/.fpev/fpev-cadence.md`. If anything in this file conflicts with the canonical doc, the canonical wins. This file is intentionally smaller — it exists so an agent has a quick-context entry without parsing the full protocol on every session start.

## The four stages, with pace

| Stage | Pace | Purpose | Produces |
|---|---|---|---|
| **1. Frame** | slow | Establish problem, principles, constraints, gaps | Triptych: problem.md + architecture.md + gaps.md |
| **2. Plan** | fast | Sequence the work; commit decisions | Plan doc with Phase DAG, decisions table, deliverable enumeration |
| **3. Execute** | fast | Produce the actual deliverables | Per-phase handoffs (`stage-3-phase-{N}-{author}.md`) + the artifacts |
| **4. Verify** | slow | Confirm; record divergence; propagate-back | Verification handoffs (`stage-4-phase-{N}-{author}.md`) + final verdict |

The U-shape: slow at the bookends (Frame, Verify) so judgment lands; fast in the middle (Plan, Execute) once direction is set.

## The four invariants (load-bearing across stages)

1. **Handoffs are the durable record.** Each stage's output is a markdown file in `handoffs/` with the naming pattern `stage-{N}-{artifact-or-phase}-{author}.md`. See `handoff-conventions.md`.

2. **Knowledge gaps are first-class.** Identified in Frame, tracked through Plan and Execute, closed in Verify. Lifecycle: `Open → Resolving → Closed → (Reopened)`. See `gap-lifecycle.md`.

3. **Decision surfaces accompany handoffs at human-judgment points.** Frame, Plan, and Verify each generate a scannable surface (HTML cards or slides) alongside the dense handoff. The handoff is for the next agent; the surface is for the human. See `decision-surfaces.md`.

4. **Productive divergence is recorded, not hidden.** When work diverges from upstream specs, classify (R1/R2/R3/R4) and record. See `divergence-classes.md`.

## Propagate-back

The protocol's self-correction mechanism: late stages (especially Verify) can discover that early stages were wrong. The response is to *update the early stage* (a "correction doc") rather than hide the divergence. v1 of your project may emerge from v0's Verify stage discovering v0's Frame had a structural gap.

## Stages in detail

See the per-stage guides in `~/.fpev/stages/`:

- `stages/1-frame.md` — what Frame produces, principles to apply, the triptych
- `stages/2-plan.md` — Phase DAG authoring, decisions table, deliverable enum
- `stages/3-execute.md` — per-phase handoffs, divergence reporting
- `stages/4-verify.md` — three-layer verification, propagate-back, final verdict

## Key principles (recurring across stages)

These are paraphrased from `~/.fpev/fpev-cadence.md` and `wiki/topics/` of the reference projects. Read the canonical doc for the full list.

- **P1. Protocol stays simple; the platform absorbs the complexity.** This directory is the platform. The protocol document is short by design.
- **P5. Recovery, not termination.** FSM violations are signals for correction, not terminal failures. Propagate-back is the response.
- **P8. Author-id on every artifact.** Frontmatter `authors: [<id>]` is non-negotiable. Reviewers must differ from authors (this is what enables the `non-author-acted` rule in FASTRIC).
- **P9. Cultivate, don't pre-plan.** The wiki, topic pages, and workflows evolve from practice. Seed scaffolding only where future stages provably need it.
- **P16. Workflow-collection-centered.** PiFPEV (or any FPEV runtime) is a collection of workflows anchored on this directory. Each workflow is opt-in. No single workflow is canonical.

## Hard constraints (recurring)

- **C4. Markdown-canonical for source-of-truth artifacts.** Derived deliveries (JSON, SQLite, HTML, slide decks, PR bodies, chat messages) are generated, never hand-edited.
- **C7. GitHub bridge uses `gh` CLI, never destructive commands.**
- **C8. Every artifact carries `authors:` in frontmatter.** See `handoff-conventions.md`.
- **C14. Workflows are markdown-canonical; executable companions are optional.** This directory's `.md` files are the canonical workflows; any TypeScript/Python/shell helpers are conveniences.

## What's NOT in this directory

- The full canonical protocol — that's `~/.fpev/fpev-cadence.md`
- Project-specific state, code, handoffs — those live in the project's own directory
- Agent-specific auto-loaders — those live in `~/.claude/skills/`, Pi config, etc., and *point back to this directory*
- Generic non-FPEV workflows (HTML explainer pattern, slide-deck template, etc.) — those live in `~/workflows25/`

## When to read which file

| Situation | Read |
|---|---|
| Fresh session, "Follow fpev-deliberatory" said | `README.md` + this file + the relevant `stages/{N}-*.md` |
| Producing any handoff | `handoff-conventions.md` |
| Found something that contradicts the Plan | `divergence-classes.md` |
| Authoring a prescriptive spec (cadence/gap/artifact FSM) | `fastric-authoring.md` |
| About to generate cards/slides for human review | `decision-surfaces.md` |
| Gap status changing | `gap-lifecycle.md` |
| Doing the Stage-4 dance | `stages/4-verify.md` |
