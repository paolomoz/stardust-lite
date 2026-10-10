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
  // no blanket `animation-play-state: paused`: an entrance that starts when a chunk scrolls into view was frozen at its first frame (si-home:
  // half the 360 cards captured faded) — restMotion() runs every finite animation to its end and pauses the infinite ones, per chunk
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;caret-color:transparent!important;scroll-behavior:auto!important;}html{scroll-behavior:auto!important}' }).catch(() => {});
  await page.evaluate(async () => {
    const vids = [...document.querySelectorAll('video')];
    await Promise.all(vids.map((v) => new Promise((res) => { try { v.pause(); v.removeAttribute('autoplay'); if (v.readyState >= 1) v.currentTime = 0; if (v.seeking) { v.addEventListener('seeked', () => res(), { once: true }); setTimeout(res, 1500); } else setTimeout(res, 200); } catch { res(); } })));
    const clear = () => { let id = window.setTimeout(() => {}, 0); while (id-- > 0) { window.clearTimeout(id); window.clearInterval(id); } };
    clear();
    const dot = document.querySelector('.slick-dots li:first-child button'); if (dot) { dot.click(); clear(); }
    window.scrollTo(0, 0);
  }).catch(() => {});
}

/** Browser side, before every chunk: the page AT REST — every finite animation (an entrance, a reveal) finished at its end state, every
 * infinite one (a marquee, a spinner) paused where it is. Returns the counts. */
const restMotion = () => { let finished = 0; let paused = 0; for (const a of document.getAnimations({ subtree: true })) { try { const t = a.effect.getComputedTiming(); if (Number.isFinite(t.iterations) && Number.isFinite(t.endTime) && t.endTime < 60000) { if (a.playState !== 'finished') { a.finish(); finished += 1; } } else if (a.playState === 'running') { a.pause(); paused += 1; } } catch { /* a detached effect */ } } return { finished, paused }; };

/** Browser side, before every chunk: wait until the in-viewport elements a SCRIPT animates (inline style: GSAP / ScrollTrigger, anime,
 * Motion — tweens that are not Web Animations, so restMotion cannot finish them) hold the same opacity and transform for two reads 100 ms
 * apart, bounded (si-home: GSAP card entrances started as each chunk scrolled in and were captured mid-tween, half the 360 page faded). */
const quietInViewport = async (bound) => {
  const t0 = Date.now(); const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const sig = () => { let out = ''; let n = 0; for (const e of document.querySelectorAll('[style]')) { const r = e.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight || r.width < 2) continue; const cs = getComputedStyle(e); out += `${cs.opacity}|${cs.transform}|${cs.visibility};`; n += 1; } return [out, n]; };
  let [prev, n] = sig(); let steady = 0;
  while (Date.now() - t0 < bound) { await sleep(100); const [now] = sig(); if (now === prev) { steady += 1; if (steady >= 2) return { ms: Date.now() - t0, n, quiet: true }; } else steady = 0; prev = now; }
  return { ms: Date.now() - t0, n, quiet: false };
};

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
  let imgs = 0; let anims = 0; let frames = 0; let retried = 0;
  // a broken in-viewport image (complete, naturalWidth 0) is retried twice before it counts as a state: a burst of rendition requests to a
  // preview host failed some of them (exp/five-min: three widths at once, half the build's pictures as alt text), and a live load can lose
  // one image the next load has (si-home: the "American Music" picture)
  const retryBroken = () => { for (const i of document.images) { const r = i.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight || r.width < 10 || !i.complete || i.naturalWidth > 0 || !(i.currentSrc || i.src)) continue; const n = Number(i.dataset.sdRetry || 0); if (n >= 2) continue; i.dataset.sdRetry = String(n + 1); retried += 1; const pic = i.closest('picture'); if (pic) pic.querySelectorAll('source').forEach((so) => { const v = so.srcset; so.srcset = ''; so.srcset = v; }); if (i.srcset) { const v = i.srcset; i.srcset = ''; i.srcset = v; } const src = i.getAttribute('src'); if (src) { i.removeAttribute('src'); i.setAttribute('src', src); } } };
  while (left() > 0) {
    retryBroken();
    const p = pendingImgs(); const a = runningFinite(); imgs = p.length; anims = a.length;
    if (!p.length) { const h1 = await raf(); const h2 = await raf(); frames += 2; if (h1 === h2) { if (retried && [...document.images].some((i) => i.complete && i.naturalWidth === 0 && Number(i.dataset.sdRetry || 0) < 2 && i.getBoundingClientRect().bottom > 0 && i.getBoundingClientRect().top < innerHeight)) continue; return { ms: Date.now() - t0, imgs, anims, frames, retried, timedOut: false }; } continue; }
    await Promise.race([Promise.all(p.map((i) => new Promise((r) => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); }))), sleep(Math.min(150, Math.max(0, left())))]);
  }
  return { ms: Date.now() - t0, imgs, anims, frames, retried, timedOut: true };
};

