"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

function RotatingBody() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.4;
  });

  const mat = new THREE.MeshStandardMaterial({
    color: "#e0f0ff",
    roughness: 0.4,
    metalness: 0.1,
    emissive: new THREE.Color("#1e4080"),
    emissiveIntensity: 0.15,
    transparent: true,
    opacity: 0.92,
  });

  return (
    <group ref={ref} position={[0, -0.8, 0]}>
      <mesh position={[0, 2.55, 0]} castShadow material={mat}>
        <sphereGeometry args={[0.22, 32, 32]} />
      </mesh>
      <mesh position={[0, 1.7, 0]} castShadow material={mat}>
        <capsuleGeometry args={[0.28, 0.8, 8, 16]} />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow material={mat}>
        <capsuleGeometry args={[0.24, 0.3, 8, 16]} />
      </mesh>
      <mesh position={[-0.13, 0.55, 0]} castShadow material={mat}>
        <capsuleGeometry args={[0.09, 0.48, 8, 16]} />
      </mesh>
      <mesh position={[0.13, 0.55, 0]} castShadow material={mat}>
        <capsuleGeometry args={[0.09, 0.48, 8, 16]} />
      </mesh>
      <mesh position={[-0.13, -0.08, 0]} castShadow material={mat}>
        <capsuleGeometry args={[0.07, 0.44, 8, 16]} />
      </mesh>
      <mesh position={[0.13, -0.08, 0]} castShadow material={mat}>
        <capsuleGeometry args={[0.07, 0.44, 8, 16]} />
      </mesh>
      <mesh position={[-0.46, 1.75, 0]} rotation={[0, 0, 0.3]} castShadow material={mat}>
        <capsuleGeometry args={[0.06, 0.38, 8, 16]} />
      </mesh>
      <mesh position={[0.46, 1.75, 0]} rotation={[0, 0, -0.3]} castShadow material={mat}>
        <capsuleGeometry args={[0.06, 0.38, 8, 16]} />
      </mesh>
    </group>
  );
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.8, 3.5], fov: 45 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.4,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} color="#a8d8ff" />
        <directionalLight position={[5, 8, 5]} intensity={1.5} color="#ffffff" castShadow />
        <pointLight position={[0, 2, 2]} intensity={0.8} color="#3b82f6" />
        <pointLight position={[-2, 1, -2]} intensity={0.4} color="#06b6d4" />

        <Environment preset="city" background={false} />
        <RotatingBody />
        <ContactShadows position={[0, -1.85, 0]} opacity={0.5} scale={3} blur={3} color="#0a1628" />

        <EffectComposer>
          <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} intensity={0.8} />
          <Vignette offset={0.3} darkness={0.6} />
        </EffectComposer>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          target={[0, 0.5, 0]}
        />
      </Suspense>
    </Canvas>
  );
}
