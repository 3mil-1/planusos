# Rozdział XIII — Przedziały ufności i test t-Studenta

## Teoria

### Przedział ufności dla średniej (wariancja nieznana)
\[
\bar{x} \pm t_{1-\alpha/2,\, n-1} \cdot \frac{s}{\sqrt{n-1}}
\]

### Test t dla średniej
\[
H_0: \mu = \mu_0, \quad H_1: \mu \neq \mu_0
\]
\[
t = \sqrt{n-1} \cdot \frac{\bar{x} - \mu_0}{s}
\]

**Reguła:** odrzucamy \(H_0\), gdy \(|t| > t_{1-\alpha/2,\, n-1}\).

---

## Zadanie — Kawa u 16 studentów

Dane:
- \(n = 16\), poziom ufności \(0{,}9\) → \(\alpha = 0{,}1\)
- \(t_{0{,}95;\, 15} = 1{,}753\)
- Przedział ufności: **(2, 8)**

### a) Średnia próbkowa \(\bar{x}\)

\[
\bar{x} = \frac{2 + 8}{2} = \boxed{5\ \text{l}}
\]

### b) Wariancja próbkowa \(s^2\)

Półszerokość przedziału:
\[
8 - 5 = 3 = t \cdot \frac{s}{\sqrt{n-1}} = 1{,}753 \cdot \frac{s}{\sqrt{15}}
\]
\[
s = \frac{3\sqrt{15}}{1{,}753} \approx 6{,}63, \qquad s^2 \approx \boxed{43{,}9}
\]

### c) Test \(H_0: \mu = 4\) vs \(H_1: \mu \neq 4\), \(\alpha = 0{,}1\)

\[
t = \sqrt{15} \cdot \frac{5 - 4}{6{,}63} \approx 0{,}58
\]

Obszar krytyczny: \(|t| > 1{,}753\).

Ponieważ \(0{,}58 < 1{,}753\):

\[
\boxed{\text{Nie odrzucamy } H_0 \text{ — brak podstaw do odrzucenia hipotezy, że średnia = 4 l}}
\]

---

## Do zapamiętania
- Środek przedziału = \(\bar{x}\)
- Z szerokości przedziału wyznaczasz \(s\)
- Test dwustronny: porównuj \(|t|\) z kwantylem
