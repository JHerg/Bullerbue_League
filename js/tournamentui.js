// Hallenturnier-Oberfläche: Spielerauswahl (3 aus allen), Teamname, Gruppen-Hub
// (eigene Gruppe + Tabelle, Schwierigkeit, "nur mein Spiel" oder "alle
// simulieren"), K.o.-Baum. Nutzt die Logik aus tournament.js und das Match
// (indoor) über deps.runIndoorMatch.
//
// deps: { runIndoorMatch(homeDef, awayDef, {difficulty, knockout}) -> Promise<result>,
//         showMenu() }

import { allPlayers, teamById as teamDef } from "./teams.js?v=e2";
import { DIFFICULTY } from "./config.js?v=e2";
import * as T from "./tournament.js?v=e2";
import { saveSeason, loadSeason } from "./storage.js?v=e2";

let deps = null;
let state = null;
let difficulty = DIFFICULTY.Mittel;
let selected = [];   // ausgewählte Spielerobjekte (max 3)

const hubEl = () => document.getElementById("hub");
const contentEl = () => document.getElementById("hub-content");
const buttonsEl = () => document.getElementById("hub-buttons");

export function init(d) { deps = d; }
export function hasSave() { return !!loadSeason("tournament"); }

// Einstieg aus dem Menü: erst Spielerauswahl.
export function start() {
  selected = [];
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
let searchTerm = "";
function _renderSelect() {
  const pool = allPlayers().sort((a, b) => b.strength - a.strength);
  const chosen = new Set(selected.map((p) => p.uid));

  let chips = selected.map((p, i) =>
    `<span class="pick-chip">${p.name} <button data-rm="${i}">✕</button></span>`).join("");

  let html =
    `<h2>Hallenturnier</h2>`
    + `<div class="hub-sub">Stelle dein Team zusammen: wähle 3 Spieler aus allen Vereinen.</div>`
    + `<div class="picks">${chips || '<span style="opacity:.6">Noch keine Spieler gewählt</span>'}</div>`;

  if (selected.length < 3) {
    // Suchfeld + gefilterte Trefferliste (Name oder Team).
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
  } else {
    html += `<label>Teamname<input id="inp-teamname" type="text" maxlength="22" placeholder="z. B. Wilde Bullen" /></label>`;
  }
  contentEl().innerHTML = html;

  // Buttons
  const btns = [];
  if (selected.length === 3) btns.push(_btn("Turnier starten", "", _confirmTeam));
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
      if (p && selected.length < 3) { selected.push(p); searchTerm = ""; _renderSelect(); }
    }));
  contentEl().querySelectorAll("[data-rm]").forEach((b) =>
    b.addEventListener("click", () => { selected.splice(+b.dataset.rm, 1); _renderSelect(); }));
}

function _confirmTeam() {
  const inp = document.getElementById("inp-teamname");
  const name = (inp && inp.value.trim()) || "Mein Team";
  state = T.createTournament({ name, picks: selected.slice() });
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
  const r = await deps.runIndoorMatch(_def(state.userTeam), _def(oppId), { difficulty, knockout: false });
  T.setFixtureResult(fx, userIsHome ? r.home : r.away, userIsHome ? r.away : r.home);
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
  } else {
    const tie = T.userTie(state);
    html += tie
      ? `<div class="fixture">Dein Spiel: ${_name(tie.home)} – ${_name(tie.away)}</div>`
      : `<div class="fixture">Dein Team ist ausgeschieden.</div>`;
  }
  html += _bracketHtml();
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
  const r = await deps.runIndoorMatch(_def(state.userTeam), _def(oppId), { difficulty, knockout: true });
  const hs = userIsHome ? r.home : r.away, as = userIsHome ? r.away : r.home;
  const winner = r.winner === "home" ? state.userTeam : oppId;
  T.setTieResult(tie, hs, as, winner, r.decidedBy || "regulär");
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
  return { id: t.id, name: t.name, short: t.short, colors: t.colors, formation: "4-2-3-1", squad: t.squad };
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
}

function _setButtons(btns) { const el = buttonsEl(); el.innerHTML = ""; for (const b of btns) el.appendChild(b); }
function _btn(label, cls, fn) {
  const b = document.createElement("button");
  b.textContent = label; if (cls) b.className = cls;
  b.addEventListener("click", fn); return b;
}
