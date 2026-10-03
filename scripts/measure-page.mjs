#!/usr/bin/env node
// measure-page.mjs — step 1 in ONE session per width: one browser context and one page load per width (the profile's overlays through
// `openPage`, a reload-on-consent waited out), then from that single settled page everything that took five or six loads — probe-load's
// first look (read BEFORE the overlays are clicked, as probe-load reads it), probe-structure's dump, content-dump's JSON, media-list's
// inventory (its response listener armed before navigation, in the context), live-spec's spec + captured DOM and deep-probe's default
// property set. Byte-compatible outputs, so every downstream instrument (`content-view`, `triage`, `media-fetch`, `sections`, `pair`,
// `author`, `block-inventory`) keeps working; the single instruments stay for targeted re-reads (`--pierce`, `--click`, `--props`,
// `--anim`, another depth). Not a new reading — a cheaper one, and one that removes the half-loaded-page and session-drift classes
// (walgreens, stryker, audemarspiguet) because every number of a width comes from the same page (SCALING-PLAN §2.H, batch-7 rollout).
// Usage: node measure-page.mjs <url> --out <dir> [--widths 360,1440,2560] [--sections <css>] [--main <css>] [--header <css>] [--footer <css>]
//        [--deep <file | css,css,…>] [--hidden <css,…>] [--no-spec] [--depth 3] [--vh 900] [--parallel 3] [--wait 4000] [--no-capture] [--tol 2] [--noise [W,…|all]]
//   --noise      the noise floor from the same run: a second capture of the base width (or the widths named, `all`) from a fresh context,
//                `live-<W>-b.png`, and its self-diff against `live-<W>.png` — `noise floor: <W> 0.12 % (Δh 0)`, `noise` in summary.json
//                (six commands typed by hand before — scotiabank-personal; a band far above the rest is a composition, METHOD prerequisites)
//        [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--require <css,…>] [--site <site.json> | --no-site]
//   --capture    (default ON) after the dumps, from the same settled session, the stitched full-page capture `live-<W>.png` — the shape
//                stitch-shot writes (doc width × settled height, chunked by --vh, motion frozen after the settle; lib/stitch.mjs), so the
//                gate (`--origin <this dir>`, its default when the dir holds the width) and pixel-compare read it unchanged: the live page
//                is loaded ONCE per width for measurement, prototype gate and served gate (sdt-dentsu speed). --no-capture turns it off.
//   profile check: with a site profile, the per-width checks of `site-profile check` (status, overlay controls resolve, require markers,
//                header / footer heights within --tol of the profile, fixed layer at the top) run from these sessions — one
//                `profile check: PASS|WARN|FAIL — …` line, `profileCheck` in summary.json; run `site-profile check` on its own on a FAIL
//   --sections   live-spec's section selector (default `main > .section`; for a source page pass its own — the structure dump shows it);
//                also the default --deep set (each section root) — the summary notes a selector that matches nothing
//   --main       the content root: the structure dump's root and the content dump's main root (default: the profile's cap main selector,
//                else the largest ancestor of `main` / `[role=main]` that adds no chrome — roster's rule, so a hero that sits before
//                `main` in the same wrapper is content: dentsu). The dump's key is `main` when that root is the `<main>` element, else
//                the root's short selector (`div.main-container`) — the keys the cases dumped; `--main <css>` is used as given
//   --deep       deep-probe's selectors (a file, one per line, or an inline list); default: the header, every section root, the footer
//   --hidden     content-dump's hidden-but-present roots (dumped without the visibility test, keys `hidden <sel>`)
//   --parallel   widths read at once, never more than 3 (three contexts on one browser)
// Writes per width: probe-load-<W>.txt, structure-<W>.txt, content-<W>.json, media-<W>.json, spec-<W>.json + dom-<W>.html, deep-<W>.txt, live-<W>.png;
// and summary.json { url, widths, elapsedByWidth, files, captures, profileCheck, sectionsSelector, mainRoot, fixedLayers, shadowRoots, notes }. Prints one table.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { arg, openPage, settle, overlayOpts, contextOptions, siteProfile, DEEP_HELPERS, launch } from './common.mjs';
import { collectContent } from './lib/content-collector.mjs';
import { collectSpec } from './lib/spec-collector.mjs';
import { firstLook, collectStructure, collectMedia, fontResponse, deepProbe } from './lib/probe-collectors.mjs';
import { contentRootPath } from './lib/section-pair.mjs';
import { stitchCapture, captureUrl } from './lib/stitch.mjs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { statusRow, overlayRows, chromeRows, verdictOf } from './lib/profile-check.mjs';

