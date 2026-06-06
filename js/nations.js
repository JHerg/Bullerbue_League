// WM-Datensatz: 48 Nationen (echte Ländernamen + Landesfarben), angelehnt an
// die WM 2026. Spielernamen werden – wie bei den Vereinen – als Fake-Namen
// generiert, aber pro Nation aus einem zur Region passenden Namens-Pool
// (`style`), damit ein Japaner japanisch und ein Brasilianer brasilianisch
// klingt (alles erfunden). Jede Nation hat zusätzlich einen Star (NATION_STARS).
// Farben: [Trikot, Kontur]. Dieses Modul importiert nichts aus teams.js.

export const NATIONS = [
  { id: "n_ger", name: "Deutschland",   short: "GER", colors: ["#ffffff", "#111111"], style: "de",     formation: "4-2-3-1", rating: 88 },
  { id: "n_bra", name: "Brasilien",     short: "BRA", colors: ["#ffd600", "#1b5e20"], style: "luso",   formation: "4-3-3",   rating: 89 },
  { id: "n_fra", name: "Frankreich",    short: "FRA", colors: ["#1565c0", "#ffffff"], style: "fr",     formation: "4-3-3",   rating: 90 },
  { id: "n_arg", name: "Argentinien",   short: "ARG", colors: ["#6ec6ff", "#ffffff"], style: "latam",  formation: "4-4-2",   rating: 90 },
  { id: "n_esp", name: "Spanien",       short: "ESP", colors: ["#c62828", "#ffd600"], style: "es",     formation: "4-3-3",   rating: 89 },
  { id: "n_eng", name: "England",       short: "ENG", colors: ["#ffffff", "#c62828"], style: "en",     formation: "4-2-3-1", rating: 88 },
  { id: "n_por", name: "Portugal",      short: "POR", colors: ["#b71c1c", "#1b5e20"], style: "luso",   formation: "4-3-3",   rating: 87 },
  { id: "n_ned", name: "Niederlande",   short: "NED", colors: ["#ef6c00", "#ffffff"], style: "nl",     formation: "4-3-3",   rating: 86 },
  { id: "n_ita", name: "Italien",       short: "ITA", colors: ["#1565c0", "#ffffff"], style: "it",     formation: "4-4-2",   rating: 85 },
  { id: "n_bel", name: "Belgien",       short: "BEL", colors: ["#c62828", "#ffd600"], style: "fr",     formation: "4-2-3-1", rating: 85 },
  { id: "n_cro", name: "Kroatien",      short: "CRO", colors: ["#d32f2f", "#ffffff"], style: "east",   formation: "4-3-3",   rating: 84 },
  { id: "n_uru", name: "Uruguay",       short: "URU", colors: ["#4fc3f7", "#111111"], style: "latam",  formation: "4-4-2",   rating: 83 },
  { id: "n_usa", name: "USA",           short: "USA", colors: ["#1a237e", "#ffffff"], style: "en",     formation: "4-3-3",   rating: 80 },
  { id: "n_mex", name: "Mexiko",        short: "MEX", colors: ["#1b5e20", "#ffffff"], style: "latam",  formation: "4-3-3",   rating: 80 },
  { id: "n_col", name: "Kolumbien",     short: "COL", colors: ["#ffd600", "#1565c0"], style: "latam",  formation: "4-2-3-1", rating: 82 },
  { id: "n_mar", name: "Marokko",       short: "MAR", colors: ["#b71c1c", "#1b5e20"], style: "africa", formation: "4-3-3",   rating: 83 },
  { id: "n_jpn", name: "Japan",         short: "JPN", colors: ["#0d47a1", "#ffffff"], style: "jp",     formation: "4-2-3-1", rating: 81 },
  { id: "n_sen", name: "Senegal",       short: "SEN", colors: ["#1b5e20", "#ffd600"], style: "africa", formation: "4-3-3",   rating: 81 },
  { id: "n_sui", name: "Schweiz",       short: "SUI", colors: ["#c62828", "#ffffff"], style: "de",     formation: "4-2-3-1", rating: 80 },
  { id: "n_den", name: "Dänemark",      short: "DEN", colors: ["#c62828", "#ffffff"], style: "scandi", formation: "4-3-3",   rating: 81 },
  { id: "n_kor", name: "Südkorea",      short: "KOR", colors: ["#c62828", "#0d47a1"], style: "kr",     formation: "4-4-2",   rating: 78 },
  { id: "n_ecu", name: "Ecuador",       short: "ECU", colors: ["#ffd600", "#1565c0"], style: "latam",  formation: "4-4-2",   rating: 77 },
  { id: "n_aut", name: "Österreich",    short: "AUT", colors: ["#d32f2f", "#ffffff"], style: "de",     formation: "4-2-3-1", rating: 80 },
  { id: "n_pol", name: "Polen",         short: "POL", colors: ["#ffffff", "#c62828"], style: "east",   formation: "4-4-2",   rating: 78 },
  { id: "n_ser", name: "Serbien",       short: "SRB", colors: ["#c62828", "#1565c0"], style: "east",   formation: "4-2-3-1", rating: 79 },
  { id: "n_wal", name: "Wales",         short: "WAL", colors: ["#c62828", "#1b5e20"], style: "en",     formation: "4-4-2",   rating: 76 },
  { id: "n_aus", name: "Australien",    short: "AUS", colors: ["#ffd600", "#1b5e20"], style: "en",     formation: "4-4-2",   rating: 76 },
  { id: "n_can", name: "Kanada",        short: "CAN", colors: ["#c62828", "#ffffff"], style: "en",     formation: "4-3-3",   rating: 77 },
  { id: "n_nor", name: "Norwegen",      short: "NOR", colors: ["#c62828", "#0d47a1"], style: "scandi", formation: "4-3-3",   rating: 80 },
  { id: "n_tur", name: "Türkei",        short: "TUR", colors: ["#c62828", "#ffffff"], style: "mena",   formation: "4-2-3-1", rating: 78 },
  { id: "n_nga", name: "Nigeria",       short: "NGA", colors: ["#1b5e20", "#ffffff"], style: "africa", formation: "4-3-3",   rating: 79 },
  { id: "n_civ", name: "Elfenbeinküste",short: "CIV", colors: ["#ef6c00", "#1b5e20"], style: "africa", formation: "4-3-3",   rating: 78 },
  { id: "n_egy", name: "Ägypten",       short: "EGY", colors: ["#c62828", "#111111"], style: "africa", formation: "4-2-3-1", rating: 78 },
  { id: "n_gha", name: "Ghana",         short: "GHA", colors: ["#c62828", "#ffd600"], style: "africa", formation: "4-3-3",   rating: 76 },
  { id: "n_cmr", name: "Kamerun",       short: "CMR", colors: ["#1b5e20", "#c62828"], style: "africa", formation: "4-4-2",   rating: 76 },
  { id: "n_per", name: "Peru",          short: "PER", colors: ["#c62828", "#ffffff"], style: "latam",  formation: "4-4-2",   rating: 74 },
  { id: "n_chi", name: "Chile",         short: "CHI", colors: ["#c62828", "#1565c0"], style: "latam",  formation: "4-3-3",   rating: 75 },
  { id: "n_par", name: "Paraguay",      short: "PAR", colors: ["#c62828", "#1565c0"], style: "latam",  formation: "4-4-2",   rating: 73 },
  { id: "n_sco", name: "Schottland",    short: "SCO", colors: ["#1565c0", "#ffffff"], style: "en",     formation: "4-4-2",   rating: 76 },
  { id: "n_cze", name: "Tschechien",    short: "CZE", colors: ["#c62828", "#1565c0"], style: "east",   formation: "4-2-3-1", rating: 76 },
  { id: "n_swe", name: "Schweden",      short: "SWE", colors: ["#ffd600", "#0d47a1"], style: "scandi", formation: "4-4-2",   rating: 77 },
  { id: "n_qat", name: "Katar",         short: "QAT", colors: ["#7b1530", "#ffffff"], style: "mena",   formation: "4-2-3-1", rating: 70 },
  { id: "n_ksa", name: "Saudi-Arabien", short: "KSA", colors: ["#1b5e20", "#ffffff"], style: "mena",   formation: "4-4-2",   rating: 72 },
  { id: "n_irn", name: "Iran",          short: "IRN", colors: ["#ffffff", "#1b5e20"], style: "mena",   formation: "4-4-2",   rating: 74 },
  { id: "n_tun", name: "Tunesien",      short: "TUN", colors: ["#c62828", "#ffffff"], style: "africa", formation: "4-4-2",   rating: 73 },
  { id: "n_alg", name: "Algerien",      short: "ALG", colors: ["#1b5e20", "#ffffff"], style: "africa", formation: "4-3-3",   rating: 76 },
  { id: "n_cri", name: "Costa Rica",    short: "CRC", colors: ["#c62828", "#1565c0"], style: "latam",  formation: "4-4-2",   rating: 72 },
  { id: "n_nzl", name: "Neuseeland",    short: "NZL", colors: ["#111111", "#ffffff"], style: "en",     formation: "4-4-2",   rating: 70 },
];

