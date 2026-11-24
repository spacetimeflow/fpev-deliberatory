# Bindings

Evidence marks are defined in `canvas.md`.

A binding is a platform's way of reaching this domain. It is compiled, and never the source.

## Where they come from

- The source is `skills/binding-source.md`: one common body, one block per platform, and any platform-safe wording of the rules. [owner] "compiling skills/gemini-web/ (plus Claude/ChatGPT Project bindings) from it"
- `tools/build_bindings.py` writes the three bindings. It takes the six rules verbatim from the shape's README, or uses the platform-safe wording where the source declares one. [owner]
- Never edit a built binding. Change the source and rebuild. [run] A hand-written copy of the rules lost clauses of rules 2, 3 and 5.
- Rebuild whenever the shape's rules change, and commit the output. [inferred] Falsified if bindings never drift from the README between rebuilds.

## Platform-safe wording

- A platform may need the rules worded differently. The owner reworded them once for Gemini "to avoid security issues". [owner]
- A safe wording keeps every clause: rule 1, the human opens each stage and an unclear word is a question; rule 2, every stage and every phase, written before the next opens, naming person and agent; rule 3, their definitions and names quoted, every prompt unchanged, numbered, dated, with its stage or phase; rule 4, the deliverable apart from the version; rule 5, mechanical checks, run after import, and Verify is the human's; rule 6, no rewrite without a note. [run]
- Only the owner accepts a safe wording. [owner]

## The check

- `checks/check_bindings.py` passes a binding only if each rule is present: verbatim, or by every clause above. It also requires well-formed front matter, no machine paths, and at most 6,000 characters. [run]
- The original hand-written Gemini skill fails it, on rules 2, 3 and 5. That failure is the check's planted fault. [run]

## Per platform

- **Gemini web:** a skill. Its `skills/gemini-web/SKILL.md` name is lowercase with hyphens; its description begins "Use when", is in the third person, and stays within 1,024 characters. Skills do not work with Canvas, so the document stays in the chat. [external] Google help, checked 2026-11-24.
- **Claude Projects:** project instructions, with one Markdown artifact as the document where artifacts are on. [inferred] Falsified if artifacts are not updated in place.
- **ChatGPT Projects:** project instructions, with one canvas as the document where available. [external] OpenAI: "Use Canvas to draft documents"; project instructions "override your global custom instructions".
- Upload a binding as plain files, with no hidden files beside it. [external] Google: hidden files can make an upload fail.
