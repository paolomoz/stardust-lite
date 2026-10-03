#!/usr/bin/env node
// live-spec.mjs — per-node measurement of a page at one width (step 1 of BLOCKS-FIRST-PROTOTYPING.md).
// Per top-level section: box, padding, margin (a 0-height section is spacing: flagged in the table), paint (bg, image, radius, border,
// shadow, transform); per text node: font family/size/
// line-height/weight/letter-spacing/transform/align/colour/style/decoration + box + text + href; per image/video/svg/canvas: box, fit, src.
// Also writes the captured DOM. Usage:
//   node live-spec.mjs <url> <W> --out <dir> [--sections <css>] [--header <css>] [--footer <css>] [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--require <css,…>] [--vh 900]
// Every run is ONE session: on a page with session-variable composition pass --require (markers of the composition the origin was
// captured in) so the three width specs describe the same page; a mismatching session exits 4.
// Default sections: `main > .section` (EDS) — for a source page pass its section selector, e.g. --sections '.section-wrapper > section'.
// An item read inside an ENTRANCE STATE (an ancestor at a non-zero translate or opacity 0 — AOS / "animate once" libraries re-arm every
// element that leaves the viewport, so a settled read at scrollY 0 holds the tiles at translateY(−100px)) carries `ent` (dx, dy, opacity)
// and `rest` (the box with the translate removed); the summary counts them. One gate round and a wrong section rule came from the
// translated boxes read as positions (marriottvacationsworldwide-home). `pair` and `sections` compare at `rest`.
import { writeFileSync, mkdirSync } from 'node:fs';
import { arg, openPage, settle, overlayOpts, launch } from './common.mjs';
import { collectSpec } from './lib/spec-collector.mjs'; // the in-page reading (shared with measure-page)

const [,, url, wArg] = process.argv;
if (!url || !wArg) { console.error('usage: live-spec.mjs <url> <W> --out <dir> [--sections <css>] [--header <css>] [--footer <css>] [--consent <css>]'); process.exit(1); }
const W = Number(wArg); const out = arg('--out', '.'); const vh = Number(arg('--vh', 900));
const sections = arg('--sections', 'main > .section'); const header = arg('--header', 'header'); const footer = arg('--footer', 'footer');
const browser = await launch();
const page = await openPage(browser, url, { width: W, height: vh, ...overlayOpts() });
await settle(page);
const spec = await page.evaluate(collectSpec, { sections, header, footer });
mkdirSync(out, { recursive: true });
const { html, ...rest } = spec;
writeFileSync(`${out}/spec-${W}.json`, JSON.stringify(rest, null, 1));
writeFileSync(`${out}/dom-${W}.html`, html);
console.log(`W ${rest.W} vh ${rest.vh} doc ${rest.doc} sections ${rest.secs.length} bodyBg ${rest.bodyBg}`);
// a 0-height live section is a spacing measurement (a `margin-top-small` container: 32 px of margin, 0 px tall), not an empty row to skip —
// write it down with the section it precedes, per width (usta2-home; the same container collapses to 0 above its cap)
rest.secs.forEach((s, i) => console.log(String(i).padStart(2), s.id.slice(0, 48).padEnd(48), JSON.stringify(s.box).padEnd(22), s.pad, s.bg || '', s.items.length, 'items', s.box[3] === 0 ? `  ← 0-height: spacing, margin ${s.mar}` : ''));
console.log('fonts:', rest.fonts.join(' | '));
const lines = rest.secs.reduce((n, s) => n + s.items.filter((it) => it.lines).length, 0);
if (lines) console.log(`line-split paragraphs merged: ${lines} (a text-reveal library's one-element-per-line; \`lines\` on the item)`);
// a box read while its entrance transition runs is 6–17 px off (audemarspiguet-home): settle waits the finite animations out; what still runs loops
if (rest.running) console.log(`animations still running at read time: ${rest.running} (infinite ones; a box inside one is a state, not a measurement)`);
// an entrance state is not a position: the box is where the library parked the element, the capture shows it at rest (the section
// rule derived from the −100 px boxes cost a 14.6 % gate round — marriottvacationsworldwide-home)
const ent = rest.secs.flatMap((s) => s.items.filter((it) => it.ent)); const ways = [...new Set(ent.map((it) => `${it.ent.on} dx=${it.ent.dx} dy=${it.ent.dy} op=${it.ent.op}`))];
if (ent.length) console.log(`items read inside an entrance state or an invisible ancestor: ${ent.length} (${ways.slice(0, 4).join('; ')}${ways.length > 4 ? '; …' : ''}) — \`box\` is the parked position, \`rest\` the position without the translate; read the container and the capture, never a section rule from \`box\``);
await browser.close();
