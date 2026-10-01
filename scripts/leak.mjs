#!/usr/bin/env node
// leak.mjs — computed layout of every wrapper a build emits (step 7). Run on the prototype and on the served page with the same
// selector list and diff the two outputs: every base-block property that survived the layer shows up in one pass.
// Usage: node leak.mjs <url> --sels <file-with-one-selector-per-line> [--width 1440] [--vh 900] [--consent <css>] [--dismiss <css,…>] [--locale <tag>]
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { arg, openPage, settle, overlayOpts } from './common.mjs';

const url = process.argv[2]; const selsFile = arg('--sels');
if (!url || !selsFile) { console.error('usage: leak.mjs <url> --sels <file> [--width 1440]'); process.exit(1); }
const SELS = readFileSync(selsFile, 'utf8').split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#'));
const browser = await chromium.launch(); const page = await openPage(browser, url, { width: Number(arg('--width', 1440)), height: Number(arg('--vh', 900)), wait: 800, ...overlayOpts() });
await settle(page, 800, 60, 400);
const rows = await page.evaluate((SELS) => SELS.map((sel) => {
  const e = document.querySelector(sel); if (!e) return `${sel.padEnd(70)} MISSING`;
  const r = e.getBoundingClientRect(); const s = getComputedStyle(e); const f = (k) => s[k];
  const parts = [`[${Math.round(r.x)},${Math.round(r.y + scrollY)},${Math.round(r.width)},${Math.round(r.height)}]`, f('display'), f('position') !== 'static' ? f('position') : '', f('padding') !== '0px' ? `pad=${f('padding')}` : '', f('margin') !== '0px' ? `mar=${f('margin')}` : '', f('gap') !== 'normal' ? `gap=${f('gap')}` : '', f('display').includes('grid') ? `cols=${f('gridTemplateColumns').split(' ').map((v) => Math.round(parseFloat(v))).join('|')}` : '', f('display').includes('flex') ? `dir=${f('flexDirection')}` : '', f('maxWidth') !== 'none' ? `maxw=${f('maxWidth')}` : '', f('minHeight') !== '0px' && f('minHeight') !== 'auto' ? `minh=${f('minHeight')}` : '', `${f('fontSize')}/${f('lineHeight')}`, f('fontWeight'), f('fontFamily').split(',')[0].replace(/"/g, '').slice(0, 8), f('color')];
  return `${sel.padEnd(70)} ${parts.filter(Boolean).join(' ')}`;
}), SELS);
rows.forEach((r) => console.log(r));
await browser.close();
