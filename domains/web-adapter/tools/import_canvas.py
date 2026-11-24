#!/usr/bin/env python3
"""Import an exported web-cycle document into an FPEV version folder.

  import_canvas.py <document.md> <version-folder>
  import_canvas.py <document.md> <version-folder> --legacy --person <handle> --agent <handle>

The document follows conventions/canvas.md: sections 0-4, handoff blocks headed by file names,
a prompt index, and a prompt appendix with every prompt in full. Everything is validated before
anything is written. Existing files are never overwritten; a prompt number already recorded is skipped.

--legacy reads an older document whose ledger holds the prompts directly ("- **#N:** text") and
whose handoffs are headed "### Handoff [Stage N: Label]". Such prompts are marked "verbatim not verified".
Exit: 0 imported (skips are reported), 1 invalid document (nothing written).
"""
import argparse, os, re, sys

SECTION = re.compile(r"^## ([0-4])\.", re.M)
INDEX = re.compile(r"^- #(\d+) · (\S+) · opens (\S+) · (.*)$")
LEGACY_INDEX = re.compile(r"^- \*\*#(\d+):\*\*\s?(.*)$")
HANDOFF = re.compile(r"^stage-[1-4]-[a-z0-9]+(?:-[a-z0-9]+)*-[^\s/]+-[^\s/]+\.md$")
WIKI = re.compile(r"^wiki/topics/[A-Za-z0-9._-]+\.md$")
LEGACY_HEAD = re.compile(r"^(Handoff|Amendment Note) \[Stage ([1-4])(?::\s*([^\]]+))?\]")
FIELD = re.compile(r"^- \*\*([A-Za-z ,]+):\*\*\s*(.*)$", re.M)


def strip_outer_fence(text):
    lines = text.strip("\n").split("\n")
    m = re.match(r"^\s{0,3}(~{3,}|`{3,})\w*\s*$", lines[0]) if lines else None
    if m and len(lines) > 1:
        fence = m.group(1)
        if re.match(r"^\s{0,3}" + re.escape(fence[0]) + "{%d,}\\s*$" % len(fence), lines[-1]):
            return "\n".join(lines[1:-1]) + "\n"
    return text


def sections(text):
    parts, marks = {}, list(SECTION.finditer(text))
    title = text[:marks[0].start()] if marks else text
    for i, m in enumerate(marks):
        end = marks[i + 1].start() if i + 1 < len(marks) else len(text)
        body = text[m.end():end]
        parts[int(m.group(1))] = body.split("\n", 1)[1] if "\n" in body else ""
    return title, parts


def blocks(body):
    """Split a section into (heading, content) on level-3 headings, ignoring fenced code."""
    out, head, buf, fence = [], None, [], None
    for line in body.split("\n"):
        f = re.match(r"^\s{0,3}(`{3,}|~{3,})", line)
        if f:
            fence = None if fence and f.group(1)[0] == fence[0] and len(f.group(1)) >= len(fence) else (fence or f.group(1))
        if fence is None and line.startswith("### ") and not f:
            if head is not None:
                out.append((head, "\n".join(buf)))
            head, buf = line[4:].strip(), []
        elif head is not None:
            buf.append(line)
    if head is not None:
        out.append((head, "\n".join(buf)))
    return out


def front_matter(content):
    m = re.match(r"\s*```ya?ml\n(.*?)\n```\n?", content, re.S)
    if not m:
        return None, content.strip("\n")
    return m.group(1), content[m.end():].strip("\n")


def slug(label):
    return re.sub(r"[^a-z0-9]+", "-", label.lower()).strip("-") or "block"


