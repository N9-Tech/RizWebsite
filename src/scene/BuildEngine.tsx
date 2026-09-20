"use client";

import { Line } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useExperience } from "./ExperienceContext";

const ACCENT = new THREE.Color("#8edfc0");
const HOT = new THREE.Color("#dff3c9");

const nodePositions: [number, number, number][] = [
  [-1.55, .8, .25], [-1.35, -.72, .5], [-.45, 1.35, -.2], [.4, -1.35, .15],
  [1.48, .76, .1], [1.62, -.42, -.35], [.75, 1.42, .4], [-.78, -1.4, -.35],
  [1.95, .15, .2], [-1.92, .1, -.2], [1.05, -.96, .48], [-1.03, .1, .82]
];

type Strut = { p: [number, number, number]; s: [number, number, number]; r: number; e: [number, number, number] };
const struts: Strut[] = [
  { p: [-1.08, .68, 0], s: [.10, 2.5, .12], r: .18, e: [-.55, .22, .15] },
  { p: [1.06, -.24, .08], s: [.10, 2.72, .12], r: -.12, e: [.58, -.18, -.1] },
  { p: [.14, 1.08, -.14], s: [2.38, .10, .12], r: .07, e: [.18, .52, -.15] },
  { p: [-.2, -1.04, .18], s: [2.72, .10, .12], r: -.08, e: [-.16, -.52, .2] },
  { p: [-.73, .02, -.56], s: [.08, 1.72, .08], r: .72, e: [-.38, .08, -.42] },
  { p: [.77, .08, -.5], s: [.08, 1.55, .08], r: -.72, e: [.4, -.04, -.38] },
];

const auraVertex = `
  varying vec3 vNormalW;
  varying vec3 vWorld;
  void main(){
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const auraFragment = `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColor;
  varying vec3 vNormalW;
  varying vec3 vWorld;
  void main(){
    vec3 viewDir = normalize(cameraPosition - vWorld);
    float fresnel = pow(1.0 - max(dot(normalize(vNormalW), viewDir), 0.0), 2.2);
    float pulse = 0.82 + sin(uTime * 1.7) * 0.12;
    float alpha = fresnel * (0.10 + uIntensity * 0.12) * pulse;
    vec3 color = uColor * (0.44 + fresnel * 1.08) * (0.72 + uIntensity * 0.22);
    gl_FragColor = vec4(color, alpha);
  }
