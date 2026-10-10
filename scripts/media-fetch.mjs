#!/usr/bin/env node
// media-fetch.mjs — the source's media BYTES, unchanged (METHOD media row: webp stays webp, svg stays svg): collects every img `src`
// and background `url()` the content-dump JSON holds (the captured composition — hidden DOM is not content) plus extra URLs, downloads
// each once under a lower-case name of a-z0-9 and single hyphens (DA previews `kids--x.jpg`, `musee_hp.jpg`, `a.b.jpg` 404 — usta2-home,
// audemarspiguet-home), fixes the extension from the
// served Content-Type (`.jpg.thumb.585.1170.png` is a JPEG), names AEM `.transform/…/img.jpg` renditions after their asset, and writes
// <out>/manifest.json (url → file) for the document generator. Written per case twice (stryker-home, usta2-home); this is the instrument.
// Usage: node media-fetch.mjs <content.json…> --out media [--base https://www.site.com] [--extra <url,…>] [--extra-file <list>]
//        … --browser   fetch every URL by navigating a browser page to it (common.launch: --chrome tier, cookies) and reading the response body —
//                      the only path a WAF lets through when curl, node fetch and an in-page fetch() all 403 (manulife, loop r7); slower, use on a 403
//        … --from-page <url>   the third tier: open the PAGE (chrome tier, cookies, overlays), scroll it, and keep the bytes of every response
//                              whose URL is one the dump names (media and fonts) — a WAF that refuses a navigation to the asset itself still serves
//                              it to the page (canon, loop r10: `--browser` 0 files, a case asset-capture.mjs 23)
//        node media-fetch.mjs <media-<W>.json> --fonts fonts   the font FILES: media-list's requested font URLs downloaded, and the @font-face
//                                                             faces embedded as data: URIs written as files (`<family>-<weight>-<style>.woff2`;
//                                                             a case font-dump.mjs did this — covermore, loop r6); then fonts.css declares them
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from 'node:fs';
import { join, extname, dirname, relative, resolve } from 'node:path';
import { arg, launch, contextOptions } from './common.mjs';
let browserPage = null; // --browser: one context, one page, every URL a navigation
const fromPage = new Map(); // --from-page: url → { status, type, buf } captured from the page's own responses
async function captureFromPage(pageUrl, wanted) {
  const { openPage, settle, overlayOpts } = await import('./common.mjs'); const b = await launch(); const ctx = await b.newContext(contextOptions({ width: 1440, height: 900, locale: overlayOpts().locale }));
  const want = new Set(wanted.map((u) => u.split('#')[0])); const bare = (u) => u.split('#')[0].split('?')[0];
  const wantBare = new Set([...want].map(bare));
  const pending = [];
  const page = await openPage(ctx, pageUrl, { width: 1440, height: 900, ...overlayOpts(), before: (p) => p.on('response', (r) => { const u = r.url(); if (!(want.has(u) || wantBare.has(bare(u)))) return; pending.push(r.body().then((buf) => { if (r.ok() && buf?.length) fromPage.set(want.has(u) ? u : [...want].find((w) => bare(w) === bare(u)) || u, { ok: true, status: r.status(), type: (r.headers()['content-type'] || '').split(';')[0].trim(), buf }); }).catch(() => {})); }) });
  await settle(page); await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } window.scrollTo(0, 0); }); await page.waitForTimeout(1500);
  await Promise.all(pending); await b.close();
  console.log(`media-fetch: ${fromPage.size} of ${want.size} URL(s) captured from the page's own responses`);
}
const getBytes = async (url) => {
  if (fromPage.has(url)) return fromPage.get(url);
  if (!process.argv.includes('--browser')) { const r = await fetch(url).catch(() => null); if (!r) return null; return { ok: r.ok, status: r.status, type: (r.headers.get('content-type') || '').split(';')[0].trim(), buf: r.ok ? Buffer.from(await r.arrayBuffer()) : null }; }
  if (!browserPage) { const b = await launch(); const ctx = await b.newContext(contextOptions({ width: 1280, height: 800 })); browserPage = await ctx.newPage(); process.on('exit', () => b.close().catch(() => {})); }
  const r = await browserPage.goto(url, { waitUntil: 'commit', timeout: 60000 }).catch(() => null); if (!r) return null;
  return { ok: r.ok(), status: r.status(), type: (r.headers()['content-type'] || '').split(';')[0].trim(), buf: r.ok() ? await r.body().catch(() => null) : null };
};

