# dentsu.com home → EDS, blocks-first v2.6 — run report (2026-10-01)

Site: `aemcoder-adobe/sdt-dentsu`, branch `blocks-first` (main untouched). Content: DA `/drafts/home`, `/drafts/nav`, `/drafts/footer`
+ `/drafts/media/*` (14 images + the header logo, the source's own jpeg/png bytes), previewed on the branch only, nothing published.
Prototype: `migration/cases/home/proto/home.harness.html` served on :8962 (runtime harness page; `npx stardust-lite serve`). Served page
(first shareable URL, see "Rounds"): **https://blocks-first--sdt-dentsu--aemcoder-adobe.aem.page/drafts/home**
Source edition: the origin serves the **Switzerland** home page at `/` to this IP (server-side geo, `Accept-Language` ignored); that is
the page measured, authored and gated (REGISTER.md, first paragraph).

## Three-width table

Pixel %, cached origin captured once with `--settle` (`--consent '#onetrust-accept-btn-handler' --locale en-CH`), settle on both sides.

| width | noise floor (live vs live) | prototype (r6, final code) | served (same code, same documents) | Δh proto / served | notes |
|---|---|---|---|---|---|
| 360 | — (one capture; the page is deterministic from one IP, see 1440) | **4.88** | **4.98** | 0 / 0 | band 1800–2700 at 18.1 % is the Eurostar tile caught mid-fade in the live capture (deviations); 0–900 4.1–4.7 % = hero photo anti-aliasing under the veil + the OneTrust button; every section row Δ0/Δ1 |
| 1440 | **0.84** (two captures: every band 0.0–0.1 % except 3500–4500 at 3.0 / 6.1 % — the rellax parallax image read at another phase in each capture) | **2.21** | **2.21** | −2 / −2 | band 2250 at 11.5–11.7 % = the Heineken tile mid-fade on the live side; 4050 at 3.7–3.8 % = the rellax image torn across the 4500 chunk boundary (live noise floor 6.1 % there); the rest is photo renditions + text anti-aliasing; every section row within 2 px, doc 5507 vs 5509 |
| 2560 | 0.00 (the gate's cached origin vs the step-1 capture, every band 0) | **2.12** | **2.11** | −2 / −2 | cap-probe **PASS** (content cap 1200 module ×5, 380, full-bleed; shell fluid; 0 of 9 rows failed); same two residual bands (2250: 11.6 %, 4050: 4.4–4.5 %); every section row within 2 px |

Rounds (pixel % at 360 / 1440 / 2560, the base width gated between rounds): r0 tables only (doc +870 at 1440: hero wrapper capped
and padded, promise row still in its mobile column layout, header "Menu" 18 px) → r1 tables within 3 px at 1440 / 360 (2560 promise
picture +164) → r2 first gate 1440 **11.23** (cap-probe PASS) → r3 **4.07** (tile gradient painted under the picture) → r4
**5.39 / 2.21 / 3.94** (hero veil read from the luminance ratio; first three-width gate) → r5 5.99 / 2.21 / — (regression at 360: the
arrow gap wrapped the 280-wide button) → r6 **4.88 / 2.21 / 2.12**. Served page gated once: 4.98 / 2.21 / 2.11.
Leak table prototype vs served (24 wrapper rows, 1440 and 360): **identical, 0 differing lines (diff of the two tables empty at both widths)**. Served section table at 1440: every row within 2 px (Δ −2 chain from the promise panel, as on the prototype); the pipeline's empty metadata section is the 11th build section, hidden by the `:not(:has(> *))` rule.
Hidden states on the served page: menu panel (`click-state`: panel 1440 × 900 open, `aria-expanded=true`, body overflow hidden, "Who we are" 334 × 81 and "Our thinking" 352 × 81 buttons with their labels (live 336 / 354 × 81), 7 rows at y 100 / 179 / 260 / 340 / 421 / 500 / 579 = live), markets panel, deep hover diff identical to the prototype
(8 controls: header triggers opacity .8, dark buttons rgba(38,38,38,.5), footer underline, social opacity .5, white button and tile dead). motion-compare on the served page: 6 parity, 4 missing (class names), 0 extra, 5 advisory — the same verdict lines as the prototype.

## Triage table
→ `REGISTER.md` (section → default content | block · shape · collection match · rows × cols | section style). Summary: 10 live
sections → hero (BC **hero**), intro (default content, style `intro`), columns **promise** (BC columns), quote ×2 (BC **quote**),
cards **tiles** (BC cards, 6 × 2 with the CTA row `(empty) · link`), columns **feature**, cards **logos** + default head and closing
button (style `center`), header and footer as BC fragments. Every block is a Block Collection shape with the site's look in a variant;
no site-specific block name was needed. Configuration (section-metadata): `intro`, `center`. The hero's "Go to Introduction" link is
authored as the anchor it is (`#we-are-dentsu`); the block turns it into the chevron.

## Lint
Step 2, before any block existed: **home 0 🔴, 3 🟡** (D1 on `hero` and on both `quote` blocks: single-column one-row prose blocks —
the Block Collection shapes themselves, justified in LINT.md); nav, footer clean. The first run of the same document also showed one
🟡 D3 on `cards (tiles)` (the CTA row had one cell against the photo rows' two): fixed in the model before the checkpoint (empty picture
cell). Unchanged afterwards: the documents were not edited after the step-2 checkpoint (05:07); the harness re-ran the lint on every
round with the same 0 🔴 / 3 🟡 (`LINT.md`).

## Motion register
→ `REGISTER.md` ("Motion register"): per row verified / decided-out. motion-compare on the prototype (r4 = r6): **6 parity, 4
missing, 0 extra, 5 advisory, 7 dead-on-live**. The 4 "missing" are the source's class *names* (`m-active`, `m-global`, `m-hide`,
`m-modal-active`) against the build's (`menu-open`, `markets-open`, `nav-open`, `open`, listed as advisory) — the same panel slide,
hamburger X, label swap and body lock, verified with `click-state` on both sides. Deep hover diff (`hover-diff`, live and build,
11 controls): identical on every row — dark buttons' background, footer underline, social opacity .5, header triggers' opacity .8;
white button, tiles and hero arrow dead on both. The frame sampler reads the footer underline and the market trigger as "dead on live"
/ "extra on build": text-decoration and opacity on a small control are invisible to it (BACKLOG #19 class). Scroll motion: rellax
parallax on four elements reproduced by function (`scripts/parallax.js`), header static on both sides, hero chevron `arrow_bounce`
keyframes read with `css-props --anim` and reproduced; the tile fade-in entrance is decided out (0 px at rest; it is the live capture's
own artifact — deviations).

## Deviations register
→ `REGISTER.md` ("Deviations register"): 34 rows. The ones that carry pixels: the tile fade-in caught mid-flight by stitch-shot on
the live side (≈ 1.0 % of the page at 1440, ≈ 2.8 % at 360 — the largest residual, in both noise-floor captures so it is not noise
but the capture's state); the rellax parallax torn across chunk boundaries on both sides (band 4050: 3.8 / 4.5 %, the live noise floor
is 3.0 / 6.1 % there); photo renditions (pipeline `?width=2000/750` webply vs the source's `w=960` jpeg); the OneTrust floating button
in every chunk; the −2 px chain from the promise panel (an inline-block line box) at 1440 / 2560.

## Rounds and where the time went
Clock (CEST): start **04:47**; step 1 captures + measurement done 05:03; step 2 checkpoint — three documents previewed on the branch,
lint clean — **05:07** (20 min); blocks written 05:13; r0 harness 05:14; **r1 within 3 px on the 1440 / 360 section tables 05:19**
(32 min); first push 05:23, code sync triggered 05:24:52 and polled to 200 with matching md5 in **1 s** (05:24:53) → **first
shareable prototype URL https://blocks-first--sdt-dentsu--aemcoder-adobe.aem.page/drafts/home at 05:24:53 (37 min)**; r2–r4 gate
rounds 05:20–05:29; r5 regression 05:30; r6 final tables + three-width gate 05:33–05:40; final push 05:35:46 → synced in 11 s (05:35:59); served gate, hidden
states, leak tables, registers and report → 05:42. Wall 04:47 → 05:42.

Where the time went: measurement ≈ 30 % (the parallax function from the scroll ladder, the sprite inventory, two css-props passes for
the rules deep-probe does not print — flex basis, fixed heights, animations, background-size); triage + documents + lint ≈ 10 %;
blocks ≈ 15 %; gate rounds ≈ 30 % (six harness rounds, none void; r1 was the first table round, r2 the first pixel gate; two rounds
went to things no table shows — a veil that does not paint on one side of 900, a gradient under a picture — found by crops and a
luminance ratio); deploy + served gate + registers + report ≈ 15 %.

- **r0** (tables, no gate): doc +870 at 1440, +1486 at 2560, +20 at 360. Named: `.hero-wrapper` / `.quote-wrapper` rules lost to the
  boilerplate's `main > .section > div` specificity (hero in a 1180 centred box, quote 1180 not 1200); the promise row kept
  `flex-direction: column` from the generic columns rule (picture 16:9 full-width, panel below); hero section carried the 60 px rhythm;
  "Menu" 18 px; menu panel links inline-block (+4 px); market trigger icon took the span's margin.
- **r1**: 1440 / 360 within 3 px (Δh −2 / 0); 2560 promise +164 (the picture stretched to 55 vw × 16:9 = 792 tall where the source
  keeps its natural 540). First shareable prototype pushed on this code.
- **r2** first pixel gate 1440: 11.23 — hero band 10–13 % (no shift, no scale: `shift-probe`), tiles 37–57 % (gradient on `li::after`
  painted under the `a`'s picture), cap-probe PASS.
- **r3**: 4.07 — gradient moved into the link's stacking context; header icon gap. Hero still 10 %: luminance ratio live/build 1.25
  in every hero region → the source's rgba(0,0,0,.2) `::after` at z −1 does not paint over the photo at 1440.
- **r4**: 2.21 / 5.39 / 3.94 — veil removed; three widths + probes. 360: hero darker on live (ratio 0.80 → the veil paints *below*
  900), promise picture 8:5 fill at 360, Eurostar tile mid-fade in the live capture; 2560: promise picture must stay 960 × 540.
- **r5**: 2.21 at 1440; **regression** at 360 (5.99, Δh +23): a 9 px arrow gap for the inline-block button wrapped the 280-wide flex
  button. The gap belongs to the inline-block kind only.
- **r6** final: 4.88 / 2.21 / 2.12; section tables within 2 px at the three widths (Δh −2 / −2 at 1440).
- Served: one deploy. served 4.98 / 2.21 / 2.11 against the prototype's 4.88 / 2.21 / 2.12 (the 360 Δ 0.10 is the hero band: 4.1 → 4.7 %, the pipeline's webply hero rendition against the prototype's original jpeg); leak tables identical at 1440 and 360 (24 rows each); no served fix was needed — the pipeline's list-item `<p>` rule had already been met in the header decorate on the prototype (round 5, found by `click-state` on the build).

## Instruments written
Under `migration/cases/home/scripts/` (stardust-lite did not have them):
- `css-props.mjs <url> <W> --sels <file> --props <p1,p2,…> [--anim]` — any computed property per selector (min-height, height, width,
  flex, background-size/position, object-fit, letter-spacing…) plus the element's running animations with their keyframes
  (`getAnimations()` + `effect.getKeyframes()`). deep-probe prints a fixed property set; this run needed flex bases (`1 0 33.3333%`,
  `0 0 25%`, `1 0 40%`), a fixed `height: 178px` on logo cells, `background-size: cover` vs `auto` (the tile `li` carries the same
  picture as a repeating `auto` background under its `img`), and the hero chevron's `arrow_bounce` keyframes.
- `svg-dump.mjs <dom.html> --out <dir> --pick 'id[:fill[:name]],…'` — lifts the sprite `<symbol>`s a page uses out of the live-spec
  DOM dump into standalone SVGs with the measured fill baked in (img-based `decorateIcons` cannot inherit colour). 10 icons here.
- `shift-probe.mjs <live.png> <build.png> --x0 --x1 --y0 --y1 [--r] [--scale]` — is a red photo band a displacement, a scale or
  another rendition? Searches ±R px (and scales 0.90–1.10) for the best mean |Δluminance|. Here: hero 1440 "no shift, no scale"
  (→ a veil), tiles "no shift" (→ a gradient / a fade state), Eurostar at 360 "no shift" (→ fade state).
- `sbs-crop.mjs <live.png> <build.png> <out.png> --x0 --x1 --y0 --y1` — the same x/y window of two captures side by side at 1:1
  (`crop` cuts y bands of one image). The Heineken tile's stitch seam and the promise picture's natural-size cap were read from it.
- A luminance-ratio reading (inline node, pngjs): mean RGB of live vs build per region — the one measurement that named the hero veil
  (1.25 at 1440, 0.80 at 360). Not promoted to a script; `shift-probe` could print it.

## What METHOD.md got wrong or left out
1. **A pseudo-element veil at negative z-index is not a measurement of paint.** `deep-probe` prints `::after rgba(0,0,0,.2) z=-1` and
   the method's step 4 says CSS values come from step 1 — but whether that veil paints over the photo depends on what else sits in the
   stacking context (here a `.full-bg-video` layer above it at ≥ 900 and nothing below 900). Two gate rounds. A paint reading must be a
   *pixel* reading when z-index is negative: compare mean luminance live vs build over the element (the ratio names the veil and its
   alpha). Generic; `shift-probe`/`deep-probe` could print the region ratio.
2. **"No shift explains it" needs an instrument.** A red photo band has four causes — displacement, scale, rendition, paint over it —
   and the pixel diff shows all four the same way. The method's step 6 says crop the hottest band; a crop shows red. `shift-probe`
   (±R px, ±10 % scale) and a side-by-side 1:1 window settled three bands in one run each. Generic.
3. **The live capture's own entrance state is a residual class the register lacks.** stitch-shot's 450 ms chunk wait (BACKLOG #9)
   catches a tile that straddles a chunk boundary mid-fade — deterministically (both noise-floor captures agree, so the noise floor
   does not show it). It is neither a session-variable region nor a build artifact: it is the *capture's* state of the live page, and
   it is the largest residual here (≈ 1 % at 1440, ≈ 2.8 % at 360). Name it in the register kinds and in step 6's residual list
   ("a scroll-triggered entrance caught mid-flight on the live side"). Generic.
4. **Scroll-linked transforms are torn by the chunked capture on both sides.** A rellax element that spans a chunk boundary is drawn at
   two different offsets in one stitched image (live and build alike), and two live captures disagree there (3.0 / 6.1 %). The method's
   prerequisites say "scroll states and motion measured before code"; it should also say the capture tears them and that the function
   (not the rest offset) is what to reproduce — the rest offset of a `percentage: 0` rellax element is set at init time by the page's
   own load-time layout (62 here), so it is a measured constant, not derivable. Generic.
5. **Geo editions without a redirect.** The prerequisites cover a geo *redirect* and a geo *modal*; this origin serves another edition
   at the same URL by IP, ignores `Accept-Language`, and `--locale` changes nothing. Step 1 should say: `curl` the page with two
   `Accept-Language`s and from the browser, compare titles / a market marker, and record which edition `/` is for this operator — the
   case migrates that edition. Generic.
6. **The pipeline's list-item `<p>` rule reaches the header decorate.** BACKLOG #86 names it for a drawer; here `header.js` read text
   nodes for the expand button label and the pipeline's `<li><p>Who we are</p><ul>` left the button empty on the prototype — found only
   by `click-state` on the build (the pair lists hidden anchors as MISSING either way). Step 5's wrapping list should say "and read `p`
   children wherever a decorate reads an item's own text". Generic.
7. **Lint `--fix` lower-cases font-family names** (`Halcom-Regular` → `halcom-regular`): harmless to rendering (family matching is
   case-insensitive) but `pair`'s font column then reads a change on every row ("Halcom- → halcom-") after the boilerplate's
   `npm run lint:fix`. Either `pair` compares families case-insensitively or step 4 says to quote the family names. Generic (every
   boilerplate repo has this stylelint config).
8. **The whitespace gap between an inline label and an inline icon is a measurement** (≈ 4.4 px at 16 px) that no table prints: the
   source's `inline-block` button is 4 px wider than a flex build of the same padding + icon, and the same gap does *not* exist in the
   source's `display: flex` buttons. One regression round (the flex button wrapped). Step 4 could say: read `display` of the control
   and its children before copying its padding — an inline formatting context carries word spaces. Generic.
9. `[case-specific]` **The intro section's 195 px bottom padding at 360 exists for the next module's overlapping picture** (−200 px
   absolute). A 0-height spacing section would have been flagged by `live-spec`; a *padding* that belongs to a neighbour is not. The
   section style `intro` carries it; the register says why.
10. `[case-specific]` **Natural-size cap above the base width.** The promise picture is `max-width: 100%` of a 55 vw column: 792 wide
    at 1440 (looks like "55 vw"), 960 at 2560 (its natural width). Step 4's "re-read every spacing and cap at the probe width" covers
    it; the reading that caught it was the 2560 side-by-side crop, not a table (the section table said +164 and the pair said nothing
    about the picture).
11. **`gate` caches the origin per `--out` dir**: a served gate in another dir recaptures the origins (a new noise sample); copying the
    `live-*.png` into the second dir keeps one origin for prototype and served. Say so in step 7. Generic.

## Blocked
Nothing was blocked. The DA token stayed valid (refreshed at start, 2 h 57 m left; checked before each admin batch), headless Chromium reached the origin at every width (status 200, no bot challenge), the branch code sync answered 202 and served the pushed files in 1 s and 11 s.
