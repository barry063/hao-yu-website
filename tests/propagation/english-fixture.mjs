import { loadPublic } from '../../scripts/public-content.mjs';

/** English mutation scenarios must not carry an unrelated frozen Chinese review.
 * Bilingual review invalidation and propagation use the complete dataset in the
 * bilingual/localisation suites. Keep shared public facts current in both cases.
 */
export function loadEnglishFixture() {
  const data = loadPublic();
  delete data.localisation;
  delete data.presentation.cv_document_zh;
  data.sources = data.sources.filter(source => !['CN_CV', 'CN_WORDING'].includes(source.id));
  return data;
}
