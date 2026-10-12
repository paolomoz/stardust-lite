# mfs-home — case (template `home`, https://www.mfs.com/corporate/en/home.html)

| | 360 | 1440 | 2560 | cap-probe | motion | lint | served | leak |
|---|---|---|---|---|---|---|---|---|
| prototype (gate r3) | 1.19 % | 2.29 % | 1.33 % | PASS | parity | PASS 0 🔴 1 🟡 | 1.20 / 2.29 / 1.34 % | identical |

Noise floor 0 % (1440). t0 → first prototype 21 min, → first three-width gate < 10 % 30 min, → served gate 37 min (TIMELINE.md).
Setup (repo, Code Sync, DA seed, stardust-lite init, branch) 1.9 min before t0.

- `REPORT.md` — numbers, rounds, lessons. `REGISTER.md` — triage table, deviations, motion. `LINT.md` — David's Model verdict.
- `TIMELINE.md` — UTC milestones; `NOTES.md` — friction ranked by minutes.
- `doc/` — the authored documents (home, nav, footer). `triage.md` / `triage.json`, `brief.txt`, `probes.txt`, `leak-sels.txt`.
- `measure/` — specs, dumps, structure, deep probes, section tables (captures and DOM not committed); `gate*/` — gate.json, pixel/cap/motion JSON
  (PNG not committed); `media/`, `proto/` not committed.
- Served: https://blocks-first--sdt-mfs--aemcoder-adobe.aem.page/drafts/home (preview). Prototype: `serve proto --port 8973 --site <repo>`,
  then `harness doc/home.html --serve proto --name home --port 8973 --fragments <branch host> --content measure/content-1440.json`.
