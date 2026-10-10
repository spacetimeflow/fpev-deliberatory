---
created-at: 2026-09-23
created-by: OpusCC5
type: domain-schema
domain: research-article-first-draft
complements: workflows/ (the FPEV cadence) — does not replace any stage
derived-from: v1-fpev-optimal-control-model (Frame with 3 feedback rounds → Plan with 22 decisions → 14 Execute phases, 2026-09-23)
status: draft v0.4 (2026-09-24: the researcher's standard Verify questions, from phase 8; terminology and notation from Stage 4 phase 2; units, the non-author check's findings and the seed trace-down from phases 3–5; metrics and the defect log from phase 6) — proposed from a project whose Stage 4 has not run; revise after its Verify, and again after a second article
install: installed 2026-09-23 (canonical copy in v1-fpev-deliberatory-deployment/domains/; file copied into the bundle without a full rebuild)
---

# Domain schema — the first draft of a research article

For projects that take ideas already discussed (explorations, notes, a practice) and turn them into
**the first complete draft of a research article**: definitions, assumptions, claims with proofs or
evidence, figures, related work, and a contribution statement a referee can check. The human is the
researcher and author; agents draft, derive, compute, fetch and check. Stage 4 (Verify) is where the
researcher judges the draft; this schema covers Frame through Execute in detail and sets up Verify.

The reference implementation built a **mathematical model** (optimal control) with theorems and
numerical checks. Sections marked **[model]** apply to articles whose claims are theorems or
simulations; the rest applies to any research article, including conceptual and empirical ones.

## 1. When this applies

All four should hold:

1. **The article makes claims** that can be listed, each with a status (conjectured, proved or
   supported, refuted, left as a conjecture).
2. **Seed material exists**: explorations, notes or a practice the article formalizes. The
   researcher has spent attention on it and expects it to be referred to properly.
3. **Novelty must be earned**: the contribution statement will be read by referees who know the
   field better than the seed material does.
4. **The researcher's attention is the scarce resource**, available at Frame and at Verify, not
   during drafting.

