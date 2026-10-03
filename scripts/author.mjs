#!/usr/bin/env node
// author.mjs — the authored document from a page's triage and its content dump through the inventory's recipes (SCALING-PLAN §2.E,
// batch-7 rollout pass 4): the nine per-case `build-doc` scripts become one engine. Pure Node, no browser. The dump is the capture:
// every text is written verbatim from it (inline markup kept: strong, em, a, sup, sub, br; `<br><br>` splits a paragraph), never
// typed, never truncated; `harness --content` and the lint stay the gates.
//   default section  → default content as the dump holds it: headings at their level, paragraphs, a picture in its own <p>, lists, a
//                      filled link as a bold button, an outlined one as an italic button, an svg / icon-font glyph as `:name:`
//   inventory / collection section → the block table per the row's recipe (lib/recipes.mjs): one row per unit member, the unit's leaves
//                      bucketed into cells by their dump kinds (two cells that accept the same kind split on a structural boundary, `take`
//                      bounds the first), default content outside the units stays outside the table in reading order; a lone node shaped
//                      like the unit is a 1-row block; an <hr> before it names the `divider` variant when the inventory has one; the
//                      k-th unit with a dead link (`javascript:` / `#`) takes the k-th root of the extra content sources for a `hidden` cell
//   new section      → default content under `<!-- NEW: <fingerprint> — model this block -->`; the run exits 3 after writing: triage first
//   section-metadata → the triage row's `sectionStyle` (edit the JSON, or `triage --from-md`) else the recipe's; the page `metadata` block
//                      (title, description from the dump's head data, nav / footer paths from the profile) ends the document
//   media            → every src through media-fetch's manifest (source URL → <branch host><media folder>/<file>); an unknown source is
//                      kept and listed; lazy sources are the dump's `src` already
// Then the lint runs on the output (exit 2 on a 🔴, the document is written anyway) and a stderr table says per section what was emitted
// (block / default / new), cells filled, texts, with the warnings: unknown media, empty cells, leaves that did not fit the recipe.
// Usage: node author.mjs <triage.json> --content content.json[,clicks.json,hidden.json] --blocks migration/blocks.json --out doc/<slug>.html
//        [--media media/manifest.json] [--media-host https://<branch-host>/drafts/media] [--nav doc/nav.html --footer doc/footer.html]
//        [--site migration/site.json] [--nav-path /drafts/nav --footer-path /drafts/footer] [--url <page url>] [--no-lint] [--keep-spacers] [--draft-new]
//   --draft-new   a template page on an empty inventory: a NEW section whose triage row names a Block Collection shape (hero, cards, tabs, …)
//                 is drafted through that shape's default recipe (lib/recipes.mjs COLLECTION) instead of stopping the run — the model is
//                 still the triage's to approve; every case had written its own generator here (scotiabank-personal, loop r1)
//   --keep-spacers  write the source's empty paragraphs (`<p>&nbsp;</p>`, `<p><br></p>` — the collector marks them `spacer`) as a
//               zero-width-space paragraph, the only empty line box the pipeline keeps; by default they are DROPPED and counted on
//               stderr with their height (METHOD names the zero-width spacer an anti-pattern: model the rhythm, or file the Δh)
//   What the dump carries is what is written: `&nbsp;` stays `&nbsp;` (the pipeline keeps an inner one, trims a trailing one), a
//   `strong` / `em` read as a node of its own keeps its weight, a section root's own background-image is the picture (`bgiUrl` when the
//   collector cut `bgi`; a cut URL is a warning, never a picture).
//   --content   the dump the triage was made from first; every further file is an extra source (click-dump, --hidden dump, modals) whose
//               roots feed `hidden` recipe cells in order and count as capture for the texts
//   --media     media-fetch's manifest.json; the branch host and folder come from the profile (`media.branchHost`, `media.folder`) or
//               --media-host; without a manifest every source URL is kept as is (and listed)
//   --nav / --footer  write the chrome documents from the dump's header / footer roots in the simplest shape ONLY when the file does not
//               exist yet (chrome is site work, authored once); an existing file is left alone
// Exit: 0 written and lint clean · 2 lint 🔴 · 3 a NEW section (document written, model the block first) · 1 usage / input error
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { arg, siteProfile, davidsLint } from './common.mjs';
import { splitSections, analyzeSection, pickUnit, kindOf, unwrap, general } from './lib/fingerprint.mjs';
import { defaultRecipe, recipeKind } from './lib/recipes.mjs';

const triageFile = process.argv[2];
if (!triageFile || triageFile.startsWith('--')) { console.error('usage: author.mjs <triage.json> --content content.json[,hidden.json…] --blocks migration/blocks.json --out doc/<slug>.html [--media media/manifest.json] [--media-host <url>] [--nav doc/nav.html --footer doc/footer.html] [--site migration/site.json] [--url <page url>] [--no-lint]'); process.exit(1); }
const readJson = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };
const triage = readJson(resolve(triageFile)); if (!triage?.sections) { console.error(`author: ${triageFile} is not a triage JSON`); process.exit(1); }
const contentFiles = String(arg('--content', triage._source?.content || '')).split(',').map((s) => s.trim()).filter(Boolean);
if (!contentFiles.length) { console.error('author: --content <content.json> is required (the triage names none)'); process.exit(1); }
const dump = readJson(resolve(contentFiles[0])); if (!dump) { console.error(`author: ${contentFiles[0]} unreadable`); process.exit(1); }
const extras = contentFiles.slice(1).map((f) => ({ f, json: readJson(resolve(f)) })); for (const e of extras) if (!e.json) { console.error(`author: ${e.f} unreadable`); process.exit(1); }
const blocksFile = resolve(arg('--blocks', triage._source?.blocks || 'migration/blocks.json')); const inventory = readJson(blocksFile)?.blocks || [];
if (!inventory.length) console.error(`author: ${blocksFile} has no blocks — every inventory match falls back to the default recipe`);
const out = resolve(arg('--out', `doc/${(triage.page?.title || 'page').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}.html`));
const profile = siteProfile();
const manifestFile = arg('--media', null); const manifest = manifestFile ? readJson(resolve(manifestFile)) : null;
if (manifestFile && !manifest) { console.error(`author: ${manifestFile} unreadable`); process.exit(1); }
const mediaHost = arg('--media-host', null) || (profile?.media?.branchHost && profile?.media?.folder ? `${profile.media.branchHost}${profile.media.folder}` : null);
if (manifest && !mediaHost) console.error('author: a manifest without a branch host — pass --media-host <https://branch-host/drafts/media> or --site; file names are written bare');
const navPath = arg('--nav-path', profile?.chrome?.fragments?.nav || null); const footerPath = arg('--footer-path', profile?.chrome?.fragments?.footer || null);
const pageUrl = arg('--url', profile?.origin || null);
const warnings = []; const warn = (m) => warnings.push(m);

