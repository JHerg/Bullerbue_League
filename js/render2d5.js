// 2.5D-Renderer (Prototyp): zeichnet dieselbe Match-Simulation in einer
// TV-Schrägsicht (Perspektive) mit procedural animierten, laufenden Spielern.
// Individuelle Spieler (Hautton/Haare/Statur), Torwart eigenes Trikot.
// Keine externen Assets. Werte im VIEW-Block sind zum Tunen gedacht.

import { WORLD, FIELD, MARGIN, GOAL, PLAYER, PX_PER_M } from "./config.js?v=o";

// ---- Tuning (nach Sichtprobe anpassbar) ----
const VIEW = {
  hscale: 0.95,     // horizontaler Zoom (höher = näher dran, Feld wirkt schmaler)
  scaleFar: 0.5,    // Größenfaktor an der fernen Linie
  scaleNear: 1.3,   // Größenfaktor an der nahen Linie (mehr Tiefe)
  horizon: 0.20,    // Bildanteil bis zur fernen Auslinie
  ground: 0.66,     // Bildanteil von ferner bis naher Auslinie
  figure: 52,       // Spieler-Basishöhe in px bei Größenfaktor 1
};

const COLORS = { surround: "#0a3d0a", grassA: "#2e7d32", grassB: "#359a3a", line: "rgba(255,255,255,0.9)" };
const SKIN = ["#f1c27d", "#e0ac69", "#c68642", "#8d5524", "#ffe0bd", "#a86b3c"];
const HAIR = ["#2b1b0e", "#141414", "#5a3a1a", "#d9b35c", "#7a7a7a", "#3b2f2f", "#a8522a"];
const GK_KIT = ["#00e676", "#0a3d0a"]; // Torwart hebt sich ab

const phases = new WeakMap();
const attrs = new WeakMap();

function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

function attrsFor(p) {
  let a = attrs.get(p);
  if (a) return a;
  const seed = hash(p.team.id + ":" + p.number);
  const r = (n) => ((seed >> n) & 0xff) / 255;
  a = {
    skin: SKIN[seed % SKIN.length],
    hair: HAIR[(seed >> 3) % HAIR.length],
    hasHair: r(11) > 0.18,
    height: 0.9 + r(5) * 0.25,   // Körpergröße
    build: 0.85 + r(7) * 0.4,    // Statur (Strichbreite)
    legPhase: r(13) * Math.PI,   // leicht unterschiedlicher Laufrhythmus
  };
  attrs.set(p, a);
  return a;
}

function makeProjector(w, h, camX) {
  const horizonY = h * VIEW.horizon, groundH = h * VIEW.ground;
  return function (wx, wy) {
    const t = Math.max(0, Math.min(1, wy / WORLD.height));
    const f = VIEW.scaleFar + (VIEW.scaleNear - VIEW.scaleFar) * t;
    return { sx: w / 2 + (wx - camX) * VIEW.hscale * f, sy: horizonY + t * groundH, f };
  };
}

export function render(ctx, w, h, match, camX, dtMs) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = COLORS.surround;
  ctx.fillRect(0, 0, w, h);

  const project = makeProjector(w, h, camX);
  drawPitch(ctx, project);

  const ents = match.allPlayers.map((p) => ({ p, y: p.y })).concat([{ ball: match.ball, y: match.ball.y }]);
  ents.sort((a, b) => a.y - b.y);
  for (const e of ents) {
    if (e.ball) drawBall(ctx, project, e.ball);
    else drawPlayer(ctx, project, e.p, e.p === match.userPlayer, dtMs);
  }
}

