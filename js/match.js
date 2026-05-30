// Match-Orchestrator: zwei Teams, Ball, KI, Ballbesitz, Fokus-Modi,
// kontextabhängige Nutzer-Aktion (Leertaste), Aus-Erkennung
// (Einwurf/Ecke/Abstoß), Tore, Spieluhr und Halbzeit mit Seitenwechsel.

import { WORLD, FIELD, MARGIN, GOAL, BALL, KICK, PLAYER, USER, DIFFICULTY_TEAMMATE } from "./config.js?v=m";
import { Team } from "./team.js?v=m";
import { Ball } from "./ball.js?v=m";
import { computeAI } from "./ai.js?v=m";
import { ensureContrast } from "./teams.js?v=m";

const EDGE = 8; // wie weit innerhalb der Linie der Ball bei Standards liegt

export class Match {
  constructor(homeDef, awayDef, { mode, difficulty, userPlayerIndex = 9, minutesPerHalf = 2, knockout = false }) {
    // Eigene Mitspieler: festes Profil. Gegner: gewählte Schwierigkeit.
    this.home = new Team(homeDef, true, DIFFICULTY_TEAMMATE);
    this.away = new Team(awayDef, false, difficulty);
    // Trikot-Kollision vermeiden: Auswärtsteam ggf. auf Ausweichtrikot setzen.
    this.away.colors = ensureContrast(this.home.colors, this.away.colors);
    this.mode = mode;
    this.teamDifficulty = DIFFICULTY_TEAMMATE; // KI der eigenen Mitspieler
    this.oppDifficulty = difficulty;           // KI des Gegners

    this.ball = new Ball(WORLD.width / 2, WORLD.height / 2);

    this.allPlayers = [...this.home.players, ...this.away.players];

    this.userFixed = this.home.players[userPlayerIndex] || this.home.outfield[0];
    this.userPlayer = this.userFixed;

    this.score = { home: 0, away: 0 };
    this.message = "";
    this.pauseTimer = 0;
    this.manualTimer = 0; // > 0: manuell gewählter Spieler bleibt aktiv

    // Spieluhr / Halbzeit / Verlängerung
    this.knockout = knockout;                 // K.o.-Spiel? (Verlängerung/Elfmeter)
    this.halfLength = minutesPerHalf * 60;    // Sekunden pro reguläre Halbzeit
    this.etLength = Math.max(45, this.halfLength * 0.5); // Verlängerungshälfte
    this.periodLength = this.halfLength;      // Länge des aktuellen Abschnitts
    this.half = 1;                            // 1,2 = regulär; 3,4 = Verlängerung
    this.clock = 0;
    this.wentToExtra = false;
    this.finished = false;
    this.outcome = null;                      // "decided" | "penalties"

    // Anstoß für das Heimteam.
    this._kickoff(this.home);
  }

  get periodLabel() {
    return this.half <= 2 ? `${this.half}. HZ` : `${this.half - 2}. VL`;
  }

  // Profil der KI je nach Team (eigene Mitspieler vs. Gegner).
  _profileFor(team) {
    return team === this.home ? this.teamDifficulty : this.oppDifficulty;
  }

  // Anstoß: beide Teams in ihre eigene Hälfte, Ball auf den Mittelpunkt,
  // ein zentraler Spieler des berechtigten Teams stellt sich an den Ball.
  _kickoff(team) {
    const cx = WORLD.width / 2, cy = WORLD.height / 2;
    this._placeOwnHalf(this.home);
    this._placeOwnHalf(this.away);
    this.ball.reset(cx, cy);
    this.ball.lastTouchTeam = team;

    let taker = null, best = Infinity;
    for (const p of team.outfield) {
      const d = Math.hypot(p.x - cx, p.y - cy);
      if (d < best) { best = d; taker = p; }
    }
    if (taker) {
      taker.x = cx - (team.attackRight ? 14 : -14);
      taker.y = cy;
      taker.vx = 0; taker.vy = 0;
      taker.facing = { x: team.attackRight ? 1 : -1, y: 0 };
    }
  }

