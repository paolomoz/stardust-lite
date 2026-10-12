# extract the source's inline SVG icons (vector assets, not layout) into icons/ — the logo, the social icons, the arrow
import re, sys, os
s = open(sys.argv[1]).read(); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
def save(name, svg):
    svg = re.sub(r'<!--.*?-->', '', svg, flags=re.S)
    svg = re.sub(r'\s(class|aria-hidden|data-[a-z-]+|height|width)="[^"]*"', '', svg, count=0)
    open(f'{out}/{name}.svg', 'w').write(svg); print(name, len(svg))
i = s.find('o-header__logo'); svgs = re.findall(r'<svg.*?</svg>', s[i:i + 20000], re.S)
save('continental-logo', svgs[0]); save('continental-tagline', svgs[1])
for m in re.finditer(r'data-identifier="con-([a-z]+)"[^>]*>\s*<span class="icon-markup">\s*(<svg.*?</svg>)', s, re.S):
    if not os.path.exists(f'{out}/{m.group(1)}.svg'): save(m.group(1), m.group(2))
for m in re.finditer(r'data-identifier="([a-z-]+)"[^>]*>\s*<span class="icon-markup">\s*(<svg.*?</svg>)', s, re.S):
    n = m.group(1).replace('con-', '')
    if not os.path.exists(f'{out}/{n}.svg'): save(n, m.group(2))
