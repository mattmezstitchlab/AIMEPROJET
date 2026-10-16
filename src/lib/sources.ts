import type { Bloc, SourceDoc } from "./types";

let n = 0;
const bid = () => `b${Date.now().toString(36)}${(n++).toString(36)}`;
export const srcId = () => "SRC-" + Math.random().toString(36).slice(2, 7).toUpperCase();

/* —————— Contrôle d'adresse : pas d'accès aux réseaux internes —————— */

const HOTES_INTERDITS =
  /^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?)/i;

export function validerURL(brut: string): { ok: true; url: string } | { ok: false; raison: string } {
  let u: URL;
  try {
    u = new URL(brut.trim().match(/^https?:\/\//i) ? brut.trim() : `https://${brut.trim()}`);
  } catch {
    return { ok: false, raison: "Adresse illisible. Attendu : https://exemple.org/page" };
  }
  if (!/^https?:$/.test(u.protocol)) return { ok: false, raison: "Seuls les protocoles http et https sont acceptés." };
  if (HOTES_INTERDITS.test(u.hostname) || u.hostname.endsWith(".local") || !u.hostname.includes("."))
    return { ok: false, raison: "Adresse interne ou non publique — accès refusé par sécurité." };
  return { ok: true, url: u.toString() };
}

/* —————— Extraction —————— */

const propre = (s: string) => s.replace(/\s+/g, " ").trim();

export function blocsDepuisTexte(texte: string): Bloc[] {
  return texte
    .split(/\n{2,}/)
    .map((p) => propre(p))
    .filter((p) => p.length > 1)
    .map((p) => {
      const h = p.match(/^(#{1,4})\s+(.*)$/);
      if (h) return { id: bid(), type: "titre", texte: propre(h[2]), niveau: h[1].length } as Bloc;
      if (p.length < 70 && !/[.!?;]$/.test(p)) return { id: bid(), type: "titre", texte: p, niveau: 3 } as Bloc;
      return { id: bid(), type: "texte", texte: p } as Bloc;
    });
}

export function blocsDepuisMarkdown(md: string, base?: string): Bloc[] {
  const blocs: Bloc[] = [];
  const lignes = md.split(/\r?\n/);
  let para: string[] = [];
  const videPara = () => {
    const t = propre(para.join(" "));
    para = [];
    if (t.length > 2) blocs.push({ id: bid(), type: "texte", texte: t });
  };
  const abs = (u: string) => {
    try {
      return base ? new URL(u, base).toString() : u;
    } catch {
      return u;
    }
  };

  for (let i = 0; i < lignes.length; i++) {
    const l = lignes[i];
    const t = l.trim();
    if (!t) {
      videPara();
      continue;
    }
    const h = t.match(/^(#{1,6})\s+(.+)$/);
    if (h) {
      videPara();
      blocs.push({ id: bid(), type: "titre", texte: propre(h[2].replace(/[*_`]/g, "")), niveau: h[1].length });
      continue;
    }
    const img = t.match(/^!\[([^\]]*)\]\(([^)\s]+)/);
    if (img) {
      videPara();
      blocs.push({ id: bid(), type: "image", texte: propre(img[1]) || "Image", src: abs(img[2]) });
      continue;
    }
    if (/^\|.*\|$/.test(t) && /\|/.test(lignes[i + 1] ?? "")) {
      videPara();
      const rows: { k: string; v: string }[] = [];
      while (i < lignes.length && /^\|/.test(lignes[i].trim())) {
        const cols = lignes[i]
          .trim()
          .split("|")
          .slice(1, -1)
          .map((c) => propre(c));
        if (cols.length && !/^-+$/.test(cols[0].replace(/[\s:]/g, "")))
          rows.push({ k: cols[0] ?? "", v: cols.slice(1).join(" · ") });
        i++;
      }
      if (rows.length) blocs.push({ id: bid(), type: "tableau", texte: "Tableau", rows });
      continue;
    }
    const li = t.match(/^[-*+]\s+(.+)$/);
    if (li) {
      videPara();
      const items: string[] = [];
      while (i < lignes.length && /^[-*+]\s+/.test(lignes[i].trim())) {
        items.push(propre(lignes[i].trim().replace(/^[-*+]\s+/, "").replace(/[*_`]/g, "")));
        i++;
      }
      i--;
      blocs.push({ id: bid(), type: "liste", texte: items[0] ?? "Liste", items });
      continue;
    }
    const lien = t.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (lien) {
      videPara();
      blocs.push({ id: bid(), type: "lien", texte: propre(lien[1]), href: abs(lien[2]) });
      continue;
    }
    para.push(t.replace(/[*_`>]/g, ""));
  }
  videPara();
  return blocs.filter((b) => (b.texte ?? "").length > 1 || b.src);
}

export function blocsDepuisHTML(html: string, base?: string): Bloc[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script,style,noscript,svg,iframe,nav,footer,header").forEach((e) => e.remove());
  const racine = doc.querySelector("article, main, [role=main]") ?? doc.body;
  const blocs: Bloc[] = [];
  const abs = (u: string) => {
    try {
      return base ? new URL(u, base).toString() : u;
    } catch {
      return u;
    }
  };
  racine.querySelectorAll("h1,h2,h3,h4,p,li,img,table,blockquote").forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (tag === "img") {
      const src = (el as HTMLImageElement).getAttribute("src");
      if (src && !src.startsWith("data:"))
        blocs.push({ id: bid(), type: "image", texte: el.getAttribute("alt") || "Image", src: abs(src) });
      return;
    }
    if (tag === "table") {
      const rows: { k: string; v: string }[] = [];
      el.querySelectorAll("tr").forEach((tr) => {
        const cells = Array.from(tr.querySelectorAll("th,td")).map((c) => propre(c.textContent ?? ""));
        if (cells.length) rows.push({ k: cells[0], v: cells.slice(1).join(" · ") });
      });
      if (rows.length) blocs.push({ id: bid(), type: "tableau", texte: "Tableau", rows });
      return;
    }
    const texte = propre(el.textContent ?? "");
    if (texte.length < 2) return;
    if (/^h[1-4]$/.test(tag)) blocs.push({ id: bid(), type: "titre", texte, niveau: Number(tag[1]) });
    else if (tag === "li") blocs.push({ id: bid(), type: "liste", texte, items: [texte] });
    else blocs.push({ id: bid(), type: "texte", texte });
  });
  const vus = new Set<string>();
  return blocs.filter((b) => {
    const k = `${b.type}:${b.texte}:${b.src ?? ""}`;
    if (vus.has(k)) return false;
    vus.add(k);
    return true;
  });
}

/* —————— Import d'URL —————— */

async function recuperer(url: string, timeout = 14000): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await fetch(url, { signal: ctrl.signal, redirect: "follow" });
    if (!r.ok) throw new Error(String(r.status));
    return await r.text();
  } finally {
    clearTimeout(t);
  }
}

/**
 * Import réel d'une page publique. Deux passerelles de lecture publiques sont
 * tentées ; en cas de refus (CORS, robots, authentification), la source est
 * marquée « bloquée » et l'import manuel est proposé. Aucun contournement.
 */
export async function importerURL(brut: string): Promise<SourceDoc> {
  const v = validerURL(brut);
  const faite = new Date().toISOString();
  if (!v.ok)
    return { id: srcId(), nom: brut.slice(0, 60), origine: "url", recupere: faite, statut: "bloque", note: v.raison, blocs: [] };

  const url = v.url;
  const hote = new URL(url).hostname.replace(/^www\./, "");

  const passerelles: { nom: string; url: string; type: "md" | "html" }[] = [
    { nom: "lecteur", url: `https://r.jina.ai/${url}`, type: "md" },
    { nom: "relais", url: `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, type: "html" },
  ];

  for (const p of passerelles) {
    try {
      const brutTexte = await recuperer(p.url);
      const blocs = p.type === "md" ? blocsDepuisMarkdown(brutTexte, url) : blocsDepuisHTML(brutTexte, url);
      if (blocs.length >= 3) {
        return {
          id: srcId(),
          nom: hote,
          origine: "url",
          url,
          recupere: faite,
          statut: blocs.length < 8 ? "partiel" : "ok",
          note: `Contenus récupérés via la passerelle de lecture publique (${p.nom}). Provenance conservée.`,
          blocs,
        };
      }
    } catch {
      /* passerelle suivante */
    }
  }

  return {
    id: srcId(),
    nom: hote,
    origine: "url",
    url,
    recupere: faite,
    statut: "bloque",
    note: "Ce site refuse l'extraction automatisée (CORS, robots ou authentification). Importez un document, un texte ou une image autorisée — le parcours reste identique.",
    blocs: [],
  };
}

export async function importerFichier(file: File): Promise<SourceDoc> {
  const faite = new Date().toISOString();
  const commun = { id: srcId(), nom: file.name, origine: "fichier" as const, recupere: faite };

  if (file.type.startsWith("image/")) {
    const src = await new Promise<string>((res) => {
      const fr = new FileReader();
      fr.onload = () => res(String(fr.result));
      fr.readAsDataURL(file);
    });
    return {
      ...commun,
      statut: "ok",
      note: "Image importée. Récupération visuelle uniquement : aucun texte n'en est extrait, elle n'est donc pas présentée comme éditable.",
      blocs: [{ id: bid(), type: "image", texte: file.name, src }],
    };
  }

  if (/\.(txt|md|csv|json|html?)$/i.test(file.name) || file.type.startsWith("text/")) {
    const texte = await file.text();
    if (/\.html?$/i.test(file.name)) return { ...commun, statut: "ok", blocs: blocsDepuisHTML(texte) };
    if (/\.csv$/i.test(file.name)) {
      const lignes = texte.split(/\r?\n/).filter(Boolean).slice(0, 40);
      const rows = lignes.map((l) => {
        const c = l.split(/[;,\t]/);
        return { k: propre(c[0] ?? ""), v: c.slice(1).map(propre).join(" · ") };
      });
      return { ...commun, statut: "ok", blocs: [{ id: bid(), type: "tableau", texte: file.name, rows }] };
    }
    return { ...commun, statut: "ok", blocs: blocsDepuisMarkdown(texte) };
  }

  return {
    ...commun,
    statut: "bloque",
    note: `Format « ${file.type || "inconnu"} » non lisible côté navigateur (PDF natif compris). Exportez-le en texte, HTML ou image, puis réimportez.`,
    blocs: [],
  };
}

export function sourceDepuisTexte(nom: string, texte: string): SourceDoc {
  return {
    id: srcId(),
    nom: nom || "Texte collé",
    origine: "texte",
    recupere: new Date().toISOString(),
    statut: "ok",
    blocs: blocsDepuisMarkdown(texte),
  };
}

/* —————— Sources de démonstration locales (contenus originaux) —————— */

const demo = (b: Omit<Bloc, "id">): Bloc => ({ id: bid(), ...b });

export const SOURCES_DEMO: SourceDoc[] = [
  {
    id: "SRC-DEMO-FORMATION",
    nom: "Page de formation · démonstration locale",
    origine: "demo",
    recupere: new Date().toISOString(),
    statut: "ok",
    note: "Page locale originale — sert de source de repli lorsqu'un site tiers refuse l'extraction.",
    blocs: [
      demo({ type: "titre", texte: "Composer avec des fragments", niveau: 1 }),
      demo({ type: "texte", texte: "Formation courte en six séances, destinée aux personnes qui produisent des documents, des supports imprimés et des pages web à partir des mêmes informations." }),
      demo({ type: "titre", texte: "Ce que vous saurez faire", niveau: 2 }),
      demo({
        type: "liste",
        texte: "Acquis de la formation",
        items: [
          "Isoler une information utile dans une source existante",
          "La structurer en fragment réutilisable",
          "La composer sur une grille",
          "La livrer sur plusieurs supports sans la ressaisir",
        ],
      }),
      demo({ type: "image", texte: "Matière papier en lumière rasante", src: "/img/m2.jpg" }),
      demo({
        type: "tableau",
        texte: "Informations pratiques",
        rows: [
          { k: "Durée", v: "6 séances de 3 heures" },
          { k: "Format", v: "Atelier, douze personnes" },
          { k: "Lieu", v: "Uzès · Domaine des Oliviers" },
          { k: "Tarif", v: "840 € net de taxe" },
        ],
      }),
      demo({ type: "titre", texte: "Séance 3 — La grille comme mémoire", niveau: 2 }),
      demo({ type: "texte", texte: "La grille n'impose pas une forme : elle conserve des décisions prises une fois, pour que l'attention se porte ailleurs. On y range des fragments, on en change l'ordre, on en change le support." }),
      demo({ type: "lien", texte: "S'inscrire à la prochaine session", href: "https://exemple.org/inscription" }),
    ],
  },
  {
    id: "SRC-DEMO-EVENEMENT",
    nom: "Fiche événement · démonstration locale",
    origine: "demo",
    recupere: new Date().toISOString(),
    statut: "ok",
    blocs: [
      demo({ type: "titre", texte: "Nuit MÉTAMORPHOSE", niveau: 1 }),
      demo({ type: "texte", texte: "Une traverse de la matière à la livraison : démonstrations, ateliers d'impression et plateau musical jusqu'au petit matin." }),
      demo({
        type: "tableau",
        texte: "Déroulé",
        rows: [
          { k: "18 h 00", v: "Ouverture des portes" },
          { k: "19 h 00", v: "Atelier fragments" },
          { k: "20 h 30", v: "Plateau principal" },
          { k: "23 h 00", v: "Bal" },
        ],
      }),
      demo({ type: "image", texte: "Scène et public", src: "/img/m4.jpg" }),
      demo({ type: "texte", texte: "Billet nominatif, non remboursable. Présentez le code à l'entrée Nord." }),
      demo({ type: "lien", texte: "Billetterie", href: "https://exemple.org/billets" }),
    ],
  },
  {
    id: "SRC-DEMO-MARIAGE",
    nom: "Notes de projet · démonstration locale",
    origine: "demo",
    recupere: new Date().toISOString(),
    statut: "ok",
    blocs: [
      demo({ type: "titre", texte: "Camille & Noé", niveau: 1 }),
      demo({ type: "titre", texte: "13 juin 2026 · Domaine des Oliviers", niveau: 3 }),
      demo({ type: "texte", texte: "La cérémonie sera célébrée à 16 h 30 dans le jardin haut, suivie du dîner sous la halle et du bal." }),
      demo({ type: "image", texte: "Branche sèche sur fond beige", src: "/img/m3.jpg" }),
      demo({
        type: "tableau",
        texte: "Repères",
        rows: [
          { k: "Vestiaire", v: "Niveau 0, à gauche" },
          { k: "Cérémonie", v: "Jardin haut" },
          { k: "Réponse avant", v: "1er mai 2026" },
        ],
      }),
    ],
  },
];
