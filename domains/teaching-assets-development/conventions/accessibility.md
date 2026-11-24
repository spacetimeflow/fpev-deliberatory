# Accessibility

Evidence marks are defined in `course-cycle.md`.

## The requirement

- Find the institution's current rule and deadline, and cite them with the date checked. Public institutions in the United States may fall under WCAG 2.1 AA through ADA Title II. [external]
- Build accessibility in while authoring. Remediation afterward costs several times more. [owner]
- Prefer HTML to slide-printed PDF. In one course of 89 files, PDFs averaged 1.36 % on the campus checker and HTML 87.15 %. [run]
- A slide-print PDF is usually untagged. If the instructor mails one, say so, and do not present it as the accessible version. [run]

## Which check to believe

- **The institution's checker decides.** In one course a page with zero local violations scored 54.5, then 73.3, then 100 after three rounds. [run]
- Check the **rendered** page as well as the static file. Script-added links were invisible to static checks. [run]
- Do not report "accessible" from a tool that measured less. A passing check on an empty page proves nothing. [run]
- Show a checker can fail, on a page with planted defects, before trusting it. [run]
- Have someone other than the author check when it counts. Most course checks so far were written by the author of the work. [run]

## Authoring rules

- Use one title and ordered headings, with no skipped levels. [external]
- Give every informative image alt text saying what it shows, with the trend and key values. [external]
- Write the description after viewing the actual image or output. [run]
- Keep math as math, not images. [external]
- Do not convey meaning by colour alone. Give plot series different line styles or markers. [external]
- Use descriptive link text, never a raw URL or "click here". [external]
- Tables have header cells with scope, and a caption. [external]
- Keep controls at least 24 pixels. [external]
- Pages reflow at 320 pixels without sideways scrolling. [external]
- Pages are self-contained and make no network requests. [run]
- Link only to video with human-made captions. [run]

## Fix at the source

- Fix in the notebook, its sidecars or the render step, and re-export. A fix made only on the course site vanishes at the next upload. [run]
- Keep approved descriptions in a sidecar that survives re-runs. One re-extraction silently reset them. [run]
- A section that cannot be made accessible may stay in the live deck and be excluded from the student page, with the instructor's agreement. [run]

## Notes for one toolchain

These held for notebook slides rendered with Quarto and scanned by YuJa Panorama, and may not transfer. [run]

- Remove the empty links Quarto places on code lines. They were 801 issues in one report. [run]
- Turn off heading anchors. They were 179 more, seen only in the rendered page. [run]
- Keep alt text to 120 characters, and move the full description to a disclosure beneath the figure. [run]
- Panorama does not scan Markdown files, so they are never checked. [run]
- Delete superseded copies from the course site. They are scanned, and students can open them. [run]
