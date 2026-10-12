# TIMELINE — bny leadership

setup_start 2026-10-03T18:46:49Z | setup_end 2026-10-03T18:48:20Z (repo, fstab, code sync 20 s, seed + preview, stardust-lite install, init --foundation, branch pushed)

| UTC | milestone | numbers |
|---|---|---|
| 2026-10-03T18:48:55Z | t0 — probe-load 360,1440,2560 | status 200, no redirect, h 7031/3507/3507, OneTrust consent, header unassigned band 76/88 px fixed, 0 shadow hosts |
| 2026-10-03T18:50:51Z | measure done (measure-page --noise, 38 s) | 3 widths, 2 sections guessed, noise 0 % at 1440 |
| 2026-10-03T18:58:14Z | triage table written + lint clean, document authored (author --draft-new → doc edit to sections-as-panels) | 32 cards, 0 🔴 0 🟡 |
| 2026-10-03T19:08:45Z | first harness prototype served (:8980) | 88/88 texts in capture; tabs autoblock fixed by 19:10:00 |
| 2026-10-03T19:11:19Z | gate r1 (3 widths) | 23.64 / 31.85 / 22.69 — tabs built after the cards, fragments not rendering |
| 2026-10-03T19:18:49Z | gate r2 (1440) | 1.21 (doc split fix, fragments render) |
| 2026-10-03T19:21:40Z | gate r3 (1440) | 1.77 (fixed header repeated per chunk — live hides it on scroll) |
| 2026-10-03T19:26:13Z | gate r4 (1440) | 0.62 (header hides at scrollY > 0) |
| 2026-10-03T19:27:19Z | gate r5 (3 widths) | 20.24 / 0.62 / 5.16 (card spacer −16 at 360, hero band uncapped at 2560) |
| 2026-10-03T19:32:05Z | gate r6 (3 widths) — FIRST < 10 % at all three | 9.93 / 0.62 / 0.35 |
| 2026-10-03T19:35:50Z | gate r7 (3 widths) | 2.62 / 0.19 / 0.10 (names in the fallback serif as live, quick-links rhythm) |
| 2026-10-03T19:36:32Z | gate r8 (2560) | 0.10 (footer band capped at the shell) |
| 2026-10-03T19:40:37Z | gate r9 (3 widths) + probes pass (cap-probe PASS, hover-diff 4/4 rows, click-state tab + dropdown, content 92/92) | 2.62 / 0.19 / 0.10 |
| 2026-10-03T19:42:22Z | code pushed (8beb68a) — synced in 2 s (sync-poll 19:42:47) | 11 files match |
| 2026-10-03T19:42:23Z | document put to DA /drafts/leadership, preview 200 | nav + footer put 19:07 |
| 2026-10-03T19:44:53Z | served gate done (3 widths, origin = gate-r9) | 2.62 / 0.23 / 0.13; leak 0 differing lines; hover + click parity identical |

Minutes from t0 (18:48:55): measure 2.0 · lint-clean doc 9.3 · first prototype 19.8 · first < 10 % at three widths 43.2 · probes pass 51.7 · served gate 56.0. Setup 1.5 min.
