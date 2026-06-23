import type { Question } from "@/data/questions";

export type DisplayQuestion = Question;

/** Pytania z rysunkami A/B/C/D — litery muszą odpowiadać etykietom na skanie. */
const FIXED_OPTION_QUESTION_IDS = new Set([
  "q-ex-i01",
  "q-ex-i02",
  "q-ex-i03",
  "q-ex-i04",
  "q-ex-i05",
  "q-ex-i06",
  "q-ex-i07",
  "q-ex-i11",
]);

export function shouldShuffleQuestionOptions(question: Question): boolean {
  return !FIXED_OPTION_QUESTION_IDS.has(question.id);
}

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

function seededOrder(length: number, seed: string): number[] {
  const order = Array.from({ length }, (_, i) => i);
  let state = hashSeed(seed);

  for (let i = length - 1; i > 0; i -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }

  return order;
}

/** Deterministic shuffle per question — same order every time for a given id. */
export function shuffleQuestionOptions(question: Question): DisplayQuestion {
  if (!shouldShuffleQuestionOptions(question)) {
    return question;
  }

  const order = seededOrder(question.options.length, question.id);
  return {
    ...question,
    options: order.map((i) => question.options[i]),
    correctAnswerIndex: order.indexOf(question.correctAnswerIndex),
    figures: question.figures,
  };
}
