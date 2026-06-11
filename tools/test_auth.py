# -*- coding: utf-8 -*-
"""Szybki test kont: rejestracja, login, separacja danych. Uruchom przy działającym serwerze."""
import json
import urllib.request

BASE = "http://127.0.0.1:8000"


def call(path, body=None, token=None, method=None):
    req = urllib.request.Request(BASE + path, method=method or ("POST" if body is not None else "GET"))
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", "Bearer " + token)
    data = json.dumps(body).encode() if body is not None else None
    try:
        with urllib.request.urlopen(req, data) as r:
            return r.status, r.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


fails = []


def check(name, cond, info=""):
    print(("OK  " if cond else "FAIL") + " " + name + ("  " + str(info) if not cond else ""))
    if not cond:
        fails.append(name)


# 1) bez tokenu -> 401
s, b = call("/api/config")
check("config bez logowania -> 401", s == 401, (s, b))

# 2) rejestracja dwoch kont testowych
s1, b1 = call("/api/register", {"username": "testuser1", "password": "haslo1", "display_name": "Test 1"})
s2, b2 = call("/api/register", {"username": "testuser2", "password": "haslo2", "display_name": "Test 2"})
check("rejestracja testuser1", s1 == 200, (s1, b1))
check("rejestracja testuser2", s2 == 200, (s2, b2))
t1 = json.loads(b1).get("token", "")
t2 = json.loads(b2).get("token", "")

# 3) duplikat loginu
s, b = call("/api/register", {"username": "testuser1", "password": "x1234"})
check("duplikat loginu odrzucony", s == 400, (s, b))

# 4) zle haslo
s, b = call("/api/login", {"username": "testuser1", "password": "zle"})
check("zle haslo -> 401", s == 401, (s, b))

# 5) poprawny login zwraca ten sam token
s, b = call("/api/login", {"username": "testuser1", "password": "haslo1"})
check("login testuser1", s == 200 and json.loads(b)["token"] == t1, (s, b))

# 6) kazdy zapisuje SWOJE egzaminy i nazwe
call("/api/config", {"display_name": "Adam", "exams": [{"id": 1, "summary": "Analiza", "start": "2026-06-20T10:00", "durationMin": 90}]}, t1)
call("/api/config", {"display_name": "Beata", "exams": [{"id": 2, "summary": "Fizyka", "start": "2026-06-21T12:00", "durationMin": 60}]}, t2)
s, b = call("/api/config", token=t1)
c1 = json.loads(b)
s, b = call("/api/config", token=t2)
c2 = json.loads(b)
check("nazwa testuser1 = Adam", c1.get("display_name") == "Adam", c1.get("display_name"))
check("nazwa testuser2 = Beata", c2.get("display_name") == "Beata", c2.get("display_name"))
check("egzaminy NIE przeciekaja (t1)", [e["summary"] for e in c1["exams"]] == ["Analiza"], c1["exams"])
check("egzaminy NIE przeciekaja (t2)", [e["summary"] for e in c2["exams"]] == ["Fizyka"], c2["exams"])

# 7) /api/me
s, b = call("/api/me", token=t1)
check("api/me", s == 200 and json.loads(b)["display_name"] == "Adam", (s, b))

# 8) wake-tomorrow z tokenem w URL (jak iOS Skroty)
s, b = call("/api/wake-tomorrow?token=" + t1)
check("wake-tomorrow z ?token=", s == 200, (s, b))
s, b = call("/api/wake-tomorrow")
check("wake-tomorrow bez tokenu -> 401", s == 401, (s, b))

# 9) pobudki.ics z tokenem
s, b = call("/pobudki.ics?token=" + t2)
check("pobudki.ics z tokenem", s == 200 and "BEGIN:VCALENDAR" in b, (s, b[:80]))

print()
print("WYNIK: " + ("WSZYSTKO OK" if not fails else "BLEDY: " + ", ".join(fails)))
