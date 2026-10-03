#!/usr/bin/env node
// crop.mjs — crop a y-range out of a stitched PNG, optionally downscaled, to look at one band of a 12,000 px capture.
// Usage: node crop.mjs <in.png> <out.png> <y0> <y1> [scale] [--x0 <px> --x1 <px>] [--vs <other.png>]
//   --vs puts the same x/y window of a second capture (the build) next to the first at 1:1, a magenta gap between them: a photo band
//   that is red in the diff needs its live and build pixels side by side to tell a rendition from a crop, a veil or a natural-size cap
//   (dentsu-home: the promise picture's 960 px cap at 2560 and a tile's stitch seam were read here, no table named either).
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const argv = process.argv; const opt = (n, d) => { const i = argv.indexOf(n); return i === -1 ? d : argv[i + 1]; };
const pos = argv.slice(2).filter((a, i, all) => !a.startsWith('--') && !(i > 0 && all[i - 1].startsWith('--')));
const [inp, outp, y0s, y1s, sc] = pos;
if (!inp || !outp || !y0s || !y1s) { console.error('usage: crop.mjs <in.png> <out.png> <y0> <y1> [divisor] [--x0 <px> --x1 <px>] [--vs <other.png>]  (divisor: 2 halves the output, 1 = 1:1 — not a scale factor)'); process.exit(1); }
const y0 = +y0s; const y1 = +y1s; const scale = +(sc || 1); const vs = opt('--vs', null);
const src = PNG.sync.read(readFileSync(inp)); const x0 = +opt('--x0', 0); const x1 = +opt('--x1', src.width);
const h = Math.min(y1, src.height) - y0; const W = Math.round((x1 - x0) / scale); const H = Math.round(h / scale);
const copy = (img, dst, ox) => { for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) { const sx = x0 + Math.floor(x * scale), sy = y0 + Math.floor(y * scale); const di = (y * dst.width + x + ox) * 4; if (sx >= img.width || sy >= img.height) { dst.data[di + 3] = 255; continue; } const si = (sy * img.width + sx) * 4; dst.data[di] = img.data[si]; dst.data[di + 1] = img.data[si + 1]; dst.data[di + 2] = img.data[si + 2]; dst.data[di + 3] = 255; } };
const gap = vs ? 10 : 0; const dst = new PNG({ width: vs ? W * 2 + gap : W, height: H });
copy(src, dst, 0);
if (vs) { copy(PNG.sync.read(readFileSync(vs)), dst, W + gap); for (let y = 0; y < H; y += 1) for (let x = W; x < W + gap; x += 1) { const di = (y * dst.width + x) * 4; dst.data[di] = 255; dst.data[di + 1] = 0; dst.data[di + 2] = 255; dst.data[di + 3] = 255; } }
writeFileSync(outp, PNG.sync.write(dst)); console.log(outp, dst.width, dst.height, vs ? `(${inp} | ${vs}) window x ${x0}–${x1} y ${y0}–${y1}` : '');
