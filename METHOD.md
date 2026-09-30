# Blocks-first prototyping, v2 — the replica procedure that transfers to EDS without loss

v1 source: usta.com pilot, 2026-09-29 (three approaches, same pages, same gate; only "author rows → write the block → the
runtime produces the prototype" transferred: prototype 15.8 % → EDS page 16.4 %, zero rounds after deploy).
v2 source: baincapital.com home, 2026-09-29/30 (`cases/baincapital-home`). v1 followed to the letter produced a page that was
pixel-faithful (prototype 27.2 / 34.6 / 23.3 %, served 23.8 / 34.4 / 23.6 % at 1440 / 360 / 2560, leak table identical) and
**failed David's Model** (3 🔴, 5 🟡): the document was authored for the block's decorate, not for an author. v2 changes what
step 2 produces so the structure is right by construction, and names the prerequisites v1 assumed silently.

## The rule

A prototype is the branch runtime's decoration of an **authored document that a person could have typed in a doc**, styled by the
block CSS that will ship. Nobody types decorated markup. Nothing is copied from the source DOM. The source is measured, never
cloned. The document is written in reading order; blocks hold only what default content cannot.

## Prerequisites (exist before the first row is authored)

| artifact | produced by | notes |
|---|---|---|
| repo + branch + DA site, code synced on the branch | `eds-new-site`, then `POST admin.hlx.page/code/<org>/<site>/<branch>/*` | new branches did not sync on push in 2026-09; trigger and poll one block file to 200 |
| archetype list: which page represents which template | `prepare-migration` | one page per template is prototyped; the rest is rollout |
| page capture: texts, hrefs, media URLs, hidden DOM | `extract` page capture, or `scripts/live-spec.mjs` (writes the DOM too) | hidden DOM (mobile duplicates, `display:none` promos) is NOT content: pick one composition |
| per-node measurement per width (spec JSON) | `scripts/live-spec.mjs <url> <W> --sections <sel> --consent <sel>` | box, paint, font family/size/line-height/weight/transform/align/colour per text node; box and fit per image. One JSON per width |
| probe width and container model | `tools/replica/cap-probe.mjs <url>` capture | probe = max(2560, largest cap × 1.25) |
| origin captures per width | `stitch-shot.mjs <url> live-<W>.png --width W --settle` | cache them: every gate round compares against the same origin; capture the live page twice once and keep the self-diff as the noise floor |
| scroll-state probes when the site is scroll-driven | `scripts/scroll-probe.mjs` | fixed-layer colour thresholds, header states, scroll-linked transforms, autoplay periods — measured BEFORE code |
| motion observation | `motion-observe.mjs` on the live page, plus a deep hover diff (pseudo-elements, subtree) | the hover probe alone reads no `::before` underline and no colour on a child; the deep diff does |
| fonts | download the source's woff2 files into `/fonts` | `live-spec` records family/weight/style in use |

## Procedure, per template

1. **Measure the source at three widths** (360, 1440, probe). Also measure the states the page has when scrolled: which fixed layers
   change, when, and by what function. Record them as tables, not screenshots.

2. **Triage every section into a content model — before any block exists.** Walk each measured section top to bottom and write what an
   author would type: heading, paragraph, image, link. Whatever is left is a block. Then, per block, decide and write down:
   - **shape** — one of David's three: *simple* (one property per row), *key-value* (configuration only: section-metadata, backgrounds,
     renditions, feed sources), *container* (own rows, then one row per child, ≤ 4 columns, one property per column). A composition that
     fits none is a modelling error (D1/D2/D10), not a fourth shape.
   - **Block Collection match** — hero, cards, columns, tabs, accordion, carousel, quote, embed. If it matches, take the name and the
     authoring shape; the site's look is a variant or the block's CSS. A site-specific name is for structures the collection has no shape
     for.
   - **default content around it** — section heads, ledes and closing CTAs are default content; the block decorate may *move* them into
     its DOM (`header`, `news` did) but the document keeps them where an author expects them.
   - **embeds in repeating units** — a video that belongs to a card is a fully qualified link in that card's row; the block opens the player.
     Auto-blocking is for a video that stands alone in a section.
   - **configuration** — a per-section background image, a map rendition per breakpoint, an autoplay period: section-metadata keys
     (`style`, `background`, `map-wide`, …), never a block row.
   Output: the triage table (section → default content | block name, shape, collection match, rows × cols) in the deviations register.
   Run `davids-model-lint.mjs` on the authored document now; a 🔴 is a modelling defect and the harness refuses to fold it (step 4).

3. **Author the document** from the triage table. Section styles for the source's spacing (authored, not by position), section-metadata
   for configuration, `<em>` for accents, bold/italic links for button weight (the block decides the variant). Write the deviations register
   at the same time: every per-instance source parameter → variant / section style / accepted deviation with its pixel cost.

4. **Write the block: decorate + CSS + JS for its motions.** Decorate moves authored nodes into a small named DOM. CSS values come from
   step 1 only. Every selector carries the template body class and the block root. Geometry above 1440 is fractions or vw from the probe
   measurement, never the 1440 pixel value. Mobile in the block's own media query. A block that paints an authored image as a background
   reads the pipeline's large rendition (`<picture> > source[media]`), not `img.src` (a 750 px rendition on the served page).

