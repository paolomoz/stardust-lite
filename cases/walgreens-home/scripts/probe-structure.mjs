// probe-structure.mjs — light-DOM structure dump of a live page: tag, box, bg, own text per element to a depth (header, main, footer).
// Usage: node probe-structure.mjs <url> [W] [--root <css>] [--depth N] [--consent <css>]
import { chromium } from 'playwright';
import { openPage, settle, arg, overlayOpts } from '../../../scripts/common.mjs';
const url = process.argv[2]; const W = Number(process.argv[3] || 1440); const depth = Number(arg('--depth', 3)); const root = arg('--root', 'main');
const b = await chromium.launch(); const p = await openPage(b, url, { width: W, consent: arg('--consent', null), ...overlayOpts() });
await settle(p);
const out = await p.evaluate(({ root, depth }) => {
  const sel = (el) => `${el.tagName.toLowerCase()}${el.id?'#'+el.id:''}${[...el.classList].slice(0,4).map(c=>'.'+c).join('')}`;
  const box = (el) => { const r = el.getBoundingClientRect(); return `x${Math.round(r.left)} y${Math.round(r.top+scrollY)} w${Math.round(r.width)} h${Math.round(r.height)}`; };
  const walk = (el, d, max) => { const lines=[]; if (d>max) return lines; const r=el.getBoundingClientRect(); if (r.height===0 && !['picture','source','img'].includes(el.tagName.toLowerCase())) return lines; const cs=getComputedStyle(el); const txt = el.children.length===0 ? ` "${el.textContent.trim().slice(0,80)}"` : ''; const img = el.tagName==='IMG' ? ` src=${el.currentSrc.slice(-60)} ${el.naturalWidth}x${el.naturalHeight}` : ''; lines.push(`${'  '.repeat(d)}${sel(el)} ${box(el)} ${cs.display} bg=${cs.backgroundColor}${cs.backgroundImage!=='none'?' bgimg':''}${cs.position!=='static'?' pos='+cs.position:''}${txt}${img}`); for (const c of el.children) lines.push(...walk(c, d+1, max)); return lines; };
  const lines = [];
  lines.push('== header'); if (document.querySelector('header')) lines.push(...walk(document.querySelector('header'), 0, depth));
  lines.push('== ' + root); const r = document.querySelector(root); if (r) for (const c of r.children) lines.push(...walk(c, 0, depth));
  lines.push('== footer'); if (document.querySelector('footer')) lines.push(...walk(document.querySelector('footer'), 0, depth));
  lines.push(`== doc h=${document.documentElement.scrollHeight}`);
  return lines.join('\n');
}, { root, depth });
console.log(out);
await b.close();
