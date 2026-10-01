// common.mjs — shared helpers: real-Chrome UA, consent (waits out a reload-on-consent) + overlay dismissal, locale, device scale,
// lazyload settle (fonts included), composed-tree (shadow DOM) queries, stardust plugin script paths.
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

export function arg(name, def) {
  const i = process.argv.indexOf(name);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return v === undefined || v.startsWith('--') ? true : v;
}

/** `--dismiss`, `--locale` and `--require` read from argv the way every instrument reads them (a geo-mismatch modal or a marketing
 * interstitial is not consent: every overlay control must reach every tool — BACKLOG #2; a geo-redirecting origin needs the locale
 * pinned; a page with session-variable composition — an A/B alert, a personalised slot — needs every measurement run gated to the
 * composition the origin was captured in: `--require <css,…>` exits 4 when one of the markers is absent — walgreens-home). */
export const overlayOpts = () => ({ dismiss: String(arg('--dismiss', '')).split(',').map((s) => s.trim()).filter(Boolean), locale: arg('--locale', null), require: String(arg('--require', '')).split(',').map((s) => s.trim()).filter(Boolean) });

export async function openPage(browser, url, { width = 1440, height = 900, scale = 1, consent = null, dismiss = [], locale = null, require = [], wait = 2500, before = null } = {}) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale, userAgent: UA, ...(locale ? { locale, extraHTTPHeaders: { 'Accept-Language': `${locale},${locale.split('-')[0]};q=0.9` } } : {}) });
  if (before) await before(page); // listeners that must exist before navigation (response log for font requests — media-list)
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(wait);
  const dismissAll = async () => { for (const sel of dismiss) { try { await page.click(sel, { timeout: 1500 }); } catch { /* absent */ } } };
  await dismissAll();
  const candidates = [consent, '#onetrust-accept-btn-handler', '.agree-button', 'button:has-text("Accept all")', 'button:has-text("Accept All")'].filter(Boolean);
  for (const sel of candidates) {
    try {
      // a consent accept may RELOAD the page (OneTrust "reload on consent" — stryker-home): every instrument then ran `settle` in a destroyed
      // context. Arm the navigation wait before the click; when it fires, wait the page in again and re-dismiss the other overlays
      const nav = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 3000 }).catch(() => null);
      await page.click(sel, { timeout: 1200 });
      if (await nav) { console.error(`openPage: consent control ${sel} reloaded the page — waited for it`); await page.waitForTimeout(wait); await dismissAll(); }
      break;
    } catch { /* next */ }
  }
  await page.waitForFunction(() => [...document.querySelectorAll('.block')].every((el) => el.dataset.blockStatus === 'loaded'), null, { timeout: 15000 }).catch(() => {});
  // fonts are a measurement precondition: the boilerplate loads fonts.css lazily and a table read before the swap measures fallback metrics
  // (sections / pair / deep-probe disagreed by 40–100 px between runs on one page — stryker-home)
  await page.evaluate(() => document.fonts.ready.then(() => document.fonts.status)).catch(() => {});
  if (require.length) { // composition gate: the session must be the one the cached origin shows (retry the run otherwise)
    const missing = await page.evaluate((sels) => sels.filter((s) => { try { return !document.querySelector(s); } catch { return true; } }), require);
    if (missing.length) { console.error(`composition mismatch — missing: ${missing.join(' | ')} (exit 4; run again until the session matches the origin)`); await browser.close(); process.exit(4); }
  }
  return page;
}

export async function settle(page, step = 600, pause = 120, rest = 1500) {
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
