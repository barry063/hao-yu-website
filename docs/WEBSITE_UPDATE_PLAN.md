# Website update plan and verification contract

Created: 5 October 2026. Baseline: website commit `2c3ba49`.
Plan version: 1.6. Release-1 milestone: `LIVE_CONTENT_VERIFIED_BROWSER_QA_DEFERRED`.
Workflow milestone: `P01_P06_COMPLETE_LIVE_VERIFIED`.
Watcher milestone: `P07_COMPLETE_INSTALLED_VERIFIED`.

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
release 1 were authorised and completed. The user has since verified the update
and requested an actionable one-edit propagation plan, then explicitly authorised
committing and pushing that documentation to `main`. Workflow implementation and
future publication of changed visitor content require their own instructions.
See [CONTENT_PROPAGATION_PLAN.md](CONTENT_PROPAGATION_PLAN.md) for P01–P08, their
dependencies, acceptance targets and the review/publication boundary.

Current instruction, 5 October 2026: local P01–P02 implementation on a separate
branch, with verification/progress records and unchanged canonical CV files.
The user subsequently authorised committing and pushing this checkpoint to the
implementation branch before P03–P06. No merge to main, publication, canonical
edits or watcher is authorised by this checkpoint action.

## Baseline and source map

At the original baseline, the website contained `index.html`, `styles.css`,
`script.js`, metadata files and assets, without a build step or automated validation.
Release 1 added a public JSON inventory, automated checks and a public CV builder;
HTML content still has no generator and remains maintained separately. The
separate CV workspace is named `0 Core CV Infra`;
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

Workflow decision, 5 October 2026: source changes should prepare a public-safe
proposal, not publish automatically. Implement the shared generator and local
canonical bridge before considering an opt-in watcher. Bind review to an exact
candidate; subsequent changes invalidate approval. Keep the evidence bank private
and authoritative; do not create a competing factual record. The latest request
is to version and push the planning baseline only. P01–P06 describe the core implementation/release sequence;
P07/P08 are optional extensions. The release-1 browser exception is not a standing
exception for generated releases.

Continuation decision, 6 October 2026: user reports merged/rebased P01/P02 and
manual website verification and requests P03–P06. Continue on a separate local
branch, preserving canonical CV files. Prepare the concrete candidate before
requesting exact release approval; no watcher/hosting migration is included.
The current P-task tracker supersedes earlier checkpoint-only scope statements.

Release instruction, 6 October 2026: the user clarified that "ok so should we
publish now?" was an instruction to push/create a PR and publish the candidate
already discussed. Proceed with candidate
`a43d917ca7f32dd605a2d4dcd60bad40db468d42078828f015a8d94306265e48`
at `https://barry063.github.io/hao-yu-website/`, using the existing main/root
Pages route. The clarification supplies current release authority; the user does
not need to repeat the full hash. Record their statement in private approval state,
create a PR, merge the release, and verify the actual deployment. Canonical files
remain unchanged; no watcher or hosting migration is included.

P07 instruction, 6 October 2026: after checking the saved plan, the user requested
"Carry out the plan with proper verification tests". This invokes the agreed local
implementation, private-state copy and tested per-user sign-in installation.
Work on `implementation/p07`; preserve canonical and released visitor files.
Commit/push/publication and P08 are outside this instruction. The user agreed to
perform sleep/wake and sign-out/sign-in after the idle measurement. Record actual
results before completing P07; prior publication authority is not reused here.

P07 delivery instruction, 6 October 2026: after accepting the completed watcher,
the user asked to push/publish the branch or create a PR. Proceed with a commit
and push of the verified `implementation/p07` changes and an open PR to `main`.
The PR is the selected review checkpoint; merge and Pages deployment are not
performed by this instruction. Recheck public exposure and source/output integrity
before delivery. Visitor content and canonical files remain unchanged.

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
| W10 | Introduce repeatable content build and validation | W08; initial refresh accepted; implementation instruction | DONE | P01–P05 verified; 31 regressions, real-source NO_CHANGE, immutable review/gate and operator guide; 2026-10-06 acceptance report |
| W11 | Verify release 2 and document routine updates | W10; publication authority for live checks | DONE | W11-A/B/C and P06-A–D verified; PR #2 merged, Pages run 37454512658 successful, exact live assets/PDF/browser PASS; release-2 deployment report |

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

