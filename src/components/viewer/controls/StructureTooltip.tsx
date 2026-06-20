"use client";

import { motion } from "framer-motion";
import { MousePointerClick } from "lucide-react";
import type { StructureHitInfo } from "@/types";

interface Props {
  hit: StructureHitInfo;
  onClick: (id: string) => void;
}

export function StructureTooltip({ hit, onClick }: Props) {
  return (
    <motion.div
      key={hit.structureId}
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      style={{
        position: "fixed",
        left: hit.screenPosition.x + 16,
        top: hit.screenPosition.y - 24,
        pointerEvents: "none",
        zIndex: 50,
      }}
      className="hud-panel flex flex-col gap-1 min-w-[160px]"
    >
      <p className="text-white text-sm font-medium">{hit.structureName}</p>
      <p className="text-white/40 text-xs capitalize">
        {hit.system.replace(/_/g, " ")}
      </p>
      <div className="flex items-center gap-1 mt-1 text-blue-400 text-xs">
        <MousePointerClick className="w-3 h-3" />
        <span>Clique para estudar</span>
      </div>
    </motion.div>
  );
}
