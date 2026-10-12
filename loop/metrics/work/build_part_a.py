"""Build loop/metrics/part-A.csv (period A runs, 2026-09-29/30 -> 10-01).

Facts per run were read from: the case REPORT/REGISTER (round values), the run agent's transcript (tool calls,
gate results, unique assistant message ids), the site work dir (gate/*.log birth->mtime, clock.txt), batch-7/state.json,
and `gh api repos/<owner>/<repo> --jq .created_at`. All times below are UTC.
tool_min = union of tool-call walls in the transcript (serial batches) + background instrument logs (*.log birth->mtime)
in the work dir, over [t0, under10 or stop] (stalls excluded). Run: python3 -I build_part_a.py
"""
import json, os, glob, csv, subprocess
from datetime import datetime, timezone

HOME = os.path.expanduser('~')
PROJ = HOME + '/.claude/projects'
B7 = PROJ + '/-Users-paolo-stardust-2026-08-batch-7/c73c8c2c-6e44-4136-b39c-58527dbc782d/subagents/'
W = '/Users/paolo/stardust/2026-08/'
OUT = '/Users/paolo/stardust/stardust-lite/loop/metrics/part-A.csv'

def T(s):
    return datetime.fromisoformat(s.replace('Z', '+00:00')) if 'T' in s else None

def tx_intervals(f, lo=None, hi=None):
    """tool-call walls (serial execution inside one assistant message) and unique assistant ids in [lo, hi]."""
    uses, res, ids = {}, {}, set()
    for line in open(f):
        try: o = json.loads(line)
        except Exception: continue
        ts = o.get('timestamp'); m = o.get('message') or {}
        if not ts: continue
        t = T(ts)
        if o.get('type') == 'assistant':
            if m.get('id') and (lo is None or lo <= t <= hi): ids.add(m['id'])
            for c in m.get('content') or []:
                if isinstance(c, dict) and c.get('type') == 'tool_use':
                    uses[c['id']] = (t, m.get('id'))
        elif o.get('type') == 'user' and isinstance(m.get('content'), list):
            for c in m['content']:
                if isinstance(c, dict) and c.get('type') == 'tool_result':
                    res[c.get('tool_use_id')] = t
    rows = sorted((res[k], st, mid) for k, (st, mid) in uses.items() if k in res)
    last, iv = {}, []
    for end, st, mid in rows:
        s = max(st, last.get(mid, st)); last[mid] = end
        iv.append((s, end))
    return iv, ids

def log_intervals(dirs):
    iv = []
    for d in dirs:
        for f in glob.glob(d + '/**/*.log', recursive=True):
            st = os.stat(f)
            b, m = st.st_birthtime, st.st_mtime
            name = os.path.basename(f)
            if 'serve' in name or m - b > 600:  # static servers / long pollers are not instrument time
                continue
            if m - b > 1:
                iv.append((datetime.fromtimestamp(b, timezone.utc), datetime.fromtimestamp(m, timezone.utc)))
    return iv

def union_min(iv, windows):
    tot = 0.0
    for lo, hi in windows:
        cl = sorted((max(a, lo), min(b, hi)) for a, b in iv if b > lo and a < hi)
        cur = None
        for a, b in cl:
            if cur and a <= cur[1]:
                cur[1] = max(cur[1], b)
            else:
                if cur: tot += (cur[1] - cur[0]).total_seconds()
                cur = [a, b]
        if cur: tot += (cur[1] - cur[0]).total_seconds()
    return tot / 60

