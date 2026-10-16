import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterPeople, readPeople, samplePeople, siteHTML, safeWeb } from '../src/lib/universes';
test('one identity can be both provider and guest, found by activity or role',()=>{
 const p={...samplePeople[0],name:'Éloïse',roles:['Prestataire','Invité'],activities:['Photographie','Musicien']};
 assert.equal(filterPeople([p],'eloise','images').length,1);
 assert.equal(filterPeople([p],'invité','ambiance').length,1);
 assert.equal(filterPeople([p],'','table').length,0);
});
test('registry rejects malformed entries and accepts complete cards',()=>{
 assert.deepEqual(readPeople('invalid'),[]);
 assert.deepEqual(readPeople(JSON.stringify([{name:'incomplete'}])),[]);
 assert.equal(readPeople(JSON.stringify(samplePeople)).length,2);
 assert.deepEqual(readPeople(JSON.stringify([{...samplePeople[0],roles:[1]}])),[]);
});
test('site export escapes text and rejects injected styles, images and unsafe URLs',()=>{
 const html=siteHTML('<script>bad()</script>','Test',[{title:'Bio',text:'<img src=x onerror=bad()>'}], 'javascript:bad()', 'red;}body{display:none}', 'serif');
 assert.ok(!html.includes('<script>'));
 assert.ok(!html.includes('<img src=x'));
 assert.ok(!html.includes('javascript:'));
 assert.ok(!html.includes('display:none'));
 assert.ok(html.includes('&lt;script&gt;'));
 assert.equal(safeWeb('javascript:alert(1)'),'');
 assert.equal(safeWeb('https://example.org'),'https://example.org');
});
test('editing profile fields changes exports without mutating the card',()=>{
 const person=samplePeople[0];
 const before=JSON.stringify(person);
 const html=siteHTML(person.name,person.headline,[{title:'Parcours',text:person.journey},{title:'Tarifs',text:person.prices}],person.image,person.color,person.font);
 assert.ok(html.includes(person.name));
 assert.ok(html.includes(person.journey));
 assert.equal(JSON.stringify(person),before);
});
