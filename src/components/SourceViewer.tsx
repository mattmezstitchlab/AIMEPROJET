import { useCallback, useEffect, useRef, useState } from "react";
import type { Bloc, SourceDoc } from "../lib/types";
import { ExternalLink, MousePointerSquareDashed } from "lucide-react";

type Rect = { x: number; y: number; w: number; h: number };

export function SourceViewer({
  source,
  selection,
  setSelection,
  mode,
  onZone,
}: {
  source: SourceDoc;
  selection: string[];
  setSelection: (ids: string[]) => void;
  mode: "lecture" | "selection";
  onZone: (z: Rect | undefined) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);

  const finir = useCallback(() => {
    const box = boxRef.current;
    if (!start.current || !box || !rect) {
      start.current = null;
      setRect(null);
      return;
    }
    const br = box.getBoundingClientRect();
    const ids: string[] = [];
    box.querySelectorAll<HTMLElement>("[data-bloc]").forEach((el) => {
      const r = el.getBoundingClientRect();
      const x = r.left - br.left + box.scrollLeft;
      const y = r.top - br.top + box.scrollTop;
      const chevauche = x < rect.x + rect.w && x + r.width > rect.x && y < rect.y + rect.h && y + r.height > rect.y;
      if (chevauche) ids.push(el.dataset.bloc!);
    });
    if (ids.length) {
      setSelection(Array.from(new Set([...selection, ...ids])));
      onZone({
        x: +((rect.x / box.scrollWidth) * 100).toFixed(1),
        y: +((rect.y / box.scrollHeight) * 100).toFixed(1),
        w: +((rect.w / box.scrollWidth) * 100).toFixed(1),
        h: +((rect.h / box.scrollHeight) * 100).toFixed(1),
      });
    }
    start.current = null;
    setRect(null);
  }, [rect, selection, setSelection, onZone]);

  useEffect(() => {
    if (mode !== "selection") return;
    const move = (e: PointerEvent) => {
      const box = boxRef.current;
      if (!start.current || !box) return;
      const br = box.getBoundingClientRect();
      const cx = e.clientX - br.left + box.scrollLeft;
      const cy = e.clientY - br.top + box.scrollTop;
      setRect({
        x: Math.min(cx, start.current.x),
        y: Math.min(cy, start.current.y),
        w: Math.abs(cx - start.current.x),
        h: Math.abs(cy - start.current.y),
      });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finir);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finir);
    };
  }, [mode, finir]);

  const toggle = (id: string) =>
    setSelection(selection.includes(id) ? selection.filter((x) => x !== id) : [...selection, id]);

  return (
    <div className="h-full flex flex-col border border-line bg-vault">
      <div className="px-3 py-2 border-b border-line flex items-center gap-2 flex-wrap">
        <span
          className="font-mono text-[9px] uppercase tracking-[0.16em] px-1.5 py-0.5 border"
          style={{
            borderColor: source.statut === "ok" ? "#85a07c" : source.statut === "partiel" ? "#c9a227" : "#d4512a",
            color: source.statut === "ok" ? "#85a07c" : source.statut === "partiel" ? "#c9a227" : "#d4512a",
          }}
        >
          {source.statut}
        </span>
        <span className="font-body text-[14px] text-chalk truncate max-w-[280px]">{source.nom}</span>
        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer noopener"
            className="font-mono text-[9px] text-chalk-dim hover:text-vermillon inline-flex items-center gap-1 truncate max-w-[220px]"
          >
            <ExternalLink size={10} /> {source.url}
          </a>
        )}
        <span className="ml-auto font-mono text-[9px] text-chalk-dim uppercase tracking-[0.14em]">
          {source.blocs.length} blocs · {selection.length} sélectionnés
        </span>
      </div>

      {source.note && (
        <p className="px-3 py-2 border-b border-line font-mono text-[9.5px] leading-relaxed text-chalk-dim">
          {source.note}
        </p>
      )}

      <div
        ref={boxRef}
        className="relative flex-1 overflow-auto scroll-thin p-5"
        style={{ cursor: mode === "selection" ? "crosshair" : "default", userSelect: mode === "selection" ? "none" : "auto" }}
        onPointerDown={(e) => {
          if (mode !== "selection" || e.button !== 0) return;
          const box = boxRef.current!;
          const br = box.getBoundingClientRect();
          start.current = { x: e.clientX - br.left + box.scrollLeft, y: e.clientY - br.top + box.scrollTop };
          setRect(null);
        }}
      >
        {!source.blocs.length && (
          <div className="h-full grid place-items-center text-center px-6">
            <div>
              <MousePointerSquareDashed size={22} className="mx-auto text-chalk-dim/50" />
              <p className="mt-3 text-[15px] text-chalk-dim max-w-sm leading-relaxed">
                Aucun contenu exploitable n'a pu être récupéré pour cette source. Importez un document, un
                texte ou une image autorisée, ou utilisez une page locale de démonstration.
              </p>
            </div>
          </div>
        )}

        <div className="max-w-[680px] mx-auto space-y-2.5">
          {source.blocs.map((b) => (
            <BlocVue key={b.id} bloc={b} actif={selection.includes(b.id)} onClick={() => mode === "selection" && toggle(b.id)} mode={mode} />
          ))}
        </div>

        {rect && rect.w > 3 && (
          <div
            className="absolute border-2 pointer-events-none"
            style={{
              left: rect.x,
              top: rect.y,
              width: rect.w,
              height: rect.h,
              borderColor: "#d4512a",
              background: "rgba(212,81,42,0.12)",
            }}
          />
        )}
      </div>
    </div>
  );
}

