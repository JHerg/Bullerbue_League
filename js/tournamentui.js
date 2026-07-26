// Hallenturnier-Oberfläche: Spielerauswahl (3 aus allen), Teamname, Gruppen-Hub
// (eigene Gruppe + Tabelle, Schwierigkeit, "nur mein Spiel" oder "alle
// simulieren"), K.o.-Baum. Nutzt die Logik aus tournament.js und das Match
// (indoor) über deps.runIndoorMatch.
//
// deps: { runIndoorMatch(homeDef, awayDef, {difficulty, knockout}) -> Promise<result>,
//         showMenu() }

import { allPlayers, teamById as teamDef } from "./teams.js?v=b1";
import { DIFFICULTY } from "./config.js?v=b1";
import * as T from "./tournament.js?v=b1";
import { saveSeason, loadSeason } from "./storage.js?v=b1";
import * as achievements from "./achievements.js?v=b1";

let deps = null;
let state = null;
let difficulty = DIFFICULTY.Mittel;
let selected = [];   // ausgewählte Spielerobjekte (1..4)
let searchTerm = "";
let keeperIdx = 0;   // Index des markierten Torwarts in `selected`
let playMode = "team";   // "team" = mit allen, "single" = nur ein Spieler
let playerIdx = 0;       // im Einzelspieler-Modus: Index des gesteuerten Spielers
const MAX_PICKS = 4;

const hubEl = () => document.getElementById("hub");
const contentEl = () => document.getElementById("hub-content");
const buttonsEl = () => document.getElementById("hub-buttons");

export function init(d) { deps = d; }
export function hasSave() { return !!loadSeason("tournament"); }

// Einstieg aus dem Menü: erst Spielerauswahl.
export function start() {
  selected = [];
  keeperIdx = 0;
  searchTerm = "";
  state = null;
  hubEl().classList.remove("hidden");
  _renderSelect();
}

export function resume() {
  state = loadSeason("tournament");
  if (!state) { deps.showMenu(); return; }
  hubEl().classList.remove("hidden");
  _renderGroup();
}

function _toMenu() { hubEl().classList.add("hidden"); deps.showMenu(); }

// ---------------- Spielerauswahl ----------------
function _renderSelect() {
  const pool = allPlayers().sort((a, b) => b.strength - a.strength);
  const chosen = new Set(selected.map((p) => p.uid));
  if (keeperIdx >= selected.length) keeperIdx = 0;

  // Gewählte Spieler als Chips, mit 🧤-Markierung für den Torwart.
  let chips = selected.map((p, i) => {
    const kp = i === keeperIdx ? " keeper" : "";
    return `<span class="pick-chip${kp}"><button class="kbtn" data-kp="${i}" title="Als Torwart">${i === keeperIdx ? "🧤" : "🥅"}</button>`
      + `${p.name} <button data-rm="${i}">✕</button></span>`;
  }).join("");

  let html =
    `<h2>Hallenturnier</h2>`
    + `<div class="hub-sub">Wähle <b>1 bis 4</b> Spieler. Tippe auf 🥅, um einen als <b>Torwart</b> zu markieren (🧤). Spielst du nur mit einem, ist das dein einziger Spieler.</div>`
    + `<div class="picks">${chips || '<span style="opacity:.6">Noch keine Spieler gewählt</span>'}</div>`;

  if (selected.length < MAX_PICKS) {
    const term = searchTerm.trim().toLowerCase();
    const matches = pool.filter((p) => !chosen.has(p.uid) &&
      (!term || p.name.toLowerCase().includes(term) || p.teamShort.toLowerCase().includes(term)
        || p.teamName.toLowerCase().includes(term)));
    const list = matches.slice(0, 30).map((p) =>
      `<div class="pl-row" data-uid="${p.uid}"><span>${p.name}</span>`
      + `<span class="pl-meta">${p.teamShort} · ${p.role} · ⭐${Math.round(p.strength)}</span></div>`).join("");
    html += `<label>Spieler suchen<input id="pl-search" type="text" placeholder="Name oder Verein…" value="${searchTerm}" /></label>`
      + `<div class="pl-list">${list || '<div class="pl-empty">Keine Treffer</div>'}</div>`
      + (matches.length > 30 ? `<div class="pl-more">… ${matches.length - 30} weitere – Suche eingrenzen</div>` : "");
  }
  if (selected.length >= 1) {
    html += `<label>Teamname<input id="inp-teamname" type="text" maxlength="22" placeholder="z. B. Wilde Bullen" /></label>`;
  }
  contentEl().innerHTML = html;

  // Buttons
  const btns = [];
  if (selected.length >= 1) btns.push(_btn("Turnier starten", "", _confirmTeam));
  btns.push(_btn("Abbrechen", "ghost", _toMenu));
  _setButtons(btns);

  // Events: Suche (Fokus + Cursor ans Ende halten)
  const search = document.getElementById("pl-search");
  if (search) {
    search.addEventListener("input", () => {
      searchTerm = search.value;
      _renderSelect();
      const s2 = document.getElementById("pl-search");
      if (s2) { s2.focus(); const v = s2.value; s2.value = ""; s2.value = v; }
    });
    search.focus();
  }
  contentEl().querySelectorAll(".pl-row").forEach((row) =>
    row.addEventListener("click", () => {
      const p = pool.find((x) => x.uid === row.dataset.uid);
      if (p && selected.length < MAX_PICKS) { selected.push(p); searchTerm = ""; _renderSelect(); }
    }));
  contentEl().querySelectorAll(".kbtn").forEach((b) =>
    b.addEventListener("click", () => { keeperIdx = +b.dataset.kp; _renderSelect(); }));
  contentEl().querySelectorAll("[data-rm]").forEach((b) =>
    b.addEventListener("click", () => {
      const i = +b.dataset.rm;
      selected.splice(i, 1);
      if (keeperIdx > i) keeperIdx--; else if (keeperIdx === i) keeperIdx = 0;
      _renderSelect();
    }));
}

