# cisco-home — register

## Triage
Accepted `first`'s draft split (10 sections + header / footer); no rows dropped, no blocks renamed.

## Document edits (after `first`, before r1)
- Hero 1: the live background is a Brightcove video; its poster (1280×720) is uploaded as drafts/media/hero-poster.jpg and authored as the hero's first row. The "Watch video (01:33)" control (a button on live) is authored as a bold link to /site/us/en/about/whats-new.html#video.
- Hero 2 (tabs showcase): the tab list was authored as `:icon:`; replaced by a list of the 8 tab labels. Only the active tab's panel (Cloud Control) is content; the other 7 panels are not migrated.
- Columns (Powering outcomes): the first accordion item was outside the block; the three items are now cell 1, the image cell 2, the CTA default content after the block.
- Stats: "39M / 1B / 750B+" were merged in two paragraphs; now three paragraphs with the figure in bold.

## Deviations
- Video hero: a still poster, no playback, no pause control.
- Tabs: static (the active pill and the bar's look only; no tab switching, the chevron is not drawn).
- Accordion: items 2 and 3 are shown collapsed by CSS (text hidden), no toggle and no chevrons.
- Carousel: a CSS-only track (no JS, no swipe / indicator behaviour); the indicator pill is a ::after on the wrapper. At 360 the track is the tallest slide's height (live: the active slide's), compensated by the indicator margin.
- Tile navigation: the "Learn more" link is an invisible overlay over each tile (the live tile is one link with the label).
- Header: utility row and masthead approximated (white bar, links), no mega-menu, logo from the :cisco-c: icon; the chat widget is not migrated.
- Footer: social icons (:icon: / :logo:) render as empty 20×20 links; one image is still broken on the page (an icon name with no file).
- Alert band background #161616 is a pixel read of the live capture (the spec had no bg for it).

## Motion
Live: autoplay hero video, carousel slide transitions, tab switching. None reproduced.

## Residuals at stop
Section #8 latest +50 at 360 (h3 / link rhythm), #9 next steps at 360 (offset from #8), carousel 12 % at 1440 (text block, indicator).
