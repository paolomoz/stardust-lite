// shadow-probe.mjs — deep-probe through shadow roots: rect + paint (incl. ::before/::after) of composed-tree selectors. A selector
// may contain ` >> ` to descend into a host's shadow root (`c4d-card-group-item >> div.cds--tile`); Playwright-style piercing for
// the parts stardust-lite's deep-probe (light DOM only) cannot reach. Up to --max matches per selector; live or build.
// Usage: node shadow-probe.mjs <url> <W> --sels <file> [--consent <css>] [--dismiss <css>] [--max 2] [--click <css>]
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const arg = (n, d) => { const i = process.argv.indexOf(n); return i < 0 ? d : (process.argv[i+1] ?? true); };
const [,, url, wArg] = process.argv; const W = Number(wArg || 1440); const MAX = Number(arg('--max', 2));
const sels = readFileSync(arg('--sels'), 'utf8').split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#'));
const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:W,height:900}, userAgent: UA, locale: 'en-US' });
await p.goto(url, { waitUntil:'domcontentloaded', timeout:90000 }); await p.waitForTimeout(3500);
for (const s of [arg('--consent', null), arg('--dismiss', null)].filter(Boolean)) { try { await p.click(s, { timeout: 2000 }); } catch {} }
await p.waitForFunction(() => [...document.querySelectorAll('.block')].every((el) => el.dataset.blockStatus === 'loaded'), null, { timeout: 15000 }).catch(() => {});
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); } window.scrollTo(0,0); await new Promise(r => setTimeout(r, 1200)); });
if (arg('--click', null)) { try { await p.click(arg('--click'), { timeout: 3000 }); await p.waitForTimeout(1200); } catch (e) { console.log('no click', String(e).slice(0, 80)); } }
const out = await p.evaluate(([sels, MAX]) => {
  const R = (e) => { const r = e.getBoundingClientRect(); return `[${Math.round(r.x)},${Math.round(r.y + scrollY)},${Math.round(r.width)},${Math.round(r.height)}]`; };
  const SKIP = ['none', 'rgba(0, 0, 0, 0)', '0px', 'normal', 'static', 'auto', 'start', 'stretch', 'row', 'visible', 'flex-start', '0px none rgb(0, 0, 0)', 'nowrap', '1'];
  const P = (cs) => { const o = []; for (const [k, v] of [['bg', cs.backgroundColor], ['bgi', cs.backgroundImage], ['br', cs.borderRadius], ['bdt', cs.borderTop], ['bdb', cs.borderBottom], ['bdl', cs.borderLeft], ['bdr', cs.borderRight], ['ol', cs.outline], ['sh', cs.boxShadow], ['pad', cs.padding], ['mar', cs.margin], ['pos', cs.position], ['disp', cs.display], ['op', cs.opacity], ['tf', cs.transform], ['w', cs.width], ['h', cs.height], ['minh', cs.minHeight], ['maxw', cs.maxWidth], ['gap', cs.gap], ['gtc', cs.gridTemplateColumns], ['gtr', cs.gridTemplateRows], ['jc', cs.justifyContent], ['ai', cs.alignItems], ['fd', cs.flexDirection], ['ff', cs.fontFamily.split(',')[0]], ['fs', cs.fontSize], ['fw', cs.fontWeight], ['lh', cs.lineHeight], ['ls', cs.letterSpacing], ['c', cs.color], ['ta', cs.textAlign], ['td', cs.textDecorationLine], ['ov', cs.overflow], ['fill', cs.fill], ['tr', cs.transition]]) { if (v && !SKIP.includes(v) && !/^0px none rgb/.test(v) && !(k === 'tr' && /^all 0s/.test(v)) && !(k === 'fill' && v === 'rgb(0, 0, 0)')) o.push(`${k}=${v}`); } return o.join(' '); };
  const q = (sel) => { const parts = sel.split('>>').map((s) => s.trim()); let roots = [document]; for (const part of parts) { const next = []; for (const r of roots) for (const e of r.querySelectorAll(part)) next.push(e); roots = next.map((e) => (part === parts[parts.length - 1] ? e : (e.shadowRoot || e))); } return roots; };
  const lines = [];
  for (const sel of sels) {
    const els = q(sel).slice(0, MAX);
    if (!els.length) { lines.push(`${sel}: (none)`); continue; }
    for (const e of els) {
      lines.push(`${sel} ${R(e)} ${P(getComputedStyle(e))}`);
      for (const ps of ['::before', '::after']) { const cs = getComputedStyle(e, ps); if (cs.content !== 'none' && cs.content !== 'normal') lines.push(`   ${ps} content=${cs.content.slice(0, 30)} ${cs.width}x${cs.height} ${P(cs)} top=${cs.top} left=${cs.left} right=${cs.right} bottom=${cs.bottom}`); }
    }
  }
  return lines.join('\n');
}, [sels, MAX]);
console.log(out); await b.close();
