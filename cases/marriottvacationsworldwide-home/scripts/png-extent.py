#!/usr/bin/env python3
"""png-extent.py — case instrument: the painted extent of a colour class inside a region of a capture (pure-Python PNG reader,
no dependencies). Used to read the stat icon's real size in the live capture (120 px) when `deep-probe` printed a 160 px
background-size on the wrong element, and the opaque bbox of the source's logo PNGs. Also samples single pixels.
Usage: python3 scripts/png-extent.py <png> --region x0 y0 x1 y1 [--blue | --coral | --alpha] | --px x,y[,x,y…]"""
import struct, zlib, sys
def decode(path, ymax=None):
    data = open(path, 'rb').read(); pos = 8; idat = b''
    while pos < len(data):
        ln, = struct.unpack('>I', data[pos:pos + 4]); typ = data[pos + 4:pos + 8]; body = data[pos + 8:pos + 8 + ln]
        if typ == b'IHDR': w, h, bd, ct = struct.unpack('>IIBB', body[:10])
        elif typ == b'IDAT': idat += body
        elif typ == b'IEND': break
        pos += 12 + ln
    raw = zlib.decompress(idat); bpp = {6: 4, 2: 3, 0: 1, 4: 2}[ct]; stride = w * bpp; rows = []; prev = bytearray(stride); p = 0
    for y in range(h):
        f = raw[p]; p += 1; cur = bytearray(raw[p:p + stride]); p += stride
        for i in range(stride):
            a = cur[i - bpp] if i >= bpp else 0; b = prev[i]; c = prev[i - bpp] if i >= bpp else 0
            if f == 1: cur[i] = (cur[i] + a) & 255
            elif f == 2: cur[i] = (cur[i] + b) & 255
            elif f == 3: cur[i] = (cur[i] + (a + b) // 2) & 255
            elif f == 4:
                pa = abs(b - c); pb = abs(a - c); pc = abs(a + b - 2 * c); pr = a if pa <= pb and pa <= pc else (b if pb <= pc else c); cur[i] = (cur[i] + pr) & 255
        rows.append(bytes(cur)); prev = cur
        if ymax is not None and y >= ymax: break
    return w, h, bpp, rows
args = sys.argv[1:]; path = args[0]
if '--px' in args:
    w, h, bpp, rows = decode(path)
    pts = list(map(int, args[args.index('--px') + 1].split(',')))
    for x, y in zip(pts[::2], pts[1::2]): print((x, y), tuple(rows[y][x * bpp:x * bpp + 3]))
else:
    x0, y0, x1, y1 = map(int, args[args.index('--region') + 1:args.index('--region') + 5])
    w, h, bpp, rows = decode(path, y1)
    kind = 'blue' if '--blue' in args else 'coral' if '--coral' in args else 'alpha'
    xs = []; ys = []
    for y in range(y0, min(y1, len(rows))):
        r = rows[y]
        for x in range(x0, min(x1, w)):
            px = r[x * bpp:(x + 1) * bpp]; R, G, B = px[0], px[1], px[2]
            hit = (B > R + 60 and B > 120) if kind == 'blue' else (R > 230 and 90 < G < 140 and 70 < B < 130) if kind == 'coral' else (px[3] > 16 if bpp == 4 else R + G + B < 700)
            if hit: xs.append(x); ys.append(y)
    print(path, kind, 'bbox', min(xs), min(ys), max(xs), max(ys), 'w', max(xs) - min(xs) + 1, 'h', max(ys) - min(ys) + 1) if xs else print('none')
