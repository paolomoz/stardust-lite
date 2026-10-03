/*
 * stardust.js — the foundation helpers every stardust-lite migration rewrote in scripts.js (seven sites, 2026-09/10).
 * Copied into the site repo by `npx stardust-lite init --foundation`; the site owns it afterwards. scripts.js imports what
 * it uses:  import { decorateIconTokens, inlineIcons, buildWidgetAutoBlocks, readFragmentSections, hideEmptySections } from './stardust.js';
 * Nothing here is a measurement: no sizes, no colours, no selectors of a source site.
 */

import { buildBlock, decorateIcons } from './aem.js';

/**
 * A block's own icons in one call: the `.icon` spans the decorate created become `<img>` (decorateIcons) and then inline `<svg>`
 * (inlineIcons) so they follow `currentColor`. `decorateIcons(main)` ran before the block existed — forgotten in r1 of two cases.
 * @param {Element} block
 */
export async function decorateBlockIcons(block) { decorateIcons(block); await inlineIcons(block); }

/**
 * `:name:` tokens in text become `<span class="icon icon-name">` for decorateIcons() (the pipeline does the same for a
 * document; the harness fold does not — BACKLOG #5). Skips script/style and text already inside an .icon.
 * Call it on main before decorateIcons(main) in decorateMain, and on any fragment the page loads.
 * @param {Element} root
 */
export function decorateIconTokens(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (/:[a-z][a-z0-9-]*:/i.test(n.nodeValue) && !n.parentElement.closest('script, style, .icon')
      ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((n) => {
    const frag = document.createDocumentFragment();
    n.nodeValue.split(/(:[a-z][a-z0-9-]*:)/i).forEach((part) => {
      const m = part.match(/^:([a-z][a-z0-9-]*):$/i);
      if (m) {
        const span = document.createElement('span');
        span.className = `icon icon-${m[1].toLowerCase()}`;
        frag.append(span);
      } else if (part) frag.append(part);
    });
    n.replaceWith(frag);
  });
}

const svgCache = new Map();
/**
 * Swaps the `<img>` decorateIcons() made for every `.icon` under root with the SVG file's own markup, fetched once per URL,
 * so `fill: currentColor` follows the text colour and the hover colour (an <img> never does — METHOD step 4, BACKLOG #124).
 * Call it after decorateIcons(root) — on main in loadEager, and on a block's controls after the block created them.
 * @param {Element} root
 * @returns {Promise<void>}
 */
export async function inlineIcons(root) {
  const imgs = [...root.querySelectorAll('span.icon > img[src$=".svg"]')];
  await Promise.all(imgs.map(async (img) => {
    const { src } = img;
    if (!svgCache.has(src)) svgCache.set(src, fetch(src).then((r) => (r.ok ? r.text() : '')).catch(() => ''));
    const text = await svgCache.get(src);
    if (!text) return;
    const svg = new DOMParser().parseFromString(text, 'image/svg+xml').documentElement;
    if (!svg || svg.nodeName !== 'svg') return;
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    img.replaceWith(document.importNode(svg, true));
  }));
}

/**
 * A link to `/widgets/<name>` on its own line becomes a `widget` block holding that link (the block fetches or renders the
 * widget — a feed, a signed-in slot, a third-party module whose geometry the triage reserved). A link inside a sentence is
 * replaced in place. Call it from buildAutoBlocks(main).
 * @param {Element} main
 * @param {string} [path='/widgets/']  the path fragment that marks a widget link
 */
export function buildWidgetAutoBlocks(main, path = '/widgets/') {
  main.querySelectorAll(`a[href*="${path}"]`).forEach((link) => {
    if (link.closest('.widget')) return;
    const block = buildBlock('widget', { elems: [link.cloneNode(true)] });
    const p = link.closest('p');
    const alone = p && p.querySelectorAll('a').length === 1 && p.textContent.trim() === link.textContent.trim();
    (alone ? p : link).replaceWith(block);
  });
}

/**
 * The sections of a fragment the runtime loaded (nav, footer), read the way the pipeline wraps them: `loadFragment` runs
 * decorateMain, so a section's default content sits in `.default-content-wrapper`; a list item that also holds a nested
 * list keeps its own text in a `p` (the pipeline's li > p rule); a block cell with one paragraph loses its `<p>`.
 * Returns one entry per section with the wrapper (or the section itself when the pipeline did not wrap it), its blocks,
 * its own paragraphs, lists and headings — so a header or footer decorate never reads `:scope > p` of the section (METHOD step 5).
 * @param {Element} fragment  what loadFragment returned
 * @returns {{ section: Element, wrapper: Element, blocks: Element[], paragraphs: Element[], lists: Element[], headings: Element[], classes: string[] }[]}
 */
export function readFragmentSections(fragment) {
  if (!fragment) return [];
  return [...fragment.querySelectorAll(':scope > .section, :scope > div')].map((section) => {
    const wrapper = section.querySelector(':scope > .default-content-wrapper') || section;
    return {
      section,
      wrapper,
      blocks: [...section.querySelectorAll(':scope > div > .block, :scope > .block')],
      paragraphs: [...wrapper.querySelectorAll(':scope > p')],
      lists: [...wrapper.querySelectorAll(':scope > ul, :scope > ol')],
      headings: [...wrapper.querySelectorAll(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6')],
      classes: [...section.classList].filter((c) => c !== 'section'),
    };
  });
}

/**
 * A list item's own link and own text under the pipeline's wrapping (`li > a` in an authored file, `li > p > a` served).
 * @param {Element} li
 * @returns {{ link: Element|null, text: string }}
 */
export function itemOwn(li) {
  const link = li.querySelector(':scope > a, :scope > p > a');
  const own = li.querySelector(':scope > p') || li;
  const text = [...own.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE || (n.nodeType === 1 && !['UL', 'OL'].includes(n.tagName))).map((n) => n.textContent).join('').trim();
  return { link, text: link ? link.textContent.trim() : text };
}

/**
 * Hides a section that holds nothing (the pipeline leaves the metadata block behind as an empty section the harness fold
 * drops — METHOD step 7, BACKLOG #24) so a section-rhythm rule does not add a gap on the served page only. reset.css has the
 * same rule in CSS (`main > .section:not(:has(> *))`); this is the JS fallback for a runtime without :has().
 * @param {Element} main
 */
export function hideEmptySections(main) {
  main.querySelectorAll(':scope > .section').forEach((s) => {
    if (!s.children.length && !s.textContent.trim()) s.hidden = true;
  });
}
