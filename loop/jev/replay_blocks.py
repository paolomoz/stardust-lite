#!/usr/bin/env python3
"""Replay the block decision through Jev (exp/jev, step 1): one `choice` per triage row over the blocks the agents used, each option
carrying what / not_for and EXAMPLES from OTHER pages' labelled rows (leave-one-page-out: no page sees its own answers). Scores Jev and
today's triage against the agent's final block, overall and by Jev's confidence. Logs every answer with its probability vector.
Usage: python3 replay_blocks.py [data/blocks.jsonl] [--variant v1] [--no-examples]"""
import concurrent.futures as cf, json, os, random, sys, time, urllib.request, collections
from pathlib import Path

HERE = Path(__file__).parent
DATA = Path(sys.argv[1]) if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else HERE / 'data/blocks.jsonl'
VARIANT = sys.argv[sys.argv.index('--variant') + 1] if '--variant' in sys.argv else 'v1'
EXAMPLES = '--no-examples' not in sys.argv
OUTLINE = '--outline' in sys.argv
KEY = os.environ['TYPESAFE_API_KEY']
OPTIONS = {
  'default': {'what': 'default content: headings, paragraphs, links, a single picture or a short list laid out in the normal flow — no repeated unit, no columns, no slider', 'not_for': 'repeated cards or side-by-side columns'},
  'cards': {'what': 'a grid of 3 or more repeated units of the same shape (picture + heading + text / link each), wrapping into rows', 'not_for': 'two side-by-side halves; a horizontal slider'},
  'columns': {'what': 'two or three side-by-side columns of different content (text next to a picture, a split layout); not repeated units', 'not_for': 'a grid of identical cards'},
  'carousel': {'what': 'a horizontal slider: units in one row running past the viewport, with arrows / dots, one slide or a few visible at a time', 'not_for': 'a static grid'},
  'hero': {'what': 'the large lead band: a big picture or video with a headline (and a call to action) over or beside it, usually the first content section', 'not_for': 'a regular card'},
  'accordion': {'what': 'a list of questions / titles that expand to reveal their panels', 'not_for': 'a plain list of links'},
  'tabs': {'what': 'tab labels switching between panels in place', 'not_for': 'a navigation bar'},
  'other': {'what': 'none of the above: a quote, an embed, in-page navigation, breadcrumbs, a form, a promo strip or a page-specific widget', 'not_for': ''},
}
MAP = {'in-page-nav': 'other', 'section-nav': 'other', 'breadcrumbs': 'other', 'promo': 'other', 'quote': 'other', 'embed': 'other', 'link-card': 'cards', 'feedback': 'other', 'widget': 'other', 'form': 'other'}
lab = lambda b: MAP.get(b, b) if b in OPTIONS or b in MAP else 'other'

rows = [json.loads(l) for l in open(DATA)]
rows = [r for r in rows if r['final'] and r['page'] != 'nfm']

def words(r):
    """the row as text — counts kept, pixel sizes turned into words (Jev is weak on raw numbers)"""
    try: b = json.loads(r['box']) if isinstance(r['box'], str) else r['box']
    except Exception: b = None
    h = b[3] if b else None
    size = None if h is None else ('a short strip (under 150 px)' if h < 150 else 'a medium band (150–600 px)' if h < 600 else 'a tall band (600–1200 px)' if h < 1200 else 'a very tall band (over 1200 px)')
    cls = r.get('classes'); cls = cls if isinstance(cls, dict) else {}
    return {'anchor_text': r.get('anchorText'), 'height': size, 'structure_pattern': r.get('fingerprint'), 'repeated_units': r.get('repeat'),
            'groups_of_rows': r.get('groups'), 'rows_and_columns': r.get('rowsCols'), 'pictures': r.get('media'), 'texts': r.get('texts'),
            'links': r.get('links'), 'shape': r.get('shape'), 'source_classes': {k: v for k, v in cls.items() if k in ('root', 'unit')}, 'notes': r.get('notes'),
            **({'layout_of_pictures': r['layout'], 'content_in_reading_order': r['outline']} if OUTLINE and r.get('outline') else {})}

