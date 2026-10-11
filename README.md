# RizWebsite

High-quality static portfolio site for **Rizwan**.

## Production architecture

The site is intentionally browser-native:

- semantic HTML
- modern CSS
- vanilla JavaScript
- raw WebGL / GLSL for the cinematic hero
- Instrument Serif, Geist and Geist Mono typography
- browser-native animation and observer APIs

Production has no package manager, JavaScript framework, CSS framework, bundler, compilation step, generated build directory, Three.js dependency, video background, or external JavaScript dependency. Playwright is used only for optional development checks.

The homepage is deliberately packaged as a **single self-contained `index.html`** for its CSS, JavaScript and GLSL shader source. The homepage loads its fonts from Google Fonts and uses a local SVG favicon. System fonts and a CSS gradient keep it readable when external fonts or WebGL are unavailable.

## Hero rendering

The hero uses one WebGL full-screen triangle and a fragment shader to draw animated cyan and amber silk-like light. It responds to mouse position on desktop; touch input does not move buttons or the hero pointer effect.

- The internal canvas size is 55% of CSS dimensions for fine pointers and 40% otherwise.
- Shader draws are capped at approximately 30 fps; one frame chain owns scheduling.
- Offscreen, hidden-document and page-exit events pause rendering.
- Reduced motion draws a static frame, redrawing after resize or context restoration.
- WebGL context loss shows the CSS gradient; restoration rebuilds GPU resources.
- The terminal reserves its final content height before typing, including wrapped mobile text.
- Content is visible by default. Mobile navigation is hidden behind the Menu button only after its handlers are installed.

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


## Browser checks

Serve the repository root, then run the checks from the repository root with Playwright available in Node's module path. The scripts default to `http://127.0.0.1:8087/`; set `BASE_URL` for another preview URL.

```bash
python3 -m http.server 8087
# In another terminal, after installing Playwright and its Chromium/WebKit browsers:
node tests/mobile-regression.cjs
node tests/verify-browser.cjs
node tests/background-effects.cjs
# On Linux without a display, prefix the last two commands with: xvfb-run -a
```

`mobile-regression.cjs` checks layout, navigation, layout stability and failure recovery. It uses a stub GPU for isolated scheduling/resource-cleanup checks. `verify-browser.cjs` uses real browser WebGL contexts in headed Chromium and headless WebKit and writes screenshots to `qa/`. It checks phone, landscape, tablet and desktop dimensions, menu behavior, reduced-motion changes, resize and context loss/restoration. `background-effects.cjs` also samples canvas pixels to reject blank or static effects even when WebGL setup and draw calls succeed. These browser checks do not replace physical phone GPU testing.

See [the mobile audit](docs/MOBILE_AUDIT.md) for the baseline failures and repair details. `DESIGN_SPEC.md` is an earlier design brief, not a description of the current implementation.
