# Hao Yu — Academic website

Website: [barry063.github.io/hao-yu-website](https://barry063.github.io/hao-yu-website/).

A static academic portfolio covering low-dimensional materials growth, spectroscopy,
research software, publications and professional experience. HTML/CSS/JavaScript
is served directly from the repository root by GitHub Pages.

## Update plan and evidence

Start with [AGENTS.md](AGENTS.md) and the [website update plan](docs/WEBSITE_UPDATE_PLAN.md).
The plan records numbered tasks, acceptance criteria, dependencies and progress.
[Public content decisions](docs/CONTENT_DECISIONS.md) records reconciliations and
omissions. [Release reports](docs/releases/) record actual verification results.

`content/site.json` is the public claim inventory. Its source references point into
the separate canonical CV workspace; the private evidence files are not copied
into this repository. Every published record has a source, evidence status and
review date. This first refresh keeps HTML editable directly; a repeatable HTML
generator is planned as the next phase.

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

The public CV builder requires Python with `reportlab`; its check additionally uses
`pdfplumber`. These are included in the Codex bundled Python runtime.

```powershell
python scripts/build_public_cv.py
python scripts/check_public_cv.py
```

After rebuilding the CV, render and visually inspect both pages, then update its
source/PDF hashes in the release report. The builder reads public records only.
It does not modify the master CV or publish an internal review export.

On Windows, `scripts/prepare_assets.ps1` resizes the original portrait into the
public portrait and draws the social card. Inspect both assets after regenerating.
The original portrait remains available in `assets/hao-yu.jpg`.

## Routine content updates

1. Recheck the current canonical evidence and its verification holds.
2. Update public records in `content/site.json` and corresponding `index.html`
   wording. Keep thesis submission, viva and degree award separate.
3. Rebuild the public CV if the affected facts appear there.
4. Run checks, inspect the browser at mobile/tablet/desktop widths, and exercise
   keyboard navigation and reduced motion.
5. Record source hashes, asset hashes, actual results and remaining issues in
   `docs/releases/`; update the plan tracker.
6. Publish when authorised, then verify the deployed revision and CV.

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
| `content/site.json` | Public claim inventory and canonical source fingerprints |
| `assets/` | Public CV, portrait, social card and original portrait |
| `scripts/` | Validation, preview, link checking, CV and asset preparation |
| `docs/` | Plan, content decisions and release evidence |
| `sitemap.xml`, `robots.txt` | Discoverability metadata |

## Licence and acknowledgements

Site code is released under the [MIT licence](LICENSE). Biographical and research
text remains the author's. The earlier layout originated from
[hao-yu-academic-site](https://github.com/Mirainthehub/hao-yu-academic-site).
Fonts: Inter and Source Serif 4 via Google Fonts.
