# Maintaining a domain

## Versions

`VERSION` has two lines: [run]

```
<name> <version>
requires: fpev <platform version>
```

- When FPEV changes, compare its changelog with each stage, phase and rule the domain relies on. Then update `requires`, and record in `CHANGELOG.md` the version reviewed and what changed. An old value or a missing review fails the checker, which is how a silent break becomes visible. [run]
- A version number cannot show that the text is current, so the review itself is required. [run]
- Record each version's reason in `CHANGELOG.md`. [run]

## Dependencies

- Name any domain, tool or model the domain relies on. [run]
- Pin a model by repository and revision. The same text can behave differently on another model or release. [run]
- When a pinned model changes, re-run the conformance and fresh-reader tests before redeploying. [run]

## Review

- Give each domain a last-ratified date, and revisit it at least once a year. [external]
- At review, re-check external sources and reconsider the weakest lines. [external]
- Any "revise when…" promise names its trigger and who acts on it. [run]
- List domains kept outside the current shape, and have the owner decide for each: migrate, keep or retire. [run]

## Existing single-file domains

Single-file domains stay valid. Treat this method as a lens for reporting their defects. Migrating one is the owner's decision. [owner]

## Privacy and portability

- Refer to private projects by general description, or by a local path kept outside the deployed files. [run]
- Keep a private-terms list outside the domain and pass it to the checker with `--private-terms`. A person still does the final privacy pass. [run]
- Ship an example only if it is anonymized or synthetic. [external]
- Keep deployed files free of machine-specific paths, so a domain works on another computer. [run]

## Retirement

- Retire a domain when its kind of work has ended, a better one replaces it, or nobody has used it through a review. [inferred] Falsified if retired domains are often wanted again.
- Mark it retired and keep its record. The record grows. [owner]

## Protocol gaps

When several domains report the same missing feature, propose it for `workflows/`. Domains do not change FPEV themselves. [run]
