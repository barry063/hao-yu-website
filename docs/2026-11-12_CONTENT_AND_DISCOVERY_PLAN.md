# Evidence refresh and search discovery — 12 November 2026

Implementation instruction: the user subsequently requested the planned content
and SEO changes, refreshed public CV and verification, with the result shown
before publishing. U02–U04 are DONE: local READY_TO_PUBLISH and workflow
READY_FOR_REVIEW. See the [candidate review](releases/2026-11-12-content-seo-review.md)
and [checks](releases/2026-11-12-content-seo-review-checks.json).
Use a dated public PDF asset to preserve the released and historical reviewed
PDFs. No commit, push, promotion or publication is authorised in this session.

Original planning status: `PLAN_READY_FOR_REVIEW`. The planning session prepared the requested change plan
and assesses the supplied recommendations. It does not implement or publish a
new visitor release. Baseline: clean `main` at `d0d2ddd`, following the verified
6 November release. Historical publication authority belongs to that release.

## Evidence review and editorial decisions

All five declared canonical fingerprints have changed since the released
`content/site.json`: EB, PUB, CONTRIB, PROFILE and EXPORT. The current evidence
bank is `v3-reconciled-2026-11-12`; the master export is dated 12 November and
remains four pages. Exact hashes and checks are in
[the planning evidence](2026-11-12-planning-checks.json).

This is a comparison of current evidence, dated source entries and released
claims, not a complete historical text diff of the private evidence bank.
The main new output was recorded on 12 November; the optical-alignment evidence
was confirmed on 9 November. Neither date should be invented as an activity or
manuscript-submission date.

| ID | Source and change | Proposed website treatment | Boundaries |
| --- | --- | --- | --- |
| C12-01 | EB §§3.9,5.2; PUB/CONTRIB S2: imaging spectroscopic ellipsometry tutorial submitted to Materials for Quantum Technology | Add output S2 under a distinct **Submitted** group, using the existing status enum. Keep four published articles, S1 under review and P1 in preparation unchanged. | No acceptance, external-review, DOI, final publication year or exact submission-date claim. Omit submission references, manuscript files and unpublished full author lists. |
| C12-02 | EB §3.9 and §13.2: WS2/MoS2 samples, growth recipes and Raman spectral-analysis workflow | Put the bounded contribution in S2's output description. Keep the five selected project cards; a sixth card or larger hero rewrite is unnecessary. | Sample provision has manuscript attribution; the richer recipe/workflow contribution is applicant-confirmed. No independent ellipsometer operation, optical modelling, tutorial leadership or RamanPL_2D adoption claim. |
| C12-03 | EB §3.6 and §7.2: fibre-to-chip alignment and polarisation optimisation, confirmed 9 November | Add one concrete sentence to PROJECT-PHOTONICS. Keep J3's published contribution and correction link. | No complete test-bed construction, automation, independent optical-system design or additional cleanroom/performance claims. Do not rewrite the published author-contribution statement as if the new confirmation appeared in the paper. |
| C12-04 | Current master source/PDF and EXPORT refreshed on 12 November | Prepare a fresh four-page public master derivative, retaining the established format. Synchronise S2 and check photonics wording. | Preserve canonical files. Retain previous removal of mobile number and running Academic CV label; additionally remove private manuscript references wherever present. No raw master, manuscript or application archive enters this repository. |

Suggested public output title:

> Imaging Spectroscopic Ellipsometry of Van der Waals Quantum Materials: A Practical Tutorial

Suggested S2 description:

> Co-authored tutorial submitted to Materials for Quantum Technology. Contributed
> WS₂ and MoS₂ samples, growth recipes and a Raman spectral-analysis workflow.

Suggested addition to PROJECT-PHOTONICS:

> I aligned fibre-to-chip coupling and optimised polarisation for optical
> transmission measurements in the Oxford micro-ring resonator project.

These are proposed public formulations. Use `APPLICANT_CONFIRMED` for the richer
personal contribution, with separate manuscript-attribution provenance. Keep
PhD researcher / thesis submitted 30 September 2026; no new viva or degree-award
milestone is established. XRD, Raman SOP/training, academic representation,
laboratory support, Oxford classification and posters already appear in the
6 November release and should not be presented as new discoveries.

## Assessment of the search recommendations

The recommendations are broadly sound. Treat indexing diagnostics, identity
clarity and ranking as separate questions. Evidence refresh is the first website
task; account-dependent discovery work can proceed alongside implementation.

