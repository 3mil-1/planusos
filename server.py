"""
PlanUSOS – lokalny serwer aplikacji.

Co robi poza serwowaniem plików:
  * /api/plan      – pobiera plan z prywatnego linku iCal USOSweb (omija CORS), cache'uje
  * /api/config    – zapis/odczyt ustawień (link USOS, minuty alarmu)
  * /api/info      – adres IP w sieci lokalnej (do subskrypcji z telefonu)
  * /pobudki.ics   – dynamiczny kalendarz POBUDEK (webcal dla iPhone'a)
  * /plan.ics      – plan zajęć jako subskrybowalny kalendarz

Uruchomienie:  python server.py   →  http://localhost:8000
"""
import json
import os
import re
import socket
import urllib.request
from datetime import datetime, timedelta, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, parse_qs

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
DATA.mkdir(exist_ok=True)
CONFIG_FILE = DATA / "config.json"
PLAN_CACHE = DATA / "plan.ics"
CHANGES_FILE = DATA / "changes.json"
PORT = int(os.environ.get("PORT", "8000"))  # hosting (Render itp.) ustawia PORT przez env

DEFAULT_CONFIG = {
    "usos_url": os.environ.get("USOS_URL", ""),
    "alarm_min": 90,
    "alarm_on": True,
    "include_lectures": True,
    "skip_limit": 2,
    "skips": [],
    "exams": [],
}

# USOS AGH nazywa wykłady "W - Przedmiot" (ale "WF - ..." to nie wykład!)
LECTURE_RE = re.compile(r"wykład|wyklad|^(w|wyk)\s*-\s", re.IGNORECASE)


def load_config() -> dict:
    try:
        return {**DEFAULT_CONFIG, **json.loads(CONFIG_FILE.read_text("utf-8"))}
    except Exception:
        return dict(DEFAULT_CONFIG)


def save_config(cfg: dict) -> None:
    CONFIG_FILE.write_text(json.dumps(cfg, ensure_ascii=False, indent=2), "utf-8")


def lan_ip() -> str:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "localhost"


