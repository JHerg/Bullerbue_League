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

### Meilenstein 3 — Regeln, Aktion & Halbzeit
- **Aus-Erkennung:** Seitenaus → **Einwurf**, Toraus → **Abstoß** oder **Eckball**
  (korrekt nach letztem Ballkontakt), statt an den Banden abzuprallen.
- **Kontextabhängige Leertaste** (eine Taste für alles):
  - am Ball → **Schuss** (in Tornähe) bzw. **Pass** nach vorn,
  - ohne Ball & eigenes Team in Ballbesitz → **Ball anfordern** (Mitspieler passt zu dir),
  - ohne Ball & Gegner am Ball → **Grätsche** (Hechten + Ball erobern).
- **Halbzeitdauer wählbar** im Startmenü (2 × 1 / 2 / 3 / 5 Minuten).
- **Halbzeit** mit **Seitenwechsel** + laufende **Spieluhr** und Schlusspfiff.

### Meilenstein 4 — Spielgefühl
- **Bessere Torwart-KI:** bleibt im Tor, stellt sich zwischen Ball und Tor,
  antizipiert Schüsse, läuft nur bei nahem Ball heraus und hat einen größeren
  Fang-/Abwehrradius → deutlich weniger „billige" Gegentore.
- **Schuss-Power über Haltedauer:** Leertaste kurz = Pass, gehalten = härterer
  Schuss (Ladebalken zeigt die Power an).
- **Aktiver Spieler** deutlich markiert (Ring + Pfeil + Name) und im Team-Modus
  per **Shift/Q** (Touch: „WECHSEL") manuell wechselbar.

### Meilenstein 5 — Saison: Liga, Pokal & Speichern
- **Liga-Modus:** komplette Saison mit 18 Teams, **Hin- & Rückrunde** (34 Spieltage),
  **Tabelle** (Punkte/Tordifferenz) und Spielplan. Pro Spieltag dein Spiel **selbst
  spielen** oder **simulieren**; die übrigen Partien werden automatisch simuliert.
- **Pokal-Modus:** K.o.-Baum mit 16 Teams (Achtel-/Viertel-/Halbfinale, Finale),
  Unentschieden im selbst gespielten Spiel wird per **Elfmeterschießen** entschieden.
- **Schnell-Simulation** nicht gespielter Partien anhand von Team-Stärken.
- **Speichern/Laden** (localStorage): Saison wird automatisch gesichert und kann
  über **„Saison fortsetzen"** weitergeführt werden.
- **Build-Kennung** im Startmenü, um die live ausgelieferte Version zu erkennen.

### Meilenstein 6 — Feinschliff Steuerung & Regeln
- **Anstoß-Aufstellung:** beim Anpfiff, nach jedem Tor und nach der Halbzeit
  stehen **alle Spieler in ihrer eigenen Hälfte**; ein zentraler Spieler des
  anstoßberechtigten Teams steht direkt am Mittelpunkt.
- **Eindeutige Trikotfarben:** bei Farbkollision bekommt das Auswärtsteam
  automatisch ein klar kontrastierendes Ausweichtrikot.
- **Zwei getrennte Tasten:** `Leertaste` = **Schuss** (halten = härter),
  `F` = **Pass / Grätsche / Spielerwechsel** (kontextabhängig).
  Tablet: zwei Buttons „SCHUSS" und „PASS".
- **Leichtere Gegner-KI** (eigene Mitspieler mit festem, hilfreichem Profil).

### Meilenstein 7 — K.o.: Verlängerung & Elfmeterschießen
- **Verlängerung:** Steht ein selbst gespieltes Pokalspiel nach 90 Min remis,
  folgen zwei kurze Verlängerungshälften (mit Seitenwechsel).
- **Elfmeterschießen als Mini-Game:** Bleibt es auch nach Verlängerung remis,
  entscheidet ein **spielbares** Elfmeterschießen — du **schießt** (Ecke wählen)
  und **hältst** (Ecke wählen), Best-of-5 plus Sudden Death.
  Steuerung: Pfeile/`A`·`W`/Leertaste·`D` oder Buttons „Links/Mitte/Rechts".
- Der Pokal-Baum zeigt, wie eine Partie entschieden wurde (`n.V.` / `i.E.`).

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
6. **[erledigt]** Spielzeit, Halbzeit/Seitenwechsel, Aus-Regeln (Einwurf/Ecke/Abstoß).
7. **[erledigt]** Liga-Modus (18 Teams, Hin-/Rückrunde, Tabelle, Spielplan).
8. **[erledigt]** Pokal-/Turniermodus (K.o.-Baum, Elfmeterschießen).
9. **[erledigt]** Speichern/Laden des Saison-Fortschritts (localStorage).
10. **[erledigt]** Verlängerung & spielbares Elfmeterschießen (Mini-Game).
11. Flanken & spezielle Abschluss-Mechaniken; kuratierte Spielernamen, Abseits.
12. **Stadion-Atmosphäre:** Zuschauer und Bandenwerbung (wird separat entwickelt).
13. **[erledigt]** Einwurf & Anstoß als spielbarer Pass (Ball am Fuß des Ausführenden).
14. **Torwart-Sprung:** als Torwart mit der Leertaste springen/abheben (Paraden).
15. **[erledigt]** Statistiken: Torschützenliste in Liga & Pokal + Spielbericht am Spielende.

> Diese Liste arbeiten wir Schritt für Schritt ab — „Vibe Coding" mit rotem Faden.
