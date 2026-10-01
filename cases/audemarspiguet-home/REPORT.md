# www.audemarspiguet.com/ch/en/home → EDS, blocks-first v2.5 — run report (2026-10-01)

Site: `aemcoder-adobe/sdt-audemarspiguet`, branch `blocks-first` (main untouched). Content: DA `/drafts/home`, `/drafts/nav`, `/drafts/footer`
+ `/drafts/media/*` (35 files: 27 avif, 5 jpg, 3 svg — the bytes the live page serves at 1440 plus the lazy carousel cards), previewed on
the branch only, nothing published. Prototype: `migration/cases/home/proto/home.harness.html` served on :8973 (runtime harness page).
Served page: https://blocks-first--sdt-audemarspiguet--aemcoder-adobe.aem.page/drafts/home
Clock: start 03:08 CEST; documents linted and previewed 03:42 (step-2 checkpoint); **first shareable prototype + served URL 04:08 CEST**
(60 min: round 4 within 2 px on the 1440 section table, code pushed 04:08:05, branch code sync triggered and polled to the repo's md5 at
04:08:22); final numbers 04:25 CEST.

## Three-width table

Pixel %, cached origin captured once (`--settle --locale en-GB --consent '#onetrust-accept-btn-handler'`, videos frozen at t = 0), settle on both sides.

| width | noise floor (live vs live) | prototype (r5) | served (final) | Δh proto / served | notes |
|---|---|---|---|---|---|
| 360 | — (one capture; the 1440 pair reads 0.00) | **4.28** | **4.19** | −3 / −3 | bands 4500–7200 at 5–7.5 %: text anti-aliasing on a width the thin 100-weight headings and 16 px copy fill, plus the pipeline's renditions of the pictures (teasers, AP Chronicles, services cards, boutique); 0–1800 (heroes) 1.3–2.7 %: the video frame's decode; every section row within 3 px, doc height 8831 vs 8828 |
| 1440 | **0.00** (two captures, every band 0.0) | **2.50** | **2.48** | 2 / 2 | bands 4950 (7.1 %), 6300 (7.9 %), 3150 (5.2 %) are the AP Chronicles / boutique / lookbook pictures (rendition resampling: the source scales 1490- and 1920-px renditions, the pipeline serves its own) together with the text-image copy shifted 2 px by the heading line box (283 vs 285, 170 vs 172 — font metrics); every other band ≤ 2.1 %; all 12 authored sections within 2 px in the section table, doc height 8222 = live − 2 |
| 2560 | — | **1.34** | **1.34** | 1 / 1 | cap-probe PASS (content cap 1920 module, shell fluid, 0 of 5 rows failed) from round 0; bands 3150–3600 (3.3–4.5 %) the lookbook pictures at 2× their 1440 size; every section row within 3 px, doc height 9033 vs 9034 |

