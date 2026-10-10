# TIMELINE — acs-about (https://www.acs.org/about.html), stardust-lite exp/five-min d58b9f8

2026-10-10T06:41:45Z | setup_start | work dir + ./tl; DA token refreshed; repo create, fstab, Code Sync 204, aem.js 200, config contentSourceUrl ok, seed index/nav/footer put 201 + preview 200 (preview only)
2026-10-10T06:42:56Z | setup_end | stardust-lite#d58b9f8 (--legacy-peer-deps), playwright, init --foundation --force (stardust.js wired), blocks-first pushed — 1.2 min
2026-10-10T06:43:07Z | t0 probe-load start | (line written 06:44:17); 360 got an Imperva challenge iframe (main-iframe) under headless Chromium, tier said 'no flag'; rerun --chrome --consent .osano-cm-accept-all (Osano bar) → 360 ok; overlays.chrome added to profile by hand; footer div.footer.acsFooter.parbase is an unassigned band
2026-10-10T06:45:21Z | brief read | 12 content sections (hero+video card, strategic plan 2-col + images, governance 8 link cards, 4 brand cards on dark band, impact bento 4 cards, people carousel strip of 8 round-cut photos, 2 buttons, jobs callout, history 2-col collage, ethical links), header fixed hides on scroll + localnav pins (sticky), footer unassigned band; brief rows #1–#9 are the in-section <header class=acs-heading> titles read as HEADER chrome (si bug again); noise 2.04 %
2026-10-10T06:46:35Z | triage done | 13 rows: header, video(hero), columns(strategy), cards(links) grey, cards(brands) dark, cards(bento), default, cards(people), default, default callout, columns(history) lavender, default, footer; footer band reordered after main by a case script (dump key order put it before the hero); localnav folded into the header chrome (split rule) → nav doc
2026-10-10T06:48:38Z | fonts.css written | media-fetch --fonts --css: 2 faces (stolzl 450, FontAwesome 400), no hand edit — BUT the four font files were the WAF's 212-byte HTML (found at r1, real bytes 07:03:24 via scripts/fetch-fonts.mjs); media: curl got Imperva HTML for every asset, --from-page 1st try 0 captured, --browser 8, --from-page 2nd try 28/28
2026-10-10T06:51:46Z | document authored + lint clean | author --draft-new lost every card-wide link / button href and wrote :icon: placeholders → build-doc.py (doc, nav with 4 sections incl. localnav, footer social icons) + icons.py (13 inline source SVGs → icons/); 0 red 3 yellow (hero D1 justified, SVG D4 checked pure-vector); 3 docs put
2026-10-10T06:57:46Z | CSS written + css-lint | styles (tokens, sticky header -105, module cap 1325, 11 section rules), hero (new js+css), cards (links / brands / bento / people), columns (strategy / history), header (3 bars), footer (3 sections; inner class renamed .footer-inner — reset hides .footer); spec-to-css drafts read for type/paint/units, the section paddings rewritten by hand; css-lint 66 (specificity inversions on disjoint elements, foundation-reach on default content) left
2026-10-10T06:58:59Z | first prototype served | :8993, doc 5451 vs live 5563 at 1440, 9 blocks loaded, 0 texts missing
2026-10-10T07:00:14Z | gate round 1 | 360 31.55 / 1440 14.54 / 2560 10.38 (fonts were Imperva HTML — 212-byte challenge pages saved as .woff2; live header leaves the flow on scroll)
2026-10-10T07:04:58Z | gate round 2 | 360 37.26 / 1440 8.43 / 2560 8.95 (fonts re-fetched by a case script via Chrome; header fixed + nav-scrolled closes the flow by 105 at >= 900; 360 now 909 px short)
2026-10-10T07:08:08Z | gate round 3 | 360 14.25 / 1440 8.39 / 2560 8.93 (360: section paddings, type and cards from spec-view 360; governance cards in the source's column order)
2026-10-10T07:11:01Z | gate round 4 | 360 13.82 / 1440 10.17 / 2560 9.93 (bento patterns authored back, over the picture — wrong layer; footer 360 grid)
2026-10-10T07:12:43Z | gate round 5 | 360 12.56 / 1440 8.27 / 2560 8.86 (pattern under the picture, the picture window an ellipse)
2026-10-10T07:14:49Z | gate round 6 | 360 11.95 / 1440 8.27 / 2560 8.86 (bento 360 text widths, history bottom)
2026-10-10T07:16:32Z | gate round 7 | 360 11.80 / 1440 8.27 / 2560 8.86 (bento 360: yellow window 240, short-card text width)
2026-10-10T07:18:13Z | gate round 8 — stop: REACHED | 360 9.39 / 1440 8.27 / 2560 8.86 (360 offsets: strategy -4, link-card gap 10, brand-card gap 22, bento bottom 8) — "stop: under 10 % at the three widths"
2026-10-10T07:18:56Z | pushed + synced | 8a431f4
2026-10-10T07:21:12Z | served gate done | 360 9.35 / 1440 8.25 / 2560 8.84 — target REACHED on the served page (= prototype ±0.04); cap-probe FAIL at 2560: live modules are 1440 boxes with 57.5 inner padding, build 1325 content boxes (same content edges — a box-model reading, registered)
2026-10-10T07:22:13Z | leak both | 16 selectors, 0 differing lines
2026-10-10T07:24:38Z | probes done | gate --probes (5 hover lines, 1440): motion 0 parity / 24 missing / 1 advisory (nav-scrolled) — hover colour / card zoom transitions, the people loop, hover-orb entrances not reproduced (register M1–M4)
2026-10-10T07:32:30Z | close | site-profile init (merged with the t0 profile), block-inventory scan (5 blocks, 9 rows), README, REPORT, REGISTER, LINT, NOTES, TIMING.log copy; no polish round

# exact command-end times (TIMING.log END lines; minutes from t0 = 06:43:07; the lines above carry the moment the line was written — round lines corrected to the END stamp)
06:43:26 (0.3) probe-load · 06:44:02 (0.9) probe-load-2 (--chrome --consent) · 06:45:01 (1.9) measure-page (44 s) · 06:45:02 brief
06:46:29 (3.4) triage --from-md · 06:49:32 (6.4) da-put media (after 4 media-fetch attempts) · 06:51:24 (8.3) build-doc + lint PASS
06:51:51 (8.7) spec-to-css · 06:57:32 (14.4) css-lint · 06:58:54 (15.8) harness-2 = first prototype · 07:00:14 (17.1) r1
07:03:03 (19.9) fetch-fonts (first run hit the challenge, 104 s) · 07:03:24 (20.3) fetch-fonts-2 · 07:04:58 (21.9) r2 · 07:08:08 (25.0) r3
07:11:01 (27.9) r4 · 07:12:43 (29.6) r5 · 07:14:49 (31.7) r6 · 07:16:32 (33.4) r7 · 07:18:13 (35.1) r8 stop: REACHED
07:18:34 (35.5) push · 07:18:53 (35.8) sync-poll · 07:21:12 (38.1) served gate · 07:22:08 (39.0) leak both · 07:24:23 (41.3) probes
2026-10-10T07:27:52Z | committed + pushed | case documents
