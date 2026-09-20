"use client";

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
    const pointerScale = quality === "low" ? .035 : .09;
    const resolve = THREE.MathUtils.smoothstep(progress, .84, 1);
    target.current.set(
      progress * .28 + state.pointer.x * pointerScale,
      .05 + progress * .14 + state.pointer.y * pointerScale * .55,
      6.05 - progress * .56 + resolve * .22
    );
    camera.position.lerp(target.current, Math.min(1, delta * 2.8));
    look.current.set(.82 + progress * .18 + state.pointer.x * .04, progress * .04 + state.pointer.y * .025, 0);
    camera.lookAt(look.current);
  });
  return null;
}

function CinematicLights() {
  const key = useRef<THREE.PointLight>(null);
  const rim = useRef<THREE.PointLight>(null);
  const { progressRef, activeCapability } = useExperience();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const progress = progressRef.current;
    if (key.current) {
      key.current.position.x = 2.3 + Math.sin(t * .18) * .45;
      key.current.position.y = 2.6 + Math.cos(t * .15) * .28;
      key.current.intensity = 2.6 + progress * 1.7 + (activeCapability ? .8 : 0);
    }
    if (rim.current) {
      rim.current.position.y = -1.2 + Math.sin(t * .2) * .35;
      rim.current.intensity = 1.0 + progress * .8;
    }
  });
  return <>
    <ambientLight intensity={.19} />
    <pointLight ref={key} position={[2.3, 2.6, 3.4]} intensity={2.8} color="#c8fce5" distance={10} decay={2} />
    <pointLight ref={rim} position={[-3.1, -1.2, 1.5]} intensity={1.15} color="#5caa91" distance={9} decay={2} />
    <directionalLight position={[0, 4, -2]} intensity={.32} color="#d8fff0" />
  </>;
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
      dpr={quality === "high" ? [1, 1.8] : quality === "medium" ? [1, 1.45] : [1, 1.15]}
      camera={{ position: [0, .05, 6.05], fov: 38, near: .1, far: 100 }}
      gl={{ antialias: quality !== "low", alpha: true, powerPreference: "high-performance", stencil: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.setClearColor(0x050607, 0);
      }}
    >
      <fog attach="fog" args={["#050607", 6.5, 14]} />
      <CinematicLights />
      <CameraRig />
      <ContextLossGuard onLost={onContextLost} />
      <Suspense fallback={null}>
        <BuildEngine />
        <ParticleField />
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
      <div className="scene-atmosphere" />
      {!useFallback && <SceneBoundary onError={triggerFallback}><Scene onContextLost={triggerFallback} /></SceneBoundary>}
      <div className="scene-vignette" />
      <div className="scene-fallback" aria-hidden="true"><div className="fallback-core" /></div>
    </div>
  );
}
