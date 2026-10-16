import type { AimeNode, AimeStyle, Token } from "../lib/types";
import { interpolate } from "../lib/build";

export function tokenColor(style: AimeStyle, t: Token): string {
  if (t === "none") return "transparent";
  return style.palette[t];
}

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function CodeMatrix({ value, color, bg }: { value: string; color: string; bg: string }) {
  const N = 21;
  let seed = hash(value || "aime");
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const inFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) if (!inFinder(x, y) && rnd() > 0.52) cells.push({ x, y });
  const finder = (ox: number, oy: number) => (
    <g key={`${ox}-${oy}`}>
      <rect x={ox} y={oy} width={7} height={7} fill={color} />
      <rect x={ox + 1} y={oy + 1} width={5} height={5} fill={bg} />
      <rect x={ox + 2} y={oy + 2} width={3} height={3} fill={color} />
    </g>
  );
  return (
    <svg viewBox={`0 0 ${N} ${N}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" shapeRendering="crispEdges">
      <rect width={N} height={N} fill={bg} />
      {cells.map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width={1} height={1} fill={color} />
      ))}
      {finder(0, 0)}
      {finder(N - 7, 0)}
      {finder(0, N - 7)}
    </svg>
  );
}

export function Sceau({ label, color, font }: { label: string; color: string; font: string }) {
  const id = "arc-" + hash(label);
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <path id={id} d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
      </defs>
      <circle cx="50" cy="50" r="47" fill="none" stroke={color} strokeWidth="1.4" />
      <circle cx="50" cy="50" r="41" fill="none" stroke={color} strokeWidth="0.7" strokeDasharray="2 2.4" />
      <text fill={color} fontSize="7.5" fontFamily={font} letterSpacing="2.4">
        <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
          AIME · CRÉATION DÉCORATIVE ·
        </textPath>
      </text>
      <text
        x="50"
        y="57"
        textAnchor="middle"
        fill={color}
        fontSize={label.length > 6 ? 12 : 18}
        fontFamily={font}
        letterSpacing="1"
      >
        {label}
      </text>
    </svg>
  );
}

export function NodeBody({
  node,
  style,
  vars,
}: {
  node: AimeNode;
  style: AimeStyle;
  vars: { cle: string; valeur: string }[];
}) {
  const ink = tokenColor(style, node.ink);
  const fill = tokenColor(style, node.fill);
  const stroke = tokenColor(style, node.stroke);
  const family =
    node.font === "display" ? style.fonts.display : node.font === "mono" ? style.fonts.mono : style.fonts.body;
  const text = interpolate(node.text ?? "", vars);

  const justify = node.align === "center" ? "center" : node.align === "right" ? "flex-end" : "flex-start";

  const textStyle: React.CSSProperties = {
    fontFamily: family,
    fontSize: `${node.size}cqw`,
    fontWeight: node.weight,
    letterSpacing: `${node.tracking + (node.role === "titre" && style.majTitre ? 0.04 : 0)}em`,
    lineHeight: node.leading,
    color: ink,
    textAlign: node.align,
    fontStyle: node.italique ? "italic" : "normal",
    textTransform:
      node.casse === "capitales"
        ? "uppercase"
        : node.casse === "bas-de-casse"
          ? "lowercase"
          : node.role === "titre" && style.majTitre
            ? "uppercase"
            : "none",
    width: "100%",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };

  switch (node.kind) {
    case "titre":
    case "texte":
    case "numero":
      return (
        <div style={{ display: "flex", justifyContent: justify, alignItems: "flex-start", height: "100%" }}>
          <div style={textStyle}>{text}</div>
        </div>
      );
    case "table":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: `${node.size * 0.45}cqw`, height: "100%" }}>
          {(node.rows ?? []).map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "0.6em",
                borderBottom: `1px dotted ${ink}55`,
                paddingBottom: "0.25em",
                flexDirection: node.align === "right" ? "row-reverse" : "row",
              }}
            >
              <span
                style={{
                  ...textStyle,
                  width: "auto",
                  flex: "0 0 auto",
                  opacity: 0.62,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  fontSize: `${node.size * 0.84}cqw`,
                }}
              >
                {interpolate(r.k, vars)}
              </span>
              <span style={{ flex: 1, borderBottom: "none" }} />
              <span
                style={{
                  ...textStyle,
                  width: "auto",
                  flex: "0 1 auto",
                  textAlign: node.align === "right" ? "left" : "right",
                }}
              >
                {interpolate(r.v, vars)}
              </span>
            </div>
          ))}
        </div>
      );
    case "image":
      if (!interpolate(node.src ?? "", vars)) return <div aria-label="Ajoutez une photo dans les informations du projet" style={{ width: "100%", height: "100%", background: style.palette.muted, borderRadius: node.radius || style.radius }} />;
      return (
        <img
          src={interpolate(node.src ?? "", vars) || undefined}
          alt={node.nom}
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: node.radius ? `${node.radius}px` : style.radius ? `${style.radius}px` : 0,
            filter: style.id === "risographie" ? "grayscale(1) contrast(1.25)" : undefined,
            mixBlendMode: style.id === "risographie" ? "multiply" : undefined,
          }}
        />
      );
    case "filet":
      return <div style={{ width: "100%", height: "100%", background: fill === "transparent" ? ink : fill }} />;
    case "forme":
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: fill,
            border: node.strokeW ? `${node.strokeW * 6}px solid ${stroke}` : "none",
            borderRadius: node.radius ? `${node.radius}px` : style.radius ? `${style.radius}px` : 0,
          }}
        />
      );
    case "code":
      return <CodeMatrix value={text} color={ink} bg={style.palette.paper} />;
    case "sceau":
      return <Sceau label={text || "AIME"} color={ink} font={style.fonts.mono} />;
    case "symbole":
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: justify, height: "100%" }}>
          <span style={{ ...textStyle, fontSize: `${node.size * 2.4}cqw`, width: "auto" }}>{text || "✻"}</span>
        </div>
      );
    default:
      return null;
  }
}

export function textureStyle(style: AimeStyle): React.CSSProperties {
  const a = style.palette.accent;
  switch (style.texture) {
    case "grain":
      return {
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        opacity: 0.09,
      };
    case "lignes":
      return {
        backgroundImage: `repeating-linear-gradient(0deg, ${a}22 0 1px, transparent 1px 7px)`,
        opacity: 0.5,
      };
    case "points":
      return {
        backgroundImage: `radial-gradient(${a}33 1px, transparent 1.4px)`,
        backgroundSize: "10px 10px",
        opacity: 0.7,
      };
    case "degrade":
      return {
        backgroundImage: `radial-gradient(120% 90% at 10% 0%, ${a}22 0%, transparent 60%)`,
      };
    case "halo":
      return {
        backgroundImage: `radial-gradient(90% 70% at 50% 0%, ${a}1f 0%, transparent 65%)`,
      };
    default:
      return {};
  }
}
