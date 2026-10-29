"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Clock, Flag, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ErrorState, LoadingState, Notice } from "@/components/ui/state";
import { QuestionCard } from "@/components/study/QuestionCard";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { QUIZ_MODE_LABELS } from "@/lib/labels";
import { cn, formatTime } from "@/lib/utils";
import type { AttemptView } from "@/server/quiz";
import type { AnswerFeedback } from "@/lib/quiz/questions";

function useCountdown(deadline: string | null, active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!deadline || !active) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [deadline, active]);
  return deadline ? Math.max(0, Math.round((new Date(deadline).getTime() - now) / 1000)) : null;
}

function Results({ view }: { view: AttemptView }) {
  const r = view.result!;
  const [filter, setFilter] = useState<"all" | "wrong">("all");
  const items = view.items.filter((i) => filter === "all" || !i.feedback?.isCorrect);
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border/80 bg-card/60 p-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15">
            <Trophy className="h-9 w-9 text-primary" aria-hidden />
          </div>
          <div className="space-y-1">
            <p className="eyebrow">{QUIZ_MODE_LABELS[view.mode]} finalizado</p>
            <p className="font-display text-4xl font-semibold tabular-nums">{r.score}%</p>
            <p className="text-sm text-muted-foreground">
              {r.correct} de {r.total} corretas · {r.answered < r.total ? `${r.total - r.answered} sem resposta · ` : ""}
              {formatTime(r.timeSeconds)} · +{r.xpEarned} XP
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button asChild variant="outline">
              <Link href="/quiz">
                <RotateCcw aria-hidden /> Novo quiz
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Ver painel</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Revisão</h2>
          <div className="flex gap-1">
            <Button size="sm" variant={filter === "all" ? "secondary" : "ghost"} aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
              Todas
            </Button>
            <Button size="sm" variant={filter === "wrong" ? "secondary" : "ghost"} aria-pressed={filter === "wrong"} onClick={() => setFilter("wrong")}>
              Só erros ({r.total - r.correct})
            </Button>
          </div>
        </div>
        {items.length === 0 && <p className="text-sm text-muted-foreground">Nenhum erro. 🎯</p>}
        <ol className="space-y-4">
          {items.map((i) => (
            <li key={i.question.id} className="rounded-xl border border-border/80 bg-card/40 p-5">
              <QuestionCard
                question={i.question}
                number={i.position + 1}
                selectedOptionId={i.selectedOptionId}
                feedback={i.feedback}
                onSelect={() => undefined}
                disabled
                headingLevel="h3"
              />
              {i.question.structure && (
                <Link href={`/atlas/${i.question.structure.slug}`} className="mt-3 inline-block text-sm text-primary underline-offset-2 hover:underline">
                  Estudar {i.question.structure.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

/** Sessão de quiz. Todo o estado vem do servidor: recarregar a página retoma de onde parou. */
export function QuizSession({ attemptId }: { attemptId: string }) {
  const queryClient = useQueryClient();
  const key = ["quiz-attempt", attemptId];
  const { data: view, isLoading, isError, error, refetch } = useQuery({
    queryKey: key,
    queryFn: () => apiFetch<AttemptView>(`/api/quiz/attempts/${attemptId}`),
    staleTime: Infinity,
  });
  const [current, setCurrent] = useState(0);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);

  // Começa na primeira questão sem resposta
  const firstOpen = useMemo(() => view?.items.findIndex((i) => !i.selectedOptionId) ?? 0, [view?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (firstOpen > 0) setCurrent(firstOpen);
  }, [firstOpen]);

  const done = !!view?.completedAt;
  const remaining = useCountdown(view?.deadline ?? null, !done);

  const setView = (fn: (v: AttemptView) => AttemptView) => queryClient.setQueryData<AttemptView>(key, (v) => (v ? fn(v) : v));

  const answer = useMutation({
    mutationFn: (v: { questionId: string; optionId: string }) =>
      apiFetch<{ saved: boolean; feedback: AnswerFeedback | null }>(`/api/quiz/attempts/${attemptId}/answers`, { method: "POST", json: v }),
    onSuccess: (res, v) =>
      setView((view) => ({
        ...view,
        items: view.items.map((i) =>
          i.question.id === v.questionId
            ? { ...i, selectedOptionId: res.feedback?.selectedOptionId ?? v.optionId, feedback: res.feedback ?? i.feedback }
            : i
        ),
      })),
    onError: () => void refetch(),
  });

  const flag = useMutation({
    mutationFn: (v: { questionId: string; flagged: boolean }) =>
      apiFetch(`/api/quiz/attempts/${attemptId}/flag`, { method: "POST", json: v }),
    onSuccess: (_r, v) =>
      setView((view) => ({ ...view, items: view.items.map((i) => (i.question.id === v.questionId ? { ...i, flagged: v.flagged } : i)) })),
  });

  const complete = useMutation({
    mutationFn: () => apiFetch<AttemptView>(`/api/quiz/attempts/${attemptId}/complete`, { method: "POST" }),
    onSuccess: (v) => {
      queryClient.setQueryData(key, v);
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      window.scrollTo({ top: 0 });
    },
  });

  // Tempo esgotado: o servidor fecha e devolve o resultado
  useEffect(() => {
    if (remaining === 0 && !done && !complete.isPending) complete.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, done]);

  if (isLoading) return <LoadingState label="Carregando quiz…" />;
  if (isError || !view)
    return (
      <ErrorState
        description={errorMessage(error)}
        action={
          <Button asChild variant="outline">
            <Link href="/quiz">Voltar ao quiz</Link>
          </Button>
        }
      />
    );
  if (done) return <Results view={view} />;

  const item = view.items[current]!;
  const total = view.items.length;
  const answered = view.items.filter((i) => i.selectedOptionId).length;
  const flagged = view.items.filter((i) => i.flagged).length;
  const selected = draft[item.question.id] ?? item.selectedOptionId;
  const locked = view.revealsImmediately && item.feedback !== null;
  const pendingChange = selected !== null && selected !== item.selectedOptionId;

  const submit = () => {
    if (!selected || !pendingChange) return;
    answer.mutate({ questionId: item.question.id, optionId: selected });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_15rem]">
      <section aria-label={`Questão ${current + 1} de ${total}`} className="min-w-0 space-y-5">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-medium">{QUIZ_MODE_LABELS[view.mode]}</span>
          <span className="text-muted-foreground">
            {answered}/{total} respondidas
          </span>
          {remaining !== null && (
            <span
              role="timer"
              aria-live={remaining <= 60 ? "assertive" : "off"}
              className={cn("ml-auto inline-flex items-center gap-1.5 tabular-nums", remaining <= 60 && "text-warning")}
            >
              <Clock className="h-4 w-4" aria-hidden /> {formatTime(remaining)}
            </span>
          )}
        </div>
        <Progress value={(answered / total) * 100} className="h-1.5" aria-label="Questões respondidas" />

        <div className="rounded-2xl border border-border/80 bg-card/50 p-5">
          <QuestionCard
            key={item.question.id}
            question={item.question}
            number={current + 1}
            selectedOptionId={selected}
            feedback={item.feedback}
            headingLevel="h2"
            disabled={answer.isPending || locked}
            onSelect={(id) => setDraft((d) => ({ ...d, [item.question.id]: id }))}
          />
        </div>

        {answer.isError && (
          <p role="alert" className="text-sm text-destructive">
            {errorMessage(answer.error)}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
            <ArrowLeft aria-hidden /> Anterior
          </Button>
          {!view.revealsImmediately && (
            <Button
              variant="ghost"
              aria-pressed={item.flagged}
              disabled={flag.isPending}
              onClick={() => flag.mutate({ questionId: item.question.id, flagged: !item.flagged })}
              className={cn(item.flagged && "text-warning")}
            >
              <Flag className={cn(item.flagged && "fill-warning")} aria-hidden /> {item.flagged ? "Marcada" : "Marcar para revisar"}
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            {!locked && (
              <Button variant={view.revealsImmediately ? "default" : "secondary"} disabled={!pendingChange || answer.isPending} onClick={submit}>
                {answer.isPending ? "Enviando…" : view.revealsImmediately ? "Responder" : item.selectedOptionId ? "Trocar resposta" : "Salvar resposta"}
              </Button>
            )}
            {current < total - 1 ? (
              <Button variant={locked || (!view.revealsImmediately && !pendingChange) ? "default" : "outline"} onClick={() => setCurrent((c) => c + 1)}>
                Próxima <ArrowRight aria-hidden />
              </Button>
            ) : (
              <Button onClick={() => setConfirming(true)}>Finalizar</Button>
            )}
          </div>
        </div>

        {confirming && (
          <Notice tone={answered < total ? "warning" : "info"} className="items-center">
            <div className="flex flex-wrap items-center gap-3">
              <span>
                {answered < total
                  ? `${total - answered} sem resposta contam como erro.`
                  : "Todas respondidas."}
                {flagged > 0 && ` ${flagged} marcada${flagged > 1 ? "s" : ""} para revisar.`} Finalizar agora?
              </span>
              <span className="flex gap-2">
                <Button size="sm" disabled={complete.isPending} onClick={() => complete.mutate()}>
                  {complete.isPending ? "Corrigindo…" : "Finalizar"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                  Continuar
                </Button>
              </span>
            </div>
          </Notice>
        )}
        {complete.isError && (
          <p role="alert" className="text-sm text-destructive">
            {errorMessage(complete.error)}
          </p>
        )}
      </section>

      <aside aria-label="Navegação entre questões" className="space-y-3">
        <p className="eyebrow">Questões</p>
        <ol className="grid grid-cols-6 gap-1.5 lg:grid-cols-5">
          {view.items.map((i, idx) => (
            <li key={i.question.id}>
              <button
                type="button"
                onClick={() => setCurrent(idx)}
                aria-current={idx === current ? "step" : undefined}
                aria-label={`Questão ${idx + 1}${i.selectedOptionId ? ", respondida" : ""}${i.flagged ? ", marcada" : ""}${
                  i.feedback ? (i.feedback.isCorrect ? ", correta" : ", incorreta") : ""
                }`}
                className={cn(
                  "relative flex h-9 w-full items-center justify-center rounded-md border text-xs tabular-nums transition-colors",
                  idx === current ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/50",
                  i.feedback?.isCorrect === true && "bg-success/20",
                  i.feedback?.isCorrect === false && "bg-destructive/20",
                  !i.feedback && i.selectedOptionId && "bg-primary/15"
                )}
              >
                {idx + 1}
                {i.flagged && <span aria-hidden className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-warning" />}
              </button>
            </li>
          ))}
        </ol>
        <Button variant="outline" size="sm" className="w-full" onClick={() => setConfirming(true)}>
          Finalizar quiz
        </Button>
        {view.source === "AI" && <p className="text-xs text-muted-foreground">Questões geradas por IA para este quiz.</p>}
      </aside>
    </div>
  );
}
