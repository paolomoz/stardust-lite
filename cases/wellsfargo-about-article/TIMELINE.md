2026-10-03T22:29:17Z | t0 probe-load start | setup 22:17:50Z→22:28:30Z = 10.7 min
2026-10-03T22:31:00Z | probe-load done | tier: no flag; 2 unassigned bands (fat-nav 60px, nav 22px); breakpoints 570/768/1080
2026-10-03T22:31:55Z | measure-page start | header=masthead+fat-nav, main default, --noise
2026-10-03T22:33:06Z | measure done | doc 3613/2542/2542, 10 sections, noise floor 1440 0 %, 7 imgs 4 fonts
2026-10-03T22:33:37Z | brief read | 4 faces, cap 1400 fixed, hero marquee + 3 card sections + footnote; breadcrumb nav is an extra root
2026-10-03T22:34:36Z | media-fetch start
2026-10-03T22:36:59Z | triage done | 8 rows: hero, cards x3, default x2 (+ breadcrumb by hand), 2 triage runs + 2 from-md
2026-10-03T22:39:42Z | document authored + lint clean | 3 docs, 43 texts, 6 sections, lint 0 red 4 yellow; hand edits: breadcrumb, card shapes/h3, em button, ZWJ, nav fat-nav+search
2026-10-03T22:51:59Z | CSS written | drafts merged into styles.css, hero, cards, breadcrumbs; header/footer from probes
2026-10-03T22:52:58Z | css-lint clean | 8 blocks; harness starting
2026-10-03T22:53:56Z | harness port 8982 stale (Python 33783) → 8992
2026-10-03T22:55:03Z | first harness prototype served | :8992, 7 blocks loaded, doc 2593 (live 2542)
2026-10-03T22:58:07Z | gate round 1 (1440) | 1.47 %, Δdoc +51 (footer padding applied twice: .footer = block + inner div), rows within 2 px; cap-probe FAIL 2560 (h1 383 shrink-wrap, footnote wrapper)
2026-10-03T23:01:23Z | gate round 2 (1440) | 1.56 %, Δdoc +3, cap-probe PASS; digest: bottom band dy=4 displacement (hero inline-img gap typed 5 vs live 4.47)
2026-10-03T23:05:55Z | gate round 3 (1440) | 1.56 % identical (inline img: no pixel effect); pair read: tools -5, button 176 fixed, links pinned to card bottom (flex), footer 1px separator in-flow
2026-10-03T23:08:54Z | gate round 4 (1440) | 1.49 %; pair fixes in; deep-probe both: hero img 549.6 (natural ratio), card img 373.5 (16:9), link p lh 23.04 vs 22
2026-10-03T23:10:05Z | gate round 5 (1440) | 0.33 %, Δdoc 0, rows 0 % except footnote band 2.67 % (paint)
2026-10-03T23:12:47Z | gate round 6 (1440) | 0.31 %, Δdoc 0, all rows Δh 0 Δy 0 — base clean by the stop rule; residual: footnote text paint 2.67 %
2026-10-03T23:15:52Z | FIRST gate < 10 % at three widths | 360 3.53 / 1440 0.31 / 2560 0.23, Δh 0, cap-probe PASS; motion 0 parity 1 missing 2 out-of-tol 5 dead-on-live
2026-10-03T23:18:59Z | probes pass | motion 2 parity, 0 out-of-tol, 1 MISSING = live JS class toggle (BACKLOG #196 advisory); 360 crop: mobile breadcrumb, mobile marquee rendition, logo size, OneTrust button
2026-10-03T23:20:50Z | 360 fixes | mobile breadcrumb (12px, parent only, left chevron), profile hide OneTrust; marquee mobile rendition = residual
2026-10-03T23:24:15Z | 3-width gate final (prototype) | 360 2.89 / 1440 0.31 / 2560 0.18, Δh 0, cap PASS; css-lint :where fix; pushing
2026-10-03T23:25:54Z | code pushed and synced | 2 commits on blocks-first, sync-poll 13 s + this one
2026-10-03T22:39:50Z | document put to DA | drafts/inclusion, nav, footer (da-put ran in the same call as spec-to-css at 22:40:27; the 3 uploads 201, previews 200; not re-put since)
2026-10-03T23:28:48Z | served gate done | 360 2.86 / 1440 0.30 / 2560 0.17 (proto 2.89 / 0.31 / 0.18), Δh 0, cap PASS, motion 2 parity 1 missing
2026-10-03T23:31:53Z | close | reports written, site-profile init (+3 hand patches), block-inventory 6 rows; final commit
