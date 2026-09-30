# www.ibm.com/us-en home → EDS, blocks-first v2.1 — run report (2026-09-30)

Site: `aemcoder-adobe/sdt-ibm`, branch `blocks-first` (main untouched). Content: DA `/drafts/home`, `/drafts/nav`, `/drafts/footer`
+ `/drafts/media/*` (13 PNG renditions = the bytes the live page serves at 1440, plus the hero video's first frame), previewed on the
branch only, nothing published. Prototype: `migration/cases/home/proto/home.harness.html` served on :8950 (runtime harness page).
Served page: https://blocks-first--sdt-ibm--aemcoder-adobe.aem.page/drafts/home
Clock: start 17:21 CEST; **first shareable prototype + served URL 18:19 CEST** (58 min: docs previewed 18:15, code sync polled to 200 at
18:19:42); final numbers 19:10 CEST.

## Three-width table (pixel %, cached origin captured once with --settle --locale en-US, consent accepted, geo modal dismissed; settle on both sides)

| width | noise floor (live vs live) | prototype (r7) | served (final) | Δh proto / served | notes |
|---|---|---|---|---|---|
| 360 | — (one capture kept; the 1440 pair shows the page deterministic) | **4.04** | **4.09** | +5 / +5 | band 0 (9.8 %): hero video frame (a PNG of the live player's 480×360 frame vs the frame itself) + text anti-aliasing on a text-filled width; bands 4500–5400 (3.7–3.9 %): case-study card text; 6300 (8.7 %): training scroller photos + newsletter photo (pipeline renditions); 7200 (5.9 %): footer text; every section-table row within 5 px, doc height +5 |
| 1440 | **0.11** (two captures: bands 0:0.2, 450:0.8, rest 0) | **2.39** | **2.37** | 0 / 0 | bands 0 / 450 (11.8 / 8.0 %) are the hero video (the live capture decodes the HLS stream; the prototype shows the same frame as a still — see the register) and the fixed chat launcher; every other band ≤ 1.1 %; all 9 authored sections at Δ0 in the section table, doc height 4420 = live |
| 2560 | — | **3.28** | **3.27** | −4 / −4 | cap-probe PASS (module cap 1584, shell fluid, 0 of 5 rows failed) from round 0; +3 px below the pictogram grid (the source's card is 204.75 tall at 2560 vs 208 at 1440 — Carbon subgrid rows driven by the hidden copy, not modelled): bands 2250–3600 at 2.0–6.1 % are that shift on text |

Rounds (360 / 1440 / 2560): r0 20.61 / 23.93 / — → r1 — / 15.04 / — → r2 — / 2.89 / — → r3 6.64 / 2.79 / 2.49 → r4 9.02 / 2.80 / 2.49 →
r5 5.07 / 4.04 / 3.28 → r6 3.88 / 3.30 / 3.28 → r7 **4.04 / 2.39 / 3.28**. Served page gated once after the header fix: 4.09 / 2.37 / 3.27.
Leak table prototype vs served (78 wrappers, 1440 and 360): **2 differing lines** = the pipeline's empty metadata section (`display:none`,
0×0; the harness fold drops it — METHOD step 7, expected). Served section table at 1440: every row Δ0, doc height 4420; at 360 / 2560
identical to the prototype's (−5 / +4). State probes on the served page: masthead ladder identical to live (0 → −49, reveal −39 → 0),
mega menu 1440×410 at y48 (= live 410), mobile menu 49 px rows, deep hover diffs identical to the prototype. motion-compare on the served
page: the same 4 parity / 3 missing / 0 extra / 9 advisory verdict lines as the prototype (r7), word for word. `migration/` is `.hlxignore`d.

## Lint (David's Model) at step 2 — before any block existed
home: **0 🔴, 1 🟡** (D1: `hero` "single-column, 3-row block holding only prose" — the Block Collection hero shape; the block is a
genuine widget: video/poster + pause control from the authored link and picture, paginated news list). nav, footer: clean. Unchanged
afterwards (three document edits: `style: bleed` on the tiles section, the video link → the source's Media Center URL with the
first-frame poster, an authored `:launch:` token on one card) — the harness re-ran the lint on every round: same result. See LINT.md.

## Triage table, deviations, motion → `REGISTER.md`
Motion (motion-observe live vs prototype via `gate --probes`, motion-compare): **4 parity, 3 missing, 0 extra, 9 advisory**. Parity:
`wrap-border` entrance (the animated card border), background-color and color transitions, the pagination `active` class. Missing:
`scale` transition (the build zooms the icon with `transform`, the sampler counts the property name) and two Kaltura player classes
(`playkit-hover`, `playkit-state-paused` — the video is not liftable, see below). Advisory rows are hovers the frame sampler read as
"no diff on live" or "dead on live" (shadow-DOM hosts) while the deep hover diff (`scripts/shadow-hover.mjs`, live and build) shows the
same change on both sides: L0 menus, logo, icons, tiles, pictogram cards, case-study cards, primary/tertiary buttons, news links,
link-with-icon, footer links. Verified per row in REGISTER.md.

## Rounds and where the time went
Prototype rounds (harness → section table + pairing at 360 / 1440 / 2560 → CSS → gate at 1440, three widths once the tables were clean):
- **r0** (18:05) first harness: 23.93 / 20.61 (1440 / 360), Δh −360 / +6767. The tables named: the mobile side-nav panel painted a white
  sheet over the page (a `display:block` on `.nav-bar > div` beat the `hidden` attribute — `[hidden]{display:none!important}` in the
  foundation), tiles 16 px too far right (the source's tile group bleeds into the gutters → section style `bleed`), the title-aside
  float layout (→ grid on the section), case-study gap, promo image forcing the row to 198 px (→ absolutely positioned picture),
  mobile banner heading margin, pictogram copy width.
- **r1** (18:10): 15.04 at 1440 — the header and footer fragments still un-decorated: the fragment's default content is wrapped in
  `.default-content-wrapper`, the blocks read `:scope > ul` (→ lift the list / read descendants). 
- **r2** (18:14): **2.89 / Δh −73** at 1440; every anchor within 2 px in the section table → **code pushed, code sync triggered and
  polled, documents previewed: first shareable URLs 18:19**. Remaining rows: footer `.footer-main` display (a `.footer-inner > div
  {display:block}` beat the flex), promo content not growing at 2560, mobile pictogram card heights.
- **r3** (18:22): 6.64 / 2.79 / 2.49 — footer row, `text-rendering: optimizelegibility` (the source sets it; kerning moves every glyph),
  mobile card heading width.
- **r4** (18:35): 9.02 / 2.80 / 2.49 — the hero video: the DA-uploaded mp4 is served as `application/octet-stream` and Chrome refuses it;
  the code-bus copy serves `video/mp4` but the Kaltura download is not decodable (protected bytes); poster = the live player's first frame
  (2× capture); training-row geometry over-corrected at 360 (a void half-round: the 360 target band moved the wrong way, +24).
- **r5** (18:45): 5.07 / 4.04 / 3.28 — the mobile heading is a 3-line clamp with ellipsis (found by looking at the live 360 crop, not the
  spec), icon rule (ibm.com → arrow, else launch, authored `:launch:` overrides), hover corrections from the deep diff (no underline
  on nav links / logo / footer logo; footer link hover rgb(244,244,244)), mega-menu panel geometry, side-nav rows 49; but 1440 went
  2.80 → 4.04: a 2 px intro-link line box (22 → 24) fixed the section height and moved every band below by 2 px.
- **r6** (18:52): 3.88 / 3.30 / 3.28 — promo line box, mobile closing-row padding 8, the `wrap-border` animation (sampled on live).
- **r7** (18:58): **4.04 / 2.39 / 3.28** — the case-study seam: the source rounds its fractional h2 height down (62.77 at 1440), the
  build up → cards 1 px low → `padding-top: calc(var(--section-gap) − 0.5px)`; 1440 Δh 0, all rows Δ0.
- Served page: one deploy round. The leak table found the header un-decorated on the served page only: the pipeline wraps a list item's
  text/link in `<p>` when the item also holds a nested list (`<li><p>Software</p><ul>`), the hand-made harness plain.html did not →
  `TypeError` in header.js. Fixed (`ownLink` / `ownLabel`), the harness now serves the branch's own `nav.plain.html` / `footer.plain.html`
  (prototype re-gated: 2.39 unchanged), code re-synced (19:05), leak tables identical but for the expected empty section.

Time (110 min wall to the final numbers): setup + measurement ≈ 35 % (the page is shadow-DOM web components: every stardust-lite
instrument reads the light DOM, so composed-tree probes had to be written first; consent + geo modal; the Kaltura video), triage +
documents + lint ≈ 10 %; blocks ≈ 20 %; gate rounds ≈ 25 % (8 harness rounds, one void half-round, two rounds on the video); deploy +
served gate + leak + registers + report ≈ 10 %.

## Instruments written under `migration/cases/home/scripts/` (stardust-lite did not have them)
- `probe-load.mjs` — first look: status, redirected URL, fixed layers, consent/geo elements, custom-element tags, shadow-root count.
- `probe-structure.mjs` — **composed-tree** dump (pierces shadow roots, keeps `display:contents` hosts): tag, box, display, bg, own text,
  font, per element to a depth; `--click … --no-settle` dumps an opened state. stardust-lite's `live-spec` sees only the light DOM.
- `media-list.mjs` — composed-tree inventory: every `img` (currentSrc, natural size, box, alt), `video` (src, poster, state), CSS
  background images, inline SVGs, every `@font-face` (including shadow-root sheets) and the font files actually requested.
- `nav-dump.mjs` + the tab-click probe — the masthead's content (L0, mega-menu tabs and panels, dropdown, footer JSON) from the light
  DOM after clicking each menu and each tab (panels populate lazily).
- `shadow-probe.mjs` — `deep-probe` through shadow roots (`host >> inner` selectors): rect + paint incl. `::before`/`::after`, live or
  build (`measure/shadow-1440.txt`, `shadow-2560.txt`).
- `shadow-hover.mjs` — `hover-diff` through shadow roots with Playwright's piercing selectors, 20 properties, composed-tree descendants;
  the live hover states (bg tint, colour, icon scale, underline) were all read here and nowhere else.
- `masthead-scroll.mjs` — scroll ladder down and up reading the fixed bar's `top` (the hide/reveal state machine; `scroll-probe` scrolls
  down only and reads no reveal).
- `doc/build-doc.py` — the document generator from the captured content JSON.

## What the document got wrong or left out
1. **Every measurement instrument is light-DOM only.** `live-spec`, `sections`, `pair`, `deep-probe`, `hover-diff`, `leak`,
   `click-state` use `querySelectorAll` on the document; on a Carbon web-components page (161 shadow roots, no `main`) `live-spec`
   found the slotted text but no paint (footer: 0 items), `hover-diff`/`motion-observe` read hosts and called every hover "dead". A
   composed-tree tier (`el.shadowRoot` walk, or Playwright's piercing selectors) is needed in `common.mjs`; `shadow-probe.mjs` /
   `shadow-hover.mjs` / `probe-structure.mjs` here are that tier. BACKLOG #1 is about bot-managed origins; this is a second reason the
   measurement half can be dark.
2. **Overlays that are not consent.** A geo-mismatch modal (full viewport, z 9999, in the visitor's language) sits over `/us-en` when the
   capture runs from another country. stitch-shot's `--dismiss` handles it, but `live-spec`, `sections`, `pair`, `deep-probe`,
   `hover-diff`, `click-state`, `scroll-probe` accept only `--consent` (one click, first candidate wins) — BACKLOG #2 should say
   "every overlay control", and `common.mjs openPage` should take `--dismiss`. Add `--locale` there too (the prerequisites say pin it).
3. **The video path.** METHOD's media row covers images. A hosted video (Kaltura) is neither liftable as bytes (protected downloads that
   fail to decode; the pipeline serves an uploaded mp4 as `application/octet-stream`, which `<video>` refuses; the code bus serves it
   right but 3.9 MB in git is not a media path) nor playable in the gate browser as a file. What transferred: author the source's own
   player URL as the link and a first-frame poster (captured at 2× from the live player at t = 0 — not the entry thumbnail, which is a
   different frame) as the picture; the block renders `<video>` only for a file link. Worth a paragraph next to the media row: "a hosted
   video is a link + a poster; measure which frame the live capture shows".
4. **The harness must serve the pipeline's fragments.** The hand-made `drafts/nav.plain.html` differed from the pipeline's in one
   structural way (`<li><p>…</p><ul>` around nested list items) and header.js worked on the prototype and crashed on the served page.
   Step 5 should say: preview the fragment documents first and put the branch's `*.plain.html` in the serve dir (or fetch them). This
   is BACKLOG #8's sibling (fold vs pipeline wrapping differences); a list of the pipeline's wrappings would save a served round.
5. **`sections.mjs` anchors skip h5/h6.** The "Recommended for you" section is an `h5` on the source; `anchorOf` looks at
   h1–h4/p/a/li, so the row fell back to index order and paired with the wrong build section every round (read by hand from the
   pairing). Add h5/h6.
6. **`pair.mjs` hides Δy-only rows.** `hot` is Δx, Δh and font; a row that is 20 px lower with the same size is hidden unless three
   consecutive anchors share the offset. Every chain of this run (+66, +35, −282, +24) was read from the section table or `--all`
   with a filter; Δy should be a hot criterion (or the group-offset threshold 2).
7. **Look at the mobile capture, not only the spec.** The 3-line heading clamp with an ellipsis on the pictogram cards was invisible to
   every instrument (the spec reports the box, not the overflow) and cost two rounds of guessing widths; one crop of the live 360
   capture showed it. Step 6's "look at diff-<W>-top.png every round" should extend to "crop the hottest mobile band and look".
8. **`gate.mjs` passes only `--consent` to the origin capture** (no `--dismiss`, no `--locale`), so a cached origin has to be captured
   by hand first; fine as documented ("cache them"), but `gate` could take `--dismiss`/`--locale` and pass them through.
9. **The code bus serves compressed bodies**; `curl | md5` / `diff` against the repo say "differ" until `--compressed`. Step 7's "poll
   one block file to 200" should say how to verify the *content* (curl --compressed | md5 vs the repo) — the header fix was polled that way.
10. **The 1 px class has a sub-pixel member.** Two seams (62.77 px h2 + 64 gap; 81.14 at 360) round the other way on the source; the
    fix was a −0.5 px on a measured padding — a read of the fractional boxes (getBoundingClientRect unrounded on both sides) would name it
    directly. Step 6's 1–2 px paragraph could mention fractional line heights from fluid type.
11. Minor: the empty-section rule from step 7 belongs in the boilerplate foundation from round 0 (done here); `harness.mjs` prints
    `reqfailed` for range-request aborts of a `<video>` (noise); BACKLOG #5 (`:icon:` fold) still costs a `decorateIconTokens` in
    every site's scripts.js; the noise-floor capture pair is one width only — the register's session-variable rows (Target mboxes,
    chat launcher) would be better founded with a 360 pair too.
