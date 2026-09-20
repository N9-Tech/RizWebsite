"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Component, Suspense, useCallback, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from "react";
import * as THREE from "three";
import BuildEngine from "./BuildEngine";
import ParticleField from "./ParticleField";
import { useQualityTier } from "@/hooks/useQualityTier";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useExperience } from "./ExperienceContext";

function CameraRig() {
  const { camera } = useThree();
  const { progressRef, quality } = useExperience();
  const target = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const progress = progressRef.current;
    const pointerScale = quality === "low" ? .028 : .07;
    const resolve = THREE.MathUtils.smoothstep(progress, .84, 1);
    target.current.set(
      progress * .2 + state.pointer.x * pointerScale,
      .04 + progress * .11 + state.pointer.y * pointerScale * .46,
      6.45 - progress * .48 + resolve * .18
    );
    camera.position.lerp(target.current, Math.min(1, delta * 2.25));
    look.current.set(.86 + progress * .12 + state.pointer.x * .03, progress * .025 + state.pointer.y * .018, -.18);
    camera.lookAt(look.current);
  });
  return null;
}

function CinematicLights() {
  const key = useRef<THREE.SpotLight>(null);
  const rim = useRef<THREE.PointLight>(null);
  const edge = useRef<THREE.PointLight>(null);
  const { progressRef, activeCapability } = useExperience();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const progress = progressRef.current;
    if (key.current) {
      key.current.position.x = 2.6 + Math.sin(t * .12) * .32;
      key.current.position.y = 3.8 + Math.cos(t * .1) * .2;
      key.current.intensity = 11 + progress * 4 + (activeCapability ? 1.8 : 0);
    }
    if (rim.current) {
      rim.current.position.y = -.8 + Math.sin(t * .15) * .26;
      rim.current.intensity = 4.2 + progress * 1.2;
    }
    if (edge.current) {
      edge.current.position.x = 4.2 + Math.cos(t * .09) * .3;
      edge.current.intensity = 2.1 + progress * .7;
    }
  });

  return <>
    <hemisphereLight args={["#b7cec5", "#020303", .18]} />
    <ambientLight intensity={.055} />
    <spotLight
      ref={key}
      position={[2.6, 3.8, 5.2]}
      intensity={11}
      color="#d8eee6"
      distance={18}
      angle={.42}
      penumbra={1}
      decay={2}
    />
    <pointLight ref={rim} position={[-3.4, -.8, .8]} intensity={4.2} color="#477563" distance={9} decay={2} />
    <pointLight ref={edge} position={[4.2, 1.1, -1.8]} intensity={2.1} color="#c2ded3" distance={8} decay={2} />
  </>;
}

