// Spielbares Elfmeterschießen (Mini-Game) für K.o.-Spiele.
// Du schießt für dein Team (Ecke wählen) und hältst gegen den Gegner
// (Ecke wählen). Best-of-5, danach Sudden Death.
//
// run(info) -> Promise<{ home, away, winner: "home" | "away" }>
//   info: { homeShort, homeName, homeColors, homeRating,
//           awayShort, awayName, awayColors, awayRating }
//
// "home" ist immer das vom Nutzer gesteuerte Team.

const ZONE_X = ["18%", "50%", "82%"]; // Links / Mitte / Rechts

export function run(info) {
  return new Promise((resolve) => new Shootout(info, resolve).start());
}

class Shootout {
  constructor(info, resolve) {
    this.info = info;
    this.resolve = resolve;

    this.home = 0; this.away = 0;
    this.homeTaken = 0; this.awayTaken = 0;
    this.hist = { home: [], away: [] };
    this.turn = "home"; // Heim (Nutzer) beginnt
    this.awaiting = false;

    this.el = document.getElementById("penalty");
    this.titleEl = document.getElementById("pen-title");
    this.scoreEl = document.getElementById("pen-score");
    this.dotsEl = document.getElementById("pen-dots");
    this.statusEl = document.getElementById("pen-status");
    this.ballEl = document.getElementById("pen-ball");
    this.keeperEl = document.getElementById("pen-keeper");
    this.buttonsEl = document.getElementById("pen-buttons");
    this.continueEl = document.getElementById("pen-continue");

    this._onKey = this._onKey.bind(this);
  }

  start() {
    this.el.classList.remove("hidden");
    this.continueEl.classList.add("hidden");
    this.titleEl.textContent = `Elfmeterschießen`;
    // Touch-/Klick-Buttons
    this.buttonsEl.querySelectorAll("button").forEach((b) => {
      b.onclick = () => this._pick(parseInt(b.dataset.z, 10));
    });
    window.addEventListener("keydown", this._onKey);
    this._render();
    this._prompt();
  }

  _onKey(e) {
    if (!this.awaiting) return;
    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") this._pick(0);
    else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") this._pick(2);
    else if (e.key === "ArrowUp" || e.key === " " || e.key.toLowerCase() === "w") this._pick(1);
  }

  _prompt() {
    const winner = this._decided();
    if (winner) { this._finish(winner); return; }

    this._resetScene();
    if (this.turn === "home") {
      this.statusEl.textContent = "⚽ Du schießt – wähle die Ecke!";
      this._setKeeperColor(this.info.awayColors);
    } else {
      this.statusEl.textContent = "🧤 Du hältst – wähle deine Ecke!";
      this._setKeeperColor(this.info.homeColors);
    }
    this.buttonsEl.classList.remove("hidden");
    this.awaiting = true;
  }

  _pick(zone) {
    if (!this.awaiting) return;
    this.awaiting = false;
    this.buttonsEl.classList.add("hidden");

    let shotZone, keeperZone, rating;
    if (this.turn === "home") {
      shotZone = zone;
      keeperZone = this._keeperPick();
      rating = this.info.homeRating;
    } else {
      keeperZone = zone;
      shotZone = this._shooterPick(this.info.awayRating);
      rating = this.info.awayRating;
    }

    const outcome = this._resolveKick(shotZone, keeperZone);

    // Animation: Ball in die Schussecke, Keeper in seine Ecke.
    this.ballEl.style.left = ZONE_X[shotZone];
    this.ballEl.style.bottom = outcome === "miss" ? "92%" : "62%";
    this.keeperEl.style.left = ZONE_X[keeperZone];

    if (this.turn === "home") { this.homeTaken++; if (outcome === "goal") this.home++; this.hist.home.push(outcome); }
    else { this.awayTaken++; if (outcome === "goal") this.away++; this.hist.away.push(outcome); }

    setTimeout(() => {
      this.statusEl.textContent =
        outcome === "goal" ? "TOR! ⚽" : outcome === "save" ? "Gehalten! 🧤" : "Daneben! 😬";
      this._render();
    }, 450);

    setTimeout(() => {
      this.turn = this.turn === "home" ? "away" : "home";
      this._prompt();
    }, 1500);
  }

  // 0/1/2 = links/mitte/rechts
  _keeperPick() {
    const r = Math.random();
    if (r < 0.2) return 1;
    return r < 0.6 ? 0 : 2;
  }
  _shooterPick(rating) {
    // Stärkere Schützen zielen häufiger in die Ecke.
    const cornerProb = Math.min(0.85, 0.55 + (rating - 75) * 0.012);
    if (Math.random() < cornerProb) return Math.random() < 0.5 ? 0 : 2;
    return 1;
  }
  _resolveKick(shotZone, keeperZone) {
    if (Math.random() < 0.06) return "miss";
    if (shotZone === keeperZone) {
      const saveProb = shotZone === 1 ? 0.82 : 0.62;
      return Math.random() < saveProb ? "save" : "goal";
    }
    return "goal";
  }

  // Sieger oder null (Best-of-5 + Sudden Death).
  _decided() {
    const { home: h, away: a, homeTaken: ht, awayTaken: at } = this;
    if (ht <= 5 && at <= 5 && !(ht === 5 && at === 5)) {
      const hRem = 5 - ht, aRem = 5 - at;
      if (h > a + aRem) return "home";
      if (a > h + hRem) return "away";
      return null;
    }
    if (ht === at && h !== a) return h > a ? "home" : "away";
    return null;
  }

  _finish(winner) {
    this.awaiting = false;
    this._resetScene();
    const w = winner === "home" ? this.info.homeName : this.info.awayName;
    this.statusEl.textContent = `${w} gewinnt im Elfmeterschießen ${this.home}:${this.away}!`;
    this.continueEl.classList.remove("hidden");
    this.continueEl.onclick = () => {
      window.removeEventListener("keydown", this._onKey);
      this.el.classList.add("hidden");
      this.resolve({ home: this.home, away: this.away, winner });
    };
  }

  _resetScene() {
    this.ballEl.style.left = "50%";
    this.ballEl.style.bottom = "8%";
    this.keeperEl.style.left = "50%";
  }

  _setKeeperColor(colors) {
    this.keeperEl.style.background = colors[0];
    this.keeperEl.style.borderColor = colors[1];
  }

  _render() {
    const i = this.info;
    this.scoreEl.textContent = `${i.homeShort}  ${this.home} : ${this.away}  ${i.awayShort}`;
    this.dotsEl.innerHTML =
      `<div class="pen-row">${this._dots("home")}</div>` +
      `<div class="pen-row">${this._dots("away")}</div>`;
  }
  _dots(side) {
    const arr = this.hist[side];
    let s = `<span class="pen-side">${side === "home" ? this.info.homeShort : this.info.awayShort}</span>`;
    const n = Math.max(5, arr.length);
    for (let i = 0; i < n; i++) {
      const o = arr[i];
      const cls = o === "goal" ? "g" : o === undefined ? "e" : "m";
      s += `<span class="pdot ${cls}"></span>`;
    }
    return s;
  }
}
