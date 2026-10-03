# REGISTER — citizensbank about-article

## Triage (edited rows marked ✎; the rest as `triage` proposed)
| # | live section (1440) | fingerprint | model | section style |
|---|---|---|---|---|
| 0 | header 1440×201 | `(a a×3) ((a×6 input button) a×5)` | `header` (nav doc: brand · primary ul · tools: utility ul + search link + Log in · section sub-nav ul) ✎ hand-authored, the author's nav held only the utility row | — |
| 1 | hero 1440×501 | `h1 p picture` | `columns (hero)` ✎ (triage: columns?) | `hero` |
| 2 | "We're committed to doing more." 102 | `h2` | default content | `grey-title` ✎ |
| 3 | "Our commitment…" 64 | `p` | default content | `grey-text` ✎ |
| 4 | featureGrid image 582 | `[picture (h3 p a×2)]×4` | `cards (flat)` ✎ (triage: cards?) | `grey` ✎ |
| 5 | featureSingle 461 | `picture (h2 p a×2)` | `columns` ✎ (triage: accordion? — a picture beside text with two buttons is the columns shape) | `feature` ✎ |
| 6 | "Learn more about Citizens" 102 | `h2` | default content | `grey-title` ✎ |
| 7 | featureGrid card 566 | `[picture h3 p a]×4` | `cards` ✎ (triage: cards?) | `grey` ✎ |
| 8 | disclosure 184 (after the footer in the DOM) | `p` | default content → moved to the footer document, section 3 ✎ | `disclosure` (footer-3) |
| 9 | footer 1440×382 | `(picture [h5 a×3]×3) [a×4]×2` | `footer` (footer doc 3 sections) | — |

Collection shapes only; no new block name. Novelty 50 % against an empty inventory (4 new of 8).

## Deviations (with pixel cost)
| id | what | where | cost | why it stays |
|---|---|---|---|---|
| D1 | 6 live images broken at 360 (naturalWidth 0, alt text painted in the box — measure-page note); the build shows the pictures | 360 bands 1800–5400 (flat items, feature, boxed cards) | ≈ 10 of the 14.82 % at 360 (gate-diag: pictures hidden → 37.6/33.8 → 2.7/4.1, 7.6 → 4.6, 21.6 → 15.2) | a source quirk the pipeline cannot carry; hiding correct pictures would clone a bug |
| D2 | disclosure authored in the footer document (footer-3), not in main | live y2959–3143 | 0 px (the band is where the live has it); the served gate lists live #8 as "Δh −184 default" because its pairing looks for it in main | the live DOM order is footer → disclosure; EDS main ends before the footer |
| D3 | copyright year: live writes it with a script, the document carries "2026" as text | footer-3 | 0 px | D15 lint: script text is not content |
| D4 | search field modelled as a link styled as the 204×39 input (placeholder text, icon); Log in as a bold link styled as the 114×37 button | header | 0 px at 1440 (pair Δx −1 / Δw +1) | an `<input>` has no document form; the live search opens a results page |
| D5 | the live nav row-1 utility icons, lock, search, menu and the four social glyphs are `<use>` references into two sprites; the build inlines ten standalone SVGs cut from the sprites (`scripts/svg-symbols.mjs`), fill currentColor | header, footer | within the chrome's 1–1.4 % bands | BACKLOG #103 pattern (sprite → files is still a case script) |
| D6 | cap: live module box 1280 (grid x80..1360, 16 px column padding → content 1216); build `max-width 1280` + gutter 32 at ≥ 1020 | all sections | cap-probe FAIL (Δ−32) → PASS | the probe compares the module box, not the text column |
| D7 | 1440 residual 2.4 % and 2560 1.4 % are text anti-aliasing and picture renditions (hottest band dy=0, luminance ratio 1.00); every section Δh ≤ 2 | all widths | — | under the 2 px rule |
| D8 | fonts: FiraSans 400/600 served from `/fonts` (woff); the live also loads `SourceSans3VF-Italic` (fetched, not declared: no spec row uses it) | — | 0 | brief: faces loaded FiraSans only |

## Motion
| id | probe (live → build) | live (motion-live.json) | build | verdict |
|---|---|---|---|---|
| M1 | hover filled button `a.cbds-c-button--contained` → `.columns a.button.primary` | bg rgb(217,61,0) → rgb(173,48,0); inset shadow rgba(255,255,255,.06) → .12; `transition: all`, events 100 ms | `a.button.primary:hover { background: #ad3000; box-shadow: … .12 inset }`, `transition: all 100ms` | parity (self.background, self.boxShadow) — prototype and served |
| M1 | hover ghost button `--ghost` → `.columns a.button.secondary` | bg transparent → rgb(233,233,233); inset shadow none → .12 | `a.button.secondary:hover { background: #e9e9e9; box-shadow: … }` | parity — prototype and served |
| M2 | transition `transform` | 1 event, 100 ms, on a control whose computed transform stays `none` before and after (motion-live hoverSamples) | no transform changes on the build → no event | MISSING on build; nothing visible to carry (0 px) |
| M3 | transition `background-color` | the live transitions `all` (its background change is folded into the one `all` event set) | 4 events (two buttons × two captures) | advisory, build-only property name; incidental |
| — | hover flat-card link, boxed-card link, primary nav link; header scroll-morph | no measured hover diff; header static across the scroll | — | dead on live — not required |

First three-width gate: the summary line said "4 dead or unobserved on live"; `motion-compare.txt` had the two buttons MISSING on build
(see NOTES). One motion round (23:25–23:27) closed it with the values the gate's own motion-live.json had recorded; `hover-diff` found
"NO VISIBLE MATCH" for every selector at 1440 (elements below the 900 px viewport).

No panels, dropdowns or scroll-driven layers on this page (probe-load: no fixed or sticky layer at any width; every nav item is a plain
link). The mobile drawer (hamburger → `nav[aria-expanded]`) is structure from the foundation, not a measured state.

### gate motion-compare.txt (prototype, after the motion round)
    motion header scroll-morph: dead on live — not required (header static across the scroll traversal on both sides)
    motion hover section.dcom-c-featureSingle a.cbds-c-button--contained → .columns a.button.primary: parity (self.background, self.boxShadow; n/a; paired by order)
    motion hover section.dcom-c-featureSingle a.cbds-c-button--ghost → .columns a.button.secondary: parity (self.background, self.boxShadow; n/a; paired by order)
    motion hover section.dcom-c-featureGrid--image .dcom-c-featureGrid__item a → .cards.flat .cards-card-body a: dead on live — not required (no measured hover diff)
    motion hover section.dcom-c-featureGrid--card .dcom-c-featureGrid__item a.cbds-c-button → .cards:not(.flat) .cards-card-body > p:last-child a: dead on live — not required (no measured hover diff)
    motion hover #primary_nav a.dcom-c-navigation-bar__link → header nav .nav-sections a: dead on live — not required (no measured hover diff)
    motion transition box-shadow: parity (1 event(s) on live, 4 on build, 100ms)
    motion transition transform: MISSING on build (1 event(s) on live, 100ms)
    motion transition background-color: extra on build — advisory (4 event(s) on build, none on live — a build-only transitioned property; incidental unless a live line names the motion)
    motion summary: 3 parity, 1 missing, 0 extra, 1 advisory (0 out of tolerance, 4 dead or unobserved on live — not required; tolerance 150ms / 8px)
