"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Zap, Droplet, Activity, GitBranch } from "lucide-react";
import type { AnatomicalStructure } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  structure: AnatomicalStructure | null;
  isLoading: boolean;
}

export function StructureSummaryTab({ structure, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-full bg-white/5" />
        <Skeleton className="h-4 w-5/6 bg-white/5" />
        <Skeleton className="h-4 w-4/5 bg-white/5" />
        <Skeleton className="h-32 w-full bg-white/5 mt-4" />
      </div>
    );
  }

  if (!structure) {
    return (
      <p className="text-white/40 text-sm">Estrutura não encontrada.</p>
    );
  }

  const infoCards = [
    {
      icon: Droplet,
      label: "Irrigação",
      value: structure.bloodSupply ?? "Ver anatomia",
      color: "text-red-400",
    },
    {
      icon: Activity,
      label: "Drenagem venosa",
      value: structure.venousDrainage ?? "Ver anatomia",
      color: "text-blue-400",
    },
    {
      icon: GitBranch,
      label: "Inervação",
      value: structure.innervation ?? "Ver anatomia",
      color: "text-yellow-400",
    },
    {
      icon: Zap,
      label: "Função principal",
      value: structure.physiology?.slice(0, 80) ?? "Ver fisiologia",
      color: "text-cyan-400",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Summary text */}
      <div className="prose prose-sm prose-invert max-w-none text-white/75">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {structure.summary}
        </ReactMarkdown>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-2">
        {infoCards.map((card) => (
          <div
            key={card.label}
            className="bg-white/3 border border-white/8 rounded-xl p-3"
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <card.icon className={`w-3 h-3 ${card.color}`} />
              <span className="text-white/40 text-[10px] uppercase tracking-wider">
                {card.label}
              </span>
            </div>
            <p className="text-white/80 text-xs leading-relaxed line-clamp-2">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tags */}
      {structure.tags && structure.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {structure.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-[10px] px-2 py-0.5 border-white/10 text-white/40 hover:text-white/60 cursor-pointer"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </motion.div>
  );
}
