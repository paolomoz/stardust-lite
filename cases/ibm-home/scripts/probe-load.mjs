// probe-load.mjs — first look at a live page: status, title, fixed layers, consent elements, main's children with boxes, body children.
// Usage: node probe-load.mjs <url> [W] [--headed] [--shot out.png]
import { chromium } from 'playwright';
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const url = process.argv[2]; const W = Number(process.argv[3] || 1440); const headed = process.argv.includes('--headed'); const shotI = process.argv.indexOf('--shot');
const b = await chromium.launch(headed ? { headless: false, channel: 'chrome', args: ['--disable-blink-features=AutomationControlled'] } : {});
const ctx = await b.newContext({ viewport:{width:W,height:900}, userAgent: UA, locale: 'en-US', extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' } });
const p = await ctx.newPage();
const r = await p.goto(url, { waitUntil:'domcontentloaded', timeout:90000 });
console.log('status', r.status(), 'url', p.url()); await p.waitForTimeout(5000);
const info = await p.evaluate(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width>0 && r.height>0 && cs.visibility!=='hidden' && cs.display!=='none'; };
  const sel = (el) => `${el.tagName.toLowerCase()}${el.id?'#'+el.id:''}${[...el.classList].slice(0,3).map(c=>'.'+c).join('')}`;
  const fixed = [...document.querySelectorAll('body *')].filter(el => { const cs=getComputedStyle(el); return (cs.position==='fixed'||cs.position==='sticky') && vis(el); }).slice(0,30).map(el => `${sel(el)} ${JSON.stringify(el.getBoundingClientRect().toJSON()).slice(0,90)} z=${getComputedStyle(el).zIndex}`);
  const consent = [...document.querySelectorAll('[id*=onetrust],[class*=onetrust],[id*=consent],[class*=consent],[id*=cookie],[class*=cookie],[class*=truste],[id*=truste],[id*=privacy],[class*=privacy]')].filter(vis).slice(0,12).map(el=>`${sel(el)} ${JSON.stringify(el.getBoundingClientRect().toJSON()).slice(0,80)}`);
  const kids = (root) => [...root.children].map(el=>`${sel(el)} y=${Math.round(el.getBoundingClientRect().top+scrollY)} h=${Math.round(el.getBoundingClientRect().height)} w=${Math.round(el.getBoundingClientRect().width)}`);
  const main = document.querySelector('main');
  return { title: document.title, h: document.documentElement.scrollHeight, fixed, consent, hasMain: !!main, mainKids: main ? kids(main) : [], bodyKids: kids(document.body), header: document.querySelector('header') ? sel(document.querySelector('header')) : null, footer: document.querySelector('footer') ? sel(document.querySelector('footer')) : null, lang: document.documentElement.lang, shadowHosts: [...document.querySelectorAll('*')].filter(e=>e.shadowRoot).length, customTags: [...new Set([...document.querySelectorAll('*')].map(e=>e.tagName.toLowerCase()).filter(t=>t.includes('-')))].slice(0,60) };
});
console.log(JSON.stringify(info, null, 1));
if (shotI > 0) await p.screenshot({ path: process.argv[shotI+1] });
await b.close();
