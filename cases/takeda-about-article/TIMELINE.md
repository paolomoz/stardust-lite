2026-10-03T22:29:27Z | t0 probe-load start | 360,1440,2560
2026-10-03T22:30:44Z | tier line read | consent=onetrust, shadowHosts=1, header sticky 90px, no redirect
2026-10-03T22:32:39Z | measure done | doc 24635/11895/11625, 27 sections, noise 1440 0%
2026-10-03T22:33:07Z | brief read | 27 sections: hero, intro 2-col, cta, 11x(h2+cards), link tiles, footer
2026-10-03T22:49:43Z | triage + lint clean | 24 sections, 14 block sections (hero, columns, columns cta, cards x10, cards tiles), 0 red 2 yellow
2026-10-03T22:49:43Z | document authored | 57 texts, 38 cards, nav + footer; 3 docs put to DA drafts
2026-10-03T23:05:14Z | CSS drafts generated + merged, css-lint clean | 3 drafts (hero, columns, cards) + sections-draft; 5 lint findings fixed
2026-10-03T23:05:52Z | first harness prototype served | :8984, doc 12014 vs live 11895, 133/133 texts
2026-10-03T23:08:49Z | gate round 1 | 1440 15.22 % (Δdoc +119); digest: cta -24, cards line-clamp (+26), h2 sections box 62 (margin collapse)
2026-10-03T23:15:39Z | gate round 2 | 1440 1.55 % Δdoc -65 (footer padding doubled on div.footer.block)
2026-10-03T23:15:39Z | gate round 3 | 1440 1.52 % Δdoc -1; residual: lower cards 4-5 % no-shift band
2026-10-03T23:24:24Z | gate round 4 | 1440 1.31 % (hide: OneTrust float + BackToTop, origin recaptured); lower cards rows 3.7-4.6 %: LEARN MORE pinned to the card bottom in the live
2026-10-03T23:32:15Z | gate round 5 | 1440 1.23 % Δdoc -1; every row within 2 px; residual: 1 px offset from FY2019 (live gap 49, sub-pixel 46.96) → anti-aliased edges 3.5-4.3 % in 4 bands
2026-10-03T23:36:11Z | FIRST gate < 10 % at three widths + probes | 360 1.41 / 1440 0.50 / 2560 0.40, Δdoc -1/0/0, cap-probe PASS, motion 2 parity 11 missing 2 advisory
2026-10-03T23:38:42Z | code pushed and synced | sync-poll 23 s (7 files), commit 5ae3c34
2026-10-03T23:49:13Z | served gate done | 360 1.48 / 1440 0.45 / 2560 0.39, Δdoc -1/0/0, cap-probe PASS, leak identical (17 selectors)

# exact command-end times (from `date -u` printed after each command; the lines above carry the moment the line was written)
2026-10-03T22:24:30Z | setup_start | repo create, fstab, Code Sync 204, aem.js 200 at 22:26:55, seed + preview 201/200
2026-10-03T22:28:30Z | setup_end | npm i stardust-lite#a7cebff, playwright, init --foundation, branch blocks-first pushed — 4 min
2026-10-03T22:30:00Z | probe-load end | tier line: --consent button#onetrust-accept-btn-handler, 1 shadow host
2026-10-03T22:32:28Z | measure end | 3 widths + noise floor 0 %
2026-10-03T22:40:41Z | triage from-md + media-fetch (41 images, 5 fonts) end
2026-10-03T22:48:28Z | document first put to DA (raw author output) | 3 docs 201
2026-10-03T22:49:43Z | document authored (cards rebuilt), lint 0 red, put to DA | 
2026-10-03T22:50:22Z | spec-to-css drafts generated |
2026-10-03T23:04:04Z | block CSS written, css-lint 5 findings → 23:04:57 clean, final docs put to DA |
2026-10-03T23:05:39Z | first prototype served |
2026-10-03T23:07:53Z | gate round 1 end | 15.22 %
2026-10-03T23:11:22Z | gate round 2 end | 1.55 %
2026-10-03T23:15:15Z | gate round 3 end | 1.52 %
2026-10-03T23:23:47Z | gate round 4 end (recapture) | 1.31 %
2026-10-03T23:26:02Z | gate round 5 end | 1.23 %
2026-10-03T23:35:51Z | three-width gate + probes end | 1.41 / 0.50 / 0.40 — FIRST < 10 % at three widths; probes pass
2026-10-03T23:37:47Z | pushed + synced |
2026-10-03T23:46:21Z | served gate end | 1.48 / 0.45 / 0.39, leak identical
