#!/usr/bin/env python3
"""Tests for tools/import_canvas.py, on synthetic documents built in a temporary folder.

  test_import.py [--record-check <path to fpev-record-check>]

Cases: (a) a sound document imports, and the record check (if found) reports no gap; (b) a legacy
document imports with prompts marked "verbatim not verified" and no text invented; (c) planted fault:
an indexed prompt with no full text is rejected and nothing is written; (d) planted fault: a malformed
handoff heading is rejected; (e) every prompt is written byte-identical; (f) a second import overwrites nothing.
Exit 0 only if every case is judged correctly.
"""
import argparse, os, re, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "tools"))
import import_canvas as ic  # noqa: E402

LONG = ("Here is the policy, all of it.\n\nNever pour solvents down the sink.\n"
        "```\ncode fence inside a prompt\n```\n~~~~\ntildes inside a prompt\n  indented line, trailing space \nlast line")
PROMPTS = {1: "Follow fpev. Stage 1.", 2: LONG, 3: "now frame", 4: "Stage 2."}


def block(name, stage, artifact):
    return (f"### {name}\n\n```yaml\nstage: {stage}\nartifact: {artifact}\nstatus: complete\n"
            f"created-at: 2026-12-01\nauthors: [rk, claude-web]\n```\n\n**Summary.** Text.\n\n#### A sub-heading\n\nMore.\n")


def sound(drop_appendix=None, bad_heading=False):
    idx = "\n".join(f'- #{n} · 2026-12-01 · opens stage-1-phase-1 · "{t[:12]}…"' for n, t in PROMPTS.items())
    app = "\n".join(f"### #{n}\n\n" + "\n".join("> " + l if l else ">" for l in t.split("\n")) + "\n"
                    for n, t in PROMPTS.items() if n != drop_appendix)
    hand = block("stage-1-phase-1-rk-claude-web.md", "1-frame", "phase-1-handoff")
    for k in ("problem", "architecture", "gaps"):
        hand += block(f"stage-1-frame-{k}-rk-claude-web.md", "1-frame", k)
    hand += block("stage-2-plan-rk-claude-web.md" if not bad_heading else "Handoff [Stage 2: Plan]", "2-plan", "plan")
    wiki = "### wiki/topics/checklist-scope.md\n\n```yaml\nstatus: candidate\n```\n\nScope notes.\n"
    doc = (f"# Lab checklist — v1\n\n## 0. Status & Deliverable\n\n- **Project:** lab checklist\n- **Version:** v1\n"
           f"- **Person:** rk\n- **Agent:** claude-web\n\n## 1. Prompt Index\n\n{idx}\n\n## 2. Handoffs (Append-Only)\n\n{hand}\n"
           f"## 3. Wiki Candidates\n\n{wiki}\n## 4. Prompt Appendix\n\n{app}")
    return "~~~~markdown\n" + doc + "~~~~\n"


LEGACY = """## 0. Status & Deliverable
- **Project:** old cycle
## 1. Reference Prompts (Verbatim Ledger)
- **#1:** `Follow this. Stage 1.`
- **#2:** [summary of a long pasted spec]
## 2. Active Handoffs (Append-Only)

### Handoff [Stage 1: Frame] — X / Y
```yaml
stage: 1 (Frame)
status: locked
```
- Frame text.

### Amendment Note [Stage 1: Frame] — X / Y
```yaml
stage: 1 (Frame)
```
- Amended.

### Handoff [Stage 4: Verify — Phase 1] — X / Y
```yaml
stage: 4 (Verify)
```
- Verify text.
## 3. Wiki Candidates (For Verify Quench)
"""


def dequote(record, n):
    m = re.search(r"^\*\*#%d\*\* \(.*?\)\n((?:>.*\n?)+)" % n, record, re.M)
    return "\n".join(l[2:] if l.startswith("> ") else l[1:] for l in m.group(1).rstrip("\n").split("\n")) if m else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--record-check")
    a = ap.parse_args()
    rc = a.record_check or os.path.join(HERE, "..", "..", "..", "bin", "fpev-record-check")
    results, tmp = [], tempfile.mkdtemp(prefix="wa-import-")

    def doc(name, text):
        p = os.path.join(tmp, name)
        open(p, "w", encoding="utf-8").write(text)
        return p

    # (a) sound
    out = os.path.join(tmp, "a")
    errors, report = ic.run(doc("a.md", sound()), out)
    ok = not errors and os.path.exists(os.path.join(out, "handoffs", "stage-2-plan-rk-claude-web.md"))
    note = ""
    if ok and os.path.exists(rc):
        r = subprocess.run([sys.executable, rc, out], capture_output=True, text=True)
        ok = r.returncode == 0 and "0 gap" in r.stdout
        note = r.stdout.strip().splitlines()[-1] if r.stdout.strip() else ""
    elif ok:
        note = "record check not found; form only"
    results.append(("a sound document imports" + (f" ({note})" if note else ""), ok))

    # (e) byte-identical prompts
    rec = open(os.path.join(out, "references", "user-prompts-rk.md"), encoding="utf-8").read()
    results.append(("e prompts byte-identical", all(dequote(rec, n) == t for n, t in PROMPTS.items())))

    # (f) no overwrite
    before = {f: open(os.path.join(d, f), "rb").read() for d, _, fs in os.walk(out) for f in fs}
    errors, report = ic.run(doc("a.md", sound()), out)
    after = {f: open(os.path.join(d, f), "rb").read() for d, _, fs in os.walk(out) for f in fs}
    results.append(("f a second import overwrites nothing", not errors and before == after and all("skipped" in r for r in report)))

    # (b) legacy
    out = os.path.join(tmp, "b")
    errors, report = ic.run(doc("b.md", LEGACY), out, legacy=True, person="x", agent="y")
    names = sorted(os.listdir(os.path.join(out, "handoffs"))) if not errors else []
    rec = open(os.path.join(out, "references", "user-prompts-x.md"), encoding="utf-8").read() if not errors else ""
    ok = (names == ["stage-1-frame-amendment-x-y.md", "stage-1-frame-x-y.md", "stage-4-phase-1-x-y.md"]
          and rec.count("verbatim not verified") == 2 and dequote(rec, 2) == "[summary of a long pasted spec]")
    results.append(("b legacy imports, marked, nothing invented", ok))

    # (c) planted: missing appendix text
    out = os.path.join(tmp, "c")
    errors, _ = ic.run(doc("c.md", sound(drop_appendix=2)), out)
    results.append(("c fault: indexed prompt without full text is rejected", any("#2 has no full text" in e for e in errors) and not os.path.exists(out)))

    # (d) planted: malformed heading
    out = os.path.join(tmp, "d")
    errors, _ = ic.run(doc("d.md", sound(bad_heading=True)), out)
    results.append(("d fault: malformed handoff heading is rejected", any("malformed handoff heading" in e for e in errors) and not os.path.exists(out)))

    for name, ok in results:
        print("PASS" if ok else "FAIL", name)
    bad = sum(not ok for _, ok in results)
    print(f"{len(results) - bad}/{len(results)} cases judged correctly")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
