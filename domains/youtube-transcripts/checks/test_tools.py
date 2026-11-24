#!/usr/bin/env python3
"""Tests for the two tools. Each test is also run against a deliberately broken version, and must fail on it.

  python3 checks/test_tools.py
"""
import importlib.util, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
def load(name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, "..", "tools", name + ".py"))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
cap, asr = load("captions_to_md"), load("check_asr")

ROLLUP = """WEBVTT
Kind: captions
Language: en

00:00:00.000 --> 00:00:02.000 align:start position:0%
the<00:00:00.500><c> quick</c><00:00:01.000><c> brown</c>

00:00:02.000 --> 00:00:02.010 align:start position:0%
the quick brown

00:00:02.010 --> 00:00:04.000 align:start position:0%
the quick brown
fox<00:00:03.000><c> jumps &amp; runs</c>

00:00:04.000 --> 00:00:06.000 align:start position:0%
fox jumps &amp; runs
over the lazy dog.
"""
WORDS = "the quick brown fox jumps & runs over the lazy dog.".split()

def t_captions(m):
    cues = m.dedupe(m.parse(ROLLUP))
    got = " ".join(t for _, t in cues).split()
    return got == WORDS

def seg(a, b, t): return {"start": a, "end": b, "text": t}
CLEAN = [seg(0, 5, "大家好，今天我們談談銀行。"), seg(5, 10, "存款的利率很低。"), seg(10, 15, "智能體會把錢搬走。")]
LOOPY = CLEAN[:2] + [seg(10, 12, "壞了"), seg(12, 14, "壞了"), seg(14, 16, "壞了")]
GAPPY = CLEAN[:1] + [seg(60, 65, "存款的利率很低。")]

def t_asr(m):
    ok_clean = m.check(CLEAN, 15) == []
    kinds = lambda s, d: {k for k, _, _ in m.check(s, d)}
    return ok_clean and "loop" in kinds(LOOPY, 16) and "gap" in kinds(GAPPY, 65) and "tail" in kinds(CLEAN, 120)

class Broken:
    """Planted faults: each mimics a real failure from the record."""
    class cap_keeps_repeats:  # roll-up repeats left in (Y7)
        parse = staticmethod(cap.parse)
        @staticmethod
        def dedupe(c): return [(s, " ".join(l)) for s, l in c if l]
    class cap_drops_words:  # words lost while removing repeats (Y7)
        parse = staticmethod(cap.parse)
        @staticmethod
        def dedupe(c): return [(s, l[0]) for s, l in c if l]
    class asr_blind:  # a check that reports nothing (Y9)
        @staticmethod
        def check(*a, **k): return []

results = [("captions_to_md keeps every word, drops repeats", t_captions(cap), True),
           ("check_asr finds loop, gap and tail; passes clean text", t_asr(asr), True),
           ("planted: repeats left in", t_captions(Broken.cap_keeps_repeats), False),
           ("planted: words dropped", t_captions(Broken.cap_drops_words), False),
           ("planted: blind checker", t_asr(Broken.asr_blind), False)]
bad = 0
for name, got, want in results:
    ok = got == want; bad += not ok
    print(("ok   " if ok else "FAIL "), name, "(passes)" if want else "(must be rejected)")
print(f"{len(results) - bad} of {len(results)} as expected"); sys.exit(1 if bad else 0)
