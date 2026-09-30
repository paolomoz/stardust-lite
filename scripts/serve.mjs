#!/usr/bin/env node
// serve.mjs — the harness serve dir on a concurrent static server (step 5). `python3 -m http.server` answers one request at a time:
// under parallel Playwright sessions (three widths, sections + pair + deep-probe) the blocks-loaded wait timed out and the tables
// measured half-styled pages (stryker-home). With --site the dir gets the boilerplate symlinks the runtime needs.
// Usage: node serve.mjs <dir> [--port 8930] [--site <site-repo>]   (runs until killed; prints the URL)
import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, statSync, symlinkSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { arg } from './common.mjs';

const dir = process.argv[2]; if (!dir || dir.startsWith('--')) { console.error('usage: serve.mjs <dir> [--port 8930] [--site <site-repo>]'); process.exit(1); }
const root = resolve(dir); const port = Number(arg('--port', 8930)); mkdirSync(root, { recursive: true });
if (arg('--site', null)) for (const d of ['scripts', 'blocks', 'styles', 'fonts', 'icons']) { const src = resolve(arg('--site'), d); const dst = join(root, d); if (!existsSync(dst) && existsSync(src)) { symlinkSync(src, dst); console.log(`serve: ${d} → ${src}`); } }
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif', '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };
createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname); let file = normalize(join(root, path));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  try { if (statSync(file).isDirectory()) file = join(file, 'index.html'); const st = statSync(file); res.writeHead(200, { 'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream', 'Content-Length': st.size, 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' }); createReadStream(file).pipe(res); } catch { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end(`404 ${path}`); }
}).listen(port, () => console.log(`serve: http://localhost:${port}/ ← ${root}`)).on('error', (e) => { console.error(`serve: ${e.message} (another server on :${port}? the harness verifies the served file's md5 and refuses a stranger)`); process.exit(1); });
