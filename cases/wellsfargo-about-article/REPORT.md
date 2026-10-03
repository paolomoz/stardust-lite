# REPORT — wellsfargo about-article (/about/inclusion/)

Setup (repo, fstab, Code Sync, seed content, stardust-lite init, branch): 22:17:50Z → 22:28:30Z = **10.7 min**. t0 = **22:29:17Z**.
t0 → first prototype **25.8 min** · → first < 10 % at three widths **46.6 min** · → probes pass **49.7 min** · → served gate **59.5 min**.

## Noise floor
measure-page `--noise` at 1440: **0 %** (Δh 0, live-1440 vs live-1440-b).

## Three-width pixel table (prototype, final, origin recaptured with the OneTrust layer hidden)
| width | pixel % | Δh | bands |
|---|---|---|---|
| 360 | 2.89 | 0 | 0:7.6 900:0.5 1800:0 2700:3.5 3600:0 |
| 1440 | 0.31 | 0 | 0:0.4 450:0 900:0 1350:0 1800:0.2 2250:1.8 |
| 2560 | 0.18 | 0 | 0:0.2 450:0 900:0 1350:0 1800:0.1 2250:1 |

cap-probe: PASS at 2560 (0 of 7 rows; two FAIL rows in round 1 — the h1 is a shrink-wrapped flex child (383) and the footnote wrapper a 1360 box — fixed in round 2).
Motion: 2 parity (outlined pill → #fff on #141414; text link → #141414), 0 out of tolerance, 1 MISSING (`presentedElement`, a live JS class toggle — BACKLOG #196, advisory), 5 hover probes dead on live (underline-only hovers `motion-observe` does not read; `hover-diff` verified them and the CSS carries them).

## Served (blocks-first host, /drafts/inclusion) — same origin captures
| width | pixel % | Δh |
|---|---|---|
| 360 | 2.86 | 0 |
| 1440 | 0.30 | 0 |
| 2560 | 0.17 | 0 |

Served within the prototype's numbers; motion identical; `leak` tables (28 selectors) identical — `leak-diff.txt` is empty.

## Rounds
Table rounds (triage → document): 2 `triage` runs + 2 `--from-md` (one crashed on a row I had broken); 1 `author`; hand edits on the three documents.
Gate rounds at 1440: **6** (1.47 → 1.56 → 1.56 → 1.49 → 0.33 → 0.31), then the three-width gate twice (3.53/0.31/0.23 → 2.89/0.31/0.18 after the 360 breadcrumb and the hidden OneTrust layer), one motion rerun (probe selector), one served gate.

| round | what changed | why (which table) |
|---|---|---|
| 1 → 2 | footer inner div renamed (`.footer` matched the block and the skeleton's inner div: padding ×2, +48) ; footnote gutter onto the wrapper; h1 `fit-content` | hottest band dy=4 at the footer (digest); cap-probe rows |
| 2 → 3 | hero / card img `display: inline` (the live mechanism) | digest "displacement" — no pixel effect (Chrome snaps; the fraction was the img height, not the gap) |
| 3 → 4 | header tools −5 px; outlined button fixed 176 wide; card bodies flex column with the link pinned to the bottom; footer 1 px rule in flow | `pair` rows (+4/+6, Δw −31, −22/−32, −1 px per link) |
| 4 → 5 | hero img natural ratio (549.6 = 1400×424/1080), card img 16:9 (373.5), link paragraph 17/22 line | deep-probe of both pages with fractional heights |
| 5 → 6 | footer rule as `border-left` at the item's edge (first transparent) | side-by-side crop of the bottom band |
| 3-width | mobile breadcrumb (12 px parent link + left chevron, current page hidden); profile `hide` OneTrust | 360 crop of the 0–900 band |

## Blocks
`hero` (picture + h2 + p; text over the image at ≥ 768, card under it below), `cards` (×3 sections: [picture] + h3/p/link; 2-up and 3-up from one auto-fit grid), `breadcrumbs` (new name — the live band sits between the chrome and the content root), `header` and `footer` (foundation skeletons, the header's bar/sections split added), section styles `page-title`, `mid-title`, `footnote`. Fonts: 4 Wells Fargo Sans faces (Regular / Bold / SemiBold / Light as separate families, as the source names them).

## Residuals (see REGISTER)
360 band 0–900 7.6 %: the mobile marquee is a server-side rendition (the same URL returns the same 1080×424 bytes to a fetch; the live 360 paint is a tighter crop) — the pipeline cannot carry it. 1440/2560 band 2250–2542 (1.8 / 1 %): footnote text font smoothing (zoom crop: same glyphs, same positions). The breadcrumb row's Δh +54/+34 and the mid-title row's −54/−42 are b-marked boundaries (the live breadcrumb is outside `main`, the live h2 anchor sits 54 below its section's top), not heights.
