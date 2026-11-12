# 12 November website and CV release

State: `LIVE_VERIFIED`. U01–U05 complete; U06 remains a separate indexing and
external-profile task.

The reviewed content, Cambridge title/ProfilePage metadata and refreshed four-page
CV are live at [Hao Yu's website](https://barry063.github.io/hao-yu-website/).
The [public CV](https://barry063.github.io/hao-yu-website/assets/Hao_Yu_CV.pdf)
matches the approved PDF exactly. Canonical evidence and master files are unchanged.

The user explicitly approved publication after reviewing the local result.
[PR #6](https://github.com/barry063/hao-yu-website/pull/6) delivered content commit
`5f53acfc7d546d8153b9920b202c93d397c0dfc7`, normally merged into main as
`159f8509cfdfc6a1e5afaa3d00dad87af9bf6ea7` on 12 November 2026 at 18:25:44 UTC.
GitHub reported CLEAN/MERGEABLE with no pending checks; merge used the exact
expected head without an admin bypass. Existing main/root Pages hosting was
retained. [Pages run 43279729491](https://github.com/barry063/hao-yu-website/actions/runs/43279729491)
completed successfully.

Candidate: `105d7ba1740d9c325aa8f5e55675792271282bd13b53a1534c0fb7747197bc83`.
Fresh source/runtime/input/policy/baseline checks passed at approval and immediately
before promotion. Existing candidate bytes and the matching field register were
promoted without rebuilding. A private previous-release backup was retained.

| Acceptance | Actual check and result |
| --- | --- |
| W08-A/B/D/E | Post-promotion `npm run check`: 31 public records, 24 anchors and seven navigation tests PASS. `npm run test:propagation`: 68/68 PASS, zero skips. Field ownership: 242/242 PASS. |
| W06-A/B | Public CV verification PASS: four pages, exact reviewed bytes, shared facts/statuses, links, privacy and bounds. All-page rendering, text and link checks are recorded in the candidate review. Live PDF SHA-256: `01ffd1e6bd5bb189ed975cad8e9144ba4dae6f5ab3443a15fb86ed2b5cb509b5`. |
| W09-A, P06-A/B | Merged main revision, existing hosting route and successful matching Pages deployment verified through GitHub. |
| W09-B/C, P06-C | `workflow-cli.mjs verify-live` returned LIVE_VERIFIED. Nine served visitor files plus committed `.nojekyll` and public dataset match the approved package; binaries compared exactly, text line endings normalised. This covers content, canonical, social metadata, ProfilePage/Person markup, sitemap and CV. |
| W09-B/C | Live Chrome 157.0.8103.51 at 375/768/1440 pixels: no horizontal overflow, keyboard/skip link/mobile menu, anchor placement and reduced motion PASS. No-JS navigation and native 200% zoom PASS. Zoomed hero/publications screenshots visually inspected. |
| P06-D | `workflow-cli.mjs rollback` dry-run returned ROLLBACK_CHECKED for backup `1871da04401b1a5f362543dd18c87e9199bcdcf2e2146c4e37baf517ad8e9789`. No restoration performed. |
| Source and public exposure | Five canonical source and both master hashes unchanged. Independent changed-file exposure audit and staged whitespace check PASS; no private source documents, phone, manuscript references or workflow state added. |

The live verifier rechecked main and deployment after browser/network checks and
advanced the private published baseline only after success. Machine-readable
[deployment checks](2026-11-12-deployment-checks.json) retain the initial verified
revision. The [candidate review](2026-11-12-content-seo-review.md) is the historical
pre-publication checkpoint. Browser screenshots and regression logs remain in
ignored `tmp/qa/`; private workflow state remains outside the repository.
Ordinary homepage and public CV URLs were also fetched without cache-busting
query strings: both returned HTTP200 and matched the candidate (evidence:
`tmp/qa/2026-11-12/live-direct.json`).

The GitHub connector could read repository and PR information but PR creation
returned HTTP 403, “Resource not accessible by integration”. Publication used the
existing Git credential in memory through GitHub CLI. No credential was printed
or persisted. GitHub's managed Pages job reported platform migration/deprecation
annotations but build, deployment and live checks passed.

Search Console indexing/Google-selected canonical, external profile edits/outreach
and external Rich Results Test were NOT RUN. U06 requires the relevant account or
editor access; the website deployment does not establish indexing or ranking.
Full accessibility auditing (W07) and optional P08 remain DEFERRED. The installed
watcher was not reconfigured or revalidated. None blocks this content release.

This documentation-only follow-up preserves the approved visitor bytes. Its Pages
deployment is verified against the same candidate before handoff; the initial
verified content revision above remains the durable release evidence.
