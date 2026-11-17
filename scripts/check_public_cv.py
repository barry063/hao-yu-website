"""Verify current selected public CV fields and page bounds; no fixed output count."""
from pathlib import Path
import re
import sys
import json
import pdfplumber
from check_reviewed_cv import check_reviewed_cv

root = Path(__file__).resolve().parents[1]
args = sys.argv[1:]
locale = 'en'
if '--locale' in args:
    at = args.index('--locale')
    assert at + 1 < len(args) and args[at + 1] in ['en', 'zh'], 'Unsupported CV locale'
    locale = args[at + 1]
    del args[at:at + 2]
assert len(args) <= 2, 'Usage: check_public_cv.py [pdf] [data-json] [--locale en|zh]'
data = json.loads((Path(args[1]) if len(args) > 1 else root / 'content/site.json').read_text(encoding='utf-8'))
filename = Path(args[0]) if args else root / ('assets/Hao_Yu_CV_CN.pdf' if locale == 'zh' else 'assets/Hao_Yu_CV.pdf')
descriptor = 'cv_document_zh' if locale == 'zh' else 'cv_document'
if locale == 'zh':
    assert data['presentation'].get(descriptor), 'Chinese PDF requires an independently reviewed document'
if data['presentation'].get(descriptor):
    check_reviewed_cv(filename, data, locale)
    sys.exit(0)
def plain(value):
    return str(value).replace('–', '-').replace('—', '-').replace('−', '-').replace('₂', '2').replace('₃', '3')
with pdfplumber.open(filename) as pdf:
    assert len(pdf.pages) >= 1, 'Empty public PDF'
    text = "\n".join(page.extract_text() for page in pdf.pages)
    folded = re.sub(r'\s+', ' ', text)
    expected = [data['profile']['name'], data['profile']['role'], data['profile']['email']]
    expected_links = [data['presentation']['url'], 'mailto:' + data['profile']['email']]
    for output in data['outputs']:
        if not output['selected']:
            continue
        expected.append(output['title'])
        if output['status'] != 'PUBLISHED':
            expected.append(output['status'].replace('_', ' ').capitalize() + ': ' + output['title'])
        else:
            for link in output['links']:
                expected.append(link['url'].removeprefix('https://doi.org/'))
                expected_links.append(link['url'])
    for required in expected:
        assert plain(required) in folded, 'Missing selected public CV content'
    actual_links = {link['uri'] for page in pdf.pages for link in page.hyperlinks}
    assert all(url in actual_links for url in expected_links), 'Missing selected public CV hyperlinks'
    # Review markers are forbidden; the ordinary verb "verify" is valid prose.
    assert not re.search(r"\[\s*(?i:VERIFY|TODO)\s*\]|\b(?:VERIFY|TODO)\b", text), "Unresolved review marker"
    assert not re.search(r"CEng|CB2|07529|7529|nn-\d{4}-|MQT-\d+|top 5%", text, re.I), "Private or unsupported claim"
    for page in pdf.pages:
        for word in page.extract_words():
            assert 45 <= word['x0'] < word['x1'] <= page.width - 45, f"Text exceeds horizontal margin: {word['text']}"
            assert word['top'] >= 30 and word['bottom'] <= page.height - 20, "Text exceeds page boundary"
            if word['top'] < 795:  # Excludes the known footer, whose baseline is at 10 mm.
                assert word['bottom'] < 780, "Body text intrudes into footer area"
    page_count = len(pdf.pages)
print(f"PASS: {page_count}-page public CV; selected outputs, profile, privacy, links and text bounds.")
