# Rozdział X — Niezależność i rozkłady warunkowe

## Teoria

### Niezależność
\[
P(X=x,\, Y=y) = P(X=x) \cdot P(Y=y)
\]

### Rozkład warunkowy
\[
P(X=x|Y=y) = \frac{P(X=x,\, Y=y)}{P(Y=y)}
\]

### min i max
\[
\min(X,Y) + \max(X,Y) = X + Y \quad \text{(zawsze!)}
\]

### Jednostajny na trójkącie \(\{0 \leq x \leq y \leq 1\}\)
Pole \(= \frac{1}{2}\), więc \(f(x,y) = 2\).

---

## Zadanie 1 — \(X\), \(Y\) niezależne; \(Z = \min(X,Y)\), \(U = \max(X,Y)\)

\(P(X=1) = \frac{1}{3}\), \(P(X=5) = \frac{2}{3}\); \(P(Y=0) = P(Y=2) = \frac{1}{2}\).

### a) Nośnik \(Z\) (wartości z dodatnim prawdopodobieństwem)

| \((X,Y)\) | \(Z\) | \(P\) |
|-----------|-------|-------|
| (1,0) | 0 | 1/6 |
| (1,2) | 1 | 1/6 |
| (5,0) | 0 | 1/3 |
| (5,2) | 2 | 1/3 |

\[
\boxed{Z \in \{0,\, 1,\, 2\}}
\]

### b) \(P(U < 5)\)

\(\max(X,Y) < 5\) wymaga \(X = 1\) (bo \(X=5\) daje max \(\geq 5\)):
\[
P(U < 5) = P(X=1) = \boxed{\dfrac{1}{3}}
\]

### c) \(E(Z + U)\)

Klucz: \(Z + U = X + Y\) zawsze!
\[
E(X) = 1\cdot\frac{1}{3} + 5\cdot\frac{2}{3} = \frac{11}{3}, \quad E(Y) = 1
\]
\[
E(Z+U) = E(X) + E(Y) = \boxed{\dfrac{14}{3}}
\]

---

## Zadanie 2 — Jednostajny na \(\Delta = \{0 \leq x \leq y \leq 1\}\)

### a) \(E(Y)\)
\[
E(Y) = \int_0^1 \int_x^1 2y\,dy\,dx = \int_0^1 (1-x^2)\,dx = \boxed{\dfrac{2}{3}}
\]

### b) Gęstość \(f_{X|Y}(x|y)\)

Dla \(y \in (0,1)\): \(f_Y(y) = \int_0^y 2\,dx = 2y\).

\[
f_{X|Y}(x|y) = \frac{2}{2y} = \boxed{\dfrac{1}{y}, \quad 0 < x < y}
\]

(czyli \(X|Y=y \sim U(0,y)\))

### c) \(P\left(X \leq \frac{1}{4} \,\middle|\, Y = \frac{1}{2}\right)\)

\[
P = \int_0^{1/4} \frac{1}{1/2}\,dx = 2 \cdot \frac{1}{4} = \boxed{\dfrac{1}{2}}
\]

---

## Zadanie 3 — Tabela z brakującą wartością

|       | \(-1\) | \(0\) | \(1\) |
|-------|--------|-------|-------|
| \(0\) | 1/4    | 1/4   | 1/4   |
| \(1\) | 1/8    | **?** | 1/8   |

### a) Brakująca wartość
\[
1 - \frac{1}{4} - \frac{1}{4} - \frac{1}{4} - \frac{1}{8} - \frac{1}{8} = \boxed{0}
\]

### b) \(P(X = 0 \mid Y = 0)\)
\[
P(Y=0) = \frac{1}{4} + 0 = \frac{1}{4}, \quad P(X=0, Y=0) = \frac{1}{4}
\]
\[
\boxed{P(X=0|Y=0) = 1}
\]

### c) \(P(X = 0 \mid X + Y = 0)\)

\(X+Y=0\): pary \((0,0)\) z \(P=\frac{1}{4}\) i \((1,-1)\) z \(P=\frac{1}{8}\).
\[
P(X=0|X+Y=0) = \frac{1/4}{1/4 + 1/8} = \frac{1/4}{3/8} = \boxed{\dfrac{2}{3}}
\]

---

## Do zapamiętania
- \(\min + \max = X + Y\) — oszczędza dużo pracy
- Rozkład warunkowy: podziel przez prawdopodobieństwo „warunku"
