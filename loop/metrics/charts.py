#!/usr/bin/env python3
"""charts.py — the run metrics (runs.csv) as one self-contained HTML page of inline-SVG charts, oldest run to newest.
Usage: python3 charts.py [runs.csv] [charts.html]"""
import csv, html, json, statistics, sys
from pathlib import Path

here = Path(__file__).parent
src = Path(sys.argv[1]) if len(sys.argv) > 1 else here / 'runs.csv'
out = Path(sys.argv[2]) if len(sys.argv) > 2 else here / 'charts.html'
rows = sorted(csv.DictReader(open(src)), key=lambda r: r['t0_utc'])
N = len(rows)

def num(v):
    try: return float(v)
    except (TypeError, ValueError): return None

def short(r):
    if r['run_label']: return r['run_label']
    return r['slug'].split('-')[0][:6]

# the periods, in run order: (first index, last index, label)
def period_of(r):
    if r['period'] == 'C': return 'L' if (r['run_label'] or '').startswith('L') else 'I'
    return r['period']  # A, B, D
PER = {'A': 'Sep 29 – Oct 1 · hand-built', 'B': 'Oct 3 – 4 · rounds R / V', 'I': 'inspection', 'L': 'Oct 10 – 11 · five-minute loop', 'D': 'next phase'}
bands = []
for i, r in enumerate(rows):
    p = period_of(r)
    if bands and bands[-1][2] == p: bands[-1][1] = i
    else: bands.append([i, i, p])
L1 = next(i for i, r in enumerate(rows) if r['run_label'] == 'L1')

for r in rows:
    r['_end'] = num(r['under10_min']) if r['never'] != '1' else num(r['stop_min'])
    r['_est'] = r['split_src'] != 'exact'
    r['_setup_bad'] = (num(r['setup_min']) or 0) > 30
    r['_first_bad'] = r['run_label'] == 'L19'

# ---- geometry
W, H = 1180, 230
ML, MR, MT, MB = 56, 16, 26, 58
PW, PH = W - ML - MR, H - MT - MB
step = PW / N
xof = lambda i: ML + step * (i + 0.5)

def nice_max(v):
    for c in sorted(m * 10 ** e for m in (1, 1.5, 2, 2.5, 3, 4, 5, 6, 8) for e in range(-1, 5)):
        if c >= v * 1.05: return c
    return v

def ticks(ymax):
    for s in (0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000, 2000, 5000):
        if ymax / s <= 5: return [s * k for k in range(int(ymax / s) + 1)]
    return [0, ymax]

def fmt(v):
    return f'{v:g}' if v is not None else '—'

def tip(r, extra=''):
    lab = r['run_label'] + ' · ' if r['run_label'] else ''
    end = f"under 10 % at {fmt(num(r['under10_min']))} min" if r['never'] != '1' else f"never under 10 % (stopped at {fmt(num(r['stop_min']))} min)"
    t = f"{lab}{r['slug']} · {r['t0_utc'][:10]}\n{end}"
    if extra: t += '\n' + extra
    if r['_est']: t += '\n(tool / LLM split estimated)'
    return html.escape(t, quote=True)

def frame(title, sub, ymax, unit, body, legend='', ref=None, ref_label=''):
    yof = lambda v: MT + PH - (min(v, ymax) / ymax) * PH
    g = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="{html.escape(title)}">']
    # period bands
    for k, (a, b, p) in enumerate(bands):
        x0, x1 = ML + step * a, ML + step * (b + 1)
        if k % 2 == 0: g.append(f'<rect class="band" x="{x0:.1f}" y="{MT}" width="{x1 - x0:.1f}" height="{PH}"/>')
        g.append(f'<text class="bandlab" x="{x0 + 4:.1f}" y="{MT - 8}">{html.escape(PER[p])}</text>')
    # grid + y axis
    for t in ticks(ymax):
        y = yof(t)
        g.append(f'<line class="grid" x1="{ML}" x2="{W - MR}" y1="{y:.1f}" y2="{y:.1f}"/>')
        g.append(f'<text class="tick" x="{ML - 6}" y="{y + 3.5:.1f}" text-anchor="end">{t:g}</text>')
    g.append(f'<text class="unit" x="{ML - 6}" y="{MT - 8}" text-anchor="end">{html.escape(unit)}</text>')
    # the `first` marker
    xl = ML + step * L1
    g.append(f'<line class="mark" x1="{xl:.1f}" x2="{xl:.1f}" y1="{MT}" y2="{MT + PH}"/>')
    if ref is not None:
        y = yof(ref)
        g.append(f'<line class="ref" x1="{ML}" x2="{W - MR}" y1="{y:.1f}" y2="{y:.1f}"/><text class="reflab" x="{W - MR - 4}" y="{y + 13:.1f}" text-anchor="end">{html.escape(ref_label)}</text>')
    g.append(body(yof))
    # run labels
    for i, r in enumerate(rows):
        g.append(f'<text class="run" transform="translate({xof(i) + 3:.1f},{MT + PH + 8}) rotate(-90)" text-anchor="end">{html.escape(short(r))}</text>')
    g.append('</svg>')
    return f'<section class="chart"><h2>{html.escape(title)}</h2><p class="sub">{sub}</p>{legend}{"".join(g)}</section>'

