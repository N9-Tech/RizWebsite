from pathlib import Path
import json,statistics
from playwright.sync_api import sync_playwright

OUT=Path("perf_artifacts");OUT.mkdir(exist_ok=True)

def percentile(values,p):
    if not values:return 0
    s=sorted(values);k=(len(s)-1)*p;f=int(k);c=min(f+1,len(s)-1)
    return s[f] if f==c else s[f]+(s[c]-s[f])*(k-f)

def run_case(browser,name,viewport,dpr):
    page=browser.new_page(viewport=viewport,device_scale_factor=dpr)
    errors=[];warnings=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.on("console",lambda m:warnings.append({"type":m.type,"text":m.text}) if m.type in ("warning","error") else None)
    page.add_init_script("""window.__longTasks=[];new PerformanceObserver(l=>{for(const e of l.getEntries())window.__longTasks.push({duration:e.duration})}).observe({entryTypes:['longtask']});""")
    client=page.context.new_cdp_session(page);client.send("Performance.enable")
    page.goto("http://127.0.0.1:4173/",wait_until="domcontentloaded")
    page.wait_for_timeout(1200)
    before={m["name"]:m["value"] for m in client.send("Performance.getMetrics")["metrics"]}
    frames=page.evaluate("""async()=>{const a=[];let last=performance.now();const max=Math.min(document.documentElement.scrollHeight-innerHeight,innerHeight*7),dur=5200,start=performance.now();return await new Promise(resolve=>{function step(now){a.push(now-last);last=now;const t=Math.min(1,(now-start)/dur),e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;scrollTo(0,max*e);if(t<1)requestAnimationFrame(step);else setTimeout(()=>resolve(a),350)}requestAnimationFrame(step)})}""")
    after={m["name"]:m["value"] for m in client.send("Performance.getMetrics")["metrics"]}
    longs=page.evaluate("window.__longTasks")
    intervals=[x for x in frames[2:] if x<1000]
    state=page.evaluate("""()=>{const c=document.querySelector('#hero-webgl');return {
      scrollY,width:innerWidth,height:innerHeight,dpr:devicePixelRatio,
      heroP:getComputedStyle(document.documentElement).getPropertyValue('--hero-p').trim(),
      webglReady:document.documentElement.classList.contains('webgl-art-ready'),
      canvasWidth:c?.width,canvasHeight:c?.height,
      fontOk:document.fonts?.check('16px Sora'),
      videoCount:document.querySelectorAll('video').length
    }}""")
    page.screenshot(path=str(OUT/f"{name}-end.png"))
    report={
      "name":name,"state":state,"page_errors":errors,"console_warnings":warnings,
      "frames":len(intervals),
      "avg_frame_ms":round(statistics.mean(intervals),2) if intervals else 0,
      "p95_frame_ms":round(percentile(intervals,.95),2),"p99_frame_ms":round(percentile(intervals,.99),2),
      "frames_over_20ms":sum(x>20 for x in intervals),"frames_over_32ms":sum(x>32 for x in intervals),
      "long_task_count":len(longs),"long_task_total_ms":round(sum(x["duration"] for x in longs),2),
      "long_task_max_ms":round(max([x["duration"] for x in longs],default=0),2),
      "metrics_delta":{k:round(after.get(k,0)-before.get(k,0),4) for k in ["ScriptDuration","LayoutDuration","RecalcStyleDuration","TaskDuration","LayoutCount","RecalcStyleCount","JSHeapUsedSize"]}
    }
    page.close();return report

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=["--use-gl=angle","--use-angle=swiftshader"])
    reports=[
      run_case(browser,"desktop-1440",{"width":1440,"height":1000},1),
      run_case(browser,"mobile-390",{"width":390,"height":844},3)
    ]
    browser.close()

(OUT/"report.json").write_text(json.dumps(reports,indent=2),encoding="utf-8")
print(json.dumps(reports,indent=2))
