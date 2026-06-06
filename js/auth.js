// Lokale Spieler-Konten (nur im Browser, kein Server). Speichert Name +
// Passwort im localStorage. Das ist KEINE echte Sicherheit – es geht nur
// darum, dass sich Leo & Co. mit ihrem Namen "anmelden" und ihre Sachen
// wiederfinden. Passwörter werden daher nur leicht verschleiert abgelegt.

const KEY = "bullerbue_profiles_v1";

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { accounts: {}, current: null }; }
  catch (e) { return { accounts: {}, current: null }; }
}
function write(d) {
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* ignore */ }
}

// Sehr einfache Verschleierung (kein echtes Hashing – reicht fürs Spiel).
function scramble(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}

function norm(name) { return String(name || "").trim().toLowerCase(); }

// Liefert das aktuell angemeldete Profil oder null (Gast = null).
export function current() {
  const d = read();
  if (!d.current) return null;
  const acc = d.accounts[d.current];
  return acc ? { name: acc.name, guest: false } : null;
}

export function isGuest() { return read().current === null; }

// Existiert schon ein Konto mit diesem Namen?
export function exists(name) {
  return !!read().accounts[norm(name)];
}

// Neues Konto anlegen. Fehler, wenn der Name schon vergeben ist.
export function register(name, pass) {
  const n = norm(name);
  if (!n) return { ok: false, error: "Bitte gib einen Namen ein." };
  if (!pass) return { ok: false, error: "Bitte gib ein Passwort ein." };
  const d = read();
  if (d.accounts[n]) return { ok: false, error: "Diesen Namen gibt es schon. Melde dich an." };
  d.accounts[n] = { name: String(name).trim(), pass: scramble(pass), created: Date.now() };
  d.current = n;
  write(d);
  return { ok: true, name: d.accounts[n].name };
}

// Anmelden mit Name + Passwort.
export function login(name, pass) {
  const n = norm(name);
  const d = read();
  const acc = d.accounts[n];
  if (!acc) return { ok: false, error: "Unbekannter Name. Lege ein neues Konto an." };
  if (acc.pass !== scramble(pass)) return { ok: false, error: "Falsches Passwort." };
  d.current = n;
  write(d);
  return { ok: true, name: acc.name };
}

// Als Gast weiterspielen (kein Konto).
export function playAsGuest() {
  const d = read();
  d.current = null;
  write(d);
}

// Abmelden (auf Gast zurück).
export function logout() { playAsGuest(); }
