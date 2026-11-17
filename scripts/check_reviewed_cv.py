"""Check the reviewed master-derived PDF against shared public facts and its hash."""
import hashlib
import json
import re
import unicodedata
from datetime import date
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode
import pdfplumber


def compact(value):
    value = unicodedata.normalize('NFKC', str(value)).casefold()
    return re.sub(r'\s+', '', value.translate(str.maketrans({'–': '-', '—': '-', '−': '-'})))


def link_identity(url):
    parts = urlsplit(url)
    if parts.hostname == 'scholar.google.com' and parts.path == '/citations':
        return urlunsplit(parts._replace(query=urlencode([(k, v) for k, v in parse_qsl(parts.query) if k != 'hl'])))
    return url.casefold() if parts.hostname == 'doi.org' else url


def check_reviewed_cv(filename, data, locale='en'):
    assert locale in ['en', 'zh'], 'Unsupported CV locale'
    if locale == 'zh':
        return check_chinese_cv(filename, data)
    document = data['presentation']['cv_document']
    assert hashlib.sha256(filename.read_bytes()).hexdigest() == document['sha256'], 'Reviewed CV hash mismatch'
    assert document['export_sha256'] == next(s['sha256'] for s in data['sources'] if s['id'] == 'EXPORT'), 'Master export needs renewed review'
    def clean(value):
        if isinstance(value, list):
            return [clean(v) for v in value]
        if isinstance(value, dict):
            return {k: clean(v) for k, v in value.items() if k != 'provenance'}
        return value
    facts = {k: clean(data[k]) for k in ['awards', 'experience', 'links', 'outputs', 'profile', 'qualification_events', 'qualifications']}
    encoded = json.dumps(facts, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode('utf-8')
    assert hashlib.sha256(encoded).hexdigest() == document['facts_sha256'], 'Shared facts or public selection need renewed CV review'
    with pdfplumber.open(filename) as pdf:
        assert len(pdf.pages) == document['pages'], 'Unexpected reviewed CV page count'
        # LaTeX chemical subscripts sit below the baseline: keep them on their line.
        text = compact('\n'.join(p.extract_text(y_tolerance=4, x_tolerance=2) or '' for p in pdf.pages))
        for field in ['name', 'email', 'institution', 'location']:
            assert compact(data['profile'][field]) in text, 'Missing shared profile field: ' + field
        # A master CV separates programme discipline from the research-role label.
        role = data['profile']['role']
        role = 'PhD researcher' if role == 'PhD researcher in Engineering' else role
        assert compact(role) in text, 'Public role differs from reviewed CV'
        for event in data['qualification_events']:
            if not event['selected']:
                continue
            label = {'THESIS_SUBMITTED': 'Thesis submitted', 'VIVA_COMPLETED': 'Viva completed', 'DEGREE_AWARDED': 'Degree awarded'}[event['kind']]
            d = date.fromisoformat(event['date'])
            assert compact(f'{label} {d.day} {d:%B %Y}') in text, 'Qualification milestone differs from reviewed CV'
        if not any(e['selected'] and e['kind'] == 'DEGREE_AWARDED' for e in data['qualification_events']):
            assert 'degreepending' in text, 'Pending degree status omitted'
        links = {link_identity(l['uri']) for p in pdf.pages for l in p.hyperlinks}
        required_links = [data['presentation']['url'], 'mailto:' + data['profile']['email']]
        required_links += [l['url'] for l in data['links'] if l['selected'] and l['id'] != 'GROUP']
        for output in data['outputs']:
            if not output['selected']:
                continue
            title = compact(output['title'])
            assert title in text, 'Missing CV output: ' + output['id']
            required_links += [l['url'] for l in output['links']]
            if output['kind'] == 'ARTICLE' and output['status'] != 'PUBLISHED':
                # Inspect the paragraph after the title, not unrelated status headings.
                at = text.index(title) + len(title)
                status = compact(output['status'].replace('_', ' '))
                assert status in text[at:at + 150], 'Manuscript status differs from reviewed CV'
            if output['status'] == 'PUBLISHED':
                for link in output['links']:
                    if 'doi.org/' in link['url']:
                        assert compact(link['url'].split('doi.org/')[1]) in text, 'Missing DOI'
        assert all(link_identity(url) in links for url in required_links), 'Missing shared public hyperlink'
        d = date.fromisoformat(document['date'])
        assert compact(f'Updated {d.day} {d:%B %Y}') in text, 'Incorrect CV update date'
        assert not re.search(r'verify|todo|ceng|cb2|07529|7529|nn-\d{4}-|mqt-\d+|academiccv|top5%', text), 'Private or unsupported content'
        for page in pdf.pages:
            for word in page.extract_words():
                assert 44 <= word['x0'] < word['x1'] <= page.width - 44, 'Text exceeds horizontal margins'
                assert 10 <= word['top'] < word['bottom'] <= page.height - 20, 'Text exceeds page bounds'
                # The fixed master layout has a running name and bottom update/page footer.
                if 30 <= word['top'] < 790:
                    assert word['bottom'] < 780, 'Body overlaps footer'
    print(f"PASS: {document['pages']}-page reviewed master CV; exact bytes, shared facts/statuses, links, privacy and bounds.")


def check_chinese_cv(filename, data):
    """Check the independently selected Chinese PDF, including its actual text."""
    document = data['presentation']['cv_document_zh']
    assert hashlib.sha256(filename.read_bytes()).hexdigest() == document['sha256'], 'Reviewed Chinese CV hash mismatch'
    source_hash = next(s['sha256'] for s in data['sources'] if s['id'] == 'CN_CV')
    assert document['export_sha256'] == source_hash == document['source_tex_sha256'], 'Chinese source needs renewed review'

    def clean(value):
        if isinstance(value, list):
            return [clean(v) for v in value]
        if isinstance(value, dict):
            return {k: clean(v) for k, v in value.items() if k != 'provenance'}
        return value

    facts = {k: clean(data[k]) for k in ['awards', 'experience', 'links', 'outputs', 'profile', 'qualification_events', 'qualifications']}
    encoded = json.dumps(facts, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode('utf-8')
    assert hashlib.sha256(encoded).hexdigest() == document['facts_sha256'], 'Shared facts or public selection need renewed Chinese CV review'
    selected = {}
    for field, collection in [('selected_output_ids', 'outputs'), ('selected_link_ids', 'links')]:
        ids = document[field]
        assert ids and len(ids) == len(set(ids)), 'Invalid Chinese CV coverage'
        items = {r['id']: r for r in data[collection] if r['selected'] and r['provenance']['visibility'] == 'PUBLIC'}
        assert all(i in items for i in ids), 'Chinese CV includes withdrawn or unknown public content'
        selected[collection] = [items[i] for i in ids]
    profile = next(r['fields'] for r in data['localisation']['records'] if r['id'] == data['profile']['id'])
    with pdfplumber.open(filename) as pdf:
        assert len(pdf.pages) == document['pages'], 'Unexpected Chinese CV page count'
        text = compact('\n'.join(p.extract_text(y_tolerance=4, x_tolerance=2) or '' for p in pdf.pages))
        for field in ['name', 'email']:
            assert compact(data['profile'][field]) in text, 'Missing shared profile field: ' + field
        for field in ['name', 'role', 'institution', 'location']:
            assert compact(profile[field]) in text, 'Missing Chinese profile field: ' + field
        for output in data['outputs']:
            if compact(output['title']) in text:
                assert output['id'] in document['selected_output_ids'], 'Undeclared Chinese CV output'
        for event in data['qualification_events']:
            if not event['selected']:
                continue
            d = date.fromisoformat(event['date'])
            label = {'THESIS_SUBMITTED': '提交', 'VIVA_COMPLETED': '完成答辩', 'DEGREE_AWARDED': '学位授予'}[event['kind']]
            assert compact(f'{d.year}年{d.month}月{d.day}日{label}') in text, 'Qualification milestone differs from Chinese CV'
        if not any(e['selected'] and e['kind'] == 'DEGREE_AWARDED' for e in data['qualification_events']):
            assert '学位待授予' in text, 'Pending degree status omitted from Chinese CV'
        status_labels = {'ACCEPTED': '已接收', 'SUBMITTED': '已投稿', 'UNDER_REVIEW': '审稿中', 'IN_PREPARATION': '撰写中'}
        required_links = [data['presentation']['url'] + 'zh/', 'mailto:' + data['profile']['email']]
        required_links += [l['url'] for l in selected['links']]
        for output in selected['outputs']:
            title = compact(output['title'])
            assert title in text, 'Missing Chinese CV output: ' + output['id']
            required_links += [l['url'] for l in output['links']]
            if output['kind'] == 'ARTICLE' and output['status'] != 'PUBLISHED':
                at = text.index(title)
                label = status_labels[output['status']]
                # Status precedes the exact title in this reviewed Chinese layout.
                assert label in text[max(0, at - 8):at], 'Manuscript status differs from Chinese CV'
            if output['status'] == 'PUBLISHED':
                for link in output['links']:
                    if 'doi.org/' in link['url']:
                        assert compact(link['url'].split('doi.org/')[1]) in text, 'Missing Chinese CV DOI'
        links = {link_identity(l['uri']) for p in pdf.pages for l in p.hyperlinks}
        assert all(link_identity(url) in links for url in required_links), 'Missing selected Chinese public hyperlink'
        assert data['presentation']['url'] not in links, 'Chinese CV homepage points to English version'
        d = date.fromisoformat(document['date'])
        assert compact(f'更新：{d.year}年{d.month}月{d.day}日') in text, 'Incorrect Chinese CV update date'
        private_pattern = r'\+(?:44|86)\d{7,}|(?<!\d)1[3-9]\d{9}(?!\d)|(?<!\d)07\d{9}(?!\d)|nn-\d{4}-|mqt-\d+'
        assert not re.search(private_pattern + r'|verify|todo|ceng|cb2|academiccv|top5%|求职意向|应聘岗位|申请岗位', text), 'Private or unsupported Chinese CV content'
        metadata = compact(json.dumps(pdf.metadata, ensure_ascii=False))
        assert not re.search(private_pattern + r'|求职意向|应聘岗位|申请岗位', metadata), 'Private Chinese PDF metadata'
        for page in pdf.pages:
            for word in page.extract_words():
                # CJK hanging punctuation can extend beyond the 14 mm text block.
                assert 32 <= word['x0'] < word['x1'] <= page.width - 32, 'Chinese text exceeds horizontal margins'
                assert 10 <= word['top'] < word['bottom'] <= page.height - 15, 'Chinese text exceeds page bounds'
                if word['top'] < 805:
                    assert word['bottom'] < 790, 'Chinese body overlaps footer'
    print(f"PASS: {document['pages']}-page reviewed Chinese CV; exact bytes, independent coverage, shared facts/statuses, links, privacy and bounds.")
