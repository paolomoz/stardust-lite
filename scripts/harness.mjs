#!/usr/bin/env node
// harness.mjs — lint → fold → runtime → serialise (step 5). The served harness page IS the gated prototype; the serialised file is
// the review artifact. Refuses to fold a document with a David's Model 🔴 (deploy skill lint) unless --no-lint.
// Usage: node harness.mjs <authored.html> --serve <dir> --name <slug> [--port 8930] [--width 1440] [--no-lint] [--fragments <branch-host>]
//   <dir> must serve the site code: symlinks scripts/ blocks/ styles/ fonts/ icons/ → the repo; plus any local media the document
//   references (e.g. drafts/media/*) and fragment plain.html files (drafts/nav.plain.html). Start it with `python3 -m http.server`.
//   --fragments https://<branch>--<site>--<org>.aem.page fetches the PIPELINE's `<nav>.plain.html` / `<footer>.plain.html` (the paths
//   in the metadata block, previewed first) into <dir>: a hand-made plain.html differs from the pipeline's (it wraps a list item's own
//   text in <p> when the item holds a nested list — ibm-home's header decorated on the prototype and crashed on the served page).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
import { arg, davidsLint } from './common.mjs';

const src = process.argv[2]; const serveDir = arg('--serve'); const name = arg('--name');
if (!src || !serveDir || !name) { console.error('usage: harness.mjs <authored.html> --serve <dir> --name <slug> [--port 8930] [--width 1440] [--no-lint]'); process.exit(1); }
const port = Number(arg('--port', 8930)); const W = Number(arg('--width', 1440));

if (!arg('--no-lint', false)) {
  const lint = davidsLint();
  if (existsSync(lint)) {
    const r = spawnSync('node', [lint, src], { encoding: 'utf8' });
    process.stdout.write(r.stdout);
    if (r.status === 2) { console.error('harness: David\'s Model 🔴 — fix the model before producing a prototype (or --no-lint to override, and say so in the register)'); process.exit(2); }
  } else console.log('harness: lint not found (set DAVIDS_LINT) — skipping');
}

const raw = readFileSync(src, 'utf8');
const b0 = await chromium.launch(); const p0 = await b0.newPage();
await p0.setContent(raw);
const folded = await p0.evaluate(() => {
  const metas = [];
  document.querySelectorAll('main .metadata').forEach((m) => { m.querySelectorAll(':scope > div').forEach((r) => { const [k, v] = r.children; if (k && v) metas.push([k.textContent.trim().toLowerCase(), v.textContent.trim()]); }); m.closest('main > div').remove(); });
  document.querySelectorAll('main .section-metadata').forEach((sm) => { const section = sm.parentElement; sm.querySelectorAll(':scope > div').forEach((r) => { const [k, v] = r.children; if (!k || !v) return; const key = k.textContent.trim().toLowerCase(); if (key === 'style') v.textContent.split(',').map((x) => x.trim()).filter(Boolean).forEach((c) => section.classList.add(c)); else if (key === 'id') section.id = v.textContent.trim(); else section.dataset[key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = (v.querySelector('a, img') ? (v.querySelector('a')?.href || v.querySelector('img')?.src) : v.textContent.trim()); }); sm.remove(); });
  document.querySelectorAll('main > div').forEach((d) => { if (!d.textContent.trim() && !d.querySelector('img,picture')) d.remove(); });
  return { metas, main: document.querySelector('main').outerHTML };
});
await b0.close();
const { metas } = folded;
if (arg('--fragments', null)) {
  const host = String(arg('--fragments')).replace(/\/$/, '');
  for (const [k, v] of metas.filter(([k]) => ['nav', 'footer'].includes(k))) {
    const path = new URL(v, host).pathname; const r = await fetch(`${host}${path}.plain.html`).catch(() => null);
    if (!r || !r.ok) { console.error(`harness: ${host}${path}.plain.html → ${r ? r.status : 'unreachable'} — preview the ${k} document first`); process.exit(4); }
    const file = `${serveDir}${path}.plain.html`; mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, await r.text()); console.log(`harness: ${k} fragment ← pipeline ${path}.plain.html`);
  }
}
const head = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${metas.map(([k, v]) => `<meta name="${k}" content="${v.replace(/"/g, '&quot;')}">`).join('')}<title>${(metas.find(([k]) => k === 'title') || [, ''])[1]}</title><script src="/scripts/aem.js" type="module"></script><script src="/scripts/scripts.js" type="module"></script><link rel="stylesheet" href="/styles/styles.css"></head>`;
writeFileSync(`${serveDir}/${name}.harness.html`, `${head}<body><header></header>${folded.main}<footer></footer></body></html>`);

// the served file must be the one just written (a server on this port from another case gates the wrong site — recorded twice)
const written = `${head}<body><header></header>${folded.main}<footer></footer></body></html>`;
const md5 = (s) => createHash('md5').update(s).digest('hex');
try {
  const served = await (await fetch(`http://localhost:${port}/${name}.harness.html`)).text();
  if (md5(served) !== md5(written)) { console.error(`harness: http://localhost:${port}/${name}.harness.html is NOT the file just written (served md5 ${md5(served).slice(0, 8)}, written ${md5(written).slice(0, 8)}) — another server on :${port}? refusing`); process.exit(3); }
  console.log(`harness: served file verified (md5 ${md5(written).slice(0, 8)})`);
} catch (e) { console.error(`harness: nothing answers on http://localhost:${port}/ — start \`python3 -m http.server ${port} --directory ${serveDir}\` first (${String(e).slice(0, 80)})`); process.exit(3); }

const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: 900 } });
p.on('console', (m) => { if (m.type() === 'error') console.log('console:', m.text().slice(0, 200)); });
p.on('pageerror', (e) => console.log('pageerror:', String(e).slice(0, 200)));
p.on('requestfailed', (r) => console.log('reqfailed:', r.url().slice(0, 120)));
await p.goto(`http://localhost:${port}/${name}.harness.html`, { waitUntil: 'networkidle', timeout: 60000 });
await p.waitForFunction(() => document.body.classList.contains('appear') && [...document.querySelectorAll('.block')].every((el) => el.dataset.blockStatus === 'loaded'), null, { timeout: 30000 }).catch((e) => console.log('wait:', String(e).slice(0, 120)));
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
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
