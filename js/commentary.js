// Live-Kommentator über die Web Speech API (speechSynthesis).
// Beobachtet den Match-Zustand und spricht Ereignisse: Anpfiff, Ballbesitz
// (mit Spielernamen), Schüsse, Tore (ausführlich), Standards, Halbzeit, Ende.
// Wählt eine deutsche, möglichst männliche Stimme mit tieferer Reporter-Tonlage.
// Keine externen Assets.

let enabled = true;
let voice = null;
let voiceReady = false;

function pickVoice() {
  if (typeof speechSynthesis === "undefined") return;
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return;
  const de = voices.filter((v) => /^de(-|_|$)/i.test(v.lang) || /deutsch|german/i.test(v.name));
  // Männliche Stimmen bevorzugen (Namens-Heuristik).
  const maleHint = /(male|männ|mann|stefan|markus|conrad|hans|yannick|viktor|klaus|google deutsch|reed|daniel)/i;
  voice = de.find((v) => maleHint.test(v.name)) || de[0] || voices[0] || null;
  voiceReady = true;
}

if (typeof speechSynthesis !== "undefined") {
  pickVoice();
  speechSynthesis.addEventListener?.("voiceschanged", pickVoice);
}

export function setEnabled(on) {
  enabled = !!on;
  if (!enabled && typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
}
export function isEnabled() { return enabled; }

// Spricht einen Text. priority=true bricht laufende Ausgabe ab (z. B. Tor).
function say(text, { priority = false, excited = false } = {}) {
  if (!enabled || typeof speechSynthesis === "undefined" || !text) return;
  if (!voiceReady) pickVoice();
  if (priority) speechSynthesis.cancel();
  // Bei normaler Rede nicht stapeln, wenn schon viel ansteht.
  if (!priority && speechSynthesis.speaking) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "de-DE";
  if (voice) u.voice = voice;
  u.pitch = excited ? 0.95 : 0.8;   // tiefer = männlicher/Reporter
  u.rate = excited ? 1.12 : 0.98;
  u.volume = 1;
  speechSynthesis.speak(u);
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ---- Zustands-Tracking ----
let started = false;
let prevGoals = 0;
let prevMessage = "";
let prevOwner = null;
let prevHalf = 1;
let lastTalk = 0;       // Zeitstempel letzter Flavor-Kommentar
let lastOwnerTalk = 0;
let prevFinished = false;
let introDone = false;  // Einlauf/Begrüßung schon gesprochen?

// Kontext: WM-Modus + Phasen-Bezeichnung (z. B. "Gruppe B", "Achtelfinale").
let ctxWM = false;
let stageLabel = "";
export function setContext({ wm = false, stage = "" } = {}) {
  ctxWM = !!wm; stageLabel = stage || "";
}

export function reset() {
  started = false; prevGoals = 0; prevMessage = ""; prevOwner = null;
  prevHalf = 1; lastTalk = 0; lastOwnerTalk = 0; prevFinished = false;
  introDone = false;
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
}

// Mannschaftseinlauf / Aufstellung: wird VOR dem Anpfiff gesprochen.
export function entrance(home, away) {
  if (!enabled) return;
  introDone = true;
  const stage = stageLabel ? ` ${stageLabel}` : "";
  const line = ctxWM
    ? pick([
        `Weltmeisterschaft!${stage ? " " + stageLabel + "." : ""} Die Mannschaften betreten den Rasen: ${home.name} gegen ${away.name}. Hören Sie die Hymnen, spüren Sie die Spannung!`,
        `Bühne frei bei der WM: ${home.name} empfängt ${away.name}.${stage} Die Teams laufen ein, das ganze Stadion ist auf den Beinen!`,
        `Ein großer Tag bei der Weltmeisterschaft. ${home.name} und ${away.name} kommen aus dem Spielertunnel.${stage}`,
      ])
    : pick([
        `Die Mannschaften laufen ein: ${home.name} gegen ${away.name}. Gleich geht es los!`,
        `Willkommen! Die Teams ${home.name} und ${away.name} betreten den Platz.`,
      ]);
  say(line, { priority: true });
}

// Pro Frame aufrufen. now = performance.now() in ms.
export function update(match, now) {
  if (!enabled || !match) return;
  const h = match.home, a = match.away, s = match.score;

  // --- Anpfiff / Begrüßung ---
  if (!started) {
    started = true;
    prevGoals = match.goals.length;
    prevMessage = match.message;
    // Wurde der Einlauf schon kommentiert, hier nur kurzer Anpfiff-Satz.
    const line = introDone
      ? pick(["Anpfiff! Der Ball rollt.", "Es geht los — Anpfiff!", "Und der Schiedsrichter gibt das Spiel frei!"])
      : (ctxWM
          ? `Herzlich willkommen zur Weltmeisterschaft! ${h.name} gegen ${a.name}. Der Ball rollt.`
          : `Herzlich willkommen zum Spiel zwischen ${h.name} und ${a.name}! Der Ball rollt.`);
    say(line, { priority: true });
    lastTalk = now;
    return;
  }

  // --- Tor (höchste Priorität, ausführlich) ---
  if (match.goals.length > prevGoals) {
    const g = match.goals[match.goals.length - 1];
    prevGoals = match.goals.length;
    const teamName = g.team === "home" ? h.name : a.name;
    const lead = pick(["Tooor!", "Und das ist drin — Tooor!", "Was für ein Treffer — Tor!", "Er trifft! Tooor!"]);
    const ownNote = g.own ? "Ein unglückliches Eigentor! " : "";
    const detail = g.own
      ? `${g.scorer} fälscht ins eigene Netz ab.`
      : pick([
          `${g.scorer} trifft für ${teamName}!`,
          `Da ist der Treffer von ${g.scorer} für ${teamName}!`,
          `${g.scorer} bleibt eiskalt und vollendet für ${teamName}!`,
        ]);
    const stand = `Es steht ${h.short} ${s.home}, ${a.short} ${s.away}, in der ${g.minute}. Minute.`;
    say(`${lead} ${ownNote}${detail} ${stand}`, { priority: true, excited: true });
    lastTalk = now;
    return;
  }

  // --- Standard-/Status-Meldungen (außer Tor, das oben behandelt wird) ---
  if (match.message && match.message !== prevMessage && !match.message.startsWith("TOR")) {
    prevMessage = match.message;
    const m = match.message;
    let line = null;
    if (m.startsWith("Einwurf")) line = pick(["Einwurf.", "Der Ball ist im Seitenaus, Einwurf.", "Aus, Einwurf."]);
    else if (m.startsWith("Eckball")) line = pick(["Eckball!", "Ecke! Gefährliche Situation.", "Die nächste Ecke."]);
    else if (m.startsWith("Abstoß")) line = "Abstoß.";
    else if (m.startsWith("Halbzeit")) line = `Halbzeit. Es steht ${h.short} ${s.home}, ${a.short} ${s.away}. Seitenwechsel.`;
    else if (m.startsWith("Verlängerung")) line = pick(["Es geht in die Verlängerung!", "Verlängerung — jetzt zählt jede Aktion."]);
    else if (m.startsWith("Elfmeter")) line = "Es kommt zum Elfmeterschießen! Die Entscheidung vom Punkt.";
    if (line) { say(line, { priority: true }); lastTalk = now; }
  }

  // --- Schlusspfiff ---
  if (match.finished && !prevFinished) {
    prevFinished = true;
    const res = s.home === s.away ? "Unentschieden." :
      (s.home > s.away ? `${h.name} gewinnt!` : `${a.name} gewinnt!`);
    say(`Abpfiff! ${h.short} ${s.home}, ${a.short} ${s.away}. ${res}`, { priority: true, excited: true });
    return;
  }
  if (match.finished) return;

  // --- Ballbesitz / Spielername (gedrosselt, mit Abwechslung) ---
  const owner = match.ball.owner;
  if (owner && owner !== prevOwner) {
    const wasOpp = prevOwner && prevOwner.team !== owner.team;
    if (now - lastOwnerTalk > 5000 && now - lastTalk > 2500) {
      const t = owner.team === h ? h : a;
      const line = wasOpp
        ? pick([
            `Ballgewinn! ${owner.name} hat übernommen.`,
            `${owner.name} schnappt sich den Ball für ${t.short}.`,
            `Und jetzt ${owner.name} am Ball.`,
          ])
        : pick([
            `${owner.name} hat den Ball.`,
            `Weiter über ${owner.name}.`,
            `${owner.name} treibt das Spiel an.`,
            `Gut aufgelegt heute: ${owner.name}.`,
          ]);
      say(line);
      lastOwnerTalk = now; lastTalk = now;
    }
  }

  // --- Schussversuch: Ball war eben noch geführt, jetzt frei & schnell Richtung Tor ---
  if (prevOwner && !owner) {
    const b = match.ball;
    const speed = Math.hypot(b.vx, b.vy);
    if (speed > 430 && now - lastTalk > 1800) {
      // Richtung: positiver vx -> rechtes Tor, negativ -> linkes Tor
      say(pick(["Schuss!", "Und Abschluss!", "Er zieht ab!", "Gefährlicher Versuch!"]), { excited: true });
      lastTalk = now;
    }
  }

  prevOwner = owner;
  if (match.half !== prevHalf) prevHalf = match.half;
}
