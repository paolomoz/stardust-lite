// icon-colors.mjs — for every visible sprite icon on the live page: computed color + fill, and whether the symbol paths carry their own fill.
import { chromium } from 'playwright';
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:1440,height:900}, userAgent: UA });
await p.goto('https://www.travelers.com/', { waitUntil:'domcontentloaded', timeout:90000 }); await p.waitForTimeout(3000);
console.log(await p.evaluate(() => [...document.querySelectorAll('svg')].filter((s) => s.getBoundingClientRect().width > 0).map((s) => { const cs = getComputedStyle(s); const use = s.querySelector('use'); const par = s.parentElement; return `${(use?.getAttribute('href') || 'inline').split('#').pop().padEnd(32)} color=${cs.color.padEnd(20)} fill=${cs.fill.padEnd(18)} parentColor=${getComputedStyle(par).color} parent=${par.tagName.toLowerCase()}.${[...par.classList].slice(0,2).join('.')}`; }).join('\n')));
await b.close();
