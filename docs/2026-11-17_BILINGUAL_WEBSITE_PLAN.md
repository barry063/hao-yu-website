# English and Chinese website plan

Date: 17 November 2026. Milestone: `READY_TO_PUBLISH` (local); `READY_FOR_REVIEW` (workflow).
L01–L06 are complete; L02/L04/L06 reverified after editorial feedback; L07 is in progress.
The user subsequently accepted the revised website and explicitly requested
publication of both versions with live language-switch and CV verification.
That instruction authorises approval, promotion, commit/push, PR/merge and the
existing GitHub Pages deployment. Earlier preview-only boundaries are historical.
After reviewing the plan, the user requested implementation with proper
verification and both language versions/CV downloads shown before publishing.
Local candidate preparation is authorised. Commit, push and publication await
the review of this candidate; historical approvals apply to dated releases.

## Proposed visitor experience

| Version | Page address | Sole CV offered by that page |
| --- | --- | --- |
| English | Existing `/hao-yu-website/` | English public CV at `assets/Hao_Yu_CV.pdf` |
| 简体中文 | New `/hao-yu-website/zh/` | Chinese public CV at `../assets/Hao_Yu_CV_CN.pdf` |

Keep the current design and section order. Put **English | 中文** in the header,
visible on desktop and mobile, with the active language clearly indicated.
Use ordinary links: direct visits and refreshes retain the language in the URL,
and the choice works without JavaScript. English remains the default existing
address. No automatic browser-language redirect or language-selection splash page
is proposed. Preserve shared section IDs; JavaScript may carry an existing valid
section fragment across the switch, with normal page links as the fallback.

Each page offers only its own language's CV, including hero, CV section and footer
links wherever present. Both files are public downloads; language selection is a
navigation rule, not access control. Keep the existing English PDF URL compatible.

These defaults use Simplified Chinese, as in the current Chinese CV, and a Chinese
academic profile corresponding to the English website. The full CV can have
different emphasis and length in each language. The website remains a curated
research profile, rather than reproducing every CV section.

