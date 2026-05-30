// Haupt-Spielschleife: bindet Eingabe, Kamera, Spielfeld, Spieler und Ball
// zusammen. Erster Prototyp-Meilenstein: Scrolling-Kamera + Laufen.

import { WORLD } from "./config.js";
import { Input } from "./input.js";
import { Camera } from "./camera.js";
import { drawPitch } from "./pitch.js";
import { Player } from "./player.js";
import { Ball } from "./ball.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const input = new Input();
const camera = new Camera();
const player = new Player(WORLD.width / 2 - 60, WORLD.height / 2);
const ball = new Ball(WORLD.width / 2, WORLD.height / 2);

// Canvas an Bildschirmgröße anpassen (inkl. Retina/HiDPI).
function resize() {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  camera.resize(w, h);
}
window.addEventListener("resize", resize);
resize();

let last = performance.now();

function loop(now) {
  // dt begrenzen, damit es nach Tab-Wechseln keine Sprünge gibt.
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  // --- Update ---
  const dir = input.getDirection();
  player.update(dt, dir);
  ball.interactWith(player);
  ball.update(dt);
  camera.follow(player.x, player.y);

  // --- Render ---
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  drawPitch(ctx);
  ball.draw(ctx);
  player.draw(ctx);

  ctx.restore();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
