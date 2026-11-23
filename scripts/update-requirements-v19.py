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
        row.cells[1].text = "Version 1.9 profile validation update"
        break

requirements = [
    (
        "5.2 Trainer Profile Management",
        "Validate student prerequisites, required fields, age, mobile number, email address, guardian mobile number, assigned trainer, selected work packets, and duplicate profiles. Show clear messages and confirm successful enrolment.",
    ),
    (
        "5.3 Artist Profile Management",
        "Validate trainer required fields, age, mobile number, email address, commission range, and duplicate profiles. Show clear messages and confirm successful creation.",
    ),
    (
        "5.4 Work Packet and Course Management",
        "Validate artist required fields, age, mobile number, email address, category, and duplicate profiles. Show clear messages and confirm successful creation.",
    ),
]
existing = {p.text.strip() for p in doc.paragraphs}
for next_heading, item in requirements:
    if item not in existing:
        anchor = next(p for p in doc.paragraphs if p.text.strip() == next_heading)
        paragraph = anchor.insert_paragraph_before(item, style="List Bullet")
        paragraph.paragraph_format.keep_together = True

criteria = [
    "Student enrolment blocks submission until prerequisites and required profile details are valid, rejects duplicate profiles, and confirms successful enrolment.",
    "Trainer creation reports missing or invalid profile details, rejects duplicate profiles, and confirms successful creation.",
    "Artist creation requires a category, reports missing or invalid profile details, rejects duplicate profiles, and confirms successful creation.",
]
existing = {p.text.strip() for p in doc.paragraphs}
for item in criteria:
    if item not in existing:
        paragraph = doc.add_paragraph(item, style="List Bullet")
        paragraph.paragraph_format.keep_together = True

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
doc.save(OUTPUT)
print(f"Updated requirements document: {OUTPUT}")
