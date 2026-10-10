# Project folder structure

Every FPEV project follows the same skeletal layout. This file is the canonical reference for **what goes where** — so you stop guessing.

## The canonical skeleton

```
your-project/
├── handoffs/                   ← stage outputs (markdown)
├── wiki/
│   └── topics/                 ← cross-cycle conceptual entries
├── references/                 ← evidence: reviews, audits, external readings
│   └── walkthroughs/           ← worked examples (optional sub-dir)
├── explorations/               ← positioning/idea notes, promotable to new projects
├── workbench/                  ← generated HTML for the deliberatory workbench (derived)
│   ├── surfaces/               ← decision surfaces (cards/slides)
│   ├── wiki/                   ← wiki HTML delivery
│   └── references/             ← references HTML delivery
├── conversations/              ← chat threads (append-only jsonl per thread; C8-tagged turns)
├── orchestrator-state.json     ← cycle state snapshot (optional)
├── src/                        ← code, if a code project
├── README.md                   ← project overview
└── .gitignore                  ← typical: workbench/, orchestrator-state.json.tmp, build outputs
```

**`workbench/` is generated (derived).** The live cockpit is *served* by the deliberatory
workbench (serve-on-demand; `deliberatory workbench`), not stored as a file; `workbench/` holds the
exported HTML artifacts (decision surfaces, wiki/references delivery). Regenerate from canonical
sources (`handoffs/`, `wiki/`); never hand-edit. Default `.gitignore` includes `workbench/`;
un-ignore `workbench/surfaces/` if you want review artifacts in the record. Legacy projects with
`references/surfaces/` remain readable — new projects use `workbench/`.

**`conversations/` is canonical, not derived** — chat threads (append-only jsonl, C8-tagged turns)
are project data and stay **git-versioned at the root**, like `handoffs/`. They are *not* part of
the `workbench/` tree (which is derived and gitignored); the workbench UI reads them, it does not
own them.

## Two levels: the project and the versions of its sub-projects

A **project** is a body of work: a research area, a product, a course. It holds **sub-projects**, and each **version** of a sub-project is one cycle through the four stages, in its own folder named `v{N}-{sub-project}`. The skeleton above is a version's.

```
your-project/
├── README.md                   ← what the project is; its sub-projects, their versions and status
├── wiki/topics/                ← the project's wiki: what its sub-projects share
├── references/                 ← the project's references: sources its sub-projects share
├── explorations/               ← notes not yet a sub-project
├── v1-first-subproject/
│   ├── handoffs/               ← always the version's own
│   ├── wiki/topics/            ← the version's wiki: terms only it uses
│   ├── references/             ← the version's references: its prompts, research, reports
│   └── README.md
├── v2-first-subproject/        ← the next version of the same sub-project
└── v1-second-subproject/       ← another sub-project of the same project
```

Three rules:

1. **Handoffs belong to the version.** They never move up.
2. **A wiki topic or a reference lives at the level of its readers.** If only this version reads it, keep it there. If another version or sub-project will, put it in the project.
3. **Promote; do not copy or link.** When a second folder needs something the first holds, move it up and leave one line behind saying where it went.

A version reads the project's wiki before it frames, and in Verify moves up what the next will need. A sub-project that stands alone needs no project folder above it.

## What goes where — decision rules

| If it's… | It goes in… |
|---|---|
| A stage output for this cycle (problem.md, plan.md, phase-N.md, verify.md) | `handoffs/` |
| A cross-cycle conceptual entry (FASTRIC, recovery-vs-termination, dual-channel-interface) | `wiki/topics/` |
| A code review, audit, evaluation specific to this project | `references/` |
| A worked example or step-by-step trace | `references/walkthroughs/` |
| A generated HTML decision surface (cards, slides) | `workbench/surfaces/` |
| Deliberatory workbench HTML (wiki/refs delivery, generated views) | `workbench/` |
| A chat thread (conversation-as-file; append-only, C8-tagged turns) | `conversations/{id}.jsonl` |
| A positioning/idea note (promotable into a new project) | `explorations/` |
| Evidence for this cycle (reviews, audits, walkthroughs) | `references/` |
| An external paper / podcast / article that influenced thinking | `references/` |
| A live state file the daemon (if any) writes to | `orchestrator-state.json` at project root |
| A backup of state before a major change | `orchestrator-state.{label}.json.bak` at project root |
| A generated JSON sibling of an `.md` file (e.g., `*.fsm.json`) | next to its `.md` source |
| A test of code in `src/foo.ts` | `src/foo.test.ts` next to it (or in a `tests/` sibling) |

## Decision rule: wiki topic vs reference?

This is the most common confusion. The test:

- **Will this content be read by future cycles?** → `wiki/topics/`, in the project if other versions or sub-projects will read it
- **Is this content specific to this cycle's verification, with no expected future readership?** → `references/`

Examples:

- "The R4 productive-divergence log" — `wiki/topics/recovery-vs-termination-{author}.md` (future cycles need this)
- "Engine evaluation comparing Pi-FASTRIC vs LangGraph" — `references/engine-evaluation-{author}.md` (this-cycle decision, not future doctrine)
- "What FASTRIC means and how it differs from FSM" — `wiki/topics/fastric-fsm-{author}.md` (conceptual, future-applicable)

