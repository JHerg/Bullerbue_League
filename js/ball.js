// Der Ball: rollt mit Reibung, prallt an den Banden ab, wird vom ballführenden
// Spieler "geführt" (Dribbling) und kann geschossen/gepasst werden.

import { BALL, WORLD } from "./config.js?v=p";

export class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = BALL.radius;

    this.owner = null;          // Spieler, der den Ball aktuell führt
    this.lastTouchTeam = null;  // Team des letzten Ballkontakts (Ballbesitz)
    this.kickTimer = 0;         // > 0: Ball ist frei (kein Führen möglich)
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.owner = null;
    this.kickTimer = 0;
  }

  // Bestimmt anhand aller Spieler, wer den Ball führt, und lässt ihn ggf. mitlaufen.
  updatePossession(dt, players) {
    if (this.kickTimer > 0) {
      this.kickTimer -= dt;
      this.owner = null;
    } else {
      // Nächsten Spieler innerhalb seines (individuellen) Kontrollradius suchen.
      let best = null;
      let bestDist = Infinity;
      for (const p of players) {
        const r = p.controlRadius || BALL.controlRadius;
        const d = Math.hypot(p.x - this.x, p.y - this.y);
        if (d < r && d < bestDist) { bestDist = d; best = p; }
      }
      this.owner = best;
      if (best) this.lastTouchTeam = best.team;
    }

    if (this.owner) {
      // Ball klebt leicht vor dem Spieler in Laufrichtung (Dribbling).
      const f = this.owner.facing;
      this.x = this.owner.x + f.x * BALL.dribbleOffset;
      this.y = this.owner.y + f.y * BALL.dribbleOffset;
      this.vx = this.owner.vx;
      this.vy = this.owner.vy;
    }
  }

  // Bewegung + Reibung. Aus-Erkennung (Einwurf/Ecke/Abstoß) übernimmt das Match.
  // Hier nur eine harte Sicherheitsgrenze an den Welträndern.
  update(dt) {
    if (this.owner) return;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    const f = Math.max(0, 1 - BALL.friction * dt);
    this.vx *= f;
    this.vy *= f;

    this.x = Math.min(Math.max(this.x, this.radius), WORLD.width - this.radius);
    this.y = Math.min(Math.max(this.y, this.radius), WORLD.height - this.radius);
  }

  // Ball in eine Richtung treten (Schuss/Pass).
  kick(dirX, dirY, power, byTeam) {
    const len = Math.hypot(dirX, dirY) || 1;
    this.vx = (dirX / len) * power;
    this.vy = (dirY / len) * power;
    this.owner = null;
    this.kickTimer = BALL.kickCooldown;
    if (byTeam) this.lastTouchTeam = byTeam;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.ellipse(this.x, this.y + this.radius * 0.7, this.radius, this.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "#fff";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.stroke();
  }
}