def legend(items):
    return '<div class="legend">' + ''.join(f'<span><i class="sw {c}"></i>{html.escape(t)}</span>' for c, t in items) + '</div>'

def period_medians(key_fn, yof, cls='med'):
    s = []
    for a, b, p in bands:
        vals = [v for v in (key_fn(rows[i]) for i in range(a, b + 1)) if v is not None]
        if not vals: continue
        m = statistics.median(vals); y = yof(m)
        x0, x1 = ML + step * a + 2, ML + step * (b + 1) - 2
        s.append(f'<line class="{cls}" x1="{x0:.1f}" x2="{x1:.1f}" y1="{y:.1f}" y2="{y:.1f}"/><text class="medlab" x="{x1 - 2:.1f}" y="{y - 5:.1f}" text-anchor="end">median {m:.3g}</text>')
    return ''.join(s)

def dots(series, yof, ymax, hollow_fn=lambda r: False, tipx=lambda r, v: ''):
    """series: [(class, key_fn)]; key_fn(r) → value or None"""
    s = []
    n = len(series)
    for i, r in enumerate(rows):
        for k, (cls, fn, name) in enumerate(series):
            v = fn(r)
            if v is None: continue
            x = xof(i) + (k - (n - 1) / 2) * min(5, step / (n + 1))
            y = yof(v); over = v > ymax
            shape = (f'<path class="{cls} {"hollow" if hollow_fn(r) else ""}" d="M{x:.1f},{y - 5:.1f} l5,9 l-10,0 z"/>' if over else
                     f'<circle class="{cls} {"hollow" if hollow_fn(r) else ""}" cx="{x:.1f}" cy="{y:.1f}" r="4"/>')
            t = tip(r, f'{name}: {v:g}{" (above the axis)" if over else ""}' + (('\n' + tipx(r, v)) if tipx(r, v) else ''))
            s.append(f'<g class="hit" data-tip="{t}"><circle class="hitarea" cx="{x:.1f}" cy="{y:.1f}" r="9"/>{shape}</g>')
    return ''.join(s)

charts = []

# 1 — the clock split: tools + LLM, stacked
def clock_body(ymax):
    def b(yof):
        s = []; bw = max(4, step - 6)
        for i, r in enumerate(rows):
            t, l = num(r['tool_min']), num(r['llm_min'])
            if t is None or l is None: continue
            x = xof(i) - bw / 2; y0 = yof(0); yt = yof(t); yl = yof(t + l)
            est = ' est' if r['_est'] else ''
            tt = tip(r, f'tools {t:g} min + LLM {l:g} min = {t + l:.1f} min')
            s.append(f'<g class="hit" data-tip="{tt}"><rect class="hitarea" x="{x - 2:.1f}" y="{yl - 6:.1f}" width="{bw + 4:.1f}" height="{y0 - yl + 6:.1f}"/>'
                     f'<rect class="s1{est}" x="{x:.1f}" y="{yt:.1f}" width="{bw:.1f}" height="{max(0, y0 - yt):.1f}" rx="2"/>'
                     f'<rect class="s2{est}" x="{x:.1f}" y="{yl:.1f}" width="{bw:.1f}" height="{max(0, yt - yl - 2):.1f}" rx="2"/>'
                     + (f'<text class="never" x="{xof(i):.1f}" y="{yl - 5:.1f}" text-anchor="middle">✕</text>' if r['never'] == '1' else '') + '</g>')
        return ''.join(s)
    return b
