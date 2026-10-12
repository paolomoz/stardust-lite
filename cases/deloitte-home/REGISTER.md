# deloitte-home — register

## Triage (as authored)
| # | section | model |
|---|---|---|
| — | header (`.cmp-header` inside `.breadcrumb-language-container`) | chrome: nav fragment (removed from the page doc by hand: triage kept it as a section) |
| 1 | hero "New teams…" | `hero` (background picture, h1, p, CTA) |
| 2 | video | `embed`: placeholder text only (no video URL in the capture) |
| 3/5/7 | "Our thinking" / "Our work" / "Careers" bars | default content h3 (section index styles) |
| 4 | "The latest from Deloitte" | default h3 + `cards` ×4 |
| 6 | client stories | `carousel` ×3 + default (status, "1 / 3", link) |
| 8 | "Join us" | `columns` (picture, h3/p/CTA) + default link |
| — | footer | chrome: footer fragment |

## Deviations
1. **Video not migrated.** It's a Dynamic Media blob with no URL in the DOM. The stage paints a gradient fitted to the captured first frame (grey field, dark lower centre). 2560 band 1350 is still 56 %.
2. **Hero at 360** is 16.9 %. The live page serves an art-directed mobile crop; the build uses the one 1920×880 rendition with `object-fit: cover`.
3. **Header tools**: Search, US-EN and the location drawer are not in the nav doc, and the `:let-s-connect:` / `:join-my-deloitte:` icons have no SVG. The hamburger has no icon.
4. **Footer social icons** have no SVGs (`icons/` empty).
5. **Carousel**: the progress bar and the peek of the next slide are not built, and only slide 1 shows (no JS). The authored link text is doubled ("Read the full story Read the full story", a content defect from `author`); CSS shows one copy. Fix it in the doc.
6. **Card 4 co-brand logo** (insights.svg) renders small or broken.
7. **Served cap-probe 2560**: the live content cap is 1512 and the build's is 1400 (`--cap: min(1400px, …)` from the spec's 2560 section rows). Not reconciled.
8. The section styles use `nth-of-type` indices (page-specific), not named section styles.

## Motion
The hero's entrance (`anim-end` classes) and the sticky title bars are not reproduced. The bars are in-flow.
