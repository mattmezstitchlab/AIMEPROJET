# AIME MÉTAMORPHOSE — Pont de consolidation avec POINTZERO

**Statut : étude technique, sans fusion ni modification du moteur.**  
**Sources inspectées :** `AIMEPROJET/main` et `POINTZERO/feat/aime-fresh-project-workspace` (PR #55), 16 octobre 2026.

## Décision d'architecture

Conserver **deux dépôts et deux prototypes autonomes pour les essais**, puis intégrer les capacités validées **par adaptateur dans le Bureau canonique AIME de POINTZERO**. Ne jamais écraser les anciens moteurs, ni copier une deuxième application complète dans la nouvelle coque.

- **POINTZERO** est actuellement la référence pour le Bureau, les identifiants de projet, l'isolation des documents locaux, les parcours historiques et les tests de non-régression.
- **AIMEPROJET** est actuellement le laboratoire de composition : objets typés, 24 archétypes, supports, styles, sources, sélection de blocs, fragments, canevas, inspecteur et export.
- **Le cube 3D / six agents** est une représentation fonctionnelle et une cible d'architecture, pas encore une capacité vérifiée dans ce dépôt. Les six faces futures doivent rester des capacités universelles, indépendantes des univers métier.

## Cartographie du code vérifié

| Capacité | AIMEPROJET | POINTZERO / PR #55 | Intégration recommandée |
| --- | --- | --- | --- |
| Bureau / plusieurs projets | `src/lib/store.tsx` utilise `aime.projet.v1` pour un projet courant | `src/components/BureauStudio.tsx`, `WorldSpace.id`, `pointzero:one-space:v1` | Garder le Bureau POINTZERO ; rendre le moteur d'AIMEPROJET multi-projet |
| Document et conservation | `Projet` / `Composition` / `AimeNode` dans `src/lib/types.ts` | `AimeProjectDocument` versionné et validé par ID | Adapter, ne pas remplacer les données historiques |
| Mise en page | `src/lib/archetypes.ts`, `src/lib/build.ts`, `src/components/Canvas.tsx` | Sections limitées (hero/split/cards/simple/cta) | Introduire les compositions comme bibliothèque réutilisable de l'Atelier |
| Supports | `src/lib/supports.ts` et transformations dans `src/lib/store.tsx` | Aperçus de tailles ; non moteur de transformation | Brancher le moteur AIMEPROJET, tester la conservation des contenus |
| Sources | `src/lib/sources.ts`, `src/components/SourceViewer.tsx` | Plusieurs moteurs historiques, distincts | Import strictement autorisé ; provenance et permissions |
| Fragments | `src/lib/fragments.ts`, `fragId`, `sourceId`, `origine` | Données éditoriales et anciennes fonctions spécialisées | Définir IDs durables, provenance, références et migrations |
| Objets typés | `src/lib/objects.ts` | Module éditorial minimal | Conserver les modèles originaux comme ressources non destructives |
| Export | `src/lib/export.ts`, pages PNG/HTML/JSON, impression navigateur | JSON de pages et moteurs spécialisés anciens | Déclarer les formats effectivement générés et vérifiés |
| UI universelle | `src/pages/Metamorphose.tsx` + inspecteurs | `src/components/AimeProjectWorkspace.tsx` | Réconcilier dans un seul Atelier, pas deux espaces concurrents |
| Validation | Pas de dossier de tests repéré dans l'arbre AIMEPROJET | Vitest, tests API et vérification CI disponibles | Ajouter des tests contractuels avant intégration |

## Risques concrets observés, à corriger avant ouverture publique

**P0 — Données et confidentialité.**

1. `AIMEPROJET/src/lib/store.tsx` persiste le projet dans une clé commune `aime.projet.v1`. Elle n'est pas isolée par `WorldSpace.id`. Ne pas importer directement cette valeur dans les projets de POINTZERO ; introduire un schéma versionné et des migrations non destructives.
2. `AIMEPROJET/src/lib/sources.ts` tente l'import d'URL via `r.jina.ai` et `api.allorigins.win` (services publics tiers). **Ne jamais y faire transiter une URL privée, un document personnel, un accès administrateur, un jeton, ni des données sensibles.** Pour le produit, prévoir un service serveur explicite avec contrôle d'autorisations, confidentialité, limites d'accès et protection des réseaux internes ; l'import manuel local reste disponible.
3. `src/pages/Metamorphose.tsx` accepte actuellement un JSON de projet avec une validation minimale (`compositions?.length`), puis appelle `remplacerProjet`. Ajouter un validateur de schéma, des quotas et une confirmation de remplacement avant tout import utilisateur.

**P1 — Précision des promesses de sortie.**

4. Les sorties retrouvées dans le code : PNG (`html-to-image`), HTML, JSON et commande d'impression du navigateur. Ne pas les qualifier automatiquement de PDF/A, PDF/UA, PDF imprimeur certifié ou signature électronique.
5. `src/lib/export.ts` dessine un code graphique pseudo-QR via un générateur aléatoire déterministe ; **ce n'est pas un QR code vérifié comme lisible**. Ne pas l'utiliser pour contrôle d'accès, paiement ou identification.
6. `compositionHTML` concatène `origin` et `n.src` : valider la gestion des URL absolues, data URL, médias locaux, échappement des attributs et fonctionnement réel hors ligne.
7. Les formats numériques dans `src/lib/supports.ts` utilisent certains gabarits de taille exprimés en px (par exemple mobile 90×195 et web 288×180). Ce sont des proportions de canevas, pas forcément des breakpoints/cibles responsive exacts. Les dimensions et unités doivent être clarifiées dans l'interface.

**P1 — Qualité et ergonomie.**

8. Conserver la densité visuelle sobre du Bureau POINTZERO et les capacités du canevas AIMEPROJET ; les outils n'apparaissent que si leur capacité est réellement fonctionnelle.
9. Ajouter des tests automatiques de conservation des fragments et données partagées lors d'un changement de composition ou de support, d'import/export aller-retour, de navigation clavier et d'absence de troncature sur contenus longs.
10. Tester les performances et l'accessibilité des panneaux avec zoom 200 %, 390/768/1440 px, état vide, contenu réel et manipulation tactile.

## Contrat de rapprochement — à implémenter dans un lot ultérieur

Établir un adaptateur explicite (noms indicatifs) :

- `aimeProjectToCompositionDocument(projectId, worldSpace, projectDocument)` construit une vue transitoire compatible avec `Projet` d'AIMEPROJET sans copier les données historiques.
- `readCompositionForProject(projectId)` lit uniquement le document de ce projet ; aucune consultation de la clé globale `aime.projet.v1` sans étape de migration explicite.
- `saveCompositionForProject(projectId, composition)` utilise un schéma versionné validé, protège les documents existants invalides et échoue sans écrasement.
- `registerAimeCapability(capability)` expose les moteurs spécialisés sans importer leurs anciennes interfaces.
- `recordExecutionEvent(projectId, phase, task, state, output)` est le futur contrat de visualisation du cube : événements vrais, pas de progression inventée.

Ne pas associer les six faces aux domaines métier. Les faces représentent **Comprendre, Structurer, Composer, Construire, Vérifier, Orchestrer** ; les objets de la bibliothèque peuvent être de n'importe quel univers.

## Séquence courte d'intégration

1. **Préserver les deux versions** : `AIMEPROJET/main` et `POINTZERO/main` ne changent pas pendant l'audit. Vérifier le build de chaque dépôt en CI.
2. **Contrat de données** : définir une version commune, des ID persistants, validateurs stricts et tests de réimport sans perte ; ne rien migrer automatiquement.
3. **Moteur en bibliothèque** : isoler `types`, `archetypes`, `supports`, `build`, `fragments` et `objects` sans dépendance UI.
4. **Prototype d'intégration** sur branche dédiée de POINTZERO : ouvrir un projet vide, choisir un modèle AIMEPROJET, manipuler un objet typé, changer support/archétype, recharger. Conserver le Bureau POINTZERO.
5. **Source et livraisons** : brancher une extraction sûre, confirmer les exports disponibles ; ajouter tests sécurité et accessibilité.
6. **Cube et agents** : seulement après la mise en place des événements d'exécution et des permissions, lier les touches aux opérations réelles.

## Recette de la première PR fonctionnelle

- Deux projets distincts ne partagent aucune donnée involontairement.
- L'ancien projet POINTZERO reste inchangé après l'ouverture d'un modèle AIMEPROJET.
- Les références aux fragments survivent à plusieurs transformations et au rechargement.
- Une valeur partagée mise à jour modifie uniquement les créations autorisées et liées.
- Un réimport invalide est refusé **sans écraser** les données locales.
- Un support réellement exportable produit le fichier annoncé ; sinon l'option est explicitement indisponible.
- Les anciens liens profonds et moteurs POINTZERO continuent de fonctionner.
- Vue mobile, clavier et réduction du mouvement validés.

**Conclusion : la bonne cible est un Atelier unifié appuyé sur le Bureau éprouvé, avec AIMEPROJET comme moteur de composition. Le rapprochement sera incrémental et réversible.**

## Liens

- [AIMEPROJET](https://github.com/mattmezstitchlab/AIMEPROJET)
- [POINTZERO](https://github.com/mattmezstitchlab/POINTZERO)
- [POINTZERO PR #55 — Nouveau Bureau et Atelier](https://github.com/mattmezstitchlab/POINTZERO/pull/55)
