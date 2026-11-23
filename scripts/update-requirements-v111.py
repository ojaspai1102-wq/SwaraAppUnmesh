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
        row.cells[1].text = "Version 1.11 student registration update"
        break

heading = "5.12 Student Registration and Payment"
items = [
    "Provide a Registration screen where an authorized owner, administrator, or finance user selects an existing student and records a registration amount received, payment date, payment mode, unique receipt number, and optional reference or remarks.",
    "Require a linked student and an amount above zero. Reject receipt numbers already used for a registration or fee payment, confirm successful registration, and provide a printable registration receipt and registration report.",
    "Treat recorded registration payments as an immutable offline ledger. The app records cash, UPI, bank transfer, card, or other payments received externally and does not process an online payment.",
]
existing = {p.text.strip() for p in doc.paragraphs}
anchor = next(p for p in doc.paragraphs if p.text.strip() == "6 Key Data Fields")
if heading not in existing:
    paragraph = anchor.insert_paragraph_before(heading, style="Heading 2")
    paragraph.paragraph_format.keep_with_next = True
for item in reversed(items):
    if item not in existing:
        paragraph = anchor.insert_paragraph_before(item, style="List Bullet")
        paragraph.paragraph_format.keep_together = True

criteria = [
    "An authorized user can register an existing student by recording a positive amount received, payment date, payment mode, and unique receipt number.",
    "The system rejects missing students, zero or negative registration amounts, and receipt numbers already used by registration or fee payments without creating a record.",
    "A successful registration appears in the Registration list and report, shows a clear confirmation, and provides a printable receipt; the recorded payment cannot be altered or deleted.",
]
existing = {p.text.strip() for p in doc.paragraphs}
for item in criteria:
    if item not in existing:
        paragraph = doc.add_paragraph(item, style="List Bullet")
        paragraph.paragraph_format.keep_together = True

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
doc.save(OUTPUT)
print(f"Updated requirements document: {OUTPUT}")
