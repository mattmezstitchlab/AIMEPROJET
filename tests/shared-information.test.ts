import { test } from 'node:test';
import assert from 'node:assert/strict';
import { migrateEvent, readEvent, updateVariables } from '../src/lib/event-data';
import { linkedComposition } from '../src/lib/linked-composition';
import { interpolate } from '../src/lib/build';
import { compositionHTML } from '../src/lib/export';
import { styleById } from '../src/lib/styles';
import { supportById } from '../src/lib/supports';

test('previous kit migrates once and does not overwrite later shared edits', () => {
  const previous = [{ cle:'evenement', valeur:'Demo', note:'' }, { cle:'invite', valeur:'Camille', note:'' }];
  const legacy = { title:'Fête du quartier', date:'2026-12-10', image:'data:image/png;base64,abc' };
  const migrated = migrateEvent(previous, legacy);
  assert.equal(readEvent(migrated).title, legacy.title);
  assert.equal(readEvent(migrated).image, legacy.image);
  assert.equal(migrated.find(v => v.cle === 'invite')?.valeur, 'Camille');
  const edited = updateVariables(migrated, 'evenement', 'Nouveau titre');
  assert.equal(readEvent(migrateEvent(edited, legacy)).title, 'Nouveau titre');
});
test('date edits update the printable date without affecting unrelated variables', () => {
  const vars = updateVariables(migrateEvent([], null), 'date_iso', '2026-12-10');
  assert.equal(vars.find(v => v.cle === 'date')?.valeur, '10 décembre 2026');
  assert.equal(readEvent(vars).date, '2026-12-10');
});
test('all linked formats follow project edits while keeping geometry', () => {
  const compositions = (['poster','social','invitation'] as const).map(linkedComposition);
  const before = JSON.stringify(compositions);
  let variables = migrateEvent([], null);
  variables = updateVariables(variables, 'evenement', 'Notre nouveau titre');
  variables = updateVariables(variables, 'lieu', 'Nouveau lieu');
  variables = updateVariables(variables, 'photo', 'data:image/png;base64,abc');
  for (const composition of compositions) {
    assert.equal(interpolate(composition.nodes.find(n => n.role === 'titre')!.text, variables), 'Notre nouveau titre');
    assert.equal(interpolate(composition.nodes.find(n => n.kind === 'image')!.src!, variables), 'data:image/png;base64,abc');
    assert.match(interpolate(composition.nodes.find(n => n.nom === 'Lieu et tarif liés')!.text, variables), /Nouveau lieu/);
  }
  assert.equal(JSON.stringify(compositions), before);
});
test('HTML exports resolve shared images without prefixing data URLs and escape user text', () => {
  const composition = linkedComposition('poster');
  let variables = migrateEvent([], null);
  variables = updateVariables(variables, 'evenement', '<script>alert(1)</script>');
  variables = updateVariables(variables, 'photo', 'data:image/png;base64,abc');
  const html = compositionHTML(composition, styleById('studio-clair'), supportById('a4'), variables, 'https://example.org');
  assert.match(html, /src="data:image\/png;base64,abc"/);
  assert.ok(!html.includes('https://example.orgdata:'));
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.match(html, /&lt;script&gt;/);
});

test('postal coordinates are reusable tokens without changing existing documents', () => {
  let variables = migrateEvent([], null);
  variables = updateVariables(variables, 'adresse_destinataire', '12 rue des Lilas');
  variables = updateVariables(variables, 'code_postal_destinataire', '44000');
  variables = updateVariables(variables, 'ville_destinataire', 'Nantes');
  const address = '{{adresse_destinataire}} · {{code_postal_destinataire}} {{ville_destinataire}}';
  assert.equal(interpolate(address, variables), '12 rue des Lilas · 44000 Nantes');
  variables = updateVariables(variables, 'ville_destinataire', 'Rezé');
  assert.equal(interpolate(address, variables), '12 rue des Lilas · 44000 Rezé');
  assert.ok(address.includes('{{ville_destinataire}}'));
});
