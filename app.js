const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));
const smoothstep=(min,max,v)=>{const t=clamp((v-min)/(max-min));return t*t*(3-2*t);};

const header=document.querySelector(".site-header");
const menuBtn=document.querySelector(".menu-button");
const menu=document.querySelector(".mobile-menu");
const status=document.querySelector(".scene-status span:last-child");
const fallbackEngine=document.querySelector(".preview-engine");
const glow=document.querySelector(".pointer-glow");

function syncHeader(){if(header)header.classList.toggle("is-scrolled",scrollY>40);}
addEventListener("scroll",syncHeader,{passive:true});
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
  const observer=new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
      if(entry.isIntersecting){
        entry.target.classList.add("is-in-view");
        observer.unobserve(entry.target);
      }
    });
  },{rootMargin:"0px 0px -9% 0px",threshold:.08});
  revealTargets.forEach((el)=>observer.observe(el));
}

const projectImages=[...document.querySelectorAll(".project-visual img")];
let targetScroll=scrollY;
let smoothScroll=scrollY;
let lastWidth=innerWidth;
let lastHeight=innerHeight;

function updateTarget(){targetScroll=scrollY;}
addEventListener("scroll",updateTarget,{passive:true});
addEventListener("resize",()=>{lastWidth=innerWidth;lastHeight=innerHeight;},{passive:true});

function updateStatus(progress){
  if(!status)return;
  let phase="DORMANT";
  if(progress>=.18&&progress<.35)phase="OPENING";
  else if(progress>=.35&&progress<.52)phase="SEPARATING";
  else if(progress>=.52&&progress<.68)phase="INSPECT";
  else if(progress>=.68&&progress<.86)phase="DIVE";
  else if(progress>=.86)phase="RESOLVED";
  status.textContent="STATE / "+phase;
}

function frame(){
  smoothScroll+=(targetScroll-smoothScroll)*.085;
  const heroRange=Math.max(1,lastHeight*1.55);
  const p=clamp(smoothScroll/heroRange);
  const exit=smoothstep(.28,.92,p);
  const dive=smoothstep(.48,.84,p);
  const resolve=smoothstep(.84,1,p);
  const pageMax=Math.max(1,document.documentElement.scrollHeight-lastHeight);
  const pageProgress=clamp(smoothScroll/pageMax);

  document.documentElement.style.setProperty("--hero-p",p.toFixed(4));
  document.documentElement.style.setProperty("--hero-exit",exit.toFixed(4));
  document.documentElement.style.setProperty("--hero-dive",dive.toFixed(4));
  document.documentElement.style.setProperty("--hero-resolve",resolve.toFixed(4));
  document.documentElement.style.setProperty("--page-progress",pageProgress.toFixed(4));
  updateStatus(p);

  if(fallbackEngine&&!document.documentElement.classList.contains("webgl-ready")){
    const scale=1+p*.62-resolve*.18;
    const rotate=12+p*48;
    fallbackEngine.style.transform="translateY(-48%) translateZ(0) rotateY("+rotate+"deg) rotateX("+(p*10)+"deg) scale("+scale+")";
    fallbackEngine.style.filter="brightness("+(1+p*.28)+") saturate("+(1+p*.35)+")";
  }

  projectImages.forEach((img)=>{
    const parent=img.closest(".project-visual");
    if(!parent)return;
    const rect=parent.getBoundingClientRect();
    if(rect.bottom<0||rect.top>lastHeight)return;
    const local=clamp((lastHeight-rect.top)/(lastHeight+rect.height));
    const offset=(local-.5)*-46;
    const scale=1.055+Math.abs(local-.5)*.018;
    img.style.setProperty("--media-y",offset.toFixed(2)+"px");
    img.style.setProperty("--media-scale",scale.toFixed(4));
  });

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

addEventListener("pointermove",(event)=>{
  if(event.pointerType==="touch")return;
  if(glow)glow.style.transform="translate3d("+event.clientX+"px,"+event.clientY+"px,0) translate(-50%,-50%)";
},{passive:true});