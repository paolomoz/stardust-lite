#!/usr/bin/env node
// content-dump.mjs — the AUTHORING input (step 2): per root selector a nested JSON of the visible elements that carry text, links or
// media — tag, short class, box, text with font, href/aria, src/alt/natural size, background/radius/border/shadow — bare wrappers
// collapsed. An element whose children are all phrasing (`strong`, `em`, `a`, `span`…) keeps its full text in reading order plus
// its inline markup (the own-text-only reading split "Text JOINRX to 21525" into "Text to 21525" + "JOINRX" — walgreens-home). The font
// string carries text-transform and letter-spacing (the text is DOM text; the page may render it uppercase — usta2-home). A paragraph a
// text-reveal library split into one element per rendered line is read as ONE text (`lines: N`); an image not yet loaded (a carousel card
// beyond the viewport) is read from its lazy attribute (`lazy: true`) — the dump is the AUTHORING set, not the painted one
// (audemarspiguet-home: 18 cards, 3 painted). A 0-size wrapper (an aspect-ratio box's `height: 100%` child) is walked through, not
// skipped with its subtree (hiltongrandvacations-home: the hero's header). Read the dump with `content-view.mjs` (full texts), never a
// truncating viewer. Hidden content a click reveals (a carousel caption, a tab panel, a drawer's sub-menu) is `click-dump.mjs`'s.
// --require <css,…> refuses (exit 4) a session whose composition is not the canonical one, so the dump matches the cached origin.
// --hidden <css,…> dumps the named roots WITHOUT the visibility test (boxes 0): hidden-but-present content a JS opener reveals that no
// click the probes make fires — modals appended to `<body>` with `aria-hidden` at rest (nine brand modals; `harness --content` listed
// every authored modal text as "not in the capture" — marriottvacationsworldwide-home). Opt-in and per root: hidden DOM stays NOT content.
// Usage: node content-dump.mjs <url> [W] --roots <css,…> [--hidden <css,…>] --out file.json [--require <css,…>] [--consent <css>] [--dismiss <css,…>] [--locale <tag>]
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { openPage, settle, arg, overlayOpts } from './common.mjs';

