#!/usr/bin/env node
// site-profile.mjs — the site-level state a template run learned, as data: `migration/site.json`, read by every instrument afterwards
// (`--site <file>`, or the file under the cwd by default; explicit flags win) so page 2 does not re-discover the overlays, the cap model,
// the chrome heights or the DA coordinates, and nobody types the flag soup again (SCALING-PLAN §2.A, batch-7 rollout).
//   init  <case-dir> --out migration/site.json [--site-repo <dir>] [--live <url>] [--served <url>]
//         fills the profile from a finished case (measure/, gate/, motion/, REPORT.md, REGISTER.md) and the site repo (styles/, fonts/,
//         fstab.yaml). A field that cannot be derived is null with a `_notes` entry saying where it comes from — nothing is invented.
//   check <site.json> [--tol 2]   opens the live origin once per gated width with the profile's overlays: status 200, the consent and
//         dismiss controls still resolve (absent now = WARN), the require markers present, header and footer heights within --tol px of
//         the profile, the fixed-layer state per width unchanged. PASS/WARN/FAIL table; exit 2 on FAIL. Run it before every page run.
//   print <site.json>             the markdown view (for a case README).
//
// site.json shape (v1; keys later passes read: chrome.header.heightsByWidth, cap, overlays, da, media, serve, noise):
// {
//   "_schema": "stardust-lite/site-profile@1", "_writtenAt": iso, "_source": { "caseDir", "siteRepo" },
//   "origin": "https://www.example.com/",              // the live URL the template was measured at
//   "edition": "…" | null,                             // REGISTER.md's first paragraph (geo edition, CMS, consent notes)
//   "widths": [360, 1440, 2560], "baseWidth": 1440, "probeWidth": 2560,
//   "overlays": { "consent": css|null, "dismiss": [css], "locale": tag|null, "require": [css], "headed": bool, "reloadOnConsent": bool|null },
//   "firstLook": { "status": 200|null, "shadowRoots": n|null, "fixedLayers": { "<W>": ["sel [x,y,w,h] z=…"] }, "wafNotes": "…"|null },
//   "cap": { "kind": "shell"|"module"|"fluid", "shell": px|null, "content": px|null, "modules": [{ "section", "px", "selector" }], "probeWidth", "mainSelector": css|null },
//   "fonts": { "families": [{ "family", "weights": [..], "styles": [..] }], "files": ["fonts/x.woff2"], "faces": [{ "family", "weight", "style", "file" }] },
//   "body": { "family", "size", "lineHeight", "weight", "color" } | null,   // the mode of the spec's p rows at the base width
//   "tokens": { "--name": "value" },                   // the custom properties styles/styles.css declares
//   "chrome": { "header": { "selector", "heightsByWidth": { "<W>": px }, "fixed": { "<W>": bool }, "states": [{ "dir", "y", "layers": {…} }], "panels": { "<name>": { "selector", "box", "width", "side" } } },
//               "footer": { "selector", "heightsByWidth": { "<W>": px } },
//               "fragments": { "nav": "/drafts/nav", "footer": "/drafts/footer" } },
//   "media": { "folder": "/drafts/media", "branchHost": "https://<branch>--<site>--<org>.aem.page", "namingRules": "…" },
//   "da": { "org", "site", "branch" }, "serve": { "port": n|null },
//   "noise": { "floor1440": pct|null, "compositionMarkers": [css] },
//   "pages": [{ "path", "template", "proto": { "360", "base", "probe" }, "served": { … }, "rounds": n|null }],
//   "_notes": { "<field>": "where it comes from / why null" }
// }
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { UA, arg, acceptOverlays, launch } from './common.mjs';
import { statusRow, overlayRows, chromeRows, verdictOf } from './lib/profile-check.mjs';

const [,, cmd, target] = process.argv;
const usage = () => { console.error('usage: site-profile.mjs init <case-dir> --out migration/site.json [--site-repo <dir>] [--live <url>] [--served <url>]\n       site-profile.mjs check <site.json> [--tol 2]\n       site-profile.mjs print <site.json>\n  init reads: <case>/measure/spec-<W>.json, summary.json, probe-load*.txt (or probe-load-<W>.txt), cap.json (measure/ or gate/), gate*/noise-1440.json or noise*.log (`= x%`), serve*.log (port), and the case prose (README / REPORT / REGISTER: served URL, --consent / --dismiss / --locale / --main flags); a null carries its _note'); process.exit(1); };
if (!cmd || !target || !['init', 'check', 'print'].includes(cmd)) usage();

