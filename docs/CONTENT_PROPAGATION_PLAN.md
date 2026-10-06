# One-edit content propagation — implementation and acceptance plan

Created: 5 October 2026. Version: 1.1 (implementation checkpoint).
State: P01_P06_COMPLETE_LIVE_VERIFIED.
Parent contract: [WEBSITE_UPDATE_PLAN.md](WEBSITE_UPDATE_PLAN.md), W10/W11.
Implementation baseline: website revision `17d4ad2` (versioned planning baseline).

## Outcome and authority

Edit an authoritative fact once in the separate `0 Core CV Infra` workspace,
prepare all affected public outputs, review the proposed changes, approve a
specific release, then publish and verify it. A source edit triggers preparation
or a pending-review notice, never automatic publication.

The user has verified the initial website update, requested this actionable plan,
and subsequently authorised committing and pushing the documentation to `main`.
That authority versions this planning baseline only. It does not authorise workflow
implementation, canonical-source migration, a watcher, new credentials, hosting
changes or publication of new visitor content. The earlier publication authority
applied to release 1, not all future changes. Follow later explicit instructions
without asking again for authority already supplied for the relevant action.

Current instruction, 5 October 2026: implement P01–P02 on a separate local branch,
verify each criterion, update records, leave canonical CV files unchanged and stop
after P02 for review. The user subsequently authorised committing and pushing
this checkpoint to the implementation branch before P03–P06. No merge to main,
publication, canonical edits or watcher is authorised by this checkpoint action.

Current instruction, 6 October 2026: the user reports rebasing/merging P01/P02 and
manually verifying the website, and requests continuation through P03–P06. Work
locally on `implementation/p03-p06` from merged `fc335e5`. Preserve canonical
files. Prepare the complete release candidate and gate/rollback checks; P06's
actual publication awaits explicit approval of the exact new candidate/target.
No watcher, hosting migration or additional destination is in scope.

Latest release instruction, 6 October 2026: the user clarified that their request
to publish meant proceed with pushing/creating a PR and publication of the exact
candidate already discussed. Bind that explicit contextual decision to candidate
`a43d917ca7f32dd605a2d4dcd60bad40db468d42078828f015a8d94306265e48`
and `https://barry063.github.io/hao-yu-website/`. Commit/push, PR and release through
the existing main/root route are authorised. Canonical edits and a watcher remain
outside scope. Repeating the hash is not an additional user requirement.

Locking means preserving version 1.0 as a traceable Git baseline, not making the
plan read-only. Record implementation progress and justified amendments in later
commits; keep the original baseline available in history.

Scope first: the existing academic website, its public CV and metadata. The private
master CV, application variants and other personal websites are not silently added
as propagation targets. Multiple public destinations are a later extension.

## Current foundations and missing pieces

- `content/site.json`: 26 curated public records, provenance and source hashes;
  currently includes repeated facts inside independently maintained prose.
- `scripts/build_public_cv.py`: builds a public derivative from that inventory.
- `index.html`: visitor content still maintained separately; no HTML generator.
- Existing HTML, content, navigation, local HTTP, PDF and live checks can be reused.
- GitHub Pages currently publishes the repository root from `main`.
- Missing: canonical adapters, typed shared facts, a generator, semantic change
  detection, immutable review packages and a version-bound publication gate.

## Operating model

```text
Canonical evidence edit
  -> relevant source change detected / explicit prepare command
  -> reconcile facts and select public-cleared fields locally
  -> build candidate website + public CV + metadata
  -> validate and prepare review summary / preview
  -> user approves this exact candidate
  -> authorised publication of the approved files
  -> deployed revision and live files verified
```

### Source ownership: no second evidence bank

Read both repositories' AGENTS.md and the parent plan's source hierarchy. Preserve
the current canonical structure. Initially use read-only adapters: structured
publication metadata where available, explicit mappings to evidence-bank records
for other fields, and reviewed public wording for narratives. Derived JSON is not
an independently edited factual authority.

