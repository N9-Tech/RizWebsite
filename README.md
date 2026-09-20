# theace9 — Build Engine Portfolio

Cinematic Next.js / React / TypeScript portfolio implementing `DESIGN_SPEC.md`, with GSAP scroll choreography and a procedural React Three Fiber / Three.js Build Engine.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verify before deployment

```bash
npm run typecheck
npm run lint
npm run build
```

The supplied execution environment could not resolve the npm registry, so those dependency-backed commands could not be completed here. See `IMPLEMENTATION_REPORT.md` for the exact QA that was run and its limitations.

## Cinematic system

The homepage uses one continuous six-state scene narrative:

```text
HERO -> OPEN -> INSPECT -> BUILD -> STACK -> RESOLVE
```

Continuous scroll progress is kept outside React render state and read directly by the Three.js frame loop. React state only changes when the named phase changes.

Reduced-motion visitors receive the static fallback instead of a running WebGL canvas.

## Browser QA preview

`preview/` is the dependency-free visual mirror used for browser QA in constrained environments. It is not the production implementation.

```bash
python3 -m http.server 4173 -d preview
```

Final Chromium results, screenshots and repeatable QA scripts are under `qa/`.

## Content

Edit:

```text
src/content/site.ts
src/content/projects.ts
```

Project entries remain deliberately representative until verified project names, screenshots, outcomes, links and metrics are supplied.

## Contact

The `/api/contact` route validates requests, applies a lightweight process-local rate limit and sends the validated payload to `CONTACT_WEBHOOK_URL` over HTTPS. If the endpoint is not configured it returns an explicit `503` rather than a fake success.

For serverless/multi-instance production, replace the process-local limiter with a durable shared store such as Redis/KV.
