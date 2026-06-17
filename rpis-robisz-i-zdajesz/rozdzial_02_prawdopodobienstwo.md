# Rozdział II — Prawdopodobieństwo klasyczne

## Teoria

### Wzory na zdarzenia
- $P(A \setminus B) = P(A) - P(A \cap B)$
- $P(A \cup B) = P(A) + P(B) - P(A \cap B)$
- $P(A \cup B) = P(A) + P(B)$ **tylko gdy** $A \cap B = \emptyset$ (zdarzenia rozłączne)

### Rozkład geometryczny (moneta do pierwszego orła)
Liczba rzutów $X$ do pierwszego orła:

$$
P(X = k) = \left(\frac{1}{2}\right)^k, \quad k = 1, 2, 3, \ldots
$$

---

## Zadanie 1

Dane: $P(A \cup B) = \frac{1}{2}$, $P(A \cap B) = \frac{1}{4}$, $P(A \setminus B) = P(B \setminus A)$.

### a) Czy zawsze $P(A \cup B) = P(A) + P(B)$?

**Nie.** Ten wzór działa tylko dla zdarzeń **rozłącznych**. Tu $P(A \cap B) = \frac{1}{4} \neq 0$, więc zdarzenia się „nakładają".

$$
\text{Nie — tylko gdy } A \cap B = \emptyset
$$

### b) Wartość $P(A)$

Z $P(A \setminus B) = P(B \setminus A)$ wynika $P(A) = P(B)$.

$$
P(A \cup B) = 2P(A) - P(A \cap B) \implies \frac{1}{2} = 2P(A) - \frac{1}{4} \implies P(A) = \frac{3}{8}
$$

$$
P(A) = \dfrac{3}{8}
$$

### c) Wartość $P(A \setminus B)$

$$
P(A \setminus B) = P(A) - P(A \cap B) = \frac{3}{8} - \frac{1}{4} = \frac{3}{8} - \frac{2}{8} = \frac{1}{8}
$$

$$
P(A \setminus B) = \dfrac{1}{8}
$$

---

## Zadanie 2 — Moneta do pierwszego orła

### a) Dokładnie 6 rzutów
Musimy mieć 5 reszek, potem orła:

$$
P(X=6) = \left(\frac{1}{2}\right)^5 \cdot \frac{1}{2} = \left(\frac{1}{2}\right)^6 = \dfrac{1}{64}
$$

### b) Parzysta liczba rzutów

$$
P(X \text{ parzyste}) = \frac{1}{4} + \frac{1}{16} + \frac{1}{64} + \cdots = \frac{\frac{1}{4}}{1 - \frac{1}{4}} = \dfrac{1}{3}
$$

### c) Liczba rzutów podzielna przez $m$

$$
P(X = km,\; k=1,2,\ldots) = \sum_{k=1}^{\infty}\left(\frac{1}{2}\right)^{km} = \frac{(\frac{1}{2})^m}{1-(\frac{1}{2})^m} = \dfrac{1}{2^m - 1}
$$

---

## Do zapamiętania
- $P(A \cup B) \neq P(A) + P(B)$ gdy zdarzenia nie są rozłączne
- Geometryczny: $P(X=k) = (1-p)^{k-1} p$; tu $p = \frac{1}{2}$
