// Ein Feldspieler. Gehört zu einem Team, hat eine Rolle und eine Heimposition
// aus der Formation. Bewegt sich per Zielrichtung (von Eingabe ODER KI) mit
// Beschleunigung/Reibung und bleibt im Spielfeld.

import { PLAYER, WORLD } from "./config.js";

export class Player {
  constructor(data, team) {
    this.name = data.name;
    this.role = data.role;
    this.number = data.number;
    this.homeX = data.homeX;
    this.homeY = data.homeY;

    this.team = team;            // Referenz auf das Team
    this.x = data.homeX;
    this.y = data.homeY;
    this.vx = 0;
    this.vy = 0;
    this.radius = PLAYER.radius;
    this.facing = { x: team.attackRight ? 1 : -1, y: 0 };

    this.isUser = false;         // wird vom Spieler gesteuert?
  }

  get isKeeper() { return this.role === "TW"; }

  // Setzt die Position zurück auf die Formationsposition (z. B. nach Anstoß).
  reset() {
    this.x = this.homeX;
    this.y = this.homeY;
    this.vx = 0;
    this.vy = 0;
  }

  // dir: normierte Zielrichtung {x,y}; speedMul skaliert das Tempo (Schwierigkeit).
  update(dt, dir, speedMul = 1) {
    const maxSpeed = PLAYER.speed * speedMul;
    const targetVx = dir.x * maxSpeed;
    const targetVy = dir.y * maxSpeed;

    if (dir.x !== 0 || dir.y !== 0) {
      const k = Math.min(1, (PLAYER.accel * dt) / PLAYER.speed);
      this.vx += (targetVx - this.vx) * k;
      this.vy += (targetVy - this.vy) * k;
      const len = Math.hypot(dir.x, dir.y);
      this.facing = { x: dir.x / len, y: dir.y / len };
    } else {
      const f = Math.max(0, 1 - PLAYER.friction * dt);
      this.vx *= f;
      this.vy *= f;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.x = Math.min(Math.max(this.x, this.radius), WORLD.width - this.radius);
    this.y = Math.min(Math.max(this.y, this.radius), WORLD.height - this.radius);
  }

  draw(ctx, highlighted) {
    // Schatten
    ctx.beginPath();
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.ellipse(this.x, this.y + this.radius * 0.7, this.radius, this.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Auswahl-Ring für den aktuell gesteuerten Spieler
    if (highlighted) {
      ctx.beginPath();
      ctx.strokeStyle = "#ffeb3b";
      ctx.lineWidth = 3;
      ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Körper / Trikot
    ctx.beginPath();
    ctx.fillStyle = this.team.colors[0];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = this.team.colors[1];
    ctx.stroke();

    // Rückennummer
    ctx.fillStyle = this.team.colors[1];
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(this.number), this.x, this.y);
  }
}
