import "../components/material-objects.css";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FAMILLES, OBJETS } from "../lib/objects";
import { buildComposition } from "../lib/build";
import { supportById } from "../lib/supports";
import { styleById } from "../lib/styles";
import { archetypeById } from "../lib/archetypes";
import { Surface } from "../components/Surface";
import { PageTitre } from "../components/Shell";
import { useAime } from "../lib/store";
import { Btn, Tag } from "../components/ui";

export default function Bibliotheque() {
  const [famille, setFamille] = useState<string>("toutes");
  const { projet, nouvelleComposition } = useAime();
  const nav = useNavigate();
  const styleId = "studio-clair";

  const apercus = useMemo(
    () =>
      OBJETS.map((o) => ({
        objet: o,
        comp: buildComposition(o.id, o.archetype, styleId),
      })),
    [styleId],
  );

  const liste = apercus.filter((a) => famille === "toutes" || a.objet.famille === famille);

  return (
    <div className="modern-library">
      <PageTitre
        code="01 · Bibliothèque"
        titre="Les essentiels. Réinventés."
        chapeau="Une collection de supports sobres et contemporains. Typographie nette, espaces généreux et informations liées : chaque modèle devient le vôtre, sans tout ressaisir."
      />

      <div className="sticky top-0 z-30 bg-vault/95 backdrop-blur border-b border-line px-5 sm:px-10 py-3 flex flex-wrap gap-2">
        <Btn active={famille === "toutes"} onClick={() => setFamille("toutes")}>
          Toutes
        </Btn>
        {FAMILLES.map((f) => (
          <button
            key={f.id}
            onClick={() => setFamille(f.id)}
            className={`font-mono text-[10px] uppercase tracking-[0.14em] px-2.5 py-1.5 border transition-colors ${
              famille === f.id ? "text-vault" : "text-chalk-dim hover:text-chalk"
            }`}
            style={{
              borderColor: famille === f.id ? f.teinte : "#e2e5de",
              background: famille === f.id ? f.teinte : "transparent",
            }}
          >
            {f.code} {f.nom}
          </button>
        ))}
      </div>

      <div className="px-5 sm:px-10 py-10 grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {liste.map(({ objet, comp: c }) => {
          const fam = FAMILLES.find((f) => f.id === objet.famille)!;
          const sup = supportById(objet.support);
          const arc = archetypeById(objet.archetype);
          return (
            <article key={objet.id} className="library-card border border-line bg-vault-2/30 flex flex-col group">
              <div className="p-5 bg-vault-3/40 flex items-center justify-center min-h-[230px]">
                <div
                  className="w-full transition-transform duration-500 group-hover:scale-[1.02] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)]"
                  style={{ maxWidth: sup.w >= sup.h ? "100%" : "62%" }}
                >
                  <Surface comp={c} style={styleById(styleId)} support={sup} vars={projet.variables} />
                </div>
              </div>
              <div className="p-4 border-t border-line flex-1 flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag color={fam.teinte}>{fam.code}</Tag>
                  <Tag>{sup.nom}</Tag>
                  <Tag>{arc.code}</Tag>
                </div>
                <h3 className="font-display text-[26px] leading-tight mt-2.5 text-chalk">{objet.nom}</h3>
                <p className="text-[13.5px] text-chalk-dim mt-1.5 leading-relaxed flex-1">{objet.resume}</p>
                <div className="mt-4 flex gap-2">
                  <Btn
                    tone="accent"
                    onClick={() => {
                      nouvelleComposition(objet.id);
                      nav("/atelier");
                    }}
                  >
                    Composer
                  </Btn>
                  <span className="font-mono text-[9px] text-chalk-dim/70 self-center">
                    {c.nodes.length} objets · {arc.nom}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
