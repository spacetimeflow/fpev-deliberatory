# ~/.fpev — Personal FPEV workflow set

This directory is your personal **F**rame–**P**lan–**E**xecute–**V**erify deliberation workspace. It's a portable, agent-agnostic collection of markdown files that any AI coding agent (Claude Code, Pi, Cursor, GPT, local models) can read to follow the FPEV protocol with you.

The directory is intentionally a dotfile (`~/.fpev/`), parallel to `~/.gitconfig`, `~/.ssh/`. Edit it freely; version-control it as personal dotfiles; copy it to other machines as a single folder.

## The ritual

At the start of any session where you want FPEV cadence, say to your agent:

> **Follow `fpev-deliberatory`. We're working on project `<name>` in `<project-dir>`. We are now in version `<v>` stage `<n>` phase `<m>`. Let's `<continue / move to next phase / start stage N+1 / verify / etc.>`.**

The project's own documents live in the project directory — `handoffs/` (stage outputs),
`references/` (evidence), `wiki/topics/` (cross-cycle knowledge), `workbench/` (derived
surfaces) — the full layout is `project-folder-structure.md` in this set.

The agent reads this directory, identifies what's expected at that stage and phase, mirrors the conventions, and proceeds.

If you don't know what stage/phase you're in: the agent can read your project's `handoffs/` directory to determine it. Just say "Follow `fpev-deliberatory`, we're working on `<project>`, figure out where we are."

## Directory layout

```
~/.fpev/
├── README.md                       ← this file
├── fpev-cadence.md                 ← canonical protocol document
├── cadence.md                      ← practitioner's working summary of the protocol
│
├── ── practitioner-facing (the ritual, how to do FPEV) ──
├── handoff-conventions.md          ← naming, frontmatter, author-id (load-bearing)
├── project-folder-structure.md     ← per-project layout (handoffs/, wiki/, references/, ...)
├── cycle-initialization.md         ← bootstrapping a new FPEV project
├── wiki-authoring.md               ← when and how to write a wiki topic
├── divergence-classes.md           ← R1/R2/R3/R4 divergence taxonomy
├── gap-lifecycle.md                ← Open → Resolving → Closed → Reopened
├── decision-surfaces.md            ← what cards/slides are; when to make them
│
├── ── runtime-facing (specs for components implementations satisfy) ──
├── fastric-authoring.md            ← FASTRIC envelope (T+R+I+C); what to write
├── fastric-lint.md                 ← FASTRIC/FSM lint rules (T/R/I/C axes)
├── dag-lint.md                     ← Phase DAG lint rules
├── state-machine-runtime.md        ← multi-FSM store; transitions; snapshots; mutation
├── state-file-persistence.md       ← atomic write; history; backup; schema migration
├── state-service-spec.md           ← HTTP daemon contract; action vocabulary; SSE
├── cockpit-design.md               ← live status view; panels; layout principles
├── github-bridge.md                ← FPEV state ↔ GitHub PRs/issues mapping
├── surface-generation.md           ← handoff → cards/slides HTML generator
├── wiki-html-delivery.md           ← wiki/topics → grouped HTML pages with anchors
├── knowledge-dag.md                ← link graph across wiki/refs/handoffs/gaps
│
├── stages/
│   ├── 1-frame.md                  ← Frame stage (slow, divergent)
│   ├── 2-plan.md                   ← Plan stage (fast, convergent)
│   ├── 3-execute.md                ← Execute stage (fast, parallel)
│   └── 4-verify.md                 ← Verify stage (slow, propagate-back)
└── workflows/
    ├── README.md                   ← inventory of workflow guides
    ├── interactive-code-explainer-guide.md     ← software-system explainer pattern
    ├── interactive-explainer-guide.md          ← ML/experiment explainer pattern
    ├── reveal-presentation/                    ← slide-deck workflow (reveal.js)
    └── fpev-cadence-dev/                       ← historical reference cycles (v1-dev through v6-dev)
```

