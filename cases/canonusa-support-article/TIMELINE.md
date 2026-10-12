2026-10-03T19:54:40Z | t0 — first instrument run on the page (probe-load 360,1440,2560 --chrome) | setup 19:52:06Z→19:53:54Z (2 min), reading METHOD/BACKLOG/usage 19:54→19:59
2026-10-03T19:55:34Z | probe-load: OneTrust consent (#onetrust-accept-btn-handler), UserWay launcher #usntA40Toggle (--hide), fixed header 104/160 px, no <footer> element (footer = 2 experiencefragments inside main), content root #to-main-content | 0 unassigned bands, 0 shadow hosts
2026-10-03T19:55:58Z | measure-page start | --noise --chrome, --main #to-main-content, --consent #onetrust-accept-btn-handler, --hide #usntA40Toggle
2026-10-03T19:57:02Z | measure done
2026-10-03T20:11:34Z | documents authored (page by hand-edit of the --draft-new draft, nav + footer typed from the content view), lint: page PASS 0/0, footer PASS after remodel, nav 1 yellow (SVG verified pure vector); media + nav + footer put to DA /drafts (preview)
2026-10-03T20:22:01Z | blocks written (header, footer, cards list/overlay, columns icons/bumper), styles.css tokens, icons; first harness run
2026-10-03T20:22:31Z | first harness prototype served http://localhost:8981/about-consumer-support.harness.html
2026-10-03T20:25:44Z | gate r1: 30.21 / 29.90 / 26.97 (360/1440/2560), cap-probe FAIL 2560 (4/4: live cap read as 1440 = the hero band's fluid bg); fix: cards.overlay grid selector
2026-10-03T20:38:41Z | gate r2 1440 8.46 (cards grid); r3/r4 360 22.3 (float selector: bare picture after the fold); r5 1440 after veil: see log
2026-10-03T20:43:02Z | gate r5 1440 3.52 (veil multiply, button-wrapper); r6 360 7.88 (inline card head) — first < 10 % at 360 and 1440; r7 = three widths
2026-10-03T20:45:18Z | gate r7 (three widths): 7.88 / 3.52 / 2.78 — FIRST gate < 10 % at all three widths; cap-probe FAIL 2560 (live shell 1440 vs build module 1224)
2026-10-03T20:59:19Z | gate r9 (three widths + probes):  360 : 4.04   1440 : 3.5   2560 : 4.11  
2026-10-03T21:02:16Z | document put to DA /drafts/about-consumer-support (+ nav, footer re-put), preview only
2026-10-03T21:12:16Z | code pushed (2nd commit), sync-poll started
2026-10-03T21:14:52Z | code pushed and synced (sync-poll: 6 files match after 22 s); prototype r10 1440 1.95 % + motion 10 parity; served gate start
2026-10-03T21:18:40Z | served gate done:  360 : 4.15   1440 : 1.99   2560 : 1.18  ; leak diff lines: 0
2026-10-03T21:21:02Z | final prototype gate r11 (three widths): 4.04 / 1.95 / 1.16 — tables CLEAN, cap-probe PASS; case files written
