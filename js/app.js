/* PlanUSOS – plan zajęć z USOS z auto-synchronizacją (PWA) */
"use strict";

// ===================== Stan =====================
const LS_EVENTS = "planusos.events";
const LS_SETTINGS = "planusos.settings";

let events = [];          // {start: Date, end: Date, summary, location, type}
let weekStart = startOfWeek(new Date());
let settings = {
  remindersOn: false,
  reminderMin: 15,
  alarmOn: false,   // alarm w aplikacji (PC)
  alarmMin: 90,
  lecturesCount: true, // czy wykłady wliczają się do budzika/odliczania/przypomnień
  skipLimit: 2,        // ile razy można pominąć dany przedmiot w semestrze
  wfLimit: 5,          // ile WF-ów można odrobić (WF1/WF2: min. 10 zaliczonych zajęć)
};
let serverMode = false;   // czy działa server.py (API)
let serverInfo = null;    // {lan_ip, port}
let usosUrl = "";

const notified = new Set();
const firedAlarms = new Set();
let alarmAudio = null;

const DAYS_SHORT = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];
const HOUR_PX = 56;

// ===================== Pomocnicze: daty =====================
function startOfWeek(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function fmtTime(d) { return d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }); }
function fmtDate(d) { return d.toLocaleDateString("pl-PL", { day: "numeric", month: "short" }); }
function fmtDateLong(d) { return d.toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" }); }
function pad(n) { return String(n).padStart(2, "0"); }

// ===================== Parser ICS =====================
function unfoldIcsLines(text) {
  return text.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "").split("\n");
}

function parseIcsDate(value) {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);
  if (!m) return null;
  const [, y, mo, d, h = "0", mi = "0", s = "0", z] = m;
  if (z) return new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s));
  return new Date(+y, +mo - 1, +d, +h, +mi, +s);
}

function unescapeIcs(s) {
  return s.replace(/\\n/gi, " · ").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
}

function parseICS(text) {
  const lines = unfoldIcsLines(text);
  const out = [];
  let cur = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") { cur = {}; continue; }
    if (line === "END:VEVENT") {
      if (cur && cur.start && cur.end && cur.summary) {
        if (cur.rrule && /FREQ=WEEKLY/i.test(cur.rrule)) {
          const untilM = cur.rrule.match(/UNTIL=([0-9TZ]+)/i);
          const countM = cur.rrule.match(/COUNT=(\d+)/i);
          const until = untilM ? parseIcsDate(untilM[1]) : addDays(cur.start, 7 * 14);
          const maxCount = countM ? +countM[1] : 30;
          const dur = cur.end - cur.start;
          let s = new Date(cur.start);
          let i = 0;
          while (s <= until && i < maxCount) {
            out.push({ ...cur, start: new Date(s), end: new Date(s.getTime() + dur) });
            s = addDays(s, 7);
            i++;
          }
        } else {
          out.push(cur);
        }
      }
      cur = null;
      continue;
    }
    if (!cur) continue;
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const [prop] = line.slice(0, idx).split(";");
    const value = line.slice(idx + 1);
    switch (prop) {
      case "DTSTART": cur.start = parseIcsDate(value); break;
      case "DTEND": cur.end = parseIcsDate(value); break;
      case "SUMMARY": cur.summary = unescapeIcs(value); break;
      case "LOCATION": cur.location = unescapeIcs(value); break;
      case "RRULE": cur.rrule = value; break;
    }
  }
  out.sort((a, b) => a.start - b.start);
  return out;
}

// ===================== Kolory przedmiotów =====================
// ===================== Typy zajęć i ich kolory =====================
const TYPE_COLORS = {
  egzamin: "#ff5d73",
  wyklad: "#5b7cfa",
  cwiczenia: "#2fd6c3",
  lab: "#b08cff",
  lektorat: "#8ad96d",
  wf: "#ffd23f",
  projekt: "#ff9e4f",
  seminarium: "#ff8fc7",
  inne: "#b5ad9f",
};
const TYPE_LABELS = {
  egzamin: "Egzamin / kolokwium",
  wyklad: "Wykład",
  cwiczenia: "Ćwiczenia",
  lab: "Laboratorium",
  lektorat: "Lektorat",
  wf: "WF",
  projekt: "Projekt",
  seminarium: "Seminarium",
  inne: "Inne",
};

// USOS AGH: "W - ...", "CWA - ...", "CWL - ...", "WF - ...", "LEKT - ..."
function typeOf(e) {
  const s = e.summary;
  const m = s.match(/^([A-ZĆŁŚŻŹ]+)\s*-\s/i);
  const prefix = m ? m[1].toUpperCase() : "";
  if (e._exam || prefix === "EGZ" || /egzamin|kolokwium|zaliczenie/i.test(s)) return "egzamin";
  if (prefix === "WF" || /wychowanie fizyczne/i.test(s)) return "wf";
  if (isLecture(e)) return "wyklad";
  if (prefix === "CWL" || prefix === "LAB" || /laborator|\blab\.?\b/i.test(s)) return "lab";
  if (prefix === "CWA" || prefix === "CW" || prefix === "ĆW" || /ćwiczenia|cwiczenia/i.test(s)) return "cwiczenia";
  if (prefix === "LEKT" || /lektorat|język|jezyk/i.test(s)) return "lektorat";
  if (prefix === "PROJ" || /projekt/i.test(s)) return "projekt";
  if (prefix === "SEM" || /seminari/i.test(s)) return "seminarium";
  return "inne";
}
function colorFor(e) { return TYPE_COLORS[typeOf(e)]; }

// wykład = nieobowiązkowy; USOS AGH używa prefiksów "W - ...", "WYK - ..."
function isLecture(e) {
  const s = e.summary;
  return /wykład|wyklad/i.test(s) || /^(w|wyk)\s*-\s/i.test(s);
}

