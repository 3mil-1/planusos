"""Generuje naukaair/data/csBaza2024.ts z PDF baza2k24."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

try:
    from pypdf import PdfReader
except ImportError as exc:
    raise SystemExit("Zainstaluj pypdf: pip install pypdf") from exc

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PDF = Path("/home/ubuntu/.cursor/projects/workspace/uploads/baza2k24_e87a.pdf")
OUT = ROOT / "data" / "csBaza2024.ts"


def normalize_ws(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip())


def parse_definitions(text: str) -> list[dict]:
    defs: list[dict] = []
    chunks = re.split(r"\n(?=\d+\.)", re.sub(r"(\d+)\.", r"\n\1.", text))
    for chunk in chunks:
        chunk = chunk.strip()
        if not chunk:
            continue
        m = re.match(r"^(\d+)\.\s*(.+)$", chunk, re.DOTALL)
        if not m:
            continue
        num, rest = m.groups()
        rest = rest.strip()
        first_line, _, tail = rest.partition("\n")
        if ":" in first_line and not first_line.strip().endswith(":"):
            title, _, body_start = first_line.partition(":")
            body = (body_start + "\n" + tail).strip()
        elif first_line.rstrip().endswith(":"):
            title = first_line.rstrip()[:-1].strip()
            body = tail.strip()
        else:
            title = first_line.strip()
            body = tail.strip()
        title = normalize_ws(title.strip("` "))
        body = normalize_ws(body)
        if not title or not body:
            continue
        item = {
            "id": f"def-{int(num):03d}",
            "num": int(num),
            "title": title,
            "answer": body,
        }
        defs.append(item)
    if defs and defs[-1]["id"] == "def-092":
        defs[-1]["title"] = "std::move"
        defs[-1]["answer"] = (
            "std::move to funkcja w standardowej bibliotece C++, która służy do "
            "przekształcania obiektu w r-wartość (rvalue)."
        )
    return defs


ANSWER_LINE_START = re.compile(
    r"^(?:"
    r"[•]|"
    r"Mechanizm|Różnice|Podobieństwa|"
    r"Skorzystaj|Wskaźniki|W konstruktorze|Aby blok|Polimorfizm|"
    r"Obiekty|r-wartości|auto jest"
    r")",
    re.IGNORECASE,
)


def split_open_prompt_answer(rest: str) -> tuple[str, str]:
    rest = rest.strip()
    if "?" in rest:
        q_end = rest.index("?")
        return normalize_ws(rest[: q_end + 1]), normalize_ws(rest[q_end + 1 :])

    lines = [normalize_ws(line) for line in rest.split("\n") if line.strip()]
    prompt_lines: list[str] = []
    answer_lines: list[str] = []
    in_answer = False

    for line in lines:
        if not in_answer:
            title_then_body = (
                prompt_lines
                and prompt_lines[-1].endswith(":")
                and not line.endswith(":")
            )
            if ANSWER_LINE_START.match(line) or title_then_body:
                in_answer = True
                answer_lines.append(line)
            else:
                prompt_lines.append(line)
        else:
            answer_lines.append(line)

    return " ".join(prompt_lines), " ".join(answer_lines)


def parse_open_questions(content: str, section_id: str) -> list[dict]:
    qs: list[dict] = []
    text = re.sub(r"(\d+)\.\s", r"\n\1. ", content.strip())
    chunks = re.split(r"\n(?=\d+\.\s)", text)
    for chunk in chunks:
        chunk = chunk.strip()
        if not chunk:
            continue
        m = re.match(r"^(\d+)\.\s*(.+)$", chunk, re.DOTALL)
        if not m:
            continue
        num, rest = m.groups()
        prompt, answer = split_open_prompt_answer(rest)
        if not prompt:
            continue
        qs.append(
            {
                "id": f"{section_id}-q{int(num):02d}",
                "num": int(num),
                "sectionId": section_id,
                "prompt": prompt,
                "answer": answer,
            }
        )
    return qs


def main() -> None:
    pdf_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PDF
    if not pdf_path.exists():
        raise SystemExit(f"Brak pliku PDF: {pdf_path}")

    full = "\n".join((p.extract_text() or "") for p in PdfReader(str(pdf_path)).pages)
    termin_idx = full.find("TERMIN 0")
    if termin_idx == -1:
        raise SystemExit("Nie znaleziono sekcji TERMIN w PDF")

    defs = parse_definitions(full[:termin_idx])
    questions_part = full[termin_idx:]

    sections: list[dict] = []
    open_qs: list[dict] = []
    parts = re.split(r"TERMIN\s+(\d+)\s*[-–]\s*(\d{4})", questions_part, flags=re.IGNORECASE)
    i = 1
    while i < len(parts) - 2:
        term = int(parts[i])
        year = int(parts[i + 1])
        content = parts[i + 2]
        sid = f"termin-{term}-{year}"
        sections.append(
            {
                "id": sid,
                "term": term,
                "year": year,
                "label": f"Termin {term} ({year})",
            }
        )
        open_qs.extend(parse_open_questions(content, sid))
        i += 3

    lines = [
        "/** Baza informatyka C++/Python — wygenerowana z baza2k24_e87a.pdf */",
        "",
        'export type CsCardKind = "definition" | "open";',
        "",
        "export interface CsDefinition {",
        "  id: string;",
        '  kind: "definition";',
        "  num: number;",
        "  title: string;",
        "  answer: string;",
        "}",
        "",
        "export interface CsOpenQuestion {",
        "  id: string;",
        '  kind: "open";',
        "  num: number;",
        "  sectionId: CsSectionId;",
        "  prompt: string;",
        "  answer: string;",
        "}",
        "",
        "export type CsCard = CsDefinition | CsOpenQuestion;",
        "",
        "export type CsSectionId =",
    ]
    for s in sections:
        lines.append(f'  | "{s["id"]}"')
    lines.extend(
        [
            '  | "definitions"',
            '  | "all-open"',
            '  | "random-definitions"',
            '  | "random-all";',
            "",
            "export const CS_DEFINITIONS: CsDefinition[] = [",
        ]
    )
    for d in defs:
        lines.append(
            f'  {{ id: "{d["id"]}", kind: "definition", num: {d["num"]}, '
            f"title: {json.dumps(d['title'], ensure_ascii=False)}, "
            f"answer: {json.dumps(d['answer'], ensure_ascii=False)} }},"
        )
    lines.extend(["];", "", "export const CS_OPEN_QUESTIONS: CsOpenQuestion[] = ["])
    for q in open_qs:
        lines.append(
            f'  {{ id: "{q["id"]}", kind: "open", num: {q["num"]}, '
            f'sectionId: "{q["sectionId"]}", '
            f"prompt: {json.dumps(q['prompt'], ensure_ascii=False)}, "
            f"answer: {json.dumps(q['answer'], ensure_ascii=False)} }},"
        )
    lines.extend(["];", "", "export const CS_EXAM_SECTIONS = ["])
    for s in sections:
        lines.append(
            f'  {{ id: "{s["id"]}" as const, term: {s["term"]}, year: {s["year"]}, '
            f"label: {json.dumps(s['label'], ensure_ascii=False)} }},"
        )
    lines.append("];")
    lines.append("")

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Zapisano {len(defs)} definicji, {len(open_qs)} pytań otwartych → {OUT}")


if __name__ == "__main__":
    main()
