/* Zeitreise aus dem Entdeckerbuch: Tagesabhängige Zwischenstände (Stempel, Schneemann,
   Briefkasten …) liegen während der Reise in einem frischen Zwischenspeicher, damit sich
   alles wiederholen lässt und die echten Daten unberührt bleiben. */
(function () {
  "use strict";
  let reise = null;
  try { reise = JSON.parse(sessionStorage.getItem("toni-zeitreise") || "null"); } catch (_) { return; }
  if (!reise) return;
  const SCHATTEN = /^toni-(wz-|schneemann-|goldflocken-|plaetzchen-|briefkasten-|aufbau-|postkarte-|schnee-|vorfreude-)/;
  const P = Storage.prototype, hol = P.getItem, setz = P.setItem, weg = P.removeItem;
  let lokal = null;
  try { lokal = window.localStorage; } catch (_) { return; }
  const umleiten = (s, k) => s === lokal && SCHATTEN.test(String(k));
  P.getItem = function (k) { return umleiten(this, k) ? hol.call(sessionStorage, "zr:" + k) : hol.call(this, k); };
  P.setItem = function (k, v) { return umleiten(this, k) ? setz.call(sessionStorage, "zr:" + k, v) : setz.call(this, k, v); };
  P.removeItem = function (k) { return umleiten(this, k) ? weg.call(sessionStorage, "zr:" + k) : weg.call(this, k); };
})();

