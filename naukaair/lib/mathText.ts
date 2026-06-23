/** Parsowanie i auto-formatowanie notacji fizycznej → LaTeX (KaTeX). */

export type MathSegment =
  | { type: "text"; value: string }
  | { type: "inline"; value: string }
  | { type: "block"; value: string };

const GREEK_UNICODE: Record<string, string> = {
  ω: "\\omega",
  λ: "\\lambda",
  θ: "\\theta",
  α: "\\alpha",
  β: "\\beta",
  δ: "\\delta",
  ε: "\\varepsilon",
  φ: "\\varphi",
  ρ: "\\rho",
  σ: "\\sigma",
  τ: "\\tau",
  π: "\\pi",
  Δ: "\\Delta",
  Ω: "\\Omega",
};

const SUBSCRIPT_DIGITS = "₀₁₂₃₄₅₆₇₈₉";
const SUPERSCRIPT_DIGITS: Record<string, string> = {
  "⁰": "0",
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
};

/** Pojedyncze małe litery używane jako zmienne w fizyce. */
const LOWERCASE_VARS = new Set("vxyztrmqabfnelkcdhspwij".split(""));

const POLISH_STOPWORDS = new Set([
  "dla",
  "daje",
  "przy",
  "gdzie",
  "jest",
  "gdy",
  "bez",
  "oraz",
  "przez",
  "tylko",
  "większe",
  "mniejsze",
  "oraz",
  "idealnego",
  "spoczynkowych",
  "poruszających",
  "ładunków",
  "siły",
  "pionowej",
]);

const MATH_WORDS = new Set([
  "max",
  "min",
  "sin",
  "cos",
  "tan",
  "log",
  "exp",
  "const",
  "cm",
  "rc",
  "lc",
]);

const MATH_CHARS =
  /^[A-Za-z0-9ωλθαβδεφρστπΔΩ_+\-*/=<>∝⟂×·√∮∫∥(),.|²³⁰-⁹₀-₉½¼−\s{}^[\]]$/;
const MATH_HINT =
  /[ωλθαβδεφρστπΔΩ∝⟂×·²³⁰-⁹₀-₉½¼√∮∫∥=+\-*/<>≈→_|^]/;
const POLISH_LETTER = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;

function hasMathHint(value: string): boolean {
  return MATH_HINT.test(value);
}

function isMathChar(char: string): boolean {
  return MATH_CHARS.test(char);
}

