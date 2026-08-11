# Contributing

The deliberatory is a **shape** — a folder of documents an agent harness executes — not
just a program. Contributions follow the conventions embedded in this repository's
`workflows/` — the genre's FPEV protocol — so a contributor needs nothing outside the
repo.

## The shape's rules

- **The two-session discipline:** development and use never share folders. This repository
  is the tool; the projects it serves keep their own handoffs elsewhere.
- **The verify bar:** every claim ships with a runnable check. A change that cannot be
  verified is not a change.
- **The directive principle:** consent is the human's directive, not the keystroke that
  writes it. The agent proposes; the human ratifies.

## How to improve

1. Read `docs/UNDERSTAND.md` (the loop and the conventions), `docs/VERIFY.md` (the suites),
   and `docs/IMPROVE.md` (the module map).
2. Make the change; keep it small and document-native (markdown canonical, code derived).
3. Run the suites: `npm run test:forms`, `test:feedback`, `test:render`, `test:integration`,
   and the rest — all must stay green.
4. Open a pull request with a handoff-style summary: what changed, why, and the verification.

## Licensing

CC-BY-4.0, with attribution to the author and the corpus (see LICENSE). By contributing,
you agree your contribution is licensed under the same terms.