// ===================== Pominięcia zajęć =====================
const LS_SKIPS = "planusos.skips";
let skips = new Set();

function evKey(e) {
  const d = e.start;
  return `${e.summary}|${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}
function isSkipped(e) { return skips.has(evKey(e)); }
function skipsUsedFor(summary) {
  let n = 0;
  for (const k of skips) if (k.startsWith(summary + "|")) n++;
  return n;
}
function saveSkips() { localStorage.setItem(LS_SKIPS, JSON.stringify([...skips])); }
function loadSkips() {
  try { skips = new Set(JSON.parse(localStorage.getItem(LS_SKIPS) || "[]")); }
  catch { skips = new Set(); }
}

function toggleSkip(e) {
  const key = evKey(e);
  const type = typeOf(e);
  if (skips.has(key)) {
    skips.delete(key);
    toast(`Wracasz na: ${e.summary}`);
  } else if (type === "wf") {
    // WF-u się nie pomija – WF się odrabia (zasady SWFiS AGH)
    const used = skipsUsedFor(e.summary);
    if (used >= settings.wfLimit) {
      toast(`Stop! Masz już ${used}/${settings.wfLimit} WF-ów do odrobienia. Na WF1/WF2 musisz zaliczyć min. 10 zajęć w semestrze – więcej nie odrobisz.`);
      return;
    }
    skips.add(key);
    toast(`WF oznaczony do odrobienia (${used + 1}/${settings.wfLimit}). Zasady: uzgodnij z prowadzącym PRZED zajęciami, weź legitymację i druk potwierdzenia, max 1 WF dziennie. Harmonogram grup → Ustawienia.`);
  } else if (isLecture(e)) {
    skips.add(key);
    toast("Pominięto wykład (nieobowiązkowy, bez limitu).");
  } else {
    const used = skipsUsedFor(e.summary);
    if (used >= settings.skipLimit) {
      toast(`Limit pominięć wykorzystany (${used}/${settings.skipLimit}) – wg regulaminu AGH limit nieobecności ustala prowadzący, nie szarżuj.`);
      return;
    }
    skips.add(key);
    toast(`Pominięto (${used + 1}/${settings.skipLimit} w tym przedmiocie). Pamiętaj: nieobecność usprawiedliwiasz do 7 dni.`);
  }
  saveSkips();
  pushConfig();
  renderAll();
}

// ===================== Kolokwia i egzaminy =====================
const LS_EXAMS = "planusos.exams";
let exams = []; // {id, summary, start "YYYY-MM-DDTHH:MM", durationMin}

function saveExams() {
  localStorage.setItem(LS_EXAMS, JSON.stringify(exams));
  pushConfig();
}
function loadExams() {
  try { exams = JSON.parse(localStorage.getItem(LS_EXAMS) || "[]"); }
  catch { exams = []; }
}
function examEvents() {
  return exams.map(ex => {
    const start = new Date(ex.start);
    return {
      start,
      end: new Date(start.getTime() + (ex.durationMin || 90) * 60000),
      summary: `EGZ - ${ex.summary}`,
      _exam: true,
      _examId: ex.id,
    };
  }).filter(e => !isNaN(e.start));
}
function allEvents() { return events.concat(examEvents()); }

function removeExamPrompt(e) {
  const ex = exams.find(x => x.id === e._examId);
  if (!ex) return;
  if (confirm(`Usunąć "${ex.summary}" (${fmtDateLong(e.start)} ${fmtTime(e.start)})?`)) {
    exams = exams.filter(x => x.id !== ex.id);
    saveExams();
    renderAll();
    toast("Usunięto termin.");
  }
}

// zajęcia brane pod uwagę przy budziku, odliczaniu i przypomnieniach
// (egzaminy liczą się zawsze – na egzamin się nie zaśpi)
function activeEvents() {
  return allEvents().filter(e =>
    e._exam || (!isSkipped(e) && (settings.lecturesCount || !isLecture(e))));
}

// ===================== Pamięć lokalna =====================
function saveEvents() {
  localStorage.setItem(LS_EVENTS, JSON.stringify(events.map(e => ({
    ...e, start: e.start.toISOString(), end: e.end.toISOString(),
  }))));
}
function loadEvents() {
  try {
    const raw = localStorage.getItem(LS_EVENTS);
    if (!raw) return;
    events = JSON.parse(raw).map(e => ({ ...e, start: new Date(e.start), end: new Date(e.end) }));
  } catch { events = []; }
}
function saveSettings() { localStorage.setItem(LS_SETTINGS, JSON.stringify(settings)); }
function loadSettings() {
  try {
    const raw = localStorage.getItem(LS_SETTINGS);
    if (raw) settings = { ...settings, ...JSON.parse(raw) };
  } catch { /* domyślne */ }
}

// ===================== Serwer: konfiguracja i synchronizacja =====================
async function initServer() {
  try {
    const r = await fetch("/api/config", { cache: "no-store" });
    if (!r.ok) throw 0;
    const cfg = await r.json();
    serverMode = true;
    usosUrl = cfg.usos_url || "";
    if (typeof cfg.alarm_min === "number") settings.alarmMin = cfg.alarm_min;
    if (typeof cfg.include_lectures === "boolean") settings.lecturesCount = cfg.include_lectures;
    if (typeof cfg.skip_limit === "number") settings.skipLimit = cfg.skip_limit;
    if (Array.isArray(cfg.skips)) {
      for (const k of cfg.skips) skips.add(k); // scal pominięcia z innych urządzeń
      saveSkips();
    }
    if (Array.isArray(cfg.exams) && cfg.exams.length) {
      // scal terminy z serwera (po id)
      const ids = new Set(exams.map(x => x.id));
      for (const ex of cfg.exams) if (!ids.has(ex.id)) exams.push(ex);
      localStorage.setItem(LS_EXAMS, JSON.stringify(exams));
    }
    const ri = await fetch("/api/info", { cache: "no-store" });
    if (ri.ok) serverInfo = await ri.json();
  } catch {
    serverMode = false;
  }
}

function syncBar(msg, isError) {
  const bar = document.getElementById("sync-bar");
  if (!msg) { bar.classList.add("hidden"); return; }
  bar.textContent = msg;
  bar.classList.toggle("error", !!isError);
  bar.classList.remove("hidden");
}

async function syncPlan(force) {
  if (!serverMode) return false;
  if (!usosUrl && !force) return false;
  syncBar("Synchronizuję plan z USOS…");
  try {
    const r = await fetch("/api/plan" + (force ? "?refresh=1" : ""), { cache: "no-store" });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error(err.error || ("HTTP " + r.status));
    }
    const parsed = parseICS(await r.text());
    if (!parsed.length) throw new Error("Plan jest pusty");
    events = parsed;
    saveEvents();
    renderAll();
    syncBar(`Plan zaktualizowany (${parsed.length} zajęć) · ${new Date().toLocaleTimeString("pl-PL")}`);
    setTimeout(() => syncBar(null), 5000);
    checkChanges();
    return true;
  } catch (ex) {
    syncBar("Synchronizacja nie wyszła: " + ex.message, true);
    setTimeout(() => syncBar(null), 8000);
    return false;
  }
}

async function pushConfig() {
  if (!serverMode) return null;
  try {
    const r = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usos_url: usosUrl,
        alarm_min: settings.alarmMin,
        alarm_on: settings.alarmOn,
        include_lectures: settings.lecturesCount,
        skip_limit: settings.skipLimit,
        skips: [...skips],
        exams,
      }),
    });
    return await r.json();
  } catch { return null; }
}

// ===================== Render: plan tygodnia =====================
function eventsInWeek(ws) {
  const we = addDays(ws, 7);
  return allEvents().filter(e => e.start >= ws && e.start < we);
}

function renderWeek() {
  const tt = document.getElementById("timetable");
  const weekEvents = eventsInWeek(weekStart);
  const hasAny = events.length > 0;

  document.getElementById("empty-state").classList.toggle("hidden", hasAny);
  document.getElementById("timetable-card").classList.toggle("hidden", !hasAny);

  const label = `${fmtDate(weekStart)} – ${fmtDate(addDays(weekStart, 6))} ${addDays(weekStart, 6).getFullYear()}`;
  document.getElementById("week-label").textContent = label;
  document.getElementById("tt-week-label").textContent = label;
  if (!hasAny) { tt.innerHTML = ""; return; }

  const showWeekend = weekEvents.some(e => e.start.getDay() === 0 || e.start.getDay() === 6);
  const nDays = showWeekend ? 7 : 5;

  let minH = 8, maxH = 16;
  for (const e of weekEvents) {
    minH = Math.min(minH, e.start.getHours());
    maxH = Math.max(maxH, e.end.getMinutes() > 0 ? e.end.getHours() + 1 : e.end.getHours());
  }
  minH = Math.max(6, minH);
  maxH = Math.min(22, Math.max(maxH, minH + 6));
  const totalH = (maxH - minH) * HOUR_PX;

  tt.style.gridTemplateColumns = `52px repeat(${nDays}, minmax(110px, 1fr))`;
  tt.innerHTML = "";

  const corner = document.createElement("div");
  corner.className = "tt-corner";
  tt.appendChild(corner);
  const today = new Date();
  for (let d = 0; d < nDays; d++) {
    const date = addDays(weekStart, d);
    const head = document.createElement("div");
    head.className = "tt-day-head" + (sameDay(date, today) ? " today" : "");
    head.innerHTML = `${DAYS_SHORT[d]}<span class="dom">${fmtDate(date)}</span>`;
    tt.appendChild(head);
  }

  const hoursCol = document.createElement("div");
  hoursCol.style.position = "relative";
  hoursCol.style.height = totalH + "px";
  hoursCol.style.borderRight = "2px solid var(--ink)";
  for (let h = minH; h <= maxH; h++) {
    const lab = document.createElement("div");
    lab.className = "tt-hour";
    lab.style.position = "absolute";
    lab.style.top = (h - minH) * HOUR_PX + "px";
    lab.style.right = "6px";
    lab.textContent = `${pad(h)}:00`;
    hoursCol.appendChild(lab);
  }
  tt.appendChild(hoursCol);

  for (let d = 0; d < nDays; d++) {
    const date = addDays(weekStart, d);
    const col = document.createElement("div");
    col.style.position = "relative";
    col.style.height = totalH + "px";
    col.style.borderRight = "1px solid rgba(24,22,20,0.25)";
    if (sameDay(date, today)) col.style.background = "rgba(255,210,63,0.18)";
    col.style.backgroundImage =
      `repeating-linear-gradient(to bottom, transparent 0, transparent ${HOUR_PX - 1}px, rgba(24,22,20,0.18) ${HOUR_PX - 1}px, rgba(24,22,20,0.18) ${HOUR_PX}px)`;

    const dayEvents = weekEvents
      .filter(e => sameDay(e.start, date))
      .sort((a, b) => a.start - b.start);

    const lanes = [];
    for (const e of dayEvents) {
      let lane = lanes.find(l => l[l.length - 1].end <= e.start);
      if (lane) lane.push(e); else lanes.push([e]);
      e._lane = lanes.indexOf(lane || lanes[lanes.length - 1]);
    }
    const nLanes = Math.max(1, lanes.length);

    for (const e of dayEvents) {
      const top = ((e.start.getHours() + e.start.getMinutes() / 60) - minH) * HOUR_PX;
      const height = Math.max(24, ((e.end - e.start) / 3600000) * HOUR_PX - 4);
      const lecture = isLecture(e);
      const skipped = isSkipped(e);
      const el = document.createElement("div");
      el.className = "tt-event" + (lecture ? " tt-lecture" : "") + (skipped ? " tt-skipped" : "");
      el.style.top = top + "px";
      el.style.height = height + "px";
      el.style.left = `calc(${(100 / nLanes) * e._lane}% + 3px)`;
      el.style.width = `calc(${100 / nLanes}% - 9px)`;
      const color = colorFor(e);
      if (lecture) {
        // wykład: paski zamiast pełnego koloru – widać, że to inna kategoria
        el.style.background =
          `repeating-linear-gradient(135deg, ${color}55 0, ${color}55 6px, var(--paper-2) 6px, var(--paper-2) 12px)`;
      } else {
        el.style.background = color;
      }
      el.title = `${e.summary}${lecture ? " (wykład – nieobowiązkowy)" : ""}\n${fmtTime(e.start)}–${fmtTime(e.end)}${e.location ? "\n" + e.location : ""}\n${skipped ? "Kliknij, żeby jednak iść" : "Kliknij, żeby pominąć"}`;
      el.style.cursor = "pointer";
      const skipBadge = typeOf(e) === "wf" ? `<span class="tt-makeup-badge">ODROBIĘ</span>` : `<span class="tt-skip-badge">POMIJAM</span>`;
      const topBadge = skipped ? skipBadge
        : e._exam ? `<span class="tt-skip-badge">EGZAMIN</span>`
        : lecture ? `<span class="tt-lecture-badge">WYKŁAD</span>` : "";
      el.innerHTML =
        topBadge +
        `<b>${escapeHtml(e.summary)}</b>` +
        `<span class="ev-meta">${fmtTime(e.start)}–${fmtTime(e.end)}${e.location ? " · " + escapeHtml(e.location) : ""}</span>`;
      el.onclick = () => e._exam ? removeExamPrompt(e) : toggleSkip(e);
      col.appendChild(el);
    }

    if (sameDay(date, today)) {
      const nowH = today.getHours() + today.getMinutes() / 60;
      if (nowH >= minH && nowH <= maxH) {
        const line = document.createElement("div");
        line.className = "now-line";
        line.style.top = (nowH - minH) * HOUR_PX + "px";
        line.style.left = "0";
        line.style.right = "0";
        col.appendChild(line);
      }
    }
    tt.appendChild(col);
  }

  // legenda typów zajęć (tylko te, które występują w tym tygodniu)
  const types = [...new Set(weekEvents.map(typeOf))];
  const order = Object.keys(TYPE_COLORS);
  types.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  document.getElementById("tt-legend").innerHTML = types.map(t =>
    `<span class="legend-item"><span class="legend-dot" style="background:${TYPE_COLORS[t]}"></span>${TYPE_LABELS[t]}</span>`
  ).join("");
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ===================== Widgety =====================
function nextWakeAlarm() {
  const now = new Date();
  const pool = activeEvents();
  for (let i = 0; i < 21; i++) {
    const day = addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate()), i);
    const first = pool.filter(e => sameDay(e.start, day)).sort((a, b) => a.start - b.start)[0];
    if (!first) continue;
    const t = new Date(first.start.getTime() - settings.alarmMin * 60000);
    if (t > now) return { time: t, firstClass: first };
  }
  return null;
}

function renderWidgets() {
  const now = new Date();

  // Następne zajęcia (bez wykładów, jeśli wyłączone)
  const next = activeEvents().filter(e => e.end > now).sort((a, b) => a.start - b.start)[0];
  const nextBody = document.getElementById("next-class-body");
  if (next) {
    const ongoing = next.start <= now;
    const target = ongoing ? next.end : next.start;
    const diff = target - now;
    const hh = Math.floor(diff / 3600000);
    const mm = Math.floor((diff % 3600000) / 60000);
    const ss = Math.floor((diff % 60000) / 1000);
    const cd = hh > 0 ? `${hh}h ${pad(mm)}m` : `${pad(mm)}:${pad(ss)}`;
    nextBody.innerHTML =
      `<p class="next-class-name">${escapeHtml(next.summary)}</p>` +
      `<p class="next-class-meta">${fmtDateLong(next.start)} · ${fmtTime(next.start)}–${fmtTime(next.end)}${next.location ? " · " + escapeHtml(next.location) : ""}</p>` +
      `<p class="countdown">${ongoing ? "koniec za " : "za "}${cd}</p>`;
  } else {
    nextBody.innerHTML = `<p class="muted">Brak nadchodzących zajęć.</p>`;
  }

  // Dzisiaj (wykłady widoczne, ale oznaczone)
  const todayEvents = allEvents().filter(e => sameDay(e.start, now)).sort((a, b) => a.start - b.start);
  document.getElementById("today-body").innerHTML = todayEvents.length
    ? todayEvents.map(e =>
        `<div class="today-item${e.end < now || isSkipped(e) ? " past" : ""}${isLecture(e) ? " lecture" : ""}">` +
        `<span class="today-time">${fmtTime(e.start)}</span><span>${escapeHtml(e.summary)}` +
        `${isSkipped(e) ? ` <span class="lecture-tag">${typeOf(e) === "wf" ? "odrobię" : "pomijam"}</span>` : (isLecture(e) && !settings.lecturesCount ? ` <span class="lecture-tag">nieobow.</span>` : "")}</span></div>`
      ).join("")
    : `<p class="muted">Dziś wolne.</p>`;

  // Pobudka
  const alarmBody = document.getElementById("alarm-body");
  const nextAlarm = nextWakeAlarm();
  if (nextAlarm) {
    alarmBody.innerHTML =
      `<p class="alarm-time-big">${fmtTime(nextAlarm.time)}</p>` +
      `<p class="muted small">${fmtDateLong(nextAlarm.time)} · pierwsze zajęcia: ${fmtTime(nextAlarm.firstClass.start)}</p>`;
  } else {
    alarmBody.innerHTML = `<p class="muted">Brak nadchodzących zajęć – śpij spokojnie.</p>`;
  }

  // Kiedy iść spać? (cykle snu po 90 min + 15 min na zaśnięcie)
  const sleepBody = document.getElementById("sleep-body");
  if (nextAlarm) {
    const wake = nextAlarm.time;
    const cycles = [
      { n: 6, label: "6 cykli · 9h" },
      { n: 5, label: "5 cykli · 7,5h" },
      { n: 4, label: "4 cykle · 6h" },
      { n: 3, label: "3 cykle · 4,5h" },
    ];
    const opts = cycles
      .map(c => ({ ...c, t: new Date(wake.getTime() - (c.n * 90 + 15) * 60000) }))
      .filter(c => c.t > now || sameDay(c.t, now) || true);
    sleepBody.innerHTML =
      `<p class="muted small" style="margin:0 0 6px">żeby wstać o ${fmtTime(wake)} wyspanym:</p>` +
      opts.map((c, i) =>
        `<div class="sleep-option${i === 1 ? " sleep-best" : ""}">` +
        `<span class="muted small">${c.label}</span><span class="sleep-time">${fmtTime(c.t)}</span></div>`
      ).join("");
  } else {
    sleepBody.innerHTML = `<p class="muted">Kiedy chcesz – nie masz zajęć.</p>`;
  }

  // Statystyki tygodnia (obowiązkowe; wykłady osobno)
  const weAll = eventsInWeek(startOfWeek(now));
  const we = settings.lecturesCount ? weAll : weAll.filter(e => !isLecture(e));
  const lectures = weAll.filter(isLecture).length;
  const total = we.reduce((s, e) => s + (e.end - e.start), 0) / 3600000;
  const subjects = new Set(we.map(e => e.summary)).size;
  const done = we.filter(e => e.end < now).length;
  // Kolokwia i egzaminy
  const upcoming = examEvents().filter(e => e.end > now).sort((a, b) => a.start - b.start);
  const examsBody = document.getElementById("exams-body");
  if (upcoming.length) {
    const first = upcoming[0];
    const diff = first.start - now;
    const days = Math.floor(diff / 86400000);
    const hrs = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const cd = days > 0 ? `${days} dni ${hrs}h` : (hrs > 0 ? `${hrs}h ${pad(mins)}m` : `${mins} min`);
    examsBody.innerHTML =
      `<p class="next-class-name">${escapeHtml(first.summary.replace(/^EGZ - /, ""))}</p>` +
      `<p class="next-class-meta">${fmtDateLong(first.start)} · ${fmtTime(first.start)}</p>` +
      `<p class="countdown countdown-exam">za ${cd}</p>` +
      upcoming.slice(1, 4).map(e =>
        `<div class="today-item"><span class="today-time">${fmtDate(e.start)}</span><span>${escapeHtml(e.summary.replace(/^EGZ - /, ""))}</span></div>`
      ).join("");
  } else {
    examsBody.innerHTML = `<p class="muted">Brak terminów. Dodaj w ustawieniach – odliczanie samo ruszy.</p>`;
  }

  const wfToMakeUp = events.filter(e => typeOf(e) === "wf" && isSkipped(e)).length;
  document.getElementById("stats-body").innerHTML =
    `<div class="stat-row"><span>Zajęcia</span><span class="stat-val">${done}/${we.length}</span></div>` +
    `<div class="stat-row"><span>Godziny</span><span class="stat-val">${total.toFixed(1)} h</span></div>` +
    `<div class="stat-row"><span>Przedmioty</span><span class="stat-val">${subjects}</span></div>` +
    (wfToMakeUp > 0
      ? `<div class="stat-row"><span>WF do odrobienia</span><span class="stat-val">${wfToMakeUp}/${settings.wfLimit}</span></div>`
      : (settings.lecturesCount
        ? `<div class="stat-row"><span>Do domu zostało</span><span class="stat-val">${we.length - done}</span></div>`
        : `<div class="stat-row"><span>Wykłady (nieobow.)</span><span class="stat-val">${lectures}</span></div>`));
}

// ===================== Tryb nauki (Pomodoro) =====================
const LS_STUDY = "planusos.study";
const study = { running: false, mode: "praca", left: 25 * 60, workMin: 25, breakMin: 5 };

function studyLog() {
  try { return JSON.parse(localStorage.getItem(LS_STUDY) || "[]"); }
  catch { return []; }
}
function logStudySession(min) {
  const log = studyLog();
  const subject = document.getElementById("study-subject").value.trim() || "nauka";
  log.push({ d: new Date().toISOString().slice(0, 10), min, subject });
  localStorage.setItem(LS_STUDY, JSON.stringify(log.slice(-500)));
}
function studyStatsText() {
  const log = studyLog();
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = addDays(new Date(), -7);
  const todayMin = log.filter(s => s.d === today).reduce((a, s) => a + s.min, 0);
  const weekMin = log.filter(s => new Date(s.d) >= weekAgo).reduce((a, s) => a + s.min, 0);
  return `dziś: ${todayMin} min · 7 dni: ${(weekMin / 60).toFixed(1)} h`;
}

function beepShort(times) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  for (let i = 0; i < times; i++) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 660;
    const t = ctx.currentTime + i * 0.35;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.32);
  }
  setTimeout(() => ctx.close().catch(() => {}), times * 400 + 500);
}

function updateStudyUI() {
  const mm = Math.floor(study.left / 60);
  const ss = study.left % 60;
  document.getElementById("study-display").textContent = `${pad(mm)}:${pad(ss)}`;
  document.getElementById("study-mode").textContent =
    study.mode === "praca" ? "SKUPIENIE" : "PRZERWA";
  document.getElementById("study-mode").className =
    "study-mode " + (study.mode === "praca" ? "study-work" : "study-break");
  document.getElementById("btn-study-start").textContent = study.running ? "Pauza" : "Start";
  document.getElementById("study-stats").textContent = studyStatsText();
}

function studyTick() {
  if (!study.running) return;
  study.left--;
  if (study.left <= 0) {
    if (study.mode === "praca") {
      logStudySession(study.workMin);
      notify("Pomodoro zaliczone!", `${study.workMin} min nauki w banku. Teraz ${study.breakMin} min przerwy.`);
      study.mode = "przerwa";
      study.left = study.breakMin * 60;
    } else {
      notify("Koniec przerwy", "Wracamy do nauki.");
      study.mode = "praca";
      study.left = study.workMin * 60;
    }
    beepShort(3);
  }
  updateStudyUI();
}

function fillSubjectList() {
  const base = new Set();
  for (const e of allEvents()) base.add(e.summary.replace(/^[A-ZĆŁŚŻŹ]+\s*-\s*/i, ""));
  document.getElementById("subject-list").innerHTML =
    [...base].map(s => `<option value="${escapeHtml(s)}"></option>`).join("");
}

// ===================== Zmiany planu =====================
const LS_CHANGES_SEEN = "planusos.changesSeen";

async function checkChanges() {
  if (!serverMode) return;
  try {
    const r = await fetch("/api/changes", { cache: "no-store" });
    if (!r.ok) return;
    const { batches } = await r.json();
    if (!batches.length) return;
    const seen = localStorage.getItem(LS_CHANGES_SEEN) || "";
    const fresh = batches.filter(b => b.ts > seen);
    if (!fresh.length) return;
    const items = fresh.flatMap(b => b.items);
    const banner = document.getElementById("changes-banner");
    banner.innerHTML =
      `<b>Plan się zmienił!</b> ` +
      items.slice(0, 6).map(i =>
        `<span class="change-item">[${i.type}] ${escapeHtml(i.summary)} – ${i.when}${i.detail ? " (" + escapeHtml(i.detail) + ")" : ""}</span>`
      ).join(" ") +
      (items.length > 6 ? ` i ${items.length - 6} więcej…` : "") +
      ` <button class="btn btn-mini" id="btn-changes-ok">OK, widzę</button>`;
    banner.classList.remove("hidden");
    document.getElementById("btn-changes-ok").onclick = () => {
      localStorage.setItem(LS_CHANGES_SEEN, batches[batches.length - 1].ts);
      banner.classList.add("hidden");
    };
    notify("Plan się zmienił!", items.map(i => `[${i.type}] ${i.summary}`).slice(0, 3).join(", "));
  } catch { /* offline */ }
}

// ===================== Przypomnienia i alarm w aplikacji =====================
function notifStatusText() {
  if (!("Notification" in window)) return "Ta przeglądarka nie wspiera powiadomień.";
  if (Notification.permission === "granted") return "Powiadomienia włączone.";
  if (Notification.permission === "denied") return "Powiadomienia zablokowane w przeglądarce.";
  return "Kliknij przycisk powyżej, aby zezwolić.";
}

function notify(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    try { new Notification(title, { body, icon: "icons/icon-192.png" }); } catch { /* iOS bez SW */ }
  }
  toast(`${title} – ${body}`);
}

function tick() {
  const now = new Date();

  if (settings.remindersOn) {
    for (const e of activeEvents()) {
      const diffMin = (e.start - now) / 60000;
      const key = e.summary + e.start.toISOString();
      if (diffMin > 0 && diffMin <= settings.reminderMin && !notified.has(key)) {
        notified.add(key);
        notify(`Za ${Math.ceil(diffMin)} min: ${e.summary}`,
          `${fmtTime(e.start)}–${fmtTime(e.end)}${e.location ? " · " + e.location : ""}`);
      }
    }
  }

  if (settings.alarmOn) {
    const a = nextWakeAlarm();
    if (a) {
      const key = a.time.toISOString();
      if (Math.abs(a.time - now) < 30000 && !firedAlarms.has(key)) {
        firedAlarms.add(key);
        fireAlarm(a);
      }
    }
  }

  renderWidgets();
}

function fireAlarm(a) {
  document.getElementById("alarm-overlay-text").textContent =
    `Pierwsze zajęcia: ${a.firstClass.summary} o ${fmtTime(a.firstClass.start)}`;
  document.getElementById("alarm-overlay").classList.remove("hidden");
  notify("POBUDKA!", `Zajęcia o ${fmtTime(a.firstClass.start)}: ${a.firstClass.summary}`);
  startAlarmSound();
}

function startAlarmSound() {
  stopAlarmSound();
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  alarmAudio = { ctx, interval: null };
  const beep = () => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "square";
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.5);
  };
  beep();
  alarmAudio.interval = setInterval(beep, 700);
}

function stopAlarmSound() {
  if (alarmAudio) {
    clearInterval(alarmAudio.interval);
    alarmAudio.ctx.close().catch(() => {});
    alarmAudio = null;
  }
}

// ===================== Eksport PNG =====================
async function exportPng() {
  if (!events.length) { toast("Najpierw połącz plan."); return; }
  const card = document.getElementById("timetable-card");
  toast("Generuję PNG…");
  try {
    const canvas = await html2canvas(card, { backgroundColor: "#faf7f0", scale: 2, useCORS: true });
    const a = document.createElement("a");
    const label = document.getElementById("week-label").textContent.replace(/[^\w\d-]+/g, "_");
    a.download = `plan_${label}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
    toast("Pobrano plan jako PNG.");
  } catch (err) {
    console.error(err);
    toast("Nie udało się wygenerować PNG: " + err.message);
  }
}

