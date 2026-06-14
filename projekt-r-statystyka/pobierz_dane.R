# =============================================================================
# POBIERANIE RZECZYWISTYCH DANYCH Z INTERNETU
# =============================================================================
#
# Uruchom ten skrypt PRZED zadaniami 5A i 5B, aby pobrać aktualne dane:
#   - IMGW: miesięczne temperatury Warszawa-Okęcie
#   - GUS BDL API: miesięczna stopa bezrobocia rejestrowanego w Polsce
#
# Wymaga pakietu: install.packages("jsonlite")
#
# =============================================================================

if (!requireNamespace("jsonlite", quietly = TRUE)) {
  stop("Zainstaluj pakiet jsonlite: install.packages('jsonlite')")
}

library(jsonlite)

dir.create("dane", showWarnings = FALSE)

# =============================================================================
# 1. DANE IMGW – temperatury miesięczne Warszawa-Okęcie
# =============================================================================
# Źródło: https://danepubliczne.imgw.pl/
# Format: archiwa ZIP z plikami CSV (kodowanie CP1250)

pobierz_temperatury_imgw <- function(lata = 2019:2023) {
  cat("Pobieranie danych IMGW...\n")

  wynik <- data.frame(
    rok = integer(),
    miesiac = integer(),
    srednia_temp_c = numeric(),
    stacja = character(),
    stringsAsFactors = FALSE
  )

  for (rok in lata) {
    url <- paste0(
      "https://danepubliczne.imgw.pl/data/dane_pomiarowo_obserwacyjne/",
      "dane_meteorologiczne/miesieczne/synop/", rok, "/", rok, "_m_s.zip"
    )

    plik_zip <- tempfile(fileext = ".zip")
    plik_csv <- tempfile(fileext = ".csv")

    tryCatch({
      download.file(url, plik_zip, mode = "wb", quiet = TRUE)
      utils::unzip(plik_zip, files = paste0("s_m_d_", rok, ".csv"), exdir = tempdir())
      sciezka <- file.path(tempdir(), paste0("s_m_d_", rok, ".csv"))

      dane_rok <- read.csv(sciezka, header = FALSE, sep = ",",
                           fileEncoding = "CP1250", stringsAsFactors = FALSE)

      for (i in seq_len(nrow(dane_rok))) {
        nazwa <- toupper(dane_rok[i, 2])
        if (grepl("WARSZAWA", nazwa)) {
          miesiac <- as.integer(dane_rok[i, 4])
          temp <- as.numeric(dane_rok[i, 13])  # kolumna STM – średnia miesięczna
          if (!is.na(temp)) {
            wynik <- rbind(wynik, data.frame(
              rok = rok,
              miesiac = miesiac,
              srednia_temp_c = temp,
              stacja = dane_rok[i, 2],
              stringsAsFactors = FALSE
            ))
          }
        }
      }
      cat(sprintf("  %d: pobrano %d miesiecy\n", rok, sum(wynik$rok == rok)))
    }, error = function(e) {
      cat(sprintf("  %d: BLAD - %s\n", rok, e$message))
    })
  }

  wynik <- wynik[order(wynik$rok, wynik$miesiac), ]
  write.csv(wynik, "dane/temperatury_warszawa.csv", row.names = FALSE, sep = ";")
  cat(sprintf("Zapisano: dane/temperatury_warszawa.csv (%d wierszy)\n\n", nrow(wynik)))
  invisible(wynik)
}

# =============================================================================
# 2. DANE GUS – stopa bezrobocia rejestrowanego (miesięczna, Polska)
# =============================================================================
# Źródło: https://bdl.stat.gov.pl/api/v1/
# Zmienna: stopa bezrobocia rejestrowanego, dane miesięczne (subject P3559)

pobierz_bezrobocie_gus <- function(lata = 2018:2023) {
  cat("Pobieranie danych GUS BDL API...\n")

  # ID zmiennych dla kolejnych miesięcy (styczeń=461680 ... grudzień=461691)
  id_miesiecy <- 461680:461691
  nazwy_miesiecy <- c("styczen", "luty", "marzec", "kwiecien", "maj", "czerwiec",
                      "lipiec", "sierpien", "wrzesien", "pazdziernik",
                      "listopad", "grudzien")

  wynik <- data.frame(
    rok = integer(),
    miesiac = integer(),
    stopa_bezrobocia_proc = numeric(),
    stringsAsFactors = FALSE
  )

  for (m in seq_along(id_miesiecy)) {
    var_id <- id_miesiecy[m]
    lata_param <- paste0("year=", lata, collapse = "&")
    url <- paste0(
      "https://bdl.stat.gov.pl/api/v1/data/by-variable/", var_id,
      "?unit-level=0&", lata_param, "&format=json"
    )

    tryCatch({
      odp <- fromJSON(url)
      if (length(odp$results) > 0) {
        vals <- odp$results[[1]]$values
        for (j in seq_len(nrow(vals))) {
          wynik <- rbind(wynik, data.frame(
            rok = as.integer(vals$year[j]),
            miesiac = m,
            stopa_bezrobocia_proc = vals$val[j],
            stringsAsFactors = FALSE
          ))
        }
      }
    }, error = function(e) {
      cat(sprintf("  miesiac %d: BLAD - %s\n", m, e$message))
    })
  }

  wynik <- wynik[order(wynik$rok, wynik$miesiac), ]
  write.csv(wynik, "dane/bezrobocie_polska.csv", row.names = FALSE, sep = ",")
  cat(sprintf("Zapisano: dane/bezrobocie_polska.csv (%d wierszy)\n\n", nrow(wynik)))
  invisible(wynik)
}

# --- Uruchomienie ---
cat("=== POBIERANIE DANYCH Z INTERNETU ===\n\n")
temperatury <- pobierz_temperatury_imgw(2019:2023)
bezrobocie  <- pobierz_bezrobocie_gus(2018:2023)
cat("Gotowe. Mozesz teraz uruchomic zadania 5A i 5B.\n")