RUNS = [
 dict(slug='baincapital-home', site='https://www.baincapital.com/', code='', repo='2026-09-29T17:08:01Z',
      tx=PROJ + '/-Users-paolo-stardust-2026-08-baincapital-2/31f1a706-796b-4957-8f05-d67c535e21c4.jsonl', tx_win=None,
      logs=[W + 'baincapital-2/sdt-baincapital/.work'],
      t0='2026-09-29T17:10:04Z', first='2026-09-29T17:47:41Z', under10=None, never=1, stop='2026-09-30T04:09:59Z',
      stall=('2026-09-29T18:27:14Z', '2026-09-30T04:04:03Z'),
      u360=None, u1440=None, u2560=None, served='2026-09-30T04:09:59Z', rounds=7,
      r=['2026-09-29T17:47:41Z', '2026-09-29T17:57:20Z', '2026-09-29T18:09:52Z'], r2s=None, r3s=None,
      first_p=(65.49, 57.6, 62.86), deliver=(34.56, 27.19, 23.29), served_p=(34.42, 23.8, 23.6),
      sections=8, doc=8177,
      notes='v1 run (pre stardust-lite); overnight pause 20:27-06:04 CEST excluded; r1 1440 only, first_360/2560 from r2; 7 gate calls (case says 6 rounds)'),
 dict(slug='fidelity-home', site='https://www.fidelity.com/', code='', repo='2026-09-30T08:45:41Z',
      tx=PROJ + '/-Users-paolo-stardust-2026-08-blocks-first/1a9c7c2e-c420-4a34-b846-be9a78a6d7d7.jsonl',
      tx_win=('2026-09-30T08:43:00Z', '2026-09-30T10:06:00Z'),
      logs=[W + 'blocks-first/cases/fidelity-home'],
      t0='2026-09-30T08:46:14Z', first='2026-09-30T09:37:06Z', under10=None, never=1, stop='2026-09-30T10:02:33Z', stall=None,
      u360=None, u1440='2026-09-30T09:37:06Z', u2560='2026-09-30T09:37:06Z', served='2026-09-30T10:02:33Z', rounds=4,
      r=['2026-09-30T09:37:06Z', '2026-09-30T09:39:56Z', '2026-09-30T09:44:35Z'], r2s=67, r3s=67,
      first_p=(28.77, 9.3, 8.5), deliver=(10.49, 0.85, 3.66), served_p=(10.40, 0.85, 3.61),
      sections=8, doc=8448,
      notes='pre-repo blocks-first draft; repo made in-session (setup overlaps t0); bg gates (gate s = call start to gate/rN dir); r3 = origin change only'),
 dict(slug='travelers-home', site='https://www.travelers.com/', code='4cdd9f7', repo='2026-09-30T11:40:16Z',
      tx=PROJ + '/-Users-paolo-stardust-2026-08-sdt-travelers/cbd178ed-02b9-4e44-8d01-9b3d15b61648.jsonl',
      tx_win=('2026-09-30T12:15:00Z', '2026-09-30T13:52:00Z'),
      logs=[W + 'sdt-travelers/migration/cases/home'],
      t0='2026-09-30T12:20:22Z', first='2026-09-30T12:55:36Z', under10='2026-09-30T13:18:29Z', never=0, stop=None, stall=None,
      u360='2026-09-30T13:18:29Z', u1440='2026-09-30T13:09:48Z', u2560='2026-09-30T13:09:48Z', served='2026-09-30T13:40:03Z', rounds=3,
      r=['2026-09-30T12:55:36Z', '2026-09-30T13:09:48Z', '2026-09-30T13:18:29Z'], r2s=96, r3s=160,
      first_p=(41.63, 24.74, 14.05), deliver=(8.85, 4.54, 2.56), served_p=(3.28, 1.10, 0.57),
      sections=9, doc=6048,
      notes='round times = gate/rN.log mtime, gate s = log birth->mtime (gates ran in background); report has no clock; served = final (one served round after r6)'),
 dict(slug='ibm-home', site='https://www.ibm.com/us-en', code='098214f', repo='2026-09-30T14:30:49Z',
      tx=PROJ + '/-Users-paolo-stardust-2026-08-sdt-ibm/e2f1df7a-bd56-4bd5-be2c-301a167509f6.jsonl',
      tx_win=('2026-09-30T15:20:00Z', '2026-09-30T17:10:00Z'),
      logs=[W + 'sdt-ibm/migration/cases/home'],
      t0='2026-09-30T15:22:56Z', first='2026-09-30T16:05:33Z', under10='2026-09-30T16:23:21Z', never=0, stop=None, stall=None,
      u360='2026-09-30T16:23:21Z', u1440='2026-09-30T16:16:10Z', u2560='2026-09-30T16:23:21Z', served='2026-09-30T17:08:30Z', rounds=4,
      r=['2026-09-30T16:08:34Z', '2026-09-30T16:11:51Z', '2026-09-30T16:16:10Z'], r2s=53, r3s=39,
      first_p=(20.61, 23.93, 2.49), deliver=(6.64, 2.79, 2.49), served_p=(4.09, 2.37, 3.27),
      sections=8, doc=4420,
      notes='report clock start 17:21 CEST (t0 = first probe 17:22:56); r1-r2 1440 only, first_2560 from r3; served = final re-gate after header fix'),
 dict(slug='walgreens-home', site='https://www.walgreens.com/', code='6e1769d', repo='2026-09-30T19:41:37Z',
      tx=B7 + 'agent-aff9bc93740d1b73f.jsonl', tx_win=None, logs=[W + 'sdt-walgreens/migration/cases/home'],
      t0='2026-09-30T19:44:41Z', first='2026-09-30T20:28:28Z', under10='2026-09-30T21:06:42Z', never=0, stop=None, stall=None,
      u360='2026-09-30T21:06:42Z', u1440='2026-09-30T20:35:52Z', u2560='2026-09-30T20:52:47Z', served='2026-09-30T21:15:33Z', rounds=4,
      r=['2026-09-30T20:28:28Z', '2026-09-30T20:35:52Z', '2026-09-30T20:52:47Z'], r2s=43, r3s=None,
      first_p=(8.51, 3.03, 6.57), deliver=(8.51, 2.84, 1.62), served_p=(8.53, 2.85, 1.63),
      sections=16, doc=5875,
      notes='batch-7 run 1; r0 tables only (first_proto = r0), first pixel 1440 at r1, 2560 at r2, 360 at r3; served = final 360 re-gate; r3 gate s = 2 calls'),
 dict(slug='stryker-home', site='https://www.stryker.com/ch/en/index.html', code='db8b1be', repo='2026-09-30T21:37:34Z',
      tx=B7 + 'agent-a3455be2e9ee8e1ff.jsonl', tx_win=None, logs=[W + 'sdt-stryker/migration/cases/home'],
      t0='2026-09-30T21:40:01Z', first='2026-09-30T22:11:08Z', under10=None, never=1, stop='2026-09-30T22:43:42Z', stall=None,
      u360=None, u1440='2026-09-30T22:19:17Z', u2560='2026-09-30T22:28:44Z', served='2026-09-30T22:43:42Z', rounds=8,
      r=['2026-09-30T22:11:08Z', '2026-09-30T22:15:14Z', '2026-09-30T22:19:17Z'], r2s=None, r3s=None,
      first_p=(10.29, 9.37, 2.29), deliver=(10.27, 1.98, 2.21), served_p=(10.36, 1.94, 2.19),
      sections=8, doc=4354,
      notes='batch-7 run 2; 360 never < 10 (registered +23 chain), stop by stop rule (report says final 00:47 CEST); r0,r1,r3,r4 tables only, r2 1440 only, 360/2560 from r5'),
 dict(slug='usta2-home', site='https://www.usta.com/en/home.html', code='4fcdd3e', repo='2026-09-30T23:07:27Z',
      tx=B7 + 'agent-a6057ea461f19ae7f.jsonl', tx_win=None, logs=[W + 'sdt-usta2/migration/cases/home'],
      t0='2026-09-30T23:10:31Z', first='2026-09-30T23:44:44Z', under10='2026-10-01T00:41:45Z', never=0, stop=None, stall=None,
      u360='2026-10-01T00:41:45Z', u1440='2026-10-01T00:10:58Z', u2560='2026-10-01T00:20:10Z', served='2026-10-01T00:46:53Z', rounds=18,
      r=['2026-09-30T23:44:44Z', '2026-09-30T23:45:49Z', '2026-09-30T23:49:27Z'], r2s=None, r3s=None,
      first_p=(22.8, 4.06, 9.9), deliver=(9.74, 1.89, 4.17), served_p=(9.52, 1.90, 4.17),
      sections=12, doc=6733,
      notes='batch-7 run 3; r0-r8 tables only, r8 gate 1440, 360/2560 from r11; under10 = r16 (360) with 1440 r14 / 2560 r15; rounds r0-r16 + r8 gate; bg gates'),
 dict(slug='audemarspiguet-home', site='https://www.audemarspiguet.com/', code='0fe75f8', repo='2026-10-01T01:06:05Z',
      tx=B7 + 'agent-a85e42ba9002a8446.jsonl', tx_win=None, logs=[W + 'sdt-audemarspiguet/migration/cases/home'],
      t0='2026-10-01T01:08:36Z', first='2026-10-01T01:54:10Z', under10='2026-10-01T02:09:41Z', never=0, stop=None, stall=None,
      u360='2026-10-01T02:09:41Z', u1440='2026-10-01T02:02:35Z', u2560='2026-10-01T02:09:41Z', served='2026-10-01T02:23:48Z', rounds=5,
      r=['2026-10-01T01:54:10Z', '2026-10-01T01:59:25Z', '2026-10-01T02:02:35Z'], r2s=64, r3s=51,
      first_p=(8.10, 27.35, 1.79), deliver=(8.10, 2.91, 1.79), served_p=(4.19, 2.48, 1.34),
      sections=11, doc=8224,
      notes='batch-7 run 4; geo redirect to /ch/en/home; r0-r3 1440 only, first_360/2560 from r4; round times = gate log mtimes; served = final after drawer fix'),
 dict(slug='dentsu-home', site='https://www.dentsu.com/', code='0c9faf6', repo='2026-10-01T02:44:41Z',
      tx=B7 + 'agent-a472897f7194155aa.jsonl', tx_win=None, logs=[W + 'sdt-dentsu/migration/cases/home'],
      t0='2026-10-01T02:47:34Z', first='2026-10-01T03:14:07Z', under10='2026-10-01T03:28:13Z', never=0, stop=None, stall=None,
      u360='2026-10-01T03:28:13Z', u1440='2026-10-01T03:23:19Z', u2560='2026-10-01T03:28:13Z', served='2026-10-01T03:38:42Z', rounds=5,
      r=['2026-10-01T03:14:07Z', '2026-10-01T03:17:43Z', '2026-10-01T03:20:34Z'], r2s=None, r3s=None,
      first_p=(5.39, 11.23, 3.94), deliver=(5.39, 2.21, 3.94), served_p=(4.98, 2.21, 2.11),
      sections=8, doc=5509,
      notes='batch-7 run 5; CH edition by IP; r0-r1 tables only (first_proto = r0), r2-r3 1440 only, 360/2560 from r4; round times from gate dir files'),
 dict(slug='hiltongrandvacations-home', site='https://www.hiltongrandvacations.com/en', code='6b38be9', repo='2026-10-01T03:53:26Z',
      tx=B7 + 'agent-a8932558b61ca16e9.jsonl', tx_win=None, logs=[W + 'sdt-hiltongrandvacations/migration/cases/home'],
      t0='2026-10-01T03:56:30Z', first='2026-10-01T04:53:07Z', under10='2026-10-01T05:15:19Z', never=0, stop=None, stall=None,
      u360='2026-10-01T05:15:19Z', u1440='2026-10-01T04:58:17Z', u2560='2026-10-01T05:15:19Z', served='2026-10-01T05:38:34Z', rounds=4,
      r=['2026-10-01T04:53:07Z', '2026-10-01T04:58:17Z', '2026-10-01T05:06:15Z'], r2s=48, r3s=49,
      first_p=(6.33, 6.61, 5.52), deliver=(6.33, 3.01, 5.52), served_p=(5.94, 2.76, 3.28),
      sections=9, doc=10124,
      notes='batch-7 run 6; r0 tables only (first_proto = r0), r1-r2 1440 only, 360/2560 from r3; round times = gate log mtimes; served = final (r5)'),
 dict(slug='marriottvacationsworldwide-home', site='https://www.marriottvacationsworldwide.com/', code='8e3fbe5', repo='2026-10-01T06:02:21Z',
      tx=B7 + 'agent-ac593396898478339.jsonl', tx_win=None, logs=[W + 'sdt-marriottvacationsworldwide/migration/cases/home'],
      t0='2026-10-01T06:04:36Z', first='2026-10-01T06:49:07Z', under10='2026-10-01T07:16:34Z', never=0, stop=None, stall=None,
      u360='2026-10-01T07:16:34Z', u1440='2026-10-01T07:00:25Z', u2560='2026-10-01T07:16:34Z', served='2026-10-01T07:31:26Z', rounds=8,
      r=['2026-10-01T06:49:07Z', '2026-10-01T06:51:52Z', '2026-10-01T06:55:22Z'], r2s=None, r3s=None,
      first_p=(2.99, 14.62, 0.24), deliver=(2.99, 0.50, 0.24), served_p=(2.82, 0.33, 0.20),
      sections=4, doc=8473,
      notes='batch-7 run 7; r0-r2 tables only (first_proto = r0), r3-r6 1440 only, 360/2560 from r7; times from clock.txt + gate files; served = final (served r2)'),
]

