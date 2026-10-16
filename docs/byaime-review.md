# Revue ciblée de byaime et de son atlas

Source examinée : `mattmezstitchlab/byaime-one-page`, commit `cc0890dfed05f9c149938ee4ed59d88918c61705`.
Lecture de code et documents, pas un audit exhaustif ni une validation des services déployés. Aucun code métier copié.

## Ce qui peut enrichir AIME

- `src/lib/public-page.ts` de l’application one-page : blocs déclaratifs qui référencent une source du projet au lieu de recopier les valeurs. À reprendre comme principe pour les mini-sites et kits AIME.
- `lib/aime-domain/src/universal-card.ts` : identité personnelle séparée de la participation à un événement et des rôles contextuels. Notre registre actuel mélange encore ces champs : prochaine évolution utile avant un usage multi-projets.
- `lib/aime-domain/src/capabilities.ts` : décisions d’autorisation distinctes du rôle affiché, avec motifs et confirmations. Ne pas déduire un accès aux documents à partir du métier ou du lien familial.
- `WorldProject` et la navigation décrite dans le README : moments avant/jour J/après auxquels personnes, documents et musique peuvent se rattacher. Une timeline commune éviterait des agendas par module.
- Atlas public `https://aime-composer.vercel.app/atlas/` : catalogue de références avec provenance et types de médias, originaux non absorbés par défaut. La présence d’un lecteur local ou d’un scan exhaustif est décrite par la page ; son exécution n’a pas été testée ici.

## Attention avant réutilisation

Les commentaires de `public-page.ts` affirment une publication explicite. Toutefois `normalizeBlock` normalise toute visibilité autre que `prive` vers `public`, et `DEFAULT_PUBLIC_PAGE` contient des blocs publics. Il faut tester les imports et les valeurs absentes : ne pas importer ces règles comme une garantie de confidentialité sans les vérifier. Le cadre AIME devrait refuser une publication en l’absence d’un choix explicite.

Les nombres de tests et les capacités API annoncés dans le README ne sont pas des résultats vérifiés dans cette revue. Les intégrations existantes nécessitent leur propre analyse des droits, contrats et dépendances.

## Proposition de convergence

1. Identité stable ; participations et métiers liés par références.
2. Médias référencés avec provenance, état d’accès et droits d’usage.
3. Blocs de page reliés aux informations canoniques.
4. Moments reliant personnes, tâches, médias et documents.
5. Publications et actions externes validées explicitement, permissions séparées des rôles.

## Visuels intégrés

Les 17 fichiers fournis par l’utilisateur ont été retrouvés dans le dépôt source puis convertis localement en WebP, sans modifier les originaux. Trois photographies d’agence et quatorze visuels `attached_assets` sont conservés dans `public/img/byaime/`. La landing utilise le hero, la cérémonie, la papeterie, six rôles et quatre détails. Les quatre visuels restants restent disponibles pour les prochains écrans (fleurs, inspirations, hébergement, cadeaux).

Copie locale explicite pour cette demande de remplacement d’images ; ce n’est pas une implémentation du catalogue de références de l’atlas. Le rendu navigateur et les droits de publication des photographies restent à vérifier par le propriétaire avant diffusion publique.
