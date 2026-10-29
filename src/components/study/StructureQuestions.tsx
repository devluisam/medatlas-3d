"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state";
import { apiFetch, errorMessage } from "@/lib/api-client";
import type { AnswerFeedback, PublicQuestion } from "@/lib/quiz/questions";
import { QuestionCard } from "./QuestionCard";
import { useStructureQuestions } from "./queries";

function StandaloneQuestion({ question, number }: { question: PublicQuestion; number: number }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const check = useMutation({
    mutationFn: (optionId: string) =>
      apiFetch<AnswerFeedback>(`/api/questions/${question.id}/check`, { method: "POST", json: { optionId } }),
    onSuccess: setFeedback,
  });

  return (
    <li className="space-y-3 rounded-xl border border-border/80 bg-card/50 p-4">
      <QuestionCard
        question={question}
        number={number}
        selectedOptionId={selected}
        feedback={feedback}
        onSelect={setSelected}
        disabled={check.isPending}
      />
      {check.isError && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage(check.error)}
        </p>
      )}
      <div className="flex gap-2">
        {!feedback ? (
          <Button size="sm" disabled={!selected || check.isPending} onClick={() => selected && check.mutate(selected)}>
            {check.isPending ? "Corrigindo…" : "Responder"}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelected(null);
              setFeedback(null);
            }}
          >
            Tentar de novo
          </Button>
        )}
      </div>
    </li>
  );
}

/** Questões do banco ligadas à estrutura, corrigidas uma a uma no servidor. */
export function StructureQuestions({ slug, name }: { slug: string; name: string }) {
  const { data, isLoading, isError, error, refetch } = useStructureQuestions(slug);

  if (isLoading) return <LoadingState label="Carregando questões…" />;
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
  if (!data?.length)
    return (
      <EmptyState
        icon={HelpCircle}
        title="Sem questões para esta estrutura"
        description={`Ainda não há questões do atlas sobre ${name}. Você pode praticar o sistema inteiro no quiz.`}
        action={
          <Button asChild size="sm" variant="outline">
            <Link href="/quiz">Abrir o quiz</Link>
          </Button>
        }
      />
    );

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {data.length} {data.length === 1 ? "questão" : "questões"} sobre {name}. A correção aparece depois que você responde.
      </p>
      <ol className="space-y-3">
        {data.map((q, i) => (
          <StandaloneQuestion key={q.id} question={q} number={i + 1} />
        ))}
      </ol>
    </div>
  );
}
