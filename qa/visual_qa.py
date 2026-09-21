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
      const v=document.querySelector('video.hero-art');
      const art=document.querySelector('.hero-art-stage');
      const copy=document.querySelector('.hero-copy');
      const nav=document.querySelector('.navpanel');
      const toggle=document.querySelector('#nav-open');
      const root=getComputedStyle(document.documentElement);
      return {
        label:null,
        y:scrollY,width:innerWidth,height:innerHeight,dpr:devicePixelRatio,
        heroP:root.getPropertyValue('--hero-p').trim(),
        heroDive:root.getPropertyValue('--hero-dive').trim(),
        heroResolve:root.getPropertyValue('--hero-resolve').trim(),
        entered:document.documentElement.classList.contains('is-entered'),
        fontFamily:getComputedStyle(document.body).fontFamily,
        soraLoaded:document.fonts?document.fonts.check('16px Sora'):null,
        video:v?{
          paused:v.paused,currentTime:v.currentTime,readyState:v.readyState,networkState:v.networkState,
          muted:v.muted,loop:v.loop,playsInline:v.playsInline,
          currentSrc:v.currentSrc,transform:getComputedStyle(v).transform,
          rect:v.getBoundingClientRect().toJSON()
        }:null,
        artRect:art?art.getBoundingClientRect().toJSON():null,
        copyRect:copy?copy.getBoundingClientRect().toJSON():null,
        navOpen:toggle?toggle.checked:null,
        navOpacity:nav?getComputedStyle(nav).opacity:null,
        scrollHeight:document.documentElement.scrollHeight
      };
    }""")
    data["label"]=label
    events["states"].append(data)
    page.screenshot(path=str(OUT/f"{label}.png"),full_page=False)

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)

    page=browser.new_page(viewport={"width":1440,"height":1000},device_scale_factor=1)
    attach(page)
    resp=page.goto("http://127.0.0.1:4173/",wait_until="domcontentloaded")
    events["http_status"]=resp.status if resp else None
    page.wait_for_timeout(250); state(page,"d00-load-0250ms")
    page.wait_for_timeout(1000); state(page,"d01-load-1250ms")
    page.wait_for_timeout(2000); state(page,"d02-load-3250ms")
    hero_range=page.evaluate("() => innerHeight*1.55")
    for i,f in enumerate((.18,.38,.58,.76,.94),start=3):
        page.evaluate("y=>scrollTo(0,y)",hero_range*f)
        page.wait_for_timeout(700)
        state(page,f"d{i:02d}-scroll-{int(f*100):02d}")
    page.evaluate("() => scrollTo(0,document.querySelector('#work').offsetTop-innerHeight*.25)")
    page.wait_for_timeout(700); state(page,"d08-work")
    page.close()

    mobile=browser.new_page(viewport={"width":390,"height":844},device_scale_factor=3)
    attach(mobile)
    mobile.goto("http://127.0.0.1:4173/",wait_until="domcontentloaded")
    mobile.wait_for_timeout(950); state(mobile,"m00-load")
    mobile.locator("label.burger").click()
    mobile.wait_for_timeout(280); state(mobile,"m01-menu-open")
    mobile.locator("label.burger").click()
    mobile_range=mobile.evaluate("() => innerHeight*1.55")
    for i,f in enumerate((.58,.76,.94),start=2):
        mobile.evaluate("y=>scrollTo(0,y)",mobile_range*f)
        mobile.wait_for_timeout(700)
        state(mobile,f"m0{i}-scroll-{int(f*100):02d}")
    mobile.evaluate("() => scrollTo(0,document.querySelector('#work').offsetTop-innerHeight*.2)")
    mobile.wait_for_timeout(700); state(mobile,"m05-work")
    mobile.close()

    reduced=browser.new_page(viewport={"width":390,"height":844},device_scale_factor=2,reduced_motion="reduce")
    attach(reduced)
    reduced.goto("http://127.0.0.1:4173/",wait_until="domcontentloaded")
    reduced.wait_for_timeout(900); state(reduced,"r00-reduced-motion")
    reduced.close()

    browser.close()

(OUT/"report.json").write_text(json.dumps(events,indent=2),encoding="utf-8")
print(json.dumps(events,indent=2))
