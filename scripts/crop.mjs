#!/usr/bin/env node
// crop.mjs — crop a y-range out of a stitched PNG, optionally downscaled, to look at one band of a 12,000 px capture.
// Usage: node crop.mjs <in.png> <out.png> <y0> <y1> [scale]
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const [,, inp, outp, y0s, y1s, sc] = process.argv;
if (!inp || !outp || !y0s || !y1s) { console.error('usage: crop.mjs <in.png> <out.png> <y0> <y1> [scale]'); process.exit(1); }
const y0 = +y0s; const y1 = +y1s; const scale = +(sc || 1);
const src = PNG.sync.read(readFileSync(inp)); const h = Math.min(y1, src.height) - y0; const W = Math.round(src.width / scale); const H = Math.round(h / scale);
const dst = new PNG({ width: W, height: H });
for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) { const si = ((Math.min(src.height - 1, y0 + Math.floor(y * scale))) * src.width + Math.floor(x * scale)) * 4; const di = (y * W + x) * 4; dst.data[di] = src.data[si]; dst.data[di + 1] = src.data[si + 1]; dst.data[di + 2] = src.data[si + 2]; dst.data[di + 3] = 255; }
writeFileSync(outp, PNG.sync.write(dst)); console.log(outp, W, H);
