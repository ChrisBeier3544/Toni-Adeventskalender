/*
 * ===========================================================
 *  ROTKEHLCHEN
 *  Sitzt auf einem von 5 Plätzen, sagt den Tagesgruß, fliegt
 *  10 Sekunden später auf einer von 10 Routen davon und landet
 *  danach auf einem neuen Platz. An besonderen Tagen zu zweit.
 * ===========================================================
 */
(function () {
  "use strict";

  const ak = window.adventkalender;
  const intro = document.getElementById("intro");
  const grussQuelle = document.getElementById("gruss");
  if (!ak || !ak.intro || !grussQuelle) return;
  const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const GROESSE = 52;

  /* ---------- Aussehen ---------- */
  function vogelSvg(weiblich, aussehen) {
    const a = aussehen || {};
    const ruecken = a.ruecken || (weiblich ? "#a0704b" : "#8a5a3a"), brust = a.brust || (weiblich ? "#f6877a" : "#f26b5b"), fluegel = a.fluegel || (weiblich ? "#86593b" : "#6b4632");
    return '<svg viewBox="0 0 60 60" aria-hidden="true">' +
      '<g class="beine"><path d="M24 50l-3 6M30 50l3 6M21 56h-4M21 56l-2 3M33 56h4M33 56l2 3" stroke="#e39a3b" stroke-width="2.2" stroke-linecap="round"/></g>' +
      '<g class="vogel-koerper">' +
      '<path class="fluegel-hinten" d="M30 26q-18-18-26-6q8 2 14 10z" fill="' + fluegel + '"/>' +
      '<path d="M8 34q-8 2-6 9q6-1 10-6z" fill="' + fluegel + '"/>' +
      '<ellipse cx="28" cy="32" rx="21" ry="19" fill="' + ruecken + '"/>' +
      '<ellipse cx="30" cy="38" rx="15" ry="13" fill="' + brust + '"/>' +
      '<ellipse cx="31" cy="42" rx="10" ry="8" fill="#fff2e4"/>' +
      '<path class="fluegel-vorne" d="M14 30q-4 10 6 14q-4-8-6-14z" fill="' + fluegel + '"/>' +
      '<path d="M26 13q2-6 6-5q-3 1-3 5z" fill="' + ruecken + '"/>' +
      '<circle cx="22" cy="28" r="5" fill="#fff"/><circle cx="36" cy="28" r="5" fill="#fff"/>' +
      '<circle cx="23" cy="29" r="3.2" fill="#2a1a12"/><circle cx="37" cy="29" r="3.2" fill="#2a1a12"/>' +
      '<circle cx="24.2" cy="27.6" r="1.2" fill="#fff"/><circle cx="38.2" cy="27.6" r="1.2" fill="#fff"/>' +
      (weiblich ? '<path d="M17 23.5l-2-2M19.5 22.6l-.8-2.6M38.5 22.6l.8-2.6M41 23.5l2-2" stroke="#2a1a12" stroke-width="1.1" stroke-linecap="round"/>' : "") +
      '<rect class="augenlid" x="16.5" y="23" width="11" height="11" rx="5.5" fill="' + ruecken + '"/><rect class="augenlid" x="30.5" y="23" width="11" height="11" rx="5.5" fill="' + ruecken + '"/>' +
      '<path d="M27 33l2.5 4 2.5-4z" fill="#f3b23c"/>' +
      '<circle cx="17" cy="35" r="3" fill="#ff9fb4" opacity=".7"/><circle cx="41" cy="35" r="3" fill="#ff9fb4" opacity=".7"/>' +
      (weiblich && !a.deko ? '<g transform="translate(36 14) rotate(18)"><path d="M0 0-6-4v8zM0 0l6-4v8z" fill="#ff7aa2"/><circle r="2" fill="#ffd0dc"/></g>' : "") +
      (a.deko ? DEKO[a.deko](a.farbe || "#d6304f") : "") +
      "</g></svg>";
  }
  // Weihnachtliche Deko für die Freunde der Munkelvogeline
  const DEKO = {
    muetze: (c) => '<path d="M14 18 C18 2 40 0 46 14 L40 18z" fill="' + c + '"/><rect x="12" y="15" width="34" height="6" rx="3" fill="#fff"/><circle cx="48" cy="12" r="4" fill="#fff"/>',
    schal: (c) => '<path d="M12 44 q18 8 36 0 v6 q-18 8 -36 0z" fill="' + c + '"/><rect x="36" y="46" width="6" height="12" rx="2" fill="' + c + '"/><path d="M15 47h28" stroke="#fff" stroke-width="1.6" stroke-dasharray="3 3"/>',
    ohren: (c) => '<path d="M12 26 q0 -18 34 -14" fill="none" stroke="#6b5560" stroke-width="2.4"/><circle cx="11" cy="28" r="6" fill="' + c + '"/><circle cx="47" cy="22" r="6" fill="' + c + '"/><circle cx="11" cy="28" r="3" fill="#fff" opacity=".5"/><circle cx="47" cy="22" r="3" fill="#fff" opacity=".5"/>',
    geweih: (c) => '<path d="M20 14 l-4 -10 M17 7 l-5 -2 M38 14 l4 -10 M41 7 l5 -2" stroke="#8a5a3a" stroke-width="2.4" stroke-linecap="round"/><circle cx="29.5" cy="35" r="3.4" fill="#ff3b3b"/>',
    pudel: (c) => '<path d="M15 20 a14 12 0 0 1 28 0z" fill="' + c + '"/><path d="M15 20h28" stroke="#fff" stroke-width="3"/><path d="M19 15h20M21 11h16" stroke="#fff" stroke-width="1.6" opacity=".6"/><circle cx="29" cy="6" r="4.5" fill="#fff"/>',
    stern: (c) => '<path d="M14 18 q15 -12 30 0" fill="none" stroke="#d4a84b" stroke-width="2"/><path d="M29 2 l2.4 5 5.4.6 -4 3.7 1.1 5.3 -4.9 -2.8 -4.9 2.8 1.1 -5.3 -4 -3.7 5.4 -.6z" fill="' + c + '"/>',
    fliege: (c) => '<path d="M30 46 l-8 -5 v10z M30 46 l8 -5 v10z" fill="' + c + '"/><circle cx="30" cy="46" r="2.4" fill="#fff" opacity=".8"/>',
    glocke: (c) => '<path d="M14 44 q16 7 32 0" fill="none" stroke="#d6304f" stroke-width="2.6"/><path d="M26 47 q4 -8 8 0 v3 h-8z" fill="' + c + '"/><circle cx="30" cy="51" r="1.6" fill="#a97b2c"/>',
    mistel: (c) => '<ellipse cx="38" cy="15" rx="6" ry="2.6" transform="rotate(-30 38 15)" fill="#3f7f55"/><ellipse cx="44" cy="16" rx="6" ry="2.6" transform="rotate(30 44 16)" fill="#4f8a5b"/><circle cx="40" cy="18" r="2" fill="#fff"/><circle cx="43" cy="19" r="2" fill="#fff"/>',
    krone: (c) => '<path d="M18 18 l2 -10 5 6 4.5 -8 4.5 8 5 -6 2 10z" fill="' + c + '"/><circle cx="29.5" cy="8" r="1.6" fill="#ff4d7d"/><rect x="18" y="16" width="23" height="4" rx="1" fill="#d4a84b"/>',
  };
  // Zehn verschiedene Freunde: andere Federfarben, andere Deko, keiner gleicht dem anderen
  const FREUNDE = [
    { ruecken: "#8a5a3a", brust: "#f26b5b", fluegel: "#6b4632", deko: "muetze", farbe: "#d6304f" },
    { ruecken: "#5a7fb0", brust: "#f3d45b", fluegel: "#3f5f8a", deko: "schal", farbe: "#e85d7e" },
    { ruecken: "#7a8a52", brust: "#f6a25b", fluegel: "#5a6a3a", deko: "ohren", farbe: "#b39ddb" },
    { ruecken: "#9a6a4a", brust: "#ffb3a0", fluegel: "#7a4e33", deko: "geweih" },
    { ruecken: "#6a5a8a", brust: "#ff9fc4", fluegel: "#4e4070", deko: "pudel", farbe: "#3f9a6a" },
    { ruecken: "#b08a5a", brust: "#fff0c2", fluegel: "#8a6a3a", deko: "stern", farbe: "#f3c84b" },
    { ruecken: "#4f7f7a", brust: "#ffcf8a", fluegel: "#3a605c", deko: "fliege", farbe: "#d6304f" },
    { ruecken: "#a05a5a", brust: "#ffd0dc", fluegel: "#7a3e3e", deko: "glocke", farbe: "#f3c84b" },
    { ruecken: "#8a8a8a", brust: "#ff8a7a", fluegel: "#666", deko: "mistel" },
    { ruecken: "#c08060", brust: "#b8e0ff", fluegel: "#9a5e40", deko: "krone", farbe: "#f3c84b" },
  ];

  /* ---------- Plätze (Bildschirmkoordinaten der Füße) ---------- */
  const sichtbar = (el) => el && el.offsetParent !== null && el.getBoundingClientRect().width > 0;
  const PLAETZE_KALENDER = {
    karte: () => { const e = document.querySelector(".heute-karte"); if (!sichtbar(e)) return null; const r = e.getBoundingClientRect(); return { x: r.right - 40, y: r.top + 1 }; },
    polaroid: () => { const e = document.querySelector("#titelfotos .polaroid:last-child"); if (!sichtbar(e)) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width * 0.68, y: r.top + 4 }; },
    kette: () => { const k = document.getElementById("lichterkette"); const b = k && k.querySelectorAll(".birne")[7]; if (!sichtbar(k) || !b || k.classList.contains("noch-nicht")) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top - 2 }; },
    // Adventskranz (ab dem 1. Advent), vorher die Überschrift „Unsere Momente“
    kranz: () => {
      const k = document.querySelector("#adventskranz svg");
      if (sichtbar(k) && !document.getElementById("adventskranz").hidden) { const r = k.getBoundingClientRect(); return { x: r.left + r.width * 0.86, y: r.top + r.height * 0.42 }; }
      const m = document.getElementById("momente-titel"); if (!sichtbar(m)) return null;
      const r = m.getBoundingClientRect(); return { x: r.left + r.width * 0.5 + 92, y: r.top + 17 };
    },
    regal: () => { const e = document.getElementById("kalender"); if (!sichtbar(e)) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width * 0.22, y: r.top + 2 }; },
  };
  const PLAETZE_COUNTDOWN = {
    countdown: () => {
      const e = document.getElementById("countdown-ziffern"); if (!sichtbar(e) || !e.textContent) return null;
      const r = e.getBoundingClientRect();
      // am liebsten rechts neben den Ziffern, damit nichts von der Schrift verdeckt wird
      if (r.right + 24 + GROESSE / 2 < W() - 8) return { x: r.right + 24, y: r.bottom - 4 };
      const t = document.getElementById("countdown-titel"), tr = t && t.getBoundingClientRect();
      if (!tr || !tr.width || r.right - 22 - GROESSE / 2 > tr.right + 4) return { x: r.right - 22, y: r.top + 1 };
      // am schmalen Handy: oben mittig auf den Umschlag
      const u = document.getElementById("umschlag");
      if (!sichtbar(u)) return null;
      const ur = u.getBoundingClientRect();
      return { x: ur.left + ur.width * 0.5, y: ur.top + 3 };
    },
    umschlagLinks: () => ankerPunkt("34px", "oben", 3),
    umschlagRechts: () => ankerPunkt("calc(100% - 34px)", "oben", 3),
    siegel: () => { const e = document.querySelector("#umschlag .siegel"); if (!sichtbar(e)) return null; return ankerPunkt("50%", e.offsetTop + "px", 4); },
    hinweis: () => { const e = document.getElementById("intro-hinweis"); if (!sichtbar(e) || !e.textContent) return null; const r = e.getBoundingClientRect(); return { x: Math.min(window.innerWidth - 30, r.right + 26), y: r.top + 14 }; },
  };
  // Unsichtbare Punkte im Umschlag. Weil sie im Brief stecken, folgen sie seinem
  // Schweben und Kippen genau, und die Vögel bewegen sich natürlich mit.
  const anker = new Map();
  function ankerPunkt(links, oben, plus) {
    const u = document.getElementById("umschlag");
    if (!sichtbar(u)) return null;
    const key = links + "|" + oben;
    let a = anker.get(key);
    if (!a || !a.isConnected) {
      a = document.createElement("span");
      a.className = "vogel-anker";
      a.setAttribute("aria-hidden", "true");
      a.style.left = links;
      if (oben === "unten") a.style.bottom = "0"; else a.style.top = oben === "oben" ? "0" : oben;
      u.appendChild(a);
      anker.set(key, a);
    }
    const r = a.getBoundingClientRect();
    return { x: r.left, y: r.top + (plus || 0) };
  }
  function kontext() {
    const phase = ak.intro.phase();
    if (!intro.hidden && (phase === "warten" || phase === "geburtstag")) return "countdown";
    if (intro.hidden) return "kalender";
    return null; // Umschlag zu, aber noch nicht geöffnet: kein Vogel
  }
  const plaetze = (k) => (k === "countdown" ? PLAETZE_COUNTDOWN : PLAETZE_KALENDER);
  const ERSTER_PLATZ = { countdown: "countdown", kalender: "karte" };

  /* ---------- Flugrouten (10 Stück), Punkte relativ zum Bildschirm ---------- */
  const W = () => window.innerWidth, H = () => window.innerHeight;
  const ROUTEN = [
    (s) => [s, { x: s.x + 60, y: s.y - 80 }, { x: W() + 90, y: -60 }],                                       // schräg nach rechts oben
    (s) => [s, { x: s.x - 60, y: s.y - 80 }, { x: -90, y: -60 }],                                            // schräg nach links oben
    (s) => [s, { x: s.x + 70, y: s.y - 40 }, { x: s.x + 40, y: s.y - 130 }, { x: s.x - 30, y: s.y - 70 }, { x: s.x + 30, y: s.y - 20 }, { x: W() + 90, y: s.y - 160 }], // Looping
    (s) => [s, { x: s.x - 50, y: s.y - 50 }, { x: s.x + 10, y: s.y - 100 }, { x: s.x - 70, y: s.y - 150 }, { x: s.x - 10, y: s.y - 200 }, { x: -90, y: -80 }], // Zickzack
    (s) => [s, { x: s.x + 40, y: s.y + 70 }, { x: s.x + 140, y: s.y + 40 }, { x: W() + 90, y: s.y - 200 }],   // Sturzflug mit Aufschwung
    (s) => { const p = [s]; for (let k = 1; k <= 7; k++) { const w = k * 1.1, r = 26 + k * 12; p.push({ x: s.x + Math.cos(w) * r, y: s.y - k * 28 + Math.sin(w) * r * 0.5 }); } p.push({ x: s.x, y: -100 }); return p; }, // Spirale
    (s) => [s, { x: s.x - 40, y: s.y - 90 }, { x: W() * 0.5, y: Math.max(40, s.y - 220) }, { x: W() + 90, y: s.y - 60 }],  // großer Bogen
    (s) => { const p = [s]; const n = 6; for (let k = 1; k <= n; k++) p.push({ x: s.x + ((W() + 100 - s.x) * k) / n, y: s.y - 40 + (k % 2 ? -30 : 30) }); return p; }, // Wellenflug
    (s) => [s, { x: s.x - 20, y: s.y - 18 }, { x: s.x - 40, y: s.y }, { x: s.x - 60, y: s.y - 18 }, { x: s.x - 80, y: s.y }, { x: s.x - 160, y: s.y - 120 }, { x: -90, y: s.y - 220 }], // Hüpfer und Abflug
    (s) => { const p = [s]; for (let k = 1; k <= 8; k++) { const w = -Math.PI / 2 + (k / 8) * Math.PI * 2; p.push({ x: s.x + Math.cos(w) * 55, y: s.y - 55 + Math.sin(w) * 40 }); } p.push({ x: -90, y: s.y - 120 }); return p; }, // Kreis um den Platz
  ];
  // Kurve durch alle Punkte (Catmull-Rom)
  function punktAuf(p, t) {
    const n = p.length - 1, i = Math.min(n - 1, Math.floor(t * n)), u = t * n - i;
    const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(n, i + 2)];
    const f = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
    return { x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) };
  }

  /* ---------- Ein Vogel ---------- */
  const ebene = document.createElement("div");
  ebene.className = "vogel-ebene";
  document.body.appendChild(ebene);
  const voegel = [];

  function erstelleVogel(weiblich, saetze) {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "vogel" + (weiblich ? " weibchen" : "");
    el.setAttribute("aria-label", weiblich ? "Munkelvogel Weibchen antippen" : "Munkelvogel antippen");
    el.innerHTML = '<span class="vogel-blase" hidden></span>' + vogelSvg(weiblich);
    el.hidden = true;
    ebene.appendChild(el);
    const v = { el, blase: el.querySelector(".vogel-blase"), weiblich, saetze, platz: null, kontext: null, zustand: "weg", pos: null, blick: 1, timer: [], flugTimer: null };
    el.addEventListener("click", (e) => {
      const wahl = e.target.closest && e.target.closest(".vogel-wahl");
      if (wahl) { e.stopPropagation(); antworte(v, wahl.dataset.antwort); return; }
      if (v.zustand !== "sitzt" || v.fragt) return;
      el.classList.remove("hopst"); void el.offsetWidth; el.classList.add("hopst");
      // vor dem Geburtstag fragt der Munkelvogel beim zweiten Antippen nach seiner Partnerin
      if (!weiblich && vorGeburtstag() && v.hatGesprochen && !weibchen && !frageBeantwortet) { frage(v); return; }
      sprich(v);
    });
    voegel.push(v);
    return v;
  }

  // p ist in Bildschirmkoordinaten; gesetzt wird in Seitenkoordinaten, damit der Vogel beim Scrollen still sitzt
  function setzePosition(v, p) {
    v.pos = p;
    v.seite = { x: p.x + window.scrollX, y: p.y + window.scrollY };
    // nach der echten Größe ausrichten (die Gäste sind kleiner), damit die Füße genau auf dem Punkt stehen
    const b = v.el.offsetWidth || GROESSE, h = v.el.offsetHeight || GROESSE;
    v.el.style.transform = "translate(" + (v.seite.x - b / 2).toFixed(1) + "px," + (v.seite.y - h).toFixed(1) + "px)";
    v.el.querySelector("svg").style.transform = v.blick < 0 ? "scaleX(-1)" : "";
  }

  function sprich(v) {
    if (v.auftrag) return;
    v.timer.forEach(clearTimeout); v.timer = [];
    clearTimeout(v.flugTimer);
    const liste = v.saetze().filter(Boolean);
    if (!liste.length) { planeAbflug(v); return; }
    v.hatGesprochen = true;
    liste.forEach((satz, i) => v.timer.push(setTimeout(() => zeigeBlase(v, satz), i * 5600)));
    v.timer.push(setTimeout(() => { v.blase.hidden = true; v.el.classList.remove("redet"); planeAbflug(v); }, liste.length * 5600 - 600));
  }
  function zeigeBlase(v, satz) {
    if (v.zustand !== "sitzt") return;
    // nur sprechen, wenn der Vogel gerade zu sehen ist
    const sicht = v.el.getBoundingClientRect();
    if (sicht.bottom < 20 || sicht.top > window.innerHeight - 20) { v.blase.hidden = true; return; }
    // die Blase des anderen Vogels ausblenden, damit sie sich nicht überlappen
    voegel.forEach((a) => { if (a !== v) { a.blase.hidden = true; a.el.classList.remove("redet"); } });
    v.blase.textContent = satz;
    v.blase.classList.remove("seitlich", "rechts-vom-vogel");
    v.blase.classList.toggle("unten", v.pos && v.pos.y < 140);
    v.blase.style.left = "0px"; v.blase.style.right = "auto";
    v.blase.hidden = false;
    v.el.classList.add("redet");
    // Blase so legen, dass die Spitze genau auf den Kopf zeigt, und im Bild halten
    const breite = v.blase.offsetWidth, kopf = GROESSE / 2, rand = 10;
    const vogelLinks = v.pos.x - GROESSE / 2;
    let links = kopf + 22 - breite;
    if (vogelLinks + links < rand) links = rand - vogelLinks;
    if (vogelLinks + links + breite > W() - rand) links = W() - rand - breite - vogelLinks;
    v.blase.style.left = links.toFixed(0) + "px";
    v.blase.style.setProperty("--spitze", Math.max(8, Math.min(breite - 22, kopf - links - 7)).toFixed(0) + "px");
    // Gesichter und wichtige Schrift nie verdecken: oben, seitlich oder unten probieren
    // und die erste Lage nehmen, die nichts verdeckt (sonst die mit der kleinsten Überdeckung)
    const andere = voegel.find((a) => a !== v && a.zustand === "sitzt" && a.pos && Math.abs(a.pos.x - v.pos.x) < 80);
    const platzLinks = vogelLinks - 4 - rand, platzRechts = W() - rand - (vogelLinks + GROESSE + 4);
    const lege = (art) => {
      v.blase.classList.remove("seitlich", "rechts-vom-vogel", "unten");
      v.blase.style.maxWidth = "";
      if (art === "oben" || art === "unten") {
        v.blase.classList.toggle("unten", art === "unten");
        v.blase.style.left = links.toFixed(0) + "px";
        return;
      }
      const linksDavon = art === "links";
      const platz = linksDavon ? platzLinks : platzRechts;
      v.blase.classList.add("seitlich");
      v.blase.classList.toggle("rechts-vom-vogel", !linksDavon);
      v.blase.style.maxWidth = Math.max(110, Math.min(250, platz)) + "px";
      const b2 = v.blase.offsetWidth;
      v.blase.style.left = (linksDavon ? -b2 - 4 : GROESSE + 4).toFixed(0) + "px";
    };
    const vorne = v.pos && v.pos.y < 140 ? ["unten", "oben"] : ["oben", "unten"];
    // seitlich zuerst weg vom Partner, sonst dorthin, wo mehr Platz ist
    const seiten = (andere ? andere.pos.x > v.pos.x : platzLinks >= platzRechts) ? ["links", "rechts"] : ["rechts", "links"];
    const reihe = [vorne[0], ...seiten.filter((x) => (x === "links" ? platzLinks : platzRechts) >= 110), vorne[1]];
    let beste = null;
    for (const art of reihe) {
      lege(art);
      const wert = verdeckung(v.blase);
      if (wert === 0) { beste = null; break; }
      if (!beste || wert < beste.wert) beste = { art, wert };
    }
    if (beste) {
      // nirgends Platz ohne ein Foto oder wichtige Schrift zu verdecken:
      // lieber schweigen und den Satz nach der nächsten Landung sagen
      if (beste.wert > 500) { v.blase.hidden = true; v.el.classList.remove("redet"); v.nachholen = satz; return; }
      lege(beste.art);
    }
    v.nachholen = null;
  }
  // Wie viel Fläche die Blase von Fotos, wichtiger Schrift oder dem Bildrand verdeckt
  function verdeckung(blase) {
    const b = blase.getBoundingClientRect();
    const intro = document.getElementById("intro");
    const sel = intro && !intro.hidden
      ? "#intro .umschlag-name, #intro .countdown-ziffern, #intro .countdown-titel, #intro .siegel, #intro .countdown-gruss, #intro .intro-hinweis"
      : ".polaroid img, .lightbox-figur img, #titel, .heute-karte .status, .zaehler-zahl";
    let summe = 0;
    // Siegel, Countdown-Ziffern und Name dürfen gar nicht verdeckt werden (zählt so stark, dass der Vogel lieber schweigt)
    const streng = "#intro .siegel, #intro .countdown-ziffern, #intro .umschlag-name";
    document.querySelectorAll(sel).forEach((e) => {
      const r = e.getBoundingClientRect();
      if (!r.width) return;
      const w = Math.min(b.right, r.right - 4) - Math.max(b.left, r.left + 4), h = Math.min(b.bottom, r.bottom - 4) - Math.max(b.top, r.top + 4);
      if (w > 0 && h > 0) summe += w * h * (e.matches(streng) ? 100 : 1);
    });
    // außerhalb des Bildschirms zählt doppelt
    const aussen = Math.max(0, 4 - b.top) + Math.max(0, b.bottom - (window.innerHeight - 4)) + Math.max(0, 4 - b.left) + Math.max(0, b.right - (W() - 4));
    return summe + aussen * b.width * 2;
  }

  // 10 Sekunden nach dem Sprechen (oder Landen) geht es los
  // 10 Sekunden nach dem ersten Gruß, nach jeder weiteren Landung 15 Sekunden.
  // Das Weibchen fliegt nie allein los, es folgt dem Männchen.
  function planeAbflug(v) {
    clearTimeout(v.flugTimer);
    if (ruhig || v.partner) return;
    v.flugTimer = setTimeout(() => fliegeWeg(v), v.gelandet ? 15000 : 10000);
  }

  function animiere(v, punkte, dauer, zielFn) {
    // nur der jeweils neueste Flug bewegt den Vogel
    const id = (v.flugId = (v.flugId || 0) + 1);
    return new Promise((fertig) => {
      const start = performance.now();
      let letztes = punkte[0];
      function schritt(t) {
        const u = Math.min(1, (t - start) / dauer);
        const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        if (zielFn) { const z = zielFn(); if (z) punkte[punkte.length - 1] = z; }
        const p = punktAuf(punkte, e);
        if (Math.abs(p.x - letztes.x) > 0.5) v.blick = p.x > letztes.x ? 1 : -1;
        letztes = p;
        setzePosition(v, p);
        if (v.flugId !== id) { fertig(); return; }
        if (u < 1 && v.zustand === "fliegt") requestAnimationFrame(schritt); else fertig();
      }
      requestAnimationFrame(schritt);
    });
  }

  async function fliegeWeg(v) {
    if (v.zustand !== "sitzt" || document.hidden) { planeAbflug(v); return; }
    v.blase.hidden = true; v.el.classList.remove("redet");
    v.zustand = "fliegt";
    v.el.classList.add("fliegt");
    const route = ROUTEN[Math.floor(Math.random() * ROUTEN.length)](v.pos);
    const folger = voegel.find((a) => a.partner === v && a.zustand === "sitzt");
    if (folger) setTimeout(() => fliegeWeg(folger), 700);
    await animiere(v, route, 2400 + Math.random() * 900);
    if (v.zustand !== "fliegt" || v.auftrag) return;
    v.el.hidden = true;
    if (v.partner) {
      // warten, bis das Männchen seinen neuen Platz ausgesucht hat
      while (!v.partner.ziel && v.partner.zustand !== "sitzt") await new Promise((r) => setTimeout(r, 200));
      await new Promise((r) => setTimeout(r, 600));
    } else {
      await new Promise((r) => setTimeout(r, 2500 + Math.random() * 3000));
    }
    lande(v, false);
  }

  // Das Weibchen sitzt direkt neben dem Männchen
  function sitzpunkt(v, k, name) {
    const f = plaetze(k)[name];
    const p = f && f();
    if (!p) return null;
    if (!v.partner) return p;
    const rechts = p.x + 50 < W() - 20;
    return { x: p.x + (rechts ? 46 : -46), y: p.y };
  }
  function freierPlatz(v, k) {
    if (v.partner) return v.partner.ziel || v.partner.platz;
    const liste = Object.keys(plaetze(k)).filter((name) => name !== v.platz && !voegel.some((a) => a !== v && a.platz === name && a.kontext === k) && plaetze(k)[name]());
    if (!liste.length) return null;
    return liste[Math.floor(Math.random() * liste.length)];
  }

  async function lande(v, sofort, ersterPlatz) {
    if (v.auftrag) return;
    const k = kontext();
    if (!k) { v.zustand = "weg"; v.el.hidden = true; v.platz = null; await new Promise((r) => setTimeout(r, 1000)); return lande(v, sofort, ersterPlatz); }
    let name = sofort || ersterPlatz ? (v.partner ? freierPlatz(v, k) : ERSTER_PLATZ[k]) : freierPlatz(v, k);
    // ist der Lieblingsplatz gerade nicht frei (zum Beispiel zu wenig Platz am Handy), einen anderen nehmen
    if (name && !sitzpunkt(v, k, name)) name = freierPlatz(v, k);
    const zielFn = name && (() => sitzpunkt(v, k, name));
    if (!zielFn || !zielFn()) { await new Promise((r) => setTimeout(r, 1500)); return lande(v, sofort, ersterPlatz); }
    v.ziel = name;
    v.platz = name; v.kontext = k;
    v.el.classList.toggle("im-countdown", k === "countdown");
    if (sofort || ruhig) {
      v.zustand = "sitzt"; v.el.classList.remove("fliegt"); v.el.hidden = false; v.ziel = null;
      setzePosition(v, zielFn());
      return;
    }
    // Anflug von außerhalb des Bildschirms
    const z = zielFn(), vonLinks = Math.random() < 0.5;
    const start = { x: vonLinks ? -80 : W() + 80, y: Math.max(-60, z.y - 200 - Math.random() * 120) };
    const mitte = { x: (start.x + z.x) / 2 + (vonLinks ? 40 : -40), y: Math.min(start.y, z.y) - 60 };
    v.zustand = "fliegt"; v.el.classList.add("fliegt"); v.el.hidden = false;
    await animiere(v, [start, mitte, { x: z.x + (vonLinks ? -30 : 30), y: z.y - 30 }, z], 2600, zielFn);
    if (v.zustand !== "fliegt" || v.auftrag) return;
    v.zustand = "sitzt"; v.el.classList.remove("fliegt"); v.ziel = null;
    v.el.classList.remove("hopst"); void v.el.offsetWidth; v.el.classList.add("hopst");
    v.gelandet = (v.gelandet || 0) + 1;
    if (v.nachholen) {
      const satz = v.nachholen;
      setTimeout(() => { if (v.zustand === "sitzt" && v.nachholen === satz) { zeigeBlase(v, satz); setTimeout(() => { v.blase.hidden = true; v.el.classList.remove("redet"); }, 5000); } }, 1200);
    }
    planeAbflug(v);
  }

  // Sitzende Vögel bleiben beim Scrollen auf ihrem Platz
  function festhalten() {
    for (const v of voegel) {
      if (v.zustand !== "sitzt") continue;
      const k = kontext();
      if (k !== v.kontext && v.partner) { v.zustand = "weg"; v.el.hidden = true; v.platz = null; v.blase.hidden = true; setTimeout(() => lande(v, false), 1800); continue; }
      if (k !== v.kontext) { v.zustand = "weg"; v.el.hidden = true; clearTimeout(v.flugTimer); v.timer.forEach(clearTimeout); v.blase.hidden = true; v.platz = null; lande(v, true).then(() => { if (v === voegel[0] || v.weiblich) setTimeout(() => sprich(v), 2000); }); continue; }
      // nur nachführen, wenn sich der Platz auf der Seite wirklich verschoben hat
      const p = sitzpunkt(v, k, v.platz);
      if (p && v.seite) {
        const dx = p.x + window.scrollX - v.seite.x, dy = p.y + window.scrollY - v.seite.y;
        const schwelle = k === "countdown" ? 0.2 : 1.5;
        if (Math.abs(dx) > schwelle || Math.abs(dy) > schwelle) setzePosition(v, p);
      }
    }
    requestAnimationFrame(festhalten);
  }

  /* ---------- Was die Vögel sagen ---------- */
  const erstesEi = Math.min(...(KALENDER.eastereggs || []).map((e) => e.ab || 99));
  const HINWEIS = "Psst … auf dieser Seite sind Geheimnisse versteckt 🤫 Wenn ein Emoji mal an einer komischen Stelle ist, lohnt sich ein Klick darauf!";
  // An einigen Tagen verrät das Rotkehlchen eine kleine Überraschung zum Antippen
  const abends = () => /abend|nacht/.test(document.documentElement.getAttribute("data-tageszeit") || "");
  const TIPPS = {
    2: () => "Psst … tipp mal auf eine brennende Kerze am Adventskranz 🕯️",
    7: () => "Psst … die Lichterkette mag es, wenn man sie antippt ✨",
    9: () => "Psst … halt mal ein Polaroid oben ein bisschen gedrückt 📸",
    12: () => "Psst … tipp mal auf eine Weihnachtskugel oben in der Ecke 🎄 Mit Ton klingt sie sogar!",
    15: () => abends() ? "Psst … tipp heute mal auf den Mond 🌙" : "Psst … wenn die Sonne scheint, tipp sie mal an ☀️",
    18: () => "Psst … schau mal, was die zwei Capys ganz unten machen, wenn du sie antippst 😘",
    22: () => abends() ? "Psst … tipp mal auf den Mond, aber nur, wenn du dir was wünschen willst 🌠" : "Psst … heute Abend lohnt sich ein Tipp auf den Mond 🌙",
    1: () => "Psst … unter dem Kalender liegt Plätzchenteig. Tipp mal drauf 🍪",
    3: () => "Psst … im Dorf ganz unten steht ein Briefkasten. Schau mal, ob Post für dich drin ist ✉️",
    6: () => "Psst … unten im Schnee liegt eine kleine Kugel. Daraus lässt sich bestimmt was bauen ⛄",
    10: () => "Psst … schüttel mal die Schneekugel neben dem Adventskranz ❄️",
    11: () => abends() ? "Psst … oben blinkt heute ein Stern. Tipp ihn an und wünsch dir was 🌟" : "Psst … heute Abend blinkt oben ein Stern. Dem darfst du einen Wunsch verraten 🌟",
    14: () => "Psst … leg mal einen Daumen ganz an den linken und einen ganz an den rechten Rand und halt kurz fest 🌿",
    16: () => "Psst … tipp mal auf ein Fenster unten im Dorf. Mal sehen, was die Capys gerade machen 🏠",
    19: () => "Psst … tipp mal auf einen Schornstein im Dorf 🏡",
    20: () => "Psst … heute fallen ab und zu goldene Schneeflocken. Fang mal 5 Stück ✨",
    23: () => "Psst … zieh mal ein Birnchen der Lichterkette nach unten 💡",
  };
  const tag = () => (ak.kalenderDatum ? ak.kalenderDatum() : ak.intro.datum());
  const wahl = (liste) => liste[Math.floor(Math.random() * liste.length)];
  // Countdown vor dem Geburtstag (bis 26.11., 0:00 Uhr)
  const vorGeburtstag = () => kontext() === "countdown" && ak.intro.phase() === "warten";
  // Der Munkelvogel spricht immer selbst und sagt immer „Toni“
  // Besondere Tage: Toni arbeitet am 13., 14., 16., 18. und 19.11. abends, am 15.11. ist Brunch mit Karla und Chris
  function tagesGruss(d) {
    if (d.jahr !== KALENDER.jahr || d.monat !== 11 || (ak.zeitreise && ak.zeitreise.aktiv())) return null;
    const h = d.stunde, t = d.tag;
    // Tage, an denen Toni abends arbeitet
    const ARBEIT = [13, 14, 16, 18, 19];
    const wochenende = [0, 6].includes(new Date(Date.UTC(d.jahr, d.monat - 1, t)).getUTCDay());
    if (ARBEIT.includes(t)) {
      if (h >= 5 && h < 12) return !wochenende
        ? wahl(["Guten Morgen, Toni ☀️ Heute Abend musst du noch arbeiten. Ich wünsch dir jetzt schon eine entspannte Schicht!", "Morgen, Toni ☀️ Hab einen schönen Schultag, und heute Abend eine ganz ruhige Schicht!"])
        : wahl(["Guten Morgen, Toni ☀️ Genieß deinen Samstag! Und heute Abend wünsch ich dir eine schöne, entspannte Schicht.", "Morgen, Toni ☀️ Mach dir einen schönen Tag. Die Schicht heute Abend wird bestimmt ganz entspannt!"]);
      if (h >= 12 && h < 17) return wahl(["Hi Toni! Heute Abend musst du arbeiten. Ich wünsch dir eine schöne Schicht, ohne viel Stress 🍀", "Hallo Toni! Genieß noch die Zeit vor der Arbeit. Ich drück dir die Daumen für eine ruhige Schicht ☕"]);
      if (h >= 17 && h < 23) return wahl(["Hi Toni! Du bist bestimmt gerade bei der Arbeit. Ich halte hier solange die Stellung 🐦", "Hey Toni! Ich wünsch dir eine schöne Schicht, hoffentlich ist heute alles ganz entspannt 🍀", "Hallo Toni! Ich hoffe, die Schicht ist heute nicht zu anstrengend. Ich halte hier solange die Stellung 🐦"]);
      if (h >= 23) return t === 14
        ? "Na Toni, Feierabend? Ich hoffe, die Schicht war schön entspannt. Morgen ist Brunch mit Karla und Chris 🥐"
        : "Na Toni, Feierabend? Ich hoffe, die Schicht war schön entspannt. Ruh dich gut aus 🌙";
    }
    // nach Mitternacht: Feierabend nach der Schicht vom Vortag
    if (h < 5 && ARBEIT.includes(t - 1)) return t === 15
      ? "Feierabend, Toni! Schlaf schön, um 11 Uhr ist schon Brunch mit Karla und Chris 🥐"
      : "Feierabend, Toni! Ich hoffe, die Schicht war nicht zu anstrengend. Schlaf schön 🌙";
    // Klausuren: 23.11. Erdkunde, 25.11. Englisch
    if (t === 22 && h >= 17) return wahl(["Hi Toni! Morgen schreibst du Erdkunde. Du bist bestens vorbereitet, schlaf heute gut 🌙", "Hallo Toni! Morgen ist die Erdkundeklausur. Ich glaub ganz fest an dich 🍀"]);
    if (t === 24 && h >= 17) return wahl(["Hi Toni! Morgen schreibst du Englisch. Du bist so gut vorbereitet, das wird super 🌙", "Hallo Toni! Morgen ist die Englischklausur. Ich drück dir jetzt schon alle Federn 🍀"]);
    if (t === 23) {
      if (h >= 5 && h < 14) return wahl(["Guten Morgen, Toni ☀️ Heute ist die Erdkundeklausur. Du schaffst das, ich glaub ganz fest an dich! 🍀", "Morgen, Toni ☀️ Heute schreibst du Erdkunde. Du bist so gut vorbereitet, das wird super! 🍀"]);
      if (h >= 14) return wahl(["Hi Toni! Wie lief die Erdkundeklausur? Ich bin sicher, du warst super 🍀", "Hallo Toni! Erdkunde ist geschrieben. Jetzt kannst du dich erstmal ausruhen 🥰"]);
    }
    if (t === 25) {
      if (h >= 5 && h < 14) return wahl(["Guten Morgen, Toni ☀️ Heute ist die Englischklausur, und morgen hast du Geburtstag! Du schaffst das 🍀", "Morgen, Toni ☀️ Heute schreibst du Englisch. Ich glaub ganz fest an dich! 🍀"]);
      if (h >= 14) return wahl(["Hi Toni! Wie lief die Englischklausur? Und jetzt nur noch einmal schlafen bis zu deinem Geburtstag 🎂", "Hallo Toni! Englisch ist geschrieben. Jetzt darfst du dich ganz auf morgen freuen 🎂"]);
    }
    if (t === 15) {
      if (h >= 5 && h < 11) return wahl(["Guten Morgen, Toni ☀️ Um 11 Uhr ist Brunch mit Karla und Chris! Lasst es euch richtig schmecken 🥐", "Morgen, Toni ☀️ Heute um 11 Uhr geht es mit Karla und Chris zum Brunch. Ich bin ein bisschen neidisch 🥐"]);
      if (h >= 11 && h < 14) return wahl(["Hi Toni! Guten Appetit beim Brunch mit Karla und Chris 🥐 Grüß die beiden lieb von mir!", "Hallo Toni! Lasst es euch zu dritt schmecken, und hebt mir ein Croissant auf 🥐"]);
      if (h >= 14 && h < 18) return wahl(["Hi Toni! Wie war der Brunch mit Karla und Chris? Ich hoffe, ihr hattet richtig viel Spaß ☕", "Hallo Toni! Na, satt vom Brunch? Erzähl mal, war es schön mit Karla und Chris? 🥰"]);
      return wahl(["Hi Toni! Wie war der restliche Tag mit Chris? Ich hoffe, ihr hattet es richtig schön 🥰", "Schönen Sonntagabend, Toni! Wie war der Rest des Tages mit Chris? 🕯️"]);
    }
    return null;
  }
  function grussVogel() {
    const zeit = document.documentElement.getAttribute("data-tageszeit") || "mittag";
    const d = ak.intro.datum();
    const besonders = tagesGruss(d);
    if (besonders) return besonders;
    if (d.monat === 11 && d.tag === 26) return wahl(["Hi Toni! Happy Birthday 🎂", "Hallo Toni! Alles Liebe zum Geburtstag 🎂", "Hey Toni! Happy Birthday, heute ist dein Tag 🎂"]);
    const wochentag = new Date(Date.UTC(d.jahr, d.monat - 1, d.tag)).getUTCDay();
    // Weihnachtsferien vom 23.12. bis 6.1.
    const ferien = (d.monat === 12 && d.tag >= 23) || (d.monat === 1 && d.tag <= 6);
    const schultag = wochentag >= 1 && wochentag <= 5 && !ferien;
    const G = {
      morgen: schultag ? [
        "Hi Toni! Guten Morgen ☀️ Ich wünsch dir einen schönen Schultag!",
        "Morgen, Toni ☀️ Hab einen tollen Tag in der Schule!",
        "Hallo Toni! Ich drück dir die Daumen für einen schönen Schultag ☀️",
        "Hey Toni, guten Morgen! Hab einen richtig guten Tag in der Schule 📚",
        "Hi Toni! Einen wunderschönen guten Morgen ☀️ Hab einen schönen Schultag!",
      ] : ferien ? [
        "Hi Toni! Guten Morgen ☀️ Genieß deine Ferien!",
        "Morgen, Toni ☀️ Ferien! Ganz viel Zeit für dich!",
        "Hallo Toni! Ich wünsch dir einen gemütlichen Ferientag ☀️",
      ] : [
        "Hi Toni! Guten Morgen ☀️ Genieß dein Wochenende!",
        "Morgen, Toni ☀️ Heute ist keine Schule, ganz viel Zeit für dich!",
        "Hallo Toni! Ich wünsch dir einen gemütlichen Tag ☀️",
      ],
      vormittag: ["Hi Toni! Einen schönen Vormittag 🌤️", "Hallo Toni! Ich hoffe, dein Vormittag ist schön 🌤️", "Hey Toni! Ich wünsch dir einen tollen Vormittag 🌤️"],
      mittag: ["Hi Toni! Guten Mittag 🌞", "Hallo Toni! Lass es dir schmecken 🌞", "Hey Toni! Ich wünsch dir eine schöne Mittagspause 🌞"],
      nachmittag: ["Hi Toni! Einen gemütlichen Nachmittag 🍪", "Hallo Toni! Wie war dein Tag bis jetzt? 🍪", "Hey Toni, schön, dass du da bist! Genieß den Nachmittag 🍪"],
      abend: ["Hi Toni! Guten Abend 🕯️", "Hallo Toni! Mach es dir gemütlich 🕯️", "Hey Toni! Ich wünsch dir einen entspannten Abend 🕯️"],
      nacht: ["Hi Toni! Schlaf gleich schön 🌙", "Gute Nacht, Toni! Träum was Schönes 🌙", "Na, Toni, noch wach? Schlaf gleich gut 🌙"],
    };
    return wahl(G[zeit] || G.mittag);
  }
  const GEHEIMNIS = [
    "Wenn du wüsstest, was an deinem Geburtstag passiert … 🤫",
    "Ich weiß da etwas über deinen Geburtstag. Aber ich verrate nichts 🤐",
    "Psst … an deinem Geburtstag wartet etwas ganz Besonderes auf dich 🎁",
    "Wenn du ahnen würdest, was an deinem Geburtstag los ist … 😏",
    "Ich darf nichts sagen, aber dein Geburtstag wird richtig schön 🤭",
    "Ein Vögelchen hat mir gezwitschert, was an deinem Geburtstag passiert. Ich schweige wie ein Grab 🤐",
    "Du hast ja keine Ahnung, was an deinem Geburtstag auf dich wartet … 🎂",
    "Ich kenne ein Geheimnis über deinen Geburtstag. Und es ist ein schönes 🤫",
    "Wenn du wüsstest, was hier an deinem Geburtstag los ist, würdest du jetzt schon strahlen ✨",
    "Mehr verrate ich nicht, aber freu dich auf deinen Geburtstag 😉",
  ];
  const DANKE = [
    "Danke für die Einladung 🥰",
    "Vielen Dank, dass ich auch kommen darf ♥️",
    "Danke, dass du mich eingeladen hast 😊",
    "Wie lieb von dir, danke für die Einladung 🥰",
    "Danke schön! Ich freu mich so, dass ich dabei sein darf ♥️",
    "Ich bedanke mich ganz herzlich für die Einladung 🌸",
  ];
  const NEIN = [
    "Ist nicht schlimm. Dann haben wir mehr Zeit zu zweit 😊",
    "Alles gut! Dann bleibt mehr Zeit nur für uns zwei 😊",
    "Kein Problem, dann sind wir eben zu zweit 🥰",
    "Macht nichts, dann hab ich dich ganz für mich allein 😉",
  ];
  const FRAGE = [
    "Darf meine Partnerin auch vorbeikommen? 🥺",
    "Ist es okay für dich, wenn meine Partnerin auch kommt? 🥺",
    "Darf meine Liebste auch dazukommen? 🥺",
    "Darf ich meine Partnerin dazuholen? 🥺",
  ];
  function saetzeMaennchen() {
    if (vorGeburtstag()) {
      // Hinweise auf die Entdeckungen des Tages (wartezeit.js), sonst ein Geheimnis
      let h = null;
      try { h = ak.wartezeitHinweis ? ak.wartezeitHinweis() : null; } catch (_) { h = null; }
      return [grussVogel(), h || wahl(GEHEIMNIS)];
    }
    const liste = [grussVogel()];
    const d = tag();
    if (d.jahr === KALENDER.jahr && d.monat === 12 && d.tag === erstesEi - 1) liste.push(HINWEIS);
    else if (d.jahr === KALENDER.jahr && d.monat === 12 && TIPPS[d.tag]) liste.push(TIPPS[d.tag]());
    return liste;
  }
  function saetzeWeibchen() {
    if (vorGeburtstag() || weibchenEingeladen) return [wahl(DANKE)];
    const d = ak.intro.datum();
    if (d.monat === 11 && d.tag === 26) return ["Happy Birthday, Toni! Wir zwei feiern heute mit dir 🎂"];
    if (d.monat === 12 && d.tag === 21) return ["Wir zwei feiern heute mit euch. Ein Jahr, wie schön ♥️"];
    if (d.monat === 12 && d.tag === 24) return ["Frohe Weihnachten! Heute sind wir zu zweit für dich da 🎄"];
    return ["Wir zwei sind heute zusammen hier ♥️"];
  }
  // Zu zweit: am Geburtstag, am Jahrestag und an Heiligabend
  function zuZweit() {
    const d = ak.intro.datum();
    return d.jahr === KALENDER.jahr && ((d.monat === 11 && d.tag === 26) || (d.monat === 12 && (d.tag === 21 || d.tag === 24)));
  }

  /* ---------- Frage nach der Partnerin (vor dem Geburtstag) ---------- */
  let frageBeantwortet = false, weibchenEingeladen = false, frageTimer = null;
  function frage(v) {
    v.timer.forEach(clearTimeout); v.timer = [];
    clearTimeout(v.flugTimer);
    v.fragt = true;
    zeigeBlase(v, wahl(FRAGE));
    if (v.blase.hidden) { v.fragt = false; planeAbflug(v); return; }
    const knoepfe = document.createElement("span");
    knoepfe.className = "vogel-wahlen";
    knoepfe.innerHTML = '<span class="vogel-wahl ja" role="button" tabindex="0" data-antwort="ja">Ja 🥰</span><span class="vogel-wahl nein" role="button" tabindex="0" data-antwort="nein">Nein</span>';
    v.blase.appendChild(knoepfe);
    v.blase.classList.add("mit-wahl");
    // Lage der Blase mit den Knöpfen neu prüfen
    zeigeBlaseNeuLegen(v);
    clearTimeout(frageTimer);
    frageTimer = setTimeout(() => { if (v.fragt) { v.fragt = false; v.blase.hidden = true; v.blase.classList.remove("mit-wahl"); v.el.classList.remove("redet"); planeAbflug(v); } }, 20000);
  }
  function zeigeBlaseNeuLegen(v) {
    const inhalt = [...v.blase.childNodes];
    const text = v.blase.firstChild && v.blase.firstChild.nodeType === 3 ? v.blase.firstChild.nodeValue : "";
    zeigeBlase(v, text);
    inhalt.filter((k) => k.nodeType === 1).forEach((k) => v.blase.appendChild(k));
  }
  function antworte(v, antwort) {
    if (!v.fragt) return;
    v.fragt = false;
    clearTimeout(frageTimer);
    frageBeantwortet = true;
    v.blase.classList.remove("mit-wahl");
    if (antwort === "ja") {
      if (ak.entdeckt) ak.entdeckt("vogeline");
      zeigeBlase(v, wahl(["Juhu, ich sag ihr Bescheid! 🥰", "Wie schön! Sie ist gleich da 🥰", "Danke! Ich ruf sie sofort 🥰"]));
      v.timer.push(setTimeout(() => { v.blase.hidden = true; v.el.classList.remove("redet"); }, 2600));
      weibchenEingeladen = true;
      setTimeout(holeWeibchen, 1400);
      v.timer.push(setTimeout(() => planeAbflug(v), 2600));
    } else {
      zeigeBlase(v, wahl(NEIN));
      v.timer.push(setTimeout(() => { v.blase.hidden = true; v.el.classList.remove("redet"); planeAbflug(v); }, 5000));
    }
  }
  // Tastatur: Enter oder Leertaste auf Ja oder Nein
  ebene.addEventListener("keydown", (e) => {
    const w = e.target.closest && e.target.closest(".vogel-wahl");
    if (w && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); e.stopPropagation(); antworte(maennchen, w.dataset.antwort); }
  });
  // An vier Tagen vor dem Geburtstag bringt sie zehn Freunde mit
  const SCHWARM_TAGE = [13, 17, 20, 24];
  const ANKUENDIGUNG = [
    "Danke für die Einladung! Ich hab noch ein paar Freunde mitgebracht 🥳",
    "Danke, dass ich kommen darf! Und schau mal, wer da noch kommt 🥳",
    "Wie lieb, danke! Meine Freunde wollten unbedingt auch mit 🥳",
  ];
  function holeWeibchen() {
    if (weibchen) return;
    const d = ak.intro.datum();
    const mitFreunden = d.jahr === KALENDER.jahr && d.monat === 11 && SCHWARM_TAGE.includes(d.tag);
    weibchen = erstelleVogel(true, saetzeWeibchen);
    weibchen.partner = maennchen;
    lande(weibchen, false).then(() => setTimeout(() => {
      if (weibchen.zustand !== "sitzt") return;
      if (mitFreunden) {
        // erst kündigt sie ihre Freunde an, dann kommen sie angeflogen
        weibchen.timer.forEach(clearTimeout); weibchen.timer = [];
        weibchen.hatGesprochen = true;
        zeigeBlase(weibchen, wahl(ANKUENDIGUNG));
        weibchen.timer.push(setTimeout(() => { weibchen.blase.hidden = true; weibchen.el.classList.remove("redet"); }, 4200));
        setTimeout(schwarm, 1800);
      } else sprich(weibchen);
    }, 1200));
  }
  // Zehn Plätze rund um den Umschlag: oben, an beiden Seiten und unten, nie auf Schrift
  function schwarmPlaetze() {
    const u = document.getElementById("umschlag");
    if (!u || !sichtbar(u)) return [];
    const r = u.getBoundingClientRect();
    const frei = (q) => !voegel.some((v) => v.pos && Math.abs(v.pos.x - q.x) < 40 && Math.abs(v.pos.y - q.y) < 60);
    // oben so viele Plätze, dass neben dem Paar noch genug frei bleiben
    const oben = Math.max(6, Math.min(9, Math.floor((r.width - 30) / 38)));
    const p = [];
    const platz = (links, wo, plus) => { const fn = () => ankerPunkt(links, wo, plus); const q = fn(); return q && Object.assign(q, { fn }); };
    for (let i = 0; i < oben; i++) p.push(platz("calc(20px + (100% - 40px) * " + (i / (oben - 1)).toFixed(3) + ")", "oben", 3));
    // auf der unteren Kante des Umschlags, links und rechts vom Namen
    for (const links of ["24px", "calc(100% - 24px)", "19%", "81%", "32%", "68%"]) p.push(platz(links, "unten", 2));
    return p.filter((q) => q && frei(q)).slice(0, 10);
  }
  async function schwarm() {
    if (ak.entdeckt) ak.entdeckt("freunde");
    if (ruhig) return;
    const plaetze = schwarmPlaetze();
    const gaeste = plaetze.map((ziel, i) => {
      const el = document.createElement("span");
      el.className = "vogel gast";
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = vogelSvg(false, FREUNDE[i % FREUNDE.length]);
      // bis zum eigenen Abflug unsichtbar, sonst stünde er kurz oben links
      el.style.visibility = "hidden";
      ebene.appendChild(el);
      return { el, zustand: "fliegt", blick: 1, ziel };
    });
    // in kleinen Grüppchen mit Pausen, nach gut 10 Sekunden sind alle da
    const GRUPPEN = [[0, 2], [2000, 1], [3600, 3], [6400, 2], [7900, 2]];
    const startZeit = [];
    GRUPPEN.forEach(([t, n]) => { for (let k = 0; k < n; k++) startZeit.push(t + k * 300); });
    await Promise.all(gaeste.map((g, i) => new Promise((r) => setTimeout(r, startZeit[i] || i * 1000)).then(() => {
      const vonLinks = i % 2 === 0;
      const start = { x: vonLinks ? -60 : W() + 60, y: g.ziel.y - 160 - Math.random() * 140 };
      // erst außerhalb des Bildes hinsetzen, dann sichtbar machen
      g.blick = vonLinks ? 1 : -1;
      setzePosition(g, start);
      g.el.style.visibility = "";
      const mitte = { x: (start.x + g.ziel.x) / 2, y: Math.min(start.y, g.ziel.y) - 50 };
      g.el.classList.add("fliegt");
      return animiere(g, [start, mitte, { x: g.ziel.x + (vonLinks ? -24 : 24), y: g.ziel.y - 24 }, g.ziel], 2000 + Math.random() * 700).then(() => {
        g.zustand = "sitzt"; g.el.classList.remove("fliegt"); g.blick = g.ziel.x > W() / 2 ? -1 : 1; setzePosition(g, g.ziel);
        const mit = () => { if (g.zustand !== "sitzt" || !g.el.isConnected) return; const q = g.ziel.fn && g.ziel.fn(); if (q) setzePosition(g, q); requestAnimationFrame(mit); };
        requestAnimationFrame(mit);
        g.el.classList.add("hopst");
      });
    })));
    // ein bisschen herumhüpfen und dann gemeinsam wieder losfliegen
    const hops = setInterval(() => { const g = gaeste[Math.floor(Math.random() * gaeste.length)]; if (g.zustand !== "sitzt") return; g.el.classList.remove("hopst"); void g.el.offsetWidth; g.el.classList.add("hopst"); }, 700);
    // Sicherheitsnetz: nach spätestens 20 Sekunden sind alle Gäste wieder weg
    const aufraeumen = setTimeout(() => gaeste.forEach((g) => g.el.remove()), 40000);
    await new Promise((r) => setTimeout(r, 9000));
    clearInterval(hops);
    await Promise.all(gaeste.map((g, i) => new Promise((r) => setTimeout(r, i * 120)).then(() => {
      g.zustand = "fliegt"; g.el.classList.remove("hopst"); g.el.classList.add("fliegt");
      const nachRechts = g.ziel.x > W() / 2;
      return animiere(g, [g.ziel, { x: g.ziel.x + (nachRechts ? 40 : -40), y: g.ziel.y - 80 }, { x: nachRechts ? W() + 80 : -80, y: g.ziel.y - 260 - Math.random() * 120 }], 1800 + Math.random() * 600);
    })));
    clearTimeout(aufraeumen);
    gaeste.forEach((g) => g.el.remove());
  }

  /* ---------- Start ---------- */
  const maennchen = erstelleVogel(false, saetzeMaennchen);
  let weibchen = null;
  const warten = setInterval(() => {
    if (!ak.intro.bereit() || !grussQuelle.textContent) return;
    if (!kontext()) return;
    clearInterval(warten);
    requestAnimationFrame(festhalten);
    // Erst wenn die Animation des Tages vorbei ist (und noch 3 Sekunden mehr),
    // fliegt der Munkelvogel ins Bild
    wartAufRuhe().then(() => {
      lande(maennchen, false, true).then(() => setTimeout(() => sprich(maennchen), 2000));
      if (zuZweit()) {
        weibchen = erstelleVogel(true, saetzeWeibchen);
        weibchen.partner = maennchen;
        setTimeout(() => lande(weibchen, false).then(() => setTimeout(() => { if (weibchen.zustand === "sitzt") sprich(weibchen); }, 5200)), 3800);
      }
    });
  }, 250);

  // Läuft gerade eine Szene des Tages (Capy Special, Aufbau, Postbote)?
  const szeneLaeuft = () => !!document.querySelector(".special-buehne, .aufbau-buehne");
  // Gibt es heute eine Szene, die gleich von selbst startet?
  function szeneErwartet() {
    const d = ak.intro.datum();
    if (d.jahr !== KALENDER.jahr || d.monat !== 11) return false;
    if (kontext() === "countdown") return ak.intro.phase() === "warten" && d.tag >= 11 && d.tag <= 25;
    return d.tag >= 27 && d.tag <= 30;
  }
  function wartAufRuhe() {
    return new Promise((fertig) => {
      const start = performance.now();
      const erwartet = szeneErwartet();
      let gesehen = false, ruhigSeit = null;
      const t = setInterval(() => {
        const jetzt = performance.now();
        if (szeneLaeuft()) { gesehen = true; ruhigSeit = null; return; }
        // auf eine angekündigte Szene höchstens 6 Sekunden warten
        if (erwartet && !gesehen && jetzt - start < 6000) return;
        if (ruhigSeit === null) ruhigSeit = jetzt;
        if (jetzt - ruhigSeit >= (gesehen ? 3000 : 0) || jetzt - start > 120000) { clearInterval(t); fertig(); }
      }, 200);
    });
  }

  // Von außen: das Rotkehlchen sagt einen Satz, falls es gerade sitzt (sonst false)
  function sage(satz) {
    const v = voegel[0];
    if (!v || v.zustand !== "sitzt" || v.el.hidden) return false;
    const r = v.el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return false;
    v.timer.forEach(clearTimeout); v.timer = [];
    clearTimeout(v.flugTimer);
    zeigeBlase(v, satz);
    v.timer.push(setTimeout(() => { v.blase.hidden = true; v.el.classList.remove("redet"); planeAbflug(v); }, 5600));
    return true;
  }
  /* ---------- Besondere Aufträge (z. B. die Kerze vor einer Klausur) ---------- */
  // Zu einem Punkt fliegen und dort sitzen bleiben
  async function fliegeZu(zielFn) {
    const v = maennchen, z0 = zielFn();
    if (!z0) return false;
    v.auftrag = true;
    v.timer.forEach(clearTimeout); v.timer = []; clearTimeout(v.flugTimer);
    v.blase.hidden = true; v.el.classList.remove("redet"); v.fragt = false;
    const start = v.zustand === "sitzt" && !v.el.hidden && v.pos ? v.pos : { x: W() + 80, y: Math.max(-60, z0.y - 220) };
    v.zustand = "fliegt"; v.el.hidden = false; v.el.classList.add("fliegt");
    await animiere(v, [start, { x: (start.x + z0.x) / 2, y: Math.min(start.y, z0.y) - 70 }, { x: z0.x + 26, y: z0.y - 24 }, z0], 2000, zielFn);
    v.zustand = "sitzt"; v.el.classList.remove("fliegt"); v.platz = null; v.ziel = null;
    v.el.classList.remove("hopst"); void v.el.offsetWidth; v.el.classList.add("hopst");
    return true;
  }
  // Etwas sagen und warten, bis die Blase wieder weg ist
  function sagKurz(text, ms) {
    const v = maennchen;
    zeigeBlase(v, text);
    return new Promise((fertig) => setTimeout(() => { v.blase.hidden = true; v.el.classList.remove("redet"); fertig(); }, ms || 3800));
  }
  // Mit etwas im Schnabel davonfliegen und später wiederkommen
  async function fliegeDavon(mit) {
    const v = maennchen;
    if (!v.pos) return;
    v.blase.hidden = true; v.zustand = "fliegt"; v.el.classList.add("fliegt");
    let lauf = true;
    const trage = () => {
      if (!lauf || !mit) return;
      mit.style.left = v.pos.x + "px"; mit.style.top = v.pos.y - 14 + "px";
      requestAnimationFrame(trage);
    };
    trage();
    const s = v.pos;
    await animiere(v, [s, { x: s.x + 40, y: s.y - 80 }, { x: s.x + 160, y: s.y - 220 }, { x: W() + 100, y: -100 }], 3200);
    lauf = false;
    v.el.hidden = true;
    if (mit) mit.remove();
    v.auftrag = false; v.zustand = "weg";
    setTimeout(() => lande(v, false), 5000);
  }
  function weiter() { maennchen.auftrag = false; maennchen.hatGesprochen = true; planeAbflug(maennchen); }
  // Der Munkelvogel ist frei für einen Auftrag: gelandet, hat gesprochen, keine Frage offen, alle Vögel still
  const istDa = () => maennchen.zustand === "sitzt" && !maennchen.el.hidden && maennchen.hatGesprochen && !maennchen.fragt &&
    voegel.every((v) => v.blase.hidden) && (!weibchen || (weibchen.zustand === "sitzt" && weibchen.hatGesprochen)) && !document.querySelector(".vogel.gast");
  window.adventkalender.voegel = { voegel, sage, fliegeZu, sagKurz, fliegeDavon, weiter, istDa, frage: () => {
    // erst wenn er gelandet ist und seine Sätze gesagt hat (höchstens 30 Sekunden warten)
    let n = 0;
    const los = () => {
      const v = maennchen;
      if (weibchen || frageBeantwortet || v.fragt) return;
      if (v.zustand === "sitzt" && v.hatGesprochen && v.blase.hidden) { frage(v); return; }
      if (++n < 60) setTimeout(los, 500);
    };
    los();
  }, fliegeWeg: (i) => fliegeWeg(voegel[i || 0]), ROUTEN: ROUTEN.length };
})();
