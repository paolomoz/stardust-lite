#!/usr/bin/env node
// bench.mjs — the replay bench (exp/five-min): a finished run's measurement replayed through the pipeline with NO agent turn and gated
// against the run's own live capture, so a tool change reads as seconds and pixel % over every finished run before a field run is spent.
// Usage: node bench.mjs <site-repo…> [--mode hand|machine] [--triage case|draft] [--work /tmp/stardust-bench] [--port 8960]
//        [--widths 360,1440,2560] [--out <file.json>] [--keep-serving]
//   hand     the run's final code (HEAD) and authored document — the reference: it should reproduce the case's own gate
//   machine  the boilerplate (the repo's root commit) + this checkout's foundation; the run's fonts, icons and site profile are GIVEN (HEAD);
//            then triage (the case's reviewed triage.json, or `--triage draft`: triage's own draft) → author --draft-new → spec-to-css
//            --force (the drafts ARE the block CSS, sections-draft.css appended to styles.css) → harness → gate --origin <case measure dir>
//   Nav and footer are the served fragments (harness --fragments) in both modes. Every child runs with the scratch copy as cwd (its
//   migration/site.json is the profile); the site repos are only read. Writes <work>/bench-<mode>.json and prints one row per run.
import { spawnSync } from 'node:child_process';
import { appendFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { arg } from './common.mjs';

const here = dirname(fileURLToPath(import.meta.url)); const ROOT = resolve(here, '..');
const valued = ['--mode', '--triage', '--work', '--port', '--widths', '--out'];
const repos = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && !valued.includes(all[i - 1]));
if (!repos.length) { console.error('usage: bench.mjs <site-repo…> [--mode hand|machine] [--triage case|draft] [--work /tmp/stardust-bench] [--port 8960] [--widths 360,1440,2560] [--out <file.json>] [--keep-serving]'); process.exit(1); }
const mode = String(arg('--mode', 'machine')); const triageMode = String(arg('--triage', 'case'));
const work = resolve(String(arg('--work', '/tmp/stardust-bench'))); const port0 = Number(arg('--port', 8960)); const widths = String(arg('--widths', '360,1440,2560'));
const sh = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, ...opts });
const tail = (txt, n) => String(txt || '').split('\n').filter((l) => l.trim()).slice(-n).join('\n');