| Recommendation | Decision | Concrete action / acceptance |
| --- | --- | --- |
| Confirm indexing with Search Console | High-priority diagnostic; agree | Use URL-prefix property `https://barry063.github.io/hao-yu-website/`. Record the indexed URL status, last crawl and Google-selected canonical; distinguish the live URL test from indexed status. Submit the existing sitemap and request indexing after the substantive release. |
| Cambridge/Hofmann and personal-profile links | Agree; useful for discovery and identity, with unknown ranking effect | Check whether each existing profile actually links to the canonical homepage. Prioritise a relevant institutional link, then LinkedIn, ORCID, Scholar and GitHub website fields. A website `sameAs` link to Cambridge does not create the reverse institutional link. |
| Add Cambridge to the title | Include in this release | Proposed title: `Hao Yu | Materials Growth & Spectroscopy | Cambridge`. Use profile tokens for the name/institution-short where supported. Synchronise title/OG/Twitter through the generator. Preserve visible H1 `Hao Yu`; it need not become a keyword list. |
| ProfilePage containing Person | Include as a modest semantic improvement | This single-person academic homepage appears appropriate for Google's About Me example. Preserve Person within `mainEntity`; add stable `#profile-page` / `#person` IDs and the verified Cambridge identity URL. This is not a ranking guarantee or guaranteed rich-result display. |