Implementation breakdown: P01–P05 in
[CONTENT_PROPAGATION_PLAN.md](CONTENT_PROPAGATION_PLAN.md). Those tasks add the
canonical-source bridge and version-bound review gate to these original criteria;
the P-task tracker owns detailed progress. Do not mark W10 DONE before both sets
of criteria are verified.

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

Use P05/P06 in [CONTENT_PROPAGATION_PLAN.md](CONTENT_PROPAGATION_PLAN.md) for
end-to-end proof, the operator guide and approved-release deployment. Optional
watching and extra public destinations are P07/P08, not release-2 prerequisites.

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

### 5 October 2026 — propagation planning session

- Scope: user verified the live update, discussed the review-gated workflow and
  requested an actionable plan in a proper location. Documentation only; no new
  implementation, canonical-source changes, commits/pushes or deployment.
- Read: both repositories' AGENTS.md, current parent plan, README, public inventory
  and CV-builder interface. Git status initially clean; no user edits overwritten.
- Saved `docs/CONTENT_PROPAGATION_PLAN.md`: P01–P08, dependencies, 31 acceptance
  targets, explicit source ownership, private/public allowlists, deterministic
  outputs, candidate-bound approval and stale-input rejection. Linked from README.
- W10/W11 now NOT_STARTED with a recorded implementation contract rather than
  deferred for lack of discussion. P07/P08 remain optional and DEFERRED. No
  implementation acceptance criterion is marked passing by this planning work.
- Verification: PASS — inline Node assertions via PowerShell here-string checked
  eight unique tasks, 31 unique acceptance IDs, sections for all tasks, ordered
  dependencies, six NOT_STARTED/two DEFERRED states, resolving local Markdown
  links, authority/privacy controls and no absolute machine paths in the new plan.
  `git diff --check`: PASS. Evidence is this entry and the new plan's recording
  entry. Workflow runtime checks NOT RUN; no implementation results are claimed.
- Next task after an implementation instruction: P01. Release 1 remains live;
  detailed automated browser QA remains deferred, not retroactively passed.

### 5 October 2026 — planning baseline commit/push session

- User explicitly requested commit/push to `main`. This versions the three
  documentation files only; implementation and new visitor content are out of scope.
- Git: fetched origin/main; starting revision `f5f5f92`, zero ahead/behind.
- PASS: inline Node assertions for eight tasks, 31 unique acceptance IDs,
  dependencies/states and local links. `npm run check`: PASS, HTML/content checks
  and all seven navigation regressions. `git diff --check`: PASS.
- The commit containing this entry is the planning baseline; Git history and the
  chat handoff identify its revision and actual push result. No canonical files
  or visitor assets changed. Runtime propagation checks remain NOT RUN.
- Milestone: `PLAN_BASELINED_IMPLEMENTATION_NOT_STARTED`. Next implementation
  checkpoint after an instruction: P01–P02 on a separate local branch, then review.

### 5 October 2026 — P01/P02 implementation checkpoint

- Latest user scope: implement P01–P02 on a separate local branch, preserve
  canonical CV files and stop for review. Commit/push/publication/watcher are
  explicitly prohibited for this session. This supersedes the documentation-only
  planning instruction; earlier release-1 authority does not extend to this work.
- Starting tree clean; baseline `17d4ad2`; local branch `implementation/p01-p02`.
  No commits made. All ten root visitor files remain the released snapshot.
- Canonical AGENTS and five source fingerprints rechecked: PASS, unchanged.
  No writes to canonical workspace. Unrelated broader workspace additions were
  observed and preserved; whole-workspace hash equality is not claimed.
- P01-A–D: PASS — typed public contract, 199-field ownership coverage, source
  precedence/editorial exclusions and thirteen valid/invalid synthetic fixtures.
- P02-A–D: PASS — shared isolated HTML/CV/metadata generator, visitor allowlist,
  negative boundary tests, reproducible PDF/card builds and baseline parity QA.
  22 propagation tests and 7 navigation tests pass; candidate HTML has zero
  errors/warnings, 26 records and 24 IDs; ten HTTP files match candidate bytes.
  Two-page PDF content/links/privacy/margins and baseline text/link parity pass.
  Three-width HTML text/link/meta/ID/layout parity and visual inspection pass,
  using fresh headless Chrome after in-app Browser bootstrap failed.
- Checks/commands/hashes: `docs/releases/2026-10-05-p01-p02.md` and machine
  `-checks.json`; public field map in `docs/CONTENT_SOURCE_MAP.md`; candidate and
  captures remain ignored under `tmp/`. `git diff --check`: PASS.
