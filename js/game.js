// Bootstrap: Startmenü -> Match. Verbindet Eingabe, Kamera, Spielfeld und
// das Match-Objekt und kümmert sich um Rendering und HUD.

import { DIFFICULTY, DIFFICULTY_TEAMMATE, WORLD } from "./config.js?v=b3";
import { TEAMS, buildSquad, teamById, ratingOf, ensureContrast, setCompetition, getCompetition, scaleOpponent, scaleTeammates } from "./teams.js?v=b3";
import { Input } from "./input.js?v=b3";
import { Camera } from "./camera.js?v=b3";
import { drawPitch, drawCrowdTopDown, drawBoards, drawIndoorPitch } from "./pitch.js?v=b3";
import { Match } from "./match.js?v=b3";
import { render as render25 } from "./render2d5.js?v=b3";
import * as season from "./seasonui.js?v=b3";
import * as shootout1v1 from "./shootout1v1.js?v=b3";
import * as commentary from "./commentary.js?v=b3";
import * as tournament from "./tournamentui.js?v=b3";
import * as sound from "./sound.js?v=b3";
import * as achievements from "./achievements.js?v=b3";
import * as startpage from "./startpage.js?v=b3";

// Startet das spielbare 1vs1-Elfmeterschießen mit Canvas/Input-Anbindung.
function run1v1(homeDef, awayDef, difficulty) {
  scoreboardEl.classList.add("hidden");
  return shootout1v1.run({
    canvas, ctx, input, dpr: window.devicePixelRatio || 1,
    view: () => ({ w: window.innerWidth, h: window.innerHeight }),
    difficulty: difficulty || DIFFICULTY.Mittel,
    homeShort: homeDef.short, homeName: homeDef.name, homeColors: homeDef.colors,
    awayShort: awayDef.short, awayName: awayDef.name,
    awayColors: ensureContrast(homeDef.colors, awayDef.colors),
  });
}

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Ansichts-Modus: Top-Down (Hauptspiel) oder 2.5D (Prototyp, via Flag im HTML).
const VIEW_MODE = (typeof window !== "undefined" && window.BULLERBUE_VIEW === "2.5d") ? "2.5d" : "topdown";

const input = new Input();
const camera = new Camera();
let match = null;
let viewW = window.innerWidth, viewH = window.innerHeight;
let cam25X = WORLD.width / 2; // horizontale Kamera für die 2.5D-Ansicht

// --------------------------------------------------------------------------
// Canvas-Größe (inkl. HiDPI)
// --------------------------------------------------------------------------
function resize() {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth, h = window.innerHeight;
  viewW = w; viewH = h;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  camera.resize(w, h);
}
window.addEventListener("resize", resize);
resize();

// --------------------------------------------------------------------------
// Startmenü
// --------------------------------------------------------------------------
const selType = document.getElementById("sel-type");
const selHome = document.getElementById("sel-home");
const selAway = document.getElementById("sel-away");
const selMode = document.getElementById("sel-mode");
const selDiff = document.getElementById("sel-diff");
const selHalf = document.getElementById("sel-half");
const selPlayer = document.getElementById("sel-player");
const lblPlayer = document.getElementById("lbl-player");
const lblHome = document.getElementById("lbl-home");
const lblAway = document.getElementById("lbl-away");
const btnStart = document.getElementById("btn-start");
const btnResume = document.getElementById("btn-resume");
const menuEl = document.getElementById("menu");
const scoreboardEl = document.getElementById("scoreboard");
const hubEl = document.getElementById("hub");
const resultEl = document.getElementById("result");

// Team-Auswahllisten aus dem aktiven Datensatz (Bundesliga oder WM) füllen.
function populateTeamSelects() {
  selHome.innerHTML = "";
  selAway.innerHTML = "";
  for (const t of TEAMS) {
    selHome.add(new Option(t.name, t.id));
    selAway.add(new Option(t.name, t.id));
  }
  selHome.value = TEAMS[0].id;
  selAway.value = TEAMS[1].id;
  refreshPlayerList();
}

