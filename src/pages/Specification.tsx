import { Link } from "react-router-dom";
import { Check, Circle } from "lucide-react";
import { PageTitre } from "../components/Shell";
import { useAime, VALIDATION_LABELS } from "../lib/store";

const GROUPES_PROPS = [
  {
    n: "1 · Identité",
    p: [
      "identifiant stable (AIME-XXXXXXX), non réutilisé",
      "nom lisible, famille, rôle, type primitif",
      "état : brouillon · validé · livré",
      "verrou d'édition, version, date de dernière modification",
    ],
  },
  {
    n: "2 · Géométrie",
    p: [
      "colonne X et ligne Y sur la Grille Universelle",
      "largeur et hauteur exprimées en unités de grille",
      "rotation, alignement interne, ordre de plan",
      "ancrage relatif au support (marge, fond perdu)",
    ],
  },
  {
    n: "3 · Matière typographique",
    p: [
      "rôle de police : titrage, labeur, technique",
      "corps relatif au support (unité proportionnelle cqw)",
      "graisse, interligne, approche, casse, italique",
      "césure et veuves traitées au rendu",
    ],
  },
  {
    n: "4 · Chromie et surface",
    p: [
      "encre, fond, filet exprimés en jetons sémantiques",
      "épaisseur de filet, rayon, opacité",
      "texture héritée du style actif",
      "aucune couleur en dur : le style reste substituable",
    ],
  },
  {
    n: "5 · Contenu et données",
    p: [
      "texte, paires clé/valeur, média, code",
      "liaison à une variable de projet via {{cle}}",
      "format d'affichage (date, montant, numérotation)",
      "source externe optionnelle (Bureau AIME, CSV, API)",
    ],
  },
  {
    n: "6 · Comportement et livraison",
    p: [
      "lien, action, état interactif (écran)",
      "inclusion ou exclusion de l'export",
      "zone de fond perdu et repères de coupe",
      "empreinte d'authenticité jointe à la livraison",
    ],
  },
];

const PRIORITES = [
  {
    t: "Phase 1 — Noyau",
    s: "Livré en V1",
    l: [
      "Modèle d'objet typé et six groupes de propriétés",
      "Grille Universelle 12×16 et 24 archétypes",
      "Huit familles, 48 objets, huit directions artistiques",
      "Éditeur de composition : insérer, déplacer, redimensionner, éditer",
      "Exports image, données, web, impression",
    ],
  },
  {
    t: "Phase 2 — Liaison",
    s: "V1.1",
    l: [
      "Lecture des données du Bureau AIME comme variables",
      "Publipostage : une composition × n destinataires",
      "Bibliothèque de matières photographiques du projet",
      "Historique par objet et retour arrière fin",
    ],
  },
  {
    t: "Phase 3 — Mouvement",
    s: "V1.2",
    l: [
      "Comportements animés pour les objets numériques",
      "Transitions entre archétypes (métamorphose animée)",
      "Prévisualisation multi-supports simultanée",
    ],
  },
  {
    t: "Phase 4 — Volume",
    s: "V2",
    l: [
      "Dépliés, pliures et rainages paramétriques",
      "Rendu 3D de contrôle sur maquette",
      "Fichiers de découpe et gabarits machine",
    ],
  },
];

function Section({ num, titre, children }: { num: string; titre: string; children: React.ReactNode }) {
  return (
    <section className="px-5 sm:px-10 py-12 border-b border-line">
      <div className="grid lg:grid-cols-[180px_1fr] gap-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-vermillon sticky top-6">
            {num}
            <br />
            <span className="text-chalk-dim">{titre}</span>
          </p>
        </div>
        <div className="max-w-3xl">{children}</div>
      </div>
    </section>
  );
}

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[16px] leading-[1.75] text-chalk-dim mb-4">{children}</p>
);

const H = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-display text-[26px] text-chalk mt-8 mb-3 first:mt-0">{children}</h3>
);

