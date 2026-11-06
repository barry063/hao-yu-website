# Evidence-led content refresh — planning review, 6 November 2026

Original planning status: `PLAN_READY_FOR_REVIEW`. Scope: track evidence changes and propose website
updates before implementation. Website baseline: clean local `main` at `a242fb9`,
with the 20 October public dataset and recorded live release `80d8516`.
This review does not reverify the live deployment.

## Subsequent implementation instruction — 6 November 2026

Implementation completed: N02/N03 DONE. Final candidate and verification are in
the [November content review](releases/2026-11-06-content-review.md).
N04 remains NOT_STARTED. The original planning sections below are preserved as
the decision history; the implementation instruction and report supersede their
two-page-CV default and task-state snapshot.

The user requested continuation and selected the newly updated `main.tex` /
`main_CV_Hao Yu.pdf` as the public CV. This supersedes the original two-page,
dataset-generated CV proposal below. Preserve the four-page master content and
layout; remove the running “Academic CV” label and, following the user's explicit
answer, the mobile number. Use neutral PDF-title metadata. Canonical files remain
unchanged. The current export now matches the supplied master source/PDF and is
dated 6 November; the earlier EXPORT finding below is a historical snapshot.

The latest EB revision also resolves Oxford 2:1 and two poster presentations
through saved primary records. Include these on the page with source-specific
provenance. The user-selected CV clears its existing manuscript wording and
broader content for this public derivative; do not automatically promote all
master details into verified website claims. Keep the page's photonics account
at the published contribution level.

Implementation uses `content/proposals/2026-11-06.json`, a proposed field register
and a reviewed public PDF under `build-resources/public-cv/`. Builds copy the
hash-bound PDF; shared-fact/status checks require renewed review when the master
or relevant page facts change. Do not silently regenerate a shorter CV. Root
visitor files remain the previous release until an authorised promotion.

## Comparison and evidence

Compared the current canonical records with the released public dataset,
`CONTENT_DECISIONS.md` and the 20 October content-review report. Read the
6 November cross-application update, XRD harvest and correction-source review.
The canonical workspace has no Git repository. This is a source-hash comparison
and claim-level content review, not a complete line-by-line diff against an
available 20 October evidence-bank snapshot. Confirmation dates below identify
the evidence, not necessarily when the activity occurred or the file was edited.

Four of the five declared sources differ from the released fingerprints:
EB, PUB, CONTRIB and PROFILE. EXPORT is unchanged and still describes an internal
review PDF; it is not a public CV replacement. Exact old/new hashes and additional
reviewed-source hashes are in
[the planning checks](2026-11-06-content-planning-checks.json).

The main source remains EB version `v3-reconciled-2026-11-06`. Applicant-confirmed
facts remain `APPLICANT_CONFIRMED` in the website inventory, even where the bank
calls them “VERIFIED — applicant-confirmed”. They are not an independent audit of
laboratory data or certification.

## Recommended editorial direction

Retain the research-led single page, existing anchors and static generator.
Make the connection between experimental design, transport modelling,
characterisation and reusable methods clearer. Keep the five selected research
entries. Give training and service a compact place in Experience rather than
expanding the introductory biography into an equipment inventory.

### Change map

