---
created-at: 2026-09-22
created-by: Opus5CC
type: domain-schema
domain: ocr-transcription
complements: workflows/ (the FPEV cadence) — does not replace any stage
derived-from: diaries-OCR/my-dad-1994-OCR (85 manuscript pages, Frame → Plan → 13 Execute phases, 2026-09-21/22)
status: draft (v1; revise after the second volume)
---

# Domain schema — OCR / faithful transcription of a handwritten corpus

For projects that turn a scanned handwritten or printed corpus into a **faithful text**, page by
page, where the author (or another human who knows the material) is available as an oracle but
their attention is scarce.

## 1. When this applies

All four should hold. If only one or two do, take §4's decisions and §5's tripwires and skip the
rest.

1. **The corpus is partitioned into units** (pages, entries, folios) that can be worked in batches.
2. **Quality is a rate, not a boolean.** "Correct" is not achievable; "how many uncertain readings
   per hundred characters" is.
3. **Knowledge compounds across units** — a handwriting key, a glossary, the story — so the order
   of work changes the total cost.
4. **A human oracle exists but must be rationed.** They can answer, but not page by page, and not
   twice for the same question.

Sibling domains that borrow most of this: translation of a long work, manual data labelling,
large-scale code migration, systematic literature extraction.

## 2. The program layer (sibling projects, not versions)

The cadence knows two layouts: one project, and versioned siblings (`v0-…`, `v1-…`) sharing a
`wiki/`. A corpus family is neither — `volume-1-OCR`, `volume-2-OCR` are **peers**, and they must
share knowledge. Use a program folder:

```
<corpus-program>/                 ← e.g. diaries-OCR/
├── README.md                     ← layout, project table, shared rules
├── *.pdf                         ← sources, read-only, never modified
├── wiki/topics/                  ← SHARED doctrine: conventions, handwriting key, glossary, method
├── references/                   ← SHARED evidence: page surveys, extracted scans, disclosure log
│   └── scans/<source>/           ← derived page images (regenerable)
├── explorations/                 ← notes that outgrow a single volume
└── <volume>-OCR/                 ← one FPEV project per source, standard skeleton inside
    ├── handoffs/ deliverables/ dist/ meta/ workbench/ README.md
```

**Rule: anything that will still be true for the next volume lives at the program level.** The
handwriting key is the compounding asset of the whole program; keeping it inside one project
throws away the reason to do several.

## 3. Phase template (Stage 3)

Run as a chain; only P9–P11 need everything before them. Page counts are the reference
implementation's.

| Phase | Name | What it does | Why here |
|---|---|---|---|
| **P0** | Inventory | Extract page images; read **top strips at ~2×** for every page; produce a per-page table (unit, paper, hand, legibility, heading, manuscript page number) and the reading order; re-cut the batches | Thumbnails mislead; a 15-sheet contact pass fixes the boundaries before any transcription |
| **P0b** | Calibration | Transcribe 1–2 representative pages cold; send to the oracle; iterate until their corrections stop changing the reading | Establishes the key and the real doubt rate before committing to batch sizes |
| **P1** | Front matter | Outlines, indexes, title pages, letters, summaries **first** | Cheapest source of names, places and structure per character read; seeds the glossary |
| **P2…Pn** | Batches, **easiest hand first** | Fair copies before drafts; clean before revised; 5–15 units each | The key is built where reading is cheap, then spent where it is expensive |
| **P(n+1)** | Terms consolidation | Merge the per-batch staged terms into the program glossary; produce **one** confirmation list | A term seen once is a guess; a term seen across the corpus is resolvable |
| **P(n+2)** | Map | Story map (for a narrative) or event timeline (for diaries): layers, order, characters, motifs, planned-vs-written | Context makes the recursive pass possible; cheapest aid per hour |
| **P(n+3)** | Recursive re-reading | Re-read remaining marks with the mature key, glossary and map. **Visual support required** (§5) | Where the unmarked errors are caught |
| **P(n+4)** | Assembly | Generate the full text in reading order **by script** from the batch files; never hand-edit the assembled file | Corrections have one home; the assembly is reproducible |

**Ordering rule (the one that matters):** order batches by *ascending difficulty*, not by page
number. In the reference implementation the cold rate on the hardest hand was ≈ 11 doubts/100; the
same hand after the key existed read at 1.5–2/100.

**Checkpoint rule:** the phase handoff is too coarse a checkpoint for a long mechanical phase.
**Append each unit to its deliverable file before reading the next one.** Two session interruptions
cost nothing because of this; nothing else in the cadence would have saved them.

## 4. Standard decisions (with defaults)

Copy into the Plan's decisions table; change what the corpus requires and say why.

