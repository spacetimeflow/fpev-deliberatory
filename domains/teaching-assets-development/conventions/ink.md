# Handwriting: capture, transcription, proofreading

Evidence marks are defined in `course-cycle.md`.

Handwriting shows the reasoning, so it is never dropped. A reader who cannot see it must still receive it. [owner]

## Capture

- Find inked pages from the handwriting data rather than by comparing images. [run]
- **Map positions to printed pages from the print tool's log.** Sub-slides and hidden cells shift the numbering, so "position + 1" fails silently. [run]
- Let the page and its ink finish loading before printing. One run lost the first page's ink without any error. [run]
- Keep dated copies of the handwriting data and the print. [run]

## Where the transcript lives

- Keep the transcript in a **sidecar file**, one block per inked page, naming its slide, page and title. [run]
- Do not write it into the live notebook. The handwriting is indexed by slide position, and the notebook may be open. [run]
- In the release, show the inked page visibly, with the transcript as its text alternative in a disclosure. [owner]

## Transcribing

- Use a vision model, then proofread against the page image, using zoomed crops where dense. [run]
- Follow logical order, not position on the page. [run]
- Keep what is written: crossed-out words as crossed out, unusual symbols, rounding, the instructor's own markers. [run]
- **Transcribe as written even when it looks wrong.** Put the doubt in the proofreading table. [run]
- Do not guess a word cut off at the slide edge. Mark it. [run]
- Describe a drawn signal or arrow if its meaning is not certain. [run]
- A wrong transcript is worse than none. [run]

## The proofreading table

- List only the readings that are doubtful, with page, reading and reason. [run]
- Include apparent errors of arithmetic, units or dimension, with the check you did. [run]
- Keep it short enough to read in a few minutes. [inferred] Falsified if instructors routinely skip a short table as often as a long one.
- The instructor decides what is good enough, and may accept minor issues. [owner]
- Never overwrite a block the instructor has approved. [run]

## Model notes

- A reasoning model can spend its whole budget thinking and return empty content. Raise the limit or turn reasoning off. [run]
- A dense diagram may need a second pass, region by region. [run]
- Two independent transcriptions of the same pages can differ substantially, so a single fluent reading is no evidence of accuracy. [run]
- Name the model and its settings in the handoff. Start a local model for the run and stop it afterward. [run]
