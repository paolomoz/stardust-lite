# Five-minute loop — the next phase (started 2026-10-11 19:20Z, report due 2026-10-12 02:20Z)

Asked: run the full plan hands off, iterate on as many sites as needed, stop at 02:20Z with a report of what was achieved and updated
charts (`loop/metrics/charts.html` from `runs.csv`).

## Method (why not one field run per change)
On the same code the loop's time to < 10 % ranged 8–35 min by page: a field run on a new page measures the page. So:
1. Machine-side changes ONE AT A TIME on the replay bench (`scripts/bench.mjs`, the finished loop pages, no agent, deterministic):
   kept only when the median first-round % improves and no page breaks.
2. Agent-side changes on a FIXED PANEL of already-run pages (fresh repo, fresh agent, same protocol), each compared with its own
   earlier clock — a paired comparison cancels the page's difficulty. Panel: santanderus (8.0), wpp (9.7), rbc (14.7), waters (33.7),
   lenovo (34.8). The field agent is not given the old case notes.
3. New pages only as the final check (Nebraska Furniture Mart, Bank of America, Cisco).

## Items (status in the log below)
1. bench as the gate for every generator change — rebuild the bench (its scratch was in /tmp), baseline
2. draft anchoring: spec-to-css drafted every section from one wrapper node (lenovo), drafts aimed at the wrong sections (waters)
3. missing content rows: live text in no section listed in the first digest (lenovo: three rows found by hand)
4. one reading card per section from `first` (live crop, box, fonts, colours, gaps, the draft) — agent-side, panel
5. hybrid fan-out: one agent's first pass, parallel owners for residual sections — agent-side, panel
6. machine rounds for geometry (a per-section search over measured properties, scored by section-view)
7. a faster model for the field agent / rounds — agent-side, panel
8. section-view with `drop` rows ("no live partner" on every lenovo section)
9. prototype vs served drift (lenovo 8.2 local, 11.1 served at 360)
10. keep every round's results (gate.json overwritten; widths under target not printed)
11–12 (user's decision, not run): second page of a migrated template; animation regions out of the %.

## Log
- 19:20Z start. Worktree `~/stardust/stardust-lite-gate` (exp/gate), bench under `~/stardust/bench`; each bench variant runs from a FROZEN
  checkout (`~/stardust/bench/code-<id>`) — the first baseline read the worktree while it was being edited and was restarted from main.
- item 2 (draft anchoring): rows sharing one spec section are drafted from their own band (lenovo: 8 sections → 8 distinct paddings / bgs).
- item 8: section-view's "no live partner" on lenovo was brief's LIVE numbering passed as the digest's BUILD numbering — it now takes a
  block name / anchor text and lists the digest's sections on a miss.
- item 10: the gate keeps every round in `rounds/` and prints the widths under target.
- item 9 (served drift): lenovo's two SVGs embed a raster pattern — upload 200, preview 409, served as `about:error` (two empty pills,
  360 at 11.1 served vs 8.2). media-fetch now draws such SVGs as `-svg.png` (preview 200 checked); `first` names failed media uploads.
- item 3 (missing rows): the tall-section split dropped children between heading-led parts — kept now when they carry content (lenovo:
  rewards band + "Innovation in Action" title; bms: two 900 px sections "Life + Science", "Pipeline" with h4-led headings). Changes the
  section count → scored on the bench in draft mode (patch held in `~/stardust/bench/c5-gap-parts.patch` until then).
- item 4 (reading cards): `cards.mjs` — one card per build section from the gate's table (values inside its range at 1440 / 360, owner
  file, Δh / %, live | build crops), ≈ 1 s, refreshed every round, named by `first` and the field protocol.
- bench n0 (main, case triage, 23 pages; bms / equitable / pgatour fail in replay at author): median 54.0 / 55.1 / 47.0 %.
- item 2 REJECTED: the bands left 16 pages unchanged and made lenovo / nfl / sherwin-williams +2…+20 points worse (builds 1.5–6 k px
  shorter: the old wrapper-wide padding had been compensating content the machine build lacks), omnicom mixed; keeping the wrapper's
  paint changed nothing. Reverted (aac276b).
- item 3 KEPT on content completeness against the bench: lenovo draft-mode 33.5 / 51.4 / 31.3 → 39.5 / 52.0 / 32.2 %, 0 → 3 sections in
  tolerance; every other loop page splits identically.
- 20:20Z merged e8dfd0a (items 3, 4, 8, 9, 10) → panel P1 santanderus-p1 started.
- P1 santanderus-p1 (e8dfd0a): stop 8.8 min (was 8.0), served = prototype (5.66 / 3.08 / 4.10). Defects: drafts rewritten (hero picture
  twice, `div` text rules on every cell, footer `div { font }`), nav doc unusable, hero thumbnails outside the carousel.
