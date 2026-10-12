import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2], { waitUntil: 'load' }); await p.waitForTimeout(4000);
const r = await p.evaluate(() => { const h = document.querySelector('#cmpwrapper'); const sr = h && h.shadowRoot;
  if (!sr) return 'no shadow'; return [...sr.querySelectorAll('a,button')].slice(0, 12).map(e => `${e.tagName}#${e.id}.${[...e.classList].join('.')} "${e.textContent.trim().slice(0, 30)}"`); });
console.log(r); await b.close();
