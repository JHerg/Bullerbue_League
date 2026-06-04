// Spielbares Elfmeter-1vs1 (ersetzt das alte Eck-Mini-Game).
// Ablauf: Best-of-5, abwechselnd. Wenn DU dran bist, hast du 10 Sekunden,
// um vom Anstoßpunkt zum Tor zu dribbeln und am Torwart vorbei zu treffen.
// Wenn der Gegner dran ist, steuerst du den Torwart und musst halten.
// Danach Sudden Death. Mehr Treffer gewinnt.
//
// run({ canvas, ctx, input, view:()=>({w,h}), dpr,
//       homeName, homeColors, awayName, awayColors, difficulty })
//   -> Promise<{ home, away, winner:"home"|"away" }>

import { HALL, PLAYER, BALL } from "./config.js?v=g2";
import { drawIndoorPitch } from "./pitch.js?v=g2";

const ROUND_TIME = 10;        // Sekunden pro Versuch
const PREP = 1.0;             // kurze "Bereit"-Pause vor jedem Versuch

export function run(info) {
  return new Promise((resolve) => new Shootout(info, resolve).start());
}

class Shootout {
  constructor(info, resolve) {
    this.info = info;
    this.resolve = resolve;
    this.diff = info.difficulty || { speed: 0.9, reaction: 0.3 };

    this.home = 0; this.away = 0;
    this.homeTaken = 0; this.awayTaken = 0;
    this.turn = "home";        // "home" = du schießt, "away" = du hältst
    this.phase = "prep";       // prep | live | result | done
    this.timer = PREP;
    this.message = "";
    this.lastResult = "";
    this.raf = null;
    this.last = 0;

    this._onKey = this._onKey.bind(this);
    this._loop = this._loop.bind(this);
  }

