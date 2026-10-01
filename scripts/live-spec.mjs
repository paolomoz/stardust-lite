#!/usr/bin/env node
// live-spec.mjs — per-node measurement of a page at one width (step 1 of BLOCKS-FIRST-PROTOTYPING.md).
// Per top-level section: box, padding, margin (a 0-height section is spacing: flagged in the table), paint (bg, image, radius, border,
// shadow, transform); per text node: font family/size/
// line-height/weight/letter-spacing/transform/align/colour/style/decoration + box + text + href; per image/video/svg/canvas: box, fit, src.
// Also writes the captured DOM. Usage:
//   node live-spec.mjs <url> <W> --out <dir> [--sections <css>] [--header <css>] [--footer <css>] [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--require <css,…>] [--vh 900]
// Every run is ONE session: on a page with session-variable composition pass --require (markers of the composition the origin was
// captured in) so the three width specs describe the same page; a mismatching session exits 4.
// Default sections: `main > .section` (EDS) — for a source page pass its section selector, e.g. --sections '.section-wrapper > section'.
// An item read inside an ENTRANCE STATE (an ancestor at a non-zero translate or opacity 0 — AOS / "animate once" libraries re-arm every
// element that leaves the viewport, so a settled read at scrollY 0 holds the tiles at translateY(−100px)) carries `ent` (dx, dy, opacity)
// and `rest` (the box with the translate removed); the summary counts them. One gate round and a wrong section rule came from the
// translated boxes read as positions (marriottvacationsworldwide-home). `pair` and `sections` compare at `rest`.
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { arg, openPage, settle, overlayOpts } from './common.mjs';

