#!/usr/bin/env python3
"""Form checker for a domain shape. It shows the parts are present, never that a domain is wise.

  lint_domain.py <domain-folder> [--platform 261010]
  lint_domain.py --selftest              build planted faults and sound domains in a temp folder and judge them
  lint_domain.py --fixtures <folder>     judge fault-<CODE>-* and sound-* folders
Exit: 0 pass, 1 fail.

Codes: F1 files · F2 front matter and reference run · F3 sections · F4 owner's words · F5 platform version ·
F6 procedure in the idea file · F7 reading budget · F8 evidence marks · F9 tools without checks · F10 private identifiers ·
F11 references to files that do not exist

F10 is the privacy check for the domain folder: machine paths, home folders, emails, private networks,
credentials and listed private terms. The same check for any folder ships in `checks/privacy_scan.py`.
"""
import argparse, os, re, sys, tempfile

PLATFORM = "261010"
IDEA_MAX = 1000
CONVENTIONS_MAX = 4000
SECTIONS = ["Purpose", "Scope", "Deliverable", "Stages and roles", "Cadence", "Record", "Kernel", "Envelopes",
            "What to internalize", "Untested"]
MARK = re.compile(r"\[(owner|run|external|inferred)\]")
PRIVATE = [re.compile(p) for p in (r"/Users/[A-Za-z0-9_.-]+", r"/home/[A-Za-z0-9_.-]+", r"[A-Za-z]:\\Users\\",
                                   r"[\w.+-]+@[\w-]+\.[\w.-]+", r"~/(?!\.)[A-Za-z0-9_-]+", r"sk-[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{16,}|xox[bp]-[A-Za-z0-9-]{10,}",
                                   r"\b192\.168\.(?!0\.)\d+\.\d+\b")]
TEXT = (".md", ".txt", ".yaml", ".yml", ".json", ".sh", ".py", ".toml")


def read(path):
    with open(path, encoding="utf-8", errors="replace") as f:
        return f.read()


def strip_fences(text):
    return re.sub(r"^```.*?^```\s*$", "", text, flags=re.M | re.S)


def front_matter(text):
    m = re.match(r"---\n(.*?)\n---\n", text, re.S)
    if not m:
        return {}, text
    meta, key = {}, None
    for line in m.group(1).splitlines():
        item = re.match(r"\s+-\s+(.+)", line)
        kv = re.match(r"([A-Za-z-]+):\s*(.*)", line)
        if item and key:
            meta.setdefault(key, [])
            if isinstance(meta[key], list):
                meta[key].append(item.group(1))
        elif kv:
            key, value = kv.group(1), kv.group(2).strip()
            meta[key] = value if value else []
    return meta, text[m.end():]


def words(text):
    return len(text.split())


