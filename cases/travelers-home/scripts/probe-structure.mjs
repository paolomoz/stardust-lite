import { chromium } from 'playwright';
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const W = Number(process.argv[2]||1440);
const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:W,height:900}, userAgent: UA });
await p.goto('https://www.travelers.com/', { waitUntil:'domcontentloaded', timeout:90000 }); await p.waitForTimeout(3000);
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } window.scrollTo(0,0); await new Promise(r => setTimeout(r, 1500)); });
const out = await p.evaluate(() => {
  const sel = (el) => `${el.tagName.toLowerCase()}${el.id?'#'+el.id:''}${[...el.classList].slice(0,4).map(c=>'.'+c).join('')}`;
  const box = (el) => { const r = el.getBoundingClientRect(); return `x${Math.round(r.left)} y${Math.round(r.top+scrollY)} w${Math.round(r.width)} h${Math.round(r.height)}`; };
  const walk = (el, depth, max) => { const lines=[]; if (depth>max) return lines; const r=el.getBoundingClientRect(); if (r.height===0 && !['picture','source'].includes(el.tagName.toLowerCase())) return lines; const cs=getComputedStyle(el); const txt = el.children.length===0 ? ` "${el.textContent.trim().slice(0,70)}"` : ''; lines.push(`${'  '.repeat(depth)}${sel(el)} ${box(el)} bg=${cs.backgroundColor}${cs.backgroundImage!=='none'?' bgimg':''}${txt}`); for (const c of el.children) lines.push(...walk(c, depth+1, max)); return lines; };
  const lines = [];
  lines.push('== header'); lines.push(...walk(document.querySelector('header'), 0, 4));
  lines.push('== main'); for (const c of document.querySelector('main .tds-container').children) lines.push(...walk(c, 0, 3));
  lines.push('== footer'); lines.push(...walk(document.querySelector('footer'), 0, 3));
  return lines.join('\n');
});
console.log(out);
await b.close();
