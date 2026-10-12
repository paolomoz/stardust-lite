# REGISTER — scotiabank personal (template `personal`, https://www.scotiabank.com/ca/en/personal.html)

Overlays and locale on every instrument: `--consent '#onetrust-accept-btn-handler'` (OneTrust, no reload), no `--dismiss` (the
`#lang-selector` dialog is closed at rest), no `--locale` (the `/ca/en/` path pins the edition; `curl` and the browser agree), no
`--require` (noise floor 0.00 % at the three widths — a deterministic composition). Content root `#main`; header `header#header`
**plus** the mega-menu bar `header#header + div` (49 px, outside the header element — see REPORT finding 1); footer `footer#footer`.

## 1. Triage (step 2 — the content model, written before any block)

See `triage.md` (the edited table) and `triage-draft.md` (what `triage.mjs` drafted on an empty inventory). Summary:

| # | source section | default content | block · shape · collection · rows × cols | section style |
|---|---|---|---|---|
| 0 | three header bars (utility 37, main 115, mega menu 49; fixed 60 px bar at 360) | nav document `/drafts/nav`: utility ul + 2 p · brand pictures in a link · search p · tools ul (icon tokens) + bold Sign In + p · menu ul with nested titled groups (10 items, 44 groups, 255 texts) | `header` · fragment · BC header | — |
| 1 | hero 432 / 845 / 768 | — | `hero` · simple · BC hero · 4 × 1 (bg pictures desktop + mobile rendition \| logo + h1 + lede \| label + **filled** \| label + *outline*) | — |
| 2 | "You may be interested in" 698 / 1726 / 698 | h2 | `cards (compass)` · container · BC cards · 3 × 3 (bg picture \| product picture or empty \| h3 link + action p) | `pale-blue` |
| 3 | tab component 1253 / 3115 / 1236 (6 panels, 5 hidden at rest) | — | `tabs` · container · BC tabs · 6 × 3 (label \| h2 + lede \| closing bold link or empty) **+** 6 × `cards (marketing)` · container · BC cards · 6 × 4 (picture \| eyebrow or empty \| h3/bold lead + p… \| link); panel k adopts the k-th cards block | `pale-blue` |
| 4 | CDIC closing 218 / 244 / 218 | p with the badge link picture, p | — | `cdic` |
| 5 | back-to-top button | — (runtime chrome) | footer JS | — |
| 6 | footer 413 / 807 / 413 | footer document `/drafts/footer`: (icon p, h3, p, link p) × 3 + social ul · legal ul (Cookie Settings as `#cookie-settings`) · copyright p | `footer` · fragment · BC footer | — |

Lint: PASS, 0 🔴, 1 🟡 (SVG logos, pure vector; LINT.md). Not authored (hidden DOM, not content): the OneTrust banner, the language dialog
and its 2-item dropdown menu, the trending-search panel, the mobile drawer's own DOM (the hamburger re-uses the mega-menu lists).

## 2. Deviations (step 3 — source feature → decision → pixel cost; every number from the step-1 tables)

