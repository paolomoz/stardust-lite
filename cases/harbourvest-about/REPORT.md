# REPORT — harbourvest about (template `about`, blocks-first v2, stardust-lite 4832fcb)

Page: `https://www.harbourvest.com/it/en/about-harbourvest` — final URL unchanged (200, no redirect for curl in `en` or `it`); a browser
without the attestation cookie is JS-forwarded to `/us/en?preventForwarding=true`. Edition measured: Italy / English / Institutional
Investor (cookies, see REGISTER). Served: `https://blocks-first--sdt-harbourvest--aemcoder-adobe.aem.page/drafts/about-harbourvest`
(preview only; documents `/drafts/about-harbourvest`, `/drafts/nav`, `/drafts/footer`, media `/drafts/media/`). Code: `blocks-first` of
`aemcoder-adobe/sdt-harbourvest`.

## Numbers (pixel % against the cached origin captures of the measurement run; noise floor 1440 **0 %**, Δh 0)

| | 360 | 1440 | 2560 (probe) |
|---|---|---|---|
| prototype (harness, port 8975), final | **15.73** (Δh 41) | **3.56** (Δh −2) | **3.57** (Δh −37) |
| served page, final | **15.55** (Δh 41) | **3.53** (Δh −2) | **3.55** (Δh −37) |
| cap-probe | — | — | PASS (4 rows; wrapper 1500 shell) |
| section rows (gate, live split 7 + chrome) | #2 −42 (register #1), others ≤ 5 | every row −1 / 0 | every row ≤ 2 |

Probe width 2560 (cap-probe: largest cap 1500 → max(2560, 1875)). Motion: `transition transform` parity (button arrow .3s, 4 events both
sides), hover bars by `hover-diff` on prototype and served, drawer by `click-state` (same rows), 1 missing = the live JS `active` class
toggle (advisory). Leak table (20 wrappers, 1440): prototype and served identical. The 360 number is one register row: the source's
intro h2 carries two trailing `&nbsp;` that wrap "markets" to a 4th line (−42 px), the pipeline trims them, and every band after reads
the shifted copy; at 360 every other section row is within 5 px. "First gate < 10 % at all three widths" was therefore not reached;
1440 and 2560 were < 10 % from round 4 (3.54 / 5.07) and the stop rule held from round 6.

## Clock (UTC, from TIMELINE.md — stamps taken before/after the commands)

