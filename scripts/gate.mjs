#!/usr/bin/env node
// gate.mjs — the three-width gate for one live/build pair without a stardust state.json (step 6/7). Drives the installed stardust
// replica scripts: stitch-shot (--settle on BOTH sides; the origin is captured once and cached), pixel-compare, cap-probe compare;
// optionally motion-observe on both sides + motion-compare with a probes file. Prints the three-width table.
// Usage: node gate.mjs --live <url> --build <url> --out <dir> [--widths 360,1440,2560] [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--main <css>] [--build-main main]
//        [--probes <file>] [--recapture-origin] [--origin <dir>] [--band 450] [--top 120]
//   --origin <dir>: reuse the cached `live-<W>.png` of another gate dir (the prototype's) — the origin is cached per --out dir, so a served
//   gate in its own dir recaptures the origin and compares against a new noise sample (dentsu-home); with --origin both gates share one.
//   <probes file>: one line per probe: `hover <live-sel> => <build-sel>` or `click <live-sel> => <build-sel>` (same order both sides).
//   --main <css>: the LIVE content root for cap-probe when the origin has no `main` (its body default read "1920 ×1 of 4 sections" and
//   every build FAILed; pinned to the content grid the same build PASSed 0 of 13 — usta2-home). --build-main defaults to `main`.
//   A click probe whose LIVE target is a link that navigates (`a[href]` to another document) destroys the live context and the whole
//   motion run ("Execution context was destroyed" — marriottvacationsworldwide-home): gate opens the live page once, drops those probes
//   with a warning and runs the rest (hover the item instead, or `click-state --hover`).
//   Between CSS rounds run `--widths <base>` only; the three widths + probes once the section table and the pairing are clean.
//   Every width also writes `diff-<W>-top.png`, the first --top px of the diff (the header band hides a displaced bar in a 1 % number).
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { arg, openPage, overlayOpts, overlayArgs, siteProfile, stardustScripts } from './common.mjs';

