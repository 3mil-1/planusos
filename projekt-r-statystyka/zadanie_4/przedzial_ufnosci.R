# =============================================================================
# ZADANIE 4A – Przedział ufności dla średniej
# =============================================================================
#
# Cel: oszacować średnią populacji i zbudować przedział ufności 95%.
#      Dane generowane z rozkładu normalnego.
#
# =============================================================================

set.seed(123)

mu_populacji    <- 50
sigma_populacji <- 8
n               <- 30
poziom_ufnosci  <- 0.95

dane <- rnorm(n = n, mean = mu_populacji, sd = sigma_populacji)

cat("=== ZADANIE 4A: Przedzial ufnosci dla sredniej ===\n\n")

# --- Estymacja punktowa ---
x_bar <- mean(dane)
s     <- sd(dane)
se    <- s / sqrt(n)

cat(sprintf("Srednia probki:           %.4f\n", x_bar))
cat(sprintf("Odchylenie standardowe:   %.4f\n", s))
cat(sprintf("Blad standardowy (SE):    %.4f\n\n", se))

# --- Przedział ufności (metoda klasyczna, rozkład t-Studenta) ---
alpha <- 1 - poziom_ufnosci
t_krytyczna <- qt(1 - alpha / 2, df = n - 1)

dolna_granica <- x_bar - t_krytyczna * se
gorna_granica <- x_bar + t_krytyczna * se

cat(sprintf("Poziom ufnosci: %.0f%%\n", poziom_ufnosci * 100))
cat(sprintf("t krytyczne (df = %d): %.4f\n", n - 1, t_krytyczna))
cat(sprintf("Przedzial ufnosci: [%.4f ; %.4f]\n\n", dolna_granica, gorna_granica))

# --- Wbudowana funkcja R ---
ci_wbudowany <- t.test(dane, conf.level = poziom_ufnosci)
cat("Weryfikacja funkcja t.test():\n")
print(ci_wbudowany$conf.int)

# --- Wizualizacja ---
plot(1, type = "n", xlim = c(0.5, 1.5), ylim = range(c(dolna_granica, gorna_granica, mu_populacji)),
     xlab = "", ylab = "Wartosc", main = "Przedzial ufnosci 95% dla sredniej",
     xaxt = "n")
segments(1, dolna_granica, 1, gorna_granica, lwd = 3, col = "steelblue")
points(1, x_bar, pch = 19, col = "steelblue", cex = 1.5)
abline(h = mu_populacji, col = "red", lty = 2, lwd = 2)
legend("topright",
       legend = c("Przedzial ufnosci", "Srednia probki", "Mu populacji"),
       col = c("steelblue", "steelblue", "red"),
       lty = c(1, NA, 2),
       pch = c(NA, 19, NA))

cat("\nZadanie 4A zakonczone.\n")