  // Stellt alle Spieler eines Teams in die EIGENE Hälfte (Formation gestaucht).
  _placeOwnHalf(team) {
    const left = MARGIN, fw = FIELD.width;
    for (const p of team.players) {
      const fracOwn = team.attackRight ? (p.homeX - left) / fw : (left + fw - p.homeX) / fw;
      const k = Math.min(0.46, fracOwn * 0.46); // bis knapp vor die Mittellinie
      p.x = team.attackRight ? left + k * fw : left + fw - k * fw;
      p.y = p.homeY;
      p.vx = 0; p.vy = 0;
      p.facing = { x: team.attackRight ? 1 : -1, y: 0 };
    }
  }

  update(dt, input) {
    if (this.finished) return;

    if (this.pauseTimer > 0) {
      this.pauseTimer -= dt;
      if (this.pauseTimer <= 0) this.message = "";
      return;
    }

    // Spieluhr
    this.clock += dt;
    if (this.clock >= this.periodLength) { this._endHalf(); return; }

    this.manualTimer = Math.max(0, this.manualTimer - dt);

    // Ball-Jäger pro Team
    this.home.chaser = this._closestOutfield(this.home);
    this.away.chaser = this._closestOutfield(this.away);

    this._selectUserPlayer();

    for (const p of this.allPlayers) {
      if (p === this.userPlayer) this._updateUser(dt, p, input);
      else this._updateAI(dt, p);
    }

    this._separate();
    this.ball.updatePossession(dt, this.allPlayers);
    this.ball.update(dt);

    if (this._checkGoal()) return;
    this._checkBounds();
  }

  // ---- Fokus-Modus: welchen Spieler steuert der Mensch? ----
  _selectUserPlayer() {
    if (this.mode === "single") { this.userPlayer = this.userFixed; return; }

    // Team-Modus: führt ein eigener Feldspieler den Ball, steuerst IMMER du ihn
    // (nie die KI) – unabhängig von Hysterese oder manuellem Wechsel.
    const owner = this.ball.owner;
    if (owner && owner.team === this.home && !owner.isKeeper) {
      this.userPlayer = owner;
      this.manualTimer = 0;
      return;
    }

    // Nach manuellem Wechsel kurz die Auswahl beibehalten (nur ohne eigenen Ballbesitz).
    if (this.manualTimer > 0) return;

    // Sonst: nächster Feldspieler zum Ball (leichte Hysterese gegen Flackern).
    let best = this.userPlayer && this.userPlayer.team === this.home ? this.userPlayer : null;
    let bestDist = best ? Math.hypot(best.x - this.ball.x, best.y - this.ball.y) - 18 : Infinity;
    for (const p of this.home.outfield) {
      const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
      if (d < bestDist) { bestDist = d; best = p; }
    }
    this.userPlayer = best || this.home.outfield[0];
  }

  // Manueller Wechsel: nächster Feldspieler (nach Ball-Nähe sortiert).
  _switchPlayer() {
    const list = this.home.outfield
      .slice()
      .sort((a, b) =>
        Math.hypot(a.x - this.ball.x, a.y - this.ball.y) -
        Math.hypot(b.x - this.ball.x, b.y - this.ball.y));
    const idx = list.indexOf(this.userPlayer);
    this.userPlayer = list[(idx + 1) % list.length];
    this.manualTimer = 2.5;
  }

