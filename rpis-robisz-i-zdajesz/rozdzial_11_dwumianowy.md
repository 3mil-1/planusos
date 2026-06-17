# Rozdział XI — Rozkład dwumianowy i aproksymacja normalna

## Teoria

### Rozkład dwumianowy
$X \sim \mathrm{Bin}(n, p)$:

$$
E(X) = np, \qquad \mathrm{Var}(X) = np(1-p), \qquad \sigma = \sqrt{np(1-p)}
$$

### Aproksymacja normalna (de Moivre–Laplace)
Dla dużego $n$:

$$
P(X \leq k) \approx \Phi\!\left(\frac{k + 0{,}5 - np}{\sigma}\right)
$$

**Korekta ciągłości:** do $k$ dodajemy $0{,}5$.

---

## Zadanie — Rekrutacja WEAIIiB

- 400 kandydatów ($n = 400$)
- Prawdopodobieństwo zdania: $p = 0{,}3$
- Limit miejsc: 130

$X$ = liczba zdających. $X \sim \mathrm{Bin}(400,\, 0{,}3)$.

$$
\mu = 120, \quad \sigma = \sqrt{400 \cdot 0{,}3 \cdot 0{,}7} = \sqrt{84} \approx 9{,}17
$$

### a) Prawdopodobieństwo nadmiaru (> 130 zdających)

$$
P(X > 130) \approx P\!\left(Z > \frac{130{,}5 - 120}{9{,}17}\right) = P(Z > 1{,}14) \approx 0{,}126
$$

### b) Jakie $p$ przy 130 miejscach da nadmiar z $P = 0{,}01$?

Szukamy $p$: $P(X > 130) = 0{,}01$, czyli 99. percentyl $= 130{,}5$.

$$
400p + 2{,}326 \cdot \sqrt{400p(1-p)} = 130{,}5
$$

Rozwiązanie numeryczne:

$$
p \approx 0{,}274
$$

### c) Ile miejsc przygotować ($n_{\mathrm{limit}}$), żeby $P(\text{nadmiar}) = 0{,}01$?

Przy $p = 0{,}3$, $n = 400$: 99. percentyl:

$$
n_{\mathrm{limit}} = \mu + z_{0{,}99} \cdot \sigma - 0{,}5 = 120 + 2{,}326 \cdot 9{,}17 - 0{,}5 \approx 141
$$

---

## Do zapamiętania
- „Nadmiar" = $P(X > \text{limit})$
- Zawsze korekta ciągłości $\pm 0{,}5$
- $z_{0{,}99} \approx 2{,}326$, $z_{0{,}975} \approx 1{,}96$
