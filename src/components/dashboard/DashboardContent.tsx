"use client";

import { motion } from "framer-motion";
import { Brain, Clock, Star, Target, Flame, Trophy, ArrowRight, Zap, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import { LEVEL_TABLE } from "@/types";

// Mock data — replace with real data from useQuery/server
const STUDY_DATA = [
  { day: "Seg", minutes: 45 },
  { day: "Ter", minutes: 62 },
  { day: "Qua", minutes: 30 },
  { day: "Qui", minutes: 88 },
  { day: "Sex", minutes: 55 },
  { day: "Sáb", minutes: 120 },
  { day: "Dom", minutes: 75 },
];

const RECENT_STRUCTURES = [
  { name: "Fêmur", system: "Esquelético", progress: 85 },
  { name: "Músculo Quadríceps", system: "Muscular", progress: 60 },
  { name: "Nervo Femoral", system: "Nervoso", progress: 40 },
  { name: "Artéria Femoral", system: "Arterial", progress: 70 },
];

const ACHIEVEMENTS_RECENT = [
  { name: "Primeiro Osso", icon: "🦴", xp: 50, unlocked: true },
  { name: "Maratonista", icon: "🏃", xp: 200, unlocked: true },
  { name: "Anatomista Jr", icon: "🔬", xp: 500, unlocked: false },
  { name: "7 Dias Seguidos", icon: "🔥", xp: 300, unlocked: false },
];

export function DashboardContent() {
  const userLevel = 3;
  const levelInfo = LEVEL_TABLE[userLevel - 1];
  const xp = 2100;
  const xpInLevel = xp - LEVEL_TABLE[userLevel - 2].maxXp;
  const xpNeeded = levelInfo.maxXp - LEVEL_TABLE[userLevel - 2].maxXp;
  const xpPercent = Math.round((xpInLevel / xpNeeded) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Olá, Estudante 👋</h1>
            <p className="text-muted-foreground text-sm">Continue seus estudos de anatomia</p>
          </div>
          <Button asChild>
            <Link href="/viewer">
              Explorar 3D
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Level + XP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{levelInfo.badge}</div>
              <div>
                <p className="text-white/70 text-sm">Nível {userLevel}</p>
                <p className="text-xl font-bold">{levelInfo.title}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-sm">XP Total</p>
              <p className="text-2xl font-bold font-mono">{xp.toLocaleString()}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm text-white/70">
              <span>{xpInLevel} XP</span>
              <span>{xpNeeded} XP para Nível {userLevel + 1}</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Clock, label: "Horas estudadas", value: "47h 30min", change: "+2h hoje", color: "text-blue-500" },
            { icon: BookOpen, label: "Estruturas vistas", value: "312", change: "+8 hoje", color: "text-emerald-500" },
            { icon: Target, label: "Taxa de acerto", value: "78%", change: "+3% esta semana", color: "text-amber-500" },
            { icon: Flame, label: "Sequência atual", value: "12 dias", change: "Recorde pessoal!", color: "text-orange-500" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                    </div>
                    <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Study chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tempo de estudo — Últimos 7 dias</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={STUDY_DATA}>
                  <defs>
                    <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} unit="min" width={40} />
                  <Tooltip
                    formatter={(v) => [`${v} min`, "Estudo"]}
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="minutes"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorMin)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Conquistas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ACHIEVEMENTS_RECENT.map((ach) => (
                <div
                  key={ach.name}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    ach.unlocked ? "bg-muted/50" : "opacity-40"
                  }`}
                >
                  <span className="text-2xl">{ach.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ach.name}</p>
                    <p className="text-xs text-muted-foreground">+{ach.xp} XP</p>
                  </div>
                  {ach.unlocked && (
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      ✓
                    </Badge>
                  )}
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full text-xs">
                Ver todas conquistas
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent structures */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Estruturas recentes</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link href="/viewer">Ver todas</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RECENT_STRUCTURES.map((s) => (
                <div key={s.name} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium">{s.name}</span>
                      <span className="text-xs text-muted-foreground">{s.progress}%</span>
                    </div>
                    <Progress value={s.progress} className="h-1.5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {s.system}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
