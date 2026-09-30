"""Generate the 1200x630 og:card for "The vertical farm was never the answer".

House style: near-black #070b10, teal/lime Dragonfly accents, Georgia headline.
The card carries the comparison the piece is built on - the fastest-growing occupation
against the one nobody calls a growth industry - with both bars labelled in the SAME unit
(people needed per year), because a card that mixes units is how a chart lies.

    python Tracker/learn/_gen_card_jobs.py
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
GOLD = (251, 191, 36)
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


def main():
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    d.text((64, 52), "DRAGONFLY LENS", font=ARI(20), fill=TEAL)
    d.text((64, 84), "WHAT WOULD ACTUALLY FIX THIS", font=ARI(20), fill=MUTED)

    d.text((64, 140), "The vertical farm was", font=GEO(60), fill=INK)
    d.text((64, 212), "never the answer.", font=GEO(60), fill=INK)
    d.text((64, 284), "The boiler is.", font=GEO(60), fill=LIME)

    d.text((64, 372), "Canadian greenhouse yield, 2024 - kilograms per square metre",
           font=ARR(22), fill=MUTED)

    # two bars, same unit: people needed per year
    bars = [("Tomatoes  47.6 kg/m2", 47.6, TEAL, "in glass, with sunlight"),
            ("Peppers  24.8 kg/m2", 24.8, GOLD, "same glass, about half the yield")]
    maxv = 47.6
    y = 416
    for label, val, colour, note in bars:
        w = int(620 * (val / maxv))
        d.rounded_rectangle([64, y, 64 + max(w, 8), y + 46], radius=6, fill=colour)
        d.text((64 + max(w, 8) + 18, y + 12), label, font=ARI(23), fill=INK)
        d.text((64 + max(w, 8) + 18, y + 12 + 26), note, font=ARR(17), fill=MUTED)
        y += 84

    d.line([(64, 578), (W - 64, 578)], fill=LINE, width=1)
    d.text((64, 594), "Source: AAFC Statistical Overview 2024, from StatCan table 32-10-0456-01",
           font=ARR(17), fill=MUTED)

    out = os.path.join(HERE, "cold-city-food-card.png")
    img.save(out, "PNG")
    print("wrote", out, os.path.getsize(out), "bytes")


if __name__ == "__main__":
    main()
