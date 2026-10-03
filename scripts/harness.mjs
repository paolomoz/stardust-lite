#!/usr/bin/env node
// harness.mjs — lint → fold → runtime → serialise (step 5). The served harness page IS the gated prototype; the serialised file is
// the review artifact. Refuses to fold a document with a David's Model 🔴 (deploy skill lint) unless --no-lint.
// Usage: node harness.mjs <authored.html> --serve <dir> --name <slug> [--port 8930] [--width 1440] [--no-lint] [--fragments <branch-host>]
//        [--content <content.json>[,<click-dump.json>…]] [--site-repo <repo>]
//   The serve dir is created, and when nothing answers on the port `serve <dir> --port <n> --site <repo>` is started detached (--site-repo
//   defaults to the cwd; `--site` is the profile file on every instrument — read as the repo it sent serve to `.` and 404'd, mfs-home) — three runs crashed on a missing dir / silent port before the two-step was clear (scotiabank-personal).
//        node harness.mjs --pages <pages.json> [--doc-dir doc] --serve <dir> [--port 8930] [--fragments <branch-host>] [--no-lint] [--content-dir <dir>]
//   --pages (batch-7 rollout, pass 5): one harness per page of a `roster pick` list — `<doc-dir>/<slug>.html` → `<serve>/<slug>.harness.html`
//   on the one port — the page's own output first, then one summary line per page (blocks loaded, doc height, texts not in the capture,
//   or the error). `--content-dir <dir>` passes `<dir>/<slug>.json` (or `<dir>/<slug>/content-1440.json`) as --content when it exists.
//   <dir> must serve the site code: symlinks scripts/ blocks/ styles/ fonts/ icons/ → the repo; plus any local media the document
//   references (e.g. drafts/media/*) and fragment plain.html files (drafts/nav.plain.html). Start it with `scripts/serve.mjs <dir>
//   --port <n> --site <repo>` (creates the symlinks, answers concurrent sessions — `python3 -m http.server` under parallel Playwright
//   sessions timed out the blocks-loaded wait and measured half-styled pages — stryker-home).
//   --content <content-dump.json>[,<click-dump.json>…] checks every authored text against the capture: a text the dump does not hold was
//   typed from memory (three descriptions finished from a truncated viewer cost a round — stryker-home). Add the `click-dump` JSONs for
//   the content a click reveals (captions, tab panels, sub-menus). Warns, does not refuse.
//   --fragments https://<branch>--<site>--<org>.aem.page fetches the PIPELINE's `<nav>.plain.html` / `<footer>.plain.html` (the paths
//   in the metadata block, previewed first) into <dir>: a hand-made plain.html differs from the pipeline's (it wraps a list item's own
//   text in <p> when the item holds a nested list — ibm-home's header decorated on the prototype and crashed on the served page), and
//   fetches the media the fragments reference. The fold applies the pipeline's single-paragraph cell rule and its list-item rule (see
//   below) and requests every remote media URL of the document once (the branch host renders a rendition on its first request).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { arg, davidsLint, launch } from './common.mjs';

