// lib/probe-collectors.mjs — the browser-side readings of four step-1 instruments, factored out so `measure-page` runs them on ONE
// settled page per width (batch-7 rollout, pass 6); the instruments' CLIs and outputs are unchanged. Every function is self-contained:
// Playwright serialises it by source, nothing may close over module scope.
//   firstLook()                       probe-load's first look (title, lang, fixed/sticky layers, consent candidates, shadow hosts, custom tags, chrome)
//   collectStructure({ root, depth, pierce })   probe-structure's indented dump (selector, box, display, paint, own text with font)
//   collectMedia()                    media-list's composed-tree inventory (img, video, background images, svg, @font-face, loaded fonts, scroll lock)
//   fontResponse(response)            media-list's font-request test on a Playwright Response: the url when it is a font file, else null
//   deepProbe([sels, max, children, props, anim])   deep-probe's lines; needs common.mjs's DEEP_HELPERS in scope (`queryDeep`): run it as
//                                     `page.evaluate(new Function('args', `${DEEP_HELPERS} return (${String(deepProbe)})(args);`), args)`
export const firstLook = () => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const sel = (el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${[...el.classList].slice(0, 3).map((c) => '.' + c).join('')}`;
  const box = (el) => { const r = el.getBoundingClientRect(); return `[${Math.round(r.left)},${Math.round(r.top + scrollY)},${Math.round(r.width)},${Math.round(r.height)}]`; };
  const fixed = [...document.querySelectorAll('body *')].filter((el) => { const cs = getComputedStyle(el); return (cs.position === 'fixed' || cs.position === 'sticky') && vis(el); }).slice(0, 30).map((el) => `${sel(el)} ${box(el)} z=${getComputedStyle(el).zIndex}`);
  const consent = [...document.querySelectorAll('[id*=onetrust],[class*=onetrust],[id*=consent],[class*=consent],[id*=cookie],[class*=cookie],[class*=truste],[id*=truste],[id*=privacy],[class*=privacy],[role=dialog],[aria-modal=true]')].filter(vis).slice(0, 12).map((el) => `${sel(el)} ${box(el)}`);
  const kids = (root) => [...root.children].map((el) => `${sel(el)} ${box(el)}`);
  const main = document.querySelector('main');
  // unassigned bands: painted boxes OUTSIDE header / main / footer that are not fixed and not an overlay — a 49 px mega-menu bar sitting
  // after `header#header` held 255 texts and no table showed it (scotiabank-personal): dump these roots too, they are content
  const chrome = [document.querySelector('header'), main, document.querySelector('footer')].filter(Boolean);
  const unfixed = (el) => { let n = el; while (n && n !== document.body) { const p = getComputedStyle(n).position; if (p === 'fixed' || p === 'sticky') return false; n = n.parentElement; } return true; };
  const textNodes = (el) => [el, ...el.querySelectorAll('*')].reduce((n, e) => n + [...e.childNodes].filter((c) => c.nodeType === 3 && c.textContent.trim()).length, 0);
  const cands = main ? [...document.querySelectorAll('body *')].filter((el) => !chrome.some((r) => r.contains(el) || el.contains(r)) && vis(el) && el.getBoundingClientRect().height >= 8 && unfixed(el) && !/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|IFRAME)$/.test(el.tagName) && !/onetrust|consent|cookie|modal|dialog/i.test(`${el.id} ${el.className}`) && !el.closest('[role=dialog],[aria-modal=true]')) : [];
  const unassigned = cands.filter((el) => !cands.some((o) => o !== el && o.contains(el))).slice(0, 12).map((el) => `${sel(el)} ${box(el)} ${textNodes(el)} texts`);
  return { title: document.title, lang: document.documentElement.lang, h: document.documentElement.scrollHeight, fixed, overlays: consent, hasMain: !!main, mainKids: main ? kids(main) : [], bodyKids: kids(document.body), unassigned, header: document.querySelector('header') ? sel(document.querySelector('header')) : null, footer: document.querySelector('footer') ? sel(document.querySelector('footer')) : null, shadowHosts: [...document.querySelectorAll('*')].filter((e) => e.shadowRoot).length, customTags: [...new Set([...document.querySelectorAll('*')].map((e) => e.tagName.toLowerCase()).filter((t) => t.includes('-')))].slice(0, 60) };
};