Each field needs a stable ID, authoritative source/record locator, type, evidence
state, public visibility, and its dependent outputs. Publication status is a typed
field, not several hard-coded strings. Thesis submission, viva and award are
separate fields/events. Site presentation choices remain separate from facts.

The parser must understand only documented formats and fail closed on ambiguous
or unsupported changes. Source disagreement produces a private reconciliation
issue, not an arbitrary winning value. Preserve applicant-confirmed provenance;
do not relabel it as institutional verification. Source-state mappings must be
explicit: `SUPPORTED` is not automatically equivalent to `VERIFIED`.

One-edit guarantee initially covers the mapped, tested facts, not arbitrary
Markdown prose. Free-form changes produce an editorial proposal for review rather
than deterministic scientific rewriting. A fact still duplicated across canonical
sources may require reconciliation there; do not claim full one-edit maintenance
until ownership and derivative consistency are tested. If true canonical structured
ownership is later needed, propose that migration separately with the CV workspace
owner's approval; do not restructure it as an incidental website task.

### Private/public boundary

Read private sources locally through an explicit source-root argument or ignored
local configuration. Do not put an absolute machine path into public configuration.
Use an allowlist of fields and records, not merely a blacklist of known secrets.

Keep raw source snapshots, reconciliation notes, rejected candidate text and private
diffs outside the website repository, including its untracked directories. Ignoring
a file is not adequate isolation from root-based hosting or accidental staging.
Only public-safe candidates may enter the website repository or a public PR.

Exclude referee details, phone/postcode by the current policy, application archives,
confidential company details, unresolved claims and internal review PDFs. Persist
only public-safe provenance and check summaries. Normal build/CI logs must not echo
private source text, absolute paths or credentials. Private/HOLD omissions are
expected; marking an unresolved record PUBLIC is a validation error.

### Review and release identity

Use states `NO_CHANGE`, `NEEDS_RECONCILIATION`, `PREPARED`, `READY_FOR_REVIEW`,
`APPROVED`, `STALE`, `PUBLISHED_PENDING_VERIFICATION`, `LIVE_VERIFIED`, `FAILED`.
State alone is not evidence; retain manifests and actual check results.

A candidate manifest binds: source fingerprints, public dataset hash, templates,
configuration, generator/runtime versions, fixed release date, target site URL and
every output file's SHA-256. Snapshot inputs before building and recheck them after
building; a concurrent source edit invalidates the candidate.

The review package contains old/new public facts, affected sections/files, factual
holds, check results, HTML preview, PDF and a candidate ID derived from the manifest.
Approval must record the user's explicit decision, candidate ID, time and target.
An agent cannot approve its own draft or infer future approval from this plan.
An explicit decision can identify the candidate through unambiguous conversation
context; the operator binds the full ID and target in the approval record without
requiring the user to repeat them.
An approval record is an audit aid, not a credential or a substitute for current
deployment authority. Until a separately authorised automated gate exists, release
remains a manual, authorised operation.

Any watched-source, template, configuration or output change after approval makes
the candidate STALE. Reprepare and obtain fresh review. Publish the approved
immutable output, not a fresh build from moving inputs. A relevant source edit with
no public semantic change records NO_CHANGE and does not create a needless proposal;
it still invalidates an older approval whose source fingerprints no longer match.

## Task tracker

Only this table owns the P-task states; the parent W10/W11 rows are roll-ups.
P01/P02 are merged and manually verified by the user. P03–P06 are implemented,
merged and live verified under the clarified publication instruction. Optional
extensions remain DEFERRED.

