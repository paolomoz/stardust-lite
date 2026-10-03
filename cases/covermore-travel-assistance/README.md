# covermore-travel-assistance — case (v2 blocks-first, stardust-lite 9f925b1)

| page | template | t0 → first proto | → < 10 % ×3 | → probes | → served | 360 | 1440 | 2560 | served 360 / 1440 / 2560 | noise | rounds (table / gate) | blocks |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| https://www.covermore.com/travel-assistance | travel-assistance (article in a card over a body photo) | 22.1 min | 27.0 min | 27.3 min | 31.7 min | 3.65 % | 1.95 % | 1.07 % | 3.65 / 1.95 / 1.07 % | 0 % | 1 / 2 | header, footer (chrome); main = default content ×2 |

Served (preview only): https://blocks-first--sdt-covermore--aemcoder-adobe.aem.page/drafts/travel-assistance — setup (repo, DA, code sync, init) 2.1 min before t0.

Files: `REPORT.md` (numbers, clock, lessons) · `REGISTER.md` (triage, deviations D1–D12, motion) · `LINT.md` · `TIMELINE.md` (UTC milestones) ·
`NOTES.md` (friction ranked by minutes) · `doc/` (the three authored documents) · `triage.md` / `triage.json` · `probes.txt`, `leak-sels.txt`,
`leak-*.txt` · `measure/` (specs, dumps, deep probes, summary; captures not committed) · `gate-r1/`, `gate-r2/`, `gate-served/` (gate.json,
pixel-*.json, cap.json, motion-*; PNG not committed) · `motion/` (live / build hover and click readings) · `scripts/font-dump.mjs` (data-URI
@font-face bytes → /fonts).

Reproduce: `measure-page <url> --out measure --sections "main .main-area > .region" --noise` · `brief measure` · `triage … --spec measure/spec-1440.json`
(edit rows 1–2 to default content, styles `breadcrumb` / `article`) → `--from-md` · `author triage.json --content measure/content-1440.json --draft-new
--media media/manifest.json --media-host <branch>/drafts/media --nav-path /drafts/nav --footer-path /drafts/footer` (then the four edits in LINT.md) ·
`da-put` media + docs to `/drafts` · `harness doc/travel-assistance.html --serve proto --name travel-assistance --port 8976 --fragments <branch>
--content measure/content-1440.json --site-repo <repo>` · `gate --live <url> --build http://localhost:8976/travel-assistance.harness.html --origin
measure --widths 360,1440,2560 --triage triage.json --probes probes.txt` · `click-state <build> 360 --click "header .nav-hamburger button" --panel
"header .nav-sections"` · served gate with the same flags against the branch URL · `leak` both with `leak-sels.txt`.