// Team-Objekte (ohne rating-Feld) und Rating-Map fürs teams.js-Umschalten.
export const NATION_TEAMS = NATIONS.map(({ rating, ...t }) => t);
export const NATION_RATINGS = Object.fromEntries(NATIONS.map((n) => [n.id, n.rating]));

// ---------------------------------------------------------------------------
// Regionale Namens-Pools (erfunden, nur dem Klang nach passend). first/last.
// ---------------------------------------------------------------------------
export const NAME_POOLS = {
  de: {
    first: ["Lukas", "Jonas", "Florian", "Tobias", "Felix", "Maximilian", "Niklas", "Moritz", "Leon", "Jannik", "Stefan", "Andreas"],
    last:  ["Brandl", "Hofer", "Wagner", "Keller", "Berger", "Gruber", "Lehmann", "Vogel", "Hartmann", "Schubert", "Wenger", "Forster", "Reinhardt", "Krieger", "Baumann", "Eder"],
  },
  en: {
    first: ["Jack", "Harry", "Owen", "Callum", "Liam", "George", "Charlie", "Ethan", "Mason", "Dylan", "Ryan", "Connor"],
    last:  ["Stoneham", "Brooks", "Tindall", "Larkin", "Carter", "Whitfield", "Hartley", "Pryce", "Marsh", "Dawson", "Fletcher", "Holloway", "Ramsey", "Frasier", "Bennett", "Sutton"],
  },
  es: {
    first: ["Pablo", "Sergio", "Alvaro", "Marco", "Hugo", "Iker", "Diego", "Adrian", "Mateo", "Nacho", "Bruno", "Carlos"],
    last:  ["Marquez", "Navarro", "Herrera", "Castillo", "Romero", "Vidal", "Serrano", "Iglesias", "Pardo", "Lozano", "Cano", "Reyes", "Aguilar", "Bravo", "Sanz", "Moya"],
  },
  latam: {
    first: ["Mateo", "Diego", "Lucas", "Bruno", "Matias", "Juan", "Hugo", "Emiliano", "Tomas", "Nicolas", "Facundo", "Ezequiel"],
    last:  ["Vega", "Castano", "Restrepo", "Ramirez", "Salas", "Reyes", "Benitez", "Cardona", "Estrada", "Acosta", "Ortega", "Medina", "Rojas", "Pereira", "Quiroga", "Maldonado"],
  },
  luso: {
    first: ["Caio", "Rui", "Joao", "Diogo", "Bruno", "Tiago", "Rafael", "Andre", "Goncalo", "Vitor", "Felipe", "Lucas"],
    last:  ["Ferreira", "Almeida", "Pereira", "Cardoso", "Tavares", "Moreira", "Soares", "Pacheco", "Barros", "Lobo", "Fonseca", "Magalhaes", "Antunes", "Carvalho", "Brito", "Nunes"],
  },
  fr: {
    first: ["Karl", "Yannick", "Lucas", "Theo", "Hugo", "Mathis", "Lilian", "Adrien", "Noah", "Enzo", "Maxime", "Clement"],
    last:  ["Mbenga", "Dubois", "Lefevre", "Moreau", "Girard", "Renaud", "Lacombe", "Marchand", "Dossou", "Lemaire", "Fontaine", "Perrin", "Bakayo", "Mendy", "Boucher", "Caron"],
  },
  it: {
    first: ["Marco", "Luca", "Matteo", "Lorenzo", "Andrea", "Davide", "Alessio", "Giorgio", "Simone", "Federico", "Nicolo", "Riccardo"],
    last:  ["Belli", "Romano", "Conti", "Greco", "Marchetti", "Ferrari", "Gallo", "Rinaldi", "Costa", "Moretti", "Barbieri", "Fabbri", "Villa", "Sartori", "Bruno", "Donati"],
  },
  nl: {
    first: ["Daan", "Sven", "Bram", "Lars", "Thijs", "Joost", "Ruben", "Stijn", "Jurgen", "Koen", "Tobias", "Mees"],
    last:  ["van Hoorn", "de Wit", "Bakker", "Visser", "van der Berg", "Jansen", "Kuiper", "Vermeer", "Bos", "Hendriks", "Smit", "Dekker", "van Loon", "Maas", "Kok", "Brouwer"],
  },
  scandi: {
    first: ["Mikkel", "Erik", "Viktor", "Magnus", "Anders", "Emil", "Kasper", "Henrik", "Oskar", "Niklas", "Jonas", "Mathias"],
    last:  ["Sorensen", "Haugland", "Lindqvist", "Johansson", "Berg", "Dahl", "Nilsson", "Lund", "Halvorsen", "Brekke", "Soderberg", "Moen", "Holm", "Aas", "Ekstrom", "Vik"],
  },
  east: {
    first: ["Luka", "Stefan", "Kacper", "Tomas", "Marko", "Ivan", "Filip", "Nikola", "Bartosz", "Petar", "Dario", "Milan"],
    last:  ["Maric", "Jovanic", "Zielski", "Novak", "Kovac", "Horvat", "Vukovic", "Wojcik", "Kucera", "Pavlic", "Mazur", "Dvorak", "Babic", "Reznik", "Tomic", "Stanic"],
  },
  jp: {
    first: ["Sora", "Haruto", "Ren", "Yuto", "Kaito", "Riku", "Daiki", "Sho", "Takumi", "Hayato", "Yuki", "Kenta"],
    last:  ["Takeda", "Mori", "Okada", "Ishii", "Hara", "Fujimoto", "Kato", "Nakai", "Sugimoto", "Maeda", "Hoshino", "Tani", "Kuroda", "Shimizu", "Aoki", "Ueda"],
  },
  kr: {
    first: ["Hyun-woo", "Min-su", "Ji-hoon", "Seung-min", "Dong-hyun", "Jae-won", "Sang-woo", "Tae-yang", "Joon-ho", "Young-jin", "Ha-neul", "Woo-jin"],
    last:  ["Bae", "Seo", "Yoon", "Jang", "Kwon", "Shin", "Hwang", "Moon", "Heo", "Nam", "Goo", "Ryu", "Hong", "Oh", "Baek", "Chae"],
  },
  africa: {
    first: ["Mamadou", "Chidi", "Yao", "Kwame", "Samuel", "Omar", "Ibrahim", "Sekou", "Idriss", "Cheikh", "Aboubacar", "Moussa"],
    last:  ["Ndiaye", "Okonkwo", "Konan", "Asante", "Eboa", "Diallo", "Drame", "Mensah", "Owusu", "Camara", "Sarr", "Kone", "Adebayo", "Nwosu", "Tchami", "Bamba"],
  },
  mena: {
    first: ["Khalid", "Faisal", "Reza", "Anis", "Riad", "Emre", "Mehdi", "Karim", "Yusuf", "Hamza", "Tarek", "Bilal"],
    last:  ["Al-Rawi", "Al-Harbi", "Karimi", "Brahmi", "Mansouri", "Yildmaz", "Demir", "Haidari", "Najjar", "Sahin", "Bouzid", "Cetin", "Aziz", "Kaya", "Ozan", "Farsi"],
  },
};

