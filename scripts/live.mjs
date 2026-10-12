#!/usr/bin/env node
// live.mjs — the harness page with live reload, for a person watching the prototype while the rounds edit the code. A second server on its
// own port over the same serve dir: the gated server (`serve.mjs`) stays byte-for-byte what the harness wrote (it verifies the md5), this one
// injects a reload client into every HTML response. A changed stylesheet that the page links (block CSS, styles.css) is swapped in place;
// anything else (a decorate, scripts.js, an @import-ed sheet, a re-run harness writing `<slug>.harness.html`, a fragment) reloads the page at
// the same scroll offset. Before the first harness the URL answers a waiting page that loads itself when the file appears.
// Usage: node live.mjs <serve-dir> [--port 8931] [--site-repo .] [--open <slug>]   (a busy port: the next free one)
//   Watches <site-repo>/{blocks,styles,scripts,fonts,icons} and the serve dir's harness pages, fragments and media. Never gate this port.
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync, symlinkSync, watch } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { arg } from './common.mjs';

const dir = process.argv[2]; if (!dir || dir.startsWith('--')) { console.error('usage: live.mjs <serve-dir> [--port 8931] [--site-repo .] [--open <slug>]'); process.exit(1); }
const root = resolve(dir); const port = Number(arg('--port', 8931)); const repo = resolve(String(arg('--site-repo', '.'))); mkdirSync(root, { recursive: true });
const CODE = ['scripts', 'blocks', 'styles', 'fonts', 'icons'];
for (const d of CODE) { const src = join(repo, d); const dst = join(root, d); if (!existsSync(dst) && existsSync(src)) { symlinkSync(src, dst); console.log(`live: ${d} → ${src}`); } }
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif', '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };

// the client: css → swap the matching <link> (cache-busted), else reload; the scroll offset survives a reload (blocks load late: retry 3 s)
const CLIENT = `<script>(() => {
  const k = 'live:' + location.pathname; const y = Number(sessionStorage.getItem(k)); sessionStorage.removeItem(k);
  if (y) { const t0 = Date.now(); const go = () => { window.scrollTo(0, y); if (Math.abs(window.scrollY - y) > 2 && Date.now() - t0 < 3000) setTimeout(go, 100); }; window.addEventListener('load', go); }
  const reload = () => { sessionStorage.setItem(k, String(window.scrollY)); location.reload(); };
  const es = new EventSource('/__live');
  es.addEventListener('change', (e) => {
    const { css, other } = JSON.parse(e.data); if (other.length) return reload();
    const links = [...document.querySelectorAll('link[rel="stylesheet"]')];
    for (const p of css) { const hit = links.filter((l) => new URL(l.href).pathname === p); if (!hit.length) return reload();
      hit.forEach((l) => { const n = l.cloneNode(); n.href = p + '?v=' + Date.now(); n.onload = () => l.remove(); l.after(n); }); }
    console.log('[live] css', css.join(' '));
  });
  let lost = false; es.onerror = () => { lost = true; }; es.onopen = () => { if (lost) reload(); };
})();</script>`;
const inject = (html) => (/<\/head>/i.test(html) ? html.replace(/<\/head>/i, `${CLIENT}</head>`) : CLIENT + html);
const waiting = (path) => `<!DOCTYPE html><html><head><meta charset="utf-8"><title>waiting · ${path}</title>${CLIENT}</head><body style="font:16px/1.5 system-ui;padding:4rem;color:#555">
<p><b>${path}</b> does not exist yet.</p><p>The page loads itself when the harness writes it (<code>stardust-lite harness … --serve ${dir} --name &lt;slug&gt;</code>).</p></body></html>`;

const clients = new Set();
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path === '/__live') { res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' }); res.write(': live\n\n'); clients.add(res); req.on('close', () => clients.delete(res)); return; }
  let file = normalize(join(root, path)); if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  try {
    if (statSync(file).isDirectory()) file = join(file, 'index.html');
    const type = MIME[extname(file).toLowerCase()] || 'application/octet-stream'; const head = { 'Content-Type': type, 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' };
    // a .plain.html is a fragment the runtime fetches and parses: never inject into it
    if (type.startsWith('text/html') && !file.endsWith('.plain.html')) { res.writeHead(200, head); return res.end(inject(readFileSync(file, 'utf8'))); }
    res.writeHead(200, head); res.end(readFileSync(file));
  } catch {
    if (/\.html$/.test(path) && !path.endsWith('.plain.html')) { res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); return res.end(waiting(path)); }
    res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end(`404 ${path}`);
  }
});
// a busy port is another run's live view (one per site repo): take the next free one rather than exit
const listen = (p, tries = 20) => server.listen(p, () => {
  const slug = arg('--open', null); const url = `http://localhost:${p}/${typeof slug === 'string' ? `${slug}.harness.html` : ''}`;
  console.log(`live: ${url} ← ${root} (watching ${repo}) — for eyes only, gate the serve.mjs port`);
  if (typeof slug === 'string') spawn(process.platform === 'darwin' ? 'open' : 'xdg-open', [url], { stdio: 'ignore', detached: true }).unref();
}).once('error', (e) => { if (e.code === 'EADDRINUSE' && tries > 0) { server.removeAllListeners('listening'); listen(p + 1, tries - 1); } else { console.error(`live: ${e.message}`); process.exit(1); } });
listen(port);

// one event per burst (an editor's save is several fs events; the harness writes two files): 120 ms debounce
let pending = new Set(); let timer = null;
const flush = () => {
  const paths = [...pending]; pending = new Set(); timer = null; if (!paths.length || !clients.size) return;
  const css = paths.filter((p) => p.endsWith('.css')); const other = paths.filter((p) => !p.endsWith('.css'));
  for (const c of clients) c.write(`event: change\ndata: ${JSON.stringify({ css, other })}\n\n`);
  console.log(`live: ${css.length ? `css ${css.join(' ')} ` : ''}${other.length ? `reload ← ${other.join(' ')}` : ''}`);
};
const note = (p) => { if (/(^|\/)\.|~$|\.swp$/.test(p)) return; pending.add(p); clearTimeout(timer); timer = setTimeout(flush, 120); };
for (const d of CODE) if (existsSync(join(repo, d))) watch(join(repo, d), { recursive: true }, (_, f) => f && note(`/${d}/${f}`));
// the serve dir: harness pages, fragments and media — not the serialised `<slug>.html` the harness writes after loading (the review artifact),
// not the code symlinks (watched at the source above)
watch(root, { recursive: true }, (_, f) => { if (!f || CODE.includes(f.split('/')[0])) return; if (/\.html$/.test(f) && !/\.(harness|plain)\.html$/.test(f)) return; note(`/${f}`); });
