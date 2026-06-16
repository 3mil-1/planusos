# Rozdział IX — Wektory losowe

## Teoria

### Gęstość dwuwymiarowa
\[
\iint f(x,y)\,dx\,dy = 1
\]

### Prawdopodobieństwo zdarzenia
\[
P((X,Y) \in D) = \iint_D f(x,y)\,dx\,dy
\]

### Dystrybuanta brzegowa
\[
F_X(t) = P(X \leq t) = \int_{-\infty}^{\infty} \int_{-\infty}^{t} f(x,y)\,dx\,dy
\]

### Dyskretna — wariancja sumy
\[
\mathrm{Var}(X+Y) = E[(X+Y)^2] - [E(X+Y)]^2
\]

---

## Zadanie 1 — \(f(x,y) = A\) na trójkącie \(0 \leq x,\, 0 \leq y,\, x+y \leq 1\)

Obszar to trójkąt o polu \(\frac{1}{2}\).

### a) Stała \(A\)
\[
A \cdot \frac{1}{2} = 1 \implies \boxed{A = 2}
\]

### b) \(P(2X > 3Y)\)

Na trójkącie: \(2x > 3y \iff y < \frac{2}{3}x\).

Dzielimy na dwa przedziały \(x\):
- \(x \in [0, \frac{3}{5}]\): górna granica \(y = \frac{2}{3}x\)
- \(x \in [\frac{3}{5}, 1]\): górna granica \(y = 1 - x\)

\[
P = 2\left[\int_0^{3/5} \frac{2}{3}x\,dx + \int_{3/5}^{1}(1-x)\,dx\right] = \frac{6}{25} + \frac{4}{25} = \boxed{\dfrac{2}{5}}
\]

### c) \(F_X\left(\frac{1}{4}\right)\)

Brzegowa gęstość: dla \(t \in [0,1]\):
\[
F_X(t) = \int_0^t 2(1-x)\,dx = 2t - t^2
\]
\[
F_X(1/4) = \frac{1}{2} - \frac{1}{16} = \boxed{\dfrac{7}{16}}
\]

---

## Zadanie 2 — Tabela rozkładu łącznego

|       | \(Y=-1\) | \(Y=0\) | \(Y=2\) |
|-------|----------|---------|---------|
| \(X=0\) | 1/4    | 1/4     | 0       |
| \(X=1\) | 1/6    | 1/6     | 1/6     |

### a) \(\mathrm{Var}(X)\)
\[
P(X=0) = P(X=1) = \frac{1}{2}, \quad E(X) = \frac{1}{2}, \quad E(X^2) = \frac{1}{2}
\]
\[
\mathrm{Var}(X) = \frac{1}{2} - \frac{1}{4} = \boxed{\dfrac{1}{4}}
\]

### b) \(\mathrm{Var}(X + Y)\)

Rozkład \(X+Y\): \(-1 \to \frac{1}{4}\); \(0 \to \frac{5}{12}\); \(1 \to \frac{1}{6}\); \(3 \to \frac{1}{6}\).

\[
E(X+Y) = \frac{5}{12}, \quad E[(X+Y)^2] = \frac{23}{12}
\]
\[
\mathrm{Var}(X+Y) = \frac{23}{12} - \frac{25}{144} = \boxed{\dfrac{251}{144} \approx 1{,}74}
\]

### c) \(E(|X - Y|)\)

| \((X,Y)\) | \(\|X-Y\|\) | \(P\) |
|-----------|-------------|-------|
| (0,-1) | 1 | 1/4 |
| (0,0) | 0 | 1/4 |
| (1,-1) | 2 | 1/6 |
| (1,0) | 1 | 1/6 |
| (1,2) | 1 | 1/6 |

\[
E(|X-Y|) = \frac{1}{4} + \frac{4}{6} = \boxed{\dfrac{11}{12}}
\]

---

## Do zapamiętania
- Trójkąt \(x+y \leq 1\) w I ćwiartce ma pole \(\frac{1}{2}\)
- Dla \(\mathrm{Var}(X+Y)\) z tabeli: najpierw rozkład \(X+Y\), potem \(E\) i \(E\) kwadratu