Sibling kinds that borrow most of this: a thesis chapter, a technical report, a grant's research
section, a review article (drop §3's model phases, keep §§4–8).

## 2. The program layer

One article is one FPEV project. What is shared across articles lives above it:

```
<workspace>/
├── references/bib/            ← SHARED source archive: one file per source, and a manifest per fetch
├── explorations/              ← the seed notes; read-only from the article project
└── v1-<article>/              ← one FPEV project
    ├── handoffs/  paper/ (sections/, figures/, data/, references.bib)
    ├── src/ (model/, solver/, experiments/, verify/run.py, verify/ledger.yaml, run_all.py)
    ├── references/ (bibliography.md, reading-notes-*.md, positioning-G1-*.md,
    │                exploration-theses.md, reading-guide.md, SOURCE-MAP.md)
    └── wiki/topics/
```

**Rule: a source is fetched once, into the shared archive, with a manifest; each project keeps its
own reading notes**, because what a source is *for* differs per article.

## 3. Phase template (Stage 3)

Run in this order unless the Plan says why not. The reference implementation's order differed in
one place, and it cost a rewrite (see P1b).

| Phase | Name | What it does | Why here |
|---|---|---|---|
| **P0** | Scaffold and harness | The article skeleton builds; the ledger is generated from the Frame (observations, assumptions, claims); the checks exist **before** the content, each due from a named phase | Every later "done" becomes a command |
| **P1a** | Sources held | Read what is already archived; one reading note per source, stating **how much was read** | Nothing is cited unread |
| **P2** | Definitions | Every component, observation and assumption, each assumption with a justification; a glossary with "not to be confused with"; a system figure | The claims depend on these, never the reverse |
| **P3** | First result | The smallest case, in closed form if possible [model] | A reduction found here usually carries the whole article |
| **P1b** | **Technique search** (gate, right after P3) | Search the literature **for the method and the shape of the first result by name**, not only for the application; draft the positioning note | In the reference project this ran after the technical sections were written, and it showed the central shape was classical; two sections, two wiki topics and the contribution had to be re-framed |
| **P4** | Independent evidence [model] | Two independent numerical methods agreeing with each other and with theory on ≥ 50 random cases (certification) | A number used as evidence must be certified |
| **P5** | Main result | The central claim, proved and checked | |
| **P6** | Extensions | Each extension tied to an observation it explains; claims restated if the proof changes them | |
| **P7** | Coverage and minimality | One experiment per observation; an **ablation**: switch each element off, record which observation it pays for | "The simplest model that explains everything" becomes testable |
| **P8** | Figures | TikZ for concepts, generated PDFs for data; constants read from generated files, never typed; **every figure looked at, rendered** | Checks cannot see overlaps or wrong curves |
| **P2b** | Words and symbols | The terminology rule and the banned-terms list in the ledger; the notation table drafted; symbol clashes fixed **before** any derivation is written | Renaming later touches every section, figure, wiki topic and the Frame |
| **P9a** | Technical sections, appendix | From the phase results; numerical methods and how to reproduce | |
| **P9b** | Background, interpretation, limitations | Positioning from the notes; the seed theses cited where their ideas are used; **disagreements with the seed stated** | |
| **P9c** | Introduction and abstract, last | The contribution statement drafted **only** from the positioning note's *new* rows | Novelty claims have one source |
| **P10** | Teaching trace | Remaining wiki topics; a reading guide that follows one claim end to end | |
| **P11** | Close | Regenerate everything from scratch; results equal the previous run; all checks green; **read every page of the PDF once** | A successful build is not a readable article |

## 4. Standard decisions (with defaults)

| ID | Decision | Default | If wrong |
|---|---|---|---|
| **Scope** | How big the model | **The simplest model that explains the in-scope observations**; richer versions (multi-cycle, stochastic) named as follow-ups in Frame | Move an observation in or out; only P7 changes |
| **Venue** | Where | Venue-agnostic `article` class; choose at Verify | Convert the template |
| **Reading level** | Two audiences | The article at the venue's level; the wiki one level lower (for students) | Resize the wiki's teaching topics |
| **Practice in the article** | The motivating practice (e.g. FPEV) | Named in §1 and in the interpretation only; the results stated generically | A global edit of two sections |
| **Authorship and AI** | Author line; disclosure | The researcher's name; AI assistance disclosed in the acknowledgments, worded at Verify to the venue's policy | Edit the front matter |
| **Claim statuses** | What a claim may be | `conjectured` → `proved` / `refuted` / `conjecture` (final, labelled in the article). A claim without proof and check is a conjecture | — |
| **Claims beyond the Frame** | New claims found in Execute | Allowed as an R4 divergence recorded in the ledger note; named in the check output for Verify | Remove at Verify |
| **Proof and check** [model] | Evidence per theorem | A proof **and** a numerical check script that exits non-zero on failure | — |
| **Numbers** | How numbers enter the text | A macro carrying the printed value and its key in `results.json`; one script writes every number | — |
| **Sources** | What may be cited | Only sources archived and read; the note records the read extent; a source found only on a document-sharing site counts as unavailable | Ask for library access (a Verify question) |
| **Seed theses** | Referring to the researcher's notes | A **register** of each seed thesis with its section and where the article uses it. In the draft the notes may be cited; **the final version cites none of them**: each thesis is either carried by an external source that was read (traced through the note's own references, or found with them as hints), or stated as the author's position, assumption or expectation without citation, or moved to the acknowledgments as provenance. C-THESIS checks every row has one of these dispositions; C-NOSEED checks no note is cited. Add a dated "reliable sources" section to each note | A late trace-down (the reference project did it in Verify) rewrites the justification of every assumption |
| **Self-citation** | Unpublished notes | Not in the final version (see *Seed theses*). The practice the article formalizes is described in its own words; its origin goes in the acknowledgments | — |
| **Terminology** | Words for the model's concepts | **One name per concept**, fixed in Frame's definitions: a word for each *job* or mechanism of the model, and a separate word for each *stage or phase of practice* it explains, with one sentence mapping them. The rule goes in the ledger as a banned-terms list and is checked (C-TERMS) | A terminology pass late costs a global rename across article, wiki, code, figures and Frame (the reference project did it in Verify) |
| **Units** [model] | Physical meaning | Give every symbol a unit (errors, attention, context, level; time as a share of the work) in P2b, and check that every equation balances (C-UNITS). State which groups are truly dimensionless; parameters that carry a unit are not "dimensionless" just because the model is scaled | The reference project called four unit-carrying parameters dimensionless until Verify |
| **Notation** | Symbols | A notation table in §2 with the section that defines each symbol. Before P3, check for clashes: a state variable named `e` against Euler's `e`, one letter for time and a function, a subscripted parameter sharing a letter with another, `E` against expectation | Renaming inside math only, by script, with the diff reviewed |
| **Third person** | How the article names the seed notes' author | "The author's notes", never a third-party label, when the author is the article's author | Global replace |