HDR = 'slug,period,run_label,t0_utc,site_url,code,setup_min,setup_src,first_proto_min,under10_min,never,stop_min,under10_360_min,under10_1440_min,under10_2560_min,served_min,rounds_n,r2_elapsed_min,r3_elapsed_min,r2_tool_s,r3_tool_s,tool_min,llm_min,split_src,first_360,first_1440,first_2560,deliver_360,deliver_1440,deliver_2560,served_360,served_1440,served_2560,turns,sections,doc_h_1440,notes'.split(',')

def f1(x): return '' if x is None else f'{x:.1f}'

rows = []
for R in RUNS:
    t0 = T(R['t0'])
    stall = (T(R['stall'][0]), T(R['stall'][1])) if R['stall'] else None
    def mins(s):
        if not s: return None
        t = T(s); d = (t - t0).total_seconds() / 60
        if stall and t >= stall[1]: d -= (stall[1] - stall[0]).total_seconds() / 60
        return d
    end = T(R['under10'] or R['stop'])
    win = [(t0, end)] if not stall else [(t0, stall[0]), (stall[1], end)]
    lo, hi = (T(R['tx_win'][0]), T(R['tx_win'][1])) if R['tx_win'] else (None, None)
    iv, ids = tx_intervals(R['tx'], lo, hi)
    iv += log_intervals(R['logs'])
    tool = union_min(iv, win)
    endm = mins(R['under10'] or R['stop'])
    r = [T(x) for x in R['r']]
    row = dict(slug=R['slug'], period='A', run_label='', t0_utc=R['t0'], site_url=R['site'], code=R['code'],
               setup_min=f1((t0 - T(R['repo'])).total_seconds() / 60), setup_src='repo-created',
               first_proto_min=f1(mins(R['first'])), under10_min=f1(mins(R['under10'])), never=R['never'],
               stop_min=f1(mins(R['stop'])) if R['never'] else '',
               under10_360_min=f1(mins(R['u360'])), under10_1440_min=f1(mins(R['u1440'])), under10_2560_min=f1(mins(R['u2560'])),
               served_min=f1(mins(R['served'])), rounds_n=R['rounds'],
               r2_elapsed_min=f1((r[1] - r[0]).total_seconds() / 60), r3_elapsed_min=f1((r[2] - r[1]).total_seconds() / 60),
               r2_tool_s=R['r2s'] or '', r3_tool_s=R['r3s'] or '', tool_min=f1(tool), llm_min=f1(endm - tool), split_src='estimate',
               first_360=R['first_p'][0], first_1440=R['first_p'][1], first_2560=R['first_p'][2],
               deliver_360=R['deliver'][0], deliver_1440=R['deliver'][1], deliver_2560=R['deliver'][2],
               served_360=R['served_p'][0], served_1440=R['served_p'][1], served_2560=R['served_p'][2],
               turns=len(ids), sections=R['sections'], doc_h_1440=R['doc'],
               notes=('est: tool=tx call walls+bg logs; ' + R['notes']))
    rows.append(row)

with open(OUT, 'w', newline='') as fh:
    w = csv.DictWriter(fh, fieldnames=HDR)
    w.writeheader()
    for row in rows: w.writerow(row)
for row in rows:
    print(row['slug'], row['first_proto_min'], row['under10_min'], row['stop_min'], row['served_min'], row['tool_min'], row['llm_min'], row['turns'], len(row['notes']))
