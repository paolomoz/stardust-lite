#!/usr/bin/env python3
"""Build loop/metrics/part-C.csv (period C) per loop/metrics/SCHEMA.md.
Times come from each case's TIMING.log (timing_c.parse); round percentages are transcribed from the case TIMELINE.md / NOTES.md
(None = width not run / not printed). Site facts from site_c.jsonl, turns from agents_c.jsonl."""
import csv, json, datetime as dt, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from timing_c import parse, t0_of  # noqa: E402

W = Path(__file__).parent
OUT = W.parent / 'part-C.csv'
N = None

# gates: [(TIMING label, (360, 1440, 2560))] from the first prototype's round on; stop_idx = index of the round under target
# (None = never); stop_at = HH:MM:SS when the clock stopped (never runs); served = (label, pcts)
RUNS = [
    dict(slug='si-home', label='I1', code='35f9b73', turns_agent='agent-ada68ac306cdb7fd7',
         gates=[('gate-r1-3w', (N, 14.32, N)), ('gate-r1-widths', (39.15, 19.52, 28.66)), ('gate-r2', (N, 11.80, N)),
                ('gate-r3', (N, 12.12, N)), ('gate-r4', (N, 8.13, N)), ('gate-r5', (N, 4.25, N)),
                ('gate-r6-3w', (35.62, 3.82, 7.00)), ('gate-r7-3w', (25.42, 6.18, 12.69)),
                ('gate-r9-3w-probes', (27.76, 3.44, 12.09)), ('gate-r9-2560', (N, N, 7.04)), ('gate-r10-3w', (27.76, 3.44, 4.51))],
         first=(39.15, 14.32, 28.66), stop_idx=None, stop_label='gate-r10-3w', served=('gate-served', (27.76, 3.44, 4.51)),
         notes='round 1 and r2-r5 at 1440 only (first_360/2560 from r1 re-run at 3 widths, 20.5 min); stopped on budget after r10; '
               'loop table counts first prototype at 17.3 (served)'),
    dict(slug='acs-about', label='I2', code='d58b9f8', turns_agent='agent-a2921d9ec2389b273',
         gates=[('gate-r1', (31.55, 14.54, 10.38)), ('gate-r2', (37.26, 8.43, 8.95)), ('gate-r3', (14.25, 8.39, 8.93)),
                ('gate-r4', (13.82, 10.17, 9.93)), ('gate-r5', (12.56, 8.27, 8.86)), ('gate-r6', (11.95, 8.27, 8.86)),
                ('gate-r7', (11.80, 8.27, 8.86)), ('gate-r8', (9.39, 8.27, 8.86))],
         stop_idx=7, served=('gate-served', (9.35, 8.25, 8.84)),
         notes='loop table names first prototype 15.8 (harness built); first round 17.1; fonts were WAF HTML in r1 (refetched 104 s)'),
    dict(slug='continental-home', label='I3', code='0decf6c', turns_agent='agent-a81be47f0a75f7133',
         gates=[('gate-r1', (28.32, 10.96, 12.78)), ('gate-r2', (19.88, 10.55, 15.57)), ('gate-r3', (13.27, 13.74, 16.14)),
                ('gate-r4', (13.27, 4.36, 10.09)), ('gate-r5', (12.86, 4.05, 10.09)), ('gate-r6', (12.86, 4.85, 10.40)),
                ('gate-r7', (9.27, 4.97, 9.49))],
         stop_idx=6, served=('gate-served', (8.97, 4.91, 9.34)),
         notes='loop table names first prototype 11.2 (harness built); r5 2560 build capture failed (compared previous png)'),
    dict(slug='marriott-home', label='L1', code='e0e3428', turns_agent='agent-a6e4d6682e9532dfa',
         gates=[('first3', (79, 64.84, 46.76)), ('r1', (23.68, 34.79, 31.28)), ('r2', (22.56, 22.7, 23.18)), ('r3', (23.08, 23.92, 23.74)),
                ('r4', (20.83, 19.79, 20.94)), ('r5', (18.76, 15.53, 13.54)), ('r6', (17.87, 11.91, 10.83)), ('r7', (13.98, 9.1, 8.29)),
                ('r8', (12.27, 8.92, 8.19)), ('r9', (11.62, 8.92, 8.19)), ('r10', (7.74, 8.39, 7.95))],
         stop_idx=10, served=('served', (7.82, 8.35, 8.11)),
         notes='3 x first: first and first2 failed before a round (no nav/footer; busy port); first round = first3'),
    dict(slug='publicis-home', label='L2', code='eb6b282', turns_agent='agent-abe18de6f1319943a',
         gates=[('first4', (72.37, 60.4, 48.3)), ('r1', (48.17, 2.62, 1.29)), ('r2', (3.63, 2.62, 1.29))],
         stop_idx=2, served=('served', (3.53, 2.68, 1.28)),
         notes='4 x first: 3 failed before a round (split, footer, port); doc_h 900 = page scrolls inside main'),
    dict(slug='toryburch-home', label='L3', code='16f69d6', turns_agent='agent-ae61d92f6d7f30a6e',
         gates=[('first', (68.6, 81.35, 82.05)), ('first-2', (77.81, 81.58, 78.7)), ('first-3', (62.4, 82.89, 79.07)),
                ('r1', (63.99, 10.97, 11.17)), ('r2', (40.46, 3.09, 11.48)), ('r3', (20.14, 3.09, 11.48)), ('r4', (5.05, 3.09, 0.32))],
         stop_idx=6, served=('served', (4.87, 3.09, 0.34)),
         notes='rounds 2-3 are first re-runs (popups as sections); loop table names first prototype 9.6 (62/83/79)'),
    dict(slug='deloitte-home', label='L4', code='c9bd927', turns_agent='agent-af051e07cb227188c',
         gates=[('first', (72.38, 74.37, 74.81)), ('first2', (81.18, 91.47, 91.15)), ('first3', (81.18, 91.47, 91.15)),
                ('r1', (65.28, 70.56, 70.15)), ('r2', (22.50, 10.22, 13.68)), ('r3', (7.64, 4.96, 8.00))],
         stop_idx=5, served=('served', (7.70, 4.97, 8.01)),
         notes='rounds 2-3 are first re-runs (split); loop table names first prototype 6.9 (81/91/91); r1 without harness rebuild'),
    dict(slug='bms-home', label='L5', code='54f7deb', turns_agent='agent-a11888c7c8e114e17',
         gates=[('first', (33.75, 30.08, 17.27)), ('r1', (28.79, 11.71, 6.95)), ('r2', (23.69, 8.56, 4.82)), ('r3', (20.26, 10.50, 5.92)),
                ('r4', (6.99, 2.92, 1.62))],
         stop_idx=4, served=('served', (7.01, 2.92, 1.61)), notes=''),
    dict(slug='equitable-home', label='L6', code='36c5b34', turns_agent='agent-af5a30fe65db72ef7',
         gates=[('first', (58.19, 72.36, 59.55)), ('first-sections', (50.81, 71.97, 72.87)), ('first-triage', (34.31, 39.07, 45.66)),
                ('r1', (20.13, 24.76, 18.35)), ('r2', (16.35, 4.54, 2.93)), ('r3', (3.35, 2.10, 1.21))],
         stop_idx=5, served=('served', (3.36, 2.08, 1.19)),
         notes='rounds 2-3 are first re-runs (split, triage edits); loop table names first prototype 4.5 (34/39/46)'),
    dict(slug='wpp-home', label='L7', code='07bd330', turns_agent='agent-ab117237ec9065cbe',
         gates=[('first', (59.12, 75.57, 52.69)), ('r1', (4.81, 3.94, 2.64))],
         stop_idx=1, served=('served', (4.80, 3.92, 2.63)), notes='single round after first; no r3'),
    dict(slug='pgatour-home', label='L8', code='f5d4a51', turns_agent='agent-ac1811018e6726711',
         gates=[('first', (33.37, 43.27, 22.67)), ('first-retriage', (47.97, 35.57, 18.99)), ('r1', (16.22, 14.40, 6.38)),
                ('r2', (26.48, 21.37, 9.98)), ('r3', (9.40, 10.35, 4.43)), ('r4', (9.39, 5.94, 1.94))],
         stop_idx=5, served=('served', (9.48, 5.96, 1.95)),
         notes='round 2 is a first re-run (63 rows dropped); loop table names first prototype 5.5; sections = 10 of 75 rows (63 drops)'),
    dict(slug='revlon-home', label='L9', code='b250798', turns_agent='agent-a226c549ffbe22617',
         gates=[('first', (78.42, 58.73, 43.20)), ('r1', (20.61, 16.69, 9.38)), ('r2', (8.95, 1.70, 0.96))],
         stop_idx=2, served=('served', (8.83, 1.63, 0.92)), notes=''),
    dict(slug='sherwinwilliams-home', label='L10', code='c6073fd', turns_agent='agent-a889db4a49345b519',
         gates=[('first', (43.92, 44.76, 36.55)), ('first-sections', (38.11, 41.99, 34.57)), ('first-main', (46.08, 39.84, 38.32)),
                ('r1', (50.93, 40.41, 39.54)), ('r2', (38.11, 34.89, 41.15)), ('r3', (28.48, 13.57, 30.13)), ('r4', (26.45, 16.17, 11.33)),
                ('r5', (25.57, 7.15, 6.88)), ('r6', (13.42, 7.15, 6.88)), ('r7', (13.41, 7.15, 6.88)), ('r8', (10.26, 7.15, 6.88)),
                ('r9', (10.25, 7.15, 6.88)), ('r10', (10.26, 7.16, 6.88)), ('r11', (10.19, 7.15, 6.88)), ('r12', (7.02, 4.65, 5.70))],
         stop_idx=14, served=('served', (7.03, 4.67, 5.71)),
         notes='rounds 2-3 are first re-runs (no <main>: split guessed); loop table names first prototype 5.2'),
    dict(slug='intel-home', label='L11', code='5611ea7', turns_agent='agent-a0a4534c82d88eec1',
         gates=[('first', (44.33, 65.32, 62.90)), ('first-sections', (32.71, N, N)), ('r1', (14.88, 5.90, 4.86)), ('r2', (14.28, 5.74, 4.93)),
                ('r3', (12.12, 5.52, 4.88)), ('r4', (9.67, 5.31, 5.10))],
         stop_idx=5, served=('served2', (9.66, 5.52, 5.15)),
         notes='round 2 a first re-run (split), 360 kept only; loop table names first prototype 8.8; served = 2nd served gate (1st 15.25/6.81/5.86)'),
    dict(slug='nfl-home', label='L12', code='2dc1ee6', turns_agent='agent-a73728e71a7bbf523',
         gates=[('first', (54.33, 53.56, 39.89)), ('first-sections', (54.62, 51.58, 38.78)), ('r1', (22.47, 12.91, 7.92)),
                ('r2', (22.16, 12.16, 7.49)), ('r3', (18.70, 10.93, 7.09)), ('r4', (23.74, 8.30, 5.09)), ('r5', (14.84, 3.10, 2.04)),
                ('r6', (12.87, 3.11, 2.05)), ('r7', (17.41, 3.10, 2.05)), ('r8', (31.28, 49.25, 42.23)), ('r9', (4.38, 3.20, 2.10))],
         stop_idx=10, served=('served', (4.67, 3.22, 2.11)),
         notes='round 2 a first re-run (split); loop table names first prototype 4.4; r8 broken (original doc harnessed)'),
    dict(slug='nike-home', label='L13', code='9c75734', turns_agent='agent-ab8c4217720b8d881',
         gates=[('first', (75.93, 45.15, 52.50)), ('first-redo', (73.77, 36.37, 52.97)), ('r1', (53.78, 23.99, 67.56)),
                ('r2', (31.31, 2.31, 1.59)), ('r3', (29.35, 0.99, 0.85)), ('r4', (3.61, 0.99, 0.85))],
         stop_idx=5, served=('served', (3.65, 1.02, 0.90)),
         notes='round 2 a first re-run (triage drop); loop table names first prototype 5.2'),
    dict(slug='merck-home', label='L14', code='5d94383', turns_agent='agent-a0a3f9873195bb94b',
         gates=[('first', (64.43, 40.70, 33.62)), ('r1', (39.21, 38.46, 24.33)), ('r2', (40.94, 36.60, 23.33)), ('r3', (38.89, 34.18, 23.34)),
                ('r3-alt-origin', N), ('r4', (38.00, 34.18, 21.70))],
         stop_idx=None, stop_label='r4', served=('served-gate2', (37.98, 33.91, 21.54)),
         notes='clock stopped by hand at r4; r3-alt-origin (stitched origin, evidence 26.17/15.85/7.32) counted as a round, not for under10; served = 2nd served gate'),
    dict(slug='mheducation-home', label='L15', code='fc2acb9', turns_agent='agent-ad876aee0cb7edb7d',
         gates=[('first', (33.45, 49.45, 47.55)), ('r1', (20.53, 15.97, 15.44)), ('r2', (15.20, 1.98, 1.19)), ('r3', (14.72, 1.91, 1.15)),
                ('r4', (14.72, 1.91, 1.15)), ('r5', (14.73, 1.90, 1.14)), ('r6', (14.73, 1.90, 1.14))],
         stop_idx=None, stop_label='r6', served=('served', (14.79, 1.91, 1.14)),
         notes='clock ended at r6 without stop: 360 held by an autoplay carousel on another slide'),
    dict(slug='santanderus-home', label='L16', code='904d802', turns_agent='agent-a90f2833a07ebdf9e',
         gates=[('first', (54.04, 51.96, 46.13)), ('r1', (11.04, 10.17, 11.24)), ('r2', (4.81, 2.70, 2.19))],
         stop_idx=2, served=('served', (4.82, 2.71, 2.19)), notes=''),
    dict(slug='unitedrentals-home', label='L17', code='b8b2317', turns_agent='agent-a4fc14d18c69dd860',
         gates=[('first', (47.95, 50.35, 50.77)), ('r1', (24.98, 27.58, 46.01)), ('r2', (29.38, 9.91, 19.56)), ('r3', (24.19, 15.55, 13.96)),
                ('r4', (23.72, 9.91, 13.71)), ('r5', (26.86, 8.74, 11.88)), ('r6', (19.22, 8.63, 11.85)), ('r7', (19.20, 8.63, 12.28)),
                ('r8', (15.15, 8.63, 11.38)), ('r9', (15.16, 8.34, 7.63)), ('r10', (20.71, 8.34, 7.63)), ('r11', (15.04, 8.34, 7.63)),
                ('r12', (14.69, 9.23, 8.57)), ('r13', (14.62, 9.23, 8.57)), ('r14', (14.27, 8.34, 7.63)), ('r15', (13.69, 8.34, 7.63)),
                ('r16', (10.77, 8.34, 7.63)), ('r17', (10.08, 8.34, 7.63)), ('r18', (10.07, 8.34, 7.63)), ('r19', (9.37, 7.78, 6.72))],
         stop_idx=19, served=('served', (9.38, 7.78, 6.73)), notes=''),
    dict(slug='rbc-home', label='L18', code='b331bbf', turns_agent='agent-a03590d5c1970ece3',
         gates=[('first', (38.77, 40.88, 30.54)), ('r1', (15.29, 8.36, 6.12)), ('r2', (21.33, 8.10, 5.97)), ('r3', (13.38, 8.06, 5.95)),
                ('r4', (7.55, 8.04, 5.94))],
         stop_idx=4, served=('served', (7.64, 8.06, 5.95)), notes=''),
    dict(slug='wyndham-home', label='L19', code='2c1fabc', turns_agent='agent-ad8e05e3ba1d3ddae',
         gates=[('first', (44.49, 49.59, 49.09)), ('first-2', (53.5, 76.95, 75.88)), ('r1', (32.94, 43.89, 49.68)), ('r2', (14.67, 16.09, 17.75)),
                ('r3', (14.25, 8.95, 12.13)), ('r4', (13.26, 8.95, 11.35)), ('r5', (13.26, 8.95, 9.00)), ('r6', (13.06, 8.95, 9.00)),
                ('r7', (13.07, 8.95, 9.00)), ('r8', (13.10, 8.95, 9.00)), ('r9', (13.05, 8.95, 9.00)), ('r10', (12.92, 8.97, 9.02))],
         stop_idx=None, stop_at='06:48:42', served=('served-2', (12.99, 9.02, 9.02)),
         notes='first round void (live capture blank, anti-flicker); table names 5.5 (53.5/77/76); stop declared 28.4 after r10; served = 2nd served gate'),
    dict(slug='waters-home', label='L20', code='78fcbe3', turns_agent='agent-a38346544e5682ada',
         gates=[('first', (56.6, 42.82, 46.09)), ('r1', (21.92, 6.43, 4.73)), ('r2', (12.51, 6.45, 4.75)), ('r3', (8.68, 5.19, 4.63))],
         stop_idx=3, served=('served-gate2', (8.5, 5.18, 4.62)),
         notes='served = 2nd served gate after a post-clock doc fix (1st 46.15/54.92/60.58: empty section stripped)'),
    dict(slug='omnicom-home', label='L21', code='468cb35', turns_agent=None, stall=('08:26:23', '10:08:43'),
         gates=[('first', (54.52, 62.11, 50.47)), ('r1', (33.8, 32.6, 41.2)), ('r2', (33.8, 32.6, 41.2)), ('r3', (31.5, 11.9, 14.7)),
                ('r4', (21.6, 6.8, 11.2)), ('r5', (17.8, 6.8, 7.7)), ('r6', (12.4, N, N)), ('r7', N), ('r8', (12.2, N, N)),
                ('r9', (11.83, 6.77, 7.65))],
         stop_idx=None, stop_at='10:52:07', served=(None, (11.72, 6.59, 7.44)),
         notes='102.3-min stall (08:26:23-10:08:43) excluded from all minutes; fan-out (~20 owner agents): turns blank; gate fixed mid-run at r2; stopped by hand; no served minute'),
    dict(slug='lenovo-home', label='L22', code='6e05b5f', turns_agent='agent-ad2ac0bd0a819519d',
         gates=[('first', (34.45, 48.87, 30.20)), ('first2', (32.09, 47.92, 30.27)), ('r1', (26.95, 14.74, 24.59)), ('r2', (27.32, 14.58, 12.76)),
                ('r3', (24.89, 11.57, 10.91)), ('r4', (15.16, 9.99, 10.57)), ('r5', (15.25, 9.99, 10.72)), ('r6', (16.84, 9.99, 9.99)),
                ('r7', (20.40, 9.99, 9.99)), ('r8', (16.45, 9.99, 9.99)), ('r9', (8.24, 3.45, 7.24))],
         stop_idx=10, served=('served', (11.13, 4.82, 9.04)),
         notes='digest omitted widths under 10 in r4-r8: under10_1440 r4, under10_2560 r6 inferred from the omission; round 2 a first re-run (drops); served 360 11.13 over target'),
]

