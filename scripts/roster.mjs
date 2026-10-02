#!/usr/bin/env node
// roster.mjs — the site's page roster and block coverage, as data: `migration/roster.json` (+ `roster.md`), the `prepare-migration`
// artefact METHOD's prerequisites name and lite never had (SCALING-PLAN §2.D, batch-7 rollout). For every page one LIGHT pass at one
// width — open with the profile's overlays, settle, dump the content root with content-dump's walker, fingerprint the sections and match them
// against the block inventory (lib/fingerprint.mjs) — no spec, no capture, no media: ≈ 10–60 s a page. Then: the coverage matrix
// (pages × blocks), the novelty per page, the pages that share a template (skeleton clusters seeded by the approved template pages) and
// the ones that look like a new template, and two orders for the rollout (reuse-first, novelty-first). `pick` writes the page list the
// later passes consume. Timeouts, non-200s and off-host redirects are rows with `status` and `error`, never a crash.
//
// Usage: node roster.mjs (--urls <file> | --nav | --crawl <N>) --out migration/roster.json [--md migration/roster.md]
//          [--blocks migration/blocks.json] [--width 1440] [--concurrency 2] [--limit N] [--origin <url>] [--site-repo .]
//          [--include <regex>] [--exclude <regex>] [--main <css>] [--slow 90] [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--require <css,…>]
//        node roster.mjs pick --roster migration/roster.json --n 10 --order reuseFirst|noveltyFirst [--templates-max 3] [--include-approved] --out pages.json
//        node roster.mjs print --roster migration/roster.json [--md migration/roster.md]   the table and the markdown again, from the JSON
//   --urls <file>   one URL per line (`#` comments); relative paths resolve against the origin
//   --nav           the URLs of the site's nav document: every link in `migration/cases/*/doc/nav.html` and `footer.html` under
//                   --site-repo (default cwd), resolved against the origin, same host only, fragments / queries / mailto / tel / files
//                   dropped, deduped by path; the origin itself first (the approved home seeds the template clusters)
//   --crawl <N>     breadth-first from the origin over the same-host links the light pass reads, at most N pages
//   --include / --exclude   regexes over the URL (applied to every mode)
//   --origin        default: the profile's `origin`, else the most frequent host among the nav's absolute links, else the first URL
//   --blocks        block-inventory's blocks.json (default migration/blocks.json; absent = empty inventory, every section new / collection)
//   --width         ONE width (this is the light pass); --concurrency never above 3 (the machine's browsers are shared): one browser
//                   context per worker, so a consent accepted on the first page (even a reload-on-consent OneTrust) holds for the rest
//   --main          the content root to dump; default: the largest ancestor of `main` / `[role=main]` that adds no header, footer or
//                   nav sibling (a hero before `main` in the same wrapper is content — dentsu; the shell above header + main + footer is
//                   not — marriott), else `body` without its chrome. `mainRoot` in the row names what was dumped
//   --slow          seconds a page may take before it is recorded as `slow` and the worker moves on (default 90)
//   The overlay flags fall back to migration/site.json (`--site <file>`, `--no-site`). A 4xx / 5xx, an off-host redirect or a network error is
//   retried once (a network error in a fresh context: the origin may have reset the worker's HTTP/2 connection); a redirect onto a page
//   already in the roster is a `duplicate` row; a page with no sections is read but left out of the orders and the pick.
//
// roster.json: { _schema: "stardust-lite/roster@1", _writtenAt, _source: { mode, input, origin, blocks, width, concurrency, overlays, limit },
//   origin, pages: [{ index, url, finalUrl, status, title, templateHints: { pathSegment, bodyClasses, template, ogType }, mainRoot,
//     chrome: { header, footer }, sections: [{ index, anchorText, match: { kind, block, variant, confidence }, key, fingerprintPattern, repeat, unitSig }],
//     novelty, newSections: [idx], newFingerprints: [pattern], coveredBy: { inventory, collection, default, new }, skeleton: "hero|cards.tiles|default",
//     template, templateCandidate, approved, elapsed, retries, error: null | "status 404" | "off-host redirect → …" | "slow" | "…", slow }],
//   blocks: { "<block>" | "<block.variant>": [page indexes] }, templates: [{ id, seed, skeletonSignature, pages: [idx], novelty, templateCandidate }],
//   order: { reuseFirst: [idx], noveltyFirst: [{ index, adds }] }, picks: { reuseFirst: [idx], noveltyFirst: [idx] }, summary }
// pages.json (pick): { _schema: "stardust-lite/pages@1", _source, pages: [{ url, slug, template, novelty, templateCandidate, docPath: "/drafts/<slug>", rosterIndex }] }
// Template detection: skeleton = the ordered section match keys (inventory `block` / `block.variant`, `cards?` collection only, `new`,
// `default`); similarity = 0.75 × Jaccard over the keys plus their adjacent pairs + 0.25 × template-hint agreement (first path segment,
// `<meta name=template>`, og:type, body classes); a page joins a cluster at ≥ 0.6 against the cluster's first member, else it starts
// one — with `templateCandidate: true` when its novelty is ≥ 0.5. Orders: reuse-first = ascending novelty then descending inventory
// coverage; novelty-first = greedy set cover over the distinct new fingerprints (`×N` collapsed), pages that add nothing sink.
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { arg, openPage, settle, overlayOpts, siteProfile, contextOptions } from './common.mjs';
import { collectContent } from './lib/content-collector.mjs';
import { splitSections, fingerprint, dropGeneric, matchSection, cleanClasses } from './lib/fingerprint.mjs';

