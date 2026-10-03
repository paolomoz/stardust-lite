// lib/stitch.mjs — the scroll-and-stitch full-page capture IN PROCESS, for a page the caller already opened and settled (measure-page's
// per-width session, gate's live and build pages) — the same capture stitch-shot writes (full document width × the height measured AFTER
// the settle, one chunk per viewport height, motion frozen after the settle, one PNG), so pixel-compare and the gate read it unchanged;
// what changes is the clock: no second browser per side, no fixed 450 ms per chunk — each chunk waits for READINESS (fonts ready, every
// in-viewport image complete or errored, no finite running animation, two consecutive frames with the same scrollHeight), bounded by a
// per-chunk timeout that is the only fixed wait left (sdt-dentsu speed: a reuse-only page spent 16–20 min wall, the model idle most of it).
// stitch-shot's pitfalls kept, in order (read its header): lazy images per chunk; the freeze AFTER the settle (injecting it before breaks
// some lazy loaders' swap logic); <video> paused at t=0 and every pending timer cleared (CSS cannot stop either, the same page never
// pixel-matched itself); the first slick dot clicked so both sides capture slide 1; a timed modal swept once more after the settle; the
// mouse parked bottom-left (a dismissal click leaves the cursor over a :hover target); fonts with status `error` reported loudly (a
// capture in fallback type is a silent false measurement); the height read after the settle (entrance transforms inflate it before);
// a scroll that does not advance (an inner scroller, html/body overflow hidden) fails loud — zero-filled black rows are a fictitious diff.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { PNG } from 'pngjs';
import { openPage, settle, acceptOverlays } from '../common.mjs';

/** Freeze motion for stable chunks — AFTER the settle: CSS animations paused, transitions off, carets hidden, smooth scroll off; every
 * <video> paused at t=0; every pending timeout / interval cleared; the first slick dot clicked (then the timers cleared again). */
export async function freezeMotion(page) {
  await page.addStyleTag({ content: '*,*::before,*::after{animation-play-state:paused!important;transition:none!important;caret-color:transparent!important;scroll-behavior:auto!important;}html{scroll-behavior:auto!important}' }).catch(() => {});
  await page.evaluate(async () => {
    const vids = [...document.querySelectorAll('video')];
    await Promise.all(vids.map((v) => new Promise((res) => { try { v.pause(); v.removeAttribute('autoplay'); if (v.readyState >= 1) v.currentTime = 0; if (v.seeking) { v.addEventListener('seeked', () => res(), { once: true }); setTimeout(res, 1500); } else setTimeout(res, 200); } catch { res(); } })));
    const clear = () => { let id = window.setTimeout(() => {}, 0); while (id-- > 0) { window.clearTimeout(id); window.clearInterval(id); } };
    clear();
    const dot = document.querySelector('.slick-dots li:first-child button'); if (dot) { dot.click(); clear(); }
    window.scrollTo(0, 0);
  }).catch(() => {});
}

/** Declared font faces whose load failed (status `error`): the capture renders fallback type. Returns the family names. */
export const failedFonts = (page) => page.evaluate(async () => { await document.fonts.ready; const loaded = new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family)); return [...new Set([...document.fonts].filter((f) => f.status === 'error' && !loaded.has(f.family)).map((f) => f.family))]; }).catch(() => []); // a family with a loaded face is not a failure (a variable TTF 404s beside its static duplicate — natixis)

/** Browser side: wait until the viewport is ready to be photographed — fonts ready, every in-viewport image complete (or errored: a
 * broken image is a state), no finite animation still running, two consecutive animation frames with the same scrollHeight — or the
 * bound elapses. Returns what it waited for. */
const readyInViewport = async (bound) => {
  const t0 = Date.now(); const left = () => bound - (Date.now() - t0); const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const raf = () => new Promise((r) => requestAnimationFrame(() => r(document.documentElement.scrollHeight)));
  await Promise.race([document.fonts.ready, sleep(Math.max(0, left()))]);
  const pendingImgs = () => [...document.images].filter((i) => { const r = i.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 10 && !i.complete; });
  const finite = (a) => { try { const t = a.effect.getComputedTiming(); return Number.isFinite(t.iterations) && Number.isFinite(t.endTime) && t.endTime < 10000; } catch { return false; } };
  const runningFinite = () => document.getAnimations().filter((a) => a.playState === 'running' && finite(a));
  let imgs = 0; let anims = 0; let frames = 0;
  while (left() > 0) {
    const p = pendingImgs(); const a = runningFinite(); imgs = p.length; anims = a.length;
    if (!p.length && !a.length) { const h1 = await raf(); const h2 = await raf(); frames += 2; if (h1 === h2) return { ms: Date.now() - t0, imgs, anims, frames, timedOut: false }; continue; }
    await Promise.race([Promise.all([...p.map((i) => new Promise((r) => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); })), ...a.map((x) => x.finished.catch(() => {}))]), sleep(Math.min(150, Math.max(0, left())))]);
  }
  return { ms: Date.now() - t0, imgs, anims, frames, timedOut: true };
};

