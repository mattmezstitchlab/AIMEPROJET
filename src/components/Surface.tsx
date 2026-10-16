import { useMemo } from "react";
import type { AimeNode, AimeStyle, Composition, Support } from "../lib/types";
import { NodeBody, textureStyle } from "./render";

/** Rendu statique d'une composition : utilisé pour les aperçus (styles, archétypes, galerie). */
export function Surface({
  comp,
  style,
  support,
  vars,
  className = "",
  width,
}: {
  comp: Composition;
  style: AimeStyle;
  support: Support;
  vars: { cle: string; valeur: string }[];
  className?: string;
  width?: number;
}) {
  const ratio = support.w / support.h;
  const tex = useMemo(() => textureStyle(style), [style]);
  return (
    <div
      className={className}
      data-artwork="true"
      style={{
        aspectRatio: ratio,
        width: width ? `${width}px` : "100%",
        background: style.palette.paper,
        position: "relative",
        overflow: "hidden",
        containerType: "inline-size",
      }}
    >
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", ...tex }} />
      {comp.nodes.map((n: AimeNode) => (
        <div
          key={n.id}
          style={{
            position: "absolute",
            left: `${(n.x / 12) * 100}%`,
            top: `${(n.y / 16) * 100}%`,
            width: `${(n.w / 12) * 100}%`,
            height: `${(n.h / 16) * 100}%`,
            transform: n.rot ? `rotate(${n.rot}deg)` : undefined,
            opacity: n.opacity,
            overflow: "hidden",
          }}
        >
          <NodeBody node={n} style={style} vars={vars} />
        </div>
      ))}
    </div>
  );
}