// ───────────────────────────── the dump: sections, hidden roots ─────────────────────────────
const split = splitSections(dump, { root: triage._source?.root || null, sections: triage._source?.sections || null });
const mainSections = triage.sections.filter((s) => !s.chrome);
if (split.sections.length !== mainSections.length) { console.error(`author: the dump splits into ${split.sections.length} sections, the triage has ${mainSections.length} — same dump and --root / --sections as the triage?`); process.exit(1); }
const hiddenRoots = []; // in reading order across the extra sources: the k-th feeds the k-th unit with a dead link
for (const { json } of extras) for (const [k, v] of Object.entries(json)) { if (k.startsWith('__')) continue; const nodes = Array.isArray(v) ? v : [v]; const roots = nodes.length === 1 && nodes[0]?.children?.length > 1 && !nodes[0].text ? nodes[0].children : nodes; hiddenRoots.push(...roots.filter((n) => n && typeof n === 'object')); }
let hiddenNext = 0;

// ───────────────────────────── media, links, text ─────────────────────────────
const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\u00a0/g, '&nbsp;');
const keepSpacers = process.argv.includes('--keep-spacers'); const spacers = [];
const unknownMedia = new Set();
const mediaKey = (u) => { const cands = [u]; try { cands.push(decodeURI(u)); } catch { /* keep */ } try { cands.push(encodeURI(decodeURI(u))); } catch { /* keep */ } cands.push(u.replace(/ /g, '%20')); return cands; };
function rewriteMedia(src) {
  if (!src) return src;
  const abs = (() => { try { return new URL(src, pageUrl || undefined).href; } catch { return src; } })();
  if (manifest) { for (const k of mediaKey(abs)) if (manifest[k]) return mediaHost ? `${mediaHost.replace(/\/$/, '')}/${manifest[k]}` : manifest[k]; const byPath = Object.keys(manifest).find((k) => { try { return new URL(k).pathname === new URL(abs).pathname; } catch { return false; } }); if (byPath) return mediaHost ? `${mediaHost.replace(/\/$/, '')}/${manifest[byPath]}` : manifest[byPath]; }
  unknownMedia.add(abs); return abs;
}
const bgUrl = (n) => { if (n.bgiUrl && !n.bgiUrl.startsWith('data:')) return n.bgiUrl; const m = /url\(("|')?([^"')]+)\1\)/.exec(n.bgi || ''); return m && !m[2].startsWith('data:') ? m[2] : null; };
// `bgi` is cut at 160 chars in the dump: a long CDN URL has no closing `)` and is no picture — say so instead of writing nothing silently
const bgCut = (n) => !!(n.bgi && !n.bgiUrl && /url\(/.test(n.bgi) && !/\)/.test(n.bgi.slice(n.bgi.indexOf('url('))));
const bgCutWarn = (n) => warn(`background-image URL cut in the dump for <${n.tag || 'div'}${n.cls ? `.${String(n.cls).split(' ')[0]}` : ''}> (older collector: 160 chars) — no picture written; re-dump with the current collector (bgiUrl) and media-fetch the URL`);
const isDead = (href) => !href || /^\s*(javascript:|#\s*$|void\(0\))/i.test(href);
function href(h) {
  if (!h) return null;
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(h)) return h;
  if (pageUrl) { try { return new URL(h, pageUrl).href; } catch { return h; } }
  warn(`document-relative href kept (no --url / profile origin to resolve it): ${h}`); return h;
}
const KEEP = new Set(['a', 'strong', 'em', 'sup', 'sub', 'br']);
/** The inline markup of a text node, cleaned to the authoring set; the plain text when the dump holds no (complete) markup. */
function inline(n) {
  // a `strong` / `em` the collector read as the text node itself (its paragraph held nothing else) keeps its weight
  const ownTag = /^(strong|b)$/.test(n.tag || '') ? 'strong' : /^(em|i)$/.test(n.tag || '') ? 'em' : null;
  const wrapOwn = (t) => (ownTag && t && !new RegExp(`^<${ownTag}>`).test(t) ? `<${ownTag}>${t}</${ownTag}>` : t);
  const src = n.markupFull || (n.markup && n.markup.length < 600 ? n.markup : null);
  if (!src) { if (n.markup && n.markup.length >= 600) warn(`inline markup cut at 600 chars in the dump (re-dump: the collector now keeps markupFull) — plain text written for "${String(n.text).slice(0, 40)}…"`); return wrapOwn(esc(n.text || '')); }
  let s = src.replace(/<!--[\s\S]*?-->/g, '').replace(/&nbsp;|\u00a0/g, '\u0004'); // the source's non-breaking spaces survive the whitespace collapse below
  s = s.replace(/<\/?([a-z][a-z0-9-]*)\b([^>]*)>/gi, (m, tag, attrs) => {
    const t = tag.toLowerCase(); const close = m.startsWith('</');
    if (t === 'b') return close ? '</strong>' : '<strong>'; if (t === 'i') return close ? '</em>' : '<em>';
    if (!KEEP.has(t)) return '';
    if (t === 'br') return '<br>';
    if (t === 'a' && !close) { const hm = /\bhref\s*=\s*"([^"]*)"|\bhref\s*=\s*'([^']*)'/i.exec(attrs); const h = hm ? (hm[1] ?? hm[2]) : null; return isDead(h) ? '\u0002' : `<a href="${esc(href(h))}">`; }
    if (t === 'a' && close) return '\u0003';
    return close ? `</${t}>` : `<${t}>`;
  });
  // a dead link's text stays as text; a kept link closes normally
  s = s.replace(/\u0002([\s\S]*?)\u0003/g, '$1').replace(/\u0003/g, '</a>').replace(/\u0002/g, '');
  s = s.replace(/\s+/g, ' ').replace(/\s*<br>\s*/g, '<br>').trim();
  s = s.replace(/^(<br>)+|(<br>)+$/g, '').replace(/\s+(<\/(?:strong|em|a)>)/g, '$1').trim();
  s = s.replace(/\u0004/g, '&nbsp;');
  return wrapOwn(s.replace(/^(&nbsp;)+$/, '')) || wrapOwn(esc(n.text || ''));
}
/** Paragraph(s) from a text node: `<br><br>` is a paragraph break. */
const paragraphs = (n) => inline(n).split(/(?:<br>){2,}/).map((t) => t.replace(/^(<br>)+|(<br>)+$/g, '').trim()).filter(Boolean);
const textOfTree = (n) => { if (n.text) return n.text; const acc = []; const walk = (x) => { if (x.text) acc.push(x.text); (x.children || []).forEach(walk); }; (n.children || []).forEach(walk); return acc.join(' ').replace(/\s+/g, ' ').trim(); };
const iconName = (n) => { const raw = n.icon || (n.use ? n.use.replace(/^.*#/, '') : null) || n.id || n.label || n.aria || n.alt || 'icon'; const s = String(raw).toLowerCase().replace(/^(icon-|svg-|i-)/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); return s || 'icon'; };
const SMALL_SVG = 64;
const isIconImg = (n) => kindOf(n) === 'picture' && /\.svg(\?|$)/i.test(n.src || '') && n.box && Math.max(n.box[2], n.box[3]) <= SMALL_SVG;

// ───────────────────────────── leaves ─────────────────────────────
const hasBg = (n) => !!bgUrl(n);
const MEDIA = (k) => general(k) === 'media';
const CONTROL = new Set(['button', 'input']);
/** The ordered leaves under a node: { kind (recipe kind), raw (dump kind), node, top (index of the top-level child), parent }. A list is
 * one leaf; a link is one leaf (its children are its label); a background image is a picture leaf before the node's children. */
function leavesOf(root) {
  const out = [];
  // `top` numbers the structural children of the section's first node with several children — through a chain of single-child wrappers
  // (a bordered block holding the title and the row): with the root's own index every leaf read `top 0` and the recipe's
  // defaultContentBefore never peeled a title (sdt-dentsu beyond-the-funnel, the profiles)
  let start = root; while (start && !start.text && !start.src && (start.children || []).length === 1) start = start.children[0];
  const walk = (n, top, parent, depth) => {
    if (n.spacer) { if (keepSpacers) out.push({ kind: 'text', raw: 'p', node: n, spacer: true, top, parent }); else spacers.push(n); return; }
    const k = kindOf(n);
    if (k === 'box') return;
    const kids = (n.children || []);
    if (hasBg(n) && !kids.map(unwrap).some((c) => MEDIA(kindOf(c)))) out.push({ kind: 'picture', raw: 'picture', node: n, bg: true, top, parent });
    else if (bgCut(n) && !kids.map(unwrap).some((c) => MEDIA(kindOf(c)))) bgCutWarn(n);
    if (k === 'ul') { if (isControlList(n)) { out.push({ kind: 'control', raw: 'ul', node: n, top, parent }); return; } if (isTextList(n)) { out.push({ kind: 'list', raw: 'ul', node: n, top, parent }); return; } kids.forEach((c, i) => walk(c, n === start ? i : top, n, depth + 1)); return; }
    if (k === 'picture' || k === 'video' || k === 'embed' || k === 'icon' || k === 'a' || /^h[1-6]$/.test(k) || k === 'p' || k === 'blockquote' || k === 'hr' || CONTROL.has(k)) {
      if (k === 'picture' && hasBg(n) && !n.src) return; // already pushed as the bg leaf
      out.push({ kind: k === 'hr' ? 'hr' : CONTROL.has(k) ? 'control' : isIconImg(n) ? 'icon' : recipeKind(k), raw: k, node: n, top, parent });
      if (k !== 'a' && k !== 'p' && !/^h[1-6]$/.test(k)) return;
      // a paragraph / heading / link with children: its children are its label (spans) unless they are block-level leaves of their own
      if (k === 'p' || /^h[1-6]$/.test(k) || k === 'a') { const own = kids.map(unwrap).filter((c) => { const ck = kindOf(c); return MEDIA(ck) || ck === 'ul' || /^h[1-6]$/.test(ck) || (k === 'a' && ck === 'p' && n.text); }); if (!own.length) return; own.forEach((c) => walk(c, top, n, depth + 1)); }
      return;
    }
    kids.forEach((c, i) => walk(c, n === start ? i : top, n, depth + 1));
  };
  walk(root, -1, null, 0);
  return out;
}
/** A list is authored as a list when its items carry text and links only; a list of slides / tiles / logos is structure. */
function isTextList(ul) { const a = analyzeSection(ul); return a.leaves.length > 0 && a.leaves.some((l) => ['p', 'a', 'li'].includes(l.kind)) && a.leaves.every((l) => ['p', 'a', 'li', 'icon', 'ul'].includes(l.kind) || /^h[1-6]$/.test(l.kind) === false && ['text', 'link', 'list'].includes(general(l.kind)) && l.kind !== 'button'); }
/** A list whose items are all controls (a slider's pagination buttons) is not content. */
function isControlList(ul) { const a = analyzeSection(ul); return a.leaves.length > 0 && a.leaves.every((l) => ['button', 'input', 'icon'].includes(l.kind)); }
const sigOf = (leaves) => [...new Set(leaves.filter((l) => !['hr', 'control', 'icon'].includes(l.kind)).map((l) => l.kind))].sort().join('+');

// ───────────────────────────── emission ─────────────────────────────
const stats = { texts: 0 };
const pictureHtml = (n, alt, wrap = 'p') => { const src = rewriteMedia(n.src || bgUrl(n)); const pic = `<picture><img src="${esc(src)}" alt="${esc(alt ?? n.alt ?? '')}"></picture>`; return wrap === 'p' ? `<p>${pic}</p>` : pic; };
const weightOf = (n, force) => (force && force !== 'plain' ? force : force === 'plain' ? null : n.bg && !/rgba\(0, 0, 0, 0\)/.test(n.bg) ? 'strong' : n.border && !n.bg ? 'em' : null);
function linkHtml(n, force, { altHint } = {}) {
  const h = href(n.href); const dead = isDead(n.href);
  const imgs = (n.children || []).map(unwrap).filter((c) => kindOf(c) === 'picture');
  const label = n.text ? inline(n) : esc(textOfTree(n) || '');
  const icon = kindOf(n) === 'a' && !label && !imgs.length && ((n.children || []).some((c) => kindOf(c) === 'icon') || n.aria || n.title) ? `:${iconName((n.children || []).find((c) => kindOf(c) === 'icon') || n)}:` : null;
  if (imgs.length && !label) { const pics = imgs.map((i) => (isIconImg(i) ? `:${iconName({ alt: basename(i.src || '').replace(/\.[a-z0-9]+$/, '') })}:` : pictureHtml(i, i.alt ?? n.aria ?? altHint ?? '', null))).join(''); if (dead) return `<p>${pics}</p>`; return `<p><a href="${esc(h)}"${n.aria ? ` title="${esc(n.aria)}"` : ''}>${pics}</a></p>`; }
  const text = label || icon || esc(n.aria || n.title || '');
  if (!text) return '';
  if (dead) return label ? `<p>${label}</p>` : '';
  stats.texts += label ? 1 : 0;
  const w = weightOf(n, force); const a = `<a href="${esc(h)}"${!label && (n.aria || n.title) ? ` title="${esc(n.aria || n.title)}"` : ''}>${text}</a>`;
  return `<p>${w ? `<${w}>${a}</${w}>` : a}</p>`;
}
function listHtml(n, force) {
  const items = (n.children || []).filter((c) => kindOf(c) !== 'box').map((li) => {
    if (kindOf(li) !== 'li' && li.tag !== 'li') { return `<li>${leafInline(li, force)}</li>`; }
    const kids = li.children || []; const nested = kids.filter((c) => kindOf(unwrap(c)) === 'ul'); const own = kids.filter((c) => !nested.includes(c));
    const label = [li.text ? inline(li) : '', ...own.map((c) => leafInline(unwrap(c), force))].filter(Boolean).join(' ');
    if (label) stats.texts += 1;
    return `<li>${label}${nested.map((u) => listHtml(unwrap(u), force)).join('')}</li>`;
  });
  const kept = items.filter((li) => li !== '<li></li>'); if (!kept.length) return '';
  return `<${n.tag === 'ol' ? 'ol' : 'ul'}>${kept.join('')}</${n.tag === 'ol' ? 'ol' : 'ul'}>`;
}
/** A node rendered inline (inside a list item): link, text, icon, picture. */
function leafInline(n, force) {
  const k = kindOf(n);
  if (k === 'a') { const h = linkHtml(n, force); return h.replace(/^<p>|<\/p>$/g, ''); }
  if (k === 'icon') return `:${iconName(n)}:`;
  if (k === 'picture') return isIconImg(n) ? `:${iconName({ alt: basename(n.src || '') })}:` : pictureHtml(n, n.alt, null);
  if (n.text) return inline(n);
  return (n.children || []).map((c) => leafInline(unwrap(c), force)).join(' ');
}
/** One leaf as default content / cell content. `opts.heading` re-levels; `opts.link` forces the weight; `opts.altHint` names a bg picture. */
function leafHtml(l, opts = {}) {
  const n = l.node;
  switch (l.kind) {
    case 'picture': return pictureHtml(n, n.alt ?? (l.bg ? opts.altHint ?? '' : ''), opts.wrap === null ? null : 'p');
    case 'video': { const parts = []; if (n.poster) parts.push(pictureHtml({ src: n.poster, alt: n.title || '' }, n.title || opts.altHint || '')); if (n.src && !/^blob:/.test(n.src)) parts.push(`<p><a href="${esc(rewriteMedia(n.src))}">${esc(n.title || n.aria || opts.altHint || 'Video')}</a></p>`); else warn(`video without a source (a player — ${n.tag}${n.id ? '#' + n.id : ''}): author its poster picture and mp4 link by hand`); return parts.join(''); }
    case 'embed': return n.src ? `<p><a href="${esc(n.src)}">${esc(n.title || n.src)}</a></p>` : '';
    case 'icon': return `<p>:${iconName(n)}:</p>`;
    case 'heading': { const tag = opts.heading || l.raw; const ps = paragraphs(n); if (!ps.length) return ''; stats.texts += ps.length; return ps.map((t, i) => (i === 0 ? `<${tag}>${t}</${tag}>` : `<p>${t}</p>`)).join(''); }
    case 'text': case 'quote': { if (l.spacer) return '<p>&#8203;</p>'; const ps = paragraphs(n); stats.texts += ps.length; return ps.map((t) => `<p>${t}</p>`).join(''); }
    case 'link': return linkHtml(n, opts.link, opts);
    case 'list': return listHtml(n, opts.link);
    default: return '';
  }
}
/** Texts that sit side by side on one line (a small prefix before a number) are one paragraph: the line is what the eye reads. */
function joinLines(leaves) {
  const out = []; const sameLine = (a, b) => { const A = a.node.box; const B = b.node.box; if (!A || !B) return false; const ov = Math.min(A[1] + A[3], B[1] + B[3]) - Math.max(A[1], B[1]); return ov >= 0.5 * Math.min(A[3], B[3]) && B[0] >= A[0] + A[2] - 4 && B[0] - (A[0] + A[2]) < 40; };
  for (const l of leaves) { const prev = out[out.length - 1]; if (prev && prev.kind === 'text' && l.kind === 'text' && !prev.node.lines && sameLine(prev, l)) { prev.joined = [...(prev.joined || [prev.node]), l.node]; continue; } out.push({ ...l }); }
  return out.map((l) => (l.joined ? { ...l, node: { ...l.node, text: l.joined.map((n) => n.text).join(' '), markup: l.joined.map((n) => n.markupFull || n.markup || esc(n.text || '')).join(' '), markupFull: null } } : l));
}
function cellHtml(leaves, cell, altHint) {
  let list = joinLines(leaves);
  if (cell.join && list.filter((l) => l.kind === 'text').length > 1) { const texts = list.filter((l) => l.kind === 'text'); const first = texts[0]; const merged = { ...first, node: { ...first.node, text: texts.map((l) => l.node.text).join(' '), markup: texts.map((l) => inline(l.node)).join(' '), markupFull: null } }; list = list.flatMap((l) => (l === first ? [merged] : l.kind === 'text' ? [] : [l])); }
  return list.map((l) => leafHtml(l, { heading: cell.heading, link: cell.link, wrap: cell.wrap, altHint })).join('');
}
const accepts = (cell, l) => { const from = Array.isArray(cell.from) ? cell.from : [cell.from]; return from.includes(l.kind) || (l.kind === 'video' && from.includes('picture')) || (l.kind === 'quote' && from.includes('text')); };
const isRest = (cell) => (Array.isArray(cell.from) ? cell.from : [cell.from]).includes('rest');
const isHidden = (cell) => (Array.isArray(cell.from) ? cell.from : [cell.from]).includes('hidden');
/** Bucket a unit's leaves into the recipe's cells. Returns { cells: [html…], filled, unfitted: [leaf…], empty: [name…] }. */
function fillCells(unitNode, cells, report) {
  const all = (unitNode.__leaves || leavesOf(unitNode)).filter((l) => l.kind !== 'hr'); // a fixed row passes its prepared leaves
  const controls = all.filter((l) => l.kind === 'control'); if (controls.length) report.controls += controls.length;
  // a dead link without a text of its own (a tile's click overlay, a modal opener) is nothing to author
  const leaves = all.filter((l) => l.kind !== 'control' && !(l.kind === 'link' && isDead(l.node.href) && !l.node.text && !(l.node.children || []).some((c) => MEDIA(kindOf(unwrap(c))))));
  const assigned = cells.map(() => []); const unfitted = []; let ci = 0;
  const tops = (i) => new Set(assigned[i].map((l) => l.top));
  const exhausted = (i, l) => cells[i].take && tops(i).size >= cells[i].take && !tops(i).has(l.top);
  const topChanged = (i, l) => assigned[i].length > 0 && assigned[i][assigned[i].length - 1].top !== l.top;
  for (const l of leaves) {
    let target = -1;
    // an earlier cell still empty that accepts this kind takes it (a photo on the right of its text in the source: the picture cell first)
    for (let j = 0; j < ci; j++) if (!assigned[j].length && accepts(cells[j], l) && !isRest(cells[j])) { target = j; break; }
    if (target >= 0) { assigned[target].push(l); continue; }
    if (ci < cells.length && accepts(cells[ci], l) && !exhausted(ci, l) && !(ci + 1 < cells.length && accepts(cells[ci + 1], l) && topChanged(ci, l))) target = ci;
    else { for (let j = ci + 1; j < cells.length; j++) if (accepts(cells[j], l) && !exhausted(j, l)) { target = j; break; } }
    if (target < 0) {
      const r = cells.findIndex(isRest); if (r >= 0) { assigned[r].push(l); continue; }
      // nothing accepts it: a text never disappears — it lands in the nearest cell that takes any text-like kind (else the last cell) and is
      // reported as not fitting the recipe (the agent moves it or fixes the recipe)
      const BODY = ['heading', 'text', 'link', 'list', 'quote']; const media = l.kind === 'picture' || l.kind === 'video';
      let fb = -1; for (let j = ci; j < cells.length && fb < 0; j++) if ((Array.isArray(cells[j].from) ? cells[j].from : [cells[j].from]).some((k) => (media ? k === 'picture' || k === 'video' : BODY.includes(k)))) fb = j;
      if (fb < 0) for (let j = ci - 1; j >= 0 && fb < 0; j--) if ((Array.isArray(cells[j].from) ? cells[j].from : [cells[j].from]).some((k) => (media ? k === 'picture' || k === 'video' : BODY.includes(k)))) fb = j;
      if (fb < 0) fb = cells.length - 1;
      if (fb >= 0) { assigned[fb].push(l); l.fallbackCell = fb + 1; }
      unfitted.push(l); continue;
    }
    assigned[target].push(l); ci = Math.max(ci, target);
  }
  // a hidden cell: the k-th unit with a dead link takes the k-th hidden root's leaves
  cells.forEach((c, i) => { if (!isHidden(c)) return; const dead = all.some((l) => l.kind === 'link' && isDead(l.node.href)); if (!dead) return; const root = hiddenRoots[hiddenNext]; if (!root) { report.notes.push('hidden cell: no extra content source root left (pass the modal / click dump with --content)'); return; } hiddenNext += 1; assigned[i].push(...leavesOf(root).filter((l) => !['control', 'hr'].includes(l.kind))); });
  const altHint = (() => { const link = leaves.find((l) => l.kind === 'link' && l.node.aria); if (link) return link.node.aria; const h = leaves.find((l) => l.kind === 'heading'); return h ? textOfTree(h.node) : ''; })();
  const html = cells.map((c, i) => cellHtml(assigned[i], c, altHint));
  const empty = cells.filter((c, i) => !html[i]).map((c) => c.name || `cell ${cells.indexOf(c) + 1}`);
  return { cells: html, filled: html.filter(Boolean).length, unfitted, empty };
}
const blockOpen = (name, variant) => `<div class="${[name, variant].filter(Boolean).join(' ')}">`;
const rowHtml = (cells) => `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`;

// ───────────────────────────── per section ─────────────────────────────
const rowFor = (name, variant) => inventory.find((b) => b.name === name && (b.variant || null) === (variant || null)) || inventory.find((b) => b.name === name && !b.variant) || inventory.find((b) => b.name === name) || null;
const recipeFor = (name, variant, report) => { const row = rowFor(name, variant); if (row?.recipe) return { recipe: row.recipe, row }; report.notes.push(`no recipe for ${name}${variant ? ` (${variant})` : ''} in blocks.json — default recipe (block-inventory scan --cases, or write one)`); return { recipe: defaultRecipe(row, name), row }; };
const dividerVariant = (name, variant) => { const v = `${variant ? `${variant} ` : ''}divider`; return inventory.some((b) => b.name === name && b.variant === v) ? v : null; };

function authorSection(node, row) {
  const report = { index: row.index, kind: row.match.kind, block: null, rowsCols: null, filled: 0, cellsTotal: 0, texts: 0, notes: [], controls: 0, unfitted: 0, empty: 0 };
  const t0 = stats.texts; const parts = [];
  const m = row.match;
  const draftNew = process.argv.includes('--draft-new') && m.kind === 'new' && m.block;
  const block = m.kind === 'inventory' ? { name: m.block, variant: m.variant || null } : (m.kind === 'collection' || draftNew) && m.block ? { name: m.block, variant: null } : null;
  if (draftNew) report.notes.push(`NEW drafted through the collection's ${m.block} shape (--draft-new): approve the model in the triage before the block`);
  if (m.kind === 'new' && !draftNew) { parts.push(`<!-- NEW: ${row.fingerprint}${row.collection ? ` (${row.collection}?)` : ''} — model this block -->`); report.notes.push('NEW section: emitted as default content; triage it first (exit 3)'); }
  if (!block) { parts.push(...defaultContent(node, report)); }
  else {
    const { recipe } = recipeFor(block.name, block.variant, report);
    report.block = `${block.name}${block.variant ? ` (${block.variant})` : ''}`;
    if (recipe.rows === 'unit') parts.push(...containerSection(node, block, recipe, report));
    else if (recipe.rows === 'key-value') parts.push(...keyValueSection(node, block, recipe, report));
    else parts.push(...fixedSection(node, block, recipe, report));
    report.notes.unshift(...(recipe._notes || []).filter((n) => /default recipe/.test(n)));
    // the section style: the triage row, else the recipe's
    const style = row.sectionStyle || recipe.sectionStyle || null;
    if (style) parts.push(`<div class="section-metadata"><div><div>style</div><div>${esc(style)}</div></div></div>`);
  }
  if (!block && row.sectionStyle) parts.push(`<div class="section-metadata"><div><div>style</div><div>${esc(row.sectionStyle)}</div></div></div>`);
  report.texts = stats.texts - t0;
  if (report.controls) report.notes.push(`${report.controls} control(s) dropped (buttons / inputs)`);
  return { html: `<div>\n${parts.filter(Boolean).join('\n')}\n</div>`, report };
}
/** Default content for a node tree, in reading order (lists as lists, a bg picture before its children). */
function defaultContent(node, report, opts = {}) {
  const out = []; const leaves = joinLines(leavesOf(node));
  const controls = leaves.filter((l) => l.kind === 'control').length; if (controls) report.controls += controls;
  // a run of icons with no text between them is a control strip (slider arrows), not content
  const drop = new Set(); for (let i = 0; i < leaves.length; i++) { if (leaves[i].kind !== 'icon') continue; let j = i; while (j < leaves.length && leaves[j].kind === 'icon') j++; if (j - i >= 2) { for (let k = i; k < j; k++) drop.add(leaves[k]); report.controls += j - i; } i = j; }
  for (const l of leaves) { if (l.kind === 'control' || l.kind === 'hr' || drop.has(l)) continue; if (l.kind === 'link' && isDead(l.node.href) && !l.node.text && !(l.node.children || []).some((c) => MEDIA(kindOf(unwrap(c))))) continue; const h = leafHtml(l, opts); if (h) out.push(h); }
  return out;
}
/** A container block: walk the section; consecutive unit members form one block table, everything else is default content in place. */
function containerSection(node, block, recipe, report) {
  const a = analyzeSection(node); const picked = pickUnit(a);
  const unit = picked.unit; const unitSig = unit ? unit.sig.join('+') : null;
  const rowNodes = new Set(); if (unit) for (const r of a.repeats) if (r.count >= 2 && r.sig.join('+') === unitSig) r.nodes.forEach((n) => rowNodes.add(n));
  // a lone node is a row when it is shaped like the unit: same pattern (a grid OF tiles has the tiles' kinds but a `[…]×N` pattern)
  const looksLikeUnit = (n) => { if (!unit || rowNodes.has(n)) return rowNodes.has(n); const k = kindOf(n); if (!['group', 'li', 'ul'].includes(k)) return false; const sub = analyzeSection(n); if (!sub.leaves.length || sub.repeats.some((r) => r.count >= 2 && r.unit.includes(' '))) return false; /* a composite repeat inside = a grid, not a row */ const sig = [...new Set(sub.leaves.map((l) => general(l.kind)))].sort().join('+'); return sub.pattern === unit.unit || (sig === unitSig && sub.leaves.length <= unit.leaves.length + 1); };
  const out = []; let dividerNext = false; let blocks = 0; let rows = 0; const cols = (recipe.cells || []).length;
  const emitBlock = (members) => {
    const variant = dividerNext ? dividerVariant(block.name, block.variant) || block.variant : block.variant; if (dividerNext && variant !== block.variant) report.notes.push(`<hr> before a unit → variant "${variant}"`); dividerNext = false;
    const lines = [blockOpen(block.name, variant)];
    if (recipe.headRow) { const head = fillCells(members[0], recipe.headRow, report); lines.push(rowHtml(head.cells)); }
    for (const mNode of members) { const f = fillCells(mNode, recipe.cells || [], report); lines.push(rowHtml(f.cells)); rows += 1; report.filled += f.filled; report.cellsTotal += cols; report.unfitted += f.unfitted.length; report.empty += f.empty.length; if (f.unfitted.length) report.notes.push(`row ${rows}: ${f.unfitted.map((l) => `${l.kind}${l.fallbackCell ? `→cell ${l.fallbackCell}` : ''}`).join(' ')} did not fit the recipe`); }
    lines.push('</div>'); out.push(lines.join('\n')); blocks += 1;
  };
  const walk = (n) => {
    const kids = (n.children || []).map(unwrap);
    if (hasBg(n) && !kids.some((c) => MEDIA(kindOf(c)))) out.push(pictureHtml(n, '')); // the section root's own background is its picture too (a banner's bgi on the root — sdt-dentsu)
    else if (bgCut(n) && !kids.some((c) => MEDIA(kindOf(c)))) bgCutWarn(n);
    let i = 0;
    while (i < kids.length) {
      const c = kids[i];
      // an empty member between unit members stays a row (a player slide the dump holds nothing of): the authored table keeps the slot
      const emptyMember = (j) => kindOf(kids[j]) === 'box' && j + 1 < kids.length && looksLikeUnit(kids[j + 1]);
      if (looksLikeUnit(c)) { const members = []; let j = i; while (j < kids.length && (looksLikeUnit(kids[j]) || emptyMember(j))) { if (!looksLikeUnit(kids[j])) report.notes.push(`row ${rows + members.length + 1}: empty in the dump (a player slide?) — fill it by hand`); members.push(kids[j]); j++; } emitBlock(members); i = j; continue; }
      const k = kindOf(c);
      if (k === 'box') { i++; continue; }
      if (k === 'hr') dividerNext = true;
      else if (k === 'group' || k === 'li' || (k === 'ul' && !isTextList(c))) { const sub = analyzeSection(c); const holdsRows = sub.repeats.some((r) => r.count >= 2 && r.sig.join('+') === unitSig) || (c.children || []).map(unwrap).some(looksLikeUnit); if (holdsRows) walk(c); else out.push(...defaultContent(c, report)); }
      else out.push(...defaultContent(c, report));
      i++;
    }
  };
  if (!unit) { report.notes.push('no repeating unit in this section — authored as one row'); return fixedSection(node, block, { ...recipe, rows: 'fixed' }, report); }
  walk(node);
  report.rowsCols = `${rows} × ${cols}${blocks > 1 ? ` in ${blocks} tables` : ''}`;
  return out;
}
/** A simple block: default content peeled at the start / end per the recipe, the rest one row (`fixed`) or one row per leaf (`leaf`). */
function fixedSection(node, block, recipe, report) {
  const leaves = leavesOf(node).filter((l) => l.kind !== 'hr'); const controls = leaves.filter((l) => l.kind === 'control'); report.controls += controls.length;
  const body = leaves.filter((l) => l.kind !== 'control');
  const before = recipe.defaultContentBefore || []; const after = recipe.defaultContentAfter || [];
  let s = 0; while (s < body.length && before.includes(body[s].kind) && body[s].top !== body[body.length - 1].top) s++;
  let e = body.length; while (e > s && after.includes(body[e - 1].kind) && body[e - 1].top !== body[s].top) e--;
  const head = body.slice(0, s); const tail = body.slice(e); const inner = body.slice(s, e);
  const out = head.map((l) => leafHtml(l)).filter(Boolean);
  const cells = recipe.cells || [{ name: 'body', from: ['rest'] }];
  const lines = [blockOpen(block.name, block.variant)];
  if (recipe.rows === 'leaf') { for (const l of inner) { const h = cellHtml([l], cells[0] || {}, ''); lines.push(rowHtml([h])); report.filled += h ? 1 : 0; report.cellsTotal += 1; } report.rowsCols = `${inner.length} × 1`; }
  else {
    // one row: bucket the leaves as a unit would be (the whole section is the unit)
    const f = fillCells({ __leaves: inner }, cells, report); lines.push(rowHtml(f.cells)); report.filled += f.filled; report.cellsTotal += cells.length; report.unfitted += f.unfitted.length; report.empty += f.empty.length; if (f.unfitted.length) report.notes.push(`${f.unfitted.map((l) => `${l.kind}${l.fallbackCell ? `→cell ${l.fallbackCell}` : ''}`).join(' ')} did not fit the recipe`); report.rowsCols = `1 × ${cells.length}`;
  }
  lines.push('</div>'); out.push(lines.join('\n'));
  out.push(...tail.map((l) => leafHtml(l)).filter(Boolean));
  return out;
}
/** Key-value rows: constants from the recipe, `from` keys from the section's first leaf of that kind. */
function keyValueSection(node, block, recipe, report) {
  const leaves = leavesOf(node); const lines = [blockOpen(block.name, block.variant)]; let n = 0;
  for (const k of recipe.keys || []) { let v = k.value ?? null; if (!v && k.from) { const l = leaves.find((x) => x.kind === k.from); if (l) { v = cellHtml([l], {}, ''); } } if (v == null) { report.notes.push(`key "${k.name}": no value in the dump or the recipe`); v = ''; } lines.push(rowHtml([esc(k.name), v])); n += 1; }
  lines.push('</div>'); report.rowsCols = `${n} × 2`; report.cellsTotal += n * 2; report.filled += n * 2;
  if (!(recipe.keys || []).length) report.notes.push('key-value recipe without keys — author the configuration rows by hand');
  return [lines.join('\n')];
}

// ───────────────────────────── the page ─────────────────────────────
const sectionsHtml = []; const reports = []; let sawNew = false;
mainSections.forEach((row, i) => { const node = split.sections[i]; const { html, report } = authorSection(node, row); sectionsHtml.push(html); reports.push(report); if (row.match.kind === 'new' && !(process.argv.includes('--draft-new') && row.match.block)) sawNew = true; });
const meta = [['title', dump.__title || triage.page?.title || ''], ...(dump.__desc ? [['description', dump.__desc]] : []), ...(navPath ? [['nav', navPath]] : []), ...(footerPath ? [['footer', footerPath]] : [])];
if (!navPath || !footerPath) warn('metadata: no nav / footer path (no profile `chrome.fragments`; pass --nav-path / --footer-path)');
sectionsHtml.push(`<div>\n<div class="metadata">\n${meta.map(([k, v]) => `<div><div>${esc(k)}</div><div>${esc(v)}</div></div>`).join('\n')}\n</div>\n</div>`);
const doc = `<body>\n  <header></header>\n  <main>\n${sectionsHtml.join('\n')}\n  </main>\n  <footer></footer>\n</body>\n`;
mkdirSync(dirname(out), { recursive: true }); writeFileSync(out, doc);

// ───────────────────────────── nav / footer (simplest shape, only when absent) ─────────────────────────────
const chromeDoc = (sections) => `<body>\n  <header></header>\n  <main>\n${sections.map((s) => `<div>\n${s.filter(Boolean).join('\n')}\n</div>`).join('\n')}\n  </main>\n  <footer></footer>\n</body>\n`;
function navDoc(root) {
  const leaves = leavesOf(root); const brand = leaves.find((l) => l.kind === 'link' && (l.node.children || []).some((c) => kindOf(unwrap(c)) === 'picture'));
  const list = leaves.find((l) => l.kind === 'list'); const used = new Set([brand, list].filter(Boolean));
  const menu = list ? [listHtml(list.node, 'plain')] : [`<ul>${leaves.filter((l) => l.kind === 'link' && l !== brand).map((l) => `<li>${leafInline(l.node, 'plain')}</li>`).join('')}</ul>`];
  if (!list) leaves.filter((l) => l.kind === 'link' && l !== brand).forEach((l) => used.add(l));
  const tools = leaves.filter((l) => !used.has(l) && ['link', 'icon'].includes(l.kind) && !(list && list.node === l.parent)).map((l) => leafHtml(l)).filter(Boolean);
  return chromeDoc([[brand ? linkHtml(brand.node, 'plain') : null], menu, tools]);
}
function footerDoc(root) {
  let n = root; while (n.children?.length === 1 && !n.text) n = n.children[0];
  const groups = (n.children || []).map(unwrap).filter((c) => kindOf(c) !== 'box');
  const sections = groups.map((g) => { const leaves = leavesOf(g).filter((l) => !['control', 'hr'].includes(l.kind)); const out = []; let i = 0; while (i < leaves.length) { if (leaves[i].kind === 'link' && leaves[i + 1]?.kind === 'link') { const run = []; while (i < leaves.length && leaves[i].kind === 'link') run.push(leaves[i++]); out.push(`<ul>${run.map((l) => `<li>${leafInline(l.node, 'plain')}</li>`).join('')}</ul>`); } else out.push(leafHtml(leaves[i++])); } return out; }).filter((s) => s.length);
  return chromeDoc(sections);
}
for (const [flag, root, make] of [['--nav', split.header, navDoc], ['--footer', split.footer, footerDoc]]) {
  const f = arg(flag, null); if (!f) continue;
  if (existsSync(resolve(f))) { console.error(`author: ${f} exists — left alone (chrome is authored once)`); continue; }
  if (!root) { console.error(`author: ${flag}: the dump has no ${flag.slice(2)} root — nothing written`); continue; }
  mkdirSync(dirname(resolve(f)), { recursive: true }); writeFileSync(resolve(f), make(root)); console.error(`author: ${f} written from the dump's ${flag.slice(2)} root (simplest shape: review it)`);
}

// ───────────────────────────── report ─────────────────────────────
const w = (s, n) => String(s ?? '').slice(0, n).padEnd(n);
console.error(`${w('#', 3)} ${w('emitted', 9)} ${w('block (variant) · rows × cols', 40)} ${w('cells', 8)} ${w('texts', 6)} notes`);
for (const r of reports) console.error(`${w(r.index, 3)} ${w(r.kind === 'new' ? 'NEW' : r.block ? 'block' : 'default', 9)} ${w(r.block ? `${r.block} · ${r.rowsCols || '—'}` : '—', 40)} ${w(r.cellsTotal ? `${r.filled}/${r.cellsTotal}` : '—', 8)} ${w(r.texts, 6)} ${r.notes.join('; ').slice(0, 110)}`);
console.error(`${reports.length} sections → ${out} (${stats.texts} texts, ${reports.filter((r) => r.block).length} block sections, ${reports.filter((r) => !r.block && r.kind !== 'new').length} default, ${reports.filter((r) => r.kind === 'new').length} new)`);
const unf = reports.reduce((s, r) => s + r.unfitted, 0); const emp = reports.reduce((s, r) => s + r.empty, 0);
if (unf) console.error(`author: ${unf} leaf/leaves did not fit a recipe — placed in the nearest text / picture cell and listed per section above (move them, or fix the recipe)`);
if (emp) console.error(`author: ${emp} empty cell(s) (a CTA row's empty picture cell is expected; a whole empty row is not)`);
if (unknownMedia.size) console.error(`author: ${unknownMedia.size} media source(s) not in the manifest — kept as source URLs:\n  ${[...unknownMedia].map((u) => u.slice(0, 120)).join('\n  ')}`);
if (spacers.length) console.error(`author: ${spacers.length} empty spacer paragraph(s) in the source (${spacers.map((n) => `${n.box ? n.box[3] : '?'} px at y ${n.box ? n.box[1] : '?'}`).join(', ')}) dropped — the pipeline drops <p>&nbsp;</p> and <p><br></p> too; a section table Δh of that size is this: model the rhythm in the section style or file it as a deviation (--keep-spacers writes a zero-width-space paragraph, an anti-pattern METHOD names)`);
for (const m of [...new Set(warnings)]) console.error(`author: ${m}`);

// ───────────────────────────── lint ─────────────────────────────
let lintStatus = 0;
if (!arg('--no-lint', false)) {
  const lint = davidsLint();
  if (existsSync(lint)) { const r = spawnSync('node', [lint, out], { encoding: 'utf8' }); process.stdout.write(r.stdout); lintStatus = r.status; } else console.error('author: lint not found (set DAVIDS_LINT) — skipped');
}
if (sawNew) { console.error('author: a NEW section was emitted as default content — triage it (name the block, write its recipe), then run author again (exit 3)'); process.exit(3); }
if (lintStatus === 2) { console.error('author: David\'s Model 🔴 in the output — fix the model (exit 2)'); process.exit(2); }
