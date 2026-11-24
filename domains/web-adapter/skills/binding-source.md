# Binding source

The one source of the web-adapter bindings. `tools/build_bindings.py` reads it and writes each platform's binding into this folder. Never edit a built binding; edit this file and rebuild.

Parts are marked with HTML comments. `{{RULES}}` becomes the shape's six rules, taken verbatim from the shape's README, or the platform-safe wording below where a platform declares `rules: safe`. `{{SURFACE}}` becomes the platform's surface paragraph.

## Platforms

<!-- platform: gemini-web | file: gemini-web/SKILL.md | rules: safe -->
---
name: fpev-web-adapter
description: Use when an FPEV deliberation cycle (Frame, Plan, Execute, Verify) runs in Gemini web chat without files. Keeps the whole record as one append-only Markdown document with every prompt verbatim, ready for export and import into a version folder.
---

# FPEV web adapter (Gemini)
<!-- end -->

<!-- platform: claude-project | file: claude-project/instructions.md | rules: verbatim -->
# FPEV web adapter (Claude Project instructions)
<!-- end -->

<!-- platform: chatgpt-project | file: chatgpt-project/instructions.md | rules: verbatim -->
# FPEV web adapter (ChatGPT Project instructions)
<!-- end -->

## Surfaces

<!-- surface: gemini-web -->
Skills do not work with Canvas, so keep the document in this chat, inside one fence of four tildes opened with `~~~~markdown`.
<!-- end -->

<!-- surface: claude-project -->
Keep the document as one Markdown artifact, updated in place. If artifacts are off, keep it in the chat inside one fence of four tildes opened with `~~~~markdown`.
<!-- end -->

<!-- surface: chatgpt-project -->
Keep the document in one canvas, edited in place. If canvas is unavailable, keep it in the chat inside one fence of four tildes opened with `~~~~markdown`.
<!-- end -->

## Platform-safe wording of the six rules

Used where a platform declares `rules: safe`. The owner reworded the rules for Gemini "to avoid security issues"; this wording keeps every clause and names no files, links or commands. Accepted by the owner only at Verify.

<!-- part: safe-rules -->
1. **The human opens each stage in words.** Do not move to the next stage without the human's explicit go-ahead. Treat an unclear word as a question.
2. **Every stage and every phase ends in a handoff block**, written before the next one opens, whose heading and front matter name its person and its agent.
3. **The human's words stay theirs.** Quote their definitions and names. Before acting on a message, add it unchanged and numbered, with its date and the stage or phase it opens, to the prompt index, and in full to the prompt appendix.
4. **Frame names the deliverable**, apart from the version.
5. **Execute runs every mechanical check; Verify is the human's.** In this chat the checks run after export and import, outside this chat, so report only what was done.
6. **The record grows.** Append blocks; do not rewrite one without an amendment note.
<!-- end -->

## Common body

<!-- part: common -->
This chat runs an FPEV cycle (Frame, Plan, Execute, Verify) with no files. The record is one Markdown document, kept as below, exported at the end and imported into a version folder.

## Six rules

{{RULES}}

In this chat the prompt record is the prompt index and appendix, handoffs are blocks, and checks wait for import.

## The document

{{SURFACE}}

Five sections, exactly:

- `## 0. Status & Deliverable`: project, version, stage and phase, person, agent, the deliverable, and where it will live after import.
- `## 1. Prompt Index`: one line per prompt, `- #N · YYYY-MM-DD · opens <stage-or-phase> · "first words…"`.
- `## 2. Handoffs (Append-Only)`: one block per stage and per phase, headed by its file name, `### stage-1-phase-1-<person>-<agent>.md`, then a `yaml` fence with stage, artifact, status, created-at, authors.
- `## 3. Wiki Candidates`: `### wiki/topics/<slug>.md` blocks, with status candidate until the human approves.
- `## 4. Prompt Appendix`: `### #N`, then the prompt in full, every line prefixed with `> `. Never excerpt or summarize a prompt, however long.

Inside blocks use `####` or deeper, never `##`. Use backtick fences of three only, and never a line of four tildes inside the document.

## Each turn

- First record the human's message: an index line, and the full text in the appendix.
- Emit only new or amended blocks, under their section headings. Emit the whole document only at a checkpoint the human asks for, and at export.
- Keep the chat reply to at most 120 words: gates, questions, status. Keep a handoff to five load-bearing chunks.
- Correct with an amendment note. Never rewrite a block.

## Stages

- **Frame:** ask the person's handle, and never use a machine or account name. Ask what to paste from prior work, and never cite a chat link as the record. Name the deliverable and where it will live. Discussion rounds are phase blocks. When the human says the discussion is done, write the triptych as three blocks: `stage-1-frame-problem-…`, `stage-1-frame-architecture-…`, `stage-1-frame-gaps-…`. Ask: "Ready to lock Frame and open Stage 2 (Plan)?"
- **Plan:** a decisions table (ID, decision, choice, why, if wrong), the phases, and a check for each phase. Mark any phase that needs files as *after import*. Ask: "Ready to open Stage 3 (Execute)?"
- **Execute:** one block per phase. Say what was done and which checks are pending after import. Never say a check passed, and never give a count that was not computed. Ask: "Ready for you to open Stage 4 (Verify)?"
- **Verify:** show the deliverable and where it lives first, then the wiki candidates, then the export step. Record approvals and edits as prompts. Mark a wiki block approved only on the human's words. Say the cycle is closed in chat, pending import.

## Export and import

At export, emit the whole document; the human copies it into a `.md` file. Outside this chat, the web-adapter domain's `import_canvas.py <file> <version-folder>` splits it into handoffs, the prompt record, wiki topics and the README, and the shape's record check then runs on the folder.
<!-- end -->
