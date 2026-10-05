# Website update plan and verification contract

Created: 5 October 2026. Baseline: website commit `2c3ba49`.
Plan version: 1.2. Current milestone: `LIVE_CONTENT_VERIFIED_BROWSER_QA_DEFERRED`.

## Objective

Update Hao Yu's existing academic website from the canonical CV infrastructure,
so visitors can understand the current research identity, inspect research outputs
and contributions, find professional profiles and download an approved public CV.
Make subsequent updates repeatable, with evidence for factual claims and checks
for the rendered site.

This document authorises no external action by itself. On 5 October 2026 the user
requested implementation of the modifications. Local implementation is now in
scope. The user subsequently confirmed the browser preview and explicitly
requested publication of today's changes. Commit, push and live verification of
release 1 are authorised. The one-edit propagation workflow remains for later.

## Baseline and source map

The website currently contains `index.html`, `styles.css`, `script.js`, metadata
files and assets. It has no build step or automated validation. All public content
is embedded in the HTML. The separate CV workspace is named `0 Core CV Infra`;
locate it among the provided workspace roots rather than hard-coding a user's
machine path into a public build.

Read the CV workspace's `AGENTS.md`. Use these sources in order:

| Source relative to the CV workspace | Role |
| --- | --- |
| `1 Master Academic CV/Evidence_Bank.md` | Canonical biographical facts, project evidence, dates, contribution boundaries and holds |
| Verified primary records referenced there | Resolve factual details and scientific claims |
| `4 Publication list/Master_Publication_List.md` and `Publication_Contributions.json` | Bibliographic metadata, output status and contribution records; reconcile conflicts with the evidence bank |
| `3 Research Profile/Hao_Yu_Application_Evidence_Wording.md` | Concise formulations, subject to the underlying factual evidence |
| `6 Modular Research Directions/Reusable_Application_Narratives.md` | Future interests, clearly described as directions rather than achieved results |
| `1 Master Academic CV/main.tex` and `Current_Export_Record.json` | CV derivative and export provenance, not automatic approval to publish |

If sources conflict, record the conflict and withhold the disputed claim until
resolved. Do not treat polished wording or a prior application as verification.

The 1 October 2026 export record classifies its PDF as an internal review export
with visible VERIFY markers. This is a release dependency for the CV task. Recheck
the record before implementation; do not assume that this snapshot remains current.

## Decisions and defaults

These defaults allow preparation to proceed. Record any user changes below.

| Decision | Working default | Evidence or finalisation condition |
| --- | --- | --- |
| Primary audience | Academic collaborators and postdoctoral hosts; concise industry/commercial experience remains visible | Based on the existing academic site and CV infrastructure |
| Hosting and canonical URL | GitHub Pages at `https://barry063.github.io/hao-yu-website/` | Matches the repository origin, existing README live URL and canonical evidence-bank website; inspect actual hosting when release is in scope |
| Architecture | Retain a single static page for release 1; small static generator for release 2 | No framework migration required |
| Research emphasis | CSS/vapour-phase synthesis, low-dimensional oxides/TMDs, source–transport–growth, spectroscopy and Python analysis | Recheck current evidence before drafting |
| Status wording | PhD researcher in Engineering; thesis submitted 30 September 2026 | Applicant-confirmed record; viva/award remain separate milestones |
| Contact privacy | Email, Cambridge location and professional links; omit phone and postcode from the revised public page and public CV by default | Record any different user preference |
| Unpublished work | Separate status groups; use only titles/contributions cleared for public description | Omit provisional author lists, submission reference numbers and nonpublic results |
| InnoAngel experience | Concise role/programme and sector summary | Exclude named companies, founder interviews and diligence details pending clearance |
| Headshot | Optimise the existing image; replacement is optional | No replacement photograph is required to complete the update |

Decision record, 5 October 2026: proceeding with the existing defaults. A new
public CV was prepared from reviewed public records, resolving the internal-export
dependency without modifying canonical master files. The content inventory is
JSON and precedes the later HTML-generation phase; HTML remains directly editable.

Release decision, 5 October 2026: user confirmed the browser preview and requested
publication before discussing the content generator. For this release, accept the
user's manual preview confirmation and the passing local checks as the release
gate. Defer the detailed automated viewport/accessibility matrix, which was not
performed. This changes today's gate; it does not convert NOT RUN checks into PASS.

