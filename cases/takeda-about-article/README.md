# Case takeda-about-article — Global CSR Program (corporate-giving)

Source: https://www.takeda.com/about/corporate-responsibility/corporate-giving/ (200, no redirect). Template `about-article`. Site repo `aemcoder-adobe/sdt-takeda`, branch `blocks-first`, stardust-lite `a7cebff`.
Served draft: https://blocks-first--sdt-takeda--aemcoder-adobe.aem.page/drafts/corporate-giving (nav `/drafts/nav`, footer `/drafts/footer`, media `/drafts/media/`; preview only).

Tier line (step 1): `--consent 'button#onetrust-accept-btn-handler'`, 1 shadow host, sticky header 71 px; later `overlays.hide`: `#ot-sdk-btn-floating`, `[class^="BackToTopButton-module"]`.

## Reproduce (from the site repo root)
```
npx stardust-lite probe-load <url> 360,1440,2560 --profile migration/site.json
npx stardust-lite measure-page <url> --out migration/cases/about-article/measure --noise
npx stardust-lite brief migration/cases/about-article/measure
npx stardust-lite triage …/measure/content-1440.json --blocks migration/blocks.json --spec …/measure/spec-1440.json --out …/triage.json --md …/triage.md   # edit, then --from-md
npx stardust-lite media-fetch …/measure/content-1440.json --out …/media; media-fetch …/measure/media-1440.json --fonts fonts; da-put aemcoder-adobe/sdt-takeda/blocks-first …/media/* --to drafts/media
npx stardust-lite author …/triage.json --content …/measure/content-1440.json --blocks migration/blocks.json --media …/media/manifest.json --media-host <host>/drafts/media --out …/doc/corporate-giving.html --nav …/doc/nav.html --footer …/doc/footer.html --nav-path /drafts/nav --footer-path /drafts/footer --draft-new --site migration/site.json
python3 migration/cases/about-article/scripts/fix-doc.py      # cards rows from the dump (author flattens a link-wrapped unit), tiles, cta, footer, nav tools, 3 section styles
npx stardust-lite spec-to-css …/measure --triage …/triage.json --doc …/doc/corporate-giving.html --out blocks   # drafts kept in drafts/
npx stardust-lite css-lint . ; harness …/doc/corporate-giving.html --serve proto --name corporate-giving --port 8984 --fragments <host> --content …/measure/content-1440.json --site-repo .
npx stardust-lite gate --live <url> --build http://localhost:8984/corporate-giving.harness.html --out …/gate --round   # ×5, then --widths 360,1440,2560 --probes …/probes.txt
npx stardust-lite sync-poll <host> . blocks/… --trigger aemcoder-adobe/sdt-takeda/blocks-first ; gate … --build <host>/drafts/corporate-giving --out …/gate-served --widths 360,1440,2560 ; leak on both
```

## Files
REPORT.md (numbers), REGISTER.md (triage, deviations, motion), LINT.md, TIMELINE.md, NOTES.md (friction), doc/ (the three documents), triage.md/json, brief.txt, probes.txt, leak-sels.txt + leak-proto.txt / leak-served.txt, measure/ (specs, dumps, summary; captures not committed), gate/ and gate-served/ (tables, json; PNGs not committed), drafts/ (spec-to-css output), scripts/fix-doc.py, scripts/fixed-layers.mjs.
