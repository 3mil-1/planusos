export type QuestionFigure = {
  src: string;
  alt: string;
  caption?: string;
};

const CROP2020 = (id: string) => `/exam-images/crops/fizyka_2020_-_egzamin/${id}.jpg`;

/** Przycięte ilustracje — jedno pytanie, bez podpowiedzi odpowiedzi */
export const QUESTION_FIGURES: Record<string, QuestionFigure[]> = {
  "q-008": [
    {
      src: CROP2020("q-008"),
      alt: "Kwadrat z ładunkami +q — zadanie o ładunku w punkcie C",
      caption: "Egzamin 2020 — zadanie z kwadratem ładunków",
    },
  ],
  "q-011": [
    {
      src: CROP2020("q-011"),
      alt: "Bloczek na krążku z linką — dwa położenia kąta α",
      caption: "Egzamin 2020 — moment siły na krążku",
    },
  ],
  "q-013": [
    {
      src: CROP2020("q-013"),
      alt: "Wykres siły tarcia vs siły ciągnącej",
      caption: "Egzamin 2020 — wykres tarcia",
    },
  ],
  "q-ex-004": [
    {
      src: CROP2020("q-ex-004"),
      alt: "Wykres siły tarcia vs siły ciągnącej",
      caption: "Egzamin 2020",
    },
  ],
  "q-ex-007": [
    {
      src: CROP2020("q-ex-007"),
      alt: "Nieskończona naładowana płaszczyzna",
      caption: "Egzamin 2020 — płaszczyzna naładowana",
    },
  ],
  "q-ex-012": [
    {
      src: CROP2020("q-ex-012"),
      alt: "Dipol elektryczny — punkty p1–p4",
      caption: "Egzamin 2020 — dipol elektryczny",
    },
  ],
  "q-ex-021": [
    {
      src: CROP2020("q-ex-021"),
      alt: "Prostopadłościan z osiami X, Y, Z",
      caption: "Egzamin 2020 — moment bezwładności",
    },
  ],
};

export function getQuestionFigures(questionId: string): QuestionFigure[] {
  return QUESTION_FIGURES[questionId] ?? [];
}
