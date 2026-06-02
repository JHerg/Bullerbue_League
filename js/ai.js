// Gegner- & Mitspieler-KI. Liefert pro Frame eine Zielrichtung für einen
// Spieler und entscheidet über Schuss/Pass. Das Verhalten wird über das
// Schwierigkeitsprofil (Tempo, Reaktion, Präzision, Entschlossenheit, Pressing)
// skaliert.
//
// computeAI(player, ctx) -> { dir:{x,y}, kick: null | {dirX,dirY,power} }
//
// ctx = { ball, difficulty, isChaser, isPossessor, teammates, opponents, dt }

import { MARGIN, FIELD, GOAL, KICK } from "./config.js?v=f2";

const FIELD_CX = MARGIN + FIELD.width / 2;
const FIELD_CY = MARGIN + FIELD.height / 2;

function steer(player, tx, ty, deadzone = 6) {
  const dx = tx - player.x;
  const dy = ty - player.y;
  const d = Math.hypot(dx, dy);
  if (d < deadzone) return { x: 0, y: 0 };
  return { x: dx / d, y: dy / d };
}

function nearestDist(x, y, list) {
  let best = Infinity;
  for (const p of list) {
    const d = Math.hypot(p.x - x, p.y - y);
    if (d < best) best = d;
  }
  return best;
}

// Richtung mit Zielfehler versehen (geringere Präzision = größerer Fehler).
function aimWithNoise(dx, dy, accuracy) {
  const len = Math.hypot(dx, dy) || 1;
  let a = Math.atan2(dy, dx);
  a += (Math.random() - 0.5) * (1 - accuracy) * 0.9;
  return { x: Math.cos(a), y: Math.sin(a) };
}

