# REGISTER — si-home (triage, deviations, motion)

## Triage (triage.md edited, `triage --from-md`; rows 1, 2, 4, 5 removed in the document by `scripts/fix-doc.py`)

| # | live section (1440) | model | shape | rows × cols | section style |
|---|---|---|---|---|---|
| 0 | header 1440×201 (utility bar 81 + logo / menu 120) | nav document: brand · menu list · tools (My Visit, Log in, Donate) · search | — | — | — |
| 1–2 | skip links (visually hidden) | not authored (the pipeline and the boilerplate have none) | — | — | — |
| 3 | hero slideshow (unassigned band `div.region--highlighted`, 1440×620) | `carousel` (new block) | container | 5 × 2 (picture · preface + title link) | — |
| 4 | hr (duplicate of row 10) | dropped | — | — | — |
| 5 | hero (the same `section#splide…` dumped twice) | dropped | — | — | — |
| 6 | "Smithsonian Homepage" h1 | default content | — | — | `sr-only` (visually hidden on the live page) |
| 7 | "Explore from Anywhere!" / "Plan Your Visit" | `columns` | simple | 1 × 2 | — |
| 8 | "What interests you?" 4 tall tiles | `cards (navigation)` + head as default content | container | 4 × 2 | `divider` (the hr above) |
| 9 | Featured 12 cards + button; Sidedoor 4 cards + button; Membership callout — ONE live section | `cards (featured)` ×2 + `columns (membership)` + heads / closing links as default content | container / simple | 12 × 2, 4 × 2, 1 × 2 | — |
| 10 | hr spacer section | folded into row 11's `divider` style | — | — | — |
| 11 | Shop / Magazine / Channel / Travel | `cards (links)` | container | 4 × 2 | `divider` |
| 12 | footer | footer document: logo · e-news button + social list · link list | — | — | — |

## Deviations (with their pixel cost)

| # | what | where / cost | why |
|---|---|---|---|
| D1 | **360 never under 10 %** (final 27.76 %, Δdoc −90) | every 360 band below ~2600 | the live 360 page differs between loads: the measured capture (12734) has the "American Music" picture broken (naturalWidth 0, an 800×600 alt-text box) and half the cards at their entrance's first frame; the slow-scroll origin (12380) has the picture loaded and drifts against the build by 10–30 px per card row although the build's landmarks equal the measured spec (2716 / 2818 / 3070 / 3214). Not chased past the 15-min budget |
| D2 | origin = `origin/` (scripts/origin-capture.mjs): 360 and 1440 slow-scroll captures, 2560 the prototype gate's capture | all gates from r7 | the cards (`c-card-animate`) enter on scroll; the stitcher freezes motion after a fast settle so every card below the settled region is captured faded (half the 360 page, the last row at 1440 / 2560); the slow-scroll 2560 capture caught the shop row mid-animation (cards stacked out of order) and was replaced by the gate's |
| D3 | shop row (`cards (links)`) 11–17 % at 1440 / 2560 | band 4500 | live entrance residue at the page bottom in the 1440 / 2560 origins |
| D4 | hero 10–16 % at 1440 / 2560 | bands 0–900 | veil approximated as `linear-gradient(4 % → 55 %)` from the luminance ratio (0.626 → 0.85 → ~1.0); the live picture is the `hero_full` 1440×630 rendition, the build's the DA original |
| D5 | back-to-top (fixed after one viewport) | not reproduced, `overlays.hide` | a site control; precedent takeda (BackToTop hidden) |
| D6 | carousel: no autoplay / slide transition; the first slide at rest, arrows and dots switch instantly | motion | the gate freezes slide 1 on both sides |
| D7 | header menus are labels (`<li>Visit :chevron-down:</li>`), no mega-menu panels; search is a link to `/search`; Donate links to `/support` (the live href is a `#FUNSL…` fragment for a donation widget) | header | the panels are out of the template run (BACKLOG #148 nav beyond the simplest shape) |
| D8 | footer e-news button is a link to `/newsletters` (live: a popup `button`) | footer | a control without href; the popup is a widget |
| D9 | hidden "Slideshow" h2 not authored | hero | visually hidden on the live page |

## Motion (gate --probes, probes.txt)

0 parity · 9 missing · 0 extra · 3 dead or unobserved on live · 0 out of tolerance. The live hover states (underline gradients on the
card titles and buttons, the menu buttons) are not reproduced — a register row, not chased (time budget).
