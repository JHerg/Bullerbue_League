// Eine Mannschaft: 11 Spieler aus der Startelf-Datenbasis, Farben, Angriffs-
// richtung und Schwierigkeitsprofil für die KI.

import { buildSquad } from "./teams.js?v=c2";
import { Player } from "./player.js?v=c2";
import { MARGIN, FIELD } from "./config.js?v=c2";

// Hallen-Aufstellung für 3 Feldspieler (relativ: x 0=eigenes Tor..1=Gegnertor).
const INDOOR_FORMATION = [
  { role: "ABW", x: 0.26, y: 0.50 },
  { role: "ANG", x: 0.60, y: 0.30 },
  { role: "ANG", x: 0.60, y: 0.70 },
];

export class Team {
  // opts: { squad?: [{name,number,build,speed}], indoor?: bool }
  constructor(def, attackRight, difficulty, opts = {}) {
    this.id = def.id;
    this.name = def.name;
    this.short = def.short;
    this.colors = def.colors;
    this.attackRight = attackRight;
    this.difficulty = difficulty;
    this.indoor = !!opts.indoor;

    let squad;
    if (opts.squad) {
      // Eigener Kader (z. B. Hallenturnier): Positionen aus INDOOR_FORMATION.
      squad = opts.squad.map((d, i) => {
        const slot = INDOOR_FORMATION[i % INDOOR_FORMATION.length];
        const fx = attackRight ? slot.x : 1 - slot.x;
        return {
          ...d,
          role: d.role || slot.role,
          homeX: MARGIN + fx * FIELD.width,
          homeY: MARGIN + slot.y * FIELD.height,
        };
      });
    } else {
      squad = buildSquad(def, attackRight);
    }
    this.players = squad.map((d) => new Player(d, this));
  }

  // Im Hallenmodus gibt es keinen Torwart -> alle sind Feldspieler.
  get outfield() {
    return this.indoor ? this.players : this.players.filter((p) => !p.isKeeper);
  }

  reset() {
    for (const p of this.players) p.reset();
  }

  // Seitenwechsel zur Halbzeit: Angriffsrichtung umdrehen und alle
  // Heimpositionen an der Mittellinie spiegeln.
  switchSides() {
    this.attackRight = !this.attackRight;
    const centerX = MARGIN + FIELD.width / 2;
    for (const p of this.players) {
      p.homeX = 2 * centerX - p.homeX;
      p.facing = { x: this.attackRight ? 1 : -1, y: 0 };
      p.reset();
    }
  }
}
