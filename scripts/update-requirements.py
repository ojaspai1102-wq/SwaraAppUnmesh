from pathlib import Path

from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "requirements-work" / "Music_Institute_App_Requirements_Document.docx"
OUTPUT = ROOT / "dist" / "Music_Institute_App_Requirements_Document.docx"


def set_cell_padding(cell, top=90, start=100, bottom=90, end=100):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for edge, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{edge}"))
        if node is None:
            node = OxmlElement(f"w:{edge}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def remove_paragraph_border(element):
    p_pr = element.find(qn("w:pPr"))
    if p_pr is None:
        return
    border = p_pr.find(qn("w:pBdr"))
    if border is not None:
        p_pr.remove(border)


doc = Document(SOURCE)

# Keep the title clean and free of inherited or direct decorative rules.
remove_paragraph_border(doc.styles["Title"]._element)
for paragraph in doc.paragraphs[:3]:
    remove_paragraph_border(paragraph._p)

# Update the document version in the existing metadata table.
for row in doc.tables[0].rows:
    if row.cells[0].text.strip() == "Version":
        row.cells[1].text = "Version 1.5 profile search update"
        break

# Add the search requirements immediately after Notifications and Reminders.
section_six = next(p for p in doc.paragraphs if p.text.strip() == "6 Key Data Fields")
search_heading = section_six.insert_paragraph_before("5.9 Student and Trainer Search", style="Heading 2")
search_heading.paragraph_format.keep_with_next = True
search_requirements = []
search_requirements.append(section_six.insert_paragraph_before(
    "Provide one search screen for student and trainer profiles.", style="List Bullet"
))
search_requirements.append(section_six.insert_paragraph_before(
    "Match partial search text against every recorded profile field, including name, phone number, email, location, status, course, trainer assignment, expertise, availability, and preferences.",
    style="List Bullet",
))
search_requirements.append(section_six.insert_paragraph_before(
    "Display matching students and trainers in separate tabular results. Show every relevant field that contains recorded data and provide an action to open the complete profile.",
    style="List Bullet",
))
search_requirements.append(section_six.insert_paragraph_before(
    "Apply role based access so search results include only profiles and fields available to the signed in user.",
    style="List Bullet",
))
for paragraph in search_requirements:
    paragraph.paragraph_format.keep_together = True

# Extend the dashboard requirements matrix with the new search view.
dashboard_table = doc.tables[4]
row = dashboard_table.add_row()
values = (
    "Student and Trainer Search",
    "Matching profiles and all recorded profile details",
    "Search text and profile type",
    "Fast profile lookup and review",
)
for index, value in enumerate(values):
    cell = row.cells[index]
    cell.text = value
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    set_cell_padding(cell)
    for paragraph in cell.paragraphs:
        paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT

# Add testable outcomes to the acceptance criteria.
doc.add_paragraph(
    "User can search students and trainers using partial text from any recorded profile field.",
    style="List Bullet",
)
doc.add_paragraph(
    "Search results display matching student and trainer records in separate tables, include every relevant field with saved data, and allow the user to open the complete profile.",
    style="List Bullet",
)
doc.add_paragraph(
    "Search respects role based access and does not reveal profiles or fields outside the signed in user's permissions.",
    style="List Bullet",
)

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
doc.save(OUTPUT)
print(f"Updated requirements document: {OUTPUT}")
