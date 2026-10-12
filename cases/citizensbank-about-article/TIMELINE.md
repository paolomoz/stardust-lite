# Timeline (UTC)

2026-10-03T22:18:22Z | setup_start | eds-new-site + stardust-lite install
2026-10-03T22:25:37Z | setup_end | 7m15s (repo, fstab, code sync 204 at once, seed+preview, npm i from local git archive since a7cebff is not on GitHub, init, branch pushed)
2026-10-03T22:26:30Z | reads done | CHECKLIST, BACKLOG open rows, list --usage read between setup_end and t0 (the line was first written with an estimated stamp; corrected to the command window)
2026-10-03T22:26:35Z | t0 | probe-load 360,1440,2560 --profile
2026-10-03T22:28:29Z | t0 note | probe-load headless 403 -> rerun --chrome, 200, no redirect; profile written
2026-10-03T22:32:56Z | re-measure | default --sections matched nothing; guess = 3 ls-rows (header folded into row 1, 2442 blob); 4 probe-structure calls to find module nodes (~3 min)
2026-10-03T22:34:26Z | brief read | 10 sections: header, hero 501, title 102, text 64, featureGrid 582, featureSingle 461, title 102, featureGrid cards 566, disclosure 184 (after footer in DOM), footer 382
2026-10-03T22:36:12Z | triage edited | 4 blocks: columns(hero), cards(flat), columns, cards; styles hero/grey-title/grey-text/grey/feature/disclosure
2026-10-03T22:38:02Z | triage+lint clean | author exit 2 (D15 script text, D1 hero 1x1); hand-fixed hero cells, moved disclosure to footer doc, rewrote nav (author's nav had only the utility row); lint PASS
2026-10-03T22:52:34Z | CSS written | drafts merged into styles.css/columns/cards; header.css footer.css written from spec rows; icons split from sprites
2026-10-03T22:53:15Z | harness start | css-lint: 1 finding (cap rule specificity) fixed; port 8983 stale (python 33785) -> 8993
2026-10-03T22:55:00Z | first prototype served | harness 8993, 6 blocks loaded, doc 2820 (live 3143), 1 console 404
2026-10-03T23:06:17Z | gate round 1 | 1440 3.9 % (Δ doc -323: footer paddings lost to a 0,1,2 generic rule; login cell inflated; gate split 2 live sections without --triage)
2026-10-03T23:08:45Z | gate round 2 | 1440 3.51 % Δdoc 26, tables CLEAN, cap-probe PASS (--triage passed; live split still automatic: body (no main) did not resolve)
2026-10-03T23:11:09Z | gate 3 widths #1 | 360 30.72 / 1440 2.42 / 2560 1.36; cap-probe PASS; motion 4 probes dead on live (not required); 360 hero -312 flat -14 cards +26 footer +84
2026-10-03T23:16:22Z | gate 3 widths #2 | 360 14.82 / 1440 2.42 / 2560 1.36; tables CLEAN at 3 widths; cap-probe PASS; 360 residue = luminance in the picture bands (live broken images)
2026-10-03T23:18:22Z | code pushed | sync-poll --trigger start
2026-10-03T23:18:56Z | code synced | 8 files match after 12 s (trigger 202); served gate start
2026-10-03T23:22:41Z | served gate done | 360 14.98 / 1440 2.61 / 2560 1.47 (proto 14.82 / 2.42 / 1.36); cap-probe PASS
2026-10-03T23:25:29Z | leak + close | leak table identical (20 selectors, 0 differing lines); site-profile init, block-inventory scan; case docs written
2026-10-03T23:26:49Z | motion round | motion-compare: 2 buttons change on live hover (bg + inset shadow, 100 ms) MISSING on build → hover rules from motion-live.json
2026-10-03T23:30:10Z | served motion gate | 1440 (chrome masked) proto 2.69 / served 2.92; motion 3 parity 1 missing (transform event, no visible change) 1 advisory — both sides
2026-10-03T23:31:17Z | close | NOTES written; harness server stopped
