"""Generate the synthetic corpus and the golden question set.

Run from the project folder:  python scripts/generate_corpus.py

Writes:
  eval/corpus/<department>/...      baseline files (leave policy is version 1)
  eval/corpus/_bad/...              files that validation must quarantine
  eval/corpus_updates/hr/leave-policy.pdf   version 2, uploaded in the M6 freshness test
  eval/golden_questions.json        40 questions with expected document and page/row/section
  eval/freshness_check.json         before/after expectations for the leave-policy replacement

The script checks that every expected answer really appears at the location its question
points to, so the golden set cannot drift away from the corpus.
"""

import csv
import io
import json
import random
import shutil
import sys
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfReader
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer

import corpus_data as data

ROOT = Path(__file__).resolve().parent.parent
CORPUS = ROOT / "eval" / "corpus"
UPDATES = ROOT / "eval" / "corpus_updates"
GOLDEN = ROOT / "eval" / "golden_questions.json"
FRESHNESS = ROOT / "eval" / "freshness_check.json"

FONT_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SCAN_DPI = 150
SCAN_SIZE = (1240, 1754)  # A4 at 150 dpi


def department_of(key: str) -> str:
    """Return the department prefix of an S3-style key."""
    return key.split("/", 1)[0]


# ---------------------------------------------------------------------------------------
# Text PDFs
# ---------------------------------------------------------------------------------------


def write_text_pdf(path: Path, title: str, pages: list[data.Page]) -> None:
    """Write a PDF with exactly one section per page, so page numbers are predictable."""
    path.parent.mkdir(parents=True, exist_ok=True)
    styles = getSampleStyleSheet()
    heading = ParagraphStyle("h", parent=styles["Heading2"], spaceAfter=8)
    body = ParagraphStyle("b", parent=styles["BodyText"], fontSize=11, leading=16, spaceAfter=10)

    def footer(canvas, doc) -> None:  # noqa: ANN001 - reportlab callback
        canvas.setFont("Helvetica", 8)
        canvas.drawString(20 * mm, 12 * mm, f"{title} - page {doc.page}")

    story: list = []
    for index, (page_heading, page_body) in enumerate(pages):
        if index == 0:
            story += [Paragraph(title, styles["Title"]), Spacer(1, 6)]
        story.append(Paragraph(page_heading, heading))
        story += [Paragraph(p, body) for p in page_body.split("\n\n")]
        if index < len(pages) - 1:
            story.append(PageBreak())

    # invariant=1 removes timestamps so regenerating gives byte-identical files
    SimpleDocTemplate(str(path), pagesize=A4, title=title, invariant=1).build(
        story, onFirstPage=footer, onLaterPages=footer
    )
    actual = len(PdfReader(str(path)).pages)
    if actual != len(pages):
        sys.exit(f"{path.name}: expected {len(pages)} pages, got {actual}; shorten a section")


# ---------------------------------------------------------------------------------------
# Scans: render text to an image and save the images as a PDF with no text layer
# ---------------------------------------------------------------------------------------


def render_scan_page(page_heading: str, page_body: str, rng: random.Random) -> Image.Image:
    """Render one page as a slightly rotated grayscale image with light noise."""
    image = Image.new("L", SCAN_SIZE, 255)
    draw = ImageDraw.Draw(image)
    heading_font = ImageFont.truetype(FONT_BOLD, 44)
    body_font = ImageFont.truetype(FONT_REGULAR, 32)

    y = 140
    draw.text((120, y), page_heading, font=heading_font, fill=20)
    y += 110
    for line in page_body.split("\n"):
        for wrapped in textwrap.wrap(line, width=52) or [""]:
            draw.text((120, y), wrapped, font=body_font, fill=30)
            y += 50
        y += 18

    image = image.rotate(rng.uniform(-0.6, 0.6), fillcolor=255, resample=Image.BICUBIC)
    pixels = image.load()
    for _ in range(4000):  # speckle, like a photocopier
        pixels[rng.randrange(SCAN_SIZE[0]), rng.randrange(SCAN_SIZE[1])] = rng.randrange(150, 230)
    return image


def write_scan_pdf(path: Path, pages: list[data.Page]) -> None:
    """Write an image-only PDF (one image per page)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    rng = random.Random(path.name)  # seeded by filename: reproducible output
    images = [render_scan_page(h, b, rng).convert("RGB") for h, b in pages]
    images[0].save(
        path, "PDF", resolution=SCAN_DPI, save_all=True, append_images=images[1:]
    )


# ---------------------------------------------------------------------------------------
# CSV, markdown and text
# ---------------------------------------------------------------------------------------


def write_csv(path: Path, rows: list[list[str]]) -> None:
    """Write rows to a CSV file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    buffer = io.StringIO()
    csv.writer(buffer, lineterminator="\n").writerows(rows)
    path.write_text(buffer.getvalue(), encoding="utf-8")


def write_markdown(path: Path, title: str, sections: list[data.Page]) -> None:
    """Write a Markdown file with one `##` heading per section."""
    path.parent.mkdir(parents=True, exist_ok=True)
    parts = [f"# {title}\n"] + [f"## {h}\n\n{b}\n" for h, b in sections]
    path.write_text("\n".join(parts), encoding="utf-8")


def write_plain_text(path: Path, title: str, sections: list[data.Page]) -> None:
    """Write a plain-text file whose section headings are upper-case lines."""
    path.parent.mkdir(parents=True, exist_ok=True)
    parts = [f"{title.upper()}\n{'=' * len(title)}\n"] + [f"{h}\n\n{b}\n" for h, b in sections]
    path.write_text("\n".join(parts), encoding="utf-8")