const [,, url, wArg] = process.argv;
if (!url || !wArg) { console.error('usage: live-spec.mjs <url> <W> --out <dir> [--sections <css>] [--header <css>] [--footer <css>] [--consent <css>]'); process.exit(1); }
const W = Number(wArg); const out = arg('--out', '.'); const vh = Number(arg('--vh', 900));
const sections = arg('--sections', 'main > .section'); const header = arg('--header', 'header'); const footer = arg('--footer', 'footer');
const browser = await chromium.launch();
const page = await openPage(browser, url, { width: W, height: vh, ...overlayOpts() });
await settle(page);
const spec = await page.evaluate(({ sections, header, footer }) => {
  const R = (e) => { const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y + scrollY), Math.round(b.width), Math.round(b.height)]; };
  const vis = (e) => { const b = e.getBoundingClientRect(); const s = getComputedStyle(e); return b.width > 0 && b.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && parseFloat(s.opacity) > 0.05; };
  const F = (e) => { const s = getComputedStyle(e); return { ff: s.fontFamily.split(',')[0].replace(/"/g, ''), fs: s.fontSize, fw: s.fontWeight, lh: s.lineHeight, ls: s.letterSpacing, tt: s.textTransform, ta: s.textAlign, c: s.color, fst: s.fontStyle, td: s.textDecorationLine }; };
  const BG = (e) => { const s = getComputedStyle(e); const o = {}; if (!/rgba\(0, 0, 0, 0\)/.test(s.backgroundColor)) o.bg = s.backgroundColor; if (s.backgroundImage !== 'none') o.bgi = s.backgroundImage.slice(0, 200); if (s.borderRadius !== '0px') o.br = s.borderRadius; if ([s.borderTopWidth, s.borderBottomWidth, s.borderLeftWidth, s.borderRightWidth].some((w) => parseFloat(w) > 0)) o.border = [s.borderTop, s.borderBottom, s.borderLeft, s.borderRight].map((x) => x.slice(0, 30)).join(' | '); if (s.boxShadow !== 'none') o.shadow = s.boxShadow.slice(0, 60); if (s.transform !== 'none') o.tf = s.transform; return o; };
  const PHRASING = ['STRONG', 'EM', 'B', 'I', 'U', 'SPAN', 'A', 'SUP', 'SUB', 'BR', 'SMALL', 'MARK', 'ABBR'];
  // the nearest ancestor (the element itself first, up to the section) at opacity < 0.05, or at a translate ≠ 0 that a transition on
  // transform will move: an entrance state (or a hidden panel) — a static translate (a chevron nudged 6 px) is a position and is not flagged
  const entrance = (e, sec) => { for (let a = e; a && a !== sec; a = a.parentElement) { const s = getComputedStyle(a); const op = parseFloat(s.opacity); let dx = 0, dy = 0; if (s.transform !== 'none') { try { const m = new DOMMatrixReadOnly(s.transform); dx = Math.round(m.m41); dy = Math.round(m.m42); } catch { /* unreadable */ } } const moves = /\b(transform|all)\b/.test(s.transitionProperty) && /[1-9]/.test(s.transitionDuration); if (op < 0.05 || ((dx || dy) && moves)) return { dx, dy, op, on: `${a.tagName.toLowerCase()}${a.dataset.aos ? `[data-aos=${a.dataset.aos}]` : ''}` }; } return null; };
  const withRest = (it, e, sec) => { const en = entrance(e, sec); if (en) { it.ent = en; if (en.dx || en.dy) it.rest = [it.box[0] - en.dx, it.box[1] - en.dy, it.box[2], it.box[3]]; } return it; };
  const lineRun = (e) => {
    const kids = [...e.children]; if (kids.length < 2 || [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return null;
    const f0 = JSON.stringify(F(kids[0])); const lh = parseFloat(getComputedStyle(kids[0]).lineHeight) || parseFloat(getComputedStyle(kids[0]).fontSize) * 1.3;
    const ok = kids.every((k) => /^(DIV|SPAN|P)$/.test(k.tagName) && k.textContent.trim() && !k.querySelector('img,picture,svg,video,ul,ol,h1,h2,h3,h4,h5,h6') && [...k.children].every((c) => PHRASING.includes(c.tagName)) && /^(block|inline-block|flex)/.test(getComputedStyle(k).display) && k.getBoundingClientRect().height <= 1.6 * lh && JSON.stringify(F(k)) === f0);
    return ok ? kids : null;
  };
  const secs = [document.querySelector(header), ...document.querySelectorAll(sections), document.querySelector(footer)].filter(Boolean);
  const outSecs = secs.map((sec) => {
    const cs = getComputedStyle(sec);
    const s = { id: `${sec.tagName} ${sec.className}`.trim().slice(0, 80), box: R(sec), pad: cs.padding, mar: cs.margin, pos: cs.position, ...BG(sec), items: [] };
    sec.querySelectorAll('div,section,ul,li,a,button,span,article,aside,figure,nav,form,input,picture').forEach((e) => { if (!vis(e)) return; const bg = BG(e); const bx = R(e); if (Object.keys(bg).length && bx[2] >= 24 && bx[3] >= 16) s.items.push({ k: 'paint', tag: e.tagName.toLowerCase(), cls: (typeof e.className === 'string' ? e.className : '').slice(0, 60), box: bx, pad: getComputedStyle(e).padding, ...bg }); });
    // a paragraph a text-reveal library split into one element per rendered line (`.js-reveal-effect-line`, SplitText) is ONE text: a run of
    // ≥ 2 sibling block children, same font, each one line tall and holding only text — recorded once on the parent with `lines`
    // (audemarspiguet-home read 20 one-line anchors and paired the continuation lines with nothing)
    const skip = new Set();
    // own text only, so sectioning and phrasing tags that carry text (`header`, `figcaption`, `small`, `time`…) are read once each — a hero's
    // `header` label was in no spec item (hiltongrandvacations-home)
    sec.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,a,button,label,input,span,em,i,b,strong,u,td,th,div,header,footer,section,article,figcaption,blockquote,cite,small,time,dt,dd,legend,summary,address').forEach((e) => {
      if (!vis(e) || skip.has(e)) return;
      const run = lineRun(e);
      if (run) { run.forEach((k) => skip.add(k)); s.items.push(withRest({ k: e.tagName.toLowerCase(), cls: (typeof e.className === 'string' ? e.className : '').slice(0, 60), box: R(e), t: run.map((k) => k.textContent.replace(/\s+/g, ' ').trim()).join(' ').slice(0, 400), lines: run.length, ...F(run[0]), ...BG(e) }, e, sec)); return; }
      const own = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
      if (!own && !e.matches('input,button')) return;
      const it = { k: e.tagName.toLowerCase(), cls: (typeof e.className === 'string' ? e.className : '').slice(0, 60), box: R(e), t: (own || e.value || e.placeholder || '').replace(/\s+/g, ' ').slice(0, 200), ...F(e) };
      const a = e.closest('a'); if (a) it.href = a.getAttribute('href'); if (e.matches('span,em,i,b,strong,u')) it.inline = true;
      const ctl = e.closest('a,button'); if (ctl && ctl !== e) it.cbox = R(ctl); // the control's box: a button label pairs control with control (walgreens-home)
      Object.assign(it, BG(e)); if (getComputedStyle(e).padding !== '0px') it.pad = getComputedStyle(e).padding;
      s.items.push(withRest(it, e, sec));
    });
    sec.querySelectorAll('img,video,svg,iframe,canvas').forEach((e) => { if (!vis(e)) return; s.items.push(withRest({ k: e.tagName.toLowerCase(), cls: (typeof e.className === 'string' ? e.className : '').slice(0, 60), box: R(e), src: (e.currentSrc || e.getAttribute('src') || e.getAttribute('data-src') || e.getAttribute('poster') || '').slice(0, 240), alt: e.getAttribute('alt') || '', fit: getComputedStyle(e).objectFit }, e, sec)); });
    s.items.sort((a, b) => a.box[1] - b.box[1] || a.box[0] - b.box[0]);
    return s;
  });
  const running = document.getAnimations().filter((a) => a.playState === 'running').length; // settle waited the finite ones out; what is left loops
  return { url: location.href, W: innerWidth, vh: innerHeight, doc: document.documentElement.scrollHeight, running, body: document.body.className, bodyBg: getComputedStyle(document.body).backgroundColor, fonts: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight} ${f.style}`), secs: outSecs, html: document.documentElement.outerHTML };
}, { sections, header, footer });
mkdirSync(out, { recursive: true });
const { html, ...rest } = spec;
writeFileSync(`${out}/spec-${W}.json`, JSON.stringify(rest, null, 1));
writeFileSync(`${out}/dom-${W}.html`, html);
console.log(`W ${rest.W} vh ${rest.vh} doc ${rest.doc} sections ${rest.secs.length} bodyBg ${rest.bodyBg}`);
// a 0-height live section is a spacing measurement (a `margin-top-small` container: 32 px of margin, 0 px tall), not an empty row to skip —
// write it down with the section it precedes, per width (usta2-home; the same container collapses to 0 above its cap)
rest.secs.forEach((s, i) => console.log(String(i).padStart(2), s.id.slice(0, 48).padEnd(48), JSON.stringify(s.box).padEnd(22), s.pad, s.bg || '', s.items.length, 'items', s.box[3] === 0 ? `  ← 0-height: spacing, margin ${s.mar}` : ''));
console.log('fonts:', rest.fonts.join(' | '));
const lines = rest.secs.reduce((n, s) => n + s.items.filter((it) => it.lines).length, 0);
if (lines) console.log(`line-split paragraphs merged: ${lines} (a text-reveal library's one-element-per-line; \`lines\` on the item)`);
// a box read while its entrance transition runs is 6–17 px off (audemarspiguet-home): settle waits the finite animations out; what still runs loops
if (rest.running) console.log(`animations still running at read time: ${rest.running} (infinite ones; a box inside one is a state, not a measurement)`);
// an entrance state is not a position: the box is where the library parked the element, the capture shows it at rest (the section
// rule derived from the −100 px boxes cost a 14.6 % gate round — marriottvacationsworldwide-home)
const ent = rest.secs.flatMap((s) => s.items.filter((it) => it.ent)); const ways = [...new Set(ent.map((it) => `${it.ent.on} dx=${it.ent.dx} dy=${it.ent.dy} op=${it.ent.op}`))];
if (ent.length) console.log(`items read inside an entrance state or an invisible ancestor: ${ent.length} (${ways.slice(0, 4).join('; ')}${ways.length > 4 ? '; …' : ''}) — \`box\` is the parked position, \`rest\` the position without the translate; read the container and the capture, never a section rule from \`box\``);
await browser.close();
