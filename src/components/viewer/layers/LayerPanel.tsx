"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useViewerStore } from "@/stores/viewer.store";
import { ANATOMICAL_LAYERS } from "@/types";
import type { AnatomicalSystemKey } from "@/types";
import { cn } from "@/lib/utils";

export function LayerPanel() {
  // Open by default on desktop, closed on mobile (avoids covering the model)
  const [isOpen, setIsOpen] = useState(
    () => typeof window === "undefined" || window.innerWidth >= 768
  );
  const { visibleSystems, toggleSystem, setActiveSystem, activeSystem } = useViewerStore();

  return (
    <div className="absolute top-16 left-4 z-20 flex items-start gap-2">
      {/* Toggle button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen((v) => !v)}
            className="w-8 h-8 hud-panel text-white/60 hover:text-white shrink-0 mt-0.5"
          >
            {isOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <Layers className="w-4 h-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          {isOpen ? "Fechar camadas" : "Abrir camadas"}
        </TooltipContent>
      </Tooltip>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -16, width: 0 }}
            animate={{ opacity: 1, x: 0, width: "auto" }}
            exit={{ opacity: 0, x: -16, width: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="glass-dark rounded-xl w-56 overflow-hidden">
              {/* Header */}
              <div className="px-3 py-2.5 border-b border-white/8">
                <p className="text-white/60 text-xs uppercase tracking-wider font-medium">
                  Camadas Anatômicas
                </p>
              </div>

              {/* Layers */}
              <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                {ANATOMICAL_LAYERS.map((layer, index) => (
                  <motion.div
                    key={layer.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-white/5 transition-colors border-l-2",
                      activeSystem === layer.key
                        ? "border-l-2 bg-white/5"
                        : "border-transparent",
                      !visibleSystems.has(layer.key as AnatomicalSystemKey) &&
                        "opacity-40"
                    )}
                    style={{
                      borderLeftColor:
                        activeSystem === layer.key ? layer.color : "transparent",
                    }}
                    onClick={() =>
                      setActiveSystem(
                        activeSystem === layer.key
                          ? null
                          : (layer.key as AnatomicalSystemKey)
                      )
                    }
                  >
                    {/* Color dot */}
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: layer.color,
                        boxShadow: visibleSystems.has(layer.key as AnatomicalSystemKey)
                          ? `0 0 6px ${layer.color}88`
                          : "none",
                      }}
                    />

                    {/* Layer name */}
                    <span className="text-white/80 text-xs flex-1 leading-tight">
                      {layer.labelPt}
                    </span>

                    {/* Toggle */}
                    <Switch
                      checked={visibleSystems.has(layer.key as AnatomicalSystemKey)}
                      onCheckedChange={() =>
                        toggleSystem(layer.key as AnatomicalSystemKey)
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="scale-75 data-[state=checked]:bg-blue-600"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
