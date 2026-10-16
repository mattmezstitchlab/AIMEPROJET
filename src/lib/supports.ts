import type { Support } from "./types";

export const SUPPORTS: Support[] = [
  { id: "carte-a6", nom: "Carte A6", w: 105, h: 148, cat: "Correspondance", unite: "mm" },
  { id: "carte-visite", nom: "Carte de visite", w: 85, h: 55, cat: "Correspondance", unite: "mm" },
  { id: "carte-postale", nom: "Carte postale", w: 148, h: 105, cat: "Correspondance", unite: "mm" },
  { id: "billet", nom: "Billet long", w: 200, h: 80, cat: "Accès", unite: "mm" },
  { id: "badge", nom: "Badge vertical", w: 90, h: 130, cat: "Accès", unite: "mm" },
  { id: "a4", nom: "Page A4", w: 210, h: 297, cat: "Document", unite: "mm" },
  { id: "a5", nom: "Livret A5", w: 148, h: 210, cat: "Édition", unite: "mm" },
  { id: "a3", nom: "Affiche A3", w: 297, h: 420, cat: "Affichage", unite: "mm" },
  { id: "carre", nom: "Carré social", w: 180, h: 180, cat: "Numérique", unite: "px" },
  { id: "web", nom: "Page web 16:10", w: 288, h: 180, cat: "Numérique", unite: "px" },
  { id: "mobile", nom: "Écran mobile", w: 90, h: 195, cat: "Numérique", unite: "px" },
  { id: "kakemono", nom: "Kakémono", w: 85, h: 200, cat: "Spatial", unite: "mm" },
  { id: "etiquette", nom: "Étiquette", w: 60, h: 90, cat: "Spatial", unite: "mm" },
  { id: "deplie", nom: "Packaging déplié", w: 240, h: 140, cat: "Spatial", unite: "mm" },
  { id: "enveloppe", nom: "Enveloppe C6", w: 162, h: 114, cat: "Correspondance", unite: "mm" },
  { id: "timbre", nom: "Timbre décoratif", w: 35, h: 43, cat: "Correspondance", unite: "mm" },
  { id: "tampon", nom: "Tampon", w: 45, h: 45, cat: "Correspondance", unite: "mm" },
  { id: "sticker", nom: "Sticker", w: 70, h: 70, cat: "Correspondance", unite: "mm" },
];

export const supportById = (id: string) => SUPPORTS.find((s) => s.id === id) ?? SUPPORTS[0];
