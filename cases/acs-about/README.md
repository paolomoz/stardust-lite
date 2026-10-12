# Case acs-about — American Chemical Society, About

Source: https://www.acs.org/about.html (200, no redirect; Imperva WAF, intermittent challenge). Template `about`. Site repo
`aemcoder-adobe/sdt-acs`, branch `blocks-first`, stardust-lite `d58b9f8`.
Served draft: https://blocks-first--sdt-acs--aemcoder-adobe.aem.page/drafts/acs-about (nav `/drafts/nav`, footer `/drafts/footer`, media
`/drafts/media/`; preview only).

Tier (step 1): `--consent .osano-cm-accept-all` (Osano bar) and the Chrome tier (`overlays.chrome: true`, added to the profile by hand —
the tier line missed the 360 challenge page).

## Reproduce (from the site repo root; `./tl <label> -- …` timed every command into TIMING.log)
```
npx stardust-lite probe-load https://www.acs.org/about.html 360,1440,2560 --chrome --consent .osano-cm-accept-all --profile migration/site.json
npx stardust-lite measure-page https://www.acs.org/about.html --out migration/cases/about/measure --noise
npx stardust-lite brief migration/cases/about/measure
python3 migration/cases/about/scripts/reorder-roots.py migration/cases/about/measure/content-{360,1440,2560}.json   # footer band after main
npx stardust-lite triage …/measure/content-1440.json --blocks migration/blocks.json --spec …/measure/spec-1440.json --out …/triage.json --md …/triage.md   # edit, --from-md
npx stardust-lite media-fetch …/measure/content-1440.json --out …/media --from-page https://www.acs.org/about.html   # (retry until 28 / 28)
npx stardust-lite media-fetch …/measure/media-1440.json --fonts fonts --css styles/fonts.css
node migration/cases/about/scripts/fetch-fonts.mjs https://www.acs.org/about.html fonts Stolzl-Book.woff2=stolzl-450-normal.woff2 fa-regular-400.woff2=fontawesome-400-normal.woff2
npx stardust-lite da-put aemcoder-adobe/sdt-acs/blocks-first …/media/* --to drafts/media
npx stardust-lite author …/triage.json --content …/measure/content-1440.json --blocks migration/blocks.json --media …/media/manifest.json --media-host <host>/drafts/media --out …/doc/acs-about.html --nav …/doc/nav.html --footer …/doc/footer.html --draft-new
mv …/doc/acs-about.html …/acs-about.author.html; python3 …/scripts/icons.py …/measure/dom-1440.html; python3 …/scripts/build-doc.py
npx stardust-lite lint …/doc/ ; da-put aemcoder-adobe/sdt-acs/blocks-first …/doc/*.html --to drafts
npx stardust-lite spec-to-css …/measure --triage …/triage.json --doc …/doc/acs-about.html --out blocks   # drafts read, then deleted
npx stardust-lite css-lint . ; harness …/doc/acs-about.html --serve proto --name acs-about --port 8993 --fragments <host> --content …/measure/content-1440.json --site-repo .
npx stardust-lite gate --live https://www.acs.org/about.html --build http://localhost:8993/acs-about.harness.html --out …/gate --round --widths 360,1440,2560   # r1–r8
git push; npx stardust-lite sync-poll <host> . <files> --trigger aemcoder-adobe/sdt-acs/blocks-first
npx stardust-lite gate --live https://www.acs.org/about.html --build <host>/drafts/acs-about --out …/gate-served --widths 360,1440,2560
npx stardust-lite leak <proto | served> --sels …/leak-sels.txt ; gate … --probes …/probes.txt
```
Results: REPORT.md. Triage, deviations, motion: REGISTER.md. Lint: LINT.md. Friction: NOTES.md. Clock: TIMELINE.md, TIMING.log.
