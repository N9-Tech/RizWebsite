# RizWebsite

High-quality static portfolio site for **theace9**.

## Production architecture

The site is intentionally browser-native:

- semantic HTML
- modern CSS
- vanilla JavaScript
- raw WebGL / GLSL for the cinematic hero
- Sora variable typography
- browser-native animation and observer APIs

There is **no npm**, package manager, JavaScript framework, CSS framework, bundler, compilation step, generated build directory, Three.js dependency, video background, or external JavaScript dependency.

The homepage is deliberately packaged as a **single self-contained `index.html`** for its CSS, JavaScript and GLSL shader source. The only external presentation asset currently used by the homepage is the variable font.

## Hero rendering

The hero is generated procedurally at runtime with one WebGL full-screen triangle and a fragment shader. The shader creates:

- warm gold fibre bundles from the upper corners
- blue fibre bundles from the lower corners
- a white-hot central convergence flare
- subtle lower-half volumetric cloud/noise
- fine dust points
- slow ambient motion
- scroll-controlled push-in / zoom

The canvas render target is intentionally lower than CSS display resolution and remains fixed while scrolling, so CSS transforms can zoom the art without reallocating the GPU buffer.

Adaptive rendering:
- desktop: restrained internal resolution, 36 fps shader animation
- mobile: lower internal resolution, 30 fps shader animation
- low-power/save-data devices: reduced internal resolution and frame rate
- offscreen hero: rendering stops
- reduced motion: a single static shader frame is rendered

A CSS gradient fallback remains behind the canvas if WebGL fails or the context is lost.

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
