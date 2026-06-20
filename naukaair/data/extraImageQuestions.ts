import type { QuestionSource } from "./questionTypes";

/** Pytania z egzaminu 2020 — treść i rysunki na skanie PDF; odpowiedzi wg recalli studentów */
type ImageQuestionRaw = {
  id: string;
  basePointId: number;
  topic: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  figureSrc?: string;
  figureAlt?: string;
};

const CROP = (id: string) => `/exam-images/crops/fizyka_2020_-_egzamin/${id}.jpg`;

export const EXTRA_IMAGE_RAW: ImageQuestionRaw[] = [
  {
    id: "q-ex-i01",
    basePointId: 130,
    topic: "Kula tocząca się",
    question:
      "Po poziomym podłożu toczy się bez poślizgu kula o jednorodnej gęstości. Wskaż rysunek, który prawidłowo przedstawia całkowite prędkości wybranych punktów kuli (patrz ilustracja z egzaminu).",
    options: [
      "Rysunek A",
      "Rysunek B",
      "Rysunek C",
      "Rysunek D",
    ],
    correctAnswerIndex: 1,
    explanation:
      "Przy toczeniu bez poślizgu: v_cm = ωR, punkt styku ma v = 0, góra ma v = 2v_cm — charakterystyczny rozkład zgodny z rysunkiem B.",
    figureSrc: CROP("q-ex-i01"),
    figureAlt: "Kula tocząca się — cztery warianty rozkładu prędkości",
  },
  {
    id: "q-ex-i02",
    basePointId: 131,
    topic: "Potencjał naładowanej kuli",
    question:
      "Piłeczka ping-pongowa o promieniu R naładowana dodatnio. Wskaż wykres poprawnie przedstawiający zależność potencjału V(r) od odległości r od środka (patrz ilustracja).",
    options: ["Rysunek A", "Rysunek B", "Rysunek C"],
    correctAnswerIndex: 2,
    explanation:
      "Dla naładowanej kulistej powłoki: V = const wewnątrz (r < R), na zewnątrz V ∝ 1/r. Na skanie egzaminu 2020 poprawny jest wykres c.",
    figureSrc: CROP("q-ex-i02"),
    figureAlt: "Wykres potencjału V(r) dla naładowanej kuli",
  },
  {
    id: "q-ex-i03",
    basePointId: 132,
    topic: "Długość fali",
    question:
      "Wskaż, która odległość oznaczona na rysunku fali odpowiada długości fali λ (patrz ilustracja).",
    options: ["Żadna z oznaczonych", "L1", "L2", "L3"],
    correctAnswerIndex: 1,
    explanation: "Długość fali to odległość między dwoma kolejnymi punktami o tej samej fazie — L1.",
    figureSrc: CROP("q-ex-i03"),
    figureAlt: "Sinusoida z oznaczeniami L1, L2, L3",
  },
  {
    id: "q-ex-i04",
    basePointId: 133,
    topic: "Siła reakcji na krzywym drucie",
    question:
      "Koralik porusza się po wygiętym drucie bez tarcia; |v| = const. Wskaż rysunek z poprawnie narysowaną siłą reakcji drutu na koralik (patrz ilustracja).",
    options: ["Rysunek A", "Rysunek B", "Rysunek C", "Rysunek D"],
    correctAnswerIndex: 1,
    explanation:
      "Siła reakcji jest prostopadła do toru (do drutu) i skierowana od powierzchni — zgodnie z rysunkiem B na egzaminie 2020.",
    figureSrc: CROP("q-ex-i04"),
    figureAlt: "Koralik na wygiętym drucie — warianty siły reakcji",
  },
  {
    id: "q-ex-i05",
    basePointId: 134,
    topic: "Gwiazda podwójna",
    question:
      "Gwiazda podwójna: masy M > m, ruch obrotowy wokół wspólnego środka masy. Wskaż rysunek z poprawnie zaznaczonym punktem obrotu (patrz ilustracja).",
    options: ["Rysunek A", "Rysunek B", "Rysunek C", "Rysunek D"],
    correctAnswerIndex: 2,
    explanation:
      "Środek masy leży bliżej masywniejszej gwiazdy M — poprawny rysunek C (potwierdzone na egzaminie 2020).",
    figureSrc: CROP("q-ex-i05"),
    figureAlt: "Układ podwójny — cztery warianty położenia osi obrotu",
  },
  {
    id: "q-ex-i06",
    basePointId: 135,
    topic: "Siły między przewodnikami",
    question:
      "Dwa nieskończone równoległe przewodniki: prądy I i 2I w przeciwnych kierunkach. Wskaż rysunek poprawnie pokazujący siły na jednostkę długości (patrz ilustracja).",
    options: ["Rysunek A", "Rysunek B", "Rysunek C", "Rysunek D"],
    correctAnswerIndex: 0,
    explanation:
      "Prądy przeciwne → siły odpychające; kierunki z reguły prawej dłoni. Poprawny rysunek A.",
    figureSrc: CROP("q-ex-i06"),
    figureAlt: "Dwa przewodniki z przeciwnymi prądami — siły wzajemne",
  },
  {
    id: "q-ex-i07",
    basePointId: 136,
    topic: "Klocek na klinie",
    question:
      "Klocek zjeżdża po klinie (bez tarcia klocek–klin i klin–podłoże). Wskaż rysunek z poprawnymi prędkościami klocka i klina względem podłoża (patrz ilustracja).",
    options: ["Rysunek A", "Rysunek B", "Rysunek C", "Rysunek D"],
    correctAnswerIndex: 1,
    explanation:
      "Z z.z. pędu: klin odpływa w przeciwną stronę niż składowa ruchu klocka — wariant B zgodny z typowym rozwiązaniem egzaminacyjnym.",
    figureSrc: CROP("q-ex-i07"),
    figureAlt: "Klocek na klinie — wektory prędkości",
  },
  {
    id: "q-ex-i08",
    basePointId: 137,
    topic: "Moment siły na krążku",
    question:
      "Bloczek na krążku z linką i ciężarkiem — dwa położenia kąta α. Moment siły względem osi krążka w obu położeniach (patrz ilustracja):",
    options: [
      "w pierwszym położeniu większy",
      "w drugim położeniu większy",
      "taki sam",
      "zależy od stosunku mas",
    ],
    correctAnswerIndex: 2,
    explanation:
      "Moment siły τ = r × F — dla tej samej sioty i geometrii moment nie zależy od położenia α. Egzamin 2020 + notatki 2023 I termin.",
    figureSrc: CROP("q-ex-i08"),
    figureAlt: "Bloczek na krążku — dwa kąty α",
  },
  {
    id: "q-ex-i09",
    basePointId: 138,
    topic: "Moment pędu względem CM",
    question:
      "Krążek zbliża się prostopadle do leżącego pręta, prosto nad środkiem masy pręta (przed zderzeniem). Moment pędu krążka względem środka masy pręta (patrz ilustracja):",
    options: [
      "nie istnieje (jest zerowy)",
      "ma stałą wartość niezerową",
      "zmienia się przy zbliżaniu",
      "byłby niezerowy tylko przy ruchu przez środek masy pręta",
    ],
    correctAnswerIndex: 0,
    explanation:
      "L = r × p względem CM pręta — przy ruchu prostopadłym do pręta promień wektorowy i pęd dają L = 0.",
    figureSrc: CROP("q-ex-i09"),
    figureAlt: "Krążek zbliżający się do pręta",
  },
  {
    id: "q-ex-i10",
    basePointId: 139,
    topic: "Ruch harmoniczny — stwierdzenia",
    question: "W ruchu harmonicznym nietłumionym (pytanie uzupełniające tekstowe — bez osobnego rysunku na skanie):",
    options: [
      "największa siła działa w położeniu równowagi",
      "największe przyspieszenie jest przy maksymalnym wychyleniu",
      "największa prędkość jest przy maksymalnym wychyleniu",
      "największe przyspieszenie jest w położeniu równowagi",
    ],
    correctAnswerIndex: 1,
    explanation: "a = −ω²x → |a|_max przy |x|_max; v = 0 w skrajnych położeniach.",
  },
  {
    id: "q-ex-i11",
    basePointId: 140,
    topic: "Wykres potencjału sfery",
    question:
      "Wskaż wykres poprawnie przedstawiający potencjał V(r) naładowanej sfery/przewodnika kulistego (patrz ilustracja z czterema wykresami).",
    options: ["Wykres A", "Wykres B", "Wykres C", "Wykres D"],
    correctAnswerIndex: 3,
    explanation:
      "Dla naładowanej sfery/przewodnika: V = const wewnątrz (r ≤ R), ciągłość na powierzchni, V ∝ 1/r na zewnątrz — wykres D na egzaminie 2020.",
    figureSrc: CROP("q-ex-i11"),
    figureAlt: "Cztery wykresy V(r) dla naładowanej sfery",
  },
  {
    id: "q-ex-i12",
    basePointId: 141,
    topic: "Obwód RC",
    question:
      "Obwód szeregowy: U = 10 V, C = 100 pF, R = 200 Ω. Tuż po zamknięciu wyłącznika prąd przez opornik wynosi (patrz schemat na ilustracji):",
    options: ["10 mA", "1 A", "50 mA", "0 A"],
    correctAnswerIndex: 2,
    explanation: "I(0) = U/R = 10/200 = 0,05 A = 50 mA.",
    figureSrc: CROP("q-ex-i12"),
    figureAlt: "Schemat obwodu RC z napięciem i elementami",
  },
];

export const EXTRA_IMAGE_META: Record<
  string,
  { source: QuestionSource; bazaTitle: string }
> = Object.fromEntries(
  EXTRA_IMAGE_RAW.map((q) => [
    q.id,
    {
      source: {
        type: "exam" as const,
        pdf: "fizyka_2020_-_egzamin.pdf",
        ref: "2020",
        note: `Skan PDF — ${q.topic}`,
      },
      bazaTitle: `Extra (obrazek) — ${q.topic}`,
    },
  ]),
);

export function imageRawToFigures(q: ImageQuestionRaw) {
  if (!q.figureSrc) return [];
  return [
    {
      src: q.figureSrc,
      alt: q.figureAlt ?? q.topic,
      caption: "Skan pytania z egzaminu 2020 (przycięty)",
    },
  ];
}
