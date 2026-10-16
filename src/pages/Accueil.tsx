import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { FAMILLES } from "../lib/objects";
import { STYLES } from "../lib/styles";
import { ARCHETYPES } from "../lib/archetypes";
import { OBJETS } from "../lib/objects";

const NOTIONS = [
  {
    n: "Matière",
    d: "Texte, photographie, forme, symbole, donnée, couleur, document, média. La substance brute, sans destination.",
  },
  { n: "Objet", d: "Une matière typée : structure, propriétés, comportements, identifiant stable." },
  { n: "Composition", d: "L'organisation des objets sur la Grille Universelle, via 24 archétypes." },
  { n: "Support", d: "Carte, page web, billet, document, livret, affiche, volume, écran." },
  { n: "Livraison", d: "Fichier, impression, publication ou expérience interactive." },
];

export default function Accueil() {
  return (
    <div>
      <section className="relative border-b border-line overflow-hidden">
        <div className="absolute inset-0 rule-grid opacity-50" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(90% 60% at 15% 0%, rgba(212,81,42,0.16) 0%, transparent 60%), radial-gradient(70% 50% at 90% 100%, rgba(201,162,39,0.10) 0%, transparent 60%)",
          }}
        />
        <div className="relative px-5 sm:px-10 pt-16 pb-14">
          <p className="rise font-mono text-[10px] uppercase tracking-[0.34em] text-vermillon">
            Spécification produit V1 · MÉTAMORPHOSE
          </p>
          <h1
            className="rise font-display text-[clamp(3rem,11vw,9rem)] leading-[0.82] mt-6 text-chalk"
            style={{ animationDelay: "80ms" }}
          >
            Bibliothèque
            <br />
            <span className="italic text-vermillon">universelle</span>
            <br />
            d'objets typés
          </h1>
          <p
            className="rise mt-8 max-w-2xl text-[18px] sm:text-[20px] leading-relaxed text-chalk-dim"
            style={{ animationDelay: "160ms" }}
          >
            AIME est un environnement de création universel permettant de composer, modifier, relier,
            animer, transformer et exporter des objets numériques ou physiques. Une même donnée
            alimente plusieurs objets ; un même objet apparaît dans plusieurs compositions.
          </p>
          <div className="rise mt-10 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            <Link
              to="/atelier"
              className="group inline-flex items-center gap-2 bg-vermillon text-vault px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-chalk transition-colors"
            >
              Ouvrir l'atelier
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/bibliotheque"
              className="inline-flex items-center gap-2 border border-line px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-chalk-dim hover:text-chalk hover:border-chalk-dim transition-colors"
            >
              Parcourir les 48 objets
            </Link>
          </div>

          <div className="rise mt-14 grid grid-cols-2 sm:grid-cols-4 gap-px bg-line border border-line max-w-3xl" style={{ animationDelay: "320ms" }}>
            {[
              { k: FAMILLES.length, l: "familles" },
              { k: OBJETS.length, l: "objets typés" },
              { k: STYLES.length, l: "directions" },
              { k: ARCHETYPES.length, l: "archétypes" },
            ].map((s) => (
              <div key={s.l} className="bg-vault px-4 py-5">
                <div className="font-display text-4xl text-chalk">{s.k}</div>
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-chalk-dim mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 sm:px-10 py-16 border-b border-line">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-vermillon">1 · Les cinq notions</h2>
        <div className="mt-8 grid md:grid-cols-5 gap-px bg-line border border-line">
          {NOTIONS.map((x, i) => (
            <div key={x.n} className="bg-vault p-5 group hover:bg-vault-2 transition-colors">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[9px] text-vermillon">0{i + 1}</span>
                <h3 className="font-display text-2xl text-chalk">{x.n}</h3>
              </div>
              <p className="mt-3 text-[14px] leading-relaxed text-chalk-dim">{x.d}</p>
              {i < 4 && <div className="mt-4 h-px bg-gradient-to-r from-vermillon/60 to-transparent" />}
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 sm:px-10 py-16 border-b border-line">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-vermillon">
            2 · Les huit familles d'objets
          </h2>
          <Link to="/bibliotheque" className="font-mono text-[10px] uppercase tracking-[0.18em] text-chalk-dim hover:text-chalk">
            Tout voir →
          </Link>
        </div>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line">
          {FAMILLES.map((f) => (
            <Link
              key={f.id}
              to="/bibliotheque"
              className="bg-vault p-5 hover:bg-vault-2 transition-colors relative group"
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px] opacity-70 group-hover:opacity-100 transition-opacity"
                style={{ background: f.teinte }}
              />
              <div className="font-mono text-[9px] tracking-[0.2em]" style={{ color: f.teinte }}>
                {f.code} · {f.devise.toUpperCase()}
              </div>
              <h3 className="font-display text-[22px] leading-tight mt-2 text-chalk">{f.nom}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-chalk-dim">{f.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 sm:px-10 py-16">
        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-vermillon">Principe de réutilisation</h2>
            <p className="mt-5 font-display text-[clamp(1.8rem,3.4vw,2.8rem)] leading-[1.1] text-chalk">
              Une donnée saisie une fois irrigue toute la famille d'objets d'un projet.
            </p>
            <p className="mt-5 text-[16px] leading-relaxed text-chalk-dim">
              Dans un projet de mariage, la variable <code className="font-mono text-sauge">{"{{couple}}"}</code> alimente
              simultanément le faire-part, le menu, le marque-place, le panneau d'accueil et la page web.
              Modifier la variable met à jour chaque objet, sans toucher à sa composition.
            </p>
            <Link
              to="/specification"
              className="mt-7 inline-flex items-center gap-2 border border-line px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-chalk-dim hover:text-chalk hover:border-chalk-dim"
            >
              Lire la spécification complète
            </Link>
          </div>
          <div className="border border-line bg-vault-2/40 p-6">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-chalk-dim">Intégration</p>
            <p className="mt-3 text-[15px] leading-relaxed text-chalk-dim">
              La bibliothèque s'ajoute à l'Atelier universel AIME existant : elle n'en remplace ni le Bureau,
              ni les données. Elle expose un contrat d'objet (identifiant, propriétés, comportements) que
              l'Atelier consomme tel quel.
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Aucun remplacement du Bureau existant",
                "Données du Bureau lisibles comme variables partagées",
                "Objets exportés au format .aime.json interopérable",
                "Compositions insérables dans les projets déjà ouverts",
              ].map((t) => (
                <li key={t} className="flex gap-3 text-[14px] text-chalk-dim">
                  <span className="text-vermillon font-mono text-[11px] mt-0.5">—</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
