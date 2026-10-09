#!/usr/bin/env python3
"""Hand edits on author's draft (si-home): drop the skip links, the duplicate hero section and the empty hr section; hidden 'Slideshow'
heading; icon text → :arrow-right: token; the two-column intro as one columns block; membership as columns (membership) in the featured
section; double-escaped &amp;amp; in hrefs; the space author trimmed out of <em>Smithsonian </em>."""
import re, sys
p = sys.argv[1] if len(sys.argv) > 1 else 'doc/si-home.html'
html = open(p).read()
head, rest = html.split('<main>\n', 1); body, tail = rest.split('  </main>', 1)
secs = re.findall(r'<div>\n.*?\n</div>\n(?=<div>\n|$)', body, flags=re.S)
assert ''.join(secs) == body, 'section split mismatch'
keep = []
seen_carousel = False
for s in secs:
    if 'Skip to main' in s: continue
    if s.strip() == '<div>\n\n</div>': continue
    if 'class="carousel"' in s:
        if seen_carousel: continue
        seen_carousel = True
        s = s.replace('<h2>Slideshow</h2>\n', '')
    keep.append(s)
secs = keep
out = []
for s in secs:
    if 'Explore from Anywhere!' in s:
        m = re.search(r'<h2>Explore from Anywhere!</h2>\n(<p>.*?</p>)\n(<p><strong><a href="/explore">Start exploring</a></strong></p>)\n<div class="columns">\n<div><div><h2>Plan Your Visit</h2></div><div>(.*?)</div></div>\n</div>', s, flags=re.S)
        s = ('<div>\n<div class="columns">\n<div><div><h2>Explore from Anywhere!</h2>' + m.group(1) + m.group(2) + '</div><div><h2>Plan Your Visit</h2>'
             + m.group(3) + '</div></div>\n</div>\n</div>\n')
    if 'What interests you?' in s or 'class="cards links"' in s:
        s = s.replace('\n</div>\n', '\n<div class="section-metadata"><div><div>style</div><div>divider</div></div></div>\n</div>\n', 1) if False else s
        s = s[:-len('</div>\n')] + '<div class="section-metadata"><div><div>style</div><div>divider</div></div></div>\n</div>\n'
    if '<h2>Membership</h2>' in s:
        m = re.search(r'<h2>Membership</h2>\n(<p>.*?</p>)\n(<p><strong><a href="https://www.si.edu/support/membership">.*?</a></strong></p>)\n(<p><picture>.*?</picture></p>)\n', s, flags=re.S)
        s = s.replace(m.group(0), '<div class="columns membership">\n<div><div><h2>Membership</h2>' + m.group(1) + m.group(2) + '</div><div>' + m.group(3) + '</div></div>\n</div>\n')
    out.append(s)
body = ''.join(out)
body = re.sub(r'(<a [^>]*>) ', r'\1', body)
body = body.replace(' arrow-right</a>', ' :arrow-right:</a>')
body = body.replace('&amp;amp;', '&amp;')
for t in ('Start exploring', 'Plan your visit', 'Explore more by topic', 'Discover more from Sidedoor'):
    body = body.replace(f'>{t}</a></strong>', f'>{t} :arrow-right:</a></strong>')  # the live buttons carry the arrow icon (193 = 16 + 129 + 8 + 24 + 16)
body = body.replace('<em>Smithsonian</em>magazine', '<em>Smithsonian</em> magazine')
open(p, 'w').write(head + '<main>\n' + body + '  </main>' + tail)
print(len(secs), 'sections;', body.count(':arrow-right:'), 'arrow tokens')
