#!/usr/bin/env node
// click-state.mjs — click-state probe for what the frame sampler cannot see (class-toggled panels: dropdowns, mobile menus, tabs):
// click a selector, then dump the opened panel's structure with boxes, display, paint and fonts, and screenshot the viewport.
// Run it on live and on the build with the pair of selectors from the probes file.
// Usage: node click-state.mjs <url> <W> --click <css> --panel <css> [--shot <out.png>] [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--depth 7]
import { chromium } from 'playwright';
import { arg, openPage, overlayOpts } from './common.mjs';

const [,, url, wArg] = process.argv; const click = arg('--click'); const panel = arg('--panel');
if (!url || !wArg || !click || !panel) { console.error('usage: click-state.mjs <url> <W> --click <css> --panel <css> [--shot <out.png>] [--consent <css>] [--depth 7]'); process.exit(1); }
const W = Number(wArg); const depth = Number(arg('--depth', 7));
const browser = await chromium.launch(); const page = await openPage(browser, url, { width: W, height: 900, consent: arg('--consent', null), ...overlayOpts() });
await page.click(click); await page.waitForTimeout(1200);
if (arg('--shot', null)) await page.screenshot({ path: arg('--shot') });
console.log(await page.evaluate(([panel, depth]) => {
  const sel = (el) => `${el.tagName.toLowerCase()}${[...el.classList].slice(0, 3).map((c) => `.${c}`).join('')}`;
  const box = (el) => { const r = el.getBoundingClientRect(); return `[${Math.round(r.left)},${Math.round(r.top + scrollY)},${Math.round(r.width)},${Math.round(r.height)}]`; };
  const walk = (el, d) => { const L = []; if (d > depth) return L; const r = el.getBoundingClientRect(); if (r.width === 0 || r.height === 0) return L; const cs = getComputedStyle(el); const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim(); L.push(`${'  '.repeat(d)}${sel(el)} ${box(el)} ${cs.display}${cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ? ` bg=${cs.backgroundColor}` : ''}${cs.boxShadow !== 'none' ? ` sh=${cs.boxShadow.slice(0, 60)}` : ''}${parseFloat(cs.borderTopWidth) ? ` bdt=${cs.borderTop}` : ''}${parseFloat(cs.borderBottomWidth) ? ` bdb=${cs.borderBottom}` : ''}${cs.padding !== '0px' ? ` pad=${cs.padding}` : ''}${own ? ` ${cs.fontSize}/${cs.lineHeight} ${cs.fontWeight} ${cs.color} "${own.slice(0, 50)}"` : ''}${el.getAttribute('aria-expanded') ? ` aria-expanded=${el.getAttribute('aria-expanded')}` : ''}`); for (const c of el.children) L.push(...walk(c, d + 1)); return L; };
  const panels = [...document.querySelectorAll(panel)].filter((p) => { const r = p.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
  return (panels.length ? panels.map((p) => walk(p, 0).join('\n')).join('\n=====\n') : `(no visible panel for ${panel})`) + `\nbody.overflow=${getComputedStyle(document.body).overflow} scrollHeight=${document.documentElement.scrollHeight}`;
}, [panel, depth]));
await browser.close();
