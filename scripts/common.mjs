// common.mjs — shared helpers: real-Chrome UA, consent click, lazyload settle, box/font readers, stardust plugin script paths.
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

export async function openPage(browser, url, { width = 1440, height = 900, consent = null, wait = 2500 } = {}) {
  const page = await browser.newPage({ viewport: { width, height }, userAgent: UA });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(wait);
  const candidates = [consent, '#onetrust-accept-btn-handler', '.agree-button', 'button:has-text("Accept all")', 'button:has-text("Accept All")'].filter(Boolean);
  for (const sel of candidates) { try { await page.click(sel, { timeout: 1200 }); break; } catch { /* next */ } }
  await page.waitForFunction(() => [...document.querySelectorAll('.block')].every((el) => el.dataset.blockStatus === 'loaded'), null, { timeout: 15000 }).catch(() => {});
  return page;
}

export async function settle(page, step = 600, pause = 120, rest = 1500) {
  await page.evaluate(async ({ step, pause, rest }) => {
    for (let y = 0; y < document.body.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, pause)); }
    window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, rest));
  }, { step, pause, rest });
}

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
