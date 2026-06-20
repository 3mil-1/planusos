import type { QuestionSource } from "./questionTypes";

/** Pytania spoza mapowania 1–99, wyciągnięte z egzaminów 2020–2023 (OCR PDF). basePointId 100+ */
type ExtraRaw = {
  id: string;
  basePointId: number;
  topic: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
};

export const EXTRA_RAW_QUESTIONS: ExtraRaw[] = [
  {
    id: "q-ex-001",
    basePointId: 100,
    topic: "Moment bezwładności",
    question:
      "Moment bezwładności bryły sztywnej względem osi obrotu niesie informację o:",
    options: [
      "rozkładzie masy wokół wybranej osi",
      "sile dośrodkowej podczas ruchu obrotowego",
      "sile bezwładności przy ruchu postępowym",
      "momencie siły działającym na bryłę",
    ],
    correctAnswerIndex: 0,
    explanation:
      "I = ∫ r² dm opisuje, jak masa jest rozłożona względem osi — nie jest to sama siła.",
  },
  {
    id: "q-ex-002",
    basePointId: 101,
    topic: "Siła w ruchu harmonicznym",
    question: "Ruch harmoniczny wywołany jest działaniem siły, która jest:",
    options: [
      "proporcjonalna do wychylenia i skierowana zgodnie z nim",
      "odwrotnie proporcjonalna do wychylenia i zgodna z nim",
      "odwrotnie proporcjonalna do wychylenia i przeciwna do niego",
      "proporcjonalna do wychylenia i skierowana przeciwnie do niego",
    ],
    correctAnswerIndex: 3,
    explanation:
      "F = −kx: siła rośnie z wychyleniem i działa w stronę równowagi (przeciwnie do x). Pytanie powtarzało się na egzaminach 2020 i 2023.",
  },
  {
    id: "q-ex-003",
    basePointId: 102,
    topic: "Cykl Carnota",
    question: "Cykl Carnota składa się z:",
    options: [
      "dwóch adiabat i dwóch izobar",
      "dwóch izoterm i dwóch izobar",
      "dwóch izochor i dwóch adiabat",
      "dwóch adiabat i dwóch izoterm",
    ],
    correctAnswerIndex: 3,
    explanation:
      "Carnot: izotermiczne ekspansja/sprężanie + dwie przemiany adiabatyczne. Egzamin 2020.",
  },
  {
    id: "q-ex-004",
    basePointId: 103,
    topic: "Tarcie statyczne i kinetyczne",
    question:
      "Klocek na podłożu jest ciągnięty siłą rosnącą powoli. Z wykresu siły tarcia vs siły ciągnącej wynika, że tarcie jest:",
    options: [
      "wyłącznie statyczne",
      "najpierw statyczne, potem kinetyczne",
      "wyłącznie kinetyczne",
      "najpierw kinetyczne, potem statyczne",
    ],
    correctAnswerIndex: 1,
    explanation:
      "Dopóki ciało stoi, działa tarcie statyczne; po rozpoczęciu ruchu — kinetyczne. Potwierdzone na egzaminie 2020.",
  },
  {
    id: "q-ex-005",
    basePointId: 104,
    topic: "Zderzenie sprężyste",
    question:
      "Dwa jednakowe krążki na lodzie: jeden spoczywa, drugi porusza się z prędkością v i uderza centralnie (zderzenie idealnie sprężyste). Po zderzeniu:",
    options: [
      "krążki łączą się i jadą razem",
      "oba poruszają się z tą samą prędkością v",
      "poruszający się krążek zatrzymuje się, spoczywający rusza z v",
      "spoczywający rusza z 2v, drugi cofa się z −v",
    ],
    correctAnswerIndex: 2,
    explanation:
      "Zderzenie sprężyste masy równych: wymiana prędkości — uderzający staje, drugi rusza z v. Egzamin 2020.",
  },
  {
    id: "q-ex-006",
    basePointId: 105,
    topic: "Efekt Dopplera",
    question:
      "Samochód i radiowóz jadą wzdłuż jednej prostej. Dźwięk syreny słyszany przez kierowcę samochodu będzie najwyższy, gdy:",
    options: [
      "oba pojazdy oddalają się od siebie",
      "radiowóz stoi, a samochód zbliża się",
      "samochód stoi, a radiowóz zbliża się",
      "oba pojazdy zbliżają się do siebie",
    ],
    correctAnswerIndex: 3,
    explanation:
      "Największa obserwowana częstotliwość przy maksymalnej względnej prędkości zbliżania źródła i obserwatora. Egzamin 2020.",
  },
  {
    id: "q-ex-007",
    basePointId: 106,
    topic: "Pole płaszczyzny naładowanej",
    question:
      "Nieskończona, pozioma płaszczyzna jednorodnie naładowana dodatnio. Które zdanie jest NIEPRAWDZIWE?",
    options: [
      "przy ładunku ujemnym linie pola byłyby skierowane przeciwnie",
      "natężenie można wyznaczyć z prawa Gaussa",
      "pole po każdej stronie płaszczyzny jest jednorodne",
      "po obu stronach płaszczyzny linie pola skierowane są do góry",
    ],
    correctAnswerIndex: 3,
    explanation:
      "Przy ładunku dodatnim linie wychodzą z płaszczyzny — po jednej stronie w górę, po drugiej w dół. Egzamin 2020.",
  },
  {
    id: "q-ex-008",
    basePointId: 107,
    topic: "Obwód RC — prąd początkowy",
    question:
      "Szeregowo: U = 10 V, kondensator C = 100 pF, opornik R = 200 Ω. Tuż po zamknięciu wyłącznika prąd przez opornik wynosi:",
    options: ["10 mA", "1 A", "50 mA", "0 A"],
    correctAnswerIndex: 2,
    explanation:
      "Nienaładowany kondensator zachowuje się jak zwarcie: I(0) = U/R = 10/200 = 0,05 A = 50 mA. Egzamin 2020.",
  },
  {
    id: "q-ex-009",
    basePointId: 108,
    topic: "Wahadło — okres a szerokość geograficzna",
    question:
      "Wahadło matematyczne T = 2π√(L/g). Przy porównaniu bieguna i równika (ta sama L) okres na równiku będzie:",
    options: [
      "krótszy niż na biegunie",
      "dłuższy niż na biegunie",
      "identyczny w każdym miejscu",
      "nieskończony na równiku",
    ],
    correctAnswerIndex: 1,
    explanation:
      "Na równiku g jest mniejsze (siła odśrodkowa), więc T = 2π√(L/g) jest większe. Notatki z egzaminu 2023 II termin.",
  },
  {
    id: "q-ex-010",
    basePointId: 109,
    topic: "Moment pędu względem środka masy",
    question:
      "Krążek zbliża się prostopadle do leżącego pręta, prosto nad środkiem masy pręta (przed zderzeniem). Moment pędu krążka względem środka masy pręta:",
    options: [
      "nie istnieje (jest zerowy)",
      "ma stałą wartość niezerową",
      "rosnąco zmienia się przy zbliżaniu",
      "istniałby tylko przy ruchu wzdłuż prostej przez środek masy pręta",
    ],
    correctAnswerIndex: 0,
    explanation:
      "Moment pędu L = r × p względem środka masy pręta wymaga składowej pędu prostopadłej do promienia — przy ruchu prostopadłym do pręta L = 0. Egzamin 2020.",
  },
  {
    id: "q-ex-011",
    basePointId: 110,
    topic: "Szczególna teoria względności — długość",
    question:
      "Pasażer pociągu porównuje długość kijka z sobą i kijka pozostawionego na stacji. Skrócenie długości NIE wystąpi, gdy kijek na stacji jest:",
    options: [
      "ułożony równolegle do kierunku ruchu pociągu",
      "wbity pionowo względem toru",
      "wbity ukośnie",
      "to nie ma znaczenia — zawsze widać skrócenie",
    ],
    correctAnswerIndex: 1,
    explanation:
      "W STR skracają się wymiary równoległe do ruchu względnego; wymiar prostopadły pozostaje bez zmian. Egzamin 2020.",
  },
  {
    id: "q-ex-012",
    basePointId: 111,
    topic: "Dipol — kierunek pola",
    question:
      "Przy dipolu elektrycznym (oś pozioma, + po lewej, − po prawej) wektor natężenia pola E jest skierowany pionowo w dół w punktach:",
    options: ["p1 i p3 (nad i pod środkiem dipola)", "tylko p4", "p2 i p4 (po bokach dipola)", "tylko p2"],
    correctAnswerIndex: 2,
    explanation:
      "Na osi prostopadłej do dipola pole ma składową pionową w dół w punktach bocznych. Notatka z egzaminu 2023: poprawne p2 i p4.",
  },
  {
    id: "q-ex-013",
    basePointId: 112,
    topic: "Iloczyn wektorowy",
    question: "Iloczyn wektorowy (3i − 4j) × (4i − 2j) ma postać:",
    options: ["−10k", "10k", "10i", "0"],
    correctAnswerIndex: 1,
    explanation:
      "i×i=0, i×j=k, j×i=−k: (3·(−2)−(−4)·4)k = (−6+16)k = 10k. Egzamin 2023 II termin.",
  },
  {
    id: "q-ex-014",
    basePointId: 113,
    topic: "Entropia — II zasada",
    question: "W układzie termodynamicznie izolowanym entropia:",
    options: [
      "nie może maleć (ΔS ≥ 0)",
      "musi maleć",
      "zawsze jest stała",
      "nie ma znaczenia fizycznego",
    ],
    correctAnswerIndex: 0,
    explanation:
      "II zasada termodynamiki: w układzie izolowanym entropia rośnie lub pozostaje stała. Pytanie wielokrotnego wyboru 2023 II termin.",
  },
  {
    id: "q-ex-015",
    basePointId: 114,
    topic: "Sprawność Carnota",
    question: "Sprawność idealnego silnika Carnota zależy:",
    options: [
      "wyłącznie od temperatur źródła ciepła i odbiornika",
      "od rodzaju gazu roboczego",
      "od ciśnienia początkowego",
      "od objętości cylindra",
    ],
    correctAnswerIndex: 0,
    explanation:
      "η = 1 − T_cold/T_hot — tylko temperatury skrajne. Notatka z egzaminu 2023 II termin.",
  },
  {
    id: "q-ex-016",
    basePointId: 115,
    topic: "Gradient pola",
    question: "Gradient ∇ można obliczyć dla:",
    options: [
      "pól skalarnych (np. potencjału, temperatury)",
      "wyłącznie pól wektorowych",
      "tylko pola magnetycznego",
      "żadnego pola fizycznego",
    ],
    correctAnswerIndex: 0,
    explanation:
      "Gradient działa na skalar i daje wektor. Pytanie wielokrotnego wyboru — egzamin 2021 I termin (OCR).",
  },
  {
    id: "q-ex-017",
    basePointId: 116,
    topic: "Potencjał w przewodniku",
    question: "Wewnątrz naładowanej metalowej kuli w stanie elektrostatycznej równowagi potencjał:",
    options: [
      "jest stały (równy potencjałowi powierzchni)",
      "maleje liniowo od środka do powierzchni",
      "jest zerowy wszędzie",
      "rośnie ku środkowi",
    ],
    correctAnswerIndex: 0,
    explanation:
      "Przewodnik w równowadze: cały przewodnik jest ekwipotencjalny. Egzamin 2021 I termin (OCR).",
  },
  {
    id: "q-ex-018",
    basePointId: 117,
    topic: "Prawa Keplera",
    question: "Zgodnie z prawami Keplera, w orbicie eliptycznej planety Słońce leży:",
    options: [
      "w jednym z ognisk elipsy (nie w geometrycznym środku)",
      "dokładnie w geometrycznym środku elipsy",
      "poza orbitą planety",
      "na apogeum zawsze",
    ],
    correctAnswerIndex: 0,
    explanation:
      "I prawo Keplera: Słońce w jednym z ognisk elipsy (nie w geometrycznym środku). Egzamin 2021 I termin.",
  },
  {
    id: "q-ex-019",
    basePointId: 118,
    topic: "Praca w polu grawitacyjnym",
    question: "Praca siły grawitacji (pole zachowawcze) między dwoma punktami:",
    options: [
      "nie zależy od toru, tylko od różnicy potencjałów",
      "zawsze zależy od długości drogi",
      "jest zerowa zawsze",
      "zależy od prędkości ciała",
    ],
    correctAnswerIndex: 0,
    explanation:
      "Pole zachowawcze: W = −ΔU. Egzamin 2021 I termin (OCR).",
  },
  {
    id: "q-ex-020",
    basePointId: 119,
    topic: "Fale dźwiękowe",
    question: "Fale dźwiękowe w powietrzu to fale:",
    options: [
      "podłużne (ciśnienie i prędkość cząsteczek oscylują w kierunku propagacji)",
      "poprzeczne (jak fale na wodzie)",
      "elektromagnetyczne",
      "stojące wyłącznie",
    ],
    correctAnswerIndex: 0,
    explanation:
      "Dźwięk w gazie to fala podłużna. Na egzaminie 2021 błędnym było stwierdzenie o falach poprzecznych.",
  },
  {
    id: "q-ex-021",
    basePointId: 120,
    topic: "Moment bezwładności — prostopadłościan",
    question:
      "Jednorodny prostopadłościan ma wymiary boków jak na rysunku egzaminu 2020: 100 wzdłuż osi X, 10 wzdłuż osi Y, 25 wzdłuż osi Z. Największy moment bezwładności względem osi przechodzących przez środek masy ma względem osi:",
    options: [
      "X (wzdłuż najdłuższego boku)",
      "Y (wzdłuż najkrótszego boku — wysokość 10)",
      "Z (wzdłuż boku 25)",
      "wszystkie momenty są równe",
    ],
    correctAnswerIndex: 1,
    explanation:
      "I_X ∝ 10²+25², I_Y ∝ 100²+25², I_Z ∝ 100²+10² — największy moment dla osi Y (prostopadłej do płaszczyzny 100×25).",
  },
  {
    id: "q-ex-022",
    basePointId: 121,
    topic: "Zderzenie niesprężyste",
    question: "W zderzeniu całkowicie niesprężystym układu izolowanego od otoczenia:",
    options: [
      "pęd układu jest zachowany, energia kinetyczna zwykle nie",
      "ani pęd, ani energia kinetyczna nie są zachowane",
      "zachowana jest energia kinetyczna, pęd nie",
      "zachowane są obie wielkości zawsze",
    ],
    correctAnswerIndex: 0,
    explanation:
      "Pęd zachowany przy braku sił zewnętrznych; energia kinetyczna tracona na deformację. Notatka 2023 II termin.",
  },
  {
    id: "q-ex-023",
    basePointId: 122,
    topic: "Rakieta — przyspieszenie",
    question:
      "Rakieta porusza się w próżni, wyrzucając w każdej sekundzie stałą masę spalin. Wraz z upływem czasu jej przyspieszenie:",
    options: [
      "rośnie (masa maleje)",
      "maleje",
      "pozostaje stałe",
      "jest zerowe od początku",
    ],
    correctAnswerIndex: 0,
    explanation:
      "a = F/m — przy stałym ciągu i malejącej masie przyspieszenie rośnie. Pytanie wielokrotnego wyboru 2021 I termin.",
  },
  {
    id: "q-ex-024",
    basePointId: 123,
    topic: "Iloczyn wektorowy — kierunek",
    question: "Iloczyn wektorowy (2i + 2j) × (2i − 4j) jest równoległy do:",
    options: ["osi Z (wektor ±k)", "osi X", "osi Y", "żadnej osi (wektor ukośny)"],
    correctAnswerIndex: 0,
    explanation:
      "(2·(−4) − 2·2)k = −12k — równoległy do osi Z. Egzamin 2023 I termin (JW).",
  },
];

