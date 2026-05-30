// Bootstrap: Startmenü -> Match. Verbindet Eingabe, Kamera, Spielfeld und
// das Match-Objekt und kümmert sich um Rendering und HUD.

import { DIFFICULTY } from "./config.js";
import { TEAMS, buildSquad, teamById } from "./teams.js";
import { Input } from "./input.js";
import { Camera } from "./camera.js";
import { drawPitch } from "./pitch.js";
import { Match } from "./match.js";
import * as season from "./seasonui.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const input = new Input();
const camera = new Camera();
let match = null;

// --------------------------------------------------------------------------
// Canvas-Größe (inkl. HiDPI)
// --------------------------------------------------------------------------
function resize() {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth, h = window.innerHeight;
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

for (const t of TEAMS) {
  selHome.add(new Option(t.name, t.id));
  selAway.add(new Option(t.name, t.id));
}
selHome.value = "bav";
selAway.value = "dor";

// Spielerliste fürs Einzelspieler-Menü passend zum (Heim-/Dein) Team füllen.
function refreshPlayerList() {
  const def = teamById(selHome.value);
  selPlayer.innerHTML = "";
  buildSquad(def, true).forEach((p, i) => {
    selPlayer.add(new Option(`#${p.number} ${p.name} (${p.role})`, String(i)));
  });
  selPlayer.value = "9";
}
refreshPlayerList();
selHome.addEventListener("change", refreshPlayerList);

selMode.addEventListener("change", () => {
  lblPlayer.classList.toggle("hidden", selMode.value !== "single");
});

// Sichtbarkeit/Beschriftung je nach Spielart.
function updateTypeUI() {
  const type = selType.value;
  const isAnstoss = type === "anstoss";
  lblAway.classList.toggle("hidden", !isAnstoss);
  lblHome.childNodes[0].nodeValue = isAnstoss ? "Heimteam" : "Dein Team";
  btnStart.textContent = isAnstoss ? "Anpfiff!" : "Saison starten";
  const canResume = !isAnstoss && season.hasSave(type);
  btnResume.classList.toggle("hidden", !canResume);
}
selType.addEventListener("change", updateTypeUI);
updateTypeUI();

function getMatchOptions() {
  const playerIdx = parseInt(selPlayer.value, 10);
  return {
    mode: selMode.value,
    difficulty: DIFFICULTY[selDiff.value],
    userPlayerIndex: Number.isInteger(playerIdx) ? playerIdx : 9,
    minutesPerHalf: parseInt(selHalf.value, 10) || 2,
  };
}

btnStart.addEventListener("click", () => {
  const type = selType.value;
  const opts = getMatchOptions();
  if (type === "anstoss") {
    if (selHome.value === selAway.value) {
      selAway.value = TEAMS.find((t) => t.id !== selHome.value).id;
    }
    runMatch(teamById(selHome.value), teamById(selAway.value), opts).then(showMenu);
  } else {
    menuEl.classList.add("hidden");
    if (type === "liga") season.startLeague(selHome.value, opts);
    else season.startCup(selHome.value, opts);
  }
});

btnResume.addEventListener("click", () => {
  menuEl.classList.add("hidden");
  season.resume(selType.value, getMatchOptions());
});

// --------------------------------------------------------------------------
// Match-Steuerung (auch von der Saison genutzt)
// --------------------------------------------------------------------------
let matchResolve = null;
let resultShown = false;

// Startet ein Match und liefert beim "Weiter" den Endstand { home, away }.
function runMatch(homeDef, awayDef, opts) {
  return new Promise((resolve) => {
    matchResolve = resolve;
    resultShown = false;
    match = new Match(homeDef, awayDef, opts);
    menuEl.classList.add("hidden");
    hubEl.classList.add("hidden");
    resultEl.classList.add("hidden");
    scoreboardEl.classList.remove("hidden");
    document.getElementById("sb-home").textContent = homeDef.short;
    document.getElementById("sb-away").textContent = awayDef.short;
  });
}

function showMenu() {
  match = null;
  scoreboardEl.classList.add("hidden");
  resultEl.classList.add("hidden");
  hubEl.classList.add("hidden");
  menuEl.classList.remove("hidden");
  updateTypeUI();
}

document.getElementById("btn-continue").addEventListener("click", () => {
  const score = match ? { home: match.score.home, away: match.score.away } : { home: 0, away: 0 };
  match = null;
  scoreboardEl.classList.add("hidden");
  resultEl.classList.add("hidden");
  const r = matchResolve;
  matchResolve = null;
  if (r) r(score);
});

season.init({ runMatch, showMenu });

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
    : `${match.half}. HZ ${fmtTime(match.clock)}`;
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

function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  if (match) {
    match.update(dt, input);
    const target = match.cameraTarget;
    camera.follow(target.x, target.y);
    updateHUD();
    updatePowerBar();

    // Bei Spielende das Ergebnis-Overlay mit "Weiter" einblenden.
    if (match.finished && !resultShown) {
      resultShown = true;
      document.getElementById("result-text").textContent = match.message;
      resultEl.classList.remove("hidden");
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    drawPitch(ctx);
    match.ball.draw(ctx);
    for (const p of match.allPlayers) {
      p.draw(ctx, p === match.userPlayer);
    }

    ctx.restore();
  }

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
