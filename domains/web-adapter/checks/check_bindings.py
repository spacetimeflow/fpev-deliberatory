#!/usr/bin/env python3
"""Check web-adapter bindings against the shape's six rules.

  check_bindings.py --shape <shape-folder> <binding> [<binding> ...]
  check_bindings.py --shape <shape-folder> --selftest

A binding passes only if every rule is present by all of its clauses; a binding marked "rules: verbatim"
must also carry each rule exactly as the shape's README states it. It must have well-formed front matter
if it has any (a Gemini SKILL.md: lowercase-hyphen name, description starting "Use when", at most 1,024
characters), no machine paths or emails, and at most 6,000 characters.
--selftest builds the bindings into a temporary folder and judges: the built bindings pass; the original
hand-written skill (fixtures/skill-v0.1.md) fails on rules 2, 3 and 5; a one-word edit to a verbatim rule
fails; a rebuild is byte-identical. Exit 0 pass, 1 fail.
"""
import argparse, os, re, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
MAX_CHARS = 6000
CLAUSES = {
    1: [r"opens each stage", r"unclear word"],
    2: [r"every stage and every phase", r"before the next", r"\bperson\b", r"\bagent\b"],
    3: [r"quote", r"unchanged", r"numbered", r"\bdate\b", r"stage or phase"],
    4: [r"deliverable"],
    5: [r"mechanical check", r"verify is the human", r"after (?:export|import)|outside this chat|shell"],
    6: [r"(?:do not|never) rewrite|without (?:a|an) (?:amendment )?note|amendment note"],
}
PRIVATE = re.compile(r"/Users/[\w.-]+|/home/[\w.-]+|[A-Za-z]:\\Users\\|[\w.+-]+@[\w-]+\.[\w.-]+")


def shape_rules(shape):
    sys.path.insert(0, os.path.join(HERE, "..", "tools"))
    from build_bindings import shape_rules as sr
    return sr(shape).split("\n")


def check(path, rules):
    text = open(path, encoding="utf-8").read()
    low, problems = text.lower(), []
    for n, pats in CLAUSES.items():
        missing = [p for p in pats if not re.search(p, low)]
        if missing:
            problems.append(f"rule {n}: missing clause(s) {missing}")
    if "rules: verbatim" in text:
        for i, rule in enumerate(rules, 1):
            if rule not in text:
                problems.append(f"rule {i}: not verbatim")
    if text.startswith("---"):
        m = re.match(r"---\n((?:[a-z-]+: .+\n)+)---\n", text)
        if not m:
            problems.append("front matter is malformed (each field on its own line, closed by ---)")
        elif os.path.basename(path) == "SKILL.md":
            meta = dict(l.split(": ", 1) for l in m.group(1).splitlines())
            if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", meta.get("name", "")):
                problems.append("SKILL.md name is not lowercase with hyphens")
            d = meta.get("description", "")
            if not d.startswith("Use when") or len(d) > 1024:
                problems.append("SKILL.md description must start 'Use when' and stay within 1,024 characters")
    if PRIVATE.search(text):
        problems.append("machine path or email")
    if len(text) > MAX_CHARS:
        problems.append(f"{len(text)} characters (max {MAX_CHARS})")
    return problems


def selftest(shape):
    sys.path.insert(0, os.path.join(HERE, "..", "tools"))
    import build_bindings as bb
    rules, results = shape_rules(shape), []
    out1, out2 = tempfile.mkdtemp(prefix="wa-b1-"), tempfile.mkdtemp(prefix="wa-b2-")
    built = [p for p, _ in bb.build(shape, out1)]
    results.append(("built bindings pass", all(not check(p, rules) for p in built)))
    probs = check(os.path.join(HERE, "fixtures", "skill-v0.1.md"), rules)
    named = {int(m) for p in probs for m in re.findall(r"^rule (\d)", p)}
    results.append((f"fault: the original skill fails on rules 2, 3, 5 (got {sorted(named)})", named == {2, 3, 5}))
    verb = next(p for p in built if "rules: verbatim" in open(p).read())
    t = open(verb).read().replace("unchanged and numbered", "unchanged and listed", 1)
    edited = os.path.join(out1, "edited.md")
    open(edited, "w").write(t)
    results.append(("fault: a one-word edit to a verbatim rule fails", any("not verbatim" in p for p in check(edited, rules))))
    big = os.path.join(out1, "big.md")
    open(big, "w").write(open(verb).read() + "x" * MAX_CHARS)
    results.append(("fault: an oversized binding fails", any("characters" in p for p in check(big, rules))))
    again = [p for p, _ in bb.build(shape, out2)]
    results.append(("rebuild is byte-identical", all(open(a, "rb").read() == open(b, "rb").read() for a, b in zip(built, again))))
    for name, ok in results:
        print("PASS" if ok else "FAIL", name)
    bad = sum(not ok for _, ok in results)
    print(f"{len(results) - bad}/{len(results)} judged correctly")
    return 1 if bad else 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--shape", required=True)
    ap.add_argument("--selftest", action="store_true")
    ap.add_argument("bindings", nargs="*")
    a = ap.parse_args()
    if a.selftest:
        sys.exit(selftest(a.shape))
    rules, bad = shape_rules(a.shape), 0
    for b in a.bindings:
        probs = check(b, rules)
        print(("FAIL " if probs else "PASS ") + b)
        for p in probs:
            print("   ", p)
        bad += bool(probs)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
