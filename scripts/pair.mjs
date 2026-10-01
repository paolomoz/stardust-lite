#!/usr/bin/env node
// pair.mjs — text-anchored pairing: every heading/paragraph/link start in the live spec located on the build; box + font + colour deltas.
// Block anchors (h*, p, li, div, button) are compared with the build's nearest BLOCK box (an authored `<p><strong>` eyebrow or an inline
// link pairs with its block, not with the inline `strong`/`a`). A row is hot on Δx, Δy, Δh or a font/colour change (a row 20 px low
// with the same size was hidden before — ibm-home read every offset chain from the section table instead). Runs of anchors sharing
// one Δx or Δy — even under the 3 px tolerance — are reported as a group offset: that is how a whole header bar shifted by 3 px shows up.
// An inline live anchor (a span in a heading) paired with a block-level build box is compared as its line box (≈), not its glyph box.
// A text-transform change (live `uppercase`, build `none`) is hot: the anchor text is DOM text, the pixels are the rendered case.
// A live anchor that is one rendered LINE of a paragraph (a text-reveal library's one-element-per-line; `live-spec` merges the runs it can
// see, the rest arrive here) is not MISSING when its text sits inside the build element the previous anchor paired with: it prints as ⤷
// (continuation) and counts as located — 14 of 29 rows read MISSING on audemarspiguet-home for that.
// Usage: node pair.mjs <spec.json> <build-url> [--max 120] [--filter <regex>] [--all]   (--all also prints rows within tolerance) [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--require <css,…>]
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { arg, openPage, settle, overlayOpts } from './common.mjs';

