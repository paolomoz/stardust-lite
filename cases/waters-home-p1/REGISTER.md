# waters-home — register

## Triage / model
- Kept the triage split (7 main sections). Rows 1, 4, 7, 10 (back-to-top, spacers) dropped as drafted.
- Document edits after `first`: removed `:layer-1:` icon tokens and SVG `<style>` text; "Shop Online" list re-authored from a 9-row accordion to a `<ul>`; video poster image added in place of the bare "Video" link (the link to the video is lost — deviation); nav brand as `:waters-logo:` (icons/waters-logo.svg) because DA dropped the SVG img.
- `accordion` is used for two non-accordion shapes (link columns in #2, icon tiles in #5) — a modelling debt: these should be `columns`/`cards` variants in a rollout.

## Deviations (visible)
- Icons not reproduced: BD bar people icon, Shop Online cart icon, tile icons (Offers / Order Tracking / How to Buy, the four "What would you like to do" tiles), external-link icons, header globe/user/plus/cart icons, footer social icons (hidden), hamburger at 360.
- Header search box and Quick Order inputs are drawn with pseudo-elements (no form, no placeholder in the header box).
- "Contact Waters" closing link of #3 hidden (live shows it only as a floating tab).
- Back-to-top button not built (its 44 px strip is a margin).
- Hero image crop position chosen by eye (object-position 50% 58%).
- sections-draft.css not imported (wrong cap model); section CSS lives in styles.css.

## Motion
- None reproduced (no carousel on this page; hover states not built).
