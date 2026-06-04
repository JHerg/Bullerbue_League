// Zeichnet das Fußballfeld: Rasen-Streifen, Außenlinien, Mittellinie,
// Mittelkreis, Strafräume, Torräume, Elfmeterpunkte und Tore.
// Alles in Welt-Koordinaten; die Kamera-Translation passiert im Game-Loop.

import { FIELD, MARGIN, WORLD, COLORS, PX_PER_M, GOAL, HALL } from "./config.js?v=h2";

// Komplette Hallen-Darstellung (kleines Feld, Parkett, Banden, Tore) ohne
// Zuschauer. Ersetzt drawPitch im Hallenmodus.
export function drawIndoorPitch(ctx) {
  const L = HALL.left, R = HALL.right, T = HALL.top, B = HALL.bottom;
  const w = R - L, h = B - T;

  // Dunkler Hallenhintergrund (Umlauf hinter den Banden)
  ctx.fillStyle = "#23262b";
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  // Parkettboden mit Dielen
  ctx.fillStyle = "#caa46a";
  ctx.fillRect(L, T, w, h);
  ctx.strokeStyle = "rgba(120,85,40,0.35)";
  ctx.lineWidth = 1;
  for (let x = L; x <= R; x += 22) {
    ctx.beginPath(); ctx.moveTo(x, T); ctx.lineTo(x, B); ctx.stroke();
  }
  // leichte Spielfeld-Einfärbung (Court-Bereich)
  ctx.fillStyle = "rgba(40,90,60,0.18)";
  ctx.fillRect(L, T, w, h);

  // Linien (weiß): Außenlinie, Mittellinie, Mittelkreis
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 2;
  ctx.strokeRect(L + 3, T + 3, w - 6, h - 6);
  ctx.beginPath(); ctx.moveTo((L + R) / 2, T + 3); ctx.lineTo((L + R) / 2, B - 3); ctx.stroke();
  ctx.beginPath(); ctx.arc((L + R) / 2, (T + B) / 2, 5 * PX_PER_M, 0, Math.PI * 2); ctx.stroke();

  // Torräume (kleine Halbkreise vor den Toren)
  const cy = (T + B) / 2, gr = 6 * PX_PER_M;
  ctx.beginPath(); ctx.arc(L + 3, cy, gr, -Math.PI / 2, Math.PI / 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(R - 3, cy, gr, Math.PI / 2, Math.PI * 1.5); ctx.stroke();

  // Tore (Netz) in der Bandenlücke
  const gh = HALL.goalHeight, gy0 = cy - gh / 2, gy1 = cy + gh / 2, gd = 14;
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.95)"; ctx.lineWidth = 2;
  ctx.strokeRect(L - gd, gy0, gd, gh);
  ctx.strokeRect(R, gy0, gd, gh);
  ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) { const yy = gy0 + (gh * i) / 4; line2(ctx, L - gd, yy, L, yy); line2(ctx, R, yy, R + gd, yy); }
  ctx.restore();

  drawIndoorBoards(ctx);
}

// Banden für den Hallenmodus: kräftiger Rahmen rings ums kleine Feld, mit
// Lücke am Tormaul (links/rechts).
export function drawIndoorBoards(ctx) {
  const L = HALL.left, R = HALL.right, T = HALL.top, B = HALL.bottom;
  const w = R - L, h = B - T, th = 7;
  const gh = HALL.goalHeight, cy = (T + B) / 2, gy0 = cy - gh / 2, gy1 = cy + gh / 2;
  ctx.fillStyle = "#dfe4ea";          // helle Bande
  ctx.fillRect(L - th, T - th, w + th * 2, th);      // oben
  ctx.fillRect(L - th, B, w + th * 2, th);           // unten
  ctx.fillRect(L - th, T - th, th, (gy0 - (T - th))); // links oben
  ctx.fillRect(L - th, gy1, th, (B + th) - gy1);      // links unten
  ctx.fillRect(R, T - th, th, (gy0 - (T - th)));      // rechts oben
  ctx.fillRect(R, gy1, th, (B + th) - gy1);           // rechts unten
  // farbige Werbe-Oberkante
  ctx.fillStyle = "rgba(30,90,200,0.8)";
  ctx.fillRect(L - th, T - th, w + th * 2, 2);
  ctx.fillRect(L - th, B + th - 2, w + th * 2, 2);
}

function line2(ctx, x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }

