# THEACE9 — Cinematic Developer Portfolio
## Complete Design & Build Specification
### Version 1.0 — AI-Agent Implementation Ready

> **Purpose:** Build a premium, cinematic personal website for `theace9`, a software engineer and AI-assisted developer. The site should feel comparable in production quality to the strongest MotionSites-style websites, while remaining original, technically credible, fast, responsive, accessible, and maintainable.

---

# 1. Product Definition

## 1.1 Working identity

**Brand:** `theace9`  
**Primary title:** `Software Engineer / AI-Assisted Developer`  
**Short positioning line:** `I build software, automation and systems — faster with AI, without giving up engineering discipline.`

The brand should not feel like a freelance-template portfolio, résumé site, generic AI SaaS landing page, or neon “hacker” page.

The desired impression is:

- highly technical
- modern
- experimental
- premium
- intentional
- calm rather than noisy
- AI-native without looking AI-generated
- capable of both product engineering and systems work
- visually memorable without sacrificing usability

## 1.2 Audience

Primary audiences:

1. Potential clients who need software, automation, integrations or technical products.
2. Companies evaluating the developer for engineering work.
3. Technical collaborators.
4. Founders who need an engineer capable of taking an idea from prototype through deployment.
5. People arriving from GitHub, LinkedIn or a shared project link.

## 1.3 Main conversion goals

The site should encourage visitors to:

- view selected work
- understand technical breadth
- understand the AI-assisted development workflow
- inspect GitHub/project links
- contact the developer
- start a project conversation

The site should **not** behave like an aggressive agency funnel.

---

# 2. Research-Derived Visual Direction

The reference family is MotionSites-style premium animated web design.

The public gallery contains a broad mix of:

- cinematic landing pages
- 3D websites
- interactive portfolios
- AI/SaaS presentations
- dark editorial layouts
- luxury/minimal layouts
- glassmorphism
- scroll-led storytelling
- full-screen hero scenes
- video-backed experiences
- WebGL/Three.js scenes
- oversized typography
- controlled motion

The MotionSites academy also demonstrates workflows based on scroll-controlled visuals and Three.js/3D rather than flattening the entire site into a prerecorded animation.

### What to borrow as principles

Borrow:

- a single memorable visual concept
- strong full-screen opening
- large typography
- spacious composition
- scroll as a narrative control
- depth and layered UI
- frosted/glass material where appropriate
- high-quality micro-interactions
- occasional pinned sections
- elegant transitions
- cinematic lighting
- polished loading state

Do **not** copy:

- any specific MotionSites composition
- exact copy
- exact color treatment
- their assets
- their 3D models
- a known portfolio scene
- the generic glowing-purple-AI orb
- overused black + violet gradient SaaS appearance

---

# 3. Core Creative Concept

## 3.1 Theme: "The Build Engine"

The website is built around a visual metaphor:

> A software system assembling itself in real time.

The hero contains a central dark metallic/glass **computational core** suspended in a deep spatial environment.

It is not a literal CPU model.

It should look like a designed digital machine containing:

- a luminous central core
- thin architectural frames
- floating terminal panes
- small connected nodes
- data traces
- translucent planes
- procedural particles
- subtle code fragments
- orbital UI markers

As the user scrolls, the system gradually expands and reveals different aspects of the developer's work.

The visual story:

**Idle system → Build request → AI assistance → Engineering → Infrastructure → Shipping**

This becomes the narrative backbone for the first half of the homepage.

## 3.2 Emotional target

The page should feel like:

- opening an advanced engineering console
- interacting with a high-end product demo
- viewing an editorial technology portfolio
- entering a controlled digital environment

Avoid:

- gaming UI
- Matrix rain
- fake cyber-security aesthetic
- constant neon
- endless particle clutter
- excessive terminal text
- fake command prompts used only as decoration

---

# 4. Experience Principles

## 4.1 One major effect at a time

Every viewport must have one clear visual priority.

For example:

- Hero: 3D build engine
- Expertise: kinetic type + architecture lines
- Work: project cards
- AI workflow: animated pipeline
- Stack: controlled technical data visualization
- Contact: minimal, quiet ending

Never animate every object simultaneously.

## 4.2 Motion must communicate state

Animation should explain:

- where the visitor is
- what changed
- which item is interactive
- how systems connect
- how the developer works

Decorative animation is secondary.

## 4.3 DOM content remains real content

All headings, paragraphs, links, buttons and project information must remain HTML.

Do not render important content into Canvas.

