const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));
const smoothstep=(min,max,v)=>{const t=clamp((v-min)/(max-min));return t*t*(3-2*t);};

const header=document.querySelector(".site-header");
const menuBtn=document.querySelector(".menu-button");
const menu=document.querySelector(".mobile-menu");
const status=document.querySelector(".scene-status span:last-child");
const fallbackEngine=document.querySelector(".preview-engine");
const glow=document.querySelector(".pointer-glow");

window.__rizMotion=window.__rizMotion||{heroProgress:0,scrollY:scrollY};

let headerScrolled=false;
function syncHeader(){
  const next=scrollY>40;
  if(next!==headerScrolled){
    headerScrolled=next;
    if(header)header.classList.toggle("is-scrolled",next);
  }
}
syncHeader();

if(menuBtn&&menu){
  const closeMenu=()=>{
    menu.classList.remove("open");
    document.body.classList.remove("menu-open");
    menuBtn.setAttribute("aria-expanded","false");
    menuBtn.textContent="☰";
    menu.querySelectorAll("a").forEach((a)=>a.tabIndex=-1);
  };
  menuBtn.addEventListener("click",()=>{
    const open=menu.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded",String(open));
    menuBtn.textContent=open?"×":"☰";
    document.body.classList.toggle("menu-open",open);
    menu.querySelectorAll("a").forEach((a)=>a.tabIndex=open?0:-1);
  });
  menu.querySelectorAll("a").forEach((a)=>a.addEventListener("click",closeMenu));
}

document.querySelectorAll(".stack-plane").forEach((button)=>{
  button.addEventListener("click",()=>{
    document.querySelectorAll(".stack-plane").forEach((item)=>item.classList.remove("active"));
    button.classList.add("active");
  });
});

const scenarios={
  "BUILD A PRODUCT":["> project:init","analysing requirements...","architecture selected","tasks decomposed","implementation running","","✓ validation","✓ error paths","✓ async flow","✓ deployment config","","status: ready to ship"],
  "AUTOMATE A WORKFLOW":["> workflow:map","observing repeated actions...","inputs normalised","failure states mapped","queue policy applied","","✓ retries bounded","✓ stale state guarded","✓ status visible","","status: automation ready"],
  "DEPLOY A SERVICE":["> deploy:prepare","checking revision...","environment loaded","health checks armed","release running","","✓ proxy config","✓ service healthy","✓ rollback path ready","","status: production / healthy"]
};
const output=document.querySelector("#console-output");
function renderConsole(mode){
  if(!output||!scenarios[mode])return;
  output.replaceChildren();
  scenarios[mode].forEach((line)=>{
    const span=document.createElement("span");
    span.textContent=line||" ";
    if(line.startsWith("✓"))span.className="ok";
    if(line.startsWith("status"))span.className="status";
    output.appendChild(span);
  });
  document.querySelectorAll("[data-mode]").forEach((button)=>button.classList.toggle("active",button.dataset.mode===mode));
}
if(output){
  renderConsole("BUILD A PRODUCT");
  document.querySelectorAll("[data-mode]").forEach((button)=>button.addEventListener("click",()=>renderConsole(button.dataset.mode)));
}

const revealTargets=document.querySelectorAll(
  ".section-label,.cap-intro,.cap-row,.work-heading,.project-item,.workflow-head,.workflow-stage,.stack-grid,.stack-plane,.console,.principles>h2,.principle-list article,.about-grid,.contact-cta>h2,.contact-cta>p"
);
if("IntersectionObserver" in window){
  revealTargets.forEach((el)=>el.classList.add("reveal-on-scroll"));
  const revealObserver=new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
      if(entry.isIntersecting){
        entry.target.classList.add("is-in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },{rootMargin:"0px 0px -8% 0px",threshold:.06});
  revealTargets.forEach((el)=>revealObserver.observe(el));
}

const parallaxItems=[...document.querySelectorAll(".project-visual img")].map((img)=>({
  img,
  parent:img.closest(".project-visual"),
  top:0,
  height:0,
  visible:false
})).filter((item)=>item.parent);

function refreshParallaxMetrics(){
  parallaxItems.forEach((item)=>{
    const rect=item.parent.getBoundingClientRect();
    item.top=rect.top+scrollY;
    item.height=rect.height;
  });
}
refreshParallaxMetrics();

if("IntersectionObserver" in window){
  const mediaObserver=new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
      const item=parallaxItems.find((candidate)=>candidate.parent===entry.target);
      if(!item)return;
      item.visible=entry.isIntersecting;
      item.parent.classList.toggle("is-parallax-active",entry.isIntersecting);
    });
  },{rootMargin:"25% 0px 25% 0px",threshold:0});
  parallaxItems.forEach((item)=>mediaObserver.observe(item.parent));
}else{
  parallaxItems.forEach((item)=>{item.visible=true;item.parent.classList.add("is-parallax-active");});
}

