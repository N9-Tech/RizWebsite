import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.module.js";

const ACCENT=new THREE.Color("#9df5cf");
const HOT=new THREE.Color("#d9ff5f");
const canvas=document.querySelector("#scene-canvas");
const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;

function webglAvailable(){
  try{
    const test=document.createElement("canvas");
    return Boolean(test.getContext("webgl2")||test.getContext("webgl"));
  }catch{return false;}
}

if(!canvas||reducedMotion||!webglAvailable()){
  document.documentElement.classList.add("webgl-fallback");
}else{
  try{
    startScene(canvas);
    document.documentElement.classList.add("webgl-ready");
  }catch(error){
    console.warn("Three.js scene unavailable; using CSS fallback.",error);
    document.documentElement.classList.add("webgl-fallback");
  }
}

function startScene(canvas){
  const compact=matchMedia("(max-width: 700px)").matches;
  const saveData=Boolean(navigator.connection&&navigator.connection.saveData);
  const lowPower=saveData||(navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=4;
  const quality=compact?"low":lowPower||innerWidth<1200?"medium":"high";
  const maxPixelRatio=quality==="high"?1.5:quality==="medium"?1.2:1;
  const targetFps=quality==="low"?30:quality==="medium"?45:60;
  const frameInterval=1000/targetFps;

  const renderer=new THREE.WebGLRenderer({
    canvas,
    antialias:quality==="high",
    alpha:true,
    powerPreference:"high-performance",
    stencil:false
  });
  renderer.setClearColor(0x050607,0);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.08;
  renderer.outputColorSpace=THREE.SRGBColorSpace;

  const scene=new THREE.Scene();
  scene.fog=new THREE.Fog("#050607",5.8,14);

  const camera=new THREE.PerspectiveCamera(40,1,.08,100);
  camera.position.set(0,.04,6.35);

  const root=new THREE.Group();
  scene.add(root);

  scene.add(new THREE.AmbientLight("#ffffff",.16));
  const keyLight=new THREE.PointLight("#c8fce5",3.1,11,2);
  keyLight.position.set(2.3,2.6,3.4);
  scene.add(keyLight);
  const rimLight=new THREE.PointLight("#5caa91",1.25,10,2);
  rimLight.position.set(-3.2,-1.1,1.4);
  scene.add(rimLight);
  const topLight=new THREE.DirectionalLight("#d8fff0",.38);
  topLight.position.set(0,4,-2);
  scene.add(topLight);

  const inner=new THREE.Mesh(
    new THREE.IcosahedronGeometry(.63,quality==="high"?3:2),
    new THREE.MeshStandardMaterial({
      color:"#b8ffe1",
      emissive:"#65e6b3",
      emissiveIntensity:2.55,
      roughness:.16,
      metalness:.08,
      toneMapped:false
    })
  );
  root.add(inner);

  const shellGeometry=new THREE.IcosahedronGeometry(.71,2);
  const shell=new THREE.Mesh(
    shellGeometry,
    new THREE.MeshPhysicalMaterial({
      color:"#0c1212",
      transparent:true,
      opacity:.69,
      metalness:.82,
      roughness:.18,
      clearcoat:.8,
      clearcoatRoughness:.18
    })
  );
  shell.scale.setScalar(1.12);
  root.add(shell);
  const shellEdges=edgesFor(shellGeometry,"#8fd8bb",.68);
  shellEdges.scale.setScalar(1.12);
  root.add(shellEdges);

  const auraMaterial=new THREE.ShaderMaterial({
    uniforms:{
      uTime:{value:0},
      uIntensity:{value:0},
      uColor:{value:ACCENT.clone()}
    },
    vertexShader:[
      "varying vec3 vNormalW;",
      "varying vec3 vWorld;",
      "void main(){",
      "vNormalW=normalize(mat3(modelMatrix)*normal);",
      "vec4 world=modelMatrix*vec4(position,1.0);",
      "vWorld=world.xyz;",
      "gl_Position=projectionMatrix*viewMatrix*world;",
      "}"
    ].join("\n"),
    fragmentShader:[
      "uniform float uTime;",
      "uniform float uIntensity;",
      "uniform vec3 uColor;",
      "varying vec3 vNormalW;",
      "varying vec3 vWorld;",
      "void main(){",
      "vec3 viewDir=normalize(cameraPosition-vWorld);",
      "float fresnel=pow(1.0-max(dot(normalize(vNormalW),viewDir),0.0),2.05);",
      "float pulse=0.84+sin(uTime*1.55)*0.12;",
      "float alpha=fresnel*(0.25+uIntensity*0.34)*pulse;",
      "vec3 color=uColor*(0.78+fresnel*1.8)*(0.86+uIntensity*0.4);",
      "gl_FragColor=vec4(color,alpha);",
      "}"
    ].join("\n"),
    transparent:true,
    depthWrite:false,
    blending:THREE.AdditiveBlending,
    toneMapped:false
  });
  const aura=new THREE.Mesh(new THREE.IcosahedronGeometry(.72,quality==="low"?2:3),auraMaterial);
  aura.scale.setScalar(1.44);
  root.add(aura);

  const coreLight=new THREE.PointLight("#8ff3c9",3.1,5.8,2);
  root.add(coreLight);

  const strutData=[
    {p:[-1.08,.68,0],s:[.10,2.5,.12],r:.18,e:[-.78,.36,.28]},
    {p:[1.06,-.24,.08],s:[.10,2.72,.12],r:-.12,e:[.82,-.31,-.2]},
    {p:[.14,1.08,-.14],s:[2.38,.10,.12],r:.07,e:[.28,.78,-.24]},
    {p:[-.2,-1.04,.18],s:[2.72,.10,.12],r:-.08,e:[-.28,-.76,.31]},
    {p:[-.73,.02,-.56],s:[.08,1.72,.08],r:.72,e:[-.58,.14,-.58]},
    {p:[.77,.08,-.5],s:[.08,1.55,.08],r:-.72,e:[.59,-.08,-.54]}
  ];
  const struts=strutData.map((item)=>{
    const group=new THREE.Group();
    const geometry=new THREE.BoxGeometry(...item.s);
    const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:"#20282a",metalness:.92,roughness:.25}));
    group.add(mesh,edgesFor(geometry,"#53645f",.72));
    group.position.fromArray(item.p);
    group.rotation.z=item.r;
    group.userData.base=item.p;
    group.userData.expand=item.e;
    root.add(group);
    return group;
  });

  const ringGroup=new THREE.Group();
  root.add(ringGroup);
  const ringSegments=quality==="high"?112:quality==="medium"?80:56;
  const ringA=ring(1.38,.012,"#7fa796",.42,ringSegments);
  ringA.rotation.set(Math.PI/2,0,.18);
  const ringB=ring(1.68,.008,"#4d665d",.3,ringSegments);
  ringB.rotation.set(1.08,.2,-.24);
  const ringC=ring(1.94,.006,"#64786f",.23,ringSegments+16);
  ringC.rotation.set(.3,-.58,.5);
  const ringD=ring(2.28,.005,"#9df5cf",.09,ringSegments+32);
  ringD.rotation.set(1.42,.22,-.38);
  ringGroup.add(ringA,ringB,ringC,ringD);

  const allNodePositions=[
    [-1.55,.8,.25],[-1.35,-.72,.5],[-.45,1.35,-.2],[.4,-1.35,.15],
    [1.48,.76,.1],[1.62,-.42,-.35],[.75,1.42,.4],[-.78,-1.4,-.35],
    [1.95,.15,.2],[-1.92,.1,-.2],[1.05,-.96,.48],[-1.03,.1,.82]
  ];
  const nodeLimit=quality==="low"?8:quality==="medium"?10:12;
  const nodePositions=allNodePositions.slice(0,nodeLimit);
  const nodes=nodePositions.map((position,i)=>{
    const group=new THREE.Group();
    group.position.fromArray(position);
    group.userData.base=position;
    const geometry=new THREE.BoxGeometry(.17,.17,.17);
    const box=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:"#20292a",metalness:.9,roughness:.26}));
    group.add(box,edgesFor(geometry,"#52625e",.67));
    const lamp=new THREE.Mesh(
      new THREE.PlaneGeometry(.082,.082),
      new THREE.MeshBasicMaterial({color:"#9df5cf",transparent:true,opacity:.92,toneMapped:false})
    );
    lamp.position.z=.102;
    group.add(lamp);
    group.userData.lamp=lamp;
    root.add(group);
    return group;
  });

  const lines=new THREE.Group();
  for(let i=0;i<nodePositions.length-1;i+=2){
    lines.add(lineBetween(nodePositions[i],nodePositions[i+1],i%4===0?"#9df5cf":"#60776e",.36));
  }
  if(nodePositions.length>8)lines.add(polyLine([nodePositions[1],nodePositions[6],nodePositions[8]],"#9df5cf",.31));
  if(nodePositions.length>9)lines.add(polyLine([nodePositions[3],nodePositions[2],nodePositions[9]],"#d9ff5f",.2));
  root.add(lines);

  const packetCount=quality==="high"?9:quality==="medium"?7:6;
  const packets=Array.from({length:packetCount},(_,i)=>{
    const mesh=new THREE.Mesh(
      new THREE.OctahedronGeometry(i%3===0?.04:.026,0),
      new THREE.MeshBasicMaterial({color:i%4===0?"#d9ff5f":"#9df5cf",transparent:true,opacity:.86,toneMapped:false})
    );
    root.add(mesh);
    return mesh;
  });

  const paneA=createPane(1.45,.76,"#0e1816","#497565");
  paneA.position.set(1.55,.58,-.72);
  paneA.rotation.set(.04,-.3,.03);
  [-.24,-.08,.08,.24].forEach((y,i)=>{
    const bar=new THREE.Mesh(new THREE.PlaneGeometry(.72-i*.08,.014),new THREE.MeshBasicMaterial({color:"#75a998",transparent:true,opacity:.26+i*.04}));
    bar.position.set(-.2+i*.04,y,.012);
    paneA.add(bar);
  });
  root.add(paneA);

  const paneB=createPane(1.18,.62,"#0d1515","#405e55");
  paneB.position.set(-1.35,-.72,-.6);
  paneB.rotation.set(-.06,.36,-.06);
  [-.34,0,.34].forEach((x,i)=>{
    const dot=new THREE.Mesh(new THREE.CircleGeometry(.045+i*.008,12),new THREE.MeshBasicMaterial({color:i===1?"#d9ff5f":"#9df5cf",transparent:true,opacity:.58}));
    dot.position.set(x,.08-i*.08,.012);
    paneB.add(dot);
  });
  root.add(paneB);

  const scan=new THREE.Mesh(
    new THREE.PlaneGeometry(4.6,4.6),
    new THREE.MeshBasicMaterial({color:"#9df5cf",transparent:true,opacity:.05,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending})
  );
  scan.position.set(0,-1.4,.9);
  scan.rotation.x=Math.PI/2;
  root.add(scan);

  const grid=new THREE.GridHelper(6.4,quality==="low"?12:18,"#26443a","#16241f");
  grid.position.set(0,-2.25,-.8);
  grid.rotation.z=.02;
  root.add(grid);

  const tunnel=new THREE.Group();
  const tunnelCount=quality==="high"?7:quality==="medium"?6:5;
  const tunnelFrames=Array.from({length:tunnelCount},(_,i)=>{
    const frame=octagonFrame(2.05+i*.22,1.02-i*.73,i===0?"#9df5cf":"#577269",.11-i*.008);
    frame.userData.baseZ=1.02-i*.73;
    frame.rotation.z=i*.17;
    tunnel.add(frame);
    return frame;
  });
  root.add(tunnel);

  const count=quality==="high"?400:quality==="medium"?240:100;
  const particlePositions=new Float32Array(count*3);
  let seed=1337;
  const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<count;i++){
    const radius=2.1+rnd()*6.2;
    const theta=rnd()*Math.PI*2;
    const phi=(rnd()-.5)*Math.PI*.76;
    particlePositions[i*3]=Math.cos(theta)*Math.cos(phi)*radius+1;
    particlePositions[i*3+1]=Math.sin(phi)*radius;
    particlePositions[i*3+2]=Math.sin(theta)*Math.cos(phi)*radius-2.2;
  }
  const particleGeometry=new THREE.BufferGeometry();
  particleGeometry.setAttribute("position",new THREE.BufferAttribute(particlePositions,3));
  const particles=new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
      color:"#9df5cf",
      size:innerWidth<700?.011:.015,
      transparent:true,
      opacity:.24,
      sizeAttenuation:true,
      depthWrite:false,
      blending:THREE.AdditiveBlending
    })
  );
  scene.add(particles);

  let pointerX=0,pointerY=0;
  let targetProgress=0;
  let progress=0;
  let activeCapability=false;
  let viewportHeight=innerHeight;
  let raf=0;
  let lastFrame=0;
  const startTime=performance.now();
  const target=new THREE.Vector3();
  const look=new THREE.Vector3();

  function ensureAnimation(){
    if(!raf&&!document.hidden)raf=requestAnimationFrame(animate);
  }

  addEventListener("pointermove",(event)=>{
    if(event.pointerType==="touch")return;
    pointerX=(event.clientX/innerWidth)*2-1;
    pointerY=-(event.clientY/innerHeight)*2+1;
    if(scrollY<viewportHeight*1.75)ensureAnimation();
  },{passive:true});

  document.querySelectorAll(".cap-row").forEach((row)=>{
    row.addEventListener("pointerenter",()=>{activeCapability=true;ensureAnimation();});
    row.addEventListener("pointerleave",()=>{activeCapability=false;ensureAnimation();});
    row.addEventListener("focus",()=>{activeCapability=true;ensureAnimation();});
    row.addEventListener("blur",()=>{activeCapability=false;ensureAnimation();});
  });

  function updateScroll(){
    const range=Math.max(1,viewportHeight*1.55);
    targetProgress=window.__rizMotion?window.__rizMotion.heroProgress:clamp(scrollY/range);
    ensureAnimation();
  }
  addEventListener("scroll",updateScroll,{passive:true});
  updateScroll();

  function resize(){
    viewportHeight=innerHeight;
    const parent=canvas.parentElement;
    const rect=parent?parent.getBoundingClientRect():{width:innerWidth,height:innerHeight};
    const renderWidth=Math.max(1,Math.round(rect.width||innerWidth));
    const renderHeight=Math.max(1,Math.round(rect.height||innerHeight));
    renderer.setPixelRatio(Math.min(devicePixelRatio,maxPixelRatio));
    renderer.setSize(renderWidth,renderHeight,false);
    camera.aspect=renderWidth/renderHeight;
    camera.updateProjectionMatrix();
    updateScroll();
  }
  addEventListener("resize",resize,{passive:true});
  resize();

  canvas.addEventListener("webglcontextlost",(event)=>{
    event.preventDefault();
    document.documentElement.classList.remove("webgl-ready");
    document.documentElement.classList.add("webgl-fallback");
  });

  function animate(now){
    raf=0;
    if(lastFrame&&now-lastFrame<frameInterval*.92){
      raf=requestAnimationFrame(animate);
      return;
    }
    const delta=Math.min(.05,lastFrame?(now-lastFrame)/1000:1/targetFps);
    lastFrame=now;
    const t=(now-startTime)/1000;
    if(window.__rizMotion)targetProgress=window.__rizMotion.heroProgress;
    progress=damp(progress,targetProgress,6.8,delta);

    const opening=smoothstep(.16,.38,progress);
    const inspect=smoothstep(.34,.58,progress);
    const dive=smoothstep(.54,.84,progress);
    const resolve=smoothstep(.74,.95,progress);
    const burst=smoothstep(.58,.78,progress)*(1-resolve);
    const desktopOffset=innerWidth>1100?2.02:innerWidth>760?1.02:.24;

    const zoomZ=lerp(6.35,2.45,dive);
    const cameraZ=lerp(zoomZ,6.4,resolve);
    const cameraX=.03+dive*.34-resolve*.18+pointerX*.055;
    const cameraY=.04+inspect*.16+dive*.18-resolve*.08+pointerY*.045;
    target.set(cameraX,cameraY,cameraZ);
    camera.position.lerp(target,Math.min(1,delta*4.6));

    const nextFov=40-dive*5+resolve*4;
    if(Math.abs(camera.fov-nextFov)>.015){
      camera.fov=lerp(camera.fov,nextFov,Math.min(1,delta*3.8));
      camera.updateProjectionMatrix();
    }

    const resolvedX=desktopOffset*1.52;
    const rootX=lerp(desktopOffset,.58,dive);
    root.position.x=lerp(root.position.x,lerp(rootX,resolvedX,resolve)+pointerX*.08,Math.min(1,delta*4));
    root.position.y=lerp(root.position.y,pointerY*.055+dive*.12-resolve*.2,Math.min(1,delta*4));
    root.rotation.y=lerp(root.rotation.y,progress*1.28+pointerX*.07+Math.sin(t*.14)*.026,Math.min(1,delta*3.8));
    root.rotation.x=lerp(root.rotation.x,-.08+progress*.34-pointerY*.035,Math.min(1,delta*3.8));
    root.rotation.z=lerp(root.rotation.z,Math.sin(t*.11)*.014+burst*.08,Math.min(1,delta*3.8));
    root.scale.setScalar(.92+dive*.25-resolve*.78);

    const pulse=1+Math.sin(t*1.45)*.026+(activeCapability?.05:0)+inspect*.035+burst*.09;
    inner.scale.setScalar(pulse);
    shell.rotation.y=-t*.14-progress*.78;
    shell.rotation.x=t*.075+progress*.18;
    shellEdges.rotation.copy(shell.rotation);

    ringGroup.scale.setScalar(1+opening*.14+dive*.18);
    ringA.rotation.z=t*.075+progress*1.75;
    ringB.rotation.x=1.08+Math.sin(t*.18)*.07+progress*.54;
    ringC.rotation.y=-.58+t*.045-progress*.76;
    ringD.rotation.z=-.38-t*.035+progress*.9;

    coreLight.intensity=3.1+opening*2.3+dive*1.9;
    keyLight.position.x=2.3+Math.sin(t*.18)*.42-dive*.35;
    keyLight.position.y=2.6+Math.cos(t*.15)*.26;
    keyLight.intensity=2.7+progress*2.2+(activeCapability?.75:0)+burst*1.4;
    rimLight.position.y=-1.1+Math.sin(t*.2)*.32;
    rimLight.intensity=1.05+progress*1.1;

    auraMaterial.uniforms.uTime.value=t;
    auraMaterial.uniforms.uIntensity.value=opening+dive*.75+(activeCapability?.3:0)+burst*.4;
    auraMaterial.uniforms.uColor.value.lerp(activeCapability?HOT:ACCENT,.055);

    struts.forEach((group)=>{
      const base=group.userData.base;
      const expand=group.userData.expand;
      const amount=opening+inspect*.34;
      group.position.set(
        damp(group.position.x,base[0]+expand[0]*amount,6,delta),
        damp(group.position.y,base[1]+expand[1]*amount,6,delta),
        damp(group.position.z,base[2]+expand[2]*amount,6,delta)
      );
    });

    nodes.forEach((group,i)=>{
      const base=group.userData.base;
      const separation=1+inspect*.22+dive*.17;
      group.position.set(
        damp(group.position.x,base[0]*separation,7,delta),
        damp(group.position.y,base[1]*separation,7,delta),
        damp(group.position.z,base[2]*separation,7,delta)
      );
      const lamp=group.userData.lamp;
      const hit=(activeCapability&&i%3===0)||burst>.45&&i%2===0;
      const lampScale=1+Math.sin(t*1.8+i*.72)*.12+(hit?.5:0);
      lamp.scale.setScalar(lampScale);
      lamp.material.color.set(hit?"#d9ff5f":"#9df5cf");
    });

    packets.forEach((mesh,i)=>{
      const lane=i%3;
      const radius=1.5+lane*.28+dive*.24;
      const speed=.2+lane*.055+progress*.28;
      const angle=t*speed+i*.74+progress*Math.PI*3.4;
      mesh.position.set(
        Math.cos(angle)*radius,
        Math.sin(angle*(lane===1?.72:1))*(.56+lane*.14),
        Math.sin(angle)*radius*.42+dive*.18
      );
      const packetPulse=.72+Math.sin(t*2.2+i)*.28;
      mesh.scale.setScalar(.72+packetPulse*.46+burst*.35);
    });

    paneA.position.x=damp(paneA.position.x,1.55+opening*.9+dive*.34,5.5,delta);
    paneA.position.y=.58+Math.sin(t*.42)*.04+dive*.12;
    paneA.rotation.y=-.3-opening*.1-dive*.08+pointerX*.018;
    paneA.rotation.x=.04+pointerY*.012;
    paneA.userData.material.opacity=.08+inspect*.12+dive*.05;

    paneB.position.x=damp(paneB.position.x,-1.35-opening*.82-dive*.28,5.5,delta);
    paneB.position.y=-.72+Math.sin(t*.37+1)*.035-dive*.11;
    paneB.rotation.y=.36+opening*.1+dive*.07-pointerX*.015;
    paneB.rotation.x=-.06-pointerY*.01;
    paneB.userData.material.opacity=.075+inspect*.11+dive*.045;

    scan.position.y=-1.55+((t*.31+progress*3.2)%1)*3.1;
    scan.material.opacity=.025+inspect*.08+dive*.07;

    tunnelFrames.forEach((frame,i)=>{
      frame.position.z=frame.userData.baseZ-dive*(1.15+i*.08)+resolve*.7;
      frame.rotation.z=i*.17+t*(i%2===0?.006:-.005)+progress*(.12+i*.018);
      const s=1+dive*(.08+i*.012);
      frame.scale.setScalar(s);
      frame.material.opacity=(.055+inspect*.055+dive*.075)*(1-resolve*.58);
    });

    particles.rotation.y+=delta*(.009+progress*.025);
    particles.rotation.x=Math.sin(t*.08)*.014+dive*.018;
    particles.position.z=dive*.55-resolve*.25;
    particles.position.y=Math.sin(t*.11)*.055;
    particles.material.opacity=.2+dive*.12-resolve*.045;

    const lookX=lerp(1.02,.48,dive)+resolve*.92+pointerX*.035;
    const lookY=progress*.08+dive*.08-resolve*.06+pointerY*.02;
    look.set(lookX,lookY,0);
    camera.lookAt(look);

    scene.fog.near=5.8-dive*3.3+resolve*2.1;
    scene.fog.far=14-dive*5.2+resolve*3.1;

    renderer.render(scene,camera);

    const motionPending=window.__rizMotion?Math.abs(scrollY-window.__rizMotion.scrollY)>1:false;
    const heroLive=scrollY<viewportHeight*1.72&&targetProgress<.995;
    const unsettled=Math.abs(progress-targetProgress)>.0015;
    if(heroLive||unsettled||motionPending||activeCapability)raf=requestAnimationFrame(animate);
  }

  document.addEventListener("visibilitychange",()=>{
    if(!document.hidden)ensureAnimation();
  });
  ensureAnimation();
}

