import { useState } from "react";
import { ChevronDown, ChevronUp, Hand, Minus, MousePointerSquareDashed, Plus, Undo2 } from "lucide-react";
import { useAime } from "../lib/store";
import { Btn } from "./ui";

export type ZoneAime = "ai" | "plus" | "me" | null;

export function Dock({
  outil,
  setOutil,
  zoom,
  setZoom,
  zone,
  setZone,
}: {
  outil: "pointeur" | "selection";
  setOutil: (o: "pointeur" | "selection") => void;
  zoom: number;
  setZoom: (z: number) => void;
  zone: ZoneAime;
  setZone: (z: ZoneAime) => void;
}) {
  const { annuler, peutAnnuler, projet } = useAime();
  const [replie, setReplie] = useState(false);

  return (
    <div className="no-print pointer-events-none fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-3 px-3">
      <div className="pointer-events-auto border border-line bg-vault/95 backdrop-blur shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.9)]">
        {!replie && (
          <div className="flex items-center gap-2 px-2.5 py-2 flex-wrap justify-center">
            <div className="flex gap-1">
              <Btn active={outil === "pointeur"} onClick={() => setOutil("pointeur")} title="Déplacer / éditer">
                <Hand size={12} />
              </Btn>
              <Btn active={outil === "selection"} onClick={() => setOutil("selection")} title="Sélectionner des zones">
                <MousePointerSquareDashed size={12} />
              </Btn>
              <Btn onClick={annuler} tone={peutAnnuler ? "accent" : "neutre"} title="Annuler la dernière métamorphose">
                <Undo2 size={12} />
              </Btn>
            </div>

            <div className="flex items-center gap-1 border border-line px-1.5 py-0.5">
              <button onClick={() => setZoom(Math.max(0.4, +(zoom - 0.1).toFixed(2)))} className="text-chalk-dim hover:text-chalk p-1">
                <Minus size={11} />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="font-mono text-[10px] text-chalk w-[42px] text-center hover:text-vermillon"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button onClick={() => setZoom(Math.min(2, +(zoom + 0.1).toFixed(2)))} className="text-chalk-dim hover:text-chalk p-1">
                <Plus size={11} />
              </button>
            </div>

            <div className="flex items-stretch border border-line">
              {(
                [
                  ["ai", "AI", "Comprendre, proposer, guider"],
                  ["plus", "+", "Créer, importer, ajouter"],
                  ["me", "ME", "Informations partagées, préférences, créations"],
                ] as [ZoneAime, string, string][]
              ).map(([z, l, t]) => (
                <button
                  key={l}
                  title={t}
                  onClick={() => setZone(zone === z ? null : z)}
                  className={`px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] border-r border-line last:border-r-0 transition-colors ${
                    zone === z ? "bg-vermillon text-vault" : "text-chalk-dim hover:text-chalk hover:bg-vault-2"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <span className="font-mono text-[9px] text-chalk-dim uppercase tracking-[0.14em] hidden sm:inline">
              {projet.fragments.length} fragments · {projet.compositions.length} compositions
            </span>
          </div>
        )}
        <button
          onClick={() => setReplie(!replie)}
          className="w-full flex items-center justify-center gap-1 border-t border-line py-0.5 text-chalk-dim hover:text-chalk font-mono text-[8.5px] uppercase tracking-[0.2em]"
        >
          {replie ? <ChevronUp size={10} /> : <ChevronDown size={10} />} dock
        </button>
      </div>
    </div>
  );
}
