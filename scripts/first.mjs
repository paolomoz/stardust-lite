#!/usr/bin/env node
// first.mjs — the template run's first prototype as ONE call (five-minute loop, iteration 1): probe-load (the tier into the profile) →
// measure-page → triage (the draft, accepted) → media + fonts (fonts.css written) → da-put media → author --draft-new (doc, nav, footer) →
// da-put documents → spec-to-css --force (+ sections-draft into styles.css) → harness → gate --round at the three widths. Every step is the
// sibling instrument as a child process with the flags it already takes; first.mjs only orders them, times them and prints one table, the
// author / lint warnings and the round digest. The field runs spent ≈ 30 model turns running these steps one at a time before the first
// number (continental-home: 11.2 min to the first prototype, ≈ 2.5 of them tools); after this call the agent's work is the CSS rounds.
// Usage: node first.mjs <url> --slug <slug> [--template <name>] [--port 8990] [--no-da] [--sections <css>] [--main <css>] [--skip <step,…>]
//   From the site repo root (fstab.yaml names the DA org / site; the git branch is the preview branch). Writes migration/cases/<template>/
//   (measure/, media/, doc/, triage.json/.md, gate/) and first.json { steps: [{ step, seconds, exit, note }], harnessUrl, target }.
//   --skip probe,measure,media,author,css re-runs from where the case dir already has the outputs (e.g. after editing triage.md: --skip probe,measure).
// Exit: 0 the round ran (its own target line says whether it is under) · 1 a step failed before the round.
import { spawnSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { arg } from './common.mjs';

const url = process.argv[2]; const slug = arg('--slug', null);
if (!url || url.startsWith('--') || typeof slug !== 'string') { console.error('usage: first.mjs <url> --slug <slug> [--template <name>] [--port 8990] [--no-da] [--sections <css>] [--main <css>] [--skip <step,…>]'); process.exit(1); }
const here = dirname(fileURLToPath(import.meta.url)); const S = (n) => join(here, `${n}.mjs`);
const template = String(arg('--template', 'home')); const port = Number(arg('--port', 8990)); const noDa = process.argv.includes('--no-da');
const skip = new Set(String(arg('--skip', '') || '').split(',').filter(Boolean));
const fstab = existsSync('fstab.yaml') ? readFileSync('fstab.yaml', 'utf8') : ''; const m = /content\.da\.live\/([^/\s]+)\/([^/\s]+)/.exec(fstab);
if (!m) { console.error('first: run from the site repo root (fstab.yaml with a content.da.live mount)'); process.exit(1); }
const [, org, site] = m; const branch = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
const host = `https://${branch}--${site}--${org}.aem.page`; const daTarget = `${org}/${site}/${branch}`;
const dir = join('migration', 'cases', template); const measure = join(dir, 'measure'); const media = join(dir, 'media'); const docDir = join(dir, 'doc');
const doc = join(docDir, `${slug}.html`); const triage = join(dir, 'triage.json'); const content = join(measure, 'content-1440.json');
mkdirSync(docDir, { recursive: true });

const steps = []; const t00 = Date.now();
const tail = (t, n) => String(t || '').split('\n').filter((l) => l.trim()).slice(-n).join('\n');
function step(name, script, args, { show = 3, ok = (r) => !r.status, note = null } = {}) {
  const t0 = Date.now(); const r = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  const seconds = Number(((Date.now() - t0) / 1000).toFixed(1)); const good = ok(r); const n = typeof note === 'function' ? note(r) : null;
  steps.push({ step: name, seconds, exit: r.status, ok: good, note: n });
  console.log(`── ${name} ${seconds}s${good ? '' : ` ✗ exit ${r.status}`}${n ? ` — ${n}` : ''}`); if (!good || show) { const t = tail(`${r.stdout}\n${r.stderr}`, good ? show : 12); if (t) console.log(t.replace(/^/gm, '   ')); }
  return r;
}
const finish = (code, extra = '') => {
  console.log(`\n| step | s | note |\n|---|---|---|\n${steps.map((s) => `| ${s.step}${s.ok ? '' : ' ✗'} | ${s.seconds} | ${s.note || ''} |`).join('\n')}\n| total | ${((Date.now() - t00) / 1000).toFixed(1)} | |`);
  if (extra) console.log(extra);
  writeFileSync(join(dir, 'first.json'), JSON.stringify({ _schema: 'stardust-lite/first@1', _writtenAt: new Date().toISOString(), url, slug, template, host, steps, total: (Date.now() - t00) / 1000, harnessUrl: `http://localhost:${port}/${slug}.harness.html` }, null, 1));
  process.exit(code);
};

// 1 tier + profile, 2 measure (the profile's flags are read by every instrument from migration/site.json)
if (!skip.has('probe')) step('probe-load', S('probe-load'), [url, '360,1440,2560', '--profile', join('migration', 'site.json')], { show: 4, note: (r) => (/^tier: (.*)$/m.exec(r.stdout) || [])[1] || null });
if (!skip.has('measure')) {
  const mArgs = [url, '--out', measure, ...(typeof arg('--sections', null) === 'string' ? ['--sections', arg('--sections')] : []), ...(typeof arg('--main', null) === 'string' ? ['--main', arg('--main')] : [])];
  const r = step('measure-page', S('measure-page'), mArgs, { show: 0, ok: () => existsSync(content), note: (r2) => { try { const s = JSON.parse(readFileSync(join(measure, 'summary.json'), 'utf8')); return `${Object.keys(s.files || {}).length} widths, sections ${s.sectionsSelector || '?'}`; } catch { return null; } } });
  const notes = String(r.stdout).split('\n').filter((l) => /^note: |CHALLENGE|FONT LOAD FAILED|BROKEN/.test(l)).slice(0, 8); if (notes.length) console.log(notes.map((l) => `   ${l.slice(0, 220)}`).join('\n'));
  if (!existsSync(content)) finish(1, 'first: measure-page wrote no content dump — read its output above');
}
// 3 triage: the draft, accepted (edit triage.md and re-run with --skip probe,measure after `triage --from-md` to change it)
if (!skip.has('author')) step('triage', S('triage'), [content, '--blocks', join('migration', 'blocks.json'), '--spec', join(measure, 'spec-1440.json'), '--out', triage, '--md', join(dir, 'triage.md')], { show: 0, note: (r) => (/^novelty .*/m.exec(r.stdout) || [''])[0].split(' →')[0] });
// 4 media + fonts (fonts.css written from the measured @font-face rules; a WAF answer goes through the page by itself)
let daMedia = null;
if (!skip.has('media')) {
  step('media', S('media-fetch'), [content, '--out', media], { show: 0, ok: () => existsSync(join(media, 'manifest.json')), note: (r) => (/(\d+) of (\d+)/.exec(r.stdout) || [])[0] || tail(r.stdout, 1).slice(0, 80) });
  const man = existsSync(join(media, 'manifest.json')) ? JSON.parse(readFileSync(join(media, 'manifest.json'), 'utf8')) : null; const failed = man ? (man.items || man.files || []).filter((x) => x.status && x.status >= 400).length : 0;
  if (failed > 3) step('media --from-page', S('media-fetch'), [content, '--out', media, '--from-page', url], { show: 0, note: () => `${failed} failed by fetch: again through the page` });
  step('fonts', S('media-fetch'), [join(measure, 'media-1440.json'), '--fonts', 'fonts', '--css', join('styles', 'fonts.css')], { show: 0, note: (r) => (/(\d+) face\(s\) declared/.exec(`${r.stdout}${r.stderr}`) || [])[0] || 'no faces declared — fonts.css by hand' });
  // the media upload runs while author and spec-to-css work (it is needed by the harness, which warms the branch-host URLs)
  const files = existsSync(media) ? readdirSync(media).filter((f) => !/\.json$/.test(f)).map((f) => join(media, f)) : [];
  if (!noDa && files.length && process.env.DA_TOKEN) { const t0 = Date.now(); daMedia = new Promise((res) => { const c = spawn(process.execPath, [S('da-put'), daTarget, ...files, '--to', 'drafts/media'], { stdio: ['ignore', 'pipe', 'pipe'] }); let out = ''; c.stdout.on('data', (d) => { out += d; }); c.stderr.on('data', (d) => { out += d; }); c.on('close', (code) => res({ code, out, seconds: Number(((Date.now() - t0) / 1000).toFixed(1)) })); }); }
  else if (!noDa && !process.env.DA_TOKEN) console.log('   no DA_TOKEN: media not uploaded (source the token, or --no-da for a local-only run)');
}
// 5 author: the document, the nav and the footer
if (!skip.has('author')) {
  const hidden = join(measure, 'hidden-1440.json');
  step('author', S('author'), [triage, '--content', [content, ...(existsSync(hidden) ? [hidden] : [])].join(','), '--blocks', join('migration', 'blocks.json'), '--media', join(media, 'manifest.json'), '--media-host', `${host}/drafts/media`, '--out', doc, '--nav', join(docDir, 'nav.html'), '--footer', join(docDir, 'footer.html'), '--nav-path', '/drafts/nav', '--footer-path', '/drafts/footer', '--draft-new', '--site', join('migration', 'site.json'), '--url', url],
    { show: 0, ok: () => existsSync(doc), note: (r) => [/(\d+) sections? → [^(]*\(([^)]*)\)/.exec(r.stdout)?.[2], ...String(r.stderr).split('\n').filter((l) => /empty cell|did not fit|NEW|🔴/.test(l)).map((l) => l.replace(/^author: /, '').slice(0, 90))].filter(Boolean).slice(0, 3).join(' · ') || null });
  if (daMedia) { const d = await daMedia; steps.push({ step: 'da-put media (in parallel)', seconds: d.seconds, exit: d.code, ok: !d.code, note: (/(\d+) upload/.exec(d.out) || [''])[0] || tail(d.out, 1).slice(0, 80) }); daMedia = null; }
  if (!noDa && process.env.DA_TOKEN) step('da-put docs', S('da-put'), [daTarget, doc, join(docDir, 'nav.html'), join(docDir, 'footer.html'), '--to', 'drafts'], { show: 0 });
}
if (daMedia) { const d = await daMedia; steps.push({ step: 'da-put media (in parallel)', seconds: d.seconds, exit: d.code, ok: !d.code, note: null }); }
// 6 the CSS drafts as the CSS: blocks/<name>/<name>.css (header / footer appended below the foundation rules), sections-draft into styles.css
if (!skip.has('css')) {
  step('spec-to-css', S('spec-to-css'), [measure, '--triage', triage, '--doc', doc, '--out', 'blocks', '--force'], { show: 0, note: (r) => `${(r.stdout.match(/\.css: /g) || []).length} files` });
  const sd = join('styles', 'sections-draft.css'); const st = join('styles', 'styles.css'); const MARK = '/* ── sections-draft (first.mjs; below this line is regenerated) ── */';
  if (existsSync(sd) && existsSync(st)) writeFileSync(st, `${readFileSync(st, 'utf8').split(MARK)[0].trimEnd()}\n\n${MARK}\n${readFileSync(sd, 'utf8')}`);
}
// 7 the prototype and the first round at the three widths
const h = step('harness', S('harness'), [doc, '--serve', 'proto', '--name', slug, '--port', String(port), '--fragments', host, '--content', content, '--site-repo', '.', '--no-lint'], { show: 0, note: (r) => [(/(\d+) blocks? loaded/.exec(r.stdout) || [])[0], (/doc height (\d+)/.exec(r.stdout) || [])[0], (/(\d+) text.*not in the capture/.exec(`${r.stdout}${r.stderr}`) || [])[0]].filter(Boolean).join(' · ') });
if (h.status) finish(1, 'first: the harness failed — read its output above');
const g = step('gate --round', S('gate'), ['--live', url, '--build', `http://localhost:${port}/${slug}.harness.html`, '--out', join(dir, 'gate'), '--origin', measure, '--round', '--widths', '360,1440,2560', '--triage', triage], { show: 0, note: (r) => (/^target .*/m.exec(r.stdout) || [''])[0] });
const out = String(g.stdout); const from = out.indexOf('\n| width'); finish(0, `\n${from >= 0 ? out.slice(from).trim() : tail(out, 40)}\n\nprototype: http://localhost:${port}/${slug}.harness.html · document ${doc} · CSS blocks/*/ and styles/styles.css (sections-draft part) · next: CSS rounds, \`gate … --round --widths 360,1440,2560\` (the same --out ${join(dir, 'gate')})`);
