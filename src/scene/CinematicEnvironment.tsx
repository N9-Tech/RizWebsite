"use client";

import { ContactShadows } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useExperience } from "./ExperienceContext";

const volumeVertex = `
  varying vec3 vWorld;
  varying vec3 vNormalW;
  void main(){
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const volumeFragment = `
  uniform float uTime;
  uniform float uProgress;
  varying vec3 vWorld;
  varying vec3 vNormalW;

  float hash(vec3 p){
    p = fract(p * .1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  void main(){
    vec3 viewDir = normalize(cameraPosition - vWorld);
    float fresnel = pow(1.0 - abs(dot(normalize(vNormalW), viewDir)), 2.6);
    float grain = hash(floor(vWorld * 3.8 + uTime * .08));
    float vertical = smoothstep(-4.5, 3.5, vWorld.y);
    float pulse = .82 + sin(uTime * .17) * .08;
    vec3 cold = vec3(.025, .045, .042);
    vec3 green = vec3(.15, .42, .34);
    vec3 color = mix(cold, green, .18 + uProgress * .11 + fresnel * .13);
    float alpha = (.045 + fresnel * .07 + grain * .014) * pulse * (1.0 - vertical * .22);
    gl_FragColor = vec4(color, alpha);
  }
`;

function AtmosphereVolume() {
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
    },
    vertexShader: volumeVertex,
    fragmentShader: volumeFragment,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    toneMapped: false,
  }), []);
  const { progressRef } = useExperience();

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.getElapsedTime();
    material.uniforms.uProgress.value = progressRef.current;
  });

  return (
    <mesh position={[.7, .1, -1.8]} scale={[1.18, .92, 1.35]} material={material}>
      <sphereGeometry args={[8.5, 24, 16]} />
    </mesh>
  );
}

function LightShafts() {
  const group = useRef<THREE.Group>(null);
  const { progressRef } = useExperience();

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    const p = progressRef.current;
    const targetY = -.15 + Math.sin(t * .11) * .12 - p * .18;
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, targetY, 1.6, delta);
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, -.12 + p * .08, 1.4, delta);
  });

  return (
    <group ref={group} position={[1.4, -.1, -3.1]} rotation={[-.18, 0, -.12]}>
      <mesh position={[1.2, 1.4, 0]} rotation={[0, 0, -.22]} scale={[1.3, 4.8, 1.3]}>
        <coneGeometry args={[.65, 3.8, 20, 1, true]} />
        <meshBasicMaterial color="#8fe6c3" transparent opacity={.018} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[-1.8, .4, -.8]} rotation={[0, 0, .16]} scale={[1.5, 5.7, 1.5]}>
        <coneGeometry args={[.72, 4.4, 20, 1, true]} />
        <meshBasicMaterial color="#6ea995" transparent opacity={.012} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function DistantArchitecture() {
  const group = useRef<THREE.Group>(null);
  const { progressRef } = useExperience();

  const pieces = useMemo(() => [
    [-4.7, -1.0, -6.3, .45, 4.8, .8],
    [-3.5, .2, -7.7, .22, 6.4, .55],
    [4.4, -.4, -8.4, .5, 5.6, .7],
    [5.8, .7, -10.2, .26, 7.4, .46],
    [1.0, 3.9, -9.5, 7.8, .18, .5],
    [-.8, -3.7, -7.4, 8.8, .14, .5],
  ] as const, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    const p = progressRef.current;
    const targetX = -p * .34;
    const targetY = Math.sin(state.clock.getElapsedTime() * .08) * .07;
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, targetX, 1.2, delta);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, targetY, 1.2, delta);
  });

  return (
    <group ref={group}>
      {pieces.map((item, i) => (
        <mesh key={i} position={[item[0], item[1], item[2]]}>
          <boxGeometry args={[item[3], item[4], item[5]]} />
          <meshStandardMaterial
            color={i % 2 ? "#101516" : "#0b0f10"}
            metalness={.55}
            roughness={.74}
            transparent
            opacity={.42}
          />
        </mesh>
      ))}
    </group>
  );
}

function DeepBokeh() {
  const points = useRef<THREE.Points>(null);
  const { quality, progressRef } = useExperience();
  const count = quality === "high" ? 160 : quality === "medium" ? 96 : 48;

  const positions = useMemo(() => {
    let seed = 7341;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      data[i * 3] = (rnd() - .5) * 15 + .8;
      data[i * 3 + 1] = (rnd() - .5) * 9;
      data[i * 3 + 2] = -2.5 - rnd() * 13;
    }
    return data;
  }, [count]);

  useFrame((state, delta) => {
    if (!points.current) return;
    const p = progressRef.current;
    points.current.rotation.y += delta * (.004 + p * .004);
    points.current.position.x = Math.sin(state.clock.getElapsedTime() * .055) * .12 - p * .18;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#d7eee5"
        size={quality === "low" ? .035 : .055}
        sizeAttenuation
        transparent
        opacity={.105}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

export default function CinematicEnvironment() {
  return (
    <>
      <AtmosphereVolume />
      <DistantArchitecture />
      <LightShafts />
      <DeepBokeh />
      <ContactShadows
        position={[1.35, -2.16, .1]}
        opacity={.28}
        scale={7.2}
        blur={3.8}
        far={5.5}
        resolution={512}
        color="#000000"
      />
    </>
  );
}
