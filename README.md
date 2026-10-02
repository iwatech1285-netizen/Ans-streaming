# Ans Anime

A responsive luxury **Black & White (Monochrome Noir)** anime streaming web application featuring universal media embedding, direct video uploads, live stream previews, and single master admin management.

---

## Why GitHub Showed a White Screen (And How It's Fixed)

When hosting a Vite / React SPA on **GitHub Pages**, a blank white screen usually occurs because of two reasons:

1. **Absolute Asset Paths (`/assets/...`)**:
   By default, Vite compiles asset paths with a leading slash `/assets/...`. When hosted under a GitHub repository subpath (such as `https://<username>.github.io/<repo-name>/`), the browser looks for scripts at the root domain `https://<username>.github.io/assets/...` instead of inside your repository folder. This causes a `404 Not Found` error for both JavaScript and CSS, leaving a blank white screen.
   - **Fix Applied**: Configured `base: './'` in `vite.config.ts`. All assets now use relative paths (`./assets/...`) and load reliably regardless of repo name or domain.

2. **Unbuilt `.tsx` Source Code**:
   GitHub Pages serves static HTML, CSS, and JS. Browsers cannot parse uncompiled TypeScript (`.tsx`) files directly.
   - **Fix Applied**: Added `.github/workflows/deploy.yml` which automatically runs `npm run build` and publishes the compiled `dist/` bundle to GitHub Pages whenever you push to `main`.

3. **Runtime Error Recovery**:
   - Added a global `ErrorBoundary` in `src/components/ErrorBoundary.tsx` so any local storage or network glitch shows an interactive recovery screen instead of a blank white page.
   - Added an initial dark loader inside `index.html` so you never see a jarring white flash on initial page load.

---

## How to Deploy on GitHub Pages

### Method 1: Automatic via GitHub Actions (Recommended)

1. Push your repository to GitHub (`main` or `master` branch).
2. Go to your repository on GitHub:
   - Click **Settings** &rarr; **Pages** (in the left sidebar).
3. Under **Build and deployment** &rarr; **Source**:
   - Select **GitHub Actions** (instead of "Deploy from a branch").
4. The included workflow (`.github/workflows/deploy.yml`) will automatically trigger, build the project, and publish your site!
5. Your anime site will be live at `https://<username>.github.io/<repo-name>/` with working video streaming!

### Method 2: Manual Build & Push (`dist/` folder)

If you prefer uploading built files manually:
1. Run `npm run build` in your terminal.
2. The compiled static website is generated in the `dist/` directory.
3. Upload the contents of `dist/` to your `gh-pages` branch, or into InfinityFree `htdocs/`.

---

## Features
- **Cinema Watch Player (`/watch`)**:
  - Direct video uploads (`.mp4`, `.webm`, `.mkv`) stored in browser IndexedDB.
  - Universal iframe embeds (YouTube, Google Drive, Streamtape, Mega, Vimeo, etc.).
  - Keyboard navigation: `P` (Previous Episode), `N` (Next Episode), `T` (Theater Mode).
- **Master Admin Panel**:
  - Single master admin password security.
  - Dedicated **Media Embedding & Video Manager** with live preview.
  - Episode manager with multi-server tagging.
  - One-click `.json` database backup and restore.