ym = nice_max(max(r['_end'] for r in rows if r['_end']))
charts.append(frame('Where the clock goes: tools vs LLM', 'Minutes from t0 to under 10 % at all three widths (✕: never reached — to the stop). Hatched: the split is estimated from the agent\'s tool calls (before Oct 9); solid: exact (TIMING.log). The dashed line is the 5-minute target; the vertical line marks L1, the first run with the one-call pipeline.',
                    ym, 'min', clock_body(ym), legend([('s1', 'tools (instruments)'), ('s2', 'LLM (model turns, reading, writing)')]), 5, 'target 5 min'))

# 2 — time to < 10 %
def t10_body(yof):
    s = [dots([('s1', lambda r: num(r['under10_min']) if r['never'] != '1' else None, 'time to < 10 % (min)')], yof, ym)]
    for i, r in enumerate(rows):
        if r['never'] == '1':
            v = num(r['stop_min']); y = yof(v); x = xof(i)
            s.append(f'<g class="hit" data-tip="{tip(r)}"><circle class="hitarea" cx="{x:.1f}" cy="{y:.1f}" r="9"/><text class="never big" x="{x:.1f}" y="{y + 4:.1f}" text-anchor="middle">✕</text></g>')
    return ''.join(s) + period_medians(lambda r: num(r['under10_min']) if r['never'] != '1' else None, yof)
charts.append(frame('Time to under 10 % pixel difference', 'Minutes from t0 to the first round under 10 % at 360, 1440 and 2560 (●). ✕: never reached — plotted at the stop. Horizontal segments: the period\'s median of the runs that reached it.',
                    ym, 'min', t10_body, legend([('s1', 'reached'), ('never', 'never (at the stop)')]), 5, 'target 5 min'))

# 3 — time to first prototype
ymf = nice_max(max(num(r['first_proto_min']) or 0 for r in rows))
charts.append(frame('Time to the first prototype', 'Minutes from t0 to the first gate round on a built prototype. Before Oct 10 the agent hand-built the page before its first round; from L1 `first` builds it in one call.',
                    ymf, 'min', lambda yof: dots([('s1', lambda r: num(r['first_proto_min']), 'first prototype (min)')], yof, ymf) + period_medians(lambda r: num(r['first_proto_min']), yof)))

# 4 — rounds
ymr = nice_max(max(num(r['rounds_n']) or 0 for r in rows))
def rounds_body(yof):
    s = []; bw = max(4, step - 8)
    for i, r in enumerate(rows):
        v = num(r['rounds_n'])
        if v is None: continue
        x = xof(i) - bw / 2; y = yof(v)
        s.append(f'<g class="hit" data-tip="{tip(r, f"{v:g} gate rounds")}"><rect class="hitarea" x="{x - 2:.1f}" y="{y - 6:.1f}" width="{bw + 4:.1f}" height="{yof(0) - y + 6:.1f}"/><rect class="s1" x="{x:.1f}" y="{y:.1f}" width="{bw:.1f}" height="{yof(0) - y:.1f}" rx="2"/></g>')
    return ''.join(s) + period_medians(lambda r: num(r['rounds_n']), yof)
charts.append(frame('Gate rounds to the stop', 'Gate invocations (any widths) from the first prototype\'s round to the round under target, or to the stop. `first` re-runs count — the loop table counts fewer.', ymr, 'rounds', rounds_body))

# 5 — round 2 / 3 elapsed
yme = nice_max(max(max(num(r['r2_elapsed_min']) or 0, num(r['r3_elapsed_min']) or 0) for r in rows))
charts.append(frame('Rounds 2 and 3 — elapsed time', 'Minutes from the previous round\'s result to this round\'s: the agent\'s reading, deciding and editing plus the gate.',
                    yme, 'min', lambda yof: dots([('s1', lambda r: num(r['r2_elapsed_min']), 'round 2 elapsed (min)'), ('s2', lambda r: num(r['r3_elapsed_min']), 'round 3 elapsed (min)')], yof, yme),
                    legend([('s1', 'round 2'), ('s2', 'round 3')])))

