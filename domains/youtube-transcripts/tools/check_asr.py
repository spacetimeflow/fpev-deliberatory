#!/usr/bin/env python3
"""Check a speech-recognition result for the failures that read fluently: loops, skipped stretches, thin coverage.

  check_asr.py RESULT.json --duration SECONDS [--max-gap 20] [--min-rate R]

RESULT.json is Whisper's JSON output (a "segments" list with start, end, text).
Reports, with positions to listen to:
  loop    the same short text repeated in 3 or more consecutive segments, or a phrase
          repeated 4+ times inside one segment
  gap     no speech recognised for more than --max-gap seconds
  tail    recognition ends well before the video does
  rate    characters (CJK) or words per minute far below the rest of the file
Exit 1 if anything is flagged. A pass means none of these were found, not that the text is right.
"""
import argparse, json, re, sys

def units(t):
    cjk = len(re.findall(r"[㐀-鿿]", t))
    return cjk if cjk > len(t) / 4 else len(t.split())

def mmss(s):
    s = int(s); return f"{s // 60:02d}:{s % 60:02d}"

def check(segs, duration, max_gap=20.0, min_rate=None):
    flags = []
    norm = [re.sub(r"\W+", "", s["text"]).lower() for s in segs]
    run = 1
    for i in range(1, len(segs)):
        run = run + 1 if norm[i] and norm[i] == norm[i - 1] else 1
        if run == 3:
            flags.append(("loop", segs[i - 2]["start"], f"repeated segment: {segs[i]['text'].strip()[:40]}"))
    for s in segs:
        m = re.search(r"(.{2,12}?)\1{3,}", re.sub(r"\s+", "", s["text"]))
        if m:
            flags.append(("loop", s["start"], f"phrase repeated inside a segment: {m.group(1)}"))
    prev = 0.0
    for s in segs:
        if s["start"] - prev > max_gap:
            flags.append(("gap", prev, f"{s['start'] - prev:.0f} s without recognised speech"))
        prev = max(prev, s["end"])
    if duration and duration - prev > max(max_gap, 0.05 * duration):
        flags.append(("tail", prev, f"recognition ends {duration - prev:.0f} s before the video"))
    rates = [(s["start"], units(s["text"]) / max(s["end"] - s["start"], 0.5) * 60) for s in segs if s["end"] > s["start"]]
    if rates:
        med = sorted(r for _, r in rates)[len(rates) // 2]
        floor = min_rate if min_rate is not None else med / 4
        for t, r in rates:
            if r < floor:
                flags.append(("rate", t, f"{r:.0f}/min against a median of {med:.0f}/min"))
    return flags

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("result"); ap.add_argument("--duration", type=float, required=True)
    ap.add_argument("--max-gap", type=float, default=20.0); ap.add_argument("--min-rate", type=float)
    a = ap.parse_args()
    segs = json.load(open(a.result, encoding="utf-8"))["segments"]
    flags = check(segs, a.duration, a.max_gap, a.min_rate)
    for kind, t, msg in flags:
        print(f"{kind:5} {mmss(t)}  {msg}")
    print(f"check_asr: {len(segs)} segments, {len(flags)} flag(s)")
    sys.exit(1 if flags else 0)

if __name__ == "__main__":
    main()
