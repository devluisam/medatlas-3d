"use client";

import { useRef, useMemo, useCallback, Suspense } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useViewerStore } from "@/stores/viewer.store";
import type { AnatomicalSystemKey } from "@/types";
import { ModelErrorBoundary } from "./ModelErrorBoundary";
import { RealisticSkeleton } from "./RealisticSkeleton";

// Material config per system
const SYSTEM_MATERIALS: Record<
  AnatomicalSystemKey,
  { color: string; opacity: number; roughness: number; metalness: number }
> = {
  integumentary: { color: "#d4956b", opacity: 0.85, roughness: 0.8, metalness: 0 },
  muscular_superficial: { color: "#c0392b", opacity: 1, roughness: 0.7, metalness: 0 },
  muscular_deep: { color: "#8e1b1b", opacity: 1, roughness: 0.7, metalness: 0 },
  skeletal: { color: "#f0ebe0", opacity: 1, roughness: 0.6, metalness: 0.05 },
  nervous: { color: "#f5d020", opacity: 0.95, roughness: 0.5, metalness: 0.1 },
  arterial: { color: "#c0392b", opacity: 1, roughness: 0.4, metalness: 0.2 },
  venous: { color: "#2e4bc6", opacity: 1, roughness: 0.4, metalness: 0.2 },
  lymphatic: { color: "#6ab04c", opacity: 0.9, roughness: 0.6, metalness: 0 },
  respiratory: { color: "#74b9ff", opacity: 0.9, roughness: 0.5, metalness: 0 },
  digestive: { color: "#e17055", opacity: 0.95, roughness: 0.6, metalness: 0 },
  urinary: { color: "#fdcb6e", opacity: 0.95, roughness: 0.6, metalness: 0 },
  endocrine: { color: "#a29bfe", opacity: 0.9, roughness: 0.5, metalness: 0.1 },
  reproductive_male: { color: "#74b9ff", opacity: 0.95, roughness: 0.6, metalness: 0 },
  reproductive_female: { color: "#fd79a8", opacity: 0.95, roughness: 0.6, metalness: 0 },
};

interface HumanBodyModelProps {
  onStructureClick: (structureId: string) => void;
}

/**
 * HumanBodyModel renders the 3D anatomy model.
 * Each mesh is tagged with userData.structureId and userData.system.
 * In production, replace the placeholder geometry with actual GLTF models.
 */
export function HumanBodyModel({ onStructureClick }: HumanBodyModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const {
    visibleSystems,
    selectedStructureId,
    highlightedStructureId,
    renderMode,
    cuttingPlane,
    setLastHit,
    selectStructure,
  } = useViewerStore();

  const { camera, gl, size } = useThree();

  // Idle rotation disabled — the skeleton stays still facing the camera.
  // The user controls the view manually via orbit controls.

  const handlePointerOver = useCallback(
    (e: THREE.Event, mesh: THREE.Mesh) => {
      (e as any).stopPropagation();
      const id = mesh.userData.structureId as string;
      if (!id) return;
      document.body.style.cursor = "pointer";
      const pos = new THREE.Vector3();
      mesh.getWorldPosition(pos);
      pos.project(camera);
      const x = (pos.x * 0.5 + 0.5) * size.width;
      const y = (-pos.y * 0.5 + 0.5) * size.height;
      setLastHit({
        structureId: id,
        structureName: mesh.userData.structureName ?? id,
        system: mesh.userData.system,
        position: [pos.x, pos.y, pos.z],
        screenPosition: { x, y },
      });
    },
    [camera, setLastHit, size]
  );

  const handlePointerOut = useCallback(() => {
    document.body.style.cursor = "default";
    setLastHit(null);
  }, [setLastHit]);

  const handleClick = useCallback(
    (e: THREE.Event, mesh: THREE.Mesh) => {
      (e as any).stopPropagation();
      const id = mesh.userData.structureId as string;
      if (!id) return;
      selectStructure(id);
      onStructureClick(id);
    },
    [onStructureClick, selectStructure]
  );

  const placeholder = (
    <SkeletalPlaceholder
      visible={visibleSystems.has("skeletal")}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    />
  );

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {/*
       * Tries to load a real GLB skeleton from public/models/skeleton.glb.
       * If the file is missing or fails to load, falls back to the
       * procedural placeholder body — so the viewer never breaks.
       */}
      <ModelErrorBoundary fallback={placeholder}>
        <Suspense fallback={placeholder}>
          <RealisticSkeleton onStructureClick={onStructureClick} rotate={false} />
        </Suspense>
      </ModelErrorBoundary>
    </group>
  );
}

// ── Placeholder skeleton (capsule body + sphere head) ──────────────

