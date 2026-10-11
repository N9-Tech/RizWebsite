# Mobile homepage audit and repair

Baseline: `6848451801a0d4b1480302ef9005ddf8c47a3238` on `main`.

The active homepage is self-contained in `index.html`. Editing the separate `style.css` or `app.js` would not fix this page; those files belong to the case-study pages. The repair keeps the homepage directly deployable without a build step.

## Findings

Locations below refer to the baseline, so they remain useful after lines move. Severity reflects impact on visitors. “Static” means the code defect or risk was identified by inspection, rather than reproduced on a physical phone.

| Severity | Baseline location | Failure and evidence | Repair |
| --- | --- | --- | --- |
| High | `index.html:99,109` | At widths below 860px, all section links disappear. There is no alternative mobile navigation. Reproduced at 320px and 390px. | Add a touch/keyboard Menu button with all destinations, expanded-state labels, Escape/outside/link/brand dismissal, and a bounded scrollable dropdown. Hide links only after handlers are installed. |
| High | `index.html:22–25,53–55,65,142,155,170,180,215,221` | Essential content depends on successful JavaScript enhancement. With JavaScript disabled, the intro paragraph and 11 reveal elements remain invisible and the terminal is empty. A thrown WebGL context request prevents the later copy handler from being installed. Both failures reproduced. | Render meaningful content in HTML and make it visible by default. Initialise controls before optional graphics, guard WebGL failure, skip unavailable observers, and provide a loader escape timer independent of the main enhancement script. |
| Medium | `index.html:50–53,99,157` | The headline's 57.6px minimum and independently wrapped character spans break/clamp text on a 320px viewport when Google Fonts fail. Reproduced with the font request blocked. Normal loaded-font rendering was less affected. | Use a narrow-screen type scale and keep each intended headline line together; verify both supplied and fallback fonts. |
| Medium | `index.html:37–38,46,112` | The hero uses a fixed viewport height with a 640px floor and no clearance above its content. Short screens and wrapped content have no natural growth path. Static layout defect; the 320px baseline puts the second CTA below the first viewport. | Use content-driven height with a small-viewport minimum, header/safe-area clearance, and responsive CTA spacing. Landscape may scroll naturally to show all content. |
| Medium | `index.html:37–38,63,109` | Section anchors position headings underneath the fixed header. The platforms heading was measured at approximately y=0 beneath an 88px header. The transparent header also allows scrolled content to overlap its text visually. | Add scroll margins based on header height and safe-area top; give the header an opaque gradient. |
| Medium | `index.html:87,142,212–219` | Terminal typing appends content and changes its height. Baseline measurements: 256→488px at 320px, 256→378px at 390px, and 256→269px on desktop. Downstream content shifts during reading. | Reserve full wrapped text and caret height before typing. Animate text inside the reserved lines, finish on exit, and cancel typing work when hidden or leaving the page. |
| Medium | `index.html:201–207` | Initial rendering and the initial intersection callback both start a new GPU frame chain. Reproduced with an instrumented stub GPU: two pending frame chains. | Give one cancellable frame handle exclusive scheduling ownership. Verify it stays singular and stops offscreen. |
| Medium | `index.html:183–194` | Reversed `smoothstep(1.4,.25,...)` is undefined GLSL behavior. The mediump sine hash also uses large products that exceed guaranteed mediump range for pixel coordinates. Static portability defects; the exact visual symptom on a phone GPU was not measured. | Use an ordered smoothstep with inversion, bounded hash math, high precision where supported, a safe zero-distance division, and bounded animation time. |
| Medium | `index.html:195–207` | Shader setup has incomplete allocation/compile failure handling, no context loss/restoration recovery, no explicit hidden-document pause, and no runtime reduced-motion updates. Reduced-motion rendering is not redrawn on resize. Static lifecycle defects. | Check shader/program/buffer creation, free failed setup, pause/resume across visibility/page events, rebuild after context restoration, and redraw a static frame after motion or size changes. |
| Medium | `index.html:21,37,99` | `viewport-fit=cover` is set, but horizontal content gutters do not account for notches. Static safe-area risk, especially in landscape. | Include left/right safe-area insets in content and dropdown margins, and top/bottom in dropdown height bounds. Physical notched-device testing remains outstanding. |
| Low | `index.html:31,75,173–178,204` | Touch can receive sticky hover padding and pointer-based button displacement on mixed-input devices. Cursor interpolation runs continuously even while idle; animated grain adds perpetual mobile compositing. Static behavior/performance risks. | Limit hover changes to fine pointers, ignore touch events in pointer effects, stop idle cursor frames, pause on lifecycle/motion changes, and keep mobile grain static. |
| Low | `index.html:167–171` | Every scroll event immediately reads layout and changes many word classes; resize does not refresh the progress calculation. Static scheduling issue. | Coalesce scroll work into one animation frame and refresh on resize and cached-page restoration. Reveal tall elements on first intersection. |
| Low | `index.html:126–130` | Five informational rows are keyboard-focusable but have no activation action, suggesting controls that do nothing. Static accessibility issue. | Remove their nonfunctional tab stops; keep the descriptions visible. |
| Low | `README.md`, `IMPLEMENTATION_REPORT.md`, `DESIGN_SPEC.md` | Documentation describes Sora, gold/blue convergence art, adaptive save-data behavior, and a Three.js `scene.js` that the current homepage does not contain. | Correct the implemented architecture and test instructions; label the earlier design brief as historical. |

