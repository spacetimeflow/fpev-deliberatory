# Speech recognition

Evidence marks are defined in `fetch.md`.

## Environment

- Check that the recognition environment matches the machine's architecture, and that its interpreter link is intact, before downloading anything. One run found a broken environment with the wrong architecture. [run]
- Prefer a local model. The audio stays on the machine. [run]
- Expect real time or slower on CPU. Start it early and do other parts while it runs. [run]

## Settings

- Use Whisper `large-v3-turbo` by default, and `large-v3` for hard audio. [run]
- **Always set the language.** For Chinese, an initial prompt in the wanted script (for example, a sentence in Traditional characters) steers the output. [run]
- Keep the JSON output. The checks need segment times. [run]

```
whisper audio.m4a --model large-v3-turbo --language zh --output_format all --output_dir out \
  --initial_prompt "<one sentence in the wanted script and register>"
python3 tools/check_asr.py out/audio.json --duration <seconds>
```

## Checking the result

- Run `tools/check_asr.py` against the video's duration. It flags repeated segments, phrases repeated inside a segment, silences longer than 20 seconds, an early end, and stretches with far fewer characters per minute than the rest. [run]
- Listen to, or re-recognize, each flagged window. A recognized loop once replaced half a minute of real speech, and a passage was skipped elsewhere. [run]
- Re-recognize only the window, with Whisper's `--clip_timestamps START,END`, and splice it in with a note. [inferred] Falsified if the window's output differs because the context is lost.
- A pass means none of these failures were found. It does not mean the words are right. [run]

## Script and names

- Convert mixed Simplified and Traditional characters to one script (OpenCC `s2t` or `t2s`), characters only, and say so. [run]
- Correct a misheard proper name only after confirming it in a public source. [run]
- List the doubtful readings you left as heard, with the time and your best guess. [run]

## Tripwires

- Recognition ends well before the video: do not deliver. [run]
- The language was not set: re-run. [run]
