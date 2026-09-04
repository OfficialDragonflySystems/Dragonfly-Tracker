"""og:card for the Americas Trade deep dive (DRAFT). Reuses house helpers. Run: python Tracker/learn/_gen_card_americas.py"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from _gen_card_optical import base, kicker, headline, sub, lockup, tag, ARR, MUTED, TEAL, LIME, WARN, W, H  # noqa

def card():
    img, d = base()
    kicker(d, "THE LENS  ·  RESOURCES, MONEY, AND THE LONG GAME")
    headline(d, ["The Americas Trade:", "what the hemisphere strategy", "is actually betting on."], 128, 46, 60)
    y = sub(d, "The doctrine in its own words, both readings steelmanned, the full resource balance sheet - and a dated scorecard: what makes sense now, what needs 20 years, what can't be judged yet.", 318)
    # motif: two clocks
    cy = 470
    d.text((64, cy), "SHORT GAME  2-6 yrs", font=ARR(18), fill=WARN)
    d.rounded_rectangle((64, cy + 28, 64 + 110, cy + 42), radius=6, fill=WARN)
    d.text((64, cy + 52), "elections", font=ARR(14), fill=MUTED)
    d.text((420, cy), "LONG GAME  16-18 yrs to open a mine", font=ARR(18), fill=LIME)
    d.rounded_rectangle((420, cy + 28, 420 + 600, cy + 42), radius=6, fill=LIME)
    d.text((420, cy + 52), "refineries, reactors, grids - the assets being fought over", font=ARR(14), fill=MUTED)
    lockup(d)
    tag(d, "Every number sourced. Verdicts dated.")
    img.convert("RGB").save(os.path.join(HERE, "americas-trade-card.png"), "PNG")
    print("wrote americas-trade-card.png")

if __name__ == "__main__":
    card()