def parse(text, legacy, person, agent):
    errors = []
    title, sec = sections(strip_outer_fence(text))
    for n in range(4 if legacy else 5):
        if n not in sec:
            errors.append(f"missing section ## {n}.")
    status = sec.get(0, "")
    fields = {k.strip().lower(): v.strip() for k, v in FIELD.findall(status)}
    person = person or fields.get("person", "")
    if not person or person.startswith("<"):
        errors.append("no person handle: set **Person:** in section 0 or pass --person")

    prompts, index = {}, []
    for line in sec.get(1, "").split("\n"):
        m = (LEGACY_INDEX if legacy else INDEX).match(line.strip())
        if m:
            index.append(m)
    appendix = {}
    for head, content in blocks(sec.get(4, "")):
        hm = re.match(r"^#(\d+)$", head)
        if not hm:
            errors.append(f"appendix heading is not '### #N': {head}")
            continue
        lines = content.strip("\n").split("\n")
        bad = [l for l in lines if l and not l.startswith(">")]
        if bad:
            errors.append(f"appendix #{hm.group(1)}: a line is not quoted with '> ': {bad[0][:50]}")
        appendix[int(hm.group(1))] = "\n".join(l[2:] if l.startswith("> ") else l[1:] for l in lines)
    for m in index:
        n = int(m.group(1))
        if n in prompts:
            errors.append(f"prompt #{n} indexed twice")
        if legacy:
            prompts[n] = ("legacy ledger; verbatim not verified", appendix.get(n, m.group(2)))
        elif n not in appendix:
            errors.append(f"prompt #{n} has no full text in ## 4. Prompt Appendix")
        else:
            prompts[n] = (f"{m.group(2)}; opens {m.group(3)}", appendix[n])
    for n in appendix:
        if not any(int(m.group(1)) == n for m in index):
            errors.append(f"appendix #{n} has no index line")
    if not prompts and not errors:
        errors.append("no prompts found in ## 1.")

    files = {}
    for head, content in blocks(sec.get(2, "")):
        name = head
        if legacy:
            lm = LEGACY_HEAD.match(head)
            if not lm:
                errors.append(f"malformed handoff heading: {head}")
                continue
            label = (lm.group(3) or "").strip()
            ph = re.search(r"Phase (\d+)", label)
            kind = f"phase-{ph.group(1)}" if ph else slug(label)
            if lm.group(1) == "Amendment Note":
                kind += "-amendment"
            if not (person and agent):
                errors.append("--legacy needs --person and --agent")
                break
            name = f"stage-{lm.group(2)}-{kind}-{person}-{agent}.md"
        elif not HANDOFF.match(head):
            errors.append(f"malformed handoff heading (expected stage-N-<kind>-<person>-<agent>.md): {head}")
            continue
        meta, body = front_matter(content)
        if meta is None:
            errors.append(f"{name}: no yaml front matter under the heading")
            continue
        if not re.search(r"^authors:", meta, re.M):
            if legacy:
                meta += f"\nauthors: [{person}, {agent}]"
            else:
                errors.append(f"{name}: front matter lacks authors")
        path = os.path.join("handoffs", name)
        if path in files:
            errors.append(f"two blocks would write {path}")
        files[path] = f"---\n{meta}\n---\n\n{body}\n"
    for head, content in blocks(sec.get(3, "")):
        if not WIKI.match(head):
            errors.append(f"malformed wiki heading (expected wiki/topics/<slug>.md): {head}")
            continue
        meta, body = front_matter(content)
        files[head] = (f"---\n{meta}\n---\n\n" if meta else "") + body + "\n"
    heading = title.strip().lstrip("#").strip() or fields.get("project", "Web cycle")
    files["README.md"] = f"# {heading}\n\nImported from a web-cycle document.\n\n{status.strip()}\n"
    return errors, person, prompts, files


def write_prompts(folder, person, prompts, report):
    path = os.path.join(folder, "references", f"user-prompts-{person}.md")
    existing = open(path, encoding="utf-8").read() if os.path.exists(path) else ""
    have = {int(n) for n in re.findall(r"^\*\*#(\d+)\*\*", existing, re.M)}
    out = existing or f"---\ntype: reference\nartifact: owner-prompt-record\nauthors: [{person}]\n---\n\n# The owner's words\n"
    for n in sorted(prompts):
        if n in have:
            report.append(f"skipped prompt #{n}: already recorded")
            continue
        note, text = prompts[n]
        quoted = "\n".join("> " + l if l else ">" for l in text.split("\n"))
        out += f"\n**#{n}** ({note})\n{quoted}\n"
        report.append(f"prompt #{n}")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(out)


def run(doc, folder, legacy=False, person=None, agent=None):
    text = open(doc, encoding="utf-8").read()
    errors, person, prompts, files = parse(text, legacy, person, agent)
    if errors:
        return errors, []
    report = []
    for rel, content in files.items():
        path = os.path.join(folder, rel)
        if os.path.exists(path):
            report.append(f"skipped {rel}: exists")
            continue
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        report.append(rel)
    write_prompts(folder, person, prompts, report)
    return [], report


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("document")
    ap.add_argument("folder")
    ap.add_argument("--legacy", action="store_true")
    ap.add_argument("--person")
    ap.add_argument("--agent")
    a = ap.parse_args()
    errors, report = run(a.document, a.folder, a.legacy, a.person, a.agent)
    for e in errors:
        print("ERROR", e)
    if errors:
        print(f"INVALID: {len(errors)} problem(s); nothing written")
        sys.exit(1)
    for r in report:
        print("wrote" if not r.startswith("skipped") else "", r)
    print("Imported. Next: run the shape's record check on", a.folder)


if __name__ == "__main__":
    main()