| # | source feature (where measured) | decision | cost |
|---|---|---|---|
| D1 | Mega-menu bar outside `header#header` (`.mm--container`, deep-probe `#wrapper > *`, 1440/2560 only) | authored as the nav document's 5th section; `header` reserves 201 = 37 + 115 + 49 | 0 px (header row Δh 0 at 1440/2560) |
| D2 | Hero background: the 2000 rendition at ≥ 768, the 767 rendition at 360 is **another crop** (deep-paint-360 `bgi`) | both pictures in row 1, one shown per width (as the two logos in the nav) | 360 top band 24.5 → 2.5 % (round 5) |
| D3 | Hero buttons: `Scotiabank-Bold` 800 on the filled one (faux bold, the face is `normal`) | faces declared as the source declares them; weights per spec row | 0 |
| D4 | Compass third card without a product picture: an empty 233 × 138 graphic box keeps the card 510 (`customCompassGraphicNoImgDiv`) | empty cell → `.cards-card-graphic` with the picture's height (138 / 101) | 0 |
| D5 | Compass action colour `rgb(66,0,159)` on card 3 vs `rgb(130,48,223)` (per-instance; the texts are white — invisible) | one rule; hover reproduces the colour change (motion row) | 0 |
| D6 | Compass column at 360: 482 = card 473 + 9 (`customCompassCol`) | `margin-bottom: 9px` per card at < 768 | 0 (section 1727 vs 1726) |
| D7 | Tab component `margin-bottom: −48` hangs over the next band; the live section is flex | `display: flow-root` on the section, `−48` on the wrapper | 0 (1252 vs 1253) |
| D8 | Tab list at 360 sits at the component's top edge, full bleed, overflow-x scroll (`ul.rec--tablist [0,2632,360,53]`) | `margin: −16 −16 32`, `overflow: auto hidden` | 0 (3115 vs 3115) |
| D9 | Marketing card rows: 5 of 6 cards stretch to their row; the **iTrade** card is 486 of 513 (per-instance style no row can author) | `align-items: stretch`; its link sits 27 px lower than live at 1440/2560 | 1440 band 1800 → 4.4 % (part), 2560 band 2250 → 3.3 % (part) |
| D10 | Investments card lead "Invest in what you're really invested in." is a **bold paragraph** (`p.subtitle-1`, no bottom margin), not a heading | authored `<p><strong>…</strong></p>`; the decorate styles a first bold-only paragraph as the lead | 0 (an h3 cost 12 px at every width in rounds 2–3) |
| D11 | Investments copy starts with an empty line (a typed `<br>`); the pipeline drops a bare leading `<br>` and an empty `<p></p>` (served plain.html, leak table −24 at 360) | authored as `&nbsp;<br>` (an inner nbsp + br survive — METHOD step 5); the iTrade `<p></p>` not authored (its 24 is the `p + p` margin) | 0 after round 11 (served 360: 7.97 → 2.84 %) |
| D12 | Card link `sr-only` suffixes ("learn more about this special offer") and the `aria-label` icon links | not authored (accessible names are the visible labels / `title`) | 0 |
| D13 | Footer top → middle gap 31 px (f--top ends 3061, f--middle starts 3092; no element owns it in the dump) | `margin-bottom: 31px` on `.footer-top` | 0 (413 vs 413) |
| D14 | Footer legal links 15/22.5 at desktop, 13/19.5 at 360 (spec-360) | media query | 360 footer 801 vs 807 (−6, chrome) |
| D15 | Back-to-top: live `position: sticky` reads below the fold at vh 900 and appears at each stitched chunk's **top** edge; mine is `fixed; right 30; bottom 30` (its real place) | kept; 50 × 50 per chunk from chunk 2 | ≤ 0.1 % per width; part of 360 band 6300 (4.4 %) |
| D16 | Hidden tab panels' internal spacing (Accounts panel 1173 vs live 1234; CTA rows, spacers between card groups) | the model carries every text (109/109, content check); spacing of hidden panels not tuned | 0 in the gate (hidden at rest) |
| D17 | Language dropdown (English ▾) renders the toggle; its 2-item menu (hidden DOM) is not authored | register | 0 |
| D18 | Fixed header at 360 repeats in every 900 px chunk of **both** stitched captures (a stitch property, not a layout) — the two copies are offset by the residual Δh (7) | — | 360 bands 5400/6300 |
| D19 | Text anti-aliasing / sub-pixel y (pair rows −1/−2 px: tabs h2 −1, cards −1/−2, footer −2, cdic −2) and photo resampling edges (686 × 386 tiles at 342 / 350 wide) | 1–2 px class (METHOD step 6) | the residual 1.2–3.1 % bands at 1440/2560 |

Section tables (round 9, `sections-r5.log` → `gate/sections-verdict.json`): every content row within 2 px at the three widths
(hero 0/0/0, compass +1/0/0, tabs 0/−1/−1, cdic −2/0/0; chrome: header Δh 49 by definition — the pairing's live header excludes the
mega-menu bar; footer −6/0/0). The "#2 Δh −844 / #4 Δh −4843" rows are the pairing's multi-section artifact: four 0-height live
sections (empty experience fragments) are folded into the build's compass and cdic sections and their *spans* summed.

## 3. Motion (step 6 — `gate --probes probes.txt`, motion-compare: 11 parity, 2 missing, 1 timing; `hover-live-1440.json`, `hover-mm-1440.json`, `gate/hover-build-1440.json`)

| motion (live) | build | parity |
|---|---|---|
| marketing card hover: shadow `0 2 10` → `0 0 0`, image `scale(1.1)`, link `#007eab` → `#005e80` + underline (300 ms class) | same rules (`cards.css`), `transition .3s` | hover-diff build = live rows; sampler reads the live row as "dead" (hover-diff reads it) |
| compass card hover: inherited colour `rgb(130,48,223)` → `rgb(66,0,159)` on white text, 300 ms | same (invisible) | parity (was MISSING in round 7) |
| mega-menu item hover: `li::after` → red 2 px, dropdown `display: block` full width | same | hover-diff build = live |
| hero filled button hover: bg `#333` → transparent, text `#333` | same | parity |
| Sign In hover: bg `rgb(237,7,34)` → `rgb(173,0,0)`, border `rgb(187,6,27)`, 150 ms | same | parity |
| footer legal link hover: underline; help-card link: dotted border → transparent | same | hover-diff build = live |
| tabs click (#accounts): panel switch, `aria-selected` | click-state build: panel 2 shown, heading "Accounts", 6 cards, closing CTA | the frame sampler reads the live click as dead; click-state on both sides shows the switch |
| back-to-top: `show` + `b2t--active` classes past scrollY ≈ 620, `opacity`/`bottom`/`color` 500 ms | `show` class past 620, `opacity`/`bottom`/`color` .5s | `show` parity; `b2t--active` is a second class name for the same state (MISSING by name); `color` reads 300 ms on the build because the compass hover is the longest *colour* transition that fires (the button's text does not change colour) |
| OneTrust adds `hidden` once during the traversal | — (overlay, not authored) | MISSING by name — register |
| header: static at desktop, fixed at 360, no scroll morph (`scroll-1440.txt`) | same | dead on both |

cap-probe compare: PASS, 0 of 6 rows (rounds 4, 6, 7, 9, served 360); FAIL "3 of 5 rows" on the same CSS in rounds 5, 8 and the first
served run — the live split read 5 sections (the back-to-top button counted or not), shifting the by-index pairing (BACKLOG #162).
