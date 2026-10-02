#!/usr/bin/env node
// page-run.mjs — ROLLOUT steps 1–7 as ONE deterministic call for a page after the template: measure-page (with the live capture), triage +
// block-inventory diff, STOP for the review, then media-fetch, da-put, author, lint, harness, the section tables at the three widths with
// their verdict and the pairing at the three widths. Nothing is reimplemented: every step is a child process of the sibling instrument
// with the flags it already takes (pass-through), run in order with the page dir `migration/pages/<slug>/`; page-run only orders them,
// times them and stops where judgement is needed (sdt-dentsu speed: a reuse-only page took 16–20 min wall with the model idle most of
// it — the steps between two decisions do not need a model at all).
// Usage: node page-run.mjs <slug> [--pages migration/pages.json] [--url <url>] [--sections <css>] [--main <css>] [--hidden <css,…>]
//        [--triage-sections <node sels>] [--accept-draft] [--resume] [--no-da] [--port <n>] [--fragments <branch host>] [--widths 360,1440,2560]
//        [--out-root migration/pages] [--serve-dir proto] [--blocks migration/blocks.json] [--keep-spacers] [--no-lint]
//        [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--require <css,…>] [--site <site.json> | --no-site]
//   <slug>            the page's row in pages.json (url, slug, docPath); --url for a page not in the list (docPath /drafts/<slug>)
//   --sections        measure-page's section selector. Without it the first run uses the default; when the summary says it matched
//                     nothing the structure dump is read for ONE obvious candidate (every child of the content root shares a tag and a
//                     class) and measure-page runs again with it — else the run stops (exit 5) naming the structure file to read
//   --triage-sections triage's `--sections` (dump node selectors) when the automatic split is not the page
//   --accept-draft    continue past the triage with the draft as it is;  --resume  continue from the reviewed triage.json (measure and
//                     triage are skipped when their files exist)
//   --no-da           skip the media upload (no token needed; author still writes the branch-host URLs — the harness warms them)
// Exit: 0 tables CLEAN · 1 rows off, or a step failed (the agent's rounds start there) · 5 review needed (the triage draft, or the
//       section selector) · 6 template candidate (novelty ≥ 0.5, or author exit 3: a NEW section) · 1 usage
// Writes <page dir>/page-run.json { slug, url, steps: [{ step, seconds, exit, result }], novelty, verdict, harnessUrl, exit } and prints the step table.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { arg, siteProfile, davidsLint } from './common.mjs';

const slug = process.argv[2];
const USAGE = 'usage: page-run.mjs <slug> [--pages migration/pages.json] [--url <url>] [--sections <css>] [--main <css>] [--hidden <css,…>] [--triage-sections <node sels>] [--accept-draft] [--resume] [--no-da] [--port <n>] [--fragments <branch host>] [--widths 360,1440,2560] [--out-root migration/pages] [--serve-dir proto] [--blocks migration/blocks.json]';
if (!slug || slug.startsWith('--')) { console.error(USAGE); process.exit(1); }
const profile = siteProfile();
const pagesFile = resolve(String(arg('--pages', 'migration/pages.json')));
const row = existsSync(pagesFile) ? ((JSON.parse(readFileSync(pagesFile, 'utf8')).pages || []).find((p) => p.slug === slug) || null) : null;
const url = typeof arg('--url', null) === 'string' ? arg('--url') : row?.url || null;
if (!url) { console.error(`${USAGE}\n  ${slug}: no row in ${pagesFile} and no --url`); process.exit(1); }
const docPath = row?.docPath || `/drafts/${slug}`;
const pageDir = resolve(String(arg('--out-root', 'migration/pages')), slug); mkdirSync(pageDir, { recursive: true });
const measureDir = join(pageDir, 'measure'); const mediaDir = join(pageDir, 'media'); const docDir = join(pageDir, 'doc');
const triageJson = join(pageDir, 'triage.json'); const triageMd = join(pageDir, 'triage.md'); const doc = join(docDir, `${slug}.html`);
const widths = String(arg('--widths', (profile?.widths || [360, 1440, 2560]).join(','))); const baseW = profile?.baseWidth ?? 1440;
const blocks = resolve(String(arg('--blocks', 'migration/blocks.json')));
const port = Number(arg('--port', profile?.serve?.port ?? 8930)); const serveDir = String(arg('--serve-dir', 'proto'));
const fragments = typeof arg('--fragments', null) === 'string' ? arg('--fragments') : profile?.media?.branchHost || null;
const accept = process.argv.includes('--accept-draft'); const resume = process.argv.includes('--resume'); const noDa = process.argv.includes('--no-da');
const content = join(measureDir, `content-${baseW}.json`); const spec = join(measureDir, `spec-${baseW}.json`);
// pass-through: the overlay / profile flags every page-opening step takes
const passValued = ['--consent', '--dismiss', '--locale', '--require', '--site'].flatMap((f) => (typeof arg(f, null) === 'string' ? [f, arg(f)] : []));
const passSwitches = ['--no-site'].filter((f) => process.argv.includes(f));
const overlays = [...passValued, ...passSwitches];
const here = dirname(fileURLToPath(import.meta.url)); const sibling = (name) => join(here, `${name}.mjs`);

