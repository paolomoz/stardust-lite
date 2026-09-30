#!/usr/bin/env node
// sections.mjs — section-height table: live spec (live-spec JSON) vs a build URL. Rows are paired by TEXT ANCHOR, not by index: the
// first heading/paragraph of each live section is located on the build and the build section containing it is the partner (several
// live sections can share one build section — authored sections are usually coarser than the source's). Falls back to index order
// for a live section without text.
// Usage: node sections.mjs <spec.json> <build-url> [--sections <css>] [--header <css>] [--footer <css>] [--consent <css>] [--dismiss <css,…>] [--locale <tag>]
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { arg, openPage, settle, overlayOpts } from './common.mjs';

const [,, specPath, url] = process.argv;
if (!specPath || !url) { console.error('usage: sections.mjs <spec.json> <build-url> [--sections <css>] [--header <css>] [--footer <css>]'); process.exit(1); }
const spec = JSON.parse(readFileSync(specPath, 'utf8'));
const sections = arg('--sections', 'main > .section'); const header = arg('--header', 'header'); const footer = arg('--footer', 'footer');
const anchorOf = (s) => s.items.find((it) => ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'li'].includes(it.k) && it.t && it.t.length >= 3); // h5/h6: a small section head is an h5 on Carbon sites (ibm-home)
const live = spec.secs.map((s) => { const a = anchorOf(s); return { box: s.box, id: s.id, anchor: a ? { t: a.t.slice(0, 28), box: a.box } : null }; });
const browser = await chromium.launch(); const page = await openPage(browser, url, { width: spec.W, height: spec.vh || 900, wait: 800, consent: arg('--consent', null), ...overlayOpts() });
await settle(page, 800, 50, 400);
const r = await page.evaluate(({ sections, header, footer, live }) => {
  const R = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y + scrollY), Math.round(b.width), Math.round(b.height)]; };
  const secs = [document.querySelector(header), ...document.querySelectorAll(sections), document.querySelector(footer)].filter(Boolean);
  const norm = (s) => s.replace(/\s+/g, ' ').trim().toLowerCase();
  const texts = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,a,span,strong,em,button,div')].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()); });
  const rows = live.map((l, i) => {
    let sec = null; let abox = null;
    if (l.anchor) {
      const lc = l.anchor.t.toLowerCase();
      // among the elements starting with the anchor text, the one nearest the live y (the same words recur in nav, cards and footer)
      const e = texts.filter((x) => norm(x.textContent).startsWith(lc)).sort((x, y) => Math.abs(x.getBoundingClientRect().top + scrollY - l.anchor.box[1]) - Math.abs(y.getBoundingClientRect().top + scrollY - l.anchor.box[1]) || x.textContent.length - y.textContent.length)[0];
      if (e) { sec = secs.find((s) => s.contains(e)) || null; abox = R(e); }
    }
    if (!sec) sec = secs[i] || null;
    return { idx: sec ? secs.indexOf(sec) : -1, box: R(sec), cls: sec ? (sec.className || sec.tagName).replace(/\bsection\b/, '').trim().slice(0, 40) : '', abox };
  });
  return { doc: document.documentElement.scrollHeight, count: secs.length, rows };
}, { sections, header, footer, live });
console.log(`doc height  live ${spec.doc}  build ${r.doc}  Δ ${r.doc - spec.doc}   (spec measured at vh ${spec.vh || '?'}; ${spec.secs.length} live sections → ${r.count} build sections, paired by first text anchor)`);
console.log('idx  live y      h   | build#  y      h   | anchor Δy | anchor live → build | section');
const shared = {}; r.rows.forEach((t) => { if (t.idx >= 0) shared[t.idx] = (shared[t.idx] || 0) + 1; });
live.forEach((s, i) => {
  const t = r.rows[i]; const dy = t.abox && s.anchor ? t.abox[1] - s.anchor.box[1] : null;
  console.log(String(i).padStart(2), String(s.box[1]).padStart(6), String(s.box[3]).padStart(6), ' |', t.box ? `${String(t.idx).padStart(3)}${shared[t.idx] > 1 ? '*' : ' '}` : '  - ', t.box ? String(t.box[1]).padStart(6) : '   -  ', t.box ? String(t.box[3]).padStart(6) : '   -  ', ' |', dy === null ? '    -' : String(dy).padStart(5), '    |', s.anchor ? `"${s.anchor.t.slice(0, 20)}" ${JSON.stringify(s.anchor.box)}` : '-', '→', t.abox ? JSON.stringify(t.abox) : (s.anchor ? 'NOT FOUND' : '-'), '|', t.cls);
});
const groups = Object.entries(shared).filter(([, n]) => n > 1);
if (groups.length) console.log(`* build sections holding several live sections: ${groups.map(([k, n]) => `#${k} (${n})`).join(', ')} — compare their summed live heights with the build height`);
groups.forEach(([k]) => { const rows = live.filter((s, i) => r.rows[i].idx === Number(k)); const sum = rows.reduce((a, s) => a + s.box[3], 0); const first = rows[0]; const last = rows[rows.length - 1]; const span = last.box[1] + last.box[3] - first.box[1]; const b = r.rows.find((t) => t.idx === Number(k)).box; console.log(`  build #${k}: h ${b[3]}  vs live span ${span} (sections summed ${sum})  Δ ${b[3] - span}`); });
await browser.close();