const USAGE = 'usage: roster.mjs (--urls <file> | --nav | --crawl <N>) --out migration/roster.json [--md migration/roster.md] [--blocks migration/blocks.json] [--width 1440] [--concurrency 2] [--limit N] [--origin <url>] [--include <re>] [--exclude <re>] [--main <css>] [--slow 90] [--consent] [--dismiss] [--locale] [--require]\n       roster.mjs pick --roster migration/roster.json --n 10 --order reuseFirst|noveltyFirst [--templates-max 3] [--include-approved] --out pages.json\n       roster.mjs print --roster migration/roster.json [--md migration/roster.md]';
const readJson = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pathOf = (u) => { try { const x = new URL(u); return x.pathname + (x.search || ''); } catch { return u; } };
const slugOf = (u) => { const seg = pathOf(u).split('?')[0].split('/').filter(Boolean).pop() || 'home'; return seg.toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'home'; };
const pct = (x) => `${Math.round((x || 0) * 100)} %`;
const w = (s, n) => String(s ?? '').slice(0, n).padEnd(n);

/* ---------------------------------------------------------------- pick (also used for the suggested ten in the markdown) -------- */
function pickPages(roster, { n = 10, order = 'reuseFirst', templatesMax = 3, includeApproved = false } = {}) {
  const seq = order === 'noveltyFirst' ? roster.order.noveltyFirst.map((o) => (typeof o === 'number' ? o : o.index)) : roster.order.reuseFirst;
  const out = []; let candidates = 0; const slugs = new Map();
  for (const i of seq) {
    const p = roster.pages[i];
    if (!p || p.error || !p.sections?.length) continue;
    if (p.approved && !includeApproved) continue;
    if (p.templateCandidate) { if (candidates >= templatesMax) continue; candidates++; }
    let slug = slugOf(p.finalUrl || p.url); if (slugs.has(slug)) { slugs.set(slug, slugs.get(slug) + 1); slug = `${slug}-${slugs.get(slug)}`; } else slugs.set(slug, 1);
    out.push({ url: p.finalUrl || p.url, slug, template: p.template, novelty: p.novelty, templateCandidate: !!p.templateCandidate, docPath: `/drafts/${slug}`, rosterIndex: p.index });
    if (out.length >= n) break;
  }
  return out;
}

if (process.argv[2] === 'print') {
  const rosterFile = arg('--roster', null); if (!rosterFile || typeof rosterFile !== 'string') { console.error(USAGE); process.exit(1); }
  const roster = readJson(resolve(rosterFile)); if (!roster?.pages) { console.error(`roster print: ${rosterFile} unreadable or not a roster`); process.exit(1); }
  render(roster, { md: arg('--md', null) }); process.exit(0);
}
if (process.argv[2] === 'pick') {
  const rosterFile = arg('--roster', null); const out = arg('--out', null); const order = arg('--order', 'reuseFirst');
  if (!rosterFile || typeof rosterFile !== 'string' || !out || typeof out !== 'string' || !['reuseFirst', 'noveltyFirst'].includes(order)) { console.error(USAGE); process.exit(1); }
  const roster = readJson(resolve(rosterFile)); if (!roster?.pages) { console.error(`roster pick: ${rosterFile} unreadable or not a roster`); process.exit(1); }
  const n = Number(arg('--n', 10)); const templatesMax = Number(arg('--templates-max', 3)); const includeApproved = process.argv.includes('--include-approved');
  const pages = pickPages(roster, { n, order, templatesMax, includeApproved });
  const json = { _schema: 'stardust-lite/pages@1', _writtenAt: new Date().toISOString(), _source: { roster: resolve(rosterFile), order, n, templatesMax, includeApproved }, pages };
  mkdirSync(dirname(resolve(out)), { recursive: true }); writeFileSync(resolve(out), JSON.stringify(json, null, 1));
  console.log(`${w('#', 3)} ${w('slug', 28)} ${w('template', 10)} ${w('novelty', 8)} ${w('kind', 10)} url`);
  pages.forEach((p, i) => console.log(`${w(i + 1, 3)} ${w(p.slug, 28)} ${w(p.template, 10)} ${w(pct(p.novelty), 8)} ${w(p.templateCandidate ? 'template' : 'reuse', 10)} ${p.url}`));
  console.log(`\n${pages.length} page(s), ${pages.filter((p) => p.templateCandidate).length} template candidate(s) (max ${templatesMax}), order ${order} → ${resolve(out)}`);
  process.exit(0);
}

