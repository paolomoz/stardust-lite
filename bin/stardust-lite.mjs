#!/usr/bin/env node
// stardust-lite — run the method's instruments from any project (the site repo being migrated).
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
  console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 8).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
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
    if (existsSync(sj)) { let js = readFileSync(sj, 'utf8'); if (!js.includes('./stardust.js')) { js = js.replace(/(} from '\.\/aem\.js';\n)/, "$1import { decorateIconTokens, decorateArtDirection } from './stardust.js';\n").replace(/(export function decorateMain\(main\) \{\n)/, '$1  decorateIconTokens(main);\n  decorateArtDirection(main);\n'); writeFileSync(sj, js); wrote.push('scripts/scripts.js (stardust.js wired)'); } }
    console.log(`stardust-lite foundation: wrote ${wrote.length ? wrote.join(', ') : 'nothing'}${skipped.length ? `; skipped (exists) ${skipped.join(', ')}` : ''}`);
    if (skipped.includes('styles/styles.css')) console.log(`stardust-lite foundation: styles/styles.css exists — \`init --foundation --force\` overwrites it with the skeleton (the boilerplate's rules are not measurements, METHOD step 4)`);
  }
  process.exit(0);
}
const name = cmd === 'lint' ? 'davids-model-lint' : cmd;
const file = [dirs.scripts, dirs.replica, dirs.lint].map((d) => join(d, `${name}.mjs`)).find((f) => existsSync(f));
if (!file) { console.error(`stardust-lite: unknown instrument "${cmd}" — try: npx stardust-lite list`); process.exit(1); }
const r = spawnSync(process.execPath, [file, ...rest], { stdio: 'inherit' });
process.exit(r.status ?? 1);
