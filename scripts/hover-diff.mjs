#!/usr/bin/env node
// hover-diff.mjs — deep hover diff: hover the first VISIBLE match of each selector and report every computed-style change on the element,
// its descendants (up to 80, through shadow roots) and their ::before/::after — 20 properties. The frame sampler in motion-observe reads
// the element only and calls a `::before` underline or a child colour change "dead"; this does not. Playwright's selectors pierce
// shadow roots, so `c4d-card-group-item div.cds--tile` hovers the inner tile of a web component (ibm-home). Run it on live and on the
// build with paired selectors.
// Usage: node hover-diff.mjs <url> <out.json> [--width 1440] [--consent <css>] [--dismiss <css,…>] [--locale <tag>] --sel <css> [--sel <css> …]
import { writeFileSync } from 'node:fs';
import { arg, openPage, overlayOpts, DEEP_HELPERS, launch } from './common.mjs';

const [,, url, out] = process.argv; const W = Number(arg('--width', 1440));
const sels = process.argv.flatMap((a, i) => (a === '--sel' ? [process.argv[i + 1]] : []));
if (!url || !out || !sels.length) { console.error('usage: hover-diff.mjs <url> <out.json> [--width 1440] [--consent <css>] --sel <css> [--sel <css> …]'); process.exit(1); }
const browser = await launch(); const page = await openPage(browser, url, { width: W, height: 900, ...overlayOpts() });
await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
const PROPS = ['color', 'background-color', 'background-image', 'border-color', 'border-top-color', 'border-bottom-color', 'box-shadow', 'text-decoration-line', 'text-decoration-color', 'opacity', 'transform', 'scale', 'outline-color', 'outline-width', 'fill', 'stroke', 'visibility', 'display', 'width', 'height'];
const snap = (el) => el.evaluate(new Function('root', 'PROPS', `${DEEP_HELPERS}
  const rows = {};
  const read = (e, key) => { for (const ps of ['', '::before', '::after']) { const cs = getComputedStyle(e, ps || null); if (ps && (cs.content === 'none' || cs.content === 'normal')) continue; for (const pr of PROPS) rows[key + ps + '|' + pr] = cs.getPropertyValue(pr); } };
  read(root, 'self');
  const kids = root.shadowRoot ? [...allDeep(root.shadowRoot), ...allDeep(root)] : allDeep(root);
  kids.slice(0, 80).forEach((e, i) => read(e, e.tagName.toLowerCase() + '.' + [...e.classList].slice(0, 2).join('.') + '#' + i));
  return rows;`), PROPS);
const result = [];
for (const sel of sels) {
  let el = null;
  for (const cand of await page.$$(sel)) { const box = await cand.boundingBox(); if (box && box.width > 0 && box.height > 0) { el = cand; break; } }
  if (!el) { result.push({ sel, error: 'no visible match' }); console.log(`${sel}: NO VISIBLE MATCH`); continue; }
  await el.scrollIntoViewIfNeeded().catch(() => {}); await page.mouse.move(0, 0); await page.waitForTimeout(150);
  const before = await snap(el);
  // a fixed bar that hides on scroll can be "outside the viewport" for Playwright's hover: fall back to the pointer at the box centre
  try { await el.hover({ timeout: 4000 }); } catch { const bb = await el.boundingBox(); if (bb) await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); }
  await page.waitForTimeout(300);
  const after = await snap(el);
  await page.mouse.move(0, 0);
  const changes = Object.keys(before).filter((k) => before[k] !== after[k]).map((k) => `${k}: ${before[k]} → ${after[k]}`);
  result.push({ sel, changes });
  console.log(`${sel}: ${changes.length ? '' : 'no change'}`); changes.forEach((c) => console.log(`   ${c}`));
}
writeFileSync(out, JSON.stringify(result, null, 1)); await browser.close();
