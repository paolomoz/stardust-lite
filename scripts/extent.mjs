#!/usr/bin/env node
// extent.mjs — the PAINTED extent of something inside a region of a capture (or the opaque bbox of a PNG asset): the bounding box of
// the pixels that match a colour (±tol), that are opaque (--alpha), or that differ from the region's background (default — the
// background is the region's top-left pixel). A computed value is not an extent: a responsive `background-size` read 160 px on a
// neighbouring element while the capture painted 120 px, and a logo drawn `cover` filled its box while the live one sat at 160 px in a
// 260 px tile — `shift-probe` gives shift / scale / luminance, `crop --vs` a picture, neither a size (marriottvacationsworldwide-home,
// one round each). --px prints single pixels. Pairs with shift-probe: same region arguments.
// usage: node extent.mjs <png> [--x0 --x1 --y0 --y1] [--color r,g,b [--tol 40] | --alpha [16] | --not r,g,b [--tol 40]] | --px x,y[,x,y…]
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
const [,, A] = process.argv; const a = (n, d) => { const i = process.argv.indexOf(n); return i === -1 ? d : process.argv[i + 1]; };
if (!A) { console.error('usage: extent.mjs <png> [--x0 --x1 --y0 --y1] [--color r,g,b [--tol 40] | --alpha [16] | --not r,g,b [--tol 40]] | --px x,y,…'); process.exit(1); }
const img = PNG.sync.read(readFileSync(A)); const px = (x, y) => { const i = (y * img.width + x) * 4; return [img.data[i], img.data[i + 1], img.data[i + 2], img.data[i + 3]]; };
if (a('--px', null)) { const v = a('--px').split(',').map(Number); for (let i = 0; i + 1 < v.length; i += 2) console.log(`(${v[i]},${v[i + 1]}) rgba(${px(v[i], v[i + 1]).join(',')})`); process.exit(0); }
const x0 = Number(a('--x0', 0)), x1 = Number(a('--x1', img.width)), y0 = Number(a('--y0', 0)), y1 = Number(a('--y1', img.height)); const tol = Number(a('--tol', 40));
const dist = (p, q) => Math.max(Math.abs(p[0] - q[0]), Math.abs(p[1] - q[1]), Math.abs(p[2] - q[2]));
const rgb = (s) => s.split(',').map(Number);
let kind, hit;
if (a('--color', null)) { const c = rgb(a('--color')); kind = `colour ${c.join(',')} ±${tol}`; hit = (p) => dist(p, c) <= tol; }
else if (process.argv.includes('--alpha')) { const t = Number(a('--alpha', 16)) || 16; kind = `alpha > ${t}`; hit = (p) => p[3] > t; }
else { const bg = a("--not", null) ? rgb(a("--not")) : px(x0, y0).slice(0, 3); kind = `not the background rgb(${bg.join(',')}) ±${tol}`; hit = (p) => p[3] > 16 && dist(p, bg) > tol; }
let bx0 = Infinity, by0 = Infinity, bx1 = -1, by1 = -1, n = 0;
for (let y = y0; y < Math.min(y1, img.height); y += 1) for (let x = x0; x < Math.min(x1, img.width); x += 1) if (hit(px(x, y))) { n += 1; if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y; }
if (!n) { console.log(`region x ${x0}–${x1} y ${y0}–${y1}: ${kind}: nothing painted`); process.exit(0); }
console.log(`region x ${x0}–${x1} y ${y0}–${y1}: ${kind}: bbox x ${bx0}–${bx1 + 1} y ${by0}–${by1 + 1} → ${bx1 - bx0 + 1}×${by1 - by0 + 1} px (${n} px hit; centre ${((bx0 + bx1 + 1) / 2).toFixed(1)},${((by0 + by1 + 1) / 2).toFixed(1)})`);
