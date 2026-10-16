import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  BadgeCheck,
  Download,
  FileJson,
  Globe,
  Hash,
  Heading,
  Image as ImageIcon,
  Minus,
  Printer,
  QrCode,
  Square,
  Table,
  Trash2,
  Type,
  Asterisk,
  Plus,
  Lock,
  Unlock,
} from "lucide-react";
import { Canvas } from "../components/Canvas";
import { Inspector } from "../components/Inspector";
import { Btn, Label, Tag } from "../components/ui";
import { useAime } from "../lib/store";
import { MATIERES, nodeFromMatiere } from "../lib/build";
import { ARCHETYPES } from "../lib/archetypes";
import { STYLES } from "../lib/styles";
import { SUPPORTS } from "../lib/supports";
import { FAMILLES, OBJETS } from "../lib/objects";
import { compositionHTML, compositionJSON, download, slug } from "../lib/export";

const ICONS: Record<string, typeof Type> = {
  Type,
  Heading,
  Image: ImageIcon,
  Square,
  Minus,
  Asterisk,
  Table,
  Hash,
  QrCode,
  BadgeCheck,
};

type Onglet = "inserer" | "composer" | "projet" | "calques";

export default function Atelier() {
  const {
    projet,
    comp,
    style,
    support,
    addNode,
    chargerObjet,
    appliquerArchetype,
    patchComp,
    nouvelleComposition,
    supprimerComposition,
    setActif,
    setVar,
    ajouterVar,
    supprimerVar,
    update,
    removeNode,
    selId,
    setSelId,
    mark,
    reset,
  } = useAime();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [onglet, setOnglet] = useState<Onglet>("inserer");
  const [clean, setClean] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [famille, setFamille] = useState("f01");
  const [nvCle, setNvCle] = useState("");

  const ratio = support.w / support.h;
  const flash = (m: string) => {
    setMessage(m);
    setTimeout(() => setMessage(null), 2600);
  };

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
        const url = await toPng(canvasRef.current, {
          pixelRatio: 3,
          backgroundColor: style.palette.paper,
        });
        const a = document.createElement("a");
        a.href = url;
        a.download = `${slug(comp.nom)}-${comp.id}.png`;
        a.click();
        mark("exporter", `Livraison image · ${comp.nom} · PNG 3×`);
        flash("Image exportée · PNG 3×");
      } catch {
        flash("Export image indisponible dans ce contexte");
      }
    });

  const exportJSON = () => {
    download(
      `${slug(comp.nom)}-${comp.id}.aime.json`,
      compositionJSON(comp, style, support, projet.variables, projet.nom),
      "application/json",
    );
    mark("exporter", `Livraison données · ${comp.nom} · .aime.json`);
    flash("Données exportées · .aime.json");
  };

  const exportHTML = () => {
    download(
      `${slug(comp.nom)}-${comp.id}.html`,
      compositionHTML(comp, style, support, projet.variables, window.location.origin),
      "text/html",
    );
    mark("exporter", `Livraison web · ${comp.nom} · page autonome`);
    flash("Page web autonome exportée");
  };

  const imprimer = () =>
    withClean(async () => {
      mark("exporter", `Livraison impression · ${comp.nom}`);
      await new Promise((r) => setTimeout(r, 80));
      window.print();
    });

  const objetsFamille = useMemo(() => OBJETS.filter((o) => o.famille === famille), [famille]);

  return (
    <div className="flex flex-col lg:h-screen">
      {/* Barre d'outils */}
      <header className="no-print border-b border-line px-3 py-2 flex flex-wrap items-center gap-2 bg-vault">
        <div className="flex items-center gap-2 mr-2">
          <span className="font-mono text-[9px] text-vermillon tracking-[0.18em]">{comp.id}</span>
          <input
            value={comp.nom}
            onChange={(e) => patchComp({ nom: e.target.value })}
            className="bg-transparent font-display text-xl text-chalk border-b border-transparent hover:border-line focus:border-vermillon outline-none w-[180px]"
          />
        </div>

        <select
          value={comp.supportId}
          onChange={(e) => patchComp({ supportId: e.target.value })}
          className="bg-vault-3 border border-line px-2 py-1.5 font-mono text-[10px] text-chalk outline-none focus:border-vermillon"
        >
          {SUPPORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nom} · {s.w}×{s.h} {s.unite}
            </option>
          ))}
        </select>

        <select
          value={comp.styleId}
          onChange={(e) => patchComp({ styleId: e.target.value })}
          className="bg-vault-3 border border-line px-2 py-1.5 font-mono text-[10px] text-chalk outline-none focus:border-vermillon"
        >
          {STYLES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.code} · {s.nom}
            </option>
          ))}
        </select>

        <select
          value={comp.archetypeId}
          onChange={(e) => appliquerArchetype(e.target.value)}
          className="bg-vault-3 border border-line px-2 py-1.5 font-mono text-[10px] text-chalk outline-none focus:border-vermillon"
        >
          {ARCHETYPES.map((a) => (
            <option key={a.id} value={a.id}>
              {a.code} · {a.nom}
            </option>
          ))}
        </select>

        <div className="flex gap-1">
          <Btn active={comp.grille} onClick={() => patchComp({ grille: !comp.grille })}>
            Grille
          </Btn>
          <Btn active={comp.fondPerdu} onClick={() => patchComp({ fondPerdu: !comp.fondPerdu })}>
            Fond perdu
          </Btn>
          <Btn active={comp.reperes} onClick={() => patchComp({ reperes: !comp.reperes })}>
            Repères
          </Btn>
        </div>

        <div className="flex gap-1 ml-auto">
          <Btn tone="accent" onClick={exportPNG}>
            <span className="inline-flex items-center gap-1.5">
              <Download size={11} /> Image
            </span>
          </Btn>
          <Btn onClick={imprimer}>
            <span className="inline-flex items-center gap-1.5">
              <Printer size={11} /> Impression
            </span>
          </Btn>
          <Btn onClick={exportHTML}>
            <span className="inline-flex items-center gap-1.5">
              <Globe size={11} /> Web
            </span>
          </Btn>
          <Btn onClick={exportJSON}>
            <span className="inline-flex items-center gap-1.5">
              <FileJson size={11} /> Données
            </span>
          </Btn>
        </div>
      </header>

      <div className="flex-1 grid lg:grid-cols-[292px_1fr_304px] min-h-0">
        {/* Panneau gauche */}
        <aside className="no-print border-b lg:border-b-0 lg:border-r border-line flex flex-col min-h-0 bg-vault">
          <div className="flex border-b border-line">
            {(
              [
                ["inserer", "Insérer"],
                ["composer", "Composer"],
                ["projet", "Projet"],
                ["calques", "Calques"],
              ] as [Onglet, string][]
            ).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setOnglet(k)}
                className={`flex-1 py-2 font-mono text-[9.5px] uppercase tracking-[0.14em] border-r border-line last:border-r-0 transition-colors ${
                  onglet === k ? "bg-vault-2 text-vermillon" : "text-chalk-dim hover:text-chalk"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto scroll-thin lg:max-h-none max-h-[320px]">
            {onglet === "inserer" && (
              <div>
                <div className="p-3 border-b border-line">
                  <Label>Matière brute</Label>
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    {MATIERES.map((m) => {
                      const Icon = ICONS[m.icon] ?? Type;
                      return (
                        <button
                          key={m.id}
                          onClick={() => addNode(nodeFromMatiere(m.id))}
                          title={m.desc}
                          className="flex items-center gap-2 border border-line px-2 py-2 text-left hover:border-vermillon hover:bg-vermillon/10 transition-colors group"
                        >
                          <Icon size={13} className="text-chalk-dim group-hover:text-vermillon shrink-0" />
                          <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-chalk truncate">
                            {m.nom}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3">
                  <Label>Objets typés</Label>
                  <select
                    value={famille}
                    onChange={(e) => setFamille(e.target.value)}
                    className="w-full mt-2 bg-vault-3 border border-line px-2 py-1.5 font-mono text-[10px] text-chalk outline-none focus:border-vermillon"
                  >
                    {FAMILLES.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.code} · {f.nom}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 space-y-1">
                    {objetsFamille.map((o) => (
                      <div
                        key={o.id}
                        className={`border px-2.5 py-2 flex items-center justify-between gap-2 ${
                          comp.objetId === o.id ? "border-vermillon bg-vermillon/10" : "border-line"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="font-body text-[14px] text-chalk truncate">{o.nom}</p>
                          <p className="font-mono text-[8.5px] text-chalk-dim uppercase tracking-[0.1em] truncate">
                            {o.support}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Btn onClick={() => chargerObjet(o.id)} title="Remplacer la composition active">
                            Charger
                          </Btn>
                          <Btn onClick={() => nouvelleComposition(o.id)} title="Nouvelle composition">
                            <Plus size={11} />
                          </Btn>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {onglet === "composer" && (
              <div>
                <div className="p-3 border-b border-line">
                  <Label>Archétypes · Grille Universelle</Label>
                  <div className="grid grid-cols-4 gap-1 mt-2">
                    {ARCHETYPES.map((a) => (
                      <button
                        key={a.id}
                        title={`${a.nom} — ${a.principe}`}
                        onClick={() => appliquerArchetype(a.id)}
                        className={`aspect-square border font-mono text-[9px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
                          comp.archetypeId === a.id
                            ? "border-vermillon bg-vermillon/15 text-vermillon"
                            : "border-line text-chalk-dim hover:text-chalk hover:border-chalk-dim"
                        }`}
                      >
                        <span>{a.id}</span>
                        <span className="text-[7px] uppercase tracking-wider opacity-70">{a.groupe}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-3 border-b border-line">
                  <Label>Directions artistiques</Label>
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    {STYLES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => patchComp({ styleId: s.id })}
                        className={`border px-2 py-2 text-left transition-colors ${
                          comp.styleId === s.id ? "border-vermillon" : "border-line hover:border-chalk-dim"
                        }`}
                      >
                        <div className="flex gap-0.5 mb-1.5">
                          {(["paper", "ink", "accent", "alt"] as const).map((k) => (
                            <span key={k} className="w-3 h-3 border border-black/20" style={{ background: s.palette[k] }} />
                          ))}
                        </div>
                        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-chalk">{s.nom}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-3">
                  <Label>Supports</Label>
                  <div className="mt-2 space-y-1">
                    {SUPPORTS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => patchComp({ supportId: s.id })}
                        className={`w-full border px-2.5 py-1.5 flex items-center justify-between transition-colors ${
                          comp.supportId === s.id ? "border-vermillon text-vermillon" : "border-line text-chalk-dim hover:text-chalk"
                        }`}
                      >
                        <span className="font-body text-[13.5px]">{s.nom}</span>
                        <span className="font-mono text-[9px]">
                          {s.w}×{s.h}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {onglet === "projet" && (
              <div>
                <div className="p-3 border-b border-line">
                  <Label>Compositions du projet</Label>
                  <div className="mt-2 space-y-1">
                    {projet.compositions.map((c) => (
                      <div
                        key={c.id}
                        className={`border px-2.5 py-1.5 flex items-center justify-between gap-2 ${
                          c.id === comp.id ? "border-vermillon bg-vermillon/10" : "border-line"
                        }`}
                      >
                        <button onClick={() => setActif(c.id)} className="min-w-0 text-left flex-1">
                          <p className="font-body text-[13.5px] text-chalk truncate">{c.nom}</p>
                          <p className="font-mono text-[8px] text-chalk-dim">
                            {c.id} · {c.nodes.length} objets
                          </p>
                        </button>
                        <button
                          onClick={() => supprimerComposition(c.id)}
                          className="text-chalk-dim hover:text-red-400 shrink-0"
                          title="Supprimer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 border-b border-line">
                  <Label>Variables partagées · {projet.nom}</Label>
                  <div className="mt-2 space-y-1">
                    {projet.variables.map((v) => (
                      <div key={v.cle} className="flex items-center gap-1" title={v.note}>
                        <span className="font-mono text-[9px] text-sauge w-[74px] shrink-0 truncate">{v.cle}</span>
                        <input
                          value={v.valeur}
                          readOnly={v.cle === "date" || v.cle === "studio_data_version"}
                          title={v.cle === "date" ? "Date calculée : modifiez date_iso ou utilisez les Informations partagées" : v.note}
                          onChange={(e) => setVar(v.cle, e.target.value)}
                          className="flex-1 min-w-0 bg-vault-3 border border-line px-1.5 py-[3px] font-mono text-[10px] text-chalk outline-none focus:border-vermillon"
                        />
                        <button onClick={() => supprimerVar(v.cle)} className="text-chalk-dim hover:text-red-400">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1 mt-2">
                    <input
                      value={nvCle}
                      placeholder="nouvelle_cle"
                      onChange={(e) => setNvCle(e.target.value)}
                      className="flex-1 min-w-0 bg-vault-3 border border-line px-1.5 py-[3px] font-mono text-[10px] text-chalk outline-none focus:border-vermillon"
                    />
                    <Btn
                      onClick={() => {
                        ajouterVar(nvCle, "à compléter");
                        setNvCle("");
                      }}
                    >
                      Ajouter
                    </Btn>
                  </div>
                </div>

                <div className="p-3">
                  <Label>Journal</Label>
                  <ul className="mt-2 space-y-1">
                    {projet.journal.slice(0, 8).map((j, i) => (
                      <li key={i} className="font-mono text-[9px] text-chalk-dim leading-relaxed">
                        <span className="text-vermillon">—</span> {j}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    <Btn tone="danger" onClick={reset}>
                      Réinitialiser le projet
                    </Btn>
                  </div>
                </div>
              </div>
            )}

            {onglet === "calques" && (
              <div className="p-3">
                <Label>Plans · du fond vers l'avant</Label>
                <div className="mt-2 space-y-1">
                  {comp.nodes.map((n, i) => (
                    <div
                      key={n.id}
                      className={`border px-2 py-1.5 flex items-center gap-2 ${
                        n.id === selId ? "border-vermillon bg-vermillon/10" : "border-line"
                      }`}
                    >
                      <span className="font-mono text-[8.5px] text-chalk-dim w-4 shrink-0">{i + 1}</span>
                      <button onClick={() => setSelId(n.id)} className="flex-1 min-w-0 text-left">
                        <p className="font-body text-[13px] text-chalk truncate">{n.nom}</p>
                        <p className="font-mono text-[8px] text-chalk-dim truncate">
                          {n.kind} · {n.x},{n.y} · {n.w}×{n.h}
                        </p>
                      </button>
                      <button
                        onClick={() => update(n.id, { locked: !n.locked })}
                        className="text-chalk-dim hover:text-chalk shrink-0"
                      >
                        {n.locked ? <Lock size={11} /> : <Unlock size={11} />}
                      </button>
                      <button onClick={() => removeNode(n.id)} className="text-chalk-dim hover:text-red-400 shrink-0">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Plan de travail */}
        <section className="relative overflow-auto scroll-thin bg-vault-2/40 flex items-center justify-center p-6 sm:p-10 min-h-[420px]">
          <div className="absolute inset-0 rule-grid opacity-30 pointer-events-none no-print" />
          <div
            className="relative"
            style={{ width: `min(100%, calc((100vh - 230px) * ${ratio}))` }}
          >
            <Canvas innerRef={canvasRef} clean={clean} />
            <div className="no-print mt-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-chalk-dim">
              <span>
                {support.nom} · {support.w}×{support.h} {support.unite} · grille 12×16
              </span>
              <span>{comp.nodes.length} objets</span>
            </div>
          </div>
          {message && (
            <div className="no-print fixed bottom-6 left-1/2 -translate-x-1/2 bg-vermillon text-vault px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] z-50">
              {message}
            </div>
          )}
        </section>

        {/* Inspecteur */}
        <aside className="no-print border-t lg:border-t-0 lg:border-l border-line overflow-y-auto scroll-thin bg-vault">
          <Inspector />
          <div className="p-3 border-t border-line">
            <Label>Authenticité</Label>
            <div className="mt-2 flex flex-wrap gap-1">
              <Tag color="#85a07c">{comp.id}</Tag>
              <Tag>{comp.archetypeId}</Tag>
              <Tag>{style.code}</Tag>
            </div>
            <p className="mt-2 font-mono text-[9px] leading-relaxed text-chalk-dim">
              Chaque livraison embarque l'identifiant de composition, l'archétype et la direction
              artistique appliquée — base du contrôle d'authenticité AIME.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