  start() {
    window.addEventListener("keydown", this._onKey);
    this._setupAttempt();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this._loop);
  }

  _onKey(e) {
    if (e.key === " ") e.preventDefault();
    if (this.phase === "done" && (e.key === "Enter" || e.key === " ")) this._finish();
  }

  // Geometrie: gespielt wird stets auf das RECHTE Tor (Angreifer von links).
  _setupAttempt() {
    const cx = (HALL.left + HALL.right) / 2, cy = (HALL.top + HALL.bottom) / 2;
    this.goalX = HALL.right;
    this.goalY = cy;
    this.goalH = HALL.goalHeight;

    // Angreifer startet links der Mitte, Torwart auf der Linie.
    this.att = { x: HALL.left + (HALL.right - HALL.left) * 0.28, y: cy, vx: 0, vy: 0, r: PLAYER.radius, face: { x: 1, y: 0 } };
    this.gk = { x: this.goalX - 24, y: cy, vx: 0, vy: 0, r: PLAYER.radius, dive: 0, cd: 0 };
    this.ball = { x: this.att.x + 14, y: cy, vx: 0, vy: 0, r: BALL.radius, owner: "att", shot: false };
    this.timer = PREP;
    this.phase = "prep";
    this.userAttacks = (this.turn === "home");
    this.message = this.userAttacks ? "Du schießt – dribble zum Tor!" : "Du hältst – pariere den Schuss!";
  }

  _loop(now) {
    const dt = Math.min(0.033, (now - this.last) / 1000);
    this.last = now;
    if (this.phase !== "done") this._update(dt);
    this._render();
    this.raf = requestAnimationFrame(this._loop);
  }

  _update(dt) {
    if (this.phase === "prep") {
      this.timer -= dt;
      if (this.timer <= 0) { this.phase = "live"; this.timer = ROUND_TIME; }
      return;
    }
    if (this.phase === "result") {
      this.timer -= dt;
      if (this.timer <= 0) this._nextAttempt();
      return;
    }
    if (this.phase !== "live") return;

    this.timer -= dt;
    const input = this.info.input;

    // ---- Steuerung: Angreifer ODER Torwart (je nach Zug) ----
    if (this.userAttacks) {
      this._moveWithInput(this.att, input, dt, 1);
      this._aiKeeper(dt);
      // Schuss
      const sh = input.consumeShoot && input.consumeShoot();
      if (sh && this.ball.owner === "att") this._shoot(this.att);
    } else {
      this._moveWithInput(this.gk, input, dt, 1, true);
      // Torwart-Hechten (Leertaste)
      const sh = input.consumeShoot && input.consumeShoot();
      if (sh && this.gk.cd <= 0) {
        const d = input.getDirection();
        const dx = (d.x || d.y) ? d.x : (this.ball.x - this.gk.x);
        const dy = (d.x || d.y) ? d.y : (this.ball.y - this.gk.y);
        const l = Math.hypot(dx, dy) || 1;
        this.gk.vx = dx / l * 760; this.gk.vy = dy / l * 760;
        this.gk.dive = 0.4; this.gk.cd = 1.0;
      }
      this._aiAttacker(dt);
    }

    if (this.gk.dive > 0) this.gk.dive -= dt;
    if (this.gk.cd > 0) this.gk.cd -= dt;

    this._physics(dt);
    this._checkOutcome();
    if (this.phase === "live" && this.timer <= 0) this._endAttempt("miss"); // Zeit abgelaufen
  }

  _moveWithInput(e, input, dt, mul, isKeeper) {
    const d = input.getDirection();
    const max = PLAYER.speed * mul * (isKeeper ? 0.95 : 1.05);
    e.vx += (d.x * max - e.vx) * Math.min(1, 1800 * dt / PLAYER.speed);
    e.vy += (d.y * max - e.vy) * Math.min(1, 1800 * dt / PLAYER.speed);
    if (d.x || d.y) { const l = Math.hypot(d.x, d.y); e.face = { x: d.x / l, y: d.y / l }; }
  }

  _aiKeeper(dt) {
    const k = this.gk, b = this.ball;
    const half = this.goalH / 2;
    // zwischen Ball und Tor positionieren
    let ty = Math.max(this.goalY - half, Math.min(this.goalY + half, b.y));
    const reach = 0.5 + (1 - this.diff.reaction);
    k.vy += ((ty - k.y) * 6 * reach - k.vy) * Math.min(1, 8 * dt);
    k.x += (this.goalX - 24 - k.x) * Math.min(1, 5 * dt);
    // hechten wenn Schuss schnell nah am Tor
    if (b.shot && Math.abs(b.x - this.goalX) < 90 && k.dive <= 0 && k.cd <= 0) {
      const dy = (this.goalY + (b.vy > 0 ? half : -half)) - k.y;
      k.vy = Math.sign(b.y - k.y) * 600 + b.vy * 0.4;
      k.dive = 0.35; k.cd = 0.6;
    }
    if (k.dive > 0) k.dive -= dt; if (k.cd > 0) k.cd -= dt;
    k.y += k.vy * dt;
    k.y = Math.max(this.goalY - half - 28, Math.min(this.goalY + half + 28, k.y));
  }

  _aiAttacker(dt) {
    const a = this.att, b = this.ball;
    const speed = PLAYER.speed * this.diff.speed * 1.05;
    // Richtung Tor, leicht zur freien Ecke (weg vom Torwart)
    const freeY = this.gk.y < this.goalY ? this.goalY + this.goalH * 0.3 : this.goalY - this.goalH * 0.3;
    const tx = this.goalX - 40, ty = freeY;
    const dx = tx - a.x, dy = ty - a.y, l = Math.hypot(dx, dy) || 1;
    a.vx += (dx / l * speed - a.vx) * Math.min(1, 8 * dt);
    a.vy += (dy / l * speed - a.vy) * Math.min(1, 8 * dt);
    a.face = { x: dx / l, y: dy / l };
    // schießen, wenn nah genug am Tor
    if (b.owner === "att" && (this.goalX - a.x) < 130 + Math.random() * 40) {
      const aimY = freeY + (Math.random() - 0.5) * this.goalH * 0.3 * this.diff.reaction;
      this._shoot(a, this.goalX, aimY);
    }
  }

  _shoot(shooter, tx, ty) {
    const b = this.ball;
    const dirX = (tx ?? (shooter.x + shooter.face.x * 100)) - b.x;
    const dirY = (ty ?? (shooter.y + shooter.face.y * 100)) - b.y;
    const l = Math.hypot(dirX, dirY) || 1;
    const power = 520;
    b.vx = dirX / l * power; b.vy = dirY / l * power;
    b.owner = null; b.shot = true;
  }

  _physics(dt) {
    const b = this.ball;
    // Dribbling: Ball klebt vor dem Angreifer, solange er ihn führt.
    if (b.owner === "att" && !b.shot) {
      const a = this.att;
      const near = Math.hypot(b.x - a.x, b.y - a.y) < 26;
      if (near) {
        b.x = a.x + a.face.x * 14; b.y = a.y + a.face.y * 14;
        b.vx = a.vx; b.vy = a.vy;
      } else { b.owner = null; }
    } else {
      b.x += b.vx * dt; b.y += b.vy * dt;
      b.vx *= Math.max(0, 1 - 1.2 * dt); b.vy *= Math.max(0, 1 - 1.2 * dt);
    }
    // Banden oben/unten/links
    if (b.y < HALL.top + b.r) { b.y = HALL.top + b.r; b.vy *= -0.6; }
    if (b.y > HALL.bottom - b.r) { b.y = HALL.bottom - b.r; b.vy *= -0.6; }
    if (b.x < HALL.left + b.r) { b.x = HALL.left + b.r; b.vx *= -0.6; }

    // Spieler in Feldgrenzen
    for (const e of [this.att, this.gk]) {
      e.x += 0; // Bewegung erfolgt in den jeweiligen Update-Methoden / hier nur Klemmen
    }
    this.att.x += this.att.vx * dt; this.att.y += this.att.vy * dt;
    this._clamp(this.att); this._clamp(this.gk);
  }

  _clamp(e) {
    e.x = Math.max(HALL.left + e.r, Math.min(HALL.right + 10, e.x));
    e.y = Math.max(HALL.top + e.r, Math.min(HALL.bottom - e.r, e.y));
  }

  _checkOutcome() {
    const b = this.ball;
    const half = this.goalH / 2;
    // Torwart fängt/pariert?
    const gkReach = this.gk.r + (this.gk.dive > 0 ? 30 : 8) + b.r;
    if (Math.hypot(b.x - this.gk.x, b.y - this.gk.y) < gkReach) {
      this._endAttempt("save"); return;
    }
    // Tor?
    if (b.x >= this.goalX && Math.abs(b.y - this.goalY) < half) { this._endAttempt("goal"); return; }
    // Ball am Tor vorbei / rechts raus, oder Schuss zu langsam
    if (b.x > this.goalX + 20) { this._endAttempt("miss"); return; }
    if (b.shot && Math.hypot(b.vx, b.vy) < 30) { this._endAttempt("miss"); return; }
  }

  _endAttempt(outcome) {
    if (this.phase !== "live") return;
    const scored = outcome === "goal";
    if (this.turn === "home") { this.homeTaken++; if (scored) this.home++; }
    else { this.awayTaken++; if (scored) this.away++; }
    this.lastResult = outcome === "goal" ? "TOR! ⚽" : outcome === "save" ? "Gehalten! 🧤" : "Vorbei! 😬";
    this.phase = "result"; this.timer = 1.4;
  }

  _nextAttempt() {
    const w = this._decided();
    if (w) { this._win(w); return; }
    this.turn = this.turn === "home" ? "away" : "home";
    this._setupAttempt();
  }

  _decided() {
    const { home: h, away: a, homeTaken: ht, awayTaken: at } = this;
    if (ht <= 5 && at <= 5 && !(ht === 5 && at === 5)) {
      const hRem = 5 - ht, aRem = 5 - at;
      if (h > a + aRem) return "home";
      if (a > h + hRem) return "away";
      return null;
    }
    if (ht === at && h !== a) return h > a ? "home" : "away";
    return null;
  }

  _win(winner) {
    this.phase = "done";
    this.winner = winner;
    const who = winner === "home" ? this.info.homeName : this.info.awayName;
    this.message = `${who} gewinnt ${this.home}:${this.away}!`;
  }

  _finish() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("keydown", this._onKey);
    this.resolve({ home: this.home, away: this.away, winner: this.winner });
  }

  // ---------------- Rendering ----------------
  _render() {
    const { ctx, dpr } = this.info;
    const { w, h } = this.info.view();
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#10141a"; ctx.fillRect(0, 0, w, h);

    // HALL-Feld zentriert einpassen.
    const hw = HALL.right - HALL.left, hh = HALL.bottom - HALL.top;
    const s = Math.min((w * 0.94) / hw, (h * 0.72) / hh);
    ctx.translate(w / 2, h * 0.58);
    ctx.scale(s, s);
    ctx.translate(-(HALL.left + hw / 2), -(HALL.top + hh / 2));

    drawIndoorPitch(ctx);
    this._drawBall(ctx);
    this._drawPlayer(ctx, this.att, this.info.homeColors[0], this.info.homeColors[1], this.userAttacks);
    this._drawPlayer(ctx, this.gk, "#00e676", "#063d20", !this.userAttacks);
    ctx.restore();

    // HUD (Bildschirm-Koordinaten)
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#fff"; ctx.textAlign = "center";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText(`${this.info.homeShort || "DU"}  ${this.home} : ${this.away}  ${this.info.awayShort || "KI"}`, w / 2, 34);
    ctx.font = "bold 15px sans-serif";
    ctx.fillStyle = "#ffd54a";
    ctx.fillText("Elfmeterschießen – 1 gegen 1", w / 2, 56);

    if (this.phase === "live") {
      ctx.fillStyle = this.timer < 3 ? "#ff5252" : "#fff";
      ctx.font = "bold 30px sans-serif";
      ctx.fillText(`${Math.ceil(this.timer)}`, w / 2, 92);
    }
    if (this.phase === "prep" || this.phase === "result") {
      ctx.fillStyle = "#fff"; ctx.font = "bold 20px sans-serif";
      ctx.fillText(this.phase === "result" ? this.lastResult : this.message, w / 2, 92);
    }
    if (this.phase !== "done") {
      ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = "13px sans-serif";
      ctx.fillText(this.userAttacks ? "Bewegen + Leertaste/SCHUSS = schießen"
        : "Bewegen + Leertaste/SCHUSS = hechten", w / 2, h - 18);
    } else {
      ctx.fillStyle = "#fff"; ctx.font = "bold 26px sans-serif";
      ctx.fillText(this.message, w / 2, h / 2);
      ctx.font = "16px sans-serif";
      ctx.fillText("Leertaste / Tippen für Weiter", w / 2, h / 2 + 34);
    }
    ctx.restore();

    // Touch: am Ende per Tap beenden
    if (this.phase === "done" && !this._tapBound) {
      this._tapBound = true;
      const end = () => this._finish();
      this.info.canvas.addEventListener("touchstart", end, { once: true });
      this.info.canvas.addEventListener("mousedown", end, { once: true });
    }
  }

  _drawBall(ctx) {
    const b = this.ball;
    ctx.beginPath(); ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.ellipse(b.x, b.y + 4, b.r * 1.1, b.r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.fillStyle = "#fff"; ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 1; ctx.strokeStyle = "rgba(0,0,0,0.5)"; ctx.stroke();
  }

  _drawPlayer(ctx, e, col, trim, highlighted) {
    ctx.beginPath(); ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.ellipse(e.x, e.y + e.r * 0.7, e.r, e.r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
    if (highlighted) {
      ctx.beginPath(); ctx.strokeStyle = "#ffeb3b"; ctx.lineWidth = 3;
      ctx.arc(e.x, e.y, e.r + 5, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.beginPath(); ctx.fillStyle = col;
    if (e.dive > 0) {
      const a = Math.atan2(e.vy, e.vx || 0.01);
      ctx.ellipse(e.x, e.y, e.r * 1.8, e.r * 0.8, a, 0, Math.PI * 2);
    } else ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
    ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = trim; ctx.stroke();
  }
}
