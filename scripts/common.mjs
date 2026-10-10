// common.mjs — shared helpers: real-Chrome UA, consent (waits out a reload-on-consent) + overlay dismissal, locale, device scale,
// lazyload settle (fonts included), composed-tree (shadow DOM) queries, stardust plugin script paths, the site profile
// (`migration/site.json`, written by `site-profile init`) as the default for every overlay flag.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

/** The browser every instrument opens. Chrome tier (`--chrome`, or STARDUST_CHROME=1 in the env, or the profile's `overlays.chrome`): the
 * installed Google Chrome, headless — an origin that resets headless Chromium's HTTP/2 (`net::ERR_HTTP2_PROTOCOL_ERROR`) accepts it
 * (cibc-careers, loop r2; BACKLOG #1). `--headed`: real Chrome with a window (the bot-managed tier). The tier is exported to the env so the
 * children an instrument spawns (gate → cap-probe, motion-observe; harness → serve) inherit it, the vendored tools through lib/chrome-tier.mjs. */
export async function launch(opts = {}) {
  const { chromium } = await import('playwright');
  const headed = process.argv.includes('--headed'); const chrome = headed || process.argv.includes('--chrome') || process.env.STARDUST_CHROME === '1' || !!siteDefaults()?.overlays?.chrome;
  if (chrome) process.env.STARDUST_CHROME = '1';
  const cookie = overlayOpts().cookie; // sets STARDUST_COOKIE
  if ((chrome || cookie) && !(process.env.NODE_OPTIONS || '').includes('chrome-tier')) process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} --import ${new URL('./lib/chrome-tier.mjs', import.meta.url).pathname}`.trim(); // the vendored tools: channel and cookies
  return chromium.launch({ ...(chrome ? { channel: 'chrome' } : {}), ...(headed ? { headless: false, args: ['--disable-blink-features=AutomationControlled'] } : {}), ...opts });
}
export function arg(name, def) {
  const i = process.argv.indexOf(name);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return v === undefined || v.startsWith('--') ? true : v;
}

/** The site profile: `--site <file>`, or `migration/site.json` under the cwd when it exists (`--no-site` ignores it). Loaded once per
 * process; one stderr line names the file in use. Every flag an instrument takes still wins over the profile (site-profile.mjs documents
 * the JSON shape; `siteProfile()` is the read for the other instruments — cap main selector, chrome heights, DA coordinates, branch host). */
let SITE; // undefined = not looked up yet; null = none
export function siteDefaults() {
  if (SITE !== undefined) return SITE;
  SITE = null;
  if (process.argv.includes('--no-site')) return SITE;
  const flag = arg('--site', null); const def = join(process.cwd(), 'migration', 'site.json');
  const file = typeof flag === 'string' ? resolve(flag) : (existsSync(def) ? def : null);
  if (!file) return SITE;
  try { SITE = JSON.parse(readFileSync(file, 'utf8')); SITE._file = file; console.error(`site: ${file}`); } catch (e) { console.error(`site: ${file} unreadable (${e.message}) — running without a profile`); }
  return SITE;
}
export const siteProfile = () => siteDefaults();

/** `--consent`, `--dismiss`, `--locale` and `--require` read from argv the way every instrument reads them (a geo-mismatch modal or a
 * marketing interstitial is not consent: every overlay control must reach every tool — BACKLOG #2; a geo-redirecting origin needs the
 * locale pinned; a page with session-variable composition — an A/B alert, a personalised slot — needs every measurement run gated to
 * the composition the origin was captured in: `--require <css,…>` exits 4 when one of the markers is absent — walgreens-home).
 * A flag that is not on the command line falls back to the site profile's `overlays` (explicit flags win). */
const list = (v) => String(v ?? '').split(',').map((s) => s.trim()).filter(Boolean);
export const overlayOpts = () => {
  const o = siteDefaults()?.overlays || {};
  const pick = (name, key) => { const v = arg(name, null); return v === null ? (o[key] ?? null) : v; };
  const cookie = pick('--cookie', 'cookie') ?? process.env.STARDUST_COOKIE ?? null; if (cookie) process.env.STARDUST_COOKIE = String(cookie); // the children (gate → cap-probe …) read the env; the preload adds them to the vendored tools' contexts
  const hide = list(pick('--hide', 'hide')); if (hide.length) process.env.STARDUST_HIDE = hide.join(','); else if (process.env.STARDUST_HIDE) hide.push(...process.env.STARDUST_HIDE.split(',')); // the children inherit it
  return { consent: pick('--consent', 'consent'), dismiss: list(pick('--dismiss', 'dismiss')), locale: pick('--locale', 'locale'), require: list(pick('--require', 'require')), cookie: cookie ? String(cookie) : null, hide, chrome: !!o.chrome };
};
/** `--cookie 'name=value; name2=value2'` (or the profile's `overlays.cookie`, or STARDUST_COOKIE) as Playwright cookies for the page's host —
 * an attestation gate (HarbourVest: `HV.attestation`, `HV.country`, `HV.language`) forwarded every cookieless session to a persona page and
 * loaded the chrome by AJAX after the check; a 35-line case preload did this (loop r5). */
export const cookiesFor = (url, cookie) => { if (!cookie) return []; let host; try { host = new URL(url).hostname; } catch { return []; } return String(cookie).split(/;\s*/).map((kv) => kv.trim()).filter(Boolean).map((kv) => { const i = kv.indexOf('='); return { name: kv.slice(0, i).trim(), value: kv.slice(i + 1).trim(), domain: host.replace(/^www\./, '.'), path: '/' }; }).filter((c) => c.name); };
/** The same options as argv for a vendored capture tool's live side (`stitch-shot`, `cap-probe`, `motion-observe`). */
export const overlayArgs = () => { const o = overlayOpts(); return [...(o.consent ? ['--consent', o.consent] : []), ...(o.dismiss.length ? ['--dismiss', o.dismiss.join(',')] : []), ...(o.locale ? ['--locale', o.locale] : [])]; };

/** Click the dismiss controls, then the first consent control that resolves; a consent accept may RELOAD the page (OneTrust "reload on
 * consent" — stryker-home): every instrument then ran `settle` in a destroyed context. Arm the navigation wait before the click; when it
 * fires, wait the page in again and re-dismiss the other overlays. Returns the control that was clicked (null when none resolved). */
const OVERLAY_CENSUS = '[id*=onetrust],[class*=onetrust],[id*=consent],[class*=consent],[id*=cookie],[class*=cookie],[class*=truste],[id*=truste],[id*=privacy],[class*=privacy],[role=dialog],[aria-modal=true],[id*=survey],[class*=survey],[id*=feedback],[class*=feedback],[class*=modal],[id*=modal]';
const overlayCensus = (page) => page.evaluate((q) => [...document.querySelectorAll(q)].filter((el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 40 && r.height > 40 && cs.visibility !== 'hidden' && cs.display !== 'none' && (cs.position === 'fixed' || cs.position === 'absolute'); }).map((el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${[...el.classList].slice(0, 2).map((c) => '.' + c).join('')} [${Math.round(el.getBoundingClientRect().left)},${Math.round(el.getBoundingClientRect().top)},${Math.round(el.getBoundingClientRect().width)},${Math.round(el.getBoundingClientRect().height)}]`), OVERLAY_CENSUS).catch(() => []);
export async function acceptOverlays(page, { consent = null, dismiss = [], wait = 2500 } = {}) {
  const dismissAll = async () => { for (const sel of dismiss) { try { await page.click(sel, { timeout: 1500 }); } catch { /* absent */ } } };
  const before = (consent || dismiss.length) ? await overlayCensus(page) : [];
  const after = async () => { if (!(consent || dismiss.length)) return; await page.waitForTimeout(400); const now = await overlayCensus(page); const fresh = now.filter((s) => !before.includes(s)); if (fresh.length) console.error(`openPage: NEW overlay after the overlay controls — ${fresh.slice(0, 3).join(' ; ')} — a --dismiss control that opens something (a feedback opener)? pass its close control instead; it sits in every capture otherwise`); };
  await dismissAll();
  const candidates = [consent, '#onetrust-accept-btn-handler', '.agree-button', 'button:has-text("Accept all")', 'button:has-text("Accept All")'].filter(Boolean);
  for (const sel of candidates) {
    try {
      const nav = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 3000 }).catch(() => null);
      await page.click(sel, { timeout: 1200 });
      if (await nav) { console.error(`openPage: consent control ${sel} reloaded the page — waited for it`); await page.waitForTimeout(wait); await dismissAll(); }
      else console.error(`openPage: consent control ${sel} clicked`);
      await after(); return sel;
    } catch { /* next */ }
  }
  await after(); return null;
}

