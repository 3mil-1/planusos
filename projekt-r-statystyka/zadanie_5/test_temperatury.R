# =============================================================================
# ZADANIE 5A – Testowanie hipotez na danych historycznych (temperatury)
# =============================================================================
#
# ŹRÓDŁO DANYCH (pobrane z internetu):
#   Instytucja: IMGW-PIB (Instytut Meteorologii i Gospodarki Wodnej)
#   URL:        https://danepubliczne.imgw.pl/
#   Zasób:      dane miesięczne stacji synoptycznych (archiwum ZIP/CSV)
#   Stacja:     WARSZAWA-OKĘCIE (kod 352200375)
#   Parametr:   STM – średnia miesięczna temperatura powietrza [°C]
#   Lata:       2019–2023
#
# Jak pobrać dane samodzielnie:
#   source("pobierz_dane.R")   # skrypt pobiera dane z IMGW i zapisuje CSV
#
# Hipoteza badawcza:
#   H0: średnia roczna temperatura w Warszawie = 10°C
#   H1: średnia roczna temperatura w Warszawie ≠ 10°C
#
# =============================================================================

sciezka_danych <- "dane/temperatury_warszawa.csv"

# --- Wczytywanie danych (sep = ";") ---
temperatury <- read.csv(sciezka_danych, sep = ";", header = TRUE)

cat("=== ZADANIE 5A: Test hipotezy – temperatury Warszawy ===\n\n")
cat("Zrodlo: IMGW, stacja", unique(temperatury$stacja), "\n")
cat("Liczba obserwacji:", nrow(temperatury), "\n\n")

# --- Obliczenie średnich rocznych ---
lata <- sort(unique(temperatury$rok))
srednie_roczne <- sapply(lata, function(r) {
  mean(temperatury$srednia_temp_c[temperatury$rok == r])
})

cat("Srednie roczne temperatury (dane IMGW):\n")
for (i in seq_along(lata)) {
  cat(sprintf("  %d: %.2f °C\n", lata[i], srednie_roczne[i]))
}
cat("\n")

# --- Hipoteza i test t-Studenta (jedna próba) ---
mu0 <- 10  # wartość hipotetyczna [°C]

cat("Hipoteza zerowa:       H0: mu = 10 °C\n")
cat("Hipoteza alternatywna: H1: mu != 10 °C\n")
cat("Poziom istotnosci:     alpha = 0.05\n\n")

test <- t.test(srednie_roczne, mu = mu0, alternative = "two.sided")

cat("--- Wyniki testu t-Studenta ---\n")
cat(sprintf("Statystyka t:          %.4f\n", test$statistic))
cat(sprintf("Liczba stopni swobody: %d\n", test$parameter))
cat(sprintf("p-value:               %.4f\n", test$p.value))
cat(sprintf("Srednia probki:        %.4f °C\n", test$estimate))
cat(sprintf("Przedzial ufnosci 95%%: [%.2f ; %.2f]\n\n",
            test$conf.int[1], test$conf.int[2]))

# --- Wnioskowanie ---
alpha <- 0.05
if (test$p.value < alpha) {
  cat(sprintf("Wniosek: ODRZUCAMY H0 (p = %.4f < %.2f).\n", test$p.value, alpha))
  cat("Srednia roczna temperatura istotnie rozni sie od 10°C.\n")
} else {
  cat(sprintf("Wniosek: NIE ODRZUCAMY H0 (p = %.4f >= %.2f).\n", test$p.value, alpha))
  cat("Brak dowodow na roznice sredniej od 10°C.\n")
}

# --- Wykres ---
barplot(srednie_roczne,
        names.arg = lata,
        col = "coral",
        ylab = "Srednia roczna temp. [°C]",
        main = "Srednie roczne temperatury - Warszawa-Okęcie (IMGW)")
abline(h = mu0, col = "red", lty = 2, lwd = 2)
abline(h = mean(srednie_roczne), col = "steelblue", lwd = 2)
legend("topright",
       legend = c(sprintf("H0: mu = %d°C", mu0),
                  sprintf("Srednia = %.1f°C", mean(srednie_roczne))),
       col = c("red", "steelblue"),
       lty = c(2, 1),
       lwd = 2)

cat("\nZadanie 5A zakonczone.\n")
