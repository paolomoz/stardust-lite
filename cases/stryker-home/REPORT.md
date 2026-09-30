# www.stryker.com/ch/en/index.html home → EDS, blocks-first v2.3 — run report (2026-09-30 → 10-01)

Site: `aemcoder-adobe/sdt-stryker`, branch `blocks-first` (main untouched). Content: DA `/drafts/home`, `/drafts/nav`, `/drafts/footer`
+ `/drafts/media/*` (23 files = the bytes the live page serves, plus the hero video's live frame at 2×), previewed on the branch only,
nothing published, no PR. Prototype: `migration/cases/home/proto/home.harness.html` on :8971 (runtime harness page, pipeline fragments).
Served page: https://blocks-first--sdt-stryker--aemcoder-adobe.aem.page/drafts/home
Clock: start 23:39:52 CEST; step-2 checkpoint (three documents previewed, lint clean) 23:59:53; **first shareable prototype + served URL
00:25:33 CEST** (46 min: r4 section table within 3 px at 1440 at 00:24, code pushed 00:24:53, code sync polled to the repo's md5 at
00:25:33); final numbers 00:47 CEST (67 min wall).

## Three-width table
Pixel %, cached origin captured once with `--settle --locale en-CH --consent '#onetrust-accept-btn-handler'`, settle on both sides.

| width | noise floor (live vs live) | prototype (r7) | served (r7) | Δh proto / served | notes |
|---|---|---|---|---|---|
| 360 | — (one capture; the 1440 pair shows the page deterministic) | **10.27** | **10.36** | +23 / +23 | bands 0–2700 at 1.6–7.5 % (mobile hero collage rendition, cookie button over "GET TO KNOW US", photo renditions); **3600–6228 at 15.7 / 26.6 / 13.7 %** = the registered +23 px chain below Our focus (focus card 2's per-instance 3 % bottom padding + card 3's subtitle class): every glyph of People, CR, Awards, footer doubled. Every section row above it Δ0 |
| 1440 | **0.00** (two captures, every band 0) | **1.98** | **1.94** | +2 / +2 | band 0: 0.1 (header Δ0), 450: 1.4 (hero frame resampling), 900–1800: 1.7–2.9 (photo renditions, text anti-aliasing), 2250: 4.3 (focus card-2 box edge 20 px lower, card-3 rows +6/+7 — registered), rest ≤ 2.4; section table: 8 rows, all Δ0/+1/+2 except the registered card-3 row (+7); doc 4356 vs 4354 |
| 2560 | — | **2.21** | **2.19** | +2 / +2 | cap-probe **PASS** (module cap 1410, shell fluid; 0 of 4 rows) from round 2; **bands 0/450: 5.8 / 6.9 %** = the hero video frame (the live player scales a 2584-wide frame; the poster is the 1440 crop through the 2000 px rendition); every other band ≤ 2.6; section rows Δ0/+1/+2 (+6 card 3) |

Rounds (360 / 1440 / 2560): r0 — / — / — (tables only: hero capped 460, header 131, doc −268) → r1 — / — / — (doc −79) → r2 — / 9.37 / —
→ r3 (tables) → r4 (tables: 1440 all rows ≤ 2 px → **push**) → r5 10.29 / 2.16 / 2.29 (first three-width gate; served 10.38 / 2.12 / 2.27)
→ r6 10.27 / 4.72 / 4.43 (a regression: the mobile `top: 89px` reached the desktop menu bar; banner copy width) → r7 **10.27 / 1.98 / 2.21**;
served **10.36 / 1.94 / 2.19**. Leak table prototype vs served (24 wrappers, 1440 and 360): **0 differing lines**. Served section tables at
the three widths identical to the prototype's, row by row. Motion-compare on the served page: the same 6 parity / 3 missing / 0 extra /
1 advisory lines as the prototype, word for word. `migration/` is `.hlxignore`d.

## Triage table
In `REGISTER.md` (section → default content | block, shape, collection match, rows × cols, section style). Summary: 10 live sections →
9 authored sections; blocks `hero` (variants `video`, `banner` — BC hero), `columns` (`boxed`, default — BC columns), `cards` (`news`,
`focus`, `awards` — BC cards), `header`, `footer` (BC fragments); default content: four `h2`, two ledes, two closing bold links, one
fine-print `p`; section styles `gold-band`, `flush`, `padded`, `gray`, `fine-print`, `page-end`; configuration `nav`, `footer`, `title`,
`description`. No site-specific block name was needed: the Block Collection had a shape for every section.

## Lint
Step 2 (23:59, before any block existed): home **0 🔴, 2 🟡** (D1 on both `hero` instances — the BC hero shape; justified in LINT.md:
a hosted-video widget with a mobile asset, and a picture pair with copy overlaid at a fraction of the picture height), nav and footer
clean. Unchanged afterwards through four document edits (`padded` section style, `flush` removed from Awards, three descriptions
corrected to the captured text, `nav`/`footer` metadata rows); the harness re-ran the lint on every round.

## Motion register
In `REGISTER.md`. motion-compare (live vs prototype and vs served): **6 parity, 3 missing, 0 extra, 1 advisory**; verified per row:
button hover, Read-More hover (incl. `::after`), footer link hovers, nav item hover (deep diff; the frame sampler read it dead), mega
menu open (click-state: 1440×502 panel, rule, active item), mobile off-canvas menu (click-state both sides), back-to-top (scroll
ladder: fade-in only while scrolling up below ≈ 500 px — implemented with the same rule; the sampler counts the source's class name as
MISSING and mine as advisory). Decided out: language-selector and logo hovers (colour on an `a` around an image / a black span — no
pixel), search icon (0×0 live anchor), card hovers and header-on-scroll (dead on live), the video autoplay (hosted-video rule).

## Deviations register
In `REGISTER.md` (24 rows). The two that carry the residual: (1) focus card 2's **per-instance** 3 % bottom padding (7 % on cards 1 and
3) and card 3's subtitle class — uniform 7 % in the block, the row height matched at ≥ 768 by the box margin, a +23 px chain at 360
(≈ 8 of the 10.3 %); (2) the **hosted video frame** at 2560 (5.8 / 6.9 % in two bands). Third-party: the OneTrust floating cookie
button in every capture chunk (≈ 0.2 % at 1440, ≈ 0.8 % at 360). Everything else is 0 by the section table or ≤ 2 px.