- P2 wpp-p1 (e8dfd0a): stop 9.5 min (was 9.7), served = prototype. Defects: author lost structure (h1 as three line p's, heading + intro
  merged, a closing CTA missing), cards draft `repeat(1, …)` from a 2-span card (Δh +8582), videos as links, logo SVG not fetched.
- bench n3 (8fffaf7: div text → p rule; a section's background picture drafted once): 16 changed pages, 0 worse, marriott −4.9 and
  unitedrentals −5.9 at 360 — KEPT.
- WPP cards `repeat(1, …)`: the per-row count from the fullest row changes nothing — the chosen unit IS the 690×460 2-span video card (the
  regular cards have no paint of their own, so they are never a unit). Reverted; registered: choose between the painted unit and the image
  column by members per row. WPP's hero heading is not one text in the dump (per-line nodes without a font) — collector, registered.
- P3 rbc-p1 (b60175f): stop 11.0 min (was 14.7), served 6.62 / 3.97 / 2.37. Costs: author mis-modelled sections 2–5 (chevron SVGs as card
  pictures, panels as loose content, accordions dropped — Δh +8293, ≈ 4 min re-authoring), thin chrome drafts (≈ 2 min), drafts keyed on
  section positions lost after the re-author (≈ 1 min); button rules on `strong a` (decoration makes `a.button`).
- author: the nav brand is its logo (`<a><picture><img>`) when the link holds one — santanderus / rbc / merck now match the agents' hand
  versions (revlon / wpp draw an inline SVG never fetched). foundation: decorateVideos (poster + file link → muted looping inline video).
- P4 waters-p1 (c0c9e90): stop 13.3 min (was 33.7), served = prototype (8.94 / 7.74 / 5.56). Costs: author junk (SVG <style> text,
  `:layer-1:` tokens, video as a bare link, a link list as a 9-row accordion), the nav's SVG logo served as about:error, sections-draft
  unusable (608 px cap from a narrow column, paddings 0).
- fixes after P3 / P4: author — SVG backgrounds on text elements are markers, not pictures (rbc 38 → 8 pictures; bench rbc −10.7 / −2.6 /
  −1.5); icon-only links keep the icon inside the link with the label as title. first — documents upload after their media (waters'
  logo: DA stored about:error for a file still uploading). collector — text excludes inline-SVG <style> / scripts.
- decorateVideos KEPT on content fidelity against the bench: mheducation +0.2 / +22 / +34 (its hero is a background video behind the text;
  rendered in flow at 720 px it now pushes the page down — before, the video was a small text link), wpp −1.1 / −3.2 / −1.5, deloitte ±0.4.
  Media rules now size `video` like the picture.
- P5 lenovo-p1 (7a9be3d): stop 33.4 min (was 34.8), served 8.04 / 4.88 / 7.73. Largest cost ≈ 14 min: every section drafted from the one
  6734 px wrapper — the defect item 2 fixed and the bench REJECTED (the machine-only first-round % read the wrong-but-tall drafts as better).
  Also: Montserrat declared as fixed 400 / 700 faces for a variable file (600 rendered as 700, wraps at 360); the hero category strip not
  authored; the per-section % is page-aligned (a fixed height above moves the % of every section below).
- Field A/B for item 2: lenovo-p2 = the same code + the bands (branch exp/bands), same protocol.
- fixes after P5: media-fetch declares faces with identical bytes as one variable face with a weight range (lenovo Montserrat 400 + 700 →
  100 900); the gate prints each section's own % (own tops) beside the page-aligned share when they differ by > 3 points.
- P6 lenovo-p2 (a8b975a = 7a9be3d + the bands): stop 16.5 min vs P5's 33.4 on the same page and code — the bands HALVE the clock on the page
  they target; the bench's machine-only first-round % misjudged them (wrong-but-tall drafts scored better as pixels, cost the agent 14 min).
  ADOPTED against the bench. Served 9.13 / 11.75 / 9.59 (a slider scrolled sideways on the served capture at 1440 — registered).
- author: a main row with a chrome row's box is the chrome split twice → drop (marks exactly the rows the agents dropped by hand:
  lenovo-p2 1 / 12, lenovo-lite 2 / 11, omnicom 6; none elsewhere).
- N1 nfm: SKIPPED — a location block (Akamai "This site is not accessible from your current location") through every tier; `first` ran the
  whole pipeline on the block page and the gate printed REACHED. Fixed: `first` stops when the measured page is a block page (title /
  challenge / location text; across all measured pages it flags only nfm). Its repo and three DA drafts hold the block page (harmless).
