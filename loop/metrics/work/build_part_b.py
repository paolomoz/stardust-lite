# Build loop/metrics/part-B.csv (period B, 2026-10-03) per loop/metrics/SCHEMA.md.
# Round times = the gate call's tool_result time in the run agent's transcript (canonusa: gate.json _writtenAt,
# its gates ran in the background). Values = the printed pixel tables. tool_min = union of the agent's
# foreground tool-call intervals between t0 and under10/stop (an estimate).
import csv, json, os, sys
from datetime import datetime, timezone

SUB = os.path.expanduser('~/.claude/projects/-Users-paolo-stardust-stardust-lite/bdccee5a-79f3-4c78-b61f-ab12e41e4afe/subagents')
OUT = os.path.join(os.path.dirname(__file__), '..', 'part-B.csv')
D = '2026-10-03T'

def t(hms): return datetime.fromisoformat(D + hms + '+00:00')
def mins(a, b): return round((b - a).total_seconds() / 60, 1)

def tool_intervals(agent):
    uses, iv = {}, []
    for line in open(os.path.join(SUB, f'agent-{agent}.jsonl'), errors='replace'):
        try: d = json.loads(line)
        except Exception: continue
        c = d.get('message', {}).get('content')
        if not isinstance(c, list): continue
        if d.get('type') == 'assistant':
            for b in c:
                if b.get('type') == 'tool_use':
                    uses[b['id']] = (d['timestamp'], bool(b.get('input', {}).get('run_in_background')))
        elif d.get('type') == 'user':
            for b in c:
                if b.get('type') == 'tool_result' and b.get('tool_use_id') in uses:
                    st, bg = uses.pop(b['tool_use_id'])
                    if not bg:
                        iv.append((datetime.fromisoformat(st.replace('Z', '+00:00')), datetime.fromisoformat(d['timestamp'].replace('Z', '+00:00'))))
    return iv

def union_min(iv, a, b):
    segs = sorted((max(s, a), min(e, b)) for s, e in iv if e > a and s < b)
    tot, cur_s, cur_e = 0.0, None, None
    for s, e in segs:
        if cur_e is None or s > cur_e:
            if cur_e is not None: tot += (cur_e - cur_s).total_seconds()
            cur_s, cur_e = s, e
        else: cur_e = max(cur_e, e)
    if cur_e is not None: tot += (cur_e - cur_s).total_seconds()
    return tot / 60

def turns(agent):
    ids = set()
    for line in open(os.path.join(SUB, f'agent-{agent}.jsonl'), errors='replace'):
        try: d = json.loads(line)
        except Exception: continue
        if d.get('type') == 'assistant':
            mid = d.get('message', {}).get('id')
            if mid: ids.add(mid)
    return len(ids)