## Public page target

The page should follow this order: hero and profile links; concise research profile;
selected research; research outputs; experience; education and selected honours;
contact and CV. Keep useful existing fragment IDs or provide compatible anchors.

Selected research should prioritise CSS oxide/sulphide growth, NaCl-assisted WS2,
the Raman/PL contribution to closed-loop MoS2 writing, RamanPL_2D, and a compressed
earlier photonic-resonance project. Describe each with a scientific problem,
personal contribution, supported result and relevant output link. Older projects
and lengthy leadership histories can move out of the main narrative into the CV.

## Task tracker

States: `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`, `DONE`, `DEFERRED`.
`BLOCKED` needs a specific missing dependency. `DEFERRED` needs a documented scope
decision. `DONE` requires every listed acceptance criterion to pass with evidence.

| ID | Task | Dependencies | State | Evidence / issue |
| --- | --- | --- | --- | --- |
| W01 | Reconcile sources and create public-content inventory | None | DONE | content/site.json; docs/CONTENT_DECISIONS.md; release-1 report |
| W02 | Correct factual content, links and site identity | W01 | DONE | Canonical/profile/status/stale-content checks pass |
| W03 | Rewrite page narrative and research hierarchy | W01, W02 | DONE | Five selected research entries; editorial review and fragment checks pass |
| W04 | Align research outputs and contributions | W01, W03 | DONE | Four articles, correction, distinct manuscript groups, software; source review |
| W05 | Update experience, education and honours | W01, W03 | DONE | InnoAngel and submitted thesis added; unresolved claims omitted |
| W06 | Prepare approved CV and optimise assets | W01 | DONE | New two-page public derivative inspected; CV/portrait/OG hashes in report |
| W07 | Accessibility and responsive behaviour | W03, W04, W05 | DEFERRED | User accepted browser preview; detailed automated UI matrix deferred for this release; regressions pass |
| W08 | Verify release 1 locally | W02–W07 | DONE | Passing local checks plus user-confirmed preview accepted for today's release; remaining audit gaps documented |
| W09 | Publish and verify release 1 | W08; deployment authority | DONE | Release 4537e5e deployed successfully; all nine live visitor files match; deployment report records amended gate and deferred browser QA |
| W10 | Introduce repeatable content build and validation | W08; initial refresh accepted | DEFERRED | User requests discussing one-edit propagation later |
| W11 | Verify release 2 and document routine updates | W10 | DEFERRED | Follows deferred generator phase |

## Acceptance criteria

### W01 — Reconcile sources and create public-content inventory

- W01-A: Record source revision or SHA-256 and review date for every source used.
- W01-B: Inventory all public claims by stable ID and destination section. Each has
  exact wording, source section/record ID, evidence status, publication visibility
  and review date. Record omissions and unresolved conflicts explicitly.
- W01-C: Separate `VERIFIED`, `APPLICANT_CONFIRMED`, `VERIFY` and `REJECT` evidence
  from visibility (`PUBLIC`, `HOLD`, `PRIVATE`). Applicant-confirmed claims can be
  used within their recorded limits; they must not become institutional proof.
- W01-D: Establish public-safe wording for the profile, thesis status, output
  inventory and methods. Audit the inventory for confidential content before it
  becomes a tracked repository file. Keep sensitive supporting records in the
  private CV workspace; only safe source references belong in the public repo.

### W02 — Correct factual content, links and site identity

- W02-A: Canonical URL, OG URL/image, Twitter image, Person JSON-LD, sitemap,
  robots sitemap and README all use the selected site URL consistently. The footer
  source link points to `https://github.com/barry063/hao-yu-website`; separate
  upstream attribution is permitted.
- W02-B: LinkedIn, Google Scholar, ORCID and GitHub use canonical profile URLs.
  No placeholder `href="#"`, TODO or VERIFY text remains in visitor content.
- W02-C: Visible and metadata descriptions distinguish thesis submission from an
  awarded doctorate. Future changes to this status require refreshed evidence.
- W02-D: Remove or replace unsupported CEng, percentile, apparatus-ownership,
  proficiency, device-performance and quantitative impact claims. Record each
  disposition in the inventory, rather than silently carrying it forward.

