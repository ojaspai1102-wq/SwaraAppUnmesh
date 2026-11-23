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
        row.cells[1].text = "Version 1.10 edit validation update"
        break

heading = "5.11 Record Editing and Reminder Messages"
items = [
    "Validate edits to student, trainer, artist, work packet, and concert records using the same required-field, range, contact, linked-record, and duplicate rules as creation. Preserve the saved record when an edit is cancelled or rejected, and show a record-specific success message after saving.",
    "Allow generated reminder text to be edited before sharing. Reject blank messages and messages longer than 8,000 characters with clear guidance, and confirm when an edited reminder is ready to send or has been copied.",
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
    "User can edit student, trainer, artist, work packet, and concert records; invalid or duplicate changes are rejected without altering the saved record, and successful edits show a record-specific confirmation.",
    "User can edit a generated reminder before sharing; blank and overlength messages are blocked with clear guidance.",
]
existing = {p.text.strip() for p in doc.paragraphs}
for item in criteria:
    if item not in existing:
        paragraph = doc.add_paragraph(item, style="List Bullet")
        paragraph.paragraph_format.keep_together = True

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
doc.save(OUTPUT)
print(f"Updated requirements document: {OUTPUT}")