function _confirmTeam() {
  const inp = document.getElementById("inp-teamname");
  const name = (inp && inp.value.trim()) || "Mein Team";
  state = T.createTournament({ name, picks: selected.slice(), keeperIndex: keeperIdx });
  saveSeason(state);
  _renderGroup();
}

// ---------------- Gruppen-Hub ----------------
function _renderGroup() {
  hubEl().classList.remove("hidden"); // nach einem Spiel den Hub wieder zeigen
  if (state.phase === "ko") { _renderKo(); return; }

  const gi = state.userGroup;
  const g = state.groups[gi];
  const table = T.groupTable(state, gi);
  const complete = T.groupsComplete(state);

  let html = `<h2>Hallenturnier – ${g.name}</h2>`;
  html += `<div class="hub-sub">Dein Team: ${_name(state.userTeam)} · 3×30 Sek · Top 2 kommen weiter</div>`;

  // Deine Gruppe mit Spielern (Kader-Vorschau).
  html += `<div class="grp-teams">`;
  for (const id of g.teamIds) {
    const t = T.teamById(state, id);
    const me = id === state.userTeam ? " me" : "";
    const roster = (t.picks || []).map((p) => p.name).join(", ");
    html += `<div class="grp-team${me}"><b>${t.name}</b><span>${roster}</span></div>`;
  }
  html += `</div>`;

  html += _groupTableHtml(table);

  // Nächstes eigenes Spiel
  const fx = T.userFixture(state);
  if (fx) {
    const oppId = fx.home === state.userTeam ? fx.away : fx.home;
    html += `<div class="fixture">Dein nächstes Spiel: ${_name(state.userTeam)} – ${_name(oppId)}</div>`;
  } else if (!complete) {
    html += `<div class="fixture">Deine Gruppenspiele sind durch. Simuliere die restlichen Gruppen.</div>`;
  }

  html += _scorersHtml();
  if (fx) html += _modeHtml();   // nur wenn du selbst gleich spielst
  html += _difficultyHtml();
  contentEl().innerHTML = html;
  _wireDifficulty();

  // Buttons
  const btns = [];
  if (fx) {
    btns.push(_btn("Mein Spiel spielen", "", _playUserGroup));
    btns.push(_btn("Nur simulieren", "secondary", _simUserGroup));
  } else if (!complete) {
    btns.push(_btn("Alle Gruppen simulieren", "", _simAllGroups));
  } else {
    btns.push(_btn("Weiter zum Achtelfinale", "", _toKo));
  }
  btns.push(_btn("Menü", "ghost", _toMenu));
  _setButtons(btns);
}

async function _playUserGroup() {
  const fx = T.userFixture(state);
  const oppId = fx.home === state.userTeam ? fx.away : fx.home;
  const userIsHome = fx.home === state.userTeam;
  const r = await deps.runIndoorMatch(_def(state.userTeam), _def(oppId),
    { difficulty, knockout: false, mode: playMode, userPlayerIndex: playerIdx });
  // r.homeScorers gehört dem Nutzerteam (Heim im Match), r.awayScorers dem Gegner.
  const us = r.homeScorers || [], os = r.awayScorers || [];
  T.setFixtureResult(fx, userIsHome ? r.home : r.away, userIsHome ? r.away : r.home,
    userIsHome ? us : os, userIsHome ? os : us);
  saveSeason(state);
  _renderGroup();
}