### W03 — Rewrite narrative and research hierarchy

- W03-A: The hero identifies current status, institution, primary research focus
  and a concrete connection between synthesis, characterisation and analysis.
- W03-B: Research themes follow the public-page target. Earlier photonics work
  remains visible in proportion to the current research trajectory.
- W03-C: Selected research entries distinguish study-wide results from Hao's
  contribution and link to available papers or software. They avoid repeated
  generic tools lists and unsupported superlatives.
- W03-D: Navigation matches the revised sections; retained fragment links resolve.
  Editorial review finds no duplicated introductory paragraphs or competing
  descriptions of the primary research identity.

### W04 — Align outputs and contributions

- W04-A: Reconcile all four published articles recorded at baseline against the
  latest canonical list: title, authors, venue, year, volume/pages/article number,
  DOI and contribution. Update the inventory if the source list changes.
- W04-B: Nanoscale uses its final bibliographic details. Nano Letters links its
  associated correction; do not count the correction as another research article.
  Inspect the correction before reusing affected mechanism/performance claims,
  or omit those claims and record the hold.
- W04-C: Under-review and in-preparation manuscripts are separately labelled and
  counted. No private submission reference, provisional authorship or unpublished
  quantitative finding is exposed without clearance.
- W04-D: RamanPL_2D has a repository link and supported feature summary. A version
  number or current release claim requires a current repository check; otherwise
  omit it. Do not claim measured speedups, adoption or validation without evidence.
- W04-E: Methods distinguish acquisition, analysis, training and collaborative
  evidence, including TEM/EDX, XPS, XRD and operando SEM. Public presentations
  have supported titles, dates and formats; unresolved entries are omitted.

### W05 — Experience, education and honours

- W05-A: Experience includes a public-safe InnoAngel summary and retains concise
  EnterpriseTECH and BOE descriptions; dates and role titles match sources.
- W05-B: Education includes the final thesis title and submitted status. Oxford
  degree and honours wording excludes unresolved classification/percentile claims.
- W05-C: Leadership, honours and mentoring claims have evidence. Unverified
  numerical outcomes or registration claims are omitted. Research retains priority
  over extended commercial and student-society detail.

### W06 — Public CV and assets

- W06-A: A public CV is reviewed for factual status, contribution boundaries,
  unresolved markers, confidential material and the chosen contact policy. Export
  from a reviewed source or use an existing explicitly public-cleared export.
- W06-B: Record source identifier/hash, PDF hash, export date and review result in
  a public-safe release record. `assets/Hao_Yu_CV.pdf` matches the approved PDF
  byte-for-byte and opens successfully; labels show its actual update date.
- W06-C: Optimise the portrait to a target of at most 250 KB with sufficient
  resolution for its displayed size; inspect it visually. Correct HTML dimensions
  to the real aspect ratio. Keep the original available until QA is complete.
- W06-D: OG image remains 1200 × 630, has readable current wording and uses the
  correct absolute URL. Replace it only if inspection shows it needs updating.

### W07 — Accessibility and responsive behaviour

- W07-A: Mobile menu works by keyboard and touch, exposes correct `aria-expanded`,
  closes with Escape and section selection, and does not leave scrolling locked
  after a viewport change. Hidden menu links cannot receive keyboard focus.
- W07-B: Skip link moves focus to main content. Anchor navigation reaches targets
  without sticky-header occlusion. Reduced-motion preference disables animated
  scrolling in both CSS and JavaScript.
- W07-C: Contact terms/descriptions are inside a valid `dl`; headings, landmarks,
  image alternative text and visible focus states are meaningful. No critical or
  serious accessibility findings remain; document any lower-severity finding.
- W07-D: Inspect at 375, 768 and 1440 CSS pixels and at 200% zoom. No horizontal
  page overflow, clipped text, overlapping navigation or inaccessible controls.

### W08 — Release 1 local verification

- W08-A: Run structural checks for duplicate IDs, missing fragment targets,
  missing assets, malformed JSON-LD/XML, unresolved placeholders and canonical
  URL consistency. Run an HTML validator; resolve errors and review warnings.
