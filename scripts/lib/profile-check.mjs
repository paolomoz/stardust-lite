// lib/profile-check.mjs — the per-width checks `site-profile check` runs against the live origin (status 200, the consent and dismiss
// controls still resolve — absent now = WARN —, the require markers present, header and footer heights within a tolerance of the
// profile's `heightsByWidth`, the fixed-layer state at the top unchanged), as functions over an open page, so `measure-page` runs them
// from its own per-width sessions (one load less per page run — sdt-dentsu speed) and `site-profile check` keeps running standalone.
// Rows are [W, check, expected, actual, verdict]; `verdictOf(rows)` folds them to PASS | WARN | FAIL.

const count = (page, sel) => page.evaluate((s) => { try { return document.querySelectorAll(s).length; } catch { return -1; } }, sel);

/** Browser side: the chrome boxes and whether a fixed/sticky layer ≥ 90 % of the width sits at the top (the overlay controls excluded). */
export function readChrome({ header, footer, W, skip }) {
  const box = (sel) => { const e = sel && document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { h: Math.round(r.height), top: Math.round(r.top) }; };
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const skipEls = new Set(skip.flatMap((s) => { try { return [...document.querySelectorAll(s)]; } catch { return []; } }));
  const fixedTop = [...document.querySelectorAll('body *')].some((el) => { const cs = getComputedStyle(el); if (!(cs.position === 'fixed' || cs.position === 'sticky') || !vis(el)) return false; if ([...skipEls].some((s) => s === el || s.contains(el) || el.contains(s))) return false; const r = el.getBoundingClientRect(); return Math.round(r.top) === 0 && r.width >= W * 0.9; });
  return { header: box(header), footer: box(footer), fixedTop };
}

/** The status row. */
export const statusRow = (W, status) => [W, 'status', 200, status ?? '?', status === 200 ? 'PASS' : 'FAIL'];

/** BEFORE the overlays are clicked: do the profile's consent and dismiss controls still resolve? (absent = WARN: the site may have
 * dropped the banner; an invalid selector reads `invalid selector`). */
export async function overlayRows(page, profile, W) {
  const o = profile?.overlays || {}; const rows = [];
  for (const [kind, sel] of [['consent', o.consent], ...(o.dismiss || []).map((d) => ['dismiss', d])]) { if (!sel) continue; const n = await count(page, sel); rows.push([W, `${kind} ${sel}`, 'resolves', n < 0 ? 'invalid selector' : n ? `${n} match${n > 1 ? 'es' : ''}` : 'absent now', n > 0 ? 'PASS' : 'WARN']); }
  return rows;
}

/** AFTER the overlays are clicked and the page is settled at scroll 0: the require markers, the chrome heights against the profile's
 * `heightsByWidth` (within `tol` px), the fixed layer at the top against `chrome.header.fixed`. */
export async function chromeRows(page, profile, W, { tol = 2 } = {}) {
  const o = profile?.overlays || {}; const H = profile?.chrome?.header || {}; const F = profile?.chrome?.footer || {}; const rows = [];
  for (const sel of o.require || []) { const n = await count(page, sel); rows.push([W, `require ${sel}`, 'present', n > 0 ? 'present' : 'MISSING', n > 0 ? 'PASS' : 'FAIL']); }
  const m = await page.evaluate(readChrome, { header: H.selector || null, footer: F.selector || null, W, skip: [o.consent, ...(o.dismiss || [])].filter(Boolean) });
  const exp = (x) => x?.[W] ?? x?.[String(W)];
  if (exp(H.heightsByWidth) !== undefined) rows.push([W, `header height ${H.selector}`, exp(H.heightsByWidth), m.header ? m.header.h : 'no element', m.header && Math.abs(m.header.h - exp(H.heightsByWidth)) <= tol ? 'PASS' : 'FAIL']);
  if (exp(F.heightsByWidth) !== undefined) rows.push([W, `footer height ${F.selector}`, exp(F.heightsByWidth), m.footer ? m.footer.h : 'no element', m.footer && Math.abs(m.footer.h - exp(F.heightsByWidth)) <= tol ? 'PASS' : 'FAIL']);
  if (exp(H.fixed) !== undefined) rows.push([W, 'fixed layer at the top', exp(H.fixed), m.fixedTop, m.fixedTop === exp(H.fixed) ? 'PASS' : 'FAIL']);
  return rows;
}

/** PASS | WARN | FAIL over the rows, with the counts and the failing / warning checks named. */
export function verdictOf(rows) {
  const fails = rows.filter((r) => r[4] === 'FAIL'); const warns = rows.filter((r) => r[4] === 'WARN');
  const verdict = fails.length ? 'FAIL' : warns.length ? 'WARN' : 'PASS';
  const name = (r) => `${r[0]} ${r[1]} (profile ${r[2]}, live ${r[3]})`;
  const detail = [...fails.map((r) => `✗ ${name(r)}`), ...warns.map((r) => `△ ${name(r)}`)].join('; ');
  return { verdict, checks: rows.length, fails: fails.length, warns: warns.length, line: `${verdict} — ${rows.length} checks, ${fails.length} failed, ${warns.length} warnings${detail ? `: ${detail}` : ''}` };
}