/* ---------------------------------------------------------------- inputs ---------------------------------------------------------- */
const mode = arg('--urls', null) ? 'urls' : process.argv.includes('--nav') ? 'nav' : arg('--crawl', null) ? 'crawl' : null;
const out = arg('--out', null);
if (!mode || !out || typeof out !== 'string') { console.error(USAGE); process.exit(1); }
const profile = siteProfile();
const siteRepo = resolve(arg('--site-repo', '.'));
const blocksFile = resolve(arg('--blocks', 'migration/blocks.json')); const inventory = readJson(blocksFile); const blocks = inventory?.blocks || [];
if (!inventory) console.error(`roster: ${blocksFile} not found — matching against an empty inventory (every section is collection / new)`);
const width = Number(arg('--width', 1440)); const concurrency = Math.max(1, Math.min(3, Number(arg('--concurrency', 2))));
const limit = arg('--limit', null) ? Number(arg('--limit')) : null; const slowMs = Number(arg('--slow', 90)) * 1000;
const include = arg('--include', null) ? new RegExp(arg('--include')) : null; const exclude = arg('--exclude', null) ? new RegExp(arg('--exclude')) : null;
const mainSel = typeof arg('--main', null) === 'string' ? arg('--main') : (profile?.cap?.contentRoot && profile.cap.contentRoot !== 'main' ? profile.cap.contentRoot : null); const overlays = overlayOpts(); const md = arg('--md', null); // mainSel null = the content root is found per page (see the header); the profile's cap.contentRoot when it has one (BACKLOG 139)
const headerSel = profile?.chrome?.header?.selector || 'header'; const footerSel = profile?.chrome?.footer?.selector || 'footer';
const FILE_RE = /\.(pdf|jpe?g|png|gif|svg|webp|avif|mp4|webm|mp3|m4a|zip|gz|docx?|xlsx?|pptx?|csv|xml|json|ics|txt|rss|atom)$/i;
const hostKey = (h) => String(h || '').toLowerCase().replace(/^www\./, '');

