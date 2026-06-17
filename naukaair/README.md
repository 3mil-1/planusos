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
- **46 z egzaminów / bazy** — przypisane do konkretnego PDF (`data/sources/`)
- **53 syntetycznych** — uzupełnienie wg oficjalnej `baza_fizyka_2025.pdf`
- Źródła PDF: 2020, 2023 I/II termin, 2021 (skany), baza 2025
- Metadane źródeł: `data/questionMeta.ts`, typy: `data/questionTypes.ts`
- **Symulacja egzaminu** — 40 pytań, 60 minut
- **Statystyki** — Zustand + localStorage per użytkownik + sync na serwer
- **Ranking globalny** — Postgres (Neon) lub plik lokalny jako fallback

## Trwałe statystyki na Renderze (WAŻNE)

Render Free ma **ulotny dysk** — plik `data/global-stats.json` znika po restarcie, deployu lub uśpieniu serwisu. To ten sam problem co w planusos.

**Rozwiązanie:** darmowa baza Postgres (np. [Neon](https://neon.tech)):

1. Załóż projekt na neon.tech → skopiuj connection string (`postgresql://...`)
2. W Render → Web Service → **Environment** → dodaj:
   - `DATABASE_URL` = connection string z Neon
3. **Redeploy** (Manual Deploy → Clear build cache)

Po ustawieniu `DATABASE_URL` aplikacja automatycznie tworzy tabelę `naukaair_user_stats` i zapisuje statystyki w Postgres. Na dashboardzie zniknie żółte ostrzeżenie.

Bez `DATABASE_URL` statystyki działają tylko w localStorage przeglądarki — po wejściu z innej przeglądarki/urządzenia lub po wyczyszczeniu cache znikną.

## Deploy na Render (WAŻNE)

**Nie używaj „Static Site”** — aplikacja wymaga serwera Node (API + routing Next.js).

### Opcja A — Docker (zalecane)

1. W Render: **New → Web Service**
2. Połącz repo, ustaw **Root Directory**: `naukaair`
3. Runtime: **Docker** (użyje `naukaair/Dockerfile`)
4. Plan Free OK — pierwsze wejście po uśpieniu trwa ~30 s

### Opcja B — Node ręcznie

| Pole | Wartość |
|------|---------|
| Root Directory | `naukaair` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Typ | **Web Service** (nie Static Site!) |
| `DATABASE_URL` | connection string Neon Postgres (wymagane dla trwałych statystyk) |

### Typowy błąd

Klik w link → „Not Found”, odświeżenie działa = źle skonfiguowany **Static Site** zamiast **Web Service**.

