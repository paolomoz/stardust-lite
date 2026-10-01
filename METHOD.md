# Blocks-first prototyping, v2 — the replica procedure that transfers to EDS without loss

One case per version (pixel diff at 360 / 1440 / probe; served page = prototype from v2.1 on; numbers in README.md's cases table, lessons in each REPORT). v1
usta — only "author rows → block → runtime prototype" transferred. v2 baincapital — pixel-faithful, **failed David's Model**. v2.1 travelers — shell rule, round
discipline, deep probes. v2.2 ibm — shadow DOM, overlays, hosted video, stop rule. v2.3 walgreens — composition gate, cap placements, boilerplate rules as
measurements. v2.4 stryker — consent that reloads, fonts first, percent geometry, margin collapse. v2.5 usta2 — text-transform, fixed layers per width, 0-height
spacing. v2.6 audemarspiguet — authoring set vs painted set, boxes read mid-flight, media names. v2.7 dentsu — paint read as pixels, a red band's four causes,
torn scroll-linked transforms, geo editions by IP. v2.8 hiltongrandvacations — an iframe player's poster, texts that change with time, content a click reveals,
the runtime's own wrapper, one authored section per source section. v2.9 marriottvacationsworldwide — entrance states parked in the spec, hidden-but-present
content, painted extents, a click probe that navigates.

## The rule

A prototype is the branch runtime's decoration of an **authored document that a person could have typed in a doc**, styled by the block CSS that will
ship. Nobody types decorated markup. Nothing is copied from the source DOM. The source is measured, never cloned. The document is written in reading
order; blocks hold only what default content cannot.

## Prerequisites (exist before the first row is authored)

| artifact | produced by | notes |
|---|---|---|
| repo + branch + DA site, code synced on the branch | `eds-new-site`, then `scripts/sync-poll.mjs` (`--trigger` POSTs `admin.hlx.page/code/<org>/<site>/<branch>/*`) | new branches did not sync on push in 2026-09, and the trigger has answered 404 while the push synced on its own: the poll decides (md5 of the decompressed body against the pushed commit's file; a push reached the bus in 10 s once and in > 200 s the next time — poll for minutes and record the time) |
| archetype list: which page represents which template | `prepare-migration` | one page per template is prototyped; the rest is rollout |
| page capture: texts, hrefs, media URLs, hidden DOM | `extract` page capture, or `scripts/live-spec.mjs` (writes the DOM too) | hidden DOM (mobile duplicates, `display:none` promos) is NOT content — what a click reveals is (`click-dump`): pick one composition. A **web-components origin** (custom elements, shadow roots, no `main`) keeps its paint, boxes and hover states inside shadow roots: light-DOM `querySelectorAll` reads slotted text but no paint and calls every hover dead. Count the shadow roots in the first look; use the composed-tree tier (`deep-probe` / `hover-diff` with ` >> ` selectors, `DEEP_HELPERS` in `common.mjs`) for paint and motion, and dump the structure through the shadow roots before triaging |
| overlays and locale | `--consent <css>` **and** `--dismiss <css,…>` **and** `--locale <tag>` on every instrument | consent is one overlay; a geo-mismatch modal (full viewport, in the visitor's language, over the pinned locale's page) or a marketing interstitial is another. Find both in the first look; pass both to every tool; the origin captures need the locale pinned or a geo-redirecting site captures a different page per run. A consent accept may **reload the page** (OneTrust "reload on consent"): `openPage` waits the navigation out; a tool that does not survive it takes the close/reject control instead. An origin may also serve another **edition at the same URL by IP** (no redirect; `Accept-Language` and `--locale` change nothing): compare a market marker across `curl` with two languages and the browser, record which edition `/` is for this operator — that is the page measured. Once the template is approved these live in `migration/site.json` (`site-profile init`): every instrument reads the profile's overlays, cap root and locale as its defaults when the flags are absent (`--site <file>`, explicit flags win), and `site-profile check` opens the origin per width before a page run to verify the controls still resolve and the chrome heights hold |
| per-node measurement per width (spec JSON) | `scripts/live-spec.mjs <url> <W> --sections <sel> --consent <sel>` | box, paint, font family/size/line-height/weight/transform/align/colour per text node; box and fit per image. One JSON per width |
| probe width and container model | `tools/replica/cap-probe.mjs <url>` capture | probe = max(2560, largest cap × 1.25) |
| origin captures per width | `stitch-shot.mjs <url> live-<W>.png --width W --settle` | cache them: every gate round compares against the same origin; capture the live page twice once and keep the self-diff as the noise floor. A self-diff band far above the others is not noise but a **composition** (an A/B alert, a personalised slot that holds a carousel in one session and a banner in the next — walgreens-home read 33.6 % between two loads): name the regions, pick one composition, capture the origins in it and pass its markers as `--require <css,…>` to every measurement instrument — a run in another session exits 4 |
| third-party slots (ads, sponsored modules) | measure the slot's box per width, not the creative | a key-value block reserves the slot and loads nothing; the creative is a register row with its band cost — it is neither media nor hosted video |
| scroll states and motion, when the site is scroll-driven or hovers paint | `scripts/scroll-probe.mjs` (layers, `--paint` children, `--up`), `motion-observe.mjs` on the live page plus a deep hover diff (pseudo-elements, subtree) | fixed-layer colour thresholds, header states, scroll-linked transforms, autoplay periods — measured BEFORE code; the hover probe alone reads no `::before` underline and no colour on a child, the deep diff does. The chunked capture tears a scroll-linked transform at every chunk boundary on both sides (two origin captures disagree there): reproduce its function, and read the rest offset as a measured constant (set at init by the page's load-time layout). A **text that changes with time** (a count-up statistic, a rotating headline) is a motion neither tool reads: `scripts/text-ladder.mjs` samples it after scrolling it into view — duration and easing are the function the block reproduces, and the live capture holds an intermediate value (a register row) |
| fonts | download the source's woff2 files into `/fonts` | `live-spec` records family/weight/style in use |
| media | collect and download the source's **bytes** (`scripts/media-fetch.mjs` from the content dump: webp stays webp, avif stays avif — DA stores and the pipeline serves what it accepts; names of a-z0-9 and single hyphens — DA accepts `kids--x.jpg` and `musee_hp.jpg` and the branch host previews both 404), upload them to a draft media folder on the site and preview (`scripts/da-put.mjs`, documents too), reference the preview URL in the document | DA and the pipeline store them unchanged and serve optimised renditions; re-encoding to jpg costs ≈ 1 % in photo bands (travelers-home r1 → r2) |
| hosted video | author the source's own player URL as the link and a **poster picture of the frame the live capture shows** (`scripts/video-frame.mjs`: a `<video>` paused at t = 0 at 2×, or — the common case, a Vimeo / YouTube **iframe** this page cannot pause — `--box` the player's section with `--hide` on the veil, text and controls over it; the entry thumbnail is usually another frame — check it against the live crop); the block renders `<video>` only for a file link | a hosted player's files may be protected or not decodable (Kaltura, ibm-home) or one API call away (Brightcove's playback API, under the player's policy key, lists a progressive MP4; uploaded to DA it was served `video/mp4` by the branch host where ibm-home's upload came back `application/octet-stream`, which `<video>` refuses): ask the player's API for a progressive source, then test the DA-served content-type and one `<video>` before settling for link + poster |
| paint that is not on a node | `scripts/deep-probe.mjs <url> <W> --sels …` on the elements the spec shows without paint | `::before`/`::after` (curved edges, underlines, elevation shadows) are invisible to `live-spec` |

## Procedure, per template

1. **Measure the source at three widths** (360, 1440, probe): `probe-load` at **every gated width** (status, overlays, fixed layers, shadow roots — a header
   fixed at the base width may scroll at 360), `probe-structure` (the section selector for `live-spec --sections`), `content-dump` read through `content-view`
   (the authoring input: full texts in reading order with inline markup, links, media, boxes, and the font string with `text-transform` — the dump holds DOM
   text, the page may render it uppercase and no table shows the case), `media-list`, `live-spec`. The dump is the **authoring set, not the painted set**: a
   carousel's cards beyond the viewport come from their lazy attributes (`content-dump` marks them `lazy`), and a paragraph a text-reveal library split into one
   element per rendered line is one text (`lines`; `live-spec` merges the run, `pair` reads a stray line as ⤷). A carousel track's height is a rule, not a box:
   read which slide sets it at each width (Swiper's `autoHeight` counts the slides in view plus the next). Content a click reveals — a caption that exists only
   for the active slide, a tab panel behind its tab, a drawer's sub-menu — is hidden *content*, not hidden DOM: `click-dump` (a click sequence, the panel's
   texts after each) holds it, and `harness --content` takes its JSON as a second source. Every run is one session: on a page with session-variable composition
   each takes `--require`. Also measure the scrolled states: which fixed layers change, when, by what function (`scroll-probe --paint` for a bar whose paint
   lives in a child sheet or the glyph colour). A scroll-entrance library (AOS, "animate once") re-arms every element that leaves the viewport: a settled read
   at the top holds tiles and cards parked at their entrance translate and opacity while the capture shows them at rest — `live-spec` flags them (`ent`, `rest`;
   `pair` and `sections` use `rest`), and a section rule from a parked box cost a gate round: read the container and the capture. Hidden-but-present content a
   JS opener reveals and no probe click fires (a modal in `<body>` with `aria-hidden` at rest) is a third source: `content-dump --hidden <css,…>` reads those
   roots, opt-in, for `harness --content`; hidden DOM stays not content. A 406 on an asset fetched outside the browser is a WAF header rule, not a block on
   headless; a dump that reads "no root" once ran before the page's JS — run it again. Record tables, not screenshots.

2. **Triage every section into a content model — before any block exists.** Walk each measured section top to bottom and write what an author would
   type: heading, paragraph, image, link. Whatever is left is a block. Then, per block, decide and write down:
   - **shape** — one of David's three: *simple* (one property per row), *key-value* (configuration only: section-metadata, backgrounds, renditions, feed
     sources), *container* (own rows, then one row per child, ≤ 4 columns, one property per column). A composition that fits none is a modelling error
     (D1/D2/D10), not a fourth shape.
   - **Block Collection match** — hero, cards, columns, tabs, accordion, carousel, quote, embed. If it matches, take the name and the authoring shape;
     the site's look is a variant or the block's CSS. A site-specific name is for what the collection has no shape for. Match the site's own
     inventory first (`block-inventory` — `migration/blocks.json`: the blocks and variants earlier pages approved, with their source signatures
     and budgets), the collection second, a new name last; `triage` drafts the table from the content dump (fingerprint, repeat, inventory match
     with its confidence, default content, rows × cols, the page's novelty) and the agent edits the draft — it never decides.
   - **default content around it** — section heads, ledes and closing CTAs are default content; the block decorate may *move* them into its DOM but the
     document keeps them where an author expects them.
   - **embeds in repeating units** — a video that belongs to a card is a fully qualified link in that card's row; the block opens the player.
     Auto-blocking is for a video that stands alone in a section. The lint still refuses that row (BACKLOG #13): keep the model, run the harness
     `--no-lint` and cite the rows in LINT.md.
   - **one authored section per source section**, even when a band holds two blocks and two backgrounds (a gradient): cap-probe pairs modules by section
     order, and a split shifts every later pairing (4 of 11 rows failed until the band was one section again).
   - **configuration** — a per-section background, a rendition per breakpoint, an autoplay period: section-metadata keys, never a block row.
   - **a 0-height live section is a spacing measurement** (a margin container; `live-spec` flags it with its margin): write it down with the section it
     precedes, per width — the same container collapses to 0 above its cap.
   - **content that exists only for a signed-in or returning visitor** ("buy again") is not authored: reserve its measured geometry with a fragment or
     widget link the runtime fills, and register it. Output: the triage table (section → default content | block name, shape, collection match, rows ×
     cols) in the deviations register. Run `davids-model-lint.mjs` on the authored document now; a 🔴 is a modelling defect and the harness refuses to
     fold it (step 5). **This is the first deliverable.** Preview the three documents on the branch as soon as they lint clean and share the URLs with
     the triage table: the content model is approvable before a block exists.

3. **Author the document** from the triage table. Section styles for the source's spacing (authored, not by position), section-metadata for
   configuration, `<em>` for accents, bold/italic links for button weight (the block decides the variant). A picture on its own line is a paragraph:
   author it in `<p>` (the pipeline emits `<p><picture>`; the runtime wraps a bare picture-first cell into one `<p>` with whatever follows). Type every
   text from the capture (`content-view`, never a truncating viewer; `harness --content` names each authored text the dumps do not hold). Write the
   deviations register at the same time: every per-instance source parameter → variant / section style / accepted deviation with its pixel cost.

4. **Write the block: decorate + CSS + JS for its motions.** Decorate moves authored nodes into a small named DOM. CSS values come from step 1 only. Every
   selector carries the block root (and the template body class when the site has several templates). Geometry above 1440 is fractions or vw from the probe
   measurement, never the 1440 pixel value; a source percentage is a fraction of **that element's** containing block (`padding-top: 20%` of the column content,
   not the grid area; an overlay's `top: 10%` of the picture only as the picture box's child) — read the parent's width in the spec, `calc()` against the same
   box, `deep-probe` on the build (`--props` for any property outside its fixed set, `--anim` for keyframes). A pseudo-element at negative z-index is a value,
   not paint: whether it shows depends on the rest of the stacking context, per width — read it as pixels (`shift-probe`'s luminance ratio live / build over the
   box names the veil and its alpha). Read `display` of a control and its children before copying its padding: an inline formatting context carries a word space
   between label and icon that a flex build does not. A negative margin that bleeds a grid or flex item resolves against the grid area too: compute it from the
   viewport (`calc()` of `min(100vw, cap)`); `margin: 0 calc(50% - 50vw)` holds for a block-level child only. `aspect-ratio` on a grid of pictures loses to the
   images' intrinsic heights (`min-height: 0` is not enough): position the pictures absolutely in the ratio box. Re-read every spacing and cap at the probe
   width: a viewport-fraction column or a margin that collapses above its cap is right at 1440 and wrong at 2560. Mobile in the block's own media query; every
   positional property the mobile query sets (`top`, `transform`, `position`) is reset in the desktop one. Default content a block splits (head before, closing
   link after) is two `.default-content-wrapper`s: style the first for the head, the last for the link, never a `:first-child`. Resets go in `:where()`: an id
   in a reset (`nav#nav button`) outranks every class rule the block writes, and a foundation shorthand with more compounds (`footer .footer > div > .section >
   div { padding }`) silently beats a block's longhand (`deep-probe` reads the loser's value); `[hidden] { display: none !important }` is one of them — the
   attribute loses to any `display` the class sets (a tabs section showed every panel). A decorate that classes fragment sections must not reuse a block
   variant's name. `decorateIcons(main)` runs before any block decorate: the `.icon` spans a block creates (arrows, hamburger, play) are decorated only by its
   own `decorateIcons(block)`, called after the controls exist — and it makes an `<img>`, which never takes a hover colour: a control icon that follows
   `currentColor` on the source (arrows, chevrons, close, social, scroll-up are inline SVG there) needs a foundation `inlineIcons()` that swaps the `<img>` for
   the fetched `<svg>` (ibm-home and marriottvacationsworldwide-home wrote the same helper). A block that paints an authored image as a background reads the
   pipeline's large rendition (`<picture> > source[media]`), not `img.src`. cap-probe's *kind* names the CSS placement: a **shell** cap goes on `main`
   (`max-width`, centred; full-bleed section styles bleed out of it with `margin: 0 calc(50% - 50vw)`); a **content** cap on `main > .section`; **module** caps
   under a fluid shell go on `main > .section > div` while `main` and the sections stay fluid so the band colours bleed. A cap one level too high, or a header
   bar anchored to the viewport instead of the shell, passes 1440 and fails every wide band; its leaf modules compare shrink-wrapped text widths too — a text
   column whose children stretch where the source's shrink-wrap (`align-items`) fails the wide row on a button's width. The boilerplate's `styles.css` /
   `scripts.js` are not measurements: before the first harness strip them to what the spec says (`decorateButtons` makes every `p > strong > a` a button, `main
   > .section > div { max-width }` is a cap the source may not have); the fragments inherit the same rules. Fonts are a measurement precondition: the
   boilerplate loads `fonts.css` lazily and a table read before the swap measures fallback metrics; load them from `styles.css` while gating (the instruments
   wait for `document.fonts.ready`). The body's weight is a measurement too: a family whose 400 is Bold (`pair` flags every row `325 → 400`) wraps every
   paragraph a line longer when `body` carries no weight — set it from the spec's body row before the first harness.