// Spielerliste fürs Einzelspieler-Menü passend zum (Heim-/Dein) Team füllen.
function refreshPlayerList() {
  const def = teamById(selHome.value);
  selPlayer.innerHTML = "";
  if (!def) return;            // noch kein Team gewählt (vor der Startseite)
  buildSquad(def, true).forEach((p, i) => {
    selPlayer.add(new Option(`#${p.number} ${p.name} (${p.role})`, String(i)));
  });
  selPlayer.value = "9";
}
selHome.addEventListener("change", refreshPlayerList);

selMode.addEventListener("change", () => {
  lblPlayer.classList.toggle("hidden", selMode.value !== "single");
});

// Sichtbarkeit/Beschriftung je nach Spielart.
function updateTypeUI() {
  const type = selType.value;
  const isAnstoss = type === "anstoss";
  const isElfer = type === "elfer";
  const isSeason = type === "liga" || type === "pokal";
  const isHalle = type === "halle";

  // Team-Auswahl im Menü nur bei Anstoß/Elfer; Halle wählt Teams im Hub.
  lblHome.classList.toggle("hidden", isHalle);
  lblAway.classList.toggle("hidden", !(isAnstoss || isElfer));
  lblHome.childNodes[0].nodeValue = isAnstoss ? "Heimteam" : "Dein Team";

  // Match-Optionen werden bei Elfmeterschießen/Halle nicht im Menü gebraucht.
  const hideOpts = isElfer || isHalle;
  selMode.parentElement.classList.toggle("hidden", hideOpts);
  selDiff.parentElement.classList.toggle("hidden", hideOpts);
  selHalf.parentElement.classList.toggle("hidden", hideOpts);
  lblPlayer.classList.toggle("hidden", hideOpts || selMode.value !== "single");

  const isWMgroups = type === "liga" && getCompetition() === "wm";
  btnStart.textContent = isElfer ? "Elfmeterschießen"
    : isHalle ? "Hallenturnier starten"
    : isAnstoss ? "Anpfiff!"
    : isWMgroups ? "WM starten" : "Saison starten";

  const saveType = isWMgroups ? "wm" : type;
  const canResume = (isSeason && season.hasSave(saveType)) || (isHalle && tournament.hasSave());
  btnResume.textContent = isHalle ? "Turnier fortsetzen"
    : isWMgroups ? "WM fortsetzen" : "Saison fortsetzen";
  btnResume.classList.toggle("hidden", !canResume);
}
selType.addEventListener("change", updateTypeUI);
updateTypeUI();

// --------------------------------------------------------------------------
// Rote Startseite: Begrüßung -> Login/Gast/Neu -> Wahl WM oder Bullileague.
// Das eigentliche Menü bleibt verborgen, bis ein Wettbewerb gewählt wurde.
// --------------------------------------------------------------------------
const menuTitle = menuEl.querySelector("h1");
const menuTitleOrig = menuTitle ? menuTitle.innerHTML : "";
const optLiga = selType.querySelector('option[value="liga"]');
const optLigaOrig = optLiga ? optLiga.textContent : "";

function applyCompetitionUI(comp) {
  const isWM = comp === "wm";
  if (menuTitle) menuTitle.innerHTML = isWM
    ? 'WM 2026 🌍 <span style="font-size:14px;opacity:.7">Bullerbue League</span>'
    : menuTitleOrig;
  if (optLiga) optLiga.textContent = isWM ? "WM-Gruppen (12×4) + K.o." : optLigaOrig;
}

menuEl.classList.add("hidden");
startpage.init({
  onChoose(comp) {
    setCompetition(comp);
    populateTeamSelects();
    applyCompetitionUI(comp);
    // Gibt es einen gespeicherten WM-Spielstand, gleich den WM-Gruppen-Modus
    // vorauswählen, damit der "WM fortsetzen"-Knopf sofort sichtbar ist
    // (genau wie beim Hallenturnier).
    if (comp === "wm" && season.hasSave("wm")) selType.value = "liga";
    menuEl.classList.remove("hidden");
    updateTypeUI();
  },
});

