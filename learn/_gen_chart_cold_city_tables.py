"""Generate two table-graphic PNGs for "The vertical farm was never the answer. The boiler is."
(cold-city-food), for the Substack one-shot paste kit - same reasoning as
_gen_chart_jobs_table.py: Substack strips pasted HTML tables to plain text, so these ship as
images instead. House dark style: near-black #070b10, teal/lime accents, Georgia headline.

    python Tracker/learn/_gen_chart_cold_city_tables.py
"""
import os
import textwrap
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
W = 1200
BG = (7, 11, 16)
STRIPE = (13, 19, 26)
INK = (233, 238, 246)
MUTED = (147, 163, 184)
TEAL = (94, 234, 212)
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


def text_right(d, x_right, y, s, fnt, fill):
    w = d.textlength(s, font=fnt)
    d.text((x_right - w, y), s, font=fnt, fill=fill)


def header(d, title, subtitle):
    d.text((56, 44), "DRAGONFLY LENS", font=ARI(18), fill=TEAL)
    d.text((56, 72), "WHERE THE WORK WILL BE" if False else "WHAT WOULD ACTUALLY FIX THIS",
           font=ARI(18), fill=MUTED)
    d.text((56, 108), title, font=GEO(26), fill=INK)
    d.text((56, 144), subtitle, font=ARR(16), fill=MUTED)


# ---------------------------------------------------------------------------
# Table 1: the graveyard (Company / Raised-peak / Outcome) - Outcome cells are long,
# so this uses a stacked card layout per row instead of a strict grid: it reads better
# than forcing a paragraph-length sentence into a narrow right-aligned column.
# ---------------------------------------------------------------------------
GRAVEYARD = [
    ("Plenty Unlimited", "nearly $1bn raised", "Chapter 11, March 2025"),
    ("Bowery Farming", "$700M raised, $2.3bn peak valuation",
     "Halted operations late 2024, assets liquidated"),
    ("AeroFarms", "-",
     "Chapter 11, June 2023 (D. Del.); scheduled liabilities $82.9M"),
    ("AppHarvest", "-",
     "Chapter 11, July 2023 (S.D. Tex.); total liabilities $341M at Q1 2023, "
     "including about $191M of funded secured debt"),
]


def gen_graveyard():
    body_font = ARR(18)
    label_font = ARI(19)
    muted_font = ARR(17)
    wrap_width = 74
    row_pad_top, row_pad_bottom, line_h = 14, 16, 24

    rows_wrapped = []
    for name, raised, outcome in GRAVEYARD:
        lines = textwrap.wrap(outcome, width=wrap_width) or [""]
        rows_wrapped.append((name, raised, lines))

    top_pad = 178
    y = top_pad
    row_tops = []
    for name, raised, lines in rows_wrapped:
        row_tops.append(y)
        row_h = row_pad_top + line_h + (len(lines) * line_h) + row_pad_bottom
        y += row_h
    total_h = y + 60

    img = Image.new("RGB", (W, total_h), BG)
    d = ImageDraw.Draw(img)
    header(d, "The graveyard", "Selected indoor-farming failures, funding and outcome")

    for i, ((name, raised, lines), rtop) in enumerate(zip(rows_wrapped, row_tops)):
        row_h = row_pad_top + line_h + (len(lines) * line_h) + row_pad_bottom
        if i % 2 == 1:
            d.rectangle([0, rtop, W, rtop + row_h], fill=STRIPE)
        ty = rtop + row_pad_top
        d.text((56, ty), name, font=label_font, fill=INK)
        text_right(d, W - 56, ty, raised, body_font, TEAL if raised != "-" else MUTED)
        ty2 = ty + line_h
        for ln in lines:
            d.text((56, ty2), ln, font=muted_font, fill=MUTED)
            ty2 += line_h

    d.line([(56, total_h - 46), (W - 56, total_h - 46)], fill=LINE, width=1)
    d.text((56, total_h - 34),
           "Raised/peak and outcome figures per company - trade press for AeroFarms/AppHarvest "
           "liabilities corrected to filed amounts (see sources).",
           font=ARR(14), fill=MUTED)

    out = os.path.join(HERE, "cold-city-food-graveyard-table.png")
    img.save(out, "PNG")
    print("wrote", out, os.path.getsize(out), "bytes", "size", img.size)


# ---------------------------------------------------------------------------
# Table 2: Canadian greenhouse yields - short numeric cells, same grid pattern as
# jobs-openings-table.png.
# ---------------------------------------------------------------------------
YIELDS = [
    ("Cucumbers", "304,335 t", "6,922,451 m2", "44.0 kg/m2"),
    ("Lettuce", "18,220 t", "383,002 m2", "47.6 kg/m2"),
    ("Tomatoes", "350,907 t", "7,378,671 m2", "47.6 kg/m2"),
    ("Peppers", "175,546 t", "7,082,766 m2", "24.8 kg/m2"),
]
Y_COL_RIGHT = {"prod": 660, "area": 940, "yield": 1144}
Y_HEADERS = {
    "prod": ("Production", "2024"),
    "area": ("Harvested", "area"),
    "yield": ("Yield",  "per m2"),
}


def gen_yields():
    row_h, header_h, top_pad, footer_h = 46, 56, 178, 86
    total_h = top_pad + header_h + row_h * len(YIELDS) + footer_h
    img = Image.new("RGB", (W, total_h), BG)
    d = ImageDraw.Draw(img)
    header(d, "What Canada actually grows in glass",
           "National production, harvested area and yield, 2024")

    hy = top_pad
    for key, (l1, l2) in Y_HEADERS.items():
        x = Y_COL_RIGHT[key]
        text_right(d, x, hy, l1, ARI(15), MUTED)
        text_right(d, x, hy + 18, l2, ARI(15), MUTED)
    d.line([(56, top_pad + header_h - 6), (W - 56, top_pad + header_h - 6)], fill=LINE, width=1)

    y = top_pad + header_h
    for i, (crop, prod, area, yld) in enumerate(YIELDS):
        if i % 2 == 1:
            d.rectangle([0, y, W, y + row_h], fill=STRIPE)
        ty = y + (row_h - 20) // 2
        d.text((56, ty), crop, font=ARR(20), fill=INK)
        text_right(d, Y_COL_RIGHT["prod"], ty, prod, ARR(19), MUTED)
        text_right(d, Y_COL_RIGHT["area"], ty, area, ARR(19), MUTED)
        text_right(d, Y_COL_RIGHT["yield"], ty, yld, ARI(20), TEAL)
        y += row_h

    d.line([(56, y), (W - 56, y)], fill=LINE, width=1)
    for j, ln in enumerate(textwrap.wrap(
            "Yield = production / harvested area, our own arithmetic. Source: Agriculture and "
            "Agri-Food Canada, Statistical Overview of the Canadian Greenhouse Vegetable "
            "Industry, 2024 edition, tables 1.3/1.5.", width=118)):
        d.text((56, y + 16 + j * 20), ln, font=ARR(14), fill=MUTED)

    out = os.path.join(HERE, "cold-city-food-yields-table.png")
    img.save(out, "PNG")
    print("wrote", out, os.path.getsize(out), "bytes", "size", img.size)


if __name__ == "__main__":
    gen_graveyard()
    gen_yields()
