#!/usr/bin/env node
// gate.mjs — the three-width gate for one live/build pair without a stardust state.json (step 6/7). Drives the installed stardust
// replica scripts: stitch-shot (--settle on BOTH sides; the origin is captured once and cached), pixel-compare, cap-probe compare;
// optionally motion-observe on both sides + motion-compare with a probes file. Prints the three-width table.
// Usage: node gate.mjs --live <url> --build <url> --out <dir> [--widths 360,1440,2560] [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--main <css>] [--build-main main]
//        [--probes <file>] [--recapture-origin] [--origin <dir>] [--band 450] [--top 120]
//        [--chrome | --no-chrome] [--budget | --no-budget] [--per-section] [--triage <triage.json>] [--blocks <blocks.json>] [--build-sections <css>]
//        node gate.mjs --pages <pages.json> --build-base http://localhost:<port> [--out gate] [--triage-dir <dir>] [--probes-dir <dir>] [the flags above]
//        node gate.mjs --served-pages <pages.json> --branch-host <url> [--out gate-served] [--origin-base gate] [--triage-dir <dir>] [the flags above]
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
// Delta gating (pages after the template — batch-7 rollout, pass 5):
//   --chrome masks the header band (0 … the profile's header height at the width) and the footer band (doc height − the profile's footer
//   height … doc height, on each capture) in the pixel compare — pixel-compare's own `--mask` (both sides painted one flat colour, the
//   rows out of the denominator, the mask on the verdict line); the captures stay unmasked. Default ON when the site profile has chrome
//   heights and the page is not one of the profile's template pages (`pages[]`); `--no-chrome` turns it off, `--chrome` forces it. With
//   the chrome masked the motion probes inside the build's header/footer are skipped (a `chrome:` prefix on a probe line forces it).
//   Per-section pixel %: the live page is split the way triage splits it, every live section is located on the build by its first text
//   (sections.mjs's pairing — lib/section-pair.mjs), and each authored section's share of differing pixels is read from the two captures
//   over its own y-range on each side (pixelmatch; shift-tolerant, exact). Printed as a table, written to `sections-<W>.json`; runs
//   whenever --chrome or --budget is on (or --per-section).
//   --budget compares every section matched to a block (the triage's row via --triage, else the `.block` class in the authored section)
//   with that block's budget at the width (`budget.360` / `.base` / `.probe` in blocks.json) and its Δh with 2 px; prints the over-budget
//   rows and `budget: PASS|FAIL (<n> over)`. A block the inventory lacks is `new (no budget)`, a section without a block `default (no
//   budget)` — both gated as in a template run (the three widths). Default ON when migration/blocks.json has budgets; --no-budget off.
//   --pages runs the single-page gate per page of a `roster pick` list (live = the page's url, build = <build-base>/<slug>.harness.html,
//   out gate/<slug>/, one origin cache per page), then one summary table (page, novelty, 360 / base / probe %, Δh, over-budget sections,
//   verdict) and gate/pages-summary.json. --served-pages gates <branch-host><docPath> with gate/<slug>/ as --origin, out gate-served/<slug>/.
//   Every single run also writes `gate.json` (the rows, cap and motion lines, chrome, budget) next to the captures.
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { arg, openPage, settle, overlayOpts, overlayArgs, siteProfile, stardustScripts } from './common.mjs';
import { liveSections, pairSections, triageRowFor } from './lib/section-pair.mjs';