| ID | Evidence change or newly usable evidence | Current public coverage | Proposed destination and treatment |
| --- | --- | --- | --- |
| C01 | Close-space configuration design and local COMSOL flow investigation, with precursor-delivery/cross-contamination judgement; EB §§3.2,7.4,13.1; confirmed 29 October | Growth and source–substrate comparisons appear, but model-informed decisions are largely absent | Strengthen PROFILE, THEME-1 and PROJECT-WS2. Keep configuration design distinct from sole apparatus invention, construction and published model ownership. Do not publish recipe settings or unpublished quantitative results. |
| C02 | Bruker XRD acquisition, reference-pattern matching, phase identification and lattice-parameter analysis for WO3/suboxides; EB §7.2.4; confirmed 30 October/6 November | XRD absent | Add one concrete sentence to ABOUT and broaden THEME-2 to structural characterisation. Include a concise public-CV capability. No Rietveld or quantitative phase-fraction claim; no reassignment of collaborators' datasets. |
| C03 | Raman SOP authorship and Raman training now confirmed; EB §5.4 PR2, §8 T2; 29 October | SEM training and NanoDTC demonstrations already present | Add Raman alongside SEM and a short SOP statement. Retain the distinction between a written method and adoption of RamanPL_2D. Do not expose the internal SOP itself. |
| C04 | Academic Representative (Postgraduate Research), Engineering, October 2025–September 2026; EB §9.1; confirmed 22 October | Previously omitted for lack of role/date evidence | Add a dated experience record, proposed ID EXP-REP, with two-way student/department communication. No invented committee name or attributable policy outcome. |
| C05 | CVD reactor maintenance, pressure checks, vacuum/gas diagnosis, MFC/needle-valve delivery; EB §7.1.1; confirmed 29 October/2 November | Little coverage; shared SEM upkeep was already known | Add a concise laboratory-support statement in Experience/public CV. Describe maintenance and testing, without successful-repair, apparatus-construction or sole-management claims. |
| C06 | Written/submitted laboratory safety assessments; EB §7.5; confirmed 29 October/1 November | Absent | Pair with C05 as a short supporting responsibility. No assessment files, approval or industrial certification claims. |
| C07 | AZtec/INCA use (28 October) and fast-scan repeated-frame averaging (3 November); EB §§7.2.1,7.2.5 | Independent SEM/EDS and charging-prone Se imaging already covered | Use selectively in a compact methods/CV sentence if space permits. Do not add another project card or attach frame averaging to J2 without dataset evidence. Named software is lower priority than XRD and experimental judgement. |
| C08 | Recent operando-data analysis/post-growth characterisation and discussions of colleagues' experiments; EB §7.2.6; confirmed 4 November | Thesis operando image analysis already covered | Keep a general analysis sentence in ABOUT; a separate new project is unnecessary. No independent electrochemistry, personal platform installation or reassigned publication contribution. |
| C09 | BOE relationship initiation and continued contact; EB §4.3; confirmed 29 October | Generic career events and collaborator identification | Strengthen EXP-BOE with generalised initiative/follow-through wording. Omit names, distinctive commercial circumstances and investment outcomes. Keep existing MicroLED activity distinct from the separate later example. |
| C10 | Photonics correction scope reviewed; EB §3.6, PUB/CONTRIB J3 | Paper and correction linked; neutral measurements/design/simulation contribution | Update the working decision to recognise the correction review. Retain public contribution and correction link. Detailed PMMA/UV/MATLAB/Lumerical expansion remains conditional: EB §13.4 is SUPPORTED and CONTRIB retains VERIFY for detail beyond published attribution. |
| C11 | Cleanroom training occurrence confirmed, techniques unspecified; EB §8 T8; 4 November | Absent | Optional secondary training sentence, lower priority than Raman SOP and academic service. Do not infer EBL/RIE-specific training or formal accreditation. |

The October SEM/EDS, salt-control mapping and NanoDTC additions are already in the
released site. Reuse them without presenting them as newly established facts.
The detailed WS2 growth matrix and repeat-run evidence also predate the latest
cross-application update; the new value is the explicit experimental decision.

### Illustrative public wording for the core changes

These are review drafts, not promoted public records.

**Hero/profile:**

> I study how precursor chemistry and confined vapour transport shape
> low-dimensional materials. My work combines controlled growth experiments,
> transport modelling, microscopy and spectroscopy with reproducible Python
> analysis to connect processing conditions with material structure and optical
> response.

Retain the separate “PhD researcher in Engineering” and thesis-submission lines.
The existing headline can stay; a visual redesign is not needed.

**WS2 project, replacing part of the methods paragraph:**

> I designed a close-space growth configuration and combined local COMSOL flow
> modelling with controlled CVD comparisons to select practical precursor-delivery
> conditions. Paired source–substrate characterisation and Raman/PL measurements
> connect these choices with material formation.

Keep the salt-control SEM-EDS contribution available in the same card or CV, with
its exact sample identity. Compress repeated method lists to keep the card short.
Keep the first-author manuscript explicitly in preparation.

**Characterisation:**

> I independently acquire SEM/EDS and Raman/PL data. I have also collected and
> analysed Bruker XRD data for tungsten oxides and suboxides using reference-pattern
> matching, phase identification and lattice-parameter analysis.

Retain a separate sentence crediting collaborator-acquired operando/TEM/XPS data
where the relevant project is described.

**Training and laboratory contribution:**

> I wrote a group SOP for Raman characterisation and analysis and trained
> researchers in SEM and Raman workflows. My laboratory contributions include
> CVD reactor maintenance, pressure and precursor-delivery checks, and preparing
> departmental safety assessments.

