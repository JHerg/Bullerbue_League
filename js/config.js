// Zentrale Konfiguration. Alle Maße in "Welt-Pixeln".
// Ein echtes Fußballfeld ist ca. 105 x 68 m. Wir skalieren mit 14 px / m.

export const PX_PER_M = 14;

// Spielfeld-Innenmaß (das grüne Rechteck mit den Linien)
export const FIELD = {
  width: 105 * PX_PER_M,   // ~1470
  height: 68 * PX_PER_M,   // ~952
};

// Rand um das Spielfeld (Auslaufzone / Werbebanden-Bereich)
export const MARGIN = 8 * PX_PER_M;

// Gesamte Welt inkl. Rand
export const WORLD = {
  width: FIELD.width + MARGIN * 2,
  height: FIELD.height + MARGIN * 2,
};

// Tor-Geometrie (für Tor-Erkennung). Tor ist 7,32 m breit, mittig.
export const GOAL = {
  height: 7.32 * PX_PER_M,
  lineLeft: MARGIN,                 // x der linken Torlinie
  lineRight: MARGIN + FIELD.width,  // x der rechten Torlinie
  get centerY() { return MARGIN + FIELD.height / 2; },
};

// Spieler-Eigenschaften
export const PLAYER = {
  radius: 9,
  speed: 235,        // px pro Sekunde (Basis, wird von Schwierigkeit skaliert)
  accel: 1800,       // Beschleunigung px/s^2
  friction: 9,       // Abbremsen, wenn kein Input
};

// Ball-Eigenschaften
export const BALL = {
  radius: 6,
  friction: 0.7,        // Rollreibung pro Sekunde (Anteil, kleiner = rollt weiter)
  controlRadius: 20,    // Abstand, ab dem ein Spieler den Ball "führt"
  dribbleOffset: 14,    // wie weit vor dem Spieler der gefuehrte Ball liegt
  kickCooldown: 0.35,   // Sekunden, in denen der Ball nach einem Schuss frei ist
};

// Schuss/Pass-Parameter
export const KICK = {
  shootPower: 560,      // px/s beim Schuss
  passPower: 360,       // Basispower beim Pass
  passPerPx: 0.55,      // zusaetzliche Power pro px Distanz zum Mitspieler
  passPowerMax: 620,
};

// Nutzer-Aktionen (kontextabhängige Leertaste)
export const USER = {
  shootRange: 270,   // ab hier zielt die Aktion am Ball aufs Tor statt zu passen
  tackleRange: 38,   // Abstand zum Ball, ab dem die Grätsche den Ball erobert
  lunge: 540,        // Tempo des Hechtens/Grätschens Richtung Ball
};

// Kamera: wie schnell sie dem Spieler folgt (0..1, höher = direkter)
export const CAMERA = {
  lerp: 0.12,
};

// Schwierigkeitsgrade der KI. Werte skalieren Tempo, Reaktion und Präzision.
export const DIFFICULTY = {
  Einfach:    { speed: 0.84, reaction: 0.45, passAccuracy: 0.55, shootRange: 190, decisiveness: 0.35, press: 0.55 },
  Mittel:     { speed: 0.93, reaction: 0.30, passAccuracy: 0.72, shootRange: 230, decisiveness: 0.55, press: 0.70 },
  Schwer:     { speed: 1.00, reaction: 0.18, passAccuracy: 0.85, shootRange: 270, decisiveness: 0.72, press: 0.85 },
  Ultimativ:  { speed: 1.08, reaction: 0.08, passAccuracy: 0.95, shootRange: 320, decisiveness: 0.88, press: 1.00 },
};

// Farben
export const COLORS = {
  grassDark: "#2e7d32",
  grassLight: "#388e3c",
  line: "rgba(255,255,255,0.85)",
  out: "#1b5e20",
};
