# wellsfargo / about-article — https://www.wellsfargo.com/about/inclusion/

Template `about-article` (Wells Fargo "About" inner page): masthead + fat nav, breadcrumb, page title, marquee hero, three elevated-card
sections (2-up with pictures and outlined buttons, 3-up and 2-up text cards with purple text links), footnote, link footer. Final URL is the
one requested (no redirect; 200). Tier line: no flag needed (headless Chromium, OneTrust consent accepted by the first look; its floating
button is a fixed layer seen only after consent → profile `overlays.hide: #onetrust-consent-sdk`).

Run (site repo root, stardust-lite a7cebff installed from a local tarball — the sha was not on the remote):
```
npx stardust-lite probe-load <url> 360,1440,2560 --profile migration/site.json
npx stardust-lite measure-page <url> --out migration/cases/about-article/measure --header 'header.ps-masthead,div.ps-fat-nav-outer' --footer footer.ps-responsive-footer --noise
npx stardust-lite brief …/measure ; triage …/measure/content-1440.json --blocks migration/blocks.json --spec …/measure/spec-1440.json --out …/triage.json --md …/triage.md ; triage --from-md
npx stardust-lite media-fetch …/content-1440.json --out …/media ; media-fetch …/media-1440.json --fonts fonts ; da-put aemcoder-adobe/sdt-wellsfargo/blocks-first …/media/* --to drafts/media
npx stardust-lite author …/triage.json --content …/content-1440.json --blocks migration/blocks.json --media …/media/manifest.json --media-host <host>/drafts/media --out …/doc/inclusion.html --nav …/doc/nav.html --footer …/doc/footer.html --nav-path /drafts/nav --footer-path /drafts/footer --site migration/site.json --draft-new
npx stardust-lite spec-to-css …/measure --triage …/triage.json --doc …/doc/inclusion.html --out blocks ; css-lint .
npx stardust-lite harness …/doc/inclusion.html --serve proto --name inclusion --port 8992 --fragments <host> --content …/content-1440.json --site-repo .
npx stardust-lite gate --live <url> --build http://localhost:8992/inclusion.harness.html --out …/gate --round   (×6) ; … --widths 360,1440,2560 --probes …/probes.txt --recapture-origin
git push ; sync-poll <host> . blocks/… --trigger aemcoder-adobe/sdt-wellsfargo/blocks-first ; gate … --build <host>/drafts/inclusion --out …/gate-served --origin …/gate --widths 360,1440,2560 --probes …/probes.txt ; leak on both
```
Host: https://blocks-first--sdt-wellsfargo--aemcoder-adobe.aem.page — served page `/drafts/inclusion`, nav `/drafts/nav`, footer `/drafts/footer`, media `/drafts/media/`.

Files: `measure/` (specs, content, media lists, summary; captures and DOM not committed), `brief.txt`, `triage.md|json` (+ `triage-auto.md` as `triage` wrote it),
`doc/` (the three documents), `drafts/` (spec-to-css output as generated), `gate/`, `gate-motion/`, `gate-served/` (tables, verdicts, motion; PNG not committed),
`probes.txt`, `leak-sels.txt`, `leak-proto.txt`, `leak-served.txt`, `leak-diff.txt` (empty), `REPORT.md`, `REGISTER.md`, `LINT.md`, `TIMELINE.md`, `NOTES.md`.
