#!/usr/bin/env node
// content-dump.mjs — the AUTHORING input (step 2): per root selector a nested JSON of the visible elements that carry text, links or
// media — tag, short class, box, text with font, href/aria, src/alt/natural size, background/radius/border/shadow — bare wrappers
// collapsed. An element whose children are all phrasing (`strong`, `em`, `a`, `span`…) keeps its full text in reading order plus
// its inline markup (the own-text-only reading split "Text JOINRX to 21525" into "Text to 21525" + "JOINRX" — walgreens-home). The font
// string carries text-transform and letter-spacing (the text is DOM text; the page may render it uppercase — usta2-home). A paragraph a
// text-reveal library split into one element per rendered line is read as ONE text (`lines: N`); an image not yet loaded (a carousel card
// beyond the viewport) is read from its lazy attribute (`lazy: true`) — the dump is the AUTHORING set, not the painted one
// (audemarspiguet-home: 18 cards, 3 painted). A 0-size wrapper (an aspect-ratio box's `height: 100%` child) is walked through, not
// skipped with its subtree (hiltongrandvacations-home: the hero's header). Read the dump with `content-view.mjs` (full texts), never a
// truncating viewer. Hidden content a click reveals (a carousel caption, a tab panel, a drawer's sub-menu) is `click-dump.mjs`'s.
// --require <css,…> refuses (exit 4) a session whose composition is not the canonical one, so the dump matches the cached origin.
// --hidden <css,…> dumps the named roots WITHOUT the visibility test (boxes 0): hidden-but-present content a JS opener reveals that no
// click the probes make fires — modals appended to `<body>` with `aria-hidden` at rest (nine brand modals; `harness --content` listed
// every authored modal text as "not in the capture" — marriottvacationsworldwide-home). Opt-in and per root: hidden DOM stays NOT content.
// Usage: node content-dump.mjs <url> [W] --roots <css,…> [--hidden <css,…>] --out file.json [--require <css,…>] [--consent <css>] [--dismiss <css,…>] [--locale <tag>]
import { writeFileSync } from 'node:fs';
import { openPage, settle, arg, overlayOpts, launch } from './common.mjs';
import { collectContent } from './lib/content-collector.mjs';

const url = process.argv[2]; const W = Number(process.argv[3] || 1440);
if (!url) { console.error('usage: content-dump.mjs <url> [W] --roots <css,…> --out file.json [--hidden <css,…>] [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--require <css,…>]'); process.exit(1); }
const roots = String(arg('--roots', 'header,main,footer')).split(',').map((s) => s.trim());
const hidden = String(arg('--hidden', '')).split(',').map((s) => s.trim()).filter(Boolean);
const b = await launch(); const p = await openPage(b, url, { width: W, ...overlayOpts(), wait: 4000 });
await settle(p);
const tree = await p.evaluate(collectContent, [roots, hidden]); // the walker lives in lib/content-collector.mjs (shared with roster's light pass)
writeFileSync(arg('--out', 'content.json'), JSON.stringify(tree, null, 1));
console.log('doc', tree.__doc, 'roots', roots.length, hidden.length ? `+ ${hidden.length} hidden root(s) (boxes 0: hidden-but-present content, register which opener reveals it)` : '', '→', arg('--out', 'content.json'));
await b.close();
