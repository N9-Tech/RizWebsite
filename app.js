const header=document.querySelector(".site-header");
const menuBtn=document.querySelector(".menu-button");
const menu=document.querySelector(".mobile-menu");
function syncHeader(){if(header)header.classList.toggle("is-scrolled",scrollY>40);}
addEventListener("scroll",syncHeader,{passive:true});syncHeader();
if(menuBtn&&menu){
  const closeMenu=()=>{menu.classList.remove("open");document.body.classList.remove("menu-open");menuBtn.setAttribute("aria-expanded","false");menuBtn.textContent="☰";menu.querySelectorAll("a").forEach((a)=>a.tabIndex=-1);};
  menuBtn.addEventListener("click",()=>{const open=menu.classList.toggle("open");menuBtn.setAttribute("aria-expanded",String(open));menuBtn.textContent=open?"×":"☰";document.body.classList.toggle("menu-open",open);menu.querySelectorAll("a").forEach((a)=>a.tabIndex=open?0:-1);});
  menu.querySelectorAll("a").forEach((a)=>a.addEventListener("click",closeMenu));
}
document.querySelectorAll(".stack-plane").forEach((button)=>{button.addEventListener("click",()=>{document.querySelectorAll(".stack-plane").forEach((item)=>item.classList.remove("active"));button.classList.add("active");});});
const scenarios={
"BUILD A PRODUCT":["> project:init","analysing requirements...","architecture selected","tasks decomposed","implementation running","","✓ validation","✓ error paths","✓ async flow","✓ deployment config","","status: ready to ship"],
"AUTOMATE A WORKFLOW":["> workflow:map","observing repeated actions...","inputs normalised","failure states mapped","queue policy applied","","✓ retries bounded","✓ stale state guarded","✓ status visible","","status: automation ready"],
"DEPLOY A SERVICE":["> deploy:prepare","checking revision...","environment loaded","health checks armed","release running","","✓ proxy config","✓ service healthy","✓ rollback path ready","","status: production / healthy"]};
const output=document.querySelector("#console-output");
function renderConsole(mode){if(!output||!scenarios[mode])return;output.replaceChildren();scenarios[mode].forEach((line)=>{const span=document.createElement("span");span.textContent=line||" ";if(line.startsWith("✓"))span.className="ok";if(line.startsWith("status"))span.className="status";output.appendChild(span);});document.querySelectorAll("[data-mode]").forEach((button)=>button.classList.toggle("active",button.dataset.mode===mode));}
if(output){renderConsole("BUILD A PRODUCT");document.querySelectorAll("[data-mode]").forEach((button)=>button.addEventListener("click",()=>renderConsole(button.dataset.mode)));}
const fallbackEngine=document.querySelector(".preview-engine");
const glow=document.querySelector(".pointer-glow");
const status=document.querySelector(".scene-status span:last-child");
function updateCinematicFallback(){const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);const p=Math.min(1,scrollY/max);document.documentElement.style.setProperty("--page-progress",String(p));if(fallbackEngine&&!document.documentElement.classList.contains("webgl-ready")){const heroP=Math.min(1,scrollY/(innerHeight*1.35));fallbackEngine.style.transform="translateY(calc(-48% - "+(heroP*6)+"px)) rotateY("+(heroP*9)+"deg) rotateX("+(heroP*2)+"deg) scale("+(1+heroP*.035)+")";fallbackEngine.style.filter="brightness("+(1+heroP*.08)+") saturate("+(1+heroP*.12)+")";}if(status){const phase=scrollY<innerHeight*.2?"DORMANT":scrollY<innerHeight*.65?"OPEN":scrollY<innerHeight*1.4?"INSPECT":"BUILD";status.textContent="STATE / "+phase;}}
addEventListener("scroll",updateCinematicFallback,{passive:true});updateCinematicFallback();
addEventListener("pointermove",(event)=>{if(event.pointerType==="touch")return;if(glow)glow.style.transform="translate3d("+event.clientX+"px,"+event.clientY+"px,0) translate(-50%,-50%)";if(fallbackEngine&&!document.documentElement.classList.contains("webgl-ready")&&scrollY<innerHeight*1.2){const x=(event.clientX/innerWidth-.5)*5;const y=(event.clientY/innerHeight-.5)*-4;fallbackEngine.style.setProperty("--mx",x+"deg");fallbackEngine.style.setProperty("--my",y+"deg");}},{passive:true});