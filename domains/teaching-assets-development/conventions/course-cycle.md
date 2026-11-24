# The course cycle

Evidence marks: `[owner]` the instructor's words or ruling · `[run]` observed in recorded work · `[external]` an outside authority · `[inferred]` reasoned, with what would falsify it.

Run one FPEV cycle per offering or conversion, in its own version folder. A large course may use one cycle for the syllabus and one per part of the notes. [run]

## Frame

- Name the starting point: **port** the instructor's earlier offering, **convert** another instructor's course, or **write new**. [run]
- Ask which earlier course is the current model of format and accessibility. The latest is not always the one first named. [owner]
- Read the instructor's own files as well as their written guidance. Their files show what they do. [run]
- Inventory every source and say what is missing. [run]
- Separate students' files, answer keys and instructor notes from what can be published, by folder, from the first day. [run]
- State the audience's actual background. [run]
- Fix the assets, the schedule and the date of the first lecture. The first lecture's files come first. [run]

## Standard decisions

| Decision | Default | If wrong |
|---|---|---|
| Revision depth | Faithful, plus known errors and accessibility | The instructor opens a content cycle |
| Source form | The slide notebook | Keep the old form and export from it |
| Primary student format | One self-contained accessible HTML page per deck | Offer tagged PDF as a secondary |
| Math | Native MathML | Test another renderer offline |
| Handwriting | Kept live; transcribed for the posted record | Never dropped |
| Figures | Local copies beside the deck, no links to a personal server | Report any that are missing |
| File names | Lecture number, date, deck, state | Rename before the first post |
| Tools | Reuse the last course's scripts | Harden only what recurs |

## Porting an earlier offering

- Copy from the old course and never change it. [run]
- Change only what must change: dates, paths, links, course facts, known errors, accessibility. [owner]
- Keep the instructor's slide order, layout and running examples. [run]
- Start each offering with a blank handwriting layer. [run]
- A port script may run **until the instructor first edits the deck**. After that it must never run on that deck. [run]
- Fix an unambiguous code or label error and log it. Flag anything whose intent is unclear. [run]
- Re-run code cells; doing so exposes errors that reading misses. [run]

## Converting another instructor's course

- Rebuild faithfully first. Content revision is a later cycle. [owner]
- Keep a separate list of errors found in the originals, and do not silently fix them. [run]
- Match the receiving instructor's conventions: figure size, figure placement, notebook metadata. [run]
- Report fidelity as what was measured. Paragraphs retained do not show that a slide's meaning survived. [run]
- Native drawings may be absent from an image census. Page through the decks and count them. [run]

## Writing new decks

- Put plain words first, then the math, then a small number. [run]
- Reuse running examples the students already know. [run]
- Check each claim with code in the deck. [run]
- Check every figure description against the executed output. [run]
- Decks need to be coherent and correct, and need not be exhaustive, since the instructor reworks them in class. [run]

## Tripwires

- A figure is missing: show a visible note on the slide and list it. Never drop it silently. [run]
- The first lecture's files are not checked two hours before class: say so at the top of the handoff. [run]
- A tool would overwrite a file the instructor has edited: stop. [run]

## Verify

- The instructor opens the decks in the teaching tool and presents one. [run]
- Verify usually continues into the term as the lecture loop (`lecture-loop.md`). Record it as a nested cycle rather than as ever more Verify phases. [inferred] Falsified if nesting makes the record harder to resume than one long Verify.

## End of term

- Fold lessons into the routine, and propose changes to this domain with their cases. [run]
- Keep the open content questions for the next offering. [run]
