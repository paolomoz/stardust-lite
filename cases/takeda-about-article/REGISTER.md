# REGISTER — Takeda · about-article · https://www.takeda.com/about/corporate-responsibility/corporate-giving/ (200, no redirect)

## Triage (1440; `triage.md` edited, `triage --from-md`)

| live # | section (1440) | model | note |
|---|---|---|---|
| 0 | header 1440×71 sticky | `header` (foundation) + `/drafts/nav` | 6 bar items (4 panels hidden), tools: search / Global / EN |
| 1 | hero 1440×500 `picture hr h2` | `hero` 1×1 | the red rule and the dark panel are CSS (`h2::before`, absolute h2) |
| 2 | intro 1440×474 `picture p×3` | `columns` 1×2 | section style `tight` (live `!pb-0 !mb-0`) |
| 3 | cta 1440×146 `p a` | `columns (cta)` 1×2 | text column \| pill button (`strong a` → `.button`); inline red link |
| 4,6,…,22 | `h2 hr` ×10 | default content h2 | the rule is `h2::after` (100×3 #bd120a, 16 below, 40 above the next module); FY2025 / FY2024 sections carry style `spaced` (live keeps a 50 gap before those two grids only) |
| 5,7,…,23 | `a×N` card grids ×10 (38 cards) | `cards` N×2 | row = picture \| h3, p, LEARN MORE link; the whole card is the link (decorate) |
| 24 | Explore `h2 hr a×2` | h2 + `cards (tiles)` 2×1 | row = h3 link + p; arrow icon by decorate |
| 25 | footer 1440×539 | `footer` (foundation) + `/drafts/footer` | 4 sections: logo + social, links, notice, legal + copyright |

Triage flipped 14 rows: the tool proposed `accordion (?)` for every grid because the dump reports the card as one `a` leaf ("media 0 %") — the brief's `img 376×230 ×N` names them cards.

## Deviations (named residuals; pixel cost from `gate-served/`)

| # | what | where | cost | why |
|---|---|---|---|---|
| 1 | 1 px cumulative offset from FY2019 on (live gap 49 after the FY2020 grid) | 1440 rounds 1–5 | was 3.5–4.6 % in 4 bands; 0 after carrying the spec's `46.96px` card padding | live sub-pixel padding `p46.96` rounds once |
| 2 | Lower bands at 360 (y 9000–12600) 2.9–5.3 %, no shift explains, luminance ratio 1.005 | 360 | ≈ 1 % of the page | the live serves `w_384` renditions at 360, the build the fetched `w_480` scaled to 324 — anti-aliased photo edges |
| 3 | ABOUT bar item underline (4 px red, 51 wide) absent on the served draft | header | < 0.1 % | the live underlines the item whose panel holds the current page; `header.js` does the same by pathname, which `/drafts/corporate-giving` does not match |
| 4 | Social icons (LinkedIn, YouTube 24×24), search, globe, arrow glyphs | footer / header / tiles | < 0.1 % | the source's inline SVGs are not copied; own drawings in `icons/` at the measured boxes |
| 5 | One card title measured `#891515` (Society of Critical Care Medicine) | FY2025 | 0 | the hover colour, captured with the pointer over the card — `hover-diff` confirms h3 #333 → #891515 |
| 6 | OneTrust floating button and BackToTop widget | every live chunk | hidden via profile `overlays.hide` | third-party fixed layers, not content (BACKLOG #203) |
| 7 | Footer link weight 325 → face 300 | footer | 0 | the source declares 325; the loaded faces are 300/400/500/700 — the browser picks 300 either way |

## Motion (gate `--probes probes.txt`, `hover-diff` live vs build)

| behaviour | live | build | verdict |
|---|---|---|---|
| header | sticky, 71 at top 0, no scroll morph | sticky 71 | dead on both — not required |
| card hover | h3 #333 → #891515, 200 ms colour transition | same | parity |
| inline link hover | #bd120a → #891515 (text + border) | same | parity |
| button hover | bg + border #bd120a → #891515 | same (hover-diff) | advisory: the gate's live probe read no change on `a[aria-label]` (its span changes) — `hover-diff` verified |
| tile hover | bg #edf2f4 → #dce6e9, border-left + h3 + svg → #891515 | same on the link (`a` carries bg/border) | advisory: same probe-resolution note |
| transitions | background-color / border-*-color 200 ms | `transition: … 200ms` on the hovered elements | carried |
| BackToTop enter/exit classes, transform transition | third-party widget | — | not carried (hidden layer, deviation 6) |
