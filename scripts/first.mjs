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
//   --skip probe,measure,triage,media,author,css re-runs from where the case dir already has the outputs; after editing triage.md (`drop` in the block
//   column removes a row) `--skip probe,measure,media` applies the edit (triage --from-md) and re-authors.
// Exit: 0 the round ran (its own target line says whether it is under) · 1 a step failed before the round.
import { spawnSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';
import { arg, daToken } from './common.mjs';

const url = process.argv[2]; const slug = arg('--slug', null);
if (!url || url.startsWith('--') || typeof slug !== 'string') { console.error('usage: first.mjs <url> --slug <slug> [--template <name>] [--port 8990] [--no-da] [--sections <css>] [--main <css>] [--header <css>] [--footer <css>] [--skip <step,…>]'); process.exit(1); }
const here = dirname(fileURLToPath(import.meta.url)); const S = (n) => join(here, `${n}.mjs`);
const template = String(arg('--template', 'home')); const noDa = process.argv.includes('--no-da');
// a free port: a busy 8990 (another serve left running) cost marriott a whole `first` re-run — the harness refuses a port another dir owns
const free = (p) => new Promise((res) => { const srv = net.createServer(); srv.once('error', () => res(false)); srv.once('listening', () => srv.close(() => res(true))); srv.listen(p); }); // no host: the dual-stack bind sees a serve listening on :: (publicis: 8990 read free on 127.0.0.1, busy on ::)
let port = Number(arg('--port', 8990)); const ownServe = () => { const pid = spawnSync('lsof', ['-nP', '-t', `-iTCP:${port}`, '-sTCP:LISTEN'], { encoding: 'utf8' }).stdout.trim().split('\n')[0]; if (!pid) return false; const cwd = (spawnSync('lsof', ['-a', '-p', pid, '-d', 'cwd', '-Fn'], { encoding: 'utf8' }).stdout.split('\n').find((l) => l.startsWith('n')) || '').slice(1); if (!cwd) return false; const here = realpathSync(process.cwd()); let there = cwd; try { there = realpathSync(cwd); } catch { /* gone */ } return there === here || there.startsWith(`${here}/`); }; // the serve runs from proto/ inside the repo (equitable: each `first` took a new port) // our own serve from an earlier `first`
if (!(await free(port)) && !ownServe()) { for (let p = port + 1; p < port + 40; p += 1) if (await free(p)) { console.log(`first: port ${port} is busy — using ${p}`); port = p; break; } }
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
if (!skip.has('probe')) step('probe-load', S('probe-load'), [url, '360,1440', '--profile', join('migration', 'site.json')], { show: 4, note: (r) => (/^tier: (.*)$/m.exec(r.stdout) || [])[1] || null });
if (!skip.has('measure')) {
  rmSync(join(dir, 'gate'), { recursive: true, force: true }); // a new measurement makes the last round's cached live capture and split stale (toryburch: deleted by hand)
  const mArgs = [url, '--out', measure, ...(typeof arg('--sections', null) === 'string' ? ['--sections', arg('--sections')] : []), ...(typeof arg('--main', null) === 'string' ? ['--main', arg('--main')] : []), ...['--header', '--footer'].flatMap((f) => (typeof arg(f, null) === 'string' ? [f, arg(f)] : []))];
  const r = step('measure-page', S('measure-page'), mArgs, { show: 0, ok: () => existsSync(content), note: (r2) => { try { const s = JSON.parse(readFileSync(join(measure, 'summary.json'), 'utf8')); return `${Object.keys(s.files || {}).length} widths, sections ${s.sectionsSelector || '?'}`; } catch { return null; } } });
  const notes = String(r.stdout).split('\n').filter((l) => /^note: |CHALLENGE|FONT LOAD FAILED|BROKEN/.test(l)).slice(0, 8); if (notes.length) console.log(notes.map((l) => `   ${l.slice(0, 220)}`).join('\n'));
  if (!existsSync(content)) finish(1, 'first: measure-page wrote no content dump — read its output above');
}
// 3 triage: the draft, accepted (edit triage.md and re-run with --skip probe,measure after `triage --from-md` to change it)
// an EDITED triage.md (newer than triage.json) is applied, not drafted over — `first --skip probe,measure` re-ran triage over the agent's edit (deloitte)
const tmd = join(dir, 'triage.md'); const edited = existsSync(tmd) && existsSync(triage) && statSync(tmd).mtimeMs > statSync(triage).mtimeMs + 500;
if (edited && !skip.has('triage')) step('triage --from-md', S('triage'), ['--from-md', tmd, '--out', triage], { show: 1 });
else if (!skip.has('triage') && !skip.has('author')) step('triage', S('triage'), [content, '--blocks', join('migration', 'blocks.json'), '--spec', join(measure, 'spec-1440.json'), '--out', triage, '--md', tmd], { show: 0, note: (r) => (/^novelty .*/m.exec(r.stdout) || [''])[0].split(' →')[0] });
// 4 media + fonts (fonts.css written from the measured @font-face rules; a WAF answer goes through the page by itself)
let daMedia = null;
if (!skip.has('media')) {
  const content360 = join(measure, 'content-360.json'); // the mobile pictures too (revlon's slideshow had its own 360 images, fetched by a case script)
  step('media', S('media-fetch'), [content, ...(existsSync(content360) ? [content360] : []), '--out', media], { show: 0, ok: () => existsSync(join(media, 'manifest.json')), note: (r) => (/(\d+) of (\d+)/.exec(r.stdout) || [])[0] || tail(r.stdout, 1).slice(0, 80) });
  const man = existsSync(join(media, 'manifest.json')) ? JSON.parse(readFileSync(join(media, 'manifest.json'), 'utf8')) : null; const failed = man ? (man.items || man.files || []).filter((x) => x.status && x.status >= 400).length : 0;
  if (failed > 3) step('media --from-page', S('media-fetch'), [content, '--out', media, '--from-page', url], { show: 0, note: () => `${failed} failed by fetch: again through the page` });
  step('fonts', S('media-fetch'), [join(measure, 'media-1440.json'), '--fonts', 'fonts', '--css', join('styles', 'fonts.css')], { show: 0, note: (r) => (/(\d+) face\(s\) declared/.exec(`${r.stdout}${r.stderr}`) || [])[0] || 'no faces declared — fonts.css by hand' });
  // the media upload runs while author and spec-to-css work (it is needed by the harness, which warms the branch-host URLs)
  const files = existsSync(media) ? readdirSync(media).filter((f) => !/\.json$/.test(f)).map((f) => join(media, f)) : [];
  if (!noDa && files.length && daToken()) { const t0 = Date.now(); daMedia = new Promise((res) => { const c = spawn(process.execPath, [S('da-put'), daTarget, ...files, '--to', 'drafts/media'], { stdio: ['ignore', 'pipe', 'pipe'] }); let out = ''; c.stdout.on('data', (d) => { out += d; }); c.stderr.on('data', (d) => { out += d; }); c.on('close', (code) => res({ code, out, seconds: Number(((Date.now() - t0) / 1000).toFixed(1)) })); }); }
  else if (!noDa && !daToken()) console.log('   no DA_TOKEN: media not uploaded (source the token, or --no-da for a local-only run)');
}
// 5 author: the document, the nav and the footer
if (!skip.has('author')) {
  const hidden = join(measure, 'hidden-1440.json');
  const summ = (() => { try { return JSON.parse(readFileSync(join(measure, 'summary.json'), 'utf8')); } catch { return {}; } })();
  const bpm = (summ.breakpoints || []).map((x) => /^(?:min|max) (\d+)/.exec(x)).filter(Boolean).map((x) => Number(x[1])).filter((x) => x >= 600 && x <= 1200)[0] || 768;
  step('author', S('author'), [triage, ...(existsSync(join(measure, 'content-360.json')) ? ['--mobile-content', join(measure, 'content-360.json'), '--mobile-bp', String(bpm)] : []), '--content', [content, ...(existsSync(hidden) ? [hidden] : [])].join(','), '--blocks', join('migration', 'blocks.json'), '--media', join(media, 'manifest.json'), '--media-host', `${host}/drafts/media`, '--out', doc, '--nav', join(docDir, 'nav.html'), '--footer', join(docDir, 'footer.html'), '--nav-path', '/drafts/nav', '--footer-path', '/drafts/footer', '--draft-new', '--site', join('migration', 'site.json'), '--url', url],
    { show: 0, ok: () => existsSync(doc), note: (r) => [/(\d+) sections? → [^(]*\(([^)]*)\)/.exec(r.stdout)?.[2], ...String(r.stderr).split('\n').filter((l) => /empty cell|did not fit|NEW|🔴/.test(l)).map((l) => l.replace(/^author: /, '').slice(0, 90))].filter(Boolean).slice(0, 3).join(' · ') || null });
  if (!noDa && daToken()) step('da-put docs', S('da-put'), [daTarget, doc, join(docDir, 'nav.html'), join(docDir, 'footer.html'), '--to', 'drafts'], { show: 0 });
}
// 6 the CSS drafts as the CSS: blocks/<name>/<name>.css (header / footer appended below the foundation rules), sections-draft into styles.css
if (!skip.has('css')) {
  step('spec-to-css', S('spec-to-css'), [measure, '--triage', triage, '--doc', doc, '--out', 'blocks', '--force', ...(existsSync(join(media, 'manifest.json')) ? ['--media', join(media, 'manifest.json')] : [])], { show: 0, note: (r) => `${(r.stdout.match(/\.css: /g) || []).length} files` });
  // the generated CSS in its own files, imported FIRST: the foundation's rules lose to its specificity, the agent's rules in styles.css come
  // later and win ties — appended below a mark, the drafts beat the agent's same-specificity rules by order (equitable: 2 of 3 rounds)
  const st = join('styles', 'styles.css'); const OLD = '/* ── sections-draft (first.mjs; below this line is regenerated) ── */';
  if (existsSync(st)) { let css = readFileSync(st, 'utf8').split(OLD)[0].trimEnd(); const imports = ["@import url('sections-draft.css');", "@import url('elements.css');"]; css = css.split('\n').filter((l) => !imports.includes(l.trim())).join('\n'); writeFileSync(st, `${imports.join('\n')}\n${css}\n`); }
  if (!existsSync(join('styles', 'elements.css'))) writeFileSync(join('styles', 'elements.css'), '/* style-pass writes the element pass here */\n');
}
// 7 the prototype and the first round at the three widths
const h = step('harness', S('harness'), [doc, '--serve', 'proto', '--name', slug, '--port', String(port), '--fragments', host, '--content', content, '--site-repo', '.', '--no-lint', ...(existsSync(media) ? ['--local-media', media] : []), ...(noDa ? [] : ['--sync-chrome'])], { show: 0, note: (r) => [(/(\d+) blocks? loaded/.exec(r.stdout) || [])[0], (/doc height (\d+)/.exec(r.stdout) || [])[0], (/(\d+) text.*not in the capture/.exec(`${r.stdout}${r.stderr}`) || [])[0]].filter(Boolean).join(' · ') });
if (h.status) finish(1, 'first: the harness failed — read its output above');
// the element pass is opt-in: on bms's replay it moved the first round 33.9 / 30.1 / 17.3 → 35.5 / 30.7 / 17.6 (the first round's error is layout,
// not type) — kept as an instrument, not a default step
if (process.argv.includes('--style-pass')) step('style-pass', S('style-pass'), [measure, `http://localhost:${port}/${slug}.harness.html`, '--out', join('styles', 'elements.css')], { show: 0, note: (r) => String(r.stdout).split('\n').filter((l) => /^style-pass \d+/.test(l)).map((l) => l.replace(/^style-pass /, '')).join(' · ').slice(0, 160) });
const g = step('gate --round', S('gate'), ['--live', url, '--build', `http://localhost:${port}/${slug}.harness.html`, '--out', join(dir, 'gate'), '--origin', measure, '--round', '--widths', '360,1440,2560', '--triage', triage], { show: 0, note: (r) => (/^target .*/m.exec(r.stdout) || [''])[0] });
if (daMedia) { const d = await daMedia; steps.push({ step: 'da-put media (background; the prototype uses local media)', seconds: d.seconds, exit: d.code, ok: !d.code, note: (/(\d+) upload/.exec(d.out) || [''])[0] || tail(d.out, 1).slice(0, 80) }); daMedia = null; }
// the split as authored, one line a row (the agents spent minutes reading structure dumps to see what `first` decided)
let splitView = ''; try { const tj = JSON.parse(readFileSync(triage, 'utf8')); splitView = `\nsplit (triage.md to change it — \`drop\`, a block name):\n${tj.sections.map((r) => `  ${String(r.index).padStart(2)} ${(r.chrome || (r.drop ? `drop:${r.drop}` : r.match.kind === 'default' ? 'default' : `${r.match.block || '?'}${r.match.variant ? ` (${r.match.variant})` : ''}`)).padEnd(18)} y${r.box?.[1] ?? '?'} h${r.box?.[3] ?? '?'}  "${String(r.anchorText || '').slice(0, 50)}"`).join('\n')}`; } catch { /* no triage */ }
const out = String(g.stdout); const from = out.indexOf('\n| width'); const reHarness = `npx stardust-lite harness ${doc} --serve proto --name ${slug} --port ${port} --fragments ${host} --content ${content} --site-repo . --no-lint${existsSync(media) ? ` --local-media ${media}` : ''}${noDa ? '' : ' --sync-chrome'}`;
const reRound = `npx stardust-lite gate --live ${url} --build http://localhost:${port}/${slug}.harness.html --out ${join(dir, 'gate')} --origin ${measure} --round --widths 360,1440,2560 --triage ${triage}`;
finish(0, `${splitView}\n${from >= 0 ? out.slice(from).trim() : tail(out, 40)}\n\nprototype: http://localhost:${port}/${slug}.harness.html · document ${doc} · CSS blocks/*/*.css (yours) and styles/styles.css (yours; sections-draft.css is imported first)\nre-run the prototype after a document edit (local media, the nav / footer re-uploaded):\n  ${reHarness}\nround:\n  ${reRound}`);
