// Datenbasis: 18 Mannschaften, angelehnt an die Bundesliga, mit ausgedachten
// Fake-Namen (Teams & Spieler) und echten Startelf-Formationen.
//
// Die Formationen sind als relative Positionen hinterlegt (x: 0 = eigenes Tor,
// 1 = gegnerisches Tor / y: 0 = oben, 1 = unten) und werden im Spiel auf
// Welt-Koordinaten und Angriffsrichtung umgerechnet.

import { MARGIN, FIELD } from "./config.js?v=w";

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
  // Bavaria München (4-2-3-1): individuelle Aufstellung mit Fake-Namen.
  bav: {
    0: { name: "Manuel Neumann", number: 1 },    // TW
    1: { name: "Alfonso Davila", number: 19 },   // LV
    2: { name: "Dion Upagecu", number: 4 },      // IV
    3: { name: "Kim Min-Jae Song", number: 3 },  // IV
    4: { name: "Josip Stanic", number: 2 },      // RV
    5: { name: "Jacob Jajo", number: 6 },        // DM — bleibt
    6: { name: "Alexander Pavlo", number: 45 },  // DM — bleibt
    7: { name: "Leroy Sané-Berg", number: 10 },  // OM
    8: { name: "Jamal Muserati", number: 42 },   // OM
    9: { name: "Serge Gnabbuni", number: 7 },    // OM
    10: { name: "Harry Cane", number: 9 },       // ST
  },

  // Borussia Dortmunder (4-3-3)
  dor: {
    0: { name: "Gregor Kobold", number: 1 },
    1: { name: "Ramy Bensbaini", number: 5 },
    2: { name: "Niko Schloss", number: 15 },
    3: { name: "Wald Anton", number: 2 },
    4: { name: "Julian Ryerson", number: 26 },
    5: { name: "Marcel Sabatzer", number: 20 },
    6: { name: "Pascal Groß-Mann", number: 13 },
    7: { name: "Felix Nmecha", number: 8 },
    8: { name: "Karim Adiyemi", number: 27 },
    9: { name: "Sebastian Haaler", number: 9 },
    10: { name: "Jamie Gittins", number: 7 },
  },

  // RB Laibzig (4-2-3-1)
  lai: {
    0: { name: "Peter Gulasch", number: 1 },
    1: { name: "David Raum-Zeit", number: 22 },
    2: { name: "Willi Orban-Sky", number: 4 },
    3: { name: "Castello Lukeba", number: 23 },
    4: { name: "Benji Henrichs", number: 39 },
    5: { name: "Xavi Simonsen", number: 10 },
    6: { name: "Nico Seiwald", number: 13 },
    7: { name: "Antonio Nusa-Berg", number: 24 },
    8: { name: "Dani Olmer", number: 7 },
    9: { name: "Lois Openda", number: 17 },
    10: { name: "Benni Sesko", number: 30 },
  },

  // Bayer Leverbusen (4-3-3)
  lev: {
    0: { name: "Lukas Hradezky", number: 1 },
    1: { name: "Alex Grimaldo", number: 20 },
    2: { name: "Jonathan Tah-Berg", number: 4 },
    3: { name: "Edmond Tapsoba", number: 12 },
    4: { name: "Jeremie Frimpong", number: 30 },
    5: { name: "Granit Xhakan", number: 34 },
    6: { name: "Robert Andritsch", number: 8 },
    7: { name: "Florian Wirtzig", number: 10 },
    8: { name: "Jonas Hofmeister", number: 7 },
    9: { name: "Victor Bonifazi", number: 22 },
    10: { name: "Amine Adler", number: 21 },
  },

  // Eintracht Frankenfurt (4-3-3)
  fra: {
    0: { name: "Kevin Trappold", number: 1 },
    1: { name: "Nathaniel Brown", number: 36 },
    2: { name: "Robin Koch-Berg", number: 5 },
    3: { name: "Arthur Theate", number: 35 },
    4: { name: "Rasmus Kristofer", number: 23 },
    5: { name: "Ellis Skhiri", number: 15 },
    6: { name: "Hugo Larsson", number: 16 },
    7: { name: "Mario Götzen", number: 27 },
    8: { name: "Ansgar Knauff", number: 18 },
    9: { name: "Omar Marmusch", number: 7 },
    10: { name: "Hugo Ekitiké", number: 11 },
  },

  // VfB Stuttgarten (4-2-3-1)
  stu: {
    0: { name: "Alex Nübling", number: 33 },
    1: { name: "Maxi Mittelstädt", number: 18 },
    2: { name: "Waldemar Anton", number: 4 },
    3: { name: "Jeff Chabot", number: 24 },
    4: { name: "Josha Vagnomann", number: 2 },
    5: { name: "Atakan Karazor", number: 16 },
    6: { name: "Angelo Stiller", number: 6 },
    7: { name: "Chris Führich", number: 27 },
    8: { name: "Enzo Millot", number: 8 },
    9: { name: "Jamie Leweling", number: 26 },
    10: { name: "Ermedin Demirovic", number: 9 },
  },

  // SC Freiburger (4-4-2)
  fre: {
    0: { name: "Noah Atubolu", number: 1 },
    1: { name: "Christian Günther", number: 30 },
    2: { name: "Matthias Ginter", number: 28 },
    3: { name: "Philipp Lienhart", number: 3 },
    4: { name: "Lukas Kübler", number: 24 },
    5: { name: "Vincenzo Grifo", number: 32 },
    6: { name: "Maxi Eggestein", number: 35 },
    7: { name: "Patrick Osterhage", number: 6 },
    8: { name: "Ritsu Doan-Berg", number: 42 },
    9: { name: "Lucas Höler", number: 9 },
    10: { name: "Junior Adamu", number: 27 },
  },

  // TSG Hoffenheimer (4-2-3-1)
  hof: {
    0: { name: "Oliver Baumeister", number: 1 },
    1: { name: "David Jurasek", number: 3 },
    2: { name: "Ozan Kabaktepe", number: 25 },
    3: { name: "Stanley Nsoki", number: 15 },
    4: { name: "Pavel Kaderabek", number: 4 },
    5: { name: "Grischa Prömel", number: 21 },
    6: { name: "Tom Bischoff", number: 39 },
    7: { name: "Anton Stachel", number: 7 },
    8: { name: "Andrej Kramaric", number: 27 },
    9: { name: "Maxi Beier-Berg", number: 11 },
    10: { name: "Haris Tabakovic", number: 9 },
  },

  // Werder Bremerhaven (4-4-2)
  wer: {
    0: { name: "Michael Zetterer", number: 30 },
    1: { name: "Anthony Jung", number: 3 },
    2: { name: "Marco Friedl", number: 32 },
    3: { name: "Niklas Stark-Berg", number: 4 },
    4: { name: "Mitchell Weiser", number: 8 },
    5: { name: "Romano Schmidt", number: 20 },
    6: { name: "Senne Lynen", number: 28 },
    7: { name: "Jens Stagge", number: 19 },
    8: { name: "Leonardo Bittencourt", number: 10 },
    9: { name: "Marvin Ducksch", number: 14 },
    10: { name: "Justin Njinmah", number: 24 },
  },

  // VfL Wolfsbürg (4-2-3-1)
  wob: {
    0: { name: "Kamil Grabarah", number: 1 },
    1: { name: "Ridle Baku", number: 40 },
    2: { name: "Maxence Lacroix", number: 4 },
    3: { name: "Sebastiaan Bornauw", number: 21 },
    4: { name: "Joakim Maehle", number: 2 },
    5: { name: "Mattias Svanberg", number: 8 },
    6: { name: "Yannick Gerhardt", number: 31 },
    7: { name: "Patrick Wimmer", number: 11 },
    8: { name: "Lovro Majer", number: 30 },
    9: { name: "Jonas Wind-Berg", number: 23 },
    10: { name: "Tiago Tomasso", number: 9 },
  },

  // Borussia Münchenglad (4-3-3)
  bmg: {
    0: { name: "Moritz Nicolas", number: 1 },
    1: { name: "Luca Netz-Berg", number: 18 },
    2: { name: "Ko Itakura", number: 25 },
    3: { name: "Nico Elvedi", number: 30 },
    4: { name: "Joe Scally", number: 29 },
    5: { name: "Julian Weigl", number: 16 },
    6: { name: "Rocco Reitz", number: 8 },
    7: { name: "Florian Neuhaus", number: 32 },
    8: { name: "Alassane Plea", number: 14 },
    9: { name: "Tim Kleindienst", number: 9 },
    10: { name: "Robin Hack-Berg", number: 23 },
  },

  // Union Berliner (4-4-2)
  uni: {
    0: { name: "Frederik Rönnow", number: 1 },
    1: { name: "Jerome Roussillon", number: 24 },
    2: { name: "Diogo Leite", number: 30 },
    3: { name: "Danilho Doekhi", number: 5 },
    4: { name: "Christopher Trimmel", number: 28 },
    5: { name: "Janik Haberer", number: 16 },
    6: { name: "Rani Khedira", number: 8 },
    7: { name: "Andras Schäfer", number: 20 },
    8: { name: "Benedict Hollerbach", number: 11 },
    9: { name: "Andrej Ilic", number: 9 },
    10: { name: "Wooyeong Jeong", number: 19 },
  },

  // FC Augsburger (4-4-2)
  aug: {
    0: { name: "Finn Dahmen", number: 1 },
    1: { name: "Mads Pedersen", number: 23 },
    2: { name: "Keven Schlotterbeck", number: 25 },
    3: { name: "Cedric Zesiger", number: 19 },
    4: { name: "Robert Gumny", number: 2 },
    5: { name: "Elvis Rexhbecaj", number: 17 },
    6: { name: "Arne Maier-Berg", number: 18 },
    7: { name: "Ruben Vargas", number: 16 },
    8: { name: "Kristijan Jakic", number: 6 },
    9: { name: "Alexis Claude-Maurice", number: 10 },
    10: { name: "Phillip Tietz", number: 29 },
  },

  // FSV Mainz 08 (4-2-3-1)
  mai: {
    0: { name: "Robin Zentner", number: 27 },
    1: { name: "Phillipp Mwene", number: 8 },
    2: { name: "Sepp van den Berg", number: 4 },
    3: { name: "Stefan Bell-Berg", number: 5 },
    4: { name: "Anthony Caci", number: 24 },
    5: { name: "Dominik Kohr", number: 6 },
    6: { name: "Kaishu Sano", number: 14 },
    7: { name: "Nadiem Amiri", number: 10 },
    8: { name: "Jae-Sung Lee", number: 17 },
    9: { name: "Brajan Gruda", number: 42 },
    10: { name: "Jonathan Burkardt", number: 29 },
  },

  // Schalke 05 (4-3-3)
  sch: {
    0: { name: "Justin Heekeren", number: 1 },
    1: { name: "Derry Murkin", number: 3 },
    2: { name: "Marcin Kaminski", number: 5 },
    3: { name: "Tomas Kalas", number: 4 },
    4: { name: "Mehmet Aydin", number: 2 },
    5: { name: "Ron Schallenberg", number: 6 },
    6: { name: "Tobias Mohr-Berg", number: 22 },
    7: { name: "Kenan Karaman", number: 11 },
    8: { name: "Amin Younes", number: 10 },
    9: { name: "Moussa Sylla", number: 18 },
    10: { name: "Pablo Donares", number: 7 },
  },

  // 1. FC Köllen (4-4-2)
  koe: {
    0: { name: "Marvin Schwäbe", number: 1 },
    1: { name: "Leart Paqarada", number: 21 },
    2: { name: "Timo Hübers", number: 4 },
    3: { name: "Dominique Heintz", number: 3 },
    4: { name: "Benno Schmitz", number: 2 },
    5: { name: "Eric Martel", number: 6 },
    6: { name: "Dejan Ljubicic", number: 17 },
    7: { name: "Linton Maina", number: 19 },
    8: { name: "Florian Kainz", number: 18 },
    9: { name: "Damion Downs", number: 33 },
    10: { name: "Tim Lemperle", number: 7 },
  },

  // SC Paderhausen (4-4-2)
  pad: {
    0: { name: "Markus Huth", number: 1 },
    1: { name: "Raphael Obermair", number: 22 },
    2: { name: "Visar Musliu", number: 4 },
    3: { name: "Filip Bilbija", number: 5 },
    4: { name: "Calvin Brackelmann", number: 3 },
    5: { name: "Ilyas Ansah", number: 8 },
    6: { name: "Adriano Grimaldi", number: 6 },
    7: { name: "Sven Michel-Berg", number: 11 },
    8: { name: "Felix Platte", number: 14 },
    9: { name: "Marvin Pieringer", number: 9 },
    10: { name: "Koen Kostons", number: 27 },
  },

  // SV Elversbergen (4-2-3-1)
  elv: {
    0: { name: "Nicolas Kristin", number: 1 },
    1: { name: "Lukas Pinckert", number: 3 },
    2: { name: "Carlo Sickinger", number: 6 },
    3: { name: "Marcel Correia", number: 4 },
    4: { name: "Robin Fellhauer", number: 2 },
    5: { name: "Paul Stock-Berg", number: 8 },
    6: { name: "Tom Zimmerschied", number: 10 },
    7: { name: "Fisnik Asllani", number: 11 },
    8: { name: "Younes Ebnoutalib", number: 7 },
    9: { name: "Manuel Feil", number: 20 },
    10: { name: "Lukas Petkov", number: 17 },
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
      homeX,
      homeY,
    };
  });
}
