"use client";

import { Suspense, useRef, useCallback } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  BakeShadows,
  AdaptiveDpr,
  AdaptiveEvents,
  Preload,
  Stats,
} from "@react-three/drei";
import {
  EffectComposer,
  SSAO,
  Bloom,
  ChromaticAberration,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { useViewerStore } from "@/stores/viewer.store";
import { HumanBodyModel } from "./HumanBodyModel";
import { CuttingPlaneHelper } from "./CuttingPlaneHelper";
import { GridFloor } from "./GridFloor";

interface AnatomyCanvasProps {
  onStructureClick: (structureId: string) => void;
}

function Scene({ onStructureClick }: AnatomyCanvasProps) {
  const { cuttingPlane, renderMode } = useViewerStore();

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} color="#e8f4fd" />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={30}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} color="#a8c8f0" />
      <pointLight position={[0, 3, 2]} intensity={0.3} color="#60a5fa" />

      {/* HDR Environment */}
      <Environment preset="studio" background={false} />

      {/* Main body model */}
      <HumanBodyModel onStructureClick={onStructureClick} />

      {/* Cutting plane helper */}
      {cuttingPlane && <CuttingPlaneHelper plane={cuttingPlane} />}

      {/* Grid floor */}
      <GridFloor />

      {/* Contact shadow */}
      <ContactShadows
        position={[0, -1.05, 0]}
        opacity={0.4}
        scale={3}
        blur={2}
        far={4}
        color="#1e3a5f"
      />

      {/* Post processing */}
      <EffectComposer multisampling={renderMode === "realistic" ? 4 : 0}>
        <SSAO
          blendFunction={BlendFunction.MULTIPLY}
          samples={16}
          radius={0.05}
          intensity={6}
        />
        <Bloom
          luminanceThreshold={0.92}
          luminanceSmoothing={0.9}
          intensity={0.18}
          blendFunction={BlendFunction.ADD}
        />
        <Vignette eskil={false} offset={0.2} darkness={0.5} />
      </EffectComposer>

      {/* Controls */}
      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableRotate
        minDistance={0.5}
        maxDistance={8}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.05}
      />

      {/* Performance */}
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
      <BakeShadows />
      <Preload all />
    </>
  );
}

export function AnatomyCanvas({ onStructureClick }: AnatomyCanvasProps) {
  return (
    <Canvas
      className="viewer-canvas"
      camera={{
        position: [0, 0, 3.4],
        fov: 45,
        near: 0.01,
        far: 100,
      }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        outputColorSpace: THREE.SRGBColorSpace,
        powerPreference: "high-performance",
      }}
      shadows="soft"
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
    >
      <Suspense fallback={null}>
        <Scene onStructureClick={onStructureClick} />
      </Suspense>
    </Canvas>
  );
}
