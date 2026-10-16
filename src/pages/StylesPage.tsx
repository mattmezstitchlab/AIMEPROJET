import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { STYLES } from "../lib/styles";
import { buildComposition } from "../lib/build";
import { supportById } from "../lib/supports";
import { Surface } from "../components/Surface";
import { PageTitre } from "../components/Shell";
import { useAime } from "../lib/store";
import { Btn } from "../components/ui";

export default function StylesPage() {
  const { projet, patchComp, comp } = useAime();
  const nav = useNavigate();
  const apercu = useMemo(() => buildComposition("o-faire-part", "A1", "encre-seche"), []);
  const billet = useMemo(() => buildComposition("o-billet", "B2", "encre-seche"), []);

  return (
    <div className="collection-page">
      <PageTitre
        code="02 · Styles universels"
        titre={`${STYLES.length} directions. Votre expression.`}
        chapeau="Un style est un jeu cohérent de constantes : deux à trois familles typographiques, cinq encres nommées, un rayon, un filet, une texture. Appliqué à une composition, il redéfinit tous les objets sans toucher à leur structure ni à leur contenu."
      />

      <div className="px-5 sm:px-10 py-10 grid gap-8 lg:grid-cols-2">
        {STYLES.map((s) => (
          <article key={s.id} className="border border-line bg-vault-2/30">
            <div className="grid sm:grid-cols-[1fr_auto] gap-4 p-5" style={{ background: s.palette.paper + "0d" }}>
              <div>
                <div className="font-mono text-[9.5px] tracking-[0.22em]" style={{ color: s.palette.accent }}>
                  {s.code}
                </div>
                <h3 className="font-display text-[32px] leading-none mt-1.5 text-chalk">{s.nom}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-chalk-dim max-w-md">{s.principe}</p>
                <div className="mt-4 flex gap-1.5">
                  {(Object.keys(s.palette) as (keyof typeof s.palette)[]).map((k) => (
                    <div key={k} className="text-center">
                      <div className="w-9 h-9 border border-line" style={{ background: s.palette[k] }} />
                      <div className="font-mono text-[7.5px] uppercase tracking-wider text-chalk-dim mt-1">{k}</div>
                    </div>
                  ))}
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[9.5px] text-chalk-dim">
                  <div>TITRAGE · {s.fonts.display.split(",")[0].replace(/'/g, "")}</div>
                  <div>LABEUR · {s.fonts.body.split(",")[0].replace(/'/g, "")}</div>
                  <div>RAYON · {s.radius}px</div>
                  <div>TEXTURE · {s.texture}</div>
                  <div>APPROCHE · {s.tracking}em</div>
                  <div>USAGE · {s.usage}</div>
                </dl>
                <div className="mt-5">
                  <Btn
                    tone="accent"
                    active={comp?.styleId === s.id}
                    onClick={() => {
                      patchComp({ styleId: s.id });
                      nav("/metamorphose?vue=canevas");
                    }}
                  >
                    {comp?.styleId === s.id ? "Style actif" : "Appliquer à la composition"}
                  </Btn>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-[132px] shrink-0 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)]">
                  <Surface comp={apercu} style={s} support={supportById("carte-a6")} vars={projet.variables} />
                </div>
                <div className="w-[168px] shrink-0 hidden sm:block shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)]">
                  <Surface comp={billet} style={s} support={supportById("billet")} vars={projet.variables} />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
