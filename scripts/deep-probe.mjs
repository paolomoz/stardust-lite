#!/usr/bin/env node
// deep-probe.mjs — rect + paint of named selectors INCLUDING ::before/::after (box-shadow, borders, pseudo paint, radius, transforms):
// the paint tier live-spec does not read. Run it on the live page and on the prototype with the same list; curved edges, underlines and
// elevation shadows that exist only as pseudo-elements show up here and nowhere else. Up to 3 matches per selector. A selector may
// contain ` >> ` to descend into a shadow root (`c4d-card-group-item >> div.cds--tile`): web-component origins paint inside shadow
// roots, where light-DOM selectors read nothing (ibm-home).
// Usage: node deep-probe.mjs <url> <W> --sels <file-one-selector-per-line | css,css,…> [--children] [--props <p1,p2,…>] [--anim] [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--vh 900] [--max 3]
//   --children also prints each match's child rects; a `# ` line in the file is a comment, `#id` is a selector.
//   --props names computed properties outside the fixed set (`min-height,flex,background-size,object-fit,letter-spacing`…) — flex bases,
//   fixed heights and background-size were read with a case script until dentsu-home; --anim prints each match's running animations with
//   their keyframes (`getAnimations()` + `effect.getKeyframes()`; stitch-shot pauses them, so the 0 % frame is the capture state).
import { existsSync, readFileSync } from 'node:fs';
import { arg, openPage, settle, overlayOpts, DEEP_HELPERS, launch } from './common.mjs';
import { deepProbe } from './lib/probe-collectors.mjs'; // the in-page reading (shared with measure-page)

const [,, url, wArg] = process.argv; const selsFile = arg('--sels');
if (!url || !wArg || !selsFile) { console.error('usage: deep-probe.mjs <url> <W> --sels <file | css,css,…> [--children] [--props <p1,p2,…>] [--anim] [--consent <css>] [--vh 900] [--max 3]'); process.exit(1); }
const W = Number(wArg); const MAX = Number(arg('--max', 3));
// a comment line is `# …` or `//…`; `#id` is a selector (it was read as a comment — usta2-home)
// `--sels` is a file (one per line) or, when no such file exists, an inline comma list — the list was opened as a filename
// (ENAMETOOLONG, then ENOENT — marriottvacationsworldwide-home); a selector with a comma inside goes in a file
const sels = (existsSync(selsFile) ? readFileSync(selsFile, 'utf8').split('\n') : String(selsFile).split(',')).map((s) => s.trim()).filter((s) => s && !/^(#\s|#$|\/\/)/.test(s));
const CHILDREN = arg('--children', false); const PROPS = String(arg('--props', '')).split(',').map((s) => s.trim()).filter(Boolean); const ANIM = Boolean(arg('--anim', false));
const browser = await launch(); const page = await openPage(browser, url, { width: W, height: Number(arg('--vh', 900)), ...overlayOpts() });
await settle(page, 600, 100, 1200);
const out = await page.evaluate(new Function('args', `${DEEP_HELPERS}
 return (${String(deepProbe)})(args);`), [sels, MAX, CHILDREN, PROPS, ANIM]);
console.log(out); await browser.close();
