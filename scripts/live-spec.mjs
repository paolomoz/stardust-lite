#!/usr/bin/env node
// live-spec.mjs — per-node measurement of a page at one width (step 1 of BLOCKS-FIRST-PROTOTYPING.md).
// Per top-level section: box, padding, paint (bg, image, radius, border, shadow, transform); per text node: font family/size/
// line-height/weight/letter-spacing/transform/align/colour/style/decoration + box + text + href; per image/video/svg/canvas: box, fit, src.
// Also writes the captured DOM. Usage:
//   node live-spec.mjs <url> <W> --out <dir> [--sections <css>] [--header <css>] [--footer <css>] [--consent <css>] [--vh 900]
// Default sections: `main > .section` (EDS) — for a source page pass its section selector, e.g. --sections '.section-wrapper > section'.
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { arg, openPage, settle } from './common.mjs';

const [,, url, wArg] = process.argv;
if (!url || !wArg) { console.error('usage: live-spec.mjs <url> <W> --out <dir> [--sections <css>] [--header <css>] [--footer <css>] [--consent <css>]'); process.exit(1); }
const W = Number(wArg); const out = arg('--out', '.'); const vh = Number(arg('--vh', 900));
const sections = arg('--sections', 'main > .section'); const header = arg('--header', 'header'); const footer = arg('--footer', 'footer'); const consent = arg('--consent', null);
const browser = await chromium.launch();
const page = await openPage(browser, url, { width: W, height: vh, consent });
await settle(page);
const spec = await page.evaluate(({ sections, header, footer }) => {
  const R = (e) => { const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y + scrollY), Math.round(b.width), Math.round(b.height)]; };
  const vis = (e) => { const b = e.getBoundingClientRect(); const s = getComputedStyle(e); return b.width > 0 && b.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && parseFloat(s.opacity) > 0.05; };
  const F = (e) => { const s = getComputedStyle(e); return { ff: s.fontFamily.split(',')[0].replace(/"/g, ''), fs: s.fontSize, fw: s.fontWeight, lh: s.lineHeight, ls: s.letterSpacing, tt: s.textTransform, ta: s.textAlign, c: s.color, fst: s.fontStyle, td: s.textDecorationLine }; };
  const BG = (e) => { const s = getComputedStyle(e); const o = {}; if (!/rgba\(0, 0, 0, 0\)/.test(s.backgroundColor)) o.bg = s.backgroundColor; if (s.backgroundImage !== 'none') o.bgi = s.backgroundImage.slice(0, 200); if (s.borderRadius !== '0px') o.br = s.borderRadius; if ([s.borderTopWidth, s.borderBottomWidth, s.borderLeftWidth, s.borderRightWidth].some((w) => parseFloat(w) > 0)) o.border = [s.borderTop, s.borderBottom, s.borderLeft, s.borderRight].map((x) => x.slice(0, 30)).join(' | '); if (s.boxShadow !== 'none') o.shadow = s.boxShadow.slice(0, 60); if (s.transform !== 'none') o.tf = s.transform; return o; };
  const secs = [document.querySelector(header), ...document.querySelectorAll(sections), document.querySelector(footer)].filter(Boolean);
  const outSecs = secs.map((sec) => {
    const cs = getComputedStyle(sec);
    const s = { id: `${sec.tagName} ${sec.className}`.trim().slice(0, 80), box: R(sec), pad: cs.padding, pos: cs.position, ...BG(sec), items: [] };
    sec.querySelectorAll('div,section,ul,li,a,button,span,article,aside,figure,nav,form,input,picture').forEach((e) => { if (!vis(e)) return; const bg = BG(e); const bx = R(e); if (Object.keys(bg).length && bx[2] >= 24 && bx[3] >= 16) s.items.push({ k: 'paint', tag: e.tagName.toLowerCase(), cls: (typeof e.className === 'string' ? e.className : '').slice(0, 60), box: bx, pad: getComputedStyle(e).padding, ...bg }); });
    sec.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,a,button,label,input,span,em,i,b,strong,u,td,th,div').forEach((e) => {
      if (!vis(e)) return;
      const own = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
      if (!own && !e.matches('input,button')) return;
      const it = { k: e.tagName.toLowerCase(), cls: (typeof e.className === 'string' ? e.className : '').slice(0, 60), box: R(e), t: (own || e.value || e.placeholder || '').replace(/\s+/g, ' ').slice(0, 200), ...F(e) };
      const a = e.closest('a'); if (a) it.href = a.getAttribute('href'); if (e.matches('span,em,i,b,strong,u')) it.inline = true;
      Object.assign(it, BG(e)); if (getComputedStyle(e).padding !== '0px') it.pad = getComputedStyle(e).padding;
      s.items.push(it);
    });
    sec.querySelectorAll('img,video,svg,iframe,canvas').forEach((e) => { if (!vis(e)) return; s.items.push({ k: e.tagName.toLowerCase(), cls: (typeof e.className === 'string' ? e.className : '').slice(0, 60), box: R(e), src: (e.currentSrc || e.getAttribute('src') || e.getAttribute('data-src') || e.getAttribute('poster') || '').slice(0, 240), alt: e.getAttribute('alt') || '', fit: getComputedStyle(e).objectFit }); });
    s.items.sort((a, b) => a.box[1] - b.box[1] || a.box[0] - b.box[0]);
    return s;
  });
  return { url: location.href, W: innerWidth, vh: innerHeight, doc: document.documentElement.scrollHeight, body: document.body.className, bodyBg: getComputedStyle(document.body).backgroundColor, fonts: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight} ${f.style}`), secs: outSecs, html: document.documentElement.outerHTML };
}, { sections, header, footer });
mkdirSync(out, { recursive: true });
const { html, ...rest } = spec;
writeFileSync(`${out}/spec-${W}.json`, JSON.stringify(rest, null, 1));
writeFileSync(`${out}/dom-${W}.html`, html);
console.log(`W ${rest.W} vh ${rest.vh} doc ${rest.doc} sections ${rest.secs.length} bodyBg ${rest.bodyBg}`);
rest.secs.forEach((s, i) => console.log(String(i).padStart(2), s.id.slice(0, 48).padEnd(48), JSON.stringify(s.box).padEnd(22), s.pad, s.bg || '', s.items.length, 'items'));
console.log('fonts:', rest.fonts.join(' | '));
await browser.close();