function _simUserGroup() {
  const fx = T.userFixture(state);
  const r = T.simResult(state, fx.home, fx.away);
  T.setFixtureResult(fx, r.hs, r.as);
  saveSeason(state);
  _renderGroup();
}

function _simAllGroups() {
  T.simulateGroups(state);
  saveSeason(state);
  _renderGroup();
}

function _toKo() {
  T.startKnockout(state);
  saveSeason(state);
  _renderKo();
}

// ---------------- K.o.-Phase ----------------
function _renderKo() {
  hubEl().classList.remove("hidden"); // nach einem Spiel den Hub wieder zeigen
  let html = `<h2>Hallenturnier – ${state.champion ? "Beendet" : T.koRoundName(state)}</h2>`;
  if (state.champion) {
    html += `<div class="fixture">🏆 Turniersieger: ${_name(state.champion)}</div>`;
    if (state.champion === state.userTeam) achievements.unlock("hall_win");
  } else {
    const tie = T.userTie(state);
    html += tie
      ? `<div class="fixture">Dein Spiel: ${_name(tie.home)} – ${_name(tie.away)}</div>`
      : `<div class="fixture">Dein Team ist ausgeschieden.</div>`;
  }
  html += _bracketHtml();
  html += _scorersHtml();
  if (!state.champion && T.userTie(state)) html += _modeHtml();
  if (!state.champion) html += _difficultyHtml();
  contentEl().innerHTML = html;
  if (!state.champion) _wireDifficulty();

  const btns = [];
  if (state.champion) {
    btns.push(_btn("Zum Menü", "ghost", _toMenu));
  } else if (T.userTie(state)) {
    btns.push(_btn("Mein Spiel spielen", "", _playUserKo));
    btns.push(_btn("Nur simulieren", "secondary", _simUserKo));
  } else {
    btns.push(_btn("Weiter simulieren", "secondary", _simRestKo));
  }
  if (!state.champion) btns.push(_btn("Menü", "ghost", _toMenu));
  _setButtons(btns);
}

async function _playUserKo() {
  const tie = T.userTie(state);
  const oppId = tie.home === state.userTeam ? tie.away : tie.home;
  const userIsHome = tie.home === state.userTeam;
  const r = await deps.runIndoorMatch(_def(state.userTeam), _def(oppId),
    { difficulty, knockout: true, mode: playMode, userPlayerIndex: playerIdx });
  const hs = userIsHome ? r.home : r.away, as = userIsHome ? r.away : r.home;
  const winner = r.winner === "home" ? state.userTeam : oppId;
  const us = r.homeScorers || [], os = r.awayScorers || [];
  T.setTieResult(tie, hs, as, winner, r.decidedBy || "regulär",
    userIsHome ? us : os, userIsHome ? os : us);
  T.simulateRestKo(state, tie);
  T.advanceKo(state);
  saveSeason(state);
  _renderKo();
}

function _simUserKo() {
  const tie = T.userTie(state);
  T.simulateTie(state, tie);
  T.simulateRestKo(state);
  T.advanceKo(state);
  saveSeason(state);
  _renderKo();
}

function _simRestKo() {
  T.simulateRestKo(state);
  T.advanceKo(state);
  saveSeason(state);
  _renderKo();
}

// ---------------- Helfer ----------------
function _name(id) { return T.teamById(state, id).name; }
function _short(id) { return T.teamById(state, id).short; }
// Team-Definition fürs Match (Match.Team erwartet {id,name,short,colors}).
function _def(id) {
  const t = T.teamById(state, id);
  const d = { id: t.id, name: t.name, short: t.short, colors: t.colors, formation: "4-2-3-1", squad: t.squad };
  if (t.user) d.keeperIndex = t.keeperIndex ?? 0; // Nutzerteam: markierter Torwart
  return d;
}

function _groupTableHtml(table) {
  let rows = "";
  table.forEach((r, i) => {
    const cls = r.id === state.userTeam ? "me" : (i < 2 ? "cl" : "");
    rows += `<tr class="${cls}"><td>${i + 1}</td><td class="team">${_short(r.id)}</td>`
      + `<td>${r.pld}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td>`
      + `<td>${r.gf}:${r.ga}</td><td><b>${r.pts}</b></td></tr>`;
  });
  return `<table class="standings"><tr><th>#</th><th class="team">Team</th>`
    + `<th>Sp</th><th>S</th><th>U</th><th>N</th><th>Tore</th><th>Pkt</th></tr>${rows}</table>`;
}

