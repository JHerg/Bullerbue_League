// Eine Mannschaft: 11 Spieler aus der Startelf-Datenbasis, Farben, Angriffs-
// richtung und Schwierigkeitsprofil für die KI.

import { buildSquad } from "./teams.js?v=o";
import { Player } from "./player.js?v=o";
import { MARGIN, FIELD } from "./config.js?v=o";

export class Team {
  constructor(def, attackRight, difficulty) {
    this.id = def.id;
    this.name = def.name;
    this.short = def.short;
    this.colors = def.colors;
    this.attackRight = attackRight;
    this.difficulty = difficulty;

    const squad = buildSquad(def, attackRight);
    this.players = squad.map((d) => new Player(d, this));
  }

  get outfield() {
    return this.players.filter((p) => !p.isKeeper);
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