Canvas/WebGL is a visual layer.

## 4.4 Progressive enhancement

The website must remain coherent if:

- WebGL fails
- JavaScript loads slowly
- reduced-motion is enabled
- the device is low-powered
- the user is on mobile
- the 3D asset is not yet loaded

---

# 5. Technology Specification

## 5.1 Application stack

Production uses browser-native technology only:

- semantic HTML5
- modern CSS
- vanilla JavaScript
- the homepage CSS and JavaScript embedded directly in `index.html`
- hardware-decoded H.264/MP4 video as the cinematic hero art layer
- a poster still from the same footage for zero-flash first paint
- Sora variable typography
- native CSS animations and transitions
- `requestAnimationFrame` only while scroll interpolation is settling
- `IntersectionObserver` for visibility-based media and reveal work

Do not add npm, a package manager, a bundler, a compilation step, Three.js/WebGL, a JavaScript framework, a CSS framework, a component framework, a generated build directory, or external JavaScript dependencies for the production homepage.

The repository root must remain directly deployable by an ordinary static web server.

## 5.2 Rendering split

### DOM / vanilla JavaScript
Use for:

- navigation
- text
- buttons
- project cards
- metadata
- menus
- contact UI
- footer
- accessibility
- progressive enhancement
- scroll progress state

### Cinematic media
Use the supplied looping video for:

- hero atmosphere
- depth and motion
- gold/blue light language
- centre flare
- the main visual focal point

The video is presentation-only, muted, looping, `playsinline`, poster-backed, and paused when reduced motion is requested or when the hero is outside the viewport.

### CSS
Use for:

- veil/scrim treatment
- scroll-linked video zoom
- glass controls
- typography
- borders and hairlines
- responsive layout
- gradients and masks
- entrance choreography
- section transitions

### Native motion controller
Use one lightweight JavaScript controller for:

- smoothed hero scroll progress
- text exit
- video zoom variables
- project-media parallax
- page progress
- reveal scheduling

Do not use a permanent JavaScript animation loop when the page is idle.

---

# 6. Performance Architecture

## 6.1 Performance targets

Target on a modern desktop:

- LCP under 2.5 seconds on a production connection where practical
- CLS under 0.1
- INP under 200 ms where practical
- stable 60 fps during normal DOM scrolling
- no continuous renderer after the hero has left the viewport

Mobile:

- prioritize stable interaction over decorative complexity
- avoid fixed blur filters and heavy backdrop compositing
- keep pointer-only effects disabled on coarse pointers
- keep scroll updates passive and RAF-throttled
- pause video when it is no longer visible

## 6.2 Video and compositor constraints

The cinematic hero should:

- use the authored 1920×1080 H.264 MP4 directly
- use the matching poster frame before playback
- use `object-fit: cover`
- animate only compositor-friendly transform/opacity/filter values
- keep filter effects restrained
- avoid canvas/WebGL duplication behind the video
- pause when the hero leaves the viewport
- pause at the first frame for `prefers-reduced-motion: reduce`

Large blur filters, fixed noise overlays and unnecessary backdrop filtering should not be used during scroll.

## 6.3 Adaptive behaviour

Desktop:
- full video motion
- cinematic scroll zoom
- full entrance sequence
- pointer glow only on fine-pointer devices

Mobile/tablet:
- same authored video with stronger readability veil
- CSS-only checkbox menu
- 44px minimum tap targets
- slightly shorter scroll chapter
- no pointer glow

Reduced motion:
- video paused on its first frame
- entrance animations disabled
- scroll-linked transforms disabled
- content remains fully readable and usable

---

# 7. Global Visual System

## 7.1 Color palette

Primary environment:

```css
--bg-0: #050607;
--bg-1: #090b0d;
--surface-0: rgba(255,255,255,0.045);
--surface-1: rgba(255,255,255,0.075);
--border-soft: rgba(255,255,255,0.10);
--border-strong: rgba(255,255,255,0.18);
--text-primary: #f4f6f8;
--text-secondary: #a7adb5;
--text-muted: #6d747d;
--accent: #9df5cf;
--accent-hot: #d9ff5f;
--danger: #ff6b6b;
```

Accent usage must be restrained.

The page should be mostly monochrome.

The accent should appear in:

- active state
- core energy
- a few data markers
- CTA hover
- status indicators

No rainbow gradients.

No large purple gradient backgrounds.

## 7.2 Lighting language

Scene lighting:

- cool neutral environment
- soft cyan/green-white core
- small warm highlights only where needed
- black should remain truly dark
- surfaces should have controlled specular response

