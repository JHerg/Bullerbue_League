// Saison-Steuerung (Liga & Pokal): Hub-Oberfläche, Spielen/Simulieren-Fluss
// und Anbindung an das gespielte Match. Speichert den Fortschritt automatisch.
//
// Abhängigkeiten werden per init() injiziert, um Zyklen mit game.js zu vermeiden:
//   deps.runMatch(homeDef, awayDef, opts) -> Promise<{home, away}>  (Endstand)
//   deps.showMenu()                       -> zurück ins Startmenü

import { TEAMS, teamById } from "./teams.js?v=w";
import * as L from "./league.js?v=w";
import * as C from "./cup.js?v=w";
import { saveSeason, loadSeason } from "./storage.js?v=w";

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

function _bracketHtml() {
  let html = "";
  state.rounds.forEach((round, i) => {
    html += `<div class="bracket-round"><h4>${C.ROUND_NAMES[i] || `Runde ${i + 1}`}</h4>`;
    for (const t of round) {
      const meCls = (t.home === state.userTeam || t.away === state.userTeam) ? "me" : "";
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
