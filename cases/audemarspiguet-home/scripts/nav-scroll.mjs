#!/usr/bin/env node
// nav-scroll.mjs — the fixed navigation's scroll states on www.audemarspiguet.com: `scroll-probe` reads the layer's class list and
// background (transparent at every step) but the bar's paint lives in a child (`.ap-react-navigation__scroll-bg`, a white sheet
// translated out of view at rest) and in the icon colour. Ladder down and up: class list, scroll-bg transform/opacity, icon colour,
// logo fill, bar height. Case template.
// Usage: node nav-scroll.mjs <url> [W] [--consent <css>] [--locale <tag>] [--dismiss <css,…>]
//        [--nav <css> --bg <css> --icon <css> --logo <css> --burger <css>]  (defaults: the live selectors; the build: --nav .nav --bg .nav-bg
//        --icon '.nav-tool svg' --logo '.nav-logo svg' --burger '.nav-toggle svg path')
import { chromium } from 'playwright';
import { openPage, arg, overlayOpts } from '../../../../node_modules/stardust-lite/scripts/common.mjs';

const url = process.argv[2]; const W = Number(process.argv[3] || 1440);
if (!url) { console.error('usage: nav-scroll.mjs <url> [W]'); process.exit(1); }
const b = await chromium.launch(); const p = await openPage(b, url, { width: W, consent: arg('--consent', null), ...overlayOpts(), wait: 4000 });
const SEL = { nav: arg('--nav', '.ap-react-navigation'), bar: arg('--bar', ''), bg: arg('--bg', '.ap-react-navigation__scroll-bg'), icon: arg('--icon', '.ap-react-navigation__top-hotlinks a svg'), logo: arg('--logo', '.ap-react-navigation__top-center-column svg'), burger: arg('--burger', '.ap-react-navigation__top-start-column svg path') };
const read = async (label) => {
  const r = await p.evaluate((S) => {
    const nav = document.querySelector(S.nav); const bg = nav.querySelector(S.bg);
    const icon = nav.querySelector(S.icon); const logo = nav.querySelector(S.logo); const burger = nav.querySelector(S.burger);
    const cs = (el) => (el ? getComputedStyle(el) : {});
    const bar = nav.querySelector(S.bar) || nav;
    return { y: scrollY, cls: [...nav.classList].filter((c) => c.includes('--') || c.startsWith('scrolled')).join(' '), navTop: Math.round(bar.getBoundingClientRect().top), navH: Math.round(bar.getBoundingClientRect().height), bgTransform: cs(bg).transform, bgTop: Math.round(bg.getBoundingClientRect().top), bgColor: cs(bg).backgroundColor, bgTransition: cs(bg).transition, iconColor: cs(icon).color, iconFill: cs(icon).fill, logoColor: cs(logo).color, logoFill: cs(logo).fill, burgerFill: cs(burger).fill, burgerStroke: cs(burger).stroke, navTransition: cs(bar).transition };
  }, SEL);
  console.log(label.padEnd(10), JSON.stringify(r));
};
await read('rest');
for (const y of [30, 60, 120, 300, 600, 1200]) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(700); await read(`down ${y}`); }
for (const y of [1100, 900, 600, 200, 60, 0]) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(700); await read(`up ${y}`); }
await p.evaluate(() => window.scrollTo(0, 2000)); await p.waitForTimeout(700); await read('down 2000'); await p.evaluate(() => window.scrollTo(0, 1990)); await p.waitForTimeout(100); await read('up 1990 +0.1s'); await p.waitForTimeout(600); await read('up 1990 +0.7s');
await b.close();
