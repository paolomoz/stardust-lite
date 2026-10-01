# Blocks-first prototyping, v2 — the replica procedure that transfers to EDS without loss

Sources, one case per version (pixel diff at 360 / 1440 / probe; served page = prototype from v2.1 on; each case's REPORT names what it
taught). v1 usta.com pilot — only "author rows → write the block → the runtime produces the prototype" transferred. v2 baincapital.com
(`cases/baincapital-home`) — pixel-faithful and **failed David's Model** (3 🔴): authored for the decorate, not for an author. v2.1
travelers.com (`travelers-home`, 3.26 / 1.09 / 0.57 %) — shell rule, round discipline, deep probes. v2.2 ibm.com (`ibm-home`, 4.04 / 2.39 /
3.28 %) — shadow DOM, overlays, hosted video, step-2 checkpoint, stop rule. v2.3 walgreens.com (`walgreens-home`, 8.48 / 2.84 / 1.62 %) —
composition gate, three cap placements, boilerplate rules as measurements, control pairing. v2.4 stryker.com (`stryker-home`, 10.27 / 1.98 /
2.21 %) — consent that reloads, fonts as a precondition, percent geometry, margin collapse, glyph vs line box. v2.5 usta.com (`usta2-home`,
9.51 / 1.89 / 4.17 %) — text-transform in the tables, fixed layers per width, pictures in `<p>`, 0-height spacing, mobile-only copy.

## The rule

A prototype is the branch runtime's decoration of an **authored document that a person could have typed in a doc**, styled by the
block CSS that will ship. Nobody types decorated markup. Nothing is copied from the source DOM. The source is measured, never
cloned. The document is written in reading order; blocks hold only what default content cannot.

## Prerequisites (exist before the first row is authored)

| artifact | produced by | notes |
|---|---|---|
| repo + branch + DA site, code synced on the branch | `eds-new-site`, then `POST admin.hlx.page/code/<org>/<site>/<branch>/*` | new branches did not sync on push in 2026-09; trigger and poll with `scripts/sync-poll.mjs` (md5 of the decompressed body against the repo file; a push reached the bus in 10 s once and in > 200 s the next time — poll for minutes and record the time) |
| archetype list: which page represents which template | `prepare-migration` | one page per template is prototyped; the rest is rollout |
| page capture: texts, hrefs, media URLs, hidden DOM | `extract` page capture, or `scripts/live-spec.mjs` (writes the DOM too) | hidden DOM (mobile duplicates, `display:none` promos) is NOT content: pick one composition. A **web-components origin** (custom elements, shadow roots, no `main`) keeps its paint, boxes and hover states inside shadow roots: light-DOM `querySelectorAll` reads slotted text but no paint and calls every hover dead. Count the shadow roots in the first look; use the composed-tree tier (`deep-probe` / `hover-diff` with ` >> ` selectors, `DEEP_HELPERS` in `common.mjs`) for paint and motion, and dump the structure through the shadow roots before triaging |
| overlays and locale | `--consent <css>` **and** `--dismiss <css,…>` **and** `--locale <tag>` on every instrument | consent is one overlay; a geo-mismatch modal (full viewport, in the visitor's language, over the pinned locale's page) or a marketing interstitial is another. Find both in the first look; pass both to every tool; the origin captures need the locale pinned or a geo-redirecting site captures a different page per run. A consent accept may **reload the page** (OneTrust "reload on consent"): `openPage` waits the navigation out; a tool that does not survive it takes the close/reject control instead |
| per-node measurement per width (spec JSON) | `scripts/live-spec.mjs <url> <W> --sections <sel> --consent <sel>` | box, paint, font family/size/line-height/weight/transform/align/colour per text node; box and fit per image. One JSON per width |
| probe width and container model | `tools/replica/cap-probe.mjs <url>` capture | probe = max(2560, largest cap × 1.25) |
| origin captures per width | `stitch-shot.mjs <url> live-<W>.png --width W --settle` | cache them: every gate round compares against the same origin; capture the live page twice once and keep the self-diff as the noise floor. A self-diff band far above the others is not noise but a **composition** (an A/B alert, a personalised slot that holds a carousel in one session and a banner in the next — walgreens-home read 33.6 % between two loads): name the regions, pick one composition, capture the origins in it and pass its markers as `--require <css,…>` to every measurement instrument — a run in another session exits 4 |
| third-party slots (ads, sponsored modules) | measure the slot's box per width, not the creative | a key-value block reserves the slot and loads nothing; the creative is a register row with its band cost — it is neither media nor hosted video |
| scroll-state probes when the site is scroll-driven | `scripts/scroll-probe.mjs` | fixed-layer colour thresholds, header states, scroll-linked transforms, autoplay periods — measured BEFORE code |
| motion observation | `motion-observe.mjs` on the live page, plus a deep hover diff (pseudo-elements, subtree) | the hover probe alone reads no `::before` underline and no colour on a child; the deep diff does |
| fonts | download the source's woff2 files into `/fonts` | `live-spec` records family/weight/style in use |
| media | collect and download the source's **bytes** (`scripts/media-fetch.mjs` from the content dump: webp stays webp, lower-case names, no double hyphen — DA accepts `kids--x.jpg` and the branch host previews it 404), upload them to a draft media folder on the site and preview (`scripts/da-put.mjs`, documents too), reference the preview URL in the document | DA and the pipeline store them unchanged and serve optimised renditions; re-encoding to jpg costs ≈ 1 % in photo bands (travelers-home r1 → r2) |
| hosted video | author the source's own player URL as the link and a **poster picture of the frame the live capture shows** (`scripts/video-frame.mjs`: the player paused at t = 0 at 2×; the entry thumbnail is usually another frame — check it against the live crop); the block renders `<video>` only for a file link | a hosted player's (Kaltura, Brightcove) downloadable files are protected or not decodable, the pipeline serves an uploaded mp4 as `application/octet-stream` (which `<video>` refuses) and the gate browser may not decode the codec anyway; two rounds were spent finding that out (ibm-home). Test decodability with one `<video>` before lifting a file |
| paint that is not on a node | `scripts/deep-probe.mjs <url> <W> --sels …` on the elements the spec shows without paint | `::before`/`::after` (curved edges, underlines, elevation shadows) are invisible to `live-spec` |

