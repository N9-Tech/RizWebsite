const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 fs.mkdirSync('qa',{recursive:true});
 let total=0;
 for(const [engine,name] of [[chromium,'chromium'],[webkit,'webkit']]){
  if(process.env.BROWSER&&process.env.BROWSER!==name)continue;
  // Headed WebKit in this Linux harness can report resized window metrics without relayout.
  // Headless WebKit has a real WebGL context and correctly resizes its layout viewport.
  const browser=await engine.launch({headless:name==='webkit',executablePath:engine.executablePath(),args:name==='chromium'?['--use-gl=angle','--use-angle=gl','--ignore-gpu-blocklist']:[]});
  try{for(const [width,height] of name==='chromium'?[[320,568],[390,844],[412,915],[768,1024],[844,390],[1024,768],[1440,900]]:[[390,844],[844,390]]){
   const page=await browser.newPage({viewport:{width,height},isMobile:width<900,hasTouch:width<900});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{
    window.__draws=0;window.__links=[];const real=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){const gl=real.call(this,type,...args);if(type==='webgl'&&gl&&!gl.__wrapped){gl.__wrapped=true;const draw=gl.drawArrays.bind(gl),link=gl.linkProgram.bind(gl);gl.drawArrays=(...args)=>{window.__draws++;return draw(...args)};gl.linkProgram=(p)=>{link(p);window.__links.push({ok:gl.getProgramParameter(p,gl.LINK_STATUS),log:gl.getProgramInfoLog(p)})}}return gl};
   });
   await page.goto(process.env.BASE_URL||'http://127.0.0.1:8087/',{waitUntil:'networkidle'});
   await page.waitForFunction(()=>getComputedStyle(document.querySelector('.hf')).opacity==='1');
   const check=await page.evaluate(()=>({
    overflow:document.documentElement.scrollWidth>innerWidth,
    lines:[...document.querySelectorAll('h1 .ln')].map(el=>({w:el.clientWidth,s:el.scrollWidth,tops:new Set([...el.children].map(c=>Math.round(c.getBoundingClientRect().top))).size})),
    heroTop:document.querySelector('h1').getBoundingClientRect().top,headerBottom:document.querySelector('header').getBoundingClientRect().bottom,
    gl:!!document.querySelector('#gl').getContext('webgl'),draws:__draws,links:__links
   }));
   assert(!check.overflow,JSON.stringify(check));assert(check.lines.every(l=>l.s<=l.w+1&&l.tops===1),JSON.stringify(check));assert(check.heroTop>=check.headerBottom,JSON.stringify(check));
   assert(check.gl&&check.draws>0&&check.links.every(l=>l.ok),JSON.stringify(check));
   await page.screenshot({path:`qa/final-${name}-${width}-hero.png`});
   if(width<=860){
    for(const anchor of ['platforms','approach','agents']){
     await page.locator('#menu-toggle').click();await page.locator(`nav a[href="#${anchor}"]`).click();await page.waitForTimeout(200);
     const heading=await page.locator(`#${anchor} h2`).boundingBox(),header=await page.locator('header').boundingBox();assert(heading.y>=header.height-1,JSON.stringify({anchor,heading,header}));
     assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
    }
    await page.locator('#menu-toggle').click();await page.keyboard.press('Escape');assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
    await page.locator('#menu-toggle').click();await page.locator('.brand').click();assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
   }
   // Stop at each reveal target; rapid synthetic scroll jumps can skip a rendered viewport.
   for(const el of await page.locator('.rv').all()){
    await el.scrollIntoViewIfNeeded();
    await page.waitForFunction(el=>el.classList.contains('in'),await el.elementHandle(),{timeout:10000});
   }
   await page.waitForTimeout(1500);await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(200);await page.screenshot({path:`qa/final-${name}-${width}-full.png`,fullPage:true});
   assert.equal(await page.locator('.rv:not(.in)').count(),0);
   await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
   await page.waitForFunction(()=>document.querySelector('#gl').getBoundingClientRect().bottom<=0);await page.waitForTimeout(250);
   const draws=await page.evaluate(()=>__draws);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>__draws),draws,'GPU continued drawing offscreen');
   assert.deepEqual(errors,[]);
   console.log('PASS viewport',name,width,height,check.draws,'draws',check.links.length,'linked programs');total++;
   if(width===390){
    await page.locator('.brand').click();await page.waitForFunction(()=>scrollY===0&&document.querySelector('#gl').getBoundingClientRect().bottom>0);await page.waitForTimeout(200);
    await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);const still=await page.evaluate(()=>__draws);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>__draws),still);
    await page.setViewportSize({width:844,height:390});await page.waitForFunction(()=>document.documentElement.clientWidth===844);await page.waitForTimeout(200);const resized=await page.evaluate(()=>__draws);assert(resized>still);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>__draws),resized);
    await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(200);assert(await page.evaluate(()=>__draws)>resized);
    await page.evaluate(()=>{const gl=document.querySelector('#gl').getContext('webgl');window.__lose=gl.getExtension('WEBGL_lose_context');__lose.loseContext()});
    await page.waitForTimeout(200);assert.equal(await page.locator('#gl').evaluate(el=>el.style.opacity),'0');
    await page.evaluate(()=>__lose.restoreContext());await page.waitForTimeout(600);assert.equal(await page.locator('#gl').evaluate(el=>el.style.opacity),'');assert(await page.evaluate(()=>__links.length)>=2);
    assert.deepEqual(errors,[]);console.log('PASS lifecycle',name,'reduced-motion toggle, rotation, GPU context loss/restore');total++;
   }
   await page.close();
  }
  }finally{await browser.close()}
 }
 console.log('PASS',total,'browser scenarios');
})().catch(e=>{console.error(e);process.exitCode=1});
