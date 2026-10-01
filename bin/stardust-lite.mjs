#!/usr/bin/env node
// stardust-lite — run the method's instruments from any project (the site repo being migrated).
//   npx stardust-lite init                 scaffold the skill stub, AGENTS.md section and migration/ case dir in the current repo
//   npx stardust-lite init --foundation    also copy templates/foundation/ (scripts/stardust.js, styles/reset.css, styles.css, fonts.css) — never overwrites
//   npx stardust-lite <instrument> [args]  run scripts/<instrument>.mjs or tools/replica/<instrument>.mjs (lint → tools/lint)
//   npx stardust-lite method               print the path of METHOD.md (the template run reads it first)
//   npx stardust-lite rollout              print the path of ROLLOUT.md (a page after the template reads this instead)
//   npx stardust-lite list                 list instruments
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
if (cmd === 'rollout') { console.log(join(ROOT, 'ROLLOUT.md')); process.exit(0); }
if (cmd === 'list') { console.log(list().join('\n')); process.exit(0); }
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
  if (rest.includes('--foundation')) {
    // the foundation is site code the operator owns after copying: an existing file is never overwritten
    const src = join(ROOT, 'templates', 'foundation'); const wrote = []; const skipped = [];
    const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
    for (const f of walk(src)) {
      const relPath = relative(src, f); const dest = join(cwd, relPath === 'README.md' ? join('migration', 'foundation-README.md') : relPath);
      if (existsSync(dest)) { skipped.push(relative(cwd, dest)); continue; }
      mkdirSync(dirname(dest), { recursive: true }); copyFileSync(f, dest); wrote.push(relative(cwd, dest));
    }
    console.log(`stardust-lite foundation: wrote ${wrote.length ? wrote.join(', ') : 'nothing'}${skipped.length ? `; skipped (exists) ${skipped.join(', ')}` : ''}`);
    if (skipped.includes('styles/styles.css')) console.log(`stardust-lite foundation: styles/styles.css exists — the skeleton is at ${rel}/templates/foundation/styles/styles.css to compare by hand`);
  }
  process.exit(0);
}
const name = cmd === 'lint' ? 'davids-model-lint' : cmd;
const file = [dirs.scripts, dirs.replica, dirs.lint].map((d) => join(d, `${name}.mjs`)).find((f) => existsSync(f));
if (!file) { console.error(`stardust-lite: unknown instrument "${cmd}" — try: npx stardust-lite list`); process.exit(1); }
const r = spawnSync(process.execPath, [file, ...rest], { stdio: 'inherit' });
process.exit(r.status ?? 1);
