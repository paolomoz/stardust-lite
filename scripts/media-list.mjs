#!/usr/bin/env node
// media-list.mjs — composed-tree inventory of a live page's media and fonts: every img (currentSrc, srcset, natural size, box, alt,
// fit), video (currentSrc, poster, autoplay/loop/muted, box), CSS background-image (element, box, url), inline svg, every @font-face
// (document and shadow-root sheets) and the font files actually requested. Also the body/html overflow before and after the
// overlays (a scroll lock left behind). The list is what gets downloaded byte-for-byte and uploaded to the draft media folder.
// Written for ibm-home, reused by walgreens-home.
// Usage: node media-list.mjs <url> [W] [--out file.json] [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--require <css,…>]
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { openPage, settle, arg, overlayOpts } from './common.mjs';

const url = process.argv[2]; const W = Number(process.argv[3] || 1440);
if (!url) { console.error('usage: media-list.mjs <url> [W] [--out file.json] [--consent <css>] [--dismiss <css,…>]'); process.exit(1); }
const fontReqs = []; let lockBefore = '';
const b = await chromium.launch();
const p = await openPage(b, url, { width: W, consent: arg('--consent', null), ...overlayOpts(), wait: 4000, before: (page) => {
  page.on('response', (r) => { const u = r.url(); if (/\.(woff2?|ttf|otf)(\?|$)/i.test(u) || (r.headers()['content-type'] || '').includes('font')) fontReqs.push(u); });
  page.on('domcontentloaded', async () => { lockBefore = await page.evaluate(() => `${getComputedStyle(document.body).overflow}/${getComputedStyle(document.documentElement).overflow}`).catch(() => ''); });
} });
await settle(p, 500, 150, 2000);
const out = await p.evaluate(() => {
  const all = []; const walk = (root) => { for (const e of root.querySelectorAll('*')) { all.push(e); if (e.shadowRoot) walk(e.shadowRoot); } }; walk(document);
  const R = (e) => { const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height)]; };
  const path = (e) => { const parts = []; let n = e; while (n && n.nodeType === 1 && parts.length < 6) { parts.unshift(`${n.tagName.toLowerCase()}${n.id ? '#' + n.id : ''}${[...n.classList].slice(0, 2).map((c) => '.' + c).join('')}`); n = n.parentElement || (n.getRootNode() instanceof ShadowRoot ? n.getRootNode().host : null); } return parts.join(' > '); };
  const imgs = all.filter((e) => e.tagName === 'IMG').map((e) => ({ box: R(e), src: e.currentSrc || e.src, srcset: (e.srcset || '').slice(0, 400), nat: [e.naturalWidth, e.naturalHeight], alt: e.alt, fit: getComputedStyle(e).objectFit, loading: e.loading, path: path(e) }));
  const videos = all.filter((e) => e.tagName === 'VIDEO').map((e) => ({ box: R(e), src: e.currentSrc || e.src, poster: e.poster, autoplay: e.autoplay, loop: e.loop, muted: e.muted, paused: e.paused, duration: e.duration, size: [e.videoWidth, e.videoHeight], path: path(e) }));
  const bgs = all.filter((e) => { const s = getComputedStyle(e); return s.backgroundImage !== 'none' && e.getBoundingClientRect().width > 0; }).map((e) => ({ box: R(e), bgi: getComputedStyle(e).backgroundImage.slice(0, 300), path: path(e) }));
  const svgs = all.filter((e) => e.tagName === 'svg' && e.getBoundingClientRect().width > 0).map((e) => ({ box: R(e), path: path(e), outer: e.outerHTML.slice(0, 2000) }));
  const faces = []; const sheets = [...document.styleSheets]; all.forEach((e) => { if (e.shadowRoot) sheets.push(...e.shadowRoot.styleSheets, ...(e.shadowRoot.adoptedStyleSheets || [])); });
  for (const sh of sheets) { let rules; try { rules = sh.cssRules; } catch { continue; } for (const r of rules) { if (r instanceof CSSFontFaceRule) faces.push(`${r.style.fontFamily} ${r.style.fontWeight} ${r.style.fontStyle} ${r.style.fontDisplay} unicode=${(r.style.unicodeRange || '').slice(0, 20)} :: ${r.style.getPropertyValue('src').slice(0, 300)}`); } }
  const loaded = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight} ${f.style}`);
  return { doc: document.documentElement.scrollHeight, imgs, videos, bgs, svgs, faces: [...new Set(faces)], loaded, bodyFont: getComputedStyle(document.body).fontFamily, lock: `${getComputedStyle(document.body).overflow}/${getComputedStyle(document.documentElement).overflow}` };
});
out.lockBefore = lockBefore; out.fontRequests = [...new Set(fontReqs)];
if (arg('--out', null)) writeFileSync(arg('--out'), JSON.stringify(out, null, 1));
console.log(`doc ${out.doc} imgs ${out.imgs.length} videos ${out.videos.length} bgs ${out.bgs.length} svgs ${out.svgs.length} faces ${out.faces.length} lock before/after ${out.lockBefore} → ${out.lock}`);
out.imgs.forEach((i) => console.log('IMG', JSON.stringify(i.box), i.nat.join('x'), i.fit, i.src.slice(0, 160), '|', i.alt.slice(0, 40), '|', i.path.slice(-90)));
out.videos.forEach((v) => console.log('VIDEO', JSON.stringify(v)));
out.bgs.forEach((g) => console.log('BG', JSON.stringify(g.box), g.bgi.slice(0, 160), '|', g.path.slice(-100)));
console.log('fonts loaded:', out.loaded.join(' | ')); console.log('body font:', out.bodyFont); out.faces.forEach((f) => console.log('FACE', f)); out.fontRequests.forEach((f) => console.log('FONTREQ', f));
await b.close();
