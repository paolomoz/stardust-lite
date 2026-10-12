# REGISTER — vision-mission

## Triage (final model; `triage.md` is `first`'s draft)

| # | live section | model |
|---|---|---|
| 0 | header | home's `header` (nav `/drafts/nav`) |
| 1 | c-heroteaser--small (picture) | default content: picture, section style `banner` |
| 2 | breadcrumb (a › a › text) | default content: list, section style `breadcrumb` (chevrons in CSS; hidden below 576) |
| 3 | h1, intro, the vision / mission graphic | default content |
| 4 | intro p + "Creating Value." / "A better tomorrow." | default p + `columns` (2), style `continued` |
| 5 | Our Technologies / Your solutions / Powered by… | `columns` (3), style `continued` |
| 6 | two paragraphs | default content, style `continued, compact` |
| 7 | Code of Conduct (lucent background, picture beside text, pill) | background picture + h2 + `columns media`; style `bg-image, lucent` |
| 8 | Our Values (4 cards) | h2, h3, p + `cards` (4-up rule); style `grey` |
| 9 | Follow us on | home's `social` section (icon tokens) |
| 10 | footer | home's `footer` (`/drafts/footer`) |

## Deviations

| where | what | cost |
|---|---|---|
| #1 banner at 360 | the live page serves a mobile crop (800×454) of the header image; the document holds one picture (1920×327), cropped with `object-position: 40% 50%` | 360 band 0: 19.9 % |
| #8 cards | the live card is one link (image, title, text); the document links the "Find out more" line only | — |
| #9 social | icons render monochrome on the build (the home's colour rules set `color`, the inline SVGs do not use `currentColor`) — inherited from continental-home | band 3150 at 1440: 16.7 % with the footer offset |
| #7 Code of Conduct | Δh +9 (1440) / +17 (2560) | within the page budget; not chased (after the stop) |
| chrome | header Δh 84 at 1440 / 2560, footer Δh -120 at 360 — the home's chrome, masked, not judged | — |

## Motion

None measured beyond the home's header (sticky) — the page has no carousel, no autoplay, no hover panels outside the chrome. Probes not run.

## Open

- `migration/blocks.json` not rewritten: `block-inventory scan` refused (this clone lacks the home case's gate evidence — 4 budgets would drop to 1).
- `columns media` and the `article` template are new vocabulary for the site; the 4-up `cards` rule keys on four children.
