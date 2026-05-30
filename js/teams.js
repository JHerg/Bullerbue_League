// Datenbasis: 18 Mannschaften, angelehnt an die Bundesliga, mit ausgedachten
// Fake-Namen (Teams & Spieler) und echten Startelf-Formationen.
//
// Die Formationen sind als relative Positionen hinterlegt (x: 0 = eigenes Tor,
// 1 = gegnerisches Tor / y: 0 = oben, 1 = unten) und werden im Spiel auf
// Welt-Koordinaten und Angriffsrichtung umgerechnet.

import { MARGIN, FIELD } from "./config.js";

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
