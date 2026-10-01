#!/usr/bin/env node
// sbs-crop.mjs — the same x/y window out of two captures, side by side at 1:1 (crop.mjs cuts y bands of one image only;
// a photo tile that reads red in the diff needs its live and build pixels next to each other to see rendition vs crop vs veil).
// usage: node sbs-crop.mjs <live.png> <build.png> <out.png> --x0 <px> --x1 <px> --y0 <px> --y1 <px>
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
const [,, A, B, out] = process.argv; const a = (n, d) => { const i = process.argv.indexOf(n); return i === -1 ? d : Number(process.argv[i + 1]); };
if (!A || !B || !out) { console.error('usage: sbs-crop.mjs <live.png> <build.png> <out.png> --x0 --x1 --y0 --y1'); process.exit(1); }
const L = PNG.sync.read(readFileSync(A)); const R = PNG.sync.read(readFileSync(B));
const x0 = a('--x0', 0), x1 = a('--x1', Math.min(L.width, R.width)), y0 = a('--y0', 0), y1 = a('--y1', 900); const w = x1 - x0, h = y1 - y0, gap = 10;
const o = new PNG({ width: w * 2 + gap, height: h });
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) for (const [img, ox] of [[L, 0], [R, w + gap]]) {
  const sx = x + x0, sy = y + y0; const di = (y * o.width + x + ox) * 4;
  if (sx >= img.width || sy >= img.height) { o.data[di + 3] = 255; continue; }
  const si = (sy * img.width + sx) * 4; o.data[di] = img.data[si]; o.data[di + 1] = img.data[si + 1]; o.data[di + 2] = img.data[si + 2]; o.data[di + 3] = 255;
}
for (let y = 0; y < h; y++) for (let x = w; x < w + gap; x++) { const di = (y * o.width + x) * 4; o.data[di] = 255; o.data[di + 1] = 0; o.data[di + 2] = 255; o.data[di + 3] = 255; }
writeFileSync(out, PNG.sync.write(o)); console.log(`${out} ${o.width}x${o.height} (live | build), window x ${x0}–${x1} y ${y0}–${y1}`);