| milestone | time | minutes from t0 |
|---|---|---|
| setup (eds-new-site preview-only + stardust-lite init, branch pushed) | 13:52:08 → 13:54:29 | 2.4 min of setup |
| reading METHOD / open BACKLOG / usage before the first run | 13:54:29 → 13:56:38 | 2.1 min |
| **t0** — probe-load at 360/1440/2560 | 13:56:38 | 0 |
| attestation gate found and solved (cookie preload) | 13:59 | ≈ 3 |
| measure done (3 runs: default sections miss, require marker, ok; noise floor 0 %) | 14:10:13 | 13.6 |
| triage table written + three documents lint clean | 14:22:38 | 26.0 |
| code written, first harness prototype served | 14:44:25 | 47.8 |
| gate r1 (21.4 / 20.1 / 17.8) → r2 (22.3 / 13.4) → r3 (15.3 / 11.6) → r4 (16.7 / **3.5** / **5.1**, 3 widths) | 14:46 → 15:03 | 65.5 at r4 |
| r5 probes (16.7 / 3.5 / 3.6), r6 drawer + hovers, r7 arrow parity, r8 nav visible | 15:08 → 15:22 | |
| probes pass (cap-probe, motion parity, content 34/34, drawer) | 15:19:12 | 82.6 |
| code pushed + synced (sync-poll 11–13 s each push), document put to DA | 15:09 → 15:21 | |
| served gate done (within the prototype's numbers) | 15:19:12 | 82.6 |
| final unmasked gates on both sides | 15:30:49 | 94.2 |

Rounds: 2 table rounds (triage edit, document edits after `--draft-new`), 8 gate rounds (r1–r4 layout, r5 probes, r6 drawer/hovers,
r7 arrow, r8 header specificity), plus the final unmasked re-run. Measure-page ran 4 times (first look at the attestation page, the
default sections, the wrong `--require` marker, the good run).

## Findings (what this page taught)

1. **A cookie gate with per-persona chrome.** The origin forwards every cookieless browser to an attestation page and loads the header
   and footer as experience fragments after the check. No instrument takes a cookie; a 30-line NODE_OPTIONS preload
   (`scripts/hv-cookies.mjs`) in the chrome-tier pattern gave every instrument and the vendored tools the cookies and a wait for the
   fragments. The noise floor (11.6 %, Δh −473) named the composition before any table did.
2. **Text boxes, not padding boxes.** The AEM source keeps its 11/10 px rhythm as wrapper padding; writing it as padding on the text
   elements made every `pair` row Δh +21/+32 (the tool reads the element box). Margins reproduce the measured boxes; a flex row for a
   heading + CTA keeps those margins from collapsing.
3. **Section styles from the source's classes.** `cmp-container__small-bottom` (80/16) was the +64 px surplus in section 4 at every
   width until authored as a section style; `triage` printed no style for any row though the dump holds the classes.
4. **Rows read as cascade.** `pair`'s Δy·loc column and the gate's per-section Δh rows made every round one fix: the shell on the footer
   (Δx ±120), the reverse card's lost 64 px margin, the overlap row model (card + 64; 532 at 2560), the tiles' 2560 aspect box.
5. **The one residual** is the source's own typing (two trailing nbsp in a heading) that the pipeline cannot carry: −42 px at 360.

## Blocks written (`blocks/`, CSS values from the spec; every selector carries the block root)

| block | shape | authoring | notes |
|---|---|---|---|
| `hero` | simple 1 × 1 | picture, eyebrow p, h1, lede p | picture bleeds (`inset: 0 calc(50% − 50vw)`), `object-position: 80% 50%`, measured gradient `::after`; content grid 2fr 1fr, pad 240/64 (360: 160) |
| `cards (icons)` | container 3 × 2 | `picture \| h3 p` | 3 columns of 1/3, icon 37×35 in a 41 box, centred text; 360 one column, gap 86 |
| `cards (boxed)` | container 4 × 2 | `picture \| h3 p` | white cards radius 10 pad 32, 2 × 2 gap 21, icon 58 |
| `cards (tiles)` | container 2 × 2 | `picture \| h3 a` | picture as the tile's background, body pad 60/71, h3 top + button bottom, radius 10, `aspect-ratio` ≥ 2000 |
| `columns (overlap)`, `(overlap, reverse)` | container 1 × 2 | `picture \| picture h3 p a` | photo 63.5 % column, card 40 % at the shell edge, +64, bottom-aligned; the cell's first picture is the card's background; 360 stacked with −32 overlap |
| `header` | chrome | nav doc: brand / sections / tools | fixed 130 (38 attestation bar + 92 menu bar), 360: navy 120 + hamburger; drawer from click-state; hover bars |
| `footer` | chrome | footer doc: `columns` 1 × 4, bottom row, disclosures | measured grid tracks; mobile centred stack; disclosures band white |

Foundation: `styles/styles.css` tokens (shell 1500 / gutter 120|30 / inset 10.72, Montserrat 16/22.4 400 #303030, h2 48/57.6 | 34/40.8,
h3 28/39.2 | 24/33.6, sections 80/80, `intro` / `light` / `dark` / `small-bottom`, buttons 196×43 pill with the arrow span),
`fonts.css` (Montserrat variable woff2 from the source's request), `scripts/scripts.js` (`decorateButtons` appends `.button-arrow`).

## Evidence in this directory

`measure/` (summary, brief, spec-view ×3, content-view, deep-paint, structure, sections-selector, require, measure-page.log — captures
and DOM not committed), `triage.json|md`, `doc/` (three documents), `author.log`, `harness.log`, `gate/` (r1–r8 logs, final.log,
gate.json, pixel/cap/motion json, pair ×6 — PNG not committed), `gate-served/` (served.log, final.log, hover-served), `leak-*-1440.txt`,
`probes.txt`, `scripts/hv-cookies.mjs`, `sync-poll.log`, `TIMELINE.md`, `NOTES.md`, `REGISTER.md`, `LINT.md`.
