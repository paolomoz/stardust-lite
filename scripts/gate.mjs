#!/usr/bin/env node
// gate.mjs — the three-width gate for one live/build pair without a stardust state.json (step 6/7). Captures live and build in ONE
// Playwright browser, two contexts, concurrently (lib/stitch.mjs — the shape stitch-shot writes; `--capture-tool stitch-shot` keeps the
// vendored spawns for the record), settles both sides, reuses the same two pages for the per-section pairing, then drives the vendored
// pixel-compare and cap-probe compare; optionally motion-observe on both sides + motion-compare with a probes file. Prints the
// three-width table and one timing line (per width: live, build, compare, sections — `timing` in gate.json).
// Usage: node gate.mjs --live <url> --build <url> --out <dir> [--widths 360,1440,2560] [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--main <css>] [--build-main main]
//        [--probes <file>] [--recapture-origin] [--origin <dir>] [--band 450] [--top 120] [--vh 900] [--capture-tool stitch|stitch-shot] [--skip-widths-when-clean <sections-verdict.json>]
//        [--chrome | --no-chrome] [--budget | --no-budget] [--per-section] [--triage <triage.json>] [--blocks <blocks.json>] [--build-sections <css>] [--content-root <css>]
//        node gate.mjs --pages <pages.json> --build-base http://localhost:<port> [--out gate] [--triage-dir <dir>] [--probes-dir <dir>] [the flags above]
//        node gate.mjs --served-pages <pages.json> --branch-host <url> [--out gate-served] [--origin-base gate] [--triage-dir <dir>] [the flags above]
//   --origin <dir>: reuse the `live-<W>.png` of ANY dir that holds one — measure-page's measure dir (its capture from the measurement
//   session), the prototype gate's dir — the origin is cached per --out dir, so a served gate in its own dir recaptured the origin and
//   compared against a new noise sample (dentsu-home); with --origin both gates share one. Without --origin the default is
//   `migration/pages/<slug>/measure` when it holds the width (one live load per page: measurement, prototype gate, served gate —
//   sdt-dentsu speed); else the origin is captured. `origin <W> from <path>` names the source.
//   --skip-widths-when-clean <sections-verdict.json>: `sections --widths … --out` wrote the verdict; when it is CLEAN with 0 new sections
//   the prototype gate runs the base width only (`probe/360 skipped: …` — the served gate at the three widths is the deciding number).
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
//   Per-section pixel %: the live page is split the way the TRIAGE split it (its content root `_source.mainKey` and `--sections` node
//   selectors — `--content-root <css>` overrides; the profile's `cap.contentRoot` and cap-probe's main are the fallbacks) and paired to the
//   authored sections by index when the counts match (`author` writes one section per triage row), by first text otherwise
//   (lib/section-pair.mjs); each authored section's share of differing pixels is read over its stride at the same rows on both captures,
//   Δh is the stride difference (`b` = a boundary the next row cancels, not a height), Δy the cumulative offset at its top. Printed as a
//   table, written to `sections-<W>.json`; runs whenever --chrome or --budget is on (or --per-section).
//   --budget compares every section matched to a block (the triage's row via --triage, else the `.block` class in the authored section)
//   with that block's budget at the width (`budget.360` / `.base` / `.probe` in blocks.json) and its Δh with 2 px; prints the over-budget
//   rows and `budget: PASS|FAIL (<n> over)`. A block the inventory lacks is `new (no budget)`, a section without a block `default (no
//   budget)` — both gated as in a template run (the three widths). Default ON when migration/blocks.json has budgets; --no-budget off.
//   --pages runs the single-page gate per page of a `roster pick` list (live = the page's url, build = <build-base>/<slug>.harness.html,
//   out gate/<slug>/, one origin cache per page), then one summary table (page, novelty, 360 / base / probe %, Δh, over-budget sections,
//   verdict) and gate/pages-summary.json. --served-pages gates <branch-host><docPath> with gate/<slug>/ as --origin, out gate-served/<slug>/.
//   Every single run also writes `gate.json` (the rows, cap and motion lines, chrome, budget) next to the captures.
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { arg, openPage, settle, overlayOpts, overlayArgs, siteProfile, stardustScripts, contextOptions, launch } from './common.mjs';
import { liveSections, liveSectionsFromDump, pairSections, triageRowFor } from './lib/section-pair.mjs';
import { captureUrl } from './lib/stitch.mjs';

