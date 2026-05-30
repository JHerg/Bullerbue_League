// Der Ball. Rollt mit Reibung aus und kann vom Spieler "angeschubst" werden
// (einfache Dribbel-Mechanik als Vorgeschmack — Schuss/Flanke kommen später).

import { BALL, WORLD } from "./config.js";

export class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = BALL.radius;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Reibung
    const f = Math.max(0, 1 - BALL.friction * dt);
    this.vx *= f;
    this.vy *= f;

    // An den Banden abprallen
    if (this.x < this.radius) { this.x = this.radius; this.vx *= -0.6; }
    if (this.x > WORLD.width - this.radius) { this.x = WORLD.width - this.radius; this.vx *= -0.6; }
    if (this.y < this.radius) { this.y = this.radius; this.vy *= -0.6; }
    if (this.y > WORLD.height - this.radius) { this.y = WORLD.height - this.radius; this.vy *= -0.6; }
  }

  // Kollision mit dem Spieler: Ball wird sanft weggeschoben (Dribbeln).
  interactWith(player) {
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    const dist = Math.hypot(dx, dy);
    const minDist = this.radius + player.radius;

    if (dist < minDist && dist > 0) {
      const nx = dx / dist;
      const ny = dy / dist;
      // Ball vor den Spieler setzen
      this.x = player.x + nx * minDist;
      this.y = player.y + ny * minDist;
      // Impuls aus Spielergeschwindigkeit übernehmen
      const push = Math.hypot(player.vx, player.vy) * 1.15 + 40;
      this.vx = nx * push;
      this.vy = ny * push;
    }
  }

  draw(ctx) {
    // Schatten
    ctx.beginPath();
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.ellipse(this.x, this.y + this.radius * 0.7, this.radius, this.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ball
    ctx.beginPath();
    ctx.fillStyle = "#fff";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.stroke();
  }
}
