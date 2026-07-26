// Match-Orchestrator: zwei Teams, Ball, KI, Ballbesitz, Fokus-Modi,
// kontextabhängige Nutzer-Aktion (Leertaste), Aus-Erkennung
// (Einwurf/Ecke/Abstoß), Tore, Spieluhr und Halbzeit mit Seitenwechsel.

import { WORLD, FIELD, MARGIN, GOAL, HALL, BALL, KICK, PLAYER, USER, DIFFICULTY_TEAMMATE } from "./config.js?v=a5";
import { Team } from "./team.js?v=a5";
import { Ball } from "./ball.js?v=a5";
import { computeAI } from "./ai.js?v=a5";
import { ensureContrast } from "./teams.js?v=a5";

const EDGE = 8; // wie weit innerhalb der Linie der Ball bei Standards liegt

export class Match {
  constructor(homeDef, awayDef, opts = {}) {
    const {
      mode, difficulty, userPlayerIndex = 9, minutesPerHalf = 2, knockout = false,
      indoor = false, homeSquad = null, awaySquad = null, durationSec = 0,
    } = opts;

    this.indoor = indoor;
    // Spielbereich + Tor-Geometrie (Halle = kleineres Feld mit eigenen Toren).
    if (indoor) {
      this.area = { left: HALL.left, right: HALL.right, top: HALL.top, bottom: HALL.bottom };
      this.goalH = HALL.goalHeight;
    } else {
      this.area = { left: MARGIN, right: MARGIN + FIELD.width, top: MARGIN, bottom: MARGIN + FIELD.height };
      this.goalH = GOAL.height;
    }
    this.centerX = (this.area.left + this.area.right) / 2;
    this.centerY = (this.area.top + this.area.bottom) / 2;

    // Eigene Mitspieler: festes Profil. Gegner: gewählte Schwierigkeit.
    // Nutzerteam (home) markiert seinen Torwart per keeperIndex; KI nutzt Auto-Torwart.
    this.home = new Team(homeDef, true, DIFFICULTY_TEAMMATE, { indoor, squad: homeSquad, area: this.area, keeperIndex: homeDef.keeperIndex });
    this.away = new Team(awayDef, false, difficulty, { indoor, squad: awaySquad, area: this.area, keeperName: awayDef.keeperName });
    // Trikot-Kollision vermeiden: Auswärtsteam ggf. auf Ausweichtrikot setzen.
    this.away.colors = ensureContrast(this.home.colors, this.away.colors);
    this.mode = mode;
    this.teamDifficulty = DIFFICULTY_TEAMMATE; // KI der eigenen Mitspieler
    this.oppDifficulty = difficulty;           // KI des Gegners

    this.ball = new Ball(WORLD.width / 2, WORLD.height / 2);
    if (indoor) this.ball.friction = 1.5; // Halle: Ball rollt weniger weit (mehr Kontrolle)

    this.allPlayers = [...this.home.players, ...this.away.players];

    this.userFixed = this.home.players[userPlayerIndex] || this.home.outfield[0];
    this.userPlayer = this.userFixed;

    this.score = { home: 0, away: 0 };
    this.goals = []; // Torchronik: { team:"home"|"away", scorer, minute, own }
    this.message = "";
    this.pauseTimer = 0;
    this.manualTimer = 0; // > 0: manuell gewählter Spieler bleibt aktiv

    // Spieluhr / Halbzeit / Verlängerung
    this.knockout = knockout;                 // K.o.-Spiel? (Verlängerung/Elfmeter)
    if (indoor) {
      // Halle: ein durchgehender Abschnitt (3×30 s = 90 s), kein Seitenwechsel.
      this.halfLength = durationSec || 90;
      this.etLength = 0;
    } else {
      this.halfLength = minutesPerHalf * 60;  // Sekunden pro reguläre Halbzeit
      this.etLength = Math.max(45, this.halfLength * 0.5); // Verlängerungshälfte
    }
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
    if (this.indoor) {
      // Anzeige als Drittel (3×30 s): aktuelles Drittel aus der Uhr ableiten.
      const third = Math.min(3, Math.floor(this.clock / (this.halfLength / 3)) + 1);
      return `${third}/3`;
    }
    return this.half <= 2 ? `${this.half}. HZ` : `${this.half - 2}. VL`;
  }

  // Spielminute, normiert auf 90' (reguläre Halbzeiten) bzw. 90'+ (Verlängerung).
  _matchMinute() {
    const frac = Math.min(1, this.clock / this.periodLength);
    if (this.half <= 2) return Math.max(1, Math.round((this.half - 1) * 45 + frac * 45));
    return Math.max(91, Math.round(90 + (this.half - 3) * 15 + frac * 15));
  }

  // Profil der KI je nach Team (eigene Mitspieler vs. Gegner).
  _profileFor(team) {
    return team === this.home ? this.teamDifficulty : this.oppDifficulty;
  }