def lint(folder, platform=PLATFORM, private_terms=()):
    folder = os.path.abspath(folder)
    name = os.path.basename(folder.rstrip("/"))
    idea = os.path.join(folder, name + ".md")
    errors = []
    for rel in (name + ".md", "conventions", "VERSION", "CHANGELOG.md"):
        if not os.path.exists(os.path.join(folder, rel)):
            errors.append(("F1", f"missing {rel}"))

    if os.path.exists(idea):
        raw = read(idea)
        meta, body = front_matter(raw)
        for key in ("name", "type", "status", "owner"):
            if not meta.get(key):
                errors.append(("F2", f"front matter lacks {key}"))
        if meta.get("status") not in ("draft", "stable", "retired"):
            errors.append(("F2", "status must be draft, stable or retired"))
        if not meta.get("reference-runs"):
            errors.append(("F2", "no reference run"))
        heads = re.findall(r"^## (.+)$", body, re.M)
        for s in SECTIONS:
            if not any(h.startswith(s) for h in heads):
                errors.append(("F3", f"missing section: {s}"))
        purpose = re.search(r"^## Purpose\n(.*?)(?=^## |\Z)", body, re.S | re.M)
        if purpose and not re.search(r"[\"“][^\"”]{8,}[\"”]", purpose.group(1)):
            errors.append(("F4", "the purpose quotes no words of the owner"))
        prose = strip_fences(body)
        if re.search(r"^\s*\d+[.)]\s", prose, re.M) or re.search(r"^#+ .*\b(steps?|procedure|how to)\b", prose, re.M | re.I) \
                or re.search(r"\bStep \d+", prose):
            errors.append(("F6", "the idea file contains procedure"))
        if words(raw) > IDEA_MAX:
            errors.append(("F7", f"idea file has {words(raw)} words (max {IDEA_MAX})"))

    version = os.path.join(folder, "VERSION")
    if os.path.exists(version):
        m = re.search(r"^requires:\s*fpev\s+(\d+)", read(version), re.M)
        if not m:
            errors.append(("F5", "VERSION does not declare the FPEV version"))
        elif int(m.group(1)) < int(platform):
            errors.append(("F5", f"written for FPEV {m.group(1)}; the platform is {platform}"))
        else:
            log = os.path.join(folder, "CHANGELOG.md")
            if os.path.exists(log) and f"fpev {m.group(1)}" not in read(log).lower():
                errors.append(("F5", f"CHANGELOG records no review against FPEV {m.group(1)}"))

    conv = os.path.join(folder, "conventions")
    total = 0
    if os.path.isdir(conv):
        for f in sorted(os.listdir(conv)):
            if not f.endswith(".md"):
                continue
            text = read(os.path.join(conv, f))
            total += words(text)
            for line in strip_fences(text).splitlines():
                if not re.match(r"\s*(?:[-*]|\d+\.)\s", line):
                    continue
                bare = re.sub(r"`[^`]*`", "", line)
                mark = MARK.search(bare)
                if not mark:
                    errors.append(("F8", f"{f}: no evidence mark: {line.strip()[:60]}"))
                elif mark.group(1) == "inferred" and "Falsified if" not in bare:
                    errors.append(("F8", f"{f}: [inferred] with no falsifier: {line.strip()[:60]}"))
    if total > CONVENTIONS_MAX:
        errors.append(("F7", f"conventions have {total} words (max {CONVENTIONS_MAX})"))

    tools = os.path.join(folder, "tools")
    if os.path.isdir(tools) and any(not x.startswith(".") for x in os.listdir(tools)):
        checks = os.path.join(folder, "checks")
        if not os.path.isdir(checks) or not [x for x in os.listdir(checks) if not x.startswith(".")]:
            errors.append(("F9", "tools/ exists with no checks"))

    roots = [folder] + [os.path.join(folder, x) for x in ("conventions", "templates", "checks", "tools")]
    sources = [idea] if os.path.exists(idea) else []
    if os.path.isdir(conv):
        sources += [os.path.join(conv, x) for x in sorted(os.listdir(conv)) if x.endswith(".md")]
    for src in sources:
        for ref in re.findall(r"`([\w./-]+\.(?:md|py|sh))`", read(src)):
            if not any(os.path.exists(os.path.join(r, ref)) for r in roots):
                errors.append(("F11", f"{os.path.basename(src)}: refers to a file that does not exist: {ref}"))

    for d, ds, fs in os.walk(folder):
        rel = os.path.relpath(d, folder)
        if rel.split(os.sep)[0] in ("checks", "__pycache__"):
            ds[:] = []
            continue
        for f in fs:
            if f.endswith(TEXT):
                text = read(os.path.join(d, f))
                if any(p.search(text) for p in PRIVATE) or any(t.lower() in text.lower() for t in private_terms):
                    errors.append(("F10", f"{os.path.join(rel, f)}: private identifier or machine path"))
    return errors


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


SOUND_IDEA = """---
name: {name}
type: domain-shape
status: draft
owner: a test owner
reference-runs:
  - a synthetic run that reached Verify
---

# {name}

## Purpose

The owner asked for "a clear way to prepare the weekly field report".

## Scope

Weekly field reports. Monthly summaries are out of scope.

## Deliverable

A checked weekly report.

## Stages and roles

FPEV's stages apply. The owner frames and verifies.

## Cadence

Once a week.

## Record

Each report and its corrections.

## Kernel

Figures come from the field log.

## Envelopes

Agents draft; the owner signs.

## What to internalize

Which figures matter.

## Untested

Whether this holds in a second team.
"""


