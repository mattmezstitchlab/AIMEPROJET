export type Showcase = {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string;
  image: string;
  mode: "site" | "image";
  x: number;
  y: number;
  zoom: number;
};
export const initialShowcases: Showcase[] = [
  {
    id: "pointzero",
    title: "POINTZERO",
    category: "01 / Atelier numérique",
    description:
      "Un terrain d’expérimentation pour relier les idées, les outils et la création. Explorez le projet, un détail à la fois.",
    url: "https://pointzero-git-vercel-ag-f5cca0-matthieulecointre-9534s-projects.vercel.app",
    image: "",
    mode: "site",
    x: 0,
    y: 0,
    zoom: 1,
  },
  {
    id: "aime",
    title: "AIME",
    category: "02 / Création vivante",
    description:
      "Une page personnelle qui devient une carte, un document, un espace à soi. Une même idée, plusieurs expressions.",
    url: "https://aimeprojet.vercel.app/espace",
    image: "/img/byaime/hero.webp",
    mode: "site",
    x: 0,
    y: 0,
    zoom: 1,
  },
];
export function webUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !u.username && !u.password;
  } catch {
    return false;
  }
}
export function readShowcases(raw: string | null): Showcase[] {
  try {
    const data: unknown = JSON.parse(raw ?? "null");
    if (!Array.isArray(data) || !data.length || data.length > 100)
      return initialShowcases;
    if (
      !data.every(
        (p) =>
          p &&
          typeof p.id === "string" &&
          typeof p.title === "string" &&
          typeof p.category === "string" &&
          typeof p.description === "string" &&
          webUrl(p.url) &&
          typeof p.image === "string" &&
          (!p.image || webUrl(p.image) || p.image.startsWith("/img/")) &&
          ["site", "image"].includes(p.mode) &&
          [p.x, p.y].every(
            (n) =>
              typeof n === "number" &&
              Number.isFinite(n) &&
              n >= -1600 &&
              n <= 0,
          ) &&
          typeof p.zoom === "number" &&
          p.zoom >= 0.4 &&
          p.zoom <= 2,
      )
    )
      return initialShowcases;
    return data;
  } catch {
    return initialShowcases;
  }
}
