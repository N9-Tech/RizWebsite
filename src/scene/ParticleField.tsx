"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useExperience } from "./ExperienceContext";

export default function ParticleField() {
  const points = useRef<THREE.Points>(null);
  const { quality, progressRef } = useExperience();
  const count = quality === "high" ? 540 : quality === "medium" ? 300 : 130;
  const positions = useMemo(() => {
    const data = new Float32Array(count * 3);
    let seed = 1337;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = 0; i < count; i += 1) {
      const radius = 2.3 + rnd() * 5.4;
      const theta = rnd() * Math.PI * 2;
      const phi = (rnd() - .5) * Math.PI * .72;
      data[i * 3] = Math.cos(theta) * Math.cos(phi) * radius + 1.0;
      data[i * 3 + 1] = Math.sin(phi) * radius;
      data[i * 3 + 2] = Math.sin(theta) * Math.cos(phi) * radius - 2.1;
    }
    return data;
  }, [count]);

  useFrame((state, delta) => {
    if (!points.current) return;
    const progress = progressRef.current;
    points.current.rotation.y += delta * (.007 + progress * .01);
    points.current.rotation.x = Math.sin(state.clock.getElapsedTime() * .08) * .014;
    points.current.position.y = Math.sin(state.clock.getElapsedTime() * .11) * .06;
  });

  return (
    <points ref={points} frustumCulled>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#9df5cf" size={quality === "low" ? .011 : .014} transparent opacity={.22} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </points>
  );
}