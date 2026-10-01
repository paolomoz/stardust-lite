# www.usta.com/en/home.html home → EDS, blocks-first v2.4 — run report (2026-10-01)

Site: `aemcoder-adobe/sdt-usta2`, branch `blocks-first` (main untouched; the v1 pilot `sdt-usta` untouched). Content: DA `/drafts/home`,
`/drafts/nav`, `/drafts/footer` + `/drafts/media/*` (75 files = the bytes the live page serves), previewed on the branch only, nothing
published, no PR. Prototype: `migration/cases/home/proto/home.harness.html` on :8945 (runtime harness page, pipeline fragments).
Served page: https://blocks-first--sdt-usta2--aemcoder-adobe.aem.page/drafts/home
Clock (CEST): start 01:10:18; step-2 checkpoint (three documents previewed, lint 0 🔴 3 🟡) 01:33:12; **first shareable prototype +
served URL 02:09:30** (59 min: round 8's section table within 3 px at 1440 at 02:08, code pushed 02:09:11, code sync triggered and two of
the three polled files served at 0 s — the third, `styles.css`, had already been edited locally for round 9); final numbers 02:50 (100 min
wall).

## Three-width table
Pixel %, cached origin captured once with `--settle --consent '#onetrust-accept-btn-handler'` (no locale pin, no geo overlay), settle on
both sides; the gate compares every round against the same `gate/live-<W>.png`.

| width | noise floor (live vs live) | prototype | served | Δh proto / served | notes |
|---|---|---|---|---|---|
| 360 | — (one capture; the 1440 pair shows the page deterministic) | **9.51** (r17) | **9.52** | −12 / −12 | 0–2700 at 2.7–11.5 % (mobile hero/discover photo renditions, the clipped promo line, the ad); 2700–7200 at 2–11 % (text anti-aliasing, renditions); **8100–11500 at 11–17 %** = the registered −15 px chain from Safe Play course card 3 (per-instance separator) through the help cards and the footer; every section row within 2 px above it |
| 1440 | **0.00** (two captures, every band 0) | **1.89** (r14; rounds 15–17 changed mobile and ≥ 1920 rules only — the 1440 section table is Δ0 on every row and the leak table is unchanged) | **1.90** | 0 / 0 | all 19 live rows paired Δ0 (doc 6733 = live); residual = photo renditions (hero, tiles, news, courses), the ad creative in the fresh live capture (5850 band 3.3 %), text anti-aliasing, the Usablenet/chat layers in every chunk |
| 2560 | — | **4.17** (r15) | **4.17** | −3 / −3 | cap-probe **PASS 0 of 13 rows** with the live content root pinned (`--main '#non-logged-in-section > .aem-Grid'`); every section row −3 (the hero copy card is 545 vs 548); bands 450–1350 at 4–6 % (hero photo and tiles scaled to the 1920 cap, promo rows −7…−21), 4050/5850 at 6 % (news photos, footer badges) |

Rounds (pixel % 360 / 1440 / 2560; tables-only rounds marked t): r0 t (header offset doubled: +244 everywhere) → r1 t (−43; box-sizing
of the 1200 caps, topic grid split) → r2 t → r3 t (BACKLOG #8 found: picture-first cells wrapped into one `<p>`) → r4 t (documents regenerated
with `<p><picture>`) → r5 t → r6 t → r7 t → **r8 t: 1440 every row ≤ 2 px → push 02:09** → r8 gate — / 4.06 / — → r11 22.8 / 3.49 / 9.9
(uppercase news, wheelchair bg outside the cap, 2560 footer) → r12 29.6 / 3.64 / 7.26 (a −24 localize chain at 360; 2560 bars fixed) →
r13 20.1 / 3.64 / 7.26 (360: the live header is not fixed at 360 — read from the capture) → r14 — / **1.89** / 6.62 (a mobile `min-height`
regression at 360) → r15 11.36 / — / **4.17** → r16 9.74 → r17 **9.51**. Served: 11.37 / 1.90 / 4.17 after push 4, 9.52 at 360 after
push 6 (mobile-only rounds). Leak table prototype vs served (32 wrappers, 1440 and 360): **0 differing lines**. Served section tables at
the three widths identical to the prototype's, row by row (15 vs 14 build sections: the pipeline's empty metadata section, hidden by the
`main > .section:not(:has(> *))` rule, METHOD step 7). Click states on the served page: mega panel 1440×396 at y 214 (live 390), mobile
menu 8 rows. `migration/` is `.hlxignore`d.

