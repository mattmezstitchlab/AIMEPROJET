import type { AimeNode, AimeStyle, Composition, Support } from "./types";
import { interpolate } from "./build";

export function download(name: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function slug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function codeSvg(value: string, color: string, bg: string) {
  const N = 21;
  let seed = hash(value || "aime");
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const inFinder = (x: number, y: number) => (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
  let rects = "";
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++)
      if (!inFinder(x, y) && rnd() > 0.52) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`;
  const finder = (ox: number, oy: number) =>
    `<rect x="${ox}" y="${oy}" width="7" height="7" fill="${color}"/><rect x="${ox + 1}" y="${oy + 1}" width="5" height="5" fill="${bg}"/><rect x="${ox + 2}" y="${oy + 2}" width="3" height="3" fill="${color}"/>`;
  return `<svg viewBox="0 0 ${N} ${N}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges"><rect width="${N}" height="${N}" fill="${bg}"/>${rects}${finder(0, 0)}${finder(N - 7, 0)}${finder(0, N - 7)}</svg>`;
}

function sceauSvg(label: string, color: string, font: string) {
  const id = "a" + hash(label);
  return `<svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"><defs><path id="${id}" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"/></defs><circle cx="50" cy="50" r="47" fill="none" stroke="${color}" stroke-width="1.4"/><circle cx="50" cy="50" r="41" fill="none" stroke="${color}" stroke-width="0.7" stroke-dasharray="2 2.4"/><text fill="${color}" font-size="7.5" font-family="${font}" letter-spacing="2.4"><textPath href="#${id}" startOffset="50%" text-anchor="middle">AIME · OBJET AUTHENTIFIÉ ·</textPath></text><text x="50" y="57" text-anchor="middle" fill="${color}" font-size="${label.length > 6 ? 12 : 18}" font-family="${font}">${esc(label)}</text></svg>`;
}

export function compositionJSON(
  comp: Composition,
  style: AimeStyle,
  support: Support,
  vars: { cle: string; valeur: string; note?: string }[],
  projetNom: string,
) {
  return JSON.stringify(
    {
      format: "aime.composition",
      version: "1.0",
      genere: new Date().toISOString(),
      projet: { nom: projetNom, variables: vars },
      composition: {
        id: comp.id,
        nom: comp.nom,
        objet: comp.objetId,
        archetype: comp.archetypeId,
        grille: { colonnes: 12, lignes: 16 },
        support: { id: support.id, nom: support.nom, largeur: support.w, hauteur: support.h, unite: support.unite },
        style: { id: style.id, nom: style.nom, palette: style.palette, polices: style.fonts },
        fondPerdu: comp.fondPerdu ? "3 mm" : "aucun",
        objets: comp.nodes
          .filter((n) => n.exportable)
          .map((n) => ({
            id: n.id,
            nom: n.nom,
            role: n.role,
            type: n.kind,
            geometrie: { x: n.x, y: n.y, l: n.w, h: n.h, rotation: n.rot },
            typographie: {
              police: n.font,
              corps: n.size,
              graisse: n.weight,
              interligne: n.leading,
              approche: n.tracking,
              casse: n.casse,
              italique: n.italique,
            },
            chromie: { encre: n.ink, fond: n.fill, filet: n.stroke, epaisseur: n.strokeW, rayon: n.radius, opacite: n.opacity },
            contenu: { texte: n.text, donnees: n.rows, media: n.src },
            comportement: { lien: n.lien ?? null, etat: n.etat, verrouille: n.locked, exportable: n.exportable },
          })),
      },
    },
    null,
    2,
  );
}

export function compositionHTML(
  comp: Composition,
  style: AimeStyle,
  support: Support,
  vars: { cle: string; valeur: string }[],
  origin: string,
) {
  const col = (t: AimeNode["ink"]) => (t === "none" ? "transparent" : style.palette[t]);
  const famille = (n: AimeNode) =>
    n.font === "display" ? style.fonts.display : n.font === "mono" ? style.fonts.mono : style.fonts.body;

  const body = comp.nodes
    .filter((n) => n.exportable)
    .map((n) => {
      const pos = `left:${(n.x / 12) * 100}%;top:${(n.y / 16) * 100}%;width:${(n.w / 12) * 100}%;height:${(n.h / 16) * 100}%;opacity:${n.opacity};${n.rot ? `transform:rotate(${n.rot}deg);` : ""}overflow:hidden;position:absolute;`;
      const typo = `font-family:${famille(n)};font-size:${n.size}cqw;font-weight:${n.weight};line-height:${n.leading};letter-spacing:${n.tracking}em;color:${col(n.ink)};text-align:${n.align};${n.italique ? "font-style:italic;" : ""}${n.casse === "capitales" ? "text-transform:uppercase;" : n.casse === "bas-de-casse" ? "text-transform:lowercase;" : ""}white-space:pre-wrap;`;
      const txt = esc(interpolate(n.text ?? "", vars));
      switch (n.kind) {
        case "titre":
        case "texte":
        case "numero":
        case "symbole":
          return `<div style="${pos}"><div style="${typo}">${txt}</div></div>`;
        case "table":
          return `<div style="${pos}display:flex;flex-direction:column;gap:${n.size * 0.45}cqw;">${(n.rows ?? [])
            .map(
              (r) =>
                `<div style="display:flex;justify-content:space-between;gap:1em;border-bottom:1px dotted ${col(n.ink)}55;padding-bottom:.25em;${typo}"><span style="opacity:.62;text-transform:uppercase;letter-spacing:.12em;font-size:${n.size * 0.84}cqw">${esc(interpolate(r.k, vars))}</span><span>${esc(interpolate(r.v, vars))}</span></div>`,
            )
            .join("")}</div>`;
        case "image":
          return `<div style="${pos}"><img src="${origin}${n.src}" alt="${esc(n.nom)}" style="width:100%;height:100%;object-fit:cover;border-radius:${n.radius || style.radius}px"/></div>`;
        case "filet":
          return `<div style="${pos}background:${n.fill === "none" ? col(n.ink) : col(n.fill)}"></div>`;
        case "forme":
          return `<div style="${pos}background:${col(n.fill)};border:${n.strokeW ? `${n.strokeW * 6}px solid ${col(n.stroke)}` : "none"};border-radius:${n.radius || style.radius}px"></div>`;
        case "code":
          return `<div style="${pos}">${codeSvg(interpolate(n.text, vars), col(n.ink), style.palette.paper)}</div>`;
        case "sceau":
          return `<div style="${pos}">${sceauSvg(interpolate(n.text, vars) || "AIME", col(n.ink), style.fonts.mono)}</div>`;
        default:
          return "";
      }
    })
    .join("\n    ");

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="generator" content="AIME — Bibliothèque Universelle d'Objets Typés V1"/>
<title>${esc(comp.nom)} — AIME</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..700&family=Spectral:ital,wght@0,300;0,400;0,600;1,300;1,400&family=IBM+Plex+Mono:wght@300;400;500;600&family=Syne:wght@400..800&family=Cormorant+Garamond:ital,wght@0,300..700;1,300..600&family=DM+Serif+Display:ital@0;1&family=Fraunces:ital,opsz,wght@0,9..144,300..900&family=Oswald:wght@300..700&family=Archivo:wght@400..800&display=swap" rel="stylesheet">
<style>
  body{margin:0;background:#14120f;display:grid;place-items:center;min-height:100vh;padding:4vmin}
  .aime-surface{position:relative;overflow:hidden;container-type:inline-size;background:${style.palette.paper};
    width:min(92vw, ${(support.w / support.h) * 80}vh);aspect-ratio:${support.w}/${support.h};
    box-shadow:0 40px 80px -30px rgba(0,0,0,.8)}
</style>
</head>
<body>
  <main class="aime-surface" data-objet="${esc(comp.objetId)}" data-archetype="${esc(comp.archetypeId)}">
    ${body}
  </main>
</body>
</html>`;
}
