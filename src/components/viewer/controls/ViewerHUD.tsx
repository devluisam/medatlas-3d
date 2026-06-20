"use client";

import { motion } from "framer-motion";
import { useViewerStore } from "@/stores/viewer.store";
import { ANATOMICAL_LAYERS } from "@/types";
import { Activity, Eye } from "lucide-react";

export function ViewerHUD() {
  const { visibleSystems, renderMode } = useViewerStore();

  const activeCount = visibleSystems.size;
  const totalCount = ANATOMICAL_LAYERS.length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="absolute bottom-6 right-4 z-20 hidden sm:flex flex-col gap-2 items-end"
    >
      {/* Systems visible */}
      <div className="hud-panel flex items-center gap-2 text-xs">
        <Eye className="w-3 h-3 text-blue-400" />
        <span className="text-white/60">Sistemas:</span>
        <span className="text-white font-mono">
          {activeCount}/{totalCount}
        </span>
      </div>

      {/* Render mode */}
      <div className="hud-panel flex items-center gap-2 text-xs">
        <Activity className="w-3 h-3 text-cyan-400" />
        <span className="text-white/60">Modo:</span>
        <span className="text-cyan-400 capitalize">{renderMode}</span>
      </div>

      {/* FPS indicator placeholder */}
      <div className="hud-panel text-xs font-mono text-white/30">
        MEDATLAS 3D v1.0
      </div>
    </motion.div>
  );
}