// --------------------------------------------------------------------------
// Navigation (Menü-Knöpfe + In-Match-Pausenmenü): Wettbewerb wechseln /
// Startseite, ohne dass laufende Spiele etwas kaputt machen.
// --------------------------------------------------------------------------
const ingameBtn = document.getElementById("ingame-btn");
const ingameMenu = document.getElementById("ingame-menu");
let paused = false;

function openIngameMenu() {
  if (!match) return;
  paused = true;
  ingameMenu.classList.remove("hidden");
}
function closeIngameMenu() {
  paused = false;
  ingameMenu?.classList.add("hidden");
}

// Laufendes Match sauber abbrechen (für Wettbewerb-Wechsel / Abmelden / Menü).
function abortMatch() {
  closeIngameMenu();
  match = null;
  matchResolve = null;
  resultShown = false;
  penaltiesStarted = false;
  ingameBtn?.classList.add("hidden");
  scoreboardEl.classList.add("hidden");
  resultEl.classList.add("hidden");
  hubEl.classList.add("hidden");
}

// Ziel 1: zurück zur Wettbewerbsseite – WM bzw. Liga-Menü.
function navToMenu() {
  abortMatch();
  menuEl.classList.remove("hidden");
  updateTypeUI();
}
// Ziel 2: zurück zur Wahl WM/Bullileague.
function navToChoose() {
  abortMatch();
  menuEl.classList.add("hidden");
  startpage.openChoose();
}
// Ziel 3: zurück zur Startseite (mit "Spielen").
function navToStart() {
  abortMatch();
  menuEl.classList.add("hidden");
  startpage.openWelcome();
}

ingameBtn?.addEventListener("click", () => (paused ? closeIngameMenu() : openIngameMenu()));
document.getElementById("ig-resume")?.addEventListener("click", closeIngameMenu);
document.getElementById("ig-menu")?.addEventListener("click", navToMenu);
document.getElementById("ig-switch")?.addEventListener("click", navToChoose);
document.getElementById("ig-home")?.addEventListener("click", navToStart);
document.getElementById("btn-switch")?.addEventListener("click", navToChoose);
document.getElementById("btn-home")?.addEventListener("click", navToStart);

function getMatchOptions() {
  const playerIdx = parseInt(selPlayer.value, 10);
  return {
    mode: selMode.value,
    difficulty: DIFFICULTY[selDiff.value],
    userPlayerIndex: Number.isInteger(playerIdx) ? playerIdx : 9,
    minutesPerHalf: parseInt(selHalf.value, 10) || 2,
    fun: getFunConfig(),
  };
}

// Fun-Modus: verrückte Regeln. Nur aktiv, wenn der Haupt-Schalter an ist.
const chkFun = document.getElementById("chk-fun");
const funOpts = document.getElementById("fun-opts");
const funKeeper = document.getElementById("fun-keeper");
const funTurbo = document.getElementById("fun-turbo");
const funBig = document.getElementById("fun-bigball");
const funIce = document.getElementById("fun-ice");
const funDrunk = document.getElementById("fun-drunk");
const funMagnet = document.getElementById("fun-magnet");
const funRocket = document.getElementById("fun-rocket");
const funSticky = document.getElementById("fun-sticky");
const funMini = document.getElementById("fun-mini");
const funBigTeam = document.getElementById("fun-bigteam");
const funRainbow = document.getElementById("fun-rainbow");
const funRandom = document.getElementById("fun-random");
chkFun?.addEventListener("change", () => funOpts?.classList.toggle("hidden", !chkFun.checked));

const FUN_KEYS = ["keeperChase", "turbo", "bigBall", "iceBall", "drunkKeeper",
  "magnet", "rocket", "sticky", "miniOpp", "bigTeam", "rainbow"];

