# Publication record — 5 October 2026

State: PUBLICATION_IN_PROGRESS.

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

Pending: push revision, successful Pages workflow, live text/asset comparison and
public CV SHA-256. These fields will be filled after the actual deployment.

The repository includes read-only helpers `scripts/github-pages-status.mjs` and
`scripts/check-live.mjs`. The former uses the configured Git credential helper in
memory and logs only repository settings/status. The latter compares nine visitor
files, with exact bytes for PDF/images and normalised line endings for text.