## 5. Tripwires

Execute does not stop for these (the researcher is not called mid-Execute), but each is recorded
prominently and changes what happens next:

- **A numerical optimum beats a theorem.** Treat as a bug until shown otherwise; stop the phase until
  explained. (Three times in the reference project: overlapping pulses, a gradient for the wrong
  loss, and floating-point cancellation that made errors vanish.)
- **A claim fails its check.** Restate the claim; record R4; never soften the check.
- **A source makes a central claim known.** Rewrite the positioning note; the contribution statement
  changes category; record as the first propagate-back candidate.
- **A check fails for a reason in the check itself.** Fix the check; record R3. Checks have bugs too
  (the reference project fixed five parser bugs and two false passes).
- **The model contradicts a seed thesis.** Say so in the article; propose a dated note on the seed
  (never edit it from the article project).

## 6. Stage 4 — the phase set, and the verification recipes

| # | Phase | Establishes | Owner |
|---|---|---|---|
| V1 | **Retrospective and schema** (may run first, as here) | what the kind of work taught | agent |
| V2 | **Non-author check of every claim** | each proof read and each check rerun by an agent or person who did not write them (C8 `non-author-acted`) | a different agent |
| V3 | **The article test** | a fresh agent given only the PDF writes a referee report; the report is compared with the positioning note and the limitations | a different agent |
| V4 | **The researcher's reading — the gate** | the researcher reads the article, answers the queued questions, and explains one claim end to end without notes (teach-back) | **human** |
| V5 | Positioning residuals | the sources the researcher can obtain (library) read; contribution statement re-checked | agent + human |
| V6 | Conformance, verdict, propagate-back | each Plan deliverable verdicted; propagate-back candidates accepted or rejected | both |

**The researcher's standard Verify questions** (from the reference project, where they found 4 of
the 11 major defects, more than any other finder, with short messages): (1) Is each concept named
one way, and are the words for the model's mechanisms kept apart from the words for the practice's
stages? (2) What does each variable mean physically, in what unit, and how would it be measured? (3)
Where does each claim come from: a source read, or the author's own position? (4) What does the
evidence actually show, and is any of it prescribed by the practice being modelled (circular)? (5) What
rival explanations predict the same thing, and where do they differ from the model? Ask them as whole-
work questions; the agent does the finding.

**What V2 found in the reference project:** 0 blockers, 2 major, 11 minor. Both majors were modelling shortcuts the numerics took silently (a comparison that ignored a side effect; a definition the numbers did not respect). The author's own checks tested what the author meant, not what the text said.

**V4 is the gate.** V2 proves the claims are right as stated; V3 shows how a referee will read them;
neither shows the article says what the researcher means.

## 7. Standard wiki topics (day one)

| Topic | Holds |
|---|---|
| the system and its components | every symbol and what it stands for |
| the observations | what the model must explain, and whether each is assumed or derived |
| the minimal sufficient model | the ablation, and what each element pays for |
| one topic per method the article uses [model] | taught from scratch at the wiki's level |
| one topic per main claim | the idea, the proof in outline, how to verify it |
| how to read this project | why the traces exist, and the path through them |

## 8. The mechanical checks to start from

`C-BUILD` (including no "??" in the PDF text) · `C-HANDOFF` · `C-LEDGER` (the ledger matches the
Frame and the Plan) · `C-CITE` · `C-DEF` · `C-ASSUME` · `C-WIKI` · `C-CLAIMS` · `C-PROOF` [model] ·
`C-NUM` · `C-CERT` [model] · `C-COVER` · `C-ABLATE` · `C-FIG` · `C-THESIS` · `C-NOVELTY` ·
`C-GUIDE` · `C-UNITS` [model] · `C-NOSEED` · `C-TERMS` (no banned term in the article or its TikZ figures; comments and quotations excluded). Each is due from the phase that makes it meaningful. The reference implementation's
`src/verify/run.py` (≈ 490 lines) can be copied and edited.

