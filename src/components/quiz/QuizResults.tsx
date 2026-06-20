"use client";

import { motion } from "framer-motion";
import { Trophy, RotateCcw, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuizStore } from "@/stores/quiz.store";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function QuizResults() {
  const { session, resetSession } = useQuizStore();
  if (!session) return null;

  const { questions, answers, startedAt } = session;
  const totalTime = Math.round((Date.now() - new Date(startedAt).getTime()) / 1000);

  let correct = 0;
  questions.forEach((q) => {
    const selected = answers[q.id];
    const correctOpt = q.options.find((o) => o.isCorrect);
    if (selected === correctOpt?.id) correct++;
  });

  const score = Math.round((correct / questions.length) * 100);

  const getGrade = () => {
    if (score >= 90) return { label: "Excelente!", emoji: "🏆", color: "text-amber-500" };
    if (score >= 75) return { label: "Muito Bom!", emoji: "🎯", color: "text-green-500" };
    if (score >= 60) return { label: "Bom", emoji: "👍", color: "text-blue-500" };
    return { label: "Continue Estudando", emoji: "📚", color: "text-orange-500" };
  };

  const grade = getGrade();
  const minutes = Math.floor(totalTime / 60);
  const seconds = totalTime % 60;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg">
        {/* Score card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-8 text-center text-white">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="text-6xl mb-3"
              >
                {grade.emoji}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-white/70 text-sm mb-1">Pontuação final</p>
                <p className="text-7xl font-bold font-space">{score}%</p>
                <p className="text-white/80 mt-2 text-lg">{grade.label}</p>
              </motion.div>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-500">{correct}</p>
                  <p className="text-xs text-muted-foreground">Corretas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-500">{questions.length - correct}</p>
                  <p className="text-xs text-muted-foreground">Erradas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{minutes}m{seconds}s</p>
                  <p className="text-xs text-muted-foreground">Tempo</p>
                </div>
              </div>

              <Progress value={score} className="h-2" />

              {/* Review */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {questions.map((q, i) => {
                  const selected = answers[q.id];
                  const correctOpt = q.options.find((o) => o.isCorrect);
                  const isCorrect = selected === correctOpt?.id;
                  return (
                    <div
                      key={q.id}
                      className={cn(
                        "flex items-center gap-2.5 p-2 rounded-lg text-sm",
                        isCorrect ? "bg-green-50 dark:bg-green-950/30" : "bg-red-50 dark:bg-red-950/30"
                      )}
                    >
                      {isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                      <span className="text-muted-foreground truncate flex-1">
                        Q{i + 1}. {q.stem.slice(0, 60)}...
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={resetSession}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Novo Quiz
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/viewer">
                    Estudar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
