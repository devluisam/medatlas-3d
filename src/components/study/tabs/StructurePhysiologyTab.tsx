"use client";

import type { AnatomicalStructure } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  structure: AnatomicalStructure | null;
  isLoading: boolean;
}

export function StructurePhysiologyTab({ structure, isLoading }: Props) {
  const content = structure?.physiology ?? "Fisiologia não disponível para esta estrutura.";

  return (
    <div className="prose prose-sm prose-invert max-w-none text-white/75">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
