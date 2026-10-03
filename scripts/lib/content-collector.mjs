// lib/content-collector.mjs — the browser-side collector `content-dump.mjs` runs in page.evaluate (the walker that turns the visible
// elements carrying text, links or media into nested JSON: tag, short class, box, text with font, href, src/alt/natural size, paint —
// bare wrappers collapsed; 0-size wrappers walked through; lazy sources read; line-split paragraphs rejoined; `hidden` roots dumped
// without the visibility test). Factored out here so the roster's light pass (and later passes) dump the same content model without
// re-typing the rules (batch-7 rollout, pass 3); content-dump's CLI and output are unchanged. Self-contained: Playwright serialises the
// function by source, so nothing here may close over module scope. Call: `page.evaluate(collectContent, [roots, hidden])`.
// Pass 4 (author) added keys, all additive — old keys unchanged: `markupFull` (the whole inline markup when `markup` was cut at 600
// chars), `title` on links, `src` / `poster` on <video> (the first <source> when the element has no src), `icon` on an empty element
// whose class names an icon font glyph (`icon-*`, `fa-*`, `glyphicon-*`, `material-icons`) — the generator writes `:name:` for it.
// sdt-dentsu rollout, additive again: `bgiUrl` (the full first `url()` when `bgi` is cut at 160 chars — a long CDN URL lost the banner
// picture on every page), `spacer: true` on an empty `<p>` / `<li>` that paints a line box (`<p>&nbsp;</p>`, `<p><br></p>`: a spacing
// measurement author reports), a phrasing-only element without own text keeps its markup (`<p><strong>Title</strong>&nbsp;</p>` read as a
// bare `strong` and lost its weight), and an inner U+00A0 survives `norm` (the dump is the authoring set; a trailing one is trimmed).
// loop r3 (mfs-home): a third argument `sectionSel` — the live section selector measure-page measured with — marks every matching element's
// node `sec: true` and keeps it from collapsing as a bare wrapper, so `triage` / `author` split the dump exactly as the spec and the gate
// split the page (`triage --sections` could not take the CSS: the dump collapses wrappers; three triage runs and a hand-pruned dump, 5 min)
export function collectContent([roots, hidden, sectionSel = null]) {
  const R = (e) => { const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height)]; };
  let force = false; // --hidden roots: every element counts as visible
  const vis = (e) => { if (force) return true; const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return (r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none') || e.tagName === 'PICTURE' || e.tagName === 'SOURCE'; };
  const norm = (t) => t.replace(/[^\S\u00A0]+/g, ' ').replace(/^[\s\u00A0]+|[\s\u00A0]+$/g, '');
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
    let isSec = false; if (sectionSel) { try { isSec = e.matches(sectionSel); } catch { /* invalid selector: no marks */ } } if (isSec) n.sec = true;
    if (e.id) n.id = e.id; const cls = [...e.classList].slice(0, 3).join(' '); if (cls) n.cls = cls;
    // text-transform and letter-spacing belong to the font string: the dump holds DOM text, the page renders `uppercase` eyebrows, titles
    // and pills — found in a pixel-diff crop after the first gate, three 1440 bands (usta2-home)
    const font = (el) => { const s = el ? getComputedStyle(el) : getComputedStyle(e); return `${s.fontFamily.split(',')[0].replace(/"/g, '')} ${s.fontSize}/${s.lineHeight} ${s.fontWeight} ${s.color}${s.textAlign !== 'start' ? ' ' + s.textAlign : ''}${s.textTransform !== 'none' ? ' ' + s.textTransform : ''}${s.letterSpacing !== 'normal' ? ' ls=' + s.letterSpacing : ''}`; };
    // one element per rendered line (`.js-reveal-effect-line`, SplitText): ≥ 2 sibling block children, same font, one line tall, text only →
    // one paragraph, joined with a space (the per-line reading cost audemarspiguet-home a case instrument before step 2)
    const lineRun = () => { const kids = [...e.children]; if (kids.length < 2 || own(e)) return null; const f0 = font(kids[0]); const lh = parseFloat(getComputedStyle(kids[0]).lineHeight) || parseFloat(s.fontSize) * 1.3; return kids.every((k) => /^(DIV|SPAN|P)$/.test(k.tagName) && norm(k.textContent) && !k.querySelector('img,picture,svg,video,ul,ol,h1,h2,h3,h4,h5,h6,a') && [...k.children].every((c) => PHRASING.includes(c.tagName)) && /^(block|inline-block|flex)/.test(getComputedStyle(k).display) && k.getBoundingClientRect().height <= 1.6 * lh && font(k) === f0) ? kids : null; };
    // mixed inline content: keep the reading order and the markup, do not descend
    const phrasingOnly = e.children.length && [...e.children].every((c) => PHRASING.includes(c.tagName) && !c.querySelector('img,picture,svg,video'));
    // a phrasing-only element with no own text is still one text when it holds no link (`<p><strong>Title</strong></p>`, `<p><em><strong>`):
    // descending to the `strong` read the title as a bare paragraph; a lone link child keeps descending so the link is a node of its own
    const phrasingText = phrasingOnly && (own(e) || (!e.querySelector('a') && norm(e.textContent)));
    let descend = true;
    const run = lineRun();
    if (run) { n.text = run.map((k) => norm(k.textContent)).join(' '); n.lines = run.length; n.font = font(run[0]); descend = false; } else if (phrasingText) { n.text = norm(e.textContent); const full = norm(e.innerHTML); n.markup = full.slice(0, 600); if (full.length > 600) n.markupFull = full; n.font = font(); descend = false; } else { const t = own(e); if (t) { n.text = t; n.font = font(); } }
    if (e.tagName === 'A') { n.href = e.getAttribute('href'); if (e.getAttribute('aria-label')) n.aria = e.getAttribute('aria-label'); if (e.target) n.target = e.target; if (e.title) n.title = e.title; }
    if (e.tagName === 'VIDEO') { n.src = e.currentSrc || e.getAttribute('src') || e.querySelector('source')?.getAttribute('src') || null; if (!n.src) delete n.src; if (e.poster) n.poster = e.poster; }
    // an icon-font glyph: an empty element whose class names the font (`icon-search`, `fa-chevron-right`) — content, not paint
    if (!e.children.length && !own(e)) { const ic = [...e.classList].find((c) => /^(icon-|fa-|glyphicon-|material-icons|bi-)/.test(c) && !/^(fa|fas|far|fab)$/.test(c)); if (ic) n.icon = ic.replace(/^(icon-|fa-|glyphicon-|bi-)/, '') || ic; }
    if (e.tagName === 'IMG') {
      n.src = e.currentSrc || e.src; n.alt = e.alt; n.nat = [e.naturalWidth, e.naturalHeight];
      // not painted yet (a card beyond the viewport, a placeholder): the authoring set is in the lazy attribute — media-fetch takes it from `src`
      const lazy = e.dataset.src || e.dataset.lazySrc || e.dataset.original || (e.dataset.srcset || e.dataset.lazySrcset || '').split(',').pop().trim().split(/\s+/)[0] || (e.closest('picture')?.querySelector('source[data-srcset]')?.dataset.srcset || '').split(',').pop().trim().split(/\s+/)[0];
      if (lazy && (!n.src || /^data:/.test(n.src) || (e.naturalWidth <= 1 && e.naturalHeight <= 1) || !e.complete)) { try { n.src = new URL(lazy, location.href).href; n.lazy = true; } catch { /* keep */ } }
    }
    if (e.tagName === 'INPUT' || e.tagName === 'BUTTON') { n.type = e.type; if (e.placeholder) n.placeholder = e.placeholder; if (e.getAttribute('aria-label')) n.aria = e.getAttribute('aria-label'); }
    if (!/rgba\(0, 0, 0, 0\)/.test(s.backgroundColor)) n.bg = s.backgroundColor;
    if (s.backgroundImage !== 'none') { n.bgi = s.backgroundImage.slice(0, 160); if (s.backgroundImage.length > 160) { const u = /url\((["']?)(.*?)\1\)/.exec(s.backgroundImage); if (u && u[2] && !/^data:/.test(u[2])) n.bgiUrl = u[2]; } }
    if (s.borderRadius !== '0px') n.br = s.borderRadius;
    if (s.boxShadow !== 'none') n.shadow = s.boxShadow;
    if (s.borderTopWidth !== '0px' && s.borderTopStyle !== 'none') n.border = `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor}`;
    const kids = descend ? [...e.children].map(walk).filter(Boolean) : [];
    if (kids.length) n.children = kids;
    if (kids.length === 1 && !n.text && !n.href && !n.src && !n.bg && !n.bgi && !n.border && !n.shadow && !n.id && !isSec) return kids[0]; // bare wrapper (a marked section never collapses)
    if (isSec && !kids.length && !n.text && !n.href && !n.src && !n.bg && !n.bgi) return n; // an empty marked section stays a (0-item) row — the spec counts it too
    // an empty paragraph that paints a line box is a spacing measurement (the pipeline drops `<p>&nbsp;</p>` and `<p><br></p>`; author reports it)
    if (!kids.length && !n.text && !n.href && !n.src && !n.bg && !n.bgi && !n.border && !n.icon && /^(P|LI)$/.test(e.tagName) && n.box[3] > 0 && !norm(e.textContent) && [...e.children].every((c) => c.tagName === 'BR')) { n.spacer = true; return n; }
    if (!kids.length && !n.text && !n.href && !n.src && !n.bg && !n.bgi && !n.border && !n.icon) return null;
    return n;
  };
  const out = {}; for (const r of roots) out[r] = [...document.querySelectorAll(r)].map(walk).filter(Boolean);
  force = true; for (const r of hidden) out[`hidden ${r}`] = [...document.querySelectorAll(r)].map(walk).filter(Boolean); force = false;
  out.__doc = document.documentElement.scrollHeight; out.__title = document.title; out.__desc = document.querySelector('meta[name=description]')?.content;
  return out;
}