## Procedure, per template

1. **Measure the source at three widths** (360, 1440, probe): `probe-load` at **every gated width** (status, overlays, fixed layers,
   shadow roots — a header fixed at the base width may scroll at 360; building it fixed there was 20 % of the 360 number), `probe-structure`
   (the section selector for `live-spec --sections`), `content-dump` read through `content-view` (the authoring input: full texts in
   reading order with inline markup, links, media, boxes, and the font string with `text-transform` — the dump holds DOM text, the page
   may render it uppercase and no table shows the case), `media-list`, `live-spec`. Every run is one session: on a page with
   session-variable composition each takes `--require`. Also measure the scrolled states: which fixed layers change, when, by what
   function. Record tables, not screenshots.

2. **Triage every section into a content model — before any block exists.** Walk each measured section top to bottom and write what an
   author would type: heading, paragraph, image, link. Whatever is left is a block. Then, per block, decide and write down:
   - **shape** — one of David's three: *simple* (one property per row), *key-value* (configuration only: section-metadata, backgrounds,
     renditions, feed sources), *container* (own rows, then one row per child, ≤ 4 columns, one property per column). A composition that
     fits none is a modelling error (D1/D2/D10), not a fourth shape.
   - **Block Collection match** — hero, cards, columns, tabs, accordion, carousel, quote, embed. If it matches, take the name and the
     authoring shape; the site's look is a variant or the block's CSS. A site-specific name is for what the collection has no shape for.
   - **default content around it** — section heads, ledes and closing CTAs are default content; the block decorate may *move* them into
     its DOM but the document keeps them where an author expects them.
   - **embeds in repeating units** — a video that belongs to a card is a fully qualified link in that card's row; the block opens the
     player. Auto-blocking is for a video that stands alone in a section.
   - **configuration** — a per-section background, a rendition per breakpoint, an autoplay period: section-metadata keys, never a block row.
   - **a 0-height live section is a spacing measurement** (a margin container; `live-spec` flags it with its margin): write it down with
     the section it precedes, per width — the same container collapses to 0 above its cap.
   - **content that exists only for a signed-in or returning visitor** ("buy again", "recently viewed") is not authored: reserve its
     measured geometry with a link to a fragment or widget the runtime fills, and register it.
   Output: the triage table (section → default content | block name, shape, collection match, rows × cols) in the deviations register.
   Run `davids-model-lint.mjs` on the authored document now; a 🔴 is a modelling defect and the harness refuses to fold it (step 5).
   **This is the first deliverable.** Preview the three documents on the branch as soon as they lint clean and share the URLs with the
   triage table: an author can approve the content model before a block exists.

