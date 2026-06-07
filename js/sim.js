// Schnell-Simulation eines Spielergebnisses aus den Team-Stärken.
// Wird für nicht selbst gespielte Partien (Liga & Pokal) verwendet.

import { ratingOf, teamById, buildSquad } from "./teams.js?v=z2";

// Torwahrscheinlichkeit je Position (Stürmer treffen am häufigsten).
const SCORE_WEIGHT = { ST: 6, LA: 4, RA: 4, OM: 4, LM: 2.5, RM: 2.5, ZM: 2, DM: 1, IV: 0.8, LV: 0.6, RV: 0.6, TW: 0 };

// Wählt für ein Team `count` Torschützen (Namen) gewichtet nach Position.
export function pickScorers(teamId, count) {
  const def = teamById(teamId);
  if (!def || count <= 0) return [];
  const squad = buildSquad(def, true);
  const pool = squad.map((p) => ({ name: p.name, w: SCORE_WEIGHT[p.role] ?? 1 }));
  const total = pool.reduce((s, p) => s + p.w, 0) || 1;
  const out = [];
  for (let i = 0; i < count; i++) {
    let r = Math.random() * total, pick = pool[0];
    for (const p of pool) { r -= p.w; if (r <= 0) { pick = p; break; } }
    out.push(pick.name);
  }
  return out;
}

// Poisson-Zufallswert (Knuth) für die Toranzahl.
function poisson(lambda) {
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= Math.random(); } while (p > L);
  return k - 1;
}

// Erwartete Tore je Team aus Stärke-Differenz; Heimvorteil berücksichtigt.
// Stärkere Kopplung an die Gesamtstärke (GS): klare Favoriten gewinnen meist,
// Außenseiter treffen selten -> Überraschungen sind rar und knapp (oft 1:0).
function expectedGoals(att, def, homeAdv) {
  const base = 1.2 + (att - def) * 0.062 + homeAdv;
  return Math.max(0.14, Math.min(5.5, base));
}

// Ergebnis einer Partie inkl. Torschützen. homeId/awayId sind Team-IDs.
export function simulateMatch(homeId, awayId) {
  const h = ratingOf(homeId);
  const a = ratingOf(awayId);
  const hs = poisson(expectedGoals(h, a, 0.35));
  const as = poisson(expectedGoals(a, h, 0.0));
  return { hs, as, homeScorers: pickScorers(homeId, hs), awayScorers: pickScorers(awayId, as) };
}

// K.o.-Ergebnis mit garantiertem Sieger (Verlängerung/Elfmeter abstrahiert).
export function simulateKnockout(homeId, awayId) {
  const { hs, as, homeScorers, awayScorers } = simulateMatch(homeId, awayId);
  let winner, decided = "regulär";
  if (hs > as) winner = homeId;
  else if (as > hs) winner = awayId;
  else {
    // Unentschieden -> Sieger nach Stärke gewichtet (Elfmeterschießen).
    const h = ratingOf(homeId), a = ratingOf(awayId);
    const pHome = Math.max(0.2, Math.min(0.8, 0.5 + (h - a) * 0.02));
    winner = Math.random() < pHome ? homeId : awayId;
    decided = "i.E.";
  }
  return { hs, as, winner, decided, homeScorers, awayScorers };
}

// Entscheidet ein bereits gespieltes Unentschieden im K.o. per Elfmeterschießen.
export function penaltyShootout(homeId, awayId) {
  const h = ratingOf(homeId), a = ratingOf(awayId);
  let hp = 0, ap = 0;
  for (let i = 0; i < 5; i++) {
    if (Math.random() < 0.75 + (h - a) * 0.004) hp++;
    if (Math.random() < 0.75 + (a - h) * 0.004) ap++;
  }
  while (hp === ap) { // Sudden death
    const hh = Math.random() < 0.75 + (h - a) * 0.004;
    const aa = Math.random() < 0.75 + (a - h) * 0.004;
    if (hh) hp++; if (aa) ap++;
  }
  return { hp, ap, winner: hp > ap ? homeId : awayId };
}
