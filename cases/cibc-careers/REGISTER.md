# cibc-careers — register (triage, deviations, motion)

Source: https://www.cibc.com/en/about-cibc/careers.html (AEM Sites, Foundation grid, OneTrust consent, Medallia feedback tab).
Measured 2026-10-03 at 360 / 1440 / 2560 (`measure/`), consent `#onetrust-accept-btn-handler`. cap-probe: content cap 1200 px,
kind **module**, shell fluid, probe width 2560, root `#blq-content`. Noise floor 1440: 0.00 % (Δh 0).

## Triage (step 2 — written before any block existed; `triage` draft in `triage-draft.md`, 73 % novelty on an empty inventory)

| # | source section (1440 box) | default content | block · shape · collection · rows × cols | section style |
|---|---|---|---|---|
| H | `header.header-centralized` [0,0,1440,158] + unassigned `div.mm-container` [0,158,1440,62] (first look: 90 texts outside every root) | nav document (3 sections: brand links + tools, logo + tools, section pages) | `header` (fragment, decorate) | — |
| 1 | `div.emergencynotification` 0 × 0 | — (empty on this page) | not authored | — |
| 2 | `div.secondarynav` [0,220,1440,61], 0-height at 360, **sticky** | — | **section-nav** · simple · no collection match (a sticky sub-navigation) · 1 × 1 (a list of 4 links) | — |
| 3 | `div.featurebannercontainer` [0,281,1440,700]; 360: `<img>` 360×199 + white card | h1 (eyebrow, uppercase by CSS), h2, p, video link + transcript link | **hero** · simple · BC hero · 3 × 1 (desktop picture, mobile picture, text) | — |
| 4 | `div.layoutcontainer` [0,981,1440,1005]: h2 + tab container (2 tabs × 6 cards); 360: closed accordion | h2 | **tabs** · container · BC tabs · 2 label rows (1 col) + 12 card rows (picture · title · text · cta) | — |
| 5 | `div.layoutcontainer` [0,1986,1440,394]: bordered callout, photo left | — | **columns (callout)** · container · BC columns · 1 × 2 | — |
| 6 | `div.layoutcontainer` [0,2380,1440,105] | h2 + p | — (default content) | `intro` |
| 7 | `div.layoutcontainer` [0,2485,1440,314] | — | **cards (icons)** · container · BC cards · 3 × 2 | — |
| 8 | `div.layoutcontainer` [0,2799,1440,314] | — | **cards (icons)** · container · BC cards · 3 × 2 | — |
| 9 | `div.layoutcontainer` [0,3113,1440,138] | h2 | — (default content) | `statement` |
| 10 | `div.layoutcontainer` [0,3271,1440,493]: three illustrated tiles on coloured grounds | — | **cards (illustrated)** · container · BC cards · 3 × 3 (picture · text · tone) | — |
| 11 | `div.layoutcontainer` [0,3764,1440,58] | `<p><em><a>` outlined button | — (default content) | `cta` |
| 12 | `div.layoutcontainer` [0,3822,1440,444]: bordered callout, photo right | — | **columns (callout)** · container · BC columns · 1 × 2 | — |
| 13 | unassigned `aside.terms-wrapper` [0,4286,1440,72] (closed; hidden content = one link) | — | **accordion** · container · BC accordion · 1 × 2 | `terms` |
| F | `footer` [0,4358,1440,852] | footer document (5 sections: tools, top links, link columns, legal, brand) | `footer` (fragment, decorate) with `columns (tools)` 1 × 2 and `columns (links)` 1 × 4 | — |

Model decisions: one authored section per source section (BACKLOG #113); the hero's two renditions are two picture rows (a
different crop per breakpoint, not a rendition of one asset); the tabs' label rows are the container's own rows and the 4-col rows
its children (lint D3 🟡, see LINT.md); the illustrated tile ground is a per-row property (`blue` / `teal` / `pink`) because the SVGs
are transparent and the source paints the ground on the tile; the terms aside is content a click reveals (`content-dump --hidden`).

## Deviations

