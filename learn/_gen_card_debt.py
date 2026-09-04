"""og:card for The Debt Machine deep dive. Reuses house helpers.
Run: python Tracker/learn/_gen_card_debt.py
The motif IS the thesis: a tiny bar of actual trading against a huge bar of repriced market.
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from _gen_card_optical import base, kicker, headline, sub, lockup, tag, ARR, ARI, MUTED, TEAL, LIME, WARN, INK, W, H  # noqa


def card():
    img, d = base()
    kicker(d, "THE LENS  ·  DEBT, MONEY, AND THE LONG GAME")
    y = headline(d, ["$280 million moved", "a $7.2 trillion market."], 122, 56, 74)
    y = sub(d, "Japan's bond market is not a solvency story. It is a liquidity one - and the reason is that the buyer left.", y + 18)

    # motif: the ratio, drawn to scale-ish. Tiny warn bar vs long lime bar.
    my = 432
    d.text((64, my), "TRADED", font=ARI(17), fill=WARN)
    d.rounded_rectangle((190, my - 2, 202, my + 20), radius=3, fill=WARN)
    d.text((216, my), "$280M", font=ARR(19), fill=MUTED)

    ly = my + 44
    d.text((64, ly), "REPRICED", font=ARI(17), fill=LIME)
    d.rounded_rectangle((190, ly - 2, 1010, ly + 20), radius=3, fill=LIME)
    d.text((190, ly + 30), "$7.2 TRILLION  ·  ~$41B of value destroyed across the curve", font=ARR(19), fill=MUTED)

    lockup(d)
    tag(d, "Every number sourced")
    img.convert("RGB").save(os.path.join(HERE, "debt-machine-card.png"), "PNG")
    print("wrote debt-machine-card.png")


if __name__ == "__main__":
    card()