// ===================== Plan demo =====================
function loadDemo() {
  const ws = startOfWeek(new Date());
  const mk = (day, h1, m1, h2, m2, summary, location) => {
    const s = addDays(ws, day); s.setHours(h1, m1, 0, 0);
    const e = addDays(ws, day); e.setHours(h2, m2, 0, 0);
    return { start: s, end: e, summary, location };
  };
  const week = [
    mk(0, 8, 0, 9, 30, "Analiza matematyczna (wykład)", "Aula A-1"),
    mk(0, 9, 45, 11, 15, "Analiza matematyczna (ćwiczenia)", "s. 203"),
    mk(0, 13, 15, 14, 45, "Programowanie w C++ (laboratorium)", "lab. 105"),
    mk(1, 9, 45, 11, 15, "Algebra liniowa (wykład)", "Aula B-2"),
    mk(1, 11, 30, 13, 0, "Język angielski (lektorat)", "s. 314"),
    mk(1, 15, 0, 16, 30, "Fizyka (wykład)", "Aula A-3"),
    mk(2, 8, 0, 9, 30, "Programowanie w C++ (wykład)", "Aula C-1"),
    mk(2, 11, 30, 13, 0, "Algebra liniowa (ćwiczenia)", "s. 118"),
    mk(3, 9, 45, 11, 15, "Logika i teoria mnogości (wykład)", "Aula B-1"),
    mk(3, 11, 30, 13, 0, "Logika i teoria mnogości (ćwiczenia)", "s. 221"),
    mk(3, 14, 0, 15, 30, "Fizyka (laboratorium)", "lab. 012"),
    mk(4, 10, 0, 11, 30, "Wstęp do informatyki (wykład)", "Aula A-2"),
    mk(4, 11, 45, 13, 15, "Wychowanie fizyczne", "Hala sportowa"),
  ];
  events = [];
  for (let w = 0; w < 4; w++) {
    for (const e of week) {
      events.push({ ...e, start: addDays(e.start, w * 7), end: addDays(e.end, w * 7) });
    }
  }
  saveEvents();
  weekStart = startOfWeek(new Date());
  renderAll();
  toast("Wczytano plan demo.");
}

