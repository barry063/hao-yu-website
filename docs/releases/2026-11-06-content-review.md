# November content update and public master CV

Release follow-up: the user has instructed proceeding with N04. Exact-candidate
approval is recorded and the public files/field register are promoted locally
for PR delivery. The readiness report below remains the pre-publication record;
live verification will be recorded separately after deployment.

6 November 2026. N02/N03 complete. Local milestone: **READY_TO_PUBLISH**;
workflow state: **READY_FOR_REVIEW**. N04 has not started. No commit, push,
promotion or publication has occurred.

Candidate:
`07902d3ccd18204ded129d68dfd5171c6e6fc056c845e4d22a5a5fdaf59e807b`

Target: `https://barry063.github.io/hao-yu-website/`.
Baseline: clean published dataset at `a242fb9`, with the earlier planning documents
preserved. Local branch: `content/evidence-refresh-2026-11-06`.

## User instruction and result

The user requested implementation after the planning review and explicitly chose
the refreshed four-page master CV as the public download. They subsequently
confirmed removing the mobile number. The master source, original PDF and export
record were inspected and matched by SHA-256. The new public PDF was compiled
from a separate copy with only these presentation/privacy changes:

- Remove the running “Academic CV” label.
- Remove the mobile number, retaining location, email and profile links.
- Change PDF title metadata to “Hao Yu - Curriculum Vitae”.

All four pages' substantive text and hyperlink targets match the master after
those removals. The original files remain unchanged. The public PDF has SHA-256
`5c3f21f01a544daa8e9b78a07a25d7561c3f0f9ebfbed1fe3680c76a1eccff02`.
It is stored under `build-resources/public-cv/Hao_Yu_CV.pdf`; the candidate download
is byte-identical. The private canonical TeX source was not added to this repo.

The page now includes:

- Model-informed close-space growth and local transport reasoning.
- Bruker XRD acquisition and structural analysis alongside SEM/EDS and Raman/PL.
- Raman SOP/training, laboratory contributions and dated postgraduate representation.
- More precise BOE initiative and a clearly proposed EnterpriseTECH roadmap.
- Oxford 2:1, verified in the latest EB update, and two verified poster entries.
- The master CV's WS2 working title, clearly labelled in preparation.

The page retains pending-PhD status, four published research articles, separate
unpublished groups and the photonics correction link. Optional instrument/software
detail stays in the full CV. The page does not upgrade the master's SUPPORTED
photonics details into VERIFIED claims. The user's explicit selection of the
master clears that supplied document's broader content for this public derivative;
the general exclusion of private archives, referees and submission references remains.

## Source review and implementation

The five current source hashes are recorded in the
[checks record](2026-11-06-content-review-checks.json). Relative to the initial
planning pass, EB and EXPORT changed again during the separate master-CV session.
The updated export names the actual source/PDF and is dated 6 November. Its
primary-source addendum resolves Oxford classification and two poster entries.
These are dated canonical/primary-record reviews, not new live journal decisions.

Public candidate: `content/proposals/2026-11-06.json`.
Proposed ownership register: `content/proposals/2026-11-06-field-ownership.json`,
232 fields. The root inventory/register remain the released October pair.
The renderer supports undated experience narratives and selected posters while
retaining existing anchors, layout and static HTML/CSS/JS.

The optional `presentation.cv_document` binds the reviewed public asset, date,
page count, master/export hashes and shared-fact fingerprint. Builds copy its
exact bytes. The old generated-CV route remains available for existing datasets.
The download label uses the CV date independently of the website review date.
Changes to shared records, including deletion or visibility loss, require renewed
CV review; a fixed PDF must not retain a withdrawn output silently. Additional
checks compare actual PDF identity, milestones, output titles/statuses and links.
Free-form page and master prose still require editorial review.

## Verification

