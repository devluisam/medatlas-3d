"use client";

import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LucideIcon } from "lucide-react";

interface Props {
  content?: string | null;
  isLoading?: boolean;
  emptyLabel: string;
  icon?: LucideIcon;
}

/**
 * Generic tab that renders a markdown content field of a structure,
 * with loading skeleton and an empty state. Used for Histology,
 * Diagnosis (clinicalNotes), Surgery (surgicalNotes), Embryology, etc.
 */
export function StructureTextTab({ content, isLoading, emptyLabel, icon: Icon }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 bg-white/5" style={{ width: `${88 - i * 6}%` }} />
        ))}
      </div>
    );
  }

  if (!content || content.trim() === "") {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        {Icon && <Icon className="w-8 h-8 text-white/20 mb-3" />}
        <p className="text-white/40 text-sm">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="prose prose-sm prose-invert max-w-none text-white/75">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
