const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const failures=[];
async function check(name,run){try{await run();console.log('PASS',name)}catch(e){failures.push(name);console.log('FAIL',name,e.message)}}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:chromium.executablePath(),args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl']});
 const context=await browser.newContext({viewport:{width:320,height:568},isMobile:true,hasTouch:true});
 const page=await context.newPage();
 await page.addInitScript(()=>{
  const request=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window),pending=new Set();
  window.__frames={peak:0,pending};
  window.requestAnimationFrame=cb=>{const id=request(t=>{pending.delete(id);cb(t)});pending.add(id);window.__frames.peak=Math.max(window.__frames.peak,pending.size);return id};
  window.cancelAnimationFrame=id=>{pending.delete(id);cancel(id)};
 });
 await page.goto(process.env.BASE_URL||'http://127.0.0.1:8087/',{waitUntil:'networkidle'});
 await page.waitForTimeout(6500);
 await check('headline remains in two unbroken lines at 320px',async()=>{
  const lines=await page.locator('h1 .ln').evaluateAll(els=>els.map(el=>({width:el.clientWidth,scroll:el.scrollWidth,tops:[...el.querySelectorAll('.ch')].map(c=>Math.round(c.getBoundingClientRect().top))})));
  assert(lines.every(l=>l.scroll<=l.width+1 && new Set(l.tops).size<=1),JSON.stringify(lines));
 });
 await check('mobile navigation reaches every section',async()=>{
  const button=page.locator('#menu-toggle');
  assert.equal(await page.getByRole('button',{name:'Open menu',exact:true}).count(),1,'No mobile menu control');
  await button.tap();
  assert.equal(await button.getAttribute('aria-expanded'),'true');
  await page.locator('nav a[href="#agents"]').tap();
  assert.equal(await button.getAttribute('aria-expanded'),'false');
 });
 await check('anchor heading clears the fixed header',async()=>{
  await page.locator('.brand').tap();await page.waitForTimeout(250);
  await page.locator('.btn.ghost').tap();await page.waitForTimeout(1500);
  const h=await page.locator('#platforms h2').boundingBox(),header=await page.locator('header').boundingBox();
  assert(h.y>=header.y+header.height-1,JSON.stringify({h,header}));
 });
 await check('terminal typing does not shift subsequent content',async()=>{
  // A fresh page ensures the terminal has not entered the viewport or completed earlier.
  const ctx=await browser.newContext({viewport:{width:320,height:568},isMobile:true,hasTouch:true});const p=await ctx.newPage();
  await p.goto(process.env.BASE_URL||'http://127.0.0.1:8087/');await p.waitForTimeout(6000);
  const before=await p.locator('#term').evaluate(el=>el.offsetHeight);
  assert.equal(await p.locator('.terminal-typed').evaluateAll(els=>els.map(el=>el.textContent).join('')),'');
  await p.locator('#term').scrollIntoViewIfNeeded();await p.waitForTimeout(500);
  const during=await p.locator('.terminal-line').evaluateAll(els=>els.map(el=>({reserve:el.querySelector('.terminal-reserve').textContent.length,typed:el.querySelector('.terminal-typed').textContent.length})));
  assert(during.some(l=>l.typed>0)&&during.some(l=>l.typed<l.reserve),'Typing was not exercised');
  assert.equal(await p.locator('#term').evaluate(el=>el.offsetHeight),before);
  await p.waitForTimeout(13000);
  assert.equal(await p.locator('#term').evaluate(el=>el.offsetHeight),before);
  assert(await p.locator('.terminal-line').evaluateAll(els=>els.every(el=>el.querySelector('.terminal-typed').textContent===el.querySelector('.terminal-reserve').textContent)));
  await ctx.close();
 });
 await page.locator('.brand').tap();await page.waitForTimeout(1000);


 await context.close();
 await check('GPU scheduler keeps one frame chain and stops offscreen',async()=>{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await ctx.newPage();
  await p.addInitScript(()=>{
   const request=requestAnimationFrame.bind(window),cancel=cancelAnimationFrame.bind(window),pending=new Set();window.__pending=pending;
   window.requestAnimationFrame=cb=>{const id=request(t=>{pending.delete(id);cb(t)});pending.add(id);return id};window.cancelAnimationFrame=id=>{pending.delete(id);cancel(id)};
   const real=HTMLCanvasElement.prototype.getContext;
   // A stub GPU isolates scheduling because this VM currently has no WebGL context.
   window.__gpuDraws=0;const gl=new Proxy({drawArrays:()=>window.__gpuDraws++,drawingBufferWidth:200,drawingBufferHeight:440,getProgramParameter:()=>true,getShaderParameter:()=>true,getAttribLocation:()=>0,getUniformLocation:()=>({}),getShaderPrecisionFormat:()=>({precision:23}),isContextLost:()=>false}, {get:(o,k)=>k in o?o[k]:k===k.toUpperCase()?1:()=>({})});
   HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'?gl:real.call(this,type,...args)};
  });
  await p.goto(process.env.BASE_URL||'http://127.0.0.1:8087/');await p.waitForTimeout(6500);
  assert.equal(await p.evaluate(()=>__pending.size),1,'More than one GPU animation chain');
  await p.locator('#contact').scrollIntoViewIfNeeded();await p.waitForTimeout(300);
  const draws=await p.evaluate(()=>__gpuDraws);await p.waitForTimeout(300);
  assert.equal(await p.evaluate(()=>__gpuDraws),draws,'GPU loop did not stop offscreen');
  await ctx.close();
 });
 await check('headline fits when external fonts fail',async()=>{
  const ctx=await browser.newContext({viewport:{width:320,height:568},isMobile:true});const p=await ctx.newPage();
  await p.route('https://fonts.googleapis.com/**',route=>route.abort());await p.goto(process.env.BASE_URL||'http://127.0.0.1:8087/');await p.waitForTimeout(6000);
  const bad=await p.locator('h1 .ln').evaluateAll(els=>els.some(el=>el.scrollWidth>el.clientWidth+1 || new Set([...el.querySelectorAll('.ch')].map(c=>Math.round(c.getBoundingClientRect().top))).size>1));
  await ctx.close();assert.equal(bad,false);
 });
 await check('content is readable with JavaScript disabled',async()=>{
  const ctx=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844},isMobile:true});
  const p=await ctx.newPage();await p.goto(process.env.BASE_URL||'http://127.0.0.1:8087/');
  const hidden=await p.locator('.hf,.rv').evaluateAll(els=>els.filter(el=>getComputedStyle(el).opacity==='0').length);
  await ctx.close();assert.equal(hidden,0);
 });
 await check('scroll updates resume after a cached page return',async()=>{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true});const p=await ctx.newPage();
  await p.goto(process.env.BASE_URL||'http://127.0.0.1:8087/');await p.waitForTimeout(6500);
  const before=await p.locator('#bar').evaluate(el=>el.style.transform);
  await p.evaluate(()=>{dispatchEvent(new Event('scroll'));dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));scrollTo(0,1000)});
  await p.waitForTimeout(300);const after=await p.locator('#bar').evaluate(el=>el.style.transform);
  await ctx.close();assert.notEqual(after,before);
 });
 await check('failed optional WebGL cannot disable copy action',async()=>{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const p=await ctx.newPage();
  await p.addInitScript(()=>{
   const getContext=HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext=function(type,...rest){if(type==='webgl')throw new Error('GPU unavailable');return getContext.call(this,type,...rest)};
   navigator.clipboard.writeText=async()=>{window.__copied=true};
  });
  await p.goto(process.env.BASE_URL||'http://127.0.0.1:8087/');await p.waitForTimeout(6000);
  await p.locator('#copy').evaluate(el=>el.click());
  await p.waitForTimeout(100);
  assert.equal(await p.evaluate(()=>window.__copied),true);
  await ctx.close();
 });
 await check('unavailable motion-query API keeps navigation readable',async()=>{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true});const p=await ctx.newPage();
  await p.addInitScript(()=>{window.matchMedia=undefined});await p.goto(process.env.BASE_URL||'http://127.0.0.1:8087/');
  assert(await p.locator('nav').isVisible(),'Navigation is hidden when startup fails');await ctx.close();
 });
 await check('partial GPU setup failure releases resources and schedules no frames',async()=>{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true});const p=await ctx.newPage();
  await p.addInitScript(()=>{
   window.__gpuDraws=0;window.__released=0;window.__programCleanup=[];
   const real=HTMLCanvasElement.prototype.getContext;
   const gl=new Proxy({drawArrays:()=>window.__gpuDraws++,useProgram:p=>{if(p===null)window.__programCleanup.push('unbind')},deleteProgram:()=>{window.__programCleanup.push('delete');window.__released++},deleteBuffer:()=>window.__released++,getProgramParameter:()=>true,getShaderParameter:()=>true,getAttribLocation:()=>0,getUniformLocation:()=>({})},{get:(o,k)=>k in o?o[k]:k===k.toUpperCase()?1:()=>({})});
   HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'?gl:real.call(this,type,...args)};
   window.ResizeObserver=class{constructor(){throw new Error('Observer setup failed')}};
  });
  await p.goto(process.env.BASE_URL||'http://127.0.0.1:8087/');await p.waitForTimeout(6000);
  assert.equal(await p.evaluate(()=>__gpuDraws),0);assert.equal(await p.evaluate(()=>__released),2);assert.deepEqual(await p.evaluate(()=>__programCleanup),['unbind','delete']);assert(await p.locator('#menu-toggle').isVisible());await ctx.close();
 });
 await check('missing intersection observers leave all content visible',async()=>{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true});const p=await ctx.newPage();
  await p.addInitScript(()=>{window.IntersectionObserver=undefined});await p.goto(process.env.BASE_URL||'http://127.0.0.1:8087/');await p.waitForTimeout(6000);
  assert.equal(await p.locator('.rv').evaluateAll(els=>els.filter(el=>getComputedStyle(el).opacity==='0').length),0);
  assert.match(await p.locator('#term').textContent(),/Tests passing/);await ctx.close();
 });
 await check('denied clipboard gives usable manual-copy feedback',async()=>{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true});const p=await ctx.newPage();
  const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>{navigator.clipboard.writeText=async()=>{throw new Error('Denied')}});
  await p.goto(process.env.BASE_URL||'http://127.0.0.1:8087/');await p.waitForTimeout(6000);await p.locator('#copy').evaluate(el=>el.click());await p.waitForTimeout(100);
  assert.equal(await p.locator('#copy').textContent(),'Select the address above and copy it');assert.deepEqual(errors,[]);await ctx.close();
 });
 await check('touch on a desktop pointer layout does not move controls',async()=>{
  const ctx=await browser.newContext({viewport:{width:1440,height:900},hasTouch:true});const p=await ctx.newPage();
  await p.addInitScript(()=>{const real=matchMedia.bind(window);window.matchMedia=q=>{const query=real(q);if(q==='(hover:hover) and (pointer:fine)')Object.defineProperty(query,'matches',{value:true});return query}});
  await p.goto(process.env.BASE_URL||'http://127.0.0.1:8087/');await p.waitForTimeout(6000);
  assert(await p.evaluate(()=>matchMedia('(hover:hover) and (pointer:fine)').matches));
  await p.locator('.btn.main').evaluate(el=>el.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerType:'mouse',clientX:100,clientY:100})));
  assert.match(await p.locator('.btn.main').evaluate(el=>el.style.transform),/translate/);await p.locator('.btn.main').evaluate(el=>el.style.transform='');
  await p.locator('.btn.main').evaluate(el=>el.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerType:'touch',clientX:100,clientY:100})));
  assert.equal(await p.locator('.btn.main').evaluate(el=>el.style.transform),'');await ctx.close();
 });
 await browser.close();
 console.log(`${failures.length} failing checks`);process.exitCode=failures.length?1:0;
})().catch(e=>{console.error(e);process.exitCode=1});
