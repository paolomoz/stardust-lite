#!/usr/bin/env node
// deep-probe.mjs — rect + paint of named selectors INCLUDING ::before/::after (box-shadow, borders, pseudo paint, radius, transforms):
// the paint tier live-spec does not read. Run it on the live page and on the prototype with the same list; curved edges, underlines and
// elevation shadows that exist only as pseudo-elements show up here and nowhere else. Up to 3 matches per selector. A selector may
// contain ` >> ` to descend into a shadow root (`c4d-card-group-item >> div.cds--tile`): web-component origins paint inside shadow
// roots, where light-DOM selectors read nothing (ibm-home).
// Usage: node deep-probe.mjs <url> <W> --sels <file-one-selector-per-line> [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--vh 900] [--max 3]
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { arg, openPage, settle, overlayOpts, DEEP_HELPERS } from './common.mjs';

const [,, url, wArg] = process.argv; const selsFile = arg('--sels');
if (!url || !wArg || !selsFile) { console.error('usage: deep-probe.mjs <url> <W> --sels <file> [--consent <css>] [--vh 900] [--max 3]'); process.exit(1); }
const W = Number(wArg); const MAX = Number(arg('--max', 3));
const sels = readFileSync(selsFile, 'utf8').split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#'));
const browser = await chromium.launch(); const page = await openPage(browser, url, { width: W, height: Number(arg('--vh', 900)), consent: arg('--consent', null), ...overlayOpts() });
await settle(page, 600, 100, 1200);
const out = await page.evaluate(new Function('args', `${DEEP_HELPERS}
 return (${String(([sels, MAX]) => {
  const R = (e) => { const r = e.getBoundingClientRect(); return `[${Math.round(r.x)},${Math.round(r.y + scrollY)},${Math.round(r.width)},${Math.round(r.height)}]`; };
  const SKIP = ['none', 'rgba(0, 0, 0, 0)', '0px', 'normal', 'static', 'auto', 'start', 'stretch', 'row', 'visible', 'flex-start', '0px none rgb(0, 0, 0)'];
  const P = (cs) => { const o = []; for (const [k, v] of [['bg', cs.backgroundColor], ['bgi', cs.backgroundImage], ['br', cs.borderRadius], ['bd', cs.border], ['bdt', cs.borderTop], ['bdb', cs.borderBottom], ['sh', cs.boxShadow], ['pad', cs.padding], ['mar', cs.margin], ['pos', cs.position], ['disp', cs.display], ['z', cs.zIndex], ['op', cs.opacity], ['tf', cs.transform], ['w', cs.width], ['h', cs.height], ['maxw', cs.maxWidth], ['gap', cs.gap], ['gtc', cs.gridTemplateColumns], ['jc', cs.justifyContent], ['ai', cs.alignItems], ['fd', cs.flexDirection], ['ff', cs.fontFamily.split(',')[0]], ['fs', cs.fontSize], ['fw', cs.fontWeight], ['lh', cs.lineHeight], ['ls', cs.letterSpacing], ['c', cs.color], ['ta', cs.textAlign], ['td', cs.textDecorationLine], ['ov', cs.overflow]]) { if (v && !SKIP.includes(v) && !/^0px none rgb/.test(v)) o.push(`${k}=${v}`); } return o.join(' '); };
  const lines = [];
  for (const sel of sels) {
    const els = queryDeep(sel).slice(0, MAX);
    if (!els.length) { lines.push(`${sel}: (none)`); continue; }
    for (const e of els) {
      lines.push(`${sel} ${R(e)} ${P(getComputedStyle(e))}`);
      for (const ps of ['::before', '::after']) { const cs = getComputedStyle(e, ps); if (cs.content !== 'none' && cs.content !== 'normal') lines.push(`   ${ps} content=${cs.content.slice(0, 40)} ${cs.width}x${cs.height} ${P(cs)} top=${cs.top} left=${cs.left} right=${cs.right} bottom=${cs.bottom}`); }
    }
  }
  return lines.join('\n');
})})(args);`), [sels, MAX]);
console.log(out); await browser.close();
