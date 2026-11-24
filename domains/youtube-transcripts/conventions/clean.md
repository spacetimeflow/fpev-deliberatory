# Cleaning and polishing

Evidence marks are defined in `fetch.md`.

## Levels

| Level | Changes | When |
|---|---|---|
| **Faithful** (default) | Roll-up repeats removed, cues joined into paragraphs, spacing and punctuation width fixed, verified names corrected | "organize them faithfully" |
| **Light polish** | Faithful, plus punctuation added to automatic captions and obvious slips of the recognizer corrected | "polish", "as faithful to the originals as possible" |
| **Edited** | Wording smoothed, fillers removed, sections added | Only when asked, such as "add section titles" |

- Choose the lowest level the request allows. "Polish" alone means light polish. [owner]
- Every change beyond mechanical cleanup goes in a list in the header: original, replacement, reason. [run]
- Never add words that were not spoken. Mark an inaudible stretch as such. [run]

## Mechanical cleanup

- Automatic captions repeat each line as the next one rolls in. Remove the repeats with `tools/captions_to_md.py`, which keeps every recognized word in order. Do not hand-write a new parser for each video. [run]
- Join cues into paragraphs with a timestamp about every 30 to 75 seconds, linked to that moment of the video. [run]
- Keep one line per cue when the owner asks for captions as they are. [run]
- Keep `>>`, the captions' mark for a change of speaker, unless the speakers are identified. [run]

## Before delivering

- Count the words or characters against the source track or recognition output. Cleanup should remove only repeats. [run]
- Read the opening and closing minutes against the video's description and title for the right speaker and topic. One run mis-assigned quotes taken from other videos. [run]

## Sections

- Sections are an edit. Add them only when asked, and use the video's own chapters where they exist. [owner]
