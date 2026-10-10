# Decision surfaces

A decision surface is a **scannable rendering of a handoff** for human review at a judgment point. The handoff is dense and machine-targeted; the surface is sparse and human-targeted. Both exist; both are canonical for their respective consumers.

## When to generate a surface

| Stage | Surface kind | Audience |
|---|---|---|
| Frame | Cards (interactive HTML) | The person framing — to review principles, gaps, constraints in 5 minutes |
| Plan | Cards or table | The person approving the plan — to see decisions, deliverables, Phase DAG at a glance |
| Verify | Slides (reveal.js HTML) | Verifier + audience for dissemination — to see what shipped, what the verdict is |
| Execute | Usually no surface | Execute is fast, no judgment point; surfaces would be friction |

If a stage has multiple sibling handoffs (Frame triptych), each sibling gets its own surface.

## Surface formats

| Format | File extension | Use |
|---|---|---|
| Cards | `.html` (interactive, sticky-nav) | Framing, planning, verifying — when reviewer needs to flip between sections |
| Slides | `.html` (reveal.js) | Verify dissemination — when output will be presented or archived for later viewing |
| Plain table | inline in handoff | Quick decisions, no separate file |

## Where surfaces live

```
{project}/
├── handoffs/
│   └── stage-{N}-{artifact}-{author}.md     ← canonical markdown
└── workbench/surfaces/                       ← generated companions (deliberatory workbench)
    └── stage-{N}-{artifact}-{format}.html
```

Or some projects nest:

```
handoffs/
├── stage-{N}-{artifact}-{author}.md
└── stage-{N}-{artifact}-{author}-slides/
    └── index.html
```

Either is fine. Convention is per-project; declare in the project's README.

## Generation, not authoring

Surfaces are **generated from handoffs**, never hand-written. This follows C4 (markdown-canonical) and C14 (workflows are markdown-canonical; executable companions optional).

If a generator tool exists (e.g., `src/surfaces/gen.ts` in a PiFPEV deployment), use it:

```bash
node --experimental-strip-types src/surfaces/gen.ts \
  --handoff handoffs/stage-1-frame-problem-wenlong-OpusCC47.md \
  --stage 1 \
  --format cards \
  --output references/surfaces/stage-1-frame-problem-cards.html
```

If no generator exists, follow the **interactive explainer pattern** in `~/workflows25/`:

- `~/workflows25/interactive-explainer-guide.md` — ML/experiment shape (KaTeX + Chart.js + per-seed runs)
- `~/workflows25/interactive-code-explainer-guide.md` — software-system shape (Mermaid + spec-alignment + findings + notes)

For Frame/Plan/Verify decision surfaces specifically, the cards or slides pattern (not the code-explainer pattern) is the right shape.

## What goes on a surface

Across formats, the four canonical content types are:

| Content | Where it comes from |
|---|---|
| **Decisions** | Marked `### DN — Title` in the handoff, or extracted from a decisions table |
| **Gaps** | Marked `### GN — Title` with status pills |
| **Phases** | Extracted from a Phase DAG (`P0`, `P1`, etc.) |
| **Principles** | Extracted from a `## Principles` section as headings |

The generator parses these patterns and renders cards/slides for each. If your handoff doesn't use these patterns, the generator produces an empty surface — which is itself a signal: either the handoff is missing content, or the generator's patterns need extending.

## Mandatory: link back to canonical

Every surface includes a **link back to the canonical handoff** in its header:

```html
<header>
  <h1>{stage} — {project}</h1>
  <a href="../../handoffs/stage-{N}-...-{author}.md">View canonical markdown</a>
</header>
```

A reader who wants more depth than the surface offers should always be one click away from the dense source.

## Interactive surfaces

For Frame/Plan/Verify, surfaces are **interactive**: each section has a `<textarea>` for reader notes, autosave to `localStorage`, and an "Export notes" button. The reader's notes archive into the handoff alongside the surface.

Notes pattern (proven in PiFPEV's architecture-review HTML and Stage-4-verify HTML):

```javascript
document.querySelectorAll('.note-card textarea').forEach(ta => {
  const key = 'surface-notes:' + ta.dataset.key;
  const saved = localStorage.getItem(key);
  if (saved) ta.value = saved;
  let timer = null;
  ta.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => localStorage.setItem(key, ta.value), 300);
  });
});
```

This pattern is documented in `~/workflows25/interactive-code-explainer-guide.md` §7.

## What's NOT a decision surface

- A **README** is documentation, not a surface
- A **handoff** is the canonical source, not a surface
- A **slide deck for a talk** is dissemination — it could be the Verify-stage surface or could be a separate downstream artifact
- A **cockpit** is a real-time state view, not a decision surface (though it might link to surfaces)

## Cost vs benefit

Surfaces cost ~5–15 minutes to generate; benefit is dramatic — the reviewer reads in 5 minutes what otherwise takes 30. **The skip-the-surface trap is real:** when in a hurry, the surface feels like overhead. But the U-shape says: when in a hurry, you're probably in Execute, and you wouldn't be generating a surface anyway. Frame/Plan/Verify *should* be slow enough to afford the surface.

If you find yourself generating surfaces during Execute, your Execute is leaking into Plan territory — that's a signal worth recording (likely R3 or R4).

## See also

- `~/workflows25/interactive-explainer-guide.md` — full pattern (ML)
- `~/workflows25/interactive-code-explainer-guide.md` — full pattern (software)