const read = (f) => (existsSync(f) ? readFileSync(f, 'utf8') : null);
const readJson = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };
const files = (dir, re) => (existsSync(dir) && statSync(dir).isDirectory() ? readdirSync(dir).filter((f) => re.test(f)).sort().map((f) => join(dir, f)) : []);
const table = (rows, head) => { const w = head.map((h, i) => Math.max(h.length, ...rows.map((r) => String(r[i] ?? '').length))); const line = (r) => `| ${r.map((c, i) => String(c ?? '').padEnd(w[i])).join(' | ')} |`; console.log(line(head)); console.log(`|${w.map((x) => '-'.repeat(x + 2)).join('|')}|`); rows.forEach((r) => console.log(line(r))); };

// ───────────────────────────── init ─────────────────────────────
if (cmd === 'init') {
  const caseDir = resolve(target); if (!existsSync(caseDir)) { console.error(`site-profile: ${caseDir} not found`); process.exit(1); }
  const guessRepo = () => { for (let d = caseDir; d !== dirname(d); d = dirname(d)) if (existsSync(join(d, 'styles', 'styles.css')) && existsSync(join(d, 'fstab.yaml'))) return d; return null; };
  const repo = arg('--site-repo', null) ? resolve(arg('--site-repo')) : guessRepo();
  const out = resolve(arg('--out', repo ? join(repo, 'migration', 'site.json') : 'migration/site.json'));
  const notes = {}; const note = (k, v) => { notes[k] = v; };
  const M = join(caseDir, 'measure'); const G = join(caseDir, 'gate'); const MO = join(caseDir, 'motion');
  const md = ['REPORT.md', 'REGISTER.md', 'README.md'].map((f) => read(join(caseDir, f)) || '');
  const [report, register] = md; const prose = md.join('\n');
  const logs = [...files(M, /\.(log|txt)$/), ...files(G, /\.(log|txt)$/), ...files(caseDir, /\.log$/)].map((f) => read(f) || '').join('\n');

  // widths and specs
  const specs = {}; for (const f of files(M, /^spec-\d+\.json$/)) { const j = readJson(f); if (j) specs[Number(f.match(/spec-(\d+)/)[1])] = j; }
  const widths = Object.keys(specs).map(Number).sort((a, b) => a - b);
  if (!widths.length) note('widths', 'no measure/spec-<W>.json — run live-spec at every gated width');
  const cap = readJson(join(M, 'cap.json')) || readJson(join(G, 'cap.json'));
  const capPage = cap ? Object.values(cap.pages || {})[0] : null;
  const baseWidth = capPage?.baseWidth ?? cap?._provenance?.baseWidth ?? (widths.includes(1440) ? 1440 : widths[Math.floor(widths.length / 2)] ?? null);
  const probeWidth = capPage?.probeWidth ?? cap?.aggregate?.probeWidth ?? (widths.length ? Math.max(...widths) : null);
  const base = specs[baseWidth] || specs[widths[0]];

  // origin, served, DA
  const origin = arg('--live', null) || base?.url || cap?._provenance?.urls?.[0] || null; if (!origin) note('origin', 'spec-<W>.json url / cap.json / --live');
  const servedUrl = arg('--served', null) || (prose.match(/https?:\/\/[\w-]+--[\w-]+--[\w-]+\.aem\.(?:page|live)\/[^\s)`'"*]*/) || [])[0] || null;
  const host = servedUrl ? new URL(servedUrl).host : null; const hm = host ? host.match(/^([\w-]+)--([\w-]+)--([\w-]+)\.aem\.(page|live)$/) : null;
  let da = hm ? { org: hm[3], site: hm[2], branch: hm[1] } : { org: null, site: null, branch: null };
  if (!hm) { const fst = repo ? read(join(repo, 'fstab.yaml')) : null; const fm = fst && fst.match(/content\.da\.live\/([\w-]+)\/([\w-]+)/); if (fm) da = { org: fm[1], site: fm[2], branch: null }; note('da', `served URL (branch--site--org.aem.page) not found in REPORT/README; ${fm ? 'org/site from fstab.yaml, branch unknown' : 'pass --served <url>'}`); }
  const branchHost = hm ? `https://${host}` : null;
  const servedPath = servedUrl ? new URL(servedUrl).pathname : null; const draftsDir = servedPath ? dirname(servedPath) : null;

  // overlays: the flags the case's prose and logs record, else the first look's controls
  const flag = (name) => { const re = new RegExp(`${name}\\s+(?:'([^']+)'|"([^"]+)"|(\\S+))`, 'g'); const hits = {}; for (const m of (prose + '\n' + logs).matchAll(re)) { const v = (m[1] ?? m[2] ?? m[3]).replace(/[`'",.;:)*]+$/, ''); if (v && !v.startsWith('<') && !v.startsWith('-')) hits[v] = (hits[v] || 0) + 1; } return Object.entries(hits).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null; };
  const splitList = (v) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : []);
  const probeTxt = files(M, /^probe-load.*\.txt$/).map((f) => read(f)).join('\n') || (read(join(caseDir, 'probe-load.txt')) || '');
  const firstLooks = {}; // W → parsed probe-load JSON
  let status = null;
  for (const block of probeTxt.split(/^=== W (?=\d+)/m)) {
    const wm = block.match(/^(\d+)/); const sm = block.match(/status (\d+) url/); const j0 = block.indexOf('{'); const j1 = block.lastIndexOf('}');
    if (j0 < 0 || j1 < 0) continue; const j = (() => { try { return JSON.parse(block.slice(j0, j1 + 1)); } catch { return null; } })(); if (!j) continue;
    const W = wm ? Number(wm[1]) : baseWidth; firstLooks[W] = j; if (sm && status === null) status = Number(sm[1]);
  }
  const fl = firstLooks[baseWidth] || Object.values(firstLooks)[0] || null;
  let consent = flag('--consent');
  if (!consent && fl) { const c = (fl.overlays || []).map((s) => s.split(' ')[0]).find((s) => /^button#/.test(s) && /accept/i.test(s)); if (c) { consent = c; note('overlays.consent', 'no --consent in the case prose/logs; the first look\'s accept button (probe-load overlays)'); } }
  if (!consent) note('overlays.consent', 'not in REPORT/REGISTER/README/logs nor the first look — pass --consent on the first instrument, then re-init');
  const dismiss = splitList(flag('--dismiss')); const locale = flag('--locale'); const require = splitList(flag('--require'));
  if (!locale) note('overlays.locale', 'no --locale recorded in the case prose/logs (null = not pinned)');
  const headed = /--headed/.test(prose + logs);
  const reloadOnConsent = /no reload on consent/i.test(prose) ? false : (/reloaded the page|reloads? (?:the page )?on (?:accept|consent)|reload-on-(?:accept|consent)/i.test(prose + logs) ? true : null);
  if (reloadOnConsent === null) note('overlays.reloadOnConsent', 'no "reload on consent" / "reloaded the page" in the case prose or openPage logs');

  // first look
  const overlaySet = new Set(Object.values(firstLooks).flatMap((j) => (j.overlays || []).map((s) => s.split(' ')[0])));
  const fixedLayers = {}; for (const [W, j] of Object.entries(firstLooks)) fixedLayers[W] = (j.fixed || []).filter((s) => !overlaySet.has(s.split(' ')[0]));
  if (!Object.keys(firstLooks).length) note('firstLook', 'no measure/probe-load*.txt — run probe-load <url> <W,W,W> and keep its output there');
  const sentences = (prose.match(/[^.\n]*\b(WAF|bot-manag\w*|Akamai|Cloudflare|403|challenge page|headless)\b[^.\n]*\./gi) || []).map((s) => s.trim());
  const wafNotes = sentences.length ? [...new Set(sentences)].slice(0, 3).join(' ') : null; if (!wafNotes) note('firstLook.wafNotes', 'no WAF / bot-management sentence in the case prose');
  const firstLook = { status, shadowRoots: fl?.shadowHosts ?? null, fixedLayers, wafNotes };

  // cap model
  const mainSelector = cap?._provenance?.pinned || flag('--main') || capPage?.root?.selector || null;
  // the CONTENT root is not the cap shell: measure-page's summary names the root it dumped (`main`, or `div.main-container` when a hero
  // sits before main) — gate's section table and measure-page read `cap.contentRoot` first (BACKLOG 139; sdt-dentsu's hero was unpaired
  // on every page while the live split ran from `#main-content`)
  const measureSummary = readJson(join(M, 'summary.json'));
  const contentRoot = (() => { const mr = measureSummary?.mainRoot; if (!mr) return null; const row = mr[String(baseWidth)] || Object.values(mr)[0]; return row?.content || null; })();
  if (!contentRoot) note('cap.contentRoot', 'measure/summary.json mainRoot (run measure-page) — the dump key the triage and the gate split from');
  const capOut = cap ? { kind: capPage?.fluid ? 'fluid' : (capPage?.contentFrom || (capPage?.shellMaxWidth ? 'shell' : 'module')), shell: capPage?.shellMaxWidth ?? null, content: capPage?.contentMaxWidth ?? null, modules: (() => { const seen = new Set(); return (cap.aggregate?.modules || capPage?.modules || []).filter((m) => { const k = `${m.selector}|${m.px}`; if (seen.has(k)) return false; seen.add(k); return true; }).map((m) => ({ section: m.section ?? m.index ?? null, px: m.px, selector: m.selector })); })(), probeWidth, mainSelector, contentRoot } : { kind: null, shell: null, content: null, modules: [], probeWidth, mainSelector, contentRoot };
  if (!cap) note('cap', 'no measure/cap.json or gate/cap.json — run cap-probe <url> --out measure/cap.json');
  note('cap.mainSelector', cap?._provenance?.pinned ? 'cap-probe --main (pinned)' : (flag('--main') ? '--main in the case prose/logs' : 'cap-probe\'s chosen root (pass gate --main to override)'));

  // fonts and body row
  const faces = []; const cssFiles = repo ? ['styles/fonts.css', 'styles/styles.css', 'styles/lazy-styles.css'].map((f) => join(repo, f)).filter(existsSync) : [];
  for (const f of cssFiles) for (const m of (read(f) || '').matchAll(/@font-face\s*{([^}]*)}/g)) { const d = m[1]; const g = (p) => (d.match(new RegExp(`${p}\\s*:\\s*([^;]+);`)) || [])[1]?.trim() ?? null; faces.push({ family: (g('font-family') || '').replace(/['"]/g, '') || null, weight: g('font-weight'), style: g('font-style'), file: (d.match(/url\(['"]?([^'")]+)['"]?\)/) || [])[1] || null }); }
  const fontFiles = repo ? files(join(repo, 'fonts'), /\.(woff2?|ttf|otf)$/).map((f) => `fonts/${basename(f)}`) : [];
  const famMap = {}; for (const s of base?.fonts || []) { const m = s.match(/^(.*?) (\S+) (\S+)$/); if (!m) continue; const e = (famMap[m[1]] ||= { family: m[1], weights: new Set(), styles: new Set() }); e.weights.add(m[2]); e.styles.add(m[3]); }
  const families = Object.values(famMap).map((e) => ({ family: e.family, weights: [...e.weights].sort(), styles: [...e.styles].sort() }));
  if (!families.length) note('fonts.families', 'spec-<W>.json fonts (document.fonts loaded at the base width)'); if (!fontFiles.length) note('fonts.files', repo ? `${repo}/fonts/ is empty — the source may serve its fonts from a CDN (@import)` : 'no site repo (--site-repo)');
  let body = null;
  if (base) { const tally = {}; for (const sec of base.secs) for (const it of sec.items) if (it.k === 'p' && !it.inline && it.ff) { const key = JSON.stringify([it.ff, it.fs, it.lh, it.fw, it.c]); tally[key] = (tally[key] || 0) + (it.t?.length || 1); } const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]; if (top) { const [family, size, lineHeight, weight, color] = JSON.parse(top[0]); body = { family, size, lineHeight, weight, color }; note('body', `the mode (by text length) of the p rows in measure/spec-${baseWidth}.json`); } }
  if (!body) note('body', 'no p row in the base-width spec');
  const tokens = {}; const stylesCss = repo ? read(join(repo, 'styles', 'styles.css')) : null;
  if (stylesCss) { for (const m of stylesCss.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) if (!(m[1] in tokens)) tokens[m[1]] = m[2].trim(); } else note('tokens', repo ? 'styles/styles.css missing' : 'no site repo (--site-repo)');

  // chrome
  const secRow = (spec, which) => spec?.secs?.find((s) => s.id.toUpperCase().startsWith(which)) || null;
  const heights = (which) => { const o = {}; for (const W of widths) { const r = secRow(specs[W], which); if (r) o[W] = r.box[3]; } return o; };
  const headerSel = fl?.header || (base && secRow(base, 'HEADER') ? 'header' : null); const footerSel = fl?.footer || (base && secRow(base, 'FOOTER') ? 'footer' : null);
  const fixed = {}; for (const W of widths) { const layers = fixedLayers[W]; if (!layers) continue; fixed[W] = layers.some((s) => { const m = s.match(/\[(-?\d+),(-?\d+),(\d+),(\d+)\]/); return m && Number(m[2]) === 0 && Number(m[3]) >= W * 0.9; }); }
  if (!Object.keys(fixed).length) note('chrome.header.fixed', 'from probe-load fixed layers per width (a full-width layer at y 0 that is not an overlay)');
  const scrollTxt = [...files(M, /^scroll-probe.*\.txt$/), ...files(MO, /^scroll-probe.*\.txt$/)].map((f) => read(f)).join('\n');
  // one state per CHANGE of a class list or the header height (scroll-probe prints every paint step; a parallax layer alone is 400 lines)
  const states = []; let sig = null;
  for (const line of scrollTxt.split('\n')) { const m = line.match(/^(down|up)\s+y\s+(\d+)\s+(.*)$/); if (!m) continue; const layers = {}; for (const part of m[3].split(' | ')) { const h = part.match(/^(\S+?)\[([^\]]*)\]\s+h=(\d+)\s+top=(\S+)/); if (h) { layers[h[1]] = { classes: h[2], h: Number(h[3]), top: h[4] }; continue; } const p = part.match(/^(\S+?)\[([^\]]*)\]:(\S+(?: \S+)*?) op(\S+)$/); if (p) layers[p[1]] = { classes: p[2], paint: p[3], opacity: p[4] }; } const next = JSON.stringify(Object.entries(layers).map(([k, v]) => [k, v.classes, v.h ?? null])); if (next === sig) continue; sig = next; if (states.length < 40) states.push({ dir: m[1], y: Number(m[2]), layers }); }
  if (!states.length) note('chrome.header.states', 'no scroll-probe output under measure/ or motion/');
  const panels = {}; const rank = { served: 3, build: 2, live: 1 };
  for (const f of files(MO, /click.*\.txt$/)) { const first = (read(f) || '').split('\n').find((l) => l.trim()); if (!first) continue; const m = first.match(/^(\S+)\s+\[(-?\d+),(-?\d+),(\d+),(\d+)\]/); if (!m) continue; const parts = basename(f, '.txt').split('-').filter((p) => p !== 'click'); const side = parts.find((p) => rank[p]) || 'live'; const W = Number(parts.find((p) => /^\d+$/.test(p))) || null; const name = parts.filter((p) => !rank[p] && !/^\d+$/.test(p)).join('-') || 'panel'; const cur = panels[name]; if (!cur || rank[side] > rank[cur.side]) panels[name] = { selector: m[1], box: [m[2], m[3], m[4], m[5]].map(Number), width: W, side }; }
  if (!Object.keys(panels).length) note('chrome.header.panels', 'no click-state outputs under motion/ (click-<side>-<name>-<W>.txt)');
  const chrome = { header: { selector: headerSel, heightsByWidth: heights('HEADER'), fixed, states, panels }, footer: { selector: footerSel, heightsByWidth: heights('FOOTER') }, fragments: { nav: draftsDir ? `${draftsDir}/nav` : null, footer: draftsDir ? `${draftsDir}/footer` : null } };
  if (!Object.keys(chrome.header.heightsByWidth).length) note('chrome.header.heightsByWidth', 'the HEADER row of measure/spec-<W>.json per width');
  if (!draftsDir) note('chrome.fragments', 'the served URL\'s directory + /nav, /footer (pass --served)');

  // media, serve, noise, pages
  const folder = (prose.match(/`?(\/[\w/-]*\/media)\b/) || [])[1] || (draftsDir ? `${draftsDir}/media` : null); if (!(prose.match(/\/[\w/-]*\/media\b/))) note('media.folder', draftsDir ? 'assumed next to the served document (no media path in the REPORT)' : 'no media path in the REPORT and no served URL');
  const media = { folder, branchHost, namingRules: 'lower-case a-z0-9 and single hyphens; no underscores, dots or double hyphens (media-fetch names, da-put warns)' };
  const serveLog = [...files(caseDir, /serve.*\.log$/), ...files(M, /serve.*\.log$/)].map((f) => read(f)).join('\n');
  const port = Number((serveLog.match(/localhost:(\d+)/) || prose.match(/served on :(\d+)/) || prose.match(/--port (\d+)/) || [])[1]) || null; if (!port) note('serve.port', 'proto-serve.log (`serve: http://localhost:<port>/`) or "served on :<port>" in the REPORT');
  const noiseLog = [...files(G, /^noise.*\.(log|txt)$/)].map((f) => read(f)).join('\n'); const noiseJson = readJson(join(G, 'noise-1440.json'));
  let floor1440 = noiseJson?.pct ?? (Number((noiseLog.match(/=\s*([\d.]+)%/) || [])[1]) || null);
  // the REPORT's three-width table: | width | noise floor | prototype | served | Δh | notes |
  const pages = []; let rounds = null;
  for (const m of report.matchAll(/^Rounds[^\n]*(?:\n[^\n|]+)*/gm)) for (const r of m[0].matchAll(/\br(\d+)\b/g)) rounds = Math.max(rounds ?? 0, Number(r[1]));
  const tbl = report.split('\n').filter((l) => /^\|/.test(l)); const hi = tbl.findIndex((l) => /^\|\s*width\s*\|/i.test(l) && /prototype/i.test(l) && /served/i.test(l));
  if (hi >= 0) {
    const head = tbl[hi].split('|').slice(1, -1).map((c) => c.trim().toLowerCase()); const col = (re) => head.findIndex((c) => re.test(c));
    const ci = { noise: col(/noise/), proto: col(/prototype/), served: col(/served/) }; const num = (cell) => { const b = cell.match(/\*\*([\d.]+)\*\*/); if (b) return Number(b[1]); const l = cell.match(/^\s*([\d.]+)/); return l ? Number(l[1]) : null; };
    const proto = {}; const served = {}; const key = (W) => (W === 360 ? '360' : W === baseWidth ? 'base' : W === probeWidth ? 'probe' : String(W));
    for (const l of tbl.slice(hi + 2)) { const cells = l.split('|').slice(1, -1).map((c) => c.trim()); const W = Number(cells[0]); if (!W) break; proto[key(W)] = num(cells[ci.proto] || ''); served[key(W)] = num(cells[ci.served] || ''); if (W === 1440 && floor1440 === null && ci.noise >= 0) { floor1440 = num(cells[ci.noise]); if (floor1440 !== null) note('noise.floor1440', 'the REPORT table\'s noise column at 1440'); } }
    pages.push({ path: servedPath, template: basename(caseDir), proto, served, rounds });
  } else note('pages', 'REPORT.md has no three-width table (| width | noise floor | prototype | served |) — fill the row by hand');
  if (floor1440 === null) note('noise.floor1440', 'gate/noise-1440.log (pixel-compare live vs live) or the REPORT table');
  const edition = (() => { const lines = register.split('\n'); let i = lines.findIndex((l) => /^# /.test(l)); if (i < 0) return null; i += 1; while (i < lines.length && !lines[i].trim()) i += 1; const para = []; while (i < lines.length && lines[i].trim()) para.push(lines[i++].trim()); return para.join(' ') || null; })();
  if (!edition) note('edition', 'REGISTER.md\'s first paragraph');

  const profile = { _schema: 'stardust-lite/site-profile@1', _writtenAt: new Date().toISOString(), _source: { caseDir, siteRepo: repo }, origin, edition, widths, baseWidth, probeWidth, overlays: { consent, dismiss, locale, require, headed, reloadOnConsent }, firstLook, cap: capOut, fonts: { families, files: fontFiles, faces }, body, tokens, chrome, media, da, serve: { port }, noise: { floor1440, compositionMarkers: require }, pages, _notes: notes };
  mkdirSync(dirname(out), { recursive: true }); writeFileSync(out, JSON.stringify(profile, null, 1));
  const hb = chrome.header.heightsByWidth; const fb = chrome.footer.heightsByWidth; const perW = (o) => Object.entries(o).map(([w, v]) => `${w}:${v}`).join(' ') || '—';
  table([
    ['origin', origin], ['edition', edition ? `${edition.slice(0, 90)}…` : null], ['widths', `${widths.join(',')} (base ${baseWidth}, probe ${probeWidth})`],
    ['overlays', `consent ${consent} · dismiss [${dismiss.join(',')}] · locale ${locale} · require [${require.join(',')}] · headed ${headed} · reloadOnConsent ${reloadOnConsent}`],
    ['firstLook', `status ${status} · shadowRoots ${firstLook.shadowRoots} · fixed layers ${perW(Object.fromEntries(Object.entries(fixedLayers).map(([w, l]) => [w, l.length])))}`],
    ['cap', `kind ${capOut.kind} · shell ${capOut.shell} · content ${capOut.content} · ${capOut.modules.length} modules · main ${mainSelector}`],
    ['fonts', `${families.map((f) => `${f.family} ${f.weights.join('/')}`).join(', ') || '—'} · ${fontFiles.length} files · ${faces.length} faces`],
    ['body', body ? `${body.family} ${body.size}/${body.lineHeight} ${body.weight} ${body.color}` : null], ['tokens', Object.keys(tokens).length],
    ['chrome.header', `${headerSel} · h ${perW(hb)} · fixed ${perW(fixed)} · ${states.length} scroll states · panels ${Object.keys(panels).join(',') || '—'}`],
    ['chrome.footer', `${footerSel} · h ${perW(fb)}`], ['fragments', `${chrome.fragments.nav} ${chrome.fragments.footer}`],
    ['media', `${folder} · ${branchHost}`], ['da', `${da.org}/${da.site}@${da.branch}`], ['serve.port', port], ['noise', `floor1440 ${floor1440} · markers [${require.join(',')}]`],
    ['pages', pages.map((p) => `${p.path} proto ${JSON.stringify(p.proto)} served ${JSON.stringify(p.served)} rounds ${p.rounds}`).join('; ') || '—'],
    ['_notes', `${Object.keys(notes).length}: ${Object.keys(notes).join(', ')}`],
  ], ['field', 'value']);
  console.log(`\nsite-profile: wrote ${out}`);
  process.exit(0);
}

// ───────────────────────────── load ─────────────────────────────
const file = resolve(target); const P = readJson(file); if (!P) { console.error(`site-profile: cannot read ${file}`); process.exit(1); }

// ───────────────────────────── print ─────────────────────────────
if (cmd === 'print') {
  const o = P.overlays || {}; const h = P.chrome?.header || {}; const f = P.chrome?.footer || {}; const perW = (x) => Object.entries(x || {}).map(([w, v]) => `${w}: ${v}`).join(', ') || '—';
  const lines = [`## Site profile — ${P.origin || '?'}`, '', `Written ${P._writtenAt} from \`${P._source?.caseDir}\`${P._source?.siteRepo ? ` and \`${P._source.siteRepo}\`` : ''}.`, ''];
  if (P.edition) lines.push(`**Edition.** ${P.edition}`, '');
  lines.push('| field | value |', '|---|---|',
    `| widths | ${(P.widths || []).join(', ')} (base ${P.baseWidth}, probe ${P.probeWidth}) |`,
    `| overlays | consent \`${o.consent}\` · dismiss ${o.dismiss?.length ? o.dismiss.map((s) => `\`${s}\``).join(', ') : '—'} · locale ${o.locale || '—'} · require ${o.require?.length ? o.require.map((s) => `\`${s}\``).join(', ') : '—'} · headed ${o.headed} · reload on consent ${o.reloadOnConsent} |`,
    `| first look | status ${P.firstLook?.status} · shadow roots ${P.firstLook?.shadowRoots} · fixed layers ${perW(Object.fromEntries(Object.entries(P.firstLook?.fixedLayers || {}).map(([w, l]) => [w, l.length])))}${P.firstLook?.wafNotes ? ` · ${P.firstLook.wafNotes}` : ''} |`,
    `| cap | ${P.cap?.kind} — shell ${P.cap?.shell ?? '—'}, content ${P.cap?.content ?? '—'}, ${P.cap?.modules?.length ?? 0} module caps (${(P.cap?.modules || []).map((m) => m.px ?? '?').join(', ')}) · probe ${P.cap?.probeWidth} · main \`${P.cap?.mainSelector}\` |`,
    `| fonts | ${(P.fonts?.families || []).map((x) => `${x.family} ${x.weights.join('/')}`).join(', ') || '—'} · files ${(P.fonts?.files || []).join(', ') || '—'} |`,
    `| body | ${P.body ? `${P.body.family} ${P.body.size} / ${P.body.lineHeight} ${P.body.weight} ${P.body.color}` : '—'} |`,
    `| tokens | ${Object.entries(P.tokens || {}).map(([k, v]) => `\`${k}: ${v}\``).join(', ') || '—'} |`,
    `| header | \`${h.selector}\` · heights ${perW(h.heightsByWidth)} · fixed ${perW(h.fixed)} · ${h.states?.length ?? 0} scroll states · panels ${Object.entries(h.panels || {}).map(([n, p]) => `${n} \`${p.selector}\` (${p.side}${p.width ? ` @${p.width}` : ''})`).join(', ') || '—'} |`,
    `| footer | \`${f.selector}\` · heights ${perW(f.heightsByWidth)} |`,
    `| fragments | nav \`${P.chrome?.fragments?.nav}\` · footer \`${P.chrome?.fragments?.footer}\` |`,
    `| media | folder \`${P.media?.folder}\` · branch host ${P.media?.branchHost} · ${P.media?.namingRules} |`,
    `| DA | ${P.da?.org}/${P.da?.site} @ ${P.da?.branch} · serve port ${P.serve?.port ?? '—'} |`,
    `| noise | floor at 1440 ${P.noise?.floor1440 ?? '—'} % · composition markers ${P.noise?.compositionMarkers?.length ? P.noise.compositionMarkers.map((s) => `\`${s}\``).join(', ') : '—'} |`);
  if (P.pages?.length) { lines.push('', '| page | template | prototype 360 / base / probe | served 360 / base / probe | rounds |', '|---|---|---|---|---|'); for (const p of P.pages) lines.push(`| ${p.path} | ${p.template} | ${[p.proto?.['360'], p.proto?.base, p.proto?.probe].map((v) => v ?? '—').join(' / ')} | ${[p.served?.['360'], p.served?.base, p.served?.probe].map((v) => v ?? '—').join(' / ')} | ${p.rounds ?? '—'} |`); }
  const notes = Object.entries(P._notes || {}); if (notes.length) { lines.push('', 'Notes — where an inferred field comes from, and what a null needs:', ''); for (const [k, v] of notes) lines.push(`- \`${k}\` — ${v}`); }
  console.log(lines.join('\n'));
  process.exit(0);
}

