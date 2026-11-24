# Changelog

## 261123.2 — the introduction made reliable

- A line at the top of the README points an agent asked to "introduce" the shape, or summarize its domains, to *New here?*. `package.json` now carries the current version, and `docs/UNDERSTAND.md` says it covers the optional cockpit. *Case:* after 261123.1 was installed, "Introduce ~/.v2-fpev-deliberatory" in Claude Code still described the shape as a TypeScript workbench at version 261010, from `package.json` and `docs/`, and gave no domain count.

## 261123.1 — a short introduction for new users

- **README, *New here?***: how an agent answers plain asks such as "Introduce ~/.v2-fpev-deliberatory" and "Give me a summary of its domains". Facts are read from the files when asked, so they cannot go stale; in particular, domains are counted from the listing of `domains/`. *Case:* the domain count went from three to twelve in one day, and prose counts in the indexes had already gone stale twice. A script for this was built and withdrawn at the owner's word ("I don't like frozen bin's"); the asks are instructions an agent follows.

## 261123 — the record kept complete

Three changes the owner asked for after six weeks of use, each from a case. Compatible: domains that require fpev 261010 remain valid, because nothing they rely on changed.

- **Prompts are recorded automatically** (rule 3). Before acting on a message, the agent appends it, unchanged and numbered, to `references/user-prompts-<person>.md`. *Case:* in several projects prompts lived only in harness session logs, and some were lost. A course's September prompts could not be recovered when a domain was built from it.
- **Every stage and phase ends in a handoff** (rule 2), written before the next opens; a missed one is written as soon as it is found and marked. *Case:* agents skipped stage handoffs. The new check found five projects of the domain work with no Plan handoff and no prompt record.
- **Frame phases are explicit.** Discussion and probing before the triptych run as `stage-1-phase-{M}` handoffs, and the triptych consolidates them. *Case:* the domains project ran seven Frame phases before its triptych, and review cycles kept long framing discussions outside the handoff pattern.
- **`bin/fpev-record-check`** checks a version folder's record before each stage or phase: the prompt record, one handoff per stage and phase, the triptych once Plan has begun, and names and front matter. Its self-test rejects four planted faults.
- **Domains:** the domains folder now holds nine domain folders with a version registry, synced from the installs made since 261010.


## 261010 — v2: a leaner shape, from practice

What changed from 260810, and why. Each item rests on use of v1 in more than a hundred cycles or on a stated principle; the development record holds the evidence.

- **Six rules open the first-read file.** The human opens each stage in words. Every handoff names its person and its agent. The human's words stay theirs, and their prompts are recorded. Frame names the deliverable. Execute runs every mechanical check; Verify is the human's. The record grows. Everything else is advice.
- **The command line is the default.** HTML surfaces and the cockpit come on request and stay in the package.
- **Verify is the human's stage.** A phase starts from something the human says. Mechanical verification moved to a closing phase of Execute.
- **Two levels of folders.** A project holds sub-projects; each version of a sub-project is one cycle, in `v{N}-{sub-project}/`. Wiki and references exist at both levels.
- **Person and agent in every handoff name,** joined, person first.
- **The conventions stand alone.** No file refers to a protocol folder elsewhere. Eight unused convention files left; the index lists two groups, core and on request.
- **The cockpit names no agent.** Start it with the command of the harness in use (`AGENT_BIN`, `AGENT_ARGS`) and the person's handle (`FPEV_PERSON`). With no agent named it posts jobs and spawns nothing.
- **Domain schemas ship** in `domains/`: OCR transcription; the first draft of a research article.
- **Repairs.** The launcher starts on a machine without another copy of the conventions. The cockpit reads a shared wiki and references one level up. The code holds no person's name.
- **The protocol document is unchanged.**

Known and left for a later version: the conventions do not yet say how a stage is opened when the human is away; the form of the authors list in front matter is open; four on-request files and the two schemas' Stage 4 phases still describe v1.

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
