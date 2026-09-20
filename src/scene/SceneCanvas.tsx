"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Component, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import BuildEngine from "./BuildEngine";
import CinematicEnvironment from "./CinematicEnvironment";
import ParticleField from "./ParticleField";
import { useQualityTier } from "@/hooks/useQualityTier";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useExperience } from "./ExperienceContext";

function SceneProgressSmoother() {
  const { progressRef, targetProgressRef } = useExperience();

  useFrame((_, delta) => {
    progressRef.current = THREE.MathUtils.damp(
      progressRef.current,
      targetProgressRef.current,
      5.4,
      Math.min(delta, .05),
    );
  });

  return null;
}

function CameraRig() {
  const { camera } = useThree();
  const { progressRef, quality } = useExperience();
  const target = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const p = progressRef.current;
    const pointerScale = quality === "low" ? .025 : .075;
    const open = THREE.MathUtils.smoothstep(p, .08, .34);
    const inspect = THREE.MathUtils.smoothstep(p, .27, .58);
    const resolve = THREE.MathUtils.smoothstep(p, .82, 1);

    target.current.set(
      -.12 + p * .46 + state.pointer.x * pointerScale,
      .12 + open * .08 - resolve * .14 + state.pointer.y * pointerScale * .55,
      6.45 - open * .62 + inspect * .22 + resolve * .58,
    );

    camera.position.x = THREE.MathUtils.damp(camera.position.x, target.current.x, 3.2, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, target.current.y, 3.0, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, target.current.z, 3.0, delta);

    look.current.set(
      1.18 + open * .16 - resolve * .22 + state.pointer.x * .035,
      -.02 + inspect * .08 + state.pointer.y * .02,
      -.08 - inspect * .18,
    );
    camera.lookAt(look.current);
  });

  return null;
}

function CinematicLights() {
  const key = useRef<THREE.SpotLight>(null);
  const rim = useRef<THREE.PointLight>(null);
  const fill = useRef<THREE.PointLight>(null);
  const { progressRef, activeCapability } = useExperience();

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const p = progressRef.current;
    const open = THREE.MathUtils.smoothstep(p, .1, .42);

    if (key.current) {
      key.current.position.x = THREE.MathUtils.damp(key.current.position.x, 3.5 + Math.sin(t * .12) * .28, 1.4, delta);
      key.current.position.y = THREE.MathUtils.damp(key.current.position.y, 4.1 + Math.cos(t * .1) * .18, 1.4, delta);
      key.current.intensity = 48 + open * 24 + (activeCapability ? 12 : 0);
    }
    if (rim.current) {
      rim.current.position.y = -1.0 + Math.sin(t * .14) * .2;
      rim.current.intensity = 9 + p * 6;
    }
    if (fill.current) {
      fill.current.position.x = -3.6 + Math.sin(t * .09) * .3;
      fill.current.intensity = 4 + p * 2.4;
    }
  });

  return (
    <>
      <ambientLight intensity={.08} color="#9fb2aa" />
      <hemisphereLight args={["#9fc4b5", "#050607", .22]} />
      <spotLight
        ref={key}
        position={[3.5, 4.1, 4.7]}
        angle={.42}
        penumbra={.86}
        intensity={48}
        color="#d9fff0"
        distance={15}
        decay={2}
      />
      <pointLight ref={rim} position={[-2.8, -1, 2]} intensity={9} color="#55a58a" distance={8} decay={2} />
      <pointLight ref={fill} position={[-3.6, 1.6, -1.8]} intensity={4} color="#7d9aa0" distance={10} decay={2} />
    </>
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
      dpr={quality === "high" ? [1, 1.7] : quality === "medium" ? [1, 1.4] : [1, 1.1]}
      camera={{ position: [-.12, .12, 6.45], fov: 37, near: .1, far: 100 }}
      gl={{
        antialias: quality !== "low",
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = .92;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.setClearColor(0x050607, 0);
      }}
    >
      <fogExp2 attach="fog" args={["#050607", .048]} />
      <SceneProgressSmoother />
      <CinematicLights />
      <CameraRig />
      <ContextLossGuard onLost={onContextLost} />
      <Suspense fallback={null}>
        <CinematicEnvironment />
        <BuildEngine />
        <ParticleField />
      </Suspense>
    </Canvas>
  );
}

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function SceneCanvas() {
  const [fallback, setFallback] = useState(false);
  const { phase } = useExperience();
  const reduced = useReducedMotion();
  const triggerFallback = useCallback(() => setFallback(true), []);

  useEffect(() => {
    if (!canUseWebGL()) triggerFallback();
  }, [triggerFallback]);

  const useFallback = fallback || reduced;

  return (
    <div className={`scene-canvas phase-${phase} ${useFallback ? "is-fallback" : ""}`} aria-hidden="true">
      <div className="scene-atmosphere" />
      <div className="scene-depth-haze scene-depth-haze-a" />
      <div className="scene-depth-haze scene-depth-haze-b" />
      {!useFallback && (
        <SceneBoundary onError={triggerFallback}>
          <Scene onContextLost={triggerFallback} />
        </SceneBoundary>
      )}
      <div className="scene-lens" />
      <div className="scene-vignette" />
      <div className="scene-fallback" aria-hidden="true"><div className="fallback-core" /></div>
    </div>
  );
}
