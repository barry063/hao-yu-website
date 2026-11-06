# November website release — live verification

State: `LIVE_VERIFIED`, verified 6 November 2026 at 18:50 UTC. N01–N04 complete.

The reviewed November website and four-page master-CV derivative are live at
[Hao Yu's website](https://barry063.github.io/hao-yu-website/). The public PDF omits
the mobile number and running “Academic CV” label; email and profile links remain.
The canonical master files were preserved.

[PR #5](https://github.com/barry063/hao-yu-website/pull/5) merged the approved
content commit `c5fa1a33c73c5235bb7cda6441414d22d258fae7` into main as
`b14bb3e7844f31fb7696bab3dd205df4e3e45937` at 18:49:42 UTC. Existing main/root
GitHub Pages hosting was retained. The corresponding
[deployment run](https://github.com/barry063/hao-yu-website/actions/runs/42274214563)
completed successfully.

Candidate: `07902d3ccd18204ded129d68dfd5171c6e6fc056c845e4d22a5a5fdaf59e807b`.
The user's instruction to proceed to the next round supplied release authority
after the completed N02/N03 review. Exact-candidate approval and promotion passed
the source, runtime, input, output and policy checks; an actual rollback snapshot
was preserved and its restoration dry-run passed.

| Acceptance | Check and actual result |
| --- | --- |
| W08-A/B/D/E | Post-promotion `npm run check`: 30 records, 24 anchors and seven navigation tests PASS. Contract tests: 15/15 PASS, including the 232-field ownership register. |
| W06-A/B | Public PDF checker PASS: four pages, exact reviewed bytes, shared facts/statuses, hyperlinks, privacy and bounds. All-page rendering and text/link comparison are recorded in the content review. |
| W09-A, P06-A/B | GitHub confirms merged revision, main/root Pages route and successful matching deployment. Exact approved package was promoted without regeneration. |
| W09-B/C, P06-C | `workflow-cli.mjs verify-live` returned LIVE_VERIFIED. Nine served visitor files plus committed `.nojekyll` and dataset match the candidate; binary comparison exact, text line endings normalised. |
| W09-B/C | Live Chrome 157.0.8103.38 at 375/768/1440 pixels: no horizontal overflow, keyboard, skip link, mobile menu, anchor placement and reduced motion PASS. No-JS navigation and native 200% zoom PASS. Zoomed hero/publications images visually inspected. |
| P06-D | `rollback({dryRun:true})` returned ROLLBACK_CHECKED for the actual previous public-file backup; restoration was not performed. |
| Source/exposure | Five canonical sources and both master files unchanged by hash. Intended staged files/exposure/whitespace checked; private state and canonical documents excluded. |

The verifier rechecked main and the deployment after network/browser checks and
only then advanced the private published baseline. See
[machine-readable checks](2026-11-06-deployment-checks.json) and
[candidate validation](2026-11-06-content-review.md). Local live screenshots are
under `tmp/qa/live-<candidate>/`; private workflow state stays outside Git.

GitHub's connector could read PR information but lacked write permission. The
normal PR creation and merge used the existing Git credential in memory through
GitHub CLI; no new credentials were stored. PR readiness was CLEAN/MERGEABLE with
no pending status checks. The merge specified the expected head and used no admin
bypass.

Full accessibility auditing (W07) and optional P08 remain deferred. Unchanged
external destinations were not rechecked. The installed watcher was not
reconfigured or revalidated. None blocks this content release.

This documentation-only follow-up preserves the approved visitor bytes. Its
subsequent Pages deployment is checked against the same candidate before handoff;
the initial verified content revision and evidence remain recorded above.
