"use client";

import { motion } from "framer-motion";
import {
  RotateCcw,
  Layers,
  Scissors,
  Eye,
  EyeOff,
  Search,
  Zap,
  User,
  Grid3x3,
  Sun,
  Crosshair,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useViewerStore } from "@/stores/viewer.store";
import type { RenderMode } from "@/types";
import Link from "next/link";

const RENDER_MODES: { value: RenderMode; label: string; icon: string }[] = [
  { value: "realistic", label: "Realístico", icon: "🎨" },
  { value: "xray", label: "Raio-X", icon: "💀" },
  { value: "ghost", label: "Fantasma", icon: "👻" },
  { value: "anatomical", label: "Anatômico", icon: "🔬" },
  { value: "wireframe", label: "Wireframe", icon: "🔷" },
];

export function ViewerToolbar() {
  const {
    resetCamera,
    toggleCutting,
    isCutting,
    renderMode,
    setRenderMode,
    bodyGender,
    setBodyGender,
    showAllSystems,
    hideAllSystems,
  } = useViewerStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute top-0 inset-x-0 z-30 flex items-center justify-between gap-1.5 px-2 sm:px-4 py-2 sm:py-3"
    >
      {/* Left — Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold font-space">M</span>
          </div>
          <span className="text-white font-bold font-space text-sm hidden sm:block">
            MEDATLAS <span className="text-blue-400">3D</span>
          </span>
        </Link>

        <Separator orientation="vertical" className="h-5 bg-white/10 hidden md:block" />

        <Badge
          variant="outline"
          className="border-white/15 text-white/60 text-xs px-2 py-0.5 font-normal hidden md:inline-flex"
        >
          Visualizador Anatômico
        </Badge>
      </div>

      {/* Center — Tools */}
      <div className="flex items-center gap-1 hud-panel">
        <ToolButton
          icon={<RotateCcw className="w-4 h-4" />}
          label="Resetar câmera"
          onClick={resetCamera}
        />

        <Separator orientation="vertical" className="h-5 bg-white/10 mx-1" />

        {/* Render mode */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 text-white/60 hover:text-white hover:bg-white/10"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">Modo de renderização</TooltipContent>
          </Tooltip>
          <DropdownMenuContent
            align="center"
            className="bg-[#0d1b2e] border-white/10 text-white"
          >
            <DropdownMenuLabel className="text-white/40 text-xs">
              Modo Visual
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            {RENDER_MODES.map((m) => (
              <DropdownMenuItem
                key={m.value}
                onClick={() => setRenderMode(m.value)}
                className={`hover:bg-white/10 cursor-pointer ${
                  renderMode === m.value ? "text-blue-400" : ""
                }`}
              >
                <span className="mr-2">{m.icon}</span>
                {m.label}
                {renderMode === m.value && (
                  <span className="ml-auto text-blue-400 text-xs">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Cutting plane */}
        <ToolButton
          icon={<Scissors className="w-4 h-4" />}
          label="Plano de corte"
          onClick={toggleCutting}
          active={isCutting}
        />

        {/* Less-essential tools — hidden on small screens */}
        <div className="hidden md:flex items-center gap-1">
          <Separator orientation="vertical" className="h-5 bg-white/10 mx-1" />

          {/* Show/Hide all */}
          <ToolButton
            icon={<Eye className="w-4 h-4" />}
            label="Mostrar todos"
            onClick={showAllSystems}
          />
          <ToolButton
            icon={<EyeOff className="w-4 h-4" />}
            label="Ocultar todos"
            onClick={hideAllSystems}
          />

          <Separator orientation="vertical" className="h-5 bg-white/10 mx-1" />

          {/* Gender toggle */}
          <ToolButton
            icon={<User className="w-4 h-4" />}
            label={bodyGender === "male" ? "Masculino" : "Feminino"}
            onClick={() => setBodyGender(bodyGender === "male" ? "female" : "male")}
            active={bodyGender === "female"}
          />
        </div>
      </div>

      {/* Right — Search + Nav */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 hud-panel text-white/70 hover:text-white shrink-0"
          onClick={() => window.dispatchEvent(new Event("medatlas:open-search"))}
          aria-label="Buscar estrutura"
        >
          <Search className="w-4 h-4" />
        </Button>

        <Button
          asChild
          size="sm"
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-8 px-2.5 sm:px-3 shrink-0"
        >
          <Link href="/dashboard">
            <span className="hidden sm:inline">Dashboard</span>
            <User className="w-4 h-4 sm:hidden" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}

function ToolButton({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          className={`w-8 h-8 transition-colors ${
            active
              ? "text-blue-400 bg-blue-500/15"
              : "text-white/60 hover:text-white hover:bg-white/10"
          }`}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
