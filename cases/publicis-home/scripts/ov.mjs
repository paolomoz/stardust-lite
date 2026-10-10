import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('https://www.publicisgroupe.com/en/splash-en', { waitUntil: 'networkidle' }).catch(()=>{});
console.log(await p.evaluate(() => ['html','body','main#app'].map(s => { const e=document.querySelector(s), c=getComputedStyle(e); return `${s} pos=${c.position} ov=${c.overflow}/${c.overflowY} h=${c.height} top=${c.top} bottom=${c.bottom} sh=${e.scrollHeight} ch=${e.clientHeight}`; }).join('\n')));
await b.close();