## Triage table
In `REGISTER.md` (section → default content | block, shape, collection match, rows × cols, section style). Summary: 19 live sections → 12
authored sections + metadata; blocks `hero (campaign)` (BC hero), `cards` (`discover`, `benefits`, `news`, `help` — BC cards), `columns`
(`promo`, `safe-play` — BC columns), `header`, `footer` (BC fragments); site-specific `promo (membership)` (simple, 4 × 1 — a text promo
box BC has no shape for), `event-search` (key-value 3 × 2 — a form), `ad` (key-value — a third-party slot per METHOD); default content:
Discover head, Localize banner, Recommended Events, the coaching band, five topic titles (picture + h2), ledes, closing bold/italic links;
section styles `hero-band`, `discover`, `localize`, `topic` (+ `topic-teal`), `events`, `search-band`, `wheelchair`, `benefits`,
`coaching`, `news`, `safe-play`, `help`; configuration: `background` / `background-mobile` links on the localize section, `nav`, `footer`,
`title`, `description`.

## Lint
Step 2 (01:32, before any block existed): home **0 🔴, 3 🟡** (D1 hero — the BC hero shape, justified; D4 ×2 — 14 authored SVG
references, all previewed 200; 5 benefit logos embed raster data URIs and rendered identically), nav and footer clean. The first run
(01:31) had **2 🔴 D14**: the localize section's background pictures sat in section-metadata value cells — changed to links before the
checkpoint (a model fix, not a harness one). Unchanged afterwards through three document regenerations (standalone pictures wrapped in
`<p>`, one media rename); the harness re-ran the lint every round: 0 🔴, 2 🟡 on home.