// ===================== Import pliku (fallback) =====================
function importIcsText(text) {
  const parsed = parseICS(text);
  if (!parsed.length) {
    toast("Nie znaleziono zajęć w pliku. Czy to plik iCal z USOS?");
    return;
  }
  events = parsed;
  saveEvents();
  weekStart = startOfWeek(new Date());
  renderAll();
  toast(`Zaimportowano ${parsed.length} zajęć.`);
}

function handleFile(file) {
  const reader = new FileReader();
  reader.onload = () => importIcsText(String(reader.result));
  reader.readAsText(file, "utf-8");
}

// ===================== Webcal =====================
function webcalBase() {
  const host = serverInfo && serverInfo.lan_ip && !["localhost", "127.0.0.1"].includes(location.hostname)
    ? location.host
    : (serverInfo ? `${serverInfo.lan_ip}:${serverInfo.port}` : location.host);
  return `webcal://${host}`;
}

function wakeUrl() {
  const host = serverInfo && ["localhost", "127.0.0.1"].includes(location.hostname)
    ? `${serverInfo.lan_ip}:${serverInfo.port}`
    : location.host;
  return `http://${host}/api/wake-tomorrow`;
}

function refreshWebcalUi() {
  const wake = document.getElementById("link-webcal-wake");
  const plan = document.getElementById("link-webcal-plan");
  const hint = document.getElementById("webcal-hint");
  const base = webcalBase();
  wake.href = `${base}/pobudki.ics`;
  plan.href = `${base}/plan.ics`;
  document.getElementById("wake-url").textContent = wakeUrl();
  if (!serverMode) {
    hint.textContent = "Uruchom aplikację przez server.py, żeby subskrypcja działała.";
  } else if (["localhost", "127.0.0.1"].includes(location.hostname)) {
    hint.textContent = `Na telefonie otwórz: http://${serverInfo.lan_ip}:${serverInfo.port} (to samo Wi-Fi) i stuknij „Subskrybuj pobudki”.`;
  } else {
    hint.textContent = "Stuknij przycisk – telefon doda kalendarz z pobudkami.";
  }
}

