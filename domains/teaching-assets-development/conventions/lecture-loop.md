# The lecture loop

Evidence marks are defined in `course-cycle.md`.

Each release is a small FPEV cycle. The instructor's sentence opens it and the instructor's post closes it. [run]

## Release states

| State | When | Carries |
|---|---|---|
| **Before** | Ahead of the lecture | The clean deck |
| **Interim** | The deck is partly taught and continues | The deck, plus all handwriting so far |
| **After** | The deck is finished | The deck, plus all handwriting, and a PDF if the instructor mails one |

- If the instructor has not finished the deck, the release is interim, even when a session has just ended. [owner]
- Interim and after use the same routine and differ only in label and destination. [owner]

## Frame the release

- Establish from the instructor's words and the files: which deck, which state, which session. [run]
- Read the routine file and the last handoffs before acting. [owner]
- Treat each deck separately. A request naming two decks yields two releases. [owner]
- If asked to ignore an earlier version, redo every step from the source and keep the old outputs aside. [owner]

## Plan the release

- Compare the handwriting source with the last release. List what is new, what changed and what is untouched. [run]
- Reuse unchanged approved transcript blocks. Re-read a block only if its page gained ink. [run]
- Note that the deck may have been edited by hand since the last run. [run]

## Execute

1. Save a dated print of the deck with its handwriting. [run]
2. Cut the inked pages and transcribe them (`ink.md`). [run]
3. Render from the source, folding in the handwriting without editing the notebook. [run]
4. Run the accessibility checks (`accessibility.md`). [run]
5. Run the release count below. [run]
6. Write the handoff with the short proofreading table. [run]

## The release count

Tools report success on empty or partial output, so compare numbers from independent places. [run]

- Inked positions in the source equal inked pages cut, transcript blocks and blocks in the page. [run]
- Printed pages equal the deck's slide count. [run]
- Earlier blocks are still present and unchanged. [run]
- Each inked image shows ink. A page printed before the ink loaded looks normal. [run]
- The page contains nothing from another deck. [run]
- Images in the page equal content images plus inked images, recomputed from the file. [run]
- The page contains no instructor files, keys, personal-server links or hidden admin cells. [run]

## Verify the release

- The instructor reads the flagged readings, which should fit on one screen. [run]
- The instructor posts, and removes or replaces superseded copies on the course site. [run]
- The instructor re-runs the institution's checker when it matters. [run]
- The instructor's acceptance is part of the record: note it in the handoff with any readings left as they are, as in "most correct. Let's use it." [owner]

## Closing the loop

- When a run teaches something, change the routine file in the same run. A fix left only in a handoff recurs. [owner]
- Name in the handoff what supersedes what. [run]
- Keep the file name stable when a release replaces an earlier one on the course site. [run]

## Tripwires

- A count disagrees: do not call the release ready. [run]
- A tool would change the notebook: stop. [run]
- The transcription model returns empty text: treat it as a failure, and check its token budget and reasoning setting. [run]
- The same departure from this loop recurs in a second course: report it as a reason to graduate this domain. [owner]