// ---------------------------------------------------------------------------
// Star-Spieler je Nation (erfunden). Wird in teams.js auf den Stürmer (ST)
// der Startelf gelegt – mit Nummer und optionalem Tempo-/Statur-Faktor.
// ---------------------------------------------------------------------------
// Feste Kader-Plätze je Nation (nach Aufstellungs-Index, wie bei den Vereinen).
// Deutschland: die bekannten Charaktere Jacob, Jürgi und Aleks.
export const NATION_OVERRIDES = {
  n_ger: {
    2: { name: "Jürgi Bluti", number: 99, build: 1.8 },  // IV — stämmig
    5: { name: "Jacob Jajo",  number: 6,  speed: 1.3 },  // DM — schnell
    6: { name: "Aleks Pavlo", number: 45 },              // DM
  },
};

export const NATION_STARS = {
  n_ger: { name: "Tobias Brandl",    number: 11, speed: 1.15 },
  n_bra: { name: "Caio Ferreira",    number: 10, speed: 1.28 },
  n_fra: { name: "Karl Mbenga",      number: 10, speed: 1.30 },
  n_arg: { name: "Mateo Vega",       number: 10, speed: 1.20 },
  n_esp: { name: "Pablo Marquez",    number: 9,  speed: 1.12 },
  n_eng: { name: "Harry Stoneham",   number: 9,  build: 1.20 },
  n_por: { name: "Rui Goncalo",      number: 7,  speed: 1.22 },
  n_ned: { name: "Daan van Hoorn",   number: 9,  build: 1.30 },
  n_ita: { name: "Marco Belli",      number: 9,  speed: 1.10 },
  n_bel: { name: "Yannick Dubois",   number: 10, speed: 1.18 },
  n_cro: { name: "Luka Maric",       number: 10, speed: 1.12 },
  n_uru: { name: "Diego Castano",    number: 9,  build: 1.25 },
  n_usa: { name: "Tyler Brooks",     number: 9,  speed: 1.18 },
  n_mex: { name: "Hugo Ramirez",     number: 11, speed: 1.22 },
  n_col: { name: "Juan Restrepo",    number: 10, speed: 1.15 },
  n_mar: { name: "Yassine Belkadi",  number: 7,  speed: 1.25 },
  n_jpn: { name: "Sora Takeda",      number: 10, speed: 1.20 },
  n_sen: { name: "Mamadou Ndiaye",   number: 9,  build: 1.30, speed: 1.10 },
  n_sui: { name: "Reto Brunner",     number: 9,  speed: 1.10 },
  n_den: { name: "Mikkel Sorensen",  number: 9,  build: 1.22 },
  n_kor: { name: "Hyun-woo Bae",     number: 7,  speed: 1.22 },
  n_ecu: { name: "Bryan Estrada",    number: 9,  speed: 1.18 },
  n_aut: { name: "Florian Gruber",   number: 9,  speed: 1.10 },
  n_pol: { name: "Kacper Zielski",   number: 9,  build: 1.30 },
  n_ser: { name: "Stefan Jovanic",   number: 9,  build: 1.25 },
  n_wal: { name: "Gareth Pryce",     number: 10, speed: 1.15 },
  n_aus: { name: "Jack Tindall",     number: 9,  build: 1.22 },
  n_can: { name: "Owen Larkin",      number: 11, speed: 1.25 },
  n_nor: { name: "Erik Haugland",    number: 9,  build: 1.30, speed: 1.15 },
  n_tur: { name: "Emre Yildmaz",     number: 10, speed: 1.15 },
  n_nga: { name: "Chidi Okonkwo",    number: 9,  speed: 1.25 },
  n_civ: { name: "Yao Konan",        number: 9,  build: 1.20 },
  n_egy: { name: "Omar Fahmy",       number: 10, speed: 1.20 },
  n_gha: { name: "Kwame Asante",     number: 9,  speed: 1.20 },
  n_cmr: { name: "Samuel Eboa",      number: 9,  build: 1.30 },
  n_per: { name: "Diego Salas",      number: 9,  speed: 1.10 },
  n_chi: { name: "Matias Reyes",     number: 10, speed: 1.15 },
  n_par: { name: "Lucas Benitez",    number: 9,  build: 1.18 },
  n_sco: { name: "Callum Frasier",   number: 9,  build: 1.20 },
  n_cze: { name: "Tomas Novak",      number: 9,  build: 1.18 },
  n_swe: { name: "Viktor Lindqvist", number: 9,  build: 1.25 },
  n_qat: { name: "Khalid Al-Rawi",   number: 10, speed: 1.12 },
  n_ksa: { name: "Faisal Al-Harbi",  number: 9,  speed: 1.10 },
  n_irn: { name: "Reza Karimi",      number: 9,  build: 1.18 },
  n_tun: { name: "Anis Brahmi",      number: 10, speed: 1.15 },
  n_alg: { name: "Riad Mansouri",    number: 7,  speed: 1.25 },
  n_cri: { name: "Joel Mora",        number: 9,  speed: 1.12 },
  n_nzl: { name: "Liam Carter",      number: 9,  build: 1.25 },
};
