// svg-dump.mjs — list every visible inline SVG on the live page with its container, box and markup head (icons are media to model).
import { chromium } from 'playwright';
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:1440,height:900}, userAgent: UA });
await p.goto(process.argv[2], { waitUntil:'domcontentloaded', timeout:90000 }); await p.waitForTimeout(3000);
const out = await p.evaluate(() => [...document.querySelectorAll('svg')].map((s) => { const r = s.getBoundingClientRect(); const par = s.parentElement; return { box: [Math.round(r.x), Math.round(r.y+scrollY), Math.round(r.width), Math.round(r.height)], vis: r.width>0, parent: `${par.tagName.toLowerCase()}.${[...par.classList].slice(0,3).join('.')}`, cls: s.getAttribute('class'), use: s.querySelector('use')?.getAttribute('href') || s.querySelector('use')?.getAttribute('xlink:href'), viewBox: s.getAttribute('viewBox'), fill: getComputedStyle(s).fill, color: getComputedStyle(s).color, len: s.outerHTML.length, head: s.outerHTML.replace(/\s+/g,' ').slice(0, 160) }; }));
const syms = await p.evaluate(() => [...document.querySelectorAll('symbol')].map((s) => `${s.id} vb=${s.getAttribute('viewBox')} len=${s.outerHTML.length}`));
console.log(JSON.stringify({ svgs: out, symbols: syms }, null, 1));
await b.close();
