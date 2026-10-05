# Publication record — 5 October 2026

State: LIVE_CONTENT_VERIFIED_BROWSER_QA_DEFERRED.

## Authority and scope

The user confirmed opening the browser preview, then explicitly requested:
"let's first publish the new changes for today" and left the one-edit propagation
workflow for later. This authorises committing/pushing the prepared static-site
release to the existing public GitHub Pages repository.

The user-reviewed preview and passing local checks satisfy today's release gate.
The detailed automated viewport/accessibility matrix remains deferred. No such
automated browser check is represented as passing.

## Hosting inspected

- Repository: `barry063/hao-yu-website`, public; default branch `main`.
- GitHub Pages: legacy branch deployment; source `main`, path `/`.
- Site URL: `https://barry063.github.io/hao-yu-website/`.
- Remote starting revision: `2c3ba490813828fdf9498b43620f02d4fa0b8371`.
- Local and origin/main matched before publication; no merge was needed.
- Added `.nojekyll` to serve checked-in static files directly.

## Pre-publication checks

- PASS: HTML validation, public inventory, 24 anchors, seven navigation regressions.
- PASS: self-contained local HTTP checks under the GitHub Pages project prefix.
- PASS: public CV validation; earlier two-page visual review remains applicable.
- PASS: canonical source fingerprints still match the reviewed records.
- PASS: whitespace check and public-file inventory inspection.
- Public CV, portrait and OG fingerprints are in the release-1 preparation report.
- Browser runtime connection still unavailable; user preview confirmation retained.

## Deployment evidence

- W09-A — PASS: release commit `4537e5ed41f61f95ea45ea5d76a6f3d6e220b760`
  pushed to `origin/main`. GitHub Pages workflow
  [37323277704](https://github.com/barry063/hao-yu-website/actions/runs/37323277704)
  completed successfully at 14:16:25 UTC on 5 October 2026.
- Final URL: https://barry063.github.io/hao-yu-website/.
- W09-B — PASS within the amended HTTP verification scope: `node
  scripts/check-live.mjs` at 14:16:36.090 UTC (15:16 BST) returned HTTP 200 and
  matching release content for all nine visitor files below. Text comparison
  normalises line endings; PDF/images are byte-identical. The local content checks
  cover profile links and canonical metadata, and the identical live HTML retains
  those checked values. External anti-bot responses remain INCONCLUSIVE as recorded
  in the preparation report.
- W09-C — PASS within the release-specific amendment: successful deployed revision
  plus live-file equality recorded here. Detailed live browser navigation,
  viewport, zoom and accessibility audit: NOT RUN / DEFERRED, not PASS.

| Live file | HTTP | Release match |
| --- | --- | --- |
| `index.html` | 200 | PASS |
| `styles.css` | 200 | PASS |
| `script.js` | 200 | PASS |
| `favicon.svg` | 200 | PASS |
| `robots.txt` | 200 | PASS |
| `sitemap.xml` | 200 | PASS |
| `assets/Hao_Yu_CV.pdf` | 200 | PASS, byte-identical |
| `assets/hao-yu-portrait.jpg` | 200 | PASS, byte-identical |
| `assets/og-image.png` | 200 | PASS, byte-identical |

Live public CV SHA-256:
`7d800400754ba18f2ed2f8c04b00d852c9ee835133502ba3f3da5df4dc5fc7e5`.

A documentation-only follow-up records this evidence in the plan and reports;
it does not change the verified visitor files. W10/W11 remain deferred at the
user's request, pending discussion of the one-edit propagation workflow.

The repository includes read-only helpers `scripts/github-pages-status.mjs` and
`scripts/check-live.mjs`. The former uses the configured Git credential helper in
memory and logs only repository settings/status. The latter compares nine visitor
files, with exact bytes for PDF/images and normalised line endings for text.
