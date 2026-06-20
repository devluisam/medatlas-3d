"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Flag, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuizStore } from "@/stores/quiz.store";
import { cn } from "@/lib/utils";
import { QuizResults } from "./QuizResults";

export function QuizSession() {
  const {
    session,
    answerQuestion,
    nextQuestion,
    prevQuestion,
    completeSession,
    tick,
  } = useQuizStore();

  if (!session) return null;

  const { questions, currentIndex, answers, config, timeRemaining, isComplete } = session;
  const question = questions[currentIndex];
  const selectedAnswer = answers[question.id];
  const isAnswered = !!selectedAnswer;
  const progress = Math.round(((currentIndex + 1) / questions.length) * 100);

  useEffect(() => {
    if (!config.timeLimitSeconds || isComplete) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [config.timeLimitSeconds, isComplete, tick]);

  if (isComplete) return <QuizResults />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="border-b bg-card px-6 py-3 flex items-center gap-4">
        <div className="flex-1">
          <Progress value={progress} className="h-1.5" />
        </div>
        <span className="text-sm text-muted-foreground shrink-0 font-mono">
          {currentIndex + 1}/{questions.length}
        </span>
        {timeRemaining !== undefined && (
          <div className="flex items-center gap-1.5 text-sm shrink-0">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className={cn("font-mono", timeRemaining < 60 && "text-red-500")}>
              {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, "0")}
            </span>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={completeSession}
        >
          Finalizar
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-6 py-10">
        <div className="w-full max-w-2xl space-y-6">
          {/* Question header */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {question.type?.replace(/_/g, " ")}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {question.difficulty}
            </Badge>
          </div>

          {/* Stem */}
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {question.context && (
                <div className="bg-muted/50 border rounded-xl p-4 mb-4 text-sm text-muted-foreground">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                    Contexto clínico
                  </p>
                  {question.context}
                </div>
              )}

              <h2 className="text-lg font-medium leading-relaxed mb-6">
                {question.stem}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {question.options.map((opt) => {
                  const isSelected = selectedAnswer === opt.id;
                  const showCorrect = isAnswered && config.mode === "PRACTICE";

                  return (
                    <motion.button
                      key={opt.id}
                      whileHover={{ scale: isAnswered ? 1 : 1.005 }}
                      whileTap={{ scale: 0.998 }}
                      onClick={() => !isAnswered && answerQuestion(question.id, opt.id)}
                      className={cn(
                        "w-full text-left px-5 py-4 rounded-xl border-2 text-sm transition-all",
                        !isAnswered && "border-border hover:border-primary/50 hover:bg-primary/3",
                        showCorrect && opt.isCorrect && "border-green-500 bg-green-50 dark:bg-green-950/30",
                        showCorrect && !opt.isCorrect && isSelected && "border-red-500 bg-red-50 dark:bg-red-950/30",
                        showCorrect && !opt.isCorrect && !isSelected && "border-border opacity-50",
                        !showCorrect && isSelected && "border-primary bg-primary/10"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {showCorrect ? (
                          opt.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                          ) : isSelected ? (
                            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                          )
                        ) : (
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full border-2 shrink-0 transition-colors",
                              isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                            )}
                          />
                        )}
                        <span className="leading-relaxed">{opt.text}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation in practice mode */}
              <AnimatePresence>
                {isAnswered && config.mode === "PRACTICE" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1.5">
                        Explicação
                      </p>
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        {question.options.find((o) => o.isCorrect)?.explanation ??
                          "Gabarito: ver referência bibliográfica."}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="border-t bg-card px-6 py-4 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevQuestion}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Anterior
        </Button>

        <div className="flex gap-2">
          {questions.slice(Math.max(0, currentIndex - 2), currentIndex + 5).map((q, i) => {
            const idx = Math.max(0, currentIndex - 2) + i;
            return (
              <div
                key={q.id}
                className={cn(
                  "w-7 h-7 rounded-lg text-xs font-medium flex items-center justify-center",
                  idx === currentIndex && "bg-primary text-primary-foreground",
                  answers[q.id] && idx !== currentIndex && "bg-muted text-muted-foreground",
                  !answers[q.id] && idx !== currentIndex && "border text-muted-foreground"
                )}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>

        {currentIndex === questions.length - 1 ? (
          <Button onClick={completeSession}>
            Ver Resultado
          </Button>
        ) : (
          <Button onClick={nextQuestion}>
            Próxima
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
