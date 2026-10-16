import { useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  SlidersHorizontal,
  X,
  Move,
} from "lucide-react";
import { initialShowcases, readShowcases, webUrl } from "../lib/portfolio";
import type { Showcase } from "../lib/portfolio";
import "./Portfolio.css";
const KEY = "aime-portfolio-v1";
export default function Portfolio() {
  const [projects, setProjects] = useState<Showcase[]>(() => {
    try {
      return readShowcases(localStorage.getItem(KEY));
    } catch {
      return initialShowcases;
    }
  });
  const [selected, setSelected] = useState(projects[0].id);
  const [editing, setEditing] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [notice, setNotice] = useState("");
  const drag = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const project = projects.find((p) => p.id === selected) ?? projects[0];
  function patch(update: Partial<Showcase>) {
    setProjects((items) =>
      items.map((p) => (p.id === project.id ? { ...p, ...update } : p)),
    );
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(projects));
      setNotice("Enregistré dans ce navigateur uniquement.");
    } catch {
      setNotice(
        "Stockage indisponible : vos changements ne seront pas conservés.",
      );
    }
  }
  function select(id: string) {
    setSelected(id);
    setInteractive(false);
  }
  return (
    <div className="pf">
      <header className="pf-nav">
        <a className="pf-logo" href="/">
          aime<span>®</span>
        </a>
        <nav>
          <a href="#explorer">Les projets</a>
          <a href="#approche">L’approche</a>
          <a href="/bureau">
            Le bureau <ArrowUpRight size={14} />
          </a>
        </nav>
        <button
          className="pf-edit"
          onClick={() => {
            setEditing(!editing);
            setInteractive(false);
          }}
        >
          <SlidersHorizontal size={15} />
          {editing ? "Fermer l’éditeur" : "Composer la vitrine"}
        </button>
      </header>
      <main>
        <section className="pf-hero">
          <div className="pf-eyebrow">
            <span /> LABORATOIRE D’IDÉES & D’EXPÉRIENCES
          </div>
          <h1>
            Les idées méritent
            <br />
            de <em>prendre vie.</em>
          </h1>
          <div className="pf-intro">
            <p>
              Des projets à explorer. Des détails à découvrir.
              <br />
              Une fenêtre ouverte sur ce que l’on invente.
            </p>
            <a className="pf-pill" href="#explorer">
              Explorer les projets <ArrowRight size={19} />
            </a>
          </div>
          <div className="pf-orbit" aria-hidden="true">
            ✳
          </div>
        </section>
        <section id="explorer" className="pf-explore">
          <div className="pf-section-heading">
            <div>
              <p className="pf-eyebrow">LA SÉLECTION</p>
              <h2>Un projet. Mille perspectives.</h2>
            </div>
            <span>
              {String(projects.length).padStart(2, "0")} projets à explorer
            </span>
          </div>
          <div className="pf-tabs" aria-label="Choisir un projet">
            {projects.map((p) => (
              <button
                key={p.id}
                aria-pressed={project.id === p.id}
                onClick={() => select(p.id)}
              >
                {p.title}
                <ArrowUpRight size={16} />
              </button>
            ))}
            {editing && (
              <button
                onClick={() => {
                  const id = crypto.randomUUID();
                  setProjects([
                    ...projects,
                    {
                      ...initialShowcases[0],
                      id,
                      title: "Nouveau projet",
                      category: "Expérimentation",
                      description: "Présentez ici votre innovation.",
                      url: "",
                      image: "",
                    },
                  ]);
                  select(id);
                }}
              >
                <Plus size={16} /> Ajouter
              </button>
            )}
          </div>
          <div className="pf-stage-grid">
            <div className="pf-project-copy">
              <p className="pf-eyebrow">{project.category}</p>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              {webUrl(project.url) && (
                <a href={project.url} target="_blank" rel="noopener noreferrer">
                  Découvrir le projet <ArrowUpRight size={18} />
                </a>
              )}
              <div className="pf-caption">
                <Move size={20} />
                <p>
                  {editing
                    ? "Glissez dans le cadre ou utilisez les réglages pour isoler un détail."
                    : "Une fenêtre sur le projet. Un autre regard sur chaque détail."}
                </p>
              </div>
            </div>
            <div>
              <div className="pf-browser">
                <div className="pf-browser-bar">
                  <span>● ● ●</span>
                  <span>
                    {webUrl(project.url)
                      ? new URL(project.url).hostname
                      : "Votre prochaine idée"}
                  </span>
                  <ArrowUpRight size={14} />
                </div>
                <div
                  className={`pf-viewport ${editing ? "is-editing" : ""}`}
                  style={{ touchAction: editing ? "none" : "auto" }}
                  onPointerDown={(e) => {
                    if (!editing) return;
                    e.currentTarget.setPointerCapture(e.pointerId);
                    drag.current = {
                      x: e.clientX,
                      y: e.clientY,
                      left: project.x,
                      top: project.y,
                    };
                  }}
                  onPointerMove={(e) => {
                    if (!drag.current) return;
                    patch({
                      x: Math.max(
                        -1600,
                        Math.min(
                          0,
                          drag.current.left + e.clientX - drag.current.x,
                        ),
                      ),
                      y: Math.max(
                        -1600,
                        Math.min(
                          0,
                          drag.current.top + e.clientY - drag.current.y,
                        ),
                      ),
                    });
                  }}
                  onPointerUp={() => {
                    drag.current = null;
                  }}
                  onPointerCancel={() => {
                    drag.current = null;
                  }}
                >
                  {project.mode === "site" && webUrl(project.url) ? (
                    <iframe
                      key={project.url}
                      title={`Aperçu de ${project.title}`}
                      src={project.url}
                      loading="lazy"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      referrerPolicy="no-referrer"
                      tabIndex={interactive && !editing ? 0 : -1}
                      style={{
                        width: 1440,
                        height: 1800,
                        transform: `translate(${project.x}px, ${project.y}px) scale(${project.zoom})`,
                        pointerEvents:
                          interactive && !editing ? "auto" : "none",
                      }}
                    />
                  ) : project.image &&
                    (webUrl(project.image) ||
                      project.image.startsWith("/img/")) ? (
                    <img
                      alt={`Présentation de ${project.title}`}
                      src={project.image}
                      draggable={false}
                      style={{
                        width: 1440,
                        maxWidth: "none",
                        transform: `translate(${project.x}px, ${project.y}px) scale(${project.zoom})`,
                      }}
                    />
                  ) : (
                    <div className="pf-empty">
                      <span>✳</span>
                      <p>
                        Une idée, un lien,
                        <br />
                        un nouveau point de vue.
                      </p>
                      <small>Ajoutez une URL HTTPS dans l’éditeur.</small>
                    </div>
                  )}
                </div>
              </div>
              <div className="pf-frame-note">
                <span>
                  APERÇU RECADRÉ /{" "}
                  {project.mode === "site" ? "SITE INTÉGRÉ" : "IMAGE"}
                </span>
                {!editing && project.mode === "site" && (
                  <button
                    aria-pressed={interactive}
                    onClick={() => setInteractive(!interactive)}
                  >
                    {interactive ? "Figer l’aperçu" : "Interagir avec le site"}
                  </button>
                )}
              </div>
              <p className="pf-help">
                Un site peut refuser l’intégration ou demander une connexion.
                Ouvrez-le directement ou choisissez une image dans l’éditeur.
              </p>
            </div>
          </div>
          {editing && (
            <section className="pf-editor" aria-label="Éditeur du projet">
              <div className="pf-editor-title">
                <h3>Votre regard, votre cadrage.</h3>
                <button
                  aria-label="Fermer l’éditeur"
                  onClick={() => setEditing(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <p>
                Modifications locales à ce navigateur, sans publication ni
                synchronisation.
              </p>
              <div className="pf-fields">
                <label>
                  Nom
                  <input
                    value={project.title}
                    onChange={(e) => patch({ title: e.target.value })}
                  />
                </label>
                <label>
                  Catégorie
                  <input
                    value={project.category}
                    onChange={(e) => patch({ category: e.target.value })}
                  />
                </label>
                <label>
                  Lien du site (HTTPS)
                  <input
                    type="url"
                    value={project.url}
                    onChange={(e) => patch({ url: e.target.value })}
                  />
                  {!webUrl(project.url) && (
                    <small>Une URL HTTPS valide est nécessaire.</small>
                  )}
                </label>
                <label>
                  Type d’aperçu
                  <select
                    value={project.mode}
                    onChange={(e) =>
                      patch({ mode: e.target.value as Showcase["mode"] })
                    }
                  >
                    <option value="site">Site intégré</option>
                    <option value="image">Image de remplacement</option>
                  </select>
                </label>
                <label>
                  Image (URL HTTPS)
                  <input
                    type="url"
                    value={project.image}
                    onChange={(e) => patch({ image: e.target.value })}
                  />
                </label>
                <label>
                  Description
                  <textarea
                    value={project.description}
                    onChange={(e) => patch({ description: e.target.value })}
                  />
                </label>
                {(["zoom", "x", "y"] as const).map((axis) => (
                  <label key={axis}>
                    {axis === "zoom"
                      ? "Zoom"
                      : axis === "x"
                        ? "Décalage horizontal"
                        : "Décalage vertical"}{" "}
                    : {project[axis]}
                    <input
                      type="range"
                      min={axis === "zoom" ? 0.4 : -1600}
                      max={axis === "zoom" ? 2 : 0}
                      step={axis === "zoom" ? 0.05 : 1}
                      value={project[axis]}
                      onChange={(e) =>
                        patch({ [axis]: Number(e.target.value) })
                      }
                    />
                  </label>
                ))}
              </div>
              <div className="pf-actions">
                <button
                  className="pf-pill"
                  onClick={save}
                  disabled={projects.some(
                    (p) =>
                      !webUrl(p.url) ||
                      (p.image !== "" &&
                        !webUrl(p.image) &&
                        !p.image.startsWith("/img/")),
                  )}
                >
                  Enregistrer ici <ArrowRight size={16} />
                </button>
                <button onClick={() => patch({ x: 0, y: 0, zoom: 1 })}>
                  Réinitialiser le cadrage
                </button>
                {projects.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm("Retirer ce projet de la vitrine locale ?")) {
                        const next = projects.filter(
                          (p) => p.id !== project.id,
                        );
                        setProjects(next);
                        select(next[0].id);
                      }
                    }}
                  >
                    Retirer ce projet
                  </button>
                )}
              </div>
              <p role="status">{notice}</p>
            </section>
          )}
        </section>
        <section id="approche" className="pf-approach">
          <p className="pf-eyebrow">LA CURIOSITÉ COMME MOTEUR</p>
          <h2>
            Ne pas seulement montrer.
            <br />
            <em>Faire découvrir.</em>
          </h2>
          <div className="pf-principles">
            {[
              [
                "01",
                "Explorer",
                "Des univers différents, une même envie d’aller plus loin.",
              ],
              [
                "02",
                "Se rapprocher",
                "Cadrer une interface, révéler une interaction, observer un détail.",
              ],
              [
                "03",
                "Ouvrir le champ",
                "Passer de l’aperçu à l’expérience complète, en un clic.",
              ],
            ].map(([n, t, d]) => (
              <article key={n}>
                <span>{n} /</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="pf-footer">
        <a className="pf-logo" href="/">
          aime®
        </a>
        <span>Les idées restent en mouvement.</span>
        <a href="#explorer">Retour aux projets ↑</a>
      </footer>
    </div>
  );
}
