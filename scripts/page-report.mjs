#!/usr/bin/env node
// page-report.mjs — the evidence a rollout page leaves (ROLLOUT.md, batch-7 rollout pass 7): one row in migration/site-report.json
// appended or updated from the page's gate/gate.json (prototype) and gate-served/gate.json (served) plus a few flags, then the
// one-screen migration/pages/<slug>.md and the site table migration/site-report.md rendered from the JSON. Pure Node, no browser.
// Usage: node page-report.mjs <slug> [--gate <dir>] [--served <dir>] [--pages <pages.json>] [--out migration/site-report.json]
//        [--pages-dir migration/pages] [--md migration/site-report.md] [--url <url>] [--template <id>] [--novelty <0..1>]
//        [--minutes <n>] [--first-url-minutes <n>] [--rounds-table <n>] [--rounds-gate <n>] [--new-blocks a,b]
//        [--deviation "…"]… [--blocked "…"]… [--note "…"]… [--render]
//   --gate / --served default to migration/pages/<slug>/gate and …/gate-served, else gate/<slug> and gate-served/<slug> (the
//   `gate --pages` layout). url / template / novelty come from pages.json (--pages, else migration/pages.json or pages.json) or the
//   gate's `live`; the flags win. newBlocks defaults to the blocks of the sections the base-width gate read as `new`.
//   A repeated flag (--deviation, --blocked, --note) appends; the row's arrays are replaced by what the call passes, kept when it passes none.
//   --render only re-renders the two markdown views from the JSON (no gate read).
// Row shape (stardust-lite/site-report@1, pages[]): { slug, url, template, novelty, newBlocks[], proto { "360", base, probe }, served { … },
//   dh, budget { proto, served }, over[] ({ W, index, block, pct, budget, dh, over }), roundsTable, roundsGate, minutes, firstUrlMinutes,
//   deviations[], blockedOrDegraded[], notes[], gate { proto, served }, _writtenAt }.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { arg, siteProfile } from './common.mjs';

const slug = process.argv[2];
if (!slug || slug.startsWith('--')) {
  console.error('usage: page-report.mjs <slug> [--gate <dir>] [--served <dir>] [--pages <pages.json>] [--out migration/site-report.json] [--pages-dir migration/pages] [--md migration/site-report.md]\n       [--url] [--template] [--novelty] [--minutes <n>] [--first-url-minutes <n>] [--rounds-table <n>] [--rounds-gate <n>] [--new-blocks a,b] [--deviation "…"]… [--blocked "…"]… [--note "…"]… [--render]');
  process.exit(1);
}
const args = (name) => process.argv.flatMap((a, i) => (a === name && process.argv[i + 1] !== undefined && !process.argv[i + 1].startsWith('--') ? [process.argv[i + 1]] : []));
const num = (name) => { const v = arg(name, null); return v === null || v === true ? null : Number(v); };
const readJson = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };
const firstDir = (...c) => c.find((d) => existsSync(join(d, 'gate.json'))) || c[0];
const cwd = process.cwd();
const out = resolve(arg('--out', 'migration/site-report.json'));
const pagesDir = resolve(arg('--pages-dir', 'migration/pages'));
const mdOut = resolve(arg('--md', 'migration/site-report.md'));
const profile = siteProfile();
const baseW = profile?.baseWidth ?? 1440; const probeW = profile?.probeWidth ?? 2560;

const report = readJson(out) || { _schema: 'stardust-lite/site-report@1', _writtenAt: null, _source: { site: profile?._file ? relative(cwd, profile._file) : null }, pages: [] };
let row = report.pages.find((p) => p.slug === slug);

