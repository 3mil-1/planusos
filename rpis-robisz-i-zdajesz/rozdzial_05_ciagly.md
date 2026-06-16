# Rozdział V — Zmienne losowe ciągłe

## Teoria

### Gęstość prawdopodobieństwa (PDF)
Funkcja $f$ jest gęstością, gdy:
1. $f(x) \geq 0$
2. $\displaystyle\int_{-\infty}^{\infty} f(x)\,dx = 1$

### Dystrybuanta (CDF)
$F(t) = P(X \leq t)$. Dla punktu z masą: $P(X = t) = F(t) - F(t^-)$.

### Funkcja charakterystyczna przedziału
$I_{[a,b]}(x) = 1$ gdy $x \in [a,b]$, inaczej $0$.

---

## Zadanie 1 — $f(x) = ax^2 \cdot I_{[0,2]}(x)$

### a) Dla jakich $a$ funkcja jest gęstością?

$$
\int_0^2 ax^2\,dx = a \cdot \frac{8}{3} = 1 \implies a = \frac{3}{8}
$$

$$
a = \dfrac{3}{8}
$$

### b) $P(X \geq 2)$

Zmienna ma nośnik $[0,2]$, więc $P(X \geq 2) = P(X = 2) = 0$ (rozkład ciągły).

$$
0
$$

### c) $P\left(\left|X - \frac{1}{2}\right| \leq 1\right)$

$\left|X - \frac{1}{2}\right| \leq 1 \iff -\frac{1}{2} \leq X \leq \frac{3}{2}$. Na nośniku $[0,2]$: $X \in [0, \frac{3}{2}]$.

$$
P = \int_0^{\frac{3}{2}} \frac{3}{8}x^2\,dx = \frac{3}{8} \cdot \frac{(\frac{3}{2})^3}{3} = \frac{1}{8} \cdot \frac{27}{8} = \dfrac{27}{64}
$$

---

## Zadanie 2 — Dystrybuanta

$$
F(t) = \begin{cases}
0 & t < 0 \\
0{,}1 + t & 0 \leq t < 0{,}5 \\
0{,}4 + t & 0{,}5 \leq t < 0{,}55 \\
1 & t \geq 0{,}55
\end{cases}
$$

**Skoki (masy punktowe):**
- przy $t = 0$: skok $0{,}1$
- przy $t = 0{,}5$: skok $0{,}9 - 0{,}6 = 0{,}3$
- przy $t = 0{,}55$: skok $1 - 0{,}95 = 0{,}05$

### a) $P\left(X = \frac{1}{2}\right)$

$$
0{,}3
$$

### b) $P\left(X \in \left[0, \frac{1}{2}\right]\right)$

$$
F(\frac{1}{2}) = 0{,}4 + 0{,}5 = 0{,}9
$$

### c) $P(X \in (0;\, 0{,}55))$

$$
F(0{,}55^-) - F(0) = 0{,}95 - 0{,}1 = 0{,}85
$$

---

## Do zapamiętania
- Ciągły: $P(X = a) = 0$; dyskretny/mieszany: $P(X=a) = \text{skok dystrybuanty}$
- Szukając $a$: całka gęstości $= 1$
