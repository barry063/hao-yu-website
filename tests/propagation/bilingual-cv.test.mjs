import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { ROOT, loadPublic } from '../../scripts/public-content.mjs';
import { reviewedCV, cvFactsHash } from '../../scripts/reviewed-cv.mjs';
import { inputHashes, removeOwnedDirectory } from '../../scripts/workflow-core.mjs';

const data = loadPublic(path.join(ROOT, 'content/proposals/2026-11-17.json'));
const clone = () => structuredClone(data);

test('English and Chinese frozen PDFs have independent files, source bindings and coverage', () => {
  const hashes = inputHashes();
  for (const [locale, key] of [['en', 'cv_document'], ['zh', 'cv_document_zh']]) {
    const document = data.presentation[key];
    assert.equal(crypto.createHash('sha256').update(reviewedCV(data, locale)).digest('hex'), document.sha256);
    assert.equal(hashes[document.file], document.sha256);
  }
  assert.notEqual(data.presentation.cv_document.sha256, data.presentation.cv_document_zh.sha256);
  assert.ok(!data.presentation.cv_document_zh.selected_output_ids.includes('J4'));
  assert.ok(data.outputs.find(o => o.id === 'J4').selected);
});

test('Chinese document rejects source/byte/selection drift and English-file substitution', () => {
  for (const [field, value, error] of [
    ['sha256', '0'.repeat(64), /CV_SOURCE_HASH/],
    ['export_sha256', '0'.repeat(64), /CV_EXPORT_REVIEW_REQUIRED/],
    ['source_tex_sha256', '0'.repeat(64), /CV_EXPORT_REVIEW_REQUIRED/],
    ['file', data.presentation.cv_document.file, /CV_SOURCE_LOCATION/],
    ['file', 'build-resources/public-cv/2026-11-17/../Hao_Yu_CV_CN.pdf', /CV_SOURCE_LOCATION/],
    ['selected_output_ids', [], /CV_SELECTION_REVIEW_REQUIRED/],
    ['selected_link_ids', ['NONPUBLIC'], /CV_SELECTION_REVIEW_REQUIRED/]
  ]) {
    const changed = clone(); changed.presentation.cv_document_zh[field] = value;
    assert.throws(() => reviewedCV(changed, 'zh'), error);
  }
  const withdrawn = clone(); withdrawn.outputs.find(o => o.id === 'J1').selected = false;
  assert.throws(() => reviewedCV(withdrawn, 'zh'), /CV_SELECTION_REVIEW_REQUIRED/);
  const status = clone(); status.outputs.find(o => o.id === 'S1').status = 'ACCEPTED';
  assert.throws(() => reviewedCV(status, 'zh'), /CV_FACTS_REVIEW_REQUIRED/);
  assert.throws(() => reviewedCV(data, 'unknown'), /CV_LOCALE/);
});

test('Chinese PDF text independently rejects false identity, status, milestone and coverage declarations', () => {
  const parent = path.join(ROOT, 'tmp');
  const base = path.join(parent, 'bilingual-cv-check-' + crypto.randomUUID());
  fs.mkdirSync(base, {recursive: true});
  const run = (value, pdf = data.presentation.cv_document_zh.file) => {
    value = structuredClone(value);
    value.presentation.cv_document_zh.facts_sha256 = cvFactsHash(value);
    const file = path.join(base, 'data.json');
    fs.writeFileSync(file, JSON.stringify(value));
    return spawnSync(process.env.SITE_PYTHON || 'python',
      [path.join(ROOT, 'scripts/check_public_cv.py'), path.join(ROOT, pdf), file, '--locale', 'zh'],
      {encoding: 'utf8'});
  };
  try {
    const valid = run(data); assert.equal(valid.status, 0, valid.stderr);
    const identity = clone(); identity.profile.name = 'Another Person';
    assert.match(run(identity).stderr, /Missing shared profile field/);
    const status = clone(); status.outputs.find(o => o.id === 'S1').status = 'ACCEPTED';
    assert.match(run(status).stderr, /Manuscript status differs/);
    const milestone = clone();
    milestone.qualification_events.push({...milestone.qualification_events[0], id:'AWARDED', kind:'DEGREE_AWARDED', date:'2026-11-17'});
    assert.match(run(milestone).stderr, /Qualification milestone differs/);
    const coverage = clone(); coverage.presentation.cv_document_zh.selected_output_ids = coverage.presentation.cv_document_zh.selected_output_ids.filter(id => id !== 'J1');
    assert.match(run(coverage).stderr, /Undeclared Chinese CV output/);
    const swapped = clone(); swapped.presentation.cv_document_zh.sha256 = swapped.presentation.cv_document.sha256;
    swapped.presentation.cv_document_zh.pages = swapped.presentation.cv_document.pages;
    assert.match(run(swapped, swapped.presentation.cv_document.file).stderr, /Missing Chinese profile field/);
    const date = clone(); date.presentation.cv_document_zh.date = '2026-11-18';
    assert.match(run(date).stderr, /Incorrect Chinese CV update date/);
  } finally { removeOwnedDirectory(parent, base); }
});
