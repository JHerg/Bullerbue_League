// 2.5D-Renderer (Prototyp): TV-Schrägsicht mit procedural animierten,
// gegliederten Spielern (gefüllte Körperteile, Vorwärts-Kinematik-Laufzyklus,
// Tiefen-Staffelung), Tornetzen, Eckbögen, Tribünen-Andeutung und Ball-Drall.
// Keine externen Assets. Tuning-Werte im VIEW-Block.

import { WORLD, FIELD, MARGIN, GOAL, PLAYER, PX_PER_M } from "./config.js?v=g2";
import { SPONSORS } from "./pitch.js?v=g2";

// ---- Tuning ----
const VIEW = {
  hscale: 0.98, scaleFar: 0.5, scaleNear: 1.32,
  horizon: 0.22, ground: 0.64, figure: 56,
};

const SKIN = ["#f1c27d", "#e0ac69", "#c68642", "#8d5524", "#ffe0bd", "#a86b3c"];
const HAIR = ["#241a10", "#121212", "#5a3a1a", "#d9b35c", "#6f6f6f", "#3b2f2f", "#a8522a"];
const BOOT = ["#101010", "#1a1333", "#102a1a", "#2a1010"];
const GK_KIT = ["#00e676", "#063d20"];

const phases = new WeakMap();
const attrs = new WeakMap();
const spins = new WeakMap();

function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function shade(hex, f) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, ((n >> 16) & 255) * f)) | 0;
  const g = Math.min(255, Math.max(0, ((n >> 8) & 255) * f)) | 0;
  const b = Math.min(255, Math.max(0, (n & 255) * f)) | 0;
  return `rgb(${r},${g},${b})`;
}

