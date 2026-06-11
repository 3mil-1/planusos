"""Generuje ikony PWA (PNG) dla PlanUSOS."""
from PIL import Image, ImageDraw
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "icons"
OUT.mkdir(exist_ok=True)

S = 1024  # rozmiar bazowy


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def make_base() -> Image.Image:
    img = Image.new("RGB", (S, S))
    c1, c2 = (33, 41, 92), (108, 140, 255)  # granat -> indygo
    px = img.load()
    for y in range(S):
        for x in range(S):
            t = (x + y) / (2 * S)
            px[x, y] = lerp(c1, c2, t)

    d = ImageDraw.Draw(img)

    # biała karta kalendarza
    m = int(S * 0.16)
    top = int(S * 0.22)
    bottom = S - m
    d.rounded_rectangle([m, top, S - m, bottom], radius=int(S * 0.07), fill=(240, 242, 252))

    # nagłówek kalendarza
    head_h = int(S * 0.14)
    d.rounded_rectangle([m, top, S - m, top + head_h + int(S * 0.07)],
                        radius=int(S * 0.07), fill=(56, 217, 201))
    d.rectangle([m, top + head_h, S - m, top + head_h + int(S * 0.07)], fill=(240, 242, 252))

    # "uszy" kalendarza
    ear_w, ear_h = int(S * 0.045), int(S * 0.14)
    for cx in (int(S * 0.33), int(S * 0.67)):
        d.rounded_rectangle([cx - ear_w, top - ear_h // 2, cx + ear_w, top + ear_h // 2],
                            radius=ear_w, fill=(27, 32, 56))

    # bloczki zajęć
    colors = [(108, 140, 255), (255, 143, 171), (255, 209, 102),
              (56, 217, 201), (155, 140, 255), (125, 220, 111)]
    grid_l = m + int(S * 0.07)
    grid_r = S - m - int(S * 0.07)
    grid_t = top + head_h + int(S * 0.09)
    grid_b = bottom - int(S * 0.06)
    cols, rows = 3, 2
    cw = (grid_r - grid_l) / cols
    ch = (grid_b - grid_t) / rows
    gap = int(S * 0.02)
    i = 0
    for r in range(rows):
        for c in range(cols):
            x0 = grid_l + c * cw + gap
            y0 = grid_t + r * ch + gap
            x1 = grid_l + (c + 1) * cw - gap
            y1 = grid_t + (r + 1) * ch - gap
            d.rounded_rectangle([x0, y0, x1, y1], radius=int(S * 0.025), fill=colors[i % len(colors)])
            i += 1
    return img


def save(img: Image.Image, size: int, name: str):
    img.resize((size, size), Image.LANCZOS).save(OUT / name, "PNG")
    print("zapisano", OUT / name)


base = make_base()
save(base, 512, "icon-512.png")
save(base, 192, "icon-192.png")
save(base, 180, "apple-touch-icon.png")