export function computeAI(player, ctx) {
  const { ball, difficulty } = ctx;
  const team = player.team;
  // Geometrie: aus ctx.geo (z. B. Halle) oder Standard-Feld.
  const geo = ctx.geo || {
    left: MARGIN, right: MARGIN + FIELD.width, top: MARGIN, bottom: MARGIN + FIELD.height,
    cx: FIELD_CX, cy: FIELD_CY, goalH: GOAL.height,
  };
  const oppGoalX = team.attackRight ? geo.right : geo.left;
  const ownGoalX = team.attackRight ? geo.left : geo.right;
  const goalY = geo.cy;

  // -------- Torwart --------
  if (player.isKeeper) {
    if (ctx.isPossessor) {
      // Ball gefangen -> kontrolliert nach vorn abschlagen (zum Mitspieler, sonst lang).
      const mate = bestPassOption(player, ctx);
      const tx = mate ? mate.x : oppGoalX;
      const ty = mate ? mate.y : goalY;
      const aim = aimWithNoise(tx - player.x, ty - player.y, difficulty.passAccuracy);
      return { dir: { x: 0, y: 0 }, kick: { dirX: aim.x, dirY: aim.y, power: KICK.shootPower } };
    }

    // Position auf einer kurzen Linie vor dem eigenen Tor.
    const lineX = ownGoalX + (team.attackRight ? 26 : -26);
    const half = geo.goalH / 2;

    // Standard: Ball-Höhe verfolgen, auf Tormaul begrenzt.
    let ty = clamp(ball.y, goalY - half, goalY + half);

    // Fliegt der Ball aufs Tor zu, den voraussichtlichen Kreuzungspunkt abdecken.
    const towardOwn = team.attackRight ? ball.vx < -25 : ball.vx > 25;
    const distX = Math.abs(ball.x - lineX);
    if (towardOwn && distX < 460) {
      const t = distX / Math.max(40, Math.abs(ball.vx));
      const projY = ball.y + ball.vy * t;
      ty = clamp(projY, goalY - half, goalY + half);
    }

    // Nur bei sehr nahem Ball vor dem Tor herauslaufen (1-gegen-1).
    const distBall = Math.hypot(ball.x - player.x, ball.y - player.y);
    const inFront = team.attackRight ? ball.x < lineX + 150 : ball.x > lineX - 150;
    if (distBall < 75 && inFront) {
      return { dir: steer(player, ball.x, ball.y, 2), kick: null };
    }
    return { dir: steer(player, lineX, ty, 2), kick: null };
  }

  // -------- Spieler hat den Ball --------
  if (ctx.isPossessor) {
    const distGoal = Math.hypot(oppGoalX - player.x, goalY - player.y);
    const pressure = nearestDist(player.x, player.y, ctx.opponents);

    // In Schussreichweite -> abschließen.
    if (distGoal < difficulty.shootRange) {
      const aim = aimWithNoise(oppGoalX - player.x, goalY - player.y, difficulty.passAccuracy);
      return { dir: { x: 0, y: 0 }, kick: { dirX: aim.x, dirY: aim.y, power: KICK.shootPower } };
    }

    // Unter Druck: nach vorn passen, wenn ein Mitspieler frei steht.
    const mate = bestPassOption(player, ctx);
    if (mate && (pressure < 36 || Math.random() < difficulty.decisiveness * difficulty.decisiveness)) {
      const dx = mate.x - player.x;
      const dy = mate.y - player.y;
      const aim = aimWithNoise(dx, dy, difficulty.passAccuracy);
      const power = Math.min(KICK.passPowerMax, KICK.passPower + Math.hypot(dx, dy) * KICK.passPerPx);
      return { dir: { x: 0, y: 0 }, kick: { dirX: aim.x, dirY: aim.y, power } };
    }

    // Sonst Richtung Tor dribbeln (leicht zur Tormitte ziehen).
    return { dir: steer(player, oppGoalX, goalY * 0.5 + player.y * 0.5), kick: null };
  }

  // -------- Ohne Ball: Ball erobern (designierter Jäger) --------
  if (ctx.isChaser) {
    // Auf den vorausberechneten Ballpunkt zulaufen.
    const lead = 0.16 * (1 - difficulty.reaction);
    return { dir: steer(player, ball.x + ball.vx * lead, ball.y + ball.vy * lead), kick: null };
  }

  // -------- Ohne Ball: Formation halten, zum Ball verschieben --------
  const teamHasBall = ball.lastTouchTeam === team;
  const press = difficulty.press;

  const fw = geo.right - geo.left;
  const shiftMax = fw < 800 ? 70 : 130;   // Halle: kleinere Verschiebung
  let shiftX = clamp((ball.x - geo.cx) * 0.18 * press, -shiftMax, shiftMax);
  let shiftY = clamp((ball.y - geo.cy) * 0.18 * press, -shiftMax * 0.7, shiftMax * 0.7);

  // In Ballbesitz schieben Offensivkräfte stärker nach vorn.
  if (teamHasBall && isAttacker(player.role)) {
    shiftX += team.attackRight ? 40 : -40;
  }

  const tx = clamp(player.homeX + shiftX, geo.left + 10, geo.right - 10);
  const ty = clamp(player.homeY + shiftY, geo.top + 10, geo.bottom - 10);
  return { dir: steer(player, tx, ty), kick: null };
}

function isAttacker(role) {
  return ["ST", "LA", "RA", "OM", "LM", "RM", "ANG"].includes(role);
}

// Bester Anspielpartner: möglichst weit vorn und nicht eng gedeckt.
function bestPassOption(player, ctx) {
  const team = player.team;
  const forward = team.attackRight ? 1 : -1;
  let best = null;
  let bestScore = -Infinity;

  for (const mate of ctx.teammates) {
    if (mate === player || mate.isKeeper) continue;
    const dx = mate.x - player.x;
    const dy = mate.y - player.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 40 || dist > 380) continue;

    const progress = (mate.x - player.x) * forward; // wie viel weiter vorn
    if (progress < -20) continue;

    const open = nearestDist(mate.x, mate.y, ctx.opponents); // freier Raum
    const score = progress + open * 1.5;
    if (score > bestScore) { bestScore = score; best = mate; }
  }
  return best;
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