// Turnier-Torschützenliste (Top 10).
function _scorersHtml() {
  const scorers = T.tournamentScorers(state);
  if (!scorers.length) return "";
  let rows = "";
  scorers.slice(0, 10).forEach((s, i) => {
    const cls = s.team === state.userTeam ? "me" : "";
    rows += `<tr class="${cls}"><td>${i + 1}</td><td class="team">${s.name}</td>`
      + `<td>${_short(s.team)}</td><td><b>${s.goals}</b></td></tr>`;
  });
  return `<h3 class="scorers-h">⚽ Torschützen</h3>`
    + `<table class="standings"><tr><th>#</th><th class="team">Spieler</th><th>Team</th><th>Tore</th></tr>${rows}</table>`;
}

function _bracketHtml() {
  if (!state.ko) return "";
  let html = `<div class="bracket-round"><h4>${T.koRoundName(state)}</h4>`;
  for (const t of state.ko.ties) {
    const me = (t.home === state.userTeam || t.away === state.userTeam) ? "me" : "";
    const dl = t.decided === "i.E." ? " i.E." : "";
    const res = t.winner === null ? "–" : `${t.hs}:${t.as}${dl}`;
    const hb = t.winner === t.home ? "<b>" : "", he = t.winner === t.home ? "</b>" : "";
    const ab = t.winner === t.away ? "<b>" : "", ae = t.winner === t.away ? "</b>" : "";
    html += `<div class="tie ${me}"><span>${hb}${_short(t.home)}${he} – ${ab}${_short(t.away)}${ae}</span><span class="res">${res}</span></div>`;
  }
  html += `</div>`;
  return html;
}

function _difficultyHtml() {
  const opt = (v) => `<option ${difficulty === DIFFICULTY[v] ? "selected" : ""}>${v}</option>`;
  return `<label class="diffsel">Schwierigkeit<select id="t-diff">`
    + ["Einfach", "Mittel", "Schwer", "Ultimativ"].map(opt).join("") + `</select></label>`;
}
function _wireDifficulty() {
  const el = document.getElementById("t-diff");
  if (el) el.addEventListener("change", () => { difficulty = DIFFICULTY[el.value] || DIFFICULTY.Mittel; });

  // Modus-Auswahl (mit allen / nur ein Spieler) verdrahten.
  const m = document.getElementById("t-mode");
  if (m) m.addEventListener("change", () => {
    playMode = m.value === "team" ? "team" : "single";
    playerIdx = m.value === "team" ? 0 : parseInt(m.value.slice(2), 10) || 0;
    _wireDifficulty._refresh && _wireDifficulty._refresh();
  });
}

// Auswahl, mit wem du spielst: ganzes Team oder ein bestimmter Spieler.
function _modeHtml() {
  const me = T.teamById(state, state.userTeam);
  const roster = me.squad || [];
  // Wert "team" = alle; "p<index>" = nur dieser Spieler (Index im Match-Kader).
  // Match-Kader-Reihenfolge: [Torwart, Feldspieler...] (siehe team.js).
  const order = _matchOrder(me);
  let opts = `<option value="team" ${playMode === "team" ? "selected" : ""}>Mit allen (Team)</option>`;
  order.forEach((p, i) => {
    const sel = (playMode === "single" && playerIdx === i) ? "selected" : "";
    const tw = p.isKeeper ? " 🧤" : "";
    opts += `<option value="p:${i}" ${sel}>Nur ${p.name}${tw}</option>`;
  });
  return `<label class="diffsel">Spielen mit<select id="t-mode">${opts}</select></label>`;
}

// Reihenfolge der Spieler im Match-Kader (Torwart zuerst, dann Feldspieler),
// damit der Einzelspieler-Index zum Match passt.
function _matchOrder(team) {
  const sq = (team.squad || []).slice();
  const ki = Math.min(team.keeperIndex ?? 0, Math.max(0, sq.length - 1));
  const keeper = { ...sq[ki], isKeeper: true };
  const field = sq.filter((_, i) => i !== ki).slice(0, 3).map((p) => ({ ...p, isKeeper: false }));
  return [keeper, ...field];
}

function _setButtons(btns) { const el = buttonsEl(); el.innerHTML = ""; for (const b of btns) el.appendChild(b); }
function _btn(label, cls, fn) {
  const b = document.createElement("button");
  b.textContent = label; if (cls) b.className = cls;
  b.addEventListener("click", fn); return b;
}
