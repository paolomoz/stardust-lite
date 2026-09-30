// btt-ladder.mjs — scroll ladder down and up reading the back-to-top layer's class list and opacity (motion-observe saw
// `u-anim-fadein` added at its first sample, 1200; the threshold is below). usage: node btt-ladder.mjs <url> [--sel <css>] [--consent <css>] [--locale <tag>]
import { chromium } from 'playwright';
import { arg, openPage, overlayOpts } from '../../../scripts/common.mjs';
const url = process.argv[2]; const sel = arg('--sel', '.c-back-to-top');
const browser = await chromium.launch();
const page = await openPage(browser, url, { width: 1440, consent: arg('--consent', null), ...overlayOpts() });
const read = async (y) => page.evaluate(({ s, y }) => { window.scrollTo(0, y); return new Promise((r) => setTimeout(() => { const el = document.querySelector(s); const a = el && (el.querySelector('a') || el); const cs = a && getComputedStyle(a); r(`y ${String(y).padStart(5)} scrollY ${window.scrollY} cls="${el ? el.className : 'none'}" opacity ${cs ? cs.opacity : '-'} display ${cs ? cs.display : '-'} rect ${a ? JSON.stringify(a.getBoundingClientRect().toJSON()) : '-'}`); }, 400)); }, { s: sel, y });
for (const y of [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1500, 2000]) console.log(await read(y));
for (const y of [1000, 600, 400, 200, 100, 0]) console.log('up', await read(y));
await browser.close();
