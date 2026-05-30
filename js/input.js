// Plattformübergreifende Eingabe:
//  - PC: Tastatur (WASD + Pfeiltasten)
//  - Tablet/Touch: virtueller On-Screen-Joystick
//
// Nach außen liefert dieses Modul immer einen normierten Richtungsvektor
// { x, y } im Bereich [-1, 1], egal welche Eingabeart genutzt wird.

export class Input {
  constructor() {
    this.keys = new Set();
    this.joystick = { x: 0, y: 0, active: false };

    this._initKeyboard();
    this._initJoystick();
  }

  _initKeyboard() {
    window.addEventListener("keydown", (e) => {
      this.keys.add(e.key.toLowerCase());
      // Scrollen der Seite mit Pfeiltasten verhindern
      if (e.key.startsWith("Arrow") || e.key === " ") e.preventDefault();
    });
    window.addEventListener("keyup", (e) => {
      this.keys.delete(e.key.toLowerCase());
    });
  }

  _initJoystick() {
    const el = document.getElementById("joystick");
    const knob = document.getElementById("joystick-knob");
    if (!el || !knob) return;

    // Joystick nur auf Touch-Geräten zeigen
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (!isTouch) return;
    el.classList.remove("hidden");

    const maxDist = 40; // px, Radius der Joystick-Auslenkung
    let touchId = null;

    const center = () => {
      const r = el.getBoundingClientRect();
      return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    };

    const setKnob = (dx, dy) => {
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    const update = (clientX, clientY) => {
      const { cx, cy } = center();
      let dx = clientX - cx;
      let dy = clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > maxDist) {
        dx = (dx / dist) * maxDist;
        dy = (dy / dist) * maxDist;
      }
      setKnob(dx, dy);
      this.joystick.x = dx / maxDist;
      this.joystick.y = dy / maxDist;
      this.joystick.active = true;
    };

    const reset = () => {
      touchId = null;
      setKnob(0, 0);
      this.joystick.x = 0;
      this.joystick.y = 0;
      this.joystick.active = false;
    };

    el.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      touchId = t.identifier;
      update(t.clientX, t.clientY);
    }, { passive: false });

    el.addEventListener("touchmove", (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (t.identifier === touchId) update(t.clientX, t.clientY);
      }
    }, { passive: false });

    const end = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === touchId) reset();
      }
    };
    el.addEventListener("touchend", end);
    el.addEventListener("touchcancel", end);
  }

  // Normierter Bewegungsvektor (Länge max. 1)
  getDirection() {
    let x = 0;
    let y = 0;

    // Tastatur
    if (this.keys.has("arrowleft") || this.keys.has("a")) x -= 1;
    if (this.keys.has("arrowright") || this.keys.has("d")) x += 1;
    if (this.keys.has("arrowup") || this.keys.has("w")) y -= 1;
    if (this.keys.has("arrowdown") || this.keys.has("s")) y += 1;

    // Joystick überschreibt/ergänzt
    if (this.joystick.active) {
      x += this.joystick.x;
      y += this.joystick.y;
    }

    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    return { x, y };
  }
}
