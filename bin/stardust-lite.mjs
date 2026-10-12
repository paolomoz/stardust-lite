#!/usr/bin/env node
// stardust-lite — run the method's instruments from any project (the site repo being migrated).
//   npx stardust-lite setup <url>          in an EDS site repo: install stardust-lite + Chromium, the foundation, run.json, the next commands
//   npx stardust-lite init                 scaffold the skill stub, AGENTS.md section and migration/ case dir in the current repo
//   npx stardust-lite init --foundation    also copy templates/foundation/ (scripts/stardust.js, styles/reset.css, styles.css, fonts.css) — never overwrites
//   npx stardust-lite <instrument> [args]  run scripts/<instrument>.mjs or tools/replica/<instrument>.mjs (lint → tools/lint)
//   npx stardust-lite checklist            print the path of CHECKLIST.md (the template run: twelve steps on one screen — read first)
//   npx stardust-lite method               print the path of METHOD.md (the reference behind the checklist)
//   npx stardust-lite rollout              print the path of ROLLOUT.md (a page after the template reads this instead)
//   npx stardust-lite list [--usage]       list instruments (--usage: every usage line in one call — 25 single prints cost 3 min, scotiabank-personal)
//   npx stardust-lite init --foundation --force   overwrite the boilerplate's styles.css / fonts.css with the skeletons (a fresh boilerplate is not a measurement)
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync, readdirSync, copyFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [cmd, ...rest] = process.argv.slice(2);
const dirs = { scripts: join(ROOT, 'scripts'), replica: join(ROOT, 'tools', 'replica'), lint: join(ROOT, 'tools', 'lint') };
const list = () => Object.entries(dirs).flatMap(([k, d]) => readdirSync(d).filter((f) => f.endsWith('.mjs') && !f.endsWith('.test.mjs') && !['common.mjs', 'run-capped.mjs'].includes(f)).map((f) => `${f.replace(/\.mjs$/, '')}  (${k})`));

