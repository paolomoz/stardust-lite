#!/usr/bin/env node
// outline.mjs — a section's content as words for Jev (exp/jev): per section of the dump split, its leaves in reading order with the
// geometry Jev cannot read from numbers turned into words (left / centre / right third, in view or past the viewport, wide / narrow),
// and a line on how the repeated units sit (side by side in one row, wrapping into rows, past the viewport). Keyed by anchor text.
// Usage: node outline.mjs <content-1440.json> > outlines.json
import { readFileSync } from 'node:fs';
import { splitSections, fingerprint } from '../../scripts/lib/fingerprint.mjs';

const dump = JSON.parse(readFileSync(process.argv[2], 'utf8')); const W = 1440;
const sp = splitSections(dump, {});
const third = (b) => { const c = b[0] + b[2] / 2; return c < W / 3 ? 'left' : c < (2 * W) / 3 ? 'centre' : 'right'; };
const width = (b) => (b[2] >= W * 0.8 ? 'full-width' : b[2] >= W * 0.45 ? 'half-width' : b[2] >= W * 0.25 ? 'a third wide' : 'narrow');
const out = {};
for (const n of sp.sections) {
  const fp = fingerprint(n); const leaves = [];
  const walk = (x) => { if (!x) return; const t = String(x.tag || '').toLowerCase(); const b = x.box;
    if (b && (x.text || /^(img|picture|video|svg)$/.test(t))) {
      const where = b[0] >= W || b[0] + b[2] <= 0 ? 'past the viewport' : `${third(b)}, ${width(b)}`;
      leaves.push(/^(img|picture|video|svg)$/.test(t) ? `[${t === 'video' ? 'video' : 'picture'} — ${where}]` : `${t}: “${String(x.text).replace(/\s+/g, ' ').slice(0, 60)}” — ${where}`);
    }
    for (const c of x.children || []) walk(c); };
  walk(n);
  // how the units sit: tops shared by several pictures / headings = a row of units
  const media = []; const grab = (x) => { if (!x) return; if (/^(img|picture|video)$/i.test(String(x.tag || '')) && x.box && x.box[2] > 80) media.push(x.box); (x.children || []).forEach(grab); }; grab(n);
  const rowsOf = new Map(); for (const b of media) { const k = Math.round(b[1] / 20); rowsOf.set(k, (rowsOf.get(k) || 0) + 1); }
  const maxRow = Math.max(0, ...rowsOf.values()); const past = media.filter((b) => b[0] >= W || b[0] + b[2] <= 0).length;
  const layout = media.length < 2 ? 'no repeated pictures' : past ? `${media.length} pictures, ${past} of them past the viewport (a row running off-screen)` : maxRow >= 2 ? `${media.length} pictures, up to ${maxRow} side by side in one row, ${rowsOf.size} row(s)` : `${media.length} pictures stacked one per row`;
  out[fp.anchorText || ''] = { layout, outline: leaves.slice(0, 30) };
}
console.log(JSON.stringify(out));
