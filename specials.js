/*
 * ===========================================================
 *  CAPYBARA-SPECIALS vor dem Geburtstag (11. bis 25. November)
 *  Jeden Tag läuft auf dem Countdown-Bildschirm eine andere
 *  kleine Capybara-Szene.
 * ===========================================================
 */
(function () {
  "use strict";

  const api = window.adventkalender && window.adventkalender.intro;
  if (!api) return;
  // capySeite und capyFront sind weiter unten definiert (Funktionsdeklarationen)
  window.capyGrafik = { seite: (o) => capySeite(o), front: (o) => capyFront(o) };
  const intro = document.getElementById("intro");
  const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Bausteine: Capybaras und Requisiten ---------- */
  const FELL = "#b07a52", DUNKEL = "#9a6844", OHR = "#7a4e33", AUGE = "#3a2418";
  const HUETE = {
    party: (f) => '<path d="M54 13 L61 -11 L69 13z" fill="' + (f || "#f3dc9f") + '"/><path d="M57.5 1 L65 1.5 M56 7 L67.5 7.5" stroke="#fff" stroke-width="2" opacity=".8"/><circle cx="61" cy="-11" r="3.4" fill="#e85d7e"/>',
    koch: () => '<path d="M50 13h22v-6a6 6 0 0 0-4-10 6.5 6.5 0 0 0-13 0 6 6 0 0 0-5 10z" fill="#fff" stroke="#e6d6dc"/>',
    muetze: () => '<path d="M50 13 C54 -2 72 -4 76 6 L66 13z" fill="#d6304f"/><circle cx="77" cy="5" r="3.6" fill="#fff"/><rect x="47" y="10" width="24" height="5.5" rx="2.7" fill="#fff"/>',
  };
  const HALTEN = {
    tasse: '<rect x="68" y="30" width="11" height="12" rx="2.5" fill="#c2185b"/><path d="M79 33h2a3 3 0 0 1 0 6h-2" stroke="#c2185b" fill="none" stroke-width="2"/><rect x="69" y="31" width="9" height="2.5" fill="#7a1035"/>',
    matcha: '<rect x="69" y="25" width="9" height="15" rx="1.5" fill="#eef7e6" stroke="#4a7c3a"/><rect x="69.5" y="30" width="8" height="9.5" fill="#8fbf5a"/><path d="M75 25l3-9" stroke="#9d2449" stroke-width="1.4"/>',
  };
  /* Verschiedene Capybaras: Fellfarbe und Accessoire */
  const FELLE = [
    { fell: "#b07a52", dunkel: "#9a6844", ohr: "#7a4e33" },   // klassisch
    { fell: "#c99566", dunkel: "#b5804f", ohr: "#8a5a3a" },   // karamell
    { fell: "#8a5a3a", dunkel: "#74492e", ohr: "#5a3820" },   // schoko
    { fell: "#c47a45", dunkel: "#a8653a", ohr: "#7a4526" },   // rotbraun
    { fell: "#a89080", dunkel: "#907868", ohr: "#6e5a4e" },   // graubraun
  ];
  const TYPEN = [
    { f: 0, extra: "schleife", farbe: "#e85d7e" },
    { f: 1, extra: "brille" },
    { f: 2, extra: "muetze", farbe: "#7cc4f0" },
    { f: 3, extra: "blume" },
    { f: 4, extra: "schal", farbe: "#9be3b0" },
    { f: 1, extra: "stirnband", farbe: "#b39ddb" },
    { f: 2, extra: "sommersprossen" },
    { f: 0, extra: "kopfhoerer", farbe: "#f3c84b" },
    { f: 3, extra: "schal", farbe: "#e85d7e" },
    { f: 4, extra: "schleife", farbe: "#f3c84b" },
  ];
  const typ = (n) => { const t = TYPEN[((n % TYPEN.length) + TYPEN.length) % TYPEN.length]; return Object.assign({}, FELLE[t.f], t); };
  function frontExtra(t) {
    const c = t.farbe || "#e85d7e";
    switch (t.extra) {
      case "schleife": return '<path d="M40 7 33 2v10zM40 7l7-5v10z" fill="' + c + '"/><circle cx="40" cy="7" r="2.2" fill="#fff" opacity=".7"/>';
      case "brille": return '<g fill="rgba(255,255,255,.25)" stroke="#3a2418" stroke-width="1.4"><circle cx="23.5" cy="28.5" r="4.2"/><circle cx="32.5" cy="28.5" r="4.2"/></g><path d="M27.7 28.5h.6" stroke="#3a2418" stroke-width="1.4"/>';
      case "muetze": return '<path d="M8 15a20 14 0 0 1 40 0z" fill="' + c + '"/><rect x="7" y="13" width="42" height="5" rx="2.5" fill="#fff"/><circle cx="28" cy="0" r="4" fill="#fff"/>';
      case "blume": return '<g transform="translate(11 6)"><circle r="2.6" cx="0" cy="-3" fill="#fda4b8"/><circle r="2.6" cx="3" cy="0" fill="#fda4b8"/><circle r="2.6" cx="0" cy="3" fill="#fda4b8"/><circle r="2.6" cx="-3" cy="0" fill="#fda4b8"/><circle r="1.8" fill="#f3c84b"/></g>';
      case "schal": return '<path d="M9 38q19 10 38 0v6q-19 9-38 0z" fill="' + c + '"/><rect x="37" y="40" width="5" height="10" rx="2" fill="' + c + '"/><path d="M12 41h32" stroke="#fff" stroke-width="1.2" stroke-dasharray="3 3"/>';
      case "stirnband": return '<rect x="7" y="13" width="42" height="4.5" rx="2" fill="' + c + '"/><circle cx="44" cy="15" r="2.6" fill="#fff"/>';
      case "sommersprossen": return '<g fill="#7a4526" opacity=".55"><circle cx="13" cy="29" r=".9"/><circle cx="15.5" cy="31" r=".9"/><circle cx="12" cy="31.5" r=".8"/><circle cx="43" cy="29" r=".9"/><circle cx="40.5" cy="31" r=".9"/><circle cx="44" cy="31.5" r=".8"/></g>';
      case "kopfhoerer": return '<path d="M8 22a20 20 0 0 1 40 0" fill="none" stroke="#3a3a48" stroke-width="2.6"/><rect x="3" y="18" width="8" height="12" rx="3" fill="' + c + '"/><rect x="45" y="18" width="8" height="12" rx="3" fill="' + c + '"/>';
      default: return "";
    }
  }
  function seiteExtra(t) {
    const c = t.farbe || "#e85d7e";
    switch (t.extra) {
      case "schleife": return '<path d="M56 10 50 5v10zM56 10l6-5v10z" fill="' + c + '"/>';
      case "brille": return '<circle cx="62.5" cy="22" r="4" fill="rgba(255,255,255,.25)" stroke="#3a2418" stroke-width="1.3"/><path d="M66.5 22l5-1" stroke="#3a2418" stroke-width="1.3"/>';
      case "muetze": return '<path d="M49 15a12 10 0 0 1 24 0z" fill="' + c + '"/><rect x="48" y="13" width="26" height="4.5" rx="2.2" fill="#fff"/><circle cx="61" cy="4" r="3.4" fill="#fff"/>';
      case "blume": return '<g transform="translate(54 9)"><circle r="2.3" cx="0" cy="-2.6" fill="#fda4b8"/><circle r="2.3" cx="2.6" cy="0" fill="#fda4b8"/><circle r="2.3" cx="0" cy="2.6" fill="#fda4b8"/><circle r="2.3" cx="-2.6" cy="0" fill="#fda4b8"/><circle r="1.6" fill="#f3c84b"/></g>';
      case "schal": return '<path d="M46 31q8 6 18 1v6q-10 5-18-1z" fill="' + c + '"/><rect x="49" y="34" width="6" height="13" rx="2" fill="' + c + '"/>';
      case "stirnband": return '<rect x="48" y="14" width="24" height="4" rx="2" fill="' + c + '"/>';
      case "sommersprossen": return '<g fill="#7a4526" opacity=".55"><circle cx="61" cy="27" r=".9"/><circle cx="64" cy="29" r=".9"/><circle cx="60" cy="30" r=".8"/></g>';
      case "kopfhoerer": return '<path d="M50 20a11 11 0 0 1 22 0" fill="none" stroke="#3a3a48" stroke-width="2.4"/><rect x="51" y="17" width="7" height="10" rx="3" fill="' + c + '"/>';
      default: return "";
    }
  }
  // Capybara von der Seite, schaut nach rechts
  function capySeiteInhalt(o) {
    o = o || {};
    const t = o.typ !== undefined ? typ(o.typ) : { fell: FELL, dunkel: DUNKEL, ohr: OHR };
    const beine = o.ohneBeine ? "" :
      '<rect x="16" y="40" width="7" height="11" rx="3" fill="' + t.dunkel + '"/><rect x="26" y="40" width="7" height="11" rx="3" fill="' + t.ohr + '"/>' +
      '<rect x="42" y="40" width="7" height="11" rx="3" fill="' + t.dunkel + '"/><rect x="51" y="40" width="7" height="11" rx="3" fill="' + t.ohr + '"/>';
    return beine + (o.unten || "") +
      '<ellipse cx="34" cy="31" rx="27" ry="16" fill="' + t.fell + '"/>' +
      '<rect x="48" y="12" width="24" height="24" rx="10" fill="' + t.fell + '"/>' +
      '<rect x="62" y="18" width="13" height="16" rx="6" fill="' + t.dunkel + '"/>' +
      '<ellipse cx="55" cy="12" rx="3.5" ry="3" fill="' + t.ohr + '"/>' +
      '<path d="M60 22q2.5-2 5 0" fill="none" stroke="' + AUGE + '" stroke-width="1.8" stroke-linecap="round"/>' +
      '<ellipse cx="72" cy="23" rx="1.4" ry="1" fill="' + AUGE + '"/>' +
      '<circle cx="62" cy="28" r="2.4" fill="#f7809b" opacity=".55"/>' +
      (o.typ !== undefined && !o.hut ? seiteExtra(t) : "") +
      (o.hut ? HUETE[o.hut](o.hutFarbe) : "") +
      (o.halt ? HALTEN[o.halt] : "");
  }
  function capySeite(o) { return '<svg viewBox="0 -16 86 68" aria-hidden="true">' + capySeiteInhalt(o) + "</svg>"; }
  // Capybara von vorne (Gesicht), Koordinaten 0..56 x -12..46
  function capyFrontInhalt(o) {
    o = o || {};
    const t = o.typ !== undefined ? typ(o.typ) : { fell: FELL, dunkel: DUNKEL, ohr: OHR };
    return '<ellipse cx="14" cy="9" rx="5" ry="4" fill="' + t.ohr + '"/><ellipse cx="42" cy="9" rx="5" ry="4" fill="' + t.ohr + '"/>' +
      '<rect x="7" y="6" width="42" height="36" rx="17" fill="' + t.fell + '"/>' +
      '<ellipse cx="28" cy="31" rx="13" ry="9.5" fill="' + t.dunkel + '"/>' +
      '<ellipse cx="23.5" cy="28.5" rx="1.8" ry="1.1" fill="' + AUGE + '"/><ellipse cx="32.5" cy="28.5" rx="1.8" ry="1.1" fill="' + AUGE + '"/>' +
      (o.mund === "offen" ? '<ellipse cx="28" cy="35.5" rx="2.6" ry="2" fill="#6b1532"/>' : '<path d="M25 35q3 2 6 0" fill="none" stroke="' + AUGE + '" stroke-width="1.4" stroke-linecap="round"/>') +
      '<path d="M14 20q3-2.5 6 0M36 20q3-2.5 6 0" fill="none" stroke="' + AUGE + '" stroke-width="1.8" stroke-linecap="round"/>' +
      '<circle cx="14" cy="27" r="2.6" fill="#f7809b" opacity=".6"/><circle cx="42" cy="27" r="2.6" fill="#f7809b" opacity=".6"/>' +
      (o.typ !== undefined && !o.yuzu && !o.handtuch ? frontExtra(t) : "") +
      (o.yuzu ? '<circle cx="28" cy="1" r="7" fill="#ffb020"/><circle cx="25.5" cy="-1.5" r="1.6" fill="#fff" opacity=".5"/><path d="M28 -6q3-4 7-2" stroke="#4a8a5c" stroke-width="2" fill="none"/>' : "") +
      (o.handtuch ? '<path d="M11 9q17-12 34 0l-3 6q-14-7-28 0z" fill="' + (o.handtuch === true ? "#fff" : o.handtuch) + '"/><path d="M15 6q13-6 26 0" stroke="rgba(0,0,0,.08)" fill="none"/>' : "") +
      (o.helm ? '<path d="M7 18a21 21 0 0 1 42 0z" fill="#7cc4f0" opacity=".35"/>' : "");
  }
  // Capybara von hinten (für das Kino), gleiche Koordinaten wie capyFront
  function capyHinten(n) {
    const t = typ(n);
    return '<svg viewBox="0 -12 56 58" aria-hidden="true"><ellipse cx="14" cy="9" rx="5" ry="4" fill="' + t.ohr + '"/><ellipse cx="42" cy="9" rx="5" ry="4" fill="' + t.ohr + '"/>' +
      '<rect x="7" y="6" width="42" height="40" rx="17" fill="' + t.fell + '"/><path d="M14 16q14-8 28 0" fill="none" stroke="' + t.dunkel + '" stroke-width="2" opacity=".5"/>' +
      '<ellipse cx="28" cy="40" rx="17" ry="8" fill="' + t.dunkel + '" opacity=".5"/></svg>';
  }
  function capyFront(o) { return '<svg viewBox="0 -12 56 58" aria-hidden="true">' + capyFrontInhalt(o) + "</svg>"; }

  // Badeente mit Kopf, Flügel und Schnabel zum Animieren (schaut nach rechts)
  function badeente(farbe) {
    const f = farbe || "#ffd23f", dunkel = "#f2b705";
    return '<svg viewBox="0 0 64 52" aria-hidden="true">' +
      '<ellipse class="ente-welle" cx="30" cy="45" rx="26" ry="3.4" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="1.6"/>' +
      '<g class="ente-koerper">' +
      '<path d="M12 31 Q3 20 6 15 Q13 21 17 27z" fill="' + dunkel + '"/>' +
      '<ellipse cx="30" cy="34" rx="21" ry="11" fill="' + f + '"/>' +
      '<ellipse cx="30" cy="40" rx="17" ry="4" fill="rgba(0,0,0,.06)"/>' +
      '<path class="ente-fluegel" d="M19 31 q9 -9 20 -3 q-4 9 -20 3z" fill="' + dunkel + '"/>' +
      '<g class="ente-kopf"><circle cx="43" cy="19" r="10.5" fill="' + f + '"/>' +
      '<path d="M37 9 q2 -5 6 -3 q-2 1 -2 4" fill="' + dunkel + '"/>' +
      '<circle cx="46" cy="16" r="2" fill="#2b2b2b"/><circle cx="46.7" cy="15.3" r=".7" fill="#fff"/>' +
      '<circle cx="44" cy="22" r="2.4" fill="#ff9eb5" opacity=".6"/>' +
      '<g class="ente-schnabel"><path d="M51 19 q9 -2 11 2 q-5 2 -11 1z" fill="#ff8a1f"/><path class="ente-unten" d="M51 22 q8 0 10 1.5 q-5 2.5 -10 .5z" fill="#e5700f"/></g>' +
      "</g></g></svg>";
  }
  function quaken(ente, text) {
    if (!ente || !ente.isConnected) return;
    ente.classList.remove("quakt"); void ente.offsetWidth; ente.classList.add("quakt");
    const b = document.createElement("span");
    b.className = "ente-quak";
    b.textContent = text || "Quak!";
    ente.appendChild(b);
    setTimeout(() => b.remove(), 1300);
  }

  // Partyraum hinter der Fotobox: Tapete, Holzboden, roter Teppich, Lichterkette, Ballons
  function fotoraum(bb, boxUnten) {
    const fb = Math.min(H * 0.8, boxUnten - bb * 0.12);   // Oberkante des Bodens
    const r = (n) => n.toFixed(1);
    let svg = '<svg viewBox="0 0 ' + r(W) + " " + r(H) + '" aria-hidden="true"><defs>' +
      '<pattern id="spTapete" width="34" height="20" patternUnits="userSpaceOnUse"><rect width="34" height="20" fill="#f9e0e8"/><rect width="15" height="20" fill="#f5d2de"/><circle cx="25" cy="10" r="1.4" fill="#fbe9ef"/></pattern>' +
      '<radialGradient id="spSpot" cx="50%" cy="0%" r="75%"><stop offset="0" stop-color="#fff8e6" stop-opacity=".75"/><stop offset=".6" stop-color="#fff8e6" stop-opacity=".12"/><stop offset="1" stop-color="#fff8e6" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="spBoden" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b98159"/><stop offset="1" stop-color="#d4a479"/></linearGradient></defs>' +
      // Wand, Vertäfelung, Fußleiste
      '<rect width="' + r(W) + '" height="' + r(fb) + '" fill="url(#spTapete)"/>' +
      '<rect y="' + r(fb - H * 0.13) + '" width="' + r(W) + '" height="' + r(H * 0.13) + '" fill="#fcecf1"/>' +
      '<rect y="' + r(fb - H * 0.13 - 4) + '" width="' + r(W) + '" height="5" fill="#e8b4c4"/>' +
      '<rect y="' + r(fb - 7) + '" width="' + r(W) + '" height="7" fill="#fffafc"/>';
    for (let x = 30; x < W; x += 70) svg += '<rect x="' + r(x) + '" y="' + r(fb - H * 0.11) + '" width="50" height="' + r(H * 0.08) + '" rx="3" fill="none" stroke="#efc9d5" stroke-width="2"/>';
    // Holzboden mit Fluchtpunkt
    svg += '<rect y="' + r(fb) + '" width="' + r(W) + '" height="' + r(H - fb + 2) + '" fill="url(#spBoden)"/>';
    const vx = W / 2, vy = fb - H * 0.9;
    for (let k = -14; k <= 14; k++) {
      const xu = W / 2 + k * W * 0.11, t = (fb - vy) / (H - vy);
      svg += '<path d="M' + r(vx + (xu - vx) * t) + " " + r(fb) + "L" + r(xu) + " " + r(H) + '" stroke="#a7714c" stroke-width="1.2" opacity=".55"/>';
    }
    for (let k = 1; k <= 4; k++) { const y = fb + (H - fb) * Math.pow(k / 5, 1.6); svg += '<path d="M0 ' + r(y) + "H" + r(W) + '" stroke="#a7714c" stroke-width="1" opacity=".3"/>'; }
    // roter Teppich bis zur Box
    svg += '<path d="M' + r(W / 2 - bb * 0.36) + " " + r(fb + 2) + "L" + r(W / 2 + bb * 0.36) + " " + r(fb + 2) + "L" + r(W / 2 + bb * 0.75) + " " + r(H) + "L" + r(W / 2 - bb * 0.75) + " " + r(H) + 'Z" fill="#b8173f"/>' +
      '<path d="M' + r(W / 2 - bb * 0.33) + " " + r(fb + 4) + "L" + r(W / 2 - bb * 0.69) + " " + r(H) + "M" + r(W / 2 + bb * 0.33) + " " + r(fb + 4) + "L" + r(W / 2 + bb * 0.69) + " " + r(H) + '" stroke="#f3c84b" stroke-width="2"/>';
    // Bilderrahmen an der Wand
    [[W * 0.16, fb * 0.36, "#e85d7e"], [W * 0.84, fb * 0.3, "#f3c84b"]].forEach(([x, y, c]) => {
      svg += '<g transform="translate(' + r(x - 22) + " " + r(y - 28) + ')"><rect width="44" height="56" rx="3" fill="#d4a84b"/><rect x="5" y="5" width="34" height="46" fill="#fff6f8"/>' +
        '<path d="M22 22c-2.4-4-9-3-9 1.6 0 4 9 9 9 9s9-5 9-9c0-4.6-6.6-5.6-9-1.6z" fill="' + c + '"/></g>';
    });
    // Lichtkegel auf die Box
    svg += '<path d="M' + r(W / 2 - 30) + " 0L" + r(W / 2 + 30) + " 0L" + r(W / 2 + bb * 0.9) + " " + r(fb) + "L" + r(W / 2 - bb * 0.9) + " " + r(fb) + 'Z" fill="url(#spSpot)"/>';
    // Lichterkette mit Wimpeln in zwei Bögen
    const bogen = (x0, x1, y, tief) => {
      let p = '<path d="M' + r(x0) + " " + r(y) + "Q" + r((x0 + x1) / 2) + " " + r(y + tief * 2) + " " + r(x1) + " " + r(y) + '" stroke="#5a4048" stroke-width="1.5" fill="none"/>';
      const n = Math.max(5, Math.round((x1 - x0) / 34));
      for (let k = 1; k < n; k++) {
        const t = k / n, x = (1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * ((x0 + x1) / 2) + t * t * x1, yy = (1 - t) * (1 - t) * y + 2 * t * (1 - t) * (y + tief * 2) + t * t * y;
        const farbe = ["#e85d7e", "#f3c84b", "#7cc4f0", "#fff"][k % 4];
        p += k % 2 ? '<path d="M' + r(x - 9) + " " + r(yy) + "L" + r(x + 9) + " " + r(yy) + "L" + r(x) + " " + r(yy + 18) + 'Z" fill="' + farbe + '" opacity=".95"/>'
          : '<circle class="sp-lampe" style="animation-delay:' + (-k * 0.2) + 's" cx="' + r(x) + '" cy="' + r(yy + 4) + '" r="4.5" fill="#ffd36b"/>';
      }
      return p;
    };
    svg += bogen(-10, W / 2, H * 0.06, H * 0.05) + bogen(W / 2, W + 10, H * 0.06, H * 0.05);
    // Requisitentisch rechts
    const tx = W * 0.86, ty = fb + (H - fb) * 0.15;
    svg += '<g transform="translate(' + r(tx) + " " + r(ty) + ')"><rect x="-3" y="-34" width="6" height="34" fill="#8a5a3c"/><ellipse cx="0" cy="-34" rx="26" ry="6" fill="#a8713f"/><ellipse cx="0" cy="-36" rx="26" ry="6" fill="#c48852"/>' +
      '<path d="M-18 -40l7 -18 7 18z" fill="#7cc4f0"/><circle cx="-11" cy="-58" r="2.6" fill="#f3c84b"/>' +
      '<g transform="translate(2 -44)"><rect width="9" height="5" rx="2.5" fill="#1d1d24"/><rect x="11" width="9" height="5" rx="2.5" fill="#1d1d24"/><path d="M9 2h2" stroke="#1d1d24" stroke-width="1.5"/></g>' +
      '<ellipse cx="0" cy="0" rx="18" ry="4" fill="rgba(60,30,20,.25)"/></g>';
    svg += "</svg>";
    const raum = figur(svg, "sp-fotoraum", { left: "0", top: "0", width: W + "px", height: H + "px" });
    raum.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, fill: "forwards" });
    // Ballontrauben links und rechts, schaukeln leicht
    [[W * 0.06, ["#e85d7e", "#fff", "#f3c84b"]], [W * 0.94, ["#f3c84b", "#ff9ec0", "#fff"]]].forEach(([x, farben], i) => {
      const bw = Math.min(120, W * 0.16), bhoch = fb - H * 0.3;
      const b = figur('<svg viewBox="0 0 70 ' + r(fb - bhoch + 40) + '" aria-hidden="true">' +
        '<path d="M35 ' + r(fb - bhoch + 40) + 'Q30 70 22 40M35 ' + r(fb - bhoch + 40) + 'Q38 70 48 36M35 ' + r(fb - bhoch + 40) + 'Q34 60 35 30" stroke="#a08890" stroke-width="1" fill="none"/>' +
        [[22, 22, 0], [48, 18, 1], [35, 12, 2]].map(([cx, cy, k]) => '<ellipse cx="' + cx + '" cy="' + cy + '" rx="13" ry="15.5" fill="' + farben[k] + '" stroke="rgba(0,0,0,.06)"/><path d="M' + (cx - 1.5) + " " + (cy + 15) + "l1.5 3 1.5-3z" + '" fill="' + farben[k] + '"/><ellipse cx="' + (cx - 4.5) + '" cy="' + (cy - 6) + '" rx="3.4" ry="5" fill="#fff" opacity=".5"/>').join("") +
        "</svg>", "sp-ballons", { left: x - bw / 2 + "px", top: bhoch - 20 + "px", width: bw + "px" });
      b.style.animationDelay = -i * 1.3 + "s";
      b.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, fill: "forwards" });
    });
  }

  let W = 0, H = 0;
  function figur(html, cls, stil) {
    const d = document.createElement("div");
    d.className = "sp-figur " + (cls || "");
    d.innerHTML = html;
    Object.assign(d.style, stil || {});
    buehne.appendChild(d);
    return d;
  }
  const zufall = (a, b) => a + Math.random() * (b - a);
  const spaeter = (ms, f) => timer.push(setTimeout(f, ms));
  let buehne = null, timer = [];

  function dampf(ziel, x, y, n) {
    for (let k = 0; k < (n || 3); k++) {
      const s = document.createElement("span");
      s.className = "sp-dampf";
      s.style.left = x + "px"; s.style.top = y + "px";
      s.style.animationDelay = (k * 0.6) + "s";
      ziel.appendChild(s);
    }
  }
  function partikel(x, y, zeichen, n, weite, farben) {
    for (let k = 0; k < n; k++) {
      const s = document.createElement("span");
      s.className = "sp-partikel";
      s.textContent = zeichen[k % zeichen.length];
      if (farben) s.style.color = farben[k % farben.length];
      s.style.left = x + "px"; s.style.top = y + "px";
      buehne.appendChild(s);
      const w = (k / n) * Math.PI * 2 + zufall(-0.2, 0.2), r = weite * zufall(0.6, 1);
      s.animate([
        { transform: "translate(-50%,-50%) scale(.3)", opacity: 1 },
        { transform: "translate(calc(-50% + " + Math.cos(w) * r + "px), calc(-50% + " + Math.sin(w) * r + "px)) scale(1)", opacity: 1, offset: 0.6 },
        { transform: "translate(calc(-50% + " + Math.cos(w) * r * 1.1 + "px), calc(-50% + " + (Math.sin(w) * r * 1.1 + 40) + "px)) scale(.9)", opacity: 0 },
      ], { duration: 1600, easing: "cubic-bezier(.2,.8,.3,1)", fill: "forwards" });
    }
  }


  // Sprechblase für eine bestimmte Zeit
  function sagBlase(text, stil, ms) {
    const b = figur("<span>" + text + "</span>", "sp-blase", stil);
    spaeter(ms || 1800, () => b.remove());
    return b;
  }
  // Regen aus Zeichen (Herzen, Konfetti, Sterne), der von oben fällt
  function regen(zeichen, n, farben, dauer, groesse) {
    for (let k = 0; k < n; k++) {
      const s = document.createElement("span");
      s.className = "sp-regen";
      s.textContent = zeichen[k % zeichen.length];
      s.style.left = zufall(2, 98) + "%";
      s.style.color = farben[k % farben.length];
      s.style.fontSize = zufall(groesse ? groesse * 0.7 : 12, groesse || 24) + "px";
      buehne.appendChild(s);
      s.animate([
        { transform: "translate(0,-40px) rotate(0)", opacity: 0 },
        { opacity: 1, offset: 0.1 },
        { transform: "translate(" + zufall(-40, 40) + "px," + (H + 40) + "px) rotate(" + zufall(-200, 200) + "deg)", opacity: 0.9 },
      ], { duration: zufall(dauer * 0.6, dauer), delay: zufall(0, dauer * 0.5), easing: "ease-in", fill: "both" });
    }
  }
  // Schneefall
  function schneefall(n, ab) {
    for (let k = 0; k < n; k++) {
      const f = figur("", "sp-flocke", { left: zufall(0, W) + "px", top: "-10px", width: zufall(4, 8) + "px" });
      f.style.height = f.style.width;
      f.animate([{ transform: "translate(0,0)" }, { transform: "translate(" + zufall(-30, 30) + "px," + (H + 20) + "px)" }], { duration: zufall(6000, 10000), delay: (ab || 0) + zufall(0, 9000), easing: "linear", fill: "both" });
    }
  }
  // Lage eines Elements auf der Bühne
  function lage(el) { const r = el.getBoundingClientRect(), b = buehne.getBoundingClientRect(); return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height }; }

  /* ---------- Die fünfzehn Szenen (11. bis 25. November) ---------- */
  const SZENEN = {
    11: { titel: "Kinoabend bei der Capy Crew 🍿", dauer: 12500, spiel() {
      // Saal wird dunkel
      const saal = figur("", "sp-kinosaal");
      saal.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, fill: "forwards" });
      const lb = Math.min(W * 0.86, 440), lh = lb * 0.56, lx = (W - lb) / 2, ly = Math.max(H * 0.06, 20);
      // Lichtkegel vom Projektor
      const kegel = figur('<svg viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="kino-licht" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff6d8" stop-opacity=".55"/><stop offset="1" stop-color="#fff6d8" stop-opacity=".06"/></linearGradient></defs><path d="M47 100 L53 100 L100 0 L0 0z" fill="url(#kino-licht)"/></svg>',
        "sp-kinokegel", { left: lx + "px", top: ly + lh + "px", width: lb + "px", height: Math.max(40, H - (ly + lh) - H * 0.2) + "px", opacity: "0" });
      // Leinwand mit Film
      const lw = figur('<div class="sp-film"></div><div class="sp-vorhang links"></div><div class="sp-vorhang rechts"></div><div class="sp-vorhang-oben"></div>', "sp-leinwand",
        { left: lx + "px", top: ly + "px", width: lb + "px", height: lh + "px" });
      lw.animate([{ opacity: 0, transform: "scale(.94)" }, { opacity: 1, transform: "scale(1)" }], { duration: 800, fill: "forwards" });
      const film = lw.querySelector(".sp-film");
      const [vl, vr] = lw.querySelectorAll(".sp-vorhang");
      const auf = (an, verz) => [vl, vr].forEach((v) => v.animate([{ transform: "scaleX(" + (an ? 1 : 0.12) + ")" }, { transform: "scaleX(" + (an ? 0.12 : 1) + ")" }],
        { duration: 1300, delay: verz || 0, easing: "cubic-bezier(.5,0,.3,1)", fill: "forwards" }));
      spaeter(900, () => { auf(true); kegel.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0.8 }, { opacity: 1 }], { duration: 1600, fill: "forwards" }); });
      // Der Film: zwei Capys kommen aufeinander zu und verlieben sich
      const fg = lh * 0.42;
      film.innerHTML = '<div class="sp-film-himmel"></div><div class="sp-film-boden"></div>';
      const held = document.createElement("div"), heldin = document.createElement("div");
      held.className = heldin.className = "sp-filmcapy";
      held.innerHTML = capySeite({ typ: 2 }); heldin.innerHTML = capySeite({ typ: 0 });
      [held, heldin].forEach((c) => { c.style.width = fg * 1.3 + "px"; c.style.bottom = lh * 0.12 + "px"; film.appendChild(c); });
      heldin.firstChild.style.transform = "scaleX(-1)";
      const mitteL = lb / 2 - fg * 1.3 + fg * 0.18, mitteR = lb / 2 - fg * 0.18;
      spaeter(2100, () => {
        held.animate([{ left: -fg * 1.4 + "px" }, { left: mitteL + "px" }], { duration: 2400, easing: "ease-out", fill: "forwards" });
        heldin.animate([{ left: lb + "px" }, { left: mitteR + "px" }], { duration: 2400, easing: "ease-out", fill: "forwards" });
        [held, heldin].forEach((c) => c.firstChild.animate([{ translate: "0 0" }, { translate: "0 -" + fg * 0.08 + "px" }], { duration: 300, direction: "alternate", iterations: 8 }));
      });
      const filmHerz = document.createElement("div");
      filmHerz.className = "sp-filmherz"; filmHerz.textContent = "♥";
      filmHerz.style.fontSize = lh * 0.34 + "px";
      film.appendChild(filmHerz);
      spaeter(4600, () => {
        held.firstChild.animate([{ rotate: "0deg" }, { rotate: "8deg" }], { duration: 400, fill: "forwards" });
        heldin.firstChild.animate([{ rotate: "0deg" }, { rotate: "-8deg" }], { duration: 400, fill: "forwards" });
        filmHerz.animate([{ transform: "translate(-50%,0) scale(0)", opacity: 0 }, { transform: "translate(-50%,-10%) scale(1.25)", opacity: 1, offset: 0.6 }, { transform: "translate(-50%,-6%) scale(1)", opacity: 1 }],
          { duration: 900, easing: "ease-out", fill: "forwards" });
      });
      const ende = document.createElement("div");
      ende.className = "sp-filmende"; ende.textContent = "Ende ♥";
      ende.style.fontSize = lh * 0.2 + "px";
      film.appendChild(ende);
      spaeter(7600, () => {
        film.querySelectorAll(".sp-film-himmel, .sp-film-boden, .sp-filmcapy, .sp-filmherz").forEach((e) => e.animate([{ filter: "brightness(1)" }, { filter: "brightness(.3)" }], { duration: 600, fill: "forwards" }));
        ende.animate([{ opacity: 0, transform: "translate(-50%,-50%) scale(.8)" }, { opacity: 1, transform: "translate(-50%,-50%) scale(1)" }], { duration: 700, fill: "forwards" });
      });
      spaeter(9000, () => { auf(false); kegel.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, fill: "forwards" }); });
      // Publikum von hinten in roten Sesseln
      const rb = Math.min(W * 0.96, 480), sitz = rb / 4;
      const reihe = figur('<svg viewBox="0 0 400 70" preserveAspectRatio="none"><rect x="0" y="22" width="400" height="48" rx="10" fill="#7a1035"/>' +
        [0, 1, 2, 3].map((i) => '<rect x="' + (i * 100 + 6) + '" y="0" width="88" height="60" rx="16" fill="#b0234f"/><rect x="' + (i * 100 + 14) + '" y="6" width="72" height="10" rx="5" fill="#c94a70" opacity=".6"/>').join("") + "</svg>",
        "sp-kinoreihe", { left: (W - rb) / 2 + "px", width: rb + "px", height: sitz * 0.62 + "px" });
      const gaeste = [0, 1, 2, 3].map((i) => {
        const g = figur('<div class="sp-kopf-hinten">' + capyHinten(i === 1 ? 3 : i === 2 ? 1 : i * 2) + '</div><div class="sp-kopf-vorne">' + capyFront({ typ: i === 1 ? 3 : i === 2 ? 1 : i * 2 }) + "</div>",
          "sp-zuschauer", { left: (W - rb) / 2 + i * sitz + sitz * 0.16 + "px", width: sitz * 0.68 + "px" });
        g.animate([{ transform: "translateY(40%)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }], { duration: 700, delay: 300 + i * 120, easing: "cubic-bezier(.3,1.4,.5,1)", fill: "both" });
        return g;
      });
      // Popcorn wird genascht
      const eimer = figur('<svg viewBox="0 0 40 46"><path d="M6 14h28l-4 30H10z" fill="#fff"/><path d="M10 14l2 30M18 14v30M26 14l-1 30M33 14l-3 30" stroke="#e8455f" stroke-width="3"/>' +
        [[8, 12], [14, 7], [20, 10], [26, 6], [32, 11], [17, 3], [24, 1]].map(([x, y]) => '<circle cx="' + x + '" cy="' + y + '" r="5" fill="#fff6d8" stroke="#f3dc9f"/>').join("") + "</svg>",
        "sp-popcorn", { left: (W - rb) / 2 + sitz * 1.72 + "px", width: sitz * 0.32 + "px" });
      eimer.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 900, fill: "both" });
      const knabbern = () => {
        const r = eimer.getBoundingClientRect(), b = buehne.getBoundingClientRect();
        for (let k = 0; k < 3; k++) {
          const s = document.createElement("span");
          s.className = "sp-popkorn";
          s.style.left = r.left - b.left + r.width * zufall(0.2, 0.8) + "px";
          s.style.top = r.top - b.top + "px";
          buehne.appendChild(s);
          const dx = zufall(-40, 40), hoch = zufall(30, 70);
          s.animate([{ transform: "translate(0,0)" }, { transform: "translate(" + dx / 2 + "px,-" + hoch + "px)", offset: 0.5 }, { transform: "translate(" + dx + "px,10px)", opacity: 0 }],
            { duration: 900, easing: "ease-out", fill: "forwards" });
        }
      };
      for (const t of [2600, 3800, 5200, 6600]) spaeter(t, knabbern);
      // beim Happy End dreht sich ein Capy gerührt um
      spaeter(5600, () => {
        const g = gaeste[1];
        g.classList.add("dreht");
        const tr = document.createElement("span");
        tr.className = "sp-traene";
        g.appendChild(tr);
        tr.animate([{ transform: "translateY(0)", opacity: 0 }, { opacity: 1, offset: 0.2 }, { transform: "translateY(" + sitz * 0.35 + "px)", opacity: 0 }], { duration: 1100, iterations: 2, delay: 300 });
        const b = figur("<span>Hach, wie schön 🥹</span>", "sp-blase", { left: (W - rb) / 2 + sitz * 1.5 + "px", bottom: H - g.offsetTop + 8 + "px" });
        spaeter(2200, () => { b.remove(); g.classList.remove("dreht"); });
      });
      // zum Schluss fliegt das Popcorn vor Begeisterung in die Luft
      spaeter(10000, () => {
        gaeste.forEach((g, i) => g.animate([{ transform: "translateY(0)" }, { transform: "translateY(-16px)" }, { transform: "translateY(0)" }], { duration: 450, delay: i * 80, iterations: 2 }));
        const r = eimer.getBoundingClientRect(), b = buehne.getBoundingClientRect();
        partikel(r.left - b.left + r.width / 2, r.top - b.top, ["🍿", "♥", "🍿", "✨"], 18, 150, ["#e85d7e", "#f3c84b"]);
      });
    } },

    12: { titel: "Mit der Capy Seilbahn ganz nach oben 🚡", dauer: 12500, spiel() {
      // Berge und Seil
      const berge = figur('<svg viewBox="0 0 400 160" preserveAspectRatio="none">' +
        '<path d="M0 160 L0 90 L60 40 L110 85 L170 20 L240 95 L300 35 L360 80 L400 55 V160z" fill="#c9d7ee"/>' +
        '<path d="M60 40 L48 52 L58 50 L66 56 L72 48z M170 20 L156 36 L168 33 L176 40 L184 31z M300 35 L288 49 L298 47 L306 52 L312 45z" fill="#fff"/>' +
        '<path d="M0 160 L0 120 Q80 95 150 118 T300 110 T400 116 V160z" fill="#eef3fb"/>' +
        [30, 70, 250, 330, 380].map((x, i) => '<path d="M' + x + ' ' + (126 - i % 2 * 6) + ' l-9 18 h18z" fill="#3f7f55"/><path d="M' + x + ' ' + (118 - i % 2 * 6) + ' l-7 14 h14z" fill="#4f8a5b"/>').join("") + "</svg>",
        "sp-berge");
      berge.animate([{ transform: "translateY(40%)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }], { duration: 1000, easing: "ease-out", fill: "forwards" });
      for (let k = 0; k < 3; k++) {
        const w = figur('<svg viewBox="0 0 120 50"><path d="M18 46h86a16 16 0 0 0 0-32 22 22 0 0 0-40-8 18 18 0 0 0-30 8 16 16 0 0 0-16 32z" fill="#fff"/></svg>', "sp-wolke-fahrt",
          { top: H * (0.05 + k * 0.12) + "px", width: zufall(90, 150) + "px", opacity: "0.85" });
        w.animate([{ transform: "translateX(" + (k % 2 ? W : -160) + "px)" }, { transform: "translateX(" + (k % 2 ? -160 : W) + "px)" }], { duration: zufall(14000, 20000), delay: -k * 4000, fill: "both" });
      }
      const y0 = H * 0.16, y1 = H * 0.5;
      const seilY = (x) => y0 + (y1 - y0) * (x / W) + Math.sin((x / W) * Math.PI) * H * 0.04;
      let pfad = "";
      for (let i = 0; i <= 40; i++) { const x = (i / 40) * W; pfad += (i ? "L" : "M") + x.toFixed(1) + " " + seilY(x).toFixed(1); }
      const seil = figur('<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '"><path d="' + pfad + '" stroke="#4a3542" stroke-width="2.4" fill="none"/>' +
        '<path d="' + pfad + '" stroke="#4a3542" stroke-width="1.2" fill="none" transform="translate(0 -7)" opacity=".55"/></svg>', "sp-seil", { left: "0", top: "0" });
      seil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, fill: "forwards" });
      // Gondel mit zwei Capys
      const gb = Math.min(W * 0.36, 170);
      const gondel = figur('<svg viewBox="0 0 120 150">' +
        '<rect x="56" y="0" width="8" height="34" fill="#4a3542"/><circle cx="52" cy="6" r="7" fill="#6b5560"/><circle cx="68" cy="6" r="7" fill="#6b5560"/>' +
        '<rect x="10" y="32" width="100" height="12" rx="6" fill="#9d2449"/>' +
        '<rect x="6" y="42" width="108" height="98" rx="20" fill="#e85d7e"/><rect x="6" y="116" width="108" height="24" rx="12" fill="#c2185b"/>' +
        '<rect x="16" y="52" width="88" height="56" rx="12" fill="#e7f4ff"/><path d="M22 58 l18 0 -16 22z" fill="#fff" opacity=".7"/>' +
        '<g class="sp-gondel-paar"><g class="sp-gp-links" transform="translate(20 62) scale(.68)">' + capyFrontInhalt({ typ: 4 }) + '</g>' +
        '<g class="sp-gp-rechts" transform="translate(62 62) scale(.68)">' + capyFrontInhalt({ typ: 0 }) + "</g></g>" +
        '<rect x="16" y="98" width="88" height="10" fill="#e85d7e"/><text x="60" y="133" text-anchor="middle" font-family="Dancing Script, cursive" font-weight="700" font-size="17" fill="#fff">Capy Lift ♥</text></svg>',
        "sp-gondel", { left: "0", top: "0", width: gb + "px" });
      const gh = gb * 1.25;
      const stelle = (x, rot) => ({ transform: "translate(" + (x - gb / 2).toFixed(1) + "px," + (seilY(x) - 4).toFixed(1) + "px) rotate(" + (rot || 0) + "deg)" });
      const mitte = W * 0.5;
      const bahn1 = [], bahn2 = [];
      for (let i = 0; i <= 12; i++) bahn1.push(stelle(-gb + (mitte + gb) * (i / 12), i < 12 ? Math.sin(i) * 1.5 : 0));
      for (let i = 0; i <= 12; i++) bahn2.push(stelle(mitte + (W + gb - mitte) * (i / 12), Math.sin(i) * 1.5));
      gondel.style.transformOrigin = gb / 2 + "px 0";
      gondel.animate(bahn1, { duration: 3400, delay: 800, easing: "ease-out", fill: "both" });
      // in der Mitte bleibt sie stehen und schaukelt
      spaeter(4200, () => {
        gondel.animate([0, 7, -6, 4, -2.5, 0].map((r) => stelle(mitte, r)), { duration: 2600, easing: "ease-in-out", fill: "forwards" });
        const l = gondel.querySelector(".sp-gp-links"), r = gondel.querySelector(".sp-gp-rechts");
        spaeter(900, () => {
          l.animate([{ transform: "translate(20px,62px) scale(.68)" }, { transform: "translate(24px,60px) scale(.68) rotate(10deg)" }], { duration: 600, fill: "forwards" });
          r.animate([{ transform: "translate(62px,62px) scale(.68)" }, { transform: "translate(58px,60px) scale(.68) rotate(-10deg)" }], { duration: 600, fill: "forwards" });
        });
        spaeter(1500, () => {
          const herz = figur('<svg viewBox="0 0 32 29"><path d="M16 28C10 23.6 2 17.6 2 10.2 2 5.7 5.4 2.4 9.5 2.4c2.7 0 5 1.4 6.5 3.7 1.5-2.3 3.8-3.7 6.5-3.7 4.1 0 7.5 3.3 7.5 7.8C30 17.6 22 23.6 16 28z" fill="#ff4d7d"/></svg>',
            "sp-gondelherz", { left: mitte - gb * 0.18 + "px", top: seilY(mitte) + gh * 0.3 + "px", width: gb * 0.36 + "px" });
          herz.animate([{ transform: "translateY(0) scale(.2)", opacity: 0 }, { transform: "translateY(-" + gh * 0.5 + "px) scale(1.1)", opacity: 1, offset: 0.45 }, { transform: "translateY(-" + gh * 0.9 + "px) scale(1)", opacity: 0 }],
            { duration: 2600, easing: "ease-out", fill: "forwards" });
          partikel(mitte, seilY(mitte) + gh * 0.35, ["♥", "✨"], 10, 80, ["#ff4d7d", "#f3c84b"]);
        });
        spaeter(2700, () => {
          const b = figur("<span>Hier oben ist es am schönsten mit dir 🥰</span>", "sp-blase", { left: mitte + "px", top: Math.max(8, seilY(mitte) - 54) + "px" });
          spaeter(2200, () => b.remove());
        });
      });
      spaeter(7300, () => gondel.animate(bahn2, { duration: 3800, easing: "ease-in", fill: "forwards" }));
      // leichter Schneefall
      for (let k = 0; k < 18; k++) {
        const s = figur("", "sp-flocke", { left: zufall(0, W) + "px", top: "-10px", width: zufall(4, 8) + "px", height: "0" });
        s.style.height = s.style.width;
        s.animate([{ transform: "translate(0,0)" }, { transform: "translate(" + zufall(-30, 30) + "px," + (H + 20) + "px)" }], { duration: zufall(6000, 10000), delay: zufall(0, 6000), easing: "linear", fill: "both" });
      }
    } },

    13: { titel: "Ab in die Capy Fotobox 📸", dauer: 21000, spiel() {
      const bb = Math.min(W * 0.5, 290), bh = bb * 1.45, bx = W / 2 - bb / 2, by = H - bh - H * 0.04;
      fotoraum(bb, by + bh);
      const box = figur('<svg viewBox="0 0 200 290">' +
        '<rect x="10" y="40" width="180" height="250" rx="14" fill="#f2a7ba"/><rect x="10" y="40" width="180" height="250" rx="14" fill="none" stroke="#c2185b" stroke-width="4"/>' +
        '<rect x="0" y="0" width="200" height="46" rx="12" fill="#9d2449"/>' +
        '<text x="100" y="31" text-anchor="middle" font-family="Dancing Script, cursive" font-weight="700" font-size="26" fill="#fff">Fotobox ♥</text>' +
        [16, 40, 64, 88, 112, 136, 160, 184].map((x, i) => '<circle class="sp-lampe" style="animation-delay:' + (-i * 0.15) + 's" cx="' + x + '" cy="40" r="4" fill="#ffd36b"/>').join("") +
        '<rect x="30" y="64" width="140" height="210" rx="8" fill="#3a1f2e"/>' +
        '<rect x="176" y="150" width="20" height="8" rx="3" fill="#6b1532"/>' +
        "</svg>" +
        '<div class="sp-box-innen"></div><div class="sp-box-vorhang"></div>', "sp-fotobox", { left: bx + "px", top: by + "px", width: bb + "px", height: bh + "px" });
      box.animate([{ transform: "translateY(30px) scale(.9)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 800, easing: "cubic-bezier(.3,1.4,.5,1)", fill: "forwards" });
      const vorhang = box.querySelector(".sp-box-vorhang");
      vorhang.style.transform = "scaleY(.35)";
      // vier Capys laufen nacheinander hinein
      const gr = Math.min(W * 0.22, 130);
      const gaeste = [0, 1, 2, 3].map((i) => figur(capySeite({ typ: [5, 1, 9, 6][i] }), "sp-gespiegelt", { width: gr + "px", top: by + bh - gr * 0.8 + "px", left: W + "px" }));
      gaeste.forEach((g, i) => {
        g.animate([{ left: W + 20 + "px", opacity: 1 }, { left: bx + bb * 0.32 + "px", opacity: 1, offset: 0.85 }, { left: bx + bb * 0.3 + "px", opacity: 0, transform: "scale(.7)" }],
          { duration: 1500, delay: 900 + i * 450, easing: "ease-in", fill: "both" });
        g.firstChild.animate([{ translate: "0 0" }, { translate: "0 -6px" }], { duration: 220, direction: "alternate", iterations: 7, delay: 900 + i * 450 });
      });
      spaeter(3500, () => {
        vorhang.animate([{ transform: "scaleY(.35)" }, { transform: "scaleY(1)" }], { duration: 600, easing: "ease-in-out", fill: "forwards" });
        box.animate([{ transform: "rotate(0)" }, { transform: "rotate(-1.5deg)" }, { transform: "rotate(1.5deg)" }, { transform: "rotate(0)" }], { duration: 500, delay: 500, iterations: 2 });
      });
      // dreimal Blitz
      const blitz = figur("", "sp-blitz");
      [4400, 5300, 6200].forEach((t, i) => spaeter(t, () => {
        blitz.animate([{ opacity: 0 }, { opacity: 0.92, offset: 0.12 }, { opacity: 0 }], { duration: 520, easing: "ease-out" });
        box.animate([{ transform: "scale(1)" }, { transform: "scale(1.03)" }, { transform: "scale(1)" }], { duration: 300 });
        const b = figur("<span>" + ["Grimasse! 😝", "Cool bleiben 😎", "Küsschen! 😘"][i] + "</span>", "sp-blase", { left: W / 2 + "px", top: Math.max(6, by - 46) + "px" });
        spaeter(800, () => b.remove());
      }));
      // der Fotostreifen kommt heraus und flattert zu Boden
      const sb = Math.min(W * 0.24, 132);
      const bild = (inhalt) => '<div class="sp-streifen-bild"><svg viewBox="0 0 112 70">' + inhalt + "</svg></div>";
      const kopf = (x, y, s, o, rot) => '<g transform="translate(' + x + " " + y + ") rotate(" + (rot || 0) + ' 28 20) scale(' + s + ')">' + capyFrontInhalt(o) + "</g>";
      const brille = (x, y) => '<g transform="translate(' + x + " " + y + ')"><rect x="-1" y="0" width="13" height="7" rx="3" fill="#1d1d24"/><rect x="15" y="0" width="13" height="7" rx="3" fill="#1d1d24"/><path d="M12 3h3" stroke="#1d1d24" stroke-width="2"/></g>';
      const streifen = figur('<div class="sp-streifen-kopf">♥ 13.11. ♥</div>' +
        bild('<rect width="112" height="70" fill="#fde3ea"/>' + kopf(2, 14, 0.5, { typ: 5, mund: "offen" }, -14) + kopf(30, 10, 0.5, { typ: 1, mund: "offen" }, 10) + kopf(58, 14, 0.5, { typ: 9, mund: "offen" }, -8) + kopf(84, 12, 0.48, { typ: 6, mund: "offen" }, 14)) +
        bild('<rect width="112" height="70" fill="#e7f4ff"/>' + [[2, 16, 5], [30, 14, 1], [58, 16, 9], [84, 15, 6]].map(([x, y, t]) => kopf(x, y, 0.5, { typ: t }) + brille(x + 9.5, y + 12.5)).join("")) +
        bild('<rect width="112" height="70" fill="#fff4f6"/>' + kopf(18, 14, 0.62, { typ: 5 }, 12) + kopf(56, 14, 0.62, { typ: 1 }, -12) +
          '<path d="M56 8c-2-3.4-7.4-2.6-7.4 1.2 0 3.2 7.4 6.8 7.4 6.8s7.4-3.6 7.4-6.8c0-3.8-5.4-4.6-7.4-1.2z" fill="#ff4d7d"/>'),
        "sp-fotostreifen", { left: bx + bb * 0.88 + "px", top: by + bh * 0.52 + "px", width: sb + "px" });
      streifen.style.clipPath = "inset(0 0 100% 0)";
      spaeter(7000, () => {
        streifen.animate([{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)" }], { duration: 1400, easing: "linear", fill: "forwards" });
        streifen.animate([{ transform: "translateY(-100%)" }, { transform: "translateY(0)" }], { duration: 1400, easing: "linear", fill: "forwards" });
      });
      spaeter(8500, () => {
        const ziel = Math.min(W - sb - 10, bx + bb + 14), boden = H - streifen.offsetHeight * 0.95;
        const sy = by + bh * 0.52;
        streifen.animate([
          { transform: "translate(0,0) rotate(0)" },
          { transform: "translate(" + (ziel - (bx + bb * 0.88)) * 0.4 + "px," + (boden - sy) * 0.3 + "px) rotate(18deg)" },
          { transform: "translate(" + (ziel - (bx + bb * 0.88)) * 0.7 + "px," + (boden - sy) * 0.65 + "px) rotate(-12deg)" },
          { transform: "translate(" + (ziel - (bx + bb * 0.88)) + "px," + (boden - sy) + "px) rotate(8deg)" },
        ], { duration: 2100, easing: "ease-in-out", fill: "forwards" });
      });
      // Vorhang auf, alle hüpfen glücklich heraus
      spaeter(8800, () => {
        vorhang.animate([{ transform: "scaleY(1)" }, { transform: "scaleY(.35)" }], { duration: 600, fill: "forwards" });
        gaeste.forEach((g, i) => {
          g.classList.remove("sp-gespiegelt");
          g.animate([{ left: bx + bb * 0.3 + "px", opacity: 0, transform: "scale(.7)" }, { left: bx + bb * 0.1 - i * gr * 0.55 + "px", opacity: 1, transform: "scale(1) translateY(-24px)", offset: 0.5 }, { left: bx - gr * 0.4 - i * gr * 0.55 + "px", opacity: 1, transform: "scale(1)" }],
            { duration: 1200, delay: 400 + i * 200, easing: "ease-out", fill: "forwards" });
        });
        spaeter(1400, () => partikel(bx + bb * 0.2, by + bh * 0.7, ["♥", "✨", "📸"], 14, 110, ["#e85d7e", "#f3c84b"]));
      });

      // Zweiter Akt: das Pärchen geht nochmal allein hinein
      spaeter(11800, () => {
        sagBlase("Jetzt nur wir zwei 🥰", { left: W / 2 + "px", top: Math.max(6, by - 46) + "px" }, 1700);
        [gaeste[0], gaeste[1]].forEach((g, i) => {
          g.classList.add("sp-gespiegelt");
          g.animate([{ left: bx - gr * 0.4 - i * gr * 0.55 + "px", opacity: 1, transform: "scale(1)" }, { left: bx + bb * 0.3 + "px", opacity: 0, transform: "scale(.7)" }],
            { duration: 1100, delay: i * 250, easing: "ease-in", fill: "forwards" });
        });
        [gaeste[2], gaeste[3]].forEach((g, i) => g.firstChild.animate([{ translate: "0 0" }, { translate: "0 -10px" }], { duration: 300, direction: "alternate", iterations: 14, delay: i * 150 }));
      });
      spaeter(13300, () => vorhang.animate([{ transform: "scaleY(.35)" }, { transform: "scaleY(1)" }], { duration: 600, easing: "ease-in-out", fill: "forwards" }));
      spaeter(14400, () => {
        blitz.style.background = "#ffd0dc";
        blitz.animate([{ opacity: 0 }, { opacity: 0.9, offset: 0.12 }, { opacity: 0 }], { duration: 700, easing: "ease-out" });
        partikel(W / 2, by + bh * 0.45, ["♥"], 14, 120, ["#ff4d7d", "#ff8fab"]);
      });
      // ein großes Sofortbild kommt heraus und schwebt nach oben
      const pb = Math.min(W * 0.42, 190);
      const foto = figur('<div class="sp-sofortbild-bild"><svg viewBox="0 0 112 92"><rect width="112" height="92" fill="#ffe3ec"/>' +
        '<path d="M56 18c-3-5-11-4-11 2 0 5 11 11 11 11s11-6 11-11c0-6-8-7-11-2z" fill="#ff4d7d"/>' +
        kopf(14, 30, 0.78, { typ: 5 }, 14) + kopf(54, 30, 0.78, { typ: 1 }, -14) + "</svg></div><p>Wir ♥</p>",
        "sp-sofortbild", { left: W / 2 - pb / 2 + "px", top: by + bh * 0.5 + "px", width: pb + "px", opacity: "0" });
      spaeter(15200, () => {
        foto.animate([
          { opacity: 0, transform: "translateY(0) scale(.3) rotate(0)" },
          { opacity: 1, transform: "translateY(-" + bh * 0.55 + "px) scale(1) rotate(-6deg)", offset: 0.6 },
          { opacity: 1, transform: "translateY(-" + bh * 0.62 + "px) scale(1.04) rotate(3deg)" },
        ], { duration: 2000, easing: "cubic-bezier(.3,1.2,.5,1)", fill: "forwards" });
        foto.querySelector("svg").animate([{ filter: "sepia(.9) brightness(.5)" }, { filter: "none" }], { duration: 2600, delay: 600, fill: "both" });
      });
      spaeter(17300, () => {
        vorhang.animate([{ transform: "scaleY(1)" }, { transform: "scaleY(.35)" }], { duration: 600, fill: "forwards" });
        [gaeste[0], gaeste[1]].forEach((g, i) => {
          g.classList.remove("sp-gespiegelt");
          g.animate([{ left: bx + bb * 0.3 + "px", opacity: 0, transform: "scale(.7)" }, { left: bx + bb * 0.62 + i * gr * 0.5 + "px", opacity: 1, transform: "scale(1) translateY(-20px)", offset: 0.5 }, { left: bx + bb * 0.75 + i * gr * 0.5 + "px", opacity: 1, transform: "scale(1)" }],
            { duration: 1100, delay: 300 + i * 200, easing: "ease-out", fill: "forwards" });
        });
      });
      spaeter(18800, () => { regen(["♥", "✨", "♥"], 26, ["#ff4d7d", "#f3c84b", "#ff8fab"], 2400); });
    } },

    14: { titel: "Nächster Halt: Capyhausen 🚂", dauer: 21000, spiel() {
      const gy = H * 0.8;
      const land = figur('<svg viewBox="0 0 400 100" preserveAspectRatio="none"><path d="M0 30 Q100 0 200 22 T400 14 V100 H0z" fill="#d7ecd0"/><path d="M0 52 Q120 34 220 50 T400 44 V100 H0z" fill="#b9dfb0"/></svg>',
        "sp-land", { top: gy - H * 0.22 + "px", height: H * 0.22 + 4 + "px" });
      land.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, fill: "forwards" });
      const gleis = figur('<div class="sp-gleis-schwellen"></div><div class="sp-gleis-schiene"></div><div class="sp-gleis-schiene unten"></div>', "sp-gleis", { top: gy + "px" });
      gleis.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, fill: "forwards" });
      // Bahnhofsschild
      const schild = figur('<svg viewBox="0 0 150 120"><rect x="70" y="40" width="10" height="80" fill="#6b4a3a"/><rect x="5" y="6" width="140" height="40" rx="8" fill="#fff8e6" stroke="#9d2449" stroke-width="4"/>' +
        '<text x="75" y="33" text-anchor="middle" font-family="Dancing Script, cursive" font-weight="700" font-size="24" fill="#9d2449">Capyhausen</text></svg>',
        "sp-schild", { left: W - Math.min(W * 0.34, 150) - W * 0.04 + "px", top: gy - Math.min(W * 0.34, 150) * 0.8 - (W < 700 ? Math.max(56, Math.min(165, (W * 0.92) / 5.55)) * 0.9 - Math.min(W * 0.34, 150) * 0.18 : 0) + "px", width: Math.min(W * 0.34, 150) + "px" });
      schild.animate([{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], { duration: 700, delay: 300, easing: "cubic-bezier(.3,1.4,.5,1)", fill: "both" });
      // Der Zug: Lok, drei Waggons und ein Herzwaggon
      // der ganze Zug passt beim Halt ins Bild
      const wb = Math.max(56, Math.min(165, (W * 0.92) / 5.55));
      const rad = (x) => '<g class="sp-rad" style="transform-origin:' + x + 'px 92px"><circle cx="' + x + '" cy="92" r="11" fill="#3a2a33"/><circle cx="' + x + '" cy="92" r="5" fill="#f3c84b"/><path d="M' + x + ' 81v22M' + (x - 11) + ' 92h22" stroke="#f3c84b" stroke-width="2"/></g>';
      const lok = '<svg viewBox="0 0 130 105">' +
        '<rect x="26" y="8" width="16" height="30" rx="3" fill="#3a2a33"/><rect x="22" y="4" width="24" height="9" rx="3" fill="#3a2a33"/>' +
        '<rect x="14" y="36" width="78" height="46" rx="14" fill="#d6304f"/><rect x="72" y="18" width="50" height="64" rx="8" fill="#9d2449"/>' +
        '<rect x="82" y="28" width="30" height="22" rx="4" fill="#e7f4ff"/><g transform="translate(84 25) scale(.48)">' + capyFrontInhalt({ typ: 2, mund: "offen" }) + '</g>' +
        '<path d="M2 82 L14 64 L14 82z" fill="#3a2a33"/><circle cx="18" cy="52" r="6" fill="#ffd36b"/><rect x="10" y="80" width="114" height="8" rx="3" fill="#3a2a33"/>' +
        rad(34) + rad(66) + rad(102) + "</svg>";
      const waggon = (t, farbe) => '<svg viewBox="0 0 120 105"><rect x="6" y="30" width="108" height="54" rx="10" fill="' + farbe + '"/><rect x="6" y="26" width="108" height="10" rx="5" fill="#fff" opacity=".5"/>' +
        '<rect x="22" y="38" width="76" height="34" rx="8" fill="#e7f4ff"/><g class="sp-winker" transform="translate(37 32) scale(.82)">' + capyFrontInhalt({ typ: t }) + '</g>' +
        '<path class="sp-pfote" d="M90 50 q6 -14 2 -20" stroke="#b07a52" stroke-width="7" stroke-linecap="round" fill="none"/>' +
        '<rect x="0" y="80" width="120" height="8" rx="3" fill="#3a2a33"/>' + rad(28) + rad(92) + "</svg>";
      const herzWaggon = '<svg viewBox="0 0 120 105"><path d="M60 88C40 76 8 58 8 34 8 20 19 10 32 10c11 0 20 6 28 16 8-10 17-16 28-16 13 0 24 10 24 24 0 24-32 42-52 54z" fill="#ff4d7d"/>' +
        '<path d="M60 88C40 76 8 58 8 34" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/>' +
        '<g transform="translate(24 26) scale(.62) rotate(10 28 20)">' + capyFrontInhalt({ typ: 5 }) + '</g><g transform="translate(62 26) scale(.62) rotate(-10 28 20)">' + capyFrontInhalt({ typ: 1 }) + "</g>" +
        '<rect x="0" y="82" width="120" height="8" rx="3" fill="#3a2a33"/>' + rad(30) + rad(90) + "</svg>";
      const teile = [lok, waggon(0, "#7cc4f0"), waggon(3, "#9be3b0"), waggon(9, "#f3c84b"), herzWaggon];
      const zug = figur(teile.map((t, i) => '<div class="sp-wagen" style="width:' + (i === 0 ? wb * 1.08 : wb) + 'px">' + t + "</div>").join('<div class="sp-kupplung" style="margin-bottom:' + (wb * 0.13).toFixed(1) + 'px"></div>'), "sp-zug",
        { top: gy - wb * 0.86 + "px", left: "0" });
      const zl = zug.scrollWidth || wb * 5.6;
      const halt = zl < W ? (W - zl) / 2 : W * 0.03;
      // passt das Schild nicht neben den haltenden Zug, steht es dahinter etwas höher
      const sw = schild.offsetWidth;
      if (halt + zl + 10 > W - sw - W * 0.04) schild.style.top = gy - sw * 0.8 - wb * 0.9 + sw * 0.18 + "px";
      else schild.style.top = gy - sw * 0.8 + "px";
      zug.animate([{ transform: "translateX(" + W + "px)" }, { transform: "translateX(" + halt + "px)" }], { duration: 3600, delay: 600, easing: "cubic-bezier(.2,.6,.35,1)", fill: "both" });
      const raeder = [...zug.querySelectorAll(".sp-rad")];
      const drehen = (dauer, verz) => raeder.forEach((r) => r.animate([{ transform: "rotate(0)" }, { transform: "rotate(-720deg)" }], { duration: dauer, delay: verz || 0, easing: "linear" }));
      drehen(3600, 600);
      // winken im Waggon
      zug.querySelectorAll(".sp-pfote").forEach((p, i) => p.animate([{ transform: "rotate(0)" }, { transform: "rotate(-25deg)" }], { duration: 300, direction: "alternate", iterations: 24, delay: i * 120, easing: "ease-in-out" }));
      zug.querySelectorAll(".sp-pfote").forEach((p) => { p.style.transformBox = "fill-box"; p.style.transformOrigin = "50% 100%"; });
      // Herzwolken aus dem Schornstein
      const dampfHerz = () => {
        const r = zug.querySelector(".sp-wagen").getBoundingClientRect(), b = buehne.getBoundingClientRect();
        const x = r.left - b.left + r.width * 0.26, y = r.top - b.top + r.height * 0.02;
        if (x < -20 || x > W + 20) return;
        const s = document.createElement("span");
        s.className = "sp-dampfherz";
        s.textContent = Math.random() < 0.6 ? "♥" : "●";
        s.style.left = x + "px"; s.style.top = y + "px";
        s.style.fontSize = zufall(14, 24) + "px";
        buehne.appendChild(s);
        s.animate([{ transform: "translate(-50%,0) scale(.4)", opacity: 0.95 }, { transform: "translate(calc(-50% + " + zufall(10, 40) + "px),-" + zufall(50, 90) + "px) scale(1.4)", opacity: 0 }],
          { duration: 1500, easing: "ease-out", fill: "forwards" }).finished.then(() => s.remove(), () => s.remove());
      };
      for (let t = 700; t < 11800; t += 260) spaeter(t, dampfHerz);
      // Halt am Bahnhof
      spaeter(4300, () => {
        const b = figur("<span>Tuut tuut! Alle einsteigen ♥</span>", "sp-blase", { left: W / 2 + "px", top: Math.max(6, gy - wb * 1.65 - 30) + "px" });
        spaeter(1700, () => b.remove());
        zug.querySelectorAll(".sp-winker").forEach((w, i) => w.animate([{ translate: "0 0" }, { translate: "0 -6px" }], { duration: 220, direction: "alternate", iterations: 6, delay: i * 90 }));
        const hz = zug.lastElementChild.getBoundingClientRect(), bb = buehne.getBoundingClientRect();
        partikel(hz.left - bb.left + hz.width / 2, hz.top - bb.top + hz.height * 0.2, ["♥"], 10, 70, ["#ff4d7d", "#ff8fab"]);
      });
      // weiter geht die Fahrt
      spaeter(6200, () => {
        zug.animate([{ transform: "translateX(" + halt + "px)" }, { transform: "translateX(" + -(zl + 40) + "px)" }], { duration: 5200, easing: "cubic-bezier(.5,0,.8,.6)", fill: "forwards" });
        drehen(5200);
      });

      // Signal am Bahnsteig springt kurz vor der Abfahrt auf Grün
      const sig = figur('<svg viewBox="0 0 24 70"><rect x="10" y="22" width="4" height="48" fill="#4a3542"/><rect x="2" y="0" width="20" height="28" rx="5" fill="#2a1f2e"/>' +
        '<circle class="sp-sig-rot" cx="12" cy="8" r="5" fill="#ff4d4d"/><circle class="sp-sig-gruen" cx="12" cy="20" r="5" fill="#2e5a3a"/></svg>', "sp-signal",
        { left: Math.max(4, schild.offsetLeft - 30) + "px", top: gy - 70 + "px", width: "22px" });
      sig.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 400, fill: "both" });
      spaeter(5700, () => { sig.querySelector(".sp-sig-rot").setAttribute("fill", "#5a1f1f"); sig.querySelector(".sp-sig-gruen").setAttribute("fill", "#4dff7a"); });
      // Zweiter Akt: eine Draisine mit zwei Capys und einem Banner
      const db = Math.max(120, Math.min(W * 0.5, 230));
      const draisine = figur('<svg viewBox="0 0 200 120">' +
        '<rect x="20" y="78" width="160" height="12" rx="4" fill="#a96f47"/><rect x="20" y="88" width="160" height="5" fill="#6b4a3a"/>' +
        '<rect x="96" y="40" width="8" height="40" fill="#6b4a3a"/>' +
        '<g class="sp-hebel" style="transform-origin:100px 42px"><rect x="40" y="38" width="120" height="7" rx="3" fill="#3a2a33"/><circle cx="44" cy="41" r="5" fill="#9d2449"/><circle cx="156" cy="41" r="5" fill="#9d2449"/></g>' +
        '<g transform="translate(18 34) scale(.72)">' + capyFrontInhalt({ typ: 5 }) + '</g><g transform="translate(140 34) scale(.72)">' + capyFrontInhalt({ typ: 1 }) + "</g>" +
        rad(48) + rad(152) +
        '<path d="M178 80 V20" stroke="#6b4a3a" stroke-width="3"/><path d="M178 22 h-2 q-30 6 -60 0 v20 q30 6 60 0z" fill="#fff8e6" stroke="#e85d7e" stroke-width="2" transform="translate(0 -4)"/>' +
        '<text x="148" y="35" text-anchor="middle" font-family="Dancing Script, cursive" font-weight="700" font-size="13" fill="#9d2449">Gute Reise ♥</text></svg>',
        "sp-draisine", { top: gy + 2 - db * (103 / 200) + "px", left: "0", width: db + "px", transform: "translateX(" + -db * 1.3 + "px)" });
      const dhalt = W / 2 - db / 2;
      spaeter(11800, () => {
        draisine.animate([{ transform: "translateX(" + -db * 1.1 + "px)" }, { transform: "translateX(" + dhalt + "px)" }], { duration: 2600, easing: "ease-out", fill: "forwards" });
        draisine.querySelector(".sp-hebel").animate([{ transform: "rotate(-14deg)" }, { transform: "rotate(14deg)" }], { duration: 380, direction: "alternate", iterations: 20, easing: "ease-in-out" });
        draisine.querySelectorAll(".sp-rad").forEach((r) => r.animate([{ transform: "rotate(0)" }, { transform: "rotate(-540deg)" }], { duration: 2600, easing: "ease-out" }));
      });
      spaeter(14600, () => {
        sagBlase("Wir fahren mit dir, wohin du willst 🥰", { left: W / 2 + "px", top: Math.max(6, gy - db * 0.55 - 50) + "px" }, 2200);
        partikel(W / 2, gy - db * 0.4, ["♥", "✨"], 12, 90, ["#ff4d7d", "#f3c84b"]);
      });
      spaeter(17200, () => {
        draisine.animate([{ transform: "translateX(" + dhalt + "px)" }, { transform: "translateX(" + (W + 20) + "px)" }], { duration: 3200, easing: "ease-in", fill: "forwards" });
        draisine.querySelector(".sp-hebel").animate([{ transform: "rotate(-14deg)" }, { transform: "rotate(14deg)" }], { duration: 300, direction: "alternate", iterations: 12 });
        draisine.querySelectorAll(".sp-rad").forEach((r) => r.animate([{ transform: "rotate(0)" }, { transform: "rotate(-720deg)" }], { duration: 3200, easing: "ease-in" }));
      });
    } },

    15: { titel: "Die Capy Crew geht auf Ballonfahrt 🎈", dauer: 21000, spiel() {
      const farben = ["#e85d7e", "#f3c84b", "#7cc4f0", "#9be3b0", "#b39ddb", "#fda4b8", "#ff8a65"];
      const capyIn = (n, x, y, s) => '<g transform="translate(' + x + " " + y + ") scale(" + (s || 1) + ')">' + capyFrontInhalt({ typ: n }) + "</g>";
      // 1. Luftballon-Strauß: die Schnüre enden in den Pfoten über dem Kopf
      const strauss = (n) => {
        const pfote = '<ellipse cx="54" cy="142" rx="4.5" ry="5.5" fill="' + typ(n).fell + '"/><ellipse cx="66" cy="142" rx="4.5" ry="5.5" fill="' + typ(n).fell + '"/>';
        const ballons = [[38, 44, 0], [62, 30, 1], [86, 48, 2], [52, 70, 3], [76, 74, 4]].map(([x, y, k]) =>
          '<path d="M' + x + " " + (y + 20) + " Q" + (x + 60) / 2 + " " + (y + 70) + " 60 140" + '" stroke="#9d8a90" stroke-width="1.2" fill="none"/>' +
          '<ellipse cx="' + x + '" cy="' + y + '" rx="15" ry="19" fill="' + farben[(n + k) % farben.length] + '"/><ellipse cx="' + (x - 5) + '" cy="' + (y - 7) + '" rx="4" ry="6" fill="#fff" opacity=".4"/>' +
          '<path d="M' + (x - 3) + " " + (y + 18) + "h6l-3 4z" + '" fill="' + farben[(n + k) % farben.length] + '"/>').join("");
        return '<svg viewBox="0 0 120 200" aria-hidden="true">' + ballons + capyIn(n, 32, 146) + pfote + "</svg>";
      };
      // 2. Heißluftballon: Capy sitzt im Korb
      const heissluft = (n) => {
        const f1 = farben[n % farben.length], f2 = farben[(n + 3) % farben.length];
        return '<svg viewBox="0 0 120 220" aria-hidden="true">' +
          '<path d="M60 8C20 8 8 40 14 70c6 28 26 46 30 60h32c4-14 24-32 30-60C112 40 100 8 60 8z" fill="' + f1 + '"/>' +
          '<path d="M60 8C44 8 36 40 40 70c3 28 10 46 12 60h16c2-14 9-32 12-60C84 40 76 8 60 8z" fill="' + f2 + '"/>' +
          '<path d="M60 8C55 8 52 40 54 70c1 28 3 46 4 60h4c1-14 3-32 4-60C68 40 65 8 60 8z" fill="#fff" opacity=".7"/>' +
          '<path d="M20 50h80M16 80h88" stroke="#fff" stroke-width="2" opacity=".5"/>' +
          '<rect x="44" y="128" width="32" height="6" rx="2" fill="#8a5a3a"/>' +
          '<path class="sp-brenner" d="M60 136c4 5 4 9 0 11c-4-2-4-6 0-11z" fill="#ffb648"/>' +
          '<path d="M46 134 L40 176 M74 134 L80 176" stroke="#6b4a3a" stroke-width="1.5"/>' +
          capyIn(n, 32, 150) +
          '<rect x="36" y="176" width="48" height="30" rx="4" fill="#b5763e"/><path d="M36 184h48M36 192h48M36 200h48" stroke="#8a5a3a" stroke-width="1.4"/><rect x="34" y="173" width="52" height="6" rx="3" fill="#8a5a3a"/>' +
          "</svg>";
      };
      // 3. Luftschiff mit Gondel und Banner
      const luftschiff = (n) =>
        '<svg viewBox="0 0 200 150" aria-hidden="true">' +
        '<path d="M14 40l-12-18v40z" fill="#c2185b"/><path d="M18 46l-14 14 18-2z" fill="#c2185b"/>' +
        '<ellipse cx="100" cy="44" rx="86" ry="32" fill="#fda4b8"/><ellipse cx="100" cy="44" rx="86" ry="10" fill="#fff" opacity=".35"/><ellipse cx="80" cy="30" rx="30" ry="7" fill="#fff" opacity=".4"/>' +
        '<text x="104" y="52" text-anchor="middle" font-family="Dancing Script, cursive" font-weight="700" font-size="22" fill="#9d2449">Capy Air ♥</text>' +
        '<path d="M80 74 L82 96 M120 74 L118 96" stroke="#6b4a3a" stroke-width="1.5"/>' +
        capyIn(n, 75, 80, 0.9) +
        '<rect x="70" y="108" width="60" height="24" rx="8" fill="#9d2449"/><circle cx="88" cy="120" r="4" fill="#ffd36b"/><circle cx="112" cy="120" r="4" fill="#ffd36b"/>' +
        '<g class="sp-propeller"><ellipse cx="190" cy="44" rx="3" ry="14" fill="#6b4a3a"/></g>' +
        "</svg>";
      const flieger = [
        { art: strauss, gr: 92 }, { art: heissluft, gr: 112 }, { art: strauss, gr: 86 },
        { art: heissluft, gr: 100 }, { art: strauss, gr: 96 }, { art: heissluft, gr: 106 },
      ];
      flieger.forEach((fl, i) => {
        const gr = Math.min(fl.gr * 1.25, W * 0.36);
        const f = figur(fl.art(i), "sp-ballonfahrer", { left: (i / flieger.length) * 88 + 2 + "%", bottom: "-280px", width: gr + "px" });
        f.animate([{ transform: "translateY(0)" }, { transform: "translateY(-" + (H + 560) + "px)" }],
          { duration: zufall(8500, 11000), delay: i * 520, easing: "ease-in-out", fill: "both" });
        f.firstChild.animate([{ transform: "rotate(-5deg)" }, { transform: "rotate(5deg)" }], { duration: zufall(1500, 2200), direction: "alternate", iterations: Infinity, easing: "ease-in-out" });
      });
      // das Luftschiff zieht quer über den Himmel
      const sb = Math.min(W * 0.55, 240);
      const schiff = figur(luftschiff(7), "sp-luftschiff", { left: "0", top: "22%", width: sb + "px" });
      schiff.animate([{ transform: "translate(" + -sb + "px, 40px)" }, { transform: "translate(" + (W + 20) + "px, -60px)" }], { duration: 11000, delay: 900, easing: "linear", fill: "both" });

      // ziehende Wolken
      for (let k = 0; k < 4; k++) {
        const w = figur('<svg viewBox="0 0 120 50"><path d="M18 46h86a16 16 0 0 0 0-32 22 22 0 0 0-40-8 18 18 0 0 0-30 8 16 16 0 0 0-16 32z" fill="#fff"/></svg>', "sp-wolke-fahrt",
          { top: H * (0.08 + k * 0.14) + "px", width: zufall(90, 160) + "px", opacity: "0.8" });
        w.animate([{ transform: "translateX(" + (k % 2 ? W : -170) + "px)" }, { transform: "translateX(" + (k % 2 ? -170 : W) + "px)" }], { duration: zufall(16000, 22000), delay: -k * 4500, fill: "both" });
      }
      // Zweiter Akt: ein großer Herzballon mit dem Pärchen
      const hb = Math.min(W * 0.5, 230);
      const herz = figur('<svg viewBox="0 0 140 210">' +
        '<path d="M70 120C45 104 6 80 6 46 6 24 22 8 42 8c12 0 22 6 28 16 6-10 16-16 28-16 20 0 36 16 36 38 0 34-39 58-64 74z" fill="#ff4d7d"/>' +
        '<path d="M42 16c-14 2-24 14-24 30" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".45"/>' +
        '<path d="M70 26 V118" stroke="#d6244f" stroke-width="2" opacity=".5"/>' +
        '<path d="M52 120 L46 150 M88 120 L94 150" stroke="#6b4a3a" stroke-width="1.6"/>' +
        '<g transform="translate(34 126) scale(.62)">' + capyFrontInhalt({ typ: 5 }) + '</g><g transform="translate(70 126) scale(.62)">' + capyFrontInhalt({ typ: 1 }) + "</g>" +
        '<rect x="38" y="150" width="64" height="34" rx="6" fill="#b5763e"/><path d="M38 160h64M38 170h64" stroke="#8a5a3a" stroke-width="1.4"/><rect x="36" y="147" width="68" height="7" rx="3" fill="#8a5a3a"/>' +
        '<text x="70" y="64" text-anchor="middle" font-family="Dancing Script, cursive" font-weight="700" font-size="20" fill="#fff">Toni</text></svg>',
        "sp-herzballon", { left: W / 2 - hb / 2 + "px", top: H + "px", width: hb + "px", visibility: "hidden" });
      const hh = hb * 1.5;
      spaeter(11200, () => herz.style.visibility = "visible");
      spaeter(11200, () => herz.animate([{ transform: "translateY(0)" }, { transform: "translateY(-" + (H * 0.72 + hh * 0.2) + "px)" }], { duration: 3600, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" }));
      spaeter(14800, () => {
        herz.firstChild.animate([{ transform: "rotate(-4deg)" }, { transform: "rotate(4deg)" }], { duration: 1200, direction: "alternate", iterations: 4, easing: "ease-in-out" });
        const l = lage(herz);
        for (let k = 0; k < 5; k++) spaeter(k * 550, () => partikel(l.x + l.w / 2, l.y + l.h * 0.78, ["🌸", "♥", "✿"], 7, 110, ["#ff8fab", "#ff4d7d", "#fff"]));
        sagBlase("Ganz hoch hinaus, nur mit dir ♥", { left: W / 2 + "px", top: Math.max(6, l.y - 44) + "px" }, 2200);
      });
      spaeter(18200, () => herz.animate([{ transform: "translateY(-" + (H * 0.72 + hh * 0.2) + "px)" }, { transform: "translateY(-" + (H + hh * 1.4) + "px)" }], { duration: 2600, easing: "ease-in", fill: "forwards" }));
    } },

    16: { titel: "Geheime Gartenparty der Capy Crew 🎉", dauer: 21000, spiel() {
      const garten = figur(
        '<svg viewBox="0 0 400 120" preserveAspectRatio="none"><path d="M0 40 Q100 10 200 30 T400 25 V120 H0z" fill="#8fd18a"/><path d="M0 60 Q120 40 220 58 T400 50 V120 H0z" fill="#6fbf6b"/></svg>' +
        '<div class="sp-blumen">' + Array.from("🌷🌼🌸🌷🌼🌸🌷").map((b) => "<span>" + b + "</span>").join("") + "</div>",
        "sp-garten");
      garten.animate([{ transform: "translateY(100%)" }, { transform: "translateY(0)" }], { duration: 1200, easing: "cubic-bezier(.2,.9,.3,1.1)", fill: "forwards" });
      const kette = figur('<svg viewBox="0 0 400 60" preserveAspectRatio="none"><path d="M0 8 Q100 50 200 12 T400 10" stroke="#6b4a3a" stroke-width="1.5" fill="none"/>' +
        [40, 95, 150, 250, 305, 360].map((x, i) => '<rect x="' + (x - 7) + '" y="' + (i % 2 ? 26 : 30) + '" width="14" height="18" rx="6" fill="' + ["#f3c84b", "#e85d7e", "#7cc4f0"][i % 3] + '"/>').join("") + "</svg>", "sp-lampions");
      kette.animate([{ transform: "translateY(-120%)" }, { transform: "translateY(0)" }], { duration: 1000, delay: 500, easing: "ease-out", fill: "forwards" });
      const kugel = figur('<div class="sp-disco"></div>', "sp-discohalter");
      kugel.animate([{ transform: "translate(-50%, -140%)" }, { transform: "translate(-50%, 0)" }], { duration: 1200, delay: 900, easing: "cubic-bezier(.3,1.4,.5,1)", fill: "forwards" });
      const hutfarben = ["#f3dc9f", "#fda4b8", "#9be3b0", "#7cc4f0", "#f3c84b"];
      for (let i = 0; i < 5; i++) {
        const f = figur(capySeite({ hut: "party", hutFarbe: hutfarben[i] }), "sp-taenzer",
          { left: 6 + i * 18 + "%", bottom: (10 + (i % 2) * 6) + "%", width: "min(22vw, 110px)", transform: i % 2 ? "scaleX(-1)" : "" });
        spaeter(1300 + i * 120, () => f.firstChild.animate(
          [{ transform: "translateY(0) rotate(0)" }, { transform: "translateY(-22px) rotate(" + (i % 2 ? 8 : -8) + "deg)" }, { transform: "translateY(0) rotate(0)" }],
          { duration: 520, iterations: 34, easing: "ease-in-out" }));
      }
      for (let k = 0; k < 13; k++) spaeter(1500 + k * 1300, () => partikel(zufall(W * 0.15, W * 0.85), H * 0.62, ["♪", "♫", "♥"], 6, 90, ["#9d2449", "#e85d7e"]));

      // Zweiter Akt: Scheinwerfer, Seifenblasen und ein großer Sprung zum Schluss
      spaeter(9800, () => {
        ["links", "rechts"].forEach((seite, i) => {
          const s2 = figur("", "sp-scheinwerfer " + seite);
          s2.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, fill: "forwards" });
          s2.animate([{ transform: "rotate(" + (i ? 30 : -30) + "deg)" }, { transform: "rotate(" + (i ? -10 : 10) + "deg)" }], { duration: 1600, direction: "alternate", iterations: 7, easing: "ease-in-out" });
        });
        sagBlase("Jetzt wird es bunt! 🪩", { left: W / 2 + "px", top: H * 0.3 + "px" }, 1800);
      });
      for (let k = 0; k < 22; k++) spaeter(11000 + k * 300, () => {
        const b = figur("", "sp-seifenblase", { left: zufall(2, 12) + "%", top: H * 0.62 + "px", width: zufall(14, 30) + "px" });
        b.style.height = b.style.width;
        b.animate([{ transform: "translate(0,0) scale(.3)", opacity: 0 }, { opacity: 0.95, offset: 0.1 }, { transform: "translate(" + zufall(W * 0.3, W * 0.9) + "px," + -zufall(H * 0.2, H * 0.5) + "px) scale(1)", opacity: 0 }],
          { duration: zufall(3500, 5500), easing: "ease-out", fill: "forwards" }).finished.then(() => b.remove(), () => {});
      });
      spaeter(18600, () => {
        buehne.querySelectorAll(".sp-taenzer").forEach((t) => t.animate([{ transform: (t.style.transform || "") + " translateY(0)" }, { transform: (t.style.transform || "") + " translateY(-60px)" }, { transform: (t.style.transform || "") + " translateY(0)" }], { duration: 700, easing: "ease-out" }));
        regen(["🎉", "♥", "✨"], 30, ["#e85d7e", "#f3c84b", "#7cc4f0"], 2200);
      });
    } },

    17: { titel: "Glühweinabend am Capystand 🍷", dauer: 21000, spiel() {
      const breite = Math.min(W * 0.92, 440);
      // Abendlicher Weihnachtsmarkt hinter dem Stand
      const mh = Math.max(breite * 0.67 + 70, H * 0.55);
      const markt = figur('<svg viewBox="0 0 400 220" preserveAspectRatio="none">' +
        '<defs><linearGradient id="sp-markt-himmel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a1f4a" stop-opacity="0"/><stop offset=".3" stop-color="#4a2550"/><stop offset="1" stop-color="#2a1430"/></linearGradient></defs>' +
        '<rect width="400" height="220" fill="url(#sp-markt-himmel)"/>' +
        [[10, 70, "#5a2a4a"], [80, 60, "#6e3558"], [300, 66, "#5a2a4a"], [350, 58, "#6e3558"]].map(([x, h, c]) =>
          '<path d="M' + x + ' 130 v-' + (h - 18) + ' l25 -18 l25 18 v' + (h - 18) + 'z" fill="' + c + '"/><rect x="' + (x + 18) + '" y="' + (130 - h * 0.55) + '" width="14" height="12" rx="2" fill="#ffd36b" opacity=".85"/>').join("") +
        '<path d="M0 60 Q100 90 200 62 T400 64" stroke="#2a1430" stroke-width="1.2" fill="none"/>' +
        [20, 60, 100, 140, 180, 220, 260, 300, 340, 380].map((x, i) => '<circle class="sp-markt-licht" style="animation-delay:' + (-i * 0.3) + 's" cx="' + x + '" cy="' + (66 + Math.sin(i) * 8) + '" r="3.2" fill="' + ["#ffd36b", "#ff8fab", "#fff2c4"][i % 3] + '"/>').join("") +
        '<rect x="0" y="130" width="400" height="90" fill="#3a2236"/>' +
        Array.from({ length: 30 }, (_, i) => '<rect x="' + ((i * 41) % 400) + '" y="' + (138 + (i % 5) * 16) + '" width="22" height="10" rx="3" fill="#4a2c44"/>').join("") +
        "</svg>", "sp-markt", { height: mh + "px" });
      markt.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, fill: "forwards" });
      const stand = figur('<svg viewBox="0 0 300 200"><rect x="20" y="70" width="10" height="130" fill="#8a5a3a"/><rect x="270" y="70" width="10" height="130" fill="#8a5a3a"/>' +
        '<path d="M5 74 L150 18 L295 74z" fill="#d6304f"/>' +
        Array.from({ length: 10 }, (_, i) => '<path d="M' + (5 + i * 29) + ' 74 q14.5 16 29 0z" fill="' + (i % 2 ? "#fff" : "#d6304f") + '"/>').join("") +
        '<rect x="70" y="40" width="160" height="26" rx="6" fill="#fff8e6" stroke="#d4a84b" stroke-width="2"/><text x="150" y="59" text-anchor="middle" font-family="Dancing Script, cursive" font-size="20" font-weight="700" fill="#9d2449">Glühwein ♥</text>' +
        '<path d="M30 92 Q90 110 150 92 T270 92" stroke="#6b4a3a" fill="none"/>' +
        [60, 105, 150, 195, 240].map((x, i) => '<circle cx="' + x + '" cy="' + (98 + (i % 2) * 4) + '" r="4" fill="' + ["#ffd36b", "#ff8fab"][i % 2] + '"/>').join("") +
        '<rect x="15" y="150" width="270" height="50" rx="4" fill="#a0683e"/><rect x="15" y="146" width="270" height="8" rx="3" fill="#c08a5a"/></svg>',
        "sp-stand", { width: breite + "px" });
      stand.animate([{ opacity: 0, transform: "translate(-50%, 40px)" }, { opacity: 1, transform: "translate(-50%, 0)" }], { duration: 800, fill: "forwards" });
      const links = figur(capySeite({ hut: "muetze", halt: "tasse" }), "sp-prost", { left: "calc(50% - " + breite * 0.42 + "px)", width: breite * 0.36 + "px" });
      const rechts = figur(capySeite({ halt: "tasse" }), "sp-prost sp-gespiegelt", { left: "calc(50% + " + breite * 0.06 + "px)", width: breite * 0.36 + "px" });
      [links, rechts].forEach((f, i) => {
        f.animate([{ opacity: 0, transform: (i ? "scaleX(-1) " : "") + "translateX(-60px)" }, { opacity: 1, transform: (i ? "scaleX(-1) " : "") + "translateX(0)" }], { duration: 900, delay: 500, fill: "forwards" });
        dampf(f, f.offsetWidth * 0.86, f.offsetHeight * 0.2, 3);
        for (const t of [2600, 5600, 8200]) spaeter(t, () => f.firstChild.animate(
          [{ transform: "rotate(0)" }, { transform: "rotate(-14deg) translateY(-6px)" }, { transform: "rotate(0)" }],
          { duration: 700, easing: "ease-in-out" }));
      });
      for (const t of [2950, 5950, 8550]) spaeter(t, () => {
        partikel(W / 2, H - stand.offsetHeight * 0.55, ["✨", "♥"], 8, 60, ["#f3c84b", "#e85d7e"]);
        const b = figur('<span>Prost! 🥂</span>', "sp-blase", { left: "50%", bottom: stand.offsetHeight * 0.95 + "px" });
        spaeter(1300, () => b.remove());
      });

      schneefall(26, 3000);
      // Zweiter Akt: ein Lebkuchenherz senkt sich vom Dach
      const st = lage(stand);
      const lb = Math.min(W * 0.26, 112);
      const lebkuchen = figur('<svg viewBox="0 0 120 140"><path d="M60 0 V22" stroke="#d6304f" stroke-width="2.5"/>' +
        '<path d="M60 130C36 114 4 92 4 60 4 40 18 24 38 24c10 0 18 5 22 13 4-8 12-13 22-13 20 0 34 16 34 36 0 32-32 54-56 70z" fill="#b5763e"/>' +
        '<path d="M60 120C40 106 14 88 14 61 14 46 25 34 39 34c9 0 16 5 21 12 5-7 12-12 21-12 14 0 25 12 25 27 0 27-26 45-46 59z" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="5 4"/>' +
        '<text x="60" y="78" text-anchor="middle" font-family="Dancing Script, cursive" font-weight="700" font-size="20" fill="#fff">Für Toni</text>' +
        '<circle cx="34" cy="96" r="4" fill="#ff4d7d"/><circle cx="86" cy="96" r="4" fill="#7cc4f0"/><circle cx="60" cy="108" r="4" fill="#9be3b0"/></svg>',
        "sp-lebkuchen", { left: st.x + st.w / 2 - lb / 2 + "px", top: st.y + st.h * 0.2 + "px", width: lb + "px", opacity: "0" });
      spaeter(10800, () => {
        lebkuchen.animate([{ transform: "translateY(-" + H * 0.5 + "px)", opacity: 1 }, { transform: "translateY(8px)", opacity: 1, offset: 0.75 }, { transform: "translateY(0)", opacity: 1 }], { duration: 1800, easing: "ease-out", fill: "forwards" });
        spaeter(1900, () => lebkuchen.firstChild.animate([{ transform: "rotate(-5deg)" }, { transform: "rotate(5deg)" }], { duration: 1300, direction: "alternate", iterations: 6, easing: "ease-in-out" }));
      });
      for (const [t, text] of [[13600, "Auf Toni! 🥂"], [16800, "Auf uns! ♥"]]) spaeter(t, () => {
        [links, rechts].forEach((f) => f.firstChild.animate([{ transform: "rotate(0)" }, { transform: "rotate(-14deg) translateY(-6px)" }, { transform: "rotate(0)" }], { duration: 700, easing: "ease-in-out" }));
        spaeter(350, () => { partikel(W / 2, H - stand.offsetHeight * 0.55, ["✨", "♥"], 10, 70, ["#f3c84b", "#e85d7e"]); sagBlase(text, { left: "50%", bottom: stand.offsetHeight * 0.95 + "px" }, 1500); });
      });
      spaeter(19000, () => regen(["✨", "♥", "❄"], 22, ["#f3c84b", "#ff8fab", "#fff"], 1800));
    } },

    18: { titel: "Wellnesstag im Capy-Thermalbad ♨️", dauer: 21000, spiel() {
      const breite = Math.min(W * 0.95, 460);
      const quelle = figur('<div class="sp-becken"></div>', "sp-onsen", { width: breite + "px" });
      quelle.animate([{ opacity: 0, transform: "translate(-50%, 30px)" }, { opacity: 1, transform: "translate(-50%, 0)" }], { duration: 900, fill: "forwards" });
      const becken = quelle.firstChild;
      const gaeste = [
        { o: { typ: 1, yuzu: true }, x: 6 }, { o: { typ: 2, handtuch: "#fda4b8" }, x: 28 },
        { o: { typ: 4, yuzu: true }, x: 52 }, { o: { typ: 3, handtuch: true }, x: 74 },
      ].map((g, i) => {
        const c = document.createElement("div");
        c.className = "sp-badegast";
        c.innerHTML = capyFront(g.o);
        c.style.left = g.x + "%";
        c.style.width = "22%";
        c.style.animationDelay = -i * 0.7 + "s";
        becken.appendChild(c);
        c.animate([{ transform: "translateY(60%)" }, { transform: "translateY(0)" }], { duration: 1200, delay: 600 + i * 300, easing: "cubic-bezier(.3,1.4,.5,1)", fill: "backwards" });
        return c;
      });
      const wasser = document.createElement("div");
      wasser.className = "sp-wasser";
      becken.appendChild(wasser);
      // Die Badeente schwimmt hin und her, nickt, flattert und quakt
      const ente = document.createElement("div");
      ente.className = "sp-ente links";
      ente.innerHTML = badeente();
      becken.appendChild(ente);
      ente.animate([{ left: "76%" }, { left: "4%", offset: 0.42 }, { left: "4%", offset: 0.5 }, { left: "76%" }], { duration: 19000, easing: "ease-in-out", fill: "both" });
      spaeter(19000 * 0.46, () => ente.classList.remove("links"));
      [2600, 6200, 9800, 15500].forEach((t, i) => spaeter(t, () => quaken(ente, i === 2 ? "Quak quak!" : "Quak!")));
      for (let k = 0; k < 6; k++) dampf(becken, breite * (0.12 + k * 0.15), 10, 2);
      // Wasserball, der zwischen den Capys hin und her fliegt
      const ball = figur('<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#fff"/><path d="M20 2a18 18 0 0 1 0 36z" fill="#e85d7e"/><path d="M2 20a18 18 0 0 1 36 0z" fill="#7cc4f0" opacity=".85"/><circle cx="20" cy="20" r="18" fill="none" stroke="rgba(0,0,0,.1)"/><circle cx="13" cy="12" r="4" fill="#fff" opacity=".6"/></svg>', "sp-wasserball", { left: "0", top: "0" });
      const mitte = (c) => { const r = c.getBoundingClientRect(), b = buehne.getBoundingClientRect(); return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height * 0.1 }; };
      const spritzer = (x, y, n) => partikel(x, y, ["💧"], n || 8, 60, ["#5aa9dd"]);
      const folge = [0, 2, 1, 3, 0, 3, 1, 2];
      let k = 0;
      const wurf = () => {
        if (k >= folge.length - 1) return;
        const von = mitte(gaeste[folge[k]]), nach = mitte(gaeste[folge[k + 1]]);
        const hoch = Math.min(von.y, nach.y) - Math.min(140, H * 0.22);
        ball.animate([
          { transform: "translate(" + (von.x - 16) + "px," + (von.y - 16) + "px) rotate(0)" },
          { transform: "translate(" + ((von.x + nach.x) / 2 - 16) + "px," + (hoch - 16) + "px) rotate(200deg)" },
          { transform: "translate(" + (nach.x - 16) + "px," + (nach.y - 16) + "px) rotate(400deg)" },
        ], { duration: 950, easing: "linear", fill: "forwards" });
        gaeste[folge[k]].animate([{ transform: "translateY(0)" }, { transform: "translateY(-14px)" }, { transform: "translateY(0)" }], { duration: 400 });
        spaeter(940, () => { spritzer(nach.x, nach.y + 20, 7); gaeste[folge[k]].animate([{ transform: "translateY(0)" }, { transform: "translateY(10px)" }, { transform: "translateY(0)" }], { duration: 400 }); k++; spaeter(250, wurf); });
      };
      spaeter(2000, wurf);
      // ein Capy taucht ab und kommt mit einer Fontäne wieder hoch
      spaeter(7600, () => {
        const c = gaeste[1];
        c.animate([{ transform: "translateY(0)" }, { transform: "translateY(85%)" }, { transform: "translateY(85%)" }, { transform: "translateY(-10%)" }, { transform: "translateY(0)" }],
          { duration: 2200, easing: "ease-in-out" });
        spaeter(1500, () => { const m = mitte(c); partikel(m.x, m.y + 10, ["💧", "💦"], 16, 100, ["#5aa9dd"]); });
      });
      // alle spritzen sich zum Schluss gegenseitig nass
      spaeter(10000, () => gaeste.forEach((c, i) => spaeter(i * 150, () => { const m = mitte(c); spritzer(m.x, m.y + 18, 10); })));

      // Zweiter Akt: Entenparade, Entspannung und Yuzu Regen
      spaeter(11600, () => {
        // Entenmama mit drei Küken, die hinterherpaddeln
        for (let k = 0; k < 4; k++) {
          const e = document.createElement("div");
          e.className = "sp-ente sp-parade" + (k ? " kueken" : "");
          e.innerHTML = badeente(k ? "#ffe066" : "#ffd23f");
          e.style.width = (k ? 1.9 : 2.8) + "rem";
          e.style.animationDelay = -k * 0.35 + "s";
          e.style.setProperty("--takt", 0.9 + k * 0.12 + "s");
          becken.appendChild(e);
          e.animate([{ left: "-14%" }, { left: "110%" }], { duration: 6800, delay: k * 520, easing: "linear", fill: "both" });
          if (k === 0) spaeter(1800, () => quaken(e, "Quak, Kinder!"));
          if (k === 3) spaeter(4200, () => quaken(e, "Piep!"));
        }
      });
      spaeter(13800, () => {
        gaeste.forEach((c) => c.animate([{ transform: "translateY(0)" }, { transform: "translateY(18%)" }], { duration: 1200, fill: "forwards", easing: "ease-out" }));
        sagBlase("Ahhh, wie entspannend … ♨️", { left: "50%", bottom: quelle.offsetHeight + H * 0.06 + "px" }, 2400);
        for (let k = 0; k < 6; k++) dampf(becken, breite * (0.1 + k * 0.16), 6, 3);
      });
      spaeter(16800, () => {
        gaeste.forEach((c) => c.animate([{ transform: "translateY(18%)" }, { transform: "translateY(0)" }], { duration: 600, fill: "forwards" }));
        for (let k = 0; k < 7; k++) spaeter(k * 260, () => {
          const r = becken.getBoundingClientRect(), bb = buehne.getBoundingClientRect();
          const x = r.left - bb.left + r.width * zufall(0.1, 0.9);
          const y = figur('<svg viewBox="0 0 20 20"><circle cx="10" cy="11" r="8" fill="#ffb020"/><circle cx="7.5" cy="8" r="2" fill="#fff" opacity=".5"/><path d="M10 3q3-3 6-1" stroke="#4a8a5c" stroke-width="2" fill="none"/></svg>', "sp-yuzu", { left: x - 10 + "px", top: "-30px", width: "22px" });
          const ziel = r.top - bb.top + r.height * 0.35;
          y.animate([{ transform: "translateY(0) rotate(0)" }, { transform: "translateY(" + (ziel + 30) + "px) rotate(300deg)" }], { duration: 900, easing: "ease-in", fill: "forwards" }).onfinish = () => { y.remove(); spritzer(x, ziel + 30, 6); };
        });
      });
      spaeter(19300, () => regen(["💦", "♥", "✨"], 18, ["#5aa9dd", "#ff8fab", "#f3c84b"], 1600));
    } },

    19: { titel: "Großes Capy Rodelrennen 🛷", dauer: 21000, spiel() {
      const hang = figur('<svg viewBox="0 0 400 300" preserveAspectRatio="none"><path d="M0 60 L400 250 V300 H0z" fill="#fff"/><path d="M0 60 L400 250" stroke="#dfe9f5" stroke-width="6"/></svg>', "sp-hang");
      hang.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, fill: "forwards" });
      const winkel = Math.atan2(H * 0.633, W) * 180 / Math.PI;
      const schlitten = '<path d="M4 54 h62 q10 0 12 -8" stroke="#9d2449" stroke-width="3" fill="none"/><rect x="6" y="44" width="58" height="6" rx="2" fill="#d4a84b"/>';
      for (let i = 0; i < 4; i++) {
        const gr = Math.min(W * 0.26, 120);
        const f = figur(capySeite({ ohneBeine: true, unten: schlitten, hut: i % 2 ? "muetze" : null }), "sp-rodler", { width: gr + "px" });
        const y0 = H * 0.2 - gr * 0.7, y1 = H * 0.833 - gr * 0.7;
        f.animate([
          { transform: "translate(-" + gr * 1.2 + "px," + y0 + "px) rotate(" + winkel + "deg)" },
          { transform: "translate(" + (W + gr) + "px," + (y1 + (H * 0.633 * gr * 2.2) / W) + "px) rotate(" + winkel + "deg)" },
        ], { duration: 3200 - i * 250, delay: 900 + i * 1500, easing: "cubic-bezier(.5,0,.8,.6)", fill: "both" });
      }

      // Zielflagge unten rechts
      const fb = Math.min(W * 0.16, 70);
      const flagge = figur('<svg viewBox="0 0 60 90"><rect x="4" y="0" width="4" height="90" fill="#6b4a3a"/><g class="sp-fahne">' +
        Array.from({ length: 12 }, (_, i) => '<rect x="' + (8 + (i % 4) * 12) + '" y="' + (4 + Math.floor(i / 4) * 10) + '" width="12" height="10" fill="' + ((i + Math.floor(i / 4)) % 2 ? "#fff" : "#2a1f2e") + '"/>').join("") + "</g></svg>",
        "sp-zielflagge", { left: W - fb - W * 0.04 + "px", top: H * 0.833 - fb * 1.9 + "px", width: fb + "px" });
      flagge.querySelector(".sp-fahne").animate([{ transform: "skewY(-4deg)" }, { transform: "skewY(4deg)" }], { duration: 500, direction: "alternate", iterations: Infinity });
      // Zweiter Akt: der Capy Bob mit drei Capys
      const bgr = Math.min(W * 0.5, 220);
      const bob = figur('<svg viewBox="0 0 220 90"><path d="M10 70 h180 q20 0 24 -18" stroke="#9d2449" stroke-width="4" fill="none"/>' +
        '<path d="M14 38 h176 q18 0 18 20 v6 H14z" fill="#d6304f"/><path d="M14 46 h194" stroke="#fff" stroke-width="3" opacity=".6"/>' +
        [20, 80, 140].map((x, i) => '<g transform="translate(' + x + ' -4) scale(.78)">' + capyFrontInhalt({ typ: [2, 5, 8][i] }) + "</g>").join("") +
        '<text x="110" y="60" text-anchor="middle" font-family="Dancing Script, cursive" font-weight="700" font-size="15" fill="#fff">Capy Bob</text></svg>',
        "sp-rodler", { width: bgr + "px" });
      const y0 = H * 0.2 - bgr * 0.3, y1 = H * 0.833 - bgr * 0.3;
      bob.animate([
        { transform: "translate(-" + bgr * 1.2 + "px," + y0 + "px) rotate(" + winkel + "deg)" },
        { transform: "translate(" + (W + bgr) + "px," + (y1 + (H * 0.633 * bgr * 2.2) / W) + "px) rotate(" + winkel + "deg)" },
      ], { duration: 3200, delay: 9600, easing: "cubic-bezier(.6,0,.9,.5)", fill: "both" });
      spaeter(10600, () => partikel(W * 0.5, H * 0.5, ["❄", "✦"], 12, 80, ["#fff", "#cfe6ff"]));
      // ein Capy rollt als Schneeball den Hang hinunter und wird immer größer
      const kugel = figur('<div class="sp-rollkugel">' + capyFront({ typ: 4, mund: "offen" }) + "</div>", "sp-rodler", { width: "40px" });
      kugel.animate([
        { transform: "translate(-40px," + (H * 0.2 - 30) + "px) rotate(0) scale(.6)" },
        { transform: "translate(" + W * 0.5 + "px," + (H * 0.52 - 60) + "px) rotate(720deg) scale(1.6)", offset: 0.55 },
        { transform: "translate(" + (W - fb * 2.2) + "px," + (H * 0.8 - 110) + "px) rotate(1260deg) scale(2.6)" },
      ], { duration: 3600, delay: 13000, easing: "ease-in", fill: "both" });
      spaeter(16600, () => {
        const l = lage(kugel);
        partikel(l.x + l.w / 2, l.y + l.h / 2, ["❄", "●", "✦"], 22, 140, ["#fff", "#dfe9f5", "#cfe6ff"]);
        kugel.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" });
        const c = figur(capySeite({ typ: 4 }), "sp-rodler", { left: "0", top: "0", width: Math.min(W * 0.24, 110) + "px" });
        c.animate([{ transform: "translate(" + (W - fb * 2.4 - 60) + "px," + (H * 0.8 - 80) + "px) translateY(-40px)", opacity: 0 }, { transform: "translate(" + (W - fb * 2.4 - 60) + "px," + (H * 0.8 - 80) + "px)", opacity: 1 }], { duration: 500, fill: "forwards" });
        sagBlase("Ziel! Erste! 🏁", { left: Math.min(W - 80, W - fb * 2.4) + "px", top: H * 0.8 - 150 + "px" }, 2200);
      });
      spaeter(18800, () => regen(["🏆", "✨", "❄"], 20, ["#f3c84b", "#fff", "#cfe6ff"], 1800));
    } },

    20: { titel: "Die Capy Crew trinkt den Matcha leer 🍵", dauer: 21000, spiel() {
      const gr = Math.min(W * 0.78, 320);
      const koepfe = [0, 1, 2].map((n, i) => {
        const x = 18 + i * 74;
        return '<g class="sp-trinker" data-i="' + i + '"><g transform="translate(' + x + ' 24) scale(1.05)">' + capyFrontInhalt({ typ: [5, 2, 8][i], mund: "offen" }) + "</g></g>" +
          '<path d="M' + (x + 30) + " 62 L" + [92, 120, 148][i] + ' 272" stroke="' + ["#e85d7e", "#7cc4f0", "#f3c84b"][i] + '" stroke-width="7" stroke-linecap="round"/>';
      }).join("");
      const becher = figur(
        '<svg viewBox="0 0 240 310" aria-hidden="true"><defs><clipPath id="sp-becher-innen"><path d="M30 90 h180 l-14 196 a10 10 0 0 1-10 9 H54 a10 10 0 0 1-10-9z"/></clipPath></defs>' +
        koepfe +
        '<path d="M22 74 h196 l-18 222 a14 14 0 0 1-14 13 H54 a14 14 0 0 1-14-13z" fill="#eef7e6" opacity=".85" stroke="#4a7c3a" stroke-width="3"/>' +
        '<g clip-path="url(#sp-becher-innen)"><g class="sp-fuellung">' +
        '<rect x="20" y="96" width="200" height="220" fill="#8fbf5a"/>' +
        '<path d="M20 96 q25 12 50 0 t50 0 t50 0 t50 0 v8 H20z" fill="#a8d07a"/>' +
        '<rect x="70" y="160" width="40" height="40" rx="9" fill="#fff" opacity=".55" transform="rotate(-12 90 180)"/><rect x="128" y="196" width="36" height="36" rx="9" fill="#fff" opacity=".55" transform="rotate(10 146 214)"/>' +
        "</g></g>" +
        '<rect x="14" y="64" width="212" height="18" rx="9" fill="#4a7c3a"/></svg>',
        "sp-matcha", { width: gr + "px" });
      becher.animate([{ transform: "translate(-50%, 110%)" }, { transform: "translate(-50%, 0)" }], { duration: 1300, easing: "cubic-bezier(.2,.9,.3,1.1)", fill: "forwards" });
      const svg = becher.querySelector("svg");
      const fuell = svg.querySelector(".sp-fuellung");
      // Trinken: Füllstand sinkt über 8 Sekunden ganz nach unten
      spaeter(1800, () => fuell.animate([{ transform: "translateY(0)" }, { transform: "translateY(205px)" }], { duration: 8000, easing: "ease-in", fill: "forwards" }));
      svg.querySelectorAll(".sp-trinker").forEach((t, i) => {
        spaeter(1800 + i * 200, () => t.animate([{ transform: "translateY(0)" }, { transform: "translateY(3px)" }, { transform: "translateY(0)" }], { duration: 420, iterations: 19 }));
      });
      // Bläschen beim Schlürfen
      for (let k = 0; k < 14; k++) spaeter(2200 + k * 520, () => {
        const r = becher.getBoundingClientRect(), b = buehne.getBoundingClientRect();
        const x = r.left - b.left + r.width * zufall(0.3, 0.7), y = r.top - b.top + r.height * 0.4;
        partikel(x, y, ["○"], 3, 22, ["#f6fbef"]);
      });
      spaeter(4800, () => { const b = figur("<span>Schlürf! 😋</span>", "sp-blase", { left: "50%", top: "18%" }); spaeter(1400, () => b.remove()); });
      // Ende: leer, alle reiben sich zufrieden den Bauch
      spaeter(10100, () => {
        const b = figur("<span>Alle! Ausgetrunken 😋💚</span>", "sp-blase", { left: "50%", top: "18%" });
        svg.querySelectorAll(".sp-trinker").forEach((t, i) => t.animate([{ transform: "rotate(0)" }, { transform: "rotate(" + (i % 2 ? 8 : -8) + "deg) translateY(-6px)" }, { transform: "rotate(0)" }], { duration: 600, iterations: 3 }));
        const r = becher.getBoundingClientRect(), bb = buehne.getBoundingClientRect();
        partikel(r.left - bb.left + r.width / 2, r.top - bb.top + r.height * 0.15, ["♥", "✨"], 12, 90, ["#4a8a5c", "#e85d7e"]);
        spaeter(2000, () => b.remove());
      });

      // Zweiter Akt: Nachschub!
      const kb = Math.min(W * 0.3, 140);
      const rand = H + 10 - gr * (310 / 240) + gr * (64 / 240);
      const kellner = figur(capySeite({ hut: "koch" }) , "sp-gespiegelt sp-kellner", { width: kb + "px", left: W + "px", top: rand - kb * 0.76 + "px" });
      const kanne = figur('<svg viewBox="0 0 60 60"><path d="M10 14h32l-4 40H14z" fill="#eef7e6" stroke="#4a7c3a" stroke-width="2.5"/><rect x="14" y="26" width="24" height="26" fill="#8fbf5a"/><path d="M42 18q10 0 8 12" stroke="#4a7c3a" stroke-width="3" fill="none"/><path d="M10 14 l-8 -6" stroke="#4a7c3a" stroke-width="3"/></svg>',
        "sp-kanne", { width: kb * 0.45 + "px", left: W + "px", top: rand - kb * 0.62 + "px" });
      const zielX = W / 2 + gr * 0.16;
      spaeter(11400, () => {
        sagBlase("Nachschub! 🍵", { left: "50%", top: "18%" }, 1600);
        kellner.animate([{ left: W + "px" }, { left: zielX + "px" }], { duration: 1400, easing: "ease-out", fill: "forwards" });
        kanne.animate([{ left: W + "px" }, { left: zielX - kb * 0.3 + "px" }], { duration: 1400, easing: "ease-out", fill: "forwards" });
      });
      spaeter(13000, () => {
        kanne.animate([{ transform: "rotate(0)" }, { transform: "rotate(-55deg)" }], { duration: 500, fill: "forwards" });
        const strahl = figur("", "sp-strahl", { left: zielX - kb * 0.32 + "px", top: rand - kb * 0.5 + "px", height: Math.max(40, H - rand - gr * 0.5) + "px" });
        strahl.animate([{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], { duration: 300, delay: 400, fill: "both" });
        fuell.animate([{ transform: "translateY(205px)" }, { transform: "translateY(30px)" }], { duration: 2600, delay: 500, easing: "ease-out", fill: "forwards" });
        spaeter(3100, () => { strahl.remove(); kanne.animate([{ transform: "rotate(-55deg)" }, { transform: "rotate(0)" }], { duration: 400, fill: "forwards" }); });
      });
      spaeter(16400, () => {
        kellner.animate([{ left: zielX + "px" }, { left: W + 20 + "px" }], { duration: 1200, easing: "ease-in", fill: "forwards" });
        kanne.animate([{ left: zielX - kb * 0.3 + "px" }, { left: W + 20 + "px" }], { duration: 1200, easing: "ease-in", fill: "forwards" });
        fuell.animate([{ transform: "translateY(30px)" }, { transform: "translateY(150px)" }], { duration: 3000, easing: "ease-in", fill: "forwards" });
        svg.querySelectorAll(".sp-trinker").forEach((t, i) => t.animate([{ transform: "translateY(0)" }, { transform: "translateY(3px)" }, { transform: "translateY(0)" }], { duration: 300, iterations: 10, delay: i * 100 }));
      });
      spaeter(19400, () => {
        sagBlase("Hicks! Jetzt sind wir satt 😋🍵", { left: "50%", top: "18%" }, 1600);
        const r = becher.getBoundingClientRect(), bb = buehne.getBoundingClientRect();
        partikel(r.left - bb.left + r.width / 2, r.top - bb.top + r.height * 0.15, ["♥", "○", "✨"], 14, 100, ["#4a8a5c", "#e85d7e", "#f6fbef"]);
      });
    } },

    21: { titel: "Capy Feuerwerk nur für dich 🎆", dauer: 21000, spiel() {
      const nacht = figur("", "sp-nacht");
      nacht.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, fill: "forwards" });
      const gr = Math.min(W * 0.22, 90);
      const rakete = figur('<svg viewBox="0 0 60 120"><path d="M30 0 C48 20 50 55 46 85 H14 C10 55 12 20 30 0z" fill="#fff" stroke="#e6d6dc"/><path d="M14 70 L0 100 L16 92z M46 70 L60 100 L44 92z" fill="#e85d7e"/><circle cx="30" cy="45" r="14" fill="#7cc4f0" stroke="#d4a84b" stroke-width="3"/></svg>' +
        '<div class="sp-raketen-capy">' + capyFront() + "</div><span class=\"sp-flamme\"></span>", "sp-rakete", { width: gr + "px" });
      rakete.animate([{ transform: "translate(-50%, 0)" }, { transform: "translate(-50%, -" + (H * 0.72) + "px)" }], { duration: 1900, delay: 500, easing: "cubic-bezier(.6,0,.9,.6)", fill: "forwards" });
      spaeter(2400, () => { rakete.style.opacity = "0"; partikel(W / 2, H * 0.25, ["♥"], 26, Math.min(W, H) * 0.32, ["#ff5c85", "#f3c84b", "#7cc4f0", "#fff"]); });
      spaeter(3300, () => partikel(W * 0.25, H * 0.35, ["♥", "✦"], 18, Math.min(W, H) * 0.22, ["#f3c84b", "#fff"]));
      spaeter(4100, () => partikel(W * 0.75, H * 0.3, ["♥", "✦"], 18, Math.min(W, H) * 0.22, ["#ff8fab", "#b39ddb"]));
      spaeter(4600, () => {
        const schirm = figur('<svg class="sp-schirmtuch" viewBox="0 0 100 70"><path d="M2 40 A48 40 0 0 1 98 40 Q86 32 74 40 Q62 32 50 40 Q38 32 26 40 Q14 32 2 40z" fill="#e85d7e"/><path d="M26 40 Q38 32 50 40 Q62 32 74 40 A48 40 0 0 0 26 40" fill="#f3c84b" opacity=".85"/><path d="M4 40 L42 68 M96 40 L58 68 M50 40 V66" stroke="#9d8a90" fill="none"/></svg>' + capyFront(),
          "sp-fallschirm", { width: gr * 1.3 + "px" });
        schirm.animate([{ transform: "translate(-50%, 0) rotate(-6deg)" }, { transform: "translate(-30%, " + H * 0.45 + "px) rotate(6deg)" }, { transform: "translate(-60%, " + H * 0.8 + "px) rotate(-4deg)" }],
          { duration: 5800, easing: "ease-in-out", fill: "forwards" });
      });

      // Zweiter Akt: drei Raketen, Toni in Funken und goldener Regen
      const knall = (x, y, farben, form) => partikel(x, y, form || ["♥", "✦"], 22, Math.min(W, H) * 0.24, farben);
      [[0.2, 11000, ["#ff5c85", "#fff"]], [0.5, 11700, ["#f3c84b", "#ff8fab"]], [0.8, 12400, ["#7cc4f0", "#b39ddb"]]].forEach(([fx, t, farben]) => spaeter(t, () => {
        const sp = figur("", "sp-funkenspur", { left: W * fx + "px", top: H + "px" });
        sp.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-" + H * 0.7 + "px)", opacity: 1 }], { duration: 900, easing: "ease-out", fill: "forwards" })
          .onfinish = () => { sp.remove(); knall(W * fx, H * 0.3, farben); };
      }));
      const name = figur("TONI".split("").map((b) => "<span>" + b + "</span>").join("") + '<span class="herz">♥</span>', "sp-funkenname", { left: "50%", top: H * 0.24 + "px" });
      name.querySelectorAll("span").forEach((b, i) => b.animate([{ opacity: 0, transform: "scale(.2)", filter: "blur(4px)" }, { opacity: 1, transform: "scale(1.2)", filter: "blur(0)", offset: 0.6 }, { opacity: 1, transform: "scale(1)" }],
        { duration: 700, delay: 14200 + i * 380, fill: "both" }));
      spaeter(14200, () => { for (let i = 0; i < 5; i++) spaeter(i * 380, () => { const l = lage(name); partikel(l.x + l.w * (0.1 + i * 0.2), l.y + l.h / 2, ["✦"], 6, 40, ["#fff", "#f3c84b"]); }); });
      spaeter(17600, () => name.animate([{ opacity: 1 }, { opacity: 0.85, filter: "brightness(1.4)" }, { opacity: 1 }], { duration: 600, iterations: 3 }));
      spaeter(18400, () => regen(["✦", "✧", "·"], 40, ["#f3c84b", "#ffe9a8", "#fff"], 2600, 18));
    } },

    22: { titel: "Große Schneeballschlacht! ❄️", dauer: 21000, spiel() {
      const gr = Math.min(W * 0.3, 140);
      const links = figur(capySeite({ typ: 2 }), "sp-werfer", { left: "4%", width: gr + "px" });
      const rechts = figur(capySeite({ typ: 4 }), "sp-werfer sp-gespiegelt", { right: "4%", width: gr + "px" });
      [links, rechts].forEach((f, i) => f.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: i * 200, fill: "both" }));
      // kleine Schneeburgen als Deckung
      ["4%", "auto"].forEach((l, i) => figur('<svg viewBox="0 0 120 40"><path d="M0 40 Q10 8 30 14 Q48 0 64 12 Q84 2 98 16 Q114 12 120 40z" fill="#fff"/><path d="M14 28 q20 -8 40 0" stroke="#dfe9f5" stroke-width="3" fill="none"/></svg>',
        "sp-schneeburg", i ? { right: "1%", width: gr * 0.9 + "px" } : { left: "1%", width: gr * 0.9 + "px" }));
      const yBoden = H - gr * 0.62 - H * 0.08;
      const wuerfe = [
        { von: "l", r: 9 }, { von: "r", r: 14 }, { von: "l", r: 11 }, { von: "r", r: 7 }, { von: "l", r: 17 },
        { von: "r", r: 10 }, { von: "l", r: 13 }, { von: "r", r: 18 },
      ];
      const wirf = (w, i, letzter) => {
        const vonLinks = w.von === "l";
        const x0 = vonLinks ? W * 0.04 + gr * 0.85 : W * 0.96 - gr * 0.85, x1 = vonLinks ? W * 0.96 - gr * 0.55 : W * 0.04 + gr * 0.55;
        const ball = figur("", "sp-schneeball", { left: "0", top: "0", width: w.r * 2 + "px", height: w.r * 2 + "px", margin: -w.r + "px 0 0 " + -w.r + "px" });
        const hoch = yBoden - Math.min(H * (letzter ? 0.42 : 0.3), letzter ? 300 : 230) - w.r;
        const werfer = vonLinks ? links : rechts, ziel = vonLinks ? rechts : links;
        werfer.firstChild.animate([{ transform: "rotate(0)" }, { transform: "rotate(-16deg)" }, { transform: "rotate(0)" }], { duration: 420 });
        ball.animate([
          { transform: "translate(" + x0 + "px," + yBoden + "px) rotate(0)" },
          { transform: "translate(" + (x0 + x1) / 2 + "px," + hoch + "px) rotate(180deg)" },
          { transform: "translate(" + x1 + "px," + (yBoden + 8) + "px) rotate(360deg)" },
        ], { duration: letzter ? 1300 : 900 + w.r * 12, easing: "linear", fill: "forwards" }).onfinish = () => {
          ball.remove();
          partikel(x1, yBoden + 12, ["●"], Math.round(w.r * 0.9), w.r * 3, ["#fff"]);
          if (!letzter) {
            ziel.firstChild.animate([{ transform: "rotate(0)" }, { transform: "rotate(-10deg)" }, { transform: "rotate(6deg)" }, { transform: "rotate(0)" }], { duration: 500 });
            return;
          }
          // Der Riesen-Schneeball katapultiert das rechte Capy aus dem Bild
          const b = figur("<span>Huiii! 💫</span>", "sp-blase", { left: Math.min(W - 70, W * 0.96 - gr * 0.5) + "px", bottom: gr * 1.4 + H * 0.08 + "px" });
          spaeter(1200, () => b.remove());
          rechts.animate([
            { transform: "translate(0,0) rotate(0)" },
            { transform: "translate(" + W * 0.25 + "px," + -H * 0.45 + "px) rotate(260deg)", offset: 0.5 },
            { transform: "translate(" + W * 0.6 + "px," + -H * 0.9 + "px) rotate(620deg) scale(.6)" },
          ], { duration: 1500, easing: "cubic-bezier(.2,.7,.4,1)", fill: "forwards" });
          spaeter(400, () => partikel(W * 0.85, yBoden - H * 0.3, ["✨", "⭐"], 8, 40, ["#f3c84b"]));
          // Das linke Capy hat gewonnen und tanzt
          spaeter(1400, () => {
            const sieg = figur("<span>Gewonnen! 🏆</span>", "sp-blase", { left: Math.max(70, W * 0.04 + gr * 0.5) + "px", bottom: gr * 1.35 + H * 0.08 + "px" });
            links.firstChild.animate([
              { transform: "translateY(0) rotate(0)" }, { transform: "translateY(-30px) rotate(-12deg)" }, { transform: "translateY(0) rotate(0)" },
              { transform: "translateY(-30px) rotate(12deg)" }, { transform: "translateY(0) rotate(0)" },
            ], { duration: 900, iterations: 3, easing: "ease-in-out" });
            links.animate([{ transform: "translateX(0)" }, { transform: "translateX(" + W * 0.25 + "px)" }, { transform: "translateX(0)" }], { duration: 2700, easing: "ease-in-out" });
            for (let k = 0; k < 4; k++) spaeter(k * 600, () => partikel(W * 0.2 + k * 20, yBoden - 30, ["♪", "🎉", "♫"], 6, 60, ["#9d2449", "#e85d7e"]));
            spaeter(2600, () => sieg.remove());
          });
        };
      };
      wuerfe.forEach((w, i) => spaeter(900 + i * 1000, () => wirf(w, i, false)));
      spaeter(900 + wuerfe.length * 1000 + 300, () => wirf({ von: "l", r: 34 }, 99, true));

      // Zweiter Akt: das weggeschleuderte Capy kommt zurück, beide bauen zusammen einen Schneemann
      spaeter(14600, () => {
        rechts.animate([
          { transform: "translate(" + W * 0.1 + "px," + -H + "px) rotate(-200deg) scale(.7)" },
          { transform: "translate(0,0) rotate(0) scale(1)" },
        ], { duration: 1100, easing: "cubic-bezier(.5,0,.7,1.4)", fill: "forwards" });
        spaeter(1100, () => { partikel(W * 0.96 - gr * 0.5, yBoden + 10, ["●", "❄"], 16, 70, ["#fff"]); sagBlase("Plumps! 😵‍💫", { left: Math.min(W - 70, W * 0.96 - gr * 0.5) + "px", bottom: gr * 1.4 + H * 0.08 + "px" }, 1400); });
      });
      spaeter(17200, () => sagBlase("Lieber zusammen einen Schneemann bauen? ⛄", { left: W / 2 + "px", bottom: gr * 1.7 + H * 0.08 + "px" }, 1800));
      const sm = Math.min(W * 0.22, 100);
      const teile = [
        '<circle cx="50" cy="150" r="34" fill="#fff" stroke="#dfe9f5" stroke-width="2"/>',
        '<circle cx="50" cy="96" r="25" fill="#fff" stroke="#dfe9f5" stroke-width="2"/><circle cx="50" cy="90" r="2.4" fill="#3a2418"/><circle cx="50" cy="102" r="2.4" fill="#3a2418"/>',
        '<circle cx="50" cy="56" r="19" fill="#fff" stroke="#dfe9f5" stroke-width="2"/><circle cx="43" cy="52" r="2.2" fill="#3a2418"/><circle cx="57" cy="52" r="2.2" fill="#3a2418"/><path d="M50 58 l14 3 -14 3z" fill="#ff8a2a"/><path d="M42 64 q8 5 16 0" stroke="#3a2418" stroke-width="1.6" fill="none"/>',
        '<path d="M30 40 h40" stroke="#2a1f2e" stroke-width="4" stroke-linecap="round"/><rect x="38" y="18" width="24" height="22" rx="2" fill="#2a1f2e"/><rect x="38" y="32" width="24" height="5" fill="#d6304f"/><path d="M33 76 q17 8 34 0 v6 q-17 8 -34 0z" fill="#e85d7e"/>',
      ];
      const schneemann = figur('<svg viewBox="0 0 100 186">' + teile.map((t, i) => '<g class="sp-sm-teil" data-i="' + i + '" opacity="0">' + t + "</g>").join("") + "</svg>",
        "sp-schneemann-gross", { left: W / 2 - sm / 2 + "px", bottom: H * 0.06 + "px", width: sm + "px" });
      schneemann.querySelectorAll(".sp-sm-teil").forEach((t, i) => spaeter(18000 + i * 450, () => {
        t.setAttribute("opacity", "1");
        t.animate([{ transform: "scale(.2)" }, { transform: "scale(1.1)" }, { transform: "scale(1)" }], { duration: 400 });
        const l = lage(schneemann); partikel(l.x + l.w / 2, l.y + l.h * (0.8 - i * 0.22), ["❄"], 5, 40, ["#fff"]);
      }));
      spaeter(17700, () => {
        links.animate([{ transform: "translateX(0)" }, { transform: "translateX(" + (W / 2 - sm * 0.6 - gr - W * 0.04) + "px)" }], { duration: 900, easing: "ease-out", fill: "forwards" });
        rechts.animate([{ transform: "translate(0,0)" }, { transform: "translateX(-" + (W / 2 - sm * 0.6 - gr - W * 0.04) + "px)" }], { duration: 900, easing: "ease-out", fill: "forwards" });
      });
      spaeter(20000, () => { const l = lage(schneemann); partikel(l.x + l.w / 2, l.y, ["♥"], 12, 80, ["#ff4d7d", "#ff8fab"]); });
    } },

    23: { titel: "Capy Polonaise 🎶", dauer: 22000, spiel() {
      const gr = Math.min(W * 0.2, 96);
      const farben = ["#f3dc9f", "#fda4b8", "#9be3b0", "#7cc4f0", "#f3c84b", "#b39ddb", "#ff8fab", "#f3dc9f", "#9be3b0"];
      for (let i = 0; i < 9; i++) {
        const f = figur(capySeite({ hut: "party", hutFarbe: farben[i] }), "sp-polonaise", { width: gr + "px" });
        const y = H * 0.8 - gr * 0.6;
        const kf = [];
        // erst nach rechts, dann in einer großen Schleife zurück und wieder hinaus
        for (let s = 0; s <= 30; s++) {
          const t = s / 30;
          let x, yy;
          if (t < 0.4) { x = -gr * 1.5 + (t / 0.4) * (W * 0.85 + gr * 1.5); yy = y + Math.sin(t * Math.PI * 6) * H * 0.06; }
          else if (t < 0.7) { const u = (t - 0.4) / 0.3; x = W * 0.85 - Math.sin(u * Math.PI) * W * 0.1 - u * W * 0.7; yy = y - Math.sin(u * Math.PI) * H * 0.28; }
          else { const u = (t - 0.7) / 0.3; x = W * 0.15 + u * (W * 0.85 + gr * 2); yy = y + Math.sin(u * Math.PI * 4) * H * 0.06; }
          kf.push({ transform: "translate(" + x + "px," + yy + "px)" + (t > 0.4 && t < 0.7 ? " scaleX(-1)" : "") });
        }
        f.animate(kf, { duration: 17500, delay: 600 + i * 380, easing: "linear", fill: "both" });
        f.firstChild.animate([{ transform: "translateY(0)" }, { transform: "translateY(-8px)" }], { duration: 300, direction: "alternate", iterations: Infinity });
      }
      for (let k = 0; k < 14; k++) spaeter(1200 + k * 1300, () => partikel(zufall(W * 0.1, W * 0.9), H * 0.45, ["♪", "♫"], 5, 70, ["#9d2449", "#e85d7e"]));

      // Lampions über der Tanzfläche und bunte Scheinwerfer
      const kette = figur('<svg viewBox="0 0 400 60" preserveAspectRatio="none"><path d="M0 8 Q100 50 200 12 T400 10" stroke="#6b4a3a" stroke-width="1.5" fill="none"/>' +
        [40, 95, 150, 250, 305, 360].map((x, i) => '<rect class="sp-lampion" x="' + (x - 7) + '" y="' + (i % 2 ? 26 : 30) + '" width="14" height="18" rx="6" fill="' + ["#f3c84b", "#e85d7e", "#7cc4f0", "#9be3b0", "#b39ddb", "#ff8fab"][i] + '"/>').join("") + "</svg>", "sp-lampions");
      kette.animate([{ transform: "translateY(-120%)" }, { transform: "translateY(0)" }], { duration: 1000, delay: 300, easing: "ease-out", fill: "both" });
      spaeter(5200, () => ["links", "rechts"].forEach((seite, i) => {
        const s2 = figur("", "sp-scheinwerfer bunt " + seite);
        s2.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, fill: "forwards" });
        s2.animate([{ transform: "rotate(" + (i ? 30 : -30) + "deg)" }, { transform: "rotate(" + (i ? -10 : 10) + "deg)" }], { duration: 1500, direction: "alternate", iterations: 9, easing: "ease-in-out" });
      }));
      spaeter(9000, () => sagBlase("Alle mitmachen! 🎶", { left: W / 2 + "px", top: H * 0.3 + "px" }, 1800));
      spaeter(19000, () => regen(["🎉", "♪", "♥", "✨"], 34, ["#e85d7e", "#f3c84b", "#7cc4f0", "#9be3b0"], 2000));
    } },

    24: { titel: "Die Capys backen Plätzchen 🍪", dauer: 21000, spiel() {
      const breite = Math.min(W * 0.62, 280);
      const blech = figur('<svg viewBox="0 0 200 40"><rect x="4" y="10" width="192" height="22" rx="6" fill="#9aa3ad"/><rect x="10" y="6" width="180" height="8" rx="4" fill="#c4cbd3"/></svg>', "sp-blech", { width: breite + "px" });
      const baecker = figur(capySeite({ hut: "koch" }), "sp-baecker", { width: Math.min(W * 0.3, 140) + "px" });
      [blech, baecker].forEach((f) => f.animate([{ opacity: 0, transform: f === blech ? "translate(-50%, 30px)" : "translateY(30px)" }, { opacity: 1, transform: f === blech ? "translate(-50%, 0)" : "none" }], { duration: 700, fill: "forwards" }));
      const kekse = [
        '<path d="M20 36S5 26 5 16A8 8 0 0 1 20 11a8 8 0 0 1 15 5c0 10-15 20-15 20z" fill="#d9a066" stroke="#b5763e" stroke-width="2"/><path d="M12 17h16" stroke="#fff" stroke-width="2" stroke-dasharray="3 3"/>',
        '<path d="M20 3l5 10 11 1.5-8 7.5 2 11-10-5.5-10 5.5 2-11-8-7.5 11-1.5z" fill="#e8b86d" stroke="#b5763e" stroke-width="2"/><circle cx="20" cy="20" r="3" fill="#e85d7e"/>',
        '<circle cx="20" cy="20" r="15" fill="#d9a066" stroke="#b5763e" stroke-width="2"/><circle cx="14" cy="16" r="2.4" fill="#5a3418"/><circle cx="24" cy="24" r="2.4" fill="#5a3418"/><circle cx="25" cy="14" r="2" fill="#5a3418"/>',
        '<path d="M20 4c6 0 9 4 9 9v2h3v6h-3v10a4 4 0 0 1-4 4H15a4 4 0 0 1-4-4V21H8v-6h3v-2c0-5 3-9 9-9z" fill="#c98a4e"/><circle cx="16" cy="12" r="1.6" fill="#3a2418"/><circle cx="24" cy="12" r="1.6" fill="#3a2418"/><path d="M15 24h10" stroke="#fff" stroke-width="2"/>',
      ];
      const yBlech = H - blech.offsetHeight - H * 0.1;
      for (let k = 0; k < 14; k++) spaeter(1200 + k * 520, () => {
        const keks = figur('<svg viewBox="0 0 40 40">' + kekse[k % kekse.length] + "</svg>", "sp-keks", { left: "0", top: "0" });
        const x0 = W / 2 + zufall(-breite * 0.35, breite * 0.35), dx = zufall(-W * 0.35, W * 0.35), hoch = zufall(H * 0.35, H * 0.65);
        keks.animate([
          { transform: "translate(" + x0 + "px," + yBlech + "px) rotate(0)" , opacity: 1 },
          { transform: "translate(" + (x0 + dx * 0.6) + "px," + (yBlech - hoch) + "px) rotate(" + zufall(-200, 200) + "deg)", opacity: 1, offset: 0.55 },
          { transform: "translate(" + (x0 + dx) + "px," + (yBlech - hoch * 0.6) + "px) rotate(" + zufall(-360, 360) + "deg)", opacity: 0 },
        ], { duration: 2200, easing: "cubic-bezier(.2,.8,.4,1)", fill: "forwards" });
      });
      for (const t of [1000, 3600, 6400]) spaeter(t, () => partikel(W / 2, yBlech, ["●"], 10, 50, ["rgba(255,255,255,.9)"]));

      // Zweiter Akt: ein großes Herz Plätzchen wird mit Toni verziert
      const pk = Math.min(W * 0.5, 220);
      const grossKeks = figur('<svg viewBox="0 0 200 180"><path d="M100 170C62 146 8 112 8 62 8 32 30 10 58 10c18 0 32 9 42 23 10-14 24-23 42-23 28 0 50 22 50 52 0 50-54 84-92 108z" fill="#d9a066" stroke="#b5763e" stroke-width="5"/>' +
        '<path class="sp-guss" d="M100 158C66 136 22 106 22 63 22 40 38 24 59 24c16 0 28 9 41 25 13-16 25-25 41-25 21 0 37 16 37 39 0 43-44 73-78 95z" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-dasharray="560" stroke-dashoffset="560"/>' +
        '<text class="sp-schrift" x="100" y="96" text-anchor="middle" font-family="Dancing Script, cursive" font-weight="700" font-size="44" fill="none" stroke="#ff4d7d" stroke-width="2.4" stroke-dasharray="320" stroke-dashoffset="320">Toni</text>' +
        '<g class="sp-streusel" opacity="0">' + Array.from({ length: 26 }, (_, i) => '<rect x="' + (40 + (i * 37) % 120) + '" y="' + (40 + (i * 53) % 90) + '" width="6" height="2.4" rx="1.2" fill="' + ["#ff4d7d", "#7cc4f0", "#9be3b0", "#f3c84b"][i % 4] + '" transform="rotate(' + (i * 47) % 180 + " " + (43 + (i * 37) % 120) + " " + (41 + (i * 53) % 90) + ')"/>').join("") + "</g></svg>",
        "sp-grosskeks", { left: W / 2 - pk / 2 + "px", top: H * 0.16 + "px", width: pk + "px", opacity: "0" });
      spaeter(10200, () => {
        grossKeks.animate([{ opacity: 0, transform: "scale(.3) rotate(-20deg)" }, { opacity: 1, transform: "scale(1.06) rotate(4deg)", offset: 0.7 }, { opacity: 1, transform: "scale(1) rotate(0)" }], { duration: 1000, easing: "ease-out", fill: "forwards" });
        sagBlase("Und jetzt das schönste Plätzchen … 🍪", { left: W / 2 + "px", top: Math.max(6, H * 0.16 - 46) + "px" }, 1900);
      });
      spaeter(11600, () => grossKeks.querySelector(".sp-guss").animate([{ strokeDashoffset: 560 }, { strokeDashoffset: 0 }], { duration: 1800, easing: "ease-in-out", fill: "forwards" }));
      spaeter(13300, () => {
        const t = grossKeks.querySelector(".sp-schrift");
        t.animate([{ strokeDashoffset: 320 }, { strokeDashoffset: 0 }], { duration: 2000, easing: "ease-in-out", fill: "forwards" });
        spaeter(1700, () => t.animate([{ fill: "rgba(255,77,125,0)" }, { fill: "rgba(255,77,125,1)" }], { duration: 600, fill: "forwards" }));
      });
      spaeter(16000, () => {
        const st = grossKeks.querySelector(".sp-streusel");
        st.setAttribute("opacity", "1");
        st.animate([{ transform: "translateY(-30px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }], { duration: 700, easing: "ease-in" });
        const l = lage(grossKeks); partikel(l.x + l.w / 2, l.y + 10, ["•"], 16, 70, ["#ff4d7d", "#7cc4f0", "#9be3b0", "#f3c84b"]);
      });
      spaeter(17400, () => {
        baecker.firstChild.animate([{ transform: "translateY(0)" }, { transform: "translateY(-14px)" }, { transform: "translateY(0)" }], { duration: 500, iterations: 3 });
        sagBlase("Mmmh, das ist nur für Toni! 😋", { left: Math.min(W - 90, Math.max(90, W * 0.3)) + "px", bottom: H * 0.36 + "px" }, 2200);
      });
      spaeter(19300, () => { const l = lage(grossKeks); partikel(l.x + l.w / 2, l.y + l.h / 2, ["♥", "✨"], 16, 120, ["#ff4d7d", "#f3c84b"]); });
    } },

    25: { titel: "Morgen ist es so weit! 🎂", dauer: 21000, spiel() {
      const banner = figur('<span>Morgen ist dein Tag, Toni! ♥️</span>', "sp-banner");
      banner.animate([{ transform: "translateX(-50%) scaleX(0)" }, { transform: "translateX(-50%) scaleX(1)" }], { duration: 900, delay: 300, easing: "cubic-bezier(.3,1.3,.5,1)", fill: "both" });
      const breite = Math.min(W * 0.5, 230);
      const kuchen = figur('<svg viewBox="0 0 200 170">' +
        [50, 80, 110, 140].map((x, i) => '<rect x="' + (x - 3) + '" y="18" width="6" height="30" rx="2" fill="' + ["#7cc4f0", "#f3c84b", "#9be3b0", "#fda4b8"][i] + '"/><path class="sp-kerze" d="M' + x + ' 4c5 6 5 10 0 13-5-3-5-7 0-13z" fill="#ffb648"/>').join("") +
        '<rect x="22" y="46" width="156" height="50" rx="10" fill="#fda4b8"/><path d="M22 60q13 14 26 0t26 0 26 0 26 0 26 0 26 0" fill="#fff"/>' +
        '<rect x="10" y="94" width="180" height="62" rx="12" fill="#e85d7e"/><path d="M10 110q15 14 30 0t30 0 30 0 30 0 30 0 30 0" fill="#fff"/>' +
        '<circle cx="50" cy="132" r="5" fill="#f3c84b"/><circle cx="100" cy="136" r="5" fill="#fff"/><circle cx="150" cy="132" r="5" fill="#f3c84b"/>' +
        '<rect x="0" y="154" width="200" height="12" rx="6" fill="#d4a84b"/></svg>', "sp-kuchen", { width: breite + "px" });
      const gr = Math.min(W * 0.26, 120);
      const traeger = [
        figur(capySeite({ hut: "party", hutFarbe: "#9be3b0" }), "sp-traeger", { width: gr + "px" }),
        figur(capySeite({ hut: "party", hutFarbe: "#f3c84b" }), "sp-traeger sp-gespiegelt", { width: gr + "px" }),
      ];
      kuchen.animate([{ transform: "translate(-50%, 130%)" }, { transform: "translate(-50%, 0)" }], { duration: 2600, delay: 600, easing: "cubic-bezier(.2,.8,.3,1)", fill: "both" });
      traeger[0].animate([{ left: -gr + "px" }, { left: "calc(50% - " + (breite / 2 + gr * 0.85) + "px)" }], { duration: 2600, delay: 600, easing: "ease-out", fill: "both" });
      traeger[1].animate([{ left: W + "px" }, { left: "calc(50% + " + (breite / 2 - gr * 0.15) + "px)" }], { duration: 2600, delay: 600, easing: "ease-out", fill: "both" });
      traeger.forEach((t) => t.firstChild.animate([{ transform: "translateY(0)" }, { transform: "translateY(-6px)" }], { duration: 260, direction: "alternate", iterations: 10 }));
      const farben = ["#e85d7e", "#f3c84b", "#7cc4f0", "#9be3b0", "#b39ddb"];
      spaeter(3300, () => {
        for (let i = 0; i < 8; i++) {
          const b = figur('<svg viewBox="0 0 60 90"><path d="M30 60 Q26 75 30 90" stroke="#9d8a90" fill="none"/><ellipse cx="30" cy="30" rx="24" ry="29" fill="' + farben[i % 5] + '"/><ellipse cx="22" cy="20" rx="6" ry="9" fill="#fff" opacity=".35"/></svg>',
            "sp-ballon-frei", { left: zufall(2, 92) + "%", width: zufall(40, 64) + "px" });
          b.animate([{ transform: "translateY(0)" }, { transform: "translateY(-" + (H + 200) + "px)" }], { duration: zufall(5500, 8000), delay: i * 250, easing: "ease-in", fill: "both" });
        }
        partikel(W / 2, H * 0.5, ["♥", "✨", "🎉"], 16, 140, ["#e85d7e", "#f3c84b"]);
      });

      // Zweiter Akt: Ständchen, dann wird es Nacht
      spaeter(8200, () => {
        sagBlase("Happy Birthday to you … 🎶", { left: W / 2 + "px", top: H * 0.28 + "px" }, 2200);
        for (let k = 0; k < 6; k++) spaeter(k * 450, () => partikel(W / 2 + zufall(-W * 0.2, W * 0.2), H * 0.5, ["♪", "♫"], 4, 60, ["#9d2449", "#e85d7e"]));
      });
      const nacht = document.createElement("div");
      nacht.className = "sp-figur sp-nacht sp-abend";
      nacht.style.opacity = "0";
      buehne.prepend(nacht);
      const mond = figur('<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="22" fill="#fff8dc"/><circle cx="40" cy="24" r="20" fill="#2a1840"/></svg>', "sp-mond", { left: W * 0.76 + "px", top: H + "px", width: Math.min(W * 0.18, 80) + "px", visibility: "hidden" });
      spaeter(12200, () => {
        nacht.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 2200, fill: "forwards" });
        mond.style.visibility = "visible";
        mond.animate([{ transform: "translateY(0)" }, { transform: "translateY(-" + H * 0.85 + "px)" }], { duration: 3000, easing: "ease-out", fill: "forwards" });
        banner.firstChild.textContent = "Noch einmal schlafen 🌙";
        banner.animate([{ transform: "translateX(-50%) scaleX(1)" }, { transform: "translateX(-50%) scaleX(0)" }, { transform: "translateX(-50%) scaleX(1)" }], { duration: 900 });
        for (let k = 0; k < 24; k++) {
          const st = figur("✦", "sp-stern-klein", { left: zufall(4, 96) + "%", top: zufall(4, 50) + "%" });
          st.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0.4 }, { opacity: 1 }], { duration: zufall(1800, 3000), delay: zufall(800, 3000), iterations: 3, fill: "both" });
        }
      });
      spaeter(15600, () => {
        sagBlase("Gute Nacht, Toni. Bis morgen 💤", { left: W / 2 + "px", top: H * 0.3 + "px" }, 2600);
        traeger.forEach((t) => t.firstChild.animate([{ transform: "rotate(0)" }, { transform: "rotate(-6deg) translateY(4px)" }], { duration: 900, fill: "forwards" }));
        for (let k = 0; k < 5; k++) spaeter(k * 700, () => partikel(W / 2 + zufall(-W * 0.25, W * 0.25), H * 0.62, ["z", "Z"], 3, 50, ["#cfd6ff", "#fff"]));
      });
      spaeter(19200, () => regen(["✦", "♥"], 24, ["#fff8dc", "#ff8fab"], 1800, 16));
    } },
  };

  /* ---------- Bühne und Ablauf ---------- */
  function heutigeSzene() {
    if (!api.bereit() || api.phase() !== "warten") return null;
    const d = api.datum();
    if (d.monat !== 11 || !SZENEN[d.tag]) return null;
    return d.tag;
  }

  const knopf = document.createElement("button");
  knopf.type = "button";
  knopf.className = "special-knopf";
  knopf.hidden = true;
  knopf.textContent = "🐹 Capy-Special nochmal ansehen";
  intro.appendChild(knopf);

  let laeuft = false;
  function spiele(tag) {
    const s = SZENEN[tag];
    if (!s || laeuft) return;
    laeuft = true;
    knopf.hidden = true;
    const rahmen = document.createElement("div");
    rahmen.className = "special-buehne";
    intro.appendChild(rahmen);
    const titel = document.createElement("p");
    titel.className = "special-titel";
    titel.textContent = s.titel;
    rahmen.appendChild(titel);
    // Die Szene spielt etwas über dem unteren Bildschirmrand
    buehne = document.createElement("div");
    buehne.className = "special-raum";
    rahmen.appendChild(buehne);
    W = buehne.offsetWidth || window.innerWidth;
    H = buehne.offsetHeight || window.innerHeight;
    // kleines X oben rechts zum vorzeitigen Beenden
    const zu = document.createElement("button");
    zu.type = "button";
    zu.className = "special-zu";
    zu.setAttribute("aria-label", "Capy-Special beenden");
    zu.textContent = "✕";
    rahmen.appendChild(zu);
    let beendet = false;
    zu.addEventListener("click", () => ende());
    if (ruhig) {
      spaeter(4000, ende);
    } else {
      try { s.spiel(); } catch (_) { /* eine Szene darf nie die Seite stören */ }
      spaeter(s.dauer, ende);
    }
    function ende() {
      if (beendet) return;
      beendet = true;
      const b = rahmen;
      b.classList.add("vorbei");
      setTimeout(() => b.remove(), 700);
      timer.forEach(clearTimeout); timer = [];
      laeuft = false;
      if (heutigeSzene()) knopf.hidden = false;
    }
  }
  knopf.addEventListener("click", () => { const t = heutigeSzene(); if (t) spiele(t); });

  // Einmal automatisch abspielen, sobald die Zeit vom Server da ist
  let gestartet = false;
  const warte = setInterval(() => {
    if (!api.bereit()) return;
    const t = heutigeSzene();
    if (!t) { if (api.phase() !== "laden") clearInterval(warte); knopf.hidden = true; return; }
    if (!gestartet) {
      gestartet = true;
      // bei einer Zeitreise zu einer bestimmten Entdeckung startet die Szene nicht von selbst
      const zr = window.adventkalender.zeitreise;
      if (!(zr && zr.aufgabe())) setTimeout(() => spiele(t), 900);
    }
    else if (!laeuft && api.phase() !== "warten") knopf.hidden = true;
  }, 300);

  window.adventkalender.spieleSpecial = spiele;
  window.adventkalender.capy = { seite: capySeiteInhalt, front: capyFrontInhalt };
})();
