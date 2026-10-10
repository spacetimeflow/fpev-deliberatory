# Cockpit design

How to design a live status view for an FPEV cycle. The cockpit polls the state service (or reads state.json directly) and renders the current state for human consumption. This file covers what panels to show, layout principles, and the patterns that emerged from v0's cockpit dogfood.

## When to use this workflow

You're building:
- A browser-based cockpit (v0's pattern: single HTML file with polling + SSE)
- A TUI cockpit (terminal UI with curses/Ink/textual)
- A Slack or email digest cockpit (one-message status snapshot)
- An IDE plugin cockpit (status bar + side panel)

Any view that surfaces cycle state for human consumption is a "cockpit" in this workflow's sense. The principles below apply across renderers; the **panels** below are concrete content the renderer should surface.

## Core principle — surface what state already tracks

The single most important cockpit-design lesson from v0:

> **v0 has multiple working subsystems that don't talk to each other. The integration between subsystems and the surface that displays them is what's missing.**

If state.json carries a field (artifacts, gaps, wiki, github, openQuestions), the cockpit should surface it. Hidden state = state that drifts. Make every field visible *somewhere* in the cockpit, even if only as a count.

## Required panels — content categories

A complete cockpit covers these content categories. Implementations group them differently (one screen, multiple tabs, hierarchical menus); the categories are stable.

| Category | What it shows | State source |
|---|---|---|
| **Cycle header** | cycleId, stage, current phase, alpha, timestamp | `state.{cycleId, stage, phase, alpha, timestamp}` |
| **FSM snapshots** | per-FSM current state, transitions remaining | `state.fsms` |
| **Phase DAG** | nodes with status (pending / in-progress / complete / failed) | `state.dag` |
| **Gaps** | open / resolving / closed / reopened counts + list with clickable links | `state.gaps` |
| **Artifacts** | by stage + phase, grouped, with file-extension badges + clickable links | `state.artifacts` |
| **Decision surfaces** | generated cards / slides; clickable to open | filtered `state.artifacts` (path ends in `.html`) |
| **Conformance** | per-FSM T/R/I/C status with axis badges | `state.conformance` |
| **Knowledge** | wiki topics + references, browsable | `state.wiki`, `state.references` |
| **Open questions** | pending human decisions | `state.openQuestions` |
| **GitHub channel** | bridge status + recent PRs + linked issues | `state.github` |
| **History** | append-only audit trail | `state.history` (tail) |
| **Event stream** | live SSE feed | service `/events` |
| **Action input** | submit approve / reject / modify / etc. | `POST /action` |

A renderer may collapse categories (e.g., merge gaps + open questions into "Decisions needing me") but should not hide any.

## Layout principles

### Grouping by stage role, not by data type

Group panels by the **stage role** they serve:

- **Status row** — cycle header, alpha, phase DAG, FSM snapshots
- **Decisions needing me** — open questions, pending verdicts, in-flight conformance
- **Stage work** — artifacts and surfaces grouped by stage + phase
- **Knowledge** — wiki + references
- **Channels** — GitHub bridge, future email/TUI/social bridges
- **Operations** — history, event stream, action input

This grouping mirrors the practitioner's **flow of attention**: status first (am I where I think I am?), then decisions (what needs me?), then artifacts (what was produced?), then knowledge (where do I look for context?), then channels (what's outbound?), then operations (audit + driving).

### File-extension badges + clickable links

Per the v0 dogfood: every artifact path gets a file-extension badge (`.md` green, `.html` blue, `.json` yellow, `.ts` accent) and is rendered as a clickable link (file:// URL or in-app navigation).

### Status pills, not raw strings

Every status value gets a colored pill, not raw text:

| Status family | Colors |
|---|---|
| pending / in-progress / complete / failed | gray / yellow / green / red |
| draft / reviewed / approved / final / archived / rejected | gray / yellow / blue / green / muted / red |
| open / resolving / closed / reopened | red / yellow / green / purple |
| passed / judged / failed | green / yellow / red |

Pills are immediately scannable; raw strings require reading.

## Live updates

Two strategies, often combined:

1. **Polling** — fetch `GET /state` every N seconds (1–5s typical)
2. **SSE** — subscribe to `GET /events`, update panels on event types

Combined pattern: polling for full refresh on load; SSE for incremental updates. On SSE reconnect (e.g., daemon restart), re-poll for full state.

## Action input

Every cockpit needs **at minimum** an approve button. Recommended set:

| Button | Effect |
|---|---|
| Approve | `POST /action {type:"approve"}` |
| Reject | `POST /action {type:"reject"}` |
| Modify | dialog → `POST /action {type:"modify", payload:{field,value}}` |
| Adjust α | slider → `POST /action {type:"adjust-alpha", payload:{alpha}}` |
| Abort | confirmation → `POST /action {type:"abort"}` |

Place actions where they're most natural per renderer (bottom bar in browser, command palette in TUI, slash-commands in chat).

## What the cockpit does NOT do

- **Author content** — the cockpit reads state; agents and humans author artifacts in their own editors
- **Execute long-running tasks** — those are the runtime/agent's job; the cockpit submits actions and observes
- **Replace the state file** — the cockpit talks to the service; the service owns the file

## Anti-patterns (from v0 dogfood)

- **Subsystems without panels.** If state tracks something the cockpit doesn't surface, you discover the problem later via "wait, where is X?" Every state field needs at least a count.
- **Read-only panels for actionable items.** Open questions need textareas, not just display. Pending verdicts need radios. Make the cockpit *interactive* where state expects human input.
- **Hidden links.** Listing artifact IDs without making them clickable wastes the cockpit's strongest affordance — file navigation.
- **Conformance as one string.** Once FASTRIC ships, T/R/I/C must each have its own pill. Single-string "passed" hides axis-level failures.
- **Polling without SSE for high-event cycles.** During parallel Execute, polling lags; SSE keeps the cockpit live.

## Implementation hints (non-binding)

v0-PiFPEV: `src/cockpit/cockpit.html` is a single 1,200+-line HTML file with inline CSS+JS, no build step. Eight panels evolved through the Stage-4 dogfood — Cadence FSM, Phase DAG, Gap FSM, Artifact FSM, Conformance, Open Questions, Decision Surfaces, GitHub, Knowledge (Wiki+References), Alpha, Decision Slot, Event Stream, History.

A TUI cockpit might use:
- Python: `rich` or `textual`
- Node: `ink`
- Go: `bubbletea`
- Shell: `dialog` or `whiptail`

A Slack-digest cockpit posts one rich message per cycle event, with reply-to-respond for actions. Memory: ~5 MB vs ~600 MB for a browser tab.

## See also

- `workflows/decision-surfaces.md` — surfaces the cockpit links to
- `wiki/topics/workflows-vs-daemon-wenlong-OpusCC47.md` — when a cockpit is needed (Tier 3+) vs not (Tier 1)
