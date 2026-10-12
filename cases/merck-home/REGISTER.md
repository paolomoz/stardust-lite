# merck-home — register

## Triage changes (document edited directly after `first`)
| section | first's split | changed to | why |
|---|---|---|---|
| Explore our stories | carousel, 2 rows (slides 2–4 merged into one cell, "slide 1 to 5 of 3" live-region text authored) | `cards (stories)`, 4 rows picture / tagline + title link; "Read more stories" bold link in the same section | the dump read the tiny-slider clones; one row per story |
| Read more stories | own default section (authored empty) | in the stories section | it is the stories section's control |
| About us | default content | `columns (feature, image-right, overlap)` | same module as Pipeline / Clinical trials |
| Pipeline, Clinical trials | columns | `columns (feature)` / `columns (feature, image-right)` | picture side differs at ≥768 |
| Related links | cards with a duplicate title link row | `cards (related)`, title is the bold link | duplicate link removed |
| nav | "Merck.com" text link, empty lists | logo icon, "Search everything" + "Menu" tool links with icons | the dump missed the logo link and the button labels |
| footer | one flat section, icon tokens split from links | 5 sections: social band, 3 columns, legal | the footer layout needs the columns as sections |

## Deviations
1. **Origin capture defect (blocks the stop line).** The cached origin (`measure/live-<W>.png`, one-shot full-height viewport) is not the
   page a reader sees: the lazy / `parallax-scroll` pictures (stories, About / Pipeline / Clinical) are unpainted at 1440 / 2560, the
   stories section is +206 px (1440) / +346 px (360) taller than in the measured DOM, and the feature boxes are content-sized (388 / 376 / 432)
   instead of image-height − 128. A stitch-shot recapture (real 900 px scroll) matches the measured DOM (Read more at 2005 vs DOM 2021,
   About box 428). The build follows the measured DOM. Against the stitch-shot capture the same build scores 26.2 / 15.9 / 7.3 (that capture
   has its own noise: the sticky header repeated per chunk, parallax tearing).
2. 360 stories: the live slider clips the list at the box (740); the build clips at the same height (3rd / 4th stories hidden like live).
3. Footer columns: built 387 + 40 gap from x 99; live columns are 1280 / 3 with a 40 right padding from x 80 (found after the clock, not fixed).
4. Footer legal row (links, copyright, accessibility badge) is beyond the live capture's bottom edge; built from the dump, unverified.
5. Footer at 360: the column lists are hidden (collapsed rows with a chevron); no toggle behaviour implemented.
6. Header "Menu" / search open no panel (no menu document); links point to /sitemap/ and /search/.
7. Parallax motion of the feature pictures not reproduced (static at rest position).

## Motion
- feature pictures: scroll-linked parallax (`parallax-scroll`) — not reproduced (deviation 7).
- stories: tiny-slider at 360 — static clip (deviation 2).
