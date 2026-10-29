"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BookCheck, Clock, FileQuestion, Sparkles, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Notice } from "@/components/ui/state";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { DIFFICULTY_LABELS, SYSTEM_KEYS, SYSTEMS, type SystemKey } from "@/lib/labels";
import { cn } from "@/lib/utils";

type Mode = "PRACTICE" | "TIMED" | "EXAM" | "CLINICAL";
type Source = "BANK" | "AI";

const MODES: { value: Mode; label: string; description: string; icon: typeof BookCheck }[] = [
  { value: "PRACTICE", label: "Prática", description: "Correção e explicação logo após cada resposta.", icon: BookCheck },
  { value: "EXAM", label: "Simulado", description: "Sem correção até finalizar. Dá para trocar respostas e marcar para revisar.", icon: FileQuestion },
  { value: "TIMED", label: "Cronometrado", description: "Como o simulado, com 1 minuto por questão. Ao fim do tempo, fecha sozinho.", icon: Clock },
  { value: "CLINICAL", label: "Casos clínicos", description: "Só questões com caso clínico, corrigidas na hora.", icon: Stethoscope },
];

const MAX_BANK = 30;
const MAX_AI = 10;

export function QuizSetup() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("PRACTICE");
  const [source, setSource] = useState<Source>("BANK");
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [systems, setSystems] = useState<SystemKey[]>([]);
  const [count, setCount] = useState(10);

  const availability = useQuery({
    queryKey: ["quiz-availability", mode, difficulty, systems.join(",")],
    queryFn: () => {
      const p = new URLSearchParams({ mode });
      if (difficulty) p.set("difficulty", difficulty);
      if (systems.length) p.set("systems", systems.join(","));
      return apiFetch<{ bankCount: number; aiAvailable: boolean }>(`/api/quiz/availability?${p}`);
    },
    placeholderData: (prev) => prev,
  });

  const bankCount = availability.data?.bankCount ?? 0;
  const aiAvailable = availability.data?.aiAvailable ?? false;
  const max = source === "AI" ? MAX_AI : Math.max(1, Math.min(MAX_BANK, bankCount));
  const effectiveCount = Math.min(count, max);

  const create = useMutation({
    mutationFn: () =>
      apiFetch<{ id: string }>("/api/quiz/attempts", {
        method: "POST",
        json: { mode, source, difficulty, systems, count: effectiveCount },
      }),
    onSuccess: ({ id }) => router.push(`/quiz/${id}`),
  });

  const toggleSystem = (k: SystemKey) => setSystems((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  const noQuestions = source === "BANK" && availability.isSuccess && bankCount === 0;

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        create.mutate();
      }}
    >
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Modo</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {MODES.map((m) => (
            <label
              key={m.value}
              className={cn(
                "flex cursor-pointer gap-3 rounded-xl border p-3.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                mode === m.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
              )}
            >
              <input type="radio" name="mode" className="sr-only" checked={mode === m.value} onChange={() => setMode(m.value)} />
              <m.icon className={cn("mt-0.5 h-5 w-5 shrink-0", mode === m.value ? "text-primary" : "text-muted-foreground")} aria-hidden />
              <span>
                <span className="block text-sm font-medium">{m.label}</span>
                <span className="block text-xs leading-relaxed text-muted-foreground">{m.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Origem das questões</legend>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant={source === "BANK" ? "secondary" : "outline"} aria-pressed={source === "BANK"} onClick={() => setSource("BANK")}>
            Banco do atlas
          </Button>
          <Button
            type="button"
            variant={source === "AI" ? "secondary" : "outline"}
            aria-pressed={source === "AI"}
            disabled={!aiAvailable}
            onClick={() => setSource("AI")}
          >
            <Sparkles aria-hidden /> Gerar com IA
          </Button>
        </div>
        {!aiAvailable && availability.isSuccess && (
          <p className="text-xs text-muted-foreground">A geração por IA não está configurada nesta instalação.</p>
        )}
        {source === "AI" && (
          <Notice tone="ai" icon={Sparkles}>
            Questões geradas por IA na hora, a partir do conteúdo do atlas. Podem conter erros — a correção mostra a explicação para você
            conferir. Máximo de {MAX_AI} por quiz, sujeito ao limite diário.
          </Notice>
        )}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Dificuldade</legend>
        <div className="flex flex-wrap gap-2">
          {[null, ...Object.keys(DIFFICULTY_LABELS)].map((d) => (
            <Button
              key={d ?? "all"}
              type="button"
              size="sm"
              variant={difficulty === d ? "secondary" : "outline"}
              aria-pressed={difficulty === d}
              onClick={() => setDifficulty(d)}
            >
              {d ? DIFFICULTY_LABELS[d] : "Todas"}
            </Button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
          <legend className="text-sm font-semibold">
            Sistemas <span className="font-normal text-muted-foreground">{systems.length ? `(${systems.length})` : "(todos)"}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {SYSTEM_KEYS.map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={systems.includes(k)}
                onClick={() => toggleSystem(k)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors",
                  systems.includes(k) ? "border-primary bg-primary/15 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: SYSTEMS[k].color }} />
                {SYSTEMS[k].label}
              </button>
            ))}
          </div>
        </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Quantidade</legend>
        <div className="flex items-center gap-4">
          <Slider
            className="max-w-sm flex-1"
            min={1}
            max={max}
            step={1}
            value={[effectiveCount]}
            disabled={noQuestions}
            onValueChange={([v]) => setCount(v ?? 1)}
            aria-label="Número de questões"
          />
          <output className="w-24 text-sm tabular-nums">
            {effectiveCount} {effectiveCount === 1 ? "questão" : "questões"}
          </output>
        </div>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {source === "BANK"
            ? availability.isLoading
              ? "Contando questões disponíveis…"
              : `${bankCount} ${bankCount === 1 ? "questão disponível" : "questões disponíveis"} no banco com esses filtros${bankCount > MAX_BANK ? ` (até ${MAX_BANK} por quiz)` : ""}.`
            : `Até ${MAX_AI} questões por quiz gerado.`}
        </p>
      </fieldset>

      {noQuestions && (
        <Notice tone="warning">
          Nenhuma questão do banco atende a esses filtros{mode === "CLINICAL" ? " (o modo Casos clínicos só usa questões com caso)" : ""}. Remova
          algum filtro{aiAvailable ? " ou gere com IA" : ""}.
        </Notice>
      )}
      {create.isError && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage(create.error)}
        </p>
      )}

      <Button type="submit" size="lg" disabled={noQuestions || create.isPending || availability.isLoading}>
        {create.isPending ? (source === "AI" ? "Gerando questões…" : "Preparando…") : "Começar quiz"}
      </Button>
    </form>
  );
}
