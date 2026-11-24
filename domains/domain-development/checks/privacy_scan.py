#!/usr/bin/env python3
"""Privacy check: scan a folder before it is shared. Exit 0 clean, 1 findings.

  privacy_scan.py <folder> [--terms <owner's-terms-file>]

Run it on anything that leaves the machine: a domain folder, the installed
shape, a release, a repository about to be pushed. The list of private terms
is the owner's and is never shipped with the domain; pass it with --terms,
one term per line. The check finds patterns and listed terms; it does not
know what is private, so a person's reading still stands. `checks/` folders
are skipped: they hold tools, and tools contain patterns rather than data.
"""
import argparse, os, re, sys

SKIP_DIRS = {"node_modules", "__pycache__", ".git", "checks"}
PATTERNS = {
    "home path": r"/Users/(?!somebody\b)[\w.-]+|/home/[\w.-]+|[A-Za-z]:\\Users\\",
    "personal folder": r"~/(?!\.)[A-Za-z][\w.-]+",
    "email": r"\b[\w.+-]+@(?!types\b)[\w-]+\.[a-z]{2,}\b",
    "private IP": r"\b(?:100\.(?!64\.)(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.\d+\.\d+|192\.168\.(?!0\.)\d+\.\d+)\b",
    "credential": r"sk-[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{16,}|xox[bp]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY",
}


def scan(root, terms=()):
    hits = []
    for kind, pattern in PATTERNS.items():
        rx = re.compile(pattern)
        for d, ds, fs in os.walk(root):
            ds[:] = [x for x in ds if x not in SKIP_DIRS]
            for f in fs:
                p = os.path.join(d, f)
                if f == ".DS_Store":
                    hits.append((os.path.relpath(p, root), "metadata file", f))
                    continue
                try:
                    text = open(p, encoding="utf-8").read()
                except UnicodeDecodeError:
                    hits.append((os.path.relpath(p, root), "binary file", f))
                    continue
                for m in rx.finditer(text):
                    hits.append((os.path.relpath(p, root), kind, m.group(0)))
    if terms:
        term_rx = re.compile("|".join(rf"(?<![\w-]){re.escape(t)}(?![\w])" for t in terms))
        for d, ds, fs in os.walk(root):
            ds[:] = [x for x in ds if x not in SKIP_DIRS]
            for f in fs:
                p = os.path.join(d, f)
                try:
                    text = open(p, encoding="utf-8").read()
                except UnicodeDecodeError:
                    continue
                for m in term_rx.finditer(text, re.I):
                    hits.append((os.path.relpath(p, root), "term", m.group(0)))
    hits.sort(key=lambda h: (h[0], h[1]))
    return hits


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("folder")
    ap.add_argument("--terms", help="the owner's private-terms file, kept outside the domain")
    a = ap.parse_args()
    root = os.path.expanduser(a.folder)
    terms = ()
    if a.terms:
        with open(os.path.expanduser(a.terms), encoding="utf-8") as f:
            terms = [x.strip() for x in f if x.strip()]
    hits = scan(root, terms)
    for h in hits[:40]:
        print(f"{h[1]:16s} {h[0]}: {h[2][:50]}")
    print(f"{len(hits)} finding(s) in {root if len(root) < 4 else os.path.basename(root)}")
    sys.exit(1 if hits else 0)


if __name__ == "__main__":
    main()