/** The whole page in ONE screenshot, no scrolling (five-minute loop, iteration 2): a chunked capture scrolls, and a page that changes its layout
 * on scroll (a header that leaves the flow when its search bar pins — marriott, 53–112 px per chunk; a sticky header copied into every chunk —
 * takeda; acs's seam band) photographed a page that never exists at once. The at-rest steps run once over the page (scripted motion waited
 * out, entrances finished, broken images retried), then the shot is cropped to the viewport width (a sideways overflow made si's 360 shot
 * 820 wide). ≈ 1 s against ≈ 13 s stitched. Returns null when the window does not scroll the document (an inner scroller): the caller stitches. */
async function fullCapture(page, outFile, { vh = 900, freeze = true, park = true } = {}) {
  const width = (page.viewportSize() || { width: 1440 }).width;
  const scrolls = await page.evaluate(() => { const h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight); if (h <= innerHeight + 4) return true; window.scrollTo({ top: 200, behavior: 'instant' }); const ok = window.scrollY > 0; window.scrollTo({ top: 0, behavior: 'instant' }); return ok; }).catch(() => true);
  if (!scrolls) return null;
  if (freeze) await freezeMotion(page);
  if (park) await page.mouse.move(0, vh - 1).catch(() => {});
  const fonts = await failedFonts(page);
  if (fonts.length) console.error(`capture WARNING: FONT LOAD FAILED for ${fonts.join(', ')} — this capture renders fallback type`);
  const rested = { finished: 0, paused: 0, restless: 0, waitedMs: 0, retried: 0, broken: 0 };
  if (freeze) {
    // the whole page is "in view" for a full shot: scripted motion and broken images are read over the document, not the viewport
    const t0 = Date.now(); let prev = null; let steady = 0;
    while (Date.now() - t0 < 2500) { const sig = await page.evaluate(() => [...document.querySelectorAll('[style]')].map((e) => { const cs = getComputedStyle(e); return `${cs.opacity}|${cs.transform}`; }).join(';')).catch(() => ''); if (sig === prev) { steady += 1; if (steady >= 2) break; } else steady = 0; prev = sig; await page.waitForTimeout(100); }
    rested.waitedMs = Date.now() - t0;
    const m = await page.evaluate(restMotion).catch(() => null); if (m) { rested.finished = m.finished; rested.paused = m.paused; }
    rested.retried = await page.evaluate(async () => { let n = 0; const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && (i.currentSrc || i.src) && i.getBoundingClientRect().width > 10); for (const i of broken) { n += 1; const pic = i.closest('picture'); if (pic) pic.querySelectorAll('source').forEach((so) => { const v = so.srcset; so.srcset = ''; so.srcset = v; }); if (i.srcset) { const v = i.srcset; i.srcset = ''; i.srcset = v; } const src = i.getAttribute('src'); if (src) { i.removeAttribute('src'); i.setAttribute('src', src); } } await Promise.race([Promise.all(broken.map((i) => new Promise((r) => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); }))), new Promise((r) => setTimeout(r, 3000))]); return n; }).catch(() => 0);
    await page.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)))).catch(() => {});
  }
  rested.broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getBoundingClientRect().width > 10).length).catch(() => 0);
  const totalH = await page.evaluate(() => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
  if (!totalH || totalH < 10) throw new Error(`page height ${totalH}px — blank render? (bot challenge / hidden body)`);
  // Chrome's own capture beyond the viewport, at scroll 0, clipped to the viewport width — Playwright's fullPage tiles by the viewport height
  // and scrolls between tiles (marriott's pinned search bar in every tile, as stitched); this one renders the document once
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })).catch(() => {}); await page.waitForTimeout(150);
  let cdp = null; try { cdp = await page.context().newCDPSession(page); } catch { return null; } // not Chromium: stitch
  let shot; try { shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: totalH, scale: 1 } }); } catch (e) { await cdp.detach().catch(() => {}); console.error(`capture: one shot failed (${String(e.message || e).slice(0, 100)}) — stitching`); return null; }
  await cdp.detach().catch(() => {});
  const buf = Buffer.from(shot.data, 'base64'); const img = PNG.sync.read(buf); const h = img.height;
  if (img.width !== width || Math.abs(h - totalH) > 2) { console.error(`capture: one shot ${img.width}×${h} for ${width}×${totalH} — stitching`); return null; }
  mkdirSync(dirname(outFile), { recursive: true }); writeFileSync(outFile, buf);
  return { width, height: h, chunks: 1, waited: [rested.waitedMs], timedOut: 0, failedFonts: fonts, rested, mode: 'full' };
}

/** Stitch an already-open, already-settled page into `outFile`: the document's width × its height now (read AFTER the settle), one
 * chunk per `vh` rows. `freeze` (default true) runs freezeMotion first; `chunkTimeout` bounds the readiness wait per chunk (ms).
 * Returns { width, height, chunks, waited: [ms…], timedOut: n, failedFonts }. Throws on a scroll stall. */