| Acceptance / check | Actual result and evidence |
| --- | --- |
| W01-A–D, W02-C/D, W03-A/C, W04-C/E, W05-B/C | PASS: source/claim/visibility review, current fingerprints, public proposal, decisions and 232-field register |
| W06-A/B, candidate scope | PASS: four-page PDF; master/export hashes match; only requested removals; all links preserved; no LaTeX warnings/overfull/underfull boxes; all four rendered pages inspected |
| W08-A/D, P05-D | PASS: exact ten-file visitor allowlist, HTML validation, 30 records/24 anchors, metadata/assets, project-path HTTP byte equality and non-visitor 404s |
| W08-B, P05-D | PASS: Chrome 157.0.8103.38 at 375/768/1440; keyboard menu/skip/anchors, reduced motion, no JS, native 200% zoom with no horizontal overflow |
| Browser visual review | PASS: desktop overview, zoomed publications, focused desktop profile/posters and mobile training/service/poster captures; existing screenshot capture can include the sticky header in element/full-page captures |
| Regression suite | PASS: 58/58 propagation tests; subsequent affected contract/reviewed-CV suite 18/18 after strengthening shared-fact/clearance binding; zero skips |
| Released-root regression | PASS: `npm run check`, including seven navigation tests; released dataset and visitor files unchanged against Git |
| Determinism / PDF identity | PASS: two complete builds have identical outputs and copy the reviewed PDF exactly |
| Candidate integrity | PASS: package, inputs, runtime, sources and policy gate with `requireApproval:false`; no user approval invented |
| Preservation | PASS: five declared-source hashes and master source/PDF hashes unchanged; no watcher configuration/history writes by this session |
| W08-E | PASS: this report/checks JSON, source/output hashes, commands and limitations recorded |
| External destinations | NOT RUN: destination URLs unchanged; Scholar locale parameter treated as optional while preserving account identity |
| Full accessibility audit / deployment | NOT RUN; W07 remains deferred, N04 awaits applicable release instruction |

Commands used:

```text
pdflatex -interaction=nonstopmode -halt-on-error -output-directory=tmp/pdf-master-public tmp/pdf-master-public/Hao_Yu_CV.tex
pdftoppm -scale-to 1400 -png tmp/pdf-master-public/Hao_Yu_CV.pdf tmp/pdf-master-public/public
node scripts/build-site.mjs --data content/proposals/2026-11-06.json --out tmp/candidates/november-draft-1 --python <bundled-python>
<bundled-python> scripts/check_public_cv.py <candidate-pdf> content/proposals/2026-11-06.json
node scripts/check-candidate.mjs <candidate-visitor> <candidate-data>
npm run test:propagation
node --test tests/propagation/reviewed-cv.test.mjs tests/propagation/contract.test.mjs
node scripts/workflow-cli.mjs calibrate --source-root <canonical-root> --state-root <private-final-state> --data content/proposals/2026-11-06.json
node scripts/workflow-cli.mjs prepare --source-root <canonical-root> --state-root <private-final-state> --release-date 2026-11-06
npm run check
git diff --check
```

PDF compilation ran twice. Browser validation is invoked by `prepare`.
Focused captures also used the existing local Chromium/Playwright setup.
Evidence: `tmp/pdf-master-public/`, `tmp/qa/<candidate>/` and the immutable
`tmp/candidates/<candidate>/` package. Final visitor bytes match the inspected
draft; later safeguards changed input bindings without changing rendered content.

## Environment and retries

The in-app browser bootstrap failed with an unavailable/untrusted native bridge;
no documentation interface was exposed. Repository browser QA provided the
fallback. Sandbox localhost requests initially failed with EACCES; authorised
outside-sandbox execution passed. PDF extraction initially separated LaTeX
chemical subscripts; line tolerance was corrected and the real PDF was rechecked.

The current bundled runtime has Pillow 13.0.0. Tests/preparation used the available
cached Pillow 12.3.0 package set through PYTHONPATH, alongside Python 3.12.14,
ReportLab 4.4.9 and pdfplumber 0.11.9. No installed runtime was modified. Private
`operator-runtime.json` preserves the exact local executable/package paths.

An interim private calibration was created before the shared-fact fingerprint
became required. Its refresh correctly failed validation. It remains preserved;
the final candidate uses a fresh private calibration in this chat's private
visualisation workspace, directory `private-website-review-final`. Earlier
development candidates are superseded and must not be promoted. Installed watcher
state is separate and was not recalibrated/revalidated here.

## Handoff

N02/N03 DONE; N04 NOT_STARTED. The selected CV is ready within the reviewed
candidate. Preview it with:

```text
node scripts/preview.mjs 4173 tmp/candidates/07902d3ccd18204ded129d68dfd5171c6e6fc056c845e4d22a5a5fdaf59e807b/visitor
```

Use the final private state and pinned runtime for subsequent exact-candidate
approval/gate/promotion when instructed. Promote the proposed field register
with its matching dataset. A source, code, policy or asset change requires a new
candidate. Review the installed watcher's bindings separately before revalidating
it; this content update does not claim watcher reinstallation or live verification.
