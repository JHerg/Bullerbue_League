// Datenbasis: 18 Mannschaften, angelehnt an die Bundesliga, mit ausgedachten
// Fake-Namen (Teams & Spieler) und echten Startelf-Formationen.
//
// Die Formationen sind als relative Positionen hinterlegt (x: 0 = eigenes Tor,
// 1 = gegnerisches Tor / y: 0 = oben, 1 = unten) und werden im Spiel auf
// Welt-Koordinaten und Angriffsrichtung umgerechnet.

import { MARGIN, FIELD } from "./config.js?v=a2";

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

// Manuelle Spieler-Overrides je Team (nach Aufstellungs-Index 0..10).
// Überschreibt den generierten Namen und/oder die Rückennummer.
const SQUAD_OVERRIDES = {
  // Bavaria München (4-2-3-1) — frei erfundene Namen; #6 und #45 bleiben.
  bav: {
    0: { name: "Manni Neuhart", number: 1 },     // TW
    1: { name: "Alfons Daviro", number: 19 },    // LV
    2: { name: "Dion Upagecu", number: 4 },      // IV
    3: { name: "Minho Sangwoo", number: 3 },     // IV
    4: { name: "Josip Stanic", number: 2 },      // RV
    5: { name: "Jacob Jajo", number: 6 },        // DM — bleibt
    6: { name: "Alexander Pavlo", number: 45 },  // DM — bleibt
    7: { name: "Lenny Sarno", number: 10 },      // OM
    8: { name: "Jamal Murano", number: 42 },     // OM
    9: { name: "Sergio Gnabello", number: 7 },   // OM
    10: { name: "Harro Keen", number: 9 },       // ST
  },

  // Borussia Dortmunder (4-3-3)
  dor: {
    0: { name: "Gregor Kobold", number: 1 },
    1: { name: "Rami Bensan", number: 5 },
    2: { name: "Niko Schloss", number: 15 },
    3: { name: "Waldo Anrath", number: 2 },
    4: { name: "Julez Rydsen", number: 26 },
    5: { name: "Marlo Sabato", number: 20 },
    6: { name: "Pascal Großmann", number: 13 },
    7: { name: "Felix Nemko", number: 8 },
    8: { name: "Karem Adimi", number: 27 },
    9: { name: "Bastian Haal", number: 9 },
    10: { name: "Jamie Gitt", number: 7 },
  },

  // RB Laibzig (4-2-3-1)
  lai: {
    0: { name: "Peter Gulasch", number: 1 },
    1: { name: "Davo Raumer", number: 22 },
    2: { name: "Willi Orbansky", number: 4 },
    3: { name: "Castor Lubeck", number: 23 },
    4: { name: "Benji Heinrich", number: 39 },
    5: { name: "Xavi Simmon", number: 10 },
    6: { name: "Nico Seiwald", number: 13 },
    7: { name: "Tonio Nusser", number: 24 },
    8: { name: "Dani Olmer", number: 7 },
    9: { name: "Loïc Opanda", number: 17 },
    10: { name: "Benno Seck", number: 30 },
  },

  // Bayer Leverbusen (4-3-3)
  lev: {
    0: { name: "Lukas Hradek", number: 1 },
    1: { name: "Alex Grimald", number: 20 },
    2: { name: "Jon Tabber", number: 4 },
    3: { name: "Edmund Tapso", number: 12 },
    4: { name: "Jeremy Frimpo", number: 30 },
    5: { name: "Granit Xhalar", number: 34 },
    6: { name: "Robi Andritsch", number: 8 },
    7: { name: "Florian Wirzel", number: 10 },
    8: { name: "Jonas Hofmaier", number: 7 },
    9: { name: "Victor Bonfass", number: 22 },
    10: { name: "Amir Edler", number: 21 },
  },

  // Eintracht Frankenfurt (4-3-3)
  fra: {
    0: { name: "Kev Tralbert", number: 1 },
    1: { name: "Nat Braun", number: 36 },
    2: { name: "Jürgi Bluti", number: 99, build: 1.8 },
    3: { name: "Arto Theate", number: 35 },
    4: { name: "Rasmus Kristof", number: 23 },
    5: { name: "Elias Skhira", number: 15 },
    6: { name: "Hugo Larson", number: 16 },
    7: { name: "Mario Götzke", number: 27 },
    8: { name: "Ansgar Knaup", number: 18 },
    9: { name: "Omar Marmusch", number: 7 },
    10: { name: "Hugo Ekiti", number: 11 },
  },

  // VfB Stuttgarten (4-2-3-1)
  stu: {
    0: { name: "Alex Nüblin", number: 33 },
    1: { name: "Maxi Mittelstatt", number: 18 },
    2: { name: "Waldo Antoni", number: 4 },
    3: { name: "Jeff Chabot", number: 24 },
    4: { name: "Josh Vagno", number: 2 },
    5: { name: "Atan Karazor", number: 16 },
    6: { name: "Angelo Stiller", number: 6 },
    7: { name: "Chris Führ", number: 27 },
    8: { name: "Enzo Millon", number: 8 },
    9: { name: "Jamie Lewel", number: 26 },
    10: { name: "Ermin Demiro", number: 9 },
  },

  // SC Freiburger (4-4-2)
  fre: {
    0: { name: "Noah Atubo", number: 1 },
    1: { name: "Chris Günter", number: 30 },
    2: { name: "Matti Ginto", number: 28 },
    3: { name: "Phil Lienhart", number: 3 },
    4: { name: "Lukas Küblar", number: 24 },
    5: { name: "Vince Grifaldi", number: 32 },
    6: { name: "Maxi Eggstein", number: 35 },
    7: { name: "Patrik Osterhag", number: 6 },
    8: { name: "Ritso Doral", number: 42 },
    9: { name: "Luca Höhler", number: 9 },
    10: { name: "Junior Adam", number: 27 },
  },

  // TSG Hoffenheimer (4-2-3-1)
  hof: {
    0: { name: "Oli Baumeister", number: 1 },
    1: { name: "Davo Juras", number: 3 },
    2: { name: "Ozan Kabak", number: 25 },
    3: { name: "Stan Nsoko", number: 15 },
    4: { name: "Pavel Kadarek", number: 4 },
    5: { name: "Grischa Prömm", number: 21 },
    6: { name: "Tom Bischof", number: 39 },
    7: { name: "Anton Stachel", number: 7 },
    8: { name: "Andrej Kramer", number: 27 },
    9: { name: "Maxi Beyer", number: 11 },
    10: { name: "Haris Tabako", number: 9 },
  },

  // Werder Bremerhaven (4-4-2)
  wer: {
    0: { name: "Michi Zetter", number: 30 },
    1: { name: "Anton Junk", number: 3 },
    2: { name: "Marco Friedel", number: 32 },
    3: { name: "Niko Starke", number: 4 },
    4: { name: "Mitch Weiser", number: 8 },
    5: { name: "Romano Schmidt", number: 20 },
    6: { name: "Senne Lynar", number: 28 },
    7: { name: "Jens Stagge", number: 19 },
    8: { name: "Leo Bitter", number: 10 },
    9: { name: "Marv Duckisch", number: 14 },
    10: { name: "Justin Njima", number: 24 },
  },

  // VfL Wolfsbürg (4-2-3-1)
  wob: {
    0: { name: "Kamil Grabar", number: 1 },
    1: { name: "Rido Bakuel", number: 40 },
    2: { name: "Max Lacroy", number: 4 },
    3: { name: "Sebas Bornau", number: 21 },
    4: { name: "Joa Mähler", number: 2 },
    5: { name: "Matti Svanber", number: 8 },
    6: { name: "Yann Gerhart", number: 31 },
    7: { name: "Patrik Wimmar", number: 11 },
    8: { name: "Lovo Majaro", number: 30 },
    9: { name: "Jonas Winter", number: 23 },
    10: { name: "Tiago Tomasso", number: 9 },
  },

  // Borussia Münchenglad (4-3-3)
  bmg: {
    0: { name: "Moritz Nikol", number: 1 },
    1: { name: "Luca Netzer", number: 18 },
    2: { name: "Ken Itakuro", number: 25 },
    3: { name: "Nico Elvado", number: 30 },
    4: { name: "Joe Scallon", number: 29 },
    5: { name: "Julian Weigel", number: 16 },
    6: { name: "Rocco Reitz", number: 8 },
    7: { name: "Florian Neuhaus", number: 32 },
    8: { name: "Alas Pleon", number: 14 },
    9: { name: "Tim Kleinmann", number: 9 },
    10: { name: "Robin Hackel", number: 23 },
  },

  // Union Berliner (4-4-2)
  uni: {
    0: { name: "Fredo Rönno", number: 1 },
    1: { name: "Jero Roussel", number: 24 },
    2: { name: "Diego Leitao", number: 30 },
    3: { name: "Danilo Doek", number: 5 },
    4: { name: "Chris Trimmler", number: 28 },
    5: { name: "Janne Haber", number: 16 },
    6: { name: "Rani Khadir", number: 8 },
    7: { name: "Andi Schäfer", number: 20 },
    8: { name: "Ben Hollerbach", number: 11 },
    9: { name: "Andrej Ilici", number: 9 },
    10: { name: "Wooyo Jeng", number: 19 },
  },

  // FC Augsburger (4-4-2)
  aug: {
    0: { name: "Finn Dahmer", number: 1 },
    1: { name: "Mats Pederson", number: 23 },
    2: { name: "Kev Schlotter", number: 25 },
    3: { name: "Cedo Zesiger", number: 19 },
    4: { name: "Robi Gumny", number: 2 },
    5: { name: "Elvis Rexho", number: 17 },
    6: { name: "Arne Maieto", number: 18 },
    7: { name: "Rubo Vargo", number: 16 },
    8: { name: "Kris Jakica", number: 6 },
    9: { name: "Alexis Claudin", number: 10 },
    10: { name: "Phil Tietze", number: 29 },
  },

  // FSV Mainz 08 (4-2-3-1)
  mai: {
    0: { name: "Robin Zenter", number: 27 },
    1: { name: "Phil Mwana", number: 8 },
    2: { name: "Sepp Bergen", number: 4 },
    3: { name: "Stef Bellman", number: 5 },
    4: { name: "Toni Cacio", number: 24 },
    5: { name: "Domi Kohrer", number: 6 },
    6: { name: "Kai Sanoda", number: 14 },
    7: { name: "Nadim Amir", number: 10 },
    8: { name: "Jae Leeson", number: 17 },
    9: { name: "Brian Grudo", number: 42 },
    10: { name: "Jonas Burkart", number: 29 },
  },

  // Schalke 05 (4-3-3)
  sch: {
    0: { name: "Justin Heeker", number: 1 },
    1: { name: "Derry Murk", number: 3 },
    2: { name: "Marco Kaminer", number: 5 },
    3: { name: "Tomas Kalan", number: 4 },
    4: { name: "Memo Aydan", number: 2 },
    5: { name: "Ron Schallen", number: 6 },
    6: { name: "Tobi Mohrer", number: 22 },
    7: { name: "Kenan Karamis", number: 11 },
    8: { name: "Amin Yusan", number: 10 },
    9: { name: "Moussa Sylar", number: 18 },
    10: { name: "Pablo Donares", number: 7 },
  },

  // 1. FC Köllen (4-4-2)
  koe: {
    0: { name: "Marv Schwabe", number: 1 },
    1: { name: "Leo Paqaro", number: 21 },
    2: { name: "Timo Hübner", number: 4 },
    3: { name: "Domi Heinze", number: 3 },
    4: { name: "Benno Schmitt", number: 2 },
    5: { name: "Eric Martell", number: 6 },
    6: { name: "Dejo Ljubic", number: 17 },
    7: { name: "Linus Maino", number: 19 },
    8: { name: "Flo Kaibel", number: 18 },
    9: { name: "Damon Downer", number: 33 },
    10: { name: "Tim Lemberg", number: 7 },
  },

  // SC Paderhausen (4-4-2)
  pad: {
    0: { name: "Markus Huth", number: 1 },
    1: { name: "Rafa Obermai", number: 22 },
    2: { name: "Viso Muslin", number: 4 },
    3: { name: "Filip Bilbo", number: 5 },
    4: { name: "Cal Brackel", number: 3 },
    5: { name: "Ilyo Ansar", number: 8 },
    6: { name: "Adro Grimald", number: 6 },
    7: { name: "Sven Michler", number: 11 },
    8: { name: "Felix Plattner", number: 14 },
    9: { name: "Marv Pierin", number: 9 },
    10: { name: "Koen Koston", number: 27 },
  },

  // SV Elversbergen (4-2-3-1)
  elv: {
    0: { name: "Nico Kristen", number: 1 },
    1: { name: "Lukas Pinker", number: 3 },
    2: { name: "Carlo Sickin", number: 6 },
    3: { name: "Marco Correa", number: 4 },
    4: { name: "Robin Fellner", number: 2 },
    5: { name: "Paul Stocker", number: 8 },
    6: { name: "Tom Zimmer", number: 10 },
    7: { name: "Fisko Asllan", number: 11 },
    8: { name: "Yunis Ebno", number: 7 },
    9: { name: "Manu Feiler", number: 20 },
    10: { name: "Luka Petko", number: 17 },
  },
};

// Baut die 11er-Aufstellung für ein Team: Namen + Rollen + Welt-Positionen.
// attackRight = true  -> Team greift nach rechts an (eigenes Tor links).
export function buildSquad(team, attackRight) {
  const formation = FORMATIONS[team.formation];
  const seed = hash(team.id);
  const overrides = SQUAD_OVERRIDES[team.id] || {};

  return formation.map((slot, i) => {
    const fn = FIRST_NAMES[(seed + i * 7) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(seed + i * 13 + 5) % LAST_NAMES.length];

    // Relative -> Welt-Koordinaten, je nach Angriffsrichtung gespiegelt.
    const fx = attackRight ? slot.x : 1 - slot.x;
    const homeX = MARGIN + fx * FIELD.width;
    const homeY = MARGIN + slot.y * FIELD.height;

    const ov = overrides[i] || {};
    return {
      name: ov.name || `${fn} ${ln}`,
      role: slot.role,
      number: ov.number ?? i + 1,
      build: ov.build,   // optionaler Statur-Faktor (z. B. stämmiger Spieler)
      homeX,
      homeY,
    };
  });
}
