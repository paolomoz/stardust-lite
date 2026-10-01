#!/usr/bin/env node
// content-full.mjs — innerText dump of what content-dump reads line by line or not at all on www.audemarspiguet.com: the source splits
// every paragraph into `.js-reveal-effect-line` divs (one DOM element per rendered line, hidden until revealed) and keeps the carousel
// cards beyond the viewport and the off-canvas nav drawer (x = -W) out of the visible dump. Reads every card of every carousel, every
// textimage / dualtext / hero copy block as one text, the lookbook cells, and the drawer menu links. Case template (site selectors).
// Usage: node content-full.mjs <url> [W] --out file.json [--consent <css>] [--dismiss <css,…>] [--locale <tag>]
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { openPage, settle, arg, overlayOpts } from '../../../../node_modules/stardust-lite/scripts/common.mjs';

const url = process.argv[2]; const W = Number(process.argv[3] || 1440); const out = arg('--out', 'content-full.json');
if (!url) { console.error('usage: content-full.mjs <url> [W] --out file.json'); process.exit(1); }
const b = await chromium.launch(); const p = await openPage(b, url, { width: W, consent: arg('--consent', null), ...overlayOpts(), wait: 4000 });
await settle(p);
const data = await p.evaluate(() => {
  const norm = (x) => x.replace(/\s+/g, ' ').trim();
  // innerText is '' for a not-yet-revealed line (visibility) and for an off-canvas drawer: read textContent, joining the source's
  // one-div-per-line split (`.js-reveal-effect-line`) with a space so words do not fuse across lines
  const t = (el) => { if (!el) return ''; const lines = [...el.querySelectorAll('.js-reveal-effect-line')].filter((l) => !l.querySelector('.js-reveal-effect-line')); if (lines.length) { const top = lines.filter((l) => !lines.some((o) => o !== l && o.contains(l))); return norm(top.map((l) => l.textContent).join(' ')); } return norm(el.textContent); };
  const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top + scrollY), Math.round(r.width), Math.round(r.height)]; };
  const imgOf = (el) => { const i = el && el.querySelector('img'); if (!i) return null; return { src: i.currentSrc || i.src || i.dataset.src || '', alt: i.alt, nat: [i.naturalWidth, i.naturalHeight], box: box(i) }; };
  const vidOf = (el) => { const v = el && el.querySelector('video'); if (!v) return null; return { src: v.currentSrc || v.src || (v.querySelector('source') || {}).src || '', poster: v.poster, box: box(v) }; };
  const copy = (root) => { if (!root) return ''; const lines = [...root.querySelectorAll('.js-reveal-effect-line, p')].filter((l) => !l.closest('h1,h2,h3,h4') && !l.querySelector('.js-reveal-effect-line') && !l.closest('a')); return norm(lines.map((l) => l.textContent).join(' ')); };
  const heading = (h) => (h ? { plain: t(h.querySelector('span')) || '', italic: t(h.querySelector('i')) || '', text: t(h), tag: h.tagName.toLowerCase(), box: box(h) } : null);
  const sections = [...document.querySelectorAll('#maincontent > .hero, #maincontent > .parsys > div, #maincontent > .newsletter')].map((s) => {
    const kind = s.className;
    const o = { kind, box: box(s) };
    if (kind.includes('hero')) {
      o.heading = heading(s.querySelector('h1, h2'));
      o.text = copy(s);
      const a = s.querySelector('a.ap-link'); o.link = a ? { text: t(a), href: a.href } : null;
      o.video = vidOf(s); o.img = imgOf(s);
      o.controls = [...s.querySelectorAll('button')].map((bt) => ({ label: bt.getAttribute('aria-label') || t(bt), box: box(bt) }));
    } else if (kind.includes('carousel')) {
      o.heading = heading(s.querySelector('h1, h2, h3'));
      const a = s.querySelector('.ap-carousel__content > div:first-child a.ap-link, .ap-carousel__header a.ap-link'); o.link = a ? { text: t(a), href: a.href, aria: a.getAttribute('aria-label') } : null;
      o.cards = [...s.querySelectorAll('figure.ap-standard-card')].map((f) => {
        const la = f.querySelector('aside a'); const ca = f.querySelector('figcaption a.ap-link, .ap-standard-card__content a.ap-link');
        return { title: t(f.querySelector('.ap-standard-card__title')), desc: t(f.querySelector('.ap-standard-card__desc')), href: (la || ca || {}).href || '', aria: la ? la.getAttribute('aria-label') : '', cta: ca ? t(ca) : '', img: imgOf(f), box: box(f), captionBox: box(f.querySelector('figcaption')) };
      });
      o.nav = [...s.querySelectorAll('.swiper-navigation button')].map((bt) => ({ id: bt.id, disabled: bt.disabled || bt.getAttribute('aria-disabled'), box: box(bt) }));
      o.pagination = box(s.querySelector('.swiper-pagination, .ap-carousel__pagination'));
    } else if (kind.includes('dualtext') && !kind.includes('image')) {
      o.heading = heading(s.querySelector('h1, h2, h3')); o.text = t(s.querySelector('p'));
    } else if (kind.includes('grid')) {
      o.cells = [...s.querySelectorAll('.lookbookElement')].map((c) => ({ cls: c.className, box: box(c), img: imgOf(c), video: vidOf(c), link: c.querySelector('a') ? c.querySelector('a').href : '' }));
    } else if (kind.includes('textimage')) {
      o.items = [...s.querySelectorAll('.ap-textimage')].map((ti) => {
        const a = ti.querySelector('a.ap-link');
        return { heading: heading(ti.querySelector('h1, h2, h3')), text: copy(ti.querySelector('.ap-textimage__content') || ti), link: a ? { text: t(a), href: a.href, aria: a.getAttribute('aria-label') } : null, img: imgOf(ti), box: box(ti), textBox: box(ti.querySelector('.ap-textimage__content, .ap-textimage__text')), imgBox: box(ti.querySelector('.ap-textimage__img')) };
      });
    } else if (kind.includes('newsletter')) {
      o.heading = heading(s.querySelector('h2')); o.text = t(s.querySelector('p')); const a = s.querySelector('a.ap-cta'); o.cta = a ? { text: t(a), href: a.href, box: box(a) } : null;
    }
    return o;
  });
  const drawer = document.querySelector('#drawer__r_1_');
  const nav = {
    drawerBox: box(drawer),
    links: drawer ? [...drawer.querySelectorAll('a, button')].map((a) => ({ tag: a.tagName.toLowerCase(), text: t(a).slice(0, 80), href: a.href || '', cls: a.className.slice(0, 80), box: box(a), parent: a.parentElement.className.slice(0, 60) })) : [],
    structure: drawer ? drawer.innerText.slice(0, 4000) : '',
    top: [...document.querySelectorAll('.ap-react-navigation__top a, .ap-react-navigation__top button')].map((a) => ({ tag: a.tagName.toLowerCase(), href: a.href || '', aria: a.getAttribute('aria-label'), title: a.title, box: box(a), svg: a.querySelector('svg') ? a.querySelector('svg').outerHTML.slice(0, 3000) : '' })),
  };
  const footer = { langButton: t(document.querySelector('.ap-react-language-selector-app button')), social: [...document.querySelectorAll('#ap-footer a[target=_blank]')].filter((a) => a.querySelector('svg')).map((a) => ({ href: a.href, aria: a.getAttribute('aria-label') || a.title, svg: a.querySelector('svg').outerHTML.slice(0, 4000), box: box(a) })) };
  return { sections, nav, footer, doc: document.documentElement.scrollHeight };
});
writeFileSync(out, JSON.stringify(data, null, 1));
console.log(`doc ${data.doc} sections ${data.sections.length} drawer links ${data.nav.links.length} → ${out}`);
for (const s of data.sections) { console.log(`== ${s.kind} ${JSON.stringify(s.box)}`); if (s.cards) console.log(`   cards ${s.cards.length}: ${s.cards.map((c) => c.title.replace(/\n/g, ' ')).join(' | ')}`); if (s.items) console.log(`   items ${s.items.length}: ${s.items.map((c) => (c.heading || {}).text.replace(/\n/g, ' ')).join(' | ')}`); if (s.cells) console.log(`   cells ${s.cells.length}`); }
await b.close();
