"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state";
import { apiFetch, errorMessage } from "@/lib/api-client";
import type { CardView } from "@/server/flashcards";
import { FlashcardReviewer } from "./FlashcardReviewer";
import { keys } from "./queries";

interface Queue {
  cards: CardView[];
  dueTotal: number;
  newTotal: number;
  nextDueAt: string | null;
}

/** Fila do dia: vencidos primeiro, depois até 15 cartões novos. */
export function FlashcardQueue() {
  const [session, setSession] = useState(0);
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: [...keys.queue(), session],
    queryFn: () => apiFetch<Queue>("/api/flashcards/queue?limit=30"),
    staleTime: 0,
  });

  if (isLoading) return <LoadingState label="Montando sua fila…" />;
  if (isError || !data)
    return (
      <ErrorState
        description={errorMessage(error)}
        action={
          <Button variant="outline" onClick={() => refetch()}>
            Tentar de novo
          </Button>
        }
      />
    );

  if (data.cards.length === 0)
    return (
      <EmptyState
        icon={CalendarCheck}
        title="Tudo revisado por hoje"
        description={
          data.nextDueAt
            ? `A próxima revisão vence em ${new Date(data.nextDueAt).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" })}.`
            : "Não há cartões para revisar. Abra estruturas no atlas para estudar novos cartões."
        }
        action={
          <Button asChild variant="outline">
            <Link href="/atlas">Ir ao conteúdo</Link>
          </Button>
        }
      />
    );

  return (
    <div className="space-y-5">
      <dl className="flex flex-wrap gap-6 text-sm">
        <div>
          <dt className="text-muted-foreground">Vencidos</dt>
          <dd className="font-display text-2xl tabular-nums">{data.dueTotal}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Novos disponíveis</dt>
          <dd className="font-display text-2xl tabular-nums">{data.newTotal}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Nesta sessão</dt>
          <dd className="font-display text-2xl tabular-nums">{data.cards.length}</dd>
        </div>
      </dl>
      <FlashcardReviewer
        key={session}
        cards={data.cards}
        canGrade
        showStructure
      />
      <Button variant="ghost" size="sm" disabled={isFetching} onClick={() => setSession((s) => s + 1)}>
        Buscar a próxima fila
      </Button>
    </div>
  );
}
