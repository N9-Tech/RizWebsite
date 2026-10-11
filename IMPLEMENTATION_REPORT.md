# Static refactor report

The previous Next.js/React implementation has been replaced by a direct static implementation.

## Removed

- Next.js
- React and React Three Fiber
- TypeScript runtime/build configuration
- Tailwind/PostCSS build configuration
- npm/package metadata
- GitHub Actions Pages deployment workflow
- framework source tree
- duplicate preview/public build trees

## Current architecture

The repository root is the deployable website. GitHub Pages, Nginx, Apache, Cloudflare Pages static hosting, or any ordinary web server can serve it without preprocessing.

The production homepage embeds its CSS, vanilla JavaScript and raw WebGL shader in `index.html`. It uses one full-screen triangle for cyan/amber procedural light and a CSS gradient fallback. There is no `scene.js` or Three.js dependency in the current homepage. Shared `app.js`, `style.css` and `static-overrides.css` remain for the case-study pages.

The mobile repair adds usable section navigation, responsive hero sizing, stable terminal typing, optional visual enhancements and WebGL lifecycle recovery. Validation and original failure locations are recorded in `docs/MOBILE_AUDIT.md`.

No build pipeline is required.

