import { create } from "zustand";
import type { ModelIndex } from "./model-index";

/** Índice do modelo carregado, compartilhado entre a cena (câmera, corte) e a interface. */
export const useModelIndexStore = create<{ index: ModelIndex | null; setIndex: (index: ModelIndex | null) => void }>((set) => ({
  index: null,
  setIndex: (index) => set({ index }),
}));
