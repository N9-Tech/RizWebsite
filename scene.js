import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.module.js";

const canvas = document.querySelector("#scene-canvas");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

function webglAvailable() {
  try {
    const test = document.createElement("canvas");
    return Boolean(test.getContext("webgl2") || test.getContext("webgl"));
  } catch {
    return false;
  }
}

if (!canvas || reducedMotion || !webglAvailable()) {
  document.documentElement.classList.add("webgl-fallback");
} else {
  try {
    startScene(canvas);
    document.documentElement.classList.add("webgl-ready");
  } catch (error) {
    console.warn("Three.js scene unavailable; using CSS fallback.", error);
    document.documentElement.classList.add("webgl-fallback");
  }
}

function startScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: devicePixelRatio <= 2,
    alpha: true,
    powerPreference: "high-performance",
    stencil: false
  });
  renderer.setClearColor(0x050607, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog("#050607", 6.5, 14);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.05, 6.05);

  const root = new THREE.Group();
  scene.add(root);

  scene.add(new THREE.AmbientLight("#ffffff", 0.19));
  const keyLight = new THREE.PointLight("#c8fce5", 2.8, 10, 2);
  keyLight.position.set(2.3, 2.6, 3.4);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight("#5caa91", 1.15, 9, 2);
  rimLight.position.set(-3.1, -1.2, 1.5);
  scene.add(rimLight);
  const topLight = new THREE.DirectionalLight("#d8fff0", 0.32);
  topLight.position.set(0, 4, -2);
  scene.add(topLight);

  const coreGeometry = new THREE.IcosahedronGeometry(0.63, devicePixelRatio > 1.3 ? 4 : 2);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: "#b8ffe1",
    emissive: "#65e6b3",
    emissiveIntensity: 2.45,
    roughness: 0.18,
    metalness: 0.08,
    toneMapped: false
  });
  const inner = new THREE.Mesh(coreGeometry, coreMaterial);
  root.add(inner);

  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.71, 2),
    new THREE.MeshPhysicalMaterial({
      color: "#0c1212",
      transparent: true,
      opacity: 0.66,
      metalness: 0.78,
      roughness: 0.2,
      clearcoat: 0.7,
      clearcoatRoughness: 0.22
    })
  );
  shell.scale.setScalar(1.12);
  root.add(shell);
  root.add(edgesFor(shell.geometry, "#8fd8bb", 0.62));

  const auraMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uColor: { value: new THREE.Color("#9df5cf") }
    },
    vertexShader: [
      "varying vec3 vNormalW;",
      "varying vec3 vWorld;",
      "void main(){",
      "vNormalW=normalize(mat3(modelMatrix)*normal);",
      "vec4 world=modelMatrix*vec4(position,1.0);",
      "vWorld=world.xyz;",
      "gl_Position=projectionMatrix*viewMatrix*world;",
      "}"
    ].join("\n"),
    fragmentShader: [
      "uniform float uTime;",
      "uniform float uIntensity;",
      "uniform vec3 uColor;",
      "varying vec3 vNormalW;",
      "varying vec3 vWorld;",
      "void main(){",
      "vec3 viewDir=normalize(cameraPosition-vWorld);",
      "float fresnel=pow(1.0-max(dot(normalize(vNormalW),viewDir),0.0),2.2);",
      "float pulse=0.82+sin(uTime*1.7)*0.12;",
      "float alpha=fresnel*(0.28+uIntensity*0.28)*pulse;",
      "vec3 color=uColor*(0.75+fresnel*1.55)*(0.8+uIntensity*0.35);",
      "gl_FragColor=vec4(color,alpha);",
      "}"
    ].join("\n"),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false
  });
  const aura = new THREE.Mesh(new THREE.IcosahedronGeometry(0.72, 3), auraMaterial);
  aura.scale.setScalar(1.42);
  root.add(aura);

  const coreLight = new THREE.PointLight("#8ff3c9", 2.8, 5.4, 2);
  root.add(coreLight);

  const strutData = [
    { p:[-1.08,.68,0], s:[.10,2.5,.12], r:.18, e:[-.55,.22,.15] },
    { p:[1.06,-.24,.08], s:[.10,2.72,.12], r:-.12, e:[.58,-.18,-.1] },
    { p:[.14,1.08,-.14], s:[2.38,.10,.12], r:.07, e:[.18,.52,-.15] },
    { p:[-.2,-1.04,.18], s:[2.72,.10,.12], r:-.08, e:[-.16,-.52,.2] },
    { p:[-.73,.02,-.56], s:[.08,1.72,.08], r:.72, e:[-.38,.08,-.42] },
    { p:[.77,.08,-.5], s:[.08,1.55,.08], r:-.72, e:[.4,-.04,-.38] }
  ];
  const struts = strutData.map((item) => {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(item.s[0], item.s[1], item.s[2]),
      new THREE.MeshStandardMaterial({ color:"#20282a", metalness:.9, roughness:.28 })
    );
    group.add(mesh, edgesFor(mesh.geometry, "#53645f", 0.7));
    group.position.fromArray(item.p);
    group.rotation.z = item.r;
    group.userData.base = item.p;
    group.userData.expand = item.e;
    root.add(group);
    return group;
  });

  const ringGroup = new THREE.Group();
  root.add(ringGroup);
  const ringA = ring(1.38, .012, "#7fa796", .38, 128);
  ringA.rotation.set(Math.PI/2, 0, .18);
  const ringB = ring(1.68, .008, "#4d665d", .28, 128);
  ringB.rotation.set(1.08, .2, -.24);
  const ringC = ring(1.94, .006, "#64786f", .2, 160);
  ringC.rotation.set(.3, -.58, .5);
  ringGroup.add(ringA, ringB, ringC);

  const nodePositions = [
    [-1.55,.8,.25],[-1.35,-.72,.5],[-.45,1.35,-.2],[.4,-1.35,.15],
    [1.48,.76,.1],[1.62,-.42,-.35],[.75,1.42,.4],[-.78,-1.4,-.35],
    [1.95,.15,.2],[-1.92,.1,-.2],[1.05,-.96,.48],[-1.03,.1,.82]
  ];
  const nodes = nodePositions.map((position, i) => {
    const group = new THREE.Group();
    group.position.fromArray(position);
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(.17,.17,.17),
      new THREE.MeshStandardMaterial({color:"#20292a",metalness:.88,roughness:.28})
    );
    group.add(box, edgesFor(box.geometry, "#52625e", .65));
    const lamp = new THREE.Mesh(
      new THREE.PlaneGeometry(.082,.082),
      new THREE.MeshBasicMaterial({color:"#9df5cf",transparent:true,opacity:.9,toneMapped:false})
    );
    lamp.position.z=.102;
    lamp.userData.index=i;
    group.add(lamp);
    group.userData.lamp=lamp;
    root.add(group);
    return group;
  });

  const lines = new THREE.Group();
  for (let i=0;i<nodePositions.length-1;i+=2) {
    lines.add(lineBetween(nodePositions[i], nodePositions[i+1], i%4===0 ? "#9df5cf" : "#60776e", .34));
  }
  lines.add(polyLine([nodePositions[1],nodePositions[6],nodePositions[8]],"#9df5cf",.3));
  lines.add(polyLine([nodePositions[3],nodePositions[2],nodePositions[9]],"#d9ff5f",.18));
  root.add(lines);

  const packets = Array.from({length:8},(_,i)=>{
    const mesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(i%3===0?.038:.025,0),
      new THREE.MeshBasicMaterial({color:i%4===0?"#d9ff5f":"#9df5cf",transparent:true,opacity:.82,toneMapped:false})
    );
    root.add(mesh);
    return mesh;
  });

  const paneA = createPane(1.45,.76,"#0e1816","#497565");
  paneA.position.set(1.55,.58,-.72);
  paneA.rotation.set(.04,-.3,.03);
  [-.24,-.08,.08,.24].forEach((y,i)=>{
    const bar=new THREE.Mesh(new THREE.PlaneGeometry(.72-i*.08,.014),new THREE.MeshBasicMaterial({color:"#75a998",transparent:true,opacity:.26+i*.04}));
    bar.position.set(-.2+i*.04,y,.012); paneA.add(bar);
  });
  root.add(paneA);

  const paneB = createPane(1.18,.62,"#0d1515","#405e55");
  paneB.position.set(-1.35,-.72,-.6);
  paneB.rotation.set(-.06,.36,-.06);
  [-.34,0,.34].forEach((x,i)=>{
    const dot=new THREE.Mesh(new THREE.CircleGeometry(.045+i*.008,12),new THREE.MeshBasicMaterial({color:i===1?"#d9ff5f":"#9df5cf",transparent:true,opacity:.55}));
    dot.position.set(x,.08-i*.08,.012); paneB.add(dot);
  });
  root.add(paneB);

  const scan = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2,4.2),
    new THREE.MeshBasicMaterial({color:"#9df5cf",transparent:true,opacity:.05,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending})
  );
  scan.position.set(0,-1.4,.9);
  scan.rotation.x=Math.PI/2;
  root.add(scan);

  const grid = new THREE.GridHelper(5.8,18,"#26443a","#16241f");
  grid.position.set(0,-2.18,-.7);
  grid.rotation.z=.02;
  root.add(grid);

  const count = innerWidth > 1200 ? 540 : innerWidth > 700 ? 300 : 130;
  const particlePositions = new Float32Array(count*3);
  let seed=1337;
  const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<count;i++){
    const radius=2.3+rnd()*5.4;
    const theta=rnd()*Math.PI*2;
    const phi=(rnd()-.5)*Math.PI*.72;
    particlePositions[i*3]=Math.cos(theta)*Math.cos(phi)*radius+1;
    particlePositions[i*3+1]=Math.sin(phi)*radius;
    particlePositions[i*3+2]=Math.sin(theta)*Math.cos(phi)*radius-2.1;
  }
  const particleGeometry=new THREE.BufferGeometry();
  particleGeometry.setAttribute("position",new THREE.BufferAttribute(particlePositions,3));
  const particles=new THREE.Points(particleGeometry,new THREE.PointsMaterial({
    color:"#9df5cf",size:innerWidth<700?.011:.014,transparent:true,opacity:.22,sizeAttenuation:true,depthWrite:false,blending:THREE.AdditiveBlending
  }));
  scene.add(particles);

  let pointerX=0,pointerY=0,progress=0,activeCapability=false;
  const target=new THREE.Vector3();
  const look=new THREE.Vector3();
  const clock=new THREE.Clock();

  addEventListener("pointermove",(event)=>{
    if(event.pointerType==="touch") return;
    pointerX=(event.clientX/innerWidth)*2-1;
    pointerY=-(event.clientY/innerHeight)*2+1;
  },{passive:true});

  document.querySelectorAll(".cap-row").forEach((row)=>{
    row.addEventListener("pointerenter",()=>{activeCapability=true;});
    row.addEventListener("pointerleave",()=>{activeCapability=false;});
    row.addEventListener("focus",()=>{activeCapability=true;});
    row.addEventListener("blur",()=>{activeCapability=false;});
  });

  const updateScroll=()=>{
    const stack=document.querySelector(".stack-section");
    const end=stack ? stack.getBoundingClientRect().bottom+scrollY-innerHeight*.65 : document.documentElement.scrollHeight-innerHeight;
    progress=Math.max(0,Math.min(1,scrollY/Math.max(1,end)));
  };
  addEventListener("scroll",updateScroll,{passive:true});
  updateScroll();

  function resize(){
    const width=innerWidth,height=innerHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio,width<700?1.2:1.8));
    renderer.setSize(width,height,false);
    camera.aspect=width/height;
    camera.updateProjectionMatrix();
  }
  addEventListener("resize",resize,{passive:true});
  resize();

  canvas.addEventListener("webglcontextlost",(event)=>{
    event.preventDefault();
    document.documentElement.classList.remove("webgl-ready");
    document.documentElement.classList.add("webgl-fallback");
  });

  function animate(){
    const t=clock.getElapsedTime();
    const opening=smoothstep(progress,.12,.56);
    const inspect=smoothstep(progress,.31,.68);
    const resolve=smoothstep(progress,.84,1);
    const desktopOffset=innerWidth>1100?1.38:innerWidth>760?.78:.2;

    root.position.x=lerp(root.position.x,desktopOffset+pointerX*.11,.065);
    root.position.y=lerp(root.position.y,pointerY*.08-resolve*.3,.065);
    root.rotation.y=lerp(root.rotation.y,progress*.72+pointerX*.08+Math.sin(t*.16)*.035,.065);
    root.rotation.x=lerp(root.rotation.x,-.08+progress*.2-pointerY*.045,.065);
    root.rotation.z=lerp(root.rotation.z,Math.sin(t*.12)*.018,.065);
    root.scale.setScalar(1-resolve*.12);

    const pulse=1+Math.sin(t*1.45)*.028+(activeCapability?.055:0)+inspect*.02;
    inner.scale.setScalar(pulse);
    shell.rotation.y=-t*.16-progress*.4;
    shell.rotation.x=t*.09;

    ringGroup.scale.setScalar(1+opening*.08);
    ringA.rotation.z=t*.08+progress*1.1;
    ringB.rotation.x=1.08+Math.sin(t*.18)*.08+progress*.3;
    ringC.rotation.y=-.58+t*.045-progress*.42;

    scan.position.y=-1.45+((t*.34+progress*2.4)%1)*2.9;
    scan.material.opacity=.03+inspect*.09;
    coreLight.intensity=2.8+opening*2.2;
    keyLight.position.x=2.3+Math.sin(t*.18)*.45;
    keyLight.position.y=2.6+Math.cos(t*.15)*.28;
    keyLight.intensity=2.6+progress*1.7+(activeCapability?.8:0);
    rimLight.position.y=-1.2+Math.sin(t*.2)*.35;
    rimLight.intensity=1+progress*.8;

    auraMaterial.uniforms.uTime.value=t;
    auraMaterial.uniforms.uIntensity.value=opening+(activeCapability?.35:0);
    auraMaterial.uniforms.uColor.value.lerp(new THREE.Color(activeCapability?"#d9ff5f":"#9df5cf"),.06);

    struts.forEach((group)=>{
      const base=group.userData.base,expand=group.userData.expand;
      group.position.set(
        lerp(group.position.x,base[0]+expand[0]*opening,.08),
        lerp(group.position.y,base[1]+expand[1]*opening,.08),
        lerp(group.position.z,base[2]+expand[2]*opening,.08)
      );
    });

    nodes.forEach((group,i)=>{
      const lamp=group.userData.lamp;
      const hit=activeCapability&&i%3===0;
      const scale=1+Math.sin(t*1.8+i*.72)*.12+(hit?.48:0);
      lamp.scale.setScalar(scale);
      lamp.material.color.set(hit?"#d9ff5f":"#9df5cf");
    });

    packets.forEach((mesh,i)=>{
      const lane=i%3;
      const radius=1.53+lane*.27;
      const speed=.2+lane*.055+progress*.14;
      const angle=t*speed+i*.91+progress*Math.PI*2.4;
      mesh.position.set(Math.cos(angle)*radius,Math.sin(angle*(lane===1?.72:1))*(.55+lane*.14),Math.sin(angle)*radius*.38);
      const p=.7+Math.sin(t*2.2+i)*.3;
      mesh.scale.setScalar(.72+p*.45);
    });

    paneA.position.x=lerp(paneA.position.x,1.55+opening*.7,.07);
    paneA.position.y=.58+Math.sin(t*.42)*.045;
    paneA.rotation.y=-.3-opening*.08;
    paneB.position.x=lerp(paneB.position.x,-1.35-opening*.66,.07);
    paneB.position.y=-.72+Math.sin(t*.37+1)*.038;
    paneB.rotation.y=.36+opening*.08;

    particles.rotation.y+=.00012+progress*.00018;
    particles.rotation.x=Math.sin(t*.08)*.014;
    particles.position.y=Math.sin(t*.11)*.06;

    target.set(progress*.28+pointerX*.09,.05+progress*.14+pointerY*.05,6.05-progress*.56+resolve*.22);
    camera.position.lerp(target,.05);
    look.set(.82+progress*.18+pointerX*.04,progress*.04+pointerY*.025,0);
    camera.lookAt(look);

    renderer.render(scene,camera);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

function ring(radius,tube,color,opacity,segments){
  return new THREE.Mesh(
    new THREE.TorusGeometry(radius,tube,8,segments),
    new THREE.MeshBasicMaterial({color,transparent:true,opacity})
  );
}
function edgesFor(geometry,color,opacity){
  return new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry,18),
    new THREE.LineBasicMaterial({color,transparent:true,opacity})
  );
}
function lineBetween(a,b,color,opacity){
  const geometry=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3().fromArray(a),new THREE.Vector3().fromArray(b)]);
  return new THREE.Line(geometry,new THREE.LineBasicMaterial({color,transparent:true,opacity}));
}
function polyLine(points,color,opacity){
  const geometry=new THREE.BufferGeometry().setFromPoints(points.map((p)=>new THREE.Vector3().fromArray(p)));
  return new THREE.Line(geometry,new THREE.LineBasicMaterial({color,transparent:true,opacity}));
}
function createPane(width,height,color,edgeColor){
  const group=new THREE.Group();
  const geometry=new THREE.PlaneGeometry(width,height);
  const mesh=new THREE.Mesh(geometry,new THREE.MeshPhysicalMaterial({
    color,transparent:true,depthWrite:false,opacity:.12,roughness:.18,metalness:.2,side:THREE.DoubleSide
  }));
  group.add(mesh,edgesFor(geometry,edgeColor,.72));
  return group;
}
function lerp(a,b,t){return a+(b-a)*t;}
function smoothstep(x,min,max){
  const t=Math.max(0,Math.min(1,(x-min)/(max-min)));
  return t*t*(3-2*t);
}