const USAGE = 'usage: gate.mjs --live <url> --build <url> --out <dir> [--widths 360,1440,2560] [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--main <live-content-root>] [--build-main main] [--probes <file>] [--origin <gate-dir>] [--chrome|--no-chrome] [--budget|--no-budget] [--triage <triage.json>]\n       gate.mjs --pages <pages.json> --build-base http://localhost:<port> [--out gate]   |   gate.mjs --served-pages <pages.json> --branch-host <url> [--out gate-served] [--origin-base gate]';
const pngSize = (file) => { const b = readFileSync(file); return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) }; };
const atWidth = (map, W) => { if (!map) return null; if (map[W] !== undefined) return Number(map[W]); const ks = Object.keys(map).map(Number).filter((k) => Number.isFinite(k)); if (!ks.length) return null; const k = ks.sort((a, b) => Math.abs(a - W) - Math.abs(b - W))[0]; return Number(map[k]); };
const slugOf = (url) => { let p = ''; try { p = new URL(url).pathname; } catch { p = String(url); } p = p.replace(/\.harness\.html$|\.html$/, '').replace(/\/+$/, ''); return { path: p, slug: basename(p) || 'index' }; };
const pct2 = (v) => (v === null || v === undefined ? '—' : typeof v === 'number' ? String(Number(v.toFixed(2))) : String(v));

// ---------- page lists ----------
const listFile = arg('--pages', null) || arg('--served-pages', null);
if (typeof listFile === 'string') {
  const served = typeof arg('--served-pages', null) === 'string';
  const list = JSON.parse(readFileSync(listFile, 'utf8')); const pages = list.pages || [];
  const base = served ? String(arg('--branch-host', '') || siteProfile()?.media?.branchHost || '').replace(/\/$/, '') : String(arg('--build-base', '')).replace(/\/$/, '');
  if (!pages.length || !base) { console.error(`${USAGE}\n  --pages needs --build-base, --served-pages needs --branch-host (or the profile's media.branchHost)`); process.exit(1); }
  const outBase = String(arg('--out', served ? 'gate-served' : 'gate')); const originBase = String(arg('--origin-base', 'gate'));
  // flags the children inherit (one value each); the per-page --triage / --probes come from the dirs
  const inherit = ['--widths', '--consent', '--dismiss', '--locale', '--require', '--main', '--build-main', '--band', '--top', '--site', '--blocks', '--build-sections'].flatMap((f) => (typeof arg(f, null) === 'string' ? [f, arg(f)] : []));
  const switches = ['--chrome', '--no-chrome', '--budget', '--no-budget', '--per-section', '--recapture-origin', '--no-site'].filter((f) => process.argv.includes(f));
  const me = fileURLToPath(import.meta.url); const summary = []; const profile = siteProfile();
  const baseW = profile?.baseWidth ?? 1440; const probeW = profile?.probeWidth ?? 2560;
  for (const p of pages) {
    const out = join(outBase, p.slug); const build = served ? `${base}${p.docPath}` : `${base}/${p.slug}.harness.html`;
    const args = [me, '--live', p.url, '--build', build, '--out', out, ...inherit, ...switches];
    if (served && existsSync(join(originBase, p.slug))) args.push('--origin', join(originBase, p.slug));
    const tDir = arg('--triage-dir', null); const tFile = typeof tDir === 'string' ? [join(tDir, `${p.slug}.triage.json`), join(tDir, p.slug, 'triage.json'), join(tDir, `${p.slug}.json`)].find(existsSync) : null; if (tFile) args.push('--triage', tFile);
    const pDir = arg('--probes-dir', null); const pFile = typeof pDir === 'string' ? [join(pDir, `${p.slug}.txt`), join(pDir, p.slug, 'probes.txt')].find(existsSync) : null; if (pFile) args.push('--probes', pFile);
    console.log(`\n=== ${p.slug}  ${p.url}  →  ${build}`);
    const r = spawnSync('node', args, { stdio: 'inherit' });
    let g = null; try { g = JSON.parse(readFileSync(join(out, 'gate.json'), 'utf8')); } catch { /* the child failed before writing */ }
    const at = (W) => { const row = g?.rows?.find((x) => x.W === W); return row ? row.pct : null; };
    const baseRow = g?.rows?.find((x) => x.W === baseW) || g?.rows?.[0] || null;
    const over = g?.budget?.over || []; const capPass = g ? /PASS/.test(g.cap?.verdict || '') : false;
    const verdict = !g || r.status ? 'ERR' : [g.budget?.on && g.budget.verdict === 'FAIL' ? 'budget FAIL' : null, g.cap?.verdict && !capPass ? 'cap FAIL' : null].filter(Boolean).join(', ') || 'PASS';
    summary.push({ slug: p.slug, url: p.url, build, novelty: p.novelty ?? null, template: p.template ?? null, out, pct: { 360: at(360), base: at(baseW), probe: at(probeW) }, dh: baseRow ? baseRow.dh : null, chrome: g?.chrome?.on ?? null, overBudget: over, overCount: over.length, newSections: g?.budget?.newSections ?? null, cap: g?.cap?.verdict || null, motion: g?.motion || null, verdict, exit: r.status });
  }
  console.log('\n| page | novelty | 360 % | base % | probe % | Δh | chrome | over budget | verdict |\n|---|---|---|---|---|---|---|---|---|');
  for (const s of summary) console.log(`| ${s.slug} | ${s.novelty ?? '—'} | ${pct2(s.pct[360])} | ${pct2(s.pct.base)} | ${pct2(s.pct.probe)} | ${s.dh ?? '—'} | ${s.chrome === null ? '—' : s.chrome ? 'masked' : 'off'} | ${s.overCount ? `${s.overCount}: ${s.overBudget.map((o) => `#${o.index} ${o.anchorText ? `"${o.anchorText.slice(0, 18)}"` : ''} ${o.block || ''} ${o.over}@${o.W}`.replace(/\s+/g, ' ').trim()).join('; ')}` : (s.newSections ? `0 (${s.newSections} new)` : '0')} | ${s.verdict} |`);
  mkdirSync(outBase, { recursive: true });
  writeFileSync(join(outBase, 'pages-summary.json'), JSON.stringify({ _schema: 'stardust-lite/pages-summary@1', _writtenAt: new Date().toISOString(), _source: { pages: resolve(listFile), base, served, widths: arg('--widths', null) }, pages: summary }, null, 1));
  console.log(`\nsummary: ${join(outBase, 'pages-summary.json')}`);
  process.exit(summary.some((s) => s.verdict === 'ERR') ? 2 : 0);
}

