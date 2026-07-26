// Erfolge/Trophäen – modusübergreifend, im localStorage gespeichert.
// unlock(id) schaltet frei (einmalig) und zeigt einen Toast.
// Fortschrittszähler (z. B. Gesamttore) via bump(key, n).

const KEY = "bullerbue_achievements_v1";

// Definierte Erfolge. `check` (optional) wird mit den Stats geprüft (auto-unlock).
export const ACHIEVEMENTS = [
  { id: "first_goal",   icon: "⚽", name: "Erstes Tor",        desc: "Schieße dein erstes Tor." },
  { id: "hattrick",     icon: "🎩", name: "Hattrick",          desc: "Erziele 3 Tore in einem Spiel." },
  { id: "win_match",    icon: "✅", name: "Erster Sieg",        desc: "Gewinne ein Spiel." },
  { id: "goals_10",     icon: "🔟", name: "Torjäger",          desc: "Erziele insgesamt 10 Tore.", check: (s) => s.totalGoals >= 10 },
  { id: "goals_50",     icon: "💥", name: "Tormaschine",       desc: "Erziele insgesamt 50 Tore.", check: (s) => s.totalGoals >= 50 },
  { id: "clean_sheet",  icon: "🧤", name: "Zu Null",           desc: "Gewinne ein Spiel ohne Gegentor." },
  { id: "league_champ", icon: "🏆", name: "Meister",           desc: "Gewinne die Liga." },
  { id: "cup_win",      icon: "🥇", name: "Pokalsieger",       desc: "Gewinne den Pokal." },
  { id: "hall_win",     icon: "🏟️", name: "Hallenkönig",       desc: "Gewinne das Hallenturnier." },
  { id: "penalty_hero", icon: "🎯", name: "Elfmeter-Held",     desc: "Gewinne ein Elfmeterschießen." },
  { id: "comeback",     icon: "🔥", name: "Comeback",          desc: "Gewinne ein Spiel mit 3+ Toren Unterschied." },
  { id: "world_champ",  icon: "🌍", name: "Weltmeister",        desc: "Gewinne die Weltmeisterschaft." },
];

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
}
function write(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
}

function store() {
  const d = read();
  d.unlocked = d.unlocked || {};
  d.stats = d.stats || { totalGoals: 0 };
  return d;
}

export function isUnlocked(id) { return !!store().unlocked[id]; }
export function allWithState() {
  const d = store();
  return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: !!d.unlocked[a.id] }));
}
export function unlockedCount() {
  const d = store();
  return ACHIEVEMENTS.filter((a) => d.unlocked[a.id]).length;
}

// Optionaler Toast-Callback (von game.js gesetzt), um Freischaltung anzuzeigen.
let toast = null;
export function onUnlock(fn) { toast = fn; }

export function unlock(id) {
  const a = ACHIEVEMENTS.find((x) => x.id === id);
  if (!a) return false;
  const d = store();
  if (d.unlocked[id]) return false;
  d.unlocked[id] = Date.now();
  write(d);
  if (toast) toast(a);
  return true;
}

// Zähler erhöhen (z. B. Gesamttore) und automatische Erfolge prüfen.
export function bump(key, n = 1) {
  const d = store();
  d.stats[key] = (d.stats[key] || 0) + n;
  write(d);
  _checkAuto(d);
}

function _checkAuto(d) {
  for (const a of ACHIEVEMENTS) {
    if (a.check && !d.unlocked[a.id] && a.check(d.stats)) unlock(a.id);
  }
}

// Komfort: wird nach einem gespielten Match aufgerufen.
//   res = { youGoals, oppGoals, won, mode } ; matchGoalsByYou = Tore von dir im Spiel
export function reportMatch({ youGoals = 0, oppGoals = 0, won = false, mode = "" } = {}) {
  if (youGoals > 0) unlock("first_goal");
  if (youGoals >= 3) unlock("hattrick");
  if (won) {
    unlock("win_match");
    if (oppGoals === 0) unlock("clean_sheet");
    if (youGoals - oppGoals >= 3) unlock("comeback");
  }
  bump("totalGoals", youGoals);
}
