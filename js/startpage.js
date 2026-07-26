// Rote Startseite: Begrüßung + "Spielen", danach Wahl WM oder Bullileague.
// Kein Login mehr – einfach auf Spielen drücken.
// Ruft onChoose("wm" | "bundesliga") auf, sobald der Wettbewerb gewählt ist.

import * as achievements from "./achievements.js?v=b7";

const $ = (id) => document.getElementById(id);

let onChoose = null;

export function init(opts) {
  onChoose = opts.onChoose;

  const startEl = $("start");
  if (!startEl) return; // Seite ohne Startseite (z. B. Tests)

  $("st-play").addEventListener("click", showChoose);
  $("ch-wm").addEventListener("click", () => choose("wm"));
  $("ch-bl").addEventListener("click", () => choose("bundesliga"));
  $("ch-back").addEventListener("click", showWelcome);

  showWelcome();
}

// --------------------------------------------------------------------------
function renderStats() {
  const el = $("start-stats");
  if (!el) return;
  const items = achievements.allWithState();
  const n = achievements.unlockedCount();
  const top = items.filter((a) => a.unlocked).slice(0, 6)
    .map((a) => `<span class="st-trophy" title="${a.name}">${a.icon}</span>`).join("");
  el.innerHTML = n > 0
    ? `<div class="st-stats-head">Deine Sachen</div>`
      + `<div class="st-trophies">${top || ""}</div>`
      + `<div class="st-stats-sub">${n} Trophäe${n === 1 ? "" : "n"} freigeschaltet</div>`
    : `<div class="st-stats-sub">Noch keine Trophäen – leg los! 🏆</div>`;
}

function showWelcome() {
  $("start-choose").classList.add("hidden");
  $("start-welcome").classList.remove("hidden");
  renderStats();
}

function showChoose() {
  $("start-welcome").classList.add("hidden");
  $("start-choose").classList.remove("hidden");
}

function choose(competition) {
  const startEl = $("start");
  if (startEl) startEl.classList.add("hidden");
  if (onChoose) onChoose(competition);
}

// Von außen (aus dem Spiel heraus) die Startseite wieder einblenden:
//  openChoose()  -> direkt zur Wettbewerbs-Auswahl
//  openWelcome() -> zur Startseite mit "Spielen"
export function openChoose() {
  const s = $("start");
  if (s) s.classList.remove("hidden");
  showChoose();
}
export function openWelcome() {
  const s = $("start");
  if (s) s.classList.remove("hidden");
  showWelcome();
}
