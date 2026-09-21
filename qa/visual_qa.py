from pathlib import Path
import json
import time
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
      return {
        y: scrollY,
        heroP: css.getPropertyValue('--hero-p').trim(),
        heroDive: css.getPropertyValue('--hero-dive').trim(),
        webglReady: document.documentElement.classList.contains('webgl-ready'),
        webglFallback: document.documentElement.classList.contains('webgl-fallback'),
        canvasDisplay: canvas ? getComputedStyle(canvas).display : None,
        canvasOpacity: canvas ? getComputedStyle(canvas.parentElement).opacity : None,
        canvasRect: canvas ? canvas.getBoundingClientRect().toJSON() : None,
        fallbackDisplay: engine ? getComputedStyle(engine).display : None,
        fallbackVisibility: engine ? getComputedStyle(engine).visibility : None,
        fallbackOpacity: engine ? getComputedStyle(engine).opacity : None,
        status: status ? status.textContent : None,
        bodyHeight: document.documentElement.scrollHeight
      };
    }""")
    data["label"] = label
    events["states"].append(data)
    page.screenshot(path=str(OUT / f"{label}.png"), full_page=False)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1000}, device_scale_factor=1)
    page.on("console", lambda msg: events["console"].append({"type": msg.type, "text": msg.text}))
    page.on("pageerror", lambda err: events["page_errors"].append(str(err)))

    response = page.goto("http://127.0.0.1:4173/", wait_until="domcontentloaded")
    events["http_status"] = response.status if response else None
    page.wait_for_timeout(250)
    state(page, "00-load-0250ms")
    page.wait_for_timeout(1000)
    state(page, "01-load-1250ms")
    page.wait_for_timeout(2000)
    state(page, "02-load-3250ms")

    hero_range = page.evaluate("() => innerHeight * 1.55")
    for i, fraction in enumerate((0.18, 0.38, 0.58, 0.76, 0.94), start=3):
        page.evaluate("([y]) => scrollTo(0, y)", [hero_range * fraction])
        page.wait_for_timeout(900)
        state(page, f"{i:02d}-scroll-{int(fraction*100):02d}")

    page.evaluate("() => scrollTo(0, document.querySelector('#work').offsetTop - innerHeight * .25)")
    page.wait_for_timeout(900)
    state(page, "08-work")

    browser.close()

(OUT / "report.json").write_text(json.dumps(events, indent=2), encoding="utf-8")
print(json.dumps(events, indent=2))