5. **Produce the prototype with the harness** (`scripts/harness.mjs`): lint → fold (section-metadata → classes, metadata → `<meta>`,
   empty sections dropped) → load with the branch runtime → wait for every block `data-block-status="loaded"` → serialise. **The gated
   prototype is the runtime page the harness serves**, not the serialised file: JS-driven state (fixed colour layers, header morph,
   autoplay, parallax) is part of the pixels. The serialised file is the review artifact and the vocabulary-gate input.

6. **Gate at all three widths** against the cached origin: pixel, Δh, cap-probe compare, clip, content-presence; motion-compare at 1440
   plus a state probe for click states the frame sampler is blind to (class-toggled panels, tabs, list views). Read the section-height
   table and the text-anchored pairing before touching CSS. A round may change only properties those tables name; a round whose target
   bands do not move is void. Register every session-variable region (autoplay slide at freeze time, per-load photo) and every
   instrument artifact (smooth-scroll lag, JS entrances captured mid-flight) with its band cost; they are not defects to chase.

7. **Deploy the same document and the same code** to a draft path on the branch (preview only) and gate the served page at the same
   three widths, same motion probes. Expect the prototype's numbers. Any gap is a runtime difference, found with the leak table
   (`scripts/leak.mjs`, prototype vs served, one row per wrapper) — never by eye.

8. **Approval = block approval.** Prototype, blocks, authored document, triage table, deviations and motion registers are one artifact.
   The prototype number becomes the page's budget for rollout.

## Instruments (`scripts/`; the capture, compare and lint tools are vendored unmodified under `tools/` from the stardust plugin — see NOTICE)

- `scripts/live-spec.mjs` — per-node measurement per width; also writes the captured DOM.
- `scripts/scroll-probe.mjs` — fixed-layer colours, header classes, transforms of named elements at a scroll ladder.
- `scripts/harness.mjs` — lint → fold → runtime → serialise; refuses a document with a 🔴.
- `scripts/sections.mjs` — section-height table: spec vs build, one row per top-level section.
- `scripts/pair.mjs` — text-anchored pairing: every heading/paragraph start of the spec located on the build; box, font, colour deltas.
- `scripts/leak.mjs` — computed layout of every wrapper on a served page; run on prototype and served page and diff.
- `scripts/gate.mjs` — drives `stitch-shot`, `pixel-compare`, `cap-probe`, `motion-observe`, `motion-compare` from the installed plugin for
  a live/build pair at the three widths without a `state.json`; prints the three-width table.
- `scripts/measure-view.mjs`, `scripts/measure-to-spec.mjs` — readout of `tools/replica/measure.mjs --json` and its conversion to the live-spec schema, for an origin `live-spec` cannot open (bot-managed).
- `scripts/origin-pick.mjs` — capture the origin until its session-variable region (rotating hero) matches the build.
- Deep hover diff and click-state probes are page-specific by nature; `cases/*/motion` hold the ones written so far as templates.

## Deviations register (write it in step 3)

Per template, one table: source feature → decision → pixel cost. v2 adds the triage columns (default content | block, shape, collection
match). Session-variable regions and instrument artifacts are separate rows with their band cost.

## Anti-patterns (v1 list, plus what v2 saw)

- Copying `#mainContent` verbatim to zero the content-diff. Hand-writing the decorated DOM. `min-height` pins to a band. Hand-written
  re-assertions without the block root. Gating at two widths. Validating on a screenshot. Zero-width spacer paragraphs.
- **Authoring for the decorate.** A title as block row 1 because the block needs it; a photo as a row because CSS wants a URL; a region's
  offices as thirteen columns because the block groups them. All three read as one page and fail David's Model. Default content,
  section-metadata, one row per child.
- **Gating the serialised DOM** on a page whose backgrounds or chrome are JS-driven: the file is static, the numbers are fiction.
- **Reading `img.src` for backgrounds**: the pipeline serves a 750 px rendition there.
- **Trusting the hover probe's "dead"**: a `::before` underline and a child colour change are invisible to it; the deep diff sees them.
- **A desktop `justify-self` on a grid item**: Chrome applies it to block-level boxes too, and a mobile `display:block` override collapses
  the box to zero width.

## What the skills must change (v1 list, plus)

- replica Phase 3: steps 2–5 above replace "recreate"; the triage table and the lint precede the harness; the prototype is the runtime page.
- `stitch-shot`: a per-chunk settle option; on a GSAP ScrollSmoother site the 450 ms chunk wait captures the origin mid-lag, reproducibly
  (self-diff 1.65 %), and no build can match it.
- `gate-all`: accept a page list on the command line (live url, build url, slug) instead of `stardust/state.json`; refuse PASS without the wide row.
- `extract`: emit the per-node spec JSON (`live-spec` schema) per width, not tokens only.
- `eds-new-site`: trigger the branch code sync after the first push and poll.
- deploy's `davids-model-lint`: accept a fully qualified video link inside a container row whose link text is not the URL.
