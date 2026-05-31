// Zeichnet das Fußballfeld: Rasen-Streifen, Außenlinien, Mittellinie,
// Mittelkreis, Strafräume, Torräume, Elfmeterpunkte und Tore.
// Alles in Welt-Koordinaten; die Kamera-Translation passiert im Game-Loop.

import { FIELD, MARGIN, WORLD, COLORS, PX_PER_M } from "./config.js?v=s";

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
