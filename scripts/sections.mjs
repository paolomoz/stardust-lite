#!/usr/bin/env node
// sections.mjs — section-height table: live spec (live-spec JSON) vs a build URL, one row per top-level section.
// Usage: node sections.mjs <spec.json> <build-url> [--sections <css>] [--header <css>] [--footer <css>]
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { arg, openPage, settle } from './common.mjs';

const [,, specPath, url] = process.argv;
if (!specPath || !url) { console.error('usage: sections.mjs <spec.json> <build-url> [--sections <css>] [--header <css>] [--footer <css>]'); process.exit(1); }
const spec = JSON.parse(readFileSync(specPath, 'utf8'));
const sections = arg('--sections', 'main > .section'); const header = arg('--header', 'header'); const footer = arg('--footer', 'footer');
const browser = await chromium.launch(); const page = await openPage(browser, url, { width: spec.W, height: spec.vh || 900, wait: 800 });
await settle(page, 800, 50, 400);
const r = await page.evaluate(({ sections, header, footer }) => {
  const R = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y + scrollY), Math.round(b.width), Math.round(b.height)]; };
  const els = [document.querySelector(header), ...document.querySelectorAll(sections), document.querySelector(footer)].filter(Boolean);
  return { doc: document.documentElement.scrollHeight, secs: els.map((s) => ({ cls: (s.className || s.tagName).replace(/\bsection\b/, '').trim().slice(0, 40), box: R(s), h: R(s.querySelector('h1,h2')), hTxt: (s.querySelector('h1,h2') || {}).textContent?.trim().slice(0, 24) })) };
}, { sections, header, footer });
console.log(`doc height  live ${spec.doc}  build ${r.doc}  Δ ${r.doc - spec.doc}   (spec measured at vh ${spec.vh || '?'})`);
console.log('idx  live y      h   | build y      h   | Δy    Δh   | first heading live → build | section');
spec.secs.forEach((s, i) => {
  const t = r.secs[i]; const lh = s.items.find((it) => it.k === 'h1' || it.k === 'h2');
  console.log(String(i).padStart(2), String(s.box[1]).padStart(6), String(s.box[3]).padStart(6), ' |', t ? String(t.box[1]).padStart(6) : '   -  ', t ? String(t.box[3]).padStart(6) : '   -  ', ' |', t ? String(t.box[1] - s.box[1]).padStart(5) : '', t ? String(t.box[3] - s.box[3]).padStart(5) : '', ' |', lh ? JSON.stringify(lh.box) : '-', '→', t && t.h ? JSON.stringify(t.h) : '-', '|', t ? t.cls : '', (lh ? lh.t : '').slice(0, 20));
});
if (r.secs.length !== spec.secs.length) console.log(`section count differs: live ${spec.secs.length} build ${r.secs.length}`);
await browser.close();