  // ---- Nutzer-Steuerung inkl. kontextabhängiger Leertaste ----
  _updateUser(dt, p, input) {
    const dir = input.getDirection();
    p.update(dt, dir, 1);

    const ball = this.ball;
    const distBall = Math.hypot(ball.x - p.x, ball.y - p.y);
    const atBall = ball.owner === p || distBall < BALL.controlRadius * 1.7;
    const teammateHasBall = ball.owner && ball.owner.team === p.team && ball.owner !== p;

    // --- Schuss (Leertaste, Haltedauer = Härte) ---
    const shoot = input.consumeShoot();
    if (shoot && atBall) {
      const g = goalsForTeam(p.team);
      const power = KICK.shootPower * (0.6 + 0.4 * shoot.charge);
      const distGoal = Math.hypot(g.oppGoalX - p.x, g.goalY - p.y);
      if (distGoal < USER.shootRange * 1.8) {
        ball.kick(g.oppGoalX - p.x, g.goalY - p.y, power, p.team);
      } else {
        ball.kick(p.facing.x, p.facing.y, power, p.team);
      }
    }

    // --- Sekundäraktion (F / Touch "PASS"): Pass / Grätsche / Wechsel ---
    if (input.consumeSecondary()) {
      if (atBall) {
        // Pass nach vorn.
        const mate = this._bestPass(p);
        if (mate) {
          const dx = mate.x - p.x, dy = mate.y - p.y;
          const power = Math.min(KICK.passPowerMax, KICK.passPower + Math.hypot(dx, dy) * KICK.passPerPx);
          ball.kick(dx, dy, power, p.team);
        } else {
          ball.kick(p.facing.x, p.facing.y, KICK.passPower, p.team);
        }
      } else if (teammateHasBall) {
        // Eigenes Team am Ball, du aber nicht: Spieler wechseln (Team) bzw. Ball anfordern (Einzel).
        if (this.mode === "team") this._switchPlayer();
        else {
          const o = ball.owner;
          const dx = p.x - o.x, dy = p.y - o.y;
          const power = Math.min(KICK.passPowerMax, KICK.passPower + Math.hypot(dx, dy) * KICK.passPerPx);
          ball.kick(dx, dy, power, p.team);
        }
      } else {
        // Gegner/loser Ball: nah dran grätschen, sonst wechseln (Team) bzw. hechten (Einzel).
        if (distBall < USER.tackleRange) {
          const g = goalsForTeam(p.team);
          ball.kick(g.oppGoalX - p.x, g.goalY - p.y, KICK.passPower * 0.8, p.team);
        } else if (this.mode === "team") {
          this._switchPlayer();
        } else {
          const a = Math.atan2(ball.y - p.y, ball.x - p.x);
          p.vx = Math.cos(a) * USER.lunge;
          p.vy = Math.sin(a) * USER.lunge;
        }
      }
    }

    // --- Reiner Spielerwechsel (Shift/Q) ---
    if (input.consumeSwitch() && this.mode === "team") this._switchPlayer();
  }

  _updateAI(dt, p) {
    const teammates = p.team.players;
    const opponents = p.team === this.home ? this.away.players : this.home.players;
    const teamHasBall = this.ball.owner && this.ball.owner.team === p.team;
    const profile = this._profileFor(p.team);
    const ctx = {
      ball: this.ball,
      difficulty: profile,
      isPossessor: this.ball.owner === p,
      isChaser: p === p.team.chaser && !teamHasBall,
      teammates,
      opponents,
      dt,
    };
    const out = computeAI(p, ctx);
    p.update(dt, out.dir, profile.speed);
    if (out.kick) this.ball.kick(out.kick.dirX, out.kick.dirY, out.kick.power, p.team);
  }

