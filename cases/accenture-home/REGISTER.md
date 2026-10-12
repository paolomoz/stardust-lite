# accenture-home — register (deviations, motion)

| # | section | deviation | why |
|---|---|---|---|
| 1 | hero | headline is text "Reinvented" (live: "Rein" + purple chevron SVG + "ented"); entrance slide-in and particle video omitted; poster image (accenture.com URL, not fetched) hidden | motion / media not authored |
| 2 | cards | flip state (description + Expand) hidden; 360 slider control omitted | interaction |
| 3 | client spotlight | Vidyard iframe → poster picture + link; right list placed at measured tops (absolute) at ≥600; 360 list thumbnails omitted | embed |
| 4 | awards | scroll-driven sticky heading and floating cards rendered static at their captured positions; lottie cells hidden; section heights fixed to measured | motion |
| 5 | careers | scroll-pinned module: the capture is an intermediate state per width — 1440 black panel (::after) right of x704 below +346; 360 a second decorative rendition of the picture (hero.js, aria-hidden) for the settled 360×240 card and a ×3.3 crop above; 2560 picture box 1207×640 over the texts | motion (matched to the capture) |
| 6 | news | flickity controls (pause / prev / next) omitted; static row offset −17 | interaction |
| 7 | header | bar height and black paint only; logo / nav / search not styled | chrome out of the clock |
| 8 | page ≥1920 | `main { width: 1440px; zoom: 4/3 }` — the live page is the 1440 layout scaled inside a centred 1920 frame (spec-2560 boxes) | measured ratio |
