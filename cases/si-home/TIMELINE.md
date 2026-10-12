2026-10-09T07:00:02Z | setup_start | repo create, fstab, Code Sync 204, aem.js 200 at 07:01:07, seed + preview 201/200 (npm ERESOLVE on boilerplate eslint peer → --legacy-peer-deps)
2026-10-09T07:01:56Z | setup_end | stardust-lite#35f9b73, playwright, init --foundation, blocks-first pushed — 1.9 min
2026-10-09T07:02:02Z | t0 probe-load start | 360,1440,2560
2026-10-09T07:02:45Z | tier line read | no flag needed; unassigned hero band div.region--highlighted (620 @1440); back-to-top fixed after scroll → --hide (takeda precedent)
2026-10-09T07:04:06Z | measure done | doc 12734/5459/5560, 6 sections guess (+ unassigned highlighted hero band), noise 1440 5.74 % (splide carousel)
2026-10-09T07:04:18Z | brief read | header 2-row, hero carousel (unassigned band), 2-col intro, 4 nav cards, featured 12 cards + sidedoor 4 + membership callout (one dump section), 4 link cards (entrance faded), footer
2026-10-09T07:05:39Z | triage done | 9 rows: header, carousel, h1 sr-only, columns, cards navigation, cards featured (+2 blocks hand-added), hr, cards links, footer; dropped skip links + 2 duplicates
2026-10-09T07:12:41Z | document authored + lint clean | author draft + fix-doc.py (skip links, duplicate hero, intro columns, membership columns, arrow tokens, &amp;amp;, em space) + nav/footer by hand; 0 red 2 yellow (svg logos, pure vector); 3 docs put to DA
2026-10-09T07:18:44Z | CSS written + css-lint | styles, carousel (new block js+css), cards (3 variants), columns (+membership), header, footer; 7 css-lint findings left = false positives on disjoint elements
2026-10-09T07:19:19Z | first prototype served | :8991, doc 5456 vs live 5459 at 1440, 88/88 texts, 9 blocks loaded
2026-10-09T07:20:35Z | gate round 1 (--round: base width only, --widths ignored) | 1440 14.32 %, Δdoc -3; hero 62 % (live veil, ratio 0.626), nav cards Δh -52 (title wraps), featured +98, shop unpaired
2026-10-09T07:24:06Z | gate r1 at three widths (measurement deviation) | 360 39.15 / 1440 19.52 / 2560 28.66, Δdoc -388/+3/-62; live origin differs from r1's (membership mid-entrance) — origin pinned to gate/ from here
2026-10-09T07:26:15Z | gate round 2 | 1440 11.8 % (hero veil 62→45, footer visible); r2 CSS had an unclosed comment (nav cards) — fixed with r3
2026-10-09T07:28:27Z | gate round 3 | 1440 12.12 % (section table read a different live load: Δdoc -603 in the table vs -3 in pixels); nav-card arrow word space; hero veil
2026-10-09T07:29:49Z | gate round 4 — FIRST 1440 < 10 % | 1440 8.13 % Δh -3; shop row 18 % = live mid-entrance (faded cards in the origin)
2026-10-09T07:31:32Z | gate round 5 | 1440 4.25 % Δh +1; no stop: line (hero / h1 unpaired, Δh rows are split boundaries)
2026-10-09T07:34:16Z | gate round 6 (three widths) | 360 35.62 / 1440 3.82 / 2560 7.00, Δdoc -192/+1/+1 — 1440 + 2560 under 10 %, 360 not
2026-10-09T07:49:54Z | gate round 7 (three widths, slow-scroll origin from scripts/origin-capture.mjs) | 360 25.42 / 1440 6.18 / 2560 12.69, Δdoc -102/-25/+282
2026-10-09T07:54:03Z | gate round 9 (three widths + probes; 2560 rerun on the right origin — the out dir's cached origin beats --origin) | 360 27.76 / 1440 3.44 / 2560 7.04, Δdoc -90/+3/+3; motion 0 parity 9 missing
2026-10-09T07:56:18Z | gate round 10 (three widths + probes) | 360 27.76 / 1440 3.44 / 2560 4.51 — 1440 and 2560 < 10 %; 360 blocked (live variance + broken image)
2026-10-09T07:56:33Z | probes run (gate --probes): motion 0 parity / 9 missing / 3 dead on live — hover states not reproduced (register); stop here on 360 (budget)
2026-10-09T07:57:23Z | pushed + synced | bc547f7, sync-poll 13 s (8 files)
2026-10-09T07:58:51Z | served gate done | 360 27.76 / 1440 3.44 / 2560 4.51, Δdoc -90/+3/+3 — identical to the prototype
2026-10-09T07:59:22Z | leak both | 16 selectors, 0 differing lines

# exact command-end times (TIMING.log END lines; the lines above carry the moment the line was written)
2026-10-09T07:02:34Z | probe-load end | tier line: no flag; back-to-top fixed after scroll → overlays.hide
2026-10-09T07:04:01Z | measure-page end | 3 widths + noise floor 5.74 % (entrance states, carousel)
2026-10-09T07:05:39Z | triage --from-md end |
2026-10-09T07:08:54Z | media-fetch + fonts by hand (Typekit `l.woff2` collision) + da-put media end | 32 media, 4 faces
2026-10-09T07:09:07Z | author end | 11 sections, lint PASS (first try rc=1: dropping triage rows breaks the dump pairing)
2026-10-09T07:12:41Z | fix-doc.py + nav/footer by hand + lint + da-put docs end |
2026-10-09T07:12:48Z | spec-to-css end (drafts mispaired by one: the page title is a `<header>` element) |
2026-10-09T07:18:36Z | CSS written, css-lint 7 findings left (false positives on disjoint elements) |
2026-10-09T07:18:52Z | first harness end (prototype served) |
2026-10-09T07:20:26Z | gate round 1 end (--round: 1440 only) | 14.32 %
2026-10-09T07:22:34Z | gate r1 three widths end | 39.15 / 19.52 / 28.66
2026-10-09T07:25:28Z | gate round 2 end | 11.80 %
2026-10-09T07:27:32Z | gate round 3 end | 12.12 %
2026-10-09T07:29:37Z | gate round 4 end | 8.13 % — FIRST 1440 < 10 % (+27.6 min)
2026-10-09T07:31:23Z | gate round 5 end | 4.25 %
2026-10-09T07:34:08Z | gate round 6 three widths end | 35.62 / 3.82 / 7.00 — 1440 + 2560 < 10 % (+32.1 min)
2026-10-09T07:42:17Z | origin-capture.mjs end (slow-scroll origin, 3 widths) |
2026-10-09T07:49:45Z | gate round 7 three widths end | 25.42 / 6.18 / 12.69 (2560 origin broken: shop row mid-animation)
2026-10-09T07:52:53Z | gate round 9 three widths + probes end | 27.76 / 3.44 / 12.09 (2560 read the out dir's cached origin)
2026-10-09T07:53:51Z | gate round 9 2560 rerun end | 7.04
2026-10-09T07:56:10Z | gate round 10 three widths + probes end | 27.76 / 3.44 / 4.51; probes 0 out of tolerance, 0 parity / 9 missing
2026-10-09T07:57:16Z | pushed + synced end |
2026-10-09T07:58:45Z | served gate end | 27.76 / 3.44 / 4.51 (= prototype)
2026-10-09T07:59:13Z | leak both end | identical

# the three measured moments
(a) under 10 % at three widths: NOT reached (360 best 25.42 r7, final 27.76). 1440 alone at +27.6 min (r4), 1440 + 2560 at +32.1 min (r6).
(b) gate `stop:` line: never printed (every round's digest ended `next: one round`; the hero and the hidden h1 stay unpaired, Δh rows are split boundaries).
(c) probes: ran from r9 (+50.9 min) — 0 out of tolerance, 0 parity, 9 missing (hover states not reproduced), 3 dead on live.
2026-10-09T08:07:10Z | close | case documents committed + pushed (aac8011); +65.1 min from t0
