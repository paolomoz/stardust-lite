#!/usr/bin/env node
// probe-structure.mjs — structure dump of a live page to a depth: selector (tag#id.classes[slot]), box, display/position, background,
// image src, own text with its font. Light DOM by default; --pierce descends into shadow roots (a `#` marks a shadow child). This is
// the "what are the sections" input for `live-spec --sections` and the map the triage walks. Written for travelers-home, reused by
// ibm-home (pierced) and walgreens-home.
// Usage: node probe-structure.mjs <url> [W] [--root <css>] [--depth N] [--pierce] [--out file] [--click <css> --no-settle]
//        [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--require <css,…>]
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { openPage, settle, arg, overlayOpts } from './common.mjs';

const url = process.argv[2]; const W = Number(process.argv[3] || 1440);
if (!url) { console.error('usage: probe-structure.mjs <url> [W] [--root <css>] [--depth N] [--pierce] [--out file] [--click <css> --no-settle]'); process.exit(1); }
const depth = Number(arg('--depth', 3)); const root = arg('--root', 'body'); const pierce = process.argv.includes('--pierce');
const b = await chromium.launch(); const p = await openPage(b, url, { width: W, consent: arg('--consent', null), ...overlayOpts(), wait: 4000 });
if (arg('--click', null)) { try { await p.click(arg('--click'), { timeout: 3000 }); await p.waitForTimeout(1500); } catch (e) { console.log('no click', arg('--click'), String(e).slice(0, 80)); } }
if (!arg('--no-settle', false)) await settle(p);
const out = await p.evaluate(({ root, depth, pierce }) => {
  const sel = (el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${[...el.classList].slice(0, 4).map((c) => '.' + c).join('')}${el.getAttribute('slot') ? '[slot=' + el.getAttribute('slot') + ']' : ''}`;
  const box = (el) => { const r = el.getBoundingClientRect(); return `x${Math.round(r.left)} y${Math.round(r.top + scrollY)} w${Math.round(r.width)} h${Math.round(r.height)}`; };
  const walk = (el, d, max, fromShadow) => {
    const lines = []; if (d > max) return lines; if (['script', 'style', 'link', 'template', 'noscript'].includes(el.tagName.toLowerCase())) return lines;
    const r = el.getBoundingClientRect();
    if (r.height === 0 && r.width === 0 && !el.shadowRoot && getComputedStyle(el).display !== 'contents' && !['picture', 'source', 'slot'].includes(el.tagName.toLowerCase())) return lines;
    const cs = getComputedStyle(el); const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).filter(Boolean).join(' ');
    const src = el.tagName === 'IMG' ? ` src=${(el.currentSrc || el.src || '').slice(-90)} ${el.naturalWidth}x${el.naturalHeight}` : '';
    lines.push(`${'  '.repeat(d)}${fromShadow ? '#' : ''}${sel(el)} ${box(el)} ${cs.display}${cs.position !== 'static' ? ' ' + cs.position : ''} bg=${cs.backgroundColor}${cs.backgroundImage !== 'none' ? ' bgimg' : ''}${src}${own ? ` ${cs.fontSize}/${cs.lineHeight} ${cs.fontWeight} ${cs.color} "${own.slice(0, 80)}"` : ''}`);
    if (el.shadowRoot && pierce) for (const c of el.shadowRoot.children) lines.push(...walk(c, d + 1, max, true));
    for (const c of el.children) lines.push(...walk(c, d + 1, max, false));
    return lines;
  };
  const r = document.querySelector(root); if (!r) return `no ${root}`;
  return `doc ${document.documentElement.scrollHeight}\n${walk(r, 0, depth, false).join('\n')}`;
}, { root, depth, pierce });
if (arg('--out', null)) { writeFileSync(arg('--out'), out); console.log(out.split('\n').length, 'lines →', arg('--out')); } else console.log(out);
await b.close();