Rounds (360 / 1440 / 2560): r0 — / 27.35 / — → r1 — / 26.55 / — → r2 — / 9.98 / — → r3 — / 4.20 / — → r4 8.10 / 2.91 / 1.79 → r5 **4.28 / 2.50 / 1.34**.
Served page gated twice (after the first push: 4.19 / 2.48 / 1.34; final, after the drawer fix: 4.19 / 2.48 / 1.34).
Leak table prototype vs served (23 wrappers, 1440 and 360): **0 differing lines** (the empty metadata section the pipeline leaves behind is hidden by the foundation rule from round 0, so even that known difference does not show). Served section table at 1440: every row
Δ ≤ 2 (the −7 / −17 anchors are the live spec's mid-reveal offsets, see the register), doc height 8222 = the prototype's. Served nav scroll
ladder and drawer click-state identical to the prototype's (`motion/nav-scroll-served-1440.txt`, `motion/click-served-drawer-1440.txt`).
`migration/` is `.hlxignore`d.

## Triage table

→ `REGISTER.md` (section → default content | block, shape, collection match, rows × cols, section style). Summary of the shapes and matches:

| block | shape | Block Collection match | rows × cols | instances |
|---|---|---|---|---|
| `hero` | simple | **hero** (media row · copy row); AP look is the block's CSS: 100vh video band, copy in the first third, pause control, parallax | 2 × 1 | 2 |
| `carousel` / `carousel (compact)` | container | **carousel** (one row per slide: picture · text); variant `compact` = 4.6 per view, default 3.2; the section's h2 + link are default content the decorate moves into the heading column | 18 × 2, 5 × 2 | 2 |
| `columns (lookbook)` | container | **columns** (1 × 3: picture stack · video + poster · picture stack) | 1 × 3 | 1 |
| `columns (teasers)` | container | **columns** (1 × 2, each column picture + h2 + p + link) | 1 × 2 | 1 |
| `columns (feature)` | container | **columns** (1 × 2: copy · picture or picture · copy; the geometry follows the cell order) | 1 × 2 | 2 |
| `header`, `footer` | fragments | **header**, **footer** (nav: brand · 3-level list · tools; footer: logos · language + h4/ul groups · social · legal) | — | 1 each |
| default content + section styles `indent`, `newsletter` | — | — | — | 2 sections |

No site-specific block name was needed: every composition fit a collection shape with the look in a variant.

## Lint

Step 2 (03:41, before any block existed): home **0 🔴, 3 🟡** — 2 × D1 `hero` "single-column, 2-row block holding only prose" (the Block
Collection hero shape; justified: the block builds the `<video>`, the pause/play control and the parallax from the authored link and copy),
1 × D4 three footer SVG logo references (batch-verified pure vector: 0 `data:` URIs). nav, footer: clean. Re-run at 04:20 after the one
document edit (footer link groups flattened from `<div><h4>…<ul>` to `h4 + ul` — a classless `<div>` inside a section is not default content
for the pipeline): same result. See LINT.md.

## Motion register

→ `REGISTER.md` (one row per interaction). Verified on the build and the served page: the navigation scroll state machine (down → bar out;
up → white sheet + black glyphs; top → transparent; ladder identical sample by sample, including the 0.1 s mid-transition read), the drawer
(1014 × 900, categories at 168 / 235 / 302 / 369, panel links 184 / 212, group title 272, important links 510 — the live offsets), the line-link
rule 48 → 12, the button hover rgb(117,117,117), the carousel arrows' hover, the footer link opacity 0.56, the nav icon and language link
hover rgb(191,191,191), the hero pause/play state, the parallax function. Decided-in without a live measurement: carousel swipe, social glyph
hover. Partial: the reveal effect (block-level `is-revealed` instead of per-line staggering — motion-compare: `opacity` parity, `transform`
timing 350 vs 600 ms). Decided-out: the drawer's language / currency panel, third-party class names (lazysizes, drawer / scroll-lock classes:
the 10 MISSING rows of motion-compare are names, their behaviours are the verified rows).

## Deviations register

→ `REGISTER.md`. The rows that cost pixels: picture renditions (the pipeline's vs the source's `size=` renditions — every photo band),
the heading line box (±2 on the two 3-line headings), the lookbook poster vs the video's t = 0.001 frame, text anti-aliasing. Rows that cost
rounds: Swiper `autoHeight` = tallest of the slides in view + 1 (two rounds), the carousel's 35 % / 65 % geometry (one round), the lookbook's
intrinsic image sizes defeating `aspect-ratio` (one round), the pipeline's `<p>` around a list item's label and link (drawer, served-only
check), media names with underscores previewing 404.

## Rounds and where the time went

