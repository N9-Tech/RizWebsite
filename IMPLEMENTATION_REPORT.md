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

The cinematic scene was ported from React Three Fiber to native Three.js. Camera motion, particles, illuminated core geometry, rings, architectural rails, data panes, nodes, energy packets, scan plane, lighting, responsive quality choices, pointer movement, scroll progression, WebGL fallback, and reduced-motion fallback are handled directly in `scene.js`.

No build pipeline is required.
