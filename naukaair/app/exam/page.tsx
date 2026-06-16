"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getQuestionById, getRandomExamQuestions, type Question } from "@/data/questions";
import { EXAM_DURATION_SECONDS, EXAM_QUESTION_COUNT } from "@/lib/utils";
import { useQuizStore } from "@/store/useQuizStore";
import { Card } from "@/components/ui/Card";
import { QuestionCard, LABELS } from "@/components/quiz/QuestionCard";
import { ProgressBar } from "@/components/quiz/ProgressBar";
import { ExamTimer } from "@/components/quiz/ExamTimer";

export interface ExamResultPayload {
  score: number;
  total: number;
  wrongItems: Array<{
    questionId: string;
    question: string;
    topic: string;
    selectedIndex: number;
    correctIndex: number;
    selectedLabel: string;
    correctLabel: string;
    explanation: string;
    isSynthetic: boolean;
  }>;
  finishedAt: string;
}

function buildAndSaveResults(
  questionIds: string[],
  answers: Record<string, number>,
): ExamResultPayload {
  let score = 0;
  const wrongItems: ExamResultPayload["wrongItems"] = [];

  for (const id of questionIds) {
    const q = getQuestionById(id);
    if (!q) continue;
    const selected = answers[id];
    if (selected === undefined) continue;

    if (selected === q.correctAnswerIndex) {
      score += 1;
    } else {
      wrongItems.push({
        questionId: q.id,
        question: q.question,
        topic: q.topic,
        selectedIndex: selected,
        correctIndex: q.correctAnswerIndex,
        selectedLabel: LABELS[selected] ?? "?",
        correctLabel: LABELS[q.correctAnswerIndex] ?? "?",
        explanation: q.explanation,
        isSynthetic: q.isSynthetic,
      });
    }
  }

  const payload: ExamResultPayload = {
    score,
    total: questionIds.length,
    wrongItems,
    finishedAt: new Date().toISOString(),
  };

  sessionStorage.setItem("naukaair-last-exam", JSON.stringify(payload));
  return payload;
}

export default function ExamPage() {
  const router = useRouter();
  const { startExam, recordExamAnswer, finishExam, clearExam, saveSession, recordAnswer } =
    useQuizStore();

  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const current = questions[index];

  const beginExam = () => {
    const qs = getRandomExamQuestions(EXAM_QUESTION_COUNT);
    setQuestions(qs);
    setIndex(0);
    setAnswers({});
    setStarted(true);
    startExam(qs.map((q) => q.id));
  };

  const finishAndNavigate = useCallback(() => {
    const ids = questions.map((q) => q.id);
    const payload = buildAndSaveResults(ids, answers);

    for (const id of ids) {
      const q = getQuestionById(id);
      const sel = answers[id];
      if (q && sel !== undefined) {
        recordAnswer(id, sel === q.correctAnswerIndex);
      }
    }

    saveSession(payload.score, payload.total, "egzamin");
    finishExam();
    clearExam();
    router.push("/results");
  }, [questions, answers, recordAnswer, saveSession, finishExam, clearExam, router]);

  const handleExpire = useCallback(() => {
    if (started) finishAndNavigate();
  }, [started, finishAndNavigate]);

  const handleSelect = (optionIndex: number) => {
    if (!current) return;
    const next = { ...answers, [current.id]: optionIndex };
    setAnswers(next);
    recordExamAnswer(current.id, optionIndex);
  };

  const handleNext = () => {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q.id] !== undefined).length,
    [questions, answers],
  );

  if (!started) {
    return (
      <div className="mx-auto max-w-lg animate-fade-in">
        <Card className="text-center">
          <h1 className="text-2xl font-bold text-white">Symulacja Egzaminu</h1>
          <ul className="mt-6 space-y-2 text-left text-sm text-slate-400">
            <li>• {EXAM_QUESTION_COUNT} losowych pytań z bazy 99</li>
            <li>• Czas: 60 minut</li>
            <li>• Brak podpowiedzi do końca</li>
            <li>• Wynik i wyjaśnienia błędów na stronie podsumowania</li>
          </ul>
          <button
            type="button"
            onClick={beginExam}
            className="mt-8 w-full rounded-xl bg-violet-500 py-3 font-medium text-white transition-all hover:bg-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            Rozpocznij egzamin
          </button>
        </Card>
      </div>
    );
  }

  if (!current) return null;

  const isLast = index + 1 >= questions.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-white">Egzamin — pytanie {index + 1}</h1>
        <ExamTimer initialSeconds={EXAM_DURATION_SECONDS} onExpire={handleExpire} />
      </div>

      <ProgressBar
        current={answeredCount}
        total={questions.length}
        label={`Odpowiedziano ${answeredCount}/${questions.length}`}
      />

      <Card>
        <QuestionCard
          question={current}
          mode="exam"
          selectedIndex={answers[current.id] ?? null}
          onSelect={handleSelect}
        />

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={index === 0}
            className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm text-slate-300 transition-all hover:bg-slate-800 disabled:opacity-40"
          >
            Poprzednie
          </button>

          {!isLast && (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-xl bg-slate-700 px-5 py-2.5 text-sm text-white transition-all hover:bg-slate-600"
            >
              Następne
            </button>
          )}

          {isLast && (
            <button
              type="button"
              onClick={finishAndNavigate}
              className="ml-auto rounded-xl bg-violet-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            >
              Zakończ egzamin
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