// Zufalls-Mix: pro Spiel eine zufällige Auswahl der Effekte (mind. eine).
function randomFun() {
  const cfg = {};
  let any = false;
  for (const k of FUN_KEYS) if (Math.random() < 0.33) { cfg[k] = true; any = true; }
  if (!any) cfg[FUN_KEYS[Math.floor(Math.random() * FUN_KEYS.length)]] = true;
  return cfg;
}

function getFunConfig() {
  if (!chkFun || !chkFun.checked) return {};
  if (funRandom?.checked) return randomFun();
  return {
    keeperChase: !!funKeeper?.checked,
    turbo:       !!funTurbo?.checked,
    bigBall:     !!funBig?.checked,
    iceBall:     !!funIce?.checked,
    drunkKeeper: !!funDrunk?.checked,
    magnet:      !!funMagnet?.checked,
    rocket:      !!funRocket?.checked,
    sticky:      !!funSticky?.checked,
    miniOpp:     !!funMini?.checked,
    bigTeam:     !!funBigTeam?.checked,
    rainbow:     !!funRainbow?.checked,
  };
}

// Kommentator-/Sound-Schalter aus dem Menü (Checkboxen).
const chkComm = document.getElementById("chk-comm");
const chkSound = document.getElementById("chk-sound");
function applyCommentarySetting() {
  if (chkComm) commentary.setEnabled(chkComm.checked);
  if (chkSound) sound.setEnabled(chkSound.checked);
}
chkComm?.addEventListener("change", applyCommentarySetting);
chkSound?.addEventListener("change", () => { sound.setEnabled(chkSound.checked); sound.unlock(); });

// Erfolg-Toast: kurze Einblendung bei Freischaltung.
achievements.onUnlock((a) => {
  const el = document.getElementById("ach-toast");
  if (!el) return;
  el.innerHTML = `<span class="ach-ic">${a.icon}</span><span><b>Erfolg freigeschaltet</b><br>${a.name}</span>`;
  el.classList.add("show");
  sound.play("click");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 3200);
});

// Trophäen-Galerie öffnen/schließen.
const btnAch = document.getElementById("btn-ach");
const achOverlay = document.getElementById("ach-overlay");
btnAch?.addEventListener("click", () => {
  const grid = document.getElementById("ach-grid");
  const items = achievements.allWithState();
  grid.innerHTML = items.map((a) =>
    `<div class="ach-card ${a.unlocked ? "" : "locked"}"><div class="ach-ic">${a.unlocked ? a.icon : "🔒"}</div>`
    + `<div class="ach-name">${a.name}</div><div class="ach-desc">${a.desc}</div></div>`).join("");
  document.getElementById("ach-count").textContent =
    `${achievements.unlockedCount()} / ${items.length} freigeschaltet`;
  achOverlay.classList.remove("hidden");
});
document.getElementById("btn-ach-close")?.addEventListener("click", () => achOverlay.classList.add("hidden"));

btnStart.addEventListener("click", () => {
  sound.unlock();             // Audio bei erster Interaktion freischalten
  applyCommentarySetting();
  const type = selType.value;
  const opts = getMatchOptions();
  if (type === "anstoss" || type === "elfer") {
    if (selHome.value === selAway.value) {
      selAway.value = TEAMS.find((t) => t.id !== selHome.value).id;
    }
    if (type === "anstoss") {
      runMatch(teamById(selHome.value), teamById(selAway.value), opts).then(showMenu);
    } else {
      startPenaltyOnly(teamById(selHome.value), teamById(selAway.value));
    }
  } else if (type === "halle") {
    menuEl.classList.add("hidden");
    tournament.start();
  } else {
    menuEl.classList.add("hidden");
    if (type === "liga") {
      // Im WM-Modus ist "Liga" die Gruppenphase (12×4) mit anschließendem K.o.
      if (getCompetition() === "wm") season.startWM(selHome.value, opts);
      else season.startLeague(selHome.value, opts);
    } else season.startCup(selHome.value, opts);
  }
});

