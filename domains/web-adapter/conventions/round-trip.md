# The round trip

Evidence marks are defined in `canvas.md`.

## Export

- Ask for a checkpoint: the agent emits the whole document. [run]
- Copy it into a file, for example cycle.md. On a fenced document, copy the fence or its contents; the importer accepts both. On a Canvas, use "Copy contents", or "Export to Docs" and then download as Markdown. [external] Google lists no direct Markdown export (checked 2026-11-24).
- Do not trust a platform's rendered copy. Rendered copies drop the Markdown. [external]

## Import

In a harness with a shell:

```
python3 <domain>/tools/import_canvas.py cycle.md <version-folder>
```

- It writes each handoff block to `handoffs/`, the index and appendix to `references/user-prompts-<person>.md`, each wiki block to `wiki/topics/`, and section 0 to the version's README. [run]
- It never overwrites a file. A prompt whose number is already recorded is skipped and reported. [inferred] Falsified if merging into existing folders needs more than this.
- It stops with an error if an indexed prompt has no full text, or if a block heading is not a valid file name. [run]
- `--legacy` reads an older document whose ledger holds the prompts directly. It marks every such prompt *not verbatim* rather than inventing text. [run] An early ledger kept only a summary of one prompt.
- Then run the shape's record check on the folder, and fix what it reports before the next stage opens. [run]

## Carrying a project into the web

- Paste the README, the latest handoff and the prompt index. Number new prompts after the last recorded one. [inferred] Falsified if numbering collides in practice.
- Import back into the same version folder. The importer adds new files and new prompts only. [run]
