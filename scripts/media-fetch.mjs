#!/usr/bin/env node
// media-fetch.mjs — the source's media BYTES, unchanged (METHOD media row: webp stays webp, svg stays svg): collects every img `src`
// and background `url()` the content-dump JSON holds (the captured composition — hidden DOM is not content) plus extra URLs, downloads
// each once under a lower-case name of a-z0-9 and single hyphens (DA previews `kids--x.jpg`, `musee_hp.jpg`, `a.b.jpg` 404 — usta2-home,
// audemarspiguet-home), fixes the extension from the
// served Content-Type (`.jpg.thumb.585.1170.png` is a JPEG), names AEM `.transform/…/img.jpg` renditions after their asset, and writes
// <out>/manifest.json (url → file) for the document generator. Written per case twice (stryker-home, usta2-home); this is the instrument.
// Usage: node media-fetch.mjs <content.json…> --out media [--base https://www.site.com] [--extra <url,…>] [--extra-file <list>]
//        node media-fetch.mjs <media-<W>.json> --fonts fonts   the font FILES: media-list's requested font URLs downloaded, and the @font-face
//                                                             faces embedded as data: URIs written as files (`<family>-<weight>-<style>.woff2`;
//                                                             a case font-dump.mjs did this — covermore, loop r6); then fonts.css declares them
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from 'node:fs';
import { join, extname } from 'node:path';
import { arg } from './common.mjs';