| ID | Decision | Default | If wrong |
|---|---|---|---|
| **Fidelity** | What "faithful" means | **Diplomatic**: deletions, insertions, margin notes and illegibles are all recorded with markup; one output line per manuscript line; the author's errors are preserved. An edited reading version is a separate, later deliverable | Re-transcription; catch this in Frame, never in Execute |
| **Batch size** | Units per phase | 5–15, cut at natural breaks (chapter, entry, date) | Re-cut later batches only |
| **Batch order** | Which first | Front matter → easiest hand → dense → most revised | Reorder; the key carries over |
| **Question triage** | What to ask the oracle | **≤ 15 per batch**, only (a) recurring forms and (b) doubts that change meaning (names, places, dates, dialect, anything about a real person). One-off minor doubts stay marked and are never asked | Raise the cap when a new hand or paper appears |
| **Blocking** | Waiting for answers | **Non-blocking.** The next batch starts without them; answers are applied to earlier batches as versioned revisions and to the key before the next batch | If the doubt rate breaches a tripwire, stop and wait |
| **Terms** | Glossary timing | Collect continuously into a staging file; consolidate **once**, late | Staging is cheap; re-consolidation is not |
| **Identification** | Linking a text's people/places to real ones | Record the form **as written** and its role in the text. A real-person identification is added **only on the oracle's word**, marked as confirmed | Move identifications to a private project file |
| **Recursive pass** | Stop rule | At most two rounds; stop early when a round resolves < 10% of what remains | Revert that unit's version; prior versions are kept |
| **Versions** | Revisions | Revise batch files in place, preserving `-v{N}.md` | — |
| **Language** | Of the artifacts | Handoffs in the working language; transcriptions, footnotes, glossary and question lists in the **corpus's** language | Switch anytime |
| **Privacy** | Cloud exposure | Decide in Frame, per corpus. Log every unit sent to a cloud model in the program's `references/disclosure-log.md` | See §8 |
| **Local models** | Whether to compare | Not in the first volume unless privacy requires it; note as a gap | Add a comparison phase after the first batch |

## 5. Tripwires and the fidelity rules

**Tripwires** (Execute stops and calls the human):

- flagged doubts > **8 per 100 characters** on a fair copy or clean page;
- flagged doubts > **15 per 100** on a heavily revised draft;
- a new hand, paper or ink that the inventory did not predict;
- more than **15** questions accumulating in one batch.

**Fidelity rules that had to be learned (adopt them from the start):**

1. **If a footnote doubts a reading, the text must carry the mark inline.** A footnote alone hides
   the doubt from every later reader and from every count.
2. **A change in the recursive pass needs visual support.** Context may choose between readings the
   strokes allow; it may never invent a reading the strokes do not show. A reading chosen by context
   alone keeps its mark. Otherwise the pass "corrects" the author's real errors into what the
   sentence ought to say.
3. **After a dense unit, scan for repeated lines.** Long similar lines invite copying a phrase twice
   or skipping one; the doubt rate cannot detect this.
4. **The flagged rate measures honesty, not accuracy.** Fluent pages invite confident misreadings
   that carry no mark. Only two things find those: a human spot-check, and cross-draft reading.

## 6. Stage 4 — the phase set, and the verification recipes

**The protocol's three layers are software-shaped** (components that fail in isolation, then
integrate). A transcription has no components, so Stage 4 in this domain runs as:

| # | Phase | Establishes | Owner |
|---|---|---|---|
| V1 | **Register** | an open handoff listing the Stage 4 phases, their status and evidence; appended to as each closes | agent |
| V2 | Integrity | every unit appears exactly once in reading order; counts reproduce from the batch files | script |
| V3 | **The oracle pass — the gate** | the author answers the triaged questions and reads one full unit per batch against the image; answers are applied to the batch files, the key and the glossary; the text is regenerated | **human** |
| V4 | **Downstream use (dogfood)** | the deliverable is used for real work; if it cannot carry that work, it is not finished | agent + human |
| V5 | Retrospective + domain schema | lessons promoted out of the project (protocol Stage 4 Phase 4) | agent |
| V6 | Conformance, verdict, propagate-back | each Plan deliverable verdicted; gaps closed or deferred; what the next volume starts from | both |

Two rules learned from the reference implementation:

- **V3 is the gate.** V2 proves the file is well-formed, V4 proves it is useful, V5 proves it taught
  something. None of them proves it is *right*. Until V3 runs, every derived artifact must state
  that the readings are unchecked.
- **Downstream use tests sufficiency, never accuracy.** A confident misreading survives it
  untouched. Keep V4 and V3 as separate phases; never let a successful V4 stand in for V3.
- **A reading edition is a new cycle, not a Verify phase.** Choosing between drafts, acting on the
  author's revision notes, modernizing punctuation and repairing the author's own errors are
  Frame-level decisions, and the exact opposite of the diplomatic rule this cycle committed to. Give
  it its own Frame with the transcription as canonical input.