## Two flavors of workflow under one directory

The top-level files split into two groups:

- **Practitioner-facing** — how to *do* FPEV. Read these when you're authoring a handoff, writing a wiki topic, classifying a divergence, etc. Audience: humans and agents driving cycles.
- **Runtime-facing** — *specs* for components. Read these when you're building (or specifying) a piece of FPEV runtime infrastructure. Audience: implementers across versions and languages.

Per **P18 (workflow-first development)** in the v1 frame: every reusable component has its spec authored as a `~/.fpev/*.md` file *before* code is written. Implementations are convenience accelerators; the spec is canonical.

## What lives here vs. elsewhere

| What | Where | Why |
|---|---|---|
| The protocol document | `~/.fpev/fpev-cadence.md` | Canonical; the practitioner's working summary is at `~/.fpev/cadence.md` |
| Personal FPEV workflows | `~/.fpev/` (this directory) | Stable, agent-agnostic, mobile, version-controllable |
| Reusable workflow guides + historical reference cycles | `~/.fpev/workflows/` | Local copies; `~/workflows25/` may still hold upstream versions |
| Project-specific state, handoffs, code | The project directory | One per project |
| Agent-specific auto-loaders | `~/.claude/skills/fpev-cadence/SKILL.md` (Claude Code), Pi extension config, etc. | Convenience layer — points back to `~/.fpev/` |

## How agents use this

A well-behaved agent invoked with the ritual will:

1. Read `~/.fpev/cadence.md` for protocol overview
2. Read `~/.fpev/handoff-conventions.md` for naming and frontmatter rules
3. Read the relevant `~/.fpev/stages/{N}-{stage-name}.md` for the current stage
4. Read project-specific `handoffs/` to see what was last produced and by whom
5. Produce the next artifact following the conventions
6. Record any productive divergence per `~/.fpev/divergence-classes.md`
7. Surface human-judgment decisions per `~/.fpev/decision-surfaces.md`

## Mobility

`~/.fpev/` is one self-contained directory. Three ways to move it, in order of how often you'd use them:

1. **Version control (recommended for routine use)** — `cd ~/.fpev && git init && git add . && git commit -m "init"`. Push to a personal dotfiles repo; clone on a new machine; sync via pull. This gives you history, branches, and easy diffs as the directory evolves.
2. **Direct copy (for one-off transfers)** — `cp -r ~/.fpev /path/to/destination/.fpev`. Fast when you have filesystem access (e.g., transferring within a network, USB drive, rsync).
3. **Archive (only when you need a snapshot)** — `tar czf fpev-config.tgz -C ~ .fpev`. Useful when emailing a colleague, attaching to a Slack message, or archiving a frozen moment in time. Not the primary path.

For full project portability also copy each project's directory (`handoffs/`, `wiki/`, `references/`, `orchestrator-state.json` if present, source code).

## Optional next tier — PiFPEV runtime

This directory is enough to run FPEV manually with any agent. If you want **automation** — a daemon arbitrating concurrent agents, a browser cockpit showing live state, GitHub bridge auto-advancing on PR merge, runtime FASTRIC enforcement — that's the **PiFPEV runtime**, which builds on top of this directory. It reads these workflows as its configuration. See `~/cJWL25/Research25/PiFPEV/` for one implementation.

You can use `~/.fpev/` indefinitely without PiFPEV. Most solo / small-team work doesn't need the runtime.

## Authoring conventions for this directory

Every file in this directory is meant to be **read by an agent in ~5 minutes** and **referred to by name** when the user invokes the ritual. Therefore:

- Each file is self-contained — minimum cross-file reading required
- Examples are inline, not pointers
- Verbose markdown is avoided; tables and lists are preferred
- Updates to this directory are versioned as personal dotfiles (`git init` in `~/.fpev/` is recommended)