Prototype rounds (harness → section table + pairing at 360 / 1440 / 2560 → CSS → gate at 1440; three widths once the tables were clean):
- **step 1** (03:08–03:38): probe-load at the three widths (geo redirect to `/ch/en/home`, OneTrust, header 0-height with a fixed bar, 0 shadow
  roots), probe-structure, content-dump + content-view (1440, 360), media-list, cap-probe (1920 module cap, probe 2560), three origin captures
  + the 1440 noise pair (0.00), live-spec at the three widths, scroll-probe, deep-probe at the three widths, motion-observe, hover-diff. Four
  instruments had to be written (below) because the dump held neither the lazy carousel cards nor the drawer panels, and the source splits
  every paragraph into one-div-per-line (the dump reads lines, not paragraphs). Media fetched (two sessions' renditions, the 1440 bytes kept),
  renamed (underscores → hyphens after a 404 on preview) and uploaded.
- **step 2–3** (03:38–03:42): triage table, `doc/build-doc.py` → three documents, lint 0 🔴 3 🟡, previewed 03:42.
- **step 4** (03:42–03:51): foundation (`styles.css` from the spec: body black, heading-1 with the serif `<em>`, line link, button, 1920 module
  cap, `indent` / `newsletter` styles), `fonts.css`, `scripts/icons.js`, five blocks.
- **r0** (03:52) 27.35 / Δh +506 at 1440: the tables named the heading line boxes (block `<em>` with a 49.8 line-height vs the source's 58 px
  inline lines), the carousel heading column (a negative margin resolved against the grid area), the lookbook grid (intrinsic image heights
  defeating `aspect-ratio: 2 / 1`), the footer link columns (margin-left from a float's edge, −215), the text-image copy colour.
- **r1** (03:57) 26.55: section rows within 31 at 1440, 5 at 2560; the 360 table measured half-loaded images (665 short) — timing noise of
  six parallel sessions; the carousel wrapper's right gutter, the hero's gutters (the band was 1255 wide: a wrapper cap on a full-bleed block),
  the indent margins collapsing.
- **r2** (04:00) 9.98 / Δh −31: the gate's build capture showed blank picture cells (the aem.page renditions generated on first request) —
  every media URL pre-warmed; the carousel `li` as `list-item` added a 24 px marker line.
- **r3** (04:04) 4.20 / Δh −7: Swiper `autoHeight` read (tallest slide in view), 360 within 3 px, 2560 within 5.
- **r4** (04:07) **2.91** / Δh +2 / 360 8.10 / 2560 1.79: the serif line-height 47.8 → heading boxes 114 = live; every 1440 row within 2 px →
  **code pushed 04:08:05, sync polled 04:08:22, first shareable URL**. The 360 gate found the services carousel 49 short (autoHeight counts
  the slides in view + 1), the lookbook's right stack inverted (landscape over portrait).
- **r5** (04:13) **4.28 / 2.50 / 1.34**: stop rule reached (every row ≤ 3 px at the three widths; residual bands named: renditions, heading
  metrics, anti-aliasing). Pushed 04:14.
- served (04:14–04:25): gate 4.19 / 2.48 / 1.34 = the prototype; the leak table and the drawer click-state found the drawer's labels empty on
  the served page only — the pipeline wraps a list item's own text and link in `<p>` when the item holds a nested list (METHOD step 5 names
  it; header.js now reads the label through the `<p>`); drawer rows then at the live offsets; pushed 04:19, re-gated.

Time (≈ 80 min wall): measurement ≈ 40 % (the three-island page needed four case instruments and a WAF detour), triage + documents + lint
≈ 5 %, blocks ≈ 12 %, gate rounds ≈ 25 % (6 harness rounds, none void, 1 regression — r4's 360 autoHeight), deploy + served gate + leak +
registers + report ≈ 18 %.

## Instruments written

Under `migration/cases/home/scripts/` (stardust-lite did not have them):
- `content-full.mjs` — innerText-free full-text dump: the source splits every paragraph into `.js-reveal-effect-line` divs (one DOM element
  per rendered line, hidden until revealed) and `content-dump` reads lines, `innerText` reads '' on the unrevealed ones; this joins the top-level
  line divs per paragraph with a space, reads every card of every carousel (18 + 5, the lazy ones with their `data-src` renditions), the
  text-image / hero copy as one text, the lookbook cells with their video, the drawer's links and the bar's tools with their SVGs. `--out`.
- `nav-dump.mjs` — the off-canvas drawer: opens it, clicks each of the four categories, dumps the visible panel (links, group titles, boxes,
  fonts) and the drawer geometry, one screenshot per state (`--shots`). The sibling of ibm-home's nav-dump (site selectors).
- `nav-scroll.mjs` — the fixed bar's scroll states on a ladder down and up: class list, the white sheet's transform, icon / logo / burger colour,
  bar height, plus a 0.1 s mid-transition sample; `--nav --bar --bg --icon --logo --burger` selectors so the same ladder reads the build and
  the served page (`scroll-probe` reads the layer's class list and background, and the paint here lives in a child and in the glyph colour).
- `doc/build-doc.py` — the document generator from the three dumps (full text, drawer, content-view footer).

## What METHOD.md got wrong or left out

1. **A paragraph is not what the DOM says.** Pages with text-reveal libraries split every paragraph into one element per rendered line
   (`.js-reveal-effect-line`), and `content-dump` / `content-view` print one line per element while `innerText` of a not-yet-revealed line is
   empty. The authoring input needs a paragraph-level reading (join the top-level line children with a space); `content-view` should flag a
   run of same-font sibling divs as one paragraph. Cost here: a case instrument before step 2.
2. **Lazy content beyond the viewport is not in the dump.** A carousel holds 18 cards, the dump holds the visible 2–3 with text and the rest
   with 42 px placeholders and no `src`; `media-fetch` then fetches only the loaded renditions. Step 1 should say: read the *authoring* set
   (every card, from `data-src` / the DOM), not the painted set, and `media-fetch` should take the lazy attributes.
3. **Media names: underscores and dots preview 404.** `da-put` uploads `musee_hp-2.jpg` 201 and the branch previews it 404; the same bytes as
   `musee-hp-2.jpg` preview 200. `media-fetch` lower-cases and collapses hyphen runs (#74) but keeps `_` and `.`; both should become `-`,
   and `da-put` should warn as it does for upper case and `--`.
4. **The live spec records entrance animations mid-flight.** `live-spec` reads boxes after `settle`, but the source's reveal transitions had not
   finished on the lower sections: links read 6–17 px low (`tf=matrix(…, 15.43)`), and `pair` reported −7 / −17 for rows that are within 2 px
   in the capture. The spec should record the transform with the box (deep-probe does) and `pair` should subtract it, or `settle` should wait
   out `transitionrun` events before reading.
5. **Swiper `autoHeight` is a measurable rule, not a height.** The carousel track is as tall as the tallest of the slides in view *plus the
   next one* (read from two widths where different cards set it); step 1's carousel guidance (walgreens / usta) measured the box only. A
   carousel row in the prerequisites: measure which slide sets the height at each width before writing the block.
6. **Parallel measurement sessions read half-loaded pages.** Six `sections` / `pair` sessions against the prototype at once produced a 360 table
   665 px short (pictures not loaded) one round and the right one the next; the gate's build capture showed blank cells until the aem.page
   renditions were generated once. Step 5/6: pre-warm every media URL of the document before the first gate, and run the tables two at a time.
7. **A negative margin to bleed a grid item resolves against the grid area, not the block.** `margin-right: calc((100% − 100vw)/2)` on the
   track item gave −301 instead of −92.5 (percentages of the containing block = the grid area). Step 4's "full-bleed with `margin: 0 calc(50% −
   50vw)`" holds for a block-level child; for a grid/flex item compute the width from the viewport (`calc(0.65 × min(100vw, cap) + …)`).
8. **`aspect-ratio` on a grid loses to intrinsic image heights.** A 2:1 grid of pictures grew to its images' natural heights (1137 vs 604) until the
   pictures were absolutely positioned (`min-height: 0` is not enough). Worth a line next to "percent geometry" in step 4.
9. **The pipeline's `<p>` around a list item's label and link reaches header.js only on the served page.** METHOD step 5 names the wrapping;
   the harness fold does not apply it (#39 says the two list rules are text only), so the prototype passed and the served drawer had empty
   category buttons. Fold the list-item rule in `harness.mjs`, or `--fragments` already serves the pipeline's plain.html — this run used it,
   so the *fragment* was the pipeline's, yet the prototype still passed: the drawer is hidden at rest, no table reads it. A click-state on the
   served page belongs to step 7's checklist.
10. **The WAF tier is per request pattern, not per session.** `curl` with the Chrome UA + Referer got 406 on every clientlib while headless
    Chromium kept getting 200; one probe-structure run read "no root" because the React islands had not initialised in that session. Step 1's
    "use `--headed` when the page blocks headless" should add: check the asset requests (fonts, CSS) separately — a 406 on a stylesheet is a
    WAF rule on headers, not a block on the browser.
11. `[case-specific]` The hero control's live text is a leaked i18n key ("Pause ap.commons.ui.comp.video.label"); `pair` lists it MISSING on a
    build with an `aria-label` only — a MISSING row for a control's hidden text is noise.
12. `[case-specific]` The footer's social icons are icon-font glyphs (`icomoon`, `::before` codepoints in a CSS chunk the DOM dump only links):
    `media-list` sees neither the glyphs nor the codepoints; the deep probe prints the `::before` content as an empty string (PUA glyph). The
    codepoints had to be read from the site's CSS by hand.

## Blocked

Nothing blocked. (Two instruments failed once and succeeded on retry: `probe-structure` twice read "no root" while the site's JS had not
initialised in that session; the DA media preview 404 was a naming rule, not an outage.)
