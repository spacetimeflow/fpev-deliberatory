# The conventions

These files are the conventions of the shape: the protocol, the four stages, and the rules for handoffs, folders, gaps and divergences. They are complete in themselves. An agent reads them from here and from nowhere else.

## The ritual

> **Follow `fpev-deliberatory`. We're working on sub-project `<name>`, version `<v>`, in `<dir>`. We are now in stage `<n>` phase `<m>`. Let's `<continue / move to next phase / start stage N+1 / verify>`.**

If you do not know the stage or phase, read the version's `handoffs/` and work it out.

## What is here

```
workflows/
├── README.md                       ← this file
├── fpev-cadence.md                 ← the protocol document
│
├── ── core (read these to run a cycle) ──
├── stages/
│   ├── 1-frame.md                  ← Frame (slow)
│   ├── 2-plan.md                   ← Plan (fast)
│   ├── 3-execute.md                ← Execute (fast; closes with every mechanical check)
│   └── 4-verify.md                 ← Verify (slow; the human's)
├── handoff-conventions.md          ← naming, front matter, the person-and-agent handle
├── project-folder-structure.md     ← project, sub-projects, versions; what goes where
├── cycle-initialization.md         ← starting a new version
├── wiki-authoring.md               ← when and how to write a wiki topic
├── divergence-classes.md           ← R1 to R4
├── gap-lifecycle.md                ← Open → Resolving → Closed → Reopened
│
├── ── on request (surfaces, the cockpit, FASTRIC specs) ──
├── decision-surfaces.md            ← what cards and slides are; when to make them
├── surface-generation.md           ← handoff → HTML cards or slides
├── wiki-html-delivery.md           ← wiki topics → grouped HTML pages
├── cockpit-design.md               ← a live status view
└── fastric-authoring.md            ← how to write a prescriptive spec with roles and constraints
```

## How an agent uses them

1. Read `fpev-cadence.md`, the protocol.
2. Read `handoff-conventions.md` for naming and front matter.
3. Read the file in `stages/` for the current stage.
4. Read the version's `handoffs/` to see what was last produced and by whom.
5. Produce the next artifact, following the conventions.
6. Record any productive divergence (`divergence-classes.md`).
7. Put judgment calls to the human in words; make surfaces on request (`decision-surfaces.md`).

Read the on-request files only when the human asks for surfaces or the cockpit, or when a Plan needs a checkable spec.

## Writing these files

Each file can be read by an agent in about five minutes and stands alone. Examples are inline. Tables and lists come before prose.
