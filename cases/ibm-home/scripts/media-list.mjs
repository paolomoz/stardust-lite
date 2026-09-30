// media-list.mjs — composed-tree inventory of a live page's media and fonts: every img (currentSrc, natural size, box, alt, fit),
// video (currentSrc, poster, autoplay/loop/muted, box), CSS background-image (element, box, url), and every @font-face rule
// (family, weight, style, src) from document and shadow-root stylesheets. Also reports body overflow (scroll lock) after overlays.
// Usage: node media-list.mjs <url> [W] [--consent <css>] [--dismiss <css>] [--out file.json]
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const arg = (n, d) => { const i = process.argv.indexOf(n); return i < 0 ? d : (process.argv[i+1] ?? true); };
const url = process.argv[2]; const W = Number(process.argv[3] || 1440);
const b = await chromium.launch(); const ctx = await b.newContext({ viewport:{width:W,height:900}, userAgent: UA, locale: 'en-US', extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' } });
const p = await ctx.newPage(); const fontReqs = [];
p.on('response', (r) => { const u = r.url(); if (/\.(woff2?|ttf|otf)(\?|$)/i.test(u) || (r.headers()['content-type'] || '').includes('font')) fontReqs.push(u); });
await p.goto(url, { waitUntil:'domcontentloaded', timeout:90000 }); await p.waitForTimeout(4000);
const lockBefore = await p.evaluate(() => `${getComputedStyle(document.body).overflow}/${getComputedStyle(document.documentElement).overflow}`);
for (const s of [arg('--consent', null), arg('--dismiss', null)].filter(Boolean)) { try { await p.click(s, { timeout: 2000 }); } catch { console.log('no click', s); } }
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 150)); } window.scrollTo(0,0); await new Promise(r => setTimeout(r, 2000)); });
const out = await p.evaluate(() => {
  const all = []; const walk = (root) => { for (const e of root.querySelectorAll('*')) { all.push(e); if (e.shadowRoot) walk(e.shadowRoot); } }; walk(document);
  const R = (e) => { const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height)]; };
  const path = (e) => { const parts = []; let n = e; while (n && n.nodeType === 1 && parts.length < 6) { parts.unshift(`${n.tagName.toLowerCase()}${n.id ? '#' + n.id : ''}${[...n.classList].slice(0,2).map(c => '.' + c).join('')}`); n = n.parentElement || (n.getRootNode() instanceof ShadowRoot ? n.getRootNode().host : null); } return parts.join(' > '); };
  const imgs = all.filter(e => e.tagName === 'IMG').map(e => ({ box: R(e), src: e.currentSrc || e.src, srcset: (e.srcset || '').slice(0, 400), nat: [e.naturalWidth, e.naturalHeight], alt: e.alt, fit: getComputedStyle(e).objectFit, loading: e.loading, path: path(e) }));
  const videos = all.filter(e => e.tagName === 'VIDEO').map(e => ({ box: R(e), src: e.currentSrc || e.src, poster: e.poster, autoplay: e.autoplay, loop: e.loop, muted: e.muted, paused: e.paused, duration: e.duration, size: [e.videoWidth, e.videoHeight], path: path(e) }));
  const bgs = all.filter(e => { const s = getComputedStyle(e); return s.backgroundImage !== 'none' && e.getBoundingClientRect().width > 0; }).map(e => ({ box: R(e), bgi: getComputedStyle(e).backgroundImage.slice(0, 300), path: path(e) }));
  const svgs = all.filter(e => e.tagName === 'svg' && e.getBoundingClientRect().width > 0).map(e => ({ box: R(e), path: path(e), outer: e.outerHTML.slice(0, 2000) }));
  const faces = []; const sheets = [...document.styleSheets]; all.forEach(e => { if (e.shadowRoot) sheets.push(...e.shadowRoot.styleSheets, ...(e.shadowRoot.adoptedStyleSheets || [])); });
  for (const sh of sheets) { let rules; try { rules = sh.cssRules; } catch { continue; } for (const r of rules) { if (r instanceof CSSFontFaceRule) faces.push(`${r.style.fontFamily} ${r.style.fontWeight} ${r.style.fontStyle} ${r.style.fontDisplay} unicode=${(r.style.unicodeRange||'').slice(0,20)} :: ${r.style.getPropertyValue('src').slice(0, 300)}`); } }
  const loaded = [...document.fonts].filter(f => f.status === 'loaded').map(f => `${f.family} ${f.weight} ${f.style}`);
  return { doc: document.documentElement.scrollHeight, imgs, videos, bgs, svgs, faces: [...new Set(faces)], loaded, bodyFont: getComputedStyle(document.body).fontFamily, lock: `${getComputedStyle(document.body).overflow}/${getComputedStyle(document.documentElement).overflow}` };
});
out.lockBefore = lockBefore; out.fontRequests = [...new Set(fontReqs)];
if (arg('--out', null)) writeFileSync(arg('--out'), JSON.stringify(out, null, 1));
console.log(`doc ${out.doc} imgs ${out.imgs.length} videos ${out.videos.length} bgs ${out.bgs.length} svgs ${out.svgs.length} faces ${out.faces.length} lock before/after ${out.lockBefore} → ${out.lock}`);
out.imgs.forEach(i => console.log('IMG', JSON.stringify(i.box), i.nat.join('x'), i.fit, i.src.slice(0, 160), '|', i.alt.slice(0, 40), '|', i.path.slice(-90)));
out.videos.forEach(v => console.log('VIDEO', JSON.stringify(v), ''));
out.bgs.forEach(g => console.log('BG', JSON.stringify(g.box), g.bgi.slice(0, 160), '|', g.path.slice(-100)));
console.log('fonts loaded:', out.loaded.join(' | ')); console.log('body font:', out.bodyFont); out.faces.forEach(f => console.log('FACE', f)); out.fontRequests.forEach(f => console.log('FONTREQ', f));
await b.close();
