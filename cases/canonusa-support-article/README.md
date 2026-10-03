# canonusa — support-article (loop r10)

| | |
|---|---|
| page | https://www.usa.canon.com/support/about-consumer-support (200 in Google Chrome, 403 "Access Denied" in headless Chromium → `--chrome` / `STARDUST_CHROME=1` on every instrument) |
| template | `support-article` (Canon U.S.A. "About consumer support": hero band, icon tiles + service-center list, three overlay cards; Canon chrome: tab bar + search + nav, promo bar, bumper gradient, black footer) |
| site repo | https://github.com/aemcoder-adobe/sdt-canonusa branch `blocks-first` — served https://blocks-first--sdt-canonusa--aemcoder-adobe.aem.page/drafts/about-consumer-support (preview only) |
| documents | DA `/drafts/about-consumer-support`, `/drafts/nav`, `/drafts/footer`, media `/drafts/media/` |
| overlays | `--consent '#onetrust-accept-btn-handler'` `--hide '#usntA40Toggle'` `--main '#to-main-content'` `--chrome`; sections selector guessed by measure-page (`… > div.column-control`, 3 sections) |
| noise floor | 1440: 0 % (Δh 0) — `measure --noise` |
| prototype | 4.04 / 1.95 / 1.16 (r11, one run; r9 4.04 / 3.50 / 4.11 with a transient card-band rendition) |
| served | 4.15 / 1.99 / 1.18 — tables CLEAN, cap-probe PASS, motion 10 parity, leak table identical |
| blocks | `header`, `footer`, `cards` (`list`, `overlay`), `columns` (`icons`, `bumper`) |
| clock | t0 19:54:40Z → first prototype 28 min → first < 10 % at three widths 51 min → probes 65 min → served gate 84 min (TIMELINE.md) |

Files: `REPORT.md` (what happened, rounds, lessons), `REGISTER.md` (triage, deviations, motion), `LINT.md`, `TIMELINE.md`, `NOTES.md` (friction, ranked), `doc/` (the three documents), `triage.md/json`, `brief.txt`, `probes.txt`, `leak-*.txt`, `measure/` and `gate-*/` tables (captures and media not committed), `scripts/asset-capture.mjs` (bytes a WAF refuses, from the page's own responses), `scripts/attr-dump.mjs` (attributes of lazy/hidden elements).
