#!/usr/bin/env python3
"""Turn a YouTube caption file (VTT or SRT) into clean timestamped text, without changing any word.

  captions_to_md.py FILE [--mode cues|paragraphs] [--every SECONDS] [--url VIDEO_URL]

cues:        one line per caption, "[MM:SS] text"
paragraphs:  cues joined into paragraphs, a timestamp about every SECONDS (default 60);
             with --url, each timestamp links to that moment of the video.
Removes: the header, cue settings, inline timing and style tags, and the roll-up repeats of
YouTube's automatic captions. Keeps every recognised word in order. Prints a word count to stderr.
"""
import argparse, html, re, sys

TIME = re.compile(r"(\d+):(\d\d):(\d\d)[.,](\d{3})\s*-->\s*(\d+):(\d\d):(\d\d)[.,](\d{3})")

def secs(h, m, s, ms):
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000

def parse(text):
    """Yield (start_seconds, [text lines]) for each cue."""
    cues, cur = [], None
    for line in text.replace("\r", "").split("\n"):
        m = TIME.search(line)
        if m:
            cur = (secs(*m.groups()[:4]), [])
            cues.append(cur)
        elif cur is not None and line.strip() and not line.strip().isdigit():
            clean = re.sub(r"<[^>]+>", "", line)
            clean = html.unescape(clean).strip()
            if clean:
                cur[1].append(clean)
        elif not line.strip():
            cur = None
    return cues

def dedupe(cues):
    """Drop roll-up repeats: a line already emitted by the previous cue is not new."""
    out, prev = [], []
    for start, lines in cues:
        new = [l for l in lines if l not in prev]
        prev = lines
        if new:
            out.append((start, " ".join(new)))
    # collapse exact consecutive duplicates
    res = []
    for c in out:
        if not res or res[-1][1] != c[1]:
            res.append(c)
    return res

def stamp(t):
    t = int(t)
    return f"{t // 3600}:{t % 3600 // 60:02d}:{t % 60:02d}" if t >= 3600 else f"{t // 60:02d}:{t % 60:02d}"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("file")
    ap.add_argument("--mode", choices=["cues", "paragraphs"], default="cues")
    ap.add_argument("--every", type=float, default=60)
    ap.add_argument("--url")
    a = ap.parse_args()
    cues = dedupe(parse(open(a.file, encoding="utf-8", errors="replace").read()))
    if a.mode == "cues":
        lines = [f"[{stamp(s)}] {t}" for s, t in cues]
        print("\n".join(lines))
    else:
        paras, buf, t0 = [], [], None
        for s, t in cues:
            if t0 is None:
                t0 = s
            buf.append(t)
            if s - t0 >= a.every and re.search(r"[.!?。！？]$", t):
                paras.append((t0, " ".join(buf))); buf, t0 = [], None
        if buf:
            paras.append((t0, " ".join(buf)))
        for s, t in paras:
            ts = f"[{stamp(s)}]({a.url}&t={int(s)}s)" if a.url else f"[{stamp(s)}]"
            print(f"{ts} {t}\n")
    words = sum(len(t.split()) for _, t in cues)
    print(f"captions_to_md: {len(cues)} cues, {words} words", file=sys.stderr)

if __name__ == "__main__":
    main()
