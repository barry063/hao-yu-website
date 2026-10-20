# Evidence Bank content review — 20 October 2026

Local milestone: **READY_TO_PUBLISH**. Workflow state: **READY_FOR_REVIEW**.
Publication and live verification: **NOT RUN**; this candidate has no release
approval. Completed R01/R02; R03 requires the user's publication instruction.

Subsequent PR instruction: the user confirmed manual review and requested PR
creation and approval. The exact candidate is now **APPROVED** and
**PROMOTED_LOCALLY** for branch delivery. The sections below preserve the original
review evidence. No merge or live deployment is implied by this update.

Reviewed public dataset: [proposal](../../content/proposals/2026-10-20.json).
Machine-readable changes, source/output hashes and actual results:
[checks](2026-10-20-content-review-checks.json).

Candidate:
`4eb30765381846dcc432ba923fe139623d700d372476e8f0a1c8f7ec51bb373f`

Target: `https://barry063.github.io/hao-yu-website/`.
Repository baseline: `9c1ce7d` (`implementation/p07`); initially clean.

## Editorial result

| Public record | Revision | Evidence and boundary |
| --- | --- | --- |
| PROFILE, ABOUT, THEME-2, metadata | Make independent SEM/EDS characterisation visible alongside synthesis, Raman/PL and Python | EB §§7.2.1/7.2.3, applicant confirmation dated 19 October; microscopy remains part of the existing materials research identity |
| ABOUT | Add practical SEM training, student imaging support and demonstrations to two NanoDTC cohorts | EB §8 T4–T6; no formal supervision, facility authority or EDS accreditation inferred |
| PROJECT-CSS | Add ex-situ SEM measurements and analysis of collaborator-acquired operando images | EB §§3.1/7.2.3 and freshly read Chapter 3 contribution paragraph; published paper credit and thesis-specific attribution remain distinct |
| PROJECT-WS2 | Add independent SEM-EDS spectra/maps on NaCl-treated SiO₂/Si controls | EB §§3.2/7.2.3 and freshly read Chapter 4 subsection/caption; control coupon, not the coated growth source; no quantitative composition or phase inference |
| PROJECT-MOS2 | Specify Raman/PL mapping and local layer/optical variation | EB §3.5; no platform, operando acquisition or device development attributed to Hao |
| J2 | Add SEM imaging on charging-prone substrates | EB §3.4 applicant-confirmed support; no quantified improvement or attribution of every SEM image |

Only EB changed among the five declared canonical sources since the last
calibration; the publication list, contribution file, wording supplement and
internal export record retain their previous hashes. The older contribution
file's broad SEM hold is superseded only for the precise thesis/applicant-supported
activities above. J1's published contribution text remains unchanged.

The overview still uses PhD researcher and thesis submitted 30 September 2026.
The generic position label does not establish an awarded degree; the explicit
milestone record still lacks a confirmed viva/award. S1 remains under review and
P1 in preparation. Keep the public P1 topic description instead of promoting its
provisional title/authors. No unpublished quantitative results are added.

Detailed instrument settings, feature-size claims, shared maintenance, formal
access arrangements, examiner information and expanded photonic mechanisms are
not needed for this concise public revision. Existing confidentiality and
correction-related holds remain. The internal CV export is not used.

## Verification

