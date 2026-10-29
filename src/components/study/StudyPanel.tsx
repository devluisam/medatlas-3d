"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ExternalLink, Focus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorState, LoadingState } from "@/components/ui/state";
import { errorMessage } from "@/lib/api-client";
import { useViewerStore, type StudyTab } from "@/stores/viewer.store";
import { AnatomySection, ClinicalSection, SummarySection } from "./StructureSections";
import { StructureQuestions } from "./StructureQuestions";
import { StructureFlashcards } from "./StructureFlashcards";
import { FavoriteButton, StructureNotes } from "./StructureNotes";
import { TutorChat } from "./TutorChat";
import { useStructure } from "./queries";
import { useStudyTracking } from "./useStudyTracking";

const TABS: { value: StudyTab; label: string }[] = [
  { value: "summary", label: "Resumo" },
  { value: "anatomy", label: "Anatomia" },
  { value: "clinical", label: "Clínica" },
  { value: "questions", label: "Questões" },
  { value: "flashcards", label: "Flashcards" },
  { value: "notes", label: "Anotações" },
  { value: "tutor", label: "Tutor IA" },
];

/** Painel de estudo da estrutura selecionada no visualizador. */
export function StudyPanel() {
  const slug = useViewerStore((s) => s.selectedSlug);
  const open = useViewerStore((s) => s.panelOpen);
  const tab = useViewerStore((s) => s.activeTab);
  const setTab = useViewerStore((s) => s.setTab);
  const select = useViewerStore((s) => s.select);
  const camera = useViewerStore((s) => s.camera);
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const pathname = usePathname();
  const search = useSearchParams();
  const { data: s, isLoading, isError, error, refetch } = useStructure(open ? slug : null);

  useStudyTracking(open ? slug : null, signedIn);

  if (!open || !slug) return null;

  const loginHref = `/login?callbackUrl=${encodeURIComponent(`${pathname}?${search.toString()}`)}`;

  return (
    <aside
      data-study-panel
      aria-label="Painel de estudo"
      className="hud-panel pointer-events-auto flex max-h-full min-h-0 w-full flex-col overflow-hidden md:w-[26rem]"
    >
      <header className="flex items-start gap-2 border-b border-border/70 px-4 pb-3 pt-4">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold">{s?.name ?? "Carregando…"}</h2>
          {s?.scientificName && <p className="truncate text-sm italic text-muted-foreground">{s.scientificName}</p>}
        </div>
        {s && (
          <>
            <FavoriteButton slug={slug} name={s.name} signedIn={signedIn} />
            {s.hasModel && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={`Enquadrar ${s.name} no modelo`}
                onClick={() => camera({ kind: "focus", slug })}
              >
                <Focus aria-hidden />
              </Button>
            )}
            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
              <Link href={`/atlas/${slug}`} aria-label={`Abrir a página de ${s.name}`}>
                <ExternalLink aria-hidden />
              </Link>
            </Button>
          </>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Fechar painel" onClick={() => select(null)}>
          <X aria-hidden />
        </Button>
      </header>

      {isLoading ? (
        <LoadingState />
      ) : isError || !s ? (
        <ErrorState
          description={errorMessage(error)}
          action={
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Tentar de novo
            </Button>
          }
        />
      ) : (
        <Tabs value={tab} onValueChange={(v) => setTab(v as StudyTab)} className="flex min-h-0 flex-1 flex-col">
          <TabsList className="mx-3 mt-3 h-auto flex-wrap justify-start gap-0.5 bg-muted/60 p-1">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="px-2.5 py-1 text-xs">
                {t.label}
                {t.value === "questions" && s.questionCount > 0 && <span className="ml-1 text-muted-foreground">{s.questionCount}</span>}
                {t.value === "flashcards" && s.flashcardCount > 0 && (
                  <span className="ml-1 text-muted-foreground">{s.flashcardCount}</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-4">
            <TabsContent value="summary" className="mt-0">
              <SummarySection s={s} />
            </TabsContent>
            <TabsContent value="anatomy" className="mt-0">
              <AnatomySection s={s} />
            </TabsContent>
            <TabsContent value="clinical" className="mt-0">
              <ClinicalSection s={s} />
            </TabsContent>
            <TabsContent value="questions" className="mt-0">
              <StructureQuestions slug={slug} name={s.name} />
            </TabsContent>
            <TabsContent value="flashcards" className="mt-0">
              <StructureFlashcards slug={slug} name={s.name} loginHref={loginHref} />
            </TabsContent>
            <TabsContent value="notes" className="mt-0">
              {signedIn ? (
                <StructureNotes slug={slug} name={s.name} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  <Link href={loginHref} className="font-medium text-primary underline-offset-2 hover:underline">
                    Entre na sua conta
                  </Link>{" "}
                  para escrever anotações e favoritar estruturas.
                </p>
              )}
            </TabsContent>
            <TabsContent value="tutor" className="mt-0 h-full">
              <TutorChat slug={slug} name={s.name} signedIn={signedIn} loginHref={loginHref} />
            </TabsContent>
          </div>
        </Tabs>
      )}
    </aside>
  );
}