if (typeof arg('--pages', null) === 'string') {
  const list = JSON.parse(readFileSync(arg('--pages'), 'utf8')); const pages = list.pages || []; const docDir = String(arg('--doc-dir', 'doc')); const serveDir0 = arg('--serve');
  if (!pages.length || !serveDir0) { console.error('usage: harness.mjs --pages <pages.json> [--doc-dir doc] --serve <dir> [--port 8930] [--fragments <branch-host>] [--no-lint] [--content-dir <dir>]'); process.exit(1); }
  const inherit = ['--serve', '--port', '--width', '--fragments'].flatMap((f) => (typeof arg(f, null) === 'string' ? [f, arg(f)] : [])); if (arg('--no-lint', false)) inherit.push('--no-lint');
  const me = fileURLToPath(import.meta.url); const summary = [];
  for (const p of pages) {
    const doc = join(docDir, `${p.slug}.html`); const row = { slug: p.slug, doc, url: `http://localhost:${arg('--port', 8930)}/${p.slug}.harness.html`, exit: null, blocks: null, doc_height: null, missing: null, error: null };
    console.log(`\n=== ${p.slug}  ${doc}`);
    if (!existsSync(doc)) { row.error = 'no document'; row.exit = 1; summary.push(row); console.log(`harness: ${doc} does not exist`); continue; }
    const cDir = arg('--content-dir', null); const cFile = typeof cDir === 'string' ? [join(cDir, `${p.slug}.json`), join(cDir, p.slug, 'content-1440.json')].find(existsSync) : null;
    const r = spawnSync('node', [me, doc, '--name', p.slug, ...inherit, ...(cFile ? ['--content', cFile] : [])], { encoding: 'utf8' });
    process.stdout.write(r.stdout); if (r.stderr) process.stderr.write(r.stderr);
    row.exit = r.status; const b = r.stdout.match(/^blocks: (.*)$/m); const h = r.stdout.match(/doc height (\d+)/); const m = r.stdout.match(/content check (\d+) texts, (\d+) not in/);
    if (b) { const all = b[1].split(' | ').filter(Boolean); row.blocks = { loaded: all.filter((x) => / → loaded$/.test(x)).length, total: all.length, notLoaded: all.filter((x) => !/ → loaded$/.test(x)) }; }
    if (h) row.doc_height = Number(h[1]); if (m) row.missing = Number(m[2]);
    if (r.status) row.error = ((r.stderr.match(/^(?:harness: |[A-Za-z]*Error|page\.evaluate).*$/m) || [r.stderr.trim().split('\n').pop() || `exit ${r.status}`])[0]).slice(0, 160);
    summary.push(row);
  }
  console.log('\n| page | document | blocks loaded | doc height | texts not in capture | result |\n|---|---|---|---|---|---|');
  for (const s of summary) console.log(`| ${s.slug} | ${s.doc} | ${s.blocks ? `${s.blocks.loaded}/${s.blocks.total}${s.blocks.notLoaded.length ? ` (${s.blocks.notLoaded.join(', ')})` : ''}` : '—'} | ${s.doc_height ?? '—'} | ${s.missing ?? '—'} | ${s.exit ? `ERR ${s.error}` : s.url} |`);
  process.exit(summary.some((s) => s.exit) ? 2 : 0);
}

const src = process.argv[2]; const serveDir = arg('--serve'); const name = arg('--name');
if (!src || !serveDir || !name) { console.error('usage: harness.mjs <authored.html> --serve <dir> --name <slug> [--port 8930] [--width 1440] [--no-lint]'); process.exit(1); }
const port = Number(arg('--port', 8930)); const W = Number(arg('--width', 1440));
mkdirSync(serveDir, { recursive: true });

if (!arg('--no-lint', false)) {
  const lint = davidsLint();
  if (existsSync(lint)) {
    const r = spawnSync('node', [lint, src], { encoding: 'utf8' });
    process.stdout.write(r.stdout);
    if (r.status === 2) { console.error('harness: David\'s Model 🔴 — fix the model before producing a prototype (or --no-lint to override, and say so in the register)'); process.exit(2); }
  } else console.log('harness: lint not found (set DAVIDS_LINT) — skipping');
}