## Rounds and where the time went
- 23:39 start. Step 1 (23:40–23:58): probe-load (200, consent bar, 0 shadow roots, no `main`), three origin captures + the 1440
  pair (noise 0.00 %), cap-probe (module 1410 / shell fluid / probe 2560), structure dumps, content-dump, media-list, live-spec ×3,
  deep probes ×3 widths, scroll-probe, motion-observe, deep hover diff, click-state (mega menu, mobile menu), fonts, poster-vs-frame
  check (the poster is another frame → `hero-frame.mjs`), 23 media files uploaded and previewed. Lost ≈ 4 min to the consent click:
  OneTrust's accept **reloads** the page and `common.mjs openPage` tries `#onetrust-accept-btn-handler` on its own → every measurement
  instrument crashed in `settle` ("execution context destroyed") until `--consent .onetrust-close-btn-handler` (the close button) was
  passed; the 2560 deep probe hit it once more.
- Step 2–3 (23:58–00:00): triage table, `doc/build-doc.py` (nav lists parsed from the captured hidden panels), lint 0 🔴 / 2 🟡,
  three documents uploaded and **previewed at 23:59:53** — the checkpoint. The pipeline's plain.html confirmed the `li > p > a`
  wrapping for nested list items and kept `<a><picture>` inside paragraphs.
- Step 4 (00:00–00:09): fonts.css, styles.css from the spec (shell fluid, wrapper cap 1410/15, rhythm 31/22, section styles),
  hero / columns / cards / header / footer.
- **r0** (00:10, tables only): 23 px doc offset per chain — hero capped at 460 (the wrapper cap: `hero-wrapper` must bleed), header
  bar 16 px high (a selector-specificity loss on the menu padding), utility group 15 px left, news → focus gap, People column offset
  lost to specificity, focus card text guessed past the content viewer's truncation (three descriptions), footer separators 4 px
  (a whitespace text node on the source).
