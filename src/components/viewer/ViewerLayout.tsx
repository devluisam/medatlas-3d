"use client";

import { Suspense, useCallback } from "react";
import { useViewerStore } from "@/stores/viewer.store";
import { useStudyStore } from "@/stores/study.store";
import { AnatomyCanvas } from "./3d/AnatomyCanvas";
import { LayerPanel } from "./layers/LayerPanel";
import { ViewerToolbar } from "./controls/ViewerToolbar";
import { ViewerHUD } from "./controls/ViewerHUD";
import { CuttingControls } from "./cutting/CuttingControls";
import { StudyPanel } from "@/components/study/StudyPanel";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { StructureTooltip } from "./controls/StructureTooltip";
import { MiniMap } from "./controls/MiniMap";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { cn } from "@/lib/utils";

export function ViewerLayout() {
  const { selectedStructureId, isCutting, lastHit } = useViewerStore();
  const { isOpen: isPanelOpen, openPanel } = useStudyStore();

  const handleStructureClick = useCallback(
    (structureId: string) => {
      openPanel(structureId);
    },
    [openPanel]
  );

  return (
    <div className="relative w-full h-screen bg-[#050a14] overflow-hidden select-none">
      {/* ── 3D Canvas ── */}
      <Suspense fallback={<LoadingScreen />}>
        <AnatomyCanvas onStructureClick={handleStructureClick} />
      </Suspense>

      {/* ── Top bar ── */}
      <ViewerToolbar />

      {/* ── Left layer panel ── */}
      <LayerPanel />

      {/* ── Right HUD stats ── */}
      <ViewerHUD />

      {/* ── Bottom cutting plane controls ── */}
      {isCutting && <CuttingControls />}

      {/* ── Structure tooltip on hover ── */}
      {lastHit && !isPanelOpen && (
        <StructureTooltip hit={lastHit} onClick={handleStructureClick} />
      )}

      {/* ── Mini anatomical map ── */}
      <MiniMap />

      {/* ── Study side panel ── */}
      <div
        className={cn(
          "absolute inset-y-0 right-0 w-full sm:w-[440px] xl:w-[520px] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] z-40",
          isPanelOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {isPanelOpen && selectedStructureId && (
          <StudyPanel structureId={selectedStructureId} />
        )}
      </div>

      {/* ── Global search ── */}
      <SearchOverlay />
    </div>
  );
}