function SkeletalPlaceholder({
  visible,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  visible: boolean;
  onPointerOver: (e: THREE.Event, mesh: THREE.Mesh) => void;
  onPointerOut: () => void;
  onClick: (e: THREE.Event, mesh: THREE.Mesh) => void;
}) {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: SYSTEM_MATERIALS.skeletal.color,
        roughness: SYSTEM_MATERIALS.skeletal.roughness,
        metalness: SYSTEM_MATERIALS.skeletal.metalness,
      }),
    []
  );

  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <group visible={visible}>
      {/* Head */}
      <mesh
        ref={meshRef}
        position={[0, 2.55, 0]}
        castShadow
        receiveShadow
        material={mat}
        userData={{ structureId: "skull", structureName: "Crânio", system: "skeletal" }}
        onPointerOver={(e) => meshRef.current && onPointerOver(e as any, meshRef.current)}
        onPointerOut={onPointerOut}
        onClick={(e) => meshRef.current && onClick(e as any, meshRef.current)}
      >
        <sphereGeometry args={[0.22, 32, 32]} />
      </mesh>

      {/* Torso */}
      <mesh
        position={[0, 1.7, 0]}
        castShadow
        receiveShadow
        material={mat}
        userData={{ structureId: "thorax", structureName: "Tórax", system: "skeletal" }}
        onPointerOver={(e) => {
          const m = e.object as THREE.Mesh;
          onPointerOver(e as any, m);
        }}
        onPointerOut={onPointerOut}
        onClick={(e) => {
          const m = e.object as THREE.Mesh;
          onClick(e as any, m);
        }}
      >
        <capsuleGeometry args={[0.28, 0.8, 8, 16]} />
      </mesh>

      {/* Pelvis */}
      <mesh
        position={[0, 1.05, 0]}
        castShadow
        receiveShadow
        material={mat}
        userData={{ structureId: "pelvis", structureName: "Pelve", system: "skeletal" }}
        onPointerOver={(e) => {
          const m = e.object as THREE.Mesh;
          onPointerOver(e as any, m);
        }}
        onPointerOut={onPointerOut}
        onClick={(e) => {
          const m = e.object as THREE.Mesh;
          onClick(e as any, m);
        }}
      >
        <capsuleGeometry args={[0.24, 0.3, 8, 16]} />
      </mesh>

      {/* Left thigh */}
      <mesh
        position={[-0.13, 0.55, 0]}
        castShadow
        receiveShadow
        material={mat}
        userData={{ structureId: "femur", structureName: "Fêmur Esquerdo", system: "skeletal" }}
        onPointerOver={(e) => {
          const m = e.object as THREE.Mesh;
          onPointerOver(e as any, m);
        }}
        onPointerOut={onPointerOut}
        onClick={(e) => {
          const m = e.object as THREE.Mesh;
          onClick(e as any, m);
        }}
      >
        <capsuleGeometry args={[0.09, 0.48, 8, 16]} />
      </mesh>

      {/* Right thigh */}
      <mesh
        position={[0.13, 0.55, 0]}
        castShadow
        receiveShadow
        material={mat}
        userData={{ structureId: "femur", structureName: "Fêmur Direito", system: "skeletal" }}
        onPointerOver={(e) => {
          const m = e.object as THREE.Mesh;
          onPointerOver(e as any, m);
        }}
        onPointerOut={onPointerOut}
        onClick={(e) => {
          const m = e.object as THREE.Mesh;
          onClick(e as any, m);
        }}
      >
        <capsuleGeometry args={[0.09, 0.48, 8, 16]} />
      </mesh>

      {/* Left leg */}
      <mesh
        position={[-0.13, -0.08, 0]}
        castShadow
        receiveShadow
        material={mat}
        userData={{ structureId: "tibia", structureName: "Tíbia Esquerda", system: "skeletal" }}
        onPointerOver={(e) => {
          const m = e.object as THREE.Mesh;
          onPointerOver(e as any, m);
        }}
        onPointerOut={onPointerOut}
        onClick={(e) => {
          const m = e.object as THREE.Mesh;
          onClick(e as any, m);
        }}
      >
        <capsuleGeometry args={[0.07, 0.44, 8, 16]} />
      </mesh>

      {/* Right leg */}
      <mesh
        position={[0.13, -0.08, 0]}
        castShadow
        receiveShadow
        material={mat}
        userData={{ structureId: "tibia", structureName: "Tíbia Direita", system: "skeletal" }}
        onPointerOver={(e) => {
          const m = e.object as THREE.Mesh;
          onPointerOver(e as any, m);
        }}
        onPointerOut={onPointerOut}
        onClick={(e) => {
          const m = e.object as THREE.Mesh;
          onClick(e as any, m);
        }}
      >
        <capsuleGeometry args={[0.07, 0.44, 8, 16]} />
      </mesh>

      {/* Left arm */}
      <mesh
        position={[-0.46, 1.75, 0]}
        rotation={[0, 0, 0.3]}
        castShadow
        receiveShadow
        material={mat}
        userData={{ structureId: "humerus", structureName: "Úmero Esquerdo", system: "skeletal" }}
        onPointerOver={(e) => {
          const m = e.object as THREE.Mesh;
          onPointerOver(e as any, m);
        }}
        onPointerOut={onPointerOut}
        onClick={(e) => {
          const m = e.object as THREE.Mesh;
          onClick(e as any, m);
        }}
      >
        <capsuleGeometry args={[0.06, 0.38, 8, 16]} />
      </mesh>

      {/* Right arm */}
      <mesh
        position={[0.46, 1.75, 0]}
        rotation={[0, 0, -0.3]}
        castShadow
        receiveShadow
        material={mat}
        userData={{ structureId: "humerus", structureName: "Úmero Direito", system: "skeletal" }}
        onPointerOver={(e) => {
          const m = e.object as THREE.Mesh;
          onPointerOver(e as any, m);
        }}
        onPointerOut={onPointerOut}
        onClick={(e) => {
          const m = e.object as THREE.Mesh;
          onClick(e as any, m);
        }}
      >
        <capsuleGeometry args={[0.06, 0.38, 8, 16]} />
      </mesh>
    </group>
  );
}
