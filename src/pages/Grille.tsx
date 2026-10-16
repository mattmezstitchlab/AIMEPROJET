import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ARCHETYPES } from "../lib/archetypes";
import { buildComposition } from "../lib/build";
import { supportById } from "../lib/supports";
import { Surface } from "../components/Surface";
import { PageTitre } from "../components/Shell";
import { useAime } from "../lib/store";
import { Btn, Tag } from "../components/ui";
import { styleById } from "../lib/styles";

const GROUPES = ["Axe", "Partition", "Cadre", "Flux", "Trame", "Rupture"];

export default function Grille() {
  const { projet, comp, appliquerArchetype } = useAime();
  const nav = useNavigate();
  const [groupe, setGroupe] = useState("tous");
  const objetId = comp?.objetId ?? "o-faire-part";
  const styleId = comp?.styleId ?? "encre-seche";

  const previews = useMemo(
    () => ARCHETYPES.map((a) => ({ a, c: buildComposition(objetId, a.id, styleId) })),
    [objetId, styleId],
  );

  const liste = previews.filter((p) => groupe === "tous" || p.a.groupe === groupe);
  const sup = supportById(comp?.supportId ?? "carte-a6");

  return (
    <div className="collection-page">
      <PageTitre
        code="03 · Grille Universelle"
        titre="Une information. Vingt-quatre compositions."
        chapeau="La Grille Universelle compte douze colonnes et seize lignes, quel que soit le support. Les vingt-quatre archétypes de la bibliothèque MÉTAMORPHOSE sont des partitions de cette grille, groupées en six familles de composition."
      />

      <div className="sticky top-0 z-30 bg-vault/95 backdrop-blur border-b border-line px-5 sm:px-10 py-3 flex flex-wrap items-center gap-2">
        <Btn active={groupe === "tous"} onClick={() => setGroupe("tous")}>
          Tous
        </Btn>
        {GROUPES.map((g) => (
          <Btn key={g} active={groupe === g} onClick={() => setGroupe(g)}>
            {g}
          </Btn>
        ))}
        <span className="ml-auto font-mono text-[9.5px] text-chalk-dim uppercase tracking-[0.16em]">
          Aperçu sur : {comp?.nom}
        </span>
      </div>

      <div className="px-5 sm:px-10 py-10 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {liste.map(({ a, c }) => (
          <article
            key={a.id}
            className={`border bg-vault-2/30 flex flex-col ${
              comp?.archetypeId === a.id ? "border-vermillon" : "border-line"
            }`}
          >
            <div className="p-4 bg-vault-3/40 flex justify-center">
              <div
                className="w-full shadow-[0_14px_34px_-16px_rgba(0,0,0,0.85)]"
                style={{ maxWidth: sup.w >= sup.h ? "100%" : "70%" }}
              >
                <Surface comp={c} style={styleById(styleId)} support={sup} vars={projet.variables} />
              </div>
            </div>
            <div className="p-4 border-t border-line flex-1 flex flex-col">
              <div className="flex items-center gap-2">
                <Tag color="#617558">{a.code}</Tag>
                <Tag>{a.groupe}</Tag>
              </div>
              <h3 className="font-display text-[22px] leading-tight mt-2 text-chalk">{a.nom}</h3>
              <p className="text-[13px] text-chalk-dim mt-1.5 leading-relaxed flex-1">{a.principe}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <Btn
                  tone="accent"
                  onClick={() => {
                    appliquerArchetype(a.id);
                    nav("/metamorphose?vue=canevas");
                  }}
                >
                  Appliquer
                </Btn>
                <span className="font-mono text-[9px] text-chalk-dim/70">{a.slots.length} emplacements</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
