# wyndham-home — notes

## The live capture is wrong (two defects; ~10 min spent, then registered)
1. **Blank capture.** Adobe Target at.js leaves `style#at-body-style.at-flicker-control { body{opacity:0} }` in place for automated
   browsers (bundled Chromium, Chrome headless and Chrome headed all read `getComputedStyle(body).opacity === "0"` 5–15 s after load,
   also after the consent click). Every `measure/live-*.png` from the first `first` was one colour (255,255,255), and the spec items read
   "inside an entrance state". Workaround without editing the tools: a CSS rule smuggled through the profile's `overlays.hide` list
   (`#sd-unflicker{} body{opacity:1 !important} #sd-unflicker` — the hide list is joined into a style tag), then `first --skip probe`.
2. **Lazy pictures never loaded at 360 and 1440.** The Join Wyndham Rewards picture and the Featured Hotels slide picture are grey
   (#d9d9d9) boxes in `live-360.png` and `live-1440.png` (they are loaded at 2560). The site's `lazy-load-pageload` images load in a
   plain Playwright page on wheel or on `scrollTo` steps, so the cause is in the capture's timing, not the site; not chased further.
   Evidence: at 360 the two grey boxes ([12,1995,347,2261] and [12,3847,347,4218]) hold 160 447 of the 327 077 differing pixels;
   **360 excluding them is 7.19 %** (page 12.92 %); 1440 excluding them 3.59 % (page 8.97 %). The build shows the real pictures
   (no grey placeholders were authored to game the gate). This is why the run has no `stop:` line at 360.
3. (2560, smaller) the booking bar becomes sticky while the stitcher scrolls: a 73 px search bar is painted into every viewport chunk
   of `live-2560.png` (≈ 6 copies); it costs ~1–2 % at 2560.

## (a) Tool friction
- Blank live capture (at.js flicker control) — 5 min — `probe-load` should flag a body/html with computed opacity 0 or visibility hidden
  after settle and the profile should have a first-class `overlays.css` (inject CSS) instead of abusing `hide`.
- Lazy placeholders in the cached live capture — 5 min (+ the 360 target lost) — the settle should verify that every in-flow `img`
  larger than 100×100 is `complete && naturalWidth > 1` (a 1×1 data-URI placeholder counts as not loaded) and nudge with wheel events.
- Section index off by one: the pipeline drops the empty `<div> </div>` (an `hr`-only live section) in the harness, the served page keeps
  it as an empty section, and every `nth-of-type` after it shifts — drafts were written for 13, the harness had 12, served had 13
  — 4 min (prototype) + 3 min (served gate 41–50 % until I removed the empty section from the doc) — `author` should not emit an
  empty section, or spec-to-css should key sections by a class instead of `nth-of-type`.
- `author` copied slick clones: the offers slider had 13 units (5 real), the hotels slider 21 (10 real) as default content, the promo
  banner ×3 — 5 min for a case script (`scripts/restructure.py`) — dedupe `.slick-cloned` / repeated text units before authoring.
- `first` re-ran on a new port (9000) while the old harness server on 8999 kept running; both served the same proto — 1 min.
- `da-put` media: `x2-points-for-new-hotels.png` is 7500×5000, 34 MB — preview 409 AEM_BACKEND_IMAGE_TOO_BIG — 2 min, downscaled to
  1200 px by hand — `media-fetch` should cap renditions (the live serves `?downsize=640:*`).
- Nav document had only a text brand link and an empty `ul` (no nav items, no logo) — 2 min to author by hand.
- Footer document missed the five column headings — added in r10.

## (b) My own time (non-tool), largest chunks
1. Diagnosing the blank capture and the lazy placeholders (probes, reading common.mjs settle/hide) — ~10 min.
2. Reading the live strips at 1440 / 360 and writing the first full CSS pass (styles.css sections, carousel, cards, hero, header) — ~7 min.
3. Restructuring the document (clones, booking hero, hotels block, nav) — ~4 min.
4. Footer CSS (two passes) — ~3 min.
5. Post-clock served mismatch (empty section) + oversized image — ~4 min.

## (c) Per round
- r1: all sections from the strips; the digest's Δh column was nonsense from section 6 on — the cause (dropped empty section) was found
  with a DOM dump, the digest did not name it.
- r2: renumbered, stopped importing `sections-draft.css` (its indices assumed 13 sections), footer bands — digest named heights, right.
- r3: buttons are `a.button.secondary/primary` after decorate (the `em > a` rules never matched), hero card stacking (the picture was
  inside the card), slider dots — found from side-by-side, digest said "paint".
- r4: mobile hero picture authored (`| mobile <720`, the live 360 uses "Deals and Text offer Image.png"), header capped at 1500 and centred
  (measured logo x101 / x631) — digest named "hotel" and the 2560 rows.
- r5: 2560 heights from the live table (818 / 474 / 298) — named by the digest (Δh +6 / -17 / +21). 2560 under 10.
- r6–r10: 360 only — type sizes the pair rows named (offers title, where-next title, discover h4), cards rhythm, promo strip, tabs, the
  footer accordion state. Each moved 360 by ≤ 0.2 pt: the residual is the two placeholders (see above).