Separate language URLs and explicit visitor links follow
[Google's multilingual-site guidance](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites).

## What the source review established

- The website already has a static generator, structured public data and a
  candidate-review/publication workflow. Extend those components and retain
  GitHub Pages; a framework or hosting migration is unnecessary.
- The current English master/export record is dated 17 November, records four
  pages, and matches the current TeX, PDF and evidence-bank hashes. Today's
  English selection changes should be reflected in the refreshed public download.
- `9 Chinese CV/` contains the editable Chinese CV and a current export. The
  export matches its recorded SHA-256; its existing provenance records two pages.
  It is application-oriented and includes telephone fields. Public clearance,
  fresh PDF rendering and website-specific adaptation have not been performed.
- English and Chinese CVs are separate derivatives of one evidence bank. Their
  selection can differ, while qualifications, dates, publication statuses and
  contribution boundaries must agree. Follow the current canonical selection
  rules; do not automatically copy optional Chinese CV sections into English.
- Relative to the released dataset, the evidence-bank and English export-record
  hashes changed. Publication, contribution and English profile hashes did not.
  This is a current-source comparison, not a new external publication-status audit.
- Canonical sources and application versions stay in the CV workspace. Only
  reviewed public wording and public PDF derivatives enter the website repository.
  Continue the established public contact policy: email and professional links;
  omit telephone numbers and postcodes from both public PDFs and pages.

Source fingerprints and planning checks are in
[the planning evidence record](2026-11-17-bilingual-planning-checks.json).
No private application content or contact values are reproduced in this plan.

## Tangible task checklist

Task states and acceptance IDs below are the contract for implementation. Record
actual commands, results and evidence before marking a task DONE. Unavailable
checks remain `NOT RUN`. An optional editorial question affects only its own
content; independent work should continue.

### L01 — Inspect sources and prepare this plan — DONE

- [x] **L01-A:** Inspect clean website status, current update plan, both workspace
  instructions, current English export and Chinese source/export entry points.
  Record hashes and preserve existing files.
- [x] **L01-B:** Specify routes, language choice, per-page download rules, source
  selection, technical changes, verification and release boundaries.
- [x] **L01-C:** Validate planning files, references, task/acceptance coverage,
  public exposure and documentation-only scope; recheck source/visitor hashes.

Evidence: this plan and its checks JSON; the master plan's dated session entry.

### L02 — Prepare reviewed bilingual website content — DONE

Dependency: L01 and an instruction to implement.

- [x] **L02-A:** Recheck current evidence and reconcile changes since 12 November.
  Retain stable record IDs and one shared set of dates, statuses, links and
  contribution facts. Record what changed and what remains unchanged.
- [x] **L02-B:** Add reviewed English and Chinese presentation fields keyed to
  those IDs: navigation, headings, profile, research, output summaries/status
  labels, experience, education, honours, contact, download labels, dates,
  alternative text and accessibility text. Use the Chinese wording library as a
  drafting source, subject to canonical evidence and public visibility review.
- [x] **L02-C:** Check both versions for equivalent factual meaning. Preserve
  degree-pending wording; distinguish submitted, under-review and in-preparation
  outputs, and personal acquisition from collaborator data. Keep published titles,
  author lists, journal names and DOIs in their authoritative form; translate
  explanatory text, with optional clearly labelled title translations.
- [x] **L02-D:** Require complete reviewed Chinese text for selected public
  records; reject missing/stale translations instead of silently filling Chinese
  paragraphs with English. Link translation review to the relevant shared-fact
  revision. Keep Latin bibliographic identity separate from Chinese display name.

Deliverable: bilingual public-content proposal, locale schema/field ownership,
reviewed terminology and a public-safe change/omission record.

### L03 — Prepare one public CV per language — DONE

Dependency: L01 and an instruction to implement; coordinate shared facts with L02.

- [x] **L03-A:** Prepare the English public derivative from the current English
  master. Preserve the earlier public formatting/contact decisions, including
  removal of the running Academic CV label and telephone fields.
- [x] **L03-B:** Prepare a general public Chinese derivative from the current
  source under `9 Chinese CV/`. Review application-specific wording and optional
  sections, use a neutral public filename, omit telephone fields, and point its
  personal-website link to the Chinese page. Preserve the original source/export.
- [x] **L03-C:** Validate each PDF against its own reviewed language and selected
  content. Review all pages visually; check Chinese glyphs, font embedding,
  extractable/searchable text, links, page bounds, metadata and privacy. Page counts
  need not match; do not force equal content or length.
- [x] **L03-D:** Record independent source/export hashes, actual export dates,
  page counts, shared-fact bindings and clearance for both PDFs. Bind the reviewed
  English file to `assets/Hao_Yu_CV.pdf` and Chinese file to
  `assets/Hao_Yu_CV_CN.pdf`; verify exact bytes and language-specific labels.

Deliverable: two reviewed public PDFs and per-language provenance/coverage.
PDF review can proceed independently of website translation once facts agree.

### L04 — Generate both pages and the language switch — DONE

Dependency: L02's public contract; final CV wiring uses L03.

- [x] **L04-A:** Generate `index.html` and `zh/index.html` from the shared template
  and locale text. Keep CSS/JS/assets shared, resolve nested relative paths and
  preserve existing English URLs, anchors and Latin author highlighting.
- [x] **L04-B:** Add keyboard-accessible English/中文 links with current-language
  indication; verify direct visits, refresh, Back/Forward, fragment preservation
  when enhanced, and usable no-JavaScript fallback. Keep the selector accessible
  when the mobile menu is closed. No flag icons or forced redirects are needed.
- [x] **L04-C:** Ensure every CV link on English points to the English PDF and
  every CV link on Chinese points to the Chinese PDF. Match visible labels and
  download filenames to the destination language.
- [x] **L04-D:** Use HTML `lang="en-GB"` / `lang="zh-Hans"`, appropriate Chinese
  font fallbacks and natural wrapping. Review hard-coded English strings and
  forced line breaks throughout template, renderer, metadata and controls.
- [x] **L04-E:** Give each page its own canonical URL, translated title/description
  and social text, and a distinct ProfilePage URL/ID with one shared Person
  identity. Add reciprocal absolute `hreflang="en"` and `hreflang="zh-Hans"`
  links, plus `x-default` to English; include both URLs in the sitemap. Review
  social-card text for each locale, localising it if it contains English wording.

Deliverable: complete English and Chinese preview pages. Language-alternate
annotations follow [Google's localized-page documentation](https://developers.google.com/search/docs/specialty/international/localized-versions).
This is a technical indexing configuration, not a ranking or indexing guarantee.

### L05 — Extend the review and update workflow — DONE

Dependency: L02 contract and L03/L04 interfaces; implementation can overlap L04.

- [x] **L05-A:** Include both HTML pages, both PDFs and every locale input in the
  build, visitor allowlist, candidate hash and input/provenance bindings. A change
  to either language or PDF invalidates prior candidate approval. Repeat builds
  with identical inputs must remain byte-identical.
- [x] **L05-B:** Extend preview directory routing so `/hao-yu-website/zh/` resolves
  correctly. Update candidate, HTML, asset, PDF, HTTP, link, browser and live checks
  to inspect both languages without weakening existing English validation.
- [x] **L05-C:** Support files absent from the previous release in backup,
  promotion and rollback. Prove the first bilingual release can add Chinese files,
  and rollback restores prior files and removes only introduced release files.
- [x] **L05-D:** Extend canonical source/calibration handling for Chinese inputs
  and document the update sequence: recheck facts → review affected translations
  and PDFs → build both → review one candidate → publish when authorised.
  Simulate a fact, translation and Chinese-CV change and prove stale content or
  old approval cannot pass the release gate.
- [x] **L05-E:** Document the installed watcher's actual coverage separately.
  Repository changes do not update its private installed configuration. The
  initial bilingual release uses an explicit manual preparation step that reads
  both source sets. Installed watcher migration is deferred unless separately
  requested; do not claim automatic Chinese-source watching or publication.

Deliverable: verified bilingual candidate/release workflow and operator guide.
The manual update route makes watcher installation independent of this release.

### L06 — Verify and present the complete candidate — DONE

Dependency: L02–L05.

- [x] **L06-A:** Run schema/ownership, generation, HTML/JSON-LD/XML, link/anchor,
  privacy and workflow regressions. Add meaningful failure cases for missing or
  stale Chinese text, wrong-language PDF links, nested-path failures, modified
  PDFs and first-release rollback. Record counts and actual results.
- [x] **L06-B:** Inspect both languages at 375, 768 and 1440 CSS pixels and 200%
  zoom. Exercise keyboard/skip/menu controls, visible focus, language switching,
  reduced motion and no-JavaScript operation. Check Chinese line wrapping,
  scientific notation, navigation spacing and absence of horizontal overflow.
- [x] **L06-C:** Serve under `/hao-yu-website/` and test both page URLs directly,
  all assets and both PDF downloads over HTTP. Match reviewed PDF bytes; assert
  each page offers only its correct CV. Finish both PDFs' visual/text checks.
- [x] **L06-D:** Recheck canonical/input hashes and repository exposure. Present
  both preview URLs and both public PDFs together with a concise change report.
  Mark `READY_TO_PUBLISH` only after required local acceptance checks pass.

Deliverable: one reviewable bilingual candidate, screenshots kept in ignored QA
storage, public-safe verification report and exact candidate hash.

### L07 — Publish and verify both versions — IN_PROGRESS

Dependency: L06 and applicable user publication authority for that candidate.

- [ ] **L07-A:** Recheck the exact candidate and current GitHub Pages main/root
  route; commit/push/PR/merge only within the release instruction supplied then.
- [ ] **L07-B:** Confirm successful deployment and check both public pages,
  language switch, metadata, shared assets and PDF byte hashes against the
  reviewed candidate. Record revision, date, URLs and actual live browser results.
- [ ] **L07-C:** Mark `LIVE_VERIFIED` only after live checks pass; update this
  checklist, master tracker and continuation notes with remaining work.

Deliverable: verified live bilingual website and two correct public downloads.

## Implementation map

These are inspected integration points, not changes already made.

| Area | Existing files to extend |
| --- | --- |
| Public facts, locale wording and per-language CV records | `content/site.json`, `schemas/public-content.schema.json`, `schemas/field-ownership.json`, `scripts/public-content.mjs` |
| Presentation and generation | `templates/index.html`, `scripts/render-site.mjs`, `scripts/build-site.mjs`, `styles.css`, `script.js` |
| Reviewed PDFs | `scripts/reviewed-cv.mjs`, `scripts/check_reviewed_cv.py`, `scripts/check_public_cv.py`, dated public-PDF build resources |
| Source preparation and exact review | `scripts/canonical-adapters.mjs`, `scripts/prepare-update.mjs`, `scripts/workflow-core.mjs`, review helpers |
| Preview, release and verification | `scripts/preview.mjs`, `scripts/release-workflow.mjs`, candidate/site/preview/live/link/browser checks, `package.json`, propagation/navigation tests |
| Operating instructions | `README.md`, `docs/CONTENT_PROPAGATION_PLAN.md`, this plan and `docs/WEBSITE_UPDATE_PLAN.md` |

Specific findings: the schema currently permits one fixed CV destination; the
renderer/template and PDF assertions assume English; author highlighting uses
the display name; the visitor manifest is fixed; preview routing maps only the
root directory; backup/copy logic assumes release files already exist. Address
these explicitly rather than adding an isolated switch to generated HTML.

## Initial planning verification

L01-A–C PASS with methods/results in the checks JSON. The starting website and
Chinese checkout were clean. That planning session changed only three planning documents.
Canonical files, generated visitor files, public data, PDFs, implementation and
installed watcher configuration remain unchanged.

Implementation, new PDF visual review, new candidate generation, browser QA,
installed-watcher migration, commit/push/publication and live checks: `NOT RUN`.
Prior dated release results remain historical evidence, not bilingual validation.
U06 external indexing/profile access and deferred W07/P08 work do not block local
bilingual preparation. Next executable tasks after an implementation instruction:
L02 and L03; no additional preference is required to start with these defaults.

## Implementation handoff — 17 November 2026

L02–L06 DONE. All their acceptance IDs PASS with actual methods and evidence in
[the bilingual candidate report](releases/2026-11-17-bilingual-review.md) and
[checks JSON](releases/2026-11-17-bilingual-review-checks.json). The earlier NOT RUN
statements above describe the planning session; implementation and required local
verification are now complete. Full suite: 90/90; final affected checks: 22/22;
zero skips. Both pages and both PDFs passed final candidate/browser verification.

Candidate: `af490bafbb86822fa856f1292b825b01cd1cfae11dabcc14b194df801a923089`.
Local READY_TO_PUBLISH; workflow READY_FOR_REVIEW. Both previews and CV downloads
are available for user review. L07 is pending that review and release authority;
no approval, promotion, commit, push or publication has been performed. Original
canonical files and released generated HTML/data/PDFs remain unchanged. Installed
watcher still covers its five original sources; manual preparation reads seven.
No technical dependency blocks the candidate.

## Editorial feedback — 17 November 2026

The user accepted both CVs and requested descriptive photo captions in both
languages, their proposed Chinese CV/contact headings, and a full Chinese prose
review for natural, clear, professional and friendly writing. Rewrite Chinese
presentation without requiring English sentence-by-sentence phrasing. Preserve
shared facts, contribution/status boundaries, authoritative bibliography and
approved PDF bytes. Reopen L02/L04/L06, replace the review candidate after affected
checks, and present the revised local previews. Publication remains pending.

## Revised editorial handoff — 17 November 2026

L02/L04/L06 reverified. The current candidate is `16ed68b83b58b8899e5c618ca6a90e04701a8efbb9f2f08830f12452ce5cf45b`;
it supersedes the initial candidate above. Captions and Chinese copy now follow
the user's review. All 37 Chinese records reviewed; 26 revised. Accepted CVs and
shared facts unchanged. Affected tests 22/22 PASS; fresh both-locale browser,
HTML/HTTP/PDF checks and final visual inspection PASS. See the
[editorial report](releases/2026-11-17-bilingual-editorial-review.md) and
[checks JSON](releases/2026-11-17-bilingual-editorial-review-checks.json).

For future Chinese edits, write directly for a Chinese academic/professional
audience, preserving evidence and meaning without copying English syntax. Use
clear topic descriptions, concrete verbs and natural invitations; avoid abstract
slogans and literal rhetorical questions. Use photo descriptions as captions,
with location in contact details. L07 remains pending review/release authority.
