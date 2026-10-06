# Release 2 — approved generator release

Date: 6 October 2026. State: `LIVE_VERIFIED`.

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
| P06-A | PASS. GitHub Pages reinspected before release and twice during live verification: legacy build, `main`, `/`, expected target. The clarified publication instruction supplies current release authority. |
| P06-B | PASS. Exact current sources, generator/runtime/configuration, policy, baseline and outputs checked before approval; approved gate passed; promotion gated again before writing. Promoted and committed visitor files/dataset match the immutable candidate (text line endings normalised for Git comparison). Release committed/pushed and merged through PR #2. |
| P06-C | PASS. Candidate-bound `verify-live` checked exact main commit `05f18e2289cb9d0b41698c47fa28dab3fb7c7a58`, successful Pages run `37454512658`, committed dataset and all ten visitor files; nine served files match over HTTP, including PDF binary SHA-256. `.nojekyll` is checked in Git. Live Chrome keyboard, responsive layout, reduced-motion, no-JS and native 200% zoom checks pass. Deployment rechecked after browser work; verifier returned `LIVE_VERIFIED`. |
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

- Implementation commit: `f92e0817a5c158c1cf5e6fa71368073537502223`.
- [PR #2](https://github.com/barry063/hao-yu-website/pull/2) merged at
  11:09:14 UTC on 6 October 2026.
- Merged release: `05f18e2289cb9d0b41698c47fa28dab3fb7c7a58`.
- [Pages deployment 37454512658](https://github.com/barry063/hao-yu-website/actions/runs/37454512658): completed successfully.
- Verification recorded at 11:11:18 UTC. Command: `workflow verify-live` with the
  exact full candidate ID, target, merged commit and existing local roots.
- Browser: Chrome 154.0.8037.93, at 375/768/1440 CSS pixels and native 200% zoom
  (physical width 1440, inner width 712, DPR 2, CSS zoom 1). Keyboard/menu/Escape,
  skip/section focus, reduced motion, no-JS anchors and zoomed targets pass.
- Live screenshots visually inspected at mobile/desktop widths and zoomed
  publications; no clipping or overlap observed. Captures remain ignored under
  `tmp/qa/live-<candidate-id>/`.
- PDF SHA-256: `5ec21a59255085d07ae385f514a1ec1facd9ed7a7ebdbd38c969884a5bfe2bee`.
  The live PDF matches the approved, previously rendered and inspected two-page
  public CV. Website and CV update labels are 6 October 2026.
- Additional fresh HTTP download and PDF text extraction confirm both website
  date labels and both PDF page footers say 6 October 2026 (two pages, 2/2 PASS).
- Public machine evidence: `2026-10-06-release-2-deployment-checks.json`, with
  all output/source hashes and actual browser/file results. Private published
  baseline advanced only after complete verification.

W11-A/B/C and P06-A/B/C/D are complete. P01–P06 are DONE; P07/P08 remain
DEFERRED. W07's full accessibility audit and restricted external destinations
remain documented follow-ups, not claimed passing checks. The evidence-recording
commit changes documentation only and preserves the approved visitor artifacts;
verify that subsequent main deployment before the final handoff.

## Restoration

Select the exact rollback ID above using `workflow rollback` with the same local
roots. The default dry-run validates the previous release. With explicit
restoration authority, add `--authorise-restoration`, review the restored files,
and create a new commit/push through the existing release route. Never rewrite
public history. Verify the restoration's actual deployment before recording it
as live. The current release preserves that private rollback selection.
