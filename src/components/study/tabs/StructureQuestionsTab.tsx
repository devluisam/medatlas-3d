"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { QuizQuestion, QuestionOption } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  structureId: string;
}

export function StructureQuestionsTab({ structureId }: Props) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/structures/${structureId}/questions?limit=5`)
      .then((r) => r.json())
      .then((data) => {
        setQuestions(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [structureId]);

  const question = questions[current];

  const handleSelect = (optionId: string) => {
    if (revealed) return;
    setSelected(optionId);
    setRevealed(true);
  };

  const handleNext = () => {
    setCurrent((c) => Math.min(c + 1, questions.length - 1));
    setSelected(null);
    setRevealed(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 bg-white/5 rounded-xl" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 bg-white/5 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <HelpCircle className="w-8 h-8 text-white/20 mb-3" />
        <p className="text-white/40 text-sm">Nenhuma questão disponível.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-white/40 text-xs">
          {current + 1} / {questions.length}
        </span>
        <Badge
          variant="outline"
          className="text-[10px] border-white/10 text-white/30"
        >
          {question.difficulty}
        </Badge>
      </div>

      {/* Stem */}
      <div className="bg-white/3 border border-white/8 rounded-xl p-4">
        <p className="text-white/85 text-sm leading-relaxed">{question.stem}</p>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((opt) => (
          <motion.button
            key={opt.id}
            whileHover={{ scale: revealed ? 1 : 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleSelect(opt.id)}
            className={cn(
              "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all",
              !revealed && "border-white/10 bg-white/3 text-white/70 hover:border-white/25 hover:bg-white/6",
              revealed && opt.isCorrect && "border-green-500/50 bg-green-500/10 text-green-400",
              revealed && !opt.isCorrect && selected === opt.id && "border-red-500/50 bg-red-500/10 text-red-400",
              revealed && !opt.isCorrect && selected !== opt.id && "border-white/5 bg-white/2 text-white/35"
            )}
          >
            <div className="flex items-center gap-2">
              {revealed ? (
                opt.isCorrect ? (
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                ) : selected === opt.id ? (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-white/15 shrink-0" />
                )
              ) : (
                <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
              )}
              <span>{opt.text}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
          >
            <p className="text-blue-300 text-xs font-medium mb-1">Explicação</p>
            <p className="text-white/70 text-sm">
              {question.options.find((o) => o.isCorrect)?.explanation ?? "Ver referência."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next */}
      {revealed && current < questions.length - 1 && (
        <Button
          size="sm"
          onClick={handleNext}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white"
        >
          Próxima questão
          <ArrowRight className="w-3.5 h-3.5 ml-2" />
        </Button>
      )}
    </div>
  );
}
