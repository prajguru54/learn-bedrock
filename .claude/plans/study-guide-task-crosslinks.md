# Plan — Clickable Task cross-references in the domain study guides

Status: PLAN ONLY. No guide edits made yet.
Approach: one-time manual edit, done by hand (Edit tool), guide by guide. No script.

## Problem

Guides say things like "Task 2.3 covers the pipeline, and Task 1.2 shows how to switch
models" as plain text. A reader can't tell what those tasks are and can't jump to them.
Example: `docs/domain/aip-c01-domain1-study-guide.html:834`.

## Why this is feasible (findings)

- Every task chapter already has a stable anchor: `<section class="chapter" id="task-D-N">`
  (e.g. `task-1-2`, `task-2-3`). Verified in all 5 guides. No new anchors are needed.
- Two kinds of reference:
  - **Same guide** (Domain 1 text citing Task 1.2): `href="#task-1-2"`.
  - **Cross-guide** (Domain 1 text citing Task 2.3):
    `href="aip-c01-domain2-study-guide.html#task-2-3"`. All guides sit in the same
    folder, so relative links work.
- `html { scroll-behavior: smooth; scroll-padding-top }` already exists in
  `prompts/study-guide-template/shell-head.html`, so jumps animate nicely.
- Roughly 60 mentions across the 5 guides (Domain 1 has the most, about 30). Small enough to edit by hand.

## How a link behaves at runtime

```
Reader sees:   ... Task 2.3 covers the pipeline ...        (Task 2.3 is a link)
Hover:         tooltip "Task 2.3 — <task title>"
Click (other guide):  opens aip-c01-domain2-study-guide.html scrolled to #task-2-3
Click (same guide):   smooth-scrolls to #task-1-2
Browser Back:         returns to the exact paragraph you left
```

Before / after:

```html
<!-- before -->
Task 2.3 covers the pipeline, and Task 1.2 shows how to switch models.
<!-- after -->
<a class="xref" href="aip-c01-domain2-study-guide.html#task-2-3" title="Task 2.3 — ...">Task 2.3</a>
covers the pipeline, and
<a class="xref" href="#task-1-2" title="Task 1.2 — ...">Task 1.2</a> shows how to switch models.
```

## Design decisions

1. **By hand, no script.** This is a one-time job, so no tooling is built or kept.
2. **Link every `Task D.N` mention in prose** (paragraphs, list items, table cells,
   callouts), including mentions inside that task's own chapter. Goal is trackability.
   Do not link: headings, each chapter's own title label (they are the targets), and
   text already inside an `<a>`, `<code>`/`<pre>`, or a mermaid block.
3. **Compound forms:**
   - `Task 2.4 and 2.5` -> link both numbers (`Task 2.4` and `2.5` each get their own link)
   - `Tasks 2.3 and 2.5` -> same
   - `Chapter 2 (Task 1.2)`, `Domain 2 (Task 2.4)` -> the task number is linked
4. **Tooltip titles:** read each guide's `task-D-N` chapter heading once and write the
   title into the `title` attribute (`Task 2.3 — <title>`). Titles collected in step 2 below.
5. **Style:** one `.xref` rule (dotted underline, inherits colour, accent on hover) so links
   look clickable without shouting. Must work in light and dark mode.
6. **Same-guide vs cross-guide hrefs** follow the rule from the findings section; the
   guide file for domain D is `aip-c01-domainD-study-guide.html`.

## What changes

| File | What changes |
|---|---|
| `docs/domain/aip-c01-domain1-study-guide.html` | Add `.xref` CSS; wrap each Task mention in a link (most of the work, ~30) |
| `docs/domain/aip-c01-domain2-study-guide.html` | Same (~10) |
| `docs/domain/aip-c01-domain3-study-guide.html` | Same (~8) |
| `docs/domain/aip-c01-domain4-study-guide.html` | Same (~6) |
| `docs/domain/aip-c01-domain5-study-guide.html` | Same (~4) |
| `prompts/study-guide-template/shell-head.html` | Add the same `.xref` CSS, so any guide built from the template later has the style (CSS only, no logic) |

Not changed: `build_guide.py`, `create_domain_study_plan.md`. No new files.

## Implementation checklist

1. Inventory (read-only): `grep -n "Tasks\? [0-9]\.[0-9]"` per guide. Classify each hit as prose (link), heading/title label (skip), or already a link (skip). Save the list as the working checklist.
2. Collect the 5 guides' task titles from the `task-D-N` chapter headings for the tooltips.
3. Add the `.xref` CSS to `shell-head.html` and to each guide's `<style>` block.
4. Edit Domain 1 first, one mention at a time with the Edit tool. Start with line 834 (the example you reported), then show you the result before continuing.
5. After your OK on the style, do Domains 2 to 5.
6. Verify (see below), then show `git diff --stat`.

## Verification (read-only checks, all by grep)

- Unlinked mentions left: grep for `Task [0-9]\.[0-9]` not preceded by `>` inside an `<a ...>`; the only remaining hits should be headings and chapter title labels.
- Broken links: for every `href="...#task-D-N"` used, confirm the `id="task-D-N"` exists in the target file (grep each id once).
- Spot-check in a browser: same-guide jump, cross-guide jump, Back button, tooltip, dark mode.