# rounds: (result time, {width: pct}, gate wall s) — prototype gate invocations from the first prototype's round on
RUNS = [
 dict(slug='scotiabank-personal', label='R1', agent='a1742ba3091fece78', url='https://www.scotiabank.com/ca/en/personal.html',
      t0='08:55:30', created='08:52:18', sections=5, doc=3216,
      rounds=[('09:37:38', {1440: 3.49}, 30.6), ('09:41:52', {1440: 2.84}, 35.3), ('09:45:59', {1440: 2.3}, 35.0),
              ('09:49:39', {360: 5.96, 1440: 2.28, 2560: 1.77}, 70.4)],
      under=3, served=('10:12:25', {360: 2.84, 1440: 2.35, 2560: 1.80}),
      notes='r1-r3 1440 only, first_360/2560 from r4; served=final (1st served 70.0, 360 7.97: pipeline drops a leading <br>)'),
 dict(slug='cibc-careers', label='R2', agent='a7731cd891f5f3df1', url='https://www.cibc.com/en/about-cibc/careers.html',
      t0='10:31:14', created='10:28:08', sections=11, doc=5211,
      rounds=[('10:57:50', {360: 16.02, 1440: 9.93, 2560: 2.27}, 65.1), ('11:02:23', {1440: 3.39}, 49.7),
              ('11:07:15', {360: 15.44, 1440: 2.39}, 50.8), ('11:10:37', {360: 14.69, 1440: 2.39}, 50.2),
              ('11:14:21', {360: 15.18, 1440: 2.39, 2560: 1.51}, 122.1), ('11:17:45', {360: 15.02, 1440: 2.35, 2560: 1.49}, 118.4),
              ('11:23:30', {360: 5.89, 1440: 2.39, 2560: 1.51}, 118.9)],
      under=6, served=('11:30:16', {360: 5.83, 1440: 2.39, 2560: 1.51}),
      notes='run names rounds r0-r7; 1440 9.93 at r0 already <10 (run says r2); 360 stuck 3 rounds on a sticky bar'),
 dict(slug='mfs-home', label='R3', agent='aa25a7d173056062a', url='https://www.mfs.com/corporate/en/home.html',
      t0='11:41:58', created='11:39:43', sections=3, doc=2232,
      rounds=[('12:05:09', {1440: 70.06}, 33.1), ('12:12:01', {360: 2.23, 1440: 4.54, 2560: 1.36}, 81.2),
              ('12:15:01', {360: 1.19, 1440: 4.48, 2560: 1.33}, 83.8)],
      under=1, served=('12:19:06', {360: 1.20, 1440: 2.29, 2560: 1.34}),
      notes='r0 1440 only (70.06), then 4 table-only rounds; first_360/2560 from r1'),
 dict(slug='natixis-about-article', label='R4', agent='ab453f5af89f67f6e', url='https://www.im.natixis.com/en-intl/about/diversity-equity-and-inclusion',
      t0='12:30:38', created='12:27:27', sections=13, doc=8156,
      rounds=[('13:03:52', {360: 10.92, 1440: 7.57, 2560: 4.82}, 95.2), ('13:13:47', {360: 1.41, 1440: 0.16, 2560: 0.09}, 69.3),
              ('13:15:59', {1440: 0.16}, 107.2)],
      under=1, served=('13:29:36', {360: 1.06, 1440: 0.17, 2560: 0.09}),
      notes='run calls the under gate "round 3" (2 = tables); served=final, 1st served 52.3 (1.08/0.17/0.10)'),
 dict(slug='harbourvest-about', label='R5', agent='a5ecc41427693c8fa', url='https://www.harbourvest.com/it/en/about-harbourvest',
      t0='13:56:38', created='13:52:42', sections=7, doc=5065,
      rounds=[('14:46:04', {360: 21.38, 1440: 20.08, 2560: 17.78}, 81.7), ('14:51:49', {360: 22.27, 1440: 13.35}, 77.6),
              ('14:59:33', {360: 15.31, 1440: 11.62}, 76.7), ('15:03:26', {360: 16.68, 1440: 3.54, 2560: 5.07}, 94.0),
              ('15:08:06', {360: 16.68, 1440: 3.54, 2560: 3.55}, 120.4), ('15:14:30', {360: 15.73, 1440: 3.51, 2560: 13.01}, 141.0),
              ('15:22:56', {1440: 3.46}, 124.0), ('15:24:43', {2560: 2.85, 360: 16.99}, 80.2),
              ('15:29:22', {360: 15.73, 1440: 3.56, 2560: 3.57}, 137.3)],
      under=None, stop=8, served=('15:18:39', {360: 15.55, 1440: 3.50, 2560: 3.54}),
      notes='never at 360 (h2 trailing nbsp -42px); stop=final proto gate, run claims stop rule at r6 (77.9); cookie gate'),
 dict(slug='covermore-travel-assistance', label='R6', agent='afc3d8eb68afd1407', url='https://www.covermore.com/travel-assistance',
      t0='15:40:03', created='15:37:41', sections=2, doc=924,
      rounds=[('16:03:30', {360: 10.54, 1440: 6.27, 2560: 3.50}, 58.7), ('16:07:10', {360: 3.65, 1440: 1.95, 2560: 1.07}, 89.2)],
      under=1, served=('16:12:10', {360: 3.65, 1440: 1.95, 2560: 1.07}),
      notes='2 gate rounds, no r3'),
 dict(slug='manulife-business', label='R7', agent='a7fd7b763fc64c5cc', url='https://www.manulife.com/ca/en/business',
      t0='16:30:36', created='16:22:57', sections=7, doc=4350,
      rounds=[('17:05:10', {360: 15.23, 1440: 18.3, 2560: 13.31}, 114.4), ('17:10:04', {1440: 1.33}, 56.9),
              ('17:13:16', {360: 9.06, 1440: 1.33, 2560: 0.74}, 105.1)],
      under=2, served=('17:33:06', {360: 2.02, 1440: 0.67, 2560: 0.38}),
      notes='setup stamps 2.2 min, 5.8 min from setup end to t0 in repo-created setup; re-measure after --dismiss opened a survey'),
 dict(slug='take2games-ir-news', label='R8', agent='a1f9c58f3a6e8b8a0', url='https://www.take2games.com/ir/news/break-free-borderlandsr4-now-available-worldwide',
      t0='17:45:50', created='17:43:39', sections=2, doc=3931,
      rounds=[('18:05:15', {360: 10.88, 1440: 8.03, 2560: 7.32}, 79.0), ('18:12:36', {1440: 4.74}, 63.0),
              ('18:14:51', {360: 7.02, 1440: 1.76, 2560: 4.69}, 79.6)],
      under=2, served=('18:30:27', {360: 1.6, 1440: 1.85, 2560: 1.2}),
      notes='served=2nd served gate after a doc fix; served 1 at 40.0 (2.6/6.56/5.12)'),
 dict(slug='bny-leadership', label='R9', agent='a7ea3f52acfed4f1b', url='https://www.bny.com/corporate/global/en/about-us/leadership.html',
      t0='18:48:55', created='18:47:03', sections=2, doc=3507,
      rounds=[('19:11:19', {360: 23.64, 1440: 31.85, 2560: 22.69}, 68.6), ('19:19:41', {1440: 1.21}, 55.1),
              ('19:22:32', {1440: 1.77}, 55.1), ('19:27:05', {1440: 0.62}, 56.5),
              ('19:28:44', {360: 20.24, 1440: 0.62, 2560: 5.16}, 89.5), ('19:32:05', {360: 9.93, 1440: 0.62, 2560: 0.35}, 93.6)],
      under=5, served=('19:44:53', {360: 2.62, 1440: 0.23, 2560: 0.13}),
      notes='r2-r4 1440 only; ~9 min on fragment wrappers'),
 dict(slug='canonusa-support-article', label='R10', agent='a1453ea887f0f49a7', url='https://www.usa.canon.com/support/about-consumer-support',
      t0='19:54:40', created='19:52:25', sections=3, doc=3374,
      rounds=[('20:24:59', {360: 30.21, 1440: 29.9, 2560: 26.97}, 156), ('20:27:43', {1440: 8.46}, 122),
              ('20:35:34', {360: None}, 131), ('20:37:02', {360: 22.3}, 114), ('20:38:41', {1440: 3.52}, 79),
              ('20:42:35', {360: 7.88}, 75), ('20:45:18', {360: 7.88, 1440: 3.52, 2560: 2.78}, None)],
      under=6, served=('21:18:25', {360: 4.15, 1440: 1.99, 2560: 1.18}),
      notes='round times from gate.json (gates in background); served late, dead sync-poll ~10 min'),
 dict(slug='wellsfargo-about-article', label='V1', agent='a5cbc317f8aee14fd', url='https://www.wellsfargo.com/about/inclusion/',
      t0='22:29:17', created='22:18:20', sections=6, doc=2542,
      rounds=[('22:55:59', {1440: 1.47}, 57.5), ('23:00:15', {1440: 1.56}, 105.8), ('23:02:34', {1440: 1.56}, 72.6),
              ('23:07:15', {1440: 1.49}, 82.9), ('23:09:38', {1440: 0.33}, 46.2), ('23:12:19', {1440: 0.31}, 44.3),
              ('23:15:31', {360: 3.53, 1440: 0.31, 2560: 0.23}, 165.1)],
      under=6, served=('23:28:17', {360: 2.86, 1440: 0.30, 2560: 0.17}),
      notes='3 agents parallel (V1-V3); 6 base-width rounds; first_360/2560 from the 3-width gate'),
 dict(slug='citizensbank-about-article', label='V2', agent='a41b81331c29b9700', url='https://www.citizensbank.com/about-us/sustainability-impact.aspx',
      t0='22:26:35', created='22:19:16', sections=8, doc=3143,
      rounds=[('22:56:30', {1440: 3.9}, 91.1), ('23:07:38', {1440: 3.51}, 82.7),
              ('23:10:47', {360: 30.72, 1440: 2.42, 2560: 1.36}, 104.8), ('23:15:48', {360: 14.82, 1440: 2.42, 2560: 1.36}, 175.4)],
      under=None, stop=3, served=('23:22:18', {360: 14.98, 1440: 2.61, 2560: 1.47}),
      notes='never at 360 (6 broken live images); TIMELINE r1/r2 stamps lag transcript (r1 22:56:30); 3 parallel agents'),
 dict(slug='takeda-about-article', label='V3', agent='a1cf80493fcca2f9e', url='https://www.takeda.com/about/corporate-responsibility/corporate-giving/',
      t0='22:29:27', created='22:25:34', sections=24, doc=11895,
      rounds=[('23:07:53', {1440: 15.22}, 122.0), ('23:11:22', {1440: 1.55}, 90.0), ('23:15:15', {1440: 1.52}, 136.6),
              ('23:23:47', {1440: 1.31}, 116.8), ('23:26:02', {1440: 1.23}, 98.9), ('23:35:51', {360: 1.41, 1440: 0.50, 2560: 0.40}, 216.4)],
      under=5, served=('23:46:17', {360: 1.48, 1440: 0.45, 2560: 0.39}),
      notes='5 base-width rounds; first_360/2560 from the 3-width gate; 3 parallel agents'),
]

