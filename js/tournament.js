// Hallenturnier: 32 Teams (du + 31 KI), 8 Gruppen à 4, nur Hinrunde
// (jeder gegen jeden), Top 2 je Gruppe -> Achtelfinale (K.o., bei Remis Elfmeter).
// Reine Datenlogik ohne DOM (headless testbar).

import { TEAMS, allPlayers } from "./teams.js?v=r2";

const HALL_ADJ = ["Wilde", "Flinke", "Eiserne", "Goldene", "Schnelle", "Coole", "Starke",
  "Bunte", "Kühne", "Freche", "Heiße", "Blaue", "Rote", "Grüne", "Dunkle", "Wirbel"];
const HALL_NOUN = ["Hallenhaie", "Parkettflitzer", "Bandenkönige", "Hallengeister", "Turnierteufel",
  "Kunstrasen-Kicker", "Sporthallen-Stars", "Indoor-Löwen", "Futsal-Füchse", "Hallenbullen",
  "Tortänzer", "Bandenblitze", "Sprinter", "Dribbelkünstler", "Eckenflitzer", "Hallenraketen"];

function shuffle(a, rnd = Math.random) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 3 zufällige Spieler aus verschiedenen Vereinen für ein KI-Team.
function randomSquad(pool) {
  const picks = [];
  const usedTeams = new Set();
  const shuffled = shuffle(pool);
  for (const p of shuffled) {
    if (usedTeams.has(p.teamId)) continue;
    picks.push(p); usedTeams.add(p.teamId);
    if (picks.length === 3) break;
  }
  while (picks.length < 3) picks.push(shuffle(pool)[0]); // Fallback
  return picks;
}

function squadToPlayers(picks) {
  return picks.map((p) => ({
    name: p.name, number: p.number, build: p.build, speed: p.speed,
  }));
}
function squadStrength(picks) {
  return picks.reduce((s, p) => s + (p.strength || 74), 0) / picks.length;
}

let _hid = 0;
function makeAiTeam(pool, usedNames) {
  let name;
  do {
    name = `${HALL_ADJ[Math.floor(Math.random() * HALL_ADJ.length)]} ${HALL_NOUN[Math.floor(Math.random() * HALL_NOUN.length)]}`;
  } while (usedNames.has(name));
  usedNames.add(name);
  const picks = randomSquad(pool);
  const colorPairs = [["#e53935", "#fff"], ["#1565c0", "#fff"], ["#43a047", "#fff"],
    ["#fdd835", "#111"], ["#8e24aa", "#fff"], ["#00897b", "#fff"], ["#f4511e", "#fff"], ["#3949ab", "#fff"]];
  const c = colorPairs[(_hid) % colorPairs.length];
  return {
    id: `h${_hid++}`,
    name,
    short: name.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase(),
    colors: c,
    picks,                       // volle Spielerinfos (für Anzeige)
    squad: squadToPlayers(picks),// fürs Match
    strength: squadStrength(picks),
    user: false,
  };
}

// Turnier anlegen. userTeam = { name, picks:[1..4 Spielerobjekte], keeperIndex }
export function createTournament(userTeam) {
  _hid = 0;
  const pool = allPlayers();
  const usedNames = new Set([userTeam.name]);

  const me = {
    id: "user", name: userTeam.name,
    short: userTeam.name.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase() || "DU",
    colors: ["#d32f2f", "#ffffff"],
    picks: userTeam.picks,
    squad: squadToPlayers(userTeam.picks),
    keeperIndex: userTeam.keeperIndex ?? 0,
    strength: squadStrength(userTeam.picks),
    user: true,
  };

  const teams = [me];
  for (let i = 0; i < 31; i++) teams.push(makeAiTeam(pool, usedNames));

  // In 8 Gruppen à 4 losen: Nutzer fix in seine Gruppe, Rest gleichmäßig füllen.
  const groups = Array.from({ length: 8 }, () => []);
  const userGroup = Math.floor(Math.random() * 8);
  groups[userGroup].push(me);
  const rest = shuffle(teams.filter((t) => !t.user));
  for (const t of rest) {
    // Erste Gruppe mit weniger als 4 Teams nehmen.
    const g = groups.find((grp) => grp.length < 4);
    g.push(t);
  }

  return {
    type: "tournament",
    userTeam: "user",
    userGroup,
    teams,                       // alle 32 (per id auffindbar)
    groups: groups.map((g, idx) => ({
      name: `Gruppe ${String.fromCharCode(65 + idx)}`,
      teamIds: g.map((t) => t.id),
      fixtures: roundRobin(g.map((t) => t.id)), // [{home,away,hs,as,played}]
      done: false,
    })),
    phase: "group",              // "group" | "ko"
    ko: null,                    // { round, ties:[...] } in der K.o.-Phase
    champion: null,
  };
}

