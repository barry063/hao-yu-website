import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { ROOT, loadPublic, validatePublic } from '../../scripts/public-content.mjs';
import { reviewedCV, cvFactsHash } from '../../scripts/reviewed-cv.mjs';
import { buildSite } from '../../scripts/build-site.mjs';
import { inputHashes, removeOwnedDirectory } from '../../scripts/workflow-core.mjs';
import { renderSite } from '../../scripts/render-site.mjs';

const input = path.join(ROOT, 'content/proposals/2026-11-06.json');
const data = loadPublic(input);

test('legacy and dated reviewed PDFs retain independent hashes and candidate input bindings', () => {
  const dated=loadPublic(path.join(ROOT,'content/proposals/2026-11-12.json'));
  assert.notEqual(dated.presentation.cv_document.file,data.presentation.cv_document.file);
  for(const value of [data,dated]) {
    validatePublic(value);
    const document=value.presentation.cv_document;
    assert.equal(crypto.createHash('sha256').update(reviewedCV(value)).digest('hex'),document.sha256);
    assert.equal(inputHashes()[document.file],document.sha256);
  }
  const replaced=structuredClone(dated);replaced.presentation.cv_document.file=data.presentation.cv_document.file;
  assert.throws(()=>reviewedCV(replaced),/CV_SOURCE_HASH/);
});

test('reviewed master PDF refuses changed bytes, export drift, unsafe paths and invalid dates', () => {
  assert.ok(reviewedCV(data).subarray(0, 5).equals(Buffer.from('%PDF-')));
  for (const [field, value, error] of [['sha256', '0'.repeat(64), /CV_SOURCE_HASH/],
    ['export_sha256', '0'.repeat(64), /CV_EXPORT_REVIEW_REQUIRED/],
    ['file', '../private-master.pdf', /CV_SOURCE_LOCATION/],
    ['file', 'build-resources/public-cv/2026-11-12/../Hao_Yu_CV.pdf', /CV_SOURCE_LOCATION/]]) {
    const changed = structuredClone(data); changed.presentation.cv_document[field] = value;
    assert.throws(() => reviewedCV(changed), error);
  }
  const badDate = structuredClone(data); badDate.presentation.cv_document.date = '2026-02-30';
  assert.throws(() => validatePublic(badDate), /Invalid reviewed CV date/);
  assert.equal(inputHashes()[data.presentation.cv_document.file], data.presentation.cv_document.sha256);
  for (const change of [d => d.outputs.splice(1, 1), d => {d.outputs[1].selected = false;},
    d => {d.outputs.find(o => o.id === 'S1').status = 'ACCEPTED';}]) {
    const changed = structuredClone(data); change(changed);
    assert.throws(() => reviewedCV(changed), /CV_FACTS_REVIEW_REQUIRED/);
  }
});

test('rebuild preserves the reviewed PDF exactly and labels its own date independently of page review', () => {
  const parent = path.join(ROOT, 'tmp/candidates');
  const base = path.join(parent, 'reviewed-cv-test-' + crypto.randomUUID());
  try {
    const a = buildSite({input, out: path.join(base, 'a')});
    const b = buildSite({input, out: path.join(base, 'b')});
    assert.deepEqual(a.hashes, b.hashes);
    assert.equal(a.hashes['assets/Hao_Yu_CV.pdf'], data.presentation.cv_document.sha256);
    const later = structuredClone(data); later.release_date = '2026-11-07';
    const html = renderSite(later);
    assert.ok(html.includes('Public CV updated <time datetime="2026-11-06">'));
    assert.ok(html.includes('Last content review: <time datetime="2026-11-07">'));
  } finally { if (fs.existsSync(base)) removeOwnedDirectory(parent, base); }
});

test('frozen CV rejects changed shared identity, manuscript status or qualification milestone', () => {
  const parent = path.join(ROOT, 'tmp');
  const base = path.join(parent, 'reviewed-cv-check-' + crypto.randomUUID());
  fs.mkdirSync(base, {recursive: true});
  const pdf = path.join(ROOT, data.presentation.cv_document.file);
  const run = value => {
    // Even a manually renewed declaration must still agree with actual PDF text.
    value = structuredClone(value); value.presentation.cv_document.facts_sha256 = cvFactsHash(value);
    const file = path.join(base, 'data.json'); fs.writeFileSync(file, JSON.stringify(value));
    return spawnSync(process.env.SITE_PYTHON || 'python', [path.join(ROOT, 'scripts/check_public_cv.py'), pdf, file], {encoding: 'utf8'});
  };
  try {
    const valid = run(data); assert.equal(valid.status, 0, valid.stderr);
    const changedName = structuredClone(data); changedName.profile.name = 'Another Person';
    assert.match(run(changedName).stderr, /Missing shared profile field/);
    const accepted = structuredClone(data); accepted.outputs.find(o => o.id === 'S1').status = 'ACCEPTED';
    assert.match(run(accepted).stderr, /Manuscript status differs/);
    const awarded = structuredClone(data);
    awarded.qualification_events.push({...awarded.qualification_events[0], id:'AWARDED', kind:'DEGREE_AWARDED', date:'2026-11-07'});
    assert.match(run(awarded).stderr, /Qualification milestone differs/);
  } finally { removeOwnedDirectory(parent, base); }
});