export const EXTRA_QUESTION_META: Record<
  string,
  { source: QuestionSource; bazaTitle: string }
> = {
  "q-ex-001": {
    source: { type: "exam", pdf: "fizyka_2020_-_egzamin.pdf", ref: "2020", note: "Moment bezwładności" },
    bazaTitle: "Extra — moment bezwładności",
  },
  "q-ex-002": {
    source: { type: "exam", pdf: "fizyka_2020_-_egzamin.pdf", ref: "2020", note: "Siła −kx" },
    bazaTitle: "Extra — ruch harmoniczny",
  },
  "q-ex-003": {
    source: { type: "exam", pdf: "fizyka_2020_-_egzamin.pdf", ref: "2020", note: "Skład cyklu Carnota" },
    bazaTitle: "Extra — cykl Carnota",
  },
  "q-ex-004": {
    source: { type: "exam", pdf: "fizyka_2020_-_egzamin.pdf", ref: "2020", note: "Tarcie statyczne → kinetyczne" },
    bazaTitle: "Extra — tarcie",
  },
  "q-ex-005": {
    source: { type: "exam", pdf: "fizyka_2020_-_egzamin.pdf", ref: "2020", note: "Zderzenie sprężyste krążków" },
    bazaTitle: "Extra — zderzenia",
  },
  "q-ex-006": {
    source: { type: "exam", pdf: "fizyka_2020_-_egzamin.pdf", ref: "2020", note: "Efekt Dopplera" },
    bazaTitle: "Extra — fale akustyczne",
  },
  "q-ex-007": {
    source: { type: "exam", pdf: "fizyka_2020_-_egzamin.pdf", ref: "2020", note: "Płaszczyzna naładowana" },
    bazaTitle: "Extra — elektrostatyka",
  },
  "q-ex-008": {
    source: { type: "exam", pdf: "fizyka_2020_-_egzamin.pdf", ref: "2020", note: "RC I(0)=U/R" },
    bazaTitle: "Extra — obwód RC",
  },
  "q-ex-009": {
    source: {
      type: "exam",
      pdf: "fizyka_egzamin_2023_ii_termin.pdf",
      ref: "2023-II-WW",
      note: "Wahadło T na równiku",
    },
    bazaTitle: "Extra — wahadło",
  },
  "q-ex-010": {
    source: { type: "exam", pdf: "fizyka_2020_-_egzamin.pdf", ref: "2020", note: "Moment pędu względem CM" },
    bazaTitle: "Extra — moment pędu",
  },
  "q-ex-011": {
    source: { type: "exam", pdf: "fizyka_2020_-_egzamin.pdf", ref: "2020", note: "STR — skrócenie długości" },
    bazaTitle: "Extra — szczególna teoria względności",
  },
  "q-ex-012": {
    source: {
      type: "exam",
      pdf: "fizyka_2020_-_egzamin.pdf",
      ref: "2020",
      note: "Dipol — pole w p2, p4",
    },
    bazaTitle: "Extra — dipol elektryczny",
  },
  "q-ex-013": {
    source: {
      type: "exam",
      pdf: "fizyka_egzamin_2023_ii_termin.pdf",
      ref: "2023-II-WW",
      note: "(3i−4j)×(4i−2j)",
    },
    bazaTitle: "Extra — iloczyn wektorowy",
  },
  "q-ex-014": {
    source: {
      type: "exam",
      pdf: "fizyka_egzamin_2023_ii_termin.pdf",
      ref: "2023-II-WW",
      note: "Entropia układu izolowanego",
    },
    bazaTitle: "Extra — termodynamika",
  },
  "q-ex-015": {
    source: {
      type: "exam",
      pdf: "fizyka_egzamin_2023_ii_termin.pdf",
      ref: "2023-II-WW",
      note: "Sprawność Carnota",
    },
    bazaTitle: "Extra — silnik Carnota",
  },
  "q-ex-016": {
    source: {
      type: "exam",
      pdf: "egzamin-fizyka-2021-pytania-cz-1.pdf",
      ref: "2021-I",
      note: "Gradient pola skalarnego",
    },
    bazaTitle: "Extra — gradient",
  },
  "q-ex-017": {
    source: {
      type: "exam",
      pdf: "egzamin-fizyka-2021-pytania-cz-1.pdf",
      ref: "2021-I",
      note: "Potencjał w kuli metalowej",
    },
    bazaTitle: "Extra — potencjał w przewodniku",
  },
  "q-ex-018": {
    source: {
      type: "exam",
      pdf: "egzamin-fizyka-2021-pytania-cz-2.pdf",
      ref: "2021-I",
      note: "Kepler — Słońce w ognisku",
    },
    bazaTitle: "Extra — Kepler",
  },
  "q-ex-019": {
    source: {
      type: "exam",
      pdf: "egzamin-fizyka-2021-pytania-cz-1.pdf",
      ref: "2021-I",
      note: "Praca w polu grawitacyjnym",
    },
    bazaTitle: "Extra — pole grawitacyjne",
  },
  "q-ex-020": {
    source: {
      type: "exam",
      pdf: "egzamin-fizyka-2021-pytania-cz-1.pdf",
      ref: "2021-I",
      note: "Fale dźwiękowe podłużne",
    },
    bazaTitle: "Extra — fale dźwiękowe",
  },
  "q-ex-021": {
    source: { type: "exam", pdf: "fizyka_2020_-_egzamin.pdf", ref: "2020", note: "Moment bezwładności prostopadłościanu" },
    bazaTitle: "Extra — moment bezwładności",
  },
  "q-ex-022": {
    source: {
      type: "exam",
      pdf: "fizyka_egzamin_2023_ii_termin.pdf",
      ref: "2023-II-WW",
      note: "Zderzenie niesprężyste",
    },
    bazaTitle: "Extra — zderzenia",
  },
  "q-ex-023": {
    source: {
      type: "exam",
      pdf: "egzamin-fizyka-2021-pytania-cz-1.pdf",
      ref: "2021-I",
      note: "Przyspieszenie rakiety",
    },
    bazaTitle: "Extra — rakieta",
  },
  "q-ex-024": {
    source: {
      type: "exam",
      pdf: "fizyka_egzamin_2023_i_termin.pdf",
      ref: "2023-I-JW",
      note: "(2i+2j)×(2i−4j) ∥ Z",
    },
    bazaTitle: "Extra — iloczyn wektorowy",
  },
};

export const EXTRA_POINT_ID_START = 100;

export function isExtraPointId(id: number): boolean {
  return id >= EXTRA_POINT_ID_START;
}
