# Rozdział VIII — Rozkład normalny

## Teoria

$X \sim N(\mu, \sigma^2)$:

$$
Z = \frac{X - \mu}{\sigma} \sim N(0, 1)
$$

### Standardowe kwantyle (z tablic)
| $p$ | $z_p$ |
|-------|---------|
| 0,60 | 0,253 |
| 0,90 | 1,282 |
| 0,95 | 1,645 |
| 0,975 | 1,960 |
| 0,99 | 2,326 |

### Percentyl
„$p\%$ populacji nie przekracza $x$" $\Leftrightarrow P(X \leq x) = p/100$.

---

## Zadanie 1 — Wzrost: $X \sim N(173,\, 6^2)$

### a) Wzrost $> 181$ cm

$$
P(X > 181) = P\left(Z > \frac{181-173}{6}\right) = P(Z > 1{,}33) \approx 0{,}091
$$

### b) Wzrost między 167 a 180 cm

$$
P(167 < X < 180) = P\left(\frac{167-173}{6} < Z < \frac{180-173}{6}\right) = P(-1 < Z < 1{,}17) \approx 0{,}720
$$

### c) Wzrost, którego nie przekracza 60% populacji (minimalny taki)

Szukamy $x$: $P(X \leq x) = 0{,}60$.

$$
x = \mu + z_{0{,}60} \cdot \sigma = 173 + 0{,}253 \cdot 6 \approx 174{,}5\ \text{cm}
$$

---

## Do zapamiętania
1. Zawsze standaryzuj: $Z = (X-\mu)/\sigma$
2. „Nie przekracza 60%" = 60. percentyl = $P(X \leq x) = 0{,}6$