# 6 — round 2 / 3 gate duration
ymt = nice_max(max(max(num(r['r2_tool_s']) or 0, num(r['r3_tool_s']) or 0) for r in rows))
charts.append(frame('Rounds 2 and 3 — gate duration', 'Seconds the gate command itself took (the instrument only). Empty: a table-only round or a gate run in the background.',
                    ymt, 's', lambda yof: dots([('s1', lambda r: num(r['r2_tool_s']), 'round 2 gate (s)'), ('s2', lambda r: num(r['r3_tool_s']), 'round 3 gate (s)')], yof, ymt) + period_medians(lambda r: num(r['r2_tool_s']), yof),
                    legend([('s1', 'round 2'), ('s2', 'round 3')])))

# 7–9 — pixel diff per width: first round, delivered, served
def pct_chart(title, sub, prefix, hollow=lambda r: False):
    ymp = nice_max(max(num(r[f'{prefix}_{W_}']) or 0 for r in rows for W_ in ('360', '1440', '2560')))
    ser = [(f's{k + 1}', (lambda W_: lambda r: num(r[f'{prefix}_{W_}']))(W_), f'{W_} px (%)') for k, W_ in enumerate(('360', '1440', '2560'))]
    return frame(title, sub, ymp, '%', lambda yof: dots(ser, yof, ymp, hollow), legend([('s1', '360'), ('s2', '1440'), ('s3', '2560')]), 10, 'target 10 %')
charts.append(pct_chart('Pixel difference of the first round', 'Per width. Before Oct 10 the first round came after a hand-built page (low %); from L1 it is the machine prototype (high %, minutes earlier). Hollow: L19, whose first round compared against a blank live capture.', 'first', lambda r: r['_first_bad']))
charts.append(pct_chart('Pixel difference at delivery', 'Per width, the round under target (or the last round when never reached — those sit above the line).', 'deliver'))
charts.append(pct_chart('Pixel difference of the served page', 'Per width, the deployed preview (aem.page) gated after the clock.', 'served'))

# the panel: each page's loop run against its re-run on the next-phase code (paired: the page's difficulty cancels)
PAIRS = [('santanderus-home', 'P1'), ('wpp-home', 'P2'), ('rbc-home', 'P3'), ('waters-home', 'P4'), ('lenovo-home', 'P5'), ('lenovo-home', 'P6')]
def pair_html():
    by_slug = {r['slug']: r for r in rows if r['period'] == 'C'}; by_lab = {r['run_label']: r for r in rows if r['period'] == 'D'}
    items = [(slug, lab, num(by_slug[slug]['under10_min']) if slug in by_slug else None, num(by_lab[lab]['under10_min']) if lab in by_lab else None, by_slug.get(slug, {}).get('run_label', '')) for slug, lab in PAIRS]
    items = [x for x in items if x[2] is not None and x[3] is not None]
    if not items: return ''
    PW2, RH = 900, 34; mx = nice_max(max(max(a, b) for _, _, a, b, _ in items)); x = lambda v: 210 + v / mx * PW2
    g = [f'<svg viewBox="0 0 {210 + PW2 + 80} {len(items) * RH + 40}" role="img" aria-label="panel before and after">']
    for t in ticks(mx):
        g.append(f'<line class="grid" x1="{x(t):.1f}" x2="{x(t):.1f}" y1="10" y2="{len(items) * RH + 14}"/><text class="tick" x="{x(t):.1f}" y="{len(items) * RH + 30}" text-anchor="middle">{t:g}</text>')
    g.append(f'<line class="ref" x1="{x(5):.1f}" x2="{x(5):.1f}" y1="10" y2="{len(items) * RH + 14}"/>')
    for i, (slug, lab, a, b, la) in enumerate(items):
        y = 24 + i * RH
        g.append(f'<text class="tick" x="200" y="{y + 4}" text-anchor="end">{html.escape(slug.replace("-home", ""))} · {la} → {lab}</text>')
        g.append(f'<line x1="{x(a):.1f}" x2="{x(b):.1f}" y1="{y}" y2="{y}" stroke="var(--text-muted)" stroke-width="2"/>')
        g.append(f'<g class="hit" data-tip="{html.escape(f"{slug} — loop {la}: {a:g} min → {lab}: {b:g} min ({b - a:+.1f})")}"><circle class="hitarea" cx="{x(a):.1f}" cy="{y}" r="9"/><circle class="s2" cx="{x(a):.1f}" cy="{y}" r="5"/></g>')
        g.append(f'<g class="hit" data-tip="{html.escape(f"{slug} — {lab}: {b:g} min")}"><circle class="hitarea" cx="{x(b):.1f}" cy="{y}" r="9"/><circle class="s1" cx="{x(b):.1f}" cy="{y}" r="5"/></g>')
        g.append(f'<text class="medlab" x="{max(x(a), x(b)) + 10:.1f}" y="{y + 4}">{b - a:+.1f} min</text>')
    g.append('</svg>')
    return ('<section class="chart"><h2>The panel: the same page before and after</h2><p class="sub">Minutes to under 10 % at the three widths. Orange: the page\'s loop run (old code); blue: its re-run on the next-phase code, a fresh repo and a fresh agent. P6 is P5 plus the spec-to-css bands (a field A/B). Dashed: the 5-minute target.</p>'
            + legend([('s2', 'loop run (before)'), ('s1', 'panel re-run (after)')]) + ''.join(g) + '</section>')