| source feature | decision | pixel cost |
|---|---|---|
| Medallia "Feedback" tab, `button#nebula_div_btn` fixed at right (44×114 at 1440, z 99999990) | third-party layer, not authored | in every live capture at 1440/2560 (≈ 0.3 % of a band) |
| OneTrust consent banner | dismissed by `--consent` on every run | 0 |
| Icon-font glyphs (icomoon `::before` codepoints: search, location, contact, lock, offers tag, flag, play, chevrons, calendar, social) | hand-drawn SVGs in `/icons` with the measured boxes; `inlineIcons` keeps `currentColor` (BACKLOG #90, #187) | header / footer icon rows ≈ 1–2 px outline differences |
| Mobile navigation drawer (`nav#blq-mobile-nav`, 7448 px off-canvas) and the header search dialog | hidden DOM at rest, not authored; menu button and search link are controls without panels | 0 at rest |
| Second tab panel ("Your career ambitions") | hidden content: authored from `content-dump --hidden`, closed at rest as on the source | 0 |
| Live 360 capture: the mobile section bar pins `fixed` at scrollY ≥ 70 and the content jumps up 50 px from chunk 2 on (scroll-probe); the document gets 50 px shorter mid-capture | reproduced (`nav-pinned` class on scroll, no placeholder) — r6 took 360 from 15.0 % to 5.9 % | 0 |
| 54-px band below the footer in the live 360 document (doc 7449 vs footer end 7395; no root dumps it) | not authored | Δh 54 at 360, band 7200 |
| Footer link columns at 360: the source collapses each column to an accordion heading | headings shown, sub-lists hidden at < 900 (closed accordions, no toggle built) | band 6300 at 360 ≈ 15 % |
| Footer column 1 / 3 headings sit 10 px lower than column 2's on the source (`module-headline` padding on first children only) | column 2's reading taken (li padding 5) | ≈ 10 px in two footer columns at 1440 |
| "Meet with us" button on the source is `display: table` 180 wide; "Manage your meeting" 26 px right of it | `min-width: 180px`, flex row | ≈ 10 px on one link at 1440 |
| Tabs section bar items wrap to two lines on the source (anchor padding 10 inside table cells) | same table-cell layout; natural wrapping | within 2 px |
| Hero h2 "Find your next career at CIBC": the source keeps "at CIBC" together (`no-wrap` span) | authored `at&nbsp;CIBC` (the pipeline keeps an inner nbsp, BACKLOG #167) | 0 |
| Live class toggles the motion sampler counted (`pinned`, `img-positioned`, `tc-open/close`, `active`, `current`, `expanded`, `icon-arrow-up`) | implementation classes of the source's JS; the states themselves (pinned bar, tab panel, terms panel, hovers) are reproduced and verified with click-state / hover-diff | motion-compare "missing" rows, advisory |
| Button hover transition 300 ms (motion-compare) | `transition: background-color .3s, color .3s, border-color .3s` | 0 |

## Motion (step 6 — motion-compare + hover-diff + click-state)

| state | live | build | verdict |
|---|---|---|---|
| sub-nav link hover | colour → rgb(196,31,62), 1-px border-bottom | colour → red, underline | parity (hover-diff both sides) |
| tab card filled button hover | bg → transparent, text/border → rgb(139,29,65) | same | parity |
| tab card title link hover | colour → red, underline removed | same | parity |
| marketing link hover | colour → red, underline added, chevron red | same | parity |
| outlined button hover | bg → rgb(139,29,65), text white, 300 ms | same, 300 ms transition | parity (motion-compare) |
| utility bar link hover | underline | underline | parity |
| section bar link hover | red + underline | same | parity |
| tabs: click "Your career ambitions" | panel 1 shows, 3 rows of 346 (pad 50) | panel shows 9 cards in 3 rows | click-state both |
| terms accordion click | panel 57 tall, "Trademarks" link at y 4360 | panel 43 tall, link at 4358 | click-state both |
| mobile section bar at scrollY ≥ 70 | fixed, content −50 | `nav-pinned`: fixed, content −50 | scroll-probe live, gate 360 |
| header scroll-morph | none | none | dead on both |
