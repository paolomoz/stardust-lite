# REGISTER — wellsfargo about-article

## Triage (1440, from `triage` + edits; `triage-auto.md` is the untouched draft)
| # | live section | fingerprint | model | section style | source classes |
|---|---|---|---|---|---|
| 0 | masthead 1440×79 + fat nav 1440×60 | logo, utility links ×3, search, sign-on pill; 6 section links | `header` (nav doc: brand / sections / tools) | — | ps-masthead, ps-fat-nav-outer, ps-fat-nav-l1 |
| — | breadcrumb band 1400×22 (between chrome and main; dumped as an extra root, not a triage row) | a › text | `breadcrumbs` block, authored in the page-title section | — | ps-rsk-breadcrumb-container |
| 1 | page title 1400×73 | h1 | default content | `page-title` | ps-page-title |
| 2 | marquee 1400×555 | picture h2 p (text over the image) | `hero` | — | rsk-marquee-container, content-left |
| 3 | two cards 1400×654 | [picture (p×2 a)]×2, elevated, outlined buttons | `cards` | — | card-background-white, card-container, enhanced-txt-cm, ps-btn-secondary |
| 4 | "Ways we help" 1400×447 | decorative line, h2, [p×2 a]×3 elevated | default content (h2) + `cards` | `mid-title` | ps-mid-page-title-wrapper, enhanced-txt-cm, ps-btn-text |
| 5 | two text cards 1400×256 | [p×2 a]×2 elevated | `cards` | — | enhanced-txt-cm, ps-btn-text |
| 6 | footnote 1400×162 | p p a p | default content | `footnote` | ps-footnote, ps-footnote-text |
| 7 | footer 1440×146 | a×10, copyright | `footer` (footer doc: links list / copyright) | — | ps-responsive-footer, ps-footer-link |

Flipped from the draft: 3 `columns?` → `cards` (each unit is an elevated card: bg, radius 10, shadow); 4 and 5 `default content` → `cards` (same paint; the triage reads text runs without media as default). Hand-added: the breadcrumb (no triage row for an extra root).

## Deviations (with pixel cost)
| # | what | why | cost |
|---|---|---|---|
| 1 | Mobile marquee rendition: the live 360 paints a tighter crop of the same asset; the build paints the 1080×424 asset squashed into 360×126 (`fill`, as the live's img box is) | the rendition is chosen server-side per request (`media-fetch --extra` of the plain URL returned the same bytes); no `<source>` to read | 360 band 0–900: 7.6 % of the band, ≈ 2.4 of the page's 2.89 % |
| 2 | Footnote text smoothing | live/build glyphs identical in position; the live renders with a different smoothing (BACKLOG #175 html-level) | 1440 band 2250–2542 1.8 %, 2560 1 % |
| 3 | Breadcrumb inside the page-title section (live: a band between header and main) | the gate pairs by section order; a build section without a live partner would misalign the table | table row #0 Δh +54 / +34 (b-marked boundary, 0 px of paint: the h1 and the hero start at the live y) |
| 4 | Hamburger label "Menu" + `text-transform: uppercase` (live text "MENU"); three CSS bars for the live's three 30×2 spans | the skeleton's control | 0 px (pair: box identical) |
| 5 | Search control: `:search:` token hidden, the live sprite cell painted on the link | the live glyph is a sprite cell (-580 -62), not an SVG | 0 px |
| 6 | Mobile brand: the 220×23 PNG hidden, the live sprite cell (-594 -250, 100×45) painted on the link | the live mobile logo is a different artwork (stacked) | 0 px |
| 7 | Footer copyright `padding-top: 25px` at 360 | the live gap ul → copyright is 49 at 360 and 24 at 1440; nothing in the dump owns the extra 25 | 0 px |
| 8 | `presentedElement` class toggle | a live JS reveal class (9 adds); `motion-compare` lists it MISSING (BACKLOG #196) | none visible at rest |
| 9 | `createOptimizedPicture` removed from cards.js | it rewrites an absolute media URL to the page host (harness 404); the pipeline already renders renditions | 0 px |

## Motion
| probe | live | build | verdict |
|---|---|---|---|
| hover a.ps-btn-secondary | color #fff, bg #141414 | same | parity |
| hover a.ps-btn-text | color #141414 | same | parity |
| hover breadcrumb a, fat nav a, footer a, sign-on, masthead links | underline | underline (CSS) | dead on live for `motion-observe` (underline not read); `hover-diff` verified |
| header on scroll | static | static | n/a |
| presentedElement class | added 9× | — | MISSING (advisory) |
