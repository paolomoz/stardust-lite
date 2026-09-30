// probe-structure.mjs — composed-tree dump (pierces shadow roots) of a live page: tag/id/classes, box, bg, own text, per element to a depth.
// Usage: node probe-structure.mjs <url> [W] [--root <css>] [--depth N] [--consent <css>] [--dismiss <css>] [--click <css> --no-settle] [--pierce] [--out file]
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const arg = (n, d) => { const i = process.argv.indexOf(n); return i < 0 ? d : (process.argv[i+1] ?? true); };
const url = process.argv[2]; const W = Number(process.argv[3] || 1440); const depth = Number(arg('--depth', 4)); const root = arg('--root', 'body'); const pierce = process.argv.includes('--pierce');
const b = await chromium.launch(); const ctx = await b.newContext({ viewport:{width:W,height:900}, userAgent: UA, locale: 'en-US', extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' } });
const p = await ctx.newPage();
await p.goto(url, { waitUntil:'domcontentloaded', timeout:90000 }); await p.waitForTimeout(4000);
for (const s of [arg('--consent', null), arg('--dismiss', null)].filter(Boolean)) { try { await p.click(s, { timeout: 2000 }); console.log('clicked', s); } catch { console.log('no click', s); } }
if (arg('--click', null)) { await p.waitForTimeout(1500); try { await p.click(arg('--click'), { timeout: 3000 }); console.log('clicked', arg('--click')); await p.waitForTimeout(1500); } catch (e) { console.log('no click', arg('--click'), String(e).slice(0, 80)); } }
if (arg('--no-settle', false)) { /* keep the opened state */ } else
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } window.scrollTo(0,0); await new Promise(r => setTimeout(r, 1500)); });
const out = await p.evaluate(({ root, depth, pierce }) => {
  const sel = (el) => `${el.tagName.toLowerCase()}${el.id?'#'+el.id:''}${[...el.classList].slice(0,4).map(c=>'.'+c).join('')}${el.getAttribute('slot')?'[slot='+el.getAttribute('slot')+']':''}`;
  const box = (el) => { const r = el.getBoundingClientRect(); return `x${Math.round(r.left)} y${Math.round(r.top+scrollY)} w${Math.round(r.width)} h${Math.round(r.height)}`; };
  const kids = (el) => pierce && el.shadowRoot ? [...el.shadowRoot.children, ...el.children] : [...el.children];
  const walk = (el, d, max, fromShadow) => { const lines=[]; if (d>max) return lines; if (['script','style','link','template'].includes(el.tagName.toLowerCase())) return lines; const r=el.getBoundingClientRect(); if (r.height===0 && r.width===0 && !el.shadowRoot && getComputedStyle(el).display!=='contents' && !['picture','source','slot'].includes(el.tagName.toLowerCase())) return lines; const cs=getComputedStyle(el); const own=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).filter(Boolean).join(' '); const txt = own ? ` "${own.slice(0,80)}"` : ''; const bgi = cs.backgroundImage!=='none' ? ' bgimg' : ''; const src = el.tagName==='IMG' ? ` src=${(el.currentSrc||el.src||'').slice(0,90)}` : ''; lines.push(`${'  '.repeat(d)}${fromShadow?'#':''}${sel(el)} ${box(el)} ${cs.display}${cs.position!=='static'?' '+cs.position:''} bg=${cs.backgroundColor}${bgi}${src}${own?` ${cs.fontSize}/${cs.lineHeight} ${cs.fontWeight} ${cs.color}`:''}${txt}`); if (el.shadowRoot && pierce) for (const c of el.shadowRoot.children) lines.push(...walk(c, d+1, max, true)); for (const c of el.children) lines.push(...walk(c, d+1, max, false)); return lines; };
  const r = document.querySelector(root); if (!r) return `no ${root}`;
  return `doc ${document.documentElement.scrollHeight}\n` + walk(r, 0, depth, false).join('\n');
}, { root, depth, pierce });
if (arg('--out', null)) writeFileSync(arg('--out'), out); console.log(out.split('\n').length, 'lines'); if (!arg('--out', null)) console.log(out);
await b.close();