export default function Specification() {
  const { projet, comp } = useAime();
  const faits = VALIDATION_LABELS.filter((v) => projet.validation[v.id]).length;

  return (
    <div>
      <PageTitre
        code="05 · Spécification produit"
        titre="AIME V1 · MÉTAMORPHOSE"
        chapeau="Document de référence de la Bibliothèque Universelle d'Objets Typés : modèle, propriétés, grille, variables, livraison, sécurité, priorités et critères de validation."
      />

      <Section num="§ 1" titre="Vision">
        <P>
          AIME est un environnement de création universel permettant de composer, modifier, relier,
          animer, transformer et exporter des objets numériques ou physiques. La bibliothèque repose sur
          cinq notions enchaînées : <strong className="text-chalk">Matière → Objet → Composition → Support → Livraison</strong>.
        </P>
        <P>
          La matière est brute et sans destination : texte, photographie, forme, symbole, donnée, couleur,
          document, média. L'objet typé est une matière dotée d'une structure, de propriétés et de
          comportements. La composition est l'organisation d'objets sur la Grille Universelle. Le support
          définit la surface physique ou numérique. La livraison produit le fichier, l'impression, la
          publication ou l'expérience interactive.
        </P>
        <P>
          Deux règles structurent tout le système : une même donnée peut alimenter plusieurs objets ; un
          même objet peut apparaître dans plusieurs compositions. La duplication de contenu est donc une
          anomalie, jamais une méthode.
        </P>
      </Section>

      <Section num="§ 2–3" titre="Familles et styles">
        <P>
          Huit familles couvrent le champ des objets éditoriaux : cartes et correspondances, billets et
          accès, identité et marque, documents professionnels, cérémonies et événements, édition et
          publication, objets numériques, objets spatiaux et 3D. Chaque famille compte six objets typés,
          soit quarante-huit objets livrés en V1.
        </P>
        <P>
          Huit directions artistiques originales — Encre Sèche, Bauhaus Tropique, Verre Froid, Herbier,
          Néon Administratif, Marbre Noir, Risographie, Terre Cuite — s'appliquent à n'importe quel objet.
          Un style ne définit que des constantes (polices, cinq encres nommées, rayon, filet, texture) :
          il ne touche ni au contenu ni à la structure, ce qui le rend interchangeable à tout instant.
        </P>
        <div className="flex gap-3 mt-6">
          <Link to="/bibliotheque" className="font-mono text-[10px] uppercase tracking-[0.18em] border border-line px-4 py-2 text-chalk-dim hover:text-chalk hover:border-chalk-dim">
            Voir les 48 objets
          </Link>
          <Link to="/styles" className="font-mono text-[10px] uppercase tracking-[0.18em] border border-line px-4 py-2 text-chalk-dim hover:text-chalk hover:border-chalk-dim">
            Voir les 8 styles
          </Link>
        </div>
      </Section>

      <Section num="§ 4" titre="Propriétés universelles">
        <P>
          Tout objet, quelle que soit sa famille, possède un identifiant stable et six groupes de
          propriétés. Cette uniformité autorise l'inspecteur unique, la copie de propriétés entre objets de
          familles différentes et la substitution de style sans perte.
        </P>
        <div className="grid sm:grid-cols-2 gap-px bg-line border border-line mt-6">
          {GROUPES_PROPS.map((g) => (
            <div key={g.n} className="bg-vault p-4">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.18em] text-vermillon">{g.n}</h4>
              <ul className="mt-3 space-y-1.5">
                {g.p.map((x) => (
                  <li key={x} className="text-[13.5px] leading-relaxed text-chalk-dim flex gap-2">
                    <span className="text-chalk-dim/50 font-mono text-[10px] mt-[3px]">·</span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section num="§ 5" titre="Composition et Grille">
        <P>
          La Grille Universelle compte <strong className="text-chalk">douze colonnes et seize lignes</strong>, indépendamment du
          support : une carte de visite et une affiche A3 partagent le même référentiel. Les corps
          typographiques sont exprimés en unités proportionnelles à la largeur du support, si bien qu'un
          changement de format conserve les rapports d'échelle.
        </P>
        <P>
          Les vingt-quatre archétypes de la bibliothèque MÉTAMORPHOSE se répartissent en six familles de
          composition : Axe, Partition, Cadre, Flux, Trame, Rupture. Chaque archétype décrit des
          emplacements typés (surtitre, titre, corps, données, média, code, sceau, nombre, filet, forme)
          que le contenu de l'objet vient remplir. Appliquer un archétype à un objet est donc une
          opération réversible et non destructrice du contenu.
        </P>
        <Link to="/grille" className="inline-block font-mono text-[10px] uppercase tracking-[0.18em] border border-line px-4 py-2 text-chalk-dim hover:text-chalk hover:border-chalk-dim">
          Parcourir les 24 archétypes
        </Link>
      </Section>

      <Section num="§ 6" titre="Variables partagées">
        <P>
          Un projet détient un dictionnaire de variables. Les objets s'y relient par la syntaxe{" "}
          <code className="font-mono text-sauge text-[14px]">{"{{cle}}"}</code>. La valeur est résolue au rendu, à l'export
          et à l'impression. Le projet de démonstration <strong className="text-chalk">{projet.nom}</strong>{" "}
          contient {projet.variables.length} variables partagées par {projet.compositions.length} compositions.
        </P>
        <div className="border border-line divide-y divide-line mt-6">
          {projet.variables.slice(0, 8).map((v) => (
            <div key={v.cle} className="grid grid-cols-[120px_1fr] sm:grid-cols-[150px_180px_1fr] gap-3 px-4 py-2.5">
              <code className="font-mono text-[11px] text-sauge">{`{{${v.cle}}}`}</code>
              <span className="text-[14px] text-chalk truncate">{v.valeur}</span>
              <span className="hidden sm:block text-[12.5px] text-chalk-dim">{v.note}</span>
            </div>
          ))}
        </div>
        <P>
          Modifier <code className="font-mono text-sauge text-[14px]">{"{{date}}"}</code> met à jour le faire-part, le menu,
          le billet, le panneau d'accueil et la page web — sans retoucher une seule composition.
        </P>
      </Section>

      <Section num="§ 7" titre="Fonctionnement dans AIME">
        <H>Flux de travail</H>
        <ol className="space-y-2 mb-6">
          {[
            "Choisir un objet typé dans la bibliothèque, ou partir d'une matière brute.",
            "Sélectionner un archétype de la Grille Universelle.",
            "Appliquer une direction artistique.",
            "Relier les contenus aux variables du projet.",
            "Ajuster les propriétés dans l'inspecteur unique.",
            "Choisir le support, puis livrer.",
          ].map((t, i) => (
            <li key={t} className="flex gap-3 text-[15px] text-chalk-dim leading-relaxed">
              <span className="font-mono text-[11px] text-vermillon mt-1">{String(i + 1).padStart(2, "0")}</span>
              {t}
            </li>
          ))}
        </ol>
        <H>Intégration à l'Atelier existant</H>
        <P>
          La bibliothèque s'ajoute à l'Atelier universel AIME déjà en place : elle ne remplace ni son
          Bureau ni ses données. Elle expose un contrat d'objet stable (identifiant, propriétés,
          comportements) et consomme les données existantes en lecture, sous forme de variables. Les
          compositions produites s'insèrent dans les projets ouverts, au même titre qu'un document.
        </P>
        <P>
          Format d'échange : <code className="font-mono text-sauge text-[14px]">.aime.json</code>, versionné, lisible,
          contenant le projet, la composition, le support, le style et la liste complète des objets avec
          leurs six groupes de propriétés.
        </P>
      </Section>

      <Section num="§ 8" titre="Impression et export">
        <P>
          Quatre canaux de livraison sont disponibles depuis l'atelier : image matricielle haute densité
          (3×), impression directe avec zone de fond perdu de 3 mm et repères de coupe, page web autonome
          embarquant ses polices, et fichier de données interopérable.
        </P>
        <div className="grid sm:grid-cols-2 gap-px bg-line border border-line mt-6">
          {[
            ["Image", "PNG 3× · fond papier du style · objets non exportables exclus"],
            ["Impression", "Fond perdu 3 mm · repères de coupe · grille masquée · échelle 1:1"],
            ["Web", "HTML autonome · unités proportionnelles · polices liées"],
            ["Données", ".aime.json · structure complète · réimport dans l'Atelier"],
          ].map(([t, d]) => (
            <div key={t} className="bg-vault p-4">
              <h4 className="font-display text-[22px] text-chalk">{t}</h4>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-chalk-dim">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section num="§ 9" titre="Identité, sécurité, authenticité">
        <P>
          Chaque objet reçoit un identifiant stable de la forme{" "}
          <code className="font-mono text-sauge text-[14px]">AIME-XXXXXXX</code>, jamais réutilisé, conservé à travers
          les changements de style, de support et d'archétype. La composition active porte l'identifiant{" "}
          <code className="font-mono text-vermillon text-[14px]">{comp?.id}</code>.
        </P>
        <ul className="space-y-2 mt-4">
          {[
            "Code de vérification généré à partir de l'identifiant d'objet, imprimable sur tout support.",
            "Sceau d'authenticité : marque circulaire portée par les objets d'accès et les documents attestés.",
            "Filigrane de fond pour les épreuves non contractuelles.",
            "Numérotation de série pour les billets, bons et tickets.",
            "Journal de projet horodaté consignant insertions, modifications et livraisons.",
            "État d'objet (brouillon, validé, livré) contrôlant ce qui part en production.",
          ].map((t) => (
            <li key={t} className="flex gap-3 text-[14.5px] text-chalk-dim leading-relaxed">
              <span className="text-vermillon font-mono text-[11px] mt-1">—</span>
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section num="§ 10" titre="Priorités de construction">
        <div className="space-y-px bg-line border border-line">
          {PRIORITES.map((p) => (
            <div key={p.t} className="bg-vault p-5">
              <div className="flex items-baseline justify-between gap-4">
                <h4 className="font-display text-[24px] text-chalk">{p.t}</h4>
                <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-vermillon shrink-0">{p.s}</span>
              </div>
              <ul className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                {p.l.map((x) => (
                  <li key={x} className="text-[13.5px] leading-relaxed text-chalk-dim flex gap-2">
                    <span className="text-chalk-dim/50 font-mono text-[10px] mt-[3px]">·</span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section num="§ 11" titre="Critères de validation">
        <P>
          La V1 doit démontrer que des objets peuvent être <strong className="text-chalk">insérés, modifiés, composés et
          exportés</strong>. La liste ci-dessous se coche en temps réel au fil de votre utilisation de l'atelier.
        </P>
        <div className="flex items-center gap-4 mb-5">
          <div className="h-1.5 flex-1 bg-vault-3 overflow-hidden">
            <div
              className="h-full bg-vermillon transition-all duration-500"
              style={{ width: `${(faits / VALIDATION_LABELS.length) * 100}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-chalk">
            {faits}/{VALIDATION_LABELS.length}
          </span>
        </div>
        <ul className="border border-line divide-y divide-line">
          {VALIDATION_LABELS.map((v) => {
            const ok = !!projet.validation[v.id];
            return (
              <li key={v.id} className="flex items-center gap-3 px-4 py-3">
                {ok ? (
                  <Check size={15} className="text-sauge shrink-0" />
                ) : (
                  <Circle size={13} className="text-chalk-dim/40 shrink-0" />
                )}
                <span className={`text-[14.5px] ${ok ? "text-chalk" : "text-chalk-dim"}`}>{v.label}</span>
              </li>
            );
          })}
        </ul>
        <Link
          to="/atelier"
          className="mt-6 inline-flex items-center gap-2 bg-vermillon text-vault px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-chalk transition-colors"
        >
          Valider dans l'atelier
        </Link>
      </Section>

      <Section num="§ 12" titre="MÉTAMORPHOSE · canevas de fragments">
        <P>
          Principe fondateur de l'évolution V1 : <strong className="text-chalk">une source → plusieurs fragments →
          plusieurs compositions → plusieurs supports</strong>. La source (URL publique, fichier, texte, page locale
          de démonstration, création AIME) reste indépendante des créations produites ; toutes les
          transformations sont non destructives et réversibles.
        </P>
        <H>Parcours</H>
        <ol className="space-y-2 mb-6">
          {[
            "Importer une source — l'adresse est validée (pas de réseau interne), puis lue via une passerelle publique.",
            "Afficher la source en blocs lisibles, avec son statut et sa provenance.",
            "Passer en mode Sélection : tracer des zones ou désigner des blocs.",
            "Choisir la récupération — visuel, sémantique ou mixte — et créer le fragment.",
            "Éditer le fragment : la source d'origine n'est jamais modifiée.",
            "Composer plusieurs fragments sur l'un des 24 archétypes, en mode Régulier, Éditorial ou Immersif.",
            "Changer de support, prévisualiser l'interaction, exporter — image, impression, web, JSON réimportable.",
          ].map((t, i) => (
            <li key={t} className="flex gap-3 text-[15px] text-chalk-dim leading-relaxed">
              <span className="font-mono text-[11px] text-vermillon mt-1">{String(i + 1).padStart(2, "0")}</span>
              {t}
            </li>
          ))}
        </ol>
        <H>Schéma d'un fragment</H>
        <pre className="border border-line bg-vault-2/50 p-4 overflow-x-auto font-mono text-[11px] leading-relaxed text-chalk-dim">
{`{
  "id": "FRG-XXXXX",            "type": "texte | image | tableau | lien | …",
  "nom": "Informations pratiques",
  "mode": "visuel | semantique | mixte",
  "contenu": { "texte": "…", "rows": [], "src": null, "blocs": [] },
  "sourceId": "SRC-XXXXX",
  "provenance": { "url": "https://…", "blocIds": [], "zone": { "x":0,"y":0,"w":0,"h":0 } },
  "contraintes": { "minW": 2, "minH": 0.8, "roles": ["corps","soustitre"] },
  "relations": [], "usages": ["AIME-…"],
  "historique": [{ "date": "…", "action": "Créé depuis « … »" }]
}`}
        </pre>
        <H>Intégration React / TypeScript</H>
        <P>
          Tout est composant réutilisable et indépendant des pages de démonstration :{" "}
          <code className="font-mono text-sauge text-[13.5px]">&lt;AimeProvider&gt;</code> (état et persistance locale),{" "}
          <code className="font-mono text-sauge text-[13.5px]">&lt;Surface&gt;</code> (rendu d'une composition),{" "}
          <code className="font-mono text-sauge text-[13.5px]">&lt;Canvas&gt;</code> (édition sur grille),{" "}
          <code className="font-mono text-sauge text-[13.5px]">&lt;SourceViewer&gt;</code> (lecture et sélection),{" "}
          <code className="font-mono text-sauge text-[13.5px]">&lt;FragmentInspector&gt;</code>,{" "}
          <code className="font-mono text-sauge text-[13.5px]">&lt;ApercuObjet&gt;</code> et{" "}
          <code className="font-mono text-sauge text-[13.5px]">&lt;Dock&gt;</code>. Les bibliothèques sont de simples
          modules de données : <code className="font-mono text-sauge text-[13.5px]">archetypes.ts</code>,{" "}
          <code className="font-mono text-sauge text-[13.5px]">styles.ts</code>,{" "}
          <code className="font-mono text-sauge text-[13.5px]">supports.ts</code>,{" "}
          <code className="font-mono text-sauge text-[13.5px]">objects.ts</code>,{" "}
          <code className="font-mono text-sauge text-[13.5px]">fragments.ts</code>,{" "}
          <code className="font-mono text-sauge text-[13.5px]">sources.ts</code>. L'export{" "}
          <code className="font-mono text-sauge text-[13.5px]">.projet.aime.json</code> est réimportable tel quel.
        </P>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-vermillon text-vault px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-chalk transition-colors"
        >
          Ouvrir le canevas MÉTAMORPHOSE
        </Link>
      </Section>

      <footer className="px-5 sm:px-10 py-10">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-chalk-dim/70 leading-relaxed">
          AIME® — Bibliothèque Universelle d'Objets Typés · Spécification produit V1 · MÉTAMORPHOSE
          <br />
          Document vivant · Grille 12×16 · 48 objets · 24 archétypes · 8 directions artistiques
        </p>
      </footer>
    </div>
  );
}