function BlocVue({
  bloc,
  actif,
  onClick,
  mode,
}: {
  bloc: Bloc;
  actif: boolean;
  onClick: () => void;
  mode: "lecture" | "selection";
}) {
  const base = `relative transition-colors ${
    mode === "selection" ? "cursor-pointer" : ""
  } ${actif ? "outline outline-2 outline-vermillon bg-vermillon/10" : mode === "selection" ? "hover:bg-vault-2" : ""}`;

  const commun = {
    "data-bloc": bloc.id,
    onClick,
    role: mode === "selection" ? "button" : undefined,
    tabIndex: mode === "selection" ? 0 : undefined,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (mode === "selection" && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onClick();
      }
    },
  };

  if (bloc.type === "image")
    return (
      <figure {...commun} className={`${base} p-2`}>
        <img src={bloc.src} alt={bloc.texte ?? ""} className="w-full max-h-[260px] object-cover" draggable={false} />
        <figcaption className="font-mono text-[9px] text-chalk-dim mt-1.5">{bloc.texte}</figcaption>
      </figure>
    );

  if (bloc.type === "tableau")
    return (
      <div {...commun} className={`${base} p-2 border border-line/60`}>
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-chalk-dim mb-1.5">{bloc.texte}</p>
        <table className="w-full">
          <tbody>
            {(bloc.rows ?? []).map((r, i) => (
              <tr key={i} className="border-b border-line/40">
                <td className="font-mono text-[11px] text-chalk-dim py-1 pr-3 align-top w-[40%]">{r.k}</td>
                <td className="text-[13.5px] text-chalk py-1">{r.v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

  if (bloc.type === "liste")
    return (
      <ul {...commun} className={`${base} p-2 space-y-1`}>
        {(bloc.items ?? [bloc.texte ?? ""]).map((it, i) => (
          <li key={i} className="text-[14.5px] text-chalk-dim leading-relaxed flex gap-2">
            <span className="text-vermillon font-mono text-[10px] mt-1">—</span>
            {it}
          </li>
        ))}
      </ul>
    );

  if (bloc.type === "lien")
    return (
      <div {...commun} className={`${base} p-2`}>
        <span className="font-mono text-[12px] text-sauge underline underline-offset-4 break-all">{bloc.texte}</span>
        <span className="block font-mono text-[9px] text-chalk-dim mt-0.5 break-all">{bloc.href}</span>
      </div>
    );

  if (bloc.type === "titre") {
    const taille = bloc.niveau === 1 ? "text-[30px]" : bloc.niveau === 2 ? "text-[23px]" : "text-[19px]";
    return (
      <div {...commun} className={`${base} p-2`}>
        <p className={`font-display ${taille} leading-tight text-chalk`}>{bloc.texte}</p>
      </div>
    );
  }

  return (
    <div {...commun} className={`${base} p-2`}>
      <p className="text-[14.5px] leading-[1.65] text-chalk-dim">{bloc.texte}</p>
    </div>
  );
}
