import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type {
  AimeNode,
  Composition,
  Fragment,
  ModeComposition,
  Projet,
  SourceDoc,
} from "./types";
import { buildComposition, buildNodes, newId } from "./build";
import { compositionDepuisFragments, nodesDepuisFragments } from "./fragments";
import { SOURCES_DEMO } from "./sources";
import { styleById } from "./styles";
import { supportById } from "./supports";
import { objetById } from "./objects";

const KEY = "aime.projet.v1";

export const VALIDATION_LABELS: { id: string; label: string }[] = [
  { id: "inserer", label: "Insérer un objet ou une matière dans une composition" },
  { id: "modifier", label: "Modifier les propriétés d'un objet" },
  { id: "composer", label: "Composer : déplacer / redimensionner sur la Grille Universelle" },
  { id: "archetype", label: "Appliquer un archétype de la bibliothèque MÉTAMORPHOSE" },
  { id: "styliser", label: "Appliquer une direction artistique universelle" },
  { id: "support", label: "Changer de support sans perdre la composition" },
  { id: "relier", label: "Relier un objet à une variable partagée de projet" },
  { id: "exporter", label: "Exporter / livrer l'objet (image, données, impression, web)" },
  { id: "source", label: "Importer une source (URL, fichier, texte ou page locale)" },
  { id: "fragment", label: "Sélectionner une zone et la transformer en fragment" },
  { id: "metamorphose", label: "Composer des fragments et changer de mode sans perte" },
];

function projetInitial(): Projet {
  const c1 = buildComposition("o-faire-part", "A1", "encre-seche");
  const c2 = buildComposition("o-menu", "A1", "herbier");
  const c3 = buildComposition("o-billet", "B2", "bauhaus-tropique");
  return {
    nom: "Mariage — Camille & Noé",
    variables: [
      { cle: "couple", valeur: "Camille & Noé", note: "Alimente faire-part, menu, panneau" },
      { cle: "initiales", valeur: "C·N", note: "Monogramme et sceaux" },
      { cle: "date", valeur: "13 juin 2026", note: "Tous les objets datés" },
      { cle: "heure", valeur: "16 h 30", note: "Cérémonie" },
      { cle: "lieu", valeur: "Domaine des Oliviers", note: "Lieu principal" },
      { cle: "ville", valeur: "Uzès", note: "Localisation" },
      { cle: "invite", valeur: "Jeanne Marchand", note: "Variable de publipostage" },
      { cle: "table", valeur: "04 — Vignes", note: "Marque-place, étiquette" },
      { cle: "menu", valeur: "Sans viande", note: "Préférence alimentaire" },
      { cle: "rsvp", valeur: "1er mai 2026", note: "Date limite de réponse" },
      { cle: "evenement", valeur: "Nuit MÉTAMORPHOSE", note: "Objets événementiels" },
      { cle: "organisation", valeur: "Atelier AIME", note: "Émetteur" },
      { cle: "expediteur", valeur: "Camille Roux", note: "Signataire" },
      { cle: "destinataire", valeur: "Maison Verdier", note: "Client / invité" },
      { cle: "annee", valeur: "2026", note: "Millesime" },
      { cle: "hashtag", valeur: "#metamorphose", note: "Diffusion numérique" },
    ],
    compositions: [c1, c2, c3],
    actifId: c1.id,
    journal: ["Projet initialisé · 3 compositions, 16 variables partagées"],
    validation: {},
    sources: SOURCES_DEMO,
    fragments: [],
  };
}

/** Migration douce : les projets déjà enregistrés localement restent valides. */
function normaliser(p: Projet): Projet {
  return {
    ...p,
    sources: p.sources?.length ? p.sources : SOURCES_DEMO,
    fragments: p.fragments ?? [],
    journal: p.journal ?? [],
    validation: p.validation ?? {},
  };
}

