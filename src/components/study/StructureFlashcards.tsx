"use client";

import Link from "next/link";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState, Notice } from "@/components/ui/state";
import { errorMessage } from "@/lib/api-client";
import { FlashcardReviewer } from "./FlashcardReviewer";
import { useStructureCards } from "./queries";

export function StructureFlashcards({ slug, name, loginHref }: { slug: string; name: string; loginHref: string }) {
  const { data, isLoading, isError, error, refetch } = useStructureCards(slug);

  if (isLoading) return <LoadingState label="Carregando cartões…" />;
  if (isError)
    return (
      <ErrorState
        description={errorMessage(error)}
        action={
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Tentar de novo
          </Button>
        }
      />
    );
  if (!data?.cards.length)
    return <EmptyState icon={Layers} title="Sem cartões para esta estrutura" description={`Ainda não há flashcards sobre ${name}.`} />;

  const due = data.cards.filter((c) => !c.review || new Date(c.review.dueAt) <= new Date()).length;

  return (
    <div className="space-y-4">
      {data.signedIn ? (
        <p className="text-sm text-muted-foreground">
          {data.cards.length} cartões · {due === 0 ? "nenhum para revisar agora" : `${due} para revisar agora`}. Revise todos os
          vencidos em{" "}
          <Link href="/flashcards" className="text-primary underline-offset-2 hover:underline">
            Flashcards
          </Link>
          .
        </p>
      ) : (
        <Notice>
          Você pode praticar sem conta, mas o agendamento da repetição espaçada só é salvo para quem{" "}
          <Link href={loginHref} className="font-medium text-primary underline-offset-2 hover:underline">
            entra na conta
          </Link>
          .
        </Notice>
      )}
      <FlashcardReviewer key={slug} cards={data.cards} canGrade={data.signedIn} />
    </div>
  );
}
