"""Generuje naukaair/data/csGeminiExplanations.ts z gemini-explanations.raw.txt."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "gemini-explanations.raw.txt"
OUT = ROOT / "data" / "csGeminiExplanations.ts"

# Fix merged lines like "protected).11. Konstruktor" — digit must not follow another digit
MERGED_ENTRY = re.compile(
    r"(?<=[\.\)\]\}\"'»])\s*(?<!\d)(?=\d{1,3}\.\s+[A-Za-zÀ-ž_`])"
)
MERGED_ENTRY_TIGHT = re.compile(
    r"(?<=[\.\)\]\}\"'»])(?<!\d)(?=\d{1,3}\.\s+[A-Za-zÀ-ž_`])"
)


def normalize_ws(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip())


def split_raw_entries(text: str) -> list[tuple[int, str, str]]:
    """Return (num, title, body) for each numbered definition."""
    text = text.replace("\r\n", "\n").strip()
    if not text:
        return []

    text = MERGED_ENTRY_TIGHT.sub("\n", text)
    text = MERGED_ENTRY.sub("\n", text)

    chunks = re.split(r"\n(?=(?<!\d)\d{1,3}\.\s)", text.strip())
    entries: list[tuple[int, str, str]] = []

    for chunk in chunks:
        chunk = chunk.strip()
        if not chunk:
            continue
        m = re.match(r"^(\d{1,3})\.\s*(.+)$", chunk, re.DOTALL)
        if not m:
            continue
        num = int(m.group(1))
        rest = m.group(2).strip()
        lines = rest.split("\n", 1)
        title_line = lines[0].strip()
        body = lines[1].strip() if len(lines) > 1 else ""

        # Title may be "Obiekt", "Obiekt:", or "Obiekt: …" (body same or next line)
        if body:
            title = title_line.rstrip(":")
        elif title_line.endswith(":"):
            title = title_line.rstrip(":")
        elif ":" in title_line:
            title, _, body_start = title_line.partition(":")
            title = title.strip()
            body = body_start.strip()
        else:
            title = title_line

        title = normalize_ws(title.strip(":- "))
        body = normalize_ws(body)
        if not title:
            continue
        if not body:
            # Some entries put explanation on same line after em dash or colon in title
            continue
        entries.append((num, title, body))

    return entries


def render_ts(explanations: dict[str, str]) -> str:
    lines = [
        "/** Gemini human-friendly explanations for informatyka definitions (def-001–def-092). */",
        "",
        "export const CS_GEMINI_EXPLANATIONS: Record<string, string> = {",
    ]
    for key in sorted(explanations.keys()):
        lines.append(f"  {json.dumps(key, ensure_ascii=False)}: {json.dumps(explanations[key], ensure_ascii=False)},")
    lines.extend(
        [
            "};",
            "",
            "export function getCsGeminiExplanation(definitionId: string): string | undefined {",
            "  return CS_GEMINI_EXPLANATIONS[definitionId];",
            "}",
            "",
        ]
    )
    return "\n".join(lines)


def main() -> None:
    raw_path = Path(sys.argv[1]) if len(sys.argv) > 1 else RAW
    if not raw_path.exists():
        raise SystemExit(f"Brak pliku źródłowego: {raw_path}")

    raw = raw_path.read_text(encoding="utf-8")
    entries = split_raw_entries(raw)
    if not entries:
        raise SystemExit("Nie znaleziono żadnych wpisów w pliku źródłowym.")

    explanations: dict[str, str] = {}
    for num, title, body in entries:
        if num < 1 or num > 92:
            continue
        explanations[f"def-{num:03d}"] = body

    missing = [f"def-{n:03d}" for n in range(1, 93) if f"def-{n:03d}" not in explanations]
    if missing:
        raise SystemExit(f"Brakuje {len(missing)} wpisów: {', '.join(missing[:5])}…")

    OUT.write_text(render_ts(explanations), encoding="utf-8")
    first = explanations["def-001"]
    last = explanations["def-092"]
    print(f"Zapisano {len(explanations)} wpisów → {OUT}")
    print(f"def-001: len={len(first)}")
    print(f"def-092: len={len(last)}")


if __name__ == "__main__":
    main()
