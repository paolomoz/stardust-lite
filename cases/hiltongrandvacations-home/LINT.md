# David's Model lint at step 2 (before any block existed)

```
== lint home
🔴 D1 doc/home.html: section (unnamed) → block "carousel" row 1 cell 2: embed/video URL authored inside a block — author it as a plain link in default content and auto-block it in scripts.js buildAutoBlocks()
🔴 D1 doc/home.html: section (unnamed) → block "carousel" row 4 cell 2: embed/video URL authored inside a block — author it as a plain link in default content and auto-block it in scripts.js buildAutoBlocks()
🟡 D4 doc/home.html: 5 authored SVG media reference(s) — batch-verify pure-vector (an SVG embedding raster data URIs 409s the whole page's preview, #99)
FAIL — 2 🔴, 1 🟡 (rules: ../davids-model.md)
== lint nav
🟡 D4 doc/nav.html: 1 authored SVG media reference(s) — batch-verify pure-vector
PASS — 0 🔴, 1 🟡
== lint footer
🟡 D4 doc/footer.html: 34 authored SVG media reference(s) — batch-verify pure-vector
PASS — 0 🔴, 1 🟡
```

home: **2 🔴, 1 🟡**. Both 🔴 are the same row kind: the social carousel's two video tiles carry the source's own Vimeo player URL as a
link whose text is the video title ("Island Days & Aloha Stays With Hilton Grand Vacations"), next to the tile's poster picture. METHOD
step 2 prescribes exactly this ("a video that belongs to a card is a fully qualified link in that card's row; the block opens the
player") and BACKLOG #13 (open) records that the lint does not yet accept it. Not re-solved: the model is kept, the harness ran with
`--no-lint`, and the rows are cited here. The first version of the document also carried three 🔴 that WERE modelling defects and were
fixed before preview: the hero authored as a block with the player link inside it (now default content auto-blocked by `scripts.js`
`buildHeroBlock`), a picture in a section-metadata `background` value (D14; now a URL), and the tabs block's single-cell title row (D3 🟡;
"Trending Destinations" is now the section's default-content paragraph that `tabs.js` moves into the card as its badge).

🟡 D4 on every document: the social icons, the HGV logo and the 27 footer brand logos are the source's SVG files, checked — none embeds a
raster data URI (`grep -l "data:image" media/*.svg` → none).

nav, footer: clean. Unchanged afterwards: the home document was regenerated once after step 2 (the ticker and the tabs card folded into
one section, `destinations`, because the source paints them as one band and cap-probe pairs modules by section order); the lint result
did not change.
