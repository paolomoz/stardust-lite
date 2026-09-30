// common.mjs — shared helpers: real-Chrome UA, consent + overlay dismissal, locale, lazyload settle, composed-tree (shadow DOM)
// queries, stardust plugin script paths.
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

export async function openPage(browser, url, { width = 1440, height = 900, consent = null, dismiss = [], locale = null, require = [], wait = 2500, before = null } = {}) {
  const page = await browser.newPage({ viewport: { width, height }, userAgent: UA, ...(locale ? { locale, extraHTTPHeaders: { 'Accept-Language': `${locale},${locale.split('-')[0]};q=0.9` } } : {}) });
  if (before) await before(page); // listeners that must exist before navigation (response log for font requests — media-list)
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(wait);
  for (const sel of dismiss) { try { await page.click(sel, { timeout: 1500 }); } catch { /* absent */ } }
  const candidates = [consent, '#onetrust-accept-btn-handler', '.agree-button', 'button:has-text("Accept all")', 'button:has-text("Accept All")'].filter(Boolean);
  for (const sel of candidates) { try { await page.click(sel, { timeout: 1200 }); break; } catch { /* next */ } }
  await page.waitForFunction(() => [...document.querySelectorAll('.block')].every((el) => el.dataset.blockStatus === 'loaded'), null, { timeout: 15000 }).catch(() => {});
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
