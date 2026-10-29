"use client";

import { Check, Sparkles, X } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";
import { cn } from "@/lib/utils";
import { difficultyLabel } from "@/lib/labels";
import type { AnswerFeedback, PublicQuestion } from "@/lib/quiz/questions";

const LETTERS = "ABCDEF";

interface Props {
  question: PublicQuestion;
  selectedOptionId: string | null;
  feedback: AnswerFeedback | null;
  onSelect: (optionId: string) => void;
  /** Sem alterar a escolha (enviando, ou resposta travada) */
  disabled?: boolean;
  number?: number;
  headingLevel?: "h2" | "h3";
}

/**
 * Enunciado + alternativas. As alternativas são um grupo de rádio de verdade
 * (setas do teclado navegam). Depois da correção mostra certo/errado e as
 * explicações enviadas pelo servidor.
 */
export function QuestionCard({ question, selectedOptionId, feedback, onSelect, disabled, number, headingLevel = "h3" }: Props) {
  const Heading = headingLevel;
  const name = `q-${question.id}`;
  const revealed = feedback !== null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {number !== undefined && <span className="font-medium text-foreground/80">Questão {number}</span>}
        <span>{difficultyLabel(question.difficulty)}</span>
        {question.structure && <span>· {question.structure.name}</span>}
        {question.origin === "AI_GENERATED" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-ai/15 px-2 py-0.5 text-ai">
            <Sparkles className="h-3 w-3" aria-hidden /> Gerada por IA — confira com a literatura
          </span>
        )}
      </div>

      {question.context && (
        <div className="rounded-lg border border-border/80 bg-muted/40 px-3 py-2.5">
          <p className="eyebrow mb-1">Caso clínico</p>
          <Markdown>{question.context}</Markdown>
        </div>
      )}

      <Heading className="font-sans text-[15px] font-medium leading-relaxed tracking-normal" id={`${name}-stem`}>
        {question.stem}
      </Heading>

      <div role="radiogroup" aria-labelledby={`${name}-stem`} className="space-y-2">
        {question.options.map((o, i) => {
          const selected = selectedOptionId === o.id;
          const correct = revealed && feedback.correctOptionId === o.id;
          const wrong = revealed && selected && !correct;
          const explanation = revealed ? feedback.optionExplanations[o.id] : undefined;
          return (
            <label
              key={o.id}
              className={cn(
                "flex cursor-pointer gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                !revealed && (selected ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-accent/40"),
                correct && "border-success/60 bg-success/10",
                wrong && "border-destructive/60 bg-destructive/10",
                revealed && !correct && !wrong && "border-border opacity-75",
                (disabled || revealed) && "cursor-default"
              )}
            >
              <input
                type="radio"
                name={name}
                value={o.id}
                checked={selected}
                disabled={disabled || revealed}
                onChange={() => onSelect(o.id)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  selected && !revealed && "border-primary bg-primary text-primary-foreground",
                  correct && "border-success bg-success text-background",
                  wrong && "border-destructive bg-destructive text-destructive-foreground"
                )}
              >
                {correct ? <Check className="h-3.5 w-3.5" /> : wrong ? <X className="h-3.5 w-3.5" /> : LETTERS[i]}
              </span>
              <span className="min-w-0 space-y-1">
                <span className="block leading-relaxed">{o.text}</span>
                {explanation && <span className="block text-xs leading-relaxed text-muted-foreground">{explanation}</span>}
                {correct && <span className="sr-only">(alternativa correta)</span>}
                {wrong && <span className="sr-only">(sua resposta, incorreta)</span>}
              </span>
            </label>
          );
        })}
      </div>

      {revealed && (
        <div
          role="status"
          className={cn(
            "rounded-lg border px-3 py-2.5",
            feedback.isCorrect ? "border-success/40 bg-success/10" : "border-warning/40 bg-warning/10"
          )}
        >
          <p className="mb-1 text-sm font-medium">
            {feedback.selectedOptionId === null ? "Sem resposta" : feedback.isCorrect ? "Resposta correta" : "Resposta incorreta"}
          </p>
          {feedback.explanation && <Markdown>{feedback.explanation}</Markdown>}
        </div>
      )}
    </div>
  );
}
