import { chromium } from 'playwright';
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:1440,height:900}, userAgent: UA });
const r = await p.goto('https://www.travelers.com/', { waitUntil:'domcontentloaded', timeout:90000 });
console.log('status', r.status()); await p.waitForTimeout(4000);
const info = await p.evaluate(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width>0 && r.height>0 && cs.visibility!=='hidden' && cs.display!=='none'; };
  const fixed = [...document.querySelectorAll('body *')].filter(el => { const cs=getComputedStyle(el); return (cs.position==='fixed'||cs.position==='sticky') && vis(el); }).slice(0,30).map(el => `${el.tagName.toLowerCase()}#${el.id}.${[...el.classList].slice(0,3).join('.')} ${JSON.stringify(el.getBoundingClientRect().toJSON()).slice(0,90)} z=${getComputedStyle(el).zIndex}`);
  const consent = [...document.querySelectorAll('[id*=onetrust],[class*=onetrust],[id*=consent],[class*=consent],[id*=cookie],[class*=cookie],[class*=truste],[id*=truste]')].filter(vis).slice(0,10).map(el=>`${el.tagName.toLowerCase()}#${el.id}.${[...el.classList].slice(0,3).join('.')}`);
  const mainKids = [...(document.querySelector('main')||document.body).children].map(el=>`${el.tagName.toLowerCase()}#${el.id}.${[...el.classList].slice(0,4).join('.')} h=${Math.round(el.getBoundingClientRect().height)} y=${Math.round(el.getBoundingClientRect().top+scrollY)}`);
  return { title: document.title, h: document.documentElement.scrollHeight, fixed, consent, mainKids, hasMain: !!document.querySelector('main'), bodyKids: [...document.body.children].map(el=>`${el.tagName.toLowerCase()}#${el.id}.${[...el.classList].slice(0,3).join('.')} h=${Math.round(el.getBoundingClientRect().height)}`) };
});
console.log(JSON.stringify(info, null, 1));
await p.screenshot({ path: 'migration/cases/home/proto/probe-1440.png' });
await b.close();