  // Legt den Ball dem Ausführenden an den Fuß (Ballbesitz), damit Standards
  // (Anstoß, Einwurf, Ecke, Abstoß) als Pass gespielt werden statt frei zu liegen.
  _giveBallTo(taker) {
    const f = taker.facing;
    this.ball.x = taker.x + f.x * BALL.dribbleOffset;
    this.ball.y = taker.y + f.y * BALL.dribbleOffset;
    this.ball.vx = 0; this.ball.vy = 0;
    this.ball.owner = taker;
    this.ball.kickTimer = 0;
    this.ball.lastTouchTeam = taker.team;
    this.ball.lastTouchPlayer = taker;
  }

  // Anstoß: beide Teams in ihre eigene Hälfte, Ball auf den Mittelpunkt,
  // ein zentraler Spieler des berechtigten Teams stellt sich an den Ball.
  _kickoff(team) {
    const cx = this.centerX, cy = this.centerY;
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
      this._giveBallTo(taker); // Anstoß wird gespielt (Ball am Fuß)
    }
  }

  // Stellt alle Spieler eines Teams in die EIGENE Hälfte (Formation gestaucht).
  _placeOwnHalf(team) {
    const left = this.area.left, fw = this.area.right - this.area.left;
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
    if (this.indoor) this._clampPlayers();
    this.ball.updatePossession(dt, this.allPlayers);
    this.ball.update(dt);

    if (this._checkGoal()) return;
    this._checkBounds();
  }

  // Halle: Spieler dürfen nicht über die Banden laufen (Torwart darf knapp
  // hinter die Torlinie, alle anderen bleiben im Feld).
  _clampPlayers() {
    const a = this.area, r = PLAYER.radius;
    for (const p of this.allPlayers) {
      const ext = p.isKeeper ? 6 : 0; // Torwart minimal mehr Spielraum
      p.x = Math.min(Math.max(p.x, a.left + r - ext), a.right - r + ext);
      p.y = Math.min(Math.max(p.y, a.top + r), a.bottom - r);
    }
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

    // Während eines Torwart-Sprungs keine weitere Eingabe verarbeiten.
    if (p.isDiving) return;

    // --- Schuss (Leertaste, Haltedauer = Härte) ---
    const shoot = input.consumeShoot();

    // Torwart-Sprung: steuerst du den Torwart und bist nicht am Ball,
    // hechtet er mit der Leertaste (Laufrichtung, sonst Richtung Ball).
    if (shoot && p.isKeeper && !atBall) {
      const dir2 = input.getDirection();
      const dx = (dir2.x || dir2.y) ? dir2.x : (ball.x - p.x);
      const dy = (dir2.x || dir2.y) ? dir2.y : (ball.y - p.y);
      p.startDive(dx, dy);
      return;
    }

    if (shoot && atBall) {
      const g = this._goalsForTeam(p.team);
      const power = KICK.shootPower * (0.6 + 0.4 * shoot.charge);
      const distGoal = Math.hypot(g.oppGoalX - p.x, g.goalY - p.y);
      if (distGoal < USER.shootRange * 1.8) {
        ball.kick(g.oppGoalX - p.x, g.goalY - p.y, power, p.team, p);
      } else {
        ball.kick(p.facing.x, p.facing.y, power, p.team, p);
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
          ball.kick(dx, dy, power, p.team, p);
        } else {
          ball.kick(p.facing.x, p.facing.y, KICK.passPower, p.team, p);
        }
      } else if (teammateHasBall) {
        // Eigenes Team am Ball, du aber nicht: Spieler wechseln (Team) bzw. Ball anfordern (Einzel).
        if (this.mode === "team") this._switchPlayer();
        else {
          const o = ball.owner;
          const dx = p.x - o.x, dy = p.y - o.y;
          const power = Math.min(KICK.passPowerMax, KICK.passPower + Math.hypot(dx, dy) * KICK.passPerPx);
          ball.kick(dx, dy, power, p.team, p);
        }
      } else {
        // Gegner/loser Ball: nah dran grätschen, sonst wechseln (Team) bzw. hechten (Einzel).
        if (distBall < USER.tackleRange) {
          const g = this._goalsForTeam(p.team);
          ball.kick(g.oppGoalX - p.x, g.goalY - p.y, KICK.passPower * 0.8, p.team, p);
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
    let profile = this._profileFor(p.team);
    // Eigener Torwart skaliert mit der gewählten Schwierigkeit (auf Einfach
    // also schwächer), während die eigenen Feldspieler ihr festes Profil behalten.
    if (p.team === this.home && p.isKeeper) profile = this.oppDifficulty;
    // Halle: kürzere Schussreichweite -> nicht aus jeder Lage ballern.
    if (this.indoor) profile = { ...profile, shootRange: profile.shootRange * 0.45 };
    const ctx = {
      ball: this.ball,
      difficulty: profile,
      isPossessor: this.ball.owner === p,
      isChaser: p === p.team.chaser && !teamHasBall,
      teammates,
      opponents,
      dt,
      geo: { left: this.area.left, right: this.area.right, top: this.area.top, bottom: this.area.bottom,
             cx: this.centerX, cy: this.centerY, goalH: this.goalH },
    };
    const out = computeAI(p, ctx);
    p.update(dt, out.dir, profile.speed);
    if (out.kick) this.ball.kick(out.kick.dirX, out.kick.dirY, out.kick.power, p.team, p);
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
    if (Math.abs(b.y - this.centerY) >= this.goalH / 2) return false;

    let scorer = null;
    if (b.x <= this.area.left) scorer = this._attackingLine("left");
    else if (b.x >= this.area.right) scorer = this._attackingLine("right");
    if (!scorer) return false;

    const conceder = scorer === this.home ? this.away : this.home;
    if (scorer === this.home) this.score.home++; else this.score.away++;

    // Torschütze aus dem letzten Ballkontakt; Eigentor, wenn der letzte
    // Kontakt vom kassierenden Team kam.
    const last = this.ball.lastTouchPlayer;
    const ownGoal = last && last.team === conceder;
    const scorerPlayer = (last && last.team === scorer) ? last : null;
    const scorerName = ownGoal ? `${last.name} (ET)`
      : (scorerPlayer ? scorerPlayer.name : "unbekannt");
    if (scorerPlayer) scorerPlayer.goals = (scorerPlayer.goals || 0) + 1;

    this.goals.push({
      team: scorer === this.home ? "home" : "away",
      scorer: scorerName,
      minute: this._matchMinute(),
      own: !!ownGoal,
    });

    this.message = `TOR für ${scorer.name}!   ${this.home.short} ${this.score.home} : ${this.score.away} ${this.away.short}\n${scorerName}`;
    this._kickoff(conceder); // Anstoß für die Mannschaft, die das Tor kassiert hat (stellt beide Teams)
    this.pauseTimer = 2.2;
    return true;
  }

  _checkBounds() {
    const b = this.ball;

    // Halle: Ball prallt an allen Banden ab (nur Tore zählen, kein Aus).
    if (this.indoor) {
      if (b.owner) return;
      const left = this.area.left, right = this.area.right, top = this.area.top, bottom = this.area.bottom;
      const r = b.radius, rest = -0.72;
      const inMouth = Math.abs(b.y - this.centerY) < this.goalH / 2;
      if (b.y < top + r) { b.y = top + r; if (b.vy < 0) b.vy *= rest; }
      if (b.y > bottom - r) { b.y = bottom - r; if (b.vy > 0) b.vy *= rest; }
      // Linke/rechte Bande nur abseits des Tormauls (im Maul = Tor, s. _checkGoal).
      if (!inMouth) {
        if (b.x < left + r) { b.x = left + r; if (b.vx < 0) b.vx *= rest; }
        if (b.x > right - r) { b.x = right - r; if (b.vx > 0) b.vx *= rest; }
      }
      return;
    }

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
      // Einwurf: Richtung ins Feld; Ecke/Abstoß: Richtung Gegnertor.
      taker.facing = this._restartFacing(type, team, x, y);
      this._giveBallTo(taker); // Standard wird gespielt (Ball am Fuß)
    }
    this.message = type;
    this.pauseTimer = 0.9;
  }

  // Blickrichtung des Standard-Ausführenden (zeigt sinnvoll ins Feld).
  _restartFacing(type, team, x, y) {
    const cx = MARGIN + FIELD.width / 2, cy = MARGIN + FIELD.height / 2;
    if (type === "Einwurf") {
      // Vom Seitenrand nach innen (vertikal), leicht nach vorn.
      const fwd = team.attackRight ? 1 : -1;
      const inY = y < cy ? 1 : -1;
      const len = Math.hypot(fwd * 0.6, inY) || 1;
      return { x: (fwd * 0.6) / len, y: inY / len };
    }
    // Ecke/Abstoß: in Richtung gegnerisches Tor.
    return { x: team.attackRight ? 1 : -1, y: 0 };
  }

  _endHalf() {
    const tied = this.score.home === this.score.away;

    // Halle: ein Abschnitt; danach entschieden, im K.o. bei Remis Elfmeter.
    if (this.indoor) {
      if (this.knockout && tied) {
        this.finished = true; this.outcome = "penalties"; this.message = "Elfmeterschießen!";
      } else {
        this._finishDecided();
      }
      return;
    }

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

  // Tor-Ziel eines Teams (Mitte des gegnerischen Tors) im aktuellen Bereich.
  _goalsForTeam(team) {
    return {
      oppGoalX: team.attackRight ? this.area.right : this.area.left,
      goalY: this.centerY,
    };
  }

  get cameraTarget() { return this.userPlayer; }
}


function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
