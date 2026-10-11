# nfl-home — register

## Triage (final model)
| live section | block / default | section style |
|---|---|---|
| Centerpiece 1 | teaser | lead |
| Centerpiece 2 (video) | teaser (video) | lead |
| ANALYSIS | h2 + cards (25) | — |
| Flag Football | promo (center) | — |
| Headline Stack | headlines | rail, rail-inline |
| rail ad 300×250 | ad-slot | rail |
| Favorite Team Card | team-picker | rail, rail-inline |
| We want to hear from you! | link-card | rail, rail-top |
| 4 rail promos | promo | rail |
| Ways to Watch | link-card | rail |

## Deviations
| what | why | pixel cost |
|---|---|---|
| Leaderboard ad above main (970×90 / 320×50) not migrated; space reserved by main's top padding | third-party ad | part of 0–450 band (≈5 %) |
| Rail 300×250 ad not migrated (ad-slot reserves 256 px) | third-party ad | 1440 band 900–1350 (11.5 %) |
| Live scores strip (71 px) rendered empty | dynamic widget | header band |
| Headline list: the short (below-lg) titles authored for all widths | source serves two lists with the same links | text pixels at 1440 |
| Analysis pager ("1 of 9", arrows) and carousel motion not migrated; strip clipped | JS control | small |
| Team picker: star / NFL watermark artwork replaced by a gradient; info icon omitted | decorative | ≈1 % at 1440 band 900–1350 |
| Nav dropdowns (Watch/Games/News/Teams/Stats) not implemented (chevrons only); external ↗ marks via CSS | interaction out of clock | — |
| Footer mobile accordions show headings only (no toggle) | interaction out of clock | — |
| Footer team logos: link text visually hidden over the logo; jax / tb / shield SVG previews return 409 on DA | DA media | served 360 +0.3 % |
| Visually hidden "Centerpiece" / "Headline Stack" h2s dropped | a11y headings of the source widget | — |

## Motion
Not probed (no probes run after the clock).
