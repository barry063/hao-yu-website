# 17 November bilingual website release

State: `LIVE_VERIFIED`. L01–L07 complete.

Both versions are live: [English](https://barry063.github.io/hao-yu-website/)
and [简体中文](https://barry063.github.io/hao-yu-website/zh/).
English offers only the [English CV](https://barry063.github.io/hao-yu-website/assets/Hao_Yu_CV.pdf);
Chinese offers only the [Chinese CV](https://barry063.github.io/hao-yu-website/assets/Hao_Yu_CV_CN.pdf).
The approved captions and natural Chinese wording are included; both previously
accepted PDFs remain byte-identical.

The user explicitly requested publication after reviewing the revised previews.
[PR #7](https://github.com/barry063/hao-yu-website/pull/7) delivered content commit
`f18428a4f453371b6f414ae533ada1a7b8e7b88c`, merged into main as
`f7ee7371d41115a40a84b2e7c34e3f76f6926469` at 17:30:05 UTC on 17 November.
GitHub reported CLEAN/MERGEABLE; the normal merge was bound to the exact head,
without an admin bypass. The existing main/root Pages route was preserved.
[Pages run 44137660885](https://github.com/barry063/hao-yu-website/actions/runs/44137660885)
completed successfully.

Candidate: `16ed68b83b58b8899e5c618ca6a90e04701a8efbb9f2f08830f12452ce5cf45b`.
The pre-publication gate checked seven canonical sources, 47 build/runtime inputs,
policy, baseline and all thirteen candidate outputs. All matched. The user's
publication decision was recorded verbatim. Promotion copied approved bytes,
without rebuilding, and promoted the matching 420-field ownership register.
Private rollback validation passed; no restoration was performed.

| Acceptance | Actual check and result |
| --- | --- |
| L07-A | Exact-candidate approval/promotion, unchanged source/output fingerprints, public-exposure audit, expected-head merge and existing Pages route PASS. |
| L06-A / L07-A | Post-promotion HTML/content/XML checks PASS for both pages: zero HTML errors/warnings, 31 records and 24 anchors each; seven navigation tests PASS. Full regression suite 90/90 PASS, zero skips. |
| L07-B | Candidate-bound live verification returned LIVE_VERIFIED. All thirteen committed visitor files and dataset match; twelve served files match live, with binary bytes exact and text line endings normalised. The thirteenth file is .nojekyll, verified in the commit. |
| L07-B | Live Chrome 157.0.8103.79: both languages at 375/768/1440 px, visible language choice, keyboard/focus/menu/skip controls, section preservation, refresh/Back/Forward, reduced motion and native 200% zoom PASS. No-JS navigation/switching PASS. Zoomed screenshots visually inspected. |
| L07-B | Actual live CV buttons clicked; downloaded filenames and bytes verified. Both hero/download links per page target only the matching CV. Ordinary page/PDF URLs, without cache-busting, return HTTP200 and match the candidate. |
| L07-C | Master/bilingual checklists and this evidence record updated. Canonical files and installed watcher unchanged; deferred work remains separate. |

English PDF SHA-256: `ba3b75abe31446ab50aa72fb347fb4ca029af308e3a33b801b7906ac420759e9`.
Chinese PDF SHA-256: `4deb8087516d64f9e184f1cfe9d519f5f26bba1e0bcdcc95c9d19399d916846d`.
Both public PDFs were fully reviewed before publication; the live downloads match
those accepted files exactly.

The initial post-promotion suite exposed 31 legacy-fixture failures because
English mutation scenarios inherited frozen Chinese translations and two extra
source entries. Those fixtures now explicitly project English data while keeping
current shared facts. Bilingual coverage remains intact; the full rerun passed
90/90. Production validation and approved content were unchanged by that fix.

The first live-verifier attempt stopped at Node's default 1 MiB subprocess-output
limit while reading the larger Chinese PDF from Git. The live site and browser
PDF downloads already passed. The verifier now reads the committed blob size,
allocates sufficient buffer and checks the returned byte count. A >2 MiB binary
regression plus nine bilingual workflow tests passed (10/10, zero skips), followed
by successful complete live verification. This verification-tool change does not
alter the approved dataset, website or CV bytes; the original candidate remains
the content reference. Git checkout CRLF changes are normalised for text checks.

The GitHub connector could read repository/PR metadata but PR creation returned
HTTP403, Resource not accessible by integration. The existing Git credential was
used in memory through GitHub CLI; it was neither printed nor persisted. Staged
whitespace checks passed except for original trailing spaces in the preserved
upstream font licence. No private canonical evidence or application archives
were committed.

Machine-readable [deployment checks](2026-11-17-bilingual-deployment-checks.json)
retain this initial verified content revision. Screenshots, download evidence and
test logs remain in ignored tmp/qa/2026-11-17-release/; private workflow state is
outside the repository. The documentation and verification-tool follow-up preserves
approved visitor bytes; its deployment is reverified before handoff.

Full accessibility auditing (W07), optional P08, external indexing/profile work
(U06) and installed watcher migration remain deferred or separately scoped. No
remaining dependency blocks this bilingual release. The watcher still covers its
five original sources; the manual bilingual workflow covers seven.
