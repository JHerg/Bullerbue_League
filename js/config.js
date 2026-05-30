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

// Spieler-Eigenschaften
export const PLAYER = {
  radius: 9,
  speed: 230,        // px pro Sekunde
  accel: 1600,       // Beschleunigung px/s^2
  friction: 9,       // Abbremsen, wenn kein Input
};

// Ball-Eigenschaften
export const BALL = {
  radius: 6,
  friction: 1.6,     // Rollreibung pro Sekunde (Anteil)
};

// Kamera: wie schnell sie dem Spieler folgt (0..1, höher = direkter)
export const CAMERA = {
  lerp: 0.12,
};

// Farben
export const COLORS = {
  grassDark: "#2e7d32",
  grassLight: "#388e3c",
  line: "rgba(255,255,255,0.85)",
  out: "#1b5e20",
};
