#!/usr/bin/env python3
"""Extract icon-font glyphs (codepoints read from the site's CSS, see REGISTER.md) as standalone SVG files for /icons.
viewBox = [0, -typoAscender, advance, unitsPerEm] in font units so an icon rendered at height = font-size has the glyph's
advance width — the same box the ::before glyph occupied on the source (deep-probe at 1440)."""
import sys, os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

repo = sys.argv[1]
out = os.path.join(repo, 'icons'); os.makedirs(out, exist_ok=True)
jobs = [
  ('fonts/icomoon.woff', {'location': 0xe934, 'phone': 0xe953, 'rewards': 0xe960, 'question': 0xe983, 'calendar': 0xe991}),
  ('fonts/fa-solid-900.woff2', {'chevron-right': 0xf054}),
  ('fonts/fa-brands-400.woff2', {'facebook': 0xf082, 'instagram': 0xf16d, 'linkedin': 0xf08c, 'x-twitter': 0xe61b, 'youtube': 0xf167}),
]
for fontfile, icons in jobs:
    f = TTFont(os.path.join(repo, fontfile))
    cmap = f.getBestCmap(); gs = f.getGlyphSet(); hmtx = f['hmtx']
    upm = f['head'].unitsPerEm; asc = f['OS/2'].sTypoAscender; desc = upm - asc  # em box = upm, top at the typo ascender
    for name, cp in icons.items():
        gname = cmap.get(cp)
        if not gname: print('missing', name, hex(cp), fontfile); continue
        pen = SVGPathPen(gs); tpen = TransformPen(pen, (1, 0, 0, -1, 0, 0))
        gs[gname].draw(tpen)
        adv = hmtx[gname][0]
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 {-asc} {adv} {asc+desc}"><path fill="currentColor" d="{pen.getCommands()}"/></svg>\n'
        open(os.path.join(out, f'{name}.svg'), 'w').write(svg)
        print(f'{name}.svg  {fontfile}  U+{cp:04X}  adv={adv} em={asc+desc}')
