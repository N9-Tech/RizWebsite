# RizWebsite

High-quality static portfolio site for **theace9**.

## Runtime

The production site is intentionally browser-native:

- HTML
- CSS
- Vanilla JavaScript
- Three.js loaded directly from a pinned CDN URL

There is **no npm**, package manager, framework runtime, bundler, compilation step, or generated build directory.

## Local preview

Any static HTTP server works. For example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

Opening `index.html` directly also works for most of the site, but an HTTP server is preferable for consistent module loading.

## GitHub Pages

Use repository **Settings → Pages** and choose:

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/(root)**

The repository includes `.nojekyll`, so GitHub Pages serves the committed files directly.

## Structure

```
index.html
style.css
static-overrides.css
app.js
scene.js
images/
social/
work/
```

`scene.js` is the native Three.js cinematic layer. If WebGL is unavailable or reduced motion is requested, the CSS visual fallback remains available.
