# Projekt R – Estymacja i testowanie hipotez

Projekt laboratoryjny z przedmiotu statystyki. Obejmuje estymację parametrów, przedziały ufności, wczytywanie danych z CSV oraz testowanie hipotez na danych historycznych.

## Struktura projektu

```
projekt-r-statystyka/
├── dane/
│   ├── temperatury_warszawa.csv    # IMGW – temperatury (sep = ";")
│   └── bezrobocie_polska.csv       # GUS – bezrobocie (sep = ",")
├── zadanie_3/
│   └── estymacja_normalna.R        # Ocena 3 – 1 zadanie
├── zadanie_4/
│   ├── przedzial_ufnosci.R         # Ocena 4 – zadanie A
│   └── wartosc_oczekiwana.R        # Ocena 4 – zadanie B
├── zadanie_5/
│   ├── test_temperatury.R          # Ocena 5 – zadanie A (dane historyczne)
│   └── test_bezrobocie.R           # Ocena 5 – zadanie B (dane historyczne)
├── uruchom_wszystko.R              # Uruchamia wszystkie skrypty
└── raport.Rmd                      # Szablon raportu (R Markdown)
```

## Wymagania

- R (>= 4.0)
- RStudio (zalecane)
- Pakiety: `knitr`, `rmarkdown` (tylko do raportu)

```r
install.packages(c("knitr", "rmarkdown"))
```

## Jak uruchomić

### Opcja 1 – wszystkie zadania naraz

```r
setwd("sciezka/do/projekt-r-statystyka")
source("uruchom_wszystko.R")
```

### Opcja 2 – pojedyncze zadania

```r
setwd("sciezka/do/projekt-r-statystyka")
source("zadanie_3/estymacja_normalna.R")
source("zadanie_4/przedzial_ufnosci.R")
source("zadanie_4/wartosc_oczekiwana.R")
source("zadanie_5/test_temperatury.R")
source("zadanie_5/test_bezrobocie.R")
```

### Opcja 3 – raport HTML

```r
rmarkdown::render("raport.Rmd")
```

## Zadania

### Ocena 3 (1 zadanie)

| Plik | Temat |
|------|-------|
| `zadanie_3/estymacja_normalna.R` | Generowanie danych z `rnorm()`, estymacja średniej i odchylenia standardowego |

### Ocena 4 (2 zadania)

| Plik | Temat |
|------|-------|
| `zadanie_4/przedzial_ufnosci.R` | Przedział ufności 95% dla średniej (rozkład t-Studenta) |
| `zadanie_4/wartosc_oczekiwana.R` | Wczytywanie CSV (`read.csv`, `sep = ";"`), estymacja E[X] |

### Ocena 5 (2 zadania z danymi historycznymi)

| Plik | Dane | Hipoteza |
|------|------|----------|
| `zadanie_5/test_temperatury.R` | IMGW – temperatury Warszawy | H₀: μ = 10°C |
| `zadanie_5/test_bezrobocie.R` | GUS – bezrobocie w Polsce | H₀: μ_przed = μ_po |

## Źródła danych

### Temperatury (zadania 4B, 5A)

- **Źródło:** IMGW – Instytut Meteorologii i Gospodarki Wodnej
- **URL:** https://danepubliczne.imgw.pl/
- **Opis:** Miesięczne średnie temperatury powietrza, stacja Warszawa, lata 2019–2023
- **Format:** CSV, separator `;` (średnik)

### Bezrobocie (zadanie 5B)

- **Źródło:** GUS – Główny Urząd Statystyczny
- **URL:** https://bdl.stat.gov.pl/
- **Opis:** Stopa bezrobocia rejestrowanego w Polsce, dane kwartalne, lata 2018–2023
- **Format:** CSV, separator `,` (przecinek)

## Kluczowe komendy R

```r
# Generowanie z rozkładu normalnego
dane <- rnorm(n = 50, mean = 100, sd = 15)

# Wczytywanie CSV
dane <- read.csv("plik.csv", sep = ";", header = TRUE)   # średnik
dane <- read.csv("plik.csv", sep = ",", header = TRUE)   # przecinek

# Estymacja
mean(dane)           # średnia (estymator E[X])
sd(dane)             # odchylenie standardowe
var(dane)            # wariancja

# Przedział ufności
t.test(dane, conf.level = 0.95)

# Test hipotezy (jedna próba)
t.test(dane, mu = 10, alternative = "two.sided")

# Test hipotezy (dwie próby)
t.test(grupa1, grupa2, alternative = "two.sided")
```

## Przygotowanie raportu

1. Uruchom każdy skrypt w RStudio.
2. Zrób screenshoty kodu i wykresów.
3. Wklej screeny do `raport.Rmd` (miejsca oznaczone komentarzami).
4. Uzupełnij opisy źródeł danych.
5. Wygeneruj raport: `rmarkdown::render("raport.Rmd")`.

## Uwagi

- Przed uruchomieniem ustaw katalog roboczy na folder `projekt-r-statystyka`.
- Dane w plikach CSV są reprezentatywne; na zajęciach możesz pobrać aktualne dane z podanych źródeł.
- Parametr `sep` w `read.csv()` musi odpowiadać separatorowi w pliku (`,` lub `;`).
