"use client";

import { useCallback, useEffect, useRef } from "react";
import { CameraControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { useViewerStore, type ViewPreset } from "@/stores/viewer.store";
import { useModelIndexStore } from "./model-index-store";
import type { ModelIndex } from "./model-index";

const PADDING = { paddingTop: 0.12, paddingBottom: 0.12, paddingLeft: 0.12, paddingRight: 0.12 };
/** Margem ao enquadrar uma estrutura: proporcional ao tamanho dela (um carpal não pede 30 cm de folga). */
function focusPadding(box: THREE.Box3, compact = false) {
  const size = box.getSize(new THREE.Vector3());
  // No celular com o painel aberto só ~1/3 de cima fica livre: folga maior
  const p = Math.max(0.03, Math.max(size.x, size.y, size.z) * (compact ? 1.1 : 0.35));
  return { paddingTop: p, paddingBottom: p, paddingLeft: p, paddingRight: p };
}
// Dimensões do layout (ViewerLayout): painel de estudo 26rem + margens, lista 16rem + margens
const PANEL_PX = 26 * 16 + 24;
const NAV_PX = 17 * 16;
const MOBILE_MAX = 768;
const DESKTOP_NAV_MIN = 1024;

function directionFor(view: ViewPreset, index: ModelIndex): THREE.Vector3 {
  switch (view) {
    case "anterior":
      return index.anterior.clone();
    case "posterior":
      return index.anterior.clone().negate();
    case "left":
      return index.left.clone();
    case "right":
      return index.left.clone().negate();
    case "superior":
      // levemente inclinado para frente: evita a singularidade do polo
      return new THREE.Vector3(0, 1, 0).addScaledVector(index.anterior, 0.02).normalize();
  }
}

/** Ângulos do camera-controls (azimute em torno de Y, polar a partir de +Y). */
function angles(dir: THREE.Vector3) {
  return { azimuth: Math.atan2(dir.x, dir.z), polar: Math.acos(THREE.MathUtils.clamp(dir.y, -1, 1)) };
}

/**
 * Câmera orbital (mouse, toque e teclado). Executa os comandos da interface:
 * restaurar, vistas anatômicas e enquadrar uma estrutura.
 */
export function CameraRig() {
  const ref = useRef<CameraControls>(null);
  const index = useModelIndexStore((s) => s.index);
  const command = useViewerStore((s) => s.cameraCommand);
  const reduced = useReducedMotion();
  const smooth = !reduced;

  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  const panelOpen = useViewerStore((s) => s.panelOpen);

  /**
   * O painel de estudo cobre parte do canvas (direita no desktop, metade de
   * baixo no celular). Desloca a câmera para que o alvo fique no centro da
   * área livre, sem mudar o ponto em torno do qual ela gira.
   */
  const applyFocalOffset = useCallback(
    (transition: boolean) => {
      const controls = ref.current;
      if (!controls || size.width === 0) return;
      const camera = controls.camera as THREE.PerspectiveCamera;
      // Distância final do enquadramento (a atual ainda pode estar em transição)
      const distance = controls.getSpherical(new THREE.Spherical(), true).radius;
      const visibleH = 2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const visibleW = visibleH * camera.aspect;
      let x = 0;
      let y = 0;
      if (useViewerStore.getState().panelOpen) {
        if (size.width < MOBILE_MAX) {
          // Folha inferior ocupa ~62% da altura: o centro livre fica a ~19% do topo
          y = (0.5 - 0.19) * visibleH;
        } else {
          const navPx = size.width >= DESKTOP_NAV_MIN ? NAV_PX : 0;
          x = ((PANEL_PX - navPx) / 2 / size.width) * visibleW;
        }
      }
      void controls.setFocalOffset(x, y, 0, transition);
    },
    [size.width]
  );

  useEffect(() => applyFocalOffset(smooth), [panelOpen, size.width, size.height, applyFocalOffset, smooth]);

  const compactPanel = useCallback(() => size.width < MOBILE_MAX && useViewerStore.getState().panelOpen, [size.width]);

  // Enquadramento inicial: vista anterior da estrutura vinda da URL, ou do corpo inteiro.
  // Espera o canvas ter tamanho — com 0×0 a distância calculada é inválida e a cena some.
  const framedIndex = useRef<ModelIndex | null>(null);
  useEffect(() => {
    const controls = ref.current;
    if (!controls || !index || size.width === 0 || size.height === 0 || framedIndex.current === index) return;
    // Um quadro depois: a câmera já tem o aspecto do canvas
    const raf = requestAnimationFrame(() => {
      framedIndex.current = index;
      const { azimuth, polar } = angles(directionFor("anterior", index));
      void controls.rotateTo(azimuth, polar, false);
      const selected = useViewerStore.getState().selectedSlug;
      const box = selected ? index.boxes.get(selected) : undefined;
      void controls.fitToBox(box ?? index.bounds, false, box ? focusPadding(box, compactPanel()) : PADDING);
      applyFocalOffset(false);
      invalidate();
    });
    return () => cancelAnimationFrame(raf);
  }, [index, size.width, size.height, invalidate, applyFocalOffset, compactPanel]);

  useEffect(() => {
    const controls = ref.current;
    if (!controls || !index || !command) return;
    if (command.kind === "reset" || command.kind === "view") {
      const { azimuth, polar } = angles(directionFor(command.kind === "view" ? command.view : "anterior", index));
      void controls.rotateTo(azimuth, polar, smooth);
      void controls.fitToBox(index.bounds, smooth, PADDING).then(() => applyFocalOffset(smooth));
    } else {
      const box = index.boxes.get(command.slug);
      if (box) void controls.fitToBox(box, smooth, focusPadding(box, compactPanel())).then(() => applyFocalOffset(smooth));
    }
  }, [command, index, smooth, applyFocalOffset, compactPanel]);

  // Teclado: setas giram, +/- aproximam, quando o foco não está num campo de texto
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const controls = ref.current;
      const target = e.target as HTMLElement | null;
      if (!controls || e.ctrlKey || e.metaKey || e.altKey) return;
      if (target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
      if (target?.closest("[role=dialog],[role=menu],[role=listbox],[role=tablist],[data-study-panel]")) return;
      const step = THREE.MathUtils.degToRad(15);
      const handled: Record<string, () => void> = {
        ArrowLeft: () => void controls.rotate(-step, 0, smooth),
        ArrowRight: () => void controls.rotate(step, 0, smooth),
        ArrowUp: () => void controls.rotate(0, -step, smooth),
        ArrowDown: () => void controls.rotate(0, step, smooth),
        "+": () => void controls.dolly(0.25, smooth),
        "=": () => void controls.dolly(0.25, smooth),
        "-": () => void controls.dolly(-0.25, smooth),
      };
      const fn = handled[e.key];
      if (fn) {
        e.preventDefault();
        fn();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [smooth]);

  return (
    <CameraControls
      ref={ref}
      makeDefault
      minDistance={0.25}
      maxDistance={8}
      smoothTime={reduced ? 0 : 0.25}
      draggingSmoothTime={reduced ? 0 : 0.08}
    />
  );
}
