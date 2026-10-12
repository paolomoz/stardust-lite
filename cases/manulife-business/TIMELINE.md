2026-10-03T16:30:36Z | t0 (first instrument run: probe-load 360,1440,2560 --chrome) | setup 16:22:34Z→16:24:47Z
2026-10-03T16:33:18Z | measure done (measure-page --noise --chrome, 68 s) | 12 sections guess div.aem-Grid > div.aem-GridColumn; doc 5696/4350/4350; noise 0 % at 1440; 114 shadow hosts
2026-10-03T16:46:20Z | triage table written + lint clean (author --draft-new: PASS 0 red, 1 yellow D1 hero) | 7 sections, 6 blocks: hero, carousel(cards, articles), cards(icons ×2), columns(banner); novelty 86 %
2026-10-03T16:50:23Z | document authored (author draft + hand edits for the shadow-held texts: tiles, product cards, article cards, nav, footer) | business.html     9015 B, nav, footer
2026-10-03T17:01:41Z | first harness prototype served | doc 4513 vs live 4350 at 1440; 9 blocks loaded; 28 texts flagged 'not in capture' (shadow-held, read from the pierced dump / DOM attributes)
2026-10-03T17:13:16Z | gate r3 (3 widths) — FIRST < 10 % at all three | 360 9.06 % Δh 67 · 1440 1.33 % Δh 5 · 2560 0.74 % Δh 5; r1 17:05 15.23 / 18.3 / 13.31; r2 (1440 only) 17:10 1.33
2026-10-03T17:17:51Z | gate r4 (3 widths) — section tables clean (every row 0 or a boundary) | 360 2.03 % Δh 0 · 1440 0.97 % Δh 6 · 2560 0.55 % Δh 6
2026-10-03T17:24:49Z | gate r6 (1440 + probes forced with chrome:) | 1440 0.67 % Δh 0; motion 3 parity / 0 missing / 1 advisory; hover-diff build = live on 7 families
2026-10-03T17:28:49Z | gate r7 (3 widths + probes) — probes pass (cap-probe PASS, motion parity, content) | 360 2.01 % Δh 0 · 1440 0.67 % Δh 0 · 2560 0.37 % Δh 0
2026-10-03T17:29:18Z | code pushed and synced (616c0ae; sync-poll 5 files in 12 s) | branch host blocks-first--sdt-manulife--aemcoder-adobe.aem.page
2026-10-03T17:29:22Z | document put to DA (/drafts/business, preview 200) | nav + footer previewed 16:59; media 16:52
2026-10-03T17:33:06Z | served gate done (3 widths + probes, origin gate/r1) | 360 2.02 % Δh 0 · 1440 0.67 % Δh 0 · 2560 0.38 % Δh 0 — leak table identical (34 rows); motion 3 parity
2026-10-03T17:37:21Z | tile hover shadow added, pushed, synced (10 s), hover-diff on the served page = live | site-profile init + block-inventory scan written
