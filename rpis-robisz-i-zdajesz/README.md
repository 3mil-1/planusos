# RPIS — Robisz i zdajesz

Kompletny materiał do nauki i rozwiązania wszystkich zadań z arkusza **RPIS (Rachunek Prawdopodobieństwa i Statystyka)**.

> **Wzory matematyczne:** GitHub renderuje je automatycznie — wzór w tekście to `$...$`, wzór w osobnej linii to `$$...$$`. Ułamki zapisujemy jako `\frac{licznik}{mianownik}`.

## Spis treści

| Rozdział | Temat | Plik |
|----------|-------|------|
| I | Kombinatoryka | [rozdzial_01_kombinatoryka.md](rozdzial_01_kombinatoryka.md) |
| II | Prawdopodobieństwo klasyczne | [rozdzial_02_prawdopodobienstwo.md](rozdzial_02_prawdopodobienstwo.md) |
| III | Prawdopodobieństwo całkowite i wzór Bayesa | [rozdzial_03_bayes.md](rozdzial_03_bayes.md) |
| IV | Zdarzenia niezależne, schemat Bernoulliego | [rozdzial_04_bernoulli.md](rozdzial_04_bernoulli.md) |
| V | Zmienne losowe ciągłe (gęstość, dystrybuanta) | [rozdzial_05_ciagly.md](rozdzial_05_ciagly.md) |
| VI | Wartość oczekiwana i wariancja | [rozdzial_06_oczekiwana_wariancja.md](rozdzial_06_oczekiwana_wariancja.md) |
| VII | Funkcje zmiennych losowych | [rozdzial_07_funkcje_zl.md](rozdzial_07_funkcje_zl.md) |
| VIII | Rozkład normalny | [rozdzial_08_normalny.md](rozdzial_08_normalny.md) |
| IX | Wektory losowe (dwuwymiarowe) | [rozdzial_09_wektory.md](rozdzial_09_wektory.md) |
| X | Niezależność, rozkłady warunkowe | [rozdzial_10_warunkowe.md](rozdzial_10_warunkowe.md) |
| XI | Rozkład dwumianowy i aproksymacja normalna | [rozdzial_11_dwumianowy.md](rozdzial_11_dwumianowy.md) |
| XIII | Przedziały ufności i test t-Studenta | [rozdzial_13_test_t.md](rozdzial_13_test_t.md) |
| XIV | Test dla średniej (znane σ²) | [rozdzial_14_test_srednia.md](rozdzial_14_test_srednia.md) |

## Jak się uczyć

1. **Przeczytaj teorię** na początku każdego rozdziału (wypisane wzory + krótkie wyjaśnienie).
2. **Spróbuj sam** rozwiązać zadanie, zanim zajrzysz w odpowiedź.
3. **Porównaj** z rozwiązaniem krok po kroku.
4. **Powtórz wzory** z sekcji „Do zapamiętania” na końcu każdego rozdziału.

## Szybka ściąga — najważniejsze wzory

### Kombinatoryka
- Permutacje: $n!$
- Okrągły stół (bez rozróżniania miejsc): $(n-1)!$
- Kombinacje: $\binom{n}{k}$
- Rozmieszczenia: $\binom{n+k-1}{k-1}$ (dla $x_1+\ldots+x_k=n$, $x_i\geq 0$)

### Prawdopodobieństwo
- $P(A\cup B) = P(A)+P(B)-P(A\cap B)$
- Bayes: $P(A|B)=\dfrac{P(B|A)P(A)}{P(B)}$
- Niezależność: $P(A\cap B)=P(A)P(B)$

### Schemat Bernoulliego ($n$ prób, prawd. sukcesu $p$)
- Dokładnie $k$ sukcesów: $\binom{n}{k}p^k(1-p)^{n-k}$
- Co najmniej jeden: $1-(1-p)^n$

### Zmienne losowe
- $E(X)=\sum x_i p_i$ lub $\int x f(x)\,dx$
- $\mathrm{Var}(X)=E(X^2)-[E(X)]^2$
- $\mathrm{Var}(X+Y)=\mathrm{Var}(X)+\mathrm{Var}(Y)$ gdy nieskorelowane

### Statystyka
- Przedział ufności: $\bar{x}\pm t_{1-\alpha/2,\,n-1}\dfrac{s}{\sqrt{n-1}}$
- Test t: $t=\sqrt{n-1}\dfrac{\bar{x}-\mu_0}{s}$
- Test z: $U=\sqrt{n}\dfrac{\bar{x}-\mu_0}{\sigma}$
