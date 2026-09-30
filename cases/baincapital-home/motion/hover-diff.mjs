// hover-diff.mjs — deep hover diff: computed styles (incl ::before/::after) of the target's subtree + its parent's subtree, before/after a real hover.
import { chromium } from 'playwright'; import { writeFileSync } from 'node:fs';
const [,, out, ...sels] = process.argv;
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1440,height:900},userAgent:UA});
await p.goto('https://www.baincapital.com/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(3000); try { await p.click('.agree-button',{timeout:1500}); } catch {}
await p.addStyleTag({content:'*,*::before,*::after{transition-duration:0s!important;transition-delay:0s!important}'});
const PROPS=['color','background-color','background-image','background-size','background-position','border-color','border-bottom-color','border-width','opacity','transform','box-shadow','text-decoration-line','text-decoration-color','width','height','left','top','visibility','filter','outline-color','clip-path','content','font-weight','letter-spacing'];
const res={};
for (const sel of sels) {
  const ok = await p.evaluate((sel)=>{const e=document.querySelector(sel); if(!e) return false; e.scrollIntoView({block:'center'}); return true;},sel);
  if(!ok){ res[sel]={error:'not found'}; console.log(sel,'NOT FOUND'); continue; }
  await p.waitForTimeout(1500);
  const snap = (sel,PROPS)=>{const e=document.querySelector(sel); const root=e.parentElement||e; const els=[root,...root.querySelectorAll('*')].slice(0,400); const o={}; els.forEach((x,i)=>{const key=i+':'+x.tagName.toLowerCase()+(typeof x.className==='string'&&x.className?'.'+x.className.trim().split(/\s+/).slice(0,3).join('.'):''); for(const ps of ['',':before',':after']){const s=getComputedStyle(x,ps||null); if(ps && (s.content==='none'||s.content==='normal')) continue; for(const pr of PROPS){o[key+ps+'|'+pr]=s.getPropertyValue(pr);}}}); const r=e.getBoundingClientRect(); return {o,cx:r.x+r.width/2,cy:r.y+Math.min(r.height/2,20)};};
  await p.evaluate(`window.snapFn = ${snap.toString()}`);
  const before = await p.evaluate(({sel,PROPS})=>window.snapFn(sel,PROPS),{sel,PROPS});
  await p.mouse.move(before.cx, before.cy); await p.waitForTimeout(600);
  const after = await p.evaluate(({sel,PROPS})=>window.snapFn(sel,PROPS),{sel,PROPS});
  const diff=[]; for(const k of Object.keys(before.o)) if(before.o[k]!==after.o[k]) diff.push([k,String(before.o[k]).slice(0,80),String(after.o[k]).slice(0,80)]);
  // transitions declared on the target and its children
  const trans = await p.evaluate((sel)=>{const e=document.querySelector(sel); return [e,...e.querySelectorAll('*')].slice(0,12).map(x=>x.tagName.toLowerCase()+' '+getComputedStyle(x).transition).filter(t=>!/all 0s|none/.test(t));},sel);
  res[sel]={diff,trans};
  console.log('\n##',sel, diff.length,'changes; transitions:',trans.slice(0,4).join(' | '));
  diff.slice(0,40).forEach(d=>console.log('  ',d[0].padEnd(60),d[1],'→',d[2]));
  await p.mouse.move(5, 890); await p.waitForTimeout(400);
}
writeFileSync(out, JSON.stringify(res,null,1)); await b.close();
