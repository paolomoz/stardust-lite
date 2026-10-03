2026-10-03T11:41:58Z | setup (eds-new-site + stardust-lite init + branch) | setup_start 2026-10-03T11:39:18Z setup_end 2026-10-03T11:41:10Z (1.9 min)
2026-10-03T11:41:58Z | t0: first instrument run (probe-load 360,1440,2560)
2026-10-03T11:43:56Z | measure-page start (3 widths + --noise)
2026-10-03T11:44:27Z | measure-page done
2026-10-03T11:50:29Z | triage table written (triage.md/json: hero+cards(roles), default, cards(insights); nav/footer chrome) | novelty 80 %, 5 sections
2026-10-03T11:59:43Z | document authored (author --draft-new + edits: hero block, roles 2-col, insights, nav tools, footer icons) + lint
2026-10-03T12:02:25Z | nav + footer put to DA /drafts and previewed
2026-10-03T12:02:28Z | (harness run 1: port 8973 held by a stale server, then serve started with the wrong --site → 404s; not a prototype)
2026-10-03T12:03:20Z | first harness prototype served http://localhost:8973/home.harness.html (5 blocks loaded) | t0 + 21.4 min
2026-10-03T12:04:37Z | gate r0 (1440 only) 70.06 % — hero mobile picture shown at desktop (specificity); table rounds r1–r4 follow (sections + pair, no gate)
2026-10-03T12:10:41Z | gate r1 start (3 widths + probes; CSS rounds r1–r4 gated by sections/pair only)
2026-10-03T12:12:01Z | FIRST gate < 10 % at all three widths; cap-probe PASS; motion 1 parity 0 missing (probes pass) | t0 + 30.1 min | gate r1:  360   2.23 %  1440   4.54 %  2560   1.36 % 
2026-10-03T12:12:32Z | code pushed to blocks-first (ad03090)
2026-10-03T12:13:40Z | gate r2 start (3 widths + probes); da-put doc/home.html → /drafts/home upload 201 preview 200 (same minute)
2026-10-03T12:15:01Z | gate r2 done:  360   1.19 %  1440   4.48 %  2560   1.33 % 
2026-10-03T12:15:43Z | gate r3 start (3 widths + probes)
2026-10-03T12:15:53Z | code synced on blocks-first (sync-poll: sync-poll: 1 file match the repo after 10 s)
2026-10-03T12:17:03Z | gate r3 done (prototype final):  360   1.19 %  1440   2.29 %  2560   1.33 % 
2026-10-03T12:17:22Z | served gate start (3 widths + probes, origin = prototype gate's)
2026-10-03T12:19:06Z | served gate done (t0 + 37.1 min; leak identical; hover-diff + click-state on served):  360   1.2 %  1440   2.29 %  2560   1.34 % 
