/*
 * ===========================================================
 *  NOCH MEHR ZUM ENTDECKEN
 *    1. Schneekugel neben dem Adventskranz (antippen oder schütteln)
 *    2. Briefkasten im Winterdorf mit kleinen Liebeszetteln
 *    3. Schneemann bauen, Tipp für Tipp
 *    4. Wunschstern am Abendhimmel mit Papierflieger zum Mond
 *    5. Fenster im Dorf: Licht an und eine kleine Capy Szene
 *    6. Schornsteine: Herzen und Sterne statt Rauch
 *    7. Lichterkette nach unten ziehen
 *    8. Goldene Schneeflocken fangen
 *    9. Plätzchen ausstechen
 *   10. Mistelzweig: zwei Daumen an den Rändern
 * ===========================================================
 */
(function () {
  "use strict";
  const melde = (id) => { const a = window.adventkalender; if (a && a.entdeckt) a.entdeckt(id); };

  const ak = window.adventkalender;
  if (!ak || !ak.intro) return;
  const JAHR = KALENDER.jahr;
  const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const html = document.documentElement;
  const NS = "http://www.w3.org/2000/svg";
  const warte = (ms) => new Promise((r) => setTimeout(r, ms));
  const lies = (k, standard) => { try { const v = localStorage.getItem(k); return v === null ? standard : JSON.parse(v); } catch (_) { return standard; } };
  const schreib = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) { /* egal */ } };
  const kalTag = () => (ak.intro.bereit() ? ak.kalenderDatum() : null);
  const tagSchluessel = () => { const d = kalTag(); return d ? d.jahr + "-" + d.monat + "-" + d.tag : ""; };
  const imDezember = () => { const d = kalTag(); return !!d && (d.jahr > JAHR || (d.jahr === JAHR && d.monat === 12)); };
  const dialogOffen = () => !!document.querySelector("dialog[open]");
  const introOffen = () => { const i = document.getElementById("intro"); return !!i && !i.hidden; };
  const capyKopf = (x, y, b, o) => window.capyGrafik
    ? window.capyGrafik.front(o).replace("<svg ", '<svg x="' + x + '" y="' + y + '" width="' + b + '" height="' + (b * 58 / 56).toFixed(1) + '" ')
    : "";

  /* Glitzer an einer Bildschirmstelle */
  function funken(x, y, n, zeichen, farben, weite) {
    if (ruhig) return;
    for (let k = 0; k < n; k++) {
      const s = document.createElement("span");
      s.className = "entdecken-funke";
      s.textContent = zeichen[k % zeichen.length];
      s.style.left = x + "px";
      s.style.top = y + "px";
      s.style.color = farben[k % farben.length];
      s.style.fontSize = 9 + Math.random() * 9 + "px";
      document.body.appendChild(s);
      const w = Math.random() * Math.PI * 2, r = (weite || 50) * (0.4 + Math.random() * 0.6);
      s.animate([
        { transform: "translate(-50%,-50%) scale(.3)", opacity: 0 },
        { transform: "translate(-50%,-50%) scale(1)", opacity: 1, offset: 0.2 },
        { transform: "translate(calc(-50% + " + (Math.cos(w) * r).toFixed(0) + "px), calc(-50% + " + (Math.sin(w) * r + 20).toFixed(0) + "px)) scale(.6)", opacity: 0 },
      ], { duration: 900 + Math.random() * 600, easing: "ease-out", fill: "both" }).finished.then(() => s.remove(), () => s.remove());
    }
  }
  const GOLD = ["#f3c84b", "#ffe9a8", "#fff", "#ff8fab"];

  /* Kleine Nachricht oben, falls das Rotkehlchen gerade nicht da ist */
  let chipTimer = null;
  function chip(text, dauer) {
    let c = document.getElementById("entdecken-chip");
    if (!c) {
      c = document.createElement("div");
      c.id = "entdecken-chip";
      c.className = "entdecken-chip";
      c.setAttribute("role", "status");
      document.body.appendChild(c);
    }
    c.textContent = text;
    c.classList.add("sichtbar");
    clearTimeout(chipTimer);
    chipTimer = setTimeout(() => c.classList.remove("sichtbar"), dauer || 2600);
  }
  function vogelSagt(text) {
    const v = ak.voegel;
    if (v && v.sage && v.sage(text)) return;
    chip(text, 5200);
  }

  /* ===========================================================
     Winterdorf: Briefkasten, Schneemann, Fenster, Schornsteine
     =========================================================== */
  const landschaft = document.getElementById("landschaft");
  const ZETTEL = [
    "Ich denk gerade an dich ♥️",
    "Du bist mein liebster Mensch auf der ganzen Welt",
    "Mit dir fühlt sich jeder Tag wie Wochenende an",
    "Ich bin so stolz auf dich, Maus",
    "Dein Lachen ist mein Lieblingsgeräusch",
    "Schon gewusst? Du siehst heute wieder wunderschön aus ♥️",
    "Ich freu mich auf unsere nächste Umarmung",
    "Du machst mein Leben so viel bunter",
    "Mit dir kann ich über alles lachen, sogar über mich selbst",
    "Egal wo du gerade bist, ich bin in Gedanken bei dir",
    "Danke, dass es dich gibt ♥️",
    "Du bist mein Zuhause, Baby",
    "Ich verliebe mich jeden Tag ein kleines bisschen mehr in dich",
    "Ein Kuss für dich, einfach so 😘",
    "Du schaffst alles, was du dir vornimmst. Ich glaub an dich",
    "Mein Herz macht immer noch einen Hüpfer, wenn ich dich sehe",
    "Du bist das Beste, was mir je passiert ist",
    "Ich hab gerade gelächelt, weil ich an dich gedacht hab",
    "Mit dir ist sogar Regenwetter schön",
    "Kleine Erinnerung: Du bist wundervoll ♥️",
    "Ich würde mich jeden Tag wieder für dich entscheiden",
    "Du und ich, das passt einfach",
    "Die Capys sagen: Chris vermisst dich 🐹",
    "Ich liebe dich noch mehr als du Matcha 🍵",
    "Mit dir wird jeder Moment zu einer schönen Erinnerung",
    "Du bist mein Lieblingsmensch, heute und für immer",
    "Ich freu mich auf alles, was wir noch zusammen erleben",
    "Du bist so viel stärker, als du denkst, Toni",
    "Wenn ich an Glück denke, denke ich an dich",
    "Ich hab dich lieb. Ganz, ganz doll ♥️",
  ];
  const ZETTEL_PRO_TAG = 3;

  function dorfSvg() { return landschaft && landschaft.querySelector(":scope > svg"); }
  function el(tag, attr, inhalt) {
    const e = document.createElementNS(NS, tag);
    for (const k in attr) e.setAttribute(k, attr[k]);
    if (inhalt) e.innerHTML = inhalt;
    return e;
  }
  // Stelle eines SVG Punkts auf dem Bildschirm
  function aufBildschirm(svgEl, x, y) {
    const svg = svgEl.ownerSVGElement || svgEl;
    const m = svgEl.getScreenCTM();
    const p = svg.createSVGPoint(); p.x = x; p.y = y;
    const q = p.matrixTransform(m);
    return { x: q.x, y: q.y };
  }

  /* ---------- 2. Briefkasten ---------- */
  function baueBriefkasten(svg, x) {
    const g = el("g", { class: "briefkasten", transform: "translate(" + x.toFixed(1) + " 201) scale(1.35)", role: "button", "aria-label": "Briefkasten öffnen" });
    g.innerHTML =
      '<rect class="trefferflaeche" x="-22" y="-62" width="44" height="64" fill="transparent"/>' +
      '<rect x="-2.6" y="-27" width="5.2" height="28" rx="1.5" fill="#6b4a3a"/>' +
      '<path d="M-14 -26 V-38 a14 10 0 0 1 28 0 V-26 Z" fill="#d6304f" stroke="#9d2449" stroke-width="1.2"/>' +
      '<path d="M-14 -27 h28" stroke="#9d2449" stroke-width="1.2"/>' +
      '<path class="bk-schnee" d="M-15 -39 q2 -11 15 -11 q13 0 15 11 q-4 -3 -8 -1 q-3 -3 -7 -1 q-4 -3 -8 0 q-4 -2 -7 2z" style="fill:var(--schnee)"/>' +
      '<rect x="-9" y="-36.5" width="18" height="3.2" rx="1.6" fill="#6b1532"/>' +
      '<rect class="bk-klappe" x="-10" y="-38.6" width="20" height="4.6" rx="1.6" fill="#ff6b8e" stroke="#9d2449" stroke-width=".8"/>' +
      '<path d="M0 -29.6c-1.9-1.4-3.6-2.8-3.6-4.2 0-1 .8-1.8 1.8-1.8.8 0 1.4.4 1.8 1 .4-.6 1-1 1.8-1 1 0 1.8.8 1.8 1.8 0 1.4-1.7 2.8-3.6 4.2z" fill="#fff" transform="translate(0 4)"/>' +
      '<g class="bk-fahne"><rect x="13.5" y="-44" width="1.8" height="14" fill="#6b4a3a"/><path d="M15.3 -44 h8 l-2.2 3 2.2 3 h-8z" fill="#f3c84b"/></g>' +
      '<g class="bk-zettel" opacity="0"><rect x="-6" y="-46" width="12" height="9" rx="1" fill="#fffaf0" stroke="#e8c9a8" stroke-width=".6"/><path d="M-3.5 -43h7M-3.5 -40.5h5" stroke="#e85d7e" stroke-width=".8"/></g>';
    svg.appendChild(g);
    g.addEventListener("click", (e) => { e.stopPropagation(); oeffneBriefkasten(g); });
  }
  let briefLaeuft = false;
  async function oeffneBriefkasten(g) {
    if (briefLaeuft || !ak.intro.bereit()) return;
    briefLaeuft = true;
    const schluessel = "toni-briefkasten-" + JAHR;
    const stand = lies(schluessel, {});
    const heute = tagSchluessel();
    const gelesen = stand.tag === heute ? stand.anzahl : 0;
    const klappe = g.querySelector(".bk-klappe"), zettel = g.querySelector(".bk-zettel"), fahne = g.querySelector(".bk-fahne");
    const opt = (ms) => ({ duration: ruhig ? 1 : ms, easing: "ease-out", fill: "forwards" });
    klappe.animate([{ transform: "none" }, { transform: "translateY(-3px) rotate(-28deg)" }], opt(260));
    await warte(240);
    if (gelesen >= ZETTEL_PRO_TAG) {
      zeigeZettel(g, "Für heute ist der Briefkasten leer. Morgen kommt neue Post für dich ✉️", true);
    } else {
      const d = kalTag();
      const tagNr = Math.round((Date.UTC(d.jahr, d.monat - 1, d.tag) - Date.UTC(JAHR, 10, 1)) / 86400000);
      const text = ZETTEL[((tagNr * ZETTEL_PRO_TAG + gelesen) % ZETTEL.length + ZETTEL.length) % ZETTEL.length];
      schreib(schluessel, { tag: heute, anzahl: gelesen + 1 });
      melde("brief");
      fahne.animate([{ transform: "rotate(0)" }, { transform: "rotate(-80deg)" }, { transform: "rotate(-70deg)" }, { transform: "rotate(0)" }], { duration: ruhig ? 1 : 1400 });
      zettel.animate([{ opacity: 0, transform: "translate(0,6px)" }, { opacity: 1, transform: "translate(0,-6px) rotate(-8deg)" }], opt(420));
      await warte(380);
      zeigeZettel(g, text, false);
    }
    await warte(700);
    zettel.getAnimations().forEach((a) => a.cancel());
    klappe.animate([{ transform: "translateY(-3px) rotate(-28deg)" }, { transform: "none" }], opt(260))
      .finished.then(() => klappe.getAnimations().forEach((a) => a.cancel()), () => {});
    briefLaeuft = false;
  }
  function zeigeZettel(g, text, leer) {
    document.querySelectorAll(".liebeszettel").forEach((z) => z.remove());
    const r = g.getBoundingClientRect();
    const z = document.createElement("button");
    z.type = "button";
    z.className = "liebeszettel" + (leer ? " leer" : "");
    z.innerHTML = '<span class="liebeszettel-text"></span><span class="liebeszettel-gruss">' + (leer ? "" : "Dein Chris") + "</span>";
    z.querySelector(".liebeszettel-text").textContent = text;
    document.body.appendChild(z);
    const b = z.offsetWidth, h = z.offsetHeight;
    const links = Math.max(10, Math.min(window.innerWidth - b - 10, r.left + r.width / 2 - b / 2));
    const oben = Math.max(10, r.top - h - 14);
    z.style.left = links + "px";
    z.style.top = oben + "px";
    const dx = r.left + r.width / 2 - (links + b / 2), dy = r.top - (oben + h);
    z.animate([
      { transform: "translate(" + dx + "px," + (dy + h / 2) + "px) scale(.15) rotate(-20deg)", opacity: 0 },
      { transform: "translate(" + dx * 0.4 + "px," + (dy * 0.3 - 18) + "px) scale(.7) rotate(9deg)", opacity: 1, offset: 0.45 },
      { transform: "translate(0,-6px) scale(1.03) rotate(-3deg)", opacity: 1, offset: 0.75 },
      { transform: "rotate(-2deg)", opacity: 1 },
    ], { duration: ruhig ? 1 : 900, easing: "cubic-bezier(.3,1,.4,1)", fill: "both" });
    const weg = () => {
      if (!z.isConnected) return;
      z.animate([{ opacity: 1, transform: "rotate(-2deg)" }, { opacity: 0, transform: "translateY(-14px) rotate(4deg) scale(.9)" }], { duration: 400, fill: "forwards" })
        .finished.then(() => z.remove(), () => z.remove());
    };
    z.addEventListener("click", weg);
    setTimeout(weg, leer ? 3800 : 7000);
  }

  /* ---------- 3. Schneemann ---------- */
  const SM_STUFEN = 7;
  function baueSchneemann(svg, x) {
    const g = el("g", { class: "schneemann", transform: "translate(" + x.toFixed(1) + " 203) scale(1.3)", role: "button", "aria-label": "Schneemann bauen" });
    const sch = 'style="fill:var(--schnee)" stroke="rgba(120,130,170,.35)" stroke-width="1"';
    g.innerHTML =
      '<rect class="trefferflaeche" x="-26" y="-82" width="52" height="84" fill="transparent"/>' +
      '<ellipse cx="0" cy="-1" rx="17" ry="3.5" fill="rgba(90,90,140,.12)"/>' +
      '<g class="sm-teil" data-stufe="0"><circle cx="0" cy="-6" r="6" ' + sch + '/></g>' +
      '<g class="sm-teil" data-stufe="1"><circle cx="0" cy="-14" r="14" ' + sch + '/></g>' +
      '<g class="sm-teil" data-stufe="2"><circle cx="0" cy="-35" r="10" ' + sch + '/><circle cx="0" cy="-37" r="1.3" fill="#3a2418"/><circle cx="0" cy="-32" r="1.3" fill="#3a2418"/><circle cx="0" cy="-15" r="1.4" fill="#3a2418"/><circle cx="0" cy="-9" r="1.4" fill="#3a2418"/></g>' +
      '<g class="sm-teil" data-stufe="3"><circle cx="0" cy="-51" r="7.5" ' + sch + '/></g>' +
      '<g class="sm-teil" data-stufe="4"><circle cx="-2.6" cy="-53" r="1.1" fill="#3a2418"/><circle cx="2.6" cy="-53" r="1.1" fill="#3a2418"/>' +
      '<g fill="#3a2418"><circle cx="-3" cy="-48.6" r=".7"/><circle cx="-1.1" cy="-47.6" r=".7"/><circle cx="1.1" cy="-47.6" r=".7"/><circle cx="3" cy="-48.6" r=".7"/></g>' +
      '<circle cx="-4.6" cy="-50" r="1.4" fill="#f7809b" opacity=".55"/><circle cx="4.6" cy="-50" r="1.4" fill="#f7809b" opacity=".55"/></g>' +
      '<g class="sm-teil" data-stufe="5"><path d="M0 -51.5 l8 1.6 -8 1.6z" fill="#ff8a2a"/></g>' +
      '<g class="sm-teil" data-stufe="6"><path d="M-7.6 -45 q7.6 3 15.2 0 v3.4 q-7.6 3 -15.2 0z" fill="#d6304f"/><path d="M3 -42.5 l2.5 9 3.4 -1 -2.2 -8.6z" fill="#e8455f"/><path d="M-6 -43.6h2M-2 -42.8h2M2 -42.8h2" stroke="#fff" stroke-width=".9"/></g>' +
      '<g class="sm-teil" data-stufe="7"><path d="M-9 -57.5 h18" stroke="#2a1f2e" stroke-width="2.4" stroke-linecap="round"/><rect x="-5.6" y="-68" width="11.2" height="10.5" rx="1.2" fill="#2a1f2e"/><rect x="-5.6" y="-61.5" width="11.2" height="2.4" fill="#d6304f"/>' +
      '<path d="M-9.5 -36 l-12 -6 M-15 -39 l-2 -4" stroke="#6b4a3a" stroke-width="1.6" stroke-linecap="round" fill="none"/>' +
      '<g class="sm-arm"><path d="M9.5 -36 l11 -9 M16.5 -42 l3.8 -1" stroke="#6b4a3a" stroke-width="1.6" stroke-linecap="round" fill="none"/></g></g>';
    svg.appendChild(g);
    zeigeStufe(g, aktuelleStufe(), false);
    g.addEventListener("click", (e) => { e.stopPropagation(); baueWeiter(g); });
  }
  function aktuelleStufe() {
    const s = lies("toni-schneemann-" + JAHR, {});
    return s.tag === tagSchluessel() ? Math.min(SM_STUFEN, s.stufe || 0) : 0;
  }
  function zeigeStufe(g, stufe, neu) {
    g.querySelectorAll(".sm-teil").forEach((t) => {
      const n = +t.dataset.stufe;
      // Stufe 0 ist die kleine Kugel: sie verschwindet, sobald der große Bauch da ist
      const sichtbar = n === 0 ? stufe === 0 : n <= stufe;
      t.style.display = sichtbar ? "" : "none";
      if (neu && n === stufe && !ruhig) t.animate([{ transform: "scale(.4)", opacity: 0 }, { transform: "scale(1.12)", opacity: 1, offset: 0.6 }, { transform: "scale(1)", opacity: 1 }], { duration: 420, easing: "ease-out" });
    });
    g.setAttribute("aria-label", stufe >= SM_STUFEN ? "Schneemann winkt" : "Schneemann bauen");
  }
  function baueWeiter(g) {
    if (!ak.intro.bereit()) return;
    let stufe = aktuelleStufe();
    const r = g.getBoundingClientRect();
    if (stufe < SM_STUFEN) {
      stufe++;
      schreib("toni-schneemann-" + JAHR, { tag: tagSchluessel(), stufe });
      zeigeStufe(g, stufe, true);
      funken(r.left + r.width / 2, r.top + r.height * 0.6, 6, ["❄", "✦"], ["#fff", "#cfe6ff", "#ffe9a8"], 36);
      if (stufe === SM_STUFEN) { setTimeout(() => winke(g), 450); melde("schneemann"); }
    } else winke(g);
  }
  function winke(g) {
    const arm = g.querySelector(".sm-arm");
    if (!ruhig) arm.animate([{ transform: "rotate(0)" }, { transform: "rotate(-26deg)" }, { transform: "rotate(6deg)" }, { transform: "rotate(-26deg)" }, { transform: "rotate(6deg)" }, { transform: "rotate(0)" }],
      { duration: 1500, easing: "ease-in-out" });
    const p = aufBildschirm(g, 0, -70);
    funken(p.x, p.y, 5, ["♥"], ["#ff4d7d", "#ff8fab"], 30);
  }

  /* ---------- 5. Fenster mit kleinen Szenen ---------- */
  const SZENEN = [
    { name: "Ein Capy backt Plätzchen", bild: () =>
      capyKopf(36, 22, 48, { mund: "offen" }) +
      '<path d="M44 26 q-2 -10 8 -10 q4 -6 10 -1 q8 -3 9 6 q4 3 -1 6z" fill="#fff" stroke="#f0d9e2" stroke-width="1"/>' +
      '<rect x="0" y="68" width="120" height="28" fill="#c48c60"/><rect x="0" y="66" width="120" height="4" fill="#a96f47"/>' +
      '<rect x="24" y="60" width="44" height="8" rx="2" fill="#9aa3b5"/>' +
      [30, 42, 54].map((x, i) => '<circle cx="' + (x + 4) + '" cy="60" r="4.4" fill="' + ["#d99a4e", "#e8b46a", "#d99a4e"][i] + '"/>').join("") +
      '<rect x="78" y="58" width="30" height="6" rx="3" fill="#e8c39a"/><rect x="73" y="59.5" width="6" height="3" rx="1.5" fill="#c48c60"/><rect x="107" y="59.5" width="6" height="3" rx="1.5" fill="#c48c60"/>' },
    { name: "Ein Capy spielt Klavier", bild: () =>
      '<rect x="8" y="34" width="66" height="44" rx="4" fill="#3a2236"/><rect x="8" y="58" width="66" height="10" fill="#fff"/>' +
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => '<path d="M' + (14 + k * 6) + ' 58 v10" stroke="#c9b8c8" stroke-width=".8"/>').join("") +
      [0, 1, 3, 4, 5, 7, 8].map((k) => '<rect x="' + (17 + k * 6) + '" y="58" width="3" height="6" fill="#1d1320"/>').join("") +
      capyKopf(62, 30, 44, {}) +
      '<g class="noten"><text x="30" y="26" font-size="12" fill="#e85d7e">♪</text><text x="48" y="18" font-size="10" fill="#f3c84b">♫</text><text x="16" y="16" font-size="9" fill="#ff8fab">♪</text></g>' },
    { name: "Zwei Capys geben sich ein Küsschen", bild: () =>
      '<g transform="rotate(10 36 56)">' + capyKopf(14, 34, 44, {}) + "</g>" +
      '<g transform="rotate(-10 84 56)">' + capyKopf(62, 34, 44, { typ: 1 }) + "</g>" +
      '<path class="szene-herz" d="M60 20c-3-5-11-4-11 2 0 5 11 11 11 11s11-6 11-11c0-6-8-7-11-2z" fill="#ff4d7d"/>' },
    { name: "Ein Capy liest ein Buch", bild: () =>
      '<rect x="86" y="18" width="3" height="50" fill="#6b4a3a"/><path d="M76 18 h24 l-5 -12 h-14z" fill="#f3c84b"/><ellipse cx="88" cy="24" rx="18" ry="10" fill="#ffe9a8" opacity=".35"/>' +
      capyKopf(26, 22, 46, {}) +
      '<path d="M22 62 q14 -8 26 0 q12 -8 26 0 v16 q-14 -8 -26 0 q-12 -8 -26 0z" fill="#fffaf0" stroke="#d6304f" stroke-width="1.4"/><path d="M48 62 v16" stroke="#d6304f" stroke-width="1"/>' +
      '<path d="M28 66 h14M28 70 h12M54 66 h14M54 70 h12" stroke="#e0c9b8" stroke-width="1.2"/>' },
    { name: "Ein Capy trinkt heißen Kakao", bild: () =>
      '<path d="M0 70 q30 -14 60 -4 q30 -10 60 4 v26 h-120z" fill="#e85d7e"/><path d="M0 76 q30 -12 60 -3 q30 -9 60 3" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="5 4" opacity=".7"/>' +
      capyKopf(34, 18, 52, {}) +
      '<rect x="48" y="58" width="22" height="18" rx="4" fill="#fff" stroke="#d6304f" stroke-width="1.4"/><path d="M70 62 q7 0 7 6 q0 6 -7 6" fill="none" stroke="#d6304f" stroke-width="1.6"/>' +
      '<g class="dampf"><path d="M54 52 q-4 -6 0 -12 q4 -6 0 -12" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/><path d="M63 52 q-4 -6 0 -12 q4 -6 0 -12" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/></g>' },
    { name: "Ein Capy schmückt den Baum", bild: () =>
      '<path d="M82 14 l-20 28 h10 l-14 20 h10 l-12 18 h52 l-12 -18 h10 l-14 -20 h10z" fill="#3f7f55"/><rect x="78" y="80" width="8" height="10" fill="#6b4a3a"/>' +
      '<circle cx="74" cy="52" r="3" fill="#ff4d7d"/><circle cx="90" cy="64" r="3" fill="#f3c84b"/><circle cx="80" cy="72" r="3" fill="#7cc4f0"/><circle cx="86" cy="40" r="2.6" fill="#ff8fab"/>' +
      '<path class="szene-stern" d="M82 4 l2.4 5 5.4 .6 -4 3.7 1.1 5.3 -4.9 -2.8 -4.9 2.8 1.1 -5.3 -4 -3.7 5.4 -.6z" fill="#f3c84b"/>' +
      capyKopf(4, 34, 46, { mund: "offen" }) },
  ];
  let szenenZaehler = 0;
  function zeigeFenster(fenster) {
    if (!ak.intro.bereit()) return;
    document.querySelectorAll(".fensterblick").forEach((f) => f.remove());
    fenster.classList.add("fenster-an");
    melde("fenster");
    const r = fenster.getBoundingClientRect();
    const d = kalTag();
    const szene = SZENEN[(szenenZaehler++ + (d ? d.tag : 0)) % SZENEN.length];
    const box = document.createElement("button");
    box.type = "button";
    box.className = "fensterblick";
    box.setAttribute("aria-label", szene.name);
    box.innerHTML =
      '<svg viewBox="0 0 120 96" aria-hidden="true"><defs><clipPath id="fensterblick-clip"><rect x="0" y="0" width="120" height="96" rx="10"/></clipPath>' +
      '<radialGradient id="fensterblick-licht" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#fff4cf"/><stop offset="1" stop-color="#ffd28a"/></radialGradient></defs>' +
      '<g clip-path="url(#fensterblick-clip)"><rect width="120" height="96" fill="url(#fensterblick-licht)"/>' + szene.bild() +
      '<path d="M0 0 h22 q-6 30 4 96 h-26z" fill="#ff8fab" opacity=".9"/><path d="M120 0 h-22 q6 30 -4 96 h26z" fill="#ff8fab" opacity=".9"/>' +
      '<path d="M0 0 h120 v8 q-60 10 -120 0z" fill="#e85d7e"/></g>' +
      '<rect x="1.5" y="1.5" width="117" height="93" rx="9" fill="none" stroke="#fffaf0" stroke-width="3"/></svg>' +
      '<span class="fensterblick-text">' + szene.name + "</span>";
    document.body.appendChild(box);
    const b = box.offsetWidth, h = box.offsetHeight;
    const links = Math.max(10, Math.min(window.innerWidth - b - 10, r.left + r.width / 2 - b / 2));
    const oben = r.top - h - 12 > 10 ? r.top - h - 12 : Math.min(window.innerHeight - h - 10, r.bottom + 12);
    box.style.left = links + "px";
    box.style.top = oben + "px";
    box.style.transformOrigin = (r.left + r.width / 2 - links) + "px " + (r.top < oben ? 0 : h) + "px";
    box.animate([{ transform: "scale(.1)", opacity: 0 }, { transform: "scale(1.05)", opacity: 1, offset: 0.7 }, { transform: "scale(1)", opacity: 1 }], { duration: ruhig ? 1 : 420, easing: "ease-out" });
    const weg = () => {
      if (!box.isConnected) return;
      box.animate([{ transform: "scale(1)", opacity: 1 }, { transform: "scale(.2)", opacity: 0 }], { duration: ruhig ? 1 : 320, easing: "ease-in", fill: "forwards" })
        .finished.then(() => box.remove(), () => box.remove());
      setTimeout(() => fenster.classList.remove("fenster-an"), 350);
    };
    box.addEventListener("click", weg);
    setTimeout(weg, 4200);
  }

  /* ---------- 6. Schornsteine ---------- */
  function richteSchornsteineEin(svg) {
    svg.querySelectorAll(".rauch").forEach((rauch) => {
      const kamin = rauch.previousElementSibling;
      if (!kamin || kamin.tagName !== "rect" || kamin.classList.contains("schornstein")) return;
      kamin.classList.add("schornstein");
      const x = +kamin.getAttribute("x"), y = +kamin.getAttribute("y"), h = +kamin.getAttribute("height");
      const treffer = el("rect", { class: "schornstein-treffer", x: x - 9, y: y - 26, width: 27, height: h + 28, fill: "transparent", role: "button", "aria-label": "Schornstein" });
      treffer.dataset.x = x + 4.5;
      treffer.dataset.y = y;
      svg.appendChild(treffer);
      treffer.addEventListener("click", (e) => { e.stopPropagation(); schornstein(treffer, kamin); });
    });
  }
  function schornstein(treffer, kamin) {
    if (treffer.dataset.laeuft) return;
    treffer.dataset.laeuft = "1";
    melde("kamin");
    setTimeout(() => delete treffer.dataset.laeuft, 1600);
    const p = aufBildschirm(kamin, +treffer.dataset.x, +treffer.dataset.y);
    const nacht = html.getAttribute("data-tageszeit") === "nacht" || html.hasAttribute("data-abend");
    const zeichen = ["♥", "✦", "♥", "★", "♥", "✧"];
    for (let k = 0; k < 11 && !ruhig; k++) {
      const s = document.createElement("span");
      s.className = "kamin-teil";
      s.textContent = zeichen[k % zeichen.length];
      s.style.left = p.x + "px";
      s.style.top = p.y + "px";
      s.style.color = k % 2 ? "#f3c84b" : "#ff6b8e";
      s.style.fontSize = 10 + Math.random() * 9 + "px";
      document.body.appendChild(s);
      const dx = (Math.random() - 0.5) * 50, hoehe = 70 + Math.random() * 70;
      s.animate([
        { transform: "translate(-50%,0) scale(.3)", opacity: 0 },
        { transform: "translate(calc(-50% + " + dx * 0.3 + "px),-20px) scale(1)", opacity: 1, offset: 0.2 },
        { transform: "translate(calc(-50% + " + (-dx * 0.4) + "px)," + (-hoehe * 0.6) + "px) scale(1)", opacity: 0.9, offset: 0.6 },
        { transform: "translate(calc(-50% + " + dx + "px)," + (-hoehe) + "px) scale(.7)", opacity: 0 },
      ], { duration: 1600 + Math.random() * 900, delay: k * 110, easing: "ease-out", fill: "both" }).finished.then(() => s.remove(), () => s.remove());
    }
    if (nacht && !ruhig) sternbild(p.x, p.y - 120);
  }
  function sternbild(x, y) {
    // kleines Sternbild in Herzform
    const punkte = [[0, 6], [-14, -6], [-10, -16], [0, -10], [10, -16], [14, -6]];
    const pfad = "M" + punkte.map((q) => q.join(" ")).join(" L") + " Z";
    const box = document.createElement("div");
    box.className = "kamin-sternbild";
    box.style.left = x + "px";
    box.style.top = y + "px";
    box.innerHTML = '<svg viewBox="-20 -22 40 34" aria-hidden="true"><path d="' + pfad + '" fill="none" stroke="rgba(255,240,200,.7)" stroke-width=".7" stroke-dasharray="80" stroke-dashoffset="80"/>' +
      punkte.map((q) => '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="1.5" fill="#fff8dc"/>').join("") + "</svg>";
    document.body.appendChild(box);
    box.querySelector("path").animate([{ strokeDashoffset: 80 }, { strokeDashoffset: 0 }], { duration: 1400, delay: 600, easing: "ease-in-out", fill: "forwards" });
    box.animate([{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: 4200, fill: "forwards" })
      .finished.then(() => box.remove(), () => box.remove());
  }

  function richteDorfEin() {
    const svg = dorfSvg();
    if (!svg || svg.querySelector(".briefkasten")) return;
    const B = svg.viewBox.baseVal.width || 1200;
    // sichtbarer Ausschnitt in Bildkoordinaten (am Handy ist nur die Mitte zu sehen)
    let von = 0, bis = B;
    try {
      const m = svg.getScreenCTM();
      if (m && m.a) { von = Math.max(0, (0 - m.e) / m.a); bis = Math.min(B, (document.documentElement.clientWidth - m.e) / m.a); }
    } catch (_) { /* egal */ }
    // Lücken zwischen Häusern und Bäumen, damit nichts vor einem Fenster steht
    const belegt = [];
    svg.querySelectorAll("rect.haus:not(.fenster)").forEach((r) => { const x = +r.getAttribute("x"), w = +r.getAttribute("width"); if (w > 30) belegt.push([x - 7, x + w + 7, false]); });
    svg.querySelectorAll(".baum .trefferflaeche").forEach((r) => { const x = +r.getAttribute("x"), w = +r.getAttribute("width"); belegt.push([x + 4, x + w - 4, true]); });
    belegt.sort((p, q) => p[0] - q[0]);
    const luecken = [];
    for (let i = 1; i < belegt.length; i++) {
      const l = Math.max(...belegt.slice(0, i).map((e) => e[1])), r = belegt[i][0];
      luecken.push({ mitte: (l + r) / 2, breite: r - l, baum: belegt[i][2] || belegt[i - 1][2] });
    }
    const passend = luecken.filter((g) => g.mitte > von + 34 && g.mitte < bis - 34).sort((p, q) => q.breite - p.breite);
    const naechste = (ziel, ausser) => passend.filter((g) => !ausser || Math.abs(g.mitte - ausser) > 90).sort((p, q) => (Math.abs(p.mitte - ziel) + (p.baum ? 140 : 0)) - (Math.abs(q.mitte - ziel) + (q.baum ? 140 : 0)))[0];
    const breite = bis - von;
    const sm = naechste(von + breite * 0.33);
    const bk = naechste(von + breite * 0.68, sm && sm.mitte);
    baueSchneemann(svg, sm ? sm.mitte : von + breite * 0.33);
    baueBriefkasten(svg, bk ? bk.mitte : von + breite * 0.68);
    richteSchornsteineEin(svg);
  }
  if (landschaft) {
    // Fenster abfangen, bevor die Landschaft die Haus Capys zeigt
    landschaft.addEventListener("click", (e) => {
      const f = e.target.closest && e.target.closest("rect.fenster, .fenster-capy");
      if (!f) return;
      e.stopPropagation();
      // sitzt schon ein Capy im Fenster, leuchtet dessen Fensterfläche auf
      zeigeFenster(f.classList.contains("fenster-capy") ? f.querySelector(".fenster-hell") || f : f);
    }, true);
    new MutationObserver(richteDorfEin).observe(landschaft, { childList: true });
    richteDorfEin();
  }

  /* ===========================================================
     1. Schneekugel neben dem Adventskranz
     =========================================================== */
  const kranz = document.getElementById("adventskranz");
  let kugel = null;
  if (kranz) {
    const reihe = document.createElement("div");
    reihe.className = "kranz-reihe";
    kranz.before(reihe);
    reihe.appendChild(kranz);
    kugel = document.createElement("button");
    kugel.type = "button";
    kugel.className = "schneekugel";
    kugel.setAttribute("aria-label", "Schneekugel schütteln");
    const FLOCKEN = 38;
    let flocken = "";
    for (let k = 0; k < FLOCKEN; k++) flocken += '<circle class="sk-flocke" r="' + (0.9 + (k % 3) * 0.45).toFixed(2) + '"/>';
    kugel.innerHTML =
      '<svg viewBox="0 0 100 124" aria-hidden="true"><defs>' +
      '<clipPath id="sk-glas"><circle cx="50" cy="50" r="42"/></clipPath>' +
      '<radialGradient id="sk-innen" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#eaf4ff"/><stop offset="1" stop-color="#bcd3f0"/></radialGradient>' +
      '<linearGradient id="sk-sockel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8413d"/><stop offset="1" stop-color="#7d1f2c"/></linearGradient></defs>' +
      '<g clip-path="url(#sk-glas)"><rect x="0" y="0" width="100" height="100" fill="url(#sk-innen)"/>' +
      '<path d="M30 74 v-16 l12 -10 l12 10 v16z" fill="#f2a7ba"/><path d="M27 59 l15 -13 l15 13" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><rect x="38" y="64" width="7" height="10" rx="1" fill="#9d2449"/><rect x="47" y="60" width="5" height="5" rx="1" fill="#ffe7a3"/>' +
      '<path d="M76 74 l-8 -18 h4 l-6 -10 h3 l-4 -8 l-4 8 h3 l-6 10 h4 l-8 18z" fill="#3f7f55" transform="translate(6 0)"/>' +
      capyKopf(16, 62, 18, {}) + capyKopf(56, 63, 17, { typ: 1 }) +
      '<path d="M8 80 q20 -8 42 -4 q22 -5 42 4 v22 h-84z" fill="#fff"/>' +
      '<path class="sk-herz" d="M50 86c-2.2-3.6-8-2.8-8 1.3 0 3.4 8 7.3 8 7.3s8-3.9 8-7.3c0-4.1-5.8-4.9-8-1.3z" fill="#fff" stroke="#9fbbe3" stroke-width="1.3" opacity="0"/>' +
      '<g class="sk-flocken" fill="#fff">' + flocken + "</g></g>" +
      '<circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2"/>' +
      '<path d="M22 30 a34 34 0 0 1 22 -16" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55"/>' +
      '<path d="M20 92 h60 l8 26 h-76z" fill="url(#sk-sockel)"/><rect x="16" y="88" width="68" height="7" rx="3" fill="#d4a84b"/>' +
      '<path d="M50 111c-1.6-1.2-3.2-2.4-3.2-3.7 0-.9.7-1.6 1.6-1.6.7 0 1.2.4 1.6.9.4-.5.9-.9 1.6-.9.9 0 1.6.7 1.6 1.6 0 1.3-1.6 2.5-3.2 3.7z" fill="#f3c84b"/></svg>';
    reihe.appendChild(kugel);
    const teile = [...kugel.querySelectorAll(".sk-flocke")].map((c, k) => {
      const x = 14 + ((k * 37) % 72), y = 84 + ((k * 13) % 9);
      c.setAttribute("cx", x); c.setAttribute("cy", y);
      return { c, x, y, vx: 0, vy: 0, boden: y };
    });
    let wirbelt = false;
    function schuettle(stark) {
      if (wirbelt) return;
      wirbelt = true;
      melde("schneekugel");
      if (!ruhig) kugel.animate([{ transform: "rotate(0)" }, { transform: "rotate(-9deg)" }, { transform: "rotate(8deg)" }, { transform: "rotate(-5deg)" }, { transform: "rotate(3deg)" }, { transform: "rotate(0)" }],
        { duration: 700, easing: "ease-in-out" });
      const herz = kugel.querySelector(".sk-herz");
      herz.getAnimations().forEach((a) => a.cancel());
      teile.forEach((p) => { p.vx = (Math.random() - 0.5) * (stark ? 90 : 70); p.vy = -(40 + Math.random() * (stark ? 80 : 60)); });
      if (ruhig) { wirbelt = false; return; }
      let letzte = performance.now();
      const start = letzte;
      const mitHerz = Math.random() < 0.4;
      function schritt(t) {
        const dt = Math.min(0.04, (t - letzte) / 1000); letzte = t;
        let ruhen = 0;
        for (const p of teile) {
          p.vy += 22 * dt;                 // sanfte Schwerkraft wie in Wasser
          p.vx *= 1 - 1.6 * dt; p.vy *= 1 - 1.4 * dt;
          p.vx += Math.sin(t / 400 + p.boden) * 6 * dt;
          p.x += p.vx * dt; p.y += p.vy * dt;
          const dx = p.x - 50, dy = p.y - 50, abst = Math.hypot(dx, dy);
          if (abst > 39) { p.x = 50 + dx / abst * 39; p.y = 50 + dy / abst * 39; p.vx *= -0.3; p.vy *= -0.3; }
          if (p.y >= p.boden && p.vy > 0 && t - start > 600) { p.y = p.boden; p.vx = 0; p.vy = 0; ruhen++; }
          p.c.setAttribute("cx", p.x.toFixed(1)); p.c.setAttribute("cy", p.y.toFixed(1));
        }
        if (ruhen < teile.length && t - start < 9000) requestAnimationFrame(schritt);
        else {
          wirbelt = false;
          if (mitHerz) herz.animate([{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: 4500, fill: "forwards" });
        }
      }
      requestAnimationFrame(schritt);
    }
    kugel.addEventListener("click", () => schuettle(false));
    let letzteBeschl = null, letztesMal = 0;
    window.addEventListener("devicemotion", (e) => {
      const a = e.accelerationIncludingGravity;
      if (!a || a.x === null) return;
      if (letzteBeschl) {
        const delta = Math.abs(a.x - letzteBeschl.x) + Math.abs(a.y - letzteBeschl.y) + Math.abs(a.z - letzteBeschl.z);
        const r = kugel.getBoundingClientRect();
        const sichtbar = r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
        if (delta > 24 && sichtbar && Date.now() - letztesMal > 1500) { letztesMal = Date.now(); schuettle(true); }
      }
      letzteBeschl = { x: a.x, y: a.y, z: a.z };
    });
  }

  /* ===========================================================
     4. Wunschstern am Abendhimmel
     =========================================================== */
  const kopf = document.querySelector(".kopf");
  if (kopf) {
    const stern = document.createElement("button");
    stern.type = "button";
    stern.className = "wunschstern";
    stern.setAttribute("aria-label", "Wunschstern: wünsch dir etwas");
    stern.innerHTML = '<svg viewBox="-12 -12 24 24" aria-hidden="true"><path d="M0 -10 L2.6 -3.4 9.5 -3.1 4.1 1.3 6 8.1 0 4.2 -6 8.1 -4.1 1.3 -9.5 -3.1 -2.6 -3.4Z" fill="#ffe08a" stroke="#fff6d0" stroke-width=".8"/></svg>';
    kopf.appendChild(stern);
    const dlg = document.createElement("dialog");
    dlg.className = "dialog wunsch-dialog";
    dlg.setAttribute("aria-labelledby", "wunsch-titel");
    dlg.innerHTML =
      '<form class="dialog-inhalt" method="dialog" autocomplete="off">' +
      '<button class="schliessen" type="button" aria-label="Schließen">×</button>' +
      '<p class="dialog-tag">Ein Wunsch an die Sterne</p>' +
      '<h2 id="wunsch-titel">Was wünschst du dir?</h2>' +
      '<textarea id="wunsch-text" class="wunsch-text" rows="3" maxlength="200" placeholder="Schreib ihn einfach auf …" autocomplete="off"></textarea>' +
      '<button type="submit" class="wunsch-los">Zu den Sternen schicken</button>' +
      '<p class="wunsch-hinweis">Dein Wunsch bleibt geheim. Er wird nirgends gespeichert, nur die Sterne kennen ihn ♥️</p></form>';
    document.body.appendChild(dlg);
    const text = dlg.querySelector("textarea");
    dlg.querySelector(".schliessen").addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", () => { text.value = ""; });
    stern.addEventListener("click", () => {
      text.value = "";
      if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
      setTimeout(() => text.focus(), 60);
    });
    dlg.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      if (!text.value.trim()) {
        text.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 300 });
        text.focus();
        return;
      }
      const r = dlg.querySelector(".dialog-inhalt").getBoundingClientRect();
      text.value = "";
      dlg.close();
      papierflieger(r, stern);
      melde("wunsch");
    });
  }
  function papierflieger(r, stern) {
    const mond = document.querySelector(".himmel > .himmel2 .h2-mond");
    const mr = mond && +getComputedStyle(mond).opacity > 0.3 ? mond.getBoundingClientRect() : null;
    const ziel = mr && mr.width ? { x: mr.left + mr.width / 2, y: mr.top + mr.height / 2 } : { x: window.innerWidth * 0.85, y: 30 };
    // Zettel faltet sich zusammen
    const blatt = document.createElement("div");
    blatt.className = "wunsch-blatt";
    Object.assign(blatt.style, { left: r.left + r.width * 0.2 + "px", top: r.top + r.height * 0.25 + "px", width: r.width * 0.6 + "px", height: r.height * 0.5 + "px" });
    document.body.appendChild(blatt);
    const start = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    const flieger = document.createElement("div");
    flieger.className = "wunsch-flieger";
    flieger.innerHTML = '<svg viewBox="0 0 40 30" aria-hidden="true"><path d="M2 14 L38 2 L22 28 L17 18 Z" fill="#fffaf0" stroke="#e8c9a8" stroke-width="1"/><path d="M38 2 L17 18 L14 26 L19 19.5" fill="#f3e3d2" stroke="#e8c9a8" stroke-width="1" stroke-linejoin="round"/></svg>';
    flieger.style.left = start.x + "px";
    flieger.style.top = start.y + "px";
    flieger.style.opacity = "0";
    document.body.appendChild(flieger);
    const falten = blatt.animate([
      { transform: "scale(1) rotate(0)", opacity: 1 },
      { transform: "scale(.6,.35) rotate(-6deg)", opacity: 1, offset: 0.5 },
      { transform: "scale(.12) rotate(-30deg)", opacity: 0 },
    ], { duration: ruhig ? 1 : 700, easing: "ease-in", fill: "forwards" });
    falten.finished.then(() => {
      blatt.remove();
      const dx = ziel.x - start.x, dy = ziel.y - start.y;
      // Bogen mit kleiner Schleife; die Spitze zeigt immer in Flugrichtung
      const ort = (t) => ({ x: dx * t + Math.sin(t * Math.PI * 2) * 40 * (1 - t), y: dy * t - Math.sin(t * Math.PI) * 60 });
      const punkte = [];
      for (let k = 0; k <= 24; k++) {
        const t = k / 24, p = ort(t), q = ort(Math.min(1, t + 0.02)), v = ort(Math.max(0, t - 0.02));
        const winkel = Math.atan2(q.y - v.y, q.x - v.x) * 180 / Math.PI;
        punkte.push({ transform: "translate(calc(-50% + " + p.x.toFixed(0) + "px), calc(-50% + " + p.y.toFixed(0) + "px)) rotate(" + winkel.toFixed(0) + "deg) scale(" + (1.1 - t * 0.75).toFixed(2) + ")", opacity: t > 0.92 ? 0 : 1 });
      }
      flieger.animate(punkte, { duration: ruhig ? 1 : 2600, easing: "ease-in-out", fill: "forwards" }).finished.then(() => {
        flieger.remove();
        funken(ziel.x, ziel.y, 14, ["✦", "✧", "★"], ["#fff8dc", "#ffe08a", "#fff"], 46);
        if (stern) stern.animate([{ transform: "scale(1)" }, { transform: "scale(1.7)" }, { transform: "scale(1)" }], { duration: 700 });
        chip("Dein Wunsch ist bei den Sternen angekommen ✨", 3200);
      }, () => flieger.remove());
    }, () => blatt.remove());
  }

  /* ===========================================================
     7. Lichterkette nach unten ziehen
     =========================================================== */
  const kette = document.getElementById("lichterkette");
  if (kette) {
    let zug = null, nachZug = false, feder = 0;
    const pfadPunkte = () => {
      const pfad = kette.querySelector("svg path");
      if (!pfad) return null;
      if (!pfad.dataset.original) pfad.dataset.original = pfad.getAttribute("d");
      const zahlen = pfad.dataset.original.match(/-?[\d.]+/g).map(Number);
      const pkt = [];
      for (let i = 0; i + 1 < zahlen.length; i += 2) pkt.push([zahlen[i], zahlen[i + 1]]);
      return { pfad, pkt };
    };
    function biege(x0, amp) {
      const p = pfadPunkte();
      if (!p) return;
      const s = 95;
      const off = (x) => amp * Math.exp(-Math.pow((x - x0) / s, 2));
      p.pfad.setAttribute("d", p.pkt.map((q, i) => (i ? "L" : "M") + q[0] + " " + (q[1] + off(q[0])).toFixed(2)).join(""));
      kette.querySelectorAll(".birne").forEach((b) => {
        const x = parseFloat(b.style.left) * 10;
        const o = off(x);
        b.style.translate = Math.abs(o) < 0.05 ? "" : "0 " + o.toFixed(1) + "px";
      });
    }
    kette.addEventListener("pointerdown", (e) => {
      const b = e.target.closest && e.target.closest(".birne");
      if (!b || kette.classList.contains("fest")) return;
      cancelAnimationFrame(feder);
      zug = { b, id: e.pointerId, y0: e.clientY, x0: parseFloat(b.style.left) * 10, amp: 0, start: performance.now(), langAb: 0 };
      try { b.setPointerCapture(e.pointerId); } catch (_) { /* egal */ }
    });
    kette.addEventListener("pointermove", (e) => {
      if (!zug || e.pointerId !== zug.id) return;
      const dy = e.clientY - zug.y0;
      zug.amp = Math.max(0, Math.min(36, dy * 0.75));
      if (zug.amp > 4) e.preventDefault();
      if (zug.amp >= 20 && !zug.langAb) zug.langAb = performance.now();
      if (zug.amp < 20) zug.langAb = 0;
      biege(zug.x0, zug.amp);
    });
    const loslassen = (e) => {
      if (!zug || (e && e.pointerId !== zug.id)) return;
      const z = zug; zug = null;
      if (z.amp < 6) { biege(z.x0, 0); return; }
      nachZug = true;
      melde("ziehen");
      setTimeout(() => { nachZug = false; }, 400);
      const lang = z.langAb && performance.now() - z.langAb > 800;
      const A = z.amp, t0 = performance.now();
      if (ruhig) { biege(z.x0, 0); return; }
      const schwing = (t) => {
        const s = (t - t0) / 1000;
        const amp = A * Math.cos(s * Math.PI * 2 / 0.42) * Math.exp(-s / 0.42);
        biege(z.x0, amp);
        if (s < 2.2) feder = requestAnimationFrame(schwing);
        else biege(z.x0, 0);
      };
      feder = requestAnimationFrame(schwing);
      if (lang) regenbogen();
    };
    kette.addEventListener("pointerup", loslassen);
    kette.addEventListener("pointercancel", loslassen);
    // nach dem Ziehen keine Lichtwelle zusätzlich auslösen
    kette.addEventListener("click", (e) => { if (nachZug) { e.stopPropagation(); e.preventDefault(); } }, true);
    function regenbogen() {
      const birnen = [...kette.querySelectorAll(".birne")];
      birnen.forEach((b, i) => {
        b.style.setProperty("--rb-verzug", (-i * 0.12).toFixed(2) + "s");
        b.classList.add("regenbogen");
      });
      setTimeout(() => birnen.forEach((b) => b.classList.remove("regenbogen")), 3200);
    }
  }

  /* ===========================================================
     8. Goldene Schneeflocken
     =========================================================== */
  const FLOCKEN_ZIEL = 5;
  function flockenStand() {
    const s = lies("toni-goldflocken-" + JAHR, {});
    return s.tag === tagSchluessel() ? s.anzahl || 0 : 0;
  }
  function darfFlocke() {
    return !ruhig && document.visibilityState === "visible" && ak.intro.bereit() && !introOffen() && !dialogOffen() &&
      !html.hasAttribute("data-schneetag") && !document.querySelector("#finale:not([hidden]), .neujahr, .aufbau-buehne, .special-buehne");
  }
  function lasseFlockeFallen(immer) {
    if (!immer && (!darfFlocke() || document.querySelector(".goldflocke"))) return;
    const f = document.createElement("button");
    f.type = "button";
    f.className = "goldflocke";
    f.setAttribute("aria-label", "Goldene Schneeflocke fangen");
    f.innerHTML = '<svg viewBox="-12 -12 24 24" aria-hidden="true"><g stroke="#f3c84b" stroke-width="1.8" stroke-linecap="round">' +
      [0, 60, 120].map((w) => '<path transform="rotate(' + w + ')" d="M0 -10 V10 M0 -6 l-3 -3 M0 -6 l3 -3 M0 6 l-3 3 M0 6 l3 3"/>').join("") +
      '</g><circle r="2.2" fill="#fff4c2"/></svg>';
    const x = 8 + Math.random() * 80;
    f.style.left = x + "vw";
    document.body.appendChild(f);
    const H = window.innerHeight + 60, schwanken = 30 + Math.random() * 30;
    const bahn = [];
    for (let k = 0; k <= 10; k++) bahn.push({ transform: "translate(" + (Math.sin(k * 0.9) * schwanken).toFixed(0) + "px," + (-50 + (H + 50) * k / 10).toFixed(0) + "px) rotate(" + k * 36 + "deg)" });
    const fall = f.animate(bahn, { duration: 10000 + Math.random() * 3000, easing: "linear", fill: "forwards" });
    fall.finished.then(() => f.remove(), () => {});
    f.addEventListener("click", () => {
      const r = f.getBoundingClientRect();
      fall.cancel(); f.remove();
      funken(r.left + r.width / 2, r.top + r.height / 2, 16, ["✦", "✧", "❄"], GOLD, 60);
      const anzahl = flockenStand() + 1;
      schreib("toni-goldflocken-" + JAHR, { tag: tagSchluessel(), anzahl });
      if (anzahl >= FLOCKEN_ZIEL) melde("flocken");
      if (anzahl === FLOCKEN_ZIEL) setTimeout(() => vogelSagt("Wow, du hast heute schon 5 goldene Schneeflocken gefangen! Du bist ein echter Glückspilz ✨"), 400);
      else chip(anzahl < FLOCKEN_ZIEL ? "✨ " + anzahl + " von " + FLOCKEN_ZIEL + " goldenen Flocken" : "✨ Schon " + anzahl + " goldene Flocken heute");
    });
  }
  (function plane() {
    setTimeout(() => { lasseFlockeFallen(); plane(); }, 28000 + Math.random() * 30000);
  })();

  /* ===========================================================
     9. Plätzchen ausstechen
     =========================================================== */
  const main = document.querySelector("main");
  const FORMEN = {
    herz: "M0 9c-6-4.5-11-8.5-11-13 0-3.5 2.6-6 5.8-6 2.2 0 4 1.2 5.2 3 1.2-1.8 3-3 5.2-3 3.2 0 5.8 2.5 5.8 6 0 4.5-5 8.5-11 13z",
    stern: "M0 -11 L3.2 -3.8 11 -3.4 5 1.6 7 9.3 0 5 -7 9.3 -5 1.6 -11 -3.4 -3.2 -3.8Z",
    capy: "M-10 -5 a3.4 3.4 0 1 1 5 -4.5 h10 a3.4 3.4 0 1 1 5 4.5 a10 10 0 0 1 1 4 v3 a8 8 0 0 1 -8 8 h-6 a8 8 0 0 1 -8 -8 v-3 a10 10 0 0 1 1 -4z",
    baum: "M0 -11 L8 0 h-3 L10 7 h-7 v4 h-6 v-4 h-7 L-5 0 h-3Z",
    mond: "M3 -10 a10 10 0 1 0 7 17 a8 8 0 1 1 -7 -17z",
  };
  const FORM_LISTE = ["herz", "stern", "capy", "baum", "mond"];
  const LOECHER = [[38, 52], [70, 40], [100, 58], [132, 44], [58, 78], [92, 86], [124, 76], [150, 64]];
  let backstube = null;
  if (main) {
    backstube = document.createElement("section");
    backstube.className = "backstube";
    backstube.setAttribute("aria-label", "Plätzchen backen");
    backstube.hidden = true;
    backstube.innerHTML =
      '<div class="backstube-reihe">' +
      '<button type="button" class="teig" aria-label="Plätzchen ausstechen"><svg viewBox="0 0 200 120" aria-hidden="true">' +
      '<rect x="4" y="14" width="192" height="100" rx="14" fill="#c48c60"/><rect x="4" y="14" width="192" height="100" rx="14" fill="none" stroke="#a96f47" stroke-width="2"/>' +
      '<path d="M10 40 h180 M10 66 h180 M10 92 h180" stroke="rgba(120,70,40,.18)" stroke-width="1.4"/>' +
      '<path class="teig-platte" d="M22 40 q6 -16 40 -14 q30 -8 60 -2 q40 -4 52 14 q10 20 2 40 q-6 22 -40 22 q-30 6 -60 0 q-40 6 -52 -16 q-10 -22 -2 -44z" fill="#f3d9a8" stroke="#e5c28a" stroke-width="1.5"/>' +
      '<g class="teig-mehl" fill="#fffaf0" opacity=".7"><circle cx="50" cy="38" r="1.2"/><circle cx="90" cy="32" r="1"/><circle cx="140" cy="36" r="1.3"/><circle cx="160" cy="70" r="1"/><circle cx="40" cy="90" r="1.2"/><circle cx="110" cy="100" r="1"/><circle cx="78" cy="64" r="1.1"/></g>' +
      '<g class="teig-loecher"></g>' +
      '<g class="nudelholz"><rect x="40" y="2" width="120" height="14" rx="7" fill="#e8c39a" stroke="#b98a5c" stroke-width="1.2"/><rect x="26" y="5.5" width="16" height="7" rx="3.5" fill="#a96f47"/><rect x="158" y="5.5" width="16" height="7" rx="3.5" fill="#a96f47"/></g></svg></button>' +
      '<div class="dose" aria-hidden="true"><svg viewBox="0 0 90 120"><defs><clipPath id="dose-glas"><rect x="10" y="30" width="70" height="84" rx="14"/></clipPath></defs>' +
      '<rect x="10" y="30" width="70" height="84" rx="14" fill="rgba(255,255,255,.55)" stroke="#e8c9d6" stroke-width="2"/>' +
      '<g class="dose-inhalt" clip-path="url(#dose-glas)"></g>' +
      '<path d="M18 40 v60" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/>' +
      '<g class="dose-deckel"><rect x="6" y="18" width="78" height="14" rx="5" fill="#d6304f"/><rect x="6" y="28" width="78" height="4" fill="#9d2449"/>' +
      [16, 30, 44, 58, 72].map((x) => '<circle cx="' + x + '" cy="24" r="2" fill="#fff" opacity=".8"/>').join("") + "</g>" +
      '<rect x="24" y="60" width="42" height="22" rx="4" fill="#fffaf0" stroke="#e8c9a8"/><path d="M45 77c-2.4-1.8-4.6-3.5-4.6-5.4 0-1.3 1-2.3 2.3-2.3.9 0 1.7.5 2.3 1.2.6-.7 1.4-1.2 2.3-1.2 1.3 0 2.3 1 2.3 2.3 0 1.9-2.2 3.6-4.6 5.4z" fill="#e85d7e"/></svg></div>' +
      "</div><p class=\"backstube-text\"></p>";
    main.after(backstube);
    backstube.querySelector(".teig").addEventListener("click", (e) => stechAus(e));
  }
  function backStand() {
    const s = lies("toni-plaetzchen-" + JAHR, {});
    return { heute: s.tag === tagSchluessel() ? s.heute || 0 : 0, gesamt: s.gesamt || 0 };
  }
  function doseFuellung() {
    const d = kalTag();
    if (!d) return 0;
    if (d.jahr > JAHR || (d.monat === 12 && d.tag >= 24)) return 1;
    return d.monat === 12 ? d.tag / 24 : 0;
  }
  function zeigeDose() {
    if (!backstube) return;
    const inhalt = backstube.querySelector(".dose-inhalt");
    const n = Math.round(doseFuellung() * 21);
    let s = "";
    for (let i = 0; i < n; i++) {
      const reihe = Math.floor(i / 3), sp = i % 3;
      const x = 24 + sp * 21 + (reihe % 2 ? 10 : 0) - (reihe % 2 && sp === 2 ? 42 : 0);
      const y = 106 - reihe * 11;
      const form = FORM_LISTE[(i * 7) % FORM_LISTE.length];
      s += '<path d="' + FORMEN[form] + '" transform="translate(' + x + " " + y + ") rotate(" + ((i * 47) % 50 - 25) + ') scale(.78)" fill="' + (i % 2 ? "#d99a4e" : "#e8b46a") + '" stroke="#b7783a" stroke-width="1"/>';
    }
    inhalt.innerHTML = s;
  }
  function zeigeLoecher(anzahl) {
    const box = backstube.querySelector(".teig-loecher");
    let s = "";
    for (let i = 0; i < Math.min(anzahl, LOECHER.length); i++) {
      const [x, y] = LOECHER[i];
      s += '<path d="' + FORMEN[FORM_LISTE[i % FORM_LISTE.length]] + '" transform="translate(' + x + " " + y + ')" fill="#c9935f" stroke="#e5c28a" stroke-width="1.2"/>';
    }
    box.innerHTML = s;
  }
  function backText() {
    const t = backstube.querySelector(".backstube-text");
    const s = backStand();
    t.textContent = s.heute ? "Heute schon " + s.heute + " Plätzchen gebacken 🍪" : "Tipp auf den Teig und stich Plätzchen aus 🍪";
  }
  let backt = false;
  async function stechAus() {
    if (backt || !ak.intro.bereit()) return;
    backt = true;
    const s = backStand();
    const svg = backstube.querySelector(".teig svg");
    // Teig voller Löcher: einmal neu ausrollen
    if (s.heute > 0 && s.heute % LOECHER.length === 0 && backstube.querySelector(".teig-loecher").childElementCount >= LOECHER.length) {
      const holz = backstube.querySelector(".nudelholz");
      if (!ruhig) await holz.animate([{ transform: "translateY(0)" }, { transform: "translateY(92px)" }, { transform: "translateY(0)" }], { duration: 1100, easing: "ease-in-out" }).finished.catch(() => {});
      zeigeLoecher(0);
    }
    const nr = s.heute % LOECHER.length;
    const [lx, ly] = LOECHER[nr];
    const form = FORM_LISTE[nr % FORM_LISTE.length];
    const start = aufBildschirm(svg, lx, ly);
    const masstab = svg.getBoundingClientRect().width / 200;
    schreib("toni-plaetzchen-" + JAHR, { tag: tagSchluessel(), heute: s.heute + 1, gesamt: s.gesamt + 1 });
    zeigeLoecher(nr + 1);
    backText();
    melde("plaetzchen");
    const keks = document.createElement("div");
    keks.className = "keks-flug";
    keks.style.left = start.x + "px";
    keks.style.top = start.y + "px";
    keks.style.width = keks.style.height = 30 * masstab * 1.2 + "px";
    keks.innerHTML = '<svg viewBox="-13 -13 26 26" aria-hidden="true"><path d="' + FORMEN[form] + '" fill="#f3d9a8" stroke="#e5c28a" stroke-width="1.2"/><g class="keks-deko" opacity="0"><circle cx="-3" cy="-1" r="1" fill="#ff8fab"/><circle cx="3" cy="1" r="1" fill="#fff"/><circle cx="0" cy="4" r=".9" fill="#7cc4f0"/></g></svg>';
    document.body.appendChild(keks);
    const pfad = keks.querySelector("path"), deko = keks.querySelector(".keks-deko");
    if (ruhig) { keks.remove(); zeigeDose(); backt = false; return; }
    await keks.animate([{ transform: "translate(-50%,-50%) scale(.9)" }, { transform: "translate(-50%,-80%) scale(1.3)" }], { duration: 380, easing: "ease-out", fill: "forwards" }).finished.catch(() => {});
    // goldbraun backen
    pfad.animate([{ fill: "#f3d9a8" }, { fill: "#d99a4e" }], { duration: 600, fill: "forwards" });
    deko.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 300, fill: "forwards" });
    funken(start.x, start.y - 10, 7, ["✦", "✧"], ["#ffe9a8", "#fff", "#f3c84b"], 30);
    await warte(700);
    const dose = backstube.querySelector(".dose");
    const dr = dose.getBoundingClientRect();
    const ziel = { x: dr.left + dr.width / 2, y: dr.top + dr.height * 0.2 };
    const dx = ziel.x - start.x, dy = ziel.y - start.y;
    const deckel = backstube.querySelector(".dose-deckel");
    deckel.animate([{ transform: "none" }, { transform: "translate(-6px,-12px) rotate(-18deg)" }], { duration: 250, fill: "forwards" });
    const bahn = [];
    for (let k = 0; k <= 12; k++) {
      const t = k / 12;
      bahn.push({ transform: "translate(calc(-50% + " + (dx * t).toFixed(0) + "px), calc(-80% + " + (dy * t - Math.sin(t * Math.PI) * 70).toFixed(0) + "px)) rotate(" + t * 340 + "deg) scale(" + (1.3 - t * 0.6).toFixed(2) + ")" });
    }
    await keks.animate(bahn, { duration: 750, easing: "ease-in", fill: "forwards" }).finished.catch(() => {});
    keks.remove();
    await deckel.animate([{ transform: "translate(-6px,-12px) rotate(-18deg)" }, { transform: "none" }], { duration: 220, fill: "forwards" }).finished.catch(() => {});
    deckel.getAnimations().forEach((a) => a.cancel());
    dose.animate([{ transform: "scale(1)" }, { transform: "scale(1.06,.94)" }, { transform: "scale(.97,1.03)" }, { transform: "scale(1)" }], { duration: 420, easing: "ease-out" });
    zeigeDose();
    backt = false;
  }
  function aktualisiereBackstube() {
    if (!backstube) return;
    const sichtbar = imDezember();
    if (backstube.hidden === !sichtbar && backstube.dataset.tag === tagSchluessel()) return;
    backstube.hidden = !sichtbar;
    backstube.dataset.tag = tagSchluessel();
    if (!sichtbar) return;
    zeigeLoecher(backStand().heute % LOECHER.length || (backStand().heute ? LOECHER.length : 0));
    backText();
    zeigeDose();
  }

  /* ===========================================================
     10. Mistelzweig: zwei Daumen an den Rändern
     =========================================================== */
  const finger = new Map();
  let mistelTimer = null, mistelSperre = false, klickSperre = 0;
  function pruefeMistel() {
    clearTimeout(mistelTimer);
    if (mistelSperre || finger.size !== 2) return;
    const W = window.innerWidth;
    const xs = [...finger.values()].map((f) => f.x);
    const links = xs.some((x) => x < W * 0.2), rechts = xs.some((x) => x > W * 0.8);
    if (!links || !rechts) return;
    mistelTimer = setTimeout(() => {
      if (finger.size === 2) { klickSperre = Date.now() + 1500; mistelzweig(); }
    }, 700);
  }
  document.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "touch") return;
    finger.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY });
    pruefeMistel();
  }, true);
  document.addEventListener("pointermove", (e) => {
    const f = finger.get(e.pointerId);
    if (!f) return;
    f.x = e.clientX; f.y = e.clientY;
    if (Math.hypot(f.x - f.x0, f.y - f.y0) > 24) { finger.delete(e.pointerId); clearTimeout(mistelTimer); }
  }, true);
  const fingerWeg = (e) => { finger.delete(e.pointerId); clearTimeout(mistelTimer); };
  document.addEventListener("pointerup", fingerWeg, true);
  document.addEventListener("pointercancel", fingerWeg, true);
  // nach der Geste kein Türchen o. Ä. aus Versehen öffnen
  document.addEventListener("click", (e) => { if (Date.now() < klickSperre) { e.stopPropagation(); e.preventDefault(); } }, true);
  function mistelzweig() {
    if (mistelSperre) return;
    mistelSperre = true;
    melde("mistel");
    if (navigator.vibrate) try { navigator.vibrate([20, 60, 20]); } catch (_) { /* egal */ }
    const ebene = document.createElement("div");
    ebene.className = "mistel-ebene";
    ebene.innerHTML =
      '<svg class="mistel-zweig" viewBox="-60 0 120 150" aria-hidden="true">' +
      '<path class="mistel-band" d="M0 0 V70" stroke="#d6304f" stroke-width="3"/>' +
      '<g class="mistel-blatt-gruppe" transform="translate(0 78)">' +
      '<path d="M0 0 q-6 18 -2 40" stroke="#6b8a3a" stroke-width="2.4" fill="none"/>' +
      '<ellipse cx="-16" cy="6" rx="20" ry="8" transform="rotate(-25 -16 6)" fill="#4f8a5b"/><ellipse cx="16" cy="6" rx="20" ry="8" transform="rotate(25 16 6)" fill="#3f7f55"/>' +
      '<ellipse cx="-12" cy="22" rx="17" ry="7" transform="rotate(-55 -12 22)" fill="#5c9a66"/><ellipse cx="12" cy="22" rx="17" ry="7" transform="rotate(55 12 22)" fill="#4f8a5b"/>' +
      '<circle cx="-4" cy="10" r="4.4" fill="#fffaf0"/><circle cx="5" cy="11" r="4.4" fill="#fffaf0"/><circle cx="0" cy="17" r="4.2" fill="#fffaf0"/>' +
      '<path d="M-12 -4 q12 -12 24 0 q-12 7 -24 0z" fill="#d6304f"/><path d="M-4 -2 l-6 14 M4 -2 l6 14" stroke="#d6304f" stroke-width="3" stroke-linecap="round"/></g></svg>' +
      '<p class="mistel-text">Unter dem Mistelzweig gibt es einen Kuss 😘</p>';
    document.body.appendChild(ebene);
    const zweig = ebene.querySelector(".mistel-zweig");
    zweig.animate([{ transform: "translateY(-110%)" }, { transform: "translateY(4%)", offset: 0.75 }, { transform: "translateY(0)" }], { duration: ruhig ? 1 : 1100, easing: "cubic-bezier(.3,1.2,.5,1)", fill: "forwards" });
    zweig.querySelector(".mistel-blatt-gruppe").animate([{ transform: "translate(0px,78px) rotate(-6deg)" }, { transform: "translate(0px,78px) rotate(6deg)" }], { duration: 1400, iterations: 4, direction: "alternate", easing: "ease-in-out", delay: 900 });
    for (let k = 0; k < (ruhig ? 0 : 42); k++) {
      const h = document.createElement("span");
      h.className = "mistel-herz";
      h.textContent = "♥";
      h.style.left = Math.random() * 100 + "vw";
      h.style.fontSize = 14 + Math.random() * 18 + "px";
      h.style.color = ["#ff4d7d", "#ff8fab", "#e85d7e", "#ffc2d1"][k % 4];
      ebene.appendChild(h);
      h.animate([
        { transform: "translate(0,-40px) rotate(0)", opacity: 0 },
        { opacity: 1, offset: 0.1 },
        { transform: "translate(" + ((Math.random() - 0.5) * 80).toFixed(0) + "px," + (window.innerHeight + 40) + "px) rotate(" + ((Math.random() - 0.5) * 120).toFixed(0) + "deg)", opacity: 0.9 },
      ], { duration: 3200 + Math.random() * 1800, delay: 600 + Math.random() * 1800, easing: "ease-in", fill: "both" });
    }
    const weg = () => {
      if (!ebene.isConnected) return;
      ebene.classList.add("weg");
      setTimeout(() => { ebene.remove(); mistelSperre = false; }, 800);
    };
    ebene.addEventListener("click", weg);
    setTimeout(weg, 6500);
  }

  /* ---------- Datumsabhängiges regelmäßig nachziehen ---------- */
  function aktualisiere() {
    if (!ak.intro.bereit()) return;
    aktualisiereBackstube();
    const sm = document.querySelector(".schneemann");
    if (sm && sm.dataset.tag !== tagSchluessel()) { sm.dataset.tag = tagSchluessel(); zeigeStufe(sm, aktuelleStufe(), false); }
  }
  setInterval(aktualisiere, 3000);
  const start = setInterval(() => { if (ak.intro.bereit()) { aktualisiere(); clearInterval(start); } }, 200);

  window.adventkalender.entdecken = { flocke: () => lasseFlockeFallen(true), mistelzweig, papierflieger: () => papierflieger(document.body.getBoundingClientRect(), document.querySelector(".wunschstern")) };
})();
