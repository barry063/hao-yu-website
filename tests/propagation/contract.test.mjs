import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadPublic, validatePublic, normalise, selectPublicFields } from '../../scripts/public-content.mjs';
const fixtures = path.join(ROOT,'tests/fixtures/propagation');
const valid = JSON.parse(fs.readFileSync(path.join(fixtures,'valid.json')));
test('synthetic public contract covers typed entities and separate qualification milestones', () => {
  validatePublic(valid);
  assert.equal(valid.qualification_events[0].kind,'THESIS_SUBMITTED');
  assert.ok(!valid.qualification_events.some(e => e.kind === 'DEGREE_AWARDED'));
  const withViva = structuredClone(valid);
  withViva.qualification_events.push({...withViva.qualification_events[0],id:'VIVA-TEST',kind:'VIVA_COMPLETED'});
  validatePublic(withViva);
  assert.ok(!normalise(withViva).site.role.includes('Dr'));
});
for (const filename of fs.readdirSync(fixtures).filter(f => f.startsWith('invalid-'))) {
  test(`reject ${filename}`, () => {
    const change = JSON.parse(fs.readFileSync(path.join(fixtures,filename))), input = structuredClone(valid);
    const keys = change.path.split('.'); let object = input;
    for (const key of keys.slice(0,-1)) object = object[key];
    object[keys.at(-1)] = change.value;
    assert.throws(() => validatePublic(input));
  });
}
test('allowlisted field projection omits unknown canonical fields at every level', () => {
  const raw = structuredClone(valid.outputs[0]);
  raw.private_notes='SYNTHETIC_PRIVATE_SENTINEL'; raw.provenance.referee='SYNTHETIC_PRIVATE_SENTINEL';
  raw.links[0].credential='SYNTHETIC_PRIVATE_SENTINEL';
  const selected = selectPublicFields('outputs',raw);
  assert.ok(!JSON.stringify(selected).includes('SYNTHETIC_PRIVATE_SENTINEL'));
  for (const visibility of ['PRIVATE','HOLD']) {
    raw.provenance.visibility=visibility;
    assert.equal(selectPublicFields('outputs',raw),null);
  }
  raw.provenance.visibility='PUBLIC';raw.provenance.evidence_status='SUPPORTED';
  assert.throws(() => selectPublicFields('outputs',raw));
  raw.provenance.evidence_status='UNRECOGNISED';assert.throws(() => selectPublicFields('outputs',raw));
});
test('each dataset field has source ownership, evidence state and dependent output coverage', () => {
  const data = loadPublic(), map = JSON.parse(fs.readFileSync(path.join(ROOT,'schemas/field-ownership.json')));
  const actual=[];
  function walk(value, key, entity) {
    if (key.includes('.provenance') || key.endsWith('.id') || key.endsWith('.selected')) return;
    if (Array.isArray(value)) value.forEach((v,i) => walk(v,`${key}.${i}`,entity));
    else if (value && typeof value === 'object') Object.entries(value).forEach(([k,v]) => walk(v,`${key}.${k}`,entity));
    else actual.push(key);
  }
  for (const [key,value] of Object.entries(data)) {
    if (['schema_version','sources'].includes(key)) continue;
    if (Array.isArray(value)) value.forEach(r => walk(r,r.id,r)); else walk(value,key,value);
  }
  assert.deepEqual([...map.fields.map(f => f.id)].sort(),actual.sort());
  assert.equal(new Set(map.fields.map(f=>f.id)).size,map.fields.length);
  for (const field of map.fields) assert.ok(field.owner && field.outputs.length && field.visibility === 'PUBLIC' && ['VERIFIED','APPLICANT_CONFIRMED'].includes(field.evidence_status));
});
