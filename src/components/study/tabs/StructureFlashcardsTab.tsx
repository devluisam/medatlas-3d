"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, ThumbsUp, ThumbsDown, Minus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const SAMPLE_FLASHCARDS = [
  {
    id: "1",
    front: "Qual é a principal função do fêmur?",
    back: "O fêmur é o osso mais longo e resistente do corpo humano. Suporta o peso corporal, transmite forças entre o quadril e o joelho, e serve como origem e inserção para músculos da coxa e quadril.",
  },
  {
    id: "2",
    front: "Quais são os três grupos musculares da coxa?",
    back: "**Anterior:** Quadríceps (reto femoral, vasto lateral, vasto medial, vasto intermédio)\n**Posterior:** Isquiotibiais (bíceps femoral, semitendíneo, semimembranáceo)\n**Medial:** Adutores (grácil, pectíneo, adutor longo, curto e magno)",
  },
];

export function StructureFlashcardsTab({ structureId }: { structureId: string }) {
  const [current, setCurrent] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const card = SAMPLE_FLASHCARDS[current];

  const handleRate = (rating: "easy" | "ok" | "hard") => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrent((c) => (c + 1) % SAMPLE_FLASHCARDS.length);
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Card */}
      <div
        className="relative h-52 cursor-pointer"
        onClick={() => setIsFlipped((v) => !v)}
        style={{ perspective: "1000px" }}
      >
        <motion.div
          className="w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/10 border border-blue-500/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-white/30 text-xs uppercase tracking-wider mb-3">
              Frente
            </p>
            <p className="text-white text-base font-medium leading-relaxed">
              {card.front}
            </p>
            <p className="text-white/25 text-xs mt-4">Clique para revelar</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-emerald-600/15 to-teal-600/10 border border-emerald-500/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center overflow-auto"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-white/30 text-xs uppercase tracking-wider mb-3">
              Resposta
            </p>
            <p className="text-white/85 text-sm leading-relaxed">{card.back}</p>
          </div>
        </motion.div>
      </div>

      {/* Progress */}
      <div className="flex justify-center gap-1.5">
        {SAMPLE_FLASHCARDS.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === current ? "bg-blue-400" : "bg-white/15"
            }`}
          />
        ))}
      </div>

      {/* Rating buttons */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex gap-2"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRate("hard")}
              className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <ThumbsDown className="w-3.5 h-3.5 mr-1.5" />
              Difícil
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRate("ok")}
              className="flex-1 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            >
              <Minus className="w-3.5 h-3.5 mr-1.5" />
              OK
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRate("easy")}
              className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
            >
              <ThumbsUp className="w-3.5 h-3.5 mr-1.5" />
              Fácil
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate more */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-white/40 hover:text-white/70 hover:bg-white/5 text-xs"
      >
        <Sparkles className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
        Gerar flashcards com IA
      </Button>
    </div>
  );
}