- W08-B: Exercise the actual page in a browser, including W07 behaviours. Record
  browser, viewport, date and screenshot/check locations. Static source inspection
  does not count as a successful interaction test.
- W08-C: Check external profiles, DOI destinations and available software links.
  Record HTTP result or manually confirmed destination. Anti-bot/network failures
  are `INCONCLUSIVE`, not proof of a broken link; state follow-up needs.
- W08-D: Cross-check final public claims against W01 and the approved CV. Verify
  asset loading under `/hao-yu-website/`, not only under a server root.
- W08-E: Save a release report with PASS/FAIL/NOT RUN/INCONCLUSIVE results,
  source and asset hashes, changed files and outstanding issues. Mark the milestone
  `READY_TO_PUBLISH` only when required local criteria pass. A CV dependency must
  be resolved or a user-directed CV omission recorded before this milestone.

### W09 — Publish and verify release 1

Release-specific amendment, 5 October 2026: browser automation is unavailable and
the user has accepted the preview and requested publishing. For today's W09-B/C,
verify the actual deployed revision and all visitor-file content over HTTP; retain
the detailed live browser UI audit as deferred. Use the milestone
`LIVE_CONTENT_VERIFIED_BROWSER_QA_DEFERRED` to state this scope precisely.

- W09-A: Use the existing hosting arrangement after inspecting its settings and
  applying the deployment authority already supplied by the user. Record deployed
  revision, final URL and time; do not infer deployment from a local preview.
- W09-B: Check the live HTML, assets, CV hash, profile links, sitemap and canonical
  metadata. Verify mobile navigation and one desktop layout on the deployed page.
- W09-C: Record actual results and mark `LIVE_VERIFIED` only after the deployed
  revision passes these checks. If deployment is pending, report
  `READY_TO_PUBLISH` and retain W09 as incomplete.

### W10 — Repeatable static content build

- W10-A: Move approved content into small JSON files under `content/`, with stable
  claim/output IDs, public-safe source references, evidence status, visibility and
  review dates. Use a template and a dependency-light build script to emit static
  HTML. Published content remains readable without JavaScript.
- W10-B: The build validates required fields and URL schemes, escapes text,
  rejects `VERIFY`/`REJECT` records marked for publication and excludes HOLD/PRIVATE
  records from rendered output. Keep private records outside the website repo.
- W10-C: Two builds from identical inputs produce byte-identical output. Updating
  a representative publication/profile record updates the intended rendered
  content without hand-editing generated HTML.
- W10-D: Meaningful fixtures cover rejected claims, private-field exclusion,
  escaping, duplicate identifiers and missing required metadata. Checks catch
  missing assets, invalid anchors and site URL drift.
- W10-E: Document runtime requirements, the actual build/check commands and which
  files are generated. No absolute CV-workspace path or private evidence content
  is required to build the public site. Record any hosting-process change.

### W11 — Release 2 and routine updates

- W11-A: Repeat relevant W08 browser/content checks after generation is introduced.
  The generated site preserves the approved release-1 content and accessibility.
- W11-B: README documents the routine workflow: recheck canonical evidence → update
  public records → build → validate → preview → record release → publish when
  authorised → verify live. Include the next PhD/publication status triggers.
- W11-C: Record release-2 evidence and readiness. Apply W09 live checks if release 2
  is published. Do not mark an unpublished release as live verified.

## Verification and progress record

The baseline audit was a source review. Implementation results are now recorded in
`docs/releases/2026-10-05-release-1.md`, including external checks, local HTTP
verification, PDF review and the specific outstanding browser checks.

Use this entry format for each session; add newest entries last:

```text
Date / task IDs:
Scope or decision changes:
Sources and source revisions/hashes:
Files changed:
Acceptance ID → check performed → actual result → evidence path:
Unresolved issues and affected task IDs:
Milestone / next executable task:
```

Store public-safe release reports under `docs/releases/`. Do not commit private
records or browser captures containing personal sessions. Each report should be
sufficient to explain which revision was checked and what remains unverified.

Task status reflects evidence, not elapsed effort. If a criterion changes, record
why and rerun affected checks. Reopen completed tasks when a subsequent change
invalidates their evidence. Release 1 completes when W01–W09 pass; local preparation
completes at W08. Release 2 completes at W11 with its readiness/live status stated.

