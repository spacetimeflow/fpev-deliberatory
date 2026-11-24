# Readiness: draft, stable, and who decides

Only the owner sets a status. [owner]

## Draft

A domain may be deployed as a draft when:

- At least one reference run reached Verify. [run]
- Its purpose is in the owner's words. [owner]
- `checks/lint_domain.py` passes. [run]
- The domain folder passes its own privacy check: `python3 checks/privacy_scan.py <domain-folder> --terms <the owner's terms file>` reports no findings. [run]
- The checker, and any tool's checks, have been shown to fail on planted faults. [run]
- A fresh reader completed a small task from the files alone. [run]
- Its limits are stated under *Untested*. [external]

## Stable

A draft becomes stable when:

- **A second, different instance followed the draft.** Runs from before the draft do not count. [run]
- Its departures and defects were folded in or ruled out. [run]
- The owner has used it and can explain its core without the file. [owner]

## The mechanical checker

`python3 checks/lint_domain.py <domain-folder>` checks form only: required files, sections and front matter; the FPEV version in `VERSION` against the current platform; no procedure in the idea file; reading budgets; evidence marks in conventions; checks for tools; no machine paths, home folders, email addresses, private networks, credentials or listed private terms; and no references to missing files.

The privacy check ships with the domain in two parts. `checks/lint_domain.py` applies it to the domain folder. `checks/privacy_scan.py` applies it to any folder that leaves the machine — the installed shape, a release, a repository about to be pushed. The list of private terms is the owner's and is never shipped; it is passed with `--terms`, one term per line. The scan finds patterns and listed terms, and skips `checks/`, where tools contain patterns rather than data; it cannot recognize every private detail, so a person does the privacy pass. [run]


It cannot tell whether a domain is wise. It also cannot recognize every private detail, so a person does the privacy pass. [run]

`python3 checks/lint_domain.py --selftest` builds planted faulty domains and sound ones, and fails unless each is judged correctly. [run]

## The fresh-reader test

- Give a new agent only the domain's files and a small realistic task. [run]
- Write the scoring key before the run. [run]
- Use a clean environment, with no memory, user settings or other project files. [run]
- Use at least two models when the domain will be used across models. [run]

## Forward test (optional, for a contested domain)

Compare work done with and without the domain, on traps listed before the test. Report the result whatever it shows, and do not tune against the same traps. [inferred] Falsified if such tests fail to separate good domains from weak ones.

## Deployment

- The owner orders each deployment. [owner]
- Install a copy from the development project; never edit the installed copy. [owner]
- Record the prior state and the exact revert. [run]
- Before anything is shared, the privacy check passes on the share with the owner's terms file, and a person re-reads what the scan found and what it cannot know. [run]
- Confirm the install from a fresh session. [run]
