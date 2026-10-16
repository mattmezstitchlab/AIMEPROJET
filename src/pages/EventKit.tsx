import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, Download, ImagePlus, Layers, RefreshCw } from 'lucide-react';
import { toPng } from 'html-to-image';
import { download, slug } from '../lib/export';
import './event-kit.css';

type EventData = { title: string; description: string; date: string; time: string; location: string; price: string; registration: string; organization: string; image: string; theme: string };
const KEY = 'aime.event-kit.v1';
const initial: EventData = { title: 'Les beaux\njours ensemble.', description: 'Un atelier pour créer, partager et faire fleurir les idées. Ouvert à toutes les curiosités.', date: '2026-11-21', time: '14:00', location: 'Maison des associations · Lyon', price: 'Entrée libre', registration: '', organization: 'L’atelier du quartier', image: '', theme: 'sage' };
const formats = [{ id: 'poster', label: 'Affiche A4', detail: 'À imprimer · 210 × 297 mm' }, { id: 'social', label: 'Publication sociale', detail: 'À partager · 1080 × 1080 px' }, { id: 'invitation', label: 'Invitation', detail: 'À envoyer · 148 × 105 mm' }];
function load(): EventData {
  try { const saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (!saved || typeof saved !== 'object') return initial; return Object.fromEntries(Object.entries(initial).map(([key, value]) => [key, typeof saved[key] === 'string' ? saved[key] : value])) as EventData; } catch { return initial; }
}
function dateLabel(date: string) { const parsed = new Date(`${date}T12:00:00`); return Number.isNaN(parsed.getTime()) ? 'Date à préciser' : parsed.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }
export default function EventKit() {
  const [event, setEvent] = useState<EventData>(load);
  const [saved, setSaved] = useState(true);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [exported, setExported] = useState('');
  const cards = useRef<Record<string, HTMLDivElement | null>>({});
  const snapshot = JSON.stringify(event);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { localStorage.setItem(KEY, snapshot); setSaved(true); } catch { setSaved(false); }
    }, 150);
    return () => window.clearTimeout(timer);
  }, [snapshot]);
  const patch = (key: keyof EventData, value: string) => setEvent(current => ({ ...current, [key]: value }));
  const missing = [['title', 'un titre'], ['date', 'une date'], ['time', 'un horaire'], ['location', 'un lieu']].filter(([key]) => !event[key as keyof EventData].trim()).map(([, label]) => label);
  const longText = event.title.length > 85 || event.description.length > 230 || event.location.length > 90;
  const invalidUrl = !!event.registration && !/^https?:\/\/[^\s]+$/i.test(event.registration);
  const stale = exported && exported !== snapshot;
  async function upload(file?: File) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 4 * 1024 * 1024) { setNotice('Choisissez une image JPG, PNG ou WebP de moins de 4 Mo.'); return; }
    const reader = new FileReader(); reader.onload = () => patch('image', String(reader.result)); reader.onerror = () => setNotice('Impossible de lire cette image.'); reader.readAsDataURL(file);
  }
  async function exportKit(only?: string) {
    if (missing.length || invalidUrl || longText) { setNotice('Vérifiez les informations signalées avant l’export.'); return; }
    setBusy(true); setNotice('Préparation des images…');
    try {
      const images: { id: string; label: string; url: string }[] = [];
      for (const format of formats.filter(f => !only || f.id === only)) {
        const node = cards.current[format.id]; if (!node) throw new Error('Aperçu indisponible');
        if (node.scrollHeight > node.clientHeight + 2 || Array.from(node.querySelectorAll<HTMLElement>('.ek-art-content, .ek-art-brand')).some(part => part.scrollWidth > part.clientWidth + 2 || part.scrollHeight > part.clientHeight + 2)) {
          setNotice('Un texte dépasse sur un support. Raccourcissez les informations puis réexportez.'); return;
        }
        const url = await toPng(node, { pixelRatio: format.id === 'social' ? 1080 / node.offsetWidth : 3, cacheBust: false, skipFonts: true });
        images.push({ ...format, url });
      }
      if (only) { const a = document.createElement('a'); a.href = images[0].url; a.download = `${slug(event.title) || 'evenement'}-${only}.png`; a.click(); setNotice('Image exportée.'); }
      else {
        const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kit AIME</title><style>body{font:16px system-ui;background:#f5f5f7;margin:32px;color:#1d1d1f}main{max-width:900px;margin:auto}section{margin:32px 0;break-after:page}img{display:block;max-width:100%;max-height:85vh;margin:20px auto}a{color:#0066cc}@media print{body{margin:0;background:white}header,h2,a{display:none}section{margin:0}img{max-height:270mm;max-width:190mm} @page{size:A4;margin:10mm}}</style><main><header><h1>Votre kit de communication</h1><p>Trois supports, une même version. Cliquez pour enregistrer chaque PNG. Pour l’affiche : imprimez à l’échelle 100 % sur A4, sans en-têtes.</p><p>Les fichiers déjà diffusés ne sont pas mis à jour automatiquement.</p></header>${images.map(image => `<section><h2>${image.label}</h2><a download="${image.id}.png" href="${image.url}">Enregistrer le PNG</a><img alt="${image.label}" src="${image.url}"></section>`).join('')}</main></html>`;
        download(`${slug(event.title) || 'evenement'}-kit.html`, html, 'text/html'); setExported(snapshot); setNotice('Kit téléchargé : ouvrez le fichier HTML pour enregistrer les trois PNG ou imprimer l’affiche.');
      }
    } catch { setNotice('L’export a échoué. Réessayez avec une image plus légère ou sans photo.'); } finally { setBusy(false); }
  }
  return <div className="ek">
    <header className="ek-nav"><Link className="ek-logo" to="/">aime<span>studio</span></Link><span className="ek-nav-caption">De l’idée au monde réel.</span><Link to="/metamorphose" className="ek-atelier">Atelier avancé <ArrowUpRight size={15}/></Link></header>
    <main className="ek-main">
      <section className="ek-hero"><div className="ek-eyebrow"><span/> UN ÉVÉNEMENT. TOUT EST LIÉ.</div><h1>Une idée.<br/><span>Tous ses formats.</span></h1><p>Créez votre événement une seule fois.<br/>L’affiche, la publication et l’invitation suivent.</p><a href="#create" className="ek-primary">Créer mon kit <ArrowUpRight size={17}/></a><div className="ek-hero-note">Sans compte. Sans ressaisie. Simplement ensemble.</div></section>
      <section id="create" className="ek-workspace"><div className="ek-section-head"><div><span className="ek-overline">VOTRE ESPACE DE CRÉATION</span><h2>Tout part d’ici.</h2></div><span className="ek-save"><Check size={14}/>{saved ? 'Enregistré sur cet appareil' : 'Stockage indisponible : exportez votre kit'}</span></div>
      <div className="ek-layout"><aside className="ek-form"><div className="ek-form-heading"><span className="ek-step">1</span><h3>Votre événement</h3></div><p className="ek-muted">Une seule source. Trois supports à jour.</p>
        <label>Organisateur<input value={event.organization} maxLength={70} onChange={e => patch('organization', e.target.value)}/></label>
        <label>Le titre<textarea rows={2} value={event.title} maxLength={100} onChange={e => patch('title', e.target.value)}/></label>
        <label>En quelques mots<textarea rows={3} value={event.description} maxLength={260} onChange={e => patch('description', e.target.value)}/></label>
        <div className="ek-field-row"><label>Date<input type="date" value={event.date} onChange={e => patch('date', e.target.value)}/></label><label>Heure<input type="time" value={event.time} onChange={e => patch('time', e.target.value)}/></label></div>
        <label>Lieu<input value={event.location} maxLength={110} onChange={e => patch('location', e.target.value)}/></label>
        <label>Tarif<input value={event.price} maxLength={50} onChange={e => patch('price', e.target.value)} placeholder="Entrée libre, 15 €…"/></label>
        <label>Lien d’inscription <span className="ek-muted">(facultatif)</span><input type="url" value={event.registration} onChange={e => patch('registration', e.target.value)} placeholder="https://…"/></label>
        <div className="ek-photo"><label className="ek-upload"><ImagePlus size={19}/>{event.image ? 'Changer la photo' : 'Ajouter une photo'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { void upload(e.target.files?.[0]); e.target.value = ''; }}/></label>{event.image && <button onClick={() => patch('image', '')}>Retirer</button>}</div>
        <fieldset className="ek-themes"><legend>Votre palette</legend>{[{ id:'sage', color:'#d9e7d8', label:'Sauge' },{ id:'peach', color:'#f5d5c5', label:'Pêche' },{ id:'blue', color:'#d5e2f5', label:'Azur' }].map(theme => <button key={theme.id} aria-label={theme.label} aria-pressed={event.theme === theme.id} style={{ background: theme.color }} onClick={() => patch('theme', theme.id)}>{event.theme === theme.id && <Check size={17}/>}</button>)}</fieldset>
      </aside><div className="ek-previews"><div className="ek-preview-head"><div><span className="ek-step">2</span><h3>Votre kit, en direct.</h3></div><span><span className="ek-live-dot"/> Synchronisé</span></div>
      <div className="ek-preview-grid">{formats.map(format => <section className={`ek-format ek-format-${format.id}`} key={format.id}><div className="ek-art-wrapper"><div ref={node => { cards.current[format.id] = node; }} className={`ek-art ek-art-${format.id} ek-theme-${event.theme}`}>
        <div className="ek-art-brand">{event.organization || 'Votre association'}<span>↗</span></div>
        <div className="ek-art-visual">{event.image ? <img src={event.image} alt="Visuel de l’événement"/> : <div className="ek-flower" aria-hidden="true">✳</div>}<span className="ek-art-pill">{event.price || 'Bienvenue'}</span></div>
        <div className="ek-art-content"><h4>{event.title || 'Votre événement'}</h4><p>{event.description}</p><div className="ek-art-date">{dateLabel(event.date)}{event.time && ` · ${event.time.replace(':', ' h ')}`}</div><div className="ek-art-location">{event.location || 'Lieu à préciser'}</div>{event.registration && <div className="ek-art-url">{event.registration}</div>}</div>
        <div className="ek-art-footer"><span>On se retrouve ?</span><span>Vous êtes les bienvenus. ↗</span></div>
      </div></div><div className="ek-format-label"><div><strong>{format.label}</strong><span>{format.detail}</span></div><button disabled={busy} onClick={() => void exportKit(format.id)} aria-label={`Télécharger : ${format.label}`}><Download size={17}/></button></div></section>)}</div>
      <div className="ek-sync"><RefreshCw size={20}/><div><strong>Changez l’heure. Pas trois fois.</strong><p>Chaque modification se retrouve immédiatement sur les trois supports.</p></div></div>
      </div></div>
      <div className="ek-export"><div><h3>Prêt à faire passer le mot ?</h3><p>Un fichier HTML contenant vos trois images PNG, à enregistrer ou imprimer.</p></div><button className="ek-primary" disabled={busy} onClick={() => void exportKit()}><Download size={17}/>{busy ? 'Préparation…' : 'Télécharger mon kit'}</button></div>
      <div className="ek-feedback" aria-live="polite">{missing.length > 0 && <p className="ek-warning">À compléter : {missing.join(', ')}.</p>}{invalidUrl && <p className="ek-warning">Le lien doit commencer par https:// ou http://, sans espaces.</p>}{longText && <p className="ek-warning">Raccourcissez le titre (85 caractères), la description (230) ou le lieu (90) pour garder vos supports lisibles.</p>}{stale && <p className="ek-warning">Vos informations ont changé depuis le dernier kit. Réexportez et remplacez les fichiers déjà diffusés.</p>}{notice && <p role="status">{notice}</p>}</div>
      <p className="ek-disclaimer">Les fichiers déjà téléchargés ou publiés ne se mettent pas à jour automatiquement. Votre projet reste dans ce navigateur ; les photos volumineuses peuvent dépasser son stockage. Aucun envoi de photo à un serveur.</p>
      </section><section className="ek-bottom"><Layers size={26}/><h2>Moins de répétition.<br/><span>Plus de liens.</span></h2><p>Pour les associations, les ateliers et ceux qui rassemblent.</p></section>
    </main><footer className="ek-footer"><span>aime studio</span><span>Une information. Plusieurs supports. Zéro ressaisie.</span><Link to="/vision">Découvrir AIME <ArrowUpRight size={14}/></Link></footer>
  </div>;
}