| ID | Deliverable | Dependencies | State | Completion evidence |
| --- | --- | --- | --- | --- |
| P01 | Source ownership map and public data contract | Implementation instruction | DONE | CONTENT_SOURCE_MAP.md; schema/199-field register; 13 fixtures; P01-A–D report |
| P02 | Deterministic shared public-output generator | P01 | DONE | Isolated generator; 22 passing tests; three-width HTML/2-page PDF parity and visual review; P02-A–D report |
| P03 | Local canonical adapters and change detection | P01, P02 | DONE | P03-A–D: real calibration/NO_CHANGE, read-only adapters and synthetic boundary/concurrency tests; 2026-10-06 acceptance report |
| P04 | Review package and stale-approval gate | P03 | DONE | P04-A–D: immutable manifest/public preview, exact decision gate and seven drift scenarios; 2026-10-06 acceptance report |
| P05 | End-to-end one-edit proof and operator guide | P02–P04 | DONE | P05-A–E: 31 regressions, actual PDF propagation, native browser zoom/keyboard matrix, visual inspection and README; 2026-10-06 report |
| P06 | Approved-release deployment and live verification | P05; specific release/hosting authority | DONE | P06-A–D PASS: exact contextual approval/promotion, PR #2 merged, successful Pages run 37454512658, candidate-bound live file/PDF/browser checks, rollback backup dry-run; release-2 deployment report |
| P07 | Optional local change watcher | P05; explicit opt-in | DEFERRED | Two-minute design agreed; P07_WATCHER_IMPLEMENTATION_PLAN.md contains implementation/install handoff; no watcher implemented or installed |
| P08 | Optional additional public website adapters | P05; named target and authority | DEFERRED | Per-target mapping, review and verification reports |

### P01 — Source ownership map and public data contract

- P01-A: Map every current public fact/record to an owner and dependent outputs;
  list unmapped prose explicitly. Stable IDs survive output-status transitions.
- P01-B: Define and test typed profile, qualification events, outputs, experience,
  links, evidence/visibility and public-selection fields. Separate authored prose
  from shared facts. Document source precedence and cross-source conflicts.
- P01-C: Define a strict public export schema, evidence-state mapping and synthetic
  valid/invalid fixtures. Unknown fields are rejected at the public boundary;
  private fields in canonical input cannot pass through by spread/copy operations.
- P01-D: Record first-release field coverage and exclusions. No canonical files
  are modified; any proposed migration is a separately documented decision.

Proposed files: `docs/CONTENT_SOURCE_MAP.md`, `schemas/public-content.schema.json`,
synthetic fixtures under `tests/fixtures/propagation/`. Names may be refined before
implementation; record deviations and update the operator guide.

### P02 — Deterministic shared public-output generator

- P02-A: Generate static HTML, public CV, JSON-LD/social descriptions, sitemap and
  update labels from the same reviewed dataset; generate the social card only when
  its displayed content changes. Render publication status through shared IDs in
  both research projects and output lists. Preserve current content, design,
  fragment compatibility, no-JS navigation and GitHub Pages project-path assets.
- P02-B: Build in an isolated output directory, not over live/root files during
  preparation. Explicitly allowlist visitor files; exclude source/private records,
  scripts and planning docs from deployment output. Reject unsafe URLs, escape
  rendered text and stop on duplicate IDs or missing required references.
- P02-C: Two builds from identical inputs produce identical file hashes, including
  the PDF. Pin dependencies/fonts, PDF metadata and release date; do not inject
  current timestamps or platform-dependent font fallbacks into release builds.
- P02-D: Record baseline text/links/metadata parity and visual HTML/PDF review.
  Run existing checks against candidate output; adapt hard-coded baseline counts
  to validated data rather than breaking legitimate future additions.

Proposed files: `templates/`, `scripts/build-site.mjs`, shared normalisation code,
updated CV builder and synthetic generator tests. Adopt one documented build command.

### P03 — Local canonical adapters and change detection

- P03-A: Add an explicit local prepare command accepting the canonical root. Only
  declared source files are read; take a consistent snapshot, hash it and compare
  public semantics against the last published dataset. No network/write access to
  the CV workspace is needed for the initial adapters.
- P03-B: Export only allowlisted, public-cleared data. Unsupported Markdown changes,
  missing evidence or inconsistent publication/status records produce actionable
  private reconciliation instructions, never silently inferred factual output.
- P03-C: Unchanged sources and private-only edits produce NO_CHANGE when public
  facts are unchanged. Public edits identify all dependent sections/files;
  deletions, loss of public clearance and new records are included in the diff.
- P03-D: Use synthetic privacy sentinels to test that private source fields/text
  cannot appear in candidate files, reports, normal logs or public Git diffs.
  Stop safely on parse errors, concurrent edits and unavailable source roots;
  never replace the last approved dataset with partial output.

