import { useEffect, useRef, useState } from "react";
import type { AimeNode } from "../lib/types";
import { useAime } from "../lib/store";
import { NodeBody, textureStyle } from "./render";
import { EditableText } from "./EditableText";

type Drag = { id: string; mode: "move" | "resize"; px: number; py: number; n: AimeNode } | null;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function Canvas({
  innerRef,
  clean = false,
}: {
  innerRef: React.RefObject<HTMLDivElement | null>;
  clean?: boolean;
}) {
  const { comp, style, support, selId, setSelId, update, removeNode, projet } = useAime();
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [, force] = useState(0);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      const box = boxRef.current;
      if (!d || !box) return;
      const r = box.getBoundingClientRect();
      const cw = r.width / 12;
      const ch = r.height / 16;
      const dx = (e.clientX - d.px) / cw;
      const dy = (e.clientY - d.py) / ch;
      const snap = (v: number) => (e.altKey ? Math.round(v * 100) / 100 : Math.round(v * 4) / 4);
      if (d.mode === "move") {
        update(d.id, { x: clamp(snap(d.n.x + dx), -5, 12), y: clamp(snap(d.n.y + dy), -5, 16) });
      } else {
        update(d.id, {
          w: clamp(snap(d.n.w + dx), 0.3, 18),
          h: clamp(snap(d.n.h + dy), 0.06, 20),
        });
      }
    };
    const up = () => {
      if (drag.current) {
        drag.current = null;
        force((x) => x + 1);
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [update]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (!selId || editing || (e.target instanceof HTMLElement && (e.target.matches("input, textarea, select") || e.target.isContentEditable))) return;
      const n = comp.nodes.find((x) => x.id === selId);
      if (!n || n.locked) return;
      const step = e.shiftKey ? 1 : 0.25;
      const map: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };
      if (map[e.key]) {
        e.preventDefault();
        update(n.id, { x: n.x + map[e.key][0], y: n.y + map[e.key][1] });
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        removeNode(n.id);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [selId, comp.nodes, update, removeNode, editing]);

  const bleedX = (3 / support.w) * 100;
  const bleedY = (3 / support.h) * 100;

  return (
    <div
      ref={innerRef}
      data-artwork="true"
      className="print-area relative shadow-[0_30px_80px_-20px_rgba(0,0,0,0.75)]"
      style={{
        aspectRatio: support.w / support.h,
        width: "100%",
        background: style.palette.paper,
        containerType: "inline-size",
        overflow: "hidden",
      }}
      onPointerDown={() => setSelId(null)}
    >
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", ...textureStyle(style) }} />
      <div ref={boxRef} className="absolute inset-0">
        {comp.grille && !clean && (
          <div
            className="no-print absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, ${style.palette.ink}14 1px, transparent 1px), linear-gradient(to bottom, ${style.palette.ink}0e 1px, transparent 1px)`,
              backgroundSize: `${100 / 12}% ${100 / 16}%`,
            }}
          />
        )}
        {comp.fondPerdu && !clean && (
          <div
            className="no-print absolute pointer-events-none border border-dashed"
            style={{
              inset: `${bleedY}% ${bleedX}%`,
              borderColor: `${style.palette.accent}99`,
            }}
          />
        )}

        {comp.nodes
          .filter((n) => !clean || n.exportable)
          .map((n) => {
          const selected = n.id === selId && !clean;
          const isText = ["titre", "texte", "numero"].includes(n.kind);
          return (
            <div
              key={n.id}
              onPointerDown={(e) => {
                e.stopPropagation();
                setSelId(n.id);
                if (n.locked || editing === n.id) return;
                drag.current = { id: n.id, mode: "move", px: e.clientX, py: e.clientY, n };
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (isText && !n.locked) setEditing(n.id);
              }}
              style={{
                position: "absolute",
                left: `${(n.x / 12) * 100}%`,
                top: `${(n.y / 16) * 100}%`,
                width: `${(n.w / 12) * 100}%`,
                height: `${(n.h / 16) * 100}%`,
                transform: n.rot ? `rotate(${n.rot}deg)` : undefined,
                opacity: n.opacity,
                cursor: n.locked ? "not-allowed" : editing === n.id ? "text" : "grab",
                outline: selected ? `1.5px solid ${style.palette.accent}` : "none",
                outlineOffset: 2,
                overflow: editing === n.id ? "visible" : "hidden",
              }}
            >
              {editing === n.id ? (
                <EditableText
                  value={n.text}
                  onCommit={(v) => {
                    update(n.id, { text: v });
                    setEditing(null);
                  }}
                  style={{
                    fontFamily:
                      n.font === "display" ? style.fonts.display : n.font === "mono" ? style.fonts.mono : style.fonts.body,
                    fontSize: `${n.size}cqw`,
                    lineHeight: n.leading,
                    letterSpacing: `${n.tracking}em`,
                    color: style.palette.ink,
                    textAlign: n.align,
                    fontWeight: n.weight,
                    whiteSpace: "pre-wrap",
                    minHeight: "100%",
                    background: `${style.palette.paper}dd`,
                  }}
                />
              ) : (
                <NodeBody node={n} style={style} vars={projet.variables} />
              )}

              {selected && !n.locked && (
                <div
                  className="no-print absolute"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    drag.current = { id: n.id, mode: "resize", px: e.clientX, py: e.clientY, n };
                  }}
                  style={{
                    right: -5,
                    bottom: -5,
                    width: 11,
                    height: 11,
                    background: style.palette.accent,
                    cursor: "nwse-resize",
                    borderRadius: 1,
                  }}
                />
              )}
              {selected && (
                <div
                  className="no-print absolute whitespace-nowrap"
                  style={{
                    top: -17,
                    left: 0,
                    fontSize: 9,
                    fontFamily: "'IBM Plex Mono', monospace",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    background: style.palette.accent,
                    color: style.palette.paper,
                    padding: "1px 5px",
                  }}
                >
                  {n.nom}
                </div>
              )}
            </div>
          );
        })}

        {comp.reperes && (
          <div className="absolute inset-0 pointer-events-none">
            {[
              { top: 0, left: 0 },
              { top: 0, right: 0 },
              { bottom: 0, left: 0 },
              { bottom: 0, right: 0 },
            ].map((p, i) => (
              <div key={i} className="absolute" style={{ ...p, width: 18, height: 18 }}>
                <div style={{ position: "absolute", inset: 0, borderTop: `1px solid ${style.palette.ink}`, width: 18, top: 9 }} />
                <div style={{ position: "absolute", inset: 0, borderLeft: `1px solid ${style.palette.ink}`, height: 18, left: 9 }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
