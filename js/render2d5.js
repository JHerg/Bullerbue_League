// 2.5D-Renderer (Prototyp): zeichnet dieselbe Match-Simulation in einer
// TV-Schrägsicht (Perspektive) mit procedural animierten, laufenden Spielern.
// Nutzt KEINE externen Assets. Werte oben sind bewusst zum Tunen gedacht.

import { WORLD, FIELD, MARGIN, GOAL, PLAYER, PX_PER_M } from "./config.js?v=m";

// ---- Tuning-Parameter (dürfen wir nach Sichtprobe anpassen) ----
const VIEW = {
  hscale: 0.62,     // horizontale Skalierung (Bildschirm-px pro Welt-px bei Tiefe=1)
  scaleFar: 0.55,   // Größenfaktor an der fernen Linie
  scaleNear: 1.15,  // Größenfaktor an der nahen Linie
  horizon: 0.16,    // Bildanteil bis zur fernen Auslinie
  ground: 0.72,     // Bildanteil von ferner bis naher Auslinie
  figure: 46,       // Spieler-Höhe in px bei Größenfaktor 1
};

const COLORS = {
  surround: "#0a3d0a",
  grassA: "#2e7d32",
  grassB: "#359a3a",
  line: "rgba(255,255,255,0.9)",
};

const phases = new WeakMap(); // Lauf-Animationsphase pro Spieler

// Erzeugt eine Projektionsfunktion für den aktuellen Frame.
function makeProjector(w, h, camX) {
  const horizonY = h * VIEW.horizon;
  const groundH = h * VIEW.ground;
  return function project(wx, wy) {
    const t = Math.max(0, Math.min(1, wy / WORLD.height)); // 0 fern .. 1 nah
    const f = VIEW.scaleFar + (VIEW.scaleNear - VIEW.scaleFar) * t;
    const sx = w / 2 + (wx - camX) * VIEW.hscale * f;
    const sy = horizonY + t * groundH;
    return { sx, sy, f };
  };
}

export function render(ctx, w, h, match, camX, dtMs) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = COLORS.surround;
  ctx.fillRect(0, 0, w, h);

  const project = makeProjector(w, h, camX);
  drawPitch(ctx, project);

  // Alle Objekte nach Tiefe sortiert zeichnen (fern -> nah).
  const ents = match.allPlayers.map((p) => ({ p, y: p.y })).concat([{ ball: match.ball, y: match.ball.y }]);
  ents.sort((a, b) => a.y - b.y);
  for (const e of ents) {
    if (e.ball) drawBall(ctx, project, e.ball);
    else drawPlayer(ctx, project, e.p, e.p === match.userPlayer, dtMs);
  }
}

// ---------- Spielfeld ----------
function drawPitch(ctx, project) {
  const x0 = MARGIN, x1 = MARGIN + FIELD.width;
  const y0 = MARGIN, y1 = MARGIN + FIELD.height;

  // Rasen als Trapez (Tiefen-Streifen).
  const bands = 14;
  for (let i = 0; i < bands; i++) {
    const ya = y0 + (FIELD.height * i) / bands;
    const yb = y0 + (FIELD.height * (i + 1)) / bands;
    const tl = project(x0, ya), tr = project(x1, ya);
    const bl = project(x0, yb), br = project(x1, yb);
    ctx.beginPath();
    ctx.moveTo(tl.sx, tl.sy); ctx.lineTo(tr.sx, tr.sy);
    ctx.lineTo(br.sx, br.sy); ctx.lineTo(bl.sx, bl.sy);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? COLORS.grassA : COLORS.grassB;
    ctx.fill();
  }

  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 2;
  // Außenlinie
  poly(ctx, project, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], true);
  // Mittellinie
  line(ctx, project, (x0 + x1) / 2, y0, (x0 + x1) / 2, y1);
  // Mittelkreis
  circle(ctx, project, (x0 + x1) / 2, (y0 + y1) / 2, 9.15 * PX_PER_M);

  // Strafräume + Tore
  drawBox(ctx, project, x0, y0, y1, 1);
  drawBox(ctx, project, x1, y0, y1, -1);
}

