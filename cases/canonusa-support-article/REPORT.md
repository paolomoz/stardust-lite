# REPORT — canonusa support-article (template page, loop run)

**Page** https://www.usa.canon.com/support/about-consumer-support — final URL identical, no redirect; 403 to headless Chromium, 200 to installed Chrome (`--chrome` everywhere). **Served** https://blocks-first--sdt-canonusa--aemcoder-adobe.aem.page/drafts/about-consumer-support (preview only).

## Numbers

| | 360 | 1440 | 2560 (probe) | verdicts |
|---|---|---|---|---|
| prototype r11 (final, one run) | 4.04 | 1.95 | 1.16 | tables CLEAN (Δh ≤ 2 every section), cap-probe PASS |
| served | 4.15 | 1.99 | 1.18 | tables CLEAN, cap-probe PASS, motion 10 parity / 11 vendor-missing / 0 extra, leak table 16 rows identical (0 differing lines) |
| noise floor | — | 0 % (Δh 0) | — | `measure-page --noise`, two captures of 1440 |

Residual bands, named (REGISTER D3, D7, D11, D13): the top band 2.3 % at 1440 (live header captured 15 px up, mid-return), the card band 2.8 % (rendition of three webp photos under the red multiply veil), the 360 footer bottom (social-icon glyphs the live paints as broken images; copyright line 11 px lower). Page Δh: 360 +11 (footer), 1440 0, 2560 0.

## Clock (TIMELINE.md, UTC; t0 = 19:54:40Z)

setup 2 min (19:52:06 → 19:53:54: repo, fstab, Code Sync, seed + preview, stardust-lite init, branch pushed) · measure done +2.4 · lint-clean documents +14 (page) / +17 (nav, footer, media on DA) · first prototype +28 · first gate +31 (30.2 / 29.9 / 27.0) · first < 10 % at three widths +51 (r7: 7.88 / 3.52 / 2.78) · probes at parity +65 (r9) · document on DA +68 · code pushed +67, synced +80 (a dead sync-poll cost 10) · served gate +84.

Table rounds: 1 (triage draft → 3 row edits). Gate rounds: 11 prototype (r1 three widths; r2–r6 base/360; r7 three widths; r8 two; r9 three + probes; r10 base + probes; r11 three) + 1 served.

## What the rounds were

| round | change | evidence |
|---|---|---|
| r1 → r2 | `.cards.overlay` grid on the block, not on a `> div` wrapper that does not exist | section table: #3 Δh +626 |
| r2 → r5 | `button-wrapper` (the boilerplate's class) for the card/bumper buttons; list title `strong` back to 700; tabs 3 px gap; bumper insets; red veil `::after` + `mix-blend-mode: multiply` | pair 1440; crop --vs; deep-probe `::after rgb(226,33,40)` |
| r3 → r6 (360) | list card head: flex → float → the live's inline run (img `vertical-align: middle`, inline bold title that wraps under the icon) | pair 360 (title boxes 65 vs 46), deep-probe span.h5 `display: inline` |
| r6 → r7 | overlay h3 `letter-spacing` 6.79 px at 360, margins 0 0 8 / button 24 | deep-probe h3.title at 360 |
| r7 → r8 | 1440 shell cap on the wrappers (`padding: 0 108px`), header hides fully at 360 by scroll direction, footer accordion rows as on live, bumper text boxes 84 / 42 | cap-probe 4/4 FAIL → PASS; footer crop; scroll-probe 360 |
| r8 → r9 | list inset 228 on the one wrapper (my 108 had outranked the shell's 120) | pair 1440: rows at x108 |
| r9 → r10 | header morph as `top`/`height` (the live's transitioned properties), 150 ms colour transitions, nav hover removed (dead on live), footer open list inset | motion-compare: 2 → 10 parity |

## Content model (REGISTER)

Default content: hero h1 + p (`hero-dark`), the logo picture, two h2, the MORE SUPPORT h3, the footer's five link groups, social and copyright paragraphs, the promo text. Blocks: `columns (icons)` 1 × 3, `cards (list)` 5 × 2, `cards (overlay)` 3 × 2, `columns (bumper)` 1 × 3 — all Block Collection shapes. Section styles carry the source's spacing (`hero-dark`, `about-support`, `more-support`, `bumper`, `dark`). Nav document: 7 sections (tabs, tools, logo, search placeholder, nav, right links, promo); footer: 2 sections. Lint: page 0/0, footer 0/0 after remodelling a 5-column block into default content, nav 1 🟡 (SVG verified vector).

## Lessons (for BACKLOG)

1. A painted band inside `main` but outside the content root (the 40/59 px promo bar) is in no table and not in `unassigned`; found in the first crop. The unassigned-band check should cover main's children outside `--main`.
2. `measure-page --footer 'a,b'` keeps only the first match in the spec; the real footer had no rows. Record every footer match as a section.
3. `media-fetch --browser` cannot pass a WAF that refuses top-level navigations; the page's own responses can (`scripts/asset-capture.mjs`, 23 files incl. 6 fonts).
4. The brief's unit line should print `display` / `vertical-align` of a unit's first leaves: an inline img + inline title read as flex cost three 360 rounds.
5. `sync-poll --trigger` must not exit when `DA_TOKEN` is absent — poll without the trigger.
6. The motion sampler reads the build's `header` element; a fixed bar inside it morphing exactly like the live is reported MISSING — parity by `scroll-probe`.
7. The live capture can hold a fixed layer mid-return (15 px) after the settle ladder while probe-load at rest says 0; the floor hides it (deterministic). Re-settle fixed layers before chunk 1 or flag the mismatch.
