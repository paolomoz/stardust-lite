# REGISTER — continental-home (triage, deviations, motion)

## Triage (triage.md edited, `triage --from-md`; document by `scripts/build-doc.py` over author's draft)

| # | live section (1440) | model | shape | rows × cols | section style |
|---|---|---|---|---|---|
| 0 | header: `o-header__meta` 1440×84 fixed (logo box 255×160 #ffa500, Global / EN / search / download) + `o-header` 1440×49 main nav row (7 items); 360: one orange bar h56; pins compact (h64, no nav row) after a viewport | nav document, 3 sections: brand (`:continental-logo: :continental-tagline:`) · 7 links · tools (`:globe: Global`, `EN :chevron-down:`, `Search :search:`, `:download-single:`) | — | — | — |
| 1 | hero slider `c-heroteaser-fixed` 1440×443, 2 slides (ContiTech · Results Q2 2026), autoplay | `carousel (hero)` (new): rows = slides, picture · h2 + p + pill links | container | 2 × 2 | — |
| 2 | "Welcome to Continental" 1440×948: h1, intro, annual-report teaser card | share-price iframe + pill | default content (h1, p) + `columns (teaser)` (picture + text + link · iframe URL + pill) | simple | 1 × 2 | — |
| 3 | "Two Wheels, One Passion" 1440×596: lucent background picture over #f4cf9b, eyebrow, h2, video | text | default content (picture, eyebrow p, h2) + `columns (video)` (poster picture + caption · text + pill) | simple | 1 × 2 | `bg-image, garage` |
| 4 | "Career at Continental" 1440×748: h2, intro, 3 card-wide link teasers | default content + `cards` | container | 3 × 2 | — |
| 5 | "Sustainability at Continental" 1440×787: background picture, h2, intro, pill, 3 painted fact boxes | default content (picture, h2, p, pill) + `cards (facts)` (one cell: title, figure, text) — lint D1 🟡 justified: painted boxes | container | 3 × 1 | `bg-image` |
| 6 | "Continental in Facts and Figures" 1440×890: h2, 3 card-wide link teasers | default content + `cards` | container | 3 × 2 | — |
| 7 | `section.c-socialmedia-list` 1440×199 (an unassigned band between main and footer — triage suggested accordion) | default content: label + list of 7 icon links | — | — | `social` |
| 8 | footer `o-footer` 1440×419: 4 link columns + copyright (360: an accordion) | footer document, 5 sections (4 columns, copyright) | — | — | — |

## Deviations (with their pixel cost)

| # | what | where / cost | why |
|---|---|---|---|
| D1 | the hero slider is static (first authored slide = the ContiTech slide the 360 / 1440 captures froze); no autoplay | 2560 hero 51.7 % of a 580 px band (≈ 5.6 points of the 9.34): the 2560 live capture froze the other slide (Results Q2 2026) in every round and in the served gate; 360 hero 26 % (the dots: live's active dot is the 2nd) | the live slider autoplays; the noise floor (5.83 % at 1440) is this band; no static build matches every load |
| D2 | the share-price chart is the live third-party iframe (equitystory), embedded by columns.js from a bare URL link | its own data / timestamp paint (small) | a third-party frame: content by its owner |
| D3 | the garage video is its poster picture (`640.jpg`) — no player, no play button | 1440 garage 10.2 % (with the overlay text wraps) | the live player is an admiralcloud HLS stream (`blob:`), no file to fetch; author named it ("video without a source") |
| D4 | the header pins compact at scrollY > 133 and the spacer shrinks 133 → 113 (live: `is-sticky` h64, first content box −20) | without it every chunk after the first was 20 px off (1440 13.7 % → 4.4 %); the probes' header timeline reads it as EXTRA (the motion tool sees the live header static) | reproduced from measure-page's note; the shrinking document stalls the 2560 build stitch when the last chunk lands within 20 px of the end (r5: the gate then compared the previous round's build png) |
| D5 | header: no mega-menu panels, no language menu, no search suggest, no download cart; nav items are links | header rows only | out of a template run (BACKLOG #148) |
| D6 | the download-cart icon is `download-single` at every width (live: a folder icon at 360) | 360 header, < 0.1 % | one icon in the nav document |
| D7 | the hero arrows / dots are CSS (chevron mask, 2-px lines), not the source's glyphs | hero, small | measured boxes, drawn |
| D8 | the "scroll to top" fixed button (live, bottom right of every chunk) not built | every live chunk at 360 / 1440 (a 48–60 px circle) | site chrome outside the template |
| D9 | the footer accordion below 1200 px opens per column (footer.js); the live breakpoint not measured beyond 360 | 360 footer | structure from spec 360 #7 (rows 84 + 2 px #fff) |
| D10 | consentmanager modal (`#cmpwrapper`, open shadow root) accepted (`--consent a.cmpboxbtnyes`) and hidden (`--hide #cmpwrapper`) on every live reading | — | the first measure had the modal in every chunk |

## Motion (gate --probes at 1440, served; `gate-served/motion-compare.txt`)

| # | live | build | verdict |
|---|---|---|---|
| M1 | hover colour on nav links and social links (150 ms), teaser hover moves the link label (`span.transform`) | none | missing — not built (polish) |
| M2 | slider autoplay (`is-active` ×8, `transform` 800 ms), lazy-load fades (`is-lazy-loaded`, opacity 300 ms), `entered` reveals | none | missing — static build (D1) |
| M3 | header `is-sticky` morph (height / padding / width transitions 150 ms) | `header-sticky` class, no transition | build pins without the 150 ms transition; motion tool reports the build as EXTRA (20 px) |
| — | hover on pill buttons | — | dead on live (no hover diff) — not required |
