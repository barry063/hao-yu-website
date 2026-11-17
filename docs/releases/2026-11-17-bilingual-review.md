# Bilingual website candidate review

Superseded after user feedback by the [editorial revision](2026-11-17-bilingual-editorial-review.md).
The results below describe the initial candidate.

Date: 17 November 2026. L02–L06 DONE. Local milestone: `READY_TO_PUBLISH`.
Workflow state: `READY_FOR_REVIEW`. Publication and live verification: `NOT RUN`.

The user requested implementation of the bilingual plan with proper verification,
and both language versions and CV downloads shown before publishing. No approval,
real promotion, commit, push or deployment was performed. Work is on local branch
`content/bilingual-2026-11-17`, starting at `2f81878d596bf91d3fa2d1e7868910f554066e1c`.
The planning changes already in the working tree were preserved.

Exact review candidate:
`af490bafbb86822fa856f1292b825b01cd1cfae11dabcc14b194df801a923089`.
Its package and thirteen visitor outputs are in ignored local candidate storage;
the separate operator-state locator is in `tmp/qa/2026-11-17/operator.json`.
The public-safe source/output hashes and check results are in
[the companion evidence record](2026-11-17-bilingual-review-checks.json).

## Delivered behaviour

- English remains at the existing project root; Simplified Chinese is at `zh/`.
  Both pages provide an English/中文 choice outside the collapsible mobile menu.
  Links work without JavaScript, and the enhanced switch preserves valid section
  fragments. Direct visits, refresh and browser history preserve the chosen page.
- The English page offers only the four-page English public CV. The Chinese page
  offers only the two-page Chinese public CV. Download names, update dates and
  PDF contents match the page language. The original English download URL stays
  compatible. Both assets are public files; this is a navigation rule.
- Thirty-seven selected records have reviewed Chinese presentation fields, with
  31 rendered content records per page and 420 fields in the proposed ownership
  register. Dates, identities, output status, evidence and bibliography stay
  shared. A changed underlying fact invalidates affected translation review.
- English and Chinese HTML use separate canonical URLs, reciprocal language
  alternates, localised metadata and social cards, and one shared Person identity.
  Author highlighting retains the Latin bibliographic name. Both pages appear in
  the sitemap. Chinese browser typography uses system fallbacks; the generated
  social card uses the bundled, hash-pinned Fandol font with its licence retained.
- The release workflow binds both pages, PDFs and all locale/build inputs.
  Previously absent files are recorded in rollback manifests, so the first
  bilingual release can be reversed without leaving its newly added assets.

## Content and CV review

Rechecked the current evidence bank, publication list, contribution inventory,
English wording/export and Chinese source/wording. Eleven planning-source/master
fingerprints are unchanged; seven declared sources are bound into the candidate.
The evidence-bank and English export updates from 17 November are reflected.
No new external publication-status confirmation is implied.

Chinese website text was reviewed against all 37 English/shared records. Published
titles, author lists, journal names and DOIs remain authoritative. Thesis submission
is not presented as an awarded doctorate. Submitted, under-review and in-preparation
work remain distinct; personal measurements and collaborator-acquired data remain
distinct. The tutorial contribution uses bounded co-author wording.

The English public PDF is a derivative of today's four-page master. It preserves
the current English selection, removes telephone fields and the running Academic
CV label, and retains the previously reviewed public links/content adjustments.
The Chinese PDF is a separate two-page general research derivative of the current
Chinese source. It removes telephone fields, application-specific framing and
unsupported numerical student-event claims; confirmed role labels/years remain.
Its website link points to the Chinese page. Selection and length intentionally
differ between the PDFs; both are checked against their own reviewed coverage.

All six PDF pages were rendered with Poppler and visually inspected after the
final edits. Text extraction, embedded fonts, links, milestones/statuses, privacy,
page bounds, exact PDF bytes and source/fact bindings PASS. Final TeX logs contain
zero warnings and no over/underfull boxes. Canonical originals are unchanged.

## Acceptance evidence

