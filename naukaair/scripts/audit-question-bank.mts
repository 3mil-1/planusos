/**
 * Question bank audit — structural + heuristic content checks.
 * Run: npx tsx scripts/audit-question-bank.mts
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { TOTAL_QUESTIONS } from "../data/questionBankMeta.ts";
import { QUESTION_META } from "../data/questionMeta.ts";
import { EXTRA_QUESTION_META, EXTRA_RAW_QUESTIONS } from "../data/extraQuestions.ts";
import {
  EXTRA_IMAGE_META,
  EXTRA_IMAGE_RAW,
  imageRawToFigures,
} from "../data/extraImageQuestions.ts";
import { QUESTION_FIGURES } from "../data/questionImages.ts";
import { getQuestionDomain } from "../data/learnDomains.ts";

// Import full DB (throws if meta missing)
import { questionsDb } from "../data/questions.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

type Issue = {
  category: string;
  questionId: string;
  file: string;
  problem: string;
  suggestedFix: string;
};

const issues: Issue[] = [];

function add(
  category: string,
  questionId: string,
  file: string,
  problem: string,
  suggestedFix: string,
) {
  issues.push({ category, questionId, file, problem, suggestedFix });
}

// --- Parse raw base questions from questions.ts (before spread) ---
// We reconstruct from questionsDb minus extras for file attribution
const baseIds = new Set(
  Array.from({ length: 99 }, (_, i) => `q-${String(i + 1).padStart(3, "0")}`),
);

function fileForId(id: string): string {
  if (baseIds.has(id)) return "data/questions.ts";
  if (id.startsWith("q-ex-i")) return "data/extraImageQuestions.ts";
  if (id.startsWith("q-ex-")) return "data/extraQuestions.ts";
  return "data/questions.ts";
}

// 1. Duplicate IDs
const idCounts = new Map<string, number>();
for (const q of questionsDb) {
  idCounts.set(q.id, (idCounts.get(q.id) ?? 0) + 1);
}
for (const [id, count] of idCounts) {
  if (count > 1) {
    add(
      "duplicate-id",
      id,
      fileForId(id),
      `Question ID appears ${count} times in questionsDb`,
      "Remove or rename duplicate entries",
    );
  }
}

// 2–3. Options / correctAnswerIndex
for (const q of questionsDb) {
  const file = fileForId(q.id);
  const { correctAnswerIndex: idx, options } = q;

  if (!options?.length) {
    add("empty-options", q.id, file, "options array is empty", "Add at least 2 answer options");
  } else if (idx < 0 || idx >= options.length) {
    add(
      "index-out-of-bounds",
      q.id,
      file,
      `correctAnswerIndex=${idx} but options.length=${options.length}`,
      `Set correctAnswerIndex to 0..${options.length - 1}`,
    );
  }

  const seen = new Map<string, number[]>();
  options.forEach((opt, i) => {
    if (!opt.trim()) {
      add("empty-option", q.id, file, `Option at index ${i} is empty`, "Fill in or remove empty option");
    }
    const key = opt.trim().toLowerCase();
    if (!seen.has(key)) seen.set(key, []);
    seen.get(key)!.push(i);
  });
  for (const [text, indices] of seen) {
    if (indices.length > 1) {
      add(
        "duplicate-options",
        q.id,
        file,
        `Duplicate options at indices [${indices.join(", ")}]: "${text.slice(0, 60)}..."`,
        "Make each option distinct",
      );
    }
  }
}

// 4. Meta coverage
const ALL_META = { ...QUESTION_META, ...EXTRA_QUESTION_META, ...EXTRA_IMAGE_META };
for (const q of questionsDb) {
  if (!ALL_META[q.id]) {
    add(
      "missing-meta",
      q.id,
      fileForId(q.id),
      "No entry in QUESTION_META / EXTRA_QUESTION_META / EXTRA_IMAGE_META",
      `Add meta for ${q.id} in the appropriate meta file`,
    );
  }
}
for (const metaId of Object.keys(ALL_META)) {
  if (!questionsDb.find((q) => q.id === metaId)) {
    add(
      "orphan-meta",
      metaId,
      metaId.startsWith("q-ex-i")
        ? "data/extraImageQuestions.ts"
        : metaId.startsWith("q-ex-")
          ? "data/extraQuestions.ts"
          : "data/questionMeta.ts",
      "Meta exists but question not in questionsDb",
      "Remove orphan meta or add the question",
    );
  }
}

// 5. QUESTION_FIGURES vs DB
const dbIds = new Set(questionsDb.map((q) => q.id));
for (const figId of Object.keys(QUESTION_FIGURES)) {
  if (!dbIds.has(figId)) {
    add(
      "figure-orphan",
      figId,
      "data/questionImages.ts",
      "QUESTION_FIGURES references ID not in questionsDb",
      "Remove figure entry or add question",
    );
  }
}
for (const q of questionsDb) {
  const fromMap = QUESTION_FIGURES[q.id];
  const fromInline = q.figures?.length ? q.figures : [];
  const allFigs = fromMap ?? (fromInline.length ? fromInline : []);
  if (fromMap && fromInline.length && JSON.stringify(fromMap) !== JSON.stringify(fromInline)) {
    add(
      "figure-mismatch",
      q.id,
      fileForId(q.id),
      "Both QUESTION_FIGURES and inline figures differ",
      "Use single source of truth for figures",
    );
  }
}

// 6. basePointId duplicates / gaps
const byBasePoint = new Map<number, string[]>();
for (const q of questionsDb) {
  const list = byBasePoint.get(q.basePointId) ?? [];
  list.push(q.id);
  byBasePoint.set(q.basePointId, list);
}
for (const [bp, ids] of byBasePoint) {
  if (ids.length > 1) {
    add(
      "basePointId-duplicate",
      ids.join(", "),
      ids.map(fileForId).join("; "),
      `basePointId ${bp} shared by ${ids.length} questions: ${ids.join(", ")}`,
      "Assign unique basePointId unless intentional duplicate mapping",
    );
  }
}

// Expected: q-001..q-099 have basePointId 1..99
for (let i = 1; i <= 99; i++) {
  const expectedId = `q-${String(i).padStart(3, "0")}`;
  const q = questionsDb.find((x) => x.id === expectedId);
  if (!q) {
    add(
      "basePointId-gap",
      expectedId,
      "data/questions.ts",
      `Missing question for base point ${i}`,
      `Add q-${String(i).padStart(3, "0")} with basePointId ${i}`,
    );
  } else if (q.basePointId !== i) {
    add(
      "basePointId-mismatch",
      q.id,
      "data/questions.ts",
      `Expected basePointId ${i}, got ${q.basePointId}`,
      `Set basePointId to ${i}`,
    );
  }
}

// Extra range 100–123, image 130–141
const extraExpected = EXTRA_RAW_QUESTIONS.map((q, i) => ({
  id: q.id,
  expected: 100 + i,
}));
for (const { id, expected } of extraExpected) {
  const q = questionsDb.find((x) => x.id === id);
  if (q && q.basePointId !== expected) {
    add(
      "basePointId-mismatch",
      id,
      "data/extraQuestions.ts",
      `Expected basePointId ${expected}, got ${q.basePointId}`,
      `Set basePointId to ${expected}`,
    );
  }
}
EXTRA_IMAGE_RAW.forEach((q, i) => {
  const expected = 130 + i;
  const dbQ = questionsDb.find((x) => x.id === q.id);
  if (dbQ && dbQ.basePointId !== expected) {
    add(
      "basePointId-mismatch",
      q.id,
      "data/extraImageQuestions.ts",
      `Expected basePointId ${expected}, got ${dbQ.basePointId}`,
      `Set basePointId to ${expected}`,
    );
  }
});

// Gap in 124–129
for (let bp = 124; bp <= 129; bp++) {
  if (!byBasePoint.has(bp)) {
    add(
      "basePointId-gap",
      `(none)`,
      "data/extraQuestions.ts / extraImageQuestions.ts",
      `No question uses basePointId ${bp} (gap between extra 123 and image 130)`,
      "Document intentional gap or renumber image questions to 124+",
    );
  }
}

// 8. TOTAL_QUESTIONS
const actual = questionsDb.length;
if (TOTAL_QUESTIONS !== actual) {
  add(
    "total-count",
    "(global)",
    "data/questionBankMeta.ts",
    `TOTAL_QUESTIONS=${TOTAL_QUESTIONS} but questionsDb.length=${actual}`,
    `Set TOTAL_QUESTIONS = ${actual}`,
  );
}

// 9. Figures with empty alt/src
function checkFigures(questionId: string, figures: { src: string; alt: string }[], file: string) {
  figures.forEach((fig, i) => {
    if (!fig.src?.trim()) {
      add(
        "figure-empty-src",
        questionId,
        file,
        `Figure ${i}: empty src`,
        "Set figure src path",
      );
    }
    if (!fig.alt?.trim()) {
      add(
        "figure-empty-alt",
        questionId,
        file,
        `Figure ${i}: empty alt text`,
        "Add descriptive alt text",
      );
    }
  });
}
for (const [id, figs] of Object.entries(QUESTION_FIGURES)) {
  checkFigures(id, figs, "data/questionImages.ts");
}
for (const raw of EXTRA_IMAGE_RAW) {
  checkFigures(raw.id, imageRawToFigures(raw), "data/extraImageQuestions.ts");
}
for (const q of questionsDb) {
  if (q.figures?.length) checkFigures(q.id, q.figures, fileForId(q.id));
}

// 10. Image files exist
const referencedPaths = new Set<string>();
for (const figs of Object.values(QUESTION_FIGURES)) {
  for (const f of figs) referencedPaths.add(f.src);
}
for (const raw of EXTRA_IMAGE_RAW) {
  if (raw.figureSrc) referencedPaths.add(raw.figureSrc);
}
for (const p of referencedPaths) {
  const disk = path.join(PUBLIC, p.replace(/^\//, ""));
  if (!fs.existsSync(disk)) {
    const qIds = [
      ...Object.entries(QUESTION_FIGURES)
        .filter(([, figs]) => figs.some((f) => f.src === p))
        .map(([id]) => id),
      ...EXTRA_IMAGE_RAW.filter((r) => r.figureSrc === p).map((r) => r.id),
    ];
    add(
      "missing-image-file",
      qIds.join(", ") || "(unknown)",
      "data/questionImages.ts / extraImageQuestions.ts",
      `Referenced image not found: ${p} (expected ${disk})`,
      "Add image file or fix path",
    );
  }
}

// 7. Explanation vs correct answer heuristics
function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractNumbers(s: string): number[] {
  const out: number[] = [];
  const re = /-?\d+(?:[.,]\d+)?(?:\/\d+)?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    const v = m[0].replace(",", ".");
    if (v.includes("/")) {
      const [a, b] = v.split("/").map(Number);
      if (b) out.push(a / b);
    } else out.push(Number(v));
  }
  return out;
}

for (const q of questionsDb) {
  const file = fileForId(q.id);
  const correct = q.options[q.correctAnswerIndex];
  const expl = q.explanation;
  const explN = norm(expl);
  const correctN = norm(correct);

  // Explicit contradiction patterns
  const contradictions: [RegExp, string][] = [
    [/nie\s+wpływa.*opór|opór.*nie\s+wpływa/i, "R wpływa na Z w szeregowym RLC"],
    [/wyprzedza.*90.*kondensator/i, "kondensator opóźnia, nie wyprzedza"],
    [/skrócenie.*nie\s+wystąpi.*pionow/i, "STR: brak skrócenia prostopadle"],
    [/x\s*=\s*[−-]?3q/i, "ładunek −3q w kwadracie"],
    [/x\s*=\s*[−-]?q/i, "ładunek −q w trójkącie"],
  ];

  for (const [re, hint] of contradictions) {
    if (re.test(expl) && !re.test(correctN) && !explN.includes(correctN.slice(0, 20))) {
      // only flag if explanation mentions something options don't reflect
    }
  }

  // Explanation cites wrong answer letter/option explicitly
  for (let i = 0; i < q.options.length; i++) {
    if (i === q.correctAnswerIndex) continue;
    const opt = q.options[i];
    const optShort = norm(opt).slice(0, 25);
    if (optShort.length < 8) continue;
    // "poprawna odpowiedź: X" style — rare
  }

  // Numeric mismatch: explanation ends with computed value not in correct option
  const explNums = extractNumbers(expl);
  const correctNums = extractNumbers(correct);
  if (explNums.length && correctNums.length) {
    const lastExpl = explNums[explNums.length - 1];
    const matchInCorrect = correctNums.some((n) => Math.abs(n - lastExpl) < 0.01);
    const matchAnyOption = q.options.some((o) =>
      extractNumbers(o).some((n) => Math.abs(n - lastExpl) < 0.01),
    );
    if (!matchInCorrect && matchAnyOption) {
      const matchIdx = q.options.findIndex((o) =>
        extractNumbers(o).some((n) => Math.abs(n - lastExpl) < 0.01),
      );
      if (matchIdx >= 0 && matchIdx !== q.correctAnswerIndex) {
        add(
          "explanation-numeric-mismatch",
          q.id,
          file,
          `Explanation computes ~${lastExpl} which matches option[${matchIdx}] "${q.options[matchIdx]}" not correct[${q.correctAnswerIndex}] "${correct}"`,
          `Set correctAnswerIndex to ${matchIdx} or fix explanation/calculation`,
        );
      }
    }
  }

  // "→ x = ..." pattern vs options
  const eqMatch = expl.match(/[→=]\s*([−-]?[^.,;\n]+?)(?:\.|,|;|\s+Baza|\s+Egzamin|$)/);
  if (eqMatch) {
    const result = norm(eqMatch[1]);
    if (result.length > 1 && result.length < 40) {
      const inCorrect = norm(correct).includes(result) || result.includes(norm(correct).slice(0, 15));
      const otherIdx = q.options.findIndex(
        (o, i) => i !== q.correctAnswerIndex && (norm(o).includes(result) || result.includes(norm(o).slice(0, 15))),
      );
      if (!inCorrect && otherIdx >= 0) {
        add(
          "explanation-contradicts-answer",
          q.id,
          file,
          `Explanation derives "${eqMatch[1].trim()}" but correct option is "${correct}"; option[${otherIdx}]="${q.options[otherIdx]}" matches better`,
          `Fix correctAnswerIndex or explanation`,
        );
      }
    }
  }
}

// Manual content rules (curated from full read-through)
const CONTENT_FLAGS: Omit<Issue, "category">[] = [
  {
    questionId: "q-008",
    file: "data/questions.ts",
    problem:
      'Explanation cites "egzamin 2023 II termin" but questionMeta assigns source fizyka_egzamin_2023_i_termin (2023-I-JW)',
    suggestedFix: "Align explanation exam reference with questionMeta source (2023-I-JW)",
  },
  {
    questionId: "q-040",
    file: "data/questions.ts",
    problem:
      'Question asks E vector "w środku" charged ring; E=0 at center but correct option[0] says "prostopadły do płaszczyzny" (non-zero direction). Explanation admits E=0 at center.',
    suggestedFix:
      'Rephrase question to ask about axis/on-plane behavior, or change correct answer to "zerowy" and adjust options',
  },
  {
    questionId: "q-046",
    file: "data/questions.ts + data/questionMeta.ts",
    problem:
      'questionMeta baza title says "Napięcie na kondensatorze wyprzedza napięcie źródła o 90°" but question/explanation (and q-077) say current leads / voltage lags by 90°',
    suggestedFix: "Fix questionMeta BAZA2025 title for point 46 to say voltage lags (opóźnia) by 90°",
  },
  {
    questionId: "q-049",
    file: "data/questions.ts",
    problem:
      'Marked answer "R nie wpływa na impedancję" contradicts standard physics Z=√(R²+(X_L−X_C)²); explanation admits exam-specific wrong model',
    suggestedFix:
      "Add disclaimer in question stem that this follows AGH exam key, or fix to physically correct answer (index 1)",
  },
  {
    questionId: "q-050",
    file: "data/questions.ts + questionMeta",
    problem:
      'bazaTitle says field lines are perpendicular to dipole perpendicular bisector; question asks about axis symmetry — wording inconsistent with electrostatics (lines cross axis, not perpendicular to it everywhere)',
    suggestedFix: "Clarify question stem to match intended exam wording about line direction near dipole axis",
  },
  {
    questionId: "q-057",
    file: "data/questions.ts",
    problem: 'Typo in option[2]: "wyłącnie" → should be "wyłącznie"',
    suggestedFix: 'Fix spelling: "wyłącznie"',
  },
  {
    questionId: "q-096",
    file: "data/questions.ts",
    problem:
      "Question text gives U = −GMm/(2R) but calls it potential energy; for circular orbit total mechanical energy E = −GMm/(2R) while U = −GMm/R",
    suggestedFix: "Clarify whether asking about total mechanical energy or gravitational potential energy",
  },
  {
    questionId: "q-ex-008",
    file: "data/extraQuestions.ts",
    problem: "Duplicate of q-095 / q-ex-i12 (same RC I(0)=50mA); intentional but redundant content",
    suggestedFix: "Keep one canonical version or differentiate stems",
  },
  {
    questionId: "q-ex-010",
    file: "data/extraQuestions.ts",
    problem: "Near-duplicate of q-ex-i09 (same moment of momentum w.r.t. rod CM)",
    suggestedFix: "Merge or cross-reference; ensure only one appears in exam draws if undesired",
  },
  {
    questionId: "q-ex-i08",
    file: "data/extraImageQuestions.ts",
    problem: "Duplicate concept of q-011 (pulley moment independent of angle)",
    suggestedFix: "Acceptable reinforcement or dedupe",
  },
  {
    questionId: "q-ex-i10",
    file: "data/extraImageQuestions.ts",
    problem: "No figureSrc — text-only duplicate of q-043 harmonic motion statements",
    suggestedFix: "Add figure crop or move to extraQuestions without image prefix",
  },
  {
    questionId: "q-ex-021",
    file: "data/extraQuestions.ts",
    problem:
      "For uniform box a<b<c, I_Z = (m/12)(a²+b²) is largest (axis ⊥ to largest face). Marked answer Y (index 1) may depend on mislabeled exam diagram",
    suggestedFix: "Verify axis labels on exam figure; if standard a=X,b=Y,c=Z then correct index should be 2 (Z)",
  },
  {
    questionId: "q-ex-018",
    file: "data/extraQuestions.ts",
    problem: 'Explanation says "poprawne stwierdzenie d" but correctAnswerIndex=0 (option A)',
    suggestedFix: 'Fix explanation to reference option A or correct index if exam key differs',
  },
  {
    questionId: "q-097",
    file: "data/questionMeta.ts",
    problem:
      'Meta note says "2i+2j × 2i−4j ∥ Z" but question is i×j=k — meta note copied from q-ex-024',
    suggestedFix: "Update questionMeta note for q-097 to describe i×j cross product",
  },
];

for (const f of CONTENT_FLAGS) {
  add("content-review", f.questionId, f.file, f.problem, f.suggestedFix);
}

// Domain mapping gaps for extra IDs
for (const q of questionsDb) {
  if (q.basePointId >= 100 && !["q-ex-", "q-ex-i"].some((p) => q.id.startsWith(p))) {
    add(
      "domain-mapping",
      q.id,
      "data/learnDomains.ts",
      "Extra-range basePointId without explicit QUESTION_DOMAIN entry (falls back to mechanika)",
      "Add QUESTION_DOMAIN entry if fallback is wrong",
    );
  }
}

// Polish typos scan
const TYPO_PATTERNS: [RegExp, string][] = [
  [/wyłącnie/i, "wyłącznie"],
  [/histeteza/i, "histereza"],
  [/electrostatycznej/i, "elektrostatycznej"],
  [/wan der walka/i, "van der Waalsa"],
  [/oprator/i, "operator"],
  [/wspolczynnika/i, "współczynnika"],
  [/mrowke/i, "mrówkę"],
  [/rzeczyisty/i, "rzeczywisty"],
];

for (const q of questionsDb) {
  const text = [q.question, q.explanation, ...q.options, q.topic].join(" ");
  for (const [re, fix] of TYPO_PATTERNS) {
    if (re.test(text)) {
      add(
        "typo",
        q.id,
        fileForId(q.id),
        `Possible typo matching ${re}: use "${fix}"`,
        `Replace with "${fix}"`,
      );
    }
  }
}

// Report
console.log(JSON.stringify({ totalQuestions: actual, totalIssues: issues.length, issues }, null, 2));

const byCat = new Map<string, number>();
for (const i of issues) byCat.set(i.category, (byCat.get(i.category) ?? 0) + 1);
console.error("\nSummary by category:");
for (const [cat, n] of [...byCat.entries()].sort((a, b) => b[1] - a[1])) {
  console.error(`  ${cat}: ${n}`);
}

process.exit(issues.length > 0 ? 1 : 0);
