"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CuttingPlane } from "@/types";

interface Props {
  plane: CuttingPlane;
}

export function CuttingPlaneHelper({ plane }: Props) {
  const ref = useRef<THREE.Mesh>(null);

  const getRotation = (): [number, number, number] => {
    switch (plane.axis) {
      case "sagittal": return [0, 0, Math.PI / 2];
      case "coronal": return [Math.PI / 2, 0, 0];
      case "transversal": return [0, 0, 0];
      default: return [0, 0, 0];
    }
  };

  const getPosition = (): [number, number, number] => {
    const p = plane.position * 2;
    switch (plane.axis) {
      case "sagittal": return [p, 0.9, 0];
      case "coronal": return [0, 0.9, p];
      case "transversal": return [0, 0.9 + p, 0];
      default: return [0, 0.9, 0];
    }
  };

  return (
    <mesh
      ref={ref}
      position={getPosition()}
      rotation={getRotation()}
    >
      <planeGeometry args={[3, 3, 1, 1]} />
      <meshBasicMaterial
        color="#3b82f6"
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