A wiki topic is **doctrine**; a reference is **evidence**. If you find yourself rewriting a reference for the next cycle, promote it to a wiki topic.

## Decision rule: handoff vs reference?

A handoff is the **stage's commitment** — the artifact downstream stages read to know what was decided. A reference is **supporting material** — what informed the decision.

- Stage-2 plan doc → `handoffs/stage-2-plan-{author}.md`
- The Karpathy podcast notes that influenced the plan → `references/karpathy-ai-news-2026-05.md`
- Stage-4 verification phase 1 → `handoffs/stage-4-phase-1-{author}.md`

If the artifact is what Plan or Verify acts on, it's a handoff. If it's what Plan or Verify reads to inform itself, it's a reference.

## Decision rule: src/ vs other dirs?

- Production code that the project ships → `src/`
- One-off scripts that produce artifacts (e.g., regenerate JSONs from MDs) → `src/{module}/generate-*.ts`
- Test runners → `src/{module}/*.test.ts` or `src/tests/`
- Build configuration → project root (`package.json`, `tsconfig.json`)

If a project is documentation-only (no code), `src/` is absent. The skeleton stays valid.

## Naming conventions per directory

### `handoffs/`

See `workflows/handoff-conventions.md` for full detail. Summary:

```
stage-{N}-{artifact-or-phase}-{author}.md
```

### `wiki/topics/`

```
{topic-slug-in-kebab-case}-{author}.md
```

Examples: `fastric-fsm-wenlong-OpusCC47.md`, `recovery-vs-termination-wenlong-OpusCC47.md`, `dual-channel-interface-wenlong-OpusCC47.md`. The author suffix matters for C8 (every artifact has an author).

### `references/`

More flexible:

- `{descriptive-slug}-{author}.md` for opinionated reviews / walkthroughs
- `{descriptive-slug}.md` for external readings (Karpathy podcast, OpenAI paper) where authorship is the *source*, not your work
- `{date-or-stage-N}-{topic}-{author}.md` for cycle-anchored references

### `references/walkthroughs/`

```
first-cycle-{author}.md
{cycle-id}-walkthrough-{author}.md
```

### `workbench/surfaces/`

```
stage-{N}-{artifact}-{format}.html
```

Generated (derived) — regenerated from `handoffs/`; edit the handoff, never the HTML.

Examples: `stage-1-frame-problem-cards.html`, `stage-1-frame-problem-slides.html`, `stage-4-verify-cards.html`.

## What's NOT in the skeleton

- **No `lib/` or `vendor/`.** External dependencies live in `node_modules/`, `venv/`, etc., which are `.gitignore`-d.
- **No `docs/`.** The README + the wiki cover documentation. A separate `docs/` invites the trap of "real docs are in docs/, the wiki is stale."
- **No `archive/` or `old/`.** When you supersede an artifact, preserve it with a versioned filename (`stage-1-frame-problem-OpusCC47-v1.md`) — don't move it.
- **No `output/` or `dist/`.** Generated outputs live next to their source (`*.fsm.json` next to `*.fsm.md`) or in `references/surfaces/`.

## Skeleton bootstrap

For a brand-new FPEV project, `cycle-initialization.md` covers the bootstrap commands. Quick version:

```bash
mkdir -p your-project/{handoffs,wiki/topics,references/walkthroughs,workbench/surfaces}
cd your-project
echo '# your-project — FPEV cycle\n\nSee handoffs/ for stage outputs.' > README.md
```

## Anti-patterns

- **Mixing handoffs and references.** "Hmm, is this a draft or a review?" If unclear, ask: *will downstream stages act on it?* (handoff) or *did upstream stages inform from it?* (reference).
- **Wiki sprawl.** Twenty wiki topics that overlap. Better: five well-curated topics with cross-links.
- **Stage output in references/.** "Stage 3 phase 4 implementation notes" living in `references/` instead of `handoffs/`. Hidden from the cycle's flow.
- **Orphaned `src/` files.** Code without a handoff describing what stage it was produced in and why. Re-attach to a handoff or move to a wiki topic if foundational.
- **Hidden `.bak` files.** Don't litter the project with timestamped backups; commit-and-revert via git instead, except for the one canonical `orchestrator-state.{label}.json.bak` after major resets.

## Verifying the skeleton

A healthy FPEV project should pass these checks:

| Check | Pass criterion |
|---|---|
| Every `.md` in `handoffs/` has the naming pattern `stage-{N}-...` | Yes |
| Every artifact's frontmatter has `authors:` (C8) | Yes |
| Every cross-cycle concept is in `wiki/topics/`, not `references/` | Yes (judgment call sometimes) |
| Every generated HTML in `workbench/surfaces/` has a corresponding handoff source | Yes |
| The README at project root explains the layout | Yes |

A lint script (`fpev-lint-project.sh` someday) could check these mechanically.

## See also

- `workflows/handoff-conventions.md` — naming + frontmatter rules
- `workflows/cycle-initialization.md` — bootstrapping a new project
- `workflows/wiki-authoring.md` — writing a wiki topic
