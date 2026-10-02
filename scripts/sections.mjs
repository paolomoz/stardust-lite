#!/usr/bin/env node
// sections.mjs — section-height table: live spec (live-spec JSON) vs a build URL. Rows are paired by TEXT ANCHOR, not by index: the
// first heading/paragraph of each live section is located on the build and the build section containing it is the partner (several
// live sections can share one build section — authored sections are usually coarser than the source's). Falls back to index order
// for a live section without text.
// Usage: node sections.mjs <spec.json> <build-url> [--sections <css>] [--header <css>] [--footer <css>] [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--require <css,…>]
//        node sections.mjs <build-url> --widths 360,1440,2560 --spec-dir <measure dir> [--blocks migration/blocks.json --triage <triage.json>] [--out <dir | file.json>] [the flags above]
//   --widths + --spec-dir  the table per width (`spec-<W>.json` of the dir, the build opened once per width in ONE browser), then a verdict
//   line: `tables: CLEAN — Δh ≤ 2 on every section at 360, 1440, 2560` or `tables: n row(s) off — <W> #i "anchor" Δh …`. Δh is the build
//   section's height minus the live section's (a build section holding several live sections: minus their span); the live header and
//   footer rows are chrome (printed, not judged — the chrome is site work). With --blocks and --triage every row is marked reused (its
//   triage block has a budget in the inventory) / new / default, and the verdict names the new rows apart (`CLEAN, 1 new section`: a new
//   section still takes the full gate at the three widths). --out writes `sections-verdict.json` (a dir, or a .json path) — `gate
//   --skip-widths-when-clean <that file>` gates the prototype at the base width only when it is CLEAN with 0 new (sdt-dentsu speed).
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { arg, openPage, settle, overlayOpts, siteProfile, contextOptions } from './common.mjs';
import { triageRowFor } from './lib/section-pair.mjs';

const VALUED = ['--sections', '--header', '--footer', '--consent', '--dismiss', '--locale', '--require', '--widths', '--spec-dir', '--blocks', '--triage', '--out', '--site'];
const positional = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && !(i > 0 && VALUED.includes(all[i - 1])));
const multi = typeof arg('--spec-dir', null) === 'string';
const USAGE = 'usage: sections.mjs <spec.json> <build-url> [--sections <css>] [--header <css>] [--footer <css>]\n       sections.mjs <build-url> --widths 360,1440,2560 --spec-dir <measure dir> [--blocks migration/blocks.json --triage <triage.json>] [--out <dir|file.json>]';
if (multi ? positional.length < 1 : positional.length < 2) { console.error(USAGE); process.exit(1); }
const url = multi ? positional[positional.length - 1] : positional[1];
const sections = arg('--sections', 'main > .section'); const header = arg('--header', 'header'); const footer = arg('--footer', 'footer');

// the build's sections are read once per width: the partner of every live section and the chrome indices
const readBuild = ({ sections, header, footer, live }) => {
  const R = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y + scrollY), Math.round(b.width), Math.round(b.height)]; };
  const hd = document.querySelector(header); const ft = document.querySelector(footer);
  const secs = [hd, ...document.querySelectorAll(sections), ft].filter(Boolean);
  const norm = (s) => s.replace(/\s+/g, ' ').trim().toLowerCase();
  // visible text only: a `visibility: hidden` build anchor paired a live section with the wrong build section every round (walgreens-home)
  const texts = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,a,span,strong,em,button,div')].filter((e) => { const b = e.getBoundingClientRect(); const s = getComputedStyle(e); return b.width > 0 && b.height > 0 && s.visibility !== 'hidden' && parseFloat(s.opacity) > 0.05 && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()); });
  const rows = live.map((l, i) => {
    let sec = null; let abox = null;
    if (l.anchor) {
      const lc = l.anchor.t.toLowerCase();
      // among the elements starting with the anchor text, the one nearest the live y (the same words recur in nav, cards and footer)
      const e = texts.filter((x) => norm(x.textContent).startsWith(lc)).sort((x, y) => Math.abs(x.getBoundingClientRect().top + scrollY - l.anchor.box[1]) - Math.abs(y.getBoundingClientRect().top + scrollY - l.anchor.box[1]) || x.textContent.length - y.textContent.length)[0];
      if (e) { sec = secs.find((s) => s.contains(e)) || null; abox = R(e); }
    }
    if (!sec) sec = secs[i] || null;
    return { idx: sec ? secs.indexOf(sec) : -1, box: R(sec), cls: sec ? (sec.className || sec.tagName).replace(/\bsection\b/, '').trim().slice(0, 40) : '', abox };
  });
  return { doc: document.documentElement.scrollHeight, count: secs.length, rows, chromeIdx: [hd ? secs.indexOf(hd) : -1, ft ? secs.indexOf(ft) : -1] };
};