function ring(radius,tube,color,opacity,segments){
  return new THREE.Mesh(
    new THREE.TorusGeometry(radius,tube,8,segments),
    new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false})
  );
}
function edgesFor(geometry,color,opacity){
  return new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry,18),
    new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false})
  );
}
function lineBetween(a,b,color,opacity){
  const geometry=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3().fromArray(a),new THREE.Vector3().fromArray(b)]);
  return new THREE.Line(geometry,new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false}));
}
function polyLine(points,color,opacity){
  const geometry=new THREE.BufferGeometry().setFromPoints(points.map((p)=>new THREE.Vector3().fromArray(p)));
  return new THREE.Line(geometry,new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false}));
}
function octagonFrame(radius,z,color,opacity){
  const points=[];
  for(let i=0;i<8;i++){
    const angle=Math.PI/8+i*Math.PI/4;
    points.push(new THREE.Vector3(Math.cos(angle)*radius,Math.sin(angle)*radius,z));
  }
  const geometry=new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.LineLoop(geometry,new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false}));
}
function createPane(width,height,color,edgeColor){
  const group=new THREE.Group();
  const geometry=new THREE.PlaneGeometry(width,height);
  const material=new THREE.MeshBasicMaterial({
    color,
    transparent:true,
    depthWrite:false,
    opacity:.09,
    side:THREE.DoubleSide
  });
  const mesh=new THREE.Mesh(geometry,material);
  group.add(mesh,edgesFor(geometry,edgeColor,.74));
  group.userData.material=material;
  return group;
}
function clamp(v,min=0,max=1){return Math.min(max,Math.max(min,v));}
function lerp(a,b,t){return a+(b-a)*t;}
function smoothstep(min,max,v){
  const t=clamp((v-min)/(max-min));
  return t*t*(3-2*t);
}
function damp(current,target,speed,delta){
  return lerp(current,target,1-Math.exp(-speed*delta));
}