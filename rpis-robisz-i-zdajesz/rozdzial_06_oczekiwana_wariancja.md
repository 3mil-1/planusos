# Rozdział VI — Wartość oczekiwana i wariancja

## Teoria

### Dyskretna

$$
E(X) = \sum x_i p_i, \qquad \mathrm{Var}(X) = E(X^2) - [E(X)]^2
$$

### Ciągła

$$
E(X) = \int x f(x)\,dx, \qquad E(g(X)) = \int g(x) f(x)\,dx
$$

### Suma nieskorelowanych zmiennych

$$
\mathrm{Var}(X + Y) = \mathrm{Var}(X) + \mathrm{Var}(Y)
$$

---

## Zadanie 1

$X \sim \{(-1,\;\frac{1}{2}),\;(1,\;\frac{1}{2})\}$,  
$Y \sim \{(-2,\;\frac{1}{4}),\;(0,\;\frac{2}{4}),\;(2,\;\frac{1}{4})\}$.

### a) $E(X)$

$$
E(X) = (-1)\cdot\frac{1}{2} + 1\cdot\frac{1}{2} = 0
$$

### b) $\mathrm{Var}(Y)$

$$
E(Y) = -2\cdot\frac{1}{4} + 2\cdot\frac{1}{4} = 0
$$

$$
E(Y^2) = 4\cdot\frac{1}{4} + 4\cdot\frac{1}{4} = 2
$$

$$
\mathrm{Var}(Y) = 2 - 0 = 2
$$

### c) $\mathrm{Var}(X + Y)$ przy nieskorelowaniu

$$
\mathrm{Var}(X) = E(X^2) = 1, \qquad \mathrm{Var}(X+Y) = 1 + 2 = 3
$$

---

## Zadanie 2 — Gęstość

$$
f(x) = \begin{cases}
0{,}5 & -1 \leq x \leq 0 \\
1 - x & 0 < x \leq 1 \\
0 & \text{inaczej}
\end{cases}
$$

### a) $E(X)$

$$
E(X) = \int_{-1}^{0} 0{,}5x\,dx + \int_0^1 x(1-x)\,dx = -\frac{1}{4} + \frac{1}{6} = -\dfrac{1}{12}
$$

### b) $\mathrm{Var}(X)$

$$
E(X^2) = \int_{-1}^{0} 0{,}5x^2\,dx + \int_0^1 x^2(1-x)\,dx = \frac{1}{6} + \frac{1}{12} = \frac{1}{4}
$$

$$
\mathrm{Var}(X) = \frac{1}{4} - \left(-\frac{1}{12}\right)^2 = \frac{1}{4} - \frac{1}{144} = \dfrac{35}{144}
$$

### c) $E(e^{X-2})$

$$
E(e^{X-2}) = e^{-2} E(e^X)
$$

$$
E(e^X) = \int_{-1}^{0} 0{,}5e^x\,dx + \int_0^1 (1-x)e^x\,dx = 0{,}5(1 - e^{-1}) + (e - 2)
$$

$$
E(e^{X-2}) = e^{-2}\left(e - \frac{3}{2} - \frac{1}{2e}\right) \approx 0{,}050
$$

---

## Do zapamiętania
- Zawsze najpierw $E(X)$, potem $E(X^2)$, na końcu różnica
- $E(g(X))$ — podstaw $g(x)$ pod całkę / do sumy
