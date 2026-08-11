# UNDERSTAND — how the deliberatory works

*Read this after the README. It answers: what is this, how does it work, what are the
conventions, what does it trust.*

## The one-sentence shape

A project is a folder of markdown: handoffs (the memory), references (the evidence), wiki
(the knowledge), workbench (the derived surfaces), README (the ritual). An agent harness
executes the folder by following its conventions; a human ratifies the gates.

## The core loop (the feedback engine)

```
human feedback → handoff (canonical) → inbox (references/feedback-inbox.md)
  → engine pushes → a harness agent reads, addresses, writes a reply into the handoff
  → the engine verifies the reply is in the file → grants "addressed"
```

The engine never takes the agent's word: **prose does not enforce, so the engine checks the
file** (the verified-reply gate). A silent agent leaves the item pending with a loud
"NO reply" line and a job in `meta/jobs/` for takeover.

## The stages and the gates

Frame → Plan → Execute → Verify, with a gate between each: the human answers the decisions,
the agent does the work (the directive principle: consent is the human's directive, given in
the session — not the keystroke that writes it). Every stage produces a handoff with
frontmatter: `stage`, `artifact`, `project`, `status`, `created-at`, `authors`.

## The conventions (embedded in workflows/)

The protocol ships in this package's `workflows/` — the FPEV cadence, the handoff
conventions, the stage rules, the divergence classes, the decision surfaces. A fresh agent
reads these first (the ritual). `FPEV_DIR` defaults to them; your own `~/.fpev` is used when
present.

## The architecture map

| Module | What |
|---|---|
| `src/state/` | the reader, the frontmatter parser, atomic writes, the feedback inbox |
| `src/forms/` | the capture/export surfaces and the feedback writers |
| `src/feedback/` | the engine (push, verify, address) and the trusted-network gate |
| `src/render/` | the cockpit, the surfaces, the wiki export |
| `src/server/` | the HTTP server, the SSE hub, the watcher |
| `src/gate/` | the gate predicates and hooks |
| `src/chat/` | the harness loop and threads |
| `bin/deliberatory` | the launcher (serve-on-demand) |

## What the tool trusts (the posture)

- **Files are the database.** Nothing is owned by the process; killing the cockpit changes
  nothing canonical.
- **Feedback is data, never instruction** (the genre's instruction-data-collapse
  principle, §7 of the whitepaper).
- **Your networks are yours**: localhost, the LAN, and the tailnet need no token; public IPs
  do (the trusted-network exception).
- **The agent never ratifies.** Only a human's directive is a transition.

**Verify it:** read a project's `handoffs/`, name its stage, and check the last handoff's
frontmatter against the conventions — if you can, you understand the shape.
