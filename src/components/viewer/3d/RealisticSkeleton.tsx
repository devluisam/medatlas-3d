"use client";

import { useRef, useMemo, useEffect, useCallback } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useViewerStore } from "@/stores/viewer.store";

const MODEL_PATH = "/models/skeleton.glb";

/**
 * Maps a mesh/node name from an arbitrary GLB model to one of our
 * known anatomical structure slugs (seeded in the database).
 * Works with most English-named skeleton models.
 */
/**
 * Classifies a raw bone/node name from the GLB into one of our seeded
 * anatomical structures. Handles side prefixes (l_/r_), numbered
 * vertebrae (c1-c7, t1-t12, l1-l5) and grouped bones (carpals, tarsals).
 */
function classifyBone(raw: string): { slug: string; label: string } | null {
  // strip side prefix: "l_femur" / "r femur" -> "femur"
  const n = raw.toLowerCase().trim().replace(/^([lr])[_ ]/, "");

  // Numbered vertebrae (bare names like "c1", "t10", "l4")
  if (/^c[1-7]$/.test(n)) return { slug: "cervical-vertebrae", label: "Vértebra Cervical" };
  if (/^t([1-9]|1[0-2])$/.test(n)) return { slug: "thoracic-vertebrae", label: "Vértebra Torácica" };
  if (/^l[1-5]$/.test(n)) return { slug: "lumbar-vertebrae", label: "Vértebra Lombar" };

  const rules: { keys: string[]; slug: string; label: string }[] = [
    { keys: ["cranium", "skull"], slug: "skull", label: "Crânio" },
    { keys: ["mandible"], slug: "mandible", label: "Mandíbula" },
    { keys: ["hyoid"], slug: "hyoid", label: "Osso Hioide" },
    { keys: ["sacrum"], slug: "sacrum", label: "Sacro" },
    { keys: ["coccyx"], slug: "coccyx", label: "Cóccix" },
    { keys: ["xiphoid", "sternum"], slug: "sternum", label: "Esterno" },
    { keys: ["rib"], slug: "ribs", label: "Costela" },
    { keys: ["clavicle"], slug: "clavicle", label: "Clavícula" },
    { keys: ["scapula"], slug: "scapula", label: "Escápula" },
    { keys: ["humerus"], slug: "humerus", label: "Úmero" },
    { keys: ["radius"], slug: "radius", label: "Rádio" },
    { keys: ["ulna"], slug: "ulna", label: "Ulna" },
    { keys: ["metacarpal"], slug: "metacarpals", label: "Metacarpo" },
    {
      keys: ["scaphoid", "lunate", "triquetral", "pisiform", "trapezium", "trapezoid", "capitate", "hamate"],
      slug: "carpals",
      label: "Osso do Carpo",
    },
    { keys: ["oscoxa"], slug: "pelvis", label: "Osso do Quadril" },
    { keys: ["patella"], slug: "patella", label: "Patela" },
    { keys: ["femur"], slug: "femur", label: "Fêmur" },
    { keys: ["fibula"], slug: "fibula", label: "Fíbula" },
    { keys: ["tibia"], slug: "tibia", label: "Tíbia" },
    { keys: ["calcaneus"], slug: "calcaneus", label: "Calcâneo" },
    { keys: ["talus"], slug: "talus", label: "Tálus" },
    { keys: ["navicular", "cuboid", "cuneiform"], slug: "tarsals", label: "Osso do Tarso" },
    { keys: ["metatarsal"], slug: "metatarsals", label: "Metatarso" },
    { keys: ["phalange", "sesamoid"], slug: "phalanges", label: "Falange" },
  ];

  for (const r of rules) {
    if (r.keys.some((k) => n.includes(k))) {
      return { slug: r.slug, label: r.label };
    }
  }
  return null;
}

/**
 * Walks up the object hierarchy from a clicked mesh until it finds a
 * node whose name matches a known structure. GLB nodes are often nested
 * (e.g. "Cranium" > "Cranium__0" > mesh), so we climb a few levels.
 */
function findMatch(
  obj: THREE.Object3D | null
): { slug: string; label: string } | null {
  let current: THREE.Object3D | null = obj;
  let depth = 0;
  while (current && depth < 8) {
    if (current.name) {
      const m = classifyBone(current.name);
      if (m) return m;
    }
    current = current.parent;
    depth++;
  }
  return null;
}

interface Props {
  onStructureClick: (structureId: string) => void;
  rotate: boolean;
}

export function RealisticSkeleton({ onStructureClick, rotate }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_PATH);
  const { camera, size } = useThree();
  const { setLastHit, selectStructure, selectedStructureId } = useViewerStore();

  // Clone, auto-center, auto-scale and apply a bone-like material
  const model = useMemo(() => {
    const cloned = scene.clone(true);

    // Compute bounding box to normalize size & position
    const box = new THREE.Box3().setFromObject(cloned);
    const sizeVec = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);
    const targetHeight = 1.9; // meters in our scene
    const scale = maxDim > 0 ? targetHeight / maxDim : 1;

    cloned.scale.setScalar(scale);
    // Recenter horizontally, place feet near y=0
    cloned.position.set(
      -center.x * scale,
      -box.min.y * scale,
      -center.z * scale
    );

    const boneMaterial = new THREE.MeshStandardMaterial({
      color: "#d8cbb2",
      roughness: 0.72,
      metalness: 0.04,
      envMapIntensity: 0.6,
    });

    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // Keep original material if it has textures, else apply bone material
        const hasTexture =
          child.material &&
          (child.material as THREE.MeshStandardMaterial).map != null;
        if (!hasTexture) {
          child.material = boneMaterial;
        }
      }
    });

    return cloned;
  }, [scene]);

  // Idle rotation when nothing selected
  useFrame((_, delta) => {
    if (groupRef.current && rotate && !selectedStructureId) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  const handlePointerOver = useCallback(
    (e: any) => {
      e.stopPropagation();
      const match = findMatch(e.object);
      document.body.style.cursor = match ? "pointer" : "default";
      if (!match) return;

      const pos = new THREE.Vector3();
      e.object.getWorldPosition(pos);
      pos.project(camera);
      setLastHit({
        structureId: match.slug,
        structureName: match.label,
        system: "skeletal",
        position: [pos.x, pos.y, pos.z],
        screenPosition: {
          x: (pos.x * 0.5 + 0.5) * size.width,
          y: (-pos.y * 0.5 + 0.5) * size.height,
        },
      });
    },
    [camera, setLastHit, size]
  );

  const handlePointerOut = useCallback(() => {
    document.body.style.cursor = "default";
    setLastHit(null);
  }, [setLastHit]);

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      const match = findMatch(e.object);
      if (!match) return;
      selectStructure(match.slug);
      onStructureClick(match.slug);
    },
    [onStructureClick, selectStructure]
  );

  return (
    <group
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <primitive object={model} />
    </group>
  );
}
