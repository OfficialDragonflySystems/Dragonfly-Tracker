"""Generate 1200x630 og:cards for the memory-wall + musk-bottleneck deep dives.
House style: near-black #070b10, teal/lime Dragonfly accents, Georgia headline. Run once:
    python Tracker/learn/_gen_cards_aug10.py
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
    # cheap teal glow lower-right via concentric translucent ellipses
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
    # draw the diamond glyph (Arial lacks U+25C7) then the wordmark
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
    for ln in wrap(d, text, ARR(24), 1000):
        d.text((64, y), ln, font=ARR(24), fill=MUTED)
        y += 34
    return y


def tag(d, text):
    f = ARR(19)
    w = d.textlength(text, font=f)
    d.text((W - 64 - w, H - 66), text, font=f, fill=MUTED)


def card_memwall():
    img, d = base()
    kicker(d, "THE LENS  \u00B7  THE BOTTLENECK BEHIND THE BOTTLENECK")
    y = headline(d, ["AI's real bottleneck", "isn't the chip.", "It's the wall behind it."], 130, 62, 78)
    sub(d, "Anthropic is designing its own chips. AMD bought a startup that bakes models into silicon. Same target: the memory wall.", y + 22)
    # motif: chip -> long pipe -> memory stack (bottom band)
    my = 468
    d.rectangle((760, my, 815, my + 55), outline=TEAL, width=3)          # chip
    d.line((820, my + 27, 980, my + 27), fill=MUTED, width=3)            # pipe
    for i in range(5):                                                    # memory stack
        d.rectangle((986 + i * 14, my - 6, 996 + i * 14, my + 61), fill=(44, 90, 83))
    lockup(d)
    tag(d, "Plain English \u00B7 every number sourced")
    img.convert("RGB").save(os.path.join(HERE, "memory-wall-card.png"), "PNG")
    print("wrote memory-wall-card.png")


def card_musk():
    img, d = base()
    kicker(d, "THE LENS  \u00B7  HOW THE BUILDERS THINK")
    y = headline(d, ["Own the bottleneck.", "Don't rent it."], 150, 70, 88)
    sub(d, "Tesla makes the power. xAI the intelligence. The new $16.8B Terafab the chips. SpaceX the launch. One pattern under all of it.", y + 26)
    # motif: four labeled nodes in a row feeding each other
    labels = ["POWER", "COMPUTE", "CHIPS", "LAUNCH"]
    x0, my, gap = 70, 470, 275
    f = ARI(20)
    for i, lb in enumerate(labels):
        x = x0 + i * gap
        d.rounded_rectangle((x, my, x + 210, my + 60), radius=12, outline=TEAL if i % 2 == 0 else LIME, width=3, fill=PANEL)
        tw = d.textlength(lb, font=f)
        d.text((x + 105 - tw / 2, my + 19), lb, font=f, fill=INK)
        if i < 3:
            d.line((x + 210, my + 30, x + gap, my + 30), fill=MUTED, width=3)
            d.polygon([(x + gap - 8, my + 25), (x + gap, my + 30), (x + gap - 8, my + 35)], fill=MUTED)
    lockup(d)
    tag(d, "Analysis, not admiration")
    img.convert("RGB").save(os.path.join(HERE, "musk-bottleneck-card.png"), "PNG")
    print("wrote musk-bottleneck-card.png")


def card_whylens():
    img, d = base()
    kicker(d, "THE LENS  ·  READ THIS FIRST")
    y = headline(d, ["Why Dragonfly Lens", "exists"], 150, 70, 88)
    y = sub(d, "Honest, plain-English research you can check - including a public log of when we're wrong.", y + 26)
    # three-pillar tagline
    d.text((64, 470), "Sourced.  Plain-English.  We own our misses.", font=ARI(22), fill=TEAL)
    lockup(d)
    tag(d, "Built for regular people, not Wall Street")
    img.convert("RGB").save(os.path.join(HERE, "why-the-lens-card.png"), "PNG")
    print("wrote why-the-lens-card.png")


def card_squeeze():
    img, d = base()
    kicker(d, "THE LENS  ·  HOW THE GAME REALLY WORKS")
    y = headline(d, ["GameStop wasn't magic.", "It was a setup you", "can learn to read."], 128, 58, 74)
    sub(d, "How a short squeeze really works, how to read the setup yourself - and the part nobody tells you: most who chased it late lost.", y + 16)
    lockup(d)
    tag(d, "We show the data. You decide.")
    img.convert("RGB").save(os.path.join(HERE, "short-squeeze-card.png"), "PNG")
    print("wrote short-squeeze-card.png")


if __name__ == "__main__":
    card_memwall()
    card_musk()
    card_whylens()
    card_squeeze()