| Acceptance IDs | Method and actual result | Evidence |
| --- | --- | --- |
| L02-A–D | Current-source SHA-256 review; independent 37-record translation review; exact 420-field ownership; missing/stale/invalid translation tests PASS | Proposal, proposed register, localisation tests, checks JSON |
| L03-A–D | Four EN and two CN pages compiled/rendered/inspected; independent locale PDF validators and seven focused CV tests PASS | Dated public PDFs; descriptors/checks JSON; private source/render logs |
| L04-A–E | Two HTML documents have zero validator errors/warnings; XML parses; 31 records/24 anchors per locale; metadata, language choice, shared Person, author emphasis and exclusive downloads PASS | Candidate checks, localisation tests, browser results |
| L05-A–D | Dynamic exact manifest; seven-source preparation; source/text/PDF/input invalidation; identical build hashes; actual isolated first-bilingual promotion and rollback PASS | Nine workflow regressions, bilingual build regression, package manifest |
| L05-E | Installed watcher configuration inspected read-only: five original sources, no Chinese sources. Manual candidate preparation reads all seven. No watcher migration performed | Checks JSON; updated operator documentation |
| L06-A | Full regression suite 90/90 PASS, zero skips; final affected suite 22/22 PASS, zero skips; mixed queried/fragment wrong-language CV links rejected | Ignored propagation/final-affected logs; checks JSON |
| L06-B | Both locales: 375/768/1440 px, keyboard/skip/menu, visible switch focus, section preservation, refresh/Back/Forward, reduced motion, no JS and native 200% zoom PASS; screenshots inspected | Exact-candidate browser evidence and final visual captures |
| L06-C | All thirteen visitor files match over project-path HTTP; both directory routes and actual browser PDF downloads/names/bytes PASS; non-visitor files return 404 | Candidate checks, bilingual build test and final-preview.json |
| L06-D | Final source/input/runtime/policy/baseline gate with requireApproval:false PASS; exposure and whitespace checks PASS; review links serve the exact candidate | Integrity/gate/preview checks and this report |

Representative commands used with the existing pinned Python/Playwright runtime:

```text
npm run test:propagation
node --test --test-concurrency=1 tests/propagation/bilingual-build.test.mjs tests/propagation/localisation.test.mjs tests/propagation/bilingual-cv.test.mjs tests/propagation/bilingual-workflow.test.mjs
node scripts/check-candidate.mjs <candidate-visitor> <candidate-data>
<pinned-python> scripts/check_public_cv.py <english-pdf> <candidate-data>
<pinned-python> scripts/check_public_cv.py <chinese-pdf> <candidate-data> --locale zh
```

The real final candidate used `calibrate` and `prepare` with a separate private
review state. Preparation independently repeated HTML/HTTP, both PDF and both-locale
browser checks. `gate(..., requireApproval:false)` then passed without inventing
user approval. The released root dataset/register, generated HTML, old PDF,
portrait/social image, sitemap/robots and Pages configuration retain their bytes.
Shared stylesheet/script source changes remain local to this implementation.

## Resolved attempts and limitations

- Browser-plugin startup failed twice before browser selection because its local
  kernel assets could not be written. The repository's existing isolated Chromium
  checks were used successfully with Chrome 157.0.8103.79, without a user profile.
- Default-sandbox loopback HTTP and Windows junction tests failed with access
  restrictions. Authorised executions outside that sandbox passed the actual
  checks. No access failure is counted as a pass.
- A CV negative test initially reached its page-count guard before its intended
  language-content guard; the fixture was corrected. Production checks were not
  weakened. Chinese DOI wrapping and a privacy-pattern false positive were fixed
  before final PDF validation and visual inspection.
- Independent code review found that PDF URLs with query/fragment suffixes could
  bypass the language checker. Both static/browser checks now compare parsed URL
  paths, and a mixed correct/wrong queried-link regression passes.
- Final refinements bounded the Chinese tutorial authorship wording and widened
  the Chinese contact-label column. Affected tests and exact-candidate browser
  checks were repeated afterwards.
- Full accessibility audit, new checks of unchanged external destinations,
  external indexing/profile account work, installed-watcher migration and live
  deployment verification: `NOT RUN`. Existing W07/P08 deferrals and U06 scope
  remain separate. Required bilingual local acceptance checks are complete.

Next step is L07 only after the user reviews both pages/PDFs and supplies release
authority. Promote the exact package plus matching proposed field register; do
not rebuild or reuse earlier release approval. Recheck the gate before promotion.
