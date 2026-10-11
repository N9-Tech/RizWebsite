const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 for(const [engine,name] of [[chromium,'chromium'],[webkit,'webkit']]){
  const browser=await engine.launch({headless:name==='webkit',args:name==='chromium'?['--use-gl=angle','--use-angle=gl','--ignore-gpu-blocklist']:[]});
  try{
   const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'no-preference'});
   await page.addInitScript(()=>{
    window.__background={frames:[],precision:null,capture:false};let previous;
    const real=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){const gl=real.call(this,type,...args);if(type==='webgl'&&gl&&!gl.__tested){gl.__tested=true;const draw=gl.drawArrays.bind(gl);
     const med=gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER,gl.MEDIUM_FLOAT),high=gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER,gl.HIGH_FLOAT);
     __background.precision={medium:{rangeMin:med.rangeMin,rangeMax:med.rangeMax,precision:med.precision},high:{rangeMin:high.rangeMin,rangeMax:high.rangeMax,precision:high.precision}};
     // Sample inside drawArrays: default framebuffer contents may be cleared afterwards.
     gl.drawArrays=(...a)=>{draw(...a);const time=performance.now()/1000,frames=__background.frames;if(!__background.capture||frames.length===2||frames.length===1&&time-frames[0].time<2)return;
      const width=gl.drawingBufferWidth,height=gl.drawingBufferHeight,pixels=new Uint8Array(width*height*4);gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
      let lo=255,hi=0,bright=0,changed=0,difference=0;const colors=new Set();
      // Grain alone changes at most about 18 summed RGB levels, including rounding.
      for(let i=0;i<pixels.length;i+=4){const light=Math.max(pixels[i],pixels[i+1],pixels[i+2]);lo=Math.min(lo,light);hi=Math.max(hi,light);if(light>40)bright++;colors.add((pixels[i]<<16)|(pixels[i+1]<<8)|pixels[i+2]);if(previous){const delta=Math.abs(pixels[i]-previous[i])+Math.abs(pixels[i+1]-previous[i+1])+Math.abs(pixels[i+2]-previous[i+2]);if(delta>24)changed++;difference+=delta}}
      frames.push({time,width,height,lo,hi,brightFraction:bright/(width*height),colors:colors.size,changedFraction:previous?changed/(width*height):null,meanDifference:previous?difference/(width*height*3):null});previous=pixels;
     };
    }return gl};
   });
   await page.goto(process.env.BASE_URL||'http://127.0.0.1:8087/',{waitUntil:'networkidle'});
   await page.waitForFunction(()=>Number(getComputedStyle(document.querySelector('.hf')).opacity)===1,{},{timeout:15000});
   assert(await page.evaluate(()=>{const c=document.querySelector('canvas'),s=getComputedStyle(c);return Number(s.opacity)>0&&s.visibility==='visible'&&s.display!=='none'&&c.getBoundingClientRect().width>0}),'Background canvas is hidden');
   await page.evaluate(()=>{__background.capture=true});
   await page.waitForFunction(()=>window.__background.frames.length===2,{},{timeout:15000});
   const result=await page.evaluate(()=>__background);console.log(name,JSON.stringify(result));
   assert(result.frames[0].width===result.frames[1].width&&result.frames[0].height===result.frames[1].height,'Drawing buffer resized between sampled frames');
   assert(result.frames.every(f=>f.hi-f.lo>40&&f.brightFraction>.02&&f.colors>100),'Background is blank or visually flat');
   assert(result.frames[1].changedFraction>.01&&result.frames[1].meanDifference>1,'Background light does not visibly animate beyond grain');
   await page.close();
  }finally{await browser.close()}
 }
 console.log('PASS visible animated background pixels in both mobile browser contexts');
})().catch(e=>{console.error(e);process.exitCode=1});