function attrsFor(p) {
  let a = attrs.get(p);
  if (a) return a;
  const seed = hash(p.team.id + ":" + p.number);
  const r = (n) => ((seed >>> n) & 0xff) / 255;
  // Statur: per Override gesetzt (z. B. stämmiger Spieler) oder zufällig.
  const build = p.buildOverride ?? (0.88 + r(7) * 0.34);
  a = {
    skin: SKIN[seed % SKIN.length],
    hair: HAIR[(seed >>> 3) % HAIR.length],
    boot: BOOT[(seed >>> 6) % BOOT.length],
    hasHair: r(11) > 0.16,
    // Kräftige Spieler wirken etwas kleiner/gedrungener.
    height: (0.9 + r(5) * 0.26) * (build > 1.2 ? 0.94 : 1),
    build,
    legPhase: r(13) * Math.PI * 2,
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
  const project = makeProjector(w, h, camX);
  drawStands(ctx, w, h, render._t = (render._t || 0) + dtMs);
  drawPitch(ctx, project, w, h);

  const ents = match.allPlayers.map((p) => ({ p, y: p.y })).concat([{ ball: match.ball, y: match.ball.y }]);
  ents.sort((a, b) => a.y - b.y);
  for (const e of ents) {
    if (e.ball) drawBall(ctx, project, e.ball, dtMs);
    else drawPlayer(ctx, project, e.p, e.p === match.userPlayer, dtMs);
  }
}

// ---------- Hintergrund / Tribüne (erkennbare Zuschauer) ----------
const STAND_COLORS = ["#c62828", "#1565c0", "#fdd835", "#ffffff", "#2e7d32", "#ef6c00", "#6a1b9a"];
function drawStands(ctx, w, h, tMs = 0) {
  const horizonY = h * VIEW.horizon;
  // Betonkonstruktion + Dach
  let g = ctx.createLinearGradient(0, 0, 0, horizonY);
  g.addColorStop(0, "#0e1822"); g.addColorStop(1, "#33525f");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, horizonY);

  // Zuschauer in Reihen: nähere Reihen (unten) größer -> Tiefenwirkung.
  let seed = 20240530;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const rows = 9;
  for (let r = 0; r < rows; r++) {
    const ry = (horizonY * (r + 0.6)) / rows;       // y der Reihe
    const persp = 0.35 + 0.65 * (r / rows);          // hinten klein, vorn groß
    const headR = 1.6 + persp * 2.6;                 // Kopfradius
    const step = headR * 2.5;
    const blockBase = Math.floor(rnd() * STAND_COLORS.length);
    for (let x = (r % 2) * step * 0.5, c = 0; x < w; x += step, c++) {
      if (rnd() < 0.05) continue;                    // Lücken
      const block = Math.floor((x / w) * 8);
      const shirt = STAND_COLORS[(blockBase + block) % STAND_COLORS.length];
      // gelegentliches Aufstehen/Jubeln -> leichter Höhen-Offset
      const jump = (Math.sin(tMs * 0.003 + x * 0.05 + r) > 0.94) ? -headR * 0.8 : 0;
      const cx = x + (rnd() - 0.5) * step * 0.3;
      const cy = ry + jump;
      // Oberkörper (Trikot)
      ctx.fillStyle = shirt;
      ctx.fillRect(cx - headR * 0.9, cy, headR * 1.8, headR * 1.9);
      // Kopf
      ctx.fillStyle = "#e8b58a";
      ctx.beginPath(); ctx.arc(cx, cy - headR * 0.3, headR, 0, Math.PI * 2); ctx.fill();
    }
  }
  // Werbebanden-Streifen am Übergang Tribüne -> Rasen (animiert durchlaufend).
  const bh = Math.max(10, h * 0.035);              // Bandenhöhe
  const by = horizonY - bh;
  const segW = 168;
  const off = (tMs * 0.05) % (segW * SPONSORS.length);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, by, w, bh); ctx.clip();
  const count = Math.ceil(w / segW) + 2;
  for (let i = -1; i < count; i++) {
    const s = SPONSORS[((i % SPONSORS.length) + SPONSORS.length) % SPONSORS.length];
    const sx = i * segW - off;
    ctx.fillStyle = s.bg; ctx.fillRect(sx, by, segW - 4, bh);
    ctx.fillStyle = s.fg;
    ctx.font = `bold ${Math.floor(bh * 0.6)}px sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(s.text, sx + (segW - 4) / 2, by + bh / 2);
  }
  ctx.restore();
  // schmaler Schatten unter der Bande
  ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fillRect(0, horizonY, w, 3);
  ctx.fillStyle = "#0a3d0a"; ctx.fillRect(0, horizonY, w, h - horizonY);
}

// ---------- Spielfeld ----------
function drawPitch(ctx, project, w, h) {
  const x0 = MARGIN, x1 = MARGIN + FIELD.width, y0 = MARGIN, y1 = MARGIN + FIELD.height;
  const bands = 16;
  for (let i = 0; i < bands; i++) {
    const ya = y0 + (FIELD.height * i) / bands, yb = y0 + (FIELD.height * (i + 1)) / bands;
    const tl = project(x0, ya), tr = project(x1, ya), bl = project(x0, yb), br = project(x1, yb);
    ctx.beginPath();
    ctx.moveTo(tl.sx, tl.sy); ctx.lineTo(tr.sx, tr.sy); ctx.lineTo(br.sx, br.sy); ctx.lineTo(bl.sx, bl.sy);
    ctx.closePath();
    const shadeF = 0.82 + 0.18 * (i / bands); // ferne Streifen etwas dunkler
    ctx.fillStyle = (i % 2 === 0 ? shade("#2f7d33", shadeF) : shade("#37973c", shadeF));
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(255,255,255,0.92)"; ctx.lineWidth = 2;
  poly(ctx, project, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], true);
  line(ctx, project, (x0 + x1) / 2, y0, (x0 + x1) / 2, y1);
  circle(ctx, project, (x0 + x1) / 2, (y0 + y1) / 2, 9.15 * PX_PER_M);
  dot(ctx, project, (x0 + x1) / 2, (y0 + y1) / 2);
  // Eckbögen
  const cr = 1 * PX_PER_M;
  arc(ctx, project, x0, y0, cr, 0, Math.PI / 2);
  arc(ctx, project, x1, y0, cr, Math.PI / 2, Math.PI);
  arc(ctx, project, x1, y1, cr, Math.PI, Math.PI * 1.5);
  arc(ctx, project, x0, y1, cr, Math.PI * 1.5, Math.PI * 2);

  drawBox(ctx, project, x0, y0, y1, 1);
  drawBox(ctx, project, x1, y0, y1, -1);
}

function drawBox(ctx, project, lineX, y0, y1, dir) {
  const cy = (y0 + y1) / 2;
  const boxD = 16.5 * PX_PER_M, boxH = 40.3 * PX_PER_M, sixD = 5.5 * PX_PER_M, sixH = 18.3 * PX_PER_M;
  const goalH = GOAL.height, goalD = 2.4 * PX_PER_M;
  poly(ctx, project, [[lineX, cy - boxH / 2], [lineX + dir * boxD, cy - boxH / 2], [lineX + dir * boxD, cy + boxH / 2], [lineX, cy + boxH / 2]], false);
  poly(ctx, project, [[lineX, cy - sixH / 2], [lineX + dir * sixD, cy - sixH / 2], [lineX + dir * sixD, cy + sixH / 2], [lineX, cy + sixH / 2]], false);
  // Elfmeterpunkt + Strafraumbogen
  const penX = lineX + dir * 11 * PX_PER_M;
  dot(ctx, project, penX, cy);
  const th = Math.acos((16.5 - 11) / 9.15);
  arc(ctx, project, penX, cy, 9.15 * PX_PER_M, dir > 0 ? -th : Math.PI - th, dir > 0 ? th : Math.PI + th);

  // Tornetz
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 2.5;
  poly(ctx, project, [[lineX, cy - goalH / 2], [lineX - dir * goalD, cy - goalH / 2], [lineX - dir * goalD, cy + goalH / 2], [lineX, cy + goalH / 2]], false);
  ctx.strokeStyle = "rgba(255,255,255,0.28)"; ctx.lineWidth = 1;
  for (let i = 1; i < 6; i++) {
    const yy = cy - goalH / 2 + (goalH * i) / 6;
    line(ctx, project, lineX, yy, lineX - dir * goalD, yy);
  }
  for (let i = 1; i < 4; i++) {
    const xx = lineX - dir * (goalD * i) / 4;
    line(ctx, project, xx, cy - goalH / 2, xx, cy + goalH / 2);
  }
  ctx.restore();
}

// ---------- Ball ----------
function drawBall(ctx, project, ball, dtMs) {
  const { sx, sy, f } = project(ball.x, ball.y);
  const r = ball.radius * f * 1.25;
  let rot = spins.get(ball) || 0;
  rot += (ball.vx * 0.0006) * dtMs;
  spins.set(ball, rot);
  ctx.beginPath(); ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.ellipse(sx, sy, r * 1.15, r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
  const by = sy - r;
  ctx.beginPath(); ctx.fillStyle = "#fff"; ctx.arc(sx, by, r, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 1; ctx.strokeStyle = "rgba(0,0,0,0.45)"; ctx.stroke();
  // Drall-Flecken
  ctx.fillStyle = "rgba(20,20,20,0.85)";
  for (let i = 0; i < 3; i++) {
    const a = rot + i * 2.094;
    const px = sx + Math.cos(a) * r * 0.45, py = by + Math.sin(a) * r * 0.3;
    ctx.beginPath(); ctx.arc(px, py, r * 0.22, 0, Math.PI * 2); ctx.fill();
  }
}

// ---------- Spieler ----------
function drawPlayer(ctx, project, p, highlighted, dtMs) {
  const { sx, sy, f } = project(p.x, p.y);
  const a = attrsFor(p);
  const speed = Math.hypot(p.vx, p.vy);
  const stride = Math.min(1, speed / PLAYER.speed);

  let ph = phases.get(p); if (ph === undefined) ph = a.legPhase;
  ph += (0.004 + stride * 0.032) * dtMs;
  phases.set(p, ph);

  const H = VIEW.figure * f * a.height;
  const dir = p.facing.x < 0 ? -1 : 1;
  const amp = Math.max(0.06, stride);                       // Idle = minimal
  const bob = (-0.5 + 0.5 * Math.cos(2 * ph)) * stride * H * 0.06;
  const breathe = Math.sin(ph * 0.6) * (1 - stride) * H * 0.012;
  const lean = dir * stride * H * 0.12;

  const footY = sy;
  const hipX = sx, hipY = sy - H * 0.50 + bob + breathe;
  const shX = sx + lean, shY = sy - H * 0.82 + bob + breathe;
  const headX = sx + lean * 1.15, headY = sy - H * 0.96 + bob + breathe;

  const isGK = p.isKeeper;
  const jersey = isGK ? GK_KIT[0] : p.team.colors[0];
  const trim = isGK ? GK_KIT[1] : p.team.colors[1];
  const shorts = shade(jersey, 0.55);

  const L1 = H * 0.27, L2 = H * 0.27, UA = H * 0.19, FA = H * 0.17;
  const wThigh = Math.max(3, H * 0.13 * a.build), wShin = Math.max(2.5, H * 0.10 * a.build);
  const wUA = Math.max(2.5, H * 0.10 * a.build), wFA = Math.max(2, H * 0.085 * a.build);

  // Posen berechnen
  const legF = legPose(hipX, hipY, dir, ph, amp, L1, L2);
  const legB = legPose(hipX, hipY, dir, ph + Math.PI, amp, L1, L2);
  const armF = armPose(shX, shY, dir, ph + Math.PI, amp, UA, FA);
  const armB = armPose(shX, shY, dir, ph, amp, UA, FA);
  // hinten = Glied weiter "zurück" (kleinere lokale x in Blickrichtung)
  const fwd = (o) => dir * (o.footX !== undefined ? o.footX - hipX : o.handX - shX);
  const backLeg = fwd(legF) < fwd(legB) ? legF : legB;
  const frontLeg = backLeg === legF ? legB : legF;
  const backArm = fwd(armF) < fwd(armB) ? armF : armB;
  const frontArm = backArm === armF ? armB : armF;

  ctx.lineCap = "round"; ctx.lineJoin = "round";

  // Schatten + Auswahlring
  ctx.beginPath(); ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.ellipse(sx, footY, H * 0.24, H * 0.09, 0, 0, Math.PI * 2); ctx.fill();
  if (highlighted) {
    ctx.beginPath(); ctx.strokeStyle = "#ffeb3b"; ctx.lineWidth = Math.max(2, H * 0.06);
    ctx.ellipse(sx, footY, H * 0.30, H * 0.12, 0, 0, Math.PI * 2); ctx.stroke();
  }

  // HINTEN: Bein + Arm (abgedunkelt)
  drawLeg(ctx, backLeg, shade(shorts, 0.8), shade(a.skin, 0.8), shade(a.boot, 0.85), wThigh, wShin, H);
  drawArm(ctx, backArm, shade(jersey, 0.8), shade(a.skin, 0.8), wUA, wFA, H);

  // Shorts (Hüftband)
  ctx.fillStyle = shorts;
  roundRect(ctx, hipX - H * 0.15, hipY - H * 0.04, H * 0.30, H * 0.16, H * 0.05);

  // Torso (gefüllt, tailliert)
  drawTorso(ctx, hipX, hipY, shX, shY, H, jersey, trim, p.number);

  // VORNE: Arm + Bein
  drawArm(ctx, frontArm, jersey, a.skin, wUA, wFA, H);
  drawLeg(ctx, frontLeg, shorts, a.skin, a.boot, wThigh, wShin, H);

  // Kopf
  drawHead(ctx, headX, headY, H, a);
}

function legPose(hipX, hipY, dir, phase, amp, L1, L2) {
  const sw = Math.sin(phase);
  const thigh = sw * 0.62 * amp;
  const bend = (0.18 + 0.85 * Math.max(0, sw)) * amp + 0.05;
  const kneeLX = Math.sin(thigh) * L1;
  const kneeY = hipY + Math.cos(thigh) * L1;
  const shinAng = thigh - bend;
  const footLX = kneeLX + Math.sin(shinAng) * L2;
  const footY = kneeY + Math.cos(shinAng) * L2;
  return { hipX, hipY, kneeX: hipX + dir * kneeLX, kneeY, footX: hipX + dir * footLX, footY, dir };
}
function armPose(shX, shY, dir, phase, amp, UA, FA) {
  const sw = Math.sin(phase);
  const up = sw * 0.5 * amp + 0.12;
  const bend = 0.55 + 0.5 * Math.max(0, sw) * amp;
  const elLX = Math.sin(up) * UA;
  const elY = shY + Math.cos(up) * UA;
  const foreAng = up + bend;
  const handLX = elLX + Math.sin(foreAng) * FA;
  const handY = elY + Math.cos(foreAng) * FA;
  return { shX, shY, elbowX: shX + dir * elLX, elbowY: elY, handX: shX + dir * handLX, handY, dir };
}

function drawLeg(ctx, L, shortsCol, skinCol, bootCol, wT, wS, H) {
  ctx.strokeStyle = shortsCol; ctx.lineWidth = wT; seg(ctx, L.hipX, L.hipY, L.kneeX, L.kneeY);
  ctx.strokeStyle = skinCol; ctx.lineWidth = wS; seg(ctx, L.kneeX, L.kneeY, L.footX, L.footY);
  // Stutzen
  ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = wS * 0.9;
  seg(ctx, lerp(L.kneeX, L.footX, 0.55), lerp(L.kneeY, L.footY, 0.55), L.footX, L.footY);
  // Schuh
  ctx.fillStyle = bootCol;
  ctx.beginPath(); ctx.ellipse(L.footX + L.dir * H * 0.04, L.footY, H * 0.09, H * 0.045, 0, 0, Math.PI * 2); ctx.fill();
}
function drawArm(ctx, A, sleeveCol, skinCol, wU, wF, H) {
  ctx.strokeStyle = sleeveCol; ctx.lineWidth = wU; seg(ctx, A.shX, A.shY, A.elbowX, A.elbowY);
  ctx.strokeStyle = skinCol; ctx.lineWidth = wF; seg(ctx, A.elbowX, A.elbowY, A.handX, A.handY);
  ctx.fillStyle = skinCol; ctx.beginPath(); ctx.arc(A.handX, A.handY, wF * 0.7, 0, Math.PI * 2); ctx.fill();
}
function drawTorso(ctx, hipX, hipY, shX, shY, H, jersey, trim, number) {
  const hw = H * 0.13, sw = H * 0.19;
  ctx.beginPath();
  ctx.moveTo(hipX - hw, hipY);
  ctx.quadraticCurveTo(shX - sw * 1.05, (hipY + shY) / 2, shX - sw, shY);
  ctx.lineTo(shX + sw, shY);
  ctx.quadraticCurveTo(shX + sw * 1.05, (hipY + shY) / 2, hipX + hw, hipY);
  ctx.closePath();
  ctx.fillStyle = jersey; ctx.fill();
  ctx.lineWidth = 1.5; ctx.strokeStyle = shade(jersey, 0.7); ctx.stroke();
  // Kragen
  ctx.strokeStyle = trim; ctx.lineWidth = Math.max(1.5, H * 0.03);
  seg(ctx, shX - sw * 0.5, shY, shX + sw * 0.5, shY);
  // Nummer
  ctx.fillStyle = trim; ctx.font = `bold ${Math.max(7, H * 0.20)}px sans-serif`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(String(number), shX * 0.4 + hipX * 0.6, (hipY + shY) / 2);
}
function drawHead(ctx, x, y, H, a) {
  const r = H * 0.12;
  // Hals
  ctx.strokeStyle = a.skin; ctx.lineWidth = H * 0.07; ctx.lineCap = "round";
  seg(ctx, x, y + r * 0.6, x, y + r * 1.3);
  ctx.beginPath(); ctx.fillStyle = a.skin; ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 1.2; ctx.strokeStyle = shade(a.skin, 0.7); ctx.stroke();
  if (a.hasHair) {
    ctx.beginPath(); ctx.fillStyle = a.hair;
    ctx.arc(x, y - r * 0.1, r, Math.PI * 1.02, Math.PI * 1.98); ctx.fill();
    ctx.lineTo(x, y - r * 0.1);
  }
}

// ---------- Hilfen ----------
function seg(ctx, x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
function lerp(a, b, t) { return a + (b - a) * t; }
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); ctx.fill();
}
function line(ctx, project, x1, y1, x2, y2) { const a = project(x1, y1), b = project(x2, y2); ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke(); }
function poly(ctx, project, pts, close) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => { const s = project(x, y); if (i === 0) ctx.moveTo(s.sx, s.sy); else ctx.lineTo(s.sx, s.sy); });
  if (close) ctx.closePath();
  ctx.stroke();
}
function circle(ctx, project, cx, cy, r) { arc(ctx, project, cx, cy, r, 0, Math.PI * 2); }
function arc(ctx, project, cx, cy, r, a0, a1) {
  ctx.beginPath(); const N = 26;
  for (let i = 0; i <= N; i++) { const ang = a0 + (a1 - a0) * (i / N); const s = project(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r); if (i === 0) ctx.moveTo(s.sx, s.sy); else ctx.lineTo(s.sx, s.sy); }
  ctx.stroke();
}
function dot(ctx, project, x, y) { const s = project(x, y); ctx.beginPath(); ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.arc(s.sx, s.sy, 2.5, 0, Math.PI * 2); ctx.fill(); }
