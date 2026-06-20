import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { subscribeWithSelector } from "zustand/middleware";
import type {
  ViewerState,
  AnatomicalSystemKey,
  RenderMode,
  CuttingPlane,
  StructureHitInfo,
} from "@/types";
import { ANATOMICAL_LAYERS } from "@/types";

interface ViewerStore extends ViewerState {
  // Layer controls
  toggleSystem: (system: AnatomicalSystemKey) => void;
  showAllSystems: () => void;
  hideAllSystems: () => void;
  setActiveSystem: (system: AnatomicalSystemKey | null) => void;

  // Selection
  selectStructure: (id: string | null) => void;
  highlightStructure: (id: string | null) => void;
  lastHit: StructureHitInfo | null;
  setLastHit: (hit: StructureHitInfo | null) => void;

  // Camera
  setCameraPosition: (pos: [number, number, number]) => void;
  setCameraTarget: (target: [number, number, number]) => void;
  focusStructure: (id: string) => void;
  resetCamera: () => void;

  // Render
  setRenderMode: (mode: RenderMode) => void;
  toggleWireframe: () => void;
  toggleXray: () => void;

  // Cutting plane
  setCuttingPlane: (plane: CuttingPlane | null) => void;
  toggleCutting: () => void;
  moveCuttingPlane: (position: number) => void;

  // Body
  setBodyGender: (gender: "male" | "female") => void;

  // Reset
  resetViewer: () => void;
}

const defaultSystems = new Set<AnatomicalSystemKey>(
  ANATOMICAL_LAYERS.map((l) => l.key)
);

const DEFAULT_STATE: ViewerState = {
  activeSystem: null,
  visibleSystems: defaultSystems,
  selectedStructureId: null,
  highlightedStructureId: null,
  cameraPosition: [0, 0, 3.4],
  cameraTarget: [0, 0, 0],
  zoom: 1,
  renderMode: "realistic",
  cuttingPlane: null,
  isCutting: false,
  showWireframe: false,
  showXray: false,
  bodyGender: "male",
};

export const useViewerStore = create<ViewerStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...DEFAULT_STATE,
      lastHit: null,

      toggleSystem: (system) =>
        set((state) => {
          if (state.visibleSystems.has(system)) {
            state.visibleSystems.delete(system);
          } else {
            state.visibleSystems.add(system);
          }
        }),

      showAllSystems: () =>
        set((state) => {
          state.visibleSystems = new Set(ANATOMICAL_LAYERS.map((l) => l.key));
        }),

      hideAllSystems: () =>
        set((state) => {
          state.visibleSystems = new Set();
        }),

      setActiveSystem: (system) =>
        set((state) => {
          state.activeSystem = system;
        }),

      selectStructure: (id) =>
        set((state) => {
          state.selectedStructureId = id;
        }),

      highlightStructure: (id) =>
        set((state) => {
          state.highlightedStructureId = id;
        }),

      setLastHit: (hit) =>
        set((state) => {
          state.lastHit = hit;
        }),

      setCameraPosition: (pos) =>
        set((state) => {
          state.cameraPosition = pos;
        }),

      setCameraTarget: (target) =>
        set((state) => {
          state.cameraTarget = target;
        }),

      focusStructure: (_id) => {
        // Triggered externally — 3D engine reads selectedStructureId
        // and auto-focuses camera
      },

      resetCamera: () =>
        set((state) => {
          state.cameraPosition = DEFAULT_STATE.cameraPosition;
          state.cameraTarget = DEFAULT_STATE.cameraTarget;
          state.zoom = 1;
        }),

      setRenderMode: (mode) =>
        set((state) => {
          state.renderMode = mode;
          state.showWireframe = mode === "wireframe";
          state.showXray = mode === "xray";
        }),

      toggleWireframe: () =>
        set((state) => {
          state.showWireframe = !state.showWireframe;
          if (state.showWireframe) state.renderMode = "wireframe";
          else state.renderMode = "realistic";
        }),

      toggleXray: () =>
        set((state) => {
          state.showXray = !state.showXray;
          if (state.showXray) state.renderMode = "xray";
          else state.renderMode = "realistic";
        }),

      setCuttingPlane: (plane) =>
        set((state) => {
          state.cuttingPlane = plane;
          state.isCutting = plane !== null;
        }),

      toggleCutting: () =>
        set((state) => {
          if (state.isCutting) {
            state.cuttingPlane = null;
            state.isCutting = false;
          } else {
            state.cuttingPlane = {
              axis: "sagittal",
              position: 0,
              visible: true,
            };
            state.isCutting = true;
          }
        }),

      moveCuttingPlane: (position) =>
        set((state) => {
          if (state.cuttingPlane) {
            state.cuttingPlane.position = position;
          }
        }),

      setBodyGender: (gender) =>
        set((state) => {
          state.bodyGender = gender;
        }),

      resetViewer: () =>
        set(() => ({
          ...DEFAULT_STATE,
          visibleSystems: new Set(ANATOMICAL_LAYERS.map((l) => l.key)),
          lastHit: null,
        })),
    }))
  )
);
