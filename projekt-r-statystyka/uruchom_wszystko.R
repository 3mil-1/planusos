# =============================================================================
# GŁÓWNY SKRYPT – uruchamia wszystkie zadania projektu
# =============================================================================
#
# Uruchomienie w RStudio: source("uruchom_wszystko.R")
# Lub z terminala:       Rscript uruchom_wszystko.R
#
# =============================================================================

# Ustaw katalog roboczy na folder projektu
if (!grepl("projekt-r-statystyka$", getwd())) {
  if (file.exists("projekt-r-statystyka")) {
    setwd("projekt-r-statystyka")
  }
}

cat("############################################\n")
cat("#  PROJEKT R – ESTYMACJA I TESTY HIPOTEZ  #\n")
cat("############################################\n\n")

cat("--- ZADANIE 3 (ocena 3): Estymacja z rozkładu normalnego ---\n\n")
source("zadanie_3/estymacja_normalna.R", encoding = "UTF-8")

cat("\n\n--- ZADANIE 4A (ocena 4): Przedział ufności ---\n\n")
source("zadanie_4/przedzial_ufnosci.R", encoding = "UTF-8")

cat("\n\n--- ZADANIE 4B (ocena 4): Wartość oczekiwana z CSV ---\n\n")
source("zadanie_4/wartosc_oczekiwana.R", encoding = "UTF-8")

cat("\n\n--- ZADANIE 5A (ocena 5): Test hipotezy – temperatury ---\n\n")
source("zadanie_5/test_temperatury.R", encoding = "UTF-8")

cat("\n\n--- ZADANIE 5B (ocena 5): Test hipotezy – bezrobocie ---\n\n")
source("zadanie_5/test_bezrobocie.R", encoding = "UTF-8")

cat("\n\n############################################\n")
cat("#  WSZYSTKIE ZADANIA ZAKONCZONE            #\n")
cat("############################################\n")
