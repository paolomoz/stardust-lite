# hiltongrandvacations.com home → EDS, blocks-first v2 — run report (2026-10-01)

Site: `aemcoder-adobe/sdt-hiltongrandvacations`, branch `blocks-first` (main untouched). Content: DA `/drafts/home`, `/drafts/nav`,
`/drafts/footer` + `/drafts/media/*` (29 avif photos, 36 svg, 2 poster png, 2 Vimeo thumbnails — the source's bytes, avif unchanged),
previewed on the branch only, nothing published, no PR. Prototype: `migration/cases/home/proto/home.harness.html` served on :8947 (runtime
harness page). Served page: https://blocks-first--sdt-hiltongrandvacations--aemcoder-adobe.aem.page/drafts/home
Source: https://www.hiltongrandvacations.com/en — Angular SPA (light DOM; the 21 shadow roots hold no content), Osano consent bar
(`--consent button.osano-cm-accept-all`, no reload), no geo modal, `--locale en-US` on every instrument, headless Chromium gets the page.

## Three-width table

Pixel % against the cached origin (captured once with `--settle`, consent accepted; settle on both sides; `gate --origin gate` so the served
gate compares against the same capture). Noise floor = two 1440 origin captures.

| width | noise floor (live vs live) | prototype (r5) | served (r5) | Δh proto / served | notes |
|---|---|---|---|---|---|
| 360 | — (one capture kept; the page is deterministic except the hero video and two count-ups, see 1440) | **5.91** | **5.94** | +2 / +2 | band 0–900 17.7 % is the hero (a Vimeo loop frame vs the poster frame); 3600–5400 8 / 10.8 % are the offers photo rendition + the coverflow's scaled photos; 10800 9.3 % the footer's masked brand silhouettes (anti-aliased, 23 px); every section row within 2 px |
| 1440 | **0.10 %** (bands 0–500 1.4, 500–1000 0.7 — the hero video frame; every other band 0.0) | **2.76** | **2.76** | +1 / +1 | section table: all 11 rows within 1 px, doc 10123 vs 10124; residual = hero frame (15.4 / 12.0 % in bands 0–900), the "720,000" count-up caught at another intermediate value (band 5400 4.0 %), photo renditions, footer silhouettes (9450 4.2 %) |
| 2560 | — | **3.29** | **3.28** | +1 / +1 | cap-probe PASS 11/11 (modules 1440 ×6, heritage 1168, hero and footer full-bleed); residual = the hero poster (1440 px wide, scaled to 2560: 28 / 16 / 13 % in bands 0–1350) |

Rounds: r0 (first harness, no gate: tables only) → r1 6.61 / — / — → r2 4.23 (1440 only) → r3 6.33 / 3.01 / 5.52 → r4 6.27 / 2.76 / 4.24 →
r5 **5.91 / 2.76 / 3.29**. Served page gated twice (r4, r5): 6.30 / 2.76 / 4.23 → **5.94 / 2.76 / 3.28**. Leak table prototype vs served (14
wrapper selectors, 1440 and 360): **identical, 0 differing lines**, without a served-only fix. Served section tables: 1440 all rows within 1 px
(doc 10123), 360 doc Δ+2, 2560 doc Δ−1. Hidden states on the served page: drawer open 416×900 with the five 70 px rows and the language row
at the measured boxes, `aria-expanded=true`; hover-diff on the served page = the prototype's rows (13 changed-property rows, same values).

## Triage table

(full table with default content, shapes, collection matches and rows × cols in `REGISTER.md`)

| # | live section | default content | block · shape · Block Collection match | section style |
|---|---|---|---|---|
| 0 | fixed header, hamburger drawer | nav doc (brand · list · tools) | `header` · BC header (fragment) | — |
| 1 | Vimeo hero, h1, pill, "Scroll to Explore", "Pause" | **all default content** (posters, player link, h1, bold link, label) | `hero (video)` auto-blocked · simple · BC hero | — |
| 2 | centred statement + two pill columns + uppercase line | h2, closing p | `columns (intro)` · container · BC columns · 1 × 2 | `intro` |
| 3 | count-up + map · "Trending Destinations" tabs card | p (badge) | `ticker` · simple · site-specific (no collection shape) · 5 × 1; `tabs` · container · BC tabs · 3 × 2 | `destinations` |
| 4 | offers slider (5 photo + card slides) | — | `carousel (offers)` · container · BC carousel · 5 × 2 | `navy` |
| 5 | resorts coverflow | h2, p | `carousel (coverflow)` · container · BC carousel · 5 × 2 | `grey` |
| 6 | Hilton logo, "105+ Years", p | all default content | — | `heritage` |
| 7 | count-up on a photo + 3 quote cards + "View All" | closing p link | `ticker` · 4 × 1; `cards (quotes)` · container · BC cards · 3 × 2 | `stats` + `background` |
| 8 | "#myHGV" head, social links, 5-tile swiper | h2, p, 5 picture links | `carousel (social)` · container · BC carousel · 5 × 2 | `social` |
| 9 | newsletter form | h2, p, em p | `signup-form` · container · site-specific (BC form takes a JSON link) · 5 × 2 | `signup` |
| 10 | footer (inside the source's main) | footer doc (4 sections) | `footer` · BC footer (fragment) | — |

Blocks written: `hero`, `columns`, `tabs`, `carousel`, `cards` (Block Collection names and shapes, the site's look as variants `video`, `intro`,
`offers` / `coverflow` / `social`, `quotes`), `ticker` and `signup-form` (site-specific, no collection shape), `header`, `footer`. The
boilerplate's `widget` block and `consented.js` are untouched but unused.

## Lint

Step 2 (before any block existed): home **2 🔴, 1 🟡**; nav 0 🔴 1 🟡; footer 0 🔴 1 🟡 (`LINT.md`). The two 🔴 are the same row kind — the
social carousel's two video tiles carry the Vimeo player URL as a titled link in the tile's row, the model METHOD step 2 prescribes and
BACKLOG #13 (open) says the lint does not accept yet; cited, not re-solved; the harness ran with `--no-lint`. Three real 🔴 in the first
draft were fixed before preview (hero as a block with the player link → default content + auto-block; a picture as a section-metadata value
→ a URL; a one-cell title row in the tabs block → the section's paragraph). The 🟡 (SVG media) were checked: no raster data URI. Changed
afterwards? No: the document was regenerated once (ticker + tabs folded into one `destinations` section) with the same lint result.

## Motion register

(full table in `REGISTER.md`)

| row | status |
|---|---|
| outline pill hover → rgba(32,43,70,0.1); white outline pill → rgba(255,255,255,0.15); carousel arrow → navy/white inversion; text links → rgb(158,162,173); play icon opacity .8 → 1; footer link underline; quote card label underline | **verified** — hover-diff identical on prototype and served page |
| pink "Explore Offers" hover | build-only (the live probe read no change on its first match) — accepted |
| "Sign Up" submit hover → rgb(18,25,42) | verified on the prototype (same rule as the footer primary); hover-diff reads a `button` as "no change" |
| hamburger, user icon, social icons, tabs, "Explore Hawaii" | decided out — dead on live |
| header hides on scroll down from y ≥ 20, shows on the first upward step (scroll-probe ladder) | **verified**: the build's capture chunks below the first show no bar, like the live capture |
| count-ups: linear 0 → N in 3.75 s on entering the viewport (`scripts/ticker-ladder.mjs`) | reproduced; the capture catches another intermediate value (register row, 1.9 + 4.0 % at 1440) |
| hamburger click → 416 × 900 drawer, 70 px rows, language row | **verified** on prototype and served page (click-state, `aria-expanded=true`) |
| drawer item click → second panel | built; `click-state` cannot chain the two clicks (gap 9) — not verified |
| tab click, carousel prev/next, "Pause" | built (aria states, counters, captions checked against the five live captions); not frame-probed |

## Deviations register

(full table in `REGISTER.md`; the rows that cost pixels)

| source feature | decision | pixel cost |
|---|---|---|
| Vimeo autoplay hero in an iframe (two videos: desktop / mobile) | poster of the frame the live page shows at load (`scripts/hero-poster.mjs`) + the player link; "Pause" rendered as the control | **rotating region**: 15 / 12 % (1440 bands 0–900), 28 / 16 / 13 % (2560), 17.7 % (360) — ≈ 80 % of every width's number |
| alternate cross-fading hero headline | decided out (one h1; the capture shows headline 1) | 0 |
| count-up numbers 200 / 720,000 caught mid-flight by the chunked capture | same linear function in ticker.js | **live entrance caught mid-flight**: 1.9 % + 4.0 % at 1440 |
| Font Awesome Pro glyphs (licensed kit; `::before content=""` to the probe, BACKLOG #90) | 11 svg icons drawn to the measured glyph boxes | ≈ 0 |
| Contentful avif renditions | uploaded unchanged; DA stores and serves `image/avif` (301 → `media_<hash>.avif`) | renditions ≈ 1–2 % in photo bands |
| social video tiles show the Vimeo poster at 1037 px in a 576 box | oEmbed thumbnail at 180 % | ≈ 0.5 % |
| sliders clip at content edge + gutter (1304 at 1440, 2000 at 2560) | `.carousel-viewport { width: calc(100% + gutter) }` | 2560 band 3600 22.2 → 2.4 %, 7650–8100 10 / 13 → 0.3 / 0.4 % |
| offer cards at 360 are a fixed 378 (slick equal heights; slide 5 overflows) | the one pinned height, mobile only | 0 |
| footer brand logos as `mask-image` silhouettes; 360 rows 3/5/5/5/5/3 at ≈ 23 px | masked boxes, 1 px rules through the two Hilton logos | 4.2 % (1440 band 9450), 9.3 % (360 band 10800) — silhouette anti-aliasing + the 360 row packing |
| keyboard-shortcuts help button (fixed, every chunk) | decided out | ≈ 0.1 % |
| the 1733 px container cap-probe reads around the ticker row at 2560 | not reproduced (content in the same 1168) | 0 (cap-probe PASS) |

## Rounds and where the time went

Clock (`measure/clock.txt`): start **05:56:16**. Step 1 measurement done 06:37 (41 min: probe-load ×3, structure, content dump + view,
media list + fetch, live-spec ×3, cap-probe, 4 origin captures, scroll-probe, hover-diff, deep-probe, nav drawer, tab panels, carousel captions,
count-up ladder, hero posters). Step 2–3 documents previewed on the branch **06:41:53** (45 min). Blocks written 06:42–06:55. r0 harness
06:57. **First shareable URL: 07:13:28** — code pushed when the section tables were within 3 px at 1440 and 2560 and within 3 px at 360
except the footer (+10); the code bus served the pushed files **13 s later** (07:13:41, `sync-poll`; the explicit trigger POST returned 404
but the push synced on its own). Served page gated 07:25 (r4) and 07:40 (r5). Report written 07:45. Wall ≈ 110 min to the final gate.

- **r0** (tables only, no gate): doc 10761 vs 10124. The tables named: every paragraph bold (the body inherited weight 400 — Gotham's 400 is
  Bold), tab panels all visible (`display:flex` beat `[hidden]`), an empty `<p>` left in the hero and tabs cells after the picture moved
  (shifting the headline 15 px and the tab text 32 px), the footer's CTA / brand sections lost (the fragment's default content is wrapped in
  `.default-content-wrapper`; `:scope > p` found nothing), the intro cap applied to the wrapper including the gutter (304 px content).
- **r1** 6.61 % at 1440, Δh −23: controls without icons (`decorateIcons` runs before the block decorate creates the spans), offers title
  white on white (the navy band's `h3 { color: white }` reached the card), footer logos at a guessed ratio (`naturalWidth` 0 at decorate time),
  "Scroll to Explore" 14 px low (bar `align-items`), tab link padding on the `p` not the `a`.
- **r2** 4.23 %: the above; the ticker + tabs band folded into one authored section (cap-probe pairs modules by section order — PASS from
  here); cards' "View All" and resorts' link as 13 px boxes.
- **r3** 6.33 / 3.01 / 5.52: offers card height at 360 (slide 5's four-line title made the track 400), caption widths, signup spacing per width.
  Section tables within 3 px → **first push**.
- **r4** 6.27 / 2.76 / 4.24: control icons decorated after the controls exist, offers viewport clipped at content edge + gutter (2560 band
  3600 22 → 2.4 %), caption and "View All" link boxes, footer legal line boxes desktop-only. Served gate 6.30 / 2.76 / 4.23, leak 0 lines.
- **r5** 5.91 / 2.76 / 3.29: social viewport clipped the same way (2560 bands 7650–8100 10 / 13 → 0.3 / 0.4 %), footer brand row measured
  at 360 (`deep-probe` on the live logos: rows of 3/5/5/5/5/3 at 23 px, 72 above). Served 5.94 / 2.76 / 3.28. Stop rule: every section row
  within 2 px at the three widths; the residual bands are the hero frame, the count-ups, renditions and silhouettes — named above.

Time split: measurement ≈ 37 %, documents + lint ≈ 5 %, blocks ≈ 12 %, harness/table/gate rounds ≈ 36 % (r0–r2 were the three rounds that
cost most: a font-weight mapping and three decorate-order mistakes no table could name until the first harness), deploy + served gate +
registers + report ≈ 10 %.

## Instruments written

Under `migration/cases/home/scripts/` (stardust-lite did not have them):
- `hero-poster.mjs <url> <W> <out.png> [--consent css]` — the hosted-video poster for an **iframe** player: screenshots the hero box at load
  with the veil, text and controls hidden. `video-frame.mjs` takes a `<video>` selector and crashed on the Vimeo iframe (exit 1 at line 15).
- `ticker-ladder.mjs <url> <W> <sel>` — scrolls a count-up into view and samples its text every 100 ms: duration and easing of the live
  counter (linear, 200 in 3.75 s), the function the block reproduces and the reason the capture shows 52.
- `click-dump.mjs <url> <W> --panel <css> [--open <css>] --click <css>…` — clicks a sequence of controls and dumps a panel's texts, hrefs and
  images after each: the five resort captions (only the active one exists in the DOM), the Florida / Las Vegas tab panels, the drawer's
  sub-menus. `click-state` takes one click and prints geometry; `content-dump` holds the authoring set at rest only.

## What METHOD.md got wrong or left out

1. **Hosted video in an iframe has no poster instrument.** The prerequisites row says `video-frame.mjs` (the player paused at t = 0 at 2×)
   and the script requires a `<video>` element; a Vimeo/YouTube iframe — the common hosted case — crashes it. `hero-poster.mjs` (hide the
   overlay/text, screenshot the box) is the generic reading; `video-frame` should accept an iframe box and the elements to hide.
2. **A count-up number is a motion with its own instrument gap.** The live capture shows an intermediate value (52 of 200) deterministically
   (both noise-floor captures agree); neither `motion-observe` nor `scroll-probe` reads a text that changes with time. `ticker-ladder.mjs`
   (sample a text every 100 ms after scrolling it into view) belongs next to `scroll-probe`; the register kind is "live entrance caught
   mid-flight" (#93) but the METHOD text names only transforms and fades.
3. **The content dump misses `<header>` elements inside `main` and lazy/offscreen slide captions.** `content-dump` skipped the hero's `header`
   (h1, button) and `spec-view` omits `header` tags: the hero texts had to be read from `live-spec`'s items and the DOM; a Swiper caption
   that exists only for the active slide, a tab panel behind a tab and a drawer's sub-menu are hidden *content* the dump does not hold.
   `harness --content` then lists 23 correctly authored texts as "not in the capture". A click-sequence dump (`click-dump.mjs`) should be a
   step-1 instrument and its output a second `--content` source.
4. **Font weight mapping is a measurement, not a default.** The site's Gotham maps 325 = Book, 400 = Bold; the boilerplate's `body` has no
   weight, the browser's 400 picked Bold and every paragraph wrapped one line longer — three table rounds. Step 4 should say: set
   `body { font-weight }` from the spec's body row; `pair` flags the row (`325 → 400`) but the first harness is where it surfaces.
5. **Block decorates that add `.icon` spans must decorate them.** `decorateIcons(main)` in `decorateMain` runs before any block decorate;
   spans a block creates (arrows, hamburger, play) stay empty until the block calls `decorateIcons(block)` itself — and a `decorateIcons` call
   placed before the controls are appended decorates nothing (r3 → r4). Step 4 should name it next to the `:icon:` fold (#5).
6. **Fragment sections are wrapped before the header/footer decorate reads them.** `loadFragment` runs `decorateMain` → default content sits
   in `.default-content-wrapper`; a decorate that reads `:scope > p` of a fragment section finds nothing (the footer lost its CTA and brand
   sections in r0). Step 5's "pipeline wrapping" list should include the runtime's own wrapper.
7. **`[hidden]` loses to any `display` rule.** Panels, drawers and captions a block hides with the `hidden` attribute reappear as soon as
   their class sets `display: flex/grid`; the tabs section was 1531 px tall in r0. A `[hidden] { display: none !important }` reset belongs in
   the step-4 foundation list.
8. **cap-probe pairs modules by section order, so the authored section count must equal the source's.** Splitting one source band (ticker +
   tabs card) into two authored sections shifted every later pairing by one and failed 4 of 11 rows; folding them into one section passed
   11/11. Step 2 should say: one authored section per source section, even when it holds two blocks and two backgrounds (a gradient).
9. **`click-state` cannot reach a control inside a closed panel.** A drawer item's sub-panel needs two clicks (open, then the item); the
   probe takes one click and `--hover`. A `--click a --click b` sequence (what `click-dump.mjs` does) would verify nested hidden states.
10. **The lint and step 2 disagree on video links in rows** (BACKLOG #13, still open): the method prescribes the model the lint refuses, so
    every case with a video tile runs the harness with `--no-lint`. Either the lint accepts the row or step 2 names the exception.
11. `[case-specific]` **Slick / Swiper equal-height slides**: the mobile offer cards are 378 px for every slide while slide 5's content
    overflows — a fixed height the source's slider imposes, the one pinned box of this build (register row).
12. `[case-specific]` **`sync-poll --trigger` returned 404** for `POST admin.hlx.page/code/<org>/<site>/<branch>/*` while the push itself
    synced in 10–13 s on every round; the prerequisites say new branches did not sync on push in 2026-09 — not reproduced here.
13. `[case-specific]` **avif sources work end to end**: DA stored the Contentful avif bytes, the branch host 301s to `media_<hash>.avif` and
    serves `image/avif`; the media row says "webp stays webp" and could say "any format the pipeline serves (avif verified)".

## Blocked

Nothing blocked. Two items ran degraded and are recorded above: the drawer sub-panel could not be probed with `click-state` (gap 9; the drawer
itself was probed on both pages), and the hero poster came from a case script because `video-frame.mjs` rejects an iframe (gap 1).