// ---------- Spielfeld ----------
function drawPitch(ctx, project) {
  const x0 = MARGIN, x1 = MARGIN + FIELD.width, y0 = MARGIN, y1 = MARGIN + FIELD.height;
  const bands = 14;
  for (let i = 0; i < bands; i++) {
    const ya = y0 + (FIELD.height * i) / bands, yb = y0 + (FIELD.height * (i + 1)) / bands;
    const tl = project(x0, ya), tr = project(x1, ya), bl = project(x0, yb), br = project(x1, yb);
    ctx.beginPath();
    ctx.moveTo(tl.sx, tl.sy); ctx.lineTo(tr.sx, tr.sy); ctx.lineTo(br.sx, br.sy); ctx.lineTo(bl.sx, bl.sy);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? COLORS.grassA : COLORS.grassB;
    ctx.fill();
  }
  ctx.strokeStyle = COLORS.line; ctx.lineWidth = 2;
  poly(ctx, project, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], true);
  line(ctx, project, (x0 + x1) / 2, y0, (x0 + x1) / 2, y1);
  circle(ctx, project, (x0 + x1) / 2, (y0 + y1) / 2, 9.15 * PX_PER_M);
  drawBox(ctx, project, x0, y0, y1, 1);
  drawBox(ctx, project, x1, y0, y1, -1);
}

function drawBox(ctx, project, lineX, y0, y1, dir) {
  const cy = (y0 + y1) / 2;
  const boxD = 16.5 * PX_PER_M, boxH = 40.3 * PX_PER_M, sixD = 5.5 * PX_PER_M, sixH = 18.3 * PX_PER_M;
  const goalH = GOAL.height, goalD = 2 * PX_PER_M;
  poly(ctx, project, [[lineX, cy - boxH / 2], [lineX + dir * boxD, cy - boxH / 2], [lineX + dir * boxD, cy + boxH / 2], [lineX, cy + boxH / 2]], false);
  poly(ctx, project, [[lineX, cy - sixH / 2], [lineX + dir * sixD, cy - sixH / 2], [lineX + dir * sixD, cy + sixH / 2], [lineX, cy + sixH / 2]], false);
  ctx.save(); ctx.lineWidth = 3;
  poly(ctx, project, [[lineX, cy - goalH / 2], [lineX - dir * goalD, cy - goalH / 2], [lineX - dir * goalD, cy + goalH / 2], [lineX, cy + goalH / 2]], false);
  ctx.restore();
}