const url = process.argv[2];
if (!url || url.startsWith('--') || !arg('--out', null) || arg('--out') === true) { console.error('usage: measure-page.mjs <url> --out <dir> [--widths 360,1440,2560] [--sections <css>] [--main <css>] [--header <css>] [--footer <css>] [--deep <file|css,…>] [--hidden <css,…>] [--no-spec] [--depth 3] [--vh 900] [--parallel 3] [--no-capture] [--noise [W,…|all]] [--tol 2] [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--require <css,…>] [--site <file>]'); process.exit(1); }
const out = resolve(arg('--out')); mkdirSync(out, { recursive: true });
const profile = siteProfile(); const overlays = overlayOpts();
const widths = String(arg('--widths', (profile?.widths || [360, 1440, 2560]).join(','))).split(',').map(Number).filter((w) => Number.isFinite(w) && w > 0);
const vh = Number(arg('--vh', 900)); const wait = Number(arg('--wait', 4000)); const depth = Number(arg('--depth', 3));
const sections = String(arg('--sections', 'main > .section')); const header = String(arg('--header', 'header')); const footer = String(arg('--footer', 'footer'));
const mainSel = typeof arg('--main', null) === 'string' ? arg('--main') : (profile?.cap?.contentRoot && profile.cap.contentRoot !== 'main' ? profile.cap.contentRoot : profile?.cap?.contentRoot === 'main' ? 'main' : profile?.cap?.mainSelector || null); // the content root (site-profile init records it from this summary), else the cap shell
const hidden = String(arg('--hidden', '')).split(',').map((s) => s.trim()).filter(Boolean);
const noSpec = process.argv.includes('--no-spec');
const capture = !process.argv.includes('--no-capture'); const tol = Number(arg('--tol', 2));
const parallel = Math.max(1, Math.min(3, Number(arg('--parallel', 3)) || 3)); // never more than three contexts at once
const deepArg = arg('--deep', null);
// `--deep` is a file (one per line; `# ` comments) or, when no such file exists, an inline comma list (deep-probe's rule)
const deepSels = typeof deepArg === 'string' ? (existsSync(deepArg) ? readFileSync(deepArg, 'utf8').split('\n') : deepArg.split(',')).map((s) => s.trim()).filter((s) => s && !/^(#\s|#$|\/\/)/.test(s)) : null;
const DEEP_MAX = deepSels ? 3 : 60; // the default set reads every section root, not the first three

const notes = [];
if (profile) notes.push(`profile ${profile._file}${mainSel && typeof arg('--main', null) !== 'string' ? ` (cap main ${mainSel})` : ''}`);
if (noSpec) notes.push('--no-spec: no spec / dom written');
if (!capture) notes.push('--no-capture: no live-<W>.png written (the gate captures its own origin)');
const browser = await launch();
const results = {};

async function measure(W) {
  const t0 = Date.now(); const log = (m) => console.error(`[${W}] ${m}`);
  const ctx = await browser.newContext(contextOptions({ width: W, height: vh, locale: overlays.locale }));
  const fontReqs = []; let lockBefore = ''; let status = null; const firstLines = []; const checkRows = [];
  let page;
  try {
    page = await openPage(ctx, url, {
      width: W, height: vh, consent: overlays.consent, dismiss: overlays.dismiss, locale: overlays.locale, require: overlays.require, wait,
      before: (p) => { // armed before navigation: the font files requested (media-list) and the navigation status (probe-load)
        p.on('response', (r) => { const u = fontResponse(r); if (u) fontReqs.push(u); try { if (r.request().isNavigationRequest() && r.frame() === p.mainFrame()) status = r.status(); } catch { /* detached */ } });
        p.on('domcontentloaded', async () => { lockBefore = await p.evaluate(() => `${getComputedStyle(document.body).overflow}/${getComputedStyle(document.documentElement).overflow}`).catch(() => ''); });
      },
      afterLoad: async (p) => { // probe-load's first look: before any overlay is dismissed
        const info = await p.evaluate(firstLook);
        firstLines.push(`status ${status ?? '?'} url ${p.url()}`, JSON.stringify(info, null, 1));
        if (!info.fixed.length) firstLines.push(`no fixed or sticky layer at ${W}`);
        if (info.unassigned?.length) firstLines.push(`UNASSIGNED painted band(s) outside header / main / footer at ${W} — dumped as extra roots: ${info.unassigned.join(' ; ')}`);
        for (const sel of [overlays.consent, ...overlays.dismiss].filter(Boolean)) { const n = await p.evaluate((s) => { try { return document.querySelectorAll(s).length; } catch { return -1; } }, sel); firstLines.push(`overlay control ${sel}: ${n < 0 ? 'invalid selector' : n ? `${n} match${n > 1 ? 'es' : ''}` : 'ABSENT'}`); }
        results[W] = { first: info };
        if (profile) checkRows.push(...await overlayRows(p, profile, W)); // the profile's controls, read before they are clicked
      },
    });
  } catch (e) { await ctx.close().catch(() => {}); return { W, error: String(e.message || e).split('\n')[0].slice(0, 200), elapsed: (Date.now() - t0) / 1000 }; }
  log(`loaded (${((Date.now() - t0) / 1000).toFixed(1)} s), settling…`);
  await settle(page);
  if (profile) { checkRows.unshift(statusRow(W, status)); checkRows.push(...await chromeRows(page, profile, W, { tol })); }
  const files = {};
  const write = (name, data) => { writeFileSync(join(out, name), data); files[name.replace(/-\d+(\.\w+)$/, '$1').replace(/\.\w+$/, '')] = join(out, name); };
  // the content root (--main / cap main / roster's rule): the structure dump's root and the content dump's main root, under the key
  // `main` when it is the <main> element, else its short selector (the dentsu case dumped `div.main-container`: the hero sits before main)
  const root = await page.evaluate(contentRootPath, [mainSel]);
  const hasMain = await page.evaluate(() => !!document.querySelector('main'));
  const explicit = typeof arg('--main', null) === 'string';
  const contentMain = explicit ? arg('--main') : root.tag === 'main' ? 'main' : root.name;
  write(`probe-load-${W}.txt`, firstLines.join('\n') + '\n');
  const structure = await page.evaluate(collectStructure, { root: root.path, depth, pierce: false });
  write(`structure-${W}.txt`, structure);
  // the unassigned bands of the first look are content roots too (keys = their selector, before main in the file order)
  const extraRoots = (results[W]?.first?.unassigned || []).map((s) => s.split(' [')[0]).filter((s) => /^[a-z][a-z0-9-]*(#[\w-]+)?(\.[\w-]+)*$/i.test(s));
  const content = await page.evaluate(collectContent, [[header, ...extraRoots, explicit || root.tag === 'main' ? contentMain : root.path, footer], hidden]);
  if (!explicit && root.tag !== 'main' && root.path !== contentMain) { const o = {}; for (const [k, v] of Object.entries(content)) o[k === root.path ? contentMain : k] = v; Object.assign(content, o); for (const k of Object.keys(content)) if (!(k in o)) delete content[k]; }
  write(`content-${W}.json`, JSON.stringify(Object.fromEntries([header, ...extraRoots, contentMain, footer, ...hidden.map((h) => `hidden ${h}`), '__doc', '__title', '__desc'].filter((k) => k in content).map((k) => [k, content[k]])), null, 1));
  const media = await page.evaluate(collectMedia); media.lockBefore = lockBefore; media.fontRequests = [...new Set(fontReqs)];
  write(`media-${W}.json`, JSON.stringify(media, null, 1));
  let spec = null;
  if (!noSpec) {
    const full = await page.evaluate(collectSpec, { sections, header, footer }); const { html, ...rest } = full; spec = rest;
    write(`spec-${W}.json`, JSON.stringify(rest, null, 1)); write(`dom-${W}.html`, html);
  }
  const sels = deepSels || [header, sections, footer];
  const deep = await page.evaluate(new Function('args', `${DEEP_HELPERS}\n return (${String(deepProbe)})(args);`), [sels, DEEP_MAX, false, [], false]);
  write(`deep-${W}.txt`, deep + '\n');
  const nSections = await page.evaluate((s) => { try { return document.querySelectorAll(s).length; } catch { return -1; } }, sections);
  // the scrolled state: which layers are fixed / sticky after one viewport and how far the first content box moved — a mobile bar that pins on
  // scroll took 50 px out of the flow from chunk 2 on and no table at rest showed it (360 at 15 % for three rounds, cibc-careers, loop r2)
  const scrolled = await page.evaluate(async ([vh, rootPath]) => {
    const sel = (el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${[...el.classList].slice(0, 3).map((c) => '.' + c).join('')}`;
    const pinned = () => [...document.querySelectorAll('body *')].filter((el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return (cs.position === 'fixed' || (cs.position === 'sticky' && r.top <= 1)) && r.width > 0 && r.height > 0 && cs.visibility !== 'hidden'; }).map((el) => `${sel(el)} h${Math.round(el.getBoundingClientRect().height)}`);
    const root = document.querySelector(rootPath) || document.querySelector('main') || document.body; const first = [...root.children].find((c) => c.getBoundingClientRect().height > 0) || root;
    const y0 = Math.round(first.getBoundingClientRect().top + scrollY); const at0 = pinned();
    window.scrollTo(0, vh); await new Promise((r) => setTimeout(r, 500)); const at1 = pinned(); const y1 = Math.round(first.getBoundingClientRect().top + scrollY);
    window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 400));
    return { at0, at1, shift: y1 - y0, newlyPinned: at1.filter((x) => !at0.includes(x)) };
  }, [vh, root.path]).catch(() => null);
  let cap = null;
  if (capture) { // last: the freeze changes the page (animations paused, timers cleared) — every reading above is done
    const tc = Date.now();
    try { cap = await stitchCapture(page, join(out, `live-${W}.png`), { vh }); files.live = join(out, `live-${W}.png`); cap.seconds = Number(((Date.now() - tc) / 1000).toFixed(1)); log(`captured live-${W}.png ${cap.width}x${cap.height} from ${cap.chunks} chunks in ${cap.seconds} s${cap.timedOut ? ` (${cap.timedOut} chunk waits hit the bound)` : ''}`); } catch (e) { cap = { error: String(e.message || e).split('\n')[0].slice(0, 200) }; log(`capture failed: ${cap.error}`); }
  }
  await ctx.close();
  const elapsed = Number(((Date.now() - t0) / 1000).toFixed(1));
  log(`done in ${elapsed} s`);
  return { W, elapsed, status, files, root, contentMain, hasMain, cap, checkRows, first: results[W]?.first || null, doc: content.__doc, unassigned: extraRoots, scrolled, contentRoots: [header, ...extraRoots, contentMain, footer].map((r) => `${r}: ${(content[r] || []).length}`), hiddenRoots: hidden.map((r) => `${r}: ${(content[`hidden ${r}`] || []).length}`), media: { imgs: media.imgs.length, videos: media.videos.length, bgs: media.bgs.length, svgs: media.svgs.length, faces: media.faces.length, fontRequests: media.fontRequests.length }, spec: spec ? { secs: spec.secs.length, items: spec.secs.reduce((n, s) => n + s.items.length, 0), running: spec.running, entrance: spec.secs.reduce((n, s) => n + s.items.filter((it) => it.ent).length, 0) } : null, nSections, deepLines: deep.split('\n').length };
}

// up to `parallel` widths at once, in order
const rows = []; const queue = [...widths];
await Promise.all(Array.from({ length: Math.min(parallel, queue.length) }, async () => { while (queue.length) { const W = queue.shift(); rows.push(await measure(W)); } }));
// --noise: a second capture per named width from a fresh context, then the self-diff over the common area (gate's pixelmatch threshold)
const noise = {};
const selfDiff = (fa, fb) => { const A = PNG.sync.read(readFileSync(fa)); const B = PNG.sync.read(readFileSync(fb)); const w = Math.min(A.width, B.width); const h = Math.min(A.height, B.height); const rows = (P) => { if (P.width === w) return P.data.subarray(0, w * h * 4); const o = Buffer.alloc(w * h * 4); for (let y = 0; y < h; y++) P.data.copy(o, y * w * 4, y * P.width * 4, y * P.width * 4 + w * 4); return o; }; const n = pixelmatch(rows(A), rows(B), null, w, h, { threshold: 0.1 }); return { pct: Number(((n / (w * h)) * 100).toFixed(2)), dh: B.height - A.height, w, h }; };
if (process.argv.includes('--noise') && capture) {
  const v = arg('--noise', true); const base = widths.includes(1440) ? 1440 : widths[Math.floor(widths.length / 2)];
  const nw = v === true ? [base] : v === 'all' ? widths : String(v).split(',').map(Number).filter((w) => widths.includes(w));
  for (const W of nw) {
    const a = join(out, `live-${W}.png`); if (!existsSync(a)) { noise[W] = { error: 'no first capture' }; continue; }
    const ctx = await browser.newContext(contextOptions({ width: W, height: vh, locale: overlays.locale })); const tn = Date.now();
    try { const r = await captureUrl(ctx, url, join(out, `live-${W}-b.png`), { width: W, vh, wait, consent: overlays.consent, dismiss: overlays.dismiss, locale: overlays.locale, require: overlays.require }); await r.page.close().catch(() => {}); noise[W] = { ...selfDiff(a, join(out, `live-${W}-b.png`)), file: join(out, `live-${W}-b.png`), seconds: Number(((Date.now() - tn) / 1000).toFixed(1)) }; } catch (e) { noise[W] = { error: String(e.message || e).split('\n')[0].slice(0, 160) }; }
    await ctx.close().catch(() => {});
    if (noise[W].pct > 1) notes.push(`${W}: noise floor ${noise[W].pct} % — far above 0 it is a composition or a mid-flight entrance, not noise: name the regions (crop) and pick one (--require)`);
  }
}
await browser.close();
rows.sort((a, b) => a.W - b.W);
for (const r of rows) {
  if (r.error) { notes.push(`${r.W}: ${r.error}`); continue; }
  if (r.nSections === 0) notes.push(`${r.W}: --sections "${sections}" matches nothing — the spec has header/footer only; read structure-${r.W}.txt for the section selector`);
  if (r.nSections < 0) notes.push(`${r.W}: --sections "${sections}" is not a valid selector`);
  if (r.root.tag !== 'main' && typeof arg('--main', null) !== 'string') notes.push(`${r.W}: content root ${r.root.name} (${r.hasMain ? 'the largest ancestor of main that adds no chrome' : 'no <main>'}) — dump key "${r.contentMain}"`);
  if (r.scrolled && (r.scrolled.newlyPinned.length || Math.abs(r.scrolled.shift) >= 2)) notes.push(`${r.W}: after one viewport of scroll ${r.scrolled.newlyPinned.length ? `${r.scrolled.newlyPinned.join(', ')} pin${r.scrolled.newlyPinned.length > 1 ? '' : 's'} fixed / sticky` : 'no new fixed layer'}${Math.abs(r.scrolled.shift) >= 2 ? ` and the first content box moved ${r.scrolled.shift} px — a layer that leaves the flow when it pins: reproduce it or every chunk after the first is offset in the capture` : ''}`);
  if (r.unassigned?.length) notes.push(`${r.W}: UNASSIGNED band(s) outside header / main / footer dumped as extra content roots — ${r.unassigned.join(', ')} (the first look names their boxes; triage them as chrome or content)`);
  if (r.spec?.entrance) notes.push(`${r.W}: ${r.spec.entrance} spec items read inside an entrance state (\`rest\` on the item; pair / sections compare at rest)`);
  if (r.spec?.running) notes.push(`${r.W}: ${r.spec.running} animations still running at read time (infinite ones)`);
  if (r.cap?.error) notes.push(`${r.W}: capture failed — ${r.cap.error}`);
  if (r.cap?.failedFonts?.length) notes.push(`${r.W}: font load FAILED for ${r.cap.failedFonts.join(', ')} — the capture renders fallback type`);
}
const allCheckRows = rows.flatMap((r) => r.checkRows || []);
const check = profile && allCheckRows.length ? verdictOf(allCheckRows) : null;
const summary = {
  _schema: 'stardust-lite/measure-page@1', _writtenAt: new Date().toISOString(), url, widths, vh,
  elapsedByWidth: Object.fromEntries(rows.map((r) => [r.W, r.elapsed])),
  files: Object.fromEntries(rows.filter((r) => !r.error).map((r) => [r.W, r.files])),
  captures: Object.fromEntries(rows.filter((r) => r.cap && !r.cap.error).map((r) => [r.W, join(out, `live-${r.W}.png`)])),
  captureInfo: Object.fromEntries(rows.filter((r) => r.cap).map((r) => [r.W, r.cap.error ? { error: r.cap.error } : { width: r.cap.width, height: r.cap.height, chunks: r.cap.chunks, seconds: r.cap.seconds, chunkWaitsMs: r.cap.waited, timedOut: r.cap.timedOut, failedFonts: r.cap.failedFonts }])),
  profileCheck: check ? { verdict: check.verdict, checks: check.checks, fails: check.fails, warns: check.warns, tol, profile: profile._file, rows: allCheckRows.map(([W, name, expected, actual, verdict]) => ({ W, check: name, expected, actual, verdict })) } : null,
  sectionsSelector: sections, header, footer, hidden,
  mainRoot: Object.fromEntries(rows.filter((r) => !r.error).map((r) => [r.W, { structure: r.root.name, path: r.root.path, content: r.contentMain }])),
  fixedLayers: Object.fromEntries(rows.filter((r) => r.first).map((r) => [r.W, r.first.fixed])),
  unassigned: Object.fromEntries(rows.filter((r) => r.first).map((r) => [r.W, r.first.unassigned || []])),
  noise: Object.keys(noise).length ? noise : null,
  scrolled: Object.fromEntries(rows.filter((r) => r.scrolled).map((r) => [r.W, r.scrolled])),
  shadowRoots: Object.fromEntries(rows.filter((r) => r.first).map((r) => [r.W, r.first.shadowHosts])),
  status: Object.fromEntries(rows.map((r) => [r.W, r.status ?? null])),
  overlays: { consent: overlays.consent, dismiss: overlays.dismiss, locale: overlays.locale, require: overlays.require },
  deep: deepSels ? { sels: deepSels, max: DEEP_MAX } : { sels: [header, sections, footer], max: DEEP_MAX },
  notes,
};
writeFileSync(join(out, 'summary.json'), JSON.stringify(summary, null, 1));
const col = (v, n) => String(v ?? '—').padStart(n);
console.log(`${url} → ${out}/`);
console.log('width   s  status    doc  fixed  shadow  sections  items  roots (header / main / footer nodes)   imgs  bgs  svgs  fonts  deep  capture');
for (const r of rows) {
  if (r.error) { console.log(`${col(r.W, 5)}  ${col(r.elapsed.toFixed(1), 5)}  ERROR ${r.error}`); continue; }
  console.log(`${col(r.W, 5)} ${col(r.elapsed.toFixed(1), 5)}  ${col(r.status, 6)} ${col(r.doc, 6)}  ${col(r.first?.fixed.length, 5)}  ${col(r.first?.shadowHosts, 6)}  ${col(r.spec ? r.spec.secs : r.nSections, 8)}  ${col(r.spec ? r.spec.items : '—', 5)}  ${r.contentRoots.join(' / ').slice(0, 38).padEnd(38)}  ${col(r.media.imgs, 4)}  ${col(r.media.bgs, 3)}  ${col(r.media.svgs, 4)}  ${col(r.media.fontRequests, 5)}  ${col(r.deepLines, 4)}  ${r.cap ? (r.cap.error ? 'FAILED' : `${r.cap.width}x${r.cap.height} ${r.cap.chunks} chunks ${r.cap.seconds} s`) : '—'}`);
}
for (const [W, nz] of Object.entries(noise)) console.log(`noise floor: ${W} ${nz.error ? `FAILED — ${nz.error}` : `${nz.pct} % (Δh ${nz.dh}, ${nz.seconds} s) — live-${W}.png vs live-${W}-b.png`}`);
for (const n of notes) console.log(`note: ${n}`);
if (check) console.log(`profile check: ${check.line}${check.fails ? ' — run `site-profile check migration/site.json` on its own; a FAIL is site work, not this page\'s round' : ''}`);
console.log(`next: node scripts/brief.mjs ${out} [--triage triage.json] — the one-screen CSS brief (text styles, media, paint, cap per section and width); read it before the specs`);
console.log(`files per width: probe-load-<W>.txt structure-<W>.txt content-<W>.json media-<W>.json${noSpec ? '' : ' spec-<W>.json dom-<W>.html'} deep-<W>.txt${capture ? ' live-<W>.png' : ''}; summary.json`);
process.exit(rows.some((r) => r.error) ? 2 : 0);
