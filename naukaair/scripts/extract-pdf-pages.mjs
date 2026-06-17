#!/usr/bin/env node
/**
 * Renderuje strony PDF do JPG w public/exam-images/.
 * Wymaga: python3 + pymupdf (pip install pymupdf)
 *
 *   node scripts/extract-pdf-pages.mjs
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const py = `
import fitz, json
from pathlib import Path
PDF_DIR = Path("${root}/data/sources")
OUT = Path("${root}/public/exam-images")
OUT.mkdir(parents=True, exist_ok=True)
manifest = {}
for pdf_path in sorted(PDF_DIR.glob("*.pdf")):
    slug = pdf_path.stem.replace(" ", "_").lower()
    doc = fitz.open(pdf_path)
    dest = OUT / slug
    dest.mkdir(exist_ok=True)
    pages = []
    for i, page in enumerate(doc):
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
        out = dest / f"page-{i+1:02d}.jpg"
        pix.save(str(out), output="jpeg", jpg_quality=82)
        pages.append({"page": i+1, "file": f"/exam-images/{slug}/page-{i+1:02d}.jpg"})
    manifest[slug] = pages
    doc.close()
(OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
print("Done:", sum(len(v) for v in manifest.values()), "pages")
`;

const r = spawnSync("python3", ["-c", py], { stdio: "inherit" });
process.exit(r.status ?? 1);
