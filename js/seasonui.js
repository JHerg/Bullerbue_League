// Saison-Steuerung (Liga & Pokal): Hub-Oberfläche, Spielen/Simulieren-Fluss
// und Anbindung an das gespielte Match. Speichert den Fortschritt automatisch.
//
// Abhängigkeiten werden per init() injiziert, um Zyklen mit game.js zu vermeiden:
//   deps.runMatch(homeDef, awayDef, opts) -> Promise<{home, away}>  (Endstand)
//   deps.showMenu()                       -> zurück ins Startmenü

import { TEAMS, teamById } from "./teams.js?v=a5";
import * as L from "./league.js?v=a5";
import * as C from "./cup.js?v=a5";
import * as W from "./wm.js?v=a5";
import { saveSeason, loadSeason } from "./storage.js?v=a5";
import * as achievements from "./achievements.js?v=a5";

let deps = null;
let state = null;
let opts = null;

const hubEl = () => document.getElementById("hub");
const contentEl = () => document.getElementById("hub-content");
const buttonsEl = () => document.getElementById("hub-buttons");

export function init(d) { deps = d; }
export function hasSave(type) { return !!loadSeason(type); }

export function startLeague(userTeam, o) {
  opts = o;
  state = L.createLeague(TEAMS.map((t) => t.id), userTeam);
  saveSeason(state);
  _openHub();
}

export function startCup(userTeam, o) {
  opts = o;
  state = C.createCup(TEAMS.map((t) => t.id), userTeam);
  saveSeason(state);
  _openHub();
}

export function startWM(userTeam, o) {
  opts = o;
  state = W.createWM(TEAMS.map((t) => t.id), userTeam);
  saveSeason(state);
  _openHub();
}

export function resume(type, o) {
  opts = o;
  state = loadSeason(type);
  if (!state) { deps.showMenu(); return; }
  _openHub();
}

// --------------------------------------------------------------------------
function _openHub() {
  hubEl().classList.remove("hidden");
  _render();
}

function _toMenu() {
  hubEl().classList.add("hidden");
  deps.showMenu();
}

function _render() {
  if (state.type === "league") _renderLeague();
  else if (state.type === "wm") _renderWM();
  else _renderCup();
}

function name(id) { return teamById(id).name; }
function short(id) { return teamById(id).short; }

// ---- Gespieltes Nutzer-Match: Nutzerteam ist immer das gesteuerte (home) ----
// Liefert das volle Ergebnis-Objekt { home, away, winner, decidedBy, penalties }.
function _playUserMatch(oppId, knockout = false) {
  return deps.runMatch(teamById(state.userTeam), teamById(oppId), { ...opts, knockout });
}

// ============================ LIGA ============================
function _renderLeague() {
  const total = state.schedule.length;
  const round = state.currentRound;
  const over = round >= total;
  const table = L.computeTable(state);

  let html = `<h2>Liga-Saison</h2>`;
  html += `<div class="hub-sub">${over ? "Saison beendet" : `Spieltag ${round + 1} / ${total}`} · Dein Team: ${name(state.userTeam)}</div>`;

  if (over) {
    html += `<div class="fixture">🏆 Meister: ${name(table[0].id)}</div>`;
    if (table[0].id === state.userTeam) achievements.unlock("league_champ");
  } else {
    const fx = L.userFixture(state, round);
    html += _fixtureHtml(fx.home, fx.away);
  }
  html += _standingsTable(table);
  html += _scorersTable(L.computeScorers(state));
  contentEl().innerHTML = html;

  if (over) {
    _setButtons([_btn("Zum Menü", "ghost", _toMenu)]);
  } else {
    _setButtons([
      _btn("Spielen", "", _playLeague),
      _btn("Simulieren", "secondary", _simLeague),
      _btn("Menü", "ghost", _toMenu),
    ]);
  }
}

// Torschützenliste (Top 10) als kompakte Tabelle.
function _scorersTable(scorers) {
  if (!scorers.length) return "";
  const top = scorers.slice(0, 10);
  let rows = "";
  top.forEach((s, i) => {
    const cls = s.team === state.userTeam ? "me" : "";
    rows += `<tr class="${cls}"><td>${i + 1}</td><td class="team">${s.name}</td>` +
      `<td>${short(s.team)}</td><td><b>${s.goals}</b></td></tr>`;
  });
  return `<h3 class="scorers-h">⚽ Torschützen</h3>` +
    `<table class="standings"><tr><th>#</th><th class="team">Spieler</th><th>Team</th><th>Tore</th></tr>${rows}</table>`;
}