const steps = []; const state = { _schema: 'stardust-lite/page-run@1', _writtenAt: null, slug, url, docPath, pageDir, pagesFile: row ? pagesFile : null, steps, novelty: null, verdict: null, verdictFile: null, harnessUrl: null, exit: null };
const save = (exit) => { state.exit = exit; state._writtenAt = new Date().toISOString(); writeFileSync(join(pageDir, 'page-run.json'), JSON.stringify(state, null, 1)); };
const table = () => { console.log('\n| step | s | result |\n|---|---|---|'); for (const s of steps) console.log(`| ${s.step} | ${s.seconds} | ${s.result} |`); };
const finish = (exit, line) => { table(); if (line) console.log(`\n${line}`); console.log(`page-run: ${join(pageDir, 'page-run.json')}`); save(exit); process.exit(exit); };
const tail = (txt, n) => txt.split('\n').filter((l) => l.trim()).slice(-n).join('\n');
/** One step as a child of a sibling instrument; prints the command and the last lines; records seconds and the exit. */
function step(name, script, args, { lines = 6, result = null, skip = null } = {}) {
  if (skip) { steps.push({ step: name, seconds: 0, exit: null, result: `skipped — ${skip}` }); console.log(`\n── ${name}: skipped — ${skip}`); return { status: null, stdout: '', stderr: '', skipped: true }; }
  console.log(`\n── ${name}: node ${script.replace(here + '/', '')} ${args.map((a) => (/\s/.test(a) ? `'${a}'` : a)).join(' ')}`);
  const t0 = Date.now(); const r = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const seconds = Number(((Date.now() - t0) / 1000).toFixed(1)); r.stdout = r.stdout || ''; r.stderr = r.stderr || '';
  const out = tail(`${r.stdout}\n${r.status ? r.stderr : ''}`, lines); if (out) console.log(out);
  const res = typeof result === 'function' ? result(r) : (r.status ? `exit ${r.status}` : 'ok');
  steps.push({ step: name, seconds, exit: r.status, result: res }); return r;
}
const measureReady = () => existsSync(join(measureDir, 'summary.json')) && existsSync(content) && existsSync(spec);