if (!cmd || cmd === 'help' || cmd === '--help') {
  { const lines = readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1); console.log(lines.slice(0, lines.findIndex((l) => !l.startsWith('//'))).map((l) => l.replace(/^\/\/ ?/, '')).join('\n')); }
  console.log('\ninstruments:\n  ' + list().join('\n  '));
  process.exit(0);
}
if (cmd === 'method') { console.log(join(ROOT, 'METHOD.md')); process.exit(0); }
if (cmd === 'checklist') { console.log(join(ROOT, 'CHECKLIST.md')); process.exit(0); }
if (cmd === 'rollout') { console.log(join(ROOT, 'ROLLOUT.md')); process.exit(0); }
if (cmd === 'list') {
  if (!rest.includes('--usage')) { console.log(list().join('\n')); process.exit(0); }
  for (const [k, d] of Object.entries(dirs)) for (const f of readdirSync(d).filter((x) => x.endsWith('.mjs') && !x.endsWith('.test.mjs') && !['common.mjs', 'run-capped.mjs'].includes(x))) {
    const head = readFileSync(join(d, f), 'utf8').split('\n').slice(0, 80); let i = head.findIndex((l) => /^\/\/.*\busage:/i.test(l)); const out = [];
    if (i < 0) i = head.findIndex((l) => /^\/\/ *(node |npx )/.test(l));
    if (i >= 0) { out.push(head[i]); for (let j = i + 1; j < head.length && out.length < 4 && /^\/\/\s{6,}\S/.test(head[j]); j++) out.push(head[j]); }
    console.log(`${f.replace(/\.mjs$/, '')} (${k})\n${out.length ? out.map((l) => '  ' + l.replace(/^\/\/ ?/, '').replace(/^\s*Usage:\s*/i, '')).join('\n') : '  (no usage line; run it without arguments)'}`);
  }
  process.exit(0);
}
if (cmd === 'init') {
  const cwd = process.cwd();
  const rel = existsSync(join(cwd, 'node_modules', 'stardust-lite', 'METHOD.md')) ? 'node_modules/stardust-lite' : ROOT;
  const skill = readFileSync(join(ROOT, 'templates', 'SKILL.md'), 'utf8').replaceAll('{{ROOT}}', rel);
  for (const d of ['.github/skills/stardust-lite', '.claude/skills/stardust-lite']) { mkdirSync(join(cwd, d), { recursive: true }); writeFileSync(join(cwd, d, 'SKILL.md'), skill); }
  const agents = readFileSync(join(ROOT, 'templates', 'AGENTS.md'), 'utf8').replaceAll('{{ROOT}}', rel);
  const agentsPath = join(cwd, 'AGENTS.md');
  if (!existsSync(agentsPath) || !readFileSync(agentsPath, 'utf8').includes('## Migration with stardust-lite')) appendFileSync(agentsPath, (existsSync(agentsPath) ? '\n' : '') + agents);
  mkdirSync(join(cwd, 'migration', 'cases'), { recursive: true });
  if (!existsSync(join(cwd, 'migration', 'README.md'))) writeFileSync(join(cwd, 'migration', 'README.md'), readFileSync(join(ROOT, 'templates', 'migration-README.md'), 'utf8').replaceAll('{{ROOT}}', rel));
  const gi = join(cwd, '.gitignore'); const ignore = '\n# stardust-lite evidence that regenerates\nmigration/**/*.png\nmigration/**/*.jpg\nmigration/**/proto/\nmigration/**/media/\n';
  if (!existsSync(gi) || !readFileSync(gi, 'utf8').includes('stardust-lite evidence')) appendFileSync(gi, ignore);
  console.log(`stardust-lite: wrote .github/skills/stardust-lite/SKILL.md, .claude/skills/stardust-lite/SKILL.md, AGENTS.md section, migration/ (method at ${rel}/METHOD.md, rollout at ${rel}/ROLLOUT.md)`);
  // the measurements and captures are evidence, not site code: kept out of git (bms committed measure/ with the source's dom-*.html — AGENTS.md
  // says captures are not committed)
  { const gi = join(cwd, '.gitignore'); const block = '\n# stardust-lite: measurements and captures are evidence, not site code\nmigration/cases/*/measure/\nmigration/cases/*/gate*/\nmigration/cases/*/media/\nproto/\n*.harness.html\nTIMING.log\n'; const cur = existsSync(gi) ? readFileSync(gi, 'utf8') : ''; if (!cur.includes('stardust-lite: measurements')) { writeFileSync(gi, cur + block); console.log('stardust-lite: .gitignore keeps measure/, gate*/, media/ and proto/ out of git'); } }
  if (rest.includes('--foundation')) {
    // the foundation is site code the operator owns after copying: an existing file is never overwritten
    const src = join(ROOT, 'templates', 'foundation'); const wrote = []; const skipped = [];
    const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
    for (const f of walk(src)) {
      const relPath = relative(src, f); const dest = join(cwd, relPath === 'README.md' ? join('migration', 'foundation-README.md') : relPath);
      if (existsSync(dest) && !rest.includes('--force')) { skipped.push(relative(cwd, dest)); continue; }
      mkdirSync(dirname(dest), { recursive: true }); copyFileSync(f, dest); wrote.push(relative(cwd, dest));
    }
    // scripts.js imports the foundation helpers and runs decorateIconTokens(main) before decorateIcons (every run wired it by hand — si-home)
    const sj = join(cwd, 'scripts', 'scripts.js');
    if (existsSync(sj)) { let js = readFileSync(sj, 'utf8'); if (!js.includes('./stardust.js')) { js = js.replace(/(} from '\.\/aem\.js';\n)/, "$1import { decorateIconTokens, decorateArtDirection, decorateVideos } from './stardust.js';\n").replace(/(export function decorateMain\(main\) \{\n)/, '$1  decorateIconTokens(main);\n  decorateArtDirection(main);\n  decorateVideos(main);\n'); writeFileSync(sj, js); wrote.push('scripts/scripts.js (stardust.js wired)'); } }
    console.log(`stardust-lite foundation: wrote ${wrote.length ? wrote.join(', ') : 'nothing'}${skipped.length ? `; skipped (exists) ${skipped.join(', ')}` : ''}`);
    if (skipped.includes('styles/styles.css')) console.log(`stardust-lite foundation: styles/styles.css exists — \`init --foundation --force\` overwrites it with the skeleton (the boilerplate's rules are not measurements, METHOD step 4)`);
  }
  process.exit(0);
}
if (cmd === 'setup') {
  // stardust-lite in the EDS site repo the session works in (node built-ins only: it runs from the plugin dir before any `npm install`).
  // It never creates a repo — an EDS site repo is the run's context (the aem-boilerplate shape: fstab.yaml, scripts/aem.js, head.html) and
  // its absence is a stop. It installs stardust-lite and Chromium, copies the foundation (over the boilerplate's styles only on a fresh
  // repo: a site with earlier runs keeps its tuned files), writes migration/run.json, commits, and prints the next commands
  // (bmc-home, continental vision-mission: ≈ 2 min of hand-typed setup each).
  const opt = (f, d) => { const i = rest.indexOf(f); return i >= 0 && rest[i + 1] && !rest[i + 1].startsWith('--') ? rest[i + 1] : d; };
  const url = rest.find((a) => /^https?:\/\//.test(a));
  if (!url) { console.error('usage: stardust-lite setup <url> [--dir <site-repo>] [--slug <page-slug>] [--template <name>] [--ref <git-ref> | --from <local checkout>]'); process.exit(1); }
  const dir = resolve(opt('--dir', '.'));
  const missing = ['fstab.yaml', 'scripts/aem.js', 'head.html'].filter((f) => !existsSync(join(dir, f)));
  if (missing.length) { console.error(`stardust-lite setup: ${dir} is not an EDS site repo (no ${missing.join(', ')}). stardust-lite runs inside one — create one first and run it there.`); process.exit(2); }
  const u = new URL(url); const base = u.hostname.replace(/^www\d?\./, '').split('.').slice(0, -1).join('-') || u.hostname;
  const segs = u.pathname.split('/').filter(Boolean).map((x) => x.replace(/\.[a-z]+$/i, ''));
  const template = opt('--template', segs.length ? segs[segs.length - 1].toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'home');
  const slug = opt('--slug', `${base}-${template}`); const ref = opt('--ref', 'main'); const from = opt('--from', null);
  const sh = (c, a) => { const r = spawnSync(c, a, { stdio: 'inherit', cwd: dir }); if (r.status) { console.error(`stardust-lite setup: ${c} ${a.join(' ')} failed (exit ${r.status})`); process.exit(r.status || 1); } };
  const fresh = !existsSync(join(dir, 'migration')) && /roboto/.test(existsSync(join(dir, 'styles', 'styles.css')) ? readFileSync(join(dir, 'styles', 'styles.css'), 'utf8') : '');
  // --from <path>: a local stardust-lite checkout (a branch not pushed yet, the plugin's own copy) instead of the GitHub ref
  sh('npm', ['i', '-D', '-q', '--no-audit', '--no-fund', '--legacy-peer-deps', from ? resolve(from) : `github:paolomoz/stardust-lite#${ref}`]);
  sh('npx', ['-y', 'playwright', 'install', 'chromium']);
  sh('npx', ['stardust-lite', 'init', '--foundation', ...(fresh ? ['--force'] : [])]);
  const lock = existsSync(join(dir, 'package-lock.json')) ? readFileSync(join(dir, 'package-lock.json'), 'utf8') : '';
  const sha = from ? 'local checkout' : (/stardust-lite\.git#([0-9a-f]{7,40})/.exec(lock) || [null, ref])[1]; const short = /^[0-9a-f]{40}$/.test(sha) ? sha.slice(0, 7) : sha;
  const fstab = readFileSync(join(dir, 'fstab.yaml'), 'utf8'); const m = /content\.da\.live\/([^/\s]+)\/([^/\s]+)/.exec(fstab);
  const branch = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: dir, encoding: 'utf8' }).stdout.trim();
  const host = m ? `https://${branch}--${m[2]}--${m[1]}.aem.page` : null;
  writeFileSync(join(dir, 'migration', 'run.json'), JSON.stringify({ url, slug, template, host, stardustLite: from ? `file:${resolve(from)}` : sha, createdAt: new Date().toISOString() }, null, 1));
  spawnSync('git', ['add', '-A'], { cwd: dir }); spawnSync('git', ['commit', '-q', '-m', `stardust-lite ${short}: setup for ${slug}`], { cwd: dir, stdio: 'inherit' });
  console.log(`\nstardust-lite setup: ${dir} (stardust-lite ${short}, foundation ${fresh ? 'over the boilerplate' : 'where missing'}, slug ${slug}, template ${template}, host ${host || '—'})
next, from ${dir}:
  npx stardust-lite live proto --site-repo . --open ${slug}        # the live view (background; it picks a free port)
  npx stardust-lite first ${url} --slug ${slug} --template ${template} --no-da   # drop --no-da to upload to DA (deploy runs only)`);
  process.exit(0);
}
const name = cmd === 'lint' ? 'davids-model-lint' : cmd;
const file = [dirs.scripts, dirs.replica, dirs.lint].map((d) => join(d, `${name}.mjs`)).find((f) => existsSync(f));
if (!file) { console.error(`stardust-lite: unknown instrument "${cmd}" — try: npx stardust-lite list`); process.exit(1); }
const r = spawnSync(process.execPath, [file, ...rest], { stdio: 'inherit' });
process.exit(r.status ?? 1);
