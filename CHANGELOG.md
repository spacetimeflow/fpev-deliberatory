# Changelog

## 260810 — the milestone era (the first shared release)

The version the tool became stable enough to share. What it contains:

- **The feedback engine** — capture → inbox → push → verify → address, with the
  **verified-reply gate**: the engine grants "addressed" only after a reply is actually in
  the file, never on the agent's word (prose does not enforce, so the engine checks).
- **Remote feedback** — `FEEDBACK_TOKEN` (set → the feedback APIs require it; unset → LAN
  trust unchanged), the `/feedback` surface (the feedbacker's limited view: the thread, not
  the project), `/api/feedback/reply`.
- **The trusted-network exception** — your own networks (localhost, the LAN, the tailnet)
  need no token; public IPs do.
- **The tailnet path** — verified end to end from a phone, anywhere (2026-08-09).
- **`HOST`** — bind the cockpit to any interface; default 0.0.0.0.
- **The standalone conventions** — the `~/.fpev` protocol is embedded in `workflows/`; a
  fresh clone needs no external `~/.fpev` (`FPEV_DIR` defaults to the embedded copy).
- **The phone-usable cockpit** — the feedback box at the top of the sidebar, compact and
  extendable.
- **The shape audit (FB-002)** — the package verified against the deployed shape
  (`~/.v1-fpev-deliberatory`): the deployed copy regained its test files and the
  relocatable `run`; the drift-lint's domain is the publishable conventions (the author's
  dev records excluded); `workflows/project-folder-structure.md` and the manual's
  drift-lint lines state the publishing boundary. Prose/packaging only — no runtime
  change.
- **The self-contained manual (FB-004)** — every whitepaper citation (`see the genre's
  whitepaper`, `(§7)`, `the genre's shared wiki`) now carries its meaning inline; the
  whitepaper and the genre's wiki are named as optional background, never load-bearing.
  Prose only — no runtime change.
- **The shape-naming and ritual revision (FB-005)** — the ritual names the shape: "Follow
  fpev-deliberatory (260810)", with the project directory and where its documents live
  (`handoffs/` · `references/` · `wiki/topics/` · `workbench/`); the released-shape
  identity is `fpev-deliberatory-260810`, with the coexistence convention (versioned
  sibling directories; the ritual names the version). Prompt-text only — no behavioral
  change; the suites stay green.

Prior history is recorded in the v1-fpev-deliberatory project's handoffs (the tool's own
development cycles), which are not part of this repository — the two-session discipline.