| Acceptance | Command / actual check | Result / evidence |
| --- | --- | --- |
| W01-A–D | Read all five sources, compare fingerprints, review each changed claim and inspect relevant thesis passages | PASS; source hashes and exact public before/after wording in checks JSON; private originals remain outside repository |
| W02-C/D, W03-A/C, W04-C/E | Editorial cross-check of status, contribution boundaries, methods and teaching | PASS; decisions above and candidate data |
| W06-A/B | Shared generator; `check_public_cv.py <candidate PDF> <candidate data>`; Poppler rendering and visual inspection | PASS; two pages, selected outputs, privacy, hyperlinks, margins and footer; PDF hash in checks JSON |
| W08-A/D | `workflow-cli.mjs prepare` invokes HTML validator, site checks, navigation regressions and project-path HTTP tests | PASS; 26 public records, 24 anchors, ten-file visitor allowlist, seven navigation regressions |
| W08-B; relevant W07-A/B/D | Existing `browser-qa.mjs` via prepare; inspect screenshots | PASS at 375/768/1440, keyboard menu/Escape/skip link, anchors, reduced motion, no-JS and native 200% zoom; Chrome 155.0.8059.85 |
| W08-E | Final output/source hashes, proposal equality and released-root preservation | PASS; checked after generation, evidence below |
| Contract / coverage | `node --test tests/propagation/contract.test.mjs`; compare proposal field IDs with ownership register | PASS: 15 tests; all 199 fields covered; no shape change |
| W08-C | External destination refresh | NOT RUN; no URLs changed |
| Full W07-C audit | Automated accessibility audit | NOT RUN; historical W07 remains DEFERRED |
| W09-A–C | Publication/live verification | NOT RUN; no release instruction |

The in-app browser bridge failed before connection; the repository's existing
disposable headless browser QA was used. The first local HTTP run failed with
sandbox `EACCES`; rerunning the standard preparation with approved local network
access passed. An early draft added a third CV page containing one honour; the J2
contribution was shortened and the final two-page PDF was checked again. These
early outputs are not the final candidate.

Local evidence (ignored by Git):

- `tmp/candidates/<candidate>/`: immutable data, manifest, review and visitor files.
- `tmp/qa/<candidate>/`: browser JSON, screenshots and crops used for visual review.
- `tmp/pdf-review-2026-10-20/`: both final PDF page renders.

Only `index.html`, the PDF and sitemap change semantically. The workflow also
lists `robots.txt` because of line endings; its content is unchanged. CSS, JS,
portrait, social card, favicon and links are unchanged.

## Resume / release

The tracked proposal contains only public-safe material. Root `content/site.json`
and released visitor files are unchanged. No staging, commit, push, canonical
edit, installed-watcher change or release approval was performed.

Preview the exact candidate:

```text
node scripts/preview.mjs 4173 tmp/candidates/4eb30765381846dcc432ba923fe139623d700d372476e8f0a1c8f7ec51bb373f/visitor
```

The manual review uses a separate private state directory, preserving installed
watcher history. Its local location is recorded in the chat/tool history under
the session's private visualisation workspace as `private-website-review`; never
copy that directory into this repository. For a later release, use the same
source/state roots with README's approve/gate/promote workflow after the user
instructs publication. Inspect current branch/main divergence and refresh
ownership provenance from the proposal during promotion. Any bound input/source
change requires a new candidate and review. Reconcile the installed watcher's
pending state separately if returning future operation to that state root.

## Approved PR preparation

The user's exact instruction, "manual check passed, create PR and approve it",
is recorded privately against the full candidate and target. The workflow gate
rechecked current canonical hashes, runtime, inputs and immutable outputs before
promotion. Root visitor files and `content/site.json` now contain those approved
bytes; the public field register reflects the new provenance.

Remote main `5a83cf1` already includes the P07 work and has the same tree as
the original implementation baseline. The delivery branch is
`content/evidence-refresh-2026-10-20`. PR creation and review are verified after
commit/push; the GitHub review outcome is distinct from local candidate approval.
Canonical sources and the installed watcher remain unchanged. Live verification
is pending a merge/deployment instruction.

Delivery result: [PR #4](https://github.com/barry063/hao-yu-website/pull/4), content
commit `11e7b5a`. Post-promotion HTML/content checks and seven navigation tests,
15 contract tests, exact candidate-byte comparison and staged whitespace checks
passed. GitHub rejected the requested approving review with
`Review Can not approve your own pull request`: the connected account and PR
author are both `barry063`. Local content approval is recorded, but no formal
GitHub approval was submitted. That requires another reviewer account. The PR
remains open; it has not been merged or deployed.
