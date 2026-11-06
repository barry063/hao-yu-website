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
export function reviewedCV(data) {
  const document = data.presentation.cv_document;
  if (!document) return null;
  if (document.file !== PUBLIC_CV_SOURCE) throw new Error('CV_SOURCE_LOCATION');
  const file = path.join(ROOT, document.file);
  if (fs.realpathSync(file) !== file) throw new Error('CV_SOURCE_LOCATION');
  const bytes = fs.readFileSync(file);
  if (crypto.createHash('sha256').update(bytes).digest('hex') !== document.sha256)
    throw new Error('CV_SOURCE_HASH');
  if (document.export_sha256 !== data.sources.find(s => s.id === 'EXPORT')?.sha256)
    throw new Error('CV_EXPORT_REVIEW_REQUIRED');
  // Clearance loss/deletion must not leave a withdrawn output visible in the PDF.
  if (document.facts_sha256 !== cvFactsHash(data)) throw new Error('CV_FACTS_REVIEW_REQUIRED');
  return bytes;
}