// Reines Elfmeterschießen (eigene Spielart): 1vs1-Mini-Game direkt starten.
function startPenaltyOnly(homeDef, awayDef) {
  menuEl.classList.add("hidden");
  run1v1(homeDef, awayDef, DIFFICULTY[selDiff.value]).then((pen) => {
    if (pen && pen.winner === "home") achievements.unlock("penalty_hero");
    showMenu();
  });
}

btnResume.addEventListener("click", () => {
  menuEl.classList.add("hidden");
  if (selType.value === "halle") tournament.resume();
  else if (selType.value === "liga" && getCompetition() === "wm") season.resume("wm", getMatchOptions());
  else season.resume(selType.value, getMatchOptions());
});

// --------------------------------------------------------------------------
// Match-Steuerung (auch von der Saison genutzt)
// --------------------------------------------------------------------------
let matchResolve = null;
let resultShown = false;

let penaltiesStarted = false;

// Startet ein Match und liefert beim Abschluss ein Ergebnis-Objekt:
//   { home, away, winner: "home"|"away"|null, decidedBy, penalties }
function runMatch(homeDef, awayDef, opts) {
  return new Promise((resolve) => {
    matchResolve = resolve;
    resultShown = false;
    penaltiesStarted = false;
    menuEl.classList.add("hidden");
    hubEl.classList.add("hidden");
    resultEl.classList.add("hidden");

    commentary.reset();
    commentary.setContext({ wm: getCompetition() === "wm" });
    resetSound();

    // Schwierigkeit an die Gesamtstärke koppeln (Nutzer = Heimteam): der
    // GEGNER wird je nach seiner GS leichter/härter, und das EIGENE Team
    // (Mitspieler-KI) je nach seiner GS etwas besser/schlechter.
    const scaledOpts = {
      ...opts,
      difficulty: scaleOpponent(opts.difficulty, awayDef.id),
      teammateDifficulty: scaleTeammates(DIFFICULTY_TEAMMATE, homeDef.id),
    };

    // Eigentlicher Anpfiff (nach der Einlauf-Zeremonie).
    const begin = () => {
      match = new Match(homeDef, awayDef, scaledOpts);
      scoreboardEl.classList.remove("hidden");
      document.getElementById("sb-home").textContent = homeDef.short;
      document.getElementById("sb-away").textContent = awayDef.short;
      closeIngameMenu();                       // sicher: nicht pausiert starten
      ingameBtn?.classList.remove("hidden");   // Pausen-/Menü-Knopf einblenden
    };

    // Hallenspiele ohne Zeremonie; sonst Mannschaftseinlauf zeigen.
    if (opts && opts.indoor) begin();
    else runLineupCeremony(homeDef, awayDef, getCompetition() === "wm", begin);
  });
}

// --------------------------------------------------------------------------
// Mannschaftseinlauf / Aufstellung vor dem Anpfiff (überspringbar).
// Spieler erscheinen nacheinander, Schiri/Linienrichter, kurze Hymne, der
// Kommentator sagt etwas dazu – dann geht's mit "Anpfiff!" aufs Feld.
// --------------------------------------------------------------------------
const REF_NAMES = ["Daniel Schwarz", "Marco Klein", "Jonas Roth", "Tim Berger", "Lukas Frei", "Pavel Horak", "Sven Adler"];
let ceremonyTimer = null;

