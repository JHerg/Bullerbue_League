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

// Hallenfeld: deutlich kleinerer, zentrierter Spielbereich innerhalb der Welt,
// mit eigenen (kleineren) Toren. Banden begrenzen das Feld.
const HALL_W = 46 * PX_PER_M;   // ~644 (kleiner als das normale Feld)
const HALL_H = 30 * PX_PER_M;   // ~420
export const HALL = {
  left: (WORLD.width - HALL_W) / 2,
  right: (WORLD.width + HALL_W) / 2,
  top: (WORLD.height - HALL_H) / 2,
  bottom: (WORLD.height + HALL_H) / 2,
  goalHeight: 6 * PX_PER_M,       // Hallentor-Breite
  get centerY() { return WORLD.height / 2; },
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

// Torwart-Sprung/Hechten (Leertaste, wenn man den Torwart steuert).
export const KEEPER = {
  diveSpeed: 760,    // Hecht-Geschwindigkeit
  diveTime: 0.42,    // Dauer des Sprungs in Sekunden
  diveReach: 30,     // zusätzlicher Fangradius während des Sprungs (px)
  cooldown: 0.7,     // Pause bis zum nächsten Sprung
};

// Kamera: wie schnell sie dem Spieler folgt (0..1, höher = direkter)
export const CAMERA = {
  lerp: 0.12,
};

// Schwierigkeitsgrade der GEGNER-KI. Werte skalieren Tempo, Reaktion (höher =
// träger), Pass-/Schusspräzision, Schussreichweite, Entschlossenheit, Pressing.
// Bewusst eher mild eingestellt, damit "Einfach" wirklich einfach ist.
export const DIFFICULTY = {
  Einfach:    { speed: 0.70, reaction: 0.65, passAccuracy: 0.38, shootRange: 150, decisiveness: 0.22, press: 0.40 },
  Mittel:     { speed: 0.82, reaction: 0.45, passAccuracy: 0.58, shootRange: 190, decisiveness: 0.42, press: 0.60 },
  Schwer:     { speed: 0.92, reaction: 0.28, passAccuracy: 0.75, shootRange: 235, decisiveness: 0.62, press: 0.80 },
  Ultimativ:  { speed: 1.02, reaction: 0.14, passAccuracy: 0.90, shootRange: 285, decisiveness: 0.82, press: 0.95 },
};

// Festes Profil der eigenen Mitspieler (unabhängig von der Gegner-Schwierigkeit),
// damit das eigene Team verlässlich mitspielt und "Einfach" gewinnbar ist.
export const DIFFICULTY_TEAMMATE =
  { speed: 0.90, reaction: 0.35, passAccuracy: 0.70, shootRange: 220, decisiveness: 0.55, press: 0.70 };

// Farben
export const COLORS = {
  grassDark: "#2e7d32",
  grassLight: "#388e3c",
  line: "rgba(255,255,255,0.85)",
  out: "#1b5e20",
};
