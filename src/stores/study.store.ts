import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { StudyPanelState, StudyTab } from "@/types";

interface StudyStore extends StudyPanelState {
  openPanel: (structureId: string, tab?: StudyTab) => void;
  closePanel: () => void;
  setActiveTab: (tab: StudyTab) => void;
  setLoading: (loading: boolean) => void;
}

export const useStudyStore = create<StudyStore>()(
  immer((set) => ({
    isOpen: false,
    structureId: null,
    activeTab: "summary",
    isLoading: false,

    openPanel: (structureId, tab = "summary") =>
      set((state) => {
        state.isOpen = true;
        state.structureId = structureId;
        state.activeTab = tab;
      }),

    closePanel: () =>
      set((state) => {
        state.isOpen = false;
        state.structureId = null;
      }),

    setActiveTab: (tab) =>
      set((state) => {
        state.activeTab = tab;
      }),

    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),
  }))
);
