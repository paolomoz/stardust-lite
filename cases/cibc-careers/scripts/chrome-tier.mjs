// chrome-tier.mjs — preload: make every Playwright `chromium.launch()` use the installed Google Chrome (channel 'chrome', still headless).
// The CIBC origin resets headless Chromium's HTTP/2 connection (net::ERR_HTTP2_PROTOCOL_ERROR) but accepts real Chrome in headless mode;
// no instrument in stardard-lite exposes a channel switch (BACKLOG #1 is open), so this patch is applied from the outside:
//   NODE_OPTIONS="--import /abs/path/scripts/chrome-tier.mjs" node node_modules/stardust-lite/scripts/<instrument>.mjs …
// NODE_OPTIONS reaches the children `gate` and `harness` spawn (cap-probe, motion-observe, the lint, serve). Local pages are unaffected.
import { chromium } from 'playwright';
const launch = chromium.launch.bind(chromium);
chromium.launch = (opts = {}) => launch({ channel: 'chrome', ...opts });
if (process.env.CHROME_TIER_VERBOSE) process.stderr.write('chrome-tier: channel chrome\n');
