import json
import re
import sys
from collections import Counter

import pdfplumber


def detect_repeating_lines(pages_text):
    total_pages = len(pages_text)
    if total_pages < 2:
        return set()

    line_page_count = Counter()
    for page_text in pages_text:
        seen_on_page = set()
        for line in page_text.splitlines():
            normalized = re.sub(r"\d+", "", line.strip())
            if len(normalized) > 10:
                seen_on_page.add(normalized)
        for normalized in seen_on_page:
            line_page_count[normalized] += 1

    threshold = max(2, int(total_pages * 0.5))
    return {line for line, count in line_page_count.items() if count >= threshold}


def extract_pdf_text(pdf_path):
    pages_text = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            if page_text.strip():
                pages_text.append(page_text)

    if not pages_text:
        return ""

    repeating = detect_repeating_lines(pages_text)
    cleaned_pages = []
    for page_text in pages_text:
        lines = page_text.splitlines()
        filtered = []
        for line in lines:
            normalized = re.sub(r"\d+", "", line.strip())
            if normalized in repeating:
                continue
            filtered.append(line.rstrip())
        cleaned_pages.append("\n".join(filtered))

    return "\n\n".join(cleaned_pages)


def normalize_text(text):
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"\u0000", "", text)

    normalized_lines = []
    blank_pending = False

    for raw_line in text.split("\n"):
        line = re.sub(r"\s+", " ", raw_line).strip()
        line = re.sub(r"\bPage\s+\d+\b", "", line, flags=re.IGNORECASE).strip()

        if not line:
            if not blank_pending:
                normalized_lines.append("")
                blank_pending = True
            continue

        normalized_lines.append(line)
        blank_pending = False

    return "\n".join(normalized_lines).strip()


def main():
    if len(sys.argv) < 2:
        raise SystemExit("Usage: python extract_srs_text.py <input.pdf>")

    text = normalize_text(extract_pdf_text(sys.argv[1]))
    print(json.dumps({"text": text}, ensure_ascii=False))


if __name__ == "__main__":
    main()
