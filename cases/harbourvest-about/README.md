# harbourvest-about — case (template `about`, HarbourVest Partners, AEM Sites origin)

`https://www.harbourvest.com/it/en/about-harbourvest` (Italy / English / Institutional Investor edition by cookie) → blocks-first prototype
and served draft `https://blocks-first--sdt-harbourvest--aemcoder-adobe.aem.page/drafts/about-harbourvest` (preview only).

| | 360 | 1440 | 2560 | noise 1440 | cap-probe | motion | leak |
|---|---|---|---|---|---|---|---|
| prototype | 15.73 | 3.56 | 3.57 | 0 % | PASS | 1 parity, 0 out of tolerance, 1 advisory missing (JS class) | 20 rows identical |
| served | 15.55 | 3.53 | 3.55 | | PASS | same | |

t0 13:56:38Z · measure done +13.6 min · documents lint clean +26.0 · first prototype +47.8 · 1440/2560 < 10 % at r4 +65.5 ·
probes pass +82.6 · served gate +82.6 · final +94.2. Setup 2.4 min. 360 carries one named residual (−42 px: two trailing
`&nbsp;` in the source's intro heading the pipeline trims); every other section row ≤ 5 px at 360 and ≤ 2 px at 1440 / 2560.

Files: `REPORT.md` (numbers, clock, findings, blocks), `REGISTER.md` (composition, triage, deviations, motion), `LINT.md`, `TIMELINE.md`,
`NOTES.md` (friction, ranked), `doc/` (the three authored documents), `triage.md|json`, `measure/` tables, `gate/` and `gate-served/`
tables and logs, `probes.txt`, `leak-*.txt`, `scripts/hv-cookies.mjs` (the cookie / fragment-wait preload every instrument ran under).
