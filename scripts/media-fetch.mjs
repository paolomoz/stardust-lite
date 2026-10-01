#!/usr/bin/env node
// media-fetch.mjs — the source's media BYTES, unchanged (METHOD media row: webp stays webp, svg stays svg): collects every img `src`
// and background `url()` the content-dump JSON holds (the captured composition — hidden DOM is not content) plus extra URLs, downloads
// each once under a lower-case name with no double hyphen (DA previews a `kids--x.jpg` 404 — usta2-home), fixes the extension from the
// served Content-Type (`.jpg.thumb.585.1170.png` is a JPEG), names AEM `.transform/…/img.jpg` renditions after their asset, and writes
// <out>/manifest.json (url → file) for the document generator. Written per case twice (stryker-home, usta2-home); this is the instrument.
// Usage: node media-fetch.mjs <content.json…> --out media [--base https://www.site.com] [--extra <url,…>] [--extra-file <list>]
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from 'node:fs';
import { join, extname } from 'node:path';
import { arg } from './common.mjs';

const OPTS = ['--out', '--base', '--extra', '--extra-file'];
const files = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && !(i > 0 && OPTS.includes(all[i - 1])));
if (!files.length) { console.error('usage: media-fetch.mjs <content.json…> --out media [--base <origin>] [--extra <url,…>] [--extra-file <list>]'); process.exit(1); }
const out = arg('--out', 'media'); let base = arg('--base', null);
const urls = [];
const walk = (n) => { if (!n || typeof n !== 'object') return; if (Array.isArray(n)) return n.forEach(walk); if (n.src && !String(n.src).startsWith('data:')) urls.push(n.src); if (n.bgi) { const m = /url\("?([^")]+)"?\)/.exec(n.bgi); if (m && !m[1].startsWith('data:')) urls.push(m[1]); } walk(n.children); };
for (const f of files) { const d = JSON.parse(readFileSync(f, 'utf8')); Object.entries(d).forEach(([k, v]) => { if (!k.startsWith('__')) walk(v); }); }
if (arg('--extra', null)) urls.push(...String(arg('--extra')).split(',').map((s) => s.trim()).filter(Boolean));
if (arg('--extra-file', null)) urls.push(...readFileSync(arg('--extra-file'), 'utf8').split('\n').map((s) => s.trim()).filter(Boolean));
if (!base) { const abs = urls.find((u) => /^https?:/.test(u)); if (abs) base = new URL(abs).origin; }
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'image/svg+xml': '.svg', 'image/avif': '.avif', 'video/mp4': '.mp4' };
const nameOf = (u) => {
  const path = decodeURIComponent(new URL(u).pathname); const parts = path.split('/').filter(Boolean); let name = (parts[parts.length - 1] || 'media').toLowerCase();
  if (/^img\.(jpe?g|png|webp)$/.test(name)) { const asset = parts.find((p) => /\.(jpe?g|png|webp|gif|svg)/i.test(p)); if (asset) name = asset.toLowerCase().split('.transform')[0]; } // AEM transform rendition: the asset's name
  name = name.replace(/[^a-z0-9._-]+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
  return name;
};
mkdirSync(out, { recursive: true });
const manifest = existsSync(join(out, 'manifest.json')) ? JSON.parse(readFileSync(join(out, 'manifest.json'), 'utf8')) : {};
const taken = new Set(Object.values(manifest)); let n = 0; let failed = 0;
for (const u of [...new Set(urls)]) {
  let full; try { full = new URL(u, base || undefined).href.replace(/ /g, '%20'); } catch { console.error(`media-fetch: skip ${u} (relative and no --base)`); failed += 1; continue; }
  if (manifest[full] && existsSync(join(out, manifest[full]))) continue;
  let name = nameOf(full); const r = await fetch(full).catch(() => null);
  if (!r || !r.ok) { console.error(`media-fetch: ${r ? r.status : 'unreachable'} ${full}`); failed += 1; continue; }
  const buf = Buffer.from(await r.arrayBuffer()); const type = (r.headers.get('content-type') || '').split(';')[0].trim(); const ext = EXT[type];
  if (ext && extname(name) !== ext && !(ext === '.jpg' && extname(name) === '.jpeg')) name = `${name.replace(/\.[a-z0-9]+$/, '')}${ext}`; // the actual bytes name the extension
  const stem = name.replace(/\.[a-z0-9]+$/, ''); const e = extname(name); let k = 1; while (taken.has(name)) { name = `${stem}-${k}${e}`; k += 1; }
  writeFileSync(join(out, name), buf); taken.add(name); manifest[full] = name; n += 1;
  console.log(`${r.status} ${type.padEnd(14)} ${String(buf.length).padStart(8)}  ${full.slice(-80)} → ${name}`);
}
writeFileSync(join(out, 'manifest.json'), JSON.stringify(manifest, null, 1));
console.log(`media-fetch: ${n} fetched, ${Object.keys(manifest).length} in ${out}/manifest.json${failed ? `, ${failed} failed` : ''}`);
process.exit(failed ? 2 : 0);
