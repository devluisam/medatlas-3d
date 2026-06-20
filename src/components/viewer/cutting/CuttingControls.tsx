"use client";

import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useViewerStore } from "@/stores/viewer.store";

const AXES = [
  { value: "sagittal" as const, label: "Sagital", description: "Divide esq/dir" },
  { value: "coronal" as const, label: "Coronal", description: "Divide ant/post" },
  { value: "transversal" as const, label: "Transversal", description: "Divide sup/inf" },
];

export function CuttingControls() {
  const { cuttingPlane, setCuttingPlane, moveCuttingPlane, toggleCutting } = useViewerStore();

  if (!cuttingPlane) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[calc(100vw-1.5rem)] sm:w-auto px-2 sm:px-0"
    >
      <div className="glass-dark rounded-xl px-3 sm:px-5 py-3 sm:py-4 flex items-center gap-3 sm:gap-6 w-full sm:min-w-[420px] flex-wrap sm:flex-nowrap justify-center">
        {/* Close */}
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 text-white/40 hover:text-white hover:bg-white/10 shrink-0"
          onClick={toggleCutting}
        >
          <X className="w-3.5 h-3.5" />
        </Button>

        {/* Axis selector */}
        <div className="flex gap-1">
          {AXES.map((axis) => (
            <button
              key={axis.value}
              onClick={() =>
                setCuttingPlane({ ...cuttingPlane, axis: axis.value })
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                cuttingPlane.axis === axis.value
                  ? "bg-blue-600 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/10"
              }`}
            >
              {axis.label}
            </button>
          ))}
        </div>

        {/* Position slider */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-white/30 text-xs shrink-0">−</span>
          <Slider
            min={-100}
            max={100}
            step={1}
            value={[cuttingPlane.position * 100]}
            onValueChange={([v]) => moveCuttingPlane(v / 100)}
            className="flex-1"
          />
          <span className="text-white/30 text-xs shrink-0">+</span>
        </div>

        <span className="text-white/40 text-xs font-mono w-10 text-right">
          {Math.round(cuttingPlane.position * 100)}%
        </span>
      </div>
    </motion.div>
  );
}
