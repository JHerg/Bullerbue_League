// Plattformübergreifende Eingabe:
//  - PC: Tastatur (WASD/Pfeile = laufen, Leertaste = Schuss, E = Pass)
//  - Tablet/Touch: virtueller Joystick + Touch-Buttons (Schuss/Pass)
//
// Bewegung -> normierter Richtungsvektor getDirection().
// Aktionen  -> einmalig auslösbar via consumeShoot()/consumePass().

export class Input {
  constructor() {
    this.keys = new Set();
    this.joystick = { x: 0, y: 0, active: false };
    this.pendingShoot = false;
    this.pendingPass = false;

    this._initKeyboard();
    this._initJoystick();
    this._initButtons();
  }

  _initKeyboard() {
    window.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      if (!e.repeat) {
        if (k === " ") this.pendingShoot = true;
        if (k === "e") this.pendingPass = true;
      }
      this.keys.add(k);
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

    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (!isTouch) return;
    el.classList.remove("hidden");

    const maxDist = 40;
    let touchId = null;

    const center = () => {
      const r = el.getBoundingClientRect();
      return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    };
    const setKnob = (dx, dy) => { knob.style.transform = `translate(${dx}px, ${dy}px)`; };
    const update = (clientX, clientY) => {
      const { cx, cy } = center();
      let dx = clientX - cx;
      let dy = clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > maxDist) { dx = (dx / dist) * maxDist; dy = (dy / dist) * maxDist; }
      setKnob(dx, dy);
      this.joystick.x = dx / maxDist;
      this.joystick.y = dy / maxDist;
      this.joystick.active = true;
    };
    const reset = () => {
      touchId = null;
      setKnob(0, 0);
      this.joystick.x = 0; this.joystick.y = 0; this.joystick.active = false;
    };

    el.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      touchId = t.identifier;
      update(t.clientX, t.clientY);
    }, { passive: false });
    el.addEventListener("touchmove", (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) if (t.identifier === touchId) update(t.clientX, t.clientY);
    }, { passive: false });
    const end = (e) => { for (const t of e.changedTouches) if (t.identifier === touchId) reset(); };
    el.addEventListener("touchend", end);
    el.addEventListener("touchcancel", end);
  }

  _initButtons() {
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const shoot = document.getElementById("btn-shoot");
    const pass = document.getElementById("btn-pass");
    if (!isTouch || !shoot || !pass) return;

    document.getElementById("actions")?.classList.remove("hidden");
    const bind = (el, fn) => {
      el.addEventListener("touchstart", (e) => { e.preventDefault(); fn(); }, { passive: false });
    };
    bind(shoot, () => { this.pendingShoot = true; });
    bind(pass, () => { this.pendingPass = true; });
  }

  getDirection() {
    let x = 0, y = 0;
    if (this.keys.has("arrowleft") || this.keys.has("a")) x -= 1;
    if (this.keys.has("arrowright") || this.keys.has("d")) x += 1;
    if (this.keys.has("arrowup") || this.keys.has("w")) y -= 1;
    if (this.keys.has("arrowdown") || this.keys.has("s")) y += 1;
    if (this.joystick.active) { x += this.joystick.x; y += this.joystick.y; }

    const len = Math.hypot(x, y);
    if (len > 1) { x /= len; y /= len; }
    return { x, y };
  }

  consumeShoot() { const v = this.pendingShoot; this.pendingShoot = false; return v; }
  consumePass() { const v = this.pendingPass; this.pendingPass = false; return v; }
}
