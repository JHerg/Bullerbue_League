// Datenbasis: 18 Mannschaften, angelehnt an die Bundesliga, mit ausgedachten
// Fake-Namen (Teams & Spieler) und echten Startelf-Formationen.
//
// Die Formationen sind als relative Positionen hinterlegt (x: 0 = eigenes Tor,
// 1 = gegnerisches Tor / y: 0 = oben, 1 = unten) und werden im Spiel auf
// Welt-Koordinaten und Angriffsrichtung umgerechnet.

import { MARGIN, FIELD } from "./config.js?v=q";

// ---------------------------------------------------------------------------
// Formations-Vorlagen
// ---------------------------------------------------------------------------
export const FORMATIONS = {
  "4-3-3": [
    { role: "TW", x: 0.05, y: 0.50 },
    { role: "LV", x: 0.22, y: 0.16 },
    { role: "IV", x: 0.17, y: 0.38 },
    { role: "IV", x: 0.17, y: 0.62 },
    { role: "RV", x: 0.22, y: 0.84 },
    { role: "ZM", x: 0.42, y: 0.30 },
    { role: "ZM", x: 0.40, y: 0.50 },
    { role: "ZM", x: 0.42, y: 0.70 },
    { role: "LA", x: 0.70, y: 0.20 },
    { role: "ST", x: 0.78, y: 0.50 },
    { role: "RA", x: 0.70, y: 0.80 },
  ],
  "4-2-3-1": [
    { role: "TW", x: 0.05, y: 0.50 },
    { role: "LV", x: 0.22, y: 0.16 },
    { role: "IV", x: 0.17, y: 0.38 },
    { role: "IV", x: 0.17, y: 0.62 },
    { role: "RV", x: 0.22, y: 0.84 },
    { role: "DM", x: 0.35, y: 0.40 },
    { role: "DM", x: 0.35, y: 0.60 },
    { role: "OM", x: 0.58, y: 0.22 },
    { role: "OM", x: 0.60, y: 0.50 },
    { role: "OM", x: 0.58, y: 0.78 },
    { role: "ST", x: 0.80, y: 0.50 },
  ],
  "4-4-2": [
    { role: "TW", x: 0.05, y: 0.50 },
    { role: "LV", x: 0.22, y: 0.16 },
    { role: "IV", x: 0.17, y: 0.38 },
    { role: "IV", x: 0.17, y: 0.62 },
    { role: "RV", x: 0.22, y: 0.84 },
    { role: "LM", x: 0.46, y: 0.18 },
    { role: "ZM", x: 0.42, y: 0.42 },
    { role: "ZM", x: 0.42, y: 0.58 },
    { role: "RM", x: 0.46, y: 0.82 },
    { role: "ST", x: 0.74, y: 0.40 },
    { role: "ST", x: 0.74, y: 0.60 },
  ],
};

// ---------------------------------------------------------------------------
// Die 18 Teams (Fake-Namen, angelehnt an die Bundesliga inkl. Paderborn,
// Elversberg und Schalke). Farben: [Trikot, Kontur].
// ---------------------------------------------------------------------------
export const TEAMS = [
  { id: "bav", name: "Bavaria München",      short: "BAV", colors: ["#d32f2f", "#ffffff"], formation: "4-2-3-1" },
  { id: "dor", name: "Borussia Dortmunder",  short: "DOR", colors: ["#ffd600", "#111111"], formation: "4-3-3" },
  { id: "lai", name: "RB Laibzig",           short: "LAI", colors: ["#e53935", "#0b3d91"], formation: "4-2-3-1" },
  { id: "lev", name: "Bayer Leverbusen",     short: "LEV", colors: ["#212121", "#e53935"], formation: "4-3-3" },
  { id: "fra", name: "Eintracht Frankenfurt",short: "FRA", colors: ["#212121", "#d32f2f"], formation: "4-3-3" },
  { id: "stu", name: "VfB Stuttgarten",      short: "STU", colors: ["#ffffff", "#e53935"], formation: "4-2-3-1" },
  { id: "fre", name: "SC Freiburger",        short: "FRE", colors: ["#000000", "#e53935"], formation: "4-4-2" },
  { id: "hof", name: "TSG Hoffenheimer",     short: "HOF", colors: ["#1565c0", "#ffffff"], formation: "4-2-3-1" },
  { id: "wer", name: "Werder Bremerhaven",   short: "WER", colors: ["#1b5e20", "#ffffff"], formation: "4-4-2" },
  { id: "wob", name: "VfL Wolfsbürg",        short: "WOB", colors: ["#43a047", "#ffffff"], formation: "4-2-3-1" },
  { id: "bmg", name: "Borussia Münchenglad", short: "BMG", colors: ["#ffffff", "#111111"], formation: "4-3-3" },
  { id: "uni", name: "Union Berliner",       short: "UNI", colors: ["#c62828", "#ffd600"], formation: "4-4-2" },
  { id: "aug", name: "FC Augsburger",        short: "AUG", colors: ["#c62828", "#1b5e20"], formation: "4-4-2" },
  { id: "mai", name: "FSV Mainz 08",         short: "MAI", colors: ["#c62828", "#ffffff"], formation: "4-2-3-1" },
  { id: "sch", name: "Schalke 05",           short: "SCH", colors: ["#1565c0", "#ffffff"], formation: "4-3-3" },
  { id: "koe", name: "1. FC Köllen",         short: "KOE", colors: ["#ffffff", "#c62828"], formation: "4-4-2" },
  { id: "pad", name: "SC Paderhausen",       short: "PAD", colors: ["#1565c0", "#000000"], formation: "4-4-2" },
  { id: "elv", name: "SV Elversbergen",      short: "ELV", colors: ["#212121", "#ff6f00"], formation: "4-2-3-1" },
];

