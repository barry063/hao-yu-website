"""Build only an isolated public candidate from normalised reviewed data. Never writes root assets."""

import argparse
import reportlab
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
parser = argparse.ArgumentParser()
parser.add_argument('--data', required=True)
parser.add_argument('--output', required=True)
args = parser.parse_args()
SOURCE = Path(args.data)
DATA = json.loads(SOURCE.read_text(encoding="utf-8"))
if reportlab.Version != '4.4.9':
    raise ValueError('Pinned reportlab version required')
RECORDS = {record["id"]: record for record in DATA["records"]}
for record in RECORDS.values():
    if record["visibility"] != "PUBLIC" or record["evidence_status"] not in {
        "VERIFIED", "APPLICANT_CONFIRMED"
    }:
        raise ValueError(f"Uncleared CV record: {record['id']}")

font_dir = ROOT / 'build-resources/fonts'
font_hashes = json.loads((font_dir / 'hashes.json').read_text())
for filename, expected in font_hashes.items():
    if hashlib.sha256((font_dir / filename).read_bytes()).hexdigest() != expected:
        raise ValueError('Pinned font hash mismatch')
pdfmetrics.registerFont(TTFont('CV', str(font_dir / 'Vera.ttf')))
pdfmetrics.registerFont(TTFont('CV-Bold', str(font_dir / 'VeraBd.ttf')))
pdfmetrics.registerFontFamily('CV', normal='CV', bold='CV-Bold', italic='CV', boldItalic='CV-Bold')
normal, bold = 'CV', 'CV-Bold'

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


story = [para(DATA["site"]["name"], name), para(DATA["site"]["role"] + " | " + DATA["site"]["institution"], item_title)]
story.append(Paragraph('<a href="mailto:' + escape(DATA['site']['email'], {'"': '&quot;'}) + '" color="#1b514b">' + escape(DATA['site']['email']) + '</a> | ' + escape(DATA['site']['location']), body))
profile_map = {p['id']: p for p in DATA['profiles']}
cv_links = [(DATA['site']['url'], 'Website')]
for key, label in [('ORCID', 'ORCID: '), ('GITHUB', 'GitHub: ')]:
    if key in profile_map:
        url = profile_map[key]['url']
        cv_links.append((url, label + url.rsplit('/', 1)[-1]))
story.append(Paragraph(' | '.join('<a href="' + escape(url, {'"': '&quot;'}) + '" color="#1b514b">' + escape(label) + '</a>' for url, label in cv_links), small))
story.append(para("Research profile", heading))
story.append(para(RECORDS["PROFILE"]["text"][0]))
story.append(para("Education", heading))
for record_id in [r['id'] for r in DATA['records'] if r['destination'] == 'education']:
    record = RECORDS[record_id]
    story.append(KeepTogether([para(record["title"] + " | " + record["dates"], item_title)] + [para(text, small) for text in record["text"]]))
story.append(para("Selected research contributions", heading))
for record_id in [r['id'] for r in DATA['records'] if r['destination'] == 'projects']:
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
published = [o for o in DATA['outputs'] if o['status'] == 'PUBLISHED']
if published:
    story.append(para('Published journal articles', item_title))
short_authors = DATA['cv_authors']
for record_id in [o['id'] for o in published]:
    record = RECORDS[record_id]
    link = record["links"][0]["url"]
    citation = f'{short_authors[record_id]} {record["title"]}. {record["text"][1]} ({record["dates"]}).'
    items = [para(citation, small), para(record["text"][2], small)]
    items.append(Paragraph(f'<a href="{escape(link)}" color="#1b514b">{escape(link.removeprefix("https://doi.org/"))}</a>', small))
    if len(record["links"]) > 1:
        correction = record["links"][1]["url"]
        items.append(Paragraph(f'<a href="{escape(correction)}" color="#1b514b">Associated correction: {escape(correction.removeprefix("https://doi.org/"))}</a>', small))
    items.append(Spacer(1, 3))
    story.append(KeepTogether(items))
for record_id in [o['id'] for o in DATA['outputs'] if o['status'] != 'PUBLISHED']:
    record = RECORDS[record_id]
    story.append(KeepTogether([para(record["dates"] + ": " + record["title"], item_title)] + [para(text, small) for text in record["text"]]))
story.append(para("Experience", heading))
for record_id in [r['id'] for r in DATA['records'] if r['destination'] == 'experience']:
    record = RECORDS[record_id]
    story.append(KeepTogether([para(record["title"] + " | " + record["dates"], item_title), para(" ".join(record["text"]), small)]))
story.append(para("Selected honours and funding", heading))
for record_id in [r['id'] for r in DATA['records'] if r['destination'] == 'awards']:
    record = RECORDS[record_id]
    story.append(para(record["title"] + " | " + record["dates"], small))


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#dcded8"))
    canvas.line(18 * mm, 15 * mm, A4[0] - 18 * mm, 15 * mm)
    canvas.setFont(normal, 8)
    canvas.setFillColor(colors.HexColor("#526160"))
    canvas.drawString(18 * mm, 10 * mm, plain(DATA["site"]["name"] + " | Public academic CV | Updated " + DATA["release_label"]))
    canvas.drawRightString(A4[0] - 18 * mm, 10 * mm, str(doc.page))
    canvas.restoreState()


output = Path(args.output).resolve()
if output == (ROOT / "assets/Hao_Yu_CV.pdf").resolve():
    raise ValueError("Root visitor files cannot be overwritten")
output.parent.mkdir(parents=True, exist_ok=True)
document = SimpleDocTemplate(str(output), pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=14 * mm, bottomMargin=21 * mm,
                             title=DATA["site"]["name"] + " - Public academic CV", author=DATA["site"]["name"], pageCompression=1, invariant=1)
document.build(story, onFirstPage=footer, onLaterPages=footer)
print(f"Built {output.name}; source SHA256 {hashlib.sha256(SOURCE.read_bytes()).hexdigest()}")
print(f"PDF SHA256 {hashlib.sha256(output.read_bytes()).hexdigest()}")