interface Ctx {
  projet: Projet;
  comp: Composition;
  style: ReturnType<typeof styleById>;
  support: ReturnType<typeof supportById>;
  selId: string | null;
  sel: AimeNode | null;
  setSelId: (id: string | null) => void;
  update: (id: string, patch: Partial<AimeNode>) => void;
  addNode: (n: AimeNode) => void;
  removeNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  reorder: (id: string, dir: 1 | -1) => void;
  patchComp: (patch: Partial<Composition>) => void;
  appliquerArchetype: (id: string) => void;
  chargerObjet: (objetId: string, archetypeId?: string) => void;
  nouvelleComposition: (objetId: string) => void;
  supprimerComposition: (id: string) => void;
  setActif: (id: string) => void;
  setVar: (cle: string, valeur: string) => void;
  ajouterVar: (cle: string, valeur: string) => void;
  supprimerVar: (cle: string) => void;
  mark: (flag: string, message?: string) => void;
  reset: () => void;
  // —— MÉTAMORPHOSE ——
  ajouterSource: (s: SourceDoc) => void;
  supprimerSource: (id: string) => void;
  ajouterFragment: (f: Fragment) => void;
  majFragment: (id: string, patch: Partial<Fragment>, action?: string) => void;
  supprimerFragment: (id: string) => void;
  composerFragments: (ids: string[], mode: ModeComposition, archetypeId?: string) => void;
  recomposer: (mode: ModeComposition, archetypeId?: string) => void;
  annuler: () => void;
  peutAnnuler: boolean;
  remplacerProjet: (p: Projet) => void;
}

const AimeCtx = createContext<Ctx | null>(null);

