#!/usr/bin/env node
// probe-load.mjs — the first look at a live page BEFORE any overlay is dismissed: HTTP status and final URL, title, lang, fixed/sticky
// layers, consent/privacy candidates, shadow-root count and custom tags (a web-components origin needs the composed-tree tier),
// header/footer/main and their children with boxes. Written for travelers-home, reused by ibm-home and walgreens-home.
// W may be a list (`360,1440,2560`): a layer fixed at the base width may scroll at 360 (a 244 px header, fixed at ≥ 900 only, was
// built fixed at 360 too — 20 % of the 360 number for two rounds, usta2-home). Run it at every gated width.
// Usage: node probe-load.mjs <url> [W[,W…]] [--headed] [--chrome] [--locale <tag>] [--shot out.png] [--profile migration/site.json]
//   Ends with the TIER LINE: the flags every later instrument needs (--chrome on a 403 / reset, --consent from the overlay census, --hide for a
//   third-party fixed widget, --locale / --cookie when the URL changed), and --profile writes them as the site profile at t0 (loop high-impact pass)
import { UA, arg, overlayOpts, launch, cookiesFor, hideModals } from './common.mjs';
import { firstLook } from './lib/probe-collectors.mjs'; // the in-page reading (shared with measure-page)

const url = process.argv[2]; const widths = String(process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : 1440).split(',').map(Number);
if (!url) { console.error('usage: probe-load.mjs <url> [W[,W…]] [--headed] [--locale <tag>] [--shot out.png]'); process.exit(1); }
const headed = process.argv.includes('--headed'); const { locale, consent, dismiss } = overlayOpts(); // the profile's overlays, when one is in use (nothing is clicked here)
const tier = { chrome: process.env.STARDUST_CHROME === '1' || process.argv.includes('--chrome') || !!overlayOpts().chrome, cookie: overlayOpts().cookie || null, locale: locale || null, consent: consent || null, dismiss: [...dismiss], hide: [], notes: [] }; // the tier line (loop high-impact pass): the flags every later instrument needs, printed once and written to --profile
const THIRD_PARTY = /userway|intercom|drift|livechat|medallia|qualtrics|nebula|zendesk|hubspot|olark|tidio|crisp|accessibe|audioeye|trustarc|cookiebot/i;
const b = await launch();
for (const W of widths) {
if (widths.length > 1) console.log(`\n=== W ${W}`);
const p = await b.newPage({ viewport: { width: W, height: 900 }, userAgent: UA, ...(locale ? { locale, extraHTTPHeaders: { 'Accept-Language': `${locale},${locale.split('-')[0]};q=0.9` } } : {}) });
const ck = cookiesFor(url, overlayOpts().cookie); if (ck.length) await p.context().addCookies(ck);
let r; try { r = await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 }); } catch (e) { console.log(`status ERR ${String(e.message).split('\n')[0].slice(0, 100)}`); if (!tier.chrome) { tier.chrome = true; tier.notes.push('the origin refuses headless Chromium (connection reset): --chrome'); } await p.close(); continue; }
console.log('status', r.status(), 'url', p.url()); await p.waitForTimeout(5000);
if ([403, 429, 503].includes(r.status()) && !tier.chrome) { tier.chrome = true; tier.notes.push(`${r.status()} to headless Chromium: --chrome (the installed Chrome, headless)`); }
if (p.url().split('#')[0] !== url.split('#')[0]) { console.log(`URL CHANGED ${url} → ${p.url()} — a redirect or a JS forward (edition, locale, attestation page): is this the page to measure? (--cookie / --locale pin the edition)`); tier.notes.push(`URL changed to ${p.url()}: pin the edition (--locale <tag>, or --cookie from the site's own cookies) or measure the final URL`); }
// a bot challenge answers 200: one full-viewport iframe, no main, or a vendor's marker (acs-about: Imperva's page at 360, and the tier line said
// "no flag needed") — the width is a challenge, the tier is --chrome
const challenge = await p.evaluate(() => { const t = `${document.title} ${document.body?.innerText?.slice(0, 400) || ''}`; const ifr = [...document.querySelectorAll('iframe')].find((f) => { const r = f.getBoundingClientRect(); return r.width >= innerWidth * 0.9 && r.height >= innerHeight * 0.8; }); const marker = /_Incapsula_Resource|incap_ses|cf-chl|challenge-platform|px-captcha|captcha-delivery|datadome|perimeterx/i.test(document.documentElement.innerHTML.slice(0, 20000)); const words = /pardon our interruption|just a moment|access denied|verify you are (a )?human|checking your browser|request unsuccessful/i.test(t); return (ifr && !document.querySelector('main') && (document.body?.innerText || '').trim().length < 200) || marker || words ? `${ifr ? 'a full-viewport iframe' : ''}${marker ? ' a vendor marker' : ''}${words ? ` "${t.trim().slice(0, 60)}"` : ''}`.trim() : null; }).catch(() => null);
if (challenge) { console.log(`CHALLENGE at ${W}: ${challenge} — this load is a bot challenge, not the page`); if (!tier.chrome) { tier.chrome = true; tier.notes.push(`a bot challenge at ${W} (${challenge}): --chrome (the installed Chrome) on every instrument`); } }
const info = await p.evaluate(firstLook);
// a popup / modal layer over the page (a locale chooser, a newsletter): hidden on every instrument — toryburch measured two of them as sections
for (const sel of await hideModals(p)) if (!tier.hide.includes(sel)) { tier.hide.push(sel); tier.notes.push(`a modal layer at ${W}: ${sel} — hidden on every instrument`); }
console.log(JSON.stringify(info, null, 1));
if (!info.fixed.length) console.log(`no fixed or sticky layer at ${W}`);
if (info.tallHeader) console.log(`NOTE: ${info.tallHeader}`);
// the consent managers by their dialog's class, then the accept button INSIDE any overlay by its text (acs-about: an Osano dialog was in the
// census and the tier line said "no overlay seen" — the agent found `.osano-cm-accept-all` by hand)
const CMP = [[/osano-cm/, '.osano-cm-accept-all'], [/CybotCookiebot/, '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll'], [/truste|trustarc/i, '#truste-consent-button'], [/cky-consent|cookieyes/i, '.cky-btn-accept'], [/didomi/, '#didomi-notice-agree-button'], [/qc-cmp2/, '.qc-cmp2-summary-buttons button[mode="primary"]'], [/cmplz/, '.cmplz-accept'], [/iubenda/, '.iubenda-cs-accept-btn'], [/klaro/, '.cm-btn-success']];
// consent dialogs inside a shadow root render late and are not in the overlay census (continental: consentmanager's #cmpwrapper in every chunk,
// the tier line said "no flag needed"): their host is hidden — `--hide` reaches the host, a click selector would not reach the button
const shadowCmp = await p.evaluate(() => ['#cmpwrapper', '#usercentrics-root', '#usercentrics-cmp-ui', 'aside#usercentrics-cmp-ui', '#didomi-host', '[id^="sp_message_container"]', '#truste-consent-track', '#cookiebanner'].filter((sel) => { const e = document.querySelector(sel); if (!e) return false; const r = e.getBoundingClientRect(); const sr = e.shadowRoot; return r.height > 0 || (sr && [...sr.querySelectorAll('*')].some((x) => x.getBoundingClientRect().height > 40)); })).catch(() => []);
for (const sel of shadowCmp) if (!tier.hide.includes(sel)) { tier.hide.push(sel); tier.notes.push(`a consent dialog in a shadow root (${sel}) — hidden on every instrument (a click selector cannot reach inside it)`); }
if (!tier.consent) { const ov = (info.overlays || []).join(' '); const hit = CMP.find(([re]) => re.test(ov)); if (hit) tier.consent = hit[1]; }
if (!tier.consent && (info.overlays || []).length) { tier.consent = await p.evaluate((sels) => { for (const s0 of sels) { let root; try { root = document.querySelector(s0.split(' [')[0]); } catch { continue; } if (!root) continue; const b = [...root.querySelectorAll('button, a[role="button"], [role="button"]')].find((e) => /^(accept|agree|allow|i agree|ok|got it)\b|accept all|allow all/i.test((e.innerText || e.getAttribute('aria-label') || '').trim())); if (!b) continue; if (b.id) return `#${CSS.escape(b.id)}`; const cls = [...b.classList].filter((c) => !/^(btn|button|active|focus)$/i.test(c)).slice(0, 2); if (cls.length) return `${b.tagName.toLowerCase()}.${cls.map((c) => CSS.escape(c)).join('.')}`; } return null; }, info.overlays).catch(() => null); }
if (!tier.consent) { const c = (info.overlays || []).map((s) => s.split(' ')[0]).find((s) => /^button#/.test(s) && /accept|agree|allow/i.test(s)) || (info.overlays || []).some((s) => /onetrust/.test(s)) && '#onetrust-accept-btn-handler'; if (c) tier.consent = c; }
for (const f of info.fixed || []) { const sel0 = f.split(' [')[0]; if (THIRD_PARTY.test(sel0) && !tier.hide.includes(sel0)) tier.hide.push(sel0); }
const afterScroll = await p.evaluate(async () => { window.scrollTo(0, innerHeight); await new Promise((r) => setTimeout(r, 900)); const sel = (el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${[...el.classList].slice(0, 2).map((c) => '.' + c).join('')}`; const out = [...document.querySelectorAll('body *')].filter((el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return cs.position === 'fixed' && r.width > 20 && r.height > 20 && r.width < innerWidth * 0.5 && cs.visibility !== 'hidden' && cs.display !== 'none'; }).map(sel); window.scrollTo(0, 0); return out; }).catch(() => []);
const small = afterScroll.filter((s) => !(info.fixed || []).some((f) => f.startsWith(s))); // new after scroll: a back-to-top, a floating consent button, a chat bubble
for (const s of small) { if (!tier.hide.includes(s) && (THIRD_PARTY.test(s) || /back-?to-?top|scroll-?top|floating|chat|widget/i.test(s))) tier.hide.push(s); else if (!tier.hide.includes(s)) tier.notes.push(`fixed layer after one viewport of scroll at ${W}: ${s} — a third-party widget sits in every chunk (--hide it) or a site control (reproduce it)`); }
if (info.shadowHosts > 0) tier.notes.push(`${info.shadowHosts} shadow hosts at ${W}: measure-page reads the composed tree by itself; deep-probe / hover-diff take \` >> \` selectors`);
if (info.breakpoints?.length) console.log(`breakpoints (media queries by count): ${info.breakpoints.join(', ')}`);
if (info.unassigned?.length) console.log(`UNASSIGNED painted band(s) outside header / main / footer at ${W} — content no default root dumps; add them to --roots: ${info.unassigned.join(' ; ')}`);
// the known controls (flags or the site profile): does each still resolve on this first look? (`site-profile check` does the same per width)
for (const sel of [consent, ...dismiss].filter(Boolean)) { const n = await p.evaluate((s) => { try { return document.querySelectorAll(s).length; } catch { return -1; } }, sel); console.log(`overlay control ${sel}: ${n < 0 ? 'invalid selector' : n ? `${n} match${n > 1 ? 'es' : ''}` : 'ABSENT'}`); }
if (arg('--shot', null)) await p.screenshot({ path: widths.length > 1 ? arg('--shot').replace(/(\.\w+)?$/, `-${W}$1`) : arg('--shot') });
await p.close();
}
await b.close();
// the tier line: what every later instrument takes, in copy-paste form; --profile <file> writes it as the site profile every instrument reads by default
const flags = [...(tier.chrome ? ['--chrome'] : []), ...(tier.cookie ? [`--cookie '${tier.cookie}'`] : []), ...(tier.locale ? [`--locale ${tier.locale}`] : []), ...(tier.consent ? [`--consent '${tier.consent}'`] : []), ...(tier.dismiss.length ? [`--dismiss '${tier.dismiss.join(',')}'`] : []), ...(tier.hide.length ? [`--hide '${tier.hide.join(',')}'`] : [])];
console.log(`\ntier: ${flags.length ? flags.join(' ') : 'no flag needed (headless Chromium, no overlay seen, no third-party fixed layer)'}${tier.notes.length ? `\n  ${tier.notes.join('\n  ')}` : ''}`);
if (typeof arg('--profile', null) === 'string') {
  const { existsSync, readFileSync, writeFileSync, mkdirSync } = await import('node:fs'); const { dirname } = await import('node:path'); const file = arg('--profile');
  let prof = {}; try { if (existsSync(file)) prof = JSON.parse(readFileSync(file, 'utf8')); } catch { prof = {}; }
  prof._schema = prof._schema || 'stardust-lite/site@1'; prof._writtenAt = new Date().toISOString(); prof.origin = prof.origin || { url }; if (widths.length >= 3 && !prof.widths) prof.widths = widths; // a one-width first look must not become measure-page's default widths
  prof.overlays = { ...(prof.overlays || {}), ...(tier.consent ? { consent: tier.consent } : {}), dismiss: tier.dismiss.length ? tier.dismiss : (prof.overlays?.dismiss || []), ...(tier.locale ? { locale: tier.locale } : {}), ...(tier.chrome ? { chrome: true } : {}), ...(tier.cookie ? { cookie: tier.cookie } : {}), hide: tier.hide.length ? tier.hide : (prof.overlays?.hide || []), _note: 'written by probe-load --profile at t0 (the tier line); site-profile init completes the rest after the template run' };
  mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, JSON.stringify(prof, null, 1)); console.log(`profile: ${file} — overlays ${JSON.stringify(prof.overlays).slice(0, 160)}; every instrument reads it (no flag typed again)`);
}