def sound(root, name):
    d = os.path.join(root, name)
    write(os.path.join(d, name + ".md"), SOUND_IDEA.format(name=name))
    write(os.path.join(d, "conventions", "phases.md"), "# Phases\n\n- Draft from the log first. [run]\n- Keep one page. [inferred] Falsified if readers want more.\n")
    write(os.path.join(d, "VERSION"), f"{name} 0.1.0\nrequires: fpev {PLATFORM}\n")
    write(os.path.join(d, "CHANGELOG.md"), f"# Changelog\n\n## 0.1.0\n\nReviewed against fpev {PLATFORM}.\n")
    return d


def edit(path, old, new):
    text = read(path)
    assert old in text, old
    write(path, text.replace(old, new))


def build_fixtures(root):
    sound(root, "sound-plain")
    d = sound(root, "sound-with-tool")
    write(os.path.join(d, "tools", "total.py"), "print(sum(map(int, input().split())))\n")
    write(os.path.join(d, "checks", "test_total.py"), "assert sum([1, 2]) == 3\n")

    def fault(code, label):
        name = f"fault-{code}-{label}"
        return sound(root, name), name

    d, n = fault("F6", "procedure")
    edit(os.path.join(d, n + ".md"), "Figures come from the field log.", "1. Open the field log.\n2. Copy the figures.")
    d, n = fault("F4", "no-owner-words")
    edit(os.path.join(d, n + ".md"), 'The owner asked for "a clear way to prepare the weekly field report".', "This improves weekly reports.")
    d, n = fault("F2", "no-run")
    edit(os.path.join(d, n + ".md"), "reference-runs:\n  - a synthetic run that reached Verify\n", "")
    d, n = fault("F5", "no-version")
    write(os.path.join(d, "VERSION"), f"{n} 0.1.0\n")
    d, n = fault("F5", "stale-platform")
    write(os.path.join(d, "VERSION"), f"{n} 0.1.0\nrequires: fpev 260810\n")
    d, n = fault("F9", "tool-no-checks")
    write(os.path.join(d, "tools", "total.py"), "print(sum(map(int, input().split())))\n")
    d, n = fault("F7", "over-budget")
    edit(os.path.join(d, n + ".md"), "Once a week.", "Once a week. " + "padding " * 1100)
    d, n = fault("F11", "dangling-reference")
    edit(os.path.join(d, "conventions", "phases.md"), "# Phases\n", "# Phases\n\nSee `review-variant.md`.\n")
    d, n = fault("F10", "personal-path")
    edit(os.path.join(d, n + ".md"), "Each report and its corrections.", "Reports are in /Users/somebody/private/reports.")
    d, n = fault("F10", "credential")
    edit(os.path.join(d, n + ".md"), "Each report and its corrections.", "The service key is sk-0123456789abcdef0123456789abcdef.")


def judge(root):
    bad = 0
    names = sorted(x for x in os.listdir(root) if os.path.isdir(os.path.join(root, x)) and x.startswith(("fault-", "sound-")))
    faults = sounds = 0
    for x in names:
        codes = {c for c, _ in lint(os.path.join(root, x))}
        if x.startswith("sound-"):
            sounds += 1
            ok = not codes
        else:
            faults += 1
            ok = codes == {x.split("-")[1]}
        print(("ok   " if ok else "WRONG"), x, sorted(codes))
        bad += not ok
    print(f"{faults} planted faults, {sounds} sound domains, {bad} misjudged")
    return 1 if bad or faults < 9 or sounds < 2 else 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("folder", nargs="?")
    ap.add_argument("--platform", default=PLATFORM)
    ap.add_argument("--selftest", action="store_true")
    ap.add_argument("--fixtures")
    ap.add_argument("--build")
    ap.add_argument("--private-terms", help="a file kept outside the domain, one private term per line")
    a = ap.parse_args()
    if a.build:
        build_fixtures(a.build)
        return 0
    if a.selftest:
        with tempfile.TemporaryDirectory() as t:
            build_fixtures(t)
            return judge(t)
    if a.fixtures:
        return judge(a.fixtures)
    if not a.folder:
        ap.error("give a domain folder")
    terms = [x.strip() for x in read(a.private_terms).splitlines() if x.strip()] if a.private_terms else ()
    errors = lint(a.folder, a.platform, terms)
    for code, msg in errors:
        print(code, msg)
    print(f"{'FAIL' if errors else 'PASS'}: {len(errors)} problem(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
