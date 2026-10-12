#!/usr/bin/env node
// style-pass.mjs — the element pass (five-minute loop, iteration 7): every text element of the BUILD paired by its text with the live spec's
// text item, the measured values that differ (font, colour, letter-spacing, text-transform, alignment, decoration, background, radius,
// padding, border) written as rules on the build element's structural path — generalised over a block's repeated units when they agree.
// spec-to-css drafts by element TYPE (`.cards p`); the field runs' agents wrote by POSITION (`.cards-card-body > p:first-child` — the
// uppercase pill over the picture, bms) and read spec rows for minutes to do it. Values are the live page's measurements, never its CSS.
// Usage: node style-pass.mjs <measure-dir> <build-url> [--out styles/elements.css] [--widths 1440,360,2560] [--base 1440] [--bp <px>]
//   Writes --out whole (styles.css imports it first) and prints how many elements were paired and styled per width.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { arg, launch, contextOptions, openPage, settle } from './common.mjs';

const dir = process.argv[2]; const url = process.argv[3];
if (!dir || !url || url.startsWith('--')) { console.error('usage: style-pass.mjs <measure-dir> <build-url> [--out styles/elements.css] [--widths 1440,360,2560] [--base 1440] [--bp <px>]'); process.exit(1); }
const out = String(arg('--out', join('styles', 'elements.css'))); const base = Number(arg('--base', 1440));
const widths = String(arg('--widths', `${base},360,2560`)).split(',').map(Number).filter((W) => existsSync(join(dir, `spec-${W}.json`)));
const summary = existsSync(join(dir, 'summary.json')) ? JSON.parse(readFileSync(join(dir, 'summary.json'), 'utf8')) : {};
const bp = Number(arg('--bp', 0)) || (() => { const b = (summary.breakpoints || []).map((s) => /^(?:min|max) (\d+)/.exec(s)).filter(Boolean).map((m) => Number(m[1])).filter((px) => px >= 600 && px <= 1200); return b[0] || 900; })();
const norm = (t) => String(t || '').replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 48);
const px = (v) => String(v);
const rgbHex = (c) => String(c || '').replace(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/, (_, r, g, b, a) => (a !== undefined && Number(a) < 1 ? `rgb(${r} ${g} ${b} / ${Math.round(Number(a) * 100)}%)` : `#${[r, g, b].map((x) => Number(x).toString(16).padStart(2, '0')).join('')}`));
const fam = (ff) => String(ff || '').split(',')[0].replace(/["']/g, '').trim();

// the live text items per width, keyed by text (a text seen twice is ambiguous and skipped)
function liveItems(W) {
  const spec = JSON.parse(readFileSync(join(dir, `spec-${W}.json`), 'utf8')); const by = new Map(); const dup = new Set();
  for (const s of spec.secs) for (const it of s.items) { if (!it.t || it.t.length < 2 || !it.fs) continue; const k = norm(it.t); if (by.has(k)) dup.add(k); else by.set(k, it); }
  for (const k of dup) by.delete(k); return by;
}
// the measured value of a property as CSS, from a spec item
const liveProps = (it) => ({
  'font-family': it.ff ? `'${fam(it.ff)}'` : null, 'font-size': it.fs || null, 'font-weight': it.fw || null, 'line-height': it.lh || null,
  'letter-spacing': it.ls && it.ls !== 'normal' ? it.ls : 'normal', 'text-transform': it.tt || 'none', 'text-align': it.ta && it.ta !== 'start' ? it.ta : null,
  color: it.c ? rgbHex(it.c) : null, 'font-style': it.fst && it.fst !== 'normal' ? it.fst : null, 'text-decoration-line': it.td ? String(it.td).split(' ')[0] : null,
  'background-color': it.bg ? rgbHex(it.bg) : null, 'border-radius': it.br || null, padding: it.pad && it.pad !== '0px' ? it.pad : null, border: it.border ? String(it.border).split(' | ')[0] : null,
});

const browser = await launch(); const byW = {};
for (const W of widths) {
  const live = liveItems(W);
  const ctx = await browser.newContext(contextOptions({ width: W, height: 900 })); const page = await openPage(ctx, url, { width: W, height: 900, wait: 300 }); await settle(page, 900, 60, 400);
  const els = await page.evaluate(() => {
    const out = []; const sel = (e) => { const parts = []; let x = e;
      while (x && x !== document.body) { const p = x.parentElement; if (!p) break;
        if (x.matches('main > div.section')) { parts.unshift(`main > .section:nth-of-type(${[...p.children].filter((c) => c.tagName === 'DIV').indexOf(x) + 1})`); return parts.join(' > '); }
        if (x.matches('header, footer')) { parts.unshift(x.tagName.toLowerCase()); return parts.join(' > '); }
        if (x.classList.contains('block') && x.classList.length) { const cls = [...x.classList].filter((c) => !/^(block)$/.test(c) && !/-container$|-wrapper$/.test(c)); const inner = [`.${cls[0]}`, ...parts].join(' > '); let y = p; while (y && !y.matches('main > div.section, header, footer')) y = y.parentElement; if (y?.matches('main > div.section')) return `main > .section:nth-of-type(${[...y.parentElement.children].filter((c) => c.tagName === 'DIV').indexOf(y) + 1}) ${inner}`; return y ? `${y.tagName.toLowerCase()} ${inner}` : inner; }
        const i = [...p.children].indexOf(x) + 1; parts.unshift(`${x.tagName.toLowerCase()}:nth-child(${i})`); x = p; }
      return null; };
    for (const e of document.querySelectorAll('main *, header *, footer *')) {
      if (!/^(H[1-6]|P|A|LI|SPAN|BUTTON|STRONG|EM|DT|DD|BLOCKQUOTE)$/.test(e.tagName)) continue;
      const own = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim(); if (own.length < 2) continue;
      const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
      const cs = getComputedStyle(e); const s = sel(e); if (!s) continue;
      out.push({ t: e.textContent, s, inBlock: !!e.closest('.block'), cs: { 'font-family': cs.fontFamily, 'font-size': cs.fontSize, 'font-weight': cs.fontWeight, 'line-height': cs.lineHeight, 'letter-spacing': cs.letterSpacing, 'text-transform': cs.textTransform, 'text-align': cs.textAlign, color: cs.color, 'font-style': cs.fontStyle, 'text-decoration-line': cs.textDecorationLine, 'background-color': cs.backgroundColor, 'border-radius': cs.borderRadius, padding: cs.padding, border: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}` } });
    }
    return out;
  });
  await ctx.close();
  const rules = new Map(); let paired = 0;
  for (const e of els) {
    const it = live.get(String(e.t).replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 48)); if (!it) continue; paired += 1;
    const want = liveProps(it); const diff = {};
    for (const [p, v] of Object.entries(want)) {
      if (v === null) continue; const have = e.cs[p];
      const same = p === 'font-family' ? fam(have).toLowerCase() === fam(v).toLowerCase() : p === 'color' || p === 'background-color' ? rgbHex(have) === v || (p === 'background-color' && /^rgb\(0 0 0 \/ 0%\)$|^#000000$/.test(rgbHex(have)) && !it.bg) : p === 'border' ? !it.border || String(have).startsWith(String(v).split(' ')[0]) : p === 'text-decoration-line' ? String(have).split(' ')[0] === v : String(have) === String(v);
      if (!same) diff[p] = v;
    }
    if (Object.keys(diff).length) rules.set(e.s, { ...(rules.get(e.s) || {}), ...diff });
  }
  // generalise: a block's repeated units (`> div:nth-child(n) >` right after the block class) collapse when every member agrees on a value
  const general = new Map();
  for (const [s, d] of rules) { const g = s.replace(/^(.*?\.[a-z][\w-]* > div):nth-child\(\d+\)/, '$1'); const arr = general.get(g) || []; arr.push([s, d]); general.set(g, arr); }
  const final = [];
  for (const [g, arr] of general) {
    if (arr.length < 2 || g === arr[0][0]) { arr.forEach(([s, d]) => final.push([s, d])); continue; }
    const common = {}; for (const [p, v] of Object.entries(arr[0][1])) if (arr.every(([, d]) => d[p] === v)) common[p] = v;
    if (Object.keys(common).length) final.push([g, common]);
    for (const [s, d] of arr) { const rest = Object.fromEntries(Object.entries(d).filter(([p]) => !(p in common))); if (Object.keys(rest).length) final.push([s, rest]); }
  }
  byW[W] = { final, paired, els: els.length };
  console.log(`style-pass ${W}: ${els.length} build texts, ${paired} paired with the live spec, ${final.length} rule(s)`);
}
await browser.close();

const decl = (d) => Object.entries(d).map(([p, v]) => `${p}: ${px(v)}`).join('; ');
const lines = [];
const baseRules = byW[base]?.final || [];
const baseMap = new Map(baseRules.map(([s, d]) => [s, d]));
lines.push(...baseRules.map(([s, d]) => `${s} { ${decl(d)}; }`));
for (const W of widths.filter((x) => x !== base)) {
  // a narrower / wider width: only what differs from the base rule set (the measured value at that width)
  const rs = (byW[W]?.final || []).map(([s, d]) => [s, Object.fromEntries(Object.entries(d).filter(([p, v]) => (baseMap.get(s) || {})[p] !== v))]).filter(([, d]) => Object.keys(d).length);
  if (!rs.length) continue;
  const q = W < base ? `(max-width: ${bp - 1}px)` : `(min-width: ${Math.round((base + W) / 2)}px)`;
  lines.push(`@media ${q} {  /* the measured values at ${W} */\n${rs.map(([s, d]) => `  ${s} { ${decl(d)}; }`).join('\n')}\n}`);
}
// its own file, regenerated whole and imported first by styles.css (first.mjs): the agent's rules in styles.css come later and win ties
writeFileSync(out, `/* elements.css — style-pass: the live page's measured text styles on the build's elements (regenerated; edit styles.css) */\n${lines.join('\n')}\n`);
console.log(`style-pass: ${baseRules.length} base rule(s) + per-width overrides → ${out}`);
process.exit(0);
