from pathlib import Path

from docx import Document
from docx.oxml.ns import qn


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "requirements-work" / "Music_Institute_App_Requirements_Document.docx"
OUTPUT = ROOT / "dist" / "Music_Institute_App_Requirements_Document.docx"


def remove_paragraph_border(element):
    p_pr = element.find(qn("w:pPr"))
    if p_pr is None:
        return
    border = p_pr.find(qn("w:pBdr"))
    if border is not None:
        p_pr.remove(border)


doc = Document(SOURCE)
remove_paragraph_border(doc.styles["Title"]._element)
for paragraph in doc.paragraphs[:3]:
    remove_paragraph_border(paragraph._p)

for row in doc.tables[0].rows:
    if row.cells[0].text.strip() == "Version":
        row.cells[1].text = "Version 1.12 Registration date label update"
        break

replacements = {
    "Provide a Registration screen where an authorized owner, administrator, or finance user selects an existing student and records a registration amount received, payment date, payment mode, unique receipt number, and optional reference or remarks.":
        "Provide a Registration screen where an authorized owner, administrator, or finance user selects an existing student and records a registration amount received, Registration date, payment mode, unique receipt number, and optional reference or remarks.",
    "An authorized user can register an existing student by recording a positive amount received, payment date, payment mode, and unique receipt number.":
        "An authorized user can register an existing student by recording a positive amount received, Registration date, payment mode, and unique receipt number.",
}
for paragraph in doc.paragraphs:
    text = paragraph.text.strip()
    if text in replacements:
        paragraph.text = replacements[text]

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
doc.save(OUTPUT)
print(f"Updated requirements document: {OUTPUT}")
