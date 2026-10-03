# cibc-careers — template case (blocks-first prototype)

- Site: `aemcoder-adobe/sdt-cibc`, branch `blocks-first`, content `da.live` `/aemcoder-adobe/sdt-cibc/drafts/`.
- Source: https://www.cibc.com/en/about-cibc/careers.html (template `careers`).
- Served (preview only, never published): https://blocks-first--sdt-cibc--aemcoder-adobe.aem.page/drafts/careers
  (nav `/drafts/nav`, footer `/drafts/footer`, media `/drafts/media/*`).
- Prototype: `node node_modules/stardust-lite/scripts/harness.mjs migration/cases/careers/doc/careers.html --serve migration/cases/careers/proto --name careers --port 8972 --fragments https://blocks-first--sdt-cibc--aemcoder-adobe.aem.page --site .` → http://localhost:8972/careers.harness.html

## Numbers (pixel % against the cached origin, noise floor 1440 0.00 %)

| | 360 | 1440 | 2560 (probe) | cap-probe | motion |
|---|---|---|---|---|---|
| prototype (r7) | 5.95 (Δh 54) | 2.39 (Δh +1) | 1.51 (Δh +1) | PASS 13/13 | 2 parity, 7 advisory, 8 live class toggles |
| served | 5.83 (Δh 53) | 2.39 (Δh +1) | 1.51 (Δh +1) | PASS 13/13 | same |

Leak table prototype vs served (30 wrappers at 1440): see `leak-diff-1440.txt`.

## What is committed

`README.md`, `REPORT.md`, `REGISTER.md` (triage, deviations, motion), `LINT.md` (+ `lint.txt`), `TIMELINE.md`, `NOTES.md`, `doc/`
(careers, nav, footer), `probes.txt`, `leak-sels.txt`, `measure/` tables (probe-load, structure, content, media, spec, deep, hidden,
cap-probe, scroll-probe; captures excluded), `gate/` and `gate-served/` JSON + motion text, `sections-r*/`, `pair-r*.log`,
`gate-r*.log`, `harness-r0.log`, `sync-poll-*.log`, `leak-*.txt`, `triage.json` / `triage-draft.md`.

Not committed (regenerate): `measure/live-*.png` (`measure-page … --noise`), `gate*/build-*.png`, `diff-*.png` (`gate`), `media/`
(`media-fetch … --out migration/cases/careers/media`), `proto/` (`harness`).

## Regenerate

Every instrument needs the real-Chrome tier on this origin: `export NODE_OPTIONS="--import $PWD/scripts/chrome-tier.mjs"`.

```
node node_modules/stardust-lite/scripts/measure-page.mjs https://www.cibc.com/en/about-cibc/careers.html --out migration/cases/careers/measure --widths 360,1440,2560 --sections 'main > div' --header 'header.header-centralized' --footer footer --consent '#onetrust-accept-btn-handler' --noise
node node_modules/stardust-lite/scripts/gate.mjs --live https://www.cibc.com/en/about-cibc/careers.html --build http://localhost:8972/careers.harness.html --out migration/cases/careers/gate --widths 360,1440,2560 --consent '#onetrust-accept-btn-handler' --origin migration/cases/careers/measure --probes migration/cases/careers/probes.txt
node node_modules/stardust-lite/scripts/gate.mjs --live https://www.cibc.com/en/about-cibc/careers.html --build https://blocks-first--sdt-cibc--aemcoder-adobe.aem.page/drafts/careers --out migration/cases/careers/gate-served --widths 360,1440,2560 --consent '#onetrust-accept-btn-handler' --origin migration/cases/careers/gate --probes migration/cases/careers/probes.txt
```