export function AimeProvider({ children }: { children: ReactNode }) {
  const [projet, setProjet] = useState<Projet>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw) as Projet;
        if (p.compositions?.length) return normaliser(p);
      }
    } catch {
      /* ignore */
    }
    return projetInitial();
  });
  const [selId, setSelId] = useState<string | null>(null);
  const [pile, setPile] = useState<{ compId: string; nodes: AimeNode[]; archetypeId: string }[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(projet));
    } catch {
      /* quota */
    }
  }, [projet]);

  const comp = useMemo(
    () => projet.compositions.find((c) => c.id === projet.actifId) ?? projet.compositions[0],
    [projet],
  );

  const log = (p: Projet, message: string): Projet => ({
    ...p,
    journal: [message, ...p.journal].slice(0, 40),
  });

  const mark = useCallback((flag: string, message?: string) => {
    setProjet((p) => {
      const next = { ...p, validation: { ...p.validation, [flag]: true } };
      return message ? log(next, message) : next;
    });
  }, []);

  const patchCompById = (p: Projet, id: string, fn: (c: Composition) => Composition): Projet => ({
    ...p,
    compositions: p.compositions.map((c) => (c.id === id ? fn(c) : c)),
  });

  const update: Ctx["update"] = useCallback(
    (id, patch) => {
      setProjet((p) => {
        const next = patchCompById(p, p.actifId, (c) => ({
          ...c,
          nodes: c.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
        }));
        const geo = "x" in patch || "y" in patch || "w" in patch || "h" in patch;
        return {
          ...next,
          validation: { ...next.validation, modifier: true, ...(geo ? { composer: true } : {}) },
        };
      });
    },
    [],
  );

  const addNode: Ctx["addNode"] = useCallback((n) => {
    setProjet((p) => {
      const next = patchCompById(p, p.actifId, (c) => ({ ...c, nodes: [...c.nodes, n] }));
      return log({ ...next, validation: { ...next.validation, inserer: true } }, `Matière insérée · ${n.nom} · ${n.id}`);
    });
    setSelId(n.id);
  }, []);

  const removeNode: Ctx["removeNode"] = useCallback((id) => {
    setProjet((p) => patchCompById(p, p.actifId, (c) => ({ ...c, nodes: c.nodes.filter((n) => n.id !== id) })));
    setSelId(null);
  }, []);

  const duplicateNode: Ctx["duplicateNode"] = useCallback((id) => {
    let nid = "";
    setProjet((p) =>
      patchCompById(p, p.actifId, (c) => {
        const src = c.nodes.find((n) => n.id === id);
        if (!src) return c;
        nid = newId();
        return { ...c, nodes: [...c.nodes, { ...src, id: nid, x: src.x + 0.5, y: src.y + 0.5 }] };
      }),
    );
    if (nid) setSelId(nid);
  }, []);

  const reorder: Ctx["reorder"] = useCallback((id, dir) => {
    setProjet((p) =>
      patchCompById(p, p.actifId, (c) => {
        const i = c.nodes.findIndex((n) => n.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= c.nodes.length) return c;
        const nodes = [...c.nodes];
        [nodes[i], nodes[j]] = [nodes[j], nodes[i]];
        return { ...c, nodes };
      }),
    );
  }, []);

  const patchComp: Ctx["patchComp"] = useCallback((patch) => {
    setProjet((p) => {
      const next = patchCompById(p, p.actifId, (c) => ({ ...c, ...patch }));
      const v = { ...next.validation };
      if (patch.styleId) v.styliser = true;
      if (patch.supportId) v.support = true;
      return { ...next, validation: v };
    });
  }, []);

  const appliquerArchetype: Ctx["appliquerArchetype"] = useCallback((id) => {
    setProjet((p) => {
      const next = patchCompById(p, p.actifId, (c) => ({
        ...c,
        archetypeId: id,
        nodes: buildNodes(c.objetId, id),
      }));
      return log({ ...next, validation: { ...next.validation, archetype: true, composer: true } }, `Archétype appliqué · ${id}`);
    });
    setSelId(null);
  }, []);

  const chargerObjet: Ctx["chargerObjet"] = useCallback((objetId, archetypeId) => {
    setProjet((p) => {
      const o = objetById(objetId);
      const arc = archetypeId ?? o.archetype;
      const next = patchCompById(p, p.actifId, (c) => ({
        ...c,
        nom: o.nom,
        objetId,
        supportId: o.support,
        archetypeId: arc,
        nodes: buildNodes(objetId, arc),
      }));
      return log({ ...next, validation: { ...next.validation, inserer: true } }, `Objet typé chargé · ${o.nom}`);
    });
    setSelId(null);
  }, []);

  const nouvelleComposition: Ctx["nouvelleComposition"] = useCallback((objetId) => {
    setProjet((p) => {
      const c = buildComposition(objetId, undefined, comp?.styleId ?? "encre-seche");
      return log(
        { ...p, compositions: [...p.compositions, c], actifId: c.id, validation: { ...p.validation, inserer: true } },
        `Composition créée · ${c.nom} · ${c.id}`,
      );
    });
    setSelId(null);
  }, [comp?.styleId]);

  const supprimerComposition: Ctx["supprimerComposition"] = useCallback((id) => {
    setProjet((p) => {
      if (p.compositions.length <= 1) return p;
      const rest = p.compositions.filter((c) => c.id !== id);
      return { ...p, compositions: rest, actifId: p.actifId === id ? rest[0].id : p.actifId };
    });
  }, []);

  const setActif: Ctx["setActif"] = useCallback((id) => {
    setProjet((p) => ({ ...p, actifId: id }));
    setSelId(null);
  }, []);

  const setVar: Ctx["setVar"] = useCallback((cle, valeur) => {
    setProjet((p) => ({
      ...p,
      variables: p.variables.map((v) => (v.cle === cle ? { ...v, valeur } : v)),
      validation: { ...p.validation, relier: true },
    }));
  }, []);

  const ajouterVar: Ctx["ajouterVar"] = useCallback((cle, valeur) => {
    const k = cle.trim().replace(/[^\w-]/g, "");
    if (!k) return;
    setProjet((p) =>
      p.variables.some((v) => v.cle === k)
        ? p
        : { ...p, variables: [...p.variables, { cle: k, valeur, note: "Variable ajoutée" }], validation: { ...p.validation, relier: true } },
    );
  }, []);

  const supprimerVar: Ctx["supprimerVar"] = useCallback((cle) => {
    setProjet((p) => ({ ...p, variables: p.variables.filter((v) => v.cle !== cle) }));
  }, []);

  const reset = useCallback(() => {
    setProjet(projetInitial());
    setPile([]);
    setSelId(null);
  }, []);

  /* —————————————— MÉTAMORPHOSE —————————————— */

  const ajouterSource: Ctx["ajouterSource"] = useCallback((s) => {
    setProjet((p) =>
      log(
        { ...p, sources: [s, ...p.sources.filter((x) => x.id !== s.id)], validation: { ...p.validation, source: true } },
        `Source importée · ${s.nom} · ${s.statut}`,
      ),
    );
  }, []);

  const supprimerSource: Ctx["supprimerSource"] = useCallback((id) => {
    setProjet((p) => ({ ...p, sources: p.sources.filter((s) => s.id !== id) }));
  }, []);

  const ajouterFragment: Ctx["ajouterFragment"] = useCallback((f) => {
    setProjet((p) =>
      log(
        { ...p, fragments: [...p.fragments, f], validation: { ...p.validation, fragment: true, inserer: true } },
        `Fragment créé · ${f.nom} · ${f.id} · ${f.mode}`,
      ),
    );
  }, []);

  const majFragment: Ctx["majFragment"] = useCallback((id, patch, action) => {
    const date = new Date().toISOString();
    setProjet((p) => ({
      ...p,
      fragments: p.fragments.map((f) =>
        f.id === id
          ? {
              ...f,
              ...patch,
              modifie: date,
              historique: action ? [...f.historique, { date, action }] : f.historique,
            }
          : f,
      ),
      validation: { ...p.validation, modifier: true },
      compositions: p.compositions.map((c) => ({
        ...c,
        nodes: c.nodes.map((n) => {
          if (n.fragId !== id) return n;
          const t = patch.contenu?.texte;
          const rows = patch.contenu?.rows;
          const src = patch.contenu?.src;
          if (n.kind === "image" && src) return { ...n, src };
          if (n.kind === "table" && rows) return { ...n, rows };
          if (t !== undefined && n.kind !== "image" && n.kind !== "table")
            return { ...n, text: ["titre", "numero"].includes(n.kind) ? t.split("\n")[0] : t };
          return n;
        }),
      })),
    }));
  }, []);

  const supprimerFragment: Ctx["supprimerFragment"] = useCallback((id) => {
    setProjet((p) => ({ ...p, fragments: p.fragments.filter((f) => f.id !== id) }));
  }, []);

  const composerFragments: Ctx["composerFragments"] = useCallback((ids, mode, archetypeId) => {
    setProjet((p) => {
      const frs = p.fragments.filter((f) => ids.includes(f.id));
      if (!frs.length) return p;
      const courante = p.compositions.find((c) => c.id === p.actifId);
      const c = compositionDepuisFragments(
        frs,
        mode,
        courante?.supportId ?? "a4",
        courante?.styleId ?? "encre-seche",
        archetypeId,
      );
      return log(
        {
          ...p,
          compositions: [...p.compositions, c],
          actifId: c.id,
          fragments: p.fragments.map((f) => (ids.includes(f.id) ? { ...f, usages: [...new Set([...f.usages, c.id])] } : f)),
          validation: { ...p.validation, metamorphose: true, composer: true, archetype: true },
        },
        `Métamorphose · ${frs.length} fragments → ${c.archetypeId} · mode ${mode}`,
      );
    });
    setSelId(null);
  }, []);

  const recomposer: Ctx["recomposer"] = useCallback((mode, archetypeId) => {
    setProjet((p) => {
      const c = p.compositions.find((x) => x.id === p.actifId);
      if (!c?.origine) return p;
      const frs = p.fragments.filter((f) => c.origine!.fragmentIds.includes(f.id));
      if (!frs.length) return p;
      setPile((pl) => [...pl.slice(-9), { compId: c.id, nodes: c.nodes, archetypeId: c.archetypeId }]);
      const arc =
        archetypeId ??
        (mode === c.origine.mode
          ? c.archetypeId
          : (compositionDepuisFragments(frs, mode, c.supportId, c.styleId).archetypeId ?? c.archetypeId));
      return log(
        {
          ...p,
          compositions: p.compositions.map((x) =>
            x.id === c.id
              ? { ...x, archetypeId: arc, nodes: nodesDepuisFragments(frs, arc), origine: { fragmentIds: c.origine!.fragmentIds, mode } }
              : x,
          ),
          validation: { ...p.validation, metamorphose: true, archetype: true },
        },
        `Recomposition · mode ${mode} · ${arc}`,
      );
    });
    setSelId(null);
  }, []);

  const annuler: Ctx["annuler"] = useCallback(() => {
    setPile((pl) => {
      const last = pl[pl.length - 1];
      if (!last) return pl;
      setProjet((p) => ({
        ...p,
        compositions: p.compositions.map((c) =>
          c.id === last.compId ? { ...c, nodes: last.nodes, archetypeId: last.archetypeId } : c,
        ),
      }));
      return pl.slice(0, -1);
    });
  }, []);

  const remplacerProjet: Ctx["remplacerProjet"] = useCallback((p) => {
    setProjet(normaliser(p));
    setPile([]);
    setSelId(null);
  }, []);

  const value: Ctx = {
    projet,
    comp,
    style: styleById(comp?.styleId ?? "encre-seche"),
    support: supportById(comp?.supportId ?? "carte-a6"),
    selId,
    sel: comp?.nodes.find((n) => n.id === selId) ?? null,
    setSelId,
    update,
    addNode,
    removeNode,
    duplicateNode,
    reorder,
    patchComp,
    appliquerArchetype,
    chargerObjet,
    nouvelleComposition,
    supprimerComposition,
    setActif,
    setVar,
    ajouterVar,
    supprimerVar,
    mark,
    reset,
    ajouterSource,
    supprimerSource,
    ajouterFragment,
    majFragment,
    supprimerFragment,
    composerFragments,
    recomposer,
    annuler,
    peutAnnuler: pile.length > 0,
    remplacerProjet,
  };

  return <AimeCtx.Provider value={value}>{children}</AimeCtx.Provider>;
}

export function useAime() {
  const ctx = useContext(AimeCtx);
  if (!ctx) throw new Error("useAime hors provider");
  return ctx;
}
