// lib/spec-collector.mjs — the browser-side reading `live-spec.mjs` runs in page.evaluate at one width: per section (header, the
// `--sections` matches, footer) box / padding / margin / paint and its items — paint boxes, every text node with its font string and
// control box, every image / video / svg / iframe / canvas — plus the entrance state (`ent`, `rest`) of an item parked by a scroll
// library, the running animations, the loaded fonts and the document's outerHTML. Factored out so `measure-page` reads the spec from
// the same settled page as the other instruments (batch-7 rollout, pass 6); live-spec's CLI and output are unchanged. Self-contained:
// Playwright serialises the function by source, nothing here may close over module scope. Call:
// `page.evaluate(collectSpec, { sections, header, footer })` → { url, W, vh, doc, running, body, bodyBg, fonts, secs, html }.
export const collectSpec = ({ sections, header, footer, pierce = false }) => {
  // composed-tree query (loop r7): every element under `root` across shadow roots and slots that matches `sel`, in tree order
  const qsa = (root, sel) => { if (!pierce) return [...root.querySelectorAll(sel)]; const out = []; const walk = (e) => { for (const c of (e.shadowRoot ? [...e.shadowRoot.children, ...e.children] : [...e.children])) { if (c.tagName === 'STYLE' || c.tagName === 'SCRIPT') continue; if (c.tagName === 'SLOT') { c.assignedElements({ flatten: true }).forEach((a) => { if (a.matches(sel)) out.push(a); walk(a); }); continue; } if (c.matches(sel)) out.push(c); walk(c); } }; walk(root); return [...new Set(out)]; };
  const R = (e) => { const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y + scrollY), Math.round(b.width), Math.round(b.height)]; };
  const vis = (e) => { const b = e.getBoundingClientRect(); const s = getComputedStyle(e); return b.width > 0 && b.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && parseFloat(s.opacity) > 0.05; };
  const F = (e) => { const s = getComputedStyle(e); return { ff: s.fontFamily.split(',')[0].replace(/"/g, ''), fs: s.fontSize, fw: s.fontWeight, lh: s.lineHeight, ls: s.letterSpacing, tt: s.textTransform, ta: s.textAlign, c: s.color, fst: s.fontStyle, td: s.textDecorationLine, ...(!/^(block|inline|list-item)$/.test(s.display) ? { d: s.display } : {}), ...(s.verticalAlign !== 'baseline' ? { va: s.verticalAlign } : {}), ...(s.float !== 'none' ? { fl: s.float } : {}) }; }; // d / va / fl: an inline run with a middle-aligned icon was read as flex, then float — three 360 rounds (canon, loop r10)
  const BG = (e) => { const s = getComputedStyle(e); const o = {}; if (!/rgba\(0, 0, 0, 0\)/.test(s.backgroundColor)) o.bg = s.backgroundColor; if (s.backgroundImage !== 'none') { o.bgi = s.backgroundImage.slice(0, 200); o.bgs = `${s.backgroundSize} ${s.backgroundPosition} ${s.backgroundRepeat}`; } if (s.borderRadius !== '0px') o.br = s.borderRadius; if ([s.borderTopWidth, s.borderBottomWidth, s.borderLeftWidth, s.borderRightWidth].some((w) => parseFloat(w) > 0)) o.border = [s.borderTop, s.borderBottom, s.borderLeft, s.borderRight].map((x) => x.slice(0, 30)).join(' | '); if (s.boxShadow !== 'none') o.shadow = s.boxShadow.slice(0, 60); if (s.transform !== 'none') o.tf = s.transform; return o; };
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
  const secs = [...document.querySelectorAll(header), ...document.querySelectorAll(sections), ...document.querySelectorAll(footer)].filter(Boolean); // every match of a comma footer selector (the second matched nothing before — canon)
  const outSecs = secs.map((sec) => {
    const cs = getComputedStyle(sec);
    const s = { id: `${sec.tagName} ${sec.className}`.trim().slice(0, 80), box: R(sec), pad: cs.padding, mar: cs.margin, pos: cs.position, ...BG(sec), items: [] };
    qsa(sec, 'div,section,ul,li,a,button,span,article,aside,figure,nav,form,input,picture').forEach((e) => { if (!vis(e)) return; const bg = BG(e); const bx = R(e); if (Object.keys(bg).length && bx[2] >= 24 && bx[3] >= 16) s.items.push({ k: 'paint', tag: e.tagName.toLowerCase(), cls: (typeof e.className === 'string' ? e.className : '').slice(0, 60), box: bx, pad: getComputedStyle(e).padding, ...bg }); });
    // a paragraph a text-reveal library split into one element per rendered line (`.js-reveal-effect-line`, SplitText) is ONE text: a run of
    // ≥ 2 sibling block children, same font, each one line tall and holding only text — recorded once on the parent with `lines`
    // (audemarspiguet-home read 20 one-line anchors and paired the continuation lines with nothing)
    const skip = new Set();
    // own text only, so sectioning and phrasing tags that carry text (`header`, `figcaption`, `small`, `time`…) are read once each — a hero's
    // `header` label was in no spec item (hiltongrandvacations-home)
    qsa(sec, 'h1,h2,h3,h4,h5,h6,p,li,a,button,label,input,span,em,i,b,strong,u,td,th,div,header,footer,section,article,figcaption,blockquote,cite,small,time,dt,dd,legend,summary,address').forEach((e) => {
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
    qsa(sec, 'img,video,svg,iframe,canvas').forEach((e) => { if (!vis(e)) return; s.items.push(withRest({ k: e.tagName.toLowerCase(), cls: (typeof e.className === 'string' ? e.className : '').slice(0, 60), box: R(e), src: (e.currentSrc || e.getAttribute('src') || e.getAttribute('data-src') || e.getAttribute('poster') || '').slice(0, 240), alt: e.getAttribute('alt') || '', fit: getComputedStyle(e).objectFit, ...(e.tagName === 'IMG' && e.complete && e.naturalWidth === 0 ? { broken: true } : {}) }, e, sec)); }); // a broken live image paints its alt text in the box (a hotlink 403: a 10.9 % band no table named — take2games)
    s.items.sort((a, b) => a.box[1] - b.box[1] || a.box[0] - b.box[0]);
    // who owns the gap: the ancestor chain from the section to its first (and last) text, each ancestor's non-zero margin / padding / border on
    // that side — the spacing model read from three deep-probe runs by hand (8 min, natixis about-article); `brief` prints it as the inset line
    const chain = (e, side) => { const out = []; for (let a = e; a && a !== sec; a = a.parentElement) { const c = getComputedStyle(a); const m = parseFloat(c[`margin${side}`]) || 0; const p = parseFloat(c[`padding${side}`]) || 0; const b = parseFloat(c[`border${side}Width`]) || 0; const sel = `${a.tagName.toLowerCase()}${(typeof a.className === 'string' ? a.className : '').trim().split(/\s+/).filter(Boolean).slice(0, 1).map((x) => '.' + x).join('')}`; if (m || p || b || a === e) out.unshift(`${sel}${m ? ` m${m}` : ''}${p ? ` p${p}` : ''}${b ? ` b${b}` : ''}`); } const c0 = getComputedStyle(sec); const p0 = parseFloat(c0[`padding${side}`]) || 0; const b0 = parseFloat(c0[`border${side}Width`]) || 0; return [`section${p0 ? ` p${p0}` : ''}${b0 ? ` b${b0}` : ''}`, ...out]; };
    const texts = qsa(sec, 'h1,h2,h3,h4,h5,h6,p,li,a,button,span,label,summary,td').filter((e) => vis(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && e.getBoundingClientRect().height >= 8);
    if (texts.length) { const byY = texts.map((e) => [e, R(e)]).sort((a, b) => a[1][1] - b[1][1] || a[1][0] - b[1][0]); s.inset = { top: chain(byY[0][0], 'Top'), bottom: chain(byY[byY.length - 1][0], 'Bottom').reverse(), first: byY[0][1][1] - s.box[1], last: s.box[1] + s.box[3] - (byY[byY.length - 1][1][1] + byY[byY.length - 1][1][3]) }; }
    return s;
  });
  const running = document.getAnimations().filter((a) => a.playState === 'running').length; // settle waited the finite ones out; what is left loops
  return { url: location.href, W: innerWidth, vh: innerHeight, doc: document.documentElement.scrollHeight, running, body: document.body.className, bodyBg: getComputedStyle(document.body).backgroundColor, bodyBgi: [document.body, document.documentElement].map((e) => getComputedStyle(e)).filter((s) => s.backgroundImage !== 'none').map((s) => `${s.backgroundImage.slice(0, 160)} ${s.backgroundSize} ${s.backgroundPosition} ${s.backgroundRepeat} ${s.backgroundAttachment}`)[0] || null, fonts: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight} ${f.style}`), secs: outSecs, html: document.documentElement.outerHTML };
};