async function _playLeague() {
  const round = state.currentRound;
  const fx = L.userFixture(state, round);
  const opp = fx.home === state.userTeam ? fx.away : fx.home;

  const r = await _playUserMatch(opp, false);
  const userIsHome = fx.home === state.userTeam;
  // Torschützen: r.homeScorers gehört dem Nutzerteam, r.awayScorers dem Gegner.
  const results = [{
    home: fx.home, away: fx.away,
    hs: userIsHome ? r.home : r.away,
    as: userIsHome ? r.away : r.home,
    homeScorers: userIsHome ? r.homeScorers : r.awayScorers,
    awayScorers: userIsHome ? r.awayScorers : r.homeScorers,
  }];
  for (const m of L.simulateRound(state, round, fx)) results.push(m);

  L.recordRound(state, round, results);
  state.currentRound++;
  saveSeason(state);
  _openHub();
}

function _simLeague() {
  const round = state.currentRound;
  L.recordRound(state, round, L.simulateRound(state, round, null));
  state.currentRound++;
  saveSeason(state);
  _render();
}

function _standingsTable(table) {
  let rows = "";
  table.forEach((r, i) => {
    const cls = r.id === state.userTeam ? "me" : (i < 4 ? "cl" : "");
    rows += `<tr class="${cls}"><td>${i + 1}</td><td class="team">${short(r.id)}</td>` +
      `<td>${r.pld}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td>` +
      `<td>${r.gf}:${r.ga}</td><td>${r.gd > 0 ? "+" : ""}${r.gd}</td><td><b>${r.pts}</b></td></tr>`;
  });
  return `<table class="standings"><tr><th>#</th><th class="team">Team</th>` +
    `<th>Sp</th><th>S</th><th>U</th><th>N</th><th>Tore</th><th>Dif</th><th>Pkt</th></tr>${rows}</table>`;
}

// ============================ POKAL ============================
function _renderCup() {
  let html = `<h2>Pokal</h2>`;
  if (state.champion) {
    html += `<div class="hub-sub">Turnier beendet · Dein Team: ${name(state.userTeam)}</div>`;
    html += `<div class="fixture">🏆 Sieger: ${name(state.champion)}</div>`;
    if (state.champion === state.userTeam) achievements.unlock("cup_win");
  } else {
    html += `<div class="hub-sub">${C.roundName(state)} · Dein Team: ${name(state.userTeam)}</div>`;
    const tie = C.userTie(state);
    html += tie ? _fixtureHtml(tie.home, tie.away) : `<div class="fixture">Dein Team ist ausgeschieden</div>`;
  }
  html += _bracketHtml();
  html += _scorersTable(C.computeScorers(state));
  contentEl().innerHTML = html;

  if (state.champion) {
    _setButtons([_btn("Zum Menü", "ghost", _toMenu)]);
  } else if (C.userTie(state)) {
    _setButtons([
      _btn("Spielen", "", _playCup),
      _btn("Simulieren", "secondary", _simCup),
      _btn("Menü", "ghost", _toMenu),
    ]);
  } else {
    _setButtons([
      _btn("Weiter simulieren", "secondary", _simCup),
      _btn("Menü", "ghost", _toMenu),
    ]);
  }
}

async function _playCup() {
  const tie = C.userTie(state);
  const opp = tie.home === state.userTeam ? tie.away : tie.home;

  // K.o.-Spiel: Verlängerung & spielbares Elfmeterschießen liefern den Sieger.
  const r = await _playUserMatch(opp, true);
  const userIsHome = tie.home === state.userTeam;
  const hs = userIsHome ? r.home : r.away;
  const as = userIsHome ? r.away : r.home;
  const winner = r.winner === "home" ? state.userTeam : opp;
  const homeScorers = userIsHome ? r.homeScorers : r.awayScorers;
  const awayScorers = userIsHome ? r.awayScorers : r.homeScorers;

  C.setTieResult(tie, hs, as, winner, r.decidedBy || "regulär", homeScorers, awayScorers);
  C.simulateRest(state, tie);
  C.advance(state);
  saveSeason(state);
  _openHub();
}

