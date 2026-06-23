#!/usr/bin/env python3
"""Przycina skany egzaminów do pojedynczych pytań (bez innych zadań i bez podpowiedzi odpowiedzi)."""
from __future__ import annotations

import json
import re
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "exam-images"
OUT = ROOT / "public" / "exam-images" / "crops"
MANIFEST_OUT = OUT / "manifest.json"

MOODLE_BG = (223, 242, 248)


def is_blue(rgb) -> bool:
    r, g, b = int(rgb[0]), int(rgb[1]), int(rgb[2])
    return b > 200 and g > 210 and r > 170 and b >= r


def ocr_words(img_path: Path) -> list[dict]:
    base = tempfile.mktemp()
    try:
        subprocess.run(
            ["tesseract", str(img_path), base, "-l", "pol+eng", "tsv"],
            capture_output=True,
            check=False,
        )
    except FileNotFoundError:
        return []
    tsv = Path(base + ".tsv")
    if not tsv.exists():
        return []
    words: list[dict] = []
    for line in tsv.read_text(encoding="utf-8", errors="ignore").splitlines()[1:]:
        parts = line.split("\t")
        if len(parts) < 12:
            continue
        text = parts[11].strip()
        if not text:
            continue
        words.append(
            {
                "text": text,
                "x": int(parts[6]),
                "y": int(parts[7]),
                "w": int(parts[8]),
                "h": int(parts[9]),
                "y2": int(parts[7]) + int(parts[9]),
            }
        )
    tsv.unlink(missing_ok=True)
    return words


def separator_y(img: Image.Image) -> int:
    arr = __import__("numpy").array(img.convert("RGB"))
    h = arr.shape[0]
    white = (arr[:, :, 0] > 238) & (arr[:, :, 1] > 238) & (arr[:, :, 2] > 238)
    rf = white.mean(axis=1)
    y1, y2 = int(h * 0.38), int(h * 0.52)
    for y in range(y1, y2):
        if rf[y] > 0.92:
            y_end = y
            while y_end < h and rf[y_end] > 0.85:
                y_end += 1
            if y_end - y >= 12:
                return y
    return int(h * 0.46)


def blue_x_bounds(arr, y1: int, y2: int) -> tuple[int, int]:
    import numpy as np

    sub = arr[y1:y2]
    h, w, _ = sub.shape
    cols = np.zeros(w, bool)
    for x in range(w):
        col = sub[:, x]
        cols[x] = sum(is_blue(px) for px in col) > h * 0.05
    if not cols.any():
        return 0, w
    xs = np.where(cols)[0]
    return int(xs.min()), int(xs.max()) + 1


def scrub_option_marks(crop: Image.Image, words: list[dict], y_offset: int = 0) -> Image.Image:
    """Zamazuje zaznaczenia (radio/checkbox) przy etykietach a–e."""
    img = crop.convert("RGB").copy()
    draw = ImageDraw.Draw(img)
    w, h = img.size

    for token in ("a.", "b.", "c.", "d.", "e."):
        for wd in words:
            if not wd["text"].lower().startswith(token):
                continue
            if wd["y"] < y_offset:
                continue
            cy = wd["y"] - y_offset + wd["h"] // 2
            if cy < 0 or cy >= h:
                continue
            # radio/checkbox zwykle na lewo od etykiety
            lx = max(0, wd["x"] - 35)
            rx = min(w, wd["x"] + 8)
            draw.ellipse((lx, cy - 12, rx, cy + 12), fill=MOODLE_BG, outline=(180, 190, 200))
            break

    # student hints like "-3q OK"
    for wd in words:
        t = wd["text"].lower()
        if not re.search(r"-?\d*q|\bok\b|\+1", t):
            continue
        if wd["y"] < y_offset:
            continue
        y = wd["y"] - y_offset - 6
        draw.rectangle(
            (max(0, wd["x"] - 10), y, min(w, wd["x"] + wd["w"] + 50), y + wd["h"] + 12),
            fill=(255, 255, 255),
        )
    return img


