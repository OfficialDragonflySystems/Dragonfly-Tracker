"""Generate the 1200x630 og:cards for the two Aug-27 drafts (robot-decades, geothermal-heat).
Reuses the house-style helpers from _gen_card_optical.py. Run once:
    python Tracker/learn/_gen_cards_aug27.py
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from _gen_card_optical import base, kicker, headline, sub, lockup, tag, ARR, GEO, INK, MUTED, TEAL, LIME, WARN, W, H  # noqa


def card_robots():
    img, d = base()
    kicker(d, "THE LENS  ·  WORK, OWNERSHIP, AND THE MACHINES")
    headline(d, ["The Robot Decades:", "an honest timeline."], 138, 56, 74)
    y = sub(d, "Four scenarios for 2040, the rule that predicts which jobs go first, and the profession declared dead in 2016 that got a raise instead.", 300)
    # motif: 4 scenario bars (conservative -> musk-tier)
    labels = [("Conservative", 0.05, MUTED), ("Balanced", 0.12, TEAL), ("Aggressive", 0.25, LIME), ("Musk-tier", 0.5, WARN)]
    x0, by = 64, 386
    for i, (lab, share, col) in enumerate(labels):
        yy = by + i * 30
        d.text((x0, yy + 1), lab, font=ARR(17), fill=MUTED)
        bar_w = int(720 * share)
        d.rounded_rectangle((x0 + 150, yy + 5, x0 + 150 + bar_w, yy + 20), radius=6, fill=col)
    d.text((x0 + 150, by + 4 * 30 + 2), "robot share of physical work-hours, 2040 (projection)", font=ARR(15), fill=MUTED)
    lockup(d)
    tag(d, "Projections labelled. Numbers sourced.")
    img.convert("RGB").save(os.path.join(HERE, "robot-decades-card.png"), "PNG")
    print("wrote robot-decades-card.png")


def card_geothermal():
    img, d = base()
    kicker(d, "THE LENS  ·  FIRM POWER FOR THE AI BUILDOUT")
    headline(d, ["Geothermal went public.", "Then its flagship well blew out."], 138, 52, 70)
    y = sub(d, "The $1.9B IPO, the May 25 blowout, the 70% drilling-cost collapse - and the heat batteries scaling quietly beside it.", 292)
    # motif: promise (lime up-arrow) vs setback (warn down-arrow) on a timeline
    ty = 440
    d.line((64, ty, 1000, ty), fill=(34, 48, 63), width=3)
    for x, lab, col, up in ((120, "May 13  IPO $1.9B", LIME, True), (420, "May 25  blowout", WARN, False),
                            (720, "late 2026  first power (target)", TEAL, True)):
        d.ellipse((x - 7, ty - 7, x + 7, ty + 7), fill=col)
        d.text((x - 6, ty + 16 if up else ty - 44), lab, font=ARR(18), fill=col)
    lockup(d)
    tag(d, "Every number sourced")
    img.convert("RGB").save(os.path.join(HERE, "geothermal-heat-card.png"), "PNG")
    print("wrote geothermal-heat-card.png")


if __name__ == "__main__":
    card_robots()
    card_geothermal()
