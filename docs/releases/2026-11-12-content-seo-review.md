# Content, search metadata and public CV — review candidate

12 November 2026. U02–U04 DONE. Local milestone: **READY_TO_PUBLISH**;
workflow state: **READY_FOR_REVIEW**. The user requested the result before
publishing. No approval, promotion, commit, push or deployment has occurred.

Candidate: `105d7ba1740d9c325aa8f5e55675792271282bd13b53a1534c0fb7747197bc83`.
Branch: `content/evidence-seo-refresh-2026-11-12`; baseline `d0d2ddd`.
The earlier planning edits were preserved. The released root dataset, ownership
register and visitor files remain the 6 November release.

## Result

- Added S2, the imaging spectroscopic ellipsometry tutorial, in a separate
  Submitted group. Its target journal and bounded sample/recipe/Raman-workflow
  contribution are visible. There are still four published research articles;
  S1 remains under review and P1 in preparation.
- Replaced the photonics card's generic final sentence with personally performed
  fibre-to-chip alignment and polarisation optimisation. Published J3 attribution
  and the associated correction link remain separate.
- Updated the generated title, OG title and Twitter title to
  `Hao Yu | Materials Growth & Spectroscopy | Cambridge`.
- Generated ProfilePage JSON-LD with Person under mainEntity, stable page/person
  IDs and checked identity/role/canonical fields. Added the verified Cambridge
  personal profile to the visible links, sameAs and public CV.
- Refreshed the public CV and sitemap content date to 12 November. The visible
  H1, design, five project cards, static stack and project-relative assets remain.

Qualification wording remains PhD researcher with thesis submitted
30 September 2026. The update makes no degree-award, new journal-decision,
independent ellipsometry-operation or tutorial-leadership claim.

## Public CV

The reviewed four-page asset is
[`build-resources/public-cv/2026-11-12/Hao_Yu_CV.pdf`](../../build-resources/public-cv/2026-11-12/Hao_Yu_CV.pdf).
SHA-256: `01ffd1e6bd5bb189ed975cad8e9144ba4dae6f5ab3443a15fb86ed2b5cb509b5`.
Its 95,352 bytes are copied exactly into the candidate download.

Changes from the current master: remove the mobile number and running Academic
CV label; use neutral PDF title metadata; remove private manuscript references;
abbreviate the newly added S2 author list; add the Cambridge profile hyperlink
and the bounded Oxford alignment/polarisation sentence. Other master content,
including previously selected material, is retained. Extracted text matches the
master after these documented edits; all original hyperlinks are preserved.

Two LaTeX passes produced four pages without final warnings. Both the PDF agent
and integrating agent inspected all four rendered pages: no clipping, overlap or
missing glyphs. Text, hyperlink, privacy, status and page-bound checks passed.
Raw source/TeX/logs and primary evidence remain in the private review workspace;
only the sanitised public PDF enters this repository. Original canonical files
and both earlier public PDFs are unchanged.

## Implementation and provenance

The [proposal](../../content/proposals/2026-11-12.json) and
[field register](../../content/proposals/2026-11-12-field-ownership.json)
cover 242 fields and 31 rendered records. Five current canonical source hashes
and original master/export hashes are recorded in the
[checks JSON](2026-11-12-content-seo-review-checks.json).

The adapter recognises the exact documented Submitted Tutorial label and
Submitted tutorial heading. EB §3.9 now participates in editorial-change
detection. New tests preserve status-conflict, duplicate and clearance refusal.

The public-CV path contract permits a constrained dated asset directory. All
dated public PDFs are included in workflow input hashes, with existing path and
realpath checks retained. This preserves historical proposal/PDF pairs while
binding the new PDF to the final candidate. Its source/export and shared-fact
hashes were refreshed after the four-page review; no integrity gate was bypassed.

Nested-Person, title parity, escaping, status and privacy checks were updated.
Synthetic generated-PDF tests now have an explicit synthetic published baseline;
reviewed-PDF tests continue to exercise frozen-byte and shared-fact protection.
The migration test separately checks the actual released-baseline requirement.

## Verification