def criteria_for(page):
    if not EXAMPLES: return OPTIONS
    pool = collections.defaultdict(list)
    for r in rows:
        if r['page'] != page: pool[lab(r['final'])].append(f"{r.get('fingerprint')} — “{str(r.get('anchorText') or '')[:40]}”")
    out = {}
    for k, v in OPTIONS.items():
        ex = pool.get(k, []); random.Random(k + page).shuffle(ex)
        out[k] = {**v, 'examples': ex[:3]}
    return out

def ask(r):
    body = {'model': 'jev-latest', 'state': {'section': words(r), 'proposed_block': lab(r['machine'])},
            'questions': {'block': {'type': 'choice', 'instructions': {'question': 'Which block should `section` be authored as on the migrated page?',
                                     'focus': 'Read `section.structure_pattern` and `section.repeated_units`: a repeated unit with pictures is cards (or a carousel when it runs in one row past the viewport); two different halves are columns; flowing text is default content.'},
                                    'criteria': criteria_for(r['page'])},
                          'proposal_wrong': {'type': 'noul', 'instructions': 'Is `proposed_block` the wrong block for `section` — would an author building this page choose a different block (or plain default content) for it?'}}}
    req = urllib.request.Request('https://api.typesafe.ai/v1/systemone', data=json.dumps(body).encode(),
                                 headers={'Authorization': f'Bearer {KEY}', 'content-type': 'application/json', 'user-agent': 'curl/8'})
    for attempt in range(4):
        try:
            t = time.time(); d = json.load(urllib.request.urlopen(req, timeout=60)); a = d['answers']['block']
            return {**r, 'jev': a['choice'], 'conf': a['confidence'], 'probs': a['probabilities'], 'p_wrong': d['answers']['proposal_wrong'].get('noul'), 'ms': int((time.time() - t) * 1000), 'tokens': d.get('usage', {}).get('input_tokens')}
        except Exception as e:
            err = e; time.sleep(1 + attempt * 2)
    return {**r, 'jev': None, 'error': str(err)[:120]}

with cf.ThreadPoolExecutor(6) as ex: res = list(ex.map(ask, rows))
out = HERE / f'data/replay-blocks-{VARIANT}{"" if EXAMPLES else "-noex"}.jsonl'
with open(out, 'w') as f:
    for x in res: f.write(json.dumps(x) + '\n')
ok = [x for x in res if x.get('jev')]
fin = lambda x: lab(x['final']); mac = lambda x: lab(x['machine'])
def report(sub, name):
    if not sub: return
    j = sum(x['jev'] == fin(x) for x in sub); m = sum(mac(x) == fin(x) for x in sub)
    print(f"{name:34} n={len(sub):4}  jev {100*j/len(sub):5.1f} %   triage {100*m/len(sub):5.1f} %")
print(f"replay {VARIANT}{'' if EXAMPLES else ' (no examples)'}: {len(ok)}/{len(res)} answered, median {sorted(x['ms'] for x in ok)[len(ok)//2]} ms, {sum(x.get('tokens') or 0 for x in ok)/1e6:.2f} M tokens")
report(ok, 'all rows')
report([x for x in ok if '-b0' not in x['case'] and '-b1' not in x['case']], 'without the 10 rbc bench runs')
for lo, hi in ((0.9, 1.01), (0.7, 0.9), (0.5, 0.7), (0, 0.5)):
    report([x for x in ok if lo <= x['conf'] < hi], f'jev confidence {lo}–{min(hi,1)}')
conf = collections.Counter((fin(x), x['jev']) for x in ok if x['jev'] != fin(x))
print('top confusions (final → jev):', conf.most_common(8))
# the checker: does a high P(triage wrong) find triage's errors?
pw = [x for x in ok if isinstance(x.get('p_wrong'), (int, float))]
for thr in (0.5, 0.7, 0.85):
    fl = [x for x in pw if x['p_wrong'] >= thr]; err = [x for x in pw if mac(x) != fin(x)]
    tp = sum(mac(x) != fin(x) for x in fl)
    print(f"checker P(wrong) >= {thr}: flags {len(fl):3}, of them triage wrong {tp} (precision {100*tp/max(1,len(fl)):.0f} %), recall {100*tp/max(1,len(err)):.0f} % of {len(err)} errors")
print('->', out)