function drawBox(ctx, project, lineX, y0, y1, dir) {
  const cy = (y0 + y1) / 2;
  const boxD = 16.5 * PX_PER_M, boxH = 40.3 * PX_PER_M;
  const sixD = 5.5 * PX_PER_M, sixH = 18.3 * PX_PER_M;
  const goalH = GOAL.height, goalD = 2 * PX_PER_M;
  poly(ctx, project, [
    [lineX, cy - boxH / 2], [lineX + dir * boxD, cy - boxH / 2],
    [lineX + dir * boxD, cy + boxH / 2], [lineX, cy + boxH / 2],
  ], false);
  poly(ctx, project, [
    [lineX, cy - sixH / 2], [lineX + dir * sixD, cy - sixH / 2],
    [lineX + dir * sixD, cy + sixH / 2], [lineX, cy + sixH / 2],
  ], false);
  ctx.save();
  ctx.lineWidth = 3;
  poly(ctx, project, [
    [lineX, cy - goalH / 2], [lineX - dir * goalD, cy - goalH / 2],
    [lineX - dir * goalD, cy + goalH / 2], [lineX, cy + goalH / 2],
  ], false);
  ctx.restore();
}

// ---------- Ball ----------
function drawBall(ctx, project, ball) {
  const { sx, sy, f } = project(ball.x, ball.y);
  const r = ball.radius * f * 1.2;
  ctx.beginPath();
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.ellipse(sx, sy, r * 1.1, r * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = "#fff";
  ctx.arc(sx, sy - r, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.stroke();
}

// ---------- Spieler (laufende Figur) ----------
function drawPlayer(ctx, project, p, highlighted, dtMs) {
  const { sx, sy, f } = project(p.x, p.y);
  const speed = Math.hypot(p.vx, p.vy);
  const stride = Math.min(1, speed / PLAYER.speed);

  // Lauf-Phase fortschreiben (steht = leichtes Wippen).
  let ph = phases.get(p) || 0;
  ph += (0.004 + stride * 0.02) * dtMs;
  phases.set(p, ph);

  const H = VIEW.figure * f;            // Figurhöhe
  const swing = Math.sin(ph) * stride;  // Bein-/Armausschlag
  const dirSign = p.facing.x < 0 ? -1 : 1;

  const footY = sy;
  const hipY = sy - H * 0.46;
  const shoulderY = sy - H * 0.80;
  const headY = sy - H * 0.92;
  const legSpread = H * 0.18;
  const armSpread = H * 0.16;

  const jersey = p.team.colors[0];
  const trim = p.team.colors[1];

  // Schatten
  ctx.beginPath();
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.ellipse(sx, footY, H * 0.22, H * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();

  // Auswahl-Ring (gesteuerter Spieler)
  if (highlighted) {
    ctx.beginPath();
    ctx.strokeStyle = "#ffeb3b";
    ctx.lineWidth = Math.max(2, H * 0.06);
    ctx.ellipse(sx, footY, H * 0.26, H * 0.11, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.lineCap = "round";

  // Beine (Shorts dunkel)
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = Math.max(2, H * 0.12);
  legLine(ctx, sx, hipY, sx + dirSign * (swing * legSpread), footY);
  legLine(ctx, sx, hipY, sx - dirSign * (swing * legSpread), footY);

  // Torso (Trikot)
  ctx.strokeStyle = jersey;
  ctx.lineWidth = Math.max(3, H * 0.22);
  legLine(ctx, sx, hipY, sx, shoulderY);

  // Arme (Trikotfarbe)
  ctx.strokeStyle = jersey;
  ctx.lineWidth = Math.max(2, H * 0.09);
  legLine(ctx, sx, shoulderY, sx - dirSign * (swing * armSpread), shoulderY + H * 0.28);
  legLine(ctx, sx, shoulderY, sx + dirSign * (swing * armSpread), shoulderY + H * 0.28);

  // Kopf
  ctx.beginPath();
  ctx.fillStyle = "#e8b58a";
  ctx.arc(sx, headY, H * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = trim;
  ctx.stroke();

  // Rückennummer auf dem Trikot
  ctx.fillStyle = trim;
  ctx.font = `bold ${Math.max(7, H * 0.18)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(p.number), sx, (hipY + shoulderY) / 2);
}

function legLine(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// ---------- Hilfen fürs Spielfeld ----------
function line(ctx, project, x1, y1, x2, y2) {
  const a = project(x1, y1), b = project(x2, y2);
  ctx.beginPath();
  ctx.moveTo(a.sx, a.sy);
  ctx.lineTo(b.sx, b.sy);
  ctx.stroke();
}
function poly(ctx, project, pts, close) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => {
    const s = project(x, y);
    if (i === 0) ctx.moveTo(s.sx, s.sy); else ctx.lineTo(s.sx, s.sy);
  });
  if (close) ctx.closePath();
  ctx.stroke();
}
function circle(ctx, project, cx, cy, r) {
  ctx.beginPath();
  const N = 28;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const s = project(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    if (i === 0) ctx.moveTo(s.sx, s.sy); else ctx.lineTo(s.sx, s.sy);
  }
  ctx.stroke();
}
