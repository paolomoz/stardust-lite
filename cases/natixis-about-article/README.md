# natixis-about-article — template case (stardust-lite 39e6a67, 2026-10-03)

| page | template | prototype 360 / 1440 / 2560 | served 360 / 1440 / 2560 | noise | cap-probe | lint | t0 → first proto / < 10 % / probes / served |
|---|---|---|---|---|---|---|---|
| https://www.im.natixis.com/en-intl/about/diversity-equity-and-inclusion | `about-article` | 1.39 / 0.15 / 0.09 % | 1.06 / 0.17 / 0.09 % | 1440 0 % | PASS 2560 | 0 🔴 3 🟡 | 32 / 43 / 46 / 52 min (final served 59) |

Served (preview only): https://blocks-first--sdt-natixis--aemcoder-adobe.aem.page/drafts/diversity-equity-and-inclusion — site repo `aemcoder-adobe/sdt-natixis`, branch `blocks-first`.

## Files

- `REPORT.md` — numbers, clock, blocks, lessons. `REGISTER.md` — triage table (the content model), deviations D1–D13, motion. `LINT.md` — David's Model run and the three 🟡 justified. `TIMELINE.md` — every milestone with its UTC stamp. `NOTES.md` — friction, ranked by minutes.
- `doc/` — the authored documents as put to DA: `diversity-equity-and-inclusion.html`, `nav.html`, `footer.html` (`.draft-author.html`, the raw `author --draft-new` output, is not committed).
- `triage.md` / `triage.json` — the edited triage (`triage-draft.md` is the tool's draft). `probes.txt` — the gate's motion probes. `leak-sels.txt` — the leak table's wrappers.
- `scripts/fix-doc.mjs` — the case script that finishes the `--draft-new` draft (accordion panels from the hidden dump, cards / columns rows, nav + footer beyond the simplest shape).
- Not committed (regenerated): `measure/` (specs, dumps, captures, brief inputs), `media/`, `proto/`, `gate/`, `gate-served/`, `crops/`.

## Reproduce

```sh
# step 1 (≈ 40 s per run)
npx stardust-lite measure-page https://www.im.natixis.com/en-intl/about/diversity-equity-and-inclusion --out measure --noise \
  --sections 'main > div > div > .breadcrumb, main > div > div > .container > div > div > div'
npx stardust-lite content-dump <url> 1440 --roots 'div.root.container' --hidden '.cmp-accordion__panel' --out measure/hidden-1440.json --consent '#onetrust-accept-btn-handler'
npx stardust-lite brief measure
# step 2–3
npx stardust-lite triage measure/content-1440.json --blocks ../../blocks.json --out triage.json --md triage.md --spec measure/spec-1440.json --structure measure/structure-1440.txt
npx stardust-lite triage --from-md triage.md --out triage.json
npx stardust-lite media-fetch measure/content-1440.json --out media --base https://www.im.natixis.com
npx stardust-lite author triage.json --content measure/content-1440.json,measure/hidden-1440.json --blocks ../../blocks.json --media media/manifest.json \
  --media-host https://blocks-first--sdt-natixis--aemcoder-adobe.aem.page/drafts/media --out doc/diversity-equity-and-inclusion.html \
  --nav doc/nav.html --footer doc/footer.html --nav-path /drafts/nav --footer-path /drafts/footer --url <url> --draft-new
node scripts/fix-doc.mjs && npx stardust-lite lint doc/diversity-equity-and-inclusion.html
npx stardust-lite da-put aemcoder-adobe/sdt-natixis/blocks-first media/* --to /drafts/media
npx stardust-lite da-put aemcoder-adobe/sdt-natixis/blocks-first doc/nav.html doc/footer.html doc/diversity-equity-and-inclusion.html --to /drafts
# step 5–7 (from the site repo root)
npx stardust-lite harness migration/cases/about-article/doc/diversity-equity-and-inclusion.html --serve migration/cases/about-article/proto \
  --name diversity-equity-and-inclusion --port 8974 --fragments https://blocks-first--sdt-natixis--aemcoder-adobe.aem.page \
  --content migration/cases/about-article/measure/content-1440.json,migration/cases/about-article/measure/hidden-1440.json --site-repo .
npx stardust-lite gate --live <url> --build http://localhost:8974/diversity-equity-and-inclusion.harness.html --out gate --widths 360,1440,2560 --consent '#onetrust-accept-btn-handler' --probes probes.txt
npx stardust-lite sections http://localhost:8974/diversity-equity-and-inclusion.harness.html --widths 360,1440,2560 --spec-dir measure --out measure
npx stardust-lite gate --live <url> --build https://blocks-first--sdt-natixis--aemcoder-adobe.aem.page/drafts/diversity-equity-and-inclusion --out gate-served --widths 360,1440,2560 --consent '#onetrust-accept-btn-handler' --origin gate --probes probes.txt
npx stardust-lite leak <build-url> --sels leak-sels.txt --width 1440
```
