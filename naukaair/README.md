# naukaair

Aplikacja SPA (Next.js App Router) do nauki i symulacji egzaminu z fizyki — baza 99 punktów AGH 2025.

## Uruchomienie

```bash
cd naukaair
npm install
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000) — zaloguj się samym loginem (bez hasła).

## Funkcje

- **99 pytań** — po jednym na każdy punkt bazy 2025 (`data/questions.ts`)
- **Tryb nauki** — natychmiastowa ocena + wyjaśnienie
- **Symulacja egzaminu** — 40 pytań, 60 minut
- **Statystyki** — Zustand + localStorage per użytkownik
- **Ranking globalny** — sync przez API (`data/global-stats.json`)

## Stack

Next.js 16, TypeScript, Tailwind CSS, Zustand, lucide-react
