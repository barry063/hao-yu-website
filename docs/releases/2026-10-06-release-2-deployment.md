# Release 2 — approved generator release

Date: 6 October 2026. State: `PROMOTED_LOCALLY`; live verification pending.

Candidate: `a43d917ca7f32dd605a2d4dcd60bad40db468d42078828f015a8d94306265e48`.
Target: `https://barry063.github.io/hao-yu-website/`.
Implementation branch: `implementation/p03-p06`, based on `fc335e5`.

The user clarified that the preceding request to publish was an instruction to
push/create a PR and release the candidate already discussed. That current
instruction is recorded verbatim in private approval state against the full
candidate ID and target. The operator did not create independent draft approval
or require the user to repeat the candidate hash. Existing main/root GitHub Pages
hosting is retained; no watcher, new credentials or canonical edits are included.

The immutable candidate promotes the generator output dated 6 October 2026.
Public factual semantics are unchanged from the reviewed baseline. The website
CV label, public PDF footer and sitemap carry the new release date. The ten
visitor files and `content/site.json` were copied from the approved package,
without rebuilding or editing their generated content.

## Acceptance evidence

| Criterion | Actual result and evidence |
| --- | --- |
| P06-A | PASS. GitHub Pages reinspected immediately before release: legacy build, `main`, `/`, expected target. Previous run `37338747444` successfully deployed `fc335e5`; it is not evidence for this candidate. |
| P06-B | PASS locally. Exact current sources, generator/runtime/configuration, policy, baseline and outputs checked before approval; approved gate passed; promotion gated again before writing. `PROMOTED_LOCALLY` returned for this candidate. Commit/push/PR/deployment pending. |
| P06-C | NOT RUN at this checkpoint. Run the candidate-bound `verify-live` command against the exact merged commit after a successful Pages deployment. Do not infer live success from promotion or PR creation. |
| P06-D | PASS locally. Promotion saved previous-release backup `02be734738b6f3ef62a55725c5b5ada5fbd2f3a253ccafee1579b6f78e95d034`; actual rollback dry-run returned `ROLLBACK_CHECKED`. Remote rollback NOT RUN because no restoration is needed. |

Pre-release regression rerun: `npm run test:propagation` — 31 PASS, zero failures
or skips. Existing candidate visual/PDF/browser evidence remains in
`2026-10-06-p03-p06.md` and its machine record. A full accessibility audit remains
NOT RUN; external link restrictions remain INCONCLUSIVE as recorded there.
After promotion, `npm run check` passed HTML validation, 26-record content and
metadata checks, and all seven navigation regressions. All ten promoted visitor
files and the dataset match the approved hashes. All five canonical source
fingerprints match the approved manifest: unchanged. `git diff --check` passed.
Private approvals/backups/source snapshots stay
outside this repository and are excluded from the commit.

## Publication and live result

PR, merged commit, deployment run, live artifact/browser results and completion
time will be recorded here after actual deployment verification.

## Restoration

Select the exact rollback ID above using `workflow rollback` with the same local
roots. The default dry-run validates the previous release. With explicit
restoration authority, add `--authorise-restoration`, review the restored files,
and create a new commit/push through the existing release route. Never rewrite
public history. Verify the restoration's actual deployment before recording it
as live. The current release preserves that private rollback selection.