- **r1** (00:13): doc −79; 360 unstable between instrument runs → fonts: the boilerplate loads `fonts.css` lazily, so text measured
  before or after the swap depending on the run — `@import` in styles.css fixed it for good.
- **r2** (00:16): 1440 first pixel gate **9.37 %**: news module's own 30 px margin collapsed into the section gap (padding instead),
  fine-print margin collapsing through the wrapper (padding), h2 → cards 66/68, focus box rows.
- **r3** (00:19): the People 20 % offset resolved against the grid area (705) not the column content (675) → `calc((100% - 30px) * .2)`;
  focus row height (card 2); `flush` wrongly authored on Awards.
- **r4** (00:22): 1440 / 2560 tables all rows ≤ 2 px → **code pushed 00:24:53, sync polled 00:25:33 — first shareable URL.**
- **r5** (00:25–00:31): CR banner overlay geometry as fractions (2 % + centred 1410 + right column, top 10 %) for 2560; three-width
  gate prototype 10.29 / 2.16 / 2.29 and served 10.38 / 2.12 / 2.27 in parallel; deep hover diffs, click states, leak tables.
- **r6** (00:33): mega panel full width, back-to-top from the ladder, 360 header rule + search offset, utility list hidden on
  desktop — and a regression (`top: 89px` from the mobile rule reached the desktop menu bar: 1440 → 4.72 %) plus the banner copy
  wrapping in 705 instead of 675. Both named by the section table / deep probe on the build.
- **r7** (00:41–00:47): fixes, push, sync, final gates both sides, tables, leak, click states. Stop rule: every row within 2 px at
  the three widths except the two registered per-instance rows; residual bands named.

Time (67 min wall): measurement ≈ 27 %, triage + documents + media ≈ 12 %, blocks ≈ 15 %, gate rounds ≈ 33 % (7 harness rounds,
none void, one regression round), deploy + served gates + registers + report ≈ 13 %.

## Instruments written
Under `migration/cases/home/scripts/` (stardust-lite did not have them):
- `hero-frame.mjs` — screenshot a hosted `<video>` paused at t = 0 at 2× (the poster of the frame the live capture shows; METHOD's
  hosted-video row names the step, no instrument did it). Verified against the live crop (`measure/frame-vs-live.png`).
- `btt-ladder.mjs` — scroll ladder down **and up** reading a fixed layer's class list / opacity / rect (`scroll-probe` returned one row
  and scrolls down only; the back-to-top state exists only on the way up).
- `content-view.py` — compact reading-order view of the content-dump JSON (one line per node: text, href, src, font, box). Its 160-char
  truncation cost one round (three descriptions authored from memory) — the JSON holds the full text.
- `da-upload-media.sh`, `da-put-doc.sh` — DA source PUT + branch preview for media bytes and documents (the METHOD names the calls,
  nothing scripted them).
- `doc/build-doc.py` — the document generator; parses the mega-menu lists out of the captured DOM's hidden panels.

