// WM-Modus: 48 Nationen in 12 Vierergruppen (A–L), danach K.o.-Runde.
// Format wie bei der WM 2026: pro Gruppe je 1 Spiel gegen die anderen drei
// (3 Spieltage). Es kommen die zwei Gruppenbesten plus die acht besten
// Gruppendritten weiter -> 32er-K.o. (Sechzehntel-, Achtel-, Viertel-,
// Halbfinale, Finale). Reine Datenlogik ohne DOM (headless testbar).
//
// Die Gruppen werden – wie bei der echten Auslosung – nach Lostöpfen
// (Stärke) gebildet, mit fester Mischung, damit die Auslosung stabil bleibt.

import { simulateMatch } from "./sim.js?v=a5";
import * as C from "./cup.js?v=a5";

export const GROUP_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
export const WM_ROUND_NAMES = ["Sechzehntelfinale", "Achtelfinale", "Viertelfinale", "Halbfinale", "Finale"];

// Paarungen je Spieltag in einer Vierergruppe (Indizes 0..3).
const GROUP_PAIRS = [
  [[0, 1], [2, 3]],
  [[0, 2], [3, 1]],
  [[0, 3], [1, 2]],
];

// Offizielle Auslosung der WM 2026 (Gruppen A–L), Stand Final Draw 05.12.2025.
const OFFICIAL_GROUPS = [
  ["n_mex", "n_rsa", "n_kor", "n_cze"],   // A
  ["n_can", "n_bih", "n_qat", "n_sui"],   // B
  ["n_bra", "n_mar", "n_hai", "n_sco"],   // C
  ["n_usa", "n_par", "n_aus", "n_tur"],   // D
  ["n_ger", "n_cuw", "n_civ", "n_ecu"],   // E
  ["n_ned", "n_jpn", "n_swe", "n_tun"],   // F
  ["n_bel", "n_egy", "n_irn", "n_nzl"],   // G
  ["n_esp", "n_cpv", "n_ksa", "n_uru"],   // H
  ["n_fra", "n_sen", "n_irq", "n_nor"],   // I
  ["n_arg", "n_alg", "n_aut", "n_jor"],   // J
  ["n_por", "n_cod", "n_uzb", "n_col"],   // K
  ["n_eng", "n_cro", "n_gha", "n_pan"],   // L
];

// Neue WM anlegen: echte WM26-Gruppen (12 × 4), Nutzerteam ist frei wählbar.
export function createWM(allTeamIds, userTeam) {
  const groups = OFFICIAL_GROUPS.map((g) => g.slice());

  return {
    type: "wm",
    userTeam,
    groups,
    groupResults: {},   // round (0..2) -> [{ home, away, hs, as, homeScorers, awayScorers }]
    groupRound: 0,
    phase: "groups",
    ko: null,           // { userTeam, rounds:[...], currentRound, champion }
    champion: null,
  };
}

// ----------------------------- Gruppenphase -----------------------------
export function groupFixtures(state, g, round) {
  const grp = state.groups[g];
  return GROUP_PAIRS[round].map(([i, j]) => ({ home: grp[i], away: grp[j] }));
}

export function userGroupIndex(state) {
  return state.groups.findIndex((grp) => grp.includes(state.userTeam));
}

export function userGroupFixture(state, round) {
  const g = userGroupIndex(state);
  return groupFixtures(state, g, round)
    .find((f) => f.home === state.userTeam || f.away === state.userTeam);
}

// Alle Partien eines Spieltags simulieren (optional eine auslassen = Nutzer).
export function simulateGroupRound(state, round, skip = null) {
  const out = [];
  for (let g = 0; g < 12; g++) {
    for (const f of groupFixtures(state, g, round)) {
      if (skip && f.home === skip.home && f.away === skip.away) continue;
      const { hs, as, homeScorers, awayScorers } = simulateMatch(f.home, f.away);
      out.push({ home: f.home, away: f.away, hs, as, homeScorers, awayScorers });
    }
  }
  return out;
}

export function recordGroupRound(state, round, results) {
  state.groupResults[round] = results;
}

// Tabelle einer Gruppe aus allen bisher gespeicherten Partien dieser Gruppe.
export function computeGroupTable(state, g) {
  const ids = state.groups[g];
  const rows = {};
  for (const id of ids) rows[id] = { id, pld: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
  for (const key of Object.keys(state.groupResults)) {
    for (const m of state.groupResults[key]) {
      if (!rows[m.home] || !rows[m.away]) continue; // Partie gehört zu anderer Gruppe
      const h = rows[m.home], a = rows[m.away];
      h.pld++; a.pld++;
      h.gf += m.hs; h.ga += m.as; a.gf += m.as; a.ga += m.hs;
      if (m.hs > m.as) { h.w++; h.pts += 3; a.l++; }
      else if (m.hs < m.as) { a.w++; a.pts += 3; h.l++; }
      else { h.d++; a.d++; h.pts++; a.pts++; }
    }
  }
  const table = Object.values(rows);
  for (const r of table) r.gd = r.gf - r.ga;
  table.sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf);
  return table;
}

export function groupsComplete(state) { return state.groupRound >= 3; }

// ------------------------------- K.o.-Runde -------------------------------
const rankFn = (a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf;

// Aus den Gruppen die 32 Teilnehmer bestimmen und das K.o.-Tableau bilden.
export function buildKnockout(state) {
  const firsts = [], seconds = [], thirds = [];
  for (let g = 0; g < 12; g++) {
    const t = computeGroupTable(state, g);
    firsts.push(t[0]); seconds.push(t[1]); thirds.push(t[2]);
  }
  firsts.sort(rankFn); seconds.sort(rankFn); thirds.sort(rankFn);
  const bestThirds = thirds.slice(0, 8);
  // 12 Erste + 8 beste Dritte + 12 Zweite = 32, klassisch gesetzt (stark vs schwach).
  const seedList = [...firsts, ...bestThirds, ...seconds].map((r) => r.id);
  const ties = [];
  for (let i = 0; i < 16; i++) {
    ties.push({ home: seedList[i], away: seedList[31 - i], hs: null, as: null, winner: null, decided: null });
  }
  state.ko = { userTeam: state.userTeam, rounds: [ties], currentRound: 0, champion: null };
  state.phase = "ko";
}

export function koRoundName(state) {
  return WM_ROUND_NAMES[state.ko.currentRound] || `Runde ${state.ko.currentRound + 1}`;
}

// Torschützenliste über Gruppenphase UND K.o.-Runde.
export function computeScorers(state) {
  const tally = {};
  const add = (name, teamId) => {
    if (!name) return;
    const key = name + "@" + teamId;
    (tally[key] || (tally[key] = { name, team: teamId, goals: 0 })).goals++;
  };
  for (const key of Object.keys(state.groupResults)) {
    for (const m of state.groupResults[key]) {
      (m.homeScorers || []).forEach((n) => add(n, m.home));
      (m.awayScorers || []).forEach((n) => add(n, m.away));
    }
  }
  if (state.ko) {
    for (const round of state.ko.rounds) {
      for (const t of round) {
        (t.homeScorers || []).forEach((n) => add(n, t.home));
        (t.awayScorers || []).forEach((n) => add(n, t.away));
      }
    }
  }
  return Object.values(tally).sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name));
}
