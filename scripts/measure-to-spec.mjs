#!/usr/bin/env node
// measure-to-spec.mjs — builds a live-spec-schema JSON (what sections.mjs / pair.mjs read) from one or more stardust
// `measure.mjs --json` files, for a bot-managed origin live-spec.mjs cannot open (measure.mjs has --headed; live-spec has not).
// Sections are the selectors passed with --sections (in document order, y-sorted); every measured match with text or an image is
// an item, keyed by the last tag token of its selector. Usage:
//   node measure-to-spec.mjs --width 1440 --out spec-1440.json --sections 'header,main .full-hero,…' measure-a.json [measure-b.json …]
import { readFileSync, writeFileSync } from 'node:fs';
import { arg } from './common.mjs';

const W = String(arg('--width', '1440')); const out = arg('--out'); const secSels = String(arg('--sections', '')).split(',').map((s) => s.trim()).filter(Boolean);
const files = process.argv.slice(2).filter((a, i, all) => a.endsWith('.json') && all[i - 1] !== '--out');
if (!out || !files.length || !secSels.length) { console.error('usage: measure-to-spec.mjs --width W --out spec.json --sections <css,…> <measure.json>…'); process.exit(1); }
const K = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'li', 'span', 'button', 'img', 'picture', 'input', 'label', 'em', 'strong', 'sup'];
const kindOf = (sel) => { const last = sel.split(/[\s>]+/).filter(Boolean).pop() || ''; const tag = last.replace(/[.:[#].*$/, ''); return K.includes(tag) ? tag : (/\bimg\b/.test(last) ? 'img' : 'div'); };
let root = null; const secs = []; const items = []; const seen = new Set();
for (const f of files) {
  const j = JSON.parse(readFileSync(f, 'utf8')); const url = Object.keys(j.pages)[0]; const pg = j.pages[url][W]; if (!pg) continue;
  root = root || j.root[url][W];
  for (const sel of secSels) { if (pg[sel]) pg[sel].forEach((m) => { if (m.visible === false || !m.rect.w) return; const key = `${m.rect.x},${m.rect.y},${m.rect.w},${m.rect.h}`; if (seen.has(`S${key}`)) return; seen.add(`S${key}`); secs.push({ id: `${sel}${m.of > 1 ? `[${m.index}]` : ''}`, box: [m.rect.x, m.rect.y, m.rect.w, m.rect.h], pad: m.props?.padding || '', bg: m.props?.backgroundColor, items: [] }); }); }
  for (const [sel, matches] of Object.entries(pg)) {
    if (!matches) continue;
    const k = kindOf(sel);
    matches.forEach((m) => {
      if (m.visible === false || !m.rect.w || !m.rect.h) return;
      const t = (m.text || '').replace(/…$/, '').trim();
      if (k !== 'img' && (!t || t.length < 3)) return;
      const key = `${k}|${m.rect.x},${m.rect.y},${m.rect.w},${m.rect.h}|${t.slice(0, 28)}`; if (seen.has(key)) return; seen.add(key);
      const p = m.props || {};
      items.push({ k, cls: sel.slice(0, 60), box: [m.rect.x, m.rect.y, m.rect.w, m.rect.h], t: t.slice(0, 200), ff: (p.fontFamily || '').split(',')[0].replace(/"/g, ''), fs: p.fontSize, fw: p.fontWeight, lh: p.lineHeight, ls: p.letterSpacing, tt: p.textTransform || 'none', ta: p.textAlign || 'start', c: p.color, fst: 'normal', td: 'none', src: m.img?.currentSrc, fit: p.objectFit });
    });
  }
}
secs.sort((a, b) => a.box[1] - b.box[1]);
// an item belongs to the innermost section whose box contains its top-left
for (const it of items) { let best = null; for (const s of secs) { const [x, y, w, h] = s.box; if (it.box[1] >= y && it.box[1] < y + h && it.box[0] >= x - 1 && it.box[0] < x + w) { if (!best || s.box[3] <= best.box[3]) best = s; } } if (best) best.items.push(it); }
secs.forEach((s) => s.items.sort((a, b) => a.box[1] - b.box[1] || a.box[0] - b.box[0]));
const spec = { url: 'https://www.fidelity.com/', W: Number(W), vh: 900, doc: root?.scrollHeight, body: '', bodyBg: '', fonts: [], secs };
writeFileSync(out, JSON.stringify(spec, null, 1));
console.log(`W ${W} doc ${spec.doc} sections ${secs.length} items ${items.length}`);
secs.forEach((s, i) => console.log(String(i).padStart(2), s.id.slice(0, 40).padEnd(40), JSON.stringify(s.box).padEnd(22), s.items.length, 'items'));
