// Lokale Spieler-Konten (nur im Browser, kein Server). Speichert Name +
// Passwort im localStorage. Das ist KEINE echte Sicherheit – es geht nur
// darum, dass sich Leo & Co. mit ihrem Namen "anmelden" und ihre Sachen
// wiederfinden. Passwörter werden daher nur leicht verschleiert abgelegt.
//
// Regel (auf Wunsch): Der NAME darf mehrfach vergeben werden – das PASSWORT
// muss eindeutig sein. Ein Konto wird also über sein Passwort identifiziert.

const KEY = "bullerbue_profiles_v2";
const OLD_KEYS = ["bullerbue_profiles_v1"];

// Alte Konten einmalig entfernen ("alle Konten löschen").
try { for (const k of OLD_KEYS) localStorage.removeItem(k); } catch (e) { /* ignore */ }

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { accounts: {}, current: null }; }
  catch (e) { return { accounts: {}, current: null }; }
}
function write(d) {
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* ignore */ }
}

// Sehr einfache Verschleierung (kein echtes Hashing – reicht fürs Spiel).
// Dient gleichzeitig als eindeutiger Schlüssel des Kontos (Passwort = Schlüssel).
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

// Neues Konto anlegen. Name darf mehrfach vorkommen, das Passwort nicht.
export function register(name, pass) {
  const n = String(name || "").trim();
  if (!n) return { ok: false, error: "Bitte gib einen Namen ein." };
  if (!pass) return { ok: false, error: "Bitte gib ein Passwort ein." };
  const d = read();
  const h = scramble(pass);
  if (d.accounts[h]) return { ok: false, error: "Dieses Passwort ist schon vergeben. Nimm ein anderes." };
  d.accounts[h] = { name: n, created: Date.now() };
  d.current = h;
  write(d);
  return { ok: true, name: n };
}

// Anmelden mit Name + Passwort. Das Passwort findet das Konto; der Name
// muss zu diesem Konto passen (da Namen mehrfach vorkommen können).
export function login(name, pass) {
  const d = read();
  const h = scramble(pass);
  const acc = d.accounts[h];
  if (!acc) return { ok: false, error: "Name oder Passwort stimmt nicht." };
  if (norm(acc.name) !== norm(name)) return { ok: false, error: "Name oder Passwort stimmt nicht." };
  d.current = h;
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