3. **Author the document** from the triage table. Section styles for the source's spacing (authored, not by position), section-metadata
   for configuration, `<em>` for accents, bold/italic links for button weight (the block decides the variant). A picture on its own line
   is a paragraph: author it in `<p>` (the pipeline emits `<p><picture>`; the runtime wraps a bare picture-first cell into one `<p>` with
   whatever follows — two table rounds). Type every text from the capture (`content-view`, never a truncating viewer; `harness --content
   <content.json>` names each authored text the dump does not hold). Write the deviations register at the same time: every per-instance
   source parameter → variant / section style / accepted deviation with its pixel cost.

4. **Write the block: decorate + CSS + JS for its motions.** Decorate moves authored nodes into a small named DOM. CSS values come from
   step 1 only. Every selector carries the block root, and the template body class when the site has more than one template. Geometry
   above 1440 is fractions or vw from the probe measurement, never the 1440 pixel value; a source percentage is a fraction of **that
   element's** containing block (`padding-top: 20%` of the column content, not the grid area; an overlay's `top: 10%` of the picture only
   as the picture box's child) — read the parent's width in the spec, `calc()` against the same box, `deep-probe` on the build. Re-read
   every spacing and cap at the probe width too: a column that is a fraction of the viewport, an overflow, a margin that collapses to 0
   above its cap are right at 1440 and wrong at 2560. Mobile in the block's own media query, and every positional property the mobile
   query sets (`top`, `transform`, `position`) is reset in the desktop one. Default content a block splits (section head before, closing
   link after) is two `.default-content-wrapper`s: style the first for the head and the last for the link, never "the" wrapper's
   `:first-child`. Resets go in `:where()`: an id in a reset (`nav#nav button`) outranks every class rule the block writes. A block that
   paints an authored image as a background reads the pipeline's large rendition (`<picture> > source[media]`), not `img.src`.
   cap-probe's *kind* names the CSS placement: a **shell** cap goes on `main` (`max-width`, centred; full-bleed section styles bleed out
   of it with `margin: 0 calc(50% - 50vw)`); a **content** cap on `main > .section`; **module** caps under a fluid shell go on
   `main > .section > div` while `main` and the sections stay fluid so the band colours bleed. A cap one level too high passes 1440 and
   fails cap-probe and every wide band. Chrome follows the same shell: a header bar anchored to the viewport passes at the base width and
   is wrong on every wider screen. The boilerplate's `styles.css` / `scripts.js` are not measurements: before the first harness strip them
   to what the spec says (`decorateButtons` makes every `p > strong > a` a button, `a:any-link { overflow-wrap }` breaks a long brand
   name, `main > .section > div { max-width }` is a cap the source may not have); the fragments inherit the same rules. Fonts are a
   measurement precondition: the boilerplate loads `fonts.css` lazily and a table read before the swap measures fallback metrics; load
   them from `styles.css` while gating (the instruments wait for `document.fonts.ready`).

5. **Produce the prototype with the harness** (`scripts/harness.mjs`): lint → fold (section-metadata → classes, metadata → `<meta>`,
   empty sections dropped) → load with the branch runtime → wait for every block `data-block-status="loaded"` → serialise. The
   fragments (`nav`, `footer`) come from the **pipeline**, not from a hand-made plain.html: preview them first and run the harness with
   `--fragments <branch-host>` (it fetches `<path>.plain.html` and the media it references into the serve dir). The pipeline's wrapping
   differs from an authored file in three known places: a block cell holding one paragraph loses its `<p>` (the fold applies this one);
   a list item that also holds a nested list keeps its own text in `<p>` (`<li><p>Software</p><ul>`); a picture in a link in a list item
   is split into its own `<p><a><picture>` (author an icon token instead). **The gated prototype is the runtime page the harness
   serves**, not the serialised file: JS-driven state (fixed colour layers, header morph, autoplay, parallax) is part of the pixels. The
   serialised file is the review artifact and the vocabulary-gate input. Serve the dir with `scripts/serve.mjs` (concurrent — a
   single-threaded server under parallel sessions timed out the blocks-loaded wait and the tables measured half-styled pages).