5. **Produce the prototype with the harness** (`scripts/harness.mjs`): lint → fold (section-metadata → classes, metadata → `<meta>`, empty sections
   dropped) → load with the branch runtime → wait for every block `data-block-status="loaded"` → serialise. The fragments (`nav`, `footer`) come from
   the **pipeline**, not from a hand-made plain.html: preview them first and run the harness with `--fragments <branch-host>` (it fetches
   `<path>.plain.html` and the media it references into the serve dir). The pipeline's wrapping differs from an authored file in three known places, and
   the runtime adds one — `loadFragment` runs `decorateMain`, so a fragment section's default content sits in `.default-content-wrapper` and a header /
   footer decorate that reads `:scope > p` of the section finds nothing (the footer lost two sections). The three: a block cell holding one paragraph
   loses its `<p>`; a list item that also holds a nested list keeps its own text in `<p>` — the fold applies both, and a decorate that reads an item's
   own text reads its `p` child; a picture in a link in a list item is split into its own `<p><a><picture>` (author an icon token instead). The harness
   also requests every remote media URL once (the branch host renders a rendition on first request). **The gated prototype is the runtime page the
   harness serves**, not the serialised file: JS-driven state (fixed colour layers, header morph, autoplay, parallax) is part of the pixels; the
   serialised file is the review artifact and the vocabulary-gate input. Serve the dir with `scripts/serve.mjs` (concurrent: parallel sessions on a
   single-threaded server measured half-styled pages).

