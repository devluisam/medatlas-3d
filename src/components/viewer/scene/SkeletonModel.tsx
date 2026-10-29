"use client";

import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useViewerStore, type CutState } from "@/stores/viewer.store";
import { MODEL_PATH } from "@/lib/anatomy/model-credit";
import { buildModelIndex, partOf, UNMAPPED_KEY, type ModelIndex } from "./model-index";
import { useModelIndexStore } from "./model-index-store";

const BONE = new THREE.Color("#e4d9c3");
const SELECTED = new THREE.Color("#f3e9d2");
const SELECTED_EMISSIVE = new THREE.Color("#1d6fb8");
const HOVER_EMISSIVE = new THREE.Color("#3a5470");
const NO_EMISSIVE = new THREE.Color("#000000");

/** Plano de corte no espaço da cena a partir do estado da interface. */
export function cutPlane(cut: CutState, bounds: THREE.Box3): { plane: THREE.Plane; coord: number } {
  const axis = cut.axis === "sagittal" ? "x" : cut.axis === "coronal" ? "z" : "y";
  const min = bounds.min[axis];
  const max = bounds.max[axis];
  const coord = (min + max) / 2 + (cut.position * (max - min)) / 2;
  const normal = new THREE.Vector3(axis === "x" ? 1 : 0, axis === "y" ? 1 : 0, axis === "z" ? 1 : 0);
  if (cut.flip) normal.negate();
  // Mantém os pontos com normal·p − coord ≥ 0
  return { plane: new THREE.Plane(normal, cut.flip ? coord : -coord), coord };
}

function applyVisualState(index: ModelIndex, state: ReturnType<typeof useViewerStore.getState>, hoverSlug: string | null) {
  const { selectedSlug, hidden, isolate, renderMode, xrayOpacity, skeletonVisible, cut } = state;
  const planes = cut.enabled ? [cutPlane(cut, index.bounds).plane] : [];

  for (const [slug, material] of index.materials) {
    const isSelected = slug === selectedSlug;
    const isHover = slug === hoverSlug && !isSelected;
    const visible =
      skeletonVisible && !hidden[slug] && !(isolate && selectedSlug !== null && !isSelected);
    for (const mesh of index.meshesBySlug.get(slug) ?? []) mesh.visible = visible;

    const ghost = renderMode === "xray" && !isSelected;
    const side = cut.enabled ? THREE.DoubleSide : THREE.FrontSide;
    // Trocar transparência, lado ou planos de corte recompila o shader: só quando muda
    if (material.transparent !== ghost || material.side !== side || material.clippingPlanes?.length !== planes.length) {
      material.needsUpdate = true;
    }
    material.transparent = ghost;
    material.opacity = ghost ? xrayOpacity : 1;
    material.depthWrite = !ghost;
    material.side = side;
    material.clippingPlanes = planes;
    material.wireframe = renderMode === "wireframe";
    material.color.copy(isSelected ? SELECTED : BONE);
    material.emissive.copy(isSelected ? SELECTED_EMISSIVE : isHover ? HOVER_EMISSIVE : NO_EMISSIVE);
    material.emissiveIntensity = isSelected ? 0.55 : isHover ? 0.45 : 0;
  }
}

export function SkeletonModel() {
  const { scene } = useGLTF(MODEL_PATH, false, true);
  const invalidate = useThree((s) => s.invalidate);
  const index = useMemo(() => buildModelIndex(scene), [scene]);
  const setIndex = useModelIndexStore((s) => s.setIndex);
  const setModelStatus = useViewerStore((s) => s.setModelStatus);
  const setHover = useViewerStore((s) => s.setHover);
  const select = useViewerStore((s) => s.select);

  useEffect(() => {
    setIndex(index);
    setModelStatus("ready");
    if (index.unmatched.length && process.env.NODE_ENV === "development") {
      console.warn("[MEDATLAS] malhas sem estrutura no atlas:", index.unmatched);
    }
    // Com frameloop "demand", o primeiro quadro após a carga podia se perder
    // (canvas redimensionado logo depois) e a cena ficava vazia até mexer o mouse.
    // Alguns quadros extras garantem que o modelo aparece.
    let frames = 0;
    let raf = 0;
    const warmUp = () => {
      invalidate();
      if (++frames < 10) raf = requestAnimationFrame(warmUp);
    };
    raf = requestAnimationFrame(warmUp);
    return () => {
      cancelAnimationFrame(raf);
      setIndex(null);
      index.dispose();
    };
  }, [index, setIndex, setModelStatus, invalidate]);

  // Reaplica materiais e visibilidade sempre que o estado visual muda
  useEffect(() => {
    let lastHover: string | null = null;
    const apply = () => {
      const state = useViewerStore.getState();
      lastHover = state.hover?.slug ?? null;
      applyVisualState(index, state, lastHover);
      invalidate();
    };
    apply();
    return useViewerStore.subscribe((state, prev) => {
      const hoverSlug = state.hover?.slug ?? null;
      const changed =
        state.selectedSlug !== prev.selectedSlug ||
        state.hidden !== prev.hidden ||
        state.isolate !== prev.isolate ||
        state.renderMode !== prev.renderMode ||
        state.xrayOpacity !== prev.xrayOpacity ||
        state.skeletonVisible !== prev.skeletonVisible ||
        state.cut !== prev.cut ||
        hoverSlug !== lastHover;
      if (changed) apply();
    });
  }, [index, invalidate]);

  /** Ignora interseções escondidas pelo corte ou ocultas — o evento segue para a próxima. */
  const pickable = (e: ThreeEvent<PointerEvent | MouseEvent>) => {
    if (!e.object.visible) return false;
    const { cut } = useViewerStore.getState();
    if (cut.enabled && cutPlane(cut, index.bounds).plane.distanceToPoint(e.point) < 0) return false;
    return true;
  };

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!pickable(e)) return;
    e.stopPropagation();
    const data = partOf(e.object);
    if (!data || e.pointerType !== "mouse") return;
    document.body.style.cursor = data.part.slug ? "pointer" : "default";
    setHover({ slug: data.part.slug ?? UNMAPPED_KEY, label: data.label, x: e.clientX, y: e.clientY });
  };

  const onPointerOut = () => {
    document.body.style.cursor = "";
    setHover(null);
  };

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    // Arrastar para girar não seleciona
    if (e.delta > 6 || !pickable(e)) return;
    e.stopPropagation();
    const data = partOf(e.object);
    if (data?.part.slug) select(data.part.slug);
  };

  return <primitive object={index.root} onPointerMove={onPointerMove} onPointerOut={onPointerOut} onClick={onClick} />;
}

useGLTF.preload(MODEL_PATH, false, true);
