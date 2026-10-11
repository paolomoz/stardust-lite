#!/usr/bin/env node
// measure-page.mjs — step 1 in ONE session per width: one browser context and one page load per width (the profile's overlays through
// `openPage`, a reload-on-consent waited out), then from that single settled page everything that took five or six loads — probe-load's
// first look (read BEFORE the overlays are clicked, as probe-load reads it), probe-structure's dump, content-dump's JSON, media-list's
// inventory (its response listener armed before navigation, in the context), live-spec's spec + captured DOM and deep-probe's default
// property set. Byte-compatible outputs, so every downstream instrument (`content-view`, `triage`, `media-fetch`, `sections`, `pair`,
// `author`, `block-inventory`) keeps working; the single instruments stay for targeted re-reads (`--pierce`, `--click`, `--props`,
// `--anim`, another depth). Not a new reading — a cheaper one, and one that removes the half-loaded-page and session-drift classes
// (walgreens, stryker, audemarspiguet) because every number of a width comes from the same page (SCALING-PLAN §2.H, batch-7 rollout).
// Usage: node measure-page.mjs <url> --out <dir> [--widths 360,1440,2560] [--sections <css>] [--main <css>] [--header <css>] [--footer <css>]
//        [--deep <file | css,css,…>] [--hidden <css,…>] [--no-spec] [--depth 3] [--vh 900] [--parallel 3] [--wait 4000] [--no-capture] [--tol 2] [--noise [W,…|all]]
//   --noise      the noise floor from the same run: a second capture of the base width (or the widths named, `all`) from a fresh context,
//                `live-<W>-b.png`, and its self-diff against `live-<W>.png` — `noise floor: <W> 0.12 % (Δh 0)`, `noise` in summary.json
//                (six commands typed by hand before — scotiabank-personal; a band far above the rest is a composition, METHOD prerequisites)
//        [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--require <css,…>] [--site <site.json> | --no-site]
//   --capture    (default ON) after the dumps, from the same settled session, the stitched full-page capture `live-<W>.png` — the shape
//                stitch-shot writes (doc width × settled height, chunked by --vh, motion frozen after the settle; lib/stitch.mjs), so the
//                gate (`--origin <this dir>`, its default when the dir holds the width) and pixel-compare read it unchanged: the live page
//                is loaded ONCE per width for measurement, prototype gate and served gate (sdt-dentsu speed). --no-capture turns it off.
//   profile check: with a site profile, the per-width checks of `site-profile check` (status, overlay controls resolve, require markers,
//                header / footer heights within --tol of the profile, fixed layer at the top) run from these sessions — one
//                `profile check: PASS|WARN|FAIL — …` line, `profileCheck` in summary.json; run `site-profile check` on its own on a FAIL
//   --sections   live-spec's section selector (default `main > .section`; for a source page pass its own — the structure dump shows it);
//                also the default --deep set (each section root) — the summary notes a selector that matches nothing
//   --main       the content root: the structure dump's root and the content dump's main root (default: the profile's cap main selector,
//                else the largest ancestor of `main` / `[role=main]` that adds no chrome — roster's rule, so a hero that sits before
//                `main` in the same wrapper is content: dentsu). The dump's key is `main` when that root is the `<main>` element, else
//                the root's short selector (`div.main-container`) — the keys the cases dumped; `--main <css>` is used as given
//   --deep       deep-probe's selectors (a file, one per line, or an inline list); default: the header, every section root, the footer
//   --hidden     content-dump's hidden-but-present roots (dumped without the visibility test, keys `hidden <sel>`)
//   --parallel   widths read at once, never more than 3 (three contexts on one browser)
// Writes per width: probe-load-<W>.txt, structure-<W>.txt, content-<W>.json, media-<W>.json, spec-<W>.json + dom-<W>.html, deep-<W>.txt, live-<W>.png;
// and summary.json { url, widths, elapsedByWidth, files, captures, profileCheck, sectionsSelector, mainRoot, fixedLayers, shadowRoots, notes }. Prints one table.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { arg, openPage, settle, overlayOpts, contextOptions, siteProfile, DEEP_HELPERS, launch } from './common.mjs';
import { collectContent } from './lib/content-collector.mjs';
import { collectSpec } from './lib/spec-collector.mjs';
import { firstLook, collectStructure, collectMedia, fontResponse, fontFaceRulesFrom, deepProbe } from './lib/probe-collectors.mjs';
import { contentRootPath } from './lib/section-pair.mjs';
import { stitchCapture, captureUrl } from './lib/stitch.mjs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { statusRow, overlayRows, chromeRows, verdictOf } from './lib/profile-check.mjs';