`;

function EnergyPackets() {
  const refs = useRef<Array<THREE.Mesh | null>>([]);
  const { progressRef } = useExperience();
  const count = 8;
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const progress = progressRef.current;
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const lane = i % 3;
      const radius = 1.53 + lane * .27;
      const speed = .2 + lane * .055 + progress * .14;
      const a = t * speed + i * .91 + progress * Math.PI * 2.4;
      mesh.position.set(Math.cos(a) * radius, Math.sin(a * (lane === 1 ? .72 : 1)) * (.55 + lane * .14), Math.sin(a) * radius * .38);
      const pulse = .7 + Math.sin(t * 2.2 + i) * .3;
      mesh.scale.setScalar(.72 + pulse * .45);
    });
  });

  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} ref={(node) => { refs.current[i] = node; }}>
          <octahedronGeometry args={[i % 3 === 0 ? .038 : .025, 0]} />
          <meshBasicMaterial color={i % 4 === 0 ? "#dff3c9" : "#8edfc0"} transparent opacity={.52} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function ArchitecturalShell() {
  const refs = useRef<Array<THREE.Mesh | null>>([]);
  const { progressRef } = useExperience();
  useFrame((_, delta) => {
    const opening = THREE.MathUtils.smoothstep(progressRef.current, .12, .56);
    const ease = Math.min(1, delta * 5);
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const item = struts[i];
      const tx = item.p[0] + item.e[0] * opening;
      const ty = item.p[1] + item.e[1] * opening;
      const tz = item.p[2] + item.e[2] * opening;
      mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, tx, ease);
      mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, ty, ease);
      mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, tz, ease);
    });
  });

  return (
    <group>
      {struts.map((item, i) => (
        <mesh key={i} ref={(node) => { refs.current[i] = node; }} position={item.p} rotation={[0, 0, item.r]}>
          <boxGeometry args={item.s} />
          <meshPhysicalMaterial color="#0d1110" metalness={.72} roughness={.3} clearcoat={.72} clearcoatRoughness={.2} />
        </mesh>
      ))}
    </group>
  );
}

function DataPanes() {
  const paneA = useRef<THREE.Group>(null);
  const paneB = useRef<THREE.Group>(null);
  const matA = useRef<THREE.MeshPhysicalMaterial>(null);
  const matB = useRef<THREE.MeshPhysicalMaterial>(null);
  const { progressRef } = useExperience();
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const progress = progressRef.current;
    const opening = THREE.MathUtils.smoothstep(progress, .12, .56);
    const ease = Math.min(1, delta * 4);
    if (paneA.current) {
      paneA.current.position.x = THREE.MathUtils.lerp(paneA.current.position.x, 1.55 + opening * .7, ease);
      paneA.current.position.y = .58 + Math.sin(t * .42) * .045;
      paneA.current.rotation.y = -.3 - opening * .08;
    }
    if (paneB.current) {
      paneB.current.position.x = THREE.MathUtils.lerp(paneB.current.position.x, -1.35 - opening * .66, ease);
      paneB.current.position.y = -.72 + Math.sin(t * .37 + 1) * .038;
      paneB.current.rotation.y = .36 + opening * .08;
    }
    const opacity = .038 + progress * .032;
    if (matA.current) matA.current.opacity = opacity;
    if (matB.current) matB.current.opacity = opacity * .9;
  });
  return (
    <>
      <group ref={paneA} position={[1.55, .58, -.72]} rotation={[.04, -.3, .03]}>
        <mesh>
          <planeGeometry args={[1.45, .76]} />
          <meshPhysicalMaterial ref={matA} color="#0a0f0e" transparent depthWrite={false} opacity={.04} roughness={.34} metalness={.38} side={THREE.DoubleSide} />
        </mesh>
        {[.24, .08, -.08, -.24].map((y, i) => <mesh key={i} position={[-.2 + i * .04, y, .012]}><planeGeometry args={[.72 - i * .08, .014]} /><meshBasicMaterial color="#7d968c" transparent opacity={.085 + i * .015} /></mesh>)}
      </group>
      <group ref={paneB} position={[-1.35, -.72, -.6]} rotation={[-.06, .36, -.06]}>
        <mesh>
          <planeGeometry args={[1.18, .62]} />
          <meshPhysicalMaterial ref={matB} color="#090e0d" transparent depthWrite={false} opacity={.035} roughness={.36} metalness={.34} side={THREE.DoubleSide} />
        </mesh>
        {[-.34, 0, .34].map((x, i) => <mesh key={i} position={[x, .08 - i * .08, .012]}><circleGeometry args={[.045 + i * .008, 12]} /><meshBasicMaterial color={i === 1 ? "#dff3c9" : "#8edfc0"} transparent opacity={.22} /></mesh>)}
      </group>
    </>
  );
}

export default function BuildEngine() {
  const root = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  const orbitGroup = useRef<THREE.Group>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const ringC = useRef<THREE.Mesh>(null);
  const coreLight = useRef<THREE.PointLight>(null);
  const nodeRefs = useRef<Array<THREE.Mesh | null>>([]);
  const { viewport } = useThree();
  const { progressRef, activeCapability, quality } = useExperience();
  const nodes = useMemo(() => nodePositions.slice(0, quality === "low" ? 8 : 12), [quality]);

  const auraMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uIntensity: { value: 0 }, uColor: { value: ACCENT.clone() } },
    vertexShader: auraVertex,
    fragmentShader: auraFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
    toneMapped: false,
  }), []);

  useEffect(() => () => auraMaterial.dispose(), [auraMaterial]);

  useFrame((state, delta) => {
    if (!root.current || !core.current || !inner.current) return;
    const t = state.clock.getElapsedTime();
    const progress = progressRef.current;
    const opening = THREE.MathUtils.smoothstep(progress, .12, .56);
    const inspect = THREE.MathUtils.smoothstep(progress, .31, .68);
    const ease = Math.min(1, delta * 3.6);
    const desktopOffset = viewport.width > 7 ? 1.38 : viewport.width > 5 ? .78 : .2;
    const resolve = THREE.MathUtils.smoothstep(progress, .84, 1);

    root.current.position.x = THREE.MathUtils.lerp(root.current.position.x, desktopOffset + state.pointer.x * .11, ease);
    root.current.position.y = THREE.MathUtils.lerp(root.current.position.y, state.pointer.y * .08 - resolve * .3, ease);
    root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, progress * .72 + state.pointer.x * .08 + Math.sin(t * .16) * .035, ease);
    root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, -.08 + progress * .2 - state.pointer.y * .045, ease);
    root.current.rotation.z = THREE.MathUtils.lerp(root.current.rotation.z, Math.sin(t * .12) * .018, ease);
    root.current.scale.setScalar(1 - resolve * .12);

    const pulse = 1 + Math.sin(t * 1.45) * .028 + (activeCapability ? .055 : 0) + inspect * .02;
    inner.current.scale.setScalar(pulse);
    core.current.rotation.y = -t * .16 - progress * .4;
    core.current.rotation.x = t * .09;

    if (orbitGroup.current) orbitGroup.current.scale.setScalar(1 + opening * .08);
    if (ringA.current) ringA.current.rotation.z = t * .08 + progress * 1.1;
    if (ringB.current) ringB.current.rotation.x = 1.08 + Math.sin(t * .18) * .08 + progress * .3;
    if (ringC.current) ringC.current.rotation.y = -.58 + t * .045 - progress * .42;

    if (coreLight.current) coreLight.current.intensity = 1.15 + opening * .75;

    auraMaterial.uniforms.uTime.value = t;
    auraMaterial.uniforms.uIntensity.value = opening + (activeCapability ? .35 : 0);
    (auraMaterial.uniforms.uColor.value as THREE.Color).lerp(activeCapability ? HOT : ACCENT, .06);

    nodeRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const hit = Boolean(activeCapability) && i % 3 === 0;
      const s = 1 + Math.sin(t * 1.8 + i * .72) * .12 + (hit ? .48 : 0);
      mesh.scale.setScalar(s);
    });
  });

  return (
    <group ref={root} position={[1.38, 0, 0]}>
      <group>
        <mesh ref={inner}>
          <sphereGeometry args={[.31, quality === "high" ? 48 : 28, quality === "high" ? 48 : 28]} />
          <meshPhysicalMaterial color="#d7e1dd" emissive="#5f8f7d" emissiveIntensity={.9} metalness={.12} roughness={.08} clearcoat={1} clearcoatRoughness={.06} toneMapped={false} />
        </mesh>
        <mesh ref={core} scale={1.12}>
          <icosahedronGeometry args={[.76, quality === "high" ? 3 : 2]} />
          <meshPhysicalMaterial color="#080b0a" transparent opacity={.94} metalness={.68} roughness={.14} clearcoat={1} clearcoatRoughness={.08} />
        </mesh>
        <mesh scale={1.38} material={auraMaterial}>
          <icosahedronGeometry args={[.78, 3]} />
        </mesh>
        <pointLight ref={coreLight} color="#86d1b4" intensity={1.15} distance={4.2} decay={2} />
      </group>

      <ArchitecturalShell />

      <group ref={orbitGroup}>
        <mesh ref={ringA} rotation={[Math.PI / 2, 0, .18]}>
          <torusGeometry args={[1.38, .012, 8, quality === "low" ? 64 : 128]} />
          <meshBasicMaterial color="#9eaaa5" transparent opacity={.095} depthWrite={false} />
        </mesh>
        <mesh ref={ringB} rotation={[1.08, .2, -.24]}>
          <torusGeometry args={[1.68, .008, 6, quality === "low" ? 64 : 128]} />
          <meshBasicMaterial color="#74817c" transparent opacity={.055} depthWrite={false} />
        </mesh>
        <mesh ref={ringC} rotation={[.3, -.58, .5]}>
          <torusGeometry args={[1.94, .006, 6, quality === "low" ? 64 : 160]} />
          <meshBasicMaterial color="#7e8b86" transparent opacity={.035} depthWrite={false} />
        </mesh>
      </group>

      {nodes.map((p, i) => (
        <group key={i} position={p}>
          <mesh>
            <sphereGeometry args={[.06, 18, 12]} />
            <meshPhysicalMaterial color="#101514" metalness={.62} roughness={.24} clearcoat={.7} />
          </mesh>
          <mesh ref={(node) => { nodeRefs.current[i] = node; }} position={[0, 0, .12]}>
            <sphereGeometry args={[.027, 14, 10]} />
            <meshStandardMaterial color={activeCapability && i % 3 === 0 ? "#e4f4d2" : "#a4cdbd"} emissive={activeCapability && i % 3 === 0 ? "#bcd88d" : "#5f9d86"} emissiveIntensity={1.1} roughness={.22} metalness={.28} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {nodes.slice(0, -1).map((p, i) => i % 2 === 0 ? (
        <Line key={`line-${i}`} points={[p, nodes[i + 1]]} color={i % 4 === 0 ? "#88b8a5" : "#56645f"} transparent opacity={.075} lineWidth={quality === "low" ? .28 : .38} />
      ) : null)}
      {nodes.length > 8 && <Line points={[nodes[1], nodes[6], nodes[8]]} color="#829d92" transparent opacity={.055} lineWidth={.36} />}
      {nodes.length > 9 && <Line points={[nodes[3], nodes[2], nodes[9]]} color="#b9cfae" transparent opacity={.035} lineWidth={.3} />}

      <EnergyPackets />
      <DataPanes />
    </group>
  );
}