charts.insert(1, pair_html())

# 10 — setup
yms = 15
charts.append(frame('Setup time (not on the clock)', 'Minutes from the GitHub repo\'s creation to t0 (boilerplate, content source, Code Sync, installs). ▲ above the axis: travelers 40.1 and ibm 52.1 — repos created in an earlier session, not a setup measurement.',
                    yms, 'min', lambda yof: dots([('s1', lambda r: num(r['setup_min']), 'setup (min)')], yof, yms, lambda r: r['_setup_bad']) + period_medians(lambda r: None if r['_setup_bad'] else num(r['setup_min']), yof)))

# 11 — turns
ymu = nice_max(max(num(r['turns']) or 0 for r in rows))
charts.append(frame('Model turns per run', 'Unique assistant messages of the run\'s agent, the whole run (deploy and write-up included). L21 ran ≈ 20 parallel agents: no single count.',
                    ymu, 'turns', lambda yof: dots([('s1', lambda r: num(r['turns']), 'turns')], yof, ymu) + period_medians(lambda r: num(r['turns']), yof)))

# 12 — page size
ymz = nice_max(max(num(r['sections']) or 0 for r in rows))
charts.append(frame('Page size: live sections', 'Content sections of the live page in the split — context for the clock (a long page with sliders is not a regression). Hover for the document height.',
                    ymz, 'sections', lambda yof: dots([('s1', lambda r: num(r['sections']), 'sections')], yof, ymz, tipx=lambda r, v: f"document height at 1440: {r['doc_h_1440'] or '—'} px")))

# ---- stat tiles
def med(fn, pred):
    v = [fn(r) for r in rows if pred(r) and fn(r) is not None]
    return statistics.median(v) if v else None
reached = lambda r: r['never'] != '1'
best = min((r for r in rows if reached(r)), key=lambda r: num(r['under10_min']))
tiles = [
    ('Best time to < 10 %', f"{num(best['under10_min']):g} min", f"{best['run_label']} {best['slug']}"),
    ('Median to < 10 % · before the loop', f"{med(lambda r: num(r['under10_min']), lambda r: reached(r) and period_of(r) in 'AB'):.3g} min", 'Sep 29 – Oct 4, runs that reached it'),
    ('Median to < 10 % · the loop', f"{med(lambda r: num(r['under10_min']), lambda r: reached(r) and period_of(r) == 'L'):.3g} min", 'L1 – L22, runs that reached it'),
    ('Median tools · before → loop', f"{med(lambda r: num(r['tool_min']), lambda r: period_of(r) in 'AB'):.3g} → {med(lambda r: num(r['tool_min']), lambda r: period_of(r) == 'L'):.3g} min", 'before: estimated · loop: exact'),
    ('Median LLM · before → loop', f"{med(lambda r: num(r['llm_min']), lambda r: period_of(r) in 'AB'):.3g} → {med(lambda r: num(r['llm_min']), lambda r: period_of(r) == 'L'):.3g} min", 'now the larger share of the clock'),
    ('Median to < 10 % · next phase', (lambda v: f"{v:.3g} min" if v is not None else '—')(med(lambda r: num(r['under10_min']), lambda r: reached(r) and period_of(r) == 'D')), 'Oct 11 evening: panel re-runs + new pages'),
    ('Never under 10 %', f"{sum(1 for r in rows if r['never'] == '1')} of {N}", 'stopped by the budget or by hand'),
]
tile_html = '<div class="tiles">' + ''.join(f'<div class="tile"><div class="tl">{html.escape(a)}</div><div class="tv">{html.escape(b)}</div><div class="ts">{html.escape(c)}</div></div>' for a, b, c in tiles) + '</div>'

