// Rote Startseite: Begrüßung, Login/Gast/Neu, danach Wahl WM oder Bullileague.
// Ruft onChoose("wm" | "bundesliga") auf, sobald der Wettbewerb gewählt ist.

import * as auth from "./auth.js?v=p2";
import * as achievements from "./achievements.js?v=p2";

const $ = (id) => document.getElementById(id);

let onChoose = null;
let formMode = "login"; // "login" oder "register"

export function init(opts) {
  onChoose = opts.onChoose;

  const startEl = $("start");
  if (!startEl) return; // Seite ohne Startseite (z. B. Tests)

  // --- Stage 1: Aktionen -------------------------------------------------
  $("st-login").addEventListener("click", () => showForm("login"));
  $("st-new").addEventListener("click", () => showForm("register"));
  $("st-guest").addEventListener("click", () => {
    auth.playAsGuest();
    showChoose();
  });
  $("st-cancel").addEventListener("click", hideForm);
  $("st-submit").addEventListener("click", submitForm);
  $("st-pass").addEventListener("keydown", (e) => { if (e.key === "Enter") submitForm(); });

  // --- Stage 2: Wettbewerb ----------------------------------------------
  $("ch-wm").addEventListener("click", () => choose("wm"));
  $("ch-bl").addEventListener("click", () => choose("bundesliga"));
  $("ch-logout").addEventListener("click", () => {
    auth.logout();
    showWelcome();
  });

  renderStats();
  showWelcome();

  // Komfort: Namen des zuletzt angemeldeten Profils vorbefüllen.
  const cur = auth.current();
  if (cur) $("st-name").value = cur.name;
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
  hideForm();
  renderStats();
}

function showForm(mode) {
  formMode = mode;
  $("st-error").textContent = "";
  $("start-form").classList.remove("hidden");
  $("st-actions").classList.add("hidden");
  $("st-submit").textContent = mode === "register" ? "Konto anlegen" : "Anmelden";
  $("st-form-title").textContent = mode === "register" ? "Neues Konto" : "Anmelden";
  $("st-name").focus();
}

function hideForm() {
  $("start-form").classList.add("hidden");
  $("st-actions").classList.remove("hidden");
  $("st-error").textContent = "";
}

function submitForm() {
  const name = $("st-name").value;
  const pass = $("st-pass").value;
  const res = formMode === "register" ? auth.register(name, pass) : auth.login(name, pass);
  if (!res.ok) { $("st-error").textContent = res.error; return; }
  $("st-pass").value = "";
  showChoose();
}

function showChoose() {
  const cur = auth.current();
  $("st-greet").textContent = cur ? `Hallo ${cur.name}! 👋` : "Hallo! 👋";
  $("start-welcome").classList.add("hidden");
  $("start-form").classList.add("hidden");
  $("start-choose").classList.remove("hidden");
}

function choose(competition) {
  const startEl = $("start");
  if (startEl) startEl.classList.add("hidden");
  if (onChoose) onChoose(competition);
}
