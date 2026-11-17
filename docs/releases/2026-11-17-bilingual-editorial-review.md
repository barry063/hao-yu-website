# Bilingual website editorial revision

Date: 17 November 2026. L02/L04/L06 reverified; L03 remains complete.
Local milestone: `READY_TO_PUBLISH`; workflow: `READY_FOR_REVIEW`.
Publication and live verification: `NOT RUN`.

The user accepted both CVs, requested descriptive photo captions in English and
Chinese, and asked for natural, clear, professional and friendly Chinese website
copy. The review explicitly favours writing for Chinese readers over following
English sentence structure. This is website-only revision authority; it does not
authorise publication of the bilingual site.

New candidate:
`16ed68b83b58b8899e5c618ca6a90e04701a8efbb9f2f08830f12452ce5cf45b`.
It supersedes the earlier `af490baf…` candidate. Both accepted PDFs retain their
exact bytes. The separate review-state locator remains in ignored
`tmp/qa/2026-11-17/operator.json`; the latest preparation and visual checks are in
`tmp/qa/2026-11-17-editorial/`.

## Changes

- English photo caption: **Hao Yu in a suit**. Chinese: **我的正装照**.
  Alternative text also describes the photograph. Location remains in contact
  details and is no longer used as a photo caption.
- Chinese CV heading: **请点击链接下载我的简历了解详细介绍**.
  Contact heading: **欢迎就学术和工作与我交流、指导**.
- Reviewed all 37 Chinese content records and revised 26, plus navigation,
  section headings, contact/download text and two metadata fields. For example,
  the hero now says **低维材料生长与光谱表征**, and research cards use direct
  topic sentences instead of translated rhetorical questions. Contribution and
  experience descriptions use ordinary Chinese phrasing and clear subjects.
- Shared facts, output status, dates, citation titles, contribution boundaries,
  source fingerprints and both CV descriptors are unchanged. English generated
  HTML differs only within the portrait figure. Chinese changes are presentation
  changes; they do not create new qualifications or research claims.

## Verification

| Acceptance | Actual result | Evidence |
| --- | --- | --- |
| L02-A–D | All 37 Chinese records reviewed; 26 rewritten. Seven canonical hashes, shared data and CV fact binding unchanged. Schema, tokens and 420-field ownership PASS | Proposal; source/content integrity; companion checks JSON |
| L04-A–E | Both captions and alternative text updated; exact requested Chinese headings present. HTML/XML, language routes, metadata and language-specific CV links PASS | Fresh candidate checks; final DOM/screenshot review |
| L06-A | Existing affected rendering/build/localisation/CV regressions: 22/22 PASS, zero skips | `tmp/qa/2026-11-17-editorial/affected-final.log` |
| L06-B | Both locales at 375/768/1440 px and native 200% zoom; keyboard/skip/menu/focus, language-switch section/history behaviour, reduced motion and no JS PASS. Caption, hero, CV and contact screenshots inspected; no clipping/overlap | Exact-candidate browser evidence and editorial visual captures |
| L06-C | Thirteen project-path visitor files, directory routes and PDF responses PASS. Both PDF byte hashes match the user-accepted candidate | Candidate manifest and preview integrity |
| L06-D | Fresh input/source/runtime/policy gate with `requireApproval:false`, source preservation, public exposure and whitespace checks PASS | Companion checks JSON and final gate result |

Command used for the affected suite, with the existing pinned runtime:

```text
node --test --test-concurrency=1 tests/propagation/localisation.test.mjs tests/propagation/generator.test.mjs tests/propagation/bilingual-build.test.mjs tests/propagation/bilingual-cv.test.mjs
```

The first run passed 21/22: an existing status-propagation assertion depended on
the old Chinese sentence. It now checks that the correct project renders the new
status and contains neither the old status nor unresolved tokens. This preserves
the behavioural check while allowing editorial wording changes; no production
validation was weakened and no copy-only test was added.

Private calibration was refreshed from the reviewed proposal, preserving the
published baseline. `prepare` independently repeated both-page HTML/HTTP, both
PDF validators and both-locale browser checks. Browser-plugin startup remained
unavailable; the established isolated Chromium workflow completed successfully.

Both PDFs were already accepted and are byte-identical, so they were not edited,
recompiled or visually re-reviewed. Their exact-byte/content validators passed
again. The initial full workflow suite remains documented in the earlier review;
this session reran the checks affected by wording/renderer changes.

Full accessibility audit, external indexing/profile work, installed-watcher
migration, commit/push/publication and live verification remain `NOT RUN`.
No change was made to canonical files, released root content/data/PDFs or the
installed watcher. L07 awaits review of the revised website and release authority.
