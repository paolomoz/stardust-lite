# side-by-side crop: live | build at width W, y0..y1, scaled to out width
import sys
from PIL import Image
d, W, y0, y1, out = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
sc = float(sys.argv[6]) if len(sys.argv) > 6 else 0.5
L = Image.open(f'{d}/live-{W}.png'); B = Image.open(f'{d}/build-{W}.png')
a = L.crop((0, y0, L.width, y1)); b = B.crop((0, y0, B.width, y1))
im = Image.new('RGB', (a.width * 2 + 10, y1 - y0), 'red'); im.paste(a, (0, 0)); im.paste(b, (a.width + 10, 0))
im = im.resize((int(im.width * sc), int(im.height * sc))); im.save(out)
