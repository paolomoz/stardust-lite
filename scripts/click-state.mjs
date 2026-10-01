#!/usr/bin/env node
// click-state.mjs — click-state probe for what the frame sampler cannot see (class-toggled panels: dropdowns, mobile menus, tabs):
// click a selector, then dump the opened panel's structure with boxes, display, paint and fonts, and screenshot the viewport.
// Run it on live and on the build with the pair of selectors from the probes file. A control that opens on hover and toggles on click
// closes on the click this probe makes ("no visible panel" was the only output — usta2-home): pass --hover to hover it first, and read
// the control's aria-expanded that is printed after the click. A control inside a closed panel needs the opener first: repeat --click
// (`--click <opener> --click <item>`), the clicks run in order and the panel is dumped after the last (a drawer item's sub-panel
// could not be reached with one click — hiltongrandvacations-home). A panel that opens on hover only, whose click navigates or whose
// toggle is visually hidden to mouse users, takes `--hover <css>` with no `--click`: the probe hovers and dumps (it waited the 8 s click
// timeout before printing the panel it had already opened — marriottvacationsworldwide-home).
// Usage: node click-state.mjs <url> <W> [--click <css> [--click <css> …]] --panel <css> [--hover [<css>]] [--shot <out.png>] [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--depth 7]
import { chromium } from 'playwright';
import { arg, openPage, overlayOpts } from './common.mjs';

const [,, url, wArg] = process.argv; const panel = arg('--panel');
const clicks = process.argv.map((a, i, all) => (a === '--click' ? all[i + 1] : null)).filter((v) => v && !v.startsWith('--'));
const hover = arg('--hover', null);
if (!url || !wArg || !panel || (!clicks.length && typeof hover !== 'string')) { console.error('usage: click-state.mjs <url> <W> [--click <css> …] --panel <css> [--hover [<css>]] (--hover <css> alone: hover, no click) [--shot <out.png>] [--consent <css>] [--depth 7]'); process.exit(1); }
const W = Number(wArg); const depth = Number(arg('--depth', 7)); const click = clicks.length ? clicks[clicks.length - 1] : hover;
const browser = await chromium.launch(); const page = await openPage(browser, url, { width: W, height: 900, ...overlayOpts() });
if (hover) { await page.hover(hover === true ? clicks[0] : hover); await page.waitForTimeout(600); }
for (const c of clicks) {
  try { await page.click(c, { timeout: 8000 }); } catch (e) { console.log(`click-state: click ${c} failed — ${e.message.split('\n')[0]}`); }
  await page.waitForTimeout(1200);
  if (clicks.length > 1) console.log(`click-state: clicked ${c}`);
}
if (arg('--shot', null)) await page.screenshot({ path: arg('--shot') });
console.log(await page.evaluate(([panel, depth, click, hovered]) => {
  const sel = (el) => `${el.tagName.toLowerCase()}${[...el.classList].slice(0, 3).map((c) => `.${c}`).join('')}`;
  const box = (el) => { const r = el.getBoundingClientRect(); return `[${Math.round(r.left)},${Math.round(r.top + scrollY)},${Math.round(r.width)},${Math.round(r.height)}]`; };
  const walk = (el, d) => { const L = []; if (d > depth) return L; const r = el.getBoundingClientRect(); if (r.width === 0 || r.height === 0) return L; const cs = getComputedStyle(el); const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim(); L.push(`${'  '.repeat(d)}${sel(el)} ${box(el)} ${cs.display}${cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ? ` bg=${cs.backgroundColor}` : ''}${cs.boxShadow !== 'none' ? ` sh=${cs.boxShadow.slice(0, 60)}` : ''}${parseFloat(cs.borderTopWidth) ? ` bdt=${cs.borderTop}` : ''}${parseFloat(cs.borderBottomWidth) ? ` bdb=${cs.borderBottom}` : ''}${cs.padding !== '0px' ? ` pad=${cs.padding}` : ''}${own ? ` ${cs.fontSize}/${cs.lineHeight} ${cs.fontWeight} ${cs.color} "${own.slice(0, 50)}"` : ''}${el.getAttribute('aria-expanded') ? ` aria-expanded=${el.getAttribute('aria-expanded')}` : ''}`); for (const c of el.children) L.push(...walk(c, d + 1)); return L; };
  const panels = [...document.querySelectorAll(panel)].filter((p) => { const r = p.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
  const ctl = document.querySelector(click); const exp = ctl ? ctl.getAttribute('aria-expanded') : null;
  const state = `control ${click}: aria-expanded=${exp}${!panels.length && exp === 'false' && !hovered ? ' — closed after the click: a hover-opened control toggles shut on click, run again with --hover' : ''}`;
  return (panels.length ? panels.map((p) => walk(p, 0).join('\n')).join('\n=====\n') : `(no visible panel for ${panel})`) + `\n${state}\nbody.overflow=${getComputedStyle(document.body).overflow} scrollHeight=${document.documentElement.scrollHeight}`;
}, [panel, depth, click, !!hover]));
await browser.close();
