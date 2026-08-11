# Handoff conventions

Every artifact an FPEV cycle produces follows these conventions. They are load-bearing — divergence breaks the cycle's composability.

## Naming

```
handoffs/stage-{stage-num}-{artifact-or-phase}-{author-id}.md
```

| Stage type | Pattern |
|---|---|
| Artifact-shaped (Frame) | `stage-1-frame-{problem|architecture|gaps}-{author}.md` |
| Phase-shaped (Plan, Execute, Verify) | `stage-{N}-phase-{M}-{author}.md` |
| Correction docs (propagate-back) | `v{n}-{stage-name}-correction.md` (lives in next-version's `handoffs/`) |

Examples (real):
- `stage-1-frame-problem-OpusCC47.md`
- `stage-3-phase-4-Qwen3.6-27B-UD-IQ3_XXS.gguf.md`
- `stage-4-phase-2-OpusCC47.md`
- `v0-framing-correction.md`

## Frontmatter (every handoff)

```yaml
---
stage: {N}-{stage-name}              # e.g., "1-frame", "3-execute", "4-verify"
artifact: {artifact-type}            # e.g., "problem-statement", "phase-4-handoff"
project: {project-name}              # e.g., "PiFPEV-v1"
phase: {phase-id}                    # optional; for phase-shaped stages
status: draft | revised | complete   # current state
created-at: {YYYY-MM-DD}
authors: [{author-id}]               # C8 — always explicit, never omitted
reads:                               # the inputs this handoff depended on
  - handoffs/...
  - wiki/topics/...
  - references/...
siblings:                            # related artifacts of the same stage
  - stage-{N}-...-{other-author}.md
next-stage: Stage {N+1} — {name}     # optional; what triggers when this is approved
---
```

## Author IDs (C8)

The `authors:` field is **load-bearing**. Reviewer ≠ author is enforced by FASTRIC (the `non-author-acted` rule on artifact transitions). Author IDs are short, stable identifiers:

| Convention | Examples |
|---|---|
| LLM in coding-agent | `OpusCC47` (Claude Opus 4.7 / Claude Code), `Sonnet46`, `Haiku45` |
| Local model | `Qwen3.6-27B-UD-IQ3_XXS.gguf` (full filename), `Llama3-70B-Q4`, `Mistral7B-instruct` |
| Human | first name, GitHub handle, or initials — `wenlong`, `efran`, `wj` |
| Multi-author handoff | `[OpusCC47, wenlong]` — array |

Pick a handle and use it consistently across cycles. If you switch models mid-cycle, update the `authors:` to reflect both, or split into separate handoffs.

## Section structure

The first section is always a one-paragraph summary an exhausted reader can grasp on a phone screen. Subsequent sections vary by stage. See `stages/{N}-*.md` for the canonical structure per stage.

## Cross-references

Use these conventions for links to other artifacts:

| Reference type | Convention |
|---|---|
| Another handoff in same project | `handoffs/stage-N-...-OpusCC47.md` (relative path) |
| Wiki topic | `wiki/topics/topic-name-{author}.md` |
| Code review / reference | `references/...` |
| External | absolute URL or `~/...` path |
| FPEV workflow | `~/.fpev/{stage|conventions}/...` |
| Protocol | `~/.fpev/fpev-cadence.md` |

## Sibling-of-three pattern (Frame stage)

Frame produces a **triptych** — three sibling handoffs read in this order:

1. `stage-1-frame-problem-{author}.md` — what we're solving and why
2. `stage-1-frame-architecture-{author}.md` — what we're building and how
3. `stage-1-frame-gaps-{author}.md` — what we still don't know

Each sibling's frontmatter declares the other two under `siblings:`. The triptych is treated as one logical artifact for Plan-stage purposes.

## Revision pattern

When a handoff is substantially revised (not just typo fixes), the **previous version** is preserved:

```
stage-1-frame-problem-OpusCC47-v1.md  ← preserved pre-revision version
stage-1-frame-problem-OpusCC47.md     ← current (post-revision)
```

The current file's frontmatter records:

```yaml
status: revised-v2
revised-at: {YYYY-MM-DD}
revisions: [v2 incorporates {who}'s feedback — see stage-{N}-human-feedback-replies.md]
supersedes: stage-1-frame-problem-OpusCC47-v1.md
```

## Status vocabulary

| Status | Meaning |
|---|---|
| `draft` | Initial output; not yet reviewed |
| `revised` (`revised-v2`, `revised-v3`, …) | Revised after feedback; previous version preserved |
| `reviewed` | Read and acknowledged; not yet final |
| `complete` | Stage's commitment to this artifact is final |
| `superseded` | Replaced by a later version (the `revised-vN` file is current) |
| `correction` | This is a propagate-back doc revising an earlier stage |

## Anti-patterns

These break composability — don't do them:

- **Anonymous handoffs.** Missing `authors:` is a hard constraint violation (C8).
- **In-place revision without preserving prior version.** Loses the audit trail.
- **Cross-cycle handoff in same directory without version prefix.** Use `v1-correction.md` or move to a separate `v1-PiFPEV/` directory.
- **Diverging from the naming pattern.** Tooling (FASTRIC lint, surface generators, GitHub bridge) all parse the filename — drift breaks them silently.
- **Inline non-canonical content.** If you produce JSON, HTML, or other derived formats, write them to separate files; the handoff stays markdown (C4).