- Full accessibility, 200% zoom and P05 browser/keyboard matrix: NOT RUN.
  W07 remains DEFERRED; release-2 readiness/live status is not claimed.
- W10 now IN_PROGRESS (P01/P02 DONE, P03–P05 remain); W11 NOT_STARTED.
  Workflow milestone: `P01_P02_COMPLETE_AWAITING_REVIEW`. No source dependency
  blocks the completed tasks. Stop for review; P03 follows a continuation
  instruction, P06 requires release authority, P07/P08 remain optional/deferred.

### 5 October 2026 — P01/P02 checkpoint commit/push session

- Latest authority: commit and push the completed P01/P02 checkpoint to its
  separate implementation branch before later work. No merge or live publication.
- Starting branch `implementation/p01-p02`, HEAD `17d4ad2`; reviewed uncommitted
  changes preserved. Canonical workspace is read-only; visitor root files and
  ignored candidates/captures are excluded from the commit's changed file set.
- Public exposure reviewed for all proposed new files: public derivative and
  provenance, source map/schema, synthetic fixtures, licensed fonts, generator,
  checks and reports. No private source snapshots or canonical files included.
- Pre-commit: existing HTML/content/7 navigation checks and all 22 propagation
  tests pass, zero skipped; dataset/template/five canonical fingerprints match
  the verification record; `git diff --check` passes. Remote `main` is `17d4ad2`;
  no prior implementation branch exists on origin.
- Staged diff review found inherited whitespace in the copied font licence;
  whitespace was normalised, licence wording preserved and the check rerun.
- The commit containing this entry is the versioned implementation checkpoint;
  Git history identifies its revision. Push/remote hash verification follows the
  commit and is reported in the handoff; no earlier success is inferred.
- P03–P06 remain NOT_STARTED, P07/P08 DEFERRED; W10 IN_PROGRESS. The commit/push
  action does not approve a candidate for publication or close deferred browser QA.

### 6 October 2026 — P03–P06 local implementation session

- Started clean from merged `fc335e5` on `implementation/p03-p06`; user reports
  manually verifying the merged website. No canonical files edited.
- W10-A–E and P03-A–D/P04-A–D/P05-A–E: PASS. Source bridge, shared static output,
  immutable review, drift gate and actual operator guide complete. Full tests
  31/31; workflow guard checks 9/9; navigation 7/7. Final candidate HTML/content,
  HTTP/PDF, three-width keyboard/reduced-motion/no-JS/native-zoom checks pass.
  Both PDF pages and normal/zoomed layouts inspected. Full accessibility audit
  NOT RUN, preserving W07's deferred scope rather than claiming a pass.
- W11-A/B local generated-content checks and guide complete. W11-C release
  readiness recorded; P06-C publication/live evidence remains pending exact
  candidate approval and authority. P06-A/B/D local gate/rollback tests pass.
- Candidate `a43d917ca7f32dd605a2d4dcd60bad40db468d42078828f015a8d94306265e48`
  targets `https://barry063.github.io/hao-yu-website/`; READY_FOR_REVIEW. Current
  main/root Pages deployment is merged `fc335e5`, not this new candidate.
- Evidence: `docs/releases/2026-10-06-p03-p06.md` and `-checks.json`; exact hashes,
  scoped one-edit coverage, remaining private-source duplicate-status constraint,
  link results (8 PASS/5 INCONCLUSIVE/0 FAIL) and actual NOT RUN checks retained.
- Five source files unchanged; ten root visitor files plus public dataset equal
  HEAD. Real prepare returns NO_CHANGE; forced generator candidate changes labels
  and generated files only. No staging, commit/push/publication or watcher.
- W10 DONE; W11/P06 IN_PROGRESS; P01–P05 DONE, P07/P08 DEFERRED. The remaining
  dependency is exact release approval/authority and actual deployment/live checks.

### 6 October 2026 — authorised release 2 publication session

- User clarified the earlier publication request as an instruction to push/create
  a PR and publish the reviewed candidate. Recorded explicit contextual approval
  against the full candidate ID/target; no repeated hash confirmation is required.
- Started with only the intended P03–P06 changes on `implementation/p03-p06`.
  Pages/authentication/main rechecked; existing `main`/root hosting retained.
- Regression rerun: 31/31 PASS, zero skips. Candidate input/source/runtime gate
  PASS; approval recorded; approved gate PASS; exact immutable files promoted.