6. **Gate at all three widths** against the cached origin: pixel, Δh, cap-probe compare, clip, content-presence; motion-compare at the base
   width plus `click-state` for the panels the frame sampler is blind to and `hover-diff` for the hovers it reads as dead. Read the
   section-height table and the pairing **at all three widths** before touching CSS; `pair` prints group offsets — anchors sharing one Δx
   are a displaced bar, whatever the tolerance says. Between CSS rounds gate the base width only (`gate --widths <base>`); the three
   widths and the probes once the tables are clean. A round may change only properties those tables name; a round whose target bands do
   not move is void. The 1–2 px class: rows within 2 px that turn a whole text band red come from inline-block baselines, mixed font sizes
   on one line and margins that do not collapse through a flex item — read `deep-probe` on both sides; the fix is a display / line-height /
   margin rule, never a pixel value. Its sub-pixel member: fluid type gives fractional heading heights; read the unrounded boxes before
   pinning anything. Its 30 px member: a block's margin collapses through `.x-wrapper` into the section's (max, not sum) and a first
   child's top margin moves the *section* — a clean chain offset in the section table, nothing in the pair; spacing the source puts on a
   module goes on the section as padding, never as a block margin. A live `span` in a heading is its glyph box, the build's `h2` the
   line box: `pair` reads such rows as the line box (≈) — a residual ±3 there is font metrics, not layout.
   `motion-observe` resolves a selector to its *first* match, visible or not: a hidden duplicate nav reads every hover as dead — reach the
   visible copy (an id, `:nth-of-type`) and read parity from `hover-diff` (first visible match). Probes and `click-state` take CSS
   selectors only, no Playwright pseudo-classes; `gate` refuses them. On a hover-opened menu a click toggles it shut: hover first, on the
   build too (`click-state --hover`; it prints the control's `aria-expanded`). `gate` prints the failing cap-probe rows under the verdict;
   on a `main`-less origin pass the live content root as `gate --main <css>` — cap-probe's body default reads one section and fails every
   build. Look at `diff-<W>-top.png` (the chrome band) every round, and crop the hottest band of the **first** gate before any CSS round:
   a 1 % header band held a bar displaced by a whole column, three 1440 bands were uppercase text no table showed, a heading clamp with an
   ellipsis at 360 was invisible to every instrument and obvious in one crop.
   **Stop rule.** Once every section row is within 2 px at the three widths and the residual bands are named in the register (a
   third-party layer, a video frame, anti-aliasing, a rendition), ship: three rounds took ibm-home from 2.89 to 2.39 % and the reviewer
   gained nothing a register row did not say. Register every session-variable region (autoplay slide at freeze time, per-load photo) and
   every instrument artifact (smooth-scroll lag, JS entrances captured mid-flight) with its band cost.

7. **Deploy the same document and the same code** to a draft path on the branch (preview only) and gate the served page at the same
   three widths, same motion probes. Expect the prototype's numbers. Verify the synced *content*, not only a 200 (`sync-poll` compares
   the decompressed body with the pushed commit's file). Any gap is a runtime difference, found with the leak table (`scripts/leak.mjs`,
   prototype vs served, one row per wrapper, header and footer included) — never by eye. Known served-only difference: the pipeline
   leaves the metadata block behind as an **empty section** the harness fold drops, so a section-rhythm rule (`.section + .section`) adds
   a gap only on the served page — exclude empty sections (`main > .section:not(:has(> *))`).

8. **Approval = block approval.** Prototype, blocks, authored document, triage table, deviations and motion registers are one artifact.
   The prototype number becomes the page's budget for rollout.

## Instruments (`scripts/`; the capture, compare and lint tools are vendored unmodified under `tools/` from the stardust plugin — see NOTICE)

