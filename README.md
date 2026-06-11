# PlanUSOS

Plan zajęć z USOS, który **sam się synchronizuje**, z automatycznym budzikiem na iPhonie,
widgetami i eksportem do PNG. Działa na PC i na iPhonie (PWA).

## Uruchomienie

```powershell
python server.py
```

- na komputerze: **http://localhost:8000**
- z telefonu (to samo Wi-Fi): adres wypisze się w konsoli, np. `http://192.168.0.83:8000`

## Konta

Przy pierwszym wejściu zakładasz konto (login + hasło). Każde konto ma **całkowicie osobne**:
plan, link USOS, egzaminy, pominięcia, budzik i ustawienia. Dane leżą w `data/users/<login>/`.

Linki do budzika i kalendarza (Skróty iOS, subskrypcje webcal) zawierają Twój prywatny token –
nie udostępniaj ich nikomu. Po prostu skopiuj je z ustawień po zalogowaniu.

## Połączenie z USOS (raz, potem automat)

1. Zaloguj się do USOSweb → **Mój USOSweb → Plan zajęć**
2. Skopiuj link **eksportu iCal** (ikona kalendarza / "eksportuj")
3. W aplikacji: **Ustawienia → wklej link → Zapisz i synchronizuj**

Od tej pory plan pobiera się automatycznie przy każdym uruchomieniu i co 30 minut.
(USOS nie pozwala zewnętrznym aplikacjom logować się hasłem – prywatny link planu to
oficjalny sposób i robi dokładnie to samo, bez podawania hasła.)

## Automatyczny budzik na iPhonie

1. Otwórz aplikację na telefonie (adres z konsoli)
2. **Ustawienia → Subskrybuj pobudki** – telefon raz zapyta o dodanie kalendarza
3. Koniec. Pobudki (np. 90 min przed pierwszymi zajęciami) **same** pojawiają się
   w kalendarzu z głośnym powiadomieniem i same się aktualizują, gdy plan się zmieni.

Możesz też zasubskrybować **cały plan** – zajęcia będą widoczne w kalendarzu iPhone'a.

Wskazówka: w **Ustawienia → Kalendarz → Konta → Subskrybowane kalendarze** sprawdź,
czy powiadomienia dla subskrybowanego kalendarza są włączone.

## Hosting w chmurze (działa wszędzie, nie tylko w domowym Wi-Fi)

1. Wrzuć ten folder jako repozytorium na GitHub
2. Załóż darmowe konto na [render.com](https://render.com) → **New → Web Service** → wskaż repo
   (Render sam wykryje `render.yaml` i `Dockerfile`)
3. Po wdrożeniu dostajesz adres typu `https://planusos.onrender.com` – używaj go na telefonie
   zamiast adresu z domowej sieci (subskrypcje, budzik Skrótów, wszystko działa z LTE)

Uwaga: darmowa instancja Render usypia po bezczynności – pierwsze wejście może chwilę trwać.
Dysk darmowego planu jest ulotny: po ponownym wdrożeniu konta trzeba założyć od nowa
(albo dokup trwały dysk i zamontuj go pod `data/`).

## Funkcje

- **Wykrywanie zmian planu** – przy każdej synchronizacji serwer porównuje plan z poprzednim;
  odwołane zajęcia, nowe terminy i zmiany sal pokazują się jako baner + powiadomienie
- **Kolokwia i egzaminy** – dodajesz terminy w ustawieniach: pojawiają się w planie,
  widget odlicza czas, a budzik traktuje je jak obowiązkowe zajęcia
- **Tryb nauki (Pomodoro)** – 25 min skupienia / 5 min przerwy, statystyki dzienne i tygodniowe

- Widok tygodnia: kolorowe bloki, linia "teraz", nawigacja po tygodniach
- **Pobierz PNG** – plan jako obrazek (idealny na tapetę)
- Widgety: następne zajęcia z odliczaniem, plan na dziś, godzina pobudki, statystyki
- **Kiedy iść spać?** – podpowiada godziny zaśnięcia wg 90-minutowych cykli snu,
  żebyś wstał wyspany na pierwsze zajęcia
- Przypomnienia przed zajęciami (powiadomienia w przeglądarce)
- Budzik także na PC (dzwoni w aplikacji, gdy karta jest otwarta)
- PWA: instalacja na pulpicie PC i ekranie głównym iPhone'a (Safari → Udostępnij →
  Dodaj do ekranu początkowego), działa offline

## Struktura

```
server.py             – serwer: statyczne pliki + synchronizacja z USOS + feed webcal
index.html            – aplikacja
css/style.css         – wygląd (neobrutalizm)
js/app.js             – logika
manifest.webmanifest  – PWA
sw.js                 – service worker (offline)
icons/                – ikony
tools/make_icons.py   – generator ikon (Pillow)
data/users.json       – konta (hash haseł PBKDF2 + tokeny)
data/users/<login>/   – dane konta: config.json, plan.ics, changes.json
```

## Wymagania

- Python 3.9+ (bez dodatkowych bibliotek)
- Przeglądarka: Chrome / Edge / Safari