const live = arg('--live'); const build = arg('--build'); const out = arg('--out');
if (!live || !build || !out) { console.error('usage: gate.mjs --live <url> --build <url> --out <dir> [--widths 360,1440,2560] [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--main <live-content-root>] [--build-main main] [--probes <file>] [--origin <gate-dir>]'); process.exit(1); }
const widths = String(arg('--widths', '360,1440,2560')).split(',').map(Number); const band = Number(arg('--band', 450));
// overlays and locale reach the LIVE side of every capture tool (a geo modal or a marketing interstitial is not consent; a geo-redirecting
// origin captures another locale per run without the pin); without the flags they come from the site profile (`--site`, migration/site.json),
// as does the cap-probe `--main` root
const liveOpts = overlayArgs(); const liveMain = arg('--main', null) ?? siteProfile()?.cap?.mainSelector ?? null;
const S = stardustScripts(); mkdirSync(out, { recursive: true });
const run = (args, quiet) => { const r = spawnSync('node', args, { encoding: 'utf8' }); if (!quiet) process.stdout.write(r.stdout.split('\n').slice(-3).join('\n') + '\n'); if (r.stderr && r.status) process.stderr.write(r.stderr.slice(-400)); return r; };
const rows = [];
for (const W of widths) {
  const origin = join(out, `live-${W}.png`); const eds = join(out, `build-${W}.png`);
  const shared = arg('--origin', null) ? join(arg('--origin'), `live-${W}.png`) : null;
  if (shared && existsSync(shared) && !existsSync(origin) && !arg('--recapture-origin', false)) { console.log(`origin ${W} from ${shared}`); copyFileSync(shared, origin); }
  if (!existsSync(origin) || arg('--recapture-origin', false)) { console.log(`origin ${W}…`); run([join(S, 'stitch-shot.mjs'), live, origin, '--width', String(W), '--settle', ...liveOpts]); }
  console.log(`build ${W}…`); run([join(S, 'stitch-shot.mjs'), build, eds, '--width', String(W), '--settle']);
  const px = run([join(S, 'pixel-compare.mjs'), origin, eds, '--out', join(out, `diff-${W}.png`), '--band', String(W === 360 ? 900 : band), '--json'], true);
  try { const j = JSON.parse(px.stdout.slice(px.stdout.indexOf('{'))); writeFileSync(join(out, `pixel-${W}.json`), JSON.stringify(j, null, 1)); rows.push({ W, pct: j.pct, dh: j.heightDelta, bands: j.bands.map((b) => `${b.y0}:${b.pct}`).join(' ') }); } catch { rows.push({ W, pct: 'ERR', dh: '', bands: px.stdout.slice(-200) }); }
  try { // the top band of the diff as its own file: look at the chrome, do not read it as a number
    const src = PNG.sync.read(readFileSync(join(out, `diff-${W}.png`))); const H = Math.min(Number(arg('--top', 120)), src.height); const dst = new PNG({ width: src.width, height: H });
    src.data.copy(dst.data, 0, 0, src.width * H * 4); writeFileSync(join(out, `diff-${W}-top.png`), PNG.sync.write(dst));
  } catch { /* diff image missing */ }
}
const probe = widths.includes(2560) ? 2560 : Math.max(...widths);
console.log('cap-probe…'); const cap = run([join(S, 'cap-probe.mjs'), live, '--against', build, '--build-main', arg('--build-main', 'main'), ...(liveMain ? ['--main', liveMain] : []), ...liveOpts, '--out', join(out, 'cap.json')], true);
// the verdict AND the failing rows: "FAIL — 1 of 4 rows" without the row sent walgreens-home to run cap-probe --against by hand
const capLine = [(cap.stdout.match(/cap-probe: .*/) || ['cap-probe: (no verdict line)'])[0], ...cap.stdout.split('\n').filter((l) => /^\s*✗/.test(l))].join('\n');
let motionLine = '';
if (arg('--probes', null)) {
  const lines = readFileSync(arg('--probes'), 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  // CSS only: motion-observe resolves selectors with querySelector; a Playwright pseudo-class (`:visible`, `:has-text()`) costs a whole run (walgreens-home)
  const bad = lines.filter((l) => /:(visible|hidden|has-text|text|text-is|nth-match|is-visible)\b/.test(l)); if (bad.length) { console.error(`gate: probes are CSS selectors, not Playwright locators — use an id or :nth-of-type to reach the visible copy:\n  ${bad.join('\n  ')}`); process.exit(1); }
  const parsed = lines.map((l) => l.match(/^(hover|click)\s+(.+?)\s*=>\s*(.+)$/)).filter(Boolean);
  const clicks = parsed.filter((m) => m[1] === 'click').map((m) => m[2]);
  if (clicks.length) {
    const br = await chromium.launch(); const pg = await openPage(br, live, { width: 1440, ...overlayOpts() });
    const nav = await pg.evaluate((sels) => sels.filter((s) => { let e; try { e = document.querySelector(s); } catch { return false; } const a = e && e.closest('a[href]'); if (!a) return false; const h = a.getAttribute('href') || ''; return h && !h.startsWith('#') && !/^javascript:/i.test(h) && a.getAttribute('target') !== '_blank' && !(a.getAttribute('role') === 'button') && a.href.split('#')[0] !== location.href.split('#')[0]; }), clicks);
    await br.close();
    if (nav.length) { console.error(`gate: ${nav.length} click probe(s) target a link that navigates on the live side — dropped (the click destroys the live context and the motion run; hover the item or use click-state --hover):\n  ${nav.join('\n  ')}`); for (const m of parsed) if (m[1] === 'click' && nav.includes(m[2])) m.drop = true; }
  }
  const side = (i) => parsed.flatMap((m) => (m.drop ? [] : [`--${m[1]}`, m[i]]));
  console.log('motion live…'); run([join(S, 'motion-observe.mjs'), live, join(out, 'motion-live.json'), '--width', '1440', ...liveOpts, ...side(2)], true);
  console.log('motion build…'); run([join(S, 'motion-observe.mjs'), build, join(out, 'motion-build.json'), '--width', '1440', ...side(3)], true);
  const mc = run([join(S, 'motion-compare.mjs'), join(out, 'motion-live.json'), join(out, 'motion-build.json'), '--json', join(out, 'motion-compare.json')], true);
  writeFileSync(join(out, 'motion-compare.txt'), mc.stdout); motionLine = (mc.stdout.match(/motion summary: .*/) || [''])[0];
}
console.log('\n| width | pixel % | Δh | bands |\n|---|---|---|---|');
rows.forEach((r) => console.log(`| ${r.W} | ${r.pct} | ${r.dh} | ${r.bands} |`));
console.log(`\n${capLine}${motionLine ? `\n${motionLine}` : ''}\nevidence: ${out}/`);
