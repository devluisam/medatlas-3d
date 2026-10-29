import { create } from "zustand";

/**
 * Estado do visualizador. A identidade de uma estrutura é sempre o `slug` —
 * o mesmo na cena 3D, na busca, no painel de estudo e na URL (?s=slug).
 */

export type RenderMode = "solid" | "xray" | "wireframe";
export type CutAxis = "sagittal" | "coronal" | "transverse";
export type ViewPreset = "anterior" | "posterior" | "left" | "right" | "superior";
export type ModelStatus = "loading" | "ready" | "error";
export type StudyTab = "summary" | "anatomy" | "clinical" | "questions" | "flashcards" | "notes" | "tutor";

export type CameraCommand =
  | { kind: "reset" }
  | { kind: "view"; view: ViewPreset }
  | { kind: "focus"; slug: string };

export interface HoverInfo {
  slug: string | null;
  label: string;
  x: number;
  y: number;
}

export interface CutState {
  enabled: boolean;
  axis: CutAxis;
  /** -1 a 1, relativo à extensão do modelo no eixo */
  position: number;
  /** Mantém o lado oposto */
  flip: boolean;
}

interface ViewerState {
  selectedSlug: string | null;
  panelOpen: boolean;
  activeTab: StudyTab;
  hover: HoverInfo | null;
  hidden: Record<string, true>;
  isolate: boolean;
  renderMode: RenderMode;
  /** Opacidade das estruturas não selecionadas no modo raio-X */
  xrayOpacity: number;
  skeletonVisible: boolean;
  cut: CutState;
  cameraCommand: (CameraCommand & { id: number }) | null;
  modelStatus: ModelStatus;

  select: (slug: string | null, opts?: { focus?: boolean; tab?: StudyTab }) => void;
  closePanel: () => void;
  setTab: (tab: StudyTab) => void;
  setHover: (hover: HoverInfo | null) => void;
  toggleHidden: (slug: string) => void;
  showAll: () => void;
  setIsolate: (isolate: boolean) => void;
  setRenderMode: (mode: RenderMode) => void;
  setXrayOpacity: (opacity: number) => void;
  setSkeletonVisible: (visible: boolean) => void;
  setCut: (cut: Partial<CutState>) => void;
  camera: (command: CameraCommand) => void;
  setModelStatus: (status: ModelStatus) => void;
  /** Restaura a visualização (não mexe na seleção) */
  resetView: () => void;
}

const DEFAULT_CUT: CutState = { enabled: false, axis: "sagittal", position: 0, flip: false };
let commandId = 0;

export const useViewerStore = create<ViewerState>((set, get) => ({
  selectedSlug: null,
  panelOpen: false,
  activeTab: "summary",
  hover: null,
  hidden: {},
  isolate: false,
  renderMode: "solid",
  xrayOpacity: 0.18,
  skeletonVisible: true,
  cut: DEFAULT_CUT,
  cameraCommand: null,
  modelStatus: "loading",

  select: (slug, opts = {}) => {
    const { hidden } = get();
    // Selecionar algo oculto o torna visível de novo
    const nextHidden =
      slug && hidden[slug] ? Object.fromEntries(Object.entries(hidden).filter(([k]) => k !== slug)) : hidden;
    set({
      selectedSlug: slug,
      panelOpen: slug !== null,
      hidden: nextHidden as Record<string, true>,
      ...(opts.tab && { activeTab: opts.tab }),
      ...(slug === null && { isolate: false }),
      ...(opts.focus && slug && { cameraCommand: { kind: "focus" as const, slug, id: ++commandId } }),
    });
  },
  closePanel: () => set({ panelOpen: false }),
  setTab: (activeTab) => set({ activeTab }),
  setHover: (hover) => set({ hover }),
  toggleHidden: (slug) =>
    set(({ hidden }) => {
      const next = { ...hidden };
      if (next[slug]) delete next[slug];
      else next[slug] = true;
      return { hidden: next };
    }),
  showAll: () => set({ hidden: {}, isolate: false, skeletonVisible: true }),
  setIsolate: (isolate) => set({ isolate }),
  setRenderMode: (renderMode) => set({ renderMode }),
  setXrayOpacity: (xrayOpacity) => set({ xrayOpacity: Math.min(0.9, Math.max(0.05, xrayOpacity)) }),
  setSkeletonVisible: (skeletonVisible) => set({ skeletonVisible }),
  setCut: (cut) => set(({ cut: current }) => ({ cut: { ...current, ...cut } })),
  camera: (command) => set({ cameraCommand: { ...command, id: ++commandId } }),
  setModelStatus: (modelStatus) => set({ modelStatus }),
  resetView: () =>
    set({
      hidden: {},
      isolate: false,
      renderMode: "solid",
      skeletonVisible: true,
      cut: DEFAULT_CUT,
      cameraCommand: { kind: "reset", id: ++commandId },
    }),
}));
