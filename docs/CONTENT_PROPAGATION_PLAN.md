# One-edit content propagation — implementation and acceptance plan

Created: 5 October 2026. Version: 1.0.
State: PLAN_BASELINED_IMPLEMENTATION_NOT_STARTED.
Parent contract: [WEBSITE_UPDATE_PLAN.md](WEBSITE_UPDATE_PLAN.md), W10/W11.
Implementation baseline: website revision `f5f5f92`; recheck before starting.

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
All core tasks are NOT_STARTED; optional extensions remain DEFERRED.

| ID | Deliverable | Dependencies | State | Completion evidence |
| --- | --- | --- | --- | --- |
| P01 | Source ownership map and public data contract | Implementation instruction | NOT_STARTED | Schema, mapping, fixtures and coverage report |
| P02 | Deterministic shared public-output generator | P01 | NOT_STARTED | Build scripts/templates and baseline parity report |
| P03 | Local canonical adapters and change detection | P01, P02 | NOT_STARTED | Prepare command, safe export and reconciliation tests |
| P04 | Review package and stale-approval gate | P03 | NOT_STARTED | Manifest, review UI/summary and gate tests |
| P05 | End-to-end one-edit proof and operator guide | P02–P04 | NOT_STARTED | Acceptance report and reproducible dry-run |
| P06 | Approved-release deployment and live verification | P05; specific release/hosting authority | NOT_STARTED | Deployment configuration, negative tests and live release report |
| P07 | Optional local change watcher | P05; explicit opt-in | DEFERRED | Watcher lifecycle, debounce and no-publication tests |
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
  version, the user approves a named candidate and explicitly authorises release;
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

## Proposed command interface — not implemented

These names describe the intended operator experience, not available commands:

```text
prepare --source-root <local canonical workspace>
build --candidate <id>
check --candidate <id>
preview --candidate <id>
approve --candidate <id>       # explicit user decision, not builder approval
publish --candidate <id>       # separate current authority; refuses stale inputs
verify-live --candidate <id>
```

Implementation should expose real package/CLI commands and update this section
and README. Configuration must not contain credentials or machine-specific paths
in tracked public files. Preparing a candidate never stages or commits files.

## Evidence and resumption

For every completed task, record acceptance ID, command/manual check, actual result,
candidate/source fingerprints and public-safe evidence location. Private details
remain in the private workspace. Use `docs/releases/` for safe implementation and
release reports. Preserve NOT RUN/INCONCLUSIVE results and dependencies.

Next executable task after implementation is requested: P01. Then P02 -> P03 ->
P04 -> P05. P06 needs release authority; P07/P08 stay deferred until opted into.
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

## Continuation prompt

> Read both repositories' AGENTS.md, docs/WEBSITE_UPDATE_PLAN.md and
> docs/CONTENT_PROPAGATION_PLAN.md. Recheck Git status and relevant canonical
> sources. Within the current user-authorised scope, implement the next available
> P-task, beginning with P01. Preserve the evidence bank's authority and keep
> private material outside the public repository. Verify each acceptance ID, save
> safe evidence, update this tracker and the parent's W10/W11 roll-up, and report
> remaining tasks. Do not publish, migrate canonical ownership, install a watcher
> or add destinations merely because this plan exists.