# ---------------------------------------------------------------------------------------
# Quarantine test files
# ---------------------------------------------------------------------------------------


def write_bad_files(directory: Path) -> None:
    """Write four files that validation must reject for four different reasons."""
    directory.mkdir(parents=True, exist_ok=True)
    (directory / "zero-byte.pdf").write_bytes(b"")
    # Valid-looking header, then random bytes and no xref table or %%EOF
    rng = random.Random(7)
    (directory / "corrupt.pdf").write_bytes(
        b"%PDF-1.4\n" + bytes(rng.randrange(256) for _ in range(2048))
    )
    # A Windows executable header behind a .pdf name
    (directory / "renamed.exe.pdf").write_bytes(b"MZ\x90\x00\x03" + b"\x00" * 59 + b"PE\x00\x00" * 40)
    # A well-formed scan with nothing on it: passes structure checks, extracts zero text
    blank = Image.new("RGB", SCAN_SIZE, (255, 255, 255))
    blank.save(directory / "blank-scan.pdf", "PDF", resolution=SCAN_DPI)


# ---------------------------------------------------------------------------------------
# Golden questions and self-check
# ---------------------------------------------------------------------------------------


def find_csv_row(rows: list[list[str]], keys: tuple[str, ...]) -> int:
    """Return the 1-based data row number whose leading cells equal `keys`."""
    for number, row in enumerate(rows[1:], start=1):
        if tuple(row[: len(keys)]) == keys:
            return number
    # Cost centre and partner lookups use one key that is the first column
    raise SystemExit(f"No CSV row starts with {keys}")


def location_text(question: dict, pdf_pages: dict[str, list[data.Page]]) -> str:
    """Return the text at the question's expected location, for the self-check."""
    kind, doc = question["kind"], question["doc"]
    if kind in ("pdf", "scan"):
        heading, body = pdf_pages[doc][question["loc"] - 1]
        return f"{heading}\n{body}"
    if kind == "csv":
        rows = data.CSV_FILES[doc]
        return ",".join(rows[question["row"]])
    sections = dict((data.MARKDOWN_FILES | data.TEXT_FILES)[doc][1])
    return sections[question["loc"]]


def build_golden() -> list[dict]:
    """Assemble the golden question list, verifying each expected answer exists."""
    pdf_pages = {d["key"]: d["pages"] for d in data.TEXT_PDFS + data.SCAN_PDFS}
    questions: list[dict] = []

    for item in data.POSITIVE:
        entry = {
            "question": item["q"],
            "asker_department": item["asker"],
            "modality": item["kind"],
            "expect": "ANSWER",
            "expected_doc": item["doc"],
            "answer_contains": item["contains"],
        }
        check = dict(item)
        if item["kind"] in ("pdf", "scan"):
            entry["expected_page"] = item["loc"]
        elif item["kind"] == "csv":
            row = find_csv_row(data.CSV_FILES[item["doc"]], item["loc"])
            entry["expected_row"] = row
            check["row"] = row
        else:
            entry["expected_section"] = item["loc"]
        if item["contains"] not in location_text(check, pdf_pages):
            raise SystemExit(f"Answer text not found where expected: {item['q']}")

        doc_dept = department_of(item["doc"])
        if doc_dept not in (item["asker"], "company-wide"):
            raise SystemExit(f"Asker cannot see the document: {item['q']}")
        questions.append(entry)

    for item in data.NEGATIVE:
        if department_of(item["forbidden"]) in (item["asker"], "company-wide"):
            raise SystemExit(f"Negative case is actually allowed: {item['q']}")
        questions.append(
            {
                "question": item["q"],
                "asker_department": item["asker"],
                "modality": item["kind"],
                "expect": "NO_RESULT",
                "forbidden_doc": item["forbidden"],
            }
        )

    for number, entry in enumerate(questions, start=1):
        entry["id"] = f"q{number:02d}"
    return [{"id": e.pop("id"), **e} for e in questions]


# ---------------------------------------------------------------------------------------


def main() -> None:
    """Rebuild the corpus folder and the golden files from scratch."""
    for folder in (CORPUS, UPDATES):
        if folder.exists():
            shutil.rmtree(folder)

    for doc in data.TEXT_PDFS:
        write_text_pdf(CORPUS / doc["key"], doc["title"], doc["pages"])
    for doc in data.SCAN_PDFS:
        write_scan_pdf(CORPUS / doc["key"], doc["pages"])
    for key, rows in data.CSV_FILES.items():
        write_csv(CORPUS / key, rows)
    for key, (title, sections) in data.MARKDOWN_FILES.items():
        write_markdown(CORPUS / key, title, sections)
    for key, (title, sections) in data.TEXT_FILES.items():
        write_plain_text(CORPUS / key, title, sections)
    write_bad_files(CORPUS / "_bad")

    write_text_pdf(UPDATES / "hr" / "leave-policy.pdf", "Leave Policy", data.LEAVE_V2)

    golden = build_golden()
    GOLDEN.write_text(json.dumps(golden, indent=2) + "\n", encoding="utf-8")
    FRESHNESS.write_text(json.dumps(data.FRESHNESS_CHECK, indent=2) + "\n", encoding="utf-8")

    files = [p for p in CORPUS.rglob("*") if p.is_file()]
    good = [p for p in files if "_bad" not in p.parts]
    print(f"Corpus: {len(good)} documents + {len(files) - len(good)} bad files")
    print(f"Golden: {len(golden)} questions -> {GOLDEN.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
