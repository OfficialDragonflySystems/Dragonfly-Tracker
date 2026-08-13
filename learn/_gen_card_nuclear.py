"""Generate the 1200x630 og:card for the nuclear-for-AI deep dive.
House style: near-black #070b10, teal/lime Dragonfly accents, Georgia headline. Run once:
    python Tracker/learn/_gen_card_nuclear.py
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

GEO = lambda s: font("georgiab.ttf", s)      # Georgia Bold - headline
ARI = lambda s: font("arialbd.ttf", s)       # Arial Bold - labels
ARR = lambda s: font("arial.ttf", s)         # Arial - sub-hook


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


def card_nuclear():
    img, d = base()
    kicker(d, "THE LENS  \u00B7  WHAT'S REAL, WHAT'S YEARS AWAY")
    y = headline(d, ["Big Tech is going nuclear.", "Most of it is a decade away."], 138, 56, 74)
    y = sub(d, "The real megawatts come from restarting old reactors. Small reactors and fusion are targets - and the fuel is enriched by rivals.", y + 20)
    # motif: three "clock" bars on a timeline - now / 2030s / 2040s
    my = 476
    bars = [("RESTARTS", "NOW", LIME, 300), ("SMRs", "2030s", TEAL, 210), ("FUSION", "2040s", WARN, 120)]
    x = 64
    fL = ARI(20)
    fS = ARR(17)
    for label, when, col, blen in bars:
        d.rounded_rectangle((x, my, x + 330, my + 74), radius=12, outline=col, width=3, fill=PANEL)
        d.text((x + 18, my + 12), label, font=fL, fill=INK)
        d.text((x + 18, my + 42), when, font=fS, fill=MUTED)
        d.rectangle((x + 175, my + 48, x + 175 + blen // 2, my + 54), fill=col)
        x += 358
    lockup(d)
    tag(d, "Every date sourced")
    img.convert("RGB").save(os.path.join(HERE, "nuclear-for-ai-card.png"), "PNG")
    print("wrote nuclear-for-ai-card.png")


if __name__ == "__main__":
    card_nuclear()
