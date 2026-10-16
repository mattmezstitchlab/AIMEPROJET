import { buildComposition, nodeFromMatiere } from './build';
import type { AimeNode } from './types';
/** Tokens stay in the document: never replace shared values with text snapshots. */
export function linkedComposition(format: 'poster' | 'social' | 'invitation') {
  const base = buildComposition('o-carte-sociale', undefined, 'studio-clair');
  const node = (id: string, patch: Partial<AimeNode>) => ({ ...nodeFromMatiere(id), ...patch });
  return { ...base, nom: { poster:'Affiche liée', social:'Publication liée', invitation:'Invitation liée' }[format], supportId: { poster:'a4', social:'carre', invitation:'carte-postale' }[format], nodes: [
    node('m-texte', { nom:'Organisateur lié', text:'{{organisation}}', x:1, y:1, w:10, h:1, size:2.3 }),
    node('m-photo', { nom:'Photo partagée', src:'{{photo}}', x:1, y:2.5, w:10, h:4.5, radius:18 }),
    node('m-titre', { nom:'Titre lié', text:'{{evenement}}', x:1, y:7.5, w:10, h:2.6, size:6, weight:600 }),
    node('m-texte', { nom:'Description liée', text:'{{description}}', x:1, y:10.4, w:10, h:1.8, size:2.4 }),
    node('m-texte', { nom:'Date et heure liées', text:'{{date}} · {{heure}}', x:1, y:12.5, w:10, h:.8, size:2.6, weight:600 }),
    node('m-texte', { nom:'Lieu et tarif liés', text:'{{lieu}} · {{tarif}}', x:1, y:13.5, w:10, h:.9, size:2.1 }),
    node('m-texte', { nom:'Inscription liée', text:'{{inscription}}', x:1, y:14.6, w:10, h:.8, size:1.8 }),
  ] };
}