- P06-A/B/C/D and W11-A/B/C PASS: exact promotion/commit/live file and PDF
  hashes match; actual rollback backup dry-run validates. PR #2 merged commit
  `05f18e2289cb9d0b41698c47fa28dab3fb7c7a58`; successful Pages run
  `37454512658`. Live Chrome 375/768/1440, native 200% zoom, keyboard, reduced
  motion and no-JS checks PASS; live captures visually inspected. Verifier
  returned LIVE_VERIFIED and then advanced the private published baseline.
  Evidence: `docs/releases/2026-10-06-release-2-deployment.md` and `-checks.json`.
- Staged public exposure/whitespace review PASS; no private working records
  committed. Five canonical sources unchanged. No watcher, new credentials or
  hosting changes. P01–P06/W10/W11 DONE; P07/P08 remain DEFERRED. Full W07
  accessibility audit remains deferred; restricted external links INCONCLUSIVE.
- Record verification in a documentation-only follow-up commit, preserving the
  approved artifact, and verify the resulting main deployment before handoff.

### 6 October 2026 — P07 documentation handoff

- Latest user instruction: consolidate the agreed watcher plan for a new Codex
  session; two-minute polling accepted. This is documentation-only scope.
- Started clean on `main`, HEAD `f0721b0`. Saved
  `docs/P07_WATCHER_IMPLEMENTATION_PLAN.md` and linked it from the propagation
  contract. The document includes resource/sleep behaviour, durable private
  state, lifecycle/notifications, acceptance checks and an explicit next-session
  implementation/installation prompt. P07 checks remain NOT RUN.
- No watcher or scheduled task installed, no canonical or visitor-file changes,
  no private-state migration, staging, commit, push or publication. P01–P06 remain
  DONE/LIVE_VERIFIED; P07/P08 remain DEFERRED until separately invoked.
- Documentation verification: Node read-only checks PASS for nine local links/
  anchors, required scope/timer/sleep/acceptance/prompt wording, public exposure
  patterns and documentation-only changed-file scope. `git diff --check` PASS;
  all three documents checked for trailing whitespace and final newlines. No
  code changed; runtime/watcher checks NOT RUN. Evidence is these documents and
  the recorded check output in this session; nothing staged or committed.

### 6 October 2026 — P07 plan commit/push checkpoint

- Latest user instruction requests pushing the P07 planning checkpoint. Scope is
  the three planning documents only, on existing `main`; it does not implement or
  install the watcher, migrate private state or publish changed visitor content.
- Starting HEAD `f0721b0`, with only the prior P07 documentation changes present.
  Public exposure, relative links/anchors, required scope/120-second/sleep wording
  and whitespace are checked before commit. Root visitor files and the public
  dataset remain the approved release; no canonical files are touched.
- The commit containing this entry versions the reviewed plan and handoff prompt.
  Its revision is identified by Git history; push and remote revision comparison
  follow the commit and are reported in the chat handoff, not inferred in advance.
- P07/P08 remain DEFERRED; all P07 implementation checks NOT RUN. P01–P06 remain
  complete. The next session uses the P07 document's explicit continuation prompt.

### 6 October 2026 — P07 implementation and installed verification

- Started with a clean tree at `fe26372`; created `implementation/p07`. Read both
  workspaces' instructions and all three plans; five canonical sources rechecked,
  matching current public provenance. No writes to those sources or visitor files.
- Implemented the opted-in watcher and management/verification scripts, safe
  Windows notices, durable private state, shared manual-operation locking and
  recovery. Copied all 23 original private history files with exact inventory/hash
  verification; preserved the temporary original and verified interim copy.
- Trials exposed sandbox TEMP restrictions, encrypted-file replacement and task
  access failures, an interruption-test wait bug, console lifetime and helper
  battery settings. Fixed and reran affected checks. Native installation uses
  the signed-in account and a detached hidden WScript launcher; actual task
  start/stop/duplicate/interruption/disable/uninstall/reinstall and Windows
  notification history checks pass. Wake requests remain disabled.
- Full regression: 54 propagation tests and seven navigation tests PASS, zero
  skips, including recovered-state approval bindings. Final idle/physical checks
  are recorded in `docs/releases/2026-10-06-p07.md` and `-checks.json`. Required
  pending checks remain pending; P07 is IN_PROGRESS. Full W07 accessibility remains
  DEFERRED and no new deployment/live verification is claimed by this work.