// ===================== UI =====================
let toastTimer = null;
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add("hidden"), 4000);
}

function renderAll() {
  renderWeek();
  renderWidgets();
  fillSubjectList();
}

function renderExamList() {
  const box = document.getElementById("exam-list");
  if (!exams.length) { box.innerHTML = `<p class="muted small">Brak dodanych terminów.</p>`; return; }
  box.innerHTML = [...exams]
    .sort((a, b) => a.start.localeCompare(b.start))
    .map(ex =>
      `<div class="exam-row"><span><b>${escapeHtml(ex.summary)}</b> · ${ex.start.replace("T", " ")}</span>` +
      `<button class="btn btn-mini btn-danger" data-exam="${ex.id}">Usuń</button></div>`
    ).join("");
  box.querySelectorAll("[data-exam]").forEach(btn => {
    btn.onclick = () => {
      exams = exams.filter(x => String(x.id) !== btn.dataset.exam);
      saveExams();
      renderExamList();
      renderAll();
    };
  });
}

function openSettings() {
  const $ = id => document.getElementById(id);
  $("set-usos-url").value = usosUrl;
  $("set-reminders").checked = settings.remindersOn;
  $("set-reminder-min").value = settings.reminderMin;
  $("set-alarm").checked = settings.alarmOn;
  $("set-alarm-min").value = settings.alarmMin;
  $("set-lectures").checked = !settings.lecturesCount;
  $("set-skip-limit").value = settings.skipLimit;
  $("set-wf-limit").value = settings.wfLimit;
  $("notif-status").textContent = notifStatusText();
  renderExamList();
  $("sync-status").textContent = serverMode
    ? (usosUrl ? "Połączono – plan synchronizuje się automatycznie." : "Wklej link i kliknij „Zapisz i synchronizuj”.")
    : "Uwaga: uruchom przez server.py (python server.py), żeby auto-synchronizacja działała.";
  refreshWebcalUi();
  document.getElementById("dlg-settings").showModal();
}

