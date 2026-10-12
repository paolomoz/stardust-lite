#!/usr/bin/env node
// media-list.mjs — composed-tree inventory of a live page's media and fonts: every img (currentSrc, srcset, natural size, box, alt,
// fit), video (currentSrc, poster, autoplay/loop/muted, box), CSS background-image (element, box, url), inline svg, every @font-face
// (document and shadow-root sheets) and the font files actually requested. Also the body/html overflow before and after the
// overlays (a scroll lock left behind). The list is what gets downloaded byte-for-byte and uploaded to the draft media folder.
// Written for ibm-home, reused by walgreens-home.
// Usage: node media-list.mjs <url> [W] [--out file.json] [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--require <css,…>]
import { writeFileSync } from 'node:fs';
import { openPage, settle, arg, overlayOpts, launch } from './common.mjs';
import { collectMedia, fontResponse } from './lib/probe-collectors.mjs'; // the in-page inventory + the font-request test (shared with measure-page)

const url = process.argv[2]; const W = Number(process.argv[3] || 1440);
if (!url) { console.error('usage: media-list.mjs <url> [W] [--out file.json] [--consent <css>] [--dismiss <css,…>]'); process.exit(1); }
const fontReqs = []; let lockBefore = '';
const b = await launch();
const p = await openPage(b, url, { width: W, ...overlayOpts(), wait: 4000, before: (page) => {
  page.on('response', (r) => { const u = fontResponse(r); if (u) fontReqs.push(u); });
  page.on('domcontentloaded', async () => { lockBefore = await page.evaluate(() => `${getComputedStyle(document.body).overflow}/${getComputedStyle(document.documentElement).overflow}`).catch(() => ''); });
} });
await settle(p, 500, 150, 2000);
const out = await p.evaluate(collectMedia);
out.lockBefore = lockBefore; out.fontRequests = [...new Set(fontReqs)];
if (arg('--out', null)) writeFileSync(arg('--out'), JSON.stringify(out, null, 1));
console.log(`doc ${out.doc} imgs ${out.imgs.length} videos ${out.videos.length} bgs ${out.bgs.length} svgs ${out.svgs.length} faces ${out.faces.length} lock before/after ${out.lockBefore} → ${out.lock}`);
out.imgs.forEach((i) => console.log('IMG', JSON.stringify(i.box), i.nat.join('x'), i.fit, i.src.slice(0, 160), '|', i.alt.slice(0, 40), '|', i.path.slice(-90)));
out.videos.forEach((v) => console.log('VIDEO', JSON.stringify(v)));
out.bgs.forEach((g) => console.log('BG', JSON.stringify(g.box), g.bgi.slice(0, 160), '|', g.path.slice(-100)));
console.log('fonts loaded:', out.loaded.join(' | ')); console.log('body font:', out.bodyFont); out.faces.forEach((f) => console.log('FACE', f)); out.fontRequests.forEach((f) => console.log('FONTREQ', f));
await b.close();