export const collectStructure = ({ root, depth, pierce }) => {
  const sel = (el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${[...el.classList].slice(0, 4).map((c) => '.' + c).join('')}${el.getAttribute('slot') ? '[slot=' + el.getAttribute('slot') + ']' : ''}`;
  const box = (el) => { const r = el.getBoundingClientRect(); return `x${Math.round(r.left)} y${Math.round(r.top + scrollY)} w${Math.round(r.width)} h${Math.round(r.height)}`; };
  const walk = (el, d, max, fromShadow) => {
    const lines = []; if (d > max) return lines; if (['script', 'style', 'link', 'template', 'noscript'].includes(el.tagName.toLowerCase())) return lines;
    const r = el.getBoundingClientRect();
    if (r.height === 0 && r.width === 0 && !el.shadowRoot && getComputedStyle(el).display !== 'contents' && !['picture', 'source', 'slot'].includes(el.tagName.toLowerCase())) return lines;
    const cs = getComputedStyle(el); const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).filter(Boolean).join(' ');
    const src = el.tagName === 'IMG' ? ` src=${(el.currentSrc || el.src || '').slice(-90)} ${el.naturalWidth}x${el.naturalHeight}` : '';
    lines.push(`${'  '.repeat(d)}${fromShadow ? '#' : ''}${sel(el)} ${box(el)} ${cs.display}${cs.position !== 'static' ? ' ' + cs.position : ''} bg=${cs.backgroundColor}${cs.backgroundImage !== 'none' ? ' bgimg' : ''}${src}${own ? ` ${cs.fontSize}/${cs.lineHeight} ${cs.fontWeight} ${cs.color} "${own.slice(0, 80)}"` : ''}`);
    if (el.shadowRoot && pierce) for (const c of el.shadowRoot.children) lines.push(...walk(c, d + 1, max, true));
    for (const c of el.children) lines.push(...walk(c, d + 1, max, false));
    return lines;
  };
  const r = document.querySelector(root); if (!r) return `no ${root}`;
  return `doc ${document.documentElement.scrollHeight}\n${walk(r, 0, depth, false).join('\n')}`;
};

export const collectMedia = () => {
  const all = []; const walk = (root) => { for (const e of root.querySelectorAll('*')) { all.push(e); if (e.shadowRoot) walk(e.shadowRoot); } }; walk(document);
  const R = (e) => { const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height)]; };
  const path = (e) => { const parts = []; let n = e; while (n && n.nodeType === 1 && parts.length < 6) { parts.unshift(`${n.tagName.toLowerCase()}${n.id ? '#' + n.id : ''}${[...n.classList].slice(0, 2).map((c) => '.' + c).join('')}`); n = n.parentElement || (n.getRootNode() instanceof ShadowRoot ? n.getRootNode().host : null); } return parts.join(' > '); };
  const imgs = all.filter((e) => e.tagName === 'IMG').map((e) => ({ box: R(e), src: e.currentSrc || e.src, srcset: (e.srcset || '').slice(0, 400), nat: [e.naturalWidth, e.naturalHeight], alt: e.alt, fit: getComputedStyle(e).objectFit, loading: e.loading, path: path(e) }));
  const videos = all.filter((e) => e.tagName === 'VIDEO').map((e) => ({ box: R(e), src: e.currentSrc || e.src, poster: e.poster, autoplay: e.autoplay, loop: e.loop, muted: e.muted, paused: e.paused, duration: e.duration, size: [e.videoWidth, e.videoHeight], path: path(e) }));
  const bgs = all.filter((e) => { const s = getComputedStyle(e); return s.backgroundImage !== 'none' && e.getBoundingClientRect().width > 0; }).map((e) => ({ box: R(e), bgi: getComputedStyle(e).backgroundImage.slice(0, 300), path: path(e) }));
  const svgs = all.filter((e) => e.tagName === 'svg' && e.getBoundingClientRect().width > 0).map((e) => ({ box: R(e), path: path(e), outer: e.outerHTML.slice(0, 2000) }));
  const faces = []; const sheets = [...document.styleSheets]; all.forEach((e) => { if (e.shadowRoot) sheets.push(...e.shadowRoot.styleSheets, ...(e.shadowRoot.adoptedStyleSheets || [])); });
  for (const sh of sheets) { let rules; try { rules = sh.cssRules; } catch { continue; } for (const r of rules) { if (r instanceof CSSFontFaceRule) faces.push(`${r.style.fontFamily} ${r.style.fontWeight} ${r.style.fontStyle} ${r.style.fontDisplay} unicode=${(r.style.unicodeRange || '').slice(0, 20)} :: ${r.style.getPropertyValue('src').slice(0, 300)}`); } }
  const loaded = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight} ${f.style}`);
  return { doc: document.documentElement.scrollHeight, imgs, videos, bgs, svgs, faces: [...new Set(faces)], loaded, bodyFont: getComputedStyle(document.body).fontFamily, lock: `${getComputedStyle(document.body).overflow}/${getComputedStyle(document.documentElement).overflow}` };
};

