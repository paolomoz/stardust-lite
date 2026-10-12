# okta-home — report (https://www.okta.com/, stardust-lite e25f669, exp/five-min field run)

- Site: aemcoder-adobe/sdt-okta-lite, branch `blocks-first`, page `/drafts/okta-home` (preview only, never published).
- Clock: t0 23:58:36Z → stopped 00:33:55Z (35.3 min) without a `stop:` line; 2560 under 10 % from r7 on, 360 and 1440 not.
- Final prototype (r12, cached origin): **360 12.66 % · 1440 12.13 % · 2560 9.61 %**, Δh 0 / −3 / −3.
- Served (branch preview): **360 12.77 % · 1440 14.37 % · 2560 9.15 %** (the 1440 delta is the Vidyard video frame, band 2700–3150).
- Leak (prototype vs served, 19 selectors, 1440 and 360): 0 differences at 1440; 1 at 360 (`.stories` computed auto margin 32 vs 0, same box).
- Tool seconds t0 → stop (TIMING.log): first 128 + 8 harness 88 + 12 rounds 497 + 1 diagnostic 91 = **804 s (13.4 min) of 35.3 min**; ~8 `section-view` calls (~15 s each) were not wrapped in `./tl`.
- Lint (davids-model-lint on the final document): PASS, 0 🔴, 3 🟡 (two columns blocks with uneven rows, 3 SVGs to verify).
- Overlay floor (scripts/overlay-rows.py): at 360 the per-tile rows 660–900 differ 31–63 % against ~5 % elsewhere (the Ollie chat bubble +
  "Ask Ollie" button stitched into every live tile); at 1440 rows 300–480 of each tile ~22 % (the chat panel, x ≥ 1116). Masking x ≥ 1116 at
  1440 leaves 3.2 % own-diff (scripts/overlay-share.py). The page itself is around 5–6 % at 360 and 1440 apart from that overlay.