const [,, specPath, url] = process.argv;
if (!specPath || !url) { console.error('usage: pair.mjs <spec.json> <build-url> [--max 120] [--filter <regex>] [--all]'); process.exit(1); }
const spec = JSON.parse(readFileSync(specPath, 'utf8')); const MAX = Number(arg('--max', 120)); const filter = arg('--filter', null) ? new RegExp(arg('--filter')) : null; const all = arg('--all', false);
const anchors = []; const seen = new Set();
for (const s of spec.secs) for (const it of s.items) {
  if (!['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'span', 'button', 'li', 'div'].includes(it.k)) continue;
  // off-page anchors (a 4×4 "Skip Advertisement" link at x −995) are not visible text: they pair with nothing a reader sees (usta2-home)
  if (!it.t || it.t.length < 3 || it.box[0] >= spec.W || it.box[0] + it.box[2] <= 0 || it.box[3] < 8) continue;
  const key = it.t.slice(0, 28); if (seen.has(key)) continue; if (filter && !filter.test(it.t)) continue;
  seen.add(key); anchors.push({ t: key, box: it.box, cbox: it.cbox || null, pad: it.pad || null, fs: it.fs, lh: it.lh, fw: it.fw, ff: it.ff, c: it.c, tt: it.tt, inline: !!it.inline || it.k === 'a' || it.k === 'span' });
}
const browser = await chromium.launch(); const page = await openPage(browser, url, { width: spec.W, height: spec.vh || 900, wait: 800, consent: arg('--consent', null), ...overlayOpts() });
await settle(page, 800, 50, 400);
const out = await page.evaluate((anchors) => {
  const R = (e) => { const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y + scrollY), Math.round(b.width), Math.round(b.height)]; };
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  // visible text only: a `visibility: hidden` title (an ad block's white-on-white heading) paired a live section with the footer every round (walgreens-home)
  const shown = (e) => { const b = e.getBoundingClientRect(); const s = getComputedStyle(e); return b.width > 0 && b.height > 0 && s.visibility !== 'hidden' && parseFloat(s.opacity) > 0.05; };
  const all = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,li,button,em,strong,div')].filter((e) => shown(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  let prevBlock = null;
  return anchors.map((a) => {
    const lc = a.t.toLowerCase();
    const cands = all.filter((e) => norm(e.textContent).toLowerCase().startsWith(lc) || norm([...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ')).toLowerCase().startsWith(lc));
    // nearest the live y first (the same words recur in nav, cards and footer), shortest text second
    let e = cands.sort((x, y) => Math.abs(x.getBoundingClientRect().top + scrollY - a.box[1]) - Math.abs(y.getBoundingClientRect().top + scrollY - a.box[1]) || x.textContent.length - y.textContent.length)[0];
    if (!e) {
      // a continuation line: its text is inside the previous anchor's build block (the block's Δh row already says whether the lines fit)
      if (prevBlock && norm(prevBlock.textContent).toLowerCase().includes(lc)) return { box: R(prevBlock), cont: true };
      return null;
    }
    const isInline = (el) => /^(inline|contents)/.test(getComputedStyle(el).display) || ['A', 'SPAN', 'STRONG', 'EM', 'B', 'I', 'U', 'SUP', 'SUB'].includes(el.tagName);
    // a block-level live anchor pairs with the build's nearest block box (the authored inline wrapper is not the box the source has)
    if (!a.inline) while (e.parentElement && isInline(e) && e.parentElement !== document.body) e = e.parentElement;
    // a label inside a control (span in a button, text in a pill link) pairs control with control: the live spec carries the control's
    // box (cbox) and the build's a/button is the box — the span-vs-a.button rows (Δy −12 / Δh 24 = padding) meant nothing (walgreens-home)
    const s0 = getComputedStyle(e); const font = { fs: s0.fontSize, lh: s0.lineHeight, fw: s0.fontWeight, ff: s0.fontFamily.split(',')[0].replace(/"/g, ''), c: s0.color, tt: s0.textTransform };
    const ctl = a.cbox ? e.closest('a,button') : null; if (ctl) return { box: R(ctl), ctl: true, ...font };
    if (!isInline(e)) prevBlock = e;
    return { box: R(e), block: !isInline(e), ...font };
  });
}, anchors);
// glyph box vs line box: a live `span` inside a heading measures its glyph box (Futura 28 px → 44 px tall in a 37.8 px line), the build's
// h2 is the line box — every heading row read Δy +3 and every lede row −4 for a round (stryker-home). When an inline live anchor pairs
// with a block-level build box, compare the live LINE box: top − (lh − glyph)/2, height + (lh − glyph), glyph = the single-line height
const lineBox = (a) => { const lh = parseFloat(a.lh); if (!a.inline || a.pad || !(lh > 0)) return null; const [x, y, w, h] = a.box; let g = h; for (let n = 1; n < 40; n += 1) { const c = h - (n - 1) * lh; if (c >= 0.7 * lh && c < 1.7 * lh) { g = c; break; } } const d = Math.round((lh - g) / 2); return d ? [x, y - d, w, h + 2 * d] : null; };
// the live box a row compares against: the control box (⌗), else the line box when it explains the build height better than the glyph
// box (a padded footer span is as tall as the build's p — its glyph box is the right one), else the glyph box
const liveBox = (a, o) => { if (!o) return a.box; if (o.ctl) return a.cbox; const lb = o.block ? lineBox(a) : null; return lb && Math.abs(o.box[3] - lb[3]) < Math.abs(o.box[3] - a.box[3]) ? lb : a.box; };
console.log('anchor'.padEnd(30), 'live box'.padEnd(22), 'build box'.padEnd(22), 'Δx  Δy  Δw  Δh | font live → build');
let n = 0;
anchors.forEach((a, i) => {
  if (n >= MAX) return; const o = out[i];
  if (o && o.cont) { if (all) { n += 1; console.log(`${a.t.slice(0, 26)} ⤷`.padEnd(30), JSON.stringify(a.box).padEnd(22), JSON.stringify(o.box).padEnd(22), '   line of the previous anchor'); } return; }
  const lb = liveBox(a, o); // control paired with control (⌗); inline glyph box read as its line box (≈)
  const d = o ? [o.box[0] - lb[0], o.box[1] - lb[1], o.box[2] - lb[2], o.box[3] - lb[3]] : null;
  // text-transform is a font delta too: the live renders `uppercase` on DOM text no table showed — three 1440 bands for a round (usta2-home)
  const ttHot = o && a.tt && a.tt !== o.tt;
  // the family compares case-insensitively (CSS matches families that way; the boilerplate's stylelint --fix lower-cases them —
  // `Halcom-Regular` → `halcom-regular` read as a change on every row, dentsu-home); another family is a real delta (a fallback font loaded)
  const ffHot = o && String(a.ff || '').toLowerCase() !== String(o.ff || '').toLowerCase();
  const hot = !o || Math.abs(d[0]) > 3 || Math.abs(d[1]) > 3 || Math.abs(d[3]) > 3 || a.fs !== o.fs || a.fw !== o.fw || a.c !== o.c || ttHot || ffHot;
  if (!all && !hot) return; n += 1;
  const f = o ? `${a.fs}/${a.lh} ${a.fw} ${a.ff.slice(0, 7)} → ${o.fs}/${o.lh} ${o.fw} ${(ffHot ? o.ff : a.ff).slice(0, 7)}${a.c !== o.c ? ` COLOR ${a.c}→${o.c}` : ''}${ttHot ? ` TRANSFORM ${a.tt}→${o.tt}` : ''}${ffHot ? ` FAMILY ${a.ff}→${o.ff}` : ''}` : '';
  console.log((o && o.ctl ? `${a.t.slice(0, 26)} ⌗` : (lb !== a.box ? `${a.t.slice(0, 26)} ≈` : a.t)).padEnd(30), JSON.stringify(lb).padEnd(22), (o ? JSON.stringify(o.box) : '-').padEnd(22), o ? d.map((v) => String(v).padStart(4)).join('') : ' MISSING', '|', f);
});
console.log(`${anchors.length} anchors, ${out.filter(Boolean).length} located${out.some((o) => o && o.cont) ? ` (${out.filter((o) => o && o.cont).length} ⤷ continuation lines of a split paragraph, inside the previous anchor's build box)` : ''}${out.some((o) => o && o.ctl) ? ', ⌗ = control paired with control' : ''}${out.some((o, i) => o && liveBox(anchors[i], o) !== anchors[i].box && !o.ctl) ? ', ≈ = live inline glyph box read as its line box' : ''}${all ? '' : ` (rows within 3 px and same font hidden; --all shows them)`}`);
// group offsets: ≥ 3 consecutive located anchors sharing the same non-zero Δx or Δy (any magnitude, tolerance or not)
for (const [axis, name] of [[0, 'Δx'], [1, 'Δy']]) {
  let run = [];
  const flush = () => { if (run.length >= 3) console.log(`group offset ${name}=${run[0].d > 0 ? '+' : ''}${run[0].d}: ${run.length} anchors, "${run[0].t}" … "${run[run.length - 1].t}"`); run = []; };
  anchors.forEach((a, i) => { const o = out[i]; if (!o) { flush(); return; } if (o.cont) return; const d = o.box[axis] - liveBox(a, o)[axis]; if (d !== 0 && run.length && run[run.length - 1].d === d) run.push({ t: a.t, d }); else { flush(); if (d !== 0) run.push({ t: a.t, d }); } });
  flush();
}
await browser.close();
