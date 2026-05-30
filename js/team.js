// Eine Mannschaft: 11 Spieler aus der Startelf-Datenbasis, Farben, Angriffs-
// richtung und Schwierigkeitsprofil für die KI.

import { buildSquad } from "./teams.js";
import { Player } from "./player.js";

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
}
