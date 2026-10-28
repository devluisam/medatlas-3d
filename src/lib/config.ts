/**
 * Configuração lida do ambiente, com valores padrão explícitos.
 * Só roda no servidor: nada aqui deve ir para o bundle do cliente.
 */
import "server-only";

function intFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function validTimeZone(tz: string | undefined): string {
  if (!tz) return "America/Sao_Paulo";
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: tz });
    return tz;
  } catch {
    return "America/Sao_Paulo";
  }
}

export const config = {
  /** Fuso usado para "hoje" na sequência de estudo e nas cotas diárias */
  timeZone: validTimeZone(process.env.APP_TIMEZONE),
  ai: {
    apiKey: process.env.OPENAI_API_KEY || null,
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    /** Mensagens ao tutor por usuário por dia */
    chatDailyLimit: intFromEnv("AI_CHAT_DAILY_LIMIT", 40),
    /** Gerações de quiz por IA por usuário por dia */
    quizDailyLimit: intFromEnv("AI_QUIZ_DAILY_LIMIT", 8),
    /** Rajada: chamadas de IA (qualquer tipo) por usuário por minuto */
    perMinuteLimit: intFromEnv("AI_PER_MINUTE_LIMIT", 6),
    chatMaxTokens: intFromEnv("AI_CHAT_MAX_TOKENS", 900),
    timeoutMs: intFromEnv("AI_TIMEOUT_MS", 45_000),
  },
} as const;

export const isAiConfigured = () => Boolean(config.ai.apiKey);
