# The document

Evidence marks: `[owner]` the owner's words · `[run]` observed in recorded work · `[external]` vendor documentation, dated · `[inferred]` reasoned, with what would falsify it.

A web cycle keeps its whole record in one Markdown document. Start from `canvas.md` in `templates/`.

## Where it lives

- Use the platform's document surface (Canvas, an artifact) when it works with the binding active, and edit it in place. [external] Gemini skills "do not yet work with features like Canvas" (Google help, checked 2026-11-24).
- Otherwise keep it in the chat, inside one outer fence of four tildes, `~~~~markdown`, so that inner backtick fences cannot close it. [run]
- One document per cycle. Never split the record across several. [run]

## Sections

Five level-2 headings, numbered so the importer finds them:

- `## 0. Status & Deliverable`: project, version, active stage and phase, person, agent, the deliverable, and where it will live after import. [run]
- `## 1. Prompt Index`: one line per prompt, `- #N · YYYY-MM-DD · opens <stage-or-phase> · "first words…"`. [owner] "a 1-line index entry".
- `## 2. Handoffs (Append-Only)`: one block per stage and per phase. [run] Rule 2; a single block per stage lost the phases.
- `## 3. Wiki Candidates`: one block per topic, for approval at Verify. [run]
- `## 4. Prompt Appendix`: every prompt in full, under `### #N`, each line prefixed with `> ` (a bare `>` for an empty line). [owner] "keep the full verbatim prompt text … so Rule 3 holds strictly".

Do not use `##` inside a block. Use `####` or deeper. [run] The importer splits on level-2 headings.

## Blocks

- Head each handoff block with the file name it will become, `### stage-1-phase-1-<person>-<agent>.md`, following the shape's naming. [run] It makes the import exact.
- Put its front matter in a `yaml` fence right under the heading: `stage`, `artifact`, `status`, `created-at`, `authors`. [run]
- Head each wiki block `### wiki/topics/<slug>.md`, with front matter including `status: candidate` until the human approves it. [run]
- Correct an earlier block with an amendment note appended after it, never by rewriting it. [run]
- Keep each handoff to at most five load-bearing chunks by default. [run] One short cycle held it; adjust per binding.

## Prompts

- Before anything else in a turn, add the human's message to the index and, in full, to the appendix. [run] Rule 3, timing.
- Keep the prompt whole however long it is. Never excerpt, summarize or hash it. [owner] The earlier "large paste" excerpt rule is struck.
- If pasted material is not the human's own words, say so in the index line, and keep it whole anyway. [run]
- `<details>` may wrap appendix entries where a binding says it renders. The appendix is the default. [external] Rendering was undocumented on all three platforms (checked 2026-11-24).

## Each turn

- Emit only the new or amended blocks, each under its section heading. [run] Re-emitting the whole document grew the cost quadratically.
- Emit the whole document when the human asks for a checkpoint, and at export. [inferred] Falsified if long cycles still overflow the chat's context.
- Keep the chat reply to at most 120 words: gates, questions, status. [run] It held in one short cycle (replies of 28–45 words).
- End each stage with its gate question, and wait. [run]

## Fences

- Inside the outer `~~~~` fence, use backtick fences only, of at most three backticks. [run] A nested backtick fence inside a backtick outer fence broke the document.
- Never put a line of four or more tildes inside the document. [inferred] Falsified if a renderer closes the outer fence on something else.
