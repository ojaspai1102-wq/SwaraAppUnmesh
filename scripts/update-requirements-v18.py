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
        row.cells[1].text = "Version 1.8 exit app update"
        break

heading = "5.10 Application Session and Exit"
requirements = [
    "Provide an Exit app option from the More screen and Settings for every signed-in role.",
    "Ask for confirmation before exiting, close the Android app without deleting saved records, and provide an equivalent closed state in the browser HTML version.",
]
existing = {p.text.strip() for p in doc.paragraphs}
if heading not in existing:
    section_six = next(p for p in doc.paragraphs if p.text.strip() == "6 Key Data Fields")
    section_six.insert_paragraph_before(heading, style="Heading 2")
    for item in requirements:
        paragraph = section_six.insert_paragraph_before(item, style="List Bullet")
        paragraph.paragraph_format.keep_together = True

criteria = [
    "User can choose Exit app from More or Settings and must confirm before the app closes.",
    "Exiting closes the Android task without deleting institute records, accounts, or settings.",
]
existing = {p.text.strip() for p in doc.paragraphs}
for item in criteria:
    if item not in existing:
        paragraph = doc.add_paragraph(item, style="List Bullet")
        paragraph.paragraph_format.keep_together = True

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
doc.save(OUTPUT)
print(f"Updated requirements document: {OUTPUT}")
