"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { AnatomicalStructure } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  structure: AnatomicalStructure | null;
  isLoading: boolean;
}

export function StructureAnatomyTab({ structure, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 bg-white/5" style={{ width: `${85 - i * 5}%` }} />
        ))}
      </div>
    );
  }

  const content = structure?.anatomyDetail ?? structure?.summary ?? "Descrição anatômica não disponível.";

  return (
    <div className="prose prose-sm prose-invert max-w-none text-white/75">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
