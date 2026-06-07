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
  { id: "n_arg", name: "Argentinien",   short: "ARG", colors: ["#6ec6ff", "#ffffff"], style: "latam",  formation: "4-3-3",   rating: 90 },
  { id: "n_esp", name: "Spanien",       short: "ESP", colors: ["#c62828", "#ffd600"], style: "es",     formation: "4-3-3",   rating: 89 },
  { id: "n_eng", name: "England",       short: "ENG", colors: ["#ffffff", "#c62828"], style: "en",     formation: "4-2-3-1", rating: 88 },
  { id: "n_por", name: "Portugal",      short: "POR", colors: ["#b71c1c", "#1b5e20"], style: "luso",   formation: "4-3-3",   rating: 87 },
  { id: "n_ned", name: "Niederlande",   short: "NED", colors: ["#ef6c00", "#ffffff"], style: "nl",     formation: "4-3-3",   rating: 86 },
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
  { id: "n_kor", name: "Südkorea",      short: "KOR", colors: ["#c62828", "#0d47a1"], style: "kr",     formation: "4-4-2",   rating: 78 },
  { id: "n_ecu", name: "Ecuador",       short: "ECU", colors: ["#ffd600", "#1565c0"], style: "latam",  formation: "4-4-2",   rating: 77 },
  { id: "n_aut", name: "Österreich",    short: "AUT", colors: ["#d32f2f", "#ffffff"], style: "de",     formation: "4-2-3-1", rating: 80 },
  { id: "n_aus", name: "Australien",    short: "AUS", colors: ["#ffd600", "#1b5e20"], style: "en",     formation: "4-4-2",   rating: 76 },
  { id: "n_can", name: "Kanada",        short: "CAN", colors: ["#c62828", "#ffffff"], style: "en",     formation: "4-3-3",   rating: 77 },
  { id: "n_nor", name: "Norwegen",      short: "NOR", colors: ["#c62828", "#0d47a1"], style: "scandi", formation: "4-3-3",   rating: 80 },
  { id: "n_tur", name: "Türkei",        short: "TUR", colors: ["#c62828", "#ffffff"], style: "mena",   formation: "4-2-3-1", rating: 78 },
  { id: "n_civ", name: "Elfenbeinküste",short: "CIV", colors: ["#ef6c00", "#1b5e20"], style: "africa", formation: "4-3-3",   rating: 78 },
  { id: "n_egy", name: "Ägypten",       short: "EGY", colors: ["#c62828", "#111111"], style: "africa", formation: "4-2-3-1", rating: 78 },
  { id: "n_gha", name: "Ghana",         short: "GHA", colors: ["#c62828", "#ffd600"], style: "africa", formation: "4-3-3",   rating: 76 },
  { id: "n_par", name: "Paraguay",      short: "PAR", colors: ["#c62828", "#1565c0"], style: "latam",  formation: "4-4-2",   rating: 73 },
  { id: "n_sco", name: "Schottland",    short: "SCO", colors: ["#1565c0", "#ffffff"], style: "en",     formation: "4-4-2",   rating: 76 },
  { id: "n_cze", name: "Tschechien",    short: "CZE", colors: ["#c62828", "#1565c0"], style: "east",   formation: "4-2-3-1", rating: 76 },
  { id: "n_swe", name: "Schweden",      short: "SWE", colors: ["#ffd600", "#0d47a1"], style: "scandi", formation: "4-4-2",   rating: 77 },
  { id: "n_qat", name: "Katar",         short: "QAT", colors: ["#7b1530", "#ffffff"], style: "mena",   formation: "4-2-3-1", rating: 70 },
  { id: "n_ksa", name: "Saudi-Arabien", short: "KSA", colors: ["#1b5e20", "#ffffff"], style: "mena",   formation: "4-4-2",   rating: 72 },
  { id: "n_irn", name: "Iran",          short: "IRN", colors: ["#ffffff", "#1b5e20"], style: "mena",   formation: "4-4-2",   rating: 74 },
  { id: "n_tun", name: "Tunesien",      short: "TUN", colors: ["#c62828", "#ffffff"], style: "africa", formation: "4-4-2",   rating: 73 },
  { id: "n_alg", name: "Algerien",      short: "ALG", colors: ["#1b5e20", "#ffffff"], style: "africa", formation: "4-3-3",   rating: 76 },
  { id: "n_nzl", name: "Neuseeland",    short: "NZL", colors: ["#111111", "#ffffff"], style: "en",     formation: "4-4-2",   rating: 66 },
  // Weitere echte WM26-Qualifikanten
  { id: "n_cod", name: "DR Kongo",      short: "COD", colors: ["#1565c0", "#ffd600"], style: "africa", formation: "4-3-3",   rating: 74 },
  { id: "n_bih", name: "Bosnien-Herz.", short: "BIH", colors: ["#1565c0", "#ffd600"], style: "east",   formation: "4-2-3-1", rating: 73 },
  { id: "n_rsa", name: "Südafrika",     short: "RSA", colors: ["#1b7a3d", "#ffd600"], style: "africa", formation: "4-3-3",   rating: 72 },
  { id: "n_uzb", name: "Usbekistan",    short: "UZB", colors: ["#1565c0", "#ffffff"], style: "mena",   formation: "4-3-3",   rating: 71 },
  { id: "n_cpv", name: "Kap Verde",     short: "CPV", colors: ["#1565c0", "#ffffff"], style: "luso",   formation: "4-3-3",   rating: 70 },
  { id: "n_irq", name: "Irak",          short: "IRQ", colors: ["#1b7a3d", "#ffffff"], style: "mena",   formation: "4-2-3-1", rating: 67 },
  { id: "n_pan", name: "Panama",        short: "PAN", colors: ["#c62828", "#1565c0"], style: "latam",  formation: "4-4-2",   rating: 66 },
  { id: "n_jor", name: "Jordanien",     short: "JOR", colors: ["#c62828", "#111111"], style: "mena",   formation: "4-3-3",   rating: 64 },
  { id: "n_hai", name: "Haiti",         short: "HAI", colors: ["#1565c0", "#c62828"], style: "fr",     formation: "4-4-2",   rating: 61 },
  { id: "n_cuw", name: "Curaçao",       short: "CUW", colors: ["#0d47a1", "#ffd600"], style: "nl",     formation: "4-3-3",   rating: 58 },
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
// Feste, möglichst echte Startelfs je Nation (nach Aufstellungs-Index passend
// zur Formation). Wird im WM-Modus statt der generierten Namen genutzt.
// Etappe 1: Top-Favoriten. Deutschland behält Jacob/Jürgi/Aleks.
export const NATION_OVERRIDES = {
  // Deutschland (4-2-3-1) — echte Namen + die drei Charaktere im Mittelfeld.
  // Echter WM26-Kader (nominiert 21.05.2026, Nagelsmann): Füllkrug NICHT dabei,
  // Neuer kehrt zurück, Havertz als Mittelstürmer. Plus die drei Charaktere.
  n_ger: {
    0:  { name: "Manuel Neuer", number: 1 },
    1:  { name: "David Raum", number: 20 },
    2:  { name: "Jürgi Bluti", number: 99, build: 1.8 },   // IV — stämmig (Charakter)
    3:  { name: "Jonathan Tah", number: 4 },
    4:  { name: "Joshua Kimmich", number: 18 },
    5:  { name: "Jacob Jajo", number: 6, speed: 1.3 },     // DM — schnell (Charakter)
    6:  { name: "Aleks Pavlo", number: 45 },               // DM (Charakter)
    7:  { name: "Leroy Sané", number: 19 },
    8:  { name: "Jamal Musiala", number: 10 },
    9:  { name: "Florian Wirtz", number: 17 },
    10: { name: "Kai Havertz", number: 7 },
  },

  // Frankreich (4-3-3)
  n_fra: {
    0:  { name: "Mike Maignan", number: 16 },
    1:  { name: "Théo Hernández", number: 22 },
    2:  { name: "Dayot Upamecano", number: 4 },
    3:  { name: "William Saliba", number: 17 },
    4:  { name: "Jules Koundé", number: 5 },
    5:  { name: "Aurélien Tchouaméni", number: 8 },
    6:  { name: "Eduardo Camavinga", number: 6 },
    7:  { name: "Adrien Rabiot", number: 14 },
    8:  { name: "Kylian Mbappé", number: 10 },
    9:  { name: "Marcus Thuram", number: 9 },
    10: { name: "Ousmane Dembélé", number: 11 },
  },

  // Brasilien (4-3-3)
  n_bra: {
    0:  { name: "Alisson", number: 1 },
    1:  { name: "Wendell", number: 6 },
    2:  { name: "Marquinhos", number: 4 },
    3:  { name: "Gabriel Magalhães", number: 3 },
    4:  { name: "Danilo", number: 2 },
    5:  { name: "Bruno Guimarães", number: 8 },
    6:  { name: "Lucas Paquetá", number: 10 },
    7:  { name: "André", number: 5 },
    8:  { name: "Vinícius Júnior", number: 7 },
    9:  { name: "Endrick", number: 9 },
    10: { name: "Rodrygo", number: 11 },
  },

  // Argentinien (4-3-3)
  n_arg: {
    0:  { name: "Emiliano Martínez", number: 23 },
    1:  { name: "Nicolás Tagliafico", number: 3 },
    2:  { name: "Cristian Romero", number: 13 },
    3:  { name: "Nicolás Otamendi", number: 19 },
    4:  { name: "Nahuel Molina", number: 26 },
    5:  { name: "Enzo Fernández", number: 24 },
    6:  { name: "Alexis Mac Allister", number: 20 },
    7:  { name: "Rodrigo De Paul", number: 7 },
    8:  { name: "Lionel Messi", number: 10 },
    9:  { name: "Julián Álvarez", number: 9 },
    10: { name: "Lautaro Martínez", number: 22 },
  },

  // Spanien (4-3-3)
  n_esp: {
    0:  { name: "Unai Simón", number: 23 },
    1:  { name: "Marc Cucurella", number: 24 },
    2:  { name: "Robin Le Normand", number: 3 },
    3:  { name: "Aymeric Laporte", number: 14 },
    4:  { name: "Dani Carvajal", number: 2 },
    5:  { name: "Rodri", number: 16 },
    6:  { name: "Pedri", number: 8 },
    7:  { name: "Fabián Ruiz", number: 12 },
    8:  { name: "Nico Williams", number: 17 },
    9:  { name: "Álvaro Morata", number: 7 },
    10: { name: "Lamine Yamal", number: 19 },
  },

  // England (4-2-3-1)
  n_eng: {
    0:  { name: "Jordan Pickford", number: 1 },
    1:  { name: "Luke Shaw", number: 3 },
    2:  { name: "John Stones", number: 5 },
    3:  { name: "Marc Guéhi", number: 6 },
    4:  { name: "Kyle Walker", number: 2 },
    5:  { name: "Declan Rice", number: 4 },
    6:  { name: "Jude Bellingham", number: 10 },
    7:  { name: "Bukayo Saka", number: 7 },
    8:  { name: "Phil Foden", number: 11 },
    9:  { name: "Cole Palmer", number: 24 },
    10: { name: "Harry Kane", number: 9 },
  },

  // Portugal (4-3-3)
  n_por: {
    0:  { name: "Diogo Costa", number: 22 },
    1:  { name: "Nuno Mendes", number: 19 },
    2:  { name: "Rúben Dias", number: 3 },
    3:  { name: "António Silva", number: 14 },
    4:  { name: "João Cancelo", number: 20 },
    5:  { name: "Vitinha", number: 6 },
    6:  { name: "Bruno Fernandes", number: 8 },
    7:  { name: "João Palhinha", number: 26 },
    8:  { name: "Rafael Leão", number: 15 },
    9:  { name: "Gonçalo Ramos", number: 21 },
    10: { name: "Bernardo Silva", number: 10 },
  },

  // Niederlande (4-3-3)
  n_ned: {
    0:  { name: "Bart Verbruggen", number: 1 },
    1:  { name: "Nathan Aké", number: 5 },
    2:  { name: "Virgil van Dijk", number: 4 },
    3:  { name: "Matthijs de Ligt", number: 3 },
    4:  { name: "Denzel Dumfries", number: 22 },
    5:  { name: "Frenkie de Jong", number: 21 },
    6:  { name: "Tijjani Reijnders", number: 14 },
    7:  { name: "Ryan Gravenberch", number: 18 },
    8:  { name: "Cody Gakpo", number: 11 },
    9:  { name: "Memphis Depay", number: 10 },
    10: { name: "Xavi Simons", number: 7 },
  },

  // Belgien (4-2-3-1)
  n_bel: {
    0:  { name: "Koen Casteels", number: 1 },
    1:  { name: "Maxim De Cuyper", number: 15 },
    2:  { name: "Wout Faes", number: 4 },
    3:  { name: "Zeno Debast", number: 3 },
    4:  { name: "Timothy Castagne", number: 21 },
    5:  { name: "Amadou Onana", number: 8 },
    6:  { name: "Youri Tielemans", number: 17 },
    7:  { name: "Jérémy Doku", number: 11 },
    8:  { name: "Kevin De Bruyne", number: 7 },
    9:  { name: "Leandro Trossard", number: 10 },
    10: { name: "Romelu Lukaku", number: 9 },
  },

  // Kroatien (4-3-3)
  n_cro: {
    0:  { name: "Dominik Livaković", number: 1 },
    1:  { name: "Borna Sosa", number: 19 },
    2:  { name: "Joško Gvardiol", number: 20 },
    3:  { name: "Josip Šutalo", number: 5 },
    4:  { name: "Josip Stanišić", number: 2 },
    5:  { name: "Luka Modrić", number: 10 },
    6:  { name: "Marcelo Brozović", number: 11 },
    7:  { name: "Mateo Kovačić", number: 8 },
    8:  { name: "Ivan Perišić", number: 4 },
    9:  { name: "Andrej Kramarić", number: 9 },
    10: { name: "Mario Pašalić", number: 15 },
  },

  // Uruguay (4-4-2)
  n_uru: {
    0:  { name: "Sergio Rochet", number: 1 },
    1:  { name: "Matías Viña", number: 17 },
    2:  { name: "José María Giménez", number: 2 },
    3:  { name: "Ronald Araújo", number: 4 },
    4:  { name: "Nahitan Nández", number: 16 },
    5:  { name: "Facundo Pellistri", number: 11 },
    6:  { name: "Federico Valverde", number: 15 },
    7:  { name: "Manuel Ugarte", number: 5 },
    8:  { name: "Nicolás De La Cruz", number: 10 },
    9:  { name: "Darwin Núñez", number: 19 },
    10: { name: "Brian Rodríguez", number: 21 },
  },

  // USA (4-3-3)
  n_usa: {
    0:  { name: "Matt Turner", number: 1 },
    1:  { name: "Antonee Robinson", number: 5 },
    2:  { name: "Chris Richards", number: 3 },
    3:  { name: "Tim Ream", number: 13 },
    4:  { name: "Sergiño Dest", number: 2 },
    5:  { name: "Tyler Adams", number: 4 },
    6:  { name: "Weston McKennie", number: 8 },
    7:  { name: "Yunus Musah", number: 6 },
    8:  { name: "Christian Pulisic", number: 10 },
    9:  { name: "Folarin Balogun", number: 20 },
    10: { name: "Timothy Weah", number: 21 },
  },

  // Mexiko (4-3-3)
  n_mex: {
    0:  { name: "Luis Malagón", number: 1 },
    1:  { name: "Jesús Gallardo", number: 23 },
    2:  { name: "César Montes", number: 3 },
    3:  { name: "Johan Vásquez", number: 15 },
    4:  { name: "Jorge Sánchez", number: 19 },
    5:  { name: "Edson Álvarez", number: 4 },
    6:  { name: "Luis Chávez", number: 14 },
    7:  { name: "Luis Romo", number: 6 },
    8:  { name: "Hirving Lozano", number: 22 },
    9:  { name: "Santiago Giménez", number: 9 },
    10: { name: "Alexis Vega", number: 10 },
  },

  // Marokko (4-3-3)
  n_mar: {
    0:  { name: "Yassine Bounou", number: 1 },
    1:  { name: "Adam Masina", number: 3 },
    2:  { name: "Nayef Aguerd", number: 5 },
    3:  { name: "Romain Saïss", number: 6 },
    4:  { name: "Achraf Hakimi", number: 2 },
    5:  { name: "Sofyan Amrabat", number: 4 },
    6:  { name: "Azzedine Ounahi", number: 8 },
    7:  { name: "Bilal El Khannouss", number: 15 },
    8:  { name: "Sofiane Boufal", number: 10 },
    9:  { name: "Youssef En-Nesyri", number: 19 },
    10: { name: "Hakim Ziyech", number: 7 },
  },

  // Japan (4-2-3-1)
  n_jpn: {
    0:  { name: "Zion Suzuki", number: 1 },
    1:  { name: "Hiroki Ito", number: 22 },
    2:  { name: "Ko Itakura", number: 16 },
    3:  { name: "Takehiro Tomiyasu", number: 5 },
    4:  { name: "Yukinari Sugawara", number: 19 },
    5:  { name: "Wataru Endo", number: 6 },
    6:  { name: "Hidemasa Morita", number: 13 },
    7:  { name: "Junya Ito", number: 14 },
    8:  { name: "Takefusa Kubo", number: 11 },
    9:  { name: "Kaoru Mitoma", number: 10 },
    10: { name: "Ayase Ueda", number: 20 },
  },

  // --- Etappe 3: leicht "gefälschte" Namen (an echte angelehnt) ---

  // Schweiz (4-2-3-1)
  n_sui: {
    0:  { name: "Yann Sommar", number: 1 },
    1:  { name: "Ricardo Rodrigez", number: 13 },
    2:  { name: "Manuel Akanjo", number: 5 },
    3:  { name: "Nico Elvego", number: 4 },
    4:  { name: "Silvan Widmar", number: 2 },
    5:  { name: "Granit Xhalar", number: 10 },
    6:  { name: "Remo Freular", number: 8 },
    7:  { name: "Ruben Vargo", number: 17 },
    8:  { name: "Xherdan Shaqiro", number: 23 },
    9:  { name: "Dan Ndoy", number: 20 },
    10: { name: "Breel Embolt", number: 7 },
  },

  // Norwegen (4-3-3)
  n_nor: {
    0:  { name: "Örjan Nylan", number: 1 },
    1:  { name: "Fredrik Bjorkan", number: 3 },
    2:  { name: "Leo Ostigard", number: 6 },
    3:  { name: "Kristoffer Ajar", number: 5 },
    4:  { name: "Julian Ryarson", number: 2 },
    5:  { name: "Martin Ödegard", number: 20 },
    6:  { name: "Sander Berge", number: 15 },
    7:  { name: "Patrick Bergmann", number: 18 },
    8:  { name: "Antonio Nusca", number: 23 },
    9:  { name: "Erling Holund", number: 9 },
    10: { name: "Alexander Soerlot", number: 11 },
  },

  // Senegal (4-3-3)
  n_sen: {
    0:  { name: "Edouard Mendi", number: 16 },
    1:  { name: "Ismail Jakob", number: 12 },
    2:  { name: "Kalidou Kulibali", number: 3 },
    3:  { name: "Abdou Diallon", number: 22 },
    4:  { name: "Youssouf Sabali", number: 21 },
    5:  { name: "Idrissa Guey", number: 5 },
    6:  { name: "Pape Sarro", number: 17 },
    7:  { name: "Lamine Camaro", number: 6 },
    8:  { name: "Sadio Maneh", number: 10 },
    9:  { name: "Nicolas Jacksen", number: 9 },
    10: { name: "Ismaila Sarre", number: 18 },
  },

  // Südkorea (4-4-2)
  n_kor: {
    0:  { name: "Kim Sung-gyun", number: 1 },
    1:  { name: "Kim Jin-soo", number: 3 },
    2:  { name: "Kim Min-jee", number: 4 },
    3:  { name: "Kim Young-gwan", number: 19 },
    4:  { name: "Kim Moon-hwa", number: 13 },
    5:  { name: "Son Heung-mun", number: 7 },
    6:  { name: "Hwang In-bom", number: 6 },
    7:  { name: "Lee Jae-song", number: 17 },
    8:  { name: "Hwang Hee-chang", number: 11 },
    9:  { name: "Cho Gue-song", number: 9 },
    10: { name: "Oh Hyeon-gyun", number: 18 },
  },

  // Türkei (4-2-3-1)
  n_tur: {
    0:  { name: "Ugurcan Cakar", number: 1 },
    1:  { name: "Ferdi Kadioglan", number: 14 },
    2:  { name: "Merih Demir", number: 3 },
    3:  { name: "Abdulkerim Bardak", number: 4 },
    4:  { name: "Zeki Celiko", number: 2 },
    5:  { name: "Hakan Calhan", number: 10 },
    6:  { name: "Salih Ozcan", number: 6 },
    7:  { name: "Arda Gülan", number: 8 },
    8:  { name: "Kenan Yildez", number: 19 },
    9:  { name: "Kerem Akturko", number: 7 },
    10: { name: "Baris Alper", number: 17 },
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
