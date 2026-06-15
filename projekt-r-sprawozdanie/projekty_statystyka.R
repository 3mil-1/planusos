# Projekt RPiS - analiza danych discoveries (1860-1959)
# Zbiór wbudowany w pakiecie datasets

dane <- data.frame(
  Rok = 1860:1959,
  Liczba_Odkryc = as.numeric(discoveries)
)
write.csv2(dane, file = "do_projektu.csv", row.names = FALSE)

dane_projektowe <- read.csv("do_projektu.csv", sep = ";", dec = ",")
wynalazki <- dane_projektowe$Liczba_Odkryc
n <- length(wynalazki)

# --- Problem 1: estymacja lambda i test zgodnosci z Poissonem ---
lambda_est <- mean(wynalazki)
poziom_ufnosci <- 0.95
z_kwantyl <- qnorm(1 - ((1 - poziom_ufnosci) / 2))
blad_std <- sqrt(lambda_est / n)
dolna_granica <- lambda_est - z_kwantyl * blad_std
gorna_granica <- lambda_est + z_kwantyl * blad_std

cat("Estymacja lambda:", lambda_est, "\n")
cat("95% przedzial ufnosci: [", dolna_granica, ",", gorna_granica, "]\n")

obserwowane <- c(
  sum(wynalazki == 0), sum(wynalazki == 1), sum(wynalazki == 2),
  sum(wynalazki == 3), sum(wynalazki == 4), sum(wynalazki == 5),
  sum(wynalazki >= 6)
)

P <- dpois(0:5, lambda = lambda_est)
P[7] <- 1 - sum(P)

test_chi <- chisq.test(x = obserwowane, p = P)
print(test_chi)

# --- Problem 2: porownanie dwoch polow okresu 1860-1959 ---
# Uwaga: to nie sa dokladnie wieki XIX i XX, tylko rowne 50-letnie okresy.
okres_1 <- wynalazki[1:50]   # 1860-1909
okres_2 <- wynalazki[51:100] # 1910-1959

n1 <- length(okres_1)
n2 <- length(okres_2)
srednia_1 <- mean(okres_1)
srednia_2 <- mean(okres_2)
odchylenie_1 <- sd(okres_1)
odchylenie_2 <- sd(okres_2)

cat("Srednia 1860-1909:", srednia_1, " (sd =", odchylenie_1, ")\n")
cat("Srednia 1910-1959:", srednia_2, " (sd =", odchylenie_2, ")\n")

test_porownawczy <- t.test(
  x = okres_1, y = okres_2,
  alternative = "two.sided",
  conf.level = 0.95
)
print(test_porownawczy)
