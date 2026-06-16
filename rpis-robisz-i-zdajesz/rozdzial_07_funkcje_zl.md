# Rozdział VII — Funkcje zmiennych losowych

## Teoria

Jeśli $Y = g(X)$:
- Dyskretna: $P(Y = y) = P(g(X) = y)$
- $E(Y) = E(g(X))$

### Rozkład wykładniczy $\mathrm{Exp}(\lambda)$
- $E(T) = 1/\lambda$, gęstość: $f(t) = \lambda e^{-\lambda t}$ dla $t > 0$
- $P(T > t) = e^{-\lambda t}$

### Cenzurowanie
$Y = \min(T, c)$: z prawdopodobieństwem $P(T \geq c)$ mamy $Y = c$, w przeciwnym razie $Y = T$.

---

## Zadanie 1 — $X \sim U(0,1)$, $Y = I_{(\frac{1}{2},\,1)}(X)$

$Y = 1$ gdy $X \in (\frac{1}{2}, 1]$, inaczej $Y = 0$.

### a) $P(Y = 1)$

$$
\dfrac{1}{2}
$$

### b) $P(Y \leq 0)$
$Y \leq 0$ tylko gdy $Y = 0$:

$$
\dfrac{1}{2}
$$

### c) $\mathrm{Var}(Y)$
$Y \in \{0, 1\}$, $E(Y) = \frac{1}{2}$, $Y^2 = Y$:

$$
\mathrm{Var}(Y) = \frac{1}{2} - \frac{1}{4} = \dfrac{1}{4}
$$

---

## Zadanie 2 — Eksperyment toksykologiczny

Czas do śmierci $T \sim \mathrm{Exp}(\lambda)$, $\lambda = \frac{1}{10}$ (średnia 10 h).  
Zwierzę uśpiane po 24 h, jeśli nie umarło wcześniej: $Y = \min(T, 24)$.

Rozkład mieszany: $P^Y = p\,\delta_a + f \cdot \mathcal{L}$

### a) $p = P(Y = 24)$

$$
p = P(T \geq 24) = e^{-\frac{24}{10}} = e^{-2{,}4} \approx 0{,}091
$$

### b) $a$

$$
a = 24
$$

### c) Gęstość $f$
Na $(0, 24)$ zwierzę umiera naturalnie, więc gęstość to gęstość wykładniczej:

$$
f(y) = \dfrac{1}{10}\,e^{-y/10}, \quad y \in (0, 24)
$$

---

## Do zapamiętania
- Funkcja indicator: zamienia zmienną ciągłą na zero-jedynkową
- Cenzurowanie → masa punktowa na progu + ciągła część poniżej
