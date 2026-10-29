"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useViewerStore } from "@/stores/viewer.store";
import { useModelIndexStore } from "./model-index-store";
import { cutPlane } from "./SkeletonModel";

/** Indicação visual do plano de corte (o corte em si é feito por clipping nos materiais). */
export function CutPlaneHelper() {
  const cut = useViewerStore((s) => s.cut);
  const index = useModelIndexStore((s) => s.index);

  const placement = useMemo(() => {
    if (!index || !cut.enabled) return null;
    const { coord } = cutPlane(cut, index.bounds);
    const size = index.bounds.getSize(new THREE.Vector3());
    const center = index.bounds.getCenter(new THREE.Vector3());
    const pad = 1.15;
    if (cut.axis === "sagittal") {
      return { position: [coord, center.y, center.z] as const, rotation: [0, Math.PI / 2, 0] as const, scale: [size.z * pad, size.y * pad] as const };
    }
    if (cut.axis === "coronal") {
      return { position: [center.x, center.y, coord] as const, rotation: [0, 0, 0] as const, scale: [size.x * pad, size.y * pad] as const };
    }
    return { position: [center.x, coord, center.z] as const, rotation: [-Math.PI / 2, 0, 0] as const, scale: [size.x * pad, size.z * pad] as const };
  }, [cut, index]);

  if (!placement) return null;
  return (
    <group position={placement.position as unknown as THREE.Vector3Tuple} rotation={placement.rotation as unknown as THREE.Vector3Tuple}>
      <mesh raycast={() => null}>
        <planeGeometry args={[placement.scale[0], placement.scale[1]]} />
        <meshBasicMaterial color="#3aa0ff" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <lineSegments raycast={() => null}>
        <edgesGeometry args={[new THREE.PlaneGeometry(placement.scale[0], placement.scale[1])]} />
        <lineBasicMaterial color="#3aa0ff" transparent opacity={0.6} />
      </lineSegments>
    </group>
  );
}
