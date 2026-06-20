"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { StructurePathology } from "@/types";

interface Props {
  structureId: string;
}

export function StructurePathologiesTab({ structureId }: Props) {
  const [pathologies, setPathologies] = useState<StructurePathology[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/structures/${structureId}/pathologies`)
      .then((r) => r.json())
      .then((data) => {
        setPathologies(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [structureId]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 bg-white/5 rounded-xl" />
        ))}
      </div>
    );
  }

  if (pathologies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <AlertTriangle className="w-8 h-8 text-white/20 mb-3" />
        <p className="text-white/40 text-sm">
          Nenhuma patologia registrada para esta estrutura.
        </p>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="space-y-2">
      {pathologies.map((path) => (
        <AccordionItem
          key={path.id}
          value={path.id}
          className="bg-white/3 border border-white/8 rounded-xl px-4 overflow-hidden"
        >
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2 text-left">
              <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <span className="text-white/85 text-sm font-medium">{path.name}</span>
              {path.icd10Code && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 border-white/10 text-white/30"
                >
                  {path.icd10Code}
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-white/60 text-sm pb-4 space-y-3">
            <p>{path.description}</p>
            {path.symptoms.length > 0 && (
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1.5">
                  Sintomas
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {path.symptoms.map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="text-[10px] border-orange-500/30 text-orange-400/70"
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {path.treatment && (
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                  Tratamento
                </p>
                <p>{path.treatment}</p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
