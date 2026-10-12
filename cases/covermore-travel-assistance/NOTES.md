# Friction notes — covermore travel-assistance (minutes from the clock in TIMELINE.md; ranked at the end)

## Tool friction (one line per wait / retry / re-read / hand work)

- 6.0 min | measure-page run 1: the default `main > .section` matched nothing; the note said "read structure-<W>.txt" but the structure dump is
  depth 3 and stops at `.main-area` (the regions are one level deeper) — no guess was named. Found `main .main-area > .region` through content-view
  (150 lines) and two python slices of dom-1440.html. Fix: when the default matches nothing, measure-page should propose (and apply) the first level
  under `main` with ≥ 2 children that hold text, or print the structure one level below the deepest single-child chain.
- 1.0 min | measure-page run 2 was a full re-measure (58 s + reading) only to split the same page; a `--sections` re-split of the captured DOM / spec
  would be seconds and would also fix the gate's split.
- 2.5 min | `author --draft-new` on an all-default page: four defects to find and edit by hand — the breadcrumb (`a` + text in one `nav`) split into two
  paragraphs; the third `h3` (`<strong>Email:</strong> <a mailto>`) dropped (a heading whose text is a link); an empty third nav section; the footer
  logo picture emitted twice (in its link and bare). Plus the triage draft calling both text-only sections "NEW columns (?) weak". Fix: text-only
  sections with repeat < 2 → default content; keep inline link + text in one `p`; keep a heading with a link; drop empty fragment sections; dedupe a
  picture inside a link.
- 2.0 min | fonts: the theme embeds its three faces as `data:` URIs; `media-list` recorded the face names and one unrelated Google font request, no
  bytes, no file. Wrote `scripts/font-dump.mjs` (CSSFontFaceRule.src → woff). Fix: measure-page / media-fetch dump data-URI faces to `/fonts`.
- 1.5 min | paint not in the brief: the body photo (`bkg-body-home-us.jpg`, 1650×1300, `50% 0` no-repeat — the brief printed "body bg #000000/0") and
  the nav sprite (`bgi on li.nav-item` without size / position / repeat). Read through two `deep-probe --props` runs (39 KB of output, condensed by
  a python filter because every line repeats the defaults). Fix: brief prints body / section background-image with position, size, repeat and the
  image's natural size; deep-probe prints only non-default values.
- 1.2 min | breakpoints: 360 and 1440 show two layouts, nothing says where they switch (768 / 992 here, with a tablet state between). Ran probe-load at
  five widths. Fix: a `--ladder` on probe-load / measure-page printing header height and doc height per width.
- 1.0 min | content-view printed the whole page twice under the unassigned `div` root (the AudioEye blurb at x −10001 matched every `div`), ~90 lines.
  Fix: drop off-screen unassigned bands (x < −9000) as "a11y blurb, not content".
- 0.9 min | cap-probe FAIL every round on "module 2/2": a Word-paste inline `span.TextRun` (1073 px) read as a module vs the build's section
  ("full-bleed"). The gate marks the verdict advisory only when the live split holds ≤ 2 sections. Fix: an inline (`display: inline`) leaf is never a
  module; or the gate annotates a module row whose live selector ends in an inline element.
- 0.7 min | gate r1 Δh −14 on the article: the live region contains its children's 7 px margins (a formatting context). The brief's inset line said
  `top 7: section → h1 m7`, which I read as "the h1's margin, collapses as usual". Fix: the inset line says "contained" when the section box includes
  the first / last child's margin (box.top ≠ child.top − margin).
- 0.5 min | eds-new-site guard: `admin.da.live/list/<site>/` returns 200 `[]` for any missing folder; the skill says 200 = stop and ask. Proved it
  on a random name. Fix: the skill tests for a non-empty list.
- 0.5 min | hamburger 5 px off at 360: the source's 35 px wrapper is centred and its 44 px button overflows it right; only the r1 diff crop plus the
  deep-probe `--children` line (`div.navbar-toggler [163,62,35,54]` vs `.navbar-toggle [163,70,44,34]`) showed it. Fix: brief prints the control's
  box and its parent's when they disagree.