  // Pass-Ziel des Nutzers: nächster Mitspieler in der aktuellen
  // Blick-/Laufrichtung (nicht zwingend nach vorn). Gibt es keinen Mitspieler
  // im Sichtkegel, liefert es null -> der Aufrufer spielt in die Blickrichtung.
  _bestPass(p) {
    const aimLen = Math.hypot(p.facing.x, p.facing.y) || 1;
    const ax = p.facing.x / aimLen, ay = p.facing.y / aimLen;

    let best = null, bestScore = -Infinity;
    for (const mate of p.team.players) {
      if (mate === p) continue;
      const dx = mate.x - p.x, dy = mate.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 22 || dist > 460) continue;

      const align = (dx * ax + dy * ay) / dist; // -1..1, 1 = genau in Blickrichtung
      if (align < 0.35) continue;                // nur Mitspieler im Sichtkegel (~70°)

      // Bevorzugt gut ausgerichtete UND nahe Mitspieler.
      const score = align - dist * 0.0016;
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

  // Team, das in Richtung der angegebenen Torlinie angreift.
  _attackingLine(side) {
    const rightAttacker = this.home.attackRight ? this.home : this.away;
    if (side === "right") return rightAttacker;
    return rightAttacker === this.home ? this.away : this.home;
  }

  _checkGoal() {
    const b = this.ball;
    if (Math.abs(b.y - GOAL.centerY) >= GOAL.height / 2) return false;

    let scorer = null;
    if (b.x <= GOAL.lineLeft) scorer = this._attackingLine("left");
    else if (b.x >= GOAL.lineRight) scorer = this._attackingLine("right");
    if (!scorer) return false;

    const conceder = scorer === this.home ? this.away : this.home;
    if (scorer === this.home) this.score.home++; else this.score.away++;

    this.message = `TOR für ${scorer.name}!   ${this.home.short} ${this.score.home} : ${this.score.away} ${this.away.short}`;
    this._kickoff(conceder); // Anstoß für die Mannschaft, die das Tor kassiert hat (stellt beide Teams)
    this.pauseTimer = 2.2;
    return true;
  }

  _checkBounds() {
    const b = this.ball;
    const left = MARGIN, right = MARGIN + FIELD.width;
    const top = MARGIN, bottom = MARGIN + FIELD.height;

    // Seitenaus -> Einwurf für das Team ohne letzten Ballkontakt.
    if (b.y < top || b.y > bottom) {
      const awarded = b.lastTouchTeam === this.home ? this.away : this.home;
      const px = clamp(b.x, left + EDGE, right - EDGE);
      const py = b.y < top ? top + EDGE : bottom - EDGE;
      this._restart("Einwurf", awarded, px, py);
      return;
    }

    // Toraus (außerhalb des Tores) -> Ecke oder Abstoß.
    if (b.x < left || b.x > right) {
      const side = b.x < left ? "left" : "right";
      const attacker = this._attackingLine(side);
      const defender = attacker === this.home ? this.away : this.home;
      if (b.lastTouchTeam === defender) {
        // Verteidiger zuletzt am Ball -> Eckball für Angreifer.
        const cx = side === "left" ? left + EDGE : right - EDGE;
        const cy = b.y < GOAL.centerY ? top + EDGE : bottom - EDGE;
        this._restart("Eckball", attacker, cx, cy);
      } else {
        // Angreifer zuletzt am Ball -> Abstoß für Verteidiger.
        const gx = side === "left" ? left + 70 : right - 70;
        this._restart("Abstoß", defender, gx, GOAL.centerY);
      }
    }
  }

  // Standardsituation: Ball platzieren und dem berechtigten Team zuschanzen.
  _restart(type, team, x, y) {
    this.ball.reset(x, y);
    this.ball.lastTouchTeam = team;
    // Nächsten Feldspieler des berechtigten Teams als Ausführenden heranholen.
    let taker = null, bestDist = Infinity;
    for (const p of team.outfield) {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bestDist) { bestDist = d; taker = p; }
    }
    if (taker) {
      taker.x = x; taker.y = y;
      taker.vx = 0; taker.vy = 0;
      taker.facing = { x: team.attackRight ? 1 : -1, y: 0 };
    }
    this.message = type;
    this.pauseTimer = 0.9;
  }

  _endHalf() {
    const tied = this.score.home === this.score.away;

    if (this.half === 1) {
      this.half = 2; this.clock = 0;
      this.home.switchSides(); this.away.switchSides();
      this._kickoff(this.away); // Anstoß 2. Halbzeit für das Auswärtsteam
      this.message = "Halbzeit – Seitenwechsel";
      this.pauseTimer = 2.4;
      return;
    }

    if (this.half === 2) {
      if (!this.knockout || !tied) { this._finishDecided(); return; }
      // K.o. & unentschieden -> Verlängerung (1. Hälfte)
      this.wentToExtra = true;
      this.half = 3; this.clock = 0; this.periodLength = this.etLength;
      this.home.switchSides(); this.away.switchSides();
      this._kickoff(this.home);
      this.message = "Verlängerung – 1. Hälfte";
      this.pauseTimer = 2.4;
      return;
    }

    if (this.half === 3) {
      this.half = 4; this.clock = 0;
      this.home.switchSides(); this.away.switchSides();
      this._kickoff(this.away);
      this.message = "Verlängerung – 2. Hälfte";
      this.pauseTimer = 2.4;
      return;
    }

    // Ende der Verlängerung
    if (tied) {
      this.finished = true;
      this.outcome = "penalties";
      this.message = "Elfmeterschießen!";
    } else {
      this._finishDecided();
    }
  }

  _finishDecided() {
    this.finished = true;
    this.outcome = "decided";
    const s = this.score;
    const suffix = this.wentToExtra ? " n.V." : "";
    const result = s.home === s.away ? "Unentschieden" :
      (s.home > s.away ? `${this.home.name} gewinnt${suffix}` : `${this.away.name} gewinnt${suffix}`);
    this.message = `Schlusspfiff!   ${this.home.short} ${s.home} : ${s.away} ${this.away.short}\n${result}`;
  }

  get cameraTarget() { return this.userPlayer; }
}

function goalsForTeam(team) {
  return {
    oppGoalX: team.attackRight ? GOAL.lineRight : GOAL.lineLeft,
    goalY: GOAL.centerY,
  };
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
