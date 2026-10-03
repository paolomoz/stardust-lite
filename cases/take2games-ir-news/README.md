# take2games-ir-news — blocks-first template run (stardust-lite e4d7099)

| | |
|---|---|
| source | https://www.take2games.com/ir/news/break-free-borderlandsr4-now-available-worldwide (200, no redirect) |
| template | `ir-news` — Take-Two investor-relations press release (Business Wire body) |
| served (preview) | https://blocks-first--sdt-take2games--aemcoder-adobe.aem.page/drafts/ir-news-borderlands-4 |
| repo / branch | github.com/aemcoder-adobe/sdt-take2games · `blocks-first` · DA `/drafts/ir-news-borderlands-4`, `/drafts/nav`, `/drafts/footer`, `/drafts/media/` |
| widths | 360 · 1440 · 2560 (probe 2700: shell 2160 × 1.25) |
| overlays | consent `#onetrust-accept-btn-handler` (no reload); no dismiss, no locale, no cookie, headless Chromium OK |
| noise floor | 1440: 0 % (Δh 0), from `measure-page --noise` |
| prototype | **360 1.11 / 1440 1.76 / 2560 1.14** (Δh 0, tables CLEAN) |
| served | **360 1.6 / 1440 1.85 / 2560 1.2** (Δh 0, tables CLEAN, leak identical) |
| cap-probe | shell 2160 PASS, module 1 (full-bleed bar) PASS, module 2 = the floated figure read as a module (BACKLOG #162, advisory) |
| motion | header item hover (#000 → #075f49, text + chevron) paired; IR / article / footer hovers dead on live; live scroll-to-top `transition: bottom` not authored (register) |
| blocks | `ir-nav` (simple 1 × 1, nested lists = menus, sticky bar, `decorateBlockIcons`), `figure` (simple 2 × 1, variant `left`), `header` / `footer` (fragment decorates), section style `article` |
| clock | setup 1 m 50 s · t0 17:45:50Z · first prototype +17.4 min · first < 10 % at three widths +29.0 min · probes +33.4 · served done +44.6 min |
| lint | PASS 0 🔴 2 🟡 (D1 on `ir-nav` and `figure`, justified in LINT.md) |

Files: `REPORT.md` (numbers, clock, lessons), `REGISTER.md` (triage, deviations D1–D9, motion), `LINT.md`, `TIMELINE.md` (timestamps as recorded), `NOTES.md` (friction, ranked), `doc/` (the three authored documents), `triage.md` / `triage.json`, `probes.txt`, `leak-sels.txt`, `measure/` (specs, dumps, summary; PNGs not committed), `gate-*/` (tables, json; PNGs not committed), `capture-paragraphs-1440.json` (the article texts typed from the capture).

Reproduce: `measure-page <url> --out measure --widths 360,1440,2560 --sections 'main > *' --consent '#onetrust-accept-btn-handler' --noise` → `brief measure` → `triage measure/content-1440.json --blocks ../../blocks.json --out triage.json --md triage.md --spec measure/spec-1440.json --root div` → edit `triage.md`, `triage --from-md` → `author triage.json --content measure/content-1440.json,measure/clicks-irnav-1440.json … --draft-new` (then the hand edits in REGISTER D7) → `harness doc/ir-news-borderlands-4.html --serve proto --name ir-news-borderlands-4 --port 8979 --fragments <branch host> --content … --site-repo <repo>` → `gate --live <url> --build http://localhost:8979/ir-news-borderlands-4.harness.html --out gate-N --widths 360,1440,2560 --consent … --origin measure --triage triage.json --probes probes.txt` → `da-put`, `sync-poll --trigger`, the same gate against the branch host, `leak` on both.
