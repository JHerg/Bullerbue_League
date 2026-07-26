// Team-Editor: erstelle dein eigenes Team (Name, Trikot, Formation + 11 Spieler
// mit Namen/Nummern und optional ⚡schnell / 🧱stark). Wird via teams.js im
// localStorage gespeichert und spielt in der Bullileague mit (id "my").

import { FORMATIONS, getMyTeam, saveMyTeam, deleteMyTeam } from "./teams.js?v=b9";

const $ = (id) => document.getElementById(id);
let onSaved = null;
let formation = "4-3-3";

export function init(opts) {
  onSaved = opts && opts.onSaved;
  const el = $("editor");
  if (!el) return;
  $("ed-cancel").addEventListener("click", close);
  $("ed-save").addEventListener("click", save);
  $("ed-delete").addEventListener("click", () => {
    deleteMyTeam();
    close();
    if (onSaved) onSaved();
  });
  $("ed-formation").addEventListener("change", () => {
    const cur = collect();          // schon eingegebene Namen behalten
    formation = $("ed-formation").value;
    renderRows(cur);
  });
}

export function open() {
  const my = getMyTeam();
  $("ed-name").value = my ? my.name : "Mein Team";
  $("ed-short").value = my ? my.short : "MEIN";
  $("ed-jersey").value = (my && my.colors && my.colors[0]) || "#e53935";
  $("ed-trim").value = (my && my.colors && my.colors[1]) || "#ffffff";
  formation = (my && my.formation) || "4-3-3";
  $("ed-formation").value = formation;
  renderRows((my && my.players) || []);
  $("ed-delete").classList.toggle("hidden", !my);
  $("editor").classList.remove("hidden");
}

function close() { $("editor").classList.add("hidden"); }

function renderRows(players = []) {
  const slots = FORMATIONS[formation];
  $("ed-rows").innerHTML = slots.map((s, i) => {
    const p = players[i] || {};
    const name = String(p.name || "").replace(/"/g, "&quot;");
    return `<div class="ed-row">
      <span class="ed-role">${s.role}</span>
      <input class="ed-num" type="number" min="1" max="99" value="${p.number ?? i + 1}" data-i="${i}" data-f="number" />
      <input class="ed-pname" type="text" placeholder="Spielername" value="${name}" data-i="${i}" data-f="name" />
      <label class="ed-flag" title="schnell"><input type="checkbox" data-i="${i}" data-f="speed" ${p.speed ? "checked" : ""} />⚡</label>
      <label class="ed-flag" title="stark"><input type="checkbox" data-i="${i}" data-f="build" ${p.build ? "checked" : ""} />🧱</label>
    </div>`;
  }).join("");
}

// Liest die aktuellen Zeilen aus (auch für Formationswechsel).
function collect() {
  const slots = FORMATIONS[formation];
  const players = slots.map(() => ({}));
  $("ed-rows").querySelectorAll("input").forEach((inp) => {
    const i = +inp.dataset.i, f = inp.dataset.f;
    if (!players[i]) return;
    if (f === "name") players[i].name = inp.value.trim();
    else if (f === "number") players[i].number = parseInt(inp.value, 10) || (i + 1);
    else if (f === "speed") players[i].speed = inp.checked ? 1.3 : undefined;
    else if (f === "build") players[i].build = inp.checked ? 1.7 : undefined;
  });
  return players;
}

function save() {
  const def = {
    id: "my",
    name: ($("ed-name").value.trim() || "Mein Team"),
    short: ($("ed-short").value.trim().toUpperCase().slice(0, 4) || "MEIN"),
    colors: [$("ed-jersey").value, $("ed-trim").value],
    formation,
    rating: 78,
    players: collect(),
  };
  saveMyTeam(def);
  close();
  if (onSaved) onSaved();
}
