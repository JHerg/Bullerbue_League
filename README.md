# Bullerbue League ⚽

Eine browserbasierte Fußballsimulation (11 gegen 11), die schrittweise nach
unserer Feature-Master-Liste entwickelt wird. Läuft ohne Installation auf
**PC und iPad/Tablet** direkt im Browser (HTML5 Canvas + JavaScript).

## ✅ Aktueller Stand

### Meilenstein 1 — Prototyp „Kamera & Laufen"
- **Spielfeld größer als der Bildschirm** mit korrekten Markierungen
  (Mittelkreis, Strafräume, Torräume, Elfmeterpunkte, Strafraumbögen, Tore).
- **Scrolling-Kamera**, die dem gesteuerten Spieler dynamisch über den Platz folgt
  und an den Spielfeldrändern sauber stoppt.
- **Plattformübergreifende Steuerung:** PC `WASD`/Pfeile · Tablet virtueller Joystick.

### Meilenstein 2 — 11 gegen 11 mit KI
- **Schuss & Pass:** `Leertaste` = Schuss, `E` = Pass (Touch: zwei Buttons unten rechts).
  Pass sucht automatisch den besten Mitspieler nach vorn; Ball wird mit Reibung
  geführt (Dribbling) und beim Schuss freigegeben.
- **18 Teams als Datenbasis** mit Fake-Namen (z. B. „Bavaria München") und
  generierten Fake-Spielern (z. B. „Harry Cohen"), echten Startelf-Formationen
  (4-3-3 / 4-2-3-1 / 4-4-2) und Vereinsfarben.
- **Zwei Spieler-Fokus-Modi:**
  - **Team-Modus:** Du steuerst automatisch den Spieler am/nächsten zum Ball.
  - **Einzelspieler-Modus:** Du wählst einen festen Spieler und steuerst ihn das
    ganze Spiel.
- **Gegner-KI mit 4 Schwierigkeitsstufen** (Einfach / Mittel / Schwer / Ultimativ):
  skaliert Tempo, Reaktion, Pass-/Schusspräzision, Entschlossenheit und Pressing.
- **Spielmodus „Anstoß":** freie Teamauswahl im Startmenü, Anzeigetafel,
  Tor-Erkennung mit Anstoß nach dem Treffer.

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
  config.js       Maße, Geschwindigkeiten, Schwierigkeitsprofile, Farben
  teams.js        18 Teams, Formationen, Fake-Namen-Generator (Datenbasis)
  input.js        Tastatur + Touch-Joystick + Aktions-Buttons (Schuss/Pass)
  camera.js       Scrolling-Kamera mit sanftem Folgen & Grenzen
  pitch.js        Zeichnet das Spielfeld mit allen Linien
  player.js       Feldspieler (Rolle, Heimposition, Bewegung)
  ball.js         Ball-Physik, Ballführung, Schuss/Pass
  ai.js           Gegner-/Mitspieler-KI (4 Schwierigkeitsstufen)
  team.js         Mannschaft = 11 Spieler + Farben + Angriffsrichtung
  match.js        Match-Logik: Fokus-Modi, KI, Ballbesitz, Tore, Spielstand
  game.js         Startmenü, Haupt-Spielschleife, HUD, Rendering
```

## 🗺️ Roadmap (Master-Liste)

Reihenfolge nach Priorität für die nächsten Schritte:

1. **[erledigt]** Prototyp: Scrolling-Kamera + Laufen.
2. **[erledigt]** Schuss-/Pass-Mechanik (Leertaste / Touch-Button).
3. **[erledigt]** Zwei Mannschaften mit Fake-Namen + Startelf-Aufstellungen (18 Teams).
4. **[erledigt]** Spieler-Fokus-Modi: Team-Modus & Einzelspieler-Modus.
5. **[erledigt]** Gegner-KI mit 4 Schwierigkeitsstufen.
6. Spielzeit/Halbzeit + Regel bei Unentschieden (Verlängerung/Elfmeterschießen).
7. **Liga-Modus** (18 Teams, Hin-/Rückrunde, Tabelle).
8. **Pokal-/Turniermodus** (K.o., Verlängerung, Elfmeterschießen).
9. Flanken & spezielle Abschluss-Mechaniken.
10. Feinschliff: kuratierte Fake-Spielernamen je Team, Abseits, Einwürfe/Ecken.

> Diese Liste arbeiten wir Schritt für Schritt ab — „Vibe Coding" mit rotem Faden.
