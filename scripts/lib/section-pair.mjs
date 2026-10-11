// lib/section-pair.mjs — live sections ↔ authored (build) sections at one width, without a live spec: the live page is dumped with
// content-dump's walker and split with the triage's rules (`splitSections`, so the rows are the triage's rows), each live section's
// first text is located on the build page and the build section that contains it is the partner (sections.mjs's pairing — several live
// sections can share one build section, a build section may have none). Used by `gate` for the per-section pixel share and the block
// budget check (batch-7 rollout, pass 5). Browser-side functions are self-contained (Playwright serialises them by source).
import { collectContent } from './content-collector.mjs';
import { splitSections, fingerprint } from './fingerprint.mjs';

/** Browser side: mark the live content root (the --main selector when it resolves, else the largest ancestor of `main` that adds no
 * chrome — roster's rule) and read the chrome boxes. Returns { root, header, footer, doc }. */
function markRoot([mainSel, headerSel, footerSel]) {
  const q = (s) => { try { return document.querySelector(s); } catch { return null; } };
  const R = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y + scrollY), Math.round(b.width), Math.round(b.height)]; };
  const chrome = (e) => /^(header|footer|nav|aside)$/i.test(e.tagName) || /\b(header|footer|masthead|colophon|nav)\b/i.test(`${e.className} ${e.id}`);
  let el = mainSel ? q(mainSel) : null;
  if (!el) { el = q('main') || q('[role=main]'); while (el && el.parentElement && el.parentElement !== document.body && ![...el.parentElement.children].some((c) => c !== el && chrome(c))) el = el.parentElement; }
  let root = 'body'; if (el) { el.setAttribute('data-gate-root', ''); root = '[data-gate-root]'; }
  const name = el ? `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${[...el.classList].slice(0, 2).map((c) => `.${c}`).join('')}` : 'body (chrome stripped)';
  return { root, rootName: name, rootResolved: !!(mainSel && q(mainSel)), header: R(q(headerSel || 'header')), footer: R(q(footerSel || 'footer')), doc: document.documentElement.scrollHeight };
}
/** Browser side: the content root as a CSS PATH (`body > div:nth-child(2) > main`), so a caller that must not touch the DOM (the
 * structure dump and the captured DOM of measure-page) can name the root roster's rule finds: `mainSel` when it resolves, else the
 * largest ancestor of `main` / `[role=main]` that adds no chrome, else `body`. Returns { path, name }. */
export function contentRootPath([mainSel, headerSel = null, footerSel = null]) {
  const q = (s) => { try { return document.querySelector(s); } catch { return null; } };
  const chrome = (e) => /^(header|footer|nav|aside)$/i.test(e.tagName) || /\b(header|footer|masthead|colophon|nav)\b/i.test(`${e.className} ${e.id}`);
  let el = mainSel ? q(mainSel) : null;
  if (!el) { el = q('main') || q('[role=main]'); while (el && el.parentElement && el.parentElement !== document.body && ![...el.parentElement.children].some((c) => c !== el && chrome(c))) el = el.parentElement; }
  // no main (an AEM Sites page — sherwin-williams: `body > *` guessed, two re-runs and --main by hand): the tallest element that holds neither
  // the header nor the footer and spans ≥ 40 % of the document
  if (!el) { const hd = headerSel ? q(headerSel) : q('header'); const ft = footerSel ? q(footerSel) : q('footer'); const docH = document.documentElement.scrollHeight;
    const cands = [...document.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect(); return r.height >= docH * 0.4 && r.width >= innerWidth * 0.8 && !(hd && (e.contains(hd) || hd.contains(e))) && !(ft && (e.contains(ft) || ft.contains(e))) && !/^(SCRIPT|STYLE|SVG|IMG|PICTURE|VIDEO|IFRAME)$/.test(e.tagName); });
    cands.sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height || (a.contains(b) ? -1 : 1)); el = cands[0] || null; }
  if (!el) return { path: 'body', name: 'body (no main)', tag: 'body' };
  const parts = []; for (let n = el; n && n !== document.body; n = n.parentElement) parts.unshift(`${n.tagName.toLowerCase()}:nth-child(${[...n.parentElement.children].indexOf(n) + 1})`);
  return { path: ['body', ...parts].join(' > '), name: `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${[...el.classList].slice(0, 2).map((c) => `.${c}`).join('')}`, tag: el.tagName.toLowerCase() };
}
const stripChrome = (nodes, depth = 0) => nodes.filter((n) => !(/^(header|footer|nav)$/.test(String(n.tag || '')) || /\b(header|footer|masthead|colophon)\b/i.test(`${n.cls || ''} ${n.id || ''}`))).map((n) => (depth < 2 && n.children ? { ...n, children: stripChrome(n.children, depth + 1) } : n));
const boxOf = (n) => { if (n.box && n.box[3] > 0) return n.box; let y0 = Infinity; let y1 = -Infinity; const walk = (x) => { if (x.box && x.box[3] > 0) { y0 = Math.min(y0, x.box[1]); y1 = Math.max(y1, x.box[1] + x.box[3]); } (x.children || []).forEach(walk); }; walk(n); return Number.isFinite(y0) ? [0, y0, 0, y1 - y0] : null; };

