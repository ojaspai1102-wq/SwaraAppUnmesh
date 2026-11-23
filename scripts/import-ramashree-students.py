import json
import sys
from pathlib import Path

import pdfplumber


def clean(value):
    return " ".join((value or "").split())


def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: import-ramashree-students.py input.pdf output.json")
    source = Path(sys.argv[1])
    output = Path(sys.argv[2])
    students = []
    with pdfplumber.open(source) as pdf:
        for page_number, page in enumerate(pdf.pages, start=1):
            tables = page.extract_tables()
            if len(tables) != 1:
                raise ValueError(f"Expected one table on page {page_number}")
            for source_row, row in enumerate(tables[0][1:], start=2):
                row = (row + [""] * 7)[:7]
                name = clean(row[0])
                class_type = clean(row[1])
                if class_type and class_type not in {"Fixed", "Floating"}:
                    name += class_type
                    class_type = ""
                batch_type = clean(row[2])
                class_mode = clean(row[3])
                source_status = clean(row[4])
                fee_type = clean(row[5])
                timing_note = clean(row[6])
                if not name:
                    continue
                if source_status == "Active":
                    status = "Active"
                elif "no follow up" in source_status.lower():
                    status = "Dropped"
                else:
                    status = "Paused"
                student = {
                    "id": f"ramashree-student-{len(students) + 1:03d}",
                    "name": name,
                    "status": status,
                    "courseIds": [],
                    "trainerId": "",
                    "importPending": True,
                    "classType": class_type,
                    "batchType": batch_type,
                    "classMode": class_mode,
                    "sourceStatus": source_status,
                    "sourceFeeType": fee_type,
                    "classPreference": "Batch" if batch_type.startswith("Group") else ("Individual" if batch_type == "Individual" else ""),
                    "preferredTiming": timing_note,
                    "feePlan": fee_type,
                    "sourcePage": page_number,
                    "sourceRow": source_row,
                }
                students.append(student)
    if len(students) != 94:
        raise ValueError(f"Expected 94 students, found {len(students)}")
    names = [student["name"].casefold() for student in students]
    if len(names) != len(set(names)):
        raise ValueError("Duplicate student names found in source")
    payload = {
        "version": 1,
        "source": source.name,
        "students": students,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    active = sum(student["status"] == "Active" for student in students)
    paused = sum(student["status"] == "Paused" for student in students)
    dropped = sum(student["status"] == "Dropped" for student in students)
    print(f"Imported {len(students)} students: {active} active, {paused} paused, {dropped} dropped")


if __name__ == "__main__":
    main()