function canStartMathSpan(char: string, text: string, index: number): boolean {
  if (POLISH_LETTER.test(char)) return false;
  if (/[0-9(+\-=−ΔωλθαβδεφρστπΩ√∫∮∥]/.test(char)) return true;
  if (/[A-Z]/.test(char)) return true;
  if (/[a-z]/.test(char)) {
    if (!LOWERCASE_VARS.has(char)) return false;
    const next = text[index + 1] ?? "";
    if (!next) return true;
    if (/[×·∥²³⁰-⁹₀-₉_^+\-*/=<>()[\],.|]/.test(next)) return true;
    if (next === " " && /[×·∥=+\-*/<>()]/.test(text[index + 2] ?? "")) return true;
    return false;
  }
  return false;
}

function trimAtStopwords(candidate: string): string {
  let s = candidate.trim();
  const words = s.split(/\s+/);
  const kept: string[] = [];

  for (const word of words) {
    const bare = word.replace(/^[^A-Za-z0-9ωλθαβδεφρστπΔΩ]+|[^A-Za-z0-9ωλθαβδεφρστπΔΩ]+$/g, "");
    const lower = bare.toLowerCase();
    if (bare.length >= 3 && POLISH_STOPWORDS.has(lower)) break;
    if (bare.length >= 4 && !MATH_WORDS.has(lower) && /^[a-ząćęłńóśźż]+$/i.test(bare)) break;
    kept.push(word);
  }

  return kept.join(" ").trim();
}

function sanitizeMathCandidate(raw: string): string | null {
  let s = trimAtStopwords(raw.trim());
  if (s.length > 48) {
    const cut = s.slice(0, 48);
    const lastSpace = cut.lastIndexOf(" ");
    s = lastSpace > 8 ? cut.slice(0, lastSpace) : cut;
  }
  if (s.length < 2 || !hasMathHint(s)) return null;
  return s;
}

/** Zamienia fragment z unicode na LaTeX do KaTeX. */
export function unicodeExprToLatex(expr: string): string {
  let s = expr.trim();

  for (const [unicode, latex] of Object.entries(GREEK_UNICODE)) {
    s = s.split(unicode).join(latex);
  }

  // Δx, λL → osobne tokeny
  s = s.replace(/\\(Delta|Omega)([A-Za-z])/g, "\\$1 $2");
  s = s.replace(/\\(omega|lambda|theta|alpha|beta|delta|varepsilon|varphi|rho|sigma|tau|pi)([A-Za-z])/g, "\\$1 $2");

  s = s.replace(/∝/g, "\\propto");
  s = s.replace(/×/g, "\\times");
  s = s.replace(/·/g, "\\cdot");
  s = s.replace(/⟂/g, "\\perp");
  s = s.replace(/∥/g, "\\parallel");
  s = s.replace(/∮/g, "\\oint");
  s = s.replace(/∫/g, "\\int");
  s = s.replace(/≈/g, "\\approx");
  s = s.replace(/→/g, "\\to");
  s = s.replace(/−/g, "-");

  s = s.replace(/½/g, "\\frac{1}{2}");
  s = s.replace(/¼/g, "\\frac{1}{4}");

  s = s.replace(/√\(([^)]+)\)/g, "\\sqrt{$1}");
  s = s.replace(/√([A-Za-z0-9]+)/g, "\\sqrt{$1}");

  s = s.replace(/([A-Za-z0-9])²/g, "$1^{2}");
  s = s.replace(/([A-Za-z0-9])³/g, "$1^{3}");
  for (const [sup, digit] of Object.entries(SUPERSCRIPT_DIGITS)) {
    s = s.replaceAll(sup, `^{${digit}}`);
  }

  for (let i = 0; i < SUBSCRIPT_DIGITS.length; i += 1) {
    s = s.replaceAll(SUBSCRIPT_DIGITS[i], `_{${i}}`);
  }

  s = s.replace(/([A-Za-z])\u0302/g, "\\hat{$1}");

  // proste ułamki — tylko gdy obie strony krótkie (nie łyka całych zdań)
  s = s.replace(
    /([A-Za-z0-9(){}^]{1,12})\/([A-Za-z0-9(){}^]{1,12})/g,
    "\\frac{$1}{$2}",
  );

  s = s.replace(/([A-Za-z0-9})])\\(times|cdot|perp|parallel)([A-Za-z({])/g, "$1 \\$2 $3");

  return s.replace(/\s+/g, " ").trim();
}

function extractAutoMathSpans(text: string): MathSegment[] {
  if (text.includes("$")) {
    return [{ type: "text", value: text }];
  }

  const segments: MathSegment[] = [];
  let i = 0;
  let textBuf = "";

  const flushText = () => {
    if (textBuf) {
      segments.push({ type: "text", value: textBuf });
      textBuf = "";
    }
  };

  while (i < text.length) {
    const char = text[i];

    if (!canStartMathSpan(char, text, i)) {
      textBuf += char;
      i += 1;
      continue;
    }

    let j = i;
    while (j < text.length && isMathChar(text[j]) && !POLISH_LETTER.test(text[j])) {
      j += 1;
    }

    const raw = text.slice(i, j);
    const candidate = sanitizeMathCandidate(raw);

    if (candidate) {
      flushText();
      segments.push({ type: "inline", value: unicodeExprToLatex(candidate) });
      i = j;
      continue;
    }

    textBuf += char;
    i += 1;
  }

  flushText();
  return segments;
}

function splitExplicitDelimiters(text: string): MathSegment[] {
  const segments: MathSegment[] = [];
  let i = 0;
  let buf = "";

  const flushText = () => {
    if (buf) {
      segments.push(...extractAutoMathSpans(buf));
      buf = "";
    }
  };

  while (i < text.length) {
    if (text.startsWith("$$", i)) {
      flushText();
      const end = text.indexOf("$$", i + 2);
      if (end === -1) {
        buf += "$$";
        i += 2;
        continue;
      }
      segments.push({ type: "block", value: text.slice(i + 2, end).trim() });
      i = end + 2;
      continue;
    }

    if (text[i] === "$") {
      flushText();
      const end = text.indexOf("$", i + 1);
      if (end === -1) {
        buf += "$";
        i += 1;
        continue;
      }
      segments.push({ type: "inline", value: text.slice(i + 1, end).trim() });
      i = end + 1;
      continue;
    }

    buf += text[i];
    i += 1;
  }

  flushText();
  return segments;
}

export function parseMathSegments(text: string): MathSegment[] {
  return splitExplicitDelimiters(text);
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
