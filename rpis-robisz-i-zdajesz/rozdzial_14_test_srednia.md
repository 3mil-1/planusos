# Rozdział XIV — Test dla średniej (znane \(\sigma^2\))

## Teoria

Gdy \(\sigma^2\) jest **znane** i populacja normalna:
\[
U = \sqrt{n} \cdot \frac{\bar{x} - \mu_0}{\sigma} \sim N(0,1) \quad \text{pod } H_0
\]

### Test dwustronny na poziomie \(\alpha\)
Odrzucamy \(H_0\), gdy \(|U| > u_{1-\alpha/2}\).

Dla \(\alpha = 0{,}05\): \(u_{0{,}975} = 1{,}96\).

---

## Zadanie — 5 pomiarów

Dane: 862, 870, 876, 866, 871  
\(n = 5\), \(\sigma^2 = 25\) (więc \(\sigma = 5\)), \(\mu_0 = 870\), \(\alpha = 0{,}05\).

### Średnia próbkowa
\[
\bar{x} = \frac{862 + 870 + 876 + 866 + 871}{5} = \frac{4345}{5} = 869
\]

### a) Wartość statystyki testowej \(U\)

\[
U = \sqrt{5} \cdot \frac{869 - 870}{5} = \frac{-\sqrt{5}}{5} \approx \boxed{-0{,}45}
\]

### b) Wnioski

Obszar krytyczny: \(|U| > 1{,}96\).

\[
|-0{,}45| = 0{,}45 < 1{,}96
\]

\[
\boxed{\text{Nie odrzucamy } H_0 \text{ — dane nie przeczą hipotezie, że } \mu = 870}
\]

### c) Rozkład \(U\) gdy \(H_0\) prawdziwa

\[
\boxed{U \sim N(0,\, 1)}
\]

---

## Do zapamiętania
| Sytuacja | Statystyka | Rozkład |
|----------|------------|---------|
| \(\sigma\) znane | \(U = \sqrt{n}(\bar{x}-\mu_0)/\sigma\) | \(N(0,1)\) |
| \(\sigma\) nieznane | \(t = \sqrt{n-1}(\bar{x}-\mu_0)/s\) | \(t_{n-1}\) |

Różnica między rozdz. XIII a XIV: tam \(s\) z próby (test \(t\)), tu \(\sigma = 5\) znane (test \(z\)).