// ---------- Ball ----------
function drawBall(ctx, project, ball) {
  const { sx, sy, f } = project(ball.x, ball.y);
  const r = ball.radius * f * 1.2;
  ctx.beginPath(); ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.ellipse(sx, sy, r * 1.1, r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.fillStyle = "#fff"; ctx.arc(sx, sy - r, r, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 1; ctx.strokeStyle = "rgba(0,0,0,0.5)"; ctx.stroke();
}

// ---------- Spieler (individuell + laufanimiert) ----------
function drawPlayer(ctx, project, p, highlighted, dtMs) {
  const { sx, sy, f } = project(p.x, p.y);
  const a = attrsFor(p);
  const speed = Math.hypot(p.vx, p.vy);
  const stride = Math.min(1, speed / PLAYER.speed);

  let ph = phases.get(p) || a.legPhase;
  ph += (0.003 + stride * 0.03) * dtMs; // Schrittfrequenz steigt mit Tempo
  phases.set(p, ph);

  const H = VIEW.figure * f * a.height;
  const dirSign = p.facing.x < 0 ? -1 : 1;
  const bob = -Math.abs(Math.sin(ph)) * stride * H * 0.05;     // Auf-und-ab
  const lean = dirSign * stride * H * 0.16;                    // Vorlage beim Sprint

  const footY = sy;
  const hipX = sx, hipY = sy - H * 0.46 + bob;
  const shX = sx + lean * 0.5, shY = sy - H * 0.80 + bob;
  const headX = sx + lean, headY = sy - H * 0.95 + bob;

  const isGK = p.isKeeper;
  const jersey = isGK ? GK_KIT[0] : p.team.colors[0];
  const trim = isGK ? GK_KIT[1] : p.team.colors[1];
  const lw = (k) => Math.max(2, H * k * a.build);

  // Schatten
  ctx.beginPath(); ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.ellipse(sx, footY, H * 0.22, H * 0.09, 0, 0, Math.PI * 2); ctx.fill();

  // Auswahl-Ring
  if (highlighted) {
    ctx.beginPath(); ctx.strokeStyle = "#ffeb3b"; ctx.lineWidth = Math.max(2, H * 0.06);
    ctx.ellipse(sx, footY, H * 0.27, H * 0.11, 0, 0, Math.PI * 2); ctx.stroke();
  }

  ctx.lineCap = "round"; ctx.lineJoin = "round";

  // Beine (zweigliedrig: Hüfte -> Knie -> Fuß, gegenläufig)
  ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = lw(0.13);
  drawLeg(ctx, hipX, hipY, footY, dirSign, stride, H, ph);
  drawLeg(ctx, hipX, hipY, footY, dirSign, stride, H, ph + Math.PI);

  // Arme (Schulter -> Ellbogen -> Hand, gegenläufig zu Beinen)
  ctx.strokeStyle = jersey; ctx.lineWidth = lw(0.09);
  drawArm(ctx, shX, shY, dirSign, stride, H, ph + Math.PI, a.skin);
  drawArm(ctx, shX, shY, dirSign, stride, H, ph, a.skin);

  // Torso
  ctx.strokeStyle = jersey; ctx.lineWidth = lw(0.24);
  seg(ctx, hipX, hipY, shX, shY);

  // Kopf + Haare
  ctx.beginPath(); ctx.fillStyle = a.skin; ctx.arc(headX, headY, H * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.stroke();
  if (a.hasHair) {
    ctx.beginPath(); ctx.fillStyle = a.hair;
    ctx.arc(headX, headY, H * 0.12, Math.PI * 1.05, Math.PI * 1.95);
    ctx.fill();
  }

  // Rückennummer
  ctx.fillStyle = trim; ctx.font = `bold ${Math.max(7, H * 0.17)}px sans-serif`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(String(p.number), (hipX + shX) / 2, (hipY + shY) / 2);
}

function drawLeg(ctx, hipX, hipY, footY, dirSign, stride, H, lp) {
  const s = Math.sin(lp);
  const swing = s * stride;
  const footX = hipX + dirSign * swing * H * 0.22;
  const lift = Math.max(0, s) * stride * H * 0.14;
  const fy = footY - lift;
  const kneeX = (hipX + footX) / 2 + dirSign * H * 0.04;
  const kneeY = (hipY + fy) / 2 + H * 0.05; // leichte Beuge
  seg(ctx, hipX, hipY, kneeX, kneeY);
  seg(ctx, kneeX, kneeY, footX, fy);
}

function drawArm(ctx, shX, shY, dirSign, stride, H, ap, skin) {
  const s = Math.sin(ap);
  const handX = shX + dirSign * s * stride * H * 0.18;
  const handY = shY + H * 0.30 - Math.max(0, -s) * stride * H * 0.05;
  const elbowX = (shX + handX) / 2;
  const elbowY = (shY + handY) / 2 + H * 0.02;
  seg(ctx, shX, shY, elbowX, elbowY);
  seg(ctx, elbowX, elbowY, handX, handY);
}

function seg(ctx, x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }

// ---------- Spielfeld-Hilfen ----------
function line(ctx, project, x1, y1, x2, y2) { const a = project(x1, y1), b = project(x2, y2); ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke(); }
function poly(ctx, project, pts, close) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => { const s = project(x, y); if (i === 0) ctx.moveTo(s.sx, s.sy); else ctx.lineTo(s.sx, s.sy); });
  if (close) ctx.closePath();
  ctx.stroke();
}
function circle(ctx, project, cx, cy, r) {
  ctx.beginPath(); const N = 28;
  for (let i = 0; i <= N; i++) { const ang = (i / N) * Math.PI * 2; const s = project(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r); if (i === 0) ctx.moveTo(s.sx, s.sy); else ctx.lineTo(s.sx, s.sy); }
  ctx.stroke();
}
