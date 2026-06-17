# Źródła danych – pobrane z internetu

Dane w folderze `dane/` pochodzą z oficjalnych publicznych źródeł.
Można je odświeżyć skryptem `pobierz_dane.R`.

## 1. Temperatury – IMGW

| Pole | Wartość |
|------|---------|
| Instytucja | IMGW-PIB |
| URL | https://danepubliczne.imgw.pl/ |
| Bezpośredni link | https://danepubliczne.imgw.pl/data/dane_pomiarowo_obserwacyjne/dane_meteorologiczne/miesieczne/synop/ |
| Stacja | WARSZAWA-OKĘCIE |
| Parametr | STM – średnia miesięczna temperatura powietrza [°C] |
| Lata | 2019–2023 |
| Plik | `dane/temperatury_warszawa.csv` |
| Separator | `;` (średnik) |

## 2. Bezrobocie – GUS

| Pole | Wartość |
|------|---------|
| Instytucja | GUS (Główny Urząd Statystyczny) |
| Portal | https://bdl.stat.gov.pl/ |
| API | https://bdl.stat.gov.pl/api/v1/ |
| Zmienna | Stopa bezrobocia rejestrowanego (dane miesięczne) |
| ID tematu | P3559 |
| ID zmiennych | 461680–461691 (styczeń–grudzień) |
| Jednostka | POLSKA |
| Lata | 2018–2023 |
| Plik | `dane/bezrobocie_polska.csv` |
| Separator | `,` (przecinek) |

## Jak pobrać dane ponownie

```r
setwd("projekt-r-statystyka")
install.packages("jsonlite")   # tylko raz
source("pobierz_dane.R")
```

Skrypt pobiera dane bezpośrednio z serwerów IMGW i GUS i nadpisuje pliki CSV.
