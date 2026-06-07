// Eine Mannschaft: 11 Spieler aus der Startelf-Datenbasis, Farben, Angriffs-
// richtung und Schwierigkeitsprofil für die KI.

import { buildSquad } from "./teams.js?v=y2";
import { Player } from "./player.js?v=y2";
import { MARGIN, FIELD } from "./config.js?v=y2";

// Hallen-Aufstellung: Torwart + 3 Feldspieler (relativ zum Spielbereich;
// x 0=eigenes Tor..1=Gegnertor, y 0=oben..1=unten).
const INDOOR_FORMATION = [
  { role: "TW",  x: 0.05, y: 0.50 },
  { role: "ABW", x: 0.30, y: 0.50 },
  { role: "ANG", x: 0.58, y: 0.30 },
  { role: "ANG", x: 0.58, y: 0.70 },
];

export class Team {
  // opts: { squad?: [{name,number,...}], indoor?, area?: {left,right,top,bottom},
  //         keeperName? }
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
      const area = opts.area || { left: MARGIN, right: MARGIN + FIELD.width, top: MARGIN, bottom: MARGIN + FIELD.height };
      const aw = area.right - area.left, ah = area.bottom - area.top;

      // Torwart + Feldspieler bestimmen.
      let keeper, field;
      if (opts.keeperIndex != null && opts.squad.length) {
        // Nutzerteam: einer der gewählten Spieler ist der Torwart.
        const ki = Math.min(opts.keeperIndex, opts.squad.length - 1);
        keeper = opts.squad[ki];
        field = opts.squad.filter((_, i) => i !== ki).slice(0, 3);
      } else {
        // KI-Team (oder ohne Markierung): Auto-Torwart + bis zu 3 Feldspieler.
        keeper = { name: opts.keeperName || "Hallenwart", number: 1 };
        field = opts.squad.slice(0, 3);
      }

      const lineup = [{ ...keeper, _kp: true }, ...field];
      squad = lineup.map((d, i) => {
        const slot = INDOOR_FORMATION[i] || INDOOR_FORMATION[INDOOR_FORMATION.length - 1];
        const fx = attackRight ? slot.x : 1 - slot.x;
        return {
          ...d,
          role: d._kp ? "TW" : slot.role,
          homeX: area.left + fx * aw,
          homeY: area.top + slot.y * ah,
        };
      });
    } else {
      squad = buildSquad(def, attackRight);
    }
    this.players = squad.map((d) => new Player(d, this));
  }

  // Feldspieler (ohne Torwart) – in beiden Modi.
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