// Zuschauer-Teppich für die Top-Down-Ansicht: farbige Punkte im Randbereich
// rings ums Spielfeld. Deterministisch erzeugt (einmalig gecached) und mit
// leichtem Flackern, damit das Stadion lebendig wirkt.
let crowdDots = null;
function buildCrowd() {
  const dots = [];
  const blockColors = ["#c62828", "#1565c0", "#fdd835", "#ffffff", "#2e7d32", "#ef6c00"];
  let seed = 1337;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

  const band = MARGIN - 6;          // Tiefe der Tribüne
  const gap = 6;                    // Abstand der Sitze
  const ox = MARGIN, oy = MARGIN, fw = FIELD.width, fh = FIELD.height;

  // Hilfsfunktion: ein Rang entlang einer Kante füllen.
  const fillStrip = (x0, y0, x1, y1, rows, nx, ny) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const cols = Math.floor(len / gap);
    for (let r = 1; r <= rows; r++) {
      const blockBase = Math.floor(rnd() * blockColors.length);
      for (let c = 0; c < cols; c++) {
        if (rnd() < 0.06) continue; // Lücken
        const t = c / cols;
        const bx = x0 + (x1 - x0) * t + nx * (r * gap);
        const by = y0 + (y1 - y0) * t + ny * (r * gap);
        // Fan-Blöcke: in Abschnitten gleiche Farbe
        const block = Math.floor(c / 14);
        const col = blockColors[(blockBase + block) % blockColors.length];
        dots.push({ x: bx + (rnd() - 0.5) * 2, y: by + (rnd() - 0.5) * 2, c: col, ph: rnd() * 6.28 });
      }
    }
  };

  const rows = Math.max(3, Math.floor(band / gap));
  fillStrip(ox, oy - 2, ox + fw, oy - 2, rows, 0, -1);              // oben
  fillStrip(ox, oy + fh + 2, ox + fw, oy + fh + 2, rows, 0, 1);     // unten
  fillStrip(ox - 2, oy, ox - 2, oy + fh, rows, -1, 0);             // links
  fillStrip(ox + fw + 2, oy, ox + fw + 2, oy + fh, rows, 1, 0);    // rechts
  return dots;
}

export function drawCrowdTopDown(ctx, t = 0) {
  if (!crowdDots) crowdDots = buildCrowd();
  for (const d of crowdDots) {
    // leichtes Flackern (Stehen/Bewegen)
    const a = 0.75 + 0.25 * Math.sin(d.ph + t * 0.004);
    ctx.globalAlpha = a;
    ctx.fillStyle = d.c;
    ctx.fillRect(d.x, d.y, 3, 3);
  }
  ctx.globalAlpha = 1;
}

// Fake-Sponsoren für die Bandenwerbung (ausgedachte Namen).
export const SPONSORS = [
  { text: "BULLERBÜ BANK", bg: "#0d47a1", fg: "#ffffff" },
  { text: "FIKTIVA COLA", bg: "#c62828", fg: "#ffffff" },
  { text: "TORWERK AG", bg: "#1b5e20", fg: "#ffffff" },
  { text: "PAVLO REISEN", bg: "#f9a825", fg: "#1b1b1b" },
  { text: "JAJO SPORT", bg: "#000000", fg: "#ffd600" },
  { text: "ELVERA TELEKOM", bg: "#6a1b9a", fg: "#ffffff" },
  { text: "KICKMAXX", bg: "#00838f", fg: "#ffffff" },
  { text: "RASEN24", bg: "#2e7d32", fg: "#ffffff" },
];