Each prints its usage without arguments.
- Step 1 — `probe-load` (first look, one or several widths: status, overlays, fixed layers, shadow roots), `probe-structure` (structure
  dump; `--pierce` shadow roots), `content-dump` + `content-view` (the authoring input, full texts with font incl. text-transform),
  `media-list`, `media-fetch` (the dump's media bytes, lower-case names, manifest), `live-spec` (per-node measurement per width; control
  boxes; 0-height sections flagged with their margin; writes the DOM), `scroll-probe` (layers at a scroll ladder, `--up`), `deep-probe`
  (rect + paint incl. pseudo-elements; ` >> ` into shadow roots; `--children`), `measure-view` / `measure-to-spec` (the vendored `measure
  --json` for a bot-managed origin), `origin-pick`, `video-frame` (a hosted player's frame at t = 0 at 2×), `da-put` (DA source PUT +
  branch preview; warns on upper case and double hyphens), `sync-poll` (the code bus serves the pushed commit's files).
- Step 5 — `serve` (concurrent static server, boilerplate symlinks), `harness` (lint → fold → runtime → serialise; refuses a 🔴;
  `--fragments` fetches the pipeline's plain.html and media; `--content` checks the authored texts against the capture).
- Steps 6–7 — `sections` (section-height table paired by first *visible* on-page anchor), `pair` (text-anchored pairing with box, font,
  colour and text-transform deltas, group offsets; ⌗ control with control, ≈ line box), `gate` (stitch-shot, pixel-compare, cap-probe with
  `--main`, motion-observe/compare at the three widths; prints the table and the failing cap rows), `hover-diff` (first visible match),
  `click-state` (`--hover` first; prints the panel and the control's `aria-expanded`), `leak` (every wrapper, prototype vs served), `crop`.
- Page-specific probes (a sticky bar's state, an icon-sprite inventory, a nav dump with the site's menu selectors, a document generator)
  live in `cases/*/scripts` as templates.
- Every instrument that opens a page takes `--consent`, `--dismiss <css,…>`, `--locale <tag>` and `--require <css,…>` (`common.mjs openPage`;
  `--require` exits 4 when the session is not the composition the origin shows); `gate` passes the overlay options to the live capture side.

## Deviations register (write it in step 3)

Per template, one table: source feature → decision → pixel cost. v2 adds the triage columns (default content | block, shape, collection
match). Session-variable regions and instrument artifacts are separate rows with their band cost. Row kinds: a **rotating region** (pick
the origin with `origin-pick`); **per-load text** (a tracking phone number); **per-session content in a fixed-geometry slot** (a
personalised carousel — `origin-pick` never converges; keep the best try, register the slot); **per-instance styling** (a style-system
value on one card that a block cannot author per row: take the majority value, match the *row* height side by side, register the chain
where the items stack); a **mobile-only DOM instance with other copy** (a shorter promo text, a banner without its button: the desktop
composition is authored; the row says whether the extra line shifts the chain or is clamped to the measured box — one clipped line, 0 px).

## Anti-patterns (v1 list, plus what v2 saw)

- Copying `#mainContent` verbatim to zero the content-diff. Hand-writing the decorated DOM. `min-height` pins to a band. Hand-written
  re-assertions without the block root. Gating at two widths. Validating on a screenshot. Zero-width spacer paragraphs.
- **Authoring for the decorate.** A title as block row 1 because the block needs it; a photo as a row because CSS wants a URL; a region's
  offices as thirteen columns because the block groups them. All three read as one page and fail David's Model.
- **Gating the serialised DOM** on a page whose chrome is JS-driven (the file is static, the numbers fiction). **Reading `img.src` for
  backgrounds** (a 750 px rendition). **Trusting the hover probe's "dead"** (a `::before` underline and a child colour are invisible to it).
  **A desktop `justify-self` on a grid item**: Chrome applies it to block-level boxes too; a mobile `display:block` override collapses it.
- **Reading the band number instead of the band** (1.2 % in the top band was the whole header bar 3 px off). **Reading a composition as
  noise** (a 30 % self-diff with a 500 px Δh is two pages). **Re-encoding media** (the source's bytes are the origin's pixels).
  **Inheriting the boilerplate as if measured** (three of four rounds fixed rules no spec row had asked for). **Measuring before the
  fonts swap** (a lazy `fonts.css` makes two runs of one page disagree). **Reading DOM text as the rendered text** (uppercase by CSS; a
  header fixed at one width read as fixed everywhere) — the first diff crop shows what the tables cannot.

## What the skills must change (v1 list, plus)

- replica Phase 3: steps 2–5 above replace "recreate"; triage and lint precede the harness; the prototype is the runtime page.
- `stitch-shot`: per-chunk settle (a ScrollSmoother origin captured mid-lag, self-diff 1.65 %), freeze `<video>` inside shadow roots.
  `motion-observe`: first *visible* match. `gate-all`: a page list; no PASS without the wide row. `extract`: the `live-spec` JSON per width.
  `eds-new-site`: trigger the branch code sync and poll (`sync-poll`). `davids-model-lint`: accept a qualified video link in a container row.