/** The live page's sections — the TRIAGE's split, when the triage is known: `mainSel` is the content root the triage's dump was keyed on
 * (`triage._source.mainKey`: `main`, or the root's short selector such as `div.main-container`; the profile's `cap.contentRoot` next;
 * the cap-probe main selector is the cap model's shell, not the content root — on a one-module site it left the hero before `main`
 * unpaired on every page, sdt-dentsu rollout) and `sections` the triage's `--sections` node selectors, so the live rows are the rows
 * `author` wrote one authored section each for. `page` is open and settled at the width. */
export async function liveSections(page, { mainSel = null, headerSel = null, footerSel = null, sections = null } = {}) {
  const meta = await page.evaluate(markRoot, [mainSel, headerSel, footerSel]);
  const dumped = await page.evaluate(collectContent, [[meta.root], []]);
  let nodes = dumped[meta.root] || []; if (meta.root === 'body') nodes = stripChrome(nodes);
  const split = splitSections({ main: nodes }, { sections: sections && sections.length ? sections : null });
  const rows = split.sections.map((n, index) => { const fp = fingerprint(n); return { index, anchorText: fp.anchorText || '', box: boxOf(n) }; });
  return { sections: rows, header: meta.header, footer: meta.footer, doc: meta.doc, root: { requested: mainSel, resolved: meta.rootResolved, name: meta.rootName }, split: sections && sections.length ? 'selectors' : 'automatic' };
}

/** Browser side: the build's authored sections (boxes, first text, block class) and, for every live anchor, the build section holding
 * the element that starts with its text nearest the live y (sections.mjs). `secSel` names the authored sections (`main > .section`). */
function readBuild([secSel, live]) {
  const R = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y + scrollY), Math.round(b.width), Math.round(b.height)]; };
  const norm = (s) => s.replace(/\s+/g, ' ').trim().toLowerCase();
  const header = document.querySelector('header'); const footer = document.querySelector('footer');
  const secs = [...document.querySelectorAll(secSel)];
  const shown = (e) => { const b = e.getBoundingClientRect(); const s = getComputedStyle(e); return b.width > 0 && b.height > 0 && s.visibility !== 'hidden' && parseFloat(s.opacity) > 0.05; };
  const texts = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,a,span,strong,em,button,div')].filter((e) => shown(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  const sections = secs.map((s, index) => {
    const t = texts.find((e) => s.contains(e) && norm(e.textContent).length >= 3);
    const blockEl = s.querySelector('.block'); const cls = blockEl ? [...blockEl.classList].filter((c) => c !== 'block') : [];
    return { index, box: R(s), anchorText: t ? norm(t.textContent).slice(0, 60) : '', block: cls[0] || null, variant: cls.slice(1).join(' ') || null, classes: [...s.classList].filter((c) => c !== 'section') };
  });
  const where = (e) => { if (header && header.contains(e)) return 'header'; if (footer && footer.contains(e)) return 'footer'; const i = secs.findIndex((s) => s.contains(e)); return i >= 0 ? i : null; };
  const located = live.map((l) => {
    if (!l.anchorText || l.anchorText.length < 3) return { idx: null, abox: null };
    const lc = l.anchorText.toLowerCase().slice(0, 28); const ly = l.box ? l.box[1] : 0;
    // nearest the live y among the candidates that start with the text; a copy inside an authored section beats one in the build's
    // header/footer (a shorter draft put the footer's "Executive Leadership" link nearer the live y than the section's heading)
    const cands = texts.filter((x) => norm(x.textContent).startsWith(lc)).sort((x, y) => Math.abs(x.getBoundingClientRect().top + scrollY - ly) - Math.abs(y.getBoundingClientRect().top + scrollY - ly) || x.textContent.length - y.textContent.length);
    const e = cands.find((x) => typeof where(x) === 'number') || cands[0];
    return e ? { idx: where(e), abox: R(e) } : { idx: null, abox: null };
  });
  return { sections, located, header: R(header), footer: R(footer), doc: document.documentElement.scrollHeight };
}

