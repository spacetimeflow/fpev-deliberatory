---
name: youtube-transcripts
type: domain-shape
status: draft
owner: the person who runs this FPEV installation
reference-runs:
  - ten transcripts of interviews, lectures and commentaries in English and Mandarin, made with agents over six months, three of them by speech recognition
---

# YouTube transcripts

A domain shape for getting a faithful, recorded transcript of a video's speech. Read this first. The `conventions/` say how, and are read when needed.

## Purpose

In its owner's words, the aim is to "extract transcripts from youtube videos" and to "organize them faithfully into an organized md file", or to "polish it, but be as faithful to the originals as possible". When the speech is in another language, the transcript is "in original Chinese", or whatever the speaker used, with any analysis "in another file".

## Scope

One video's speech as text, its metadata, and, when asked, its comments. Cleanup and polishing are in scope. The analysis or summary written from a transcript is a separate piece of work that starts from the finished file. Other platforms and the video itself are out of scope.

## The situation

A transcript looks authoritative and is easy to fake. An agent that cannot reach the captions can find an article about the video and present its summary as the speech, and it reads well. Automatic captions are unpunctuated, unlabelled and wrong in places, and they change over time. A video in Mandarin may offer only English captions, plus Chinese ones translated from that English. Speech recognition fills silences with repeated phrases and skips whole passages, and the output still reads fluently. The platform also blocks automated access in ways that change month to month.

So the risks are a wrong source, a wrong language, and silent loss. Each is invisible in the finished text.

## Deliverable

A Markdown file in the owner's references, holding the transcript with timestamps. Its header says where the words came from (caption track or recognition model), when they were fetched, which tools were used, and what was changed. Doubtful readings are listed rather than silently resolved. Comments, when asked for, go in a separate file.

## Stages and roles

The four FPEV stages apply, as a short cycle per video.

- **The owner** names the video, the polish level and the use, and reads the flagged spots.
- **Agents** fetch metadata, choose the route, fetch or recognize, run the tools, clean, verify names, and record.
- **The tools** do the exact parts: removing caption repeats without losing words, and finding loops, gaps and thin coverage in speech recognition.


| Stage | Criterion | The domain supplies | Stays with the person |
|---|---|---|---|
| Frame | understandability | the video, its language, and the polish level asked | the purpose and the polish level |
| Plan | conformance | the route ladder; when to stop after a refusal | approving a heavier method |
| Execute | quality | fetch, recognition, cleanup, the two tools, the counts | nothing routine |
| Verify | insight | the method line, check flags, corrections and doubtful readings | reading the flagged spots; accepting the transcript |
## Cadence

Usually one request, one cycle, no questions. The owner's attention goes to the flagged list and, when the platform refuses, to the choice of a heavier method.

## Record

Each transcript's header is its record. The session transcript or a handoff keeps the commands. Fetch dates matter because captions change.

## Kernel

These hold in every cycle:

- **The words come from the video,** from its caption tracks or its audio. Never present a summary, an article or memory as a transcript. Say how the text was obtained.
- **The speaker's language rules.** A translated track is not a transcript of the speech.
- **Faithful first.** Cleanup is mechanical by default. Every change to the words is listed.
- **Correct a name only when it is verified,** and list the doubtful readings left as heard.
- **Check recognition against the clock.** Loops, gaps and an early end are found and repaired or flagged.
- **Keep the transcript and the analysis apart.** Check the analysis against the source-language text.
- **Be polite to the platform.** Back off, then change method; never hammer it.
- **Temporary files stay outside the owner's folders.**
- **Transcripts and commenters' handles are for the owner's research,** not for republication.

## Envelopes

Agents may act alone inside these bounds. Outside them, the owner decides.

- Fetch metadata, captions and audio for the requested video, with spaced requests.
- Run local speech recognition, and install or repair its environment inside the owner's existing setup.
- Make mechanical cleanup and verified name corrections, listed.

Agents may never invent missing speech, translate in place of transcribing, use cookies or credentials from the owner's browser without asking, or publish a transcript.

## What to internalize, and what stays on file

**Internalize:** where the words came from; the difference between a caption track, a translation and recognition; and that fluent text can hide a loop.

**Keep on file:** commands, the escalation ladder when access is blocked, model settings, and the list of past failures.

## Untested

- How well the domain does on a fresh speech-recognition run. Its loop and gap checks were tested on planted cases and on one real caption file, not on new Whisper output.
- Access methods: the ladder in `conventions/fetch.md` dates from late 2026 and will age.
- Videos with several speakers, music or heavy cross-talk. The record has few.