const url = process.argv[2]; const W = Number(process.argv[3] || 1440);
if (!url) { console.error('usage: content-dump.mjs <url> [W] --roots <css,…> --out file.json [--require <css,…>]'); process.exit(1); }
const roots = String(arg('--roots', 'header,main,footer')).split(',').map((s) => s.trim());
const hidden = String(arg('--hidden', '')).split(',').map((s) => s.trim()).filter(Boolean);
const b = await chromium.launch(); const p = await openPage(b, url, { width: W, ...overlayOpts(), wait: 4000 });
await settle(p);
const tree = await p.evaluate(([roots, hidden]) => {
  const R = (e) => { const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height)]; };
  let force = false; // --hidden roots: every element counts as visible
  const vis = (e) => { if (force) return true; const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return (r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none') || e.tagName === 'PICTURE' || e.tagName === 'SOURCE'; };
  const norm = (t) => t.replace(/\s+/g, ' ').trim();
  const own = (e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => norm(n.textContent)).filter(Boolean).join(' ');
  const PHRASING = ['STRONG', 'EM', 'B', 'I', 'U', 'SPAN', 'A', 'SUP', 'SUB', 'BR', 'SMALL', 'MARK', 'ABBR'];
  const walk = (e) => {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'IFRAME'].includes(e.tagName.toUpperCase())) {
      if (e.tagName === 'IFRAME' && vis(e)) return { tag: 'iframe', box: R(e), src: e.src, title: e.title, w: e.width, h: e.height };
      if (e.tagName === 'svg' && vis(e)) return { tag: 'svg', box: R(e), id: e.id, use: e.querySelector('use')?.getAttribute('href') || e.querySelector('use')?.getAttribute('xlink:href') || null, label: e.getAttribute('aria-label') };
      return null;
    }
    if (!vis(e)) {
      // a 0-size wrapper hides nothing: `height: 100%` against an aspect-ratio box, a row whose children are absolute — its subtree
      // paints (the hero's header, h1 and controls sat under one and the dump skipped them — hiltongrandvacations-home). Only
      // display:none / visibility:hidden end the walk; a 0-size element descends and collapses like a bare wrapper
      const s0 = getComputedStyle(e);
      if (s0.display === 'none' || s0.visibility === 'hidden' || !e.children.length) return null;
      const kids = [...e.children].map(walk).filter(Boolean);
      return kids.length === 1 ? kids[0] : kids.length ? { tag: e.tagName.toLowerCase(), box: R(e), children: kids } : null;
    }
    const s = getComputedStyle(e);
    const n = { tag: e.tagName.toLowerCase(), box: R(e) };
    if (e.id) n.id = e.id; const cls = [...e.classList].slice(0, 3).join(' '); if (cls) n.cls = cls;
    // text-transform and letter-spacing belong to the font string: the dump holds DOM text, the page renders `uppercase` eyebrows, titles
    // and pills — found in a pixel-diff crop after the first gate, three 1440 bands (usta2-home)
    const font = (el) => { const s = el ? getComputedStyle(el) : getComputedStyle(e); return `${s.fontFamily.split(',')[0].replace(/"/g, '')} ${s.fontSize}/${s.lineHeight} ${s.fontWeight} ${s.color}${s.textAlign !== 'start' ? ' ' + s.textAlign : ''}${s.textTransform !== 'none' ? ' ' + s.textTransform : ''}${s.letterSpacing !== 'normal' ? ' ls=' + s.letterSpacing : ''}`; };
    // one element per rendered line (`.js-reveal-effect-line`, SplitText): ≥ 2 sibling block children, same font, one line tall, text only →
    // one paragraph, joined with a space (the per-line reading cost audemarspiguet-home a case instrument before step 2)
    const lineRun = () => { const kids = [...e.children]; if (kids.length < 2 || own(e)) return null; const f0 = font(kids[0]); const lh = parseFloat(getComputedStyle(kids[0]).lineHeight) || parseFloat(s.fontSize) * 1.3; return kids.every((k) => /^(DIV|SPAN|P)$/.test(k.tagName) && norm(k.textContent) && !k.querySelector('img,picture,svg,video,ul,ol,h1,h2,h3,h4,h5,h6,a') && [...k.children].every((c) => PHRASING.includes(c.tagName)) && /^(block|inline-block|flex)/.test(getComputedStyle(k).display) && k.getBoundingClientRect().height <= 1.6 * lh && font(k) === f0) ? kids : null; };
    // mixed inline content: keep the reading order and the markup, do not descend
    const phrasingOnly = e.children.length && [...e.children].every((c) => PHRASING.includes(c.tagName) && !c.querySelector('img,picture,svg,video'));
    let descend = true;
    const run = lineRun();
    if (run) { n.text = run.map((k) => norm(k.textContent)).join(' '); n.lines = run.length; n.font = font(run[0]); descend = false; } else if (phrasingOnly && own(e)) { n.text = norm(e.textContent); n.markup = norm(e.innerHTML).slice(0, 600); n.font = font(); descend = false; } else { const t = own(e); if (t) { n.text = t; n.font = font(); } }
    if (e.tagName === 'A') { n.href = e.getAttribute('href'); if (e.getAttribute('aria-label')) n.aria = e.getAttribute('aria-label'); if (e.target) n.target = e.target; }
    if (e.tagName === 'IMG') {
      n.src = e.currentSrc || e.src; n.alt = e.alt; n.nat = [e.naturalWidth, e.naturalHeight];
      // not painted yet (a card beyond the viewport, a placeholder): the authoring set is in the lazy attribute — media-fetch takes it from `src`
      const lazy = e.dataset.src || e.dataset.lazySrc || e.dataset.original || (e.dataset.srcset || e.dataset.lazySrcset || '').split(',').pop().trim().split(/\s+/)[0] || (e.closest('picture')?.querySelector('source[data-srcset]')?.dataset.srcset || '').split(',').pop().trim().split(/\s+/)[0];
      if (lazy && (!n.src || /^data:/.test(n.src) || (e.naturalWidth <= 1 && e.naturalHeight <= 1) || !e.complete)) { try { n.src = new URL(lazy, location.href).href; n.lazy = true; } catch { /* keep */ } }
    }
    if (e.tagName === 'INPUT' || e.tagName === 'BUTTON') { n.type = e.type; if (e.placeholder) n.placeholder = e.placeholder; if (e.getAttribute('aria-label')) n.aria = e.getAttribute('aria-label'); }
    if (!/rgba\(0, 0, 0, 0\)/.test(s.backgroundColor)) n.bg = s.backgroundColor;
    if (s.backgroundImage !== 'none') n.bgi = s.backgroundImage.slice(0, 160);
    if (s.borderRadius !== '0px') n.br = s.borderRadius;
    if (s.boxShadow !== 'none') n.shadow = s.boxShadow;
    if (s.borderTopWidth !== '0px' && s.borderTopStyle !== 'none') n.border = `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor}`;
    const kids = descend ? [...e.children].map(walk).filter(Boolean) : [];
    if (kids.length) n.children = kids;
    if (kids.length === 1 && !n.text && !n.href && !n.src && !n.bg && !n.bgi && !n.border && !n.shadow && !n.id) return kids[0]; // bare wrapper
    if (!kids.length && !n.text && !n.href && !n.src && !n.bg && !n.bgi && !n.border) return null;
    return n;
  };
  const out = {}; for (const r of roots) out[r] = [...document.querySelectorAll(r)].map(walk).filter(Boolean);
  force = true; for (const r of hidden) out[`hidden ${r}`] = [...document.querySelectorAll(r)].map(walk).filter(Boolean); force = false;
  out.__doc = document.documentElement.scrollHeight; out.__title = document.title; out.__desc = document.querySelector('meta[name=description]')?.content;
  return out;
}, [roots, hidden]);
writeFileSync(arg('--out', 'content.json'), JSON.stringify(tree, null, 1));
console.log('doc', tree.__doc, 'roots', roots.length, hidden.length ? `+ ${hidden.length} hidden root(s) (boxes 0: hidden-but-present content, register which opener reveals it)` : '', '→', arg('--out', 'content.json'));
await b.close();
