from pathlib import Path
import json
from playwright.sync_api import sync_playwright

OUT = Path("qa_artifacts")
OUT.mkdir(exist_ok=True)
events = {"console": [], "page_errors": [], "states": []}

def state(page, label):
    data = page.evaluate("""() => {
      const canvas = document.querySelector('#scene-canvas');
      const engine = document.querySelector('.preview-engine');
      const status = document.querySelector('.scene-status span:last-child');
      const css = getComputedStyle(document.documentElement);
      const scene = document.querySelector('.scene-canvas');
      return {
        y: scrollY,
        width: innerWidth,
        height: innerHeight,
        dpr: devicePixelRatio,
        heroP: css.getPropertyValue('--hero-p').trim(),
        heroDive: css.getPropertyValue('--hero-dive').trim(),
        heroResolve: css.getPropertyValue('--hero-resolve').trim(),
        webglReady: document.documentElement.classList.contains('webgl-ready'),
        webglFallback: document.documentElement.classList.contains('webgl-fallback'),
        canvasDisplay: canvas ? getComputedStyle(canvas).display : null,
        canvasOpacity: scene ? getComputedStyle(scene).opacity : null,
        canvasRect: canvas ? canvas.getBoundingClientRect().toJSON() : null,
        sceneRect: scene ? scene.getBoundingClientRect().toJSON() : null,
        fallbackDisplay: engine ? getComputedStyle(engine).display : null,
        fallbackVisibility: engine ? getComputedStyle(engine).visibility : null,
        fallbackOpacity: engine ? getComputedStyle(engine).opacity : null,
        status: status ? status.textContent : null,
        bodyHeight: document.documentElement.scrollHeight,
        workflowStageHeight: document.querySelector('.workflow-stage')?.getBoundingClientRect().height || null
      };
    }""")
    data["label"] = label
    events["states"].append(data)
    page.screenshot(path=str(OUT / f"{label}.png"), full_page=False)

def attach_logging(page):
    page.on("console", lambda msg: events["console"].append({"type": msg.type, "text": msg.text}))
    page.on("pageerror", lambda err: events["page_errors"].append(str(err)))

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    page = browser.new_page(viewport={"width": 1440, "height": 1000}, device_scale_factor=1)
    attach_logging(page)
    response = page.goto("http://127.0.0.1:4173/", wait_until="domcontentloaded")
    events["http_status"] = response.status if response else None
    page.wait_for_timeout(250)
    state(page, "d00-load-0250ms")
    page.wait_for_timeout(1000)
    state(page, "d01-load-1250ms")
    page.wait_for_timeout(2000)
    state(page, "d02-load-3250ms")

    hero_range = page.evaluate("() => innerHeight * 1.55")
    for i, fraction in enumerate((0.18, 0.38, 0.58, 0.76, 0.94), start=3):
        page.evaluate("([y]) => scrollTo(0, y)", [hero_range * fraction])
        page.wait_for_timeout(900)
        state(page, f"d{i:02d}-scroll-{int(fraction*100):02d}")

    page.evaluate("() => scrollTo(0, document.querySelector('#work').offsetTop - innerHeight * .25)")
    page.wait_for_timeout(900)
    state(page, "d08-work")
    page.close()

    mobile = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=3)
    attach_logging(mobile)
    mobile.goto("http://127.0.0.1:4173/", wait_until="domcontentloaded")
    mobile.wait_for_timeout(800)
    state(mobile, "m00-load")
    mobile_range = mobile.evaluate("() => innerHeight * 1.55")
    for i, fraction in enumerate((0.58, 0.76, 0.94), start=1):
        mobile.evaluate("([y]) => scrollTo(0, y)", [mobile_range * fraction])
        mobile.wait_for_timeout(850)
        state(mobile, f"m0{i}-scroll-{int(fraction*100):02d}")
    mobile.evaluate("() => scrollTo(0, document.querySelector('#process').offsetTop + innerHeight * .6)")
    mobile.wait_for_timeout(850)
    state(mobile, "m04-process")
    mobile.close()

    browser.close()

(OUT / "report.json").write_text(json.dumps(events, indent=2), encoding="utf-8")
print(json.dumps(events, indent=2))
