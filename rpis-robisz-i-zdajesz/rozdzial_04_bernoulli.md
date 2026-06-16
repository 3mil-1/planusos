# Rozdział IV — Zdarzenia niezależne i schemat Bernoulliego

## Teoria

### Zdarzenia niezależne (\(A_1,\ldots,A_n\), każde z prawd. \(p\))
- Żadne nie wystąpi: \((1-p)^n\)
- Dokładnie jedno: \(n \cdot p \cdot (1-p)^{n-1}\)
- Co najmniej jedno: \(1 - (1-p)^n\)

### Schemat Bernoulliego
\(n\) niezależnych prób, prawdopodobieństwo sukcesu \(p\):
\[
P(\text{dokładnie } k \text{ sukcesów}) = \binom{n}{k} p^k (1-p)^{n-k}
\]

---

## Zadanie 1 — \(n\) niezależnych zdarzeń, \(P(A_i) = p\)

### a) Żadne nie zachodzi
\[
\boxed{(1-p)^n}
\]

### b) Dokładnie jedno
\[
\boxed{n \cdot p \cdot (1-p)^{n-1}}
\]

### c) Co najmniej jedno
\[
\boxed{1 - (1-p)^n}
\]

---

## Zadanie 2 — 10 rzutów kostką

### a) Dokładnie trzy razy piątka
\[
P = \binom{10}{3}\left(\frac{1}{6}\right)^3\left(\frac{5}{6}\right)^7 \approx \boxed{0{,}155}
\]

### b) Co najmniej raz szóstka
\[
P = 1 - \left(\frac{5}{6}\right)^{10} \approx \boxed{0{,}8385}
\]

### c) Co najwyżej dwa razy dwójka
\[
P = \left(\frac{4}{6}\right)^{10} + \binom{10}{1}\frac{1}{6}\left(\frac{5}{6}\right)^9 + \binom{10}{2}\left(\frac{1}{6}\right)^2\left(\frac{5}{6}\right)^8 \approx \boxed{0{,}6311}
\]

---

## Do zapamiętania
- „Co najmniej jeden" → \(1 - P(\text{żaden})\)
- „Co najwyżej \(k\)" → sumuj \(P(0) + P(1) + \ldots + P(k)\)
