# nfl-home — notes

## (a) tool friction (what · minutes · what would have removed it)
- The page is a two-column grid (824 main + 400 rail) that becomes one column below lg with the rail modules INTERLEAVED (mobile-only duplicates `lg:hidden` / desktop-only `max-lg:hidden`). `measure-page`'s `--sections` guess differed per width (360: 2 groups; 1440: 8 incl. hidden ones) and triage / author have no model for a rail · ~13 min (selector choice, then re-authoring the whole document by hand with a case script) · a rail-aware split (`div.grid > div.group` children of every column, hidden duplicates folded) and an author recipe for a `rail` section style.
- Gate sections / pair do not look inside a column wrapper (`main > .page-main > .section`): "0 authored, 13 live unpaired", every row "not located", and the digest then printed `stop: the base width is clean (every section within 2 px)` at 22 % · ~5 min of hand crops per diagnosis over 8 rounds · locate sections with `main .section`, and never print the clean-stop line when 0 sections paired.
- Harness served the previewed (stale) nav / footer: edited chrome docs are only re-uploaded with `--sync-chrome` + DA_TOKEN, which the protocol does not say · 1 round, ~2 min · make it the default when DA_TOKEN is set, or say it in the PROMPT.
- `first`'s background media da-put failed (✗) so the fragment pictures 404'd until a manual `da-put` of media · ~1 min · fail loudly / retry; 5 SVGs (jax, tb, shield …) still preview 409.
- Harness fold keeps `class="promo (center)"` literally (no variant → class mapping) · 1 round · map `name (variant)` to `name variant` like the pipeline.
- spec-to-css drafts (`main .section:nth-of-type(n)`) were for the guessed split and unusable after re-authoring · 0 min (dropped) · drafts keyed on section style / block, not index.
- My own doc-script syntax error harnessed the original document (r8, 49 %) · 1 round · (mine).

## (b) own time, five largest non-tool chunks
1. Reading structure / spec dumps and deciding the model (two columns, mobile order, which blocks) — ~8 min (02:27–02:35).
2. Writing build-doc.py, the rail wrapper and all block CSS — ~4.5 min (02:35:30–02:40).
3. Diagnosing rounds from crops of live / build / diff (no usable digest) — ~6 min over 8 rounds.
4. Header and footer CSS from the spec — ~2 min.
5. Choosing the section selector after `first` — ~1.5 min.

## (c) per round
- r1: whole model (document, rail JS, CSS). Digest named nothing (sections not located).
- r2: desktop `order` reset (rail-top card first in the rail), media upload + `--sync-chrome` — found from sbs, not the digest.
- r3: link-card extra gap (button-wrapper p as a flex item), team-picker upright "CHOOSE YOUR", nav chevrons — from crops.
- r4: promo / link-card styles were one level too high (row vs cell) — from crops.
- r5: variant class `promo (center)` → `promo center`, `.button-container` → `.button-wrapper` — from the decorated DOM.
- r6: footer 360 logo row gap 4, social icons into /icons — from crops + spec.
- r7: footer row-gap 24, team-picker 412 — per-section boxes (case script boxes.mjs) said exact, yet 360 got worse: a +16 px offset below the headlines stack.
- r9: the offset was content — the source serves a short-title headline list below lg; authoring those titles removed it → stop.