// ───────────────────────────── check ─────────────────────────────
// the per-width checks live in lib/profile-check.mjs: measure-page runs them from its own sessions (one `profile check:` line per page
// run); this subcommand is the standalone read — run it on its own when that line says FAIL
const tol = Number(arg('--tol', 2)); const o = P.overlays || {}; const H = P.chrome?.header || {};
const widths = [...new Set([...(P.widths || []), ...Object.keys(H.heightsByWidth || {}).map(Number)])].sort((a, b) => a - b);
if (!P.origin || !widths.length) { console.error('site-profile check: the profile has no origin or no widths'); process.exit(1); }
const b = await launch();
const rows = [];
for (const W of widths) {
  const page = await b.newPage({ viewport: { width: W, height: 900 }, userAgent: UA, ...(o.locale ? { locale: o.locale, extraHTTPHeaders: { 'Accept-Language': `${o.locale},${o.locale.split('-')[0]};q=0.9` } } : {}) });
  let status = null; try { const r = await page.goto(P.origin, { waitUntil: 'domcontentloaded', timeout: 90000 }); status = r?.status() ?? null; } catch (e) { rows.push([W, 'status', 200, e.message.slice(0, 60), 'FAIL']); await page.close(); continue; }
  rows.push(statusRow(W, status));
  await page.waitForTimeout(3000);
  rows.push(...await overlayRows(page, P, W));
  await acceptOverlays(page, { consent: o.consent, dismiss: o.dismiss || [], wait: 2500 });
  await page.evaluate(() => document.fonts.ready).catch(() => {}); await page.waitForTimeout(800);
  rows.push(...await chromeRows(page, P, W, { tol }));
  await page.close();
}
await b.close();
table(rows, ['W', 'check', 'profile', 'live', 'verdict']);
const v = verdictOf(rows);
console.log(`\nsite-profile check: ${v.line} (${file})`);
process.exit(v.fails ? 2 : 0);