const USAGE = 'usage: gate.mjs --live <url> --build <url> --out <dir> [--round] [--widths 360,1440,2560] [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--main <live-content-root>] [--build-main main] [--probes <file>] [--origin <dir with live-<W>.png>] [--vh 900] [--capture-tool stitch|stitch-shot] [--skip-widths-when-clean <sections-verdict.json>] [--chrome|--no-chrome] [--budget|--no-budget] [--triage <triage.json>]\n       gate.mjs --pages <pages.json> --build-base http://localhost:<port> [--out gate]   |   gate.mjs --served-pages <pages.json> --branch-host <url> [--out gate-served] [--origin-base gate]';
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
  const inherit = ['--widths', '--consent', '--dismiss', '--locale', '--require', '--main', '--build-main', '--band', '--top', '--vh', '--capture-tool', '--site', '--blocks', '--build-sections', '--content-root'].flatMap((f) => (typeof arg(f, null) === 'string' ? [f, arg(f)] : []));
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
const tStart = Date.now(); const live = arg('--live'); const build = arg('--build'); const out = arg('--out');
if (!live || !build || !out) { console.error(USAGE); process.exit(1); }
let widths = String(arg('--widths', '360,1440,2560')).split(',').map(Number); const band = Number(arg('--band', 450)); const vh = Number(arg('--vh', 900));
// --round (loop high-impact pass): the CSS round — the base width only, the per-section table, then a DIGEST against the previous round in this dir
// (the sections that moved and the property each points at, pair's hot rows per section with the cascade removed) and a `stop:` line when the base is clean
const roundMode = process.argv.includes('--round');
if (roundMode && typeof arg('--widths', null) !== 'string') widths = [widths.includes(1440) ? 1440 : widths[Math.floor(widths.length / 2)]]; // an explicit --widths wins (si-home: the first round at three widths read 1440 only)
// --target <pct> (exp/five-min): the clock's target — the round stops when every one of the three widths is under it; polish after that is outside the clock.
// A round skips cap-probe and the sections pass (the final gate runs them, --full forces them) and reads the live split from the out dir's cache
const full = process.argv.includes('--full') || !roundMode;
const captureTool = String(arg('--capture-tool', 'stitch')); if (!['stitch', 'stitch-shot'].includes(captureTool)) { console.error(`${USAGE}\n  --capture-tool is stitch (in-process, default) or stitch-shot (the vendored tool)`); process.exit(1); }
// overlays and locale reach the LIVE side of every capture tool (a geo modal or a marketing interstitial is not consent; a geo-redirecting
// origin captures another locale per run without the pin); without the flags they come from the site profile (`--site`, migration/site.json),
// as does the cap-probe `--main` root
const liveOpts = overlayArgs(); const overlays = overlayOpts(); const profile = siteProfile(); const liveMain = arg('--main', null) ?? profile?.cap?.mainSelector ?? null;
const S = stardustScripts(); mkdirSync(out, { recursive: true });
const baseW = profile?.baseWidth ?? 1440; const probeW = profile?.probeWidth ?? 2560;
// the clean-tables skip: a reuse-only page whose section tables are clean at the three widths gates the prototype at the base width only
if (typeof arg('--skip-widths-when-clean', null) === 'string') {
  let v = null; try { v = JSON.parse(readFileSync(arg('--skip-widths-when-clean'), 'utf8')); } catch (e) { console.error(`gate: cannot read ${arg('--skip-widths-when-clean')} (${e.message})`); process.exit(1); }
  if (v.clean && !v.newSections && widths.length > 1) { widths = [widths.includes(baseW) ? baseW : widths[0]]; console.log(`probe/360 skipped: tables clean, the served gate at the three widths is the deciding number (${arg('--skip-widths-when-clean')}: ${v.verdict})`); }
  else console.log(`tables not clean for the skip (${v.verdict || 'no verdict'}${v.newSections ? `, ${v.newSections} new` : ''}) — the ${widths.length} widths run`);
}
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
const perSection = chromeOn || budgetOn || process.argv.includes('--per-section') || roundMode;
const prevSections = {}; // --round: the previous round's per-section table per width, read before this run overwrites it
if (roundMode) for (const W of widths) { try { prevSections[W] = JSON.parse(readFileSync(join(out, `sections-${W}.json`), 'utf8')).sections; } catch { prevSections[W] = null; } }
const triage = typeof arg('--triage', null) === 'string' ? JSON.parse(readFileSync(arg('--triage'), 'utf8')) : null;
if (process.argv.includes('--probes') && typeof arg('--probes', null) !== 'string') { console.error(`${USAGE}\n  --probes takes a file (one probe per line); a bare --probes crashed the cap-probe step (sdt-dentsu beyond-the-funnel)`); process.exit(1); }
const secSel = String(arg('--build-sections', 'main > .section'));
// the LIVE content root and the section split for the per-section table: the triage's (its dump key `mainKey` — `main`, or the root's short
// selector — and its `--sections` node selectors), else the profile's `cap.contentRoot`, else cap-probe's main selector (the cap shell,
// which on a one-module site excludes a hero that sits before `main`)
const triageRoot = triage?._source?.mainKey && triage._source.mainKey !== 'body' ? triage._source.mainKey : null;
const contentRoot = typeof arg('--content-root', null) === 'string' ? arg('--content-root') : (triageRoot ?? profile?.cap?.contentRoot ?? liveMain);
const sectionSels = triage?._source?.sections?.length ? triage._source.sections : null;
const budgetKey = (W) => (W === 360 ? '360' : W === probeW ? 'probe' : W === baseW ? 'base' : W > baseW ? 'probe' : 'base');
const tokens = (v) => String(v || '').trim().split(/\s+/).filter(Boolean).sort().join(' ');
const findBlock = (name, variant) => { if (!name) return null; const rows = blocks.filter((b) => b.name === name); if (!rows.length) return null; return rows.find((b) => tokens(b.variant) === tokens(variant)) || (variant ? rows.find((b) => !b.variant) : null) || rows[0]; };

