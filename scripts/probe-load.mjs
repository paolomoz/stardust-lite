#!/usr/bin/env node
// probe-load.mjs — the first look at a live page BEFORE any overlay is dismissed: HTTP status and final URL, title, lang, fixed/sticky
// layers, consent/privacy candidates, shadow-root count and custom tags (a web-components origin needs the composed-tree tier),
// header/footer/main and their children with boxes. Written for travelers-home, reused by ibm-home and walgreens-home.
// W may be a list (`360,1440,2560`): a layer fixed at the base width may scroll at 360 (a 244 px header, fixed at ≥ 900 only, was
// built fixed at 360 too — 20 % of the 360 number for two rounds, usta2-home). Run it at every gated width.
// Usage: node probe-load.mjs <url> [W[,W…]] [--headed] [--locale <tag>] [--shot out.png]
import { chromium } from 'playwright';
import { UA, arg } from './common.mjs';

const url = process.argv[2]; const widths = String(process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : 1440).split(',').map(Number);
if (!url) { console.error('usage: probe-load.mjs <url> [W[,W…]] [--headed] [--locale <tag>] [--shot out.png]'); process.exit(1); }
const headed = process.argv.includes('--headed'); const locale = arg('--locale', null);
const b = await chromium.launch(headed ? { headless: false, channel: 'chrome', args: ['--disable-blink-features=AutomationControlled'] } : {});
for (const W of widths) {
if (widths.length > 1) console.log(`\n=== W ${W}`);
const p = await b.newPage({ viewport: { width: W, height: 900 }, userAgent: UA, ...(locale ? { locale, extraHTTPHeaders: { 'Accept-Language': `${locale},${locale.split('-')[0]};q=0.9` } } : {}) });
const r = await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
console.log('status', r.status(), 'url', p.url()); await p.waitForTimeout(5000);
const info = await p.evaluate(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const sel = (el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${[...el.classList].slice(0, 3).map((c) => '.' + c).join('')}`;
  const box = (el) => { const r = el.getBoundingClientRect(); return `[${Math.round(r.left)},${Math.round(r.top + scrollY)},${Math.round(r.width)},${Math.round(r.height)}]`; };
  const fixed = [...document.querySelectorAll('body *')].filter((el) => { const cs = getComputedStyle(el); return (cs.position === 'fixed' || cs.position === 'sticky') && vis(el); }).slice(0, 30).map((el) => `${sel(el)} ${box(el)} z=${getComputedStyle(el).zIndex}`);
  const consent = [...document.querySelectorAll('[id*=onetrust],[class*=onetrust],[id*=consent],[class*=consent],[id*=cookie],[class*=cookie],[class*=truste],[id*=truste],[id*=privacy],[class*=privacy],[role=dialog],[aria-modal=true]')].filter(vis).slice(0, 12).map((el) => `${sel(el)} ${box(el)}`);
  const kids = (root) => [...root.children].map((el) => `${sel(el)} ${box(el)}`);
  const main = document.querySelector('main');
  return { title: document.title, lang: document.documentElement.lang, h: document.documentElement.scrollHeight, fixed, overlays: consent, hasMain: !!main, mainKids: main ? kids(main) : [], bodyKids: kids(document.body), header: document.querySelector('header') ? sel(document.querySelector('header')) : null, footer: document.querySelector('footer') ? sel(document.querySelector('footer')) : null, shadowHosts: [...document.querySelectorAll('*')].filter((e) => e.shadowRoot).length, customTags: [...new Set([...document.querySelectorAll('*')].map((e) => e.tagName.toLowerCase()).filter((t) => t.includes('-')))].slice(0, 60) };
});
console.log(JSON.stringify(info, null, 1));
if (!info.fixed.length) console.log(`no fixed or sticky layer at ${W}`);
if (arg('--shot', null)) await p.screenshot({ path: widths.length > 1 ? arg('--shot').replace(/(\.\w+)?$/, `-${W}$1`) : arg('--shot') });
await p.close();
}
await b.close();