Avoid excessive bloom.

Bloom should be visible around the energy core, not around all text/UI.

## 7.3 Texture language

Use extremely subtle:

- film grain
- fine noise
- soft vignette
- 1px architectural lines
- occasional scan-like gradient

No dirty/grunge textures.

## 7.4 Typography

Desired pairing:

### Display
A modern grotesk/neo-grotesk with strong large-scale presence.

Candidates:

- Geist
- Inter Tight
- Manrope
- Instrument Sans
- Space Grotesk

Agent should test at least two combinations before finalizing.

### Mono
Use a legible mono for metadata only:

- Geist Mono
- IBM Plex Mono
- JetBrains Mono

Do not use mono for body copy.

## 7.5 Type scale

Desktop:

```text
Hero display:  clamp(4.5rem, 9vw, 9.5rem)
H2:            clamp(3rem, 6vw, 6.5rem)
H3:            clamp(1.6rem, 3vw, 3rem)
Body large:    1.25–1.5rem
Body:          1rem–1.125rem
Small/meta:    0.72–0.82rem
```

Mobile:

```text
Hero: 3.4–4.5rem
H2:   2.5–3.5rem
Body: 1rem
```

Use tight tracking on large text.

Avoid giant typography where it damages comprehension.

---

# 8. Layout Grid

Desktop:

- max content width: 1600px
- standard page gutter: 48–72px
- 12-column grid
- large section gap: 160–240px
- common radius: 18px
- large card radius: 28px

Tablet:

- 32px gutter

Mobile:

- 18–22px gutter
- cards stack
- preserve empty space rather than compressing everything

---

# 9. Site Architecture

Primary routes:

```text
/
├── /work
├── /work/[slug]
├── /about
├── /contact
└── /lab        optional
```

Initial release can ship with:

```text
/
├── /work/[slug]
└── /contact
```

Navigation:

```text
theace9
Work
Capabilities
Process
About
Contact
```

Optional secondary actions:

```text
GitHub
LinkedIn
```

---

# 10. Homepage — Complete Sequence

The homepage should feel like a continuous story rather than unrelated blocks.

Recommended scroll length:

**7–10 viewport heights on desktop.**

Do not create a 20-screen endless portfolio.

---

# 11. Section 0 — Loading / Boot State

## Goal

Make 3D loading feel intentional.

## Layout

Black background.

Small centered status:

```text
THEACE9 / BUILD SYSTEM
INITIALISING
```

A thin progress line expands horizontally.

Optional rotating status:

```text
loading scene
preparing shaders
syncing interface
```

Do not fake slow loading.

If assets are ready immediately, complete within ~500–800ms.

Maximum normal loader display: ~2.5 seconds.

Never block access indefinitely.

## Transition

When ready:

- progress line completes
- interface fades
- black overlay lifts
- WebGL core becomes visible
- page title enters

---

# 12. Section 1 — Hero: "Software that ships."

## Height

Desktop:

```text
min-height: 100svh
```

Can remain pinned for approximately 140–180% scroll distance if animation benefits from it.

## Content

Top navigation fixed.

Small status at top-left or upper content region:

```text
SOFTWARE ENGINEER
AI-ASSISTED DEVELOPMENT
MANCHESTER / UK
```

Main heading:

```text
Software
that ships.
```

Alternative:

```text
I build
what ideas need.
```

Preferred first version:

```text
Software
that ships.
```

Supporting text:

```text
Products, automation, infrastructure and intelligent workflows —
engineered from prototype to production.
```

Primary CTA:

```text
Explore my work
```

Secondary CTA:

```text
Start a project
```

Tiny status:

```text
AVAILABLE FOR SELECT PROJECTS
```

Do not invent availability if the site owner does not want this claim. Store it in content config.

## Hero 3D composition

Center-right on desktop.

Centered behind text on mobile.

The Build Engine consists of:

1. central inner energy volume
2. black translucent outer shell
3. four asymmetric structural rails
4. thin orbit path
5. 8–14 connected nodes
6. 2–4 floating glass terminal planes
7. sparse particle field
8. tiny system labels

The scene should look designed, not randomly generated.

## Hero idle motion

When user is idle:

- core slowly breathes
- structure rotates by 1–2 degrees
- particles drift
- terminal panes shift subtly
- cursor causes very small parallax

No fast continuous rotation.

## Pointer interaction

Desktop only:

