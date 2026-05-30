# Bullerbue League ⚽

Eine browserbasierte Fußballsimulation (11 gegen 11), die schrittweise nach
unserer Feature-Master-Liste entwickelt wird. Läuft ohne Installation auf
**PC und iPad/Tablet** direkt im Browser (HTML5 Canvas + JavaScript).

## ✅ Aktueller Stand — Meilenstein 1: Prototyp „Kamera & Laufen"

- **Spielfeld größer als der Bildschirm** mit korrekten Markierungen
  (Mittelkreis, Strafräume, Torräume, Elfmeterpunkte, Strafraumbögen, Tore).
- **Scrolling-Kamera**, die dem gesteuerten Spieler dynamisch über den Platz folgt
  und an den Spielfeldrändern sauber stoppt.
- **Plattformübergreifende Steuerung:**
  - **PC:** `WASD` oder Pfeiltasten zum Laufen.
  - **Tablet/Touch:** virtueller On-Screen-Joystick (unten links).
- **Ball** als kleiner Vorgeschmack: rollt mit Reibung und lässt sich
  anschubsen/dribbeln.

## 🚀 Starten

Da das Spiel ES-Module nutzt, muss es über einen kleinen Webserver laufen
(nicht per Doppelklick auf die Datei). Im Projektordner:

```bash
# Variante 1: Python
python3 -m http.server 8000

# Variante 2: Node
npx serve .
```

Dann im Browser öffnen: <http://localhost:8000>

Auf dem iPad: Rechner und iPad im selben WLAN, dann
`http://<PC-IP>:8000` aufrufen.

## 📁 Projektstruktur

```
index.html        Einstieg + HUD + Joystick-Container
css/style.css     Layout, HUD, virtueller Joystick
js/
  config.js       Zentrale Maße, Geschwindigkeiten, Farben
  input.js        Tastatur + Touch-Joystick → normierter Richtungsvektor
  camera.js       Scrolling-Kamera mit sanftem Folgen & Grenzen
  pitch.js        Zeichnet das Spielfeld mit allen Linien
  player.js       Steuerbarer Spieler (Beschleunigung/Reibung)
  ball.js         Ball-Physik & einfache Dribbel-Interaktion
  game.js         Haupt-Spielschleife
```

## 🗺️ Roadmap (Master-Liste)

Reihenfolge nach Priorität für die nächsten Schritte:

1. **[erledigt] Prototyp:** Scrolling-Kamera + Laufen.
2. Schuss-/Pass-Mechanik (Leertaste / Touch-Button).
3. Zwei Mannschaften mit Fake-Namen + echte Startelf-Aufstellungen (18 Teams).
4. Spieler-Fokus-Modi: Team-Modus (Ball-naher Spieler) & Einzelspieler-Modus.
5. Gegner-KI mit 4 Schwierigkeitsstufen (Einfach/Mittel/Schwer/Ultimativ).
6. Spielmodus **Anstoß** (freie Teamauswahl, Regel bei Unentschieden).
7. Tore, Spielstand, Spielzeit, Anstoß-Logik.
8. **Liga-Modus** (18 Teams, Hin-/Rückrunde, Tabelle).
9. **Pokal-/Turniermodus** (K.o., Verlängerung, Elfmeterschießen).
10. Flanken & spezielle Abschluss-Mechaniken.

> Diese Liste arbeiten wir Schritt für Schritt ab — „Vibe Coding" mit rotem Faden.
