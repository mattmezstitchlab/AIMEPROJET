import type {
  AimeNode,
  Archetype,
  Bloc,
  Composition,
  Fragment,
  FragmentType,
  ModeComposition,
  ModeRecuperation,
  Role,
  SourceDoc,
} from "./types";
import { ARCHETYPES, archetypeById } from "./archetypes";
import { makeNode, newId } from "./build";

export const fragId = () => "FRG-" + Math.random().toString(36).slice(2, 7).toUpperCase();

export const TYPE_LABEL: Record<FragmentType, string> = {
  texte: "Texte",
  image: "Image",
  forme: "Forme",
  document: "Document",
  tableau: "Tableau",
  donnee: "Donnée",
  lien: "Lien",
  media: "Média",
  objet: "Objet typé",
  action: "Action",
  besoin: "Besoin",
};

export const MODE_RECUP: { id: ModeRecuperation; nom: string; desc: string }[] = [
  { id: "visuel", nom: "Visuel", desc: "Conserve le cadrage, la forme et les proportions de la zone." },
  { id: "semantique", nom: "Sémantique", desc: "Récupère les informations structurées : titres, textes, tableaux, liens." },
  { id: "mixte", nom: "Mixte", desc: "Associe la représentation visuelle aux informations structurées." },
];

export const MODES_COMPOSITION: {
  id: ModeComposition;
  nom: string;
  principe: string;
  groupes: string[];
}[] = [
  {
    id: "regulier",
    nom: "Régulier",
    principe: "Alignement, grille, colonnes, tableaux, cartes et structures ordonnées.",
    groupes: ["Trame", "Partition"],
  },
  {
    id: "editorial",
    nom: "Éditorial",
    principe: "Hiérarchies typographiques, compositions asymétriques, pages narratives.",
    groupes: ["Flux", "Axe", "Cadre"],
  },
  {
    id: "immersif",
    nom: "Immersif",
    principe: "Superposition, profondeur et interactions spatiales légères.",
    groupes: ["Rupture", "Cadre"],
  },
];

/* —————— Blocs → Fragment —————— */

function typeDepuisBlocs(blocs: Bloc[]): FragmentType {
  if (!blocs.length) return "besoin";
  if (blocs.every((b) => b.type === "image")) return "image";
  if (blocs.some((b) => b.type === "tableau")) return "tableau";
  if (blocs.length === 1 && blocs[0].type === "lien") return "lien";
  if (blocs.some((b) => b.type === "image")) return "media";
  return "texte";
}

function rolesPossibles(type: FragmentType, blocs: Bloc[]): Role[] {
  switch (type) {
    case "image":
    case "media":
      return ["media"];
    case "tableau":
    case "donnee":
      return ["meta"];
    case "lien":
      return ["code", "meta", "soustitre"];
    default: {
      const long = blocs.reduce((a, b) => a + (b.texte?.length ?? 0), 0);
      if (long < 42) return ["titre", "surtitre", "soustitre", "corps"];
      if (long < 140) return ["soustitre", "corps", "titre"];
      return ["corps", "soustitre"];
    }
  }
}

export function fragmentDepuisBlocs(
  source: SourceDoc,
  blocs: Bloc[],
  mode: ModeRecuperation,
  nom?: string,
  zone?: { x: number; y: number; w: number; h: number },
): Fragment {
  const type = typeDepuisBlocs(blocs);
  const image = blocs.find((b) => b.type === "image");
  const tableau = blocs.find((b) => b.type === "tableau");
  const lien = blocs.find((b) => b.type === "lien");
  const textes = blocs
    .filter((b) => b.type !== "image" && b.type !== "tableau")
    .map((b) => (b.items?.length ? b.items.map((i) => `· ${i}`).join("\n") : (b.texte ?? "")))
    .filter(Boolean)
    .join("\n\n");
  const date = new Date().toISOString();
  const titre = blocs.find((b) => b.type === "titre")?.texte;

  return {
    id: fragId(),
    nom: nom?.trim() || titre || blocs[0]?.texte?.slice(0, 40) || `Fragment ${TYPE_LABEL[type]}`,
    type,
    mode,
    contenu: {
      texte: mode === "visuel" ? (titre ?? textes.slice(0, 120)) : textes,
      rows: tableau?.rows,
      src: image?.src,
      href: lien?.href,
      blocs: blocs.map((b) => ({ ...b })),
    },
    sourceId: source.id,
    provenance: { url: source.url, sourceNom: source.nom, blocIds: blocs.map((b) => b.id), zone },
    cree: date,
    modifie: date,
    apparence: { accent: "ink", corps: 2.1, casse: "normale" },
    contraintes: { minW: type === "image" ? 3 : 2, minH: type === "image" ? 2 : 0.8, roles: rolesPossibles(type, blocs) },
    relations: [],
    historique: [{ date, action: `Créé depuis « ${source.nom} » · récupération ${mode}` }],
    usages: [],
  };
}

export function fragmentVierge(type: FragmentType, nom: string, texte = ""): Fragment {
  const date = new Date().toISOString();
  return {
    id: fragId(),
    nom,
    type,
    mode: "semantique",
    contenu: { texte, blocs: [{ id: "b0", type: "texte", texte }] },
    sourceId: null,
    provenance: { blocIds: [] },
    cree: date,
    modifie: date,
    apparence: { accent: "ink", corps: 2.1, casse: "normale" },
    contraintes: { minW: 2, minH: 0.8, roles: rolesPossibles(type, []) },
    relations: [],
    historique: [{ date, action: "Créé à la main dans le projet" }],
    usages: [],
  };
}

/* —————— Fragments → Composition —————— */

