# Fetching: metadata, tracks, and when access is refused

Evidence marks: `[owner]` the owner's words or ruling · `[run]` observed in recorded work · `[external]` an outside authority · `[inferred]` reasoned, with what would falsify it.

## First, the video

- Strip tracking parameters (`pp=`, `list=`, `si=`, `t=`) and keep the canonical address `https://www.youtube.com/watch?v=<id>`. [run]
- Print title, channel, upload date, duration, chapters and description before anything else. They go in the header, and the duration drives the checks. [run]

```
yt-dlp --skip-download --print "%(title)s|%(channel)s|%(upload_date)s|%(duration)s" URL
yt-dlp --skip-download --print description URL
```

- Work in a scratch folder, never the owner's folder, and delete temporary files afterward. [run]
- Pass a JavaScript runtime to current yt-dlp (`--js-runtimes node`, or install deno), since extraction without one is deprecated. [run]

## Reading the track list

- `yt-dlp --list-subs URL` prints automatic captions first, then manual subtitles. The closing line "has no subtitles" means **no manual track**. Automatic tracks may still exist. [run]
- A track named `<lang>-orig` is the automatic recognition of the speech as YouTube labelled it. Other automatic languages are machine translations of it. [run]
- Check that the `-orig` language matches the speaker. A Mandarin speaker with only `en-orig` has no Chinese captions. [run]

## Choosing the route

| Order | Route | Use when |
|---|---|---|
| 1 | Manual subtitles in the spoken language | They exist |
| 2 | Automatic captions in the spoken language (`<lang>-orig`) | The language matches |
| 3 | Speech recognition on the audio (`recognize.md`) | No track in the spoken language, or the owner wants quality beyond captions |
| aid | Translated tracks, articles, descriptions | Only to read, to identify names and claims, and never as the transcript |

- If the owner asks for the original language, translated captions do not satisfy the request. [owner]
- Download the chosen track as VTT and convert it with `tools/captions_to_md.py`. [run]

```
yt-dlp --skip-download --write-subs --write-auto-subs --sub-langs en-orig --sub-format vtt -o v URL
python3 tools/captions_to_md.py v.en-orig.vtt --mode paragraphs --every 60 --url URL
```

- For audio, take the best audio only: `yt-dlp -f bestaudio -x --audio-format m4a -o audio URL`. [run]
- Fetch comments only when asked, with `--write-comments --write-info-json`, and keep them in a separate file. [run]

## When access is refused

- **HTTP 429** means too many requests. Wait at least a minute, then retry once. [run]
- If refused again, change method rather than retrying: another player client, a current yt-dlp, or a JS runtime. [run]
- After about three refusals, stop for this session. Tell the owner what was tried, and offer speech recognition from the audio or a later retry. More than ten rapid attempts in one session did not help. [run]
- **Empty caption files** with no error can mean a token check. Search the web for the current method and date it. One run needed a dedicated token-aware tool after plain requests returned empty bodies. [owner]
- Do not use the owner's browser cookies or accounts without asking. [inferred] Falsified if the owner states a standing permission.

## Tripwires

- The text came from anywhere but the video's tracks or audio: stop, and say so. [owner]
- Captions are in a language other than the speaker's: switch route. [run]