function runLineupCeremony(homeDef, awayDef, isWM, onDone) {
  const el = document.getElementById("lineup");
  if (!el) { onDone(); return; }

  const stageEl = document.getElementById("lineup-stage");
  const homeCol = document.getElementById("lu-home");
  const awayCol = document.getElementById("lu-away");
  const refsEl = document.getElementById("lineup-refs");
  const skipBtn = document.getElementById("lineup-skip");

  stageEl.textContent = isWM ? "🌍 WM 2026" : "";

  // Eine Mannschaftsspalte aus dem Kader bauen; Spieler erscheinen gestaffelt.
  const buildCol = (def, startDelay) => {
    const squad = buildSquad(def, true);
    const items = squad.map((p, i) =>
      `<li style="animation-delay:${(startDelay + i * 0.12).toFixed(2)}s">` +
      `<span class="lu-num">#${p.number}</span>${p.name}</li>`).join("");
    return `<div class="lu-team" style="border-left-color:${def.colors[0]}">` +
      `<div class="lu-tn">${def.name}</div><div class="lu-form">${def.formation}</div></div>` +
      `<ol class="lu-players">${items}</ol>`;
  };
  homeCol.innerHTML = buildCol(homeDef, 0.1);
  awayCol.innerHTML = buildCol(awayDef, 0.2);

  // Offizielle (erfunden), deterministisch aus den Teams gewählt.
  const seed = (homeDef.short.charCodeAt(0) + awayDef.short.charCodeAt(0));
  const ref = REF_NAMES[seed % REF_NAMES.length];
  const lr1 = REF_NAMES[(seed + 2) % REF_NAMES.length];
  const lr2 = REF_NAMES[(seed + 4) % REF_NAMES.length];
  const fourth = REF_NAMES[(seed + 6) % REF_NAMES.length];
  refsEl.innerHTML = `<b>Schiedsrichter:</b> ${ref}<br>` +
    `<b>Linienrichter:</b> ${lr1} &amp; ${lr2} &nbsp;·&nbsp; <b>4. Offizieller:</b> ${fourth}`;
  refsEl.style.animationDelay = "1.6s";

  el.classList.remove("hidden");
  sound.play("anthem");                 // kurze Hymne
  commentary.entrance(homeDef, awayDef); // Kommentator zum Einlauf

  const proceed = () => {
    if (ceremonyTimer) { clearTimeout(ceremonyTimer); ceremonyTimer = null; }
    skipBtn.onclick = null;
    el.classList.add("hidden");
    onDone();
  };
  skipBtn.onclick = proceed;
  ceremonyTimer = setTimeout(proceed, 7000);  // läuft sonst automatisch los
}

// Hallenturnier-Match: 3 gegen 3, kein Torwart, Banden, 3×30 s.
// homeDef/awayDef tragen .squad (3 Spieler). knockout -> bei Remis Elfmeter.
function runIndoorMatch(homeDef, awayDef, { difficulty, knockout, mode = "team", userPlayerIndex = 0 }) {
  return runMatch(homeDef, awayDef, {
    mode,                       // "team" = alle Spieler, "single" = fester Spieler
    userPlayerIndex,            // im Einzelspieler-Modus: welcher Spieler
    difficulty,
    knockout,
    indoor: true,
    durationSec: 90,            // 3 × 30 Sek
    homeSquad: homeDef.squad,
    awaySquad: awayDef.squad,
    keeperIndex: homeDef.keeperIndex,
  });
}

function resolveRunMatch(score) {
  match = null;
  closeIngameMenu();
  ingameBtn?.classList.add("hidden");
  scoreboardEl.classList.add("hidden");
  resultEl.classList.add("hidden");
  // Erfolge aus dem gespielten Spiel ableiten (home = immer das Nutzerteam).
  if (score && (typeof score.home === "number")) {
    const youGoals = score.home, oppGoals = score.away;
    const won = score.winner ? score.winner === "home" : youGoals > oppGoals;
    achievements.reportMatch({ youGoals, oppGoals, won });
    if (score.penalties && score.winner === "home") achievements.unlock("penalty_hero");
  }
  const r = matchResolve;
  matchResolve = null;
  if (r) r(score);
}

function showMenu() {
  match = null;
  closeIngameMenu();
  ingameBtn?.classList.add("hidden");
  scoreboardEl.classList.add("hidden");
  resultEl.classList.add("hidden");
  hubEl.classList.add("hidden");
  menuEl.classList.remove("hidden");
  updateTypeUI();
}

