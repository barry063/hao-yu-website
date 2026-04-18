# Hao Yu — Academic website

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-1e3a5f?logo=github)](https://mirainthehub.github.io/hao-yu-academic-site/)
[![License: MIT](https://img.shields.io/badge/License-MIT-1e3a5f)](LICENSE)

**Live site:** [mirainthehub.github.io/hao-yu-academic-site](https://mirainthehub.github.io/hao-yu-academic-site/)

A minimal, text-forward academic portfolio: PhD research (Cambridge), publications, projects, and contact—built as static HTML/CSS/JS and hosted on **GitHub Pages**. Designed for clarity on desktop and mobile, with sensible defaults for accessibility and social link previews.

---

## Why this repo exists

- **Single page** — fast to load, easy to maintain, no build step.
- **Portable** — drop the files on any static host (Pages, Netlify, Cloudflare Pages, etc.).
- **Fork-friendly** — MIT-licensed layout you can adapt for your own profile (see [CONTRIBUTING.md](CONTRIBUTING.md)).

If you find the structure useful, consider **starring** the repo—it helps others discover it.

---

## Highlights

| Area | Details |
|------|---------|
| **Sections** | About, research themes, publications (with DOIs), projects, experience, education, skills, leadership, awards, CV, contact |
| **Stack** | Semantic HTML, CSS custom properties, a small amount of JS for navigation |
| **Sharing** | Open Graph / Twitter meta tags + `assets/og-image.png` for link previews |
| **Extras** | `robots.txt` + `sitemap.xml` for basic discoverability |

---

## Quick start (local)

```bash
git clone https://github.com/Mirainthehub/hao-yu-academic-site.git
cd hao-yu-academic-site
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080).

---

## Before you publish

1. **`assets/Hao_Yu_CV.pdf`** — add your CV so the download button works.
2. **Headshot** — replace the placeholder in `index.html` (see comments near `headshot`).
3. **Profile links** — set LinkedIn / Google Scholar URLs in the hero (marked `TODO`).
4. **Canonical & OG URL** — if you fork to another account or use a custom domain, update the `<link rel="canonical">` and `og:url` / `og:image` absolute URLs in `index.html`.

---

## Deploy (GitHub Pages)

1. Push this repository to GitHub.
2. **Settings → Pages → Build and deployment**
3. **Source:** *Deploy from a branch* → **Branch:** `main`, **Folder:** `/ (root)` → Save.
4. Site URL: `https://<username>.github.io/<repo>/`

Relative asset paths work under a project URL (e.g. `/hao-yu-academic-site/`).

---

## Repository layout

```
hao-yu-academic-site/
├── index.html          # Page structure & content
├── styles.css          # Layout & typography
├── script.js           # Nav + smooth scroll
├── favicon.svg
├── robots.txt
├── sitemap.xml
├── LICENSE             # MIT (site code)
├── CONTRIBUTING.md
└── assets/
    ├── og-image.png    # Social preview (Open Graph)
    └── Hao_Yu_CV.pdf   # Add your CV here
```

---

## Suggested GitHub metadata (optional)

On the repo **About** pane (gear icon), you can add:

**Website:** `https://mirainthehub.github.io/hao-yu-academic-site/`

**Topics (examples):**  
`academic-website` `github-pages` `portfolio` `materials-science` `photonics` `nanofabrication` `research` `static-site` `html` `phd`

---

## License

Site **code** (HTML/CSS/JS) is released under the [MIT License](LICENSE). **Biographical and research text** remains the author’s; forks should replace content with their own.

---

## Acknowledgements

Fonts: [Google Fonts](https://fonts.google.com/) — Inter & Source Serif 4.