// ---------- one page ----------
const live = arg('--live'); const build = arg('--build'); const out = arg('--out');
if (!live || !build || !out) { console.error(USAGE); process.exit(1); }
const widths = String(arg('--widths', '360,1440,2560')).split(',').map(Number); const band = Number(arg('--band', 450));
// overlays and locale reach the LIVE side of every capture tool (a geo modal or a marketing interstitial is not consent; a geo-redirecting
// origin captures another locale per run without the pin); without the flags they come from the site profile (`--site`, migration/site.json),
// as does the cap-probe `--main` root
const liveOpts = overlayArgs(); const profile = siteProfile(); const liveMain = arg('--main', null) ?? profile?.cap?.mainSelector ?? null;
const S = stardustScripts(); mkdirSync(out, { recursive: true });
const run = (args, quiet) => { const r = spawnSync('node', args, { encoding: 'utf8' }); if (!quiet) process.stdout.write(r.stdout.split('\n').slice(-3).join('\n') + '\n'); if (r.stderr && r.status) process.stderr.write(r.stderr.slice(-400)); return r; };

// chrome: on by default for a page that is not one of the profile's template pages, when the profile knows the chrome heights
const headerHeights = profile?.chrome?.header?.heightsByWidth || null; const footerHeights = profile?.chrome?.footer?.heightsByWidth || null;
const hasChrome = !!(headerHeights && Object.keys(headerHeights).length);
const { path: buildPath, slug } = slugOf(build);
const isTemplate = (profile?.pages || []).some((p) => p.path === buildPath || basename(String(p.path || '').replace(/\/+$/, '')) === slug);
const chromeOn = process.argv.includes('--chrome') ? true : process.argv.includes('--no-chrome') ? false : (hasChrome && !isTemplate);
if (chromeOn && !hasChrome) console.log('chrome: --chrome forced but the profile has no chrome heights — nothing to mask');
else if (hasChrome && !chromeOn && !process.argv.includes('--no-chrome')) console.log(`chrome: not masked (${slug} is a template page of the profile; --chrome forces the mask)`);
// budget: on by default when the inventory has budgets
const blocksFile = typeof arg('--blocks', null) === 'string' ? resolve(arg('--blocks')) : join(process.cwd(), 'migration', 'blocks.json');
let blocks = []; try { blocks = JSON.parse(readFileSync(blocksFile, 'utf8')).blocks || []; } catch { /* no inventory */ }
const hasBudgets = blocks.some((b) => b.budget && Object.keys(b.budget).length);
const budgetOn = process.argv.includes('--budget') ? true : process.argv.includes('--no-budget') ? false : hasBudgets;
if (budgetOn && !hasBudgets) console.log(`budget: --budget but ${blocksFile} has no budgets — every block reads as new`);
const perSection = chromeOn || budgetOn || process.argv.includes('--per-section');
const triage = typeof arg('--triage', null) === 'string' ? JSON.parse(readFileSync(arg('--triage'), 'utf8')) : null;
const secSel = String(arg('--build-sections', 'main > .section'));
const baseW = profile?.baseWidth ?? 1440; const probeW = profile?.probeWidth ?? 2560;
const budgetKey = (W) => (W === 360 ? '360' : W === probeW ? 'probe' : W === baseW ? 'base' : W > baseW ? 'probe' : 'base');
const tokens = (v) => String(v || '').trim().split(/\s+/).filter(Boolean).sort().join(' ');
const findBlock = (name, variant) => { if (!name) return null; const rows = blocks.filter((b) => b.name === name); if (!rows.length) return null; return rows.find((b) => tokens(b.variant) === tokens(variant)) || (variant ? rows.find((b) => !b.variant) : null) || rows[0]; };

