// Ein Feldspieler. Gehört zu einem Team, hat eine Rolle und eine Heimposition
// aus der Formation. Bewegt sich per Zielrichtung (von Eingabe ODER KI) mit
// Beschleunigung/Reibung und bleibt im Spielfeld.

import { PLAYER, WORLD, BALL, KEEPER } from "./config.js?v=q2";

export class Player {
  constructor(data, team) {
    this.name = data.name;
    this.role = data.role;
    this.number = data.number;
    this.buildOverride = data.build; // optionaler Statur-Faktor (Renderer)
    this.speedFactor = data.speed || 1; // optionaler Tempo-Faktor (z. B. schneller Spieler)
    this.homeX = data.homeX;
    this.homeY = data.homeY;

    this.team = team;            // Referenz auf das Team
    this.x = data.homeX;
    this.y = data.homeY;
    this.vx = 0;
    this.vy = 0;
    this.radius = PLAYER.radius;
    this.facing = { x: team.attackRight ? 1 : -1, y: 0 };

    // Torhüter haben einen größeren Aktionsradius (fangen/abwehren).
    this.baseControlRadius = this.role === "TW" ? 26 : BALL.controlRadius;
    this.controlRadius = this.baseControlRadius;

    this.diveTimer = 0;          // > 0: Torwart hechtet gerade
    this.diveCooldown = 0;       // Pause bis zum nächsten Sprung
    this.isUser = false;         // wird vom Spieler gesteuert?
  }

  get isKeeper() { return this.role === "TW"; }
  get isDiving() { return this.diveTimer > 0; }

  // Sichtbarer Körperradius (Top-Down): bei stämmigen Spielern (build-Override)
  // breiter gezeichnet. build 1.0 -> normal, 1.45 -> deutlich breiter.
  get bodyRadius() {
    const b = this.buildOverride;
    if (!b) return this.radius;
    return this.radius * (1 + Math.max(0, b - 1) * 0.7);
  }

  // Setzt die Position zurück auf die Formationsposition (z. B. nach Anstoß).
  reset() {
    this.x = this.homeX;
    this.y = this.homeY;
    this.vx = 0;
    this.vy = 0;
  }

  // dir: normierte Zielrichtung {x,y}; speedMul skaliert das Tempo (Schwierigkeit).
  update(dt, dir, speedMul = 1) {
    if (this.diveCooldown > 0) this.diveCooldown -= dt;

    // Während des Torwart-Sprungs trägt der Hecht-Impuls; keine Eingabe-Steuerung.
    if (this.diveTimer > 0) {
      this.diveTimer -= dt;
      this.controlRadius = this.baseControlRadius + KEEPER.diveReach;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vx *= Math.max(0, 1 - 3 * dt);
      this.vy *= Math.max(0, 1 - 3 * dt);
      this.x = Math.min(Math.max(this.x, this.radius), WORLD.width - this.radius);
      this.y = Math.min(Math.max(this.y, this.radius), WORLD.height - this.radius);
      return;
    }
    this.controlRadius = this.baseControlRadius;

    const maxSpeed = PLAYER.speed * speedMul * this.speedFactor;
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

  // Torwart-Sprung in eine Richtung auslösen.
  startDive(dx, dy) {
    if (this.diveCooldown > 0) return false;
    const len = Math.hypot(dx, dy) || 1;
    this.vx = (dx / len) * KEEPER.diveSpeed;
    this.vy = (dy / len) * KEEPER.diveSpeed;
    this.facing = { x: dx / len, y: dy / len };
    this.diveTimer = KEEPER.diveTime;
    this.diveCooldown = KEEPER.diveTime + KEEPER.cooldown;
    return true;
  }

  draw(ctx, highlighted) {
    // Schatten
    ctx.beginPath();
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.ellipse(this.x, this.y + this.radius * 0.7, this.radius, this.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Auswahl-Markierung für den aktuell gesteuerten Spieler
    if (highlighted) {
      ctx.beginPath();
      ctx.strokeStyle = "#ffeb3b";
      ctx.lineWidth = 3;
      ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
      ctx.stroke();

      // Pfeil über dem Kopf
      const ay = this.y - this.radius - 10;
      ctx.beginPath();
      ctx.fillStyle = "#ffeb3b";
      ctx.moveTo(this.x, ay + 7);
      ctx.lineTo(this.x - 6, ay - 2);
      ctx.lineTo(this.x + 6, ay - 2);
      ctx.closePath();
      ctx.fill();

      // Name
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.strokeStyle = "rgba(0,0,0,0.7)";
      ctx.lineWidth = 3;
      ctx.strokeText(this.name, this.x, ay - 4);
      ctx.fillText(this.name, this.x, ay - 4);
    }

    // Körper / Trikot. Beim Hechten als gestreckte Ellipse in Sprungrichtung;
    // stämmige Spieler werden breiter gezeichnet (bodyRadius).
    const br = this.bodyRadius;
    ctx.beginPath();
    ctx.fillStyle = this.team.colors[0];
    if (this.isDiving) {
      const ang = Math.atan2(this.facing.y, this.facing.x);
      ctx.ellipse(this.x, this.y, br * 1.9, br * 0.8, ang, 0, Math.PI * 2);
    } else {
      ctx.arc(this.x, this.y, br, 0, Math.PI * 2);
    }
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
