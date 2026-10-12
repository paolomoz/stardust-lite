# publicis-home — notes

## (a) tool friction (what · minutes · what would have removed it)
- Inner-scroller app shell not detected: html/body overflow hidden at 100vh, `main#app` absolute top 75 bottom 0 overflow auto (sh 1131, ch 825). Live captures are the 900 px viewport; the first round read Δh −1997 / −3531 with no hint why · ~1.5 min (own probe `scripts/ov.mjs` + deciding to reproduce the shell) · probe-load / measure-page reporting "document = viewport, scroller = main#app" and either stitching it or telling the author to reproduce the shell.
- Default split `main > .section` missed the hero (`section.crawl.start-page`, no `.section` class; probe-load listed both in mainKids) · ~1.3 min incl. re-run · split on `main > section` when the class selector leaves a mainKids section out.
- No footer on the page → author writes no footer.html, da-put docs exit 2, harness exit 4 ("preview the footer document first") · ~1 min · author emits an empty footer doc (or metadata footer omitted and the harness skips it) when the page has none.
- `first` did not pick a free port: used 8990, held by another serve.mjs (`*:8990`, IPv6 listener); harness refused (md5 mismatch) · ~0.6 min · the free-port check should probe the IPv6 wildcard too (or try-listen on `::`).
- `da-put` standalone needs `<org>/<site>/<branch>` although `first` infers it from the profile · 0.2 min · read site.json da target.
- Author nav: logo link authored as "Learn more", button items (The groupe, Investors) dropped, brand icon put in tools; spec-to-css header draft capped the nav at 934 px · ~0.5 min rewriting nav.html and header.css.
- fonts: Gotham Narrow A is cloud.typography (domain-licensed) → "no faces declared"; no stand-in suggested · ~0.7 min (`scripts/fontw.mjs`, 20 Google families by measured width; Urbanist).
- quote block got a CSS draft but no JS → module 404 in the harness console · 0.1 min · spec-to-css writes a no-op decorate for a NEW block.

## (b) own time — five largest non-tool chunks
1. Writing hero / quote / styles (app shell) / header CSS + nav doc from the spec rows · ~1.8 min
2. Diagnosing the 900-px live capture → inner scroller (reading gate pngs, structure, probe) · ~1.2 min
3. Reading first's output + DOM to find the missed hero and choose the split selector · ~0.7 min
4. Font stand-in (probe script + choice) · ~0.7 min
5. Footer / port workarounds (writing empty footer doc, finding who holds :8990) · ~0.5 min

## (c) rounds
- first round (72.4 / 60.4 / 48.3): drafts only, Times fallback, hero image in flow, no shell.
- r1: whole page written at once — app shell (html/body 100 %, main absolute scroller), hero background as a covering layer, logo 200×158 / 150×118, quote card (1180, m-80, p 60 130 75; 360: x9, m-50, p 25 64 35), CTA, header (logo centred, two runs either side, FR + search), Urbanist. Not digest-driven (the digest named only Δh of the hero and quote; the cause was the shell and the missing draft rules).
- r2: the digest named hero Δh +185 at 360 → the 360 hero padding (80 / 130) lost when I rewrote hero.css. Stop.