const rows = []; const sectionRuns = {}; const chromeRuns = {}; const overAll = []; let newCount = 0; let defaultCount = 0;
for (const W of widths) {
  const origin = join(out, `live-${W}.png`); const eds = join(out, `build-${W}.png`);
  const shared = arg('--origin', null) ? join(arg('--origin'), `live-${W}.png`) : null;
  if (shared && existsSync(shared) && !existsSync(origin) && !arg('--recapture-origin', false)) { console.log(`origin ${W} from ${shared}`); copyFileSync(shared, origin); }
  if (!existsSync(origin) || arg('--recapture-origin', false)) { console.log(`origin ${W}…`); run([join(S, 'stitch-shot.mjs'), live, origin, '--width', String(W), '--settle', ...liveOpts]); }
  console.log(`build ${W}…`); run([join(S, 'stitch-shot.mjs'), build, eds, '--width', String(W), '--settle']);
  // the chrome mask: header rows 0…h on both; footer rows (height − footer) on each capture (pixel-compare masks the union of both ranges)
  const mask = [];
  if (chromeOn && hasChrome && existsSync(origin) && existsSync(eds)) {
    const hH = atWidth(headerHeights, W) || 0; const fH = atWidth(footerHeights, W) || 0; const lh = pngSize(origin).height; const bh = pngSize(eds).height;
    if (hH > 0) mask.push(`0:${hH}`); if (fH > 0) mask.push(`${Math.max(0, lh - fH)}:${fH}@${Math.max(0, bh - fH)}`);
    chromeRuns[W] = { header: hH, footer: fH, liveHeight: lh, buildHeight: bh, mask };
    console.log(`chrome masked: header ${hH}px footer ${fH}px at ${W}`);
  }
  const px = run([join(S, 'pixel-compare.mjs'), origin, eds, '--out', join(out, `diff-${W}.png`), '--band', String(W === 360 ? 900 : band), '--json', ...(mask.length ? ['--mask', mask.join(',')] : [])], true);
  try { const j = JSON.parse(px.stdout.slice(px.stdout.indexOf('{'))); writeFileSync(join(out, `pixel-${W}.json`), JSON.stringify(j, null, 1)); rows.push({ W, pct: j.pct, dh: j.heightDelta, bands: j.bands.map((b) => `${b.y0}:${b.pct}`).join(' '), masked: j.maskedRows || 0 }); } catch { rows.push({ W, pct: 'ERR', dh: '', bands: px.stdout.slice(-200) }); }
  try { // the top band of the diff as its own file: look at the chrome, do not read it as a number
    const src = PNG.sync.read(readFileSync(join(out, `diff-${W}.png`))); const H = Math.min(Number(arg('--top', 120)), src.height); const dst = new PNG({ width: src.width, height: H });
    src.data.copy(dst.data, 0, 0, src.width * H * 4); writeFileSync(join(out, `diff-${W}-top.png`), PNG.sync.write(dst));
  } catch { /* diff image missing */ }
  if (!perSection || !existsSync(origin) || !existsSync(eds)) continue;
  // per-section share: live split (the triage's rows) paired onto the authored sections, each read over its own y-range on each capture
  console.log(`sections ${W}…`);
  let pairing = null;
  try {
    const br = await chromium.launch();
    const lp = await openPage(br, live, { width: W, ...overlayOpts() }); await settle(lp, 800, 50, 400);
    const ls = await liveSections(lp, { mainSel: liveMain, headerSel: profile?.chrome?.header?.selector || null, footerSel: profile?.chrome?.footer?.selector || null }); await lp.close();
    const bp = await openPage(br, build, { width: W }); await settle(bp, 800, 50, 400);
    pairing = await pairSections(bp, ls, { secSel }); await br.close();
  } catch (e) { console.log(`sections ${W}: pairing failed — ${String(e.message || e).slice(0, 160)}`); continue; }
  const A = PNG.sync.read(readFileSync(origin)); const B = PNG.sync.read(readFileSync(eds)); const w = Math.min(A.width, B.width);
  const rowsOf = (img, y0, h) => { if (img.width === w) return img.data.subarray(y0 * w * 4, (y0 + h) * w * 4); const o = Buffer.alloc(w * h * 4); for (let y = 0; y < h; y += 1) img.data.copy(o, y * w * 4, (y0 + y) * img.width * 4, (y0 + y) * img.width * 4 + w * 4); return o; };
  const key = budgetKey(W); const table = [];
  for (const s of pairing.sections) {
    const by0 = Math.max(0, Math.min(B.height, s.build.y0)); const ly0 = s.live ? Math.max(0, Math.min(A.height, s.live.y0)) : by0;
    const h = Math.max(0, Math.min(s.build.h, s.live ? s.live.h : s.build.h, B.height - by0, A.height - ly0));
    const n = h > 0 ? pixelmatch(rowsOf(A, ly0, h), rowsOf(B, by0, h), null, w, h, { threshold: 0.1 }) : 0;
    const pct = h > 0 ? Number(((100 * n) / (w * h)).toFixed(2)) : null; const dh = s.live ? s.build.h - s.live.h : null;
    // the block: the triage row of the live section(s) when given, else the authored `.block` class
    let block = s.block; let variant = s.variant; let blockSource = block ? 'dom' : null; let matchKind = null;
    if (triage && s.live) { const rowT = s.live.indices.map((i) => triageRowFor(triage, { index: i, anchorText: s.live.anchorText })).find((r) => r && r.match && r.match.block) || null; if (rowT) { block = rowT.match.block; variant = rowT.match.variant; blockSource = 'triage'; matchKind = rowT.match.kind; } }
    const inv = findBlock(block, variant); const budget = inv?.budget ? inv.budget[key] ?? null : null;
    const status = !block ? 'default' : budget === null ? 'new' : 'reused';
    const over = []; if (status === 'reused' && budgetOn) { if (pct !== null && pct > budget) over.push('pct'); if (dh !== null && Math.abs(dh) > 2) over.push('Δh'); }
    const row = { index: s.index, anchorText: s.anchorText || s.liveAnchorText || '', classes: s.classes, build: s.build, live: s.live ? { y0: s.live.y0, y1: s.live.y1, h: s.live.h, box: s.live.box, indices: s.live.indices } : null, comparedRows: h, dh, pct, block, variant, blockSource, matchKind, inventoryVariant: inv ? inv.variant : null, budget, budgetKey: key, status, over: over.join('+') || null };
    table.push(row); if (over.length) overAll.push({ W, index: s.index, anchorText: row.anchorText, block: `${block}${variant ? ` (${variant})` : ''}`, pct, budget, dh, over: over.join('+') });
  }
  newCount = Math.max(newCount, table.filter((r) => r.status === 'new').length); defaultCount = Math.max(defaultCount, table.filter((r) => r.status === 'default').length);
  const col = (v, n) => String(v ?? '—').padStart(n);
  console.log(`\nsections at ${W} (${pairing.sections.length} authored, ${pairing.sections.filter((s) => s.live).length} paired with ${pairing.sections.reduce((a, s) => a + (s.live ? s.live.indices.length : 0), 0)} live sections${pairing.unpaired.length ? `, ${pairing.unpaired.length} live unpaired` : ''}${pairing.chrome.length ? `, ${pairing.chrome.length} live in the build's chrome` : ''}${pairing.empty.length ? `, ${pairing.empty.length} empty authored skipped` : ''}; Δ doc ${pairing.build.doc - pairing.live.doc}; y-ranges run to the next section's top)`);
  console.log(' #  anchor                       build y0–y1      live y0–y1         Δh  pixel %  block                        budget  over');
  for (const r of table) console.log(`${col(r.index, 2)}  ${(r.anchorText || '(no text)').slice(0, 26).padEnd(28)} ${`${r.build.y0}–${r.build.y1}`.padEnd(16)} ${(r.live ? `${r.live.y0}–${r.live.y1}` : '— (unpaired)').padEnd(16)} ${col(r.dh, 5)}  ${col(r.pct === null ? '—' : r.pct.toFixed(2), 7)}  ${(r.block ? `${r.block}${r.variant ? ` (${r.variant})` : ''}${r.blockSource === 'triage' ? ' ◂triage' : ''}` : 'default content').slice(0, 28).padEnd(28)} ${col(r.status === 'reused' ? r.budget : `${r.status} (no budget)`, 6)}  ${r.over || ''}`);
  for (const u of pairing.unpaired) console.log(`    live "${(u.anchorText || '(no text)').slice(0, 26)}" y ${u.box ? `${u.box[1]}–${u.box[1] + u.box[3]}` : '?'} located in no authored section`);
  sectionRuns[W] = join(out, `sections-${W}.json`);
  writeFileSync(sectionRuns[W], JSON.stringify({ _schema: 'stardust-lite/gate-sections@1', _writtenAt: new Date().toISOString(), width: W, live, build, budgetKey: key, chrome: chromeRuns[W] || null, triage: typeof arg('--triage', null) === 'string' ? resolve(arg('--triage')) : null, blocks: blocks.length ? blocksFile : null, doc: { live: pairing.live.doc, build: pairing.build.doc }, sections: table, unpaired: pairing.unpaired, liveInChrome: pairing.chrome, emptyAuthored: pairing.empty }, null, 1));
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
  // `chrome:` prefix: run the probe even when the chrome is masked (a header hover the page changes)
  const parsed = lines.map((l) => { const forced = /^chrome:\s*/i.test(l); const m = l.replace(/^chrome:\s*/i, '').match(/^(hover|click)\s+(.+?)\s*=>\s*(.+)$/); if (m) m.forced = forced; return m; }).filter(Boolean);
  const clicks = parsed.filter((m) => m[1] === 'click').map((m) => m[2]);
  if (clicks.length) {
    const br = await chromium.launch(); const pg = await openPage(br, live, { width: 1440, ...overlayOpts() });
    const nav = await pg.evaluate((sels) => sels.filter((s) => { let e; try { e = document.querySelector(s); } catch { return false; } const a = e && e.closest('a[href]'); if (!a) return false; const h = a.getAttribute('href') || ''; return h && !h.startsWith('#') && !/^javascript:/i.test(h) && a.getAttribute('target') !== '_blank' && !(a.getAttribute('role') === 'button') && a.href.split('#')[0] !== location.href.split('#')[0]; }), clicks);
    await br.close();
    if (nav.length) { console.error(`gate: ${nav.length} click probe(s) target a link that navigates on the live side — dropped (the click destroys the live context and the motion run; hover the item or use click-state --hover):\n  ${nav.join('\n  ')}`); for (const m of parsed) if (m[1] === 'click' && nav.includes(m[2])) m.drop = true; }
  }
  if (chromeOn && parsed.some((m) => !m.drop && !m.forced)) {
    // the chrome is approved: a probe whose build target sits in header/footer is skipped (prefix the line `chrome:` to keep it)
    const br = await chromium.launch(); const pg = await openPage(br, build, { width: 1440 });
    const inChrome = await pg.evaluate((sels) => sels.map((s) => { try { const e = document.querySelector(s); return !!(e && e.closest('header, footer')); } catch { return false; } }), parsed.map((m) => m[3]));
    await br.close();
    const skipped = parsed.filter((m, i) => !m.drop && !m.forced && inChrome[i]); skipped.forEach((m) => { m.drop = true; m.chrome = true; });
    if (skipped.length) console.log(`gate: ${skipped.length} probe(s) inside the build's header/footer skipped (chrome masked; prefix a line with \`chrome:\` to force it):\n  ${skipped.map((m) => `${m[1]} ${m[3]}`).join('\n  ')}`);
  }
  const side = (i) => parsed.flatMap((m) => (m.drop ? [] : [`--${m[1]}`, m[i]]));
  if (parsed.some((m) => !m.drop)) {
    console.log('motion live…'); run([join(S, 'motion-observe.mjs'), live, join(out, 'motion-live.json'), '--width', '1440', ...liveOpts, ...side(2)], true);
    console.log('motion build…'); run([join(S, 'motion-observe.mjs'), build, join(out, 'motion-build.json'), '--width', '1440', ...side(3)], true);
    const mc = run([join(S, 'motion-compare.mjs'), join(out, 'motion-live.json'), join(out, 'motion-build.json'), '--json', join(out, 'motion-compare.json')], true);
    writeFileSync(join(out, 'motion-compare.txt'), mc.stdout); motionLine = (mc.stdout.match(/motion summary: .*/) || [''])[0];
  } else motionLine = 'motion: every probe skipped or dropped';
}
console.log('\n| width | pixel % | Δh | bands |\n|---|---|---|---|');
rows.forEach((r) => console.log(`| ${r.W} | ${r.pct} | ${r.dh} | ${r.bands} |`));
let budgetLine = '';
if (budgetOn && Object.keys(sectionRuns).length) {
  budgetLine = `budget: ${overAll.length ? 'FAIL' : 'PASS'} (${overAll.length} over${newCount ? `, ${newCount} new` : ''}${defaultCount ? `, ${defaultCount} default content` : ''}; budgets of ${basename(dirname(blocksFile))}/${basename(blocksFile)})`;
  for (const o of overAll) budgetLine += `\n  ✗ ${o.W} #${o.index} "${o.anchorText.slice(0, 24)}" ${o.block}: ${o.over.includes('pct') ? `${o.pct} % > budget ${o.budget}` : ''}${o.over === 'pct+Δh' ? ', ' : ''}${o.over.includes('Δh') ? `Δh ${o.dh} px > 2` : ''}`;
}
console.log(`\n${capLine}${motionLine ? `\n${motionLine}` : ''}${budgetLine ? `\n${budgetLine}` : ''}\nevidence: ${out}/`);
writeFileSync(join(out, 'gate.json'), JSON.stringify({ _schema: 'stardust-lite/gate@1', _writtenAt: new Date().toISOString(), live, build, slug, widths, rows, chrome: { on: chromeOn, template: isTemplate, byWidth: chromeRuns }, cap: { verdict: capLine.split('\n')[0], failing: capLine.split('\n').slice(1) }, motion: motionLine || null, budget: { on: budgetOn, verdict: budgetOn ? (overAll.length ? 'FAIL' : 'PASS') : null, over: overAll, newSections: newCount, defaultSections: defaultCount, blocks: blocks.length ? blocksFile : null }, sections: sectionRuns }, null, 1));