if (!process.argv.includes('--render')) {
  const gateDir = resolve(typeof arg('--gate', null) === 'string' ? arg('--gate') : firstDir(join('migration', 'pages', slug, 'gate'), join('gate', slug)));
  const servedDir = resolve(typeof arg('--served', null) === 'string' ? arg('--served') : firstDir(join('migration', 'pages', slug, 'gate-served'), join('gate-served', slug)));
  const proto = readJson(join(gateDir, 'gate.json')); const served = readJson(join(servedDir, 'gate.json'));
  if (!proto && !served) console.error(`page-report: no gate.json under ${relative(cwd, gateDir)} or ${relative(cwd, servedDir)} — the row carries the flags only`);
  const pagesFile = [arg('--pages', null), 'migration/pages.json', 'pages.json'].filter((f) => typeof f === 'string').map((f) => resolve(f)).find(existsSync);
  const page = pagesFile ? (readJson(pagesFile)?.pages || []).find((p) => p.slug === slug) : null;
  const pcts = (g) => { if (!g) return null; const at = (W) => g.rows?.find((r) => r.W === W)?.pct ?? null; return { 360: at(360), base: at(baseW), probe: at(probeW) }; };
  const sectionsFile = (g, dir) => { const f = g?.sections?.[String(baseW)]; return f ? (existsSync(f) ? f : join(dir, `sections-${baseW}.json`)) : null; };
  const newFromGate = () => { const f = sectionsFile(proto, gateDir) || sectionsFile(served, servedDir); const s = f ? readJson(f) : null; return [...new Set((s?.sections || []).filter((x) => x.status === 'new' && x.block).map((x) => (x.variant ? `${x.block} (${x.variant})` : x.block)))]; };
  const list = (v) => String(v ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const servedBase = served?.rows?.find((r) => r.W === baseW) || served?.rows?.[0] || null;
  const protoBase = proto?.rows?.find((r) => r.W === baseW) || proto?.rows?.[0] || null;
  const prev = row || {};
  row = {
    slug,
    url: arg('--url', null) || page?.url || served?.live || proto?.live || prev.url || null,
    template: arg('--template', null) || page?.template || prev.template || null,
    novelty: num('--novelty') ?? page?.novelty ?? prev.novelty ?? null,
    newBlocks: arg('--new-blocks', null) !== null ? list(arg('--new-blocks')) : (prev.newBlocks?.length ? prev.newBlocks : newFromGate()),
    proto: pcts(proto) || prev.proto || null,
    served: pcts(served) || prev.served || null,
    dh: servedBase?.dh ?? protoBase?.dh ?? prev.dh ?? null,
    budget: { proto: proto?.budget?.on ? proto.budget.verdict : (proto ? 'off' : prev.budget?.proto ?? null), served: served?.budget?.on ? served.budget.verdict : (served ? 'off' : prev.budget?.served ?? null) },
    over: (served || proto)?.budget?.over?.map((o) => ({ W: o.W, index: o.index, block: o.block, pct: o.pct, budget: o.budget, dh: o.dh, over: o.over })) ?? prev.over ?? [],
    chrome: (served || proto)?.chrome?.on ?? prev.chrome ?? null,
    cap: { proto: proto?.cap?.verdict ?? prev.cap?.proto ?? null, served: served?.cap?.verdict ?? prev.cap?.served ?? null },
    roundsTable: num('--rounds-table') ?? prev.roundsTable ?? null,
    roundsGate: num('--rounds-gate') ?? prev.roundsGate ?? null,
    minutes: num('--minutes') ?? prev.minutes ?? null,
    firstUrlMinutes: num('--first-url-minutes') ?? prev.firstUrlMinutes ?? null,
    deviations: args('--deviation').length ? args('--deviation') : prev.deviations || [],
    blockedOrDegraded: args('--blocked').length ? args('--blocked') : prev.blockedOrDegraded || [],
    notes: args('--note').length ? args('--note') : prev.notes || [],
    gate: { proto: proto ? relative(cwd, gateDir) : prev.gate?.proto ?? null, served: served ? relative(cwd, servedDir) : prev.gate?.served ?? null },
    _writtenAt: new Date().toISOString(),
  };
  const i = report.pages.findIndex((p) => p.slug === slug);
  if (i === -1) report.pages.push(row); else report.pages[i] = row;
  report._writtenAt = row._writtenAt;
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(report, null, 1));
  console.error(`page-report: ${i === -1 ? 'appended' : 'updated'} ${slug} in ${relative(cwd, out)} (${report.pages.length} pages)`);
} else if (!row) { console.error(`page-report: no row for ${slug} in ${relative(cwd, out)}`); process.exit(1); }