## 9. Metrics to record

**Write them into every handoff, by script, not by hand** (proposed 2026-09-24 from the reference
project's Stage 4 phase 6). A `metrics:` frontmatter block per phase:

```yaml
metrics:
  started-at: <UTC>            # the phase's first agent event
  ended-at:   <UTC>            # the handoff's creation
  waits-min: {usage-limit: 0, human-away: 0}
  agent: {model: <id>, active-min: 0, tool-calls: 0, output-tokens: 0}
  human: {messages: 0, words: 0, read-min-est: 0, read-min-reported: null, decisions: 0}
  defects: {found: 0, fixed: 0, found-by: {}, carried: 0}
  checks: {total: 0, new: 0, failed-then-fixed: 0}
```

and a **defect log** (`defects.csv`): id, phase introduced, phase found, found by (check / looking at
rendered output / reading sources / human direction / non-author agent), severity, fix scope (files,
minutes). The reference script `src/process/measure.py` computes the agent and human numbers from the
session transcript (reply latency, capped, as a surrogate for reading; gaps under 5 minutes as agent
active time). Ask the human at each gate for minutes actually spent, and at the end of Verify for the
share of errors they believe they caught (ρ̂).

What the reference project measured (one project, surrogates): the researcher's input fell entirely
in the first 10% and the last 40% of the agents' work (a U); Verify generated 35% of all agent tool
calls; 30 defects, 17 found in Verify (5 major); fixes were large only for errors later work was built
on (vocabulary, notation: about 40 files each).

### Earlier list

- words of product (article) vs process (handoffs, wiki, notes); code lines;
- checks at Plan vs at close; defects caught **by a check**, **by looking at rendered output**, and
  **by reading a source** (they are different kinds);
- claims restated, refuted, or added in Execute;
- sources read vs cited vs unavailable;
- wall-clock for a full regeneration.

Reference numbers (v1-fpev-optimal-control-model): article ≈ 11,200 words, 27 pages, 8 figures;
handoffs ≈ 40,300 words (Stage 3 ≈ 11,100), wiki ≈ 5,600, reading notes ≈ 6,800; code ≈ 1,700 lines,
of which the checks ≈ 490; checks 15 at Plan → 17 at close; 11 claims proved (2 restated), 1 added as a
conjecture; 15 sources read, 25 bibliography entries (10 the author's notes), 3 sources with no open
copy and 7 more located but not read;
full regeneration ≈ 8 minutes, 67 stored numbers identical across runs.

## 10. Reference implementation

`~/cJWL25/Research25/PiFPEV/v1-fpev-optimal-control-model`. Start with
`references/reading-guide.md`; the lessons are in the Stage 3 handoffs' "Divergences" and "Checked by
hand" sections and in `handoffs/stage-4-phase-1-OpusCC5.md`. A second instance to fold in:
`v1-shapes-theory` (an article about a formal account of shapes), not yet reviewed for this schema.

## 11. What the cadence does not supply (candidates for `workflows/`)

1. **A claims ledger.** Claims with statuses and evidence, tied to article labels; the cadence has
   gaps and deliverables but no first-class *claims*.
2. **A positioning discipline.** Search for the technique by name after the first result; draft the
   contribution only from a note that rates each claim known, adapted or new.
3. **Visual review of rendered output** as a verification recipe. Checks read source files; figures,
   layout and "??" are only seen on the page.
4. **A queue of decisions for the human.** An autonomous Execute accumulates questions that are the
   researcher's (venue, disclosure, what to cite). A standard "For the researcher (not decided here)"
   section, collected in the closing handoff, kept them out of the work without losing them.
5. **Testing the checks.** A check can pass falsely; the harness needs its own small tests.
6. **A terminology rule.** A project that formalizes a practice has two vocabularies, the model's and the practice's; the cadence has no place that fixes which word names which concept. Here it had to be settled in Verify, at the cost of a global rename.
7. **A register of the seed's theses** for projects seeded by explorations, and a rule for stating
   where the project disagrees with them.
