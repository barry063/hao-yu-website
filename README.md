# Hao Yu — Academic Website

Static, single-page academic portfolio for GitHub Pages (or any static host). Content is grounded in the provided CV only.

## Local preview

From this directory:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080` in a browser.

## Before publishing

1. **CV PDF** — Add your latest CV as `assets/Hao_Yu_CV.pdf`. The download button in the **CV** section points to this path.
2. **Headshot** — Replace the placeholder in `index.html` (search for `Headshot:` in comments) with an `<img>` pointing to your photo (for example `assets/hao-yu.jpg`).
3. **External links** — Set real URLs for LinkedIn and Google Scholar in the hero link row (marked with `TODO` comments in `index.html`).
4. **Favicon** — Optionally replace `favicon.svg` with your own icon.

## Deploy on GitHub Pages

### Option A — Project site (`username.github.io/repo-name`)

1. Push this folder (or the whole repository) to a GitHub repository.
2. In the repository on GitHub: **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose the branch and folder:
   - **Root**: if these files sit at the repository root, select `/ (root)`.
   - **Subfolder**: if you keep the site under `hao-yu-academic-site/`, either move the contents to root or set the publishing folder to `/hao-yu-academic-site` when GitHub allows subfolder publishing (or use a branch that only contains the site at root).
5. Save. The site will be available at `https://<user>.github.io/<repo>/` (paths to CSS/JS are relative, so they resolve correctly under a subpath).

### Option B — User/org site (`username.github.io`)

1. Create a repository named `<username>.github.io`.
2. Place `index.html`, `styles.css`, `script.js`, `favicon.svg`, and `assets/` at the **root** of that repository (or publish from `/docs` with the same file layout).
3. Enable Pages from the default branch (`main`/`master`) and `/ (root)` or `/docs` as appropriate.

### Custom domain (optional)

In **Pages** settings, add your domain and follow GitHub’s DNS instructions. No change is required to relative asset paths if the site is deployed at the domain root.

## File layout

| File | Purpose |
|------|---------|
| `index.html` | Single-page site (sections + semantics + placeholders) |
| `styles.css` | Typography, layout, responsive nav, cards |
| `script.js` | Mobile navigation, smooth scrolling, header state |
| `favicon.svg` | Placeholder favicon |
| `assets/` | `Hao_Yu_CV.pdf` (you add this) and optional images |

## Notes

- Replace placeholder `href="#"` links only when you have real URLs; until then they intentionally stay inert.
- All publication DOIs and the GitHub username come from the CV used to build this site.