- 0.3 min | `pair` paired the breadcrumb "Travel Assistance" with the h1 "Travel assistance coverage" (prefix match across sections) — one bogus row with
  FAMILY / COLOR deltas.
- 0.3 min | motion-compare: "transition color MISSING (2 events)" and "hover brand MISSING" are the same invisible hover (colour on an `img`); two rows
  to explain for one non-fact.
- 0.2 min | the da-put of the three documents and two media is quick (15 s) but `author` did not know the fragment paths without `--nav-path` /
  `--footer-path` (no profile yet) — one re-run.

- 0.2 min | `site-profile init` read `noise.floor1440 null` although measure-page printed the 0 % floor (summary.json has it) and listed 13 missing
  fields read from prose (BACKLOG #132); `block-inventory scan --cases` lists the boilerplate's unused cards / columns / hero as inventory rows.

## My own reading and deciding (the clock between tool returns)

- 6.0 min | content-view + DOM slices to find the section selector (the item above — all of it was reading).
- 6.9 min | between brief/triage (15:49:33) and the triage edit (15:56:25): the brief (one screen, fast), three capture crops (needed: the body photo, the
  mobile hamburger, the footer stacking are in no table), two deep-probe runs and their condensation, hover-diff + click-state, the fonts list and the
  footer DOM slice. A brief that printed the body paint, the control boxes and the data-URI faces would have cut this to ~2 min.
- 2.7 min | reading the boilerplate (scripts.js 200 lines, header.js 160, footer.js) and the from-md rules to know what to write / replace; the
  foundation-README said what the foundation owns but the boilerplate header.js still had to be read to be replaced.
- 1.9 min | composing the CSS / JS from the measurements (the heights' arithmetic for header 72 / 136, footer 86 / 105 was done in my head from the
  deep-probe rows — the brief's rhythm line gave the vertical chain, the inset line the owners).
- 2.2 min | reading gate r1 (table + two crops) and deciding the three changes.
- 1.4 min | reading r2's motion compare, pair and the two full diffs; 1.1 min shift-probes and the prototype leak before the served gate.
- 0.8 min | METHOD (39 KB), 30 open BACKLOG rows, the usage list — read once before t0.

## Did the instruments help or mislead?

- brief: helped (fonts, colours, cap, rhythm in one screen; the inset line gave the breadcrumb's 15 as a section style and the footer's 85 / 50 as
  padding). Misled once: `top 7: section → h1 m7` hid that the section *contains* the margin (round 1). Printed the body bg as transparent (#000000/0)
  while the body carries the page's photo.
- --draft-new: helped (three documents in one second, lint-clean structure) but needed four hand edits (above).
- section marks (`--sections`): helped — dump, spec, triage and gate split alike; the gate's per-section Δh pinned round 1 to section #2 at once.
- --noise: helped (0 % floor in the same run; the page is static).
- gate's section tables + hottest band: helped (dy −8 "a displacement" in r1 → the margin; CLEAN in r2 → stop).
- pair's Δy·loc / ≈: helped — the paragraph rows' −2 were read as glyph box vs line box and not chased; one bogus prefix pairing.
- shift-probe: helped — named the two residuals (dy −1 text, dx −4 breadcrumb) in 20 s.
- click-state: helped — the same tree printed for live, build and served made the mobile panel a one-line verdict.
- cap-probe: misled (a Word span as a module, every round).
- sync-poll: helped (16 s, verified bytes).

## Ranked by minutes lost

1. 7.0 — section selector: no guess named + a full re-measure to split (6.0 + 1.0)
2. 2.5 — author draft defects on default content (+ triage's "columns? weak")
3. 2.0 — data-URI fonts not dumped
4. 1.5 — body / nav paint not in the brief; deep-probe output 10× too verbose
5. 1.2 — breakpoints not read by any instrument
6. 1.0 — content-view duplicating the page under an off-screen unassigned root
7. 0.9 — cap-probe inline span as module
8. 0.7 — the inset line not saying "contained" (one gate round)
9. 0.5 — eds-new-site DA guard; 0.5 — hamburger wrapper/button overflow found only in the crop
10. 0.3 — pair prefix pairing; 0.3 — motion-compare's two rows for one invisible hover; 0.2 — author without fragment paths
