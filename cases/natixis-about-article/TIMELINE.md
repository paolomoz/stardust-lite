2026-10-03T12:30:38Z | t0: first instrument run (measure-page default sections --noise) | url=https://www.im.natixis.com/en-intl/about/diversity-equity-and-inclusion (no redirect, 200)
2026-10-03T12:33:01Z | measure done (2 measure-page runs: default sections 12:30:30→12:31:18, --sections 12:32:22→12:33:01; probe-structure depth 7 in between) | 15 sections, doc 8156/13711, noise 1440 0 %, Montserrat FONT LOAD FAILED in capture
2026-10-03T12:41:53Z | measurement reading done (brief, content-view, hidden dump, deep-probe ×2, scroll-probe, hover-diff, 360 spec, 9 crops viewed) | 15 sections understood; fonts 6 static ttf; media 27 files
2026-10-03T12:48:15Z | triage table written + lint clean (0 red, 3 yellow D1) + document authored (author --draft-new 12:44:52 → fix-doc case script 12:48:15) | 13 sections, 10 block sections, nav 4 sections, footer 3 sections
2026-10-03T12:49:30Z | documents + media put to DA /drafts (preview only), model approvable before any block | 27 media, 3 docs, 201/200
2026-10-03T13:00:25Z | code written (styles, fonts, 8 blocks, icons, scripts.js) | 12:55 → 13:00
2026-10-03T13:02:05Z | first harness prototype served http://localhost:8974/diversity-equity-and-inclusion.harness.html | doc 8171 vs live 8156; 12 blocks loaded; content check 109 texts, 9 logo labels not in capture (visually hidden)
2026-10-03T13:03:52Z | gate round 1 (3 widths) | 360 10.92 % Δh-79 · 1440 7.57 % Δh-15 · 2560 4.82 % Δh-15; cap-probe PASS 2560
2026-10-03T13:12:04Z | round 2 tables (after hero margin, sup, accordion gap, footer padding, facts padding fixes) | 360: all rows Δh 0, doc Δ-1; 1440/2560: #12 awards Δh-16 only
2026-10-03T13:13:47Z | gate round 3 (3 widths) — FIRST gate < 10 % at all three widths (and < 2 %) | 360 1.41 % Δh+1 · 1440 0.16 % Δh0 · 2560 0.09 % Δh0; cap-probe PASS 2560; noise floor 1440 0 %
2026-10-03T13:22:56Z | served gate (3 widths, --origin gate, probes) | 360 1.08 % Δh0 · 1440 0.17 % Δh0 · 2560 0.10 % Δh0; cap-probe PASS; code pushed 13:20:32, synced 13:20:43 (11 s); docs re-put 13:19:54
2026-10-03T13:19:43Z | gate round 4 prototype (3 widths + probes; footer hover removed, panel link colour) | 360 1.41 % · 1440 0.16 % · 2560 0.09 %; motion: hover-diff parity on in-page-nav + breadcrumb, accordion click-state panel opens on both; 4 MISSING live class toggles = equivalents (register)
2026-10-03T13:20:43Z | code pushed 13:20:32 and synced (sync-poll 11 s) | blocks-first @ 2 commits
2026-10-03T13:22:56Z | served gate 1 (3 widths, --origin gate, probes) | 360 1.08 % · 1440 0.17 % · 2560 0.10 %; cap-probe PASS; leak 1440 identical
2026-10-03T13:24:42Z | gate round 5 prototype — FINAL (bold lead restored from the spec's b runs) | 360 1.39 % Δh+1 · 1440 0.15 % Δh0 · 2560 0.09 % Δh0; cap-probe PASS; probes as round 4
2026-10-03T13:26:53Z | document re-put to DA 13:26:40 (preview 200) | /drafts/diversity-equity-and-inclusion
2026-10-03T13:29:06Z | served gate FINAL (3 widths) + leak tables | 360 1.06 % Δh0 · 1440 0.17 % Δh0 · 2560 0.09 % Δh0; cap-probe PASS; leak 1440 identical (28 rows), 360 identical but footer-legal y 13483 vs 13484 (1 px rounding)
2026-10-03T13:41:20Z | site profile (migration/site.json) + block inventory (migration/blocks.json, 13 rows / 8 blocks) + served per-section gate + budgets written | per-section 360 budgets: in-page-nav 4.09, accordion(invert) 2.14, cards(awards) 1.27, cards 1.19, accordion 0.66, columns(logos) 0.33, cards(facts) 0.11, breadcrumbs 0.02