/** `browser` may also be a BrowserContext (no `newContext`): the caller owns UA, locale, scale and cookies — a consent accepted once holds
 * for every page the context opens next (roster's light pass, one context per worker); only the viewport is set per page. */
export const contextOptions = ({ width = 1440, height = 900, scale = 1, locale = null } = {}) => ({ viewport: { width, height }, deviceScaleFactor: scale, userAgent: UA, ...(locale ? { locale, extraHTTPHeaders: { 'Accept-Language': `${locale},${locale.split('-')[0]};q=0.9` } } : {}) });
/** `afterLoad(page)` runs after the first wait and BEFORE the overlays are clicked: the first look probe-load takes (fixed layers,
 * consent candidates) read from the same load every other instrument then measures (measure-page, one session per width). */
export async function openPage(browser, url, { width = 1440, height = 900, scale = 1, consent = null, dismiss = [], locale = null, require = [], wait = 2500, before = null, afterLoad = null } = {}) {
  const isContext = typeof browser.newContext !== 'function';
  const page = isContext ? await browser.newPage() : await browser.newPage(contextOptions({ width, height, scale, locale }));
  if (isContext) await page.setViewportSize({ width, height });
  if (before) await before(page); // listeners that must exist before navigation (response log for font requests — media-list)
  // videos never start: autoplay and play() are held, so a video shows its first frame (or its poster) on every load and at every width — a
  // hero video froze at 2.58 s / 0.62 s / 2.09 s across the three widths and the build matched one still per width (toryburch, ≈ 4 min)
  if (process.env.STARDUST_VIDEO_PLAY !== '1') await page.addInitScript(() => { try { HTMLMediaElement.prototype.play = function play() { try { this.pause(); } catch { /* detached */ } return Promise.resolve(); }; new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) { if (n.nodeType !== 1) continue; for (const v of n.tagName === 'VIDEO' ? [n] : n.querySelectorAll?.('video') || []) { v.autoplay = false; v.removeAttribute('autoplay'); } } }).observe(document, { childList: true, subtree: true }); } catch { /* a locked prototype */ } }).catch(() => {});
  const cookies = cookiesFor(url, overlayOpts().cookie); if (cookies.length) await page.context().addCookies(cookies).catch((e) => console.error(`openPage: cookies not set — ${String(e.message).slice(0, 80)}`));
  try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 }); } catch (e) {
    // a protocol reset / connection refusal on headless Chromium is the origin's bot tier, not the page: name the next tier before dying
    if (/ERR_HTTP2|ERR_CONNECTION_RESET|ERR_SSL|ERR_FAILED/.test(String(e.message)) && process.env.STARDUST_CHROME !== '1') console.error(`openPage: ${String(e.message).split('\n')[0].slice(0, 120)} — the origin refuses headless Chromium; run every instrument with --chrome (installed Google Chrome, headless) or STARDUST_CHROME=1, --headed for a window`);
    throw e;
  }
  await page.waitForTimeout(wait);
  if (afterLoad) await afterLoad(page);
  await acceptOverlays(page, { consent, dismiss, wait });
  await page.waitForFunction(() => [...document.querySelectorAll('.block')].every((el) => el.dataset.blockStatus === 'loaded'), null, { timeout: 15000 }).catch(() => {});
  // fonts are a measurement precondition: the boilerplate loads fonts.css lazily and a table read before the swap measures fallback metrics
  // (sections / pair / deep-probe disagreed by 40–100 px between runs on one page — stryker-home)
  await page.evaluate(() => document.fonts.ready.then(() => document.fonts.status)).catch(() => {});
  // --hide <css,…> (profile `overlays.hide`): a third-party fixed widget (an accessibility launcher, a chat bubble) is not the page — hidden on every
  // live reading and capture, and registered (Userway was the whole 360 residue, 2.6 %, bny-leadership, loop r9)
  const hide = overlayOpts().hide; if (hide.length) await page.addStyleTag({ content: hide.map((s) => `${s} { display: none !important; visibility: hidden !important; }`).join('\n') }).catch(() => {});
  if (page.url().split('#')[0] !== url.split('#')[0]) console.error(`openPage: URL changed ${url} → ${page.url()} (a redirect or a JS forward: an edition, a locale, an attestation page — measure the page you mean)`);
  if (require.length) { // composition gate: the session must be the one the cached origin shows (retry the run otherwise); a marker a fragment
    // loads by AJAX is WAITED for (10 s) before it counts as missing — a one-shot check exited 4 twice on the same fragment race (loop r5)
    await page.waitForFunction((sels) => sels.every((s) => { try { return !!document.querySelector(s); } catch { return false; } }), require, { timeout: 10000 }).catch(() => {});
    const missing = await page.evaluate((sels) => sels.filter((s) => { try { return !document.querySelector(s); } catch { return true; } }), require);
    if (missing.length) { console.error(`composition mismatch — missing: ${missing.join(' | ')} (exit 4; run again until the session matches the origin)`); await browser.close(); process.exit(4); }
  }
  return page;
}

