"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Timer, Zap, Stethoscope, Play, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ANATOMICAL_LAYERS } from "@/types";
import type { QuizConfig, AnatomicalSystemKey } from "@/types";
import { QuizSession } from "./QuizSession";
import { useQuizStore } from "@/stores/quiz.store";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const QUIZ_MODES = [
  {
    value: "PRACTICE",
    label: "Prática",
    description: "Estude sem pressão. Veja respostas imediatamente.",
    icon: Brain,
    color: "from-blue-600 to-blue-400",
  },
  {
    value: "TIMED",
    label: "Cronometrado",
    description: "1 minuto por questão. Teste sua velocidade.",
    icon: Timer,
    color: "from-amber-600 to-amber-400",
  },
  {
    value: "EXAM",
    label: "Simulado",
    description: "Ambiente de prova real. Sem pausa.",
    icon: Zap,
    color: "from-violet-600 to-violet-400",
  },
  {
    value: "CLINICAL",
    label: "Casos Clínicos",
    description: "Questões baseadas em situações reais.",
    icon: Stethoscope,
    color: "from-emerald-600 to-emerald-400",
  },
];

export function QuizHub() {
  const { session, startSession } = useQuizStore();
  const [selectedMode, setSelectedMode] = useState<string>("PRACTICE");
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState("INTERMEDIATE");
  const [selectedSystems, setSelectedSystems] = useState<AnatomicalSystemKey[]>([]);
  const [isStarting, setIsStarting] = useState(false);

  const toggleSystem = (key: AnatomicalSystemKey) => {
    setSelectedSystems((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const params = new URLSearchParams({
        mode: selectedMode,
        difficulty,
        count: questionCount.toString(),
        ...(selectedSystems.length > 0 && { systems: selectedSystems.join(",") }),
      });

      const res = await fetch(`/api/ai/quiz?${params}`);
      const questions = await res.json();

      const config: QuizConfig = {
        mode: selectedMode as any,
        difficulty: difficulty as any,
        questionCount,
        systems: selectedSystems,
        timeLimitSeconds: selectedMode === "TIMED" ? questionCount * 60 : undefined,
      };

      startSession(config, questions);
    } catch (err) {
      console.error(err);
    } finally {
      setIsStarting(false);
    }
  };

  if (session) return <QuizSession />;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">Quiz Anatômico</h1>
            <p className="text-muted-foreground text-sm">
              20.000+ questões de anatomia humana
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl space-y-8">
        {/* Mode selection */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Modo de estudo
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {QUIZ_MODES.map((mode) => (
              <motion.div
                key={mode.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer border-2 transition-all ${
                    selectedMode === mode.value
                      ? "border-primary shadow-lg shadow-primary/10"
                      : "border-transparent hover:border-border"
                  }`}
                  onClick={() => setSelectedMode(mode.value)}
                >
                  <CardContent className="p-4">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center mb-3`}
                    >
                      <mode.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-semibold text-sm">{mode.label}</p>
                    <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                      {mode.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Settings */}
          <section>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Configurações
            </h2>
            <Card>
              <CardContent className="p-5 space-y-5">
                {/* Question count */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Número de questões</Label>
                    <span className="text-sm font-mono font-bold text-primary">
                      {questionCount}
                    </span>
                  </div>
                  <Slider
                    min={5}
                    max={100}
                    step={5}
                    value={[questionCount]}
                    onValueChange={([v]) => setQuestionCount(v)}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <Label className="text-sm">Dificuldade</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BASIC">Básico</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediário</SelectItem>
                      <SelectItem value="ADVANCED">Avançado</SelectItem>
                      <SelectItem value="EXPERT">Especialista (Residência)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* System filter */}
          <section>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Sistemas anatômicos{" "}
              <span className="text-xs font-normal">
                (vazio = todos)
              </span>
            </h2>
            <Card>
              <CardContent className="p-3 grid grid-cols-2 gap-1">
                {ANATOMICAL_LAYERS.slice(0, 10).map((layer) => (
                  <button
                    key={layer.key}
                    onClick={() => toggleSystem(layer.key as AnatomicalSystemKey)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-left transition-all ${
                      selectedSystems.includes(layer.key as AnatomicalSystemKey)
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: layer.color }}
                    />
                    {layer.labelPt}
                  </button>
                ))}
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Start button */}
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            onClick={handleStart}
            disabled={isStarting}
            size="lg"
            className="w-full h-14 text-base"
          >
            {isStarting ? (
              <>Gerando questões com IA...</>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Iniciar Quiz — {questionCount} questões
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
