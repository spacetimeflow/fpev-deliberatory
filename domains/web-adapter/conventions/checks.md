# Checks in a web cycle

Evidence marks are defined in `canvas.md`.

Rule 5 says Execute runs every mechanical check. A web chat cannot run one, so the check moves to import, and the web agent reports only procedure.

## What the web agent may say

- What it did: which blocks it wrote, which prompts it recorded, what it left for after import. [run]
- That a check is *pending*, with its name and the command that will run it. [run]
- Never that a check *passed*, and never a count it did not compute with a tool. [run] An earlier agent reported its own reply as "38 words" and called the result a pass.
- A self-review of reasoning (does the plan meet the frame?) is allowed if it is labelled as review, not as a check. [external] Self-verification checks procedure, never findings (domain-development, evidence).

## What runs after import

- `tools/import_canvas.py` checks the document's form: the sections present, block headings, every indexed prompt having full text, and no file overwritten. [run]
- The shape's record check then runs on the version folder, and its report goes into the next handoff. [run]
- Any check the plan named for Execute runs here, in the filesystem harness, before Verify closes. [run]

## Verify

- Present the deliverable first, with where it lives, then the wiki candidates, then the export step. [owner] "Where are the deliverables?"
- Record the human's approval or edits as prompts, verbatim. [run]
- Mark a wiki block approved only on the human's words. [run]
- The cycle is closed only after import and a clean record check. Until then, call it *closed in chat, pending import*. [inferred] Falsified if cycles closed in chat never show import defects.
