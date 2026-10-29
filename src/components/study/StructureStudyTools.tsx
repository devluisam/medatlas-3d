"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { StructureQuestions } from "./StructureQuestions";
import { StructureFlashcards } from "./StructureFlashcards";
import { FavoriteButton, StructureNotes } from "./StructureNotes";
import { TutorChat } from "./TutorChat";
import { useStudyTracking } from "./useStudyTracking";

/** Ferramentas interativas da página /atlas/[slug]: as mesmas do painel do visualizador. */
export function StructureStudyTools({
  slug,
  name,
  signedIn,
  questionCount,
  flashcardCount,
}: {
  slug: string;
  name: string;
  signedIn: boolean;
  questionCount: number;
  flashcardCount: number;
}) {
  useStudyTracking(slug, signedIn);
  const loginHref = `/login?callbackUrl=${encodeURIComponent(`/atlas/${slug}`)}`;

  return (
    <section aria-labelledby="praticar" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id="praticar" className="text-xl font-semibold">
          Praticar
        </h2>
        <FavoriteButton slug={slug} name={name} signedIn={signedIn} />
      </div>
      <Tabs defaultValue="questions">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="questions">Questões {questionCount > 0 && <span className="ml-1 text-muted-foreground">{questionCount}</span>}</TabsTrigger>
          <TabsTrigger value="flashcards">
            Flashcards {flashcardCount > 0 && <span className="ml-1 text-muted-foreground">{flashcardCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="notes">Anotações</TabsTrigger>
          <TabsTrigger value="tutor">Tutor IA</TabsTrigger>
        </TabsList>
        <div className="pt-4">
          <TabsContent value="questions" className="mt-0">
            <StructureQuestions slug={slug} name={name} />
          </TabsContent>
          <TabsContent value="flashcards" className="mt-0 max-w-xl">
            <StructureFlashcards slug={slug} name={name} loginHref={loginHref} />
          </TabsContent>
          <TabsContent value="notes" className="mt-0 max-w-xl">
            {signedIn ? (
              <StructureNotes slug={slug} name={name} />
            ) : (
              <p className="text-sm text-muted-foreground">
                <Link href={loginHref} className="font-medium text-primary underline-offset-2 hover:underline">
                  Entre na sua conta
                </Link>{" "}
                para escrever anotações e favoritar estruturas.
              </p>
            )}
          </TabsContent>
          <TabsContent value="tutor" className="mt-0 max-w-2xl">
            <TutorChat slug={slug} name={name} signedIn={signedIn} loginHref={loginHref} />
          </TabsContent>
        </div>
      </Tabs>
    </section>
  );
}
