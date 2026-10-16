import { NavLink, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV = [
  { to: "/", code: "◌", label: "Découvrir AIME" },
  { to: "/espace", code: "◆", label: "Mon espace" },
  { to: "/metamorphose", code: "◇", label: "Canevas" },
  { to: "/informations", code: "↗", label: "Informations" },
  { to: "/poste", code: "✉", label: "Poste" },
  { to: "/kits", code: "▣", label: "Kits & livraisons" },
  { to: "/vision", code: "00", label: "Vision" },
  { to: "/bibliotheque", code: "01", label: "Bibliothèque" },
  { to: "/styles", code: "02", label: "Styles" },
  { to: "/grille", code: "03", label: "Grille" },
  { to: "/atelier", code: "04", label: "Atelier" },
  { to: "/specification", code: "05", label: "Spécification" },
];

export function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const plein = loc.pathname === "/atelier";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <aside className="no-print lg:fixed lg:inset-y-0 lg:left-0 lg:w-[208px] border-b lg:border-b-0 lg:border-r border-line bg-vault z-40 flex lg:flex-col">
        <div className="flex lg:flex-col w-full">
          <div className="flex items-center justify-between px-4 py-3 lg:py-5 lg:border-b border-line w-full">
            <NavLink to="/" className="group" title="Revenir à l’espace AIME Studio">
              <div className="font-display text-[26px] leading-none tracking-[0.12em] text-chalk">
                AIME<span className="text-vermillon">®</span>
              </div>
              <div className="font-mono text-[8.5px] uppercase tracking-[0.22em] text-chalk-dim mt-1">
                Studio de création
              </div>
            </NavLink>
            <button className="lg:hidden text-chalk-dim" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          <nav
            className={`${open ? "block" : "hidden"} lg:block absolute lg:static top-full left-0 right-0 bg-vault border-b lg:border-0 border-line`}
          >
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-baseline gap-3 px-4 py-2.5 border-b border-line/50 transition-colors ${
                    isActive ? "bg-vault-2 text-chalk" : "text-chalk-dim hover:text-chalk hover:bg-vault-2/60"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`font-mono text-[9px] ${isActive ? "text-vermillon" : "text-chalk-dim/60"}`}>
                      {n.code}
                    </span>
                    <span className="font-body text-[15px] tracking-wide">{n.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden lg:block mt-auto p-4 border-t border-line">
          <p className="font-mono text-[9px] leading-relaxed text-chalk-dim/70 uppercase tracking-[0.14em]">
            AIME Studio
            <br />
            Matière → Objet → Composition
            <br />
            → Support → Livraison
          </p>
        </div>
      </aside>

      <main className={`flex-1 lg:ml-[208px] ${plein ? "" : "pb-24"}`}>{children}</main>
    </div>
  );
}

export function PageTitre({
  code,
  titre,
  chapeau,
}: {
  code: string;
  titre: string;
  chapeau: string;
}) {
  return (
    <header className="border-b border-line px-5 sm:px-10 py-10 sm:py-14 relative overflow-hidden">
      <div className="absolute inset-0 rule-grid opacity-40 pointer-events-none" />
      <div className="relative">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-vermillon">{code}</p>
        <h1 className="font-display text-[clamp(2.4rem,6vw,4.6rem)] leading-[0.95] mt-3 text-chalk">{titre}</h1>
        <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-chalk-dim">{chapeau}</p>
      </div>
    </header>
  );
}
