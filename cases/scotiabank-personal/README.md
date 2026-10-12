# case scotiabank-personal — template `personal` (sdt-scotiabank)

- **Source**: https://www.scotiabank.com/ca/en/personal.html (AEM Sites; `/` geo-redirects to `/global/en/global-site.html`, this path is the page).
- **Site repo**: https://github.com/aemcoder-adobe/sdt-scotiabank, branch `blocks-first` (main is the boilerplate + fstab).
- **Served (preview only, never published)**: https://blocks-first--sdt-scotiabank--aemcoder-adobe.aem.page/drafts/personal
  (nav `/drafts/nav`, footer `/drafts/footer`, media `/drafts/media/*`; DA `aemcoder-adobe/sdt-scotiabank`).
- **Method**: stardust-lite `f2903b1` (`node_modules/stardust-lite/METHOD.md`, steps 1–8); prototype served by `scripts/serve.mjs` on :8971.

## Numbers

| | 360 | 1440 | 2560 (probe) |
|---|---|---|---|
| noise floor (two live captures) | 0.00 % | 0.00 % | 0.00 % |
| prototype (round 9/11) | 2.63 % · Δh 7 | 2.28 % · Δh 2 | 1.77 % · Δh 2 |
| served (`/drafts/personal`) | 2.84 % · Δh 7 | 2.35 % · Δh 2 | 1.80 % · Δh 2 |

cap-probe PASS (module caps 1500 and 1140, shell fluid, probe 2560); motion 11 parity (REGISTER §3); leak table identical at 360 and
1440 (0 differing lines); content check 109/109 authored texts in the dumps; lint PASS 0 🔴 1 🟡. Rounds: 1 table round (the triage
needed no change after the draft), 11 gate rounds (1–3 base width, 4 three widths — first < 10 %, 5–6 at 360, 7–9 three widths +
probes, 10–11 at 360 for the served/pipeline spacer line).

## What is committed here

`README.md` (this), `REPORT.md` (lessons), `REGISTER.md` (triage, deviations, motion), `LINT.md`, `TIMELINE.md` (UTC milestones),
`NOTES.md` (friction, ranked), `triage.md` / `triage-draft.md` / `triage.json`, `doc/` (the three authored documents),
`scripts/author-personal.mjs` (the document generator from the dumps) and `scripts/font-glyphs-to-svg.py` (icon-font glyphs → `/icons`),
`probes.txt`, `leak-sels.txt`, the tables and logs (`measure/*.txt|json`, `gate/*.json|txt`, `gate-served/*.json|txt`,
`*-r*.log`, `leak-*.txt`, `first-look.json`, `noise/stitch-*.log`). Not committed: PNG captures, `media/`, `proto/`, `crops/`,
`measure/dom-*.html`.

## Regenerate

```sh
npm i && npx playwright install chromium
# step 1
npx stardust-lite measure-page https://www.scotiabank.com/ca/en/personal.html --out migration/cases/personal/measure \
  --widths 360,1440,2560 --sections "main > div" --header "header#header" --footer "footer#footer" --consent "#onetrust-accept-btn-handler"
npx stardust-lite content-dump <url> 1440 --roots '.rec-tab-panel' --hidden '.rec-tab-panel' --consent '#onetrust-accept-btn-handler' --out measure/hidden-tabs-1440.json
npx stardust-lite content-dump <url> 1440 --roots '.mm--container' --hidden '.mm--container' --consent '#onetrust-accept-btn-handler' --out measure/megamenu-1440.json
npx stardust-lite media-fetch measure/content-*.json measure/clicks-tabs-1440.json --out media   # then the 4 renames in scripts/author-personal.mjs's manifest
# steps 2–3
node migration/cases/personal/scripts/author-personal.mjs      # from the case dir → doc/*.html
npx stardust-lite lint migration/cases/personal/doc/
npx stardust-lite da-put aemcoder-adobe/sdt-scotiabank/blocks-first migration/cases/personal/doc/*.html --to /drafts
# steps 5–6
npx stardust-lite serve migration/cases/personal/proto --port 8971 --site .
npx stardust-lite harness migration/cases/personal/doc/personal.html --serve migration/cases/personal/proto --name personal --port 8971 \
  --fragments https://blocks-first--sdt-scotiabank--aemcoder-adobe.aem.page --content measure/content-1440.json,measure/hidden-tabs-1440.json,measure/megamenu-1440.json
npx stardust-lite gate --live <url> --build http://localhost:8971/personal.harness.html --out migration/cases/personal/gate \
  --widths 360,1440,2560 --consent '#onetrust-accept-btn-handler' --origin migration/cases/personal/measure --probes migration/cases/personal/probes.txt
# step 7
npx stardust-lite gate --live <url> --build https://blocks-first--sdt-scotiabank--aemcoder-adobe.aem.page/drafts/personal --out migration/cases/personal/gate-served --origin migration/cases/personal/gate …
npx stardust-lite leak <url> --sels migration/cases/personal/leak-sels.txt --width 1440
```

`npm run lint` reports style findings only (max-len, single-line declarations) in the block CSS/JS — left as written for readability of the measured values.
