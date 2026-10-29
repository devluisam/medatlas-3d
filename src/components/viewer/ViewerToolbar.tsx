"use client";

import type { ReactNode } from "react";
import { Box, Eye, EyeOff, FlipHorizontal2, Grid3x3, Layers2, RotateCcw, Scan, Scissors, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useViewerStore, type CutAxis, type RenderMode, type ViewPreset } from "@/stores/viewer.store";

const VIEWS: { value: ViewPreset; label: string }[] = [
  { value: "anterior", label: "Anterior (frente)" },
  { value: "posterior", label: "Posterior (costas)" },
  { value: "left", label: "Lateral esquerda" },
  { value: "right", label: "Lateral direita" },
  { value: "superior", label: "Superior" },
];

const MODES: { value: RenderMode; label: string; icon: typeof Box }[] = [
  { value: "solid", label: "Sólido", icon: Box },
  { value: "xray", label: "Raio-X (demais estruturas translúcidas)", icon: Scan },
  { value: "wireframe", label: "Malha (wireframe)", icon: Grid3x3 },
];

const AXES: { value: CutAxis; label: string; hint: string }[] = [
  { value: "sagittal", label: "Sagital", hint: "divide em esquerda e direita" },
  { value: "coronal", label: "Coronal", hint: "divide em frente e costas" },
  { value: "transverse", label: "Transversal", hint: "divide em cima e embaixo" },
];

function Tool({
  label,
  pressed,
  disabled,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={label}
          aria-pressed={pressed}
          disabled={disabled}
          onClick={onClick}
          className={cn("h-9 w-9 shrink-0", pressed && "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary")}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

const Divider = () => <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-border" />;

export function ViewerToolbar() {
  const s = useViewerStore();
  const hiddenCount = Object.keys(s.hidden).length;
  const hasSelection = s.selectedSlug !== null;

  return (
    <div className="pointer-events-auto flex max-w-full flex-col items-center gap-2">
      {s.cut.enabled && (
        <div className="hud-panel flex w-[min(34rem,calc(100vw-1.5rem))] flex-wrap items-center gap-3 px-3 py-2.5" role="group" aria-label="Plano de corte">
          <div className="flex gap-1" role="radiogroup" aria-label="Plano">
            {AXES.map((a) => (
              <Button
                key={a.value}
                size="sm"
                variant={s.cut.axis === a.value ? "secondary" : "ghost"}
                role="radio"
                aria-checked={s.cut.axis === a.value}
                title={a.hint}
                className="h-8 px-2.5 text-xs"
                onClick={() => s.setCut({ axis: a.value, position: 0 })}
              >
                {a.label}
              </Button>
            ))}
          </div>
          <Slider
            className="min-w-[8rem] flex-1"
            min={-1}
            max={1}
            step={0.01}
            value={[s.cut.position]}
            onValueChange={([v]) => s.setCut({ position: v ?? 0 })}
            aria-label="Posição do corte"
          />
          <Tool label="Inverter o lado mantido" pressed={s.cut.flip} onClick={() => s.setCut({ flip: !s.cut.flip })}>
            <FlipHorizontal2 aria-hidden />
          </Tool>
        </div>
      )}

      {s.renderMode === "xray" && (
        <div className="hud-panel flex w-[min(20rem,calc(100vw-1.5rem))] items-center gap-3 px-3 py-2">
          <span className="shrink-0 text-xs text-muted-foreground" id="xray-label">
            Opacidade
          </span>
          <Slider
            min={0.05}
            max={0.9}
            step={0.01}
            value={[s.xrayOpacity]}
            onValueChange={([v]) => s.setXrayOpacity(v ?? 0.18)}
            aria-labelledby="xray-label"
          />
        </div>
      )}

      <div role="toolbar" aria-label="Ferramentas do visualizador" className="hud-panel flex max-w-[calc(100vw-1.5rem)] items-center overflow-x-auto px-1.5 py-1">
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 shrink-0 gap-1.5 px-2.5" aria-label="Vistas anatômicas">
                  <Target aria-hidden /> <span className="hidden sm:inline">Vista</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="top">Vistas anatômicas</TooltipContent>
          </Tooltip>
          <DropdownMenuContent side="top" align="start">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Posicionar câmera</DropdownMenuLabel>
            {VIEWS.map((v) => (
              <DropdownMenuItem key={v.value} onSelect={() => s.camera({ kind: "view", view: v.value })}>
                {v.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Tool label="Restaurar visualização (câmera, camadas, corte e modo)" onClick={s.resetView}>
          <RotateCcw aria-hidden />
        </Tool>

        <Divider />
        {MODES.map((m) => (
          <Tool key={m.value} label={m.label} pressed={s.renderMode === m.value} onClick={() => s.setRenderMode(m.value)}>
            <m.icon aria-hidden />
          </Tool>
        ))}
        <Tool label={s.cut.enabled ? "Desligar corte" : "Plano de corte"} pressed={s.cut.enabled} onClick={() => s.setCut({ enabled: !s.cut.enabled })}>
          <Scissors aria-hidden />
        </Tool>

        <Divider />
        <Tool
          label={s.isolate ? "Mostrar o restante do esqueleto" : "Isolar a estrutura selecionada"}
          pressed={s.isolate}
          disabled={!hasSelection}
          onClick={() => s.setIsolate(!s.isolate)}
        >
          <Layers2 aria-hidden />
        </Tool>
        <Tool
          label="Ocultar a estrutura selecionada"
          disabled={!hasSelection}
          onClick={() => {
            if (!s.selectedSlug) return;
            const slug = s.selectedSlug;
            s.select(null);
            s.toggleHidden(slug);
          }}
        >
          <EyeOff aria-hidden />
        </Tool>
        <Tool label={hiddenCount ? `Mostrar tudo (${hiddenCount} oculta${hiddenCount > 1 ? "s" : ""})` : "Nada oculto"} disabled={!hiddenCount && !s.isolate} onClick={s.showAll}>
          <Eye aria-hidden />
        </Tool>
      </div>
    </div>
  );
}
