import "server-only";
import type { AiUsageKind } from "@prisma/client";
import { prisma } from "@/lib/db";
import { config } from "@/lib/config";
import { ApiError } from "../http";

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;

const DAILY: Record<AiUsageKind, () => number> = {
  CHAT: () => config.ai.chatDailyLimit,
  QUIZ_GENERATION: () => config.ai.quizDailyLimit,
};

export async function aiUsageToday(userId: string, kind: AiUsageKind) {
  const used = await prisma.aiUsage.count({
    where: { userId, kind, createdAt: { gte: new Date(Date.now() - DAY_MS) } },
  });
  const limit = DAILY[kind]();
  return { used, limit, remaining: Math.max(0, limit - used) };
}

/**
 * Reserva uma chamada de IA antes de executá-la. A reserva conta para a cota
 * (assim uma rajada de requisições paralelas não fura o limite); se a chamada
 * falhar sem gerar nada, `release` devolve a reserva.
 */
export async function reserveAiUsage(userId: string, kind: AiUsageKind) {
  const now = Date.now();
  const [lastMinute, today] = await Promise.all([
    prisma.aiUsage.count({ where: { userId, createdAt: { gte: new Date(now - MINUTE_MS) } } }),
    prisma.aiUsage.count({ where: { userId, kind, createdAt: { gte: new Date(now - DAY_MS) } } }),
  ]);

  if (lastMinute >= config.ai.perMinuteLimit) {
    throw new ApiError("RATE_LIMITED", "Muitas solicitações à IA em sequência. Aguarde um minuto.", {
      "Retry-After": "60",
    });
  }
  const limit = DAILY[kind]();
  if (today >= limit) {
    const what = kind === "CHAT" ? `${limit} mensagens ao tutor` : `${limit} gerações de quiz`;
    throw new ApiError("RATE_LIMITED", `Você atingiu o limite de ${what} nas últimas 24 horas.`);
  }

  const usage = await prisma.aiUsage.create({ data: { userId, kind }, select: { id: true } });
  return {
    release: () => prisma.aiUsage.delete({ where: { id: usage.id } }).catch(() => undefined),
    complete: (tokens: number | null | undefined) =>
      tokens ? prisma.aiUsage.update({ where: { id: usage.id }, data: { tokens } }).catch(() => undefined) : undefined,
  };
}
