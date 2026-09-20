"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useExperience } from "./ExperienceContext";

type Layer = {
  count: number;
  minRadius: number;
  maxRadius: number;
  zBias: number;
  size: number;
  opacity: number;
  color: string;
  drift: number;
};

function makePositions(layer: Layer, seedStart: number) {
  const data = new Float32Array(layer.count * 3);
  let seed = seedStart;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  for (let i = 0; i < layer.count; i += 1) {
    const radius = layer.minRadius + rnd() * (layer.maxRadius - layer.minRadius);
    const theta = rnd() * Math.PI * 2;
    const phi = (rnd() - .5) * Math.PI * .68;
    data[i * 3] = Math.cos(theta) * Math.cos(phi) * radius + .8;
    data[i * 3 + 1] = Math.sin(phi) * radius * .82;
    data[i * 3 + 2] = Math.sin(theta) * Math.cos(phi) * radius + layer.zBias;
  }
  return data;
}

export default function ParticleField() {
  const far = useRef<THREE.Points>(null);
  const mid = useRef<THREE.Points>(null);
  const near = useRef<THREE.Points>(null);
  const { quality, progressRef } = useExperience();

  const layers = useMemo<Layer[]>(() => {
    const high = quality === "high";
    const medium = quality === "medium";
    return [
      {
        count: high ? 520 : medium ? 330 : 150,
        minRadius: 5.5,
        maxRadius: 10.5,
        zBias: -5.3,
        size: high ? .010 : .009,
        opacity: .11,
        color: "#82958e",
        drift: .0028,
      },
      {
        count: high ? 260 : medium ? 175 : 90,
        minRadius: 3.1,
        maxRadius: 6.4,
        zBias: -2.3,
        size: high ? .014 : .012,
        opacity: .14,
        color: "#9ab9ad",
        drift: .005,
      },
      {
        count: high ? 84 : medium ? 58 : 28,
        minRadius: 2.2,
        maxRadius: 4.4,
        zBias: .5,
        size: high ? .019 : .016,
        opacity: .075,
        color: "#d5e2dd",
        drift: .008,
      },
    ];
  }, [quality]);

  const positions = useMemo(
    () => layers.map((layer, index) => makePositions(layer, 1337 + index * 931)),
    [layers]
  );

  useFrame((state, delta) => {
    const progress = progressRef.current;
    const t = state.clock.getElapsedTime();
    const refs = [far.current, mid.current, near.current];

    refs.forEach((points, index) => {
      if (!points) return;
      const layer = layers[index];
      points.rotation.y += delta * (layer.drift + progress * .004 * (index + 1));
      points.rotation.x = Math.sin(t * (.045 + index * .012)) * (.008 + index * .004);
      points.position.x = state.pointer.x * -(index + 1) * .035;
      points.position.y = Math.sin(t * (.06 + index * .02)) * (.035 + index * .025);
    });
  });

  const refs = [far, mid, near];

  return (
    <>
      {layers.map((layer, index) => (
        <points key={index} ref={refs[index]} frustumCulled>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions[index], 3]} />
          </bufferGeometry>
          <pointsMaterial
            color={layer.color}
            size={layer.size}
            transparent
            opacity={layer.opacity}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </points>
      ))}
    </>
  );
}