const raw = readFileSync(src, 'utf8');
// an unbalanced inline tag swallows everything after it (the metadata block parsed inside a <strong>: `closest('main > div')` null, natixis): count before folding
for (const tag of ['strong', 'b', 'em', 'i', 'a', 'span']) { const o = (raw.match(new RegExp(`<${tag}\\b`, 'gi')) || []).length; const c = (raw.match(new RegExp(`</${tag}>`, 'gi')) || []).length; if (o !== c) console.log(`harness: <${tag}> opened ${o} times, closed ${c} — an unbalanced inline tag shifts every later node (the browser re-parents it); fix the document`); }
const b0 = await launch(); const p0 = await b0.newPage();
await p0.setContent(raw);
const folded = await p0.evaluate(() => {
  const metas = [];
  document.querySelectorAll('main .metadata').forEach((m) => { m.querySelectorAll(':scope > div').forEach((r) => { const [k, v] = r.children; if (k && v) metas.push([k.textContent.trim().toLowerCase(), v.textContent.trim()]); }); const sec = m.closest('main > div'); if (sec && sec.children.length === 1) sec.remove(); else m.remove(); });
  document.querySelectorAll('main .section-metadata').forEach((sm) => { const section = sm.parentElement; sm.querySelectorAll(':scope > div').forEach((r) => { const [k, v] = r.children; if (!k || !v) return; const key = k.textContent.trim().toLowerCase(); if (key === 'style') v.textContent.split(',').map((x) => x.trim().toLowerCase().replace(/[^0-9a-z]+/g, '-').replace(/^-|-$/g, '')).filter(Boolean).forEach((c) => section.classList.add(c)); else if (key === 'id') section.id = v.textContent.trim(); else section.dataset[key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = (v.querySelector('a, img') ? (v.querySelector('a')?.href || v.querySelector('img')?.src) : v.textContent.trim()); }); sm.remove(); });
  // a section style is a class the way aem.js's toClassName writes it (`Brands Divider` → `brands-divider`); the raw token crashed the fold on a space (pass 5)
  document.querySelectorAll('main > div').forEach((d) => { if (!d.textContent.trim() && !d.querySelector('img,picture')) d.remove(); });
  // the pipeline's cell rule: a block cell holding ONE paragraph and nothing else loses its <p> (`<div><p><a>x</a></p></div>` → `<div><a>x</a></div>`,
  // verified on the served plain.html — walgreens-home); a decorate that read `:scope > p` worked on the prototype only
  document.querySelectorAll('main > div > div > div > div').forEach((cell) => { const k = cell.children; if (k.length === 1 && k[0].tagName === 'P' && ![...cell.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) k[0].replaceWith(...k[0].childNodes); });
  // the pipeline's list rule: a list item that also holds a nested list keeps its own text (and inline markup) in <p> (`<li><p>Software</p><ul>`);
  // a decorate that read the label from the li's first node worked on the prototype and left the served drawer's buttons empty (audemarspiguet-home)
  // pipeline parity: a paragraph's leading <br>s and an empty paragraph (`<p></p>`, `<p>&nbsp;</p>`, `<p><br></p>`) are dropped by the
  // pipeline — the served page was 24 px shorter than the prototype at 360, two gate rounds (scotiabank-personal)
  document.querySelectorAll('main p').forEach((p) => { while (p.firstChild && ((p.firstChild.nodeType === 1 && p.firstChild.tagName === 'BR') || (p.firstChild.nodeType === 3 && !p.firstChild.textContent.trim() && p.firstChild.nextSibling?.nodeType === 1 && p.firstChild.nextSibling.tagName === 'BR'))) p.firstChild.remove(); if (!p.textContent.replace(/\u00a0/g, ' ').trim() && !p.querySelector(':scope > :not(br)')) p.remove(); });
  document.querySelectorAll('main li').forEach((li) => { if (!li.querySelector(':scope > ul, :scope > ol')) return; const own = [...li.childNodes].filter((n) => !(n.nodeType === 1 && /^(UL|OL|P|DIV)$/.test(n.tagName)) && !(n.nodeType === 3 && !n.textContent.trim())); if (!own.length) return; const p = document.createElement('p'); li.insertBefore(p, own[0]); own.forEach((n) => p.appendChild(n)); });
  // the pipeline turns `:name:` into `<span class="icon icon-name"></span>` (decorateIcons then loads the SVG): the fold does the same (#5, harbourvest-about)
  const tw = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT); const nodes = []; while (tw.nextNode()) if (/:[a-z0-9][a-z0-9-]*:/i.test(tw.currentNode.textContent)) nodes.push(tw.currentNode);
  for (const tn of nodes) { const frag = document.createDocumentFragment(); const parts = tn.textContent.split(/(:[a-z0-9][a-z0-9-]*:)/i); for (const part of parts) { const m = /^:([a-z0-9][a-z0-9-]*):$/i.exec(part); if (m) { const sp = document.createElement('span'); sp.className = `icon icon-${m[1].toLowerCase()}`; frag.appendChild(sp); } else if (part) frag.appendChild(document.createTextNode(part)); } tn.replaceWith(frag); }
  // every authored text (an element's own text and inline children, nested lists/blocks excluded) for the capture check
  const texts = [...document.querySelectorAll('main h1,main h2,main h3,main h4,main h5,main h6,main p,main li')].map((e) => [...e.childNodes].filter((n) => n.nodeType === 3 || (n.nodeType === 1 && !/^(UL|OL|DIV|P|TABLE)$/.test(n.tagName))).map((n) => n.textContent).join('').replace(/:[a-z0-9-]+:/g, ' ').replace(/\s+/g, ' ').trim()).filter((t) => t.length >= 3 && !/^https?:/.test(t));
  return { metas, main: document.querySelector('main').outerHTML, texts };
});
await b0.close();
const { metas } = folded;
if (arg('--content', null)) {
  // several sources, comma-separated: the content dump holds the page at rest; a `click-dump` JSON holds what a click reveals (carousel
  // captions, tab panels, a drawer's sub-menus) — 23 correctly authored texts read as "not in the capture" against the dump alone
  // (hiltongrandvacations-home)
  const files = String(arg('--content')).split(',').map((f) => f.trim()).filter(Boolean); const got = [];
  const walk = (n) => { if (!n || typeof n !== 'object') return; if (Array.isArray(n)) return n.forEach(walk); if (typeof n.text === 'string') got.push(n.text); walk(n.children); };
  for (const f of files) { const dump = JSON.parse(readFileSync(f, 'utf8')); Object.entries(dump).forEach(([k, v]) => { if (!k.startsWith('__')) walk(v); }); }
  const hay = got.join(' ').replace(/\s+/g, ' ').toLowerCase();
  const missing = [...new Set(folded.texts)].filter((t) => !hay.includes(t.toLowerCase()));
  missing.forEach((t) => console.log(`harness: text not in the capture — "${t.slice(0, 100)}${t.length > 100 ? '…' : ''}"`));
  console.log(`harness: content check ${folded.texts.length} texts, ${missing.length} not in ${files.join(' + ')}${missing.length ? ' (typed from memory? read the JSON, not a viewer)' : ''}`);
}
// the runtime loads the header and footer from the metadata block's `nav` / `footer` rows (else /nav and /footer): without the rows or
// without --fragments the serve dir holds no plain.html and the chrome renders blank — a 3-minute crop-and-grep hunt (scotiabank-personal)
const chromeRows = ['nav', 'footer'].filter((k) => metas.some(([m]) => m === k));
if (chromeRows.length < 2) console.log(`harness: the metadata block names no ${['nav', 'footer'].filter((k) => !chromeRows.includes(k)).join(' / ')} row — the runtime loads /${['nav', 'footer'].filter((k) => !chromeRows.includes(k)).join(' and /')}.plain.html from the serve dir; the header / footer render blank unless the row(s) are authored`);
if (!arg('--fragments', null)) console.log(`harness: no --fragments — the chrome fragments are read from ${serveDir}/ (preview nav + footer on the branch and pass --fragments <branch-host> for the pipeline's markup)`);
if (arg('--fragments', null)) {
  const host = String(arg('--fragments')).replace(/\/$/, '');
  for (const [k, v] of metas.filter(([k]) => ['nav', 'footer'].includes(k))) {
    const path = new URL(v, host).pathname; const r = await fetch(`${host}${path}.plain.html`).catch(() => null);
    if (!r || !r.ok) { console.error(`harness: ${host}${path}.plain.html → ${r ? r.status : 'unreachable'} — preview the ${k} document first`); process.exit(4); }
    const html = await r.text(); const file = `${serveDir}${path}.plain.html`; mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, html); console.log(`harness: ${k} fragment ← pipeline ${path}.plain.html`);
    // the fragment's pictures are relative (`./media_<hash>.<ext>?width=…`): fetch each once next to the plain.html (the prototype 404'd them — walgreens-home)
    const media = [...new Set([...html.matchAll(/(?:src|srcset)="([^"]*)"/g)].flatMap((m) => m[1].split(',')).map((u) => u.trim().split(/[\s?]/)[0]).filter((u) => /^\.\/media_/.test(u)))];
    for (const rel of media) { const mf = `${dirname(file)}/${rel.slice(2)}`; if (existsSync(mf)) continue; const mr = await fetch(`${host}${dirname(path)}/${rel.slice(2)}`.replace(/\/\//g, '/').replace(':/', '://')).catch(() => null); if (mr && mr.ok) writeFileSync(mf, Buffer.from(await mr.arrayBuffer())); else console.log(`harness: ${k} media ${rel} → ${mr ? mr.status : 'unreachable'}`); }
    if (media.length) console.log(`harness: ${k} media ×${media.length} ← pipeline`);
  }
}
// the branch host generates a rendition on its first request: the first gate's build capture showed blank picture cells until every media
// URL had been requested once (audemarspiguet-home, one round). Warm every remote media URL of the document here, once, before the runtime
const remote = [...new Set([...folded.main.matchAll(/(?:src|srcset|href)="(https?:[^"]+)"/g)].flatMap((m) => m[1].split(',')).map((u) => u.trim().split(/\s+/)[0]).filter((u) => /\.(avif|webp|png|jpe?g|gif|svg|mp4)(\?|$)/i.test(u)))];
if (remote.length) { let warm = 0; let cold = 0; for (const u of remote) { const r = await fetch(u, { method: 'GET' }).catch(() => null); if (r && r.ok) { warm += 1; await r.arrayBuffer().catch(() => {}); } else { cold += 1; console.log(`harness: media ${u.slice(-90)} → ${r ? r.status : 'unreachable'}`); } } console.log(`harness: ${warm} remote media URLs warmed${cold ? `, ${cold} failed (a 404 here is a blank cell in the gate)` : ''}`); }
const head = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${metas.map(([k, v]) => `<meta name="${k}" content="${v.replace(/"/g, '&quot;')}">`).join('')}<title>${(metas.find(([k]) => k === 'title') || [, ''])[1]}</title><script src="/scripts/aem.js" type="module"></script><script src="/scripts/scripts.js" type="module"></script><link rel="stylesheet" href="/styles/styles.css"></head>`;
writeFileSync(`${serveDir}/${name}.harness.html`, `${head}<body><header></header>${folded.main}<footer></footer></body></html>`);

// the served file must be the one just written (a server on this port from another case gates the wrong site — recorded twice)
const written = `${head}<body><header></header>${folded.main}<footer></footer></body></html>`;
const md5 = (s) => createHash('md5').update(s).digest('hex');
const serving = () => fetch(`http://localhost:${port}/`).then(() => true).catch(() => false);
if (!(await serving())) { // start serve detached (page-run's rule); it stays up for the next runs
  const { spawn } = await import('node:child_process'); const site = String(arg('--site-repo', '.'));
  console.log(`harness: nothing answers on :${port} — starting \`serve ${serveDir} --port ${port} --site ${site}\` (detached)`);
  const child = spawn(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), 'serve.mjs'), serveDir, '--port', String(port), '--site', site], { detached: true, stdio: 'ignore' }); child.unref();
  const t0 = Date.now(); while (!(await serving()) && Date.now() - t0 < 10000) await new Promise((r) => setTimeout(r, 300));
}
try {
  const served = await (await fetch(`http://localhost:${port}/${name}.harness.html`)).text();
  if (md5(served) !== md5(written)) { const owner = spawnSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN'], { encoding: 'utf8' }).stdout.split('\n').slice(1).map((l) => l.split(/\s+/).slice(0, 2).join(' ')).filter(Boolean).join(', '); console.error(`harness: http://localhost:${port}/${name}.harness.html is NOT the file just written (served md5 ${md5(served).slice(0, 8)}, written ${md5(written).slice(0, 8)}) — another server on :${port}${owner ? ` (${owner})` : ''}: kill it or pass another --port; refusing`); process.exit(3); }
  console.log(`harness: served file verified (md5 ${md5(written).slice(0, 8)})`);
} catch (e) { console.error(`harness: nothing answers on http://localhost:${port}/ — start \`node scripts/serve.mjs ${serveDir} --port ${port} --site <repo>\` first (${String(e).slice(0, 80)})`); process.exit(3); }

const b = await launch(); const p = await b.newPage({ viewport: { width: W, height: 900 } });
p.on('console', (m) => { if (m.type() === 'error') console.log('console:', m.text().slice(0, 200)); });
p.on('pageerror', (e) => console.log('pageerror:', String(e).slice(0, 200)));
p.on('requestfailed', (r) => console.log('reqfailed:', r.url().slice(0, 120)));
await p.goto(`http://localhost:${port}/${name}.harness.html`, { waitUntil: 'networkidle', timeout: 60000 });
await p.waitForFunction(() => document.body.classList.contains('appear') && [...document.querySelectorAll('.block')].every((el) => el.dataset.blockStatus === 'loaded'), null, { timeout: 30000 }).catch((e) => console.log('wait:', String(e).slice(0, 120)));
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); await document.fonts.ready; });
await p.waitForTimeout(500);
const dom = await p.evaluate(() => {
  document.querySelectorAll('script').forEach((s) => s.remove());
  return { html: `<!DOCTYPE html>${document.documentElement.outerHTML}`, blocks: [...document.querySelectorAll('.block')].map((el) => `${el.className.split(' ')[0]} → ${el.dataset.blockStatus}`), h: document.documentElement.scrollHeight, body: document.body.className };
});
writeFileSync(`${serveDir}/${name}.html`, dom.html);
console.log('blocks:', dom.blocks.join(' | '));
console.log(`body: ${dom.body} | doc height ${dom.h}`);
console.log(`prototype (gate this): http://localhost:${port}/${name}.harness.html`);
console.log(`serialised (review):   ${serveDir}/${name}.html`);
await b.close();
