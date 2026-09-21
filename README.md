# RizWebsite

High-quality static portfolio site for **theace9**.

## Production architecture

The site is intentionally browser-native:

- semantic HTML
- modern CSS
- vanilla JavaScript
- hardware-decoded H.264 hero video
- Sora variable typography
- browser-native animation and observer APIs

There is **no npm**, package manager, JavaScript framework, CSS framework, bundler, compilation step, generated build directory, or runtime WebGL dependency.

The homepage is deliberately packaged as a **single self-contained `index.html`** for its CSS and JavaScript. The cinematic video, poster and variable font remain external media/font assets. Case-study pages continue to use the small shared `style.css`, `static-overrides.css` and `app.js` files.

## Local preview

Any static HTTP server works:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## GitHub Pages

Use repository **Settings → Pages**:

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/(root)**

The repository includes `.nojekyll`, so GitHub Pages serves the committed files directly without a build.

## Structure

```
index.html              # self-contained production homepage
style.css               # shared case-study styles
static-overrides.css    # shared case-study overrides
app.js                  # shared case-study runtime
images/
social/
work/
```

The homepage video pauses for `prefers-reduced-motion` and when the hero is outside the viewport. Scroll choreography is implemented with lightweight CSS variables and vanilla JavaScript.
