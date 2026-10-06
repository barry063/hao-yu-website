# Hao Yu — Academic website

Website: [barry063.github.io/hao-yu-website](https://barry063.github.io/hao-yu-website/).

A static academic portfolio covering low-dimensional materials growth, spectroscopy,
research software, publications and professional experience. HTML/CSS/JavaScript
is served directly from the repository root by GitHub Pages.

## Update plan and evidence

Start with [AGENTS.md](AGENTS.md) and the [website update plan](docs/WEBSITE_UPDATE_PLAN.md).
The plan records numbered tasks, acceptance criteria, dependencies and progress.
[One-edit propagation plan](docs/CONTENT_PROPAGATION_PLAN.md) defines the next
phase: canonical edit → public-safe candidate → your review → approved release.
It records P01–P08 and verifiable targets. P01–P05 provide the public-data contract,
shared generator, canonical preparation, review gate and operator guide. P06 adds
authorised publication and verification of the deployed candidate. The plan is
not standing permission to publish.
[Public content decisions](docs/CONTENT_DECISIONS.md) records reconciliations and
omissions. [Release reports](docs/releases/) record actual verification results.

`content/site.json` version 2 is the reviewed public dataset. Its source references point into
the separate canonical CV workspace; the private evidence files are not copied
into this repository. Every published record has a source, evidence status and
review date. [The source map](docs/CONTENT_SOURCE_MAP.md) documents typed shared
facts, authored prose, field coverage and exclusions. The generator uses this
dataset and `templates/index.html`; root visitor files remain the released snapshot
until a specifically authorised promotion. Do not hand-edit generated candidates.

## Local checks and preview

Node.js 22 or later is required for development checks, not for visitors or hosting.

```powershell
npm ci --ignore-scripts
npm run check
npm run preview
```

Open [the project-path preview](http://localhost:8080/hao-yu-website/).
The preview also works at the server root and serves only public website files.

`npm run check` validates HTML and checks claim provenance, exact rendered wording,
fragment targets, assets, metadata, output counts and image dimensions, and runs
seven navigation behaviour regressions. Those regressions do not replace browser
inspection of focus, responsive layout or accessibility.
`npm run check:links` checks public destinations; bot blocking and network errors
are reported as inconclusive.

The candidate generator requires Python 3.12 with the exact packages in
`requirements-build.txt`: ReportLab 4.4.9, Pillow 12.3.0 and pdfplumber 0.11.9.
The tested bundled runtime is Python 3.12.14. It uses licensed, SHA-256-pinned
Vera fonts in `build-resources/fonts/`, invariant PDF metadata and an explicit
`release_date` in the dataset. JavaScript check dependencies are pinned in the
lockfile. No canonical workspace, credentials or network access is needed to build.

```powershell
$env:SITE_PYTHON = 'python'  # or the existing bundled Python executable
npm run build -- --out tmp/candidates/my-review
npm run test:propagation
npm run check:candidate -- tmp/candidates/my-review
& $env:SITE_PYTHON scripts/check_public_cv.py tmp/candidates/my-review/assets/Hao_Yu_CV.pdf
node scripts/preview.mjs 8080 tmp/candidates/my-review
```

Use a new empty child of `tmp/candidates/` for each build. The command refuses
root/asset paths, nonempty output and symlinks. It emits only ten allowlisted
visitor files, with hashes on stdout; planning docs, datasets and scripts are
excluded. A failed candidate carries a failure marker and fails validation.
It does not approve, stage, commit, publish, watch sources or change the master CV.

Render and inspect the PDF using `pdftoppm`; run the browser review on the isolated
candidate. `scripts/review-candidate.mjs` optionally uses an existing Playwright
module and a fresh headless browser (`SITE_PLAYWRIGHT_MODULE` and
`SITE_BROWSER_EXECUTABLE`), compares against the released root page, and saves
public-only captures under ignored `tmp/p02-review/`. It is baseline parity QA,
not an accessibility certification or approval action. Record unavailable checks
as NOT RUN. The unchanged social card is copied after hash verification; changed
displayed fields generate a deterministic card and require visual review.
`scripts/prepare_assets.ps1` is the older manual asset helper; it writes root
assets and is not part of candidate preparation. The original photograph remains
available in `assets/hao-yu.jpg`.

## Routine content updates

1. Recheck the current canonical evidence and its verification holds.
2. Use the explicit local workflow below. Contact name/email/location, approved
   profile URLs, qualified milestones and cleared output metadata/status have
   adapters. Scientific prose, roles, contributions, experience and honours require
   editorial review. The ownership map describes the boundary. Existing canonical
   publication statuses are duplicated: disagreements stop for reconciliation;
   the adapters do not silently treat a stale mirror as authoritative.
3. Review the public change list, HTML and PDF, then approve the exact candidate
   and target. Never edit generated files to fix a factual discrepancy.
4. Record source/asset hashes and actual checks in `docs/releases/` and the plans.
   Local readiness and a verified live deployment are separate states.

Set `SITE_PYTHON` to a runtime satisfying `requirements-build.txt`. Browser checks
also need an existing Playwright module at `SITE_PLAYWRIGHT_MODULE` and Chrome at
`SITE_BROWSER_EXECUTABLE`. They use disposable profiles, not a signed-in session.
No watcher or new credentials are installed. Preparation runs HTML/content,
navigation, project-path HTTP, PDF, keyboard, three-width, reduced-motion, no-JS
and native browser 200% zoom checks. Inspect the captured screenshots and render
the PDF with `pdftoppm` before approving it; automated success does not replace
visual review. A full accessibility audit is a separate check.

Provide both local roots explicitly; do not save machine paths in this repository.
The private state root must be outside the website **and** canonical workspace.
It contains raw calibration snapshots, private reconciliation instructions,
approvals and rollback backups. Preserve it securely across releases.

```text
npm --silent run workflow -- calibrate --source-root <canonical-root> --state-root <private-state>
npm --silent run workflow -- prepare --source-root <canonical-root> --state-root <private-state> --release-date YYYY-MM-DD
```

Calibration requires the five hashes in an explicitly reviewed public dataset to
match current sources, and the adapters to reproduce that dataset exactly. To
initialise state, verify that the root `content/site.json` is the last published
inventory; it seeds the published comparison baseline, independently of any
pending reviewed policy. Keep private state through local promotion and release.
To
resolve an editorial hold or clear a new record, review a public-only dataset
against authoritative evidence, then use `calibrate --data <reviewed-public.json>
--refresh-reviewed-calibration` with the same roots. This retains the published
baseline and historical calibrations; it invalidates older approvals. Refresh
field ownership when the public shape changes. Do not clear unknown records by
editing raw source visibility flags alone. `HOLD`/`PRIVATE` remove previously
cleared records and dependent project prose; unresolved PUBLIC evidence stops.
`CONTRIB` owner-reference rows are supported for an explicitly approved canonical
ownership format; the synthetic one-edit proof uses this format. Real sources
remain unchanged and continue to require duplicate-status reconciliation.

Unchanged/private-only edits return `NO_CHANGE`. For an intentional generator
release with unchanged facts, add `--force-candidate` and a fixed release date.
Failed/ambiguous inputs produce private `reconciliation.json` instructions and
safe error codes; no partial dataset becomes a candidate. Preparation reads only
five declared canonical files and performs no canonical writes or network calls.

Successful preparation returns a full SHA-256 candidate ID. Its public package is
`tmp/candidates/<id>/`: `data.json`, `manifest.json`, `review.json` and `visitor/`.
The manifest binds source hashes, reviewed/published/repository datasets, generator
inputs, dependencies/runtime versions, date, target, checks and all ten outputs.
The package contains public facts only and is ignored by Git. Preview exposes
only the visitor allowlist, including at the GitHub Pages project path:

```text
node scripts/preview.mjs 4173 tmp/candidates/<id>/visitor
npm --silent run workflow -- qa --candidate <full-id>
```

The actual approval action is a user's explicit decision identifying the candidate
and target, either directly or through unambiguous conversation context. The
operator records the user's decision verbatim against the full ID and target;
the user need not repeat a hash already supplied in the conversation. An agent
must not approve its own draft. A JSON record is an audit aid, not a credential
or authority. All commands below take the same `--source-root` and `--state-root`.

```text
npm --silent run workflow -- approve --candidate <full-id> --target <site-url> --decision APPROVE --actor <user> --statement <explicit-user-decision>
npm --silent run workflow -- gate --candidate <full-id> --target <site-url>
npm --silent run workflow -- promote --candidate <full-id> --target <site-url> --authorise-publication
```

Promotion requires current explicit release authority as well as an unchanged
approved package. Source, policy, template, config, dataset, runtime or output
drift refuses promotion. It copies approved bytes and data into the root, saves
a hash-verified private rollback snapshot, and records `PROMOTED_LOCALLY`; it
does not rebuild, commit or push. Reprepare and obtain fresh approval after drift.

Trigger a review after a PhD milestone, manuscript decision, new publication,
software release, changed affiliation/contact details or completed experience.
The review date is a historical timestamp, not a promise of continuously current
publication or qualification status.

## Local Windows watcher (P07)

The opt-in watcher checks the five declared canonical files every 120 seconds
while Windows is awake and you are signed in. It waits at least ten seconds for
changed inputs to settle before preparing a checked website/CV proposal. Windows
notifications use the existing PowerShell notification identity and contain only
generic review/attention instructions. `NO_CHANGE` remains quiet.

The installed task is `HaoYuWebsiteWatcher`. Its private configuration and history
live in `HaoYuWebsiteWatcherNative` under your local application data, outside
OneDrive and both repositories. Configuration records explicit executable paths.
The native signed-in account must create the installation files: tool-created
encrypted files on this machine were inaccessible to the scheduled task. The
original temporary state and verified interim copy remain preserved.

From this repository in PowerShell, use these actual controls:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/manage-watcher.ps1 -Action Status
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/manage-watcher.ps1 -Action Stop
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/manage-watcher.ps1 -Action Start
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/manage-watcher.ps1 -Action Disable
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/manage-watcher.ps1 -Action Uninstall
```

`Start` also enables a disabled task. `Uninstall` removes the task and launcher,
preserving private calibration, approvals, published baseline and rollback history.
Use `Install`, then `Start`, to reinstall from that retained configuration. Pass
`-Config <absolute-private-config>` when using another reviewed private location.
`NotifyTest` sends a labelled test notice and checks Windows notification history.

For a foreground session use `npm --silent run watcher -- run --config
<absolute-private-config>`; Ctrl+C stops it. All manual workflow CLI operations
share an ownership lock with watcher preparation. A second watcher refuses to
start. Exited owners are recoverable; an incomplete lock without a trustworthy
owner record requires inspection. Never delete a live owner's lock.

`Status` gives the exact pending candidate and target. Review its `review.json`,
`visitor/` preview and public CV using the existing workflow commands. Source
changes supersede pending review. Code, policy, configuration or publication
baseline changes pause the watcher with `REVALIDATION_REQUIRED`; run the relevant
tests, inspect the changes, then use `-Action Revalidate` to stop, bind the reviewed
inputs and restart. Revalidation never forces a candidate or approves a release.

The watcher makes no wake or sleep-prevention request. It runs while locked if
Windows remains awake, stops at sign-out/shutdown and catches up after resume or
restart once file writes settle. Actual sign-in, physical sleep/resume and live
OneDrive synchronisation verification remain distinct from synthetic tests; see
the [P07 verification report](docs/releases/2026-10-06-p07.md).

State records use atomic replacement where available and two bounded checksummed
recovery slots where Windows refuses replacement. Preserve `.slot-0`/`.slot-1`
alongside their JSON mirrors when backing up private state. The Node commands read
the latest valid committed slot. No evidence text or raw diagnostics enter desktop
notices or normal watcher status. Preparation failures retry at most three times
with backoff; notification delivery retries at most three times per identity.

Verification commands reuse the existing Python, Playwright and Chrome settings:

```text
npm run test:watcher
npm run test:propagation
node scripts/verify-watcher-lifecycle.mjs
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-installed-watcher.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-installed-source-read.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/measure-watcher.ps1
```

The installed lifecycle verifier is an explicit disruptive trial: it expects no
existing task, installs/stops/disables/uninstalls/reinstalls it and preserves private
history. Run it only when intentionally verifying an installation. The
source-read verifier temporarily holds a read-only exclusive handle on the declared
EXPORT file to verify installed access recovery, then verifies unchanged bytes.
Run it only as an intentional availability test. The resource measurement
requires at least ten minutes and includes Node, its hidden PowerShell launcher
and the detached WScript wrapper, plus the pre-existing native console host.
Launch counts use explicit watcher telemetry and Windows process snapshots;
native process-trace subscription was unavailable.
The existing explicit `workflow -- prepare` command remains the manual fallback.
The watcher never approves, promotes, stages, commits, pushes or publishes.

## Publishing with GitHub Pages

Use the existing repository's Pages configuration. For branch-based hosting,
select `main` and `/ (root)`. Relative assets support the
`/hao-yu-website/` project prefix. `.nojekyll` keeps the checked-in website files
served as static assets. No production build is required.

Before pushing, check the public content inventory and release report. Local
verification does not establish that the deployed site has changed. Record the
deployed commit and verify the live page, assets, canonical metadata and CV hash.

After separately authorised commit/push to `main`, verify the exact deployed
commit with the candidate-bound command (same local roots required):

```text
npm --silent run workflow -- verify-live --candidate <full-id> --target <site-url> --commit <40-character-commit>
```

This checks the current main revision, successful Pages deployment, committed and
live visitor files (binary bytes; normalised text line endings), metadata through
the approved HTML, public PDF and live browser/navigation layout. `.nojekyll` is
verified in the commit because Pages may not serve it. The published dataset is
advanced only after all checks pass. Failures never become `LIVE_VERIFIED`.
The older `check-live.mjs` remains a baseline comparator, not release approval.
`node scripts/github-pages-status.mjs` reads Pages settings and workflow status
using the configured Git credential helper without logging credentials.

Rollback first selects and validates the exact saved previous release:

```text
npm --silent run workflow -- rollback --rollback <rollback-id> --source-root <canonical-root> --state-root <private-state>
```

With explicit restoration authority, add `--authorise-restoration` to restore
local files. Then review and use a new authorised commit/push; never force-push or
rewrite public history. Remote rollback also needs live verification. Missing or
tampered backups refuse restoration. A failed local promotion restores its backup.

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | Static page structure and visitor content |
| `styles.css` | Responsive layout, typography and focus styles |
| `script.js` | Progressive navigation and scrolling enhancements |
| `content/site.json` | Typed reviewed public dataset and canonical fingerprints |
| `schemas/`, `docs/CONTENT_SOURCE_MAP.md` | Public boundary and field ownership |
| `templates/`, `build-resources/` | Candidate layout, licensed fonts and card baseline |
| `tests/propagation/`, `tests/fixtures/propagation/` | Contract, privacy and generator regressions |
| `assets/` | Public CV, portrait, social card and original portrait |
| `scripts/` | Validation, preview, link checking, CV and asset preparation |
| `docs/` | Plan, content decisions and release evidence |
| `sitemap.xml`, `robots.txt` | Discoverability metadata |

## Licence and acknowledgements

Site code is released under the [MIT licence](LICENSE). Biographical and research
text remains the author's. The earlier layout originated from
[hao-yu-academic-site](https://github.com/Mirainthehub/hao-yu-academic-site).
Fonts: Inter and Source Serif 4 via Google Fonts; CV/build card fonts are Bitstream
Vera under [its bundled licence](build-resources/fonts/LICENSE.txt).
