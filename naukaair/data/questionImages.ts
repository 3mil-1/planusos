export type QuestionFigure = {
  src: string;
  alt: string;
  caption?: string;
};

/** Ilustracje wyciągnięte ze stron PDF (public/exam-images/) */
export const QUESTION_FIGURES: Record<string, QuestionFigure[]> = {
  "q-008": [
    {
      src: "/exam-images/fizyka_2020_-_egzamin/page-27.jpg",
      alt: "Kwadrat z ładunkami +q w trzech wierzchołkach — zadanie o ładunku w punkcie C",
      caption: "Egzamin 2020 — zadanie z kwadratem ładunków",
    },
  ],
  "q-010": [
    {
      src: "/exam-images/fizyka_egzamin_2023_ii_termin/page-04.jpg",
      alt: "Notatki egzaminowe — droga jako pole pod wykresem v(t)",
      caption: "Notatki 2023 II termin — wykres v(t)",
    },
  ],
  "q-011": [
    {
      src: "/exam-images/fizyka_2020_-_egzamin/page-13.jpg",
      alt: "Bloczek na krążku z linką — dwa położenia kąta α",
      caption: "Egzamin 2020 — moment siły na krążku",
    },
  ],
  "q-013": [
    {
      src: "/exam-images/fizyka_2020_-_egzamin/page-18.jpg",
      alt: "Wykres siły tarcia vs siły ciągnącej",
      caption: "Egzamin 2020 — wykres tarcia",
    },
  ],
  "q-021": [
    {
      src: "/exam-images/fizyka_egzamin_2023_ii_termin/page-04.jpg",
      alt: "Wykres prędkości od czasu — obliczenie średniego przyspieszenia",
      caption: "Notatki 2023 II termin — wykres v(t)",
    },
  ],
  "q-025": [
    {
      src: "/exam-images/fizyka_egzamin_2023_ii_termin/page-04.jpg",
      alt: "Wykres prędkości od czasu",
      caption: "Notatki 2023 II termin — wykres v(t)",
    },
  ],
  "q-043": [
    {
      src: "/exam-images/baza_fizyka_2025/page-03.jpg",
      alt: "Opis zadania ruchu harmonicznego — punkty a, b, c na wykresie",
      caption: "Baza AGH 2025 — pkt 43 (ruch harmoniczny)",
    },
  ],
  "q-051": [
    {
      src: "/exam-images/baza_fizyka_2025/page-04.jpg",
      alt: "Opis zadania — siła Lorentza, ładunki na okręgu",
      caption: "Baza AGH 2025 — pkt 51",
    },
  ],
  "q-060": [
    {
      src: "/exam-images/fizyka_egzamin_2023_ii_termin/page-14.jpg",
      alt: "Notatki — soczewka, odległość obiektu",
      caption: "Notatki 2023 II termin — soczewki",
    },
  ],
  "q-068": [
    {
      src: "/exam-images/fizyka_egzamin_2023_ii_termin/page-08.jpg",
      alt: "Trójkąt równoboczny z ładunkami",
      caption: "Notatki 2023 II termin — trójkąt ładunków",
    },
  ],
  "q-094": [
    {
      src: "/exam-images/fizyka_egzamin_2023_ii_termin/page-06.jpg",
      alt: "Wykres przemian termodynamicznych — izoterma, izobara, izochora, adiabata",
      caption: "Notatki 2023 II termin — przemiany gazowe",
    },
  ],
  "q-ex-004": [
    {
      src: "/exam-images/fizyka_2020_-_egzamin/page-18.jpg",
      alt: "Wykres siły tarcia vs siły ciągnącej",
      caption: "Egzamin 2020",
    },
  ],
  "q-ex-007": [
    {
      src: "/exam-images/fizyka_2020_-_egzamin/page-20.jpg",
      alt: "Nieskończona naładowana płaszczyzna — linie pola",
      caption: "Egzamin 2020 — płaszczyzna naładowana",
    },
  ],
  "q-ex-012": [
    {
      src: "/exam-images/fizyka_2020_-_egzamin/page-22.jpg",
      alt: "Dipol elektryczny — punkty p1–p4",
      caption: "Egzamin 2020 — dipol elektryczny",
    },
  ],
  "q-ex-021": [
    {
      src: "/exam-images/fizyka_2020_-_egzamin/page-05.jpg",
      alt: "Prostopadłościan z osiami X, Y, Z przez środek masy",
      caption: "Egzamin 2020 — moment bezwładności",
    },
  ],
};

export function getQuestionFigures(questionId: string): QuestionFigure[] {
  return QUESTION_FIGURES[questionId] ?? [];
}