// Team-Stärke (für die Schnell-Simulation nicht gespielter Partien),
// angelehnt an die reale Hierarchie.
export const RATINGS = {
  bav: 90, lev: 86, dor: 85, lai: 84, stu: 81, fra: 80, fre: 78, wob: 76,
  hof: 76, bmg: 75, wer: 75, uni: 74, mai: 73, aug: 72, koe: 71, sch: 70,
  pad: 68, elv: 67,
};

export function ratingOf(id) {
  return RATINGS[id] ?? 74;
}

export function teamById(id) {
  return TEAMS.find((t) => t.id === id);
}

// Trikot-Kollision vermeiden: Liefert für das Auswärtsteam ggf. ein
// Ausweichtrikot [Trikot, Kontur], das sich klar vom Heimtrikot abhebt.
const ALT_KITS = [
  ["#ffffff", "#1b1b1b"], ["#1565c0", "#ffffff"], ["#ffd600", "#1b1b1b"],
  ["#212121", "#ffffff"], ["#00bcd4", "#06303a"], ["#e91e63", "#ffffff"],
];

function _hexRgb(h) {
  h = h.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function colorDist(a, b) {
  const x = _hexRgb(a), y = _hexRgb(b);
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}

export function ensureContrast(homeColors, awayColors) {
  if (colorDist(homeColors[0], awayColors[0]) >= 115) return awayColors;
  // Ausweichtrikot wählen, das am weitesten von Heim-Trikot UND -Kontur entfernt ist.
  let best = ALT_KITS[0], bestD = -1;
  for (const alt of ALT_KITS) {
    const d = Math.min(colorDist(alt[0], homeColors[0]), colorDist(alt[0], homeColors[1]));
    if (d > bestD) { bestD = d; best = alt; }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Fake-Spielernamen: deterministische Generierung aus Namens-Pools, damit
// jedes Team eine stabile, "echte" Startelf hat (z. B. "Harry Cohen").
// Später können die Pools durch kuratierte Listen ersetzt werden.
// ---------------------------------------------------------------------------
const FIRST_NAMES = [
  "Harry", "Leon", "Tom", "Max", "Finn", "Luis", "Nico", "Jan", "Ben", "Theo",
  "Erik", "Paul", "Noah", "Elias", "Jonas", "Marco", "Kai", "Tim", "Felix", "Sven",
  "Mats", "Robin", "Karl", "Andre", "Diego", "Pablo", "Yusuf", "Omar", "Ivan", "Luca",
];

const LAST_NAMES = [
  "Cohen", "Berger", "Vogt", "Krause", "Hofmann", "Walter", "Brandt", "Köhler", "Sommer", "Winter",
  "Lang", "Kraft", "Stein", "Fuchs", "Adler", "Falk", "Reuter", "Sauer", "Maier", "Roth",
  "Engel", "Busch", "Graf", "Horn", "Ott", "Pohl", "Renner", "Sander", "Thiel", "Voss",
  "Weiss", "Zimmer", "Bauer", "Lorenz", "Naumann", "Decker", "Petrov", "Silva", "Costa", "Moretti",
];

// Einfacher deterministischer Hash aus einem String -> Zahl.
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Baut die 11er-Aufstellung für ein Team: Namen + Rollen + Welt-Positionen.
// attackRight = true  -> Team greift nach rechts an (eigenes Tor links).
export function buildSquad(team, attackRight) {
  const formation = FORMATIONS[team.formation];
  const seed = hash(team.id);

  return formation.map((slot, i) => {
    const fn = FIRST_NAMES[(seed + i * 7) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(seed + i * 13 + 5) % LAST_NAMES.length];

    // Relative -> Welt-Koordinaten, je nach Angriffsrichtung gespiegelt.
    const fx = attackRight ? slot.x : 1 - slot.x;
    const homeX = MARGIN + fx * FIELD.width;
    const homeY = MARGIN + slot.y * FIELD.height;

    return {
      name: `${fn} ${ln}`,
      role: slot.role,
      number: i + 1,
      homeX,
      homeY,
    };
  });
}
