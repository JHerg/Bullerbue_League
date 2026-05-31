// Bootstrap des 2.5D-Prototyps. Nutzt dieselbe Spiel-Simulation wie das
// Hauptspiel (Match, Input), nur mit dem neuen perspektivischen Renderer.
// Das Hauptspiel (index.html / game.js) bleibt davon unberührt.

import { DIFFICULTY, WORLD } from "./config.js?v=q";
import { teamById } from "./teams.js?v=q";
import { Match } from "./match.js?v=q";
import { Input } from "./input.js?v=q";
import { render } from "./render2d5.js?v=q";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let viewW = 0, viewH = 0;

function resize() {
  const dpr = window.devicePixelRatio || 1;
  viewW = window.innerWidth;
  viewH = window.innerHeight;
  canvas.width = Math.floor(viewW * dpr);
  canvas.height = Math.floor(viewH * dpr);
  canvas.style.width = viewW + "px";
  canvas.style.height = viewH + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

const input = new Input();
const match = new Match(teamById("bav"), teamById("dor"), {
  mode: "team",
  difficulty: DIFFICULTY.Mittel,
  minutesPerHalf: 3,
});

document.getElementById("sb-home").textContent = match.home.short;
document.getElementById("sb-away").textContent = match.away.short;
const sbScore = document.getElementById("sb-score");
const msgEl = document.getElementById("message");

// Horizontale Kamera folgt dem gesteuerten Spieler (sanft, mit Grenzen).
let camX = WORLD.width / 2;

let last = performance.now();
function loop(now) {
  const dtMs = Math.min(33, now - last);
  const dt = dtMs / 1000;
  last = now;

  match.update(dt, input);

  const target = match.cameraTarget.x;
  camX += (target - camX) * 0.1;
  camX = Math.max(WORLD.width * 0.22, Math.min(WORLD.width * 0.78, camX));

  render(ctx, viewW, viewH, match, camX, dtMs);

  sbScore.textContent = `${match.score.home} : ${match.score.away}`;
  if (match.message) { msgEl.textContent = match.message; msgEl.classList.add("show"); }
  else msgEl.classList.remove("show");

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
