#!/usr/bin/env node
// da-put.mjs — upload files to DA (source PUT, bytes unchanged) and preview them on a branch; never publishes. Documents (.html) go to
// <to>/<name>.html and are previewed at <to>/<name>; media keep their extension. Needs DA_TOKEN (IMS bearer; never printed).
// METHOD named the two calls in three cases and nothing scripted them (stryker-home wrote two shell scripts with the site hard-coded).
// Usage: node da-put.mjs <org>/<site>/<branch> <file…> --to <da-folder> [--as <name>] [--no-preview]
//   node da-put.mjs org/site/blocks-first doc/home.html doc/nav.html --to drafts
//   node da-put.mjs org/site/blocks-first media/*.jpg media/*.webp --to drafts/media
import { readFileSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { arg } from './common.mjs';

const target = process.argv[2]; const files = process.argv.slice(3).filter((a, i, all) => !a.startsWith('--') && !(i > 0 && ['--to', '--as'].includes(all[i - 1])));
const [org, site, branch] = String(target || '').split('/'); const to = String(arg('--to', '')).replace(/^\/|\/$/g, '');
if (!org || !site || !branch || !files.length || !to) { console.error('usage: da-put.mjs <org>/<site>/<branch> <file…> --to <da-folder> [--as <name>] [--no-preview]'); process.exit(1); }
const token = process.env.DA_TOKEN; if (!token) { console.error('da-put: DA_TOKEN is not set (source ~/.claude/.env)'); process.exit(1); }
const MIME = { '.html': 'text/html', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.pdf': 'application/pdf', '.json': 'application/json' };
let failed = 0;
for (const f of files) {
  const name = files.length === 1 && arg('--as', null) ? arg('--as') : basename(f); const ext = extname(name).toLowerCase();
  if (name !== name.toLowerCase()) console.error(`da-put: ${name} has upper-case letters — the DA store is case-insensitive and the pipeline path is lower-case (BACKLOG #4)`);
  const srcPath = `${to}/${name}`; const previewPath = ext === '.html' ? srcPath.slice(0, -5) : srcPath;
  const fd = new FormData(); fd.append('data', new Blob([readFileSync(f)], { type: MIME[ext] || 'application/octet-stream' }), name);
  const up = await fetch(`https://admin.da.live/source/${org}/${site}/${srcPath}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: fd }).catch((e) => ({ status: String(e.message) }));
  let pv = { status: '-' }; let url = '';
  if (!arg('--no-preview', false) && up.ok) { pv = await fetch(`https://admin.hlx.page/preview/${org}/${site}/${branch}/${previewPath}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch((e) => ({ status: String(e.message) })); try { url = (await pv.json()).preview?.url || ''; } catch { /* no body */ } }
  if (!up.ok || (pv.status !== '-' && !pv.ok)) failed += 1;
  console.log(`${f} → ${srcPath}  upload ${up.status}  preview ${pv.status}${url ? `  ${url}` : ''}`);
  if (up.status === 401 || pv.status === 401) { console.error('da-put: 401 — refresh DA_TOKEN (python3 ~/.claude/scripts/refresh_da_token.py) and re-source .env'); process.exit(3); }
}
process.exit(failed ? 2 : 0);