/** Stitch an already-open, already-settled page into `outFile`: the document's width × its height now (read AFTER the settle), one
 * chunk per `vh` rows. `freeze` (default true) runs freezeMotion first; `chunkTimeout` bounds the readiness wait per chunk (ms).
 * Returns { width, height, chunks, waited: [ms…], timedOut: n, failedFonts }. Throws on a scroll stall. */
export async function stitchCapture(page, outFile, { vh = 900, freeze = true, chunkTimeout = 3000, park = true } = {}) {
  if (freeze) await freezeMotion(page);
  if (park) { const vp = page.viewportSize(); await page.mouse.move(0, (vp ? vp.height : vh) - 1).catch(() => {}); }
  const fonts = await failedFonts(page);
  if (fonts.length) console.error(`stitch WARNING: FONT LOAD FAILED for ${fonts.join(', ')} — this capture renders fallback type (verify the face in a real browser: instrument-induced → fix the capture; broken on the live site → capture-state)`);
  const totalH = await page.evaluate(() => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
  if (!totalH || totalH < 10) throw new Error(`page height ${totalH}px — blank render? (bot challenge / hidden body)`);
  const width = (page.viewportSize() || { width: 1440 }).width;
  const chunks = []; const waited = []; let timedOut = 0; let prevActualY = null;
  for (let y = 0; y < totalH; y += vh) {
    const target = Math.max(0, Math.min(y, totalH - vh));
    await page.evaluate((ty) => window.scrollTo(0, ty), target);
    const r = await page.evaluate(readyInViewport, chunkTimeout).catch(() => ({ ms: 0, timedOut: true }));
    waited.push(r.ms); if (r.timedOut) timedOut += 1;
    const actualY = await page.evaluate(() => window.scrollY);
    // scroll-stall guard (stitch-shot): the window does not advance while the document reports more height — an inner scroller; fail loud
    if (prevActualY !== null && actualY <= prevActualY && target - actualY > 4) throw new Error(`scroll stall at chunk target ${target}px: window.scrollY stuck at ${actualY}px while the document reports ${totalH}px — an inner scroll container / scroll-jacked layout; the stitched capture cannot measure this page class`);
    prevActualY = actualY;
    chunks.push({ y: actualY, buf: await page.screenshot() });
  }
  const outPng = new PNG({ width, height: totalH });
  for (const { y: cy, buf } of chunks) {
    const img = PNG.sync.read(buf);
    for (let row = 0; row < img.height; row += 1) { const destY = cy + row; if (destY >= totalH) break; img.data.copy(outPng.data, destY * width * 4, row * img.width * 4, (row * img.width + Math.min(img.width, width)) * 4); }
  }
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, PNG.sync.write(outPng));
  return { width, height: totalH, chunks: chunks.length, waited, timedOut, failedFonts: fonts };
}

/** Open `url` on `browser` (a Browser or a BrowserContext — openPage's rule) at `width` × `vh`, settle it (common's slow scroll, fonts,
 * images, finite animations), sweep the overlays once more (a timed modal fires during the settle), then stitch to `outFile`. Returns
 * { page, ...stitch }: the page stays OPEN (frozen, at rest, scrolled to 0) so the caller reads its tables from the same load; the caller
 * closes it. `overlays` are openPage's consent / dismiss / locale / require. */
export async function captureUrl(browser, url, outFile, { width = 1440, vh = 900, wait = 2500, consent = null, dismiss = [], locale = null, require = [], chunkTimeout = 3000, log = null } = {}) {
  const t0 = Date.now();
  const page = await openPage(browser, url, { width, height: vh, consent, dismiss, locale, require, wait });
  await settle(page);
  if (consent || dismiss.length) await acceptOverlays(page, { consent, dismiss, wait: 800 });
  const r = await stitchCapture(page, outFile, { vh, chunkTimeout });
  if (log) log(`stitched ${outFile}: ${r.width}x${r.height} from ${r.chunks} chunks in ${((Date.now() - t0) / 1000).toFixed(1)} s${r.timedOut ? ` (${r.timedOut} chunk waits hit the ${chunkTimeout} ms bound)` : ''}`);
  return { page, seconds: (Date.now() - t0) / 1000, ...r };
}