HEADER = ('slug,period,run_label,t0_utc,site_url,code,setup_min,setup_src,first_proto_min,under10_min,never,stop_min,under10_360_min,'
          'under10_1440_min,under10_2560_min,served_min,rounds_n,r2_elapsed_min,r3_elapsed_min,r2_tool_s,r3_tool_s,tool_min,llm_min,'
          'split_src,first_360,first_1440,first_2560,deliver_360,deliver_1440,deliver_2560,served_360,served_1440,served_2560,turns,'
          'sections,doc_h_1440,notes').split(',')

site = {json.loads(l)['slug']: json.loads(l) for l in (W / 'site_c.jsonl').read_text().splitlines() if l.strip()}
turns = {json.loads(l)['agent']: json.loads(l)['turns'] for l in (W / 'agents_c.jsonl').read_text().splitlines() if l.strip()}


def f1(x):
    import math
    return '' if x is None else f'{math.floor(x * 10 + 0.5 + 1e-9) / 10:.1f}'  # half up (10.45 -> 10.5)


def pct(x):
    return '' if x is None else (f'{x:g}')


rows = []
for r in RUNS:
    ev = parse(r['slug'])
    t0 = t0_of(ev)
    day = t0.date()

    def at(hh):
        t = dt.datetime.combine(day, dt.time.fromisoformat(hh))
        return t + dt.timedelta(days=1) if t < t0 else t

    stall = 0.0
    if r.get('stall'):
        s0, s1 = at(r['stall'][0]), at(r['stall'][1])
        stall = (s1 - s0).total_seconds() / 60

    def mins(t):
        m = (t - t0).total_seconds() / 60
        if r.get('stall') and t >= at(r['stall'][1]):
            m -= stall
        return m

    by = {}
    for e in ev:
        by.setdefault(e['label'], []).append(e)

    def ev_of(lab):
        return by[lab][0]

    g = [(ev_of(lab), p) for lab, p in r['gates']]
    ends = [mins(e['end']) for e, _ in g]
    first_p = r.get('first') or g[0][1]
    if r['stop_idx'] is not None:
        stop_t = g[r['stop_idx']][0]['end']
        n_rounds = r['stop_idx'] + 1
    elif r.get('stop_at'):
        stop_t = at(r['stop_at'])
        n_rounds = len(g)
    else:
        stop_t = ev_of(r['stop_label'])['end']
        n_rounds = [lab for lab, _ in r['gates']].index(r['stop_label']) + 1
    stop_m = mins(stop_t)
    gi = g[:n_rounds]
    under = []
    for wi in range(3):
        u = None
        for (e, p) in gi:
            if p and p[wi] is not None and p[wi] < 10:
                u = mins(e['end'])
                break
        under.append(u)
    deliver = next(p for _, p in reversed(gi) if p and all(x is not None for x in p))
    tool_s = sum((e['dur'] or 0) for e in ev if not e['label'].startswith('setup') and e['start'] and e['start'] >= t0 and e['end'] <= stop_t)
    served_lab, served_p = r['served']
    served_m = mins(ev_of(served_lab)['end']) if served_lab else None
    s = site[r['slug']]
    created = dt.datetime.strptime(s['created_at'], '%Y-%m-%dT%H:%M:%SZ')
    setup = (t0 - created).total_seconds() / 60
    never = r['stop_idx'] is None
    row = dict(
        slug=r['slug'], period='C', run_label=r['label'], t0_utc=t0.strftime('%Y-%m-%dT%H:%M:%SZ'), site_url=s['url'], code=r['code'],
        setup_min=f1(setup), setup_src='repo-created', first_proto_min=f1(ends[0]),
        under10_min='' if never else f1(stop_m), never='1' if never else '0', stop_min=f1(stop_m),
        under10_360_min=f1(under[0]), under10_1440_min=f1(under[1]), under10_2560_min=f1(under[2]), served_min=f1(served_m),
        rounds_n=n_rounds,
        r2_elapsed_min=f1(ends[1] - ends[0]) if n_rounds >= 2 else '', r3_elapsed_min=f1(ends[2] - ends[1]) if n_rounds >= 3 else '',
        r2_tool_s=g[1][0]['dur'] if n_rounds >= 2 else '', r3_tool_s=g[2][0]['dur'] if n_rounds >= 3 else '',
        tool_min=f1(tool_s / 60), llm_min=f1(stop_m - tool_s / 60), split_src='exact',
        first_360=pct(first_p[0]), first_1440=pct(first_p[1]), first_2560=pct(first_p[2]),
        deliver_360=pct(deliver[0]), deliver_1440=pct(deliver[1]), deliver_2560=pct(deliver[2]),
        served_360=pct(served_p[0]), served_1440=pct(served_p[1]), served_2560=pct(served_p[2]),
        turns=turns.get(r['turns_agent'], '') if r['turns_agent'] else '',
        sections=s.get('content', ''), doc_h_1440=s.get('doc_h_1440', ''), notes=r['notes'])
    if len(row['notes']) > 200:
        print('NOTE TOO LONG', r['slug'], len(row['notes']), file=sys.stderr)
    rows.append(row)

with OUT.open('w', newline='') as fh:
    w = csv.DictWriter(fh, fieldnames=HEADER)
    w.writeheader()
    w.writerows(rows)
print(OUT, len(rows))
