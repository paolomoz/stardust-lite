// shadow-hover.mjs — deep hover diff through shadow roots: hover the first visible match of each (Playwright, shadow-piercing) selector,
// diff 20 computed properties on the element, its composed-tree descendants (up to 80) and their ::before/::after. Live or build.
// Usage: node shadow-hover.mjs <url> <out.json> [--width 1440] [--consent <css>] [--dismiss <css>] --sel <css> [--sel <css> …]
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const arg = (n, d) => { const i = process.argv.indexOf(n); return i < 0 ? d : (process.argv[i+1] ?? true); };
const [,, url, out] = process.argv; const W = Number(arg('--width', 1440));
const sels = process.argv.flatMap((a, i) => (a === '--sel' ? [process.argv[i + 1]] : []));
const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:W,height:900}, userAgent: UA, locale: 'en-US' });
await p.goto(url, { waitUntil:'domcontentloaded', timeout:90000 }); await p.waitForTimeout(3500);
for (const s of [arg('--consent', null), arg('--dismiss', null)].filter(Boolean)) { try { await p.click(s, { timeout: 2000 }); } catch {} }
await p.waitForFunction(() => [...document.querySelectorAll('.block')].every((el) => el.dataset.blockStatus === 'loaded'), null, { timeout: 15000 }).catch(() => {});
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } window.scrollTo(0,0); await new Promise(r => setTimeout(r, 800)); });
await p.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
const PROPS = ['color', 'background-color', 'background-image', 'border-color', 'border-top-color', 'border-bottom-color', 'box-shadow', 'text-decoration-line', 'outline-color', 'outline-width', 'opacity', 'transform', 'scale', 'fill', 'stroke', 'visibility', 'display', 'width', 'height', 'translate'];
const snap = (el) => el.evaluate((root, PROPS) => {
  const rows = {}; const read = (e, key) => { for (const ps of ['', '::before', '::after']) { const cs = getComputedStyle(e, ps || null); if (ps && (cs.content === 'none' || cs.content === 'normal')) continue; for (const pr of PROPS) rows[`${key}${ps}|${pr}`] = cs.getPropertyValue(pr); } };
  const all = []; const walk = (r) => { for (const e of r.querySelectorAll('*')) { all.push(e); if (e.shadowRoot) walk(e.shadowRoot); } }; if (root.shadowRoot) walk(root.shadowRoot); walk(root);
  read(root, 'self'); all.slice(0, 80).forEach((e, i) => read(e, `${e.tagName.toLowerCase()}.${[...e.classList].slice(0, 2).join('.')}#${i}`)); return rows; }, PROPS);
const result = [];
for (const sel of sels) {
  let el = null; for (const cand of await p.locator(sel).all()) { const box = await cand.boundingBox().catch(() => null); if (box && box.width > 0 && box.height > 0) { el = cand; break; } }
  if (!el) { result.push({ sel, error: 'no visible match' }); console.log(`${sel}: NO VISIBLE MATCH`); continue; }
  await el.scrollIntoViewIfNeeded().catch(() => {}); await p.mouse.wheel(0, -200); await p.waitForTimeout(200); await p.mouse.move(0, 899); await p.waitForTimeout(150);
  const before = await snap(el); try { await el.hover({ timeout: 4000 }); } catch { const bb = await el.boundingBox(); if (bb) await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); } await p.waitForTimeout(350); const after = await snap(el); await p.mouse.move(0, 899); await p.waitForTimeout(150);
  const changes = Object.keys(before).filter((k) => before[k] !== after[k]).map((k) => `${k}: ${before[k]} → ${after[k]}`);
  result.push({ sel, changes }); console.log(`${sel}: ${changes.length ? '' : 'no change'}`); changes.forEach((c) => console.log(`   ${c}`));
}
writeFileSync(out, JSON.stringify(result, null, 1)); await b.close();
