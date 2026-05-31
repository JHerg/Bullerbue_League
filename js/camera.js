// Scrolling-Kamera. Folgt einem Ziel (dem gesteuerten Spieler) sanft per
// linearer Interpolation und klemmt an die Weltgrenzen, damit nie über den
// Spielfeldrand hinaus gescrollt wird.

import { WORLD, CAMERA } from "./config.js?v=x";

export class Camera {
  constructor() {
    this.x = 0; // linke obere Ecke des sichtbaren Ausschnitts (Welt-Koordinaten)
    this.y = 0;
    this.viewWidth = 0;
    this.viewHeight = 0;
  }

  resize(w, h) {
    this.viewWidth = w;
    this.viewHeight = h;
  }

  // Sanft auf das Ziel zubewegen und an Weltgrenzen begrenzen.
  follow(targetX, targetY) {
    const desiredX = targetX - this.viewWidth / 2;
    const desiredY = targetY - this.viewHeight / 2;

    this.x += (desiredX - this.x) * CAMERA.lerp;
    this.y += (desiredY - this.y) * CAMERA.lerp;

    this._clamp();
  }

  _clamp() {
    const maxX = Math.max(0, WORLD.width - this.viewWidth);
    const maxY = Math.max(0, WORLD.height - this.viewHeight);

    // Falls die Welt kleiner als der Bildschirm ist: zentrieren.
    this.x = WORLD.width <= this.viewWidth
      ? (WORLD.width - this.viewWidth) / 2
      : Math.min(Math.max(this.x, 0), maxX);
    this.y = WORLD.height <= this.viewHeight
      ? (WORLD.height - this.viewHeight) / 2
      : Math.min(Math.max(this.y, 0), maxY);
  }
}
