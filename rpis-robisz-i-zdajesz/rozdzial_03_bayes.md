# Rozdział III — Prawdopodobieństwo całkowite i wzór Bayesa

## Teoria

### Prawdopodobieństwo całkowite
Jeśli $H_1, H_2, \ldots$ tworzą układ zdarzeń:

$$
P(A) = \sum_i P(A|H_i) \cdot P(H_i)
$$

### Wzór Bayesa

$$
P(H_i|A) = \frac{P(A|H_i) \cdot P(H_i)}{P(A)}
$$

---

## Dane zadania

| Kraj | Udział | Wadliwość |
|------|--------|-----------|
| Chiny | 67% | 5% |
| Tajwan | 16% | 3% |
| Filipiny | 17% | 2% |

---

## Zadanie 1

### a) Losowy telewizor **nie ma** wad

$$
P(\text{sprawny}) = 0{,}67 \cdot 0{,}95 + 0{,}16 \cdot 0{,}97 + 0{,}17 \cdot 0{,}98
$$

$$
= 0{,}6365 + 0{,}1552 + 0{,}1666 = 0{,}9583
$$

### b) Z Chin **i** sprawny

$$
P(\text{Chiny} \cap \text{sprawny}) = 0{,}67 \cdot 0{,}95 = 0{,}6365
$$

### c) Wyprodukowany w Chinach, **jeśli** ma wadę (Bayes)

$$
P(\text{Chiny}|\text{wada}) = \frac{0{,}67 \cdot 0{,}05}{1 - 0{,}9583} = \frac{0{,}0335}{0{,}0417} \approx 0{,}8034
$$

**Interpretacja:** Choć tylko 67% telewizorów jest z Chin, wśród wadliwych aż ~80% pochodzi z Chin (bo mają najwyższą wadliwość).

---

## Do zapamiętania
1. Najpierw policz $P(A)$ wzorem na prawdopodobieństwo całkowite
2. Potem Bayes: $P(H|A) = \dfrac{P(A|H)P(H)}{P(A)}$
