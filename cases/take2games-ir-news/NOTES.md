# Friction notes — take2games ir-news (minutes are wall-clock, from TIMELINE)

## Setup
- 0.5 min | setup total 1m50s; nothing to remove. Code sync of main was live 10 s after the PUT. The branch push's sync is polled later (sync-poll).

## Step 1
- 1.0 min | MY MISTAKE: `probe-load … 360,1440,2560 | tee | head -120` — head closed the pipe and killed the 2560 run; re-ran 2560 alone. A `--out <file>` on probe-load (as measure-page writes probe-load-<W>.txt) would have avoided tee.
- 1.5 min | measure-page's default `--sections "main > .section"` matched nothing and the guess was `… > #main > nav` (1 match) — the spec came out header/footer only and the brief had no content section. The guess should have taken `main > *` (2 siblings covering 100 %); it printed "run again with it" though the summary still said `sectionsSelector: main > .section`. One full re-measure (42 s) + a probe-structure of the content div (20 s) + my reading of both (~1 min).
- 0.5 min | triage picked `div.css-qbnk8v` (the header's 0-text spacer, dumped as an unassigned root) as the content root and exited 1; `--root div` fixed it. measure-page already names the content root in its note ("dump key div") — triage should read summary.json's content root instead of the first non-header key.
- 1.0 min | content-dump splits Business Wire's inline semantic tags (`<location>`, `<org>`, `<chron>`, `<person>`, `<money>`) into child nodes and REMOVES their words from the parent `text` ("Today, 2K and announced that ,"), with no `markup` for those paragraphs. Every paragraph with such a tag (≈ 15) has holes in the dump — the authored text will have to be checked / fixed (see step 3). An unknown inline custom element should be flattened into the parent text like `<span>`.
- 2.0 min | MY READING: content-view of the 1440 dump (~330 lines) to understand the page — the triage fingerprint `h2 a (p×3 (picture p) p×10 …)` plus the brief said "one article, one figure, one icon link" already; a 10-line "what an author would type" summary per section (texts count, media count, lists, links with icons, floats) would have replaced most of it.
- 0.5 min | brief's `cap:` line listed 713/1248/1872 widths but not that 1872 = 117rem (Tailwind) nor the formula min(100vw − 192, 1872) — derived by hand from three x-ranges.

## Steps 2–3
- 1.5 min | `triage` and `author --draft-new` on an empty inventory: the `ir-nav` cell got only the one `<a>` ("Press Releases"); the three `button` items (text + chevron) and the click-dump menus were dropped silently — the default recipe reads links, not buttons, and the click dump passed in `--content` was never consulted for the block. Hand-typed the nested list (4 items, 3 sub-lists).
- 4.0 min | The dump's hole paragraphs (Business Wire `<org>`, `<location>`, `<chron>`, `<person>`, `<money>`): 14 of 37 article nodes had missing words in the draft, plus 3 nested `li` flattened and the holes' words appended at the end of the item. Typed the article from the capture (dom-1440 text, b/i/a/br kept) with a one-off bs4 splice instead of 14 hand edits; `harness --content` then flags those 14 as "not in the capture" (the JSON cannot hold them). Would have been 0 min if content-dump flattened unknown inline elements into the parent text.
- 0.5 min | `author --nav` drafted 3 of 5 header items (the two `button` menu labels dropped), `--footer` dropped the "Cookie Settings" button: same button blind spot.
- 0.5 min | `author` wrote `<p><picture>` + caption `<p>` as default content; wrapping them into `figure (left)` by hand is expected (the open #197: two blocks / a block amid default content in one section), fine.
- 0.5 min | `harness`: a CSS-only block 404s on `<block>.js` and prints a console error each run — an empty `figure.js` was needed. The runtime could tolerate a missing module quietly, or the harness could say "add an empty module".
- 1.0 min | `readFragmentSections` returns objects ({section, wrapper, …}), I wrote `sec.querySelector` from the boilerplate habit: one harness round. The foundation README names the return value; my reading, not the tool.

## Step 6 round 1
- 3.0 min | MY READING of two pair tables (73 + 68 anchors): the five causes were there (figure wrapper margins, nested li +16 ×3, URL not breaking at 360, 2 non-content paragraphs, header +12) but took three passes; a "causes" summary (group offsets already exist — add "first row where the offset changes" with the live/build rows around it) would have halved it.
- 2.0 min | The hottest-band crop showed what NO table did: the LIVE image is a broken image (alt text in the 460×168 box — Business Wire 403s a take2games Referer; media-fetch's curl without Referer got the bytes). The spec says `IMG fit=fill 460×168` as if painted; `live-spec` / `media-list` should flag `naturalWidth 0` (not loaded / broken) on an `<img>` — the box is the alt text's, and the "158" at 360 is alt-text wrapping, not an image.
- 1.0 min | 2560 crop: sticky chrome repeated at chunk tops on both sides at different offsets (live `header` is sticky, mine fixed). The first look lists `header … z=13` under "fixed"; saying `sticky` vs `fixed` there would have set the build's position right from the start.
- 0.5 min | cap-probe's module 2/2 "live 480px → build 1872px" pairs the floated figure with my default-content-wrapper (#162, a one-module page); gate printed FAIL, not advisory, though the live split holds 2 sections.

## Step 6 rounds 2–5
- 1.5 min | Round 2's hottest band (19.9 %) was the sticky chrome repeated at a chunk top, 56 px apart on the two sides — the last chunk is bottom-aligned, so ANY Δh moves it. The gate's hottest-band line said "no shift explains it" (dy=0) because the band holds both copies; a note "doc Δh ≠ 0 → the last chunk's chrome copy is offset by Δh" would have named it at once.
- 1.0 min | pair's `≈` row ("View source version on : ≈ [30,8991,182,45] → [30,8989,300,90] Δh 45") compares the live inline SPAN (2 lines) with my paragraph (4 lines) and reads +45: I wrote a wrong `overflow-wrap: normal`, gated, reverted (one 360 round). The ≈ row should report the live paragraph's box when the anchor is a span inside a p.
- 0.5 min | 360 bottom inset: brief's `inset` line gives the 1440 chain only (16 + 96); at 360 it is 15 + 108. `brief` could print the inset per width (it has the specs).
- 0.5 min | The hover probe `header nav a.css-1um7p1v:nth-of-type(2)` resolved to nothing useful ("extra on build — advisory"): each live `a` is alone in its `li`, so nth-of-type can't pick the second item; the probes file wants a path, not a sibling index. My selector, 1 round of reading.
- 0.3 min | `sync-poll --trigger` exits "needs DA_TOKEN" when the env is not sourced in that shell — fine, but it could read `~/.aem/da-token.json` like the refresh script writes it.
- 0.3 min | macOS has no `timeout` — my habit; sync-poll has `--timeout`.

## Step 7
- 2.0 min | Served page 72 px shorter at 1440 (54 at 2560, 0 at 360) with the leak table pointing at the article's last wrapper: a text-wrapping difference the leak table cannot name (it reads wrappers). pair + a plain.html text diff needed to find the normalisation.
- 0.5 min | The hidden served-only normalisations are documented in METHOD step 5 for `<p><a><strong>`, trailing `&nbsp;`, empty paragraphs — not for a `<br>` ending a `<strong>` (dropped) nor a space inside `<em>` at its edge (trimmed). The harness fold should apply both so the prototype shows them; the lint could warn on them.

## Ranked by minutes lost (tool friction)
1. 4.0 — content-dump drops the words inside unknown inline elements (`<org>`, `<location>`, `<chron>`, `<person>`, `<money>`) and the draft inherited the holes; author then appended the children at the end of each item. → flatten unknown inline custom elements into the parent text (keep `b/i/a/br` markup), and `author --draft-new` should keep nested lists.
2. 2.0 — the live image was a BROKEN image (hotlink 403) and no table said so; the spec reported `IMG fit=fill 460×168`. → `live-spec`/`media-list` record `naturalWidth` 0 / `complete && !naturalWidth` as `broken` and the brief prints it; the gate's hottest-band line could say "the live img is broken (alt box)".
3. 2.0 — served-only normalisations (`<br>` at the end of `<strong>` dropped, edge spaces inside `<em>` trimmed): one served gate round + pair + a text diff. → fold them in `harness` (like the three it already applies) and warn in the lint.
4. 1.5 — `measure-page` default sections matched nothing and the guess took `#main > nav` alone (1 match, "run again with it"): a full re-measure. → the guess should prefer the shallowest node whose children cover the root (`main > *` here, 2 siblings = 100 %), and MEASURE with it (the r6 promise; summary still said `main > .section`).
5. 1.5 — `author --draft-new` for `ir-nav`: buttons dropped, click dump ignored (1 of 4 items); `--nav`/`--footer` dropped the 2 + 1 button items too. → treat `button` text as a link-like unit; use the click dump for the nested lists when the triage row names it.
6. 1.5 — the round-2 hottest band was the sticky chrome copy offset by Δh at the last (bottom-aligned) chunk; the gate said "no shift explains it". → gate: when doc Δh ≠ 0, say "the last chunk's chrome copy is offset by Δh" and point at the section row.
7. 1.0 — pair's `≈` row compared a live inline span with my paragraph (Δh +45 → a wrong fix → a 360 round). → report the paragraph box when the anchor is a span inside a p.
8. 1.0 — my `probe-load | head` killed the 2560 run (own mistake) → `probe-load --out`.
9. 0.5 — triage picked the header spacer root (`div.css-qbnk8v`) as the content root and exited 1. → read summary.json's content root.
10. 0.5 — harness: a CSS-only block 404s on its `.js` every run. → tolerate or say "add an empty module".
11. 0.5 — brief's `inset` and `cap` lines are 1440-only; the 360 bottom inset (123 ≠ 112 × 15/16) and the 120 rem shell / 8 rem gutter at 2560 were derived by hand from spec rows and cap-probe. → print per width.
12. 0.3 + 0.3 — `sync-poll --trigger` needs the token in the env; macOS has no `timeout`.

## Ranked by minutes (my own reading and deciding)
1. 6.0 — reading METHOD.md (270 lines) + 30 BACKLOG rows + the usage list before t0: a 40-line "procedure card" with the exact command per step (the flags I actually used) would replace most of it; the r7 runs' BACKLOG rows repeat METHOD.
2. 3.0 — two pair tables (73 + 68 anchors) after round 1, three passes to name five causes. → a per-section "first row where the offset changes" line (the group-offset list nearly does it).
3. 2.0 — content-view (330 lines) to understand the page; the triage fingerprint and the brief had the shape. → a 10-line "what an author would type" summary per section in `triage.md` (texts, lists, links-with-icons, floats, buttons).
4. 2.0 — deriving the type scale (15/16/18 → `html { font-size }`) and the shell/gutter model from spec rows at three widths. → brief: "root scale per width" when every text row scales by one factor, and the cap formula (`min(100vw − 2g, shell)`), already computable from three x-ranges.
5. 1.5 — deciding the content model for the sticky sub-nav (block vs default content + style) and the figure (block vs picture paragraph): the lint's 🟡 D1 later said what I had decided; a triage hint "list of links with buttons → nav-like block" would have been enough.
6. 1.0 — `readFragmentSections` return shape (objects, not elements): I typed from the boilerplate habit; the foundation README names it — my reading.

## What helped
- `measure-page --noise` (42 s for three widths, the noise floor and the origins in one run) and `gate --origin measure` (cached origins, 1–2 min per round incl. cap-probe and probes).
- `brief` for fonts / colours / section insets at 1440; `deep-probe --props` for list-style, float, padding, sticky; `hover-diff` on the live (one run named the only hover).
- `pair`'s group offsets (the +48 nested-list and the −16 wrapper causes were one line each); the section table's Δh per width; `leak` (one diff line pointed at the served wrapper).
- `click-dump` (the three IR menus in one run), `click-state` on both sides, `da-put` (upload + preview + the `.html` note), `sync-poll --trigger` (3 s).
- `crop --vs` — the only instrument that showed the broken image and the chunk-offset chrome.