6. **Gate at all three widths** against the cached origin: pixel, Δh, cap-probe compare, clip, content-presence; motion-compare at the base width plus
   `click-state` for the panels the frame sampler is blind to and `hover-diff` for the hovers it reads as dead. Read the section-height table and the pairing
   **at all three widths** before touching CSS; `pair` prints group offsets — anchors sharing one Δx are a displaced bar, whatever the tolerance says. Between
   CSS rounds gate the base width only (`gate --widths <base>`); the three widths and the probes once the tables are clean. A round may change only properties
   those tables name; a round whose target bands do not move is void. The 1–2 px class: rows within 2 px that turn a whole text band red come from inline-block
   baselines, mixed font sizes on one line and margins that do not collapse through a flex item — read `deep-probe` on both sides; the fix is a display /
   line-height / margin rule, never a pixel value (fluid type gives fractional heading heights: read the unrounded boxes before pinning). Its 30 px member: a
   block's margin collapses through `.x-wrapper` into the section's (max, not sum) — a clean chain offset in the section table, nothing in the pair; module
   spacing goes on the section as padding, never as a block margin. A live `span` in a heading is its glyph box, the build's `h2` the line box: `pair` reads
   such rows as the line box (≈) — a residual ±3 there is font metrics, not layout. `motion-observe` resolves a selector to its *first* match, visible or not (a
   hidden duplicate nav reads every hover as dead): read parity from `hover-diff`. Probes and `click-state` take CSS selectors only, no Playwright
   pseudo-classes; `gate` refuses them, and drops a click probe whose live target is a link that navigates (the click destroys the live context and the whole
   motion run) — hover the item, or `click-state --hover <css>` alone for a hover-only panel whose toggle is hidden to mouse users. On a hover-opened menu a
   click toggles it shut: hover first, on the build too (`click-state --hover`; it prints the control's `aria-expanded`); a control inside a closed panel takes
   its opener first (`--click <opener> --click <item>`). `gate` prints the failing cap-probe rows under the verdict; on a `main`-less origin pass the live
   content root as `gate --main <css>` (cap-probe's body default fails every build). Look at `diff-<W>-top.png` (the chrome band) every round, and crop the
   hottest band of the **first** gate before any CSS round (a 1 % header band was a bar displaced by a column; three bands were uppercase text no table showed).
   A red photo band has four causes the diff draws alike — displacement, scale, rendition, paint over it: `shift-probe` on the region (best shift, scale,
   luminance ratio) and `crop --vs` (live | build at 1:1) name it in one run; a crop alone shows red. When the question is a size (a responsive
   `background-size`, a logo's painted width) `extent` reads the bbox of a colour or of the non-background pixels in a region of the capture: a computed value
   is one element in one state, the extent is what was painted. **Stop rule.** Once every section row is within 2 px at the three widths and the residual bands
   are named in the register (a third-party layer, a video frame, anti-aliasing, a rendition, an entrance the capture caught mid-flight on the live side), ship:
   three more rounds (ibm-home) taught the reviewer nothing.

7. **Deploy the same document and the same code** to a draft path on the branch (preview only) and gate the served page at the same three widths, same
   motion probes, **and the hidden states** (`click-state --hover`, `hover-diff`): a drawer at rest is read by no table, and a fragment decorate meets
   the pipeline's wrapping only here. Expect the prototype's numbers; `gate` caches the origin per `--out` dir — pass `--origin <prototype gate dir>` so
   both gates compare against one capture, not a new noise sample. Verify the synced *content*, not only a 200 (`sync-poll` compares the decompressed
   body with the pushed commit's file). Any gap is a runtime difference, found with the leak table (`scripts/leak.mjs`, prototype vs served, one row per
   wrapper, header and footer included) — never by eye. Known served-only difference: the pipeline leaves the metadata block behind as an **empty
   section** the harness fold drops, so a section-rhythm rule (`.section + .section`) adds a gap only on the served page — exclude empty sections (`main
   > .section:not(:has(> *))`). The template run ends by writing the site profile — `site-profile init migration/cases/<template> --out migration/site.json`
   (overlays, cap model, fonts and body row, tokens, chrome selectors, heights and states per width, fragment paths, DA coordinates, serve port, noise
   floor, this page's numbers; `site-profile print` renders it for the README) — the state every later page run reads instead of re-discovering it.

8. **Approval = block approval.** Prototype, blocks, authored document, triage table, deviations and motion registers are one artifact. The prototype
   number becomes the page's budget for rollout.

## Instruments (`scripts/`, each prints its usage without arguments; capture, compare and lint tools vendored unmodified under `tools/` — see NOTICE)

- Step 1 — `probe-load` (first look at one or several widths: status, overlays, fixed layers, shadow roots), `probe-structure` (structure dump; `--pierce`
  shadow roots), `content-dump` + `content-view` (the authoring input: full texts with font and text-transform, line runs as one paragraph, lazy media;
  `--hidden` roots), `media-list`, `media-fetch` (the dump's media bytes, a-z0-9 names, manifest), `live-spec` (per-node measurement per width, control boxes,
  line runs, 0-height spacing, entrance states with their rest box; writes the DOM), `scroll-probe` (layers at a scroll ladder, `--paint` children, `--up`),
  `deep-probe` (rect + paint incl. pseudo-elements; ` >> ` into shadow roots; `--children`; `--sels` a file or a list), `measure-view` / `measure-to-spec` (the
  vendored `measure --json` for a bot-managed origin), `origin-pick`, `click-dump` (a click sequence's panel content: captions, tab panels, sub-menus; JSON for
  `harness --content`), `text-ladder` (a text sampled over time: a count-up's duration and easing), `video-frame` (a `<video>` at t = 0 at 2×, or an iframe
  player's box with its overlays hidden), `da-put` (DA source PUT + branch preview; warns on upper case, `--`, `_` and dots), `sync-poll` (the code bus serves
  the pushed commit's files).
- Step 2 — `block-inventory` (scan `blocks/*/` + a case's register, dump and document into `migration/blocks.json`: block, variant, shape,
  collection, rows × cols, authoring example, source signature, budget; `diff` a triage against it; `print`), `triage` (the draft triage table from a
  content dump as JSON and markdown: per section fingerprint, repeat, media ratio, source classes, inventory / collection / new match with confidence,
  default content, rows × cols; the page's novelty; `lib/fingerprint.mjs` holds the rules).
- Step 5 — `serve` (concurrent static server, boilerplate symlinks), `harness` (lint → fold (cell and list-item rules) → warm the remote media → runtime
  → serialise; refuses a 🔴; `--fragments` fetches the pipeline's plain.html and media; `--content` checks the authored texts against the capture and the
  click dumps, comma-separated).
- Steps 6–7 — `sections` (section-height table paired by first *visible* on-page anchor), `pair` (text-anchored pairing with box, font, colour and
  text-transform deltas, group offsets; ⌗ control with control, ≈ line box, ⤷ line of a split paragraph, a `display: contents` box from its contents), `gate`
  (stitch-shot, pixel-compare, cap-probe with `--main`, motion-observe/compare at the three widths; prints the table and the failing cap rows), `hover-diff`
  (first visible match), `click-state` (`--hover` first or alone; repeated `--click` for a control inside a closed panel; prints the panel and the control's
  `aria-expanded`), `leak` (every wrapper, prototype vs served), `crop`, `extent` (painted bbox of a colour / alpha / non-background pixels in a region of a
  capture).
- Page-specific probes (a sticky bar's state machine, an icon-sprite inventory, a document generator) live in `cases/*/scripts` as templates.
- Every instrument that opens a page takes `--consent`, `--dismiss <css,…>`, `--locale <tag>` and `--require <css,…>` (`common.mjs openPage`;
  `--require` exits 4 when the session is not the composition the origin shows); `gate` passes the overlay options to the live capture side. `settle`
  reads after the fonts, every image and every finite animation — a table read before them is not a measurement.

## Deviations register (write it in step 3)

Per template, one table: source feature → decision → pixel cost, plus the triage columns (default content | block, shape, collection match).
Session-variable regions and instrument artifacts are rows of their own with their band cost. Kinds: a **rotating region** (pick the origin with
`origin-pick`); **per-load text** (a tracking phone number); **per-session content in a fixed-geometry slot** (a personalised carousel — `origin-pick`
never converges; keep the best try, register the slot); **per-instance styling** (a style-system value on one card that a block cannot author per row:
take the majority value, match the *row* height side by side, register the chain where the items stack); a **mobile-only DOM instance with other copy**
(a shorter promo text, a banner without its button: the desktop composition is authored; the row says whether the extra line shifts the chain or is
clamped to the measured box — one clipped line, 0 px); a **live entrance caught mid-flight** (the chunked capture's wait catches a scroll-triggered
reveal that straddles a chunk boundary, or a count-up at an intermediate value, deterministically: both noise-floor captures agree, so the floor hides
it; `shift-probe` reads no shift and a ratio ≠ 1; `text-ladder` gives the function).

## Anti-patterns (v1 list, plus what v2 saw)

- Copying `#mainContent` verbatim to zero the content-diff. Hand-writing the decorated DOM. `min-height` pins to a band. Re-assertions without the block
  root. Gating at two widths. Validating on a screenshot. Zero-width spacer paragraphs.
- **Authoring for the decorate.** A title as block row 1 because the block needs it; a photo as a row because CSS wants a URL; a region's offices as
  thirteen columns because the block groups them. All three read as one page and fail David's Model.
- **Gating the serialised DOM** on a page whose chrome is JS-driven (the file is static, the numbers fiction). **Reading `img.src` for backgrounds** (a
  750 px rendition). **Trusting the hover probe's "dead"** (a `::before` underline and a child colour are invisible to it). **A desktop `justify-self`
  on a grid item** (Chrome applies it to block-level boxes too; a mobile `display:block` collapses it).
- **Reading the band number instead of the band** (a 1.2 % top band was the header bar 3 px off). **Reading a composition as noise** (a 30 % self-diff
  with a 500 px Δh is two pages). **Re-encoding media** (the source's bytes are the origin's pixels). **Inheriting the boilerplate as if measured**
  (rules no spec row asked for; a body weight the browser chose). **Measuring before the fonts swap** or mid-flight (a lazy `fonts.css`, a running
  entrance: two runs of one page disagree). **Reading DOM text as the rendered text** (uppercase by CSS; a header fixed at one width read as fixed
  everywhere) — the first diff crop shows what the tables cannot. **Reading the painted set as the authoring set** (3 cards of 18; one line of a
  paragraph; a caption that exists only for the active slide).

## What the skills must change (v1 list, plus)

- replica Phase 3: steps 2–5 above replace "recreate"; triage and lint precede the harness; the prototype is the runtime page. `stitch-shot`: per-chunk
  settle (a ScrollSmoother origin captured mid-lag, self-diff 1.65 %), freeze `<video>` inside shadow roots. `motion-observe`: first *visible* match.
  `gate-all`: a page list; no PASS without the wide row. `extract`: the `live-spec` JSON per width. `eds-new-site`: trigger the branch code sync and
  poll (`sync-poll`). `davids-model-lint`: accept a qualified video link in a container row (#13).