// Elfmeterschießen starten (K.o.-Spiel blieb auch nach Verlängerung remis).
function startPenalties() {
  const h = match.home, a = match.away;
  const score = { home: match.score.home, away: match.score.away };
  const scorers = matchScorers();
  msgEl.classList.remove("show");
  // Eigener Torwart skaliert mit Schwierigkeit -> nutze die Gegner-Schwierigkeit.
  const homeDef = { short: h.short, name: h.name, colors: h.colors, id: h.id };
  const awayDef = { short: a.short, name: a.name, colors: a.colors, id: a.id };
  const diff = match.oppDifficulty;
  match = null; // Haupt-Spielschleife pausieren, das 1vs1 rendert selbst
  run1v1(homeDef, awayDef, diff).then((pen) => {
    resolveRunMatch({
      home: score.home, away: score.away,
      winner: pen.winner, decidedBy: "i.E.",
      penalties: { home: pen.home, away: pen.away },
      ...scorers,
    });
  });
}

// Spielbericht: Ergebnis + Torschützen-Chronik beider Teams im Overlay.
function showReport() {
  const el = document.getElementById("result-text");
  const h = match.home, a = match.away, s = match.score;
  const suffix = match.wentToExtra ? " n.V." : "";
  const head = `${h.short} ${s.home} : ${s.away} ${a.short}${suffix}`;

  const homeGoals = match.goals.filter((g) => g.team === "home");
  const awayGoals = match.goals.filter((g) => g.team === "away");
  const fmt = (g) => `${g.minute}'&nbsp;${g.scorer}`;
  const col = (goals) => goals.length
    ? goals.map(fmt).join("<br>")
    : '<span style="opacity:.6">–</span>';

  el.innerHTML =
    `<div class="rep-head">${head}</div>` +
    `<div class="rep-grid">` +
      `<div class="rep-col"><div class="rep-team">${h.name}</div>${col(homeGoals)}</div>` +
      `<div class="rep-col"><div class="rep-team">${a.name}</div>${col(awayGoals)}</div>` +
    `</div>`;
}

// Torschützen des gespielten Matches in Saison-Format umwandeln.
function matchScorers() {
  const goals = match ? match.goals : [];
  return {
    homeScorers: goals.filter((g) => g.team === "home").map((g) => g.scorer),
    awayScorers: goals.filter((g) => g.team === "away").map((g) => g.scorer),
    goals: goals.map((g) => ({ ...g })),
  };
}

document.getElementById("btn-continue").addEventListener("click", () => {
  if (!match) { resolveRunMatch({ home: 0, away: 0, winner: null, decidedBy: "regulär", penalties: null, homeScorers: [], awayScorers: [], goals: [] }); return; }
  const s = match.score;
  const winner = s.home > s.away ? "home" : s.away > s.home ? "away" : null;
  resolveRunMatch({
    home: s.home, away: s.away, winner,
    decidedBy: match.wentToExtra ? "n.V." : "regulär", penalties: null,
    ...matchScorers(),
  });
});

season.init({ runMatch, showMenu });
tournament.init({ runIndoorMatch, showMenu });

// --------------------------------------------------------------------------
// HUD
// --------------------------------------------------------------------------
const sbScore = document.getElementById("sb-score");
const sbClock = document.getElementById("sb-clock");
const msgEl = document.getElementById("message");
const powerBar = document.getElementById("power-bar");
const powerFill = document.getElementById("power-fill");

function updatePowerBar() {
  const c = input.getCharge();
  if (c > 0) {
    powerBar.classList.remove("hidden");
    powerFill.style.width = Math.round(c * 100) + "%";
  } else {
    powerBar.classList.add("hidden");
  }
}