// Bandenwerbung (Top-Down): farbige Werbetafeln direkt außerhalb der Längs-
// und Torlinien, Text entlang der Bande. Läuft langsam durch (Animation).
export function drawBoards(ctx, t = 0) {
  const ox = MARGIN, oy = MARGIN, fw = FIELD.width, fh = FIELD.height;
  const depth = 9;          // Höhe/Tiefe der Bande
  const seg = 150;          // Länge einer Tafel
  const off = (t * 0.02) % (seg * SPONSORS.length); // langsamer Durchlauf

  const board = (x, y, w, h, horizontal) => {
    ctx.save();
    // Auf die Bande clippen
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    const count = Math.ceil((horizontal ? w : h) / seg) + 2;
    for (let i = -1; i < count; i++) {
      const s = SPONSORS[((i % SPONSORS.length) + SPONSORS.length) % SPONSORS.length];
      let sx, sy, sw, sh;
      if (horizontal) { sx = x + i * seg - off; sy = y; sw = seg - 3; sh = h; }
      else { sx = x; sy = y + i * seg - off; sw = w; sh = seg - 3; }
      ctx.fillStyle = s.bg; ctx.fillRect(sx, sy, sw, sh);
      ctx.fillStyle = s.fg;
      ctx.font = `bold ${Math.floor(h * (horizontal ? 0.6 : 0.6))}px sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.save();
      ctx.translate(sx + sw / 2, sy + sh / 2);
      if (!horizontal) ctx.rotate(-Math.PI / 2);
      ctx.fillText(s.text, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  };

  // Längsseiten (oben/unten) und Torseiten (links/rechts), je knapp außerhalb der Linie.
  board(ox, oy - depth - 3, fw, depth, true);          // oben
  board(ox, oy + fh + 3, fw, depth, true);             // unten
  board(ox - depth - 3, oy, depth, fh, false);         // links
  board(ox + fw + 3, oy, depth, fh, false);            // rechts
}

export function drawPitch(ctx) {
  // Hintergrund (Auslaufzone)
  ctx.fillStyle = COLORS.out;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  const ox = MARGIN;          // Ursprung des Innenfelds
  const oy = MARGIN;
  const w = FIELD.width;
  const h = FIELD.height;

  // Rasen-Streifen
  const stripes = 18;
  const stripeW = w / stripes;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? COLORS.grassDark : COLORS.grassLight;
    ctx.fillRect(ox + i * stripeW, oy, stripeW + 1, h);
  }

  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 2;

  // Außenlinie
  ctx.strokeRect(ox, oy, w, h);

  // Mittellinie
  ctx.beginPath();
  ctx.moveTo(ox + w / 2, oy);
  ctx.lineTo(ox + w / 2, oy + h);
  ctx.stroke();

  // Mittelkreis (9,15 m Radius) + Anstoßpunkt
  const centerR = 9.15 * PX_PER_M;
  ctx.beginPath();
  ctx.arc(ox + w / 2, oy + h / 2, centerR, 0, Math.PI * 2);
  ctx.stroke();
  dot(ctx, ox + w / 2, oy + h / 2);

  // Strafräume + Torräume + Elfmeterpunkte + Tore auf beiden Seiten
  drawPenaltyArea(ctx, ox, oy, h, false); // links
  drawPenaltyArea(ctx, ox + w, oy, h, true); // rechts
}

function drawPenaltyArea(ctx, lineX, oy, h, mirror) {
  const dir = mirror ? -1 : 1;

  // Strafraum: 16,5 m tief, 40,3 m breit
  const boxDepth = 16.5 * PX_PER_M;
  const boxHeight = 40.3 * PX_PER_M;
  // Torraum: 5,5 m tief, 18,3 m breit
  const goalAreaDepth = 5.5 * PX_PER_M;
  const goalAreaHeight = 18.3 * PX_PER_M;
  // Tor: 7,32 m breit
  const goalHeight = 7.32 * PX_PER_M;
  const goalDepth = 2 * PX_PER_M;

  const cy = oy + h / 2;

  // Strafraum
  rect(ctx, lineX, cy - boxHeight / 2, dir * boxDepth, boxHeight);
  // Torraum
  rect(ctx, lineX, cy - goalAreaHeight / 2, dir * goalAreaDepth, goalAreaHeight);

  // Elfmeterpunkt (11 m)
  dot(ctx, lineX + dir * 11 * PX_PER_M, cy);

  // Strafraumbogen: Kreis um den Elfmeterpunkt, nur der Teil außerhalb
  // des Strafraums ist sichtbar. cos(theta) = (16,5 - 11) / 9,15 ≈ 0,601
  const penX = lineX + dir * 11 * PX_PER_M;
  const arcR = 9.15 * PX_PER_M;
  const theta = Math.acos((16.5 - 11) / 9.15); // ≈ 0,927 rad
  ctx.beginPath();
  if (mirror) {
    ctx.arc(penX, cy, arcR, Math.PI - theta, Math.PI + theta);
  } else {
    ctx.arc(penX, cy, arcR, -theta, theta);
  }
  ctx.stroke();

  // Tor (Netz-Kästchen)
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.lineWidth = 3;
  rect(ctx, lineX, cy - goalHeight / 2, -dir * goalDepth, goalHeight);
  ctx.restore();
}

function rect(ctx, x, y, w, h) {
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.stroke();
}

function dot(ctx, x, y) {
  ctx.beginPath();
  ctx.fillStyle = COLORS.line;
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();
}