# ---- table view
cols = ['run_label', 'slug', 't0_utc', 'setup_min', 'first_proto_min', 'under10_min', 'never', 'stop_min', 'served_min', 'rounds_n', 'r2_elapsed_min', 'r3_elapsed_min', 'r2_tool_s', 'r3_tool_s', 'tool_min', 'llm_min', 'split_src',
        'first_360', 'first_1440', 'first_2560', 'deliver_360', 'deliver_1440', 'deliver_2560', 'served_360', 'served_1440', 'served_2560', 'turns', 'sections', 'doc_h_1440', 'notes']
table = '<details><summary>Table view (all 49 runs, every metric)</summary><div class="tw"><table><thead><tr>' + ''.join(f'<th>{c}</th>' for c in cols) + '</tr></thead><tbody>' + \
        ''.join('<tr>' + ''.join(f'<td>{html.escape(r[c] or "")}</td>' for c in cols) + '</tr>' for r in rows) + '</tbody></table></div></details>'

css = """
.viz-root{color-scheme:light;--surface-1:#fcfcfb;--surface-2:#f3f2ef;--text-primary:#0b0b0b;--text-secondary:#52514e;--text-muted:#7a7975;--grid:#e6e5e1;--axis:#c9c8c3;
 --series-1:#2a78d6;--series-2:#eb6834;--series-3:#1baf7a;--never:#52514e;--target:#0b0b0b;--band:#f0efec}
@media (prefers-color-scheme:dark){:root:where(:not([data-theme="light"])) .viz-root{color-scheme:dark;--surface-1:#1a1a19;--surface-2:#232321;--text-primary:#f0efec;--text-secondary:#c3c2b7;--text-muted:#8f8e88;--grid:#2e2e2b;--axis:#45453f;
 --series-1:#3987e5;--series-2:#d95926;--series-3:#199e70;--never:#c3c2b7;--target:#f0efec;--band:#232321}}
:root[data-theme="dark"] .viz-root{color-scheme:dark;--surface-1:#1a1a19;--surface-2:#232321;--text-primary:#f0efec;--text-secondary:#c3c2b7;--text-muted:#8f8e88;--grid:#2e2e2b;--axis:#45453f;--series-1:#3987e5;--series-2:#d95926;--series-3:#199e70;--never:#c3c2b7;--target:#f0efec;--band:#232321}
body{margin:0;background:var(--surface-1)}
.viz-root{font:13px/1.45 system-ui,-apple-system,Segoe UI,sans-serif;color:var(--text-primary);background:var(--surface-1);max-width:1220px;margin:0 auto;padding:28px 20px 60px}
h1{font-size:22px;margin:0 0 4px}.lede{color:var(--text-secondary);margin:0 0 20px;max-width:900px}
.tiles{display:grid;grid-template-columns:repeat(7,1fr);gap:10px;margin:0 0 26px}.tile{background:var(--surface-2);border-radius:8px;padding:12px 14px}
.tl{color:var(--text-secondary);font-size:12px}.tv{font-size:22px;font-weight:600;margin:4px 0 2px;font-variant-numeric:tabular-nums}.ts{color:var(--text-muted);font-size:11.5px}
.chart{margin:0 0 30px}.chart h2{font-size:15px;margin:0 0 2px}.sub{color:var(--text-secondary);margin:0 0 6px;max-width:1000px;font-size:12.5px}
.legend{display:flex;gap:16px;color:var(--text-secondary);font-size:12px;margin:0 0 2px}.legend span{display:inline-flex;align-items:center;gap:6px}
.sw{display:inline-block;width:10px;height:10px;border-radius:50%}.sw.s1{background:var(--series-1)}.sw.s2{background:var(--series-2)}.sw.s3{background:var(--series-3)}
.sw.never{background:none;width:auto;height:auto;border-radius:0;font-style:normal;color:var(--never)}.sw.never::before{content:"✕"}
svg{width:100%;height:auto;display:block;overflow:visible}
.band{fill:var(--band)}.bandlab{fill:var(--text-muted);font-size:11px}
.medlab,.reflab{paint-order:stroke;stroke:var(--surface-1);stroke-width:3.5px;stroke-linejoin:round}.grid{stroke:var(--grid);stroke-width:1}.tick,.unit{fill:var(--text-muted);font-size:11px;font-variant-numeric:tabular-nums}
.run{fill:var(--text-muted);font-size:10px}.mark{stroke:var(--text-secondary);stroke-width:1;stroke-dasharray:2 3}
.ref{stroke:var(--target);stroke-width:1.2;stroke-dasharray:5 4;opacity:.7}.reflab{fill:var(--text-secondary);font-size:11px}
.med{stroke:var(--text-secondary);stroke-width:2;opacity:.55}.medlab{fill:var(--text-secondary);font-size:10.5px;font-variant-numeric:tabular-nums}
circle.s1,path.s1,rect.s1{fill:var(--series-1)}circle.s2,path.s2,rect.s2{fill:var(--series-2)}circle.s3,path.s3,rect.s3{fill:var(--series-3)}
circle,path.s1,path.s2,path.s3{stroke:var(--surface-1);stroke-width:2}
.hollow{fill:var(--surface-1)!important;stroke-width:2}.hollow.s1{stroke:var(--series-1)}.hollow.s2{stroke:var(--series-2)}.hollow.s3{stroke:var(--series-3)}
rect.est{fill-opacity:.45}rect.s1.est{fill:url(#hatch1)}rect.s2.est{fill:url(#hatch2)}
.never{fill:var(--never);font-size:11px;font-weight:700}.never.big{font-size:14px}
.hitarea{fill:transparent;stroke:none}.med,.medlab,.ref,.reflab,.band,.bandlab,.mark,.grid,.tick,.unit,.run{pointer-events:none}.hit:hover circle:not(.hitarea),.hit:hover rect:not(.hitarea){filter:brightness(1.12)}
#tip{position:fixed;pointer-events:none;background:var(--text-primary);color:var(--surface-1);font-size:12px;padding:7px 9px;border-radius:6px;white-space:pre-line;max-width:320px;display:none;z-index:9}
details{margin-top:10px}summary{cursor:pointer;color:var(--text-secondary)}.tw{overflow:auto;max-height:560px;margin-top:8px}
table{border-collapse:collapse;font-size:11.5px;font-variant-numeric:tabular-nums}th,td{border-bottom:1px solid var(--grid);padding:4px 6px;text-align:left;white-space:nowrap}th{position:sticky;top:0;background:var(--surface-2)}
"""
defs = '<svg width="0" height="0" style="position:absolute"><defs>' + ''.join(
    f'<pattern id="hatch{k}" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="var(--series-{k})" fill-opacity=".35"/><line x1="0" y1="0" x2="0" y2="5" stroke="var(--series-{k})" stroke-width="2.4"/></pattern>' for k in (1, 2)) + '</defs></svg>'
js = """const t=document.getElementById('tip');document.addEventListener('mousemove',e=>{const g=e.target.closest('[data-tip]');if(!g){t.style.display='none';return}
t.textContent=g.dataset.tip;t.style.display='block';const r=t.getBoundingClientRect();let x=e.clientX+14,y=e.clientY+14;if(x+r.width>innerWidth-8)x=e.clientX-r.width-14;if(y+r.height>innerHeight-8)y=e.clientY-r.height-14;t.style.left=x+'px';t.style.top=y+'px'});"""
page = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>stardust-lite — first-page runs over time</title><style>{css}</style></head>
<body><div class="viz-root">{defs}<h1>First-page prototype runs, oldest to newest</h1>
<p class="lede">{N} runs, 2026-09-29 → 2026-10-11, one page each, migrated to Edge Delivery Services and gated by pixel difference at 360 / 1440 / 2560 against the live page. t0 is the first instrument; setup is not on the clock. Source: <code>loop/metrics/runs.csv</code>.</p>
{tile_html}{''.join(charts)}{table}<div id="tip"></div></div><script>{js}</script></body></html>"""
out.write_text(page)
print(f'{out} — {len(charts)} charts, {N} runs')