### 5 October 2026 — planning session

- Saved this plan and repository agent instructions; linked the plan from README.
- Sources inspected: website README and clean worktree; CV workspace AGENTS.md and
  1 October export record, plus the preceding source audit in this conversation.
- Implementation task states remain NOT_STARTED. No website release is claimed.
- Planning validation: PASS — 11 unique tracker tasks, 44 unique acceptance IDs,
  criteria sections for every task, resolving README/agent plan references and
  `git diff --check`. These checks validate the plan, not the website.
- Next executable task when implementation is requested: W01.

### 5 October 2026 — implementation session

- Scope: user requested the website modifications. W01–W06 implemented using the
  plan defaults; no canonical master files changed.
- Evidence: `content/site.json`, `docs/CONTENT_DECISIONS.md` and
  `docs/releases/2026-10-05-release-1.md`. Source and release hashes are recorded.
- Changed: HTML/CSS/JS, site metadata, README, public PDF and social card; added
  optimised portrait, public inventory, validators, preview/CV scripts and reports.
- PASS: HTML validation, 26 public records, 24 unique HTML IDs/anchors, seven
  navigation regressions, two-page CV checks and visual review, XML parsing,
  project-path HTTP byte equality and public-preview allowlist.
- External link results: eight PASS, five INCONCLUSIVE automated-access responses.
- W07/W08: actual browser/viewport/accessibility checks unavailable because the
  Browser runtime could not connect. DOM fixture tests do not satisfy browser QA.
- Milestone: LOCAL_CHECKS_PASSED_BROWSER_QA_PENDING. No commit/push/deployment.
- Next executable work: W07 browser checks after access is restored, then W08
  readiness audit. W10 follows initial refresh acceptance.

### 5 October 2026 — publication session

- Scope change: user confirmed the preview and explicitly requested publication
  before discussing one-edit propagation. The release-specific amendment above
  accepts that preview and local checks; W07's detailed automated matrix and
  W10/W11 remain DEFERRED. No generator was introduced.
- Sources: rechecked the five canonical fingerprints in `content/site.json`;
  PASS, unchanged. Private source files were not copied or modified.
- Pre-publication commands: `npm run check`, `node scripts/check-preview.mjs`,
  `scripts/check_public_cv.py` with the bundled Python runtime, and
  `git diff --check` — PASS. Browser runtime connection — unavailable; detailed
  browser checks NOT RUN. User's manual preview confirmation retained.
- Changed: added `.nojekyll` and read-only Pages/live-check helpers; documented
  release authority and evidence. Prepared site files committed and pushed as
  `4537e5ed41f61f95ea45ea5d76a6f3d6e220b760`; no unrelated changes discarded.
- W09-A → inspect Pages API settings and deployment workflow → PASS, `main` root
  deployment succeeded at 14:16:25 UTC, 5 October 2026; workflow 37323277704.
- W09-B → `node scripts/check-live.mjs` → PASS at 14:16:36.090 UTC; all nine
  visitor files return 200 and match the release, including the public CV bytes.
  This satisfies the amended HTTP scope; detailed live browser QA is DEFERRED.
- W09-C → deployed revision and live file evidence → PASS under the amendment.
  Evidence: `docs/releases/2026-10-05-deployment.md`; historical preparation
  evidence remains in `docs/releases/2026-10-05-release-1.md`.
- Final URL: `https://barry063.github.io/hao-yu-website/`.
- Milestone: `LIVE_CONTENT_VERIFIED_BROWSER_QA_DEFERRED`. W09 complete; W07's
  detailed audit remains deferred, not claimed as passing. W10/W11 await the
  requested later workflow discussion. Documentation-only follow-up records
  these results without changing visitor files.

## Reusable continuation prompt

> Continue the website update using AGENTS.md and docs/WEBSITE_UPDATE_PLAN.md.
> Inspect the working tree and latest canonical evidence, then complete the next
> available tasks within the authorised scope. Verify their acceptance criteria
> and update the task tracker and session record with actual results. Continue
> independent tasks if one dependency is unresolved. Report the resulting
> readiness milestone and remaining task IDs; deploy only when authorised by the
> conversation, and verify the deployed revision before claiming it is live.
