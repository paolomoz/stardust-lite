#!/usr/bin/env python3
"""Parse a case TIMING.log: print every command relative to t0 (first non-setup START), in minutes.
usage: timing_c.py <slug> [--stop HH:MM:SS]   (stop = the under-10 / stop moment; prints tool sum to it)"""
import re, sys, datetime as dt
from pathlib import Path

CASES = Path(__file__).resolve().parents[3] / 'cases'
RX = re.compile(r'^(\S+Z)\s+(START|END)\s+\[([^\]]+)\](?:\s+rc=(\S+)\s+(\d+)s)?')


def parse(slug):
    ev, open_ = [], {}
    for line in (CASES / slug / 'TIMING.log').read_text().splitlines():
        m = RX.match(line.strip())
        if not m:
            continue
        ts = dt.datetime.strptime(m.group(1), '%Y-%m-%dT%H:%M:%SZ')
        lab = m.group(3)
        if m.group(2) == 'START':
            open_.setdefault(lab, []).append(ts)
        else:
            st = open_.get(lab, [None]).pop(0) if open_.get(lab) else None
            dur = int(m.group(5)) if m.group(5) else None
            ev.append(dict(label=lab, start=st, end=ts, dur=dur, rc=m.group(4)))
    ev.sort(key=lambda e: (e['start'] or e['end']))
    return ev


def t0_of(ev):
    return min(e['start'] for e in ev if e['start'] and not e['label'].startswith('setup'))


def tool_sum(ev, t0, stop, exclude=()):
    s = 0
    for e in ev:
        if e['label'].startswith('setup') or not e['start']:
            continue
        if e['start'] >= t0 and e['end'] <= stop:
            s += e['dur'] if e['dur'] is not None else (e['end'] - e['start']).total_seconds()
    return s


if __name__ == '__main__':
    slug = sys.argv[1]
    ev = parse(slug)
    t0 = t0_of(ev)
    print('t0', t0.isoformat() + 'Z')
    for e in ev:
        st = (e['start'] - t0).total_seconds() / 60 if e['start'] else None
        en = (e['end'] - t0).total_seconds() / 60
        print(f"{e['label']:28s} {e['end'].strftime('%H:%M:%S')} start {st if st is None else round(st, 2):>7} end {en:7.2f} dur {e['dur']} rc {e['rc']}")
    if '--stop' in sys.argv:
        hh = sys.argv[sys.argv.index('--stop') + 1]
        stop = dt.datetime.combine(t0.date(), dt.time.fromisoformat(hh))
        if stop < t0:
            stop += dt.timedelta(days=1)
        print('stop', round((stop - t0).total_seconds() / 60, 2), 'tool_s', tool_sum(ev, t0, stop))
