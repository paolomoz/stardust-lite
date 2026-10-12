# intel-home — register

## Triage / model
- Sections passed by hand: `main .dark-theme.aem-GridColumn, main .cmp-title--news, main .newsarticle, main .tiles` (the auto guess split header/main/footer).
- Hero = `carousel`, one row per slide: picture (1080 rendition) + picture (360 rendition) | eyebrow, h2, p, CTA | background word. The second picture is the source's mobile art direction, authored.
- News = `columns` (one row, 3 cells); tiles = default h2 + `cards` (4 rows, link only). The separator between news and tiles is a border on the news wrapper.
- Nav: brand as text "intel." (no logo asset captured), 6 section links, "Ask Intel". Icons (account, globe, search) not authored.

## Deviations
- Live sticky header is repeated in every 900 px frame of the live capture; the build capture shows it once (sticky header present, capture is one frame). Residual in every band at 1440/2560 and the 20–25 % band at 3600.
- The animated hero (scroll-driven cube, slide dots, scroll arrow) is static: four stacked 900 px scenes; glow approximated with two box-shadows.
- Per-slide top drift at 360 (190/202/218/234) copies the capture's mid-animation state.
- Tile icons (360) and the logo image are not migrated; the brand square after the tiles h2 is a CSS pseudo-element.
- Footer: the foundation footer block, not styled this run (outside the gated sections).

## Motion
- Hero: scroll-pinned cube rotation between slides, slide indicator — not reproduced.
