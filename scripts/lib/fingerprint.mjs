// lib/fingerprint.mjs — the structural fingerprint of a content-dump section and the match against a block inventory (SCALING-PLAN
// §2.B/C, batch-7 rollout). Pure: reads the JSON `content-dump.mjs` writes (nested nodes with tag / cls / box / text / font / href /
// src / bgi), no browser. Shared by `block-inventory` (scan stores a fingerprint per block row), `triage` (drafts a page's table),
// pass 3's roster and pass 4's author — the rules live here once.
//
// A fingerprint: { pattern, repeat, groups, unit, unitSig, unitCols, cols, media, texts, links, mediaRatio, headingBefore, linkAfter, controls,
//   sliderHint, classes: { root, unit, context }, kinds, defaultContent: [{ tag, text }], anchorText, box, bigText, mediaArea }
//   pattern  — the ordered tag pattern of the section with bare wrappers unwrapped and repeats collapsed: `h2 p [picture h3 p a]×6 a`;
//              `×N` after a leaf kind is a run of identical leaves, `[…]×N` a run of composite units (the mode of the members' patterns),
//              `(…)` a cell that mixes media and text or holds a nested repeat; text-only cells inline.
//   repeat   — the member count of the largest repeating unit (by painted area; icon/button runs are controls, not units), 0 when none;
//              when that unit itself holds a repeat (groups of cards under their own headings) the inner unit is the row, `groups` the
//              per-group counts ("3 / 3 / 1") and `repeat` their total.
//   unitSig  — the generalized leaf kinds of that unit, sorted (media, heading, text, link, icon, quote, embed, list, input, rule).
//   classes  — source component class names: the first two non-opaque classes of the section root, of the unit root and of the path
//              between them; opaque = hashed / BEM-state / id-like (`kadence-column290_140c53-da`, `splide__track`, `is-active`).
// Leaf kinds: picture (img/picture/src or a CSS background image), video, embed (iframe), icon (svg), h1–h6, p (any text carrier),
// blockquote, a, button, input, hr, box (paint only — dropped). A node with a background image AND children is a picture cell plus its
// children (a slide, a tile, a hero).

export const OPAQUE = /^[a-z]{1,3}-?[0-9a-f]{5,}$|__|--[0-9]|[0-9]+_[0-9a-f]{4,}|-[0-9a-f]{6,}(?:-|$)|[0-9a-f]{6}-[0-9a-f]{2}$|^(?:is|has|js)-/i;
export const cleanClasses = (cls, max = 2) => String(cls || '').split(/\s+/).filter((c) => c && c.length <= 30 && !OPAQUE.test(c)).slice(0, max);
export const COLLECTIONS = ['hero', 'cards', 'columns', 'tabs', 'accordion', 'carousel', 'quote', 'embed', 'header', 'footer'];

