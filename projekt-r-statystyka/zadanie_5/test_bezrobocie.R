# =============================================================================
# ZADANIE 5B – Testowanie hipotez na danych historycznych (bezrobocie)
# =============================================================================
#
# ŹRÓDŁO DANYCH (pobrane z internetu):
#   Instytucja: GUS (Główny Urząd Statystyczny)
#   URL API:    https://bdl.stat.gov.pl/api/v1/
#   Portal:     https://bdl.stat.gov.pl/
#   Zmienna:    stopa bezrobocia rejestrowanego (dane miesięczne, subject P3559)
#   Jednostka:  POLSKA
#   Lata:       2018–2023
#
# Jak pobrać dane samodzielnie:
#   source("pobierz_dane.R")   # skrypt pobiera dane z API GUS i zapisuje CSV
#
# Hipoteza badawcza:
#   H0: średnia miesięczna stopa bezrobocia w latach 2018–2019 =
#       średnia miesięczna stopa bezrobocia w latach 2021–2023
#   H1: średnie się różnią (test dwóch prób niezależnych)
#   (rok 2020 pominięty – okres pandemii COVID-19)
#
# =============================================================================

sciezka_danych <- "dane/bezrobocie_polska.csv"

# --- Wczytywanie danych (sep = ",") ---
bezrobocie <- read.csv(sciezka_danych, sep = ",", header = TRUE)

cat("=== ZADANIE 5B: Test hipotezy – bezrobocie w Polsce ===\n\n")
cat("Zrodlo: GUS BDL API, stopa bezrobocia rejestrowanego (miesieczna)\n")
cat("Liczba obserwacji:", nrow(bezrobocie), "\n\n")

cat("Pierwsze wiersze danych:\n")
print(head(bezrobocie))
cat("\n")

# --- Podział na okresy (dane miesięczne) ---
przed <- bezrobocie$stopa_bezrobocia_proc[bezrobocie$rok <= 2019]
po    <- bezrobocie$stopa_bezrobocia_proc[bezrobocie$rok >= 2021]

cat(sprintf("Okres 2018-2019 (przed): n = %d mies., srednia = %.2f%%\n",
            length(przed), mean(przed)))
cat(sprintf("Okres 2021-2023 (po):    n = %d mies., srednia = %.2f%%\n\n",
            length(po), mean(po)))

# --- Hipotezy ---
cat("Hipoteza zerowa:       H0: mu_przed = mu_po\n")
cat("Hipoteza alternatywna: H1: mu_przed != mu_po\n")
cat("Poziom istotnosci:     alpha = 0.05\n\n")

# --- Test t dla dwóch prób niezależnych (Welcha) ---
test <- t.test(przed, po, alternative = "two.sided", var.equal = FALSE)

cat("--- Wyniki testu t-Studenta (dwie próby) ---\n")
cat(sprintf("Statystyka t:          %.4f\n", test$statistic))
cat(sprintf("Liczba stopni swobody: %.1f\n", test$parameter))
cat(sprintf("p-value:               %.4f\n", test$p.value))
cat(sprintf("Srednia przed:         %.4f%%\n", test$estimate[1]))
cat(sprintf("Srednia po:            %.4f%%\n", test$estimate[2]))
cat(sprintf("Roznica srednich:      %.4f%%\n\n", diff(test$estimate)))

# --- Wnioskowanie ---
alpha <- 0.05
if (test$p.value < alpha) {
  cat(sprintf("Wniosek: ODRZUCAMY H0 (p = %.4f < %.2f).\n", test$p.value, alpha))
  cat("Srednia stopa bezrobocia istotnie rozni sie miedzy okresami.\n")
} else {
  cat(sprintf("Wniosek: NIE ODRZUCAMY H0 (p = %.4f >= %.2f).\n", test$p.value, alpha))
  cat("Brak istotnych roznic w stopie bezrobocia miedzy okresami.\n")
}

# --- Wykres porównawczy ---
boxplot(list("2018-2019" = przed, "2021-2023" = po),
        col = c("lightblue", "lightcoral"),
        ylab = "Stopa bezrobocia rejestrowanego [%]",
        main = "Porownanie bezrobocia: przed vs po pandemii (GUS)")
points(1, mean(przed), pch = 18, cex = 2, col = "darkblue")
points(2, mean(po), pch = 18, cex = 2, col = "darkred")

cat("\nZadanie 5B zakonczone.\n")
