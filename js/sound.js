// Sound-Effekte über die Web Audio API – komplett synthetisiert, keine Assets.
// play("kind") spielt einen kurzen Effekt. Stummschaltbar via setEnabled().
// Der AudioContext wird erst bei der ersten Nutzer-Interaktion gestartet
// (Browser-Autoplay-Regeln).

let ctx = null;
let enabled = true;
let master = null;

function ensureCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.75;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function setEnabled(on) { enabled = !!on; }
export function isEnabled() { return enabled; }
// Bei der ersten Eingabe aufrufen, damit Audio erlaubt ist (iOS/Chrome).
export function unlock() { ensureCtx(); }

// Ein einzelner Ton mit Hüllkurve.
function tone({ freq = 440, type = "sine", dur = 0.2, gain = 0.3, slideTo = null, delay = 0 }) {
  const c = ensureCtx(); if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g); g.connect(master);
  osc.start(t0); osc.stop(t0 + dur + 0.02);
}

// Kurzes Rauschen (für Pfeife/Jubel/Menge).
function noise({ dur = 0.3, gain = 0.2, delay = 0, filter = 1000, type = "bandpass" }) {
  const c = ensureCtx(); if (!c) return;
  const t0 = c.currentTime + delay;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource(); src.buffer = buf;
  const f = c.createBiquadFilter(); f.type = type; f.frequency.value = filter;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f); f.connect(g); g.connect(master);
  src.start(t0); src.stop(t0 + dur + 0.02);
}

// Schiedsrichterpfiff (zwei kurze, hohe, leicht modulierte Töne).
function whistle(long = false) {
  const c = ensureCtx(); if (!c) return;
  const segs = long ? [[0, 0.5]] : [[0, 0.16], [0.2, 0.16]];
  for (const [d, dur] of segs) {
    tone({ freq: 2300, type: "square", dur, gain: 0.18, delay: d });
    tone({ freq: 2600, type: "sine", dur, gain: 0.12, delay: d });
  }
}

// Jubelnde Menge (gefiltertes Rauschen, das an- und abschwillt).
function crowdCheer(big = false) {
  noise({ dur: big ? 1.6 : 0.9, gain: big ? 0.32 : 0.2, filter: 900, type: "bandpass" });
  noise({ dur: big ? 1.6 : 0.9, gain: big ? 0.18 : 0.12, filter: 2200, type: "highpass", delay: 0.05 });
}

export function play(kind) {
  if (!enabled) return;
  switch (kind) {
    case "kick":   tone({ freq: 220, type: "triangle", dur: 0.09, gain: 0.35, slideTo: 120 }); break;
    case "shot":   tone({ freq: 300, type: "square", dur: 0.12, gain: 0.4, slideTo: 90 }); break;
    case "post":   tone({ freq: 900, type: "square", dur: 0.12, gain: 0.3, slideTo: 600 }); break; // Banden/Pfosten
    case "save":   tone({ freq: 180, type: "sine", dur: 0.18, gain: 0.3 }); noise({ dur: 0.12, gain: 0.15, filter: 1500 }); break;
    case "goal":   // Fanfare + Torjubel
      tone({ freq: 523, type: "sawtooth", dur: 0.18, gain: 0.3 });
      tone({ freq: 659, type: "sawtooth", dur: 0.18, gain: 0.3, delay: 0.16 });
      tone({ freq: 784, type: "sawtooth", dur: 0.32, gain: 0.32, delay: 0.32 });
      crowdCheer(true);
      break;
    case "whistleStart": whistle(false); crowdCheer(false); break;
    case "whistleHalf":  whistle(true); break;
    case "whistleEnd":   whistle(true); setTimeout(() => crowdCheer(true), 200); break;
    case "miss":   tone({ freq: 200, type: "sine", dur: 0.2, gain: 0.2, slideTo: 140 }); break;
    case "click":  tone({ freq: 660, type: "sine", dur: 0.05, gain: 0.2 }); break;
    case "anthem": {  // kurze feierliche Fanfare beim Mannschaftseinlauf
      const mel = [392, 523, 659, 784, 784, 659, 698, 784, 1047];
      const durs = [0.30, 0.30, 0.30, 0.45, 0.30, 0.30, 0.30, 0.30, 0.70];
      let d = 0;
      for (let i = 0; i < mel.length; i++) {
        tone({ freq: mel[i], type: "sawtooth", dur: durs[i] * 0.95, gain: 0.22, delay: d });
        tone({ freq: mel[i] / 2, type: "triangle", dur: durs[i] * 0.95, gain: 0.10, delay: d });
        d += durs[i];
      }
      crowdCheer(false);
      break;
    }
    case "party": {  // Fun: Jubel-Fanfare beim Tor
      const mel = [523, 659, 784, 1047];
      mel.forEach((f, i) => tone({ freq: f, type: "square", dur: 0.16, gain: 0.22, delay: i * 0.12 }));
      crowdCheer(true);
      break;
    }
    case "boing":    // Fun: Quatsch-Schuss
      tone({ freq: 720, type: "sine", dur: 0.22, gain: 0.34, slideTo: 150 });
      tone({ freq: 300, type: "triangle", dur: 0.14, gain: 0.2, slideTo: 110, delay: 0.05 });
      break;
    default: break;
  }
}
