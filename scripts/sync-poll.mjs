#!/usr/bin/env node
// sync-poll.mjs — wait until the branch code bus serves the repo's files (step 7 / prerequisites). Compares the md5 of each served
// body (fetch decompresses; a `curl | grep` reads compressed bytes — ibm-home) with the repo file, polls until every file matches,
// prints the elapsed time. A push reached the bus in 10 s once and in > 200 s the next time (stryker-home): the default timeout is long.
// --trigger POSTs admin.hlx.page/code/<org>/<site>/<branch>/* first (new branches did not sync on push in 2026-09; needs DA_TOKEN).
// Usage: node sync-poll.mjs <branch-host> <repo-dir> <path…> [--every 10] [--timeout 900] [--trigger <org>/<site>/<branch>]
//   node sync-poll.mjs https://blocks-first--site--org.aem.page . blocks/hero/hero.css styles/styles.css scripts/scripts.js
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { arg } from './common.mjs';

const [host, repo, ...rest] = process.argv.slice(2); const paths = rest.filter((a, i, all) => !a.startsWith('--') && !(i > 0 && ['--every', '--timeout', '--trigger'].includes(all[i - 1])));
if (!host || !repo || !paths.length) { console.error('usage: sync-poll.mjs <branch-host> <repo-dir> <path…> [--every 10] [--timeout 900] [--trigger <org>/<site>/<branch>]'); process.exit(1); }
const every = Number(arg('--every', 10)) * 1000; const timeout = Number(arg('--timeout', 900)) * 1000; const base = String(host).replace(/\/$/, '');
const md5 = (b) => createHash('md5').update(b).digest('hex');
if (arg('--trigger', null)) {
  const token = process.env.DA_TOKEN; if (!token) { console.error('sync-poll: --trigger needs DA_TOKEN'); process.exit(1); }
  const r = await fetch(`https://admin.hlx.page/code/${arg('--trigger')}/*`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch((e) => ({ status: String(e.message) }));
  console.log(`sync-poll: code sync triggered → ${r.status}`);
}
const want = Object.fromEntries(paths.map((p) => [p, md5(readFileSync(join(repo, p)))]));
const t0 = Date.now(); let pending = paths;
for (;;) {
  const still = [];
  for (const p of pending) { const r = await fetch(`${base}/${p.replace(/^\//, '')}`, { cache: 'no-store' }).catch(() => null); const got = r && r.ok ? md5(Buffer.from(await r.arrayBuffer())) : null; if (got !== want[p]) still.push(`${p} (${r ? r.status : 'unreachable'}${got ? ` ${got.slice(0, 8)} ≠ ${want[p].slice(0, 8)}` : ''})`); }
  const s = Math.round((Date.now() - t0) / 1000);
  if (!still.length) { console.log(`sync-poll: ${paths.length} file${paths.length > 1 ? 's' : ''} match the repo after ${s} s`); process.exit(0); }
  if (Date.now() - t0 > timeout) { console.error(`sync-poll: timeout after ${s} s — still differing:\n  ${still.join('\n  ')}`); process.exit(2); }
  console.log(`sync-poll: ${s} s — ${still.length} of ${paths.length} not yet: ${still.map((x) => x.split(' ')[0]).join(', ')}`);
  pending = still.map((x) => x.split(' ')[0]);
  await new Promise((r) => setTimeout(r, every));
}