/** One width: the table (as lines, printed by the caller — the widths run at once), the rows with Δh per row or per shared group, chrome flagged. */
async function runWidth(browser, spec) {
  const out = []; const log = (...a) => out.push(a.join(' '));
  // h5/h6: a small section head is an h5 on Carbon sites (ibm-home); the anchor must sit on the page — a 4×4 "Skip Advertisement" link at
  // x −995 anchored the ad section to nothing every round (usta2-home)
  const onPage = (it) => it.box[0] + it.box[2] > 0 && it.box[0] < spec.W && it.box[3] >= 8;
  const anchorOf = (s) => s.items.find((it) => ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'li'].includes(it.k) && it.t && it.t.length >= 3 && onPage(it));
  // an anchor read inside an entrance state (`rest` on the item — live-spec) is located at its rest position
  const live = spec.secs.map((s) => { const a = anchorOf(s); return { box: s.box, id: s.id, anchor: a ? { t: a.t.slice(0, 28), box: a.rest || a.box } : null }; });
  const ctx = await browser.newContext(contextOptions({ width: spec.W, height: spec.vh || 900, locale: overlayOpts().locale }));
  const page = await openPage(ctx, url, { width: spec.W, height: spec.vh || 900, wait: 800, ...overlayOpts() });
  await settle(page, 800, 50, 400);
  const r = await page.evaluate(readBuild, { sections, header, footer, live });
  await ctx.close();
  log(`doc height  live ${spec.doc}  build ${r.doc}  Δ ${r.doc - spec.doc}   (spec measured at vh ${spec.vh || '?'}; ${spec.secs.length} live sections → ${r.count} build sections, paired by first text anchor)`);
  log('idx  live y      h   | build#  y      h   | anchor Δy | anchor live → build | section');
  const shared = {}; r.rows.forEach((t) => { if (t.idx >= 0) shared[t.idx] = (shared[t.idx] || 0) + 1; });
  live.forEach((s, i) => {
    const t = r.rows[i]; const dy = t.abox && s.anchor ? t.abox[1] - s.anchor.box[1] : null;
    log(String(i).padStart(2), String(s.box[1]).padStart(6), String(s.box[3]).padStart(6), ' |', t.box ? `${String(t.idx).padStart(3)}${shared[t.idx] > 1 ? '*' : ' '}` : '  - ', t.box ? String(t.box[1]).padStart(6) : '   -  ', t.box ? String(t.box[3]).padStart(6) : '   -  ', ' |', dy === null ? '    -' : String(dy).padStart(5), '    |', s.anchor ? `"${s.anchor.t.slice(0, 20)}" ${JSON.stringify(s.anchor.box)}` : '-', '→', t.abox ? JSON.stringify(t.abox) : (s.anchor ? 'NOT FOUND' : '-'), '|', t.cls);
  });
  const groups = Object.entries(shared).filter(([, n]) => n > 1);
  if (groups.length) log(`* build sections holding several live sections: ${groups.map(([k, n]) => `#${k} (${n})`).join(', ')} — compare their summed live heights with the build height`);
  groups.forEach(([k]) => { const rows = live.filter((s, i) => r.rows[i].idx === Number(k)); const sum = rows.reduce((a, s) => a + s.box[3], 0); const first = rows[0]; const last = rows[rows.length - 1]; const span = last.box[1] + last.box[3] - first.box[1]; const b = r.rows.find((t) => t.idx === Number(k)).box; log(`  build #${k}: h ${b[3]}  vs live span ${span} (sections summed ${sum})  Δ ${b[3] - span}`); });
  // the verdict rows: one per live section (a shared build section judged once, on its first live row, against the live span)
  const seen = new Set();
  const rows = live.map((s, i) => {
    const t = r.rows[i]; const chrome = /^(HEADER|FOOTER)\b/.test(s.id) || (t.idx >= 0 && r.chromeIdx.includes(t.idx));
    let dh = null; let kind = 'section';
    if (t.idx < 0 || !t.box) kind = 'not located';
    else if (shared[t.idx] > 1) { if (seen.has(t.idx)) kind = 'in group'; else { seen.add(t.idx); const grp = live.filter((x, j) => r.rows[j].idx === t.idx); const span = grp[grp.length - 1].box[1] + grp[grp.length - 1].box[3] - grp[0].box[1]; dh = t.box[3] - span; kind = `group of ${grp.length}`; } }
    else dh = t.box[3] - s.box[3];
    return { index: i, anchorText: s.anchor ? s.anchor.t : '', liveId: s.id.slice(0, 60), live: { y: s.box[1], h: s.box[3] }, build: t.box ? { idx: t.idx, y: t.box[1], h: t.box[3], classes: t.cls } : null, dh, kind, chrome };
  });
  return { W: spec.W, doc: { live: spec.doc, build: r.doc, delta: r.doc - spec.doc }, rows, lines: out };
}