let origin = arg('--origin', null) || profile?.origin || null;
const navDocs = () => { const dir = join(siteRepo, 'migration', 'cases'); if (!existsSync(dir)) return []; return readdirSync(dir).filter((c) => statSync(join(dir, c)).isDirectory()).flatMap((c) => ['nav.html', 'footer.html'].map((f) => join(dir, c, 'doc', f))).filter((f) => existsSync(f)); };
const hrefsOf = (html) => [...html.matchAll(/href\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)].map((m) => m[1] ?? m[2]).filter(Boolean);
let rawList = []; let inputNote = null;
if (mode === 'urls') {
  const f = resolve(arg('--urls')); if (!existsSync(f)) { console.error(`roster: ${f} not found`); process.exit(1); }
  rawList = readFileSync(f, 'utf8').split('\n').map((l) => l.replace(/#.*$/, '').trim()).filter(Boolean); inputNote = f;
  if (!origin) { try { origin = new URL(rawList[0]).origin + '/'; } catch { console.error('roster: --origin needed (the first URL is relative)'); process.exit(1); } }
} else if (mode === 'nav') {
  const docs = navDocs(); if (!docs.length) { console.error(`roster: no migration/cases/*/doc/nav.html or footer.html under ${siteRepo} (--site-repo)`); process.exit(1); }
  rawList = docs.flatMap((d) => hrefsOf(readFileSync(d, 'utf8'))); inputNote = docs.map((d) => d.replace(siteRepo + '/', '')).join(', ');
  if (!origin) { const hosts = new Map(); for (const h of rawList) { try { const u = new URL(h); if (/^https?:$/.test(u.protocol)) hosts.set(u.host, (hosts.get(u.host) || 0) + 1); } catch { /* relative */ } } const top = [...hosts].sort((a, b) => b[1] - a[1])[0]; if (!top) { console.error('roster: --origin needed (no absolute link in the nav documents)'); process.exit(1); } origin = `https://${top[0]}/`; console.error(`roster: origin ${origin} (the most frequent host in the nav documents; --origin overrides)`); }
  rawList.unshift(origin);
} else {
  if (!origin) { console.error('roster: --crawl needs an origin (--origin or the profile)'); process.exit(1); }
  rawList = [origin]; inputNote = `crawl from ${origin}, at most ${arg('--crawl')} pages`;
}
const originHost = hostKey(new URL(origin).host);
const normalize = (href, base = origin) => {
  if (!href || /^(mailto:|tel:|javascript:|data:|#)/i.test(href.trim())) return null;
  let u; try { u = new URL(href.trim(), base); } catch { return null; }
  if (!/^https?:$/.test(u.protocol) || hostKey(u.host) !== originHost) return null;
  if (FILE_RE.test(u.pathname)) return null;
  u.hash = ''; u.search = '';
  if (include && !include.test(u.href)) return null; if (exclude && exclude.test(u.href)) return null;
  return u.href;
};
const keyOf = (u) => new URL(u).pathname.replace(/\/+$/, '') || '/';
const seen = new Set(); const queue = [];
// the seed survives the include / exclude filters: `--include '/ch/en/.'` rejected the origin itself and no URL was left (sdt-dentsu)
const enqueue = (href, base, seed = false) => { const u = seed ? normalize(href, base) || (() => { try { const x = new URL(href, base); x.hash = ''; x.search = ''; return x.href; } catch { return null; } })() : normalize(href, base); if (!u) return false; const k = keyOf(u); if (seen.has(k)) return false; const cap = mode === 'crawl' ? Math.min(Number(arg('--crawl')), limit || Infinity) : (limit || Infinity); if (queue.length >= cap) return false; seen.add(k); queue.push(u); return true; };
for (const h of rawList) enqueue(h, origin, mode === 'crawl' || h === origin);
if (!queue.length) { console.error('roster: no URL survives the origin / include / exclude filters'); process.exit(1); }
console.error(`roster: ${mode} — ${queue.length} page(s) queued${mode === 'crawl' ? ' to start' : ''} from ${inputNote}; origin ${origin}; width ${width}; ${concurrency} worker(s); inventory ${blocks.length} row(s)`);

/* ---------------------------------------------------------------- the light pass ------------------------------------------------- */
const approvedSlugs = new Map((profile?.pages || []).map((p) => [slugOf(`${origin}${String(p.path || '').replace(/^\/drafts\//, '')}`), p.template || slugOf(p.path || '')]));
// the approved home is the ORIGIN (`/ch/en` on a locale edition, not `/`): `pages[].path` is the DA path (`/drafts/home`), so a page whose
// URL is the origin is approved when the profile has a home / index template; `pages[].url` wins when the profile carries it
const approvedUrls = new Set((profile?.pages || []).map((p) => p.url).filter(Boolean).map(keyOf));
const homeApproved = (profile?.pages || []).some((p) => /^(home|index)$/.test(p.template || slugOf(p.path || '')));
const isApproved = (u) => { if (approvedUrls.has(keyOf(u))) return true; if (homeApproved && keyOf(u) === keyOf(origin)) return true; const slug = slugOf(u); return approvedSlugs.has(slug) && (slug !== 'home' || pathOf(u).split('/').filter(Boolean).length === 0); }; // `/x/home/` is not the approved home
const keyFor = (m) => (m.kind === 'inventory' ? `${m.block}${m.variant ? `.${m.variant}` : ''}` : m.kind === 'collection' ? `${m.block}?` : m.kind === 'default' ? 'default' : 'new');
const normPattern = (p) => String(p || '').replace(/×\d+/g, '×n');
const stripChrome = (nodes, depth = 0) => nodes.filter((n) => !(/^(header|footer|nav)$/.test(String(n.tag || '')) || /\b(header|footer|masthead|colophon)\b/i.test(`${n.cls || ''} ${n.id || ''}`))).map((n) => (depth < 2 && n.children ? { ...n, children: stripChrome(n.children, depth + 1) } : n));

async function lightPass(ctx, url, attempt) {
  const t0 = Date.now(); let status = null; let page = null;
  const row = { url, finalUrl: null, status: null, title: null, templateHints: null, mainRoot: null, chrome: { header: false, footer: false }, sections: [], novelty: null, newSections: [], newFingerprints: [], coveredBy: { inventory: 0, collection: 0, default: 0, new: 0 }, skeleton: '', links: [], elapsed: 0, retries: attempt, error: null };
  const work = async () => {
    page = await openPage(ctx, url, { width, consent: overlays.consent, dismiss: overlays.dismiss, locale: overlays.locale, require: [], wait: 2500, before: (p) => p.on('response', (r) => { try { if (r.request().isNavigationRequest() && r.frame() === p.mainFrame()) status = r.status(); } catch { /* detached */ } }) });
    row.finalUrl = page.url(); row.status = status;
    if (hostKey(new URL(row.finalUrl).host) !== originHost) throw Object.assign(new Error(`off-host redirect → ${row.finalUrl}`), { skip: true });
    if (status && status >= 400) throw Object.assign(new Error(`status ${status}`), { skip: true });
    if (overlays.require.length) { const missing = await page.evaluate((sels) => sels.filter((s) => { try { return !document.querySelector(s); } catch { return true; } }), overlays.require); if (missing.length) throw new Error(`composition mismatch — missing ${missing.join(' | ')}`); }
    await settle(page);
    const meta = await page.evaluate(([mainSel, headerSel, footerSel]) => {
      const q = (s) => { try { return document.querySelector(s); } catch { return null; } };
      // the content root: --main when it resolves; else the LARGEST ancestor of `main` (or [role=main]) that adds no chrome — a hero
      // that sits before `main` inside the same content wrapper is content (dentsu); a wrapper whose other children are a header, a
      // footer or a nav is the shell (marriott's #inner-wrap) and the climb stops below it; no main at all → body without its chrome
      const chrome = (e) => /^(header|footer|nav|aside)$/i.test(e.tagName) || /\b(header|footer|masthead|colophon|nav)\b/i.test(`${e.className} ${e.id}`);
      let el = mainSel ? q(mainSel) : null;
      if (!el) { el = q('main') || q('[role=main]'); while (el && el.parentElement && el.parentElement !== document.body && ![...el.parentElement.children].some((c) => c !== el && chrome(c))) el = el.parentElement; }
      let root = 'body'; if (el) { el.setAttribute('data-roster-root', ''); root = '[data-roster-root]'; }
      const name = (e) => `${e.tagName.toLowerCase()}${e.id ? `#${e.id}` : ''}${[...e.classList].slice(0, 2).map((c) => `.${c}`).join('')}`;
      const path = location.pathname.split('/').filter(Boolean);
      return { root, rootName: el ? name(el) : 'body (chrome stripped)', header: !!q(headerSel), footer: !!q(footerSel), title: document.title, bodyClasses: [...document.body.classList], template: q('meta[name="template"]')?.content || document.documentElement.dataset.template || null, ogType: q('meta[property="og:type"]')?.content || null, pathSegment: path[0] || 'home', links: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter(Boolean).slice(0, 3000) };
    }, [mainSel, headerSel, footerSel]);
    const dumped = await page.evaluate(collectContent, [[meta.root], []]);
    let nodes = dumped[meta.root] || []; if (meta.root === 'body') nodes = stripChrome(nodes);
    row.title = meta.title; row.mainRoot = meta.rootName; row.chrome = { header: meta.header, footer: meta.footer }; row.links = meta.links;
    row.templateHints = { pathSegment: meta.pathSegment, bodyClasses: cleanClasses(meta.bodyClasses.join(' '), 8).filter((c) => !/\d{2,}/.test(c)), template: meta.template, ogType: meta.ogType };
    const split = splitSections({ main: nodes, __title: meta.title });
    const fps = split.sections.map((n) => fingerprint(n)); dropGeneric(fps);
    fps.forEach((fp, index) => {
      const m = matchSection(fp, blocks); const key = keyFor(m);
      row.coveredBy[m.kind] = (row.coveredBy[m.kind] || 0) + 1;
      if (m.kind === 'new') { row.newSections.push(index); const np = normPattern(fp.pattern); if (np && !row.newFingerprints.includes(np)) row.newFingerprints.push(np); }
      row.sections.push({ index, anchorText: fp.anchorText, match: { kind: m.kind, block: m.block, variant: m.variant, confidence: m.confidence }, key, fingerprintPattern: fp.pattern, repeat: fp.repeat, unitSig: fp.unitSig, height: fp.box ? fp.box[3] : null });
    });
    row.skeleton = row.sections.map((s) => s.key).join('|');
    row.novelty = fps.length ? Number((row.coveredBy.new / fps.length).toFixed(2)) : 0;
  };
  let timer; const slow = new Promise((_, reject) => { timer = setTimeout(() => reject(Object.assign(new Error('slow'), { slow: true })), slowMs); });
  try { await Promise.race([work(), slow]); } catch (e) {
    row.error = e.message.split('\n')[0].slice(0, 160); row.status = row.status ?? status; if (e.skip) row.skipped = true; if (e.slow) row.slow = true;
    // a navigation the browser could not complete (`net::ERR_HTTP2_PROTOCOL_ERROR`) is often a redirect onto another host the browser
    // then fails on (marriott's /investor-relations/* → ir.marriottvacationsworldwide.com): ask the origin once without following
    if (/net::ERR_/.test(row.error)) { try { const r = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(8000) }); const loc = r.headers.get('location'); if (loc && r.status >= 300 && r.status < 400) { const to = new URL(loc, url); row.status = r.status; row.finalUrl = to.href; if (hostKey(to.host) !== originHost) { row.error = `off-host redirect → ${to.href} (${row.error})`; row.skipped = true; } } else if (r.status >= 400) { row.status = r.status; row.error = `status ${r.status} (${row.error})`; row.skipped = true; } } catch { /* keep the browser's error */ } }
  }
  clearTimeout(timer); if (page) await page.close().catch(() => {});
  row.elapsed = Number(((Date.now() - t0) / 1000).toFixed(1));
  return row;
}

const browser = await chromium.launch();
const rows = []; let next = 0; let active = 0; let done = 0; const wall0 = Date.now();
async function take() { for (;;) { if (next < queue.length) { active++; return next++; } if (mode !== 'crawl' || active === 0) return null; await sleep(250); } }
const workers = Array.from({ length: concurrency }, async () => {
  let ctx = await browser.newContext(contextOptions({ width, locale: overlays.locale }));
  for (;;) {
    const i = await take(); if (i === null) break;
    const url = queue[i];
    let row = await lightPass(ctx, url, 0);
    if (row.error && !row.slow) {
      // a network-level failure poisons the context (the origin reset the HTTP/2 connection after ~10 pages and every page after it
      // failed in 0.3 s — marriott): a fresh context reconnects (and re-accepts the consent) before the one retry
      const net = /net::ERR_|Timeout|ERR_CONNECTION|socket/i.test(row.error) && !row.skipped;
      if (net) { await ctx.close().catch(() => {}); await sleep(3000); ctx = await browser.newContext(contextOptions({ width, locale: overlays.locale })); }
      console.error(`roster: ${url} — ${row.error}; retrying once${net ? ' in a fresh context' : ''}`);
      const again = await lightPass(ctx, url, 1); again.elapsed = Number((again.elapsed + row.elapsed).toFixed(1)); row = again;
    }
    if (!row.error && row.finalUrl) { const fk = keyOf(row.finalUrl); if (fk !== keyOf(url)) { if (seen.has(fk)) { row.error = `duplicate: redirects to ${pathOf(row.finalUrl)}`; row.skipped = true; row.sections = []; row.skeleton = ''; } else seen.add(fk); } }
    if (mode === 'crawl' && !row.error) { let added = 0; for (const h of row.links) if (enqueue(h, row.finalUrl || url)) added++; if (added) console.error(`roster: +${added} link(s) queued from ${pathOf(url)} (${queue.length} total)`); }
    delete row.links; row.index = i; rows[i] = row; done++; active--;
    console.error(`roster: [${done}/${queue.length}] ${w(row.error ? (row.slow ? 'slow' : 'ERR') : row.status || '?', 4)} ${String(row.elapsed).padStart(5)} s  ${row.error ? row.error : `novelty ${pct(row.novelty).padStart(5)}  ${row.sections.length} sections  ${row.skeleton.slice(0, 60)}`}  ${pathOf(url)}`);
  }
  await ctx.close();
});
await Promise.all(workers); await browser.close();
const wall = Number(((Date.now() - wall0) / 1000).toFixed(1));

/* ---------------------------------------------------------------- templates, coverage, orders ----------------------------------- */
const pages = rows.map((r) => ({ index: r.index, url: r.url, finalUrl: r.finalUrl, status: r.status, title: r.title, templateHints: r.templateHints, mainRoot: r.mainRoot, chrome: r.chrome, sections: r.sections, novelty: r.novelty, newSections: r.newSections, newFingerprints: r.newFingerprints, coveredBy: r.coveredBy, skeleton: r.skeleton, template: null, templateCandidate: false, approved: isApproved(r.finalUrl || r.url), elapsed: r.elapsed, retries: r.retries, error: r.error, ...(r.slow ? { slow: true } : {}), ...(r.skipped ? { skipped: true } : {}) }));
const ok = pages.filter((p) => !p.error && p.sections.length);
const jaccard = (A, B) => { const a = new Set(A); const b = new Set(B); const i = [...a].filter((x) => b.has(x)).length; const u = new Set([...a, ...b]).size; return u ? i / u : 0; };
const keyset = (p) => { const k = p.skeleton ? p.skeleton.split('|') : []; return [...k, ...k.slice(1).map((x, i) => `${k[i]}>${x}`)]; };
const hintAgree = (a, b) => { if (!a || !b) return 0; let n = 0; let s = 0; for (const f of ['pathSegment', 'template', 'ogType']) if (a[f] || b[f]) { n++; s += a[f] === b[f] ? 1 : 0; } n++; s += jaccard(a.bodyClasses, b.bodyClasses); return s / n; };
const similarity = (a, b) => 0.75 * jaccard(keyset(a), keyset(b)) + 0.25 * hintAgree(a.templateHints, b.templateHints);
const THRESH = 0.6; const clusters = [];
const seedOrder = [...ok].sort((a, b) => (b.approved - a.approved) || (a.novelty - b.novelty) || (a.index - b.index));
let tn = 0;
for (const p of seedOrder) {
  let best = null; for (const c of clusters) { const s = similarity(p, pages[c.pages[0]]); if (s >= THRESH && (!best || s > best.s)) best = { c, s }; }
  if (best) { best.c.pages.push(p.index); p.template = best.c.id; continue; }
  const id = p.approved ? approvedSlugs.get(slugOf(p.finalUrl || p.url)) : `t${++tn}`;
  const c = { id: clusters.some((x) => x.id === id) ? `${id}-${tn}` : id, seed: !!p.approved, skeletonSignature: p.skeleton, pages: [p.index], novelty: 0, templateCandidate: !p.approved && p.novelty >= 0.5 };
  clusters.push(c); p.template = c.id; p.templateCandidate = c.templateCandidate;
}
for (const c of clusters) c.novelty = Number((c.pages.reduce((s, i) => s + (pages[i].novelty || 0), 0) / c.pages.length).toFixed(2));
const blockIndex = {}; for (const p of ok) for (const s of p.sections) if (s.match.kind === 'inventory') { (blockIndex[s.key] ||= []); if (!blockIndex[s.key].includes(p.index)) blockIndex[s.key].push(p.index); }
const reuseFirst = [...ok].sort((a, b) => (a.novelty - b.novelty) || (b.coveredBy.inventory - a.coveredBy.inventory) || (a.index - b.index)).map((p) => p.index);
const noveltyFirst = []; { const covered = new Set(); const left = new Set(ok.map((p) => p.index)); for (;;) { let best = null; for (const i of left) { const adds = pages[i].newFingerprints.filter((f) => !covered.has(f)).length; if (adds > 0 && (!best || adds > best.adds || (adds === best.adds && (pages[i].novelty > pages[best.index].novelty || (pages[i].novelty === pages[best.index].novelty && i < best.index))))) best = { index: i, adds }; } if (!best) break; noveltyFirst.push(best); pages[best.index].newFingerprints.forEach((f) => covered.add(f)); left.delete(best.index); } for (const i of reuseFirst) if (left.has(i)) noveltyFirst.push({ index: i, adds: 0 }); }
const allNew = new Set(ok.flatMap((p) => p.newFingerprints));
const inventoryKeys = blocks.filter((b) => !['header', 'footer'].includes(b.name)).map((b) => `${b.name}${b.variant ? `.${b.variant}` : ''}`);
const coveredKeys = inventoryKeys.filter((k) => blockIndex[k]?.length);
const elapsedSum = Number(pages.reduce((s, p) => s + (p.elapsed || 0), 0).toFixed(1));
const summary = { pages: pages.length, ok: ok.length, errors: pages.filter((p) => p.error && !p.slow).length, slow: pages.filter((p) => p.slow).length, empty: pages.filter((p) => !p.error && !p.sections.length).length, templates: clusters.length, templateCandidates: clusters.filter((c) => c.templateCandidate).map((c) => c.id), blocksCovered: coveredKeys.length, blocksTotal: inventoryKeys.length, blocksUncovered: inventoryKeys.filter((k) => !coveredKeys.includes(k)), blocksAll: inventoryKeys, newFingerprints: allNew.size, meanNovelty: ok.length ? Number((ok.reduce((s, p) => s + p.novelty, 0) / ok.length).toFixed(2)) : null, elapsedSum, elapsedPerPage: pages.length ? Number((elapsedSum / pages.length).toFixed(1)) : null, wall, wallPerPage: pages.length ? Number((wall / pages.length).toFixed(1)) : null };
const roster = { _schema: 'stardust-lite/roster@1', _writtenAt: new Date().toISOString(), _source: { mode, input: inputNote, origin, blocks: inventory ? blocksFile : null, width, concurrency, overlays: { consent: overlays.consent, dismiss: overlays.dismiss, locale: overlays.locale, require: overlays.require }, limit, mainSelector: mainSel, slowSeconds: slowMs / 1000, siteProfile: profile?._file || null }, origin, pages, blocks: blockIndex, templates: clusters, order: { reuseFirst, noveltyFirst }, picks: {}, summary };
roster.picks = { reuseFirst: pickPages(roster, { order: 'reuseFirst' }).map((p) => p.rosterIndex), noveltyFirst: pickPages(roster, { order: 'noveltyFirst' }).map((p) => p.rosterIndex) };
mkdirSync(dirname(resolve(out)), { recursive: true }); writeFileSync(resolve(out), JSON.stringify(roster, null, 1));
render(roster, { md, out: resolve(out) });

/* ---------------------------------------------------------------- the human views (also `roster print`) ------------------------ */
function render(roster, { md = null, out = null } = {}) {
  const { pages, templates: clusters, blocks: blockIndex, order, picks, summary, _source: src } = roster;
  const host = new URL(roster.origin).host; const width = src.width; const concurrency = src.concurrency;
  const label = (i) => { const p = pages[i]; const a = pathOf(p.url); const b = p.finalUrl ? pathOf(p.finalUrl) : null; return b && b !== a && !p.error ? `${a} → ${b}` : a; };
  const cands = clusters.filter((c) => c.templateCandidate).flatMap((c) => c.pages.filter((i) => pages[i].templateCandidate).map(label));
  const tenOf = (o) => (picks[o] || []).map((i) => label(i)).join(', ');
  const paragraph = `${summary.pages} page${summary.pages === 1 ? '' : 's'} at ${width} (${summary.ok} read${summary.errors ? `, ${summary.errors} error${summary.errors === 1 ? '' : 's'}` : ''}${summary.slow ? `, ${summary.slow} slow` : ''}${summary.empty ? `, ${summary.empty} without sections` : ''}; ${summary.wall} s wall, ${summary.wallPerPage} s per page with ${concurrency} worker${concurrency === 1 ? '' : 's'}, ${summary.elapsedPerPage} s of browser time per page), ${summary.templates} template${summary.templates === 1 ? '' : 's'} by skeleton${clusters.filter((c) => c.seed).length ? ` (seeded by ${clusters.filter((c) => c.seed).map((c) => c.id).join(', ')})` : ''}, ${summary.blocksCovered} of ${summary.blocksTotal} inventory block${summary.blocksTotal === 1 ? '' : 's'} covered${summary.blocksUncovered.length ? ` (unused: ${summary.blocksUncovered.join(', ')})` : ''}, ${summary.newFingerprints} distinct new fingerprint${summary.newFingerprints === 1 ? '' : 's'}, mean novelty ${pct(summary.meanNovelty)}. ${cands.length ? `Pages that look like a new template (novelty ≥ 50 % and no cluster): ${cands.join(', ')}.` : 'No page looks like a new template.'} Suggested ten, reuse-first: ${tenOf('reuseFirst') || '—'}. Novelty-first: ${tenOf('noveltyFirst') || '—'}.`;
  const inventoryKeys = summary.blocksAll || [];
  const cols = [...inventoryKeys.filter((k) => blockIndex[k]), ...Object.keys(blockIndex).filter((k) => !inventoryKeys.includes(k))];
  const cell = (p, k) => { const hits = p.sections.filter((s) => s.key === k); return hits.length ? `${hits.length}${hits.every((s) => s.match.confidence === 'weak') ? '~' : ''}` : ''; }; // `~` = every hit is weak
  const blank = cols.map(() => '').join(' | ') + (cols.length ? ' | ' : '');
  const lines = [`# ${host} — roster (${String(roster._writtenAt || '').slice(0, 10)}; ${summary.pages} pages at ${width}, light pass, inventory ${src.blocks ? basename(src.blocks) : 'none'})`, '', paragraph, '', '## Coverage', '', `| # | page | template | novelty | ${cols.join(' | ')}${cols.length ? ' | ' : ''}collection | new | s |`, `|---|---|---|---|${cols.map(() => '---|').join('')}---|---|---|`];
  for (const p of pages) lines.push(p.error ? `| ${p.index} | ${label(p.index)} — ${p.slow ? 'slow' : p.error.slice(0, 120)} | — | — | ${blank} |  | ${p.elapsed} |` : `| ${p.index} | ${label(p.index)}${p.approved ? ' (approved)' : ''} | ${p.template || '—'}${p.templateCandidate ? ' ?' : ''} | ${pct(p.novelty)} | ${cols.map((k) => cell(p, k)).join(' | ')}${cols.length ? ' | ' : ''}${p.coveredBy.collection || ''} | ${p.coveredBy.new || ''} | ${p.elapsed} |`);
  lines.push('', 'Cells count the sections of a page matched to that block (`block.variant`; `~` = every hit is a weak match); `collection` = a collection-shaped section the inventory has no confident row for; `new` = no match. A template marked `?` is a candidate (novelty ≥ 50 %, no cluster). A row with an error names it after the page.', '', '## Templates', '', '| id | pages | novelty | skeleton | candidate | members |', '|---|---|---|---|---|---|');
  for (const c of clusters) lines.push(`| ${c.id}${c.seed ? ' (seed)' : ''} | ${c.pages.length} | ${pct(c.novelty)} | \`${c.skeletonSignature || '—'}\` | ${c.templateCandidate ? 'yes' : ''} | ${c.pages.map(label).join(', ')} |`);
  lines.push('', '## Orders', '', `reuse-first (ascending novelty, then descending coverage): ${order.reuseFirst.map((i) => `${label(i)} (${pct(pages[i].novelty)})`).join(', ') || '—'}`, '', `novelty-first (greedy cover of the distinct new fingerprints): ${order.noveltyFirst.map((o) => `${label(o.index)} (+${o.adds})`).join(', ') || '—'}`, '', `Suggested ten (at most 3 template candidates, approved pages excluded) — reuse-first: ${tenOf('reuseFirst') || '—'}; novelty-first: ${tenOf('noveltyFirst') || '—'}.`);
  if (md) { mkdirSync(dirname(resolve(md)), { recursive: true }); writeFileSync(resolve(md), lines.join('\n') + '\n'); }

  console.log(`${w('#', 3)} ${w('page', 40)} ${w('tmpl', 8)} ${w('novelty', 8)} ${w('inv', 4)} ${w('coll', 4)} ${w('new', 4)} ${w('s', 6)} skeleton / error`);
  for (const p of pages) console.log(`${w(p.index, 3)} ${w(label(p.index), 40)} ${w(p.error ? '—' : `${p.template}${p.templateCandidate ? '?' : ''}`, 8)} ${w(p.error ? '—' : pct(p.novelty), 8)} ${w(p.error ? '' : p.coveredBy.inventory, 4)} ${w(p.error ? '' : p.coveredBy.collection, 4)} ${w(p.error ? '' : p.coveredBy.new, 4)} ${w(p.elapsed, 6)} ${(p.error ? (p.slow ? 'slow' : `error: ${p.error}`) : p.skeleton).slice(0, 90)}`);
  console.log(`\n${paragraph}${out ? `\n→ ${out}` : ''}${md ? `${out ? ' + ' : '\n→ '}${resolve(md)}` : ''}`);
}
