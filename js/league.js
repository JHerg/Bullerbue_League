// Liga-Modus: Spielplan (Hin- & Rückrunde) und Tabellenberechnung.
// Reine Datenlogik ohne DOM – dadurch headless testbar.

import { simulateMatch } from "./sim.js?v=b3";

// Doppel-Rundenturnier-Spielplan nach dem Kreis-Verfahren.
// teamIds: Array mit gerader Anzahl Teams. Liefert Array von Spieltagen,
// jeder Spieltag = Array von { home, away }.
export function generateSchedule(teamIds) {
  const ids = teamIds.slice();
  if (ids.length % 2 !== 0) ids.push(null); // Dummy für ungerade Anzahl (Freilos)
  const n = ids.length;
  const rounds = [];

  const arr = ids.slice();
  for (let r = 0; r < n - 1; r++) {
    const day = [];
    for (let i = 0; i < n / 2; i++) {
      const home = arr[i];
      const away = arr[n - 1 - i];
      if (home !== null && away !== null) {
        // Heimrecht abwechseln für ausgeglichene Verteilung.
        day.push(r % 2 === 0 ? { home, away } : { home: away, away: home });
      }
    }
    rounds.push(day);
    // Rotation (erstes Element fix).
    arr.splice(1, 0, arr.pop());
  }

  // Rückrunde: gleiche Paarungen mit getauschtem Heimrecht.
  const second = rounds.map((day) => day.map((m) => ({ home: m.away, away: m.home })));
  return [...rounds, ...second];
}

// Neue Liga-Saison anlegen.
export function createLeague(teamIds, userTeam) {
  return {
    type: "league",
    teamIds: teamIds.slice(),
    userTeam,
    schedule: generateSchedule(teamIds),
    results: {},        // matchdayIndex -> [{ home, away, hs, as }]
    currentRound: 0,
  };
}

// Ergebnisse eines Spieltags festschreiben.
export function recordRound(state, roundIndex, results) {
  state.results[roundIndex] = results;
}

// Simuliert alle noch offenen Partien eines Spieltags außer der vorgegebenen.
export function simulateRound(state, roundIndex, skipPair = null) {
  const fixtures = state.schedule[roundIndex];
  const out = [];
  for (const f of fixtures) {
    if (skipPair && f.home === skipPair.home && f.away === skipPair.away) continue;
    const { hs, as, homeScorers, awayScorers } = simulateMatch(f.home, f.away);
    out.push({ home: f.home, away: f.away, hs, as, homeScorers, awayScorers });
  }
  return out;
}

// Findet die Partie des Nutzerteams an einem Spieltag.
export function userFixture(state, roundIndex) {
  return state.schedule[roundIndex].find(
    (f) => f.home === state.userTeam || f.away === state.userTeam);
}

// Tabelle aus allen bisher gespeicherten Ergebnissen.
export function computeTable(state) {
  const rows = {};
  for (const id of state.teamIds) {
    rows[id] = { id, pld: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
  }
  for (const key of Object.keys(state.results)) {
    for (const m of state.results[key]) {
      const h = rows[m.home], a = rows[m.away];
      if (!h || !a) continue;
      h.pld++; a.pld++;
      h.gf += m.hs; h.ga += m.as;
      a.gf += m.as; a.ga += m.hs;
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

// Torschützenliste über alle gespeicherten Spiele: [{ name, team, goals }] sortiert.
export function computeScorers(state) {
  const tally = {}; // name -> { name, team, goals }
  const add = (name, teamId) => {
    if (!name) return;
    const key = name + "@" + teamId;
    (tally[key] || (tally[key] = { name, team: teamId, goals: 0 })).goals++;
  };
  for (const key of Object.keys(state.results)) {
    for (const m of state.results[key]) {
      (m.homeScorers || []).forEach((n) => add(n, m.home));
      (m.awayScorers || []).forEach((n) => add(n, m.away));
    }
  }
  return Object.values(tally).sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name));
}

export const TOTAL_ROUNDS = (teamCount) => (teamCount - 1) * 2;