| Acceptance / check | Actual result |
| --- | --- |
| W01-A–D, W02-C/D, W04-C/E | PASS: refreshed source hashes, exact public wording, evidence/visibility review, distinct statuses and 242-field ownership coverage |
| U03 metadata | PASS: generated title/OG/Twitter parity, ProfilePage/Person IDs, role/name/canonical/sameAs identity, escaping, visible Cambridge link |
| W06-A/B | PASS: four-page public CV, all-page visual review, source/export/shared-fact bindings, text/links/privacy/bounds and exact copied bytes |
| W08-A/D and P05-D | PASS: 31 records, 24 HTML IDs, valid HTML, ten-file visitor allowlist, project-path HTTP byte equality and non-visitor 404s |
| W08-B and P05-D | PASS: Chrome 157.0.8103.51 at 375/768/1440 px, keyboard/skip/menu/anchors, reduced motion, no JS and native 200% zoom with no horizontal overflow |
| Visual inspection | PASS: desktop/mobile hero and submitted tutorial, photonics card and native-zoom publications; all four CV pages |
| Full propagation suite | PASS: 68/68, zero skips; final log in `tmp/qa/2026-11-12/propagation-verified.log` |
| Released-root checks | PASS: HTML/content and seven navigation tests; released files remain unchanged |
| Determinism / preview parity | PASS: all ten final candidate files are byte-identical to the independently built local preview; the CV equals the reviewed asset |
| Candidate integrity | PASS: exact source/runtime/input/asset/policy/published-baseline bindings checked with `requireApproval:false`; no approval recorded |
| Preservation / public exposure | PASS: five canonical source and two master hashes unchanged; released root dataset/register/visitor files and previous PDF unchanged; no actual private manuscript references in changed public files |
| W08-E | PASS: this report, machine-readable checks, task states and remaining dependencies recorded |

The final preparation ran HTML/HTTP, PDF and browser checks again against its own
isolated visitor directory. It returned READY_FOR_REVIEW with 13 semantic field
changes. Screenshot evidence is under `tmp/qa/<candidate>/`; focused preview
captures are under `tmp/qa/2026-11-12/preview/`.

Commands used with the pinned runtime:

```text
npm run check
npm run test:propagation
node scripts/build-site.mjs --data content/proposals/2026-11-12.json --out tmp/candidates/nov12-preview-1
node scripts/check-candidate.mjs tmp/candidates/nov12-preview-1 content/proposals/2026-11-12.json
<pinned-python> scripts/check_public_cv.py build-resources/public-cv/2026-11-12/Hao_Yu_CV.pdf content/proposals/2026-11-12.json
node scripts/workflow-cli.mjs calibrate --source-root <canonical-root> --state-root <private-review-state> --data content/proposals/2026-11-12.json
node scripts/workflow-cli.mjs prepare --source-root <canonical-root> --state-root <private-review-state> --release-date 2026-11-12
git diff --check
```

## Environment and resolved failures

The Browser plugin could not establish its native bridge. After that attempt,
the existing repository's isolated Chromium/Playwright QA supplied browser
verification. The working preview is local, with no hosted deployment.

Initial sandbox suite: 59/66 passed. Three filesystem operations were restricted;
four synthetic scenarios incorrectly retained a frozen master PDF. A second run
after fixture separation passed 63/67: the migration fixture needed the real
released baseline, and the fallback PDF checker incorrectly treated ordinary
lowercase “verify” prose as a review marker. These issues were corrected without
weakening production gates. A new actual-PDF test accepts normal prose and rejects
explicit markers plus both manuscript-reference formats. Final suite: 68/68 PASS.

Runtime: Node version recorded in checks JSON, Python 3.12.14, ReportLab 4.4.9,
Pillow 12.3.0 and pdfplumber 0.11.9. Reused existing pinned packages; no runtime
installation was changed. Browser/filesystem checks ran with the required local
permissions after sandbox limitations were observed.

## External checks and remaining work

The [Cambridge profile](https://www.eng.cam.ac.uk/profiles/hy377) returned HTTP 200
with matching name/email. It did not contain the exact canonical homepage URL.
Host-root robots returned HTTP 404; Google treats that response as no robots
restrictions, which does not prove indexing. The project-subdirectory robots
file is not the host's effective policy. See
[Google's documented HTTP handling](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec#http-status-codes).

Search Console/Google-selected canonical, external Rich Results Test, unchanged
external destinations, full accessibility audit W07, account/profile edits,
institutional outreach and live deployment verification are NOT RUN. No Search
Console token was invented. Optional P08 and the full W07 audit remain deferred.
The installed watcher was not reconfigured or revalidated against these code
changes; its history is separate from this manual review state.

U05 remains NOT_STARTED pending user review and a release instruction. U06 is
IN_PROGRESS for public checks; Search Console property access/verification and
authorised external-profile work remain. Neither dependency blocks this local
candidate. Keep READY_TO_PUBLISH separate from LIVE_VERIFIED.

## Review and continuation

The local preview at `http://localhost:4173/hao-yu-website/` serves
`tmp/candidates/nov12-preview-1`, whose ten visitor hashes match the final package.
The final package can instead be served with:

```text
node scripts/preview.mjs 4173 tmp/candidates/105d7ba1740d9c325aa8f5e55675792271282bd13b53a1534c0fb7747197bc83/visitor
```

Resume using this chat's private `private-website-review/operator-runtime.json`
record and exact candidate. Recheck bindings before any approval/promotion;
source, code, policy or asset changes require a new candidate. When publication
is instructed, promote the matching proposal field register with the dataset.
