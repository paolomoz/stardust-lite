#!/usr/bin/env node
// scroll-probe.mjs — how a page changes with scroll (prerequisite for scroll-driven sites): at a scroll ladder, the computed
// background-color/opacity/background-image of named layers, the class list + height of the header, and the transform of named
// elements. Prints one line per change so thresholds and scroll-linked functions can be read off.
// Usage: node scroll-probe.mjs <url> [--width 1440] [--vh 900] [--step 20] [--max 9000] [--layers <css,…>] [--header <css>]
//        [--track <css,…>] [--consent <css>] [--dismiss <css,…>] [--locale <tag>]
import { chromium } from 'playwright';
import { arg, openPage, overlayOpts } from './common.mjs';

const url = process.argv[2]; if (!url) { console.error('usage: scroll-probe.mjs <url> [--layers <css,…>] [--header <css>] [--track <css,…>]'); process.exit(1); }
const W = Number(arg('--width', 1440)); const vh = Number(arg('--vh', 900)); const step = Number(arg('--step', 20)); const max = Number(arg('--max', 9000));
const layers = String(arg('--layers', '')).split(',').filter(Boolean); const header = arg('--header', 'header'); const track = String(arg('--track', '')).split(',').filter(Boolean);
const browser = await chromium.launch(); const page = await openPage(browser, url, { width: W, height: vh, consent: arg('--consent', null), ...overlayOpts() });
let prev = '';
for (let y = 0; y <= max; y += step) {
  await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(350);
  const r = await page.evaluate(({ layers, header, track }) => {
    const q = (s) => document.querySelector(s);
    const L = layers.map((s) => { const e = q(s); if (!e) return `${s}:MISSING`; const c = getComputedStyle(e); return `${s}:${c.backgroundColor} op${c.opacity}${c.backgroundImage !== 'none' ? ` img:${c.backgroundImage.split('/').pop().slice(0, 30)}` : ''}`; });
    const h = q(header); const H = h ? `header[${h.className}] h=${Math.round(h.getBoundingClientRect().height)} top=${getComputedStyle(h).top}` : 'header:MISSING';
    const T = track.map((s) => [...document.querySelectorAll(s)].slice(0, 3).map((e) => { const m = getComputedStyle(e).transform.match(/matrix\(([^)]+)\)/); const ty = m ? Math.round(parseFloat(m[1].split(',')[5])) : 0; return `${s} top=${Math.round(e.getBoundingClientRect().top)} ty=${ty}`; }).join(' ; '));
    return { key: [...L, H].join(' | '), line: [...L, H, ...T].join(' | '), sy: scrollY };
  }, { layers, header, track });
  if (r.key !== prev || track.length) console.log('y', String(r.sy).padStart(5), r.line);
  prev = r.key;
  if (r.sy < y - 5) break; // bottom reached
}
await browser.close();
