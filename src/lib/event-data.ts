export type EventData = { title: string; description: string; date: string; time: string; location: string; price: string; registration: string; organization: string; image: string; theme: string };
export const eventKeys: Record<keyof EventData, string> = { title: 'evenement', description: 'description', date: 'date_iso', time: 'heure', location: 'lieu', price: 'tarif', registration: 'inscription', organization: 'organisation', image: 'photo', theme: 'palette' };
export const defaultEvent: EventData = { title: 'Les beaux jours ensemble.', description: 'Un atelier pour créer, partager et faire fleurir les idées.', date: '2026-11-21', time: '14:00', location: 'Maison des associations · Lyon', price: 'Entrée libre', registration: '', organization: 'L’atelier du quartier', image: '', theme: 'sage' };
export function dateLabel(date: string) { const parsed = new Date(`${date}T12:00:00`); return Number.isNaN(parsed.getTime()) ? 'Date à préciser' : parsed.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }
export function readEvent(variables: { cle: string; valeur: string }[]): EventData {
  return Object.fromEntries(Object.entries(eventKeys).map(([field, key]) => [field, variables.find(v => v.cle === key)?.valeur ?? defaultEvent[field as keyof EventData]])) as EventData;
}
/** Import the previous kit once; unrelated project variables are preserved. */
export function migrateEvent(variables: { cle: string; valeur: string; note: string }[], legacy: unknown) {
  const saved = legacy && typeof legacy === 'object' ? legacy as Record<string, unknown> : {};
  const firstMigration = !variables.some(v => v.cle === 'studio_data_version');
  const next = variables.map(v => {
    const field = Object.keys(eventKeys).find(field => eventKeys[field as keyof EventData] === v.cle);
    return firstMigration && field && typeof saved[field] === 'string' ? { ...v, valeur: saved[field] as string } : v;
  });
  if (firstMigration) next.push({ cle: 'studio_data_version', valeur: '1', note: 'Version des informations partagées' });
  const previousDate = variables.find(v => v.cle === 'date')?.valeur.match(/^(\d{1,2}) (janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre) (\d{4})$/i);
  const monthNames = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  const previousIso = previousDate ? `${previousDate[3]}-${String(monthNames.indexOf(previousDate[2].toLowerCase()) + 1).padStart(2, '0')}-${previousDate[1].padStart(2, '0')}` : undefined;
  for (const [field, key] of Object.entries(eventKeys)) {
    if (!next.some(v => v.cle === key)) next.push({ cle: key, valeur: typeof saved[field] === 'string' ? saved[field] as string : field === 'date' && previousIso ? previousIso : defaultEvent[field as keyof EventData], note: 'Information partagée · AIME Studio' });
  }
  return firstMigration && typeof saved.date === 'string' ? updateVariables(next, 'date_iso', saved.date) : next;
}
export function updateVariables(variables: { cle: string; valeur: string; note: string }[], key: string, value: string) {
  const changes: Record<string, string> = { [key]: value };
  if (key === 'date_iso') changes.date = value ? dateLabel(value) : '';
  const next = variables.map(v => v.cle in changes ? { ...v, valeur: changes[v.cle] } : v);
  for (const [cle, valeur] of Object.entries(changes)) if (!next.some(v => v.cle === cle)) next.push({ cle, valeur, note: 'Information partagée' });
  return next;
}
