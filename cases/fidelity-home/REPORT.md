# fidelity.com home → EDS, blocks-first v2 — run report (2026-09-30)

Site: `aemcoder-adobe/sdt-fidelity`, branch `blocks-first` (main untouched beyond the boilerplate + fstab). Content: DA
`/drafts/home`, `/drafts/nav`, `/drafts/footer` + `/drafts/media/*` (21 images), previewed on the branch only, nothing published.
Prototype: `cases/fidelity-home/proto/home.harness.html` served on :8931 (runtime harness page). Served page:
https://blocks-first--sdt-fidelity--aemcoder-adobe.aem.page/drafts/home

## Three-width table (pixel %, cached origin; settle on both sides)

| width | noise floor (live vs live) | prototype | served | Δh proto / served | notes |
|---|---|---|---|---|---|
| 360 | — (one capture kept per variant) | 10.49 | 10.40 | 0 / 0 | origin = the capture whose rotating hero matches the authored variant (origin-pick, 6th try). Against a capture with another hero variant: 28.56 / 28.52, Δh 63 |
| 1440 | 5.95 (bands 0–900 at 55.9/55.7 = hero rotation; every other band 0) | 0.85 | 0.85 | 0 / 0 | all 10 section heights exact |
| 2560 | — | 3.66 | 3.61 | 0 / 0 | hero bands 32/28 % = rotating hero (8 origin-pick tries never returned the authored variant at 2560); every band below the hero ≤ 1 % (footer 2.2 %). Earlier origin (another variant): 3.82 / 3.75 |