const HEAD = /^h[1-6]$/;
const MEDIA_TAGS = new Set(['img', 'picture', 'video', 'video-js', 'source', 'audio']);
const hasBg = (n) => !!(n.bgi && /url\(/.test(n.bgi));
const tagOf = (n) => String(n.tag || '').toLowerCase();

/** The leaf kind of a node (see the header). */
export function kindOf(n) {
  const tag = tagOf(n);
  if (n.spacer) return 'box'; // an empty source paragraph (`<p>&nbsp;</p>`, `<p><br></p>`) is a spacing measurement, not a text: author reads it, fingerprints do not
  if (tag === 'iframe') return 'embed';
  if (MEDIA_TAGS.has(tag) || n.src) return /video|audio|\.(mp4|webm|m3u8)\b/.test(`${tag} ${n.src || ''}`) ? 'video' : 'picture';
  if (tag === 'svg') return 'icon';
  if (HEAD.test(tag)) return tag;
  if (tag === 'blockquote') return 'blockquote';
  if (tag === 'a') return 'a';
  if (tag === 'button') return 'button';
  if (['input', 'select', 'textarea', 'form'].includes(tag)) return 'input';
  if (tag === 'hr') return 'hr';
  if (tag === 'ul' || tag === 'ol') return n.children?.length ? 'ul' : 'box';
  if (tag === 'li') return n.children?.length ? 'li' : (n.text ? 'p' : 'box');
  if (tag === 'p') return 'p';
  if (n.text) return 'p';
  if (hasBg(n) && !n.children?.length) return 'picture';
  if (!n.children?.length) return 'box';
  return 'group';
}
const COMPOSITE = new Set(['group', 'ul', 'li']);
const isLeaf = (k) => !COMPOSITE.has(k) && k !== 'box';
const CONTROL = new Set(['icon', 'button', 'hr', 'input']);
export const general = (k) => (HEAD.test(k) ? 'heading' : k === 'p' ? 'text' : k === 'blockquote' ? 'quote' : k === 'a' || k === 'button' ? 'link' : k === 'picture' || k === 'video' ? 'media' : k === 'ul' ? 'list' : k === 'hr' ? 'rule' : k);

/** Unwrap a chain of bare single-child wrappers (no text, no background image, one child). Returns the inner node. */
export function unwrap(n) { let x = n; while (x && COMPOSITE.has(kindOf(x)) && x.children?.length === 1 && !hasBg(x)) x = x.children[0]; return x; }
const chain = (n) => { const out = [n]; let x = n; while (x && COMPOSITE.has(kindOf(x)) && x.children?.length === 1 && !hasBg(x)) { x = x.children[0]; out.push(x); } return out; };
const chainClasses = (n, max = 2) => { const seen = []; for (const x of chain(n)) for (const c of cleanClasses(x.cls, 4)) if (!seen.includes(c) && seen.length < max) seen.push(c); return seen; };
const area = (n) => (n.box ? Math.max(0, n.box[2]) * Math.max(0, n.box[3]) : 0);
const textOf = (n) => { if (n.text) return n.text; const acc = []; const walk = (x) => { if (acc.join(' ').length > 120) return; if (x.text) acc.push(x.text); (x.children || []).forEach(walk); }; (n.children || []).forEach(walk); return acc.join(' ') || n.aria || n.alt || ''; };
const fontPx = (n) => { const m = String(n.font || '').match(/(\d+(?:\.\d+)?)px\//); return m ? Number(m[1]) : 0; };
const modeOf = (arr) => { const c = new Map(); arr.forEach((v) => c.set(v, (c.get(v) || 0) + 1)); let best = null; for (const [v, k] of c) if (!best || k > best.count || (k === best.count && v.length > best.value.length)) best = { value: v, count: k }; return best || { value: '', count: 0 }; };
const isRun = (p) => !!p && !p.includes(' ') && !p.includes('×');
const wrapCell = (p, leaves) => (p.includes(' ') && !/^\[[^\]]*\]×\d+$/.test(p) && (p.includes('×') || leaves.some((l) => general(l.kind) === 'media')) ? `(${p})` : p);

/** Recursive analysis: pattern string, leaves (with inRepeat), repeats (each { unit, count, nodes, area, parent, leaves, sig }). */
function analyze(n, depth, parent = null) {
  const k = kindOf(n);
  if (k === 'box') return null;
  if (isLeaf(k)) return { pattern: k, leaves: [{ kind: k, node: n, parent }], repeats: [] };
  const leaves = []; const repeats = []; const parts = [];
  const orig = n.children || []; const kids = orig.map(unwrap);
  // a background image is a picture cell — unless a direct child already is the picture (a tile that paints its image twice: dentsu)
  if (hasBg(n) && !kids.some((c) => general(kindOf(c)) === 'media')) { parts.push('picture'); leaves.push({ kind: 'picture', node: n, bg: true, parent }); }
  const res = kids.map((c) => (depth > 0 || isLeaf(kindOf(c)) ? analyze(c, depth - 1, n) : { pattern: kindOf(c) === 'ul' ? 'ul' : '…', leaves: [], repeats: [], shallow: true }));
  const live = res.filter(Boolean).length;
  let i = 0;
  while (i < kids.length) {
    // a run = consecutive siblings with the same SOURCE tag (before unwrapping: a video slide, an empty slide and five photo slides
    // are all `li`); its members agree when ≥ 2 and ≥ half share the same set of leaf kinds (a left/right alternating row, a card
    // with an extra prefix line, a CTA tile among photo tiles still repeat); the displayed unit is the most frequent member pattern
    let j = i + 1; const key = tagOf(orig[i]);
    while (j < kids.length && tagOf(orig[j]) === key) j++;
    const run = res.slice(i, j); const nodes = kids.slice(i, j);
    const setKey = (r) => (r && r.pattern && r.pattern !== '…' ? sigOf(r.leaves).join('+') : '');
    const mode = modeOf(run.map(setKey));
    if (run.length >= 2 && mode.value && mode.count >= 2 && mode.count / run.length >= 0.5) {
      const agreeing = run.filter((r) => setKey(r) === mode.value); const shown = modeOf(agreeing.map((r) => r.pattern)).value;
      parts.push(isRun(shown) ? `${shown}×${run.length}` : `[${shown}]×${run.length}`);
      const rep = agreeing.find((r) => r.pattern === shown) || agreeing[0];
      const r0 = { unit: shown, count: run.length, nodes, parent: n, area: nodes.reduce((a, c) => a + area(c), 0), leaves: rep.leaves, sig: sigOf(rep.leaves), unitNode: nodes[run.indexOf(rep)] || nodes[0], members: run };
      repeats.push(r0);
      run.forEach((r) => { if (!r) return; r.leaves.forEach((l) => { l.inRepeat = true; }); leaves.push(...r.leaves); repeats.push(...r.repeats); });
    } else {
      run.forEach((r) => { if (!r) return; parts.push(live === 1 && !hasBg(n) ? r.pattern : wrapCell(r.pattern, r.leaves)); leaves.push(...r.leaves); repeats.push(...r.repeats); });
    }
    i = j;
  }
  return { pattern: parts.filter(Boolean).join(' '), leaves, repeats };
}
const sigOf = (leaves) => [...new Set(leaves.map((l) => general(l.kind)))].sort();

/** The cells a unit (or a section) would need as columns: a media leaf is a cell, a run of text / link leaves is one cell, a text-only
 * composite is one cell, a composite that mixes media and text counts its own cells. */
export function cells(n) {
  const x = unwrap(n); const k = kindOf(x);
  if (k === 'box') return 0;
  if (isLeaf(k)) return 1;
  const inner = (x.children || []).map(unwrap);
  let count = hasBg(x) && !inner.some((c) => general(kindOf(c)) === 'media') ? 1 : 0; let textOpen = false;
  for (const c0 of x.children || []) {
    const c = unwrap(c0); const kc = kindOf(c);
    if (kc === 'box' || CONTROL.has(kc)) continue;
    if (general(kc) === 'media') { count++; textOpen = false; continue; }
    if (isLeaf(kc)) { if (!textOpen) { count++; textOpen = true; } continue; }
    const sub = analyze(c, 2); const mixes = sub && sub.leaves.some((l) => general(l.kind) === 'media') && sub.leaves.some((l) => general(l.kind) !== 'media');
    if (mixes) { count += cells(c); textOpen = false; } else if (sub && sub.leaves.every((l) => general(l.kind) === 'media')) { count++; textOpen = false; } else if (!textOpen) { count++; textOpen = true; }
  }
  return Math.max(1, count);
}

function pathTo(root, target) {
  const walk = (n, acc) => { if (n === target) return acc; for (const c of n.children || []) { const r = walk(c, [...acc, c]); if (r) return r; } return null; };
  return walk(root, []) || [];
}

/** The fingerprint of one section root (a node of the dump). `depth` bounds the structural read below the section's items. */
/** The structural read of a section WITH node references — what `fingerprint` summarises, for the generator (`author`): `leaves`
 * ({ kind, node, parent, inRepeat, bg }), `repeats` ({ unit, count, nodes, parent, members, sig, unitNode }) and the pattern. */
export function analyzeSection(root, { depth = 6 } = {}) { return analyze(root, depth) || { pattern: kindOf(root) === 'box' ? '' : kindOf(root), leaves: [], repeats: [] }; }
/** The unit selection `fingerprint` applies to an analysis: the largest repeat by area (control runs excluded); a unit that itself
 * holds a repeat reports the INNER repeat as `unit` with the per-group counts. Returns { outer, inner, unit, groups, controls, units }. */
export function pickUnit(a) {
  const ok = (r) => r.count >= 2 && r.unit !== '…' && !(isRun(r.unit) && CONTROL.has(r.unit));
  const units = a.repeats.filter(ok).sort((x, y) => y.area - x.area);
  const controls = a.repeats.filter((r) => r.count >= 2 && isRun(r.unit) && CONTROL.has(r.unit)).map((r) => `${r.unit}×${r.count}`);
  const u = units[0] || null;
  let inner = null; let groups = null;
  if (u) {
    // only a COMPOSITE repeat inside the unit is a nested row set (cards under group headings); a run of leaves (two paragraphs
    // in every slide) is the unit's own content, not an inner unit
    const nested = u.members.flatMap((m) => (m ? m.repeats.filter((r) => ok(r) && !isRun(r.unit)) : [])).sort((x, y) => y.area - x.area);
    if (nested.length) { inner = nested[0]; groups = u.members.map((m) => { if (!m) return 0; const r = m.repeats.find((x) => x.sig.join('+') === inner.sig.join('+')); return r ? r.count : (sigOf(m.leaves).join('+') === inner.sig.join('+') || m.leaves.some((l) => general(l.kind) === 'media') ? 1 : 0); }); }
  }
  return { outer: u, inner, unit: inner || u, groups, controls, units };
}
export const isControlKind = (k) => CONTROL.has(k);

export function fingerprint(root, { depth = 6 } = {}) {
  const a = analyzeSection(root, { depth });
  // a unit that itself holds a repeat (three groups of stat cards under three headings) reports the INNER unit as the row and the
  // group counts as `groups` (the register's "3 / 3 / 1 × 3"); `repeat` is then the total row count
  const { outer: u, inner, unit, groups, controls } = pickUnit(a);
  const media = a.leaves.filter((l) => general(l.kind) === 'media'); const texts = a.leaves.filter((l) => ['heading', 'text', 'quote'].includes(general(l.kind))); const links = a.leaves.filter((l) => general(l.kind) === 'link');
  const def = a.leaves.filter((l) => !l.inRepeat && ['heading', 'text', 'quote', 'link'].includes(general(l.kind)));
  const y = (n) => (n.box ? n.box[1] : 0); const bottom = (n) => (n.box ? n.box[1] + n.box[3] : 0);
  const uTop = u ? Math.min(...u.nodes.map(y)) : null; const uBottom = u ? Math.max(...u.nodes.map(bottom)) : null;
  const headingBefore = !!(u && def.some((l) => general(l.kind) === 'heading' && y(l.node) < uTop));
  const linkAfter = !!(u && def.some((l) => general(l.kind) === 'link' && y(l.node) >= uBottom - 1));
  const allClasses = []; const collect = (n) => { for (const c of String(n.cls || '').split(/\s+/)) if (c) allClasses.push(c); (n.children || []).forEach(collect); }; collect(root);
  const sliderHint = allClasses.some((c) => /slider|carousel|splide|swiper|slick|glide|flickity|slideshow/i.test(c));
  const context = u ? [...new Set(pathTo(root, unit.parent).concat(unit.parent === root ? [] : [unit.parent]).flatMap((n) => cleanClasses(n.cls, 3)))].slice(0, 6) : [];
  const unitClasses = u ? [...new Set([...chainClasses(unit.unitNode), ...(inner ? chainClasses(u.unitNode) : [])])].slice(0, 3) : [];
  const firstHead = a.leaves.find((l) => general(l.kind) === 'heading' && textOf(l.node)) || a.leaves.find((l) => ['text', 'quote'].includes(general(l.kind)) && textOf(l.node)) || a.leaves.find((l) => textOf(l.node));
  const anchorText = (firstHead ? textOf(firstHead.node) : textOf(root)).replace(/\s+/g, ' ').trim().slice(0, 60);
  const mediaArea = media.reduce((s, l) => s + area(l.node), 0);
  const kinds = sigOf(a.leaves);
  return {
    anchorText, box: root.box || null, pattern: a.pattern, repeat: u ? (groups ? groups.reduce((s, g) => s + g, 0) : u.count) : 0, groups, unit: u ? unit.unit : null, unitSig: u ? unit.sig : [], unitCols: u ? cells(unit.unitNode) : null,
    cols: u ? cells(unit.unitNode) : cells(root), media: media.length, texts: texts.length, links: links.length,
    mediaRatio: media.length + texts.length ? Number((media.length / (media.length + texts.length)).toFixed(2)) : 0,
    headingBefore, linkAfter, controls, sliderHint, classes: { root: chainClasses(root), unit: unitClasses, context }, kinds,
    defaultContent: def.slice(0, 12).map((l) => ({ tag: l.kind, text: textOf(l.node).replace(/\s+/g, ' ').trim().slice(0, 80) })), defaultCount: def.length,
    bigText: Math.max(0, ...texts.map((l) => fontPx(l.node))), mediaArea: root.box ? Number(Math.min(1, mediaArea / Math.max(1, area(root))).toFixed(2)) : 0, leafCount: a.leaves.length,
  };
}

/** Drop the classes that recur across ≥ `min` sections of one page (layout utilities such as an inner-column wrapper) from every
 * fingerprint's classes — they match everything and mean nothing. Returns the dropped list. */
export function dropGeneric(fps, min = 3) {
  const count = new Map();
  for (const f of fps) for (const c of new Set([...f.classes.root, ...f.classes.unit, ...f.classes.context])) count.set(c, (count.get(c) || 0) + 1);
  const generic = [...count].filter(([, k]) => k >= min && fps.length >= min).map(([c]) => c);
  for (const f of fps) for (const key of ['root', 'unit', 'context']) f.classes[key] = f.classes[key].filter((c) => !generic.includes(c));
  return generic;
}
export const allClasses = (fp) => [...new Set([...(fp.classes?.root || []), ...(fp.classes?.unit || []), ...(fp.classes?.context || [])])];

/** Split a content dump into header / main sections / footer. The main sections are the children of the first node under the main root
 * that has more than one child (bare wrappers unwrapped); a child that is itself a `main` / `article`, or holds ≥ 3 children and ≥ half
 * the root's height, is flattened into its children (a hero before `main` plus `main`'s modules — dentsu). `--sections` gives simple
 * selectors (`tag.class#id`) matched against the dump's nodes instead; `root` names the dump key (default `main`, else the first key
 * that is not header / footer / hidden). */
export function splitSections(dump, { root = null, sections = null } = {}) {
  const keys = Object.keys(dump).filter((k) => !k.startsWith('__') && !k.startsWith('hidden '));
  const headerKey = keys.find((k) => /^header\b/.test(k)) || null; const footerKey = keys.find((k) => /^footer\b/.test(k)) || null;
  const tallest = (ks) => ks.map((k) => [k, Math.max(0, ...(Array.isArray(dump[k]) ? dump[k] : [dump[k]]).filter((n) => n?.box).map((n) => n.box[3]))]).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const mainKey = root || keys.find((k) => k === 'main') || tallest(keys.filter((k) => k !== headerKey && k !== footerKey)) || null; // a renamed content root (`#content`, `div.main-container`) is the tallest non-chrome root, not the first key
  const roots = mainKey ? (dump[mainKey] || []) : [];
  // the extra roots measure-page dumped (unassigned bands: a breadcrumb bar, a promo bar outside main) are sections of their own, in the dump's order
  const extraKeys = keys.filter((k) => k !== headerKey && k !== footerKey && k !== mainKey); const beforeMain = extraKeys.filter((k) => keys.indexOf(k) < keys.indexOf(mainKey)); const afterMain = extraKeys.filter((k) => keys.indexOf(k) > keys.indexOf(mainKey));
  // …except the chrome dumped twice (exp/five-min, wellsfargo replay: the utility nav INSIDE the header box, the legal links inside the footer,
  // a link-only mega-menu bar under the header read as four accordion sections and tripled the page): a band inside a header / footer
  // node's box, or a link-only band touching the header's bottom / after main, belongs to the chrome
  const chromeBoxes = [headerKey, footerKey].filter(Boolean).flatMap((k) => (Array.isArray(dump[k]) ? dump[k] : [dump[k]])).filter((n) => n?.box && n.box[3] > 0).map((n) => n.box);
  const inside = (b, c) => { const ix = Math.max(0, Math.min(b[0] + b[2], c[0] + c[2]) - Math.max(b[0], c[0])); const iy = Math.max(0, Math.min(b[1] + b[3], c[1] + c[3]) - Math.max(b[1], c[1])); return b[2] * b[3] > 0 && (ix * iy) / (b[2] * b[3]) >= 0.8; };
  const leaves = (n, out = []) => { if (n.text || !(n.children || []).length) out.push(n); else n.children.forEach((c) => (['a', 'button'].includes(tagOf(c)) ? out.push(c) : leaves(c, out))); return out; };
  const linkOnly = (n) => { const l = leaves(n).filter((x) => x.text || ['img', 'picture', 'svg', 'video'].includes(tagOf(x))); return l.length > 0 && l.every((x) => ['a', 'button'].includes(tagOf(x))); };
  const headerBottom = Math.max(0, ...chromeBoxes.filter((b) => b[1] < 400).map((b) => b[1] + b[3]));
  const isChrome = (n, after) => !!n.box && (chromeBoxes.some((c) => inside(n.box, c)) || (linkOnly(n) && (after || (headerBottom && n.box[1] <= headerBottom + 8))));
  const extras = (ks, after = false) => ks.flatMap((k) => (Array.isArray(dump[k]) ? dump[k] : [dump[k]]).filter((n) => n && typeof n === 'object' && !isChrome(n, after)));
  let secs = [];
  // nodes measure-page marked `sec: true` (its --sections selector) split the dump as the spec and the gate split the page (loop r3)
  const marked = []; const findMarked = (n) => { if (n.sec) { marked.push(n); return; } (n.children || []).forEach(findMarked); }; roots.forEach(findMarked);
  if (marked.length && !(sections && sections.length)) secs = marked;
  else if (sections && sections.length) {
    const match = (n, sel) => { const m = sel.match(/^([a-z][\w-]*)?((?:\.[\w-]+)*)(#[\w-]+)?$/i); if (!m) return false; const [, tag, cls, id] = m; const have = String(n.cls || '').split(/\s+/); return (!tag || tagOf(n) === tag.toLowerCase()) && (!id || n.id === id.slice(1)) && cls.split('.').filter(Boolean).every((c) => have.includes(c)); };
    const walk = (n) => { if (sections.some((s) => match(n, s))) { secs.push(n); return; } (n.children || []).forEach(walk); };
    roots.forEach(walk);
  } else if (roots.length > 1) secs = roots;
  else if (roots.length === 1) {
    let n = roots[0]; while (n.children?.length === 1 && !n.text) n = n.children[0];
    const h = n.box ? n.box[3] : 0;
    // flattened only when its children are modules (composite nodes), not a run of leaves: a one-module page whose text column holds 52
    // paragraphs read as 52 one-paragraph rows (sdt-dentsu cookies-notice, responsible-disclosure)
    const composite = (x) => { const u = unwrap(x); const k = kindOf(u); return COMPOSITE.has(k) && (u.children || []).length > 0; };
    for (const c0 of n.children || []) {
      const c = unwrap(c0); const ch = c.box ? c.box[3] : 0; const kids = c.children || [];
      const mostlyModules = kids.filter(composite).length * 2 >= kids.length;
      const flat = (kids.length >= 2) && ((['main', 'article'].includes(tagOf(c)) || kids.length >= 3) && h && ch >= h * 0.5) && !hasBg(c) && mostlyModules;
      if (flat) secs.push(...kids); else secs.push(c0);
    }
  }
  const extraCount = extras(beforeMain).length + extras(afterMain, true).length; if (extraCount) secs = [...extras(beforeMain), ...secs, ...extras(afterMain, true)];
  return { header: headerKey ? dump[headerKey]?.[0] || null : null, footer: footerKey ? dump[footerKey]?.[0] || null : null, sections: secs, mainKey, headerKey, footerKey, marked: marked.length && secs.includes(marked[0]) ? marked.length : 0, extraRoots: extraCount };
}

/** The Block Collection shape a fingerprint suggests (null = default content or nothing recognisable); never more than a guess. */
export function collectionGuess(fp) {
  const u = new Set(fp.unitSig || []); const k = new Set(fp.kinds || []);
  const r = { collection: null, alternatives: [], reason: '' };
  if (fp.repeat >= 2) {
    if (fp.sliderHint || fp.controls?.length) return { collection: 'carousel', alternatives: ['cards'], reason: `repeating unit ×${fp.repeat} with controls ${fp.controls?.join(' ') || ''}${fp.sliderHint ? ' and slider classes' : ''}`.trim() };
    if (u.has('media') && (u.has('heading') || u.has('text') || u.has('link'))) return fp.repeat >= 3 ? { collection: 'cards', alternatives: ['columns'], reason: `media + text unit ×${fp.repeat}` } : { collection: 'columns', alternatives: ['cards'], reason: `media + text unit ×${fp.repeat}` };
    if (u.has('media') && u.size === 1) return { collection: 'cards', alternatives: [], reason: `media-only unit ×${fp.repeat} (logos)` };
    if (u.has('media')) return { collection: 'cards', alternatives: ['carousel'], reason: `media unit ×${fp.repeat}` };
    if (!u.has('media') && (u.has('heading') || u.has('link')) && !u.has('text')) return { collection: 'accordion', alternatives: ['tabs', 'columns'], reason: `heading/link-only unit ×${fp.repeat} (hidden panels are not in the dump)` };
    if (!u.has('media') && u.has('text')) return fp.repeat >= 3 && u.has('heading') ? { collection: 'columns', alternatives: ['cards'], reason: `text unit ×${fp.repeat}` } : { collection: null, alternatives: ['columns'], reason: `text run ×${fp.repeat} without media: default content (a columns block needs ≥ 3 headed units)` }; // two paragraphs read as "columns? weak" on an article page (covermore, loop r6)
    return r;
  }
  if (k.has('quote') || (fp.texts === 1 && fp.media === 0 && !k.has('heading') && fp.bigText >= 32)) return { collection: 'quote', alternatives: [], reason: k.has('quote') ? 'blockquote' : `one paragraph at ${fp.bigText}px` };
  if (k.has('embed') && k.size === 1) return { collection: 'embed', alternatives: [], reason: 'an iframe alone' };
  if (fp.media >= 1 && (k.has('h1') || k.has('heading')) && (fp.mediaArea >= 0.8 || k.has('h1')) && fp.texts <= 3) return { collection: 'hero', alternatives: ['columns'], reason: `media covering ${Math.round(fp.mediaArea * 100)} % with ${k.has('h1') ? 'an h1' : 'a heading'}` };
  if (fp.media >= 1 && (k.has('heading') || k.has('text')) && fp.cols === 2) return { collection: 'columns', alternatives: ['hero'], reason: 'one media cell beside one text cell' };
  if (fp.media >= 1 && fp.texts === 0 && fp.links === 0) return { collection: 'embed', alternatives: ['hero'], reason: 'media alone' };
  if (fp.media === 0 && fp.leafCount && [...k].every((x) => ['heading', 'text', 'link', 'icon', 'rule'].includes(x))) return { collection: null, alternatives: [], reason: 'default content (headings, paragraphs, links)' };
  return r;
}
const jaccard = (a, b) => { const A = new Set(a || []); const B = new Set(b || []); const i = [...A].filter((x) => B.has(x)).length; const u = new Set([...A, ...B]).size; return u ? i / u : 0; };
const sameSet = (a, b) => jaccard(a, b) === 1 && (a || []).length > 0;

/** Match one fingerprint against the inventory rows (blocks.json `blocks[]`). Returns { kind: inventory|collection|new|default, block,
 * variant, confidence: strong|weak|null, candidates, guess, notes }. Strong = a source class in common or an identical fingerprint;
 * weak = the same repeating unit kinds, overlapping kinds, or the same cells repeated vs not; below that the collection guess decides
 * between `collection` (the site has a block of that collection) and `new`. Ties across different blocks stay weak with both named. */
export function matchSection(fp, blocks, { chrome = null } = {}) {
  const notes = []; const guess = collectionGuess(fp);
  if (chrome) { const row = blocks.find((b) => b.name === chrome); return row ? { kind: 'inventory', block: chrome, variant: row.variant, confidence: 'strong', candidates: [], guess: { collection: chrome }, notes: [`${chrome} fragment block in the inventory (approved in ${row.approvedIn || '?'})`] } : { kind: 'new', block: chrome, variant: null, confidence: null, candidates: [], guess: { collection: chrome }, notes: [`no ${chrome} block in the inventory`] }; }
  const mine = new Set(allClasses(fp));
  const cands = [];
  for (const b of blocks) {
    if (['header', 'footer'].includes(b.name)) continue;
    const sig = b.sourceSignature || {}; const f = sig.fingerprint || null; let score = 0; const why = [];
    const common = (sig.classes || []).filter((c) => mine.has(c));
    if (common.length) { score = 1; why.push(`class ${common.join(' ')}`); }
    if (f) {
      if (f.pattern && f.pattern === fp.pattern) { score = Math.max(score, 1); why.push('identical fingerprint'); } else if (fp.repeat >= 2 && f.repeat >= 2 && sameSet(f.unitSig, fp.unitSig)) { score = Math.max(score, 0.7); why.push(`unit ${fp.unitSig.join('+')} ×${fp.repeat} vs ×${f.repeat}`); } else if (fp.repeat >= 2 && f.repeat >= 2 && jaccard(f.unitSig, fp.unitSig) >= 0.5 && (f.unitSig || []).filter((k) => fp.unitSig.includes(k)).length >= 2) { score = Math.max(score, 0.5); why.push(`unit kinds overlap ${fp.unitSig.join('+')} ~ ${(f.unitSig || []).join('+')}`); } else if (fp.repeat >= 2 && f.repeat < 2 && sameSet(f.kinds, fp.unitSig)) { score = Math.max(score, 0.5); why.push(`its cells (${fp.unitSig.join('+')}) repeated ×${fp.repeat}`); } else if (fp.repeat < 2 && f.repeat >= 2 && sameSet(f.unitSig, fp.kinds)) { score = Math.max(score, 0.5); why.push(`one row of its unit (${fp.kinds.join('+')})`); } else if (fp.repeat < 2 && f.repeat < 2 && jaccard(f.kinds, fp.kinds) >= 0.6 && f.cols === fp.cols) { score = Math.max(score, 0.55); why.push(`same leaf kinds ${fp.kinds.join('+')}, ${fp.cols} cell(s)`); }
    }
    if (score > 0 && guess.collection && b.collection === guess.collection) { score += 0.15; why.push(`collection ${b.collection}`); }
    if (score > 0 && score < 0.95 && (fp.sliderHint || fp.controls?.length) && b.collection !== 'carousel') { score -= 0.3; why.push(`slider controls present, ${b.name} is not a carousel`); }
    if (score > 0) cands.push({ block: b.name, variant: b.variant, score: Number(score.toFixed(2)), why: why.join('; ') });
  }
  cands.sort((x, y) => y.score - x.score);
  const best = cands[0];
  if (best && best.score >= 0.55) {
    const tied = cands.filter((c) => best.score - c.score < 0.2 && c !== best);
    const otherBlock = tied.filter((c) => c.block !== best.block);
    let confidence = best.score >= 0.95 ? 'strong' : 'weak';
    if (otherBlock.length) { confidence = 'weak'; notes.push(`ambiguous: ${[best, ...otherBlock].map((c) => `${c.block}${c.variant ? ` (${c.variant})` : ''} ${c.score}`).join(' | ')}`); }
    const sameBlock = tied.filter((c) => c.block === best.block);
    if (sameBlock.length) notes.push(`variants tie: ${[best, ...sameBlock].map((c) => c.variant || 'default').join(' | ')}`);
    notes.push(best.why);
    return { kind: 'inventory', block: best.block, variant: best.variant, confidence, candidates: cands.slice(0, 4), guess, notes };
  }
  if (guess.collection) {
    const have = blocks.filter((b) => b.collection === guess.collection);
    if (have.length) { notes.push(`collection match only: ${guess.collection} (${guess.reason}); inventory has ${have.map((b) => `${b.name}${b.variant ? ` (${b.variant})` : ''}`).join(', ')}`); if (guess.alternatives.length) notes.push(`or ${guess.alternatives.join(' / ')}`); return { kind: 'collection', block: have[0].name, variant: null, confidence: 'weak', candidates: cands.slice(0, 4), guess, notes }; }
    notes.push(`no inventory match; collection ${guess.collection} (${guess.reason})${guess.alternatives.length ? `, or ${guess.alternatives.join(' / ')}` : ''}`);
    return { kind: 'new', block: guess.collection, variant: null, confidence: 'weak', candidates: cands.slice(0, 4), guess, notes };
  }
  if (guess.reason) { notes.push(guess.reason); return { kind: 'default', block: null, variant: null, confidence: null, candidates: [], guess, notes }; }
  notes.push('no inventory match and no collection shape recognised');
  return { kind: 'new', block: null, variant: null, confidence: null, candidates: cands.slice(0, 4), guess, notes };
}

/** `rows × cols` a container would need for this section (repeat × unit cells; `1 × cells` when nothing repeats). */
export const rowsCols = (fp) => (fp.repeat >= 2 ? `${fp.groups ? fp.groups.filter(Boolean).join(' / ') : fp.repeat} × ${fp.unitCols || fp.cols}` : `1 × ${fp.cols || 1}`);
