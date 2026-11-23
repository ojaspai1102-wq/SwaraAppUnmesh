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
        row.cells[1].text = "Version 1.7 duration unit update"
        break

paragraph_replacements = {
    "Maintain work packet name, subcategory, course duration, number of sessions, fees, special rules, batch size, and pricing type.":
        "Maintain work packet name, subcategory, duration as a numeric value with a Days, Months, or Years unit, number of sessions, fees, special rules, batch size, and pricing type.",
    "Maintain program or concert name, date, venue, duration, organizer, participating artists, students, trainers, and event status.":
        "Maintain program or concert name, date, venue, duration as a numeric value with a Days, Months, or Years unit, organizer, participating artists, students, trainers, and event status.",
}
for paragraph in doc.paragraphs:
    if paragraph.text in paragraph_replacements:
        paragraph.text = paragraph_replacements[paragraph.text]

for row in doc.tables[3].rows:
    name = row.cells[0].text.strip()
    if name == "Work Packet":
        row.cells[2].text = "Duration value and unit (Days, Months, or Years), special rules, batch size, prerequisites"
    elif name == "Program or Concert":
        row.cells[1].text = "Name, date, duration value and unit (Days, Months, or Years), organizer, artists, collections, expenses"

for table_index, screen_name in ((8, "Work Packet Setup Screen"), (10, "Program and Concert Screen")):
    for row in doc.tables[table_index].rows:
        if row.cells[0].text.strip().startswith(screen_name):
            lines = row.cells[1].text.splitlines()
            if "Duration value and unit" not in lines:
                lines.insert(1, "Duration value and unit")
                row.cells[1].text = "\n".join(lines)

criteria = [
    "User enters every duration as a number and selects Days, Months, or Years from a dropdown.",
    "Existing duration records remain viewable and are converted to the new value and unit fields when edited.",
]
existing = {p.text.strip() for p in doc.paragraphs}
for item in criteria:
    if item not in existing:
        paragraph = doc.add_paragraph(item, style="List Bullet")
        paragraph.paragraph_format.keep_together = True

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
doc.save(OUTPUT)
print(f"Updated requirements document: {OUTPUT}")
