2026-10-03T15:37:09Z | setup_start | eds-new-site skill steps 1-9 (preview only) + stardust-lite init
2026-10-03T15:39:17Z | setup_end | repo sdt-covermore, branch blocks-first pushed; setup 2.1 min
2026-10-03T15:39:17Z | reading METHOD + open BACKLOG + usage | 46 s to t0 of reading (METHOD 39 KB, BACKLOG 30 open rows, usage list)
2026-10-03T15:40:03Z | t0 first instrument (probe-load 360,1440,2560) | 21 s; no overlays, no redirect, 0 shadow roots, 1 fixed third-party layer (AudioEye), main 631 px at 1440
2026-10-03T15:41:01Z | measure-page run 1 (default sections) | 58 s; "main > .section" matched nothing, note pointed to structure-<W>.txt (depth 3: no section visible)
2026-10-03T15:48:01Z | measure-page run 2 (--sections "main .main-area > .region" --noise) | 58 s; 4 sections, noise floor 1440 0 %
2026-10-03T15:48:59Z | measure done | doc 1623 / 924 / 924; 15 imgs; 1 font file
2026-10-03T15:49:32Z | brief + triage draft | brief 1 screen; triage: 2 main sections, both "NEW columns? weak" (they are default content)
2026-10-03T15:56:26Z | triage table edited + from-md, author --draft-new | 2 default sections, 0 blocks; breadcrumb split in 2 p, Email h3 dropped, nav empty 3rd section, footer logo doubled
2026-10-03T15:56:56Z | triage written + lint clean (3 docs) | PASS 0 red; D4 yellow on the footer svg (pure vector, verified)
2026-10-03T15:59:51Z | docs + media put to DA (preview) | 5 × 201/200 on /drafts; branch code sync 200
2026-10-03T16:01:44Z | code written | styles.css, fonts.css (3 woff), header, footer; breakpoints probed 640..1024 (768 / 992)
2026-10-03T16:02:10Z | first harness prototype served | :8976, header+footer loaded, doc 917 (live 924), content check 12/12
2026-10-03T16:03:30Z | gate round 1 (3 widths) | 360 10.54 / 1440 6.27 / 2560 3.50 %, Δh 7; #2 Δh -14 (margins not contained); cap-probe wrapper 1170 vs 1140
2026-10-03T16:07:01Z | gate round 2 (3 widths + hover probes) — FIRST < 10 % at all three | 360 3.65 / 1440 1.95 / 2560 1.07 %, Δh 0, tables CLEAN; motion 3 parity 2 missing; cap-probe 1 row (Word span read as a module)
2026-10-03T16:07:20Z | click probe 360 (build) | panel [15,116,330,181] = live, ul #13b6ea 6×30, aria-expanded true; scrollHeight 1804 vs live 1803
2026-10-03T16:09:04Z | code pushed and synced | commit 48de0b3, sync-poll 8/8 in 16 s
2026-10-03T16:08:45Z | residuals named | shift-probe: paragraphs dy -1 (Kohinoor strut vs Arial), breadcrumb dx -4 (separator margins), AudioEye launcher; pair 24/24 located
2026-10-03T16:11:45Z | served gate done (3 widths + probes) | 360 3.65 / 1440 1.95 / 2560 1.07 %, Δh 0 — identical to the prototype; motion 3 parity 2 missing (named)
2026-10-03T16:12:10Z | served click 360 + leak diff | panel identical; leak prototype vs served IDENTICAL at 1440 and 360
