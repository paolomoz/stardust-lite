# REPORT — acs-about (https://www.acs.org/about.html, template `about`)

Site repo `aemcoder-adobe/sdt-acs`, branch `blocks-first`, stardust-lite `d58b9f8` (branch `exp/five-min`). Served draft (preview only):
https://blocks-first--sdt-acs--aemcoder-adobe.aem.page/drafts/acs-about

## Numbers

| | 360 | 1440 | 2560 |
|---|---|---|---|
| first gate (r1) pixel % | 31.55 | 14.54 | 10.38 |
| prototype at `stop:` (r8) pixel % | 9.39 | 8.27 | 8.86 |
| prototype Δdoc (r8) | 9 | 20 | 53 |
| served pixel % | 9.35 | 8.25 | 8.84 |
| served Δdoc | 9 | 20 | 53 |

Rounds (`gate --round --widths 360,1440,2560`, 75–79 s each):

| round | 360 | 1440 | 2560 | what changed |
|---|---|---|---|---|
| r1 | 31.55 | 14.54 | 10.38 | first prototype |
| r2 | 37.26 | 8.43 | 8.95 | real Stolzl bytes (the first fonts were the WAF's HTML), header fixed + global bar leaves on scroll at >= 900 |
| r3 | 14.25 | 8.39 | 8.93 | 360 paddings / type / cards from spec-view 360; link cards in the source's order |
| r4 | 13.82 | 10.17 | 9.93 | bento patterns authored (over the picture — wrong layer); footer 360 grid |
| r5 | 12.56 | 8.27 | 8.86 | pattern under the picture, the picture window an ellipse |
| r6 | 11.95 | 8.27 | 8.86 | bento 360 text widths, history bottom |
| r7 | 11.80 | 8.27 | 8.86 | yellow card window 240 at 360 |
| r8 | **9.39** | **8.27** | **8.86** | 360 offsets (strategy -4, link-card gap 10, brand-card gap 22, bento bottom 8) — `stop:` |

leak (16 selectors) prototype vs served: 0 differing lines. cap-probe (served gate): FAIL at 2560, a box-model reading (REGISTER D7).
Motion (probes): 0 parity / 24 missing / 1 advisory (REGISTER).

Clock (minutes from t0 = 06:43:07, END stamps in TIMING.log): brief read 1.9 · triage done 3.4 · media + fonts 6.4 · document authored + lint
8.3 · CSS written 14.4 · first prototype 15.8 · r1 17.1 · `stop:` (r8) **35.1** · pushed + synced 35.8 · served gate **38.1** · leak 39.0 ·
probes 41.3. Setup 1.2 min. Instruments ran 1103 s of the 2106 s to the target (52 %), 1247 s of the 2285 s to the served gate.

## What the method / tools got wrong or left out on this page

1. The origin (Imperva) answers a headless load, curl and `fetch` with a 212-byte HTML challenge — intermittently. `probe-load`'s first
   360 load was the challenge page (`iframe#main-iframe`) and the tier line still said "no flag needed"; `media-fetch` (curl) saved the
   challenge as 20 images (skipped, correctly) and as the four `.woff2` font files (saved, **status 200, bytes not checked**) — r1 rendered
   in the fallback face (31.6 / 14.5 / 10.4 %); `--from-page` captured 0 of 28 on its first try and 28 of 28 on the second; `--fonts`
   ignores `--from-page`. A case script (`scripts/fetch-fonts.mjs`) kept the page's own woff2 responses (its first run also hit the challenge).
2. `measure-page`'s header selector matched every in-section `<header class="acs-heading">` (9 section titles): the brief and the spec
   carry ten "HEADER" rows, `spec-to-css` wrote ten header drafts (all but one a section title) — the si-home defect (BACKLOG 206), still open.
3. The footer band (`div.footer.acsFooter.parbase`, outside `<footer>`) came BEFORE `main` in the dump's key order, so `splitSections`
   made it content row 1 (above the hero) instead of the footer: `scripts/reorder-roots.py` re-ordered the dump by box y. The local nav
   (`div.localnav-wrapper`, fixed under the header) was folded into the header chrome by the link-only rule — right for this page.
4. `author --draft-new` lost every card-wide link and button href (the cards' `a.card-link` wraps the card; the buttons are `a.acsbutton >
   span`) and wrote `:icon:` for every arrow; the document, the nav (4 sections) and the footer split were written by
   `scripts/build-doc.py` from the draft's pictures.
5. The source's header is fixed at rest and its global bar leaves the flow once the page scrolls (-105 at >= 900) — the measure note named
   it ("a layer that leaves the flow when it pins: reproduce it"); r1's 1440 rows were all Δy 105 until header.js reproduced it.

## Files

`doc/` (acs-about, nav, footer), `triage.md` / `triage.json`, `scripts/` (reorder-roots.py, build-doc.py, icons.py, fetch-fonts.mjs),
`gate-r1..r8.log`, `gate-served.log`, `gate-probes.log`, `leak-*.txt`, `REGISTER.md`, `LINT.md`, `NOTES.md`, `TIMELINE.md`, `TIMING.log`.