const browser = await chromium.launch();
if (!multi) { // the single-width table, as before
  const spec = JSON.parse(readFileSync(positional[0], 'utf8'));
  const r = await runWidth(browser, spec); console.log(r.lines.join('\n')); await browser.close(); process.exit(0);
}

// ---------- --widths + --spec-dir: the tables per width in one browser, then the verdict ----------
const specDir = resolve(arg('--spec-dir')); const widths = String(arg('--widths', '360,1440,2560')).split(',').map(Number).filter((w) => Number.isFinite(w) && w > 0);
const blocksFile = typeof arg('--blocks', null) === 'string' ? resolve(arg('--blocks')) : null; const triageFile = typeof arg('--triage', null) === 'string' ? resolve(arg('--triage')) : null;
let blocks = []; if (blocksFile) { try { blocks = JSON.parse(readFileSync(blocksFile, 'utf8')).blocks || []; } catch (e) { console.error(`sections: ${blocksFile} unreadable (${e.message})`); process.exit(1); } }
let triage = null; if (triageFile) { try { triage = JSON.parse(readFileSync(triageFile, 'utf8')); } catch (e) { console.error(`sections: ${triageFile} unreadable (${e.message})`); process.exit(1); } }
const tokens = (v) => String(v || '').trim().split(/\s+/).filter(Boolean).sort().join(' ');
const findBlock = (name, variant) => { if (!name) return null; const rows = blocks.filter((b) => b.name === name); if (!rows.length) return null; return rows.find((b) => tokens(b.variant) === tokens(variant)) || (variant ? rows.find((b) => !b.variant) : null) || rows[0]; };
const profile = siteProfile(); const baseW = profile?.baseWidth ?? 1440; const probeW = profile?.probeWidth ?? 2560;
const budgetKey = (W) => (W === 360 ? '360' : W === probeW ? 'probe' : W === baseW ? 'base' : W > baseW ? 'probe' : 'base'); // gate's rule
const perWidth = {}; const off = []; const newRows = new Map(); let maxNew = 0;
// the widths at once: one browser, one context per width (the build answers concurrent sessions — serve.mjs, the branch host)
const results = await Promise.all(widths.map(async (W) => {
  const specFile = join(specDir, `spec-${W}.json`);
  if (!existsSync(specFile)) return { W, specFile, error: `${specFile} missing`, kind: 'no spec' };
  try { return { W, specFile, ...(await runWidth(browser, JSON.parse(readFileSync(specFile, 'utf8')))) }; } catch (e) { return { W, specFile, error: String(e.message || e).slice(0, 160), kind: 'table failed' }; }
}));
for (const res of results) {
  const { W } = res;
  if (res.error) { console.log(`\n== ${W}: ${res.error}${res.kind === 'no spec' ? ` — measure-page writes it (--widths ${widths.join(',')})` : ''}`); perWidth[W] = { error: res.error }; off.push({ W, index: null, anchorText: '', dh: null, kind: res.kind, block: null, status: null }); continue; }
  console.log(`\n== ${W}  ${basename(res.specFile)} vs ${url}`); console.log(res.lines.join('\n'));
  // reused / new / default per row: the triage row of the live section (by anchor, then by position among the non-chrome rows) → its block → the inventory's budget
  let k = 0; const key = budgetKey(W); let nNew = 0;
  for (const row of res.rows) {
    if (row.chrome) { row.status = 'chrome'; continue; }
    const idx = k; k += 1;
    if (!triage) { row.status = null; continue; }
    const tr = triageRowFor(triage, { index: idx, anchorText: row.anchorText }); const block = tr?.match?.block || null; const variant = tr?.match?.variant || null;
    const inv = findBlock(block, variant); const budget = inv?.budget ? inv.budget[key] ?? null : null;
    row.block = block ? `${block}${variant ? ` (${variant})` : ''}` : null; row.budget = budget;
    row.status = !block ? 'default' : budget === null || tr?.match?.kind === 'new' ? 'new' : 'reused';
    if (row.status === 'new') { nNew += 1; newRows.set(`${row.index}`, `#${row.index} "${row.anchorText || row.liveId}"${row.block ? ` (${row.block})` : ''}`); }
  }
  maxNew = Math.max(maxNew, nNew);
  for (const row of res.rows) { if (row.chrome || row.kind === 'in group') continue; if (row.dh === null || Math.abs(row.dh) > 2) off.push({ W, index: row.index, anchorText: row.anchorText, dh: row.dh, kind: row.kind, block: row.block || null, status: row.status || null }); }
  perWidth[W] = { W: res.W, doc: res.doc, rows: res.rows };
  const marks = res.rows.filter((r) => !r.chrome && r.kind !== 'in group').map((r) => `#${r.index} ${r.dh === null ? r.kind : `Δh ${r.dh > 0 ? '+' : ''}${r.dh}`}${r.status && r.status !== 'chrome' ? ` ${r.status}` : ''}`);
  console.log(`rows at ${W}: ${marks.join('; ') || 'none'}${res.rows.some((r) => r.chrome) ? ` (chrome: ${res.rows.filter((r) => r.chrome).map((r) => `#${r.index} Δh ${r.dh === null ? '—' : r.dh}`).join(', ')} — not judged)` : ''}`);
}
await browser.close();
const clean = off.length === 0;
const fmt = (o) => `${o.W} #${o.index ?? '—'}${o.anchorText ? ` "${o.anchorText.slice(0, 20)}"` : ''} ${o.dh === null ? o.kind : `Δh ${o.dh > 0 ? '+' : ''}${o.dh}`}${o.block ? ` (${o.block}${o.status ? `, ${o.status}` : ''})` : o.status ? ` (${o.status})` : ''}`;
const newNote = maxNew ? `; new: ${[...newRows.values()].join(', ')} — a new section takes the full gate at the three widths` : '';
const verdict = clean
  ? `tables: CLEAN${maxNew ? `, ${maxNew} new section${maxNew > 1 ? 's' : ''}` : ''} — Δh ≤ 2 on every section at ${widths.join(', ')}${newNote}`
  : `tables: ${off.length} row(s) off${maxNew ? `, ${maxNew} new section${maxNew > 1 ? 's' : ''}` : ''} — ${off.map(fmt).join('; ')}${newNote}`;
console.log(`\n${verdict}`);
const outArg = arg('--out', null);
if (typeof outArg === 'string') {
  const file = /\.json$/i.test(outArg) ? resolve(outArg) : join(resolve(outArg), 'sections-verdict.json'); mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify({ _schema: 'stardust-lite/sections-verdict@1', _writtenAt: new Date().toISOString(), build: url, specDir, widths, blocks: blocksFile, triage: triageFile, clean, newSections: maxNew, newRows: [...newRows.values()], off, docDelta: Object.fromEntries(widths.map((W) => [W, perWidth[W]?.doc?.delta ?? null])), rows: Object.fromEntries(widths.map((W) => [W, perWidth[W]?.rows || null])), verdict }, null, 1));
  console.log(`verdict: ${file}`);
}
process.exit(clean ? 0 : 1);
