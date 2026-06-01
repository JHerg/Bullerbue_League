// Prototyp-Bootstrap: aktiviert die 2.5D-Ansicht und lädt dann das komplette
// Hauptspiel (game.js) mit identischer Logik (Menü, Liga, Pokal, Elfmeter).
// So teilt sich der Prototyp die gesamte Spielphysik mit dem Hauptspiel.

window.BULLERBUE_VIEW = "2.5d";
import("./game.js?v=z");
