// Speichern/Laden des Saison-Fortschritts (Liga oder Pokal) via localStorage.
// Es gibt jeweils einen Slot pro Saisontyp.

const KEY = "bullerbue_season_v1";

export function saveSeason(state) {
  try {
    const all = _readAll();
    all[state.type] = state;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch (e) {
    console.warn("Speichern fehlgeschlagen:", e);
  }
}

export function loadSeason(type) {
  return _readAll()[type] || null;
}

export function hasSeason(type) {
  return !!loadSeason(type);
}

export function clearSeason(type) {
  const all = _readAll();
  delete all[type];
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) { /* ignore */ }
}

function _readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch (e) {
    return {};
  }
}
