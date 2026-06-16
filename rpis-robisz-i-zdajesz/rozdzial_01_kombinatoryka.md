# Rozdział I — Kombinatoryka

## Teoria (musisz umieć)

### Permutacje i kombinacje
- **Permutacje** \(n\) elementów: \(n!\)
- **Kombinacje** \(k\) z \(n\): \(\binom{n}{k} = \dfrac{n!}{k!(n-k)!}\)

### Okrągły stół
Gdy miejsca **nie są rozróżnialne** (liczy się tylko układ względem siebie), obroty tego samego układu to jeden przypadek:
\[
n \text{ osób przy okrągłym stole} \;\Rightarrow\; (n-1)!
\]
**Sztuczka:** „przyklejamy" jedną osobę, żeby usunąć symetrię obrotu.

### Rozmieszczenia (rozwinięcie)
Równanie \(x_1 + x_2 + \ldots + x_k = n\) z \(x_i \geq 0\):
\[
\binom{n+k-1}{k-1}
\]

**Warianty:**
| Warunek | Zamiana | Nowe równanie |
|---------|---------|---------------|
| \(x_i > 0\) | \(y_i = x_i - 1\) | suma \(= n-k\), \(y_i \geq 0\) |
| \(x_i \geq a_i\) | \(y_i = x_i - a_i\) | suma \(= n - \sum a_i\) |

---

## Zadanie 1 — Stół okrągły, 20 osób

### a) Miejsca nierozróżnialne
\[
\boxed{19!}
\]

### b) Krzesła rozróżnialne (każde miejsce ma numer)
\[
\boxed{20!}
\]

### c) 10 kobiet i 10 mężczyzn, płeć się nie sąsiaduje

Przy okrągłym stole z równą liczbą osób obu płci jedyny możliwy układ to **naprzemienny**: KMKMKM…

1. Przyklejamy jedną kobietę (usuwamy obroty) → zostaje 9 kobiet do ułożenia: \(9!\)
2. Mężczyźni zajmują 10 pozycji między kobietami: \(10!\)

\[
\boxed{9! \cdot 10!}
\]

---

## Zadanie 2 — \(x_1 + x_2 + x_3 + x_4 = 25\)

### a) \(x_i \geq 0\)
\[
\binom{25+4-1}{4-1} = \binom{28}{3} = \frac{28 \cdot 27 \cdot 26}{6} = \boxed{3276}
\]

### b) \(x_i > 0\) (czyli \(x_i \geq 1\))
Podstawiamy \(y_i = x_i - 1\), suma \(y_i = 21\):
\[
\binom{21+3}{3} = \binom{24}{3} = \frac{24 \cdot 23 \cdot 22}{6} = \boxed{2024}
\]

### c) \(x_1 \geq 0,\; x_2 \geq 2,\; x_3 \geq 0,\; x_4 \geq 4\)
Odejmujemy minimum: \(25 - 2 - 4 = 19\)
\[
\binom{19+3}{3} = \binom{22}{3} = \frac{22 \cdot 21 \cdot 20}{6} = \boxed{1540}
\]

---

## Do zapamiętania
- Okrągły stół → \((n-1)!\)
- Suma z ograniczeniami → zamień na \(y_i \geq 0\) i użyj \(\binom{n+k-1}{k-1}\)
