// Plattformübergreifende Eingabe:
//  - PC: WASD/Pfeile = laufen · Leertaste = Schuss (halten = härter) ·
//        F = Sekundäraktion (Pass / Grätsche / Spielerwechsel) · Shift/Q = Wechsel
//  - Tablet/Touch: virtueller Joystick + Buttons "SCHUSS" und "PASS"
//
// Bewegung -> getDirection() (normierter Vektor)
// Schuss   -> consumeShoot() -> { charge: 0..1 } | null  (Haltedauer = Härte)
// Sekundär -> consumeSecondary() -> bool  (Pass/Grätsche/Wechsel je nach Lage)
// Wechsel  -> consumeSwitch() -> bool

const MAX_CHARGE_MS = 600;

export class Input {
  constructor() {
    this.keys = new Set();
    this.joystick = { x: 0, y: 0, active: false };

    this.pendingShoot = false;
    this.shootCharge = 0;
    this.shootDown = false;
    this.shootStart = 0;

    this.pendingSecondary = false;
    this.pendingSwitch = false;

    this._initKeyboard();
    this._initJoystick();
    this._initButtons();
  }

  _pressShoot() {
    if (!this.shootDown) { this.shootDown = true; this.shootStart = performance.now(); }
  }
  _releaseShoot() {
    if (!this.shootDown) return;
    this.shootCharge = Math.min(1, (performance.now() - this.shootStart) / MAX_CHARGE_MS);
    this.shootDown = false;
    this.pendingShoot = true;
  }

  _initKeyboard() {
    window.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      if (!e.repeat) {
        if (k === " ") this._pressShoot();
        if (k === "f") this.pendingSecondary = true;
        if (k === "shift" || k === "q") this.pendingSwitch = true;
      }
      this.keys.add(k);
      if (e.key.startsWith("Arrow") || e.key === " ") e.preventDefault();
    });
    window.addEventListener("keyup", (e) => {
      const k = e.key.toLowerCase();
      if (k === " ") this._releaseShoot();
      this.keys.delete(k);
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
    shoot.addEventListener("touchstart", (e) => { e.preventDefault(); this._pressShoot(); }, { passive: false });
    shoot.addEventListener("touchend", (e) => { e.preventDefault(); this._releaseShoot(); }, { passive: false });
    pass.addEventListener("touchstart", (e) => { e.preventDefault(); this.pendingSecondary = true; }, { passive: false });
  }

  // Aktuelle Schuss-Ladung (0..1), während die Schusstaste gehalten wird.
  getCharge() {
    return this.shootDown ? Math.min(1, (performance.now() - this.shootStart) / MAX_CHARGE_MS) : 0;
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

  consumeShoot() {
    if (!this.pendingShoot) return null;
    this.pendingShoot = false;
    return { charge: this.shootCharge };
  }
  consumeSecondary() { const v = this.pendingSecondary; this.pendingSecondary = false; return v; }
  consumeSwitch() { const v = this.pendingSwitch; this.pendingSwitch = false; return v; }
}