## Motion register
In `REGISTER.md`. motion-compare (live vs prototype and vs served, same lines): **2 parity, 5 missing, 0 extra, 1 advisory**; verified per
row with `hover-diff` / `click-state` on live, prototype and served: nav link hover (colour + 4 px, 300 ms), JOIN background, pill opacity
.7 + outline-width 3 px, news title / Read More colour (+ underline off), footer link colour, mega menu (hover opens, click pins; panel
1440×396), utility dropdowns (400 px panel), mobile menu (8 rows of 49). The sampler's "missing" rows are the live's `lazyloaded`
class churn, `transition` events it attributes to no element, and the Read More / footer hovers it reads as dead on the build while
`hover-diff` shows the identical colour change on both sides (BACKLOG #42). Decided out: header on scroll (no state on live — scroll-probe),
tile / benefit / course / SEARCH hovers (dead on live), banner close, language switcher, location predictions, search panel, geolocation
(widgets; hooks authored).

## Deviations register
In `REGISTER.md` (32 rows). The ones that carry the residual: the **360 per-instance separator** on Safe Play card 2 (−15 px chain below it,
≈ 4 of the 9.5 % at 360); the **promo widget at 2560** (rows −7…−21 inside the card) and the hero copy card −3 at 2560; **renditions** of
every photo (the live serves its own scaled originals, the pipeline `media_*` renditions); the **ad creative** (session-variable, slot
reserved); the Usablenet accessibility toggle and the purple chat button in every chunk (≈ 0.2 % per width); the clipped fourth line of
the promo copy at 360 where the source shows a shorter mobile text (0 px, one text line). Everything else is 0 by the section table.

## Rounds and where the time went
- 01:10 start. Step 1 (01:10–01:31): probe-load (200, OneTrust floating banner, fixed 244 px header, 0 shadow roots, no `main`), three
  origin captures + the 1440 pair (noise 0.00), cap-probe (module 1920, shell fluid, probe 2560), structure dumps (header, main grid,
  footer, ad), content-dump ×2 widths + a full-text viewer, media-list, live-spec ×3, deep probes ×3 widths (+ footer, pin, 2560
  promo), scroll-probe (no header state), motion-observe, deep hover diff, click states (mega menu, utility dropdown, mobile menu),
  nav tree from the DOM (6 items, 27 level-2 icons), fonts, 75 media files fetched and uploaded.
- Step 2–3 (01:28–01:33): triage table, `doc/build-doc.py`, lint (2 🔴 D14 → links; 0 🔴 3 🟡), three documents **previewed 01:33:12**.
- Step 4 (01:33–01:44): fonts.css, styles.css from the spec, hero / promo / cards / columns / event-search / ad / header / footer.
- **r0** (01:45, tables): every section +244 (`main` padding-top on top of the fixed header's flow height). **r1** (01:48): 1200 caps
  were content-box (+30 px wide), topic grid split by the block wrapper (the closing button fell into the 100 px icon column — a
  `p:first-child` rule on the second wrapper), coaching paddings read as boxes. **r2–r3** (01:53–01:57): picture-first cells wrapped
  into one `<p>` by the harness (BACKLOG #8) → pictures authored in `<p>`; the hero stretched to the promo's height. **r4–r7**
  (01:58–02:07): section rhythm (two 32 px `margin-top-small` gaps the spec listed as 0-height containers), topic h2 as a 32 px margin
  not a 116 px flex row, promo distribution tied to the hero row, 2560 header centring, mobile topic selectors (a replace that never
  matched cost two rounds), wheelchair picture shrink-wrapped. **r8** (02:08): 1440 all rows ≤ 2 → **push 02:09:11, synced 02:09:30**.
- r8 gate (02:12): 4.06 at 1440 → the diff crops named what no table had: the news eyebrows/titles/Read More render **uppercase**, the
  YOUTH tile 404'd (a `--` in the media name), the breadcrumb read "Home.harness", pill paddings killed by a generic `nav#nav button`
  rule. **r9–r11** (02:14–02:18): fixes; three-width gate 22.8 / 3.49 / 9.9: 360 was a +22 chain (mobile promo copy), 2560 the orange
  band painted outside its 1920 cap and the footer badges a 1/12 grid column. **r12–r13** (02:20–02:27): fixed; a −24 localize chain at
  360 (no button on the mobile instance); the 360 live header turned out not fixed (read from the live capture itself — 20 % of 360).
- **r14** (02:32): 1440 **1.89**, 2560 6.62; a mobile `min-height` regression at 360. **r15** (02:36): 2560 **4.17** (probe-width promo
  overflow 13 px, wheelchair margin 0 above 1920), 360 11.36. **r16–r17** (02:41–02:46): two 360 sub-pixel rows, ad slot geometry →
  **9.51**. Served gates after push 4 and push 6; leak tables 0 lines; stop rule: every row ≤ 3 px except the registered separator chain.

Time (100 min wall): measurement ≈ 21 %, triage + documents + media ≈ 5 %, blocks ≈ 11 %, harness/table rounds ≈ 25 % (8 rounds to the
first push), pixel-gate rounds ≈ 28 % (9 rounds, 2 regressions, none void), deploy + served gates + registers + report ≈ 10 %.

## Instruments written
Under `migration/cases/home/scripts/` (stardust-lite did not have them):
- `content-view.py` — reading-order view of the content-dump JSON with **full** texts, boxes, fonts, hrefs, backgrounds (the stryker viewer
  truncated at 160 chars; this one never truncates — 80 authored texts, 0 missing in `harness --content`).
- `nav-dump.py` — the header's hidden lists from the live-spec DOM dump (level-1/2/3 with icons, the two utility dropdowns) → `nav-tree.json`
  (a site-selector template, like the travelers/ibm nav dumps).
- `media-fetch.py` — collects every `src` / background `url()` of the captured composition (+ an extra list), downloads the bytes unchanged,
  names them lowercase by actual content type (`.jpg.thumb.585.1170.png` is a JPEG), writes `media/manifest.json` the generator reads.
- `rects.mjs` — child rects of a selector on any page (tag, box, display): the one-line answer when `deep-probe` rows leave the tree
  ambiguous (it found the wrapped-`<p>` cells and the shrink-wrapped picture).
- `outer.mjs` — the runtime `outerHTML` of a match (a serialised file re-parsed by lxml/bs4 "fixes" invalid nesting and hides it).
- `panel-state.mjs` — click a control and report `aria-expanded`, computed display and rect of its panel (the mega menu's hover-then-click
  toggle bug was invisible to `click-state`, which only said "no visible panel").
- `doc/build-doc.py` — the document generator (texts from the capture, media through the manifest, nav from `nav-tree.json`).

## What METHOD.md got wrong or left out
1. **`text-transform` is invisible to every measurement.** `content-dump`, `live-spec` and `pair` record DOM text; the news eyebrows, titles
   and "Read More", every mobile pill and the coaching band render uppercase on the source — found only in a pixel-diff crop after the
   first gate. Step 1 should record `text-transform` (and `letter-spacing`) per text node, and step 6 should say: crop the first diff
   before chasing numbers — three of the 1440 bands were this. Generic.
2. **A fixed header may be fixed at one width only.** The source's 244 px bar is fixed at ≥ 900 and scrolls at 360; `probe-load` reports
   fixed layers at the base width only, and the 360 deep probe prints `pos` only when it is not static — nothing said "not fixed here".
   20 % of the 360 number for two rounds. Prerequisites: run `probe-load` (fixed layers) at every gated width. Generic.
3. **The harness `<p>`-wraps a picture-first cell (BACKLOG #8) and the fix belongs in the authoring rule, not the harness:** a picture on
   its own line is a paragraph in a document, and the pipeline emits `<p><picture>`. Step 3 should say "author standalone pictures in a
   `<p>`"; two table rounds were lost to a 450 px tall `<p>` that bs4 re-parsed as valid siblings (hence `outer.mjs`). Generic; closes #8
   from the authoring side.
4. **cap-probe needs the live content root pinned on a `main`-less origin, and `gate` cannot pass it.** With its default body root the live
   reads "1920 ×1 of 4 sections" and every build FAILs; with `--main '#non-logged-in-section > .aem-Grid'` the same build PASSes 0 of 13.
   `gate` has no `--main`/`--build-main`; the compare had to be run by hand. Generic (sibling of BACKLOG #21/#37).
5. **Section rhythm hides in 0-height containers.** Two `margin-top-small` containers (32 px, 0 px tall) appeared in `live-spec` as empty
   rows and were skipped at first reading; the 2560 spec showed the same container collapsing to 0 above its cap. Step 2 should say: every
   0-height live section is a spacing measurement — write it down with the section it precedes, per width. Generic.
6. **Default content split by a block makes two `.default-content-wrapper`s** and a `:first-child`-based style hits the closing button
   paragraph as if it were the title icon. Step 4 should warn: style the *first* wrapper for the section head; the trailing wrapper
   holds the closing link. Cost one round. Generic.
7. **A generic `nav#nav button { padding: 0 }` reset outranks every `.class` rule by the id.** Step 4's selector paragraph should say resets
   go in `:where()`. The utility pills were 62 px narrow for three gate rounds. Generic.
8. **Hover-then-click toggles must be pinned.** A mega menu that opens on hover and toggles on click closes on the click the probe makes;
   `click-state` only prints "no visible panel". Step 6 should name the hover-first rule for the *build* side too, and `click-state`
   should print the control's `aria-expanded` after the click. Generic.
9. **A mobile-only DOM instance with different copy is a register kind of its own** (the membership widget's shorter mobile text, the
   Localize banner without its button): the honest "pick one composition" costs a 22 px chain = 20 % at 360; clamping to the measured
   box costs one clipped line. METHOD should name the trade-off and the clamp as the measured alternative. Generic.
10. **The probe width needs its own reading of each band's cap and of containers whose margins collapse above the cap**: the badge column
    (1/12 of the viewport), the promo overflow (8 → 13), the `margin-bottom-small` (32 → 0) were all right at 1440 and wrong at 2560 until
    read from the 2560 spec/deep probe. Step 4 says "fractions from the probe measurement" — add "and re-read every spacing at the probe
    width, not only widths". Generic; `[case-specific]` in which rows.
11. **`sections.mjs` pairs the ad section by its hidden "Skip Advertisement" anchor and never pairs the footer gap at 360** (NOT FOUND
    rows); a `--anchor-min-size` or visible-only live anchor would help. Minor, generic.
12. **The media name rule needs "no double hyphen"**: `kids--….jpg` uploaded 200 and previewed 404 on the branch host; renamed it worked.
    One tile missing for three rounds. `[case-specific]` cause, generic rule for `da-put`'s warning list (BACKLOG #4).
13. Minor: `deep-probe` treats a `#id` line in `--sels` as a comment (use `[id="…"]`); `scroll-probe` printed one row (the header has no
    scroll state here, so harmless); `sync-poll` compares with the *current* local file, so a file edited after the push never "matches" —
    it should compare with the pushed commit (`git show HEAD:<path>`).

## Blocked
Nothing was blocked. (The code sync of push 1 served two of the three polled files at 0 s; the third never matched only because the local
file had changed after the push — see gap 13; every later push matched in 11 s.)
