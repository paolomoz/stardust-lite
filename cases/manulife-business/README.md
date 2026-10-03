# Case: manulife-business — Manulife Canada, template `business`

| field | value |
|---|---|
| source | https://www.manulife.com/ca/en/business (AEM Sites, `gds-*` web components, 114 shadow hosts; 403 to headless Chromium → every instrument `--chrome`) |
| site repo / branch | `aemcoder-adobe/sdt-manulife` · `blocks-first` · stardust-lite `98b3529` |
| served (preview only) | https://blocks-first--sdt-manulife--aemcoder-adobe.aem.page/drafts/business · nav `/drafts/nav` · footer `/drafts/footer` · media `/drafts/media/` |
| overlays | consent `#onetrust-accept-btn-handler` (no reload); do **not** `--dismiss #nebula_div_btn` (it opens the Medallia survey) |
| widths | 360 · 1440 (base) · 2560 (probe; cap-probe PASS, 1200 module cap) |
| sections | 7 + header/footer; `--sections '.cmp-herolandingpages, #main-content > .aem-Grid > .cmp-container > .cmp-container > .aem-Grid > .aem-GridColumn'` |
| pixel % prototype / served | 360 2.01 / 2.02 · 1440 0.67 / 0.67 · 2560 0.37 / 0.38 — Δh 0 everywhere; noise floor 1440 0 % |
| blocks | hero · cards (tiles, icons, icons linked) · carousel (cards, articles) · columns (banner) · header · footer |
| clock | setup 2.2 min · t0 → first prototype 31 min · → < 10 % at three widths 43 min · → probes pass 58 min · → served gate 62.5 min |

## Files

- `REPORT.md` — numbers, clock, lessons. `REGISTER.md` — triage table, deviations D1–D14, motion table, gate rounds. `LINT.md` — davids-model-lint. `TIMELINE.md` — timestamps per milestone. `NOTES.md` — friction, ranked by minutes.
- `doc/` — `business.html`, `nav.html`, `footer.html` (the authored documents; media URLs point at the branch host's `/drafts/media/`).
- `triage.md` / `triage.json` — the edited triage (`triage --from-md`). `probes.txt` — the gate's motion probes (header lines `chrome:`-forced). `leak-sels.txt`, `leak-proto-1440.txt`, `leak-served-1440.txt`.
- `measure/` — `summary.json`, `spec-<W>.json`, `content-<W>.json`, `media-<W>.json`, `structure-<W>.txt`, `probe-load-<W>.txt`, `deep-<W>.txt`, `dom-<W>.html` (captures `live-<W>.png` not committed). `measure-polluted/` was the first run with the survey modal (deleted).
- `structure-pierce-*.txt` — `probe-structure --pierce` dumps (main 1440 depth 14 / 26, main 360, header 360, footer 1440 / 360): the only text reader for the shadow-held content.
- `deep-*.txt`, `hover-live.json`, `hover-build.json`, `hover-served.json` — deep-probe and hover-diff readings.
- `gate/r1..r7/`, `gate/served/` — `sections-<W>.json`, `pixel-<W>.json`, `cap.json`, `gate.json`, logs (PNGs not committed).
- `scripts/fetch-bytes.mjs` — save asset bytes from the page's own responses in Chrome (fonts behind a WAF).
- `brief.txt`, `content-view.txt`, `pair-*.txt`, `harness-1.log` — readings.

## How to replay

```
export STARDUST_CHROME=1
npx stardust-lite measure-page https://www.manulife.com/ca/en/business --out measure --widths 360,1440,2560 --noise \
  --consent '#onetrust-accept-btn-handler' --sections '.cmp-herolandingpages, #main-content > .aem-Grid > .cmp-container > .cmp-container > .aem-Grid > .aem-GridColumn'
npx stardust-lite harness doc/business.html --serve proto --name business --port 8978 --fragments https://blocks-first--sdt-manulife--aemcoder-adobe.aem.page --site-repo ../../..
npx stardust-lite gate --live https://www.manulife.com/ca/en/business --build http://localhost:8978/business.harness.html --out gate/rN --widths 360,1440,2560 \
  --consent '#onetrust-accept-btn-handler' --origin gate/r1 --triage triage.json --build-main main --probes probes.txt
```
