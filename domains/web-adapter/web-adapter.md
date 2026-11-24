---
name: web-adapter
type: domain-shape
status: draft
owner: the person who runs this FPEV installation
reference-runs:
  - a Gemini web cycle run from a hand-written SKILL, Frame to Verify (2026-11), whose exported record is the importer's first case
  - the development project that built this domain from that run
---

# Web adapter

A domain shape for running an FPEV cycle, or part of one, inside a web chat that has no files and no shell.

## Purpose

In its owner's words, the aim is to "develop a web-based fpev-deliberatory", made "a FPEV-domain type". The owner set its two design lines: "two-tier fidelity", which keeps "the full verbatim prompt text" while showing "a 1-line index entry", and bindings compiled from the domain, which "prevents platform-specific Skill validator rules … from leaking into the core domain invariants".

## Scope

Browser chats with no file or shell access: Gemini web with a skill, Claude Projects, ChatGPT Projects. It covers a whole cycle, or a stage of a filesystem project carried out on the web, and the round trip back. Harnesses with a filesystem follow the shape directly. The cockpit, browser automation and any change to FPEV's rules are out of scope.

## The situation

FPEV assumes an agent that writes files and runs commands. A web chat has neither. Its record is one document that the agent re-emits, the human copies, and a later agent splits back into files. Each step can lose something without anyone seeing it. A long prompt gets summarized. A rule reworded for a platform loses a clause. A self-report reads like a check. A machine name becomes the person. The deliverable stays inside the chat, so the owner has to ask where it is. Rewriting the whole document every turn makes the cost grow quadratically with the length of the cycle.

None of this changes FPEV. The rules hold; only the medium of the record differs.

## Deliverable

A web cycle ends in an **exported document** that imports into a version folder, which then passes the shape's record check. The document carries one block per stage and phase, every prompt verbatim, and the wiki candidates. The cycle's own deliverable is named in Frame and shown at Verify, with where it will live after import.

The domain itself ships an idea file, conventions, a template, an importer, a binding builder, three compiled bindings, and checks for each tool.

## Stages and roles

The four stages run unchanged. The human opens each one; the web agent keeps the document; a filesystem agent imports it and runs the checks.

| Stage | Criterion | The domain supplies | Stays with the person |
|---|---|---|---|
| Frame | understandability | the pre-flight: surface, handles, prior state pasted, deliverable and its destination | the purpose; the handles; what to paste |
| Plan | conformance | the decisions table, phases and recipes as blocks; a phase marked for after import if it needs a shell | approving the plan |
| Execute | quality | one block per phase, deltas only, checks deferred to import | nothing routine |
| Verify | insight | the deliverable first, then the wiki candidates, then the export step; the record check after import | approval, edits, and saying what was produced |

## Cadence

The human's attention goes to the gates, as in any cycle, plus two web moments: pasting in at Frame, and the export and import at the end. Chat replies stay short, and the document holds the substance.

## Record

The document has five sections: status and deliverable, a prompt index, the handoffs, the wiki candidates, and a prompt appendix holding every prompt in full. Blocks are headed by the file names they will become. After import, the record is the shape's own: handoffs, the prompt file, the wiki and the version's README.

## Kernel

- FPEV's six rules hold. A platform may need different wording, but never a lost clause.
- Every prompt is kept word for word, in full, once. The index line points to it.
- A web agent reports what it did, never that a check passed. Checks run after import.
- Append; never rewrite. Corrections are amendment notes.
- The person's handle comes from the person, never from a machine or account name.
- Bindings are compiled from this domain and never edited by hand. A platform rule lives in its binding.
- Private chat links are pasted as text, never cited as the record.

## Envelopes

The web agent may keep and re-emit the document, ask clarifying questions, and draft each stage's blocks. It may not advance a stage, declare a check passed, or shorten a prompt. A filesystem agent may import, run the checks, and rebuild bindings in a development project. Only the owner installs, sets status, or accepts a platform-safe wording of the rules.

## What to internalize, and what stays on file

**Internalize:** the document is the record until it is imported; a self-report is not a check; a prompt is kept whole; and Verify starts with the deliverable.

**Keep on file:** the section layout, block and index formats, the platform notes, and the commands to import and build.

## Untested

- Only Gemini has a reference run, and it predates this domain. The Claude and ChatGPT bindings are tested for form only.
- Platform facts were checked on one date. Gemini skills did not then work with Canvas, and rendering of `<details>` was not documented anywhere.
- Which security issues led the owner to reword the rules for Gemini is not recorded, and whether the compiled wording passes Gemini's upload is untested.
- Whether deltas per turn keep long cycles within the chat's context is untested beyond a short cycle.
- The 120-word reply ceiling and the five-chunk budget come from one short run.