function _simCup() {
  const tie = C.userTie(state);
  if (tie) C.simulateTie(tie);
  C.simulateRest(state);
  C.advance(state);
  saveSeason(state);
  _render();
}

function _bracketHtml(rounds = state.rounds, names = C.ROUND_NAMES, userTeam = state.userTeam) {
  let html = "";
  rounds.forEach((round, i) => {
    html += `<div class="bracket-round"><h4>${names[i] || `Runde ${i + 1}`}</h4>`;
    for (const t of round) {
      const meCls = (t.home === userTeam || t.away === userTeam) ? "me" : "";
      const dlabel = t.decided === "i.E." ? " i.E." : t.decided === "n.V." ? " n.V." : "";
      const res = t.winner === null ? "–" : `${t.hs}:${t.as}${dlabel}`;
      const hl = t.winner === t.home ? "<b>" : "";
      const hr = t.winner === t.home ? "</b>" : "";
      const al = t.winner === t.away ? "<b>" : "";
      const ar = t.winner === t.away ? "</b>" : "";
      html += `<div class="tie ${meCls}"><span>${hl}${short(t.home)}${hr} – ${al}${short(t.away)}${ar}</span><span class="res">${res}</span></div>`;
    }
    html += `</div>`;
  });
  return html;
}

// ============================ WM (Gruppen + K.o.) ============================
function _renderWM() {
  if (state.phase === "groups") _renderWMGroups();
  else _renderWMko();
}

function _renderWMGroups() {
  const g = W.userGroupIndex(state);
  const round = state.groupRound;
  let html = `<h2>WM 2026 🌍 – Gruppenphase</h2>`;
  html += `<div class="hub-sub">Spieltag ${round + 1} / 3 · Dein Team: ${name(state.userTeam)} · Gruppe ${W.GROUP_LETTERS[g]}</div>`;

  const fx = W.userGroupFixture(state, round);
  if (fx) html += _fixtureHtml(fx.home, fx.away);
  html += `<h3 class="scorers-h">Gruppe ${W.GROUP_LETTERS[g]}</h3>`;
  html += _groupStandingsTable(W.computeGroupTable(state, g));
  html += _allGroupsHtml();
  html += _scorersTable(W.computeScorers(state));
  contentEl().innerHTML = html;

  _setButtons([
    _btn("Spielen", "", _playWMGroup),
    _btn("Simulieren", "secondary", _simWMGroup),
    _btn("Menü", "ghost", _toMenu),
  ]);
}

function _renderWMko() {
  const ko = state.ko;
  let html = `<h2>WM 2026 🌍 – K.o.-Runde</h2>`;
  if (ko.champion) {
    html += `<div class="hub-sub">Turnier beendet · Dein Team: ${name(state.userTeam)}</div>`;
    html += `<div class="fixture">🏆 Weltmeister: ${name(ko.champion)}</div>`;
    if (ko.champion === state.userTeam) achievements.unlock("world_champ");
  } else {
    html += `<div class="hub-sub">${W.koRoundName(state)} · Dein Team: ${name(state.userTeam)}</div>`;
    const tie = C.userTie(ko);
    html += tie ? _fixtureHtml(tie.home, tie.away) : `<div class="fixture">Dein Team ist ausgeschieden</div>`;
  }
  html += _bracketHtml(ko.rounds, W.WM_ROUND_NAMES, state.userTeam);
  html += _scorersTable(W.computeScorers(state));
  contentEl().innerHTML = html;

  if (ko.champion) {
    _setButtons([_btn("Zum Menü", "ghost", _toMenu)]);
  } else if (C.userTie(ko)) {
    _setButtons([
      _btn("Spielen", "", _playWMko),
      _btn("Simulieren", "secondary", _simWMko),
      _btn("Menü", "ghost", _toMenu),
    ]);
  } else {
    _setButtons([
      _btn("Weiter simulieren", "secondary", _simWMko),
      _btn("Menü", "ghost", _toMenu),
    ]);
  }
}

async function _playWMGroup() {
  const round = state.groupRound;
  const fx = W.userGroupFixture(state, round);
  const opp = fx.home === state.userTeam ? fx.away : fx.home;

  const r = await _playUserMatch(opp, false);
  const userIsHome = fx.home === state.userTeam;
  const userResult = {
    home: fx.home, away: fx.away,
    hs: userIsHome ? r.home : r.away,
    as: userIsHome ? r.away : r.home,
    homeScorers: userIsHome ? r.homeScorers : r.awayScorers,
    awayScorers: userIsHome ? r.awayScorers : r.homeScorers,
  };
  const results = [userResult, ...W.simulateGroupRound(state, round, fx)];
  W.recordGroupRound(state, round, results);
  state.groupRound++;
  if (W.groupsComplete(state)) W.buildKnockout(state);
  saveSeason(state);
  _openHub();
}

