#!/usr/bin/env node
// shift-probe.mjs — what a red photo band in the pixel diff is. The diff shows four causes the same way: a displacement, a scale
// (cover/contain or rendition size), another rendition, and paint over the picture (a veil, a gradient, an entrance caught mid-fade).
// This reads one region of the two captures and answers: the best translation of the build inside ±R px (score = mean |Δluminance|),
// with --scale the best build scale 0.90–1.10 at that shift, and ALWAYS the mean luminance of each side with their ratio — a ratio
// ≠ 1 with "no shift" names paint over the picture and its alpha (dentsu-home: a `::after rgba(0,0,0,.2)` at z −1 that deep-probe
// prints but that paints only below 900 px read as 1.25 at 1440 and 0.80 at 360; two gate rounds before the reading existed).
// usage: node shift-probe.mjs <live.png> <build.png> --x0 <px> --x1 <px> --y0 <px> --y1 <px> [--r 12] [--step 1] [--scale]
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
const [,, A, B] = process.argv; const a = (n, d) => { const i = process.argv.indexOf(n); return i === -1 ? d : Number(process.argv[i + 1]); };
if (!A || !B) { console.error('usage: shift-probe.mjs <live.png> <build.png> --x0 --x1 --y0 --y1 [--r 12] [--step 1] [--scale]'); process.exit(1); }
const L = PNG.sync.read(readFileSync(A)); const Bp = PNG.sync.read(readFileSync(B));
const x0 = a('--x0', 0), x1 = a('--x1', L.width), y0 = a('--y0', 0), y1 = a('--y1', Math.min(L.height, 900)), R = a('--r', 12), step = a('--step', 1);
const lum = (img, x, y) => { if (x < 0 || y < 0 || x >= img.width || y >= img.height) return null; const i = (y * img.width + x) * 4; return 0.299 * img.data[i] + 0.587 * img.data[i + 1] + 0.114 * img.data[i + 2]; };
const score = (dx, dy) => { let s = 0, n = 0; for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) { const l = lum(L, x, y); const b = lum(Bp, x + dx, y + dy); if (l === null || b === null) continue; s += Math.abs(l - b); n++; } return n ? s / n : Infinity; };
const mean = (img) => { let s = 0, n = 0; for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) { const l = lum(img, x, y); if (l === null) continue; s += l; n++; } return n ? s / n : NaN; };
const base = score(0, 0); let best = { dx: 0, dy: 0, s: base };
for (let dy = -R; dy <= R; dy += step) for (let dx = -R; dx <= R; dx += step) { const s = score(dx, dy); if (s < best.s) best = { dx, dy, s }; }
if (process.argv.includes('--scale')) {
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2; let bs = { k: 1, s: best.s };
  for (let k = 0.90; k <= 1.101; k += 0.01) { let sum = 0, n = 0; for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) { const l = lum(L, x, y); const b = lum(Bp, Math.round(cx + (x - cx) * k) + best.dx, Math.round(cy + (y - cy) * k) + best.dy); if (l === null || b === null) continue; sum += Math.abs(l - b); n++; } const sc = n ? sum / n : Infinity; if (sc < bs.s) bs = { k: Math.round(k * 100) / 100, s: sc }; }
  console.log(`scale search about (${cx},${cy}): best build scale ${bs.k} → ${bs.s.toFixed(2)}${bs.k !== 1 && bs.s < best.s * 0.7 ? '  (a scale: cover/contain or rendition size)' : ''}`);
}
const ml = mean(L), mb = mean(Bp); const ratio = ml / mb;
console.log(`region x ${x0}–${x1} y ${y0}–${y1}: at (0,0) mean |Δlum| ${base.toFixed(2)}; best shift build→live dx=${best.dx} dy=${best.dy} → ${best.s.toFixed(2)}${best.s < base * 0.5 ? '  (a displacement, not a rendition)' : best.s > base * 0.9 ? '  (no shift explains it: rendition / scale / paint over it)' : ''}`);
console.log(`luminance live ${ml.toFixed(1)} build ${mb.toFixed(1)} ratio ${ratio.toFixed(3)}${Math.abs(ratio - 1) > 0.05 ? `  (paint over the picture on the ${ratio < 1 ? 'live' : 'build'} side: a veil / gradient / fade state ≈ ${(Math.abs(1 - Math.min(ratio, 1 / ratio)) * 100).toFixed(0)} % darker)` : '  (same paint: a rendition or anti-aliasing)'}`);
