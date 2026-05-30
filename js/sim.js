// Schnell-Simulation eines Spielergebnisses aus den Team-Stärken.
// Wird für nicht selbst gespielte Partien (Liga & Pokal) verwendet.

import { ratingOf } from "./teams.js?v=p";

// Poisson-Zufallswert (Knuth) für die Toranzahl.
function poisson(lambda) {
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= Math.random(); } while (p > L);
  return k - 1;
}

// Erwartete Tore je Team aus Stärke-Differenz; Heimvorteil berücksichtigt.
function expectedGoals(att, def, homeAdv) {
  const base = 1.3 + (att - def) * 0.045 + homeAdv;
  return Math.max(0.2, Math.min(5.5, base));
}

// Ergebnis einer Partie. homeId/awayId sind Team-IDs.
export function simulateMatch(homeId, awayId) {
  const h = ratingOf(homeId);
  const a = ratingOf(awayId);
  const hs = poisson(expectedGoals(h, a, 0.35));
  const as = poisson(expectedGoals(a, h, 0.0));
  return { hs, as };
}

// K.o.-Ergebnis mit garantiertem Sieger (Verlängerung/Elfmeter abstrahiert).
export function simulateKnockout(homeId, awayId) {
  const { hs, as } = simulateMatch(homeId, awayId);
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
  return { hs, as, winner, decided };
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
