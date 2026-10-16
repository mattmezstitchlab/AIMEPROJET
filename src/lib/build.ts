import type { AimeNode, Archetype, ObjetType, Role, Slot, Composition } from "./types";
import { archetypeById } from "./archetypes";
import { objetById } from "./objects";

export const newId = () =>
  "AIME-" + Math.random().toString(36).slice(2, 7).toUpperCase() + Date.now().toString(36).slice(-3).toUpperCase();

const base: Omit<AimeNode, "id" | "nom" | "famille" | "role" | "kind" | "x" | "y" | "w" | "h"> = {
  rot: 0,
  text: "",
  align: "left",
  font: "body",
  size: 2.2,
  weight: 400,
  tracking: 0,
  leading: 1.35,
  casse: "normale",
  italique: false,
  ink: "ink",
  fill: "none",
  stroke: "none",
  strokeW: 0,
  radius: 0,
  opacity: 1,
  locked: false,
  exportable: true,
  etat: "brouillon",
};

export const ROLE_KIND: Record<Role, AimeNode["kind"]> = {
  surtitre: "texte",
  titre: "titre",
  soustitre: "texte",
  corps: "texte",
  meta: "table",
  media: "image",
  code: "code",
  sceau: "sceau",
  numero: "numero",
  filet: "filet",
  forme: "forme",
  symbole: "symbole",
};

export const ROLE_LABEL: Record<Role, string> = {
  surtitre: "Surtitre",
  titre: "Titre",
  soustitre: "Sous-titre",
  corps: "Corps de texte",
  meta: "Données",
  media: "Photographie",
  code: "Code de vérification",
  sceau: "Sceau",
  numero: "Nombre",
  filet: "Filet",
  forme: "Forme",
  symbole: "Symbole",
};

export function roleDefaults(role: Role): Partial<AimeNode> {
  switch (role) {
    case "surtitre":
      return { font: "mono", size: 1.8, tracking: 0.24, casse: "capitales", ink: "accent", leading: 1.3 };
    case "titre":
      return { font: "display", size: 7, leading: 1.02, weight: 500, ink: "ink" };
    case "soustitre":
      return { font: "body", size: 2.8, italique: true, ink: "alt", leading: 1.25 };
    case "corps":
      return { font: "body", size: 2.1, leading: 1.5, ink: "ink" };
    case "meta":
      return { font: "mono", size: 1.7, ink: "ink", leading: 1.7, tracking: 0.02 };
    case "numero":
      return { font: "display", size: 12, weight: 700, ink: "accent", leading: 0.9 };
    case "filet":
      return { fill: "accent" };
    case "forme":
      return { fill: "muted" };
    case "code":
      return { ink: "ink" };
    case "sceau":
      return { ink: "accent", font: "mono", size: 1.4 };
    default:
      return {};
  }
}

function contentFor(objet: ObjetType, role: Role): { text: string; rows?: { k: string; v: string }[]; src?: string } | null {
  const c = objet.contenu;
  switch (role) {
    case "surtitre":
      return c.surtitre ? { text: c.surtitre } : null;
    case "titre":
      return c.titre ? { text: c.titre } : null;
    case "soustitre":
      return c.soustitre ? { text: c.soustitre } : null;
    case "corps":
      return c.corps ? { text: c.corps } : null;
    case "meta":
      return c.meta?.length ? { text: "", rows: c.meta } : null;
    case "media":
      return c.media ? { text: "", src: c.media } : null;
    case "code":
      return c.code ? { text: c.code } : null;
    case "sceau":
      return c.sceau ? { text: c.sceau } : null;
    case "numero":
      return c.numero ? { text: c.numero } : null;
    case "filet":
    case "forme":
      return { text: "" };
    default:
      return null;
  }
}

/** Fabrique un objet typé à partir d'un emplacement d'archétype et d'un contenu libre. */
export function makeNode(
  slot: Slot,
  contenu: { nom?: string; text?: string; rows?: { k: string; v: string }[]; src?: string; fragId?: string },
): AimeNode {
  return {
    ...base,
    ...roleDefaults(slot.role),
    id: newId(),
    nom: contenu.nom ?? ROLE_LABEL[slot.role],
    famille: "fragment",
    role: slot.role,
    kind: ROLE_KIND[slot.role],
    x: slot.x,
    y: slot.y,
    w: slot.w,
    h: slot.h,
    align: slot.align ?? "left",
    ...(slot.size ? { size: slot.size } : {}),
    text: contenu.text ?? "",
    rows: contenu.rows,
    src: contenu.src,
    fragId: contenu.fragId,
    ...(slot.opts ?? {}),
  } as AimeNode;
}

