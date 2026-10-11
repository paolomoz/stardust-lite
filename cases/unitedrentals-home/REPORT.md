# unitedrentals-home — report

Source https://www.unitedrentals.com/ · site repo aemcoder-adobe/sdt-unitedrentals-lite (branch blocks-first, preview only) · stardust-lite b8b2317.

| | 360 | 1440 | 2560 |
|---|---|---|---|
| first round | 47.95 | 50.35 | 50.77 |
| prototype (r19, stop) | **9.37** | **7.78** | **6.72** |
| served (/drafts/unitedrentals-home) | 9.38 | 7.78 | 6.73 |
| doc height live / build | 6366 / 6369 | 6342 / 6341 | 6553 / 6552 |

- t0 → stop 32.4 min (19 rounds, 2 harness re-runs); t0 → served 35.5 min. Tool seconds t0 → stop 742.
- leak.mjs (18 wrappers, 360 and 1440): prototype and served identical.
- Blocks: columns (hero, used equipment, safety banner, career), carousel (equipment, solutions, promo), cards (tools, fleet, news); header / footer foundation.
- Document edits (case, not tool): hero still added to the hero columns; used-equipment and career sections re-modelled as columns (default content in the draft); 30 mobile renditions authored as `| mobile <768` pictures; 27 fleet icons copied into icons/.

Worst sections at stop (pixel %): 360 promo slider 43.6 (live mobile slide order, REGISTER), news 21; 1440 safety banner 29, used 20; 2560 safety 19.6, used 14.
