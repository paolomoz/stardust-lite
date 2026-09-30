# www.walgreens.com/ home → EDS, blocks-first v2.2 — run report (2026-09-30)

Site: `aemcoder-adobe/sdt-walgreens`, branch `blocks-first` (main untouched). Content: DA `/drafts/home`, `/drafts/nav`, `/drafts/footer`
+ `/drafts/media/*` (66 files = the jpg/png/svg bytes the live page serves at 1440 and the 7 hidden category tiles), previewed on the
branch only, nothing published, no PR. Prototype: `migration/cases/home/proto/home.harness.html` served on :8960 (runtime harness page,
fragments from the pipeline). Served page: https://blocks-first--sdt-walgreens--aemcoder-adobe.aem.page/drafts/home
Clock: start 21:44 CEST; documents previewed (step-2 checkpoint) 22:10; **first shareable prototype + served URL 22:34:52 CEST** (round 1
within 3 px on the 1440 section table → code pushed 22:34:40, branch code sync triggered and polled to 200 with matching md5 at 22:34:52;
50 min); final numbers 23:15 CEST (91 min).

## Three-width table (pixel %, origins captured once with --settle in composition A; settle on both sides)

| width | noise floor (live vs live) | prototype (r4) | served (final) | Δh proto / served | notes |
|---|---|---|---|---|---|
| 360 | — (see 1440: the pair is composition variance; the 360 origin was picked by region, `origin-pick` best 12.2 %) | **8.48** | **8.53** | +96 / +96 | every band 3–12 %: text anti-aliasing on a text-filled width (the same glyphs read red in every text block, see `gate/r3-360-*.png`), the coupon set of the picked origin differs from the authored session (band 1800), the footer's mobile-only composition not authored (−99 px at the bottom, band 6300 at 9.1 %), the GAM creative; the section rows above the footer are within 4 px (photo +4, categories +3, deals −3) |
| 1440 | **33.6 %** as captured (two loads = two compositions: alert + coupon carousel vs alert + sponsored banner, Δh 515; bands 0–1000 at 0.0 %, the deterministic part of the page) | **2.84** | **2.85** | +1 / +1 | band 1350 (12.7 %) = the Google ad creative in the reserved slot (≈ 1.0 % of the page); 3150 (5.0 %) = product renditions in the deals carousel; 4050 (4.1 %) = category tiles + Explore cards renditions; every other band ≤ 2.5 %; all 17 authored sections at Δ0/±1 in the section table, footer 1266 = live, doc 5876 vs 5875 |
| 2560 | — | **1.62** | **1.63** | +1 / +1 | cap-probe **PASS** (module cap 1440 = live, shell fluid, 0 of 4 rows failed) from round 3 (round 1–2 FAIL: `main` carried a wrapper cap the live has not — the bands bleed, the content is capped); band 1350 (7.2 %) = the ad creative |

Rounds (360 / 1440 / 2560): r0 — / 23.9-class (section table only: Δh −256, footer −372) → r1 — / **3.03** / — (pushed) → r2 — / 2.84 / 6.57
(cap FAIL) → r3 8.51 / 2.84 / 1.62 (cap PASS) → r4 **8.48 / 2.84 / 1.62**. Served page gated after r2 (2.84 / 8.57 / 6.57), r3 (2.85 /
8.57 / 1.63) and r4 (360: 8.53). Leak table prototype vs served (33 wrappers, 1440 and 360): **identical, 0 differing lines** (the empty
metadata section is hidden by the foundation rule from round 0). Served section table at 1440: every row Δ0/±1, doc 5876. State probes on
the served code: dropdown [10,153,228,178] = live, account drawer rows 40 = live, mobile drawer rows 38 = live. `migration/` is `.hlxignore`d.

## Triage table
→ `REGISTER.md` (17 rows: header, alert, quicklinks, banner, promo cards ×3 rows, offers carousel, ad ×3, health/explore media-top
cards, photo cards, deals carousel, 2 widget placeholders, categories, footer). Block Collection matches: **header, footer, cards (5
variants: quicklinks, promo, media-top, categories, + feature-first/dark/photo/health looks), carousel (offers, deals)**; site-specific
names for what the collection has no shape for: `alert` (dismissable notice), `banner` (60/40 and 50/50 slim bands), `ad` (reserved
third-party slot, key-value). Shapes: container for cards/carousel, simple for alert/banner, key-value for ad and section-metadata.
Personalisation slots that are empty for an anonymous visitor (`buy-again`, `recently-viewed`) use this repo's own `widget` auto-block
(`/widgets/<name>.html` link → html/css/js).