### Verification recipes

1. **Triaged answers.** The oracle answers the recurring-form questions first: each answer is
   applied across the whole corpus, the key, and the glossary.
2. **One full unit per batch, read against the image** — choose a unit with a *low* flagged rate;
   that is where silent errors hide.
3. **Cross-draft check.** Wherever the corpus holds two versions of the same text (draft ↔ fair
   copy, outline ↔ chapter, letter ↔ diary entry), read them against each other. **Count the
   unmarked errors this finds: that number, not the flagged rate, is the honest accuracy estimate.**
4. **Regenerate** the assembled text after answers are applied; re-run the recursive pass only if
   the recurring-form answers were substantial.
5. **Propagate back**: corrections to the inventory, the key, and this schema's benchmarks.

## 7. Standard wiki topics (create on day one, at the program level)

| Topic | Holds |
|---|---|
| `transcription-conventions` | the markup, one numbered rule per decision; the fidelity rules of §5 |
| `handwriting-key-<author>` | each recurring form, the confusable it resembles, where it was confirmed. **The compounding asset** |
| `ocr-batch-workflow` | the method, the crop settings, per-page-type benchmarks, an append-only lessons list, time and cost |
| `glossary-people-places` | terms as written, pages, role in the text, status. Copy the **places** and **words** sections to the next volume; start **people** empty — each corpus needs its own privacy decision |

A corpus with three naming layers (real names in private notes, aliases in the work, names later
struck out) needs a "which layer" column, or the glossary will conflate them.

## 8. Privacy

Personal corpora are the normal case for this domain, so the schema carries a stance the cadence
does not have:

- Decide in **Frame**, not later: which sensitivity level the corpus is, and what may reach a cloud
  model.
- **Log every disclosure** (`references/disclosure-log.md`): what was sent, which pages, when, to
  which service.
- **Fiction and memory are not fact.** A statement inside the corpus about a real person becomes a
  fact only when the oracle confirms it. Every analytic artifact repeats this rule at the top.
- Never modify the source scans.

## 9. Metrics to record (so the next volume can be estimated)

- doubts per 100 characters, **per page type** (clean / dense / revised / author's to-do notes);
- cold rate vs. post-key rate for the same hand;
- characters transcribed per phase, and wall-clock per batch;
- unmarked errors found per 100 units cross-checked;
- **share of heavily revised pages** — estimate a volume's cost from this, not from its page count.

Reference numbers (my-dad-1994, first pass, one model): clean fair copy 0.6–2.5 · dense draft
1.5–2.1 · heavily revised draft ≈ 3.2 · author's small to-do notes 6.6 · same hand cold, before the
key ≈ 11. Whole volume 84 pages / 65,850 characters ≈ 2.3 doubts per 100.

## 10. Reference implementation

`~/cJWL25/Personal25/PIM/diaries/diaries-OCR/my-dad-1994-OCR` — Frame triptych, a Plan with 13
decisions and a 13-phase DAG, phases P0–P12 each with lessons, suggestions and a triaged question
list, and the program layer in `diaries-OCR/wiki` and `diaries-OCR/references`. The retrospective on
what the cadence itself contributed is
`diaries-OCR/explorations/what-the-cadence-did-for-an-OCR-project-Opus5CC-20260922.md`.

## 11. What the cadence does not supply (candidates for `workflows/`)

Written down honestly, because these had to be invented in the project and the next domain will
need them too:

1. **A program layer for sibling (non-versioned) projects.** `project-folder-structure.md` covers
   one project and versioned siblings; a corpus family needs a shared `wiki/` and `references/`
   above peers. Proposed as an addition.
2. **A sub-phase checkpoint rule.** "Write the unit to its deliverable before reading the next" is
   what makes a long Execute phase interruption-proof; the handoff granularity does not.
3. **A human-oracle budget.** The U-shape says the human withdraws during Execute, but says nothing
   about work whose *quality* depends on scarce human answers. Triage (≤ N per batch, recurring
   first, non-blocking) is the pattern; it belongs in the protocol, not in each plan.
4. **A stop rule for recursive passes.** Two rounds / 10% is this domain's version of a general
   need: any refinement loop must state when it stops before it starts.
5. **`stage-{N}-{artifact}-human-feedback-replies.md`** — a first-class artifact for the human's
   verbatim answers during a slow stage. It was invented here, it was load-bearing (the fidelity
   decision and five correction rounds live in it), and it is not in `handoff-conventions.md`.
6. **Non-ASCII deliverable names.** The cockpit's Deliverables panel matches ASCII-only names in
   handoff bullets, so a CJK filename is invisible to it; the workaround is a `dist/` symlink. A
   tool fix, not a protocol one.
