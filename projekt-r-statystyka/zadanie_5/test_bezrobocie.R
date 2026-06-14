# =============================================================================
# ZADANIE 5B – Testowanie hipotez na danych historycznych (bezrobocie)
# =============================================================================
#
# Źródło danych:
#   Plik: dane/bezrobocie_polska.csv
#   Opracowanie: GUS (Główny Urząd Statystyczny) – stopa bezrobocia
#   rejestrowanego w Polsce, dane kwartalne.
#   Oryginalne dane: https://stat.gov.pl/
#   Bank Danych Lokalnych: https://bdl.stat.gov.pl/
#   (w projekcie: lata 2018–2023, format CSV z przecinkiem)
#
# Hipoteza badawcza:
#   H0: średnia stopa bezrobocia przed pandemią (2018–2019) =
#       średnia stopa bezrobocia po pandemii (2021–2023)
#   H1: średnie się różnią (test dwóch prób niezależnych)
#
# =============================================================================

sciezka_danych <- "dane/bezrobocie_polska.csv"

# --- Wczytywanie danych (sep = "," – domyślny, podajemy jawnie) ---
bezrobocie <- read.csv(sciezka_danych, sep = ",", header = TRUE)

cat("=== ZADANIE 5B: Test hipotezy – bezrobocie w Polsce ===\n\n")

cat("Dane:\n")
print(bezrobocie)
cat("\n")

# --- Podział na okresy ---
przed <- bezrobocie$stopa_bezrobocia_proc[bezrobocie$rok <= 2019]
po    <- bezrobocie$stopa_bezrobocia_proc[bezrobocie$rok >= 2021]

cat(sprintf("Okres 2018-2019 (przed): n = %d, srednia = %.2f%%\n",
            length(przed), mean(przed)))
cat(sprintf("Okres 2021-2023 (po):    n = %d, srednia = %.2f%%\n\n",
            length(po), mean(po)))

# --- Hipotezy ---
cat("Hipoteza zerowa:       H0: mu_przed = mu_po\n")
cat("Hipoteza alternatywna: H1: mu_przed != mu_po\n")
cat("Poziom istotnosci:     alpha = 0.05\n\n")

# --- Test t dla dwóch prób niezależnych ---
test <- t.test(przed, po, alternative = "two.sided", var.equal = FALSE)

cat("--- Wyniki testu t-Studenta (dwie próby) ---\n")
cat(sprintf("Statystyka t:  %.4f\n", test$statistic))
cat(sprintf("Liczba stopni swobody: %.1f\n", test$parameter))
cat(sprintf("p-value:       %.4f\n", test$p.value))
cat(sprintf("Srednia przed: %.4f%%\n", test$estimate[1]))
cat(sprintf("Srednia po:    %.4f%%\n", test$estimate[2]))
cat(sprintf("Roznica srednich: %.4f%%\n\n", diff(test$estimate)))

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
        ylab = "Stopa bezrobocia [%]",
        main = "Porownanie stopy bezrobocia: przed vs po pandemii")
points(1, mean(przed), pch = 18, cex = 2, col = "darkblue")
points(2, mean(po), pch = 18, cex = 2, col = "darkred")

cat("\nZadanie 5B zakonczone.\n")
