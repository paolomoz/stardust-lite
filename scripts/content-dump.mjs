#!/usr/bin/env node
// content-dump.mjs — the AUTHORING input (step 2): per root selector a nested JSON of the visible elements that carry text, links or
// media — tag, short class, box, text with font, href/aria, src/alt/natural size, background/radius/border/shadow — bare wrappers
// collapsed. An element whose children are all phrasing (`strong`, `em`, `a`, `span`…) keeps its full text in reading order plus
// its inline markup (the own-text-only reading split "Text JOINRX to 21525" into "Text to 21525" + "JOINRX" — walgreens-home).
// --require <css,…> refuses (exit 4) a session whose composition is not the canonical one, so the dump matches the cached origin.
// Usage: node content-dump.mjs <url> [W] --roots <css,…> --out file.json [--require <css,…>] [--consent <css>] [--dismiss <css,…>] [--locale <tag>]
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { openPage, settle, arg, overlayOpts } from './common.mjs';

const url = process.argv[2]; const W = Number(process.argv[3] || 1440);
if (!url) { console.error('usage: content-dump.mjs <url> [W] --roots <css,…> --out file.json [--require <css,…>]'); process.exit(1); }
const roots = String(arg('--roots', 'header,main,footer')).split(',').map((s) => s.trim());
const b = await chromium.launch(); const p = await openPage(b, url, { width: W, consent: arg('--consent', null), ...overlayOpts(), wait: 4000 });
await settle(p);
const tree = await p.evaluate((roots) => {
  const R = (e) => { const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height)]; };
  const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return (r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none') || e.tagName === 'PICTURE' || e.tagName === 'SOURCE'; };
  const norm = (t) => t.replace(/\s+/g, ' ').trim();
  const own = (e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => norm(n.textContent)).filter(Boolean).join(' ');
  const PHRASING = ['STRONG', 'EM', 'B', 'I', 'U', 'SPAN', 'A', 'SUP', 'SUB', 'BR', 'SMALL', 'MARK', 'ABBR'];
  const walk = (e) => {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'IFRAME'].includes(e.tagName.toUpperCase())) {
      if (e.tagName === 'IFRAME' && vis(e)) return { tag: 'iframe', box: R(e), src: e.src, title: e.title, w: e.width, h: e.height };
      if (e.tagName === 'svg' && vis(e)) return { tag: 'svg', box: R(e), id: e.id, use: e.querySelector('use')?.getAttribute('href') || e.querySelector('use')?.getAttribute('xlink:href') || null, label: e.getAttribute('aria-label') };
      return null;
    }
    if (!vis(e)) return null;
    const s = getComputedStyle(e);
    const n = { tag: e.tagName.toLowerCase(), box: R(e) };
    if (e.id) n.id = e.id; const cls = [...e.classList].slice(0, 3).join(' '); if (cls) n.cls = cls;
    const font = () => `${s.fontFamily.split(',')[0].replace(/"/g, '')} ${s.fontSize}/${s.lineHeight} ${s.fontWeight} ${s.color}${s.textAlign !== 'start' ? ' ' + s.textAlign : ''}`;
    // mixed inline content: keep the reading order and the markup, do not descend
    const phrasingOnly = e.children.length && [...e.children].every((c) => PHRASING.includes(c.tagName) && !c.querySelector('img,picture,svg,video'));
    let descend = true;
    if (phrasingOnly && own(e)) { n.text = norm(e.textContent); n.markup = norm(e.innerHTML).slice(0, 600); n.font = font(); descend = false; } else { const t = own(e); if (t) { n.text = t; n.font = font(); } }
    if (e.tagName === 'A') { n.href = e.getAttribute('href'); if (e.getAttribute('aria-label')) n.aria = e.getAttribute('aria-label'); if (e.target) n.target = e.target; }
    if (e.tagName === 'IMG') { n.src = e.currentSrc || e.src; n.alt = e.alt; n.nat = [e.naturalWidth, e.naturalHeight]; }
    if (e.tagName === 'INPUT' || e.tagName === 'BUTTON') { n.type = e.type; if (e.placeholder) n.placeholder = e.placeholder; if (e.getAttribute('aria-label')) n.aria = e.getAttribute('aria-label'); }
    if (!/rgba\(0, 0, 0, 0\)/.test(s.backgroundColor)) n.bg = s.backgroundColor;
    if (s.backgroundImage !== 'none') n.bgi = s.backgroundImage.slice(0, 160);
    if (s.borderRadius !== '0px') n.br = s.borderRadius;
    if (s.boxShadow !== 'none') n.shadow = s.boxShadow;
    if (s.borderTopWidth !== '0px' && s.borderTopStyle !== 'none') n.border = `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor}`;
    const kids = descend ? [...e.children].map(walk).filter(Boolean) : [];
    if (kids.length) n.children = kids;
    if (kids.length === 1 && !n.text && !n.href && !n.src && !n.bg && !n.bgi && !n.border && !n.shadow && !n.id) return kids[0]; // bare wrapper
    if (!kids.length && !n.text && !n.href && !n.src && !n.bg && !n.bgi && !n.border) return null;
    return n;
  };
  const out = {}; for (const r of roots) out[r] = [...document.querySelectorAll(r)].map(walk).filter(Boolean);
  out.__doc = document.documentElement.scrollHeight; out.__title = document.title; out.__desc = document.querySelector('meta[name=description]')?.content;
  return out;
}, roots);
writeFileSync(arg('--out', 'content.json'), JSON.stringify(tree, null, 1));
console.log('doc', tree.__doc, 'roots', roots.length, '→', arg('--out', 'content.json'));
await b.close();
