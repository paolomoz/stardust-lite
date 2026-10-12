2026-10-03T13:52:08Z | setup_start | eds-new-site + stardust-lite init
2026-10-03T13:54:29Z | setup_end | repo sdt-harbourvest, branch blocks-first pushed
2026-10-03T13:56:38Z | t0 | first instrument run: probe-load 360,1440,2560
2026-10-03T14:00:21Z | attestation gate solved | cookie preload scripts/hv-cookies.mjs; probe-load ok at 1440
2026-10-03T14:10:13Z | measure done | 3 widths, 9 sections (7 main + header + footer), 104 items @1440, noise floor 1440 0 % Δh 0; 3 measure-page runs (default sections miss, require marker wrong, ok)
2026-10-03T14:22:38Z | triage table written + lint clean | 7 sections: hero, default(intro), cards(icons), columns(overlap), columns(overlap reverse), cards(boxed), cards(tiles); lint PASS 0 red 1 yellow (D1 hero)
2026-10-03T14:44:12Z | code written | styles.css, hero, cards(icons/boxed/tiles), columns(overlap/reverse), header, footer, icons
2026-10-03T14:44:25Z | first harness prototype served | port 8975
2026-10-03T14:44:43Z | gate r1 start | 3 widths
2026-10-03T14:50:45Z | gate r2 start | 360,1440
2026-10-03T14:58:27Z | gate r3 start | 360,1440
2026-10-03T15:02:05Z | gate r4 start | 360,1440,2560
2026-10-03T15:06:17Z | gate r5 start | 360,1440,2560 + probes
2026-10-03T15:12:21Z | gate r6 start | 360,1440,2560 + probes (final prototype)
2026-10-03T15:15:03Z | served gate start | code 188fe2e synced 13 s, doc previewed
2026-10-03T15:16:23Z | served gate start | 5d58d2a synced
2026-10-03T15:19:12Z | served gate done | 360 15.55 / 1440 3.50 / 2560 3.54 (prototype r6: 15.73 / 3.51 / 3.55 → within); cap-probe PASS 2560; motion 1 parity 0 out-of-tolerance 1 missing (live JS class toggle); leak 20 rows identical
2026-10-03T15:19:12Z | probes pass | cap-probe PASS, motion parity (arrow transform .3s), content check 34/34; first <10% at all three widths NOT reached: 360 stays 15.6% from a −42 px cascade (source h2 trailing nbsp×2 the pipeline trims)
2026-10-03T15:23:23Z | gate r8 final | prototype 1440 3.46, served 1440 3.42, motion 1 parity 0 missing, hover bars parity on served; re-gating 2560 on both with the visible nav
2026-10-03T15:30:49Z | final gates (unmasked, --no-site) | prototype 360 15.73 / 1440 3.56 / 2560 3.57; served 15.55 / 3.53 / 3.55; cap-probe PASS; motion 1 parity 0 out of tolerance; leak identical
