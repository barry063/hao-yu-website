"""Verify public CV text, hyperlinks and page boundaries. Requires pdfplumber."""
from pathlib import Path
import re
import pdfplumber

root = Path(__file__).resolve().parents[1]
with pdfplumber.open(root / "assets/Hao_Yu_CV.pdf") as pdf:
    assert len(pdf.pages) == 2, f"Unexpected page count: {len(pdf.pages)}"
    text = "\n".join(page.extract_text() for page in pdf.pages)
    for required in ["PhD researcher", "30 September 2026", "InnoAngel", "Under review", "In preparation", "RamanPL_2D",
                     "10.1039/D5NR01458A", "10.1021/acsanm.5c00308", "10.1021/acs.nanolett.3c00220",
                     "10.1021/acs.nanolett.4c03363", "10.1016/j.chemosphere.2022.136547"]:
        assert required in text, f"Missing content: {required}"
    assert not re.search(r"VERIFY|TODO|CEng|CB2|07529|7529|nn-2026|top 5%", text), "Private or unsupported claim"
    for page in pdf.pages:
        for word in page.extract_words():
            assert 45 <= word['x0'] < word['x1'] <= page.width - 45, f"Text exceeds horizontal margin: {word['text']}"
            assert word['top'] >= 30 and word['bottom'] <= page.height - 20, "Text exceeds page boundary"
            if word['top'] < 795:  # Excludes the known footer, whose baseline is at 10 mm.
                assert word['bottom'] < 780, "Body text intrudes into footer area"
    assert sum(len(page.hyperlinks) for page in pdf.pages) >= 8, "Missing interactive hyperlinks"
print("PASS: two-page public CV; status, DOI inventory, privacy, links and text bounds.")
