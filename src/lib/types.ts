export type Token = "ink" | "accent" | "alt" | "paper" | "muted" | "none";

export type Kind =
  | "titre"
  | "texte"
  | "filet"
  | "forme"
  | "image"
  | "symbole"
  | "code"
  | "table"
  | "sceau"
  | "numero";

export type Role =
  | "surtitre"
  | "titre"
  | "soustitre"
  | "corps"
  | "meta"
  | "media"
  | "code"
  | "sceau"
  | "numero"
  | "filet"
  | "forme"
  | "symbole";

export interface AimeNode {
  id: string;
  nom: string;
  famille: string;
  role: Role;
  kind: Kind;
  /** position sur la Grille Universelle : 12 colonnes × 16 lignes */
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  text: string;
  align: "left" | "center" | "right";
  font: "display" | "body" | "mono";
  size: number;
  weight: number;
  tracking: number;
  leading: number;
  casse: "normale" | "capitales" | "bas-de-casse";
  italique: boolean;
  ink: Token;
  fill: Token;
  stroke: Token;
  strokeW: number;
  radius: number;
  opacity: number;
  src?: string;
  icon?: string;
  shape?: "rect" | "ellipse";
  rows?: { k: string; v: string }[];
  lien?: string;
  /** fragment d'origine (MÉTAMORPHOSE) — permet de remonter à la source */
  fragId?: string;
  locked: boolean;
  exportable: boolean;
  etat: "brouillon" | "validé" | "livré";
}

export interface Support {
  id: string;
  nom: string;
  w: number;
  h: number;
  cat: string;
  unite: "mm" | "px";
}

export interface AimeStyle {
  id: string;
  code: string;
  nom: string;
  principe: string;
  usage: string;
  fonts: { display: string; body: string; mono: string };
  palette: { paper: string; ink: string; accent: string; alt: string; muted: string };
  radius: number;
  rule: number;
  tracking: number;
  majTitre: boolean;
  texture: "aucune" | "grain" | "lignes" | "points" | "degrade" | "halo";
}

export interface Slot {
  role: Role;
  x: number;
  y: number;
  w: number;
  h: number;
  align?: "left" | "center" | "right";
  size?: number;
  opts?: Partial<AimeNode>;
}

export interface Archetype {
  id: string;
  groupe: string;
  code: string;
  nom: string;
  principe: string;
  slots: Slot[];
}

export interface ObjetType {
  id: string;
  famille: string;
  nom: string;
  support: string;
  resume: string;
  archetype: string;
  contenu: {
    surtitre?: string;
    titre?: string;
    soustitre?: string;
    corps?: string;
    meta?: { k: string; v: string }[];
    media?: string;
    code?: string;
    sceau?: string;
    numero?: string;
  };
}

export interface Composition {
  id: string;
  nom: string;
  objetId: string;
  supportId: string;
  styleId: string;
  archetypeId: string;
  nodes: AimeNode[];
  fondPerdu: boolean;
  reperes: boolean;
  grille: boolean;
  /** composition issue de fragments (MÉTAMORPHOSE) */
  origine?: { fragmentIds: string[]; mode: ModeComposition };
}

/* ———————————————————————————————————————————————
   MÉTAMORPHOSE — Source → Sélection → Fragment
   ——————————————————————————————————————————————— */

export type ModeComposition = "regulier" | "editorial" | "immersif";

export type ModeRecuperation = "visuel" | "semantique" | "mixte";

export type BlocType = "titre" | "texte" | "image" | "tableau" | "lien" | "liste" | "donnee";

export interface Bloc {
  id: string;
  type: BlocType;
  texte?: string;
  niveau?: number;
  src?: string;
  href?: string;
  rows?: { k: string; v: string }[];
  items?: string[];
}

export interface SourceDoc {
  id: string;
  nom: string;
  origine: "url" | "texte" | "fichier" | "demo" | "aime";
  url?: string;
  recupere: string;
  statut: "ok" | "partiel" | "bloque";
  note?: string;
  blocs: Bloc[];
}

export type FragmentType =
  | "texte"
  | "image"
  | "forme"
  | "document"
  | "tableau"
  | "donnee"
  | "lien"
  | "media"
  | "objet"
  | "action"
  | "besoin";

export interface Fragment {
  id: string;
  nom: string;
  type: FragmentType;
  mode: ModeRecuperation;
  contenu: { texte?: string; rows?: { k: string; v: string }[]; src?: string; href?: string; blocs: Bloc[] };
  sourceId: string | null;
  provenance: { url?: string; sourceNom?: string; blocIds: string[]; zone?: { x: number; y: number; w: number; h: number } };
  cree: string;
  modifie: string;
  apparence: { accent: Token; corps: number; casse: AimeNode["casse"] };
  contraintes: { minW: number; minH: number; roles: Role[] };
  relations: string[];
  historique: { date: string; action: string }[];
  usages: string[];
}

export interface Projet {
  nom: string;
  variables: { cle: string; valeur: string; note: string }[];
  compositions: Composition[];
  actifId: string;
  journal: string[];
  validation: Record<string, boolean>;
  sources: SourceDoc[];
  fragments: Fragment[];
}
