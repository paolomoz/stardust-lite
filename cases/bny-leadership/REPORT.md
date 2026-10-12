# REPORT — bny leadership (stardust-lite c8ecf9b, 2026-10-03)

Clock: setup 1.5 min (18:46:49–18:48:20). t0 18:48:55. Measure done +2.0 min. Triage + lint-clean document +9.3. First prototype +19.8. First gate < 10 % at three widths +43.2 (r6). Probes pass +51.7 (r9). Served gate +56.0.

## What the page is
Two source sections: a tertiary hero (navy band, Druk headline) and one general container holding a **tabs** component (Executive Committee / Board of Directors). Each panel is a biolist grid (20 / 12 round photos with name, title, "Meet X →") followed by a Quick Links container (h3, rule, 2 / 3 links). The Board panel is `display: none` at rest (hidden content: `content-dump --hidden div.tabs-container-detail`). Chrome: a fixed white header (unassigned band, no `<header>`) that hides at any scrollY > 0, a grey footer. Painted bands are a 1440 shell; content caps 1312 (hero), 1400 (tabs), 1280 (grid, footer). 0 shadow hosts; OneTrust consent; a Userway widget.

## Model
Sections as panels: section-metadata `tab: <label>` on each panel section, the `tabs` block auto-built in scripts.js from those labels (configuration, not an authored table), the grid a `cards.leadership` container (picture | h3, p, p>a), the Quick Links default content in the same section. The author's collection recipe for tabs (label | hidden-panel cell) produced a 1 × 2 label row plus 80 loose elements and no Board panel; the document was edited from that draft with `scripts/doc-from-draft.py` (texts, hrefs and media names from the draft and the hidden dump only). Lint clean, 92/92 texts in the capture.

## Findings (what cost rounds, in order)
1. **Fragment sections wrap their content** in `.default-content-wrapper` (METHOD step 5). `readFragmentSections` returns `{section, wrapper, …}` objects — appending them rendered nothing (r1), and flex on the section instead of the wrapper stacked the header tools and the footer columns (r2, r3). Three rounds, ~9 min, on a rule the method already states; the foundation ships no header/footer skeleton that models it.
2. **A fixed header the live hides on scroll** (`top: -height` at any scrollY > 0, scroll-probe) stays in the build and is painted at the top of every capture chunk: 2–4 % per band in r3, read by the crop, not by any table (the gate's hottest band said "rendition"). One scroll listener fixed it.
3. **Painted bands vs content caps at the probe width**: cap-probe PASSed on modules while the hero / footer bands bled full width at 2560 (live x560–2000, `extent`): 35 % of the top band in r5. `max-width: 1440px` on the band containers.
4. **A family with no face**: the h3 names ask for `BNYM_CORPORATE_Publico_Pro` 300 and the source loads only `…Publico_Pro_Roman` — the brief's "faces loaded" line says so, nothing flags it. Declaring the Roman face for the names wrapped two of them at 360 (+64 px, 9.9 %); matching the measurement (no face) gave 2.6 %.
5. **The card's trailing spacer** is 24 px + 16 margin (bio 184 / 170 measured vs 168 / 154 summed from the children): −16 per card at 360 for one round.
6. `measure-page`'s section guess (2 sections) was right for the model; `triage` read the tabs section as default content and `--sections` with finer roots dropped the grid (the dump collapses wrappers). `probe-structure` needed four runs (depth) to reach the tabs component.
7. Tabs recipe gaps (BACKLOG #148): the Board panel's own Quick Links were only found by `click-state` on the live (panel 1487 = grid 1205 + container 282) — the hidden dump had them, the document edit had not taken them.

## Numbers
Prototype 2.62 / 0.19 / 0.10 (360 / 1440 / 2560), served 2.62 / 0.23 / 0.13, Δh −1 / 0 / 0, cap-probe PASS, noise floor 0 %, leak 0 differing lines, hover 4/4 named states + click (tab, dropdown) parity. Residue: Userway widget (every live chunk), 1 px anti-aliasing in the chrome bands. Stop rule met at r7 (every section row within 2 px, residue named); r8 was the footer band cap at 2560, r9 the probes run after the hover rules and the Board quick links (rest pixels unchanged).

## For the method / tools (see NOTES.md ranking)
`author` tabs → sections-as-panels + cards rows + the panel's trailing default content; a foundation header/footer skeleton that consumes `readFragmentSections`; `brief` to flag families without a loaded face, the painted band bbox at the probe width and a header that hides on scroll; `--hide <css>` for third-party fixed widgets.