export async function stitchCapture(page, outFile, { vh = 900, freeze = true, chunkTimeout = 3000, park = true } = {}) {
  if ((process.env.STARDUST_CAPTURE || 'full') === 'full') { const r = await fullCapture(page, outFile, { vh, freeze, park }); if (r) return r; } // null: an inner scroller — the stitched path fails loud
  if (freeze) await freezeMotion(page);
  if (park) { const vp = page.viewportSize(); await page.mouse.move(0, (vp ? vp.height : vh) - 1).catch(() => {}); }
  const fonts = await failedFonts(page);
  if (fonts.length) console.error(`stitch WARNING: FONT LOAD FAILED for ${fonts.join(', ')} — this capture renders fallback type (verify the face in a real browser: instrument-induced → fix the capture; broken on the live site → capture-state)`);
  const totalH = await page.evaluate(() => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
  if (!totalH || totalH < 10) throw new Error(`page height ${totalH}px — blank render? (bot challenge / hidden body)`);
  const width = (page.viewportSize() || { width: 1440 }).width;
  const chunks = []; const waited = []; let timedOut = 0; let prevActualY = null; const rested = { finished: 0, paused: 0, restless: 0, waitedMs: 0 };
  for (let y = 0; y < totalH; y += vh) {
    const target = Math.max(0, Math.min(y, totalH - vh));
    await page.evaluate((ty) => window.scrollTo(0, ty), target);
    const r = await page.evaluate(readyInViewport, chunkTimeout).catch(() => ({ ms: 0, timedOut: true }));
    if (freeze) { const q = await page.evaluate(quietInViewport, Math.min(1500, chunkTimeout)).catch(() => null); if (q && !q.quiet) rested.restless += 1; if (q && q.ms > 250) rested.waitedMs += q.ms; const m = await page.evaluate(restMotion).catch(() => null); if (m) { rested.finished += m.finished; rested.paused += m.paused; } await page.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)))).catch(() => {}); }
    waited.push(r.ms); if (r.timedOut) timedOut += 1; rested.retried = (rested.retried || 0) + (r.retried || 0);
    const actualY = await page.evaluate(() => window.scrollY);
    // scroll-stall guard (stitch-shot): the window does not advance while the document reports more height — an inner scroller; fail loud
    if (prevActualY !== null && actualY <= prevActualY && target - actualY > 4) throw new Error(`scroll stall at chunk target ${target}px: window.scrollY stuck at ${actualY}px while the document reports ${totalH}px — an inner scroll container / scroll-jacked layout; the stitched capture cannot measure this page class`);
    prevActualY = actualY;
    chunks.push({ y: actualY, buf: await page.screenshot() });
  }
  rested.broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getBoundingClientRect().width > 10).length).catch(() => 0);
  const outPng = new PNG({ width, height: totalH });
  for (const { y: cy, buf } of chunks) {
    const img = PNG.sync.read(buf);
    for (let row = 0; row < img.height; row += 1) { const destY = cy + row; if (destY >= totalH) break; img.data.copy(outPng.data, destY * width * 4, row * img.width * 4, (row * img.width + Math.min(img.width, width)) * 4); }
  }
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, PNG.sync.write(outPng));
  return { width, height: totalH, chunks: chunks.length, waited, timedOut, failedFonts: fonts, rested };
}

/** Open `url` on `browser` (a Browser or a BrowserContext — openPage's rule) at `width` × `vh`, settle it (common's slow scroll, fonts,
 * images, finite animations), sweep the overlays once more (a timed modal fires during the settle), then stitch to `outFile`. Returns
 * { page, ...stitch }: the page stays OPEN (frozen, at rest, scrolled to 0) so the caller reads its tables from the same load; the caller
 * closes it. `overlays` are openPage's consent / dismiss / locale / require. */
export async function captureUrl(browser, url, outFile, { width = 1440, vh = 900, wait = 2500, consent = null, dismiss = [], locale = null, require = [], chunkTimeout = Number(process.env.STARDUST_CHUNK_TIMEOUT || 3000), log = null } = {}) {
  const t0 = Date.now();
  const page = await openPage(browser, url, { width, height: vh, consent, dismiss, locale, require, wait });
  await settle(page);
  if (consent || dismiss.length) await acceptOverlays(page, { consent, dismiss, wait: 800 });
  const r = await stitchCapture(page, outFile, { vh, chunkTimeout });
  if (log) log(`${r.mode === 'full' ? 'captured (one shot)' : 'stitched'} ${outFile}: ${r.width}x${r.height} from ${r.chunks} chunks in ${((Date.now() - t0) / 1000).toFixed(1)} s${r.timedOut ? ` (${r.timedOut} chunk waits hit the ${chunkTimeout} ms bound)` : ''}${r.rested?.finished ? ` · ${r.rested.finished} entrance(s) run to rest` : ''}${r.rested?.retried ? ` · ${r.rested.retried} broken image load(s) retried` : ''}${r.rested?.broken ? ` · ${r.rested.broken} image(s) still BROKEN` : ''}${r.rested?.waitedMs ? ` · ${(r.rested.waitedMs / 1000).toFixed(1)} s waiting for scripted motion to settle${r.rested.restless ? ` (${r.rested.restless} chunk(s) never quiet)` : ''}` : ''}`);
  return { page, seconds: (Date.now() - t0) / 1000, ...r };
}
