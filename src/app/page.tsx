"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Layers, Brain, Zap, Award, Users, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroScene } from "@/components/viewer/3d/HeroScene";

const STATS = [
  { value: "14", label: "Sistemas anatômicos" },
  { value: "3D", label: "Navegável no navegador" },
  { value: "SM-2", label: "Repetição espaçada" },
  { value: "IA", label: "Tutor e geração de questões" },
];

const FEATURES = [
  {
    icon: Layers,
    title: "Camadas Interativas",
    description:
      "Explore 14 sistemas anatômicos em camadas independentes. Oculte, isole e navegue com precisão cirúrgica.",
    color: "from-blue-500 to-cyan-400",
  },
  {
    icon: Brain,
    title: "IA Tutor Médico",
    description:
      "Tire dúvidas, gere resumos, crie flashcards e simule questões de residência com inteligência artificial.",
    color: "from-violet-500 to-purple-400",
  },
  {
    icon: Zap,
    title: "Cortes Anatômicos",
    description:
      "Execute cortes sagitais, coronais e transversais em tempo real. Visualize seções internas com precisão.",
    color: "from-amber-500 to-orange-400",
  },
  {
    icon: Award,
    title: "Sistema de Progresso",
    description:
      "Gamificação completa com XP, níveis, conquistas e streaks diários para manter o foco nos estudos.",
    color: "from-emerald-500 to-teal-400",
  },
];

const SYSTEMS = [
  { name: "Esquelético", count: "206 ossos", color: "#e9ecef" },
  { name: "Muscular", count: "640+ músculos", color: "#e63946" },
  { name: "Nervoso", count: "Sistema completo", color: "#f8c537" },
  { name: "Arterial", count: "Todas as artérias", color: "#ef233c" },
  { name: "Venoso", count: "Drenagem completa", color: "#4361ee" },
  { name: "Digestório", count: "Órgãos e estruturas", color: "#fb8500" },
  { name: "Respiratório", count: "Vias e pulmões", color: "#48cae4" },
  { name: "Linfático", count: "Linfonodos e vasos", color: "#80b918" },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center bg-[#050a14] overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(hsl(210 100% 52% / 0.15) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(210 100% 52% / 0.15) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(210_100%_52%/0.15),transparent)]" />

        <div className="relative z-10 container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center py-20">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-white"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Badge
                className="mb-6 bg-blue-500/10 text-blue-400 border-blue-500/30 text-sm px-4 py-1.5"
                variant="outline"
              >
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 animate-pulse" />
                Atlas de anatomia humana interativo
              </Badge>
            </motion.div>

            <h1 className="text-5xl lg:text-7xl font-bold font-space leading-[1.05] mb-6">
              <span className="text-white">Explore o</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                Corpo Humano
              </span>
              <br />
              <span className="text-white">em</span>{" "}
              <span className="text-blue-400">3D</span>
            </h1>

            <p className="text-lg text-white/60 mb-8 max-w-lg leading-relaxed">
              Modelo 3D navegável no navegador, ligado a um banco de estruturas
              anatômicas: conteúdo clínico por estrutura, cortes, tutor de IA, quiz
              com explicação e flashcards com repetição espaçada.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-12 text-base glow-blue transition-all"
              >
                <Link href="/viewer">
                  <Play className="w-4 h-4 mr-2" />
                  Explorar Agora — Grátis
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/15 text-white hover:bg-white/5 h-12 text-base px-8"
              >
                <Link href="/dashboard">
                  Painel de Estudos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 mt-14 pt-8 border-t border-white/10">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white font-space">
                    {stat.value}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — 3D preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-[600px] lg:h-[700px]"
          >
            <div className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-500/10">
              <HeroScene />
            </div>
            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 hud-panel flex items-center gap-3"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/80 text-xs">
                Visualização em tempo real
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
          <span className="text-white/30 text-xs tracking-widest uppercase">
            Explorar
          </span>
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-32 bg-background relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4">
              Funcionalidades
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold font-space mb-4">
              Tecnologia de ponta para
              <br />
              <span className="text-primary">medicina de ponta</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Feito para estudar anatomia no navegador, sem instalar nada.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-card border rounded-2xl p-6 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/5"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-0.5 mb-4`}
                >
                  <div className="w-full h-full bg-card rounded-[10px] flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-foreground" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
                <ChevronRight className="absolute bottom-6 right-6 w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SYSTEMS ── */}
      <section className="py-32 bg-[#050a14] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,hsl(210_100%_52%/0.06),transparent)]" />
        <div className="container mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold font-space text-white mb-4">
              14 Sistemas Anatômicos
            </h2>
            <p className="text-white/40 text-lg">
              Cada sistema mapeado com precisão clínica e científica.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SYSTEMS.map((sys, i) => (
              <motion.div
                key={sys.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white/3 border border-white/8 rounded-xl p-5 hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer"
              >
                <div
                  className="w-3 h-3 rounded-full mb-3"
                  style={{ backgroundColor: sys.color, boxShadow: `0 0 8px ${sys.color}66` }}
                />
                <h3 className="text-white font-medium">{sys.name}</h3>
                <p className="text-white/35 text-sm mt-0.5">{sys.count}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground text-sm">
                Mais de 50.000 estudantes já estão aprendendo
              </span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold font-space mb-6">
              Pronto para dominar
              <br />
              <span className="text-primary">a anatomia humana?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              Comece gratuitamente. Sem cartão de crédito.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="h-14 px-10 text-base">
                <Link href="/viewer">
                  Começar a Explorar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-10 text-base">
                <Link href="/quiz">Fazer um Quiz</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
