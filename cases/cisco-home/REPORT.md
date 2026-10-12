# cisco-home — report

Source https://www.cisco.com/ (403 to plain clients; `first` switched to the Chrome tier by itself). Repo aemcoder-adobe/sdt-cisco-lite, branch blocks-first.
Served: https://blocks-first--sdt-cisco-lite--aemcoder-adobe.aem.page/drafts/cisco-home (preview only).

| | 360 | 1440 | 2560 |
|---|---|---|---|
| first round | 59.74 % | 61.31 % | 62.34 % |
| prototype at stop (r5) | 6.11 % | 8.46 % | 4.34 % |
| served | 6.18 % | 8.46 % | 4.34 % |
| Δh doc at stop | -73 | -46 | -23 |

Clock: t0 → stop 16:03 (5 rounds); `first` 1:59. Leak: prototype vs served at 1440, 15 wrapper selectors: identical (leak-proto.txt / leak-served.txt).
Sections over 10 % at stop (1440): #6 global scale 12.2, #7 carousel 12.4, #8 latest 15.2, #9 next steps 17.0; at 360: #1 hero 12.3, #6 10.5, #9 30.2 (offset from #8 +50).
Blocks: hero (×2: video poster hero, tabs showcase), cards (×3: logo wall, tile nav, news), columns (accordion + image), carousel (CSS-only track).
