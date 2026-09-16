"""og:card for Scorecard Revisited. Reuses house helpers.
Run: python Tracker/learn/_gen_card_scorecard.py
The motif IS the piece: the four June tests with their September direction.
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from _gen_card_optical import base, kicker, headline, sub, lockup, tag, ARR, ARI, MUTED, TEAL, LIME, WARN, INK, W, H  # noqa

BAD = (248, 113, 113)
GOLD = (251, 191, 36)


def card():
    img, d = base()
    kicker(d, "THE LENS  -  SCORING OUR OWN HOMEWORK")
    y = headline(d, ["We wrote down what would settle it.", "Here is the score."], 122, 52, 68)
    y = sub(d, "Four AI-bubble tests, published in June, scored in September - including what we missed.", y + 14)

    rows = [
        ("1  Savings or credit?", "WORSE", BAD),
        ("2  Capacity ahead of demand?", "BETTER", LIME),
        ("3  Circular financing?", "WORSE", BAD),
        ("4  Narrative doing the work?", "LIVE", GOLD),
    ]
    ry = max(y + 26, 352)
    for label, verdict, col in rows:
        d.text((64, ry), label, font=ARR(22), fill=INK)
        d.rounded_rectangle((700, ry - 3, 860, ry + 27), radius=6, outline=col, width=2)
        d.text((718, ry), verdict, font=ARI(20), fill=col)
        ry += 44

    lockup(d)
    tag(d, "Every number sourced")
    img.convert("RGB").save(os.path.join(HERE, "scorecard-revisited-card.png"), "PNG")
    print("wrote scorecard-revisited-card.png")


if __name__ == "__main__":
    card()
