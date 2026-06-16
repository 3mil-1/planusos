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

### Typowy błąd

Klik w link → „Not Found”, odświeżenie działa = źle skonfiguowany **Static Site** zamiast **Web Service**.