// ---------- the two markdown views ----------
const p2 = (v) => (v === null || v === undefined ? '—' : typeof v === 'number' ? String(Number(v.toFixed(2))) : String(v));
const n = (v) => (v === null || v === undefined ? '—' : String(v));
const triple = (t) => (t ? `${p2(t[360])} / ${p2(t.base)} / ${p2(t.probe)}` : '—');
const overLine = (o) => `#${o.index} ${o.block || '—'} ${p2(o.pct)} > ${p2(o.budget)}${/Δh/.test(o.over || '') ? ` Δh ${o.dh}` : ''} @${o.W}`;
const bullets = (a, empty) => (a?.length ? a.map((x) => `- ${x}`).join('\n') : `- ${empty}`);

const pageMd = (r) => `# ${r.slug} — ${r.url || ''}

template ${n(r.template)} · novelty ${n(r.novelty)} · new blocks: ${r.newBlocks?.length ? r.newBlocks.join(', ') : 'none'} · chrome ${r.chrome === null ? '—' : r.chrome ? 'masked' : 'unmasked'}

| | 360 / ${baseW} / ${probeW} % | Δh (${baseW}) | budget | cap |
|---|---|---|---|---|
| prototype | ${triple(r.proto)} | | ${n(r.budget?.proto)} | ${n(r.cap?.proto)} |
| served | ${triple(r.served)} | ${n(r.dh)} | ${n(r.budget?.served)} | ${n(r.cap?.served)} |

Over budget (served): ${r.over?.length ? r.over.map(overLine).join('; ') : 'none'}

Rounds: ${n(r.roundsTable)} table + ${n(r.roundsGate)} gate · ${n(r.minutes)} min wall, first URL at ${n(r.firstUrlMinutes)} min

## Deviations
${bullets(r.deviations, 'none')}

## Blocked or degraded
${bullets(r.blockedOrDegraded, 'nothing')}

## Notes
${bullets(r.notes, '—')}

Gate dirs: ${n(r.gate?.proto)} · ${n(r.gate?.served)} · written ${r._writtenAt}
`;

const mean = (xs) => { const v = xs.filter((x) => typeof x === 'number'); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
const siteMd = (rep) => {
  const rows = rep.pages;
  const head = `# Site report — ${profile?.origin || rep._source?.site || ''}\n\n${rows.length} pages · mean ${p2(mean(rows.map((r) => r.minutes)))} min/page · mean novelty ${p2(mean(rows.map((r) => r.novelty)))} · ${rows.reduce((a, r) => a + (r.newBlocks?.length || 0), 0)} new blocks · ${rows.filter((r) => r.budget?.served === 'PASS').length} served budget PASS · written ${rep._writtenAt}\n`;
  const table = `\n| page | template | novelty | new blocks | proto 360 / ${baseW} / ${probeW} | served 360 / ${baseW} / ${probeW} | Δh | budget | rounds (table + gate) | min (first URL) | deviations | blocked |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n${rows.map((r) => `| [${r.slug}](pages/${r.slug}.md) | ${n(r.template)} | ${n(r.novelty)} | ${r.newBlocks?.length ? r.newBlocks.join(', ') : '—'} | ${triple(r.proto)} | ${triple(r.served)} | ${n(r.dh)} | ${n(r.budget?.served)}${r.over?.length ? ` (${r.over.length} over)` : ''} | ${n(r.roundsTable)} + ${n(r.roundsGate)} | ${n(r.minutes)} (${n(r.firstUrlMinutes)}) | ${r.deviations?.length || 0} | ${r.blockedOrDegraded?.length || 0} |`).join('\n')}\n`;
  return head + table;
};

mkdirSync(pagesDir, { recursive: true });
writeFileSync(join(pagesDir, `${slug}.md`), pageMd(row));
mkdirSync(dirname(mdOut), { recursive: true });
writeFileSync(mdOut, siteMd(report));
console.log(pageMd(row));
console.error(`page-report: wrote ${relative(cwd, join(pagesDir, `${slug}.md`))} and ${relative(cwd, mdOut)}`);
