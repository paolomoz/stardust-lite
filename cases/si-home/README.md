# Case si-home — Smithsonian Institution home

Source: https://www.si.edu/ (200, no redirect). Template `home`. Site repo `aemcoder-adobe/sdt-si`, branch `blocks-first`, stardust-lite `35f9b73`.
Served draft: https://blocks-first--sdt-si--aemcoder-adobe.aem.page/drafts/si-home (nav `/drafts/nav`, footer `/drafts/footer`, media `/drafts/media/`; preview only).

Tier line (step 1): no flag needed; `overlays.hide: a.c-back-to-top` (a fixed layer after one viewport). Origin for every gate from r7:
`origin/` (scripts/origin-capture.mjs — slow scroll before the stitch; 2560 replaced by the r6 gate capture).

## Reproduce (from the site repo root; `./tl <label> -- …` timed every command into TIMING.log)
```
npx stardust-lite probe-load https://www.si.edu/ 360,1440,2560 --profile migration/site.json
npx stardust-lite measure-page https://www.si.edu/ --out migration/cases/home/measure --noise
npx stardust-lite brief migration/cases/home/measure
npx stardust-lite triage …/measure/content-1440.json --blocks migration/blocks.json --spec …/measure/spec-1440.json --out …/triage.json --md …/triage.md   # edit, --from-md
npx stardust-lite media-fetch …/measure/content-1440.json --out …/media ; scripts/fetch-fonts.sh ; da-put aemcoder-adobe/sdt-si/blocks-first …/media/* --to drafts/media
npx stardust-lite author …/triage.json --content …/measure/content-1440.json --blocks migration/blocks.json --media …/media/manifest.json --media-host <host>/drafts/media --out …/doc/si-home.html --nav …/doc/nav.html --footer …/doc/footer.html --nav-path /drafts/nav --footer-path /drafts/footer --draft-new --site migration/site.json
python3 migration/cases/home/scripts/fix-doc.py migration/cases/home/doc/si-home.html   # nav.html / footer.html written by hand
npx stardust-lite spec-to-css …/measure --triage …/triage.json --doc …/doc/si-home.author.html --out blocks   # drafts kept in drafts/
npx stardust-lite css-lint . ; harness …/doc/si-home.html --serve proto --name si-home --port 8991 --fragments <host> --content …/measure/content-1440.json --site-repo .
npx stardust-lite gate --live https://www.si.edu/ --build http://localhost:8991/si-home.harness.html --out …/gate --round   # r1–r5
node migration/cases/home/scripts/origin-capture.mjs https://www.si.edu/ migration/cases/home/origin 360,1440,2560
npx stardust-lite gate … --out …/gate-o --origin …/origin --widths 360,1440,2560 --probes …/probes.txt
npx stardust-lite sync-poll <host> . blocks/… --trigger aemcoder-adobe/sdt-si/blocks-first ; gate … --build <host>/drafts/si-home --out …/gate-served --origin …/origin --widths 360,1440,2560 ; leak on both
```

## Files
REPORT.md, REGISTER.md, LINT.md (+ LINT.txt, css-lint.txt), TIMELINE.md, NOTES.md, TIMING.log (copy of the repo-root log), doc/ (the
three documents + the raw author draft), triage.md/json (+ triage.full.json), brief.txt, content-view*.txt, spec-view-*.txt, probes.txt,
leak-sels.txt + leak-proto.txt / leak-served.txt, measure/, gate*/ (tables, json; PNGs not committed), drafts/ (spec-to-css output),
scripts/ (fix-doc.py, fetch-fonts.sh, origin-capture.mjs, dom-peek.mjs, ys.mjs).