Proposed files: `scripts/prepare-update.mjs`, local adapters and detection tests.
Sensitive work directories are created outside the public repository. Normal public
builds must also work from an already approved dataset without private-source access.

### P04 — Review package and stale-approval gate

- P04-A: Prepare a versioned public change summary, manifest, safe HTML preview and
  PDF for review. Review serving exposes only candidate visitor files, not the
  private working directory or source snapshots. Failed checks cannot become READY.
- P04-B: Approval records bind to the exact candidate and target. Reject missing,
  rejected, mismatched and stale approvals; no preparation command publishes.
- P04-C: Tests demonstrate that post-review changes to watched sources, templates,
  config, dataset and generated PDF/HTML invalidate approval. Repeated approval of
  the same unchanged candidate is idempotent; reject ambiguous candidate selection.
- P04-D: Document the actual approval action and authority check. In the manual
  version, the user approves an identified candidate and explicitly authorises release;
  a JSON `approved: true` flag written by the builder is never sufficient.

### P05 — End-to-end proof and operator guide

- P05-A: In a synthetic canonical workspace, change one manuscript status once;
  project wording, output group/count and public CV update together without
  editing generated files. Do not invent final metadata during an accepted status.
- P05-B: Test email/profile changes across their real dependent outputs, publication
  addition/deletion, clearance removal and qualification milestones. Submission or
  viva must not imply degree award. Conflicting sources stop factual propagation.
- P05-C: Prove deterministic rebuilds, NO_CHANGE, private-field exclusion, escaping,
  failed validation, stale approval and no publication before approval. Restore the
  public baseline after fixtures; never edit real qualifications to test a scenario.
- P05-D: Run HTML/content/navigation and project-path HTTP checks; render and inspect
  the public PDF. Perform browser/keyboard checks at 375/768/1440 CSS pixels and
  200% zoom with reduced motion. Record unavailable checks as NOT RUN; release 1's
  manual-preview exception is not a standing exception for release 2.
- P05-E: README documents actual commands, dependencies, generated-file rules,
  field coverage, editorial review, source conflicts, approval, rollback and next
  status triggers. Save a public-safe W10/P01–P05 acceptance report; mark local
  readiness only when required checks pass or a new user scope decision is recorded.

### P06 — Approved-release deployment and live verification

- P06-A: Reinspect current hosting and agree the release route when implementation
  reaches this task. Default first operational release: manual authorised publish
  of the approved public files using the existing arrangement. Optional later
  Actions migration deploys only the allowlisted output artifact; it requires
  explicit hosting-change authority and separate implementation evidence.
- P06-B: Publication verifies candidate/output hashes and approval before writes;
  missing/stale/failed review refuses deployment. Build/PR checks do not deploy.
  Cross-repository triggers, credentials and unattended remote writes are outside
  the initial scope; never give public jobs access to the private evidence bank.
- P06-C: Record commit/artifact, target URL and successful deployment. Check live
  page/metadata, all visitor assets and PDF hashes against the approved manifest,
  plus live mobile navigation and desktop layout. P06 remains incomplete without
  authority or actual deployment evidence; local success is not LIVE_VERIFIED.
- P06-D: Document restoration of the previous approved public release without
  destructive Git history rewriting. Test rollback selection locally; remote
  rollback also requires appropriate authority. Failed deployment leaves the
  approval/published-version record honest and does not claim success.

