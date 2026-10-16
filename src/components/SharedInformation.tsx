import { Link } from 'react-router-dom';
import { useAime } from '../lib/store';
import { variablesUtilisees } from '../lib/build';
import { eventKeys } from '../lib/event-data';
import { PageTitre } from './Shell';

const labels: Record<string, string> = { evenement:'Titre de l’événement', description:'Description', date_iso:'Date', heure:'Heure', lieu:'Lieu', tarif:'Tarif', inscription:'Inscription', organisation:'Organisateur', photo:'Photo', palette:'Palette' };
export default function SharedInformation() {
  const { projet, setVar } = useAime();
  return <div><PageTitre code="LE CŒUR DU PROJET" titre="Une seule source." chapeau="Les informations de votre projet vivent ici. Les créations liées les utilisent en direct, sans changer leur mise en page."/>
    <div className="shared-info-grid"><section className="studio-card"><h2>Vos informations</h2><p>Également modifiables depuis le kit et le menu Projet du canevas.</p>{projet.variables.filter(v => v.cle !== 'studio_data_version').map(variable => {
      const uses = projet.compositions.filter(c => c.nodes.some(n => variablesUtilisees(`${n.text} ${n.src ?? ''} ${(n.rows ?? []).map(r => r.k + r.v).join(' ')}`).includes(variable.cle)));
      return <label className="shared-field" key={variable.cle}><span>{labels[variable.cle] || variable.cle}<small>{uses.length} création{uses.length > 1 ? 's' : ''} liée{uses.length > 1 ? 's' : ''}{Object.values(eventKeys).includes(variable.cle) ? ' · kit synchronisé' : ''}</small></span>{variable.cle === 'photo' ? <Link to="/">Modifier la photo dans le kit ↗</Link> : variable.cle === 'date' ? <span className="shared-derived">{variable.valeur} · calculée depuis la date du kit</span> : variable.cle === 'palette' ? <select value={variable.valeur} onChange={e => setVar(variable.cle,e.target.value)}><option value="sage">Sauge</option><option value="peach">Pêche</option><option value="blue">Azur</option></select> : <input aria-label={labels[variable.cle] || variable.cle} type={variable.cle === 'date_iso' ? 'date' : variable.cle === 'heure' ? 'time' : 'text'} value={variable.valeur} onChange={e => setVar(variable.cle,e.target.value)}/>}</label>;
    })}</section><aside className="studio-card"><h2>Créer des liens, pas des copies.</h2><p>Dans le canevas, sélectionnez un texte ou une image, puis choisissez « Lier à une information » dans l’inspecteur.</p><p>Par exemple, <code>{'{{evenement}}'}</code> affiche toujours le titre actuel. Une valeur écrite librement reste propre à sa création.</p><Link className="studio-action" to="/metamorphose">Ouvrir le canevas ↗</Link><Link className="studio-action" to="/">Retrouver mon kit ↗</Link><hr/><h2>Vos créations</h2>{projet.compositions.map(c => <p key={c.id}>{c.nom}</p>)}<p className="shared-note">La synchronisation fonctionne dans ce projet et ce navigateur. Les exports déjà diffusés doivent être téléchargés à nouveau.</p></aside></div>
  </div>;
}