export function nodeFromSlot(objet: ObjetType, slot: Slot): AimeNode | null {
  const content = contentFor(objet, slot.role);
  if (!content) return null;
  return {
    ...base,
    ...roleDefaults(slot.role),
    id: newId(),
    nom: ROLE_LABEL[slot.role],
    famille: objet.famille,
    role: slot.role,
    kind: ROLE_KIND[slot.role],
    x: slot.x,
    y: slot.y,
    w: slot.w,
    h: slot.h,
    align: slot.align ?? "left",
    ...(slot.size ? { size: slot.size } : {}),
    text: content.text,
    rows: content.rows,
    src: content.src,
    ...(slot.opts ?? {}),
  } as AimeNode;
}

export function buildNodes(objetId: string, archetypeId: string): AimeNode[] {
  const objet = objetById(objetId);
  const arc: Archetype = archetypeById(archetypeId);
  return arc.slots.map((s) => nodeFromSlot(objet, s)).filter(Boolean) as AimeNode[];
}

export function buildComposition(objetId: string, archetypeId?: string, styleId = "encre-seche"): Composition {
  const objet = objetById(objetId);
  const arc = archetypeId ?? objet.archetype;
  return {
    id: newId(),
    nom: objet.nom,
    objetId: objet.id,
    supportId: objet.support,
    styleId,
    archetypeId: arc,
    nodes: buildNodes(objet.id, arc),
    fondPerdu: false,
    reperes: false,
    grille: true,
  };
}

/** Matières brutes insérables à la main dans une composition. */
export const MATIERES: { id: string; nom: string; role: Role; icon: string; desc: string }[] = [
  { id: "m-texte", nom: "Texte", role: "corps", icon: "Type", desc: "Bloc de texte courant" },
  { id: "m-titre", nom: "Titre", role: "titre", icon: "Heading", desc: "Niveau typographique haut" },
  { id: "m-photo", nom: "Photographie", role: "media", icon: "Image", desc: "Matière photographique" },
  { id: "m-forme", nom: "Forme", role: "forme", icon: "Square", desc: "Aplat, cadre ou pastille" },
  { id: "m-filet", nom: "Filet", role: "filet", icon: "Minus", desc: "Séparateur linéaire" },
  { id: "m-symbole", nom: "Symbole", role: "symbole", icon: "Asterisk", desc: "Signe graphique" },
  { id: "m-donnee", nom: "Donnée", role: "meta", icon: "Table", desc: "Paires clé / valeur" },
  { id: "m-nombre", nom: "Nombre", role: "numero", icon: "Hash", desc: "Numérotation ou prix" },
  { id: "m-code", nom: "Code", role: "code", icon: "QrCode", desc: "Code de vérification" },
  { id: "m-sceau", nom: "Sceau", role: "sceau", icon: "BadgeCheck", desc: "Marque d'authenticité" },
];

export function nodeFromMatiere(id: string): AimeNode {
  const m = MATIERES.find((x) => x.id === id) ?? MATIERES[0];
  const sizes: Record<string, { w: number; h: number }> = {
    media: { w: 5, h: 4 },
    forme: { w: 4, h: 2.4 },
    filet: { w: 6, h: 0.08 },
    code: { w: 1.8, h: 1.4 },
    sceau: { w: 2, h: 1.6 },
    numero: { w: 4, h: 2.4 },
    meta: { w: 5, h: 2.4 },
    titre: { w: 8, h: 2.2 },
    corps: { w: 7, h: 2.4 },
    symbole: { w: 1.6, h: 1.3 },
  };
  const dim = sizes[m.role] ?? { w: 6, h: 2 };
  const defaults = roleDefaults(m.role);
  const samples: Record<string, string> = {
    corps: "Texte à composer. Double-cliquez pour éditer, ou utilisez l'inspecteur.",
    titre: "Nouveau titre",
    numero: "01",
    code: "aime://objet/nouveau",
    sceau: "AIME",
    symbole: "✻",
  };
  return {
    ...base,
    ...defaults,
    id: newId(),
    nom: m.nom,
    famille: "libre",
    role: m.role,
    kind: ROLE_KIND[m.role],
    x: 2,
    y: 2,
    w: dim.w,
    h: dim.h,
    text: samples[m.role] ?? "",
    rows: m.role === "meta" ? [{ k: "Clé", v: "Valeur" }, { k: "Clé", v: "Valeur" }] : undefined,
    src: m.role === "media" ? "/img/m2.jpg" : undefined,
  } as AimeNode;
}

export function interpolate(text: string, vars: { cle: string; valeur: string }[]) {
  return text.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (_, k) => {
    const v = vars.find((x) => x.cle === k);
    return v ? v.valeur : `{{${k}}}`;
  });
}

export function variablesUtilisees(text: string): string[] {
  return Array.from(text.matchAll(/\{\{\s*([\w-]+)\s*\}\}/g)).map((m) => m[1]);
}
