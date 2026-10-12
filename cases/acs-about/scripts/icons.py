#!/usr/bin/env python3
"""Case script: the source's inline SVG icons (media, not CSS) written as icons/<name>.svg — by index in dom-1440.html's svg list."""
import re, sys
s = open(sys.argv[1]).read(); svgs = re.findall(r'<svg[^>]*>.*?</svg>', s, flags=re.S)
names = {2: 'acs-wordmark', 4: 'acs-emblem', 38: 'arrow-card', 55: 'arrow-right', 28: 'chevron-down', 45: 'search', 54: 'play',
         73: 'download', 76: 'facebook', 77: 'instagram', 78: 'youtube', 79: 'linkedin', 9: 'caret-down'}
for i, n in names.items():
    v = svgs[i]; v = re.sub(r'\sclass="[^"]*"', '', v); v = re.sub(r'\saria-hidden="true"', '', v)
    if 'xmlns=' not in v[:200]: v = v.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"', 1)
    open(f'icons/{n}.svg', 'w').write(v); print(n, len(v))
