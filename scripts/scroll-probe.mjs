#!/usr/bin/env node
// scroll-probe.mjs — how a page changes with scroll (prerequisite for scroll-driven sites): at a scroll ladder, the class list,
// computed background-color/opacity/background-image of named layers, the class list + height of the header, and the transform of
// named elements. Prints one line per change so thresholds and scroll-linked functions can be read off. `--up` climbs the same ladder
// back to the top afterwards: a back-to-top layer or a hide-on-scroll masthead has states that exist only on the way up (stryker-home).
// `--paint <css,…>`: the colour / fill / transform / opacity of named CHILDREN at every step — a bar's paint may live in a child sheet
// translated out of view and in its glyph colour while the layer itself stays transparent (audemarspiguet-home wrote `nav-scroll.mjs` for it).
// Usage: node scroll-probe.mjs <url> [--width 1440] [--vh 900] [--step 20] [--max 9000] [--layers <css,…>] [--header <css>]
//        [--track <css,…>] [--paint <css,…>] [--up] [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--require <css,…>]
import { arg, openPage, overlayOpts, launch } from './common.mjs';

const url = process.argv[2]; if (!url) { console.error('usage: scroll-probe.mjs <url> [W] [--width 1440] [--layers <css,…>] [--header <css>] [--track <css,…>] [--paint <css,…>] [--up]'); process.exit(1); }
const posW = process.argv[3] && /^\d+$/.test(process.argv[3]) ? Number(process.argv[3]) : null; // `<url> 360` like every other instrument (a positional 360 was silently read at 1440 — scotiabank-personal)
const W = Number(arg('--width', posW || 1440)); const vh = Number(arg('--vh', 900)); const step = Number(arg('--step', 20)); const max = Number(arg('--max', 9000));
const layers = String(arg('--layers', '')).split(',').filter(Boolean); const header = arg('--header', 'header'); const track = String(arg('--track', '')).split(',').filter(Boolean); const paint = String(arg('--paint', '')).split(',').filter(Boolean);
const browser = await launch(); const page = await openPage(browser, url, { width: W, height: vh, ...overlayOpts() });
let prev = ''; let prevSy = -1; let bottom = 0;
const sample = async (y, tag) => {
  await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(350);
  const r = await page.evaluate(({ layers, header, track, paint }) => {
    const q = (s) => document.querySelector(s);
    // the layer's class list too: a back-to-top button toggles a class and fades (its opacity is the threshold, the class the trigger)
    const L = layers.map((s) => { const e = q(s); if (!e) return `${s}:MISSING`; const c = getComputedStyle(e); return `${s}[${e.className}]:${c.backgroundColor} op${c.opacity}${c.display === 'none' ? ' none' : ''}${c.backgroundImage !== 'none' ? ` img:${c.backgroundImage.split('/').pop().slice(0, 30)}` : ''}`; });
    const h = q(header); const H = h ? `header[${h.className}] h=${Math.round(h.getBoundingClientRect().height)} top=${getComputedStyle(h).top}` : 'header:MISSING';
    const T = track.map((s) => [...document.querySelectorAll(s)].slice(0, 3).map((e) => { const m = getComputedStyle(e).transform.match(/matrix\(([^)]+)\)/); const ty = m ? Math.round(parseFloat(m[1].split(',')[5])) : 0; return `${s} top=${Math.round(e.getBoundingClientRect().top)} ty=${ty}`; }).join(' ; '));
    const P = paint.map((s) => { const e = q(s); if (!e) return `${s}:MISSING`; const c = getComputedStyle(e); const m = c.transform.match(/matrix\(([^)]+)\)/); const ty = m ? Math.round(parseFloat(m[1].split(',')[5])) : 0; return `${s}:${c.color}${c.fill && c.fill !== 'none' && c.fill !== c.color ? ` fill:${c.fill}` : ''}${!/rgba\(0, 0, 0, 0\)/.test(c.backgroundColor) ? ` bg:${c.backgroundColor}` : ''} op${c.opacity}${ty ? ` ty=${ty}` : ''}${c.display === 'none' ? ' none' : ''}`; });
    return { key: [...L, H, ...P].join(' | '), line: [...L, H, ...P, ...T].join(' | '), sy: scrollY };
  }, { layers, header, track, paint });
  if (r.key !== prev || track.length) console.log(tag, 'y', String(r.sy).padStart(5), r.line);
  prev = r.key; return r.sy;
};
for (let y = 0; y <= max; y += step) {
  const sy = await sample(y, 'down');
  // bottom reached: scrollY stopped short of the target AND did not move since the previous step (one short sample is not the bottom —
  // a page that reloads or scrolls smoothly gave one row and a stop)
  if (sy < y - 2 * step && sy === prevSy) break;
  prevSy = sy; bottom = sy;
}
if (arg('--up', false)) { prev = ''; for (let y = bottom; y >= 0; y -= step) await sample(y, 'up  '); }
await browser.close();