- camera target offsets slightly toward cursor
- nearest pane can tilt by < 3 degrees
- core light responds minimally

Never make the user chase moving UI.

---

# 13. Hero Scroll Timeline

Use one native scroll-progress controller driven by requestAnimationFrame, with scroll input smoothed before it changes the scene.

Approximate phases:

```text
0.00–0.18  Hero established
0.18–0.35  Shell begins opening
0.35–0.52  Internal nodes separate
0.52–0.68  Code/data planes become visible
0.68–0.84  Camera moves through structure
0.84–1.00  Scene resolves into capability map
```

During this scroll:

- headline gradually moves out
- scene expands
- a small system label updates
- next section copy enters only after the scene has visually transitioned

Do not rapidly scrub animation based on every tiny scroll delta. Smooth the progress.

---

# 14. Section 2 — Capability Statement

## Transition

The opened Build Engine becomes a faint spatial architecture behind the section.

Main statement:

```text
One engineer.
Multiple layers.
```

Followed by:

```text
I work across product, backend, automation, infrastructure and AI-assisted development,
so fewer ideas get lost between design and delivery.
```

## Capability labels

Use 5 horizontal/vertical labels:

```text
01 / Product Engineering
02 / Web & Backend
03 / Automation
04 / AI-Assisted Systems
05 / Infrastructure & Deployment
```

Optional sixth:

```text
06 / Game & Interactive Tooling
```

## Interaction

Hovering a capability:

- brightens its architectural line
- highlights matching node in 3D scene
- displays a 1–2 sentence explanation
- updates small system metadata

Example:

```text
WEB / BACKEND
APIs, dashboards, application logic, databases,
integrations and deployment.
```

On touch devices, capability rows expand on tap.

---

# 15. Section 3 — Selected Work

## Purpose

This is the most important credibility section.

Visual effects must step back and let work dominate.

Heading:

```text
Selected work
```

Intro:

```text
Systems I've designed, built, automated or taken further.
```

## Desktop layout

Use a large editorial project reel.

Do not use generic three-column cards.

Recommended structure:

```text
Project 01 — full width / 16:9
Project 02 — offset 8/12 width
Project 03 — full width / alternative alignment
Project 04 — split layout
```

Each project includes:

- index
- project title
- one-line result
- category
- stack
- year
- visual
- case-study link

## Initial content categories

Use placeholder project records until exact public project names are chosen.

Suggested categories based on actual engineering focus:

### Project A — Web Product
A deployed web application or platform.

### Project B — Android Automation
An Android automation/control application with reliability-oriented background logic.

### Project C — Game / Interactive Systems
Roblox/game systems, tooling or automation presented only at a professional high level.

### Project D — Infrastructure
Server, deployment, API, queue or Cloudflare-related architecture.

### Project E — AI-Assisted Engineering
A project demonstrating use of coding agents while retaining testing/review discipline.

Do not publish private code or project details.

## Card visual treatment

Cards are deep black / graphite.

Use:

- one strong project visual
- subtle frame
- metadata outside image
- cursor image parallax no greater than ~2%
- optional video preview on hover

Avoid fake browser mockups for every project.

## Hover

Desktop:

- image moves 6–12px
- border becomes slightly brighter
- title arrow extends
- optional preview begins

No dramatic scale jump.

## Project transition

Clicking a project can use a shared-element transition:

- card visual expands
- rest of page fades
- case study enters

Must gracefully degrade if View Transitions API is unavailable.

---

# 16. Section 4 — AI-Assisted Development

## Purpose

This must distinguish the site from a normal software-engineer portfolio.

Heading:

```text
AI in the loop.
Engineering in control.
```

Body:

```text
I use coding agents to accelerate research, implementation and iteration.
Architecture, verification, testing and final technical decisions stay deliberate.
```

This section should visually demonstrate the workflow.

## Main visual

A horizontal pipeline on desktop:

```text
IDEA
  ↓
PLAN
  ↓
AGENT
  ↓
IMPLEMENT
  ↓
REVIEW
  ↓
TEST
  ↓
SHIP
```

Instead of literal boxes, use a moving “build packet” travelling through an architectural track.

When the packet reaches each stage:

- stage glows
- a short artifact appears
- code / diff / test output changes

## Example artifacts

### PLAN
```text
requirements.md
architecture.md
```

### AGENT
```text
task queued
context loaded
```

### IMPLEMENT
```diff
+ service layer
+ validation
+ retry policy
```

### REVIEW
```text
trace input → output
check edge cases
inspect async paths
```

### TEST