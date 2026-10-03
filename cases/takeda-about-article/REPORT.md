# REPORT — takeda-about-article (corporate-giving)

| | |
|---|---|
| setup (repo, Code Sync, seed, init, branch) | 22:24:30 → 22:28:30 UTC = **4 min** |
| t0 (probe-load) | 2026-10-03T22:29:27Z |
| measure done (`--noise`) | 22:32:28 (+3 min) — doc 24635 / 11895 / 11625, 27 sections, **noise floor 1440: 0 %** (Δh 0) |
| document authored, lint clean | 22:49:43 (+20 min) |
| CSS drafts + merge, css-lint clean | 23:04:04 (+35 min) |
| first prototype served | 23:05:39 (**+36 min**) |
| first gate < 10 % at three widths, probes | 23:35:51 (**+66 min**) — 360 1.41 / 1440 0.50 / 2560 0.40 |
| probes pass (same gate: parity on the two probes the live read, 2 advisory, 0 out of tolerance) | +66 min |
| pushed + synced (sync-poll 23 s) | 23:37:47 (+68 min) |
| served gate done | 23:46:21 (**+77 min**) |

## Pixel table (noise floor 0 % at 1440; gate band 450, vh 900, hide: OneTrust float + BackToTop)

| build | 360 | 1440 | 2560 | Δdoc | cap-probe 2560 |
|---|---|---|---|---|---|
| prototype (round 5 + widths) | 1.41 | 0.50 | 0.40 | -1 / 0 / 0 | PASS (0 of 4 rows) |
| served `/drafts/corporate-giving` | 1.48 | 0.45 | 0.39 | -1 / 0 / 0 | PASS |
| leak table (17 selectors, 1440) | identical prototype ↔ served | | | | |

Base-width rounds: r1 15.22 % (cta −24, line-clamp, h2 margin collapse) → r2 1.55 % (footer padding doubled on `div.footer.block`) → r3 1.52 % → r4 1.31 % (hide third-party fixed layers, origin recaptured) → r5 1.23 % (label pinned; 1 px offset named) → widths 0.50 (46.96 px carried). Table rounds: 1 triage edit (14 rows flipped), 4 author runs (flags, chrome, fix-doc, section styles).

## Blocks
`hero` (new CSS), `columns` + `columns (cta)` (new CSS, boilerplate decorate), `cards` + `cards (tiles)` (new CSS + decorate: card-wide link, label span, arrow icon), `header` / `footer` (foundation decorates + measured CSS), `styles.css` (cap 90vw / 1200 / 1400 on `main > .section > div`, shell 1918, section gap 40 / 50, h2 rule, button). Fonts: Gotham SSm 300/400/500/500i/700 from the source's font files. Icons drawn: search, globe, arrow-right, linkedin, youtube.

## Definition of done
Three-width table with the noise floor ✓ · cap-probe PASS at 2560 ✓ · motion parity on every probe the live read (2 parity, 2 advisory, 0 out of tolerance) ✓ · lint clean at step 2 (0 🔴) ✓ · served within the prototype's numbers (≤ +0.07) ✓ · leak table identical ✓ · residuals named in REGISTER (7 rows) ✓. Stop rule applied after r5: every row within 2 px (Δy ≤ 1), residuals named.
