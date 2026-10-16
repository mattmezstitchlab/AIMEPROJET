import { useAime } from "../lib/store";
import type { AimeNode, Token } from "../lib/types";
import { Btn, Group, Num, Row, Select, Tag, Toggle } from "./ui";
import { variablesUtilisees } from "../lib/build";
import { Copy, Layers, Lock, Trash2, Unlock } from "lucide-react";

const TOKENS: { value: Token; label: string }[] = [
  { value: "ink", label: "encre" },
  { value: "accent", label: "accent" },
  { value: "alt", label: "secondaire" },
  { value: "muted", label: "sourdine" },
  { value: "paper", label: "papier" },
  { value: "none", label: "aucune" },
];

export function Inspector() {
  const { sel, update, duplicateNode, removeNode, reorder, projet, style } = useAime();

  if (!sel)
    return (
      <div className="p-5 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-chalk-dim">Inspecteur</p>
        <p className="mt-3 text-sm text-chalk-dim leading-relaxed">
          Sélectionnez un objet sur la grille pour éditer ses six groupes de propriétés universelles.
        </p>
        <p className="mt-4 font-mono text-[9.5px] text-chalk-dim/70 leading-relaxed">
          double-clic : éditer le texte · alt : déplacement libre · flèches : nudge · suppr : retirer
        </p>
      </div>
    );

  const u = (patch: Partial<AimeNode>) => update(sel.id, patch);
  const vars = variablesUtilisees(sel.text + (sel.rows?.map((r) => r.k + r.v).join("") ?? ""));

  return (
    <div className="text-chalk">
      <div className="px-3 py-3 border-b border-line/70 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[9px] text-vermillon tracking-[0.18em]">{sel.id}</p>
          <p className="font-display text-lg leading-tight truncate">{sel.nom}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          <Btn onClick={() => duplicateNode(sel.id)} title="Dupliquer">
            <Copy size={11} />
          </Btn>
          <Btn onClick={() => reorder(sel.id, 1)} title="Avancer d'un plan">
            <Layers size={11} />
          </Btn>
          <Btn tone="danger" onClick={() => removeNode(sel.id)} title="Supprimer">
            <Trash2 size={11} />
          </Btn>
        </div>
      </div>

      <Group titre="1 · Identité">
        <Row label="Nom">
          <input
            value={sel.nom}
            onChange={(e) => u({ nom: e.target.value })}
            className="flex-1 min-w-0 bg-vault-3 border border-line px-1.5 py-[3px] font-mono text-[10px] focus:border-vermillon outline-none"
          />
        </Row>
        <Row label="Rôle">
          <Tag color={style.palette.accent}>{sel.role}</Tag>
          <Tag>{sel.kind}</Tag>
        </Row>
        <Row label="État">
          <Select
            value={sel.etat}
            onChange={(v) => u({ etat: v })}
            options={[
              { value: "brouillon", label: "brouillon" },
              { value: "validé", label: "validé" },
              { value: "livré", label: "livré" },
            ]}
          />
        </Row>
        <Row label="Verrou">
          <Toggle on={sel.locked} onChange={(v) => u({ locked: v })} label={sel.locked ? "verrouillé" : "libre"} />
          {sel.locked ? <Lock size={11} className="text-vermillon" /> : <Unlock size={11} className="text-chalk-dim" />}
        </Row>
      </Group>

      <Group titre="2 · Géométrie">
        <Row label="Colonne X">
          <Num value={sel.x} onChange={(v) => u({ x: v })} min={-4} max={12} />
        </Row>
        <Row label="Ligne Y">
          <Num value={sel.y} onChange={(v) => u({ y: v })} min={-4} max={16} />
        </Row>
        <Row label="Largeur">
          <Num value={sel.w} onChange={(v) => u({ w: v })} min={0.25} max={16} />
        </Row>
        <Row label="Hauteur">
          <Num value={sel.h} onChange={(v) => u({ h: v })} min={0.05} max={18} />
        </Row>
        <Row label="Rotation">
          <Num value={sel.rot} onChange={(v) => u({ rot: v })} min={-45} max={45} step={1} />
        </Row>
        <Row label="Alignement">
          <Select
            value={sel.align}
            onChange={(v) => u({ align: v })}
            options={[
              { value: "left", label: "gauche" },
              { value: "center", label: "centré" },
              { value: "right", label: "droite" },
            ]}
          />
        </Row>
      </Group>

      <Group titre="3 · Matière typographique">
        <Row label="Police">
          <Select
            value={sel.font}
            onChange={(v) => u({ font: v })}
            options={[
              { value: "display", label: "titrage" },
              { value: "body", label: "labeur" },
              { value: "mono", label: "technique" },
            ]}
          />
        </Row>
        <Row label="Corps">
          <Num value={sel.size} onChange={(v) => u({ size: v })} min={0.8} max={30} step={0.1} />
        </Row>
        <Row label="Graisse">
          <Num value={sel.weight} onChange={(v) => u({ weight: v })} min={300} max={800} step={100} />
        </Row>
        <Row label="Interligne">
          <Num value={sel.leading} onChange={(v) => u({ leading: v })} min={0.8} max={2.4} step={0.05} />
        </Row>
        <Row label="Approche">
          <Num value={sel.tracking} onChange={(v) => u({ tracking: v })} min={-0.05} max={0.5} step={0.01} />
        </Row>
        <Row label="Casse">
          <Select
            value={sel.casse}
            onChange={(v) => u({ casse: v })}
            options={[
              { value: "normale", label: "normale" },
              { value: "capitales", label: "capitales" },
              { value: "bas-de-casse", label: "bas de casse" },
            ]}
          />
        </Row>
        <Row label="Italique">
          <Toggle on={sel.italique} onChange={(v) => u({ italique: v })} label={sel.italique ? "oui" : "non"} />
        </Row>
      </Group>

      <Group titre="4 · Chromie et surface">
        <Row label="Encre">
          <Select value={sel.ink} onChange={(v) => u({ ink: v })} options={TOKENS} />
          <span className="w-4 h-4 border border-line" style={{ background: style.palette[sel.ink === "none" ? "muted" : sel.ink] }} />
        </Row>
        <Row label="Fond">
          <Select value={sel.fill} onChange={(v) => u({ fill: v })} options={TOKENS} />
          <span
            className="w-4 h-4 border border-line"
            style={{ background: sel.fill === "none" ? "transparent" : style.palette[sel.fill] }}
          />
        </Row>
        <Row label="Filet">
          <Select value={sel.stroke} onChange={(v) => u({ stroke: v })} options={TOKENS} />
        </Row>
        <Row label="Épaisseur">
          <Num value={sel.strokeW} onChange={(v) => u({ strokeW: v })} min={0} max={1} step={0.02} />
        </Row>
        <Row label="Rayon">
          <Num value={sel.radius} onChange={(v) => u({ radius: v })} min={0} max={200} step={1} />
        </Row>
        <Row label="Opacité">
          <Num value={sel.opacity} onChange={(v) => u({ opacity: v })} min={0.05} max={1} step={0.05} />
        </Row>
      </Group>

      <Group titre="5 · Contenu et données">
        {['titre', 'texte', 'image', 'numero', 'code'].includes(sel.kind) && <div className="shared-binding">
          <label htmlFor="bind-info">Lier à une information</label>
          <select id="bind-info" value={(sel.kind === 'image' ? sel.src : sel.text)?.match(/^\{\{([\w-]+)\}\}$/)?.[1] ?? ''} onChange={e => {
            if (e.target.value) u(sel.kind === 'image' ? { src: '{{' + e.target.value + '}}' } : { text: '{{' + e.target.value + '}}' });
          }}>
            <option value="">Choisir une information…</option>
            {projet.variables.filter(v => sel.kind === 'image' ? v.cle === 'photo' : !['photo', 'studio_data_version', 'palette'].includes(v.cle)).map(v => <option key={v.cle} value={v.cle}>{v.cle}</option>)}
          </select>
          <p>Le contenu lié suit les informations du projet. Saisir un texte libre le rend indépendant.</p>
        </div>}

        {sel.kind === "image" ? (
          <Row label="Source">
            <Select
              value={sel.src ?? "/img/m2.jpg"}
              onChange={(v) => u({ src: v })}
              options={[
                { value: "/img/m1.jpg", label: "mains · cérémonie" },
                { value: "/img/m2.jpg", label: "papier · matière" },
                { value: "/img/m3.jpg", label: "herbier · branche" },
                { value: "/img/m4.jpg", label: "scène · foule" },
              ]}
            />
          </Row>
        ) : sel.kind === "table" ? (
          <div className="space-y-1.5">
            {(sel.rows ?? []).map((r, i) => (
              <div key={i} className="flex gap-1">
                <input
                  value={r.k}
                  onChange={(e) => {
                    const rows = [...(sel.rows ?? [])];
                    rows[i] = { ...rows[i], k: e.target.value };
                    u({ rows });
                  }}
                  className="w-[38%] bg-vault-3 border border-line px-1.5 py-[3px] font-mono text-[10px] focus:border-vermillon outline-none"
                />
                <input
                  value={r.v}
                  onChange={(e) => {
                    const rows = [...(sel.rows ?? [])];
                    rows[i] = { ...rows[i], v: e.target.value };
                    u({ rows });
                  }}
                  className="flex-1 min-w-0 bg-vault-3 border border-line px-1.5 py-[3px] font-mono text-[10px] focus:border-vermillon outline-none"
                />
                <Btn
                  tone="danger"
                  onClick={() => u({ rows: (sel.rows ?? []).filter((_, j) => j !== i) })}
                  title="Retirer la ligne"
                >
                  ×
                </Btn>
              </div>
            ))}
            <Btn onClick={() => u({ rows: [...(sel.rows ?? []), { k: "Clé", v: "Valeur" }] })}>+ ligne</Btn>
          </div>
        ) : (
          <textarea
            value={sel.text}
            onChange={(e) => u({ text: e.target.value })}
            rows={4}
            className="w-full bg-vault-3 border border-line px-2 py-1.5 font-mono text-[11px] leading-relaxed focus:border-vermillon outline-none resize-y"
          />
        )}
        <div className="mt-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-chalk-dim mb-1">Variables liées</p>
          {vars.length ? (
            <div className="flex flex-wrap gap-1">
              {vars.map((v) => (
                <Tag key={v} color={projet.variables.some((x) => x.cle === v) ? "#85a07c" : "#d4512a"}>
                  {"{{"}
                  {v}
                  {"}}"}
                </Tag>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-chalk-dim">Aucune — insérez {"{{cle}}"} pour relier une variable.</p>
          )}
          {sel.kind !== "image" && sel.kind !== "table" && (
            <div className="flex flex-wrap gap-1 mt-2">
              {projet.variables.slice(0, 8).map((v) => (
                <button
                  key={v.cle}
                  onClick={() => u({ text: `${sel.text} {{${v.cle}}}` })}
                  className="font-mono text-[9px] px-1.5 py-0.5 border border-line text-chalk-dim hover:border-sauge hover:text-sauge"
                >
                  +{v.cle}
                </button>
              ))}
            </div>
          )}
        </div>
      </Group>

      <Group titre="6 · Comportement et livraison">
        <Row label="Lien">
          <input
            value={sel.lien ?? ""}
            placeholder="https:// ou aime://"
            onChange={(e) => u({ lien: e.target.value })}
            className="flex-1 min-w-0 bg-vault-3 border border-line px-1.5 py-[3px] font-mono text-[10px] focus:border-vermillon outline-none"
          />
        </Row>
        <Row label="Export">
          <Toggle on={sel.exportable} onChange={(v) => u({ exportable: v })} label={sel.exportable ? "inclus" : "exclu"} />
        </Row>
        <p className="mt-2 font-mono text-[9.5px] leading-relaxed text-chalk-dim">
          Les objets non exportables restent visibles dans l'atelier mais sont retirés des livraisons
          (fichier, impression, publication).
        </p>
      </Group>
    </div>
  );
}