(function () {
  "use strict";

  const ZEITZONE = "Europe/Berlin";
  const SPEICHER_SCHLUESSEL = "toni-advent-geoeffnet-" + KALENDER.jahr;
  const bewegungReduziert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const el = {
    titel: document.getElementById("titel"),
    untertitel: document.getElementById("untertitel"),
    status: document.getElementById("status"),
    kalender: document.getElementById("kalender"),
    toast: document.getElementById("toast"),
    dialog: document.getElementById("dialog"),
    dialogTag: document.getElementById("dialog-tag"),
    dialogTitel: document.getElementById("dialog-titel"),
    dialogBild: document.getElementById("dialog-bild"),
    dialogText: document.getElementById("dialog-text"),
    dialogHinweis: document.getElementById("dialog-hinweis"),
    dialogHinweisText: document.getElementById("dialog-hinweis-text"),
    dialogBrief: document.getElementById("dialog-brief"),
    dialogBriefZahl: document.getElementById("dialog-brief-zahl"),
    dialogPaeckchen: document.getElementById("dialog-paeckchen"),
    dialogPaeckchenZahl: document.getElementById("dialog-paeckchen-zahl"),
    regen: document.getElementById("konfetti-regen"),
  };

  /* ------------------------------------------------------------
   * Zeit
   * Die Uhrzeit wird – wenn möglich – vom Webserver geholt
   * (HTTP-"Date"-Header). So bringt es nichts, die Uhr am
   * Handy oder Laptop vorzustellen. Nur wenn der Server nicht
   * erreichbar ist (offline), wird die Geräteuhr verwendet.
   * ------------------------------------------------------------ */
  let basisMs = Date.now();
  let basisPerf = performance.now();
  let zeitBereit = false;

  function jetzt() {
    return basisMs + (performance.now() - basisPerf);
  }

  function istLokaleVorschau() {
    const h = location.hostname;
    return location.protocol === "file:" || h === "localhost" || h === "127.0.0.1" || h === "";
  }

  // Nur lokal zum Testen: index.html?testdatum=2026-12-05
  function testdatum() {
    if (!istLokaleVorschau()) return null;
    const wert = new URLSearchParams(location.search).get("testdatum");
    const m = wert && /^(\d{4})-(\d{2})-(\d{2})$/.exec(wert);
    if (!m) return null;
    // Uhrzeit in UTC (deutsche Winterzeit = UTC + 1), z. B. &zeit=morgen
    const param = new URLSearchParams(location.search);
    const zeit = param.has("abend") ? "abend" : param.get("zeit");
    const uhr = /^(\d{1,2}):(\d{2})$/.exec(zeit || "");
    const stunde = uhr
      ? +uhr[1] - 1 + +uhr[2] / 60
      : { morgen: 6.5, vormittag: 9, mittag: 12, nachmittag: 14, abend: 18, nacht: 22 }[zeit];
    const utc = stunde === undefined ? 11 : stunde;
    return Date.UTC(+m[1], +m[2] - 1, +m[3], 0, Math.round(utc * 60), 0);
  }

  async function holeServerzeit() {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const antwort = await fetch(location.href.split("#")[0], {
        method: "HEAD",
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timer);
      const datum = antwort.headers.get("Date");
      const ms = datum ? Date.parse(datum) : NaN;
      return Number.isNaN(ms) ? null : ms;
    } catch (_) {
      return null;
    }
  }

  // Zeitreise aus dem Entdeckerbuch (erst ab dem 27.12.): die Seite zeigt einen früheren Zeitpunkt
  const ZEITREISE_AB = Date.UTC(KALENDER.jahr, 11, 26, 23, 0, 0);
  let zeitreise = null, zeitreiseAn = false, echtMs = null, echtPerf = 0;
  try { zeitreise = JSON.parse(sessionStorage.getItem("toni-zeitreise") || "null"); } catch (_) { zeitreise = null; }
  const echtJetzt = () => (echtMs === null ? null : echtMs + (performance.now() - echtPerf));
  function raeumeZeitreiseAuf() {
    try {
      sessionStorage.removeItem("toni-zeitreise");
      Object.keys(sessionStorage).filter((k) => k.indexOf("zr:") === 0).forEach((k) => sessionStorage.removeItem(k));
    } catch (_) { /* egal */ }
  }

  async function synchronisiereZeit() {
    const test = testdatum();
    const echt = test !== null ? test : await holeServerzeit();
    if (echt !== null) { echtMs = echt; echtPerf = performance.now(); }
    if (zeitreiseAn) return;
    if (zeitreise && echt !== null) {
      if (echt >= ZEITREISE_AB && typeof zeitreise.ziel === "number" && zeitreise.ziel <= echt) {
        basisMs = zeitreise.ziel;
        basisPerf = performance.now();
        zeitreiseAn = true;
        document.documentElement.classList.add("zeitreise");
        return;
      }
      zeitreise = null;
      raeumeZeitreiseAuf();
    }
    if (echt !== null) {
      basisMs = echt;
      basisPerf = performance.now();
    } else if (!zeitBereit) {
      basisMs = Date.now();
      basisPerf = performance.now();
    }
  }

  const datumsFormat = new Intl.DateTimeFormat("de-DE", {
    timeZone: ZEITZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  });

  function berlinDatum(ms) {
    const teile = {};
    for (const t of datumsFormat.formatToParts(new Date(ms))) teile[t.type] = t.value;
    return {
      jahr: +teile.year,
      monat: +teile.month,
      tag: +teile.day,
      stunde: +teile.hour,
      minute: +teile.minute,
      sekunde: +teile.second,
    };
  }

  // Neue Türchen öffnen sich jeden Tag um 4:00 Uhr nachts (deutsche Zeit).
  // Dafür zählt der „Kalendertag“ erst ab 4 Uhr als neuer Tag.
  const FREISCHALT_STUNDE = 4;
  function kalenderDatum() {
    return berlinDatum(jetzt() - FREISCHALT_STUNDE * 3600000);
  }

  // Ist Türchen n (1 bis 24) an diesem Kalendertag schon offen?
  function istVerfuegbar(n, d) {
    if (d.jahr > KALENDER.jahr) return true;
    if (d.jahr < KALENDER.jahr) return false;
    return d.monat === 12 && d.tag >= n;
  }

  // Tage zwischen dem heutigen Datum (Berlin) und dem n. Dezember
  function tageBis(n, d) {
    const heute = Date.UTC(d.jahr, d.monat - 1, d.tag);
    const ziel = Date.UTC(KALENDER.jahr, 11, n);
    return Math.round((ziel - heute) / 86400000);
  }

  /* ------------------------------------------------------------
   * Speicher (welche Türchen wurden schon geöffnet?)
   * ------------------------------------------------------------ */
  function ladeGeoeffnet() {
    try {
      const roh = localStorage.getItem(SPEICHER_SCHLUESSEL);
      const liste = roh ? JSON.parse(roh) : [];
      return new Set(Array.isArray(liste) ? liste : []);
    } catch (_) {
      return new Set();
    }
  }
  function speichereGeoeffnet(menge) {
    try {
      localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify([...menge]));
    } catch (_) { /* egal – dann eben ohne Merken */ }
  }
  const geoeffnet = ladeGeoeffnet();

  /* ------------------------------------------------------------
   * Durcheinander, aber immer gleiche Reihenfolge
   * ------------------------------------------------------------ */
  function zufall(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gemischteTage() {
    const tage = Array.from({ length: 24 }, (_, i) => i + 1);
    const rnd = zufall(2412);
    for (let i = tage.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [tage[i], tage[j]] = [tage[j], tage[i]];
    }
    return tage;
  }

  /* ------------------------------------------------------------
   * Aufbau
   * ------------------------------------------------------------ */
  const tueren = new Map();
  // Ein paar Päckchen sind größer, breiter oder höher (wie bei einem echten Kalender)
  const PAECKCHEN_FORM = { 24: "gross", 1: "gross", 6: "breit", 13: "breit", 21: "breit", 4: "hoch", 17: "hoch", 20: "hoch" };
  const SCHLEIFE =
    '<svg viewBox="0 0 60 40" fill="currentColor" aria-hidden="true">' +
    '<path d="M30 20C21 6 6 3 4 12s12 14 26 8z"/><path d="M30 20c9-14 24-17 26-8s-12 14-26 8z"/>' +
    '<path d="M26.5 22 19 38l6-2 3 4.5 2-18z"/><path d="M33.5 22 41 38l-6-2-3 4.5-2-18z"/>' +
    '<path d="M30 20C23 10 12 7 9 12" fill="none" stroke="rgba(0,0,0,.15)" stroke-width="1.5"/>' +
    '<path d="M30 20c7-10 18-13 21-8" fill="none" stroke="rgba(0,0,0,.15)" stroke-width="1.5"/>' +
    '<circle cx="30" cy="20" r="5.5"/><circle cx="30" cy="20" r="5.5" fill="rgba(0,0,0,.12)"/></svg>';

  /* Türchen, Gutscheine und Geburtstagsbrief sind in inhalte.js verschlüsselt
     und werden erst lesbar, wenn ihr Tag laut Serverzeit erreicht ist */
  const SALZ = "yIoWXKkgI0-b";
  function schluesselStrom(text) {
    let h = 1779033703 ^ text.length;
    for (let i = 0; i < text.length; i++) { h = Math.imul(h ^ text.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    const naechster = () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^= h >>> 16) >>> 0; };
    let a = naechster(), b = naechster(), c = naechster(), d = naechster();
    return () => {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
      let t = (a + b) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); d = (d + 1) | 0; t = (t + d) | 0; c = (c + t) | 0;
      return (t >>> 0) / 4294967296;
    };
  }
  function entschluessle(text, id) {
    try {
      const roh = atob(text);
      const bytes = new Uint8Array(roh.length);
      const r = schluesselStrom(SALZ + "|" + id);
      for (let i = 0; i < roh.length; i++) bytes[i] = roh.charCodeAt(i) ^ ((r() * 256) | 0);
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch (_) { return {}; }
  }
  // Fotos liegen als WebP vor (kleiner), in inhalte.js stehen weiter die .jpg Namen
  const webp = (datei) => String(datei).replace(/\.jpe?g$/i, ".webp");
  const inhaltCache = new Map();
  function inhalt(n) {
    const roh = KALENDER.tage && KALENDER.tage[n];
    if (!roh) return {};
    if (typeof roh === "object") return roh;
    if (!zeitBereit || !istVerfuegbar(n, kalenderDatum())) return {};
    if (!inhaltCache.has(n)) inhaltCache.set(n, entschluessle(roh, "tag-" + n));
    return inhaltCache.get(n);
  }
  // Gutschein erst am Tag des Eis lesbar machen
  function entpackeEi(ei) {
    if (ei && ei.geheim && zeitBereit && istVerfuegbar(ei.ab || 1, kalenderDatum())) {
      Object.assign(ei, entschluessle(ei.geheim, "ei-" + (ei.ab || 1)));
      delete ei.geheim;
    }
    return ei;
  }
  // Geburtstagsgruß und Brief ab dem Geburtstag (deutsche Zeit)
  function geburtstagsDaten() {
    const g = KALENDER.geburtstag;
    if (!g) return null;
    if (g.geheim && zeitBereit) {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(g.datum || "");
      const d = berlinDatum(jetzt());
      const heute = d.jahr * 10000 + d.monat * 100 + d.tag;
      if (m && heute >= +m[1] * 10000 + +m[2] * 100 + +m[3]) {
        Object.assign(g, entschluessle(g.geheim, "geburtstag"));
        delete g.geheim;
      }
    }
    return g;
  }

  function baueKalender() {
    // Das Herz im Titel bekommt ein eigenes Element, damit man es antippen kann
    const titelText = KALENDER.titel || "Adventskalender";
    const herzStelle = titelText.lastIndexOf("♥");
    el.titel.textContent = "";
    if (herzStelle >= 0) {
      el.titel.append(titelText.slice(0, herzStelle));
      const herz = document.createElement("button");
      herz.type = "button";
      herz.className = "titel-herz";
      herz.setAttribute("aria-label", "Herz antippen");
      herz.innerHTML = '<svg class="titel-herz-svg" viewBox="0 0 32 29" aria-hidden="true"><use href="#i-herz"/></svg>';
      el.titel.appendChild(herz);
    } else {
      el.titel.textContent = titelText;
    }
    document.title = KALENDER.titel || "Adventskalender";
    el.untertitel.textContent = KALENDER.untertitel || "";

    gemischteTage().forEach((n, platz) => {
      const knopf = document.createElement("button");
      knopf.type = "button";
      // Geschenkpapier fest am Päckchen, nicht am Platz im Regal
      knopf.className = "tuer gesperrt papier-" + ((platz % 4) + 1) + (PAECKCHEN_FORM[n] ? " " + PAECKCHEN_FORM[n] : "");
      knopf.dataset.tag = String(n);

      const innen = document.createElement("span");
      innen.className = "tuer-innen";

      const blatt = document.createElement("span");
      blatt.className = "tuer-blatt";
      blatt.innerHTML =
        '<span class="band-v"></span><span class="band-h"></span>' +
        '<span class="schleife">' + SCHLEIFE + "</span>";
      const anhaenger = document.createElement("span");
      anhaenger.className = "anhaenger";
      const nummer = document.createElement("span");
      nummer.className = "nummer";
      nummer.textContent = String(n);
      anhaenger.appendChild(nummer);
      const schloss = document.createElement("span");
      schloss.className = "schloss";
      schloss.setAttribute("aria-hidden", "true");
      schloss.innerHTML = '<svg class="ui-icon"><use href="#i-schloss"/></svg>';
      anhaenger.appendChild(schloss);
      blatt.append(anhaenger);

      const rueck = document.createElement("span");
      rueck.className = "tuer-rueck";
      rueck.setAttribute("aria-hidden", "true");
      knopf.append(innen, rueck, blatt);
      knopf.addEventListener("click", (e) => klickAufTuer(n, e));
      el.kalender.appendChild(knopf);
      tueren.set(n, { knopf, innen, schloss });
    });
  }

  // Kleine Illustrationen im geöffneten Türchen
  const INNEN_ICONS = [
    '<rect x="15" y="16" width="10" height="18" rx="2" fill="#fff6e0" stroke="#d4a84b" stroke-width="1"/><rect x="15" y="16" width="10" height="4" fill="#f7809b"/><path d="M20 6c3 4 3 7 0 9-3-2-3-5 0-9z" fill="#ffb648"/><path d="M20 10c1.4 2 1.4 3.4 0 4.4-1.4-1-1.4-2.4 0-4.4z" fill="#fff2b0"/><ellipse cx="20" cy="35" rx="9" ry="2.5" fill="#d4a84b"/>',
    '<path d="M20 5l4.4 9.2 10 1.3-7.3 6.9 1.8 9.9L20 27.5l-8.9 4.8 1.8-9.9-7.3-6.9 10-1.3z" fill="#f3c84b" stroke="#c99a2e" stroke-width="1"/><circle cx="16.5" cy="16" r="1.6" fill="#fff" opacity=".7"/>',
    '<path d="M10 16h18v10a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8z" fill="#9d2449"/><path d="M28 19h3a4 4 0 0 1 0 8h-3" fill="none" stroke="#9d2449" stroke-width="2.6"/><path d="M14 10c-2-3 2-4 0-7M19 10c-2-3 2-4 0-7M24 10c-2-3 2-4 0-7" fill="none" stroke="#fda4b8" stroke-width="1.6" stroke-linecap="round"/><path d="M19 21.5c-1.6-2.4-4.6-.6-3 1.6l3 2.9 3-2.9c1.6-2.2-1.4-4-3-1.6z" fill="#ffd0dc"/>',
    '<g stroke="#5aa9dd" stroke-width="2.4" stroke-linecap="round"><path d="M20 5v30M7 12.5l26 15M7 27.5l26-15"/><path d="M16 8l4 3 4-3M16 32l4-3 4 3M8.5 17l4.4.6 1.2-4.2M31.5 23l-4.4-.6-1.2 4.2M8.5 23l4.4-.6 1.2 4.2M31.5 17l-4.4.6-1.2-4.2" fill="none" stroke-width="1.8"/></g>',
    '<path d="M9 28C10 12 22 5 31 12l-6 7c-2-3-6-3-8 1z" fill="#d6304f"/><rect x="7" y="26" width="26" height="7" rx="3.5" fill="#fff" stroke="#f0c8d2"/><circle cx="31" cy="11" r="4" fill="#fff" stroke="#f0c8d2"/>',
    '<rect x="9" y="17" width="22" height="17" rx="2" fill="#e85d7e"/><rect x="7" y="13" width="26" height="6" rx="1.5" fill="#f7809b"/><rect x="18" y="13" width="4" height="21" fill="#f3c84b"/><path d="M20 13c-5-7-11-3-6 0zM20 13c5-7 11-3 6 0z" fill="#f3c84b"/>',
    '<path d="M20 4l7 10h-4l6 9h-4l6 9H9l6-9h-4l6-9h-4z" fill="#4a8a5c"/><rect x="17.5" y="32" width="5" height="5" fill="#8a5a3a"/><circle cx="16" cy="20" r="1.6" fill="#f3c84b"/><circle cx="24" cy="25" r="1.6" fill="#e85d7e"/><circle cx="18" cy="29" r="1.6" fill="#7cc4f0"/><path d="M20 2l1 2.2 2.4.3-1.8 1.6.5 2.4L20 7.3l-2.1 1.2.5-2.4-1.8-1.6 2.4-.3z" fill="#f3c84b"/>',
    '<path d="M20 7c-6 0-9 5-9 11v6l-3 4h24l-3-4v-6c0-6-3-11-9-11z" fill="#f3c84b" stroke="#c99a2e" stroke-width="1"/><circle cx="20" cy="31" r="3" fill="#c99a2e"/><path d="M15 6c2 2 8 2 10 0" fill="none" stroke="#e85d7e" stroke-width="2.4" stroke-linecap="round"/>',
    '<path d="M20 34S6 25 6 15.5A7.5 7.5 0 0 1 20 11a7.5 7.5 0 0 1 14 4.5C34 25 20 34 20 34z" fill="#b5763e"/><path d="M20 30S9.5 23.5 9.5 16A4.5 4.5 0 0 1 20 14.5 4.5 4.5 0 0 1 30.5 16C30.5 23.5 20 30 20 30z" fill="none" stroke="#fff" stroke-width="1.4" stroke-dasharray="2 2"/><path d="M16.5 22l2.5 2.5 5-5" fill="none" stroke="#f7809b" stroke-width="2"/>',
    '<path d="M24 36V14a5 5 0 0 0-10 0" fill="none" stroke="#fff" stroke-width="7.5" stroke-linecap="round" opacity=".001"/><path d="M24 36V14a5 5 0 0 0-10 0" fill="none" stroke="#ffffff" stroke-width="5.5" stroke-linecap="round"/><path d="M24 36V14a5 5 0 0 0-10 0" fill="none" stroke="#e85d7e" stroke-width="5.5" stroke-linecap="round" stroke-dasharray="3 3"/>',
    '<path d="M24 7a12 12 0 1 0 9 19A10 10 0 0 1 24 7z" fill="#f3c84b"/><path d="M10 9l.8 1.8 1.9.2-1.4 1.3.4 1.9-1.7-1-1.7 1 .4-1.9-1.4-1.3 1.9-.2z" fill="#e85d7e"/><circle cx="31" cy="11" r="1.4" fill="#e85d7e"/>',
    '<path d="M20 33S7 25 7 16a7 7 0 0 1 13-3.6A7 7 0 0 1 33 16c0 9-13 17-13 17z" fill="#ff5c85"/><path d="M5 30L35 8" stroke="#f3c84b" stroke-width="2"/><path d="M35 8l-5 .5 2 3z" fill="#f3c84b"/><path d="M5 30l2.5-4M5 30l4 .2" stroke="#f3c84b" stroke-width="1.6"/>'
  ];
  function fuelleInnenraum(n) {
    const t = tueren.get(n);
    if (t.innen.querySelector("img, .innen-deko")) return;
    const bild = inhalt(n).bild;
    if (bild) {
      const img = document.createElement("img");
      img.src = bild;
      img.alt = "";
      img.loading = "lazy";
      img.onerror = () => { img.remove(); fuelleHerz(t.innen); };
      t.innen.appendChild(img);
    } else {
      fuelleHerz(t.innen);
    }
  }
  function fuelleHerz(container) {
    const n = +container.parentElement.dataset.tag;
    const deko = document.createElement("span");
    deko.className = "innen-deko";
    deko.innerHTML = '<svg viewBox="0 0 40 40" aria-hidden="true">' + INNEN_ICONS[(n - 1) % INNEN_ICONS.length] + "</svg>";
    const stempel = document.createElement("span");
    stempel.className = "innen-stempel";
    stempel.textContent = "♥ " + n + ". Dez.";
    container.append(deko, stempel);
  }

  function aktualisiere() {
    const d = kalenderDatum();
    const echt = berlinDatum(jetzt());
    for (const [n, t] of tueren) {
      const frei = zeitBereit && istVerfuegbar(n, d);
      const istOffen = frei && geoeffnet.has(n);
      const istHeute = frei && d.jahr === KALENDER.jahr && d.monat === 12 && d.tag === n;

      t.knopf.classList.toggle("gesperrt", !frei);
      t.knopf.classList.toggle("verfuegbar", frei);
      t.knopf.classList.toggle("offen", istOffen);
      t.knopf.classList.toggle("heute", istHeute);
      t.schloss.hidden = frei;
      if (istOffen) fuelleInnenraum(n);

      let label = "Türchen " + n;
      if (!frei) label += ", noch verschlossen";
      else if (istOffen) label += ", schon geöffnet";
      else label += ", kann geöffnet werden";
      t.knopf.setAttribute("aria-label", label);
    }
    aktualisiereStatus(d, echt);
    aktualisiereEier(d);
    setzeTageszeit(echt);
    aktualisiereFensterCapys(d);
    const capy = document.querySelector(".capy-laeufer");
    if (capy) {
      const outfit = zeitBereit ? capyOutfit(d) : null;
      if (outfit) capy.dataset.outfit = outfit.name;
      else delete capy.dataset.outfit;
    }
    aktualisiereZusammen(echt);
    aktualisiereBriefkopf(echt, d);
    const rk = document.getElementById("rueckblick-knopf");
    if (rk) rk.hidden = !(zeitBereit && nachWeihnachten(d));
    aktualisiereLichter(d);
    const fk = document.getElementById("finale-knopf");
    if (fk) fk.hidden = !(zeitBereit && alleOffen() && finaleGesehen());
  }

  function aktualisiereStatus(d, echt) {
    // Zwischen Mitternacht und 4 Uhr ist das neue Türchen noch zu
    const nachtFenster = echt && echt.tag !== d.tag;
    if (!zeitBereit) { el.status.textContent = "Einen Moment …"; return; }
    if (istGeburtstag()) {
      // nach dem echten Datum zählen, damit es in der Geburtstagsnacht nicht einen Tag mehr anzeigt
      el.status.textContent = "Alles Gute zum Geburtstag, Toni 🎂 In " + tageBis(1, echt || d) + " Tagen öffnest du das erste Türchen";
      return;
    }

    if (d.jahr > KALENDER.jahr || (d.jahr === KALENDER.jahr && d.monat === 12 && d.tag > 24)) {
      // 25. und 26.12. Weihnachten, danach ein Dankeschön
      const feiertag = d.jahr === KALENDER.jahr && d.monat === 12 && d.tag <= 26;
      const e = echt || d;
      if (e.jahr === KALENDER.jahr + 1 && e.monat === 1 && e.tag <= 6) el.status.textContent = "Frohes neues Jahr, mein Schatz 🎆 Auf " + e.jahr + " mit dir ♥️";
      else if (e.jahr === KALENDER.jahr && e.monat === 12 && e.tag === 31) el.status.textContent = "Heute Nacht beginnt " + (e.jahr + 1) + ". Danke für dieses wunderschöne Jahr mit dir ♥️";
      else el.status.textContent = feiertag ? "Frohe Weihnachten, Maus 🎄♥️" : "Danke für den schönsten Dezember, Maus ♥️";
      return;
    }
    if (d.jahr === KALENDER.jahr && d.monat === 12) {
      if (nachtFenster && d.tag < 24 && geoeffnet.has(d.tag)) el.status.textContent = "Um 4 Uhr wartet Türchen " + (d.tag + 1) + " auf dich ♥️";
      else if (geoeffnet.has(d.tag) && inhalt(d.tag).statusOffen) el.status.textContent = inhalt(d.tag).statusOffen;
      else if (inhalt(d.tag).status) el.status.textContent = inhalt(d.tag).status;
      else if (d.tag === 24) el.status.textContent = geoeffnet.has(24) ? "Frohe Weihnachten, mein Schatz 🎄 Ich denk an dich ♥️" : "Heute ist Heiligabend. Das letzte Türchen wartet auf dich ✨";
      else if (!geoeffnet.has(d.tag)) el.status.textContent = "Heute darfst du Türchen " + d.tag + " öffnen ✨";
      else el.status.textContent = (nachtFenster ? "Um 4 Uhr wartet Türchen " : "Morgen wartet Türchen ") + (d.tag + 1) + " auf dich ♥️";
      return;
    }
    const tage = tageBis(1, d);
    el.status.textContent = tage === 1
      ? (nachtFenster ? "Um 4 Uhr geht's los! ♥️" : "Morgen geht's los! ♥️")
      : "Noch " + tage + " Tage bis zum ersten Türchen ♥️";
  }

  /* ------------------------------------------------------------
   * Interaktion
   * ------------------------------------------------------------ */
  let toastTimer;
  function zeigeToast(text) {
    el.toast.textContent = text;
    el.toast.classList.add("sichtbar");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove("sichtbar"), 3200);
  }

  function gesperrtNachricht(n) {
    // Im Dezember gilt in Deutschland UTC + 1, 4:00 Uhr = 3:00 UTC
    const freiAb = Date.UTC(KALENDER.jahr, 11, n, FREISCHALT_STUNDE - 1, 0, 0);
    const rest = Math.max(0, freiAb - jetzt());
    const name = KOSENAMEN[n % KOSENAMEN.length];
    if (rest < 86400000) {
      const std = Math.floor(rest / 3600000);
      const min = Math.floor((rest % 3600000) / 60000);
      return "Nicht schummeln, " + name + " 😘 Türchen " + n + " öffnet sich in " + std + " Std. " + min + " Min.";
    }
    const tage = Math.floor(rest / 86400000);
    const spruch = ["Geduld, " + name + " ♥️", "Nicht schummeln, " + name + " 😘", "Die Capys bewachen dieses Türchen noch 🔒", "Na na na, " + name + " 🙈"][(n >> 2) % 4];
    return spruch + " Türchen " + n + " öffnet sich erst am " + n + ". Dezember um 4 Uhr. Noch " + tage + (tage === 1 ? " Tag" : " Tage") + " ♥️";
  }

  function schaukleAnhaenger(knopf) {
    const a = knopf.querySelector(".anhaenger");
    if (!a || bewegungReduziert) return;
    a.classList.remove("schaukeln");
    void a.offsetWidth;
    a.classList.add("schaukeln");
  }

  function klickAufTuer(n, e) {
    if (e && e.target.closest && e.target.closest(".ei-innen")) {
      const ei = eier.find((x) => x.versteck && x.versteck.hinter === n);
      if (ei) { findeEi(ei); return; }
    }
    const t = tueren.get(n);
    if (!zeitBereit) return;
    const d = kalenderDatum();
    if (n === 24 && lichtershow) { zeigeToast("Einen Moment, die Lichter gehen an ✨"); return; }

    if (!istVerfuegbar(n, d)) {
      t.knopf.classList.remove("wackeln");
      void t.knopf.offsetWidth; // Animation neu starten
      t.knopf.classList.add("wackeln");
      schaukleAnhaenger(t.knopf);
      zeigeToast(gesperrtNachricht(n));
      return;
    }

    if (geoeffnet.has(n)) {
      zeigeInhalt(n);
      return;
    }

    geoeffnet.add(n);
    speichereGeoeffnet(geoeffnet);
    fuelleInnenraum(n);
    t.knopf.classList.add("offen");
    herzKonfetti(t.knopf);
    aktualisiere();
    setTimeout(() => zeigeInhalt(n), bewegungReduziert ? 0 : 750);
  }

  function zeigeInhalt(n) {
    // Sicherheitsnetz: Inhalt nur zeigen, wenn der Tag wirklich erreicht ist
    if (!istVerfuegbar(n, kalenderDatum())) return;

    const i = inhalt(n);
    // Der Inhalt fliegt aus dem Türchen heraus
    const r = tueren.get(n).knopf.getBoundingClientRect();
    const breite = Math.min(520, window.innerWidth - 32);
    el.dialog.style.setProperty("--von-x", (r.left + r.width / 2 - window.innerWidth / 2).toFixed(0) + "px");
    el.dialog.style.setProperty("--von-y", (r.top + r.height / 2 - window.innerHeight / 2).toFixed(0) + "px");
    el.dialog.style.setProperty("--von-s", (r.width / breite).toFixed(3));
    el.dialog.classList.add("aus-tuer");
    offenerTag = n;
    aktualisiereVersteckte();
    el.dialogTag.textContent = n + ". Dezember";
    document.getElementById("dialog-siegel").textContent = String(n);
    document.getElementById("dialog-unterschrift").textContent = KALENDER.unterschrift || "";
    el.dialogTitel.textContent = i.titel || "Türchen " + n;
    el.dialogText.textContent = i.text || "";

    if (i.bild) {
      el.dialogBild.hidden = false;
      el.dialogBild.onerror = () => { el.dialogBild.hidden = true; };
      el.dialogBild.src = i.bild;
    } else {
      el.dialogBild.hidden = true;
      el.dialogBild.removeAttribute("src");
    }

    const hat = (w) => w !== undefined && w !== null && w !== "";
    el.dialogBrief.hidden = !hat(i.briefzahl);
    el.dialogBriefZahl.textContent = hat(i.briefzahl) ? String(i.briefzahl) : "";
    el.dialogPaeckchen.hidden = !hat(i.paeckchen);
    el.dialogPaeckchenZahl.textContent = hat(i.paeckchen) ? "Nr. " + i.paeckchen : "";

    el.dialogHinweis.hidden = !i.hinweis;
    el.dialogHinweisText.textContent = i.hinweis || "";

    // Sprachnachricht: nur zeigen, wenn die Datei wirklich da ist
    const audioBox = document.getElementById("dialog-audio");
    const player = document.getElementById("dialog-audio-player");
    player.pause();
    audioBox.hidden = true;
    if (i.audio) {
      player.onloadedmetadata = () => { audioBox.hidden = false; };
      player.onerror = () => { audioBox.hidden = true; };
      player.src = i.audio;
      player.load();
    } else {
      player.removeAttribute("src");
    }

    if (typeof el.dialog.showModal === "function") el.dialog.showModal();
    else el.dialog.setAttribute("open", "");
    starteRubbeln(n, !!i.rubbeln);

    if (i.geschenkregen) konfettiRegen("geschenke");
    else if (i.konfetti) konfettiRegen("konfetti");
  }

  /* Rubbelfeld: goldene Schicht über Text und Zahlen */
  const RUBBEL_SCHLUESSEL = "toni-advent-gerubbelt-" + KALENDER.jahr;
  function gerubbelt() {
    try { return new Set(JSON.parse(localStorage.getItem(RUBBEL_SCHLUESSEL) || "[]")); } catch (_) { return new Set(); }
  }
  function starteRubbeln(n, aktiv) {
    const c = document.getElementById("rubbel");
    const bereich = document.getElementById("rubbel-bereich");
    c.hidden = true;
    c.classList.remove("weg");
    bereich.classList.remove("rubbelt");
    c.onpointerdown = c.onpointermove = c.onpointerup = null;
    if (!aktiv || gerubbelt().has(n)) return;
    const breite = bereich.offsetWidth, hoehe = bereich.offsetHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = breite * dpr; c.height = hoehe * dpr;
    c.style.width = breite + "px"; c.style.height = hoehe + "px";
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const verlauf = ctx.createLinearGradient(0, 0, breite, hoehe);
    verlauf.addColorStop(0, "#e9c46a"); verlauf.addColorStop(0.5, "#b8862f"); verlauf.addColorStop(1, "#e0b453");
    ctx.fillStyle = verlauf;
    ctx.beginPath(); ctx.roundRect(0, 0, breite, hoehe, 16); ctx.fill();
    const rnd = zufall(n * 31);
    for (let k = 0; k < 90; k++) {
      ctx.fillStyle = rnd() < 0.5 ? "rgba(255,255,255,.55)" : "rgba(157,36,73,.18)";
      ctx.beginPath(); ctx.arc(rnd() * breite, rnd() * hoehe, 1 + rnd() * 2, 0, 6.3); ctx.fill();
    }
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(255, 240, 200, 0.8)";
    ctx.shadowBlur = 6;
    ctx.fillStyle = "#4a0f24";
    ctx.font = '700 30px "Dancing Script", cursive';
    ctx.fillText("Hier freirubbeln ✨", breite / 2, hoehe / 2 - 4);
    ctx.font = '700 14px "Nunito", sans-serif';
    ctx.fillText("mit dem Finger über das Gold wischen", breite / 2, hoehe / 2 + 22);
    ctx.shadowBlur = 0;
    bereich.classList.add("rubbelt");
    c.hidden = false;
    ctx.globalCompositeOperation = "destination-out";
    let malt = false, letzte = null, zuege = 0;
    function kratze(x, y) {
      ctx.lineWidth = 46; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(letzte ? letzte.x : x, letzte ? letzte.y : y);
      ctx.lineTo(x, y);
      ctx.stroke();
      letzte = { x, y };
      if (++zuege % 12 === 0) pruefe();
    }
    function pruefe() {
      const daten = ctx.getImageData(0, 0, c.width, c.height).data;
      let frei = 0, alle = 0;
      for (let k = 3; k < daten.length; k += 4 * 37) { alle++; if (daten[k] < 40) frei++; }
      if (frei / alle > 0.55) fertig();
    }
    function fertig() {
      c.onpointerdown = c.onpointermove = c.onpointerup = null;
      c.classList.add("weg");
      bereich.classList.remove("rubbelt");
      setTimeout(() => { c.hidden = true; }, 700);
      const g = gerubbelt(); g.add(n);
      try { localStorage.setItem(RUBBEL_SCHLUESSEL, JSON.stringify([...g])); } catch (_) { /* egal */ }
      herzKonfetti(bereich);
    }
    c.onpointerdown = (e) => { malt = true; letzte = null; c.setPointerCapture(e.pointerId); kratze(e.offsetX, e.offsetY); };
    c.onpointermove = (e) => { if (malt) kratze(e.offsetX, e.offsetY); };
    c.onpointerup = () => { malt = false; letzte = null; pruefe(); };
  }

  function schliesseDialog() {
    document.getElementById("dialog-audio-player").pause();
    if (typeof el.dialog.close === "function") el.dialog.close();
    else el.dialog.removeAttribute("open");
  }

  el.dialog.querySelector(".schliessen").addEventListener("click", schliesseDialog);
  el.dialog.addEventListener("click", (e) => { if (e.target === el.dialog) schliesseDialog(); });

  function herzKonfetti(ziel) {
    if (bewegungReduziert) return;
    const r = ziel.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const zeichen = ["♥️", "♥️", "✨", "♥️", "✨"];
    for (let k = 0; k < 14; k++) {
      const s = document.createElement("span");
      s.className = "konfetti";
      s.textContent = zeichen[k % zeichen.length];
      const winkel = (Math.PI * 2 * k) / 14 + Math.random() * 0.4;
      const weite = 60 + Math.random() * 70;
      s.style.left = x + "px";
      s.style.top = y + "px";
      s.style.setProperty("--dx", Math.cos(winkel) * weite + "px");
      s.style.setProperty("--dy", Math.sin(winkel) * weite + "px");
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1200);
    }
  }

  /* Konfetti (Geburtstage) oder langsam fallende Geschenke (Heiligabend),
     die über die ganze Seite regnen */
  let regenLaeuft = false;
  function konfettiRegen(art) {
    const geschenke = art === "geschenke";
    if (regenLaeuft) return;
    regenLaeuft = true;
    const canvas = el.regen;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const breite = window.innerWidth;
    const hoehe = window.innerHeight;
    canvas.width = breite * dpr;
    canvas.height = hoehe * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Geöffnete Karten haben immer Vorrang: Konfetti fällt dann hinter der Karte.
    // Ohne offene Karte liegt es im Top-Layer über allem.
    let alsPopover = false, inKarte = null;
    const elternVorher = canvas.parentNode;
    const flacheKarte = document.querySelector(".wz-fenster-huelle:not(.geht)");
    const karteOffen = flacheKarte || document.querySelector("dialog[open], .liebeszettel, .fensterblick, .zr-karte");
    if (flacheKarte) { flacheKarte.insertBefore(canvas, flacheKarte.firstChild); inKarte = flacheKarte; }
    else if (!karteOffen && typeof canvas.showPopover === "function") {
      try { canvas.showPopover(); alsPopover = true; } catch (_) { /* ignorieren */ }
    }
    if (!alsPopover) canvas.classList.add("aktiv");

    const farben = ["#e85d7e", "#f7809b", "#9d2449", "#d4a84b", "#f3dc9f", "#ffffff", "#7cc4f0", "#9be3b0"];
    const anzahl = geschenke
      ? (bewegungReduziert ? 12 : breite < 600 ? 22 : 34)
      : (bewegungReduziert ? 60 : breite < 600 ? 140 : 220);
    const teile = [];
    for (let k = 0; k < anzahl; k++) {
      if (geschenke) {
        teile.push({
          x: Math.random() * breite,
          y: -50 - Math.random() * hoehe * 1.2,
          groesse: 22 + Math.random() * 18,
          vx: 0,
          vy: 0.6 + Math.random() * 0.9,
          dreh: -0.3 + Math.random() * 0.6,
          vdreh: -0.008 + Math.random() * 0.016,
          wackel: Math.random() * Math.PI * 2,
        });
        continue;
      }
      teile.push({
        x: Math.random() * breite,
        y: -20 - Math.random() * hoehe * 0.8,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        vx: -1.5 + Math.random() * 3,
        vy: 2 + Math.random() * 3,
        dreh: Math.random() * Math.PI,
        vdreh: -0.15 + Math.random() * 0.3,
        wackel: Math.random() * Math.PI * 2,
        farbe: farben[k % farben.length],
        rund: Math.random() < 0.3,
      });
    }

    const dauer = geschenke ? 14000 : 5000;
    const rand = geschenke ? 50 : 20;
    const start = performance.now();
    function schritt(t) {
      const vergangen = t - start;
      ctx.clearRect(0, 0, breite, hoehe);
      let sichtbar = 0;
      for (const p of teile) {
        p.wackel += geschenke ? 0.02 : 0.05;
        p.x += p.vx + Math.sin(p.wackel) * (geschenke ? 0.5 : 0.8);
        p.y += p.vy;
        p.dreh += p.vdreh;
        if (p.y < hoehe + rand) sichtbar++;
        if (vergangen < dauer - 1500 && p.y > hoehe + rand) p.y = -rand; // nachrieseln
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.dreh);
        if (geschenke) {
          ctx.font = p.groesse + "px serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("🎁", 0, 0);
          ctx.restore();
          continue;
        }
        ctx.fillStyle = p.farbe;
        if (p.rund) {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.wackel)));
        }
        ctx.restore();
      }
      if (sichtbar > 0 && vergangen < dauer + (geschenke ? 15000 : 4000)) {
        requestAnimationFrame(schritt);
      } else {
        ctx.clearRect(0, 0, breite, hoehe);
        if (alsPopover) { try { canvas.hidePopover(); } catch (_) { /* ignorieren */ } }
        canvas.classList.remove("aktiv");
        if (inKarte && elternVorher) elternVorher.appendChild(canvas);
        regenLaeuft = false;
      }
    }
    requestAnimationFrame(schritt);
  }

  /* Schnee mit einzelnen Herzen, weht beim Scrollen und Neigen mit */
  function baueSchnee() {
    if (bewegungReduziert) return;
    const box = document.querySelector(".herzen");
    const c = document.createElement("canvas");
    box.appendChild(c);
    const ctx = c.getContext("2d");
    let w = 0, h = 0;
    function groesse() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    groesse();
    window.addEventListener("resize", groesse);
    function neueFlocke(start) {
      const herz = Math.random() < 0.14;
      return {
        x: Math.random() * w,
        y: start ? Math.random() * h : -12,
        r: herz ? 5 + Math.random() * 5 : 1.1 + Math.random() * 2.4,
        vy: herz ? 0.3 + Math.random() * 0.35 : 0.35 + Math.random() * 0.85,
        phase: Math.random() * 6.28,
        herz,
      };
    }
    const flocken = [];
    const anzahl = w < 600 ? 55 : 95;
    for (let k = 0; k < anzahl; k++) flocken.push(neueFlocke(true));
    let wind = 0, neigung = 0, letztesY = window.scrollY;
    // Schneekugel: kräftiges Gestöber mit vielen Extraflocken
    schneeSturm = function () {
      const richtung = Math.random() < 0.5 ? -1 : 1;
      wind = 5 * richtung;
      for (let k = 0; k < (w < 600 ? 110 : 180); k++) {
        const f = neueFlocke(true);
        f.extra = true;
        f.herz = Math.random() < 0.3;
        f.r = f.herz ? 5 + Math.random() * 6 : 1.4 + Math.random() * 2.8;
        f.vy = 0.8 + Math.random() * 2.2;
        f.y = Math.random() * h * 0.6 - h * 0.2;
        flocken.push(f);
      }
      let boeen = 0;
      const t = setInterval(() => { wind = 5 * (boeen % 2 ? -richtung : richtung); if (++boeen > 6) clearInterval(t); }, 380);
    };
    window.addEventListener("scroll", () => {
      const dy = window.scrollY - letztesY;
      letztesY = window.scrollY;
      wind = Math.max(-5, Math.min(5, wind + dy * 0.04));
    }, { passive: true });
    window.addEventListener("deviceorientation", (e) => {
      if (typeof e.gamma === "number") neigung = Math.max(-1.6, Math.min(1.6, e.gamma / 22));
    });
    ctx.textAlign = "center";
    function schritt() {
      // solange ein Fenster offen ist, bleibt der Schnee im Hintergrund stehen
      if (document.documentElement.classList.contains("ruhe")) { requestAnimationFrame(schritt); return; }
      ctx.clearRect(0, 0, w, h);
      const abend = document.documentElement.hasAttribute("data-abend");
      wind *= 0.94;
      for (const f of flocken) {
        f.phase += 0.012;
        f.x += Math.sin(f.phase) * 0.35 + (neigung + wind * 0.5) * (f.herz ? 0.6 : 1);
        f.y += f.vy - wind * 0.15 * (f.herz ? 0.5 : 1);
        if (f.y > h + 14 || f.y < -40) {
          if (f.extra) { f.weg = true; continue; }
          Object.assign(f, neueFlocke(false));
        }
        if (f.x > w + 14) f.x = -14;
        if (f.x < -14) f.x = w + 14;
        if (f.herz) {
          ctx.fillStyle = abend ? "rgba(255, 143, 171, 0.6)" : "rgba(232, 93, 126, 0.38)";
          ctx.font = Math.round(f.r * 2.4) + "px serif";
          ctx.fillText("♥", f.x, f.y);
        } else {
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, 6.2832);
          ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
          ctx.fill();
          if (!abend) {
            ctx.strokeStyle = "rgba(157, 36, 73, 0.16)";
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      for (let k = flocken.length - 1; k >= 0; k--) if (flocken[k].weg) flocken.splice(k, 1);
      requestAnimationFrame(schritt);
    }
    requestAnimationFrame(schritt);
  }
  let schneeSturm = function () {};

  /* Schütteln erkennen (Handy wie eine Schneekugel) */
  let bewegungErlaubt = false;
  function erlaubeBewegung() {
    if (bewegungErlaubt) return;
    bewegungErlaubt = true;
    try {
      if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === "function") DeviceMotionEvent.requestPermission().catch(() => {});
      if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function") DeviceOrientationEvent.requestPermission().catch(() => {});
    } catch (_) { /* egal */ }
  }
  document.addEventListener("click", erlaubeBewegung, { once: true, capture: true });
  let letztesSchuetteln = 0, letzteBeschl = null;
  window.addEventListener("devicemotion", (e) => {
    const a = e.accelerationIncludingGravity;
    if (!a || a.x === null) return;
    if (letzteBeschl) {
      const delta = Math.abs(a.x - letzteBeschl.x) + Math.abs(a.y - letzteBeschl.y) + Math.abs(a.z - letzteBeschl.z);
      const jetztMs = Date.now();
      if (delta > 32 && jetztMs - letztesSchuetteln > 1800) {
        letztesSchuetteln = jetztMs;
        schneeSturm();
      }
    }
    letzteBeschl = { x: a.x, y: a.y, z: a.z };
  });

  /* Wie lange wir schon zusammen sind */
  function tageSeit(iso, d) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    if (!m) return null;
    return Math.round((Date.UTC(d.jahr, d.monat - 1, d.tag) - Date.UTC(+m[1], +m[2] - 1, +m[3])) / 86400000);
  }
  function aktualisiereZusammen(d) {
    const box = document.getElementById("zusammen");
    if (!box) return;
    if (!zeitBereit) { box.textContent = ""; return; }
    const zusammen = tageSeit(KALENDER.zusammenSeit, d);
    const kennen = tageSeit(KALENDER.kennenSeit, d);
    if (kennen !== null && kennen > 0 && kennen % 365 === 0) {
      const jahre = kennen / 365;
      // Der Satz steht schon oben in „Dein Tag“, hier die Zahlen dazu
      box.textContent = (jahre === 1 ? "1 Jahr" : jahre + " Jahre") + " · " + kennen.toLocaleString("de-DE") + " Tage, seit wir uns kennen · " + (zusammen !== null && zusammen >= 0 ? zusammen.toLocaleString("de-DE") + " Tage zusammen ♥️" : "♥️");
      box.classList.add("jubilaeum");
      return;
    }
    box.classList.remove("jubilaeum");
    box.textContent = "";
    const kachel = (zahl, text) => {
      const k = document.createElement("p");
      k.className = "zaehler-kachel";
      const z = document.createElement("span");
      z.className = "zaehler-zahl";
      z.textContent = zahl.toLocaleString("de-DE");
      const t = document.createElement("span");
      t.className = "zaehler-text";
      t.textContent = text.replace(/\s*\u2665\uFE0F$/, "");
      if (/\u2665\uFE0F$/.test(text)) t.insertAdjacentHTML("beforeend", ' <svg class="ui-icon" aria-hidden="true"><use href="#i-herz"/></svg>');
      k.append(z, t);
      box.appendChild(k);
    };
    if (zusammen !== null && zusammen >= 0) kachel(zusammen, "Tage zusammen ♥️");
    if (kennen !== null && kennen >= 0) kachel(kennen, "Tage, seit wir uns kennen");
  }

  /* Datum mit Wochentag und Countdown im Untertitel */
  const WOCHENTAG = new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
  function aktualisiereBriefkopf(echt, d) {
    const datum = document.getElementById("datum");
    if (datum) datum.textContent = zeitBereit ? WOCHENTAG.format(new Date(Date.UTC(echt.jahr, echt.monat - 1, echt.tag))) : "";
    if (!zeitBereit) return;
    let text = KALENDER.untertitel || "";
    if (nachWeihnachten(d)) text = "Danke für 24 wunderschöne Tage ♥️";
    else if (d.jahr === KALENDER.jahr && d.monat === 12) {
      const rest = 24 - d.tag;
      text = rest > 1 ? "Noch " + rest + " Überraschungen bis Weihnachten"
        : rest === 1 ? "Noch 1 Überraschung bis Weihnachten"
        : (geoeffnet.has(24) ? "Frohe Weihnachten 🎄" : "Die letzte Überraschung wartet auf dich 🎄");
    }
    el.untertitel.textContent = text;
  }

  function nachWeihnachten(d) {
    return d.jahr > KALENDER.jahr || (d.jahr === KALENDER.jahr && d.monat === 12 && d.tag > 24);
  }

  /* Rückblick: alle 24 Türchen zum Nachlesen */
  const rueckblick = document.getElementById("rueckblick");
  rueckblick.querySelector(".schliessen").addEventListener("click", () => schliesse(rueckblick));
  rueckblick.addEventListener("click", (e) => { if (e.target === rueckblick) schliesse(rueckblick); });
  document.getElementById("rueckblick-knopf").addEventListener("click", () => {
    const liste = document.getElementById("rueckblick-liste");
    liste.textContent = "";
    for (let n = 1; n <= 24; n++) {
      const i = inhalt(n);
      const eintrag = document.createElement("article");
      eintrag.className = "rueckblick-eintrag";
      const kopf = document.createElement("p");
      kopf.className = "rueckblick-tag";
      kopf.textContent = n + ". Dezember";
      const t = document.createElement("h3");
      t.textContent = i.titel || "Türchen " + n;
      const p = document.createElement("p");
      p.className = "rueckblick-text";
      p.textContent = i.text || "";
      eintrag.append(kopf, t, p);
      liste.appendChild(eintrag);
    }
    oeffne(rueckblick);
  });

  /* Heiligabend: Lichtershow, bevor Türchen 24 aufgeht */
  let lichtershow = false;
  function starteLichtershow() {
    if (lichtershow || bewegungReduziert || !birnen.size) return;
    lichtershow = true;
    document.getElementById("lichterkette").classList.add("fest");
    const liste = [...birnen.values()];
    liste.forEach((b, k) => setTimeout(() => b.classList.add("show"), k * 70));
    setTimeout(() => document.getElementById("lichterkette").classList.add("blinken"), liste.length * 70 + 200);
    setTimeout(() => {
      const box = document.getElementById("lichterkette");
      box.classList.remove("fest", "blinken");
      liste.forEach((b) => b.classList.remove("show"));
      lichtershow = false;
      lichtershowFertig = true;
    }, liste.length * 70 + 2400);
  }
  let lichtershowFertig = false;

  /* Tageszeiten (deutsche Zeit):
       morgens      6:00 bis  9:00
       vormittags   9:00 bis 12:00
       mittags     12:00 bis 14:00
       nachmittags 14:00 bis 16:30 (im Dezember geht dann die Sonne unter)
       abends      16:30 bis 22:00
       nachts      22:00 bis  6:00 */
  const TAGESZEITEN = [
    { name: "nacht", bis: 6 * 60, gruss: "Schlaf schön, {name} 🌙" },
    { name: "morgen", bis: 9 * 60, gruss: "Guten Morgen, {name} ☀️" },
    { name: "vormittag", bis: 12 * 60, gruss: "Einen schönen Vormittag, {name} 🌤️" },
    { name: "mittag", bis: 14 * 60, gruss: "Guten Mittag, {name} 🌞" },
    { name: "nachmittag", bis: 16 * 60 + 30, gruss: "Einen gemütlichen Nachmittag, {name} 🍪" },
    { name: "abend", bis: 22 * 60, gruss: "Guten Abend, {name} 🕯️" },
    { name: "nacht", bis: 24 * 60, gruss: "Schlaf schön, {name} 🌙" },
  ];
  const KOSENAMEN = ["mein Schatz", "Maus", "Toni", "Baby"];
  function setzeTageszeit(d) {
    const minuten = d.stunde * 60 + d.minute;
    const index = TAGESZEITEN.findIndex((t) => minuten < t.bis);
    const zeit = TAGESZEITEN[index] || TAGESZEITEN[0];
    const html = document.documentElement;
    if (html.getAttribute("data-tageszeit") !== zeit.name) {
      html.setAttribute("data-tageszeit", zeit.name);
      html.toggleAttribute("data-abend", zeit.name === "abend" || zeit.name === "nacht");
    }
    const gruss = document.getElementById("gruss");
    // Kosenamen wechseln je nach Tag und Tageszeit
    const name = KOSENAMEN[(d.tag * 3 + index) % KOSENAMEN.length];
    const introGruss = document.getElementById("intro-gruss");
    if (introGruss) introGruss.textContent = zeitBereit && !istGeburtstag() ? zeit.gruss.replace("{name}", name) : "";
    if (gruss) gruss.textContent = zeitBereit ? (istGeburtstag() ? "Happy Birthday, " + name + " 🎂" : zeit.gruss.replace("{name}", name)) : "";
    document.documentElement.toggleAttribute("data-geburtstag", zeitBereit && istGeburtstag());
  }

  function baueSterne() {
    const box = document.getElementById("sterne");
    if (!box) return;
    const rnd = zufall(1224);
    for (let k = 0; k < 70; k++) {
      const s = document.createElement("span");
      s.style.left = (rnd() * 100).toFixed(2) + "%";
      s.style.top = (rnd() * 62).toFixed(2) + "%";
      const g = 1 + rnd() * 2.2;
      s.style.width = s.style.height = g.toFixed(1) + "px";
      s.style.animationDelay = -(rnd() * 4).toFixed(2) + "s";
      s.style.animationDuration = (2.5 + rnd() * 3).toFixed(2) + "s";
      box.appendChild(s);
    }
  }

  /* Lichterkette: für jedes geöffnete Türchen leuchtet ein Birnchen */
  const LICHTFARBEN = ["#ffd36b", "#ff8fab", "#ff4d7d", "#fff0c2"];
  const birnen = new Map();
  let lichterBereit = false;
  function kettenY(x) {
    const f = (x * 4) % 1;
    return 5 + 24 * Math.sin(Math.PI * f);
  }
  function baueLichterkette() {
    const box = document.getElementById("lichterkette");
    if (!box) return;
    let pfad = "";
    for (let i = 0; i <= 240; i++) {
      const x = i / 240;
      pfad += (i ? "L" : "M") + (x * 1000).toFixed(1) + " " + kettenY(x).toFixed(2);
    }
    box.innerHTML = '<svg viewBox="0 0 1000 46" preserveAspectRatio="none" aria-hidden="true"><path vector-effect="non-scaling-stroke" d="' + pfad + '"/></svg>';
    for (let n = 1; n <= 24; n++) {
      const x = (n - 0.5) / 24;
      const b = document.createElement("span");
      b.className = "birne";
      b.style.left = (x * 100).toFixed(3) + "%";
      b.style.top = (kettenY(x) + 3).toFixed(1) + "px";
      b.style.rotate = ((n % 3) - 1) * 7 + "deg";
      b.style.animationDelay = -(n * 0.37).toFixed(2) + "s";
      b.style.setProperty("--licht", LICHTFARBEN[n % LICHTFARBEN.length]);
      box.appendChild(b);
      birnen.set(n, b);
    }
  }
  function aktualisiereLichter(d) {
    let an = 0;
    for (const [n, b] of birnen) {
      const leuchtet = zeitBereit && istVerfuegbar(n, d) && geoeffnet.has(n);
      if (leuchtet) an++;
      if (leuchtet && !b.classList.contains("an") && lichterBereit && !bewegungReduziert) {
        b.classList.add("neu");
        setTimeout(() => b.classList.remove("neu"), 1300);
      }
      b.classList.toggle("an", leuchtet);
    }
    const box = document.getElementById("lichterkette");
    if (box) box.setAttribute("aria-label", "Lichterkette: " + an + " von 24 Lichtern leuchten");
    if (zeitBereit) lichterBereit = true;
  }

  /* Winterlandschaft mit verschneiten Häusern */
  function baueLandschaft() {
    const box = document.getElementById("landschaft");
    if (!box) return;
    const rnd = zufall(77);
    // Breite passend zum Bildschirm, damit alle Häuser zu sehen sind
    const verh = (box.offsetWidth || window.innerWidth) / (box.offsetHeight || 200);
    const B = Math.round(Math.max(520, Math.min(1400, verh * 230))), BODEN = 196;
    const fensterListe = [];
    const sx = (B / 1200).toFixed(4);
    let teile = '<path transform="scale(' + sx + ' 1)" style="fill:var(--huegel-2)" d="M0 120 Q 150 82 330 110 T 660 98 T 960 110 T 1200 96 V230 H0Z"/>';
    let x = 14;
    let k = 0;
    while (x < B - 40) {
      if (k % 4 === 2) {
        const bh = 38 + rnd() * 26, bx = x + 16;
        const spitze = BODEN - bh, stufe1 = BODEN - bh * 0.45, mitte = BODEN - bh * 0.32;
        const f = (v) => v.toFixed(1);
        const flocken = [
          'M' + f(bx) + ' ' + f(spitze) + ' l-6.5 ' + f(bh * 0.21) + ' q3 -2.6 6.5 -1 q3.5 -1.6 6.5 1z',
          'M' + f(bx - 15.5) + ' ' + f(stufe1) + ' q4 -4.5 8 -1.4 q4 -4.5 7.5 -0.6 q4 -4.5 8 -0.4 q4 -4 7.5 2.4z',
          'M' + f(bx - 14) + ' ' + f(mitte) + ' q4 -4 8.5 -0.5 q-2 3.2 -8.5 0.5z',
          'M' + f(bx + 3) + ' ' + f(mitte + 5) + ' q5 -4.5 10 -0.6 q-2.6 3.4 -10 0.6z',
          'M' + f(bx - 19) + ' ' + f(BODEN - 1) + ' q5 -5 10 -1.5 q5 -5 9.5 -0.5 q5 -5 9.5 -0.5 q5 -4.5 9 2.5z',
        ];
        teile += '<g class="baum" data-baum="' + k + '" role="button" aria-label="Baum schütteln"><rect class="trefferflaeche" x="' + f(bx - 24) + '" y="' + f(spitze - 6) + '" width="48" height="' + f(bh + 8) + '" fill="transparent"/>' +
          '<g class="baum-wackel"><g style="fill:var(--baum)">' +
          '<path d="M' + bx + ' ' + spitze + ' l-16 ' + (bh * 0.55) + ' h32z"/>' +
          '<path d="M' + bx + ' ' + (BODEN - bh * 0.7) + ' l-20 ' + (bh * 0.7) + ' h40z"/></g>' +
          flocken.map((d) => '<path class="baum-schnee" style="fill:var(--schnee)" d="' + d + '"/>').join("") +
          "</g></g>";
        x += 46;
      } else {
        const hw = 60 + rnd() * 46, hh = 72 + rnd() * 62, dh = 22 + rnd() * 16;
        const farbe = ["--haus-a", "--haus-b", "--haus-c"][k % 3];
        const oben = BODEN - hh;
        teile += '<rect class="haus" data-haus="' + k + '" style="fill:var(' + farbe + ')" x="' + x + '" y="' + oben + '" width="' + hw + '" height="' + hh + '"/>';
        if (rnd() < 0.5) {
          const kx = x + hw * 0.68, ky = oben - dh * 0.9;
          teile += '<rect style="fill:var(--dach)" x="' + kx + '" y="' + ky + '" width="9" height="' + dh * 0.7 + '"/>';
          const verz = (rnd() * 3).toFixed(2);
          teile += '<g class="rauch" transform="translate(' + (kx + 4.5).toFixed(1) + ' ' + (ky - 2).toFixed(1) + ')">' +
            [0, 1, 2].map((i) => '<circle r="' + (3 + i) + '" style="animation-delay:-' + (+verz + i * 1.3).toFixed(2) + 's"/>').join("") + "</g>";
        }
        teile += '<path class="haus" data-haus="' + k + '" style="fill:var(--dach)" d="M' + (x - 7) + ' ' + oben + ' L' + (x + hw / 2) + ' ' + (oben - dh) + ' L' + (x + hw + 7) + ' ' + oben + 'Z"/>';
        teile += '<polyline style="stroke:var(--schnee)" fill="none" stroke-width="6" stroke-linejoin="round" stroke-linecap="round" points="' + (x - 7) + ',' + (oben - 1) + ' ' + (x + hw / 2) + ',' + (oben - dh - 1) + ' ' + (x + hw + 7) + ',' + (oben - 1) + '"/>';
        const spalten = Math.max(2, Math.floor(hw / 27)), reihen = Math.max(2, Math.floor((hh - 14) / 26));
        for (let r = 0; r < reihen; r++) {
          for (let sp = 0; sp < spalten; sp++) {
            if (rnd() < 0.12) continue;
            const fx = x + (hw / spalten) * (sp + 0.5) - 8, fy = oben + 9 + r * 26;
            const gruppe = rnd() < 0.35 ? "f1" : "f2";
            teile += '<rect class="fenster haus ' + gruppe + '" data-haus="' + k + '" x="' + fx.toFixed(1) + '" y="' + fy.toFixed(1) + '" width="16" height="17" rx="2"/>';
            fensterListe.push({ x: fx, y: fy, haus: k, rang: Math.abs(fx + 8 - B / 2) / (B / 2) + rnd() * 0.55 });
          }
        }
        x += hw + 14 + rnd() * 18;
      }
      k++;
    }
    // Capybaras in den Fenstern: die mittleren (auch auf dem Handy sichtbaren) zuerst
    fensterListe.sort((a, b) => a.rang - b.rang);
    fensterListe.forEach((f, i) => {
      teile += '<g class="fenster-capy haus" data-nr="' + i + '" data-haus="' + f.haus + '" transform="translate(' + f.x.toFixed(1) + ' ' + f.y.toFixed(1) + ')">' +
        '<rect class="fenster-hell" width="16" height="17" rx="2"/>' +
        '<g clip-path="url(#fensterclip)"><g class="capy-kopf">' + FENSTER_CAPY + FENSTER_EXTRAS[i % FENSTER_EXTRAS.length] +
        '<g class="geb-hut"><path d="M5 7.2 8 -1 11 7.2z" fill="' + ["#f3dc9f", "#fda4b8", "#9be3b0", "#7cc4f0"][i % 4] + '"/><circle cx="8" cy="-1" r="1.3" fill="#e85d7e"/></g>' + "</g></g>" +
        '<rect x="-1" y="15.5" width="18" height="2.5" rx="1" class="fenster-bank"/></g>';
    });
    teile += '<path transform="scale(' + sx + ' 1)" style="fill:var(--huegel-1)" d="M0 198 Q 300 182 600 196 T 1200 190 V230 H0Z"/>';
    box.innerHTML = '<svg viewBox="0 0 ' + B + ' 230" preserveAspectRatio="xMidYMax slice">' +
      '<defs><clipPath id="fensterclip"><rect width="16" height="17" rx="2"/></clipPath></defs>' + teile + '</svg>';
    baueCapyBegleiter(box);
    const svg = box.querySelector("svg");
    svg.addEventListener("click", (e) => {
      const baum = e.target.closest(".baum");
      if (baum) { schuettleBaum(baum); return; }
      const haus = e.target.closest("[data-haus]");
      if (haus) zeigeHausCapys(haus.dataset.haus);
    });
  }

  /* Kleine Capybaras, die aus den Fenstern schauen */
  const FENSTER_CAPY =
    '<circle cx="3.6" cy="7.2" r="1.7" fill="#7a4e33"/><circle cx="12.4" cy="7.2" r="1.7" fill="#7a4e33"/>' +
    '<ellipse cx="8" cy="11.6" rx="6.2" ry="5.2" fill="#b07a52"/>' +
    '<ellipse cx="8" cy="13.4" rx="3.6" ry="2.5" fill="#9a6844"/>' +
    '<path d="M4.6 10q1-.9 2 0M9.4 10q1-.9 2 0" fill="none" stroke="#3a2418" stroke-width=".8" stroke-linecap="round"/>' +
    '<circle cx="4" cy="12.6" r="1" fill="#f7809b" opacity=".6"/><circle cx="12" cy="12.6" r="1" fill="#f7809b" opacity=".6"/>';
  const FENSTER_EXTRAS = [
    "",
    '<path d="M3.5 7.5C5 2 11.5 1.5 13 5.5L10 7.5z" fill="#d6304f"/><rect x="2.6" y="6.4" width="9" height="2.2" rx="1.1" fill="#fff"/><circle cx="13.4" cy="5" r="1.4" fill="#fff"/>',
    '<path d="M8 6.6 4.6 4.6v4zM8 6.6l3.4-2v4z" fill="#e85d7e"/><circle cx="8" cy="6.6" r="1.1" fill="#c2185b"/>',
    '<circle cx="5.6" cy="10.2" r="1.9" fill="none" stroke="#3a2418" stroke-width=".7"/><circle cx="10.4" cy="10.2" r="1.9" fill="none" stroke="#3a2418" stroke-width=".7"/><path d="M7.5 10.2h1" stroke="#3a2418" stroke-width=".7"/>',
    '<path d="M4.4 7.4l.8-3.6 1.6 1.8 1.2-2.6 1.2 2.6 1.6-1.8.8 3.6z" fill="#f3c84b" stroke="#c99a2e" stroke-width=".4"/>',
    '<path d="M2.6 15.2q5.4 2.6 10.8 0v1.8H2.6z" fill="#7cc4f0"/><rect x="10" y="15" width="2" height="2" fill="#fff"/>',
    '<path d="M3 9Q3 3.4 8 3.4T13 9" fill="none" stroke="#e85d7e" stroke-width="1.1"/><circle cx="2.6" cy="9.6" r="1.8" fill="#fda4b8"/><circle cx="13.4" cy="9.6" r="1.8" fill="#fda4b8"/>',
    '<rect x="11" y="11.5" width="3.6" height="4.6" rx=".8" fill="#eef7e6" stroke="#4a7c3a" stroke-width=".5"/><rect x="11.3" y="13" width="3" height="2.8" fill="#8fbf5a"/><path d="M13.2 11.5l.8-2" stroke="#9d2449" stroke-width=".6"/>',
  ];
  /* Tippen aufs Haus: in den leeren Fenstern schauen kurz Capybaras raus */
  const hausTimer = new Map();
  function zeigeHausCapys(haus) {
    const fenster = [...document.querySelectorAll('.fenster-capy[data-haus="' + haus + '"]')].filter((g) => !g.classList.contains("da"));
    if (!fenster.length) return;
    clearTimeout(hausTimer.get(haus));
    fenster.forEach((g, i) => {
      g.classList.remove("geht");
      setTimeout(() => g.classList.add("kurz"), bewegungReduziert ? 0 : i * 110);
    });
    hausTimer.set(haus, setTimeout(() => {
      fenster.forEach((g) => g.classList.add("geht"));
      setTimeout(() => fenster.forEach((g) => g.classList.remove("kurz", "geht")), bewegungReduziert ? 0 : 450);
    }, 4000));
  }

  /* Tippen auf einen Baum: Schnee fällt ab und wächst in 30 Sekunden nach */
  function schuettleBaum(baum) {
    const wackel = baum.querySelector(".baum-wackel");
    wackel.classList.remove("wackelt");
    void wackel.getBoundingClientRect();
    wackel.classList.add("wackelt");
    const schnee = [...baum.querySelectorAll(".baum-schnee:not(.weg)")];
    if (!schnee.length) return;
    clearTimeout(baum.nachwachsen);
    (baum.timerListe || []).forEach(clearTimeout);
    schnee.forEach((s, i) => {
      s.classList.remove("waechst");
      s.style.animationDelay = (i * 0.06).toFixed(2) + "s";
      s.classList.add("faellt");
      setTimeout(() => { s.classList.add("weg"); s.classList.remove("faellt"); s.style.animationDelay = ""; }, 1100 + i * 60);
    });
    // nach und nach wieder einschneien: von unten nach oben, verteilt über 30 Sekunden
    const alle = [...baum.querySelectorAll(".baum-schnee")].reverse();
    baum.timerListe = alle.map((s, i) => setTimeout(() => {
      s.classList.remove("weg");
      s.classList.add("waechst");
    }, 1300 + ((i + 1) / alle.length) * 28700));
  }

  function aktualisiereFensterCapys(d) {
    const alle = document.querySelectorAll(".fenster-capy");
    if (!alle.length) return;
    let anzahl = 0;
    if (zeitBereit && (d.jahr > KALENDER.jahr || (d.jahr === KALENDER.jahr && d.monat === 12))) {
      const tag = d.jahr > KALENDER.jahr ? 24 : Math.min(d.tag, 24);
      anzahl = Math.max(1, Math.round(alle.length * 0.85 * (tag / 24) * (tag / 24 + 1) / 2));
      if (tag >= 24) anzahl = Math.round(alle.length * 0.85);
    }
    if (zeitBereit && istGeburtstag()) anzahl = alle.length; // am Geburtstag feiern alle mit
    alle.forEach((g) => g.classList.toggle("da", +g.dataset.nr < anzahl));
  }

  /* Ein kleines Capybara spaziert durch die Winterlandschaft */
  const CAPY_SPRUECHE = [
    "Hallo {name}! Die Capy Crew hat dich lieb ♥️",
    "Psst, auf dieser Seite sind Geheimnisse versteckt 🤫",
    "Ein Capy sagt: Du bist toll ♥️",
    "Kuscheln ist mein Lieblingssport 🥰",
    "Hast du heute schon dein Türchen geöffnet?",
    "Schüttel mal dein Handy, {name} ❄️",
    "Ich bin nur wegen der Kekse hier 🍪",
    "Er hat dich soooo lieb, {name} ♥️",
  ];
  /* Outfits: alle 3 Tage ein neues */
  const CAPY_OUTFITS_SVG = '<g class="outfit outfit-strick"><path d="M49 15 Q60 -1 73 13 Z" fill="#7cc4f0"/><rect x="48" y="11" width="26" height="5" rx="2.5" fill="#e85d7e"/><rect x="52" y="11" width="3" height="5" fill="#fff"/><rect x="60" y="11" width="3" height="5" fill="#fff"/><rect x="68" y="11" width="3" height="5" fill="#fff"/><circle cx="60" cy="1" r="4.2" fill="#fff"/><path d="M46 30 q9 6 18 1 l1.5 5 q-10 5 -20 -1z" fill="#e85d7e"/><rect x="49" y="33" width="6" height="14" rx="2" fill="#e85d7e"/><rect x="49" y="37" width="6" height="2.5" fill="#fff"/><rect x="49" y="42" width="6" height="2.5" fill="#fff"/></g><g class="outfit outfit-nikolaus"><path d="M50 13 C54 -2 72 -4 76 6 L66 13z" fill="#d6304f"/><circle cx="77" cy="5" r="3.6" fill="#fff"/><rect x="47" y="10" width="24" height="5.5" rx="2.7" fill="#fff"/></g><g class="outfit outfit-lernen"><path d="M47 9 l15 -6.5 l15 6.5 l-15 6.5z" fill="#3a2418"/><rect x="54" y="10" width="16" height="5" rx="1" fill="#3a2418"/><path d="M62 9 L75 11 L75 19" fill="none" stroke="#f3c84b" stroke-width="1.2"/><rect x="73.6" y="18" width="3" height="5" rx="1" fill="#f3c84b"/><circle cx="71" cy="23" r="4.2" fill="rgba(255,255,255,.35)" stroke="#3a2418" stroke-width="1.4"/><path d="M66.8 22.5 L57 20.5" stroke="#3a2418" stroke-width="1.3"/></g><g class="outfit outfit-ohren"><path d="M53 14 Q60 -2 71 10" fill="none" stroke="#e85d7e" stroke-width="2.6" stroke-linecap="round"/><circle cx="55" cy="13" r="6" fill="#fda4b8"/><circle cx="52.5" cy="11" r="2.4" fill="#ffd0dc"/><circle cx="57" cy="15.5" r="2.2" fill="#ffd0dc"/></g><g class="outfit outfit-party"><path d="M54 13 L61 -11 L69 13z" fill="#f3dc9f"/><path d="M57.5 1 L65 1.5 M56 7 L67.5 7.5" stroke="#e85d7e" stroke-width="2.2"/><circle cx="61" cy="-11" r="3.4" fill="#e85d7e"/><path d="M54 13 Q61.5 16 69 13" fill="none" stroke="#fff" stroke-width="1"/><circle cx="45" cy="2" r="1.4" fill="#7cc4f0"/><rect x="74" y="-4" width="2.6" height="2.6" fill="#f3c84b" transform="rotate(20 75 -3)"/><circle cx="48" cy="-6" r="1.2" fill="#e85d7e"/></g><g class="outfit outfit-rentier"><g fill="none" stroke="#7a4e33" stroke-width="2.4" stroke-linecap="round"><path d="M54 11 L50 -2 M51.5 3 L45 0 M50.5 -1 L52 -8"/><path d="M60 11 L63 -3 M62 2 L68 -1 M63 -2 L61 -9"/></g><circle cx="76.5" cy="21.5" r="3" fill="#e53935"/><circle cx="75.6" cy="20.5" r="1" fill="#fff" opacity=".7"/></g><g class="outfit outfit-lichter"><path d="M9 27 Q20 39 34 38 T60 28" fill="none" stroke="#3f6b4f" stroke-width="1.4"/><ellipse class="capy-licht" cx="12" cy="31" rx="2.2" ry="3" fill="#ffd36b"/><ellipse class="capy-licht" cx="19" cy="36" rx="2.2" ry="3" fill="#ff4d7d"/><ellipse class="capy-licht" cx="27" cy="38.5" rx="2.2" ry="3" fill="#7cc4f0"/><ellipse class="capy-licht" cx="35" cy="38" rx="2.2" ry="3" fill="#ffd36b"/><ellipse class="capy-licht" cx="43" cy="35.5" rx="2.2" ry="3" fill="#ff4d7d"/><ellipse class="capy-licht" cx="51" cy="32" rx="2.2" ry="3" fill="#9be3b0"/><ellipse class="capy-licht" cx="58" cy="29" rx="2.2" ry="3" fill="#ffd36b"/></g><g class="outfit outfit-krone"><path d="M51 13 l1.5 -10 l4.5 5 l4 -8 l4 8 l4.5 -5 l1.5 10z" fill="#f3c84b" stroke="#c99a2e" stroke-width="1"/><circle cx="61" cy="9" r="1.8" fill="#e85d7e"/><circle cx="54.5" cy="10" r="1.2" fill="#7cc4f0"/><circle cx="67.5" cy="10" r="1.2" fill="#7cc4f0"/><path d="M30 20 L21 13 L22 25z" fill="#c2185b"/><path d="M30 20 L39 13 L38 25z" fill="#c2185b"/><circle cx="30" cy="20" r="3" fill="#e85d7e"/></g>';
  const CAPY_OUTFITS = [
    { name: "strick", spruch: "Brr, kalt draußen! Gut, dass ich Mütze und Schal habe 🧣" },
    { name: "nikolaus", spruch: "Ho ho ho! Warst du auch brav, {name}? 🎅" },
    { name: "lernen", spruch: "Heute im Lernmodus 🎓 Du schaffst das, {name}!" },
    { name: "ohren", spruch: "Meine neuen Ohrenschützer sind soooo flauschig 🥰" },
    { name: "party", spruch: "Partyzeit! 🥳 Die Capy Crew feiert mit" },
    { name: "rentier", spruch: "Ich bin heute ein Rentier. Rudolph ist neidisch 🦌" },
    { name: "lichter", spruch: "Ich leuchte heute extra für dich ✨" },
    { name: "krone", spruch: "Ich bin heute das Weihnachtscapy 👑 Fast geschafft!" },
  ];
  function capyOutfit(d) {
    if (istGeburtstag()) return { name: "krone", spruch: "Heute trage ich eine Krone, weil du Geburtstag hast 👑🎂" };
    if (d.jahr > KALENDER.jahr || (d.jahr === KALENDER.jahr && d.monat === 12 && d.tag > 24)) return CAPY_OUTFITS[1];
    if (d.jahr !== KALENDER.jahr || d.monat !== 12) return null;
    return CAPY_OUTFITS[Math.floor((d.tag - 1) / 3)];
  }

  function baueCapyBegleiter(box) {
    const bahn = document.createElement("div");
    bahn.className = "capy-bahn";
    const capy = document.createElement("button");
    capy.type = "button";
    capy.className = "capy-laeufer";
    capy.setAttribute("aria-label", "Capybara antippen");
    capy.innerHTML =
      '<span class="capy-blase" hidden></span>' +
      '<svg class="capy-figur" viewBox="0 -14 82 66" aria-hidden="true">' +
      '<ellipse cx="34" cy="31" rx="27" ry="16" fill="#b07a52"/>' +
      '<rect x="48" y="12" width="24" height="24" rx="10" fill="#b07a52"/>' +
      '<rect x="62" y="18" width="13" height="16" rx="6" fill="#9a6844"/>' +
      '<ellipse cx="55" cy="12" rx="3.5" ry="3" fill="#7a4e33"/>' +
      '<path d="M60 22q2.5-2 5 0" fill="none" stroke="#3a2418" stroke-width="1.8" stroke-linecap="round"/>' +
      '<ellipse cx="72" cy="23" rx="1.4" ry="1" fill="#3a2418"/>' +
      '<circle cx="62" cy="28" r="2.4" fill="#f7809b" opacity=".55"/>' +
      '<g class="capy-beine"><rect class="bein-a" x="16" y="40" width="7" height="11" rx="3" fill="#9a6844"/><rect class="bein-b" x="26" y="40" width="7" height="11" rx="3" fill="#8a5a3a"/>' +
      '<rect class="bein-b" x="42" y="40" width="7" height="11" rx="3" fill="#9a6844"/><rect class="bein-a" x="51" y="40" width="7" height="11" rx="3" fill="#8a5a3a"/></g>' +
      CAPY_OUTFITS_SVG +
      '</svg>';
    bahn.appendChild(capy);
    box.appendChild(bahn);
    if (!bewegungReduziert && capy.animate) {
      const figur = capy.querySelector(".capy-figur");
      let richtung = 1, lauf = null;
      function runde() {
        const breite = bahn.offsetWidth || window.innerWidth;
        const capyBreite = capy.offsetWidth || 80;
        const von = richtung > 0 ? -capyBreite - 10 : breite + 10;
        const bis = richtung > 0 ? breite + 10 : -capyBreite - 10;
        // gemütliches Tempo: etwa 45 Pixel pro Sekunde, mindestens 9 Sekunden
        const dauer = Math.max(9000, Math.min(26000, (breite + capyBreite) / 45 * 1000));
        figur.style.transform = richtung > 0 ? "scaleX(1)" : "scaleX(-1)";
        lauf = capy.animate([{ transform: "translateX(" + von + "px)" }, { transform: "translateX(" + bis + "px)" }], { duration: dauer, easing: "linear", fill: "forwards" });
        capy.laufAnimation = lauf;
        lauf.onfinish = () => {
          richtung = -richtung;
          setTimeout(runde, 7000);
        };
      }
      runde();
    }
    const blase = capy.querySelector(".capy-blase");
    let k = 0, timer;
    capy.addEventListener("click", () => {
      const d = kalenderDatum();
      const zeit = document.documentElement.getAttribute("data-tageszeit");
      const name = KOSENAMEN[(k + d.tag) % KOSENAMEN.length];
      const outfit = capyOutfit(d);
      let text = CAPY_SPRUECHE[k % CAPY_SPRUECHE.length];
      if (zeit === "nacht") text = "Gähn … Ich geh gleich schlafen. Gute Nacht, {name} 🌙";
      else if (outfit && k % 3 === 0) text = outfit.spruch;
      k++;
      blase.textContent = text.replace("{name}", name);
      blase.style.marginLeft = "0px";
      blase.hidden = false;
      // Sprechblase im sichtbaren Bereich halten
      const r = blase.getBoundingClientRect();
      const rand = 12;
      if (r.right > window.innerWidth - rand) blase.style.marginLeft = (window.innerWidth - rand - r.right) + "px";
      else if (r.left < rand) blase.style.marginLeft = (rand - r.left) + "px";
      capy.classList.add("redet");
      if (capy.laufAnimation) capy.laufAnimation.pause();
      clearTimeout(timer);
      timer = setTimeout(() => {
        blase.hidden = true;
        capy.classList.remove("redet");
        if (capy.laufAnimation) capy.laufAnimation.play();
      }, 3800);
    });
  }

  /* Umschlag zum Einstieg, einmal pro Besuch */
  /* Zeitpunkt „2026-11-26T00:30“ in deutscher Zeit (im Winter UTC + 1) */
  function berlinZeitpunkt(text) {
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(text || "");
    if (!m) return null;
    return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4] - 1, +m[5]);
  }
  const COUNTDOWN_BIS = berlinZeitpunkt(KALENDER.countdownBis);
  const BRIEF_AB = berlinZeitpunkt(KALENDER.briefAb);
  function introPhase() {
    if (!zeitBereit) return "laden";
    const t = jetzt();
    if (COUNTDOWN_BIS !== null && t < COUNTDOWN_BIS) return "warten";
    if (BRIEF_AB !== null && t < BRIEF_AB) return "geburtstag";
    return "offen";
  }
  function istGeburtstag() {
    const g = KALENDER.geburtstag;
    const m = g && /^(\d{4})-(\d{2})-(\d{2})$/.exec(g.datum || "");
    if (!m) return false;
    const d = berlinDatum(jetzt());
    return d.jahr === +m[1] && d.monat === +m[2] && d.tag === +m[3];
  }

  /* Umschlag zum Einstieg: vor dem Geburtstag mit Countdown verschlossen */
  function baueIntro() {
    const intro = document.getElementById("intro");
    if (!intro) return;
    const umschlag = document.getElementById("umschlag");
    const hinweis = document.getElementById("intro-hinweis");
    const cd = document.getElementById("intro-countdown");
    const cdGruss = document.getElementById("countdown-gruss");
    const cdTitel = document.getElementById("countdown-titel");
    const cdZiffern = document.getElementById("countdown-ziffern");
    let gesehen = false;
    try { gesehen = sessionStorage.getItem("toni-intro") === "1"; } catch (_) { /* egal */ }
    let offen = false, phase = null, konfettiGezeigt = false;

    function zeigen() {
      intro.hidden = false;
      intro.classList.remove("weg", "geoeffnet");
      document.documentElement.style.overflow = "hidden";
    }
    if (!gesehen) zeigen();

    const zwei = (z) => String(z).padStart(2, "0");
    function ziffern(ms, mitTagen) {
      const s = Math.max(0, Math.floor(ms / 1000));
      const teile = mitTagen
        ? [[Math.floor(s / 86400), "Tage"], [Math.floor(s / 3600) % 24, "Std."], [Math.floor(s / 60) % 60, "Min."], [s % 60, "Sek."]]
        : [[Math.floor(s / 60), "Min."], [s % 60, "Sek."]];
      // Felder nur einmal bauen und danach nur die Zahlen tauschen (damit Animationen daran nicht abbrechen)
      const form = teile.map((t) => t[1]).join();
      if (cdZiffern.dataset.form !== form || !cdZiffern.firstChild) {
        cdZiffern.dataset.form = form;
        cdZiffern.innerHTML = teile.map(([, l]) => '<span class="cd-feld" data-feld="' + l + '"><b></b><small>' + l + "</small></span>").join("");
      }
      const zahlen = cdZiffern.querySelectorAll(".cd-feld b");
      teile.forEach(([z], i) => { const t = zwei(z); if (zahlen[i] && zahlen[i].textContent !== t) zahlen[i].textContent = t; });
    }

    function tick() {
      const neu = introPhase();
      if (neu !== "offen" && neu !== "laden" && intro.hidden) { offen = false; umschlag.classList.remove("offen", "klappe-hinten"); zeigen(); }
      if (intro.hidden && neu === "offen") return;
      if (neu !== phase) {
        phase = neu;
        umschlag.classList.toggle("verschlossen", phase !== "offen");
        intro.dataset.phase = phase;
        if (phase === "laden") { cd.hidden = true; hinweis.textContent = "Einen Moment …"; }
        if (phase === "warten") {
          cd.hidden = false; cdGruss.hidden = true;
          cdTitel.textContent = "Dein Brief öffnet sich in";
          hinweis.textContent = "Noch ein bisschen Geduld ♥️";
        }
        if (phase === "geburtstag") {
          cd.hidden = false;
          cdGruss.textContent = (geburtstagsDaten() && geburtstagsDaten().gruss) || "Alles Gute zum Geburtstag! 🎂";
          cdGruss.hidden = false;
          cdTitel.textContent = "Dein Brief öffnet sich in";
          hinweis.textContent = "Gleich ist es so weit ♥️";
          if (!konfettiGezeigt) { konfettiGezeigt = true; konfettiRegen("konfetti"); }
        }
        if (phase === "offen") {
          const gebTag = istGeburtstag() && geburtstagsDaten() && geburtstagsDaten().gruss;
          if (gebTag) { cdGruss.textContent = gebTag; cdGruss.hidden = false; }
          cd.hidden = !gebTag;
          cdTitel.textContent = "";
          cdZiffern.textContent = "";
          delete cdZiffern.dataset.form;
          hinweis.textContent = "Tippe auf das Siegel";
          umschlag.classList.add("entsperrt");
          setTimeout(() => umschlag.classList.remove("entsperrt"), 1200);
        }
      }
      if (phase === "warten") ziffern(COUNTDOWN_BIS - jetzt(), true);
      if (phase === "geburtstag") ziffern(BRIEF_AB - jetzt(), false);
    }
    setInterval(tick, 250);
    tick();

    function oeffnen() {
      if (offen) return;
      if (introPhase() !== "offen") {
        umschlag.classList.remove("ruettelt");
        void umschlag.offsetWidth;
        umschlag.classList.add("ruettelt");
        return;
      }
      offen = true;
      const geburtstag = istGeburtstag() && geburtstagsDaten();
      if (geburtstag) {
        document.getElementById("brief-anrede").textContent = geburtstag.briefAnrede || "Happy Birthday!";
        document.getElementById("brief-text").textContent = geburtstag.briefText || "";
      }
      umschlag.classList.add("offen");
      intro.classList.add("geoeffnet");
      const schnell = bewegungReduziert;
      setTimeout(() => umschlag.classList.add("klappe-hinten"), schnell ? 0 : 550);
      if (geburtstag) setTimeout(() => konfettiRegen("konfetti"), schnell ? 0 : 1300);
      setTimeout(() => {
        intro.classList.add("weg");
        document.documentElement.style.overflow = "";
      }, schnell ? 150 : (geburtstag ? 3600 : 2400));
      setTimeout(() => { intro.hidden = true; }, schnell ? 400 : (geburtstag ? 4400 : 3200));
      try { sessionStorage.setItem("toni-intro", "1"); } catch (_) { /* egal */ }
    }
    umschlag.addEventListener("click", oeffnen);
    umschlag.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); oeffnen(); }
    });
  }

  /* Nach dem Umschlag sanft zum heutigen Türchen scrollen */
  let heuteGezeigt = false;
  function zeigeHeutigesTuerchen() {
    if (heuteGezeigt || !zeitBereit) return;
    const d = kalenderDatum();
    if (d.jahr !== KALENDER.jahr || d.monat !== 12 || d.tag > 24) return;
    const t = tueren.get(d.tag);
    if (!t) return;
    heuteGezeigt = true;
    const r = t.knopf.getBoundingClientRect();
    if (r.top > 80 && r.bottom < window.innerHeight - 40) return;
    setTimeout(() => t.knopf.scrollIntoView({ behavior: bewegungReduziert ? "auto" : "smooth", block: "center" }), 300);
  }

  /* ------------------------------------------------------------
   * Easter Eggs (versteckte Gutscheine)
   * ------------------------------------------------------------ */
  const EMBLEME = {
    matcha: { ort: "kopf", svg: '<svg viewBox="0 0 48 48"><path d="M26 14 31 2" stroke="#9d2449" stroke-width="3" stroke-linecap="round"/><path d="M12 14h24l-3.2 29.4A3 3 0 0 1 29.8 46H18.2a3 3 0 0 1-3-2.6z" fill="#eef7e6" stroke="#4a7c3a" stroke-width="2"/><path d="M13.7 23h20.6l-2.3 20.3a1.5 1.5 0 0 1-1.5 1.3H17.5a1.5 1.5 0 0 1-1.5-1.3z" fill="#8fbf5a"/><path d="M14 23c4 3 7-2 10 1s7-1 10 0" fill="none" stroke="#f6fbef" stroke-width="2.2" stroke-linecap="round"/><rect x="17.5" y="27" width="6" height="6" rx="1.6" fill="#fff" opacity=".75" transform="rotate(-12 20.5 30)"/><rect x="25" y="31" width="6" height="6" rx="1.6" fill="#fff" opacity=".75" transform="rotate(10 28 34)"/><rect x="10" y="11" width="28" height="4.5" rx="2.2" fill="#4a7c3a"/></svg>' },
    ente: { ort: "kopf", svg: '<svg viewBox="0 0 48 48"><circle cx="9" cy="10" r="3" fill="none" stroke="#7cc4f0" stroke-width="1.5"/><circle cx="15" cy="5" r="2" fill="none" stroke="#7cc4f0" stroke-width="1.5"/><circle cx="5" cy="18" r="1.6" fill="none" stroke="#7cc4f0" stroke-width="1.3"/><ellipse cx="22" cy="33" rx="17" ry="10" fill="#ffd54a"/><path d="M8 30c6 2 12 1 16-3" fill="none" stroke="#f0b400" stroke-width="2" stroke-linecap="round"/><circle cx="30" cy="18" r="9" fill="#ffd54a"/><path d="M38 17l8 2.5-8 3.5z" fill="#ff8a3d"/><circle cx="32.5" cy="15.5" r="1.6" fill="#3a2a2a"/><path d="M4 44c6-3 10 0 16-1s10-3 18 0" fill="none" stroke="#7cc4f0" stroke-width="2.2" stroke-linecap="round"/></svg>' },
    acai: { ort: "fuss", svg: '<svg viewBox="0 0 48 48"><path d="M5 22h38a19 17 0 0 1-38 0z" fill="#fff" stroke="#9d2449" stroke-width="2"/><ellipse cx="24" cy="22" rx="18" ry="5" fill="#5b2a6e"/><circle cx="15" cy="20.5" r="3" fill="#f6e27a" stroke="#e6c84a"/><circle cx="21" cy="19" r="3" fill="#f6e27a" stroke="#e6c84a"/><circle cx="28" cy="21" r="2.3" fill="#c2185b"/><circle cx="32" cy="19" r="2.3" fill="#3949ab"/><circle cx="35" cy="22" r="1.8" fill="#c2185b"/><path d="M25 17c1-3 4-4 6-3-1 2-3 4-6 3z" fill="#66bb6a"/><rect x="17" y="38" width="14" height="3.5" rx="1.7" fill="#9d2449"/></svg>' },
    blumen: { ort: "fuss", svg: '<svg viewBox="0 0 48 48"><path d="M24 40 15 18M24 40V13M24 40l9-22" stroke="#4a7c3a" stroke-width="2"/><circle cx="14" cy="16" r="6.5" fill="#f7809b"/><circle cx="24" cy="10" r="6.5" fill="#e85d7e"/><circle cx="34" cy="16" r="6.5" fill="#fda4b8"/><circle cx="14" cy="16" r="2.2" fill="#f3dc9f"/><circle cx="24" cy="10" r="2.2" fill="#f3dc9f"/><circle cx="34" cy="16" r="2.2" fill="#f3dc9f"/><path d="M13 26h22l-8.5 20h-5z" fill="#fff3cf" stroke="#d4a84b" stroke-width="1.6"/><path d="M19 33c3 2 7 2 10 0" fill="none" stroke="#e85d7e" stroke-width="2.2" stroke-linecap="round"/></svg>' },
    capybara: { ort: "kalender", svg: '<svg viewBox="0 0 56 46"><ellipse cx="14" cy="9" rx="5" ry="4" fill="#7a4e33"/><ellipse cx="42" cy="9" rx="5" ry="4" fill="#7a4e33"/><rect x="7" y="6" width="42" height="36" rx="17" fill="#b07a52"/><ellipse cx="28" cy="31" rx="13" ry="9.5" fill="#9a6844"/><ellipse cx="23.5" cy="28.5" rx="1.8" ry="1.1" fill="#3a2418"/><ellipse cx="32.5" cy="28.5" rx="1.8" ry="1.1" fill="#3a2418"/><path d="M25 35q3 2 6 0" fill="none" stroke="#3a2418" stroke-width="1.4" stroke-linecap="round"/><path d="M14 20q3-2.5 6 0M36 20q3-2.5 6 0" fill="none" stroke="#3a2418" stroke-width="1.8" stroke-linecap="round"/><circle cx="14" cy="27" r="2.6" fill="#f7809b" opacity=".55"/><circle cx="42" cy="27" r="2.6" fill="#f7809b" opacity=".55"/><path d="M27 4c1-3 4-3 5-1-2 0-3 1-5 1z" fill="#66bb6a"/><ellipse cx="17" cy="43" rx="6" ry="3.2" fill="#9a6844"/><ellipse cx="39" cy="43" rx="6" ry="3.2" fill="#9a6844"/></svg>' },
    heimat: { ort: "fuss", svg: '<svg viewBox="0 0 48 48"><rect x="31" y="8" width="5" height="9" fill="#9d2449"/><path d="M6 23 24 7l18 16" fill="none" stroke="#9d2449" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 21v21a2 2 0 0 0 2 2h22a2 2 0 0 0 2-2V21L24 10z" fill="#fff" stroke="#9d2449" stroke-width="2"/><path d="M24 38s-7-4.3-7-9a3.8 3.8 0 0 1 7-2 3.8 3.8 0 0 1 7 2c0 4.7-7 9-7 9z" fill="#e85d7e"/></svg>' },
  };
  const EIER_SCHLUESSEL = "toni-advent-gutscheine-" + KALENDER.jahr;
  const eier = (KALENDER.eastereggs || []).filter((e) => EMBLEME[e.emblem]);
  const eierKnoepfe = new Map();

  function ladeGefunden() {
    try {
      const liste = JSON.parse(localStorage.getItem(EIER_SCHLUESSEL) || "[]");
      return new Set(Array.isArray(liste) ? liste : []);
    } catch (_) { return new Set(); }
  }
  const gefunden = ladeGefunden();
  function speichereGefunden() {
    try { localStorage.setItem(EIER_SCHLUESSEL, JSON.stringify([...gefunden])); } catch (_) { /* egal */ }
  }

  function eiSichtbar(ei, d) {
    if (d.jahr > KALENDER.jahr) return true;
    return d.jahr === KALENDER.jahr && d.monat === 12 && d.tag >= ei.ab;
  }

  const gutscheinDialog = document.getElementById("gutschein");
  const sammlungDialog = document.getElementById("sammlung");
  const sammlungKnopf = document.getElementById("sammlung-knopf");
  const sammlungListe = document.getElementById("sammlung-liste");

  function oeffne(dlg) {
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
  }
  function schliesse(dlg) {
    if (typeof dlg.close === "function") dlg.close(); else dlg.removeAttribute("open");
  }
  for (const dlg of [gutscheinDialog, sammlungDialog]) {
    dlg.querySelector(".schliessen").addEventListener("click", () => schliesse(dlg));
    dlg.addEventListener("click", (e) => { if (e.target === dlg) schliesse(dlg); });
  }

  /* Verstecke:
       { tuerchen: 5 }   klein im geöffneten Türchen 5
       { foto: "x.jpg" } in der großen Fotoansicht dieses Fotos
       { hinter: 10 }    hinter Türchen 10, sobald es offen ist
     Nach dem Fund verschwindet das Easter Egg und ist nur noch
     unter „Meine Gutscheine“ zu finden. */
  let offenerTag = null;
  let aktuellesFoto = null;

  function baueEier() {
    const dialogInhalt = el.dialog.querySelector(".dialog-inhalt");
    const fotoFigur = document.querySelector(".lightbox-figur");
    for (const ei of eier) {
      const v = ei.versteck || {};
      let knopf;
      if (v.hinter && tueren.has(v.hinter)) {
        knopf = document.createElement("span");
        knopf.className = "ei-innen";
        tueren.get(v.hinter).innen.prepend(knopf);
      } else if (v.seite) {
        const ort = { titelfotos: "#titelfotos", fuss: ".fuss" }[v.seite];
        if (!ort || !document.querySelector(ort)) continue;
        knopf = document.createElement("button");
        knopf.type = "button";
        knopf.className = "ei ei-klein ei-seite-" + v.seite;
        knopf.setAttribute("aria-label", "Geheimnis");
        knopf.addEventListener("click", () => findeEi(ei));
        document.querySelector(ort).appendChild(knopf);
      } else if (v.tuerchen || v.foto) {
        knopf = document.createElement("button");
        knopf.type = "button";
        knopf.className = "ei ei-klein " + (v.foto ? "ei-im-foto" : "ei-im-tuerchen");
        knopf.setAttribute("aria-label", "Geheimnis");
        knopf.addEventListener("click", (e) => { e.stopPropagation(); findeEi(ei); });
        (v.foto ? fotoFigur : dialogInhalt).appendChild(knopf);
      } else {
        continue;
      }
      knopf.hidden = true;
      knopf.innerHTML = EMBLEME[ei.emblem].svg;
      eierKnoepfe.set(ei.emblem, knopf);
    }
    sammlungKnopf.addEventListener("click", zeigeSammlung);
  }

  function aktualisiereVersteckte() {
    const d = kalenderDatum();
    for (const ei of eier) {
      const knopf = eierKnoepfe.get(ei.emblem);
      if (!knopf) continue;
      const v = ei.versteck || {};
      let da = zeitBereit && eiSichtbar(ei, d) && !gefunden.has(ei.emblem);
      if (v.hinter) da = da && tueren.get(v.hinter).knopf.classList.contains("offen");
      else if (v.tuerchen) da = da && offenerTag === v.tuerchen;
      else if (v.foto) da = da && aktuellesFoto === v.foto;
      knopf.hidden = !da;
    }
  }

  function aktualisiereEier() {
    aktualisiereVersteckte();
    sammlungKnopf.hidden = !eier.some((ei) => gefunden.has(ei.emblem));
  }

  function findeEi(ei, quizGeschafft) {
    if (!zeitBereit || !eiSichtbar(ei, kalenderDatum())) return;
    entpackeEi(ei);
    const neu = !gefunden.has(ei.emblem);
    if (neu && !quizGeschafft && ei.quiz && ei.quiz.richtig) {
      zeigeQuiz(ei);
      return;
    }
    if (neu) {
      gefunden.add(ei.emblem);
      speichereGefunden();
      sammlungKnopf.hidden = false;
      aktualisiereVersteckte();
    }
    zeigeGutschein(ei, neu);
  }

  const quizDialog = document.getElementById("quiz");
  quizDialog.querySelector(".schliessen").addEventListener("click", () => schliesse(quizDialog));
  function zeigeQuiz(ei) {
    const q = ei.quiz;
    document.getElementById("quiz-frage").textContent = q.frage;
    const rueck = document.getElementById("quiz-rueckmeldung");
    rueck.textContent = "";
    const box = document.getElementById("quiz-antworten");
    box.textContent = "";
    const antworten = [q.richtig].concat((q.falsch || []).filter(Boolean));
    for (let k = antworten.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [antworten[k], antworten[j]] = [antworten[j], antworten[k]];
    }
    const name = KOSENAMEN[Math.floor(Math.random() * KOSENAMEN.length)];
    for (const a of antworten) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "quiz-antwort";
      b.textContent = a;
      b.addEventListener("click", () => {
        if (a === q.richtig) {
          b.classList.add("richtig");
          rueck.textContent = "Richtig, " + name + "! ♥️";
          box.querySelectorAll("button").forEach((x) => { x.disabled = true; });
          setTimeout(() => { schliesse(quizDialog); findeEi(ei, true); }, 900);
        } else {
          b.classList.remove("falsch"); void b.offsetWidth; b.classList.add("falsch");
          b.disabled = true;
          rueck.textContent = "Fast! Versuch's nochmal 😘";
        }
      });
      box.appendChild(b);
    }
    oeffne(quizDialog);
  }

  function zeigeGutschein(ei, neu) {
    const istFoto = ei.art === "foto";
    document.getElementById("gutschein-gefunden").textContent = neu
      ? (ei.fundtext || "Du hast ein Easter Egg gefunden! 🎉")
      : (istFoto ? "Dein Fund 🔍" : "Dein Gutschein 🎟️");
    gutscheinDialog.querySelector(".ticket-label").hidden = istFoto;
    gutscheinDialog.querySelector(".ticket-fuss").hidden = istFoto;
    gutscheinDialog.querySelector(".ticket").classList.toggle("ticket-foto", istFoto);
    document.getElementById("gutschein-emblem").innerHTML = EMBLEME[ei.emblem].svg;
    const bild = document.getElementById("gutschein-bild");
    bild.hidden = !ei.bild;
    if (ei.bild) {
      bild.src = "bilder/klein/" + webp(ei.bild);
      bild.style.objectPosition = ei.fokus || "";
      bild.onerror = () => { bild.hidden = true; };
    }
    document.getElementById("gutschein-titel").textContent = ei.titel;
    document.getElementById("gutschein-text").textContent = ei.text;
    oeffne(gutscheinDialog);
    if (neu) konfettiRegen("konfetti");
  }

  function zeigeSammlung() {
    sammlungListe.textContent = "";
    for (const ei of eier) {
      if (!gefunden.has(ei.emblem)) continue;
      entpackeEi(ei);
      if (ei.geheim) continue;
      const eintrag = document.createElement("button");
      eintrag.type = "button";
      eintrag.className = "sammlung-eintrag";
      eintrag.innerHTML = EMBLEME[ei.emblem].svg;
      const name = document.createElement("span");
      name.textContent = ei.titel;
      eintrag.appendChild(name);
      eintrag.addEventListener("click", () => {
        schliesse(sammlungDialog);
        zeigeGutschein(ei, false);
      });
      sammlungListe.appendChild(eintrag);
    }
    oeffne(sammlungDialog);
  }

  /* ------------------------------------------------------------
   * Fotos: Polaroids oben, Fotostreifen unten, große Ansicht
   * ------------------------------------------------------------ */
  const fotoListe = [];
  const lightbox = document.getElementById("lightbox");
  const lightboxBild = document.getElementById("lightbox-bild");
  const lightboxText = document.getElementById("lightbox-text");
  let fotoIndex = 0;

  function baueFotos() {
    const fotos = KALENDER.fotos || {};
    const ziele = [
      [fotos.titel || [], document.getElementById("titelfotos")],
      [fotos.galerie || [], document.getElementById("fotostreifen")],
    ];
    for (const [liste, ziel] of ziele) {
      for (const f of liste) {
        if (!f || !f.datei) continue;
        const index = fotoListe.length;
        fotoListe.push(f);
        const knopf = document.createElement("button");
        knopf.type = "button";
        knopf.className = "polaroid";
        knopf.setAttribute("aria-label", "Foto ansehen: " + (f.text || ""));
        const img = document.createElement("img");
        img.src = "bilder/klein/" + webp(f.datei);
        img.alt = f.text || "";
        if (f.fokus) img.style.objectPosition = f.fokus;
        img.loading = ziel.id === "titelfotos" ? "eager" : "lazy";
        img.onerror = () => { knopf.remove(); };
        const text = document.createElement("span");
        text.textContent = f.text || "";
        knopf.append(img, text);
        knopf.addEventListener("click", () => zeigeFoto(index));
        ziel.appendChild(knopf);
      }
    }
    document.getElementById("momente").hidden = !(fotos.galerie && fotos.galerie.length);
    // Wisch-Hinweis und Fortschritt unter dem Fotostreifen
    const streifen = document.getElementById("fotostreifen");
    const leiste = document.getElementById("streifen-fortschritt");
    const hinweis = document.getElementById("wisch-hinweis");
    if (streifen && leiste) {
      const balken = leiste.firstElementChild;
      const neu = () => {
        const max = streifen.scrollWidth - streifen.clientWidth;
        const anteil = max > 0 ? streifen.clientWidth / streifen.scrollWidth : 1;
        balken.style.width = (anteil * 100).toFixed(1) + "%";
        balken.style.marginLeft = (max > 0 ? (streifen.scrollLeft / streifen.scrollWidth) * 100 : 0).toFixed(1) + "%";
        leiste.hidden = max <= 0;
      };
      streifen.addEventListener("scroll", () => { neu(); if (streifen.scrollLeft > 30 && hinweis) hinweis.classList.add("gesehen"); }, { passive: true });
      window.addEventListener("resize", neu);
      setTimeout(neu, 300);
    }
  }

  function zeigeFoto(index) {
    fotoIndex = (index + fotoListe.length) % fotoListe.length;
    const f = fotoListe[fotoIndex];
    lightboxBild.src = "bilder/" + webp(f.datei);
    lightboxBild.alt = f.text || "";
    lightboxText.textContent = f.text || "";
    lightboxText.hidden = !f.text;
    aktuellesFoto = f.datei;
    aktualisiereVersteckte();
    if (!lightbox.open) oeffne(lightbox);
  }

  lightbox.querySelector(".schliessen").addEventListener("click", () => schliesse(lightbox));
  lightbox.querySelector(".zurueck").addEventListener("click", () => zeigeFoto(fotoIndex - 1));
  lightbox.querySelector(".weiter").addEventListener("click", () => zeigeFoto(fotoIndex + 1));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) schliesse(lightbox); });
  lightbox.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") zeigeFoto(fotoIndex - 1);
    if (e.key === "ArrowRight") zeigeFoto(fotoIndex + 1);
  });
  let wischStart = null;
  lightbox.addEventListener("touchstart", (e) => { wischStart = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener("touchend", (e) => {
    if (wischStart === null) return;
    const dx = e.changedTouches[0].clientX - wischStart;
    wischStart = null;
    if (Math.abs(dx) > 50) zeigeFoto(fotoIndex + (dx < 0 ? 1 : -1));
  });

  /* ------------------------------------------------------------
   * Finale: Wenn alle 24 Türchen offen sind, werden die Fotos zum Herz
   * ------------------------------------------------------------ */
  const FINALE_SCHLUESSEL = "toni-advent-finale-" + KALENDER.jahr;
  // Das Finale kommt an Heiligabend nach Türchen 24, auch wenn auf diesem
  // Gerät nicht alle anderen Türchen geöffnet wurden
  function alleOffen() {
    return geoeffnet.has(24) && istVerfuegbar(24, kalenderDatum());
  }
  function finaleGesehen() {
    try { return localStorage.getItem(FINALE_SCHLUESSEL) === "1"; } catch (_) { return false; }
  }
  const finale = document.getElementById("finale");
  function zeigeFinale() {
    const herz = document.getElementById("finale-herz");
    herz.textContent = "";
    finale.classList.remove("fertig");
    finale.hidden = false;
    const fotos = fotoListe.slice();
    const N = fotos.length;
    // Herz und Text darunter passen zusammen auf den Bildschirm
    const W = window.innerWidth, H = window.innerHeight;
    const textH = 112;
    const g = Math.max(36, Math.min(84, Math.min(W, H) / 8));
    const einheit = Math.max(4, Math.min((W - g - 24) / 33, (H - textH - g - 56) / 29));
    // im Hochformat darf das Herz etwas höher werden, dann haben die Fotos mehr Platz
    const einheitY = Math.max(einheit, Math.min(einheit * 1.3, (H - textH - g - 56) / 29));
    const herzH = 29 * einheitY + g;
    const cy = (H - herzH - textH) / 2 + herzH / 2;
    finale.style.setProperty("--g", g.toFixed(0) + "px");
    finale.style.setProperty("--cy", cy.toFixed(0) + "px");
    finale.style.setProperty("--text-oben", (cy + herzH / 2 + 14).toFixed(0) + "px");
    const weit = Math.max(window.innerWidth, window.innerHeight);
    // Viele Fotos: ein äußeres und ein inneres Herz, damit sie sich nicht
    // zu stark überdecken und die Gesichter sichtbar bleiben
    const innenSkala = 0.54;
    const innenAnzahl = N > 32 ? Math.round(N * innenSkala / (1 + innenSkala)) : 0;
    const aussenAnzahl = N - innenAnzahl;
    const verzoegerung = N > 32 ? 55 : 75;
    // Punkte gleichmäßig entlang der Herzlinie, damit sich an der Spitze
    // keine Fotos stapeln
    const herzPunkt = (t) => [16 * Math.pow(Math.sin(t), 3), -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))];
    const linie = [];
    let laenge = 0;
    for (let k = 0, vor = herzPunkt(0); k <= 600; k++) {
      const p = herzPunkt((k / 600) * Math.PI * 2);
      laenge += Math.hypot(p[0] - vor[0], p[1] - vor[1]);
      linie.push([laenge, p]);
      vor = p;
    }
    const aufLinie = (anteil) => {
      const ziel = anteil * laenge;
      return (linie.find((e) => e[0] >= ziel) || linie[linie.length - 1])[1];
    };
    fotos.forEach((f, i) => {
      const innen = i >= aussenAnzahl;
      const s = innen ? innenSkala : 1;
      const p = innen ? aufLinie((i - aussenAnzahl + 0.5) / innenAnzahl) : aufLinie(i / aussenAnzahl);
      // das innere Herz wird um die Herzmitte (etwas oberhalb der Mitte) verkleinert
      const x = p[0] * s * einheit;
      const y = (-0.5 + (p[1] + 0.5) * s - 2.5) * einheitY;
      const karte = document.createElement("div");
      karte.className = "finale-foto";
      const img = new Image();
      img.src = "bilder/klein/" + webp(f.datei);
      img.alt = "";
      if (f.fokus) img.style.objectPosition = f.fokus;
      karte.appendChild(img);
      herz.appendChild(karte);
      const winkel = Math.random() * Math.PI * 2;
      const dreh = Math.random() * 24 - 12;
      karte.animate([
        { transform: "translate(" + (Math.cos(winkel) * weit).toFixed(0) + "px," + (Math.sin(winkel) * weit).toFixed(0) + "px) rotate(" + dreh * 8 + "deg) scale(.4)", opacity: 0 },
        { transform: "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" + dreh + "deg) scale(1)", opacity: 1 },
      ], {
        duration: bewegungReduziert ? 1 : 1500,
        delay: bewegungReduziert ? 0 : i * verzoegerung,
        easing: "cubic-bezier(.2,.8,.2,1)",
        fill: "forwards",
      });
    });
    setTimeout(() => {
      finale.classList.add("fertig");
      konfettiRegen("konfetti");
    }, bewegungReduziert ? 50 : N * verzoegerung + 1300);
    try { localStorage.setItem(FINALE_SCHLUESSEL, "1"); } catch (_) { /* egal */ }
    const fk = document.getElementById("finale-knopf");
    if (fk) fk.hidden = false;
  }
  finale.querySelector(".finale-zu").addEventListener("click", () => { finale.hidden = true; });
  finale.addEventListener("click", (e) => { if (finale.classList.contains("fertig") && e.target !== finale.querySelector(".finale-zu")) finale.hidden = true; });
  document.getElementById("finale-knopf").addEventListener("click", zeigeFinale);
  el.dialog.addEventListener("close", () => {
    if (alleOffen() && !finaleGesehen()) setTimeout(zeigeFinale, 450);
  });
  window.adventkalender = {
    zeigeFinale,
    entschluessle,
    schneeSturm: () => schneeSturm(),
    starteLichtershow,
    konfetti: (art) => konfettiRegen(art || "konfetti"),
    kalenderDatum: () => kalenderDatum(),
    istGeburtstag: () => istGeburtstag(),
    intro: { bereit: () => zeitBereit, phase: () => introPhase(), datum: () => berlinDatum(jetzt()) },
    zeitreise: {
      aktiv: () => zeitreiseAn,
      aufgabe: () => (zeitreiseAn && zeitreise ? zeitreise.aufgabe || null : null),
      ziel: () => (zeitreiseAn && zeitreise ? zeitreise.ziel : null),
      erlaubt: () => { const e = echtJetzt(); return e !== null && e >= ZEITREISE_AB; },
      echtDatum: () => { const e = echtJetzt(); return e === null ? null : berlinDatum(e); },
      zeitpunkt: (jahr, monat, tag, stunde, minute) => berlinZeitpunkt(jahr + "-" + String(monat).padStart(2, "0") + "-" + String(tag).padStart(2, "0") + "T" + String(stunde).padStart(2, "0") + ":" + String(minute || 0).padStart(2, "0")),
      starte(ziel, aufgabe) {
        raeumeZeitreiseAuf();
        try { sessionStorage.setItem("toni-zeitreise", JSON.stringify({ ziel, aufgabe: aufgabe || null })); } catch (_) { return; }
        location.reload();
      },
      beende() { raeumeZeitreiseAuf(); location.reload(); },
    },
  };

  /* Tannenzweige mit Beeren und Kugeln in den oberen Ecken */
  function baueZweige() {
    const kopf = document.querySelector(".kopf");
    if (!kopf) return;
    const nadeln = (x1, y1, x2, y2, n) => {
      let p = "";
      for (let i = 1; i <= n; i++) {
        const t = i / (n + 1), x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
        const l = 9 + (i % 3) * 2;
        p += "M" + x.toFixed(1) + " " + y.toFixed(1) + "l" + (-l * 0.5).toFixed(1) + " " + (l * 0.9).toFixed(1) +
             "M" + x.toFixed(1) + " " + y.toFixed(1) + "l" + (l * 0.9).toFixed(1) + " " + (l * 0.35).toFixed(1);
      }
      return p;
    };
    const svg =
      '<svg viewBox="0 0 140 110" aria-hidden="true">' +
      '<path d="M-4 6 Q 50 18 112 12" fill="none" stroke="#6b4a3a" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M10 8 Q 26 30 30 52" fill="none" stroke="#6b4a3a" stroke-width="2.2" stroke-linecap="round"/>' +
      '<g class="nadeln" fill="none" stroke-linecap="round" stroke-width="2.4">' +
      '<path stroke="#2f6a45" d="' + nadeln(-4, 6, 112, 12, 13) + '"/>' +
      '<path stroke="#3f7f55" d="' + nadeln(10, 8, 30, 52, 6) + '"/>' +
      '</g>' +
      '<g class="beeren"><circle cx="44" cy="22" r="3.6" fill="#d6304f"/><circle cx="50" cy="19" r="3.2" fill="#e8455f"/><circle cx="47" cy="26.5" r="3" fill="#c2185b"/>' +
      '<circle cx="86" cy="21" r="3.2" fill="#d6304f"/><circle cx="91" cy="24" r="2.8" fill="#e8455f"/></g>' +
      '<g class="kugel kugel-a"><path d="M68 15v34" stroke="#d4a84b" stroke-width="1"/><rect x="64.5" y="46" width="7" height="5" rx="1" fill="#d4a84b"/><circle cx="68" cy="59" r="10" fill="#e85d7e"/><path d="M60 57q8 5 16 0" fill="none" stroke="#fff" stroke-width="1.6" opacity=".8"/><circle cx="64.5" cy="55" r="2.4" fill="#fff" opacity=".6"/></g>' +
      '<g class="kugel kugel-b"><path d="M28 40v26" stroke="#d4a84b" stroke-width="1"/><rect x="25" y="63" width="6" height="4" rx="1" fill="#d4a84b"/><circle cx="28" cy="74" r="8" fill="#f3c84b"/><circle cx="25.5" cy="71" r="2" fill="#fff" opacity=".6"/></g>' +
      "</svg>";
    for (const seite of ["links", "rechts"]) {
      const z = document.createElement("div");
      z.className = "zweig zweig-" + seite;
      z.innerHTML = svg;
      kopf.appendChild(z);
    }
  }

  /* Kleine Herzen, wo sie auf die Seite tippt */
  function baueTippHerzen() {
    if (bewegungReduziert) return;
    document.addEventListener("pointerdown", (e) => {
      if (e.target.closest && e.target.closest("#rubbel, .testleiste, audio, input, select")) return;
      const anzahl = Math.random() < 0.5 ? 1 : 2;
      for (let k = 0; k < anzahl; k++) {
        const h = document.createElement("span");
        h.className = "tipp-herz";
        h.textContent = "♥";
        h.style.left = e.clientX + (k ? 10 : -4) + "px";
        h.style.top = e.clientY - 6 + "px";
        h.style.setProperty("--dx", (Math.random() * 30 - 15).toFixed(0) + "px");
        h.style.animationDelay = k * 0.12 + "s";
        h.style.fontSize = (12 + Math.random() * 8).toFixed(0) + "px";
        document.body.appendChild(h);
        setTimeout(() => h.remove(), 1300);
      }
    }, { passive: true });
  }

  /* Tipp: Seite als App auf den Homescreen legen */
  function zeigeAppTipp() {
    const tipp = document.getElementById("app-tipp");
    if (!tipp) return;
    const standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
    const handy = /iphone|ipad|android/i.test(navigator.userAgent);
    let weg = false;
    try { weg = localStorage.getItem("toni-app-tipp") === "1"; } catch (_) { /* egal */ }
    if (standalone || !handy || weg) return;
    const ios = /iphone|ipad/i.test(navigator.userAgent);
    document.getElementById("app-tipp-text").textContent = ios
      ? "Leg mich als App auf deinen Homescreen: unten auf Teilen tippen, dann „Zum Home-Bildschirm“."
      : "Leg mich als App auf deinen Homescreen: oben im Menü ⋮ auf „Zum Startbildschirm hinzufügen“.";
    setTimeout(() => { tipp.hidden = false; }, 4000);
    document.getElementById("app-tipp-zu").addEventListener("click", () => {
      tipp.hidden = true;
      try { localStorage.setItem("toni-app-tipp", "1"); } catch (_) { /* egal */ }
    });
  }

  /* ------------------------------------------------------------
   * Start
   * ------------------------------------------------------------ */
  baueIntro();
  baueKalender();
  baueLichterkette();
  baueLandschaft();
  baueSterne();
  zeigeAppTipp();
  baueZweige();
  baueTippHerzen();
  baueEier();
  baueFotos();
  baueSchnee();
  aktualisiere();

  synchronisiereZeit().then(() => {
    zeitBereit = true;
    aktualisiere();
    const k = kalenderDatum();
    if (k.jahr === KALENDER.jahr && k.monat === 12 && k.tag === 24 && !geoeffnet.has(24)) setTimeout(starteLichtershow, 600);
  });

  // Regelmäßig prüfen, damit um Mitternacht das neue Türchen aufgeht
  setInterval(aktualisiere, 20000);

  // Nach dem Aufwecken des Handys die Zeit neu holen
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") synchronisiereZeit().then(aktualisiere);
  });
})();