const OPTS = ['--out', '--base', '--extra', '--extra-file', '--fonts'];
if (typeof arg('--fonts', null) === 'string') {
  const dir = arg('--fonts'); mkdirSync(dir, { recursive: true }); let n = 0;
  const safe = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  for (const f of process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && !(i > 0 && OPTS.includes(all[i - 1])))) {
    const m = JSON.parse(readFileSync(f, 'utf8'));
    for (const d of m.dataFaces || []) { const mm = /^data:([^;,]+)(;base64)?,(.*)$/s.exec(d.data); if (!mm) continue; const ext = /woff2/.test(mm[1]) ? '.woff2' : /woff/.test(mm[1]) ? '.woff' : /ttf|truetype/.test(mm[1]) ? '.ttf' : /otf|opentype/.test(mm[1]) ? '.otf' : '.bin'; const name = `${safe(d.family)}-${safe(d.weight)}-${safe(d.style)}${ext}`; writeFileSync(join(dir, name), mm[2] ? Buffer.from(mm[3], 'base64') : Buffer.from(decodeURIComponent(mm[3]), 'latin1')); console.log(`data: ${d.family} ${d.weight} ${d.style} → ${name}`); n += 1; }
    for (const u of m.fontRequests || []) { const r = await fetch(u).catch(() => null); if (!r || !r.ok) { console.error(`media-fetch: ${r ? r.status : 'unreachable'} ${u}`); continue; } const name = safe(new URL(u).pathname.split('/').pop().replace(/\.[a-z0-9]+$/, '')) + (extname(new URL(u).pathname) || '.woff2'); writeFileSync(join(dir, name), Buffer.from(await r.arrayBuffer())); console.log(`${r.status} ${u.slice(-70)} → ${name}`); n += 1; }
  }
  console.log(`media-fetch: ${n} font file(s) in ${dir}/ — declare them in styles/fonts.css with the families the spec names`); process.exit(0);
}
const files = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && !(i > 0 && OPTS.includes(all[i - 1])));
if (!files.length) { console.error('usage: media-fetch.mjs <content.json…> --out media [--base <origin>] [--extra <url,…>] [--extra-file <list>]'); process.exit(1); }
const out = arg('--out', 'media'); let base = arg('--base', null);
const urls = [];
// an iframe's src is a document, not media (a Pardot form fetched as a 39 KB text/html "image" — sdt-dentsu beyond-the-funnel); a cut
// background-image URL (`bgi` is 160 chars) is read from `bgiUrl` when the collector kept it, else skipped with a note
const cut = [];
const walk = (n) => { if (!n || typeof n !== 'object') return; if (Array.isArray(n)) return n.forEach(walk); if (n.src && !String(n.src).startsWith('data:') && !/^(iframe|embed|object)$/.test(String(n.tag || ''))) urls.push(n.src); if (n.bgiUrl) urls.push(n.bgiUrl); else if (n.bgi) { const m = /url\(("|')?([^"')]+)\1\)/.exec(n.bgi); if (m && !m[2].startsWith('data:')) urls.push(m[2]); else if (/url\(/.test(n.bgi) && !/\)/.test(n.bgi.slice(n.bgi.indexOf('url(')))) cut.push(n.bgi.slice(0, 100)); } walk(n.children); };
for (const f of files) { const d = JSON.parse(readFileSync(f, 'utf8')); Object.entries(d).forEach(([k, v]) => { if (!k.startsWith('__')) walk(v); }); }
if (cut.length) console.error(`media-fetch: ${cut.length} background-image URL(s) cut in the dump (older collector, 160 chars) — re-dump with the current collector or pass them with --extra:\n  ${cut.join('\n  ')}`);
if (arg('--extra', null)) urls.push(...String(arg('--extra')).split(',').map((s) => s.trim()).filter(Boolean));
if (arg('--extra-file', null)) urls.push(...readFileSync(arg('--extra-file'), 'utf8').split('\n').map((s) => s.trim()).filter(Boolean));
if (!base) { const abs = urls.find((u) => /^https?:/.test(u)); if (abs) base = new URL(abs).origin; }
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'image/svg+xml': '.svg', 'image/avif': '.avif', 'video/mp4': '.mp4' };
const nameOf = (u) => {
  const path = decodeURIComponent(new URL(u).pathname); const parts = path.split('/').filter(Boolean); let name = (parts[parts.length - 1] || 'media').toLowerCase();
  if (/^img\.(jpe?g|png|webp)$/.test(name)) { const asset = parts.find((p) => /\.(jpe?g|png|webp|gif|svg)/i.test(p)); if (asset) name = asset.toLowerCase().split('.transform')[0]; } // AEM transform rendition: the asset's name
  // an AEM DAM rendition (`<asset>.png/_jcr_content/renditions/cq5dam.web.1280.1280.png`): the asset's name with the rendition's width —
  // `cq5dam-web-1280-1280.png` named four assets alike and collided by suffix (scotiabank-personal)
  const jcr = parts.findIndex((p) => /^_?jcr[:_]content$/.test(p));
  if (jcr > 0 && parts[jcr + 1] === 'renditions') { const asset = parts[jcr - 1].toLowerCase(); const size = (name.match(/\.(\d{2,4})\.\d{2,4}\./) || [])[1]; name = `${asset.replace(/\.[a-z0-9]+$/, '')}${size ? `-${size}` : ''}${extname(name) || extname(asset)}`; }
  // the branch host previews `musee_hp-2.jpg` and `a.b.jpg` 404 after a 201 upload (audemarspiguet-home), `kids--x.jpg` too (usta2-home):
  // the stem keeps a-z0-9 and single hyphens only, the extension stays
  const m = /^(.*?)(\.[a-z0-9]+)?$/.exec(name); const stem = (m[1] || 'media').replace(/[^a-z0-9]+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
  return `${stem || 'media'}${m[2] || ''}`;
};
mkdirSync(out, { recursive: true });
const manifest = existsSync(join(out, 'manifest.json')) ? JSON.parse(readFileSync(join(out, 'manifest.json'), 'utf8')) : {};
const taken = new Set(Object.values(manifest)); let n = 0; let failed = 0;
for (const u of [...new Set(urls)]) {
  let full; try { full = new URL(u, base || undefined).href.replace(/ /g, '%20'); } catch { console.error(`media-fetch: skip ${u} (relative and no --base)`); failed += 1; continue; }
  if (manifest[full] && existsSync(join(out, manifest[full]))) continue;
  let name = nameOf(full); const r = await fetch(full).catch(() => null);
  if (!r || !r.ok) { console.error(`media-fetch: ${r ? r.status : 'unreachable'} ${full}`); failed += 1; continue; }
  const type = (r.headers.get('content-type') || '').split(';')[0].trim(); const ext = EXT[type];
  if (/^text\/|^application\/(json|javascript|xml|xhtml\+xml)$/.test(type)) { console.error(`media-fetch: skip ${full.slice(-80)} — ${type} is a document, not media`); continue; }
  const buf = Buffer.from(await r.arrayBuffer());
  if (ext && extname(name) !== ext && !(ext === '.jpg' && extname(name) === '.jpeg')) name = `${name.replace(/\.[a-z0-9]+$/, '')}${ext}`; // the actual bytes name the extension
  const stem = name.replace(/\.[a-z0-9]+$/, ''); const e = extname(name); let k = 1; while (taken.has(name)) { name = `${stem}-${k}${e}`; k += 1; }
  writeFileSync(join(out, name), buf); taken.add(name); manifest[full] = name; n += 1;
  console.log(`${r.status} ${type.padEnd(14)} ${String(buf.length).padStart(8)}  ${full.slice(-80)} → ${name}`);
}
writeFileSync(join(out, 'manifest.json'), JSON.stringify(manifest, null, 1));
console.log(`media-fetch: ${n} fetched, ${Object.keys(manifest).length} in ${out}/manifest.json${failed ? `, ${failed} failed` : ''}`);
process.exit(failed ? 2 : 0);
