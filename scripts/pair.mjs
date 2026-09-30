#!/usr/bin/env node
// pair.mjs — text-anchored pairing: every heading/paragraph/link start in the live spec located on the build; box + font + colour deltas.
// Usage: node pair.mjs <spec.json> <build-url> [--max 120] [--filter <regex>] [--all]   (--all also prints rows within tolerance)
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { arg, openPage, settle } from './common.mjs';

const [,, specPath, url] = process.argv;
if (!specPath || !url) { console.error('usage: pair.mjs <spec.json> <build-url> [--max 120] [--filter <regex>] [--all]'); process.exit(1); }
const spec = JSON.parse(readFileSync(specPath, 'utf8')); const MAX = Number(arg('--max', 120)); const filter = arg('--filter', null) ? new RegExp(arg('--filter')) : null; const all = arg('--all', false);
const anchors = []; const seen = new Set();
for (const s of spec.secs) for (const it of s.items) {
  if (!['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'span', 'button', 'li', 'div'].includes(it.k)) continue;
  if (!it.t || it.t.length < 3 || it.box[0] >= spec.W) continue;
  const key = it.t.slice(0, 28); if (seen.has(key)) continue; if (filter && !filter.test(it.t)) continue;
  seen.add(key); anchors.push({ t: key, box: it.box, fs: it.fs, lh: it.lh, fw: it.fw, ff: it.ff, c: it.c });
}
const browser = await chromium.launch(); const page = await openPage(browser, url, { width: spec.W, height: spec.vh || 900, wait: 800 });
await settle(page, 800, 50, 400);
const out = await page.evaluate((anchors) => {
  const R = (e) => { const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y + scrollY), Math.round(b.width), Math.round(b.height)]; };
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const all = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,li,button,em,strong,div')].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()); });
  return anchors.map((a) => {
    const lc = a.t.toLowerCase();
    const cands = all.filter((e) => norm(e.textContent).toLowerCase().startsWith(lc) || norm([...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ')).toLowerCase().startsWith(lc));
    const e = cands.sort((x, y) => x.textContent.length - y.textContent.length)[0]; if (!e) return null;
    const s = getComputedStyle(e); return { box: R(e), fs: s.fontSize, lh: s.lineHeight, fw: s.fontWeight, ff: s.fontFamily.split(',')[0].replace(/"/g, ''), c: s.color };
  });
}, anchors);
console.log('anchor'.padEnd(30), 'live box'.padEnd(22), 'build box'.padEnd(22), 'Δx  Δy  Δw  Δh | font live → build');
let n = 0;
anchors.forEach((a, i) => {
  if (n >= MAX) return; const o = out[i];
  const d = o ? [o.box[0] - a.box[0], o.box[1] - a.box[1], o.box[2] - a.box[2], o.box[3] - a.box[3]] : null;
  const hot = !o || Math.abs(d[0]) > 3 || Math.abs(d[3]) > 3 || a.fs !== o.fs || a.fw !== o.fw || a.c !== o.c;
  if (!all && !hot) return; n += 1;
  const f = o ? `${a.fs}/${a.lh} ${a.fw} ${a.ff.slice(0, 7)} → ${o.fs}/${o.lh} ${o.fw} ${o.ff.slice(0, 7)}${a.c !== o.c ? ` COLOR ${a.c}→${o.c}` : ''}` : '';
  console.log(a.t.padEnd(30), JSON.stringify(a.box).padEnd(22), (o ? JSON.stringify(o.box) : '-').padEnd(22), o ? d.map((v) => String(v).padStart(4)).join('') : ' MISSING', '|', f);
});
console.log(`${anchors.length} anchors, ${out.filter(Boolean).length} located${all ? '' : ` (rows within 3 px and same font hidden; --all shows them)`}`);
await browser.close();
