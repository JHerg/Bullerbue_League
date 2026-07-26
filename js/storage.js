// Speichern/Laden des Saison-Fortschritts (Liga, Pokal, WM, Hallenturnier)
// via localStorage. Es gibt je Wettbewerb UND Saisontyp einen eigenen Slot,
// damit sich z. B. ein Bundesliga-Pokal und ein WM-Pokal nicht überschreiben
// (sie nutzen andere Team-IDs und würden sonst beim Fortsetzen abstürzen).

import { getCompetition } from "./teams.js?v=b7";

const KEY = "bullerbue_season_v1";

// Slot-Schlüssel: "<wettbewerb>:<typ>" (z. B. "wm:cup", "bundesliga:league").
function slot(type) { return getCompetition() + ":" + type; }

export function saveSeason(state) {
  try {
    const all = _readAll();
    all[slot(state.type)] = state;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch (e) {
    console.warn("Speichern fehlgeschlagen:", e);
  }
}

export function loadSeason(type) {
  return _readAll()[slot(type)] || null;
}

export function hasSeason(type) {
  return !!loadSeason(type);
}

export function clearSeason(type) {
  const all = _readAll();
  delete all[slot(type)];
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) { /* ignore */ }
}

function _readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch (e) {
    return {};
  }
}