GitHub references to recheck when P06 is implemented:
[Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
and [workflow triggers](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows).
Do not promise hosted PR previews without choosing and testing a preview mechanism.

### P07 — Optional local watcher

Detailed agreed design and next-session prompt:
[P07_WATCHER_IMPLEMENTATION_PLAN.md](P07_WATCHER_IMPLEMENTATION_PLAN.md).
The user accepted a 120-second interval and requested documentation for a new
session. This session remains documentation-only; implementation/installation
starts under the explicit continuation instruction, not merely this file's presence.

- P07-A: Opt-in only, with documented start/stop and computer-running requirements.
  Watch declared sources; debounce bursts, wait for stable file writes and recover
  from restart/OneDrive synchronisation. Ignore private/unrelated paths.
- P07-B: Notify only for actionable public changes or failures. Never approve,
  commit, push or publish; do not duplicate proposals for identical content.
- P07-C: Fixture tests cover burst writes, source conflicts, no public change,
  stale approval and process interruption. Keep the explicit prepare command as
  the fallback; no persistent process is installed by default.

### P08 — Optional additional website adapters

- P08-A: Record named destinations, ownership, hosting, credentials and permitted
  content before access/writes. Share factual IDs, not necessarily identical prose.
- P08-B: Generate audience-specific outputs from the same approved public facts;
  validate each target independently. Review approval identifies included targets.
- P08-C: Track deployment/verification per target; a failed target is not hidden
  by another target's success. Rollback does not change canonical evidence.

## Implemented command interface

Use `npm --silent run workflow -- <operation>` with explicit roots outside public configuration:

```text
calibrate --source-root <canonical> --state-root <private-state>
prepare --source-root <canonical> --state-root <private-state> --release-date YYYY-MM-DD
qa --candidate <full-id>
approve --candidate <full-id> --target <url> --decision APPROVE --actor <user> --statement <explicit-decision>
gate --candidate <full-id> --target <url>
promote --candidate <full-id> --target <url> --authorise-publication
verify-live --candidate <full-id> --target <url> --commit <exact-commit>
rollback --rollback <full-id>  # dry-run; add --authorise-restoration only with authority
```

Except `qa`, operations also require the explicit source/state roots. README
documents arguments, browser runtimes, reviewed recalibration and publication
authority. `promote` copies existing approved bytes locally; commit/push is a
separate authorised manual action. No command starts a watcher or remote write.
Configuration contains no credentials or machine paths. Preview uses
`node scripts/preview.mjs <port> tmp/candidates/<id>/visitor` and exposes only
visitor files. Full candidate IDs are mandatory; there is no ambiguous "latest".

Implemented at P02: `npm run build -- --out tmp/candidates/<name>`,
`npm run test:propagation`, `npm run check:candidate -- <candidate directory>`,
and `node scripts/preview.mjs <port> <candidate directory>`. Use an existing Python
runtime via `SITE_PYTHON` or `--python`; exact packages are in `requirements-build.txt`.
The public-only P02 build/check commands remain usable without canonical access.
The new workflow layers private adapters, immutable review and manual release
checks over those builds. An implemented command alone supplies no authority.

## Evidence and resumption

For every completed task, record acceptance ID, command/manual check, actual result,
candidate/source fingerprints and public-safe evidence location. Private details
remain in the private workspace. Use `docs/releases/` for safe implementation and
release reports. Preserve NOT RUN/INCONCLUSIVE results and dependencies.

Current checkpoint: P01–P05 complete, P06 local release machinery verified. The
candidate in the 6 October acceptance report awaits exact release approval;
P06-C deployment/live checks are NOT RUN. P07/P08 stay deferred until opted into.
Parent W10 completes with P01–P05; parent W11 covers the operating guide/release-2
checks and P06's readiness/live status. A deferred deployment is not a completed P06.

### 5 October 2026 — plan recording session

- Request: record the agreed review-gated workflow as an actionable plan.
- Reviewed: both AGENTS.md files, parent decisions/tracker/latest session, current
  public inventory, CV builder, package scripts and README. Initial tree clean.
- Recorded: P01–P08, dependencies, 31 acceptance IDs, source/public boundaries,
  approval invalidation and explicit implementation/deployment authority limits.
- No generator, watcher, canonical edit or new deployment performed. Workflow
  implementation and runtime acceptance checks: NOT RUN.
- Plan-only verification: PASS, inline Node assertions run from a PowerShell
  here-string found eight unique tasks, 31 unique acceptance IDs, a criteria section
  for every task, ordered dependencies, six NOT_STARTED/two DEFERRED states,
  resolving local Markdown links and required authority/privacy controls. Public
  plan contains no absolute machine paths. `git diff --check`: PASS.
- Evidence location: this entry and the parent planning session below its tracker.
  These are documentation checks, not proof of implemented propagation. No P-task
  is DONE; no commit/push performed.

### 5 October 2026 — versioned baseline session

- User authority: commit and push the plan to `main`; documentation-only scope.
- Starting revision `f5f5f92`; fetched origin/main and confirmed zero commits
  ahead/behind. Only README and the two planning documents enter this checkpoint.
- PASS: inline Node documentation checks — eight tasks, 31 unique acceptance IDs,
  ordered dependencies/states, resolving local links and no absolute machine paths.
- PASS: `npm run check` — HTML/content checks, 26 public records, 24 anchors and
  seven navigation regressions. These are existing-site checks, not propagation
  implementation evidence. Workflow runtime checks remain NOT RUN.
- The Git commit containing this entry is the versioned planning checkpoint;
  resolve its revision with Git history. Commit/push verification is reported in
  the chat handoff. No visitor files or canonical evidence files are changed.
- Next implementation checkpoint when requested: P01–P02 on a separate local
  branch, followed by review. P01–P06 remain NOT_STARTED; P07/P08 remain DEFERRED.

### 5 October 2026 — P01/P02 local implementation session

- Scope change: user explicitly requested P01–P02 on a separate local branch,
  with per-criterion verification/progress records, canonical files unchanged,
  and a stop after P02 for review. No commit/push/publication/watcher authority.
- Started clean on `main` at `17d4ad2`; created `implementation/p01-p02`.
  HEAD remains that baseline and all changes remain uncommitted. Canonical AGENTS
  and all five recorded website source hashes rechecked; no source drift.
- P01-A/B/C/D → strict typed data, 199-field source coverage, thirteen synthetic
  fixtures, source-state/visibility tests and source-integrity review → PASS.
  Documentation records reviewed prose, conflict policy and coverage exclusions.
- P02-A/B/C/D → shared isolated generator, actual PDF/status propagation,
  boundary/escaping tests, repeated builds, existing candidate checks and
  baseline HTML/PDF parity/visual review → PASS. Tests: 22/22 propagation and
  7/7 navigation; no skips. HTML: zero errors/warnings; 26 records and 24 IDs.
  HTTP: ten visitor files byte-equal and nonvisitor paths 404. PDF: two pages,
  selected fields/links/privacy/bounds pass; text/link parity pass.
- Browser: in-app bootstrap unavailable; fresh isolated headless Chrome used
  instead. PASS at 375/768/1440 for text/link/meta/JSON-LD/ID/layout parity, no
  overflow, menu/Escape and no-JS anchors. HTML sections and both PDF pages
  inspected. Full accessibility/200% zoom/P05 matrix NOT RUN. W07 stays deferred.
- Normal builds read only the public dataset; no canonical writers, adapters,
  approval gate, deploy command or persistent process were added. All ten root
  visitor files equal HEAD (binary bytes; normalised text line endings).
- Canonical integrity: five used source files remain byte-identical and this task
  wrote no canonical files. Broader workspace count changed from 45 to 51 with
  unrelated career-market files appearing; aggregate equality is not claimed.
  Concurrent files were preserved and do not affect website inputs.
- Evidence: `docs/CONTENT_SOURCE_MAP.md`, `schemas/field-ownership.json`,
  `docs/releases/2026-10-05-p01-p02.md` and its `-checks.json`; candidate under
  ignored `tmp/candidates/p01-p02-review/`; browser/PDF captures under `tmp/`.
  Exact dataset/template/output/source hashes are in the machine summary.
- Commands: `npm run test:propagation`, `npm run build`, `npm run check`,
  `npm run check:candidate`, Python PDF check/parity and sitemap parse,
  `pdftoppm`, `scripts/review-candidate.mjs`, `npm ls --depth=0`, integrity
  comparisons and `git diff --check` → PASS. Loopback/junction checks passed
  with sandbox restrictions removed; earlier sandbox failures are recorded.
- Milestone: `P01_P02_COMPLETE_AWAITING_REVIEW`. W10 IN_PROGRESS; P03–P06
  NOT_STARTED; P07/P08 DEFERRED. No factual dependency blocks P01/P02. Stop now
  for the requested review; P03 is next only after an instruction to continue.

### 5 October 2026 — P01/P02 versioning session

- User requested the implementation checkpoint be committed and pushed before
  starting P03–P06. Scope: `implementation/p01-p02`, preserving `main`, released
  visitor files and canonical CV sources; no later P-task started.
- Starting HEAD `17d4ad2`; worktree contains only the reviewed P01/P02 files.
  Temporary candidates/captures remain ignored and outside the staged file set.
- Rechecked public exposure of proposed source records, schemas, fixtures, fonts,
  scripts and reports. Only the public derivative, public-safe provenance and
  synthetic fixtures are included; no private evidence-bank snapshots or records.
- Pre-commit checks: `npm run check` (26 records, 24 IDs, 7 navigation tests),
  `npm run test:propagation` (22/22, zero skipped), dataset/template/five-source
  fingerprint comparison and `git diff --check` → PASS. Remote `main` remains
  `17d4ad2`; the implementation branch did not previously exist on origin.
- Staged diff check caught trailing whitespace inherited from the bundled font
  licence. Normalised whitespace without changing its wording; staged check rerun.
- The commit containing this entry is the P01/P02 implementation checkpoint.
  Identify its revision with Git history; the push result and remote branch hash
  are verified after commit and reported in the chat handoff. This entry itself
  does not claim that a push has succeeded before it is attempted.
- P01/P02 remain DONE; P03–P06 NOT_STARTED and P07/P08 DEFERRED. The local
  acceptance report remains a dated verification record, not release approval.

### 6 October 2026 — P03–P06 local implementation session

- User reports merged/rebased P01/P02 and manual website verification; requests
  P03–P06 continuation. Started clean from `fc335e5` on `implementation/p03-p06`.
- P03-A–D, P04-A–D and P05-A–E: PASS. Commands/results, scope, hashes and
  per-criterion evidence are in `docs/releases/2026-10-06-p03-p06.md` and its
  `-checks.json`. Full regressions 31/31; workflow guard tests 9/9; navigation
  7/7, zero skips. Final candidate/browser/native-zoom/PDF checks and visual
  inspection pass. Full accessibility audit NOT RUN; W07 remains deferred.
- Real calibration reproduces reviewed data exactly; ordinary preparation gives
  NO_CHANGE. Intentional fixed-date generator release has no semantic fact change.
- Current exact candidate:
  `a43d917ca7f32dd605a2d4dcd60bad40db468d42078828f015a8d94306265e48`.
  Target `https://barry063.github.io/hao-yu-website/`. Package under ignored
  `tmp/candidates/<id>/`; preview serves ten public visitor files only.
- Final binding gate PASS; actual missing approval refuses with APPROVAL_REQUIRED.
  No actual approval record created. Failed QA draft remained non-READY; final
  physical-viewport zoom captures and actual section targets pass.
- P06-A/B/D local implementation/tests PASS. Hosting remains legacy Pages from
  main/root; run 37338747444 deploys merged `fc335e5`. P06-C new deployment and
  live browser/hash verification NOT RUN pending exact release approval/authority.
- Five canonical source hashes unchanged; ten root visitor files and repository
  public dataset equal starting HEAD (binary bytes; normalised text line endings).
  No canonical write, staging, commit, push, publication, hosting migration or
  watcher. Unrelated changes preserved. Private state remains outside both roots
  in the unsandboxed user's temporary directory; sandbox TEMP differs.
- Real canonical duplicate statuses still require reconciliation. Synthetic
  CONTRIB owner-reference rows prove mapped one-edit behaviour without migration.
  Links: eight PASS, five INCONCLUSIVE, zero FAIL.
- W10 DONE; W11/P06 IN_PROGRESS. P01–P05 DONE; P07/P08 DEFERRED. Next step is
  exact candidate approval, authorised release and live evidence. Local state is
  READY_FOR_REVIEW, not LIVE_VERIFIED.

### 6 October 2026 — authorised release 2 and live verification

- The user clarified that the request to publish authorised push/PR and release
  of the exact candidate already discussed. Recorded that decision verbatim in
  private state, bound to candidate `a43d917ca7f32dd605a2d4dcd60bad40db468d42078828f015a8d94306265e48`
  and the existing site target. No repeated full-hash confirmation was required.
- Reran 31 propagation tests: all PASS, zero skips. Input/source/runtime gate,
  exact promoted and committed file/dataset comparison, HTML/content and seven
  navigation regressions PASS. Five canonical sources unchanged.
- P06-A/B/C/D PASS: approved immutable promotion and rollback backup/dry-run;
  implementation commit `f92e081`; PR #2 merged release `05f18e2`; successful
  Pages run `37454512658`; all committed/served files and public PDF match;
  live mobile/tablet/desktop, keyboard, no-JS, reduced-motion and native 200%
  zoom checks PASS. Deployment rechecked after browser work, then the private
  published baseline advanced. Live captures visually inspected.
- Public evidence: `docs/releases/2026-10-06-release-2-deployment.md` and
  `-checks.json`. P01–P06/W10/W11 DONE; LIVE_VERIFIED. Record results in a
  documentation-only follow-up and verify that final main deployment as well.
- No canonical writes, watcher, new credentials or hosting change. P07/P08
  remain DEFERRED. Full accessibility audit NOT RUN; five external destinations
  remain INCONCLUSIVE due to access restrictions. Neither prevents the scoped
  P06 checks recorded in this release; no broader audit pass is claimed.

### 6 October 2026 — P07 plan consolidation for a new session

- User confirmed release 2, reviewed the watcher proposal and accepted a
  two-minute interval after clarification of resource cost/sign-in/sleep behaviour.
  Latest instruction: consolidate the design in a document for a new session.
- Saved `docs/P07_WATCHER_IMPLEMENTATION_PLAN.md`: declared sources, 120-second
  polling/settling, private-state preservation, notifications/deduplication,
  installed lifecycle, measurements and P07-A–C acceptance checklist. Includes
  an explicit implementation/installation prompt for the user to submit next.
- Current baseline `f0721b0`; tree clean before this documentation work. Preserved
  P01–P06 DONE/LIVE_VERIFIED and P08 DEFERRED. P07 remains DEFERRED until the
  implementation session; all P07 implementation checks are NOT RUN.
- No implementation, scheduled task, watcher, state migration, canonical edits,
  staging, commit, push or publication in this session. Documentation validation
  results are recorded in the parent website plan.

### 6 October 2026 — versioned P07 planning checkpoint

- User subsequently requested commit/push of the consolidated P07 plan. Only
  `P07_WATCHER_IMPLEMENTATION_PLAN.md` and the two parent planning records are
  included. The handoff prompt now preserves planning documents regardless of
  whether they are committed. Implementation and installation remain for the
  next explicitly invoked P07 session; no watcher is installed by this action.
- Public-safe documentation checks and staged file-scope review precede commit.
  The checkpoint revision is in Git history; push/remote confirmation follows
  commit and is reported in the session handoff. P07 checks remain NOT RUN and
  P07/P08 remain DEFERRED.

## Continuation prompt

> Read both repositories' AGENTS.md, docs/WEBSITE_UPDATE_PLAN.md and
> docs/CONTENT_PROPAGATION_PLAN.md. Recheck Git status and relevant canonical
> sources. Within the current user-authorised scope, implement the next available
> P-task; P01–P06 are now complete and P07/P08 remain deferred. Preserve the evidence bank's authority and keep
> private material outside the public repository. Verify each acceptance ID, save
> safe evidence, update this tracker and the parent's W10/W11 roll-up, and report
> remaining tasks. Do not publish, migrate canonical ownership, install a watcher
> or add destinations merely because this plan exists.

For the agreed P07 implementation and installation scope, use the explicit
handoff prompt at the end of [P07_WATCHER_IMPLEMENTATION_PLAN.md](P07_WATCHER_IMPLEMENTATION_PLAN.md).
