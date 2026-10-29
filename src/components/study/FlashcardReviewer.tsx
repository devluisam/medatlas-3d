"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Markdown } from "@/components/ui/markdown";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { GRADE_BUTTONS, type ReviewGrade } from "@/lib/sm2";
import { cn } from "@/lib/utils";
import type { CardView } from "@/server/flashcards";

function intervalText(days: number) {
  if (days <= 0) return "hoje";
  if (days === 1) return "amanhã";
  if (days < 30) return `em ${days} dias`;
  const months = Math.round(days / 30);
  return months === 1 ? "em 1 mês" : `em ${months} meses`;
}

interface Props {
  cards: CardView[];
  /** Grava a avaliação no agendamento do usuário; sem conta, só vira o cartão */
  canGrade: boolean;
  onFinished?: (stats: { reviewed: number; again: number }) => void;
  showStructure?: boolean;
}

/**
 * Sessão de revisão: frente → verso → nota. Atalhos: espaço vira o cartão,
 * 1–4 dão a nota. A fila é fixa durante a sessão (cartões "Errei" voltam
 * no fim, como no Anki, e só contam uma vez para o agendamento).
 */
export function FlashcardReviewer({ cards, canGrade, onFinished, showStructure }: Props) {
  const queryClient = useQueryClient();
  const [queue, setQueue] = useState(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [again, setAgain] = useState(0);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [graded, setGraded] = useState<Set<string>>(new Set());

  const card = queue[index];
  const done = index >= queue.length;

  const review = useMutation({
    mutationFn: ({ id, grade }: { id: string; grade: ReviewGrade }) =>
      apiFetch<{ interval: number }>(`/api/flashcards/${id}/review`, { method: "POST", json: { grade } }),
    onSuccess: (r, { grade }) => {
      setLastResult(grade < 3 ? "Volta no fim desta sessão e amanhã." : `Próxima revisão ${intervalText(r.interval)}.`);
      // A fila desta sessão fica fixa; o painel e a próxima fila buscam de novo
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const advance = (grade: ReviewGrade | null) => {
    if (!card) return;
    if (grade !== null && grade < 3) {
      setAgain((n) => n + 1);
      setQueue((q) => [...q, card]);
    }
    setFlipped(false);
    setIndex((i) => i + 1);
  };

  const grade = (g: ReviewGrade) => {
    if (!card || review.isPending) return;
    if (canGrade && !graded.has(card.id)) {
      review.mutate(
        { id: card.id, grade: g },
        {
          onSuccess: () => {
            setGraded((s) => new Set(s).add(card.id));
            advance(g);
          },
        }
      );
    } else {
      advance(g);
    }
  };

  useEffect(() => {
    if (done) onFinished?.({ reviewed: graded.size, again });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só ao terminar
  }, [done]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) || t.isContentEditable)) return;
      if (done) return;
      if (e.key === " " && !flipped) {
        e.preventDefault();
        setFlipped(true);
      } else if (flipped && ["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        grade(GRADE_BUTTONS[Number(e.key) - 1]!.grade);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (done) {
    return (
      <div className="space-y-3 rounded-xl border border-border/80 bg-card/60 p-5 text-center">
        <p className="font-medium">Sessão concluída</p>
        <p className="text-sm text-muted-foreground">
          {canGrade
            ? `${graded.size} ${graded.size === 1 ? "cartão revisado" : "cartões revisados"}${again ? `, ${again} para rever` : ""}. O agendamento foi salvo.`
            : "Entre na sua conta para salvar o agendamento das revisões."}
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setQueue(cards);
            setIndex(0);
            setAgain(0);
            setGraded(new Set());
            setLastResult(null);
          }}
        >
          <RotateCcw aria-hidden /> Recomeçar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>
          {Math.min(index + 1, queue.length)} de {queue.length}
        </span>
        <Progress value={(index / queue.length) * 100} className="h-1.5 flex-1" aria-label="Progresso da sessão" />
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Mostrar a pergunta" : "Mostrar a resposta"}
        className={cn(
          "block min-h-[11rem] w-full rounded-xl border p-5 text-left transition-colors",
          flipped ? "border-primary/40 bg-primary/5" : "border-border bg-card/70 hover:border-primary/40"
        )}
      >
        <span className="eyebrow mb-2 block">
          {flipped ? "Resposta" : "Pergunta"}
          {showStructure && card!.structure && <span className="normal-case tracking-normal"> · {card!.structure.name}</span>}
        </span>
        <span aria-live="polite" className="block">
          {flipped ? <Markdown>{card!.back}</Markdown> : <span className="block text-[15px] leading-relaxed">{card!.front}</span>}
        </span>
        {!flipped && card!.hint && <span className="mt-3 block text-xs text-muted-foreground">Dica: {card!.hint}</span>}
        {!flipped && <span className="mt-4 block text-xs text-muted-foreground">Clique ou aperte espaço para ver a resposta</span>}
      </button>

      {flipped && (
        <div className="grid grid-cols-4 gap-2" role="group" aria-label="Quanto você lembrou?">
          {GRADE_BUTTONS.map((b, i) => (
            <Button
              key={b.grade}
              size="sm"
              variant={b.grade < 3 ? "outline" : "secondary"}
              className="h-auto flex-col gap-0.5 py-2"
              disabled={review.isPending}
              onClick={() => grade(b.grade)}
            >
              <span>{b.label}</span>
              <span className="text-[10px] font-normal text-muted-foreground">
                {b.hint} · {i + 1}
              </span>
            </Button>
          ))}
        </div>
      )}
      {review.isError && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage(review.error)}
        </p>
      )}
      {lastResult && <p className="text-xs text-muted-foreground" role="status">{lastResult}</p>}
    </div>
  );
}
