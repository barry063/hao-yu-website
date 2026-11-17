# 17 November bilingual website release

State: `PUBLISHING`; L07 IN_PROGRESS. Live verification is pending.

The user accepted the revised English and Chinese website and explicitly
requested publication followed by live language-switch and matching CV checks.
Candidate: `16ed68b83b58b8899e5c618ca6a90e04701a8efbb9f2f08830f12452ce5cf45b`.
The [editorial review](2026-11-17-bilingual-editorial-review.md) records the exact
reviewed wording and accepted PDFs; the earlier local-only boundary is historical.

The pre-publication gate rechecked seven canonical sources, build/runtime inputs,
policy, baseline and all thirteen candidate outputs. All matched. The user’s
publication decision was recorded verbatim against this candidate. Promotion
copied existing approved bytes without rebuilding; the matching 420-field
ownership register was promoted with the dataset. Canonical files remain unchanged.

Current GitHub Pages hosting was confirmed as the existing public
`main` branch/root route at `https://barry063.github.io/hao-yu-website/`.
An independent read-only audit found no private evidence documents, application
archives, contact identifiers or credentials among the intended release files.
Both approved PDF input/output hashes match exactly; each page offers only its
matching-language CV. The private previous-release backup passed rollback
validation; no restoration was performed.

Post-promotion `npm run check` passed for both HTML pages: zero HTML errors or
warnings, sitemap XML parsing, 31 public records and 24 anchors per locale, and
seven navigation tests. The full post-promotion regression suite passed 90/90,
with zero failures or skips. Its initial run exposed 31 legacy-fixture failures
after the bilingual dataset became the released root. English mutation scenarios
now explicitly project English data, preserving all shared facts; the bilingual
suites still exercise complete locale review and invalidation. Only test fixtures
changed during this correction. All 47 candidate-bound inputs, thirteen visitor
files and the dataset were rechecked unchanged after the full suite. Logs remain
in ignored tmp/qa/2026-11-17-release/. Live verification is still pending.
