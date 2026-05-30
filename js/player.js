// Der steuerbare Spieler. Bewegt sich mit Beschleunigung/Reibung und bleibt
// innerhalb der Weltgrenzen. Zeichnet sich als Trikot-Kreis mit Blickrichtung.

import { PLAYER, WORLD } from "./config.js";

export class Player {
  constructor(x, y, color = "#e53935") {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = PLAYER.radius;
    this.color = color;
    this.facing = { x: 1, y: 0 }; // Blickrichtung für späteres Schießen/Passen
  }

  update(dt, dir) {
    // Zielgeschwindigkeit aus Eingaberichtung
    const targetVx = dir.x * PLAYER.speed;
    const targetVy = dir.y * PLAYER.speed;

    if (dir.x !== 0 || dir.y !== 0) {
      // Beschleunigen Richtung Zielgeschwindigkeit
      this.vx += (targetVx - this.vx) * Math.min(1, PLAYER.accel * dt / PLAYER.speed);
      this.vy += (targetVy - this.vy) * Math.min(1, PLAYER.accel * dt / PLAYER.speed);
      this.facing = { x: dir.x, y: dir.y };
    } else {
      // Ausrollen
      const f = Math.max(0, 1 - PLAYER.friction * dt);
      this.vx *= f;
      this.vy *= f;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // In der Welt halten
    this.x = Math.min(Math.max(this.x, this.radius), WORLD.width - this.radius);
    this.y = Math.min(Math.max(this.y, this.radius), WORLD.height - this.radius);
  }

  draw(ctx) {
    // Schatten
    ctx.beginPath();
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.ellipse(this.x, this.y + this.radius * 0.7, this.radius, this.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Körper / Trikot
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.stroke();

    // Blickrichtungs-Marker
    ctx.beginPath();
    ctx.fillStyle = "#fff";
    ctx.arc(
      this.x + this.facing.x * this.radius * 0.6,
      this.y + this.facing.y * this.radius * 0.6,
      2.5, 0, Math.PI * 2
    );
    ctx.fill();
  }
}
