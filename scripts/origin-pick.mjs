#!/usr/bin/env node
// origin-pick.mjs — captures the live page up to N times with stitch-shot and keeps the capture whose session-variable region
// (a y-range, e.g. a rotating hero) is closest to a reference capture (the build), so the cached origin holds the same variant the
// document fixes. Every other region is untouched: this picks a session state, it does not edit pixels.
// Usage: node origin-pick.mjs <url> <out.png> --ref <build.png> --y0 <px> --y1 <px> [--width 360] [--tries 6] [--accept 12]
//        [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--headed]
import { spawnSync } from 'node:child_process';
import { existsSync, copyFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { PNG } from 'pngjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { arg, overlayArgs, stardustScripts } from './common.mjs';

const [,, url, out] = process.argv; const ref = arg('--ref'); const y0 = Number(arg('--y0', 0)); const y1 = Number(arg('--y1', 900));
if (!url || !out || !ref) { console.error('usage: origin-pick.mjs <url> <out.png> --ref <build.png> --y0 <px> --y1 <px> [--width W] [--tries N] [--accept pct]'); process.exit(1); }
const W = String(arg('--width', 360)); const tries = Number(arg('--tries', 6)); const accept = Number(arg('--accept', 12)); const S = stardustScripts();
const crop = (file, dst) => { const p = PNG.sync.read(readFileSync(file)); const h = Math.min(y1, p.height) - y0; const o = new PNG({ width: p.width, height: h }); for (let y = 0; y < h; y += 1) for (let x = 0; x < p.width; x += 1) { const i = ((y0 + y) * p.width + x) * 4; const j = (y * p.width + x) * 4; o.data.set(p.data.subarray(i, i + 4), j); } writeFileSync(dst, PNG.sync.write(o)); };
crop(ref, '/tmp/origin-pick-ref.png');
let best = { pct: Infinity, file: null };
for (let t = 1; t <= tries; t += 1) {
  const tmp = `${out}.try${t}.png`;
  const r = spawnSync('node', [join(S, 'stitch-shot.mjs'), url, tmp, '--width', W, '--settle', ...(arg('--headed', false) ? ['--headed'] : []), ...overlayArgs()], { encoding: 'utf8' });
  if (!existsSync(tmp)) { console.log(`try ${t}: capture failed ${r.stderr.slice(-120)}`); continue; }
  crop(tmp, '/tmp/origin-pick-try.png');
  const c = spawnSync('node', [join(S, 'pixel-compare.mjs'), '/tmp/origin-pick-ref.png', '/tmp/origin-pick-try.png', '--out', '/tmp/origin-pick-diff.png', '--band', '9999', '--json'], { encoding: 'utf8' });
  let pct = NaN; try { pct = JSON.parse(c.stdout.slice(c.stdout.indexOf('{'))).pct; } catch { /* keep NaN */ }
  console.log(`try ${t}: region ${y0}–${y1} differs ${pct}% (page ${r.stdout.match(/\d+x\d+/)?.[0] || '?'})`);
  if (pct < best.pct) { if (best.file) unlinkSync(best.file); best = { pct, file: tmp }; } else unlinkSync(tmp);
  if (pct <= accept) break;
}
if (!best.file) { console.error('origin-pick: no capture'); process.exit(1); }
copyFileSync(best.file, out); unlinkSync(best.file);
console.log(`origin-pick: kept ${out} (region differs ${best.pct}%${best.pct <= accept ? '' : ' — above accept, best of the tries'})`);
