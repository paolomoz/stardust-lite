#!/usr/bin/env node
// gate.mjs — the three-width gate for one live/build pair without a stardust state.json (step 6/7). Drives the installed stardust
// replica scripts: stitch-shot (--settle on BOTH sides; the origin is captured once and cached), pixel-compare, cap-probe compare;
// optionally motion-observe on both sides + motion-compare with a probes file. Prints the three-width table.
// Usage: node gate.mjs --live <url> --build <url> --out <dir> [--widths 360,1440,2560] [--consent <css>] [--main <css>] [--build-main main]
//        [--probes <file>] [--recapture-origin] [--band 450] [--top 120]
//   <probes file>: one line per probe: `hover <live-sel> => <build-sel>` or `click <live-sel> => <build-sel>` (same order both sides).
//   Between CSS rounds run `--widths <base>` only; the three widths + probes once the section table and the pairing are clean.
//   Every width also writes `diff-<W>-top.png`, the first --top px of the diff (the header band hides a displaced bar in a 1 % number).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { join } from 'node:path';
import { arg, stardustScripts } from './common.mjs';

const live = arg('--live'); const build = arg('--build'); const out = arg('--out');
if (!live || !build || !out) { console.error('usage: gate.mjs --live <url> --build <url> --out <dir> [--widths 360,1440,2560] [--consent <css>] [--probes <file>]'); process.exit(1); }
const widths = String(arg('--widths', '360,1440,2560')).split(',').map(Number); const consent = arg('--consent', null); const band = Number(arg('--band', 450));
const S = stardustScripts(); mkdirSync(out, { recursive: true });
const run = (args, quiet) => { const r = spawnSync('node', args, { encoding: 'utf8' }); if (!quiet) process.stdout.write(r.stdout.split('\n').slice(-3).join('\n') + '\n'); if (r.stderr && r.status) process.stderr.write(r.stderr.slice(-400)); return r; };
const rows = [];
for (const W of widths) {
  const origin = join(out, `live-${W}.png`); const eds = join(out, `build-${W}.png`);
  if (!existsSync(origin) || arg('--recapture-origin', false)) { console.log(`origin ${W}…`); run([join(S, 'stitch-shot.mjs'), live, origin, '--width', String(W), '--settle', ...(consent ? ['--consent', consent] : [])]); }
  console.log(`build ${W}…`); run([join(S, 'stitch-shot.mjs'), build, eds, '--width', String(W), '--settle']);
  const px = run([join(S, 'pixel-compare.mjs'), origin, eds, '--out', join(out, `diff-${W}.png`), '--band', String(W === 360 ? 900 : band), '--json'], true);
  try { const j = JSON.parse(px.stdout.slice(px.stdout.indexOf('{'))); writeFileSync(join(out, `pixel-${W}.json`), JSON.stringify(j, null, 1)); rows.push({ W, pct: j.pct, dh: j.heightDelta, bands: j.bands.map((b) => `${b.y0}:${b.pct}`).join(' ') }); } catch { rows.push({ W, pct: 'ERR', dh: '', bands: px.stdout.slice(-200) }); }
  try { // the top band of the diff as its own file: look at the chrome, do not read it as a number
    const src = PNG.sync.read(readFileSync(join(out, `diff-${W}.png`))); const H = Math.min(Number(arg('--top', 120)), src.height); const dst = new PNG({ width: src.width, height: H });
    src.data.copy(dst.data, 0, 0, src.width * H * 4); writeFileSync(join(out, `diff-${W}-top.png`), PNG.sync.write(dst));
  } catch { /* diff image missing */ }
}
const probe = widths.includes(2560) ? 2560 : Math.max(...widths);
console.log('cap-probe…'); const cap = run([join(S, 'cap-probe.mjs'), live, '--against', build, '--build-main', arg('--build-main', 'main'), ...(arg('--main', null) ? ['--main', arg('--main')] : []), ...(consent ? ['--consent', consent] : []), '--out', join(out, 'cap.json')], true);
const capLine = (cap.stdout.match(/cap-probe: .*/) || ['cap-probe: (no verdict line)'])[0];
let motionLine = '';
if (arg('--probes', null)) {
  const lines = readFileSync(arg('--probes'), 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  const side = (i) => lines.flatMap((l) => { const m = l.match(/^(hover|click)\s+(.+?)\s*=>\s*(.+)$/); return m ? [`--${m[1]}`, m[i]] : []; });
  console.log('motion live…'); run([join(S, 'motion-observe.mjs'), live, join(out, 'motion-live.json'), '--width', '1440', ...(consent ? ['--consent', consent] : []), ...side(2)], true);
  console.log('motion build…'); run([join(S, 'motion-observe.mjs'), build, join(out, 'motion-build.json'), '--width', '1440', ...side(3)], true);
  const mc = run([join(S, 'motion-compare.mjs'), join(out, 'motion-live.json'), join(out, 'motion-build.json'), '--json', join(out, 'motion-compare.json')], true);
  writeFileSync(join(out, 'motion-compare.txt'), mc.stdout); motionLine = (mc.stdout.match(/motion summary: .*/) || [''])[0];
}
console.log('\n| width | pixel % | Δh | bands |\n|---|---|---|---|');
rows.forEach((r) => console.log(`| ${r.W} | ${r.pct} | ${r.dh} | ${r.bands} |`));
console.log(`\n${capLine}${motionLine ? `\n${motionLine}` : ''}\nevidence: ${out}/`);
