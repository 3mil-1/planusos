# =============================================================================
# ZADANIE 4B – Estymacja wartości oczekiwanej z danych empirycznych
# =============================================================================
#
# Cel: wczytać dane z pliku CSV, oszacować wartość oczekiwaną (średnią)
#      oraz przedział ufności. Demonstracja read.csv() z parametrem sep.
#
# Źródło danych: plik lokalny (symulacja danych pogodowych)
#
# =============================================================================

# Ustaw katalog roboczy na folder projektu (dostosuj ścieżkę jeśli potrzeba)
# setwd("sciezka/do/projekt-r-statystyka")

sciezka_danych <- "dane/temperatury_warszawa.csv"

# --- Wczytywanie danych: sep = ";" (separator średnikowy) ---
temperatury <- read.csv(sciezka_danych, sep = ";", header = TRUE)

cat("=== ZADANIE 4B: Estymacja wartosci oczekiwanej ===\n\n")

cat("Pierwsze wiersze danych:\n")
print(head(temperatury))
cat("\n")

# --- Podstawowe statystyki ---
n <- nrow(temperatury)
srednia_temp <- mean(temperatury$srednia_temp_c)
sd_temp      <- sd(temperatury$srednia_temp_c)
se_temp      <- sd_temp / sqrt(n)

cat(sprintf("Liczba obserwacji:        %d\n", n))
cat(sprintf("Srednia temperatura:      %.2f °C\n", srednia_temp))
cat(sprintf("Odchylenie standardowe:   %.2f °C\n", sd_temp))
cat(sprintf("Blad standardowy:         %.2f °C\n\n", se_temp))

# --- Przedział ufności 95% ---
poziom_ufnosci <- 0.95
test_t <- t.test(temperatury$srednia_temp_c, conf.level = poziom_ufnosci)

cat(sprintf("Estymacja wartosci oczekiwanej (srednia): %.2f °C\n", srednia_temp))
cat(sprintf("Przedzial ufnosci 95%%: [%.2f ; %.2f] °C\n\n",
            test_t$conf.int[1], test_t$conf.int[2]))

# --- Wizualizacja szeregu czasowego ---
daty <- paste(temperatury$rok, sprintf("%02d", temperatury$miesiac), sep = "-")

plot(temperatury$srednia_temp_c,
     type = "b",
     col = "tomato",
     pch = 19,
     xlab = "Indeks miesiaca",
     ylab = "Srednia temp. [°C]",
     main = "Miesieczne srednie temperatury - Warszawa")
abline(h = srednia_temp, col = "steelblue", lty = 2, lwd = 2)
legend("topright",
       legend = c("Temperatura", sprintf("Srednia = %.1f°C", srednia_temp)),
       col = c("tomato", "steelblue"),
       lty = c(1, 2),
       pch = c(19, NA))

cat("Zadanie 4B zakonczone.\n")