export const fontResponse = (r) => { const u = r.url(); return /\.(woff2?|ttf|otf)(\?|$)/i.test(u) || (r.headers()['content-type'] || '').includes('font') ? u : null; };

export const deepProbe = ([sels, MAX, CHILDREN, PROPS, ANIM]) => {
  const R = (e) => { const r = e.getBoundingClientRect(); return `[${Math.round(r.x)},${Math.round(r.y + scrollY)},${Math.round(r.width)},${Math.round(r.height)}]`; };
  const SKIP = ['none', 'rgba(0, 0, 0, 0)', '0px', 'normal', 'static', 'auto', 'start', 'stretch', 'row', 'visible', 'flex-start', '0px none rgb(0, 0, 0)'];
  const P = (cs) => { const o = []; for (const [k, v] of [['bg', cs.backgroundColor], ['bgi', cs.backgroundImage], ['br', cs.borderRadius], ['bd', cs.border], ['bdt', cs.borderTop], ['bdb', cs.borderBottom], ['sh', cs.boxShadow], ['pad', cs.padding], ['mar', cs.margin], ['pos', cs.position], ['disp', cs.display], ['z', cs.zIndex], ['op', cs.opacity], ['tf', cs.transform], ['w', cs.width], ['h', cs.height], ['maxw', cs.maxWidth], ['gap', cs.gap], ['gtc', cs.gridTemplateColumns], ['jc', cs.justifyContent], ['ai', cs.alignItems], ['fd', cs.flexDirection], ['ff', cs.fontFamily.split(',')[0]], ['fs', cs.fontSize], ['fw', cs.fontWeight], ['lh', cs.lineHeight], ['ls', cs.letterSpacing], ['c', cs.color], ['ta', cs.textAlign], ['td', cs.textDecorationLine], ['ov', cs.overflow]]) { if (v && !SKIP.includes(v) && !/^0px none rgb/.test(v)) o.push(`${k}=${v}`); } return o.join(' '); };
  const lines = [];
  for (const sel of sels) {
    const els = queryDeep(sel).slice(0, MAX);
    if (!els.length) { lines.push(`${sel}: (none)`); continue; }
    for (const e of els) {
      const cs0 = getComputedStyle(e);
      lines.push(`${sel} ${R(e)} ${P(cs0)}${PROPS.length ? ' ' + PROPS.map((p) => `${p}=${cs0.getPropertyValue(p)}`).join(' ') : ''}`);
      if (ANIM) for (const an of e.getAnimations({ subtree: false })) { const t = an.effect.getTiming(); lines.push(`   anim ${an.animationName || an.constructor.name} ${t.duration}ms ×${t.iterations} ${t.easing} delay=${t.delay} ${t.direction} ${JSON.stringify(an.effect.getKeyframes().map(({ composite, computedOffset, offset, easing, ...k }) => ({ at: computedOffset, ...k })))}`); }
      // an icon-font glyph is a Private Use codepoint: print it as `\eXXX` with its family (BACKLOG #90 — read by grep from three CSS bundles, scotiabank-personal)
      for (const ps of ['::before', '::after']) { const cs = getComputedStyle(e, ps); if (cs.content !== 'none' && cs.content !== 'normal') { const m = /^"(.)"$/u.exec(cs.content); const cp = m ? m[1].codePointAt(0) : 0; const shown = cp >= 0xe000 && cp <= 0xf8ff ? `"\\${cp.toString(16)}" (icon glyph, ${cs.fontFamily.split(',')[0]})` : cs.content.slice(0, 40); lines.push(`   ${ps} content=${shown} ${cs.width}x${cs.height} ${P(cs)} top=${cs.top} left=${cs.left} right=${cs.right} bottom=${cs.bottom}`); } }
      // --children: what is inside the box (tag.class, rect, display) — the one-line answer when the per-selector rows leave the tree
      // ambiguous (a picture-first cell wrapped into a 450 px `<p>`, a shrink-wrapped picture — usta2-home's rects.mjs)
      if (CHILDREN) for (const c of e.children) lines.push(`    > ${c.tagName.toLowerCase()}${c.className && typeof c.className === 'string' ? `.${c.className.split(' ')[0]}` : ''} ${R(c)} ${getComputedStyle(c).display}`);
    }
  }
  return lines.join('\n');
};