export function teamById(state, id) { return state.teams.find((t) => t.id === id); }

// Einfaches Round-Robin (jeder gegen jeden, Hinrunde) für 4 Teams.
function roundRobin(ids) {
  const out = [];
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++)
      out.push({ home: ids[i], away: ids[j], hs: null, as: null, played: false });
  return out;
}

// Poisson für Tore.
function poisson(l) { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= Math.random(); } while (p > L); return k - 1; }
function expGoals(att, def) { return Math.max(0.2, Math.min(6, 1.6 + (att - def) * 0.05)); }

// Wählt `count` Torschützen (Namen) eines Teams aus seinen 3 Spielern.
export function pickScorers(state, teamId, count) {
  const t = teamById(state, teamId);
  const names = (t.picks || t.squad || []).map((p) => p.name);
  if (!names.length || count <= 0) return [];
  const out = [];
  for (let i = 0; i < count; i++) out.push(names[Math.floor(Math.random() * names.length)]);
  return out;
}

// Ein Hallen-Ergebnis simulieren (Stärke-basiert) inkl. Torschützen.
export function simResult(state, homeId, awayId) {
  const h = teamById(state, homeId).strength, a = teamById(state, awayId).strength;
  const hs = poisson(expGoals(h, a)), as = poisson(expGoals(a, h));
  return { hs, as, homeScorers: pickScorers(state, homeId, hs), awayScorers: pickScorers(state, awayId, as) };
}

// K.o.-Sieger (bei Remis nach Stärke gewichtet -> Elfmeter abstrahiert).
export function simKo(state, homeId, awayId) {
  const r = simResult(state, homeId, awayId);
  let { hs, as } = r;
  let winner, decided = "regulär";
  if (hs > as) winner = homeId;
  else if (as > hs) winner = awayId;
  else {
    const h = teamById(state, homeId).strength, a = teamById(state, awayId).strength;
    const pHome = Math.max(0.2, Math.min(0.8, 0.5 + (h - a) * 0.02));
    winner = Math.random() < pHome ? homeId : awayId; decided = "i.E.";
  }
  return { hs, as, winner, decided, homeScorers: r.homeScorers, awayScorers: r.awayScorers };
}

// Findet die nächste ungespielte Partie des Nutzers in seiner Gruppe.
export function userFixture(state) {
  if (state.phase !== "group") return null;
  const g = state.groups[state.userGroup];
  return g.fixtures.find((f) => !f.played && (f.home === state.userTeam || f.away === state.userTeam)) || null;
}

// Ergebnis einer Gruppenpartie eintragen (inkl. Torschützen).
export function setFixtureResult(fx, hs, as, homeScorers = [], awayScorers = []) {
  fx.hs = hs; fx.as = as; fx.played = true;
  fx.homeScorers = homeScorers; fx.awayScorers = awayScorers;
}

// Alle noch offenen Gruppenpartien simulieren (außer optional skipFx).
export function simulateGroups(state, skipFx = null) {
  for (const g of state.groups) {
    for (const f of g.fixtures) {
      if (f.played || f === skipFx) continue;
      const r = simResult(state, f.home, f.away);
      setFixtureResult(f, r.hs, r.as, r.homeScorers, r.awayScorers);
    }
  }
}

// Tabelle einer Gruppe.
export function groupTable(state, groupIndex) {
  const g = state.groups[groupIndex];
  const rows = {};
  for (const id of g.teamIds) rows[id] = { id, pld: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
  for (const f of g.fixtures) {
    if (!f.played) continue;
    const h = rows[f.home], a = rows[f.away];
    h.pld++; a.pld++; h.gf += f.hs; h.ga += f.as; a.gf += f.as; a.ga += f.hs;
    if (f.hs > f.as) { h.w++; h.pts += 3; a.l++; }
    else if (f.hs < f.as) { a.w++; a.pts += 3; h.l++; }
    else { h.d++; a.d++; h.pts++; a.pts++; }
  }
  const table = Object.values(rows);
  for (const r of table) r.gd = r.gf - r.ga;
  table.sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf);
  return table;
}

