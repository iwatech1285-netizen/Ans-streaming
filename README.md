# Ans Anime

A responsive luxury **Black & White (Monochrome Noir)** anime streaming web application featuring universal media embedding, direct video uploads, live stream previews, and single master admin management.

---

## Fixing the "Stuck Loading Screen" on GitHub Pages

The pre-loader spinner stays stuck on screen on GitHub when the browser cannot execute uncompiled TypeScript (`/src/main.tsx`). GitHub Pages is a static host and cannot parse raw TypeScript without a compiled JavaScript bundle.

### How We Solved It (Triple-Layer Support):

1. **Pre-Built `docs/` & `assets/` Directories Added Directly to Repository**:
   - The compiled production bundle (`assets/index.js` and `assets/index.css`) and `docs/` folder are now pre-built and tracked in the repository (removed from `.gitignore`).
2. **Auto-Fallback in Root `index.html`**:
   - If GitHub Pages serves from root `/` and the browser encounters unbundled TypeScript, an automatic event listener immediately loads `./assets/index.js` to mount React and dismiss the loader.
3. **Safety Timeout**:
   - Added an automatic 4-second safety timeout that provides a manual refresh trigger if assets are throttled or blocked by aggressive extensions.

---

## How to Set Up GitHub Pages (3 Easy Ways — All Supported)

### Option A: Point GitHub Pages to `/docs` Folder (Instant — 10 Seconds)
1. Go to your repository on GitHub.
2. Click **Settings** &rarr; **Pages** (in the left sidebar).
3. Under **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (or `master`)
   - **Folder**: select **`/docs`** (instead of `/ (root)`)
   - Click **Save**.
4. That's it! GitHub will serve `docs/index.html` directly with the pre-compiled production bundle!

---

### Option B: Use GitHub Actions (Automatic CI/CD)
1. In your GitHub repository: **Settings** &rarr; **Pages**.
2. Under **Build and deployment** &rarr; **Source**: select **GitHub Actions**.
3. The included workflow file (`.github/workflows/deploy.yml`) will build and deploy on every push.

---

### Option C: Serve from Root `/ (root)`
If your repository is already set to `Branch: main, Folder: / (root)`, the root `index.html` will automatically detect the static environment and load the pre-compiled `assets/index.js` bundle.

---

## Features
- **Cinema Watch Player (`/watch`)**:
  - Direct video uploads (`.mp4`, `.webm`, `.mkv`) stored in browser IndexedDB.
  - Universal iframe embeds (YouTube, Google Drive, Streamtape, Mega, Vimeo, etc.).
  - Keyboard navigation: `P` (Previous Episode), `N` (Next Episode), `T` (Theater Mode).
- **Master Admin Panel**:
  - Single master admin password security (no password reset bypass).
  - Dedicated **Media Embedding & Video Manager** with live preview.
  - Episode manager with multi-server tagging.
  - One-click `.json` database backup and restore.