HDR = 'slug,period,run_label,t0_utc,site_url,code,setup_min,setup_src,first_proto_min,under10_min,never,stop_min,under10_360_min,under10_1440_min,under10_2560_min,served_min,rounds_n,r2_elapsed_min,r3_elapsed_min,r2_tool_s,r3_tool_s,tool_min,llm_min,split_src,first_360,first_1440,first_2560,deliver_360,deliver_1440,deliver_2560,served_360,served_1440,served_2560,turns,sections,doc_h_1440,notes'.split(',')

def fmt(x):
    if x is None: return ''
    return f'{x:g}' if isinstance(x, (int, float)) else x

CODE = {'scotiabank-personal': 'f2903b1', 'cibc-careers': '81c293e', 'mfs-home': 'c4a4940', 'natixis-about-article': '39e6a67', 'harbourvest-about': '4832fcb', 'covermore-travel-assistance': '9f925b1', 'manulife-business': '98b3529', 'take2games-ir-news': 'e4d7099', 'bny-leadership': 'c8ecf9b', 'canonusa-support-article': '1d84597', 'wellsfargo-about-article': 'a7cebff', 'citizensbank-about-article': 'a7cebff', 'takeda-about-article': 'a7cebff'}
rows = []
for r in RUNS:
    t0 = t(r['t0']); rr = [(t(a), b, c) for a, b, c in r['rounds']]
    end_i = r['under'] if r['under'] is not None else r['stop']
    tend = rr[end_i][0]
    first = {}
    for _, v, _ in rr:
        for w, p in v.items():
            if p is not None and w not in first: first[w] = p
    def u10(w):
        for tt, v, _ in rr[:end_i + 1]:
            if v.get(w) is not None and v[w] < 10: return mins(t0, tt)
        for tt, v, _ in rr[end_i + 1:]:
            if v.get(w) is not None and v[w] < 10: return mins(t0, tt)
        return None
    deliver = rr[end_i][1]
    iv = tool_intervals(r['agent'])
    tool = round(union_min(iv, t0, tend), 1)
    el = mins(t0, tend)
    row = dict(slug=r['slug'], period='B', run_label=r['label'], t0_utc=D + r['t0'] + 'Z', site_url=r['url'], code=CODE[r['slug']],
               setup_min=mins(t(r['created']), t0), setup_src='repo-created',
               first_proto_min=mins(t0, rr[0][0]),
               under10_min=mins(t0, tend) if r['under'] is not None else None,
               never=1 if r['under'] is None else 0,
               stop_min=mins(t0, tend) if r['under'] is None else None,
               under10_360_min=u10(360), under10_1440_min=u10(1440), under10_2560_min=u10(2560),
               served_min=mins(t0, t(r['served'][0])), rounds_n=end_i + 1,
               r2_elapsed_min=mins(rr[0][0], rr[1][0]) if len(rr) > 1 else None,
               r3_elapsed_min=mins(rr[1][0], rr[2][0]) if len(rr) > 2 else None,
               r2_tool_s=rr[1][2] if len(rr) > 1 else None, r3_tool_s=rr[2][2] if len(rr) > 2 else None,
               tool_min=tool, llm_min=round(el - tool, 1), split_src='estimate',
               first_360=first.get(360), first_1440=first.get(1440), first_2560=first.get(2560),
               deliver_360=deliver.get(360), deliver_1440=deliver.get(1440), deliver_2560=deliver.get(2560),
               served_360=r['served'][1][360], served_1440=r['served'][1][1440], served_2560=r['served'][1][2560],
               turns=turns(r['agent']), sections=r['sections'], doc_h_1440=r['doc'],
               notes=('est: tool=union of tool-call walls (transcript), gate s=call wall; ' + r['notes'])[:200])
    rows.append(row)
    print(row['slug'], row['under10_min'] or row['stop_min'], row['tool_min'], row['llm_min'], len(row['notes']), file=sys.stderr)

with open(OUT, 'w', newline='') as f:
    w = csv.writer(f)
    w.writerow(HDR)
    for row in rows: w.writerow([(f'{row[h]:.1f}' if h.endswith('_min') and row[h] is not None else fmt(row[h])) for h in HDR])