export function groupsComplete(state) {
  return state.groups.every((g) => g.fixtures.every((f) => f.played));
}

// Achtelfinale aus den je 2 Gruppenbesten bilden (A1-B2, B1-A2, ...).
export function startKnockout(state) {
  const firsts = [], seconds = [];
  state.groups.forEach((g, i) => {
    const t = groupTable(state, i);
    firsts[i] = t[0].id; seconds[i] = t[1].id;
  });
  const ties = [];
  // Paarung: Sieger Gruppe i gegen Zweiter Nachbargruppe.
  for (let i = 0; i < 8; i++) {
    const j = i % 2 === 0 ? i + 1 : i - 1; // 0<->1, 2<->3, ...
    ties.push(makeTie(firsts[i], seconds[j]));
  }
  state.phase = "ko";
  state.ko = { roundIndex: 0, ties };
}

const KO_NAMES = ["Achtelfinale", "Viertelfinale", "Halbfinale", "Finale"];
export function koRoundName(state) { return KO_NAMES[state.ko.roundIndex] || `Runde ${state.ko.roundIndex + 1}`; }

function makeTie(home, away) { return { home, away, hs: null, as: null, winner: null, decided: null }; }

export function userTie(state) {
  if (state.phase !== "ko" || state.champion) return null;
  return state.ko.ties.find((t) => t.winner === null && (t.home === state.userTeam || t.away === state.userTeam)) || null;
}

export function setTieResult(tie, hs, as, winner, decided = "regulär", homeScorers = [], awayScorers = []) {
  tie.hs = hs; tie.as = as; tie.winner = winner; tie.decided = decided;
  tie.homeScorers = homeScorers; tie.awayScorers = awayScorers;
}

export function simulateTie(state, tie) {
  const r = simKo(state, tie.home, tie.away);
  setTieResult(tie, r.hs, r.as, r.winner, r.decided, r.homeScorers, r.awayScorers);
}

// Torschützenliste über das ganze Turnier (Gruppen + alle K.o.-Runden):
// [{ name, team, goals }] absteigend sortiert.
export function tournamentScorers(state) {
  const tally = {};
  const add = (name, teamId) => {
    if (!name) return;
    const key = name + "@" + teamId;
    (tally[key] || (tally[key] = { name, team: teamId, goals: 0 })).goals++;
  };
  for (const g of state.groups) {
    for (const f of g.fixtures) {
      (f.homeScorers || []).forEach((n) => add(n, f.home));
      (f.awayScorers || []).forEach((n) => add(n, f.away));
    }
  }
  // K.o.: alle bisher gespielten Runden. state.ko.ties enthält nur die aktuelle
  // Runde -> wir sammeln über ein Verlaufsarchiv (state.koHistory) + aktuelle.
  const koTies = [...(state.koHistory || []), ...((state.ko && state.ko.ties) || [])];
  for (const t of koTies) {
    (t.homeScorers || []).forEach((n) => add(n, t.home));
    (t.awayScorers || []).forEach((n) => add(n, t.away));
  }
  return Object.values(tally).sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name));
}

export function simulateRestKo(state, skipTie = null) {
  for (const t of state.ko.ties) {
    if (t === skipTie || t.winner !== null) continue;
    simulateTie(state, t);
  }
}

export function koRoundComplete(state) {
  return state.ko.ties.every((t) => t.winner !== null);
}

// Nächste K.o.-Runde aus den Siegern bilden bzw. Champion ermitteln.
export function advanceKo(state) {
  if (!koRoundComplete(state)) return;
  // Abgeschlossene Runde fürs Torschützen-Archiv sichern.
  state.koHistory = [...(state.koHistory || []), ...state.ko.ties.map((t) => ({ ...t }))];
  const winners = state.ko.ties.map((t) => t.winner);
  if (winners.length === 1) { state.champion = winners[0]; state.ko.ties = []; return; }
  const ties = [];
  for (let i = 0; i < winners.length; i += 2) ties.push(makeTie(winners[i], winners[i + 1]));
  state.ko.ties = ties;
  state.ko.roundIndex++;
}
