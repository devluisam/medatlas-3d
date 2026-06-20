"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, BookOpen, Microscope, Heart, Baby, AlertTriangle, Stethoscope, Scissors, FileText, HelpCircle, CreditCard, Brain, Bookmark, Share2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudyStore } from "@/stores/study.store";
import { StructureSummaryTab } from "./tabs/StructureSummaryTab";
import { StructureAnatomyTab } from "./tabs/StructureAnatomyTab";
import { StructurePhysiologyTab } from "./tabs/StructurePhysiologyTab";
import { StructurePathologiesTab } from "./tabs/StructurePathologiesTab";
import { StructureQuestionsTab } from "./tabs/StructureQuestionsTab";
import { StructureFlashcardsTab } from "./tabs/StructureFlashcardsTab";
import { StructureTextTab } from "./tabs/StructureTextTab";
import { AiTutorChat } from "@/components/ai/AiTutorChat";
import type { AnatomicalStructure } from "@/types";

interface StudyPanelProps {
  structureId: string;
}

const TABS = [
  { value: "summary", label: "Resumo", icon: BookOpen, shortLabel: "Resumo" },
  { value: "anatomy", label: "Anatomia", icon: BookOpen, shortLabel: "Anat." },
  { value: "physiology", label: "Fisiologia", icon: Heart, shortLabel: "Fisio." },
  { value: "histology", label: "Histologia", icon: Microscope, shortLabel: "Histo." },
  { value: "pathologies", label: "Patologias", icon: AlertTriangle, shortLabel: "Pat." },
  { value: "diagnosis", label: "Diagnóstico", icon: Stethoscope, shortLabel: "Diag." },
  { value: "surgery", label: "Cirurgias", icon: Scissors, shortLabel: "Cir." },
  { value: "questions", label: "Questões", icon: HelpCircle, shortLabel: "Quest." },
  { value: "flashcards", label: "Flashcards", icon: CreditCard, shortLabel: "Flash." },
  { value: "ai", label: "IA Tutor", icon: Brain, shortLabel: "IA" },
];

export function StudyPanel({ structureId }: StudyPanelProps) {
  const { closePanel, activeTab, setActiveTab } = useStudyStore();
  const [structure, setStructure] = useState<AnatomicalStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/structures/${structureId}`)
      .then((r) => r.json())
      .then((data) => {
        setStructure(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [structureId]);

  return (
    <div className="h-full flex flex-col bg-[#0a1628]/95 backdrop-blur-xl border-l border-white/10 overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-start gap-3 px-5 pt-4 pb-3 border-b border-white/8 shrink-0">
        {isLoading ? (
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4 bg-white/5" />
            <Skeleton className="h-3 w-1/2 bg-white/5" />
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                className="text-[10px] px-2 py-0.5 bg-blue-500/15 text-blue-400 border-blue-500/30"
                variant="outline"
              >
                {structure?.system?.replace(/_/g, " ") ?? "Sistema"}
              </Badge>
              <Badge
                className="text-[10px] px-2 py-0.5 bg-white/5 text-white/40 border-white/10"
                variant="outline"
              >
                {structure?.category ?? "Estrutura"}
              </Badge>
            </div>
            <h2 className="text-white font-bold text-lg leading-tight truncate">
              {structure?.name ?? structureId}
            </h2>
            {structure?.scientificName && (
              <p className="text-white/40 text-xs italic mt-0.5">
                {structure.scientificName}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-white/40 hover:text-white hover:bg-white/10"
          >
            <Bookmark className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-white/40 hover:text-white hover:bg-white/10"
          >
            <Share2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={closePanel}
            className="w-7 h-7 text-white/40 hover:text-white hover:bg-white/10"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="border-b border-white/8 px-2 shrink-0">
          <TabsList className="h-auto bg-transparent flex flex-wrap gap-0 p-1">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-[11px] px-2.5 py-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white/40 hover:text-white/70 rounded-md transition-all data-[state=active]:shadow-none"
              >
                {tab.shortLabel}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ── Content ── */}
        <ScrollArea className="flex-1">
          <div className="p-5">
            <TabsContent value="summary" className="mt-0">
              <StructureSummaryTab structure={structure} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="anatomy" className="mt-0">
              <StructureAnatomyTab structure={structure} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="physiology" className="mt-0">
              <StructurePhysiologyTab structure={structure} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="histology" className="mt-0">
              <StructureTextTab
                content={structure?.histology}
                isLoading={isLoading}
                emptyLabel="Conteúdo histológico não disponível para esta estrutura."
                icon={Microscope}
              />
            </TabsContent>
            <TabsContent value="pathologies" className="mt-0">
              <StructurePathologiesTab structureId={structureId} />
            </TabsContent>
            <TabsContent value="diagnosis" className="mt-0">
              <StructureTextTab
                content={structure?.clinicalNotes}
                isLoading={isLoading}
                emptyLabel="Métodos diagnósticos não disponíveis para esta estrutura."
                icon={Stethoscope}
              />
            </TabsContent>
            <TabsContent value="surgery" className="mt-0">
              <StructureTextTab
                content={structure?.surgicalNotes}
                isLoading={isLoading}
                emptyLabel="Procedimentos cirúrgicos não disponíveis para esta estrutura."
                icon={Scissors}
              />
            </TabsContent>
            <TabsContent value="questions" className="mt-0">
              <StructureQuestionsTab structureId={structureId} />
            </TabsContent>
            <TabsContent value="flashcards" className="mt-0">
              <StructureFlashcardsTab structureId={structureId} />
            </TabsContent>
            <TabsContent value="ai" className="mt-0 h-full">
              <AiTutorChat
                context={{
                  structureId,
                  structureName: structure?.name,
                  system: structure?.system as any,
                }}
              />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