function _simWMGroup() {
  const round = state.groupRound;
  W.recordGroupRound(state, round, W.simulateGroupRound(state, round, null));
  state.groupRound++;
  if (W.groupsComplete(state)) W.buildKnockout(state);
  saveSeason(state);
  _render();
}

async function _playWMko() {
  const ko = state.ko;
  const tie = C.userTie(ko);
  const opp = tie.home === state.userTeam ? tie.away : tie.home;

  const r = await _playUserMatch(opp, true);
  const userIsHome = tie.home === state.userTeam;
  const hs = userIsHome ? r.home : r.away;
  const as = userIsHome ? r.away : r.home;
  const winner = r.winner === "home" ? state.userTeam : opp;
  C.setTieResult(tie, hs, as, winner, r.decidedBy || "regulär",
    userIsHome ? r.homeScorers : r.awayScorers,
    userIsHome ? r.awayScorers : r.homeScorers);
  C.simulateRest(ko, tie);
  C.advance(ko);
  if (ko.champion) state.champion = ko.champion;
  saveSeason(state);
  _openHub();
}

function _simWMko() {
  const ko = state.ko;
  const tie = C.userTie(ko);
  if (tie) C.simulateTie(tie);
  C.simulateRest(ko);
  C.advance(ko);
  if (ko.champion) state.champion = ko.champion;
  saveSeason(state);
  _render();
}

// Übersicht ALLER 12 Gruppen (kompakt): pro Gruppe die 4 Teams mit Punkten,
// Platz 1+2 (sicher weiter) hervorgehoben, dein Team markiert.
function _allGroupsHtml() {
  let boxes = "";
  for (let g = 0; g < 12; g++) {
    const table = W.computeGroupTable(state, g);
    const rows = table.map((r, i) => {
      const cls = r.id === state.userTeam ? "me" : (i < 2 ? "cl" : "");
      return `<div class="wg-row ${cls}"><span class="wg-pos">${i + 1}</span>` +
        `<span class="wg-team">${short(r.id)}</span><span class="wg-pts">${r.pts}</span></div>`;
    }).join("");
    boxes += `<div class="wg-box"><div class="wg-h">Gruppe ${W.GROUP_LETTERS[g]}</div>${rows}</div>`;
  }
  return `<h3 class="scorers-h">Alle Gruppen</h3>` +
    `<div class="wg-grid">${boxes}</div>` +
    `<div class="wg-note">Grün = weiter (Platz 1–2) · dazu die 8 besten Gruppendritten</div>`;
}

// Gruppentabelle: oberste zwei Plätze (Qualifikation) hervorheben.
function _groupStandingsTable(table) {
  let rows = "";
  table.forEach((r, i) => {
    const cls = r.id === state.userTeam ? "me" : (i < 2 ? "cl" : "");
    rows += `<tr class="${cls}"><td>${i + 1}</td><td class="team">${short(r.id)}</td>` +
      `<td>${r.pld}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td>` +
      `<td>${r.gf}:${r.ga}</td><td>${r.gd > 0 ? "+" : ""}${r.gd}</td><td><b>${r.pts}</b></td></tr>`;
  });
  return `<table class="standings"><tr><th>#</th><th class="team">Team</th>` +
    `<th>Sp</th><th>S</th><th>U</th><th>N</th><th>Tore</th><th>Dif</th><th>Pkt</th></tr>${rows}</table>`;
}

// ---- gemeinsame Helfer ----
function _fixtureHtml(homeId, awayId) {
  return `<div class="fixture">${name(homeId)} &nbsp;–&nbsp; ${name(awayId)}</div>`;
}

function _setButtons(btns) {
  const el = buttonsEl();
  el.innerHTML = "";
  for (const b of btns) el.appendChild(b);
}

function _btn(label, cls, fn) {
  const b = document.createElement("button");
  b.textContent = label;
  if (cls) b.className = cls;
  b.addEventListener("click", fn);
  return b;
}
