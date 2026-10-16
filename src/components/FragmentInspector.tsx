import type { Fragment } from "../lib/types";
import { Group, Row, Select, Btn, Tag } from "./ui";
import { MODE_RECUP, TYPE_LABEL } from "../lib/fragments";
import { useAime } from "../lib/store";
import { Trash2 } from "lucide-react";

const date = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export function FragmentInspector({ frag, onClose }: { frag: Fragment; onClose: () => void }) {
  const { majFragment, supprimerFragment, projet } = useAime();
  const compos = projet.compositions.filter((c) => c.origine?.fragmentIds.includes(frag.id));

  return (
    <div className="text-chalk">
      <div className="px-3 py-3 border-b border-line/70 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[9px] text-sauge tracking-[0.18em]">{frag.id}</p>
          <input
            value={frag.nom}
            onChange={(e) => majFragment(frag.id, { nom: e.target.value })}
            className="w-full bg-transparent font-display text-lg leading-tight text-chalk border-b border-transparent hover:border-line focus:border-vermillon outline-none"
          />
        </div>
        <div className="flex gap-1 shrink-0">
          <Btn tone="danger" onClick={() => { supprimerFragment(frag.id); onClose(); }} title="Supprimer le fragment">
            <Trash2 size={11} />
          </Btn>
        </div>
      </div>

      <Group titre="1 · Identité">
        <Row label="Type">
          <Tag color="#85a07c">{TYPE_LABEL[frag.type]}</Tag>
          <Tag>{frag.mode}</Tag>
        </Row>
        <Row label="Créé le">
          <span className="font-mono text-[10px] text-chalk-dim">{date(frag.cree)}</span>
        </Row>
        <Row label="Modifié">
          <span className="font-mono text-[10px] text-chalk-dim">{date(frag.modifie)}</span>
        </Row>
      </Group>

      <Group titre="2 · Source et provenance">
        <Row label="Source">
          <span className="font-mono text-[10px] text-chalk truncate">{frag.provenance.sourceNom ?? "Projet"}</span>
        </Row>
        {frag.provenance.url && (
          <Row label="Adresse">
            <a
              href={frag.provenance.url}
              target="_blank"
              rel="noreferrer noopener"
              className="font-mono text-[9.5px] text-sauge hover:text-vermillon truncate"
            >
              {frag.provenance.url}
            </a>
          </Row>
        )}
        <Row label="Récupération">
          <Select
            value={frag.mode}
            onChange={(v) => majFragment(frag.id, { mode: v }, `Mode de récupération → ${v}`)}
            options={MODE_RECUP.map((m) => ({ value: m.id, label: m.nom }))}
          />
        </Row>
        <Row label="Zone">
          <span className="font-mono text-[9.5px] text-chalk-dim">
            {frag.provenance.zone
              ? `${frag.provenance.zone.x}% ${frag.provenance.zone.y}% · ${frag.provenance.zone.w}×${frag.provenance.zone.h}`
              : `${frag.provenance.blocIds.length} bloc(s) désigné(s)`}
          </span>
        </Row>
      </Group>

      <Group titre="3 · Contenu">
        {frag.contenu.rows ? (
          <div className="space-y-1.5">
            {frag.contenu.rows.map((r, i) => (
              <div key={i} className="flex gap-1">
                <input
                  value={r.k}
                  onChange={(e) => {
                    const rows = [...frag.contenu.rows!];
                    rows[i] = { ...rows[i], k: e.target.value };
                    majFragment(frag.id, { contenu: { ...frag.contenu, rows } }, "Donnée modifiée");
                  }}
                  className="w-[38%] bg-vault-3 border border-line px-1.5 py-[3px] font-mono text-[10px] focus:border-vermillon outline-none"
                />
                <input
                  value={r.v}
                  onChange={(e) => {
                    const rows = [...frag.contenu.rows!];
                    rows[i] = { ...rows[i], v: e.target.value };
                    majFragment(frag.id, { contenu: { ...frag.contenu, rows } }, "Donnée modifiée");
                  }}
                  className="flex-1 min-w-0 bg-vault-3 border border-line px-1.5 py-[3px] font-mono text-[10px] focus:border-vermillon outline-none"
                />
              </div>
            ))}
          </div>
        ) : (
          <textarea
            value={frag.contenu.texte ?? ""}
            onChange={(e) =>
              majFragment(frag.id, { contenu: { ...frag.contenu, texte: e.target.value } }, "Contenu édité")
            }
            rows={5}
            className="w-full bg-vault-3 border border-line px-2 py-1.5 font-mono text-[11px] leading-relaxed focus:border-vermillon outline-none resize-y"
          />
        )}
        {frag.contenu.src && (
          <img src={frag.contenu.src} alt={frag.nom} className="mt-2 w-full h-24 object-cover border border-line" />
        )}
        <p className="mt-2 font-mono text-[9px] leading-relaxed text-chalk-dim">
          La source d'origine n'est jamais modifiée : l'édition ne porte que sur le fragment et se
          répercute sur les compositions qui l'utilisent.
        </p>
      </Group>

      <Group titre="4 · Apparence" open={false}>
        <Row label="Encre">
          <Select
            value={frag.apparence.accent}
            onChange={(v) => majFragment(frag.id, { apparence: { ...frag.apparence, accent: v } })}
            options={[
              { value: "ink", label: "encre" },
              { value: "accent", label: "accent" },
              { value: "alt", label: "secondaire" },
              { value: "muted", label: "sourdine" },
            ]}
          />
        </Row>
        <Row label="Casse">
          <Select
            value={frag.apparence.casse}
            onChange={(v) => majFragment(frag.id, { apparence: { ...frag.apparence, casse: v } })}
            options={[
              { value: "normale", label: "normale" },
              { value: "capitales", label: "capitales" },
              { value: "bas-de-casse", label: "bas de casse" },
            ]}
          />
        </Row>
      </Group>

      <Group titre="5 · Composition et contraintes" open={false}>
        <Row label="Rôles">
          <div className="flex flex-wrap gap-1">
            {frag.contraintes.roles.map((r) => (
              <Tag key={r}>{r}</Tag>
            ))}
          </div>
        </Row>
        <Row label="Minimum">
          <span className="font-mono text-[9.5px] text-chalk-dim">
            {frag.contraintes.minW} × {frag.contraintes.minH} unités de grille
          </span>
        </Row>
        <Row label="Usages">
          <span className="font-mono text-[9.5px] text-chalk-dim">
            {compos.length ? compos.map((c) => c.nom).join(" · ") : "aucune composition"}
          </span>
        </Row>
      </Group>

      <Group titre="6 · Historique" open={false}>
        <ul className="space-y-1">
          {frag.historique.map((h, i) => (
            <li key={i} className="font-mono text-[9px] text-chalk-dim leading-relaxed">
              <span className="text-vermillon">—</span> {date(h.date)} · {h.action}
            </li>
          ))}
        </ul>
      </Group>
    </div>
  );
}
