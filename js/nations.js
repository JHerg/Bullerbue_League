// WM-Datensatz: 48 Nationen (echte Ländernamen + Landesfarben), angelehnt an
// die WM 2026. Spielernamen werden – wie bei den Vereinen – als Fake-Namen
// generiert. Farben: [Trikot, Kontur].
// Dieses Modul importiert nichts aus teams.js (kein Zyklus).

export const NATIONS = [
  { id: "n_ger", name: "Deutschland",   short: "GER", colors: ["#ffffff", "#111111"], formation: "4-2-3-1", rating: 88 },
  { id: "n_bra", name: "Brasilien",     short: "BRA", colors: ["#ffd600", "#1b5e20"], formation: "4-3-3",   rating: 89 },
  { id: "n_fra", name: "Frankreich",    short: "FRA", colors: ["#1565c0", "#ffffff"], formation: "4-3-3",   rating: 90 },
  { id: "n_arg", name: "Argentinien",   short: "ARG", colors: ["#6ec6ff", "#ffffff"], formation: "4-4-2",   rating: 90 },
  { id: "n_esp", name: "Spanien",       short: "ESP", colors: ["#c62828", "#ffd600"], formation: "4-3-3",   rating: 89 },
  { id: "n_eng", name: "England",       short: "ENG", colors: ["#ffffff", "#c62828"], formation: "4-2-3-1", rating: 88 },
  { id: "n_por", name: "Portugal",      short: "POR", colors: ["#b71c1c", "#1b5e20"], formation: "4-3-3",   rating: 87 },
  { id: "n_ned", name: "Niederlande",   short: "NED", colors: ["#ef6c00", "#ffffff"], formation: "4-3-3",   rating: 86 },
  { id: "n_ita", name: "Italien",       short: "ITA", colors: ["#1565c0", "#ffffff"], formation: "4-4-2",   rating: 85 },
  { id: "n_bel", name: "Belgien",       short: "BEL", colors: ["#c62828", "#ffd600"], formation: "4-2-3-1", rating: 85 },
  { id: "n_cro", name: "Kroatien",      short: "CRO", colors: ["#d32f2f", "#ffffff"], formation: "4-3-3",   rating: 84 },
  { id: "n_uru", name: "Uruguay",       short: "URU", colors: ["#4fc3f7", "#111111"], formation: "4-4-2",   rating: 83 },
  { id: "n_usa", name: "USA",           short: "USA", colors: ["#1a237e", "#ffffff"], formation: "4-3-3",   rating: 80 },
  { id: "n_mex", name: "Mexiko",        short: "MEX", colors: ["#1b5e20", "#ffffff"], formation: "4-3-3",   rating: 80 },
  { id: "n_col", name: "Kolumbien",     short: "COL", colors: ["#ffd600", "#1565c0"], formation: "4-2-3-1", rating: 82 },
  { id: "n_mar", name: "Marokko",       short: "MAR", colors: ["#b71c1c", "#1b5e20"], formation: "4-3-3",   rating: 83 },
  { id: "n_jpn", name: "Japan",         short: "JPN", colors: ["#0d47a1", "#ffffff"], formation: "4-2-3-1", rating: 81 },
  { id: "n_sen", name: "Senegal",       short: "SEN", colors: ["#1b5e20", "#ffd600"], formation: "4-3-3",   rating: 81 },
  { id: "n_sui", name: "Schweiz",       short: "SUI", colors: ["#c62828", "#ffffff"], formation: "4-2-3-1", rating: 80 },
  { id: "n_den", name: "Dänemark",      short: "DEN", colors: ["#c62828", "#ffffff"], formation: "4-3-3",   rating: 81 },
  { id: "n_kor", name: "Südkorea",      short: "KOR", colors: ["#c62828", "#0d47a1"], formation: "4-4-2",   rating: 78 },
  { id: "n_ecu", name: "Ecuador",       short: "ECU", colors: ["#ffd600", "#1565c0"], formation: "4-4-2",   rating: 77 },
  { id: "n_aut", name: "Österreich",    short: "AUT", colors: ["#d32f2f", "#ffffff"], formation: "4-2-3-1", rating: 80 },
  { id: "n_pol", name: "Polen",         short: "POL", colors: ["#ffffff", "#c62828"], formation: "4-4-2",   rating: 78 },
  { id: "n_ser", name: "Serbien",       short: "SRB", colors: ["#c62828", "#1565c0"], formation: "4-2-3-1", rating: 79 },
  { id: "n_wal", name: "Wales",         short: "WAL", colors: ["#c62828", "#1b5e20"], formation: "4-4-2",   rating: 76 },
  { id: "n_aus", name: "Australien",    short: "AUS", colors: ["#ffd600", "#1b5e20"], formation: "4-4-2",   rating: 76 },
  { id: "n_can", name: "Kanada",        short: "CAN", colors: ["#c62828", "#ffffff"], formation: "4-3-3",   rating: 77 },
  { id: "n_nor", name: "Norwegen",      short: "NOR", colors: ["#c62828", "#0d47a1"], formation: "4-3-3",   rating: 80 },
  { id: "n_tur", name: "Türkei",        short: "TUR", colors: ["#c62828", "#ffffff"], formation: "4-2-3-1", rating: 78 },
  { id: "n_nga", name: "Nigeria",       short: "NGA", colors: ["#1b5e20", "#ffffff"], formation: "4-3-3",   rating: 79 },
  { id: "n_civ", name: "Elfenbeinküste",short: "CIV", colors: ["#ef6c00", "#1b5e20"], formation: "4-3-3",   rating: 78 },
  { id: "n_egy", name: "Ägypten",       short: "EGY", colors: ["#c62828", "#111111"], formation: "4-2-3-1", rating: 78 },
  { id: "n_gha", name: "Ghana",         short: "GHA", colors: ["#c62828", "#ffd600"], formation: "4-3-3",   rating: 76 },
  { id: "n_cmr", name: "Kamerun",       short: "CMR", colors: ["#1b5e20", "#c62828"], formation: "4-4-2",   rating: 76 },
  { id: "n_per", name: "Peru",          short: "PER", colors: ["#c62828", "#ffffff"], formation: "4-4-2",   rating: 74 },
  { id: "n_chi", name: "Chile",         short: "CHI", colors: ["#c62828", "#1565c0"], formation: "4-3-3",   rating: 75 },
  { id: "n_par", name: "Paraguay",      short: "PAR", colors: ["#c62828", "#1565c0"], formation: "4-4-2",   rating: 73 },
  { id: "n_sco", name: "Schottland",    short: "SCO", colors: ["#1565c0", "#ffffff"], formation: "4-4-2",   rating: 76 },
  { id: "n_cze", name: "Tschechien",    short: "CZE", colors: ["#c62828", "#1565c0"], formation: "4-2-3-1", rating: 76 },
  { id: "n_swe", name: "Schweden",      short: "SWE", colors: ["#ffd600", "#0d47a1"], formation: "4-4-2",   rating: 77 },
  { id: "n_qat", name: "Katar",         short: "QAT", colors: ["#7b1530", "#ffffff"], formation: "4-2-3-1", rating: 70 },
  { id: "n_ksa", name: "Saudi-Arabien", short: "KSA", colors: ["#1b5e20", "#ffffff"], formation: "4-4-2",   rating: 72 },
  { id: "n_irn", name: "Iran",          short: "IRN", colors: ["#ffffff", "#1b5e20"], formation: "4-4-2",   rating: 74 },
  { id: "n_tun", name: "Tunesien",      short: "TUN", colors: ["#c62828", "#ffffff"], formation: "4-4-2",   rating: 73 },
  { id: "n_alg", name: "Algerien",      short: "ALG", colors: ["#1b5e20", "#ffffff"], formation: "4-3-3",   rating: 76 },
  { id: "n_cri", name: "Costa Rica",    short: "CRC", colors: ["#c62828", "#1565c0"], formation: "4-4-2",   rating: 72 },
  { id: "n_nzl", name: "Neuseeland",    short: "NZL", colors: ["#111111", "#ffffff"], formation: "4-4-2",   rating: 70 },
];

// Team-Objekte (ohne rating-Feld) und Rating-Map fürs teams.js-Umschalten.
export const NATION_TEAMS = NATIONS.map(({ rating, ...t }) => t);
export const NATION_RATINGS = Object.fromEntries(NATIONS.map((n) => [n.id, n.rating]));
