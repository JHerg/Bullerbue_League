// Match-Orchestrator: führt zwei Teams, Ball, KI, Ballbesitz, die beiden
// Spieler-Fokus-Modi, Schuss/Pass des Nutzers und die Tor-Erkennung zusammen.

import { WORLD, GOAL, BALL, KICK, PLAYER } from "./config.js";
import { Team } from "./team.js";
import { Ball } from "./ball.js";
import { computeAI } from "./ai.js";

export class Match {
  // homeDef/awayDef: Team-Definitionen; mode: "team" | "single";
  // difficulty: KI-Profil; userPlayerIndex: bei "single" der feste Spieler.
  constructor(homeDef, awayDef, { mode, difficulty, userPlayerIndex = 9 }) {
    this.home = new Team(homeDef, true, difficulty);
    this.away = new Team(awayDef, false, difficulty);
    this.mode = mode;
    this.difficulty = difficulty;

    this.ball = new Ball(WORLD.width / 2, WORLD.height / 2);
    this.ball.lastTouchTeam = this.home;

    this.allPlayers = [...this.home.players, ...this.away.players];

    // Im Einzelspieler-Modus steuert man dauerhaft diesen Spieler.
    this.userFixed = this.home.players[userPlayerIndex] || this.home.outfield[0];
    this.userPlayer = this.userFixed;

    this.score = { home: 0, away: 0 };
    this.message = "";
    this.resetTimer = 0;
  }

  update(dt, input) {
    if (this.resetTimer > 0) {
      this.resetTimer -= dt;
      if (this.resetTimer <= 0) this.message = "";
      // Während der Anstoßpause Kamera-Ziel beibehalten, sonst nichts bewegen.
      return;
    }

    // Pro Team den Ball-Jäger (nächster Feldspieler zum Ball) bestimmen.
    this.home.chaser = this._closestOutfield(this.home);
    this.away.chaser = this._closestOutfield(this.away);

    // Gesteuerten Spieler bestimmen (Fokus-Modus).
    this._selectUserPlayer();

    // Alle Spieler aktualisieren.
    for (const p of this.allPlayers) {
      if (p === this.userPlayer) {
        this._updateUser(dt, p, input);
      } else {
        this._updateAI(dt, p);
      }
    }

    this._separate();

    this.ball.updatePossession(dt, this.allPlayers);
    this.ball.update(dt);

    this._checkGoal();
  }

  // --- Steuerung: welchen Spieler steuert der Mensch? ---
  _selectUserPlayer() {
    if (this.mode === "single") {
      this.userPlayer = this.userFixed;
      return;
    }
    // Team-Modus: Feldspieler, der dem Ball am nächsten ist (mit Hysterese,
    // damit nicht ständig gewechselt wird).
    let best = this.userPlayer && this.userPlayer.team === this.home ? this.userPlayer : null;
    let bestDist = best ? Math.hypot(best.x - this.ball.x, best.y - this.ball.y) - 22 : Infinity;
    for (const p of this.home.outfield) {
      const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
      if (d < bestDist) { bestDist = d; best = p; }
    }
    this.userPlayer = best || this.home.outfield[0];
  }

  _updateUser(dt, p, input) {
    const dir = input.getDirection();
    p.update(dt, dir, 1); // Nutzer läuft immer mit vollem Tempo

    const canKick = this.ball.owner === p ||
      Math.hypot(this.ball.x - p.x, this.ball.y - p.y) < BALL.controlRadius * 1.7;

    if (input.consumeShoot() && canKick) {
      this.ball.kick(p.facing.x, p.facing.y, KICK.shootPower, p.team);
    } else if (input.consumePass() && canKick) {
      const mate = this._bestPass(p);
      if (mate) {
        const dx = mate.x - p.x, dy = mate.y - p.y;
        const power = Math.min(KICK.passPowerMax, KICK.passPower + Math.hypot(dx, dy) * KICK.passPerPx);
        this.ball.kick(dx, dy, power, p.team);
      } else {
        this.ball.kick(p.facing.x, p.facing.y, KICK.passPower, p.team);
      }
    }
  }

  _updateAI(dt, p) {
    const teammates = p.team.players;
    const opponents = p.team === this.home ? this.away.players : this.home.players;
    const teamHasBall = this.ball.owner && this.ball.owner.team === p.team;

    const ctx = {
      ball: this.ball,
      difficulty: this.difficulty,
      isPossessor: this.ball.owner === p,
      isChaser: p === p.team.chaser && !teamHasBall,
      teammates,
      opponents,
      dt,
    };

    const out = computeAI(p, ctx);
    p.update(dt, out.dir, this.difficulty.speed);
    if (out.kick) {
      this.ball.kick(out.kick.dirX, out.kick.dirY, out.kick.power, p.team);
    }
  }

  _bestPass(p) {
    const forward = p.team.attackRight ? 1 : -1;
    let best = null, bestScore = -Infinity;
    for (const mate of p.team.players) {
      if (mate === p || mate.isKeeper) continue;
      const dx = mate.x - p.x, dy = mate.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 35 || dist > 420) continue;
      // bevorzugt nach vorn und in Laufrichtung des Nutzers
      const progress = (mate.x - p.x) * forward;
      const facingBias = (dx * p.facing.x + dy * p.facing.y) / dist; // -1..1
      const score = progress + facingBias * 120;
      if (score > bestScore) { bestScore = score; best = mate; }
    }
    return best;
  }

  _closestOutfield(team) {
    let best = null, bestDist = Infinity;
    for (const p of team.outfield) {
      const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
      if (d < bestDist) { bestDist = d; best = p; }
    }
    return best;
  }

  // Leichte Abstoßung, damit Spieler nicht aufeinander kleben.
  _separate() {
    const min = PLAYER.radius * 2;
    for (let i = 0; i < this.allPlayers.length; i++) {
      for (let j = i + 1; j < this.allPlayers.length; j++) {
        const a = this.allPlayers[i], b = this.allPlayers[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        if (d > 0 && d < min) {
          const push = (min - d) / 2;
          const nx = dx / d, ny = dy / d;
          a.x -= nx * push; a.y -= ny * push;
          b.x += nx * push; b.y += ny * push;
        }
      }
    }
  }

  _checkGoal() {
    const b = this.ball;
    const inMouth = Math.abs(b.y - GOAL.centerY) < GOAL.height / 2;
    if (!inMouth) return;

    if (b.x <= GOAL.lineLeft) {
      // Linkes Tor (von Heim verteidigt) -> Auswärts trifft.
      this.score.away++;
      this._goal(this.away, this.home);
    } else if (b.x >= GOAL.lineRight) {
      this.score.home++;
      this._goal(this.home, this.away);
    }
  }

  _goal(scorer, conceder) {
    this.message = `TOR für ${scorer.name}!  ${this.home.short} ${this.score.home} : ${this.score.away} ${this.away.short}`;
    this.resetTimer = 2.2;
    this.home.reset();
    this.away.reset();
    // Anstoß für die Mannschaft, die das Tor kassiert hat.
    this.ball.reset(WORLD.width / 2, WORLD.height / 2);
    this.ball.lastTouchTeam = conceder;
  }

  // Ziel, dem die Kamera folgt: der gesteuerte Spieler.
  get cameraTarget() {
    return this.userPlayer;
  }
}