GLSL reference: [Khronos smoothstep definition](https://github.com/KhronosGroup/OpenGL-Refpages/blob/main/gl4/smoothstep.xml), which specifies undefined results when the first edge is greater than or equal to the second.

## Review corrections within the repair

Independent static review also caught issues in the repair before delivery:

- Reset a cancelled scroll-frame handle and schedule a refresh on `pageshow`, so a cached-page return cannot freeze progress updates.
- Register observers/listeners before starting graphics work, and unwind partial setup if observer construction throws.
- Unbind the current WebGL program before deleting it, allowing program and attached shader resources to be released after failed setup.
- Retain the loader exit transition and terminal caret, close the mobile menu on the brand link, and bound the menu in short landscape viewports.
- Measure terminal stability on a fresh page before its first intersection, then during and after actual typing. Force and confirm the fine-pointer branch when testing hybrid touch.

## Validation

All 14 regression checks passed with zero failing checks, including fresh-page terminal typing, external font failure, disabled JavaScript, missing observers, clipboard success/rejection, partial GPU setup cleanup, cached-page restoration and hybrid touch.

| Browser | Viewports | Result |
| --- | --- | --- |
| Chromium, headed with a real WebGL context | 320×568, 390×844, 412×915, 768×1024, 844×390, 1024×768, 1440×900 | All seven layout/control/rendering scenarios passed. |
| WebKit, headless with a real WebGL context | 390×844, 844×390 | Both mobile and landscape layout/control/rendering scenarios passed. |
| Chromium and WebKit lifecycle checks | 390×844 resized to 844×390 | Both reduced-motion toggle/static resize redraw, animation resumption, and WebGL context loss/restoration scenarios passed. |

The 11 browser scenarios check horizontal overflow, unbroken headline lines, header clearance, shader linking/drawing, all menu destinations, Escape and brand dismissal, section reveals, offscreen GPU pause and absence of uncaught errors. Hero and full-page screenshots were reviewed. Inline JavaScript syntax, unique HTML IDs, fragment destinations and fixed mail destinations also passed checks.

Commands: `node tests/mobile-regression.cjs`; `xvfb-run -a node tests/verify-browser.cjs`. Engine-specific reruns use `BROWSER=chromium` or `BROWSER=webkit`. Tests require a static preview server and development-only Playwright/browser installations.

## Scope and limits

The full homepage source and final diff were reviewed, including control setup, async clipboard feedback, mutation, animation ownership, failure recovery, lifecycle cleanup and fixed contact destinations. Statement and terminal updates now use text nodes rather than HTML-string construction. The homepage has no backend workflow to exercise.

A minimal unrelated HTML page reproduced a Linux headed-WebKit harness problem: resizing changed `innerWidth` but left the CSS/visual viewport unchanged. WebKit checks therefore use headless mode, which has a real WebGL context in this environment and passes the layout-viewport resize assertion. Chromium checks use headed mode for its working WebGL context.

Browser viewports and touch emulation do not validate physical iPhone/Android GPU performance, thermal behavior, Safari toolbar/notch geometry, or opening a native mail client. The shared case-study pages were not changed or exhaustively browser-tested in this repair. Core mail links retain the existing `mailto:r@rizzy.pro` destination; clipboard success and rejection are tested with controlled browser responses.