Use undated narrative for these activities: confirmation dates are not activity
start/end dates. The existing experience type requires both month fields, so do
not force these activities into a dated employment record or invent dates.

**Academic service:**

> Academic Representative (Postgraduate Research), Department of Engineering,
> University of Cambridge · October 2025–September 2026. Represented postgraduate
> perspectives in departmental discussions and communicated information and
> decisions back to students.

**BOE, generalised addition:**

> Initiated and maintained research–industry contacts to connect relevant
> academic expertise with next-generation display needs.

## Items to retain or omit

- Retain thesis-submitted/degree-pending status. No new completed qualification
  milestone is established. Administrative forecasts and application availability
  do not belong on this public page.
- Current canonical records retain four published research articles, one
  co-authored manuscript under review and one first-author manuscript in
  preparation. These statuses retain their recorded confirmation dates; this
  review does not claim a fresh journal decision or portal check.
- Retain the software feature summary and repository link. No new current
  version, release DOI, adoption or performance claim is justified by this review.
- Keep unpublished quantities/recipes, provisional authorship, private commercial
  particulars, referee information and application records outside public files.
- Keep optional future interests separate from established work. No new
  electrochemical, robotic or machine-learning capability follows from these updates.
- Detailed photonics methods/performance remain the only conditional expansion
  in this plan. Their omission does not block the other changes. The primary
  correction review is a dated indexed-text review, not a new full-paper/SI audit.

## Implementation sequence and acceptance

| Task | Scope | Dependency | Acceptance | State |
| --- | --- | --- | --- | --- |
| N01 | Record source changes and a public-safe, section-level proposal | Current sources and released inventory | N01-A: compare five hashes; N01-B: map additions, existing coverage and holds; N01-C: preserve source/public files and verify documentation scope | DONE |
| N02 | Prepare public-only candidate data and claim provenance | User instruction to implement this plan | W01-A–D, W02-C/D, W03-A/C, W04-C/E, W05-C; every selected change has evidence, visibility and exact wording | NOT_STARTED |
| N03 | Generate and verify website/public CV together | N02 | W06-A/B, W08-A/B/D/E and P05-D; inspect PDF, responsive browser, keyboard/zoom and project-path loading; record actual results | NOT_STARTED |
| N04 | Deliver/publish the reviewed exact candidate and verify live | N03 plus applicable release instruction | P06/W09 exact-candidate gate, approved output hashes and live deployment/browser checks | NOT_STARTED |

For N02, create a dated `content/proposals/` dataset; keep root visitor files at
the existing release while reviewing. Update CONTENT_DECISIONS, CONTENT_SOURCE_MAP
and field ownership for new claims, especially EXP-REP. Broaden the Experience
introduction to include training and service. Prefer an authored narrative for
undated laboratory/training contributions; inspect renderer support and adjust
the template/CV selection only as needed. No framework or hosting change.

Recheck all canonical fingerprints before preparation. Resolve the private
calibration against the current source structure and the explicitly reviewed
proposal; the old calibration cannot make new prose public automatically.
Preserve the published baseline and installed watcher history. Stale blanket
CONTRIB J1 personal-record holds must not erase later specific EB confirmations,
and later general confirmations must not overwrite the published J1 attribution.
CONTRIB's top-level `last_revised` still says 1 October despite updated correction
text: use content hashes and record-level provenance, not that date alone.

Generate the public PDF from the same public dataset, with its actual build date.
Aim to retain the current two-page format by removing repetition; assess layout
before adding optional named software/cleanroom details. Do not copy the internal
master export. Refresh descriptions/social wording only where the final profile
changes; preserve qualification status and relative GitHub Pages asset paths.

## Planning verification and limitations

N01-A: `Get-FileHash -Algorithm SHA256` against `content/site.json` source entries:
PASS, four changed/one unchanged. N01-B: source and public-inventory review:
PASS, C01–C11 mapped; no new status or contribution silently promoted.
N01-C: documentation-only diff, relative-link/JSON/hash checks and
`git diff --check`: PASS; exact results in the checks file.

No canonical records, public dataset, visitor assets, installed watcher or
calibration were edited. No candidate build, browser/PDF tests, network link
checks, commit, push or publication were performed. Those checks are `NOT RUN`
for this planning session. Historical LIVE_VERIFIED remains tied to the October
release; this plan is not READY_TO_PUBLISH. W07/P08 remain deferred.
