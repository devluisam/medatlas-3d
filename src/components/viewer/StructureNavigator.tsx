"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { normalizeForSearch } from "@/lib/search-text";
import { regionLabel, SYSTEM_KEYS, SYSTEMS } from "@/lib/labels";
import { useViewerStore } from "@/stores/viewer.store";
import type { StructureListItem } from "@/server/structures";

const REGION_ORDER = ["HEAD", "NECK", "SPINE", "THORAX", "UPPER_LIMB_SHOULDER", "UPPER_LIMB_ARM", "UPPER_LIMB_FOREARM", "UPPER_LIMB_HAND", "PELVIS", "LOWER_LIMB_THIGH", "LOWER_LIMB_LEG", "LOWER_LIMB_FOOT"];

/**
 * Lista das estruturas que existem no modelo, por região: clicar seleciona e
 * enquadra; o olho oculta/mostra. Embaixo, os sistemas ainda sem malha 3D —
 * marcados como tal, com link para o conteúdo em texto.
 */
export function StructureNavigator({ structures, onNavigate }: { structures: StructureListItem[]; onNavigate?: () => void }) {
  const [filter, setFilter] = useState("");
  const selected = useViewerStore((s) => s.selectedSlug);
  const hidden = useViewerStore((s) => s.hidden);
  const select = useViewerStore((s) => s.select);
  const toggleHidden = useViewerStore((s) => s.toggleHidden);
  const modelStatus = useViewerStore((s) => s.modelStatus);

  const groups = useMemo(() => {
    const term = normalizeForSearch(filter);
    const withModel = structures.filter(
      (s) => s.hasModel && (!term || normalizeForSearch(`${s.name} ${s.scientificName ?? ""}`).includes(term))
    );
    const byRegion = new Map<string, StructureListItem[]>();
    for (const s of withModel) byRegion.set(s.region, [...(byRegion.get(s.region) ?? []), s]);
    return [...byRegion.entries()].sort(([a], [b]) => {
      const ia = REGION_ORDER.indexOf(a);
      const ib = REGION_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  }, [structures, filter]);

  const textOnly = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of structures) if (!s.hasModel) counts.set(s.system, (counts.get(s.system) ?? 0) + 1);
    return SYSTEM_KEYS.filter((k) => !SYSTEMS[k].hasModel).map((k) => ({ ...SYSTEMS[k], count: counts.get(k) ?? 0 }));
  }, [structures]);

  return (
    <nav aria-label="Estruturas do modelo" className="flex min-h-0 flex-1 flex-col">
      <div className="relative px-3 pb-2 pt-3">
        <Search className="pointer-events-none absolute left-5 top-1/2 mt-0.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filtrar ossos…"
          aria-label="Filtrar estruturas do modelo"
          className="h-9 pl-8"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        <p className="eyebrow px-2 pb-1 pt-2">Esquelético · no modelo 3D</p>
        {groups.length === 0 && <p className="px-2 py-3 text-sm text-muted-foreground">Nada encontrado com “{filter}”.</p>}
        {groups.map(([region, items]) => (
          <div key={region} className="mb-2">
            <p className="px-2 pb-0.5 pt-2 text-[11px] font-medium text-muted-foreground">{regionLabel(region)}</p>
            <ul>
              {items.map((s) => {
                const isHidden = !!hidden[s.slug];
                const isSelected = selected === s.slug;
                return (
                  <li key={s.slug} className="group flex items-center gap-1">
                    <button
                      type="button"
                      disabled={modelStatus !== "ready"}
                      aria-current={isSelected ? "true" : undefined}
                      onClick={() => {
                        select(s.slug, { focus: true });
                        onNavigate?.();
                      }}
                      className={cn(
                        "min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-left text-sm transition-colors disabled:opacity-60",
                        isSelected ? "bg-primary/15 text-primary" : "hover:bg-accent",
                        isHidden && "text-muted-foreground line-through decoration-muted-foreground/50"
                      )}
                    >
                      {s.name}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-7 w-7 shrink-0", !isHidden && "opacity-60 group-hover:opacity-100 focus-visible:opacity-100")}
                      aria-label={isHidden ? `Mostrar ${s.name}` : `Ocultar ${s.name}`}
                      aria-pressed={isHidden}
                      disabled={modelStatus !== "ready"}
                      onClick={() => toggleHidden(s.slug)}
                    >
                      {isHidden ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="mt-4 border-t border-border/70 pt-3">
          <p className="eyebrow px-2 pb-1">Ainda sem malha 3D</p>
          <p className="px-2 pb-2 text-xs text-muted-foreground">
            O modelo atual tem só o esqueleto. Estes sistemas têm conteúdo em texto, questões e flashcards.
          </p>
          <ul>
            {textOnly
              .filter((sys) => sys.count > 0)
              .map((sys) => (
                <li key={sys.key}>
                  <Link
                    href={`/atlas?system=${sys.key}`}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: sys.color }} />
                    <span className="flex-1 truncate">{sys.label}</span>
                    <span className="text-xs">{sys.count}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