Google's documentation supports URL-prefix properties and the distinction
between indexed and live inspection. Repeated indexing requests do not accelerate
crawling: [property setup](https://support.google.com/webmasters/answer/34592?hl=en),
[URL Inspection](https://support.google.com/webmasters/answer/9012289?hl=en),
[requesting recrawl](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).

Concise, descriptive titles are appropriate, but Google can generate a different
search title. ProfilePage eligibility and required Person fields must be checked
against the visible content: [title guidance](https://developers.google.com/search/docs/appearance/title-link),
[ProfilePage](https://developers.google.com/search/docs/appearance/structured-data/profile-page),
[structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).
Sitemaps and crawlable links aid discovery without guaranteeing inclusion:
[sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview).

An additional issue: the repository's `robots.txt` is served at
`/hao-yu-website/robots.txt`. Google uses the host-root
`https://barry063.github.io/robots.txt`, not a project-subdirectory file. Inspect
the root response before diagnosing crawl policy; do not assume the project file
is effective or that a missing root file prevents crawling. Submit the project
sitemap directly in Search Console. Changes to another repository/root site are
not part of this plan. See [Google's robots location rules](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt).

The official [Cambridge profile](https://www.eng.cam.ac.uk/profiles/hy377) has a
search result identifying Hao Yu as a Research Student with the matching Cambridge
email. This supports identity matching, but the cached result does not establish
today's backlink presence. Recheck the page at implementation before adding the
clean URL without tracking parameters.

## Implementation details that affect the plan

1. **Use the existing proposal workflow.** Prepare
   `content/proposals/2026-11-12.json` and a matching field register; update
   CONTENT_DECISIONS and CONTENT_SOURCE_MAP. Refresh fingerprints and reviewed
   locators; calibrate separate manual-review private state only after editorial
   reconciliation. Preserve the released root files and installed watcher until
   authorised promotion.
2. **Complete S2 adapter support.** The public schema/renderer supports SUBMITTED,
   but `scripts/canonical-adapters.mjs` currently recognises neither EB's
   `Submitted Tutorial` label nor PUB's `## Submitted tutorial` heading. Add
   narrowly defined handling and conflict tests, and include EB §3.9 in the
   protected editorial sections. Do not change canonical wording to satisfy the
   parser or weaken conflict detection. New-record clearance must explicitly
   include S2; do not copy its private source record into the proposal.
3. **Keep metadata generated.** Set `presentation.title`; change JSON-LD in
   `scripts/render-site.mjs`. Update flat-Person assumptions in
   `scripts/check-site.mjs` and `tests/propagation/generator.test.mjs`, preserving
   escaping and checking both page and person URLs, role and sameAs identity.
   Do not invent creation dates; optional modification dates must reflect a real
   content update. Update sitemap lastmod with the actual release content date.
4. **Handle the Cambridge link consistently.** Recommended: add a reviewed
   CAMBRIDGE profile link, visible on the page and in Person.sameAs, plus a
   corresponding hyperlink in the refreshed public CV. The existing PDF checker
   requires every selected personal-profile link. Aim to fit a short Cambridge
   profile link within the four-page format. If layout requires website-only
   treatment, explicitly model and test that scope; do not silently exempt the
   URL from checks. The link remains manually reviewed unless canonical ownership
   is deliberately extended in a separate authorised change.
5. **Re-review the public PDF.** S2 and the updated export invalidate the old
   reviewed-CV bindings. Regenerate the sanitised public derivative, inspect all
   four pages and extracted text/hyperlinks, then refresh `cv_document` hashes,
   source/export bindings, shared facts and its actual document date. Free-form
   photonics prose still needs manual comparison because narrative text is not
   covered by `cvFactsHash`. Extend privacy checks beyond the existing journal's
   manuscript-reference pattern to cover the new submission reference.
6. **Make regression fixtures explicit.** Existing synthetic generator tests
   mutate shared facts while retaining a frozen reviewed PDF, which triggers the
   intended CV gate. Separate generated-CV fixtures from frozen-PDF tests.
   Reviewed-CV tests also refer to the November 6 proposal and shared asset;
   preserve a deliberate historical fixture or migrate the tests consistently.
   Keep the production integrity checks intact.

No redesign, framework migration, hosting migration, extra project card or
automatic publication is needed. Search Console verification can use an HTML
meta token once supplied by the property; never invent a token. A verification
file would require deliberate support in the strict visitor-file allowlist.

## Tasks and acceptance

| Task | Scope | Dependencies | Acceptance | State |
| --- | --- | --- | --- | --- |
| U01 | Evidence comparison, recommendation assessment and implementation plan | Current sources and released dataset | U01-A–D below | DONE |
| U02 | Prepare content proposal, adapter support and refreshed public CV | Implementation instruction | W01-A–D, W02-C/D, W04-C/E, W06-A/B PASS; submitted-only S2, contribution/privacy review, 242 fields and four-page PDF; candidate review/checks | DONE |
| U03 | Implement title, ProfilePage and Cambridge identity link | Implementation instruction; coordinated with U02's CV/link policy | Title/social, nested Person, canonical/qualification facts, verified identity URL, escaping and link-policy checks PASS | DONE |
| U04 | Build and verify one final candidate | U02, U03 | W08-A/B/D/E and P05-D PASS; 68/68 regressions, current source bindings, ten identical preview/candidate files, project-path/PDF/browser checks | DONE |
| U05 | Deliver, publish and verify exact candidate | U04 and applicable release instruction | W09-A–C / P06; exact live asset/data hashes and deployment/browser evidence | NOT_STARTED |
| U06 | Confirm indexing and reconcile external profile links | Search Console property access; profile/editor access for changes | Public Cambridge identity/backlink and host-robots checks completed; Search Console/account changes NOT RUN; continue separately | IN_PROGRESS |

U01 acceptance:

- U01-A: compare all five source hashes and current export/master provenance;
  record which evidence is new, already covered or withheld.
- U01-B: map C12-01–04 to public IDs with supported wording and contribution/status
  boundaries; assess each recommendation against official documentation.
- U01-C: inspect generator, adapter, CV/link coupling and tests; identify concrete
  implementation dependencies without weakening release gates.
- U01-D: verify documentation-only scope, links/JSON, whitespace, public exposure
  and unchanged source/visitor bytes; record actual failures and unavailable checks.

Use the pinned SITE_PYTHON runtime and existing workflow commands during
implementation. Representative checks (not executed for this planning session):

```text
node scripts/build-site.mjs --data content/proposals/2026-11-12.json --out tmp/candidates/<new-directory>
node scripts/check-candidate.mjs <candidate-directory> content/proposals/2026-11-12.json
<pinned-python> scripts/check_public_cv.py <candidate-pdf> content/proposals/2026-11-12.json
node --test tests/propagation/contract.test.mjs tests/propagation/reviewed-cv.test.mjs
npm run test:propagation
```

Check the proposal/register pair directly: the existing contract test reads the
released root pair. Then refresh reviewed calibration, prepare the final candidate
and perform 375/768/1440 px browser checks, keyboard/skip/mobile navigation,
200% zoom, reduced motion and no-JS operation. Record external structured-data
validation if accessible. Check source and candidate hashes again before any
release approval. Existing W07 full-audit and optional P08 deferrals remain.

## Planning results and limitations

U01-A–D results and source hashes are recorded in the companion checks JSON.
The plan and master task tracker are the only substantive edits this session;
canonical records, dataset, visitor assets, watcher and calibration are preserved.

Official Google documentation was retrieved. The ChatGPT share link could not be
read, so the assessment uses the user's pasted text; its title suggestion was
truncated and the title above is a new recommendation. Direct live-site,
robots/sitemap and Cambridge-page requests failed through the available web/HTTP
paths (including DNS failures). This does not establish a public-site outage.
No successful live HTTP check is claimed for this session.

Search Console was not inspected: indexing and Google-selected canonical remain
UNKNOWN. A search result's absence is not proof of non-indexing. Candidate build,
new-PDF visual review, browser QA, Rich Results Test, account/profile edits,
commit/push and deployment are NOT RUN. There is no new READY_TO_PUBLISH or
LIVE_VERIFIED claim. The prior verified release remains the baseline.

Next implementation work is U02/U03; U06's account/editor dependencies do not
block them. Keep SITE_LIVE_VERIFIED separate from SEARCH_INDEX_STATUS_CONFIRMED.
Track qualified queries (Hao Yu Cambridge / Hofmann / materials) separately from
the common name alone, using impressions, clicks and average position. No task
has a first-place ranking acceptance condition. No messages to institutional
editors or changes to external accounts are authorised by this planning request.