const rows = []; const sectionRuns = {}; const chromeRuns = {}; const overAll = []; let newCount = 0; let defaultCount = 0; let liveSectionCount = 0; const timing = {}; const originFrom = {};
// the origin: the --out dir's own cache first, then --origin <dir>, then (no --origin) the page's measure dir — any dir holding live-<W>.png
const originDir = typeof arg('--origin', null) === 'string' ? resolve(arg('--origin')) : null; const measureDir = join(process.cwd(), 'migration', 'pages', slug, 'measure');
const findOrigin = (W) => [originDir, originDir ? null : measureDir].filter(Boolean).map((d) => join(d, `live-${W}.png`)).find(existsSync) || null;
const recapture = !!arg('--recapture-origin', false);
const browser = captureTool === 'stitch' ? await launch() : null;
const secs = (t0) => Number(((Date.now() - t0) / 1000).toFixed(1));
// the widths at once (exp/five-min: the live opens, ≈ 10–27 s a width, overlap the build captures, which stay in a queue), then the
// compare and the pairing per width on the pages they left open; --serial-widths keeps one width at a time
const capt = {}; let buildQueue = Promise.resolve(); // the BUILD captures one at a time: three at once made the preview host refuse a burst of rendition requests (si-home replay: 24 pictures as alt text at 2560, retries did not recover them); the live opens overlap
const captureW = async (W) => {
  const origin = join(out, `live-${W}.png`); const eds = join(out, `build-${W}.png`); const t = { live: null, build: null, compare: null, sections: null }; timing[W] = t;
  // the build is captured fresh every run: a failed capture left the previous round's build-<W>.png on disk and the gate compared it again,
  // printing last round's numbers as this round's (continental-home r5, one wasted round)
  try { if (existsSync(eds)) unlinkSync(eds); } catch { /* read-only */ }
  const shared = findOrigin(W);
  if (shared && (!existsSync(origin) || originDir) && !recapture) { console.log(`origin ${W} from ${shared}`); copyFileSync(shared, origin); originFrom[W] = shared; } // an explicit --origin wins over the out dir's copy (si-home)
  else if (existsSync(origin) && !recapture) { console.log(`origin ${W} from ${origin} (cached)`); originFrom[W] = origin; }
  const needOrigin = !existsSync(origin) || recapture; if (!needOrigin) t.live = 0;
  // the live split read once per origin: later rounds pair against the same boxes the pixels were compared with (si-home: a fresh live load
  // per round read Δdoc −603 in the table, −3 in the pixels) and do not reopen the live page (≈ 10 s a width)
  const lsFile = join(out, `live-sections-${W}.json`); const lsKey = JSON.stringify([contentRoot, sectionSels, profile?.chrome?.header?.selector || null, profile?.chrome?.footer?.selector || null]);
  let lsCached = null; if (!needOrigin) { try { const c = JSON.parse(readFileSync(lsFile, 'utf8')); if (c.key === lsKey) lsCached = c.ls; } catch { /* first read */ } }
  // no cached split yet and the origin came from a measure dir: its dump is the live split (no live open — the first round's slow part)
  if (!lsCached && !needOrigin && originFrom[W] && typeof originFrom[W] === 'string') { const dumpFile = join(dirname(originFrom[W]), `content-${W}.json`); if (existsSync(dumpFile)) { try { lsCached = liveSectionsFromDump(JSON.parse(readFileSync(dumpFile, 'utf8')), { sections: sectionSels }); writeFileSync(lsFile, JSON.stringify({ key: lsKey, ls: lsCached })); } catch { lsCached = null; } } }
  let lp = null; let bp = null; let liveCtx = null; let buildCtx = null;
  if (captureTool === 'stitch-shot') {
    if (needOrigin) { const t0 = Date.now(); console.log(`origin ${W}…`); run([join(S, 'stitch-shot.mjs'), live, origin, '--width', String(W), '--vh', String(vh), '--settle', ...liveOpts]); t.live = secs(t0); originFrom[W] = 'captured (stitch-shot)'; }
    const t0 = Date.now(); console.log(`build ${W}…`); run([join(S, 'stitch-shot.mjs'), build, eds, '--width', String(W), '--vh', String(vh), '--settle']); t.build = secs(t0);
  } else {
    // one browser, two contexts: live and build captured at once; both pages stay open (settled, frozen, at rest) for the pairing below.
    // When the origin is cached the live page is still opened — settled, not captured — when the per-section table needs it
    liveCtx = await browser.newContext(contextOptions({ width: W, height: vh, locale: overlays.locale })); buildCtx = await browser.newContext(contextOptions({ width: W, height: vh }));
    const liveTask = async () => {
      if (!needOrigin && (!perSection || lsCached)) return;
      const t0 = Date.now();
      try {
        if (needOrigin) { console.log(`origin ${W}…`); const r = await captureUrl(liveCtx, live, origin, { width: W, vh, consent: overlays.consent, dismiss: overlays.dismiss, locale: overlays.locale, require: overlays.require, log: console.log }); lp = r.page; t.live = secs(t0); originFrom[W] = 'captured'; }
        else { lp = await openPage(liveCtx, live, { width: W, height: vh, consent: overlays.consent, dismiss: overlays.dismiss, locale: overlays.locale, require: overlays.require }); await settle(lp); t.live = 0; t.liveOpen = secs(t0); }
      } catch (e) { console.log(`live ${W}: ${needOrigin ? 'capture' : 'open'} failed — ${String(e.message || e).split('\n')[0].slice(0, 160)}`); lp = null; }
    };
    const buildTask = async () => {
      const t0 = Date.now(); console.log(`build ${W}…`);
      for (let attempt = 1; attempt <= 2 && !bp; attempt += 1) { try { const r = await captureUrl(buildCtx, build, eds, { width: W, vh, log: console.log }); bp = r.page; t.build = secs(t0); } catch (e) { console.log(`build ${W}: capture failed${attempt === 1 ? ' — once more' : ' twice — this width reads ERR, not the last round'} (${String(e.message || e).split('\n')[0].slice(0, 140)})`); bp = null; } }
    };
    // a LOCAL build serves its own media (harness --local-media): no burst to the preview host, the widths capture at once; a served build queues
    const localBuild = /^https?:\/\/(localhost|127\.0\.0\.1)[:/]/.test(build);
    const lt = liveTask(); if (localBuild) await Promise.all([lt, buildTask()]); else { buildQueue = buildQueue.then(buildTask); await Promise.all([lt, buildQueue]); }
  }
  capt[W] = { origin, eds, t, lp, bp, liveCtx, buildCtx, lsCached };
};
if (captureTool === 'stitch' && !process.argv.includes('--serial-widths')) await Promise.all(widths.map(captureW)); else for (const W of widths) await captureW(W);
for (const W of widths) {
  const { origin, eds, t, liveCtx, buildCtx, lsCached } = capt[W]; let { lp, bp } = capt[W]; const lsFile = join(out, `live-sections-${W}.json`); const lsKey = JSON.stringify([contentRoot, sectionSels, profile?.chrome?.header?.selector || null, profile?.chrome?.footer?.selector || null]);
  const tc = Date.now();
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
  // the hottest band, read as pixels: shift-probe's best shift and luminance ratio name a displacement, a scale or paint over a picture — a
  // letterboxed hero was a 62 % band no table named (cibc-careers); one reading per width, over the band's full width
  try { const j = JSON.parse(readFileSync(join(out, `pixel-${W}.json`), 'utf8')); const hot = (j.bands || []).filter((b) => b.pct > 0.5).sort((a, b) => b.pct - a.pct)[0];
    if (hot) { const sp = spawnSync(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), 'shift-probe.mjs'), origin, eds, '--x0', '0', '--x1', String(W), '--y0', String(hot.y0), '--y1', String(hot.y1), '--r', '8', '--step', '2'], { encoding: 'utf8' }); const lines = sp.stdout.trim().split('\n');
      // the last band under a fixed / sticky layer (the measure summary's first look) is the chrome's copy in the bottom-aligned last chunk, offset by Δh: a capture property (take2games, 1.5 min of crops)
      let fixedNote = ''; try { const sm = JSON.parse(readFileSync(join(dirname(origin), 'summary.json'), 'utf8')); const fl = sm.fixedLayers?.[String(W)] || []; if (fl.length && hot === (j.bands || []).slice(-1)[0] && Math.abs(j.heightDelta || 0) > 2) fixedNote = ` — the LAST chunk under a fixed / sticky layer (${fl[0].split(' [')[0]}): the chrome's copy offset by Δh ${j.heightDelta}, a capture property, not layout`; } catch { /* no summary */ }
      console.log(`hottest band at ${W}: y ${hot.y0}–${hot.y1} ${hot.pct} % — ${lines.map((l) => l.replace(/^region [^:]*: /, '')).join(' · ').slice(0, 300)}${fixedNote}`); } } catch { /* no bands */ }
  try { // the top band of the diff as its own file: look at the chrome, do not read it as a number
    const src = PNG.sync.read(readFileSync(join(out, `diff-${W}.png`))); const H = Math.min(Number(arg('--top', 120)), src.height); const dst = new PNG({ width: src.width, height: H });
    src.data.copy(dst.data, 0, 0, src.width * H * 4); writeFileSync(join(out, `diff-${W}-top.png`), PNG.sync.write(dst));
  } catch { /* diff image missing */ }
  t.compare = secs(tc);
  const closeCtx = async () => { for (const c of [liveCtx, buildCtx]) if (c) await c.close().catch(() => {}); };
  if (!perSection || !existsSync(origin) || !existsSync(eds)) { await closeCtx(); continue; }
  // per-section share: live split (the triage's rows) paired onto the authored sections, each read over its own y-range on each capture —
  // from the two pages the captures came from (the pairing re-loaded live and build per width before: two more loads per width)
  const ts = Date.now(); console.log(`sections ${W}…`);
  let pairing = null; let br = null;
  try {
    if ((!lp && !lsCached) || !bp) { // the stitch-shot path, or a capture that failed on one side: open what is missing
      br = await launch();
      if (!lp && !lsCached) { lp = await openPage(br, live, { width: W, height: vh, ...overlays }); await settle(lp, 800, 50, 400); }
      if (!bp) { bp = await openPage(br, build, { width: W, height: vh }); await settle(bp, 800, 50, 400); }
    }
    const ls = lsCached || await liveSections(lp, { mainSel: contentRoot, headerSel: profile?.chrome?.header?.selector || null, footerSel: profile?.chrome?.footer?.selector || null, sections: sectionSels });
    if (!lsCached) writeFileSync(lsFile, JSON.stringify({ key: lsKey, ls })); else t.liveSplit = 'cached';
    pairing = await pairSections(bp, ls, { secSel });
  } catch (e) { console.log(`sections ${W}: pairing failed — ${String(e.message || e).slice(0, 160)}`); await closeCtx(); continue; } finally { if (br) await br.close().catch(() => {}); } // a pairing that threw left this browser open and the gate never exited (bench, cibc)
  await closeCtx();
  const A = PNG.sync.read(readFileSync(origin)); const B = PNG.sync.read(readFileSync(eds)); const w = Math.min(A.width, B.width);
  const rowsOf = (img, y0, h) => { if (img.width === w) return img.data.subarray(y0 * w * 4, (y0 + h) * w * 4); const o = Buffer.alloc(w * h * 4); for (let y = 0; y < h; y += 1) img.data.copy(o, y * w * 4, (y0 + y) * img.width * 4, (y0 + y) * img.width * 4 + w * 4); return o; };
  const key = budgetKey(W); const table = [];
  for (const s of pairing.sections) {
    // the section's share of the PAGE diff: the same absolute rows on both captures (the authored section's stride), as pixel-compare reads
    // them — aligning each side on its own section top read an 11 px shifted crop as 6 % on a 0 px page (sdt-dentsu profiles); a
    // cumulative offset at the section's top is printed as Δy and explained by an upstream row's Δh
    const by0 = Math.max(0, Math.min(B.height, s.build.y0)); const ly0 = Math.min(A.height, by0);
    const h = Math.max(0, Math.min(s.build.h, B.height - by0, A.height - ly0));
    const n = h > 0 ? pixelmatch(rowsOf(A, ly0, h), rowsOf(B, by0, h), null, w, h, { threshold: 0.1 }) : 0;
    const pct = h > 0 ? Number(((100 * n) / (w * h)).toFixed(2)) : null; const dh = s.live ? s.build.h - s.live.h : null; const dy = s.live ? s.build.y0 - s.live.y0 : null;
    // the block: the triage row of the live section(s) when given, else the authored `.block` class
    let block = s.block; let variant = s.variant; let blockSource = block ? 'dom' : null; let matchKind = null;
    if (triage && s.live) { const rowT = s.live.indices.map((i) => triageRowFor(triage, { index: i, anchorText: s.live.anchorText })).find((r) => r && r.match && r.match.block) || null; if (rowT) { block = rowT.match.block; variant = rowT.match.variant; blockSource = 'triage'; matchKind = rowT.match.kind; } }
    const inv = findBlock(block, variant); const budget = inv?.budget ? inv.budget[key] ?? null : null;
    const status = !block ? 'default' : budget === null ? 'new' : 'reused';
    // Δh counts against the budget only as a height (`dhKind: height`): a boundary the next row cancels is a box attribution, not a shift
    const over = []; if (status === 'reused' && budgetOn) { if (pct !== null && pct > budget) over.push('pct'); if (dh !== null && Math.abs(dh) > 2 && s.dhKind !== 'boundary') over.push('Δh'); }
    const row = { index: s.index, anchorText: s.anchorText || s.liveAnchorText || '', classes: s.classes, build: s.build, live: s.live ? { y0: s.live.y0, y1: s.live.y1, h: s.live.h, box: s.live.box, indices: s.live.indices } : null, comparedRows: h, dh, dhKind: s.dhKind ?? null, dy, pct, block, variant, blockSource, matchKind, inventoryVariant: inv ? inv.variant : null, budget, budgetKey: key, status, over: over.join('+') || null };
    table.push(row); if (over.length) overAll.push({ W, index: s.index, anchorText: row.anchorText, block: `${block}${variant ? ` (${variant})` : ''}`, pct, budget, dh, over: over.join('+') });
  }
  newCount = Math.max(newCount, table.filter((r) => r.status === 'new').length); defaultCount = Math.max(defaultCount, table.filter((r) => r.status === 'default').length);
  const col = (v, n) => String(v ?? '—').padStart(n);
  liveSectionCount = Math.max(liveSectionCount, pairing.sections.length);
  console.log(`\nsections at ${W} (${pairing.sections.length} authored, ${pairing.sections.filter((s) => s.live).length} paired with ${pairing.sections.reduce((a, s) => a + (s.live ? s.live.indices.length : 0), 0)} live sections${pairing.unpaired.length ? `, ${pairing.unpaired.length} live unpaired` : ''}${pairing.chrome.length ? `, ${pairing.chrome.length} live in the build's chrome` : ''}${pairing.empty.length ? `, ${pairing.empty.length} empty authored skipped` : ''}; Δ doc ${pairing.build.doc - pairing.live.doc}; pairing ${pairing.mode}${pairing.mode === 'anchor' && triage ? ' — the live split and the authored sections differ in count: the document, not the CSS' : ''}; live root ${pairing.live.root?.name || '?'}${pairing.live.root?.requested && !pairing.live.root.resolved ? ` (${pairing.live.root.requested} did not resolve)` : ''}, split ${pairing.live.split}; rows are the authored strides read at the same y on both captures)`);
  if (pairing.mismatches?.length) console.log(`    anchor check: ${pairing.mismatches.map((m) => `live ${m.live} "${(m.anchorText || '').slice(0, 20)}" starts a text in authored ${m.anchorIn}, paired to ${m.pairedTo} by index`).join('; ')}`);
  console.log(' #  anchor                       build y0–y1      live y0–y1         Δh    Δy  pixel %  block                        budget  over');
  for (const r of table) console.log(`${col(r.index, 2)}  ${(r.anchorText || '(no text)').slice(0, 26).padEnd(28)} ${`${r.build.y0}–${r.build.y1}`.padEnd(16)} ${(r.live ? `${r.live.y0}–${r.live.y1}` : '— (unpaired)').padEnd(16)} ${col(r.dh === null ? '—' : `${r.dh}${r.dhKind === 'boundary' ? 'b' : ''}`, 5)} ${col(r.dy, 5)}  ${col(r.pct === null ? '—' : r.pct.toFixed(2), 7)}  ${(r.block ? `${r.block}${r.variant ? ` (${r.variant})` : ''}${r.blockSource === 'triage' ? ' ◂triage' : ''}` : 'default content').slice(0, 28).padEnd(28)} ${col(r.status === 'reused' ? r.budget : `${r.status} (no budget)`, 6)}  ${r.over || ''}`);
  if (table.some((r) => r.dhKind === 'boundary')) console.log('    Δh marked b: a boundary another row closes (one gap attributed to two different sections; the offset chain returns) — not a height, not over budget');
  for (const u of pairing.unpaired) console.log(`    live "${(u.anchorText || '(no text)').slice(0, 26)}" y ${u.box ? `${u.box[1]}–${u.box[1] + u.box[3]}` : '?'} located in no authored section`);
  sectionRuns[W] = join(out, `sections-${W}.json`);
  t.sections = secs(ts);
  writeFileSync(sectionRuns[W], JSON.stringify({ _schema: 'stardust-lite/gate-sections@2', _writtenAt: new Date().toISOString(), width: W, live, build, budgetKey: key, chrome: chromeRuns[W] || null, triage: typeof arg('--triage', null) === 'string' ? resolve(arg('--triage')) : null, blocks: blocks.length ? blocksFile : null, doc: { live: pairing.live.doc, build: pairing.build.doc }, pairing: { mode: pairing.mode, contentRoot: pairing.live.root, split: pairing.live.split, sectionSelectors: sectionSels, mismatches: pairing.mismatches }, sections: table, unpaired: pairing.unpaired, liveInChrome: pairing.chrome, emptyAuthored: pairing.empty }, null, 1));
}
if (browser) await browser.close();
const probe = widths.includes(2560) ? 2560 : Math.max(...widths);
const tTail = {}; let tc0 = Date.now();
console.log(full ? 'cap-probe…' : 'cap-probe: skipped (a round; the final gate runs it, --full forces it)'); const cap = !full ? { stdout: 'cap-probe: skipped (round)' } : run([join(S, 'cap-probe.mjs'), live, '--against', build, '--build-main', arg('--build-main', 'main'), ...(liveMain ? ['--main', liveMain] : []), ...liveOpts, '--out', join(out, 'cap.json')], true);
// the verdict AND the failing rows: "FAIL — 1 of 4 rows" without the row sent walgreens-home to run cap-probe --against by hand
let capLine = [(cap.stdout.match(/cap-probe: .*/) || ['cap-probe: (no verdict line)'])[0], ...cap.stdout.split('\n').filter((l) => /^\s*✗/.test(l))].join('\n');
// a page whose content root holds one module (a banner + one article) gives cap-probe the module's own columns as "modules" (a 472 text
// column read as a content cap, the build asked for a 472 wrapper): its row verdict is advisory there — 7 of 10 sdt-dentsu pages FAILed at
// 2560 with Δh 0 on every section; the section table is the reading
tTail.cap = full ? secs(tc0) : 0;
if (liveSectionCount > 0) capLine = capLine.replace(/^(cap-probe: [^\n]*)/, `$1 (gate's live split: ${liveSectionCount} sections — a cap-probe count that differs between runs is its own split, #162: compare the rows, not the verdict)`);
if (liveSectionCount > 0 && liveSectionCount <= 2 && /FAIL/.test(capLine)) capLine = capLine.replace(/^(cap-probe: [^\n]*)/, `$1 — advisory: a ${liveSectionCount}-section page, the probe's modules are one module's own columns; read the section table`);
let motionLine = '';
if (arg('--probes', null)) {
  const lines = readFileSync(arg('--probes'), 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  // CSS only: motion-observe resolves selectors with querySelector; a Playwright pseudo-class (`:visible`, `:has-text()`) costs a whole run (walgreens-home)
  const bad = lines.filter((l) => /:(visible|hidden|has-text|text|text-is|nth-match|is-visible)\b/.test(l)); if (bad.length) { console.error(`gate: probes are CSS selectors, not Playwright locators — use an id or :nth-of-type to reach the visible copy:\n  ${bad.join('\n  ')}`); process.exit(1); }
  // `chrome:` prefix: run the probe even when the chrome is masked (a header hover the page changes)
  const parsed = lines.map((l) => { const forced = /^chrome:\s*/i.test(l); const m = l.replace(/^chrome:\s*/i, '').match(/^(hover|click)\s+(.+?)\s*=>\s*(.+)$/); if (m) m.forced = forced; return m; }).filter(Boolean);
  const clicks = parsed.filter((m) => m[1] === 'click').map((m) => m[2]);
  if (clicks.length) {
    const br = await launch(); const pg = await openPage(br, live, { width: 1440, ...overlayOpts() });
    const nav = await pg.evaluate((sels) => sels.filter((s) => { let e; try { e = document.querySelector(s); } catch { return false; } const a = e && e.closest('a[href]'); if (!a) return false; const h = a.getAttribute('href') || ''; return h && !h.startsWith('#') && !/^javascript:/i.test(h) && a.getAttribute('target') !== '_blank' && !(a.getAttribute('role') === 'button') && a.href.split('#')[0] !== location.href.split('#')[0]; }), clicks);
    await br.close();
    if (nav.length) { console.error(`gate: ${nav.length} click probe(s) target a link that navigates on the live side — dropped (the click destroys the live context and the motion run; hover the item or use click-state --hover):\n  ${nav.join('\n  ')}`); for (const m of parsed) if (m[1] === 'click' && nav.includes(m[2])) m.drop = true; }
  }
  if (chromeOn && hasChrome && parsed.some((m) => !m.drop && !m.forced)) { // nothing masked (no chrome heights) → every probe runs (6 header probes skipped on a template run, manulife)
    // the chrome is approved: a probe whose build target sits in header/footer is skipped (prefix the line `chrome:` to keep it)
    const br = await launch(); const pg = await openPage(br, build, { width: 1440 });
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
console.log(`\n| width | pixel %${chromeOn ? ' (header / footer bands MASKED — --no-chrome for the full page)' : ''} | Δh | bands |\n|---|---|---|---|`);
rows.forEach((r) => console.log(`| ${r.W} | ${r.pct} | ${r.dh} | ${r.bands} |`));
let budgetLine = '';
if (budgetOn && Object.keys(sectionRuns).length) {
  budgetLine = `budget: ${overAll.length ? 'FAIL' : 'PASS'} (${overAll.length} over${newCount ? `, ${newCount} new` : ''}${defaultCount ? `, ${defaultCount} default content` : ''}; budgets of ${basename(dirname(blocksFile))}/${basename(blocksFile)})`;
  for (const o of overAll) budgetLine += `\n  ✗ ${o.W} #${o.index} "${o.anchorText.slice(0, 24)}" ${o.block}: ${o.over.includes('pct') ? `${o.pct} % > budget ${o.budget}` : ''}${o.over === 'pct+Δh' ? ', ' : ''}${o.over.includes('Δh') ? `Δh ${o.dh} px > 2` : ''}`;
}
const tLine0 = widths.map((W) => { const t = timing[W] || {}; const f = (v) => (v === null || v === undefined ? '—' : `${v} s`); return `${W}: live ${t.live === 0 ? `cached${t.liveOpen ? ` (opened ${t.liveOpen} s)` : ''}` : f(t.live)}, build ${f(t.build)}, compare ${f(t.compare)}, sections ${f(t.sections)}`; }).join(' | ');
const specDir = [originFrom, arg('--origin', null), arg('--spec-dir', null), join(out, '..', 'measure'), 'measure'].filter((d) => typeof d === 'string').map((d) => resolve(d)).find((d) => widths.some((W) => existsSync(join(d, `spec-${W}.json`))));
let sectionsLine = '';
tc0 = Date.now();
if (full && specDir && /^https?:/.test(build)) { // the build is a URL: `sections <build> --widths … --spec-dir <dir>` in one browser — its verdict and the rows off
  const sw = widths.filter((W) => existsSync(join(specDir, `spec-${W}.json`)));
  const sr = spawnSync(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), 'sections.mjs'), build, '--widths', sw.join(','), '--spec-dir', specDir, ...(typeof arg('--triage', null) === 'string' ? ['--triage', arg('--triage')] : []), ...(blocks.length ? ['--blocks', blocksFile] : []), ...liveOpts.filter((x) => x !== '--require')], { encoding: 'utf8' });
  const ls = sr.stdout.split('\n'); sectionsLine = [...ls.filter((l) => /^rows at \d+:/.test(l)), ...ls.filter((l) => /^tables: /.test(l))].join('\n') || `sections: ${(sr.stderr || sr.stdout).trim().split('\n').pop()}`;
}
tTail.sections = full && specDir ? secs(tc0) : 0;
const target = Number(arg('--target', profile?.target ?? 10));
const threeW = [360, baseW, probeW]; const underAt = (W) => rows.some((r) => r.W === W && typeof r.pct === 'number' && r.pct < target);
const targetLine = `target ${target} %: ${threeW.every(underAt) ? 'REACHED at the three widths' : widths.every(underAt) ? `under at ${widths.join(' / ')} — not yet gated at ${threeW.filter((W) => !widths.includes(W)).join(' / ')}` : `not yet — over at ${widths.filter((W) => !underAt(W)).join(' / ')}`}`;
let digest = '';
if (roundMode) {
  const W = widths[0]; let now = []; try { now = JSON.parse(readFileSync(join(out, `sections-${W}.json`), 'utf8')).sections || []; } catch { /* no table */ }
  const prev = prevSections[W]; const lines = [];
  // pair's hot rows per live section (Δy·loc = the section's own offset) when the spec is at hand
  const pairRows = {}; const tp0 = Date.now(); if (specDir && existsSync(join(specDir, `spec-${W}.json`))) { const pr = spawnSync(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), 'pair.mjs'), join(specDir, `spec-${W}.json`), build, '--max', '400', ...liveOpts.filter((x) => x !== '--require')], { encoding: 'utf8' }); let sec = null; for (const l of pr.stdout.split('\n')) { const m = /^-- section (\d+)/.exec(l); if (m) { sec = Number(m[1]); continue; } if (sec !== null && /^.{30,32}\[/.test(l) && !/^anchor /.test(l)) { (pairRows[sec] ||= []).push(l.replace(/\s+\|.*$/, '').replace(/\s{2,}/g, ' ').trim()); } } } tTail.pair = secs(tp0);
  const originPng = join(out, `live-${W}.png`); const buildPng = join(out, `build-${W}.png`); // the captures this run compared
  const shiftOf = (s) => { if (!s.live || !existsSync(originPng) || !existsSync(buildPng)) return ''; const sp = spawnSync(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), 'shift-probe.mjs'), originPng, buildPng, '--x0', '0', '--x1', String(W), '--y0', String(s.live.y0), '--y1', String(s.live.y1), '--r', '8', '--step', '2'], { encoding: 'utf8' }); const m1 = /best shift build→live dx=(-?\d+) dy=(-?\d+) → ([\d.]+)(.*)$/m.exec(sp.stdout); const m2 = /ratio ([\d.]+)(.*)$/m.exec(sp.stdout); return `${m1 ? `shift dx ${m1[1]} dy ${m1[2]}${m1[4].trim().slice(0, 60)}` : ''}${m2 ? `; luminance ratio ${m2[1]}${m2[2].trim().slice(0, 50)}` : ''}`; };
  const moved = []; let clean = true;
  for (const s of now) {
    const p = prev ? prev.find((x) => x.index === s.index) : null; const dPct = p && p.pct !== null && s.pct !== null ? Number((s.pct - p.pct).toFixed(2)) : null; const dDh = p && p.dh !== null && s.dh !== null ? s.dh - p.dh : null;
    const off = (s.dh !== null && Math.abs(s.dh) > 2 && s.dhKind !== 'boundary') || (s.pct !== null && s.pct > (s.budget ?? 1.5)); if (off) clean = false;
    if (!prev || off || (dPct !== null && Math.abs(dPct) >= 0.1) || (dDh !== null && dDh !== 0)) {
      const points = s.dh !== null && Math.abs(s.dh) > 2 ? `Δh ${s.dh > 0 ? '+' : ''}${s.dh}: a height — padding, margin, line-height or a wrapped line in this section` : s.pct !== null && s.pct > 1 ? `Δh 0 but pixels — ${shiftOf(s) || 'paint or position (shift-probe the band)'}; the pair rows below name the child (a fractional height, a pinned link, a control's width)` : 'within tolerance';
      const live = s.live?.indices || []; const hot = live.flatMap((i) => pairRows[i] || []).slice(0, 3);
      moved.push(`  #${s.index} ${String(s.anchorText || s.classes || '').slice(0, 26).padEnd(28)} ${s.pct ?? '—'} %${dPct !== null ? ` (${dPct > 0 ? '+' : ''}${dPct})` : ''}  Δh ${s.dh ?? '—'}${dDh !== null && dDh !== 0 ? ` (was ${p.dh})` : ''}${s.block ? `  ${s.block}` : ''} — ${points}${hot.length ? `\n      ${hot.join('\n      ')}` : ''}`);
    }
  }
  const basePct = rows.find((r) => r.W === W)?.pct;
  digest = `\nround digest at ${W}${prev ? ' (vs the previous round in this dir)' : ' (first round here)'}: page ${basePct} %${moved.length ? `\n${moved.join('\n')}` : '\n  no section moved'}`;
  digest += threeW.every(underAt) ? `\nstop: under ${target} % at the three widths — the prototype is done; deploy and name the residuals in the register (polish after this is outside the clock)`
    : widths.every(underAt) ? `\nnext: under ${target} % at ${widths.join(' / ')} — gate the round at the three widths (--widths 360,${baseW},${probeW})`
    : clean ? `\nstop: the base width is clean (every section within 2 px${budgetOn ? ' and budget' : ''}) — run the three widths with --probes, then name the residuals in the register` : `\nnext: one round, changing only what the rows above name`;
}
const tLine = `${tLine0} | cap-probe ${tTail.cap} s, sections pass ${tTail.sections} s, pair ${tTail.pair ?? 0} s | total ${secs(tStart)} s`;
console.log(`\n${targetLine}\n${capLine}${sectionsLine ? `\n${sectionsLine}` : ''}${motionLine ? `\n${motionLine}` : ''}${budgetLine ? `\n${budgetLine}` : ''}${digest}\ntiming (${captureTool}${captureTool === 'stitch' ? ', live and build concurrent' : ''}): ${tLine}\nevidence: ${out}/`);
writeFileSync(join(out, 'gate.json'), JSON.stringify({ _schema: 'stardust-lite/gate@1', _writtenAt: new Date().toISOString(), live, build, slug, widths, rows, timing, timingTail: { ...tTail, total: secs(tStart) }, target: { pct: target, reached: threeW.every(underAt), line: targetLine }, captureTool, origin: originFrom, chrome: { on: chromeOn, template: isTemplate, byWidth: chromeRuns }, cap: { verdict: capLine.split('\n')[0], failing: capLine.split('\n').slice(1) }, motion: motionLine || null, budget: { on: budgetOn, verdict: budgetOn ? (overAll.length ? 'FAIL' : 'PASS') : null, over: overAll, newSections: newCount, defaultSections: defaultCount, blocks: blocks.length ? blocksFile : null }, sections: sectionRuns }, null, 1));
process.exit(0); // nothing may keep the gate alive after gate.json (a dangling page held a bench run 11 min)
