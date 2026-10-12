# REGISTER — bmc home

## Triage (final model; `triage.md` is `first`'s draft)

| # | live section | model |
|---|---|---|
| 0 | header (logo, tools, main nav; mega-menus) | `header` from `doc/nav.html`: brand / sections / tools; the mega-menus are not authored |
| 1 | Gartner hero (bg picture, eyebrow, h1, button, MQ picture) | bg picture + `columns hero`; style `hero, dark` |
| 2 | BEFORE YOU… OPTIMIZE THE MAINFRAME (bg picture, lockup, outline button) | default content; style `feature, dark` |
| 3 | Highlights strip | bg picture + `columns highlights` (3 cells); style `highlights, dark` |
| 4 | Forbes stats timeline (6 slides) | eyebrow + `carousel stats`; style `stats, dark` |
| 5 | How we can help (2 link cards) | h2 + `cards links`; style `help, dark` |
| 6 | Trusted partner logos (marquee) | eyebrow, h2, `cards logos` (4 logos; the block clones 2 sets), link; style `logos, light` |
| 7 | The latest from BMC (3 resources) | h2 + `cards resources` |
| 8 | Gartner disclaimer | four italic paragraphs; style `disclaimer, light` |
| 9 | footer | `footer` from `doc/footer.html`: columns grouped by h3, legal row |

## Deviations

| where | what | cost |
|---|---|---|
| overlays | the sticky announcement bar dismissed on both sides (profile `dismiss`); the TrustArc consent accepted | — |
| #2 feature | the heading's text-scramble ("BEFORE YOU INNOVATE" → "…OPTIMIZE THE MAINFRAME") is static; the pause control is not built | — |
| #4 stats | static at the capture's state (progress to the second dot); no autoplay | — |
| #6 logos | the marquee is static at the capture's offset (-49 px); the 360 grid is the live layout; the pause control is not built | 1440 band 3600: 11.5 % (with the resources below) |
| #7 resources | 360 height +35 (text wraps) | 360 band 4500: 14.8 % |
| footer | search is a link styled as the field, not an input | 360 band 8100: 15.1 % |
| header | the mega-menus, the language sidebar and search are not built | — |

## Motion

Scramble heading, stats autoplay, logo marquee, hover scale on the resource pictures — all named above, none reproduced (prototype only).