function caseOf(repo) {
  const cases = join(repo, 'migration', 'cases'); const name = existsSync(cases) ? readdirSync(cases).find((d) => existsSync(join(cases, d, 'measure', 'summary.json'))) : null;
  if (!name) return null; const dir = join(cases, name); const measure = join(dir, 'measure');
  const url = JSON.parse(readFileSync(join(measure, 'summary.json'), 'utf8')).url;
  const slug = readdirSync(join(dir, 'doc')).filter((f) => f.endsWith('.html') && !/^(nav|footer)\.html$/.test(f) && !/\.(author|raw|draft)\./.test(f)).map((f) => f.replace(/\.html$/, ''))[0];
  const m = /content\.da\.live\/([^/]+)\/([^/\s]+)/.exec(readFileSync(join(repo, 'fstab.yaml'), 'utf8')); const branch = sh('git', ['-C', repo, 'rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
  return { name, dir, measure, url, slug, host: m ? `https://${branch}--${m[2]}--${m[1]}.aem.page` : null };
}
const fromGit = (repo, rev, dest, paths = []) => { mkdirSync(dest, { recursive: true }); const a = sh('git', ['-C', repo, 'archive', rev, ...paths], { encoding: 'buffer' }); if (a.status) return false; sh('tar', ['-x', '-C', dest], { input: a.stdout }); return true; };

const results = [];
for (const [i, repo0] of repos.entries()) {
  const repo = resolve(repo0); const site = basename(repo); const c = caseOf(repo); const port = port0 + i;
  const row = { site, mode, triage: mode === 'machine' ? triageMode : 'case', url: c?.url, steps: [], gate: null, error: null };
  results.push(row); console.log(`\n=== ${site} (${mode}${mode === 'machine' ? `, triage ${triageMode}` : ''})  ${c?.url || ''}`);
  if (!c?.slug || !c.host) { row.error = 'no case with a measure dir, a doc and an fstab mount'; console.log(`bench: ${row.error}`); continue; }
  const scratch = join(work, `${site}-${mode}${mode === 'machine' ? `-${triageMode}` : ''}`); rmSync(scratch, { recursive: true, force: true }); mkdirSync(scratch, { recursive: true });
  const step = (name, script, args, { cwd = scratch, ok = (r) => !r.status } = {}) => {
    const t0 = Date.now(); const r = sh(process.execPath, [script, ...args], { cwd }); const s = Number(((Date.now() - t0) / 1000).toFixed(1));
    const good = ok(r); row.steps.push({ step: name, seconds: s, exit: r.status, ok: good, out: tail(`${r.stdout}\n${r.stderr}`, 4) });
    console.log(`── ${name} ${s}s exit ${r.status}${good ? '' : ' ✗'}\n${tail(`${r.stdout}\n${r.stderr}`, 4).replace(/^/gm, '   ')}`); return r;
  };
  const doc = join(scratch, 'doc', `${c.slug}.html`); const triage = join(scratch, 'triage.json'); mkdirSync(join(scratch, 'doc'), { recursive: true });
  if (mode === 'hand') {
    fromGit(repo, 'HEAD', scratch); cpSync(join(c.dir, 'doc', `${c.slug}.html`), doc); cpSync(join(c.dir, 'triage.json'), triage);
  } else {
    const root = sh('git', ['-C', repo, 'rev-list', '--max-parents=0', 'HEAD']).stdout.trim().split('\n').pop();
    fromGit(repo, root, scratch); for (const p of ['fonts', 'icons', 'styles/fonts.css', 'migration/site.json']) fromGit(repo, 'HEAD', scratch, [p]);
    const fontsCss = readFileSync(join(scratch, 'styles', 'fonts.css'), 'utf8');
    step('init', join(ROOT, 'bin', 'stardust-lite.mjs'), ['init', '--foundation', '--force']);
    writeFileSync(join(scratch, 'styles', 'fonts.css'), fontsCss); // the run's fonts are given; the foundation's fonts.css is a skeleton
    const sj = join(scratch, 'scripts', 'scripts.js'); let js = readFileSync(sj, 'utf8'); // the wiring every run did by hand (si-home: init does not)
    if (!js.includes('./stardust.js')) { js = js.replace(/(} from '\.\/aem\.js';\n)/, `$1import { decorateIconTokens } from './stardust.js';\n`).replace(/(export function decorateMain\(main\) \{\n)/, '$1  decorateIconTokens(main);\n'); writeFileSync(sj, js); }
    const content = join(c.measure, 'content-1440.json'); const spec = join(c.measure, 'spec-1440.json');
    if (triageMode === 'draft') step('triage', join(here, 'triage.mjs'), [content, '--blocks', join(scratch, 'migration', 'blocks.json'), '--spec', spec, '--out', triage, '--md', join(scratch, 'triage.md')]);
    else cpSync(join(c.dir, 'triage.json'), triage);
    const manifest = join(c.dir, 'media', 'manifest.json');
    step('author', join(here, 'author.mjs'), [triage, '--content', content, '--blocks', join(scratch, 'migration', 'blocks.json'), ...(existsSync(manifest) ? ['--media', manifest] : []), '--media-host', `${c.host}/drafts/media`,
      '--out', doc, '--nav', join(scratch, 'doc', 'nav.html'), '--footer', join(scratch, 'doc', 'footer.html'), '--nav-path', '/drafts/nav', '--footer-path', '/drafts/footer',
      '--draft-new', '--site', join(scratch, 'migration', 'site.json'), '--url', c.url, '--no-lint'], { ok: (r) => existsSync(doc) });
    step('spec-to-css', join(here, 'spec-to-css.mjs'), [c.measure, '--triage', triage, '--doc', doc, '--out', 'blocks', '--force']);
    const sd = join(scratch, 'styles', 'sections-draft.css'); if (existsSync(sd)) appendFileSync(join(scratch, 'styles', 'styles.css'), `\n${readFileSync(sd, 'utf8')}`);
  }
  if (!existsSync(doc)) { row.error = 'no document'; continue; }
  sh('sh', ['-c', `lsof -ti tcp:${port} | xargs kill 2>/dev/null`]);
  step('harness', join(here, 'harness.mjs'), [doc, '--serve', join(scratch, 'proto'), '--name', c.slug, '--port', String(port), '--fragments', c.host, '--content', join(c.measure, 'content-1440.json'), '--site-repo', scratch, '--no-lint']);
  const g = step('gate', join(here, 'gate.mjs'), ['--live', c.url, '--build', `http://localhost:${port}/${c.slug}.harness.html`, '--out', join(scratch, 'gate'), '--origin', c.measure, '--widths', widths, '--triage', triage, '--no-budget']);
  try { const gj = JSON.parse(readFileSync(join(scratch, 'gate', 'gate.json'), 'utf8')); row.gate = gj.rows.map((r) => ({ W: r.W, pct: r.pct, dh: r.dh })); row.timing = gj.timing; } catch { row.error = `gate exit ${g.status}`; }
  if (!process.argv.includes('--keep-serving')) sh('sh', ['-c', `lsof -ti tcp:${port} | xargs kill 2>/dev/null`]);
}

const sum = (r, names) => Number(r.steps.filter((s) => names.includes(s.step)).reduce((a, s) => a + s.seconds, 0).toFixed(1));
console.log(`\n| site | prototype s | gate s | ${widths.split(',').map((w) => `${w} %`).join(' | ')} | Δdoc | failed steps |\n|---|---|---|${widths.split(',').map(() => '---|').join('')}---|---|`);
for (const r of results) {
  const g = (W) => r.gate?.find((x) => String(x.W) === W); const failed = r.steps.filter((s) => !s.ok).map((s) => s.step).join(', ') || (r.error ?? '');
  console.log(`| ${r.site} | ${sum(r, ['init', 'triage', 'author', 'spec-to-css', 'harness'])} | ${sum(r, ['gate'])} | ${widths.split(',').map((W) => g(W)?.pct ?? '—').join(' | ')} | ${widths.split(',').map((W) => g(W)?.dh ?? '—').join(' / ')} | ${failed} |`);
}
const outFile = resolve(String(arg('--out', join(work, `bench-${mode}${mode === 'machine' ? `-${triageMode}` : ''}.json`)))); mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify({ _schema: 'stardust-lite/bench@1', _writtenAt: new Date().toISOString(), mode, triage: triageMode, widths, results }, null, 1)); console.log(`\nbench: ${outFile}`);