// ───────── 1 measure-page (with the live capture) ─────────
const mArgs = (sections) => [url, '--out', measureDir, ...(sections ? ['--sections', sections] : []), ...(typeof arg('--main', null) === 'string' ? ['--main', arg('--main')] : []), ...(typeof arg('--hidden', null) === 'string' ? ['--hidden', arg('--hidden')] : []), '--widths', widths, ...overlays];
const mResult = (r) => { let s = null; try { s = JSON.parse(readFileSync(join(measureDir, 'summary.json'), 'utf8')); } catch { return `exit ${r.status} — no summary`; } const pc = s.profileCheck ? `profile check ${s.profileCheck.verdict}` : 'no profile'; const caps = Object.keys(s.captures || {}).length; return `${r.status ? `exit ${r.status}; ` : ''}${Object.keys(s.files || {}).length} widths, ${caps} captures, ${pc}`; };
let sections = typeof arg('--sections', null) === 'string' ? arg('--sections') : null;
let m = step('measure-page', sibling('measure-page'), mArgs(sections), { lines: 8, result: mResult, skip: resume && measureReady() ? 'resume: measure/ exists' : null });
if (!m.skipped && m.status && m.status !== 2) finish(1, `measure-page failed (exit ${m.status})`);
let summary = null; try { summary = JSON.parse(readFileSync(join(measureDir, 'summary.json'), 'utf8')); } catch { finish(1, `no ${join(measureDir, 'summary.json')}`); }
if (summary.profileCheck?.verdict === 'FAIL') console.log(`page-run: profile check FAIL — ${summary.profileCheck.rows.filter((r) => r.verdict === 'FAIL').map((r) => `${r.W} ${r.check}`).join('; ')} (site work: run \`site-profile check\` on its own; the run continues)`);
if (!sections && (summary.notes || []).some((n) => /matches nothing/.test(n))) {
  // the structure dump: ONE obvious candidate — every child of the content root (or of its single child, two levels down) shares a tag and a class
  const structFile = join(measureDir, `structure-${baseW}.txt`);
  const lines = existsSync(structFile) ? readFileSync(structFile, 'utf8').split('\n').filter((l) => /^\s*\S/.test(l) && !/^doc /.test(l)) : [];
  const parse = (l) => { const m2 = /^(\s*)([a-z0-9]+)((?:[#.][^\s#.]+)*)/i.exec(l); if (!m2) return null; return { depth: m2[1].length / 2, tag: m2[2], name: `${m2[2]}${m2[3]}`, classes: (m2[3].match(/\.[^\s#.]+/g) || []).map((c) => c.slice(1)) }; };
  const nodes = lines.map(parse).filter(Boolean); let candidate = null;
  let parent = nodes[0]; let depth = 1;
  while (parent && depth <= 3 && !candidate) {
    const i0 = nodes.indexOf(parent); const kids = []; for (let i = i0 + 1; i < nodes.length && nodes[i].depth > parent.depth; i += 1) if (nodes[i].depth === parent.depth + 1) kids.push(nodes[i]);
    if (kids.length >= 2 && kids.every((k) => k.tag === kids[0].tag)) { const common = kids[0].classes.filter((c) => kids.every((k) => k.classes.includes(c))); if (common.length) candidate = `${parent.name} > ${kids[0].tag}.${common[0]}`; break; }
    if (kids.length === 1) { parent = kids[0]; depth += 1; } else break;
  }
  if (!candidate) finish(5, `measure-page: the default section selector matches nothing and ${structFile} gives no single obvious candidate — read it, then run again with --sections <css>`);
  console.log(`page-run: section selector from the structure dump — ${candidate} (every child of ${parent.name} shares it); measuring again`);
  sections = candidate; m = step('measure-page (--sections)', sibling('measure-page'), mArgs(sections), { lines: 8, result: mResult });
  if (m.status && m.status !== 2) finish(1, `measure-page failed (exit ${m.status})`);
  try { summary = JSON.parse(readFileSync(join(measureDir, 'summary.json'), 'utf8')); } catch { /* keep */ }
}
if (!existsSync(content) || !existsSync(spec)) finish(1, `measure-page wrote no ${content} / ${spec}`);

// ───────── 2 triage + block-inventory diff, then the stop ─────────
const tArgs = [content, '--blocks', blocks, '--spec', spec, '--out', triageJson, '--md', triageMd, ...(typeof arg('--triage-sections', null) === 'string' ? ['--sections', arg('--triage-sections')] : [])];
const t = step('triage', sibling('triage'), tArgs, { lines: 4, result: (r) => (r.status ? `exit ${r.status}` : (r.stdout.match(/novelty[^\n]*/i) || ['written'])[0].slice(0, 80)), skip: resume && existsSync(triageJson) ? 'resume: triage.json exists (reviewed)' : null });
if (!t.skipped && t.status) finish(1, `triage failed (exit ${t.status})`);
const d = step('block-inventory diff', sibling('block-inventory'), ['diff', triageJson, '--blocks', blocks], { lines: 12, result: (r) => (r.stdout.match(/novelty \d+ %[^—]*/) || [`exit ${r.status}`])[0].trim() });
const novM = d.stdout.match(/novelty (\d+) %/); state.novelty = novM ? Number(novM[1]) / 100 : null;
const noveltyLine = (d.stdout.match(/novelty[^\n]*/) || ['novelty: (no line)'])[0];
if (!accept && !resume) finish(5, `review needed — ${noveltyLine}\nreview ${triageMd} (flip a wrong match, name a weak one, set a section style), then \`triage --from-md ${triageMd} --out ${triageJson}\` and \`page-run ${slug} --resume\`; or \`--accept-draft\` to continue with the draft as it is`);
// ───────── 3 escalation ─────────
if (state.novelty !== null && state.novelty >= 0.5) finish(6, `template candidate — ${noveltyLine}\n${d.stdout.trim()}\nnot a page run: METHOD.md in full (ROLLOUT's escalation rule)`);

// ───────── 4 media-fetch, 5 da-put ─────────
const mf = step('media-fetch', sibling('media-fetch'), [content, '--out', mediaDir], { lines: 3, result: (r) => (r.stdout.match(/media-fetch: [^\n]*/) || [`exit ${r.status}`])[0] });
if (mf.status && mf.status !== 2) finish(1, `media-fetch failed (exit ${mf.status})`);
const mediaFiles = existsSync(mediaDir) ? readdirSync(mediaDir).filter((f) => f !== 'manifest.json').map((f) => join(mediaDir, f)) : [];
const folder = profile?.media?.folder || null;
step('da-put media', sibling('da-put'), [...mediaFiles, '--to', folder || ''], { lines: 4, result: (r) => (r.status ? `exit ${r.status} — ${tail(r.stderr || r.stdout, 1).slice(0, 80)}` : `${mediaFiles.length} files → ${folder}`), skip: noDa ? '--no-da' : !mediaFiles.length ? 'no media' : !folder ? 'the profile has no media.folder' : !process.env.DA_TOKEN ? 'DA_TOKEN not set (source ~/.claude/.env)' : null });

// ───────── 6 author, 7 lint ─────────
const manifest = join(mediaDir, 'manifest.json');
const a = step('author', sibling('author'), [triageJson, '--content', content, '--blocks', blocks, ...(existsSync(manifest) ? ['--media', manifest] : []), '--out', doc, '--url', url, ...(process.argv.includes('--keep-spacers') ? ['--keep-spacers'] : []), ...(process.argv.includes('--no-lint') ? ['--no-lint'] : []), ...(typeof arg('--site', null) === 'string' ? ['--site', arg('--site')] : []), ...passSwitches], { lines: 10, result: (r) => (r.status === 3 ? 'exit 3 — a NEW section' : r.status === 2 ? 'exit 2 — lint 🔴' : r.status ? `exit ${r.status}` : `written ${doc}`) });
if (a.status === 3) finish(6, `template candidate — author wrote ${doc} with a NEW section (exit 3): model the block first (METHOD step 2), or name it in ${triageMd}`);
if (a.status && a.status !== 2) finish(1, `author failed (exit ${a.status})`);
const lint = davidsLint();
const l = step('lint', lint, [docDir], { lines: 6, result: (r) => (r.status === 2 ? '🔴 — a modelling defect in the triage' : r.status ? `exit ${r.status}` : 'clean'), skip: existsSync(lint) ? null : `${lint} not found (DAVIDS_LINT)` });
if (l.status === 2 && !process.argv.includes('--no-lint')) finish(1, `lint 🔴 in ${docDir} — fix the triage (not the HTML), then \`page-run ${slug} --resume\``);

// ───────── 8 harness (serve must answer on the port) ─────────
const serving = async () => { try { const r = await fetch(`http://localhost:${port}/`, { signal: AbortSignal.timeout(1500) }); return r.status > 0; } catch { return false; } };
if (!(await serving())) {
  console.log(`\n── serve: nothing answers on :${port} — starting \`serve ${serveDir} --port ${port} --site .\` (detached; it stays up for the next runs)`);
  const child = spawn(process.execPath, [sibling('serve'), serveDir, '--port', String(port), '--site', '.'], { detached: true, stdio: 'ignore' }); child.unref();
  const t0 = Date.now(); while (!(await serving()) && Date.now() - t0 < 10000) await new Promise((r) => setTimeout(r, 300));
  if (!(await serving())) finish(1, `serve did not answer on :${port} within 10 s — start it by hand: \`npx stardust-lite serve ${serveDir} --port ${port} --site .\``);
  steps.push({ step: 'serve', seconds: Number(((Date.now() - t0) / 1000).toFixed(1)), exit: 0, result: `started on :${port}` });
}
const harnessUrl = `http://localhost:${port}/${slug}.harness.html`; state.harnessUrl = harnessUrl;
const h = step('harness', sibling('harness'), [doc, '--serve', serveDir, '--name', slug, '--port', String(port), ...(fragments ? ['--fragments', fragments] : []), '--content', content, ...(process.argv.includes('--no-lint') ? ['--no-lint'] : [])], { lines: 8, result: (r) => { if (r.status) return `exit ${r.status}`; const b = r.stdout.match(/^blocks: (.*)$/m); const all = b ? b[1].split(' | ').filter(Boolean) : []; const miss = r.stdout.match(/content check (\d+) texts, (\d+) not in/); return `${all.filter((x) => / → loaded$/.test(x)).length}/${all.length} blocks loaded${miss ? `, ${miss[2]} of ${miss[1]} texts not in the capture` : ''}`; } });
if (h.status) finish(1, `harness failed (exit ${h.status}) — ${tail(h.stderr || h.stdout, 1).slice(0, 160)}`);

// ───────── 9 sections at the widths with the verdict, 10 pair at the widths ─────────
const sv = step('sections (verdict)', sibling('sections'), [harnessUrl, '--widths', widths, '--spec-dir', measureDir, '--blocks', blocks, '--triage', triageJson, '--out', measureDir, ...overlays], { lines: 3, result: (r) => (r.stdout.match(/^tables: [^\n]*/m) || [`exit ${r.status}`])[0].slice(0, 120) });
state.verdict = (sv.stdout.match(/^tables: [^\n]*/m) || [null])[0]; state.verdictFile = existsSync(join(measureDir, 'sections-verdict.json')) ? join(measureDir, 'sections-verdict.json') : null;
process.stdout.write(sv.stdout.split('\n').filter((ln) => /^(==|doc height|idx|\s*\d+\s+\d+|rows at|\*|  build #)/.test(ln)).join('\n') + '\n');
// the three pairings at once (one browser each — the spec is the only input; the serve answers concurrent sessions)
const pairWidths = widths.split(',').map(Number).filter((w) => existsSync(join(measureDir, `spec-${w}.json`)));
console.log(`\n── pair: ${pairWidths.map((w) => `node scripts/pair.mjs measure/spec-${w}.json ${harnessUrl}`).join(' | ')} (concurrent)`);
const t0p = Date.now();
const pairs = await Promise.all(pairWidths.map((w) => new Promise((res) => { const c = spawn(process.execPath, [sibling('pair'), join(measureDir, `spec-${w}.json`), harnessUrl, ...overlays], { encoding: 'utf8' }); let so = ''; let se = ''; c.stdout.on('data', (x) => { so += x; }); c.stderr.on('data', (x) => { se += x; }); c.on('close', (code) => res({ w, code, so, se })); })));
for (const pr of pairs) { // the full table per width next to the specs; here the summary, the group offsets and the first hot rows
  writeFileSync(join(measureDir, `pair-${pr.w}.txt`), pr.so + (pr.se ? `\n${pr.se}` : ''));
  const hot = pr.so.split('\n').filter((ln) => /^.{31}\[/.test(ln) && !/^anchor /.test(ln)); const sum = pr.so.split('\n').filter((ln) => /^(group offset|\d+ anchors)/.test(ln));
  console.log(`\n[${pr.w}] ${pr.code ? `pair exit ${pr.code}: ${tail(pr.se, 1).slice(0, 120)}` : ''}${sum.join('\n')}\n${hot.slice(0, 12).join('\n')}${hot.length > 12 ? `\n… ${hot.length - 12} more hot rows in ${join(measureDir, `pair-${pr.w}.txt`)}` : ''}`);
}
const pairSummary = pairs.map((pr) => { const s = pr.so.match(/(\d+) anchors, (\d+) located/); const hot = pr.so.split('\n').filter((ln) => /^.{31}\[/.test(ln) && !/^anchor /.test(ln) && !/⤷/.test(ln)).length; return `${pr.w}: ${s ? `${s[2]}/${s[1]} located` : `exit ${pr.code}`}, ${hot} hot row${hot === 1 ? '' : 's'}`; }).join('; ');
steps.push({ step: `pair ×${pairWidths.length}`, seconds: Number(((Date.now() - t0p) / 1000).toFixed(1)), exit: pairs.some((pr) => pr.code) ? 1 : 0, result: pairSummary });

const clean = sv.status === 0 && /^tables: CLEAN/.test(state.verdict || '');
finish(clean ? 0 : 1, `${state.verdict || 'tables: (no verdict)'}\nprototype: ${harnessUrl}${state.verdictFile ? `\nverdict: ${state.verdictFile} (gate --skip-widths-when-clean reads it)` : ''}\nnext: ${clean ? `gate --live ${url} --build ${harnessUrl} --out ${join(pageDir, 'gate')} --widths ${widths} --chrome --budget --triage ${triageJson} --skip-widths-when-clean ${state.verdictFile || '<sections-verdict.json>'} (ROLLOUT step 8)` : 'the rows the verdict names — a section style or a recipe, not block CSS (ROLLOUT step 7)'}`);
