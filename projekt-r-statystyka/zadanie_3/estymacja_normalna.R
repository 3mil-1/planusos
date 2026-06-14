# =============================================================================
# ZADANIE NA OCENĘ 3
# Estymacja parametrów rozkładu normalnego
# =============================================================================
#
# Cel: wygenerować dane z rozkładu normalnego i oszacować średnią oraz
#      odchylenie standardowe (estymatory punktowe).
#
# =============================================================================

set.seed(42)

# --- Parametry populacji (znane teoretycznie) ---
mu_populacji    <- 100   # prawdziwa średnia
sigma_populacji <- 15    # prawdziwe odchylenie standardowe
n               <- 50    # wielkość próby

# --- Generowanie danych z rozkładu normalnego ---
dane <- rnorm(n = n, mean = mu_populacji, sd = sigma_populacji)

cat("=== ZADANIE 3: Estymacja z rozkładu normalnego ===\n\n")
cat("Parametry populacji:\n")
cat(sprintf("  mu    = %.2f\n", mu_populacji))
cat(sprintf("  sigma = %.2f\n", sigma_populacji))
cat(sprintf("  n     = %d\n\n", n))

# --- Estymatory punktowe ---
srednia_probki <- mean(dane)
sd_probki      <- sd(dane)
wariancja_probki <- var(dane)

cat("Estymatory z próby:\n")
cat(sprintf("  Srednia probki (x-bar)     = %.4f\n", srednia_probki))
cat(sprintf("  Odchylenie std (s)         = %.4f\n", sd_probki))
cat(sprintf("  Wariancja probki (s^2)     = %.4f\n\n", wariancja_probki))

# --- Porównanie z wartościami populacyjnymi ---
cat("Porownanie estymatorow z parametrami populacji:\n")
cat(sprintf("  Blad sredniej:  %.4f\n", srednia_probki - mu_populacji))
cat(sprintf("  Blad odchylenia: %.4f\n\n", sd_probki - sigma_populacji))

# --- Wizualizacja ---
hist(dane,
     breaks = 15,
     col = "steelblue",
     border = "white",
     main = "Histogram danych z N(100, 15^2)",
     xlab = "Wartosc")
abline(v = mu_populacji, col = "red", lwd = 2, lty = 2)
abline(v = srednia_probki, col = "darkgreen", lwd = 2)
legend("topright",
       legend = c("Mu populacji", "Srednia probki"),
       col = c("red", "darkgreen"),
       lty = c(2, 1),
       lwd = 2)

cat("Wykres histogramu wygenerowany.\n")
cat("Zadanie 3 zakonczone.\n")