## What METHOD.md got wrong or left out
1. **A consent control that reloads the page breaks every measurement instrument.** `common.mjs openPage` clicks
   `#onetrust-accept-btn-handler` on its own (a hard-coded candidate) and then runs `settle` in the destroyed context. Say in the
   prerequisites: when accept reloads (OneTrust "reload on consent"), pass the *close/reject* control as `--consent`, or wait for
   navigation after the click. `stitch-shot` survives it (its own wait); the scripts under `scripts/` do not. (BACKLOG #2 is about the
   control reaching every tool; this is the click's side effect.)
2. **Fonts are a measurement precondition, not a perf choice.** The boilerplate loads `fonts.css` lazily (`loadFonts` after
   `loadLazy`, desktop-only in eager). At 360 the harness page rendered with fallback metrics in some runs and the web fonts in others
   — sections/pair/deep-probe disagreed by 40–100 px between runs on the same page. Step 4's boilerplate paragraph should add: load the
   fonts from `styles.css` (or wait for `document.fonts.ready` in the harness and every instrument) before the first table.
3. **Serve the harness dir with something that survives parallel sessions.** `python3 -m http.server` under 6–8 concurrent Playwright
   sessions made `openPage` hit its 15 s "blocks loaded" timeout and measure half-styled pages (a 2197 px awards grid). Step 5 should
   say: one measurement session at a time per width, or a threaded static server. The harness also needs the serve dir's
   `scripts blocks styles fonts icons` symlinks to exist and a server already running on the port — the README's one-liner implies
   the harness does it.
4. **Percent geometry names its containing block.** Two rounds were lost to `padding-top: 20%` resolving against the grid area
   (705) instead of the column content (675), and `%` paddings inside a box against the box. Step 4's "fractions above 1440" should
   add: a source percentage is a fraction of *that element's* containing block width — read `cbox`/parent width in the spec and write
   `calc()` against the same box, then check with `deep-probe` on the build (the pair reads the symptom, the probe the cause).
5. **Per-instance styling on the source is a register row kind of its own.** AEM style-system values set per component instance
   (a card's bottom padding, a span's font-size class) cannot be authored per row in a block; the uniform value costs a chain shift
   on the stacked (mobile) layout. Name it next to the "session-variable" rows: pick the majority value, match the *row* height at
   the widths where the items sit side by side, register the chain at the widths where they stack. `[case-specific]` in size (23 px,
   ≈ 8 % at 360), generic as a kind.
6. **Glyph box vs line box in `pair`.** Live-spec records the inline span's glyph box (Futura 28 px → 44 px in a 37.8 px line;
   Egyptienne 21 → 21 in 28.35), the build's anchor is the block box. Every heading row reads Δy +3 and every lede row −4 when aligned;
   the METHOD's 1–2 px paragraph should state the offset to expect per font so a round is not spent chasing it (or `pair` should
   compare baselines).
7. **Margin collapsing through wrappers is a fourth member of the 1–2 px class — at 30 px.** A block's bottom margin collapses through
   `.x-wrapper` into the next section's margin-top (max, not sum); a first child's top margin collapses through the wrapper and moves
   the *section*. Both read as a clean chain offset in the section table and are invisible in the pair. Step 6 could name it: spacing
   the source puts on a module goes on the section as padding, never as a block margin.
8. **The content-dump viewer is not the content.** Step 2 says "write what an author would type" from the content-dump; my viewer
   truncated texts at 160 chars and three descriptions were finished from memory (one wrapped one line shorter and read as a width
   bug). Add to step 3: diff the authored texts against the capture JSON before the first harness (a 5-line check). `[case-specific]`
   cause, generic check.
9. **Overlay copy as fractions of the picture.** An absolutely positioned overlay whose `top`/`left` are percentages of the picture
   box (10 % / 2 %) survives 2560 only when the overlay is a child of the picture's positioned box; appended to the block it resolved
   against the block (picture + 30). Step 4's "geometry above 1440 is fractions" should add "of the element the source uses".
10. **A mobile rule leaks into the desktop rule** (`top: 89px` on an off-canvas panel that becomes `position: relative` at ≥ 992):
    reset every positional property the mobile branch sets. Cost one regression round; the section table caught it at once, the
    pixel gate (25 % in the top band) confirmed. Generic checklist item for the header's two layouts.
11. Minor: the code-sync poll needs `--compressed` (METHOD says so; the first poll here compared md5s correctly), but the second push
    took > 200 s to reach the code bus while the first took 10 s — the poll loop should be long and the report should record the
    time; `gate` prints `cap-probe: PASS` twice per run; `leak` prints `mar=0px 15px` for `margin: auto` on one side and nothing on the
    other for the same geometry (a resolved-vs-specified reading; 0 lines after the header change, so not chased); `scroll-probe`
    printed one ladder row and stopped on this page (the ladder was rewritten as `btt-ladder.mjs`).

## Blocked
Nothing was blocked. (The hover probes on the live utility links and search icon return "NO VISIBLE MATCH" because the source's
anchors are 0×0 — measured on the visible spans instead; recorded in the motion register, not a blocker.)