- P01–P06/W10/W11 remain DONE; P08 DEFERRED. No staging, commit, push, merge,
  canonical migration or publication. Installed operational state and remaining
  specific machine checks are the next handoff dependencies.
- Final affected regression: 24 watcher tests PASS, zero skips; seven navigation
  tests and HTML/content checks PASS. Syntax checks PASS for 25 JavaScript and
  five PowerShell scripts; 22 documentation links and exposure checks PASS.
  Source/visitor/history integrity PASS. One missing public favicon in the original
  rollback backup was restored from its exact verified active copy, then the
  full 23-file original inventory was rechecked. Temporary bootstrap task removed.

### 6 October 2026 — P07 final acceptance and handoff

- P07-A/B/C PASS; P07 DONE for the verified local-file scope. One current-user
  sign-in task and one functioning watcher remain at `NO_CHANGE`; temporary
  bootstrap task removed. Physical Modern Standby and sign-out/sign-in PASS,
  confirmed by the user, Windows events and actual identity/poll/work counters.
- Actual read-only OneDrive-directory availability/recovery PASS with unchanged
  EXPORT hash, no new preparation/notice and unchanged processed fingerprint.
  Synthetic save/rename/coalescing tests complement this; live remote sync NOT RUN.
- Final full suite: 54/55 PASS, one FILESYSTEM_EPERM failure; targeted rerun of
  that proposal/PDF/determinism/approval/rollback test PASS without code changes.
  All 55 distinct tests passed with the retry disclosed. Final watcher 24/24,
  HTML/content and seven navigation checks PASS; JavaScript syntax 25, PowerShell
  syntax six, 22 documentation links/exposure and whitespace checks PASS.
- Recorded idle run 607.42 seconds: five polls, zero preparations/launches,
  1.359 CPU seconds for Node/PowerShell/WScript. Initial classification failed on
  an existing console host; retained raw failure and verified its pre-measurement
  identity in all 20 snapshots. Separate assessment PASS with entire console CPU
  lifetime bound: 1.469 seconds total, <=0.242% of one core. Three-process peak
  memory recorded; console peak and revised four-process collector rerun NOT RUN.
- Final source/visitor/23-record history hashes PASS. Evidence and limitations:
  `docs/releases/2026-10-06-p07.md` and `-checks.json`. Windows notification history
  PASS; banner visual inspection, OS process trace and battery energy NOT RUN.
  P08/W07 remain DEFERRED; no dependency blocks the completed local watcher scope.
- Branch `implementation/p07` remains uncommitted and unstaged. Canonical source
  bytes and released visitor files unchanged; no push/merge/publication. Prior
  LIVE_VERIFIED refers to release 2, not this local implementation.

### 6 October 2026 — P07 branch delivery and PR

- User accepted the completed local watcher and requested the next branch/PR
  step. Selected commit/push and an open PR to `main`, preserving a reviewable
  checkpoint. No main merge or Pages deployment in this delivery session.
- Existing final runtime tests, physical checks, retry disclosure and resource
  assessment remain the acceptance evidence. Fresh source/output/history hashes,
  staged file scope, public exposure and whitespace are checked before commit.
- The commit containing this entry versions the 25 intended P07 implementation,
  test and documentation files. Push revision comparison and PR identity follow
  the commit and are verified in the chat handoff; they are not asserted here in
  advance. P07 remains DONE; P08/W07 DEFERRED. Private state stays outside Git.

## Reusable continuation prompt

> Continue the website update using AGENTS.md and docs/WEBSITE_UPDATE_PLAN.md.
> Inspect the working tree and latest canonical evidence, then complete the next
> available tasks within the authorised scope.
> For the one-edit workflow, also read docs/CONTENT_PROPAGATION_PLAN.md and use its
> P-task tracker; P01–P06 are complete and release 2 is LIVE_VERIFIED.
> P07 is complete and locally installed/verified; P08 remains deferred.
> Verify criteria
> and update the task tracker and session record with actual results. Continue
> independent tasks if one dependency is unresolved. Report the resulting
> readiness milestone and remaining task IDs; deploy only when authorised by the
> conversation, and verify the deployed revision before claiming it is live.

For P07, the specific agreed design and implementation/installation prompt are in
[P07_WATCHER_IMPLEMENTATION_PLAN.md](P07_WATCHER_IMPLEMENTATION_PLAN.md).
