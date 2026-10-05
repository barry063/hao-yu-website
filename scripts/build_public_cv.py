"""Build a public academic CV from the reviewed public-content inventory.

Requires reportlab. Leaves the private master CV and its exports untouched.
Run from any working directory; output is assets/Hao_Yu_CV.pdf.
"""

import hashlib
import json
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether,
)

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "content/site.json"
DATA = json.loads(SOURCE.read_text(encoding="utf-8"))
RECORDS = {record["id"]: record for record in DATA["records"]}
for record in RECORDS.values():
    if record["visibility"] != "PUBLIC" or record["evidence_status"] not in {
        "VERIFIED", "APPLICANT_CONFIRMED"
    }:
        raise ValueError(f"Uncleared CV record: {record['id']}")

FONT_PATHS = [Path("C:/Windows/Fonts/calibri.ttf"), Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")]
BOLD_PATHS = [Path("C:/Windows/Fonts/calibrib.ttf"), Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")]
font_path = next((path for path in FONT_PATHS if path.exists()), None)
bold_path = next((path for path in BOLD_PATHS if path.exists()), None)
if font_path and bold_path:
    pdfmetrics.registerFont(TTFont("CV", str(font_path)))
    pdfmetrics.registerFont(TTFont("CV-Bold", str(bold_path)))
    pdfmetrics.registerFontFamily("CV", normal="CV", bold="CV-Bold", italic="CV", boldItalic="CV-Bold")
    normal, bold = "CV", "CV-Bold"
else:
    normal, bold = "Helvetica", "Helvetica-Bold"

INK = colors.HexColor("#172322")
ACCENT = colors.HexColor("#1b514b")
styles = getSampleStyleSheet()
body = ParagraphStyle("CVBody", fontName=normal, fontSize=10, leading=12.7, textColor=INK, spaceAfter=5)
small = ParagraphStyle("CVSmall", parent=body, fontSize=9, leading=11.5, spaceAfter=4)
heading = ParagraphStyle("CVHeading", parent=body, fontName=bold, fontSize=12, leading=15, textColor=ACCENT, spaceBefore=12, spaceAfter=7)
item_title = ParagraphStyle("CVItem", parent=body, fontName=bold, fontSize=10.2, leading=13, spaceBefore=6, spaceAfter=4)
name = ParagraphStyle("CVName", parent=body, fontName=bold, fontSize=26, leading=29, spaceAfter=7)


def plain(text):
    # ASCII dashes and formula subscripts are portable across PDF fonts.
    return str(text).replace("–", "-").replace("—", "-").replace("−", "-").replace("₂", "2").replace("₃", "3")


def para(text, style=body):
    return Paragraph(escape(plain(text)), style)


story = [para("Hao Yu", name), para("PhD researcher in Engineering | University of Cambridge", item_title)]
story.append(Paragraph('<a href="mailto:hy377@cam.ac.uk" color="#1b514b">hy377@cam.ac.uk</a> | Cambridge, United Kingdom', body))
story.append(Paragraph('<a href="https://barry063.github.io/hao-yu-website/" color="#1b514b">Website</a> | <a href="https://orcid.org/0000-0003-1722-7909" color="#1b514b">ORCID: 0000-0003-1722-7909</a> | <a href="https://github.com/barry063" color="#1b514b">GitHub: barry063</a>', small))
story.append(para("Research profile", heading))
story.append(para(RECORDS["PROFILE"]["text"][0]))
story.append(para("Education", heading))
for record_id in ["EDU-CAM", "EDU-OX"]:
    record = RECORDS[record_id]
    story.append(KeepTogether([para(record["title"] + " | " + record["dates"], item_title)] + [para(text, small) for text in record["text"]]))
story.append(para("Selected research contributions", heading))
for record_id in ["PROJECT-CSS", "PROJECT-WS2", "PROJECT-MOS2", "PROJECT-SOFTWARE", "PROJECT-PHOTONICS"]:
    record = RECORDS[record_id]
    text = " ".join(record["text"][1:])
    # Context and direct contribution are sufficient; avoid repeated promotional endings.
    if record_id == "PROJECT-PHOTONICS":
        text = record["text"][1]
    if record_id == "PROJECT-SOFTWARE":
        text = record["text"][1]
    story.append(KeepTogether([para(record["title"] + " | " + record["dates"], item_title), para(text, small)]))

story.append(PageBreak())
story.append(para("Research outputs", heading))
story.append(para("Published journal articles", item_title))
short_authors = {
    "J1": "Hao Yu et al. (first author).",
    "J2": "Sunvir Sahota et al., including Hao Yu.",
    "J3": "Nikolaos Farmakidis, Hao Yu et al. (second author).",
    "J4": "Minfei Jian et al., including Hao Yu.",
}
for record_id in ["J1", "J2", "J3", "J4"]:
    record = RECORDS[record_id]
    link = record["links"][0]["url"]
    citation = f'{short_authors[record_id]} {record["title"]}. {record["text"][1]} ({record["dates"]}).'
    items = [para(citation, small), para(record["text"][2], small)]
    items.append(Paragraph(f'<a href="{escape(link)}" color="#1b514b">{escape(link.removeprefix("https://doi.org/"))}</a>', small))
    if record_id == "J3":
        correction = record["links"][1]["url"]
        items.append(Paragraph(f'<a href="{escape(correction)}" color="#1b514b">Associated correction: {escape(correction.removeprefix("https://doi.org/"))}</a>', small))
    items.append(Spacer(1, 3))
    story.append(KeepTogether(items))
for record_id in ["S1", "P1", "SW1"]:
    record = RECORDS[record_id]
    story.append(KeepTogether([para(record["dates"] + ": " + record["title"], item_title)] + [para(text, small) for text in record["text"]]))
story.append(para("Experience", heading))
for record_id in ["EXP-INNO", "EXP-JUDGE", "EXP-BOE"]:
    record = RECORDS[record_id]
    story.append(KeepTogether([para(record["title"] + " | " + record["dates"], item_title), para(" ".join(record["text"]), small)]))
story.append(para("Selected honours and funding", heading))
for record_id in ["A1", "A2", "A3"]:
    record = RECORDS[record_id]
    story.append(para(record["title"] + " | " + record["dates"], small))


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#dcded8"))
    canvas.line(18 * mm, 15 * mm, A4[0] - 18 * mm, 15 * mm)
    canvas.setFont(normal, 8)
    canvas.setFillColor(colors.HexColor("#526160"))
    canvas.drawString(18 * mm, 10 * mm, "Hao Yu | Public academic CV | Updated 5 October 2026")
    canvas.drawRightString(A4[0] - 18 * mm, 10 * mm, str(doc.page))
    canvas.restoreState()


output = ROOT / "assets/Hao_Yu_CV.pdf"
document = SimpleDocTemplate(str(output), pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=14 * mm, bottomMargin=21 * mm,
                             title="Hao Yu - Public academic CV", author="Hao Yu", pageCompression=1)
document.build(story, onFirstPage=footer, onLaterPages=footer)
print(f"Built {output.name}; source SHA256 {hashlib.sha256(SOURCE.read_bytes()).hexdigest()}")
print(f"PDF SHA256 {hashlib.sha256(output.read_bytes()).hexdigest()}")
