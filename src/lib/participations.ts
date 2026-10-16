import type { PersonCard } from './universes';
export type Terms={service:string;time:string;location:string;amount:string;needs:string};
export type Participation={id:string;personId:string;draft:Terms;confirmed:Terms|null};
export const emptyTerms=():Terms=>({service:'',time:'',location:'',amount:'',needs:''});
const validTerms=(v:unknown):v is Terms=>!!v&&typeof v==='object'&&Object.keys(emptyTerms()).every(k=>typeof (v as Record<string,unknown>)[k]==='string');
export function readParticipations(raw:string):Participation[]{try{const v:unknown=JSON.parse(raw);return Array.isArray(v)?v.filter((p):p is Participation=>!!p&&typeof p==='object'&&typeof p.id==='string'&&typeof p.personId==='string'&&validTerms(p.draft)&&(p.confirmed===null||validTerms(p.confirmed))):[];}catch{return [];}}
export function linkPerson(current:Participation[],personId:string,id:string):Participation[]{return current.some(p=>p.personId===personId)?current:[...current,{id,personId,draft:emptyTerms(),confirmed:null}];}
export function confirmParticipation(p:Participation):Participation{if(!p.draft.service.trim())throw new Error('Précisez la prestation avant validation.');return {...p,confirmed:{...p.draft}};}
export function hasPendingChanges(p:Participation){return p.confirmed!==null&&JSON.stringify(p.confirmed)!==JSON.stringify(p.draft);}
/** Only coordination data is projected; no public tariff, bio or private notes. */
export function coordination(participations:Participation[],people:PersonCard[]){return participations.map(p=>{const person=people.find(person=>person.id===p.personId);return {id:p.id,name:person?.name??'Profil indisponible',email:person?.email??'',service:p.confirmed?.service??'À confirmer',time:p.confirmed?.time??'',location:p.confirmed?.location??'',missing:!person};});}
