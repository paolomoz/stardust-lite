# toryburch-home — register

## triage (final)
| # | live section | model |
|---|---|---|
| 0 | header (banner + bar) | nav doc, 4 sections: brand / sections (Shop) / tools (Search) / banner |
| 1 | hero video + SHADES OF FALL / CHARLIE + 2 links | default content: 3 posters (1440, 2560, 360) + texts + links |
| 2 | Charlie product slider ×15 | carousel (rows: picture / name) — no slider JS |
| 3 | Runway Shop / Boot Guide | columns 1 × 2 |
| 4 | 6 category tiles + Bunny Knot | one section: cards (6) + default content (Bunny Knot) — the 360 order puts Bunny Knot between Handbags and Shoes |
| 5 | footer | footer doc (menu / foundation band / legal) |

## deviations
| what | where | cost |
|---|---|---|
| Hero is a still poster of the video, a different frame per width: the live capture froze t ≈ 2.58 s at 1440, 0.62 s at 2560 (poster switched at ≥ 1920 px), 2.09 s at 360 (the square video). Fitting the capture's frame, not a source choice. | section 1 | 0 at gate; a re-capture freezing other frames costs up to ≈ 8 % at 1440 / 11 % at 2560 |
| Video pause control (`:pause:`) dropped — its paragraph carries the wide poster | section 1 | ~0 |
| Carousel: no slider JS, no heart buttons, no prev/next arrow, no pagination dots | section 2 | 1440 band 450–900 ≈ 9 % |
| Header icons (account, favourites, bag, search glass) not drawn — no svgs; logo is text in sweet-sans-pro, not the svg | header | 1440 band 0 13.6 % (with the hero edge) |
| 360: Jewelry / Shoes / Bunny Knot have no SHOP link under them (only Bunny Knot's is authored); Shoes after Bunny Knot by CSS order | section 4 | 360 bands 900–2700 ≈ 5 % |
| Footer: no "Do Not Sell or Share" button; 360 accordion closed only (no toggle JS) | footer | 360 band 3600 14.2 % |
| cap-probe (served): "content cap 280 px at 2560" — module caps of tile texts, no page cap on the source (content runs full width) | — | not a deviation |
| Overlays hidden in site.json: #locale-popup, the welcome-email layover / mobile sheet | profile | — |

## motion
Hero video (autoplay loop) → poster. Carousel swipe → static row (overflow hidden). Entrance states (31 spec items) compared at rest.