/** Pair the live sections with the build's: returns the build sections (empty ones dropped), each with `build: { y0, y1, h, box }` and
 * `live: { y0, y1, h, box, indices }` — y0…y1 is the stride to the next section's top, `box` the element's own box; live null when no
 * live section located inside it — and the live sections that paired with no authored section. */
export async function pairSections(buildPage, live, { secSel = 'main > .section', byIndex = 'auto' } = {}) {
  const b = await buildPage.evaluate(readBuild, [secSel, live.sections.map((s) => ({ anchorText: s.anchorText, box: s.box }))]);
  // an authored section without a box (the empty section the pipeline leaves for the metadata block) is not a row
  const empty = b.sections.filter((s) => !s.box || s.box[3] <= 0); const kept = b.sections.filter((s) => s.box && s.box[3] > 0);
  const located = live.sections.map((s, i) => { const l = b.located[i]; if (typeof l.idx === 'number') return l.idx; if (l.idx === 'header' || l.idx === 'footer') return l.idx; return null; });
  // `author` writes one authored section per triage row: when the live split IS the triage's (same count as the authored sections), the
  // k-th live section is the k-th authored one — pairing by anchor text instead folded a live section whose first text no build element
  // starts with (a tile band of unit labels, a portrait before its title at 360) into its neighbour and read Δh 668 / 48 % on a 0 px page
  // (sdt-dentsu home and the ten pages after it). The anchor pairing stays for a split the triage did not shape, and as the check.
  const indexable = byIndex === true || (byIndex === 'auto' && live.sections.length > 0 && live.sections.length === kept.length);
  const mode = indexable ? 'index' : 'anchor';
  const partner = indexable ? live.sections.map((s, i) => kept[i].index) : located.slice();
  const mismatches = indexable ? live.sections.map((s, i) => (typeof located[i] === 'number' && located[i] !== partner[i] ? { live: i, anchorText: s.anchorText, anchorIn: located[i], pairedTo: partner[i] } : null)).filter(Boolean) : [];
  // a live section without a located anchor takes the build section its neighbours bracket (index order, sections.mjs's fallback)
  if (!indexable) partner.forEach((p, i) => { if (p !== null) return; const prev = [...partner.slice(0, i)].reverse().find((x) => typeof x === 'number'); const next = partner.slice(i + 1).find((x) => typeof x === 'number'); if (prev !== undefined && prev === next) partner[i] = prev; else if (prev === undefined && typeof next === 'number' && next === 0) partner[i] = 0; else if (next === undefined && typeof prev === 'number' && prev === b.sections.length - 1) partner[i] = prev; });
  const sections = kept.map((s) => {
    const idx = partner.map((p, i) => (p === s.index ? i : -1)).filter((i) => i >= 0); const boxes = idx.map((i) => live.sections[i].box).filter(Boolean);
    const y0 = boxes.length ? Math.min(...boxes.map((x) => x[1])) : null; const y1 = boxes.length ? Math.max(...boxes.map((x) => x[1] + x[3])) : null;
    return { ...s, build: { y0: s.box[1], y1: s.box[1] + s.box[3], h: s.box[3] }, live: y0 === null ? null : { y0, y1, h: y1 - y0, indices: idx, anchorText: live.sections[idx[0]].anchorText }, liveAnchorText: idx.length ? live.sections[idx[0]].anchorText : null };
  });
  // the range a section is READ over runs to the next section's top (its stride): a block margin that collapses out of the section box
  // (the 30 px member — METHOD step 6) is still this section's pixels, and the boxes alone read the hero 30 px short at 0.02 % diff
  sections.forEach((s, i) => {
    const next = sections[i + 1]; const nextLive = sections.slice(i + 1).find((x) => x.live);
    s.build.box = { y0: s.build.y0, y1: s.build.y1, h: s.build.h }; if (next && next.build.y0 > s.build.y0) { s.build.y1 = next.build.y0; s.build.h = s.build.y1 - s.build.y0; }
    if (s.live) { s.live.box = { y0: s.live.y0, y1: s.live.y1, h: s.live.h }; if (nextLive && nextLive.live.y0 > s.live.y0) { s.live.y1 = nextLive.live.y0; s.live.h = s.live.y1 - s.live.y0; } }
  });
  // Δh is a HEIGHT only when the build/live offset it opens never closes: with the offset chain o₀ = 0, oᵢ = build.y1 − live.y1 of row i
  // (Δhᵢ = oᵢ − oᵢ₋₁), a row whose top offset recurs at a later bottom, or whose bottom offset occurred at an earlier top, is one gap the
  // two pages attribute to different sections (a module margin on the live, section padding on the build: −40 / 0 / +40 with every row's
  // pixels at the same y and Δ doc 0 — sdt-dentsu social-impact) — marked `boundary`, left out of the budget verdict
  const offs = [0]; sections.forEach((s) => { offs.push(s.live ? s.build.y1 - s.live.y1 : offs[offs.length - 1]); });
  const near = (a, b) => Math.abs(a - b) <= 2;
  sections.forEach((s, i) => {
    const dh = s.live ? s.build.h - s.live.h : null;
    if (dh === null) { s.dhKind = null; return; }
    if (Math.abs(dh) <= 2) { s.dhKind = 'ok'; return; }
    const top = offs[i]; const bottom = offs[i + 1];
    const closesLater = offs.slice(i + 2).some((o) => near(o, top)); const openedEarlier = offs.slice(0, i).some((o) => near(o, bottom));
    s.dhKind = closesLater || openedEarlier ? 'boundary' : 'height';
  });
  const unpaired = live.sections.filter((s, i) => partner[i] === null).map((s) => ({ index: s.index, anchorText: s.anchorText, box: s.box }));
  const chrome = live.sections.map((s, i) => ({ index: s.index, anchorText: s.anchorText, in: partner[i] })).filter((x) => typeof x.in === 'string');
  return { sections, unpaired, chrome, empty: empty.map((s) => s.index), mode, mismatches, build: { header: b.header, footer: b.footer, doc: b.doc }, live: { header: live.header, footer: live.footer, doc: live.doc, root: live.root || null, split: live.split || null } };
}

