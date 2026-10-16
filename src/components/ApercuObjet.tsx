import { useEffect, useState } from "react";
import type { Composition, AimeStyle, Support } from "../lib/types";
import { Surface } from "./Surface";

type Interaction = "flip" | "ouvrir" | "detacher" | "appliquer" | "aucune";

export function interactionPourSupport(id: string): Interaction {
  if (id === "enveloppe") return "ouvrir";
  if (id === "billet" || id === "ticket") return "detacher";
  if (id === "tampon") return "appliquer";
  if (["carte-a6", "carte-visite", "carte-postale", "sticker", "timbre"].includes(id)) return "flip";
  return "aucune";
}

/**
 * Aperçu interactif léger (CSS 2D/3D). Clavier accessible, alternative
 * statique si la réduction des animations est demandée par le système.
 */
export function ApercuObjet({
  comp,
  style,
  support,
  vars,
}: {
  comp: Composition;
  style: AimeStyle;
  support: Support;
  vars: { cle: string; valeur: string }[];
}) {
  const [actif, setActif] = useState(false);
  const [reduit, setReduit] = useState(false);
  const interaction = interactionPourSupport(support.id);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduit(mq.matches);
    const h = () => setReduit(mq.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  const verso: Composition = {
    ...comp,
    nodes: comp.nodes.filter((n) => n.kind === "table" || n.kind === "code" || n.kind === "sceau").length
      ? comp.nodes.filter((n) => n.kind === "table" || n.kind === "code" || n.kind === "sceau")
      : comp.nodes.slice(-2),
    grille: false,
  };

  const label: Record<Interaction, string> = {
    flip: actif ? "Voir le recto" : "Retourner · voir le verso",
    ouvrir: actif ? "Refermer l'enveloppe" : "Ouvrir l'enveloppe",
    detacher: actif ? "Replacer la souche" : "Détacher la souche",
    appliquer: actif ? "Relever le tampon" : "Appliquer le tampon",
    aucune: "Aperçu statique",
  };

  const duree = reduit ? "0ms" : "620ms";

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div style={{ perspective: 1600, width: "100%" }}>
        <div
          style={{
            position: "relative",
            transformStyle: "preserve-3d",
            transition: `transform ${duree} cubic-bezier(.22,1,.36,1)`,
            transform:
              interaction === "flip" && actif
                ? "rotateY(180deg)"
                : interaction === "appliquer" && actif
                  ? "scale(0.94) rotate(-4deg)"
                  : "none",
          }}
        >
          <div style={{ backfaceVisibility: "hidden" }}>
            <div className="shadow-[0_30px_70px_-25px_rgba(0,0,0,0.85)] relative overflow-hidden">
              <Surface comp={{ ...comp, grille: false }} style={style} support={support} vars={vars} />
              {interaction === "ouvrir" && (
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    transformOrigin: "top",
                    transition: `transform ${duree} cubic-bezier(.22,1,.36,1)`,
                    transform: actif ? "rotateX(-168deg)" : "rotateX(0deg)",
                    background: `linear-gradient(170deg, ${style.palette.muted} 0%, ${style.palette.paper} 100%)`,
                    clipPath: "polygon(0 0, 100% 0, 50% 62%)",
                    borderBottom: `1px solid ${style.palette.ink}22`,
                  }}
                />
              )}
              {interaction === "detacher" && (
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    right: 0,
                    width: "26%",
                    transition: `transform ${duree} cubic-bezier(.22,1,.36,1), opacity ${duree}`,
                    transform: actif ? "translateX(26%) rotate(6deg)" : "none",
                    opacity: actif ? 0.92 : 1,
                    borderLeft: `2px dashed ${style.palette.ink}55`,
                    background: `${style.palette.paper}`,
                    boxShadow: actif ? "-10px 0 24px -12px rgba(0,0,0,.6)" : "none",
                  }}
                >
                  <div
                    className="h-full w-full grid place-items-center font-mono text-[9px] uppercase"
                    style={{ color: style.palette.ink, letterSpacing: "0.2em" }}
                  >
                    souche
                  </div>
                </div>
              )}
              {interaction === "appliquer" && actif && (
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `${style.palette.accent}1f`, mixBlendMode: "multiply" }}
                />
              )}
            </div>
          </div>

          {interaction === "flip" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
              }}
            >
              <div className="shadow-[0_30px_70px_-25px_rgba(0,0,0,0.85)] h-full">
                <Surface comp={verso} style={style} support={support} vars={vars} />
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setActif(!actif)}
        disabled={interaction === "aucune"}
        aria-pressed={actif}
        className="font-mono text-[10px] uppercase tracking-[0.16em] px-4 py-2 border border-line text-chalk-dim hover:text-chalk hover:border-chalk-dim disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {label[interaction]}
      </button>
      {reduit && (
        <p className="font-mono text-[9px] text-chalk-dim">Animations réduites · préférence système respectée</p>
      )}
    </div>
  );
}
