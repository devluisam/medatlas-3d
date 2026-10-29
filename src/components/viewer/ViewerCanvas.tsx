"use client";

import { Component, Suspense, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, useProgress } from "@react-three/drei";
import { useViewerStore } from "@/stores/viewer.store";
import { SkeletonModel } from "./scene/SkeletonModel";
import { CameraRig } from "./scene/CameraRig";
import { CutPlaneHelper } from "./scene/CutPlaneHelper";

/** Falha ao carregar ou montar o modelo: avisa a interface em vez de derrubar a página. */
class ModelBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error("[MEDATLAS] falha no modelo 3D:", error);
    useViewerStore.getState().setModelStatus("error");
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Cena do atlas. Renderiza sob demanda (frameloop "demand"): parada, não gasta
 * GPU. Sem HDR externo nem pós-processamento — iluminação local e clipping
 * por material para o corte.
 */
export default function ViewerCanvas({ attempt }: { attempt: number }) {
  return (
    <>
      <Scene attempt={attempt} />
      <LoadingOverlay />
    </>
  );
}

/** Progresso real do download do modelo (bytes do loader do three.js). */
function LoadingOverlay() {
  const { progress, active } = useProgress();
  const status = useViewerStore((s) => s.modelStatus);
  if (status !== "loading") return null;
  const pct = Math.round(progress);
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div role="status" className="hud-panel w-64 space-y-2 px-4 py-3 text-sm">
        <p>{active || pct < 100 ? "Carregando o modelo 3D…" : "Preparando o esqueleto…"}</p>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
          <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">{pct}% de 3,5 MB</p>
      </div>
    </div>
  );
}

function Scene({ attempt }: { attempt: number }) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      camera={{ fov: 35, near: 0.05, far: 50, position: [0, 1, 4.5] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
      }}
      aria-label="Modelo 3D do esqueleto humano. Use as setas para girar e + ou − para aproximar."
      role="img"
    >
      <hemisphereLight args={["#eef4ff", "#2a2f3a", 0.85]} />
      <directionalLight position={[2.5, 4, 3]} intensity={1.6} />
      <directionalLight position={[-3, 2.5, -2.5]} intensity={0.55} color="#b9d3ff" />
      <directionalLight position={[0, -2, 2]} intensity={0.25} />
      <ModelBoundary key={attempt}>
        <Suspense fallback={null}>
          <SkeletonModel />
          <CutPlaneHelper />
        </Suspense>
      </ModelBoundary>
      <ContactShadows position={[0, 0, 0]} opacity={0.45} scale={2.5} blur={2.4} far={1.2} color="#000000" />
      <CameraRig />
    </Canvas>
  );
}