## Lint
Step 2 (22:08, before any block): home **0 🔴, 2 🟡** (D1 `alert` one-row prose block — a genuine dismissable widget; D4 SVG media —
the source's own DAM icons, verified pure vector), nav 0 🔴 1 🟡 (D4 brand SVG), footer clean. Unchanged through the rounds (the
harness re-lints every run; the four document edits after step 2 — `compact-head` style, repo-relative widget links, paragraph
grouping / "Text JOINRX to 21525" order, the footer icon token — kept 0 🔴, 2 🟡). See `LINT.md`.

## Motion register
→ `REGISTER.md` (18 rows). motion-compare on the prototype (`gate --probes`, 11 hovers + 2 clicks): **0 parity, 10 missing, 0 extra,
2 advisory, 14 dead-on-live**: every hover is "dead on live" for the frame sampler (the source keeps a hidden duplicate nav; the first
match has no box) and every MISSING/extra row is a class or transition *name* (`show-next-lvl`, `hide-prev-lvl`, `account`, `show`,
`position-fixed`, 300 ms panel fades; the build's `header-account-open`/`header-locked`). The verified rows come from the deep hover diff
on both sides (`motion/hover-live.json`, `hover-build-r3.json`): menu/promo/card/category/view-all/account underline, the secondary
pill's red fill on hover (banner, coupon Clip, sign-up), footer links unchanged; and from click-state probes on both sides: dropdown
panel, account drawer, mobile drawer (boxes in the register). Decided out: 300 ms fades on panels hidden at rest; the glider's track
transform (native scroll-snap instead); the store-selector and typeahead drawers (store API).

## Deviations register
→ `REGISTER.md` (26 rows). The ones that cost pixels: the Google ad creative (third-party, slot reserved: 12.7 % of band 1350 at 1440);
session-variable composition (Target alert, coupon carousel vs sponsored banner, per-session coupon set and store line — composition A
authored, origins captured/picked in A); the mobile-only footer composition not authored (−99 px at 360); product PNG renditions;
text anti-aliasing. The ones that cost nothing at rest: JS actions authored as links (Clip, Apply codes, Sign in), the interpreted open
state of the menu bar, pastel per-card colours by `nth-child` in the photo variant, the `compact-head` section style, the white-on-white
sponsored-module title kept as the `ad` block's hidden title.

## Rounds and where the time went
- 21:44 start. First look (headless 200, no consent, no geo, 0 shadow roots, one fixed third-party tab), cap-probe (module 1440, probe
  2560), two 1440 captures → **the page has three compositions** (Target alert, coupon carousel or sponsored banner); 360 and 2560
  captures, structure dumps at 1440/360, live-spec ×3 (each a different session: the 360 spec has no alert), content dump with a
  `--require` composition check (retry until A), nav dump (six dropdowns, account drawer, mobile drawer — three attempts: `:visible`
  is not a `querySelector` selector, hidden duplicates need a bounding-box filter), media inventory + 59 downloads + DA upload +
  preview, fonts, icons from the sprite, deep probes, motion-observe. ≈ 24 min.
- 22:08 documents generated (`doc/build-doc.py`), lint 0 🔴; 22:10 **documents previewed on the branch** (step-2 checkpoint, 26 min).
- 22:10–22:28 foundation + 7 blocks + 2 widgets written from the spec; harness r0 at 22:24 (doc −256: footer heading links turned into
  buttons by `decorateButtons`, the pipeline's picture-outside-link split, banner row-pad, 2 px margins that were glyph offsets).
- **r1 22:34** 1440 table within 3 px → pushed, synced, **first shareable URL 22:34:52**. Pixel 3.03 %.
- r2 22:45: footer +51 (legal list `min-height`, icon on its own line), carousel snap offset 8 px (`scroll-padding`), plum row 20/20,
  categories button row, mobile row padding 0, `overflow-wrap: break-word` (a boilerplate rule) breaking "myWalgreens®" at 360, the
  "Text JOINRX to 21525" / "WAG10*" paragraph order (content-dump limitation). 1440 → 2.84 %, every row Δ0/±1. cap-probe FAIL (2560).
- r3 23:01: cap-probe read against the 2560 crop — the live bands bleed full width and the *content* is capped at 1440, not `main`
  (the METHOD shell rule inverted for this site); promo bar centred on the viewport; account container 15/15; hovers from the deep
  diff (secondary pill fill, no footer hover, category label underline, menu label underline); click pins the hovered dropdown
  (click-state read "no visible panel": hover opened it and the click toggled it shut). 2560 6.57 → 1.62 %, PASS.
- r4 23:14 (mobile only): the search form did not shrink below 900 (`min-width: 0` on the flex item, `width: 100%` on the input),
  store label truncation 168 px, banner text gutters 32. 360: 8.51 → 8.48.
- Served page: three deploy gates (after r2, r3, r4): prototype numbers within 0.05 %, leak tables identical, no served-only fix needed
  (the harness served the pipeline's fragments from round 0).

Time (91 min wall): measurement ≈ 27 % (the composition variance cost two extra origin/spec runs and an `origin-pick`); triage +
documents + lint ≈ 8 %; blocks ≈ 20 %; gate rounds ≈ 30 % (4 rounds, none void; one round each on a boilerplate rule the foundation
inherited — `decorateButtons` on footer headings, `overflow-wrap`, the wrapper-cap shell); deploy + served gates + registers + report
≈ 15 %.

## Instruments written
Under `migration/cases/home/scripts/` (stardust-lite did not have them):
- `probe-load.mjs` (from ibm-home) — first look: status, fixed layers, consent/geo candidates, shadow roots, main/body children.
- `probe-structure.mjs` — light-DOM structure dump to a depth (tag, box, display, bg, position, own text, img src/natural size) through
  `common.mjs openPage/settle` with `--root`, `--depth`; the "what are the sections" input for `live-spec --sections`.
- `content-dump.mjs` — **the authoring input**: nested JSON of every visible element carrying text, links or media (tag, class, box,
  text with font, href/aria, src/alt/natural size, bg/radius/border/shadow), bare wrappers collapsed; `--require <css,…>` refuses
  (exit 4) a session whose composition is not the canonical one, so the dump matches the cached origin. The flat per-root text views
  (`measure/content-flat-*.txt`) are what the triage was read from. Limitation found: it joins a span's own text around a bold child
  ("Text JOINRX to 21525" came out as "Text to 21525" + "JOINRX").
- `nav-dump.mjs` — opens each L0 dropdown (hover, forced click), the account trigger and the store trigger at ≥ 900, the hamburger at
  360, and dumps the opened panel (largest newly visible box with > 3 links) with boxes/fonts/rules; screenshots per menu.
- `media-list.mjs` (from ibm-home) — every img/bg/svg/@font-face and the font files actually requested.
- `doc/build-doc.py` — the document generator from the content dump, the nav dumps and the DOM (hidden category tiles, promo bar).

## What METHOD.md got wrong or left out
1. **The noise floor can be the composition, not the capture.** Two 1440 captures gave 33.6 % with Δh 515: a personalised slot
   (coupon carousel vs sponsored banner) and a Target alert that is present on 2 of 3 loads. METHOD's "capture twice, keep the
   self-diff as the noise floor" reads that as noise; it is a *composition* variance that decides which page is being built. Step 1
   should say: when the self-diff has a band above ~5 %, name the regions, pick one composition, and make every later instrument
   (`live-spec`, `content-dump`, `origin-pick`) refuse a session that is not it (`--require`). BACKLOG #3 (origin-pick as a step) and
   #11 (per-run session state) are the same finding; the missing piece is a *composition gate* on the measurement runs, not only on
   the capture.
2. **`live-spec` runs are one session each.** The three width specs came from three sessions (the 360 spec has no alert): the section
   table at 360 could only be read for heights, never for Δy. A `--require` (or a shared browser context across widths) belongs in
   `live-spec`. (generic; BACKLOG #11 names the symptom)
3. **The shell rule has two readings.** METHOD step 4: "when cap-probe reports a shell or content cap, `main` carries that cap and
   full-bleed section styles bleed out of it". Here cap-probe reported *module* caps with a fluid shell: the bands bleed and the
   content is capped, so `main` must stay fluid and `.section > div` carries the cap — the inverse of the travelers rule. Putting the
   cap on `main` passed 1440 and failed cap-probe (wrapper cap the live has not) and the 2560 bands. Step 4 should map the three
   cap-probe kinds to the three CSS placements (shell → `main`; content → `main > .section`; module → `main > .section > div`).
4. **Boilerplate rules are measurements too.** Three of four rounds fixed rules the site's foundation inherited from the boilerplate,
   not rules written from the spec: `decorateButtons` turning the footer's bold heading links into buttons (the footer read as a
   row of red pills), `a:any-link { overflow-wrap: break-word }` breaking "myWalgreens®" into three lines at 360, the boilerplate
   `main > .section > div` cap. Step 4 should say: strip `styles.css`/`scripts.js` to what the spec measured before the first
   harness, and list the boilerplate behaviours a fragment inherits (decorateButtons on `p > strong > a`).
5. **The pipeline's wrapping rules deserve a list** (BACKLOG #8/#28 sibling): seen here — a single paragraph in a cell loses its
   `<p>`; a picture inside a link inside a list item is split into its own `<p><a><picture>`; a list item with a nested list keeps its
   `<p>`. Each cost a served-only or harness-only difference until decorate wrapped loose text and the icon became a token.
6. **The pairing reads inline boxes as the block for a button label** — a `span` inside the source's button pairs with the build's
   `a.button` box: every button row shows Δy −12/Δh 24 that means nothing (travelers gap 2 was about `strong`/`a`; buttons are the
   same class). `pair.mjs` could pair a span inside a `button`/`a.btn` with its control.
7. **`sections.mjs` pairs a hidden anchor.** The source's white-on-white "Beauty deals you'll love" text section paired with the
   build's footer (its build anchor is an `ad` title with `visibility: hidden`), so the footer row read "live span 1314 vs 1266" every
   round; the real footer Δ had to be read from the pairing. Anchors should skip invisible text on the build side too.
8. **`motion-observe`'s first-match selectors are blind on a page with hidden duplicates**: the source keeps a hidden copy of the nav
   (mobile drawer) before the visible bar, so every hover probe read "dead on live" and the compare has 0 parity while the deep hover
   diff verified every row. `hover-diff` filters "first *visible* match" (travelers gap 4); `motion-observe` (vendored) does not — say so
   in step 6, or resolve selectors to the first visible match in `gate --probes`.
9. **`:visible` is not a selector.** The probes file and click-state accept CSS only; the METHOD examples should say "CSS selectors,
   use an id or `:nth-of-type`, not Playwright pseudo-classes" — one gate run was lost to it.
10. **The 360 origin needs the composition, and `origin-pick` needs a per-session region.** A personalised carousel never matches
    below the accept threshold (each session has other coupons); `origin-pick` kept the best of 8 tries at 12.2 %. The register should
    carry a row type for "per-session *content* in a fixed-geometry slot" (BACKLOG #25's sibling: text → cards).
11. **Third-party ad slots are content geometry.** METHOD has media and hosted video rows; an ad slot (GAM 970×90 in a 985×105
    safeframe, Criteo module) is neither. What transferred: a key-value `ad` block that reserves the measured slot and loads nothing;
    the creative is a register row with its band cost. Worth a prerequisites row.
12. [case-specific] Personalisation carousels that render nothing for an anonymous visitor (`buy-again`, `recently-viewed`) are 24 px of
    container padding; this repo's `widget` auto-block (a `/widgets/<name>.html` link) is the honest model and the METHOD has no word for
    "dynamic, signed-in content" — a sentence in step 2 (widget / fragment / block) would help the next retail site.
13. [case-specific] The template body class on every selector (step 4) was not followed: a single-template site with 7 blocks doubles
    every selector for nothing; the blocks are scoped to their root and the section styles to `main .section.<style>`.
14. Minor: `gate` prints "cap-probe: FAIL — 1 of 4 rows failed" without the rows; the rows come only from `cap-probe --against`
    run by hand (documented nowhere in METHOD). `harness` prints two `404` console lines for the fragments' `./media_*` pictures on the
    prototype (the pipeline's relative picture paths) until they are copied into `proto/drafts/` — the harness `--fragments` could fetch
    the media the fragments reference. `stylelint --fix` reorders/renames values (`rgba`→`rgb`, `padding: 5px 0 5px`→`5px 0`) so a
    scripted edit that matched the pre-fix text silently missed twice.

## Blocked
(nothing — every step ran; the DA token stayed valid, no `--headed` tier was needed, no publish, no merge, no PR)