function DepthEnvironment() {
  const far = useRef<THREE.Group>(null);
  const mid = useRef<THREE.Group>(null);
  const { progressRef } = useExperience();

  useFrame((state, delta) => {
    const progress = progressRef.current;
    const ease = Math.min(1, delta * 1.7);
    if (far.current) {
      far.current.position.x = THREE.MathUtils.lerp(far.current.position.x, state.pointer.x * -.16, ease);
      far.current.position.y = THREE.MathUtils.lerp(far.current.position.y, state.pointer.y * -.08 + progress * .08, ease);
      far.current.rotation.z = Math.sin(state.clock.getElapsedTime() * .045) * .018;
    }
    if (mid.current) {
      mid.current.position.x = THREE.MathUtils.lerp(mid.current.position.x, state.pointer.x * -.3, ease);
      mid.current.position.y = THREE.MathUtils.lerp(mid.current.position.y, state.pointer.y * -.16 + progress * .12, ease);
      mid.current.rotation.y = -.08 + progress * .06;
    }
  });

  return (
    <group>
      <group ref={far} position={[0, 0, -6.4]}>
        {[
          [-5.2, -1.3, -1.2, .28, 6.2, .45],
          [-3.4, 1.65, -.4, .2, 4.4, .32],
          [4.9, -.7, -1.6, .24, 5.6, .38],
          [6.1, 2.1, -.8, .16, 3.7, .3],
          [2.9, -2.25, -.2, .18, 4.1, .34],
        ].map(([x,y,z,w,h,d], i) => (
          <mesh key={i} position={[x,y,z]} rotation={[.02 * (i % 2), -.12 + i * .045, .04 * (i % 3 - 1)]}>
            <boxGeometry args={[w,h,d]} />
            <meshStandardMaterial color="#090c0c" roughness={.82} metalness={.18} transparent opacity={.72} />
          </mesh>
        ))}
        <mesh rotation={[1.15, -.22, .4]}>
          <torusGeometry args={[5.6, .01, 5, 160]} />
          <meshBasicMaterial color="#9db3aa" transparent opacity={.045} depthWrite={false} />
        </mesh>
        <mesh rotation={[.42, .58, -.26]}>
          <torusGeometry args={[7.1, .008, 5, 192]} />
          <meshBasicMaterial color="#5f776d" transparent opacity={.032} depthWrite={false} />
        </mesh>
      </group>

      <group ref={mid} position={[.6, 0, -3.25]}>
        {[-2.9, -1.25, .4, 2.2].map((x, i) => (
          <mesh key={i} position={[x, i % 2 ? -1.65 : 1.45, -i * .45]} rotation={[.18 + i * .07, .4 - i * .18, .1]}>
            <torusGeometry args={[1.35 + i * .22, .012, 6, 96]} />
            <meshBasicMaterial color={i % 2 ? "#6f8d80" : "#a7bdb4"} transparent opacity={.055 - i * .007} depthWrite={false} />
          </mesh>
        ))}
      </group>

      <mesh position={[4.3, 1.2, -5.7]} scale={[2.8, 2.8, 2.8]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshBasicMaterial color="#315347" transparent opacity={.018} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
      </mesh>
      <mesh position={[-3.8, -1.8, -4.8]} scale={[2.1, 2.1, 2.1]}>
        <sphereGeometry args={[1, 24, 18]} />
        <meshBasicMaterial color="#25332f" transparent opacity={.022} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function ContextLossGuard({ onLost }: { onLost: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const handleLoss = (event: Event) => {
      event.preventDefault();
      onLost();
    };
    canvas.addEventListener("webglcontextlost", handleLoss);
    return () => canvas.removeEventListener("webglcontextlost", handleLoss);
  }, [gl, onLost]);
  return null;
}

function Scene({ onContextLost }: { onContextLost: () => void }) {
  const quality = useQualityTier();
  return (
    <Canvas
      frameloop="always"
      dpr={quality === "high" ? [1, 1.75] : quality === "medium" ? [1, 1.4] : [1, 1.1]}
      camera={{ position: [0, .04, 6.45], fov: 36, near: .1, far: 60 }}
      gl={{ antialias: quality !== "low", alpha: true, powerPreference: "high-performance", stencil: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = .92;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.setClearColor(0x030405, 0);
      }}
    >
      <fog attach="fog" args={["#030405", 5.6, 18.5]} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.8} color="#d9e5e0" position={[4.5, 3.2, 5.4]} rotation={[0, -.55, 0]} scale={[5, 2.4, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#6c8d80" position={[-4, -.4, 2.2]} rotation={[0, .8, 0]} scale={[3.2, 1.3, 1]} />
        <Lightformer form="ring" intensity={1.1} color="#b9cbc4" position={[1.4, 4.2, -2.8]} rotation={[Math.PI / 2, 0, 0]} scale={2.8} />
      </Environment>
      <DepthEnvironment />
      <CinematicLights />
      <CameraRig />
      <ContextLossGuard onLost={onContextLost} />
      <Suspense fallback={null}>
        <ParticleField />
        <BuildEngine />
      </Suspense>
    </Canvas>
  );
}

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch { return false; }
}

export default function SceneCanvas() {
  const [fallback, setFallback] = useState(false);
  const { phase } = useExperience();
  const reduced = useReducedMotion();
  const triggerFallback = useCallback(() => setFallback(true), []);
  useEffect(() => { if (!canUseWebGL()) triggerFallback(); }, [triggerFallback]);
  const useFallback = fallback || reduced;

  return (
    <div
      className={`scene-canvas phase-${phase} ${useFallback ? "is-fallback" : ""}`}
      aria-hidden="true"
    >
      <div className="scene-depth-glow" />
      <div className="scene-atmosphere" />
      {!useFallback && <SceneBoundary onError={triggerFallback}><Scene onContextLost={triggerFallback} /></SceneBoundary>}
      <div className="scene-vignette" />
      <div className="scene-fallback" aria-hidden="true"><div className="fallback-core" /></div>
    </div>
  );
}