function score(role: Role, f: Fragment): number {
  const i = f.contraintes.roles.indexOf(role);
  if (i >= 0) return 10 - i;
  if ((role === "corps" || role === "soustitre") && (f.type === "texte" || f.type === "document")) return 3;
  if (role === "media" && (f.type === "image" || f.type === "media")) return 8;
  if (role === "meta" && (f.type === "tableau" || f.type === "donnee")) return 8;
  return 0;
}

function contenuPour(role: Role, f: Fragment) {
  if (role === "media") return { nom: f.nom, src: f.contenu.src ?? "/img/m2.jpg", fragId: f.id };
  if (role === "meta")
    return {
      nom: f.nom,
      rows:
        f.contenu.rows ??
        (f.contenu.texte ?? "")
          .split("\n")
          .filter(Boolean)
          .slice(0, 6)
          .map((l) => ({ k: f.nom, v: l.replace(/^·\s*/, "") })),
      fragId: f.id,
    };
  if (role === "code") return { nom: f.nom, text: f.contenu.href ?? f.provenance.url ?? `aime://fragment/${f.id}`, fragId: f.id };
  const t = f.contenu.texte ?? f.nom;
  const court = role === "titre" || role === "surtitre" || role === "soustitre";
  return { nom: f.nom, text: court ? t.split("\n")[0].slice(0, 120) : t, fragId: f.id };
}

export function couverture(arc: Archetype, frs: Fragment[]): number {
  const reste = [...frs];
  let n = 0;
  for (const s of arc.slots) {
    if (s.role === "forme" || s.role === "filet") continue;
    let best = -1;
    let bs = 0;
    reste.forEach((f, i) => {
      const sc = score(s.role, f);
      if (sc > bs) {
        bs = sc;
        best = i;
      }
    });
    if (best >= 0) {
      reste.splice(best, 1);
      n++;
    }
  }
  return frs.length ? n / frs.length - reste.length * 0.08 : 0;
}

export function archetypesCompatibles(mode: ModeComposition, frs: Fragment[]): Archetype[] {
  const m = MODES_COMPOSITION.find((x) => x.id === mode)!;
  return ARCHETYPES.filter((a) => m.groupes.includes(a.groupe))
    .map((a) => ({ a, s: couverture(a, frs) }))
    .sort((x, y) => y.s - x.s)
    .map((x) => x.a);
}

/** Transformation non destructive : les fragments ne sont jamais modifiés. */
export function nodesDepuisFragments(frs: Fragment[], archetypeId: string): AimeNode[] {
  const arc = archetypeById(archetypeId);
  const reste = [...frs];
  const nodes: AimeNode[] = [];

  for (const slot of arc.slots) {
    if (slot.role === "forme" || slot.role === "filet") {
      nodes.push(makeNode(slot, {}));
      continue;
    }
    let best = -1;
    let bs = 0;
    reste.forEach((f, i) => {
      const sc = score(slot.role, f);
      if (sc > bs) {
        bs = sc;
        best = i;
      }
    });
    if (best < 0) continue;
    const f = reste.splice(best, 1)[0];
    nodes.push(makeNode(slot, contenuPour(slot.role, f)));
  }

  // Fragments non placés : empilés en pied de grille, rien n'est perdu.
  let y = Math.min(
    14.6,
    nodes.reduce((m, n) => Math.max(m, n.y + n.h), 0) + 0.4,
  );
  for (const f of reste) {
    const role: Role = f.type === "image" || f.type === "media" ? "media" : f.type === "tableau" ? "meta" : "corps";
    const h = role === "media" ? 3 : 1.6;
    nodes.push(makeNode({ role, x: 0.8, y, w: 10.4, h, align: "left" }, contenuPour(role, f)));
    y += h + 0.3;
  }
  return nodes;
}

export function compositionDepuisFragments(
  frs: Fragment[],
  mode: ModeComposition,
  supportId: string,
  styleId: string,
  archetypeId?: string,
  nom?: string,
): Composition {
  const arc = archetypeId ?? archetypesCompatibles(mode, frs)[0]?.id ?? "D1";
  return {
    id: newId(),
    nom: nom ?? `Composition · ${frs.length} fragments`,
    objetId: "o-faire-part",
    supportId,
    styleId,
    archetypeId: arc,
    nodes: nodesDepuisFragments(frs, arc),
    fondPerdu: false,
    reperes: false,
    grille: true,
    origine: { fragmentIds: frs.map((f) => f.id), mode },
  };
}

/* —————— Collection CORRESPONDANCES : objets composés de fragments —————— */

export const CORRESPONDANCES: {
  id: string;
  nom: string;
  support: string;
  archetype: string;
  interaction: "flip" | "ouvrir" | "detacher" | "appliquer" | "aucune";
  resume: string;
}[] = [
  { id: "co-carte", nom: "Carte", support: "carte-a6", archetype: "A1", interaction: "flip", resume: "Recto-verso retournable" },
  { id: "co-enveloppe", nom: "Enveloppe", support: "enveloppe", archetype: "C1", interaction: "ouvrir", resume: "Rabat ouvrable" },
  { id: "co-timbre", nom: "Timbre décoratif", support: "timbre", archetype: "C2", interaction: "aucune", resume: "Vignette dentée" },
  { id: "co-tampon", nom: "Tampon", support: "tampon", archetype: "A1", interaction: "appliquer", resume: "Marque apposée" },
  { id: "co-ticket", nom: "Ticket", support: "billet", archetype: "B2", interaction: "detacher", resume: "Souche détachable" },
  { id: "co-sticker", nom: "Sticker", support: "sticker", archetype: "C2", interaction: "flip", resume: "Pastille autocollante" },
];
