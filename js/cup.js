// Pokal-Modus: K.o.-Baum mit 16 Teams (Achtel-, Viertel-, Halbfinale, Finale).
// Reine Datenlogik ohne DOM.

import { simulateKnockout } from "./sim.js?v=b7";
import { ratingOf } from "./teams.js?v=b7";

export const ROUND_NAMES = ["Achtelfinale", "Viertelfinale", "Halbfinale", "Finale"];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pokal anlegen: 16 Teams (Nutzerteam immer dabei, sonst die stärksten),
// zufällig ausgelost.
export function createCup(allTeamIds, userTeam) {
  const others = allTeamIds.filter((id) => id !== userTeam)
    .sort((a, b) => ratingOf(b) - ratingOf(a));
  const field = shuffle([userTeam, ...others.slice(0, 15)]);

  const first = [];
  for (let i = 0; i < field.length; i += 2) {
    first.push({ home: field[i], away: field[i + 1], hs: null, as: null, winner: null, decided: null });
  }
  return {
    type: "cup",
    userTeam,
    rounds: [first],
    currentRound: 0,
    champion: null,
  };
}

export function roundName(state) {
  return ROUND_NAMES[state.currentRound] || `Runde ${state.currentRound + 1}`;
}

// Aktuelle (noch offene) Partie des Nutzers in dieser Runde.
export function userTie(state) {
  return state.rounds[state.currentRound]
    .find((t) => (t.home === state.userTeam || t.away === state.userTeam) && t.winner === null);
}

// Ergebnis einer Partie eintragen (Sieger ggf. per Elfmeter bestimmt).
export function setTieResult(tie, hs, as, winner, decided = "regulär", homeScorers = [], awayScorers = []) {
  tie.hs = hs; tie.as = as; tie.winner = winner; tie.decided = decided;
  tie.homeScorers = homeScorers; tie.awayScorers = awayScorers;
}

// Eine nicht gespielte Partie simulieren.
export function simulateTie(tie) {
  const r = simulateKnockout(tie.home, tie.away);
  setTieResult(tie, r.hs, r.as, r.winner, r.decided, r.homeScorers, r.awayScorers);
}

// Torschützenliste über alle gespielten Pokalpartien.
export function computeScorers(state) {
  const tally = {};
  const add = (name, teamId) => {
    if (!name) return;
    const key = name + "@" + teamId;
    (tally[key] || (tally[key] = { name, team: teamId, goals: 0 })).goals++;
  };
  for (const round of state.rounds) {
    for (const t of round) {
      (t.homeScorers || []).forEach((n) => add(n, t.home));
      (t.awayScorers || []).forEach((n) => add(n, t.away));
    }
  }
  return Object.values(tally).sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name));
}

// Alle offenen Partien der aktuellen Runde simulieren (außer optional einer).
export function simulateRest(state, skipTie = null) {
  for (const t of state.rounds[state.currentRound]) {
    if (t === skipTie || t.winner !== null) continue;
    simulateTie(t);
  }
}

export function roundComplete(state) {
  return state.rounds[state.currentRound].every((t) => t.winner !== null);
}

// Nächste Runde aus den Siegern bilden bzw. Champion ermitteln.
export function advance(state) {
  if (!roundComplete(state)) return;
  const winners = state.rounds[state.currentRound].map((t) => t.winner);
  if (winners.length === 1) {
    state.champion = winners[0];
    return;
  }
  const next = [];
  for (let i = 0; i < winners.length; i += 2) {
    next.push({ home: winners[i], away: winners[i + 1], hs: null, as: null, winner: null, decided: null });
  }
  state.rounds.push(next);
  state.currentRound++;
}
