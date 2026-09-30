#!/usr/bin/env node
// hover-diff.mjs — deep hover diff: hover the first VISIBLE match of each selector and report every computed-style change on the element,
// its descendants (up to 60) and their ::before/::after — 19 properties. The frame sampler in motion-observe reads the element only and
// calls a `::before` underline or a child colour change "dead"; this does not. Run it on live and on the build with paired selectors.
// Usage: node hover-diff.mjs <url> <out.json> [--width 1440] [--consent <css>] --sel <css> [--sel <css> …]
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { arg, openPage } from './common.mjs';

const [,, url, out] = process.argv; const W = Number(arg('--width', 1440));
const sels = process.argv.flatMap((a, i) => (a === '--sel' ? [process.argv[i + 1]] : []));
if (!url || !out || !sels.length) { console.error('usage: hover-diff.mjs <url> <out.json> [--width 1440] [--consent <css>] --sel <css> [--sel <css> …]'); process.exit(1); }
const browser = await chromium.launch(); const page = await openPage(browser, url, { width: W, height: 900, consent: arg('--consent', null) });
await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
const PROPS = ['color', 'background-color', 'background-image', 'border-color', 'border-top-color', 'border-bottom-color', 'box-shadow', 'text-decoration-line', 'text-decoration-color', 'opacity', 'transform', 'outline-color', 'outline-width', 'fill', 'stroke', 'visibility', 'display', 'width', 'height'];
const snap = (sel, idx) => page.evaluate(([sel, PROPS, idx]) => {
  const root = document.querySelectorAll(sel)[idx]; if (!root) return null;
  const rows = {};
  const read = (el, key) => { for (const ps of ['', '::before', '::after']) { const cs = getComputedStyle(el, ps || null); if (ps && (cs.content === 'none' || cs.content === 'normal')) continue; for (const pr of PROPS) rows[`${key}${ps}|${pr}`] = cs.getPropertyValue(pr); } };
  read(root, 'self');
  [...root.querySelectorAll('*')].slice(0, 60).forEach((el, i) => read(el, `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 2).join('.')}#${i}`));
  return rows;
}, [sel, PROPS, idx]);
const result = [];
for (const sel of sels) {
  let el = null;
  for (const cand of await page.$$(sel)) { const box = await cand.boundingBox(); if (box && box.width > 0 && box.height > 0) { el = cand; break; } }
  if (!el) { result.push({ sel, error: 'no visible match' }); console.log(`${sel}: NO VISIBLE MATCH`); continue; }
  await el.scrollIntoViewIfNeeded(); await page.mouse.move(0, 0); await page.waitForTimeout(150);
  const idx = await el.evaluate((node, sel) => [...document.querySelectorAll(sel)].indexOf(node), sel);
  const before = await snap(sel, idx);
  await el.hover(); await page.waitForTimeout(300);
  const after = await snap(sel, idx);
  await page.mouse.move(0, 0);
  const changes = Object.keys(before).filter((k) => before[k] !== after[k]).map((k) => `${k}: ${before[k]} → ${after[k]}`);
  result.push({ sel, changes });
  console.log(`${sel}: ${changes.length ? '' : 'no change'}`); changes.forEach((c) => console.log(`   ${c}`));
}
writeFileSync(out, JSON.stringify(result, null, 1)); await browser.close();