def crop_page(
    img_path: Path,
    *,
    mode: str = "diagram_options",
    question_index: int = 0,
) -> Image.Image | None:
    """mode: diagram_options | stem_diagram | full_box"""
    img = Image.open(img_path)
    words = ocr_words(img_path)
    h = img.height
    sep = separator_y(img)

    # drugie pytanie na stronie zaczyna się ~w połowie
    top = 100
    bottom = sep - 6

    if mode == "stem_diagram":
        wybierz = [w for w in words if w["text"].lower().startswith("wybierz") and w["y"] < sep - 20]
        if wybierz:
            bottom = min(bottom, wybierz[0]["y"] - 8)
    elif mode == "full_box":
        pass

    # wielokrotne pytania na jednej stronie (2021)
    if question_index > 0:
        gaps = []
        arr = __import__("numpy").array(img.convert("RGB"))
        for y in range(120, sep - 40):
            row = arr[y]
            white_frac = sum(1 for px in row if px[0] > 240 and px[1] > 240 and px[2] > 240) / len(row)
            if white_frac > 0.97:
                gaps.append(y)
        # znajdź segmenty nie-białe
        segments: list[tuple[int, int]] = []
        start = 120
        for y in gaps:
            if y - start > 120:
                segments.append((start, y))
            start = y + 1
        if start < sep - 20:
            segments.append((start, sep - 6))
        if question_index < len(segments):
            top, bottom = segments[question_index]
        else:
            return None

    arr = __import__("numpy").array(img.convert("RGB"))
    x1, x2 = blue_x_bounds(arr, top, bottom)
    pad = 8
    crop = img.crop(
        (
            max(0, x1 - pad),
            max(0, top - pad),
            min(img.width, x2 + pad),
            min(h, bottom + pad),
        )
    )

    if mode == "diagram_options":
        crop = scrub_option_marks(crop, words, y_offset=top)
    elif mode in ("full_box", "stem_diagram"):
        crop = scrub_option_marks(crop, words, y_offset=top)

    # usuń "Odznacz mój wybór"
    odz = [w for w in words if "odznacz" in w["text"].lower() and top <= w["y"] < bottom]
    if odz:
        cut = odz[0]["y"] - top - 6
        if cut > 80:
            crop = crop.crop((0, 0, crop.width, cut))

    return crop


# page -> (mode, question_index on page for multi)
RECIPES: dict[str, dict[int, tuple[str, int] | str]] = {
    "fizyka_2020_-_egzamin": {
        2: "diagram_options",
        3: "diagram_options",
        4: "diagram_options",
        5: "diagram_options",
        6: "diagram_options",
        7: "diagram_options",
        12: "stem_diagram",
        13: "stem_diagram",
        15: "diagram_options",
        16: "diagram_options",
        17: "diagram_options",
        18: "stem_diagram",
        20: "stem_diagram",
        22: "stem_diagram",
        27: "stem_diagram",
        28: "stem_diagram",
        30: "diagram_options",
    },
}

# mapowanie: question_id -> (pdf_slug, page, mode override?)
QUESTION_CROPS: dict[str, tuple[str, int, str | None]] = {
    "q-008": ("fizyka_2020_-_egzamin", 27, "stem_diagram"),
    "q-011": ("fizyka_2020_-_egzamin", 13, "stem_diagram"),
    "q-013": ("fizyka_2020_-_egzamin", 18, "stem_diagram"),
    "q-ex-004": ("fizyka_2020_-_egzamin", 18, "stem_diagram"),
    "q-ex-007": ("fizyka_2020_-_egzamin", 20, "stem_diagram"),
    "q-ex-012": ("fizyka_2020_-_egzamin", 22, "stem_diagram"),
    "q-ex-021": ("fizyka_2020_-_egzamin", 5, "diagram_options"),
    "q-ex-i01": ("fizyka_2020_-_egzamin", 2, "diagram_options"),
    "q-ex-i02": ("fizyka_2020_-_egzamin", 3, "diagram_options"),
    "q-ex-i03": ("fizyka_2020_-_egzamin", 4, "diagram_options"),
    "q-ex-i04": ("fizyka_2020_-_egzamin", 6, "diagram_options"),
    "q-ex-i05": ("fizyka_2020_-_egzamin", 7, "diagram_options"),
    "q-ex-i06": ("fizyka_2020_-_egzamin", 15, "diagram_options"),
    "q-ex-i07": ("fizyka_2020_-_egzamin", 16, "diagram_options"),
    "q-ex-i08": ("fizyka_2020_-_egzamin", 13, "stem_diagram"),
    # q-ex-i09: tekstowe — na skanie brak rysunku (tylko komentarz studenta)
    # q-ex-i10: sam tekst na białym tle z pogrubioną odpowiedzią — bez obrazka
    "q-ex-i11": ("fizyka_2020_-_egzamin", 30, "diagram_options"),
    "q-ex-i12": ("fizyka_2020_-_egzamin", 28, "stem_diagram"),
}


def resolve_mode(slug: str, page: int, override: str | None) -> str:
    if override:
        return override
    recipe = RECIPES.get(slug, {}).get(page, "diagram_options")
    if isinstance(recipe, tuple):
        return recipe[0]
    return recipe


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    manifest: dict[str, str] = {}

    for qid, (slug, page, mode_override) in QUESTION_CROPS.items():
        src = SRC / slug / f"page-{page:02d}.jpg"
        if not src.exists():
            print("MISSING", src)
            continue
        mode = resolve_mode(slug, page, mode_override)
        cropped = crop_page(src, mode=mode)
        if cropped is None:
            print("FAIL", qid)
            continue
        dest_dir = OUT / slug
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest = dest_dir / f"{qid}.jpg"
        cropped.save(dest, "JPEG", quality=88, optimize=True)
        manifest[qid] = f"/exam-images/crops/{slug}/{qid}.jpg"
        print(qid, cropped.size, "->", dest.relative_to(ROOT))

    MANIFEST_OUT.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nSaved {len(manifest)} crops")


if __name__ == "__main__":
    main()
