# REPORT — citizensbank about-article

**Source** https://www.citizensbank.com/about-us/sustainability-impact.aspx — final URL identical, no redirect, 200.
**Tier line** (probe-load): `--chrome` — headless Chromium gets a 403 "Access Denied"; the installed Chrome (headless) gets the page.
No consent overlay visible (OneTrust present at 0 height), no fixed/sticky layer, no `<main>` (content root `body`, dump key `body (no main)`),
no shadow hosts. Profile `migration/site.json` written at t0; every later instrument read it (nothing typed again).
**Noise floor** 1440: 0 % (Δh 0; live-1440 vs live-1440-b, measure-page --noise).
**Document heights** live 360 6583 · 1440 3143 · 2560 3143 (fixed module cap 1216 → cap-probe PASS at 2560).

## Sections (measure, `--sections '#iw_comp1755771685703, .iw_placeholder > .iw_component, section.dcom-c-disclosure'`)
header 201 · hero 501 · section title 102 · text 64 · featureGrid (image) 582 · featureSingle 461 · section title 102 ·
featureGrid (card) 566 · disclosure 184 (after the footer in the live DOM) · footer 382.

## Blocks (4 block sections, 2 blocks + 2 variants; header and footer from the foundation)
| block | variant | live module | section style |
|---|---|---|---|
| columns | hero | dcom-c-hero-commercial (h1 p \| picture 592×501 cover) | `hero` |
| cards | flat | dcom-c-featureGrid--image (picture h3 p a×n ×4) | `grey` |
| columns | — | dcom-c-featureSingle (picture 592×333 \| h2 p + filled + ghost button) | `feature` |
| cards | — | dcom-c-featureGrid--card (white card br 8 shadow, picture h3 p link ×4) | `grey` |
| default content | — | section titles (`grey-title`), text block (`grey-text`) | |
| header / footer | — | nav doc 4 sections (brand, primary, tools, section sub-nav); footer doc 3 sections (columns, secondary, disclosure) | |

## Three-width table (pixel % vs the live capture; noise floor 0 %)
| build | 360 | 1440 | 2560 | cap-probe 2560 | Δ doc 360/1440/2560 |
|---|---|---|---|---|---|
| prototype (harness :8993) | 14.82 | 2.42 | 1.36 | PASS (0 of 4 rows) | 0 / −2 / −2 |
| served (`/drafts/sustainability-impact`) | 14.98 | 2.61 | 1.47 | PASS | 0 / −2 / −2 |

Section rows: Δh ≤ 2 px on every section at the three widths (gate `tables: CLEAN`), both builds. Leak table on both sides identical
(20 selectors, 0 differing lines). Served − prototype ≤ 0.2 points at each width (the pipeline's picture renditions; no leak).

**360 residual (named, REGISTER D1):** the live page paints 6 broken images as alt-text boxes at 360 (measure-page note); the build shows
the pictures. Diagnostic gate with the build's pictures hidden at 360 (`gate-diag/`, not a shipped rule): the boxed-card bands fall from
37.6 / 33.8 % to 2.7 / 4.1 %, the feature band from 7.6 to 4.6, the flat band 1800–2700 from 21.6 to 15.2 — ≈ 10 points of the 14.8 % are
that quirk; the page cannot go under 10 % at 360 without hiding correct content.

## Rounds
| round | width(s) | result | what the digest / pair named → the change |
|---|---|---|---|
| 1 | 1440 `--round` | 3.9 %, Δ doc −323 | footer paddings lost to a 0,1,2 generic rule → `:where()`; login cell inflated by the spanning utility row → `justify-self: end`; nav `a` 2 px side padding; `strong` 600; cap-probe Δ−32 → module box 1280 (gutter 32 at ≥ 1020) |
| 2 | 1440 `--round` | 3.51 %, Δ doc 26, tables CLEAN, cap PASS | footer's own 32 px bottom before the disclosure; flat p→link 16 (draft said 18, glyph box); card body bottom 25; hero half-pixel |
| 3 | 360/1440/2560 + probes | 30.72 / 2.42 / 1.36 | 360: hero mobile rule lost to `.columns.hero > div` (0,2,0); footer cap rule also matched the block element → whole footer boxed; pair at 360: hero text cell precedes the picture (`+ div` never matched), flat 16 px top+bottom, card body inset 16 at 360 |
| 4 | 360/1440/2560 + probes | 14.82 / 2.42 / 1.36, tables CLEAN at 3 widths | stop: residual named (D1) |
| served | 360/1440/2560 + probes | 14.98 / 2.61 / 1.47 | = prototype |
| motion | 1440 + probes (prototype, then served) | 2.69 / 2.92 with the chrome bands masked; motion 3 parity, 1 missing (M2), 1 advisory (M3) | motion-compare.txt had the two buttons MISSING on build (the summary line said "dead on live"): hover bg + inset shadow + `transition: all 100ms` from motion-live.json |

Table rounds 2 (base width), gate rounds 2 (three widths), motion round 1, served 2 (three widths; then base width + probes).

## Motion
Probes: 5 hovers (filled and ghost button, flat-card link, boxed-card link, primary nav link) + header scroll-morph. Live: the two
buttons change background and inset box-shadow with `transition: all` (100 ms events); the three links and the header do not move.
Build after the motion round: parity on both buttons (prototype and served); M2 a live `transform` transition event with no visible
transform; M3 a build-only `background-color` event name (advisory). REGISTER M1–M3.

## Timing (TIMELINE.md; UTC)
setup 22:18:22 → 22:25:37 = 7 min 15 s · t0 22:26:35 · measure done 22:30:52 (+4) · re-measure with module sections 22:33:58 (+7) ·
lint clean 22:38 (+11) · CSS written 22:52 (+26) · first prototype served ≈ 22:54 (+28) · round 1 23:06 (+40) · round 2 23:08 (+42) ·
first three-width gate (cap-probe PASS, 1440/2560 < 10 %) 23:10:47 (+44) · 360 best 14.82 at 23:15:48 (+49; never < 10 %, D1) ·
pushed + synced 23:18:39 (+52) · served gate 23:22:18 (+56) · motion round 23:27:32 (+61) · served motion gate 23:29:40 (+63) · documents put to DA 22:38–22:39 (preview 200, before the CSS).

Served: https://blocks-first--sdt-citizensbank--aemcoder-adobe.aem.page/drafts/sustainability-impact