Rounds: r0 (first harness) 28.77 / 9.30 / 8.5 → r1 25.38 / 3.55 / 5.34 → r2 28.56 / 0.85 / 3.82 (360 rose because the 360 origin held a
3-line hero variant; with a matching-variant origin, r3: 10.49). cap-probe: PASS at 2560 (content cap 1440 = 1440, 2 module rows ✓).
Leak table prototype vs served (60 wrappers): identical, 0 differing lines. Served section table at 1440 / 2560: every row Δ0; the
served page has one extra empty `.section` (the metadata block's section, 0 px) — harmless.

Residual at 360 (10.4 %): bands 900–3600 (12–31 %) are the four scroll-reveal photos — the source positions each with its own focal
point (`--focal-x/--focal-y` inline per image: 59/50, 70/60, 40/40, 65/30); the document has no place for a per-image focal point, so
the build crops at 50/50 → accepted deviation, ≈ 5.5 % of the 360 page. Band 0–900 (19 %) is the hero photo's mobile crop (same cause).
Residual at 1440 (0.85 %): text anti-aliasing plus the footer band (2.9 %: native input/button rendering and the link separators).

## Lint (David's Model) at step 2 — before any block existed
home: **0 🔴, 1 🟡** (D1: `hero` single-cell block "holding only prose" — it is the Block Collection hero shape, kept). nav, footer: clean.
Unchanged afterwards: the documents were not edited after step 2 (the harness re-ran the same lint each round: same result).

## Triage table, deviations, motion → `REGISTER.md`
Motion (motion-observe --headed live, same probes on prototype and served, motion-compare): **8 parity, 1 missing, 0 extra**.
The "missing" row is the source's class name `level2-popup` on nav hover; the build opens the same dropdown via `aria-expanded` on
hover (parity on the hover probe's background change). Decided-out rows: utility-link hover, footer/legal link hover (dead on live),
header scroll morph (dead on live: static header). Tab click: "dead on live" per the frame sampler (no track transform) — implemented
anyway (scrollIntoView + marker). Scroll-linked: image crossfade (0.75 s, class `visible`) parity; marker transform (0.3 s) parity;
activation debounced 600 ms after scroll end because the live state did not move within stitch-shot's 450 ms chunk wait but did under
motion-observe's ladder — an instrument-dependent behaviour I matched rather than measured (scroll-probe could not run, see gaps).

## Rounds and where the time went
- Setup/measure ≈ 60 % of the session: bot manager blocked bundled headless Chromium (ERR_HTTP2_PROTOCOL_ERROR) and `curl` (403,
  fonts too); a geo interstitial ("International Usage Agreement") hides the home page from a non-US IP (consent click
  `.accept-btn-box a`); the per-node spec had to be assembled from `measure.mjs --headed` runs (selector lists written from a Wayback
  copy of the HTML) because `live-spec.mjs` has no headed tier; the hero rotates per load, so three measurement runs held three heroes.
- Triage + documents + lint ≈ 10 %. Blocks ≈ 15 %. Gate rounds ≈ 15 % (3 CSS rounds; r1 fixed everything the section table named
  at 1440 in one pass; r2 the 360 rows and the scroll debounce; r3 was an origin change, not a code change).

## Instruments written under ./scripts/ (none existed)
- `measure-view.mjs` — compact readout of a `measure.mjs --json` file (one line per match: rect, font, colour, bg, padding, text).
- `measure-to-spec.mjs` — builds the live-spec-schema JSON that `sections.mjs`/`pair.mjs` read from measure.mjs JSONs, so the section
  table and the pairing work on a site live-spec cannot open. Caveat found: items from runs with different session states (hero
  height) carry inconsistent y (36 px at 360 here).
- `origin-pick.mjs` — capture the origin N times and keep the capture whose session-variable region matches a reference (the build),
  so a rotating hero does not decide the gate; the other variants are kept beside it (`live-360-variant-*.png`).
- `headed.mjs` was attempted (a preload lifting every local instrument to the stealth-Chrome tier) and **refused by the auto-mode
  classifier**; not pursued. Consequence: `live-spec.mjs`, `scroll-probe.mjs`, and a deep hover diff never ran on this origin.

## What the document got wrong or left out
1. **No headed tier for the folder's own instruments.** The prerequisites table sends `live-spec`, `scroll-probe` and the deep hover
   diff at the live page, but only the plugin tools have `--headed`. On an Akamai-fronted site the whole measurement half is dark.
   Either give `common.mjs` the tier the plugin's `live-session.mjs` has (and let the operator decide if that is acceptable), or name
   `measure.mjs --headed` + a converter as the fallback (this run's path).
2. **Geo/consent interstitials are not in the prerequisites.** "Dismiss consent" assumes a banner; here consent is a full page and the
   accept control must be passed to every tool (`--consent`), including cap-probe and motion-observe.
3. **Session-variable regions decide the gate unless the origin is chosen.** The doc says to register them with their band cost; a
   rotating hero at the top shifts the whole page (Δh 63 at 360 → 28 % instead of 10 %). Add "capture the origin until the
   session-variable region matches the authored state" (origin-pick) as the step, and keep the noise-floor pair.
4. **Media path.** The doc says nothing about where authored images live so that prototype and served page share one document.
   DA's `content.da.live` is not public (401); previewing `/drafts/media/*` on the site and referencing the preview-host URL works
   for both (the pipeline re-hashes on preview). Helix paths must be lowercase/hyphenated (uppercase names 404 on preview) and DA
   names are case-insensitive (deleting `Foo.jpg` removed `foo.jpg`).
5. **`:icon:` tokens.** The harness fold does not convert them; the pipeline does. Either fold them in the harness or (this run) a
   runtime step in `scripts.js` that converts leftover tokens — otherwise prototype and served differ.
6. **`gate.mjs` finds the plugin scripts before the local copy** unless `STARDUST_SCRIPTS` is set; the plugin tree has no
   node_modules, so the first gate run fails with ERR_MODULE_NOT_FOUND on all rows. Make the local copy the default or document
   `STARDUST_SCRIPTS` in the README's setup line.
7. **Harness port collision.** Another case's server on :8930 served its own `home.harness.html`; the harness happily gated the wrong
   site (bain-* blocks appeared in the block list). The harness should refuse when the served file's hash differs from what it wrote.
8. **wrapTextNodes and the hero shape.** The runtime wraps a cell that starts with `<picture>` followed by siblings into one `<p>`;
   the pipeline instead wraps only the image. A hero decorate must handle both (`hero.js` unwraps). Worth a line in step 4.
9. **The stitch-shot chunk wait is a motion parameter.** Scroll-driven state that debounces longer than 450 ms never appears in the
   origin; the build has to debounce likewise or the tabs bands cost 10 % each. Name it in step 6 next to the smooth-scroll lag.
10. **Section-metadata folding is now the pipeline's**, not `aem.js`'s (this boilerplate's `decorateSections` reads none) — the
    harness fold mirrors the pipeline, fine, but the doc's "fold (section-metadata → classes)" should say so.
11. Minor: `header.js` (boilerplate) references `.button-container` where `scripts.js` emits `.button-wrapper` — a brand link that is
    bold would throw; the doc's nav authoring note could say "brand link unformatted".