async function saveSettingsFromDialog() {
  const $ = id => document.getElementById(id);
  usosUrl = $("set-usos-url").value.trim();
  settings.remindersOn = $("set-reminders").checked;
  settings.reminderMin = Math.max(1, +$("set-reminder-min").value || 15);
  settings.alarmOn = $("set-alarm").checked;
  settings.alarmMin = Math.max(10, +$("set-alarm-min").value || 90);
  settings.lecturesCount = !$("set-lectures").checked;
  settings.skipLimit = Math.max(0, +$("set-skip-limit").value || 2);
  settings.wfLimit = Math.max(0, +$("set-wf-limit").value || 5);
  saveSettings();
  document.getElementById("dlg-settings").close();

  if (serverMode) {
    const res = await pushConfig();
    if (res && res.sync_error) {
      toast("Zapisano, ale USOS nie odpowiada: " + res.sync_error);
    } else {
      toast("Zapisano.");
    }
    if (usosUrl) await syncPlan(true);
  } else {
    toast("Zapisano (tryb bez serwera – brak auto-synchronizacji).");
  }
  renderWidgets();
}

function bindUi() {
  const $ = id => document.getElementById(id);

  $("btn-prev-week").onclick = () => { weekStart = addDays(weekStart, -7); renderWeek(); };
  $("btn-next-week").onclick = () => { weekStart = addDays(weekStart, 7); renderWeek(); };
  $("btn-this-week").onclick = () => { weekStart = startOfWeek(new Date()); renderWeek(); };

  $("btn-png").onclick = exportPng;
  $("btn-sync").onclick = () => {
    if (!serverMode) { toast("Uruchom przez server.py, żeby synchronizować."); return; }
    if (!usosUrl) { openSettings(); return; }
    syncPlan(true);
  };

  $("btn-settings").onclick = openSettings;
  $("btn-connect").onclick = openSettings;
  $("btn-demo").onclick = loadDemo;
  $("btn-settings-save").onclick = saveSettingsFromDialog;
  $("btn-settings-close").onclick = () => $("dlg-settings").close();

  $("file-input").onchange = ev => { if (ev.target.files[0]) handleFile(ev.target.files[0]); };
  const drop = $("file-drop");
  drop.addEventListener("dragover", e => { e.preventDefault(); drop.classList.add("dragover"); });
  drop.addEventListener("dragleave", () => drop.classList.remove("dragover"));
  drop.addEventListener("drop", e => {
    e.preventDefault();
    drop.classList.remove("dragover");
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });

  $("btn-notif-perm").onclick = async () => {
    if ("Notification" in window) await Notification.requestPermission();
    $("notif-status").textContent = notifStatusText();
  };

  $("btn-copy-wake-url").onclick = () => {
    const link = wakeUrl();
    const tmp = document.createElement("textarea");
    tmp.value = link;
    document.body.appendChild(tmp);
    tmp.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    tmp.remove();
    if (!ok && navigator.clipboard) navigator.clipboard.writeText(link).catch(() => {});
    toast("Skopiowano adres dla Skrótów: " + link);
  };

  $("btn-copy-webcal").onclick = () => {
    const link = `${webcalBase()}/pobudki.ics`;
    const input = $("webcal-link-out");
    input.value = link;
    input.classList.remove("hidden");
    input.focus();
    input.select();
    let ok = false;
    // navigator.clipboard działa tylko na https/localhost – stąd fallback
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    if (!ok && navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => toast("Skopiowano link.")).catch(() => {});
      return;
    }
    toast(ok ? "Skopiowano link." : "Skopiuj link z pola powyżej (Ctrl+C).");
  };

  $("btn-clear").onclick = () => {
    events = [];
    localStorage.removeItem(LS_EVENTS);
    $("dlg-settings").close();
    renderAll();
    toast("Usunięto plan.");
  };

  $("btn-alarm-stop").onclick = () => {
    stopAlarmSound();
    $("alarm-overlay").classList.add("hidden");
  };

  // kolokwia / egzaminy
  $("btn-exam-add").onclick = () => {
    const name = $("exam-name").value.trim();
    const when = $("exam-when").value;
    if (!name || !when) { toast("Podaj nazwę i termin."); return; }
    exams.push({ id: Date.now(), summary: name, start: when, durationMin: Math.max(15, +$("exam-dur").value || 90) });
    saveExams();
    $("exam-name").value = "";
    $("exam-when").value = "";
    renderExamList();
    renderAll();
    toast("Dodano termin – odliczanie ruszyło, budzik go pilnuje.");
  };

  // tryb nauki
  $("btn-study-start").onclick = () => {
    study.running = !study.running;
    updateStudyUI();
  };
  $("btn-study-reset").onclick = () => {
    study.running = false;
    study.mode = "praca";
    study.left = study.workMin * 60;
    updateStudyUI();
  };
}

async function init() {
  loadSettings();
  loadEvents();
  loadSkips();
  loadExams();
  bindUi();
  renderAll();
  updateStudyUI();

  await initServer();
  if (serverMode && usosUrl) await syncPlan(true);
  checkChanges();

  setInterval(tick, 1000);
  setInterval(studyTick, 1000);
  setInterval(renderWeek, 60000);
  // dosynchronizuj co 30 minut, jeśli karta otwarta
  setInterval(() => { if (serverMode && usosUrl) syncPlan(true); }, 30 * 60000);

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

init();
