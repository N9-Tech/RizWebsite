from pathlib import Path
import json
from playwright.sync_api import sync_playwright

OUT=Path("qa_artifacts")
OUT.mkdir(exist_ok=True)
events={"console":[],"page_errors":[],"request_failures":[],"states":[]}

def attach(page):
    page.on("console",lambda m: events["console"].append({"type":m.type,"text":m.text}))
    page.on("pageerror",lambda e: events["page_errors"].append(str(e)))
    page.on("requestfailed",lambda req: events["request_failures"].append({"url":req.url,"error":req.failure}))

def state(page,label):
    data=page.evaluate("""() => {
      const c=document.querySelector('#hero-webgl');
      const art=document.querySelector('.hero-art-stage');
      const copy=document.querySelector('.hero-copy');
      const nav=document.querySelector('.navpanel');
      const toggle=document.querySelector('#nav-open');
      const css=getComputedStyle(document.documentElement);
      let glInfo=null;
      if(c){
        const gl=c.getContext('webgl');
        if(gl){
          const ext=gl.getExtension('WEBGL_debug_renderer_info');
          glInfo={
            renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),
            vendor:ext?gl.getParameter(ext.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR)
          };
        }
      }
      return {
        y:scrollY,width:innerWidth,height:innerHeight,dpr:devicePixelRatio,
        heroP:css.getPropertyValue('--hero-p').trim(),
        heroDive:css.getPropertyValue('--hero-dive').trim(),
        heroResolve:css.getPropertyValue('--hero-resolve').trim(),
        entered:document.documentElement.classList.contains('is-entered'),
        webglReady:document.documentElement.classList.contains('webgl-art-ready'),
        webglFallback:document.documentElement.classList.contains('webgl-art-fallback'),
        canvas:c?{
          width:c.width,height:c.height,
          rect:c.getBoundingClientRect().toJSON(),
          transform:getComputedStyle(c).transform
        }:null,
        glInfo,
        artRect:art?art.getBoundingClientRect().toJSON():null,
        copyRect:copy?copy.getBoundingClientRect().toJSON():null,
        navOpen:toggle?toggle.checked:null,
        navOpacity:nav?getComputedStyle(nav).opacity:null,
        fontFamily:getComputedStyle(document.body).fontFamily,
        soraLoaded:document.fonts?document.fonts.check('16px Sora'):null,
        scrollHeight:document.documentElement.scrollHeight,
        videos:document.querySelectorAll('video').length
      };
    }""")
    data["label"]=label
    events["states"].append(data)
    page.screenshot(path=str(OUT/f"{label}.png"),full_page=False)

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=["--use-gl=angle","--use-angle=swiftshader"])

    page=browser.new_page(viewport={"width":1440,"height":1000},device_scale_factor=1)
    attach(page)
    resp=page.goto("http://127.0.0.1:4173/",wait_until="domcontentloaded")
    events["http_status"]=resp.status if resp else None
    page.wait_for_timeout(250);state(page,"d00-load-0250ms")
    page.wait_for_timeout(1000);state(page,"d01-load-1250ms")
    page.wait_for_timeout(1800);state(page,"d02-load-3050ms")
    hero_range=page.evaluate("() => innerHeight*1.55")
    for i,f in enumerate((.18,.38,.58,.76,.94),start=3):
        page.evaluate("y=>scrollTo(0,y)",hero_range*f)
        page.wait_for_timeout(650)
        state(page,f"d{i:02d}-scroll-{int(f*100):02d}")
    page.evaluate("() => scrollTo(0,document.querySelector('#work').offsetTop-innerHeight*.25)")
    page.wait_for_timeout(700);state(page,"d08-work")
    page.close()

    mobile=browser.new_page(viewport={"width":390,"height":844},device_scale_factor=3)
    attach(mobile)
    mobile.goto("http://127.0.0.1:4173/",wait_until="domcontentloaded")
    mobile.wait_for_timeout(850);state(mobile,"m00-load")
    mobile.locator("label.burger").click()
    mobile.wait_for_timeout(260);state(mobile,"m01-menu-open")
    mobile.locator("label.burger").click()
    mobile_range=mobile.evaluate("() => innerHeight*1.55")
    for i,f in enumerate((.58,.76,.94),start=2):
        mobile.evaluate("y=>scrollTo(0,y)",mobile_range*f)
        mobile.wait_for_timeout(650)
        state(mobile,f"m0{i}-scroll-{int(f*100):02d}")
    mobile.close()

    reduced=browser.new_page(viewport={"width":390,"height":844},device_scale_factor=2,reduced_motion="reduce")
    attach(reduced)
    reduced.goto("http://127.0.0.1:4173/",wait_until="domcontentloaded")
    reduced.wait_for_timeout(850);state(reduced,"r00-reduced-motion")
    reduced.wait_for_timeout(900);state(reduced,"r01-reduced-motion-later")
    reduced.close()

    browser.close()

(OUT/"report.json").write_text(json.dumps(events,indent=2),encoding="utf-8")
print(json.dumps(events,indent=2))
