# Hao Yu — Academic website

Website: [barry063.github.io/hao-yu-website](https://barry063.github.io/hao-yu-website/).

A static academic portfolio covering low-dimensional materials growth, spectroscopy,
research software, publications and professional experience. HTML/CSS/JavaScript
is served directly from the repository root by GitHub Pages.

## Update plan and evidence

Start with [AGENTS.md](AGENTS.md) and the [website update plan](docs/WEBSITE_UPDATE_PLAN.md).
The plan records numbered tasks, acceptance criteria, dependencies and progress.
[One-edit propagation plan](docs/CONTENT_PROPAGATION_PLAN.md) defines the next
phase: canonical edit → public-safe candidate → your review → approved release.
It records P01–P08 and verifiable targets. P01/P02 now provide a local public-data
contract and candidate generator; canonical preparation and approval gates await
P03–P05. It is not standing permission to publish.
[Public content decisions](docs/CONTENT_DECISIONS.md) records reconciliations and
omissions. [Release reports](docs/releases/) record actual verification results.

`content/site.json` version 2 is the reviewed public dataset. Its source references point into
the separate canonical CV workspace; the private evidence files are not copied
into this repository. Every published record has a source, evidence status and
review date. [The source map](docs/CONTENT_SOURCE_MAP.md) documents typed shared
facts, authored prose, field coverage and exclusions. The generator uses this
dataset and `templates/index.html`; root visitor files remain the released snapshot
until a specifically authorised promotion. Do not hand-edit generated candidates.

## Local checks and preview

Node.js 22 or later is required for development checks, not for visitors or hosting.

```powershell
npm ci --ignore-scripts
npm run check
npm run preview
```

Open [the project-path preview](http://localhost:8080/hao-yu-website/).
The preview also works at the server root and serves only public website files.

`npm run check` validates HTML and checks claim provenance, exact rendered wording,
fragment targets, assets, metadata, output counts and image dimensions, and runs
seven navigation behaviour regressions. Those regressions do not replace browser
inspection of focus, responsive layout or accessibility.
`npm run check:links` checks public destinations; bot blocking and network errors
are reported as inconclusive.

The candidate generator requires Python 3.12 with the exact packages in
`requirements-build.txt`: ReportLab 4.4.9, Pillow 12.3.0 and pdfplumber 0.11.9.
The tested bundled runtime is Python 3.12.14. It uses licensed, SHA-256-pinned
Vera fonts in `build-resources/fonts/`, invariant PDF metadata and an explicit
`release_date` in the dataset. JavaScript check dependencies are pinned in the
lockfile. No canonical workspace, credentials or network access is needed to build.

```powershell
$env:SITE_PYTHON = 'python'  # or the existing bundled Python executable
npm run build -- --out tmp/candidates/my-review
npm run test:propagation
npm run check:candidate -- tmp/candidates/my-review
& $env:SITE_PYTHON scripts/check_public_cv.py tmp/candidates/my-review/assets/Hao_Yu_CV.pdf
node scripts/preview.mjs 8080 tmp/candidates/my-review
```

Use a new empty child of `tmp/candidates/` for each build. The command refuses
root/asset paths, nonempty output and symlinks. It emits only ten allowlisted
visitor files, with hashes on stdout; planning docs, datasets and scripts are
excluded. A failed candidate carries a failure marker and fails validation.
It does not approve, stage, commit, publish, watch sources or change the master CV.

Render and inspect the PDF using `pdftoppm`; run the browser review on the isolated
candidate. `scripts/review-candidate.mjs` optionally uses an existing Playwright
module and a fresh headless browser (`SITE_PLAYWRIGHT_MODULE` and
`SITE_BROWSER_EXECUTABLE`), compares against the released root page, and saves
public-only captures under ignored `tmp/p02-review/`. It is baseline parity QA,
not an accessibility certification or approval action. Record unavailable checks
as NOT RUN. The unchanged social card is copied after hash verification; changed
displayed fields generate a deterministic card and require visual review.
`scripts/prepare_assets.ps1` is the older manual asset helper; it writes root
assets and is not part of candidate preparation. The original photograph remains
available in `assets/hao-yu.jpg`.

## Routine content updates

1. Recheck the current canonical evidence and its verification holds.
2. Until P03 exists, reconcile changes into reviewed `content/site.json`, preserving
   stable IDs and provenance. Refresh `schemas/field-ownership.json` when fields
   change. Authored scientific prose needs editorial review; source disagreement
   stops the affected proposal. Keep thesis submission, viva and award separate.
3. Build an isolated candidate with the command above; HTML, CV and metadata share
   the dataset. Do not edit root visitor files during preparation.
4. Run checks, inspect the browser at mobile/tablet/desktop widths, and exercise
   keyboard navigation and reduced motion.
5. Record source hashes, asset hashes, actual results and remaining issues in
   `docs/releases/`; update the plan tracker.
6. Stop for review. P04's immutable candidate/approval gate and P06's publication
   checks are not implemented. Publishing still needs explicit current authority
   and a reviewed exact set of files; local build success is not release readiness.

Trigger a review after a PhD milestone, manuscript decision, new publication,
software release, changed affiliation/contact details or completed experience.
The review date is a historical timestamp, not a promise of continuously current
publication or qualification status.

## Publishing with GitHub Pages

Use the existing repository's Pages configuration. For branch-based hosting,
select `main` and `/ (root)`. Relative assets support the
`/hao-yu-website/` project prefix. `.nojekyll` keeps the checked-in website files
served as static assets. No production build is required.

Before pushing, check the public content inventory and release report. Local
verification does not establish that the deployed site has changed. Record the
deployed commit and verify the live page, assets, canonical metadata and CV hash.

`node scripts/check-live.mjs` compares the live visitor files with the local release
(exact bytes for PDF/images; normalised line endings for text).
`node scripts/github-pages-status.mjs` reads Pages settings and workflow status
using the configured Git credential helper without logging credentials.

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | Static page structure and visitor content |
| `styles.css` | Responsive layout, typography and focus styles |
| `script.js` | Progressive navigation and scrolling enhancements |
| `content/site.json` | Typed reviewed public dataset and canonical fingerprints |
| `schemas/`, `docs/CONTENT_SOURCE_MAP.md` | Public boundary and field ownership |
| `templates/`, `build-resources/` | Candidate layout, licensed fonts and card baseline |
| `tests/propagation/`, `tests/fixtures/propagation/` | Contract, privacy and generator regressions |
| `assets/` | Public CV, portrait, social card and original portrait |
| `scripts/` | Validation, preview, link checking, CV and asset preparation |
| `docs/` | Plan, content decisions and release evidence |
| `sitemap.xml`, `robots.txt` | Discoverability metadata |

## Licence and acknowledgements

Site code is released under the [MIT licence](LICENSE). Biographical and research
text remains the author's. The earlier layout originated from
[hao-yu-academic-site](https://github.com/Mirainthehub/hao-yu-academic-site).
Fonts: Inter and Source Serif 4 via Google Fonts; CV/build card fonts are Bitstream
Vera under [its bundled licence](build-resources/fonts/LICENSE.txt).