/** A page that scrolls INSIDE an element (html / body fixed at the viewport height, `main#app` the scroller — publicis): every instrument read a
 * 900 px page and the capture photographed one viewport. The scroller and its ancestors are unrolled (height auto, overflow visible, a fixed
 * position made relative) so the document scrolls and every reading sees the whole page — the build is unrolled the same way. Returns the
 * scroller's selector, or null when the window scrolls. */
export async function unrollScroller(page) {
  const sel = await page.evaluate(() => {
    const docH = Math.max(document.body?.scrollHeight || 0, document.documentElement.scrollHeight); if (docH > innerHeight + 4) return null;
    const cands = [...document.querySelectorAll('body *')].filter((e) => { const cs = getComputedStyle(e); return /(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 100 && e.clientHeight > innerHeight * 0.5; }).sort((a, b) => b.scrollHeight - a.scrollHeight);
    const el = cands[0]; if (!el) return null;
    for (let x = el; x && x !== document.documentElement; x = x.parentElement) x.setAttribute('data-sd-unrolled', '');
    const st = document.createElement('style'); st.textContent = 'html, body { height: auto !important; min-height: 0 !important; max-height: none !important; overflow: visible !important; } [data-sd-unrolled] { height: auto !important; max-height: none !important; overflow: visible !important; } [data-sd-unrolled][style*="fixed"], [data-sd-unrolled] { position: relative !important; inset: auto !important; }';
    document.head.append(st);
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${[...el.classList].slice(0, 2).map((c) => `.${c}`).join('')}`;
  }).catch(() => null);
  if (sel && !page.__sdUnrolled) { page.__sdUnrolled = sel; console.error(`settle: the page scrolls inside ${sel} — unrolled (html / body auto, the scroller visible) so the readings and the capture see the whole page`); }
  return sel;
}

/** Popups and modals are not the page: a fixed layer (not the header) covering ≥ 30 % of the viewport — a locale chooser, a newsletter modal,
 * their backdrop — is hidden and a body scroll lock released (toryburch: a locale popup and then a welcome modal measured as sections, two
 * extra `first` runs, ≈ 9 min). Returns the hidden layers' selectors. */
export async function hideModals(page) {
  const hidden = await page.evaluate(() => {
    const vw = innerWidth; const vh = innerHeight; const out = [];
    for (const e of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(e); if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
      const r = e.getBoundingClientRect(); const area = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      if (area < vw * vh * 0.3) continue; if (r.top <= 2 && r.height < 220) continue; // a header bar
      if (e.closest('header') || e.querySelector('main, [role=main]') || e.matches('main, [role=main]') || e.hasAttribute('data-sd-unrolled')) continue; // the page itself
      if (out.some((o) => o.el.contains(e))) continue;
      out.push({ el: e, sel: `${e.tagName.toLowerCase()}${e.id ? `#${e.id}` : ''}${[...e.classList].slice(0, 2).map((c) => `.${c}`).join('')}` });
    }
    // an open dialog (role=dialog, aria-modal, <dialog open>) in a fixed layer is a modal at any size — its backdrop alone matched the 30 % rule
    // and the 15 %-off box stayed in toryburch's capture
    for (const d of document.querySelectorAll('[role=dialog], [aria-modal=true], dialog[open]')) { const r = d.getBoundingClientRect(); if (r.width < 40 || r.height < 40) continue; let fx = false; for (let x = d; x && x !== document.body; x = x.parentElement) if (getComputedStyle(x).position === 'fixed') { fx = true; break; } if (!fx || d.closest('header') || out.some((o) => o.el.contains(d))) continue; out.push({ el: d, sel: `${d.tagName.toLowerCase()}${d.id ? `#${d.id}` : ''}${[...d.classList].slice(0, 2).map((c) => `.${c}`).join('')}` }); }
    // a stylesheet rule as well as the inline style: a React portal re-rendered its node and the inline style was gone at the capture
    const ids = (window.__sdModalIds ||= new Set()); for (const o of out) { o.el.style.setProperty('display', 'none', 'important'); o.el.setAttribute('data-sd-modal', ''); if (o.el.id) ids.add(o.el.id); }
    const st = document.getElementById('sd-hide-modals') || Object.assign(document.createElement('style'), { id: 'sd-hide-modals' }); if (!st.isConnected) document.head.append(st);
    st.textContent = `[data-sd-modal]${[...ids].map((id) => `, #${CSS.escape(id)}`).join('')} { display: none !important; }`;
    if (out.length) for (const x of [document.documentElement, document.body]) if (getComputedStyle(x).overflow === 'hidden' && !x.hasAttribute('data-sd-unrolled')) x.style.setProperty('overflow', 'visible', 'important');
    return out.map((o) => o.sel);
  }).catch(() => []);
  for (const h of hidden) if (!(page.__sdModals ||= new Set()).has(h)) { page.__sdModals.add(h); console.error(`settle: a modal layer ${h} covers the viewport — hidden (a popup is not the page; --hide it in the profile to make it explicit)`); }
  return hidden;
}

export async function settle(page, step = 600, pause = 120, rest = 1500) {
  await unrollScroller(page);
  await page.evaluate(async ({ step, pause, rest }) => {
    for (let y = 0; y < document.body.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, pause)); }
    window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, rest));
    await document.fonts.ready; // the lazy fonts.css has been requested by now: measure after the swap, not before
    // boxes read mid-flight are not a measurement: six parallel sessions read a 360 table 665 px short (pictures still loading) and the
    // live spec read links 6–17 px low (text-reveal transitions still running) — audemarspiguet-home. Wait, bounded, for every image
    // to be complete and every FINITE running animation/transition to finish (an infinite loop — a marquee, a spinner — is a state)
    const timeout = (ms) => new Promise((r) => setTimeout(r, ms));
    await Promise.race([Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); }))), timeout(5000)]);
    const finite = (a) => { try { const t = a.effect.getComputedTiming(); return Number.isFinite(t.iterations) && Number.isFinite(t.endTime) && t.endTime < 10000; } catch { return false; } };
    await Promise.race([Promise.all(document.getAnimations().filter((a) => a.playState === 'running' && finite(a)).map((a) => a.finished.catch(() => {}))), timeout(3000)]);
  }, { step, pause, rest });
  await hideModals(page); // a modal that opened during the settle (a delayed newsletter layer)
}

/** Browser-side composed-tree helpers, to be passed into page.evaluate as source (web-component origins keep their paint, boxes and
 * hover states inside shadow roots; light-DOM `querySelectorAll` reads them as empty — ibm-home). `queryDeep(sel)` accepts ` >> ` to
 * descend into a host's shadow root (`c4d-card-group-item >> div.cds--tile`); `allDeep(root)` walks light and shadow trees. */
export const DEEP_HELPERS = `
  const allDeep = (root) => { const out = []; const walk = (r) => { for (const e of r.querySelectorAll('*')) { out.push(e); if (e.shadowRoot) walk(e.shadowRoot); } }; walk(root); return out; };
  const queryDeep = (sel, root = document) => { const parts = sel.split('>>').map((s) => s.trim()); let roots = [root]; parts.forEach((part, i) => { const next = []; for (const r of roots) for (const e of r.querySelectorAll(part)) next.push(i === parts.length - 1 ? e : (e.shadowRoot || e)); roots = next; }); return roots; };
`;

/** Path of the capture/compare tools (stitch-shot, pixel-compare, cap-probe, motion-*): the vendored copy in ../tools/replica,
 * overridable with STARDUST_SCRIPTS. */
export function stardustScripts() {
  const here = dirname(fileURLToPath(import.meta.url));
  const cands = [process.env.STARDUST_SCRIPTS, join(here, '..', 'tools', 'replica')].filter(Boolean);
  const hit = cands.find((p) => existsSync(join(p, 'stitch-shot.mjs')));
  if (!hit) throw new Error('capture tools not found — expected tools/replica/stitch-shot.mjs (or set STARDUST_SCRIPTS)');
  return hit;
}

/** Path of David's Model lint: the vendored copy in ../tools/lint, overridable with DAVIDS_LINT. */
export function davidsLint() {
  const here = dirname(fileURLToPath(import.meta.url));
  return process.env.DAVIDS_LINT || join(here, '..', 'tools', 'lint', 'davids-model-lint.mjs');
}