function fmtTime(sec) {
  const s = Math.floor(sec);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function updateHUD() {
  sbScore.textContent = `${match.score.home} : ${match.score.away}`;
  sbClock.textContent = match.finished
    ? "Ende"
    : `${match.periodLabel} ${fmtTime(match.clock)}`;
  if (match.message) {
    msgEl.textContent = match.message;
    msgEl.classList.add("show");
  } else {
    msgEl.classList.remove("show");
  }
}

// --------------------------------------------------------------------------
// Spielschleife
// --------------------------------------------------------------------------
let last = performance.now();

// --- Sound-Watcher: erzeugt Effekte aus dem Match-Zustand ---
let sndState = {};
function resetSound() { sndState = { goals: 0, msg: "", started: false, owner: null, ballX: 0 }; }
function soundWatch(m) {
  if (m.pauseTimer > 0 && sndState.started && sndState.msg === m.message) { /* in Pause */ }
  // Anpfiff
  if (!sndState.started) { sndState.started = true; sndState.goals = m.goals.length; sndState.msg = m.message; sound.play("whistleStart"); }

  // Tor
  if (m.goals.length > sndState.goals) { sndState.goals = m.goals.length; sound.play("goal"); }

  // Status-Meldungen (Halbzeit/Verlängerung/Elfmeter/Schluss)
  if (m.message !== sndState.msg) {
    sndState.msg = m.message;
    if (m.message.startsWith("Halbzeit") || m.message.startsWith("Verlängerung")) sound.play("whistleHalf");
    else if (m.message.startsWith("Elfmeterschießen")) sound.play("whistleHalf");
    else if (m.message.startsWith("Schlusspfiff")) sound.play("whistleEnd");
  }

  // Schuss/Pass: Ball war geführt, ist jetzt frei und schnell.
  const owner = m.ball.owner;
  if (sndState.owner && !owner) {
    const sp = Math.hypot(m.ball.vx, m.ball.vy);
    if (sp > 430) sound.play("shot"); else if (sp > 120) sound.play("kick");
  }
  sndState.owner = owner;

  // Bandentreffer (nur Halle): Ball-vx kehrt sich abrupt um.
  if (m.indoor && !owner) {
    const dx = m.ball.x - sndState.ballX;
    if (sndState._lastDx !== undefined && Math.sign(dx) !== 0 && Math.sign(dx) !== Math.sign(sndState._lastDx) && Math.abs(sndState._lastDx) > 2) {
      sound.play("post");
    }
    sndState._lastDx = dx;
  }
  sndState.ballX = m.ball.x;
}

function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  if (match) {
    // Im Pausenmenü wird die Simulation eingefroren (kein Update), aber das
    // letzte Bild weiter gezeichnet.
    if (!paused) {
      match.update(dt, input);
      commentary.update(match, now);
      soundWatch(match);
      updateHUD();
      updatePowerBar();

      // Bei Spielende: entweder Elfmeterschießen starten oder Ergebnis zeigen.
      if (match.finished) {
        if (match.outcome === "penalties" && !penaltiesStarted) {
          penaltiesStarted = true;
          startPenalties();
        } else if (match.outcome === "decided" && !resultShown) {
          resultShown = true;
          showReport();
          resultEl.classList.remove("hidden");
        }
      }
    }

    // Rendern nur, solange ein Match aktiv ist (kann durch Elfmeter/Abbruch
    // mitten im Frame auf null gesetzt werden).
    if (match && VIEW_MODE === "2.5d" && !match.indoor) {
      // 2.5D-Schrägsicht: horizontale Kamera folgt dem gesteuerten Spieler.
      const target = match.cameraTarget;
      cam25X += (target.x - cam25X) * 0.1;
      cam25X = Math.max(WORLD.width * 0.22, Math.min(WORLD.width * 0.78, cam25X));
      render25(ctx, viewW, viewH, match, cam25X, dt * 1000);
    } else if (match) {
      // Top-Down: Scrolling-Kamera.
      const target = match.cameraTarget;
      camera.follow(target.x, target.y);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(-camera.x, -camera.y);
      if (match.indoor) {
        drawIndoorPitch(ctx);          // Halle: kleines Feld, Parkett, Banden, keine Zuschauer
      } else {
        drawPitch(ctx);
        drawCrowdTopDown(ctx, now);
        drawBoards(ctx, now);
      }
      match.ball.draw(ctx);
      for (const p of match.allPlayers) {
        p.draw(ctx, p === match.userPlayer);
      }
      ctx.restore();
    }
  }

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
