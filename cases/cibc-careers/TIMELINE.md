2026-10-03T10:31:14Z | t0: first instrument run on the page (probe-load 360,1440,2560) | setup_start 2026-10-03T10:27:44Z setup_end 2026-10-03T10:30:20Z (2.6 min); reading METHOD+BACKLOG+usage 10:30:20→2026-10-03T10:31:14Z
2026-10-03T10:33:58Z | measure-page start | widths 360,1440,2560 --noise, consent #onetrust-accept-btn-handler, sections main > div
2026-10-03T10:34:30Z | measure done | 3 widths in ~40 s wall (12–13 s per width), doc 7449/5211/5211, 14 sections, items 157/292/292, noise floor 1440 0.00 % Δh 0; unassigned: div#mobile-header (360), div.mm-container 62px (1440/2560), aside.terms-wrapper 72px
2026-10-03T10:44:38Z | documents authored (hand) + lint run | careers/nav/footer, see lint.txt
2026-10-03T10:55:45Z | harness r0 start | first prototype build
2026-10-03T10:56:19Z | first harness prototype served | http://localhost:8972/careers.harness.html, doc 5259 (live 5211), 13 blocks loaded, lint 0 red; t0+25 min
2026-10-03T11:01:37Z | gate r0 | 360 16.02 % Δh64 | 1440 9.93 % Δh-48 | 2560 2.27 % Δh-48 | cap-probe PASS 13/13; hero picture letterboxed (62 % band), p padding, footer inset
2026-10-03T11:06:25Z | gate r1 (1440 only) | 1440 3.39 % Δh-11 | hero picture fixed; r2 edits: tone cells, header bar, baselines, footer 1140, 360 rhythms
2026-10-03T11:07:15Z | gate r2 | 360 15.44 % Δh22 | 1440 2.39 % Δh+1 | cap-probe PASS 13/13; FIRST gate < 10 % at 1440 (360 pending)
2026-10-03T11:12:23Z | gate r3 (360+1440) | 360 14.69 % Δh86 | 1440 2.39 % Δh+1 | r4: mobile constants (callout p 6/14, intro p 4, cta top 0 at 360, footer gaps)
2026-10-03T11:15:47Z | gate r4 (3 widths + probes) | 360 15.18 % Δh101 | 1440 2.39 % Δh+1 | 2560 1.51 % Δh+1 | cap-probe PASS; motion 0 parity 10 missing; cause at 360: mobile section bar not sticky (parent box)
2026-10-03T11:21:32Z | gate r5 (3 widths + probes) | 360 15.02 % Δh101 | 1440 2.35 % Δh-10 | 2560 1.49 % Δh-10 | motion 1 parity 9 missing 2 advisory; scroll-probe 360: bar pins fixed, content −50 (live capture shifted from chunk 2); hover borders → text-decoration
2026-10-03T11:23:30Z | gate r6 — FIRST < 10 % at all three widths | 360 5.89 % Δh101 | 1440 2.39 % Δh+1 | 2560 1.51 % Δh+1 | cap-probe PASS 13/13; motion 2 parity 8 missing (live class toggles) 7 advisory; t0+52 min
2026-10-03T11:25:03Z | gate r7 (360, footer brand row) | 360 5.95 % Δh54 (live below-footer band) | probes pass: hover-diff parity 5/5 (section-nav, button invert, title link, marketing link, secondary fill), click-state tabs panel 2 + terms open on both; cap-probe PASS — stop rule applied after 7 gate rounds
2026-10-03T11:26:33Z | code pushed | 8b47539 blocks-first
2026-10-03T11:26:39Z | document put to DA + previewed | /drafts/careers (nav, footer already previewed 10:55 / 11:02)
2026-10-03T11:27:53Z | code synced on branch host | sync-poll: 4 files match the repo after 11 s
2026-10-03T11:30:16Z | served gate done | 360 5.83 % Δh53 | 1440 2.39 % Δh+1 | 2560 1.51 % Δh+1 | cap-probe PASS 13/13; motion 2 parity 8 missing 7 advisory — same as the prototype; sync-poll 11 s; t0+59 min
2026-10-03T11:32:56Z | leak identical (0 lines), site profile + block inventory written, case documents written
2026-10-03T11:33:42Z | case committed + pushed, copied to stardust-lite/cases/cibc-careers (not committed there)
