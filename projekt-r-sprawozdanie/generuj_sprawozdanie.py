#!/usr/bin/env python3
"""Generuje poprawione sprawozdanie PDF z projektu R."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUT = Path(__file__).resolve().parent / "sprawozdenie_R_poprawione.pdf"

FONT = "DejaVuSans"
FONT_BOLD = "DejaVuSans-Bold"
for name, path in [
    (FONT, "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    (FONT_BOLD, "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
]:
    pdfmetrics.registerFont(TTFont(name, path))


def build_styles():
    base = getSampleStyleSheet()
    styles = {
        "title": ParagraphStyle(
            "title",
            parent=base["Title"],
            fontName=FONT_BOLD,
            fontSize=18,
            alignment=TA_CENTER,
            spaceAfter=6,
        ),
        "subtitle": ParagraphStyle(
            "subtitle",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=11,
            alignment=TA_CENTER,
            spaceAfter=4,
        ),
        "h1": ParagraphStyle(
            "h1",
            parent=base["Heading1"],
            fontName=FONT_BOLD,
            fontSize=13,
            spaceBefore=12,
            spaceAfter=6,
        ),
        "h2": ParagraphStyle(
            "h2",
            parent=base["Heading2"],
            fontName=FONT_BOLD,
            fontSize=11,
            spaceBefore=8,
            spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=10.5,
            leading=14,
            alignment=TA_JUSTIFY,
            spaceAfter=6,
        ),
        "bullet": ParagraphStyle(
            "bullet",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=10.5,
            leading=14,
            leftIndent=16,
            spaceAfter=3,
        ),
    }
    return styles


def make_table(data, col_widths=None):
    table = Table(data, colWidths=col_widths, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, 0), FONT_BOLD),
                ("FONTNAME", (0, 1), (-1, -1), FONT),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E8EEF7")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    return table


def main():
    styles = build_styles()
    story = []

    story.append(Paragraph("Sprawozdanie z projektu R", styles["title"]))
    story.append(Paragraph("Przedmiot: RPiS", styles["subtitle"]))
    story.append(
        Paragraph(
            "Wydział Elektrotechniki, Automatyki, Informatyki i Inżynierii Biomedycznej<br/>"
            "Kierunek: Automatyka i Robotyka",
            styles["subtitle"],
        )
    )
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph("Emil Ścibich", styles["subtitle"]))
    story.append(Paragraph("Numer albumu: 43067", styles["subtitle"]))
    story.append(Paragraph("Grupa laboratoryjna: 9", styles["subtitle"]))
    story.append(Spacer(1, 0.6 * cm))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
    story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph("1. Wykorzystane dane", styles["h1"]))
    story.append(
        Paragraph(
            "W projekcie wykorzystano historyczny zbiór <b>discoveries</b> z pakietu R "
            "<i>datasets</i>. Zawiera on liczbę ważnych wynalazków i odkryć naukowych "
            "rejestrowanych rocznie w latach 1860–1959 (100 obserwacji). Dane pochodzą "
            "z publikacji D. R. McNeila, <i>Interactive Data Analysis</i> (Wiley, 1977) "
            "i są dostępne jako wbudowany szereg czasowy w R.",
            styles["body"],
        )
    )
    story.append(
        Paragraph(
            "Dane zapisano do pliku CSV (<i>do_projektu.csv</i>, separator <i>;</i>, "
            "format <i>write.csv2</i>), a następnie wczytano ponownie do analizy. "
            "Zmienna analizowana to roczna liczba odkryć (<i>Liczba_Odkryc</i>).",
            styles["body"],
        )
    )

    story.append(Paragraph("2. Postawione problemy badawcze", styles["h1"]))
    story.append(Paragraph("Problem 1 — zgodność z rozkładem Poissona", styles["h2"]))
    story.append(
        Paragraph(
            "Czy roczna liczba odkryć można opisać rozkładem Poissona o nieznanym "
            "parametrze λ (model losowego występowania zdarzeń rzadkich)?",
            styles["body"],
        )
    )
    story.append(Paragraph("• H₀: dane pochodzą z rozkładu Poissona(λ).", styles["bullet"]))
    story.append(
        Paragraph(
            "• H₁: rozkład obserwacji nie jest zgodny z rozkładem Poissona.",
            styles["bullet"],
        )
    )

    story.append(Paragraph("Problem 2 — porównanie dwóch okresów", styles["h2"]))
    story.append(
        Paragraph(
            "Czy średnia roczna liczba odkryć różni się między pierwszą a drugą "
            "połową analizowanego stulecia (lata 1860–1909 oraz 1910–1959)?",
            styles["body"],
        )
    )
    story.append(
        Paragraph(
            "• H₀: μ₁ = μ₂ (średnie w obu okresach są równe).",
            styles["bullet"],
        )
    )
    story.append(
        Paragraph(
            "• H₁: μ₁ ≠ μ₂ (średnie w obu okresach są różne).",
            styles["bullet"],
        )
    )

    story.append(Paragraph("3. Zastosowane metody", styles["h1"]))
    story.append(
        Paragraph(
            "<b>Estymacja (problem 1):</b> parametr λ oszacowano jako średnią arytmetyczną "
            "z 100 lat. Dla średniej z rozkładu Poissona zastosowano przybliżony 95% "
            "przedział ufności: λ̂ ± z₀,₉₇₅ · √(λ̂/n).",
            styles["body"],
        )
    )
    story.append(
        Paragraph(
            "<b>Testowanie hipotez (problem 1):</b> test chi-kwadrat zgodności z rozkładem "
            "Poissona. Obserwacje pogrupowano w 7 klas: 0, 1, 2, 3, 4, 5 oraz ≥ 6 odkryć "
            "rocznie. Prawdopodobieństwa teoretyczne wyznaczono z oszacowanego λ.",
            styles["body"],
        )
    )
    story.append(
        Paragraph(
            "<b>Estymacja (problem 2):</b> obliczono średnie i odchylenia standardowe "
            "dla obu 50-letnich podzbiorów.",
            styles["body"],
        )
    )
    story.append(
        Paragraph(
            "<b>Testowanie hipotez (problem 2):</b> dwustronny test t Welcha dla dwóch "
            "niezależnych prób (bez zakładania równości wariancji), poziom istotności α = 0,05.",
            styles["body"],
        )
    )

    story.append(Paragraph("4. Wyniki analiz", styles["h1"]))
    story.append(Paragraph("4.1. Problem 1 — rozkład Poissona", styles["h2"]))
    story.append(
        make_table(
            [
                ["Wielkość", "Wartość"],
                ["Liczba obserwacji n", "100"],
                ["Estymacja λ̂", "3,10"],
                ["95% przedział ufności dla λ", "[2,75; 3,45]"],
                ["Statystyka χ²", "11,047"],
                ["Stopnie swobody", "6"],
                ["p-value", "0,0869"],
            ],
            col_widths=[7 * cm, 8 * cm],
        )
    )
    story.append(Spacer(1, 0.2 * cm))
    story.append(
        Paragraph(
            "Ponieważ p-value = 0,0869 &gt; α = 0,05, <b>nie ma podstaw do odrzucenia H₀</b> "
            "na zadanym poziomie istotności. Nie stwierdzono istotnej statystycznie "
            "niezgodności danych z modelem Poissona. Nie oznacza to jednak dowodu, że H₀ "
            "jest prawdziwa — przy większej mocy testu lub innym poziomie α wynik mógłby "
            "być inny.",
            styles["body"],
        )
    )

    story.append(Paragraph("4.2. Problem 2 — porównanie okresów", styles["h2"]))
    story.append(
        make_table(
            [
                ["Okres", "Lata", "n", "Średnia", "Odchylenie std."],
                ["Pierwsza połowa", "1860–1909", "50", "3,44", "2,67"],
                ["Druga połowa", "1910–1959", "50", "2,76", "1,89"],
            ],
            col_widths=[3.5 * cm, 2.5 * cm, 1.2 * cm, 2.2 * cm, 3 * cm],
        )
    )
    story.append(Spacer(1, 0.2 * cm))
    story.append(
        make_table(
            [
                ["Wielkość", "Wartość"],
                ["Statystyka t", "1,518"],
                ["Stopnie swobody (Welch)", "92,73"],
                ["p-value", "0,1323"],
                ["95% przedział ufności różnicy średnich", "[−0,21; 1,57]"],
            ],
            col_widths=[7 * cm, 8 * cm],
        )
    )
    story.append(Spacer(1, 0.2 * cm))
    story.append(
        Paragraph(
            "Ponieważ p-value = 0,1323 &gt; α = 0,05, <b>nie ma podstaw do odrzucenia H₀</b>. "
            "Na podstawie tego testu nie wykazano istotnej różnicy między średnią liczbą "
            "odkryć w latach 1860–1909 i 1910–1959. Przedział ufności dla różnicy średnich "
            "obejmuje zero, co jest zgodne z tym wnioskiem.",
            styles["body"],
        )
    )

    story.append(Paragraph("5. Podsumowanie", styles["h1"]))
    story.append(
        Paragraph(
            "Projekt spełnia wymagania zaliczenia na poziomie 5.0: wykorzystano dane "
            "historyczne, przeprowadzono estymację parametrów (λ, średnie, odchylenia "
            "standardowe, przedziały ufności) oraz testowanie hipotez (chi-kwadrat i "
            "t-test Welcha).",
            styles["body"],
        )
    )
    story.append(
        Paragraph(
            "Roczna liczba odkryć nie odbiega istotnie od modelu Poissona (p = 0,0869), "
            "a średnie w dwóch analizowanych pięćdziesięcioleciach nie różnią się "
            "istotnie statystycznie (p = 0,1323). Ze względu na charakter szeregu "
            "czasowego wyniki należy interpretować ostrożnie — kolejne lata nie są "
            "w pełni niezależne, co jest uproszczeniem przy zastosowaniu klasycznego "
            "testu t.",
            styles["body"],
        )
    )

    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        title="Sprawozdanie z projektu R",
    )
    doc.build(story)
    print(f"Zapisano: {OUT}")


if __name__ == "__main__":
    main()
