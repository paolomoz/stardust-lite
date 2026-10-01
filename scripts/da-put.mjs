#!/usr/bin/env node
// da-put.mjs — upload files to DA (source PUT, bytes unchanged) and preview them on a branch; never publishes. Documents (.html) go to
// <to>/<name>.html and are previewed at <to>/<name>; media keep their extension. Needs DA_TOKEN (IMS bearer; never printed).
// Name rules it warns about: upper-case letters (BACKLOG #4), a double hyphen (`kids--x.jpg` uploaded 200 and previewed 404), an underscore
// or a second dot in the name (`musee_hp-2.jpg` uploaded 201 and previewed 404 — the same bytes as `musee-hp-2.jpg` previewed 200).
// METHOD named the two calls in three cases and nothing scripted them (stryker-home wrote two shell scripts with the site hard-coded).
// Usage: node da-put.mjs <org>/<site>/<branch> <file…> --to <da-folder> [--as <name>] [--no-preview] [--dry]
//   node da-put.mjs org/site/blocks-first doc/home.html doc/nav.html --to drafts
//   node da-put.mjs org/site/blocks-first media/*.jpg media/*.webp --to drafts/media
//   node da-put.mjs [<org>/<site>/<branch>] --pages pages.json [--doc-dir doc] [--dry]   (batch-7 rollout, pass 5)
//   --pages: for every page of a `roster pick` list upload `<doc-dir>/<slug>.html` as `<docPath>.html` (the DA folder and name come from
//   the page's docPath, not from --to / basename) and preview `<docPath>`; the target defaults to the profile's `da` coordinates.
//   --dry prints what would be uploaded and previewed (no token needed, nothing sent) — with or without --pages.
import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import { arg, siteProfile } from './common.mjs';

const VALUED = ['--to', '--as', '--pages', '--doc-dir', '--site'];
const positional = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && !(i > 0 && VALUED.includes(all[i - 1])));
const pagesFile = arg('--pages', null); const dry = arg('--dry', false);
// the target: the first positional when it looks like org/site/branch, else the profile's DA coordinates (`da` in migration/site.json)
const da = siteProfile()?.da || null; const explicit = positional[0] && positional[0].split('/').length === 3 && !existsSync(positional[0]) ? positional.shift() : null;
const target = explicit || (da && da.org && da.site && da.branch ? `${da.org}/${da.site}/${da.branch}` : null);
const [org, site, branch] = String(target || '').split('/'); const to = String(arg('--to', '')).replace(/^\/|\/$/g, '');
// the upload list: [file, da folder, name] — explicit files under --to, or the pages' documents at their docPath
let items = [];
if (typeof pagesFile === 'string') {
  const docDir = String(arg('--doc-dir', 'doc'));
  for (const p of JSON.parse(readFileSync(pagesFile, 'utf8')).pages || []) { const f = join(docDir, `${p.slug}.html`); const path = String(p.docPath || `/drafts/${p.slug}`).replace(/^\/|\/$/g, ''); items.push({ file: f, to: dirname(path) === '.' ? '' : dirname(path), name: `${basename(path)}.html`, slug: p.slug }); }
} else items = positional.map((f) => ({ file: f, to, name: positional.length === 1 && arg('--as', null) ? arg('--as') : basename(f) }));
if (!org || !site || !branch || !items.length || (typeof pagesFile !== 'string' && !to)) { console.error('usage: da-put.mjs <org>/<site>/<branch> <file…> --to <da-folder> [--as <name>] [--no-preview] [--dry]\n       da-put.mjs [<org>/<site>/<branch>] --pages <pages.json> [--doc-dir doc] [--dry]   (target from the profile\'s da when omitted)'); process.exit(1); }
const token = process.env.DA_TOKEN; if (!token && !dry) { console.error('da-put: DA_TOKEN is not set (source ~/.claude/.env)'); process.exit(1); }
const MIME = { '.html': 'text/html', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.pdf': 'application/pdf', '.json': 'application/json' };
let failed = 0;
for (const it of items) {
  const f = it.file; const { name } = it; const ext = extname(name).toLowerCase();
  if (!existsSync(f)) { failed += 1; console.log(`${f} → (missing)  ${it.slug ? `page ${it.slug}: ` : ''}no such file`); continue; }
  if (name !== name.toLowerCase()) console.error(`da-put: ${name} has upper-case letters — the DA store is case-insensitive and the pipeline path is lower-case (BACKLOG #4)`);
  if (name.includes('--')) console.error(`da-put: ${name} has a double hyphen — the upload answers 200 and the branch host previews 404 (usta2-home); rename it`);
  if (/[_]|\..*\./.test(name)) console.error(`da-put: ${name} has an underscore or a dot in its stem — uploaded 201, previewed 404 on the branch host (audemarspiguet-home); use a-z0-9 and single hyphens`);
  const srcPath = `${it.to ? `${it.to}/` : ''}${name}`; const previewPath = ext === '.html' ? srcPath.slice(0, -5) : srcPath;
  if (dry) { console.log(`${f} → ${srcPath}  would PUT https://admin.da.live/source/${org}/${site}/${srcPath}${arg('--no-preview', false) ? '' : `  then POST https://admin.hlx.page/preview/${org}/${site}/${branch}/${previewPath}`}`); continue; }
  const fd = new FormData(); fd.append('data', new Blob([readFileSync(f)], { type: MIME[ext] || 'application/octet-stream' }), name);
  const up = await fetch(`https://admin.da.live/source/${org}/${site}/${srcPath}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: fd }).catch((e) => ({ status: String(e.message) }));
  let pv = { status: '-' }; let url = '';
  if (!arg('--no-preview', false) && up.ok) { pv = await fetch(`https://admin.hlx.page/preview/${org}/${site}/${branch}/${previewPath}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch((e) => ({ status: String(e.message) })); try { url = (await pv.json()).preview?.url || ''; } catch { /* no body */ } }
  if (!up.ok || (pv.status !== '-' && !pv.ok)) failed += 1;
  console.log(`${f} → ${srcPath}  upload ${up.status}  preview ${pv.status}${url ? `  ${url}` : ''}`);
  if (up.status === 401 || pv.status === 401) { console.error('da-put: 401 — refresh DA_TOKEN (python3 ~/.claude/scripts/refresh_da_token.py) and re-source .env'); process.exit(3); }
}
if (dry) console.log(`da-put: dry run — ${items.length} item(s) listed, nothing uploaded${failed ? `, ${failed} missing` : ''}`);
process.exit(failed ? 2 : 0);