let targetScroll=scrollY;
let smoothScroll=scrollY;
let lastScrollAt=performance.now();
let motionRaf=0;
let lastHeroP=-1;
let lastPageP=-1;
let lastPhase="";

function updateStatus(progress){
  if(!status)return;
  let phase="DORMANT";
  if(progress>=.18&&progress<.35)phase="OPENING";
  else if(progress>=.35&&progress<.52)phase="SEPARATING";
  else if(progress>=.52&&progress<.68)phase="INSPECT";
  else if(progress>=.68&&progress<.86)phase="DIVE";
  else if(progress>=.86)phase="RESOLVED";
  if(phase!==lastPhase){
    lastPhase=phase;
    status.textContent="STATE / "+phase;
  }
}

function scheduleMotion(){
  if(!motionRaf)motionRaf=requestAnimationFrame(updateMotion);
}

function updateMotion(){
  motionRaf=0;
  const now=performance.now();
  smoothScroll+=(targetScroll-smoothScroll)*.14;
  if(Math.abs(targetScroll-smoothScroll)<.15)smoothScroll=targetScroll;

  const viewH=innerHeight;
  const heroRange=Math.max(1,viewH*1.55);
  const p=clamp(smoothScroll/heroRange);
  const exit=smoothstep(.28,.92,p);
  const dive=smoothstep(.48,.84,p);
  const resolve=smoothstep(.84,1,p);
  const pageMax=Math.max(1,document.documentElement.scrollHeight-viewH);
  const pageProgress=clamp(smoothScroll/pageMax);

  window.__rizMotion.heroProgress=p;
  window.__rizMotion.scrollY=smoothScroll;

  if(Math.abs(p-lastHeroP)>.0008){
    document.documentElement.style.setProperty("--hero-p",p.toFixed(4));
    document.documentElement.style.setProperty("--hero-exit",exit.toFixed(4));
    document.documentElement.style.setProperty("--hero-dive",dive.toFixed(4));
    document.documentElement.style.setProperty("--hero-resolve",resolve.toFixed(4));
    lastHeroP=p;
    updateStatus(p);

    if(fallbackEngine&&!document.documentElement.classList.contains("webgl-ready")){
      const scale=1+p*.52-resolve*.2;
      fallbackEngine.style.transform="translateY(-48%) rotateY("+(12+p*42)+"deg) rotateX("+(p*8)+"deg) scale("+scale+")";
      fallbackEngine.style.filter="brightness("+(1+p*.2)+") saturate("+(1+p*.24)+")";
    }
  }
  if(Math.abs(pageProgress-lastPageP)>.0015){
    document.documentElement.style.setProperty("--page-progress",pageProgress.toFixed(4));
    lastPageP=pageProgress;
  }

  for(const item of parallaxItems){
    if(!item.visible)continue;
    const rectTop=item.top-smoothScroll;
    const local=clamp((viewH-rectTop)/(viewH+item.height));
    const offset=(local-.5)*-34;
    const scale=1.045+Math.abs(local-.5)*.012;
    item.img.style.setProperty("--media-y",offset.toFixed(1)+"px");
    item.img.style.setProperty("--media-scale",scale.toFixed(4));
  }

  const settling=Math.abs(targetScroll-smoothScroll)>.15 || now-lastScrollAt<90;
  if(settling)scheduleMotion();
}

function onScroll(){
  targetScroll=scrollY;
  lastScrollAt=performance.now();
  syncHeader();
  scheduleMotion();
}
addEventListener("scroll",onScroll,{passive:true});

let resizeTimer=0;
addEventListener("resize",()=>{
  clearTimeout(resizeTimer);
  resizeTimer=setTimeout(()=>{
    targetScroll=scrollY;
    smoothScroll=scrollY;
    refreshParallaxMetrics();
    scheduleMotion();
  },120);
},{passive:true});

parallaxItems.forEach((item)=>item.img.addEventListener("load",refreshParallaxMetrics,{once:true}));
scheduleMotion();

let pointerX=0,pointerY=0,pointerRaf=0;
addEventListener("pointermove",(event)=>{
  if(event.pointerType==="touch"||!glow)return;
  pointerX=event.clientX;
  pointerY=event.clientY;
  if(!pointerRaf){
    pointerRaf=requestAnimationFrame(()=>{
      pointerRaf=0;
      glow.style.transform="translate3d("+pointerX+"px,"+pointerY+"px,0) translate(-50%,-50%)";
    });
  }
},{passive:true});