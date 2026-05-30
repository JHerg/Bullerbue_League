// Bootstrap: Startmenü -> Match. Verbindet Eingabe, Kamera, Spielfeld und
// das Match-Objekt und kümmert sich um Rendering und HUD.

import { DIFFICULTY } from "./config.js";
import { TEAMS, buildSquad } from "./teams.js";
import { Input } from "./input.js";
import { Camera } from "./camera.js";
import { drawPitch } from "./pitch.js";
import { Match } from "./match.js";

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
const selHome = document.getElementById("sel-home");
const selAway = document.getElementById("sel-away");
const selMode = document.getElementById("sel-mode");
const selDiff = document.getElementById("sel-diff");
const selHalf = document.getElementById("sel-half");
const selPlayer = document.getElementById("sel-player");
const lblPlayer = document.getElementById("lbl-player");

for (const t of TEAMS) {
  selHome.add(new Option(t.name, t.id));
  selAway.add(new Option(t.name, t.id));
}
selHome.value = "bav";
selAway.value = "dor";

// Spielerliste fürs Einzelspieler-Menü passend zum Heimteam füllen.
function refreshPlayerList() {
  const def = TEAMS.find((t) => t.id === selHome.value);
  selPlayer.innerHTML = "";
  buildSquad(def, true).forEach((p, i) => {
    selPlayer.add(new Option(`#${p.number} ${p.name} (${p.role})`, String(i)));
  });
  selPlayer.value = "9"; // standardmäßig ein Stürmer
}
refreshPlayerList();
selHome.addEventListener("change", refreshPlayerList);

selMode.addEventListener("change", () => {
  lblPlayer.classList.toggle("hidden", selMode.value !== "single");
});

document.getElementById("btn-start").addEventListener("click", () => {
  if (selHome.value === selAway.value) {
    // Gleiche Teams vermeiden: Auswärts auf ein anderes setzen.
    const other = TEAMS.find((t) => t.id !== selHome.value);
    selAway.value = other.id;
  }
  const homeDef = TEAMS.find((t) => t.id === selHome.value);
  const awayDef = TEAMS.find((t) => t.id === selAway.value);

  const playerIdx = parseInt(selPlayer.value, 10);
  match = new Match(homeDef, awayDef, {
    mode: selMode.value,
    difficulty: DIFFICULTY[selDiff.value],
    userPlayerIndex: Number.isInteger(playerIdx) ? playerIdx : 9,
    minutesPerHalf: parseInt(selHalf.value, 10) || 2,
  });

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("scoreboard").classList.remove("hidden");
  document.getElementById("sb-home").textContent = homeDef.short;
  document.getElementById("sb-away").textContent = awayDef.short;
});

// --------------------------------------------------------------------------
// HUD
// --------------------------------------------------------------------------
const sbScore = document.getElementById("sb-score");
const sbClock = document.getElementById("sb-clock");
const msgEl = document.getElementById("message");

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
