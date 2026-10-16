import "./studio.css";
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toPng } from "html-to-image";
import {
  ChevronRight,
  Download,
  FileJson,
  FileUp,
  Files,
  Globe,
  Image as ImageIcon,
  Layers,
  Link2,
  Printer,
  Scissors,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { Canvas } from "../components/Canvas";
import { Inspector } from "../components/Inspector";
import { FragmentInspector } from "../components/FragmentInspector";
import { SourceViewer } from "../components/SourceViewer";
import { Dock, type ZoneAime } from "../components/Dock";
import { ApercuObjet } from "../components/ApercuObjet";
import { Surface } from "../components/Surface";
import { Btn, Label, Tag } from "../components/ui";
import { useAime } from "../lib/store";
import type { Fragment, ModeComposition, ModeRecuperation, Projet, SourceDoc } from "../lib/types";
import {
  CORRESPONDANCES,
  MODES_COMPOSITION,
  MODE_RECUP,
  TYPE_LABEL,
  archetypesCompatibles,
  fragmentDepuisBlocs,
  fragmentVierge,
} from "../lib/fragments";
import { importerFichier, importerURL, sourceDepuisTexte, validerURL } from "../lib/sources";
import { ARCHETYPES, archetypeById } from "../lib/archetypes";
import { STYLES } from "../lib/styles";
import { SUPPORTS, supportById } from "../lib/supports";
import { OBJETS } from "../lib/objects";
import { compositionHTML, compositionJSON, download, slug } from "../lib/export";
import { buildComposition } from "../lib/build";

type Vue = "accueil" | "source" | "canevas" | "apercu";
type Menu = "projet" | "source" | "composition" | "support" | "exporter" | null;
type Entree = "projet" | "bibliotheque" | "fichiers" | null;

export default function Metamorphose() {
  const A = useAime();
  const {
    projet,
    comp,
    style,
    support,
    selId,
    setSelId,
    patchComp,
    appliquerArchetype,
    setActif,
    supprimerComposition,
    nouvelleComposition,
    ajouterSource,
    supprimerSource,
    ajouterFragment,
    supprimerFragment,
    composerFragments,
    recomposer,
    setVar,
    mark,
    reset,
    remplacerProjet,
  } = A;

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const jsonRef = useRef<HTMLInputElement>(null);

  const [vue, setVue] = useState<Vue>(() => new URLSearchParams(window.location.search).get("vue") === "canevas" ? "canevas" : "accueil");
  const [menu, setMenu] = useState<Menu>(null);
  const [entree, setEntree] = useState<Entree>(null);
  const [sousEntree, setSousEntree] = useState("pages");
  const [outil, setOutil] = useState<"pointeur" | "selection">("pointeur");
  const [zoom, setZoom] = useState(1);
  const [zone, setZone] = useState<ZoneAime>(null);
  const [clean, setClean] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [champ, setChamp] = useState("");
  const [occupe, setOccupe] = useState(false);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [blocsSel, setBlocsSel] = useState<string[]>([]);
  const [zoneSel, setZoneSel] = useState<{ x: number; y: number; w: number; h: number } | undefined>();
  const [nomFrag, setNomFrag] = useState("");
  const [modeRecup, setModeRecup] = useState<ModeRecuperation>("semantique");
  const [fragSel, setFragSel] = useState<string[]>([]);
  const [fragInspect, setFragInspect] = useState<string | null>(null);
  const [modeComp, setModeComp] = useState<ModeComposition>(comp?.origine?.mode ?? "editorial");

  const source = projet.sources.find((s) => s.id === sourceId) ?? null;
  const fragments = projet.fragments;
  const fragChoisis = fragments.filter((f) => fragSel.includes(f.id));
  const inspecte = fragments.find((f) => f.id === fragInspect) ?? null;

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 3200);
  };

  /* ———————————————— SOURCE ———————————————— */

  const ouvrirSource = (s: SourceDoc) => {
    setSourceId(s.id);
    setBlocsSel([]);
    setZoneSel(undefined);
    setVue("source");
    setOutil("selection");
    setMenu(null);
  };

  const traiterChamp = async () => {
    const v = champ.trim();
    if (!v) return;
    if (/^(https?:\/\/|www\.)/i.test(v) || /^[\w-]+\.[a-z]{2,}(\/|$)/i.test(v)) {
      const test = validerURL(v);
      if (!test.ok) return flash(test.raison);
      setOccupe(true);
      const s = await importerURL(v);
      setOccupe(false);
      ajouterSource(s);
      ouvrirSource(s);
      flash(
        s.statut === "bloque"
          ? "Site non extractible — importez un document ou utilisez une page locale."
          : `Source importée · ${s.blocs.length} blocs exploitables`,
      );
      setChamp("");
      return;
    }
    if (v.length > 160) {
      const s = sourceDepuisTexte("Texte collé", v);
      ajouterSource(s);
      ouvrirSource(s);
      setChamp("");
      return flash("Texte structuré en blocs sélectionnables");
    }
    // Intention en langage naturel : orientation locale, aucun moteur distant.
    setZone("ai");
    flash("Intention enregistrée — propositions locales dans la capsule AI");
  };

  const choisirFichier = async (f: File) => {
    setOccupe(true);
    const s = await importerFichier(f);
    setOccupe(false);
    ajouterSource(s);
    ouvrirSource(s);
    flash(s.statut === "bloque" ? (s.note ?? "Format non lisible") : `Fichier importé · ${s.blocs.length} blocs`);
  };

  const creerFragment = () => {
    if (!source || !blocsSel.length) return;
    const blocs = source.blocs.filter((b) => blocsSel.includes(b.id));
    const f = fragmentDepuisBlocs(source, blocs, modeRecup, nomFrag, zoneSel);
    ajouterFragment(f);
    setFragSel((s) => [...s, f.id]);
    setFragInspect(f.id);
    setBlocsSel([]);
    setZoneSel(undefined);
    setNomFrag("");
    flash(`Fragment « ${f.nom} » créé · ${f.id}`);
  };

  /* ———————————————— COMPOSITION ———————————————— */

  const composer = (archetypeId?: string) => {
    if (!fragChoisis.length) return flash("Sélectionnez d'abord des fragments");
    composerFragments(fragSel, modeComp, archetypeId);
    setVue("canevas");
    setMenu(null);
    setEntree(null);
    flash(`Métamorphose · ${fragChoisis.length} fragments composés en mode ${modeComp}`);
  };

  const changerMode = (m: ModeComposition) => {
    setModeComp(m);
    if (comp?.origine) {
      recomposer(m);
      flash(`Mode ${m} · fragments conservés, transformation réversible`);
    }
  };

  const compatibles = useMemo(
    () => (fragChoisis.length ? archetypesCompatibles(modeComp, fragChoisis) : []),
    [fragChoisis, modeComp],
  );

  /* ———————————————— LIVRAISON ———————————————— */

  const withClean = async (fn: () => Promise<void> | void) => {
    setClean(true);
    await new Promise((r) => setTimeout(r, 120));
    try {
      await fn();
    } finally {
      setClean(false);
    }
  };

  const exportPNG = () =>
    withClean(async () => {
      if (!canvasRef.current) return;
      try {
        const url = await toPng(canvasRef.current, { pixelRatio: 3, backgroundColor: style.palette.paper });
        const a = document.createElement("a");
        a.href = url;
        a.download = `${slug(comp.nom)}-${comp.id}.png`;
        a.click();
        mark("exporter", `Livraison image · ${comp.nom}`);
        flash("Image exportée · PNG 3×");
      } catch {
        flash("Export image indisponible dans ce contexte");
      }
    });

  const exportJSONComp = () => {
    download(
      `${slug(comp.nom)}-${comp.id}.aime.json`,
      compositionJSON(comp, style, support, projet.variables, projet.nom),
      "application/json",
    );
    mark("exporter", `Livraison données · ${comp.nom}`);
    flash("Composition exportée · .aime.json");
  };

  const exportProjet = () => {
    download(
      `${slug(projet.nom)}.projet.aime.json`,
      JSON.stringify({ format: "aime.projet", version: "1.0", genere: new Date().toISOString(), projet }, null, 2),
      "application/json",
    );
    mark("exporter", "Projet complet exporté · réimportable");
    flash("Projet exporté · réimportable (sources, fragments, compositions)");
  };

  const importerProjet = async (f: File) => {
    try {
      const data = JSON.parse(await f.text());
      const p: Projet = data.projet ?? data;
      if (!p.compositions?.length) throw new Error("structure");
      remplacerProjet(p);
      flash(`Projet « ${p.nom} » réimporté · ${p.fragments?.length ?? 0} fragments`);
      setVue("canevas");
    } catch {
      flash("Fichier non reconnu — attendu : export .projet.aime.json");
    }
  };

  const exportHTML = () => {
    download(
      `${slug(comp.nom)}-${comp.id}.html`,
      compositionHTML(comp, style, support, projet.variables, window.location.origin),
      "text/html",
    );
    mark("exporter", `Livraison web · ${comp.nom}`);
    flash("Page web autonome exportée");
  };

  /* ———————————————— RENDU ———————————————— */

  const capsules: { id: Exclude<Menu, null>; label: string }[] = [
    { id: "projet", label: "Projet" },
    { id: "source", label: "Source" },
    { id: "composition", label: "Composition" },
    { id: "support", label: "Support" },
    { id: "exporter", label: "Exporter" },
  ];

  return (
    <div className="aime-studio h-screen flex flex-col bg-vault text-chalk overflow-hidden">
      {/* ——— Header ——— */}
      <header className="studio-header no-print relative z-50 border-b border-line px-3 py-2 flex items-center gap-2 flex-wrap">
        <Link to="/" className="studio-logo" aria-label="Accueil AIME">aime<span>studio</span></Link>
        <Link to="/espace" className="studio-back">Mon espace ↗</Link>
        <Link to="/informations" className="studio-data-link">Informations partagées ↗</Link>
        {capsules.map((c) => (
          <button
            key={c.id}
            aria-pressed={menu === c.id}
            onClick={() => setMenu(menu === c.id ? null : c.id)}
            className={`font-mono text-[10px] uppercase tracking-[0.14em] px-3 py-1.5 border rounded-full transition-colors ${
              menu === c.id ? "border-vermillon bg-vermillon/15 text-vermillon" : "border-line text-chalk-dim hover:text-chalk"
            }`}
          >
            {c.label}
          </button>
        ))}
        <button
          aria-pressed={vue === "apercu"}
          onClick={() => {
            setVue(vue === "apercu" ? "canevas" : "apercu");
            setMenu(null);
          }}
          className={`font-mono text-[10px] uppercase tracking-[0.14em] px-3 py-1.5 border rounded-full transition-colors ${
            vue === "apercu" ? "border-vermillon bg-vermillon/15 text-vermillon" : "border-line text-chalk-dim hover:text-chalk"
          }`}
        >
          Aperçu
        </button>

        <div className="ml-auto flex items-center gap-2">
          {occupe && <span className="font-mono text-[9px] text-cuivre uppercase tracking-[0.16em]">import en cours…</span>}
          <span className="font-mono text-[9px] text-chalk-dim uppercase tracking-[0.14em] hidden md:inline">
            {projet.nom}
          </span>
        </div>

        {menu && (
          <div className="studio-menu absolute left-2 right-2 top-full mt-1 border border-line bg-vault/98 backdrop-blur p-4 max-h-[60vh] overflow-y-auto scroll-thin shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)]">
            {menu === "projet" && (
              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <Label>Compositions</Label>
                  <div className="mt-2 space-y-1">
                    {projet.compositions.map((c) => (
                      <div
                        key={c.id}
                        className={`border px-2.5 py-1.5 flex items-center justify-between gap-2 ${
                          c.id === comp.id ? "border-vermillon bg-vermillon/10" : "border-line"
                        }`}
                      >
                        <button
                          onClick={() => {
                            setActif(c.id);
                            setVue("canevas");
                            setMenu(null);
                          }}
                          className="min-w-0 text-left flex-1"
                        >
                          <p className="font-body text-[13.5px] truncate">{c.nom}</p>
                          <p className="font-mono text-[8px] text-chalk-dim">
                            {c.id} · {c.nodes.length} objets {c.origine ? `· ${c.origine.fragmentIds.length} fragments` : ""}
                          </p>
                        </button>
                        <button onClick={() => supprimerComposition(c.id)} className="text-chalk-dim hover:text-red-400">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Variables partagées</Label>
                  <div className="mt-2 space-y-1 max-h-[220px] overflow-y-auto scroll-thin pr-1">
                    {projet.variables.map((v) => (
                      <div key={v.cle} className="flex items-center gap-1">
                        <span className="font-mono text-[9px] text-sauge w-[70px] shrink-0 truncate">{v.cle}</span>
                        <input
                          value={v.valeur}
                          readOnly={v.cle === "date" || v.cle === "studio_data_version"}
                          title={v.cle === "date" ? "Date calculée : modifiez date_iso ou utilisez les Informations partagées" : v.note}
                          onChange={(e) => setVar(v.cle, e.target.value)}
                          className="flex-1 min-w-0 bg-vault-3 border border-line px-1.5 py-[3px] font-mono text-[10px] outline-none focus:border-vermillon"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Fichier de projet</Label>
                  <div className="mt-2 flex flex-col gap-1.5 items-start">
                    <Btn tone="accent" onClick={exportProjet}>
                      Exporter le projet (JSON)
                    </Btn>
                    <Btn onClick={() => jsonRef.current?.click()}>Réimporter un projet</Btn>
                    <Btn onClick={() => flash("Projet enregistré localement")}>Enregistrer maintenant</Btn>
                    <Btn tone="danger" onClick={reset}>
                      Réinitialiser
                    </Btn>
                    <p className="font-mono text-[9px] text-chalk-dim leading-relaxed mt-1">
                      Enregistrement local automatique à chaque modification. Aucun serveur, aucun compte.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {menu === "source" && (
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label>Importer</Label>
                  <div className="mt-2 flex gap-1.5">
                    <input
                      value={champ}
                      onChange={(e) => setChamp(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && traiterChamp()}
                      placeholder="https://exemple.org/page — ou collez un texte"
                      className="flex-1 min-w-0 bg-vault-3 border border-line px-2 py-1.5 font-mono text-[10px] outline-none focus:border-vermillon"
                    />
                    <Btn tone="accent" onClick={traiterChamp}>
                      Importer
                    </Btn>
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    <Btn onClick={() => fileRef.current?.click()}>
                      <span className="inline-flex items-center gap-1.5">
                        <FileUp size={11} /> Fichier
                      </span>
                    </Btn>
                  </div>
                  <p className="mt-2 font-mono text-[9px] text-chalk-dim leading-relaxed">
                    Adresses internes refusées. Si un site interdit l'extraction, le parcours continue avec une
                    page locale de démonstration ou un document autorisé.
                  </p>
                </div>
                <div>
                  <Label>Sources du projet</Label>
                  <div className="mt-2 space-y-1 max-h-[240px] overflow-y-auto scroll-thin pr-1">
                    {projet.sources.map((s) => (
                      <div
                        key={s.id}
                        className={`border px-2.5 py-1.5 flex items-center gap-2 ${
                          s.id === sourceId ? "border-vermillon bg-vermillon/10" : "border-line"
                        }`}
                      >
                        <button onClick={() => ouvrirSource(s)} className="flex-1 min-w-0 text-left">
                          <p className="font-body text-[13.5px] truncate">{s.nom}</p>
                          <p className="font-mono text-[8px] text-chalk-dim">
                            {s.origine} · {s.blocs.length} blocs · {s.statut}
                          </p>
                        </button>
                        <button onClick={() => supprimerSource(s.id)} className="text-chalk-dim hover:text-red-400">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {menu === "composition" && (
              <div className="grid md:grid-cols-[1fr_1.4fr] gap-5">
                <div>
                  <Label>Modes universels</Label>
                  <div className="mt-2 space-y-1.5">
                    {MODES_COMPOSITION.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => changerMode(m.id)}
                        className={`w-full text-left border px-3 py-2 transition-colors ${
                          modeComp === m.id ? "border-vermillon bg-vermillon/10" : "border-line hover:border-chalk-dim"
                        }`}
                      >
                        <p className="font-display text-[19px]">{m.nom}</p>
                        <p className="text-[12.5px] text-chalk-dim leading-relaxed">{m.principe}</p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Btn tone="accent" onClick={() => composer()}>
                      Composer avec ces éléments ({fragChoisis.length})
                    </Btn>
                    {STYLES.map((s) => (
                      <button
                        key={s.id}
                        title={s.nom}
                        onClick={() => patchComp({ styleId: s.id })}
                        className={`w-6 h-6 border ${comp.styleId === s.id ? "border-vermillon" : "border-line"}`}
                        style={{ background: s.palette.paper }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label>
                    {fragChoisis.length ? "Structures compatibles" : "24 compositions · bibliothèque MÉTAMORPHOSE"}
                  </Label>
                  <div className="mt-2 grid grid-cols-6 sm:grid-cols-8 gap-1">
                    {(compatibles.length ? compatibles : ARCHETYPES).map((a, i) => (
                      <button
                        key={a.id}
                        title={`${a.code} ${a.nom} — ${a.principe}`}
                        onClick={() => (fragChoisis.length ? composer(a.id) : appliquerArchetype(a.id))}
                        className={`aspect-square border font-mono text-[9px] flex flex-col items-center justify-center transition-colors ${
                          comp.archetypeId === a.id
                            ? "border-vermillon bg-vermillon/15 text-vermillon"
                            : i < 3 && compatibles.length
                              ? "border-sauge/60 text-sauge hover:bg-sauge/10"
                              : "border-line text-chalk-dim hover:text-chalk"
                        }`}
                      >
                        {a.id}
                        <span className="text-[7px] uppercase opacity-70">{a.groupe}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 font-mono text-[9px] text-chalk-dim leading-relaxed">
                    Les six familles de composition sont conservées : Axe, Partition, Cadre, Flux, Trame, Rupture.
                    Changer de mode ou de structure ne touche jamais aux fragments d'origine.
                  </p>
                </div>
              </div>
            )}

            {menu === "support" && (
              <div>
                <Label>Supports · la transformation respecte la capacité réelle du support</Label>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-1.5">
                  {SUPPORTS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        patchComp({ supportId: s.id });
                        flash(`Support · ${s.nom} — contenus conservés`);
                      }}
                      className={`border px-2 py-2 text-left transition-colors ${
                        comp.supportId === s.id ? "border-vermillon text-vermillon" : "border-line text-chalk-dim hover:text-chalk"
                      }`}
                    >
                      <span className="block font-body text-[13px] truncate">{s.nom}</span>
                      <span className="font-mono text-[8.5px]">
                        {s.w}×{s.h} {s.unite}
                      </span>
                    </button>
                  ))}
                </div>
                {comp.origine && (
                  <div className="mt-3">
                    <Btn
                      tone="accent"
                      onClick={() => {
                        recomposer(modeComp);
                        flash("Composition adaptée au support · fragments inchangés");
                      }}
                    >
                      Adapter la composition à ce support
                    </Btn>
                  </div>
                )}
              </div>
            )}

            {menu === "exporter" && (
              <div className="flex flex-wrap gap-2">
                <Btn tone="accent" onClick={exportPNG}>
                  <span className="inline-flex items-center gap-1.5">
                    <Download size={11} /> Image PNG 3×
                  </span>
                </Btn>
                <Btn onClick={() => withClean(() => window.print())}>
                  <span className="inline-flex items-center gap-1.5">
                    <Printer size={11} /> Impression
                  </span>
                </Btn>
                <Btn onClick={exportHTML}>
                  <span className="inline-flex items-center gap-1.5">
                    <Globe size={11} /> Page web
                  </span>
                </Btn>
                <Btn onClick={exportJSONComp}>
                  <span className="inline-flex items-center gap-1.5">
                    <FileJson size={11} /> Composition JSON
                  </span>
                </Btn>
                <Btn onClick={exportProjet}>
                  <span className="inline-flex items-center gap-1.5">
                    <FileJson size={11} /> Projet complet
                  </span>
                </Btn>
              </div>
            )}
          </div>
        )}
      </header>

      <input
        ref={fileRef}
        type="file"
        hidden
        accept="image/*,text/*,.md,.csv,.json,.html,.pdf"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) choisirFichier(f);
          e.target.value = "";
        }}
      />
      <input
        ref={jsonRef}
        type="file"
        hidden
        accept="application/json,.json"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) importerProjet(f);
          e.target.value = "";
        }}
      />

      {/* ——— Corps ——— */}
      <div className="studio-layout flex-1 grid lg:grid-cols-[232px_1fr_300px] min-h-0">
        {/* Colonne gauche */}
        <aside className="studio-library no-print border-r border-line flex flex-col min-h-0 overflow-y-auto scroll-thin">
          <div className="studio-panel-heading"><span>VOTRE PROJET</span><h2>Tout reste lié.</h2><p>Sources, créations et supports.</p></div>
          {(
            [
              ["projet", "Projet", ["pages", "fragments", "calques", "sources"]],
              ["bibliotheque", "Bibliothèque", ["compositions", "supports", "objets", "modèles"]],
              ["fichiers", "Fichiers", ["images", "documents", "médias"]],
            ] as [Exclude<Entree, null>, string, string[]][]
          ).map(([id, label, sous]) => (
            <div key={id} className="border-b border-line">
              <button
                onClick={() => {
                  setEntree(entree === id ? null : id);
                  setSousEntree(sous[0]);
                }}
                className={`w-full px-3 py-2.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${
                  entree === id ? "text-vermillon bg-vault-2" : "text-chalk-dim hover:text-chalk"
                }`}
              >
                {label}
                <ChevronRight size={12} className={entree === id ? "rotate-90 transition-transform" : "transition-transform"} />
              </button>

              {entree === id && (
                <div className="pb-2">
                  <div className="flex flex-wrap gap-1 px-2 pb-2">
                    {sous.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSousEntree(s)}
                        className={`font-mono text-[9px] uppercase tracking-[0.1em] px-1.5 py-1 border ${
                          sousEntree === s ? "border-vermillon text-vermillon" : "border-line text-chalk-dim hover:text-chalk"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="px-2">
                    <PanneauGauche
                      entree={id}
                      sous={sousEntree}
                      fragSel={fragSel}
                      setFragSel={setFragSel}
                      setFragInspect={setFragInspect}
                      ouvrirSource={ouvrirSource}
                      setVue={setVue}
                      flash={flash}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {!entree && (
            <div className="p-3">
              <p className="font-mono text-[9px] leading-relaxed text-chalk-dim uppercase tracking-[0.14em]">
                Source → Sélection → Fragment → Composition → Support
              </p>
              <div className="mt-3 space-y-1">
                <Btn onClick={() => setMenu("source")}>Importer une source</Btn>
                <Btn onClick={() => setEntree("projet")}>Voir les fragments</Btn>
              </div>
            </div>
          )}
        </aside>

        {/* Centre */}
        <section className="studio-stage relative min-h-0 bg-vault-2/40 flex flex-col">
          <div className="absolute inset-0 rule-grid opacity-25 pointer-events-none no-print" />

          {vue !== "accueil" && (
            <div className="no-print relative border-b border-line px-3 py-1.5 flex items-center gap-1.5 flex-wrap">
              {(["source", "canevas", "apercu"] as Vue[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setVue(v)}
                  disabled={v === "source" && !source}
                  className={`font-mono text-[9.5px] uppercase tracking-[0.14em] px-2.5 py-1 border transition-colors disabled:opacity-40 ${
                    vue === v ? "border-vermillon text-vermillon" : "border-line text-chalk-dim hover:text-chalk"
                  }`}
                >
                  {v === "apercu" ? "aperçu" : v}
                </button>
              ))}
              <button
                onClick={() => setVue("accueil")}
                className="font-mono text-[9.5px] uppercase tracking-[0.14em] px-2.5 py-1 border border-line text-chalk-dim hover:text-chalk"
              >
                nouveau
              </button>
              <span className="ml-auto font-mono text-[9px] text-chalk-dim uppercase tracking-[0.14em] truncate">
                {comp.nom} · {archetypeById(comp.archetypeId).code} · {support.nom}
              </span>
            </div>
          )}

          <div className="relative flex-1 min-h-0 overflow-auto scroll-thin p-4 sm:p-7 pb-24">
            {vue === "accueil" && (
              <Accueil
                champ={champ}
                setChamp={setChamp}
                traiter={traiterChamp}
                occupe={occupe}
                sources={projet.sources}
                ouvrirSource={ouvrirSource}
                fichier={() => fileRef.current?.click()}
                modele={(id) => {
                  const co = CORRESPONDANCES.find((c) => c.id === id)!;
                  const o = OBJETS.find((x) => x.support === co.support) ?? OBJETS[0];
                  nouvelleComposition(o.id);
                  patchComp({ supportId: co.support, nom: co.nom });
                  appliquerArchetype(co.archetype);
                  setVue("canevas");
                  flash(`Modèle « ${co.nom} » ouvert · objet composé de fragments`);
                }}
              />
            )}

            {vue === "source" && source && (
              <div className="h-full flex flex-col gap-3 max-w-[900px] mx-auto">
                <div className="flex-1 min-h-[340px]">
                  <SourceViewer
                    source={source}
                    selection={blocsSel}
                    setSelection={setBlocsSel}
                    mode={outil === "selection" ? "selection" : "lecture"}
                    onZone={setZoneSel}
                  />
                </div>
                <div className="border border-line bg-vault p-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Label>Transformer la sélection en fragment</Label>
                    <div className="flex gap-1 ml-auto">
                      {MODE_RECUP.map((m) => (
                        <button
                          key={m.id}
                          title={m.desc}
                          onClick={() => setModeRecup(m.id)}
                          className={`font-mono text-[9px] uppercase tracking-[0.12em] px-2 py-1 border ${
                            modeRecup === m.id ? "border-vermillon text-vermillon" : "border-line text-chalk-dim hover:text-chalk"
                          }`}
                        >
                          {m.nom}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 flex gap-1.5 flex-wrap">
                    <input
                      value={nomFrag}
                      onChange={(e) => setNomFrag(e.target.value)}
                      placeholder="Nom de la sélection"
                      className="flex-1 min-w-[160px] bg-vault-3 border border-line px-2 py-1.5 font-mono text-[10px] outline-none focus:border-vermillon"
                    />
                    <Btn tone="accent" onClick={creerFragment}>
                      <span className="inline-flex items-center gap-1.5">
                        <Scissors size={11} /> Créer le fragment ({blocsSel.length})
                      </span>
                    </Btn>
                    <Btn onClick={() => { setBlocsSel([]); setZoneSel(undefined); }}>Vider</Btn>
                  </div>
                  <p className="mt-2 font-mono text-[9px] text-chalk-dim leading-relaxed">
                    {outil === "selection"
                      ? "Tracez un rectangle sur la source ou cliquez des blocs. Plusieurs sélections sont possibles ; la source reste intacte."
                      : "Activez l'outil Sélection dans le dock pour cadrer des zones."}
                    {modeRecup === "visuel" && " · Mode visuel : le cadrage est conservé, le texte n'est pas présenté comme éditable."}
                  </p>
                </div>
              </div>
            )}

            {vue === "canevas" && (
              <div className="flex justify-center">
                <div
                  style={{
                    width: `min(100%, calc((100vh - 290px) * ${support.w / support.h}))`,
                    transform: `scale(${zoom})`,
                    transformOrigin: "top center",
                  }}
                >
                  <Canvas innerRef={canvasRef} clean={clean} />
                  <div className="no-print mt-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-chalk-dim">
                    <span>
                      {support.nom} · {support.w}×{support.h} {support.unite} · grille 12×16
                    </span>
                    <span>
                      {comp.nodes.length} objets {comp.origine ? `· mode ${comp.origine.mode}` : ""}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {vue === "apercu" && (
              <div className="max-w-[520px] mx-auto">
                <ApercuObjet comp={comp} style={style} support={support} vars={projet.variables} />
              </div>
            )}
          </div>

          {msg && (
            <div className="no-print absolute bottom-20 left-1/2 -translate-x-1/2 bg-vermillon text-vault px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] z-40 max-w-[90%] text-center">
              {msg}
            </div>
          )}
        </section>

        {/* Inspecteur contextuel */}
        <aside className="studio-inspector no-print border-l border-line overflow-y-auto scroll-thin pb-24">
          {inspecte ? (
            <FragmentInspector frag={inspecte} onClose={() => setFragInspect(null)} />
          ) : selId ? (
            <Inspector />
          ) : (
            <div className="p-5 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-chalk-dim">Inspecteur</p>
              <p className="mt-3 text-sm text-chalk-dim leading-relaxed">
                Sélectionnez une création pour lui donner votre touche. Ses réglages et ses informations liées apparaîtront ici.
              </p>
            </div>
          )}
        </aside>
      </div>

      <Dock outil={outil} setOutil={setOutil} zoom={zoom} setZoom={setZoom} zone={zone} setZone={setZone} />

      {zone && (
        <PanneauCapsule
          zone={zone}
          fermer={() => setZone(null)}
          fragments={fragments}
          onImport={() => {
            setZone(null);
            setMenu("source");
          }}
          onFichier={() => {
            setZone(null);
            fileRef.current?.click();
          }}
          onFragmentVierge={() => {
            const f = fragmentVierge("texte", "Fragment libre", "Texte à composer.");
            ajouterFragment(f);
            setFragSel((s) => [...s, f.id]);
            setFragInspect(f.id);
            setZone(null);
            flash("Fragment libre ajouté au projet");
          }}
          onComposer={() => {
            setZone(null);
            composer();
          }}
          modeConseille={modeComp}
          setVue={setVue}
        />
      )}
    </div>
  );
}

/* ———————————————— Écran d'accueil du canevas ———————————————— */

function Accueil({
  champ,
  setChamp,
  traiter,
  occupe,
  sources,
  ouvrirSource,
  fichier,
  modele,
}: {
  champ: string;
  setChamp: (v: string) => void;
  traiter: () => void;
  occupe: boolean;
  sources: SourceDoc[];
  ouvrirSource: (s: SourceDoc) => void;
  fichier: () => void;
  modele: (id: string) => void;
}) {
  return (
    <div className="h-full grid place-items-center">
      <div className="w-full max-w-[640px] rise">
        <div className="studio-welcome-visual" aria-hidden="true"><img src="/img/byaime/stationery.webp" alt="" /></div>
        <p className="studio-eyebrow">VOS IDÉES. TOUTES LEURS EXPRESSIONS.</p>
        <h1 className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] leading-[1.05] text-center text-chalk">
          Une idée prend forme.<br />Les liens restent.
        </h1>

        <p className="studio-welcome-copy">Importez une source, composez un support et retrouvez vos informations communes dans chaque création liée.</p>
        <div className="mt-7 flex gap-1.5">
          <input
            value={champ}
            onChange={(e) => setChamp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && traiter()}
            placeholder="Une intention, une adresse https://…, ou collez un texte"
            className="flex-1 min-w-0 bg-vault-3 border border-line px-3 py-3 font-body text-[15px] text-chalk outline-none focus:border-vermillon placeholder:text-chalk-dim/60"
          />
          <button
            onClick={traiter}
            disabled={occupe}
            className="bg-vermillon text-vault px-5 font-mono text-[10px] uppercase tracking-[0.18em] hover:bg-chalk transition-colors disabled:opacity-50"
          >
            {occupe ? "…" : "Lancer"}
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5 justify-center">
          <Btn onClick={fichier}>
            <span className="inline-flex items-center gap-1.5">
              <Upload size={11} /> Importer un fichier
            </span>
          </Btn>
          <Link
            to="/grille"
            className="font-mono text-[10px] uppercase tracking-[0.14em] px-2.5 py-1.5 border border-line text-chalk-dim hover:text-chalk"
          >
            Explorer les 24 compositions
          </Link>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Sources disponibles</Label>
            <div className="mt-2 space-y-1">
              {sources.slice(0, 4).map((s) => (
                <button
                  key={s.id}
                  onClick={() => ouvrirSource(s)}
                  className="w-full border border-line px-2.5 py-2 text-left hover:border-vermillon transition-colors"
                >
                  <p className="font-body text-[13.5px] text-chalk truncate">{s.nom}</p>
                  <p className="font-mono text-[8.5px] text-chalk-dim">
                    {s.origine} · {s.blocs.length} blocs
                  </p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Collection Correspondances</Label>
            <div className="mt-2 grid grid-cols-2 gap-1">
              {CORRESPONDANCES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => modele(c.id)}
                  className="border border-line px-2 py-2 text-left hover:border-vermillon transition-colors"
                >
                  <p className="font-body text-[13px] text-chalk truncate">{c.nom}</p>
                  <p className="font-mono text-[8px] text-chalk-dim truncate">{c.resume}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ———————————————— Colonne gauche ———————————————— */

function PanneauGauche({
  entree,
  sous,
  fragSel,
  setFragSel,
  setFragInspect,
  ouvrirSource,
  setVue,
  flash,
}: {
  entree: "projet" | "bibliotheque" | "fichiers";
  sous: string;
  fragSel: string[];
  setFragSel: (v: string[]) => void;
  setFragInspect: (v: string | null) => void;
  ouvrirSource: (s: SourceDoc) => void;
  setVue: (v: Vue) => void;
  flash: (m: string) => void;
}) {
  const {
    projet,
    comp,
    style,
    setActif,
    setSelId,
    selId,
    appliquerArchetype,
    patchComp,
    nouvelleComposition,
    chargerObjet,
    ajouterFragment,
  } = useAime();

  if (entree === "projet") {
    if (sous === "pages")
      return (
        <ul className="space-y-1">
          {projet.compositions.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => {
                  setActif(c.id);
                  setVue("canevas");
                }}
                className={`w-full text-left border px-2 py-1.5 ${
                  c.id === comp.id ? "border-vermillon bg-vermillon/10" : "border-line hover:border-chalk-dim"
                }`}
              >
                <p className="font-body text-[13px] truncate text-chalk">{c.nom}</p>
                <p className="font-mono text-[8px] text-chalk-dim">{c.nodes.length} objets</p>
              </button>
            </li>
          ))}
        </ul>
      );

    if (sous === "fragments")
      return projet.fragments.length ? (
        <ul className="space-y-1">
          {projet.fragments.map((f) => (
            <li
              key={f.id}
              className={`border px-2 py-1.5 flex items-center gap-2 ${
                fragSel.includes(f.id) ? "border-sauge bg-sauge/10" : "border-line"
              }`}
            >
              <input
                type="checkbox"
                checked={fragSel.includes(f.id)}
                onChange={() =>
                  setFragSel(fragSel.includes(f.id) ? fragSel.filter((x) => x !== f.id) : [...fragSel, f.id])
                }
                className="accent-[#85a07c] shrink-0"
                aria-label={`Sélectionner ${f.nom}`}
              />
              <button onClick={() => setFragInspect(f.id)} className="flex-1 min-w-0 text-left">
                <p className="font-body text-[12.5px] truncate text-chalk">{f.nom}</p>
                <p className="font-mono text-[8px] text-chalk-dim truncate">
                  {TYPE_LABEL[f.type]} · {f.mode} · {f.usages.length} usage(s)
                </p>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-mono text-[9px] text-chalk-dim leading-relaxed py-2">
          Aucun fragment. Ouvrez une source, passez en mode Sélection, puis créez un fragment.
        </p>
      );

    if (sous === "calques")
      return (
        <ul className="space-y-1">
          {comp.nodes.map((n, i) => (
            <li key={n.id}>
              <button
                onClick={() => {
                  setSelId(n.id);
                  setVue("canevas");
                }}
                className={`w-full text-left border px-2 py-1 flex items-center gap-2 ${
                  n.id === selId ? "border-vermillon bg-vermillon/10" : "border-line"
                }`}
              >
                <span className="font-mono text-[8px] text-chalk-dim w-4">{i + 1}</span>
                <span className="font-body text-[12.5px] truncate text-chalk">{n.nom}</span>
                {n.fragId && <Layers size={10} className="ml-auto text-sauge shrink-0" />}
              </button>
            </li>
          ))}
        </ul>
      );

    return (
      <ul className="space-y-1">
        {projet.sources.map((s) => (
          <li key={s.id}>
            <button
              onClick={() => ouvrirSource(s)}
              className="w-full text-left border border-line px-2 py-1.5 hover:border-vermillon"
            >
              <p className="font-body text-[12.5px] truncate text-chalk">{s.nom}</p>
              <p className="font-mono text-[8px] text-chalk-dim">
                {s.origine} · {s.statut}
              </p>
            </button>
          </li>
        ))}
      </ul>
    );
  }

  if (entree === "bibliotheque") {
    if (sous === "compositions")
      return (
        <div className="grid grid-cols-4 gap-1">
          {ARCHETYPES.map((a) => (
            <button
              key={a.id}
              title={`${a.code} ${a.nom}`}
              onClick={() => {
                appliquerArchetype(a.id);
                setVue("canevas");
              }}
              className={`aspect-square border font-mono text-[9px] ${
                comp.archetypeId === a.id ? "border-vermillon text-vermillon" : "border-line text-chalk-dim hover:text-chalk"
              }`}
            >
              {a.id}
            </button>
          ))}
        </div>
      );

    if (sous === "supports")
      return (
        <ul className="space-y-1">
          {SUPPORTS.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => patchComp({ supportId: s.id })}
                className={`w-full text-left border px-2 py-1 flex justify-between ${
                  comp.supportId === s.id ? "border-vermillon text-vermillon" : "border-line text-chalk-dim hover:text-chalk"
                }`}
              >
                <span className="font-body text-[12.5px] truncate">{s.nom}</span>
                <span className="font-mono text-[8px]">
                  {s.w}×{s.h}
                </span>
              </button>
            </li>
          ))}
        </ul>
      );

    if (sous === "objets")
      return (
        <ul className="space-y-1 max-h-[300px] overflow-y-auto scroll-thin pr-1">
          {OBJETS.map((o) => (
            <li key={o.id}>
              <button
                onClick={() => {
                  chargerObjet(o.id);
                  setVue("canevas");
                }}
                className="w-full text-left border border-line px-2 py-1 hover:border-vermillon"
              >
                <span className="font-body text-[12.5px] text-chalk">{o.nom}</span>
              </button>
            </li>
          ))}
        </ul>
      );

    return (
      <div className="space-y-2">
        {CORRESPONDANCES.map((c) => {
          const sup = supportById(c.support);
          const apercu = buildComposition(
            OBJETS.find((o) => o.support === c.support)?.id ?? "o-faire-part",
            c.archetype,
            comp.styleId,
          );
          return (
            <button
              key={c.id}
              onClick={() => {
                nouvelleComposition(OBJETS.find((o) => o.support === c.support)?.id ?? "o-faire-part");
                patchComp({ supportId: c.support, nom: c.nom });
                appliquerArchetype(c.archetype);
                setVue("canevas");
                flash(`Modèle « ${c.nom} » ouvert`);
              }}
              className="w-full border border-line hover:border-vermillon p-1.5 flex items-center gap-2"
            >
              <div className="w-10 shrink-0">
                <Surface comp={apercu} style={style} support={sup} vars={projet.variables} />
              </div>
              <div className="min-w-0 text-left">
                <p className="font-body text-[12.5px] text-chalk truncate">{c.nom}</p>
                <p className="font-mono text-[8px] text-chalk-dim truncate">{c.resume}</p>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // FICHIERS
  const images = projet.sources.flatMap((s) =>
    s.blocs.filter((b) => b.type === "image").map((b) => ({ s, src: b.src!, nom: b.texte ?? "image", bloc: b })),
  );
  const docs = projet.sources.filter((s) => s.origine === "fichier" || s.origine === "texte");

  if (sous === "images")
    return images.length ? (
      <div className="grid grid-cols-3 gap-1">
        {images.map((im, i) => (
          <button
            key={i}
            title={`${im.nom} — créer un fragment image`}
            onClick={() => {
              const f = fragmentDepuisBlocs(im.s, [im.bloc], "visuel", im.nom);
              ajouterFragment(f);
              setFragSel([...fragSel, f.id]);
              setFragInspect(f.id);
              flash("Fragment image créé");
            }}
            className="aspect-square border border-line hover:border-vermillon overflow-hidden"
          >
            <img src={im.src} alt={im.nom} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    ) : (
      <p className="font-mono text-[9px] text-chalk-dim py-2">Aucune image importée.</p>
    );

  if (sous === "documents")
    return docs.length ? (
      <ul className="space-y-1">
        {docs.map((s) => (
          <li key={s.id}>
            <button
              onClick={() => ouvrirSource(s)}
              className="w-full text-left border border-line px-2 py-1.5 hover:border-vermillon flex items-center gap-2"
            >
              <Files size={11} className="text-chalk-dim shrink-0" />
              <span className="font-body text-[12.5px] truncate text-chalk">{s.nom}</span>
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p className="font-mono text-[9px] text-chalk-dim py-2">Aucun document importé.</p>
    );

  return (
    <div className="grid grid-cols-2 gap-1">
      {["/img/m1.jpg", "/img/m2.jpg", "/img/m3.jpg", "/img/m4.jpg"].map((src) => (
        <div key={src} className="aspect-square border border-line overflow-hidden">
          <img src={src} alt="média du projet" className="w-full h-full object-cover" />
        </div>
      ))}
      <p className="col-span-2 font-mono text-[8.5px] text-chalk-dim leading-relaxed">
        Médias du projet, réutilisables par plusieurs fragments sans duplication.
      </p>
    </div>
  );
}

/* ———————————————— Capsule AI + ME ———————————————— */

function PanneauCapsule({
  zone,
  fermer,
  fragments,
  onImport,
  onFichier,
  onFragmentVierge,
  onComposer,
  modeConseille,
  setVue,
}: {
  zone: ZoneAime;
  fermer: () => void;
  fragments: Fragment[];
  onImport: () => void;
  onFichier: () => void;
  onFragmentVierge: () => void;
  onComposer: () => void;
  modeConseille: ModeComposition;
  setVue: (v: Vue) => void;
}) {
  const { projet, comp, setVar, patchComp, mark } = useAime();

  const etapes = [
    { f: "source", t: "Importer une source", ok: projet.sources.length > 0 },
    { f: "fragment", t: "Créer au moins deux fragments", ok: fragments.length >= 2 },
    { f: "metamorphose", t: "Composer les fragments", ok: projet.compositions.some((c) => !!c.origine) },
    { f: "support", t: "Changer de support", ok: !!projet.validation.support },
    { f: "exporter", t: "Exporter une livraison", ok: !!projet.validation.exporter },
  ];
  const suivante = etapes.find((e) => !e.ok);

  const types = fragments.reduce<Record<string, number>>((a, f) => ({ ...a, [f.type]: (a[f.type] ?? 0) + 1 }), {});
  const conseil =
    (types.tableau ?? 0) >= 1 && (types.texte ?? 0) <= 2
      ? "regulier"
      : (types.image ?? 0) >= 2
        ? "immersif"
        : "editorial";

  return (
    <div className="no-print fixed bottom-[86px] left-1/2 -translate-x-1/2 z-50 w-[min(640px,94vw)] border border-line bg-vault/98 backdrop-blur p-4 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vermillon">
          {zone === "ai" ? "AI · comprendre, proposer, guider" : zone === "plus" ? "+ · créer, importer, ajouter" : "ME · partagé, préférences, créations"}
        </p>
        <button onClick={fermer} className="font-mono text-[10px] text-chalk-dim hover:text-chalk">
          fermer
        </button>
      </div>

      {zone === "ai" && (
        <div className="space-y-3">
          <p className="font-mono text-[9px] leading-relaxed text-chalk-dim">
            Analyse locale déterministe de l'état du projet. Aucun moteur d'IA n'est connecté à cette
            instance : rien n'est inventé, rien n'est envoyé à l'extérieur.
          </p>
          <ul className="space-y-1">
            {etapes.map((e) => (
              <li key={e.f} className="flex items-center gap-2 text-[13.5px]">
                <span className={`font-mono text-[10px] ${e.ok ? "text-sauge" : "text-chalk-dim/50"}`}>
                  {e.ok ? "✓" : "○"}
                </span>
                <span className={e.ok ? "text-chalk" : "text-chalk-dim"}>{e.t}</span>
              </li>
            ))}
          </ul>
          <div className="border border-line p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-chalk-dim">Proposition</p>
            <p className="mt-1.5 text-[14px] text-chalk leading-relaxed">
              {suivante
                ? `Étape suivante : ${suivante.t.toLowerCase()}.`
                : "Le parcours complet est validé — vous pouvez enrichir les bibliothèques."}
              {fragments.length > 0 && (
                <>
                  {" "}
                  D'après les {fragments.length} fragments présents ({Object.entries(types)
                    .map(([k, v]) => `${v} ${k}`)
                    .join(", ")}
                  ), le mode <strong className="text-vermillon">{conseil}</strong> est le plus adapté
                  {conseil !== modeConseille ? " (mode actuel différent)" : ""}.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {zone === "plus" && (
        <div className="flex flex-wrap gap-2">
          <Btn tone="accent" onClick={onImport}>
            <span className="inline-flex items-center gap-1.5">
              <Link2 size={11} /> Importer une URL
            </span>
          </Btn>
          <Btn onClick={onFichier}>
            <span className="inline-flex items-center gap-1.5">
              <ImageIcon size={11} /> Importer un fichier
            </span>
          </Btn>
          <Btn onClick={onFragmentVierge}>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles size={11} /> Fragment libre
            </span>
          </Btn>
          <Btn onClick={onComposer}>Composer les fragments choisis</Btn>
        </div>
      )}

      {zone === "me" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Informations partagées</Label>
            <div className="mt-2 space-y-1 max-h-[180px] overflow-y-auto scroll-thin pr-1">
              {projet.variables.slice(0, 10).map((v) => (
                <div key={v.cle} className="flex items-center gap-1">
                  <span className="font-mono text-[9px] text-sauge w-[66px] shrink-0 truncate">{v.cle}</span>
                  <input
                    value={v.valeur}
                    readOnly={v.cle === "date" || v.cle === "studio_data_version"}
                          title={v.cle === "date" ? "Date calculée : modifiez date_iso ou utilisez les Informations partagées" : v.note}
                          onChange={(e) => setVar(v.cle, e.target.value)}
                    className="flex-1 min-w-0 bg-vault-3 border border-line px-1.5 py-[3px] font-mono text-[10px] outline-none focus:border-vermillon"
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label>Préférences et créations</Label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Btn active={comp.grille} onClick={() => patchComp({ grille: !comp.grille })}>
                Grille
              </Btn>
              <Btn active={comp.reperes} onClick={() => patchComp({ reperes: !comp.reperes })}>
                Repères
              </Btn>
              <Btn active={comp.fondPerdu} onClick={() => patchComp({ fondPerdu: !comp.fondPerdu })}>
                Fond perdu
              </Btn>
              <Btn
                onClick={() => {
                  setVue("apercu");
                  fermer();
                  mark("composer");
                }}
              >
                Aperçu interactif
              </Btn>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {projet.compositions.slice(0, 6).map((c) => (
                <Tag key={c.id}>{c.nom}</Tag>
              ))}
            </div>
            <p className="mt-2 font-mono text-[9px] text-chalk-dim leading-relaxed">
              Animations respectant la préférence système de réduction des mouvements.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
