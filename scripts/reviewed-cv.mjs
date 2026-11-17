/** A deliberately reviewed public PDF; never reads the private master workspace. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ROOT } from './public-content.mjs';

export const PUBLIC_CV_SOURCE = 'build-resources/public-cv/Hao_Yu_CV.pdf';
export function cvFactsHash(data) {
  const clean = value => Array.isArray(value) ? value.map(clean) : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).filter(k => k !== 'provenance').sort().map(k => [k, clean(value[k])])) : value;
  const fields = ['awards','experience','links','outputs','profile','qualification_events','qualifications'];
  return crypto.createHash('sha256').update(JSON.stringify(Object.fromEntries(fields.map(k => [k, clean(data[k])])))).digest('hex');
}
export function reviewedCV(data, locale = 'en') {
  if (!['en', 'zh'].includes(locale)) throw new Error('CV_LOCALE');
  const document = data.presentation[locale === 'zh' ? 'cv_document_zh' : 'cv_document'];
  if (!document) return null;
  const pattern = locale === 'zh'
    ? /^build-resources\/public-cv\/(?:\d{4}-\d{2}-\d{2}\/)?Hao_Yu_CV_CN\.pdf$/
    : /^build-resources\/public-cv\/(?:\d{4}-\d{2}-\d{2}\/)?Hao_Yu_CV\.pdf$/;
  if (!pattern.test(document.file)) throw new Error('CV_SOURCE_LOCATION');
  const file = path.join(ROOT, document.file);
  if (fs.realpathSync(file) !== file) throw new Error('CV_SOURCE_LOCATION');
  const bytes = fs.readFileSync(file);
  if (crypto.createHash('sha256').update(bytes).digest('hex') !== document.sha256)
    throw new Error('CV_SOURCE_HASH');
  const source = data.sources.find(s => s.id === (locale === 'zh' ? 'CN_CV' : 'EXPORT'));
  if (!source || document.export_sha256 !== source.sha256)
    throw new Error('CV_EXPORT_REVIEW_REQUIRED');
  if (locale === 'zh') {
    if (document.source_tex_sha256 !== source.sha256) throw new Error('CV_EXPORT_REVIEW_REQUIRED');
    for (const [field, records] of [['selected_output_ids', data.outputs], ['selected_link_ids', data.links]]) {
      const ids = document[field];
      if (!Array.isArray(ids) || !ids.length || new Set(ids).size !== ids.length ||
          ids.some(id => !records.some(r => r.id === id && r.selected && r.provenance.visibility === 'PUBLIC')))
        throw new Error('CV_SELECTION_REVIEW_REQUIRED');
    }
  }
  // Clearance loss/deletion must not leave a withdrawn output visible in the PDF.
  if (document.facts_sha256 !== cvFactsHash(data)) throw new Error('CV_FACTS_REVIEW_REQUIRED');
  return bytes;
}
