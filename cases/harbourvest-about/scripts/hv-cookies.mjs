// hv-cookies.mjs — preload (NODE_OPTIONS="--import <this file>") for every instrument and the vendored tools: the harbourvest.com origin
// forwards any browser without `HV.attestation` to the attestation page (clientlib-attestationpage: goToAttestation) and loads a
// per-persona header/footer by AJAX after the attestation check (processHeader) — a session that reads before they arrive has no chrome
// (noise-floor pair: Δh −473, 11.6 %). The composition measured is Italy / English / Institutional Investor: every Playwright context
// gets the three cookies before its first navigation, and every goto to the origin waits for both chrome fragments (≤ 20 s).
// Case script (harbourvest-about); no instrument has a cookie flag.
import { chromium } from 'playwright';
const COOKIES = [
  ['HV.attestation', 'institutional-investor'], ['HV.country', 'it'], ['HV.language', 'en'],
].map(([name, value]) => ({ name, value, domain: 'www.harbourvest.com', path: '/', secure: true, sameSite: 'Lax' }));
const CHROME = ['header .cmp-main-nav__container', 'footer #persona-footer-placeholder > *'];
const wrapPage = (page) => {
  const goto = page.goto.bind(page);
  page.goto = async (url, o) => {
    const r = await goto(url, o);
    if (/harbourvest\.com/.test(String(url))) for (const s of CHROME) await page.waitForSelector(s, { timeout: 20000, state: 'attached' }).catch(() => {});
    return r;
  };
  return page;
};
const launch = chromium.launch.bind(chromium);
chromium.launch = async (opts = {}) => {
  const browser = await launch(opts);
  const newContext = browser.newContext.bind(browser);
  browser.newContext = async (o = {}) => {
    const ctx = await newContext(o); await ctx.addCookies(COOKIES);
    const np = ctx.newPage.bind(ctx); ctx.newPage = async () => wrapPage(await np());
    return ctx;
  };
  const newPage = browser.newPage.bind(browser);
  browser.newPage = async (o = {}) => { const page = await newPage(o); await page.context().addCookies(COOKIES); return wrapPage(page); };
  return browser;
};
