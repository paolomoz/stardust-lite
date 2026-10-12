# Timeline — scotiabank personal (UTC)

2026-10-03T08:51:54Z | setup_start | eds-new-site skill steps 1–9
2026-10-03T08:53:50Z | setup_end | repo + DA + Code Sync + stardust-lite init --foundation + blocks-first pushed (≈2 min)
2026-10-03T08:55:30Z | t0 | probe-load first look at 360,1440,2560
2026-10-03T08:56:44Z | measure-page start | 360,1440,2560 --sections 'main > div' --consent #onetrust-accept-btn-handler
2026-10-03T08:57:02Z | measure-page end | exit exit 0
2026-10-03T09:10:33Z | measure done | 3 widths, noise floor 0.00/0.00/0.00 %, cap module 1500/1140, probe 2560, 6 hidden tab panels dumped, 49 media, 6 fonts
2026-10-03T09:21:51Z | triage table written | triage.md: hero 4×1, cards.compass 3×3, tabs 6×3 + cards.marketing 6×4, nav/footer fragments
2026-10-03T09:22:55Z | media da-put start | 50 files → /drafts/media
2026-10-03T09:24:32Z | media da-put end | 50 previewed, exit 0
2026-10-03T09:24:53Z | document authored | doc/personal.html + nav.html + footer.html by scripts/author-personal.mjs
2026-10-03T09:25:54Z | lint clean + documents previewed | lint PASS 0 red 1 yellow; da-put /drafts/personal,nav,footer
2026-10-03T09:34:49Z | harness start | first prototype, port 8971, --fragments branch host
2026-10-03T09:36:53Z | first harness prototype served | http://localhost:8971/personal.harness.html
2026-10-03T09:37:09Z | gate round 1 start | widths 1440 (base) against measure/ origin
2026-10-03T09:41:18Z | gate round 2 start | 1440
2026-10-03T09:45:25Z | gate round 3 start | 1440
2026-10-03T09:48:30Z | gate round 4 start | 360,1440,2560
2026-10-03T09:49:53Z | FIRST gate < 10 % at three widths | 360 5.96 / 1440 2.28 / 2560 1.77 %, Δh 23/2/2, cap-probe PASS (round 4)
2026-10-03T09:51:19Z | gate round 5 start | 360 (mobile hero rendition)
2026-10-03T09:52:56Z | gate round 6 start | 360
2026-10-03T09:54:41Z | gate round 7 start | 360,1440,2560 + probes (prototype final)
2026-10-03T09:57:43Z | gate round 8 start | 360,1440,2560 + probes (after motion rules)
2026-10-03T10:00:16Z | code pushed | 6f2ceff blocks-first
2026-10-03T10:00:31Z | sync-poll start | 6f2ceff
2026-10-03T10:00:32Z | sync-poll end | sync-poll: 7 files match the repo after 1 s exit 0 
2026-10-03T10:00:50Z | gate round 9 start | 360,1440,2560 + probes (prototype final)
2026-10-03T10:02:39Z | gate round 9 end |  360 : 2.63 %  1440 : 2.28 %  2560 : 1.77 %  motion summary: 11 parity, 2 missing, 0 extra, 0 advisory (1
2026-10-03T10:03:04Z | served gate start | https://blocks-first--sdt-scotiabank--aemcoder-adobe.aem.page/drafts/personal, origin = prototype gate dir
2026-10-03T10:05:07Z | served gate done |  360 : 7.97 %  1440 : 2.35 %  2560 : 1.8 %  cap-probe: overlay dismissed via #onetru
2026-10-03T10:08:09Z | document put to DA (final) | /drafts/personal (nav, footer unchanged since 09:3x)
2026-10-03T10:08:12Z | gate round 10 start | 360 prototype + 360 served (spacer line removed)
2026-10-03T10:10:42Z | document put to DA (final) | /drafts/personal with the nbsp line
2026-10-03T10:10:44Z | gate round 11 start | 360 prototype + served
2026-10-03T10:12:54Z | probes pass | cap-probe PASS (6 rows; 5-row live split flakes FAIL, BACKLOG #162), motion 11 parity / 2 class-name rows + 1 timing row registered, content check 109/109 texts
2026-10-03T10:12:54Z | served gate done (final) | served 360 2.84 / 1440 2.35 / 2560 1.80 % vs prototype 2.63 / 2.28 / 1.77; Δh 7/2/2; leak 0 lines at 360 and 1440
2026-10-03T10:18:20Z | case written + committed | README, REPORT, REGISTER, LINT, TIMELINE, NOTES, site.json, blocks.json; copied to stardust-lite/cases/scotiabank-personal