def fetch_usos_plan(url: str) -> str:
    if url.startswith("webcal://"):
        url = "https://" + url[len("webcal://"):]
    req = urllib.request.Request(url, headers={"User-Agent": "PlanUSOS/1.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        text = r.read().decode("utf-8", errors="replace")
    if "BEGIN:VCALENDAR" not in text:
        raise ValueError("Pod tym adresem nie ma kalendarza iCal")
    old_text = PLAN_CACHE.read_text("utf-8") if PLAN_CACHE.exists() else ""
    if old_text and old_text != text:
        record_changes(old_text, text)
    PLAN_CACHE.write_text(text, "utf-8")
    return text


# ---------- minimalny parser ICS (na potrzeby feedu pobudek) ----------

def _unfold(text: str) -> list[str]:
    return text.replace("\r\n", "\n").replace("\n ", "").replace("\n\t", "").split("\n")


def _parse_dt(value: str):
    m = re.match(r"^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$", value)
    if not m:
        return None
    y, mo, d = int(m[1]), int(m[2]), int(m[3])
    h, mi, s = int(m[4] or 0), int(m[5] or 0), int(m[6] or 0)
    if m[7]:  # UTC -> czas lokalny
        return datetime(y, mo, d, h, mi, s, tzinfo=timezone.utc).astimezone().replace(tzinfo=None)
    return datetime(y, mo, d, h, mi, s)


def parse_events(ics_text: str) -> list[dict]:
    events, cur = [], None
    for line in _unfold(ics_text):
        if line == "BEGIN:VEVENT":
            cur = {}
        elif line == "END:VEVENT":
            if cur and cur.get("start") and cur.get("summary"):
                events.append(cur)
            cur = None
        elif cur is not None and ":" in line:
            left, value = line.split(":", 1)
            prop = left.split(";")[0]
            if prop == "DTSTART":
                cur["start"] = _parse_dt(value)
            elif prop == "SUMMARY":
                cur["summary"] = value.replace("\\,", ",").replace("\\;", ";")
            elif prop == "LOCATION":
                cur["location"] = value.replace("\\,", ",").replace("\\;", ";")
    return [e for e in events if e.get("start")]


def _stamp(dt: datetime) -> str:
    return dt.strftime("%Y%m%dT%H%M%S")


# ---------- wykrywanie zmian planu ----------

def _ev_key(e: dict) -> str:
    return f"{e['summary']}|{e['start'].strftime('%Y%m%dT%H%M%S')}"


def record_changes(old_text: str, new_text: str) -> None:
    """Porównuje stary i nowy plan, zapisuje sensowne różnice (bez szumu z przesuwania okna USOS)."""
    try:
        old = parse_events(old_text)
        new = parse_events(new_text)
        now = datetime.now()
        old_map = {_ev_key(e): e for e in old}
        new_map = {_ev_key(e): e for e in new}
        # USOS oddaje tylko najbliższe tygodnie - zajęcia za horyzontem starego planu
        # to nie "nowe zajęcia", tylko przesunięte okno
        horizon = max((e["start"] for e in old), default=now)

        items = []
        for k, e in old_map.items():
            if k not in new_map and e["start"] > now:
                items.append({"type": "odwołane", "summary": e["summary"],
                              "when": e["start"].strftime("%Y-%m-%d %H:%M")})
        for k, e in new_map.items():
            if k not in old_map and now < e["start"] <= horizon:
                items.append({"type": "nowe", "summary": e["summary"],
                              "when": e["start"].strftime("%Y-%m-%d %H:%M")})
        for k, e in new_map.items():
            o = old_map.get(k)
            if o and e["start"] > now and o.get("location") and e.get("location") \
                    and o["location"] != e["location"]:
                items.append({"type": "zmiana sali", "summary": e["summary"],
                              "when": e["start"].strftime("%Y-%m-%d %H:%M"),
                              "detail": f"{o['location']} → {e['location']}"})
        if not items:
            return
        try:
            batches = json.loads(CHANGES_FILE.read_text("utf-8"))
        except Exception:
            batches = []
        batches.append({"ts": now.isoformat(timespec="seconds"), "items": items})
        CHANGES_FILE.write_text(json.dumps(batches[-10:], ensure_ascii=False, indent=2), "utf-8")
    except Exception:
        pass  # diff nie może wywrócić synchronizacji


def load_changes() -> list:
    try:
        return json.loads(CHANGES_FILE.read_text("utf-8"))
    except Exception:
        return []


def _exam_events(cfg: dict) -> list[dict]:
    out = []
    for ex in cfg.get("exams", []):
        try:
            out.append({
                "summary": f"EGZ - {ex['summary']}",
                "start": datetime.strptime(ex["start"], "%Y-%m-%dT%H:%M"),
            })
        except Exception:
            continue
    return out


def _filtered_events(cfg: dict) -> list[dict]:
    """Zajęcia liczone do pobudki: bez wykładów (jeśli wyłączone) i bez pominiętych.
    Egzaminy/kolokwia zawsze się liczą."""
    try:
        events = parse_events(PLAN_CACHE.read_text("utf-8"))
    except Exception:
        events = []
    if not cfg.get("include_lectures", True):
        events = [e for e in events if not LECTURE_RE.search(e["summary"])]
    skips = set(cfg.get("skips", []))
    if skips:
        events = [e for e in events
                  if f"{e['summary']}|{e['start'].strftime('%Y%m%dT%H%M%S')}" not in skips]
    return events + _exam_events(cfg)


def wake_time_tomorrow() -> str:
    """Godzina pobudki na jutro (HH:MM) albo BRAK – dla automatyzacji Skrótów iOS."""
    cfg = load_config()
    # spróbuj odświeżyć plan, żeby automatyzacja wieczorna miała świeże dane
    if cfg.get("usos_url"):
        try:
            fetch_usos_plan(cfg["usos_url"])
        except Exception:
            pass  # zostanie cache
    events = _filtered_events(cfg)
    tomorrow = (datetime.now() + timedelta(days=1)).date()
    starts = [e["start"] for e in events if e["start"].date() == tomorrow]
    if not starts:
        return "BRAK"
    wake = min(starts) - timedelta(minutes=int(cfg.get("alarm_min", 90)))
    return wake.strftime("%H:%M")


def build_wake_calendar() -> str:
    cfg = load_config()
    alarm_min = int(cfg.get("alarm_min", 90))
    events = _filtered_events(cfg)

    now = datetime.now()
    first_per_day: dict[str, datetime] = {}
    summaries: dict[str, str] = {}
    for e in events:
        key = e["start"].strftime("%Y-%m-%d")
        if key not in first_per_day or e["start"] < first_per_day[key]:
            first_per_day[key] = e["start"]
            summaries[key] = e["summary"]

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//PlanUSOS//Pobudki//PL",
        "CALSCALE:GREGORIAN",
        "X-WR-CALNAME:⏰ Pobudki (PlanUSOS)",
        "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
        "X-PUBLISHED-TTL:PT6H",
    ]
    for key in sorted(first_per_day):
        first = first_per_day[key]
        wake = first - timedelta(minutes=alarm_min)
        if wake < now - timedelta(hours=1) or wake > now + timedelta(days=60):
            continue
        lines += [
            "BEGIN:VEVENT",
            f"UID:planusos-wake-{key}@planusos",
            f"DTSTAMP:{_stamp(now)}",
            f"DTSTART:{_stamp(wake)}",
            f"DTEND:{_stamp(wake + timedelta(minutes=15))}",
            f"SUMMARY:⏰ POBUDKA – zajęcia o {first.strftime('%H:%M')}",
            f"DESCRIPTION:{summaries[key].replace(',', chr(92) + ',')}",
            "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Pobudka!", "TRIGGER:PT0M", "END:VALARM",
            "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Serio - wstawaj!", "TRIGGER:PT5M", "END:VALARM",
            "END:VEVENT",
        ]
    lines.append("END:VCALENDAR")
    return "\r\n".join(lines)


# ---------- serwer HTTP ----------

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        pass  # cisza w konsoli

    def _send(self, code: int, body: bytes, ctype: str):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _json(self, code: int, obj):
        self._send(code, json.dumps(obj, ensure_ascii=False).encode("utf-8"),
                   "application/json; charset=utf-8")

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/config":
            return self._json(200, load_config())

        if path == "/api/info":
            return self._json(200, {"lan_ip": lan_ip(), "port": PORT})

        if path == "/api/plan":
            cfg = load_config()
            qs = parse_qs(parsed.query)
            refresh = qs.get("refresh", ["0"])[0] == "1"
            try:
                if cfg["usos_url"] and (refresh or not PLAN_CACHE.exists()):
                    text = fetch_usos_plan(cfg["usos_url"])
                elif PLAN_CACHE.exists():
                    text = PLAN_CACHE.read_text("utf-8")
                else:
                    return self._json(404, {"error": "Brak skonfigurowanego linku USOS"})
                return self._send(200, text.encode("utf-8"), "text/calendar; charset=utf-8")
            except Exception as ex:
                # gdy USOS nie odpowiada, oddaj cache jeśli jest
                if PLAN_CACHE.exists():
                    return self._send(200, PLAN_CACHE.read_text("utf-8").encode("utf-8"),
                                      "text/calendar; charset=utf-8")
                return self._json(502, {"error": f"Nie udało się pobrać planu: {ex}"})

        if path == "/api/changes":
            return self._json(200, {"batches": load_changes()})

        if path == "/api/wake-tomorrow":
            return self._send(200, wake_time_tomorrow().encode("utf-8"),
                              "text/plain; charset=utf-8")

        if path == "/pobudki.ics":
            return self._send(200, build_wake_calendar().encode("utf-8"),
                              "text/calendar; charset=utf-8")

        if path == "/plan.ics":
            if PLAN_CACHE.exists():
                return self._send(200, PLAN_CACHE.read_text("utf-8").encode("utf-8"),
                                  "text/calendar; charset=utf-8")
            return self._json(404, {"error": "Brak planu"})

        return super().do_GET()

    def do_POST(self):
        if urlparse(self.path).path == "/api/config":
            try:
                length = int(self.headers.get("Content-Length", 0))
                incoming = json.loads(self.rfile.read(length).decode("utf-8"))
            except Exception:
                return self._json(400, {"error": "Złe dane"})
            cfg = load_config()
            for key in ("usos_url", "alarm_min", "alarm_on", "include_lectures",
                        "skip_limit", "skips", "exams"):
                if key in incoming:
                    cfg[key] = incoming[key]
            save_config(cfg)
            # od razu spróbuj pobrać plan z nowego linku
            result = {"ok": True}
            if incoming.get("usos_url"):
                try:
                    fetch_usos_plan(cfg["usos_url"])
                    result["synced"] = True
                except Exception as ex:
                    result["synced"] = False
                    result["sync_error"] = str(ex)
            return self._json(200, cfg | result)
        return self._json(404, {"error": "Nie ma takiego endpointu"})


class Server(ThreadingHTTPServer):
    # nie pozwalaj dwóm instancjom dzielić portu (Windows na to pozwala i powstaje chaos)
    allow_reuse_address = False


if __name__ == "__main__":
    ip = lan_ip()
    try:
        srv = Server(("0.0.0.0", PORT), Handler)
    except OSError:
        print(f"Port {PORT} jest zajety - PlanUSOS juz dziala w innym oknie. Zamknij tamto albo uzyj tego.")
        raise SystemExit(1)
    print("PlanUSOS dziala!")
    print(f"  na tym komputerze:  http://localhost:{PORT}")
    print(f"  z telefonu (Wi-Fi): http://{ip}:{PORT}")
    srv.serve_forever()