/** The triage row (non-chrome, in order) for a live section: by anchor text first, by position among the non-chrome rows second. */
export function triageRowFor(triage, liveSection) {
  const rows = (triage?.sections || []).filter((r) => !r.chrome);
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const a = norm(liveSection.anchorText);
  return (a && rows.find((r) => norm(r.anchorText) && (norm(r.anchorText).startsWith(a.slice(0, 28)) || a.startsWith(norm(r.anchorText).slice(0, 28))))) || rows[liveSection.index] || null;
}

/** The live sections from the MEASUREMENT's dump (content-<W>.json next to the origin capture), no live page: the same split as the triage's
 * (splitSections on the whole dump: the extra bands included, as author wrote them) and the same session as the cached capture. The first
 * round of a run opened the live page at three widths for these boxes (≈ 15–25 s each, wpp's first round 65 s against 31–48 s later). */
export function liveSectionsFromDump(dump, { sections = null } = {}) {
  const sp = splitSections(dump, { sections: sections && sections.length ? sections : null });
  const rows = sp.sections.map((n, index) => { const fp = fingerprint(n); return { index, anchorText: fp.anchorText || '', box: boxOf(n) }; });
  return { sections: rows, header: sp.header?.box || null, footer: sp.footer?.box || null, doc: Number(dump.__doc) || null, root: { requested: null, resolved: true, name: sp.mainKey }, split: sections && sections.length ? 'selectors' : 'automatic', from: 'dump' };
}