const url = process.argv[2];
if (!url || url.startsWith('--') || !arg('--out', null) || arg('--out') === true) { console.error('usage: measure-page.mjs <url> --out <dir> [--widths 360,1440,2560] [--sections <css>] [--main <css>] [--header <css>] [--footer <css>] [--deep <file|css,…>] [--hidden <css,…>] [--no-spec] [--depth 3] [--vh 900] [--parallel 3] [--no-capture] [--noise [W,…|all]] [--tol 2] [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--require <css,…>] [--site <file>]'); process.exit(1); }
const out = resolve(arg('--out')); mkdirSync(out, { recursive: true });
const profile = siteProfile(); const overlays = overlayOpts();
const widths = String(arg('--widths', (profile?.widths || [360, 1440, 2560]).join(','))).split(',').map(Number).filter((w) => Number.isFinite(w) && w > 0);
const vh = Number(arg('--vh', 900)); const wait = Number(arg('--wait', 4000)); const depth = Number(arg('--depth', 3));
const sections = String(arg('--sections', 'main > .section')); // the default header / footer is the PAGE's: a `<header>` inside main / article / section / aside is a section title (acs-about: nine in-section
// headers read as ten HEADER rows and ten header drafts; si-home: the page title doubled the chrome rows — BACKLOG 206, 207)
const headerGiven = typeof arg('--header', null) === 'string'; const footerGiven = typeof arg('--footer', null) === 'string'; const chromeUsed = {};
const headerDefault = String(arg('--header', 'header:not(main header, article header, section header, aside header)')); const footerDefault = String(arg('--footer', 'footer:not(main footer, article footer, section footer, aside footer)'));
const header = headerDefault; const footer = footerDefault; // per width: measure() re-reads them from the page (a guess when the page has no <header> / <footer>)
const mainSel = typeof arg('--main', null) === 'string' ? arg('--main') : (profile?.cap?.contentRoot && profile.cap.contentRoot !== 'main' ? profile.cap.contentRoot : profile?.cap?.contentRoot === 'main' ? 'main' : profile?.cap?.mainSelector || null); // the content root (site-profile init records it from this summary), else the cap shell
const hidden = String(arg('--hidden', '')).split(',').map((s) => s.trim()).filter(Boolean);
const noSpec = process.argv.includes('--no-spec');
const capture = !process.argv.includes('--no-capture'); const tol = Number(arg('--tol', 2));
const parallel = Math.max(1, Math.min(3, Number(arg('--parallel', 3)) || 3)); // never more than three contexts at once
const deepArg = arg('--deep', null);
// `--deep` is a file (one per line; `# ` comments) or, when no such file exists, an inline comma list (deep-probe's rule)
const deepSels = typeof deepArg === 'string' ? (existsSync(deepArg) ? readFileSync(deepArg, 'utf8').split('\n') : deepArg.split(',')).map((s) => s.trim()).filter((s) => s && !/^(#\s|#$|\/\/)/.test(s)) : null;
const DEEP_MAX = deepSels ? 3 : 60; // the default set reads every section root, not the first three

const notes = [];
if (profile) notes.push(`profile ${profile._file}${mainSel && typeof arg('--main', null) !== 'string' ? ` (cap main ${mainSel})` : ''}`);
if (noSpec) notes.push('--no-spec: no spec / dom written');
if (!capture) notes.push('--no-capture: no live-<W>.png written (the gate captures its own origin)');
const browser = await launch();
const results = {};

async function measure(W) {
  const t0 = Date.now(); const log = (m) => console.error(`[${W}] ${m}`);
  const ctx = await browser.newContext(contextOptions({ width: W, height: vh, locale: overlays.locale }));
  const fontReqs = []; const cssFaces = []; let lockBefore = ''; let status = null; const firstLines = []; const checkRows = [];
  let page;
  try {
    page = await openPage(ctx, url, {
      width: W, height: vh, consent: overlays.consent, dismiss: overlays.dismiss, locale: overlays.locale, require: overlays.require, wait,
      before: (p) => { // armed before navigation: the font files requested (media-list) and the navigation status (probe-load)
        p.on('response', (r) => { const u = fontResponse(r); if (u) fontReqs.push(u); if (r.status() < 400 && /text\/css/.test(r.headers()['content-type'] || '')) cssFaces.push(r.text().then((t) => fontFaceRulesFrom(t, r.url())).catch(() => [])); try { if (r.request().isNavigationRequest() && r.frame() === p.mainFrame()) status = r.status(); } catch { /* detached */ } });
        p.on('domcontentloaded', async () => { lockBefore = await p.evaluate(() => `${getComputedStyle(document.body).overflow}/${getComputedStyle(document.documentElement).overflow}`).catch(() => ''); });
      },
      afterLoad: async (p) => { // probe-load's first look: before any overlay is dismissed
        const info = await p.evaluate(firstLook);
        firstLines.push(`status ${status ?? '?'} url ${p.url()}`, JSON.stringify(info, null, 1));
        if (!info.fixed.length) firstLines.push(`no fixed or sticky layer at ${W}`);
        if (info.tallHeader) firstLines.push(`NOTE: ${info.tallHeader}`);
        if (info.unassigned?.length) firstLines.push(`UNASSIGNED painted band(s) outside header / main / footer at ${W} — dumped as extra roots: ${info.unassigned.join(' ; ')}`);
        for (const sel of [overlays.consent, ...overlays.dismiss].filter(Boolean)) { const n = await p.evaluate((s) => { try { return document.querySelectorAll(s).length; } catch { return -1; } }, sel); firstLines.push(`overlay control ${sel}: ${n < 0 ? 'invalid selector' : n ? `${n} match${n > 1 ? 'es' : ''}` : 'ABSENT'}`); }
        results[W] = { first: info };
        if (profile) checkRows.push(...await overlayRows(p, profile, W)); // the profile's controls, read before they are clicked
      },
    });
  } catch (e) { await ctx.close().catch(() => {}); return { W, error: String(e.message || e).split('\n')[0].slice(0, 200), elapsed: (Date.now() - t0) / 1000 }; }
  log(`loaded (${((Date.now() - t0) / 1000).toFixed(1)} s), settling…`);
  await settle(page);
  // the chrome when the page has no <header> / <footer> outside main (marriott: the header inside main, the footer a div — no nav, no footer
  // authored, the harness exited 4): [role=banner] / [role=contentinfo], else a full-width header-ish / footer-ish node at the top / bottom
  const [header, footer] = await page.evaluate(([h, f, hGiven, fGiven]) => {
    const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > innerWidth * 0.6 && r.height > 20; }; const docH = document.documentElement.scrollHeight;
    const sel = (e) => { if (e.id && /^[A-Za-z][\w-]*$/.test(e.id)) return `${e.tagName.toLowerCase()}#${e.id}`; const c = [...e.classList].filter((x) => /^[A-Za-z][\w-]*$/.test(x)).slice(0, 2); return `${e.tagName.toLowerCase()}${c.map((x) => `.${x}`).join('')}`; };
    const has = (s) => { try { return [...document.querySelectorAll(s)].some(vis); } catch { return false; } };
    const pick = (role, re, top) => { const r0 = document.querySelector(`[role=${role}]`); if (r0 && vis(r0)) return sel(r0); const c = [...document.querySelectorAll('body *')].filter((e) => re.test(`${e.id} ${e.className}`) && vis(e)).filter((e) => { const r = e.getBoundingClientRect(); const y = r.top + scrollY; return top ? y < 200 && r.height < 600 : y + r.height > docH - 40 && r.height < 1600; }); c.sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width || (a.contains(b) ? -1 : 1)); return c[0] ? sel(c[0]) : null; };
    return [hGiven || has(h) ? h : (pick('banner', /(^|[\s_-])(header|masthead|site-?nav)([\s_-]|$)/i, true) || h), fGiven || has(f) ? f : (pick('contentinfo', /(^|[\s_-])footer([\s_-]|$)/i, false) || f)];
  }, [headerDefault, footerDefault, headerGiven, footerGiven]).catch(() => [headerDefault, footerDefault]);
  if (header !== headerDefault) firstLines.push(`header: no <header> outside main — measured with '${header}' (pass --header to choose)`);
  if (footer !== footerDefault) firstLines.push(`footer: no <footer> outside main — measured with '${footer}' (pass --footer to choose)`);
  chromeUsed[W] = { header, footer };
  if (profile) { checkRows.unshift(statusRow(W, status)); checkRows.push(...await chromeRows(page, profile, W, { tol })); }
  const files = {};
  const write = (name, data) => { writeFileSync(join(out, name), data); files[name.replace(/-\d+(\.\w+)$/, '$1').replace(/\.\w+$/, '')] = join(out, name); };
  // the content root (--main / cap main / roster's rule): the structure dump's root and the content dump's main root, under the key
  // `main` when it is the <main> element, else its short selector (the dentsu case dumped `div.main-container`: the hero sits before main)
  const root = await page.evaluate(contentRootPath, [mainSel]);
  const hasMain = await page.evaluate(() => !!document.querySelector('main'));
  const explicit = typeof arg('--main', null) === 'string';
  const contentMain = explicit ? arg('--main') : root.tag === 'main' ? 'main' : root.name;
  write(`probe-load-${W}.txt`, firstLines.join('\n') + '\n');
  const structure = await page.evaluate(collectStructure, { root: root.path, depth, pierce: false });
  write(`structure-${W}.txt`, structure);
  // the unassigned bands of the first look are content roots too (keys = their selector, before main in the file order)
  // bands between the chrome and the CONTENT ROOT (a 40 px promo bar inside main's wrapper, above the root — in no table, canon): extra roots too
  const rootBands = await page.evaluate(([rootPath, hdr, ftr]) => { const root = document.querySelector(rootPath); if (!root) return []; const chrome = [root, ...document.querySelectorAll(hdr), ...document.querySelectorAll(ftr)].filter(Boolean); const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height >= 8 && r.left + r.width > 0 && r.left < innerWidth && cs.visibility !== 'hidden' && cs.display !== 'none' && cs.position !== 'fixed'; }; const sel = (el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${[...el.classList].slice(0, 3).map((c) => '.' + c).join('')}`; const c = [...document.querySelectorAll('body *')].filter((el) => !chrome.some((r) => r.contains(el) || el.contains(r)) && vis(el) && !/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|IFRAME)$/.test(el.tagName) && !/onetrust|consent|cookie|modal|dialog/i.test(`${el.id} ${el.className}`) && [...el.querySelectorAll('*')].some((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))); return c.filter((el) => !c.some((o) => o !== el && o.contains(el))).slice(0, 8).map(sel); }, [root.path, header, footer]).catch(() => []);
  // an extra root names ONE band: an id or a class, and ≤ 3 matches — a bare `div` dumped all 451 divs of pgatour and became the content root
  // (73 triage rows, the main column seven times)
  const extraRoots0 = [...new Set([...(results[W]?.first?.unassigned || []).map((s) => s.split(' [')[0]), ...rootBands])].filter((s) => /^[a-z][a-z0-9-]*(#[\w-]+)?(\.[\w-]+)*$/i.test(s) && /[#.]/.test(s));
  const counts = await page.evaluate((sels) => sels.map((s) => { try { return document.querySelectorAll(s).length; } catch { return 99; } }), extraRoots0).catch(() => extraRoots0.map(() => 1));
  const extraRoots = extraRoots0.filter((s, i) => counts[i] >= 1 && counts[i] <= 3);
  const pierce = process.argv.includes('--pierce') || (results[W]?.first?.shadowHosts || 0) > 0; // a web-components origin: the composed tree (loop r7)
  const content = await page.evaluate(collectContent, [[header, ...extraRoots, explicit || root.tag === 'main' ? contentMain : root.path, footer], hidden, sections, pierce]); // `sec` marks: the dump splits as the spec does
  if (!explicit && root.tag !== 'main' && root.path !== contentMain) { const o = {}; for (const [k, v] of Object.entries(content)) o[k === root.path ? contentMain : k] = v; Object.assign(content, o); for (const k of Object.keys(content)) if (!(k in o)) delete content[k]; }
  write(`content-${W}.json`, JSON.stringify(Object.fromEntries([header, ...extraRoots, contentMain, footer, ...hidden.map((h) => `hidden ${h}`), '__doc', '__title', '__desc'].filter((k) => k in content).map((k) => [k, content[k]])), null, 1));
  const media = await page.evaluate(collectMedia); media.lockBefore = lockBefore; media.fontRequests = [...new Set(fontReqs)];
  // the @font-face rules: every CSS response's text plus the inline <style> sheets (fonts.css is then written, not typed)
  const inlineCss = await page.evaluate(() => [...document.querySelectorAll('style')].map((s) => s.textContent).join('\n')).catch(() => '');
  const faceRules = [...(await Promise.all(cssFaces)).flat(), ...fontFaceRulesFrom(inlineCss, url)]; const seenFace = new Set(); media.fontFaceRules = faceRules.filter((f) => { const k = `${f.family}|${f.weight}|${f.style}|${f.srcs.map((x) => x.url).join(',')}`; if (seenFace.has(k)) return false; seenFace.add(k); return true; });
  write(`media-${W}.json`, JSON.stringify(media, null, 1));
  let spec = null;
  if (!noSpec) {
    const full = await page.evaluate(collectSpec, { sections, header, footer, pierce }); const { html, ...rest } = full; spec = rest;
    write(`spec-${W}.json`, JSON.stringify(rest, null, 1)); write(`dom-${W}.html`, html);
  }
  const sels = deepSels || [header, sections, footer];
  const deep = await page.evaluate(new Function('args', `${DEEP_HELPERS}\n return (${String(deepProbe)})(args);`), [sels, DEEP_MAX, false, [], false]);
  write(`deep-${W}.txt`, deep + '\n');
  let nSections = await page.evaluate((s) => { try { return document.querySelectorAll(s).length; } catch { return -1; } }, sections);
  // the default matched SOME sections but not the page: they cover < 70 % of the content root (publicis: `main > .section` matched the quote,
  // the hero `section.crawl` has no .section class — a re-run with --sections 'main > section'): the guess decides, as when nothing matched
  const coverLow = nSections > 0 && typeof arg('--sections', null) !== 'string' && await page.evaluate(([s, rootPath]) => { const root = document.querySelector(rootPath) || document.querySelector('main') || document.body; const H = root.getBoundingClientRect().height || 1; const sum = [...document.querySelectorAll(s)].reduce((a, e) => a + e.getBoundingClientRect().height, 0); return sum / H < 0.7; }, [sections, root.path]).catch(() => false);
  let usedSections = sections;
  // the default --sections matches nothing on a source page: guess it — the first node down from the content root (single-child chains
  // descended) with ≥ 3 children taller than 100 px, as their common `tag.class` — the second run then takes `--sections <guess>` (natixis: an extra probe-structure)
  const sectionsGuess = nSections === 0 || coverLow ? await page.evaluate((rootPath) => { const root = document.querySelector(rootPath) || document.querySelector('main') || document.body; const H = root.getBoundingClientRect().height || 1; const kidsOf = (el) => [...el.children].filter((c) => c.getBoundingClientRect().height >= 40 && !/^(SCRIPT|STYLE|TEMPLATE|HEADER|FOOTER|NAV)$/.test(c.tagName)); let best = null; const queue = [[root, 0]]; while (queue.length && !best) { const [n, d] = queue.shift(); if (d > 6) break; const t = kidsOf(n); const cover = t.reduce((a, c) => a + c.getBoundingClientRect().height, 0) / H; if (t.length >= 2 && cover >= 0.6) best = { n, t }; else t.forEach((c) => queue.push([c, d + 1])); } if (!best) return null; let { n, t } = best; /* two children, one of them most of the page (the content beside a footer — equitable picked 2 sections): descend into the dominant child while it splits into ≥ 3 */ for (let k = 0; k < 4 && t.length <= 2; k += 1) { const dom = t.find((c) => c.getBoundingClientRect().height >= H * 0.7); if (!dom) break; let x = dom; while (kidsOf(x).length === 1) x = kidsOf(x)[0]; const tk = kidsOf(x); const hx = x.getBoundingClientRect().height || 1; if (tk.length >= 3 && tk.reduce((a, c) => a + c.getBoundingClientRect().height, 0) / hx >= 0.6) { n = x; t = tk; } else break; } /* the shallowest node whose ≥ 2 children cover ≥ 60 % of the root: the source's section row */ const cls = [...t[0].classList].find((c) => t.every((x) => x.classList.contains(c))); const sameTag = t.every((x) => x.tagName === t[0].tagName); const child = cls ? `${sameTag ? t[0].tagName.toLowerCase() : ''}.${cls}` : sameTag ? t[0].tagName.toLowerCase() : '*'; /* children of different tags (nav + article) → every child (`#main > nav` alone matched one — take2games) */ let sel = `${n.tagName.toLowerCase()}${n.id ? '#' + n.id : [...n.classList].slice(0, 1).map((c) => '.' + c).join('')} > ${child}`; if (document.querySelectorAll(sel).length !== t.length) { const path = []; for (let a = n; a && a !== root && a !== document.body; a = a.parentElement) path.unshift(a.id ? `#${a.id}` : `${a.tagName.toLowerCase()}:nth-child(${[...a.parentElement.children].indexOf(a) + 1})`); sel = `${rootPath}${path.length ? ' > ' + path.join(' > ') : ''} > ${child}`; } /* nested grids of the same class matched 12 elements for 7 sections (manulife): anchor the selector to the row's path */ return { sel, n: document.querySelectorAll(sel).length, heights: t.map((x) => Math.round(x.getBoundingClientRect().height)) }; }, root.path).catch(() => null) : null;
  // the scrolled state: which layers are fixed / sticky after one viewport and how far the first content box moved — a mobile bar that pins on
  // scroll took 50 px out of the flow from chunk 2 on and no table at rest showed it (360 at 15 % for three rounds, cibc-careers, loop r2)
  const scrolled = await page.evaluate(async ([vh, rootPath]) => {
    const sel = (el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${[...el.classList].slice(0, 3).map((c) => '.' + c).join('')}`;
    const pinned = () => [...document.querySelectorAll('body *')].filter((el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return (cs.position === 'fixed' || (cs.position === 'sticky' && r.top <= 1)) && r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && r.bottom > 0 && r.top < innerHeight; }) /* a layer slid out of the viewport (top −74) is gone */.map((el) => `${sel(el)} h${Math.round(el.getBoundingClientRect().height)}`);
    const root = document.querySelector(rootPath) || document.querySelector('main') || document.body; const first = [...root.children].find((c) => c.getBoundingClientRect().height > 0) || root;
    const y0 = Math.round(first.getBoundingClientRect().top + scrollY); const at0 = pinned();
    window.scrollTo(0, vh); await new Promise((r) => setTimeout(r, 500)); const at1 = pinned(); const y1 = Math.round(first.getBoundingClientRect().top + scrollY);
    window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 400));
    const key = (s) => s.replace(/ h\d+$/, ''); // a header that shrinks when it pins is the same layer (a compact 64 px state read as GONE — canon)
    return { at0, at1, shift: y1 - y0, newlyPinned: at1.filter((x) => !at0.map(key).includes(key(x))), gone: at0.filter((x) => !at1.map(key).includes(key(x))) };
  }, [vh, root.path]).catch(() => null);
  if (sectionsGuess && sectionsGuess.n >= 2 && typeof arg('--sections', null) !== 'string') { // the default matched nothing: measure with the guess now, from this same page
    usedSections = sectionsGuess.sel; log(`--sections default ${coverLow ? 'covered under 70 % of the content' : 'matched nothing'} — measuring with the guess '${usedSections}' (${sectionsGuess.n} sections)`);
    const content2 = await page.evaluate(collectContent, [[header, ...extraRoots, explicit || root.tag === 'main' ? contentMain : root.path, footer], hidden, usedSections, pierce]);
    if (!explicit && root.tag !== 'main' && root.path !== contentMain) { const o = {}; for (const [k, v] of Object.entries(content2)) o[k === root.path ? contentMain : k] = v; Object.assign(content2, o); for (const k of Object.keys(content2)) if (!(k in o)) delete content2[k]; }
    write(`content-${W}.json`, JSON.stringify(Object.fromEntries([header, ...extraRoots, contentMain, footer, ...hidden.map((h) => `hidden ${h}`), '__doc', '__title', '__desc'].filter((k) => k in content2).map((k) => [k, content2[k]])), null, 1));
    if (!noSpec) { const full = await page.evaluate(collectSpec, { sections: usedSections, header, footer, pierce }); const { html, ...rest } = full; spec = rest; write(`spec-${W}.json`, JSON.stringify(rest, null, 1)); write(`dom-${W}.html`, html); }
    if (!deepSels) { const deep2 = await page.evaluate(new Function('args', `${DEEP_HELPERS}\n return (${String(deepProbe)})(args);`), [[header, usedSections, footer], DEEP_MAX, false, [], false]); write(`deep-${W}.txt`, deep2 + '\n'); }
    nSections = sectionsGuess.n;
  }
  let cap = null;
  if (capture) { // last: the freeze changes the page (animations paused, timers cleared) — every reading above is done
    const tc = Date.now();
    try { cap = await stitchCapture(page, join(out, `live-${W}.png`), { vh }); files.live = join(out, `live-${W}.png`); cap.seconds = Number(((Date.now() - tc) / 1000).toFixed(1)); log(`captured live-${W}.png ${cap.width}x${cap.height} from ${cap.chunks} chunks in ${cap.seconds} s${cap.timedOut ? ` (${cap.timedOut} chunk waits hit the bound)` : ''}`); } catch (e) { cap = { error: String(e.message || e).split('\n')[0].slice(0, 200) }; log(`capture failed: ${cap.error}`); }
  }
  await ctx.close();
  const elapsed = Number(((Date.now() - t0) / 1000).toFixed(1));
  log(`done in ${elapsed} s`);
  return { W, elapsed, status, files, root, contentMain, hasMain, cap, checkRows, first: results[W]?.first || null, doc: content.__doc, unassigned: extraRoots, scrolled, sectionsGuess, usedSections, pierce, contentRoots: [header, ...extraRoots, contentMain, footer].map((r) => `${r}: ${(content[r] || []).length}`), hiddenRoots: hidden.map((r) => `${r}: ${(content[`hidden ${r}`] || []).length}`), media: { imgs: media.imgs.length, videos: media.videos.length, bgs: media.bgs.length, svgs: media.svgs.length, faces: media.faces.length, fontRequests: media.fontRequests.length }, spec: spec ? { secs: spec.secs.length, items: spec.secs.reduce((n, s) => n + s.items.length, 0), running: spec.running, entrance: spec.secs.reduce((n, s) => n + s.items.filter((it) => it.ent).length, 0), broken: spec.secs.reduce((n, s) => n + s.items.filter((it) => it.broken).length, 0) } : null, nSections, deepLines: deep.split('\n').length };
}

// up to `parallel` widths at once, in order
const rows = []; const queue = [...widths];
await Promise.all(Array.from({ length: Math.min(parallel, queue.length) }, async () => { while (queue.length) { const W = queue.shift(); rows.push(await measure(W)); } }));
// --noise: a second capture per named width from a fresh context, then the self-diff over the common area (gate's pixelmatch threshold)
const noise = {};
const selfDiff = (fa, fb) => { const A = PNG.sync.read(readFileSync(fa)); const B = PNG.sync.read(readFileSync(fb)); const w = Math.min(A.width, B.width); const h = Math.min(A.height, B.height); const rows = (P) => { if (P.width === w) return P.data.subarray(0, w * h * 4); const o = Buffer.alloc(w * h * 4); for (let y = 0; y < h; y++) P.data.copy(o, y * w * 4, y * P.width * 4, y * P.width * 4 + w * 4); return o; }; const n = pixelmatch(rows(A), rows(B), null, w, h, { threshold: 0.1 }); return { pct: Number(((n / (w * h)) * 100).toFixed(2)), dh: B.height - A.height, w, h }; };
if (process.argv.includes('--noise') && capture) {
  const v = arg('--noise', true); const base = widths.includes(1440) ? 1440 : widths[Math.floor(widths.length / 2)];
  const nw = v === true ? [base] : v === 'all' ? widths : String(v).split(',').map(Number).filter((w) => widths.includes(w));
  for (const W of nw) {
    const a = join(out, `live-${W}.png`); if (!existsSync(a)) { noise[W] = { error: 'no first capture' }; continue; }
    const ctx = await browser.newContext(contextOptions({ width: W, height: vh, locale: overlays.locale })); const tn = Date.now();
    try { const r = await captureUrl(ctx, url, join(out, `live-${W}-b.png`), { width: W, vh, wait, consent: overlays.consent, dismiss: overlays.dismiss, locale: overlays.locale, require: overlays.require }); await r.page.close().catch(() => {}); noise[W] = { ...selfDiff(a, join(out, `live-${W}-b.png`)), file: join(out, `live-${W}-b.png`), seconds: Number(((Date.now() - tn) / 1000).toFixed(1)) }; } catch (e) { noise[W] = { error: String(e.message || e).split('\n')[0].slice(0, 160) }; }
    await ctx.close().catch(() => {});
    if (noise[W].pct > 1) notes.push(`${W}: noise floor ${noise[W].pct} % — far above 0 it is a composition or a mid-flight entrance, not noise: name the regions (crop) and pick one (--require)`);
  }
}
await browser.close();
rows.sort((a, b) => a.W - b.W);
for (const r of rows) {
  if (r.error) { notes.push(`${r.W}: ${r.error}`); continue; }
  if (r.usedSections && r.usedSections !== sections) notes.push(`${r.W}: --sections "${sections}" matched nothing — measured with the guess '${r.usedSections}' (${r.nSections} sections, heights ${r.sectionsGuess.heights.slice(0, 8).join('/')}); pass it as --sections to keep it`);
  else if (r.nSections === 0) notes.push(`${r.W}: --sections "${sections}" matches nothing — the spec has header/footer only; ${r.sectionsGuess ? `guess: --sections '${r.sectionsGuess.sel}' (${r.sectionsGuess.n} matches, heights ${r.sectionsGuess.heights.slice(0, 8).join('/')}) — run again with it` : `read structure-${r.W}.txt for the section selector`}`);
  if (r.spec?.broken) notes.push(`${r.W}: ${r.spec.broken} broken live image(s) (naturalWidth 0: the live page paints the alt text in the box — author the picture, register the band)`);
  if (r.pierce) notes.push(`${r.W}: ${r.first?.shadowHosts || 0} shadow hosts — the content dump and the spec read the COMPOSED tree (shadow roots and slots); deep-probe / hover-diff take \` >> \` selectors`);
  if (r.first?.breakpoints?.length) notes.push(`${r.W}: breakpoints (media queries by count) ${r.first.breakpoints.slice(0, 6).join(', ')}`);
  if (r.nSections < 0) notes.push(`${r.W}: --sections "${sections}" is not a valid selector`);
  if (r.root.tag !== 'main' && typeof arg('--main', null) !== 'string') notes.push(`${r.W}: content root ${r.root.name} (${r.hasMain ? 'the largest ancestor of main that adds no chrome' : 'no <main>'}) — dump key "${r.contentMain}"`);
  if (r.scrolled?.gone?.length) notes.push(`${r.W}: ${r.scrolled.gone.join(', ')} fixed at rest but GONE after one viewport of scroll — a header that hides on scroll (the live capture has it in the first chunk only; a build that keeps it paints it in every chunk — 5 min of crops, bny)`);
  if (r.scrolled && (r.scrolled.newlyPinned.length || Math.abs(r.scrolled.shift) >= 2)) notes.push(`${r.W}: after one viewport of scroll ${r.scrolled.newlyPinned.length ? `${r.scrolled.newlyPinned.join(', ')} pin${r.scrolled.newlyPinned.length > 1 ? '' : 's'} fixed / sticky` : 'no new fixed layer'}${Math.abs(r.scrolled.shift) >= 2 ? ` and the first content box moved ${r.scrolled.shift} px — a layer that leaves the flow when it pins: reproduce it or every chunk after the first is offset in the capture` : ''}`);
  if (r.first?.tallHeader) notes.push(`${r.W}: ${r.first.tallHeader}`);
  if (r.unassigned?.length) notes.push(`${r.W}: UNASSIGNED band(s) outside header / main / footer dumped as extra content roots — ${r.unassigned.join(', ')} (the first look names their boxes; triage them as chrome or content)`);
  if (r.spec?.entrance) notes.push(`${r.W}: ${r.spec.entrance} spec items read inside an entrance state (\`rest\` on the item; pair / sections compare at rest)`);
  if (r.spec?.running) notes.push(`${r.W}: ${r.spec.running} animations still running at read time (infinite ones)`);
  if (r.cap?.error) notes.push(`${r.W}: capture failed — ${r.cap.error}`);
  if (r.cap?.failedFonts?.length) notes.push(`${r.W}: font load FAILED for ${r.cap.failedFonts.join(', ')} — the capture renders fallback type`);
}
const allCheckRows = rows.flatMap((r) => r.checkRows || []);
const check = profile && allCheckRows.length ? verdictOf(allCheckRows) : null;
const summary = {
  _schema: 'stardust-lite/measure-page@1', _writtenAt: new Date().toISOString(), url, widths, vh,
  elapsedByWidth: Object.fromEntries(rows.map((r) => [r.W, r.elapsed])),
  files: Object.fromEntries(rows.filter((r) => !r.error).map((r) => [r.W, r.files])),
  captures: Object.fromEntries(rows.filter((r) => r.cap && !r.cap.error).map((r) => [r.W, join(out, `live-${r.W}.png`)])),
  captureInfo: Object.fromEntries(rows.filter((r) => r.cap).map((r) => [r.W, r.cap.error ? { error: r.cap.error } : { width: r.cap.width, height: r.cap.height, chunks: r.cap.chunks, seconds: r.cap.seconds, chunkWaitsMs: r.cap.waited, timedOut: r.cap.timedOut, failedFonts: r.cap.failedFonts }])),
  profileCheck: check ? { verdict: check.verdict, checks: check.checks, fails: check.fails, warns: check.warns, tol, profile: profile._file, rows: allCheckRows.map(([W, name, expected, actual, verdict]) => ({ W, check: name, expected, actual, verdict })) } : null,
  sectionsSelector: rows.find((r) => r.usedSections && r.usedSections !== sections)?.usedSections || sections, header: chromeUsed[1440]?.header || Object.values(chromeUsed)[0]?.header || header, footer: chromeUsed[1440]?.footer || Object.values(chromeUsed)[0]?.footer || footer, hidden,
  mainRoot: Object.fromEntries(rows.filter((r) => !r.error).map((r) => [r.W, { structure: r.root.name, path: r.root.path, content: r.contentMain }])),
  fixedLayers: Object.fromEntries(rows.filter((r) => r.first).map((r) => [r.W, r.first.fixed])),
  unassigned: Object.fromEntries(rows.filter((r) => r.first).map((r) => [r.W, r.first.unassigned || []])),
  breakpoints: rows.find((r) => r.first?.breakpoints?.length)?.first.breakpoints || [],
  noise: Object.keys(noise).length ? noise : null,
  scrolled: Object.fromEntries(rows.filter((r) => r.scrolled).map((r) => [r.W, r.scrolled])),
  shadowRoots: Object.fromEntries(rows.filter((r) => r.first).map((r) => [r.W, r.first.shadowHosts])),
  status: Object.fromEntries(rows.map((r) => [r.W, r.status ?? null])),
  overlays: { consent: overlays.consent, dismiss: overlays.dismiss, locale: overlays.locale, require: overlays.require },
  deep: deepSels ? { sels: deepSels, max: DEEP_MAX } : { sels: [header, sections, footer], max: DEEP_MAX },
  notes,
};
writeFileSync(join(out, 'summary.json'), JSON.stringify(summary, null, 1));
const col = (v, n) => String(v ?? '—').padStart(n);
console.log(`${url} → ${out}/`);
console.log('width   s  status    doc  fixed  shadow  sections  items  roots (header / main / footer nodes)   imgs  bgs  svgs  fonts  deep  capture');
for (const r of rows) {
  if (r.error) { console.log(`${col(r.W, 5)}  ${col(r.elapsed.toFixed(1), 5)}  ERROR ${r.error}`); continue; }
  console.log(`${col(r.W, 5)} ${col(r.elapsed.toFixed(1), 5)}  ${col(r.status, 6)} ${col(r.doc, 6)}  ${col(r.first?.fixed.length, 5)}  ${col(r.first?.shadowHosts, 6)}  ${col(r.spec ? r.spec.secs : r.nSections, 8)}  ${col(r.spec ? r.spec.items : '—', 5)}  ${r.contentRoots.join(' / ').slice(0, 38).padEnd(38)}  ${col(r.media.imgs, 4)}  ${col(r.media.bgs, 3)}  ${col(r.media.svgs, 4)}  ${col(r.media.fontRequests, 5)}  ${col(r.deepLines, 4)}  ${r.cap ? (r.cap.error ? 'FAILED' : `${r.cap.width}x${r.cap.height} ${r.cap.chunks} chunks ${r.cap.seconds} s`) : '—'}`);
}
for (const [W, nz] of Object.entries(noise)) console.log(`noise floor: ${W} ${nz.error ? `FAILED — ${nz.error}` : `${nz.pct} % (Δh ${nz.dh}, ${nz.seconds} s) — live-${W}.png vs live-${W}-b.png`}`);
for (const n of notes) console.log(`note: ${n}`);
if (check) console.log(`profile check: ${check.line}${check.fails ? ' — run `site-profile check migration/site.json` on its own; a FAIL is site work, not this page\'s round' : ''}`);
console.log(`next: node scripts/brief.mjs ${out} [--triage triage.json] — the one-screen CSS brief (text styles, media, paint, cap per section and width); read it before the specs`);
console.log(`files per width: probe-load-<W>.txt structure-<W>.txt content-<W>.json media-<W>.json${noSpec ? '' : ' spec-<W>.json dom-<W>.html'} deep-<W>.txt${capture ? ' live-<W>.png' : ''}; summary.json`);
process.exit(rows.some((r) => r.error) ? 2 : 0);
