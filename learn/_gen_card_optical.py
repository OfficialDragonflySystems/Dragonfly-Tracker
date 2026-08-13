"""Generate the 1200x630 og:card for the optical-interconnect deep dive (DRAFT).
House style: near-black #070b10, teal/lime Dragonfly accents, Georgia headline. Run once:
    python Tracker/learn/_gen_card_optical.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 1200, 630
BG = (7, 11, 16)
INK = (233, 238, 246)
MUTED = (147, 163, 184)
TEAL = (94, 234, 212)
LIME = (74, 222, 128)
WARN = (246, 169, 107)
PANEL = (19, 30, 43)
LINE = (34, 48, 63)

FONTS = "C:/Windows/Fonts/"
def font(name, size):
    for cand in (name, "arial.ttf"):
        try:
            return ImageFont.truetype(FONTS + cand, size)
        except Exception:
            continue
    return ImageFont.load_default()

GEO = lambda s: font("georgiab.ttf", s)
ARI = lambda s: font("arialbd.ttf", s)
ARR = lambda s: font("arial.ttf", s)


def wrap(draw, text, fnt, maxw):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=fnt) <= maxw:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def glow(img):
    g = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(g)
    cx, cy = 1050, 560
    for r, a in ((520, 10), (400, 12), (280, 14), (170, 16)):
        gd.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(20, 90, 82, a))
    img.alpha_composite(g)


def base():
    img = Image.new("RGBA", (W, H), BG + (255,))
    glow(img)
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, W - 1, H - 1), outline=LINE, width=2)
    return img, d


def lockup(d):
    cx, cy, r = 74, H - 60, 10
    d.polygon([(cx, cy - r), (cx + r, cy), (cx, cy + r), (cx - r, cy)], outline=LIME, width=3)
    d.text((98, H - 74), "Dragonfly Lens", font=ARI(26), fill=LIME)


def kicker(d, text):
    d.text((64, 70), text, font=ARI(20), fill=TEAL)


def headline(d, lines, y0, size, lh):
    y = y0
    for ln in lines:
        d.text((64, y), ln, font=GEO(size), fill=INK)
        y += lh
    return y


def sub(d, text, y):
    for ln in wrap(d, text, ARR(24), 1010):
        d.text((64, y), ln, font=ARR(24), fill=MUTED)
        y += 34
    return y


def tag(d, text):
    f = ARR(19)
    w = d.textlength(text, font=f)
    d.text((W - 64 - w, H - 66), text, font=f, fill=MUTED)


def card_optical():
    img, d = base()
    kicker(d, "THE LENS  \u00B7  THE BOTTLENECK AFTER THE MEMORY WALL")
    y = headline(d, ["AI's next bottleneck is", "the wire between the chips."], 138, 56, 74)
    y = sub(d, "Copper has run out of road. Data is going optical - and the lasers need a rare crystal only a few firms make. \"Worse than memory.\"", y + 20)
    # motif: chip --copper(short,fading)--> chip   vs   chip ==light(long)==> chip
    my = 424
    # copper row (short dashed, warns)
    d.rounded_rectangle((64, my, 120, my + 44), radius=8, outline=WARN, width=3)
    dash_x = 128
    for i in range(4):
        d.line((dash_x + i * 22, my + 22, dash_x + i * 22 + 12, my + 22), fill=WARN, width=3)
    d.text((228, my + 10), "COPPER: fades fast", font=ARR(19), fill=MUTED)
    # light row (long solid, lime)
    ly = my + 60
    d.rounded_rectangle((64, ly, 120, ly + 44), radius=8, outline=LIME, width=3)
    d.line((128, ly + 22, 470, ly + 22), fill=LIME, width=4)
    d.polygon([(470, ly + 16), (486, ly + 22), (470, ly + 28)], fill=LIME)
    d.rounded_rectangle((492, ly, 548, ly + 44), radius=8, outline=LIME, width=3)
    d.text((560, ly + 10), "LIGHT: carries clean", font=ARR(19), fill=MUTED)
    lockup(d)
    tag(d, "Every number sourced")
    img.convert("RGB").save(os.path.join(HERE, "optical-bottleneck-card.png"), "PNG")
    print("wrote optical-bottleneck-card.png")


if __name__ == "__main__":
    card_optical()