// a font file is a font: a WAF answers a font URL with its challenge page and a 200 (acs-about: four `.woff2` files were Imperva's 212-byte
// HTML, the first round rendered in the fallback face) — the bytes are checked, never the status
const isFont = (b) => !!b && b.length > 64 && ['wOF2', 'wOFF', 'OTTO', 'true', 'ttcf'].includes(b.subarray(0, 4).toString('latin1')) || (!!b && b.length > 64 && b.readUInt32BE(0) === 0x00010000);
const OPTS = ['--out', '--base', '--extra', '--extra-file', '--fonts', '--from-page', '--css']; // --browser is a bare flag
if (typeof arg('--fonts', null) === 'string') {
  const dir = arg('--fonts'); mkdirSync(dir, { recursive: true }); let n = 0; const cssFaces = []; const fetchedUrls = new Set(); const notFont = [];
  // --from-page: the font files from the page's own responses, as for the media (a WAF that refuses curl serves them to the page)
  if (typeof arg('--from-page', null) === 'string') {
    const want = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && !(i > 0 && OPTS.includes(all[i - 1]))).flatMap((f) => { const m = JSON.parse(readFileSync(f, 'utf8')); return [...(m.fontRequests || []), ...(m.fontFaceRules || []).flatMap((r) => r.srcs.map((x) => x.url))]; }).filter((u) => !u.startsWith('data:'));
    await captureFromPage(arg('--from-page'), [...new Set(want)]); if (!fromPage.size) { console.log('media-fetch: 0 captured — once more (a challenge page answers the first load)'); await captureFromPage(arg('--from-page'), [...new Set(want)]); }
  }
  const safe = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  for (const f of process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && !(i > 0 && OPTS.includes(all[i - 1])))) {
    const m = JSON.parse(readFileSync(f, 'utf8'));
    for (const d of m.dataFaces || []) { const mm = /^data:([^;,]+)(;base64)?,(.*)$/s.exec(d.data); if (!mm) continue; const ext = /woff2/.test(mm[1]) ? '.woff2' : /woff/.test(mm[1]) ? '.woff' : /ttf|truetype/.test(mm[1]) ? '.ttf' : /otf|opentype/.test(mm[1]) ? '.otf' : '.bin'; const name = `${safe(d.family)}-${safe(d.weight)}-${safe(d.style)}${ext}`; writeFileSync(join(dir, name), mm[2] ? Buffer.from(mm[3], 'base64') : Buffer.from(decodeURIComponent(mm[3]), 'latin1')); console.log(`data: ${d.family} ${d.weight} ${d.style} → ${name}`); n += 1; }
    // the faces the page LOADED, each matched to its @font-face rule (media.fontFaceRules) → one file per face named by it, and the
    // fonts.css lines (--css): a URL's last segment named si-home's four Typekit faces `l.woff2`, and every run wrote fonts.css by hand
    const rules = m.fontFaceRules || []; const done = new Set();
    for (const lf of [...new Set(m.loaded || [])]) {
      const t = lf.split(' '); const style = t.pop(); const weight = t.pop(); const family = t.join(' ').replace(/^["']|["']$/g, '');
      const inW = (w) => { const r = String(w).split(/\s+/).map(Number); return r.length > 1 ? Number(weight) >= r[0] && Number(weight) <= r[1] : String(r[0]) === String(Number(weight)); };
      const rule = rules.find((r) => r.family.toLowerCase() === family.toLowerCase() && r.style === style && inW(r.weight) && r.srcs.some((x) => !x.url.startsWith('data:')));
      if (!rule) continue;
      const src = ['woff2', 'woff', 'truetype', 'opentype', null].map((f) => rule.srcs.find((x) => !x.url.startsWith('data:') && (x.format === f || (f === 'woff2' && /\.woff2(\?|$)/.test(x.url))))).find(Boolean) || rule.srcs[0];
      const ext = src.format === 'woff2' || /\.woff2/.test(src.url) ? '.woff2' : src.format === 'woff' || /\.woff(\?|$)/.test(src.url) ? '.woff' : /\.otf/.test(src.url) || src.format === 'opentype' ? '.otf' : /\.ttf/.test(src.url) || src.format === 'truetype' ? '.ttf' : '.woff2';
      const name = `${safe(family)}-${safe(weight)}-${safe(style)}${ext}`; if (done.has(name)) continue;
      const r = await getBytes(src.url); if (!r || !r.ok || !r.buf) { console.error(`media-fetch: ${r ? r.status : 'unreachable'} ${src.url} (${lf})`); continue; }
      if (!isFont(r.buf)) { notFont.push(`${lf} (${r.buf.length} bytes${/^\s*</.test(r.buf.subarray(0, 64).toString('latin1')) ? ', HTML' : ''})`); continue; }
      writeFileSync(join(dir, name), r.buf); done.add(name); n += 1; fetchedUrls.add(src.url);
      cssFaces.push({ family, weight, style, file: name, format: ext === '.woff2' ? 'woff2' : ext === '.woff' ? 'woff' : ext === '.otf' ? 'opentype' : 'truetype' });
    }
    for (const u of (m.fontRequests || []).filter((x) => !fetchedUrls.has(x))) { const r = await getBytes(u); if (r?.ok && r.buf && !isFont(r.buf)) { notFont.push(`${u.slice(0, 80)} (${r.buf.length} bytes)`); continue; } if (!r || !r.ok || !r.buf) { console.error(`media-fetch: ${r ? r.status : 'unreachable'} ${u}${!process.argv.includes('--browser') ? ' (a 403: --browser)' : ''}`); continue; } const name = safe(new URL(u).pathname.split('/').pop().replace(/\.[a-z0-9]+$/, '')) + (extname(new URL(u).pathname) || '.woff2'); writeFileSync(join(dir, name), r.buf); console.log(`${r.status} ${u.slice(-70)} → ${name}`); n += 1; }
  }
  if (notFont.length && typeof arg('--from-page', null) !== 'string') { // the page URL is in the measure dir's summary: go through the page once, no agent turn
    const jsons = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && !(i > 0 && OPTS.includes(all[i - 1])));
    let pageUrl = null; for (const f of jsons) { try { pageUrl = JSON.parse(readFileSync(join(dirname(resolve(f)), 'summary.json'), 'utf8')).url; } catch { /* no summary */ } if (pageUrl) break; }
    if (pageUrl) { console.error(`media-fetch: ${notFont.length} font response(s) were not fonts (a WAF) — again through the page's own responses (--from-page ${pageUrl})`); const { spawnSync } = await import('node:child_process'); const r = spawnSync(process.execPath, [process.argv[1], ...process.argv.slice(2), '--from-page', pageUrl], { stdio: 'inherit' }); process.exit(r.status ?? 1); }
  }
  if (notFont.length) console.error(`media-fetch: ${notFont.length} font response(s) are NOT fonts — not written (a WAF's answer: --from-page <page url>, or --browser):\n  ${notFont.join('\n  ')}`);
  const cssOut = typeof arg('--css', null) === 'string' ? arg('--css') : null;
  if (cssOut && cssFaces.length) { const rel = relative(dirname(resolve(cssOut)), resolve(dir)).split('\\').join('/'); mkdirSync(dirname(resolve(cssOut)), { recursive: true }); writeFileSync(cssOut, `/* fonts.css — the faces the source loaded, from media-*.json fontFaceRules (media-fetch --fonts --css) */\n${cssFaces.map((f) => `@font-face { font-family: '${f.family}'; font-style: ${f.style}; font-weight: ${f.weight}; font-display: swap; src: url('${rel ? `${rel}/` : ''}${f.file}') format('${f.format}'); }`).join('\n')}\n`); console.log(`media-fetch: ${cssFaces.length} face(s) declared in ${cssOut}`); }
  console.log(`media-fetch: ${n} font file(s) in ${dir}/${cssFaces.length ? '' : ' — declare them in styles/fonts.css with the families the spec names (no fontFaceRules in the media JSON: re-measure, then --css styles/fonts.css writes it)'}`); process.exit(0);
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
if (typeof arg('--from-page', null) === 'string') await captureFromPage(arg('--from-page'), [...new Set(urls)].map((u) => { try { return new URL(u, base || undefined).href.replace(/ /g, '%20'); } catch { return null; } }).filter(Boolean));
const manifest = existsSync(join(out, 'manifest.json')) ? JSON.parse(readFileSync(join(out, 'manifest.json'), 'utf8')) : {};
const taken = new Set(Object.values(manifest)); let n = 0; let failed = 0;
for (const u of [...new Set(urls)]) {
  let full; try { full = new URL(u, base || undefined).href.replace(/ /g, '%20'); } catch { console.error(`media-fetch: skip ${u} (relative and no --base)`); failed += 1; continue; }
  if (manifest[full] && existsSync(join(out, manifest[full]))) continue;
  let name = nameOf(full); const r = await getBytes(full);
  if (!r || !r.ok || !r.buf) { console.error(`media-fetch: ${r ? r.status : 'unreachable'} ${full}${!process.argv.includes('--browser') && r?.status === 403 ? ' — a WAF: run again with --browser' : ''}`); failed += 1; continue; }
  const type = r.type; const ext = EXT[type];
  if (/^text\/|^application\/(json|javascript|xml|xhtml\+xml)$/.test(type)) { console.error(`media-fetch: skip ${full.slice(-80)} — ${type} is a document, not media`); continue; }
  const buf = r.buf;
  if (ext && extname(name) !== ext && !(ext === '.jpg' && extname(name) === '.jpeg')) name = `${name.replace(/\.[a-z0-9]+$/, '')}${ext}`; // the actual bytes name the extension
  const stem = name.replace(/\.[a-z0-9]+$/, ''); const e = extname(name); let k = 1; while (taken.has(name)) { name = `${stem}-${k}${e}`; k += 1; }
  writeFileSync(join(out, name), buf); taken.add(name); manifest[full] = name; n += 1;
  console.log(`${r.status} ${type.padEnd(14)} ${String(buf.length).padStart(8)}  ${full.slice(-80)} → ${name}`);
}
writeFileSync(join(out, 'manifest.json'), JSON.stringify(manifest, null, 1));
console.log(`media-fetch: ${n} fetched, ${Object.keys(manifest).length} in ${out}/manifest.json${failed ? `, ${failed} failed` : ''}`);
process.exit(failed ? 2 : 0);
